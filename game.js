let grid = [];
let score = 0;
const size = 4;

const container = document.getElementById("game-container");
const scoreDiv = document.getElementById("score");
const connectBtn = document.getElementById("connect-wallet");
const resetBtn = document.getElementById("reset-game");
const status = document.getElementById("status");

function initGrid() {
  grid = Array(size)
    .fill()
    .map(() => Array(size).fill(0));
  addRandomTile();
  addRandomTile();
  drawGrid();
  score = 0;
  updateScore();
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return false;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function drawGrid() {
  container.innerHTML = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = grid[r][c];
      const tile = document.createElement("div");
      tile.classList.add("tile");
      if (val !== 0) {
        tile.textContent = val;
        tile.setAttribute("data-value", val);
      }
      container.appendChild(tile);
    }
  }
}

function updateScore() {
  scoreDiv.textContent = `Score: ${score}`;
}

function slide(row) {
  let arr = row.filter((v) => v !== 0);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter((v) => v !== 0);
  while (arr.length < size) arr.push(0);
  return arr;
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function moveLeft() {
  let moved = false;
  for (let r = 0; r < size; r++) {
    const original = [...grid[r]];
    grid[r] = slide(grid[r]);
    if (!arraysEqual(original, grid[r])) moved = true;
  }
  return moved;
}

function moveRight() {
  let moved = false;
  for (let r = 0; r < size; r++) {
    const original = [...grid[r]];
    grid[r] = slide([...grid[r]].reverse()).reverse();
    if (!arraysEqual(original, grid[r])) moved = true;
  }
  return moved;
}

function moveUp() {
  let moved = false;
  for (let c = 0; c < size; c++) {
    const col = grid.map((row) => row[c]);
    const original = [...col];
    const newCol = slide(col);
    newCol.forEach((val, i) => (grid[i][c] = val));
    if (!arraysEqual(original, newCol)) moved = true;
  }
  return moved;
}

function moveDown() {
  let moved = false;
  for (let c = 0; c < size; c++) {
    const col = grid.map((row) => row[c]);
    const original = [...col];
    const newCol = slide([...col].reverse()).reverse();
    newCol.forEach((val, i) => (grid[i][c] = val));
    if (!arraysEqual(original, newCol)) moved = true;
  }
  return moved;
}

function gameOver() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) return false;
      if (c < size - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < size - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

// --- Keyboard controls ---
document.addEventListener("keydown", async (e) => {
  let moved = false;
  let direction = "";

  switch (e.key) {
    case "ArrowLeft":
      moved = moveLeft();
      direction = "left";
      break;
    case "ArrowRight":
      moved = moveRight();
      direction = "right";
      break;
    case "ArrowUp":
      moved = moveUp();
      direction = "up";
      break;
    case "ArrowDown":
      moved = moveDown();
      direction = "down";
      break;
  }

  if (moved) {
    addRandomTile();
    drawGrid();
    updateScore();
    if (gameOver()) {
      saveScore(score);  // save to leaderboard on game over
      alert("Game Over! Score: " + score);
    }
    await sendMove(direction);
  }
});

// --- Swipe controls for mobile ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const minSwipeDistance = 30;

container.addEventListener('touchstart', (e) => {
  const touch = e.changedTouches[0];
  touchStartX = touch.screenX;
  touchStartY = touch.screenY;
});

container.addEventListener('touchend', async (e) => {
  const touch = e.changedTouches[0];
  touchEndX = touch.screenX;
  touchEndY = touch.screenY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
    return; // swipe too short, ignore
  }

  let moved = false;
  let direction = '';

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // horizontal swipe
    if (deltaX > 0) {
      moved = moveRight();
      direction = 'right';
    } else {
      moved = moveLeft();
      direction = 'left';
    }
  } else {
    // vertical swipe
    if (deltaY > 0) {
      moved = moveDown();
      direction = 'down';
    } else {
      moved = moveUp();
      direction = 'up';
    }
  }

  if (moved) {
    addRandomTile();
    drawGrid();
    updateScore();
    if (gameOver()) {
      saveScore(score);
      alert("Game Over! Score: " + score);
    }
    await sendMove(direction);
  }
});

resetBtn.onclick = initGrid;

window.addEventListener("load", initGrid);
