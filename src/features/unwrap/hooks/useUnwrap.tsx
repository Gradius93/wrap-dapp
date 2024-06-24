import {useCallback, useEffect, useReducer} from 'react';
import BigNumber from 'bignumber.js';
import {useConfig} from '../../../runtime/config/ConfigContext';
import {useWalletContext} from '../../../runtime/wallet/WalletContext';
import {useSnackbar} from 'notistack';
import {TokenMetadata} from '../../swap/token';
import {reducer, sideEffectReducer, UnwrapStatus} from './reducer';
import {
    amountToUnwrapChange,
    estimateFees,
    fetchMetadata,
    runUnwrap,
    toggleAgreement,
    tokenSelect,
    walletChange
} from './actions';
import {connectStore, createStore} from '../../types';

function getFirstTokenByName(tokens: Record<string, TokenMetadata>) {
    return Object.entries(tokens)
        .sort(([key1,
                   metadata1],
               [, metadata2]) => {
            if (metadata1.ethereumName > metadata2.ethereumName) return 1;
            if (metadata1.ethereumName < metadata2.ethereumName) return -1;
            return 0;
        })[0];
}

export function useUnwrap() {
    const {enqueueSnackbar} = useSnackbar();

    const {
        fungibleTokens,
        fees,
        tezos: {minterContractAddress},
    } = useConfig();

    const {
        ethereum: {library: ethLibrary, account: ethAccount},
        tezos: {account: tzAccount, library: tezosLibrary},
    } = useWalletContext();

    useEffect(() => {
        dispatch(
            walletChange({
                ethLibrary,
                ethAccount: ethAccount || undefined,
                tezosAccount: tzAccount,
                tezosLibrary: tezosLibrary || undefined,
            })
        );
    }, [ethLibrary, ethAccount, tzAccount, tezosLibrary]);

    const [state, dispatch] = useReducer<typeof reducer>(reducer, {
        status: UnwrapStatus.UNINITIALIZED,
        token: getFirstTokenByName(fungibleTokens)[0] || '',
        connected: false,
        contract: null,
        minterContractAddress,
        currentBalance: new BigNumber(''),
        balanceNotYetFetched: true,
        amountToUnwrap: new BigNumber(''),
        fees,
    });

    const effectDispatch = connectStore(
        createStore(state, dispatch),
        sideEffectReducer(enqueueSnackbar)
    );

    const selectToken = useCallback((token: string) => {
        dispatch(
            tokenSelect({
                token,
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectAmountToUnwrap =
        useCallback((amountToUnwrap: BigNumber) => {
            dispatch(
                amountToUnwrapChange({
                    amountToUnwrap,
                })
            );
        }, []);

    const agree = (v: boolean) => dispatch(toggleAgreement(v));

    useEffect(() => {
        const loadMetadata = async () => {
            if (!state.token || !state.contractFactory) {
                return;
            }
            const {
                ethereumContractAddress,
                tezosWrappingContract,
                tezosTokenId,
            } = fungibleTokens[state.token];
            effectDispatch(
                fetchMetadata({
                    ethereumContract: ethereumContractAddress,
                    tezosContract: tezosWrappingContract,
                    tezosTokenId,
                })
            );
        };
        // noinspection JSIgnoredPromiseFromCall
        loadMetadata();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.token, state.contractFactory]);

    const launchUnwrap = () => {
        const {contract} = state;
        if (contract == null) return Promise.reject('Not ready');
        effectDispatch(
            runUnwrap.started({
                ethereumContract: fungibleTokens[state.token].ethereumContractAddress,
                fees,
                tezosAccount: tzAccount!,
                ethAccount: ethAccount!,
            })
        );
    };


    const runNetworkFeesEstimate = () => {
        effectDispatch(estimateFees.started({}));
    };

    return {
        ...state,
        selectToken,
        selectAmountToUnwrap: selectAmountToUnwrap,
        agree,
        launchUnwrap,
        runNetworkFeesEstimate,
        fungibleTokens,
        fees,
        tzAccount,
        ethAccount,
    };
}
