import { Web3Provider, ExternalProvider } from '@ethersproject/providers';

export function getLibrary(provider: ExternalProvider): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}
