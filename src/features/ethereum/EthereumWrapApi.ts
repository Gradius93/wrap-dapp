import {Web3Provider} from '@ethersproject/providers';
import {ethers} from 'ethers';
import ERC20_ABI from './erc20Abi';
import CUSTODIAN_ABI from './custodianContractAbi';
import BigNumber from 'bignumber.js';

export type TezosAddress = string;
export type EthereumAddress = string;

export class EthereumWrapApi {
    constructor(
        erc20Contract: ethers.Contract,
        custodianContract: ethers.Contract,
        ethAccountAddress: EthereumAddress,
        tzAccountAddress: TezosAddress
    ) {
        this.erc20Contract = erc20Contract;
        this.custodianContract = custodianContract;
        this.ethAccountAddress = ethAccountAddress;
        this.tzAccountAddress = tzAccountAddress;
    }

    async balanceOf(): Promise<BigNumber> {
        const balance = await this.erc20Contract.balanceOf(this.ethAccountAddress);
        return new BigNumber(balance.toString());
    }

    async allowanceOf(): Promise<BigNumber> {
        const balance = await this.erc20Contract.allowance(
            this.ethAccountAddress,
            this.benderContractAddress()
        );
        return new BigNumber(balance.toString());
    }

    async approve(amount: BigNumber) {
        return this.erc20Contract.approve(
            this.benderContractAddress(),
            ethers.BigNumber.from(amount.toString(10))
        );
    }

    private async gasEstimator(amount: BigNumber): Promise<ethers.BigNumber> {
        return await this.custodianContract.estimateGas.wrapERC20(
            this.erc20ContractAddress(),
            ethers.BigNumber.from(amount.toString(10)),
            this.erc20ContractAddress(),
            {
                gasLimit: 1000000,
            }
        );
    }

    async wrap(amount: BigNumber): Promise<string> {
        const gasLimit = await this.gasEstimator(amount);
        const response: ethers.providers.TransactionResponse = await this.custodianContract.wrapERC20(
            this.erc20ContractAddress(),
            ethers.BigNumber.from(amount.toString(10)),
            this.tzAccountAddress,
            {
                gasLimit: gasLimit.add(gasLimit.div(2)).toNumber(),
            }
        );

        return response.hash;
    }

    async networkFees(
        amount: BigNumber,
        provider: Web3Provider
    ): Promise<BigNumber> {
        const gas = await this.gasEstimator(amount);
        const gasPrice = await provider.getGasPrice();
        const fees = gas.mul(gasPrice);
        return new BigNumber(fees.toString(), 10);
    }

    private benderContractAddress() {
        return this.custodianContract.address;
    }

    private erc20ContractAddress() {
        return this.erc20Contract.address;
    }

    private readonly erc20Contract: ethers.Contract;
    private readonly custodianContract: ethers.Contract;
    private readonly ethAccountAddress: EthereumAddress;

    private readonly tzAccountAddress: TezosAddress;
}

export class EthereumWrapApiFactory {
    constructor(
        benderContract: ethers.Contract,
        ethAccountAddress: EthereumAddress,
        tzAccountAddress: TezosAddress,
        provider: Web3Provider
    ) {
        this.ethAccountAddress = ethAccountAddress;
        this.tezosAccountAddress = tzAccountAddress;
        this.benderContract = benderContract;
        this.provider = provider;
    }

    public forErc20(erc20ContractAddress: EthereumAddress): EthereumWrapApi {
        return new EthereumWrapApi(
            new ethers.Contract(
                erc20ContractAddress,
                new ethers.utils.Interface(ERC20_ABI),
                this.provider.getSigner()
            ),
            this.benderContract,
            this.ethAccountAddress,
            this.tezosAccountAddress
        );
    }

    private readonly provider: Web3Provider;
    private readonly benderContract: ethers.Contract;
    private readonly ethAccountAddress: EthereumAddress;
    private readonly tezosAccountAddress: TezosAddress;
}

export class EthereumWrapApiBuilder {
    constructor(provider: Web3Provider) {
        this.provider = provider;
    }

    public static withProvider(provider: Web3Provider): EthereumWrapApiBuilder {
        return new EthereumWrapApiBuilder(provider);
    }

    public forAccount(
        ethAccountAddress: EthereumAddress,
        tzAccountAddress: TezosAddress
    ): EthereumWrapApiBuilder {
        this.ethAccountAddress = ethAccountAddress;
        this.tzAccountAddress = tzAccountAddress;
        return this;
    }

    public forCustodianContract(
        contractAddress: EthereumAddress
    ): EthereumWrapApiBuilder {
        this.custodianContractAddress = contractAddress;
        return this;
    }

    public createFactory() {
        if (
            this.provider === undefined ||
            this.ethAccountAddress === undefined ||
            this.custodianContractAddress === undefined ||
            this.tzAccountAddress === undefined
        ) {
            throw new Error('Missing context for Ethereum Wrap Api initialization');
        }

        return new EthereumWrapApiFactory(
            new ethers.Contract(
                this.custodianContractAddress,
                new ethers.utils.Interface(CUSTODIAN_ABI),
                this.provider.getSigner()
            ),
            this.ethAccountAddress,
            this.tzAccountAddress,
            this.provider
        );
    }

    private readonly provider: Web3Provider;
    private custodianContractAddress: undefined | EthereumAddress;
    private ethAccountAddress: undefined | EthereumAddress;
    private tzAccountAddress: undefined | TezosAddress;
}
