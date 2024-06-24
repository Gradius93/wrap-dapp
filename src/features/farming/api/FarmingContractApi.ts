import {OpKind, TezosToolkit, WalletParamsWithKind} from '@taquito/taquito';
import {tzip16} from '@taquito/tzip16';
import BigNumber from 'bignumber.js';
import {FarmConfig} from "../../../config";
import {NewStake} from "../stake_all/hook/useStakeAll";
import {ContractBalance} from "../balances-reducer";
import {ParamsWithKind} from '@taquito/taquito/dist/types/operations/types';

export interface FarmConfigWithClaimBalances extends FarmConfig {
    earned: BigNumber;
}

export default class FarmingContractApi {
    private library: TezosToolkit;

    constructor(library: TezosToolkit) {
        this.library = library;
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
        const validNewStakes = newStakes.filter(newStake => {
            const amount = new BigNumber(newStake.amount);
            return !amount.isNaN() && amount.gt(0);
        });
        const operators = validNewStakes.map((stake): WalletParamsWithKind => FarmingContractApi.updateOperatorTransaction(stake.farmStakedToken, account, stake.contract));
        const stakes = validNewStakes.map((stake): WalletParamsWithKind => FarmingContractApi.stakeOperation(stake.contract, new BigNumber(stake.amount).shiftedBy(stake.stakeDecimals).toString(10)));
        const addOperatorsAndStakes = operators.concat(stakes);
        const estimates = await this.library.estimate.batch(addOperatorsAndStakes as ParamsWithKind[]);
        const batch = this.library.wallet.batch()
            .with(addOperatorsAndStakes.map((op, opIndex) => ({
                storageLimit: estimates[opIndex].storageLimit + 10,
                ...op
            })));
        const opg = await batch.send();
        await opg.receipt();
        return opg.opHash;
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
        const estimates = await this.library.estimate.batch(unstakes as ParamsWithKind[]);
        const opg = await this.library.wallet.batch()
            .with(unstakes.map((unstake, unstakeIndex) => ({
                storageLimit: estimates[unstakeIndex].storageLimit + 10,
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
        }).map((claim): WalletParamsWithKind => FarmingContractApi.claimOperation(claim.farmContractAddress)));
        const estimates = await this.library.estimate.batch(claims as ParamsWithKind[]);
        const opg = await this.library.wallet.batch().with(claims.map((claim, claimIndex) => ({
            storageLimit: estimates[claimIndex].storageLimit + 10,
            ...claim
        }))).send();
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

    private static stakeOperation(farmContract: string, amount: string): WalletParamsWithKind {
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

    private static claimOperation(farmContract: string): WalletParamsWithKind {
        return {
            kind: OpKind.TRANSACTION,
            to: farmContract,
            amount: 0,
            mutez: false,
            parameter: {
                entrypoint: "claim",
                value: {
                    prim: "Unit"
                }
            }
        }
    }
}
