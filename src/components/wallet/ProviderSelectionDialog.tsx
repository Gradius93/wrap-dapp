import {Dialog, DialogTitle, List, ListItem, ListItemText, makeStyles,} from '@material-ui/core';
import {ProviderList} from '../../features/wallet/blockchain';
import React from 'react';

const useStyles = makeStyles((theme) => ({
    title: {
        backgroundColor: '#191919',
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 700,
        textAlign: 'center',
    },
    item: {
        backgroundColor: '#191919',
        color: '#FFFFFF',
        borderTop: '1px solid #444444',
        '&:hover': {
            backgroundColor: '#4d4d4d',
        },
    },
    icon: {
        width: 32,
        height: 32,
    },
}));

type SimpleDialogProps = {
    providers: ProviderList;
    open: boolean;
    onSelectedValue: (key: string) => void;
    onClose: () => void;
    blockchain: string;
};

const Render = ({
                    onClose,
                    onSelectedValue,
                    open,
                    providers,
                }: SimpleDialogProps) => {
    const classes = useStyles();
    return (
        <Dialog
            onClose={onClose}
            aria-labelledby="ethereum-provider"
            open={open}
            maxWidth={'xs'}
            fullWidth={true}
        >
            <DialogTitle disableTypography={true} className={classes.title}>
                Select your wallet
            </DialogTitle>
            <List style={{padding: '0px'}}>
                {providers.map(({name, key, icon}) => (
                    <ListItem
                        button
                        onClick={() => onSelectedValue(key)}
                        key={key}
                        className={classes.item}
                    >
                        <ListItemText primary={name}/>
                        <img
                            className={classes.icon}
                            alt={name}
                            src={`/static/images/${icon}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
};
export default Render;
