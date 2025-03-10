import {
  AppBar,
  Box,
  Button,
  createStyles,
  Link,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@material-ui/core';
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import DrawerComp from './DrawerComp'
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  useConfig,
  useEnvironmentSelectorContext,
} from '../runtime/config/ConfigContext';
import { Environment } from '../config';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import logo from './logo.png';
import EthWalletConnection from '../components/ethereum/WalletConnection';
import TezosWalletConnection from '../components/tezos/WalletConnection';
import { useWalletContext } from '../runtime/wallet/WalletContext';
import OperationHistoryDialog from '../features/operations/components/OperationHistoryDialog';
import { paths } from './routes';

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      flexGrow: 1,
      '& > *': {
        marginLeft: theme.spacing(4),
      },
    },
    first:{
      flex: 1,
    },
    second: {
      flex: 2,
    },
    logo: {
      width: 50,
      backgroundColor: '#FFD000',
      borderRadius: '12px',
      marginLeft: theme.spacing(4),
    },
    toolbar: {
      color: '#FFFFFF',
      minHeight: 110,
    },
    wallets: {
      '& > *': {
        marginRight: theme.spacing(2),
        borderRadius: '25px',
        padding: '3px 25px'
      },
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

  const config = useConfig();

  const {
    setEnvironment,
    environmentOptions,
  } = useEnvironmentSelectorContext();

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

  const [
    anchorEnvSelector,
    setAnchorEnvSelector,
  ] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEnvSelector);

  const openEnvSelector = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEnvSelector(event.currentTarget);

  const closeEnvSelector = () => setAnchorEnvSelector(null);

  const handleEnvSelection = (env: Environment) => {
    setEnvironment(env);
    closeEnvSelector();
  };

  const [mobileOpen, setMobileOpen] = React.useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };



  return (
    <>
      <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none'}}>

          <Toolbar className={classes.toolbar}>

            <Grid
              className={classes.first}
              container
              direction="row"
              justify="flex-start"
              alignItems="center"
              >

              <Grid item>
                <img src={logo} className={classes.logo} alt="Logo" />
              </Grid>
              <Hidden xsDown>
                <Grid item>

                  <Typography variant="h6" component="h1" className={classes.title}>
                    <Link component={RouterLink} color="inherit" to={paths.WRAP}>
                      Wrap
                    </Link>
                  </Typography>
                </Grid>
              </Hidden>
              <Hidden xsDown>
              <Grid item>
                <Typography variant="h6" component="h1" className={classes.title}>
                  <Link component={RouterLink} color="inherit" to={paths.HISTORY}>
                    History
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
              <OperationHistoryDialog />
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
                />
              </Box>
            </Grid>
            </Hidden>
            <Hidden smDown>
            
            <Grid item className={classes.menuSpace}>
            
              <Button
                aria-label="Environment selector"
                aria-controls="env-selector-appbar"
                aria-haspopup="true"
                onClick={openEnvSelector}
                color="inherit"
                size="small"
                variant="text"
                startIcon={<SwapHorizIcon />}
                >
                  {config.environmentName}
              </Button>
              </Grid>
            </Hidden>
            </Grid>

            <Menu
              id="env-selector-appbar"
              anchorEl={anchorEnvSelector}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={open}
              onClose={closeEnvSelector}
            >
              {environmentOptions.map(({ name, environment }) => (
                <MenuItem
                  key={environment}
                  onClick={() => handleEnvSelection(environment)}
                >
                  {name}
                </MenuItem>
              ))}
            </Menu>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>

      </AppBar>
      <DrawerComp open={mobileOpen} onClose={handleDrawerToggle} />
    </>
  );
};
export default Render;
