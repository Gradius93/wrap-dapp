import {PaperContent} from '../../../components/paper/Paper';
import AmountToWrapInput from '../../../components/token/AmountToWrapInput';
import React, {useEffect, useState} from 'react';
import TokenSelection from '../../../components/token/TokenSelection';
import {SupportedBlockchain} from '../../wallet/blockchain';
import BigNumber from 'bignumber.js';
import {TokenMetadata} from '../../swap/token';
import {Fees} from '../../../config';
import {Button, createStyles, makeStyles} from '@material-ui/core';
import {wrapFees} from '../../fees/fees';
import AssetSummary from '../../../components/formatting/AssetSummary';
import MultiConnect from '../../wallet/MultiConnect';
import {WrapStatus} from '../hooks/reducer';

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            borderBottom: '3px solid #E0E0E0',
            boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.25)',
        },
        bodyPadding: {},
        buttonStyle: {
            color: 'black',
            backgroundColor: '#ffffff',
            width: '40%',
            borderRadius: '25px',
            float: 'right',
            boxShadow: 'none',
            textTransform: 'none',
            fontWeight: 900,
            '&:active': {
                boxShadow: 'none',
            },
            '&:hover': {
                backgroundColor: theme.palette.primary.main,
                boxShadow: 'none',
            },
            '&:disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
            },
        },
    })
);

export type WrapInitialStepProps = {
    status: WrapStatus;
    balance: { value: BigNumber, loading: boolean };
    token: TokenMetadata;
    connected: boolean;
    amount: BigNumber;
    fees: Fees;
    onAmountChange: (v: BigNumber) => void;
    onTokenChange: (t: string) => void;
    tokens: Record<string, TokenMetadata>;
    onNext: () => void;
};

export default function WrapInitialStep({
                                            status,
                                            balance,
                                            connected,
                                            onAmountChange,
                                            token,
                                            amount,
                                            onTokenChange,
                                            tokens,
                                            fees,
                                            onNext,
                                        }: WrapInitialStepProps) {
    const [currentFees, setCurrentFees] = useState(new BigNumber(0));

    const classes = useStyles();

    useEffect(() => setCurrentFees(wrapFees(amount, fees)), [amount, fees]);

    return (
        <>
            {!connected && (
                <PaperContent className={classes.title}>
                    <MultiConnect/>
                </PaperContent>
            )}
            <PaperContent style={{padding: '34px 50px 0 50px'}}>
                <TokenSelection
                    token={token.ethereumSymbol}
                    onTokenSelect={onTokenChange}
                    blockchainTarget={SupportedBlockchain.Ethereum}
                    tokens={tokens}
                />
                <AmountToWrapInput
                    balance={balance}
                    decimals={token.decimals}
                    symbol={token.ethereumSymbol}
                    onChange={onAmountChange}
                    amountToWrap={amount}
                    displayBalance={connected}
                />
            </PaperContent>

            <PaperContent style={{padding: '16px 0'}}>
                <AssetSummary
                    label={'You will receive'}
                    value={amount.minus(currentFees)}
                    symbol={token.tezosSymbol}
                    decimals={token.decimals}
                />
            </PaperContent>

            <PaperContent
                style={{
                    borderRadius: '0 0 10px 10px',
                    minHeight: '40px',
                    padding: '50px 30px',
                }}
            >
                {connected && (
                    <Button
                        className={classes.buttonStyle}
                        variant={'contained'}
                        color={'primary'}
                        onClick={onNext}
                        disabled={
                            status !== WrapStatus.READY_TO_CONFIRM &&
                            status !== WrapStatus.READY_TO_WRAP
                        }
                    >
                        Next →
                    </Button>
                )}
            </PaperContent>
        </>
    );
}
