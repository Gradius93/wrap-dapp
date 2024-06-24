import {TezosToolkit} from '@taquito/taquito';
import {tzip16} from '@taquito/tzip16';
import BigNumber from 'bignumber.js';
import {Fees} from '../../config';
import {Estimate} from '@taquito/taquito/dist/types/contract/estimate';

export type TezosAddress = string;
export type EthereumAddress = string;

export class TezosUnwrapApi {
    constructor(
        erc20ContractAddress: EthereumAddress,
        tezosWrappingContract: string,
        tezosTokenId: number,
        minterContract: string,
        ethAccountAddress: EthereumAddress,
        tzAccountAddress: TezosAddress,
        tzToolkit: TezosToolkit,
        fees: Fees
    ) {
        this.erc20ContractAddress = erc20ContractAddress;
        this.tezosWrappingContract = tezosWrappingContract;
        this.tezosTokenId = tezosTokenId;
        this.minterContract = minterContract;
        this.ethAccountAddress = ethAccountAddress;
        this.tzAccountAddress = tzAccountAddress;
        this.tzToolkit = tzToolkit;
        this.fees = fees;
    }

    async balanceOf(): Promise<BigNumber> {
        const contract = await this.tzToolkit.contract.at(
            this.tezosWrappingContract,
            tzip16
        );
        const views = await contract.tzip16().metadataViews();
        return views['get_balance']().executeView(
            this.tzAccountAddress,
            this.tezosTokenId
        );
    }

    private async unwrap_call(amount: BigNumber, fees: BigNumber) {
        const contract = await this.tzToolkit.wallet.at(this.minterContract);
        return contract.methods.unwrap_erc20(
            this.erc20ContractAddress.toLowerCase().substring(2),
            amount.toString(10),
            fees.toString(10),
            this.ethAccountAddress.toLowerCase().substring(2)
        );
    }

    async unwrap(amount: BigNumber, fees: BigNumber) {
        const call = await this.unwrap_call(amount, fees);
        const result = await call.send();
        return result.opHash;
    }

    async estimateUnwrapNetworkFees(
        amount: BigNumber,
        fees: BigNumber
    ): Promise<Estimate> {
        const call = await this.unwrap_call(amount, fees);
        const params = call.toTransferParams({amount: 0});
        return await this.tzToolkit.estimate.transfer(params);
    }

    private readonly ethAccountAddress: EthereumAddress;
    private readonly tzAccountAddress: TezosAddress;
    private readonly minterContract: string;
    private readonly tezosWrappingContract: string;
    private readonly tezosTokenId: number;
    private readonly tzToolkit: TezosToolkit;
    private readonly erc20ContractAddress: EthereumAddress;
    private readonly fees: Fees;
}

export class TezosUnwrapApiFactory {
    constructor(
        minterContract: string,
        ethAccountAddress: EthereumAddress,
        tzAccountAddress: TezosAddress,
        tzToolkit: TezosToolkit,
        fees: Fees
    ) {
        this.ethAccountAddress = ethAccountAddress;
        this.tezosAccountAddress = tzAccountAddress;
        this.minterContract = minterContract;
        this.tzToolkit = tzToolkit;
        this.fees = fees;
    }

    public forFa20(
        erc20ContractAddress: EthereumAddress,
        tezosWrappingContract: string,
        tezosTokenId: number
    ): TezosUnwrapApi {
        return new TezosUnwrapApi(
            erc20ContractAddress,
            tezosWrappingContract,
            tezosTokenId,
            this.minterContract,
            this.ethAccountAddress,
            this.tezosAccountAddress,
            this.tzToolkit,
            this.fees
        );
    }

    private readonly tzToolkit: TezosToolkit;
    private readonly minterContract: string;
    private readonly ethAccountAddress: EthereumAddress;
    private readonly tezosAccountAddress: TezosAddress;
    private readonly fees: Fees;
}

export class TezosUnwrapApiBuilder {
    constructor(tzLibrary: TezosToolkit) {
        this.tzLibrary = tzLibrary;
    }

    public static withProvider(tzLibrary: TezosToolkit): TezosUnwrapApiBuilder {
        return new TezosUnwrapApiBuilder(tzLibrary);
    }

    public forAccount(
        ethAccountAddress: EthereumAddress,
        tzAccountAddress: TezosAddress
    ): TezosUnwrapApiBuilder {
        this.ethAccountAddress = ethAccountAddress;
        this.tzAccountAddress = tzAccountAddress;
        return this;
    }

    public forMinterContract(
        minterContractAddress: string
    ): TezosUnwrapApiBuilder {
        this.minterContractAddress = minterContractAddress;
        return this;
    }

    public forFees(fees: Fees): TezosUnwrapApiBuilder {
        this.fees = fees;
        return this;
    }

    public createFactory() {
        if (
            this.ethAccountAddress === undefined ||
            this.tzAccountAddress === undefined ||
            this.minterContractAddress === undefined ||
            this.tzLibrary === undefined ||
            this.fees === undefined
        ) {
            throw new Error('Missing context for Tezos Wrap Api initialization');
        }

        return new TezosUnwrapApiFactory(
            this.minterContractAddress,
            this.ethAccountAddress,
            this.tzAccountAddress,
            this.tzLibrary,
            this.fees
        );
    }

    private readonly tzLibrary: TezosToolkit;
    private minterContractAddress: undefined | string;
    private ethAccountAddress: undefined | EthereumAddress;
    private tzAccountAddress: undefined | TezosAddress;
    private fees: undefined | Fees;
}
