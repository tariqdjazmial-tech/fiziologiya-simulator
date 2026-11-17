/* ===== Начална сцена: сърце на операционна маса, приближаване при скрол (по идеята на ORYZO).
   Реалистичният модел е същият като в раздела за сърцето: m/hglb3.txt („Realistic Human Heart“, neshallads, CC BY 4.0).
   Вмъква се само на началната страница, преди .lp-hero; останалият сайт не се променя. ===== */
(function(){"use strict";
const EN=()=>window.PHYS_LANG==="en";
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const THREE_URL="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
const GLTF="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
const ROOM="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/environments/RoomEnvironment.js";
const load=src=>new Promise((res,rej)=>{if([...document.scripts].some(s=>s.src===src))return res();const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});

const css=`
.hx{position:relative;height:460vh;background:#100904;color:#ffedd7;margin:0}
.hx-st{position:sticky;top:var(--hx-top,56px);height:calc(100vh - var(--hx-top,56px));height:calc(100svh - var(--hx-top,56px));overflow:hidden}
.hx canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.hx-ov{position:absolute;inset:0;pointer-events:none;padding:28px max(18px,env(safe-area-inset-left,0px)) 28px max(18px,env(safe-area-inset-right,0px))}
.hx-t{position:absolute;opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .7s cubic-bezier(.2,.8,.2,1);text-transform:uppercase;font-weight:500;letter-spacing:.01em;line-height:.95}
.hx-t.on{opacity:1;transform:none}
.hx-l{left:max(18px,env(safe-area-inset-left,0px));top:50%;margin-top:-1.2em}
.hx-r{right:max(18px,env(safe-area-inset-right,0px));top:50%;margin-top:-1.2em;text-align:right}
.hx-k{display:block;font-size:12px;letter-spacing:.14em;opacity:.62;margin-bottom:10px;font-weight:500}
.hx-big{font-size:clamp(30px,4.4vw,56px)}
.hx-c{left:0;right:0;bottom:max(34px,calc(env(safe-area-inset-bottom,0px) + 24px));text-align:center;padding:0 18px}
.hx-brand{font-size:clamp(46px,9vw,128px);letter-spacing:-.01em}
.hx-sub{display:block;margin-top:14px;font-size:13px;letter-spacing:.16em;opacity:.7}
.hx-body{text-transform:none;font-weight:400;font-size:clamp(19px,2.1vw,29px);line-height:1.26;max-width:30ch;margin:0 auto;letter-spacing:0}
.hx-cta{pointer-events:auto;border:0;font-family:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:10px;margin-top:18px;padding:14px 22px;border-radius:36px;background:#382416;color:#ffedd7;text-decoration:none;font-size:14px;letter-spacing:.08em;min-height:44px}
.hx-cta:focus-visible{outline:2px solid #ffedd7;outline-offset:3px}
.hx-hr{position:absolute;right:max(18px,env(safe-area-inset-right,0px));bottom:max(22px,calc(env(safe-area-inset-bottom,0px) + 14px));font:500 12px/1 ui-monospace,monospace;letter-spacing:.08em;opacity:.7;display:flex;gap:8px;align-items:center}
.hx-hr i{width:7px;height:7px;border-radius:50%;background:#ff3b30;transform:scale(var(--p,1))}
.hx-cr{position:absolute;max-width:calc(100% - 150px);left:max(18px,env(safe-area-inset-left,0px));bottom:max(22px,calc(env(safe-area-inset-bottom,0px) + 14px));font:500 10px/1.3 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#dc5000;opacity:.85;max-width:52ch}
.hx-cr a{color:inherit;pointer-events:auto}
.hx-load{position:absolute;inset:0;display:grid;place-items:center;font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.6}
.hx-bar{position:absolute;left:0;top:0;height:2px;background:#ffedd7;opacity:.5;width:calc(var(--prog,0) * 100%)}
@media (max-width:700px){.hx-l,.hx-r{top:22px;margin:0}.hx-big{font-size:30px}.hx-c{bottom:calc(140px + env(safe-area-inset-bottom,0px))}.hx-hr,.hx-cr{bottom:calc(88px + env(safe-area-inset-bottom,0px))}.hx-cr{max-width:56%}}
@media (prefers-reduced-motion:reduce){.hx-t{transition:opacity .3s}}
`;
const st=document.createElement("style");st.id="hx-css";st.textContent=css;document.head.appendChild(st);

function texts(){const e=EN();return [
 {a:0,b:.16,cls:"hx-c",html:`<span class="hx-brand">PhysioNova</span><span class="hx-sub">${e?"Physiology simulator · scroll":"Симулатор по физиология · скролни"} ↓</span>`},
 {a:.2,b:.42,cls:"hx-l",html:`<span class="hx-k">${e?"Operating room":"Операционна зала"}</span><span class="hx-big">07:42</span>`},
 {a:.2,b:.42,cls:"hx-r",html:`<span class="hx-k">${e?"Donor heart":"Донорско сърце"}</span><span class="hx-big">≈ 310 g</span>`},
 {a:.46,b:.7,cls:"hx-l",html:`<span class="hx-k">${e?"Heart rate":"Сърдечна честота"}</span><span class="hx-big">72 ${e?"bpm":"уд./мин"}</span>`},
 {a:.46,b:.7,cls:"hx-r",html:`<span class="hx-k">${e?"Stroke volume":"Ударен обем"}</span><span class="hx-big">70 ml</span>`},
 {a:.5,b:.7,cls:"hx-c",html:`<p class="hx-body">${e?"About 5 litres of blood a minute, every minute of your life. Here you see how.":"Около 5 литра кръв в минута, всяка минута от живота ти. Тук ще видиш как."}</p>`},
 {a:.74,b:.97,cls:"hx-l",html:`<span class="hx-k">${e?"Left ventricle":"Лява камера"}</span><span class="hx-big">8–12 mm</span>`},
 {a:.74,b:.97,cls:"hx-r",html:`<span class="hx-k">${e?"Pressure":"Налягане"}</span><span class="hx-big">120 mmHg</span>`},
 {a:.8,b:1.01,cls:"hx-c",html:`<button type="button" class="hx-cta" data-go>${e?"Continue to PhysioNova":"Към PhysioNova"} ↓</button>`}
]}

let inst=null;
function mount(){const main=document.getElementById("main");if(!main||!document.body.classList.contains("lp"))return;
  const hero=main.querySelector(":scope > .lp-hero");if(!hero||main.querySelector(":scope > .hx"))return;
  const sec=document.createElement("section");sec.className="hx";sec.setAttribute("aria-label",EN()?"Heart on the operating table":"Сърце на операционна маса");
  sec.innerHTML=`<div class="hx-st"><canvas aria-hidden="true"></canvas><div class="hx-bar"></div><div class="hx-load">${EN()?"Preparing the operating room…":"Подготвяме операционната…"}</div>
   <div class="hx-ov">${texts().map((t,i)=>`<div class="hx-t ${t.cls}" data-i="${i}">${t.html}</div>`).join("")}
   <div class="hx-hr"><i></i><span>72 ${EN()?"BPM":"УД./МИН"}</span></div>
   <div class="hx-cr">${EN()?"Model":"Модел"}: <a href="https://sketchfab.com/3d-models/realistic-human-heart-3f8072336ce94d18b3d0d055a1ece089" target="_blank" rel="noopener">Realistic Human Heart</a> · neshallads · CC BY 4.0</div></div></div>`;
  main.insertBefore(sec,hero);sec.querySelector("[data-go]").addEventListener("click",()=>hero.scrollIntoView({behavior:RM?"auto":"smooth"}));
  const bar=document.querySelector("header.bar");if(bar)sec.style.setProperty("--hx-top",bar.offsetHeight+"px");
  if(inst)inst.stop();inst=start(sec)}

function start(sec){
  let dead=false,raf=0;const cv=sec.querySelector("canvas"),stage=sec.querySelector(".hx-st"),TX=[...sec.querySelectorAll(".hx-t")],T0=texts(),hrEl=sec.querySelector(".hx-hr i");
  const fail=()=>{sec.querySelector(".hx-load").textContent=EN()?"3D could not load in this browser.":"3D не се зареди в този браузър.";sec.style.height="100vh"};
  (window.THREE?Promise.resolve():load(THREE_URL)).then(()=>load(GLTF)).then(()=>load(ROOM).catch(()=>null))
   .then(()=>fetch("m/hglb3.txt").then(r=>{if(!r.ok)throw new Error("model");return r.text()}))
   .then(b64=>{if(dead)return;const bin=atob(b64.trim()),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
     return new Promise((res,rej)=>new THREE.GLTFLoader().parse(u8.buffer,"",res,rej))})
   .then(gl=>{if(dead||!gl)return;sec.querySelector(".hx-load").remove();build(gl)}).catch(e=>{console.error(e);fail()});

  function build(gl){const T=THREE;
    const R=new T.WebGLRenderer({canvas:cv,antialias:true});R.setPixelRatio(Math.min(1.75,devicePixelRatio||1));
    R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.0;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
    const BG=new T.Color(0x100904);const sc=new T.Scene();sc.background=BG;sc.fog=new T.FogExp2(0x100904,.035);
    if(T.RoomEnvironment){const pm=new T.PMREMGenerator(R);sc.environment=pm.fromScene(new T.RoomEnvironment(),.04).texture}
    const cam=new T.PerspectiveCamera(35,1,.05,60);

    /* ---- операционна маса ---- */
    const steel=new T.MeshStandardMaterial({color:0x5d6166,metalness:.85,roughness:.42,envMapIntensity:.35});
    const table=new T.Mesh(new T.BoxGeometry(7,.2,3.6),steel);table.position.y=-.1;table.receiveShadow=true;sc.add(table);
    const dg=new T.PlaneGeometry(6.2,3.2,90,46);{const P=dg.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i);P.setZ(i,.05+.025*Math.sin(x*3.1+y*1.7)+.015*Math.sin(x*7.3-y*5.1))}dg.computeVertexNormals()}
    const drape=new T.Mesh(dg,new T.MeshStandardMaterial({color:0x123f3b,roughness:1,metalness:0,envMapIntensity:.08}));drape.rotation.x=-Math.PI/2;drape.position.y=0;drape.receiveShadow=true;sc.add(drape);
    /* бъбрековидно легенче от стомана */
    const prof=[[0,0],[.95,0],[1.08,.05],[1.16,.13],[1.2,.19],[1.24,.2]].map(p=>new T.Vector2(p[0],p[1]));
    const dish=new T.Mesh(new T.LatheGeometry(prof,72),new T.MeshStandardMaterial({color:0x9ea3a9,metalness:.95,roughness:.28,envMapIntensity:.45,side:T.DoubleSide}));dish.scale.set(1.25,1,.85);dish.position.y=.1;dish.receiveShadow=true;dish.castShadow=true;sc.add(dish);
    /* инструменти: скалпел и пинсета */
    const inst=new T.Group();const hm=new T.MeshStandardMaterial({color:0xb5b9be,metalness:.95,roughness:.2,envMapIntensity:.5});
    const handle=new T.Mesh(new T.BoxGeometry(1.0,.035,.09),hm);const bshape=new T.Shape();bshape.moveTo(0,0);bshape.lineTo(.34,0);bshape.quadraticCurveTo(.3,.09,0,.08);
    const blade=new T.Mesh(new T.ExtrudeGeometry(bshape,{depth:.008,bevelEnabled:false}),hm);blade.rotation.x=-Math.PI/2;blade.position.set(.5,0,.04);
    const sc1=new T.Group();sc1.add(handle,blade);sc1.position.set(2.2,.11,-.55);sc1.rotation.y=.35;inst.add(sc1);
    const fA=new T.Mesh(new T.BoxGeometry(1.05,.03,.06),hm),fB=fA.clone();fA.position.z=.05;fA.rotation.y=-.05;fB.position.z=-.05;fB.rotation.y=.05;
    const fp=new T.Group();fp.add(fA,fB);fp.position.set(2.15,.11,.55);fp.rotation.y=-.25;inst.add(fp);
    inst.traverse(o=>{if(o.isMesh){o.castShadow=true}});sc.add(inst);
    /* хирургическа лампа */
    const lamp=new T.Group();const hous=new T.Mesh(new T.CylinderGeometry(1.35,1.5,.32,64),new T.MeshStandardMaterial({color:0x1a1715,metalness:.3,roughness:.75,envMapIntensity:.15}));lamp.add(hous);
    const face=new T.Mesh(new T.CircleGeometry(1.28,64),new T.MeshBasicMaterial({color:0x3a352e}));face.rotation.x=Math.PI/2;face.position.y=-.165;lamp.add(face);
    const bulbM=new T.MeshBasicMaterial({color:0xfff3df});[[0,0],...Array.from({length:6},(_,i)=>[Math.cos(i/6*6.283)*.72,Math.sin(i/6*6.283)*.72])].forEach(p=>{const b=new T.Mesh(new T.CircleGeometry(.26,40),bulbM);b.rotation.x=Math.PI/2;b.position.set(p[0],-.17,p[1]);lamp.add(b)});
    const arm=new T.Mesh(new T.CylinderGeometry(.08,.08,3,16),new T.MeshStandardMaterial({color:0x2c2a27,metalness:.5,roughness:.5}));arm.position.y=1.65;lamp.add(arm);
    lamp.position.set(0,3.25,-.9);lamp.rotation.x=.32;sc.add(lamp);
    const spot=new T.SpotLight(0xfff1dc,2.6,14,.38,.6,1.2);spot.position.set(0,3.05,-.75);spot.castShadow=true;spot.shadow.mapSize.set(1536,1536);spot.shadow.bias=-.0004;spot.shadow.radius=4;sc.add(spot);sc.add(spot.target);
    const hemi=new T.HemisphereLight(0xffe7cc,0x100904,.25);sc.add(hemi);
    const rim=new T.DirectionalLight(0xffb27a,0);rim.position.set(-2.5,2.5,-3);sc.add(rim);
    const fill=new T.DirectionalLight(0xfff0e0,0);fill.position.set(2,1.5,3);sc.add(fill);

    /* ---- сърцето (същата обработка на материалите като в раздела за сърцето) ---- */
    gl.scene.updateMatrixWorld(true);const parts=[];gl.scene.traverse(o=>{if(o.isMesh)parts.push(o)});
    const bb=new T.Box3();parts.forEach(o=>bb.expandByObject(o));const cen=bb.getCenter(new T.Vector3()),H=bb.getSize(new T.Vector3()).y,s=1.55/H;
    const heart=new T.Group(),inner=new T.Group();heart.add(inner);
    parts.forEach(o=>{const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);g.translate(-cen.x,-cen.y,-cen.z);g.scale(s,s,s);g.computeVertexNormals();
      const om=o.material;const m=new T.MeshPhysicalMaterial({map:om.map,normalMap:om.normalMap,roughnessMap:om.roughnessMap,metalness:0,roughness:.66,clearcoat:.45,clearcoatRoughness:.3,envMapIntensity:.55,side:T.DoubleSide});
      if(m.map)m.map.encoding=T.sRGBEncoding;const mesh=new T.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;inner.add(mesh)});
    sc.add(heart);
    /* легнало положение: върхът сочи надясно, предната стена нагоре */
    const LIE={rx:-1.32,ry:.25,rz:-1.15},DISH_TOP=.13,UP={rx:.05,ry:-.35,rz:.12};
    heart.rotation.set(LIE.rx,LIE.ry,LIE.rz);heart.updateMatrixWorld(true);const hb=new T.Box3().setFromObject(heart);const restY=DISH_TOP-.04-hb.min.y;

    /* ---- кадри на камерата по скрола ---- */
    const V=(x,y,z)=>new T.Vector3(x,y,z);
    const K=[ // t, позиция, цел, мъгла
     {t:0,  p:V(0,2.15,6.6), l:V(0,1.0,0),  f:.035},
     {t:.3, p:V(.9,1.45,3.2),l:V(0,.5,0),   f:.06},
     {t:.55,p:V(0,1.75,3.6), l:V(0,1.7,0),  f:.32},
     {t:.8, p:V(.42,1.86,1.32),l:V(.12,1.78,.15),f:.42},
     {t:1,  p:V(.3,1.8,1.9), l:V(0,1.72,0), f:.42}];
    const sm=x=>x*x*(3-2*x),cl=(x,a,b)=>Math.max(a,Math.min(b,x));
    function cam_at(t,out){let i=0;while(i<K.length-2&&t>K[i+1].t)i++;const a=K[i],b=K[i+1],u=sm(cl((t-a.t)/(b.t-a.t),0,1));
      out.p.copy(a.p).lerp(b.p,u);out.l.copy(a.l).lerp(b.l,u);out.f=a.f+(b.f-a.f)*u;return out}
    const cs={p:new T.Vector3(),l:new T.Vector3(),f:0};

    /* ---- ЕКГ ритъм и съкращение с инерция ---- */
    const HR=72,Tc=60/HR;let ph=0;const sp={x:0,v:0,w:2*Math.PI*9,z:.9};
    const sys=p=>{if(p<.12||p>.48)return 0;return Math.pow(Math.sin((p-.12)/.36*Math.PI),1.3)};
    const atr=p=>{const d=(p-.9+1)%1;return d<.1?Math.sin(d/.1*Math.PI):0};

    let prog=0,progT=0;const clk=new T.Clock();
    function size(){const w=stage.clientWidth,h=stage.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.aspect<.8?52:35;cam.updateProjectionMatrix()}
    size();const ro=new ResizeObserver(size);ro.observe(stage);
    function scrollProg(){const r=sec.getBoundingClientRect(),tot=r.height-stage.clientHeight;return cl(-r.top/Math.max(1,tot),0,1)}
    function frame(){if(dead)return;raf=requestAnimationFrame(frame);const r=sec.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
      const dt=Math.min(.05,clk.getDelta());progT=scrollProg();prog+= (progT-prog)*(RM?1:1-Math.pow(.0015,dt));
      sec.style.setProperty("--prog",prog.toFixed(4));
      /* сърдечен цикъл */
      ph=(ph+dt/Tc*(RM?.4:1))%1;const tg=sys(ph);const n=Math.max(1,Math.ceil(dt/.002)),h=dt/n;for(let i=0;i<n;i++){sp.v+=h*(sp.w*sp.w*(tg-sp.x)-2*sp.z*sp.w*sp.v);sp.x+=h*sp.v}
      const c=sp.x,a=atr(ph)*.4;inner.scale.set(1-.045*c+.012*a,1-.03*c+.01*a,1-.045*c+.012*a);inner.rotation.y=.05*c;
      hrEl.style.setProperty("--p",(1+.7*c).toFixed(3));
      /* сърцето се надига от легенчето и застава изправено */
      const lift=sm(cl((prog-.3)/.25,0,1));heart.position.y=restY+(1.72-restY)*lift;
      heart.rotation.x=LIE.rx+(UP.rx-LIE.rx)*lift;heart.rotation.z=LIE.rz+(UP.rz-LIE.rz)*lift;heart.rotation.y=LIE.ry+(UP.ry-LIE.ry)*lift+(RM?0:Math.sin(clk.elapsedTime*.25)*.12*lift);
      /* камера, мъгла и светлини: от залата към празнота */
      cam_at(prog,cs);cam.position.copy(cs.p);cam.lookAt(cs.l);sc.fog.density=cs.f;
      const vo=sm(cl((prog-.35)/.25,0,1));spot.intensity=2.6-1.2*vo;spot.target.position.set(0,heart.position.y*.9,0);rim.intensity=1.8*vo;fill.intensity=1.0*vo;hemi.intensity=.25+.15*vo;
      lamp.visible=vo<.5;
      R.render(sc,cam);
      TX.forEach((el,i)=>{const t=T0[i];el.classList.toggle("on",prog>=t.a&&prog<t.b)})}
    raf=requestAnimationFrame(frame);
    stopRO=()=>{ro.disconnect();R.dispose()}}
  let stopRO=()=>{};
  return {stop(){dead=true;cancelAnimationFrame(raf);stopRO()}}}

/* началната страница се рисува наново при всяка смяна на изгледа, затова следим #main */
function watch(){const main=document.getElementById("main");if(!main)return setTimeout(watch,200);
  new MutationObserver(()=>{if(inst&&!document.body.contains(document.querySelector(".hx"))){inst.stop();inst=null}mount()}).observe(main,{childList:true});mount()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",watch);else watch();
})();
