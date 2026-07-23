window.EDITOR_RAJ_CONFIG=window.EDITOR_RAJ_CONFIG||{};
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const CHANNEL_ID='UCXBXbRGKFvyH83jjgCVD2gQ';
const body=document.body,audio=$('#audio'),heroPlay=$('#heroPlay'),miniPlay=$('#miniPlay'),wave=$('#wave');
let latestVideos=[],popularVideos=[],visibleCount=6,activeFilter='all';

const FALLBACK=[
{id:'mQGjBsBttLE',title:'Featured Lofi Edit',category:'haryanvi',views:'Popular',likes:'—',comments:'—',date:'Featured'},
{id:'cnVmRi_q0l0',title:'Late Night Melody',category:'rajasthani',views:'Popular',likes:'—',comments:'—',date:'Featured'},
{id:'OmGzOoHEJbo',title:'Cinematic Reverb Mix',category:'bollywood',views:'Popular',likes:'—',comments:'—',date:'Featured'}
];

addEventListener('load',()=>setTimeout(()=>body.classList.add('loaded'),350));
addEventListener('scroll',()=>{
  $('#topbar').classList.toggle('scrolled',scrollY>30);
  $('#miniPlayer').classList.toggle('show',scrollY>520);
  const max=document.documentElement.scrollHeight-innerHeight;
  $('#scrollProgress').style.width=(max>0?scrollY/max*100:0)+'%';
});

$('#menuBtn').onclick=()=>$('#navLinks').classList.toggle('open');
$$('#navLinks a').forEach(a=>a.onclick=()=>$('#navLinks').classList.remove('open'));

const saved=localStorage.getItem('theeditorraj-theme');
if(saved==='light')body.classList.add('light');
function syncTheme(){
  $('#themeBtn').innerHTML=body.classList.contains('light')?'<i class="fa-solid fa-sun"></i>':'<i class="fa-solid fa-moon"></i>';
}
syncTheme();
$('#themeBtn').onclick=()=>{
  body.classList.toggle('light');
  localStorage.setItem('theeditorraj-theme',body.classList.contains('light')?'light':'dark');
  syncTheme();
};

function syncAudio(){
  const icon=audio.paused?'play':'pause';
  heroPlay.innerHTML=`<i class="fa-solid fa-${icon}"></i>`;
  miniPlay.innerHTML=`<i class="fa-solid fa-${icon}"></i>`;
  wave.classList.toggle('playing',!audio.paused);
}
async function toggleAudio(){
  const source=audio.querySelector('source');
  if(!source||!source.getAttribute('src')){
    showToast('Music track coming soon');
    return;
  }
  try{audio.paused?await audio.play():audio.pause();syncAudio()}
  catch(e){showToast('Browser ne audio playback block kiya hai')}
}
heroPlay.onclick=toggleAudio;miniPlay.onclick=toggleAudio;
audio.onplay=syncAudio;audio.onpause=syncAudio;
audio.ontimeupdate=()=>{
  if(!audio.duration)return;
  const p=audio.currentTime/audio.duration*100+'%';
  $('#progress').style.width=p;$('#miniProgress').style.width=p;
};

$('#shareBtn').onclick=()=>shareUrl(location.href,document.title);
$('#topBtn').onclick=()=>scrollTo({top:0,behavior:'smooth'});
$('#year').textContent=new Date().getFullYear();

async function shareUrl(url,title){
  try{
    if(navigator.share)await navigator.share({title,url});
    else{await navigator.clipboard.writeText(url);showToast('Link copied')}
  }catch(e){}
}
function showToast(text){
  const t=$('#toast');t.textContent=text;t.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>t.classList.remove('show'),2200);
}

const io=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting&&e.target.classList.add('show')),{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));

function fmt(n){
  n=Number(n||0);
  if(n>=1e9)return(n/1e9).toFixed(1)+'B';
  if(n>=1e6)return(n/1e6).toFixed(1)+'M';
  if(n>=1e3)return(n/1e3).toFixed(1)+'K';
  return String(n);
}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function guessCategory(title=''){
  const t=title.toLowerCase();
  if(/dj|remix/.test(t))return'dj';
  if(/rajasthani|marwadi|meena/.test(t))return'rajasthani';
  if(/bollywood|hindi/.test(t))return'bollywood';
  return'haryanvi';
}
async function api(path){
  const base=(window.EDITOR_RAJ_CONFIG.API_BASE||'').replace(/\/$/,'');
  if(!base)throw new Error('No API base');
  const res=await fetch(base+path,{cache:'no-store'});
  if(!res.ok)throw new Error('API error');
  return res.json();
}

function videoCard(v,index=0){
  const thumb=v.thumbnail||`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`;
  const url=`https://www.youtube.com/watch?v=${v.id}`;
  return `<article class="video-card">
    <a class="thumb" href="${url}" target="_blank" rel="noopener">
      <img loading="lazy" src="${thumb}" onerror="this.src='https://i.ytimg.com/vi/${v.id}/hqdefault.jpg'" alt="${escapeHtml(v.title)}">
      <span class="play-overlay"><i class="fa-solid fa-play"></i></span>
      ${index<2?'<span class="new-badge">NEW</span>':''}
      ${v.duration?`<span class="duration">${v.duration}</span>`:''}
    </a>
    <div class="video-info">
      <small>${(v.category||'lofi').toUpperCase()} • THEEDITORRAJ</small>
      <h3>${escapeHtml(v.title)}</h3>
      <div class="video-stats">
        <span class="video-stat"><i class="fa-regular fa-eye"></i>${v.views||'—'}</span>
        <span class="video-stat"><i class="fa-regular fa-thumbs-up"></i>${v.likes||'—'}</span>
        <span class="video-stat"><i class="fa-regular fa-comment"></i>${v.comments||'—'}</span>
      </div>
      <div class="video-actions">
        <span class="video-date">${v.date||''}</span>
        <button class="video-share" data-url="${url}" data-title="${escapeHtml(v.title)}"><i class="fa-solid fa-share-nodes"></i> Share</button>
      </div>
    </div>
  </article>`;
}
function bindShares(){
  $$('.video-share').forEach(btn=>btn.onclick=()=>shareUrl(btn.dataset.url,btn.dataset.title));
}
function renderLatest(){
  const q=$('#videoSearch').value.toLowerCase().trim();
  const filtered=latestVideos.filter(v=>(activeFilter==='all'||v.category===activeFilter)&&v.title.toLowerCase().includes(q));
  const shown=filtered.slice(0,visibleCount);
  $('#latestGrid').innerHTML=shown.length?shown.map(videoCard).join(''):'<p class="no-results">Koi matching video nahi mila.</p>';
  $('#loadMoreBtn').style.display=filtered.length>visibleCount?'inline-flex':'none';
  bindShares();
}
function renderPopular(){
  $('#popularGrid').innerHTML=popularVideos.slice(0,3).map((v,i)=>{
    const thumb=v.thumbnail||`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`;
    return `<a class="popular-card" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">
      <img loading="lazy" src="${thumb}" alt="${escapeHtml(v.title)}">
      <span class="rank">#${i+1}</span>
      <div class="content"><small>${fmt(v.views)} views</small><h3>${escapeHtml(v.title)}</h3><p>${v.date||''}</p></div>
    </a>`;
  }).join('');
}
function renderShorts(){
  $('#shortsGrid').innerHTML=latestVideos.slice(0,6).map(v=>{
    const thumb=v.thumbnail||`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`;
    return `<a class="short-card" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">
      <img loading="lazy" src="${thumb}" alt="${escapeHtml(v.title)}">
      <div class="short-info"><span>THEEDITORRAJ SHORT</span><h3>${escapeHtml(v.title)}</h3></div>
    </a>`;
  }).join('');
}

$('#videoSearch').oninput=()=>{visibleCount=6;renderLatest()};
$$('#filters button').forEach(btn=>btn.onclick=()=>{
  $$('#filters button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter=btn.dataset.filter;
  visibleCount=6;
  renderLatest();
});
$('#loadMoreBtn').onclick=()=>{visibleCount+=6;renderLatest()};

async function loadLive(){
  try{
    const [stats,latest,popular]=await Promise.all([
      api(`/channel?channelId=${CHANNEL_ID}`),
      api(`/latest?channelId=${CHANNEL_ID}&maxResults=18`),
      api(`/popular?channelId=${CHANNEL_ID}&maxResults=6`)
    ]);
    $('#subscriberCount').textContent=fmt(stats.subscriberCount);
    $('#viewCount').textContent=fmt(stats.viewCount);
    $('#videoCount').textContent=fmt(stats.videoCount);

    latestVideos=(latest.items||[]).map(x=>({...x,category:guessCategory(x.title),views:fmt(x.views),likes:fmt(x.likes),comments:fmt(x.comments),date:x.publishedAt?new Date(x.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):''}));
    popularVideos=(popular.items||[]).map(x=>({...x,category:guessCategory(x.title),views:fmt(x.views),likes:fmt(x.likes),comments:fmt(x.comments),date:x.publishedAt?new Date(x.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):''}));
    $('#dataStatus').textContent='Live YouTube data connected';
  }catch(e){
    latestVideos=FALLBACK;
    popularVideos=[...FALLBACK].reverse();
    $('#dataStatus').textContent='Featured mode active — live API unavailable';
  }finally{
    $('#latestSkeleton').classList.add('hide');
    renderLatest();renderPopular();renderShorts();
  }
}
loadLive();

if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
