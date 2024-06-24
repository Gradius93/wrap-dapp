import {PaperContent, PaperFooter} from '../../../components/paper/Paper';
import AmountToWrapInput from '../../../components/form/AmountToWrapInput';
import LoadableButton from '../../../components/button/LoadableButton';
import AssetSummary from '../../../components/form/AssetSummary';
import useStake, {StakingStatus} from './hook/useStake';
import WalletConnection from '../../../components/tezos/WalletConnection';
import React, {useCallback} from 'react';
import {FarmingContractActionsProps} from '../types';
import FarmingContractInfo from '../../../components/farming/FarmingContractInfo';
import FarmingContractHeader from '../../../components/farming/FarmingContractHeader';
import {useWalletContext} from '../../../runtime/wallet/WalletContext';
import {paths} from "../../../screens/routes";


export default function Stake({farm, farmBalances, onApply, inputBalance}: FarmingContractActionsProps) {
    const {amount, changeAmount, stakingStatus, stake} = useStake(
        farm,
        inputBalance.value
    );

    const handleStake = useCallback(async () => {
        await stake();
        onApply();
    }, [onApply, stake]);

    const walletContext = useWalletContext();

    return (
        <>
            <FarmingContractHeader title={farm.rewardTokenName + " farm"} path={paths.FARMING_ROOT}/>
            <PaperContent>
                <AmountToWrapInput
                    balance={inputBalance.value}
                    decimals={farm.farmStakedToken.decimals}
                    symbol={farm.farmStakedToken.symbol}
                    onChange={changeAmount}
                    amountToWrap={amount}
                    balanceLoading={inputBalance.loading}
                    disabled={
                        stakingStatus === StakingStatus.NOT_CONNECTED ||
                        inputBalance.value.isZero() ||
                        inputBalance.value.isNaN()
                    }
                />
            </PaperContent>
            <FarmingContractInfo
                farm={farm}
                farmBalances={farmBalances}
                inputBalance={inputBalance}
            />
            <AssetSummary
                decimals={farm.farmStakedToken.decimals}
                symbol={farm.farmStakedToken.symbol}
                label={'Your new share will be'}
                value={amount.plus(farmBalances.staked)}
            />
            <PaperFooter>
                {stakingStatus !== StakingStatus.NOT_CONNECTED && (

                    <LoadableButton
                        loading={stakingStatus === StakingStatus.STAKING}
                        onClick={handleStake}
                        disabled={stakingStatus !== StakingStatus.READY}
                        text={'Stake'}
                        variant={'contained'}
                    />
                )}
                {stakingStatus === StakingStatus.NOT_CONNECTED && (
                    <WalletConnection withConnectionStatus={false} account={walletContext.tezos.account}
                                      connectionStatus={walletContext.tezos.status}
                                      activate={walletContext.tezos.activate}
                                      deactivate={walletContext.tezos.deactivate}/>
                )}
            </PaperFooter>
        </>
    );
}
