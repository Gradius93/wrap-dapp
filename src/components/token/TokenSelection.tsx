import {FormControl, FormHelperText, MenuItem, Select,} from '@material-ui/core';
import React from 'react';
import {TokenMetadata} from '../../features/swap/token';
import {SupportedBlockchain} from '../../features/wallet/blockchain';
import EthereumTokenIcon from './ethereum/EthereumTokenIcon';
import TezosTokenIcon from './tezos/TezosTokenIcon';


type Props = {
    token: string;
    onTokenSelect: (token: string) => void;
    blockchainTarget: SupportedBlockchain;
    tokens: Record<string, TokenMetadata>;
};

const itemLabel = (
    blockchainTarget: SupportedBlockchain,
    tokenMetadata: TokenMetadata
) =>
    blockchainTarget === SupportedBlockchain.Ethereum
        ? `${tokenMetadata.ethereumName} (${tokenMetadata.ethereumSymbol})`
        : `${tokenMetadata.tezosName} (${tokenMetadata.tezosSymbol})`;

const itemIcon = (
    blockchainTarget: SupportedBlockchain,
    tokenMetadata: TokenMetadata
) =>
    blockchainTarget === SupportedBlockchain.Ethereum ? (
        <EthereumTokenIcon
            tokenMetadata={tokenMetadata}
        />
    ) : (
        <TezosTokenIcon tokenMetadata={tokenMetadata}/>
    );

function orderTokens(
    tokens: Record<string, TokenMetadata>
): [string, TokenMetadata][] {
    return Object.entries(tokens).sort(([key1, metadata1], [key2, metadata2]) => {
        if (metadata1.ethereumName > metadata2.ethereumName) return 1;
        if (metadata1.ethereumName < metadata2.ethereumName) return -1;
        return 0;
    });
}

export default function TokenSelection({
                                           token,
                                           tokens,
                                           blockchainTarget,
                                           onTokenSelect,
                                       }: Props) {
    const tokenList = orderTokens(tokens);

    const handleTokenSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
        event.preventDefault();
        onTokenSelect(event.target.value as string);
    };

    return (
        <FormControl fullWidth variant={'filled'}>
            <Select
                fullWidth
                value={token}
                onChange={handleTokenSelect}
                displayEmpty
                inputProps={{
                    name: 'token',
                    id: 'token-selector',
                }}
            >
                {tokenList.map(([key, token]) => (
                    <MenuItem value={key} key={key}>
                        {itemIcon(blockchainTarget, token)}
                        {itemLabel(blockchainTarget, token)}
                    </MenuItem>
                ))}
            </Select>
            <FormHelperText>Only supported token are listed</FormHelperText>
        </FormControl>
    );
}




