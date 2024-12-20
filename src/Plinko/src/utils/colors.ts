import type { RowCount } from '../types';

type RgbColor = { r: number; g: number; b: number };

/**
 * Creates a gradient of RGB colors of length `length`.
 *
 * @param from The starting RGB color.
 * @param to The ending RGB color.
 * @param length Number of colors in the output array. Must be `>= 2` since the first
 * and last color are `from` and `to`.
 */
export function interpolateRgbColors(from: RgbColor, to: RgbColor, length: number): RgbColor[] {
  return Array.from({ length }, (_, i) => ({
    r: Math.round(from.r + ((to.r - from.r) / (length - 1)) * i),
    g: Math.round(from.g + ((to.g - from.g) / (length - 1)) * i),
    b: Math.round(from.b + ((to.b - from.b) / (length - 1)) * i),
  }));
}

/**
 * Gets the background and shadow colors of each bin given the row count.
 */
export function getBinColors(rowCount: RowCount) {
  {
    const binCount = rowCount + 1;
    const isBinsEven = binCount % 2 === 0;
    
    let binColorsList={
      8:['rgb(229, 255, 0)','rgb(189, 255, 7)','rgb(189, 255, 7)','rgb(122, 243, 0)','rgb(0, 243, 32)'],
      10: ['rgb(229, 255, 0)','rgb(229, 255, 0)','rgb(189, 255, 7)','rgb(189, 255, 7)' ,'rgb(122, 243, 0)','rgb(0, 243, 32)'],
      12: ['rgb(255, 211, 13)','rgb(229, 255, 0)','rgb(229, 255, 0)','rgb(189, 255, 7)','rgb(189, 255, 7)' ,'rgb(122, 243, 0)','rgb(0, 243, 32)']
    }
    let binColorsShadowList={
      8:['rgb(137, 152, 0)','rgb(125, 170, 0)','rgb(125, 170, 0)','rgb(86, 171, 0)','rgb(0, 172, 23)'],
      10: ['rgb(137, 152, 0)','rgb(137, 152, 0)','rgb(125, 170, 0)','rgb(125, 170, 0)' ,'rgb(86, 171, 0)','rgb(0, 172, 23)'],
      12: ['rgb(188, 145, 0)','rgb(137, 152, 0)','rgb(137, 152, 0)','rgb(125, 170, 0)','rgb(125, 170, 0)' ,'rgb(86, 171, 0)','rgb(0, 172, 23)']
    }
    return {
      background: [...binColorsList[rowCount], ...binColorsList[rowCount].reverse().slice(isBinsEven ? 0 : 1)],
      shadow: [...binColorsShadowList[rowCount], ...binColorsShadowList[rowCount].reverse().slice(isBinsEven ? 0 : 1)],
    };
  }
}
