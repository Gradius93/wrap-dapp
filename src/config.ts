import { TokenMetadata } from './features/swap/token';
import { NetworkType } from '@airgap/beacon-sdk';
import { IndexerFarmConfigurationRewardsPayload } from './features/indexer/indexerApi';

export type Fees = {
  erc20WrappingFees: number;
  erc20UnwrappingFees: number;
  erc721WrappingFees: number;
  erc721UnwrappingFees: number;
};

export interface FarmConfig {
  maxTotalStakedLevelProcessed: number;
  farmContractAddress: string;
  farmContractLink: string;
  farmTotalStaked: string;
  farmStakedToken: FarmStakedToken;
  rewardTokenName: string;
  rewardTokenThumbnailUri: string;
  rewardTokenContractAddress: string;
  rewardTokenId: number;
  rewardTokenDecimals: number;
  rewardTokenSymbol: string;
  rewards: IndexerFarmConfigurationRewardsPayload | undefined;
  apy?: string;
  apr?: string;
}

export interface InitialConfig {
  environmentName: string;
  indexerUrl: string;
  statisticsUrl: string;
  ethereum: {
    rpcUrl: string;
    networkId: number;
    networkName: string;
    formaticApiKey: string;
    portisDAppId: string;
  };
  tezos: {
    rpcUrl: string;
    networkId: NetworkType;
    networkName: string;
  };
  farmInput: FarmStakedToken;
  tzktLink: string;
}

export interface Config {
  environmentName: string;
  indexerUrl: string;
  statisticsUrl: string;
  ethereum: {
    rpcUrl: string;
    networkId: number;
    networkName: string;
    formaticApiKey: string;
    portisDAppId: string;
    custodianContractAddress: string;
  };
  tezos: {
    rpcUrl: string;
    networkId: NetworkType;
    networkName: string;
    minterContractAddress: string;
    quorumContractAddress: string;
  };
  wrapSignatureThreshold: number;
  unwrapSignatureThreshold: number;
  fungibleTokens: Record<string, TokenMetadata>;
  fees: Fees;
  farms: FarmConfig[];
  oldFarms: FarmConfig[];
  farmInput: FarmStakedToken;
}

export type EthereumConfig = Config['ethereum'];
export type TezosConfig = Config['tezos'];

export enum ConfigStatus {
  UNINITIALIZED,
  LOADING,
  LOADED,
}

interface FarmStakedToken {
  contractAddress: string;
  thumbnailUri: string;
  tokenId: number;
  symbol: string;
  name: string;
  decimals: number;
}

const WRAP_MAINNET: FarmStakedToken = {
  contractAddress: 'KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd',
  thumbnailUri: 'ipfs://Qma2o69VRZe8aPsuCUN1VRUE5k67vw2mFDXb35uDkqn17o',
  decimals: 8,
  symbol: 'WRAP',
  name: 'WRAP',
  tokenId: 0,
};

const WRAP_TESTNET: FarmStakedToken = {
  contractAddress: 'KT1M6RSfdbWL6RH5tPdxekrZhtXUh67x2N9Y',
  thumbnailUri: 'ipfs://Qma2o69VRZe8aPsuCUN1VRUE5k67vw2mFDXb35uDkqn17o',
  decimals: 8,
  symbol: 'WRAP',
  name: 'WRAP',
  tokenId: 0,
};

export enum Environment {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
}

export const initialConfig: InitialConfig = {
  environmentName: process.env.REACT_APP_WRAP_ENVIRONMENT!,
  indexerUrl: process.env.REACT_APP_INDEXER!,
  statisticsUrl: process.env.REACT_APP_STATISTICS!,
  ethereum: {
    rpcUrl: process.env.REACT_APP_ETH_RPC!,
    networkId: +process.env.REACT_APP_ETH_NETWORK_ID!,
    networkName: process.env.REACT_APP_ETH_NETWORK_NAME!,
    formaticApiKey: process.env.REACT_APP_FORTMATIC_API_KEY!,
    portisDAppId: process.env.REACT_APP_PORTIS_DAPP_ID!,
  },
  tezos: {
    rpcUrl: process.env.REACT_APP_TZ_RPC!,
    networkId: process.env.REACT_APP_TZ_NETWORK_ID! as NetworkType,
    networkName: process.env.REACT_APP_TZ_NETWORK_NAME!,
  },
  farmInput:
    process.env.REACT_APP_WRAP_ENVIRONMENT === Environment.TESTNET
      ? WRAP_TESTNET
      : WRAP_MAINNET,
  tzktLink:
    process.env.REACT_APP_WRAP_ENVIRONMENT === Environment.TESTNET
      ? 'https://florencenet.tzkt.io/'
      : 'https://tzkt.io/',
};
