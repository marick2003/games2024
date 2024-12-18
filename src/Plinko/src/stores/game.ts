import { ref, computed } from 'vue';
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
// import PlinkoEngine from '../components/Plinko/PlinkoEngine';
import { binColor } from '../constants/game';
import {
  RiskLevel,
  BallType,
  type DoBet,
  type AutoBetSetting,
  type BetAmountOfExistingBalls,
  type RowCount,
  type WinRecord,
} from '../types';
import { interpolateRgbColors } from '../utils/colors';
import { countValueOccurrences } from '../utils/numbers';
import { serviceInit,serviceDoBet, serviceGetBalance } from '@/stores/service';
import Decimal from 'decimal.js';
export const useGameStore = defineStore('game', () => {
  //  const plinkoEngine  = ref<PlinkoEngine | null>(null);
    const amount =ref<number>(0)
  const  oneBetAmount=ref<number>(0.00001)
   const setOneBetAmount = (value: number) => {
    oneBetAmount.value = value;
   }
   const betAmount = ref<number>(0);
   const setBetAmount = (value: number) => {
    betAmount.value = Math.max(0, value);
   }
   const betAmountOfExistingBalls = ref<BetAmountOfExistingBalls>({});

   const updateBetAmountOfExistingBalls = (ballId:number) => {
    betAmountOfExistingBalls.value = {...betAmountOfExistingBalls.value, [ballId]: betAmount.value};
   }

   const initBetAmountOfExistingBalls = () => {
    betAmountOfExistingBalls.value = {};
   }

   const deleteItemFromBetAmountOfExistingBalls = (ballId:number) => {
    // const newValue = {...betAmountOfExistingBalls.value};
    // delete newValue[ballId];
    // betAmountOfExistingBalls.value = {...newValue};
    delete betAmountOfExistingBalls.value[ballId];
   }
   
   const rowCount = ref<RowCount>(8);
   const setRowCount = (value:RowCount) => {
    rowCount.value = value;
   }
   const maxBetAmount=ref<number>(0);
   const setmaxBetAmount = (value: number) => {
    maxBetAmount.value = value;
   }
   const minBetAmount=ref<number>(0);
   const setminBetAmount = (value: number) => {
    minBetAmount.value = value;
   }
   const riskLevel = ref<RiskLevel>(RiskLevel.Swimming);
 
   const setRiskLevel = (value: RiskLevel) => {
    riskLevel.value = value;
   }
   const currencyLimit = ref<any>([]);
   const setCurrencyLimit = (value: []) => {
    currencyLimit.value = value;
  };
   const currency= ref<string>('btc');
   const setCurrency = (value: string) => {
    currency.value = value;
   }
   const ballType = ref<BallType>(BallType.RED);
   const setBallType = (value: BallType) => {
    ballType.value = value;
   }
   const winRecords = ref<WinRecord[]>([]);

   const updateWinRecords = (value:WinRecord) => {
    winRecords.value = [...winRecords.value, value]; // 創建新陣列
    console.log(`output->winRecords.value`,winRecords.value)
   }
   const defaultAutoBetSetting=ref<AutoBetSetting>({
    betAmount: 0,
    ballType: ['red'],
    autoBetCount: 5,
    winAdjustmentMode: 'initial',
    loseAdjustmentMode: 'initial',
    loseAdjustmentPercentage: 0,
    winAdjustmentPercentage: 0,
    isSingleBetProfitLimit: false,
    singleBetProfitLimit: 0,
    isCumulativeStopLoss: false,
    setCumulativeStopLoss:0,
    cumulativeStopLoss: 0,
    isCumulativeStopWin: false,
    setCumulativeStopWin: 0,
    cumulativeStopWin: 0
   });
   const autoBetSetting = ref<AutoBetSetting>({
    ...defaultAutoBetSetting.value
  });
   const setAutoBetSetting = (value:AutoBetSetting) => {
    autoBetSetting.value=value;
   }
   const isDropBall = ref<boolean>(false);

   const setDropBall = (value: boolean) => {
    isDropBall.value = value;
   }
   const isDoubleBet=ref<boolean[]>([]);
   const setIsDoubleBet= (index: number, value: boolean) => {
    if (isDoubleBet.value.length > 0)
      isDoubleBet.value[index] = value;
  }
   const isBallEnterBins = ref<boolean[]>([]);

   const setIsBallEnterBins = (index: number, value: boolean) => {
    if (isBallEnterBins.value.length > 0)
      isBallEnterBins.value[index] = value;
   }
/**
 * History of total profits. Should be updated whenever a new win record is pushed
 * to `winRecords` store.
 *
 * We deliberately don't use `derived(winRecords, ...)` to optimize performance.
 */
 const totalProfitHistory = ref<number[]>([0]);

 const updateTotalProfitHistory = (profit:number) => {
    const lastTotalProfit = totalProfitHistory.value.slice(-1)[0];
    totalProfitHistory.value = [...totalProfitHistory.value, lastTotalProfit + profit];
 }

/**
 * Game balance, which is saved to local storage.
 *
 * We only save the balance to local storage on browser `beforeunload` event instead of
 * on every balance change. This prevents unnecessary writes to local storage, which can
 * be slow on low-end devices.
 */
 const balance = ref<number>(0);
 const setBalance = (value:number) => {
  balance.value = value;
 }
 const updateBalance = (value:number) => {
  balance.value = new Decimal(balance.value).plus(new Decimal(value)).toNumber();
 }

/**
 * RGB colors for every bin. The length of the array is the number of bins.
 */
const binColors = computed<{ background: string[]; shadow: string[] }>(() => {
  const binCount = rowCount.value + 1;
  const isBinsEven = binCount % 2 === 0;
  const redToYellowLength = Math.ceil(binCount / 2);

  const redToYellowBg = interpolateRgbColors(
    binColor.background.red,
    binColor.background.yellow,
    redToYellowLength,
  ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

  const redToYellowShadow = interpolateRgbColors(
    binColor.shadow.red,
    binColor.shadow.yellow,
    redToYellowLength,
  ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

  return {
    background: [...redToYellowBg, ...redToYellowBg.reverse().slice(isBinsEven ? 0 : 1)],
    shadow: [...redToYellowShadow, ...redToYellowShadow.reverse().slice(isBinsEven ? 0 : 1)],
  };
});

const binProbabilities = computed<{ [binIndex: number]: number }>(() => {
  const occurrences = countValueOccurrences(winRecords.value.map(({ binIndex }) => binIndex));
  const probabilities: Record<number, number> = {};
  for (let i = 0; i < rowCount.value + 1; ++i) {
    probabilities[i] = occurrences[i] / winRecords.value.length || 0;
  }
  return probabilities;
});
const binPayouts = ref<Record<number, Record<string, number[]>>>({});
const updateBinPayouts = (newBinPayouts: Record<number, Record<string, number[]>>) => {
  binPayouts.value = newBinPayouts;
};

const autoSettingDialog:Ref<{visible: boolean, section: string}> = ref({
  visible: ref(false),
  section: ref(''),
})
const setAutoSettingDialog= (visible: boolean)=>{
  autoSettingDialog.value.visible= visible;
}
const doBet =async(betData:DoBet)=>{
  const { data, execute } = serviceDoBet(betData)
  await execute()
  // 當是自動下注時
  if(autoBetInterval.value){
    autoBetData.value=data.value.Data
  }
  return data.value
}

const getCurrencyLimit = (currency: string) => {
  const data = currencyLimit.value.find(item => item.Currency === currency);
  if (!data) {
    throw new Error(`Currency ${currency} not found.`);
  }
  return data;
};
// Initialize
const getInitialization = async() => {

  const { data, execute } = serviceInit({})

  await execute()
  const fakeResponse = {
    IsSuccess: true,
    Data: {
      SwimmingMultipliers: [
        { Row: 8, Multipliers: [5.3, 2, 1.2, 0.9, 0.5, 0.9, 1.2, 2, 5.3] },
        { Row: 10, Multipliers: [9, 3.5, 1.4, 1.1, 0.9, 0.5, 0.9, 1.1, 1.4, 3.5, 9] },
        { Row: 12, Multipliers: [10, 4, 2, 1.3, 1.1, 0.9, 0.5, 0.9, 1.1, 1.3, 2, 4, 10] },
      ],
      SmallMouthMultipliers: [
        { Row: 8, Multipliers: [14, 3.1, 1.4, 0.8, 0, 0.8, 1.4, 3.1, 14] },
        { Row: 10, Multipliers: [24, 5, 2, 1.5, 0.7, 0, 0.7, 1.5, 2, 5, 24] },
        { Row: 12, Multipliers: [37, 12, 4, 2, 0.9, 0.8, 0, 0.8, 0.9, 2, 4, 12, 37] },
      ],
      BigMouthMultipliers: [
        { Row: 8, Multipliers: [36.4, 4.5, 1.8, 0, 0, 0, 1.8, 4.5, 36.4] },
        { Row: 10, Multipliers: [80, 11.1, 3.2, 1.3, 0, 0, 0, 1.3, 3.2, 11.1, 80] },
        { Row: 12, Multipliers: [175, 30, 9, 2, 0.8, 0, 0, 0, 0.8, 2, 9, 30, 175] },
      ],
      CurrencyLimit: [
        {
            Currency: "btc",
            DefaultAmount: 0,
            MaxBetAmount: 0.001,
            MinBetAmount: 0,
            AmountUnit:0.00001,
        },
        {
            Currency: "eth",
            DefaultAmount: 0,
            MaxBetAmount: 0.0001,
            MinBetAmount: 0,
            AmountUnit:0.00001,
        },
        {
            Currency: "usdc",
            DefaultAmount: 0,
            MaxBetAmount: 1,
            MinBetAmount: 0,
            AmountUnit:0.00001,
        }
    ],
    },
  };
  const responseData:any = data.value.IsSuccess ? data.value : fakeResponse
  setCurrencyLimit(responseData.Data.CurrencyLimit)

  const { DefaultAmount, MaxBetAmount, MinBetAmount, AmountUnit } = getCurrencyLimit(currency.value);
  setmaxBetAmount(MaxBetAmount)
  setminBetAmount(MinBetAmount)
  setOneBetAmount(AmountUnit)
  setBetAmount(DefaultAmount)
  // 組合成目標格式
  const formattedBinPayouts: Record<number, Record<string, number[]>> = {};
  updateBinPayouts(formattedBinPayouts)
  const { SwimmingMultipliers, SmallMouthMultipliers, BigMouthMultipliers } = responseData.Data;

  SwimmingMultipliers.forEach(({ Row, Multipliers }) => {
    if (!formattedBinPayouts[Row]) formattedBinPayouts[Row] = {};
    formattedBinPayouts[Row]['Swimming'] = Multipliers;
  });

  SmallMouthMultipliers.forEach(({ Row, Multipliers }) => {
    if (!formattedBinPayouts[Row]) formattedBinPayouts[Row] = {};
    formattedBinPayouts[Row]['SmallMouth'] = Multipliers;
  });

  BigMouthMultipliers.forEach(({ Row, Multipliers }) => {
    if (!formattedBinPayouts[Row]) formattedBinPayouts[Row] = {};
    formattedBinPayouts[Row]['BigMouth'] = Multipliers;
  });
  return formattedBinPayouts;
};
const autoBetInterval = ref<ReturnType<typeof setInterval> | null>(null);
const autoBetIntervalMs =ref(1500)
const resetAutoBetInterval = () => {
  if (autoBetInterval.value !== null) {
      clearInterval(autoBetInterval.value);
      autoBetInterval.value = null;
      currentBallTypeIndex.value=0;
      setAutoBetSetting(defaultAutoBetSetting.value)
  }
};
const autoBetData=ref(null);
const isBetExceedBalance = computed(() => {
  return betAmount.value > balance.value;
});
const currentBallTypeIndex = ref(0);
const autoBetDropBall = () => {
  const {
    isSingleBetProfitLimit,
    isCumulativeStopLoss,
    isCumulativeStopWin,
    singleBetProfitLimit,
    setCumulativeStopLoss,
    setCumulativeStopWin,
    cumulativeStopLoss,
    cumulativeStopWin,
    winAdjustmentMode,
    loseAdjustmentMode,
    winAdjustmentPercentage,
    loseAdjustmentPercentage,
    ballType,
    autoBetCount
  } = autoBetSetting.value;

  if ( isBetExceedBalance.value) {
    resetAutoBetInterval();
    return;
  }
  if ((currentBallTypeIndex.value >= 0 || autoBetCount === Infinity) && autoBetData.value) {
    const { Amount, PayoutMultiplier ,Payout ,Balance} = autoBetData.value;
    const isWin = PayoutMultiplier > 1;
    
    if (isWin) {
      autoBetSetting.value.cumulativeStopWin = new Decimal(autoBetSetting.value.cumulativeStopWin)
      .plus(new Decimal(Payout).minus(new Decimal(Amount)))
      .toNumber();
      console.log(`output->autoBetSetting.value.cumulativeStopWin`,autoBetSetting.value.cumulativeStopWin)
      if (winAdjustmentMode !== 'initial') {
        setBetAmount(
          new Decimal(betAmount.value)
            .plus(new Decimal(betAmount.value).times(new Decimal(winAdjustmentPercentage).div(100)))
            .toNumber()
        );
      }
    } else {
      autoBetSetting.value.cumulativeStopLoss = new Decimal(autoBetSetting.value.cumulativeStopLoss)
      .plus(new Decimal(Amount).minus(new Decimal(Payout)))
      .toNumber();
      console.log(`output->autoBetSetting.value.cumulativeStopLoss`,autoBetSetting.value.cumulativeStopLoss)
      if (loseAdjustmentMode !== 'initial') {
        setBetAmount(
          new Decimal(betAmount.value)
            .minus(new Decimal(betAmount.value).times(new Decimal(loseAdjustmentPercentage).div(100)))
            .toNumber()
        );
      }
    }
    // TODO 止贏止損 待完成
    if (
      (isSingleBetProfitLimit && Payout >= singleBetProfitLimit) ||
      (isCumulativeStopLoss && autoBetSetting.value.cumulativeStopLoss - autoBetSetting.value.cumulativeStopWin >= setCumulativeStopLoss) ||
      (isCumulativeStopWin && autoBetSetting.value.cumulativeStopWin - autoBetSetting.value.cumulativeStopLoss >= setCumulativeStopWin)
    ) {

      resetAutoBetInterval();
      
    }
  }

  const ballTypes = ballType;
  if (ballTypes.length === 1) {
    setBallType(ballTypes[0] === 'red' ? BallType.RED : BallType.COLOR);
  } else if (ballTypes.length === 2) {
    setBallType(ballTypes[currentBallTypeIndex.value % ballTypes.length] === 'red' ? BallType.RED : BallType.COLOR);
    currentBallTypeIndex.value += 1;
  }

  if (autoBetCount === Infinity) {
    setDropBall(true);
  } else if (autoBetCount > 0) {
    setDropBall(true);
    autoBetSetting.value.autoBetCount -= 1;
  }

  if (autoBetCount === 0 && autoBetInterval.value !== null) {
    resetAutoBetInterval();
    return;
  }
};

const getBalance= async()=>{
  const { data, execute } = serviceGetBalance({Currency: currency.value})
  await execute()
  return data.value
}
  return {
    // plinkoEngine,
    amount,
    betAmount,
    betAmountOfExistingBalls,
    rowCount,
    riskLevel,
    winRecords,
    totalProfitHistory,
    balance,
    binColors,
    binProbabilities,
    isDropBall,
    isBallEnterBins,
    ballType,
    setBallType,
    setDropBall,
    setBetAmount,
    setRiskLevel,
    setRowCount,
    setIsBallEnterBins,
    initBetAmountOfExistingBalls,
    deleteItemFromBetAmountOfExistingBalls,
    setBalance,
    updateBalance,
    updateWinRecords,
    updateTotalProfitHistory,
    updateBetAmountOfExistingBalls,
    getInitialization,
    binPayouts,
    maxBetAmount,
    minBetAmount,
    autoBetSetting,
    setAutoBetSetting,
    autoSettingDialog,
    setAutoSettingDialog,
    doBet,
    currency,
    setCurrency,
    oneBetAmount,
    setOneBetAmount,
    currencyLimit,
    setCurrencyLimit,
    autoBetInterval,
    autoBetDropBall,
    autoBetIntervalMs,
    resetAutoBetInterval,
    getBalance,
    setIsDoubleBet,
    defaultAutoBetSetting,
    isDoubleBet,
   }
})
