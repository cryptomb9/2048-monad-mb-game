import { saveScore } from "./leaderboard.js";

const container = document.getElementById("game-container");
const scoreDiv = document.getElementById("score");
const resetBtn = document.getElementById("reset-game");
const status = document.getElementById("status");

const size = 4;
let grid = [];
let score = 0;
let nickname = ""; // Optional: you can set this after wallet connect or via prompt
let gameOver = false;

// Initialize empty grid
function initGrid() {
  grid = Array(size).fill(null).map(() => Array(size).fill(0));
  addRandomTile();
  addRandomTile();
  score = 0;
  gameOver = false;
  updateScore();
  drawGrid();
}

// Add a random tile (2 or 4) in empty spot
function addRandomTile() {
  let empties = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return false;

  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

// Draw grid to DOM
function drawGrid() {
  container.innerHTML = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      if (grid[r][c] !== 0) {
        tile.textContent = grid[r][c];
        tile.setAttribute("data-value", grid[r][c]);
      }
      container.appendChild(tile);
    }
  }
}

// Update score display
function updateScore() {
  scoreDiv.textContent = `Score: ${score}`;
}

// Slide and merge a single row left
function slide(row) {
  let arr = row.filter(v => v !== 0);
  let scoreGained = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      scoreGained += arr[i];
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter(v => v !== 0);
  while (arr.length < size) arr.push(0);
  return { row: arr, scoreGained };
}

// Compare arrays helper
function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// Move left logic, returns true if changed
function moveLeft() {
  let moved = false;
  for (let r = 0; r < size; r++) {
    const { row: newRow, scoreGained } = slide(grid[r]);
    if (!arraysEqual(grid[r], newRow)) {
      moved = true;
      grid[r] = newRow;
      score += scoreGained;
    }
  }
  return moved;
}

// Move right logic
function moveRight() {
  let moved = false;
  for (let r = 0; r < size; r++) {
    const reversed = [...grid[r]].reverse();
    const { row: newRow, scoreGained } = slide(reversed);
    const finalRow = newRow.reverse();
    if (!arraysEqual(grid[r], finalRow)) {
      moved = true;
      grid[r] = finalRow;
      score += scoreGained;
    }
  }
  return moved;
}

// Move up logic
function moveUp() {
  let moved = false;
  for (let c = 0; c < size; c++) {
    let col = [];
    for (let r = 0; r < size; r++) col.push(grid[r][c]);
    const { row: newCol, scoreGained } = slide(col);
    for (let r = 0; r < size; r++) {
      if (grid[r][c] !== newCol[r]) moved = true;
      grid[r][c] = newCol[r];
    }
    score += scoreGained;
  }
  return moved;
}

// Move down logic
function moveDown() {
  let moved = false;
  for (let c = 0; c < size; c++) {
    let col = [];
    for (let r = 0; r < size; r++) col.push(grid[r][c]);
    const reversed = col.reverse();
    const { row: newCol, scoreGained } = slide(reversed);
    const finalCol = newCol.reverse();
    for (let r = 0; r < size; r++) {
      if (grid[r][c] !== finalCol[r]) moved = true;
      grid[r][c] = finalCol[r];
    }
    score += scoreGained;
  }
  return moved;
}

// Check if any moves possible (to detect game over)
function canMove() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) return true;
      if (c < size - 1 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < size - 1 && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

// Save score securely with wallet signature
async function secureSave() {
  if (!window.currentAcc || score === 0) return;

  const ethers = window.ethers;
  if (!ethers) {
    console.warn("ethers.js not found, cannot verify signature.");
    return;
  }

  try {
    const signer = window.ethereum && window.ethereum.selectedAddress;
    if (!signer) {
      console.warn("Wallet not connected or address not found");
      return;
    }

    const wallet = window.currentAcc.toLowerCase();
    if (wallet !== signer.toLowerCase()) {
      console.warn("Connected wallet address mismatch");
      return;
    }

    const message = `Save score ${score} for 2048 game`;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signerObj = provider.getSigner();

    const signature = await signerObj.signMessage(message);

    await saveScore(score, nickname, signature, message);

    status.textContent = "✔️ Score saved!";
  } catch (err) {
    console.error("Error saving score:", err);
    status.textContent = "⚠️ Error saving score";
  }
}

// Handle a move in a direction
async function handleMove(direction) {
  if (gameOver) return;

  let moved = false;
  switch (direction) {
    case "left": moved = moveLeft(); break;
    case "right": moved = moveRight(); break;
    case "up": moved = moveUp(); break;
    case "down": moved = moveDown(); break;
  }
  if (!moved) return;

  addRandomTile();
  updateScore();
  drawGrid();

  if (!canMove()) {
    gameOver = true;
    status.textContent = `Game Over! Final Score: ${score}`;
  }

  // Auto-save after every move
  await secureSave();
}

// Keyboard controls
window.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowLeft": handleMove("left"); break;
    case "ArrowRight": handleMove("right"); break;
    case "ArrowUp": handleMove("up"); break;
    case "ArrowDown": handleMove("down"); break;
  }
});

// Touch controls (basic swipe detection)
let touchStartX = 0;
let touchStartY = 0;
const threshold = 30;

container.addEventListener("touchstart", e => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
});

container.addEventListener("touchend", e => {
  if (e.changedTouches.length === 1) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) handleMove("right");
      else if (dx < -threshold) handleMove("left");
    } else {
      if (dy > threshold) handleMove("down");
      else if (dy < -threshold) handleMove("up");
    }
  }
});

// Reset button saves score before resetting
resetBtn.addEventListener("click", async () => {
  await secureSave();
  initGrid();
  status.textContent = "Game reset!";
});

// Initial load
initGrid();
