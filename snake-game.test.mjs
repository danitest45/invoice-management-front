import assert from "node:assert/strict";

import {
  createInitialState,
  queueDirection,
  stepGame,
  placeFood,
} from "./snake-game.mjs";

runTest("snake moves one cell in its queued direction", () => {
  const state = createInitialState({
    rows: 6,
    cols: 6,
    snake: [
      { row: 2, col: 2 },
      { row: 2, col: 1 },
    ],
    food: { row: 0, col: 0 },
  });

  const nextState = stepGame(state, () => 0);

  assert.deepEqual(nextState.snake, [
    { row: 2, col: 3 },
    { row: 2, col: 2 },
  ]);
  assert.equal(nextState.score, 0);
});

runTest("snake grows and score increases after eating food", () => {
  const state = createInitialState({
    rows: 6,
    cols: 6,
    snake: [
      { row: 2, col: 2 },
      { row: 2, col: 1 },
    ],
    food: { row: 2, col: 3 },
  });

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.score, 1);
  assert.equal(nextState.snake.length, 3);
  assert.deepEqual(nextState.snake[0], { row: 2, col: 3 });
  assert.notDeepEqual(nextState.food, { row: 2, col: 3 });
});

runTest("reversing direction into the snake body is ignored", () => {
  const state = createInitialState({
    rows: 6,
    cols: 6,
    snake: [
      { row: 2, col: 2 },
      { row: 2, col: 1 },
    ],
    direction: "right",
    food: { row: 0, col: 0 },
  });

  const queued = queueDirection(state, "left");
  const nextState = stepGame(queued, () => 0);

  assert.deepEqual(nextState.snake[0], { row: 2, col: 3 });
});

runTest("wall collisions trigger game over", () => {
  const state = createInitialState({
    rows: 4,
    cols: 4,
    snake: [
      { row: 1, col: 3 },
      { row: 1, col: 2 },
    ],
    direction: "right",
    food: { row: 0, col: 0 },
  });

  const nextState = stepGame(state, () => 0);

  assert.equal(nextState.gameOver, true);
});

runTest("food placement never returns an occupied cell", () => {
  const state = createInitialState({
    rows: 3,
    cols: 3,
    snake: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
    ],
    food: { row: 2, col: 2 },
  });

  const food = placeFood({ ...state, food: null }, () => 0);

  assert.deepEqual(food, { row: 2, col: 2 });
});

function runTest(name, testFn) {
  try {
    testFn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}
