import RestoreIcon from '@material-ui/icons/Restore';
import {Badge, IconButton} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

export type OperationHistoryButtonProps = {
    count: number;
    onClick: () => void;
};

const useStyle = makeStyles((theme) => ({
    withContent: {
        color: '#DF318F',
    },
}));

export default function OperationHistoryButton({
                                                   count,
                                                   onClick,
                                               }: OperationHistoryButtonProps) {
    const classes = useStyle();
    return (
        <IconButton
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            color={'inherit'}
            className={count === 0 ? '' : classes.withContent}
        >
            <Badge badgeContent={count} color={'default'}>
                <RestoreIcon/>
            </Badge>
        </IconButton>
    );
}
