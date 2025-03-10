import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { FortmaticConnector } from '@web3-react/fortmatic-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { EthereumConfig } from '../../config';
import { AbstractConnector } from '@web3-react/abstract-connector';

export type EthConnector = {
  name: string;
  connector: AbstractConnector;
  iconName: string;
};

export type EthConnectors = {
  injected: EthConnector;
  walletConnect: EthConnector;
  fortmatic: EthConnector;
  portis: EthConnector;
};

export default function connectorsFactory({
  rpcUrl,
  networkId,
  formaticApiKey,
  portisDAppId,
}: EthereumConfig): EthConnectors {
  const { ethereum } = window as any;
  const isMetamask = ethereum && ethereum.isMetaMask;
  return {
    injected: {
      name: isMetamask ? 'Metamask' : 'Browser Extension',
      connector: new InjectedConnector({
        supportedChainIds: [networkId],
      }),
      iconName: isMetamask ? 'metamask.png' : 'arrow-right.svg',
    },
    walletConnect: {
      name: 'WalletConnect',
      connector: new WalletConnectConnector({
        rpc: { 1: rpcUrl },
        qrcode: true,
        bridge: 'https://bridge.walletconnect.org',
        pollingInterval: 15000,
      }),
      iconName: 'walletConnectIcon.svg',
    },
    fortmatic: {
      name: 'Fortmatic',
      connector: new FortmaticConnector({
        apiKey: formaticApiKey,
        chainId: networkId,
      }),
      iconName: 'fortmaticIcon.png',
    },
    portis: {
      name: 'Portis',
      connector: new PortisConnector({
        dAppId: portisDAppId,
        networks: [networkId],
      }),
      iconName: 'portisIcon.png',
    },
  };
}
