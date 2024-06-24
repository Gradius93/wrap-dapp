export type TokenMetadata = {
    type: 'ERC20' | 'ERC721';
    ethereumName: string;
    ethereumSymbol: string;
    ethereumContractAddress: string;
    decimals: number;
    tezosWrappingContract: string;
    tezosTokenId: number;
    tezosSymbol: string;
    tezosName: string;
    thumbnailUri: string;
};

export type Token = {
    token: string;
} & TokenMetadata;

export const EmptyToken: Token = {
    type: 'ERC20',
    ethereumSymbol: '',
    tezosWrappingContract: '',
    token: '',
    ethereumName: '',
    ethereumContractAddress: '',
    decimals: 0,
    tezosTokenId: 0,
    tezosName: '',
    tezosSymbol: '',
    thumbnailUri: '',
};
