import {merge} from './operation';
import {OperationStatusType, OperationType, WrapErc20Operation,} from './types';
import BigNumber from 'bignumber.js';

const aNewOperation = () => {
    const newOp: WrapErc20Operation = {
        transactionHash: 'hash',
        hash: 'hash',
        source: 'ethAccount',
        destination: 'tzAccount',
        status: {type: OperationStatusType.NEW},
        type: OperationType.WRAP,
        amount: new BigNumber(10),
        token: 'DAI',
        fees: new BigNumber(1),
    };
    return newOp;
};

const aDoneOperation = () => {
    const currentOp: WrapErc20Operation = {
        transactionHash: 'hash',
        hash: 'hash',
        source: 'ethAccount',
        destination: 'tzAccount',
        status: {type: OperationStatusType.DONE, id: 'id'},
        type: OperationType.WRAP,
        amount: new BigNumber(10),
        token: 'DAI',
        fees: new BigNumber(1),
    };
    return currentOp;
};

const waitingForConfirmation = (
    newOp: WrapErc20Operation
): WrapErc20Operation => ({
    ...newOp,
    status: {
        type: OperationStatusType.WAITING_FOR_CONFIRMATIONS,
        confirmationsThreshold: 2,
        confirmations: 0,
        id: 'id',
    },
});

test('returns indexer ops if current is empty', () => {
    const result = merge([], [aNewOperation()]);

    expect(result).toHaveLength(1);
});

test('new operations should be kept if not present from indexer', () => {
    const newOp = aNewOperation();

    const result = merge([newOp], []);

    expect(result).toContain(newOp);
});

test('new operation is replaced by updated operation', () => {
    const newOp = aNewOperation();
    const updatedOp = waitingForConfirmation(newOp);

    const result = merge([newOp], [updatedOp]);

    expect(result).toContain(updatedOp);
});

test('Done operation should not change', () => {
    const currentOp = aDoneOperation();
    const updatedOp = waitingForConfirmation(currentOp);

    const result = merge([currentOp], [updatedOp]);

    expect(result).toContain(currentOp);
});

test('Done op are removed from the list', () => {
    const currentOp = aDoneOperation();

    const result = merge([currentOp], []);

    expect(result).toHaveLength(0);
});

export {};
