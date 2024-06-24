import React, {useState} from 'react';
import {Button, darken, makeStyles} from '@material-ui/core';
import {humanizeSupportedBlockchain, ProviderList, SupportedBlockchain,} from '../../features/wallet/blockchain';
import {ConnectionStatus} from '../../features/wallet/connectionStatus';
import ProviderSelectionDialog from './ProviderSelectionDialog';
import EthereumIcon from '../ethereum/Icon';
import TezosIcon from '../tezos/Icon';
import ConnectIcon from './icons/ConnectIcon';
import {ellipsizeAddress} from '../../features/wallet/address';

const useStyles = makeStyles((theme) => ({
    connectionButton: {
        backgroundColor: '#FFFFFF',
        textTransform: 'none',
        fontWeight: 900,
        fontSize: '0.9rem',
        borderRadius: '25px',
        padding: '3px 25px',
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
        },
        '&.Mui-disabled': {
            color: '#B1B1B1',
        },
    },
    connectedConnectionButton: {
        backgroundColor: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: darken(theme.palette.primary.main, 0.1),
        },
    },
}));

const blockchainIcon = (blockchain: SupportedBlockchain) =>
    blockchain === SupportedBlockchain.Ethereum ? (
        <EthereumIcon/>
    ) : (
        <TezosIcon/>
    );

type Props = {
    blockchain: SupportedBlockchain;
    connectionStatus: ConnectionStatus;
    providers: ProviderList;
    onSelectedProvider: (key: string) => void;
    onDisconnection: () => void;
    account: string | null | undefined;
    withConnectionStatus: boolean;
};

const WalletConnectionCard = ({
                                  blockchain,
                                  connectionStatus,
                                  providers,
                                  onSelectedProvider,
                                  onDisconnection,
                                  account,
                                  withConnectionStatus,
                              }: Props) => {
    const classes = useStyles();
    const [isOpen, setOpen] = useState(false);
    const blockchainName = humanizeSupportedBlockchain(blockchain);
    const handleSelectedProvider = (key: string) => {
        setOpen(false);
        onSelectedProvider(key);
    };
    const handleDisconnection = () => {
        setOpen(false);
        onDisconnection();
    };
    const handleClick = () =>
        blockchain === SupportedBlockchain.Ethereum
            ? setOpen(true)
            : handleSelectedProvider('injected');
    return (
        <React.Fragment>
            {connectionStatus === ConnectionStatus.CONNECTED && account != null ? (
                <Button
                    size="small"
                    className={`${classes.connectionButton} ${classes.connectedConnectionButton}`}
                    startIcon={blockchainIcon(blockchain)}
                    endIcon={null}
                    onClick={handleDisconnection}
                >
                    {ellipsizeAddress(account, 4)}
                </Button>
            ) : (
                <Button
                    size="small"
                    className={classes.connectionButton}
                    disabled={connectionStatus === ConnectionStatus.CONNECTING}
                    startIcon={blockchainIcon(blockchain)}
                    endIcon={withConnectionStatus ? <ConnectIcon/> : null}
                    onClick={handleClick}
                >
                    Connect
                </Button>
            )}
            <ProviderSelectionDialog
                open={isOpen}
                onClose={() => setOpen(false)}
                onSelectedValue={handleSelectedProvider}
                providers={providers}
                blockchain={blockchainName}
            />
        </React.Fragment>
    );
};
export default WalletConnectionCard;
