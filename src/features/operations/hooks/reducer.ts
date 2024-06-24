import {Operation, OperationStatusType, OperationType} from '../state/types';
import {markAsDone, markAsNew, unwrapToOperations, wrapsToOperations,} from '../state/operation';
import {Action, Dispatch, Store} from '../../types';
import {isType} from 'typescript-fsa';
import {
    beginApply,
    fetchReceipt,
    mint,
    receiptFetched,
    release,
    reload,
    update,
    updateUnwrap,
    updateWrap,
} from './actions';
import IndexerApi from '../../indexer/indexerApi';
import {ethers} from 'ethers';
import CUSTODIAN_ABI from '../../ethereum/custodianContractAbi';
import ERC20_ABI from '../../ethereum/erc20Abi';

export enum ReceiptStatus {
    UNINITIALIZED,
    NEED_RECEIPT,
    NEED_REFRESH,
    READY_TO_APPLY,
    WAITING_FOR_APPLY,
    DONE,
}

export type ReceiptState = {
    status: ReceiptStatus;
    operation?: Operation;
};

const toReceiptStatus = (opStatus: OperationStatusType): ReceiptStatus => {
    switch (opStatus) {
        case OperationStatusType.WAITING_FOR_RECEIPT:
            return ReceiptStatus.NEED_RECEIPT;
        case OperationStatusType.NEW:
            return ReceiptStatus.NEED_REFRESH;
        case OperationStatusType.WAITING_FOR_CONFIRMATIONS:
        case OperationStatusType.WAITING_FOR_SIGNATURES:
            return ReceiptStatus.NEED_REFRESH;
        case OperationStatusType.READY:
            return ReceiptStatus.READY_TO_APPLY;
        case OperationStatusType.DONE:
            return ReceiptStatus.DONE;
    }
};

export const reducer = (state: ReceiptState, action: Action): ReceiptState => {
    if (isType(action, updateWrap)) {
        const {fees, signaturesThreshold, data} = action.payload;
        const all = wrapsToOperations(fees, signaturesThreshold, data);
        if (all.length > 0) {
            return {
                ...state,
                status: toReceiptStatus(all[0].status.type),
                operation: all[0],
            };
        }
    }
    if (isType(action, updateUnwrap)) {
        const {fees, signaturesThreshold, data} = action.payload;
        const all = unwrapToOperations(fees, signaturesThreshold, data);
        if (all.length > 0) {
            return {
                ...state,
                status: toReceiptStatus(all[0].status.type),
                operation: all[0],
            };
        }
    }

    if (isType(action, update)) {
        return {
            ...state,
            status: toReceiptStatus(action.payload.operation.status.type),
            operation: action.payload.operation,
        };
    }

    if (isType(action, receiptFetched)) {
        if (!state.operation || !action.payload.receipt) {
            return state;
        }
        const updatedOp = markAsNew(state.operation);
        return {
            ...state,
            operation: updatedOp,
            status: toReceiptStatus(updatedOp.status.type),
        };
    }

    if (isType(action, beginApply)) {
        return {...state, status: ReceiptStatus.WAITING_FOR_APPLY};
    }
    return state;
};

const buildFullSignature = (signatures: Record<string, string>) => {
    const orderedSigners = Object.keys(signatures).sort();
    return orderedSigners.reduce(
        (previousValue, currentValue) =>
            previousValue + signatures[currentValue].replace('0x', ''),
        '0x'
    );
};

export const sideEffectReducer = (api: IndexerApi) => (
    {getState, dispatch}: Store<ReceiptState>,
    action: Action
) => async (next: Dispatch) => {
    if (isType(action, fetchReceipt)) {
        const {hash, ethLibrary} = action.payload;
        const receipt = await ethLibrary?.getTransactionReceipt(hash);
        dispatch(receiptFetched({receipt}));
        return;
    }
    if (isType(action, reload)) {
        const {type, hash, signaturesThreshold, fees} = action.payload;
        switch (type) {
            case OperationType.WRAP: {
                const payload = await api.fetchWrapsByHash(hash);
                dispatch(updateWrap({data: payload, signaturesThreshold, fees}));
                break;
            }
            case OperationType.UNWRAP: {
                const payload = await api.fetchUnwrapsByHash(hash);
                dispatch(updateUnwrap({data: payload, signaturesThreshold, fees}));
                break;
            }
        }
        return;
    }

    if (isType(action, mint)) {
        const {
            tzLibrary,
            quorumContractAddress,
            minterContractAddress,
        } = action.payload;
        const op = getState().operation;
        dispatch(beginApply());
        const contract = await tzLibrary.wallet.at(quorumContractAddress);
        if (!op) {
            return Promise.reject('Not ready');
        }
        if (op.status.type !== OperationStatusType.READY) {
            return Promise.reject('Not ready');
        }
        const mintSignatures = Object.entries(op.status.signatures);
        const [blockHash, logIndex] = op.status.id.split(':');
        const result = await contract.methods
            .minter(
                'mint_erc20',
                op.token.toLowerCase().substring(2),
                blockHash.substring(2),
                logIndex,
                op.destination,
                op.amount.toFixed(),
                minterContractAddress,
                mintSignatures
            )
            .send();
        await result.receipt();
        dispatch(update({operation: markAsDone(op)}));
        return;
    }
    if (isType(action, release)) {
        const {ethLibrary, custodianContractAddress} = action.payload;
        const op = getState().operation;
        if (!op) {
            return Promise.reject('Not loaded');
        }
        if (op.status.type !== OperationStatusType.READY) {
            return Promise.reject('Operation is not ready');
        }
        dispatch(beginApply());
        const custodianContract = new ethers.Contract(
            custodianContractAddress,
            new ethers.utils.Interface(CUSTODIAN_ABI),
            ethLibrary?.getSigner()
        );
        const erc20Interface = new ethers.utils.Interface(ERC20_ABI);
        const data = erc20Interface.encodeFunctionData('transfer', [
            op.destination,
            op.amount.toFixed(),
        ]);
        const result = await custodianContract.execTransaction(
            op.token,
            0,
            data,
            op.status.id,
            buildFullSignature(op.status.signatures),
            {
                gasLimit: 350000,
            }
        );
        await result.wait();
        dispatch(update({operation: markAsDone(op)}));
        return;
    }
    next(action);
};
