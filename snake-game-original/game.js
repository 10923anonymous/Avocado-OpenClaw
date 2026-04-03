"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const meadowBg = new Image();
let meadowBgReady = false;
meadowBg.onload = () => {
  meadowBgReady = true;
  draw();
};
meadowBg.onerror = () => {
  meadowBgReady = false;
  draw();
};
meadowBg.src = "assets/meadow-bg.svg";

let tileCount = 20;
const canvasSize = canvas.width; // assume square
let tileSize = canvasSize / tileCount;

// Color customization system
const DEFAULT_COLORS = {
  bg: "#020617",
  grid: "rgba(255, 255, 255, 0.16)",
  snakeHead: "#22c55e",
  snakeBody: "#16a34a",
  wall: "#f97316",
  aiRivals: [
    { head: "#a855f7", body: "#7c3aed" },
    { head: "#d946ef", body: "#a21caf" },
    { head: "#c084fc", body: "#9333ea" },
  ],
  aiObstacles: [
    { head: "#38bdf8", body: "#0284c7" },
    { head: "#fbbf24", body: "#ca8a04" },
    { head: "#f472b6", body: "#db2777" },
  ]
};

// Load colors from localStorage or use defaults
function loadCustomColors() {
  try {
    const stored = localStorage.getItem("snakeCustomColors");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.log("Failed to load custom colors:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_COLORS));
}

// Save colors to localStorage
function saveCustomColors(colors) {
  try {
    localStorage.setItem("snakeCustomColors", JSON.stringify(colors));
  } catch (e) {
    console.log("Failed to save custom colors:", e);
  }
}

// Reset colors to defaults
function resetColors() {
  customColors = JSON.parse(JSON.stringify(DEFAULT_COLORS));
  saveCustomColors(customColors);
  updateColorVariables();
  draw();
  updateColorPickerUI();
}

// Update color variables from customColors
let customColors = loadCustomColors();

let bgColor = customColors.bg;
let gridColor = customColors.grid;
let snakeHeadColor = customColors.snakeHead;
let snakeBodyColor = customColors.snakeBody;
let wallColor = customColors.wall;
let AI_RIVAL_PALETTE = customColors.aiRivals;
let AI_OBSTACLE_PALETTE = customColors.aiObstacles;

function updateColorVariables() {
  bgColor = customColors.bg;
  gridColor = customColors.grid;
  snakeHeadColor = customColors.snakeHead;
  snakeBodyColor = customColors.snakeBody;
  wallColor = customColors.wall;
  AI_RIVAL_PALETTE = customColors.aiRivals;
  AI_OBSTACLE_PALETTE = customColors.aiObstacles;
}

// Color picker UI elements
let colorPickerPanel = null;

function createColorPickerUI() {
  // Create color picker button
  const colorBtn = document.createElement("button");
  colorBtn.id = "colorPickerBtn";
  colorBtn.type = "button";
  colorBtn.className = "game-toggle";
  colorBtn.textContent = "🎨 Colors";
  colorBtn.style.marginTop = "10px";
  colorBtn.addEventListener("click", toggleColorPicker);
  
  // Insert after humans toggle
  const controlsSection = document.querySelector(".game-card");
  const canvasWrapper = document.querySelector(".canvas-wrapper");
  controlsSection.insertBefore(colorBtn, canvasWrapper);
  
  // Create color picker panel
  colorPickerPanel = document.createElement("div");
  colorPickerPanel.id = "colorPickerPanel";
  colorPickerPanel.className = "color-picker-panel hidden";
  colorPickerPanel.innerHTML = `
    <div class="color-section">
      <h3>Snake Colors</h3>
      <div class="color-row">
        <label>Head:</label>
        <input type="color" id="snakeHeadPicker" value="${customColors.snakeHead}">
      </div>
      <div class="color-row">
        <label>Body:</label>
        <input type="color" id="snakeBodyPicker" value="${customColors.snakeBody}">
      </div>
    </div>
    <div class="color-section">
      <h3>Environment</h3>
      <div class="color-row">
        <label>Background:</label>
        <input type="color" id="bgPicker" value="${customColors.bg}">
      </div>
      <div class="color-row">
        <label>Grid:</label>
        <input type="color" id="gridPicker" value="${customColors.grid.replace('rgba(', '').replace(', 255, 255, 0.16)', '').trim() || '#ffffff'}">
      </div>
      <div class="color-row">
        <label>Walls:</label>
        <input type="color" id="wallPicker" value="${customColors.wall}">
      </div>
    </div>
    <div class="color-section">
      <h3>AI Rivals</h3>
      <div class="color-row">
        <label>Rival 1 Head:</label>
        <input type="color" id="rival1HeadPicker" value="${customColors.aiRivals[0].head}">
      </div>
      <div class="color-row">
        <label>Rival 1 Body:</label>
        <input type="color" id="rival1BodyPicker" value="${customColors.aiRivals[0].body}">
      </div>
      <div class="color-row">
        <label>Rival 2 Head:</label>
        <input type="color" id="rival2HeadPicker" value="${customColors.aiRivals[1].head}">
      </div>
      <div class="color-row">
        <label>Rival 2 Body:</label>
        <input type="color" id="rival2BodyPicker" value="${customColors.aiRivals[1].body}">
      </div>
      <div class="color-row">
        <label>Rival 3 Head:</label>
        <input type="color" id="rival3HeadPicker" value="${customColors.aiRivals[2].head}">
      </div>
      <div class="color-row">
        <label>Rival 3 Body:</label>
        <input type="color" id="rival3BodyPicker" value="${customColors.aiRivals[2].body}">
      </div>
    </div>
    <div class="color-actions">
      <button type="button" id="resetColorsBtn" class="game-toggle">Reset to Default</button>
      <button type="button" id="closeColorsBtn" class="game-toggle">Close</button>
    </div>
  `;
  
  controlsSection.insertBefore(colorPickerPanel, canvasWrapper);
  
  // Add event listeners
  document.getElementById("snakeHeadPicker").addEventListener("input", (e) => {
    customColors.snakeHead = e.target.value;
    updateColorVariables();
    saveCustomColors(customColors);
    draw();
  });
  
  document.getElementById("snakeBodyPicker").addEventListener("input", (e) => {
    customColors.snakeBody = e.target.value;
    updateColorVariables();
    saveCustomColors(customColors);
    draw();
  });
  
  document.getElementById("bgPicker").addEventListener("input", (e) => {
    customColors.bg = e.target.value;
    updateColorVariables();
    saveCustomColors(customColors);
    draw();
  });
  
  document.getElementById("gridPicker").addEventListener("input", (e) => {
    const hex = e.target.value;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    customColors.grid = `rgba(${r}, ${g}, ${b}, 0.16)`;
    updateColorVariables();
    saveCustomColors(customColors);
    draw();
  });
  
  document.getElementById("wallPicker").addEventListener("input", (e) => {
    customColors.wall = e.target.value;
    updateColorVariables();
    saveCustomColors(customColors);
    draw();
  });
  
  // AI Rival color pickers
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`rival${i}HeadPicker`).addEventListener("input", (e) => {
      customColors.aiRivals[i-1].head = e.target.value;
      updateColorVariables();
      saveCustomColors(customColors);
      draw();
    });
    document.getElementById(`rival${i}BodyPicker`).addEventListener("input", (e) => {
      customColors.aiRivals[i-1].body = e.target.value;
      updateColorVariables();
      saveCustomColors(customColors);
      draw();
    });
  }
  
  document.getElementById("resetColorsBtn").addEventListener("click", resetColors);
  document.getElementById("closeColorsBtn").addEventListener("click", toggleColorPicker);
}


// Irregular wall templates (normalized [x, y]); placed randomly each round
const WALL_SHAPE_TEMPLATES = [
  // L-shape upper-left
  [
    [0.08, 0.12], [0.12, 0.12], [0.16, 0.12], [0.2, 0.12],
    [0.2, 0.16], [0.2, 0.2], [0.2, 0.24],
  ],
  // Blob center-right
  [
    [0.62, 0.4], [0.66, 0.4], [0.7, 0.4], [0.74, 0.4],
    [0.66, 0.44], [0.7, 0.44], [0.74, 0.44],
    [0.7, 0.48], [0.7, 0.52],
  ],
  // Zigzag lower area
  [
    [0.28, 0.68], [0.32, 0.68], [0.36, 0.68],
    [0.36, 0.72], [0.4, 0.72], [0.44, 0.72],
    [0.44, 0.76], [0.48, 0.76], [0.52, 0.76], [0.52, 0.8],
  ],
  // T-shape upper-right
  [
    [0.72, 0.1], [0.76, 0.1], [0.8, 0.1], [0.84, 0.1],
    [0.78, 0.14], [0.78, 0.18], [0.78, 0.22],
  ],
  // Small cluster mid-left
  [
    [0.12, 0.48], [0.16, 0.48], [0.14, 0.52], [0.18, 0.52], [0.16, 0.56],
  ],
  // Diagonal strip
  [
    [0.5, 0.2], [0.54, 0.26], [0.58, 0.32], [0.62, 0.38], [0.66, 0.44], [0.7, 0.5],
  ],
  // Corner block bottom-right
  [
    [0.78, 0.72], [0.82, 0.72], [0.86, 0.72],
    [0.78, 0.76], [0.82, 0.76], [0.78, 0.8],
  ],
];

const baseTickMs = 140;
const minTickMs = 70;
const tickStepMs = 6;

const scoreValueEl = document.getElementById("score-value");
const highScoreValueEl = document.getElementById("highscore-value");
const finalScoreEl = document.getElementById("finalScore");
const gameOverEl = document.getElementById("gameOver");
const restartButton = document.getElementById("restartButton");
const boardSizeInput = document.getElementById("boardSize");
const boardSizeValueEl = document.getElementById("boardSizeValue");
const wallCountInput = document.getElementById("wallCount");
const wallCountValueEl = document.getElementById("wallCountValue");
const aiRivalCountInput = document.getElementById("aiRivalCount");
const aiRivalCountValueEl = document.getElementById("aiRivalCountValue");
const aiObstacleCountInput = document.getElementById("aiObstacleCount");
const aiObstacleCountValueEl = document.getElementById("aiObstacleCountValue");
const humanSpeedInput = document.getElementById("humanSpeed");
const humanSpeedValueEl = document.getElementById("humanSpeedValue");
const humansToggleButton = document.getElementById("humansToggle");

let snake;
let direction;
let nextDirection;
/** @type {{ kind: "egg" | "human"; x: number; y: number }} */
let food;

// Snake poop system
/** @type {{ x: number; y: number; createdAt: number; decomposed: boolean }[]} */
let poops = [];
let poopSpawnTimeout = null;
const POOP_SPAWN_DELAY = 20000; // 20 seconds after eating
const POOP_DECOMPOSE_TIME = 29000; // 29 seconds total lifetime
const POOP_EAT_PENALTY = 3; // Score penalty for eating poop

let score;
let highScore = 0;
let isGameOver;
let loopId;
let tickMs = baseTickMs;
let wallCount = 3;
let aiRivalCount = 1;
let aiObstacleCount = 2;
let humansEnabled = true;
let activeWallShapes = [];
/** @type {{ body: {x:number,y:number}[], direction: {x:number,y:number}, competesForFood: boolean, headColor: string, bodyColor: string }[]} */
let aiSnakes = [];

const DIRECTIONS = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];

function translateShape(shape, tx, ty) {
  return shape.map(([nx, ny]) => [nx + tx, ny + ty]);
}

function randomPlacementForShape(shape) {
  const minX = Math.min(...shape.map((p) => p[0]));
  const maxX = Math.max(...shape.map((p) => p[0]));
  const minY = Math.min(...shape.map((p) => p[1]));
  const maxY = Math.max(...shape.map((p) => p[1]));
  const margin = 0.02;
  const txMin = margin - minX;
  const txMax = 1 - margin - maxX;
  const tyMin = margin - minY;
  const tyMax = 1 - margin - maxY;
  if (txMin > txMax || tyMin > tyMax) {
    return null;
  }
  const tx = txMin + Math.random() * (txMax - txMin);
  const ty = tyMin + Math.random() * (tyMax - tyMin);
  return translateShape(shape, tx, ty);
}

function normShapeToTiles(shape) {
  const tiles = [];
  for (const [nx, ny] of shape) {
    const x = Math.floor(nx * tileCount);
    const y = Math.floor(ny * tileCount);
    if (x >= 0 && x < tileCount && y >= 0 && y < tileCount) {
      tiles.push({ x, y });
    }
  }
  return tiles;
}

function regenerateWallLayouts() {
  activeWallShapes = [];
  if (wallCount <= 0) {
    return;
  }

  const startX = Math.floor(tileCount / 2);
  const startY = Math.floor(tileCount / 2);
  const spawnKeys = new Set([
    `${startX},${startY}`,
    `${startX - 1},${startY}`,
    `${startX - 2},${startY}`,
  ]);

  const usedTiles = new Set();

  for (let w = 0; w < wallCount; w++) {
    const template =
      WALL_SHAPE_TEMPLATES[Math.floor(Math.random() * WALL_SHAPE_TEMPLATES.length)];
    let placed = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const candidate = randomPlacementForShape(template);
      if (!candidate) continue;
      const tiles = normShapeToTiles(candidate);
      if (tiles.length === 0) continue;
      let conflicts = false;
      for (const { x, y } of tiles) {
        const key = `${x},${y}`;
        if (usedTiles.has(key) || spawnKeys.has(key)) {
          conflicts = true;
          break;
        }
      }
      if (!conflicts) {
        activeWallShapes.push(candidate);
        for (const { x, y } of tiles) {
          usedTiles.add(`${x},${y}`);
        }
        placed = true;
        break;
      }
    }
  }
}

function updateBoardSize(newTileCount) {
  const size = Math.max(5, Math.min(60, Math.floor(newTileCount)));
  if (!Number.isFinite(size) || size === tileCount) {
    return;
  }
  tileCount = size;
  tileSize = canvasSize / tileCount;
  regenerateWallLayouts();
  resetGameState();
  draw();
  startGameLoop();
}

function wallKeySet() {
  const keys = new Set();
  for (const { x, y } of getWallTiles()) {
    keys.add(`${x},${y}`);
  }
  return keys;
}

function segmentKey(p) {
  return `${p.x},${p.y}`;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function trySpawnSnakeSegments(length, forbidden) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const horizontal = Math.random() < 0.5;
    const headX = Math.floor(Math.random() * tileCount);
    const headY = Math.floor(Math.random() * tileCount);
    const dir = horizontal
      ? Math.random() < 0.5
        ? { x: 1, y: 0 }
        : { x: -1, y: 0 }
      : Math.random() < 0.5
        ? { x: 0, y: 1 }
        : { x: 0, y: -1 };

    const body = [{ x: headX, y: headY }];
    let ok = true;
    for (let s = 1; s < length; s++) {
      const prev = body[body.length - 1];
      const nx = prev.x - dir.x;
      const ny = prev.y - dir.y;
      if (nx < 0 || nx >= tileCount || ny < 0 || ny >= tileCount) {
        ok = false;
        break;
      }
      body.push({ x: nx, y: ny });
    }
    if (!ok) continue;

    let clash = false;
    for (const p of body) {
      if (forbidden.has(segmentKey(p))) {
        clash = true;
        break;
      }
    }
    if (clash) continue;

    return { body, direction: { x: dir.x, y: dir.y } };
  }
  return null;
}

function initAISnakes() {
  const walls = wallKeySet();
  const forbidden = new Set(walls);
  for (const p of snake) {
    forbidden.add(segmentKey(p));
  }

  aiSnakes = [];

  const rivals = Math.max(0, Math.min(3, Math.floor(aiRivalCount)));
  for (let r = 0; r < rivals; r++) {
    const rivalSpawn = trySpawnSnakeSegments(3, forbidden);
    if (!rivalSpawn) {
      break;
    }
    for (const p of rivalSpawn.body) {
      forbidden.add(segmentKey(p));
    }
    const pal = AI_RIVAL_PALETTE[r % AI_RIVAL_PALETTE.length];
    aiSnakes.push({
      body: rivalSpawn.body,
      direction: rivalSpawn.direction,
      competesForFood: true,
      headColor: pal.head,
      bodyColor: pal.body,
    });
  }

  const obstacles = Math.max(0, Math.min(3, Math.floor(aiObstacleCount)));
  for (let o = 0; o < obstacles; o++) {
    const obsSpawn = trySpawnSnakeSegments(4, forbidden);
    if (!obsSpawn) {
      break;
    }
    for (const p of obsSpawn.body) {
      forbidden.add(segmentKey(p));
    }
    const pal = AI_OBSTACLE_PALETTE[o % AI_OBSTACLE_PALETTE.length];
    aiSnakes.push({
      body: obsSpawn.body,
      direction: obsSpawn.direction,
      competesForFood: false,
      headColor: pal.head,
      bodyColor: pal.body,
    });
  }
}

function resetGameState() {
  score = 0;
  scoreValueEl.textContent = String(score);
  isGameOver = false;
  tickMs = baseTickMs;

  const startX = Math.floor(tileCount / 2);
  const startY = Math.floor(tileCount / 2);
  snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  // Clear poops and poop timeout
  poops = [];
  if (poopSpawnTimeout) {
    clearTimeout(poopSpawnTimeout);
    poopSpawnTimeout = null;
  }

  initAISnakes();
  food = randomFoodPosition();
}

function startGameLoop() {
  if (loopId) {
    clearInterval(loopId);
  }
  loopId = setInterval(tick, tickMs);
}

function tick() {
  if (isGameOver) return;

  direction = validateNextDirection(direction, nextDirection);
  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (isCollision(newHead)) {
    endGame({ showPopup: false });
    playDeathAnimation(showGameOverPopup);
    return;
  }

  const ateFood = newHead.x === food.x && newHead.y === food.y;
  const atePoop = checkPoopCollision(newHead);

  snake.unshift(newHead);
  if (ateFood) {
    const points = food.kind === "human" ? 4 : 1;
    score += points;
    scoreValueEl.textContent = String(score);
    food = randomFoodPosition();

    // Schedule poop spawn after 20 seconds
    schedulePoopSpawn();

    const nextTickMs = Math.max(minTickMs, tickMs - tickStepMs);
    if (nextTickMs !== tickMs) {
      tickMs = nextTickMs;
      startGameLoop();
    }
  } else if (atePoop) {
    // Eating poop: snake grows (don't pop), but lose points
    score = Math.max(0, score - POOP_EAT_PENALTY);
    scoreValueEl.textContent = String(score);
    // Poop is removed in checkPoopCollision
  } else {
    snake.pop();
  }

  moveAllAIs();
  moveHumanPickup();

  draw();
}

function getWallTiles() {
  const tiles = [];
  const seen = new Set();
  for (const shape of activeWallShapes) {
    for (const [nx, ny] of shape) {
      const x = Math.floor(nx * tileCount);
      const y = Math.floor(ny * tileCount);
      if (x >= 0 && x < tileCount && y >= 0 && y < tileCount) {
        const key = `${x},${y}`;
        if (!seen.has(key)) {
          seen.add(key);
          tiles.push({ x, y });
        }
      }
    }
  }
  return tiles;
}

function isCollision(head) {
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return true;
  }
  const wallTiles = getWallTiles();
  for (let i = 0; i < wallTiles.length; i++) {
    if (wallTiles[i].x === head.x && wallTiles[i].y === head.y) {
      return true;
    }
  }
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }
  for (let a = 0; a < aiSnakes.length; a++) {
    for (let s = 0; s < aiSnakes[a].body.length; s++) {
      const p = aiSnakes[a].body[s];
      if (p.x === head.x && p.y === head.y) {
        return true;
      }
    }
  }
  // Check collision with poop (treat as obstacle)
  if (isPoopAt(head.x, head.y)) {
    return true;
  }
  return false;
}

function aiMoveValid(newHead, willEat, ctx) {
  const { player, aiBodies, movingIndex } = ctx;
  const ai = aiSnakes[movingIndex];
  if (!ai.competesForFood && newHead.x === food.x && newHead.y === food.y) {
    return false;
  }
  if (newHead.x < 0 || newHead.x >= tileCount || newHead.y < 0 || newHead.y >= tileCount) {
    return false;
  }
  const wallTiles = getWallTiles();
  for (let i = 0; i < wallTiles.length; i++) {
    if (wallTiles[i].x === newHead.x && wallTiles[i].y === newHead.y) {
      return false;
    }
  }
  for (let i = 0; i < player.length; i++) {
    if (player[i].x === newHead.x && player[i].y === newHead.y) {
      return false;
    }
  }
  for (let i = 0; i < aiBodies.length; i++) {
    const body = aiBodies[i];
    for (let s = 0; s < body.length; s++) {
      if (i === movingIndex && !willEat && s === body.length - 1) {
        continue;
      }
      const p = body[s];
      if (p.x === newHead.x && p.y === newHead.y) {
        return false;
      }
    }
  }
  return true;
}

function bfsFirstStep(start, goal, blockedKeys) {
  if (start.x === goal.x && start.y === goal.y) {
    return null;
  }
  const queue = [];
  const visited = new Set([segmentKey(start)]);

  for (const d of DIRECTIONS) {
    const nx = start.x + d.x;
    const ny = start.y + d.y;
    if (nx < 0 || nx >= tileCount || ny < 0 || ny >= tileCount) {
      continue;
    }
    const key = segmentKey({ x: nx, y: ny });
    const onGoal = nx === goal.x && ny === goal.y;
    if (blockedKeys.has(key) && !onGoal) {
      continue;
    }
    if (onGoal) {
      return d;
    }
    visited.add(key);
    queue.push({ x: nx, y: ny, firstDir: d });
  }

  while (queue.length) {
    const cur = queue.shift();
    for (const d of DIRECTIONS) {
      const nx = cur.x + d.x;
      const ny = cur.y + d.y;
      if (nx < 0 || nx >= tileCount || ny < 0 || ny >= tileCount) {
        continue;
      }
      const key = segmentKey({ x: nx, y: ny });
      if (visited.has(key)) {
        continue;
      }
      const onGoal = nx === goal.x && ny === goal.y;
      if (blockedKeys.has(key) && !onGoal) {
        continue;
      }
      if (onGoal) {
        return cur.firstDir;
      }
      visited.add(key);
      queue.push({ x: nx, y: ny, firstDir: cur.firstDir });
    }
  }
  return null;
}

function pickObstacleDirection(ai, ctx) {
  const head = ai.body[0];
  const cur = ai.direction;
  const preferred = DIRECTIONS.filter((d) => !(d.x === -cur.x && d.y === -cur.y));
  shuffleInPlace(preferred);
  for (let i = 0; i < preferred.length; i++) {
    const d = preferred[i];
    const nh = { x: head.x + d.x, y: head.y + d.y };
    if (aiMoveValid(nh, false, ctx)) {
      return d;
    }
  }
  const rev = { x: -cur.x, y: -cur.y };
  const nhRev = { x: head.x + rev.x, y: head.y + rev.y };
  if (aiMoveValid(nhRev, false, ctx)) {
    return rev;
  }
  return cur;
}

function pickFallbackDirection(ai, ctx) {
  const head = ai.body[0];
  const order = shuffleInPlace([...DIRECTIONS]);
  for (let i = 0; i < order.length; i++) {
    const d = order[i];
    const nh = { x: head.x + d.x, y: head.y + d.y };
    const willEat = ai.competesForFood && nh.x === food.x && nh.y === food.y;
    if (aiMoveValid(nh, willEat, ctx)) {
      return d;
    }
  }
  return null;
}

function moveAllAIs() {
  const playerSnapshot = snake.map((p) => ({ x: p.x, y: p.y }));
  const aiBodies = aiSnakes.map((a) => a.body.map((p) => ({ x: p.x, y: p.y })));

  for (let idx = 0; idx < aiSnakes.length; idx++) {
    const ai = aiSnakes[idx];
    const head = ai.body[0];
    const ctx = { player: playerSnapshot, aiBodies, movingIndex: idx };

    let chosenDir = null;
    if (ai.competesForFood) {
      const blocked = wallKeySet();
      for (let p = 0; p < playerSnapshot.length; p++) {
        blocked.add(segmentKey(playerSnapshot[p]));
      }
      for (let j = 0; j < aiBodies.length; j++) {
        for (let s = 0; s < aiBodies[j].length; s++) {
          blocked.add(segmentKey(aiBodies[j][s]));
        }
      }
      chosenDir = bfsFirstStep(head, food, blocked);
    }
    if (!chosenDir) {
      chosenDir = ai.competesForFood ? pickFallbackDirection(ai, ctx) : pickObstacleDirection(ai, ctx);
    }
    if (!chosenDir) {
      chosenDir = ai.direction;
    }

    let newHead = { x: head.x + chosenDir.x, y: head.y + chosenDir.y };
    let willEat = ai.competesForFood && newHead.x === food.x && newHead.y === food.y;

    if (!aiMoveValid(newHead, willEat, ctx)) {
      const order = shuffleInPlace([...DIRECTIONS]);
      let found = false;
      for (let o = 0; o < order.length; o++) {
        const d = order[o];
        const nh = { x: head.x + d.x, y: head.y + d.y };
        const we = ai.competesForFood && nh.x === food.x && nh.y === food.y;
        if (aiMoveValid(nh, we, ctx)) {
          chosenDir = d;
          newHead = nh;
          willEat = we;
          found = true;
          break;
        }
      }
      if (!found) {
        aiBodies[idx] = ai.body.map((p) => ({ x: p.x, y: p.y }));
        continue;
      }
    }

    ai.direction = chosenDir;
    ai.body.unshift(newHead);
    if (willEat) {
      food = randomFoodPosition();
    } else {
      ai.body.pop();
    }
    aiBodies[idx] = ai.body.map((p) => ({ x: p.x, y: p.y }));
  }
}

function isCellOccupiedByAnySnake(x, y) {
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === x && snake[i].y === y) {
      return true;
    }
  }
  for (let a = 0; a < aiSnakes.length; a++) {
    for (let s = 0; s < aiSnakes[a].body.length; s++) {
      const p = aiSnakes[a].body[s];
      if (p.x === x && p.y === y) {
        return true;
      }
    }
  }
  return false;
}

function humanCellValid(x, y) {
  if (x < 0 || x >= tileCount || y < 0 || y >= tileCount) {
    return false;
  }
  const wallTiles = getWallTiles();
  for (let i = 0; i < wallTiles.length; i++) {
    if (wallTiles[i].x === x && wallTiles[i].y === y) {
      return false;
    }
  }
  return !isCellOccupiedByAnySnake(x, y);
}

function moveHumanPickup() {
  if (food.kind !== "human") {
    return;
  }
  const steps = Math.max(0, Math.min(3, Math.floor(window.humanSpeed || 1)));
  for (let step = 0; step < steps; step++) {
    const order = shuffleInPlace([...DIRECTIONS]);
    let moved = false;
    for (let i = 0; i < order.length; i++) {
      const d = order[i];
      const nx = food.x + d.x;
      const ny = food.y + d.y;
      if (humanCellValid(nx, ny)) {
        food.x = nx;
        food.y = ny;
        moved = true;
        break;
      }
    }
    if (!moved) {
      break;
    }
  }
}

function randomFoodPosition() {
  const wallTiles = getWallTiles();
  const isWall = (x, y) => wallTiles.some((w) => w.x === x && w.y === y);
  const kind = humansEnabled && Math.random() < 0.5 ? "human" : "egg";
  while (true) {
    const x = Math.floor(Math.random() * tileCount);
    const y = Math.floor(Math.random() * tileCount);
    if (isWall(x, y) || isCellOccupiedByAnySnake(x, y) || isPoopAt(x, y)) {
      continue;
    }
    return { kind, x, y };
  }
}

// Poop system functions
function schedulePoopSpawn() {
  console.log("Poop scheduled - will spawn at tail position in", POOP_SPAWN_DELAY, "ms");
  
  // Schedule poop to spawn after 20 seconds at current tail position
  setTimeout(() => {
    spawnPoop();
  }, POOP_SPAWN_DELAY);
}

function spawnPoop() {
  if (isGameOver) {
    console.log("Poop spawn cancelled - game is over");
    return;
  }
  
  // Get tail position at time of spawning (20 seconds after eating)
  const tail = snake[snake.length - 1];
  const poop = {
    x: tail.x,
    y: tail.y,
    createdAt: Date.now(),
    decomposed: false
  };
  poops.push(poop);
  console.log("Poop spawned at tail position:", tail.x, tail.y, "Total poops:", poops.length);
  
  // Schedule decomposition after 29 seconds
  setTimeout(() => {
    decomposePoop(poop);
  }, POOP_DECOMPOSE_TIME);
  
  draw();
}

function decomposePoop(poop) {
  const index = poops.indexOf(poop);
  if (index > -1) {
    poops.splice(index, 1);
    if (!isGameOver) {
      draw();
    }
  }
}

function isPoopAt(x, y) {
  return poops.some(p => p.x === x && p.y === y);
}

function checkPoopCollision(head) {
  const index = poops.findIndex(p => p.x === head.x && p.y === head.y);
  if (index > -1) {
    // Remove the eaten poop
    poops.splice(index, 1);
    return true;
  }
  return false;
}

function drawPoops() {
  for (const poop of poops) {
    drawPoop(poop.x, poop.y);
  }
}

function drawPoop(tileX, tileY) {
  const x = tileX * tileSize;
  const y = tileY * tileSize;
  const cx = x + tileSize / 2;
  const cy = y + tileSize / 2;
  const r = tileSize * 0.35;
  
  // Draw poop emoji style
  ctx.fillStyle = "#5d4037";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  
  // Add some detail
  ctx.fillStyle = "#3e2723";
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.2, cy + r * 0.1, r * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  drawBackground();
  drawWalls();
  drawAISnakes();
  drawSnake();
  drawPoops();
  drawPickup();
}

function drawCoverImage(targetCtx, img, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) {
    return;
  }
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const ox = (w - dw) / 2;
  const oy = (h - dh) / 2;
  targetCtx.drawImage(img, ox, oy, dw, dh);
}

function drawBackground() {
  if (meadowBgReady && meadowBg.naturalWidth > 0) {
    drawCoverImage(ctx, meadowBg, canvasSize, canvasSize);
    ctx.fillStyle = "rgba(0, 28, 10, 0.12)";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  }

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let i = 1; i < tileCount; i++) {
    const pos = i * tileSize;
    ctx.beginPath();
    ctx.moveTo(pos + 0.5, 0);
    ctx.lineTo(pos + 0.5, canvasSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos + 0.5);
    ctx.lineTo(canvasSize, pos + 0.5);
    ctx.stroke();
  }
}

function drawWalls() {
  const wallTiles = getWallTiles();
  ctx.fillStyle = wallColor;
  for (const { x, y } of wallTiles) {
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  }
}

function drawAISnakes() {
  for (let a = 0; a < aiSnakes.length; a++) {
    const ai = aiSnakes[a];
    for (let i = 0; i < ai.body.length; i++) {
      const segment = ai.body[i];
      const isHead = i === 0;
      ctx.fillStyle = isHead ? ai.headColor : ai.bodyColor;
      ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
    }
  }
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    const isHead = i === 0;
    ctx.fillStyle = isHead ? snakeHeadColor : snakeBodyColor;
    ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
  }
}

function drawEgg(tileX, tileY) {
  const px = tileX * tileSize;
  const py = tileY * tileSize;
  const pad = tileSize * 0.1;
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2 + tileSize * 0.02;
  const rx = (tileSize - pad * 2) * 0.38;
  const ry = (tileSize - pad * 2) * 0.48;

  ctx.save();
  const grd = ctx.createRadialGradient(cx - rx * 0.3, cy - ry * 0.35, 0, cx, cy, tileSize * 0.6);
  grd.addColorStop(0, "#fffef5");
  grd.addColorStop(0.55, "#f5f0dc");
  grd.addColorStop(1, "#e8dcc8");
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.strokeStyle = "rgba(90, 70, 50, 0.35)";
  ctx.lineWidth = Math.max(1, tileSize * 0.06);
  ctx.stroke();
  ctx.restore();
}

function drawHuman(tileX, tileY) {
  const px = tileX * tileSize;
  const py = tileY * tileSize;
  const s = tileSize;
  const cx = px + s * 0.5;
  const headR = s * 0.14;
  const neckY = py + s * 0.38;
  const hipY = py + s * 0.62;
  const footY = py + s * 0.88;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = Math.max(1.2, s * 0.08);

  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(cx - s * 0.12, py + s * 0.4, s * 0.24, s * 0.22);
  ctx.strokeStyle = "#1e3a5f";
  ctx.strokeRect(cx - s * 0.12, py + s * 0.4, s * 0.24, s * 0.22);

  ctx.strokeStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(cx, neckY);
  ctx.lineTo(cx, hipY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - s * 0.22, py + s * 0.46);
  ctx.lineTo(cx + s * 0.22, py + s * 0.46);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, hipY);
  ctx.lineTo(cx - s * 0.18, footY);
  ctx.moveTo(cx, hipY);
  ctx.lineTo(cx + s * 0.18, footY);
  ctx.stroke();

  ctx.fillStyle = "#fecaca";
  ctx.beginPath();
  ctx.arc(cx, neckY - headR * 0.2, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1e293b";
  ctx.stroke();

  ctx.restore();
}

function drawPickup() {
  if (food.kind === "egg") {
    drawEgg(food.x, food.y);
  } else {
    drawHuman(food.x, food.y);
  }
}

function playDeathAnimation(onComplete) {
  const startSnake = snake.map((segment) => ({ x: segment.x, y: segment.y }));
  const duration = 600; // ms
  let startTime = null;

  function frame(timestamp) {
    if (startTime === null) {
      startTime = timestamp;
    }
    const elapsed = timestamp - startTime;
    const t = Math.min(elapsed / duration, 1);

    const scale = 1 - 0.6 * t;
    const alpha = 1 - t;

    drawBackground();
    drawWalls();
    drawAISnakes();
    drawPickup();

    ctx.save();
    ctx.globalAlpha = alpha;

    for (let i = 0; i < startSnake.length; i++) {
      const segment = startSnake[i];
      const isHead = i === 0;
      const baseSize = tileSize * scale;
      const offset = (tileSize - baseSize) / 2;

      ctx.fillStyle = isHead ? snakeHeadColor : snakeBodyColor;
      ctx.fillRect(
        segment.x * tileSize + offset,
        segment.y * tileSize + offset,
        baseSize,
        baseSize
      );
    }

    ctx.restore();

    if (t < 1) {
      requestAnimationFrame(frame);
    } else if (onComplete) {
      onComplete();
    }
  }

  requestAnimationFrame(frame);
}

function handleKeyDown(event) {
  const key = event.key;
  let newDir = null;

  if (key === "Enter" && isGameOver) {
    restartGame();
    return;
  }

  if (key === "ArrowUp" || key === "w" || key === "W") {
    newDir = { x: 0, y: -1 };
  } else if (key === "ArrowDown" || key === "s" || key === "S") {
    newDir = { x: 0, y: 1 };
  } else if (key === "ArrowLeft" || key === "a" || key === "A") {
    newDir = { x: -1, y: 0 };
  } else if (key === "ArrowRight" || key === "d" || key === "D") {
    newDir = { x: 1, y: 0 };
  }

  if (!newDir) return;
  nextDirection = newDir;
}

function validateNextDirection(currentDir, candidateDir) {
  if (!candidateDir) return currentDir;
  if (currentDir.x === -candidateDir.x && currentDir.y === -candidateDir.y) {
    return currentDir;
  }
  return candidateDir;
}

function endGame(options = {}) {
  const { showPopup = true } = options;
  isGameOver = true;
  clearInterval(loopId);
  if (score > highScore) {
    highScore = score;
    highScoreValueEl.textContent = String(highScore);
    try {
      window.localStorage.setItem("snakeHighScore", String(highScore));
    } catch (e) {
      // ignore storage errors
    }
  }
  finalScoreEl.textContent = String(score);
  if (showPopup) {
    showGameOverPopup();
  }
}

function showGameOverPopup() {
  finalScoreEl.textContent = String(score);
  gameOverEl.classList.remove("hidden");
}

function restartGame() {
  gameOverEl.classList.add("hidden");
  regenerateWallLayouts();
  resetGameState();
  draw();
  startGameLoop();
}

function toggleColorPicker() {
  if (!colorPickerPanel) {
    createColorPickerUI();
  }
  colorPickerPanel.classList.toggle("hidden");
}

function updateColorPickerUI() {
  if (!colorPickerPanel) return;
  document.getElementById("snakeHeadPicker").value = customColors.snakeHead;
  document.getElementById("snakeBodyPicker").value = customColors.snakeBody;
  document.getElementById("bgPicker").value = customColors.bg;
  const gridMatch = customColors.grid.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (gridMatch) {
    const r = parseInt(gridMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(gridMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(gridMatch[3]).toString(16).padStart(2, '0');
    document.getElementById("gridPicker").value = `#${r}${g}${b}`;
  }
  document.getElementById("wallPicker").value = customColors.wall;
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`rival${i}HeadPicker`).value = customColors.aiRivals[i-1].head;
    document.getElementById(`rival${i}BodyPicker`).value = customColors.aiRivals[i-1].body;
  }
}

function updateHumansToggleUI() {
  if (!humansToggleButton) {
    return;
  }
  humansToggleButton.textContent = humansEnabled ? "Humans: on" : "Humans: off";
  humansToggleButton.classList.toggle("game-toggle--on", humansEnabled);
  humansToggleButton.classList.toggle("game-toggle--off", !humansEnabled);
  if (humanSpeedInput) {
    humanSpeedInput.disabled = !humansEnabled;
  }
}

function syncPickupWhenHumansDisabled() {
  if (!humansEnabled && food.kind === "human") {
    food = randomFoodPosition();
  }
}

function init() {
  try {
    const stored = window.localStorage.getItem("snakeHighScore");
    if (stored != null) {
      const parsed = Number.parseInt(stored, 10);
      if (Number.isFinite(parsed) && parsed >= 0) {
        highScore = parsed;
      }
    }
  } catch (e) {
    highScore = 0;
  }
  highScoreValueEl.textContent = String(highScore);
  window.humanSpeed = 1;
  updateHumansToggleUI();

  regenerateWallLayouts();
  resetGameState();
  draw();
  startGameLoop();

  if (boardSizeInput && boardSizeValueEl) {
    boardSizeInput.value = String(tileCount);
    boardSizeValueEl.textContent = `${tileCount}×${tileCount}`;

    boardSizeInput.addEventListener("input", (event) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isFinite(value)) return;
      updateBoardSize(value);
      boardSizeInput.value = String(tileCount);
      boardSizeValueEl.textContent = `${tileCount}×${tileCount}`;
    });
  }

  if (wallCountInput && wallCountValueEl) {
    wallCountInput.value = String(wallCount);
    wallCountValueEl.textContent = String(wallCount);

    wallCountInput.addEventListener("input", (event) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isFinite(value)) return;
      wallCount = Math.max(0, Math.min(7, value));
      wallCountInput.value = String(wallCount);
      wallCountValueEl.textContent = String(wallCount);
      regenerateWallLayouts();
      if (!isGameOver) {
        food = randomFoodPosition();
      }
      draw();
    });
  }

  if (aiRivalCountInput && aiRivalCountValueEl) {
    aiRivalCountInput.value = String(aiRivalCount);
    aiRivalCountValueEl.textContent = String(aiRivalCount);

    aiRivalCountInput.addEventListener("input", (event) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isFinite(value)) return;
      aiRivalCount = Math.max(0, Math.min(3, value));
      aiRivalCountInput.value = String(aiRivalCount);
      aiRivalCountValueEl.textContent = String(aiRivalCount);
      if (!isGameOver) {
        initAISnakes();
        food = randomFoodPosition();
      }
      draw();
    });
  }

  if (aiObstacleCountInput && aiObstacleCountValueEl) {
    aiObstacleCountInput.value = String(aiObstacleCount);
    aiObstacleCountValueEl.textContent = String(aiObstacleCount);

    aiObstacleCountInput.addEventListener("input", (event) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isFinite(value)) return;
      aiObstacleCount = Math.max(0, Math.min(3, value));
      aiObstacleCountInput.value = String(aiObstacleCount);
      aiObstacleCountValueEl.textContent = String(aiObstacleCount);
      if (!isGameOver) {
        initAISnakes();
        food = randomFoodPosition();
      }
      draw();
    });
  }

  if (humanSpeedInput && humanSpeedValueEl) {
    humanSpeedInput.value = "1";
    humanSpeedValueEl.textContent = "1×";

    humanSpeedInput.addEventListener("input", (event) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isFinite(value)) return;
      const clamped = Math.max(0, Math.min(3, value));
      window.humanSpeed = clamped;
      humanSpeedInput.value = String(clamped);
      humanSpeedValueEl.textContent = `${clamped}×`;
    });
  }

  if (humansToggleButton) {
    humansToggleButton.addEventListener("click", () => {
      humansEnabled = !humansEnabled;
      updateHumansToggleUI();
      syncPickupWhenHumansDisabled();
      draw();
    });
  }
}

window.addEventListener("keydown", handleKeyDown);
restartButton.addEventListener("click", restartGame);

window.updateBoardSize = updateBoardSize;

init();

