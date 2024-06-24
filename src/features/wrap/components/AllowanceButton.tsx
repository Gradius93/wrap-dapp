import React from 'react';
import BigNumber from 'bignumber.js';
import LoadableButton from '../../../components/button/LoadableButton';

type Props = {
    currentAllowance: BigNumber;
    balanceToWrap: BigNumber;
    onAuthorize: () => void;
    loading: boolean;
    enabled?: boolean;
};

export default function AllowanceButton({
                                            currentAllowance,
                                            balanceToWrap,
                                            onAuthorize,
                                            loading,
                                            enabled = true
                                        }: Props) {
    const {finalized, text} = balanceToWrap.lte(currentAllowance)
        ? {
            finalized: true,
            text: 'Allowed',
        }
        : {
            finalized: false,
            text: 'Allow',
        };

    return (
        <LoadableButton
            loading={loading}
            onClick={onAuthorize}
            disabled={!enabled}
            text={text}
            finalized={finalized}
        />
    );
}
