<template>
  <div v-show="game.autoSettingDialog.visible" @click="game.setAutoSettingDialog(false)" class="modal-backdrop fixed w-full h-full left-0 right-0 top-0 bottom-0 z-10"></div>

  <div class="modal-container mx-auto text-left pt-1 mt-4 pb-6 flex flex-col gap-5 z-20">
    <div class="flex flex-col gap-5 h-[530px] overflow-y-auto">
      <h2 class="text-center text-lg font-bold mb-4">{{$t('Auto Bet Settings')}}</h2>
      <form @submit.prevent="submitSettings" class="flex flex-col gap-4">
        <div class="flex flex-col">
          <label class="flex items-center justify-between">
            {{$t('Initial Bet Amount')}}
            <div class="flex items-center gap-2">
              <input type="number" v-model="form.betAmount" class="input w-24" placeholder="0.00001" />
              <span class="currency-icon">฿</span>
            </div>
          </label>
        </div>

        <div class="flex justify-between items-center">
          <span>{{$t('Ball Type')}}</span>
          <div class="flex gap-2">
            <button type="button" class="btn-secondary" @click="toggleBallType('red')">Red</button>
            <button type="button" class="btn-secondary" @click="toggleBallType('color')">Color</button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <span>{{$t('Auto Bet Count')}}</span>
          <div class="flex gap-2 flex-wrap">
            <button type="button" class="btn-secondary" @click="form.autoBetCount = 5">5</button>
            <button type="button" class="btn-secondary" @click="form.autoBetCount = 10">10</button>
            <button type="button" class="btn-secondary" @click="form.autoBetCount = 20">20</button>
            <button type="button" class="btn-secondary" @click="form.autoBetCount = 50">50</button>
            <button type="button" class="btn-secondary" @click="form.autoBetCount = 100">100</button>
            <button type="button" class="btn-secondary" @click="form.autoBetCount = 200">200</button>
            <button type="button" class="btn-secondary" @click="form.autoBetCount = 500">500</button>
            <button type="button" class="btn-secondary" @click="form.autoBetCount = 1000">1000</button>
            <button type="button" class="btn-secondary" @click="form.autoBetCount = Infinity">∞</button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="flex items-center justify-between">
            {{$t('Lose Adjustment Percentage')}}
            <input type="number" v-model="form.loseAdjustmentPercentage" class="input w-24" placeholder="%" />
          </label>

          <label class="flex items-center justify-between">
            {{$t('Win Adjustment Percentage')}}
            <input type="number" v-model="form.winAdjustmentPercentage" class="input w-24" placeholder="%" />
          </label>
        </div>

        <div class="divider"></div>

        <div class="flex flex-col gap-2">
          <Switch v-model="form.isSingleBetProfitLimit" :label="$t('Single Bet Profit Limit')" />
          <label  class="flex items-center justify-between">
            {{$t('Single Bet Profit Limit Amount')}}
            <input type="number" v-model="form.singleBetProfitLimit" class="input w-24" placeholder="0.00" />
          </label>
        </div>

        <div class="flex flex-col gap-2">
          <Switch v-model="form.isCumulativeStopLoss" :label="$t('Cumulative Stop Loss')" />
          <label  class="flex items-center justify-between">
            {{$t('Cumulative Stop Loss Amount')}}
            <input type="number" v-model="form.cumulativeStopLoss" class="input w-24" placeholder="0.00" />
          </label>
        </div>

        <div class="flex flex-col gap-2">
          <Switch v-model="form.iscumulativeStopWin" :label="$t('Cumulative Stop Win')" />
          <label class="flex items-center justify-between">
            {{$t('Cumulative Stop Win Amount')}}
            <input type="number" :disabled="!form.iscumulativeStopWin" v-model="form.cumulativeStopWin" class="input w-24" placeholder="0.00" />
          </label>
        </div>

        <button type="submit" class="btn-primary mt-4">{{$t('Start Auto Bet')}}</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '../stores/game';
import Switch from '@/components/UI/Switch.vue';

const { t: $t } = useI18n();
const game = useGameStore();

const autoBetSetting = ref<AutoBetSetting[]>([]);

const form = ref<AutoBetSetting>({
  betAmount: 0,
  ballType: [],
  autoBetCount: 0,
  loseAdjustmentPercentage: 0,
  winAdjustmentPercentage: 0,
  isSingleBetProfitLimit: false,
  singleBetProfitLimit: 0,
  isCumulativeStopLoss: false,
  cumulativeStopLoss: 0,
  iscumulativeStopWin: false,
  cumulativeStopWin: 0
});

const toggleBallType = (type: string) => {
  if (form.value.ballType.includes(type)) {
    form.value.ballType = form.value.ballType.filter(t => t !== type);
  } else {
    form.value.ballType.push(type);
  }
};

const submitSettings = () => {
  autoBetSetting.value.push({ ...form.value });
  game.setAutoSettingDialog(false); // Close the modal
  console.log('Settings saved:', autoBetSetting.value);
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
  margin-top: 0.5rem;
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

.btn-secondary:hover {
  background-color: #666;
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
