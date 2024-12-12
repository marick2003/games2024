<template>
    <div class="percentage-control">
      <button 
        @click="decrease" 
        class="control-button decrease" 
        :disabled="disabled"
      >
        -
      </button>
      <div class="display text-xs">{{ modelValue }} %</div>
      <button 
        @click="increase" 
        class="control-button increase" 
        :disabled="disabled"
      >
        +
      </button>
    </div>
  </template>
  
  <script>
  import { ref, watch } from 'vue';
  
  export default {
    props: {
      modelValue: {
        type: Number,
        required: true,
      },
      disabled: {
        type: Boolean,
        default: false, // 默認不禁用
      },
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
      const percentage = ref(props.modelValue);
  
      const increase = () => {
        if (!props.disabled && percentage.value < 100) {
          percentage.value += 1;
          emit("update:modelValue", percentage.value);
        }
      };
  
      const decrease = () => {
        if (!props.disabled && percentage.value > -100) {
          percentage.value -= 1;
          emit("update:modelValue", percentage.value);
        }
      };
  
      watch(() => props.modelValue, (newValue) => {
        percentage.value = newValue;
      });
  
      return {
        percentage,
        increase,
        decrease,
      };
    },
  };
  </script>
  
  <style scoped lang='scss'>
  .percentage-control {
    display: flex;
    align-items: center;
    background-color: #3c3f41;
    border-radius: 15px;
    padding: 0px;
    width: 150px;
    justify-content: space-between;
  }
  
  .control-button {
    background-color: #252729;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    font-size: 18px;
    cursor: pointer;
    &.decrease{
        border-radius: 15px 0px 0px 15px;
    }
    &.increase{
        border-radius: 0px 15px 15px 0px;
    }
  }
  
  .control-button:hover {
    background-color: #44484a;
  }
  
  .control-button:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
  
  .display {
    color: white;
    text-align: center;
    width: 50px;
    
  }
  </style>
  