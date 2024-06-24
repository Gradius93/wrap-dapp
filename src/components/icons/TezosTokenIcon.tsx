type Props = {
    url: string;
};

const TezosTokenIcon = ({url}: Props) => {
    return (
        <img
            style={{width: 60, height: 60, marginRight: 5, verticalAlign: 'middle'}}
            src={`https://cloudflare-ipfs.com/ipfs/${url.replace('ipfs://', '')}`}
            alt={''}
            onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = `${process.env.PUBLIC_URL}/icons/default.png`;
            }}
        />
    );
};
export default TezosTokenIcon;
