import BigNumber from 'bignumber.js';
import {TokenMetadata} from '../../swap/token';
import {Fees} from '../../../config';
import React, {useEffect, useState} from 'react';
import {wrapFees} from '../../fees/fees';
import {PaperContent} from '../../../components/paper/Paper';
import TokenSelection from '../../../components/token/TokenSelection';
import {SupportedBlockchain} from '../../wallet/blockchain';
import AmountToWrapInput from '../../../components/token/AmountToWrapInput';
import AssetSummary from '../../../components/formatting/AssetSummary';
import {Button, createStyles, makeStyles} from '@material-ui/core';
import MultiConnect from '../../wallet/MultiConnect';
import {UnwrapStatus} from '../hooks/reducer';

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            borderBottom: '3px solid #E0E0E0',
            boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.25)',
        },
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

export type UnwrapInitialStepProps = {
    status: UnwrapStatus;
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

export default function UnwrapInitialStep({
                                              amount,
                                              balance,
                                              connected,
                                              fees,
                                              onAmountChange,
                                              onNext,
                                              onTokenChange,
                                              status,
                                              token,
                                              tokens,
                                          }: UnwrapInitialStepProps) {
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
                    blockchainTarget={SupportedBlockchain.Tezos}
                    tokens={tokens}
                />
                <AmountToWrapInput
                    balance={balance}
                    decimals={token.decimals}
                    symbol={token.tezosSymbol}
                    onChange={onAmountChange}
                    amountToWrap={amount}
                    displayBalance={connected}
                />
            </PaperContent>
            <PaperContent style={{padding: '16px 0'}}>
                <AssetSummary
                    label={'You will receive'}
                    value={amount.minus(currentFees)}
                    symbol={token.ethereumSymbol}
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
                        disabled={status !== UnwrapStatus.READY_TO_CONFIRM}
                    >
                        Next →
                    </Button>
                )}
            </PaperContent>
        </>
    );
}
