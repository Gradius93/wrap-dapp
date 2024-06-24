import React from 'react';
import {allFarmsPaths, farmPaths, oldFarmPaths, paths} from '../routes';
import {Route} from 'react-router-dom';
import {Container} from '@material-ui/core';
import FarmChoice from './FarmChoice';
import Farm from './Farm';
import AllFarms from './AllFarms';
import OldFarm from './OldFarm';

export default function FarmingScreen() {
    return (
        <Container maxWidth={'md'}>
            <Route exact path={paths.FARMING_ROOT} component={FarmChoice}/>
            <Route exact path={farmPaths} component={Farm}/>
            <Route exact path={oldFarmPaths} component={OldFarm}/>
            <Route exact path={allFarmsPaths} component={AllFarms}/>
        </Container>
    );
}
