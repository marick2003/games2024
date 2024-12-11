import type { RowCount } from '../constants/game';
export type { RowCount } from '../constants/game';

export enum BetMode {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO',
}

/**
 * Game's risk level, which controls the volatility of payout.
 */
export enum RiskLevel {
  Swimming = 'Swimming',
  SmallMouth = 'SmallMouth',
  BigMouth= 'BigMouth',
}


export enum BallType {
  RED='RED',
  COLOR='COLOR',
}
/**
 * A record of the bet amount associated to every existing ball in the game
 * that is still in motion.
 *
 * When a ball enters a bin, its record is removed.
 */
export type BetAmountOfExistingBalls = {
  [ballId: number]: number;
};

export type WinRecord = {
  /**
   * UUID of the win record.
   */
  id: string;
  /**
   * How much the player has bet.
   */
  betAmount: number;
  /**
   * Number of pin rows at the time of winning.
   */
  rowCount: RowCount;
  /**
   * Zero-based index of which bin the ball fell into (leftmost bin is 0).
   */
  ballType: BallType ;
  binIndex: number;
  payout: {
    /**
     * Multiplier for the payout (e.g. `0.3`, `1.5`).
     */
    multiplier: number;
    /**
     * Actual payout amount.
     */
    value: number;
  };
  /**
   * Payout value minus the bet amount.
   */
  profit: number;
};

export type AutoBetSetting={
  betAmount: number;      // 初始下注金額
  ballType: string[];     // 投注球類型
  autoBetCount: number;   // 自動投注
  loseAdjustmentPercentage: number; // 若輸，金額增加 10%
  winAdjustmentPercentage: number;  // 若贏，金額減少 5%
  isSingleBetProfitLimit: boolean;  // 是否單注止盈
  singleBetProfitLimit: number;     // 單注止盈
  isCumulativeStopLoss: boolean;    // 是否累積止損
  cumulativeStopLoss: number;       // 累積止損
  iscumulativeStopWin:boolean;      // 是否累積止盈
  cumulativeStopWin: number;        // 累積止盈
}

export type DoBet = {
  Currency:string;
  BetMoney:number;
  Rows: number;
  Risk: string;
  BallType: string;
}

export type BetRecordSeedRequest = {
  Id: string
  Time: string
}

export type RefreshSeedRequest = {
  SeedType: string
}

export type UpdateSeedRequest = {
  NewClientSeed: string
  NewServiceSeed: string
}

