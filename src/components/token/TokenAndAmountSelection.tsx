import React from 'react';
import { Card, CardContent, Grid } from '@material-ui/core';
import AmountToWrapInput from './AmountToWrapInput';
import BigNumber from 'bignumber.js';
import TokenSelection from './TokenSelection';
import { SupportedBlockchain } from '../../features/wallet/blockchain';
import { TokenMetadata } from '../../features/swap/token';

export type TokenAndAmountSelectionProps = {
  tokens: Record<string, TokenMetadata>;
  displayBalance: boolean;
  amount: BigNumber;
  onAmountChange: (v: BigNumber) => void;
  token: string;
  onTokenChange: (v: string) => void;
  balance: BigNumber;
  blockchainTarget: SupportedBlockchain;
};

export default function TokenAndAmountSelection({
  tokens,
  balance,
  displayBalance,
  amount,
  onAmountChange,
  token,
  onTokenChange,
  blockchainTarget,
}: TokenAndAmountSelectionProps) {
  return (
    <Card variant={'outlined'}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <AmountToWrapInput
              balance={balance}
              decimals={tokens[token]?.decimals}
              symbol={
                blockchainTarget === SupportedBlockchain.Tezos
                  ? tokens[token]?.tezosSymbol
                  : tokens[token]?.ethereumSymbol
              }
              onChange={onAmountChange}
              amountToWrap={amount}
              displayBalance={displayBalance}
            />
          </Grid>
          <Grid item xs={6}>
            <TokenSelection
              token={token}
              onTokenSelect={onTokenChange}
              tokens={tokens}
              blockchainTarget={blockchainTarget}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
