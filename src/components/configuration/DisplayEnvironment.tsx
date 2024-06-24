import {makeStyles} from '@material-ui/core';
import React from 'react';
import {useConfig} from '../../runtime/config/ConfigContext';

const useStyles = makeStyles((theme) => ({
    env: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        textAlign: 'center',
        fontSize: 12,
        color: '#FFFFFF',
    },
}));

export default function DisplayEnvironment() {
    const classes = useStyles();
    const {environmentName, tezos, ethereum} = useConfig();

    return (
        <div className={classes.env}>
            {environmentName.charAt(0).toUpperCase() +
            environmentName.slice(1).toLowerCase()}
            {environmentName.toLowerCase() === 'testnet'
                ? ` (${tezos.networkName}/${ethereum.networkName})`
                : ''}
        </div>
    );
}
