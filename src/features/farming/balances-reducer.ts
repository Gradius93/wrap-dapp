import {Action, Dispatch, Store} from "../types";
import IndexerApi, {IndexerContractBalance} from "../indexer/indexerApi";
import {isType} from 'typescript-fsa';
import {balancesReceived, changeBalances, fetchBalances} from "./balance-actions";

export interface ContractBalance {
    contract: string;
    balance: string;
    totalStaked: string;
    maxLevelProcessed: number;
}

export type BalancesState = {
    isDirty: boolean,
    balances: ContractBalance[]
};

const computeNewStakingBalances = (balances: ContractBalance[], indexerStakingBalances: IndexerContractBalance[]): ContractBalance[] | null => {
    let shouldUpdate = false;

    const balancesToKeep = indexerStakingBalances.map((currentIndexerStakingBalance) => {
        const existingBalance = balances.find((balance) => {
            return balance.contract === currentIndexerStakingBalance.contract;
        });

        if (existingBalance) {
            if (!existingBalance.maxLevelProcessed || existingBalance.maxLevelProcessed < currentIndexerStakingBalance.maxLevelProcessed) {
                shouldUpdate = true;
                return {
                    ...existingBalance,
                    balance: currentIndexerStakingBalance.balance,
                    totalStaked: currentIndexerStakingBalance.totalStaked,
                    maxLevelProcessed: currentIndexerStakingBalance.maxLevelProcessed,
                };
            } else {
                return existingBalance;
            }
        } else {
            shouldUpdate = true;
            return {
                contract: currentIndexerStakingBalance.contract,
                balance: currentIndexerStakingBalance.balance,
                totalStaked: currentIndexerStakingBalance.totalStaked,
                maxLevelProcessed: currentIndexerStakingBalance.maxLevelProcessed
            };
        }
    });

    return shouldUpdate ? balancesToKeep : null;
};

export const reducer = (state: BalancesState, action: Action): BalancesState => {
    if (isType(action, balancesReceived)) {
        const newBalances = computeNewStakingBalances(state.balances, action.payload.balances);
        return newBalances ? {isDirty: false, balances: newBalances} : state;
    }
    if (isType(action, changeBalances)) {
        return {isDirty: true, balances: action.payload.balances};
    }
    return state;
};

export const sideEffectReducer = (indexerApi: IndexerApi) => (
    {getState, dispatch}: Store<BalancesState>,
    action: Action
) => async (next: Dispatch) => {
    if (isType(action, fetchBalances)) {
        const {tezosAccount} = action.payload;
        const stakingBalances = await indexerApi.fetchCurrentUserFarmingConfiguration(tezosAccount);
        dispatch(balancesReceived({balances: stakingBalances}));
        return;
    }
    next(action);
};