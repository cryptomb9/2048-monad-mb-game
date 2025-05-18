const btn = document.getElementById("toggle-leaderboard");
const box = document.getElementById("leaderboard-container");
const KEY = "leaderboard_v1";

btn.addEventListener("click", () => {
  box.style.display = box.style.display === "none" ? "block" : "none";
  renderLB();
});

function getLB(){return JSON.parse(localStorage.getItem(KEY)||"{}");}
function setLB(o){localStorage.setItem(KEY,JSON.stringify(o));}

export function saveScore(score){
  if(!window.currentAcc) return;
  const w = window.currentAcc.toLowerCase();
  const board = getLB();
  board[w] = (board[w]||0)+score;   // cumulative
  setLB(board); renderLB();
}

export function renderLB(){
  const data=getLB();
  const rows=Object.entries(data).sort(([,a],[,b])=>b-a).slice(0,10);
  box.innerHTML="<h3>🏆 Leaderboard</h3>";
  const ol=document.createElement("ol");
  rows.forEach(([w,s])=>{
    const li=document.createElement("li");
    li.textContent=`${w.slice(0,6)}…${w.slice(-4)} — ${s}`;
    ol.appendChild(li);
  });
  box.appendChild(ol);
}
