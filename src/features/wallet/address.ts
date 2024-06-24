export function ellipsizeAddress(address: string, count = 5): string {
    return `${address.slice(0, count + 1)}..${address.slice(
        address.length - count - 1
    )}`;
}
