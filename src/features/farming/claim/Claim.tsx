import {FarmingContractActionsProps} from '../types';
import useClaim, {ClaimStatus} from './hook/useClaim';
import React, {useCallback} from 'react';
import {PaperFooter} from '../../../components/paper/Paper';
import LoadableButton from '../../../components/button/LoadableButton';
import WalletConnection from '../../../components/tezos/WalletConnection';
import FarmingContractInfo from '../../../components/farming/FarmingContractInfo';
import AssetSummary from '../../../components/form/AssetSummary';
import FarmingContractHeader from '../../../components/farming/FarmingContractHeader';
import {useWalletContext} from '../../../runtime/wallet/WalletContext';
import {paths} from "../../../screens/routes";

export default function Claim({farm, farmBalances, inputBalance, onApply}: FarmingContractActionsProps) {
    const {claim, claimStatus} = useClaim(farm);
    const walletContext = useWalletContext();

    const handleClaim = useCallback(async () => {
        await claim();
        onApply();
    }, [onApply, claim]);

    return (
        <>
            <FarmingContractHeader title={farm.rewardTokenName + " farm"} path={paths.FARMING_ROOT}/>
            <FarmingContractInfo
                farm={farm}
                farmBalances={farmBalances}
                inputBalance={inputBalance}
            />
            <AssetSummary
                decimals={farm.rewardTokenDecimals}
                symbol={farm.rewardTokenSymbol}
                label={'You will receive (estimate)'}
                value={farmBalances.reward}
            />
            <PaperFooter>
                {claimStatus !== ClaimStatus.NOT_CONNECTED && (
                    <LoadableButton
                        loading={claimStatus === ClaimStatus.CLAIMING}
                        onClick={handleClaim}
                        disabled={claimStatus !== ClaimStatus.READY}
                        text={'Claim'}
                        variant={'contained'}
                    />
                )}
                {claimStatus === ClaimStatus.NOT_CONNECTED && (
                    <WalletConnection withConnectionStatus={false} account={walletContext.tezos.account}
                                      connectionStatus={walletContext.tezos.status}
                                      activate={walletContext.tezos.activate}
                                      deactivate={walletContext.tezos.deactivate}/>
                )}
            </PaperFooter>
        </>
    );
}
