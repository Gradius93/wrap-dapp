import {formatOptions} from './numberFormat';
import NumberFormat from 'react-number-format';
import React from 'react';
import BigNumber from 'bignumber.js';

type AmountProps = {
    value: BigNumber;
    decimals: number;
    symbol: string;
};

export default function Amount({decimals, symbol, value}: AmountProps) {
    return (
        <NumberFormat
            displayType="text"
            suffix={` ${symbol}`}
            {...formatOptions}
            value={value.shiftedBy(-decimals).toString()}
        />
    );
}
