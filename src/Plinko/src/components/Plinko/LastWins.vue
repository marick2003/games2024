<template>
  <div
    class="flex w-[clamp(1.5rem,0.893rem+2.857vw,32px)] flex-col rounded-sm text-[clamp(8px,5.568px+0.714vw,10px)] md:rounded-md lg:w-12 ">
    <div v-for="(item, index) in lastWins" :key="item.id" class="flex items-center">
      <div class="mb-[5px] flex">
        <div
          class="flex z-[1] aspect-square items-center justify-center  font-bold shadow-[0_3px_var(--shadow-color)] text-[#575757] rounded-[20px] w-[32px] h-[17px] px-[3px]"
          :style="index === 0 ? getLatestItemStyle() : getItemStyle(item)"
        >
          {{ item.payout.multiplier + (item.payout.multiplier < 100 && item.payout.multiplier > 0 ? '×' : '') }}
        </div>
        <span
          v-if="item.ballType === BallType.COLOR && item.payout.colorMultiplier > 1 && item.payout.multiplier > 0"
          class="text-[#fff] text-center absolute left-[1.7rem] z-0 w-[32px] h-[17px] px-[3px] rounded-tr-xl rounded-br-xl bg-[rgba(0,0,0,0.2)] text-[12px]"
        >
          2x
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BallType } from '@/types';
import { computed } from 'vue';
import { binColorsByRowCount } from '../../constants/game';
import { useGameStore } from '@/stores/game';

const game = useGameStore();

/**
 * Number of last wins to display.
 */
const winCount = 6;

const lastWins = computed(() => {
  return game.winRecords.slice(-winCount).reverse();
});

/**
 * Get the style for each item.
 */
const getItemStyle = (item: any) => {
  if (item.payout.multiplier === 0) {
    return {
      backgroundColor: 'rgba(176, 176, 176, 1)',
      '--shadow-color': 'rgba(139, 139, 139, 1)',
    };
  }
  const colors = binColorsByRowCount[game.rowCount];
  return {
    backgroundColor: colors.background[item.binIndex],
    '--shadow-color': colors.shadow[item.binIndex],
  };
};

/**
 * Get the style for the latest (first) item.
 */
const getLatestItemStyle = () => {
  return {
    backgroundColor: 'rgba(173, 229, 255, 1)',
    boxShadow: '0 3px rgba(70, 167, 213, 1)',
  };
};
</script>
