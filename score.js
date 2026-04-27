const DEFAULT_STATE={
  teamA:'România', teamB:'Oponenți', playerA:'Echipa A', playerB:'Echipa B',
  scoreA:0, scoreB:0, setsA:0, setsB:0,
  event:'Federația Română de Padbol', competition:'Meci oficial Padbol', meta:'Live Score • 2026', sponsor:'FRP'
};
const KEY='padbolScoreState.v1';
function loadState(){try{return {...DEFAULT_STATE,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return {...DEFAULT_STATE}}}
function saveState(s){localStorage.setItem(KEY,JSON.stringify(s)); try{new BroadcastChannel('padbol-score').postMessage(s)}catch(e){} window.dispatchEvent(new CustomEvent('score:update',{detail:s}))}
function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0))}
function setText(id,value){const el=document.getElementById(id); if(el) el.textContent=value}
function renderScore(s=loadState()){
  setText('teamA',s.teamA); setText('teamB',s.teamB); setText('playerA',s.playerA); setText('playerB',s.playerB);
  setText('scoreA',s.scoreA); setText('scoreB',s.scoreB); setText('event',s.event); setText('competition',s.competition); setText('meta',s.meta); setText('sponsor',s.sponsor);
  document.querySelectorAll('[data-set-a]').forEach((el,i)=>el.classList.toggle('on',i<s.setsA));
  document.querySelectorAll('[data-set-b]').forEach((el,i)=>el.classList.toggle('on',i<s.setsB));
}
function bootScore(){renderScore(); try{const bc=new BroadcastChannel('padbol-score'); bc.onmessage=e=>renderScore(e.data)}catch(e){} window.addEventListener('storage',e=>{if(e.key===KEY)renderScore(loadState())})}
function bootAdmin(){
  const login=document.getElementById('login'); const dash=document.getElementById('dash'); const pass=document.getElementById('pass'); const err=document.getElementById('err');
  const unlocked=sessionStorage.getItem('padbolAdmin')==='1';
  if(unlocked){login.classList.add('hidden');dash.classList.remove('hidden')}
  document.getElementById('loginBtn').onclick=()=>{if(pass.value==='admin123'){sessionStorage.setItem('padbolAdmin','1');login.classList.add('hidden');dash.classList.remove('hidden');err.textContent=''}else{err.textContent='Parolă greșită.'}};
  const ids=['teamA','teamB','playerA','playerB','event','competition','meta','sponsor'];
  function fill(){const s=loadState(); ids.forEach(id=>{const el=document.getElementById('in_'+id); if(el)el.value=s[id]}); ['scoreA','scoreB','setsA','setsB'].forEach(id=>setText('admin_'+id,s[id])); renderScore(s)}
  function mutate(fn){const s=loadState(); fn(s); saveState(s); fill()}
  ids.forEach(id=>{const el=document.getElementById('in_'+id); el.addEventListener('input',()=>mutate(s=>s[id]=el.value))});
  document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{
    const [field,op]=btn.dataset.action.split(':'); mutate(s=>{s[field]=clamp((Number(s[field])||0)+(op==='plus'?1:-1),0,99)})
  }));
  document.getElementById('swap').onclick=()=>mutate(s=>{[s.teamA,s.teamB]=[s.teamB,s.teamA];[s.playerA,s.playerB]=[s.playerB,s.playerA];[s.scoreA,s.scoreB]=[s.scoreB,s.scoreA];[s.setsA,s.setsB]=[s.setsB,s.setsA]});
  document.getElementById('resetScore').onclick=()=>mutate(s=>{s.scoreA=0;s.scoreB=0});
  document.getElementById('resetAll').onclick=()=>saveState({...DEFAULT_STATE});
  fill(); try{const bc=new BroadcastChannel('padbol-score'); bc.onmessage=()=>fill()}catch(e){}
}
