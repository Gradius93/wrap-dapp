import React, {useCallback} from 'react';
import {createStyles, makeStyles, Tab, Tabs, TabsProps,} from '@material-ui/core';
import {useHistory} from 'react-router';
import {useRouteMatch} from 'react-router-dom';
import {paths} from '../../screens/routes';

const useStyles = makeStyles(() =>
    createStyles({
        bg: {
            color: 'white',
            marginBottom: '10px',
        },
        tab: {
            textTransform: 'none',
            fontWeight: 900,
        },
    })
);

export const SwapDirectionTab: React.FC<TabsProps> = () => {
    const classes = useStyles();
    const history = useHistory();
    const {path} = useRouteMatch();
    const onTabChange = useCallback(
        (event: React.ChangeEvent<{}>, newPath: string) => {
            history.push(newPath);
        },
        [history]
    );

    return (
        <Tabs
            value={path}
            onChange={onTabChange}
            className={classes.bg}
            indicatorColor="primary"
            variant="fullWidth"
        >
            <Tab
                label={path === paths.WRAP ? 'wrapping' : 'wrap'}
                value={paths.WRAP}
                className={classes.tab}
            />
            <Tab
                label={path === paths.UNWRAP ? 'unwrapping' : 'unwrap'}
                value={paths.UNWRAP}
                className={classes.tab}
            />
        </Tabs>
    );
};
