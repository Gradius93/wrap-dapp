import {SwapDirectionTab} from '../features/swap/SwapDirectionTab';
import WrapInitialStep from '../features/wrap/components/WrapInitialStep';
import {useWrap} from '../features/wrap/hooks/useWrap';
import React, {useEffect, useState} from 'react';
import WrapConfirmStep from '../features/wrap/components/WrapConfirmStep';
import {useHistory} from 'react-router';
import {paths, wrapPage} from './routes';
import {Route} from 'react-router-dom';
import OperationScreen from './OperationScreen';
import {OperationType} from '../features/operations/state/types';
import {WrapStatus} from '../features/wrap/hooks/reducer';
import {usePendingOperationsActions} from '../features/operations/hooks/useOperation';

enum Step {
    AMOUNT,
    CONFIRM,
}

function WrapForm() {
    const {
        status,
        amountToWrap,
        currentAllowance,
        currentBalance,
        token,
        launchAllowanceApproval,
        selectAmountToWrap,
        balanceNotYetFetched,
        selectToken,
        launchWrap,
        connected,
        fungibleTokens,
        fees,
        ethAccount,
        tzAccount,
        agree,
        networkFees,
    } = useWrap();

    const [step, setStep] = useState(Step.AMOUNT);
    const {addOperation} = usePendingOperationsActions();

    const history = useHistory();

    const doLaunchWrap = async () => {
        const op = await launchWrap();
        if (!op) {
            return;
        }
        await addOperation(op);
        history.push(wrapPage(op));
        return op;
    };
    useEffect(() => {
        if (status === WrapStatus.NOT_READY && step === Step.CONFIRM) {
            setStep(Step.AMOUNT);
        }
    }, [status, step]);
    // noinspection RequiredAttributes
    return (
        <>
            {step === Step.AMOUNT && (
                <>
                    <SwapDirectionTab/>
                    <WrapInitialStep
                        status={status}
                        tokens={fungibleTokens}
                        token={fungibleTokens[token]}
                        connected={connected}
                        balance={{value: currentBalance, loading: balanceNotYetFetched}}
                        amount={amountToWrap}
                        fees={fees}
                        onNext={() => setStep(Step.CONFIRM)}
                        onTokenChange={selectToken}
                        onAmountChange={selectAmountToWrap}
                    />
                </>
            )}
            {step === Step.CONFIRM && (
                <WrapConfirmStep
                    token={fungibleTokens[token]}
                    fees={fees}
                    amount={amountToWrap}
                    status={status}
                    currentAllowance={currentAllowance}
                    recipientAddress={tzAccount!}
                    sendingAddress={ethAccount!}
                    onWrap={doLaunchWrap}
                    onAgreementChange={agree}
                    onAuthorize={launchAllowanceApproval}
                    onPrevious={() => setStep(Step.AMOUNT)}
                    networkFees={networkFees}

                />
            )}
        </>
    );
}

function WrapReceipt() {
    return <OperationScreen type={OperationType.WRAP}/>;
}

export default function WrapFlow() {
    return (
        <>
            <Route exact path={paths.WRAP} component={WrapForm}/>
            <Route exact path={paths.WRAP_FINALIZE} component={WrapReceipt}/>
        </>
    );
}
