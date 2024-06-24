import {Action} from '../../types';
import {isType} from 'typescript-fsa';
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
    wrapDone
} from './actions';
import BigNumber from 'bignumber.js';
import {EthereumWrapApi, EthereumWrapApiBuilder, EthereumWrapApiFactory} from '../../ethereum/EthereumWrapApi';

type WrapState = {
    status: WrapStatus;
    token: string;
    contract: EthereumWrapApi | null;
    currentBalance: BigNumber;
    balanceNotYetFetched: boolean;
    currentAllowance: BigNumber;
    amountToWrap: BigNumber;
    connected: boolean;
    contractFactory?: EthereumWrapApiFactory;
    custodianContractAddress: string;
    networkFees: BigNumber;
};

export enum WrapStatus {
    NOT_READY,
    READY_TO_CONFIRM,
    WAITING_FOR_ALLOWANCE_APPROVAL,
    READY_TO_WRAP,
    AGREEMENT_CONFIRMED,
    WAITING_FOR_WRAP
}

export function initialState(token: string, custodianContractAddress: string) {
    return {
        status: WrapStatus.NOT_READY,
        token: token,
        contract: null,
        currentBalance: new BigNumber(''),
        balanceNotYetFetched: true,
        currentAllowance: new BigNumber(''),
        amountToWrap: new BigNumber(''),
        connected: false,
        custodianContractAddress,
        networkFees: new BigNumber('')
    };
}

const amountChange = (state: WrapState): WrapState => {
    if (
        !state.connected ||
        state.amountToWrap.isZero() ||
        state.amountToWrap.isNaN() ||
        state.amountToWrap.isGreaterThan(state.currentBalance)
    ) {
        return {...state, status: WrapStatus.NOT_READY};
    }
    const newStatus = state.amountToWrap.lte(state.currentAllowance)
        ? WrapStatus.READY_TO_WRAP
        : WrapStatus.READY_TO_CONFIRM;

    return {...state, status: newStatus};
};

const agree = (state: WrapState): WrapState => {
    if (
        !state.connected ||
        state.amountToWrap.isZero() ||
        state.amountToWrap.isNaN() ||
        state.amountToWrap.isGreaterThan(state.currentBalance)
    ) {
        return {...state, status: WrapStatus.NOT_READY};
    }
    const newStatus = state.amountToWrap.lte(state.currentAllowance)
        ? WrapStatus.READY_TO_WRAP
        : WrapStatus.AGREEMENT_CONFIRMED;

    return {...state, status: newStatus};
};

export function reducer(state: WrapState, action: Action): WrapState {
    if (isType(action, tokenSelect)) {
        return {
            ...state,
            status: WrapStatus.NOT_READY,
            ...action.payload,
            currentBalance: new BigNumber(''),
            balanceNotYetFetched: true,
            currentAllowance: new BigNumber(''),
            amountToWrap: new BigNumber('')
        };
    }
    if (isType(action, userBalanceChange)) {
        return amountChange({
            ...state,
            balanceNotYetFetched: false,
            ...action.payload
        });
    }
    if (isType(action, amountToWrapChange)) {
        const {amountToWrap} = action.payload;
        return amountChange({
            ...state,
            amountToWrap
        });
    }
    if (isType(action, runAllowance)) {
        return {
            ...state,
            status: WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL
        };
    }
    if (isType(action, allowanceChange)) {
        return {
            ...state,
            status: WrapStatus.READY_TO_WRAP,
            currentAllowance: action.payload.newCurrentAllowance
        };
    }
    if (isType(action, runWrap)) {
        return {
            ...state,
            status: WrapStatus.WAITING_FOR_WRAP
        };
    }
    if (isType(action, networkFees)) {
        return {
            ...state,
            networkFees: action.payload.networkFees
        };
    }
    if (isType(action, wrapDone)) {
        return {
            ...state,
            status: WrapStatus.READY_TO_WRAP
        };
    }

    if (isType(action, toggleAgreement)) {
        return action.payload ? agree(state) : {...state, status: WrapStatus.READY_TO_CONFIRM};
    }

    if (isType(action, walletChange)) {
        const {ethAccount, tezosAccount, ethLibrary} = action.payload;
        const ethWrapApiFactory =
            tezosAccount && ethAccount && ethLibrary
                ? EthereumWrapApiBuilder.withProvider(ethLibrary)
                    .forCustodianContract(state.custodianContractAddress)
                    .forAccount(ethAccount, tezosAccount)
                    .createFactory()
                : undefined;
        return {
            ...state,
            currentBalance: new BigNumber(0),
            contractFactory: ethWrapApiFactory,
            status: ethWrapApiFactory ? state.status : WrapStatus.NOT_READY,
            connected: ethAccount !== undefined && tezosAccount !== undefined
        };
    }

    return state;
}
