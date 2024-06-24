import {PaperContent, PaperFooter} from '../../../components/paper/Paper';
import AmountToWrapInput from '../../../components/form/AmountToWrapInput';
import AssetSummary from '../../../components/form/AssetSummary';
import LoadableButton from '../../../components/button/LoadableButton';
import WalletConnection from '../../../components/tezos/WalletConnection';
import useUnstake, {UnstakeStatus} from './hook/useUnstake';
import React, {useCallback} from 'react';
import {FarmingContractActionsProps} from '../types';
import FarmingContractInfo from '../../../components/farming/FarmingContractInfo';
import FarmingContractHeader from '../../../components/farming/FarmingContractHeader';
import {useWalletContext} from "../../../runtime/wallet/WalletContext";
import {paths} from "../../../screens/routes";

export function Unstake({farm, onApply, farmBalances, inputBalance}: FarmingContractActionsProps) {
    const {unstakeStatus, amount, changeAmount, unstake} = useUnstake(
        farm,
        farmBalances.staked
    );

    const handleWithdrawal = useCallback(async () => {
        await unstake();
        onApply();
    }, [onApply, unstake]);

    const walletContext = useWalletContext();

    return (
        <>
            <FarmingContractHeader title={farm.rewardTokenName + " farm"} path={paths.FARMING_ROOT}/>
            <PaperContent>
                <AmountToWrapInput
                    balance={farmBalances.staked}
                    decimals={farm.farmStakedToken.decimals}
                    symbol={"Staked " + farm.farmStakedToken.symbol}
                    onChange={changeAmount}
                    amountToWrap={amount}
                    balanceLoading={inputBalance.loading}
                    disabled={
                        unstakeStatus === UnstakeStatus.NOT_CONNECTED ||
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
                value={farmBalances.staked.minus(amount)}
            />
            <PaperFooter>

                {unstakeStatus !== UnstakeStatus.NOT_CONNECTED && (
                    <LoadableButton
                        loading={unstakeStatus === UnstakeStatus.UNSTAKING}
                        onClick={handleWithdrawal}
                        disabled={unstakeStatus !== UnstakeStatus.READY}
                        text={'Unstake'}
                        variant={'contained'}
                    />
                )}
                {unstakeStatus === UnstakeStatus.NOT_CONNECTED && (
                    <WalletConnection withConnectionStatus={false} account={walletContext.tezos.account}
                                      connectionStatus={walletContext.tezos.status}
                                      activate={walletContext.tezos.activate}
                                      deactivate={walletContext.tezos.deactivate}/>
                )}
            </PaperFooter>
        </>
    );
}
