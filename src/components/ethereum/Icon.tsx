import {SvgIcon, SvgIconProps} from '@material-ui/core';
import {ReactComponent as Eth} from './eth.svg';

const Icon = (props: SvgIconProps) => (
    <SvgIcon {...props} component={Eth} viewBox="0 0 12 20"/>
);
export default Icon;
