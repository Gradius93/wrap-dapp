import {
    NoEthereumProviderError,
    UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import {UserRejectedRequestError as UserRejectedRequestErrorWalletConnect} from '@web3-react/walletconnect-connector';
import {UnsupportedChainIdError} from '@web3-react/core';

export interface ErrorMessage {
    message: string;
    variant: 'default' | 'error' | 'success' | 'warning' | 'info';
}

export default function errorMessage(error: Error): ErrorMessage {
    switch (error.constructor) {
        case NoEthereumProviderError:
            return {
                message:
                    'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.',
                variant: 'warning',
            };
        case UnsupportedChainIdError:
            return {
                message: "You're connected to an unsupported network.",
                variant: 'error',
            };
        case UserRejectedRequestErrorInjected:
        case UserRejectedRequestErrorWalletConnect:
            return {
                message:
                    'Please authorize this website to access your Ethereum account.',
                variant: 'warning',
            };
        default:
            return {
                message: error.message,
                variant: 'error',
            };
    }
}
