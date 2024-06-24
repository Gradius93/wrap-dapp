import actionCreatorFactory from 'typescript-fsa';
import BigNumber from 'bignumber.js';
import {TezosUnwrapApi} from '../../tezos/TezosUnwrapApi';
import {TezosToolkit} from '@taquito/taquito';
import {Web3Provider} from '@ethersproject/providers';
import {Fees} from '../../../config';
import {Operation} from '../../operations/state/types';

const actionCreator = actionCreatorFactory();

export const tokenSelect = actionCreator<{ token: string }>('TOKEN_SELECT');

export const userBalanceChange = actionCreator<{
    currentBalance: BigNumber;
    contract: TezosUnwrapApi;
}>('USER_BALANCE_CHANGE');

export const amountToUnwrapChange = actionCreator<{
    amountToUnwrap: BigNumber;
}>('AMOUNT_TO_UNWRAP_CHANGE');

export const walletChange = actionCreator<{
    tezosAccount?: string;
    tezosLibrary?: TezosToolkit;
    ethAccount?: string;
    ethLibrary?: Web3Provider;
}>('WALLET_CHANGE');

export const runUnwrap = actionCreator.async<{
    ethereumContract: string;
    ethAccount: string;
    tezosAccount: string;
    fees: Fees;
},
    Operation>('RUN_UNWRAP');

export const fetchMetadata = actionCreator<{
    tezosContract: string;
    ethereumContract: string;
    tezosTokenId: number;
}>('FETCH_METADATA');

export const estimateFees = actionCreator.async<any, number>('ESTIMATE_FEES');

export const toggleAgreement = actionCreator<boolean>('TOGGLE_AGREEMENT');