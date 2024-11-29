<script setup>
import HelloWorld from './components/HelloWorld.vue'
import DiceGame from './view/Dice.vue'
import Mydialog from '@/components/dialog/index.vue'
</script>

<template>
  <Mydialog ></Mydialog>
  <DiceGame>
    
  </DiceGame>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
