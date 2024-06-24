import BigNumber from 'bignumber.js';

export function parseUnits(value: string, decimals: number) {
    return new BigNumber(value).shiftedBy(decimals);
}

export function formatUnits(balance: BigNumber, decimals: number): string {
    return balance.toString(decimals);
}

export function formatAmount(
    symbol: string,
    balance: BigNumber,
    decimals: number
) {
    return `${symbol} ${balance.shiftedBy(-decimals).toFormat()}`;
}
