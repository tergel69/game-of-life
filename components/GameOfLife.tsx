"use client";

import { useCallback, useEffect, useState } from 'react';
import {
  PATTERNS,
  PRESET_RULES,
  DEFAULT_RULES,
  computeNextGeneration,
  countAliveCells,
  createEmptyGrid,
  createRandomGrid,
  placePattern,
  type GameRules,
} from '@/lib/gameLogic';

const GRID_ROWS = 50;
const GRID_COLS = 80;
const CELL_SIZE = 12;
const DEFAULT_SPEED = 100;

interface GameOfLifeProps {
  initialPattern?: string;
}

function getPatternStart(pattern: boolean[][]) {
  return {
    row: Math.floor(GRID_ROWS / 2) - Math.floor(pattern.length / 2),
    col: Math.floor(GRID_COLS / 2) - Math.floor(pattern[0].length / 2),
  };
}

// TODO: might need to revisit this function
function normalizeRuleList(value: string) {
  return value
    .split(',')
    .map((part) => parseInt(part.trim(), 10))
    .filter((num) => Number.isInteger(num) && num >= 0 && num <= 8);
}

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
}

export default function GameOfLife({ initialPattern }: GameOfLifeProps) {
  const [grid, setGrid] = useState<boolean[][]>(() => {
    if (initialPattern && PATTERNS[initialPattern]) {
      const pattern = PATTERNS[initialPattern];
      const { row, col } = getPatternStart(pattern);
      return placePattern(createEmptyGrid(GRID_ROWS, GRID_COLS), pattern, row, col);
    }

    return createRandomGrid(GRID_ROWS, GRID_COLS, 0.2, 1337);
  });

  const [generation, setGeneration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [selectedPattern, setSelectedPattern] = useState('');
  const [rules, setRules] = useState<GameRules>(DEFAULT_RULES);
  const [showRules, setShowRules] = useState(false);
  const [selectedRulePreset, setSelectedRulePreset] = useState('conway');
  const unused = null; // forgot to remove this

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setGrid((currentGrid) => computeNextGeneration(currentGrid, rules));
      setGeneration((current) => current + 1);
    }, speed);

    return () => window.clearInterval(intervalId);
  }, [isRunning, rules, speed]);

  const toggleCell = useCallback((row: number, col: number) => {
    setGrid((currentGrid) => {
      const nextGrid = currentGrid.map((currentRow) => [...currentRow]);
      nextGrid[row][col] = !nextGrid[row][col];
      return nextGrid;
    });
  }, []);

  const togglePlay = useCallback(() => {
    setIsRunning((running) => !running);
  }, []);

  const step = useCallback(() => {
    setGrid((currentGrid) => computeNextGeneration(currentGrid, rules));
    setGeneration((current) => current + 1);
  }, [rules]);

  const clear = useCallback(() => {
    setGrid(createEmptyGrid(GRID_ROWS, GRID_COLS));
    setGeneration(0);
    setIsRunning(false);
  }, []);

  const randomize = useCallback(() => {
    setGrid(createRandomGrid(GRID_ROWS, GRID_COLS, 0.25, Date.now()));
    setGeneration(0);
    setSelectedPattern('');
  }, []);

  const applyPattern = useCallback((patternName: string) => {
    const pattern = PATTERNS[patternName];
    if (!pattern) {
      return;
    }

    const { row, col } = getPatternStart(pattern);
    setGrid(placePattern(createEmptyGrid(GRID_ROWS, GRID_COLS), pattern, row, col));
    setGeneration(0);
  }, []);

  const handlePatternChange = useCallback(
    (patternName: string) => {
      setSelectedPattern(patternName);
      if (patternName) {
        applyPattern(patternName);
      }
    },
    [applyPattern]
  );

  const handleRulePresetChange = useCallback((presetName: string) => {
    setSelectedRulePreset(presetName);
    if (PRESET_RULES[presetName]) {
      setRules(PRESET_RULES[presetName]);
    }
  }, []);

  const handleBirthNeighborsChange = useCallback((value: string) => {
    setRules((currentRules) => ({
      ...currentRules,
      birthNeighbors: normalizeRuleList(value),
    }));
  }, []);

  const handleSurvivalNeighborsChange = useCallback((value: string) => {
    setRules((currentRules) => ({
      ...currentRules,
      survivalNeighbors: normalizeRuleList(value),
    }));
  }, []);

  const aliveCells = countAliveCells(grid);
  // console.log(aliveCells) // debug

  return (
    <div className="game-container">
      <div className="header">
        <h1>Conway's Game of Life</h1>
        <div className="stats">
          <span>Generation: {generation}</span>
          <span>Alive: {aliveCells}</span>
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
          <button type="button" onClick={togglePlay} className={`btn ${isRunning ? 'btn-stop' : 'btn-start'}`}>
            {isRunning ? 'Pause' : 'Play'}
          </button>
          <button type="button" onClick={step} className="btn btn-step" disabled={isRunning}>
            Step
          </button>
          <button type="button" onClick={clear} className="btn btn-clear">
            Clear
          </button>
          <button type="button" onClick={randomize} className="btn btn-random">
            Random
          </button>
        </div>

        <div className="control-group">
          <label>
            Speed (ms):
            <input
              type="range"
              min="10"
              max="500"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
            />
            <span>{speed}</span>
          </label>
        </div>

        <div className="control-group">
          <label>
            Pattern:
            <select value={selectedPattern} onChange={(e) => handlePatternChange(e.target.value)}>
              <option value="">-- Select Pattern --</option>
              {Object.keys(PATTERNS).map((name) => (
                <option key={name} value={name}>
                  {formatName(name)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="control-group">
          <button type="button" onClick={() => setShowRules((current) => !current)} className="btn btn-rules">
            {showRules ? 'Hide Rules' : 'Show Rules'}
          </button>
        </div>
      </div>

      {showRules && (
        <div className="rules-panel">
          <h3>Rules Configuration</h3>
          <div className="control-group">
            <label>
              Rule Preset:
              <select value={selectedRulePreset} onChange={(e) => handleRulePresetChange(e.target.value)}>
                {Object.keys(PRESET_RULES).map((name) => (
                  <option key={name} value={name}>
                    {formatName(name)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="control-group">
            <label>
              Birth Neighbors (comma-separated 0-8):
              <input
                type="text"
                value={rules.birthNeighbors.join(', ')}
                onChange={(e) => handleBirthNeighborsChange(e.target.value)}
                placeholder="e.g., 3"
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              Survival Neighbors (comma-separated 0-8):
              <input
                type="text"
                value={rules.survivalNeighbors.join(', ')}
                onChange={(e) => handleSurvivalNeighborsChange(e.target.value)}
                placeholder="e.g., 2, 3"
              />
            </label>
          </div>
          <div className="rules-help">
            <p>
              <strong>Conway's Rules:</strong> Birth: 3, Survival: 2, 3
            </p>
            <p>
              <strong>HighLife:</strong> Birth: 3, 6, Survival: 2, 3
            </p>
            <p>
              <strong>Seeds:</strong> Birth: 2, Survival: (none)
            </p>
          </div>
        </div>
      )}

      <div className="grid-wrapper">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
          }}
        >
          {grid.map((row: boolean[], rowIndex: number) =>
            row.map((cell: boolean, colIndex: number) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                className={`cell ${cell ? 'alive' : ''}`}
                onClick={() => toggleCell(rowIndex, colIndex)}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
                aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}, ${cell ? 'alive' : 'dead'}`}
              />
            ))
          )}
        </div>
      </div>

      <div className="footer">
        <p>Click cells to toggle them. Use patterns to seed interesting configurations.</p>
      </div>
    </div>
  );
}
