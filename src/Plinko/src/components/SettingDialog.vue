<script setup lang="ts">
import {ref, reactive, computed, watch, type Ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { vIntersectionObserver } from '@vueuse/components'
import Decimal from 'decimal.js';
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import type { BetHistoryResponseList, BetHistoryResponse } from '@/types/ResponseType';
import randomize from 'randomatic';
import { useForm, Field, ErrorMessage, useField } from 'vee-validate';
import * as yup from 'yup';

const { t: $t  } = useI18n()

const appStore = useAppStore()

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
const seedType = ref('')
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

  // Get components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Get timezone offset
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMinutes = String(absOffset % 60).padStart(2, '0');

  // Format string
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
}

const showHistoryListPlaceholder = ref(true)
const getBetHistory = async(index:number = 1) => {
  appStore.isLoading.getBetHistory = true
  if (index === 1){
    showHistoryListPlaceholder.value = true
  }
  const response = await appStore.getBetHistory({ PageIndex: index, PageSize: 4 })
  if (response.IsSuccess){
    appStore.isLoading.getBetHistory = false
    showHistoryListPlaceholder.value = false
    betHistoryResponseList.value = response
    betHistoryResult.value = [...betHistoryResult.value, ...response.Data.Items]
  }
  console.log(appStore.isLoading.getBetHistory)

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

const { values, errors, handleSubmit,  defineField } = useForm({
  validationSchema: yup.object({
  }),
  initialValues: {
  }
});

const generateRandom = () => randomize('?', 10, {chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%*+-=_.,:;'})
const returnCurrency = (img:string):string => {
  return `/${img.toLowerCase()}.svg`
}

const onSubmit = handleSubmit(async(values)=> {
  const { IsSuccess } = await appStore.updateSeed({ NewClientSeed: seedType.value, NewServiceSeed: updateSeedData.NewServerSeed})
  if (IsSuccess){
    alert('update success')
    getSeedInfo()
  }
})
const betRecordDetail = async(item:BetHistoryResponse) => {
  const { IsSuccess, Data } = await appStore.getBetRecordSeed({ Id: item.Id, Time: getCurrentDateTimeWithTimezone(item.Time)})
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

const backButtonControl = (): void => {
  if (appStore.settingDialog.section === 'fairness'){
    appStore.settingDialog.section = 'main'
  }
  if (appStore.settingDialog.section === 'fairness-history') {
    appStore.settingDialog.section = 'history'
  }
}

const returnPlaceholderWidth = (): number => (Math.floor(Math.random()* 50) ) + 45
</script>

<template>
  <div
       :class="[appStore.settingDialog.visible ? 'pointer-events-auto' : 'pointer-events-none']"
       @click.self="appStore.settingDialog.visible = false; appStore.settingDialog.section = ''"
       class="fixed flex flex-col items-center left-[50%] top-0 -translate-x-[50%] w-[376px] h-[100%] overflow-hidden z-20">
    <div
         :class="[appStore.settingDialog.section === 'main' ? '' : '!translate-x-[50%] !translate-y-[-50%]'] "
         class='modal-container main-menu pt-3 pb-8 z-50 text-red-800'>
      <div class='modal-content mx-auto text-left pt-2.5 flex flex-col gap-5' >
        <button @click.prevent="appStore.settingDialog.section='history'"><img src="@/assets/images/ico_history.svg" />{{$t('BetHistory')}}</button>
        <button><img src="@/assets/images/ico_limit.svg" />{{$t('BetLimit')}}</button>
        <button><img src="@/assets/images/ico_game_rules.svg" />{{$t('GameRule')}}</button>
        <button @click.prevent="appStore.settingDialog.section='fairness'"><img src="@/assets/images/ico_fairness.svg" />{{$t('Fairness')}}</button>
      </div>
    </div>

    <div
         :class="[ /history/g.test(appStore.settingDialog.section) ? '!translate-x-[-50%] !translate-y-[-50%] active-container' : '!translate-x-[-50%] !translate-y-[110%]']"
         class='modal-container z-50 text-red-800'>
      <div class="relative modal-header">
        <h1>{{$t('BetHistory')}} </h1>
      </div>
      <div class='modal-content mx-auto text-left relative h-[calc(100%-55px)] !pr-2'>
        <div class="h-[100%] overflow-y-auto pt-4 pr-[6px]">
        <div class="flex flex-col gap-3.5 pr-2"  ref="root">
          <template v-if="appStore.settingDialog.section==='history' &&  betHistoryResult.length > 0">
            <div v-for="(history, index) in betHistoryResult" :key="history.Id" class="cursor-pointer history-card relative" @click="betRecordDetail(history)">
              <div class="flex justify-center">
                <div class="w-1/4">
                  <div class="bg-gray-600 aspect-square w-full max-w-[60px] mx-auto rounded"></div>
                  <h4 class="leading-tight font-bold mt-0.5 text-center text-xs">Crocodile Plinko</h4>
                </div>

                <div class="w-3/4">
                  <div class="text-xs flex w-full mt-1">
                    <div class="flex-[2] flex mr-0.5 justify-end">{{ $t('BetAmount')}}  <img :src='returnCurrency(history.Currency)' class="ml-0.5 w-[14px]" /> </div>
                    <div class="flex-[3] text-right">{{ new Decimal(history.Amount).toFixed(8) }}</div>
                  </div>
                  <div class="text-xs flex w-full my-1.5">
                    <div class="flex-[2] flex mr-0.5 justify-end">{{ $t('Payout')}}  <img :src='returnCurrency(history.Currency)' class="ml-0.5 w-[14px]" /> </div>
                    <div class="flex-[3] text-right">{{ new Decimal(history.Payout).toFixed(8) }}</div>
                  </div>
                  <div class="text-xs flex w-full my-1.5">
                    <div class="flex-[2] flex mr-0.5 justify-end">{{ $t('Multiplier')}}  <img :src='returnCurrency(history.Currency)' class="ml-0.5 w-[14px] opacity-0" /> </div>
                    <div class="flex-[3] text-right text-[#FE862C] font-bold">{{ history.PayoutMultiplier }}x</div>
                  </div>
                  <div class="tiny-text text-right text-[#8D8B8A] scale-[.85] translate-x-4">
                      {{getCurrentDateTimeWithTimezone(history.Time)}}
                  </div>
                </div>
              </div>

              <div v-if='index === (betHistoryResult.length - 1)'
                   v-intersection-observer="onIntersectionObserver"
                   class="absolute text-center w-[200px] left-[60px] pointer-events-none">
                <div class="transition-all rounded-lg bg-black p-2"
                     v-if="lastPageNode"
                     :class="[isScrollBottom ? 'opacity-0.8':'opacity-0']"
                >{{$t('NoMoreResult')}}</div>
              </div>
            </div>
            <div class='absolute bottom-[30px] text-center w-full translate-x-[-28px] translate-y-[18px] pointer-events-none transition-all'
                 :class="[appStore.isLoading.getBetHistory ? 'opacity-1':'opacity-0']"
              >{{$t('LoadingMore')}}...</div>

          </template>

          <template v-if="appStore.settingDialog.section==='history' && appStore.isLoading.getBetHistory && showHistoryListPlaceholder">
            <div v-for="item in new Array(3).fill(null)"  class="history-card">
              <div class="flex justify-center">
                <div class="w-1/4">
                  <div class="bg-gray-600 aspect-square w-full max-w-[60px] mx-auto rounded placeholder"></div>
                  <h4 class="mt-0.5">
                    <div class="h-[12px] bg-slate-400 rounded my-[2px] mx-auto placeholder" :style="'width: '+returnPlaceholderWidth() +'%'">
                      <div class="animated-background"></div>
                    </div>
                    <div class="h-[12px] bg-slate-400 rounded mx-auto placeholder" :style="'width: '+returnPlaceholderWidth()+'%'">
                      <div class="animated-background"></div>
                    </div>
                  </h4>
                </div>

                <div class="w-3/4">
                  <div class="text-xs flex w-full mt-1">
                    <div class="flex-[2] flex mr-0.5 justify-end">
                      <div class="h-[14px] bg-slate-400 rounded mr-0 placeholder" :style="'width: '+returnPlaceholderWidth()+'%'">
                        <div class="animated-background"></div>
                      </div>
                    </div>
                    <div class="flex-[3] text-right ">
                      <div class="h-[14px] bg-slate-400 mr-0 ml-auto rounded placeholder" :style="'width: '+returnPlaceholderWidth()+'%'">
                        <div class="animated-background"></div>
                      </div>
                    </div>
                  </div>
                  <div class="text-xs flex w-full my-1.5">
                    <div class="flex-[2] flex mr-0.5 justify-end">
                      <div class="h-[14px] bg-slate-400 rounded mr-0 placeholder" :style="'width: '+returnPlaceholderWidth()+'%'">
                        <div class="animated-background"></div>
                      </div>
                    </div>
                    <div class="flex-[3] text-right">
                      <div class="h-[14px] bg-slate-400 mr-0 ml-auto rounded placeholder" :style="'width: '+returnPlaceholderWidth()+'%'">
                        <div class="animated-background"></div>
                      </div>
                    </div>
                  </div>
                  <div class="text-xs flex w-full my-1.5">
                    <div class="flex-[2] flex mr-0.5 justify-end">
                      <div class="h-[14px] bg-slate-400 rounded mr-0 placeholder" :style="'width: '+returnPlaceholderWidth()+'%'">
                        <div class="animated-background"></div>
                      </div>
                    </div>
                    <div class="flex-[3] text-right">
                      <div class="h-[14px] bg-slate-400 mr-0 ml-auto rounded placeholder" :style="'width: '+returnPlaceholderWidth()+'%'">
                        <div class="animated-background"></div>
                      </div>
                    </div>
                  </div>
                  <div class="tiny-text text-right text-[#8D8B8A] scale-[.85] translate-x-4">
                    <div class="h-[12px] bg-slate-400 mr-0 ml-auto rounded placeholder" :style="'width: '+returnPlaceholderWidth()+'%'">
                      <div class="animated-background"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </template>
        </div>
        </div>
      </div>
      <div class="drawer-action">
        <button class='back-button' @click.prevent="appStore.settingDialog.visible=false;appStore.settingDialog.section = ''">{{ $t('Close') }}</button>
      </div>
    </div>

    <div
      :class="[/fairness/g.test(appStore.settingDialog.section) ? '!translate-x-[-50%] !translate-y-[-50%] active-container' : '!translate-x-[100vw] !translate-y-[-50%]']"
      class='modal-container !z-[51] text-red-800'>
      <div class="relative modal-header">
        {{$t('Fairness')}}
        <p class="my-2 text-sm">{{$t('FairnessCaption')}}</p>
        <button class='absolute right-0 top-0 !pt-0' @click.prevent="backButtonControl">back</button>
      </div>
      <div class='modal-content mx-auto text-left h-[100%] overflow-hidden'>
        <h1 class="text-center">{{$t('CurrentSeed')}}</h1>
        <div class="mb-4">
          <div class="font-bold">{{$t('ClientSeed')}}</div>
          <input type="text" readonly :value="seedData.ClientSeed" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
          <div class="relative">
            <template v-if="isSupported ">
              <button @click="()=>{source = seedData.ClientSeed; copy(source)}" class="!p-0 absolute top-0 right-0" :disabled="source === ''">
                <span v-if="source === seedData.ClientSeed && source !==''">copied</span>
                <span v-else>copy</span>
              </button>
            </template>
          </div>
        </div>

        <div class="mb-4">
          <div class="font-bold">{{ $t('ServerSeedHashing') }}</div>
          <input type="text" readonly :value="seedData.ServerSeed" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
          <div class="relative">
            <template v-if="isSupported ">
              <button @click="()=>{ source= seedData.ServerSeed; copy(source)}" class="!p-0 absolute top-0 right-0">
                <span v-if="source === seedData.ServerSeed && source !==''">copied</span>
                <span v-else>copy</span>
              </button>
            </template>
          </div>
        </div>

        <div class="my-4">
          <div class="font-bold">{{ $t('Nonce') }}</div>
          <input type="text" readonly :value="seedData.Nonce" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
        </div>
        <h1 class="text-center mt-6 mb-2">{{$t('UpdateSeed')}}</h1>
        <form @submit.prevent='onSubmit' class='flex flex-col'>
          <div class="mb-6">
            <div class="font-bold">{{$t('NewClientSeed')}}</div>
            <input type="text"  :value="seedType" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
            <div class="relative">
              <template v-if="isSupported ">
                <button @click="()=>{ source = seedType; copy(source)}" class="!p-0 absolute top-0 right-0">
                  <span v-if="source === seedType && source !==''">copied</span>
                  <span v-else>copy</span>
                </button>
              </template>
              <button @click.prevent="seedType = generateRandom()" class="!p-0 absolute top-0 right-16">random</button>
            </div>
          </div>

          <div class="mb-6">
            <div class="font-bold">{{$t('ServerSeedHashing')}}</div>
            <input type="text" :value="updateSeedData.NewServerSeedHash" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
            <div class="relative">
              <template v-if="isSupported ">
                <button @click="()=>{ source = updateSeedData.NewServerSeedHash; copy(source)}" class="!p-0 absolute top-0 right-0">
                  <span v-if="source === updateSeedData.NewServerSeedHash && source !==''">copied</span>
                  <span v-else>copy</span>
                </button>
              </template>
              <button @click.prevent="getServerRefreshSeed()" class="!p-0 absolute top-0 right-16">get new server seed</button>
            </div>
          </div>

          <div class="w-full mt-2">
            <button @click.prevent="onSubmit" class="bg-white text-black mx-auto">Update</button>
          </div>
        </form>
      </div>
    </div>


    <div class="modal-container h-[640px]  pt-3 pb-8 transition-all z-50" :class="isShowBetDetail ? '!translate-x-[-50%] !translate-y-[-50%] active-container' : '!translate-x-[-50%] !translate-y-[60vh]'">
      <div class="relative modal-header">
        {{$t('BetDetail')}}
        <button class='absolute right-0 top-0 !pt-0' @click.prevent="isShowBetDetail = false; isShowGameFairness = false">back</button>
      </div>
      <div class='modal-content mx-auto text-left h-[100%] overflow-hidden' v-if="selectedBetDetail">
        <h1>Crocodile Plinko</h1>
        <div class="relative">
          {{selectedBetDetail.Id}}
          <template v-if="isSupported && selectedBetDetail.Id">
            <button @click="()=>{ source = selectedBetDetail?.Id || ''; copy(source)}" class="!p-0 absolute top-0 right-0 border-white border">
              <span v-if="source === selectedBetDetail.Id && source !==''">copied</span>
              <span v-else>copy</span>
            </button>
          </template>
        </div>
        <div class="relative">
          {{getCurrentDateTimeWithTimezone(selectedBetDetail.Time)}}
        </div>

        <div class="bg-slate-400 text-black p-1">
          amount: {{ new Decimal(selectedBetDetail.Amount ).toFixed(8) }} <br>
          payout: {{selectedBetDetail.Payout}} <br>
          multiplier: {{selectedBetDetail.PayoutMultiplier}} <br>
        </div>
        <div class="bg-slate-400 my-6 text-black p-1">
          row: {{selectedBetDetail.Rows}} <br>
          crocodile: {{selectedBetDetail.Risk}} <br>
          ball: {{selectedBetDetail.Ball}} <br>
        </div>

        <button class="text-center border-white border mx-auto" @click.prevent="isShowGameFairness = !isShowGameFairness">{{$t('GameFairness')}}</button>
        <div v-if="isShowGameFairness">
          <div class="mb-4">
            <div class="font-bold">{{ $t('ServerSeed') }}</div>
            <input type="text" readonly :value="betDetailSeedData.ServerSeed !== '' ? betDetailSeedData.ServerSeed : ''" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
            <div class="relative" v-if="betDetailSeedData.ServerSeed !== ''">
              <template v-if="isSupported ">
                <button @click="()=>{ source= betDetailSeedData.ServerSeed; copy(source)}" class="!p-0 absolute top-0 right-0">
                  <span v-if="source === betDetailSeedData.ServerSeed && source !==''">copied</span>
                  <span v-else>copy</span>
                </button>
              </template>
            </div>
          </div>
          <div class="mb-4">
            <div class="font-bold">{{ $t('ServerSeedHashing') }}</div>
            <input type="text" readonly :value="betDetailSeedData.ServerSeedHash" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
            <div class="relative">
              <template v-if="isSupported ">
                <button @click="()=>{ source= betDetailSeedData.ServerSeedHash; copy(source)}" class="!p-0 absolute top-0 right-0">
                  <span v-if="source === betDetailSeedData.ServerSeedHash && source !==''">copied</span>
                  <span v-else>copy</span>
                </button>
              </template>
            </div>
          </div>

          <div class="mb-4">
            <div class="font-bold">{{$t('ClientSeed')}}</div>
            <input type="text" readonly :value="betDetailSeedData.ClientSeed" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
            <div class="relative">
              <template v-if="isSupported ">
                <button @click="()=>{source = betDetailSeedData.ClientSeed; copy(source)}" class="!p-0 absolute top-0 right-0" :disabled="source === ''">
                  <span v-if="source === betDetailSeedData.ClientSeed && source !==''">copied</span>
                  <span v-else>copy</span>
                </button>
              </template>
            </div>
          </div>

          <div class="my-4">
            <div class="font-bold">{{ $t('RandomNumber') }}</div>
            <input type="text" readonly :value="betDetailSeedData.Nonce" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
            <div class="relative">
              <template v-if="isSupported ">
                <button @click="()=>{source = betDetailSeedData.Nonce; copy(source)}" class="!p-0 absolute top-0 right-0" :disabled="source === ''">
                  <span v-if="source === betDetailSeedData.Nonce && source !==''">copied</span>
                  <span v-else>copy</span>
                </button>
              </template>
            </div>
          </div>
          <div class="drawer-action">
            <button @click.prevent="appStore.settingDialog.section = 'fairness-history'">{{$t('WhatIsFairness')}}</button>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>

<style scoped>
.modal-container{
  &.active-container:after{
    content:'';
    position:absolute;
    top:-50vh;
    left:-50vw;
    width:200vw;
    height:200vh;
    background: #262626;
    backdrop-filter: blur(10px);
    z-index:-10;
    opacity: .85;
  }
  overflow:hidden;
  box-shadow: 1px 1px 1px 0 #747879 inset, -1px -1px 1px 0 #747879 inset, 0 15px 20px 0 #00000059,  0 0 15px 0 #00000026;
  border-radius: 6px;
  width: 376px;
  height: calc(710px - 160px);
  top: 382px;
  min-height: 658px;
  position: absolute;
  color: #fff;
  left:50%;

  transform: translate(-50%, -50%);
  transition: all .35s cubic-bezier(0,.86,.37,1);
  padding: 1.25rem 0;
  &.main-menu{
    background: #2d2d2d;
    height: 252px!important;
    min-height: 252px;
    top: 180px!important;
    left:calc(50% + 98px);
    width:184px;
    .modal-content{
      padding: 0 1.4rem;
    }
  }
  @media(min-height:710px){
    top: calc(50% + 28px);
    &.main-menu{
      top: calc(50% - 172px)!important;
    }
  }
}
button{
  padding: .5rem 0;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.modal-header{
  font-weight: 700;
  font-size: 16px;
  text-align: center;
  position:relative;
  z-index:1;
  padding: 0 1.85rem;

  h1{
    border-bottom: 1px solid #CCBFBF;
    padding-bottom: .25rem;
  }
}
.modal-content{
  font-size:14px;
  position:relative;
  z-index:1;
  padding: 0  1.85rem;
}
form{
  font-size:14px;
}
.drawer-action{
  border-top: 1px solid #DBBFBF33;
  padding:.4rem 0 0;
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
.history-card{
  background: #2D2D2DB2;
  border: 1px solid #333737;
  border-radius: 6px;
  padding:.85rem 1.2rem;
  box-shadow: 0 0 2px 0 #91949462 inset;
}
.tiny-text{
  font-size:12px;
  line-height: 14px;
}

.placeholder {
  opacity: .5;
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
</style>
