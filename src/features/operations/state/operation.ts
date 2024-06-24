import {IndexerTokenPayload, IndexerUnwrapPayload, IndexerWrapPayload,} from '../../indexer/indexerApi';
import {Fees} from '../../../config';
import BigNumber from 'bignumber.js';
import {unwrapFees, wrapFees} from '../../fees/fees';
import {
    Operation,
    OperationStatus,
    OperationStatusType,
    OperationType,
    UnwrapErc20Operation,
    WrapErc20Operation,
} from './types';

const toOperationStatus = (
    p: IndexerTokenPayload,
    signaturesThreshold: number
): OperationStatus => {
    if (p.confirmations < p.confirmationsThreshold) {
        return {
            type: OperationStatusType.WAITING_FOR_CONFIRMATIONS,
            id: p.id,
            confirmations: p.confirmations,
            confirmationsThreshold: p.confirmationsThreshold,
        };
    }
    if (Object.keys(p.signatures).length < signaturesThreshold) {
        return {
            type: OperationStatusType.WAITING_FOR_SIGNATURES,
            id: p.id,
            signatures: p.signatures,
        };
    }
    if (p.status === 'finalized') {
        return {
            type: OperationStatusType.DONE,
            id: p.id,
        };
    }
    return {
        type: OperationStatusType.READY,
        id: p.id,
        signatures: p.signatures,
    };
};

export const merge = (current: Operation[], indexer: Operation[]) =>
    current.length === 0
        ? indexer
        : current.reduce<Operation[]>((acc, op) => {
            const maybeSame = indexer.find((v) => v.hash === op.hash);
            if (!maybeSame && op.status.type === OperationStatusType.NEW) {
                return [...acc, op];
            }
            if (!maybeSame && op.status.type === OperationStatusType.DONE) {
                return acc;
            }
            if (maybeSame && op.status.type === OperationStatusType.DONE) {
                return [...acc, op];
            }
            if (maybeSame) {
                return [...acc, maybeSame];
            }
            return [...acc, op];
        }, []);

export const mergeSingle = (indexer: Operation, current?: Operation) => {
    if (!current) {
        return indexer;
    }
    if (current.status.type === OperationStatusType.DONE) {
        return current;
    }
    return {...current, ...indexer};
};

export const markAsDone = (op: Operation): Operation => {
    switch (op.status.type) {
        case OperationStatusType.READY:
            return {
                ...op,
                status: {type: OperationStatusType.DONE, id: op.status.id},
            };
        default:
            return op;
    }
};

export const markAsNew = (op: Operation): Operation => {
    switch (op.status.type) {
        case OperationStatusType.WAITING_FOR_RECEIPT:
            return {...op, status: {type: OperationStatusType.NEW}};
        default:
            return op;
    }
};

export const wrapsToOperations = (
    fees: Fees,
    signaturesThreshold: number,
    payload: IndexerWrapPayload
): WrapErc20Operation[] => {
    return payload.result.map((w) => {
        const amount = new BigNumber(w.amount!);
        return {
            status: toOperationStatus(w, signaturesThreshold),
            type: OperationType.WRAP,
            amount: amount,
            transactionHash: w.transactionHash!,
            hash: w.transactionHash!,
            source: w.source,
            destination: w.destination,
            token: w.token,
            fees: wrapFees(amount, fees),
        };
    });
};

export const unwrapToOperations = (
    fees: Fees,
    signaturesThreshold: number,
    payload: IndexerUnwrapPayload
): UnwrapErc20Operation[] => {
    return payload.result.map((w) => {
        const amount = new BigNumber(w.amount!);
        return {
            status: toOperationStatus(w, signaturesThreshold),
            type: OperationType.UNWRAP,
            amount: amount,
            operationHash: w.operationHash!,
            hash: w.operationHash!,
            source: w.source,
            destination: w.destination,
            token: w.token,
            fees: unwrapFees(amount, fees),
        };
    });
};
