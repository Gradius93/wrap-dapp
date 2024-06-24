import {useWalletContext} from '../../../../runtime/wallet/WalletContext';
import {useCallback, useEffect, useState} from 'react';
import {ConnectionStatus} from '../../../wallet/connectionStatus';
import {useSnackbar} from 'notistack';
import BigNumber from "bignumber.js";
import FarmingContractApi from "../../api/FarmingContractApi";
import {ContractBalance} from "../../balances-reducer";

export enum UnstakeAllStatus {
    NOT_CONNECTED = 'NOT_CONNECTED',
    NOT_READY = 'NOT_READY',
    READY = 'READY',
    UNSTAKING = 'UNSTAKING',
}

const nextStatus = (balances: ContractBalance[]) => {
    const balance = balances.reduce((acc, elt) => {
        return acc.plus(elt.balance ?? "0");
    }, new BigNumber(0));

    if (balance.gt(0)) {
        return UnstakeAllStatus.READY;
    }
    return UnstakeAllStatus.NOT_READY;
};

export default function useUnstakeAll(stakingBalances: ContractBalance[]) {
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

    const unstakeAll = useCallback(async (successCallback: () => void) => {
        const api = new FarmingContractApi(library!);
        setStatus(UnstakeAllStatus.UNSTAKING);
        try {
            await api.unstakeAll(stakingBalances);
            successCallback();
            setStatus(UnstakeAllStatus.NOT_READY);
            enqueueSnackbar('Unstaking operation sent to blockchain', {variant: 'success'});
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
