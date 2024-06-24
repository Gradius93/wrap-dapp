import {useWalletContext} from '../../../runtime/wallet/WalletContext';
import {useConfig, useIndexerApi,} from '../../../runtime/config/ConfigContext';
import {useCallback, useEffect, useState} from 'react';
import {Operation, OperationType, UnwrapErc20Operation, WrapErc20Operation,} from '../state/types';
import {unwrapToOperations, wrapsToOperations} from '../state/operation';
import {useHistory} from 'react-router';
import {unwrapPage, wrapPage} from '../../../screens/routes';

type OperationsHistoryState = {
    mints: WrapErc20Operation[];
    burns: UnwrapErc20Operation[];
};

export const usePendingOperationsHistory = () => {
    const {
        ethereum: {account: ethAccount},
        tezos: {account: tzAccount},
    } = useWalletContext();

    const history = useHistory();
    const indexerApi = useIndexerApi();
    const {fees, wrapSignatureThreshold} = useConfig();
    const [count, setCount] = useState(0);
    const [canFetch, setCanFetch] = useState(false);

    const [operations, setOperations] = useState<OperationsHistoryState>({
        mints: [],
        burns: [],
    });

    useEffect(() => {
        const loadPendingWrap = async () => {
            if (!ethAccount && !tzAccount) {
                setOperations({burns: [], mints: []});
                return;
            }

            const [pendingWrap, pendingUnwrap] = await Promise.all([
                indexerApi.fetchPendingWraps(ethAccount, tzAccount),
                indexerApi.fetchPendingUnwraps(ethAccount, tzAccount),
            ]);
            const mintsFromIndexer = wrapsToOperations(
                fees,
                wrapSignatureThreshold,
                pendingWrap
            );
            const burnsFromIndexer = unwrapToOperations(
                fees,
                wrapSignatureThreshold,
                pendingUnwrap
            );

            setOperations({
                mints: mintsFromIndexer,
                burns: burnsFromIndexer,
            });
        };
        // noinspection JSIgnoredPromiseFromCall
        loadPendingWrap();
        const intervalId = setInterval(loadPendingWrap, 20000);
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ethAccount, tzAccount]);

    const selectOperation = useCallback(
        (op: Operation) => {
            switch (op.type) {
                case OperationType.WRAP:
                    history.push(wrapPage(op));
                    break;
                case OperationType.UNWRAP:
                    history.push(unwrapPage(op));
                    break;
            }
        },
        [history]
    );

    useEffect(() => setCount(operations.burns.length + operations.mints.length), [
        operations,
    ]);

    useEffect(
        () => setCanFetch(tzAccount !== undefined || ethAccount !== undefined),
        [tzAccount, ethAccount]
    );

    return {operations, count, canFetch, selectOperation};
};
