export function ellipsizeAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
}
