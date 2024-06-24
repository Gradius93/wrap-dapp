import {makeStyles} from '@material-ui/core';
import {blueGrey, green, orange} from '@material-ui/core/colors';
import {ConnectionStatus} from '../../features/wallet/connectionStatus';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import ContactlessIcon from '@material-ui/icons/Contactless';
import ErrorIcon from '@material-ui/icons/Error';
import React from 'react';

const useStyles = makeStyles((theme) => ({
    statusIcon: {
        selfAlign: 'center',
        fontSize: 100,
        color: blueGrey[100],
    },
}));

export default ({status}: { status: ConnectionStatus }) => {
    const classes = useStyles();
    switch (status) {
        case ConnectionStatus.NOT_CONNECTED:
            return <OfflineBoltIcon className={classes.statusIcon}/>;
        case ConnectionStatus.CONNECTING:
            return (
                <ContactlessIcon
                    className={classes.statusIcon}
                    style={{color: orange[400]}}
                />
            );
        case ConnectionStatus.CONNECTED:
            return (
                <ContactlessIcon
                    className={classes.statusIcon}
                    style={{color: green[400]}}
                />
            );
        case ConnectionStatus.ERRORED:
            return <ErrorIcon className={classes.statusIcon} color="error"/>;
    }
};
