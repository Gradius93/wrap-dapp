import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from '../../../components/paper/Paper';
import { IconButton, Typography } from '@material-ui/core';
import React from 'react';
import BigNumber from 'bignumber.js';
import { TokenMetadata } from '../../swap/token';
import { wrapFees } from '../../fees/fees';
import { Fees } from '../../../config';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import LabelAndAsset from '../../../components/formatting/LabelAndAsset';
import AssetSummary from '../../../components/formatting/AssetSummary';
import LabelAndValue from '../../../components/formatting/LabelAndValue';
import { UnwrapStatus } from '../hooks/useUnwrap';
import UnwrapActions from './UnwrapActions';

export type UnwrapConfirmStepProps = {
  token: TokenMetadata;
  fees: Fees;
  sendingAddress: string;
  recipientAddress: string;
  amount: BigNumber;
  onPrevious: () => void;
  status: UnwrapStatus;
  onUnwrap: () => void;
};

export default function UnwrapConfirmStep({
  onPrevious,
  amount,
  fees,
  token,
  status,
  sendingAddress,
  recipientAddress,
  onUnwrap,
}: UnwrapConfirmStepProps) {
  const currentFees = wrapFees(amount, fees);
  return (
    <>
      <PaperHeader style={{ backgroundColor: '#E5E5E5',
        fontSize: '20px', fontWeight: 'bold', boxShadow: 'inset 0 -7px 9px -7px rgba(0,0,0,0.4)'}}>
        <PaperNav>
          <IconButton onClick={onPrevious}>
            <ArrowBackIcon />
          </IconButton>
        </PaperNav>
        <PaperTitle>Confirm</PaperTitle>
        <PaperActions />
      </PaperHeader>

      <PaperContent>
        <Typography variant={'body2'} style={{ paddingLeft: '20px', fontWeight: 'bold'}}>Details</Typography>
        <LabelAndAsset
          label={'Send'}
          decimals={token.decimals}
          value={amount}
          symbol={token.tezosSymbol}
        />
        <LabelAndValue label={'From'} value={sendingAddress} />
        <LabelAndValue label={'To'} value={recipientAddress} />
      </PaperContent>
      <PaperContent style={{ backgroundColor: '#C4C4C4'}}>
        <Typography variant={'body2'}>Fees</Typography>
        <LabelAndAsset
          label={'Wrap fees'}
          decimals={token.decimals}
          value={currentFees}
          symbol={token.tezosSymbol}
        />
        <LabelAndAsset
          label={'Network fees'}
          decimals={token.decimals}
          value={currentFees}
          symbol={token.tezosSymbol}
        />
      </PaperContent>
      <PaperContent style={{ padding: '0' }}>
        <AssetSummary
          label={'Receive'}
          value={amount.minus(currentFees)}
          decimals={token.decimals}
          symbol={token.ethereumSymbol}
        />
      </PaperContent>
      <PaperContent style={{ borderRadius: '0 0 10px 10px', minHeight: '70px', padding: '20px 90px'}}>

        <UnwrapActions onUnwrap={onUnwrap} status={status} />
      </PaperContent>
    </>
  );
}
