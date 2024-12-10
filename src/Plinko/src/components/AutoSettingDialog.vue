<template>
    <div class="modal-content mx-auto text-left pt-1 mt-4 pb-6 flex flex-col gap-5">

        test
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t: $t  } = useI18n()
</script>
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
