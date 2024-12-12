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
function onIntersectionObserver([{ isIntersecting }]) {
  if (isIntersecting){
    if (betHistoryResponseList.value.Data.PageCount > betHistoryResponseList.value.Data.PageIndex){
      pageIndex.value= pageIndex.value + 1
      getBetHistory(pageIndex.value)
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
const getBetHistory = async(index:number = 1) => {
  const response = await appStore.getBetHistory({ PageIndex: index, PageSize: 2 })
  if (response.IsSuccess){
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

const { values, errors, handleSubmit,  defineField } = useForm({
  validationSchema: yup.object({
  }),
  initialValues: {
  }
});

const generateRandom = () => randomize('?', 10, {chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%*+-=_.,:;'})

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
</script>

<template>
  <div v-show='appStore.settingDialog.visible'  class='modal-backdrop fixed w-full h-full left-0 right-0 top-0 bottom-0 z-20'></div>
  <div v-show='appStore.settingDialog.visible' @click.self="appStore.settingDialog.visible = false; appStore.settingDialog.section = 'main'" class="fixed flex flex-col items-center left-[50%] top-0 -translate-x-[50%] w-[368px] h-[100%] overflow-hidden z-20">
    <div
         :class="[appStore.settingDialog.section === 'main' ? '!translate-x-[-50%] !translate-y-[-50%]' : '!translate-x-[-100vw] !translate-y-[-50%]']"
         class='modal-container pt-3 pb-8 z-50 text-red-800 h-[350px]'>
      <div class='modal-content mx-auto text-left pt-1 mt-4 pb-6 flex flex-col gap-5' >
        <button><img src="@/assets/images/ico_sound.svg" />{{$t('Sound')}}</button>
        <button><img src="@/assets/images/ico_limit.svg" />{{$t('BetLimit')}}</button>
        <button><img src="@/assets/images/ico_game_rules.svg" />{{$t('GameRule')}}</button>
        <button @click.prevent="appStore.settingDialog.section='history'"><img src="@/assets/images/ico_history.svg" />{{$t('BetHistory')}}</button>
        <button @click.prevent="appStore.settingDialog.section='fairness'"><img src="@/assets/images/ico_fairness.svg" />{{$t('Fairness')}}</button>
      </div>
    </div>

    <div
         :class="[ /history/g.test(appStore.settingDialog.section) ? '!translate-x-[-50%] !translate-y-[-50%]' : '!translate-x-[100vw] !translate-y-[-50%]']"
         class='modal-container pt-3 pb-8 z-50 text-red-800 h-[600px]'>
      <div class="relative modal-header px-3">
        {{$t('BetHistory')}}
        <button class='absolute right-0 top-0 !pt-0' @click.prevent="appStore.settingDialog.section = 'main'">back</button>
      </div>
      <div class='modal-content mx-auto text-left pt-1 mt-4 pb-6 h-[100%] overflow-hidden'>
        <div class="flex flex-col gap-5 h-[530px] overflow-y-auto"  ref="root">
          <template v-if="appStore.settingDialog.section==='history' &&  betHistoryResult.length > 0">
            <div v-for="(history, index) in betHistoryResult" :key="history.Id" class="cursor-pointer" @click="betRecordDetail(history)">
              <h1>{{index}}</h1>
              Name Crocodile Plinko <br>
              ID: {{history.Id}}<br>
              amount: {{ new Decimal(history.Amount).toFixed(8) }} {{ history.Currency }}<br>
              PayoutMultiplier: {{history.PayoutMultiplier}}<br>
              Payout: {{history.Payout}}<br>
              DateTime: {{getCurrentDateTimeWithTimezone(history.Time)}}
              <div v-if='appStore.isLoading.getBetHistory'>loading</div>
              <div v-if='index === (betHistoryResult.length - 1)' v-intersection-observer="onIntersectionObserver">last and fetch</div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div
      :class="[/fairness/g.test(appStore.settingDialog.section) ? '!translate-x-[-50%] !translate-y-[-50%]' : '!translate-x-[100vw] !translate-y-[-50%]']"
      class='modal-container pt-3 pb-8 !z-[51] text-red-800 h-[600px]'>
      <div class="relative modal-header px-3">
        {{$t('Fairness')}}
        <p class="my-2 text-sm">{{$t('FairnessCaption')}}</p>
        <button class='absolute right-0 top-0 !pt-0' @click.prevent="backButtonControl">back</button>
      </div>
      <div class='modal-content mx-auto text-left pt-1 px-4 mt-2 pb-6 h-[100%] overflow-hidden'>
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


    <div class="modal-container h-[640px]  pt-3 pb-8 transition-all z-50" :class="isShowBetDetail ? '!translate-x-[-50%] !translate-y-[-50%]' : '!translate-x-[-50%] !translate-y-[60vh]'">
      <div class="relative modal-header px-3">
        {{$t('BetDetail')}}
        <button class='absolute right-0 top-0 !pt-0' @click.prevent="isShowBetDetail = false; isShowGameFairness = false">back</button>
      </div>
      <div class='modal-content mx-auto text-left pt-1 px-4 mt-2 pb-6 h-[100%] overflow-hidden' v-if="selectedBetDetail">
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

          <button @click.prevent="appStore.settingDialog.section = 'fairness-history'">{{$t('WhatIsFairness')}}</button>
        </div>
      </div>
    </div>
  </div>


</template>

<style scoped>
.modal-container{
  background: #262626;
  border-radius: 6px;
  width: 340px;
  position: absolute;
  color: #fff;
  left:50%;
  top:50%;
  transform: translate(-50%, -50%);
  transition: all .3s cubic-bezier(0,.4,.55,1);
}
button{
  padding: .5rem 2rem;
  text-align: left;
  display: flex;
  align-items: center;
  gap:1rem;
}
.modal-header{
  border-bottom: 1px solid #fff;
  padding-bottom:10px;
}
.modal-content{
  font-size:14px;
}
form{
  font-size:14px;
}
</style>
