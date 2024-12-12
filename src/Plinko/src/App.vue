<script setup lang="ts">
import Plinko from './components/Plinko/PlinkoGame.vue';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import PlinkoSimulation from './components/Plinko/PlinkoSimulation.vue';
import Sidebar from './components/Sidebar.vue';
import Balance from './components/Balance.vue';
import logo from './assets/logo.svg';
import { useI18n } from 'vue-i18n'
const { t: $t  } = useI18n()
import { useSimulationStore } from './stores/simulation';
import { useAppStore } from '@/stores/app'
import { useGameStore } from '@/stores/game'
import Preloader from '@/components/Preloader.vue';
import SettingDialog from '@/components/SettingDialog.vue';
import AutoSettingDialog from '@/components/AutoSettingDialog.vue';
const simulation = useSimulationStore();
const appStore = useAppStore()
const game=useGameStore();
const showSetting = () => {
  appStore.settingDialog.visible = true
  appStore.settingDialog.section = 'main'
}
const childRef = ref(null);
const amountData = ref([]); // 儲存歷史數據
const displayAmount = ref(0); // 用於顯示的金額
const payoutDelta = ref(null); // 顯示的加減金額
const isAnimating = ref(false); // 控制淡入淡出的狀態
//初始資料
game.getInitialization();
watch(
    () => game.isDropBall,
    async(newVal) => {

      if (newVal) {
        console.log(`output->game.isDropBall`,newVal)
        childRef.value.callToDrop()
      }
    }
  );
  watch(
  () => game.winRecords,
  async (newVal) => {
    if (newVal && newVal.length > 0) {
   
      console.log(`output->newVal`, newVal);
      const { amount, payout, balance } = newVal.at(-1);

      isAnimating.value = true;
      payoutDelta.value = payout.value > 0 ? `+${payout.value.toFixed(8)}` : payout.value.toFixed(8);

      // 数字递增跳动效果
      const startAmount = amount; // 金额
      const targetAmount = balance; // 餘額
      const duration = 1000; 
      const startTime = performance.now();

      const updateAmount = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1); 
        displayAmount.value =
          startAmount + (targetAmount - startAmount) * progress;

        if (progress < 1) {
          requestAnimationFrame(updateAmount);
        } else {
          isAnimating.value = false;
          payoutDelta.value = null;
        }
      };
      requestAnimationFrame(updateAmount);
    }
  }
);

</script>

<template>
  <transition name="fade">
    <Preloader v-show='appStore.isLoading.appAssets' />
  </transition>
  <transition name="fade">

    <div v-show='!appStore.isLoading.appAssets' class="relative flex min-h-dvh w-full flex-col">
    <!-- <nav class="sticky top-0 z-10 w-full bg-gray-700 px-5 drop-shadow-lg">
      <div class="mx-auto flex h-14 max-w-7xl items-center justify-between">
        <img :src="logo" alt="logo" class="h-6 sm:h-7" />
        <div v-if="!simulation.isSimulationing" class="mx-auto relative">
          <Balance />
        </div>
      </div>
    </nav> -->

    <div class="flex-1 flex items-center justify-center relative">

      <div class="absolute left-[50%] translate-x-[90px] top-[50%] -translate-y-[325px] text-white z-10 flex gap-2">
        <button @click="appStore.isMute = !appStore.isMute" class="active:translate-y-[1px]">
          <img src="@/assets/images/sound.svg" class="w-[40px]" v-show="appStore.isMute" alt="">
          <img src="@/assets/images/mute.svg" class="w-[40px]" v-show="!appStore.isMute" alt="">
        </button>
        <button @click.prevent="showSetting" class="active:translate-y-[1px]">
          <img src="@/assets/images/setting.svg" class="w-[40px]" alt="">
        </button>
      </div>
      <div class="mx-auto w-[375px]  drop-shadow-xl">
        <div class="absolute py-[12px] px-[10px] w-full left-0 text-white flex">
    
            <!-- 顯示當前金額 -->
          <span class="mx-2">{{ displayAmount.toFixed(8) }}</span>
           <!-- 顯示加減金額 -->
          <transition name="fade">
            <span v-if="isAnimating" class="mx-2 text-green-500 font-bold">
              {{ payoutDelta }}
            </span>
          </transition>
        </div>
        <div class="gamebg flex flex-col-reverse overflow-hidden rounded-lg lg:w-full ">
          <Sidebar  />
          <div class="flex-1">
            <template v-if="simulation.isSimulationing">
              <PlinkoSimulation ref="childRef"/>
            </template>
            <template v-else>
              <Plinko ref="childRef" />
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- <SettingsWindow />
    <LiveStatsWindow /> -->

    <!-- <footer class="px-5 pb-4 pt-16">
      <div class="mx-auto max-w-[40rem]">
        <div aria-hidden="true" class="h-[1px] bg-slate-700" />
        <div class="flex items-center justify-center p-2">
          <p class="text-sm text-slate-500">
            © Build from 2024
          </p>
        </div>
      </div>
    </footer> -->
      <SettingDialog />
      <AutoSettingDialog class="z-1" v-if="game.autoSettingDialog.visible" />
  </div>
  </transition>

</template>

<style scoped>
  :global(body) {
    @apply bg-gray-800;
  }
  .gamebg{
    background: url(./assets/images/background.png) no-repeat;
    background-size: cover;
  }
  .fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px); /* 从下往上 */
}

.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(20px); /* 往下淡出 */
}
</style>
