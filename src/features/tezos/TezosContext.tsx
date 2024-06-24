import React, {
  Dispatch,
  PropsWithChildren,
  useCallback,
  useMemo,
} from 'react';

import { NetworkType, RequestPermissionInput } from '@airgap/beacon-sdk';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import {
  Handler,
  IpfsHttpHandler,
  MetadataProvider,
  TezosStorageHandler,
  Tzip16Module,
} from '@taquito/tzip16';
import { Tzip16HttpHandler } from './Tzip16HttpHandler';

export enum TezosConnectionStatus {
  UNINITIALIZED,
  CONNECTED,
}

type State = {
  status: TezosConnectionStatus;
  wallet: BeaconWallet;
  library?: TezosToolkit;
  account?: string;
  network?: NetworkType;
};

enum ActionType {
  CONNECTED,
  DISCONNECTED = 1,
}

type Action =
  | {
      type: ActionType.CONNECTED;
      payload: {
        network: NetworkType;
        account: string;
        library: TezosToolkit;
      };
    }
  | {
      type: ActionType.DISCONNECTED;
    };

type Effects = {
  activate: (request: RequestPermissionInput) => Promise<string>;
  reactivate: (request: RequestPermissionInput) => Promise<string>;
  deactivate: () => Promise<void>;
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.CONNECTED: {
      const { network, account, library } = action.payload;
      return {
        ...state,
        network,
        status: TezosConnectionStatus.CONNECTED,
        account,
        library,
      };
    }
    case ActionType.DISCONNECTED: {
      return {
        status: TezosConnectionStatus.UNINITIALIZED,
        wallet: state.wallet,
      };
    }
  }
}

// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols,ES6ShorthandObjectProperty
const fakeSigner = (account: string) => ({
  publicKey(): Promise<string> {
    return Promise.reject('Noop signer');
  },
  publicKeyHash(): Promise<string> {
    return Promise.resolve(account);
  },
  secretKey(): Promise<string | undefined> {
    return Promise.reject('Noop signer');
  },
  sign(
    op: {},
    magicByte: Uint8Array | undefined
  ): Promise<{
    bytes: string;
    sig: string;
    prefixSig: string;
    sbytes: string;
  }> {
    return Promise.reject('Noop signer');
  },
});

function buildCustomizedTzip16Module() {
  return new Tzip16Module(
    new MetadataProvider(
      new Map<string, Handler>([
        ['https', new Tzip16HttpHandler()],
        ['tezos-storage', new TezosStorageHandler()],
        ['ipfs', new IpfsHttpHandler('cloudflare-ipfs.com')],
      ])
    )
  );
}

function _activate(dispatch: Dispatch<Action>) {
  return (client: BeaconWallet) => async (request: RequestPermissionInput) => {
    const library = new TezosToolkit(request.network?.rpcUrl || '');
    library.addExtension(buildCustomizedTzip16Module());
    await client.requestPermissions(request);
    library.setWalletProvider(client);
    const account = await client.getPKH();
    library.setSignerProvider(fakeSigner(account));
    dispatch({
      type: ActionType.CONNECTED,
      payload: {
        network: request.network?.type!,
        account,
        library,
      },
    });
    return account;
  };
}

function _reactivate(dispatch: Dispatch<Action>) {
  return (client: BeaconWallet) => async (request: RequestPermissionInput) => {
    const library = new TezosToolkit(request.network?.rpcUrl || '');
    library.addExtension(buildCustomizedTzip16Module());
    library.setWalletProvider(client);
    const account = await client.getPKH();
    library.setSignerProvider(fakeSigner(account));
    dispatch({
      type: ActionType.CONNECTED,
      payload: {
        network: request.network?.type!,
        account,
        library,
      },
    });
    return account;
  };
}

function _deactivate(dispatch: Dispatch<Action>) {
  return (client: BeaconWallet) => async () => {
    return client.clearActiveAccount().then(() => {
      dispatch({
        type: ActionType.DISCONNECTED,
      });
    });
  };
}

const TezosContext = React.createContext<null | (State & Effects)>(null);

type Props = {
  getLibrary: () => BeaconWallet;
};

export default function TezosProvider({
  getLibrary,
  children,
}: PropsWithChildren<Props>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const wallet = useMemo(() => getLibrary(), []);
  const [state, dispatch] = React.useReducer(reducer, {
    status: TezosConnectionStatus.UNINITIALIZED,
    wallet: wallet,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activate = useCallback(_activate(dispatch)(wallet), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deactivate = useCallback(_deactivate(dispatch)(wallet), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reactivate = useCallback(_reactivate(dispatch)(wallet), []);
  return (
    <TezosContext.Provider
      value={{ ...state, activate, deactivate, reactivate }}
    >
      {children}
    </TezosContext.Provider>
  );
}

export function useTezosContext() {
  const context = React.useContext(TezosContext);
  if (context == null) {
    throw new Error('useTezosContext must be used within a TezosContext');
  }
  return context;
}
