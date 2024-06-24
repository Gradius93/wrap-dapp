import React from 'react';
import WalletConnectionCard from '../wallet/WalletConnectionCard';
import {SupportedBlockchain} from '../../features/wallet/blockchain';
import {ConnectionStatus} from '../../features/wallet/connectionStatus';
import {useSnackbar} from 'notistack';

type Props = {
    account: undefined | string;
    connectionStatus: ConnectionStatus;
    activate: () => Promise<void>;
    deactivate: () => Promise<void>;
    withConnectionStatus: boolean;
};

export default function WalletConnection({
                                             account,
                                             connectionStatus,
                                             activate,
                                             deactivate,
                                             withConnectionStatus,
                                         }: Props) {
    const {enqueueSnackbar} = useSnackbar();

    const handleConnection = () => {
        activate().catch((error) => {
            enqueueSnackbar(error.description, {variant: 'error'});
        });
    };

    const handleDisconnection = () => {
        deactivate().catch((error) => {
            enqueueSnackbar(error.description, {variant: 'error'});
        });
    };

    return (
        <React.Fragment>
            <WalletConnectionCard
                blockchain={SupportedBlockchain.Tezos}
                connectionStatus={connectionStatus}
                providers={[{name: 'Beacon', key: 'beacon', icon: ''}]}
                onSelectedProvider={handleConnection}
                onDisconnection={handleDisconnection}
                account={account}
                withConnectionStatus={withConnectionStatus}
            />
        </React.Fragment>
    );
}
