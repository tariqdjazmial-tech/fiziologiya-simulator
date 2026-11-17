/* ===== Въведение „Нервна система“ =====
   1) поглед отгоре: лекар на бюро разглежда ЕКГ листове;
   2) при скрол камерата влиза в главата: за кратко се вижда мозъкът, после невроните с акционни потенциали и накрая синапсът;
   3) при следващ скрол — зареждащ екран „PhysioNova“ и началната страница.
   Модели: мозък — „Brain AS.stl“, Agnieszka Starostecka, CC BY 4.0 (Wikimedia Commons), опростен в m/brain.txt;
           неврон — „Neuron mapped by gamers in EyeWire.stl“, EyeWire / Seung Lab, обществено достояние, опростен в m/neuron.txt.
   Лекарят, бюрото, листовете и синапсът са построени в кода. */
(function(){"use strict";
if(window.__introPick!=="neuro")return;
const ov=document.getElementById("hxo");if(!ov)return;window.__hxo=true;
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE=matchMedia("(max-width: 700px)").matches;
const THREE_URL="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
const load=src=>new Promise((res,rej)=>{if(src===THREE_URL&&window.THREE)return res();if([...document.scripts].some(s=>s.src===src)){const t0=Date.now();(function w(){if(window.THREE)res();else if(Date.now()-t0>15000)rej(new Error("three"));else setTimeout(w,60)})();return}const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
const brand=document.querySelector(".brand b,.logo b,.brand");const FONT=brand?getComputedStyle(brand).fontFamily:"system-ui,sans-serif";

/* ---------- изглед ---------- */
const css=`
#hxo{position:fixed;inset:0;z-index:100000;background:radial-gradient(120% 80% at 20% 0%,#FBFBFC 0%,rgba(251,251,252,0) 55%),linear-gradient(115deg,#D9DCE0 0%,#F4F5F6 28%,#C9CDD2 46%,#EEF0F2 64%,#D3D7DB 82%,#F6F7F8 100%);color:#eef0ee;overflow:hidden;font-family:${FONT};transition:opacity .7s ease}
#hxo.out{opacity:0;pointer-events:none}
#hxo canvas.gl{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 1.2s ease,transform 1.3s cubic-bezier(.6,0,.2,1)}
#hxo.ready canvas.gl{opacity:1}
#hxo.zoom canvas.gl{transform:scale(1.25);opacity:0}
#hxo .fade{position:absolute;inset:0;background:#06070a;opacity:0;pointer-events:none}
#hxo .vig{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 1s;background:radial-gradient(ellipse 70% 62% at 50% 46%,transparent 42%,rgba(3,4,5,.5) 74%,rgba(3,4,5,.9) 100%)}
#hxo.ready .vig{opacity:1}#hxo.zoom .vig{opacity:0}
#hxo:not(.ready) .skip,#hxo:not(.ready) .snd,#hxo.zoom .skip,#hxo.zoom .snd{color:#1D1D1F;background:rgba(255,255,255,.6);border-color:rgba(29,29,31,.14)}
#hxo .pre{position:absolute;inset:0;display:grid;place-items:center;font:600 13px/1 system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#5E5E63;transition:opacity .6s}
#hxo.ready .pre{opacity:0}
#hxo .side{text-shadow:0 2px 18px rgba(0,0,0,.85);position:absolute;top:50%;transform:translate(0,-50%);max-width:min(30vw,340px);opacity:0;transition:opacity .6s ease,transform .8s cubic-bezier(.2,.8,.2,1);pointer-events:none}
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
#hxo.zoom .mon .lab{opacity:0}
#hxo .brandx{position:absolute;left:0;right:0;top:calc(50% - 21vh - 10px);transform:translateY(-100%);text-align:center;opacity:0;transition:opacity .9s ease .5s}
#hxo .brandx b{display:block;font-weight:800;font-size:clamp(44px,8vw,104px);letter-spacing:-.03em;color:#1D1D1F;line-height:1}
#hxo .brandx b i{font-style:normal;color:#C8102E}
#hxo .brandx span{display:block;margin-top:12px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#5E5E63}
#hxo.zoom .brandx{opacity:1}
#hxo .load{position:absolute;left:50%;top:calc(50% + 21vh + 26px);transform:translateX(-50%);width:min(320px,70vw);opacity:0;transition:opacity .6s ease .8s;text-align:center;font:500 12px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5E5E63}
#hxo .load i{display:block;height:2px;margin-top:12px;background:rgba(29,29,31,.12);overflow:hidden;border-radius:2px}
#hxo .load i::after{content:"";display:block;height:100%;width:var(--lp,0%);background:#C8102E;transition:width .25s linear}
#hxo.zoom .load{opacity:1}
#hxo .hint{position:absolute;left:50%;bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 124px);transform:translateX(-50%);opacity:0;transition:opacity .8s;
  font:600 12px/1 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#e9ece8;border:0;background:none;cursor:pointer;padding:12px 16px;min-height:44px;pointer-events:none}
#hxo .hint span{display:inline-block;animation:hxb 1.6s ease-in-out infinite}
@keyframes hxb{50%{transform:translateY(5px)}}
#hxo.hinted .hint{opacity:.9;pointer-events:auto}
#hxo.zoom .hint{opacity:0;pointer-events:none}
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
  #hxo .hint{bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 100px)}
  #hxo.zoom .mon{bottom:calc(50% - 15vh);height:30vh}
  #hxo .brandx{top:calc(50% - 15vh - 10px)}#hxo .load{top:calc(50% + 15vh + 22px)}
  #hxo .cr{top:auto;bottom:6px;left:20px;font-size:9px}
  #hxo .snd .t{display:none}
}
@media (prefers-reduced-motion:reduce){#hxo .hint span{animation:none}}
`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
ov.innerHTML=`<canvas class="gl" aria-hidden="true"></canvas><div class="vig"></div><div class="fade"></div>
 <div class="pre">Preparing the consulting room…</div>
 <div class="side l"></div><div class="side r"></div>
 <div class="mon"><canvas aria-hidden="true"></canvas><span class="lab">ECG · II · 25 mm/s</span></div>
 <div class="brandx"><b>Physio<i>Nova</i></b><span>Physiology simulator</span></div>
 <div class="load">Opening the home page<i></i></div>
 <button class="hint" type="button"><em>Scroll to look inside</em> <span>↓</span></button>
 <button class="snd" type="button" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path class="w1" d="M16 9a4 4 0 0 1 0 6"/><path class="w2" d="M18.5 6.5a8 8 0 0 1 0 11"/></svg><span class="t">Tap to hear the neurons</span></button>
 <button class="skip" type="button">Skip</button>
 <div class="cr">Models: brain — <a href="https://commons.wikimedia.org/wiki/File:Brain_AS.stl" target="_blank" rel="noopener">Agnieszka Starostecka</a>, CC BY 4.0 · neuron — <a href="https://commons.wikimedia.org/wiki/File:Neuron_mapped_by_gamers_in_EyeWire.stl" target="_blank" rel="noopener">EyeWire</a>, public domain</div>`;
const $=s=>ov.querySelector(s);

/* ---------- текст за всеки етап ---------- */
const TXT={
 office:[["Nervous system","Reading the heart takes a brain","An ECG on the desk — and 86 billion neurons interpreting it."],["For medical students","From signal to synapse","Theory, live simulations and 3D models for every topic."]],
 brain:[["The brain","1.4 kg, 20 % of your energy","Most of it spent keeping ion gradients ready for the next signal."],["Cortex","16 billion cortical neurons","Each one listening to thousands of others."]],
 neuron:[["Electrical signal","An action potential","Na⁺ rushes in, K⁺ flows out — up to 120 m/s along myelinated axons."],["All or none","−70 → +30 mV in 1 ms","The same spike, every time. Strength is coded by frequency."]],
 syn:[["Chemical signal","The synapse","Ca²⁺ enters, vesicles fuse, transmitter crosses a 20 nm cleft."],["≈ 0.5 ms","Synaptic delay","The pause where learning, drugs and toxins act."]]};
let txtKey=null;
function setText(k){if(txtKey===k)return;txtKey=k;ov.classList.remove("texts");setTimeout(()=>{if(txtKey!==k)return;const [l,r]=TXT[k];
  $(".side.l").innerHTML=`<small>${l[0]}</small><b>${l[1]}</b><span>${l[2]}</span>`;$(".side.r").innerHTML=`<small>${r[0]}</small><b>${r[1]}</b><span>${r[2]}</span>`;if(!ended&&phase!=="zoom")ov.classList.add("texts")},450)}

/* ---------- звук: щракания на акционни потенциали, както звучи усилен запис от неврон ---------- */
let AC=null,MG=null,sndOn=false,sndMuted=false;
try{sndMuted=localStorage.getItem("pn_intro_sound")==="off"}catch(e){}
function audioInit(){if(AC)return AC.state==="suspended"?AC.resume():Promise.resolve();const C=window.AudioContext||window.webkitAudioContext;if(!C)return Promise.reject();
  AC=new C();MG=AC.createGain();MG.gain.value=0;const hp=AC.createBiquadFilter();hp.type="highpass";hp.frequency.value=300;const comp=AC.createDynamicsCompressor();MG.connect(hp);hp.connect(comp);comp.connect(AC.destination);return AC.resume()}
let NB=null;function noise(){if(NB)return NB;const n=AC.sampleRate*.05,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(n*.12));return NB=b}
function click(g){if(!sndOn||!AC)return;const t=AC.currentTime+.005,s=AC.createBufferSource();s.buffer=noise();const f=AC.createBiquadFilter();f.type="bandpass";f.frequency.value=1800+Math.random()*1400;f.Q.value=.9;const a=AC.createGain();a.gain.value=g;s.connect(f);f.connect(a);a.connect(MG);s.start(t)}
function setSound(on){sndOn=on;const b=$(".snd");b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));b.querySelector(".t").textContent=on?"Sound on":"Sound off";b.querySelector(".w1").style.opacity=b.querySelector(".w2").style.opacity=on?1:.15;
  if(MG&&AC)MG.gain.setTargetAtTime(on?.7:0,AC.currentTime,.08)}
function enableFromGesture(){if(AC||sndMuted)return;audioInit().then(()=>setSound(true)).catch(()=>{})}

/* ---------- монитор отдолу: ЕКГ (листовете на бюрото) → ЕЕГ → потенциал на аксона → ВПСП ---------- */
const ec=$(".mon canvas"),ex=ec.getContext("2d");let ew=0,eh=0,ed=1,ecX=0,ecLastY=null,ecT=0,mode="ecg",spikeT=0;
function ecSize(){const r=ec.getBoundingClientRect();ed=Math.min(2,devicePixelRatio||1);ew=Math.max(1,r.width);eh=Math.max(1,r.height);ec.width=ew*ed;ec.height=eh*ed;ex.setTransform(ed,0,0,ed,0,0);ex.clearRect(0,0,ew,eh);ecX=0;ecLastY=null}
new ResizeObserver(ecSize).observe(ec);
const LAB={ecg:"ECG · II · 25 mm/s",eeg:"EEG · Fp1–F3 · alpha",ap:"Vm · axon · mV",epsp:"EPSP · dendrite · mV"};
function setMode(m){if(mode===m)return;mode=m;$(".mon .lab").textContent=LAB[m]}
const g1=(p,m,s,a)=>a*Math.exp(-((p-m)*(p-m))/(2*s*s));
let nextSpike=.4,lastSpikeAt=-9;
function sig(t){if(mode==="ecg"){const T=60/72,p=((t%T)+T)%T/T;return g1(p,.10,.025,.13)+g1(p,.185,.008,-.12)+g1(p,.21,.010,1)+g1(p,.235,.010,-.27)+g1(p,.46,.045,.32)-.15}
  if(mode==="eeg")return .28*Math.sin(t*2*Math.PI*10)*(.6+.4*Math.sin(t*1.7))+.12*Math.sin(t*2*Math.PI*4.3+1)+.07*Math.sin(t*2*Math.PI*21)+(Math.random()-.5)*.05;
  const d=t-lastSpikeAt;
  if(mode==="ap"){if(d<.0018)return -.5+1.45*Math.sin(Math.min(1,d/.0009)*Math.PI/2);if(d<.006)return .95-1.6*((d-.0018)/.0042);if(d<.03)return -.65+.15*((d-.006)/.024);return -.5+(Math.random()-.5)*.02}
  return -.4+(d<.25?.55*(1-Math.exp(-d/.012))*Math.exp(-d/.07):0)+(Math.random()-.5)*.015}
function ecDraw(dt){if(!ew)return;const pxs=Math.max(150,ew/2.6);let adv=pxs*dt;const amp=eh*.34,base=eh*.58,slow=mode==="ap"?.18:1;
  ex.lineJoin="round";ex.lineCap="round";
  while(adv>0){const step=Math.min(adv,1.5);adv-=step;ecT+=step/pxs*slow;
    if((mode==="ap"||mode==="epsp")&&ecT>nextSpike){lastSpikeAt=ecT;nextSpike=ecT+(mode==="ap"?.045+Math.random()*.05:.28+Math.random()*.25);click(mode==="ap"?.55:.35);spikeT=1}
    const x0=ecX;ecX+=step;if(ecX>ew){ecX=0;ecLastY=null;continue}
    ex.clearRect(ecX,0,Math.min(28,ew-ecX)+1,eh);const y=base-sig(ecT)*amp;
    if(ecLastY!=null){ex.strokeStyle="#ff4d5a";ex.lineWidth=Math.max(1.6,eh/70);ex.shadowColor="rgba(255,77,90,.6)";ex.shadowBlur=6;ex.beginPath();ex.moveTo(x0,ecLastY);ex.lineTo(ecX,y);ex.stroke();ex.shadowBlur=0}ecLastY=y}}

/* ---------- състояния ---------- */
let phase="pre",ended=false,R=null,raf=0,diveT=-1;
const html=document.documentElement;html.style.overflow="hidden";
const setC=(c,on=true)=>ov.classList.toggle(c,on);
function enter(){if(phase==="zoom"||ended)return;phase="zoom";setC("ecg");setC("zoom");setMode("ap");
  const t0=performance.now(),D=RM?900:2600;(function tick(){const k=Math.min(1,(performance.now()-t0)/D);$(".load").style.setProperty("--lp",Math.round(k*100)+"%");if(k<1&&!ended)requestAnimationFrame(tick);else finish()})()}
function finish(){if(ended)return;ended=true;if(MG&&AC){MG.gain.setTargetAtTime(0,AC.currentTime,.25);setTimeout(()=>{try{AC.close()}catch(e){}},1500)}try{scrollTo(0,0)}catch(e){}setC("out");html.style.overflow="";
  setTimeout(()=>{cancelAnimationFrame(raf);if(R){R.dispose();R.forceContextLoss&&R.forceContextLoss()}ov.remove();st.remove()},800)}
function advance(){if(ended)return;if(phase==="hold"||phase==="intro"){if(diveT<0&&R){phase="dive";diveT=0;setC("hinted",false)}else enter()}else if(phase==="hold2")enter()}
$(".skip").onclick=finish;$(".hint").onclick=advance;
$(".snd").onclick=e=>{e.stopPropagation();if(!AC){sndMuted=false;audioInit().then(()=>setSound(true)).catch(()=>{});return}const on=!sndOn;sndMuted=!on;try{localStorage.setItem("pn_intro_sound",on?"on":"off")}catch(x){}audioInit().then(()=>setSound(on))};
ov.addEventListener("pointerdown",e=>{if(!e.target.closest(".snd,.skip"))enableFromGesture()});addEventListener("keydown",()=>{if(!ended)enableFromGesture()});
let ty=null,wheelLock=0;
addEventListener("wheel",e=>{if(e.deltaY>8&&performance.now()>wheelLock){wheelLock=performance.now()+900;advance()}},{passive:true});
addEventListener("touchstart",e=>{ty=e.touches[0].clientY},{passive:true});
addEventListener("touchmove",e=>{if(ty!=null&&ty-e.touches[0].clientY>30){ty=null;advance()}},{passive:true});
addEventListener("keydown",e=>{if(ended)return;if(["ArrowDown","PageDown"," ","Enter"].includes(e.key)&&!(e.target&&e.target.closest&&e.target.closest("button"))){e.preventDefault();advance()}if(e.key==="Escape")finish()});

function noGL(){if(ended||phase!=="pre")return;$(".pre").textContent="";phase="hold2";setC("ready");setC("ecg");setText("neuron");setMode("ap");$(".hint em").textContent="Scroll to enter";setC("hinted");
  let last=performance.now();(function f(n){if(ended)return;const dt=Math.min(.05,(n-last)/1000);last=n;ecDraw(dt);raf=requestAnimationFrame(f)})(last)}

const getMesh=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u);return r.text()}).then(decodeMesh).catch(()=>null);
if(RM){noGL()}else{
  load(THREE_URL).then(()=>Promise.all([getMesh("m/brain.txt"),getMesh("m/neuron.txt"),getMesh("m/doctor.txt")])).then(([b,n,d])=>{if(!ended&&phase==="pre")build(b,n,d)}).catch(e=>{console.error(e);noGL()});
}
setTimeout(()=>{if(phase==="pre")noGL()},20000);

/* компактен формат: брой върхове и триъгълници, рамка, позиции като uint16, индекси uint32 */
function decodeMesh(b64){const bin=atob(b64.trim()),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
  const dv=new DataView(u8.buffer),nv=dv.getUint32(0,true),nf=dv.getUint32(4,true),mn=[0,1,2].map(k=>dv.getFloat32(8+4*k,true)),sz=[0,1,2].map(k=>dv.getFloat32(20+4*k,true));
  let o=32;const q=new Uint16Array(u8.buffer,o,nv*3);o+=nv*6;o=(o+3)&~3;const idx=new Uint32Array(u8.buffer.slice(o,o+nf*12));
  const pos=new Float32Array(nv*3);for(let i=0;i<nv*3;i++)pos[i]=mn[i%3]+q[i]/65535*sz[i%3];
  const T=window.THREE;if(!T)return {pos,idx};const g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(pos,3));g.setIndex(new T.BufferAttribute(idx,1));
  const co=o+nf*12;if(u8.length>=co+nv*3){const c=new Float32Array(nv*3);for(let i=0;i<nv*3;i++){const v=u8[co+i]/255;c[i]=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}g.setAttribute("color",new T.BufferAttribute(c,3))}
  g.computeVertexNormals();return g}

/* ---------- текстури, рисувани в канвас ---------- */
const rnd=(a,b)=>a+Math.random()*(b-a);
function canvasTex(w,h,draw,rep,srgb=true){const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}t.anisotropy=8;if(srgb)t.encoding=THREE.sRGBEncoding;return t}
function noiseFill(g,w,h,base,amp){g.fillStyle=base;g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*amp;d[i]+=n;d[i+1]+=n;d[i+2]+=n}g.putImageData(id,0,0)}
/* ЕКГ лист: розова милиметрова мрежа, 12 отвеждания и ритъмна лента */
function ecgSheet(seed){return canvasTex(1024,724,(g,w,h)=>{g.fillStyle="#fffafa";g.fillRect(0,0,w,h);
  for(let x=0;x<w;x+=5){g.strokeStyle=x%25===0?"rgba(226,90,110,.55)":"rgba(240,150,165,.32)";g.lineWidth=x%25===0?1.1:.6;g.beginPath();g.moveTo(x+.5,40);g.lineTo(x+.5,h-14);g.stroke()}
  for(let y=40;y<h-14;y+=5){g.strokeStyle=(y-40)%25===0?"rgba(226,90,110,.55)":"rgba(240,150,165,.32)";g.lineWidth=(y-40)%25===0?1.1:.6;g.beginPath();g.moveTo(0,y+.5);g.lineTo(w,y+.5);g.stroke()}
  g.fillStyle="#2b2b2e";g.font="600 15px system-ui,sans-serif";g.fillText("Patient 0"+(seed+3)+"  ·  HR 7"+seed+" bpm  ·  PR 160 ms  ·  QRS 92 ms  ·  QTc 41"+seed+" ms",16,26);g.font="500 12px system-ui";g.fillText("25 mm/s   10 mm/mV",w-170,26);
  const leads=[["I","aVR","V1","V4"],["II","aVL","V2","V5"],["III","aVF","V3","V6"]],amps={I:.7,II:1,III:.5,aVR:-.8,aVL:.3,aVF:.7,V1:-.6,V2:-.2,V3:.5,V4:1.2,V5:1,V6:.8};
  const beat=(p,a)=>g1(p,.12,.022,.12*Math.sign(a)+.05)+g1(p,.205,.007,-.15)+g1(p,.23,.009,a)+g1(p,.255,.009,-.25*Math.abs(a))+g1(p,.5,.04,.3*Math.sign(a+.3));
  g.strokeStyle="#1d1d22";g.lineWidth=1.6;g.lineJoin="round";
  const row=(y,list,cw)=>list.forEach((L,ci)=>{const x0=ci*cw;g.fillStyle="#1d1d22";g.font="600 13px system-ui";g.fillText(L,x0+8,y-22);g.beginPath();for(let x=0;x<cw;x+=1.5){const t=x/125+seed*.17,p=(t%.8)/.8;const v=beat(p,amps[L]);g[x?"lineTo":"moveTo"](x0+x,y-v*42)}g.stroke()});
  [0,1,2].forEach(r=>row(140+r*150,leads[r],w/4));
  g.strokeStyle="#C8102E";g.beginPath();for(let x=0;x<w;x+=1.5){const t=x/125+seed*.11,p=(t%.8)/.8;g[x?"lineTo":"moveTo"](x,640-beat(p,1)*42)}g.stroke();g.fillStyle="#C8102E";g.fillText("II",8,612)})}

/* ===================================================================== */
function build(brainG,neuronG,docG){const T=THREE,V=(x,y,z)=>new T.Vector3(x,y,z);
  const cv=$("canvas.gl");
  R=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:"high-performance"});R.setPixelRatio(Math.min(MOBILE?1.5:1.75,devicePixelRatio||1));
  R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.0;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
  const cam=new T.PerspectiveCamera(36,1,.005,60);
  /* студийна среда за отражения */
  const envSc=new T.Scene();envSc.add(new T.Mesh(new T.SphereGeometry(20,24,16),new T.MeshBasicMaterial({color:0x2c2e33,side:T.BackSide})));
  const box=(w,h,p,c,i)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(i),side:T.DoubleSide}));m.position.set(...p);m.lookAt(0,0,0);envSc.add(m)};
  box(14,8,[0,12,6],0xffffff,2.2);box(6,14,[-14,2,-4],0xdfe8ff,1.3);box(6,10,[13,-2,-8],0xffe1e1,1.0);
  const pm=new T.PMREMGenerator(R),ENV=pm.fromScene(envSc,.04).texture;pm.dispose();
  /* полупрозрачен ръб на тъканите (Френел) */
  const rim=(m,c,i,pw=2.6)=>{const rc=new T.Color(c).convertSRGBToLinear();m.onBeforeCompile=sh=>{sh.uniforms.uRim={value:rc};sh.uniforms.uRimI=m.userData.rimI={value:i};sh.uniforms.uW=m.userData.uW={value:-99};sh.uniforms.uWc=m.userData.uWc={value:new T.Color(0xff4d6d).convertSRGBToLinear()};
      sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 vWp;").replace("#include <worldpos_vertex>","#include <worldpos_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;");
      sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nuniform vec3 uRim;uniform float uRimI;uniform float uW;uniform vec3 uWc;varying vec3 vWp;")
        .replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\n{float fr=pow(1.0-clamp(abs(dot(normal,normalize(vViewPosition))),0.0,1.0),"+pw.toFixed(2)+");totalEmissiveRadiance+=uRim*fr*uRimI;float d=vWp.x-uW;totalEmissiveRadiance+=uWc*(exp(-d*d*6.0)*2.2+exp(-max(0.0,-d)*1.2)*step(d,0.0)*0.18);}")};
    m.customProgramCacheKey=()=>"nrim"+pw;return m};

  /* ================= 1. кабинет ================= */
  const S1=new T.Scene();S1.background=new T.Color(0x16171a);S1.environment=ENV;S1.fog=new T.Fog(0x16171a,3.2,6.5);
  const floorT=canvasTex(512,512,(g,w,h)=>{noiseFill(g,w,h,"#2a2b2f",18);for(let i=0;i<w;i+=128){g.fillStyle="rgba(0,0,0,.25)";g.fillRect(i,0,2,h)}},[6,6]);
  const floor=new T.Mesh(new T.PlaneGeometry(12,12),new T.MeshStandardMaterial({map:floorT,roughness:.85,envMapIntensity:.2}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;S1.add(floor);
  /* бюро от орех */
  const wood=canvasTex(1024,512,(g,w,h)=>{g.fillStyle="#4a2e1d";g.fillRect(0,0,w,h);for(let i=0;i<260;i++){const y=rnd(0,h),a=rnd(.03,.12);g.strokeStyle=`rgba(${rnd(20,40)|0},${rnd(10,22)|0},${rnd(6,14)|0},${a})`;g.lineWidth=rnd(.6,3);g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=32)g.lineTo(x,y+Math.sin(x*.006+i)*rnd(2,8));g.stroke()}
    for(let i=0;i<120;i++){const y=rnd(0,h);g.strokeStyle=`rgba(150,95,60,${rnd(.03,.08)})`;g.lineWidth=rnd(.5,1.5);g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=32)g.lineTo(x,y+Math.sin(x*.005+i*2)*5);g.stroke()}});
  const deskM=new T.MeshPhysicalMaterial({map:wood,roughness:.42,clearcoat:.6,clearcoatRoughness:.25,envMapIntensity:.6});
  const DY=.75;const desk=new T.Mesh(new T.BoxGeometry(1.7,.04,.9),deskM);desk.position.set(0,DY-.02,0);desk.castShadow=desk.receiveShadow=true;S1.add(desk);
  [[-.8,-.4],[.8,-.4],[-.8,.4],[.8,.4]].forEach(([x,z])=>{const l=new T.Mesh(new T.BoxGeometry(.05,DY-.04,.05),new T.MeshStandardMaterial({color:0x1d1e21,roughness:.5,metalness:.6}));l.position.set(x,(DY-.04)/2,z);l.castShadow=true;S1.add(l)});
  /* ЕКГ листове */
  const paper=(seed,x,z,ry,lift=0)=>{const gm=new T.PlaneGeometry(.297,.21,24,16);const P=gm.attributes.position;for(let i=0;i<P.count;i++){const px=P.getX(i),py=P.getY(i);P.setZ(i,lift*(Math.cos(px*7)*.5+.5)*.012+.002*Math.sin(py*30+seed))}gm.computeVertexNormals();
    const m=new T.Mesh(gm,new T.MeshStandardMaterial({map:ecgSheet(seed),roughness:.92,envMapIntensity:.25,side:T.DoubleSide}));m.rotation.set(-Math.PI/2,0,ry);m.position.set(x,DY+.002+seed*.0007,z);m.receiveShadow=true;m.castShadow=true;S1.add(m);return m};
  paper(1,-.42,-.12,.35);paper(2,-.18,-.25,-.12);paper(3,.36,-.2,.22);paper(4,.52,.08,-.4);paper(5,-.55,.16,.6);
  const held=paper(6,0,.13,.04,1);held.position.y=DY+.06;held.rotation.x=-Math.PI/2+.38;
  /* химикалка, чаша кафе, стетоскоп, лампа, телефон */
  const pen=new T.Group();{const b=new T.Mesh(new T.CylinderGeometry(.0045,.0045,.14,16),new T.MeshPhysicalMaterial({color:0x1d1d22,roughness:.25,clearcoat:1}));pen.add(b);const tip=new T.Mesh(new T.ConeGeometry(.0045,.012,16),new T.MeshStandardMaterial({color:0xc0c4ca,metalness:1,roughness:.25}));tip.position.y=-.076;tip.rotation.x=Math.PI;pen.add(tip);
    const clip=new T.Mesh(new T.BoxGeometry(.002,.04,.003),tip.material);clip.position.set(.005,.045,0);pen.add(clip)}
  pen.rotation.set(Math.PI/2,0,.9);pen.position.set(.22,DY+.005,.02);pen.traverse(o=>{if(o.isMesh)o.castShadow=true});S1.add(pen);
  const mug=new T.Group();{const pr=[[0,0],[.038,0],[.04,.004],[.042,.09],[.044,.095],[.039,.095],[.037,.01],[0,.01]].map(p=>new T.Vector2(p[0],p[1]));const cm=new T.MeshPhysicalMaterial({color:0xeeeeea,roughness:.3,clearcoat:.8});mug.add(new T.Mesh(new T.LatheGeometry(pr,48),cm));
    const cof=new T.Mesh(new T.CircleGeometry(.037,40),new T.MeshPhysicalMaterial({color:0x2a160c,roughness:.08,clearcoat:1}));cof.rotation.x=-Math.PI/2;cof.position.y=.075;mug.add(cof);
    const h=new T.Mesh(new T.TorusGeometry(.022,.006,12,24,Math.PI),cm);h.position.set(.043,.05,0);h.rotation.z=-Math.PI/2;mug.add(h)}
  mug.position.set(.62,DY,-.28);mug.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});S1.add(mug);
  const steth=new T.Group();{const tm=new T.MeshPhysicalMaterial({color:0x1d1f24,roughness:.35,clearcoat:.7});const pts=[V(-.62,0,-.32),V(-.5,0,-.36),V(-.38,0,-.3),V(-.36,0,-.2),V(-.45,0,-.12),V(-.6,0,-.14),V(-.7,0,-.22),V(-.72,0,-.33),V(-.64,0,-.4)];
    steth.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),120,.0055,10,false),tm));const chest=new T.Mesh(new T.CylinderGeometry(.022,.022,.012,32),new T.MeshStandardMaterial({color:0xd0d4da,metalness:1,roughness:.2}));chest.position.copy(pts[0]).y+=.006;steth.add(chest);
    const d=new T.Mesh(new T.CircleGeometry(.018,32),new T.MeshStandardMaterial({color:0x2a2a2e,roughness:.4}));d.rotation.x=-Math.PI/2;d.position.copy(chest.position).y+=.0065;steth.add(d)}
  steth.position.y=DY+.006;steth.traverse(o=>{if(o.isMesh)o.castShadow=true});S1.add(steth);
  const phone=new T.Mesh(new T.BoxGeometry(.075,.008,.155),[0,1,2,3,4,5].map(k=>k===2?new T.MeshPhysicalMaterial({color:0x08090b,roughness:.05,clearcoat:1,envMapIntensity:1.2}):new T.MeshStandardMaterial({color:0x2b2d31,metalness:.8,roughness:.3})));phone.position.set(.72,DY+.004,.2);phone.rotation.y=.3;phone.castShadow=true;S1.add(phone);
  const lamp=new T.Group();{const lm=new T.MeshStandardMaterial({color:0x1b1c1f,metalness:.7,roughness:.35});const base=new T.Mesh(new T.CylinderGeometry(.07,.08,.02,32),lm);lamp.add(base);
    const arm=new T.Mesh(new T.CylinderGeometry(.008,.008,.42,12),lm);arm.position.set(.05,.2,0);arm.rotation.z=-.25;lamp.add(arm);const head=new T.Mesh(new T.ConeGeometry(.07,.12,32,1,true),lm);head.position.set(.16,.39,.04);head.rotation.z=1.0;head.material.side=T.DoubleSide;lamp.add(head)}
  lamp.position.set(-.72,DY,-.36);lamp.traverse(o=>{if(o.isMesh)o.castShadow=true});S1.add(lamp);

  /* ---- лекарят: седнал, наведен над листа; построен от гладки форми ---- */
  const coatT=canvasTex(256,256,(g,w,h)=>{noiseFill(g,w,h,"#eef0f2",14);g.globalAlpha=.07;for(let i=0;i<w;i+=3){g.fillStyle=i%6?"#000":"#fff";g.fillRect(i,0,1,h)}},[4,4]);
  const coatB=canvasTex(256,256,(g,w,h)=>noiseFill(g,w,h,"#808080",60),[6,6],false);
  const coatM=new T.MeshStandardMaterial({map:coatT,bumpMap:coatB,bumpScale:.0012,roughness:.86,envMapIntensity:.35});
  const skinM=rim(new T.MeshPhysicalMaterial({color:0xc58b6e,roughness:.55,clearcoat:.15,envMapIntensity:.35,transparent:true}),0xffc8b0,.25);
  const hairT=canvasTex(512,512,(g,w,h)=>{g.fillStyle="#1f160f";g.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const x=rnd(0,w),y=rnd(0,h),l=rnd(18,60),a=rnd(-.35,.35)+Math.PI/2;g.strokeStyle=`rgba(${rnd(60,110)|0},${rnd(42,75)|0},${rnd(25,45)|0},${rnd(.15,.5)})`;g.lineWidth=rnd(.5,1.4);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*l*.5+rnd(-6,6),y+Math.sin(a)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke()}},[2,1]);
  const hairM=new T.MeshStandardMaterial({map:hairT,roughness:.55,envMapIntensity:.5,transparent:true});
  const doc=new T.Group();S1.add(doc);
  const ell=(r,sx,sy,sz,m,seg=48)=>{const me=new T.Mesh(new T.SphereGeometry(r,seg,Math.round(seg*.7)),m);me.scale.set(sx,sy,sz);me.castShadow=true;me.receiveShadow=true;return me};
  /* стол */
  const chairM=new T.MeshStandardMaterial({color:0x22242a,roughness:.75,envMapIntensity:.25});
  const back=new T.Mesh(new T.CylinderGeometry(.25,.25,.42,48,1,true,-1.0,2.0),chairM);back.material.side=T.DoubleSide;back.scale.set(1,1,.4);back.position.set(0,.86,.98);back.rotation.set(.12,0,0);back.castShadow=true;doc.add(back);
  const seat=new T.Mesh(new T.BoxGeometry(.5,.07,.48),chairM);seat.position.set(0,.47,.78);seat.castShadow=true;seat.receiveShadow=true;doc.add(seat);
  const cpost=new T.Mesh(new T.CylinderGeometry(.025,.025,.42,16),new T.MeshStandardMaterial({color:0x2a2c31,metalness:.8,roughness:.3}));cpost.position.set(0,.22,.8);doc.add(cpost);
  let headG,docMats=[];
  if(docG&&docG.isBufferGeometry){/* базов човек на MakeHuman (CC0), поставен седнал и оцветен по области — design/tools/posehuman.py */
    const dm=rim(new T.MeshPhysicalMaterial({vertexColors:true,roughness:.72,clearcoat:.12,clearcoatRoughness:.6,envMapIntensity:.35,transparent:true}),0xffffff,.18,3);docMats.push(dm);
    const body=new T.Mesh(docG,dm);body.castShadow=true;body.receiveShadow=true;body.rotation.y=Math.PI;body.position.set(0,.451,.75);doc.add(body);
    headG=new T.Group();headG.position.set(0,1.099,.395);headG.rotation.x=-.95;doc.add(headG)}
  else{
  /* тяло в бяла престилка, наведено напред */
  const torso=new T.Group();torso.position.set(0,.56,.68);torso.rotation.x=-.42;doc.add(torso);
  const chest=ell(.2,1,1.55,.62,coatM);chest.position.set(0,.3,0);torso.add(chest);
  const belly=ell(.19,1,1,.7,coatM);belly.position.set(0,.06,.01);torso.add(belly);
  [-1,1].forEach(s=>{const sh=ell(.085,1.05,.85,1,coatM);sh.position.set(s*.19,.53,-.01);torso.add(sh)});
  const collar=new T.Mesh(new T.TorusGeometry(.07,.022,12,32),coatM);collar.position.set(0,.6,-.02);collar.rotation.x=Math.PI/2-.2;torso.add(collar);
  const neck=new T.Mesh(new T.CylinderGeometry(.048,.055,.12,24),skinM);neck.position.set(0,.66,-.03);torso.add(neck);
  /* глава, наведена към листа */
  headG=new T.Group();headG.position.set(0,.78,-.08);headG.rotation.x=-.5;torso.add(headG);
  docMats.push(skinM,hairM);const skull=ell(.1,.86,1.02,1.08,skinM,64);headG.add(skull);
  const hair=new T.Mesh(new T.SphereGeometry(.104,64,40,0,Math.PI*2,0,Math.PI*.58),hairM);hair.scale.set(.88,1.04,1.11);hair.rotation.x=.35;hair.position.set(0,.004,.01);hair.castShadow=true;headG.add(hair);
  const hair2=ell(.104,.9,.82,1.1,hairM,48);hair2.position.set(0,-.012,.035);headG.add(hair2);
  [-1,1].forEach(s=>{const e=ell(.024,.45,1,.75,skinM,24);e.position.set(s*.086,-.01,.0);headG.add(e)});
  const nose=ell(.016,.8,1,1.3,skinM,24);nose.position.set(0,-.03,-.105);headG.add(nose);
  /* ръце: ръкави на престилката, китки и пръсти, държащи листа */
  const arm=(s)=>{const sh=V(s*.2,.53,-.01).applyEuler(torso.rotation).add(torso.position);const el=V(s*.27,DY+.06,.36),wr=V(s*.12,DY+.04,.16);
    const up=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([sh,sh.clone().lerp(el,.5).add(V(s*.02,0,0)),el]),24,.058,20,false),coatM);up.castShadow=true;doc.add(up);
    const fo=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([el,el.clone().lerp(wr,.5).add(V(0,.012,0)),wr]),24,.048,20,false),coatM);fo.castShadow=true;doc.add(fo);
    [el].forEach(p=>{const j=ell(.058,1,1,1,coatM,24);j.position.copy(p);doc.add(j)});
    const cuff=new T.Mesh(new T.TorusGeometry(.044,.008,10,24),coatM);cuff.position.copy(wr);cuff.lookAt(el);doc.add(cuff);
    const hand=new T.Group();hand.position.copy(wr).add(V(-s*.025,.008,-.05));hand.rotation.y=s*.5;doc.add(hand);
    const palm=ell(.042,.95,.42,1.15,skinM,32);hand.add(palm);
    for(let f=0;f<4;f++){const fx=(f-1.5)*.017,fl=[.05,.056,.053,.045][f];const fg=new T.Mesh(new T.CylinderGeometry(.0075,.007,fl,12),skinM);fg.rotation.x=Math.PI/2-.25;fg.position.set(fx,.004,-.045-fl/2);fg.castShadow=true;hand.add(fg)}
    const th=new T.Mesh(new T.CylinderGeometry(.009,.008,.045,12),skinM);th.position.set(-s*.032,.012,-.02);th.rotation.set(Math.PI/2,0,s*.8);hand.add(th)};
  arm(-1);arm(1);
  }
  /* мозъкът вътре в главата (появява се, когато главата стане прозрачна) */
  let brain=null,brainM=null;
  if(brainG&&brainG.isBufferGeometry){brainG.computeBoundingBox();const bb=brainG.boundingBox,c=bb.getCenter(V(0,0,0)),sz=bb.getSize(V(0,0,0)),L=Math.max(sz.x,sz.y,sz.z);brainG.translate(-c.x,-c.y,-c.z);brainG.scale(.165/L,.165/L,.165/L);
    brainM=rim(new T.MeshPhysicalMaterial({color:0xe6b3aa,roughness:.5,clearcoat:.5,clearcoatRoughness:.3,envMapIntensity:.5,sheen:new T.Color(0x553333),transparent:true,opacity:0}),0xffd7cf,.45);
    brain=new T.Mesh(brainG,brainM);brainM.opacity=1;brainM.transparent=false;brain.scale.setScalar(30)}

  /* светлини: топла настолна лампа и студена светлина от прозорец */
  const key=new T.SpotLight(0xffe2c0,3.2,6,.65,.55,1.4);key.position.set(-.6,1.65,-.4);key.target.position.set(.05,DY,.05);key.castShadow=true;key.shadow.mapSize.set(MOBILE?1024:2048,MOBILE?1024:2048);key.shadow.bias=-.0002;key.shadow.radius=4;S1.add(key,key.target);
  const win=new T.DirectionalLight(0xcfe0ff,.9);win.position.set(2.5,3.2,1.2);win.castShadow=true;win.shadow.mapSize.set(1024,1024);win.shadow.camera.left=-1.2;win.shadow.camera.right=1.2;win.shadow.camera.top=1.2;win.shadow.camera.bottom=-1.2;win.shadow.bias=-.0003;win.shadow.radius=6;S1.add(win);
  S1.add(new T.HemisphereLight(0xffffff,0x1a1b1e,.35));

  /* ================= мозък (отделна тъмна сцена) ================= */
  const SB=new T.Scene();SB.background=new T.Color(0x09090c);SB.environment=ENV;SB.fog=new T.Fog(0x09090c,8,16);
  SB.add(new T.HemisphereLight(0xfff2f0,0x121216,.45));{const k=new T.DirectionalLight(0xfff4ee,1.3);k.position.set(3,6,5);SB.add(k);const b=new T.DirectionalLight(0xff9aa8,1.1);b.position.set(-4,1,-6);SB.add(b)}
  const brainPivot=new T.Group();SB.add(brainPivot);if(brain)brainPivot.add(brain);
  /* ================= 2. неврони ================= */
  const S2=new T.Scene();S2.background=new T.Color(0x0b0b0e);S2.fog=new T.FogExp2(0x0b0b0e,.055);S2.environment=ENV;
  S2.add(new T.HemisphereLight(0xffeeee,0x101014,.5));{const k=new T.DirectionalLight(0xfff0ea,1.2);k.position.set(4,6,5);S2.add(k);const b=new T.DirectionalLight(0xffb0b8,.9);b.position.set(-5,-2,-8);S2.add(b)}
  const neuM=rim(new T.MeshPhysicalMaterial({color:0xd99a8e,roughness:.55,clearcoat:.35,envMapIntensity:.35,emissive:0x000000}),0xffd0c8,.5);
  const neurons=[];
  if(neuronG&&neuronG.isBufferGeometry){neuronG.computeBoundingBox();const bb=neuronG.boundingBox,c=bb.getCenter(V(0,0,0)),sz=bb.getSize(V(0,0,0)),L=Math.max(sz.x,sz.y,sz.z);neuronG.translate(-c.x,-c.y,-c.z);neuronG.scale(9/L,9/L,9/L);
    [[0,0,0,0,0,0,1],[-7,3,-8,.6,1.2,.3,.9],[8,-2,-10,-.4,2.4,.8,1],[-3,-5,-14,1.2,.4,-.5,1.1],[10,5,-18,.3,-1,1.4,1.2],[-12,-1,-20,-.8,2,.2,1.3],[3,7,-24,.5,.9,-1,1.4]].forEach(([x,y,z,a,b,c2,s])=>{const m=new T.Mesh(neuronG,neuM);m.position.set(x,y,z);m.rotation.set(a,b,c2);m.scale.setScalar(s);S2.add(m);neurons.push(m)})}
  else{/* резервен вариант без файла: прости разклонени неврони */
    const mk=(x,y,z)=>{const g=new T.Group();g.position.set(x,y,z);g.add(new T.Mesh(new T.SphereGeometry(.6,32,24),neuM));for(let k=0;k<7;k++){const d=V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize();const pts=[V(0,0,0)];let p=V(0,0,0);for(let j=0;j<6;j++){d.add(V(rnd(-.4,.4),rnd(-.4,.4),rnd(-.4,.4))).normalize();p=p.clone().addScaledVector(d,.7);pts.push(p)}g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),40,.08,8,false),neuM))}S2.add(g);neurons.push(g)};
    mk(0,0,0);mk(-6,3,-8);mk(7,-2,-10);mk(-3,-5,-14)}
  /* искри: точки, които светват по невроните */
  const spN=160,spG=new T.BufferGeometry(),spP=new Float32Array(spN*3),spA=new Float32Array(spN);for(let i=0;i<spN;i++){spP[i*3]=rnd(-14,14);spP[i*3+1]=rnd(-8,8);spP[i*3+2]=rnd(-26,3);spA[i]=Math.random()}spG.setAttribute("position",new T.BufferAttribute(spP,3));
  const dotT=canvasTex(64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,"rgba(255,255,255,1)");r.addColorStop(.25,"rgba(255,120,140,.9)");r.addColorStop(1,"rgba(255,60,90,0)");g.fillStyle=r;g.fillRect(0,0,w,h)});
  const spM=new T.PointsMaterial({size:.35,map:dotT,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.0});const sparks=new T.Points(spG,spM);S2.add(sparks);

  /* ================= 3. синапс ================= */
  const S3=new T.Scene();S3.background=new T.Color(0x0c0b0e);S3.fog=new T.Fog(0x0c0b0e,6,16);S3.environment=ENV;
  S3.add(new T.HemisphereLight(0xfff0f0,0x101014,.55));{const k=new T.DirectionalLight(0xffffff,1.1);k.position.set(3,6,6);S3.add(k);const b=new T.DirectionalLight(0xff9aa8,.8);b.position.set(-4,-3,-6);S3.add(b)}
  const preM=rim(new T.MeshPhysicalMaterial({color:0xd6a093,roughness:.5,clearcoat:.4,transparent:true,opacity:.55,depthWrite:false,side:T.DoubleSide,envMapIntensity:.4}),0xffd6cc,.7,2.2);
  const preP=new T.SplineCurve([[0,3.7],[1.1,3.55],[2.05,3.1],[2.65,2.35],[2.92,1.5],[2.9,.8],[2.6,.42],[1.9,.3],[.9,.28],[0,.28]].map(p=>new T.Vector2(p[0],p[1]))).getPoints(80);
  const pre=new T.Mesh(new T.LatheGeometry(preP,128),preM);S3.add(pre);
  const ax=new T.Mesh(new T.CylinderGeometry(.75,1.1,4,48,1,true),preM);ax.position.y=5.4;S3.add(ax);
  const postM=rim(new T.MeshPhysicalMaterial({color:0xd59a8e,roughness:.55,clearcoat:.3,envMapIntensity:.35,side:T.DoubleSide}),0xffd0c8,.45);
  const postG=new T.PlaneGeometry(9,6,90,60);{const P=postG.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i);P.setZ(i,-.06*(x*x+y*y)+.04*Math.sin(x*2+y))}postG.computeVertexNormals()}
  const post=new T.Mesh(postG,postM);post.rotation.x=-Math.PI/2;post.position.y=-.2;S3.add(post);
  /* везикули с медиатор */
  const vesM=rim(new T.MeshPhysicalMaterial({color:0xf2c4cf,roughness:.25,clearcoat:1,transparent:true,opacity:.85,envMapIntensity:.8,emissive:0x3a0c18}),0xffffff,.5);
  const VN=90,vesI=new T.InstancedMesh(new T.SphereGeometry(.13,24,16),vesM,VN),ves=[];
  for(let i=0;i<VN;i++){let b;if(i<14){const a=i/14*6.28+rnd(-.2,.2),r=rnd(.4,1.6);b=V(Math.cos(a)*r,.48+rnd(0,.08),Math.sin(a)*r)}else{const a=rnd(0,6.28),r=Math.sqrt(Math.random())*2.2;b=V(Math.cos(a)*r,Math.max(.7,rnd(.8,3.0)*(1-r*r/10)),Math.sin(a)*r)}ves.push({b,ph:rnd(0,6.28),fuse:i<10?i*.3+.25:-1})}S3.add(vesI);
  /* митохондрия в бутона */
  {const mit=new T.Mesh(new T.SphereGeometry(.45,32,20),rim(new T.MeshPhysicalMaterial({color:0xb5656a,roughness:.5,clearcoat:.4}),0xffc0c0,.4));mit.scale.set(2.2,.8,.9);mit.position.set(-.6,2.5,-.6);mit.rotation.y=.6;S3.add(mit)}
  /* Ca²⁺ канали в активната зона и рецептори отсреща */
  const recM=new T.MeshPhysicalMaterial({color:0x8a7c9e,roughness:.35,clearcoat:.7,emissive:0x0,envMapIntensity:.5});
  const recs=[];for(let i=0;i<22;i++){const a=rnd(0,6.28),r=Math.sqrt(Math.random())*2.1;const m=new T.Mesh(new T.CylinderGeometry(.08,.1,.24,20),recM.clone());m.position.set(Math.cos(a)*r,-.2-.06*r*r+.14,Math.sin(a)*r);S3.add(m);recs.push(m)}
  const caM=new T.MeshPhysicalMaterial({color:0x6c7a99,roughness:.4,clearcoat:.5});for(let i=0;i<10;i++){const a=i/10*6.28,m=new T.Mesh(new T.CylinderGeometry(.08,.08,.22,12),caM);m.position.set(Math.cos(a)*1.4,.33,Math.sin(a)*1.4);S3.add(m)}
  /* молекули медиатор в цепнатината */
  const NT=520,ntG=new T.BufferGeometry(),ntP=new Float32Array(NT*3);ntG.setAttribute("position",new T.BufferAttribute(ntP,3));
  const ntM=new T.PointsMaterial({size:.2,map:dotT,transparent:true,depthWrite:false,blending:T.AdditiveBlending,color:0xffd0dc});const nt=new T.Points(ntG,ntM);S3.add(nt);
  const ntD=[];for(let i=0;i<NT;i++)ntD.push({o:V(0,0,0),v:V(rnd(-1,1),-rnd(.6,1.4),rnd(-1,1)),t0:1e9});

  /* ---------- размер ---------- */
  function size(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.aspect<.8?60:36;cam.updateProjectionMatrix()}
  size();addEventListener("resize",size);

  /* ---------- камера и времева линия ---------- */
  const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,cl=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,sm=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t)};
  const fadeEl=$(".fade");
  doc.updateMatrixWorld(true);const headW=()=>headG.getWorldPosition(V(0,0,0));
  const A={p:V(.55,2.9,1.55),l:V(0,DY,.12)},B={p:V(.32,1.95,1.05),l:V(0,DY+.08,.2)};
  let tt=0,last=performance.now(),cur=1;
  const DUR=4.6;
  R.compile(S1,cam);setC("ready");phase="intro";
  setTimeout(()=>{if(!ended&&phase!=="zoom")setC("ecg")},1800);
  setTimeout(()=>{if(!ended&&phase==="intro")setText("office")},2400);
  setTimeout(()=>{if(!ended&&phase==="intro"){setC("hinted");phase="hold"}},4200);
  /* етапи на гмуркането (секунди) */
  const D={head:2.4,brain:brain?2.6:.3,x1:.55,neu:3.2,x2:.55,syn:3.8};
  const t1=D.head,t2=t1+D.brain,t3=t2+D.x1,t4=t3+D.neu,t5=t4+D.x2,t6=t5+D.syn;
  let fused=0;
  function frame(n){if(ended)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,(n-last)/1000);last=n;tt+=dt;
    if(spikeT>0)spikeT=Math.max(0,spikeT-dt*4);
    /* дишане и леко движение на главата */
    const br=Math.sin(tt*1.35);doc.scale.set(1+.004*br,1+.003*br,1+.004*br);held.rotation.z=.04+.015*Math.sin(tt*.5);
    let fade=0;
    if(diveT<0){/* кабинетът отгоре */
      const u=ease(cl(tt/DUR,0,1));cam.position.copy(A.p).lerp(B.p,u);const lk=A.l.clone().lerp(B.l,u);const k=u>=1?1:0;cam.position.x+=Math.sin(tt*.3)*.02*k;cam.lookAt(lk);cur=1}
    else{diveT+=dt;const d=diveT;
      if(d<t2){/* към главата, кратко затъмняване и мозъкът */
        const hp=headW(),SW=D.head-.45;
        if(d<SW||!brain){cur=1;const u=ease(cl(d/SW,0,1));const to=hp.clone().add(V(.05,.3,.26));cam.position.copy(B.p).lerp(to,u);cam.lookAt(B.l.clone().lerp(hp,u));setText("office");setMode("ecg")}
        else{cur=4;const v=cl((d-SW)/(t2-SW),0,1);cam.position.set(Math.sin(v*1.1-.5)*6.5,1.6-.6*v,Math.cos(v*1.1-.5)*6.5);cam.lookAt(0,0,0);brainPivot.rotation.y=.2*v;
          if(brainM.userData.uW)brainM.userData.uW.value=-3+((d-SW)*2.4%1)*6;setText("brain");setMode("eeg")}
        if(brain)fade=Math.max(fade,sm(SW-.3,SW,d)*(1-sm(SW,SW+.35,d)))}
      else if(d<t4){cur=2;const v=cl((d-t3)/D.neu,0,1);/* полет между невроните, акционни потенциали тичат по тях */
        cam.position.set(lerp(-1.5,1.2,v),lerp(.8,-.3,v),lerp(16,5.5,ease(v)));cam.lookAt(lerp(-.5,.3,v),0,-6);
        neurons.forEach((m,i)=>{m.rotation.y+=dt*.04*(i%2?1:-1)});const w=-14+((d-t2)*9)%30;neuM.userData.uW&&(neuM.userData.uW.value=w);
        spM.opacity=.9;const P=spG.attributes.position;for(let i=0;i<spN;i++){spA[i]+=dt*rnd(.2,1.2);if(spA[i]>1){spA[i]=0;P.setXYZ(i,rnd(-14,14),rnd(-8,8),rnd(-26,3))}}spM.size=.25+.25*spikeT;P.needsUpdate=true;
        setText("neuron");setMode("ap")}
      else{cur=3;const v=cl((d-t5)/D.syn,0,1);/* синапсът: Ca²⁺ влиза, везикулите се сливат, медиаторът пресича цепнатината */
        cam.position.set(lerp(7.2,5.0,ease(v)),lerp(2.4,1.0,ease(v)),lerp(8.2,6.2,ease(v)));cam.lookAt(0,.9,0);
        setText("syn");setMode("epsp")}
      if(d>t6&&phase==="dive"){phase="hold2";$(".hint em").textContent="Scroll to enter";setC("hinted")}
      /* затъмняване между сцените */
      fade=Math.max(fade,sm(t2-.05,t2+.25,d)*(1-sm(t3-.2,t3+.05,d)),sm(t4-.05,t4+.25,d)*(1-sm(t5-.2,t5+.05,d)))}
    fadeEl.style.opacity=fade.toFixed(3);
    /* синапс: везикули, сливане и медиатор */
    if(cur===3){const M=new T.Matrix4(),q=new T.Quaternion(),s=V(1,1,1),ds=diveT-t5;
      ves.forEach((o,i)=>{let p=o.b.clone().add(V(.05*Math.sin(tt*1.3+o.ph),.05*Math.cos(tt*1.1+o.ph),.05*Math.sin(tt*.9+o.ph)));let sc=1;
        if(o.fuse>=0){const f=ds-o.fuse;if(f>0){const k=cl(f/.45,0,1);p=V(o.b.x*.75,lerp(o.b.y,.42,k),o.b.z*.75);if(f>.45){sc=Math.max(0,1-(f-.45)/.2);if(!o.fired){o.fired=true;let c=0;for(const n of ntD){if(n.t0>1e8&&c<55){n.t0=tt;n.o.copy(p).setY(.3);n.v.set(rnd(-.9,.9),-rnd(.5,1.1),rnd(-.9,.9));c++}}click(.4);spikeT=1}}}}
        M.compose(p,q,s.set(sc,sc,sc));vesI.setMatrixAt(i,M)});vesI.instanceMatrix.needsUpdate=true;
      const P=ntG.attributes.position;for(let i=0;i<NT;i++){const n=ntD[i];if(n.t0>1e8){P.setXYZ(i,0,-50,0);continue}const a=tt-n.t0;let x=n.o.x+n.v.x*a*.7,y=Math.max(-.15,n.o.y+n.v.y*a*.7),z=n.o.z+n.v.z*a*.7;if(a>3.2){n.t0=1e9}P.setXYZ(i,x,y,z)}P.needsUpdate=true;
      recs.forEach((r,i)=>{let hit=0;for(let k=i*20;k<i*20+20&&k<NT;k++){const n=ntD[k];if(n.t0<1e8&&tt-n.t0>.5)hit=1}r.material.emissive.setRGB(hit*.9,hit*.18,hit*.3)})}
    R.render(cur===1?S1:cur===2?S2:cur===4?SB:S3,cam);ecDraw(dt)}
  raf=requestAnimationFrame(frame);
  window.__nxSeek=d=>{if(diveT<0){phase="dive";setC("hinted",false)}diveT=d};
}
})();
