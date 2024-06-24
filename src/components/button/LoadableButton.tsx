import {Button, CircularProgress, makeStyles} from '@material-ui/core';
import React, {PropsWithChildren} from 'react';

export type LoadableButtonProps = {
    loading: boolean;
    onClick: () => void;
    disabled: boolean;
    text: string;
    isChecked?: boolean;
    finalized?: boolean;
    variant?: 'text' | 'outlined' | 'contained';
    size?: 'small' | 'medium' | 'large';
};

const useStyles = makeStyles((theme) => ({
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
        zIndex: 99,
    },
    wrapper: {
        margin: theme.spacing(1),
        backgroundColor: '#FFFFFF',
        position: 'relative',
        borderRadius: '25px',
    },
    button: {
        textTransform: 'none',
        boxShadow: 'none',
        fontWeight: 900,
        borderRadius: '25px',
        border: 'none',
        '&:hover': {
            border: 'none',
            boxShadow: 'none',
            backgroundColor: theme.palette.primary.main,
        },
        backgroundColor: '#FFFFFF',
        '&.Mui-disabled': {
            border: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
        },
    },
    finalizedButton: {
        '&.Mui-disabled': {
            backgroundColor: theme.palette.primary.main,
        },
    },
}));

export default function LoadableButton({
                                           loading,
                                           disabled,
                                           text,
                                           onClick,
                                           children,
                                           finalized,
                                           variant = 'outlined',
                                           size,
                                       }: PropsWithChildren<LoadableButtonProps>) {
    const classes = useStyles();

    const handleOnClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        onClick();
    };

    return (
        <div>
            <div className={classes.wrapper}>
                <Button
                    variant={variant}
                    fullWidth
                    disabled={disabled || loading}
                    onClick={handleOnClick}
                    size={size}
                    className={`${classes.button}${
                        finalized ? ' ' + classes.finalizedButton : ''
                    }`}
                >
                    {text}
                </Button>
                {loading && (
                    <CircularProgress size={24} className={classes.buttonProgress}/>
                )}
            </div>
            {children}
        </div>
    );
}
