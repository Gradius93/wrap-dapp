import {SvgIcon, SvgIconProps} from '@material-ui/core';
import {ReactComponent as Connect} from './connect.svg';

const Icon = (props: SvgIconProps) => (
    <SvgIcon {...props} component={Connect} viewBox="0 0 14 14"/>
);
export default Icon;
