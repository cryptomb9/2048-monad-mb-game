/* ═════════ leaderboard.js ══════════════════════
   Keeps a running total per wallet in localStorage
   and renders a top-10 list inside #leaderboard.
   saveScore(score) is exposed globally.
================================================*/
const LB_KEY = "2048_leaderboard";
const lbDiv  = document.getElementById("leaderboard");

function getBoard() {
  return JSON.parse(localStorage.getItem(LB_KEY) || "{}");
}
function setBoard(obj) {
  localStorage.setItem(LB_KEY, JSON.stringify(obj));
}
window.saveScore = function (score) {
  if (!window.currentAcc) return;
  const w = window.currentAcc.toLowerCase();
  const board = getBoard();
  board[w] = (board[w] || 0) + score;
  setBoard(board);
  renderBoard();
};
function renderBoard() {
  if (!lbDiv) return;
  const board = getBoard();
  const top = Object.entries(board)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  lbDiv.innerHTML = "<h3>🏆 Leaderboard</h3>";
  const ol = document.createElement("ol");
  top.forEach(([w, s]) => {
    const li = document.createElement("li");
    li.textContent = `${w.slice(0, 6)}…${w.slice(-4)} — ${s}`;
    ol.appendChild(li);
  });
  lbDiv.appendChild(ol);
}
renderBoard();
