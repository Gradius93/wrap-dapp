import React, {useEffect, useState} from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {Dialog, DialogContent, DialogContentText, DialogTitle,} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
        },
    })
);

type Props = {
    retryTime: number;
};

export default function LoadingScreen({retryTime}: Props) {
    const [time, setTime] = useState<number>(retryTime);
    const classes = useStyles();

    useEffect(() => {
        setTime(retryTime - 1);
        const id = setInterval(() => {
            setTime((time) => {
                if (time > 1) return time - 1;
                else return 0;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [retryTime]);

    return (
        <Backdrop className={classes.backdrop} open={true}>
            {retryTime > 0 ? (
                <Dialog open={true}>
                    <DialogTitle>The Wrap Indexer is not available</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {time === 0 ? 'Retrying...' : `Retrying in ${time} seconds...`}
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            ) : (
                <CircularProgress color="inherit"/>
            )}
        </Backdrop>
    );
}
