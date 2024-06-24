import React, {useCallback} from 'react';
import {useHistory, useParams, useRouteMatch} from 'react-router';
import {Route, Switch} from 'react-router-dom';
import {Container, Tab, Tabs,} from '@material-ui/core';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {paths} from '../routes';
import BigNumber from 'bignumber.js';
import {FarmConfig} from '../../config';
import {FarmingContractActionsProps} from '../../features/farming/types';
import useFarmingContract from '../../features/farming/farm/hooks/useFarmingContract';
import {useFarm} from '../../features/farming/farm/hooks/useFarm';
import Stake from '../../features/farming/stake/Stake';
import useTokenBalance from "../../features/token/hook/useTokenBalance";
import {Unstake} from "../../features/farming/unstake/Unstake";
import Claim from "../../features/farming/claim/Claim";

const useStyles = makeStyles(() =>
    createStyles({
        bg: {
            color: 'white',
            marginBottom: '10px',
        },
        tab: {
            textTransform: 'none',
            fontWeight: 900,
        },
    })
);

function WithFarm(
    farm: FarmConfig,
    onApply: () => void,
    farmBalances: {
        totalSupply: BigNumber;
        staked: BigNumber;
        reward: BigNumber;
        loading: boolean;
    },
    inputBalance: { value: BigNumber; loading: boolean },
    Comp: React.FunctionComponent<FarmingContractActionsProps>
) {
    return () => (
        <Comp
            onApply={onApply}
            farm={farm}
            inputBalance={inputBalance}
            farmBalances={farmBalances}
        />
    );
}

export default function Farm() {
    const {path} = useRouteMatch();
    const {farm_address} = useParams() as { farm_address: string };
    const {farm} = useFarm(farm_address);
    const {farmBalances, farmLoading, refreshFarmingContract} = useFarmingContract(farm.farmContractAddress);
    const {
        balance,
        loading,
        refresh
    } = useTokenBalance(farm.farmStakedToken.contractAddress, farm.farmStakedToken.tokenId);

    const history = useHistory();
    const classes = useStyles();
    const onTabChange = useCallback(
        (event: React.ChangeEvent<{}>, newPath: string) => {
            history.push(newPath.replace(':farm_address', farm.farmContractAddress));
        },
        [farm, history]
    );

    const onApply = () => {
        // noinspection JSIgnoredPromiseFromCall
        refreshFarmingContract();
        // noinspection JSIgnoredPromiseFromCall
        refresh();
    };

    return (
        <Container maxWidth="sm">
            <Tabs
                value={path}
                onChange={onTabChange}
                className={classes.bg}
                indicatorColor="primary"
                variant="fullWidth"
            >
                <Tab label="Stake" value={paths.FARM_STAKE} className={classes.tab}/>
                <Tab label="Unstake" value={paths.FARM_UNSTAKE} className={classes.tab}/>
                <Tab label="Claim" value={paths.FARM_CLAIM} className={classes.tab}/>
            </Tabs>
            <Switch>
                <Route
                    path={paths.FARM_STAKE}
                    exact
                    component={WithFarm(
                        farm,
                        onApply,
                        {
                            ...farmBalances,
                            loading: farmLoading,
                        },
                        {value: balance, loading},
                        Stake
                    )}
                />
                <Route
                    path={paths.FARM_UNSTAKE}
                    exact
                    component={WithFarm(
                        farm,
                        onApply,
                        {
                            ...farmBalances,
                            loading: farmLoading,
                        },
                        {value: balance, loading},
                        Unstake
                    )}
                />
                <Route
                    path={paths.FARM_CLAIM}
                    exact
                    component={WithFarm(
                        farm,
                        onApply,
                        {
                            ...farmBalances,
                            loading: farmLoading,
                        },
                        {value: balance, loading},
                        Claim
                    )}
                />
            </Switch>
        </Container>
    );
}
