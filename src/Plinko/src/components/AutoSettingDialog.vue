<template>
  <div
    v-show="game.autoSettingDialog.visible"
    @click="game.setAutoSettingDialog(false)"
    class="modal-backdrop fixed w-full h-full left-0 right-0 top-0 bottom-0 z-10"
  ></div>

  <div
    class="modal-container  mx-auto text-left pt-1 pb-6 flex flex-col overflow-x-hidden z-20"
  >
    <PerfectScrollbar class='px-3 pt-3' :options='{ minScrollbarLength: 20, maxScrollbarLength: 50}'>
    <div class="modal-content flex flex-col">
      <div class="flex items-center justify-center">
        <h2 class="text-center text-lg font-bold">
        {{ $t('AutomaticBettingSettings') }}
      </h2>
      <div class=" absolute right-6 cursor-pointer w-[24px] h-[24px]" @click.prevent="game.autoSettingDialog.visible = false; ">
        <img  src="@/assets/images/close-button.svg" />
      </div>
      </div>

      <div class="divider"></div>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <p class="text-xs">{{ $t('InitialBetAmount') }}</p>
          <label class="flex items-center justify-start my-1">
            <div class="flex items-center w-full">
              <input
                type="number"
                v-model="formattedBetAmount"
                :step="game.oneBetAmount"
                class="input w-full"
                placeholder="0.00001"
                min="0"
              />
            </div>
          </label>
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-xs">{{ $t('BallType') }}</p>
          <div class="flex justify-start items-center my-1 gap-2">
            <button
              type="button"
              class="selectBtn w-full"
              :class="{ active: form.ballType.includes('red') }"
              @click="toggleBallType('red')"
            >
              Red
            </button>
            <button
              type="button"
              class="selectBtn w-full"
              :class="{ active: form.ballType.includes('color') }"
              @click="toggleBallType('color')"
            >
              Color
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <p class="text-xs">{{ $t('AutoBetCount') }}</p>
          <div class="flex gap-2 flex-wrap my-1 gap-2">
            <button
              v-for="count in autoBetCounts"
              :key="count"
              type="button"
              class="selectBtn"
              :class="{ active: form.autoBetCount === count }"
              @click="form.autoBetCount = count"
            >
              {{ count === Infinity ? '∞' : count }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-xs">{{ $t('LoseAdjustmentPercentage') }}</p>
          <label class="flex items-center justify-between">
            <button
              class="selectBtn"
              :class="{ active: form.loseAdjustmentMode === 'initial' }"
              @click="selectLoseAdjustmentMode('initial')"
            >
            {{ $t('InitialBet') }}
            </button>
            <button
              class="selectBtn mx-3"
              :class="{ active: form.loseAdjustmentMode === 'percentage' }"
              @click="selectLoseAdjustmentMode('percentage')"
            >
              ±
            </button>
            <!-- 依據模式設置 Percentage 元件 -->
            <Percentage
              v-model="form.loseAdjustmentPercentage"
              :disabled="form.loseAdjustmentMode !== 'percentage'"
              class="w-full"
            />
          </label>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-xs">{{ $t('WinAdjustmentPercentage') }}</p>
          <label class="flex items-center justify-between">
            <button
              class="selectBtn"
              :class="{ active: form.winAdjustmentMode === 'initial' }"
              @click="selectWinAdjustmentMode('initial')"
            >
            {{ $t('InitialBet') }}
            </button>
            <button
              class="selectBtn mx-3"
              :class="{ active: form.winAdjustmentMode === 'percentage' }"
              @click="selectWinAdjustmentMode('percentage')"
            >
              ±
            </button>
            <!-- 依據模式設置 Percentage 元件 -->
            <Percentage
              v-model="form.winAdjustmentPercentage"
              :disabled="form.winAdjustmentMode !== 'percentage'"
              class="w-full"
            />
          </label>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-xs">{{ $t('SingleBetProfitLimitAmount') }}</p>
          <label class="flex items-center justify-between">
            <Switch v-model="form.isSingleBetProfitLimit" class="mr-8" />
            <input
              type="number"
              :disabled="!form.isSingleBetProfitLimit"
              :step="game.oneBetAmount"
              v-model="formattedSingleBetProfitLimit"
              :min="game.minBetAmount"
              :max="game.maxBetAmount"
              class="input w-full"
              placeholder="0.00"
            />
          </label>
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-xs">{{ $t('CumulativeStopLossAmount') }}</p>
          <label class="flex items-center justify-between">
            <Switch v-model="form.isCumulativeStopLoss" class="mr-8" />
            <input
              type="number"
              :disabled="!form.isCumulativeStopLoss"
              :step="game.oneBetAmount"
              v-model="formattedCumulativeStopLoss"
              :min="game.minBetAmount"
              class="input w-full"
              placeholder="0.00"
            />
          </label>
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-xs">{{ $t('CumulativeStopWinAmount') }}</p>
          <label class="flex items-center justify-between">
            <Switch v-model="form.isCumulativeStopWin" class="mr-8" />
            <input type="number" :disabled="!form.isCumulativeStopWin" :step="game.oneBetAmount"
            v-model="formattedCumulativeStopWin"
             :min="game.minBetAmount" class="input w-full" placeholder="0.00" />
          </label>
        </div>

        <button type="submit" @click="submitSettings" class="startBtn mt-4">
          {{ $t('StartAutoBet') }}
        </button>
      </div>
    </div>
    </PerfectScrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref ,onMounted} from 'vue' // 使用 computed 來簡化綁定
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../stores/game'
import Switch from '@/components/UI/Switch.vue'
import Percentage from '@/components/UI/Percentage.vue'
import { useFormattedNumber } from '@/utils/numbers'

const { t: $t } = useI18n()
const game = useGameStore()
const autoBetCounts = ref([5, 10, 20, 50, 100, 200, 500, 1000, Infinity]) // Store counts in an array

// 使用 computed 將 form 綁定到 store
const form = computed(() => game.autoBetSetting)
const formattedBetAmount = computed({
  get() {
    const value = Number(game.betAmount.toFixed(8));
    return value % 1 === 0 ? value.toString() : value.toString().replace(/(\.\d*?)0+$/, "$1");
  },
  set(newValue) {
    // 轉換輸入值並限制最小值為0
    const numericValue = Math.max(Number(newValue), 0);
    game.setBetAmount(numericValue);
  },
});


const formattedSingleBetProfitLimit = useFormattedNumber(
  () => form.value.singleBetProfitLimit,
  (value) => (form.value.singleBetProfitLimit = value)
);

const formattedCumulativeStopLoss = useFormattedNumber(
  () => form.value.setCumulativeStopLoss,
  (value) => (form.value.setCumulativeStopLoss = value)
);

const formattedCumulativeStopWin = useFormattedNumber(
  () => form.value.setCumulativeStopWin,
  (value) => (form.value.setCumulativeStopWin = value)
);
onMounted(()=>{
  game.setAutoBetSetting(game.defaultAutoBetSetting)
})
// 切換球類型的邏輯
const toggleBallType = (type: string) => {
  const currentBallType = form.value.ballType || []
  if (currentBallType.includes(type)) {
    form.value.ballType = currentBallType.filter(t => t !== type)
  } else {
    form.value.ballType = [...currentBallType, type]
  }
  console.log(`output->form.value.ballType`, form.value.ballType)
}

const selectLoseAdjustmentMode = (mode: 'initial' | 'percentage') => {
  form.value.loseAdjustmentMode = mode

  if (mode === 'initial') {
    form.value.loseAdjustmentPercentage = form.value.betAmount // 同步 betAmount 值
  }
}
const selectWinAdjustmentMode = (mode: 'initial' | 'percentage') => {
  form.value.winAdjustmentMode = mode

  if (mode === 'initial') {
    form.value.winAdjustmentPercentage = form.value.betAmount // 同步 betAmount 值
  }
}
// 提交設置
const submitSettings = async () => {
  game.setAutoBetSetting({ ...form.value }) // 更新 store 中的設定
    // 立即執行一次 autoBetDropBall
    game.autoBetDropBall();
    game.autoBetInterval = setInterval(
    game.autoBetDropBall,
    game.autoBetIntervalMs,
  )

  game.setAutoSettingDialog(false) // 關閉對話框
}
</script>

<style scoped lang="scss">
.modal-container {
  border-radius: 6px;
  width: 376px;
  height: 625px;
  position: absolute;
  color: #fff;
  bottom: 0; /* 置底 */
  left: 50%; /* 水平置中 */
  transform: translateX(-50%); /* 只需水平居中 */
  transition: all 0.35s cubic-bezier(0, 0.86, 0.37, 1);
  backdrop-filter: blur(20px);
  background: #2c2c2cde;
}

button {
  padding: 0.5rem 1.5rem;
  text-align: center;
}

.input {
  padding: 0.1rem 0.5rem;
  background: rgba(92, 92, 92, 1);
  border-radius: 15px;
  color: #fff;
  text-align: right;
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);
  box-shadow: 1px 1px 2px 0px rgba(2, 22, 26, 0.35) inset;
}

.startBtn {
  background: linear-gradient(90deg, #ffcb52 0%, #ff7b02 100%);
  color: #fff;
  padding: 5px 3px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bolder;
}

.startBtn:hover {
  background-color: #0056b3;
}

.selectBtn {
  background-color: rgba(45, 45, 45, 1);
  color: #fff;
  padding: 0.2rem;
  min-width: 70px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  word-break: keep-all;
}

.selectBtn.active {
  background: linear-gradient(98.24deg, #6ddcff 0%, #7f60f9 100%);
  color: white;
}

.currency-icon {
  font-size: 1rem;
  color: #ffd700;
}

.divider {
  border-top: 1px solid #555;
  margin: 10px 0;
}
</style>
