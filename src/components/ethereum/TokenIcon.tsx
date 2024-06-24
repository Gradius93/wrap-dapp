import {SvgIcon, SvgIconProps} from '@material-ui/core';
import {ElementType} from 'react';
import {ReactComponent as ERC20} from 'cryptocurrency-icons/svg/black/generic.svg';

type Props = {
    token: string;
} & SvgIconProps;

const buildSvg = (component: ElementType) => (props: SvgIconProps) => (
    <SvgIcon {...props} component={component} viewBox="0 0 32 32"/>
);

export default function TokenIcon({token, ...svgIconProps}: Props) {
    switch (token) {
        default:
            return buildSvg(ERC20)(svgIconProps);
    }
}
