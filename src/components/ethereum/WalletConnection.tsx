import React from 'react';
import {useSnackbar} from 'notistack';
import errorMessage from '../../features/ethereum/errorMessage';
import WalletConnectionCard from '../wallet/WalletConnectionCard';
import {ProviderList, SupportedBlockchain,} from '../../features/wallet/blockchain';
import {EthConnectors} from '../../features/ethereum/connectorsFactory';
import {ConnectionStatus} from '../../features/wallet/connectionStatus';

type Props = {
    activate: (connectorKey: string) => Promise<void>;
    deactivate: () => void;
    account: string | null | undefined;
    connectors: EthConnectors;
    connectionStatus: ConnectionStatus;
    withConnectionStatus: boolean;
};

export default function WalletConnection({
                                             activate,
                                             deactivate,
                                             account,
                                             connectors,
                                             connectionStatus,
                                             withConnectionStatus,
                                         }: Props) {
    const {enqueueSnackbar} = useSnackbar();
    const providers: ProviderList = Object.entries(connectors).map<{
        name: string;
        key: string;
        icon: string;
    }>(([key, value]) => ({name: value.name, key, icon: value.iconName}));

    const onStartConnection = (key: string) => {
        activate(key).catch((error) => {
            const {message, variant} = errorMessage(error);
            enqueueSnackbar(message, {variant});
        });
    };

    const onDisconnect = () => {
        deactivate();
    };

    return (
        <React.Fragment>
            <WalletConnectionCard
                blockchain={SupportedBlockchain.Ethereum}
                connectionStatus={connectionStatus}
                providers={providers}
                onSelectedProvider={onStartConnection}
                onDisconnection={onDisconnect}
                account={account}
                withConnectionStatus={withConnectionStatus}
            />
        </React.Fragment>
    );
}
