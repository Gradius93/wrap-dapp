import BigNumber from 'bignumber.js';
import {TezosUnwrapApi, TezosUnwrapApiBuilder, TezosUnwrapApiFactory,} from '../../tezos/TezosUnwrapApi';
import {Fees} from '../../../config';
import {Action, Dispatch, Store} from '../../types';
import {isType} from 'typescript-fsa';
import {
    amountToUnwrapChange,
    estimateFees,
    fetchMetadata,
    runUnwrap,
    toggleAgreement,
    tokenSelect,
    userBalanceChange,
    walletChange
} from './actions';
import {OptionsObject, SnackbarKey, SnackbarMessage} from 'notistack';
import {Operation, OperationStatusType, OperationType, UnwrapErc20Operation,} from '../../operations/state/types';
import {unwrapAmountsFromTotal} from '../../fees/fees';


type UnwrapState = {
    status: UnwrapStatus;
    token: string;
    contract: TezosUnwrapApi | null;
    currentBalance: BigNumber;
    balanceNotYetFetched: boolean;
    amountToUnwrap: BigNumber;
    connected: boolean;
    minterContractAddress: string;
    fees: Fees;
    costEstimate?: number;
    contractFactory?: TezosUnwrapApiFactory;
    operation?: Operation;
};

export enum UnwrapStatus {
    UNINITIALIZED,
    NOT_READY,
    READY_TO_CONFIRM,
    READY_TO_UNWRAP,
    AGREEMENT_CONFIRMED,
    WAITING_FOR_UNWRAP,
    UNWRAP_DONE,
}

const amountChange = (state: UnwrapState): UnwrapState => {
    if (
        !state.connected ||
        state.amountToUnwrap.isZero() ||
        state.amountToUnwrap.isNaN() ||
        state.amountToUnwrap.isGreaterThan(state.currentBalance)
    ) {
        return {...state, status: UnwrapStatus.NOT_READY};
    }

    return {...state, status: UnwrapStatus.READY_TO_CONFIRM};
};

const agree = (state: UnwrapState): UnwrapState => {
    if (
        !state.connected ||
        state.amountToUnwrap.isZero() ||
        state.amountToUnwrap.isNaN() ||
        state.amountToUnwrap.isGreaterThan(state.currentBalance)
    ) {
        return {...state, status: UnwrapStatus.NOT_READY};
    }

    const newStatus = state.amountToUnwrap.lte(state.currentBalance)
        ? UnwrapStatus.READY_TO_UNWRAP
        : UnwrapStatus.NOT_READY;

    return {...state, status: newStatus}
};

export function reducer(state: UnwrapState, action: Action): UnwrapState {
    if (isType(action, tokenSelect)) {
        return {
            ...state,
            status: UnwrapStatus.NOT_READY,
            ...action.payload,
            currentBalance: new BigNumber(''),
            balanceNotYetFetched: true,
            amountToUnwrap: new BigNumber(0),
        };
    }
    if (isType(action, userBalanceChange)) {
        if (state.token === action.meta!.token) {
            return amountChange({...state, balanceNotYetFetched: false, ...action.payload});
        }
    }
    if (isType(action, amountToUnwrapChange)) {
        const {amountToUnwrap} = action.payload;
        return amountChange({...state, amountToUnwrap});
    }
    if (isType(action, runUnwrap.started)) {
        return {
            ...state,
            status: UnwrapStatus.WAITING_FOR_UNWRAP,
        };
    }
    if (isType(action, runUnwrap.done)) {
        return {
            ...state,
            operation: action.payload.result,
            status: UnwrapStatus.UNWRAP_DONE,
        };
    }
    if (isType(action, estimateFees.done)) {
        return {
            ...state,
            costEstimate: action.payload.result,
        };
    }

    if (isType(action, toggleAgreement)) {
        return action.payload ? agree(state) : {...state, status: UnwrapStatus.READY_TO_CONFIRM};
    }

    if (isType(action, walletChange)) {
        const {ethAccount, tezosAccount, tezosLibrary} = action.payload;
        const contractFactory =
            ethAccount && tezosAccount && tezosLibrary
                ? TezosUnwrapApiBuilder.withProvider(tezosLibrary)
                    .forMinterContract(state.minterContractAddress)
                    .forAccount(ethAccount, tezosAccount)
                    .forFees(state.fees)
                    .createFactory()
                : undefined;
        return {
            ...state,
            contractFactory,
            status: contractFactory ? state.status : UnwrapStatus.NOT_READY,
            connected: ethAccount !== undefined && tezosAccount !== undefined,
        };
    }
    return state;
}

export function sideEffectReducer(
    enqueueSnackbar: (
        message: SnackbarMessage,
        options?: OptionsObject
    ) => SnackbarKey
) {
    return ({getState, dispatch}: Store<UnwrapState>, action: Action) => {
        const state = getState();
        return async (next: Dispatch) => {
            if (isType(action, fetchMetadata)) {
                if (!state.contractFactory) {
                    return;
                }
                const {
                    ethereumContract,
                    tezosContract,
                    tezosTokenId,
                } = action.payload;
                const contract = state.contractFactory.forFa20(
                    ethereumContract,
                    tezosContract,
                    tezosTokenId
                );
                const currentBalance = await contract.balanceOf();
                dispatch(
                    userBalanceChange(
                        {
                            currentBalance,
                            contract,
                        },
                        {
                            token: state.token,
                        }
                    )
                );
            }
            if (isType(action, runUnwrap.started)) {
                const {contract, amountToUnwrap} = state;
                if (contract == null) return;
                next(action);
                const {
                    ethAccount,
                    ethereumContract,
                    fees,
                    tezosAccount,
                } = action.payload;
                try {
                    const [amount, feesToTake] = unwrapAmountsFromTotal(
                        amountToUnwrap,
                        fees
                    );
                    const operationHash = await contract.unwrap(amount, feesToTake);

                    const op: UnwrapErc20Operation = {
                        operationHash,
                        hash: operationHash,
                        source: tezosAccount,
                        destination: ethAccount,
                        status: {type: OperationStatusType.NEW},
                        type: OperationType.UNWRAP,
                        amount: amount,
                        token: ethereumContract,
                        fees: feesToTake,
                    };
                    dispatch(runUnwrap.done({params: action.payload, result: op}));
                } catch (e) {
                    enqueueSnackbar('Error while calling unwrap', {variant: 'error'});
                    dispatch(
                        runUnwrap.failed({
                            params: action.payload,
                            error: 'Unwrap failure',
                        })
                    );
                }

                return;
            }
            if (isType(action, estimateFees.started)) {
                next(action);

                const {contract, amountToUnwrap, fees} = state;
                const [amount, feesToTake] = unwrapAmountsFromTotal(
                    amountToUnwrap,
                    fees
                );
                const estimate = await contract?.estimateUnwrapNetworkFees(
                    amount,
                    feesToTake
                );
                dispatch(estimateFees.done({result: estimate?.totalCost || 0}));
            }
            next(action);
        };
    };
}
