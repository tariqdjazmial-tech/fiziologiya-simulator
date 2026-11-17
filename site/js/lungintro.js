/* ===== Въведение „Дихателна система“ =====
   1) пациент седи в кабинета, пред гърдите му виси слушалката на стетоскоп;
   2) при скрол/плъзгане слушалката се приближава и докосва гръдния кош (следва пръста);
   3) при допира се чува дишане, кожата става прозрачна и вътре се виждат дишащите бели дробове
      с бронхиалното дърво; отдолу — спирограма;
   4) при следващ скрол — зареждащ екран „PhysioNova“ и началната страница.
   Модел на пациента: базов човек на MakeHuman (CC0), поставен седнал с design/tools/posehuman.py (POSE=patient) → m/patient.txt.
   Органи: BodyParts3D © The Database Center for Life Science, CC BY-SA 2.1 Japan — опростени с design/tools/bp3d.py → m/bp_*.txt.
   Стетоскопът и стаята са построени в кода. */
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
 <div class="cr">Models: patient — <a href="http://www.makehumancommunity.org/" target="_blank" rel="noopener">MakeHuman</a>, CC0 · organs — <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html" target="_blank" rel="noopener">BodyParts3D</a>, © DBCLS, CC BY-SA 2.1 JP</div>`;
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
if(RM){noGL()}else{load(THREE_URL).then(()=>Promise.all(["patient","bp_lungs","bp_airway","bp_bronch","bp_heart","bp_aorta","bp_partery","bp_pvein","bp_diaph","bp_bone","bp_cart"].map(n=>getMesh("m/"+n+".txt")))).then(([p,...o])=>{if(!ended&&phase==="pre")build(p,o)}).catch(e=>{console.error(e);noGL()})}
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
function build(patG,ORG){const T=THREE,V=(x,y,z)=>new T.Vector3(x,y,z);
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
  const OY=.45,docMats=[];let body=null,hairShells=[];
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

  /* ---- вътрешността: истински органи от BodyParts3D (DBCLS, CC BY-SA 2.1 Japan), опростени с design/tools/bp3d.py ---- */
  const IN=new T.Group();IN.position.set(0,OY,0);S.add(IN);
  const CY=.43,CZ=.03;
  /* „тъкан“: шум в шейдъра за петна, мрежа от съдчета и влажен отблясък */
  const NOISE=`float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}`;
  const tissue=(o)=>{const m=new T.MeshPhysicalMaterial({color:new T.Color(o.c).convertSRGBToLinear(),roughness:o.r??.45,clearcoat:o.cc??.6,clearcoatRoughness:.22,transparent:true,opacity:0,envMapIntensity:o.env??.6,side:o.ds?T.DoubleSide:T.FrontSide,depthWrite:!!o.dw});
    const rc=new T.Color(o.rim||0xffd6d6).convertSRGBToLinear(),c2=new T.Color(o.c2||o.c).convertSRGBToLinear(),sp=new T.Color(o.sp||0x000000).convertSRGBToLinear();
    m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uRim:{value:rc},uRimI:{value:o.rimI??.5},uC2:{value:c2},uSp:{value:sp},uSc:{value:o.sc||60},uSpk:{value:o.spk||0},uBr:m.userData.uBr={value:0},uCar:{value:new T.Vector3(0,OY+.628-.08,.008)}});
      sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 vWp;").replace("#include <worldpos_vertex>","#include <worldpos_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;");
      sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nuniform vec3 uRim,uC2,uSp,uCar;uniform float uRimI,uSc,uSpk,uBr;varying vec3 vWp;\n"+NOISE)
        .replace("#include <color_fragment>","#include <color_fragment>\n{float n=fbm(vWp*uSc);diffuseColor.rgb=mix(diffuseColor.rgb,uC2,smoothstep(.35,.75,n));float v=abs(fbm(vWp*uSc*.45+7.)-.5);diffuseColor.rgb*=1.-.22*smoothstep(.04,.0,v);float d=vn(vWp*uSc*5.);diffuseColor.rgb=mix(diffuseColor.rgb,uSp,uSpk*step(.86,d));}")
        .replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\n{float fr=pow(1.0-clamp(abs(dot(normal,normalize(vViewPosition))),0.0,1.0),2.4);totalEmissiveRadiance+=uRim*fr*uRimI;float r=distance(vWp,uCar);totalEmissiveRadiance+=vec3(.55,.75,1.)*uBr*exp(-pow((r-uBr*.13)*40.,2.))*1.4;}")};
    m.customProgramCacheKey=()=>"tis"+(o.k||"");return m};
  const M={
    lungs:tissue({k:"lu",c:0xe08a86,c2:0xb85a5e,sp:0x3a2a30,spk:.55,sc:70,r:.38,cc:.75,rim:0xffe0dc,rimI:.7,env:.7}),
    airway:tissue({k:"aw",c:0xf0e2d4,c2:0xd9c2ae,sc:120,r:.4,cc:.5,rim:0xffffff,rimI:.35,dw:1}),
    bronch:tissue({k:"br",c:0xf3e5d8,c2:0xe2c9b6,sc:160,r:.4,cc:.5,rim:0xffffff,rimI:.35,dw:1}),
    heart:tissue({k:"he",c:0x9c2a2e,c2:0x6e1a20,sp:0xe8d0a0,spk:.25,sc:45,r:.32,cc:.85,rim:0xff8a90,rimI:.45,dw:1}),
    aorta:tissue({k:"ao",c:0xc0393c,c2:0xa52a30,sc:60,r:.3,cc:.8,rim:0xff9aa0,rimI:.4,dw:1}),
    partery:tissue({k:"pa",c:0x3f5ea8,c2:0x2e4688,sc:80,r:.32,cc:.8,rim:0x9ab8ff,rimI:.4,dw:1}),
    pvein:tissue({k:"pv",c:0xb43a48,c2:0x8e2a36,sc:80,r:.32,cc:.8,rim:0xff9aa8,rimI:.4,dw:1}),
    diaph:tissue({k:"di",c:0x9a4a42,c2:0x7a3630,sc:50,r:.5,cc:.4,rim:0xffb0a0,rimI:.3,ds:1}),
    bone:tissue({k:"bo",c:0xe9dcc2,c2:0xcdbb98,sc:90,r:.62,cc:.15,rim:0xfff4e0,rimI:.35,env:.35}),
    cart:tissue({k:"ca",c:0xd6e2e4,c2:0xbfd0d4,sc:90,r:.35,cc:.6,rim:0xffffff,rimI:.5})};
  const NAMES=["lungs","airway","bronch","heart","aorta","partery","pvein","diaph","bone","cart"],OP={lungs:.72,airway:1,bronch:1,heart:1,aorta:1,partery:.95,pvein:.95,diaph:.5,bone:.34,cart:.22};
  const ORD={bronch:1,airway:1,partery:2,pvein:2,heart:2,aorta:2,bone:3,diaph:4,cart:5,lungs:6};
  const ORGS={};NAMES.forEach((n,i)=>{const g=ORG&&ORG[i];if(!g)return;const m=new T.Mesh(g,M[n]);m.renderOrder=ORD[n];IN.add(m);ORGS[n]=m});
  /* опорни точки за дишането: белите дробове растат надолу и встрани, диафрагмата слиза */
  const lungPiv=V(0,.55,.01);[ORGS.lungs,ORGS.bronch,ORGS.partery,ORGS.pvein].forEach(m=>{if(m){m.geometry.translate(-lungPiv.x,-lungPiv.y,-lungPiv.z);m.position.copy(lungPiv)}});
  const heartPiv=V(.02,.5,.03);if(ORGS.heart){ORGS.heart.geometry.translate(-heartPiv.x,-heartPiv.y,-heartPiv.z);ORGS.heart.position.copy(heartPiv)}
  /* ---- стетоскоп: слушалка (диафрагма + камбанка) и тръба нагоре ---- */
  let tt=0;const steth=new T.Group();S.add(steth);
  const chrome=new T.MeshStandardMaterial({color:0xd4d8de,metalness:1,roughness:.18,envMapIntensity:1.2,transparent:true});const tubeM=new T.MeshPhysicalMaterial({color:0x15171b,roughness:.35,clearcoat:.8,transparent:true});
  {const ring=new T.Mesh(new T.CylinderGeometry(.024,.024,.011,48),chrome);ring.rotation.x=Math.PI/2;steth.add(ring);
    const dia=new T.Mesh(new T.CylinderGeometry(.021,.021,.002,48),new T.MeshPhysicalMaterial({color:0x111215,roughness:.25,clearcoat:1,transparent:true}));dia.rotation.x=Math.PI/2;dia.position.z=.0058;steth.add(dia);
    const stem=new T.Mesh(new T.CylinderGeometry(.0045,.0045,.03,16),chrome);stem.position.set(0,-.022,-.004);steth.add(stem);const bell=new T.Mesh(new T.SphereGeometry(.011,24,16),chrome);bell.position.set(0,.0,-.012);bell.scale.set(1,1,.6);steth.add(bell)}
  steth.traverse(o=>{if(o.isMesh)o.castShadow=true});
  const tube=new T.Mesh(new T.BufferGeometry(),tubeM);tube.castShadow=true;S.add(tube);
  /* аускултационна точка вляво на гърдите: намира се по повърхността на модела с лъч отпред */
  let chestPt=V(.075,OY+.53,.13),chestN=V(0,0,1);
  if(body){body.updateMatrixWorld(true);const rc=new T.Raycaster(V(.075,OY+.53,1),V(0,0,-1));const h=rc.intersectObject(body,false)[0];if(h){chestPt=h.point.clone();chestN=h.face.normal.clone().transformDirection(body.matrixWorld)}}
  const restPt=chestPt.clone().addScaledVector(chestN,.09).add(V(.03,-.13,0));
  function placeSteth(u){const e=u*u*(3-2*u);const end=chestPt.clone().addScaledVector(chestN,.0062);const p=restPt.clone().lerp(end,e);p.addScaledVector(chestN,.035*Math.sin(e*Math.PI));p.x+=.004*Math.sin(tt*1.3)*(1-e);p.y+=.004*Math.sin(tt*1.7)*(1-e);steth.position.copy(p);
    steth.lookAt(p.clone().addScaledVector(chestN,-1));
    const top=V(.3,OY+.14,.66),a=p.clone().addScaledVector(chestN,.02).add(V(0,-.02,0)),b=a.clone().lerp(top,.35).add(V(.02,.02,.04)),c=a.clone().lerp(top,.7).add(V(.03,.03,.02));
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
  const A={p:V(.44,OY+.5,.9),l:V(.035,OY+.48,.06)},B={p:V(.3,OY+.5,.55),l:V(.04,OY+.485,.07)};
  const C={p:V(.0,OY+.5,.62),l:V(0,OY+.5,.01)};
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
    [ORGS.lungs,ORGS.bronch,ORGS.partery,ORGS.pvein].forEach(m=>{if(m)m.scale.set(1+.035*b,1+.05*b,1+.03*b)});if(ORGS.diaph)ORGS.diaph.position.y=-.012*b;
    if(ORGS.heart){const hb=(tt*1.2)%1,c=hb<.3?Math.sin(hb/.3*Math.PI):0;ORGS.heart.scale.setScalar(1-.035*c)}
    M.bronch.userData.uBr&&(M.bronch.userData.uBr.value=flow(tt)>0?breath(tt):0);M.airway.userData.uBr&&(M.airway.userData.uBr.value=flow(tt)>0?breath(tt):0);
    if(diveT<0){/* кабинетът */
      const u=1-Math.pow(1-cl(tt/DUR,0,1),3);cam.position.copy(A.p).lerp(B.p,u);cam.lookAt(A.l.clone().lerp(B.l,u));
      prog+=(progT-prog)*Math.min(1,dt*7);placeSteth(prog);$(".prog").style.setProperty("--pp",Math.round(prog*100)+"%");if(prog>.985)touch()}
    else{diveT+=dt;const d=diveT;placeSteth(1);
      /* проблясък при допира, после камерата влиза към гърдите, кожата избледнява, вътрешността изплува */
      flashEl.style.opacity=(Math.max(0,1-d/.7)*sm(0,.06,d)).toFixed(3);
      const u=sm(.15,DIVE,d);cam.position.copy(B.p).lerp(C.p,u);cam.lookAt(B.l.clone().lerp(C.l,u));
      if(d>DIVE){const w=d-DIVE,a=Math.sin(w*.18)*.5;cam.position.set(Math.sin(a)*(C.p.z-.01),C.p.y+.015*Math.sin(w*.3),.01+Math.cos(a)*(C.p.z-.01));cam.lookAt(C.l)}
      const sk=1-sm(.5,2.3,d)*.9;docMats.forEach(m=>{m.opacity=sk;m.depthWrite=sk>.98});
      const sa=1-sm(.25,1.1,d);[chrome,tubeM].forEach(m=>m.opacity=sa);steth.visible=tube.visible=sa>.01;
      lungAlpha=sm(.7,2.5,d);NAMES.forEach(n=>{M[n].opacity=OP[n]*lungAlpha;if(M[n].depthWrite!==undefined&&OP[n]>=.9)M[n].depthWrite=lungAlpha>.9});
      inner.intensity=1.6*lungAlpha;
      const k=sm(.6,2.6,d);S.background.lerpColors(BG0,BG1,k);S.fog.color.copy(S.background);S.fog.near=lerp(4,.5,k);S.fog.far=lerp(9,1.6,k);hemi.intensity=lerp(.35,.18,k);
      if(d>1.4){setText("lungs");setC("ecg")}
      if(d>DIVE+.6&&phase==="dive"){phase="hold2";$(".hint em").textContent="Scroll to enter";setC("hinted")}}
    /* въздух: навътре при вдишване, навън при издишване */
    soundFrame(tt);if(ov.classList.contains("ecg")){ecDraw(dt);rrEl.textContent=String(Math.round(60/BP))}
    R.render(S,cam)}
  raf=requestAnimationFrame(frame);
  window.__lxSeek=d=>{if(d<0){progT=Math.min(1,-d);return}if(!touched)touch();diveT=d};
}
})();
