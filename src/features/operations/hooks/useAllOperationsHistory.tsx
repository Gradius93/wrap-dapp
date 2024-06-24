import {useWalletContext} from '../../../runtime/wallet/WalletContext';
import {useConfig, useIndexerApi,} from '../../../runtime/config/ConfigContext';
import {useEffect, useState} from 'react';
import {UnwrapErc20Operation, WrapErc20Operation} from '../state/types';
import {unwrapToOperations, wrapsToOperations} from '../state/operation';

export type AllOperationsHistoryState = {
    mints: WrapErc20Operation[];
    burns: UnwrapErc20Operation[];
};

export const useAllOperationsHistory = () => {
    const {
        ethereum: {account: ethAccount},
        tezos: {account: tzAccount},
    } = useWalletContext();

    const {fungibleTokens} = useConfig();

    const indexerApi = useIndexerApi();
    const {fees, wrapSignatureThreshold} = useConfig();
    const [canFetch, setCanFetch] = useState(false);

    const [operations, setOperations] = useState<AllOperationsHistoryState>({
        mints: [],
        burns: [],
    });

    useEffect(() => {
        const loadFinalizedOperations = async () => {
            if (!ethAccount && !tzAccount) {
                setOperations({burns: [], mints: []});
                return;
            }

            const [finalizedWraps, finalizedUnwraps] = await Promise.all([
                indexerApi.fetchFinalizedWraps(ethAccount, tzAccount),
                indexerApi.fetchFinalizedUnwraps(ethAccount, tzAccount),
            ]);
            const mintsFromIndexer = wrapsToOperations(
                fees,
                wrapSignatureThreshold,
                finalizedWraps
            );
            const burnsFromIndexer = unwrapToOperations(
                fees,
                wrapSignatureThreshold,
                finalizedUnwraps
            );
            setOperations({
                mints: mintsFromIndexer,
                burns: burnsFromIndexer,
            });
        };
        // noinspection JSIgnoredPromiseFromCall
        loadFinalizedOperations();
        const intervalId = setInterval(loadFinalizedOperations, 30000);
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ethAccount, tzAccount]);

    useEffect(
        () => setCanFetch(tzAccount !== undefined || ethAccount !== undefined),
        [tzAccount, ethAccount]
    );

    return {operations, canFetch, fungibleTokens};
};
