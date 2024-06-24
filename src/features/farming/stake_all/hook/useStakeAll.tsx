import {useCallback, useEffect, useState} from "react";
import FarmingContractApi from "../../api/FarmingContractApi";
import {useSnackbar} from "notistack";
import {useWalletContext} from "../../../../runtime/wallet/WalletContext";
import {ConnectionStatus} from "../../../wallet/connectionStatus";
import BigNumber from "bignumber.js";

export interface NewStake {
    amount: string;
    contract: string;
    farmStakedToken: string;
    stakeDecimals: number;
}

export enum StakeAllStatus {
    NOT_CONNECTED = 'NOT_CONNECTED',
    NOT_READY = 'NOT_READY',
    READY = 'READY',
    UNSTAKING = 'UNSTAKING',
}

const nextStatus = (newStakes: NewStake[]) => {
    const balance = newStakes.reduce((acc, elt) => {
        const amount = new BigNumber(elt.amount);
        return amount.isNaN() ? acc : acc.plus(amount);
    }, new BigNumber(0));

    if (balance.gt(0)) {
        return StakeAllStatus.READY;
    }
    return StakeAllStatus.NOT_READY;
};

export default function useStakeAll(newStakes: NewStake[]) {
    const walletContext = useWalletContext();
    const {status, library, account} = walletContext.tezos;
    const {enqueueSnackbar} = useSnackbar();
    const connected =
        status === ConnectionStatus.CONNECTED && account !== undefined;
    const [stakeAllStatus, setStatus] = useState(StakeAllStatus.NOT_CONNECTED);

    useEffect(() => {
        if (!connected) {
            setStatus(StakeAllStatus.NOT_CONNECTED);
            return;
        }
        setStatus(nextStatus(newStakes));
    }, [connected, newStakes]);

    const stakeAll = useCallback(async (newStakes: NewStake[], successCallback: (newStakes: NewStake[]) => void) => {
        const api = new FarmingContractApi(library!);
        setStatus(StakeAllStatus.UNSTAKING);
        try {
            await api.stakeAll(newStakes, account!);
            successCallback(newStakes);
            setStatus(StakeAllStatus.NOT_READY);
            enqueueSnackbar('Staking operation sent to blockchain', {variant: 'success'});
        } catch (error) {
            enqueueSnackbar(error.description, {variant: 'error'});
            setStatus(StakeAllStatus.READY);
        }
    }, [library, enqueueSnackbar]);

    return {
        stakeAllStatus,
        stakeAll
    }
}