import React from 'react';
import './App.css'
import { Web3ReactProvider } from '@web3-react/core';
import { getLibrary as getEthLibrary } from './features/ethereum/web3React';
import { getLibrary as getTezosLibrary } from './features/tezos/beacon';
import TezosProvider from './features/tezos/TezosContext';
import ConfigProvider from './runtime/config/ConfigContext';
import WalletProvider from './runtime/wallet/WalletContext';
import { SnackbarProvider } from 'notistack';
import { Container, createMuiTheme, CssBaseline } from '@material-ui/core';
import HistoryScreen from './screens/HistoryScreen';
import { ThemeProvider } from '@material-ui/core/styles';
import { themeOptions } from './runtime/theme/theme';
import { RecoilRoot } from 'recoil';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppBar from './screens/AppBar';
import { mainPaths, paths } from './screens/routes';
import MainScreen from './screens/MainScreen';

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
                    <CssBaseline />
                    <AppBar />
                    <Container maxWidth="xs">
                      <Switch>
                        <Route path={paths.HISTORY}>
                          <HistoryScreen />
                        </Route>

                          <Route
                            exact
                            path={mainPaths}
                            component={MainScreen}
                          />

                      </Switch>
                    </Container>
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
