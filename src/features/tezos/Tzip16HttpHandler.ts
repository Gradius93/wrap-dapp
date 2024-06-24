import {
  ContractAbstraction,
  ContractProvider,
  Wallet,
  Context,
} from '@taquito/taquito';
import { Handler, Tzip16Uri } from '@taquito/tzip16';
import axios from 'axios';

export class Tzip16HttpHandler implements Handler {
  async getMetadata(
    _contractAbstraction: ContractAbstraction<ContractProvider | Wallet>,
    { protocol, location }: Tzip16Uri,
    _context: Context
  ) {
    const response = await axios.get(
      `${protocol}:${decodeURIComponent(location)}`
    );
    return JSON.stringify(response.data);
  }
}
