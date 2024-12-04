<template>
    <div class="slide-switcher">
      <button
        @click="!disabled && prev()"
        class="btn prev"
        :class="{ disabled: disabled }"
        :disabled="disabled"
      >
        ←
      </button>
      <div class="content">
        <Transition :name="transitionName" mode="out-in">
          <div :key="currentIndex" class="slide-item">
            <slot :current-item="currentItem">{{ currentItem.label }}</slot>
          </div>
        </Transition>
      </div>
      <button
        @click="!disabled && next()"
        class="btn next"
        :class="{ disabled: disabled }"
        :disabled="disabled"
      >
        →
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from "vue";
  
  const props = defineProps({
    items: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "horizontal",
      validator: (value) => ["horizontal", "vertical"].includes(value),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });
  
  const emit = defineEmits(["update:modelValue"]);
  
  // 找到初始索引
  const currentIndex = ref(
    props.items.findIndex((item) => item.value === props.modelValue)
  );
  
  // 監聽 modelValue，同步 currentIndex
  watch(
    () => props.modelValue,
    (newValue) => {
      const index = props.items.findIndex((item) => item.value === newValue);
      if (index !== -1) {
        currentIndex.value = index;
      }
    }
  );
  
  // 計算當前選中的項目
  const currentItem = computed(() => props.items[currentIndex.value]);
  
  const transitionName = computed(() =>
    props.type === "vertical" ? "slide-vertical" : "slide-horizontal"
  );
  
  const prev = () => {
    console.log(`output->props.items`,props.items)
    currentIndex.value =
      (currentIndex.value - 1 + props.items.length) % props.items.length;
    emit("update:modelValue", props.items[currentIndex.value].value);
  };
  
  const next = () => {
     console.log(`output->props.items`,props.items)
    currentIndex.value = (currentIndex.value + 1) % props.items.length;
    emit("update:modelValue", props.items[currentIndex.value].value);
  };
  </script>
  
  <style scoped>
  .slide-switcher {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .content {
    margin: 0 10px;
    font-size: 1.5em;
    overflow: hidden;
    width: auto;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .slide-item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    text-align: center;
  }
  
  .btn {
    cursor: pointer;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
  }
  .btn:active {
    background-color: #0056b3;
  }
  
  .btn.disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .slide-horizontal-enter-active,
  .slide-horizontal-leave-active {
    transition: transform 0.5s ease;
  }
  .slide-horizontal-enter-from {
    transform: translateX(100%);
  }
  .slide-horizontal-leave-to {
    transform: translateX(-100%);
  }
  
  .slide-vertical-enter-active,
  .slide-vertical-leave-active {
    transition: transform 0.5s ease;
  }
  .slide-vertical-enter-from {
    transform: translateY(100%);
  }
  .slide-vertical-leave-to {
    transform: translateY(-100%);
  }
  </style>
  