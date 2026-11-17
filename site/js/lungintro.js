/* ===== Въведение „Дихателна система“ =====
   1) пациент седи в кабинета, пред гърдите му виси слушалката на стетоскоп;
   2) при скрол/плъзгане слушалката се приближава и докосва гръдния кош (следва пръста);
   3) при допира се чува дишане, кожата става прозрачна и вътре се виждат дишащите бели дробове
      с бронхиалното дърво; отдолу — спирограма;
   4) при следващ скрол — зареждащ екран „PhysioNova“ и началната страница.
   Модел на пациента: базов човек на MakeHuman (CC0), поставен седнал с design/tools/posehuman.py (POSE=patient) → m/patient.txt.
   Белите дробове, бронхите, ребрата, стетоскопът и стаята са построени в кода. */
(function(){"use strict";
if(window.__introPick!=="lung")return;
const ov=document.getElementById("hxo");if(!ov)return;window.__hxo=true;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE=matchMedia("(max-width: 700px)").matches;
const THREE_URL="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
const load=src=>new Promise((res,rej)=>{if(src===THREE_URL&&window.THREE)return res();if([...document.scripts].some(s=>s.src===src)){const t0=Date.now();(function w(){if(window.THREE)res();else if(Date.now()-t0>15000)rej(new Error("three"));else setTimeout(w,60)})();return}const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
const brand=document.querySelector(".brand b,.logo b,.brand");const FONT=brand?getComputedStyle(brand).fontFamily:"system-ui,sans-serif";

/* ---------- изглед (същият като при другите въведения) ---------- */
const css=`
#hxo{position:fixed;inset:0;z-index:100000;background:radial-gradient(120% 80% at 20% 0%,#FBFBFC 0%,rgba(251,251,252,0) 55%),linear-gradient(115deg,#D9DCE0 0%,#F4F5F6 28%,#C9CDD2 46%,#EEF0F2 64%,#D3D7DB 82%,#F6F7F8 100%);color:#eef0ee;overflow:hidden;font-family:${FONT};transition:opacity .7s ease;touch-action:none}
#hxo.out{opacity:0;pointer-events:none}
#hxo canvas.gl{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 1.2s ease,transform 1.3s cubic-bezier(.6,0,.2,1)}
#hxo.ready canvas.gl{opacity:1}
#hxo.zoom canvas.gl{transform:scale(1.25);opacity:0}
#hxo .flash{position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(circle at var(--fx,50%) var(--fy,50%),rgba(255,255,255,.55),rgba(255,180,190,.12) 30%,rgba(0,0,0,0) 60%)}
#hxo .vig{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 1s;background:radial-gradient(ellipse 70% 62% at 50% 46%,transparent 42%,rgba(3,4,5,.45) 74%,rgba(3,4,5,.88) 100%)}
#hxo.ready .vig{opacity:1}#hxo.zoom .vig{opacity:0}
#hxo:not(.ready) .skip,#hxo:not(.ready) .snd,#hxo.zoom .skip,#hxo.zoom .snd{color:#1D1D1F;background:rgba(255,255,255,.6);border-color:rgba(29,29,31,.14)}
#hxo .pre{position:absolute;inset:0;display:grid;place-items:center;font:600 13px/1 system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#5E5E63;transition:opacity .6s}
#hxo.ready .pre{opacity:0}
#hxo .side{text-shadow:0 2px 18px rgba(0,0,0,.85);position:absolute;top:50%;transform:translate(0,-50%);max-width:min(30vw,340px);opacity:0;transition:opacity .6s ease;pointer-events:none}
#hxo .side.l{left:max(28px,env(safe-area-inset-left,0px))}
#hxo .side.r{right:max(28px,env(safe-area-inset-right,0px));text-align:right}
#hxo.texts .side{opacity:1}
#hxo.zoom .side{opacity:0}
#hxo .side small{display:block;font:600 11.5px/1.2 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#ff4d5a;margin-bottom:12px}
#hxo .side b{display:block;font-weight:800;font-size:clamp(26px,3.2vw,44px);line-height:1.02;letter-spacing:-.02em;color:#f3f1ec;text-wrap:balance}
#hxo .side span{display:block;margin-top:12px;font:400 15px/1.45 system-ui,sans-serif;color:#c3c8c4}
#hxo .mon{position:absolute;left:50%;bottom:max(26px,env(safe-area-inset-bottom,0px));width:min(760px,calc(100% - 40px));height:110px;transform:translate(-50%,40px);opacity:0;
  background:rgba(14,15,17,.72);border:1px solid rgba(255,255,255,.12);border-radius:12px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  transition:opacity .8s ease,transform .9s cubic-bezier(.2,.8,.2,1),width 1.2s cubic-bezier(.6,0,.2,1),height 1.2s cubic-bezier(.6,0,.2,1),bottom 1.2s cubic-bezier(.6,0,.2,1),border-color 1s,background 1s}
#hxo.ecg .mon{opacity:1;transform:translate(-50%,0)}
#hxo.zoom .mon{bottom:calc(50% - 21vh);width:100%;height:42vh;border-color:transparent;background:transparent;border-radius:0}
#hxo .mon canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#hxo .mon .lab{position:absolute;left:12px;top:9px;font:600 11px/1 ui-monospace,monospace;letter-spacing:.12em;color:#ff4d5a;opacity:.85;transition:opacity .6s}
#hxo .mon .rr{position:absolute;right:12px;top:8px;font:600 22px/1 ui-monospace,monospace;color:#ff4d5a;transition:opacity .6s}
#hxo .mon .rr small{font-size:10px;letter-spacing:.12em;margin-left:4px;opacity:.8}
#hxo.zoom .mon .lab,#hxo.zoom .mon .rr{opacity:0}
#hxo .brandx{position:absolute;left:0;right:0;top:calc(50% - 21vh - 10px);transform:translateY(-100%);text-align:center;opacity:0;transition:opacity .9s ease .5s}
#hxo .brandx b{display:block;font-weight:800;font-size:clamp(44px,8vw,104px);letter-spacing:-.03em;color:#1D1D1F;line-height:1}
#hxo .brandx b i{font-style:normal;color:#C8102E}
#hxo .brandx span{display:block;margin-top:12px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#5E5E63}
#hxo.zoom .brandx{opacity:1}
#hxo .load{position:absolute;left:50%;top:calc(50% + 21vh + 26px);transform:translateX(-50%);width:min(320px,70vw);opacity:0;transition:opacity .6s ease .8s;text-align:center;font:500 12px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5E5E63}
#hxo .load i{display:block;height:2px;margin-top:12px;background:rgba(29,29,31,.12);overflow:hidden;border-radius:2px}
#hxo .load i::after{content:"";display:block;height:100%;width:var(--lp,0%);background:#C8102E;transition:width .25s linear}
#hxo.zoom .load{opacity:1}
#hxo .hint{position:absolute;left:50%;bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 40px);transform:translateX(-50%);opacity:0;transition:opacity .8s,bottom .8s;
  font:600 12px/1 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#e9ece8;border:0;background:none;cursor:pointer;padding:12px 16px;min-height:44px;pointer-events:none;text-shadow:0 2px 12px rgba(0,0,0,.7)}
#hxo .hint span{display:inline-block;animation:hxb 1.6s ease-in-out infinite}
@keyframes hxb{50%{transform:translateY(5px)}}
#hxo.hinted .hint{opacity:.95;pointer-events:auto}
#hxo.ecg .hint{bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 124px)}
#hxo.zoom .hint{opacity:0;pointer-events:none}
#hxo .prog{position:absolute;left:50%;bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 26px);transform:translateX(-50%);width:120px;height:3px;border-radius:3px;background:rgba(255,255,255,.18);opacity:0;transition:opacity .6s}
#hxo .prog i{display:block;height:100%;width:var(--pp,0%);background:#ff4d5a;border-radius:3px}
#hxo.hinted.listen .prog{opacity:1}
#hxo .skip{position:absolute;top:max(14px,env(safe-area-inset-top,0px));right:max(14px,env(safe-area-inset-right,0px));font:600 12px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#cfd4cf;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:12px 16px;min-height:44px;cursor:pointer}
#hxo .snd{position:absolute;top:max(14px,env(safe-area-inset-top,0px));right:calc(max(14px,env(safe-area-inset-right,0px)) + 92px);display:flex;align-items:center;gap:8px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#cfd4cf;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:12px 16px;min-height:44px;cursor:pointer}
#hxo .snd svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
#hxo .snd.on{color:#ff4d5a;border-color:rgba(255,77,90,.4)}
#hxo .skip:focus-visible,#hxo .snd:focus-visible,#hxo .hint:focus-visible{outline:2px solid #ff4d5a;outline-offset:3px}
#hxo .cr{position:absolute;left:max(14px,env(safe-area-inset-left,0px));top:max(16px,env(safe-area-inset-top,0px));font:500 10px/1.35 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a918c;max-width:52ch}
#hxo .cr a{color:inherit}
#hxo.zoom .cr{opacity:0}
@media (max-width:700px){
  #hxo .side{top:auto;transform:none!important;max-width:none;left:20px!important;right:20px!important;text-align:left!important}
  #hxo .side.l{top:max(64px,calc(env(safe-area-inset-top,0px) + 52px))}
  #hxo .side.r{display:none}
  #hxo .side b{font-size:28px}
  #hxo .mon{height:90px}
  #hxo.ecg .hint{bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 100px)}
  #hxo.zoom .mon{bottom:calc(50% - 15vh);height:30vh}
  #hxo .brandx{top:calc(50% - 15vh - 10px)}#hxo .load{top:calc(50% + 15vh + 22px)}
  #hxo .cr{top:auto;bottom:6px;left:20px;font-size:9px}
  #hxo .snd .t{display:none}
}
@media (prefers-reduced-motion:reduce){#hxo .hint span{animation:none}}
`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
ov.innerHTML=`<canvas class="gl" aria-hidden="true"></canvas><div class="vig"></div><div class="flash"></div>
 <div class="pre">Preparing the examination room…</div>
 <div class="side l"></div><div class="side r"></div>
 <div class="mon"><canvas aria-hidden="true"></canvas><span class="lab">Vt · spirogram · mL</span><span class="rr"><span id="hxo-rr">14</span><small>BR/MIN</small></span></div>
 <div class="brandx"><b>Physio<i>Nova</i></b><span>Physiology simulator</span></div>
 <div class="load">Opening the home page<i></i></div>
 <button class="hint" type="button"><em>Scroll to listen</em> <span>↓</span></button><div class="prog"><i></i></div>
 <button class="snd" type="button" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path class="w1" d="M16 9a4 4 0 0 1 0 6"/><path class="w2" d="M18.5 6.5a8 8 0 0 1 0 11"/></svg><span class="t">Tap to hear the breath sounds</span></button>
 <button class="skip" type="button">Skip</button>
 <div class="cr">Model: patient — <a href="http://www.makehumancommunity.org/" target="_blank" rel="noopener">MakeHuman</a> base mesh, CC0</div>`;
const $=s=>ov.querySelector(s);

const TXT={
 exam:[["Respiratory system","Listen before you look","Auscultation: the oldest window into the lungs."],["For medical students","Every breath, explained","Mechanics, gas exchange and control — with live simulations."]],
 lungs:[["Ventilation","12–16 breaths a minute","About 500 mL each time — 6 litres of air every minute."],["Gas exchange","70 m² of alveoli","Less than a micrometre between air and blood."]]};
let txtKey=null;
function setText(k){if(txtKey===k)return;txtKey=k;ov.classList.remove("texts");setTimeout(()=>{if(txtKey!==k)return;const [l,r]=TXT[k];
  $(".side.l").innerHTML=`<small>${l[0]}</small><b>${l[1]}</b><span>${l[2]}</span>`;$(".side.r").innerHTML=`<small>${r[0]}</small><b>${r[1]}</b><span>${r[2]}</span>`;if(!ended&&phase!=="zoom")ov.classList.add("texts")},450)}

/* ---------- дишане: общ ритъм за модела, звука и спирограмата ---------- */
const BP=4.3,TI=.38;           // период (s) и дял на вдишването
function breath(t){const p=((t%BP)+BP)%BP/BP;if(p<TI)return .5-.5*Math.cos(p/TI*Math.PI);const q=(p-TI)/(1-TI);return Math.exp(-q*3.6)*(1-q)+0*q}
function flow(t){const h=.01;return (breath(t+h)-breath(t-h))/(2*h)}

/* ---------- звук: везикуларно дишане (филтриран шум, по-силно при вдишване) ---------- */
let AC=null,MG=null,BG=null,sndOn=false,sndMuted=false,heard=false;
try{sndMuted=localStorage.getItem("pn_intro_sound")==="off"}catch(e){}
function audioInit(){if(AC)return AC.state==="suspended"?AC.resume():Promise.resolve();const C=window.AudioContext||window.webkitAudioContext;if(!C)return Promise.reject();
  AC=new C();MG=AC.createGain();MG.gain.value=0;const comp=AC.createDynamicsCompressor();MG.connect(comp);comp.connect(AC.destination);
  const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;last=(last+.04*w)/1.04;d[i]=w*.6+last*3}
  const src=AC.createBufferSource();src.buffer=b;src.loop=true;const bp=AC.createBiquadFilter();bp.type="bandpass";bp.frequency.value=520;bp.Q.value=.6;const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=1400;
  BG=AC.createGain();BG.gain.value=0;src.connect(bp);bp.connect(lp);lp.connect(BG);BG.connect(MG);src.start();return AC.resume()}
function setSound(on){sndOn=on;const b=$(".snd");b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));b.querySelector(".t").textContent=on?"Sound on":"Sound off";b.querySelector(".w1").style.opacity=b.querySelector(".w2").style.opacity=on?1:.15;
  if(MG&&AC)MG.gain.setTargetAtTime(on?.9:0,AC.currentTime,.08)}
function enableFromGesture(){if(AC||sndMuted)return;audioInit().then(()=>setSound(true)).catch(()=>{})}
function soundFrame(t){if(!BG||!AC)return;const f=flow(t),g=heard?(f>0?Math.min(1,f*.55):Math.min(.35,-f*.4)):0;BG.gain.setTargetAtTime(g*.7,AC.currentTime,.05)}

/* ---------- спирограма ---------- */
const ec=$(".mon canvas"),ex=ec.getContext("2d");let ew=0,eh=0,ed=1,ecX=0,ecLastY=null,ecT=0;
function ecSize(){const r=ec.getBoundingClientRect();ed=Math.min(2,devicePixelRatio||1);ew=Math.max(1,r.width);eh=Math.max(1,r.height);ec.width=ew*ed;ec.height=eh*ed;ex.setTransform(ed,0,0,ed,0,0);ex.clearRect(0,0,ew,eh);ecX=0;ecLastY=null}
new ResizeObserver(ecSize).observe(ec);
function ecDraw(dt){if(!ew)return;const pxs=Math.max(110,ew/7);let adv=pxs*dt;ex.lineJoin="round";ex.lineCap="round";
  while(adv>0){const step=Math.min(adv,1.5);adv-=step;ecT+=step/pxs;const x0=ecX;ecX+=step;if(ecX>ew){ecX=0;ecLastY=null;continue}
    ex.clearRect(ecX,0,Math.min(28,ew-ecX)+1,eh);const y=eh*.82-breath(ecT)*eh*.56;
    if(ecLastY!=null){ex.strokeStyle="#ff4d5a";ex.lineWidth=Math.max(1.6,eh/70);ex.shadowColor="rgba(255,77,90,.6)";ex.shadowBlur=6;ex.beginPath();ex.moveTo(x0,ecLastY);ex.lineTo(ecX,y);ex.stroke();ex.shadowBlur=0}ecLastY=y}}

/* ---------- състояния ---------- */
let phase="pre",ended=false,R=null,raf=0,diveT=-1,prog=0,progT=0;
const html=document.documentElement;html.style.overflow="hidden";
const setC=(c,on=true)=>ov.classList.toggle(c,on);
function enter(){if(phase==="zoom"||ended)return;phase="zoom";setC("ecg");setC("zoom");
  const t0=performance.now(),D=RM?900:2600;(function tick(){const k=Math.min(1,(performance.now()-t0)/D);$(".load").style.setProperty("--lp",Math.round(k*100)+"%");if(k<1&&!ended)requestAnimationFrame(tick);else finish()})()}
function finish(){if(ended)return;ended=true;if(MG&&AC){MG.gain.setTargetAtTime(0,AC.currentTime,.25);setTimeout(()=>{try{AC.close()}catch(e){}},1500)}try{scrollTo(0,0)}catch(e){}setC("out");html.style.overflow="";
  setTimeout(()=>{cancelAnimationFrame(raf);if(R){R.dispose();R.forceContextLoss&&R.forceContextLoss()}ov.remove();st.remove()},800)}
/* скролът/плъзгането придвижва слушалката към гърдите; при допир започва разкриването */
function push(a){if(ended)return;if(phase==="hold"||phase==="intro"){if(!R){enter();return}progT=Math.min(1,progT+a);setC("listen")}else if(phase==="hold2"&&a>.05)enter()}
$(".skip").onclick=finish;$(".hint").onclick=()=>push(phase==="hold2"?1:.34);
$(".snd").onclick=e=>{e.stopPropagation();if(!AC){sndMuted=false;audioInit().then(()=>setSound(true)).catch(()=>{});return}const on=!sndOn;sndMuted=!on;try{localStorage.setItem("pn_intro_sound",on?"on":"off")}catch(x){}audioInit().then(()=>setSound(on))};
ov.addEventListener("pointerdown",e=>{if(!e.target.closest(".snd,.skip"))enableFromGesture()});addEventListener("keydown",()=>{if(!ended)enableFromGesture()});
let ty=null,wheelLock=0;
addEventListener("wheel",e=>{if(e.deltaY<=0)return;if(phase==="hold2"){if(performance.now()>wheelLock){wheelLock=performance.now()+900;enter()}}else push(Math.min(.25,e.deltaY*.0012))},{passive:true});
addEventListener("touchstart",e=>{ty=e.touches[0].clientY},{passive:true});
addEventListener("touchmove",e=>{if(ty==null)return;const y=e.touches[0].clientY,d=ty-y;ty=y;if(d>0)push(phase==="hold2"?(d>30?1:0):d*.004)},{passive:true});
addEventListener("keydown",e=>{if(ended)return;if(["ArrowDown","PageDown"," ","Enter"].includes(e.key)&&!(e.target&&e.target.closest&&e.target.closest("button"))){e.preventDefault();push(phase==="hold2"?1:.34)}if(e.key==="Escape")finish()});

function noGL(){if(ended||phase!=="pre")return;$(".pre").textContent="";phase="hold2";setC("ready");setC("ecg");setText("lungs");$(".hint em").textContent="Scroll to enter";setC("hinted");
  let last=performance.now();(function f(n){if(ended)return;const dt=Math.min(.05,(n-last)/1000);last=n;ecDraw(dt);raf=requestAnimationFrame(f)})(last)}

const getMesh=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.text()}).then(decodeMesh).catch(()=>null);
if(RM){noGL()}else{load(THREE_URL).then(()=>getMesh("m/patient.txt")).then(p=>{if(!ended&&phase==="pre")build(p)}).catch(e=>{console.error(e);noGL()})}
setTimeout(()=>{if(phase==="pre")noGL()},20000);

function decodeMesh(b64){const bin=atob(b64.trim()),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
  const dv=new DataView(u8.buffer),nv=dv.getUint32(0,true),nf=dv.getUint32(4,true),mn=[0,1,2].map(k=>dv.getFloat32(8+4*k,true)),sz=[0,1,2].map(k=>dv.getFloat32(20+4*k,true));
  let o=32;const q=new Uint16Array(u8.buffer,o,nv*3);o+=nv*6;o=(o+3)&~3;const idx=new Uint32Array(u8.buffer.slice(o,o+nf*12));
  const pos=new Float32Array(nv*3);for(let i=0;i<nv*3;i++)pos[i]=mn[i%3]+q[i]/65535*sz[i%3];
  const T=window.THREE,g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(pos,3));g.setIndex(new T.BufferAttribute(idx,1));
  const co=o+nf*12;if(u8.length>=co+nv*3){const c=new Float32Array(nv*3);for(let i=0;i<nv*3;i++){const v=u8[co+i]/255;c[i]=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}g.setAttribute("color",new T.BufferAttribute(c,3))}
  g.computeVertexNormals();return g}

const rnd=(a,b)=>a+Math.random()*(b-a);
function canvasTex(w,h,draw,rep,srgb=true){const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}t.anisotropy=8;if(srgb)t.encoding=THREE.sRGBEncoding;return t}
function noiseFill(g,w,h,base,amp){g.fillStyle=base;g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*amp;d[i]+=n;d[i+1]+=n;d[i+2]+=n}g.putImageData(id,0,0)}

/* ===================================================================== */
function build(patG){const T=THREE,V=(x,y,z)=>new T.Vector3(x,y,z);
  const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)},lerp=(a,b,t)=>a+(b-a)*t,cl=(x,a,b)=>Math.max(a,Math.min(b,x));
  const cv=$("canvas.gl");
  R=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:"high-performance"});R.setPixelRatio(Math.min(MOBILE?1.5:1.75,devicePixelRatio||1));
  R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.0;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
  const cam=new T.PerspectiveCamera(34,1,.005,40);
  const envSc=new T.Scene();envSc.add(new T.Mesh(new T.SphereGeometry(20,24,16),new T.MeshBasicMaterial({color:0x2c2e33,side:T.BackSide})));
  const box=(w,h,p,c,i)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(i),side:T.DoubleSide}));m.position.set(...p);m.lookAt(0,0,0);envSc.add(m)};
  box(14,8,[0,12,6],0xffffff,2.2);box(6,14,[-14,2,-4],0xdfe8ff,1.3);box(6,10,[13,-2,-8],0xffe1e1,1.0);box(10,6,[0,2,14],0xffffff,1.2);
  const pm=new T.PMREMGenerator(R),ENV=pm.fromScene(envSc,.04).texture;pm.dispose();
  const rim=(m,c,i,pw=2.6)=>{const rc=new T.Color(c).convertSRGBToLinear();m.onBeforeCompile=sh=>{sh.uniforms.uRim={value:rc};sh.uniforms.uRimI=m.userData.rimI={value:i};
      sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nuniform vec3 uRim;uniform float uRimI;")
        .replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\n{float fr=pow(1.0-clamp(abs(dot(normal,normalize(vViewPosition))),0.0,1.0),"+pw.toFixed(2)+");totalEmissiveRadiance+=uRim*fr*uRimI;}")};
    m.customProgramCacheKey=()=>"lrim"+pw+(m.vertexColors?"v":"");return m};

  const S=new T.Scene();const BG0=new T.Color(0x1b1d22),BG1=new T.Color(0x060608);S.background=BG0.clone();S.environment=ENV;S.fog=new T.Fog(0x1b1d22,4,9);
  /* стая: под, стена, кушетка, стол */
  const floorT=canvasTex(512,512,(g,w,h)=>{noiseFill(g,w,h,"#3a3d43",14);g.strokeStyle="rgba(0,0,0,.25)";for(let i=0;i<w;i+=64){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke()}},[8,8]);
  const floor=new T.Mesh(new T.PlaneGeometry(14,14),new T.MeshStandardMaterial({map:floorT,roughness:.55,envMapIntensity:.4}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;S.add(floor);
  const wall=new T.Mesh(new T.PlaneGeometry(14,5),new T.MeshStandardMaterial({color:0x2e3238,roughness:.9,envMapIntensity:.2}));wall.position.set(0,2.5,-1.6);wall.receiveShadow=true;S.add(wall);
  const couch=new T.Group();{const cm=new T.MeshPhysicalMaterial({color:0x2b3b4e,roughness:.45,clearcoat:.4});const top=new T.Mesh(new T.BoxGeometry(1.9,.12,.7),cm);top.position.y=.66;couch.add(top);
    const paper=new T.Mesh(new T.BoxGeometry(1.9,.004,.5),new T.MeshStandardMaterial({color:0xf2f2ee,roughness:.9}));paper.position.y=.722;couch.add(paper);
    const leg=new T.MeshStandardMaterial({color:0xb9bec5,metalness:.9,roughness:.25});[[-.85,-.28],[.85,-.28],[-.85,.28],[.85,.28]].forEach(([x,z])=>{const l=new T.Mesh(new T.CylinderGeometry(.02,.02,.6,12),leg);l.position.set(x,.3,z);couch.add(l)});
    couch.position.set(-1.35,0,-.9);couch.rotation.y=.2;couch.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}})}S.add(couch);
  const stool=new T.Group();{const sm2=new T.MeshPhysicalMaterial({color:0x22252b,roughness:.5,clearcoat:.5});const seat=new T.Mesh(new T.CylinderGeometry(.2,.2,.07,40),sm2);seat.position.y=.47;stool.add(seat);
    const post=new T.Mesh(new T.CylinderGeometry(.025,.025,.42,16),new T.MeshStandardMaterial({color:0xb9bec5,metalness:.9,roughness:.25}));post.position.y=.22;stool.add(post);
    for(let k=0;k<5;k++){const a=k/5*Math.PI*2,l=new T.Mesh(new T.BoxGeometry(.28,.025,.03),post.material);l.position.set(Math.cos(a)*.13,.03,Math.sin(a)*.13);l.rotation.y=-a;stool.add(l)}
    stool.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}})}S.add(stool);

  /* пациентът */
  const OY=.5,docMats=[];let body=null,hairShells=[];
  if(patG){const pmM=rim(new T.MeshPhysicalMaterial({vertexColors:true,roughness:.62,clearcoat:.15,clearcoatRoughness:.5,envMapIntensity:.4,transparent:true,sheen:new T.Color(0x3a2620)}),0xffd2c0,.22,2.8);docMats.push(pmM);
    body=new T.Mesh(patG,pmM);body.position.set(0,OY,0);body.castShadow=true;body.receiveShadow=true;S.add(body);
    /* коса: слоеве с кичури, само върху тъмните върхове */
    const GL_N=`float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float strand(vec3 p){vec3 d=normalize(p-vec3(0.,.72,-.02));float th=atan(d.x,d.z),ph=acos(clamp(d.y,-1.,1.));return vn(vec3(th*150.,ph*7.,0.))*.65+vn(vec3(th*360.,ph*16.,5.))*.35;}`;
    const col=patG.attributes.color,ix=patG.index.array,hi=[];for(let t=0;t<ix.length;t+=3){let ok=1;for(let j=0;j<3;j++){const v=ix[t+j],r=col.getX(v),b=col.getZ(v);if(!(r<.045&&r>b*1.5)){ok=0;break}}if(ok)hi.push(ix[t],ix[t+1],ix[t+2])}
    const hg=new T.BufferGeometry();["position","normal"].forEach(a=>hg.setAttribute(a,patG.attributes[a]));hg.setIndex(hi);
    for(let l=1;l<=10;l++){const L=l/10;const hm=new T.MeshStandardMaterial({color:new T.Color(0x22160f).lerp(new T.Color(0x3a281b),L*.7).convertSRGBToLinear(),roughness:.55,envMapIntensity:.45,transparent:true});
      hm.onBeforeCompile=sh=>{sh.uniforms.uOff={value:.00075*l};sh.uniforms.uL={value:L};
        sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nuniform float uOff;varying vec3 vOP;").replace("#include <begin_vertex>","#include <begin_vertex>\nvOP=position;transformed+=objectNormal*uOff;");
        sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nuniform float uL;varying vec3 vOP;\n"+GL_N).replace("#include <alphatest_fragment>","#include <alphatest_fragment>\n{float n=strand(vOP);if(n<uL*.62+.3)discard;diffuseColor.rgb*=.75+.55*n;}")};
      hm.customProgramCacheKey=()=>"phair"+l;docMats.push(hm);const sh=new T.Mesh(hg,hm);sh.position.copy(body.position);sh.renderOrder=2;S.add(sh);hairShells.push(sh)}}

  /* ---- вътрешността: ребра, бели дробове, бронхиално дърво, сърце ---- */
  const IN=new T.Group();IN.position.set(0,OY,0);S.add(IN);
  const CY=.43,CZ=.03;            // център на гръдния кош (в координатите на модела)
  /* бял дроб: деформирана сфера — тесен връх, широка вдлъбната основа, плоска медиална страна, сърдечна вдлъбнатина вляво */
  function lungGeo(side){const g=new T.SphereGeometry(1,96,72),P=g.attributes.position;
    for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);const t=(y+1)/2;let w=.62+.5*Math.pow(1-t,.7);if(t>.82)w*=1-(t-.82)*1.6;
      x*=w;z*=w*.95;if(x*side<0)x*=.38;
      if(y<-.45){const r2=Math.min(1,(x*x)/.4+z*z);y+=.42*(1-r2)*sm(-.45,-1,y)}
      if(side>0&&z>.05&&x<.35&&y<.15&&y>-.85){const k=sm(.05,.6,z)*sm(.15,-.2,y)*sm(-.85,-.55,y);x+=.32*k}
      const n=.025*Math.sin(x*9+y*7)*Math.sin(z*8+y*3);P.setXYZ(i,x*(1+n),y,z*(1+n))}
    g.computeVertexNormals();g.scale(.075,.125,.085);g.translate(side*.072,CY-.01,CZ);return g}
  const lungM=rim(new T.MeshPhysicalMaterial({color:0xe48f8f,roughness:.4,clearcoat:.6,clearcoatRoughness:.25,transparent:true,opacity:0,depthWrite:false,envMapIntensity:.55,sheen:new T.Color(0x803040)}),0xffd0d6,.9,2.0);
  const lungs=[-1,1].map(sd=>{const m=new T.Mesh(lungGeo(sd),lungM);m.renderOrder=4;IN.add(m);m.userData.side=sd;return m});
  /* бронхиално дърво */
  const ptube=(curve,rf,seg,rad,mat)=>{const g=new T.TubeGeometry(curve,seg,1,rad,false),P=g.attributes.position;for(let i=0;i<=seg;i++){const c=curve.getPointAt(i/seg),r=rf(i/seg);for(let j=0;j<=rad;j++){const k=i*(rad+1)+j;P.setXYZ(k,c.x+(P.getX(k)-c.x)*r,c.y+(P.getY(k)-c.y)*r,c.z+(P.getZ(k)-c.z)*r)}}g.computeVertexNormals();return new T.Mesh(g,mat)};
  const brM=rim(new T.MeshPhysicalMaterial({color:0xf1d7cf,roughness:.45,clearcoat:.5,transparent:true,opacity:0,envMapIntensity:.5}),0xffffff,.45);
  const R2=(()=>{let s=29;return()=>(s=(s*16807)%2147483647)/2147483647})();
  const inLung=(p,sd)=>{const q=V((p.x-sd*.072)/.075,(p.y-(CY-.01))/.125,(p.z-CZ)/.085);return q.lengthSq()<.82};
  const paths=[],tips=[];
  const trA=V(0,CY+.2,CZ+.02),car=V(0,CY+.075,CZ+.005);
  IN.add(ptube(new T.CatmullRomCurve3([trA,V(0,CY+.14,CZ+.012),car]),()=>.0105,24,14,brM));
  {const ringM=new T.MeshStandardMaterial({color:0xf6e6df,roughness:.5,transparent:true,opacity:0});brM.userData.rings=ringM;for(let k=0;k<9;k++){const r=new T.Mesh(new T.TorusGeometry(.0112,.0016,8,24,Math.PI*1.6),ringM);r.rotation.set(Math.PI/2,0,Math.PI*.7);r.position.copy(trA).lerp(car,k/9);IN.add(r)}}
  function branch(p0,dir,L,r,depth,sd,path){const n=5,pts=[p0.clone()];let q=p0.clone(),d=dir.clone();for(let k=1;k<=n;k++){d.add(V(R2()-.5,R2()-.5,R2()-.5).multiplyScalar(.2)).normalize();let nq=q.clone().addScaledVector(d,L/n);
      if(depth>0&&!inLung(nq,sd)){const c=V(sd*.072,CY-.04,CZ);d.lerp(c.sub(q).normalize(),.6).normalize();nq=q.clone().addScaledVector(d,L/n)}q=nq;pts.push(q)}
    const cvv=new T.CatmullRomCurve3(pts),r1=r*.72;IN.add(ptube(cvv,t=>lerp(r,r1,t),depth<2?24:12,depth<2?10:6,brM));const np=path.concat([cvv]);
    if(depth<5){const ax=V(R2()-.5,R2()-.5,R2()-.5).cross(d).normalize();[1,-1].forEach((sg,k)=>{const nd=d.clone().applyAxisAngle(ax,sg*(.45+R2()*.35)).add(V(sd*.12,-.12,0)).normalize();branch(q,nd,L*(.68+R2()*.12),r1*(k?.8:.92),depth+1,sd,np)})}
    else{tips.push(q.clone());paths.push(np)}}
  [-1,1].forEach(sd=>branch(car,V(sd*.75,-.62,-.05).normalize(),.05,.0075,0,sd,[]));
  /* алвеоли: малки гроздове в края на бронхиолите */
  const alvM=rim(new T.MeshPhysicalMaterial({color:0xff9aa8,roughness:.35,clearcoat:.8,transparent:true,opacity:0,emissive:0x40101a}),0xffffff,.6);
  const AN=tips.length*6,alv=new T.InstancedMesh(new T.SphereGeometry(.0034,10,8),alvM,AN);{const M=new T.Matrix4();let k=0;tips.forEach(tp=>{for(let j=0;j<6;j++){M.makeTranslation(tp.x+(R2()-.5)*.009,tp.y+(R2()-.5)*.009,tp.z+(R2()-.5)*.009);alv.setMatrixAt(k++,M)}})}IN.add(alv);
  /* сърце между белите дробове (полупрозрачно) */
  const heartM=rim(new T.MeshPhysicalMaterial({color:0xb4233a,roughness:.45,clearcoat:.5,transparent:true,opacity:0,depthWrite:false}),0xff8a9a,.6);
  {const g=new T.SphereGeometry(1,48,36),P=g.attributes.position;for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);if(y<0){x*=1+y*.45;z*=1+y*.45}P.setXYZ(i,x,y,z)}g.computeVertexNormals();
    const h=new T.Mesh(g,heartM);h.scale.set(.05,.062,.045);h.position.set(.02,CY-.06,CZ+.04);h.rotation.z=.65;h.renderOrder=3;IN.add(h);IN.userData.heart=h}
  /* ребра: полупрозрачни дъги около гърдите */
  const ribM=new T.MeshStandardMaterial({color:0xefe8dc,roughness:.6,transparent:true,opacity:0,depthWrite:false});
  for(let k=0;k<10;k++){const y=CY+.15-k*.03,rx=.105+.03*Math.sin(Math.min(1,k/5)*Math.PI/2)-(k>7?.01*(k-7):0),rz=.085+k*.002;[-1,1].forEach(sd=>{const pts=[];for(let j=0;j<=24;j++){const a=-Math.PI/2+j/24*Math.PI;pts.push(V(sd*rx*Math.cos(a)*.98,y-.04*Math.sin(a+Math.PI/2)*.5-(j/24)*.035,CZ+rz*Math.sin(-a)))}
      const r=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),48,.0042,6,false),ribM);r.renderOrder=5;IN.add(r)})}
  {const stern=new T.Mesh(new T.BoxGeometry(.022,.17,.01),ribM);stern.position.set(0,CY+.07,CZ+.088);stern.renderOrder=5;IN.add(stern)}
  /* въздух: светещи частици по пътищата трахея → бронхиоли */
  const dotT=canvasTex(64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,"rgba(255,255,255,1)");r.addColorStop(.3,"rgba(190,220,255,.8)");r.addColorStop(1,"rgba(120,170,255,0)");g.fillStyle=r;g.fillRect(0,0,w,h)});
  const AIR=320,aG=new T.BufferGeometry(),aP=new Float32Array(AIR*3);aG.setAttribute("position",new T.BufferAttribute(aP,3));const aM=new T.PointsMaterial({size:.012,map:dotT,transparent:true,depthWrite:false,depthTest:false,blending:T.AdditiveBlending,opacity:0});
  const air=new T.Points(aG,aM);air.frustumCulled=false;air.renderOrder=8;IN.add(air);const airD=[];for(let i=0;i<AIR;i++)airD.push({p:Math.floor(R2()*paths.length),o:R2()});
  const trC=new T.CatmullRomCurve3([trA.clone().add(V(0,.06,0)),trA,car]);
  function airPos(i,u){const pp=paths[airD[i].p],segs=pp.length+1;let x=u*segs;if(x<1)return trC.getPointAt(Math.min(1,x));x-=1;const k=Math.min(pp.length-1,Math.floor(x));return pp[k].getPointAt(Math.min(1,x-k))}

  /* ---- стетоскоп: слушалка (диафрагма + камбанка) и тръба нагоре ---- */
  let tt=0;const steth=new T.Group();S.add(steth);
  const chrome=new T.MeshStandardMaterial({color:0xd4d8de,metalness:1,roughness:.18,envMapIntensity:1.2,transparent:true});const tubeM=new T.MeshPhysicalMaterial({color:0x1d2026,roughness:.35,clearcoat:.8,transparent:true});
  {const ring=new T.Mesh(new T.CylinderGeometry(.024,.024,.011,48),chrome);ring.rotation.x=Math.PI/2;steth.add(ring);
    const dia=new T.Mesh(new T.CylinderGeometry(.021,.021,.002,48),new T.MeshPhysicalMaterial({color:0x111215,roughness:.25,clearcoat:1,transparent:true}));dia.rotation.x=Math.PI/2;dia.position.z=-.0058;steth.add(dia);
    const stem=new T.Mesh(new T.CylinderGeometry(.0045,.0045,.03,16),chrome);stem.position.set(0,.022,.004);steth.add(stem);const bell=new T.Mesh(new T.SphereGeometry(.011,24,16),chrome);bell.position.set(0,.0,.012);bell.scale.set(1,1,.6);steth.add(bell)}
  steth.traverse(o=>{if(o.isMesh)o.castShadow=true});
  const tube=new T.Mesh(new T.BufferGeometry(),tubeM);tube.castShadow=true;S.add(tube);
  /* аускултационна точка вляво на гърдите: намира се по повърхността на модела с лъч отпред */
  let chestPt=V(.07,OY+.455,.12),chestN=V(0,0,1);
  if(body){body.updateMatrixWorld(true);const rc=new T.Raycaster(V(.07,OY+.455,1),V(0,0,-1));const h=rc.intersectObject(body,false)[0];if(h){chestPt=h.point.clone();chestN=h.face.normal.clone().transformDirection(body.matrixWorld)}}
  const restPt=chestPt.clone().addScaledVector(chestN,.2).add(V(.035,.02,0));
  function placeSteth(u){const e=u*u*(3-2*u);const p=restPt.clone().lerp(chestPt.clone().addScaledVector(chestN,.0062),e);p.x+=.004*Math.sin(tt*1.3)*(1-e);p.y+=.004*Math.sin(tt*1.7)*(1-e);steth.position.copy(p);
    steth.lookAt(p.clone().addScaledVector(chestN,-1));
    const top=V(.42,OY+.95,.75),a=p.clone().addScaledVector(chestN,.02).add(V(0,.02,0)),b=a.clone().lerp(top,.35).add(V(.03,-.06,.05)),c=a.clone().lerp(top,.7).add(V(.04,-.02,.03));
    tube.geometry.dispose();tube.geometry=new T.TubeGeometry(new T.CatmullRomCurve3([a,b,c,top]),60,.0045,8,false)}
  placeSteth(0);

  /* светлини */
  const key=new T.SpotLight(0xfff1e4,3,8,.55,.6,1.2);key.position.set(-1.3,2.4,2.2);key.target.position.set(0,1,0);key.castShadow=true;key.shadow.mapSize.set(MOBILE?1024:2048,MOBILE?1024:2048);key.shadow.bias=-.0002;key.shadow.radius=4;S.add(key,key.target);
  const rimL=new T.DirectionalLight(0xffd5dc,1.1);rimL.position.set(1.5,2,-2);S.add(rimL);const fill=new T.DirectionalLight(0xcfe0ff,.45);fill.position.set(2.5,1.4,2);S.add(fill);
  const hemi=new T.HemisphereLight(0xffffff,0x1a1b1e,.35);S.add(hemi);
  const inner=new T.PointLight(0xff9aa6,0,1.2,2);inner.position.set(0,OY+CY+.05,CZ+.3);S.add(inner);

  function size(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.aspect<.8?54:34;cam.updateProjectionMatrix()}
  size();addEventListener("resize",size);

  /* ---------- камера ---------- */
  const look0=V(.0,OY+.4,.05);
  const A={p:V(.66,OY+.47,1.05),l:V(.02,OY+.41,.05)},B={p:V(.52,OY+.44,.64),l:V(.03,OY+.415,.06)};
  const C={p:V(.0,OY+.44,.62),l:V(0,OY+CY-.02,CZ)};
  let last=performance.now(),touched=0,lungAlpha=0;const DUR=4.2,DIVE=3.2;
  R.compile(S,cam);setC("ready");phase="intro";
  setTimeout(()=>{if(!ended&&phase==="intro")setText("exam")},1600);
  setTimeout(()=>{if(!ended&&phase==="intro"){setC("hinted");phase="hold"}},3400);
  const flashEl=$(".flash"),rrEl=$("#hxo-rr");
  function touch(){if(touched)return;touched=1;phase="dive";diveT=0;heard=true;setC("hinted",false);setC("listen",false);
    const v=chestPt.clone().project(cam);flashEl.style.setProperty("--fx",((v.x+1)/2*100).toFixed(1)+"%");flashEl.style.setProperty("--fy",((1-v.y)/2*100).toFixed(1)+"%");
    if(!AC&&!sndMuted)audioInit().then(()=>setSound(true)).catch(()=>{})}
  function frame(n){if(ended)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,(n-last)/1000);last=n;tt+=dt;
    const b=breath(tt);
    /* гърдите и раменете се повдигат при вдишване */
    if(body){body.scale.set(1+.006*b,1+.004*b,1+.014*b);hairShells.forEach(h=>h.scale.copy(body.scale))}
    /* белите дробове се разширяват надолу (диафрагмата) и встрани */
    lungs.forEach(m=>{m.scale.set(1+.05*b,1+.075*b,1+.05*b);m.position.y=-.012*b})
    IN.userData.heart.scale.setScalar(.05).multiply(V(1,1.24,.9)).multiplyScalar(1+.04*Math.max(0,Math.sin(tt*7.2)));
    if(diveT<0){/* кабинетът */
      const u=1-Math.pow(1-cl(tt/DUR,0,1),3);cam.position.copy(A.p).lerp(B.p,u);cam.lookAt(A.l.clone().lerp(B.l,u));
      prog+=(progT-prog)*Math.min(1,dt*7);placeSteth(prog);$(".prog").style.setProperty("--pp",Math.round(prog*100)+"%");if(prog>.985)touch()}
    else{diveT+=dt;const d=diveT;placeSteth(1);
      /* проблясък при допира, после камерата влиза към гърдите, кожата избледнява, вътрешността изплува */
      flashEl.style.opacity=(Math.max(0,1-d/.7)*sm(0,.06,d)).toFixed(3);
      const u=sm(.15,DIVE,d);cam.position.copy(B.p).lerp(C.p,u);cam.lookAt(B.l.clone().lerp(C.l,u));
      if(d>DIVE){const w=d-DIVE,a=Math.sin(w*.18)*.42;cam.position.set(C.p.x+Math.sin(a)*.6,C.p.y+.02*Math.sin(w*.3),CZ+Math.cos(a)*(C.p.z-CZ));cam.lookAt(C.l)}
      const sk=1-sm(.5,2.3,d)*.9;docMats.forEach(m=>{m.opacity=sk;m.depthWrite=sk>.98});
      const sa=1-sm(.25,1.1,d);[chrome,tubeM].forEach(m=>m.opacity=sa);steth.visible=tube.visible=sa>.01;
      lungAlpha=sm(.7,2.5,d);lungM.opacity=.62*lungAlpha;brM.opacity=lungAlpha;if(brM.userData.rings)brM.userData.rings.opacity=lungAlpha;alvM.opacity=lungAlpha;heartM.opacity=.45*lungAlpha;ribM.opacity=.38*lungAlpha;aM.opacity=lungAlpha;
      inner.intensity=1.6*lungAlpha;
      const k=sm(.6,2.6,d);S.background.lerpColors(BG0,BG1,k);S.fog.color.copy(S.background);S.fog.near=lerp(4,.5,k);S.fog.far=lerp(9,1.6,k);hemi.intensity=lerp(.35,.18,k);
      if(d>1.4){setText("lungs");setC("ecg")}
      if(d>DIVE+.6&&phase==="dive"){phase="hold2";$(".hint em").textContent="Scroll to enter";setC("hinted")}}
    /* въздух: навътре при вдишване, навън при издишване */
    if(lungAlpha>0){const f=flow(tt),P=aG.attributes.position;for(let i=0;i<AIR;i++){const o=airD[i];o.o=(o.o+dt*f*.35+1)%1;const q=airPos(i,o.o);P.setXYZ(i,q.x,q.y,q.z)}P.needsUpdate=true;aM.size=.009+.006*Math.abs(f)}
    alvM.emissive.setRGB(.25+.4*b,.06+.08*b,.1+.12*b);
    soundFrame(tt);if(ov.classList.contains("ecg")){ecDraw(dt);rrEl.textContent=String(Math.round(60/BP))}
    R.render(S,cam)}
  raf=requestAnimationFrame(frame);
  window.__lxSeek=d=>{if(d<0){progT=Math.min(1,-d);return}if(!touched)touch();diveT=d};
}
})();
