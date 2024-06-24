import actionCreatorFactory from 'typescript-fsa';
import BigNumber from 'bignumber.js';
import {EthereumWrapApi} from '../../ethereum/EthereumWrapApi';
import {TezosToolkit} from '@taquito/taquito';
import {Web3Provider} from '@ethersproject/providers';

const actionCreator = actionCreatorFactory();

export const tokenSelect = actionCreator<{ token: string }>('TOKEN_SELECT');

export const userBalanceChange = actionCreator<{
    currentBalance: BigNumber;
    currentAllowance: BigNumber;
    contract: EthereumWrapApi;
}>('USER_BALANCE_CHANGE');

export const amountToWrapChange = actionCreator<{
    amountToWrap: BigNumber;
}>('AMOUNT_TO_WRAP_CHANGE');

export const allowanceChange = actionCreator<{
    newCurrentAllowance: BigNumber;
}>('ALLOWANCE_CHANGE');

export const runAllowance = actionCreator('RUN_ALLOWANCE');

export const walletChange = actionCreator<{
    tezosAccount?: string;
    tezosLibrary?: TezosToolkit;
    ethAccount?: string;
    ethLibrary?: Web3Provider;
}>('WALLET_CHANGE');

export const runWrap = actionCreator('RUN_WRAP');
export const wrapDone = actionCreator('WRAP_DONE');
export const networkFees = actionCreator<{ networkFees: BigNumber }>(
    'NETWORK_FEES'
);

export const toggleAgreement = actionCreator<boolean>('TOGGLE_AGREEMENT');