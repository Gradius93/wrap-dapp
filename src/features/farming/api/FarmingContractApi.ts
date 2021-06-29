import {OpKind, TezosToolkit, WalletParamsWithKind} from '@taquito/taquito';
import {tzip16} from '@taquito/tzip16';
import BigNumber from 'bignumber.js';
import {FarmConfig} from "../../../config";
import {NewStake} from "../stake_all/hook/useStakeAll";
import {ContractBalance} from "../balances-reducer";
import { ParamsWithKind } from '@taquito/taquito/dist/types/operations/types';

export interface FarmConfigWithClaimBalances extends FarmConfig {
    earned: BigNumber;
}

export default class FarmingContractApi {
    private library: TezosToolkit;

    constructor(library: TezosToolkit) {
        this.library = library;
    }

    private static updateOperatorTransaction(farmStakedToken: string, owner: string, stakingContract: string): WalletParamsWithKind {
        return {
            kind: OpKind.TRANSACTION,
            to: farmStakedToken,
            amount: 0,
            mutez: false,
            parameter: {
                entrypoint: "update_operators",
                value: [
                    {
                        prim: "Left",
                        args: [
                            {
                                prim: "Pair",
                                args: [
                                    {
                                        string: owner
                                    },
                                    {
                                        prim: "Pair",
                                        args: [
                                            {
                                                string: stakingContract
                                            },
                                            {
                                                int: "0"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    }

    public static stakeOperation(farmContract: string, amount: string): WalletParamsWithKind {
        return {
            kind: OpKind.TRANSACTION,
            to: farmContract,
            amount: 0,
            mutez: false,
            parameter: {
                entrypoint: "stake",
                value: {
                    int: amount
                }
            }
        }
    }

    public async stake(
        account: string,
        amount: BigNumber,
        stakedTokenContractAddress: string,
        farmContractAddress: string
    ): Promise<string> {
        const addOperator = FarmingContractApi.updateOperatorTransaction(stakedTokenContractAddress, account, farmContractAddress);
        const stake = FarmingContractApi.stakeOperation(farmContractAddress, amount.toString(10));
        const opg = await this.library.wallet
            .batch()
            .with([addOperator])
            .with([stake])
            .send();
        await opg.receipt();
        return opg.opHash;
    }

    public async stakeAll(newStakes: NewStake[], account: string): Promise<string> {
        const operators = newStakes.map((stake): WalletParamsWithKind => FarmingContractApi.updateOperatorTransaction(stake.farmStakedToken, account, stake.contract));
        const stakes = newStakes.map((stake): WalletParamsWithKind => FarmingContractApi.stakeOperation(stake.contract, new BigNumber(stake.amount).shiftedBy(stake.stakeDecimals).toString(10)));
        const batch = this.library.wallet.batch()
          .with(operators)
          .with(stakes.map(stake => ({
              storageLimit: 20,
              ...stake
          })));
        const estimate = await this.library.estimate.batch(operators.concat(stakes) as ParamsWithKind[]);
        console.log(estimate);
        const opg = await batch
            .send();
        return opg.opHash;
    }

    private static unstakeOperation(farmContract: string, amount: string): WalletParamsWithKind {
        return {
            kind: OpKind.TRANSACTION,
            to: farmContract,
            amount: 0,
            mutez: false,
            parameter: {
                entrypoint: "withdraw",
                value: {
                    int: amount
                }
            }
        }
    }

    public async unstake(
        amount: BigNumber,
        farmContractAddress: string
    ): Promise<string> {
        const farmContract = await this.library.wallet.at(farmContractAddress);
        const opg = await farmContract.methods.withdraw(amount.toString(10)).send();
        await opg.receipt();
        return opg.opHash;
    }

    public async unstakeAll(stakingBalances: ContractBalance[]): Promise<string> {
        const unstakes = stakingBalances.filter((stake) => {
            return stake.balance && new BigNumber(stake.balance).gt(0);
        }).map((stake): WalletParamsWithKind => FarmingContractApi.unstakeOperation(stake.contract, stake.balance));
        const opg = await this.library.wallet.batch()
          .with(unstakes.map(unstake => ({
              storageLimit: 20,
              ...unstake
          }))).send();
        await opg.receipt();
        return opg.opHash;
    }

    public async extractBalances(
        farmContractAddress: string,
        owner: string
    ): Promise<{ totalSupply: BigNumber; staked: BigNumber; reward: BigNumber }> {
        const farmContract = await this.library.contract.at(
            farmContractAddress,
            tzip16
        );

        const views = await farmContract.tzip16().metadataViews();
        const [staked, reward, totalSupply] = await Promise.all([
            views.get_balance().executeView(owner),
            views.get_earned().executeView(owner),
            views.total_supply().executeView(),
        ]);

        return {totalSupply, staked, reward};
    }

    public async claim(farmContractAddress: string): Promise<string> {
        const farmContract = await this.library.wallet.at(farmContractAddress);
        const opg = await farmContract.methods.claim({}).send();
        await opg.receipt();
        return opg.opHash;
    }

    public async claimAll(claimBalances: FarmConfigWithClaimBalances[]): Promise<string> {
        const claims = await Promise.all(claimBalances.filter((claim) => {
            return new BigNumber(claim.earned).gt(0);
        }).map(async (claim): Promise<WalletParamsWithKind> => {
            const farmContract = await this.library.contract.at(claim.farmContractAddress);

            return {
                kind: OpKind.TRANSACTION,
                ...farmContract.methods.claim({}).toTransferParams({
                    storageLimit: 20
                })
            };
        }));

        const opg = await this.library.wallet.batch().with(claims).send();
        await opg.receipt();
        return opg.opHash;
    }

    public async claimBalances(farms: FarmConfig[], owner: string): Promise<FarmConfigWithClaimBalances[]> {
        return await Promise.all(farms.map(async (farm): Promise<FarmConfigWithClaimBalances> => {
            const farmContract = await this.library.contract.at(
                farm.farmContractAddress,
                tzip16
            );
            const views = await farmContract.tzip16().metadataViews();
            const earned = await views.get_earned().executeView(owner);
            return Object.assign({}, farm, {earned: earned});
        }));
    }
}
