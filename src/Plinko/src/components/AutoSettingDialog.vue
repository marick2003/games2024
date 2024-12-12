<template>
  <div v-show="game.autoSettingDialog.visible" @click="game.setAutoSettingDialog(false)" class="modal-backdrop fixed w-full h-full left-0 right-0 top-0 bottom-0 z-10"></div>

  <div class="modal-container mx-auto text-left pt-1 mt-4 pb-6 flex flex-col gap-5 z-20">
    <div class="flex flex-col gap-5 h-[530px] overflow-y-auto">
      <h2 class="text-center text-lg font-bold mb-4">{{$t('Auto Bet Settings')}}</h2>
      <form @submit.prevent="submitSettings" class="flex flex-col gap-4">
        <div class="flex flex-col">
          <label class="flex items-center justify-between">
            {{$t('InitialBetAmount')}}
            <div class="flex items-center gap-2">
              <input type="number" v-model="form.betAmount" class="input w-24" placeholder="0.00001" />
              <span class="currency-icon">฿</span>
            </div>
          </label>
        </div>

        <div class="flex justify-between items-center">
          <span>{{$t('BallType')}}</span>
          <div class="flex gap-2">
            <button type="button" class="btn-secondary"  :class="{ 'active': form.ballType.includes('red') }" @click="toggleBallType('red')">Red</button>
            <button type="button" class="btn-secondary"  :class="{ 'active': form.ballType.includes('color') }" @click="toggleBallType('color')">Color</button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <span>{{$t('AutoBetCount')}}</span>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="count in autoBetCounts"
              :key="count"
              type="button"
              class="btn-secondary"
              :class="{ 'active': form.autoBetCount === count }"
              @click="form.autoBetCount = count"
            >
              {{ count === Infinity ? '∞' : count }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="flex items-center justify-between">
            {{$t('LoseAdjustmentPercentage')}}
            <input type="number" v-model="form.loseAdjustmentPercentage" class="input w-24" placeholder="%" />
          </label>

          <label class="flex items-center justify-between">
            {{$t('WinAdjustmentPercentage')}}
            <input type="number" v-model="form.winAdjustmentPercentage" class="input w-24" placeholder="%" />
          </label>
        </div>

        <div class="divider"></div>

        <div class="flex flex-col gap-2">
          {{$t('SingleBetProfitLimitAmount')}}
          <label class="flex items-center justify-between">
            
            <Switch v-model="form.isSingleBetProfitLimit" />
            <input type="number" :disabled="!form.isSingleBetProfitLimit" v-model="form.singleBetProfitLimit" class="input w-24" placeholder="0.00" />
          </label>
        </div>

        <div class="flex flex-col gap-2">
          {{$t('CumulativeStopLossAmount')}}
          <label class="flex items-center justify-between">
           
            <Switch v-model="form.isCumulativeStopLoss" />
            <input type="number" :disabled="!form.isCumulativeStopLoss" v-model="form.cumulativeStopLoss" class="input w-24" placeholder="0.00" />
          </label>
        </div>

        <div class="flex flex-col gap-2">
          {{$t('CumulativeStopWinAmount')}}
          <label class="flex items-center justify-between">
           
            <Switch v-model="form.iscumulativeStopWin" />
            <input type="number" :disabled="!form.iscumulativeStopWin" v-model="form.cumulativeStopWin" class="input w-24" placeholder="0.00" />
          </label>
        </div>

        <button type="submit" class="btn-primary mt-4">{{$t('StartAutoBet')}}</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed,ref } from 'vue'; // 使用 computed 來簡化綁定
import { useI18n } from 'vue-i18n';
import { useGameStore } from '../stores/game';
import Switch from '@/components/UI/Switch.vue';

const { t: $t } = useI18n();
const game = useGameStore();
const autoBetCounts = ref([5, 10, 20, 50, 100, 200, 500, 1000, Infinity]); // Store counts in an array

// 使用 computed 將 form 綁定到 store
const form = computed(() => game.autoBetSetting);

// 切換球類型的邏輯
const toggleBallType = (type: string) => {
  const currentBallType = form.value.ballType || [];
  if (currentBallType.includes(type)) {
    form.value.ballType = currentBallType.filter(t => t !== type);
  } else {
    form.value.ballType = [...currentBallType, type];
  }
  console.log(`output->form.value.ballType`,form.value.ballType)
};

// 提交設置
const submitSettings = async () => {
  game.updateAutoBetSetting({ ...form.value }); // 更新 store 中的設定

  game.autoBetInterval = setInterval(game.autoBetDropBall, game.autoBetIntervalMs)

  game.setAutoSettingDialog(false); // 關閉對話框
  console.log('Settings saved:', game.autoBetSetting);
};
</script>


<style scoped>
.modal-container {
  background: #262626;
  border-radius: 6px;
  width: 360px;
  height: 700px;
  max-height: 580px;
  margin: 0 auto;
  position: absolute;
  color: #fff;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem;
}

button {
  padding: 0.5rem 1.5rem;
  text-align: center;
}

.input {
  width: 100%;
  padding: 0.5rem;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
}

.btn-primary {
  background-color: #007bff;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #444;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary.active {
  background-color: #f81616;
  color: white;
}

.currency-icon {
  font-size: 1rem;
  color: #ffd700;
}

.divider {
  border-top: 1px solid #555;
  margin: 1rem 0;
}
</style>
