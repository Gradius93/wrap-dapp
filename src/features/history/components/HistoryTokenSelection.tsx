import {SupportedBlockchain} from '../../wallet/blockchain';
import EthereumTokenIcon from '../../../components/token/ethereum/EthereumTokenIcon';
import TezosTokenIcon from '../../../components/token/tezos/TezosTokenIcon';
import React from 'react';
import {TokenMetadata} from '../../swap/token';

type IconProps = {
    blockchainTarget: SupportedBlockchain;
    tokenMetadata: TokenMetadata;
}

export default function IconSelect({
                                       blockchainTarget,
                                       tokenMetadata
                                   }: IconProps) {
    return (
        blockchainTarget === SupportedBlockchain.Ethereum ? (
            <EthereumTokenIcon
                tokenMetadata={tokenMetadata}
            />
        ) : (
            <TezosTokenIcon tokenMetadata={tokenMetadata}/>
        )
    )
}
