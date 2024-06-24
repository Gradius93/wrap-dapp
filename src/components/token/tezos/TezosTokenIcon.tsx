import {TokenMetadata} from '../../../features/swap/token';

type Props = {
    tokenMetadata: TokenMetadata;
};

const TezosTokenIcon = (props: Props) => {
    return (
        <img
            style={{width: 28, height: 28, marginRight: 5, verticalAlign: 'middle'}}
            src={`https://cloudflare-ipfs.com/ipfs/${
                props.tokenMetadata.thumbnailUri ? props.tokenMetadata.thumbnailUri.replace('ipfs://', '') : ''
            }`}
            alt={''}
            onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = `${process.env.PUBLIC_URL}/icons/default.png`;
            }}
        />
    );
};
export default TezosTokenIcon;
