import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x010208,.013);

const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,1200);
camera.position.set(0,4,21);

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;
$('#scene').appendChild(renderer.domElement);

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),1.4,.62,.1);
composer.addPass(bloom);
const rgb=new ShaderPass(RGBShiftShader);
rgb.uniforms.amount.value=.00045;
composer.addPass(rgb);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.enablePan=false;
controls.minDistance=7;
controls.maxDistance=34;
controls.autoRotate=true;
controls.autoRotateSpeed=.22;
controls.target.set(2.4,0,0);

scene.add(new THREE.AmbientLight(0x565b83,.82));
const violetLight=new THREE.PointLight(0x8b6cff,55,90);violetLight.position.set(-8,8,10);scene.add(violetLight);
const cyanLight=new THREE.PointLight(0x3cdcff,45,85);cyanLight.position.set(11,-6,7);scene.add(cyanLight);
const warmLight=new THREE.PointLight(0xff8d4a,30,65);warmLight.position.set(-12,-7,-6);scene.add(warmLight);

function galaxy(count=18000){
  const geo=new THREE.BufferGeometry();
  const pos=new Float32Array(count*3),col=new Float32Array(count*3);
  const c1=new THREE.Color(0x6f51ff),c2=new THREE.Color(0x3cdcff),c3=new THREE.Color(0xffffff);
  for(let i=0;i<count;i++){
    const radius=Math.pow(Math.random(),.62)*120+4;
    const branch=i%5;
    const angle=branch/5*Math.PI*2+radius*.085+(Math.random()-.5)*.5;
    const spread=Math.pow(Math.random(),2.2)*10*(Math.random()<.5?-1:1);
    pos[i*3]=Math.cos(angle)*(radius+spread);
    pos[i*3+1]=(Math.random()-.5)*Math.max(1.5,radius*.08);
    pos[i*3+2]=Math.sin(angle)*(radius+spread);
    const mix=Math.random();
    const c=mix<.45?c1.clone().lerp(c2,mix*2):c2.clone().lerp(c3,(mix-.45)/.55);
    col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  return new THREE.Points(geo,new THREE.PointsMaterial({size:.16,vertexColors:true,transparent:true,opacity:.84,depthWrite:false,blending:THREE.AdditiveBlending}));
}
const galaxyField=galaxy();scene.add(galaxyField);

const dustGeo=new THREE.BufferGeometry(),dustCount=3500,dustPos=new Float32Array(dustCount*3);
for(let i=0;i<dustCount;i++){dustPos[i*3]=(Math.random()-.5)*80;dustPos[i*3+1]=(Math.random()-.5)*26;dustPos[i*3+2]=(Math.random()-.5)*80}
dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xb4c3ff,size:.06,transparent:true,opacity:.34,depthWrite:false}));
scene.add(dust);

const worlds={
 core:{code:'WORLD ∞',title:'AI Core',text:'The intelligence heart of the creator universe.',color:0x8b6cff,position:[2.5,0,0],size:2.15,orbit:0},
 identity:{code:'WORLD 01',title:'Digital Identity',text:'Profile, badges, reputation and private creator memory.',color:0x3cdcff,position:[-6.4,2.6,-2],size:1.3,orbit:1},
 music:{code:'WORLD 02',title:'Adaptive Music',text:'Playlists, music-reactive energy and visual modes.',color:0xff50d8,position:[8,3.2,-4],size:1.5,orbit:2},
 studio:{code:'WORLD 03',title:'Creator Studio',text:'Ideas, release plans and intelligent creative tools.',color:0xff9f43,position:[-7.3,-3.6,-5],size:1.42,orbit:3},
 community:{code:'WORLD 04',title:'Live Network',text:'Realtime rooms, reactions and audience presence.',color:0x5ff19b,position:[8.4,-4,-5.8],size:1.55,orbit:4}
};
const worldObjects={};
function atmosphere(size,color,opacity=.12){
  return new THREE.Mesh(new THREE.SphereGeometry(size,56,56),new THREE.MeshBasicMaterial({color,transparent:true,opacity,side:THREE.BackSide,blending:THREE.AdditiveBlending}));
}
for(const [id,w] of Object.entries(worlds)){
  const g=new THREE.Group();g.position.set(...w.position);
  let material;
  if(id==='core'){
    material=new THREE.ShaderMaterial({
      uniforms:{time:{value:0},colorA:{value:new THREE.Color(0x4f2cff)},colorB:{value:new THREE.Color(0xb8aaff)}},
      vertexShader:`varying vec3 vNormal;varying vec3 vPos;void main(){vNormal=normal;vPos=position;vec3 p=position+normal*sin(position.y*7.0+position.x*4.0)*0.045;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
      fragmentShader:`uniform float time;uniform vec3 colorA;uniform vec3 colorB;varying vec3 vNormal;varying vec3 vPos;void main(){float f=pow(1.0-dot(normalize(vNormal),vec3(0.0,0.0,1.0)),2.0);float pulse=.5+.5*sin(time*2.4+vPos.y*8.0);vec3 c=mix(colorA,colorB,pulse*.45+f*.55);gl_FragColor=vec4(c,1.0);}`
    });
  }else{
    material=new THREE.MeshStandardMaterial({color:w.color,roughness:.34,metalness:.3,emissive:w.color,emissiveIntensity:.16});
  }
  const planet=new THREE.Mesh(new THREE.SphereGeometry(w.size,72,72),material);planet.userData.world=id;g.add(planet);
  g.add(atmosphere(w.size*1.18,w.color,id==='core'?.17:.11));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(w.size*1.55,.018,8,180),new THREE.MeshBasicMaterial({color:w.color,transparent:true,opacity:.6}));
  ring.rotation.x=Math.PI/2.25;g.add(ring);
  scene.add(g);worldObjects[id]={group:g,planet,ring,base:new THREE.Vector3(...w.position)};
}

const shootingStars=[];
for(let i=0;i<5;i++){
  const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(-3,0,0)]);
  const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.65}));
  line.position.set((Math.random()-.5)*45,8+Math.random()*18,-20-Math.random()*40);
  line.rotation.z=-.55;scene.add(line);shootingStars.push(line);
}

const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
renderer.domElement.addEventListener('pointerup',e=>{
  pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(Object.values(worldObjects).map(x=>x.planet),false)[0];
  if(hit)selectWorld(hit.object.userData.world);
});

const music=$('#music');let audioOn=false,analyser=null,audioCtx=null,audioData=null;
async function toggleAudio(){
  if(!music.querySelector('source')){
    toast('Music track coming soon');
    return;
  }
  try{
    if(music.paused){
      await music.play();audioOn=true;$('#audioToggle').textContent='AUDIO ON';bloom.strength=1.9;
      if(!analyser){
        audioCtx=new (window.AudioContext||window.webkitAudioContext)();
        const source=audioCtx.createMediaElementSource(music);
        analyser=audioCtx.createAnalyser();analyser.fftSize=128;source.connect(analyser);analyser.connect(audioCtx.destination);audioData=new Uint8Array(analyser.frequencyBinCount);
      }
    }else{music.pause();audioOn=false;$('#audioToggle').textContent='AUDIO OFF';bloom.strength=1.4}
  }catch{toast('music-1.mp3 could not play')}
}
$('#audioToggle').onclick=toggleAudio;

const panelContent={
 core:()=>`<div class="module-card"><b>Creator Intelligence</b><span>Generate a direction for your next release.</span><textarea id="prompt" placeholder="Ask the core..."></textarea><button id="ask">GENERATE</button><p id="answer"></p></div>`,
 identity:()=>`<div class="module-card"><b>Creator Identity</b><span>Saved privately on this device.</span><input id="name" placeholder="Creator name"><input id="handle" placeholder="@handle"><button id="saveIdentity">SAVE</button><p id="identityState"></p></div>`,
 music:()=>`<div class="module-card"><b>Music Reactor</b><span>Galaxy bloom and rotation react to audio energy.</span><button id="panelAudio">PLAY / PAUSE</button></div>`,
 studio:()=>`<div class="module-card"><b>Idea Vault</b><span>Keep your next concept locally.</span><textarea id="idea" placeholder="Release idea..."></textarea><button id="saveIdea">SAVE IDEA</button><p id="ideaState"></p></div>`,
 community:()=>`<div class="module-card"><b>Presence Scan</b><span>Realtime backend can replace this local simulation.</span><button id="scan">SCAN NETWORK</button><p id="scanResult">No scan yet.</p></div>`
};
let selected='core',travelTarget=null,traveling=false;
function selectWorld(id){
  selected=id;const w=worlds[id];$('#panelCode').textContent=w.code;$('#panelTitle').textContent=w.title;$('#panelText').textContent=w.text;$('#panelBody').innerHTML=panelContent[id]();$('#panel').classList.add('open');$$('.dock button').forEach(b=>b.classList.toggle('active',b.dataset.world===id));bindPanel(id)
}
function bindPanel(id){
  if(id==='core')$('#ask').onclick=()=>{const q=$('#prompt').value.trim();if(q)$('#answer').textContent=`Direction: make “${q}” emotionally clear, visually iconic and easy to share.`};
  if(id==='identity'){const s=JSON.parse(localStorage.getItem('omega-identity')||'null');if(s){$('#name').value=s.name;$('#handle').value=s.handle;$('#identityState').textContent=`Active: ${s.name} ${s.handle}`};$('#saveIdentity').onclick=()=>{const v={name:$('#name').value.trim(),handle:$('#handle').value.trim()};localStorage.setItem('omega-identity',JSON.stringify(v));$('#identityState').textContent=`Saved: ${v.name} ${v.handle}`}};
  if(id==='music')$('#panelAudio').onclick=toggleAudio;
  if(id==='studio'){$('#idea').value=localStorage.getItem('omega-idea')||'';$('#saveIdea').onclick=()=>{localStorage.setItem('omega-idea',$('#idea').value);$('#ideaState').textContent='Idea stored locally.'}};
  if(id==='community')$('#scan').onclick=()=>{$('#scanResult').textContent=`${Math.floor(20+Math.random()*280)} creator signals detected.`};
}
$('#closePanel').onclick=()=>$('#panel').classList.remove('open');
$$('[data-world]').forEach(b=>b.onclick=()=>selectWorld(b.dataset.world));

$('#travel').onclick=()=>{
  const p=worldObjects[selected].group.position.clone();
  travelTarget={position:p.clone().add(new THREE.Vector3(0,1.2,6.4)),look:p.clone()};
  traveling=true;controls.enabled=false;$('#intro').classList.add('hidden');$('#status').textContent=`TRAVELING TO ${worlds[selected].title.toUpperCase()}`;toast(`Entering ${worlds[selected].title}`)
};

function resetCamera(){
  travelTarget={position:new THREE.Vector3(0,4,21),look:new THREE.Vector3(2.4,0,0)};traveling=true;controls.enabled=false;$('#status').textContent='GALAXY ONLINE'
}
$('#resetCamera').onclick=resetCamera;
$('#enter').onclick=()=>{$('#intro').classList.add('hidden');controls.autoRotate=false;selectWorld('core')};

$('#motion').onclick=async()=>{
  try{
    if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const p=await DeviceOrientationEvent.requestPermission();if(p!=='granted')throw new Error()}
    addEventListener('deviceorientation',e=>{if(e.gamma==null)return;camera.rotation.z=THREE.MathUtils.lerp(camera.rotation.z,-e.gamma*.0025,.06)});toast('Motion enabled')
  }catch{toast('Motion unavailable')}
};

$('#radar').innerHTML=Object.values(worlds).map(w=>`<div class="radar-row" style="color:#${w.color.toString(16).padStart(6,'0')}"><span>${w.title}</span><i></i></div>`).join('');

function toast(t){const x=$('#toast');x.textContent=t;x.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>x.classList.remove('show'),1800)}

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);const t=clock.getElapsedTime();
  let energy=0;if(analyser&&audioOn){analyser.getByteFrequencyData(audioData);energy=audioData.reduce((a,b)=>a+b,0)/(audioData.length*255)}
  galaxyField.rotation.y+=.00018*(1+energy*4);dust.rotation.y-=.00008;
  for(const [id,o] of Object.entries(worldObjects)){
    if(id==='core'&&o.planet.material.uniforms)o.planet.material.uniforms.time.value=t;
    o.planet.rotation.y+=id==='core'?.006+energy*.012:.0025+energy*.004;
    o.ring.rotation.z+=id==='core'?.004:.0015;
    o.group.position.y=o.base.y+Math.sin(t*.55+worlds[id].orbit)*.22;
    const s=1+energy*(id==='core'?.16:.05);o.group.scale.setScalar(s);
  }
  shootingStars.forEach((s,i)=>{s.position.x+=.12+i*.015;s.position.y-=.025;if(s.position.x>35){s.position.x=-35;s.position.y=8+Math.random()*18;s.position.z=-20-Math.random()*40}});
  if(traveling&&travelTarget){
    camera.position.lerp(travelTarget.position,.035);controls.target.lerp(travelTarget.look,.045);
    if(camera.position.distanceTo(travelTarget.position)<.12){traveling=false;controls.enabled=true}
  }
  controls.update();composer.render()
}
animate();

function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6))}
addEventListener('resize',resize);

const lines=['Generating spiral galaxy…','Igniting AI core…','Calibrating planetary worlds…','Synchronizing audio reactor…','Omega engine ready.'];
let progress=0,i=0;const boot=setInterval(()=>{progress=Math.min(100,progress+17+Math.random()*15);$('#bootBar').style.width=progress+'%';$('#bootLine').textContent=lines[Math.min(lines.length-1,i++)];if(progress>=100){clearInterval(boot);setTimeout(()=>$('#boot').classList.add('hide'),550)}},360);

if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
