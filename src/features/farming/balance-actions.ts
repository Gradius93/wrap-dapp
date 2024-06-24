import actionCreatorFactory from 'typescript-fsa';
import {ContractBalance} from "./balances-reducer";
import {IndexerContractBalance} from "../indexer/indexerApi";

const actionCreator = actionCreatorFactory();

export const fetchBalances = actionCreator<{
    tezosAccount: string
}>('FETCH_STAKING_BALANCES');

export const balancesReceived = actionCreator<{
    balances: IndexerContractBalance[]
}>('STAKING_BALANCES_RECEIVED');

export const changeBalances = actionCreator<{
    balances: ContractBalance[]
}>('CHANGE_STAKING_BALANCES');