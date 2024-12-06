<template>
  <div
    class="flex w-[clamp(1.5rem,0.893rem+2.857vw,2rem)] flex-col  rounded-sm text-[clamp(8px,5.568px+0.714vw,10px)] md:rounded-md lg:w-12 lg:text-sm"
    :style="{ aspectRatio: 1 / winCount }"
  >
    <div
      v-for="item in lastWins"
      :key="item.id"
      class="flex aspect-square items-center justify-center text-xs font-bold shadow-[0_3px_var(--shadow-color)] text-[#575757] rounded-[20px] w-[35px] h-[20px] p-[2px] my-1"
      :style="getItemStyle(item)"
    >
      {{ item.payout.multiplier + (item.payout.multiplier < 100 && item.payout.multiplier > 0 ? '×' : '') }}
    </div>
  </div>
</template>

<script setup lang="ts">
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
</script>
