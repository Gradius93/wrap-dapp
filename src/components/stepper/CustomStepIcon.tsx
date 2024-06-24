import {makeStyles} from '@material-ui/core/styles';
import {StepIconProps} from '@material-ui/core';
import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import clsx from 'clsx';

const useCustomStepIconStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: '#FFFFFF',
        zIndex: 1,
        color: '#000',
        fontWeight: 900,
        width: 32,
        height: 32,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    active: {
        backgroundColor: '#FFFFFF',
    },
    completed: {
        backgroundColor: theme.palette.primary.main,
    },
}));

export default function CustomStepIcon(props: StepIconProps) {
    const classes = useCustomStepIconStyles();
    const {active, completed} = props;

    const icons: { [index: string]: React.ReactElement } = {
        1: completed ? <CheckIcon/> : <span>1</span>,
        2: completed ? <CheckIcon/> : <span>2</span>,
    };

    return (
        <div
            className={clsx(classes.root, {
                [classes.active]: active,
                [classes.completed]: completed,
            })}
        >
            {icons[String(props.icon)]}
        </div>
    );
}
