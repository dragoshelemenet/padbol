const DEFAULT_STATE = {
  teamA: 'București',
  teamB: 'Cluj',
  scoreA: 0,
  scoreB: 0,
  metaA: 'Echipa A',
  metaB: 'Echipa B',
  eventTitle: 'Campionat Național de Padbol',
  eventSubtitle: 'Federația Română de Padbol',
  timer: '00:00',
  status: 'LIVE',
  round: 'Set 1',
  bgImage: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1800&q=85'
};
const KEY = 'padbol_score_state_v1';
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('padbol_score_channel') : null;
function getState(){
  try{return {...DEFAULT_STATE,...JSON.parse(localStorage.getItem(KEY) || '{}')}}catch(e){return {...DEFAULT_STATE}}
}
function setState(next){
  const state = {...getState(),...next};
  localStorage.setItem(KEY,JSON.stringify(state));
  if(channel) channel.postMessage(state);
  window.dispatchEvent(new CustomEvent('score:update',{detail:state}));
}
function fillScorePage(){
  const root = document.querySelector('[data-score-page]');
  if(!root) return;
  const apply = (state)=>{
    document.documentElement.style.setProperty('--bg',`url('${state.bgImage || DEFAULT_STATE.bgImage}')`);
    const map = {
      teamA: state.teamA, teamB: state.teamB, scoreA: state.scoreA, scoreB: state.scoreB,
      metaA: state.metaA, metaB: state.metaB, eventTitle: state.eventTitle,
      eventSubtitle: state.eventSubtitle, timer: state.timer, status: state.status, round: state.round
    };
    Object.entries(map).forEach(([k,v])=>{
      document.querySelectorAll(`[data-bind="${k}"]`).forEach(el=>el.textContent = v ?? '');
    });
  };
  apply(getState());
  window.addEventListener('score:update',e=>apply(e.detail));
  window.addEventListener('storage',e=>{if(e.key===KEY) apply(getState())});
  if(channel) channel.onmessage = e=>apply(e.data);
}
function adminPage(){
  const login = document.querySelector('#loginCard');
  const panel = document.querySelector('#adminPanel');
  if(!login || !panel) return;
  const pass = document.querySelector('#password');
  const err = document.querySelector('#loginError');
  const ok = document.querySelector('#saveOk');
  const fields = ['teamA','teamB','scoreA','scoreB','metaA','metaB','eventTitle','eventSubtitle','timer','status','round','bgImage'];
  function showPanel(){login.classList.add('hidden');panel.classList.remove('hidden');loadForm()}
  function loadForm(){const s=getState();fields.forEach(id=>{const el=document.querySelector('#'+id);if(el) el.value=s[id] ?? ''})}
  function saveForm(){
    const next={};fields.forEach(id=>{const el=document.querySelector('#'+id);if(el) next[id] = id.includes('score') ? Number(el.value||0) : el.value});
    setState(next);ok.textContent='Salvat. Pagina de scor se actualizează live.';setTimeout(()=>ok.textContent='',1800);
  }
  document.querySelector('#loginBtn').addEventListener('click',()=>{
    if(pass.value === 'admin123'){sessionStorage.setItem('padbol_admin','1');showPanel()}else{err.textContent='Parolă greșită.'}
  });
  pass.addEventListener('keydown',e=>{if(e.key==='Enter') document.querySelector('#loginBtn').click()});
  document.querySelector('#saveBtn').addEventListener('click',saveForm);
  document.querySelector('#resetBtn').addEventListener('click',()=>{localStorage.removeItem(KEY);setState(DEFAULT_STATE);loadForm()});
  document.querySelectorAll('[data-plus]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.plus;const el=document.querySelector('#'+id);el.value=Number(el.value||0)+1;saveForm()}));
  document.querySelectorAll('[data-minus]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.minus;const el=document.querySelector('#'+id);el.value=Math.max(0,Number(el.value||0)-1);saveForm()}));
  document.querySelector('#swapBtn').addEventListener('click',()=>{
    const a=document.querySelector('#teamA'),b=document.querySelector('#teamB'),sa=document.querySelector('#scoreA'),sb=document.querySelector('#scoreB'),ma=document.querySelector('#metaA'),mb=document.querySelector('#metaB');
    [a.value,b.value]=[b.value,a.value];[sa.value,sb.value]=[sb.value,sa.value];[ma.value,mb.value]=[mb.value,ma.value];saveForm();
  });
  if(sessionStorage.getItem('padbol_admin')==='1') showPanel();
}
fillScorePage();adminPage();
