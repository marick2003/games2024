<template>
    <div class="slide-switcher">
      <button
        @click="!disabled && prev()"
        class="btn prev"
        :class="[
          disabled ? 'disabled' : '',
          props.type,
        ]"
        :disabled="disabled"
      >
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
        :class="[
          disabled ? 'disabled' : '',
          props.type,
        ]"
        :disabled="disabled"
      >
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
  
  <style scoped lang="scss">
  .slide-switcher {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .content {
    overflow: hidden;
    width: auto;
    padding: 7px 0;
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

    &.vertical{
      width: 30px;
      height: 30px;
      padding: 13px 0px 0px 0px;
      border-radius: 20px;
      &.prev{
        background: url(../../assets/images/svg/arrowBtn.svg);
        &:active{
          background: url(../../assets/images/svg/arrowBtn_pass.svg);     
        }
        &.disabled{
          background: url(../../assets/images/svg/arrowBtn_disabled.svg);
          cursor: not-allowed; 
        }
      }
      
      &.next{
        background: url(../../assets/images/svg/arrowBtn_down.svg);
        &:active{
          background: url(../../assets/images/svg/arrowBtn_down_pass.svg);     
        }
        &.disabled{
          background: url(../../assets/images/svg/arrowBtn_down_disabled.svg);
          cursor: not-allowed; 
        }
      }
    }
    &.horizontal{
      width: 12px;
      height: 7px;
      background: url(../../assets/images/svg/arrow.svg) no-repeat;
      background-size: cover;
      &.prev{
        transform: rotate(270deg);
      }
      &.next{
        transform: rotate(90deg);
      }
    }
    
  }
  
  .slide-horizontal-enter-active,
  .slide-horizontal-leave-active {
    transition: transform 0.3s ease;
  }
  .slide-horizontal-enter-from {
    transform: translateX(100%);
  }
  .slide-horizontal-leave-to {
    transform: translateX(-100%);
  }
  
  .slide-vertical-enter-active,
  .slide-vertical-leave-active {
    transition: transform 0.3s ease;
  }
  .slide-vertical-enter-from {
    transform: translateY(100%);
  }
  .slide-vertical-leave-to {
    transform: translateY(-100%);
  }
  </style>
  