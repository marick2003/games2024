<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n';
const appStore = useAppStore()
const { t: $t  } = useI18n()
const assetsPending: Ref<number> = ref<number>(0)
const loading: Ref<boolean> = ref<boolean>(true)

function preloadAssets(assetUrls: Record<string, string>) {
  const loadAssets = async (src: string) => {
    return new Promise<HTMLImageElement | HTMLAudioElement>((resolve, reject) => {
      if (/(jpg|png|svg|gif)$/.test(src)) {
        const img = new Image()
        img.src = src
        img.decode().then(() => {
          assetsPending.value--
          resolve(img)
        }).catch(err => {
          reject(err)
        })
      } else if (/mp3$/.test(src)) {
        const audio = new Audio()
        audio.src = src
        audio.addEventListener('canplaythrough', () => {
          assetsPending.value--
          resolve(audio)
        }, { once: true })
        audio.addEventListener('error', () => {
          reject(audio)
        })
      }
    })
  }

  return Object.values(assetUrls)
    .map((assetSrc) => loadAssets(assetSrc)
      .catch((rejectedSrcError) => rejectedSrcError))
}

const loadingPercentage = computed({
  get: () => {
    if (appStore.assetLoaded && appStore.gameLoaded) {
      appStore.isLoading.appAssets = false
      return 100
    }
    if (assetsPending.value < 100){
      return (Math.floor((Object.keys(appStore.assets).length - assetsPending.value)
        / Object.keys(appStore.assets).length * 100))
    }
  },
  set: (newVal: number) => newVal
})

onMounted(async () => {
  appStore.isLoading.appAssets = loading.value
  assetsPending.value = Object.keys(appStore.assets).length

  Promise.all(preloadAssets(appStore.assets)).then(resolvedSrcList => {
    assetsPending.value = 0
    setTimeout(() => {
      loading.value = true // emit action
      appStore.assetLoaded = true
      appStore.isLoading.appAssets = false
      loadingPercentage.value = 100
    }, 0)
  })
})
</script>

<template>
  <div class='preloader-container z-50 bg-black w-full h-full'>
    <template v-if='loading'>
      <h1>{{ $t('Loading')}}... {{ loadingPercentage }}% </h1>
      <div class='progress-bar'>
        <div class='progress-width' :style='{width: loadingPercentage +"%"}'></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.preloader-container{
  position:fixed;
  min-height: 750px;
  top:0;left:0;display:flex;flex-direction:column;justify-content: center;align-items: center;
}
h1{font-family: 'Arial', sans-serif;font-size: calc(15px + 0.390625vw);font-weight:bold;margin-bottom:10px;color:#F5E48A;}

.progress-bar{
  width:50vw;
  height:10px;
  background: transparent linear-gradient(180deg, #384255F2 0%, #2C3545 100%);
  box-shadow: 1px 0 3px #717884;
  border-radius: 20px;
  overflow:hidden;
}
.progress-bar > .progress-width{
  height:10px;
  background: #D5B881;
  animation-name: pulse;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  transition: width .25s ease-out;
}
@keyframes pulse {
  0%   {background: rgb(255, 215, 109);}
  25%   {background: rgb(255, 215, 109);}
  50%   {background: rgb(255, 215, 109);}
  75%  {background: rgb(255, 231, 167);}
  85%{background: rgb(255, 215, 109);}
  100% {background: rgb(255, 215, 109);}
}

.indeterminate {
  position:relative;
  background-color: #384255;
  &:before{
    content:          '';
    position:         absolute;
    background-color: inherit;
    top:              0;
    left:             0;
    bottom:           0;
    will-change:      left, right;
    animation:        indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
  }
  &:after {
    content:          '';
    position:         absolute;
    background-color: inherit;
    top:              0;
    left:             0;
    bottom:           0;
    will-change:      left, right;
    animation:        indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
    animation-delay: 1.15s;
  }
}


@keyframes indeterminate {
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
}

</style>
