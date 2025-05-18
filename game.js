import { saveScore } from "./leaderboard.js";

const size=4;
let grid=[],score=0;
const g=document.getElementById("game-container"),
      s=document.getElementById("score"),
      r=document.getElementById("reset-game");

const update=()=>s.textContent=`Score: ${score}`;

function randTile(){
  const empty=[];for(let i=0;i<size;i++)for(let j=0;j<size;j++)!grid[i][j]&&empty.push([i,j]);
  if(!empty.length)return;const[tX,tY]=empty[Math.random()*empty.length|0];
  grid[tX][tY]=Math.random()<.9?2:4;
}

function draw(){g.innerHTML="";grid.flat().forEach(v=>{const d=document.createElement("div");d.className="tile";if(v)d.textContent=v;g.appendChild(d);});}

function slide(row){let arr=row.filter(v=>v),g=0;for(let i=0;i<arr.length-1;i++)if(arr[i]===arr[i+1]){arr[i]*=2;g+=arr[i];arr[i+1]=0;}
  arr=arr.filter(v=>v);while(arr.length<size)arr.push(0);return{row:arr,gain:g};}

const eq=(a,b)=>a.every((v,i)=>v===b[i]);

function move(fn){
  let moved=false,merged=false;
  for(let i=0;i<size;i++){
    const{orig,line,g}=fn(i);if(!eq(orig,line))moved=true;if(g)merged=true;score+=g;
  }
  return{moved,merged};
}

const L=()=>move(i=>{const o=[...grid[i]],{row,gain}=slide(grid[i]);grid[i]=row;return{orig:o,line:row,g:gain};});
const R=()=>move(i=>{const o=[...grid[i]].reverse(),{row,gain}=slide(o);grid[i]=row.reverse();return{orig:o.reverse(),line:grid[i],g:gain};});
const U=()=>move(c=>{const col=grid.map(r=>r[c]),{row,gain}=slide(col);row.forEach((v,r)=>grid[r][c]=v);return{orig:col,line:row,g:gain};});
const D=()=>move(c=>{const col=grid.map(r=>r[c]).reverse(),{row,gain}=slide(col);row.reverse().forEach((v,r)=>grid[r][c]=v);return{orig:col.reverse(),line:grid.map(r=>r[c]),g:gain};});

function stuck(){for(let r=0;r<size;r++)for(let c=0;c<size;c++){if(!grid[r][c])return false;if(c<size-1&&grid[r][c]===grid[r][c+1])return false;if(r<size-1&&grid[r][c]===grid[r+1][c])return false;}return true;}

async function handle(res,dir){
  if(!res.moved)return;randTile();draw();update();if(stuck()){await saveScore(score);alert(`Game over: ${score}`);init();return;}if(res.merged)await window.sendMove(dir);}

window.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft") handle(L(),"left");
  if(e.key==="ArrowRight")handle(R(),"right");
  if(e.key==="ArrowUp")   handle(U(),"up");
  if(e.key==="ArrowDown") handle(D(),"down");
});

let sx=0,sy=0;g.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;});
g.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>Math.abs(dy)){dx>30?handle(R(),"right"):dx<-30&&handle(L(),"left");}else{dy>30?handle(D(),"down"):dy<-30&&handle(U(),"up");}});

r.onclick=async()=>{await saveScore(score);init();};

function init(){grid=Array(size).fill().map(()=>Array(size).fill(0));score=0;randTile();randTile();draw();update();}
window.addEventListener("load",init);
