import React, {useEffect, useState} from 'react';
import {formatAmount} from '../../features/ethereum/token';
import BigNumber from 'bignumber.js';
import AmountInputToken from '../form/AmountInputToken';
import {Link} from '@material-ui/core';
import {createStyles, makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
    createStyles({
        maxLink: {
            cursor: 'pointer',
        },
    })
);

type Props = {
    balance: { value: BigNumber; loading: boolean };
    decimals: number;
    symbol: string;
    onChange: (amount: BigNumber) => void;
    amountToWrap: BigNumber;
    displayBalance: boolean;
};

export default function AmountToWrapInput({
                                              balance,
                                              amountToWrap,
                                              decimals,
                                              symbol,
                                              onChange,
                                              displayBalance,
                                          }: Props) {
    const [[error, helperText], setUserError] = useState<[boolean, string]>([
        false,
        '',
    ]);
    const classes = useStyles();
    const displayMax = !balance.value.isNaN() && displayBalance;

    useEffect(() => {
        if (!displayBalance) {
            setUserError([false, '']);
            return;
        }
        if (balance.loading) {
            setUserError([false, 'Your balance is loading...']);
            return;
        }

        if (amountToWrap.gt(balance.value)) {
            setUserError([
                true,
                `Insufficient balance of ${formatAmount(
                    symbol,
                    balance.value,
                    decimals
                )}`,
            ]);
            return;
        }
        setUserError([
            false,
            `Balance: ${
                balance.value.isNaN()
                    ? ''
                    : formatAmount(symbol, balance.value, decimals)
            }`,
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [decimals, symbol, displayBalance, balance, error]);

    const handleOnChange = (v: string) => {
        if (error) {
            setUserError([false, '']);
        }
        const newAmount = new BigNumber(v).shiftedBy(decimals);
        if (displayBalance && newAmount.gt(balance.value)) {
            setUserError([
                true,
                `Insufficient balance of ${formatAmount(
                    symbol,
                    balance.value,
                    decimals
                )}`,
            ]);
        }
        onChange(newAmount);
    };

    const setMax = () => {
        onChange(balance.value);
    };

    return (
        <>
            <AmountInputToken
                value={amountToWrap?.shiftedBy(-decimals).toString()}
                decimals={decimals}
                symbol={symbol}
                onChange={handleOnChange}
                error={error}
                focus
                helperText={
                    <>
                        {helperText}
                        {displayMax && (
                            <>
                                &nbsp;
                                <Link
                                    color={'textPrimary'}
                                    className={classes.maxLink}
                                    onClick={setMax}
                                >
                                    (Max)
                                </Link>
                            </>
                        )}
                    </>
                }
            />
        </>
    );
}
