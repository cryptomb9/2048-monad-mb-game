let grid = [];
let score = 0;
const size = 4;

const container = document.getElementById("game-container");
const scoreDiv = document.getElementById("score");
const connectBtn = document.getElementById("connect-wallet");
const resetBtn = document.getElementById("reset-game");

if (!container || !scoreDiv || !connectBtn || !resetBtn) {
  console.error("DOM elements missing!");
}

connectBtn.onclick = async () => {
  try {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      connectBtn.disabled = true;
      connectBtn.textContent = "Wallet Connected";
    } else {
      alert("Please install MetaMask!");
    }
  } catch (error) {
    console.error("Wallet connection failed:", error);
  }
};

resetBtn.onclick = () => {
  initGrid();
  displayLeaderboard(); // update leaderboard on reset too
};

function initGrid() {
  grid = Array(size)
    .fill()
    .map(() => Array(size).fill(0));
  addRandomTile();
  addRandomTile();
  drawGrid();
  score = 0;
  updateScore();
  displayLeaderboard(); // show leaderboard when game starts
}

function addRandomTile() {
  let empty = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return false;
  let [r, c] = empty[Math.floor(Math.random() * empty.length)];
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

function arraysEqual(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);
}

function moveLeft() {
  let moved = false;
  for (let r = 0; r < size; r++) {
    const original = [...grid[r]];
    grid[r] = slide(grid[r]);
    if (!moved && !arraysEqual(original, grid[r])) moved = true;
  }
  return moved;
}

function moveRight() {
  let moved = false;
  for (let r = 0; r < size; r++) {
    const original = [...grid[r]];
    grid[r] = slide([...grid[r]].reverse()).reverse();
    if (!moved && !arraysEqual(original, grid[r])) moved = true;
  }
  return moved;
}

function moveUp() {
  let moved = false;
  for (let c = 0; c < size; c++) {
    let col = [];
    for (let r = 0; r < size; r++) col.push(grid[r][c]);
    const original = [...col];
    const newCol = slide(col);
    for (let r = 0; r < size; r++) grid[r][c] = newCol[r];
    if (!moved && !arraysEqual(original, newCol)) moved = true;
  }
  return moved;
}

function moveDown() {
  let moved = false;
  for (let c = 0; c < size; c++) {
    let col = [];
    for (let r = 0; r < size; r++) col.push(grid[r][c]);
    const original = [...col];
    const newCol = slide([...col].reverse()).reverse();
    for (let r = 0; r < size; r++) grid[r][c] = newCol[r];
    if (!moved && !arraysEqual(original, newCol)) moved = true;
  }
  return moved;
}

function gameOver() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (c < size - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < size - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

document.addEventListener("keydown", (e) => {
  let moved = false;
  switch (e.key) {
    case "ArrowLeft":
      moved = moveLeft();
      break;
    case "ArrowRight":
      moved = moveRight();
      break;
    case "ArrowUp":
      moved = moveUp();
      break;
    case "ArrowDown":
      moved = moveDown();
      break;
  }
  if (moved) {
    addRandomTile();
    drawGrid();
    updateScore();
    if (gameOver()) {
      alert("Game Over! Score: " + score);
      saveScore(score);        // from leaderboard.js
      displayLeaderboard();    // from leaderboard.js
    }
  }
});

// Initialize grid and leaderboard on page load
initGrid();
