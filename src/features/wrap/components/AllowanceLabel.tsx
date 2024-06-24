import {makeStyles, Typography} from '@material-ui/core';
import React from 'react';
import BigNumber from 'bignumber.js';
import {formatOptions} from '../../../components/formatting/numberFormat';
import NumberFormat from 'react-number-format';

type Props = {
    currentAllowance: BigNumber;
    balanceToWrap: BigNumber;
    decimals: number;
    symbol: string;
};

const useStyles = makeStyles(() => ({
    helperText: {
        color: '#000000',
        display: 'block',
        position: 'relative',
        fontWeight: 400,
        fontSize: 10,
    },
}));

export default function AllowanceLabel({
                                           currentAllowance,
                                           balanceToWrap,
                                           decimals,
                                           symbol,
                                       }: Props) {
    const classes = useStyles();

    return (
        <div>
            <Typography variant="caption" className={classes.helperText}>
                Current Allowance:{' '}
                <NumberFormat
                    displayType="text"
                    suffix={` ${symbol}`}
                    {...formatOptions}
                    value={currentAllowance.shiftedBy(-decimals).toString()}
                />
            </Typography>
            <Typography variant="caption" className={classes.helperText}>
                The locking contract will be allowed to spend{' '}
                <NumberFormat
                    displayType="text"
                    suffix={` ${symbol}`}
                    {...formatOptions}
                    value={balanceToWrap.shiftedBy(-decimals).toString()}
                />{' '}
                on your behalf.
            </Typography>
        </div>
    );
}
