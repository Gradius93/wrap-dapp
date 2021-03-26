import React from 'react';
import TokenAndAmountSelection from './components/TokenAndAmountSelection';
import { Box } from '@material-ui/core';
import MultiConnect from '../wallet/MultiConnect';
import WrapActions from './components/WrapActions';
import { useWrap } from './hooks/useWrap';
import WrapFees from './components/WrapFees';

export default function WrapCard() {
  const {
    status,
    amountToWrap,
    currentAllowance,
    currentBalance,
    token,
    decimals,
    launchAllowanceApproval,
    selectAmountToWrap,
    selectToken,
    launchWrap,
    connected,
    fungibleTokens,
    fees,
  } = useWrap();

  return (
    <Box>
      <TokenAndAmountSelection
        tokens={fungibleTokens}
        balance={currentBalance}
        displayBalance={connected}
        amount={amountToWrap}
        onAmountChange={selectAmountToWrap}
        token={token}
        onTokenChange={selectToken}
      />
      <Box mt={2}>
        <WrapFees
          fees={fees}
          decimals={decimals}
          symbol={token}
          amountToWrap={amountToWrap}
        />
      </Box>
      {!connected && <MultiConnect />}
      {connected && (
        <WrapActions
          amountToWrap={amountToWrap}
          currentAllowance={currentAllowance}
          token={token}
          decimals={decimals}
          status={status}
          onAuthorize={launchAllowanceApproval}
          onWrap={launchWrap}
        />
      )}
    </Box>
  );
}
