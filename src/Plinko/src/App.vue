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
        <div class="absolute py-[35px] px-[10px] w-full left-0 text-white flex">
          <img src="@/assets/images/svg/icon_btc.svg"/>
          <span class="mx-2">{{ game.amount.toFixed(5) }}</span>
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
</style>
