import {Step, StepLabel, Stepper} from '@material-ui/core';
import TezosWalletConnection from '../../components/tezos/WalletConnection';
import EthWalletConnection from '../../components/ethereum/WalletConnection';
import React from 'react';
import {useWalletContext} from '../../runtime/wallet/WalletContext';
import CustomConnector from '../../components/stepper/CustomConnector';
import CustomStepIcon from '../../components/stepper/CustomStepIcon';

export default function MultiConnect() {
    const {
        ethereum: {
            activate: ethActivate,
            deactivate: ethDeactivate,
            account: ethAccount,
            connectors: ethConnectors,
            status: ethConnectionStatus,
        },
        tezos: {
            activate: tzActivate,
            deactivate: tzDeactivate,
            status: tzConnectionStatus,
            account: tzAccount,
        },
    } = useWalletContext();

    const activeStep = () => {
        if (tzAccount && ethAccount) {
            return 2;
        }
        if (tzAccount) {
            return 1;
        }
        return 0;
    };

    return (
        <Stepper
            style={{
                backgroundColor: '#E5E5E5',
                padding: '24px 0px',
            }}
            alternativeLabel
            activeStep={activeStep()}
            connector={<CustomConnector/>}
        >
            <Step>
                <StepLabel StepIconComponent={CustomStepIcon}>
                    <TezosWalletConnection
                        account={tzAccount}
                        activate={tzActivate}
                        deactivate={tzDeactivate}
                        connectionStatus={tzConnectionStatus}
                        withConnectionStatus={false}
                    />
                </StepLabel>
            </Step>
            <Step>
                <StepLabel StepIconComponent={CustomStepIcon}>
                    <EthWalletConnection
                        account={ethAccount}
                        activate={ethActivate}
                        deactivate={ethDeactivate}
                        connectors={ethConnectors}
                        connectionStatus={ethConnectionStatus}
                        withConnectionStatus={false}
                    />
                </StepLabel>
            </Step>
        </Stepper>
    );
}
