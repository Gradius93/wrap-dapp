import {Box, LinearProgress, LinearProgressProps} from '@material-ui/core';
import {ReactNode} from 'react';
import {makeStyles} from '@material-ui/core/styles';

const useStyle = makeStyles(() => ({
    root: {
        width: '100%',
    },
    progressWrapper: {
        backgroundColor: '#191919',
        padding: '20px 45px',
    },
    labelWrapper: {
        paddingTop: '15px',
        color: '#000000',
    },
    barColor: {
        backgroundColor: '#F7CB16',
        opacity: '1',
        height: '8px',
        borderRadius: '12px',
    },
    barBackgroundColor: {
        backgroundColor: 'rgba(247,203,22,0.29)',
        height: '8px',
        borderRadius: '12px',
    },
}));

export function CircularProgressWithLabel(
    props: LinearProgressProps & { label: string | ReactNode }
) {
    const classes = useStyle();
    return (
        <Box alignItems={'center'} className={classes.root}>
            <Box width="100%" className={classes.progressWrapper}>
                <LinearProgress
                    color={'primary'}
                    variant="determinate"
                    {...props}
                    classes={{
                        barColorPrimary: classes.barColor,
                        colorPrimary: classes.barBackgroundColor,
                    }}
                />
            </Box>

            <Box
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                className={classes.labelWrapper}
            >
                {props.label}
            </Box>
        </Box>
    );
}
