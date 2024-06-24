import {useWalletContext} from '../../../runtime/wallet/WalletContext';
import {useCallback, useEffect, useState} from 'react';
import {ConnectionStatus} from '../../wallet/connectionStatus';
import BigNumber from 'bignumber.js';
import {TezosToolkit} from '@taquito/taquito';

enum BalanceStrategy {
    VIEW = 'VIEW',
    LAMBDA = 'LAMBDA',
}

interface BalanceFetcher {
    (
        library: TezosToolkit,
        owner: string,
        address: string,
        tokenId: number
    ): Promise<BigNumber>;
}

const fetchByLambda: BalanceFetcher = async (
    library,
    owner,
    address,
    tokenId
) => {
    const contract = await library.contract.at(address);
    const [{balance}] = await contract.views
        .balance_of([{owner, token_id: tokenId}])
        .read();
    return balance;
};

const fetchers: { [key in keyof typeof BalanceStrategy]: BalanceFetcher } = {
    LAMBDA: fetchByLambda,
    VIEW: fetchByLambda,
};

export default function useTokenBalance(
    address: string,
    tokenId: number,
    strategy = BalanceStrategy.LAMBDA
) {
    const walletContext = useWalletContext();
    const {status, library, account} = walletContext.tezos;
    const connected =
        status === ConnectionStatus.CONNECTED && account !== undefined;
    const [balance, setBalance] = useState(new BigNumber(''));
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!connected) {
            return;
        }
        setLoading(true);
        const result = await fetchers[strategy](
            library!,
            account!,
            address,
            tokenId
        );
        setLoading(false);
        setBalance(result);
    }, [strategy, connected, library, account, address, tokenId]);

    useEffect(() => {
        if (!connected) {
            setBalance(new BigNumber(''));
            return;
        }
        // noinspection JSIgnoredPromiseFromCall
        refresh();
    }, [refresh, connected]);

    return {balance, loading, refresh, connected};
}
