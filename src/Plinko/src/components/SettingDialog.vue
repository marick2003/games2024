<script setup lang="ts">
import {ref, reactive, computed, watch, type Ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { vIntersectionObserver } from '@vueuse/components'
import Decimal from 'decimal.js';
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useGameStore } from '@/stores/game';
import type { BetHistoryResponseList, BetHistoryResponse } from '@/types/ResponseType';
import type { CurrencyLimitType } from '@/types/game'
import randomize from 'randomatic';
import { useForm, Field, ErrorMessage, useField } from 'vee-validate';
import * as yup from 'yup';

const { t: $t  } = useI18n()

const appStore = useAppStore()
const gameStore = useGameStore()

const root = ref(null)

const seedData = reactive({
  ServerSeed: '',
  ClientSeed: '',
  Nonce: ''
})

const updateSeedData = reactive({
  NewServerSeed: '',
  NewServerSeedHash: ''
})

const betDetailSeedData = reactive({
  ClientSeed: '',
  Nonce: '',
  ServerSeed: '',
  ServerSeedHash: ''
})

const betHistoryResponseList: Ref<BetHistoryResponseList|{}> = ref({})
const betHistoryResult: Ref<BetHistoryResponse[]> = ref([])
const pageIndex:Ref<number> = ref(1)
const source:Ref<string> = ref('')
const isShowBetDetail:Ref<boolean> = ref(false)
const isShowGameFairness:Ref<boolean> = ref(false)
const selectedBetDetail:Ref<BetHistoryResponse | null> = ref(null)

const { text, copy, copied, isSupported } = useClipboard({source})
const isScrollBottom = ref(false)
const lastPageNode = ref(true)
function onIntersectionObserver([{ isIntersecting }]) {
  if (isIntersecting){
    if (betHistoryResponseList.value.Data.PageCount > betHistoryResponseList.value.Data.PageIndex){
        pageIndex.value= pageIndex.value + 1
        getBetHistory(pageIndex.value)
        isScrollBottom.value = false
    }else{
      isScrollBottom.value = true
      setTimeout(()=> lastPageNode.value = false, 5000)
    }
  }
}
const getCurrentDateTimeWithTimezone = (datetime = ''):string => {
  const date = new Date(datetime);
  const timeOffsetInMS:number = date.getTimezoneOffset() * 60000;
  date.setTime(date.getTime() - timeOffsetInMS);

  // Get components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Format string
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const showHistoryListPlaceholder = ref(true)
const getBetHistory = async(index:number = 1) => {
  appStore.isLoading.getBetHistory = true
  if (index === 1){
    showHistoryListPlaceholder.value = true
  }

    const response = await appStore.getBetHistory({PageIndex: index, PageSize: 10})

    if (response.IsSuccess) {
      appStore.isLoading.getBetHistory = false
      showHistoryListPlaceholder.value = false
      betHistoryResponseList.value = response
      betHistoryResult.value = [...betHistoryResult.value, ...response.Data.Items]
    }

}

const getSeedInfo = async() => {
  const { IsSuccess, Data } = await appStore.getSeedInfo()
  if (IsSuccess){
    Object.assign(seedData, Data)
  }
}
const getServerRefreshSeed = async() => {
  const { IsSuccess, Data } = await appStore.getRefreshSeed({ SeedType: seedType.value})
  if (IsSuccess){
    Object.assign(updateSeedData, Data)
  }
}
const generateRandom = () => randomize('?', 10, {chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%*+-=_.,:;'})

const { values, errors, handleSubmit,  defineField } = useForm({
  validationSchema: yup.object({
    seedType: yup.string().required($t('Validation.Required')).min(6, $t('Validation.Min')).max(20, $t('Validation.Max'))
  }),
  initialValues: {
    seedType: generateRandom()
  }
});
const [ seedType, seedTypeAttrs ] = defineField('seedType');
const { value, handleChange } = useField('seedType', value => !!value);

const returnCurrency = (img:string):string => {
  if (img === '0') return
  return `/${img.toLowerCase()}.svg`
}
const submittingForm = ref(false)
const showSuccessMessage = ref(false)
const onSubmit = handleSubmit(async(values)=> {
  submittingForm.value = true
  const { IsSuccess } = await appStore.updateSeed({ NewClientSeed: seedType.value, NewServiceSeed: updateSeedData.NewServerSeed})
  if (IsSuccess){
    showSuccessMessage.value = true
    getSeedInfo()
    getServerRefreshSeed()
  }

  setTimeout(()=> showSuccessMessage.value = false, 1000)
  submittingForm.value = false

})
const betRecordDetail = async(item:BetHistoryResponse) => {
  const { IsSuccess, Data } = await appStore.getBetRecordSeed({ Id: item.Id, Time: item.Time})
  if (IsSuccess){
    isShowBetDetail.value = true

    selectedBetDetail.value = item
    Object.assign(betDetailSeedData, Data)
  }
}

watch(()=> appStore.settingDialog.section,(val)=>{
  betHistoryResult.value = []
  betHistoryResponseList.value = {}
  if (val === 'history'){
    pageIndex.value = 1
    getBetHistory(1)
  }
  if (val === 'fairness'){
    getSeedInfo()
    seedType.value = generateRandom()
    getServerRefreshSeed()
  }
  if (val === 'fairness-history'){
    getSeedInfo()
    seedType.value = generateRandom()
    getServerRefreshSeed()
  }
  if (val === 'main'){
    isShowBetDetail.value= false
    selectedBetDetail.value = null
  }
})

const returnColorNumber = (number):string => {
  if (number >= 10 && number < 100) {
    return "text-gradient-blue";
  } else if (number >= 100 && number < 1000) {
    return "text-gradient-bronze";
  } else if (number >= 1000 && number < 10000) {
    return "text-gradient-maroon";
  } else if (number >= 10000){
    return "text-gradient-orange";
  }else {
    return 'text-white'
  }
}
const backButtonControl = (): void => {
  if (appStore.settingDialog.section === 'fairness'){
    appStore.settingDialog.section = 'main'
  }
  if (appStore.settingDialog.section === 'fairness-history') {
    appStore.settingDialog.section = 'history'
  }
  if (appStore.settingDialog.section === 'what-is-instruction' && isShowBetDetail.value) {
    appStore.settingDialog.section = 'history'
  }else if (appStore.settingDialog.section === 'what-is-instruction' && !isShowBetDetail.value){
    appStore.settingDialog.section = 'fairness'
  }
}

const returnPlaceholderWidth = (): number => (Math.floor(Math.random()* 50) ) + 45
const returnCurrentLimitByCurrency = (currency:string):CurrencyLimitType => gameStore.currencyLimit.find((obj:CurrencyLimitType) => obj.Currency === currency)

const closeSettingDialog = ():void => {
  appStore.settingDialog.visible=false;
  appStore.settingDialog.section = ''
  isShowBetDetail.value = false
  isShowGameFairness.value = false
}
</script>

<template>
  <div
       :class="[appStore.settingDialog.visible ? 'pointer-events-auto' : 'pointer-events-none']"
       @click.self="appStore.settingDialog.visible = false; appStore.settingDialog.section = ''"
       class="fixed flex flex-col items-center left-[50%] top-0 -translate-x-[50%] w-[376px] h-[100%] overflow-hidden z-20">
    <div
         :class="[
           appStore.settingDialog.section === '' ? 'hidden pointer-events-none' : appStore.settingDialog.section === 'main' ? 'pointer-events-auto' : '',
           appStore.settingDialog.section !== '' && appStore.settingDialog.section !== 'main' ? 'opacity-0 pointer-events-none' : 'opacity-1 pointer-events-auto !delay-200'
           ]"
         class='modal-container main-menu active-container flex flex-col z-50'>
      <div class="relative">
        <button class="absolute right-4 top-0" @click.prevent="appStore.settingDialog.visible = false; appStore.settingDialog.section = ''"><img src="@/assets/images/close-button.svg" /></button>
      </div>
      <div class='modal-content mx-auto text-left flex flex-col flex-1 justify-center gap-8' >
        <button @click.prevent="appStore.settingDialog.section='history'" :data-text="$t('BetHistory')">
          <div class="gradient-icon"><img src="@/assets/images/ico_history.svg" /></div>
          {{$t('BetHistory')}}
        </button>
        <button @click.prevent="appStore.settingDialog.section='bet-limit'"  :data-text="$t('BetLimit')">
          <div class="gradient-icon"><img src="@/assets/images/ico_limit.svg" /></div>
          {{$t('BetLimit')}}
        </button>
        <button @click.prevent="appStore.settingDialog.section='game-rule'" :data-text="$t('GameRule')">
          <div class="gradient-icon"><img src="@/assets/images/ico_game_rules.svg" /></div>
          {{$t('GameRule')}}
        </button>
        <button @click.prevent="appStore.settingDialog.section='fairness'" :data-text="$t('Fairness')">
          <div class="gradient-icon"><img src="@/assets/images/ico_fairness.svg" /></div>
          {{$t('Fairness')}}
        </button>
      </div>
    </div>

    <div
      :class="[ /history/g.test(appStore.settingDialog.section) ? '!translate-x-[-50%] !translate-y-[-50%] active-container' : '!translate-x-[600px] !translate-y-[-50%]',
      isShowBetDetail ? '!translate-x-[-600px] !translate-y-[-50%] active-container' : '']"
      class='modal-container z-50'>
      <div class="relative modal-header">
        <h1>{{$t('BetHistory')}}</h1>
        <button class='absolute left-8 top-0 !pt-0' @click.prevent="appStore.settingDialog.section='main'"><img src="@/assets/images/back-button.svg" /></button>
      </div>

      <div class='modal-content mx-auto text-left relative overflow-hidden h-[calc(100%-60px)]'>
        <PerfectScrollbar
          :options='{ minScrollbarLength: 20 }'
          class="pt-4 h-full overflow-y-auto !overflow-x-hidden">
          <div class="flex flex-col gap-3.5"  ref="root">
            <template v-if="appStore.settingDialog.section==='history' &&  betHistoryResult.length > 0">
              <div v-for="(history, index) in betHistoryResult" :key="history.Id" class="cursor-pointer card-row relative !px-3" @click="betRecordDetail(history)">
                <div v-if='index === (betHistoryResult.length - 1)'
                     v-intersection-observer="onIntersectionObserver"
                     class="absolute text-center w-[200px] left-[60px] pointer-events-none">
                </div>
                <div class="flex flex-row justify-between">
                  <div class="flex flex-[2]">
                    <div class="bg-gray-600 aspect-square relative w-full max-w-[30px] max-h-[30px] mx-auto rounded">
                      <img src="/plinko.png" class="absolute w-full h-full" />
                    </div>
                    <div class="flex flex-col ml-2.5 flex-1  translate-y-[-1px]">
                      <h4 class="font-bold text-sm leading-tight">Crocodile Plinko</h4>
                      <div class="flex items-center text-xs leading-4" >
                        <img :src='returnCurrency(history.Currency)' class="w-[14px] mr-1" />
                        {{ new Decimal(history.Amount).toFixed(8) }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-end text-xs" :class="history.Amount > 0 ? 'text-[#51C53F]' : ''">
                    {{history.Amount !== 'undefined' ? '+' : '--'}}{{ history.Payout === 0 ? '0' : new Decimal(history.Payout).toFixed(8) }}
                  </div>
                </div>
                <div class="flex flex-row justify-between text-xs mt-0.5">
                  <div class="text-[#8D8B8A] datetime-font">
                    {{getCurrentDateTimeWithTimezone(history.Time)}}
                  </div>
                  <div class="flex-[3] text-right font-bold" :class="returnColorNumber(history.PayoutMultiplier)">{{ history.PayoutMultiplier }}x</div>
                </div>

              </div>
              <div class='absolute bottom-[30px] text-xs text-center w-full translate-x-[-28px] translate-y-[18px] pointer-events-none transition-all'
                   :class="[appStore.isLoading.getBetHistory ? 'opacity-50':'opacity-0']"
                >{{$t('LoadingMore')}}</div>
              <div class="text-xs text-center flex w-fit mx-auto mb-4 pointer-events-none transition-all rounded-lg bg-gray-900 py-2 px-6"
                   :class="[isScrollBottom && lastPageNode ? 'opacity-80':'opacity-0']"
              >{{$t('NoMoreResult')}}</div>
            </template>

            <template v-if="appStore.settingDialog.section==='history' && appStore.isLoading.getBetHistory && showHistoryListPlaceholder">
              <div v-for="item in new Array(3).fill(null)"  class="card-row relative !px-3">

                <div class="flex flex-row justify-between">
                  <div class="flex flex-[2]">
                    <div class="bg-gray-600 aspect-square w-full max-w-[30px] max-h-[30px] mx-auto placeholder"></div>
                    <div class="flex flex-col ml-2.5 flex-1  translate-y-[-1px]">
                      <h4 class="h-[12px] bg-slate-600 rounded my-[2px] placeholder" :style="'width: '+returnPlaceholderWidth() +'%'"><div class="animated-background"></div></h4>
                      <div class="h-[12px] bg-slate-600 rounded placeholder" :style="'width: '+returnPlaceholderWidth() +'%'">
                        <div class="animated-background"></div>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-1 h-[12px] bg-slate-600 rounded mx-auto placeholder mt-auto mb-1" :style="'width: '+returnPlaceholderWidth() +'%'">
                    <div class="animated-background"></div>
                  </div>
                </div>
                <div class="flex flex-row justify-between text-xs mt-0.5 gap-16">
                  <div class="h-[12px] bg-slate-600 rounded placeholder" :style="'width: '+returnPlaceholderWidth() +'%'">
                    <div class="animated-background"></div>
                  </div>
                  <div class="h-[12px] bg-slate-600 rounded placeholder" :style="'width: '+returnPlaceholderWidth() +'%'">
                    <div class="animated-background"></div>
                  </div>
                </div>

              </div>
            </template>

            <template v-if="appStore.settingDialog.section==='history' &&  betHistoryResult.length === 0">
              <div class="flex items-center justify-center mt-48 text-lg font-bold opacity-50">
                {{$t('NoRecord')}}
              </div>
            </template>
          </div>
        </PerfectScrollbar>

      </div>

      <div class="drawer-action">
        <button class='back-button' @click.prevent="closeSettingDialog">
          {{ $t('Close') }}
        </button>
      </div>
    </div>

    <div
      :class="[appStore.settingDialog.section === 'bet-limit' ? '!translate-x-[-50%] !translate-y-[-50%] active-container' : '!translate-x-[600px] !translate-y-[-50%]']"
      class='modal-container z-50'>
      <div class="relative modal-header">
        <h1>{{$t('BetLimit')}}</h1>
        <button class='absolute left-8 top-0 !pt-0' @click.prevent="appStore.settingDialog.section='main'"><img src="@/assets/images/back-button.svg" /></button>
      </div>
      <div class='modal-content mx-auto text-left h-[calc(100%-72px)]' v-if="returnCurrentLimitByCurrency(gameStore.currency)">
        <div class="card-row my-3 text-xs flex flex-row justify-between">
          <div class="flex flex-row flex-[2] justify-between">
            {{$t('MaximumBetAmount')}} <img :src="returnCurrency(gameStore.currency)" class="w-[16px]" />
          </div>
          <div class="flex-[3] text-right">
            {{ new Decimal(returnCurrentLimitByCurrency(gameStore.currency).MaxBetAmount).toFixed(8) || new Decimal(0).toFixed(8)}}
          </div>
        </div>
        <div class="card-row my-3 text-xs flex flex-row justify-between">
          <div class="flex flex-row flex-[2] justify-between">
            {{$t('MinimumBetAmount')}} <img :src="returnCurrency(gameStore.currency)" class="w-[16px]" />
          </div>
          <div class="flex-[3] text-right">
            {{ new Decimal(returnCurrentLimitByCurrency(gameStore.currency).MinBetAmount).toFixed(8) || new Decimal(0).toFixed(8)}}
          </div>
        </div>
        <div class="card-row text-xs flex flex-row justify-between">
          <div class="flex flex-row flex-[2] justify-between">
            {{$t('MaximumProfit')}}<img :src="returnCurrency(gameStore.currency)" class="w-[16px]" />
          </div>
          <div class="flex-[3] text-right">
            {{ new Decimal(returnCurrentLimitByCurrency(gameStore.currency).AmountUnit).toFixed(8) || new Decimal(0).toFixed(8)}}
          </div>
        </div>
      </div>
      <div class="drawer-action">
        <button class='back-button' @click.prevent="closeSettingDialog">
          {{ $t('Close') }}
        </button>
      </div>
    </div>

    <div
      :class="[appStore.settingDialog.section === 'game-rule' ? '!translate-x-[-50%] !translate-y-[-50%] active-container' : '!translate-x-[600px] !translate-y-[-50%]']"
      class='modal-container z-50'>
      <div class="relative modal-header">
        <h1>{{$t('GameInstruction')}}</h1>
        <button class='absolute left-8 top-0 !pt-0' @click.prevent="appStore.settingDialog.section='main'"><img src="@/assets/images/back-button.svg" /></button>
      </div>
      <div class='modal-content mx-auto text-left h-[calc(100%-60px)]'>

        <PerfectScrollbar
          :options='{ minScrollbarLength: 20, maxScrollbarLength: 50}'
          class="pt-4 h-full overflow-y-auto !overflow-x-hidden">
          <div class="bg-gray-600 aspect-square relative w-full max-w-[65px] mx-auto mt-4 mb-2 rounded">
            <img src="/plinko.png" class="absolute w-full h-full" />
          </div>
          <div class='game-instruction' v-html="$t('GameInstructionContent')"></div>
        </PerfectScrollbar>
      </div>
      <div class="drawer-action">
        <button class='back-button' @click.prevent="closeSettingDialog">
          {{ $t('Close') }}
        </button>
      </div>
    </div>

    <div
      :class="[/fairness/g.test(appStore.settingDialog.section) ? '!translate-x-[-50%] !translate-y-[-50%] active-container' : '!translate-x-[600px] !translate-y-[-50%]']"
      class='modal-container !z-[51]'>
      <div class="relative modal-header">
        <h1>{{$t('Fairness')}}</h1>

        <button class='absolute left-8 top-0 !pt-0' @click.prevent="backButtonControl"><img src="@/assets/images/back-button.svg" /></button>
      </div>
      <div class='modal-content mx-auto text-left h-[calc(100%-60px)]'>
        <PerfectScrollbar :options='{ minScrollbarLength: 20, maxScrollbarLength: 50}' class="h-[100%] overflow-y-auto">
          <p class="my-2 text-center text-xs opacity-70 font-normal mt-4 px-4">{{$t('FairnessCaption')}}</p>
          <h1 class="text-center font-bold my-1">{{$t('CurrentSeed')}}</h1>

          <div class="card-row text-xs !px-3.5 !py-3 flex gap-3 flex-col">
            <div class="flex items-center gap-2">
              <img src="/serverseedhash.svg" alt="">
              {{ $t('ServerSeedHashing') }}
            </div>
            <div class="input-bg">
              <input type="text" readonly :value="seedData.ServerSeed"  />
              <template v-if="isSupported && seedData.ServerSeed">
                <button @click="()=>{ source = seedData.ServerSeed || ''; copy(source)}" class="!p-0 absolute top-1 right-1 w-[12px]">
                  <span class='absolute right-0 top-0 transition-opacity' :class="[source === seedData.ServerSeed && source !=='' ? 'opacity-1':'opacity-0']"><img src="/tiny-copied.svg" /></span>
                  <span class='absolute right-0 top-0 transition-opacity' :class="[source !== seedData.ServerSeed ? 'opacity-1':'opacity-0']"><img src="/tiny-copy.svg" /></span>
                </button>
              </template>
            </div>
          </div>
          <div class="card-row text-xs !px-3.5 !py-3 flex gap-3 flex-col my-3">
            <div class="flex items-center gap-2">
              <img src="/clientseed.svg" alt="">
              {{ $t('ClientSeed') }}
            </div>
            <div class="input-bg">
              <input type="text" readonly :value="seedData.ClientSeed"  />
              <template v-if="isSupported && seedData.ClientSeed">
                <button @click="()=>{ source = seedData.ClientSeed || ''; copy(source)}" class="!p-0 absolute top-1 right-1 w-[12px]">
                  <span class='absolute right-0 top-0 transition-opacity' :class="[source === seedData.ClientSeed && source !=='' ? 'opacity-1':'opacity-0']"><img src="/tiny-copied.svg" /></span>
                  <span class='absolute right-0 top-0 transition-opacity' :class="[source !== seedData.ClientSeed ? 'opacity-1':'opacity-0']"><img src="/tiny-copy.svg" /></span>
                </button>
              </template>
            </div>
          </div>
          <div class="card-row text-xs !px-3.5 !py-3 flex gap-3 flex-col">
            <div class="flex items-center gap-2">
              {{ $t('Nonce') }}
            </div>
            <div class="input-bg">
              <input type="text" readonly :value="seedData.Nonce"  />
              <template v-if="isSupported && seedData.Nonce">
                <button @click="()=>{ source = seedData.Nonce || ''; copy(source)}" class="!p-0 absolute top-1 right-1 w-[12px]">
                  <span class='absolute right-0 top-0 transition-opacity' :class="[source === seedData.Nonce && source !=='' ? 'opacity-1':'opacity-0']"><img src="/tiny-copied.svg" /></span>
                  <span class='absolute right-0 top-0 transition-opacity' :class="[source !== seedData.Nonce ? 'opacity-1':'opacity-0']"><img src="/tiny-copy.svg" /></span>
                </button>
              </template>
            </div>
          </div>
          <h1 class="text-center font-bold mt-4 mb-1">{{$t('UpdateSeed')}}</h1>
          <form @submit.prevent='onSubmit' class='flex flex-col'>

            <div class="card-row text-xs !px-3.5 !py-3 flex gap-3 flex-col">
              <div class="flex items-center gap-2">
                <img src="/serverseedhash.svg" alt="">
                {{ $t('ServerSeedHashing') }}
              </div>
              <div class="input-bg">
                <input type="text" readonly :value="updateSeedData.NewServerSeedHash"  />
                <template v-if="isSupported && updateSeedData.NewServerSeedHash">
                  <button @click.prevent="()=>{ source = updateSeedData.NewServerSeedHash || ''; copy(source)}" class="!p-0 absolute top-1 right-1 w-[12px]">
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source === updateSeedData.NewServerSeedHash && source !=='' ? 'opacity-1':'opacity-0']"><img src="/tiny-copied.svg" /></span>
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source !== updateSeedData.NewServerSeedHash ? 'opacity-1':'opacity-0']"><img src="/tiny-copy.svg" /></span>
                  </button>
                </template>
              </div>
            </div>

            <div class="card-row text-xs !px-3.5 !py-3 flex gap-3 flex-col relative  my-3">
              <div class="flex items-center gap-2">
                <img src="/clientseed.svg" alt="">
                {{ $t('NewClientSeed') }}
              </div>
              <div class="relative">
                <div class="input-bg !bg-[#414350] w-[90%] after:!w-[0]" :class='errors.seedType ? "error":""'>
                  <Field

                    :validateOnInput="true"
                    :disabled='submittingForm'
                    name='seedType'
                  />

                  <template v-if="isSupported">
                    <button @click.prevent="()=>{ source = seedType || ''; copy(source)}" class="!p-0 absolute top-1 right-2 w-[12px]">
                      <span class='absolute right-0 top-0 transition-opacity' :class="[source === seedType && source !=='' ? 'opacity-1':'opacity-0']"><img src="/tiny-copied.svg" /></span>
                      <span class='absolute right-0 top-0 transition-opacity' :class="[source !== seedType ? 'opacity-1':'opacity-0']"><img src="/tiny-copy.svg" /></span>
                    </button>
                  </template>
                </div>
                <button @click.prevent="seedType = generateRandom()" class="p-1 absolute top-[-2px] right-2 transition-all opacity-70 hover:opacity-100">
                  <img src="/generate-random.svg" />
                </button>
              </div>
              <ErrorMessage class='error-msg' name='seedType' />

            </div>

            <div class="w-full mt-2">
              <button
                @click.prevent="onSubmit" class="update-button"
                :disabled="Object.keys(errors).length > 0 || submittingForm"
              >
                <template v-if="!submittingForm">{{$t('Update')}}</template>
                <template v-else>{{$t('Updating')}}...</template>

              </button>
            </div>
          </form>
          <div class="success-message" :class="showSuccessMessage ? 'active': ''">
            {{$t('UpdateSuccess')}}
          </div>
          <div class="drawer-action !border-none mb-4">
            <button @click.prevent="appStore.settingDialog.section = 'what-is-instruction'" class="blue-gradient-link">{{$t('WhatIsFairness')}}</button>
          </div>
        </PerfectScrollbar>

      </div>
      <div class="drawer-action">
        <button class='back-button' @click.prevent="closeSettingDialog">
          {{ $t('Close') }}
        </button>
      </div>
    </div>

    <div
      :class="[
        isShowBetDetail ? (appStore.settingDialog.section === 'what-is-instruction' || appStore.settingDialog.section === 'fairness-history')
        ? '!translate-x-[-150%] !translate-y-[-50%] active-container' :'!translate-x-[-50%] !translate-y-[-50%] active-container' : '!translate-x-[-600px] !translate-y-[-50%]'
      ]"
      class="modal-container z-50" >
      <div class="relative modal-header">
        <h1>
          {{$t('BetDetail')}}
        </h1>

        <button class='absolute left-8 top-0 !pt-0' @click.prevent="isShowBetDetail = false; isShowGameFairness = false"><img src="@/assets/images/back-button.svg" /></button>
      </div>
      <div class='modal-content mx-auto text-left h-[calc(100%-60px)]' v-if="selectedBetDetail">
        <PerfectScrollbar :options='{ minScrollbarLength: 20, maxScrollbarLength: 50}' class="h-[100%] overflow-y-auto pt-4">
          <h1 class="text-center font-bold">Crocodile Plinko</h1>

          <div class="bg-gray-600 aspect-square relative w-full max-w-[65px] mx-auto my-[10px] rounded">
            <img src="/plinko.png" class="absolute w-full h-full" />
          </div>

          <div class="card-row text-xs !px-3 !py-3 flex gap-3 flex-col text-nowrap mb-3">
            <div class="flex justify-between relative">
              <div>
                {{$t('BetID')}}
              </div>
              <div class="pr-[13px]">
                {{selectedBetDetail.Id}}

                <template v-if="isSupported && selectedBetDetail.Id">
                  <button @click="()=>{ source = selectedBetDetail?.Id || ''; copy(source)}" class="!p-0 absolute top-[1px] -right-0.5 w-[12px]">
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source === selectedBetDetail.Id && source !=='' ? 'opacity-1':'opacity-0']"><img src="/tiny-copied.svg" /></span>
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source !== selectedBetDetail.Id  ? 'opacity-1':'opacity-0']"><img src="/tiny-copy.svg" /></span>
                  </button>
                </template>
              </div>
            </div>
            <div class="flex justify-between relative">
              <div>
                {{$t('BetAmount')}}
              </div>
              <div class="flex gap-2 items-center"><img :src='returnCurrency(selectedBetDetail.Currency)' /> {{ selectedBetDetail.Amount === 0 ? '0' : new Decimal(selectedBetDetail.Amount).toFixed(8) }}</div>
            </div>
            <div class="flex justify-between relative">
              <div>
                {{$t('BetTime')}}
              </div>
              <div class="datetime-font">{{ getCurrentDateTimeWithTimezone(selectedBetDetail.Time) }}</div>
            </div>

            <div class="flex justify-between relative">
              <div>
                {{$t('Multiplier')}}
              </div>
              <div :class="returnColorNumber(selectedBetDetail.PayoutMultiplier)">{{ selectedBetDetail.PayoutMultiplier || '--' }}x</div>
            </div>
          </div>

          <div class="card-row text-xs !px-3.5 !py-3 flex gap-3 flex-col">
            <div class="flex justify-between relative">
              <div>
                {{$t('Cashout')}}
              </div>
              <div :class="selectedBetDetail.Payout > 0 ? 'text-[#51C53F]' : ''">
                {{selectedBetDetail.Payout !== 'undefined' ? '+' : '--'}}{{ selectedBetDetail.Payout === 0 ? '0' : new Decimal(selectedBetDetail.Payout).toFixed(8) }}
              </div>
            </div>

            <div class="flex justify-between relative">
              <div>
                {{$t('Row')}}
              </div>
              <div>{{ selectedBetDetail.Rows}}</div>
            </div>

            <div class="flex justify-between relative">
              <div>
                {{$t('Crocodile')}}
              </div>
              <div>{{ selectedBetDetail.Risk}}</div>
            </div>

            <div class="flex justify-between relative">
              <div>
                {{$t('Ball')}}
              </div>
              <div>{{ selectedBetDetail.Ball}}</div>
            </div>
          </div>

          <button class="relative my-5 bevel-button w-full text-center" @click.prevent="isShowGameFairness = !isShowGameFairness">
            <span class="tiny-text scale-90 block mx-auto">
            {{$t('GameFairness')}}
            </span>
            <img class='absolute right-3 transition-transform' :class="[isShowGameFairness ? 'rotate-180':'']" src="/arrow.svg" alt="">
          </button>
          <div v-if="isShowGameFairness">
            <div class="card-row text-xs !px-3.5 !py-3 flex gap-3 flex-col">
              <div class="flex items-center gap-2">
                <img src="/serverseed.svg" alt="" class="py-1 px-0.5">
                {{ $t('ServerSeed') }}
              </div>
              <div class="input-bg">
                <input type="text" readonly :value="betDetailSeedData.ServerSeed !== '' ? betDetailSeedData.ServerSeed : $t('Unannounced')" :class="betDetailSeedData.ServerSeed ==='' ? 'text-center':''"  />
                <template v-if="isSupported && betDetailSeedData.ServerSeed">
                  <button @click="()=>{ source = betDetailSeedData.ServerSeed || ''; copy(source)}" class="!p-0 absolute top-1 right-1 w-[12px]">
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source === betDetailSeedData.ServerSeed && source !=='' ? 'opacity-1':'opacity-0']"><img src="/tiny-copied.svg" /></span>
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source !== betDetailSeedData.ServerSeed  ? 'opacity-1':'opacity-0']"><img src="/tiny-copy.svg" /></span>
                  </button>
                </template>
              </div>
            </div>

            <div class="card-row text-xs !px-3.5 !py-3 flex gap-3 flex-col my-2">
              <div class="flex items-center gap-2">
                <img src="/serverseedhash.svg" alt="">
                {{ $t('ServerSeedHashing') }}
              </div>
              <div class="input-bg">
                <input type="text" readonly :value="betDetailSeedData.ServerSeedHash !== '' ? betDetailSeedData.ServerSeedHash : ''"  />
                <template v-if="isSupported && betDetailSeedData.ServerSeedHash">
                  <button @click="()=>{ source = betDetailSeedData.ServerSeedHash || ''; copy(source)}" class="!p-0 absolute top-1 right-1 w-[12px]">
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source === betDetailSeedData.ServerSeedHash && source !=='' ? 'opacity-1':'opacity-0']"><img src="/tiny-copied.svg" /></span>
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source !== betDetailSeedData.ServerSeedHash  ? 'opacity-1':'opacity-0']"><img src="/tiny-copy.svg" /></span>
                  </button>
                </template>
              </div>
            </div>

            <div class="card-row text-xs !px-3.5 !py-3 flex gap-3 flex-col my-2">
              <div class="flex items-center gap-2">
                <img src="/clientseed.svg" alt="">
                <div class="flex flex-col">
                  <div>
                    {{ $t('ClientSeed') }}
                  </div>
                  <div class="text-xs opacity-50 font-normal">
                    {{ $t('DefaultOrDefine') }}
                  </div>
                </div>
              </div>
              <div class="input-bg">
                <input type="text" readonly :value="betDetailSeedData.ClientSeed !== '' ? betDetailSeedData.ClientSeed : ''"  />
                <template v-if="isSupported && betDetailSeedData.ClientSeed">
                  <button @click="()=>{ source = betDetailSeedData.ClientSeed || ''; copy(source)}" class="!p-0 absolute top-1 right-1 w-[12px]">
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source === betDetailSeedData.ClientSeed && source !=='' ? 'opacity-1':'opacity-0']"><img src="/tiny-copied.svg" /></span>
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source !== betDetailSeedData.ClientSeed  ? 'opacity-1':'opacity-0']"><img src="/tiny-copy.svg" /></span>
                  </button>
                </template>
              </div>
            </div>
            <div class="card-row text-xs !px-3.5 !py-3 flex gap-3 flex-col mt-2 mb-0">
              <div class="flex items-center gap-2">
                <img src="/nonce.svg" alt="">
                {{ $t('RandomNumber') }}
              </div>
              <div class="input-bg">
                <input type="text" readonly :value="betDetailSeedData.Nonce !== '' ? betDetailSeedData.Nonce : ''"  />
                <template v-if="isSupported && betDetailSeedData.Nonce">
                  <button @click="()=>{ source = betDetailSeedData.Nonce || ''; copy(source)}" class="!p-0 absolute top-1 right-1 w-[12px]">
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source === betDetailSeedData.Nonce && source !=='' ? 'opacity-1':'opacity-0']"><img src="/tiny-copied.svg" /></span>
                    <span class='absolute right-0 top-0 transition-opacity' :class="[source !== betDetailSeedData.Nonce  ? 'opacity-1':'opacity-0']"><img src="/tiny-copy.svg" /></span>
                  </button>
                </template>
              </div>
            </div>

            <div class="drawer-action !border-none">
              <button @click.prevent="appStore.settingDialog.section = 'what-is-instruction'" class="blue-gradient-link">{{$t('WhatIsFairness')}}</button>
              <button @click.prevent="appStore.settingDialog.section = 'fairness-history'" class="blue-gradient-link">{{$t('ChangeSeed')}}</button>
            </div>
          </div>
        </PerfectScrollbar>

      </div>

      <div class="drawer-action">
        <button class='back-button' @click.prevent="closeSettingDialog">
          {{ $t('Close') }}
        </button>
      </div>
    </div>

    <div
      :class="[appStore.settingDialog.section === 'what-is-instruction' ? '!translate-x-[-50%] !translate-y-[-50%] active-container' : '!translate-x-[600px] !translate-y-[-50%]']"
      class='modal-container z-50'>
      <div class="relative modal-header">
        <h1>{{$t('FairnessInstruction.Title')}}</h1>
        <button class='absolute left-8 top-0 !pt-0' @click.prevent="backButtonControl"><img src="@/assets/images/back-button.svg" /></button>
      </div>
      <div class='modal-content mx-auto text-left h-[calc(100%-60px)]'>
        <PerfectScrollbar :options='{ minScrollbarLength: 20, maxScrollbarLength: 50}' class="h-[100%] overflow-y-auto overflow-x-hidden pt-0">
          <div class='game-instruction'>
            <p class="text-center opacity-50 !leading-6">{{$t('FairnessInstruction.Paragraph1')}}</p>
            <h4 class="text-center font-bold mt-3 mb-2">{{$t('FairnessInstruction.Method')}}</h4>
            <p class="text-center opacity-50 !leading-6 !mb-3">{{$t('FairnessInstruction.Paragraph2')}}</p>
          </div>

          <div class="card-row text-xs !px-4 !py-2 flex gap-1.5 flex-col">
            <div class="flex items-center gap-2">
              <img src="/serverseed.svg" alt="" class="py-1 px-0.5">
              {{ $t('ServerSeed') }}
            </div>
            <div class="input-bg after:!w-0">
              <textarea
                rows="2"
                class="tiny-text scale-90 -translate-x-2 break-all !pr-0 !pt-1 !w-[calc(100%+1.25rem)]"
                readonly>b95137361b7700e02cdc2d34d65f755236ba57cf3064cd072eadd55e5a191ed3</textarea>
            </div>
            <p class="my-2 text-xs opacity-70">{{$t('FairnessInstruction.ServerSeedInstruction')}}</p>
          </div>

          <div class="card-row text-xs !px-4 !py-2 flex gap-1.5 flex-col mt-2">
            <div class="flex items-center gap-2">
              <img src="/clientseed.svg" alt="" class="py-1 px-0.5">
              {{ $t('ClientSeed') }}
            </div>
            <div class="input-bg after:!w-0">
              <input
                class="tiny-text scale-90 -translate-x-2 break-all !pr-0 !pt-1 !w-[calc(100%+1.25rem)]"
                readonly
                value="A12bsle9-L"
               />
            </div>
            <p class="my-2 text-xs opacity-70">{{$t('FairnessInstruction.ClientSeedInstruction')}}</p>
          </div>

          <div class="card-row text-xs !px-4 !py-2 flex gap-1.5 flex-col mt-2">
            <div class="flex items-center gap-2">
              <img src="/nonce.svg" alt="" class="py-1 px-0.5">
              {{ $t('RandomNumber') }}
            </div>
            <div class="input-bg after:!w-0">
              <input
                class="tiny-text scale-90 -translate-x-2 break-all !pr-0 !pt-1 !w-[calc(100%+1.25rem)]"
                readonly
                value="24"
              />
            </div>
            <p class="my-2 text-xs opacity-70">{{$t('FairnessInstruction.NonceInstruction')}}</p>
          </div>

          <div class="card-row text-xs !px-4 !py-3 flex gap-1.5 flex-col mt-2 mb-8">
            <h5>{{$t('FairnessInstruction.GameResult')}}</h5>
            <p class="my-0 text-xs opacity-70">{{$t('FairnessInstruction.GameResultContent')}}</p>
          </div>
        </PerfectScrollbar>
      </div>
      <div class="drawer-action">
        <button class='back-button' @click.prevent="closeSettingDialog">
          {{ $t('Close') }}
        </button>
      </div>
    </div>
  </div>


</template>

<style scoped>
.modal-container{
  &.active-container:after{
    content:'';
    position:absolute;
    top:0;
    left:50%;
    transform: translateX(-50%);
    width:200vw;
    height:200vh;
    background: #2c2c2c;
    backdrop-filter: blur(20px);
    z-index:-10;
    opacity: .89;
  }
  overflow:hidden;
  box-shadow: 1px 1px 1px 0 #747879 inset, -1px -1px 1px 0 #747879 inset, 0 15px 20px 0 #00000059,  0 0 15px 0 #00000026;
  border-radius: 6px;
  width: 376px;
  height: calc(100vh - 70px);
  top: calc(50% + 35px);
  //min-height: 676px;
  position: absolute;
  color: #fff;
  left:50%;
  transform: translate(-50%, -50%);
  transition: all .35s cubic-bezier(0,.86,.37,1);
  padding: 1.15rem 0;
  &.main-menu{
    height: 100vh;
    top: 50%;
    width:100%;
    .modal-content{
      padding: 0 1.4rem;
    }
  }
  @media(min-height:688px){
    top: calc(50% + 26px);
    height: 638px;
    &.main-menu{height: 688px;}
  }
}
button{
  padding: .5rem 0;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.main-menu .modal-content button{
  width: 250px;
  position:relative;
  text-align:center;
  display:block;
  background: #2D2D2D;
  border-radius: 90px;
  padding:18px;
  font-weight:bold;
  font-size: 16px;
  &:before{
    content:'';
    background: linear-gradient(100deg, #6DDCFF 0%, #7F60F9 100%);
    position:absolute;
    left:3px;
    top:3px;
    width:calc(100% - 6px);
    height:calc(100% - 6px);
    border-radius: 85px;
    padding:10px;
    z-index:0;
  }
  &:after{
    content:attr(data-text);
    background: #2D2D2D;
    position:absolute;
    width:calc(100% - 10px);
    height:calc(100% - 10px);
    top: 5px;
    left:5px;
    display:block;
    border-radius: 85px;
    padding:12px;
    z-index:0;
  }
}
.gradient-icon{
  width:30px;
  height:30px;
  border-radius: 50%;
  position:absolute;
  left: 15px;
  top: 15px;
  z-index:1;
  background: linear-gradient(98deg, #6DDCFF 0%, #7F60F9 100%);
  display:flex;
  justify-content: center;
  align-items: center;
}
.modal-header{
  font-weight: 700;
  font-size: 16px;
  text-align: center;
  position:relative;
  z-index:1;
  padding: 0 1.85rem;

  h1{
    border-bottom: 1px solid #726868;
    padding-bottom: .35rem;
  }
}
.modal-content{
  font-size:14px;
  position:relative;
  z-index:1;
  padding: 0  1.7rem;
}
form{
  font-size:14px;
}
.drawer-action{
  border-top: 1px solid #DBBFBF33;
  padding:.4rem .5rem 0;
}
.back-button{
  background: #2D2D2D;
  border: 1px solid #000000;
  box-shadow: 0 1px 1px 1px #6F898C59 inset, 0 0 3px 0 #00000059;
  border-radius: 15px;
  width:100%;
  text-align:center;
  display: block;
  font-weight: 700;
  font-size: 14px;
  padding: 0.35rem;
  transition: all .15s ease-out;
  &:active{
    transform: translateY(1px);
    box-shadow: 0 1px 0 0 #6F898C59, 0 0 1px 0 #00000059;
  }
}
.card-row{
  background: #2D2D2DB2;
  border: 1px solid #333737;
  border-radius: 10px;
  padding:.65rem 1.2rem;
  box-shadow: 0 0 2px 0 #91949462 inset;
}
.tiny-text{
  font-size:12px;
  line-height: 14px;
}

.placeholder {
  opacity: .45;
  position:relative;
  overflow:hidden;
}

@keyframes placeHolderShimmer{
  0%{
    background-position: -100% 0
  }
  100%{
    background-position: 100% 0
  }
}

.animated-background {
  animation-duration: 3s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-name: placeHolderShimmer;
  animation-timing-function: linear;
  background: darkgray;
  background: linear-gradient(to right, #eeeeee 10%, #dddddd 18%, #eeeeee 33%);
  background-size: 300%;
  width:100%;
  height:100%;
  position: absolute;
}
.bevel-button{
  padding: 5px 2rem;
  border-radius:10px;
  background: linear-gradient(to bottom, #6b6666 0%,#37383a 100%);
}
.input-bg{
  position:relative;
  background: #262323;
  box-shadow: 0 0 0 0 #00000000, 1px 1px 2px 0 #02161A59 inset;
  border-radius: 2px;
  padding:4px 6px 2px;
  input, textarea{
    background:transparent;
    color:#fff;
    width:100%;
    padding-right:18px;
    resize:none;
    overflow:hidden;
    &:focus{outline:none}
  }
  &.error{box-shadow:0 0 0 0 #00000000, 0 0 8px 0 #dd161A59 inset}

  &:after{
    content:'';
    width:35px;
    height:20px;
    position:absolute;
    right:17px;
    top:0;
    background: linear-gradient(to right, rgba(38,35,35,0) 0%,rgba(38,35,35,0.32) 35%,rgba(38,35,35,1) 100%);
    pointer-events:none;
  }
}
.blue-gradient-link{
  font-size: 12px;
  color:#7F60F9;
  background: linear-gradient(to right, #6DDCFF -50%, #7F60F9 180%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 2px 1rem;
  margin: .5rem auto;
  display:block;
  transition:all .25s ease-out;
  &:hover{
    background: linear-gradient(to right, #6DDCFF -20%, #7F60F9 210%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
.update-button{
  background: #5173AA;
  border:none;
  width: 135px;
  height:40px;
  text-align:center;
  margin:0 auto 1rem;
  justify-content: center;
  padding: .6rem 0;
  border-radius:25px;
  font-weight:700;
  &:disabled{
    pointer-events: none;
    opacity:.7;
  }
}
.success-message{
  position:fixed;
  top: 50%;
  left:50%;
  transform: translate(-50%, -80%);
  background: linear-gradient(to right, #6DDCFF -50%, #7F60F9 180%);
  padding: 1rem 2rem;
  opacity:0;
  border-radius:10px;
  pointer-events: none;
  transition: all .25s ease-out;
  &.active{
    transform: translate(-50%, -50%);
    opacity: .9
  }
}
.error-msg{font-weight:bold;font-size:12px}
:deep(.ps__rail-x){
  display:none
}
.text-gradient-blue{
  color:#7F60F9;
  background: linear-gradient(to right, #6DDCFF -50%, #7F60F9 180%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-bronze{
  color:#AA4017;
  background: linear-gradient(to right, #E36522 -50%, #AA4017 180%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-maroon{
  color:#8C0B6C;
  background: linear-gradient(to right, #EA2125 -50%, #8C0B6C 180%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-orange{
  color:#F76B1C;
  background: linear-gradient(to right, #FAD961 -50%, #F76B1C 180%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}


</style>
