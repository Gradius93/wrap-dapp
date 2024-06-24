import React, {useCallback} from 'react';
import {Container, Tab, Tabs} from '@material-ui/core';
import {Route, Switch} from 'react-router-dom';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {paths} from "../routes";
import ClaimAll from "../../features/farming/claim_all/ClaimAll";
import {useHistory, useRouteMatch} from "react-router";
import WithBalancesScreen from "./WithBalancesScreen";

const useStyles = makeStyles((theme) => createStyles({
    bg: {
        color: 'white',
        marginBottom: '10px',
    },
    tab: {
        textTransform: 'none',
        fontWeight: 900,
    }
}));

function AllFarms() {
    const {path} = useRouteMatch();
    const classes = useStyles();
    const history = useHistory();

    const onTabChange = useCallback(
        (event: React.ChangeEvent<{}>, newPath: string) => {
            history.push(newPath);
        },
        [history]
    );

    return (
        <Container>
            <Tabs value={path} onChange={onTabChange} className={classes.bg} indicatorColor="primary"
                  variant="fullWidth">
                <Tab label="Stake on all farms" value={paths.ALL_FARMS_STAKE} className={classes.tab}/>
                <Tab label="Unstake on all farms" value={paths.ALL_FARMS_UNSTAKE} className={classes.tab}/>
                <Tab label="Claim from all farms" value={paths.ALL_FARMS_CLAIM} className={classes.tab}/>
            </Tabs>
            <Switch>
                <Route path={[paths.ALL_FARMS_STAKE, paths.ALL_FARMS_UNSTAKE]} exact component={WithBalancesScreen}/>
                <Route path={paths.ALL_FARMS_CLAIM} exact component={ClaimAll}/>
            </Switch>
        </Container>
    );
}

export default AllFarms;