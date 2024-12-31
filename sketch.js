let animations = {
  player1: {
    idle: [],
    walk: [],
    jump: [],
    fight: [],
    boom: []
  },
  player2: {
    idle: [],
    walk: [],
    jump: [],
    fight: [],
    boom: []
  }
};

// 玩家狀態
let players = {
  player1: {
    x: window.innerWidth * 0.2,
    y: 300,
    facing: 1,
    health: 100,
    name: "小櫻",
    isJumping: false,
    isFighting: false,
    showBoom: false,
    currentAnimation: 'idle',
    frameIndex: 0,
    boomFrameIndex: 0,
    boomX: 0,
    jumpVelocity: 0
  },
  player2: {
    x: window.innerWidth * 0.8,
    y: 300,
    facing: -1,  // 永遠面向左
    health: 100,
    name: "小狼",
    isJumping: false,
    isFighting: false,
    showBoom: false,
    currentAnimation: 'idle',
    frameIndex: 0,
    boomFrameIndex: 0,
    boomX: 0,
    jumpVelocity: 0
  }
};

let bgImage;

// 動畫設定
const SPRITE_DATA = {
  player1: {
    idle: {
      width: 63,
      height: 103,
      frames: 4,
      scale: 2.5
    },
    walk: {
      width: 77.5,
      height: 99,
      frames: 6,
      scale: 2.5
    },
    jump: {
      width: 122,
      height: 112,
      frames: 4,
      scale: 2.5
    },
    fight: {
      width: 158,
      height: 133,
      frames: 8,
      scale: 1.75
    },
    boom: {
      width: 123,
      height: 96,
      frames: 6,
      scale: 1.75
    }
  },
  player2: {
    idle: {
      width: 115,
      height: 86,
      frames: 5,
      scale: 2.0
    },
    walk: {
      width: 82,
      height: 109,
      frames: 6,
      scale: 2.0
    },
    jump: {
      width: 71,
      height: 120,
      frames: 6,
      scale: 2.0
    },
    fight: {
      width: 127,
      height: 154,
      frames: 6,
      scale: 1.75
    },
    boom: {
      width: 123,
      height: 96,
      frames: 6,
      scale: 1.75
    }
  }
};

// 特效設定
const BOOM_SETTINGS = {
  player1: {
    speed: 15,
    frameToShow: 5
  },
  player2: {
    speed: 15,
    frameToShow: 3
  }
};

// 物理常數
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const GROUND_Y = window.innerHeight - 100;

// 控制鍵設定
const CONTROLS = {
  player1: {
    left: 65,    // A
    right: 68,   // D
    up: 87,      // W
    attack: 81   // Q
  },
  player2: {
    left: 37,    // LEFT_ARROW
    right: 39,   // RIGHT_ARROW
    up: 38,      // UP_ARROW
    attack: 32   // SPACE
  }
};

function preload() {
  console.log('開始載入圖片...');
  bgImage = loadImage('media/background.png');
  
  // 載入 player1 的圖片
  ['idle', 'walk', 'jump', 'fight', 'boom'].forEach(animation => {
    const data = SPRITE_DATA.player1[animation];
    for(let i = 0; i < data.frames; i++) {
      animations.player1[animation][i] = loadImage(
        `media/player1/${animation}/${i}.png`,
        () => console.log(`Player1 ${animation} ${i} loaded`),
        err => console.error(`Error loading player1 ${animation} ${i}:`, err)
      );
    }
  });

  // 載入 player2 的圖片
  ['idle', 'walk', 'jump', 'fight', 'boom'].forEach(animation => {
    const data = SPRITE_DATA.player2[animation];
    for(let i = 0; i < data.frames; i++) {
      animations.player2[animation][i] = loadImage(
        `media/player2/${animation}/${i}.png`,
        () => console.log(`Player2 ${animation} ${i} loaded`),
        err => console.error(`Error loading player2 ${animation} ${i}:`, err)
      );
    }
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  imageMode(CENTER);
  textAlign(CENTER, TOP);
  textSize(36);
  textStyle(BOLD);
  players.player1.y = GROUND_Y;
  players.player2.y = GROUND_Y;
}

function draw() {
  // 繪製背景
  image(bgImage, width/2, height/2, width, height);
  
  // 繪製標題
  fill(255);
  stroke(0);
  strokeWeight(4);
  text('淡江教育科技', width/2, 30);

 // 繪製操作說明
 textAlign(LEFT, TOP);
 textSize(24);
 strokeWeight(2);
 text('W 跳躍\nA D 左右移動\nQ 攻擊', 50, 100);

 // 繪製 player2 操作說明
 textAlign(RIGHT, TOP);
 text('↑ 跳躍\n← → 移動\nSpace 攻擊', width - 50, 100);
 

   // 重置文字對齊，以免影響其他文字
   textAlign(CENTER, TOP);
 
 // 更新和繪製兩個玩家
 ['player1', 'player2'].forEach(player => {
  handlePhysics(player);
  handleInput(player);
  drawCharacter(player);
  drawNameAndHealth(player);  // 繪製名稱和血條
  
    
    // 檢查是否應該開始顯示特效
    if (players[player].isFighting && 
        players[player].frameIndex === BOOM_SETTINGS[player].frameToShow) {
      players[player].showBoom = true;
    }
    
    // 如果應該顯示特效，則繪製並更新特效
    if (players[player].showBoom) {
      drawBoomEffect(player);
      players[player].boomX += BOOM_SETTINGS[player].speed;
    }
  });
  
  // 更新動畫幀
  if (frameCount % 6 == 0) {
    ['player1', 'player2'].forEach(player => {
      players[player].frameIndex++;
      if (players[player].showBoom) {
        players[player].boomFrameIndex++;
      }
      
      // 檢查戰鬥動畫是否完成
      if (players[player].isFighting && 
          players[player].frameIndex >= SPRITE_DATA[player][players[player].currentAnimation].frames) {
        players[player].isFighting = false;
        players[player].showBoom = false;
        players[player].currentAnimation = 'idle';
        players[player].frameIndex = 0;
        players[player].boomFrameIndex = 0;
        players[player].boomX = 0;
      }
    });
  }

  // 更新和繪製兩個玩家
  ['player1', 'player2'].forEach(player => {
    handlePhysics(player);
    handleInput(player);
    drawCharacter(player);
    drawNameAndHealth(player);
    
    if (players[player].showBoom) {
      drawBoomEffect(player);
      players[player].boomX += BOOM_SETTINGS[player].speed;
      
      // 檢查特效碰撞
      checkBoomCollision(player);
    }
  });

}

function handlePhysics(player) {
  if (players[player].isJumping) {
    players[player].y += players[player].jumpVelocity;
    players[player].jumpVelocity += GRAVITY;
    
    if (players[player].y >= GROUND_Y) {
      players[player].y = GROUND_Y;
      players[player].isJumping = false;
      players[player].jumpVelocity = 0;
      if (players[player].currentAnimation === 'jump') {
        players[player].currentAnimation = 'idle';
      }
    }
  }
}

function handleInput(player) {
  if (players[player].isFighting) return;

  const controls = CONTROLS[player];
  
  if (player === 'player2') {
    if (players[player].isFighting) return;

    const controls = CONTROLS[player];
    
    if (player === 'player2') {
      // Player 2 的特殊移動邏輯
      if (keyIsDown(controls.left) && players[player].x > 100) {
        players[player].x -= MOVE_SPEED;
        if (!players[player].isJumping) players[player].currentAnimation = 'walk';
        players[player].facing = -1;  // 添加這行，按左鍵時面向左
      } else if (keyIsDown(controls.right) && players[player].x < width - 100) {
        players[player].x += MOVE_SPEED;
        if (!players[player].isJumping) players[player].currentAnimation = 'walk';
        players[player].facing = 1;   // 添加這行，按右鍵時面向右
      } else if (!players[player].isJumping && !players[player].isFighting) {
        players[player].currentAnimation = 'idle';
      }
    }
  } else {
    // Player 1 的原始邏輯
    if (keyIsDown(controls.left) && players[player].x > 100) {
      players[player].x -= MOVE_SPEED;
      players[player].facing = -1;
      if (!players[player].isJumping) players[player].currentAnimation = 'walk';
    } else if (keyIsDown(controls.right) && players[player].x < width - 100) {
      players[player].x += MOVE_SPEED;
      players[player].facing = 1;
      if (!players[player].isJumping) players[player].currentAnimation = 'walk';
    } else if (!players[player].isJumping && !players[player].isFighting) {
      players[player].currentAnimation = 'idle';
    }
  }
  
  if (keyIsDown(controls.up) && !players[player].isJumping) {
    players[player].isJumping = true;
    players[player].jumpVelocity = JUMP_FORCE;
    players[player].currentAnimation = 'jump';
  }
}

function keyPressed() {
  // Player 1 攻擊 (Q鍵)
  if (keyCode === CONTROLS.player1.attack && 
      !players.player1.isFighting && 
      !players.player1.isJumping) {
    startFighting('player1');
  }
  
  // Player 2 攻擊 (空白鍵)
  if (keyCode === CONTROLS.player2.attack && 
      !players.player2.isFighting && 
      !players.player2.isJumping) {
    startFighting('player2');
  }
}

function startFighting(player) {
  players[player].isFighting = true;
  players[player].currentAnimation = 'fight';
  players[player].frameIndex = 0;
  players[player].boomFrameIndex = 0;
  players[player].boomX = 0;
  players[player].showBoom = false;
}

function drawCharacter(player) {
  push();
  translate(players[player].x, players[player].y);
  
  const currentAnim = players[player].currentAnimation;
  const spriteData = SPRITE_DATA[player][currentAnim];
  
  // 根據角色面向決定縮放方向
  let scaleX = spriteData.scale * players[player].facing;
  
  scale(scaleX, spriteData.scale);
  
  const currentSprite = animations[player][currentAnim][players[player].frameIndex % spriteData.frames];
  
  if (currentSprite) {
    image(
      currentSprite,
      0, -spriteData.height/2,
      spriteData.width,
      spriteData.height
    );
  }
  
  pop();
}

function drawBoomEffect(player) {
  push();
  
  // 根據角色面向決定特效位置
  let boomOffset = players[player].facing * (100 + players[player].boomX);
  
  translate(
    players[player].x + boomOffset,
    players[player].y - 50
  );
  
  const boomData = SPRITE_DATA[player].boom;
  
  // 特效的縮放跟隨角色面向
  let scaleX = boomData.scale * players[player].facing;
  
  scale(scaleX, boomData.scale);
  
  const boomSprite = animations[player].boom[players[player].boomFrameIndex % boomData.frames];
  
  if (boomSprite) {
    image(
      boomSprite,
      0, -boomData.height/2,
      boomData.width,
      boomData.height
    );
  }
  
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  GROUND_Y = windowHeight - 100;
  players.player1.x = windowWidth * 0.2;
  players.player2.x = windowWidth * 0.8;
}

// 新增繪製名稱和血條的函數
// 修改名稱和血條繪製函數，支援兩個玩家
function drawNameAndHealth(player) {
  push();
  translate(players[player].x, players[player].y - 100);  // 位置在角色頭上方
  
  // 繪製名稱
  textAlign(CENTER);
  textSize(20);
  fill(255);
  stroke(0);
  strokeWeight(3);
  text(players[player].name, 0, -20);
  
  // 繪製血條背景
  noStroke();
  fill(100);
  rect(-30, 0, 60, 10);
  
  // 計算血量百分比
  const healthPercent = players[player].health / 100;
  
  // 根據血量決定顏色
  if (healthPercent <= 0.4) {
    fill(255, 0, 0);  // 紅色 (低血量)
  } else {
    fill(0, 255, 0);  // 綠色 (正常血量)
  }
  
  // 繪製血條
  rect(-30, 0, 60 * healthPercent, 10);
  
  // 繪製血條邊框
  noFill();
  stroke(0);
  strokeWeight(2);
  rect(-30, 0, 60, 10);
  
  pop();
}

// 在 windowResized 函數中更新文字大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  GROUND_Y = windowHeight - 100;
  players.player1.x = windowWidth * 0.2;
  players.player2.x = windowWidth * 0.8;
  textSize(36);  // 重置主標題文字大小
}

// 新增碰撞檢測函數
function checkBoomCollision(attackingPlayer) {
  const defendingPlayer = attackingPlayer === 'player1' ? 'player2' : 'player1';
  
  // 計算特效的位置和範圍
  let boomX, boomWidth;
  
  if (players[attackingPlayer].facing === 1) {
    // 面向右側時的特效
    boomX = players[attackingPlayer].x + 100;
    boomWidth = players[attackingPlayer].boomX;
  } else {
    // 面向左側時的特效
    boomX = players[attackingPlayer].x - 100 - players[attackingPlayer].boomX;
    boomWidth = players[attackingPlayer].boomX + 100;
  }
  
  const boomY = players[attackingPlayer].y - 50;
  const boomHeight = 80;
  
  // 角色的碰撞範圍
  const playerWidth = 60;
  const playerHeight = 100;
  
  // 檢查碰撞
  const targetX = players[defendingPlayer].x;
  const targetY = players[defendingPlayer].y;
  
  
  // 添加更多調試信息
  console.log(`Attacking: ${attackingPlayer}`);
  console.log(`Boom position: ${boomX}, ${boomY}`);
  console.log(`Target position: ${targetX}, ${targetY}`);
  
  if (
    boomX < targetX + playerWidth/2 &&
    boomX + boomWidth > targetX - playerWidth/2 &&
    boomY < targetY + playerHeight/2 &&
    boomY + boomHeight > targetY - playerHeight/2
  ) {
    console.log('Collision detected!');
    // 如果還沒被這次攻擊打中過
    if (!players[attackingPlayer].hasHit) {
      console.log(`${defendingPlayer} got hit!`);
      players[defendingPlayer].health = Math.max(0, players[defendingPlayer].health - 25);
      players[attackingPlayer].hasHit = true;
    }
  }
}

function startFighting(player) {
  players[player].isFighting = true;
  players[player].currentAnimation = 'fight';
  players[player].frameIndex = 0;
  players[player].boomFrameIndex = 0;
  players[player].boomX = 0;
  players[player].showBoom = false;
  players[player].hasHit = false;  // 添加這行：重置 hasHit 狀態
}