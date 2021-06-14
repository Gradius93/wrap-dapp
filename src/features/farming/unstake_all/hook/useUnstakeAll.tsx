import {useWalletContext} from '../../../../runtime/wallet/WalletContext';
import {useCallback, useEffect, useState} from 'react';
import {ConnectionStatus} from '../../../wallet/connectionStatus';
import {useSnackbar} from 'notistack';
import BigNumber from "bignumber.js";
import {IndexerContractBalance} from "../../../indexer/indexerApi";
import FarmingContractApi from "../../api/FarmingContractApi";

export enum UnstakeAllStatus {
    NOT_CONNECTED = 'NOT_CONNECTED',
    NOT_READY = 'NOT_READY',
    READY = 'READY',
    UNSTAKING = 'UNSTAKING',
}

const nextStatus = (stakingBalances: IndexerContractBalance[]) => {
    const balance = stakingBalances.reduce((acc, elt) => {
        return acc.plus(elt.balance);
    }, new BigNumber(0));

    if (balance.gt(0)) {
        return UnstakeAllStatus.READY;
    }
    return UnstakeAllStatus.NOT_READY;
};

export default function useUnstakeAll(stakingBalances: IndexerContractBalance[]) {
    const walletContext = useWalletContext();
    const {status, library, account} = walletContext.tezos;
    const [unstakeAllStatus, setStatus] = useState(UnstakeAllStatus.NOT_CONNECTED);
    const connected =
        status === ConnectionStatus.CONNECTED && account !== undefined;
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (!connected) {
            setStatus(UnstakeAllStatus.NOT_CONNECTED);
            return;
        }
        setStatus(nextStatus(stakingBalances));
    }, [connected, stakingBalances]);

    const unstakeAll = useCallback(async () => {
        const api = new FarmingContractApi(library!);
        setStatus(UnstakeAllStatus.UNSTAKING);
        try {
            await api.unstakeAll(stakingBalances);
            setStatus(UnstakeAllStatus.NOT_READY);
            enqueueSnackbar('Unstaking done', {variant: 'success'});
        } catch (error) {
            enqueueSnackbar(error.description, {variant: 'error'});
            setStatus(UnstakeAllStatus.READY);
        }
    }, [library, stakingBalances, enqueueSnackbar]);

    return {
        unstakeAllStatus,
        unstakeAll,
    };
}
