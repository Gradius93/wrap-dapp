import {useWalletContext} from "../../../../runtime/wallet/WalletContext";
import {useCallback, useEffect, useMemo, useState} from "react";
import {ConnectionStatus} from "../../../wallet/connectionStatus";
import {useSnackbar} from "notistack";
import FarmingContractApi, {FarmConfigWithClaimBalances} from "../../api/FarmingContractApi";
import BigNumber from "bignumber.js";
import {FarmConfig} from "../../../../config";

export enum ClaimAllStatus {
    NOT_CONNECTED = 'NOT_CONNECTED',
    NOT_READY = 'NOT_READY',
    READY = 'READY',
    CLAIMING = 'CLAIMING',
}

const nextStatus = (claimBalances: FarmConfigWithClaimBalances[]) => {
    const balance = claimBalances.reduce((acc, elt) => {
        return acc.plus(elt.earned);
    }, new BigNumber(0));

    if (balance.gt(0)) {
        return ClaimAllStatus.READY;
    }
    return ClaimAllStatus.NOT_READY;
};

export default function useClaimAll(farms: FarmConfig[]) {
    const walletContext = useWalletContext();
    const {status, library, account} = walletContext.tezos;
    const connected =
        status === ConnectionStatus.CONNECTED && account !== undefined;
    const [claimAllStatus, setStatus] = useState(ClaimAllStatus.NOT_CONNECTED);
    const [claimBalances, setClaimBalances] = useState<FarmConfigWithClaimBalances[]>([]);
    const {enqueueSnackbar} = useSnackbar();

    const api = useMemo(() => {
        if (typeof library !== "undefined") {
            return new FarmingContractApi(library!);
        }
    }, [library]);

    useEffect(() => {
        if (typeof account !== "undefined" && typeof library !== "undefined" && typeof api !== "undefined") {
            const loadClaimBalances = async () => {
                setClaimBalances(await api.claimBalances(farms, account!));
            };

            if (farms.length > 0 && status === ConnectionStatus.CONNECTED) {
                loadClaimBalances();
            }
        }
    }, [farms, account, status]);

    useEffect(() => {
        if (!connected) {
            setStatus(ClaimAllStatus.NOT_CONNECTED);
            return;
        }
        setStatus(nextStatus(claimBalances));
    }, [connected, claimBalances]);

    const claimAll = useCallback(async (successCallback: () => void) => {
        const api = new FarmingContractApi(library!);
        setStatus(ClaimAllStatus.CLAIMING);
        try {
            await api.claimAll(claimBalances);
            successCallback();
            setStatus(ClaimAllStatus.NOT_READY);
            enqueueSnackbar('Claiming operation sent to blockchain', {variant: 'success'});
        } catch (error) {
            enqueueSnackbar(error.description, {variant: 'error'});
            setStatus(ClaimAllStatus.READY);
        }
    }, [library, claimBalances, enqueueSnackbar]);

    return {
        claimBalances,
        setClaimBalances,
        claimAllStatus,
        claimAll,
    };
};