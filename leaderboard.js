const KEY = "lb_v1";
const btn = document.getElementById("toggle-leaderboard");
const box = document.getElementById("leaderboard-container");

btn.onclick = () => {
  box.style.display = box.style.display === "none" ? "block" : "none";
  render();
};

function store(){return JSON.parse(localStorage.getItem(KEY)||"{}");}
function save(o){localStorage.setItem(KEY,JSON.stringify(o));}

export function saveScore(score){
  if(!window.currentAcc) return;
  const w = window.currentAcc.toLowerCase();
  const lb = store();
  lb[w]=(lb[w]||0)+score;
  save(lb); render();
}
function render(){
  const data=store();
  const entries=Object.entries(data).sort(([,a],[,b])=>b-a).slice(0,10);
  box.innerHTML="<h3>🏆 Leaderboard</h3>";
  const ol=document.createElement("ol");
  entries.forEach(([w,s])=>{
    const li=document.createElement("li");
    li.textContent=`${w.slice(0,6)}…${w.slice(-4)} — ${s}`;
    ol.appendChild(li);
  });
  box.appendChild(ol);
}
