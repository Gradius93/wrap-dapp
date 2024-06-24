import { Box, Container, Grid, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useConfig } from '../../runtime/config/ConfigContext';
import FarmList, { FarmStyle } from './FarmList';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { PaperContent } from '../../components/paper/Paper';
import { useHistory } from 'react-router';
import { farmStakePageRoute, oldFarmUnstakePageRoute, paths } from '../routes';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles((theme) =>
    createStyles({
        subtitle: {
            color: '#000000',
            textAlign: 'center',
            marginBottom: '20px',
        },
        secondSubtitle: {
            paddingTop: '20px',
        },
        main: {
            borderRadius: '10px 10px 10px 10px',
            backgroundColor: 'white',
            marginBottom: '17px',
            transition: 'background-color 1s ease',
            '&:hover': {
                backgroundColor: '#FFD000',
            },
        },
        containBox: {
            borderRadius: '0 0 10px 10px',
            padding: '30px',
            backgroundColor: '#e5e5e5',
        },
        title: {
            color: 'white',
            borderBottom: '3px solid #ffd000',
            textAlign: 'center',
            fontSize: '30px',
            paddingBottom: '15px',
        },
        titleCenter: {
            justifyItems: 'center',
        },
        total: {
            color: 'white',
            textAlign: 'center',
            fontSize: '16px',
        },
        option: {
            fontSize: '20px',
        },
        sub: {
            fontSize: '12px',
        },
        item: {
            '&:hover': {
                cursor: 'pointer',
            },
        },
        image: {
            height: '100%',
            width: '100%',
        },
        images: {
            '& img': {
                width: 60,
                height: 50,
                marginRight: 5,
                verticalAlign: 'middle',
            },
            '& :first-child': {left: '0', position: 'relative'},
        },
    })
);

export default function FarmChoice() {
    const classes = useStyles();
    const history = useHistory();
    const {farms, oldFarms} = useConfig();

    const totalStaked = farms
        .reduce((total, farm) => {
            const staked = new BigNumber(farm.farmTotalStaked ?? 0).shiftedBy(
                -farm.farmStakedToken.decimals
            );
            return total.plus(staked);
        }, new BigNumber(0))
        .dp(0)
        .toString(10);

    const StakeAllButton = () => {
        const changeUri = () => {
            history.push(paths.ALL_FARMS_STAKE);
        };

        return (
            <PaperContent className={classes.main}>
                <Grid
                    container
                    justify={'space-between'}
                    alignItems={'center'}
                    onClick={changeUri}
                    className={classes.item}
                >
                    <Grid item className={classes.images}>
                        <img alt={'stake all'} src="/static/images/wrap3gif.gif"/>
                    </Grid>
                    <Grid item>
                        <Typography className={classes.option}>
                            Stake on all farms
                        </Typography>
                        <Typography className={classes.sub}>
                            Stake your $WRAP tokens on all available farms at once
                        </Typography>
                    </Grid>
                    <Grid item>
                        <IconButton>
                            <ArrowForwardIcon/>
                        </IconButton>
                    </Grid>
                </Grid>
            </PaperContent>
        );
    };

    return (
        <Container maxWidth={'sm'}>
            <Box className={classes.titleCenter} my={2}>
                <Typography className={classes.title}>Fees farming</Typography>
            </Box>
            <Box className={classes.titleCenter} my={2}>
                <Typography className={classes.total}>
                    Total $WRAP staked : {totalStaked}
                </Typography>
            </Box>
            <Box className={classes.containBox}>
                <StakeAllButton/>
                <Typography variant={'subtitle1'} className={classes.subtitle}>Or select a farm to stake, unstake or claim your fees share.</Typography>
                <FarmList
                    farms={farms}
                    onProgramSelect={(farmContract) => {
                        history.push(farmStakePageRoute(farmContract));
                    }}
                    style={FarmStyle.CLASSIC}
                />
                <Typography
                    variant={'subtitle1'}
                    className={`${classes.subtitle} ${classes.secondSubtitle}`}
                >
                    or select an old farm to unstake.
                </Typography>
                <FarmList
                    farms={oldFarms}
                    onProgramSelect={(farmContract) => {
                        history.push(oldFarmUnstakePageRoute(farmContract));
                    }}
                    style={FarmStyle.OLD}
                />
            </Box>
        </Container>
    );
}
