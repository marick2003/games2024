<template>
  <!-- Height clamping in mobile: From 10px at 370px viewport width to 16px at 600px viewport width -->
  <div class="flex h-[clamp(10px,0.352px+2.609vw,16px)] w-full justify-center ">
      <div class="flex gap-[1%]" :style="{ width: (binsWidthPercentage * 100) + '%' }">
        <!-- Font-size clamping:
              - Mobile (< 1024px): From 6px at 370px viewport width to 8px at 600px viewport width
              - Desktop (>= 1024px): From 10px at 1024px viewport width to 12px at 1100px viewport width
         -->
        <div v-for="(item, index) in binPayouts[game.rowCount][game.riskLevel]" :key="index"
          class="flex text-[#575757] font-bold min-w-0 flex-1 items-center justify-center rounded-[2px]
           text-[clamp(6px,2.784px+0.87vw,8px)] shadow-[0_5px_var(--shadow-color)]
             lg:text-[clamp(10px,-16.944px+2.632vw,12px)] lg:shadow-[0_3px_var(--shadow-color)]"
          :class="{'bounce': item > 0 ? game.isBallEnterBins[index] :''}"
          :style="{
            backgroundColor: item <= 0 ? 'transparent' : binColorsByRowCount[game.rowCount].background[index],
            '--shadow-color': item  <=  0 ? 'transparent' : binColorsByRowCount[game.rowCount].shadow[index]
          }"
        >
          {{ item > 0  ? item + (item < 100? 'x' : '' ): ''}}
        </div>
      </div>
</div>
</template>

<script setup lang="ts">
  import { watch } from 'vue';
  import { binColorsByRowCount, binPayouts } from '../../constants/game';
  import { useGameStore } from '@/stores/game';
  import { useSimulationStore } from '@/stores/simulation';
  const game = useGameStore();
  const simulation = useSimulationStore();

  interface Props {
    binsWidthPercentage: number;
  }

  defineProps<Props>();

  /**
   * Bounce animations for each bin, which is played when a ball falls into the bin.
   */
  watch(
    () => game.winRecords,
    (newWinRecords) => {
      if (simulation.isSimulationing) return;
      const lastWinBinIndex = newWinRecords[newWinRecords.length - 1].binIndex;
      // active animation boolean
      game.setIsBallEnterBins(lastWinBinIndex, true);
      setTimeout(() => {
        game.setIsBallEnterBins(lastWinBinIndex, false);
      }, 300);
    },
    { deep: true }
  );
</script>

<style scoped>
.bounce {
  animation: bounce 300ms cubic-bezier(0.18, 0.89, 0.32, 1.28), colorShift 200ms linear;
}

@keyframes bounce {
  0% { transform: translateY(0); }
  50% { transform: translateY(30%); }
  100% { transform: translateY(0); }
}
/* 顏色漸變效果 */
@keyframes colorShift {
  0% {
    background-color: rgba(173, 229, 255, 1);
    box-shadow: 0 5px rgba(70, 167, 213, 1);
  }
  100% {
    background-color: rgba(173, 229, 255, 1);
    box-shadow: 0 5px rgba(70, 167, 213, 1);
  }
}
</style>
