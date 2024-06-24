import {PaperActions, PaperContent, PaperHeader, PaperNav, PaperTitle,} from '../../../components/paper/Paper';
import {createStyles, IconButton, makeStyles, Typography,} from '@material-ui/core';
import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import BigNumber from 'bignumber.js';
import {TokenMetadata} from '../../swap/token';
import {wrapFees} from '../../fees/fees';
import {Fees} from '../../../config';
import WrapActions from './WrapActions';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import LabelAndAsset from '../../../components/formatting/LabelAndAsset';
import AssetSummary from '../../../components/formatting/AssetSummary';
import LabelAndValue from '../../../components/formatting/LabelAndValue';
import {WrapStatus} from '../hooks/reducer';

const useStyles = makeStyles(() =>
    createStyles({
        description: {
            paddingLeft: '20px',
            fontWeight: 'bold',
        },
        background: {
            backgroundColor: '#C4C4C4',
        },
        paddingZero: {
            padding: '0',
        },
        acknowledge: {},
    })
);

export type WrapConfirmStepProps = {
    token: TokenMetadata;
    fees: Fees;
    sendingAddress: string;
    recipientAddress: string;
    amount: BigNumber;
    onPrevious: () => void;
    status: WrapStatus;
    currentAllowance: BigNumber;
    onAuthorize: () => void;
    onWrap: () => void;
    networkFees: BigNumber;
    onAgreementChange: (v: boolean) => void;
};

export default function WrapConfirmStep({
                                            onPrevious,
                                            amount,
                                            fees,
                                            token,
                                            status,
                                            currentAllowance,
                                            sendingAddress,
                                            recipientAddress,
                                            onAuthorize,
                                            onWrap,
                                            networkFees,
                                            onAgreementChange,
                                        }: WrapConfirmStepProps) {
    const classes = useStyles();
    const currentFees = wrapFees(amount, fees);

    const [checked, setChecked] = React.useState(false);
    const [disabled, setDisabled] = React.useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setChecked(e.target.checked);
        onAgreementChange(e.target.checked);
    }

    React.useEffect(() => {
        const check =
            status === WrapStatus.READY_TO_WRAP ||
            status === WrapStatus.WAITING_FOR_WRAP;
        setChecked(check);
        setDisabled(check);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <PaperHeader>
                <PaperNav>
                    <IconButton onClick={onPrevious}>
                        <ArrowBackIcon/>
                    </IconButton>
                </PaperNav>
                <PaperTitle>Confirm</PaperTitle>
                <PaperActions/>
            </PaperHeader>

            <PaperContent>
                <Typography variant={'body2'} className={classes.description}>
                    Details
                </Typography>
                <LabelAndAsset
                    label={'Send'}
                    decimals={token.decimals}
                    value={amount}
                    symbol={token.ethereumSymbol}
                />
                <LabelAndValue label={'From'} value={sendingAddress}/>
                <LabelAndValue label={'To'} value={recipientAddress}/>
            </PaperContent>
            <PaperContent className={classes.background}>
                <Typography variant={'body2'} className={classes.description}>
                    Fees
                </Typography>
                <LabelAndAsset
                    label={'Wrap fees'}
                    decimals={token.decimals}
                    value={currentFees}
                    symbol={token.tezosSymbol}
                />
                <LabelAndAsset
                    label={'Network fees (est.)'}
                    decimals={18}
                    value={networkFees}
                    symbol={'ETH'}
                    emptyState={networkFees.lte(0)}
                    emptyStatePlaceHolder={'Awaiting for allowance'}
                />
            </PaperContent>

            <PaperContent className={classes.paddingZero}>
                <AssetSummary
                    label={'You will receive'}
                    value={amount.minus(currentFees)}
                    decimals={token.decimals}
                    symbol={token.tezosSymbol}
                />
            </PaperContent>
            <PaperContent style={{display: 'flex', padding: '20px 26px 0px 26px'}}>
                <Checkbox
                    disabled={disabled}
                    checked={checked}
                    onChange={handleChange}
                />
                <Typography variant={'caption'}>
                    I acknowledge the fees and that this transaction will require XTZ to
                    finalize minting
                </Typography>
            </PaperContent>
            <WrapActions
                currentAllowance={currentAllowance}
                amountToWrap={amount}
                decimals={token.decimals}
                onAuthorize={onAuthorize}
                onWrap={onWrap}
                status={status}
                token={token.ethereumSymbol}
            />
        </>
    );
}
