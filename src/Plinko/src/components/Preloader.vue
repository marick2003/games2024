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
      } else if (/mp4$/.test(src)) {
        const video = document.createElement('video');
        video.src = src;
        video.addEventListener('canplaythrough', () => {
          assetsPending.value--;
          resolve(video);
        }, { once: true });
        video.addEventListener('error', () => {
          reject(video);
        });
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
  <div class='preloader-container z-50  px-7'>
    <template v-if='loading'>
      <div class="title my-[90px]">
         <img src="../assets/images/crocodilepinko.png">
      </div>
      <div class='progress-bar '>
        <div class='progress-width' :style='{width: loadingPercentage +"%"}'></div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.preloader-container{
  position:fixed;
  min-height: auto;
  background: url('../assets/images/loading.jpg') no-repeat;
  background-size: cover;
}
h1{font-family: 'Arial', sans-serif;font-size: calc(15px + 0.390625vw);font-weight:bold;margin-bottom:10px;color:#F5E48A;}

.progress-bar{
  width:80%;
  height:25px;
  padding: 6px;
  background: rgba(224, 224, 224, 1);
  box-shadow: 
    0px 2px 1px 0px rgba(255, 255, 255, 1) inset, /* 原有的白色陰影 */
    0px -1.5px 0.5px 0px rgba(91, 115, 130, 1) inset, /* 原有的灰色陰影 */
    0px 0px 8px 0px rgba(0, 0, 0, 0.7) inset; /* 黑色內陰影 */
  border-radius: 20px;
  top: 70%; 
  left: 50%; /* 水平居中 */
  transform: translate(-50%, -50%) translateY(75%);
  position: absolute;
  overflow:hidden;
 
}
.progress-bar > .progress-width{
  height:12px;
  background: linear-gradient(180deg, #B5F962 0%, #5B8F1E 100%);
  border-radius: 20px;
  transition: width .25s ease-out;
  
}
.progress-bar > .progress-width::before {
  content: "";
    position: absolute;
    top: 7px;
    left: 6px;
    width: 95%;
    padding: 5px;
    height: 7px;
    background: rgb(52, 75, 89);
    z-index: -1;
    border-radius: 20px;
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
