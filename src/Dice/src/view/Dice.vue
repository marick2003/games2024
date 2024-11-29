<template>
    <div class="game-frame">
        <div class="dice-game bg-gray-800 text-white p-6 rounded-lg mx-auto">
            <div class="controls ">
                <div class="tabs-wrapper">
                    <div class="slider">
                        <div class="content-wrapper">
                            <button
                                @click="betType = 0"
                                :class="betType === 0 ? 'bg-blue-500 text-white' : 'bg-gray-400 text-black'"
                                class="rounded-full px-4 py-2 mx-2"
                            >
                                手动投注
                            </button>
                            <button disabled
                                @click="betType = 1"
                                :class="betType === 1 ? 'bg-blue-500 text-white' : 'bg-gray-400 text-black'"
                                class="rounded-full px-4 py-2  mx-2"
                            >
                                自动投注
                            </button>
                        </div>
                    </div>
                </div>
                <label class="mr-2">投注金額</label>
                <div class="flex items-center mb-2">
                    <input
                        v-model="betAmount"
                        type="number"
                        placeholder="0.00000000"
                        class=" p-2 bg-gray-700 rounded-lg text-white border border-gray-600"
                        
                    />
                    <button @click="doubleBet" class="mx-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg">
                        2x
                    </button>
                    <button @click="halveBet" class="mx-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg">
                        ½
                    </button>
                </div>
                <!--判斷手動投注/自動投注 -->
                <template v-if="!betType">

                    <label>獲勝利潤</label>
                     <div class="mb-2 flex flex-col">
                        <input
                            :value="potentialProfit"
                            readonly
                            class="w-auto p-2 my-2 bg-gray-700 rounded-lg text-white border border-gray-600"
                        />
                        <button class="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg" @click="placeBet">
                            投注
                        </button>
                    </div>
                </template>
                <template v-else>
                    <label>投注次數</label>
                    <input class="w-auto p-2 my-2 bg-gray-700 rounded-lg text-white border border-gray-600" />
                    <label>若贏</label>
                    <input class="w-auto p-2 my-2 bg-gray-700 rounded-lg text-white border border-gray-600" />
                    <label>若輸</label>
                    <input class="w-auto p-2 my-2 bg-gray-700 rounded-lg text-white border border-gray-600" />
                    <label>止盈</label>
                    <input class="w-auto p-2 my-2 bg-gray-700 rounded-lg text-white border border-gray-600" />
                    <label>止損</label>
                    <input class="w-auto p-2 my-2 bg-gray-700 rounded-lg text-white border border-gray-600" />
                </template>
            </div>
            <div class="game-controls">
                <div class="game-content">
                    <div class="past-bets">
                        <button
                            v-for="(bet, index) in historyBet"
                            :key="bet.diceResult + index"
                            class="button-tag mx-2 p-1"
                            :class="bet.targetValue < bet.diceResult ? 'variant-success' : ''"
                        >
                            {{ bet.diceResult }}
                        </button>
                    </div>
                    <div class="slider my-6">
                        <div class="w-full relative">
                            <div class="point-wrap">
                                <div class="point left-0">0</div>
                                <div class="point left-1/4">25</div>
                                <div class="point left-1/2">50</div>
                                <div class="point left-3/4">75</div>
                                <div class="point left-full">100</div>
                            </div>
                            <div class="content">
                                <div class="translate-x" ref="diceSlide">
                                    <div class="hide-show is-hidden">
                                        <img class="dice" src="../assets/svg/classic-dice.svg" alt="" />
                                        <div class="dice-result">
                                            {{ diceResult }}
                                        </div>
                                    </div>
                                </div>
                                <div class=" rounded-full border-[14px] border-gray-600 px-2">

                                <div class="range  ">
                                    <!-- <div class="lower bg-green-500 h-2 w-full absolute top-0 right-0 "></div>
                                    <div class="highter bg-red-500 h-2 absolute  top-0 left-0 " :style="{ width: `${sliderValue}%` }"></div> -->
                               
                                    <el-slider
                    v-model="sliderValue"
                    :min="0"
                    :max="100"
                    @input="()=>{audioStore.playSound('tickdrag')}"
                />
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="parameters">
                    <div class="">
                        <label>乘數</label>
                        <input
                            :value="multiplier"
                            readonly
                            class="w-full p-2 bg-gray-700 rounded-lg text-white border border-gray-600"
                        />
                    </div>
                    <div class="">
                        <label>擲大於</label>
                        <input
                            :value="targetValue"
                            readonly
                            class="w-full p-2 bg-gray-700 rounded-lg text-white border border-gray-600"
                        />
                    </div>
                    <div>
                        <label>獲勝機率</label>
                        <input
                            :value="winProbability"
                            readonly
                            class="w-full p-2 bg-gray-700 rounded-lg text-white border border-gray-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useAudioStore } from '@/stores/App/audioManager';
// 響應式變數
const betAmount = ref(0);
const sliderValue = ref(50); // 初始滑動條位置
const multiplier = ref(1.0102);
const targetValue = ref(36); // 撥大於
const winProbability = ref(64); // 獲勝機率
const diceSlide = ref(null);
const diceResult = ref(0);
const historyBet = ref([]);
const betType=ref(0); //0 是手動下注  1是自動下注
const audioStore = useAudioStore();  // 音效控制
const isPlayBetRound = ref(false)
// 動態計算
const calculateValues = () => {
    const position = sliderValue.value;
    // 計算撥大於 (2 ~ 98)
    targetValue.value = Math.round(2 + (position / 100) * (98 - 2));
    // 計算獲勝機率
    winProbability.value = 100 - targetValue.value;
    // 計算乘數 (1.0102 ~ 49.5000)
    multiplier.value = parseFloat((1.0102 + (position / 100) * (49.5 - 1.0102)).toFixed(4));
};

// 監聽滑動條變化
watch(sliderValue, calculateValues);

// 初始化計算
calculateValues();

// 計算潛在利潤
const potentialProfit = computed(() => {
    return parseFloat((betAmount.value * multiplier.value - betAmount.value).toFixed(8));
});

// 方法
const doubleBet = () => {
    betAmount.value *= 2;
};

const halveBet = () => {
    betAmount.value /= 2;
};

const placeBet = () => {
    if(isPlayBetRound.value){
        return false;
    }
    isPlayBetRound.value=true;
    // 隨機生成水平移動的百分比（0~100%）
    diceResult.value = Math.round(Math.random() * 100).toFixed(2);
    // 獲取 diceSlide 元素
    const diceSlideElement = diceSlide.value;
    const hideShowElement = diceSlideElement.querySelector(".hide-show"); // 子層元素
    if (diceSlideElement && hideShowElement) {
        // 確保從 0% 開始
        // 短暫延遲，讓動畫從 0% 開始執行
        setTimeout(() => {
            // 設置隨機水平移動
            diceSlideElement.style.transform = `translateX(${diceResult.value}%)`;
        }, 50); // 小延遲以觸發動畫
        audioStore.playSound('rolling')
        hideShowElement.classList.add("fade-in-scale-down"); // 移除動畫 class
        hideShowElement.classList.remove("is-hidden");
        // 延遲 3 秒後加回 is-hidden class
        setTimeout(() => {
            hideShowElement.classList.add("is-hidden"); // 最後隱藏元素
            setTimeout(() => {
                hideShowElement.classList.remove("fade-in-scale-down"); // 移除動畫 class
                diceSlideElement.style.transform = `translateX(0%)`; // 重置位置
                isPlayBetRound.value=false;
            }, 1000); 
        }, 3000);
        // 新增投注記錄
        historyBet.value.unshift({ targetValue: sliderValue.value, diceResult: diceResult.value ,state: diceResult.value >= sliderValue.value ? 0 : 1  });
        // 結果
        if( diceResult.value >= sliderValue.value){
            audioStore.playSound('win')
        }

        // 如果超過 5 筆，移除最後一筆
        if (historyBet.value.length > 5) {
            historyBet.value.pop();
        }
    }
};
</script>

<style scoped lang="scss">
.game-frame {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}
.dice-game {
    font-family: Arial, sans-serif;
    color: #fff;
    background-color: #1e1e2e;
    padding: 20px;
    border-radius: 10px;
    width: 100%;
    min-width: 300px;
    margin: auto;
    display: flex;
    justify-content: space-around;
    flex-direction: row;
    flex-grow: 1;
    overflow: hidden;
    @media (max-width: 768px) {
        flex-direction: column;
        padding: 10px;
        width: auto;
    }
}
.controls {
    width: 300px;
    min-width: 300px;
    background-color: #213743;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border-radius: 0.25rem;
    margin-right: 20px;
    text-align: left;
    @media (max-width: 768px) {
        width: 100%;
        min-width: 0;
    }
}
.game-controls {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    padding: 1rem;
    border-radius: 0.25rem;
    background-color: #293d47;
    .parameters {
        display: flex;
        justify-content: space-around;
        flex-direction: row;
        width: 100%;
        @media (max-width: 768px) {
            flex-direction: column;
            gap: 1rem;
        }
    }
}
.game-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    margin: 0 auto;
    .point-wrap {
        position: absolute;
        bottom: calc(100% + 23px);
        left: calc(0.5em + 21px);
        right: calc(0.5em + 23px);
        .point {
            position: absolute;
            text-align: center;
            transform: translate(-50%);
            &::after {
                content: "";
                bottom: 0;
                position: absolute;
                transform: translate(-50%);
                left: 55%;
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-bottom: 6px solid #4b5563 ;
            }
        }
    }
    .content {
        .translate-x {
            position: absolute;
            display: flex;
            padding: 0 25px;
            bottom: 50%;
            left: 0;
            right: 0;
            z-index: 5;
            pointer-events: none;
            transition: transform 300ms;
            will-change: transform;
        }
        .hide-show {
            position: relative;
            transform: translate(-50%);
            transition: all 500ms;
            transform-origin: center bottom;
            display: flex;
            justify-content: center;
            align-items: center;
            .dice {
                width: 20%;
                height: auto;
                filter: drop-shadow(0 0 3px rgba(25, 25, 25, 0.1));
            }
            &.is-hidden {
                transform: translate(-50%) scale(0.5);
                opacity: 0;
            }
            .dice-result {
                position: absolute;
                color: #218838;
                font-weight: bolder;
            }
        }
    }
    .sliderBar {
        position: relative;
        width: 100%;
        border-radius: 20px;
        background: #ccc;
        text-align: left;
        padding: 5px 0;
       // margin: 0.7em 0;
      //  box-shadow: 0 4px 6px -1px rgba(27, 23, 23, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12);
    }
    .past-bets {
        position: absolute;
        width: 100%;
        right: 1rem;
        top: 1rem;
        display: flex;
        flex-direction: row-reverse;
        gap: 0.5rem; /* 按鈕間距 */
        --duration: 500ms;
        .button-tag {
            min-width: 8ch;
            font-variant-numeric: tabular-nums;
            will-change: transform;
            animation-fill-mode: forwards;
            animation-duration: 500ms;
            animation-timing-function: ease-out;
        }
    }
}

.slider {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input {
    padding: 8px;
    width: 100%;
    box-sizing: border-box;
}

.bet-button {
    background-color: #28a745;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.bet-button:hover {
    background-color: #218838;
}

.slider input[type="range"] {
    width: 100%;
    box-sizing: border-box;
}

h2 {
    margin-bottom: 15px;
    color: #ddd;
}
.button-tag {
    color: #fff;
    background-color: #2f4553;
    box-shadow: 0rem 0.0625rem 0.1875rem #00000033, 0rem 0.0625rem 0.125rem #0000001f;
    &.variant-success {
        background-color: #00e701;
        color: #1e1e2e;
    }
}

.past-bets > *:nth-child(2n) {
    animation-name: slideEven;
}
.past-bets > *:nth-child(odd) {
    animation-name: slideOdd;
}
.past-bets > *:last-child:not(:only-child) {
    animation-name: slideOut;
}
@keyframes slideOdd {
    0% {
        transform: translate(100%);
    }
}

@keyframes slideEven {
    0% {
        transform: translate(100%);
    }
}

@keyframes slideOut {
    0% {
        transform: translate(100%);
    }

    to {
        transform: translate(0);
        opacity: 0;
        pointer-events: none;
    }
}
.fade-in-scale-down{
    transform: scale(0.5); /* 縮小 */
    transition: all 500ms ease; /* 1 秒的過渡效果 */
}
.fade-out-scale-down {
    opacity: 0; /* 淡出 */
    transform: scale(0.5); /* 縮小 */
    transition: all 1s ease; /* 1 秒的過渡效果 */
}

.el-slider{
    --el-slider-main-bg-color: red;
    --el-slider-runway-bg-color: green;
}
:deep(.el-slider__button){
    --el-slider-main-bg-color: green;
}
</style>
