import { FarmConfig } from '../../config';
import { PaperContent } from '../../components/paper/Paper';
import { Grid, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TezosTokenIcon from '../../components/icons/TezosTokenIcon';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Duration } from 'luxon';
import { useWalletContext } from '../../runtime/wallet/WalletContext';

export enum FarmStyle {
  CLASSIC,
  OLD
}

export type FarmListProps = {
  farms: FarmConfig[];
  onProgramSelect: (farm: string) => void;
  style: FarmStyle
};

const useStyle = makeStyles(() =>
  createStyles({
    main: {
      borderRadius: '10px 10px 10px 10px',
      backgroundColor: 'white',
      transition: 'background-color 1s ease',
      '&:hover': {
        backgroundColor: '#FFD000',
      },
    },
    option: {
      fontSize: '20px',
    },
    rewards: {
      fontSize: '12px',

      '& > span': {
        fontWeight: 900,
      },
    },
    apy: {
      fontSize: '14px',

      '& > span': {
        fontWeight: 900,
      },
    },
    item: {
      '&:hover': {
        cursor: 'pointer',
      },
    },
    old: {
      backgroundColor: '#B1B1B1'
    },
    leftGridItem: {
      flexGrow: 1,
      paddingLeft: '20px',
      textAlign: 'left',
    },
    images: {
      '& img': {
        width: 60,
        height: 60,
        marginRight: 5,
        verticalAlign: 'middle',
      },
      '& :first-child': { left: '0', position: 'relative' },
    },
  })
);

function Rewards({
  currentTezosLevel,
  farmConfig,
  className,
  apyClassName
}: {
  currentTezosLevel: number;
  farmConfig: FarmConfig;
  className: string;
  apyClassName: string;
}) {
  if (farmConfig.rewards && currentTezosLevel > 0) {
    const currentTotalRewards = new BigNumber(farmConfig.rewards.totalRewards)
      .shiftedBy(-farmConfig.rewardTokenDecimals)
      .dp(8)
      .toString(10);
    const currentStakedTotens = new BigNumber(farmConfig.farmTotalStaked ?? 0)
      .shiftedBy(-farmConfig.farmStakedToken.decimals)
      .dp(8)
      .toString(10);
    const endLevel =
      +farmConfig.rewards.startLevel + +farmConfig.rewards.duration;
    const periodEnded = endLevel < currentTezosLevel;
    const currentPeriodProgress = periodEnded
      ? 100
      : ((currentTezosLevel - +farmConfig.rewards.startLevel) /
          +farmConfig.rewards.duration) *
        100;
    const nextRewardsDuration = Duration.fromMillis(
      (endLevel - currentTezosLevel) * 30 * 1000
    );

    const nextRewardLabel = periodEnded
      ? 'Awaiting new rewards period'
      : `New rewards in ${
          endLevel - currentTezosLevel
        } blocks. (Approx. ${nextRewardsDuration.as('hour').toFixed(1)} hours)`;

    return (
      <>
        { farmConfig.apy && <Typography className={apyClassName}>
            APY: <span>{farmConfig.apy}%</span>{'  '}APR: <span>{farmConfig.apr}%</span>
          </Typography>
        }
        <Typography className={className}>
          {farmConfig.rewardTokenSymbol} rewards:{' '}
          <span>{currentTotalRewards}</span>
        </Typography>
        <Typography className={className}>
          Total ${farmConfig.farmStakedToken.symbol} staked:{' '}
          <span>{currentStakedTotens}</span>
        </Typography>
        <Typography className={className}>
          Period progress: <span>{currentPeriodProgress.toFixed(1)}%</span>
        </Typography>
        <Typography className={className}>{nextRewardLabel}</Typography>
      </>
    );
  }
  return <></>;
}

function FarmSelector({
  currentTezosLevel,
  farmConfig,
  onClick,
  style
}: {
  currentTezosLevel: number;
  farmConfig: FarmConfig;
  onClick: () => void;
  style: FarmStyle
}) {
  const classes = useStyle();
  return (
    <PaperContent className={`${classes.main} ${style === FarmStyle.OLD ? classes.old : ''}`}>
      <Grid
        container
        justify={'space-between'}
        alignItems={'center'}
        onClick={onClick}
        className={classes.item}
      >
        <Grid item className={classes.images}>
          <TezosTokenIcon
            url={farmConfig.rewardTokenThumbnailUri ?? 'ipfs://'}
          />
        </Grid>
        <Grid item className={classes.leftGridItem}>
          <Typography className={classes.option}>
            {farmConfig.rewardTokenName} farm
          </Typography>
          <Rewards
            currentTezosLevel={currentTezosLevel}
            farmConfig={farmConfig}
            className={classes.rewards}
            apyClassName={classes.apy}
          />
        </Grid>
        <Grid item>
          <IconButton>
            <ArrowForwardIcon />
          </IconButton>
        </Grid>
      </Grid>
    </PaperContent>
  );
}

export default function FarmList({ farms, onProgramSelect, style }: FarmListProps) {
  const [currentTezosLevel, setCurrentTezosLevel] = useState(0);
  const walletContext = useWalletContext();
  const { library } = walletContext.tezos;

  useEffect(() => {
    async function loadCurrentTezosLevel() {
      if (library) {
        const blockHeader = await library.rpc.getBlockHeader();
        setCurrentTezosLevel(blockHeader.level);
      }
    }
    loadCurrentTezosLevel();
  }, [library]);

  return (
    <Grid container spacing={2} direction={'column'}>
      {farms.map((farmConfig) => (
        <Grid item key={farmConfig.farmContractAddress}>
          <FarmSelector
            currentTezosLevel={currentTezosLevel}
            farmConfig={farmConfig}
            onClick={() => onProgramSelect(farmConfig.farmContractAddress)}
            style={style}
          />
        </Grid>
      ))}
    </Grid>
  );
}
