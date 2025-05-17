/* ═════════════ 2048 core + blockchain hook ═════*/
let grid = []; let score = 0; const size = 4;

const container = document.getElementById("game-container");
const scoreDiv  = document.getElementById("score");
const resetBtn  = document.getElementById("reset-game");

/* ---------- init ---------- */
function initGrid() {
  grid = Array(size).fill().map(() => Array(size).fill(0));
  score = 0;
  addRandomTile(); addRandomTile();
  drawGrid(); updateScore();
}

/* ---------- helpers ---------- */
function addRandomTile() {
  const empty = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c]) empty.push([r, c]);
  if (!empty.length) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}
function drawGrid() {
  container.innerHTML = "";
  grid.flat().forEach(v => {
    const t = document.createElement("div");
    t.className = "tile";
    if (v) { t.textContent = v; t.dataset.value = v; }
    container.appendChild(t);
  });
}
const updateScore = () => scoreDiv.textContent = `Score: ${score}`;

function slide(row) {
  let arr = row.filter(v => v), gained = 0;
  for (let i = 0; i < arr.length - 1; i++)
    if (arr[i] === arr[i + 1]) { arr[i] *= 2; gained += arr[i]; arr[i + 1] = 0; }
  arr = arr.filter(v => v); while (arr.length < size) arr.push(0);
  return { row: arr, gained };
}
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

function move(build) {
  let moved=false, merged=false;
  for (let i = 0; i < size; i++) {
    const { original, newLine, gained } = build(i);
    if (!eq(original, newLine)) moved = true;
    if (gained) merged = true;
    score += gained;
  }
  return { moved, merged };
}

/* direction functions */
const moveLeft  = () => move(i => {
  const orig = [...grid[i]];
  const { row, gained } = slide(grid[i]);
  grid[i] = row;
  return { original: orig, newLine: row, gained };
});
const moveRight = () => move(i => {
  const orig = [...grid[i]].reverse();
  const { row, gained } = slide(orig);
  grid[i] = row.reverse();
  return { original: orig.reverse(), newLine: grid[i], gained };
});
const moveUp    = () => move(c => {
  const col = grid.map(r => r[c]);
  const { row, gained } = slide(col);
  row.forEach((v, r) => grid[r][c] = v);
  return { original: col, newLine: row, gained };
});
const moveDown  = () => move(c => {
  const col = grid.map(r => r[c]).reverse();
  const { row, gained } = slide(col);
  row.reverse().forEach((v, r) => grid[r][c] = v);
  return { original: col.reverse(), newLine: grid.map(r => r[c]), gained };
});

function noMoves() {
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) return false;
      if (c < size - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < size - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  return true;
}

/* ---------- keyboard handler ---------- */
document.addEventListener("keydown", async e => {
  let res = { moved:false, merged:false }, dir="";
  if (e.key==="ArrowLeft")  { res = moveLeft();  dir="left"; }
  if (e.key==="ArrowRight") { res = moveRight(); dir="right"; }
  if (e.key==="ArrowUp")    { res = moveUp();    dir="up"; }
  if (e.key==="ArrowDown")  { res = moveDown();  dir="down"; }

  if (!res.moved) return;
  addRandomTile(); drawGrid(); updateScore();

  if (noMoves()) {
    await saveScore(score);               // update totals
    alert(`Game Over! Score: ${score}`);
    initGrid(); return;
  }
  if (res.merged) await sendMove(dir);    // tx only on merge
});

/* ---------- misc ---------- */
resetBtn.onclick = initGrid;
window.addEventListener("load", initGrid);
