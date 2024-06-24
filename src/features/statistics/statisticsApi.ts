import axios, {AxiosInstance} from 'axios';

export interface StakingApy {
    asset: string;
    apy: string;
    apr: string;
    totalRewards: string;
    totalRewardsInUsd: string;
    totalStaked: string;
    totalStakedInUsd: string;
    startLevel: string;
    startTimestamp: string;
    farmingContract: string;
    duration: string;
}

export default class StatisticsApi {
    private client: AxiosInstance;

    constructor(baseURL: string) {
        this.client = axios.create({baseURL, timeout: 3000});
    }

    public fetchStakingApy(): Promise<StakingApy[]> {
        return this.client.get('/staking/apy').then(({data}: { data: Array<StakingApy> }) => data);
    }
}
