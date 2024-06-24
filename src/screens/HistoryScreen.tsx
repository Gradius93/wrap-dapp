import React from 'react';
import {paths} from './routes';
import {Route, RouteComponentProps} from 'react-router-dom';
import HistoryWrapOperations from '../features/history/components/HistoryWrapOperations';
import HistoryUnwrapOperations from '../features/history/components/HistoryUnwrapOperations';
import {Container} from '@material-ui/core';

export default function HistoryScreen({location, history}: RouteComponentProps) {
    if (location.pathname === '/history') {
        history.replace(paths.HISTORY_WRAP);
    }
    return (
        <>
            <Container maxWidth="xl">
                <Route path={paths.HISTORY_WRAP} component={HistoryWrapOperations}/>
                <Route path={paths.HISTORY_UNWRAP} component={HistoryUnwrapOperations}/>
            </Container>
        </>
    );
}
