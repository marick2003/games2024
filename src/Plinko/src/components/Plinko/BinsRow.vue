<template>
  <!-- Height clamping in mobile: From 10px at 370px viewport width to 16px at 600px viewport width -->
  <div class="flex h-[clamp(10px,0.352px+2.609vw,16px)] w-full justify-center ">
      <div class="flex gap-[1%]" :style="{ width: (binsWidthPercentage * 100) + '%' }">
        <!-- Font-size clamping:
              - Mobile (< 1024px): From 6px at 370px viewport width to 8px at 600px viewport width
              - Desktop (>= 1024px): From 10px at 1024px viewport width to 12px at 1100px viewport width
         -->
        <div v-if="game.binPayouts && game.binPayouts[game.rowCount] && game.binPayouts[game.rowCount][game.riskLevel]" 
         v-for="(item, index) in game.binPayouts[game.rowCount][game.riskLevel]" :key="index"
          class="flex binItem  text-[#575757] font-bold min-w-0 flex-1 items-center justify-center rounded-[2px]
           text-[0.6rem] shadow-[0_5px_var(--shadow-color)]
              lg:shadow-[0_3px_var(--shadow-color)]"
          :class="{'bounce': item > 0 ? game.isBallEnterBins[index] :'',
            'double': item > 0 ? game.isDoubleBet[index] :''
          }"
          :style="{
            backgroundColor: item <= 0 ? 'transparent' : binColorsByRowCount[game.rowCount].background[index],
            '--shadow-color': item  <=  0 ? 'transparent' : binColorsByRowCount[game.rowCount].shadow[index]
          }"
        >
          {{ item > 0  ? item + (item < 300? 'x' : '' ): ''}}
        </div>
      </div>
</div>
</template>

<script setup lang="ts">
  import { watch } from 'vue';
  import { binColorsByRowCount } from '../../constants/game';
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
     
      console.log(`output->newWinRecords`,newWinRecords)
      game.setIsBallEnterBins(lastWinBinIndex, true);
      if(newWinRecords[newWinRecords.length - 1].payout.colorMultiplier===2)
      {
        game.setIsDoubleBet(lastWinBinIndex, true);
      }
      
      setTimeout(() => {
        game.setIsBallEnterBins(lastWinBinIndex, false);
        game.setIsDoubleBet(lastWinBinIndex, false);
      }, 300);
    },
    { deep: true }
  );
</script>

<style scoped lang="scss">
.binItem{
   position: relative;
   &.bounce {
    animation: bounce 300ms cubic-bezier(0.18, 0.89, 0.32, 1.28), colorShift 200ms linear;
 
  }
  &.double{
    animation: bounce 300ms cubic-bezier(0.18, 0.89, 0.32, 1.28);
    animation-delay: 100ms;
      &:before {
        content: '';
        top: 100%; 
        left: 50%; 
        transform: translateX(-50%);
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.2); 
        border-radius: 0px 0px 12px 12px;
        padding: 2px 4px 20px 2px;
        z-index: 0; 
      }
      &:after {
        content: '2x'; 
        position:absolute;
        top: 113%; 
        left: 50%; 
        transform: translateX(-50%);
        font-size: 12px; 
        font-weight: bold;
        background: linear-gradient(155.35deg, #FA4736 12.55%, #FC9A22 25.26%, #EEE33F 41.71%, #4AC99B 58.16%, #2BBCFF 72.37%, #FC5EFF 87.33%);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
      }
    }

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
