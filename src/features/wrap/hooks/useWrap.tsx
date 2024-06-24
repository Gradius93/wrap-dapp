import {useCallback, useEffect, useReducer} from 'react';
import BigNumber from 'bignumber.js';
import {useConfig} from '../../../runtime/config/ConfigContext';
import {useWalletContext} from '../../../runtime/wallet/WalletContext';
import {Operation, OperationStatusType, OperationType,} from '../../operations/state/types';
import {wrapFees} from '../../fees/fees';
import {useSnackbar} from 'notistack';
import {
    allowanceChange,
    amountToWrapChange,
    networkFees,
    runAllowance,
    runWrap,
    toggleAgreement,
    tokenSelect,
    userBalanceChange,
    walletChange,
    wrapDone,
} from './actions';
import {initialState, reducer, WrapStatus} from './reducer';
import {TokenMetadata} from '../../swap/token';

function getFirstTokenByName(tokens: Record<string, TokenMetadata>) {
    return Object.entries(tokens).sort(([key1, metadata1], [, metadata2]) => {
        if (metadata1.ethereumName > metadata2.ethereumName) return 1;
        if (metadata1.ethereumName < metadata2.ethereumName) return -1;
        return 0;
    })[0];
}

export function useWrap() {
    const {enqueueSnackbar} = useSnackbar();

    const {
        fungibleTokens,
        fees,
        ethereum: {custodianContractAddress},
    } = useConfig();

    const {
        ethereum: {library: ethLibrary, account: ethAccount},
        tezos: {account: tzAccount, library: tezosLibrary},
    } = useWalletContext();

    const [state, dispatch] = useReducer<typeof reducer>(
        reducer,
        initialState(
            getFirstTokenByName(fungibleTokens)[0],
            custodianContractAddress
        )
    );

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

    const selectToken = useCallback((token: string) => {
        dispatch(tokenSelect({token}));
    }, []);

    const selectAmountToWrap = useCallback((amountToWrap: BigNumber) => {
        dispatch(amountToWrapChange({amountToWrap}));
    }, []);

    const launchAllowanceApproval = useCallback(() => {
        const startAllowanceProcess = async () => {
            const {amountToWrap, contract, currentAllowance} = state;
            if (amountToWrap.lte(currentAllowance)) return;
            if (contract == null) return;
            await contract.approve(amountToWrap);
            dispatch(runAllowance());
            let counter = 0;
            const refreshCurrentAllowance = () =>
                setTimeout(async () => {
                    counter++;
                    const newAllowance = await contract.allowanceOf();
                    if (amountToWrap.lte(newAllowance)) {
                        dispatch(
                            allowanceChange({
                                newCurrentAllowance: newAllowance,
                            })
                        );
                        return;
                    } else {
                        if (counter > 1000) throw new Error('Timeout');
                        refreshCurrentAllowance();
                    }
                }, 2000);
            refreshCurrentAllowance();
        };

        return startAllowanceProcess();
    }, [state]);

    const launchWrap = () => {
        const {contract, amountToWrap} = state;
        if (contract == null) return Promise.reject('Not ready');

        const startWrapping = async () => {
            try {
                const transactionHash = await contract.wrap(amountToWrap);
                const op: Operation = {
                    transactionHash,
                    hash: transactionHash,
                    source: ethAccount!,
                    destination: tzAccount!,
                    status: {type: OperationStatusType.WAITING_FOR_RECEIPT},
                    type: OperationType.WRAP,
                    amount: amountToWrap,
                    token: fungibleTokens[state.token].ethereumContractAddress,
                    fees: wrapFees(amountToWrap, fees),
                };

                return op;
            } catch (e) {
                enqueueSnackbar('Error while calling wrap', {variant: 'error'});
            }
            dispatch(wrapDone());
        };
        dispatch(runWrap());
        return startWrapping();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    };

    const agree = (v: boolean) => dispatch(toggleAgreement(v));

    useEffect(() => {
        const computeNetworkFees = async () => {
            const {status, contract, amountToWrap} = state;
            if (
                status !== WrapStatus.READY_TO_WRAP ||
                contract == null ||
                ethLibrary == null
            ) {
                return;
            }
            const estimation = await contract.networkFees(amountToWrap, ethLibrary);
            dispatch(networkFees({networkFees: estimation}));
        };

        let tryNumber = 0;
        try {
            // noinspection JSIgnoredPromiseFromCall
            computeNetworkFees();
        } catch (e) {
            if (tryNumber === 1) {
                setTimeout(computeNetworkFees, 1000);
                tryNumber++;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.status]);

    useEffect(() => {
        const loadMetadata = async () => {
            if (!state.token || !state.contractFactory) {
                return;
            }
            const contract = state.contractFactory.forErc20(
                fungibleTokens[state.token].ethereumContractAddress
            );
            const [currentBalance, currentAllowance] = await Promise.all([
                contract.balanceOf(),
                contract.allowanceOf(),
            ]);
            dispatch(
                userBalanceChange({
                    currentBalance,
                    currentAllowance,
                    contract,
                })
            );
        };
        loadMetadata();
        // eslint-disable-next-line
    }, [state.token, state.contractFactory]);

    return {
        ...state,
        fees,
        fungibleTokens,
        selectToken,
        selectAmountToWrap,
        launchAllowanceApproval,
        tzAccount,
        ethAccount,
        agree,
        launchWrap,
    };
}
