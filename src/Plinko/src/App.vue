<script setup lang="ts">
import Plinko from './components/Plinko/PlinkoGame.vue';
import PlinkoSimulation from './components/Plinko/PlinkoSimulation.vue';
import Sidebar from './components/Sidebar.vue';
import Balance from './components/Balance.vue';
import logo from './assets/logo.svg';
import { useI18n } from 'vue-i18n'
const { t: $t  } = useI18n()
import { useSimulationStore } from './stores/simulation';
import { useAppStore } from '@/stores/app'
import Preloader from '@/components/Preloader.vue';

const simulation = useSimulationStore();
const appStore = useAppStore()
</script>

<template>
  <transition name="fade">
    <Preloader v-show='appStore.isLoading.appAssets' />
  </transition>
  <div v-show='!appStore.isLoading.appAssets' class="relative flex min-h-dvh w-full flex-col">
    <!-- <nav class="sticky top-0 z-10 w-full bg-gray-700 px-5 drop-shadow-lg">
      <div class="mx-auto flex h-14 max-w-7xl items-center justify-between">
        <img :src="logo" alt="logo" class="h-6 sm:h-7" />
        <div v-if="!simulation.isSimulationing" class="mx-auto relative">
          <Balance />
        </div>
      </div>
    </nav> -->

    <div class="flex-1 ">
      <div class="mx-auto min-w-[375px] max-w-[375px] drop-shadow-xl">
        <div class="gamebg flex flex-col-reverse overflow-hidden rounded-lg lg:w-full ">
          <Sidebar class="z-[1] mt-[-75px]   md:mt-[-62px]" />
          <div class="flex-1">
            <template v-if="simulation.isSimulationing">
              <PlinkoSimulation />
            </template>
            <template v-else>
              <Plinko />
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
  </div>
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
