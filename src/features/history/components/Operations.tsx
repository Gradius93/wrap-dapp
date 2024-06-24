import * as React from 'react';
import {useMemo} from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {createStyles, Link, makeStyles, withStyles} from '@material-ui/core';
import {TokenMetadata} from '../../swap/token';
import Amount from '../../../components/formatting/Amount';
import IconSelect from './HistoryTokenSelection';
import {SupportedBlockchain} from '../../wallet/blockchain';
import {ellipsizeAddress} from '../../wallet/address';
import {Operation, OperationType} from '../../operations/state/types';

const StyledTableCell = withStyles(() =>
    createStyles({
        head: {
            backgroundColor: '#e5e5e5',
            color: 'black',
            padding: '0px',
            fontWeight: 'bold',
        },
        body: {
            fontSize: 14,
            padding: '20px',
            backgroundColor: 'white',
            '&:first-child': {
                borderRadius: '20px 0 0 20px',
            },
            '&:last-child': {
                borderRadius: '0 20px 20px 0',
            },
        },
    })
)(TableCell);

const StyledTableRow = withStyles(() =>
    createStyles({
        root: {
            margin: '50px',
        },
    })
)(TableRow);

const useStyles = makeStyles(() =>
    createStyles({
        table: {
            minWidth: 700,
            backgroundColor: '#e5e5e5',
            boxShadow: 'none',
            borderSpacing: '0 5px !important',
            borderCollapse: 'separate',
        },
        wrapper: {
            padding: '20px',
            backgroundColor: '#e5e5e5',
            borderRadius: '0 0 10px 10px',
        },
        icon: {
            padding: '20px',
        },
    })
);

const renderRow = (
    op: Operation,
    tokensByEthAddress: Record<string, TokenMetadata>
) => {
    switch (op.type) {
        case OperationType.WRAP:
            return (
                <StyledTableRow key={op.hash}>
                    <StyledTableCell align="left">
                        <IconSelect
                            blockchainTarget={SupportedBlockchain.Ethereum}
                            tokenMetadata={tokensByEthAddress[op.token]}
                        />
                        <Amount
                            symbol={tokensByEthAddress[op.token].ethereumSymbol}
                            value={op.amount}
                            decimals={tokensByEthAddress[op.token].decimals}
                        />
                    </StyledTableCell>
                    <StyledTableCell align="center">{op.source}</StyledTableCell>
                    <StyledTableCell align="center">{op.destination}</StyledTableCell>
                    <StyledTableCell align="center">{op.status.type}</StyledTableCell>
                    <StyledTableCell align="center">
                        <Link
                            href={`https://etherscan.io/tx/${op.hash}`}
                            rel="noreferrer"
                            target="_blank"
                            color="inherit"
                        >
                            {ellipsizeAddress(op.hash)}
                        </Link>
                    </StyledTableCell>
                </StyledTableRow>
            );
        case OperationType.UNWRAP:
            return (
                <StyledTableRow key={op.hash}>
                    <StyledTableCell align="left">
                        <IconSelect
                            blockchainTarget={SupportedBlockchain.Tezos}
                            tokenMetadata={tokensByEthAddress[op.token]}
                        />
                        <Amount
                            symbol={tokensByEthAddress[op.token].tezosSymbol}
                            value={op.amount}
                            decimals={tokensByEthAddress[op.token].decimals}
                        />
                    </StyledTableCell>
                    <StyledTableCell align="center">{op.source}</StyledTableCell>
                    <StyledTableCell align="center">{op.destination}</StyledTableCell>
                    <StyledTableCell align="center">{op.status.type}</StyledTableCell>
                    <StyledTableCell align="center">
                        <Link
                            href={`https://tzkt.io/${op.hash}`}
                            rel="noreferrer"
                            color="inherit"
                            target="_blank"
                        >
                            {ellipsizeAddress(op.hash)}
                        </Link>
                    </StyledTableCell>
                </StyledTableRow>
            );
    }
};

export type OperationsProps = {
    operations: Operation[];
    canFetch: boolean;
    fungibleTokens: Record<string, TokenMetadata>;
};

export default function Operations({
                                       operations,
                                       canFetch,
                                       fungibleTokens,
                                   }: OperationsProps) {
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
    const classes = useStyles();

    let active = operations.length > 0;

    return (
        <div style={{width: '100%'}}>
            {canFetch && (
                <div className={classes.wrapper}>
                    <TableContainer>
                        <Table className={classes.table} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center">Amount</StyledTableCell>
                                    <StyledTableCell align="center">Source</StyledTableCell>
                                    <StyledTableCell align="center">Destination</StyledTableCell>
                                    <StyledTableCell align="center">Status</StyledTableCell>
                                    <StyledTableCell align="center">
                                        Transaction Hash
                                    </StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {active ? (
                                    operations.map((r) => renderRow(r, tokensByEthAddress))
                                ) : (
                                    <TableRow>
                                        <TableCell>No data to display...</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}
        </div>
    );
}
