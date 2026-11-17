/* ===== Въведение „Нервна система“ =====
   1) поглед отгоре: лекар на бюро разглежда ЕКГ ленти;
   2) при скрол камерата влиза в главата: за кратко се вижда мозъкът, после невронна мрежа, в която сигналът минава от неврон на неврон;
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
#hxo .hint{position:absolute;left:50%;bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 40px);transition:opacity .8s,bottom .8s;transform:translateX(-50%);opacity:0;transition:opacity .8s;
  font:600 12px/1 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#e9ece8;border:0;background:none;cursor:pointer;padding:12px 16px;min-height:44px;pointer-events:none}
#hxo .hint span{display:inline-block;animation:hxb 1.6s ease-in-out infinite}
@keyframes hxb{50%{transform:translateY(5px)}}
#hxo.hinted .hint{opacity:.9;pointer-events:auto}
#hxo.ecg .hint{bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 124px)}
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
  #hxo .hint{bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 34px)}
  #hxo.zoom .mon{bottom:calc(50% - 15vh);height:30vh}

  #hxo .cr{top:auto;bottom:6px;left:20px;font-size:9px}
  #hxo .snd .t{display:none}
  #hxo .brandx{top:calc(50% - 15vh - 10px)}#hxo .load{top:calc(50% + 15vh + 22px)}#hxo.ecg .hint{bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 100px)}
}
@media (prefers-reduced-motion:reduce){#hxo .hint span{animation:none}}
`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
ov.innerHTML=`<canvas class="gl" aria-hidden="true"></canvas><div class="vig"></div><div class="fade"></div>
 <div class="pre">Preparing the consulting room…</div>
 <div class="side l"></div><div class="side r"></div>
 <div class="mon"><canvas aria-hidden="true"></canvas><span class="lab">Vm · axon · mV</span></div>
 <div class="brandx"><b>Physio<i>Nova</i></b><span>Physiology simulator</span></div>
 <div class="load">Opening the home page<i></i></div>
 <button class="hint" type="button"><em>Scroll to look inside</em> <span>↓</span></button>
 <button class="snd" type="button" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path class="w1" d="M16 9a4 4 0 0 1 0 6"/><path class="w2" d="M18.5 6.5a8 8 0 0 1 0 11"/></svg><span class="t">Tap to hear the neurons</span></button>
 <button class="skip" type="button">Skip</button>
 <div class="cr">Models: doctor — <a href="http://www.makehumancommunity.org/" target="_blank" rel="noopener">MakeHuman</a> base mesh, CC0<span class="crb"> · brain — <a href="https://commons.wikimedia.org/wiki/File:Brain_AS.stl" target="_blank" rel="noopener">Agnieszka Starostecka</a>, CC BY 4.0</span></div>`;
const $=s=>ov.querySelector(s);

/* ---------- текст за всеки етап ---------- */
const TXT={
 office:[["Nervous system","Reading the heart takes a brain","An ECG on the desk — and 86 billion neurons interpreting it."],["For medical students","From signal to synapse","Theory, live simulations and 3D models for every topic."]],
 brain:[["The brain","1.4 kg, 20 % of your energy","Most of it spent keeping ion gradients ready for the next signal."],["Cortex","16 billion cortical neurons","Each one listening to thousands of others."]],
 neuron:[["Electrical signal","An action potential","Na⁺ rushes in, K⁺ flows out — up to 120 m/s along myelinated axons."],["All or none","−70 → +30 mV in 1 ms","The same spike, every time. Strength is coded by frequency."]],
 net:[["Neural network","Neurons talk in chains","Each spike reaches the next cell through a synapse in about 0.5 ms."],["Divergence & convergence","1 neuron · 7,000 synapses","One cell informs thousands; thousands decide whether it fires."]]};
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
const ec=$(".mon canvas"),ex=ec.getContext("2d");let ew=0,eh=0,ed=1,ecX=0,ecLastY=null,ecT=0,mode="ap",spikeT=0;
function ecSize(){const r=ec.getBoundingClientRect();ed=Math.min(2,devicePixelRatio||1);ew=Math.max(1,r.width);eh=Math.max(1,r.height);ec.width=ew*ed;ec.height=eh*ed;ex.setTransform(ed,0,0,ed,0,0);ex.clearRect(0,0,ew,eh);ecX=0;ecLastY=null}
new ResizeObserver(ecSize).observe(ec);
const LAB={ecg:"ECG · II · 25 mm/s",eeg:"EEG · Fp1–F3 · alpha",ap:"Vm · axon · mV",epsp:"EPSP · dendrite · mV"};
function setMode(m){m="ap";if(mode===m)return;mode=m;$(".mon .lab").textContent=LAB[m]}
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
  load(THREE_URL).then(()=>Promise.all([getMesh("m/brain.txt"),Promise.resolve(null),getMesh("m/doctor.txt")])).then(([b,n,d])=>{if(!ended&&phase==="pre")build(b,n,d)}).catch(e=>{console.error(e);noGL()});
}
setTimeout(()=>{if(phase==="pre")noGL()},20000);

/* компактен формат: брой върхове и триъгълници, рамка, позиции като uint16, индекси uint32 */
function decodeMesh(b64){const bin=atob(b64.trim()),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
  const dv=new DataView(u8.buffer),nv=dv.getUint32(0,true),nf=dv.getUint32(4,true),mn=[0,1,2].map(k=>dv.getFloat32(8+4*k,true)),sz=[0,1,2].map(k=>dv.getFloat32(20+4*k,true));
  let o=32;const q=new Uint16Array(u8.buffer,o,nv*3);o+=nv*6;o=(o+3)&~3;const idx=new Uint32Array(u8.buffer.slice(o,o+nf*12));
  const pos=new Float32Array(nv*3);for(let i=0;i<nv*3;i++)pos[i]=mn[i%3]+q[i]/65535*sz[i%3];
  const T=window.THREE;if(!T)return {pos,idx};const g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(pos,3));g.setIndex(new T.BufferAttribute(idx,1));
  const co=o+nf*12;if(u8.length>=co+nv*3){const c=new Float32Array(nv*3);for(let i=0;i<nv*3;i++){const v=u8[co+i]/255;c[i]=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}g.setAttribute("color",new T.BufferAttribute(c,3))}
  /* опростен скелет (тяло, глава, дясна ръка) за анимацията „почесване“ */
  let k=co+nv*3;if(u8.length>k+5&&String.fromCharCode(u8[k],u8[k+1],u8[k+2],u8[k+3])==="SKN1"){k+=4;const nb=u8[k++],dv2=new DataView(u8.buffer),sk=[];
    for(let b=0;b<nb;b++){const par=dv2.getInt8(k);k+=1;const f=[];for(let j=0;j<7;j++){f.push(dv2.getFloat32(k,true));k+=4}sk.push({par,piv:f.slice(0,3),q:f.slice(3,7)})}
    const si=new Uint16Array(nv*4),sw=new Float32Array(nv*4);for(let i=0;i<nv*4;i++)si[i]=u8[k+i];for(let i=0;i<nv*4;i++)sw[i]=u8[k+nv*4+i]/255;
    g.setAttribute("skinIndex",new T.Uint16BufferAttribute(si,4));g.setAttribute("skinWeight",new T.Float32BufferAttribute(sw,4));g.userData.skel=sk}
  g.computeVertexNormals();return g}

/* ---------- текстури, рисувани в канвас ---------- */
const rnd=(a,b)=>a+Math.random()*(b-a);
function canvasTex(w,h,draw,rep,srgb=true){const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}t.anisotropy=8;if(srgb)t.encoding=THREE.sRGBEncoding;return t}
function noiseFill(g,w,h,base,amp){g.fillStyle=base;g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*amp;d[i]+=n;d[i+1]+=n;d[i+2]+=n}g.putImageData(id,0,0)}
/* ЕКГ лента: тясна и дълга, розова милиметрова мрежа, едно или две отвеждания */
function ecgStrip(seed,two){const W=2048,Hh=two?300:200;return canvasTex(W,Hh,(g,w,h)=>{g.fillStyle="#fff8f7";g.fillRect(0,0,w,h);const top=two?26:22,bot=8;
  for(let x=0;x<w;x+=6){g.strokeStyle=x%30===0?"rgba(222,84,104,.6)":"rgba(238,150,164,.36)";g.lineWidth=x%30===0?1.2:.6;g.beginPath();g.moveTo(x+.5,top);g.lineTo(x+.5,h-bot);g.stroke()}
  for(let y=top;y<h-bot;y+=6){g.strokeStyle=(y-top)%30===0?"rgba(222,84,104,.6)":"rgba(238,150,164,.36)";g.lineWidth=(y-top)%30===0?1.2:.6;g.beginPath();g.moveTo(0,y+.5);g.lineTo(w,y+.5);g.stroke()}
  g.fillStyle="#3a3a40";g.font="600 14px system-ui,sans-serif";g.fillText("25 mm/s · 10 mm/mV · HR 7"+seed+" · "+(seed%2?"sinus rhythm":"PR 0.16 s · QRS 0.09 s"),12,16);
  const beat=(p,a)=>g1(p,.12,.022,.13)+g1(p,.205,.007,-.14)+g1(p,.23,.009,a)+g1(p,.255,.009,-.24)+g1(p,.5,.04,.3);
  const lead=(y0,a,lab,c)=>{g.strokeStyle=c;g.lineWidth=2;g.lineJoin="round";g.beginPath();for(let x=0;x<w;x+=1.5){const t=x/150+seed*.21,p=(t%(.78+seed*.01))/(.78+seed*.01);g[x?"lineTo":"moveTo"](x,y0-beat(p,a)*52)}g.stroke();g.fillStyle=c;g.font="700 15px system-ui";g.fillText(lab,8,y0-50)};
  if(two){lead(top+110,1,"II","#1d1d22");lead(top+232,.8,"V5","#C8102E")}else lead(top+118,1,["II","V1","V5","aVF"][seed%4],seed%3?"#1d1d22":"#C8102E")})}
/* ===================================================================== */
function build(brainG,neuronG,docG){const T=THREE,V=(x,y,z)=>new T.Vector3(x,y,z);
  const cv=$("canvas.gl");
  R=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:"high-performance"});R.setPixelRatio(Math.min(MOBILE?1.5:1.75,devicePixelRatio||1));
  R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.0;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
  const cam=new T.PerspectiveCamera(36,1,.005,60);
  const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
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
  /* ЕКГ ленти: тесни и дълги, леко извити краища; една виси от ръба, една е в ръцете на лекаря */
  const strip=(seed,L,Wd,x,z,ry,o={})=>{const segs=Math.round(L*260),gm=new T.PlaneGeometry(L,Wd,segs,3);const P=gm.attributes.position;
    for(let i=0;i<P.count;i++){const px=P.getX(i),py=P.getY(i),u=px/L+.5;let h=.0026+.0012*Math.sin(px*40+seed)+.0006*Math.sin(py*90);
      if(o.curlA)h+=o.curlA*Math.exp(-u*14);if(o.curlB)h+=o.curlB*Math.exp(-(1-u)*14);if(o.fold){const f=Math.abs(((u*o.fold)%1)-.5);h+=.004*(.5-f)}P.setZ(i,h)}gm.computeVertexNormals();
    const tx=ecgStrip(seed,Wd>.07);tx.repeat.set(1,1);
    const m=new T.Mesh(gm,new T.MeshStandardMaterial({map:tx,roughness:.9,envMapIntensity:.25,side:T.DoubleSide}));m.rotation.set(-Math.PI/2,0,ry);m.position.set(x,DY+.0015+seed*.0004,z);m.receiveShadow=true;m.castShadow=true;S1.add(m);return m};
  strip(1,.62,.06,-.2,-.18,.12,{curlA:.012,curlB:.006});strip(2,.5,.06,.3,-.26,-.08,{curlB:.014});strip(3,.44,.085,-.48,.04,.5,{curlA:.01});strip(4,.38,.06,.48,.04,-.35,{curlA:.008,curlB:.01});
  /* сгънат на хармоника куп ленти от апарата */
  for(let k=0;k<6;k++){const p=new T.Mesh(new T.BoxGeometry(.21,.0012,.085),[0,1,2,3,4,5].map(i=>i===2?new T.MeshStandardMaterial({map:ecgStrip(10+k,true),roughness:.9}):new T.MeshStandardMaterial({color:0xf3e9e8,roughness:.9})));p.position.set(.6,DY+.001+k*.0013,-.33);p.rotation.y=.25+k*.01;p.castShadow=p.receiveShadow=true;S1.add(p)}
  /* лента, която виси от предния ръб на бюрото */
  {const L=.55,gm=new T.PlaneGeometry(.06,L,3,160);const P=gm.attributes.position;for(let i=0;i<P.count;i++){const py=P.getY(i)+L/2;const z0=.3,y=DY+.0012;let pz,pyy;if(py<z0){pz=-.12+py;pyy=y}else{const a=(py-z0);const ang=Math.min(Math.PI/2,a*9);pz=-.12+z0+Math.sin(ang)/9+Math.max(0,a-Math.PI/18)*0;pyy=y-(1-Math.cos(ang))/9-Math.max(0,a-Math.PI/18)}P.setXYZ(i,P.getX(i),pyy,pz)}
    gm.computeVertexNormals();const tx=ecgStrip(7,false);tx.rotation=Math.PI/2;tx.center.set(.5,.5);const m=new T.Mesh(gm,new T.MeshStandardMaterial({map:tx,roughness:.9,side:T.DoubleSide,envMapIntensity:.25}));m.position.set(-.62,0,.33);m.castShadow=true;S1.add(m)}
  /* лентата в ръцете: опъната между двете ръце, краищата падат към бюрото */
  const held=(()=>{const L=.7,gm=new T.PlaneGeometry(L,.06,280,3);const P=gm.attributes.position;for(let i=0;i<P.count;i++){const px=P.getX(i),ax=Math.abs(px);let y;if(ax<.2)y=.0245-.0015*Math.cos(px/.2*Math.PI/2);else{const a=ax-.2;y=Math.max(.0025,.0245-a*.32-a*a*1.5)}P.setZ(i,y+.0006*Math.sin(px*30))}gm.computeVertexNormals();
    const m=new T.Mesh(gm,new T.MeshStandardMaterial({map:ecgStrip(5,false),roughness:.9,side:T.DoubleSide,envMapIntensity:.25}));m.rotation.set(-Math.PI/2,0,.0);m.position.set(0,DY,.12);m.castShadow=true;m.receiveShadow=true;S1.add(m);return m})();
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
  let headG,docMats=[],docAnim=null;
  if(docG&&docG.isBufferGeometry){/* базов човек на MakeHuman (CC0), поставен седнал и оцветен по области — design/tools/posehuman.py */
    const dm=rim(new T.MeshPhysicalMaterial({vertexColors:true,roughness:.72,clearcoat:.12,clearcoatRoughness:.6,envMapIntensity:.35,transparent:true}),0xffffff,.18,3);docMats.push(dm);
    const sk=docG.userData.skel;let body;
    if(sk){dm.skinning=true;body=new T.SkinnedMesh(docG,dm);const bl=sk.map(()=>new T.Bone());sk.forEach((b,i)=>{const p=b.par>=0?sk[b.par].piv:[0,0,0];bl[i].position.set(b.piv[0]-p[0],b.piv[1]-p[1],b.piv[2]-p[2]);(b.par>=0?bl[b.par]:body).add(bl[i])});
      body.rotation.y=Math.PI;body.position.set(0,.456,.75);doc.add(body);doc.updateMatrixWorld(true);body.bind(new T.Skeleton(bl));
      const Q=sk.map(b=>new T.Quaternion(b.q[0],b.q[1],b.q[2],b.q[3])),I=new T.Quaternion(),tmp=new T.Quaternion(),ax=new T.Vector3(1,0,0),az=new T.Vector3(0,0,1),ay=new T.Vector3(0,1,0);
      /* цикъл: ръката се вдига към главата, почесва, после се връща върху лентата */
      docAnim=t=>{const P=8.5,c=t%P,up=c<1.1?sm(0,1.1,c):c<3.0?1:c<4.1?1-sm(3.0,4.1,c):0;const scr=c>1.0&&c<3.1?Math.sin((c-1)*18)*sm(1.0,1.3,c)*(1-sm(2.8,3.1,c)):0;
        for(let i=2;i<6;i++)bl[i].quaternion.copy(I).slerp(Q[i],up);
        bl[5].quaternion.multiply(tmp.setFromAxisAngle(ax,scr*.22));bl[4].quaternion.multiply(tmp.setFromAxisAngle(az,scr*.05));
        bl[1].quaternion.setFromAxisAngle(az,-.12*up).multiply(tmp.setFromAxisAngle(ay,.06*Math.sin(t*.4)))}}
    else{body=new T.Mesh(docG,dm);body.rotation.y=Math.PI;body.position.set(0,.456,.75);doc.add(body)}
    body.castShadow=true;body.receiveShadow=true;
    /* коса: кичури върху скалпа и 10 полупрозрачни слоя („черупки“), по-дълги към върха */
    const GL_N=`float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float strand(vec3 p){vec3 d=normalize(p-vec3(0.,.635,.335));float th=atan(d.x,d.z),ph=acos(clamp(d.y,-1.,1.));return vn(vec3(th*150.,ph*7.,0.))*.65+vn(vec3(th*360.,ph*16.,5.))*.35;}`;
    {const prev=dm.onBeforeCompile;dm.onBeforeCompile=sh=>{prev(sh);sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 vOP;").replace("#include <begin_vertex>","#include <begin_vertex>\nvOP=position;");
      sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nvarying vec3 vOP;\n"+GL_N).replace("#include <color_fragment>","#include <color_fragment>\n{float hm=step(vColor.r,.04)*step(vColor.b*1.6,vColor.r);float n=strand(vOP);diffuseColor.rgb*=mix(1.,.45+1.1*n,hm);}")};dm.customProgramCacheKey=()=>"docskin"}
    if(sk){const col=docG.attributes.color,ix=docG.index.array,hi=[];for(let t=0;t<ix.length;t+=3){let ok=1;for(let j=0;j<3;j++){const v=ix[t+j],r=col.getX(v),b=col.getZ(v);if(!(r<.045&&r>b*1.5)){ok=0;break}}if(ok)hi.push(ix[t],ix[t+1],ix[t+2])}
      const hg=new T.BufferGeometry();["position","normal","skinIndex","skinWeight"].forEach(a=>hg.setAttribute(a,docG.attributes[a]));hg.setIndex(hi);
      const NS=10;for(let l=1;l<=NS;l++){const L=l/NS;const hm=new T.MeshStandardMaterial({color:new T.Color(0x22160f).lerp(new T.Color(0x3a281b),L*.7).convertSRGBToLinear(),roughness:.55,metalness:0,skinning:true,envMapIntensity:.45});
        hm.onBeforeCompile=sh=>{sh.uniforms.uOff={value:.00075*l};sh.uniforms.uL={value:L};hm.userData.sh=sh;
          sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nuniform float uOff;varying vec3 vOP;").replace("#include <begin_vertex>","#include <begin_vertex>\nvOP=position;transformed+=objectNormal*uOff;");
          sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nuniform float uL;varying vec3 vOP;\n"+GL_N).replace("#include <alphatest_fragment>","#include <alphatest_fragment>\n{float n=strand(vOP);if(n<uL*.62+.3)discard;diffuseColor.rgb*=.75+.55*n;}")};
        hm.customProgramCacheKey=()=>"hairshell"+l;docMats.push(hm);
        const shl=new T.SkinnedMesh(hg,hm);shl.rotation.y=Math.PI;shl.position.copy(body.position);shl.renderOrder=2;doc.add(shl);doc.updateMatrixWorld(true);shl.bind(body.skeleton,body.bindMatrix)}}
    headG=new T.Group();headG.position.set(0,1.099,.395);headG.rotation.x=-.95;doc.add(headG);
    /* яка на престилката и стетоскоп около врата */
    const nk=V(0,.999,.549),ax=V(0,.07,-.088).normalize();const collar=new T.Mesh(new T.TorusGeometry(.068,.016,14,48),new T.MeshStandardMaterial({color:0xeef0f2,roughness:.85,envMapIntensity:.35}));collar.position.copy(nk).addScaledVector(ax,-.01);collar.quaternion.setFromUnitVectors(V(0,0,1),ax);collar.castShadow=true;doc.add(collar);docMats.push(collar.material);collar.material.transparent=true;
    const tm=new T.MeshPhysicalMaterial({color:0x1b1d22,roughness:.32,clearcoat:.8,transparent:true});docMats.push(tm);
    const cc=collar.position.clone().addScaledVector(ax,.02),e1=V(1,0,0),e2=V(0,0,0).crossVectors(e1,ax).normalize(),RR=.09,sp=[];
    for(let k=0;k<=14;k++){const th=-1.75+3.5*k/14;sp.push(cc.clone().addScaledVector(e1,Math.sin(th)*RR).addScaledVector(e2,Math.cos(th)*RR))}
    [-1,1].forEach(sg=>{const e=sp[sg<0?0:sp.length-1];const q1=e.clone().addScaledVector(e2,-.035).addScaledVector(ax,-.035).add(V(sg*.006,0,0)),q2=q1.clone().addScaledVector(e2,-.02).addScaledVector(ax,-.07);if(sg<0){sp.unshift(q1);sp.unshift(q2)}else{sp.push(q1);sp.push(q2)}});
    const tube=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(sp),140,.006,10,false),tm);tube.castShadow=true;doc.add(tube);
}
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

  if(!brain){const c=$(".cr .crb");if(c)c.remove()}
  /* ================= мозък (отделна тъмна сцена) ================= */
  const SB=new T.Scene();SB.background=new T.Color(0x09090c);SB.environment=ENV;SB.fog=new T.Fog(0x09090c,8,16);
  SB.add(new T.HemisphereLight(0xfff2f0,0x121216,.45));{const k=new T.DirectionalLight(0xfff4ee,1.3);k.position.set(3,6,5);SB.add(k);const b=new T.DirectionalLight(0xff9aa8,1.1);b.position.set(-4,1,-6);SB.add(b)}
  const brainPivot=new T.Group();SB.add(brainPivot);if(brain)brainPivot.add(brain);
  /* ================= 2. невронна мрежа: сигналът минава от неврон на неврон ================= */
  const S2=new T.Scene();S2.background=new T.Color(0x0a0a0d);S2.fog=new T.FogExp2(0x0a0a0d,.042);S2.environment=ENV;
  S2.add(new T.HemisphereLight(0xfff0ee,0x0e0e12,.22));{const k=new T.DirectionalLight(0xfff2ec,.75);k.position.set(5,8,6);S2.add(k);const b=new T.DirectionalLight(0xff8fa0,1.1);b.position.set(-6,-3,-9);S2.add(b)}
  const R2=(()=>{let s=17;return()=>(s=(s*16807)%2147483647)/2147483647})(),rr=(a,b)=>a+R2()*(b-a);
  const rp=d=>{const a=V(R2()-.5,R2()-.5,R2()-.5);return a.sub(d.clone().multiplyScalar(a.dot(d))).normalize()};
  /* тръба с променлив радиус (стеснява се към края) */
  const ptube=(curve,rf,seg,rad,mat)=>{const g=new T.TubeGeometry(curve,seg,1,rad,false),P=g.attributes.position;for(let i=0;i<=seg;i++){const c=curve.getPointAt(i/seg),r=rf(i/seg);for(let j=0;j<=rad;j++){const k=i*(rad+1)+j;P.setXYZ(k,c.x+(P.getX(k)-c.x)*r,c.y+(P.getY(k)-c.y)*r,c.z+(P.getZ(k)-c.z)*r)}}g.computeVertexNormals();return new T.Mesh(g,mat)};
  const NEU=[];const NP=[[-7.5,1.8,-3],[-3.6,-1.6,-6],[0,1.4,-2.4],[3.8,-1.2,-5.4],[7.6,1.6,-3.2],[-5.2,3.6,-11],[1.6,4.2,-10],[6.4,-3.6,-11],[-1.4,-4.4,-12],[10,3,-9],[-10,-2.6,-9]];
  const baseM=()=>rim(new T.MeshPhysicalMaterial({color:0xc4877d,roughness:.55,clearcoat:.35,clearcoatRoughness:.35,envMapIntensity:.18,emissive:0xff4d6d,emissiveIntensity:0}),0xffc4ba,.55,2.0);
  NP.forEach((p,i)=>{const c=V(...p),g=new T.Group();S2.add(g);const m=baseM();
    /* сома: неправилна, с конусовидни основи */
    const sg=new T.SphereGeometry(.55,64,48),SP=sg.attributes.position;for(let k=0;k<SP.count;k++){const v=V(SP.getX(k),SP.getY(k),SP.getZ(k));const n=v.clone().normalize();const f=1+.12*Math.sin(n.x*5+i)*Math.sin(n.y*4+i*2)*Math.sin(n.z*6)+.06*Math.sin(n.x*11+n.z*9);v.copy(n).multiplyScalar(.55*f);SP.setXYZ(k,v.x,v.y*1.12,v.z)}sg.computeVertexNormals();
    const soma=new T.Mesh(sg,m);soma.position.copy(c);g.add(soma);
    /* дендрити: разклонени, стесняващи се, криволичещи */
    const tips=[];const dend=(p0,d0,L,r0,depth)=>{const n=7,pts=[p0.clone()];let q=p0.clone(),d=d0.clone();for(let k=1;k<=n;k++){d.add(rp(d).multiplyScalar(.28)).normalize();q=q.clone().addScaledVector(d,L/n);pts.push(q)}
      const cv=new T.CatmullRomCurve3(pts),last=depth>=2||(depth>0&&R2()<.25),r1=r0*(last?.3:.66);g.add(ptube(cv,t=>r0+(r1-r0)*Math.pow(t,.8)+(depth===0?r0*.6*Math.exp(-t*8):0),depth<1?40:28,depth<1?8:6,m));
      if(!last){const pr=rp(d);[1,-1].forEach((sgn,k)=>dend(q,d.clone().addScaledVector(pr,sgn*rr(.4,.8)).normalize(),L*rr(.6,.85),r1*(k?.75:.9),depth+1))}else tips.push({p:q,c:cv})};
    const nd=6+Math.floor(R2()*3),axDir=V(rr(-1,1),rr(-.5,.5),rr(-1,1)).normalize();
    for(let k=0;k<nd;k++){let d=V(rr(-1,1),rr(-1,1),rr(-1,1)).normalize();if(d.dot(axDir)>.5)d.addScaledVector(axDir,-1).normalize();dend(c.clone().addScaledVector(d,.45),d,rr(1.6,2.6),.12,0)}
    NEU.push({c,g,m,soma,tips,axDir,out:[],fire:-9,glow:0})});
  /* аксони: от всеки неврон към един или два други, завършват с разклонения и бутони */
  const CON=[[0,2],[0,1],[1,3],[2,4],[2,3],[3,7],[4,9],[2,6],[1,8],[5,2],[6,4],[8,3],[10,1],[10,5],[9,7],[7,8],[6,9]];
  const bm=rim(new T.MeshPhysicalMaterial({color:0xf0c2b8,roughness:.4,clearcoat:.6,emissive:0xff4d6d,emissiveIntensity:0}),0xffffff,.5);
  CON.forEach(([a,b])=>{const A=NEU[a],B=NEU[b];const start=A.c.clone().addScaledVector(B.c.clone().sub(A.c).normalize(),.5);
    const tip=B.tips.reduce((best,t)=>{const d=t.p.distanceTo(A.c);return !best||d<best.d?{d,t}:best},null).t;const end=tip.p.clone().lerp(B.c,.35);
    const span=start.distanceTo(end),jit=Math.min(.6,span*.08),mid1=start.clone().lerp(end,.33).add(V(rr(-jit,jit),rr(-jit,jit),rr(-jit,jit))),mid2=start.clone().lerp(end,.66).add(V(rr(-jit,jit),rr(-jit,jit),rr(-jit,jit)));
    const cv=new T.CatmullRomCurve3([start,mid1,mid2,end]);A.g.add(ptube(cv,t=>.045-.015*t+(t<.05?.07*(1-t/.05):0),160,7,A.m));
    const bt=new T.Mesh(new T.SphereGeometry(.13,20,14),bm.clone());bt.position.copy(end);A.g.add(bt);
    A.out.push({cv,to:b,bt,len:cv.getLength()})});
  /* импулси: светеща точка с опашка, която тича по аксона */
  const dotT=canvasTex(64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,"rgba(255,255,255,1)");r.addColorStop(.22,"rgba(255,140,160,.95)");r.addColorStop(1,"rgba(255,60,90,0)");g.fillStyle=r;g.fillRect(0,0,w,h)});
  const PN=600,pG=new T.BufferGeometry(),pP=new Float32Array(PN*3),pC=new Float32Array(PN*3);pG.setAttribute("position",new T.BufferAttribute(pP,3));pG.setAttribute("color",new T.BufferAttribute(pC,3));
  const pM=new T.PointsMaterial({size:1.0,map:dotT,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending});const pts=new T.Points(pG,pM);pts.frustumCulled=false;pts.renderOrder=5;S2.add(pts);
  const halo=NEU.map(n=>{const s=new T.Sprite(new T.SpriteMaterial({map:dotT,color:0xff6680,transparent:true,depthWrite:false,depthTest:false,blending:T.AdditiveBlending,opacity:0}));s.position.copy(n.c);s.scale.setScalar(3.2);S2.add(s);return s});
  const pulses=[];const SPEED=7;
  const fire=(i,t)=>{const n=NEU[i];if(t-n.fire<.6)return;n.fire=t;n.glow=1;click(.45);spikeT=1;n.out.forEach(o=>pulses.push({o,t0:t+.05}))};
  /* фонови неврони в далечината за дълбочина */
  {const fG=new T.BufferGeometry(),fp=[];for(let i=0;i<260;i++)fp.push(rr(-26,26),rr(-14,14),rr(-40,-14));fG.setAttribute("position",new T.Float32BufferAttribute(fp,3));S2.add(new T.Points(fG,new T.PointsMaterial({size:.5,map:dotT,color:0x6a4048,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.6})))}
  let netT=0,nextSeed=0,netWarm=0;
  function netStep(dt){netT+=dt;const t=netT;if(t>nextSeed){fire([0,10,5][Math.floor(R2()*3)],t);nextSeed=t+rr(.7,1.3)}
    let k=0;for(let i=pulses.length-1;i>=0;i--){const p=pulses[i],a=t-p.t0;if(a<0)continue;const u=a*SPEED/p.o.len;
      if(u>=1){p.o.bt.material.emissiveIntensity=1.6;const to=p.o.to;pulses.splice(i,1);fire(to,t+.12);continue}
      for(let tr=0;tr<10&&k<PN;tr++){const uu=u-tr*.01;if(uu<0)break;const q=p.o.cv.getPointAt(uu);pP[k*3]=q.x;pP[k*3+1]=q.y;pP[k*3+2]=q.z;const f=1-tr/10;pC[k*3]=f;pC[k*3+1]=f*.55;pC[k*3+2]=f*.62;k++}}
    for(;k<PN;k++){pP[k*3+1]=-999}pG.attributes.position.needsUpdate=true;pG.attributes.color.needsUpdate=true;
    NEU.forEach((n,i)=>{n.glow=Math.max(0,n.glow-dt*1.6);n.m.emissiveIntensity=n.glow*1.4;halo[i].material.opacity=n.glow*.9;n.out.forEach(o=>{o.bt.material.emissiveIntensity=Math.max(0,o.bt.material.emissiveIntensity-dt*2.5)})})}

  /* ---------- размер ---------- */
  function size(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.aspect<.8?60:36;cam.updateProjectionMatrix()}
  size();addEventListener("resize",size);

  /* ---------- камера и времева линия ---------- */
  const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,cl=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
  const fadeEl=$(".fade");
  doc.updateMatrixWorld(true);const headW=()=>headG.getWorldPosition(V(0,0,0));
  const A={p:V(.55,2.9,1.55),l:V(0,DY,.12)},B={p:V(.32,1.95,1.05),l:V(0,DY+.08,.2)};
  let tt=0,last=performance.now(),cur=1;
  const DUR=4.6;
  R.compile(S1,cam);setC("ready");phase="intro";
  setTimeout(()=>{if(!ended&&phase==="intro")setText("office")},2400);
  setTimeout(()=>{if(!ended&&phase==="intro"){setC("hinted");phase="hold"}},4200);
  /* етапи на гмуркането (секунди) */
  const D={head:3.6,brain:brain?2.6:0,neu:9};
  const t1=D.head,t2=t1+D.brain,t3=t2,t4=t3+D.neu,t6=t4;
  const C1=new T.Color(0x16171a),C0=new T.Color(0x050507),hp0=V(0,0,0);let hpFix=null;
  function frame(n){if(ended)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,(n-last)/1000);last=n;tt+=dt;
    if(spikeT>0)spikeT=Math.max(0,spikeT-dt*4);
    /* дишане и леко движение на главата */
    const br=Math.sin(tt*1.35);doc.scale.set(1+.004*br,1+.003*br,1+.004*br);if(docAnim&&cur===1)docAnim(window.__nxDocT!=null?window.__nxDocT:tt+2.5);
    let fade=0;
    if(diveT<0){/* кабинетът отгоре */
      const u=ease(cl(tt/DUR,0,1));cam.position.copy(A.p).lerp(B.p,u);const lk=A.l.clone().lerp(B.l,u);const k=u>=1?1:0;cam.position.x+=Math.sin(tt*.3)*.02*k;cam.lookAt(lk);cur=1}
    else{diveT+=dt;const d=diveT;
      if(d<t1||(brain&&d<t2)){/* плавно спускане към главата; стаята потъва в тъмнина */
        if(!hpFix)hpFix=headW().clone();const hp=hpFix;
        if(d<t1){cur=1;const x=cl(d/D.head,0,1),u=x*x*(2-x)*(.4+.6*x)+(1-(.4+.6*x))*x*x*(3-2*x);
          const to=hp.clone().add(V(.012,.06,.05));cam.position.copy(B.p).lerp(to,u);const lk=B.l.clone().lerp(hp,Math.min(1,u*1.25));cam.lookAt(lk);
          const k=sm(.45,1,x);S1.background.lerpColors(C1,C0,k);S1.fog.color.copy(S1.background);S1.fog.near=lerp(3.2,.02,k);S1.fog.far=lerp(6.5,.12,Math.pow(k,.7));
          fade=Math.max(fade,sm(.88,1,x)*.8);setText(x<.86?"office":"neuron")}
        else{cur=4;const v=cl((d-t1)/D.brain,0,1);cam.position.set(Math.sin(v*1.1-.5)*6.5,1.6-.6*v,Math.cos(v*1.1-.5)*6.5);cam.lookAt(0,0,0);brainPivot.rotation.y=.2*v;
          if(brainM.userData.uW)brainM.userData.uW.value=-3+((d-t1)*2.4%1)*6;setText("brain");fade=Math.max(fade,(1-sm(0,.35,d-t1))*.85,sm(.85,1,v)*.85)}}
      else{cur=2;const w=d-t3,v=cl(w/D.neu,0,1);/* мрежата изплува от тъмнината; камерата продължава напред без прекъсване */
        const e=1-Math.pow(1-v,2.2);cam.position.set(lerp(-9,8,e),lerp(2.5,-.5,e)+Math.sin(v*3)*.6,lerp(11,3.5,e));cam.lookAt(lerp(-3,3,e),0,-6);
        S2.fog.density=lerp(.2,.042,sm(0,1.5,w));fade=Math.max(fade,(1-sm(0,.35,w))*.8);
        setText(v<.45?"neuron":"net")}
      if(d>t6&&phase==="dive"){phase="hold2";$(".hint em").textContent="Scroll to enter";setC("hinted")}
    }
    fadeEl.style.opacity=fade.toFixed(3);
    if(cur===2){if(!netWarm){netWarm=1;for(let w=0;w<70;w++)netStep(.05)}netStep(dt)}
    R.render(cur===1?S1:cur===2?S2:SB,cam);if(cur===2&&!ov.classList.contains("ecg"))setC("ecg");if(ov.classList.contains("ecg"))ecDraw(dt)}
  raf=requestAnimationFrame(frame);
  window.__nxSeek=d=>{if(diveT<0){phase="dive";setC("hinted",false)}diveT=d};
}
})();
