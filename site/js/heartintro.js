/* ===== Въведение при отваряне на сайта ===== */
/* 1) поглед отгоре към операционното поле, камерата се спуска към сърцето (тръгва само);
   2) отдолу ЕКГ като на монитор, отстрани текст за ученето;
   3) при скрол ЕКГ се уголемява до зареждащ екран „PhysioNova“, после се отваря сайтът.
   Моделът е същият като в раздела за сърцето: m/hglb3.txt („Realistic Human Heart“, neshallads, CC BY 4.0).
   Ранният черен екран (#hxo) се слага в началото на <body> в index.html, за да се вижда веднага. */
(function(){"use strict";
if(window.__introPick&&window.__introPick!=="heart")return;
const ov=document.getElementById("hxo");if(!ov)return;window.__hxo=true;
/* въведението е винаги на английски, независимо от езика на сайта */
const EN=true,L=(b,e)=>e;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE=matchMedia("(max-width: 700px)").matches;
const THREE_URL="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
const GLTF="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
const ROOM="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/environments/RoomEnvironment.js";
const load=src=>new Promise((res,rej)=>{if(src===THREE_URL&&window.THREE)return res();if([...document.scripts].some(s=>s.src===src))return res();const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
const brand=document.querySelector(".brand b,.logo b,.brand");const FONT=brand?getComputedStyle(brand).fontFamily:"system-ui,sans-serif";

/* ---------- изглед ---------- */
const css=`
#hxo{position:fixed;inset:0;z-index:100000;background:radial-gradient(120% 80% at 20% 0%,#FBFBFC 0%,rgba(251,251,252,0) 55%),linear-gradient(115deg,#D9DCE0 0%,#F4F5F6 28%,#C9CDD2 46%,#EEF0F2 64%,#D3D7DB 82%,#F6F7F8 100%);color:#eef0ee;overflow:hidden;font-family:${FONT};transition:opacity .7s ease}
#hxo.out{opacity:0;pointer-events:none}
#hxo canvas.gl{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 1.2s ease,transform 1.3s cubic-bezier(.6,0,.2,1)}
#hxo.ready canvas.gl{opacity:1}
#hxo.zoom canvas.gl{transform:scale(1.25);opacity:0}
#hxo .vig{opacity:0;transition:opacity 1s}#hxo.ready .vig{opacity:1}#hxo.zoom .vig{opacity:0}
#hxo:not(.ready) .skip,#hxo:not(.ready) .snd,#hxo.zoom .skip,#hxo.zoom .snd{color:#1D1D1F;background:rgba(255,255,255,.6);border-color:rgba(29,29,31,.14)}
#hxo:not(.ready) .cr{color:#5E5E63}
#hxo .vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 62% at 50% 46%,transparent 40%,rgba(3,4,5,.55) 72%,rgba(3,4,5,.92) 100%)}
#hxo .pre{position:absolute;inset:0;display:grid;place-items:center;font:600 13px/1 system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#5E5E63;transition:opacity .6s}
#hxo.ready .pre{opacity:0}
#hxo .side{text-shadow:0 2px 18px rgba(0,0,0,.85);position:absolute;top:50%;transform:translateY(-50%);max-width:min(30vw,340px);opacity:0;transition:opacity 1s ease,transform 1.2s cubic-bezier(.2,.8,.2,1);pointer-events:none}
#hxo .side.l{left:max(28px,env(safe-area-inset-left,0px));transform:translate(-18px,-50%)}
#hxo .side.r{right:max(28px,env(safe-area-inset-right,0px));text-align:right;transform:translate(18px,-50%)}
#hxo.texts .side{opacity:1;transform:translate(0,-50%)}
#hxo.zoom .side{opacity:0}
#hxo .side small{display:block;font:600 11.5px/1.2 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#ff4d5a;margin-bottom:12px}
#hxo .side b,#hxo .side span,#hxo .side small{text-transform:none}#hxo .side small{text-transform:uppercase}
#hxo .side b{display:block;font-weight:800;font-size:clamp(26px,3.2vw,44px);line-height:1.02;letter-spacing:-.02em;color:#f3f1ec;text-wrap:balance}
#hxo .side span{display:block;margin-top:12px;font:400 15px/1.45 system-ui,sans-serif;color:#b9bfba}
#hxo .mon{position:absolute;left:50%;bottom:max(26px,env(safe-area-inset-bottom,0px));width:min(760px,calc(100% - 40px));height:118px;transform:translate(-50%,40px);opacity:0;
  background:rgba(14,15,17,.72);border:1px solid rgba(255,255,255,.12);border-radius:12px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  transition:opacity .8s ease,transform .9s cubic-bezier(.2,.8,.2,1),width 1.2s cubic-bezier(.6,0,.2,1),height 1.2s cubic-bezier(.6,0,.2,1),bottom 1.2s cubic-bezier(.6,0,.2,1),border-color 1s,background 1s}
#hxo.ecg .mon{opacity:1;transform:translate(-50%,0)}
#hxo.zoom .mon{bottom:calc(50% - 21vh);width:100%;height:42vh;border-color:transparent;background:transparent;border-radius:0}
#hxo .mon canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#hxo .mon .lab{position:absolute;left:12px;top:9px;font:600 11px/1 ui-monospace,monospace;letter-spacing:.12em;color:#ff4d5a;opacity:.85;transition:opacity .6s}
#hxo .mon .hr{position:absolute;right:12px;top:8px;font:600 26px/1 ui-monospace,monospace;color:#ff4d5a;transition:opacity .6s}
#hxo .mon .hr small{font-size:10px;letter-spacing:.12em;margin-left:4px;opacity:.8}
#hxo.zoom .mon .lab,#hxo.zoom .mon .hr{opacity:0}
#hxo .brandx{position:absolute;left:0;right:0;top:calc(50% - 21vh - 10px);transform:translateY(-100%);text-align:center;opacity:0;transition:opacity .9s ease .5s}
#hxo .brandx b{display:block;font-weight:800;font-size:clamp(44px,8vw,104px);letter-spacing:-.03em;color:#1D1D1F;line-height:1}
#hxo .brandx b i{font-style:normal;color:#C8102E}
#hxo .brandx span{display:block;margin-top:12px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#5E5E63}
#hxo.zoom .brandx{opacity:1}
#hxo .load{position:absolute;left:50%;top:calc(50% + 21vh + 26px);transform:translateX(-50%);width:min(320px,70vw);opacity:0;transition:opacity .6s ease .8s;text-align:center;font:500 12px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5E5E63}
#hxo .load i{display:block;height:2px;margin-top:12px;background:rgba(29,29,31,.12);overflow:hidden;border-radius:2px}
#hxo .load i::after{content:"";display:block;height:100%;width:var(--lp,0%);background:#C8102E;transition:width .25s linear}
#hxo.zoom .load{opacity:1}
#hxo .hint{position:absolute;left:50%;bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 132px);transform:translateX(-50%);opacity:0;transition:opacity .8s;
  font:600 12px/1 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#e9ece8;border:0;background:none;cursor:pointer;padding:12px 16px;min-height:44px}
#hxo .hint span{display:inline-block;animation:hxb 1.6s ease-in-out infinite}
@keyframes hxb{50%{transform:translateY(5px)}}
#hxo.hinted .hint{opacity:.9}
#hxo.zoom .hint{opacity:0;pointer-events:none}
#hxo .skip{position:absolute;top:max(14px,env(safe-area-inset-top,0px));right:max(14px,env(safe-area-inset-right,0px));font:600 12px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#cfd4cf;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:12px 16px;min-height:44px;cursor:pointer}
#hxo .snd{position:absolute;top:max(14px,env(safe-area-inset-top,0px));right:calc(max(14px,env(safe-area-inset-right,0px)) + 92px);display:flex;align-items:center;gap:8px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#cfd4cf;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:12px 16px;min-height:44px;cursor:pointer}
#hxo .snd svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
#hxo .snd.on{color:#ff4d5a;border-color:rgba(255,77,90,.4)}
#hxo .snd.ask{animation:hxp 2s ease-in-out infinite}@keyframes hxp{50%{border-color:rgba(255,77,90,.7)}}
#hxo .skip:focus-visible,#hxo .snd:focus-visible,#hxo .hint:focus-visible{outline:2px solid #ff4d5a;outline-offset:3px}
#hxo .cr{position:absolute;left:max(14px,env(safe-area-inset-left,0px));top:max(16px,env(safe-area-inset-top,0px));font:500 10px/1.3 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#7c847e;max-width:46ch}
#hxo .cr a{color:inherit}
#hxo.zoom .cr{opacity:0}
@media (max-width:700px){
  #hxo .side{top:auto;transform:none!important;max-width:none;left:20px!important;right:20px!important;text-align:left!important}
  #hxo .side.l{top:max(64px,calc(env(safe-area-inset-top,0px) + 52px))}
  #hxo .side.r{display:none}
  #hxo .side b{font-size:28px}
  #hxo .mon{height:96px}
  #hxo .hint{bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 104px)}
  #hxo.zoom .mon{bottom:calc(50% - 15vh);height:30vh}
  #hxo .brandx{top:calc(50% - 15vh - 10px)}#hxo .load{top:calc(50% + 15vh + 22px)}
  #hxo .cr{top:auto;bottom:6px;left:20px;font-size:9px}
}
@media (max-width:700px){#hxo .snd .t{display:none}}
@media (prefers-reduced-motion:reduce){#hxo .hint span,#hxo .snd.ask{animation:none}}
`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
ov.innerHTML=`<canvas class="gl" aria-hidden="true"></canvas><div class="vig"></div>
 <div class="pre">${L("Подготвяме операционната…","Preparing the operating room…")}</div>
 <div class="side l"><small>${L("Учи като в операционната","Learn like in the OR")}</small><b>${L("Физиологията, която виждаш да работи","Physiology you can watch at work")}</b><span>${L("Теория по Guyton, живи симулации и 3D модели на органите.","Guyton-based theory, live simulations and 3D organ models.")}</span></div>
 <div class="side r"><small>${L("За студенти по медицина","For medical students")}</small><b>${L("12 раздела · 627 въпроса","12 sections · 627 questions")}</b><span>${L("Целият конспект, с обяснение към всеки отговор.","The whole syllabus, with an explanation for every answer.")}</span></div>
 <div class="mon"><canvas aria-hidden="true"></canvas><span class="lab">II · 25 mm/s</span><span class="hr"><span id="hxo-hr">72</span><small>${L("УД./МИН","BPM")}</small></span></div>
 <div class="brandx"><b>Physio<i>Nova</i></b><span>${L("Симулатор по физиология","Physiology simulator")}</span></div>
 <div class="load">${L("Отваряме началната страница","Opening the home page")}<i></i></div>
 <button class="hint" type="button">${L("Скролни, за да влезеш","Scroll to enter")} <span>↓</span></button>
 <button class="snd ask" type="button" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path class="w1" d="M16 9a4 4 0 0 1 0 6"/><path class="w2" d="M18.5 6.5a8 8 0 0 1 0 11"/></svg><span class="t">Tap for heartbeat sound</span></button>
 <button class="skip" type="button">${L("Пропусни","Skip")}</button>
 <div class="cr">${L("Модел","Model")}: <a href="https://sketchfab.com/3d-models/realistic-human-heart-3f8072336ce94d18b3d0d055a1ece089" target="_blank" rel="noopener">Realistic Human Heart</a> · neshallads · CC BY 4.0</div>`;
const $=s=>ov.querySelector(s);

/* ---------- звук: сърдечни тонове S1 („lub“) и S2 („dub“), синтезирани с Web Audio ----------
   Браузърите пускат звук само след докосване, клик или клавиш, затова контекстът се създава при първия такъв жест. */
let AC=null,MG=null,sndOn=false,sndMuted=false;
try{sndMuted=localStorage.getItem("pn_intro_sound")==="off"}catch(e){}
function audioInit(){if(AC)return AC.state==="suspended"?AC.resume():Promise.resolve();const C=window.AudioContext||window.webkitAudioContext;if(!C)return Promise.reject();
  AC=new C();MG=AC.createGain();MG.gain.value=0;const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=420;const comp=AC.createDynamicsCompressor();MG.connect(lp);lp.connect(comp);comp.connect(AC.destination);return AC.resume()}
let NB=null;function noise(){if(NB)return NB;const n=AC.sampleRate*.3,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return NB=b}
function tone(t,f0,dur,g){const o=AC.createOscillator(),og=AC.createGain();o.type="sine";o.frequency.setValueAtTime(f0*1.7,t);o.frequency.exponentialRampToValueAtTime(f0,t+dur*.6);
  og.gain.setValueAtTime(0,t);og.gain.linearRampToValueAtTime(g,t+.012);og.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(og);og.connect(MG);o.start(t);o.stop(t+dur+.05);
  const ns=AC.createBufferSource();ns.buffer=noise();const nf=AC.createBiquadFilter();nf.type="bandpass";nf.frequency.value=f0*2.2;nf.Q.value=1.2;const ng=AC.createGain();
  ng.gain.setValueAtTime(0,t);ng.gain.linearRampToValueAtTime(g*.55,t+.006);ng.gain.exponentialRampToValueAtTime(.0005,t+dur*.7);ns.connect(nf);nf.connect(ng);ng.connect(MG);ns.start(t);ns.stop(t+dur)}
/* S1 идва веднага след R вълната (затваряне на AV клапите), S2 в края на T вълната (затваряне на полулунните клапи) */
function heartSound(which){if(!sndOn||!AC)return;const t=AC.currentTime+.01;if(which===1){tone(t,52,.16,.95);tone(t+.035,44,.12,.5)}else tone(t,68,.11,.7)}
function setSound(on){sndOn=on;const b=ov.querySelector(".snd");if(b){b.classList.toggle("on",on);b.classList.remove("ask");b.setAttribute("aria-pressed",String(on));b.querySelector(".t").textContent=on?"Sound on":"Sound off";b.querySelector(".w1").style.opacity=b.querySelector(".w2").style.opacity=on?1:.15}
  if(MG&&AC)MG.gain.setTargetAtTime(on?.9:0,AC.currentTime,.08)}
function enableFromGesture(){if(AC||sndMuted)return;audioInit().then(()=>setSound(true)).catch(()=>{})}
/* ---------- ЕКГ като на монитор: курсор, който изтрива пред себе си ---------- */
const HRb=72,Tc=60/HRb;
function ecgV(t){const p=((t%Tc)+Tc)%Tc/Tc,g=(m,s,a)=>a*Math.exp(-((p-m)*(p-m))/(2*s*s));return g(.10,.025,.13)+g(.185,.008,-.12)+g(.21,.010,1)+g(.235,.010,-.27)+g(.46,.045,.32)}
const ec=$(".mon canvas"),ex=ec.getContext("2d");let ew=0,eh=0,ed=1,ecX=0,ecLastY=null,ecT=0;
function ecSize(){const r=ec.getBoundingClientRect();ed=Math.min(2,devicePixelRatio||1);ew=Math.max(1,r.width);eh=Math.max(1,r.height);ec.width=ew*ed;ec.height=eh*ed;ex.setTransform(ed,0,0,ed,0,0);ex.clearRect(0,0,ew,eh);ecX=0;ecLastY=null}
new ResizeObserver(ecSize).observe(ec);
function ecDraw(dt){if(!ew)return;const pBefore=((ecT%Tc)+Tc)%Tc/Tc;const pxs=Math.max(150,ew/2.6);let adv=pxs*dt;const amp=eh*.36,base=eh*.62;
  ex.lineJoin="round";ex.lineCap="round";
  while(adv>0){const step=Math.min(adv,2);adv-=step;ecT+=step/pxs;const x0=ecX;ecX+=step;if(ecX>ew){ecX=0;ecLastY=null;continue}
    ex.clearRect(ecX,0,Math.min(28,ew-ecX)+1,eh);
    const y=base-ecgV(ecT)*amp;if(ecLastY!=null){ex.strokeStyle="#ff4d5a";ex.lineWidth=Math.max(1.6,eh/70);ex.shadowColor="rgba(255,77,90,.6)";ex.shadowBlur=6;ex.beginPath();ex.moveTo(x0,ecLastY);ex.lineTo(ecX,y);ex.stroke();ex.shadowBlur=0}ecLastY=y}
  const pAfter=((ecT%Tc)+Tc)%Tc/Tc;const cross=x=>pBefore<pAfter?(pBefore<x&&pAfter>=x):(pBefore<x||pAfter>=x);if(cross(.225))heartSound(1);if(cross(.53))heartSound(2)}

/* ---------- състояния ---------- */
let phase="pre",zoomAt=0,tStart=0,ended=false,R=null,raf=0;
const html=document.documentElement;html.style.overflow="hidden";
function setC(c,on=true){ov.classList.toggle(c,on)}
function enter(){if(phase==="zoom"||ended)return;phase="zoom";zoomAt=performance.now();setC("ecg");setC("zoom");
  const t0=performance.now(),D=RM?900:2600;(function tick(){const k=Math.min(1,(performance.now()-t0)/D);$(".load").style.setProperty("--lp",Math.round(k*100)+"%");if(k<1&&!ended)requestAnimationFrame(tick);else finish()})()}
function finish(){if(ended)return;ended=true;if(MG&&AC){MG.gain.setTargetAtTime(0,AC.currentTime,.25);setTimeout(()=>{try{AC.close()}catch(e){}},1500)}try{scrollTo(0,0)}catch(e){}setC("out");html.style.overflow="";
  setTimeout(()=>{cancelAnimationFrame(raf);if(R){R.dispose();R.forceContextLoss&&R.forceContextLoss()}ov.remove();st.remove()},800)}
$(".skip").onclick=finish;$(".hint").onclick=enter;
$(".snd").onclick=e=>{e.stopPropagation();if(!AC){sndMuted=false;audioInit().then(()=>setSound(true)).catch(()=>{});return}const on=!sndOn;sndMuted=!on;try{localStorage.setItem("pn_intro_sound",on?"on":"off")}catch(x){}audioInit().then(()=>setSound(on))};
ov.addEventListener("pointerdown",e=>{if(!e.target.closest(".snd,.skip"))enableFromGesture()});addEventListener("keydown",()=>{if(!ended)enableFromGesture()});addEventListener("touchend",()=>{if(!ended)enableFromGesture()},{passive:true});
if(sndMuted)setTimeout(()=>{const b=ov.querySelector(".snd");if(b){b.classList.remove("ask");b.querySelector(".t").textContent="Sound off"}},0);
let ty=null;
addEventListener("wheel",e=>{if((phase==="hold"||phase==="intro")&&e.deltaY>8)enter()},{passive:true});
addEventListener("touchstart",e=>{ty=e.touches[0].clientY},{passive:true});
addEventListener("touchmove",e=>{if(ty!=null&&ty-e.touches[0].clientY>30&&(phase==="hold"||phase==="intro"))enter()},{passive:true});
addEventListener("keydown",e=>{if(ended)return;if(["ArrowDown","PageDown"," ","Enter"].includes(e.key)&&(phase==="hold"||phase==="intro")&&!(e.target&&e.target.closest&&e.target.closest("button"))){e.preventDefault();enter()}if(e.key==="Escape")finish()});

/* резервен път: ако 3D не тръгне, показваме само ЕКГ и текста */
function noGL(){if(ended||phase!=="pre")return;$(".pre").textContent="";phase="hold";setC("ready");setC("ecg");setC("texts");setC("hinted");loop2D()}
function loop2D(){let last=performance.now();(function f(n){if(ended)return;const dt=Math.min(.05,(n-last)/1000);last=n;ecDraw(dt);raf=requestAnimationFrame(f)})(last)}

if(RM){noGL()}else{
  load(THREE_URL).then(()=>load(GLTF)).then(()=>load(ROOM).catch(()=>null))
   .then(()=>fetch("m/hglb3.txt").then(r=>{if(!r.ok)throw new Error("model");return r.text()}))
   .then(b64=>{const bin=atob(b64.trim()),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);return new Promise((res,rej)=>new THREE.GLTFLoader().parse(u8.buffer,"",res,rej))})
   .then(gl=>{if(!ended&&phase==="pre")build(gl)}).catch(e=>{console.error(e);noGL()});
}
setTimeout(()=>{if(phase==="pre")noGL()},20000);

/* ---------- текстури, рисувани в канвас ---------- */
function canvasTex(w,h,draw,rep){const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}t.anisotropy=4;return t}
const rnd=(a,b)=>a+Math.random()*(b-a);
function blood(g,x,y,r,a){for(let k=0;k<7;k++){const rx=x+rnd(-r,r)*.6,ry=y+rnd(-r,r)*.6,rr=r*rnd(.25,.7);const gr=g.createRadialGradient(rx,ry,0,rx,ry,rr);gr.addColorStop(0,`rgba(92,8,12,${a})`);gr.addColorStop(.6,`rgba(120,14,18,${a*.75})`);gr.addColorStop(1,"rgba(120,14,18,0)");g.fillStyle=gr;g.beginPath();g.ellipse(rx,ry,rr,rr*rnd(.6,1),rnd(0,3),0,7);g.fill()}}

function build(gl){const T=THREE;
  const cv=$("canvas.gl");
  R=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:"high-performance"});R.setPixelRatio(Math.min(MOBILE?1.5:1.75,devicePixelRatio||1));
  R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=.92;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
  const sc=new T.Scene();sc.background=new T.Color(0x0e0f11);
  if(T.RoomEnvironment){const pm=new T.PMREMGenerator(R);sc.environment=pm.fromScene(new T.RoomEnvironment(),.04).texture}
  const cam=new T.PerspectiveCamera(38,1,.05,80);

  /* стерилни чаршафи: синьо нетъкано платно с плетка и големи гънки */
  const weave=canvasTex(512,512,(g,w,h)=>{g.fillStyle="#3b4047";g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,n=(Math.random()-.5)*22+((x%4<2)!==(y%4<2)?6:-6);d[i]+=n;d[i+1]+=n;d[i+2]+=n}g.putImageData(id,0,0)},[10,7]);
  weave.encoding=T.sRGBEncoding;
  const bump=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let i=0;i<d.length;i+=4){const v=128+(Math.random()-.5)*90;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}g.putImageData(id,0,0)},[40,28]);
  const dg=new T.PlaneGeometry(16,11,220,150);{const P=dg.attributes.position;const folds=[[.3,1.2,-2.5,.22],[1.1,.4,3.2,.18],[-.6,1,1.5,.14],[2.2,-.3,-4,.2],[.9,.9,0,.06]];
    for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i);let z=0;
      folds.forEach(([a,b,c,amp])=>{const dd=(a*x+b*y+c)/Math.hypot(a,b);z+=amp*Math.exp(-dd*dd*1.6)*(1+.3*Math.sin(x*1.3+y))});
      z+=.025*Math.sin(x*2.1+y*3.3)+.015*Math.sin(x*5.7-y*4.1);
      const r=Math.hypot(x-.2,y+.1);const flat=Math.max(0,Math.min(1,(r-2.1)/.9));z=z*flat-.02*(1-flat)+.1*Math.exp(-((r-2.45)**2)*4);P.setZ(i,z)}dg.computeVertexNormals()}
  const drape=new T.Mesh(dg,new T.MeshStandardMaterial({map:weave,bumpMap:bump,bumpScale:.012,roughness:.95,metalness:0,envMapIntensity:.12}));drape.rotation.x=-Math.PI/2;drape.receiveShadow=true;sc.add(drape);
  /* петна кръв и мокро около легена */
  const stain=canvasTex(1024,1024,(g,w,h)=>{blood(g,640,560,80,.55);blood(g,720,650,40,.45);blood(g,330,700,55,.35);blood(g,790,380,30,.3);
    for(let k=0;k<40;k++){g.fillStyle=`rgba(80,6,10,${rnd(.2,.5)})`;g.beginPath();g.arc(rnd(450,820),rnd(420,760),rnd(1,4),0,7);g.fill()}
    const wet=g.createRadialGradient(512,512,180,512,512,330);wet.addColorStop(0,"rgba(10,30,50,0)");wet.addColorStop(.6,"rgba(18,18,20,.28)");wet.addColorStop(1,"rgba(10,30,50,0)");g.fillStyle=wet;g.fillRect(0,0,w,h)});
  stain.encoding=T.sRGBEncoding;
  const stM=new T.Mesh(new T.PlaneGeometry(9,9),new T.MeshStandardMaterial({map:stain,transparent:true,roughness:.35,metalness:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));stM.rotation.x=-Math.PI/2;stM.position.set(.2,.06,.1);sc.add(stM);

  /* стоманен леген със студен физиологичен разтвор и лед */
  const brushed=canvasTex(256,256,(g,w,h)=>{g.fillStyle="#9a9fa5";g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.strokeStyle=`rgba(${rnd(120,200)|0},${rnd(120,200)|0},${rnd(125,205)|0},.18)`;g.beginPath();const y=rnd(0,h);g.moveTo(0,y);g.lineTo(w,y+rnd(-2,2));g.stroke()}},[3,1]);
  const steelM=()=>new T.MeshStandardMaterial({color:0xc7ccd2,map:brushed,metalness:.95,roughness:.3,envMapIntensity:.9});
  const bowlP=[[0,.02],[1.5,.02],[1.75,.12],[1.95,.38],[2.08,.62],[2.18,.66],[2.24,.64]].map(p=>new T.Vector2(p[0],p[1]));
  const bowl=new T.Mesh(new T.LatheGeometry(bowlP,96),new T.MeshStandardMaterial({color:0xaeb4ba,metalness:.95,roughness:.38,envMapIntensity:.55,side:T.DoubleSide}));bowl.position.set(.2,.08,.1);bowl.castShadow=bowl.receiveShadow=true;sc.add(bowl);
  const waterY=.08+.42;
  const water=new T.Mesh(new T.CircleGeometry(1.98,96),new T.MeshPhysicalMaterial({color:0x4a5058,transparent:true,opacity:.32,roughness:.03,metalness:0,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.4,depthWrite:false}));
  water.rotation.x=-Math.PI/2;water.position.set(.2,waterY,.1);sc.add(water);
  const iceM=new T.MeshPhysicalMaterial({color:0xdfeef4,transparent:true,opacity:.42,roughness:.12,metalness:0,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.3});
  const ice=[];for(let i=0;i<16;i++){const g=new T.IcosahedronGeometry(rnd(.08,.15),2);const P=g.attributes.position;for(let k=0;k<P.count;k++){P.setXYZ(k,P.getX(k)*rnd(.75,1.25),P.getY(k)*rnd(.6,1),P.getZ(k)*rnd(.75,1.25))}g.computeVertexNormals();
    const m=new T.Mesh(g,iceM);const a=rnd(0,6.28),r=rnd(1.2,1.8);m.position.set(.2+Math.cos(a)*r,waterY+rnd(-.03,.04),.1+Math.sin(a)*r);m.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3));m.castShadow=true;m.userData.y=m.position.y;sc.add(m);ice.push(m)}

  /* поднос с инструменти (Mayo) */
  const tray=new T.Mesh(new T.BoxGeometry(2.6,.08,4.4),steelM());tray.position.set(-4.3,.25,.2);tray.castShadow=tray.receiveShadow=true;sc.add(tray);
  const towel=new T.Mesh(new T.PlaneGeometry(2.4,4.2,40,60),new T.MeshStandardMaterial({color:0x34383e,roughness:1,envMapIntensity:.1}));{const P=towel.geometry.attributes.position;for(let i=0;i<P.count;i++)P.setZ(i,.01*Math.sin(P.getX(i)*9)+.008*Math.sin(P.getY(i)*7));towel.geometry.computeVertexNormals()}
  towel.rotation.x=-Math.PI/2;towel.position.set(-4.3,.325,.2);towel.receiveShadow=true;sc.add(towel);
  const shine=()=>new T.MeshStandardMaterial({color:0xd9dde2,metalness:1,roughness:.16,envMapIntensity:1.1});
  function ringHandled(len,open){const g=new T.Group();[-1,1].forEach(s=>{const arm=new T.Mesh(new T.BoxGeometry(len,.035,.055),shine());arm.position.set(0,0,s*open);arm.rotation.y=-s*open*.6;g.add(arm);
      const ring=new T.Mesh(new T.TorusGeometry(.13,.028,10,32),shine());ring.rotation.x=Math.PI/2;ring.position.set(-len/2-.1,0,s*(open+.1));g.add(ring)});
    const box=new T.Mesh(new T.BoxGeometry(.12,.06,.16),shine());box.position.x=len*.1;g.add(box);g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
  const scalpel=new T.Group();{const h=new T.Mesh(new T.BoxGeometry(1.1,.035,.1),shine());scalpel.add(h);const s=new T.Shape();s.moveTo(0,0);s.lineTo(.36,0);s.quadraticCurveTo(.33,.1,0,.085);
    const b=new T.Mesh(new T.ExtrudeGeometry(s,{depth:.006,bevelEnabled:false}),shine());b.rotation.x=-Math.PI/2;b.position.set(.55,0,.045);scalpel.add(b);scalpel.traverse(o=>{if(o.isMesh)o.castShadow=true})}
  const forceps=()=>{const g=new T.Group();[-1,1].forEach(s=>{const a=new T.Mesh(new T.BoxGeometry(1.2,.025,.06),shine());a.position.z=s*.05;a.rotation.y=s*.04;g.add(a)});g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g};
  /* инструментите лежат успоредно, по дължината на подноса */
  [[scalpel,-1.65],[ringHandled(1.0,.035),-1.05],[ringHandled(.9,.03),-.45],[forceps(),.1],[forceps(),.6],[ringHandled(1.1,.04),1.15],[ringHandled(.8,.02),1.7]]
   .forEach(([m,x])=>{m.rotation.y=Math.PI/2+rnd(-.04,.04);m.position.set(-4.3+x*.62,.37,.2);sc.add(m)});

  /* марли с кръв */
  const gauzeT=a=>{const t=canvasTex(256,256,(g,w,h)=>{g.fillStyle="#f1efe9";g.fillRect(0,0,w,h);g.strokeStyle="rgba(150,145,135,.35)";for(let i=0;i<w;i+=4){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke()}
    blood(g,rnd(80,170),rnd(80,170),rnd(40,80),a)});t.encoding=T.sRGBEncoding;return t};
  [[2.95,-1.6,.35,.62],[3.7,.5,-.5,.4],[2.85,2.0,.9,.75]].forEach(([x,z,rot,a])=>{const g=new T.PlaneGeometry(1.15,1.15,30,30);const P=g.attributes.position;for(let i=0;i<P.count;i++){const px=P.getX(i),py=P.getY(i);P.setZ(i,.06*Math.sin(px*6+py*2)*Math.cos(py*5)+.05*Math.exp(-(px*px+py*py)*4))}g.computeVertexNormals();
    const m=new T.Mesh(g,new T.MeshStandardMaterial({map:gauzeT(a),roughness:1,envMapIntensity:.15,side:T.DoubleSide}));m.rotation.set(-Math.PI/2,0,rot);m.position.set(x,.14,z);m.castShadow=m.receiveShadow=true;sc.add(m)});
  /* спринцовка */
  const syr=new T.Group();{const barrel=new T.Mesh(new T.CylinderGeometry(.11,.11,1.1,24,1,true),new T.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.35,roughness:.05,clearcoat:1,side:T.DoubleSide}));syr.add(barrel);
    const plug=new T.Mesh(new T.CylinderGeometry(.1,.1,.08,24),new T.MeshStandardMaterial({color:0x2a2a2a,roughness:.6}));plug.position.y=-.1;syr.add(plug);
    const rod=new T.Mesh(new T.BoxGeometry(.05,.75,.05),new T.MeshStandardMaterial({color:0xf3f3f3,roughness:.5}));rod.position.y=-.55;syr.add(rod);
    const fl=new T.Mesh(new T.CylinderGeometry(.16,.16,.03,24),new T.MeshStandardMaterial({color:0xf3f3f3,roughness:.5}));fl.position.y=-.93;syr.add(fl);
    const nd=new T.Mesh(new T.CylinderGeometry(.008,.008,.5,8),shine());nd.position.y=.8;syr.add(nd);
    syr.rotation.set(Math.PI/2,0,-.35);syr.position.set(3.2,.25,-3.0);syr.traverse(o=>{if(o.isMesh)o.castShadow=true});sc.add(syr)}
  /* пакетче конци */
  const sut=canvasTex(256,160,(g,w,h)=>{g.fillStyle="#f6f6f2";g.fillRect(0,0,w,h);g.fillStyle="#C8102E";g.fillRect(0,0,w,34);g.fillStyle="#fff";g.font="600 20px system-ui";g.fillText("4-0 · 75 cm",12,24);
    g.fillStyle="#333";g.font="500 16px system-ui";g.fillText(EN?"Monofilament":"Монофиламент",12,64);g.fillText(EN?"Sterile":"Стерилно",12,88);g.strokeStyle="#C8102E";g.lineWidth=2;g.beginPath();g.arc(200,110,26,Math.PI*.1,Math.PI*1.2);g.stroke()});
  sut.encoding=T.sRGBEncoding;
  const plain=new T.MeshStandardMaterial({color:0xf3f3ef,roughness:.6});
  const spk=new T.Mesh(new T.BoxGeometry(1.0,.02,.62),[plain,plain,new T.MeshStandardMaterial({map:sut,roughness:.6}),plain,plain,plain]);spk.position.set(-2.0,.14,-3.1);spk.rotation.y=.25;spk.castShadow=true;sc.add(spk);

  /* двукуполна хирургическа лампа: кръгло петно светлина и меки двойни сенки */
  const s1=new T.SpotLight(0xfff4e6,2.7,30,.34,.6,1.1);s1.position.set(1.4,10,1.8);s1.target.position.set(.2,0,.1);
  const s2=new T.SpotLight(0xffffff,1.1,30,.42,.75,1.1);s2.position.set(-2.2,9,-1.2);s2.target.position.set(.2,0,.1);
  [s1,s2].forEach(s=>{s.castShadow=true;s.shadow.mapSize.set(MOBILE?1024:2048,MOBILE?1024:2048);s.shadow.bias=-.0003;s.shadow.radius=5;sc.add(s);sc.add(s.target)});
  sc.add(new T.HemisphereLight(0xffffff,0x0e0f11,.12));

  /* сърцето (материали като в раздела за сърцето, мокра повърхност) */
  gl.scene.updateMatrixWorld(true);const parts=[];gl.scene.traverse(o=>{if(o.isMesh)parts.push(o)});
  const bb=new T.Box3();parts.forEach(o=>bb.expandByObject(o));const cen=bb.getCenter(new T.Vector3()),H=bb.getSize(new T.Vector3()).y,s=2.35/H;
  const heart=new T.Group(),inner=new T.Group();heart.add(inner);
  parts.forEach(o=>{const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);g.translate(-cen.x,-cen.y,-cen.z);g.scale(s,s,s);g.computeVertexNormals();
    const om=o.material;const m=new T.MeshPhysicalMaterial({map:om.map,normalMap:om.normalMap,roughnessMap:om.roughnessMap,metalness:0,roughness:.6,clearcoat:.6,clearcoatRoughness:.2,envMapIntensity:.55,side:T.DoubleSide});
    if(m.map)m.map.encoding=T.sRGBEncoding;const mesh=new T.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;inner.add(mesh)});
  /* легнало по гръб: предната стена гледа нагоре към камерата */
  heart.rotation.set(-Math.PI/2+.12,0,.55);heart.position.set(.2,waterY+.18,.15);sc.add(heart);

  /* ---- камера: от високо над полето надолу към сърцето ---- */
  const V=(x,y,z)=>new T.Vector3(x,y,z);
  const A={p:V(0,15,3.2),l:V(.2,0,.3)},B={p:V(.4,6.4,1.9),l:V(.2,.3,.1)};
  const ease=x=>1-Math.pow(1-x,3),cl=(x,a,b)=>Math.max(a,Math.min(b,x));
  const DUR=5.2;
  function size(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.aspect<.8?62:38;cam.updateProjectionMatrix()}
  size();addEventListener("resize",size);

  /* сърдечен цикъл с инерция */
  const spg={x:0,v:0,w:2*Math.PI*9,z:.9};const sys=p=>p<.12||p>.48?0:Math.pow(Math.sin((p-.12)/.36*Math.PI),1.3);const atr=p=>{const d=(p-.9+1)%1;return d<.1?Math.sin(d/.1*Math.PI):0};
  let last=performance.now(),tt=0,hrUi=0;const hrEl=$("#hxo-hr");
  R.compile(sc,cam);setC("ready");phase="intro";tStart=performance.now();tt=0;
  setTimeout(()=>{if(!ended&&phase!=="zoom")setC("ecg")},2200);
  setTimeout(()=>{if(!ended&&phase!=="zoom")setC("texts")},3000);
  setTimeout(()=>{if(!ended&&phase!=="zoom"){setC("hinted");phase="hold"}},4800);
  function frame(n){if(ended)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,(n-last)/1000);last=n;tt+=dt;const edt=Math.min(.12,dt*1.0);
    const p=(tt%Tc)/Tc,tg=sys(p);const k=Math.max(1,Math.ceil(dt/.002)),h=dt/k;for(let i=0;i<k;i++){spg.v+=h*(spg.w*spg.w*(tg-spg.x)-2*spg.z*spg.w*spg.v);spg.x+=h*spg.v}
    const c=spg.x,a=atr(p)*.4;inner.scale.set(1-.045*c+.012*a,1-.03*c+.01*a,1-.045*c+.012*a);inner.rotation.y=.05*c;
    water.position.y=waterY+.004*c;ice.forEach((m,i)=>{m.position.y=m.userData.y+Math.sin(tt*1.3+i)*.006});
    const u=ease(cl(tt/DUR,0,1));
    cam.position.copy(A.p).lerp(B.p,u);const look=A.l.clone().lerp(B.l,u);
    const br=u>=1?1:0;cam.position.x+=Math.sin(tt*.35)*.04*br;cam.position.y+=Math.sin(tt*.5)*.03*br;cam.lookAt(look);
    if(phase!=="zoom")R.render(sc,cam);ecDraw(dt);
    hrUi+=dt;if(hrUi>.5){hrUi=0;hrEl.textContent=String(70+Math.round(Math.random()*4))}}
  raf=requestAnimationFrame(frame);
}
})();
