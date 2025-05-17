import { saveScore, renderBoard } from "./leaderboard.js";

let grid=[], score=0; const size=4;

const cont = document.getElementById("game-container");
const scoreDiv = document.getElementById("score");
const resetBtn = document.getElementById("reset-game");
const endBtn   = document.getElementById("end-game");

const updateScore = () => scoreDiv.textContent = `Score: ${score}`;

function initGrid(){
  grid = Array(size).fill().map(()=>Array(size).fill(0));
  score = 0; addRandom(); addRandom();
  draw(); updateScore(); renderBoard();
}

function addRandom(){
  const empty=[]; for(let r=0;r<size;r++)for(let c=0;c<size;c++)!grid[r][c]&&empty.push([r,c]);
  if(!empty.length) return;
  const [r,c]=empty[Math.floor(Math.random()*empty.length)];
  grid[r][c] = Math.random()<.9?2:4;
}

function draw(){
  cont.innerHTML=""; grid.flat().forEach(v=>{
    const d=document.createElement("div"); d.className="tile";
    if(v){d.textContent=v; d.dataset.value=v;} cont.appendChild(d);
  });
}

function slide(row){
  let arr=row.filter(v=>v), gained=0;
  for(let i=0;i<arr.length-1;i++) if(arr[i]===arr[i+1]){arr[i]*=2; gained+=arr[i]; arr[i+1]=0;}
  arr=arr.filter(v=>v); while(arr.length<size) arr.push(0);
  return {row:arr, gained};
}
const eq=(a,b)=>a.every((v,i)=>v===b[i]);

function move(build){
  let moved=false, merged=false;
  for(let i=0;i<size;i++){
    const {orig, line, gain} = build(i);
    if(!eq(orig,line)) moved=true;
    if(gain) merged=true;
    score+=gain;
  }
  return {moved, merged};
}

const left = () => move(i=>{const o=[...grid[i]]; const {row,gained}=slide(grid[i]); grid[i]=row; return {orig:o,line:row,gain:gained};});
const right= () => move(i=>{const o=[...grid[i]].reverse(); const{row,gained}=slide(o); grid[i]=row.reverse(); return{orig:o.reverse(),line:grid[i],gain:gained};});
const up   = () => move(c=>{const col=grid.map(r=>r[c]); const{row,gained}=slide(col); row.forEach((v,r)=>grid[r][c]=v); return{orig:col,line:row,gain:gained};});
const down = () => move(c=>{const col=grid.map(r=>r[c]).reverse(); const{row,gained}=slide(col); row.reverse().forEach((v,r)=>grid[r][c]=v); return{orig:col.reverse(),line:grid.map(r=>r[c]),gain:gained};});

function stuck(){
  for(let r=0;r<size;r++)for(let c=0;c<size;c++){
    if(!grid[r][c]) return false;
    if(c<size-1&&grid[r][c]===grid[r][c+1]) return false;
    if(r<size-1&&grid[r][c]===grid[r+1][c]) return false;
  }
  return true;
}

async function finishGame(){
  await saveScore(score);
  alert(`Score saved: ${score}`);
  initGrid();
}

async function handle(res,dir){
  if(!res.moved) return;
  addRandom(); draw(); updateScore();
  if(stuck()){ await finishGame(); return; }
  if(res.merged) await sendMove(dir);
}

/* keyboard */
document.addEventListener("keydown",e=>{
  if(e.key.startsWith("Arrow")){
    const map={ArrowLeft:left,ArrowRight:right,ArrowUp:up,ArrowDown:down};
    handle(map[e.key](), e.key.replace("Arrow","").toLowerCase());
  }
});

/* swipe */
let sx=0,sy=0; cont.addEventListener("touchstart",e=>{sx=e.touches[0].clientX; sy=e.touches[0].clientY;});
cont.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
  if(Math.abs(dx)<30 && Math.abs(dy)<30) return;
  if(Math.abs(dx)>Math.abs(dy)){
    handle(dx>0?right():left(), dx>0?"right":"left");
  }else{
    handle(dy>0?down():up(),  dy>0?"down":"up");
  }
});

/* buttons */
resetBtn.onclick = initGrid;
endBtn  .onclick = finishGame;
window.addEventListener("load", initGrid);
