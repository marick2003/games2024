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

    const showError:Ref<{visible: boolean, message: string}> = ref({
        visible: ref(false),
        message: ref(''),
    })

    const isMute:Ref<boolean> = ref(false)
    const settingDialog:Ref<{visible: boolean, section: string}> = ref({
        visible: ref(false),
        section: ref(''),
    })

    const assets = {
        twoPlusBtn:  new URL('@/assets/images/2xBtn.png', import.meta.url).href,
        twoPlusBtnPress:  new URL('@/assets/images/2xBtn_press.png', import.meta.url).href,
        addBtn:  new URL('@/assets/images/addBtn.png', import.meta.url).href,
        addBtn_pass:  new URL('@/assets/images/addBtn_pass.png', import.meta.url).href,
        arrow:  new URL('@/assets/images/arrow.svg', import.meta.url).href,
        arrowBtn:  new URL('@/assets/images/arrowBtn.png', import.meta.url).href,
        arrowBtn_disabled:  new URL('@/assets/images/arrowBtn_disabled.png', import.meta.url).href,
        arrowBtn_down:  new URL('@/assets/images/arrowBtn_down.png', import.meta.url).href,
        arrowBtn_down_disabled:  new URL('@/assets/images/arrowBtn_down_disabled.png', import.meta.url).href,
        arrowBtn_down_pass:  new URL('@/assets/images/arrowBtn_down_pass.png', import.meta.url).href,
        arrowBtn_pass:  new URL('@/assets/images/arrowBtn_pass.png', import.meta.url).href,
        auto_btn:  new URL('@/assets/images/auto_btn.png', import.meta.url).href,
        autoBtn:  new URL('@/assets/images/autoBtn.svg', import.meta.url).href,
        background:  new URL('@/assets/images/background.png', import.meta.url).href,
        closemouth:  new URL('@/assets/images/closemouth.png', import.meta.url).href,
        color:  new URL('@/assets/images/color.png', import.meta.url).href,
        colorBtn:  new URL('@/assets/images/colorBtn.png', import.meta.url).href,
        colorBtn_pass:  new URL('@/assets/images/colorBtn_pass.png', import.meta.url).href,
        halfBtn:  new URL('@/assets/images/halfBtn.png', import.meta.url).href,
        halfBtn_press:  new URL('@/assets/images/halfBtn_press.png', import.meta.url).href,
        maxBtn:  new URL('@/assets/images/maxBtn.png', import.meta.url).href,
        maxBtn_pass:  new URL('@/assets/images/maxBtn_pass.png', import.meta.url).href,
        minBtn:  new URL('@/assets/images/minBtn.png', import.meta.url).href,
        minBtn_pass:  new URL('@/assets/images/minBtn_pass.png', import.meta.url).href,
        pin:  new URL('@/assets/images/pin.png', import.meta.url).href,
        red:  new URL('@/assets/images/red.png', import.meta.url).href,
        redBtn:  new URL('@/assets/images/redBtn.png', import.meta.url).href,
        redBtn_pass:  new URL('@/assets/images/redBtn_pass.png', import.meta.url).href,
        reduceBtn:  new URL('@/assets/images/reduceBtn.png', import.meta.url).href,
        reduceBtn_pass:  new URL('@/assets/images/reduceBtn_pass.png', import.meta.url).href,
        muteSvg:  new URL('@/assets/images/mute.svg', import.meta.url).href,
        soundSvg:  new URL('@/assets/images/sound.svg', import.meta.url).href,
        settingSvg:  new URL('@/assets/images/setting.svg', import.meta.url).href,
        ico_fairness:  new URL('@/assets/images/ico_fairness.svg', import.meta.url).href,
        ico_game_rules:  new URL('@/assets/images/ico_game_rules.svg', import.meta.url).href,
        ico_history:  new URL('@/assets/images/ico_history.svg', import.meta.url).href,
        ico_limit:  new URL('@/assets/images/ico_limit.svg', import.meta.url).href,
        ico_sound:  new URL('@/assets/images/ico_sound.svg', import.meta.url).href,
    }

  return {
      showError,
      isMute,
      settingDialog,
      assets,
      isLoading,
      assetLoaded,
      gameLoaded,
   }
})
