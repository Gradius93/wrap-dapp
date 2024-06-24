import {SvgIcon, SvgIconProps} from '@material-ui/core';
import {ReactComponent as Tezos} from './xtz.svg';

const Icon = (props: SvgIconProps) => (
    <SvgIcon {...props} component={Tezos} viewBox="0 0 13 18"/>
);
export default Icon;

