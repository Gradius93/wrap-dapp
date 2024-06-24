import BigNumber from 'bignumber.js';
import {Typography} from '@material-ui/core';
import React from 'react';
import NumberFormat from 'react-number-format';
import {makeStyles} from '@material-ui/core/styles';
import {formatOptions} from './numberFormat';

const useStyle = makeStyles((theme) => ({
    root: {
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: '#343434',
        color: '#FFFFFF',
        padding: '10px 0px',
    },
    wrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 26px',
    },

    label: {
        width: '35%',
        fontSize: 12,
    },

    valueWrapper: {
        flexGrow: 2,
        color: '#FFD000',
        fontSize: 20,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        textAlign: 'right',
    },
}));

export type AssetSummaryProps = {
    label: string;
    value: BigNumber;
    decimals: number;
    symbol: string;
};

export default function AssetSummary({
                                         label,
                                         symbol,
                                         value,
                                         decimals,
                                     }: AssetSummaryProps) {
    const classes = useStyle();
    return (
        <div className={classes.root}>
            <div className={classes.wrapper}>
                <Typography component="span" className={classes.label}>
                    {label}
                </Typography>
                <NumberFormat
                    className={classes.valueWrapper}
                    displayType="text"
                    suffix={` ${symbol}`}
                    {...formatOptions}
                    value={value.shiftedBy(-decimals).toString(10)}
                />
            </div>
        </div>
    );
}
