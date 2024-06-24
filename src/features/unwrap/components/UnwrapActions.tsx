import React from 'react';
import LoadableButton from '../../../components/button/LoadableButton';
import {UnwrapStatus} from '../hooks/reducer';

export type UnwrapActionsProp = {
    onUnwrap: () => void;
    status: UnwrapStatus;
};

export default function UnwrapActions({status, onUnwrap}: UnwrapActionsProp) {
    return (
        <LoadableButton
            loading={status === UnwrapStatus.WAITING_FOR_UNWRAP}
            onClick={onUnwrap}
            disabled={status !== UnwrapStatus.READY_TO_UNWRAP}
            text={'Unwrap'}
        />
    );
}
