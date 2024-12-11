<script setup lang="ts">
import {ref, reactive, computed, watch, type Ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
const { t: $t  } = useI18n()
import { useAppStore } from '@/stores/app'
import type {BetHistoryResponseList, BetHistoryResponse} from '@/types/ResponseType';
const appStore = useAppStore()
import { vIntersectionObserver } from '@vueuse/components'
import randomize from 'randomatic';
import { useForm, Field, ErrorMessage, useField } from 'vee-validate';
import * as yup from 'yup';
const root = ref(null)
const isVisible = ref(false)
const seedData = reactive({
  ServerSeed: '',
  ServerSeedHash: '',
  ClientSeed: '',
  Nonce: ''
})

const updateSeedData = reactive({
  NewServerSeed: '',
  NewServerSeedHash: ''
})
const seedType = ref('')
const betHistoryResponseList: Ref<BetHistoryResponseList|{}> = ref({})
const betHistoryResult: Ref<BetHistoryResponse[]> = ref([])
const pageIndex:Ref<number> = ref(1)
const source = ref('')
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
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  // Get timezone offset
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMinutes = String(absOffset % 60).padStart(2, '0');

  // Format string
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}:${offsetMinutes}`;
}
const getBetHistory = async(index:number = 1) => {
  const response = await appStore.getBetHistory({ PageIndex: index, PageSize: 2 })
  if (response.IsSuccess){
    betHistoryResponseList.value = response
    betHistoryResult.value = [...betHistoryResult.value, ...response.Data.Items]
  }
}

const getBetRecordSeed = async() => {
  const { IsSuccess, Data } = await appStore.getBetRecordSeed({ Id: '55dbfd13ed254ab3a6e316aa121068b3', Time: '2024-12-10T18:09:53'})
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
  console.log(values)
  const { IsSuccess } = await appStore.updateSeed({ NewClientSeed: seedType.value, NewServiceSeed: updateSeedData.NewServerSeed})
  if (IsSuccess){
    alert('success')
  }


})

watch(()=> appStore.settingDialog.section,(val)=>{
  betHistoryResult.value = []
  betHistoryResponseList.value = {}
  if (val === 'history'){
    pageIndex.value = 1
    getBetHistory(1)
  }
  if (val === 'fairness'){
    getBetRecordSeed()
    seedType.value = generateRandom()
    getServerRefreshSeed()
  }
})
</script>

<template>
  <div v-show='appStore.settingDialog.visible' @click="appStore.settingDialog.visible = false" class='modal-backdrop fixed w-full h-full left-0 right-0 top-0 bottom-0 z-10'></div>
  <div v-show='appStore.settingDialog.visible' class="fixed flex flex-col items-center left-[50%] top-0 -translate-x-[50%] w-[368px] h-[100%] overflow-hidden z-20">
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
         :class="[appStore.settingDialog.section === 'history' ? '!translate-x-[-50%] !translate-y-[-50%]' : '!translate-x-[100vw] !translate-y-[-50%]']"
         class='modal-container pt-3 pb-8 z-50 text-red-800 h-[600px]'>
      <div class="relative modal-header px-3">
        {{$t('BetHistory')}}
        <button class='absolute right-0 top-0 !pt-0' @click.prevent="appStore.settingDialog.section='main'">back</button>
      </div>
      <div class='modal-content mx-auto text-left pt-1 mt-4 pb-6 h-[100%] overflow-hidden'>
        <div class="flex flex-col gap-5 h-[530px] overflow-y-auto"  ref="root">
          <template v-if="appStore.settingDialog.section==='history' &&  betHistoryResult.length > 0">
            <div v-for="(history, index) in betHistoryResult" :key="history.Id">
              <h1>{{index}}</h1>
              Name Crocodile Plinko <br>
              ID: {{history.Id}}<br>
              amount: {{history.Amount}} {{history.Currency}}<br>
              PayoutMultiplier: {{history.PayoutMultiplier}}<br>
              Payout: {{history.Payout}}<br>
              DateTime: {{history.Time}}
              <div v-if='appStore.isLoading.getBetHistory'>loading</div>
              <div v-if='index === (betHistoryResult.length - 1)' v-intersection-observer="onIntersectionObserver">last and fetch</div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div
      :class="[appStore.settingDialog.section === 'fairness' ? '!translate-x-[-50%] !translate-y-[-50%]' : '!translate-x-[100vw] !translate-y-[-50%]']"
      class='modal-container pt-3 pb-8 z-50 text-red-800 h-[600px]'>
      <div class="relative modal-header px-3">
        {{$t('Fairness')}}
        <p class="my-2 text-sm">{{$t('FairnessCaption')}}</p>
        <button class='absolute right-0 top-0 !pt-0' @click.prevent="appStore.settingDialog.section='main'">back</button>
      </div>
      <div class='modal-content mx-auto text-left pt-1 px-4 mt-2 pb-6 h-[100%] overflow-hidden'>
        <h1 class="text-center">{{$t('CurrentSeed')}}</h1>
        <div class="mb-4">
          <div class="font-bold">{{$t('ClientSeed')}}</div>
          <input type="text" readonly :value="seedData.ClientSeed" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
          <div class="relative">
            <template v-if="isSupported ">
              <button @click="()=>{source=seedData.ClientSeed; copy(source)}" class="!p-0 absolute top-0 right-0" :disabled="source === ''">
                      <span v-if="source===seedData.ClientSeed && source !==''">
                        copied
                      </span>
                <span v-else>
                        copy
                      </span>
              </button>
            </template>
          </div>
        </div>

        <div class="mb-4">
          <div class="font-bold">{{ $t('ServerSeedHashing') }}</div>
          <input type="text" readonly :value="seedData.ServerSeedHash" class="px-2 py-1 border bg-[transparent] text-white border-white w-full" />
          <div class="relative">
            <template v-if="isSupported ">
              <button @click="()=>{source=seedData.ServerSeedHash; copy(source)}" class="!p-0 absolute top-0 right-0">
                      <span v-if="source===seedData.ServerSeedHash && source !==''">
                        copied
                      </span>
                <span v-else>
                        copy
                      </span>
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
                <button @click="()=>{source=seedType; copy(source)}" class="!p-0 absolute top-0 right-0">
                      <span v-if="source===seedType && source !==''">
                        copied
                      </span>
                  <span v-else>
                        copy
                      </span>
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
                <button @click="()=>{source=updateSeedData.NewServerSeedHash; copy(source)}" class="!p-0 absolute top-0 right-0">
                      <span v-if="source===updateSeedData.NewServerSeedHash && source !==''">
                        copied
                      </span>
                  <span v-else>
                        copy
                      </span>
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
  transition: all .3s cubic-bezier(0,.53,.42,.99);
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
