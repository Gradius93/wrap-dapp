import React from 'react';

type IconProps = {
  src: string;
}

export default function IconSelect({ src }: IconProps) {
  return (
    <img
      style={{ width: 28, height: 28, marginRight: 5, verticalAlign: 'middle' }}
      src={`https://cloudflare-ipfs.com/ipfs/${
        src ? src.replace('ipfs://', '') : ''
      }`}
      alt={''}
      onError={(e: any) => {
        e.target.onerror = null;
        e.target.src = `${process.env.PUBLIC_URL}/icons/default.png`;
      }}
    />
  );
}
