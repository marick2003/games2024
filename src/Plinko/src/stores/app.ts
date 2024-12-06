import { ref, computed } from 'vue';
import type { Ref } from 'vue'
import { defineStore } from 'pinia'

interface loadingInterface {
    appAssets: boolean
}
export const useAppStore = defineStore('App', () => {
    const assetLoaded: Ref<boolean> = ref<boolean>(false)
    const gameLoaded: Ref<boolean> = ref<boolean>(false)
    const isLoading: Ref<loadingInterface> = ref({
        appAssets: ref(false),
    })

    const showError = ref({
        visible: ref(false),
        message: ref(''),
    })

    const assets = {
        test:  new URL('@/assets/cards.png', import.meta.url).href,
        test2:  new URL('@/assets/test.jpg', import.meta.url).href,
        test3:  new URL('@/assets/test2.jpg', import.meta.url).href,
    }

  return {
      showError,
      assets,
      isLoading,
      assetLoaded,
      gameLoaded,
   }
})
