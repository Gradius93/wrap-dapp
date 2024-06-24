import {StepConnector, withStyles} from '@material-ui/core';

const customConnector = withStyles((theme) => ({
    alternativeLabel: {
        top: 14,
    },
    active: {
        '& $line': {
            backgroundColor: theme.palette.primary.main,
        },
    },
    line: {
        height: 3,
        border: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 1,
    },
}))(StepConnector);

export default customConnector;
