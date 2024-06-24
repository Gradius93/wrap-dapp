import {Reducer, useEffect, useReducer} from "react";
import {useWalletContext} from "../../runtime/wallet/WalletContext";
import {useIndexerApi} from "../../runtime/config/ConfigContext";
import {Action, connectStore, createStore} from "../types";
import {BalancesState, reducer, sideEffectReducer} from "./balances-reducer";
import {fetchBalances} from "./balance-actions";

export default function useBalances() {
    const walletContext = useWalletContext();
    const indexerApi = useIndexerApi();
    const initialBalances: BalancesState = {
        isDirty: true,
        balances: []
    };
    const [balances, balanceDispatch] = useReducer<Reducer<BalancesState, Action>, BalancesState>(reducer, initialBalances, () => initialBalances);

    const effectsDispatch = connectStore(
        createStore(balances, balanceDispatch),
        sideEffectReducer(indexerApi)
    );

    useEffect(() => {
        const loadBalances = async () => {
            if (walletContext.tezos.account) {
                effectsDispatch(fetchBalances({tezosAccount: walletContext.tezos.account}));
            }
        };

        const timer = setInterval(() => {
            // noinspection JSIgnoredPromiseFromCall
            loadBalances();
        }, 15000);

        // noinspection JSIgnoredPromiseFromCall
        loadBalances();

        return () => clearInterval(timer);
    }, [walletContext.tezos.account, indexerApi]);

    return {balances, balanceDispatch};
};