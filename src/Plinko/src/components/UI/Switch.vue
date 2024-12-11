<template>
  <div>
    <input
      :id="uniqueId"
      class="mz-switch-rounded"
      type="checkbox"
      :checked="modelValue"
      @change="handleInput"
    >
    <label :for="uniqueId"></label>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 接收父層的 props
defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

// 動態生成唯一的 ID
const uniqueId = `mz-switch-${Math.random().toString(36).substr(2, 9)}`;

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    emit('update:modelValue', target.checked);
  }
};
</script>

<style scoped>
/* 隱藏原始 checkbox */
.mz-switch-rounded {
  display: none;
}

/* 自定義 label 外觀 */
.mz-switch-rounded + label {
  display: inline-block;
  width: 40px;
  height: 24px;
  background-color: #adb5bd;
  position: relative;
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.4s;
}

/* 自定義滑塊 */
.mz-switch-rounded + label::after {
  content: "";
  display: block;
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  position: absolute;
  bottom: 2px;
  left: 2px;
  border-radius: 50%;
  transition: transform 0.4s;
}

/* 勾選時的樣式 */
.mz-switch-rounded:checked + label {
  background-color: #22C55E;
}

.mz-switch-rounded:checked + label::after {
  transform: translateX(16px);
}
</style>
