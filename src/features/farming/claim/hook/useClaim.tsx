import {useWalletContext} from '../../../../runtime/wallet/WalletContext';
import {useCallback, useEffect, useState} from 'react';
import {useSnackbar} from 'notistack';
import FarmingContractApi from '../../api/FarmingContractApi';
import {FarmConfig} from '../../../../config';
import {ConnectionStatus} from '../../../wallet/connectionStatus';

export enum ClaimStatus {
    NOT_CONNECTED = 'NOT_CONNECTED',
    READY = 'READY',
    CLAIMING = 'CLAIMING',
}

export default function useClaim(farm: FarmConfig) {
    const walletContext = useWalletContext();
    const {status, library, account} = walletContext.tezos;
    const [claimStatus, setStatus] = useState(ClaimStatus.NOT_CONNECTED);
    const connected =
        status === ConnectionStatus.CONNECTED && account !== undefined;
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (!connected) {
            setStatus(ClaimStatus.NOT_CONNECTED);
            return;
        }
        setStatus(ClaimStatus.READY);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected]);

    const claim = useCallback(async () => {
        const api = new FarmingContractApi(library!);
        setStatus(ClaimStatus.CLAIMING);
        try {
            await api.claim(farm.farmContractAddress);
            setStatus(ClaimStatus.READY);
            enqueueSnackbar('Claiming done', {variant: 'success'});
        } catch (error) {
            enqueueSnackbar(error.description, {variant: 'error'});
            setStatus(ClaimStatus.READY);
        }
    }, [library, farm.farmContractAddress, enqueueSnackbar]);

    return {
        claimStatus,
        claim,
    };
}
