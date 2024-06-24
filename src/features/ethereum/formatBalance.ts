import BigNumber from 'bignumber.js';

export function formatBalance(
    balance: BigNumber,
    decimals: number
) {
    return `${balance.shiftedBy(-decimals).toFormat()}`;
}