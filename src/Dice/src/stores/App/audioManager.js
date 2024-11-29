import { ref } from 'vue';
import { defineStore } from 'pinia';
import { Howl } from 'howler';

export const useAudioStore = defineStore('audio', () => {
  const isLoading = ref({
    bet: ref(false),
    rolling: ref(false),
    tickdrag: ref(false),
    win: ref(false),
  });

  // 音效開關狀態
  const isMuted = ref(false);

  const sounds = {
    // 下注
    bet: new Howl({
      src: [new URL('@/assets/sounds/bet.mp3', import.meta.url).href],
      volume: 1,
    }),
    // 開結果
    rolling: new Howl({
      src: [new URL('@/assets/sounds/rolling.mp3', import.meta.url).href],
      volume: 1,
    }),
    // 拖拉bar
    tickdrag: new Howl({
      src: [new URL('@/assets/sounds/tickdrag.mp3', import.meta.url).href],
      volume: 1,
    }),
    // 結果:贏
    win: new Howl({
      src: [new URL('@/assets/sounds/win.mp3', import.meta.url).href],
      volume: 1,
    }),
  };

  // 播放音效
  const playSound = (soundName) => {
    if (isMuted.value) {
      console.log(`音效已關閉，無法播放 ${soundName}`);
      return;
    }

    if (sounds[soundName]) {
      isLoading.value[soundName] = true;
      sounds[soundName].play();
      sounds[soundName].on('end', () => {
        isLoading.value[soundName] = false;
      });
    } else {
      console.warn(`Sound ${soundName} not found.`);
    }
  };

  // 停止播放音效
  const stopSound = (soundName) => {
    if (sounds[soundName]) {
      sounds[soundName].stop();
      isLoading.value[soundName] = false;
    } else {
      console.warn(`Sound ${soundName} not found.`);
    }
  };

  // 調整音量
  const setVolume = (soundName, volume) => {
    if (sounds[soundName]) {
      sounds[soundName].volume(volume);
    } else {
      console.warn(`Sound ${soundName} not found.`);
    }
  };

  // 停止所有音效
  const stopAllSounds = () => {
    for (const soundName in sounds) {
      sounds[soundName].stop();
      isLoading.value[soundName] = false;
    }
  };

  // 切換音效開關
  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    console.log(`音效已${isMuted.value ? '關閉' : '開啟'}`);
  };

  return {
    sounds,
    isLoading,
    isMuted,
    playSound,
    stopSound,
    setVolume,
    stopAllSounds,
    toggleMute,
  };
});
