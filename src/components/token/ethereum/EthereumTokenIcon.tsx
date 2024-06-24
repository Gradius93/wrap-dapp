import {TokenMetadata} from '../../../features/swap/token';


type Props = {
    tokenMetadata: TokenMetadata;
};

const EthereumTokenIcon = (props: Props) => {
    return (
        <img
            style={{width: 28, height: 28, marginRight: 5, verticalAlign: 'middle'}}
            src={`${process.env.PUBLIC_URL}/icons/ethereum/${props.tokenMetadata.ethereumContractAddress}.png`}
            alt={''}
            onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = `${process.env.PUBLIC_URL}/icons/default.png`;
            }}
        />
    );
};
export default EthereumTokenIcon;
