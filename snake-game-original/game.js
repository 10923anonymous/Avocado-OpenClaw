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

// Default colors (used for reset)
const DEFAULT_COLORS = {
  snakeHead: "#22c55e",
  snakeBody: "#16a34a",
  wall: "#f97316",
  eggFood: "#f5f0dc",
  humanFood: "#3b82f6",
  aiRival1Head: "#a855f7",
  aiRival1Body: "#7c3aed",
  aiRival2Head: "#d946ef",
  aiRival2Body: "#a21caf",
  aiRival3Head: "#c084fc",
  aiRival3Body: "#9333ea",
  aiObs1Head: "#38bdf8",
  aiObs1Body: "#0284c7",
  aiObs2Head: "#fbbf24",
  aiObs2Body: "#ca8a04",
  aiObs3Head: "#f472b6",
  aiObs3Body: "#db2777",
};

// Current colors (can be customized)
let snakeHeadColor = DEFAULT_COLORS.snakeHead;
let snakeBodyColor = DEFAULT_COLORS.snakeBody;
let wallColor = DEFAULT_COLORS.wall;
let eggFoodColor = DEFAULT_COLORS.eggFood;
let humanFoodColor = DEFAULT_COLORS.humanFood;

const bgColor = "#020617";
const gridColor = "rgba(255, 255, 255, 0.16)";

const AI_RIVAL_PALETTE = [
  { head: DEFAULT_COLORS.aiRival1Head, body: DEFAULT_COLORS.aiRival1Body },
  { head: DEFAULT_COLORS.aiRival2Head, body: DEFAULT_COLORS.aiRival2Body },
  { head: DEFAULT_COLORS.aiRival3Head, body: DEFAULT_COLORS.aiRival3Body },
];
const AI_OBSTACLE_PALETTE = [
  { head: DEFAULT_COLORS.aiObs1Head, body: DEFAULT_COLORS.aiObs1Body },
  { head: DEFAULT_COLORS.aiObs2Head, body: DEFAULT_COLORS.aiObs2Body },
  { head: DEFAULT_COLORS.aiObs3Head, body: DEFAULT_COLORS.aiObs3Body },
];

// Background settings
let backgroundMode = "meadow"; // "meadow", "solid", "gradient"
let bgColor1 = "#020617";
let bgColor2 = "#1e293b";

// Color presets
const COLOR_PRESETS = {
  classic: {
    snakeHead: "#22c55e", snakeBody: "#16a34a", wall: "#f97316",
    eggFood: "#f5f0dc", humanFood: "#3b82f6",
    aiRival1Head: "#a855f7", aiRival1Body: "#7c3aed",
    aiRival2Head: "#d946ef", aiRival2Body: "#a21caf",
    aiRival3Head: "#c084fc", aiRival3Body: "#9333ea",
    aiObs1Head: "#38bdf8", aiObs1Body: "#0284c7",
    aiObs2Head: "#fbbf24", aiObs2Body: "#ca8a04",
    aiObs3Head: "#f472b6", aiObs3Body: "#db2777",
  },
  neon: {
    snakeHead: "#00ff00", snakeBody: "#00cc00", wall: "#ff00ff",
    eggFood: "#ffff00", humanFood: "#00ffff",
    aiRival1Head: "#ff00ff", aiRival1Body: "#cc00cc",
    aiRival2Head: "#ff0080", aiRival2Body: "#cc0066",
    aiRival3Head: "#ff80ff", aiRival3Body: "#cc66cc",
    aiObs1Head: "#00ffff", aiObs1Body: "#00cccc",
    aiObs2Head: "#ffff00", aiObs2Body: "#cccc00",
    aiObs3Head: "#ff8000", aiObs3Body: "#cc6600",
  },
  retro: {
    snakeHead: "#00ff41", snakeBody: "#00cc33", wall: "#ff3333",
    eggFood: "#ffff33", humanFood: "#3333ff",
    aiRival1Head: "#ff33ff", aiRival1Body: "#cc33cc",
    aiRival2Head: "#ff6633", aiRival2Body: "#cc6633",
    aiRival3Head: "#ff99ff", aiRival3Body: "#cc99cc",
    aiObs1Head: "#33ffff", aiObs1Body: "#33cccc",
    aiObs2Head: "#ffff33", aiObs2Body: "#cccc33",
    aiObs3Head: "#ff9933", aiObs3Body: "#cc9933",
  },
  ocean: {
    snakeHead: "#20b2aa", snakeBody: "#008b8b", wall: "#4682b4",
    eggFood: "#f0e68c", humanFood: "#1e90ff",
    aiRival1Head: "#4169e1", aiRival1Body: "#0000cd",
    aiRival2Head: "#00ced1", aiRival2Body: "#20b2aa",
    aiRival3Head: "#87ceeb", aiRival3Body: "#6495ed",
    aiObs1Head: "#48d1cc", aiObs1Body: "#40e0d0",
    aiObs2Head: "#b0e0e6", aiObs2Body: "#add8e6",
    aiObs3Head: "#5f9ea0", aiObs3Body: "#008b8b",
  },
  fire: {
    snakeHead: "#ff4500", snakeBody: "#ff6347", wall: "#8b0000",
    eggFood: "#ffd700", humanFood: "#ff8c00",
    aiRival1Head: "#dc143c", aiRival1Body: "#b22222",
    aiRival2Head: "#ff1493", aiRival2Body: "#c71585",
    aiRival3Head: "#ff69b4", aiRival3Body: "#db7093",
    aiObs1Head: "#ffa500", aiObs1Body: "#ff8c00",
    aiObs2Head: "#ffd700", aiObs2Body: "#daa520",
    aiObs3Head: "#ff6347", aiObs3Body: "#ff4500",
  },
  black: {
    snakeHead: "#1a1a1a", snakeBody: "#0d0d0d", wall: "#333333",
    eggFood: "#f5f5f5", humanFood: "#4a4a4a",
    aiRival1Head: "#2d2d2d", aiRival1Body: "#1f1f1f",
    aiRival2Head: "#3d3d3d", aiRival2Body: "#2a2a2a",
    aiRival3Head: "#4d4d4d", aiRival3Body: "#363636",
    aiObs1Head: "#525252", aiObs1Body: "#404040",
    aiObs2Head: "#616161", aiObs2Body: "#505050",
    aiObs3Head: "#707070", aiObs3Body: "#606060",
  },
};

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

  snake.unshift(newHead);
  if (ateFood) {
    const points = food.kind === "human" ? 4 : 1;
    score += points;
    scoreValueEl.textContent = String(score);
    food = randomFoodPosition();

    const nextTickMs = Math.max(minTickMs, tickMs - tickStepMs);
    if (nextTickMs !== tickMs) {
      tickMs = nextTickMs;
      startGameLoop();
    }
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
    if (isWall(x, y) || isCellOccupiedByAnySnake(x, y)) {
      continue;
    }
    return { kind, x, y };
  }
}

function draw() {
  drawBackground();
  drawWalls();
  drawAISnakes();
  drawSnake();
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
  if (backgroundMode === "meadow" && meadowBgReady && meadowBg.naturalWidth > 0) {
    drawCoverImage(ctx, meadowBg, canvasSize, canvasSize);
    ctx.fillStyle = "rgba(0, 28, 10, 0.12)";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  } else if (backgroundMode === "gradient") {
    const grd = ctx.createLinearGradient(0, 0, 0, canvasSize);
    grd.addColorStop(0, bgColor1);
    grd.addColorStop(1, bgColor2);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  } else {
    // solid color
    ctx.fillStyle = bgColor1;
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
  // Use custom egg color
  const baseColor = eggFoodColor || "#f5f0dc";
  const grd = ctx.createRadialGradient(cx - rx * 0.3, cy - ry * 0.35, 0, cx, cy, tileSize * 0.6);
  grd.addColorStop(0, lightenColor(baseColor, 20));
  grd.addColorStop(0.55, baseColor);
  grd.addColorStop(1, darkenColor(baseColor, 10));
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.strokeStyle = darkenColor(baseColor, 30);
  ctx.lineWidth = Math.max(1, tileSize * 0.06);
  ctx.stroke();
  ctx.restore();
}

// Helper functions for color manipulation
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
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

  const baseColor = humanFoodColor || "#3b82f6";

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = darkenColor(baseColor, 40);
  ctx.lineWidth = Math.max(1.2, s * 0.08);

  ctx.fillStyle = baseColor;
  ctx.fillRect(cx - s * 0.12, py + s * 0.4, s * 0.24, s * 0.22);
  ctx.strokeStyle = darkenColor(baseColor, 30);
  ctx.strokeRect(cx - s * 0.12, py + s * 0.4, s * 0.24, s * 0.22);

  ctx.strokeStyle = darkenColor(baseColor, 40);
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

  ctx.fillStyle = lightenColor(baseColor, 30);
  ctx.beginPath();
  ctx.arc(cx, neckY - headR * 0.2, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = darkenColor(baseColor, 40);
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

  // Color customization
  initColorCustomization();
  
  // Background customization
  initBackgroundCustomization();
}

// Color customization functions
function initColorCustomization() {
  // Color pickers
  const colorPickers = {
    snakeHeadColor: (v) => { snakeHeadColor = v; draw(); },
    snakeBodyColor: (v) => { snakeBodyColor = v; draw(); },
    wallColor: (v) => { wallColor = v; draw(); },
    eggFoodColor: (v) => { eggFoodColor = v; draw(); },
    humanFoodColor: (v) => { humanFoodColor = v; draw(); },
    aiRival1Head: (v) => { AI_RIVAL_PALETTE[0].head = v; draw(); },
    aiRival1Body: (v) => { AI_RIVAL_PALETTE[0].body = v; draw(); },
    aiRival2Head: (v) => { AI_RIVAL_PALETTE[1].head = v; draw(); },
    aiRival2Body: (v) => { AI_RIVAL_PALETTE[1].body = v; draw(); },
    aiRival3Head: (v) => { AI_RIVAL_PALETTE[2].head = v; draw(); },
    aiRival3Body: (v) => { AI_RIVAL_PALETTE[2].body = v; draw(); },
    aiObs1Head: (v) => { AI_OBSTACLE_PALETTE[0].head = v; draw(); },
    aiObs1Body: (v) => { AI_OBSTACLE_PALETTE[0].body = v; draw(); },
    aiObs2Head: (v) => { AI_OBSTACLE_PALETTE[1].head = v; draw(); },
    aiObs2Body: (v) => { AI_OBSTACLE_PALETTE[1].body = v; draw(); },
    aiObs3Head: (v) => { AI_OBSTACLE_PALETTE[2].head = v; draw(); },
    aiObs3Body: (v) => { AI_OBSTACLE_PALETTE[2].body = v; draw(); },
  };

  Object.entries(colorPickers).forEach(([id, setter]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", (e) => setter(e.target.value));
    }
  });

  // Preset buttons
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.dataset.preset;
      if (preset === "custom") return;
      applyColorPreset(preset);
    });
  });

  // Reset to default button
  const resetBtn = document.getElementById("resetColorsBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetToDefaultColors);
  }

  // Save/Load preset buttons
  const saveBtn = document.getElementById("savePresetBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveCustomPreset);
  }

  const loadBtn = document.getElementById("loadPresetBtn");
  if (loadBtn) {
    loadBtn.addEventListener("click", loadCustomPreset);
  }
}

function applyColorPreset(presetName) {
  const preset = COLOR_PRESETS[presetName];
  if (!preset) return;

  snakeHeadColor = preset.snakeHead;
  snakeBodyColor = preset.snakeBody;
  wallColor = preset.wall;
  eggFoodColor = preset.eggFood;
  humanFoodColor = preset.humanFood;

  AI_RIVAL_PALETTE[0].head = preset.aiRival1Head;
  AI_RIVAL_PALETTE[0].body = preset.aiRival1Body;
  AI_RIVAL_PALETTE[1].head = preset.aiRival2Head;
  AI_RIVAL_PALETTE[1].body = preset.aiRival2Body;
  AI_RIVAL_PALETTE[2].head = preset.aiRival3Head;
  AI_RIVAL_PALETTE[2].body = preset.aiRival3Body;

  AI_OBSTACLE_PALETTE[0].head = preset.aiObs1Head;
  AI_OBSTACLE_PALETTE[0].body = preset.aiObs1Body;
  AI_OBSTACLE_PALETTE[1].head = preset.aiObs2Head;
  AI_OBSTACLE_PALETTE[1].body = preset.aiObs2Body;
  AI_OBSTACLE_PALETTE[2].head = preset.aiObs3Head;
  AI_OBSTACLE_PALETTE[2].body = preset.aiObs3Body;

  updateColorPickers();
  draw();
}

function resetToDefaultColors() {
  snakeHeadColor = DEFAULT_COLORS.snakeHead;
  snakeBodyColor = DEFAULT_COLORS.snakeBody;
  wallColor = DEFAULT_COLORS.wall;
  eggFoodColor = DEFAULT_COLORS.eggFood;
  humanFoodColor = DEFAULT_COLORS.humanFood;

  AI_RIVAL_PALETTE[0].head = DEFAULT_COLORS.aiRival1Head;
  AI_RIVAL_PALETTE[0].body = DEFAULT_COLORS.aiRival1Body;
  AI_RIVAL_PALETTE[1].head = DEFAULT_COLORS.aiRival2Head;
  AI_RIVAL_PALETTE[1].body = DEFAULT_COLORS.aiRival2Body;
  AI_RIVAL_PALETTE[2].head = DEFAULT_COLORS.aiRival3Head;
  AI_RIVAL_PALETTE[2].body = DEFAULT_COLORS.aiRival3Body;

  AI_OBSTACLE_PALETTE[0].head = DEFAULT_COLORS.aiObs1Head;
  AI_OBSTACLE_PALETTE[0].body = DEFAULT_COLORS.aiObs1Body;
  AI_OBSTACLE_PALETTE[1].head = DEFAULT_COLORS.aiObs2Head;
  AI_OBSTACLE_PALETTE[1].body = DEFAULT_COLORS.aiObs2Body;
  AI_OBSTACLE_PALETTE[2].head = DEFAULT_COLORS.aiObs3Head;
  AI_OBSTACLE_PALETTE[2].body = DEFAULT_COLORS.aiObs3Body;

  // Reset background too
  backgroundMode = "meadow";
  bgColor1 = "#020617";
  bgColor2 = "#1e293b";
  updateBackgroundUI();

  updateColorPickers();
  draw();
}

function updateColorPickers() {
  const ids = [
    "snakeHeadColor", "snakeBodyColor", "wallColor", "eggFoodColor", "humanFoodColor",
    "aiRival1Head", "aiRival1Body", "aiRival2Head", "aiRival2Body", "aiRival3Head", "aiRival3Body",
    "aiObs1Head", "aiObs1Body", "aiObs2Head", "aiObs2Body", "aiObs3Head", "aiObs3Body"
  ];
  
  const values = [
    snakeHeadColor, snakeBodyColor, wallColor, eggFoodColor, humanFoodColor,
    AI_RIVAL_PALETTE[0].head, AI_RIVAL_PALETTE[0].body,
    AI_RIVAL_PALETTE[1].head, AI_RIVAL_PALETTE[1].body,
    AI_RIVAL_PALETTE[2].head, AI_RIVAL_PALETTE[2].body,
    AI_OBSTACLE_PALETTE[0].head, AI_OBSTACLE_PALETTE[0].body,
    AI_OBSTACLE_PALETTE[1].head, AI_OBSTACLE_PALETTE[1].body,
    AI_OBSTACLE_PALETTE[2].head, AI_OBSTACLE_PALETTE[2].body
  ];

  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.value = values[i];
  });
}

function saveCustomPreset() {
  const preset = {
    snakeHead: snakeHeadColor,
    snakeBody: snakeBodyColor,
    wall: wallColor,
    eggFood: eggFoodColor,
    humanFood: humanFoodColor,
    aiRival1Head: AI_RIVAL_PALETTE[0].head,
    aiRival1Body: AI_RIVAL_PALETTE[0].body,
    aiRival2Head: AI_RIVAL_PALETTE[1].head,
    aiRival2Body: AI_RIVAL_PALETTE[1].body,
    aiRival3Head: AI_RIVAL_PALETTE[2].head,
    aiRival3Body: AI_RIVAL_PALETTE[2].body,
    aiObs1Head: AI_OBSTACLE_PALETTE[0].head,
    aiObs1Body: AI_OBSTACLE_PALETTE[0].body,
    aiObs2Head: AI_OBSTACLE_PALETTE[1].head,
    aiObs2Body: AI_OBSTACLE_PALETTE[1].body,
    aiObs3Head: AI_OBSTACLE_PALETTE[2].head,
    aiObs3Body: AI_OBSTACLE_PALETTE[2].body,
  };
  try {
    window.localStorage.setItem("snakeCustomPreset", JSON.stringify(preset));
    alert("Preset saved!");
  } catch (e) {
    alert("Could not save preset.");
  }
}

function loadCustomPreset() {
  try {
    const stored = window.localStorage.getItem("snakeCustomPreset");
    if (stored) {
      const preset = JSON.parse(stored);
      snakeHeadColor = preset.snakeHead || DEFAULT_COLORS.snakeHead;
      snakeBodyColor = preset.snakeBody || DEFAULT_COLORS.snakeBody;
      wallColor = preset.wall || DEFAULT_COLORS.wall;
      eggFoodColor = preset.eggFood || DEFAULT_COLORS.eggFood;
      humanFoodColor = preset.humanFood || DEFAULT_COLORS.humanFood;
      AI_RIVAL_PALETTE[0].head = preset.aiRival1Head || DEFAULT_COLORS.aiRival1Head;
      AI_RIVAL_PALETTE[0].body = preset.aiRival1Body || DEFAULT_COLORS.aiRival1Body;
      AI_RIVAL_PALETTE[1].head = preset.aiRival2Head || DEFAULT_COLORS.aiRival2Head;
      AI_RIVAL_PALETTE[1].body = preset.aiRival2Body || DEFAULT_COLORS.aiRival2Body;
      AI_RIVAL_PALETTE[2].head = preset.aiRival3Head || DEFAULT_COLORS.aiRival3Head;
      AI_RIVAL_PALETTE[2].body = preset.aiRival3Body || DEFAULT_COLORS.aiRival3Body;
      AI_OBSTACLE_PALETTE[0

].head = preset.aiObs1Head || DEFAULT_COLORS.aiObs1Head;
      AI_OBSTACLE_PALETTE[0].body = preset.aiObs1Body || DEFAULT_COLORS.aiObs1Body;
      AI_OBSTACLE_PALETTE[1].head = preset.aiObs2Head || DEFAULT_COLORS.aiObs2Head;
      AI_OBSTACLE_PALETTE[1].body = preset.aiObs2Body || DEFAULT_COLORS.aiObs2Body;
      AI_OBSTACLE_PALETTE[2].head = preset.aiObs3Head || DEFAULT_COLORS.aiObs3Head;
      AI_OBSTACLE_PALETTE[2].body = preset.aiObs3Body || DEFAULT_COLORS.aiObs3Body;
      updateColorPickers();
      draw();
      alert("Preset loaded!");
    } else {
      alert("No saved preset found.");
    }
  } catch (e) {
    alert("Could not load preset.");
  }
}

// Background customization functions
function initBackgroundCustomization() {
  const bgRadios = document.querySelectorAll('input[name="background"]');
  bgRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      backgroundMode = e.target.value;
      updateBackgroundUI();
      draw();
    });
  });

  const bgColor1Input = document.getElementById("bgColor1");
  if (bgColor1Input) {
    bgColor1Input.addEventListener("input", (e) => {
      bgColor1 = e.target.value;
      if (backgroundMode !== "meadow") draw();
    });
  }

  const bgColor2Input = document.getElementById("bgColor2");
  if (bgColor2Input) {
    bgColor2Input.addEventListener("input", (e) => {
      bgColor2 = e.target.value;
      if (backgroundMode === "gradient") draw();
    });
  }
}

function updateBackgroundUI() {
  const bgRadios = document.querySelectorAll('input[name="background"]');
  bgRadios.forEach((radio) => {
    radio.checked = radio.value === backgroundMode;
  });

  const bgControls = document.getElementById("bgColorControls");
  if (bgControls) {
    bgControls.style.display = backgroundMode === "meadow" ? "none" : "flex";
  }

  const bgColor2Item = document.getElementById("bgColor2Item");
  if (bgColor2Item) {
    bgColor2Item.style.display = backgroundMode === "gradient" ? "block" : "none";
  }

  const bgColor1Input = document.getElementById("bgColor1");
  if (bgColor1Input) bgColor1Input.value = bgColor1;

  const bgColor2Input = document.getElementById("bgColor2");
  if (bgColor2Input) bgColor2Input.value = bgColor2;
}

window.addEventListener("keydown", handleKeyDown);
restartButton.addEventListener("click", restartGame);

window.updateBoardSize = updateBoardSize;

init();
