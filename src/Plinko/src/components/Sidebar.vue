<template>
    <div class="flex flex-col gap-2 p-3 z-[1] mt-[-65px]   md:mt-[-62px]">
        <!-- <div class="flex gap-1 rounded-full bg-slate-900 p-1">
            <button v-for="item in betModes" :key="item.label" :value="item.value"
                class='flex-1 rounded-full py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50
                hover:[&:not(:disabled)]:bg-slate-600 active:[&:not(:disabled)]:bg-slate-500'
                :class="{ 'bg-slate-600' : betMode === item.value }"
                @click="betMode = item.value"
                :disabled="autoBetInterval !== null"
            >
                {{ item.label }}
            </button>
        </div> -->

        <div class="flex items-center justify-between flex-row gap-2">
            
            <button v-if="!game.autoBetInterval" @click="game.autoSettingDialog.visible = true " class="autoBtn rounded-full  mx-2"></button>
            <button v-else="game.autoBetInterval" @click="handleStopAutoBet" class="stopBtn rounded-full  mx-2 text-white font-bold">
              {{ game.autoBetSetting.autoBetCount === Infinity ? '∞' : game.autoBetSetting.autoBetCount }}
            </button>
            <div class="flex justify-end items-center">
                <button
                  @click="handleBetClick(BallType.RED)"
                  :disabled="isDropBallDisabled"
                  class='dropBallBtn redBall mr-2'
              >
                          </button>
                <button
                    @click="handleBetClick(BallType.COLOR)"
                    :disabled="isDropBallDisabled"
                    class="dropBallBtn colorBall"
                >
              </button>
            </div>
        </div>
        <div v-if="!simulation.isSimulationing" class="relative rounded-md px-2 py-1 border border-[#45698C] text-center">
          <div class="flex justify-between items-center betContent">
             <button class="minBtn" @click="handleMinBet"></button>
              <button class="halfBtn" @click="handleHalfBet"></button>
              <button class="reduceBtn" @click="handleReduceBet"></button>
              <div class="flex flex-col mt-[-10px]">
                <label for="betAmount" class="text-xs text-[#45698C] font-bold">{{$t('BetAmount')}}</label>
                <div class="flex items-center">
                  <div class="absolute  w-[4%] mx-[5px]">
                    <img class="" src="@/assets/images/svg/icon_btc.svg"/>
                  </div>
                  <input @blur="validateBetAmount" v-model="currentBetAmount" class="text-center w-28 focus:outline-none bg-transparent border-0 text-[#00F320] text-xs font-bold"></input>
                </div>
              </div>
              <button class="addBtn" @click="handleAddBet"></button>
              <button class="towxBtn" @click="handleDoubleBet"></button>
              <button class="maxBtn" @click="handleMaxBet"></button>
          </div>

        </div>

        <div class="flex justify-between">
          <div class="rounded-md px-[14px] pt-2 border border-[#45698C] text-center">
                <SlideSwitcher
                v-model="currentRowCount"
                :items="rowCounts"
                type="vertical"
                :disabled="hasOutstandingBalls || autoBetInterval !== null"
              >
                <template #default="{ currentItem }">
                  <div class="risk-item text-[#00F320] min-w-12 text-xs font-bold">{{ currentItem.value }}</div>
                </template>
              </SlideSwitcher>
              <p class=" text-[#45698C] text-xs font-bold py-1">Rows</p>
          </div>
          <div class="rounded-md px-[14px] pt-2 border border-[#45698C] text-center ">
                <SlideSwitcher
                  class=" bg-[#305171] rounded-xl px-3"
                  v-model="currentRiskLevel"
                  :items="riskLevels"
                  type="horizontal"
                  :disabled="hasOutstandingBalls || autoBetInterval !== null"
                >
                  <template #default="{ currentItem }">
                    <div class="risk-item text-[#00F320] min-w-32  text-xs  font-bold">{{ currentItem.label }}</div>
                  </template>
                </SlideSwitcher>
                  <p class=" text-[#45698C] text-xs font-bold py-1">Mouth Size</p>
              </div>
        </div>
        <button
            v-if="simulation.isSimulationing"
            @click="simulation.exportToJsonFile"
            class='touch-manipulation rounded-md bg-green-500 py-3 font-semibold text-slate-900 transition-colors
            hover:bg-green-400 active:bg-green-600 disabled:bg-neutral-600 disabled:text-neutral-400'
        >
            {{ 'Export to JSON' }}
        </button>

        <div v-if="env === 'development'" class="mt-auto ">
          <div class="flex items-center gap-4 border-t border-slate-600 pt-3">
            <div class="flex item-center">
              <div class="text-[16px] text-[white] pr-[2px]">{{ 'Open Simulation' }}</div>
              <Switch v-model="simulation.isSimulationing" />
            </div>
          </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { autoBetIntervalMs, rowCountOptions } from '../constants/game';
import { BetMode, RiskLevel , BallType, type RowCount } from '../types';
import { PhChartLine, PhGearSix, PhInfinity, PhQuestion } from '@phosphor-icons/vue';
import { useGameStore } from '../stores/game';
import { useSimulationStore } from '../stores/simulation';
import Switch from '../components/UI/Switch.vue';
import SlideSwitcher from '../components/UI/SlideSwitcher.vue';
import AutoSettingDialog from './AutoSettingDialog.vue';
import { useI18n } from 'vue-i18n'
const { t: $t  } = useI18n()
const game = useGameStore();
const simulation = useSimulationStore();

const { rowCount, riskLevel } = game;

const env = ref<string>(import.meta.env.VITE_ENV);

const isMouseEnterNumberBetHint = ref<boolean>(false);

const betMode = ref(BetMode.MANUAL);

/**
 * When `betMode` is `AUTO`, the number of bets to be placed. Zero means infinite bets.
 */
const autoBetInput = ref<number>(0);

/**
 * Number of auto bets remaining when `betMode` is `AUTO`.
 *
 * - `number`: Finite count of how many bets left. It decrements from `autoBetInput` to 0.
 * - `null`: For infinite bets (i.e. `autoBetInput` is 0).
 */
const autoBetsLeft = ref<number | null>(null);

const autoBetInterval = ref<ReturnType<typeof setInterval> | null>(null);

const currentRowCount = ref<RowCount>(rowCount);

const currentRiskLevel = ref<RiskLevel>(riskLevel);

const currentBetAmount = computed({
  get() {
    return game.betAmount.toFixed(8);
  },
  set(newValue) {
    game.setBetAmount(newValue);
  }
});

const isBetAmountNegative = computed(() => {
    return currentBetAmount.value < 0;
});

const isBetExceedBalance = computed(() => {
    return currentBetAmount.value > game.balance;
});

const isAutoBetInputNegative = computed(() => {
    return autoBetInput.value < 0;
});

const isDropBallDisabled = computed(() => {
    return isBetAmountNegative.value || isBetExceedBalance.value || isAutoBetInputNegative.value;
});

const hasOutstandingBalls = computed(() => {
    return Object.keys(game.betAmountOfExistingBalls).length > 0;
});




const resetAutoBetInterval = () => {
    if (autoBetInterval.value !== null) {
        clearInterval(autoBetInterval.value);
        autoBetInterval.value = null;
    }
};

const autoBetDropBall = () => {
    if (isBetExceedBalance.value) {
      resetAutoBetInterval();
      return;
    }

    // Infinite mode
    if (autoBetsLeft.value === null) {
      game.setDropBall(true);
      return;
    }

    // Finite mode
    if (autoBetsLeft.value > 0) {
      game.setDropBall(true);
      autoBetsLeft.value -= 1;
    }
    if (autoBetsLeft.value === 0 && autoBetInterval.value !== null) {
      resetAutoBetInterval();
      return;
    }
};

// const handleAutoBetInputFocusOut = () => {
//     if (isNaN(autoBetInputValue.value)) {
//       autoBetInput.value = -1; // If input field is empty, this forces re-render so its value resets to 0
//       autoBetInput.value = 0;
//     } else {
//       autoBetInput.value = autoBetInputValue.value;
//     }
// };
let betClickTimeout = false; // 防止連點的標誌
const handleBetClick = (ballType:BallType) => {
    if (betClickTimeout) return; 

    betClickTimeout = true; 
    setTimeout(() => {
      betClickTimeout = false; 
    }, 200); 
    game.setBallType(ballType);
    if (betMode.value === BetMode.MANUAL) {
        console.log("Drop Ball");
        game.setDropBall(true);
    } else if (autoBetInterval.value === null) {
        autoBetsLeft.value = autoBetInput.value === 0? null : autoBetInput.value;
        autoBetInterval.value = setInterval(autoBetDropBall, autoBetIntervalMs)
    } else if (autoBetInterval.value !== null) {
        resetAutoBetInterval();
    }
};

const betModes = [
    { value: BetMode.MANUAL, label: $t('Manual') },
    { value: BetMode.AUTO, label: $t('Auto') },
];
const riskLevels = [
    { value: RiskLevel.Swimming, label: 'Close Mouth' },
    { value: RiskLevel.SmallMouth, label: 'Small Mouth' },
    { value: RiskLevel.BigMouth, label: 'Big Mouth' },
];
const rowCounts = rowCountOptions.map((value) => ({ value, label: value.toString() }));

watch(currentRiskLevel, (newRiskLevel) => {
    game.setRiskLevel(newRiskLevel);
});
watch(currentRowCount, (newRowCount) => {
    game.setRowCount(newRowCount);
});

const handleHalfBet = () => {
  const newBetAmount = Math.max((game.betAmount / 2), game.minBetAmount);
  game.setBetAmount(newBetAmount);
};

const handleReduceBet = () => {
  const newBetAmount = Math.max((game.betAmount - game.oneBetAmount), game.minBetAmount);
  game.setBetAmount(newBetAmount);
};

const handleAddBet = () => {
  const newBetAmount = Math.min((game.betAmount +  game.oneBetAmount) , game.maxBetAmount);
  game.setBetAmount(newBetAmount);
};

const handleDoubleBet = () => {
  const newBetAmount = Math.min((game.betAmount * 2), game.maxBetAmount);
  game.setBetAmount(newBetAmount);
};
const handleMinBet = ()=>{
  game.setBetAmount(game.minBetAmount);
}
const handleMaxBet = () => {
  game.setBetAmount(game.maxBetAmount);
};

const validateBetAmount = () => {
  if (game.betAmount < game.minBetAmount) {
    game.setBetAmount(game.minBetAmount);
  } else if (game.betAmount > game.maxBetAmount) {
    game.setBetAmount(game.maxBetAmount);
  }
};
const handleStopAutoBet=()=>{
  game.resetAutoBetInterval()
}
</script>

<style scoped lang="scss">
select {
  padding: 8px 2px 8px 2px;
  background-color: #0f172a;
  color: #fff;
}
select option {
  margin: 40px;
  background-color: #0f172a;
  color: #fff;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
}
.autoBtn{
    background: url(../assets/images/svg/auto_btn.svg) no-repeat;
    background-size: cover;
    width: 58px;
    height: 58px;
}
.stopBtn{
    background: url(../assets/images/svg/stop_btn.svg) no-repeat;
    background-size: cover;
    width: 58px;
    height: 58px;
}
.dropBallBtn{
  width: 128px;
  height: 58px;
  border-radius: 20px;
  &.redBall{
    background: url(../assets/images/svg/redBtn.svg) no-repeat;
    background-size: cover;
        &:active{
          background: url(../assets/images/svg/redBtn_pass.svg) no-repeat;
          background-size: contain;
        }
  }
  &.colorBall{
    background: url(../assets/images/svg/colorBtn.svg) no-repeat;
    background-size: cover;
    &:active{
          background: url(../assets/images/svg/colorBtn_pass.svg) no-repeat;
          background-size: contain;
        }
  }

}
.betContent{
      .minBtn{
         width: 36px;
         height: 36px;
         background: url(../assets/images/svg/minBtn.svg) no-repeat;
         background-size: contain;
      }
      .halfBtn{
         width: 36px;
         height:36px;
         background: url(../assets/images/svg/halfBtn.svg) no-repeat;
         background-size: contain;
      }
      .reduceBtn{
         width: 26px;
         height: 26px;
         background: url(../assets/images/svg/reduceBtn.svg) no-repeat;
         background-size: contain;
      }
      .addBtn{
         width: 26px;
         height: 26px;
         background: url(../assets/images/svg/addBtn.svg) no-repeat;
         background-size: contain;
      }
      .towxBtn{
         width: 36px;
         height:36px;
         background: url(../assets/images/svg/2xBtn.svg) no-repeat;
         background-size: contain;
      }
      .maxBtn{
         width: 36px;
         height: 36px;
         background: url(../assets/images/svg/maxBtn.svg) no-repeat;
         background-size: contain;
      }
}
</style>
