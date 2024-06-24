import {PaperActions, PaperHeader, PaperNav, PaperTitle,} from '../paper/Paper';
import {IconButton} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React from 'react';
import {useHistory} from 'react-router';

export default function FarmingContractHeader({title, path}: {
    title: string;
    path: string;
}) {
    const history = useHistory();
    return (
        <PaperHeader>
            <PaperNav>
                <IconButton
                    onClick={() => {
                        history.push(path);
                    }}
                >
                    <ArrowBackIcon/>
                </IconButton>
            </PaperNav>
            <PaperTitle>
                {title}
            </PaperTitle>
            <PaperActions/>
        </PaperHeader>
    );
}
