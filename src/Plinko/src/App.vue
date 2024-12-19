<script setup lang="ts">
import Plinko from './components/Plinko/PlinkoGame.vue';
import { onMounted, onUnmounted, ref, Ref, computed, watch } from 'vue';
import PlinkoSimulation from './components/Plinko/PlinkoSimulation.vue';
import Sidebar from './components/Sidebar.vue';
import { useI18n } from 'vue-i18n'
const { t: $t  } = useI18n()
import { useSimulationStore } from './stores/simulation';
import { useAppStore } from '@/stores/app'
import { useGameStore } from '@/stores/game';
import Preloader from '@/components/Preloader.vue';
import SettingDialog from '@/components/SettingDialog.vue';
import AutoSettingDialog from '@/components/AutoSettingDialog.vue';
import { useIntervalFn } from '@vueuse/core';
const simulation = useSimulationStore();
const appStore = useAppStore()
const game=useGameStore();
const showSetting = () => {
  appStore.settingDialog.visible = true
  appStore.settingDialog.section = 'main'
}
// 定義子元件的類型
interface ChildComponent {
  callToDrop: () => void; // 子元件中的方法
}
const childRef: Ref<ChildComponent | null> = ref(null);
const payoutDelta = ref(''); // 顯示的加減金額
const isWin=ref(false);
const isAnimating = ref(false); // 控制淡入淡出的狀態
const isDataLoaded = ref(false);
const hasOutstandingBalls = computed(() => {
    return Object.keys(game.betAmountOfExistingBalls).length > 0;
});
onMounted(async () => {
  await game.getInitialization(); // 確保初始化完成
  const response: any = await game.getBalance(); // 取得餘額資料
  game.setBalance(response.Data.Balance); // 更新餘額
  game.setCurrency(response.Data.Currency); // 更新幣別
  isDataLoaded.value = true; // 資料載入完成
});

// 自動每 10 秒更新餘額
useIntervalFn(async () => {
  if(!hasOutstandingBalls){
    const response: any = await game.getBalance();
    game.setBalance(response.Data.Balance);
    game.setCurrency(response.Data.Currency);
  }
}, 10000);
const handleReload = (evt) => {
  console.log('page reload')
  
}
window.addEventListener('beforeunload', handleReload)
watch(
    () => game.isDropBall,
    async(newVal) => {
      if (newVal) {
        if (childRef.value) {
          childRef.value.callToDrop();
        }
      }
    }
  );
  watch(
  () => game.winRecords,
  async (newVal) => {
    if (newVal && newVal.length > 0) {
      const { amount, payout, balance } = newVal.at(-1);
      if(payout.multiplier <=0){
        return false;
      }
      isAnimating.value = true;
      payoutDelta.value = `+${payout.value.toFixed(8)}`;
      isWin.value = payout.multiplier > 1  ? true : false ;
        // 数字递增跳动效果
        const duration = 1000;
        const startTime = performance.now();
        const updateAmount = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        game.updateBalance((balance - game.balance) * progress)

        if (progress < 1) {
          requestAnimationFrame(updateAmount);
        } else {
          isAnimating.value = false;
          payoutDelta.value = '';
        }
      };
      requestAnimationFrame(updateAmount);
    }
  }
);

</script>

<template>
  <transition name="fade">
      <Preloader class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[376px] h-[688px] drop-shadow-xl z-50" v-show='appStore.isLoading.appAssets' />
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
            <div class=" flex text-white hidden">
              {{ $t('CumulativeStopLossAmount') }} : {{ game.autoBetSetting.cumulativeStopLoss }}

            <div class="mx-2">
              {{ $t('CumulativeStopWinAmount') }} : {{ game.autoBetSetting.cumulativeStopWin }}
            </div>
          </div>
    <div class="flex-1 flex items-center justify-center relative">


      <div class="mx-auto w-[375px]  drop-shadow-xl">

        <div class="absolute left-[50%] translate-x-[90px] top-[50%] -translate-y-[335px] text-white z-10 flex gap-2">
          <button @click="appStore.isMute = !appStore.isMute" class="active:translate-y-[1px] opacity-0 pointer-events-none">
            <img src="@/assets/images/sound.svg" class="w-[40px]" v-show="appStore.isMute" alt="">
            <img src="@/assets/images/mute.svg" class="w-[40px]" v-show="!appStore.isMute" alt="">
          </button>
          <button @click.prevent="showSetting" class="active:translate-y-[1px]">
            <img src="@/assets/images/setting.svg" class="w-[40px]" alt="">
          </button>
        </div>
          <transition name="fade-move">
            <AutoSettingDialog class="z-50" v-if="game.autoSettingDialog.visible" />
          </transition>
        <div class="absolute py-[12px] px-[10px] w-full left-0 text-white flex">
           <img src="@/assets/images/svg/icon_btc.svg"/>
            <!-- 顯示當前金額 -->
          <span v-if="isDataLoaded" class="mx-2">{{ game.balance.toFixed(8) }}</span>
           <!-- 顯示加減金額 -->
          <transition name="fade-move">
            <span v-if="isAnimating" class="mx-2  font-bold" :class="isWin ? 'text-orange-500' : 'text-orange-300'">
              {{ payoutDelta }}
            </span>
          </transition>
            <!-- --->

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

      <SettingDialog />

  </div>
  </transition>

</template>

<style scoped>
  :global(body) {
    @apply bg-gray-800;
  }
  .gamebg{
    background: url(./assets/images/svg/background.svg) no-repeat;
    background-size: cover;
  }
  .fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease; /* 只有透明度淡入淡出 */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
.fade-move-enter-active,
.fade-move-leave-active {
  transition: opacity 0.3s ease, transform 0.5s ease; /* 同時過渡透明度與位移 */
}

.fade-move-enter-from,
.fade-move-leave-to {
  opacity: 0;
  transform: translateY(20px); /* 往下移 */
}

.fade-move-enter-to,
.fade-move-leave-from {
  opacity: 1;
  transform: translateY(0); /* 移回原位 */
}
</style>
