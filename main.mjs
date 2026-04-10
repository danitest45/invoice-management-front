import {
  createInitialState,
  queueDirection,
  restartGame,
  stepGame,
  togglePause,
  cellsEqual,
} from "./snake-game.mjs";

const TICK_MS = 140;
const boardElement = document.querySelector("#game-board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status-text");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState();

buildBoard(state.rows, state.cols);
render();

setInterval(() => {
  state = stepGame(state);
  render();
}, TICK_MS);

window.addEventListener("keydown", (event) => {
  const direction = getDirectionFromKey(event.key);

  if (direction) {
    event.preventDefault();
    state = queueDirection(state, direction);
    render();
    return;
  }

  if (event.key === " " || event.key.toLowerCase() === "p") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (event.key.toLowerCase() === "r") {
    state = restartGame(state);
    render();
  }
});

pauseButton.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartButton.addEventListener("click", () => {
  state = restartGame(state);
  render();
});

for (const button of controlButtons) {
  button.addEventListener("click", () => {
    state = queueDirection(state, button.dataset.direction);
    render();
  });
}

function buildBoard(rows, cols) {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < rows * cols; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    fragment.appendChild(cell);
  }

  boardElement.replaceChildren(fragment);
}

function render() {
  const cells = boardElement.children;
  const head = state.snake[0];

  for (let row = 0; row < state.rows; row += 1) {
    for (let col = 0; col < state.cols; col += 1) {
      const index = row * state.cols + col;
      const cell = cells[index];
      const isHead = head.row === row && head.col === col;
      const isSnake = state.snake.some((segment) => segment.row === row && segment.col === col);
      const isFood = cellsEqual(state.food, { row, col });

      cell.className = "cell";

      if (isSnake) {
        cell.classList.add("cell--snake");
      }

      if (isHead) {
        cell.classList.add("cell--head");
      }

      if (isFood) {
        cell.classList.add("cell--food");
      }
    }
  }

  scoreElement.textContent = String(state.score);
  pauseButton.textContent = state.paused ? "Resume" : "Pause";
  pauseButton.disabled = !state.started || state.gameOver;

  if (state.gameOver) {
    statusElement.textContent = "Game over. Press Restart or R to play again.";
    return;
  }

  if (state.paused) {
    statusElement.textContent = "Paused. Press Space, P, or Resume to continue.";
    return;
  }

  if (!state.started) {
    statusElement.textContent = "Press any arrow key or WASD to start.";
    return;
  }

  statusElement.textContent = "Use arrow keys, WASD, or the buttons below to steer.";
}

function getDirectionFromKey(key) {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return "up";
    case "arrowright":
    case "d":
      return "right";
    case "arrowdown":
    case "s":
      return "down";
    case "arrowleft":
    case "a":
      return "left";
    default:
      return null;
  }
}
