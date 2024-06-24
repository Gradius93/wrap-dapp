import {useConfig} from '../../../../runtime/config/ConfigContext';
import {useEffect, useMemo} from 'react';
import {useHistory} from 'react-router';

export function useFarm(farmContract: string) {
    const {farms} = useConfig();
    const history = useHistory();

    const farm = useMemo(() => {
        return farms.find((farmConfig) => farmConfig.farmContractAddress === farmContract);
    }, [farmContract, farms]);

    useEffect(() => {
        if (!farm) {
            history.push('/');
        }
    }, [history, farm]);

    return {farm: farm!};
}
