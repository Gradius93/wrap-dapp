import React from 'react';
import BigNumber from 'bignumber.js';
import LabelAndValue from './LabelAndValue';
import {formatOptions} from './numberFormat';
import NumberFormat from 'react-number-format';

export type LabelAndAssetProps = {
    label: string;
    value: BigNumber;
    decimals: number;
    symbol: string;
    emptyState?: boolean;
    emptyStatePlaceHolder?: string;
};

export default function LabelAndAsset({
                                          label,
                                          value,
                                          symbol,
                                          decimals,
                                          emptyState = false,
                                          emptyStatePlaceHolder = '',
                                      }: LabelAndAssetProps) {
    return (
        <LabelAndValue
            label={label}
            value={
                emptyState ? (
                    emptyStatePlaceHolder
                ) : (
                    <NumberFormat
                        displayType="text"
                        suffix={` ${symbol}`}
                        {...formatOptions}
                        value={value.shiftedBy(-decimals).toString(10)}
                    />
                )
            }
        />
    );
}
