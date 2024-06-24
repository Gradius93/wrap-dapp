import {useWalletContext} from '../../../runtime/wallet/WalletContext';
import {useConfig, useIndexerApi,} from '../../../runtime/config/ConfigContext';
import {useEffect} from 'react';
import {Operation, OperationType} from '../state/types';
import {ReceiptState, ReceiptStatus, reducer, sideEffectReducer,} from './reducer';
import {Action, connectStore, createStore} from '../../types';
import {fetchReceipt, mint, release, reload, update} from './actions';
import {atomFamily, useRecoilCallback, useRecoilState} from 'recoil';

const receiptByHash = atomFamily<ReceiptState, string>({
    key: 'OPS_BY_HASH',
    default: {
        status: ReceiptStatus.UNINITIALIZED,
    },
});

export function usePendingOperationsActions() {
    const addOperation = useRecoilCallback(({set}) => async (o: Operation) => {
        set(
            receiptByHash(o.hash),
            reducer({status: ReceiptStatus.UNINITIALIZED}, update({operation: o}))
        );
    });

    return {addOperation};
}

const extractHash = (value: string | Operation): string =>
    typeof value === 'string' ? value : value.hash;

export const useOperation = (
    initialValue: string | Operation,
    type: OperationType
) => {
    const {
        tezos: {library: tzLibrary},
        ethereum: {library: ethLibrary},
    } = useWalletContext();

    const indexerApi = useIndexerApi();

    const {
        fees,
        wrapSignatureThreshold,
        unwrapSignatureThreshold,
        fungibleTokens,
        tezos: {quorumContractAddress, minterContractAddress},
        ethereum: {custodianContractAddress},
    } = useConfig();

    const [state, setState] = useRecoilState(
        receiptByHash(extractHash(initialValue))
    );

    const dispatch = (a: Action) => setState(reducer(state, a));
    const effectsDispatch = connectStore(
        createStore(state, dispatch),
        sideEffectReducer(indexerApi)
    );

    useEffect(() => {
        if (typeof initialValue === 'string') {
            // noinspection JSIgnoredPromiseFromCall
            effectsDispatch(
                reload({
                    hash: initialValue,
                    fees,
                    type,
                    signaturesThreshold: wrapSignatureThreshold,
                })
            );
        } else {
            // noinspection JSIgnoredPromiseFromCall
            effectsDispatch(update({operation: initialValue}));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValue]);

    useEffect(() => {
        if (state.status !== ReceiptStatus.NEED_REFRESH) {
            return;
        }

        const dispatchRefresh = () => {
            // noinspection JSIgnoredPromiseFromCall
            effectsDispatch(
                reload({
                    hash: extractHash(initialValue),
                    fees,
                    type,
                    signaturesThreshold: wrapSignatureThreshold,
                })
            );
        };

        dispatchRefresh();
        const intervalId = setInterval(dispatchRefresh, 5000);
        return () => {
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.status]);

    useEffect(() => {
        if (state.status !== ReceiptStatus.NEED_RECEIPT) {
            return;
        }
        const dispatchRefresh = () => {
            // noinspection JSIgnoredPromiseFromCall
            effectsDispatch(
                fetchReceipt({
                    hash: extractHash(initialValue),
                    type,
                    ethLibrary,
                    tzLibrary,
                })
            );
        };

        dispatchRefresh();
        const intervalId = setInterval(dispatchRefresh, 5000);
        return () => {
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.status, ethLibrary, tzLibrary]);

    const mintErc20 = () => {
        if (!tzLibrary) return;
        effectsDispatch(
            mint({minterContractAddress, quorumContractAddress, tzLibrary})
        );
    };
    const unlockErc20 = () =>
        ethLibrary
            ? effectsDispatch(release({custodianContractAddress, ethLibrary}))
            : Promise.reject('Not connected');

    return {
        state,
        fungibleTokens,
        signaturesThreshold: {
            wrap: wrapSignatureThreshold,
            unwrap: unwrapSignatureThreshold,
        },
        mintErc20,
        unlockErc20,
    };
};
