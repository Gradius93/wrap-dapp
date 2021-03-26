import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { formatAmount } from '../../ethereum/token';
import BigNumber from 'bignumber.js';
import { Fees } from '../../../config';
import { wrapFees } from '../../fees/fees';
import ArrowForwardIosOutlinedIcon from '@material-ui/icons/ArrowForwardIosOutlined';

type Props = {
  fees: Fees;
  decimals: number;
  symbol: string;
  amountToWrap: BigNumber;
};

export default function WrapFees({
  fees,
  amountToWrap,
  decimals,
  symbol,
}: Props) {
  const currentFees = wrapFees(amountToWrap, fees);

  return (
    <Card variant={'outlined'}>
      <CardContent>
        <Grid container alignItems={'center'} justify={'center'}>
          <Grid item xs={5}>
            <Grid container component="dl" spacing={2} direction={'column'}>
              <Grid item>
                <Typography component="dt" variant="caption">
                  Amount
                </Typography>
                <Typography component="dd" variant="body2">
                  {formatAmount(symbol, amountToWrap, decimals)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <ArrowForwardIosOutlinedIcon />
          </Grid>
          <Grid item xs={5}>
            <Grid container component="dl" spacing={2} direction={'column'}>
              <Grid item>
                <Typography component="dt" variant="caption">
                  Fees
                </Typography>
                <Typography component="dd" variant="body2">
                  {formatAmount(symbol, currentFees, decimals)}
                </Typography>
              </Grid>
              <Grid item>
                <Typography component="dt" variant="caption">
                  Wrapped amount
                </Typography>
                <Typography component="dd" variant="body2">
                  {formatAmount(
                    symbol,
                    amountToWrap.minus(currentFees),
                    decimals
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
