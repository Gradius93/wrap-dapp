import React from 'react';
import {useAllOperationsHistory} from '../../operations/hooks/useAllOperationsHistory';
import HistoryTab from './HistoryTab';
import Operations from './Operations';
import ConnectWallet from '../../../components/formatting/ConnectWallet';

export default function HistoryWrapOperations() {
    const {operations, canFetch, fungibleTokens} = useAllOperationsHistory();
    return (
        <>
            {!canFetch && <ConnectWallet/>}

            {canFetch && (
                <>
                    <HistoryTab/>
                    <Operations
                        operations={operations.mints}
                        canFetch={canFetch}
                        fungibleTokens={fungibleTokens}
                    />
                </>
            )}

        </>
    );
}
