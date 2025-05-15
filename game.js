// game.js  – 2048 board logic wired to blockchain moves

let grid = [];
let score = 0;
const size = 4;

const container  = document.getElementById("game-container");
const scoreDiv   = document.getElementById("score");
const connectBtn = document.getElementById("connect-wallet");
const resetBtn   = document.getElementById("reset-game");

if (!container || !scoreDiv || !connectBtn || !resetBtn) {
  console.error("DOM elements missing!");
}

/* -----------------------------------------------------------
   Wallet connect button is already wired in web3.min.js
   -----------------------------------------------------------
*/

resetBtn.onclick = () => initGrid();

/* ---------- 2048 core ------------------------------------ */

function initGrid() {
  grid = Array(size).fill().map(() => Array(size).fill(0));
  addRandomTile();
  addRandomTile();
  drawGrid();
  score = 0;
  updateScore();
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === 0) empty.push([r, c]);

  if (empty.length === 0) return false;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function drawGrid() {
  container.innerHTML = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val  = grid[r][c];
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
  let arr = row.filter(v => v !== 0);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score  += arr[i];
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter(v => v !== 0);
  while (arr.length < size) arr.push(0);
  return arr;
}

const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

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
    const col = grid.map(row => row[c]);
    const original = [...col];
    const newCol = slide(col);
    newCol.forEach((v, r) => (grid[r][c] = v));
    if (!moved && !arraysEqual(original, newCol)) moved = true;
  }
  return moved;
}

function moveDown() {
  let moved = false;
  for (let c = 0; c < size; c++) {
    const col = grid.map(row => row[c]);
    const original = [...col];
    const newCol = slide([...col].reverse()).reverse();
    newCol.forEach((v, r) => (grid[r][c] = v));
    if (!moved && !arraysEqual(original, newCol)) moved = true;
  }
  return moved;
}

function gameOver() {
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === 0) return false;

  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      if (c < size - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < size - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  return true;
}

/* ---------- Key handling + blockchain trigger ------------ */

document.addEventListener("keydown", e => {
  let moved = false;
  switch (e.key) {
    case "ArrowLeft":
      moved = moveLeft();
      if (moved) sendMove("left");
      break;
    case "ArrowRight":
      moved = moveRight();
      if (moved) sendMove("right");
      break;
    case "ArrowUp":
      moved = moveUp();
      if (moved) sendMove("up");
      break;
    case "ArrowDown":
      moved = moveDown();
      if (moved) sendMove("down");
      break;
  }

  if (moved) {
    addRandomTile();
    drawGrid();
    updateScore();
    if (gameOver()) {
      alert(`Game Over! Score: ${score}`);
    }
  }
});

initGrid();
