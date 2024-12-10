<script setup lang="ts">
import {ref, computed, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t: $t  } = useI18n()
import { useAppStore } from '@/stores/app'
import type {BetHistoryResponseList, BetHistoryResponse} from '@/types/ResponseType';
const appStore = useAppStore()
import { vIntersectionObserver } from '@vueuse/components'
const root = ref(null)
const isVisible = ref(false)

const betHistoryResponseList: Ref<BetHistoryResponseList|{}> = ref({})
const betHistoryResult: Ref<BetHistoryResponse[]> = ref([])

const pageIndex:Ref<number> = ref(1)
function onIntersectionObserver([{ isIntersecting }]) {
  if (isIntersecting){
    console.log((betHistoryResponseList ))
    if (betHistoryResponseList.value.Data.PageCount > betHistoryResponseList.value.Data.PageIndex){
      pageIndex.value= pageIndex.value + 1
      getBetHistory(pageIndex.value)
    }
  }
}

const getBetHistory = async(index:number = 1) => {
  const response = await appStore.getBetHistory({ PageIndex: index, PageSize: 2 })
  if (response.IsSuccess){
    betHistoryResponseList.value = response
    betHistoryResult.value = [...betHistoryResult.value, ...response.Data.Items]
    console.log(betHistoryResult.value)
  }
}


watch(()=> appStore.settingDialog.section,(val)=>{

  if (val === 'history'){
    pageIndex.value = 1
    getBetHistory(1)
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
        <button><img src="@/assets/images/ico_fairness.svg" />{{$t('Fairness')}}</button>
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
            <div v-if='index === (betHistoryResult.length - 1)' v-intersection-observer="onIntersectionObserver">last and fetch</div>

          </div>
        </template>
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
</style>
