<template>
    <div class="flex flex-col gap-2 p-3 z-[1] mt-[-75px]   md:mt-[-75px]">
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
              <button :disabled="hasOutstandingBalls || isDropBallDisabled" class="minBtn" @click="handleMinBet"></button>
              <button :disabled="hasOutstandingBalls || isDropBallDisabled" class="halfBtn" @click="handleHalfBet"></button>
              <button :disabled="hasOutstandingBalls || isDropBallDisabled" class="reduceBtn" @click="handleReduceBet"></button>
              <div class="flex flex-col mt-[-10px]">
                <label for="betAmount" class="text-xs text-[#45698C] font-bold"> Bet Amount </label>
                <div class="flex items-center">    
                  <input type="number"
                    :step="game.oneBetAmount" :disabled="hasOutstandingBalls || isDropBallDisabled"
                     @blur="validateBetAmount" v-model.number="currentBetAmount" 
                     class="no-step text-center w-28 focus:outline-none bg-transparent border-0 text-[#00F320] text-xs font-bold">
                    </input>
                </div>
              </div>
              <button :disabled="hasOutstandingBalls || isDropBallDisabled" class="addBtn" @click="handleAddBet"></button>
              <button :disabled="hasOutstandingBalls || isDropBallDisabled" class="towxBtn" @click="handleDoubleBet"></button>
              <button :disabled="hasOutstandingBalls || isDropBallDisabled" class="maxBtn" @click="handleMaxBet"></button>
          </div>

        </div>

        <div class="flex justify-between">
          <div class="rounded-md px-[14px] pt-2 border border-[#45698C] text-center">
                <SlideSwitcher
                v-model="currentRowCount"
                :items="rowCounts"
                type="vertical"
                :disabled="isDropBallDisabled || hasOutstandingBalls"
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
                  :disabled="isDropBallDisabled || hasOutstandingBalls"
                >
                  <template #default="{ currentItem }">
                    <div class="risk-item text-[#00F320] min-w-32  text-xs  font-bold">{{ currentItem.label }}</div>
                  </template>
                </SlideSwitcher>
                  <p class=" text-[#45698C] text-xs font-bold py-1">Crocodile Mouth Sizes</p>
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

        <div v-if="env === 'development'" class="mt-auto hidden">
          <div class="flex items-center gap-4 border-t border-slate-600 pt-3 ">
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
import { rowCountOptions } from '../constants/game';
import { BetMode, RiskLevel , BallType, type RowCount } from '../types';
import { PhChartLine, PhGearSix, PhInfinity, PhQuestion } from '@phosphor-icons/vue';
import { useGameStore } from '../stores/game';
import { useSimulationStore } from '../stores/simulation';
import Switch from '../components/UI/Switch.vue';
import SlideSwitcher from '../components/UI/SlideSwitcher.vue';
import { filterNonNumeric } from '@/utils/numbers';
import { useI18n } from 'vue-i18n'
import Decimal from 'decimal.js';
const { t: $t  } = useI18n()
const game = useGameStore();
const simulation = useSimulationStore();

const { rowCount, riskLevel } = game;

const env = ref<string>(import.meta.env.VITE_ENV);

const betMode = ref(BetMode.MANUAL);

const currentRowCount = ref<RowCount>(rowCount);

const currentRiskLevel = ref<RiskLevel>(riskLevel);

const currentBetAmount = computed<any>({
  get() {
    const value = new Decimal(game.betAmount).toFixed(6);
    // value.includes('.') ? value.replace(/(\.\d*?)0+$/, "$1") : 
    return value;
  },
  set(newValue: number) {
    game.setBetAmount(new Decimal(newValue).toNumber());
  }
});

const isBetAmountNegative = computed(() => {
  return new Decimal(currentBetAmount.value).isNegative();
});

const isBetExceedBalance = computed(() => {
  return new Decimal(currentBetAmount.value).greaterThan(game.balance);
});


const isDropBallDisabled = computed(() => {
  return  isBetAmountNegative.value || isBetExceedBalance.value || game.autoBetInterval !== null;
});

const hasOutstandingBalls = computed(() => {
    return Object.keys(game.betAmountOfExistingBalls).length > 0;
});


let betClickTimeout = false; // 防止連點的標誌
const handleBetClick = (ballType:BallType) => {
    if (betClickTimeout) return; 
    betClickTimeout = true; 
    setTimeout(() => {
      betClickTimeout = false; 
    }, 400); 
    game.setBallType(ballType);
    if (betMode.value === BetMode.MANUAL) {
        console.log("Drop Ball");
        game.setDropBall(true);
    } 
};

const riskLevels = [
    { value: RiskLevel.Swimming, label: 'Closed' },
    { value: RiskLevel.SmallMouth, label: 'Small' },
    { value: RiskLevel.BigMouth, label: 'Big' },
];
const rowCounts = rowCountOptions.map((value) => ({ value, label: value.toString() }));

watch(currentRiskLevel, (newRiskLevel) => {
    game.setRiskLevel(newRiskLevel);
});
watch(currentRowCount, (newRowCount) => {
    game.setRowCount(newRowCount);
});

const handleHalfBet = () => {
  const newBetAmount = Decimal.max(new Decimal(game.betAmount).div(2), game.minBetAmount);
  game.setBetAmount(newBetAmount.toNumber());
};

const handleReduceBet = () => {
  const newBetAmount = Decimal.max(new Decimal(game.betAmount).minus(game.oneBetAmount), game.minBetAmount);
  game.setBetAmount(newBetAmount.toNumber());
};

const handleAddBet = () => {
  const newBetAmount = Decimal.min(new Decimal(game.betAmount).plus(game.oneBetAmount), game.maxBetAmount);
  game.setBetAmount(newBetAmount.toNumber());
};

const handleDoubleBet = () => {
  const newBetAmount = Decimal.min(new Decimal(game.betAmount).times(2), game.maxBetAmount);
  game.setBetAmount(newBetAmount.toNumber());
};
const handleMinBet = ()=>{
  game.setBetAmount(game.minBetAmount);
}
const handleMaxBet = () => {
  game.setBetAmount(game.maxBetAmount);
};

const validateBetAmount = () => {
  const betAmount = new Decimal(game.betAmount);
  if (betAmount.lessThan(game.minBetAmount)) {
    game.setBetAmount(game.minBetAmount);
  } else if (betAmount.greaterThan(game.maxBetAmount)) {
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
.dropBallBtn {
  width: 128px;
  height: 58px;
  border-radius: 20px;

  &.redBall {
    background: url(../assets/images/svg/redBtn.svg) no-repeat;
    background-size: cover;

    &:active {
      background: url(../assets/images/svg/redBtn_pass.svg) no-repeat;
      background-size: contain;
    }

    &:disabled,
    &:disabled:active {
      background: url(../assets/images/svg/redBtn_disable.svg) no-repeat;
      background-size: contain;
      pointer-events: none; // 禁用點擊行為
    }
  }

  &.colorBall {
    background: url(../assets/images/svg/colorBtn.svg) no-repeat;
    background-size: cover;

    &:active {
      background: url(../assets/images/svg/colorBtn_pass.svg) no-repeat;
      background-size: contain;
    }

    &:disabled,
    &:disabled:active {
      background: url(../assets/images/svg/colorBtn_disable.svg) no-repeat;
      background-size: contain;
      pointer-events: none; // 禁用點擊行為
    }
  }
}

.betContent{
      .minBtn{
         width: 36px;
         height: 36px;
         background: url(../assets/images/svg/minBtn.svg) no-repeat;
         background-size: contain;
         &:disabled,
         &:disabled:active {
            background: url(../assets/images/svg/minBtn_disable.svg) no-repeat;
            background-size: contain;
          }
      }
      .halfBtn{
         width: 36px;
         height:36px;
         background: url(../assets/images/svg/halfBtn.svg) no-repeat;
         background-size: contain;
         &:disabled,
         &:disabled:active {
            background: url(../assets/images/svg/halfBtn_disable.svg) no-repeat;
            background-size: contain;
          }
      }
      .reduceBtn{
         width: 26px;
         height: 26px;
         background: url(../assets/images/svg/reduceBtn.svg) no-repeat;
         background-size: contain;
         &:disabled,
         &:disabled:active {
          background: url(../assets/images/svg/reduceBtn_disable.svg) no-repeat;
          background-size: contain;
          }
      }
      .addBtn{
         width: 26px;
         height: 26px;
         background: url(../assets/images/svg/addBtn.svg) no-repeat;
         background-size: contain;
         &:disabled,
         &:disabled:active {
          background: url(../assets/images/svg/addBtn_disable.svg) no-repeat;
          background-size: contain;
         }
      }
      .towxBtn{
         width: 36px;
         height:36px;
         background: url(../assets/images/svg/2xBtn.svg) no-repeat;
         background-size: contain;
         &:disabled,
         &:disabled:active {
          background: url(../assets/images/svg/2xBtn_disable.svg) no-repeat;
          background-size: contain;
         }
      }
      .maxBtn{
         width: 36px;
         height: 36px;
         background: url(../assets/images/svg/maxBtn.svg) no-repeat;
         background-size: contain;
         &:disabled,
         &:disabled:active {
          background: url(../assets/images/svg/maxBtn_disable.svg) no-repeat;
          background-size: contain;
         }
      }
}
</style>
