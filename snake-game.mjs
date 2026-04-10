export const DIRECTIONS = {
  up: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

export function createInitialState(options = {}) {
  const rows = options.rows ?? 16;
  const cols = options.cols ?? 16;
  const middleRow = Math.floor(rows / 2);
  const middleCol = Math.floor(cols / 2);
  const snake = options.snake ?? [
    { row: middleRow, col: middleCol - 1 },
    { row: middleRow, col: middleCol - 2 },
  ];

  const baseState = {
    rows,
    cols,
    snake,
    direction: options.direction ?? "right",
    queuedDirection: options.direction ?? "right",
    food: options.food ?? null,
    score: options.score ?? 0,
    started: options.started ?? false,
    paused: options.paused ?? false,
    gameOver: options.gameOver ?? false,
  };

  return baseState.food
    ? baseState
    : { ...baseState, food: placeFood(baseState, options.randomFn) };
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection]) {
    return state;
  }

  const currentDirection = state.started ? state.direction : state.queuedDirection;
  const length = state.snake.length;

  if (length > 1 && OPPOSITE_DIRECTIONS[currentDirection] === nextDirection) {
    return state;
  }

  return { ...state, queuedDirection: nextDirection };
}

export function togglePause(state) {
  if (state.gameOver || !state.started) {
    return state;
  }

  return { ...state, paused: !state.paused };
}

export function restartGame(state, randomFn) {
  return createInitialState({
    rows: state.rows,
    cols: state.cols,
    randomFn,
  });
}

export function stepGame(state, randomFn = Math.random) {
  if (state.gameOver || state.paused) {
    return state;
  }

  const direction = state.queuedDirection;
  const nextHead = moveCell(state.snake[0], DIRECTIONS[direction]);
  const eatingFood = cellsEqual(nextHead, state.food);
  const nextSnake = [nextHead, ...state.snake];

  if (!eatingFood) {
    nextSnake.pop();
  }

  const hitWall =
    nextHead.row < 0 ||
    nextHead.row >= state.rows ||
    nextHead.col < 0 ||
    nextHead.col >= state.cols;

  const hitSelf = nextSnake
    .slice(1)
    .some((segment) => cellsEqual(segment, nextHead));

  if (hitWall || hitSelf) {
    return {
      ...state,
      direction,
      started: true,
      gameOver: true,
      paused: false,
    };
  }

  const nextState = {
    ...state,
    snake: nextSnake,
    direction,
    started: true,
    score: eatingFood ? state.score + 1 : state.score,
  };

  if (!eatingFood) {
    return nextState;
  }

  return {
    ...nextState,
    food: placeFood(nextState, randomFn),
  };
}

export function placeFood(state, randomFn = Math.random) {
  const freeCells = [];

  for (let row = 0; row < state.rows; row += 1) {
    for (let col = 0; col < state.cols; col += 1) {
      if (!state.snake.some((segment) => segment.row === row && segment.col === col)) {
        freeCells.push({ row, col });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(randomFn() * freeCells.length);
  return freeCells[index];
}

export function cellsEqual(a, b) {
  return Boolean(a && b && a.row === b.row && a.col === b.col);
}

function moveCell(cell, vector) {
  return {
    row: cell.row + vector.row,
    col: cell.col + vector.col,
  };
}
