import { Operation } from '../features/operations/state/types';

const WRAP = '/wrap';
const WRAP_FINALIZE = '/wrap/:transactionHash';
const UNWRAP_FINALIZE = '/unwrap/:transactionHash';
const UNWRAP = '/unwrap';

const HISTORY_WRAP = '/history/wrap';
const HISTORY_UNWRAP = '/history/unwrap';
const HISTORY = '/history';

const FARMING_ROOT = '/farming';
const FARM_PARAMETER = '/farm/:farm_address';
const FARM_STAKE = `${FARMING_ROOT}${FARM_PARAMETER}/stake`;
const FARM_UNSTAKE = `${FARMING_ROOT}${FARM_PARAMETER}/unstake`;
const FARM_CLAIM = `${FARMING_ROOT}${FARM_PARAMETER}/claim`;
const OLD_FARM_UNSTAKE = `${FARMING_ROOT}/old-farm/:farm_address/unstake`;
const ALL_FARMS_STAKE = `${FARMING_ROOT}/all_farms/stake`;
const ALL_FARMS_UNSTAKE = `${FARMING_ROOT}/all_farms/unstake`;
const ALL_FARMS_CLAIM = `${FARMING_ROOT}/all_farms/claim`;

export const paths = {
  WRAP,
  UNWRAP,
  WRAP_FINALIZE,
  UNWRAP_FINALIZE,
  HISTORY_WRAP,
  HISTORY_UNWRAP,
  HISTORY,
  FARMING_ROOT,
  FARM_STAKE,
  FARM_UNSTAKE,
  FARM_CLAIM,
  ALL_FARMS_STAKE,
  ALL_FARMS_UNSTAKE,
  ALL_FARMS_CLAIM,
  OLD_FARM_UNSTAKE,
};

export const mainPaths = ['/', WRAP, UNWRAP, WRAP_FINALIZE, UNWRAP_FINALIZE];
export const historyPaths = [HISTORY, HISTORY_WRAP, HISTORY_UNWRAP];
export const farmPaths = [FARM_STAKE, FARM_UNSTAKE, FARM_CLAIM];
export const oldFarmPaths = [OLD_FARM_UNSTAKE];
export const allFarmsPaths = [
  ALL_FARMS_STAKE,
  ALL_FARMS_CLAIM,
  ALL_FARMS_UNSTAKE,
];

export const wrapPage = (op: Operation) => `/wrap/${op.hash}`;
export const unwrapPage = (op: Operation) => `/unwrap/${op.hash}`;
export const farmStakePageRoute = (farmContract: string) =>
  FARM_STAKE.replace(':farm_address', farmContract);
export const oldFarmUnstakePageRoute = (farmContract: string) =>
  OLD_FARM_UNSTAKE.replace(':farm_address', farmContract);
