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

// Default colors - will be customizable
const defaultColors = {
  bg: "#020617",
  grid: "rgba(255, 255, 255, 0.16)",
  snakeHead: "#22c55e",
  snakeBody: "#16a34a",
  wall: "#f97316",
  food: "#fbbf24",
};

// Current colors (loaded from localStorage or defaults)
let colors = { ...defaultColors };

// Load saved colors from localStorage
function loadColors() {
  try {
    const saved = window.localStorage.getItem("snakeColors");
    if (saved) {
      const parsed = JSON.parse(saved);
      colors = { ...defaultColors, ...parsed };
    }
  } catch (e) {
    // ignore storage errors
  }
}

// Save colors to localStorage
function saveColors() {
  try {
    window.localStorage.setItem("snakeColors", JSON.stringify(colors));
  } catch (e) {
    // ignore storage errors
  }
}

// Reset colors to defaults
function resetColors() {
  colors = { ...defaultColors };
  saveColors();
  updateColorInputs();
  draw();
}

const AI_RIVAL_PALETTE = [
  { head: "#a855f7", body: "#7c3aed" },
  { head: "#d946ef", body: "#a21caf" },
  { head: "#c084fc", body: "#9333ea" },
];
const AI_OBSTACLE_PALETTE = [
  { head: "#38bdf8", body: "#0284c7" },
  { head: "#fbbf24", body: "#ca8a04" },
  { head: "#f472b6", body: "#db2777" },
];

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

// Color customization elements
const customizeBtn = document.getElementById("customizeBtn");
const customizeModal = document.getElementById("customizeModal");
const closeModal = document.getElementById("closeModal");
const saveColorsBtn = document.getElementById("saveColors");
const resetColorsBtn = document.getElementById("resetColors");
const snakeColorInput = document.getElementById("snakeColor");
const aiSnakeColorInput = document.getElementById("aiSnakeColor");
const wallColorInput = document.getElementById("wallColor");
const bgColorInput = document.getElementById("bgColor");
const foodColorInput = document.getElementById("foodColor");
const gridColorInput = document.getElementById("gridColor");

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