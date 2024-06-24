import {useHistory} from 'react-router';
import {useRouteMatch} from 'react-router-dom';
import React, {useCallback} from 'react';
import {createStyles, makeStyles, Tab, Tabs} from '@material-ui/core';
import {paths} from '../../../screens/routes';


const useStyles = makeStyles(() =>
    createStyles({
        tabs: {
            color: 'white',
            marginBottom: '10px'
        }
    })
);

export default function HistoryTab() {
    const history = useHistory();
    const {path} = useRouteMatch();
    const classes = useStyles();
    const onTabChange = useCallback(
        (event: React.ChangeEvent<{}>, newPath: string) => {
            history.push(newPath);
        },
        [history]
    );

    return <Tabs
        value={path}
        onChange={onTabChange}
        className={classes.tabs}
        indicatorColor='primary'
    >
        <Tab
            label='Wraps'
            value={paths.HISTORY_WRAP}
        />
        <Tab
            label='Unwraps'
            value={paths.HISTORY_UNWRAP}
        />

    </Tabs>;
}