import { ref, computed } from 'vue';
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import type {
    BetHistoryResponseList,
    BetRecordSeedResponse,
    GeneralResponse,
    SeedInfoResponse
} from '@/types/ResponseType';
import type {BetRecordSeedRequest, RefreshSeedRequest, UpdateSeedRequest} from '../types'

import {
    serviceBetHistory,
    serviceGetBetRecordSeed,
    serviceGetRefreshSeed,
    serviceGetSeedInfo,
    serviceUpdateSeed
} from '@/stores/service';

interface loadingInterface {
    appAssets: boolean
    getBetHistory: boolean
    getBetRecordSeed: boolean
    getSeedInfo: boolean
    getRefreshSeed: boolean
    updateSeed: boolean
}
interface PaginationInterface {
    PageIndex: number
    PageSize: number
}

export const useAppStore = defineStore('App', () => {
    const assetLoaded: Ref<boolean> = ref<boolean>(false)
    const gameLoaded: Ref<boolean> = ref<boolean>(false)
    const isLoading: Ref<loadingInterface> = ref({
        appAssets: ref(false),
        getBetHistory: ref(false),
        getBetRecordSeed: ref(false),
        getSeedInfo: ref(false),
        getRefreshSeed: ref(false),
        updateSeed: ref(false),
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
        //arrow:  new URL('@/assets/images/arrow.svg', import.meta.url).href,
        auto_btn:  new URL('@/assets/images/auto_btn.png', import.meta.url).href,
        background:  new URL('@/assets/images/background.png', import.meta.url).href,
        //boom:  new URL('@/assets/images/boom.gif', import.meta.url).href,
        closemouth:  new URL('@/assets/images/closemouth.png', import.meta.url).href,
        color:  new URL('@/assets/images/color.png', import.meta.url).href,
        colorBtn:  new URL('@/assets/images/colorBtn.png', import.meta.url).href,
        colorBtn_pass:  new URL('@/assets/images/colorBtn_pass.png', import.meta.url).href,
        pin:  new URL('@/assets/images/pin.png', import.meta.url).href,
        red:  new URL('@/assets/images/red.png', import.meta.url).href,
        redBtn:  new URL('@/assets/images/redBtn.png', import.meta.url).href,
        //redBtn_pass:  new URL('@/assets/images/redBtn_pass.png', import.meta.url).href,
        // muteSvg:  new URL('@/assets/images/mute.svg', import.meta.url).href,
        // soundSvg:  new URL('@/assets/images/sound.svg', import.meta.url).href,
        // settingSvg:  new URL('@/assets/images/setting.svg', import.meta.url).href,
        // ico_fairness:  new URL('@/assets/images/ico_fairness.svg', import.meta.url).href,
        // ico_game_rules:  new URL('@/assets/images/ico_game_rules.svg', import.meta.url).href,
        // ico_history:  new URL('@/assets/images/ico_history.svg', import.meta.url).href,
        // ico_limit:  new URL('@/assets/images/ico_limit.svg', import.meta.url).href,
        // ico_sound:  new URL('@/assets/images/ico_sound.svg', import.meta.url).href,
    }

    const getBetHistory = async(formData:PaginationInterface): Promise<BetHistoryResponseList> => {
        const { isFetching, data, execute } = serviceBetHistory(formData)
        if (typeof isFetching === "boolean") {
            isLoading.value.getBetHistory = isFetching
        }
        await execute()
        const responseData = data.value
        return responseData as BetHistoryResponseList
    }

    const getBetRecordSeed = async(formData:BetRecordSeedRequest): Promise<BetRecordSeedResponse> => {
        const { isFetching, data, execute } = serviceGetBetRecordSeed(formData)
        if (typeof isFetching === "boolean") {
            isLoading.value.getBetHistory = isFetching
        }
        await execute()
        const responseData = data.value
        return responseData as BetRecordSeedResponse
    }

    const getSeedInfo = async(): Promise<SeedInfoResponse> => {
        const { isFetching, data, execute } = serviceGetSeedInfo({})
        if (typeof isFetching === "boolean") {
            isLoading.value.getSeedInfo = isFetching
        }
        await execute()
        const responseData = data.value
        return responseData as SeedInfoResponse
    }

    const getRefreshSeed = async(formData:RefreshSeedRequest):Promise<BetRecordSeedResponse> => {
        const { isFetching, data, execute } = serviceGetRefreshSeed(formData)
        if (typeof isFetching === "boolean") {
            isLoading.value.getBetHistory = isFetching
        }
        await execute()
        const responseData = data.value
        return responseData as BetRecordSeedResponse
    }

    const updateSeed = async(formData:UpdateSeedRequest):Promise<GeneralResponse> => {
        const { isFetching, data, execute } = serviceUpdateSeed(formData)
        if (typeof isFetching === "boolean") {
            isLoading.value.getBetHistory = isFetching
        }
        await execute()
        const responseData = data.value
        return responseData as GeneralResponse
    }

  return {
      showError,
      isMute,
      settingDialog,
      assets,
      isLoading,
      assetLoaded,
      gameLoaded,
      getBetHistory,
      getBetRecordSeed,
      getSeedInfo,
      getRefreshSeed,
      updateSeed
   }
})
