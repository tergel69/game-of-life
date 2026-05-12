// Game of Life Types
export interface Cell {
  x: number;
  y: number;
  alive: boolean;
}

export interface GameRules {
  birthNeighbors: number[];  // Number of neighbors to birth a new cell
  survivalNeighbors: number[];  // Number of neighbors to keep cell alive
}

export interface GameState {
  grid: boolean[][];
  generation: number;
  isRunning: boolean;
  speed: number;
  rules: GameRules;
}

// Default Conway's Game of Life rules
// - A dead cell with exactly 3 neighbors becomes alive
// - A live cell with 2 or 3 neighbors survives
export const DEFAULT_RULES = {
  birthNeighbors: [3],
  survivalNeighbors: [2, 3],
};

// Common alternative rulesets
export const PRESET_RULES: Record<string, GameRules> = {
  "conway": {
    birthNeighbors: [3],
    survivalNeighbors: [2, 3],
  },
  "highlife": {
    birthNeighbors: [3, 6],
    survivalNeighbors: [2, 3],
  },
  "seeds": {
    birthNeighbors: [2],
    survivalNeighbors: [],
  },
  "lifewithoutdeath": {
    birthNeighbors: [3],
    survivalNeighbors: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  "replicator": {
    birthNeighbors: [1, 3, 5, 7],
    survivalNeighbors: [1, 3, 5, 7],
  },
};

// Create an empty grid
export function createEmptyGrid(rows: number, cols: number) {
  return Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => false)
  );
}

// Create a random grid
function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (value + 0x6D2B79F5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRandomGrid(
  rows: number,
  cols: number,
  density = 0.3,
  seed?: number
) {
  const random = typeof seed === "number" ? createSeededRandom(seed) : Math.random;

  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => random() < density)
  );
}

// Count live neighbors around a cell
export function countNeighbors(grid: boolean[][], x: number, y: number) {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
        if (grid[nx][ny]) count++;
      }
    }
  }

  return count;
}

// Apply rules to determine next cell state
export function applyRules(
  cellAlive: boolean,
  neighbors: number,
  rules: GameRules
) {
  if (cellAlive) {
    return rules.survivalNeighbors.includes(neighbors);
  } else {
    return rules.birthNeighbors.includes(neighbors);
  }
}

// Compute the next generation
export function computeNextGeneration(
  grid: boolean[][],
  rules: GameRules = DEFAULT_RULES
) {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = createEmptyGrid(rows, cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const neighbors = countNeighbors(grid, i, j);
      newGrid[i][j] = applyRules(grid[i][j], neighbors, rules);
    }
  }

  return newGrid;
}

// Count total alive cells
export function countAliveCells(grid: boolean[][]) {
  return grid.reduce((sum, row) => 
    sum + row.reduce((rowSum, cell) => rowSum + (cell ? 1 : 0), 0), 0
  );
}

// Preset patterns for Game of Life
export const PATTERNS: Record<string, boolean[][]> = {
  "glider": [
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ],
  "blinker": [
    [true, true, true],
  ],
  "toad": [
    [false, true, true, true],
    [true, true, true, false],
  ],
  "beacon": [
    [true, true, false, false],
    [true, true, false, false],
    [false, false, true, true],
    [false, false, true, true],
  ],
  "pulsar": [
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [true, false, false, false, false, true, false, true, false, false, false, false, true],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
  ],
  "gosper_glider_gun": [
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
  ],
};

// Place a pattern on the grid at a given position
export function placePattern(
  grid: boolean[][],
  pattern: boolean[][],
  startX: number,
  startY: number
) {
  const newGrid = grid.map(row => [...row]);
  const rows = grid.length;
  const cols = grid[0].length;

  for (let i = 0; i < pattern.length; i++) {
    for (let j = 0; j < pattern[i].length; j++) {
      const x = startX + i;
      const y = startY + j;
      if (x >= 0 && x < rows && y >= 0 && y < cols) {
        newGrid[x][y] = pattern[i][j];
      }
    }
  }

  return newGrid;
}

// this was a pain to figure out
const debugHelper = null;
