import { useConfig } from '../../../../runtime/config/ConfigContext';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';

export function useOldFarm(farmContract: string) {
  const { oldFarms } = useConfig();
  const history = useHistory();

  const farm = useMemo(() => {
    return oldFarms.find(
      (farmConfig) => farmConfig.farmContractAddress === farmContract
    );
  }, [farmContract, oldFarms]);

  useEffect(() => {
    if (!farm) {
      history.push('/');
    }
  }, [history, farm]);

  return { farm: farm! };
}
