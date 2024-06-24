import {Box, createStyles, makeStyles, PaperProps, styled,} from '@material-ui/core';
import * as React from 'react';
import {PropsWithChildren} from 'react';

const useStyles = makeStyles(() =>
    createStyles({
        card: {
            backgroundColor: '#E5E5E5',
        },
        alternate: {
            backgroundColor: '#C4C4C4'
        }
    })
);

export type WrapPaperProps = PaperProps;

const useHeaderStyle = makeStyles((theme) =>
    createStyles({
        head: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: theme.spacing(),
            paddingBottom: theme.spacing(),
            paddingLeft: theme.spacing(),
            paddingRight: theme.spacing(),
            backgroundColor: '#E5E5E5',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: 'inset 0 -7px 9px -7px rgba(0,0,0,0.4)',
        },
        padding: {
            paddingTop: theme.spacing() * 2.5,
        },

    })
);

export const PaperHeader = ({
                                extraPadding = false,
                                children,
                            }: PropsWithChildren<{ extraPadding?: boolean }>) => {
    const classes = useHeaderStyle();
    return (
        <header
            className={`${classes.head} ${extraPadding ? classes.padding : ''}`}
        >
            {children}
        </header>
    );
};

export const PaperTitle = styled('div')({
    justifySelf: 'center',
    textAlign: 'center',
    width: '100%',
});

export const PaperNav = styled('div')({
    justifySelf: 'flex-start',
    minWidth: 72,
});

export const PaperActions = styled('div')({
    justifySelf: 'flex-end',
    minWidth: 72,
    '& > *': {
        margin: '0 4px',
        '&:first-child': {
            marginLeft: 0,
        },
        '&:last-child': {
            marginRight: 0,
        },
    },
});

export const PaperFooter = styled('div')({
    minHeight: '60px',
    padding: '20px 90px',
    textAlign: 'center',
    borderRadius: '0 0 10px 10px',
    backgroundColor: '#E5E5E5'
});

export function PaperContent(
    props: React.HTMLAttributes<HTMLDivElement> & {
        alternate?: boolean;
    }) {
    const classes = useStyles();
    const {className, alternate = false, ...rest} = props;
    const alternateClass = alternate ? classes.alternate : '';

    return <Box className={`${classes.card} ${className} ${alternateClass}`} p={2} {...rest} />;
}

// what is this for?

export function PaperSection() {
}
