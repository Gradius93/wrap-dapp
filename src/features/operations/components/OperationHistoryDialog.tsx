import OperationHistoryButton from '../../../components/button/OperationHistoryButton';
import {usePendingOperationsHistory} from '../hooks/usePendingOperationsHistory';
import React, {ReactNode, useMemo, useState} from 'react';
import {
    Dialog,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Typography,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {Operation, OperationStatusType, UnwrapErc20Operation, WrapErc20Operation,} from '../state/types';
import {formatAmount} from '../../ethereum/token';
import {ellipsizeAddress} from '../../wallet/address';
import {TokenMetadata} from '../../swap/token';
import {useConfig} from '../../../runtime/config/ConfigContext';
import {PaperContent} from '../../../components/paper/Paper';

const useStyle = makeStyles((theme) => ({
    subHeader: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.secondary.main,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    title: {
        backgroundColor: '#191919',
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 700,
        textAlign: 'center',
    },
    other: {
        textAlign: 'center',
        backgroundColor: '#191919',
        color: 'white',
        '&:hover': {
            backgroundColor: '#4d4d4d',
        },
    },
    secondary: {
        color: theme.palette.primary.main,
        fontWeight: 700,
    },
    divider: {
        backgroundColor: '#444444',
    },
}));

export default function OperationHistoryDialog() {
    const classes = useStyle();
    const {
        operations,
        count,
        canFetch,
        selectOperation,
    } = usePendingOperationsHistory();
    const [open, setOpen] = useState(false);
    const {
        fungibleTokens,
        wrapSignatureThreshold,
        unwrapSignatureThreshold,
    } = useConfig();

    const gotoOp = (op: Operation) => {
        selectOperation(op);
        setOpen(false);
    };

    const tokensByEthAddress = useMemo(
        () =>
            Object.entries(fungibleTokens).reduce<Record<string, TokenMetadata>>(
                (acc, [, metadata]) => {
                    acc[metadata.ethereumContractAddress] = metadata;
                    return acc;
                },
                {}
            ),
        [fungibleTokens]
    );

    const renderItem = (
        operation: Operation,
        primary: string,
        secondary: string | ReactNode,
        isLast: boolean
    ) => {
        return (
            <React.Fragment key={operation.hash}>
                <ListItem
                    className={classes.other}
                    button
                    onClick={(e) => {
                        e.preventDefault();
                        gotoOp(operation);
                    }}
                >
                    <ListItemText
                        primaryTypographyProps={{variant: 'body2'}}
                        primary={primary}
                        secondary={secondary}
                    />
                </ListItem>
                {!isLast && <Divider className={classes.divider}/>}
            </React.Fragment>
        );
    };

    const renderMint = (operation: WrapErc20Operation, isLast: boolean) => {
        const primaryText = () => {
            const {decimals, ethereumSymbol} = tokensByEthAddress[
                operation.token.toLowerCase()
                ];
            return `mint ${formatAmount(
                ethereumSymbol,
                operation.amount.minus(operation.fees),
                decimals
            )} to ${ellipsizeAddress(operation.destination)}`;
        };

        const secondaryText = () => {
            switch (operation.status.type) {
                case OperationStatusType.NEW:
                    return (
                        <Typography className={classes.secondary} variant={'body2'}>
                            Waiting for operation to be included
                        </Typography>
                    );
                case OperationStatusType.WAITING_FOR_CONFIRMATIONS:
                    return (
                        <Typography variant={'body2'} className={classes.secondary}>
                            Pending... {operation.status.confirmations} /{' '}
                            {operation.status.confirmationsThreshold} confirmations
                        </Typography>
                    );
                case OperationStatusType.WAITING_FOR_SIGNATURES:
                    return (
                        <React.Fragment>
                            <Typography
                                component="p"
                                variant={'body2'}
                                className={classes.secondary}
                            >
                                Waiting for signatures
                            </Typography>
                            <Typography
                                component="p"
                                variant={'body2'}
                                className={classes.secondary}
                            >
                                {`(${
                                    Object.keys(operation.status.signatures).length
                                }/${wrapSignatureThreshold} signatures received)`}
                            </Typography>
                        </React.Fragment>
                    );
                case OperationStatusType.READY:
                    return (
                        <Typography variant={'body2'} className={classes.secondary}>
                            Ready to mint
                        </Typography>
                    );
            }
        };

        return renderItem(operation, primaryText(), secondaryText(), isLast);
    };

    const renderBurn = (operation: UnwrapErc20Operation, isLast: boolean) => {
        const primaryText = () => {
            const {decimals, ethereumSymbol} = tokensByEthAddress[
                operation.token.toLowerCase()
                ];
            return `release ${formatAmount(
                ethereumSymbol,
                operation.amount,
                decimals
            )} to ${ellipsizeAddress(operation.destination)}`;
        };

        const secondaryText = () => {
            switch (operation.status.type) {
                case OperationStatusType.NEW:
                    return (
                        <Typography variant={'body2'} className={classes.secondary}>
                            Waiting for operation to be included
                        </Typography>
                    );
                case OperationStatusType.WAITING_FOR_CONFIRMATIONS:
                    return (
                        <Typography variant={'body2'} className={classes.secondary}>
                            Pending... {operation.status.confirmations} /{' '}
                            {operation.status.confirmationsThreshold} confirmations
                        </Typography>
                    );
                case OperationStatusType.WAITING_FOR_SIGNATURES:
                    return (
                        <React.Fragment>
                            <Typography
                                component="p"
                                variant={'body2'}
                                className={classes.secondary}
                            >
                                Waiting for signatures
                            </Typography>
                            <Typography
                                component="p"
                                variant={'body2'}
                                className={classes.secondary}
                            >
                                {`(${
                                    Object.keys(operation.status.signatures).length
                                }/${unwrapSignatureThreshold} signatures received)`}
                            </Typography>
                        </React.Fragment>
                    );
                case OperationStatusType.READY:
                    return (
                        <Typography variant={'body2'} className={classes.secondary}>
                            Ready to release
                        </Typography>
                    );
            }
        };

        return renderItem(operation, primaryText(), secondaryText(), isLast);
    };

    return (
        <>
            <OperationHistoryButton
                count={count}
                onClick={() => {
                    setOpen(!open);
                }}
            />
            <Dialog open={open} onBackdropClick={() => setOpen(false)} fullWidth>
                <DialogTitle disableTypography={true} className={classes.title}>
                    Pending operations
                </DialogTitle>
                {!canFetch && (
                    <PaperContent className={classes.other}>
                        <Typography variant={'body1'}>
                            Please connect to at least one wallet to see your pending
                            operations
                        </Typography>
                    </PaperContent>
                )}
                {canFetch && (
                    <List style={{padding: '0px'}}>
                        <ListSubheader className={classes.subHeader}>
                            Minting operations
                        </ListSubheader>
                        {operations.mints.map((o, i) =>
                            renderMint(o, i === operations.mints.length - 1)
                        )}
                        {operations.mints.length === 0 && (
                            <ListItem className={classes.other}>
                                <ListItemText>No pending minting operation</ListItemText>
                            </ListItem>
                        )}
                        <ListSubheader className={classes.subHeader}>
                            Release operations
                        </ListSubheader>
                        {operations.burns.map((o, i) =>
                            renderBurn(o, i === operations.burns.length - 1)
                        )}
                        {operations.burns.length === 0 && (
                            <ListItem className={classes.other}>
                                <ListItemText>No pending release operation</ListItemText>
                            </ListItem>
                        )}
                    </List>
                )}
            </Dialog>
        </>
    );
}
