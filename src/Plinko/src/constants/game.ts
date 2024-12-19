import { BallType, RiskLevel } from '../types';
import { getBinColors } from '../utils/colors';
import { computeBinProbabilities } from '../utils/numbers';

export const LOCAL_STORAGE_KEY = {
  BALANCE: 'plinko_balance',
  SETTINGS: {
    ANIMATION: 'plinko_settings_animation',
  },
} as const;

/**
 * Range of row counts the game supports.
 */
export const rowCountOptions = [8,  10,  12] as const;

/**
 * Number of rows of pins the game supports.
 */
export type RowCount = (typeof rowCountOptions)[number];


/**
 * For each row count, the background and shadow colors of each bin.
 */
export const binColorsByRowCount = rowCountOptions.reduce(
  (acc, rowCount) => {
    acc[rowCount] = getBinColors(rowCount);
    return acc;
  },
  {} as Record<RowCount, ReturnType<typeof getBinColors>>,
);

/**
 * For each row count, what's the probabilities of a ball falling into each bin.
 */
export const binProbabilitiesByRowCount: Record<RowCount, number[]> = rowCountOptions.reduce(
  (acc, rowCount) => {
    acc[rowCount] = computeBinProbabilities(rowCount);
    return acc;
  },
  {} as Record<RowCount, number[]>,
);

export const binColor = {
  background: {
    red: { r: 255, g: 0, b: 63 }, // rgb(255, 0, 63)
    yellow: { r: 255, g: 192, b: 0 }, // rgb(255, 192, 0)
  },
  shadow: {
    red: { r: 166, g: 0, b: 4 }, // rgb(166, 0, 4)
    yellow: { r: 171, g: 121, b: 0 }, // rgb(171, 121, 0)
  },
} as const;

