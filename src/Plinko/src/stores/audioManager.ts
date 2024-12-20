import {type Ref, ref} from 'vue';
import {defineStore} from 'pinia';
import { Howl, Howler } from 'howler';

export const useAudioStore = defineStore('audio', () => {

    const isMuted: Ref<boolean> = ref(false);

    const sounds = {
        bgm: new Howl({
            src: [new URL('/plinko.mp3', import.meta.url).href],
            volume: 0.4,
            autoplay: true
        }),

    };

    // 播放音效
    const playSound = (soundName:string): void => {
        if (!isAudioPlaying()) {
            //console.log(`音效已關閉，無法播放 ${soundName}`);
            return;
        }
        if (sounds[soundName]) {
            sounds[soundName].play();

        } else {
            console.warn(`Sound ${soundName} not found.`);
        }
    };

    // 停止播放音效
    const stopSound = (soundName:string):void => {
        if (sounds[soundName]) {
            sounds[soundName].stop();
        } else {
            console.warn(`Sound ${soundName} not found.`);
        }
    };


    const isAudioPlaying = ():boolean => {
        const sounds = Howler._howls;
        for (let i = 0; i < sounds.length; i++) {
            if (sounds[i].playing()) {
                isMuted.value = false
                return true;
            }
        }
        isMuted.value = true
        return false;
    }

    // 切換音效開關
    const toggleMute = () => {
        isMuted.value = !isMuted.value;
        Howler.mute(isMuted.value)
        // console.log(`音效已${isMuted.value ? '關閉' : '開啟'}`);
    };

    return {
        isAudioPlaying,
        sounds,
        isMuted,
        playSound,
        stopSound,
        toggleMute,
    };
});
