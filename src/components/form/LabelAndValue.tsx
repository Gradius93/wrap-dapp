import {Typography} from '@material-ui/core';
import React, {ReactNode} from 'react';
import {makeStyles} from '@material-ui/core/styles';

const useStyle = makeStyles(() => ({
    root: {
        padding: '10px 20px',
    },
    wrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    label: {
        width: '35%',
        fontSize: 12,
        fontWeight: 'bold',
    },

    valueWrapper: {
        flexGrow: 1,
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        textAlign: 'left',
    },
}));

export type LabelAndValueProps = {
    label: string;
    value: string | ReactNode;
};

export default function LabelAndValue({label, value}: LabelAndValueProps) {
    const classes = useStyle();
    return (
        <div className={classes.root}>
            <div className={classes.wrapper}>
                <Typography component="span" className={classes.label}>
                    {label}
                </Typography>
                <div className={classes.valueWrapper}>{value}</div>
            </div>
        </div>
    );
}
