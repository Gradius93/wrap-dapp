import React from 'react';
import {Web3ReactProvider} from '@web3-react/core';
import {getLibrary as getEthLibrary} from './features/ethereum/web3React';
import {getLibrary as getTezosLibrary} from './features/tezos/beacon';
import TezosProvider from './features/tezos/TezosContext';
import ConfigProvider from './runtime/config/ConfigContext';
import WalletProvider from './runtime/wallet/WalletContext';
import {SnackbarProvider} from 'notistack';
import {createMuiTheme, CssBaseline} from '@material-ui/core';
import HistoryScreen from './screens/HistoryScreen';
import {ThemeProvider} from '@material-ui/core/styles';
import {themeOptions} from './runtime/theme/theme';
import {RecoilRoot} from 'recoil';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import AppBar from './screens/AppBar';
import {historyPaths, mainPaths, paths} from './screens/routes';
import MainScreen from './screens/MainScreen';
import FarmingScreen from './screens/farming/FarmingScreen'
import DisplayEnvironment from './components/configuration/DisplayEnvironment';

const theme = createMuiTheme(themeOptions);

function App() {
    return (
        <ConfigProvider>
            <Web3ReactProvider getLibrary={getEthLibrary}>
                <TezosProvider getLibrary={getTezosLibrary}>
                    <WalletProvider>
                        <ThemeProvider theme={theme}>
                            <RecoilRoot>
                                <Router>
                                    <SnackbarProvider autoHideDuration={6000}>
                                        <CssBaseline/>
                                        <AppBar/>
                                        <Switch>
                                            <Route exact path={mainPaths} component={MainScreen}/>
                                            <Route exact path={historyPaths} component={HistoryScreen}/>
                                            <Route path={paths.FARMING_ROOT} component={FarmingScreen}/>
                                        </Switch>
                                        <DisplayEnvironment/>
                                    </SnackbarProvider>
                                </Router>
                            </RecoilRoot>
                        </ThemeProvider>
                    </WalletProvider>
                </TezosProvider>
            </Web3ReactProvider>
        </ConfigProvider>
    );
}

export default App;
