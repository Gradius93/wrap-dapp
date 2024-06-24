import {useCallback, useEffect, useState} from 'react';
import BigNumber from 'bignumber.js';
import {useWalletContext} from '../../../../runtime/wallet/WalletContext';
import FarmingContractApi from '../../api/FarmingContractApi';
import {ConnectionStatus} from '../../../wallet/connectionStatus';

const initialState = {
    totalSupply: new BigNumber(''),
    staked: new BigNumber(''),
    reward: new BigNumber(''),
};

export default function useFarmingContract(farmingContractAddress: string) {
    const [loading, setLoading] = useState(false);
    const [balances, setBalances] = useState(initialState);
    const walletContext = useWalletContext();
    const {library, status, account} = walletContext.tezos;

    const refresh = useCallback(async () => {
        setLoading(true);
        const r = await new FarmingContractApi(library!).extractBalances(
            farmingContractAddress,
            account!
        );
        setLoading(false);
        setBalances(r);
    }, [library, farmingContractAddress, account]);

    useEffect(() => {
        if (status !== ConnectionStatus.CONNECTED || !account) {
            setBalances(initialState);
            return;
        }
        // noinspection JSIgnoredPromiseFromCall
        refresh();
    }, [refresh, status, account]);

    return {
        farmLoading: loading,
        refreshFarmingContract: refresh,
        farmBalances: balances,
    };
}
