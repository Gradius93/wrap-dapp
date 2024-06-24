import {AppBar, Box, createStyles, Link, makeStyles, Toolbar, Typography,} from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import DrawerComp from './DrawerComp';
import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import logo from './logo.png';
import EthWalletConnection from '../components/ethereum/WalletConnection';
import TezosWalletConnection from '../components/tezos/WalletConnection';
import {useWalletContext} from '../runtime/wallet/WalletContext';
import OperationHistoryDialog from '../features/operations/components/OperationHistoryDialog';
import {paths} from './routes';
import LaunchIcon from '@material-ui/icons/Launch';

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            flexGrow: 1,
            '& > *': {
                marginLeft: theme.spacing(2),
            },
            fontSize: '1rem',
            fontWeight: 900,
            '& > a': {
                lineHeight: '19px',
                borderRadius: '20px',
                border: '1px solid transparent',
                padding: '6px 10px',
                '& > svg': {
                    display: 'none',
                },
                '&:hover': {
                    textDecoration: 'none',
                    border: '1px solid #FFD000',

                    '& > svg': {
                        display: 'inline',
                    },
                },
            },
        },
        externalIcon: {
            fontSize: '0.8rem',
        },
        first: {
            flex: 2,
        },
        second: {
            flex: 2,
        },
        logo: {
            width: 50,
            marginLeft: theme.spacing(4),
        },
        toolbar: {
            color: '#FFFFFF',
            minHeight: 110,
        },
        wallets: {
            '& > *': {
                marginRight: theme.spacing(3),
            },
        },
        pendingButton: {
            marginRight: theme.spacing(1),
        },
        menuSpace: {
            '& > *': {
                marginRight: theme.spacing(5),
            },
        },
        menuButton: {
            marginRight: theme.spacing(),
            [theme.breakpoints.up('sm')]: {
                display: 'none',
            },
        },
    })
);

const Render = () => {
    const {
        ethereum: {
            activate: ethActivate,
            deactivate: ethDeactivate,
            account: ethAccount,
            connectors,
            status: ethConnectionStatus,
        },
        tezos: {
            activate: tzActivate,
            deactivate: tzDeactivate,
            status: tzConnectionStatus,
            account: tzAccount,
        },
    } = useWalletContext();

    const classes = useStyles();

    const [mobileOpen, setMobileOpen] = React.useState(true);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <>
            <AppBar
                position="static"
                style={{background: 'transparent', boxShadow: 'none'}}
            >
                <Toolbar className={classes.toolbar}>
                    <Grid
                        className={classes.first}
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                    >
                        <Grid item>
                            <img src={logo} className={classes.logo} alt="Logo"/>
                        </Grid>
                        <Hidden xsDown>
                            <Grid item>
                                <Typography
                                    variant="h6"
                                    component="h1"
                                    className={classes.title}
                                >
                                    <Link component={RouterLink} color="inherit" to={paths.WRAP}>
                                        Wrap
                                    </Link>
                                </Typography>
                            </Grid>
                        </Hidden>
                        <Hidden xsDown>
                            <Grid item>
                                <Typography
                                    variant="h6"
                                    component="h1"
                                    className={classes.title}
                                >
                                    <Link
                                        component={RouterLink}
                                        color="inherit"
                                        to={paths.HISTORY}
                                    >
                                        History
                                    </Link>
                                </Typography>
                            </Grid>
                        </Hidden>
                        <Hidden xsDown>
                            <Grid item>
                                <Typography
                                    variant="h6"
                                    component="h1"
                                    className={classes.title}
                                >
                                    <Link
                                        component={RouterLink}
                                        color="inherit"
                                        to={paths.FARMING_ROOT}
                                    >
                                        Farming
                                    </Link>
                                </Typography>
                            </Grid>
                        </Hidden>
                        <Hidden xsDown>
                            <Grid item>
                                <Typography
                                    variant="h6"
                                    component="h1"
                                    className={classes.title}
                                >
                                    <Link
                                        component={RouterLink}
                                        color="inherit"
                                        target="_blank"
                                        to={{
                                            pathname: 'https://liquidity.tzwrap.com/',
                                        }}
                                    >
                                        Liquidity <LaunchIcon className={classes.externalIcon}/>
                                    </Link>
                                </Typography>
                            </Grid>
                        </Hidden>
                        <Hidden xsDown>
                            <Grid item>
                                <Typography
                                    variant="h6"
                                    component="h1"
                                    className={classes.title}
                                >
                                    <Link
                                        component={RouterLink}
                                        color="inherit"
                                        target="_blank"
                                        to={{
                                            pathname: 'https://info.tzwrap.com/',
                                        }}
                                    >
                                        Info <LaunchIcon className={classes.externalIcon}/>
                                    </Link>
                                </Typography>
                            </Grid>
                        </Hidden>
                    </Grid>

                    <Grid
                        container
                        className={classes.second}
                        direction="row"
                        justify="flex-end"
                        alignItems="center"
                    >
                        <Hidden smDown>
                            <Grid item>
                                <Box className={classes.pendingButton}>
                                    <OperationHistoryDialog/>
                                </Box>
                            </Grid>
                        </Hidden>
                        <Hidden xsDown>
                            <Grid item>
                                <Box className={classes.wallets}>
                                    <TezosWalletConnection
                                        account={tzAccount}
                                        activate={tzActivate}
                                        deactivate={tzDeactivate}
                                        connectionStatus={tzConnectionStatus}
                                        withConnectionStatus={true}
                                    />
                                </Box>
                            </Grid>
                        </Hidden>
                        <Hidden xsDown>
                            <Grid item>
                                <Box className={classes.wallets}>
                                    <EthWalletConnection
                                        account={ethAccount}
                                        activate={ethActivate}
                                        deactivate={ethDeactivate}
                                        connectors={connectors}
                                        connectionStatus={ethConnectionStatus}
                                        withConnectionStatus={true}
                                    />
                                </Box>
                            </Grid>
                        </Hidden>
                    </Grid>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}
                    >
                        <MenuIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <DrawerComp open={mobileOpen} onClose={handleDrawerToggle}/>
        </>
    );
};
export default Render;
