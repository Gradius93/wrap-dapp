import {Divider, styled} from '@material-ui/core';

export const SpacedDivider = styled(Divider)((theme) => ({
    marginTop: theme.theme.spacing(),
    marginBottom: theme.theme.spacing(),
}));
