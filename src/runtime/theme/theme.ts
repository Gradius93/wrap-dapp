import {ThemeOptions} from '@material-ui/core/styles/createMuiTheme';

export const themeOptions: ThemeOptions = {
    palette: {
        primary: {
            main: '#FFD000',
        },
        secondary: {
            main: '#000000',
        },
    },
    overrides: {
        MuiDialog: {
            paper: {
                backgroundColor: '#191919',
            },
        },
        MuiSelect: {
            select: {
                '&:focus': {
                    backgroundColor: '#FFFFFF',
                },
            },
            root: {
                '&.MuiFilledInput-input': {
                    backgroundColor: '#FFFFFF',
                    padding: '10px 12px 10px',
                },
            },
        },
        MuiFilledInput: {
            root: {
                backgroundColor: '#FFFFFF',
                '&.MuiFocused': {
                    backgroundColor: '#FFFFFF',
                },
            },
            input: {
                padding: '10px 12px 10px',
                backgroundColor: '#FFFFFF',
            },
        },
    },
};
