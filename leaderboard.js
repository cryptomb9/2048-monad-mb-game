const LB_KEY = "2048_leaderboard";
const lbDiv  = document.getElementById("leaderboard");

function readBoard()  { return JSON.parse(localStorage.getItem(LB_KEY) || "{}"); }
function writeBoard(o){ localStorage.setItem(LB_KEY, JSON.stringify(o)); }

export function saveScore(score) {
  if (!window.currentAcc) return;
  const w = window.currentAcc.toLowerCase();
  const b = readBoard();
  b[w] = (b[w] || 0) + score;
  writeBoard(b);
  renderBoard();
}

export function renderBoard() {
  if (!lbDiv) return;
  const top = Object.entries(readBoard())
    .sort((a,b)=>b[1]-a[1]).slice(0,10);

  lbDiv.innerHTML = "<h3>🏆 Leaderboard</h3>";
  const ol = document.createElement("ol");
  top.forEach(([w,s])=>{
    const li = document.createElement("li");
    li.textContent = `${w.slice(0,6)}…${w.slice(-4)} — ${s}`;
    ol.appendChild(li);
  });
  lbDiv.appendChild(ol);
}
renderBoard();
