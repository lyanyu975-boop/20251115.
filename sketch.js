let questionTable;
let allQuestions = [];
let quizQuestions = []; // 儲存本次測驗的3個題目
let currentQuestionIndex = 0;
let score = 0;
let gameState = 'START'; // 遊戲狀態: START, QUESTION, FEEDBACK, RESULT


// *** 縮小虛擬內容區尺寸至 800x650 ***
const QUIZ_WIDTH = 800;
const QUIZ_HEIGHT = 650;
let offsetX = 0; // 內容置中所需的水平偏移
let offsetY = 0; // 內容置中所需的垂直偏移


// 按鈕物件
let answerButtons = [];
let startButton, restartButton;


// 互動效果
let particles = [];
let feedbackMessage = '';
let feedbackColor;
let feedbackTimer = 0;


function preload() {
  // 載入 CSV 檔案，指定 'csv' 格式且沒有標頭
  questionTable = loadTable('questions.csv', 'csv');
}


function setup() {
  // 讓畫布充滿整個視窗
  createCanvas(windowWidth, windowHeight);
 
  processData();
  setupButtons();
  setupParticles();
  startGame();
}


function draw() {
  // 深色背景
  background(10, 20, 40);
  drawParticles();


  // 根據不同的遊戲狀態繪製不同畫面
  switch (gameState) {
    case 'START':
      drawStartScreen();
      break;
    case 'QUESTION':
      drawQuestionScreen();
      break;
    case 'FEEDBACK':
      drawFeedbackScreen();
      break;
    case 'RESULT':
      drawResultScreen();
      break;
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupButtons();
}


// ---------------------------------
// 遊戲流程函數
// ---------------------------------


function processData() {
  for (let row of questionTable.getRows()) {
    allQuestions.push({
      question: row.getString(0),
      opA: row.getString(1),
      opB: row.getString(2),
      opC: row.getString(3),
      opD: row.getString(4),
      correct: row.getString(5)
    });
  }
}


// 2. 設定按鈕位置 (使用新的 800x650 鎖定位置)
function setupButtons() {
  // 計算置中偏移量
  offsetX = (width - QUIZ_WIDTH) / 2;
  offsetY = (height - QUIZ_HEIGHT) / 2;
 
  // --- 開始按鈕 ---
  startButton = {
    x: QUIZ_WIDTH / 2 - 100 + offsetX,
    y: QUIZ_HEIGHT / 2 + 50 + offsetY, // 325 + 50 = 375
    w: 200, h: 60, text: '開始測驗'
  };
 
  // --- 重新開始按鈕 ---
  restartButton = {
    x: QUIZ_WIDTH / 2 - 100 + offsetX,
    y: QUIZ_HEIGHT / 2 + 150 + offsetY, // 325 + 150 = 475
    w: 200, h: 60, text: '重新開始'
  };


  // --- 四個答案按鈕 ---
  let btnW = 350;
  let btnH = 80;
  let gap = 20;
  answerButtons = [];
 
  // 原始固定座標 (相對 0,0) - 調整 Y 座標適應 650 高度
  let fixedX1 = 40; // 邊距回到 40
  let fixedX2 = 40 + btnW + gap;
  let fixedY1 = 350; // 選項起始 Y 座標 (調整為 350)
  let fixedY2 = 350 + btnH + gap;
 
  answerButtons.push({ x: fixedX1 + offsetX, y: fixedY1 + offsetY, w: btnW, h: btnH, option: 'A' });
  answerButtons.push({ x: fixedX2 + offsetX, y: fixedY1 + offsetY, w: btnW, h: btnH, option: 'B' });
  answerButtons.push({ x: fixedX1 + offsetX, y: fixedY2 + offsetY, w: btnW, h: btnH, option: 'C' });
  answerButtons.push({ x: fixedX2 + offsetX, y: fixedY2 + offsetY, w: btnW, h: btnH, option: 'D' });
}


function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  quizQuestions = shuffle(allQuestions).slice(0, 3);
  gameState = 'START';
}


function checkAnswer(selectedOption) {
  let correctOption = quizQuestions[currentQuestionIndex].correct;


  if (selectedOption === correctOption) {
    score++;
    feedbackMessage = '恭喜~答對了！';
    feedbackColor = color(0, 200, 100, 220);
  } else {
    feedbackMessage = `歐歐答錯了... 正確答案是 ${correctOption}`;
    feedbackColor = color(200, 50, 50, 220);
  }
 
  gameState = 'FEEDBACK';
  feedbackTimer = 90;
}


function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= quizQuestions.length) {
    gameState = 'RESULT';
  } else {
    gameState = 'QUESTION';
  }
}


function getFeedbackText() {
  if (score === 3) return '太棒了，根本學霸！';
  if (score >= 1) return '中間的人永遠不會被記住，再接再厲吧！';
  return '學渣要努力，再試一次吧！';
}


// ---------------------------------
// 畫面繪製函數
// ---------------------------------


function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(48);
  text('p5.js 題庫測驗', QUIZ_WIDTH / 2 + offsetX, QUIZ_HEIGHT / 2 - 100 + offsetY);
  textSize(24);
  text(`從 ${allQuestions.length} 題中隨機抽取 3 題`, QUIZ_WIDTH / 2 + offsetX, QUIZ_HEIGHT / 2 - 30 + offsetY);
 
  drawButton(startButton);
}


function drawQuestionScreen() {
  if (quizQuestions.length === 0) return;
 
  drawQuizContainer();


  let q = quizQuestions[currentQuestionIndex];
 
  // 繪製題號 (左上角)
  textAlign(LEFT, TOP);
  fill(255);
  textSize(28);
  text(`第 ${currentQuestionIndex + 1} 題 / 3 題`, 60 + offsetX, 60 + offsetY);
 
  // 繪製問題 (左對齊，確保在方框內不溢出)
  textAlign(LEFT, TOP);
  fill(255);
  textSize(32);
  text(
    q.question,
    60 + offsetX, // X 座標與題號對齊
    150 + offsetY, // Y 座標
    QUIZ_WIDTH - 120, // 文本寬度限制 (800 - 120 = 680)
    150 // 文本最大高度限制 (微調為 150，確保更緊湊)
  );
 
  // 更新選項文字內容
  answerButtons[0].text = 'A. ' + q.opA;
  answerButtons[1].text = 'B. ' + q.opB;
  answerButtons[2].text = 'C. ' + q.opC;
  answerButtons[3].text = 'D. ' + q.opD;
 
  // 繪製按鈕
  for (let btn of answerButtons) {
    drawButton(btn);
  }
}


function drawQuizContainer() {
  push();
  // 方框的起始點和尺寸，基於 QUIZ_WIDTH/HEIGHT 並加上偏移量
  let containerX = offsetX + 20;
  let containerY = offsetY + 20;
  let containerW = QUIZ_WIDTH - 40;
  let containerH = QUIZ_HEIGHT - 40;


  fill(50, 50, 100, 180); // 半透明深藍色
  stroke(150, 200, 255); // 邊框淺藍色
  strokeWeight(3);
  rect(containerX, containerY, containerW, containerH, 15); // 圓角矩形
  pop();
}




function drawFeedbackScreen() {
  fill(feedbackColor);
  rect(0, 0, width, height);
 
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(60);
  text(feedbackMessage, width / 2, height / 2);
 
  feedbackTimer--;
  if (feedbackTimer <= 0) {
    nextQuestion();
  }
}


function drawResultScreen() {
  textAlign(CENTER, CENTER);
  fill(255);
 
  textSize(50);
  text('測驗結束！', QUIZ_WIDTH / 2 + offsetX, 150 + offsetY);
 
  textSize(36);
  text(`你的成績: ${score} / 3`, QUIZ_WIDTH / 2 + offsetX, 250 + offsetY);
 
  textSize(24);
  fill(200, 200, 0);
  text(getFeedbackText(), QUIZ_WIDTH / 2 + offsetX, 350 + offsetY);
 
  drawButton(restartButton);
}


// ---------------------------------
// 互動與輔助函數
// ---------------------------------


// 繪製按鈕 (含 hover 效果，包含文字顯示)
function drawButton(btn) {
  let isHover = isMouseOver(btn);
 
  push();
  if (isHover) {
    fill(100, 180, 255);
    stroke(255);
    strokeWeight(2);
    cursor(HAND);
  } else {
    fill(50, 100, 200, 200);
    noStroke();
  }
  rect(btn.x, btn.y, btn.w, btn.h, 10);
 
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(btn.text, btn.x, btn.y, btn.w, btn.h);
  pop();
}


// 檢查滑鼠是否在按鈕上
function isMouseOver(btn) {
  return (mouseX > btn.x && mouseX < btn.x + btn.w &&
          mouseY > btn.y && mouseY < btn.y + btn.h);
}


// 滑鼠點擊事件
function mousePressed() {
  cursor(ARROW);


  if (gameState === 'START') {
    if (isMouseOver(startButton)) {
      gameState = 'QUESTION';
    }
  } else if (gameState === 'QUESTION') {
    for (let btn of answerButtons) {
      if (isMouseOver(btn)) {
        checkAnswer(btn.option);
        break;
      }
    }
  } else if (gameState === 'RESULT') {
    if (isMouseOver(restartButton)) {
      startGame();
    }
  }
}


// ---------------------------------
// 互動視覺效果 (背景粒子)
// ---------------------------------


function setupParticles() {
  particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      vx: random(-0.5, 0.5),
      vy: random(-0.5, 0.5),
      r: random(2, 5),
      alpha: random(50, 150)
    });
  }
}


function drawParticles() {
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
   
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
   
    noStroke();
    fill(255, p.alpha);
    ellipse(p.x, p.y, p.r);
  }
}




