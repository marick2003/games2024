<script setup lang="ts">
  import { useGameStore } from '../../stores/game';
  // import { PhCircleNotch } from '@phosphor-icons/vue';
  import BinsRow from './BinsRow.vue';
  import LastWins from './LastWins.vue';
  import { onMounted, onUnmounted, ref, computed, watch,defineExpose  } from 'vue';
  import Matter, { type IBodyDefinition } from 'matter-js';
  import { v4 as uuidv4 } from 'uuid';
  import axios from 'axios';
  import { BallPostionList } from '@/test';
  import { getRandomElement } from '@/utils/numbers';
  import { BetMode, RiskLevel , BallType } from '@/types';
import { RowCount,rowCountOptions } from '../../constants/game';
  type BallFrictionsByRowCount = {
    friction: NonNullable<IBodyDefinition['friction']>;
    frictionAirByRowCount: Record<RowCount, NonNullable<IBodyDefinition['frictionAir']>>;
  };

  const game = useGameStore();

  const WIDTH = 750;
  const HEIGHT = 570;

  const PADDING_X = 20;
  const PADDING_TOP = 36;
  const PADDING_BOTTOM = 28;

  const PIN_CATEGORY = 0x0001;
  const BALL_CATEGORY = 0x0002;

  // module aliases
  const Engine = Matter.Engine,
      Events = Matter.Events,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;


  /**
   * Every pin of the game.
   */
  const pins = ref<Matter.Body[]>([]);

  /**
   * Walls are invisible, slanted "guard rails" at the left and right sides of the
   * pin triangle. It prevents balls from falling outside the pin triangle and not
   * hitting a bin.
   */
  const walls = ref<Matter.Body[]>([]);

  /**
   * "Sensor" is an invisible body at the bottom of the canvas. It detects whether
   * a ball arrives at the bottom and enters a bin.
   */
  const sensor = ref<Matter.Body>();

  const pinsLastRowXCoords = ref<number[]>([]);

  const canvas = ref<HTMLCanvasElement | null>(null);

  const runner = Matter.Runner.create();

  // create an engine
  const engine = Engine.create({
    timing: {
      timeScale: 3, // 1 正常  3 加入3倍
    },
    // gravity: {
    //   scale: 0.0007,
    // },
  });

  const ballFrictions: BallFrictionsByRowCount = {
    friction: 0.2,// range (0, 1) 0.5
    frictionAirByRowCount: {// faster a body slows when moving through space, 0 means never slow, default 0.01
      8: 0.03,//0.0395,
      10: 0.03,//0.038,
      12: 0.032,//0.0414,
    },
  };
  const pinsState = ref<{ id: number; x: number; y: number; isGlowing: boolean }[]>([]);

  onMounted(() => {
    // create a renderer
    canvas.value = document.getElementById("canvas") as HTMLCanvasElement;
    const render = Render.create({
      engine: engine,
      canvas: canvas.value,
      options: {
        width: WIDTH,
        height: HEIGHT,
        background: null,
        wireframes: false,
       
      },
    });

    placePinsAndWalls();

    sensor.value = Bodies.rectangle(
      canvas.value.width / 2,
      canvas.value.height + 80,
      canvas.value.width,
      1,
      {
        isSensor: true,
        isStatic: true,
        render: {
          visible: false,
        },
      },
    );
    Composite.add(engine.world, [sensor.value]);
    Events.on(engine, 'collisionStart', ({ pairs }) => {
      pairs.forEach(({ bodyA, bodyB }) => {
        if (bodyA === sensor.value) {
          handleBallEnterBin(bodyB);
        } else if (bodyB === sensor.value) {
          handleBallEnterBin(bodyA);
        }else {
          handlePinCollision(bodyA, bodyB);
        }
      });
    });

    // run the renderer
    Render.run(render); // Renders the scene to canvas
    Runner.run(runner, engine); // Starts the simulation in physics engine
  });

  onUnmounted(() => {
    // Render.stop(render);
    Runner.stop(runner);
  });
  const handlePinCollision = (bodyA: Matter.Body, bodyB: Matter.Body) => {
    const pin = [bodyA, bodyB].find((body) => body.collisionFilter.category === PIN_CATEGORY);
    const ball = [bodyA, bodyB].find((body) => body.collisionFilter.category === BALL_CATEGORY);
    // console.log(`output->ball`,ball)
    if (pin && ball) {
      const pinState = pinsState.value.find((p) => p.id === pin.id);
       // 檢查是否與彩球碰撞
      if (pinState) {
        pinState.isGlowing = true;
        setTimeout(() => (pinState.isGlowing = false), 300); // 發光效果維持 300ms
      }
      if (ball.collisionCount && ball.collisionCount > 0) {
          ball.collisionCount -= 1;
      }

      if (ball.isExplosion &&  ball.collisionCount==0) {
        console.log(`output->pinState`,pinState)
        const explosionX = pinState.x;
        const explosionY = pinState.y + 46;
   
        
        const explosionImg = document.createElement("img");
        explosionImg.src = new URL(`../../assets/images/boom.gif`, import.meta.url).href; // 確保圖片路徑正確
        explosionImg.style.position = "absolute";
        explosionImg.style.width = "80px";
        explosionImg.style.height = "80px";
        explosionImg.style.left = `${explosionX - 40}px`;
        explosionImg.style.top = `${explosionY - 40}px`;
        explosionImg.style.zIndex = "10";
        explosionImg.style.mixBlendMode = "color-dodge";
        // 將爆炸特效添加到畫布容器中
          canvas.value!.parentElement!.parentElement!.appendChild(explosionImg);

          // 在2秒後移除爆炸特效
          setTimeout(() => {
            explosionImg.remove();
          }, 1000);

          game.updateWinRecords({
            id: uuidv4(),
            betAmount: 0,
            rowCount: game.rowCount,
            binIndex:0,
            ballType: game.ballType,
            balance: ball.balance,
            amount: ball.amount,
            payout: {
              colorMultiplier: ball.colorMultiplier,
              multiplier: 0,
              value: 0,
            },
            profit:0,
          });


          Composite.remove(engine.world, ball);
          game.deleteItemFromBetAmountOfExistingBalls(ball.id);
      }
    }
  };

  const binsWidthPercentage = computed<number>(() => {
    const lastPinX = pinsLastRowXCoords.value[pinsLastRowXCoords.value.length - 1];
    return (lastPinX - pinsLastRowXCoords.value[0]) / WIDTH;
  });

  /**
   * Gets the horizontal distance between each pin's center point.
   */
  const pinDistanceX = computed<number>(() => {
    if (canvas.value !== null ){
      const lastRowPinCount = 3 + game.rowCount - 1;
      return (canvas.value!.width - PADDING_X * 2) / (lastRowPinCount - 1);
    }
    return 0;
  });

  const pinRadius = computed<number>(() => {
    return (24 - game.rowCount) / 2;
  });

  watch(
    () => game.rowCount,
    (newVal) => {
      if (newVal) {
        updateRowCount(newVal);
      }
    }
  );


  const callToDrop = async () => {
    console.log(`output->game.isDropBall`,'newVal')
    const response :any = await game.doBet({
        Currency: game.currency,
        Amount: game.betAmount,
        Rows: game.rowCount,
        Risk: game.riskLevel,
        BallType: game.ballType.toLowerCase()
      })
      
    if(response.IsSuccess){
      const point = getRandomElement(BallPostionList[game.rowCount][response.Data.FinalPosition-1])
       // response.Data.ColorMultiplier 0 爆炸  1 正常
       game.setDropBall(false);  
        await dropABall(point
          ,(game.ballType === BallType.COLOR && response.Data.ColorMultiplier === 0)
          ,response.Data.ColorMultiplier
          ,response.Data.Payout
          ,response.Data.Balance
          ,response.Data.Amount
        );
     
    }
    
  };
  defineExpose({
    callToDrop,
});

const dropABall = (point: number, isExplosion: boolean, colorMultiplier:number,payout:number ,balance:number ,amount:number) => {
    console.log(`output->isExplosion`, isExplosion);

    // 初始化圖片
    const ballTexture = new Image();
    const ballRadius = pinRadius.value * 2;
    const { friction, frictionAirByRowCount } = ballFrictions;

    // 處理圖片加載完成後再添加球體
    ballTexture.onload = () => {
        const ball = Bodies.circle(
            point,
            0,
            ballRadius,
            {
                restitution: 0.8, // 彈性
                isExplosion, // 是否爆炸
                colorMultiplier,
                collisionCount: Math.floor(Math.random() * (game.rowCount/2)) + 3, // 碰撞次數
                payout,
                balance,
                amount,
                friction,
                frictionAir: frictionAirByRowCount[game.rowCount],
                collisionFilter: {
                    category: BALL_CATEGORY,
                    mask: PIN_CATEGORY, // 只與 PIN 碰撞
                },
                render: {
                    sprite: {
                        texture: ballTexture.src,
                        xScale: 2,
                        yScale: 2,
                    },
                },
            }
        );
            
        // 添加到引擎中
        Composite.add(engine.world, ball);

        // 更新遊戲狀態
        game.updateBetAmountOfExistingBalls(ball.id);
        game.setBalance(balance-payout);
    };

    ballTexture.onerror = () => {
        console.error("Failed to load ball texture", ballTexture.src);
    };
    ballTexture.src = new URL(`../../assets/images/${game.ballType.toLowerCase()}.png`, import.meta.url).href; // 確保圖片路徑正確


};

  const updateRowCount = (currentRowCount:RowCount) => {
    // if (currentRowCount === game.rowCount) {
    //   return;
    // }
     removeAllBalls();

    game.setRowCount(currentRowCount);
    placePinsAndWalls();
  }

  const removeAllBalls = () => {
    Composite.allBodies(engine.world).forEach((body) => {
      if (body.collisionFilter.category === BALL_CATEGORY) {
        Composite.remove(engine.world, body);
      }
    });
    game.initBetAmountOfExistingBalls();
  }

  const placePinsAndWalls = () => {
    console.log(`output->pinRadius.value`,pinRadius.value)
    pinsState.value=[];
    const pinTexture = new Image();
    pinTexture.src = new URL(`../../assets/images/pin.png`, import.meta.url).href; // 確保圖片路徑正確
    if (pins.value.length > 0) {
      Composite.remove(engine.world, pins.value);
      pins.value = [];
      game.isBallEnterBins = [];
    }

    if (pinsLastRowXCoords.value.length > 0) {
      pinsLastRowXCoords.value = [];
    }

    if (walls.value.length > 0) {
      Composite.remove(engine.world, walls.value);
      walls.value = [];
    }
    const bottomMargin = 60; // 與底部的間距

    for (let row = 0; row < game.rowCount; ++row) {
      const rowY =
        PADDING_TOP +
        ((canvas.value!?.height - PADDING_TOP - PADDING_BOTTOM - bottomMargin ) / (game.rowCount - 1)) * row;

      /** Horizontal distance between canvas left/right boundary and first/last pin of the row. */
      const rowPaddingX = PADDING_X + ((game.rowCount - 1 - row) * pinDistanceX.value) / 2;
     
      for (let col = 0; col < 3 + row; ++col) {
        const colX = rowPaddingX + ((canvas.value!?.width - rowPaddingX * 2) / (3 + row - 1)) * col;
        const pin = Bodies.circle(colX, rowY, pinRadius.value, {
          isStatic: true,
          render: {
            sprite: {
              texture: pinTexture.src,
              xScale: 2.2,
              yScale: 2.2,  
              
            }
          },
          collisionFilter: {
            category: PIN_CATEGORY,
            mask: BALL_CATEGORY, // Collide with balls
          },
        });
        pins.value.push(pin);
        pinsState.value.push({
          id: pin.id,
          x: colX/2,
          y: rowY/2,
          isGlowing: false,
        });
        if (row === game.rowCount - 1) {
          pinsLastRowXCoords.value.push(colX);
        }
      }
      game.isBallEnterBins.push(false);
    }
    Composite.add(engine.world, pins.value);
  }

  const handleBallEnterBin = (ball: Matter.Body) => {
    const binIndex = pinsLastRowXCoords.value.findLastIndex((pinX) => pinX < ball.position.x);

    if (binIndex !== -1 && binIndex < pinsLastRowXCoords.value.length - 1) {
      const betAmount = game.betAmountOfExistingBalls[ball.id] ?? 0;
      const multiplier = game.binPayouts[game.rowCount][game.riskLevel][binIndex];
      const payoutValue = ball.payout;
      const profit = payoutValue - betAmount;
      game.updateWinRecords({
        id: uuidv4(),
        betAmount,
        rowCount: game.rowCount,
        binIndex,
        ballType: game.ballType,
        balance: ball.balance,
        amount: ball.amount,
        payout: {
          colorMultiplier: ball.colorMultiplier,
          multiplier,
          value: payoutValue,
        },
        profit,
      });
      game.updateTotalProfitHistory(profit);
       // 判斷 bin 的數字是否為 0，切換鱷魚圖
        if (multiplier <= 0) {
          if (game.riskLevel === RiskLevel.SmallMouth) {
            crocodileStep.value = 'step2'; // 如果是小嘴風險，顯示 step2
          } else if (game.riskLevel === RiskLevel.BigMouth) {
            crocodileStep.value = 'step3'; // 如果是大嘴風險，顯示 step3
          }
          setTimeout(() => {
            crocodileStep.value = 'step1'; // 0.2 秒後重置為 step1
          }, 300);
        }
    }
    
    Composite.remove(engine.world, ball);
    game.deleteItemFromBetAmountOfExistingBalls(ball.id);
  }


  const getPinStyle = (pin: { x: number; y: number }) => ({
  left: `${pin.x - 4}px`,
  top: `${pin.y - 4}px`,
});
const crocodileStep = ref('step1'); // 默認顯示 step1

</script>

<template>
  <div class="relative ">
    <div class="mx-auto flex h-full flex-col" :style="{maxWidth: WIDTH +'px'}">
      <div class="relative w-full mt-[62px] z-[2]" :style="{aspectRatio: WIDTH / HEIGHT}">
          <!-- <div v-if="game.plinkoEngine === null" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <PhCircleNotch class="size-20 animate-spin text-slate-600" weight="bold" />
          </div> -->
          <canvas id="canvas" width={WIDTH} height={HEIGHT} class="absolute inset-0 h-full w-full" />
          
            <div v-for="pin in pinsState" :key="pin.id" class="pin" :class="{ glowing: pin.isGlowing }" 
            :style="getPinStyle(pin)">
            </div>
       
            
      </div>
      <BinsRow :binsWidthPercentage="binsWidthPercentage" class="z-[1] absolute bottom-[34%]" />
      <div class="w-full h-[210px] mt-[-45px] crocodileBg relative">
        <!-- 使用 v-show 控制步驟2 -->
        <div v-show="crocodileStep === 'step2'" class="absolute top-[20px] left-[142px]">
          <img class="w-[80%]" src="../../assets/images/svg/crocodiles_step2.svg" />
        </div>
        <!-- 使用 v-show 控制步驟3 -->
        <div v-show="crocodileStep === 'step3'" class="absolute top-[20px] left-[120px]">
          <img class="w-[80%]" src="../../assets/images/svg/crocodiles_step3.svg" />
        </div>
        <!-- 使用 v-show 控制步驟1 -->
        <div v-show="crocodileStep === 'step1'" class="absolute top-[65px] left-[80px] animate-move">
          <img class="w-[80%]" src="../../assets/images/svg/crocodiles_step1.svg" />
        </div>
      </div>
      </div>
    <div class="absolute left-[2%] top-1/4 -translate-y-1/2">
      <LastWins />
    </div>
   
  </div>
</template>

<style scoped>
.pin {
  position: absolute;
  width: 8px;
  height: 8px;
  /* background: gray;  */
  border-radius: 50%;
  transition: box-shadow 0.2s;
}

.pin.glowing {
  box-shadow: 0 0 10px rgba(255, 255, 0, 1);
}
.crocodileBg{
  background: url(../../assets/images/crocodile_bg.png) no-repeat;
  background-size: contain;
}
@keyframes moveSideways {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px); /* 可調整移動距離 */
  }
  100% {
    transform: translateX(0);
  }
}

.animate-move {
  animation: moveSideways 5s ease-in-out infinite; /* 每2秒完成一次動畫，平滑往返 */
}
</style>