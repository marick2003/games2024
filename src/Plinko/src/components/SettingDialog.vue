<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t: $t  } = useI18n()
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()


</script>

<template>
  <div v-show='appStore.settingDialog.visible' @click="appStore.settingDialog.visible = false" class='modal-backdrop fixed w-full h-full left-0 right-0 top-0 bottom-0 z-20'></div>

  <div v-show='appStore.settingDialog.visible' class='modal-container pt-3 pb-8 z-50 text-red-800'>
    <div class='modal-content mx-auto text-left pt-1 mt-4 pb-6 flex flex-col gap-5' >
      <button><img src="@/assets/images/ico_sound.svg" />{{$t('Sound')}}</button>
      <button>{{$t('BetLimit')}}</button>
      <button>{{$t('GameRule')}}</button>
      <button>{{$t('Fairness')}}</button>
    </div>
  </div>
</template>

<style scoped>
.modal-container{
  background: #262626;
  border-radius: 6px;
  width: 340px;
  height: 290px;
  max-height:580px;
  margin:0 auto;
  position: absolute;
  color: #fff;
  top: 40%;
  left:50%;
  transform: translate(-50%, -50%);
}
button{
  padding: .5rem 2rem;
  text-align: left;
}
</style>
