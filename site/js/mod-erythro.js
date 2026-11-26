/* ===== Еритропоеза, желязо и анемии =====
   Редуциран образователен модел (Guyton & Hall, гл. 33); време в дни (1 s = 1 ден). Спецификация: design/topics/erythro.md,
   3D дизайн: design/topics/erythro-3d.md.
   - бъбрекът мери доставката на O₂ → HIF-2α → EPO (логаритмично);
   - костен мозък: 3 компартмента по τ = 2 d (≈ 6 d съзряване) → ретикулоцити (1–2,2 d в кръвта) → Hb; живот 120 d;
   - желязо: DMT1 → феропортин (⟂ хепцидин) → трансферин → еритрон; запаси (феритин); рециклиране от макрофагите;
   - хепцидин ↑ от запасите и IL-6, ↓ от еритроферона; B12/фолат → ефективна еритропоеза и MCV. */
(function(){"use strict";
if(typeof mkSim!=="function"||typeof zRegister!=="function")return;
const T_=x=>window.T?window.T(x):x,EN=window.__EN=window.__EN||{},L=(bg,en)=>{if(en)EN[bg]=en;return bg},cl=(v,a,b)=>Math.max(a,Math.min(b,v));
[["mL/ден","mL/day"],["# mL/ден","# mL/day"],["дни","days"],["# дни","# days"],["# mg/ден","# mg/day"],["# m","# m"]].forEach(([b,e])=>L(b,e));

/* ---------- модел ---------- */
const P_={J0:0.125,tauM:2.0,FeHb:173,FeLoss:1.0};
function erInit(){return {t:0,Hb:15.0,Rt:0.125,E1:0.25,E2:0.25,E3:0.25,EPO:9,Hep:1.0,Fp:3.0,S:1000,MCV:90,Vr:1.0,Bili:0.6,LDH:1.0,fBe:1,hypo:0}}
function erFlux(s,p){const pre=p.pre||"norm",alt=p.alt,infl=p.infl,kid=p.kid,b12=p.b12,fe=p.fe,loss=p.loss,life=p.life,EPOexo=pre==="esa"?12:0;
  const PB=760*Math.exp(-alt/7990),PiO2=0.2093*(PB-47),PaCO2=40-10*Math.min(1,alt/4000),PaO2=PiO2-PaCO2/0.8-5,SaO2=Math.pow(PaO2,2.7)/(Math.pow(PaO2,2.7)+Math.pow(26.6,2.7));
  const HbM=(s.Hb+s.Rt)/s.Vr,DO2=HbM*SaO2/0.97;
  let EPOt=8*(kid/100)*Math.exp(0.65*(15-DO2))*Math.exp(0.012*(95-PaO2))*(1-0.6*infl/100)+EPOexo;EPOt=cl(EPOt,0.2,20000);if(pre==="pv")EPOt=1.0;
  const TIBC=9*(1+0.8*cl(1-s.S/500,0,1))*(1-0.3*infl/100),TSAT=Math.min(100,100*s.Fp/TIBC),Fer=0.125*s.S*(1+1.5*infl/100);
  const ERFE=cl(Math.log10(Math.max(0.01,s.EPO)/8)/1.5,0,2),Hept=cl(Math.pow(cl(s.S/1000,0.02,3),1.6)*(1+6*infl/100)*(1+(1-kid/100))/(1+3*ERFE),0.02,6);
  const fFP=cl(2/(1+s.Hep),0.1,1.8),aMax=0.067*(1+1.5*cl(1-s.S/500,0,1)),Abs=Math.min(5,fe*aMax*fFP);
  const fE=Math.min(8,Math.pow(Math.max(0.01,s.EPO)/8,0.45))*(1-0.45*infl/100),fFe=Math.min(1,(TSAT/(TSAT+10))/0.75);
  const Hct=HbM*3/100,fV=cl((0.65-Hct)/0.05,0,1);let Pcom=P_.J0*fE*fFe*fV;if(pre==="pv")Pcom=0.26*fFe*fV;
  const fB=s.fBe!=null?s.fBe:b12/100,Rel=(s.E3/2)*fB,Ineff=(s.E3/2)*(1-fB),Tr=1+1.2*cl(Math.log10(Math.max(0.01,s.EPO)/8)/2,0,1);
  const LifeE=life*(1-0.25*infl/100),Destr=s.Hb/LifeE,BleedHb=s.Hb*loss/5000,BleedFe=loss*HbM*0.0347;
  const Rec=(Destr+Ineff)*173,RelM=Rec*Math.min(1,0.45+0.55*fFP),Mob=0.02*Math.min(s.S,1200)*(0.3+0.7*fFP)*Math.max(0,1-s.Fp/3),Upt=Pcom*173,Dep=25*Math.max(0,s.Fp-3);
  const retPct=100*s.Rt/(s.Hb+s.Rt),RPI=retPct*(HbM/15)/Tr,RBC=HbM*10/(s.MCV*0.33),retAbs=retPct/100*RBC*1000;
  return {PaO2,SaO2,HbM,DO2,EPOt,TIBC,TSAT,Fer,ERFE,Hept,fFP,Abs,fE,fFe,Hct,fV,Pcom,fB,Rel,Ineff,Tr,Destr,BleedHb,BleedFe,Rec,RelM,Mob,Upt,Dep,retPct,RPI,RBC,retAbs,EPOexo}}
function erStep(s,p,dt){const F=erFlux(s,p);
  s.fBe=(s.fBe==null?p.b12/100:s.fBe)+(p.b12/100-(s.fBe==null?p.b12/100:s.fBe))*dt/8;s.hypo=(s.hypo||0)+((1-F.fFe)-(s.hypo||0))*dt/20;s.EPO+=(F.EPOt-s.EPO)*Math.min(1,dt/0.25);s.Hep+=(F.Hept-s.Hep)*Math.min(1,dt/0.5);
  s.E1+=(F.Pcom-s.E1/2)*dt;s.E2+=(s.E1-s.E2)/2*dt;s.E3+=(s.E2-s.E3)/2*dt;
  s.Rt+=(F.Rel-s.Rt/F.Tr)*dt;s.Hb=Math.max(1,s.Hb+(s.Rt/F.Tr-F.Destr-F.BleedHb)*dt);
  s.Fp=Math.max(0.05,s.Fp+(F.Abs+F.RelM+F.Mob-F.Upt-F.Dep)*dt);
  s.S+=(F.Dep+F.Rec-F.RelM-F.Mob-P_.FeLoss-F.BleedFe)*dt;if(s.S<0){s.Fp=Math.max(0.05,s.Fp+s.S);s.S=0}if(s.S>4000)s.S=4000;
  const MCVt=cl(90-26*(1-F.fFe)+32*(1-F.fB)+3*Math.min(2,F.retPct/5),58,128);s.MCV+=(MCVt-s.MCV)*dt/20;s.Vr+=(1-s.Vr)*dt/1.0;
  s.Bili+=(0.15+0.45*(F.Destr/0.125)+0.25*(F.Ineff/0.125)-s.Bili)*dt;s.LDH+=(1+1.2*(F.Destr/0.125-1)+4*(F.Ineff/0.125)-s.LDH)*dt;s.t+=dt}
function erBleed(s){s.Hb*=0.8;s.Rt*=0.8;s.Vr=0.80;s.S=Math.max(0,s.S-250)}   // остра загуба 1 L: клетки и плазма заедно

/* ---------- 2D: бъбрек → костен мозък → кръв и железен кръговрат ---------- */
const C={epo:"#1c7ed6",hb:"#c92a2a",ret:"#f76707",fe:"#a5532a",tf:"#748ffc",hep:"#7048e8",fer:"#9c6644",il:"#e64980",gr:"#868e96"};
function draw(g,p,R,t,dt,s){if(!s)return;const F=erFlux(s,p),T=(x,y,txt,o)=>Z.T(g,x,y,T_(txt),o),mut=css("--muted");
  // бъбрек
  Z.org(g,18,16,170,48,C.epo,T_(L("Бъбрек","Kidney")),"PaO₂ "+fmt(F.PaO2,0)+" · SaO₂ "+fmt(F.SaO2*100,0)+" %",cl((15-F.DO2)/8,0,1));
  T(103,82,"EPO "+fmt(s.EPO,s.EPO<100?1:0)+" mU/mL",{fs:11.5,w:700,c:C.epo});
  Z.arr(g,103,88,103,112,C.epo,1+1.6*Math.log10(1+s.EPO/4),"");
  // костен мозък: верига
  const st=[[L("BFU-E / CFU-E","BFU-E / CFU-E"),s.E1],[L("проеритро- / базофилен","pro- / basophilic"),s.E2],[L("полихромат. / ортохромен","polychromatic / orthochromatic"),s.E3]],x0=18,y0=116;
  st.forEach(([n,v],i)=>{const x=x0+i*92;Z.box(g,x,y0,84,34,C.hb,C.hb,8,1.2,0.08+0.5*cl(v/0.6,0,1));T(x+42,y0+21,n,{fs:10,w:700});if(i<2)Z.arr(g,x+85,y0+17,x+91,y0+17,C.gr,1.5,"")});
  T(x0+138,y0+50,T_(L("ефективност","efficiency"))+" "+fmt(F.fB*100,0)+" %  ·  ×"+fmt(F.Pcom/P_.J0,1),{fs:10.5,c:mut});
  if(F.fB<0.99)Z.arr(g,x0+230,y0+36,x0+250,y0+66,C.blk||"#c92a2a",1+3*(1-F.fB),T_(L("умират в мозъка","die in the marrow")),{dash:[4,3],dx:8});
  Z.arr(g,x0+268,y0+17,x0+300,y0+17,C.ret,1+F.Rel*12,"");T(x0+318,y0+21,L("ретикулоцити","reticulocytes"),{fs:10.5,c:C.ret,w:700,a:"left"});
  // кръв: еритроцити (брой ∝ Hb, диаметър ∝ ∛MCV, бледост ∝ TSAT)
  const bx=18,by=206,bw=360,bh=96;Z.box(g,bx,by,bw,bh,css("--line"),null,10,1,0);
  const n=Math.round(cl(F.HbM*2.6,6,60)),r=5.2*Math.cbrt(s.MCV/90),pal=cl(0.33+0.9*(s.hypo||0),0.33,0.8);
  for(let i=0;i<n;i++){const x=bx+12+((i*37)%(bw-24)),y=by+12+((i*53+((i*7)%11)*3)%(bh-24));g.fillStyle=i<Math.round(n*F.retPct/100*3)?"#9a6f8a":"#b3262e";g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle="rgba(240,200,200,.85)";g.beginPath();g.arc(x,y,r*pal*0.9,0,7);g.fill()}
  T(bx+bw/2,by+bh+16,"Hb "+fmt(F.HbM,1)+" g/dL · MCV "+fmt(s.MCV,0)+" fL · "+T_(L("ретик.","retic."))+" "+fmt(F.retPct,1)+" %",{fs:11,w:700});
  // железен кръговрат (дясно)
  const ix=420;Z.org(g,ix,16,150,44,C.fe,T_(L("Дуоденум","Duodenum")),T_(L("резорбция","absorbed"))+" "+fmt(F.Abs,1)+" mg/"+T_(L("ден","day")),cl(F.Abs/3,0,1));
  Z.org(g,ix,206,150,44,C.fer,T_(L("Макрофаг (слезка)","Macrophage (spleen)")),T_(L("рециклиране","recycling"))+" "+fmt(F.RelM,0)+" mg/"+T_(L("ден","day")),cl(F.RelM/30,0,1));
  Z.org(g,ix+190,206,150,44,C.fer,T_(L("Черен дроб: запаси","Liver: stores")),fmt(s.S,0)+" mg · "+T_(L("феритин","ferritin"))+" "+fmt(F.Fer,0),cl(s.S/1500,0,1));
  Z.box(g,ix+40,112,200,40,C.tf,C.tf,10,1.4,0.1);Z.box(g,ix+40,112,200*cl(F.TSAT/100,0,1),40,C.tf,null,10,0,0.45);T(ix+140,137,T_(L("трансферин","transferrin"))+" · TSAT "+fmt(F.TSAT,0)+" %",{fs:11,w:700});
  Z.arr(g,ix+75,62,ix+90,110,C.fe,1+F.Abs,"");Z.arr(g,ix+75,204,ix+90,154,C.fe,1+F.RelM/10,"");Z.arr(g,ix+240,132,ix-60,132,C.fe,1+F.Upt/12,T_(L("към мозъка","to marrow")),{dy:-8});
  Z.org(g,ix+190,16,150,44,C.hep,T_(L("Хепцидин","Hepcidin")),"×"+fmt(s.Hep,2),cl(s.Hep/3,0,1));
  const lock=(x,y)=>{const a=cl(s.Hep/3,0,1);g.strokeStyle=C.hep;g.lineWidth=2;g.globalAlpha=0.3+0.7*a;g.strokeRect(x-6,y-2,12,10);g.beginPath();g.arc(x,y-2,4.5,Math.PI,0);g.stroke();g.globalAlpha=1};
  Z.arr(g,ix+190,40,ix+152,40,C.hep,1+s.Hep,"",{dash:[4,3]});lock(ix+140,72);Z.arr(g,ix+265,62,ix+120,204,C.hep,0.8+s.Hep*0.6,"",{dash:[4,3]});lock(ix+150,262);
  if(p.infl>0)T(ix+265,84,"IL-6 ⊕",{fs:11,c:C.il,w:700});if(F.ERFE>0.05)T(ix+265,98,T_(L("еритроферон ⊖","erythroferrone ⊖")),{fs:11,c:C.epo,w:700})}

/* ---------- 3D ---------- */
/* Една WebGL сцена, шест станции на едно място (видима е само активната): обзор с истински органи (BodyParts3D, 0,02 ед./mm),
   и пет микроскопски станции в µm (1 ед. = 1 µm). Всички величини идват от erFlux/състоянието на модела; изгледът не добавя свое време,
   освен скоростта на кръвотока (забавена) и продължителността на енуклеацията (удължена). Белтъците са опростени форми (без PDB). */
function er3D(get){const W=document.createElement("div");W.className="card";W.style.cssText="padding:10px";const ph0=innerWidth<600;
  const STN=[["ovw",L("Обзор","Overview")],["kid",L("Бъбрек","Kidney")],["bm",L("Костен мозък","Bone marrow")],["blood",L("Кръв","Blood")],["duo",L("Дуоденум","Duodenum")],["spl",L("Слезка","Spleen")]];
  const PRE={norm:0,bleed:0,ida:4,acd:5,perni:2,ckd:1,alt:1,hemo:3,esa:2,pv:3};
  const DS=[L("Органите са истински модели (BodyParts3D) в реален размер и положение. Частиците показват посоката на сигналите и на желязото; пътищата са схематични (белодробният кръг е пропуснат), а плътността им следва модела. Главните места на хемопоезата при възрастен са тазът, гръдната кост и прешлените — проксималният фемур е показан за нагледност (костта е полупрозрачна: вътре — червен, а в диафизата мастен мозък).","The organs are real models (BodyParts3D) at true size and position. Particles show the direction of the signals and of iron; the routes are schematic (the pulmonary circuit is omitted) and their density follows the model. The main adult haematopoietic sites are the pelvis, sternum and vertebrae — the proximal femur is shown for illustration (the bone is translucent: red marrow inside, fatty marrow in the shaft)."),
    L("Кора на бъбрека: две проксимални тубули, перитубулен капиляр и интерстициални фибробласти (REPC). При ниска доставка на O₂ HIF-2α не се разгражда и те секретират EPO (сиянието на ядрото ∝ хипоксията). При ХБЗ фибробластите стават миофибробласти и правят колаген — EPO остава нисък въпреки анемията. Плътността на EPO частиците е логаритмична.","Renal cortex: two proximal tubules, a peritubular capillary and interstitial fibroblasts (REPC). With low O₂ delivery HIF-2α escapes degradation and they secrete EPO (nuclear glow ∝ hypoxia). In CKD the fibroblasts become myofibroblasts and make collagen — EPO stays low despite the anaemia. EPO particle density is logarithmic."),
    L("Еритробластен остров: централен макрофаг и еритробласти — проеритробласт (≈ 16 µm) → базофилен → полихроматофилен → ортохроматичен (≈ 9 µm); ядрото се изхвърля и се фагоцитира, а ретикулоцитът минава през стената на синусоида. Съзряването върви във времето на модела (≈ 6 дни); броят клетки ∝ продукцията, цветът на цитоплазмата ∝ хемоглобинизацията (TSAT); при дефицит на B12 — мегалобласти, част от които умират в мозъка.","Erythroblastic island: a central macrophage and erythroblasts — proerythroblast (≈ 16 µm) → basophilic → polychromatic → orthochromatic (≈ 9 µm); the nucleus is expelled and phagocytosed and the reticulocyte crosses the sinusoid wall. Maturation runs in model time (≈ 6 days); the cell number ∝ production, cytoplasm colour ∝ haemoglobinisation (TSAT); in B12 deficiency — megaloblasts, some of which die in the marrow."),
    L("Посткапилярна венула (Ø ≈ 22 µm, стената е срязана отпред). Еритроцитите са с формата на Evans–Fung (Ø 7,8 µm, ръб 2,6 µm, център 0,8 µm); обемът им ∝ MCV, бледостта ∝ насищането с желязо, тъмнината ∝ ниската SaO₂. Броят в кадъра = Hct × обема на съда / MCV (в малкия съд Hct ≈ 0,75 × системния — ефект на Fåhræus). Левкоцитът и тромбоцитите са до стената (маргинация). Скоростта е забавена, профилът е изгладен (тапообразен), а подреждането и ориентацията на клетките са опростени; сфероцитите и фрагментите при хемолиза са илюстрация — видът им зависи от причината.","Post-capillary venule (Ø ≈ 22 µm, wall cut away at the front). Red cells have the Evans–Fung shape (Ø 7.8 µm, rim 2.6 µm, centre 0.8 µm); their volume ∝ MCV, pallor ∝ iron saturation, darkness ∝ low SaO₂. The number in view = Hct × vessel volume / MCV (in a small vessel Hct ≈ 0.75 × systemic — the Fåhræus effect). The leukocyte and platelets lie near the wall (margination). Flow is slowed down, the profile is blunted (plug-like) and cell packing and orientation are simplified; spherocytes and fragments in haemolysis are illustrative — their type depends on the cause."),
    L("Ентероцит на дуоденума (срязан): Dcytb редуцира Fe³⁺ → Fe²⁺, DMT1 го внася заедно с H⁺, феропортинът го изнася, хефестинът го окислява до Fe³⁺, а трансферинът го носи (две места за Fe; запълнените ∝ TSAT). Хепцидинът се свързва с феропортина и той се интернализира. Белтъците са опростени форми, уголемени над 100 пъти; феритинът е схематичен (губи се, когато ентероцитът се слющи след 2–3 дни).","Duodenal enterocyte (cut open): Dcytb reduces Fe³⁺ → Fe²⁺, DMT1 imports it with H⁺, ferroportin exports it, hephaestin oxidises it to Fe³⁺ and transferrin carries it (two Fe sites; filled ∝ TSAT). Hepcidin binds ferroportin, which is internalised. Proteins are simplified shapes enlarged more than 100-fold; ferritin is schematic (it is lost when the enterocyte is shed after 2–3 days)."),
    L("Червена пулпа на слезката: старите и сфероцитните еритроцити не минават през процепите (~1 µm) към венозния синус и се фагоцитират. Хем-оксигеназата освобождава Fe²⁺, което излиза през феропортина към трансферина или остава като феритин. При възпаление хепцидинът блокира изхода: феритинът расте, а TSAT пада.","Splenic red pulp: senescent and spherocytic red cells cannot pass the ~1 µm slits into the venous sinus and are phagocytosed. Haem oxygenase releases Fe²⁺, which leaves through ferroportin to transferrin or stays as ferritin. In inflammation hepcidin blocks the exit: ferritin rises while TSAT falls.")];
  const AC=[L("анатомично точни органи · схематични пътища","anatomically accurate organs · schematic routes"),L("образователно опростяване","educational simplification"),L("реални относителни размери на клетките; останалото — опростено","true relative cell sizes; the rest simplified"),L("форма и размер — анатомично точни; брой и вид — от модела","shape and size anatomically accurate; number and type from the model"),L("образователно опростяване; белтъците не са в мащаб (опростени)","educational simplification; proteins not to scale (simplified)"),L("образователно опростяване","educational simplification")];
  const sw=(c,t)=>`<span><i style="background:${c}"></i>${T_(t)}</span>`;
  W.innerHTML=(typeof wrap3D==="function"?wrap3D("erW",ph0?460:innerWidth>=1200?620:540):`<div id="erW" style="position:relative;width:100%;height:500px;border-radius:6px;overflow:hidden"></div>`)+
   `<div class="btns" style="margin-top:8px;flex-wrap:wrap">${STN.map(([k,n],i)=>`<button class="b" data-st="${i}">${T_(n)}</button>`).join("")}<button class="b" id="erTour">${T_(L("▶ обиколка","▶ tour"))}</button></div>`+
   `<div id="erNt" style="margin-top:6px;font-size:13px;line-height:1.45"></div>`+
   `<div class="legend" style="margin-top:6px">${sw("#1c7ed6","EPO")}${sw("#7048e8",L("хепцидин","hepcidin"))}${sw("#7b2d26","Fe³⁺")}${sw("#a5532a","Fe²⁺")}${sw("#748ffc",L("трансферин","transferrin"))}${sw("#9a6f72",L("феритин","ferritin"))}${sw("#9a6f8a",L("ретикулоцит","reticulocyte"))}${sw("#862e9c",L("феропортин","ferroportin"))}<span style="opacity:.75">${T_(L("органи: BodyParts3D (DBCLS, CC BY-SA 2.1 JP); клетки и белтъци: опростени модели","organs: BodyParts3D (DBCLS, CC BY-SA 2.1 JP); cells and proteins: simplified models"))}</span></div>`;
  return {el:W,start(){const lo=!!window.LOWGPU,ph=innerWidth<600,chips=[...W.querySelectorAll("[data-st]")],tb=W.querySelector("#erTour"),nt=W.querySelector("#erNt");
   let want=-1,tour=false,tourT=0,scn=null;
   chips.forEach(b=>b.addEventListener("click",()=>{tour=false;tb.classList.remove("primary");want=+b.dataset.st}));
   tb.addEventListener("click",()=>{tour=!tour;tb.classList.toggle("primary",tour);tourT=0});
   const stop=mk3DView("#erW",()=>{const wr=document.getElementById("erW"),G=make3D(wr,{r:23,th:0.25,phi:1.45,target:[-0.2,-2.3,0.6],min:1.5,max:260,hq:true,fov:38}),T=G.T,sc=G.scene;scn=sc;G.ren.localClippingEnabled=true;
    G.cv.addEventListener("pointerdown",()=>{if(tour){tour=false;tb.classList.remove("primary")}});
    const V=(x,y,z)=>new T.Vector3(x,y,z),C=h=>new T.Color(h).convertSRGBToLinear(),lerp=(a,b,u)=>a+(b-a)*u,sm=(a,b,x)=>{const u=cl((x-a)/(b-a),0,1);return u*u*(3-2*u)};
    const _m=new T.Matrix4(),_q=new T.Quaternion(),_q2=new T.Quaternion(),qI=new T.Quaternion(),_v=new T.Vector3(),_v2=new T.Vector3(),_s=new T.Vector3(),_c=new T.Color(),_cd=new T.Vector3(),AX=V(0,0,1),AY=V(0,1,0),AXX=V(1,0,0);
    const hash=(i,k=0)=>{const x=Math.sin(i*127.1+k*311.7+k*k*1.37)*43758.5453;return x-Math.floor(x)};
    const rest=g=>{g.setAttribute("rest",new T.BufferAttribute(g.attributes.position.array.slice(),3));return g};
    const tis=(pal,o)=>{const m=zMat(T,pal,Object.assign({sc:0.6,cc:lo?0:0.4,bump:0.3},o));m.transparent=false;m.opacity=1;return m};
    const mat=(h,o)=>MK.mat(T,h,Object.assign({roughness:0.5,clearcoat:lo?0:0.2},o||{}));
    const ghost=(h,op,o)=>mat(h,Object.assign({transparent:true,opacity:op,depthWrite:false,side:T.DoubleSide},o||{}));
    const imesh=(geo,m,n,par)=>{const im=new T.InstancedMesh(geo,m,n);im.frustumCulled=false;_c.setRGB(1,1,1);_m.identity();for(let i=0;i<n;i++){im.setColorAt(i,_c);im.setMatrixAt(i,_m)}im.count=0;par.add(im);return im};
    const put=(im,i,x,y,z,q,sx,sy,sz)=>{_v.set(x,y,z);_s.set(sx,sy==null?sx:sy,sz==null?sx:sz);_m.compose(_v,q,_s);im.setMatrixAt(i,_m)};
    const fin=(im,n)=>{im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true};
    const nzf=(x,y,z)=>Math.sin(x*1.7+y*0.9)*Math.cos(z*1.3-x*0.6)*0.5+Math.sin(x*3.1-z*2.3+y*1.9)*0.25+Math.sin(y*5.3+z*4.1+x*0.7)*0.12;
    const blob=(R,ws,hs,amp,f)=>{const g=new T.SphereGeometry(R,ws,hs),P=g.attributes.position;for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i);_v.multiplyScalar(1+amp*nzf(_v.x/R*f,_v.y/R*f,_v.z/R*f));P.setXYZ(i,_v.x,_v.y,_v.z)}g.computeVertexNormals();return g};
    const mergeG=gs=>{let nv=0,ni=0;gs.forEach(g=>{nv+=g.attributes.position.count;ni+=g.index.count});const P=new Float32Array(nv*3),N=new Float32Array(nv*3),I=new Uint32Array(ni);let ov=0,oi=0;
      gs.forEach(g=>{P.set(g.attributes.position.array,ov*3);N.set(g.attributes.normal.array,ov*3);const ix=g.index.array;for(let k=0;k<ix.length;k++)I[oi+k]=ix[k]+ov;ov+=g.attributes.position.count;oi+=ix.length;g.dispose()});
      const m=new T.BufferGeometry();m.setAttribute("position",new T.BufferAttribute(P,3));m.setAttribute("normal",new T.BufferAttribute(N,3));m.setIndex(new T.BufferAttribute(I,1));return m};
    const CR=a=>new T.CatmullRomCurve3(a.map(q=>V(q[0],q[1],q[2])));
    /* ---- еритроцит: профил на Evans & Fung (1972), µm: дебелина T(x)=√(1−x²)(0,81+7,83x²−4,39x⁴), R=3,91 ---- */
    const EF=x=>0.5*Math.sqrt(Math.max(0,1-x*x))*(0.81+7.83*x*x-4.39*x*x*x*x);
    const rbcGeo=kind=>{const nr=lo?12:20,nth=lo?18:30,R=kind==="sph"?3.1:3.91,h=x=>kind==="sph"?2.25*Math.sqrt(Math.max(0,1-x*x)):EF(x),pr=[];
      for(let i=0;i<=nr;i++){const x=Math.sin(i/nr*Math.PI/2);pr.push(new T.Vector2(Math.max(1e-3,x*R),-h(x)))}
      for(let i=nr-1;i>=0;i--){const x=Math.sin(i/nr*Math.PI/2);pr.push(new T.Vector2(Math.max(1e-3,x*R),h(x)))}
      const g=new T.LatheGeometry(pr,nth);g.rotateX(Math.PI/2);const P=g.attributes.position;
      /* thk = обща дебелина на клетката на този радиус (не z на върха), нормирана към ръба; извън максимума (x > 0,7) = 1, за да не избледнява ръбът */
      const th=new Float32Array(P.count);for(let i=0;i<P.count;i++){const x=Math.min(1,Math.hypot(P.getX(i),P.getY(i))/R);th[i]=x>0.7?Math.max(1,h(0.7)/1.28):Math.min(1.6,h(x)/1.28)}g.setAttribute("thk",new T.BufferAttribute(th,1));
      if(kind==="frag")for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i);if(x>0.9)x=0.9+(x-0.9)*0.12;const d=x*0.5+y*0.866;if(d>1.5){x-=(d-1.5)*0.44;y-=(d-1.5)*0.76}P.setXY(i,x,y)}
      g.computeVertexNormals();return g};
    const gN=rbcGeo("n"),gS=rbcGeo("sph"),gF=rbcGeo("frag");
    /* бледост по локалната дебелина (повече Hb там, където клетката е по-дебела); uK расте при хипохромия */
    const rbK={value:0.7},rbH={value:0},rbM=new T.MeshPhysicalMaterial({color:0xffffff,roughness:0.6,clearcoat:0,emissive:C(0x3a0a10),emissiveIntensity:0.1});
    rbM.onBeforeCompile=sh=>{sh.uniforms.uK=rbK;sh.uniforms.uH=rbH;sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nattribute float thk;varying float vT;").replace("#include <begin_vertex>","#include <begin_vertex>\nvT=thk;");
      sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nuniform float uK,uH;varying float vT;").replace("#include <color_fragment>","#include <color_fragment>\nvec3 rbP=mix(diffuseColor.rgb,vec3(0.92,0.64,0.65),0.62);float hbA=smoothstep(0.02,uK,vT);diffuseColor.rgb=mix(diffuseColor.rgb,rbP,(0.25+0.45*uH)*(1.0-hbA)+0.3*uH*hbA);")};
    const cOx=C(0xa3262b),cDe=C(0x7d2240),cRet=C(0x9a6f8a),cRbc=new T.Color();
    const fpnG=blob(1,16,12,0.06,2),hepG=new T.SphereGeometry(0.42,10,8),tfG=(()=>{const a=new T.SphereGeometry(0.55,10,8),b=new T.SphereGeometry(0.55,10,8);a.translate(-0.42,0,0);b.translate(0.42,0,0);return mergeG([a,b])})(),feG=new T.SphereGeometry(0.3,8,6);
    const fpnM=mat(0x862e9c,{roughness:0.45}),hepM=mat(0x7048e8,{emissive:C(0x7048e8),emissiveIntensity:0.35}),tfM=mat(0x748ffc,{roughness:0.4}),feM=mat(0x7b2d26,{emissive:C(0x7b2d26),emissiveIntensity:0.4}),ferM=mat(0x9a6f72,{roughness:0.55,flatShading:true});
    /* феропортин: свободните (k < nFree) изнасят желязо; останалите са свързани с хепцидин и се интернализират (навътре, по-малки) */
    function mkFPN(par,pos,dir){const n=pos.length,imF=imesh(fpnG,fpnM,n,par),imH=imesh(hepG,hepM,n,par),b=new Float32Array(n),q=new T.Quaternion().setFromUnitVectors(AY,dir);
      return {n,nFree:n,upd(dt,fFP){const nf=Math.round(cl(n*fFP/2,0,n));this.nFree=nf;let nh=0;
        for(let k=0;k<n;k++){b[k]+=((k>=nf?1:0)-b[k])*Math.min(1,dt*1.5);const bb=b[k];_v.copy(pos[k]).addScaledVector(dir,-2*bb);_s.set(0.75,1.4,0.75).multiplyScalar(1-0.35*bb);_m.compose(_v,q,_s);imF.setMatrixAt(k,_m);
          if(bb>0.04){_v2.copy(_v).addScaledVector(dir,1.4*(1-0.35*bb)+0.3);_s.setScalar(sm(0,0.3,bb));_m.compose(_v2,qI,_s);imH.setMatrixAt(nh++,_m)}}
        fin(imF,n);fin(imH,nh)}}}
    /* трансферин: два дяла, всеки с едно място за Fe³⁺; запълнени места = 2n·TSAT */
    function mkTf(par,n,path){const imT=imesh(tfG,tfM,n,par),imD=imesh(feG,feM,2*n,par),U0=new Float32Array(n),Q=[];for(let i=0;i<n;i++){U0[i]=hash(i,3);Q.push(new T.Quaternion().setFromEuler(new T.Euler(hash(i,4)*6,hash(i,5)*6,hash(i,6)*6)))}
      return {upd(t,spd,tsat){const nFe=Math.round(2*n*cl(tsat,0,100)/100);let nd=0;for(let i=0;i<n;i++){path((U0[i]+t*spd)%1,_v,i);_s.setScalar(1);_m.compose(_v,Q[i],_s);imT.setMatrixAt(i,_m);
          for(let l=0;l<2;l++)if(nd<nFe){_v2.set(l?0.42:-0.42,0.45,0).applyQuaternion(Q[i]).add(_v);_m.compose(_v2,qI,_s);imD.setMatrixAt(nd++,_m)}}fin(imT,n);fin(imD,nd)}}}
    const epoN=e=>e>0.3?Math.round(cl(4*Math.log10(Math.max(1,e))+3,1,14)):0;
    const SN=[];
    /* ================= S0: обзор (BodyParts3D, 0,02 ед./mm) ================= */
    SN.push(function(){const g=new T.Group();
      const ld=(f,m,cb)=>MK.loadMesh(T,"m/"+f).then(geo=>{if(G.dead)return;const o=new T.Mesh(rest(geo),m);g.add(o);if(cb)cb(o,geo)}).catch(()=>{});
      const kM=tis([[0.45,0.19,0.16],[0.35,0.13,0.11],[0.55,0.26,0.21]],{sc:0.4});ld("bd_kidR.txt",kM);ld("bd_kidL.txt",kM);
      const livM=tis([[0.42,0.15,0.13],[0.33,0.1,0.09],[0.5,0.21,0.18]],{sc:0.5});livM.transparent=true;livM.opacity=0.32;livM.depthWrite=false;livM.side=T.FrontSide;ld("bd_liver.txt",livM,o=>{o.renderOrder=4});
      ld("bd_spleen.txt",tis([[0.42,0.16,0.26],[0.3,0.1,0.18],[0.5,0.2,0.3]],{sc:0.6}));ld("bd_duo.txt",tis([[0.88,0.56,0.52],[0.76,0.42,0.4],[0.93,0.68,0.62]],{sc:0.8}));
      const stM=ghost(0xd9a3a0,0.2,{side:T.FrontSide});ld("bd_stom.txt",stM,o=>{o.renderOrder=4});
      ld("bd_heart.txt",tis([[0.62,0.2,0.2],[0.5,0.14,0.15],[0.7,0.28,0.26]],{sc:0.5}));
      const aoM=mat(0xa61e1e,{roughness:0.4});ld("bd_aorta.txt",aoM);ld("bd_ivc.txt",mat(0x4a5aa8,{roughness:0.4}));
      /* кост: полупрозрачна кортикалис; вътрешните стени се рисуват като костен мозък — червен в таза и проксималния фемур, бледорозов (мастен) в диафизата */
      const clipF=new T.Plane(V(0,1,0),9),boneM=mat(0xe6e0e6,{roughness:0.5,transparent:true,opacity:0.42,depthWrite:false,side:T.FrontSide,clippingPlanes:[clipF]}),marM=new T.MeshStandardMaterial({vertexColors:true,side:T.BackSide,roughness:0.75,clippingPlanes:[clipF]});
      const cRed=C(0x9e2a3a),cFat=C(0xcfa9b0),marrow=(geo,f)=>{const g2=geo.clone(),P=g2.attributes.position,col=new Float32Array(P.count*3);for(let i=0;i<P.count;i++){_c.copy(cFat).lerp(cRed,f(P.getY(i)));col[3*i]=_c.r;col[3*i+1]=_c.g;col[3*i+2]=_c.b}g2.setAttribute("color",new T.BufferAttribute(col,3));g.add(new T.Mesh(g2,marM))};
      ld("bd_hipR.txt",boneM,(o,geo)=>{o.renderOrder=3;marrow(geo,()=>1)});ld("bd_femR.txt",boneM,(o,geo)=>{o.renderOrder=3;marrow(geo,y=>sm(-7.8,-6.2,y))});
      /* пътища (средните линии на долната куха вена и аортата са от срезове на мрежите; останалото е схематично) */
      const IVC=[[-0.2,-2.7,1.2],[-0.22,-1.9,1.33],[-0.25,-0.7,1.27],[-0.28,0.5,1.06],[-0.33,1.7,1.12],[-0.25,2.3,1.25]],HRT=[[-0.1,2.7,1.45],[0.1,2.7,1.3]],
        AO=[[0.1,3.4,1.3],[0.22,4.45,0.75],[0.3,3.6,-0.1],[0.3,2.9,-0.02],[0.19,2.1,0.32],[0.17,1.3,0.51],[0.13,0.5,0.8],[0.23,-0.7,1.0],[0.14,-1.5,1.3],[0.11,-2.7,1.26]],
        ILI=[[-0.4,-3.4,1.25],[-0.95,-4.1,1.0],[-1.45,-4.6,0.45],[-1.45,-5.7,0.4],[-1.6,-6.4,0.4]],AOc=AO.slice(0,7);
      const cEPO=CR([[-1.15,-0.95,0.32],[-0.75,-0.95,0.75],...IVC.slice(1),...HRT,...AO,...ILI]),cFe=CR([[-0.2,-1.1,1.55],[-0.35,-0.45,1.3],[-0.65,0.35,1.2],[-0.5,1.3,1.15],...IVC.slice(4),...HRT,...AO,...ILI]),
        cRt=CR([[-1.6,-6.2,0.4],[-1.45,-4.8,0.5],[-0.9,-4.0,1.1],[-0.35,-3.3,1.2],...IVC,...HRT]),cOld=CR([...AOc,[0.6,0.6,0.85],[1.1,0.45,0.85],[1.55,0.2,0.75]]),
        cHep=CR([[-0.9,0.7,1.35],[-0.5,1.5,1.15],...IVC.slice(4),...HRT,...AOc,[0.05,0.0,1.15],[-0.15,-0.7,1.45]]);
      const fE=zFlow(T,g,16,0x1c7ed6,0.1),fF=zFlow(T,g,24,0xa5532a,0.09);fF.mt.emissiveIntensity=0.25;const fR=zFlow(T,g,18,0x9a6f8a,0.1),fO=zFlow(T,g,18,0x7d2240,0.1),fH=zFlow(T,g,18,0x7048e8,0.09);
      const cPale=C(0xc98a8a),cRedB=C(0xa61e1e);
      const lab=[[T_(L("бъбрек → EPO","kidney → EPO")),V(-1.75,-1.3,0.4),1],[T_(L("черен дроб → хепцидин","liver → hepcidin")),V(-1.9,1.5,1.6),1],[T_(L("дуоденум: резорбция на Fe","duodenum: Fe absorption")),V(-0.5,-2.1,1.9),1],
        [T_(L("слезка: рециклиране на Fe","spleen: Fe recycling")),V(2.2,0.9,0.8),1],[T_(L("таз: червен костен мозък","pelvis: red marrow")),V(-2.3,-3.6,0.5),1],[T_(L("проксимален фемур","proximal femur")),V(-2.4,-7.0,0.5),0],[T_(L("сърце","heart")),V(0.9,3.2,1.9),0],[T_(L("аорта / долна куха вена","aorta / inferior vena cava")),V(1.0,-0.4,1.4),0]];
      if(ph)lab.forEach(e=>{e[1].x=e[1].x<0?Math.min(e[1].x,-3.2):Math.max(e[1].x,3.2)});
      return {g,tg:V(-0.3,-1.2,0.6),r:15.5,th:0.25,phi:1.45,sb:[2,"10 cm"],lab,
        live(F,s){return "EPO "+fmt(s.EPO,s.EPO<100?1:0)+" mU/mL · Hb "+fmt(F.HbM,1)+" g/dL · "+T_(L("хепцидин","hepcidin"))+" ×"+fmt(s.Hep,2)+" · "+T_(L("резорбция","absorption"))+" "+fmt(F.Abs,1)+" · "+T_(L("рециклиране","recycling"))+" "+fmt(F.RelM,0)+" mg/"+T_(L("ден","day"))},
        upd(dt,t,F,s,p){aoM.color.copy(cPale).lerp(cRedB,cl((F.HbM-6)/10,0,1));
          fE.set(cEPO,t*0.035,epoN(s.EPO)+2,0.05);fF.set(cFe,t*0.03,Math.round(cl(F.Abs*6,0,24)),0.05);fR.set(cRt,t*0.04,Math.round(cl(F.retPct*4,0,18)),0.05);
          fO.set(cOld,t*0.05,Math.round(cl(F.Destr/0.125*3,0,18)),0.04);fH.set(cHep,t*0.035,Math.round(cl(6*s.Hep,0,18)),0.05)}}});
    /* ================= S1: бъбречна кора (µm) ================= */
    SN.push(function(){const g=new T.Group(),NC=lo?11:13,NZ=lo?6:8,LZ=80,dz=LZ/NZ,rI=9.5,rO=26,dA=2*Math.PI/NC,TX=31,NCe=2*NC*NZ;
      const wg=new T.BoxGeometry(1,1,1,lo?3:5,lo?3:4,lo?2:4),P=wg.attributes.position;
      for(let i=0;i<P.count;i++){const bx=P.getX(i),by=P.getY(i),bz=P.getZ(i),e=Math.pow(Math.abs(2*by),6),th=-bx*dA*0.985*(1-0.14*e),r=rI+(by+0.5)*(rO-rI)+(by>0.49?1.1*(1-4*bx*bx)*(1-4*bz*bz):0);P.setXYZ(i,r*Math.cos(th),r*Math.sin(th),bz*dz*0.985*(1-0.1*e))}
      wg.computeVertexNormals();
      const imC=imesh(wg,mat(0xffffff,{roughness:0.62,clearcoat:0}),NCe,g),imN=imesh(new T.SphereGeometry(2.3,12,9),mat(0xffffff,{roughness:0.7,clearcoat:0}),NCe,g),cC=C(0xd99aa6),cNu=C(0x6a5a96);
      for(let i=0;i<NCe;i++){_c.copy(cC).multiplyScalar(0.9+0.16*hash(i,1));imC.setColorAt(i,_c);imN.setColorAt(i,cNu)}
      const bbM=tis([[0.78,0.5,0.58],[0.62,0.36,0.45],[0.86,0.62,0.68]],{sc:3,bump:0.7}),bb=[-TX,TX].map(x=>{const gg=rest(new T.CylinderGeometry(rI,rI,LZ,36,1,true).rotateX(Math.PI/2)),o=new T.Mesh(gg,bbM);o.position.x=x;g.add(o);return o});
      const bmM=ghost(0xe3b8c0,0.16),bm=[-TX,TX].map(x=>{const o=new T.Mesh(new T.CylinderGeometry(rO+1.4,rO+1.4,LZ,48,1,true).rotateX(Math.PI/2),bmM);o.position.x=x;g.add(o);return o});
      let lastKS=-1;const layout=kS=>{let k=0;for(let j=0;j<2;j++){const cx=j?TX:-TX;for(let kz=0;kz<NZ;kz++)for(let kc=0;kc<NC;kc++,k++){const th=kc*dA+(kz%2)*dA*0.5+j*0.7,z=-LZ/2+(kz+0.5)*dz;
          _q.setFromAxisAngle(AX,th);put(imC,k,cx,0,z,_q,kS,kS,1);{const tn=th+(hash(k,2)-0.5)*0.12,rn=(20.6+(hash(k,3)-0.5)*1.2)*kS;put(imN,k,cx+Math.cos(tn)*rn,Math.sin(tn)*rn,kz===NZ-1?z+dz*0.49-0.6:z+(hash(k,4)-0.5)*1.6,qI,kS,kS*1.1,1.3)}}}fin(imC,NCe);fin(imN,NCe);
        bb.forEach(o=>o.scale.set(kS,kS,1));bm.forEach(o=>o.scale.set(kS,kS,1))};
      const cap=new T.Mesh(new T.CylinderGeometry(4.6,4.6,LZ+14,28,1,true).rotateX(Math.PI/2),ghost(0xe8a7ae,0.3));cap.position.y=-5;g.add(cap);
      const NRB=14,imR=imesh(gN,rbM,NRB,g),qT=new T.Quaternion().setFromAxisAngle(AXX,0.25);
      /* три интерстициални фибробласта (REPC) с израстъци по базалната мембрана на тубулите и до капиляра */
      const RZ=[-24,0,24],RP=RZ.map((z,k)=>{const m=mat(0xb7a3c9,{roughness:0.55,transparent:true,opacity:0.72,depthWrite:false,emissive:C(0x845ef7),emissiveIntensity:0}),nm=mat(0x5c4a8a,{emissive:C(0x845ef7),emissiveIntensity:0});
        const body=new T.Mesh(blob(1,24,16,0.08,1.3),m);body.scale.set(5,2.3,3.6);body.position.set(0,13.5,z);body.renderOrder=2;g.add(body);
        const nu=new T.Mesh(new T.SphereGeometry(1,16,12),nm);nu.scale.set(3,1.3,2.2);nu.position.set(0,13.5,z);g.add(nu);
        const den=[[V(0,11.6,z),V(0,6,z+1),V(0,0.2,z+2)]];[-1,1].forEach(sg=>{const a=[V(sg*3.5,13.6,z)];for(let q=0;q<=4;q++){const th=0.5+q*0.13;a.push(V(sg*(TX-27*Math.cos(th)),27*Math.sin(th),z+sg*q*1.4))}den.push(a);den.push([V(sg*3.2,12.8,z),V(sg*4.5,7,z-2*sg),V(sg*4.4,-1.5,z-3*sg)])});
        den.forEach(pts=>{const o=MK.taper(T,new T.CatmullRomCurve3(pts),0.85,0.2,{seg:14,rad:6,mat:m});o.renderOrder=2;g.add(o)});
        return {m,nm,fl:zFlow(T,g,14,0x1c7ed6,0.6),cur:CR([[0,13.5,z],[0,7,z+1.5],[0,-1,z+3],[0,-5,z+8],[0,-5,z+18],[0,-5,LZ/2+8]])}});
      const NCo=44,imK=imesh(new T.CylinderGeometry(0.28,0.28,12,5,1),mat(0x9a8f96,{roughness:0.8,clearcoat:0}),NCo,g);
      {let k=0,tr=0;while(k<NCo&&tr<4000){tr++;const x=(hash(tr,11)-0.5)*8,y=-14+hash(tr,12)*24,z=(hash(tr,13)-0.5)*76;if(Math.hypot(x,y+5)<5.6||Math.hypot(x+TX,y)<27.6||Math.hypot(x-TX,y)<27.6||Math.abs(y-13.5)<3.5&&RZ.some(zz=>Math.abs(z-zz)<5))continue;
        _q.setFromEuler(new T.Euler(Math.PI/2+(hash(tr,14)-0.5)*1.2,(hash(tr,15)-0.5)*1.2,0));put(imK,k,x,y,z,_q,1);k++}}
      const cAct=C(0xb7a3c9),cIn=C(0x8f8a94);let nAct=3;
      const lab=[[T_(L("проксимален тубул","proximal tubule")),V(-TX,29,LZ/2),1],[T_(L("четков ръб","brush border")),V(-TX,-11,LZ/2+2),0],[T_(L("перитубулен капиляр","peritubular capillary")),V(0,-12,LZ/2+4),1],
        [T_(L("фибробласт (REPC) → EPO","fibroblast (REPC) → EPO")),V(0,19,24),1],[T_(L("ядро: HIF-2α","nucleus: HIF-2α")),V(10,16,0),0]],labF=lab.concat([[T_(L("колаген (фиброза)","collagen (fibrosis)")),V(5,-14,10),1]]);
      return {g,tg:V(0,4,6),r:135,th:0.38,phi:1.3,sb:[20,"20 µm"],lab,labF,
        live(F,s,p){return "PaO₂ "+fmt(F.PaO2,0)+" mmHg · SaO₂ "+fmt(F.SaO2*100,0)+" % · "+T_(L("доставка на O₂ (Hb × SaO₂)","O₂ delivery (Hb × SaO₂)"))+" "+fmt(F.DO2,1)+" · EPO "+fmt(s.EPO,s.EPO<100?1:0)+" mU/mL · "+T_(L("активни фибробласти","active fibroblasts"))+" "+nAct+"/3"},
        upd(dt,t,F,s,p){const kd=cl(p.kid/100,0,1),kS=0.82+0.18*kd;if(Math.abs(kS-lastKS)>0.002){lastKS=kS;layout(kS)}
          nAct=kd>=0.99?3:(kd>0?Math.max(1,Math.round(3*kd)):0);const hyp=cl((15-F.DO2)/8,0,1),nE=epoN(Math.max(0,s.EPO-F.EPOexo));
          RP.forEach((r,k)=>{const on=k<nAct;r.m.color.copy(on?cAct:cIn);r.nm.emissiveIntensity=on?0.25+2.2*hyp:0;r.m.emissiveIntensity=on?0.6*hyp:0;r.fl.set(r.cur,t*0.16+k*0.31,on?nE:0,0.9)});
          const n=Math.round(cl(9*F.Hct/0.45,2,NRB)),Lz=LZ+10;cRbc.copy(cOx).lerp(cDe,cl((0.97-F.SaO2)/0.35,0,1));
          for(let i=0;i<n;i++){const z=((i/n+t*0.05)%1)*Lz-Lz/2;put(imR,i,0.3*Math.sin(i*2.3),-5+0.4*Math.cos(i*1.7),z,qT,0.92*Math.cbrt(s.MCV/90));imR.setColorAt(i,cRbc)}fin(imR,n);
          fin(imK,Math.round(NCo*cl((1-kd)*1.1,0,1)));this.cur=kd<0.6?labF:lab}}});
    /* ================= S2: еритробластен остров (µm) ================= */
    SN.push(function(){const g=new T.Group(),NS=12,RM=10,TM=3*P_.tauM,SY=-30;
      const macM=mat(0xc99aa3,{roughness:0.6}),mac=new T.Mesh(blob(RM,lo?36:56,lo?24:40,0.12,1.8),macM);g.add(mac);
      const dirs=[];for(let k=0;k<8;k++){const a=k/8*2*Math.PI+0.2;dirs.push(V(Math.cos(a),0.18*Math.sin(3*a),Math.sin(a)).normalize())}for(let k=0;k<4;k++){const a=k/4*2*Math.PI+0.6;dirs.push(V(Math.cos(a)*0.62,0.78,Math.sin(a)*0.62).normalize())}
      const RANK=[0,6,2,8,1,7,3,9,4,10,5,11],qd=dirs.map(d=>new T.Quaternion().setFromUnitVectors(AX,d));
      /* рамене на макрофага, обгръщащи еритробластите (опростено) */
      const ARM=dirs.map(()=>[]);dirs.forEach((d,k)=>{const sd=V(0,1,0).cross(d);if(sd.lengthSq()<0.01)sd.set(1,0,0);sd.normalize();const c=d.clone().multiplyScalar(RM+6.2);(lo?[1]:[1,-1]).forEach(sg=>{const pts=[d.clone().multiplyScalar(RM*0.92)];
        for(let j=0;j<=5;j++){const f=0.25+j*0.3;pts.push(c.clone().addScaledVector(d,-6.9*Math.cos(f)).addScaledVector(sd,sg*6.9*Math.sin(f)).addScaledVector(V(0,1,0),(k%2?0.8:-0.8)*j*0.3))}
        {const o=MK.taper(T,new T.CatmullRomCurve3(pts),1.3,0.35,{seg:16,rad:6,mat:macM});o.visible=false;ARM[k].push(o);g.add(o)}})});
      const imE=imesh(blob(1,lo?18:26,lo?12:18,0.05,2),mat(0xffffff,{roughness:0.65,clearcoat:0}),NS,g),imU=imesh(blob(1,16,12,0.09,3),mat(0xffffff,{roughness:0.4}),NS,g),imRt=imesh(gN,rbM,NS,g);
      const cB0=C(0x6a6fa0),cB1=C(0x8f6f9a),cHb=C(0xb3262e),cDie=C(0x4a3a48),cN0=C(0x7a68b0),cN1=C(0x2f2550),PH=new Float32Array(NS),OC=new Float32Array(NS);for(let k=0;k<NS;k++)PH[k]=hash(k,21)*TM;
      const sin=new T.Mesh(new T.CylinderGeometry(9.6,9.6,110,36,1,true).rotateZ(Math.PI/2),ghost(0xeab3ba,0.34));sin.position.y=SY;g.add(sin);
      const NSR=10,imS=imesh(gN,rbM,NSR,g),AXr=[];for(let i=0;i<NSR;i++)AXr.push(V(hash(i,31)-0.5,hash(i,32)-0.5,hash(i,33)-0.5).normalize());
      const cEp=CR([[-25,SY,0],[-22,SY+9,3],[-16,-10,8],[-9,-2,13],[-4,4,14]]),cTf=CR([[25,SY,0],[22,SY+9,3],[16,-9,9],[9,0,13]]),fE=zFlow(T,g,14,0x1c7ed6,0.6),fT=zFlow(T,g,16,0x748ffc,0.7);
      const lP=V(0,0,0),lO=V(0,0,0),lR=V(0,0,0),tPro=T_(L("проеритробласт","proerythroblast")),tMeg=T_(L("мегалобласт","megaloblast")),
        lab=[[tPro,lP,1],[T_(L("ортохроматичен еритробласт","orthochromatic erythroblast")),lO,0],[T_(L("ретикулоцит → синусоид","reticulocyte → sinusoid")),lR,0],[T_(L("централен макрофаг","central macrophage")),V(-3,-RM*0.75,RM*0.8),1],[T_(L("синусоид","sinusoid")),V(-42,SY,11),1]];
      let ret0=-1;
      return {g,tg:V(0,-5,0),r:100,th:0.25,phi:1.3,sb:[10,"10 µm"],lab,
        live(F,s){return T_(L("продукция","production"))+" ×"+fmt(F.Pcom/P_.J0,1)+" · "+T_(L("ефективна","effective"))+" "+fmt(F.fB*100,0)+" % · TSAT "+fmt(F.TSAT,0)+" % · EPO "+fmt(s.EPO,s.EPO<100?1:0)+" mU/mL · "+T_(L("ретикулоцити","reticulocytes"))+" "+fmt(F.retPct,1)+" %"},
        upd(dt,t,F,s,p){const nA=Math.round(cl(8+5*Math.log2(Math.max(0.05,F.Pcom/P_.J0)),3,NS)),meg=cl(1-F.fB,0,1),fe=cl(F.fFe,0.12,1),mcv=Math.cbrt(s.MCV/90);
          let ne=0,nu=0,nr=0,aMin=9,aMax=-1;lP.x=lO.x=-500;ret0=-1;lab[0][0]=meg>0.3?tMeg:tPro;
          for(let k=0;k<NS;k++){OC[k]+=((RANK[k]<nA?1:0)-OC[k])*Math.min(1,dt*0.8);const oc=OC[k];for(const o of ARM[k])o.visible=oc>0.5;if(oc<0.02)continue;const d=dirs[k],tt=s.t+PH[k],cyc=Math.floor(tt/TM),a=tt/TM-cyc;
            const die=hash(k,cyc)<meg*0.8,dd=die?sm(0.55,0.78,a):0;
            let rc=(8-3.6*sm(0,0.9,a))*(1+0.22*meg);if(a>0.5)rc*=lerp(1,0.86+0.14*fe,sm(0.5,0.9,a));
            const gr=sm(0,0.06,a)*oc*(1-dd),e=sm(0.86,0.95,a),q2=sm(0.95,1,a),cen=RM+rc*0.92;
            if(a<0.95&&gr>0.01){_c.copy(cB0).lerp(cB1,sm(0.25,0.6,a)).lerp(cHb,sm(0.3,0.9,a)*fe).lerp(cDie,dd);imE.setColorAt(ne,_c);
              _v.copy(d).multiplyScalar(cen);_s.set(rc*gr,rc*gr,rc*gr*(1+0.25*e));_m.compose(_v,qd[k],_s);imE.setMatrixAt(ne++,_m);
              const dq=d.dot(_cd);if(Math.abs(dq)<0.6&&!die&&(a<aMin||a>aMax&&a<0.93)){const L_=a<aMin?(aMin=a,lP):(aMax=a,lO);L_.copy(d).addScaledVector(_cd,-dq).normalize().multiplyScalar(rc+2).addScaledVector(d,cen)}}
            const nf=lerp(0.78,0.42,sm(0.1,0.85,a*(1-0.45*meg)));
            if(gr>0.01||q2>0&&q2<1&&!die){const nr0=rc*nf*(1-0.7*q2)*(a>=0.95?oc:gr);_v.copy(d).multiplyScalar(lerp(cen+rc*(1.04-nf)*(1-e)-rc*0.55*e,RM*0.7,q2));_c.copy(cN0).lerp(cN1,sm(0.4,0.9,a*(1-0.5*meg)));imU.setColorAt(nu,_c);_s.setScalar(Math.max(0.01,nr0));_m.compose(_v,qI,_s);imU.setMatrixAt(nu++,_m)}
            const ca=a>=0.95?cyc:cyc-1,rp=((a-0.95+1)%1)/0.3;
            if(rp<1&&hash(k,ca)>=meg&&oc>0.3){const x0=d.x*(RM+4.6),y0=d.y*(RM+4.6),z0=d.z*(RM+4.6),x3=Math.min(52,x0+30);let sq=0;
              if(rp<0.45){const u=sm(0,1,rp/0.45);_v.set(lerp(x0,x0,u),lerp(y0,SY+10.5,u),lerp(z0,z0*0.3,u))}else if(rp<0.6){const u=(rp-0.45)/0.15;sq=Math.sin(u*Math.PI);_v.set(x0,lerp(SY+10.5,SY,u),lerp(z0*0.3,z0*0.15,u))}else{const u=(rp-0.6)/0.4;_v.set(lerp(x0,x3,u),SY+2*Math.sin(u*3+k),z0*0.15)}
              _q.setFromUnitVectors(AX,AY);if(rp>=0.6){_q2.setFromAxisAngle(AXX,t*0.8+k);_q.multiply(_q2)}const sc=1.06*mcv*sm(0,0.08,rp);_s.set(sc*(1+0.2*sq),sc*(1+0.2*sq),sc*(1-0.55*sq));_m.compose(_v,_q,_s);imRt.setMatrixAt(nr,_m);imRt.setColorAt(nr++,cRet);if(ret0<0&&rp>0.1&&rp<0.5){ret0=k;lR.copy(_v).add(_v2.set(6,2,0))}}}
          fin(imE,ne);fin(imU,nu);fin(imRt,nr);if(ret0<0)lR.set(-500,0,0);
          cRbc.copy(cOx).lerp(cDe,cl((0.97-F.SaO2)/0.35,0,1));const nS=Math.round(cl(NSR*F.Hct/0.45,2,NSR));
          for(let i=0;i<nS;i++){_q.setFromAxisAngle(AXr[i],t*0.6+i);put(imS,i,((i/NSR+t*0.03)%1)*106-53,SY+4*Math.sin(i*2.1),4*Math.cos(i*1.3),_q,mcv);imS.setColorAt(i,cRbc)}fin(imS,nS);
          fE.set(cEp,t*0.12,epoN(s.EPO),1.2);fT.set(cTf,t*0.1,Math.round(cl(F.TSAT/2.5,0,16)),1.2)}}});
    /* ================= S3: кръв във венула (µm) ================= */
    SN.push(function(){const g=new T.Group(),Rv=11,LV=90,NM=lo?110:210;
      const wallG=(R,a0,a1,nx,na)=>{const pos=[],idx=[];for(let i=0;i<=nx;i++)for(let j=0;j<=na;j++){const x=-LV/2-4+(LV+8)*i/nx,a=a0+(a1-a0)*j/na;pos.push(x,R*Math.cos(a),R*Math.sin(a))}for(let i=0;i<nx;i++)for(let j=0;j<na;j++){const A=i*(na+1)+j,B=A+na+1;idx.push(A,B,A+1,B,B+1,A+1)}
        const gg=new T.BufferGeometry();gg.setAttribute("position",new T.Float32BufferAttribute(pos,3));gg.setIndex(idx);gg.computeVertexNormals();return rest(gg)};
      g.add(new T.Mesh(wallG(Rv+0.6,0.92*Math.PI,2.08*Math.PI,60,40),tis([[0.9,0.66,0.68],[0.8,0.52,0.56],[0.95,0.76,0.77]],{sc:0.35,bump:0.35})));
      const NEn=14,imEn=imesh(new T.SphereGeometry(1,14,10),mat(0xffffff,{roughness:0.45}),NEn,g),cEn=C(0x8f7aa8);
      for(let k=0;k<NEn;k++){const a=(1.08+0.84*hash(k,51))*Math.PI,x=-LV/2+LV*(k+hash(k,52))/NEn;_v2.set(0,-Math.cos(a),-Math.sin(a));_q.setFromUnitVectors(AX,_v2);put(imEn,k,x,(Rv+0.3)*Math.cos(a),(Rv+0.3)*Math.sin(a),_q,4.5,1.8,0.9);imEn.setColorAt(k,cEn)}fin(imEn,NEn);
      /* места на клетките: центровете са до Rv−3,4 µm (дискът не опира стената; броят се смята за лумен без 1 µm безклетъчен слой);
         дисковете са ориентирани с нормала почти по оста → разстояние ≥ 3,4 µm по оста и ≥ 7 µm напречно (сплеснат елипсоид), периодично по оста */
      const X0=new Float32Array(NM),Y0=new Float32Array(NM),Z0=new Float32Array(NM),VS=new Float32Array(NM),RT=new Float32Array(NM),AXc=[],Q0=[];
      for(let i=0,tr=0;i<NM;i++){let bx=0,by=0,bz=0,bq=-1;for(let k=0;k<70&&bq<1;k++){tr++;const rr=(Rv-3.4)*Math.sqrt(hash(tr,61)),a=hash(tr,62)*6.2832,x=(hash(tr,63)-0.5)*LV,y=rr*Math.cos(a),z=rr*Math.sin(a);let q=9;
          for(let j=0;j<i;j++){let dx=Math.abs(x-X0[j]);dx=Math.min(dx,LV-dx);const m=dx*dx/11.6+((y-Y0[j])**2+(z-Z0[j])**2)/49;if(m<q)q=m}if(q>bq){bq=q;bx=x;by=y;bz=z}}
        X0[i]=bx;Y0[i]=by;Z0[i]=bz;VS[i]=6;RT[i]=0.3+0.5*hash(i,64);AXc.push(V(hash(i,65)-0.5,hash(i,66)-0.5,hash(i,67)-0.5).normalize());Q0.push(new T.Quaternion().setFromUnitVectors(AX,V(1,(hash(i,68)-0.5)*0.5,(hash(i,69)-0.5)*0.5).normalize()))}
      const imN=imesh(gN,rbM,NM,g),imSp=imesh(gS,rbM,Math.round(NM*0.3),g),imFr=imesh(gF,rbM,Math.round(NM*0.1),g),cSp=C(0x9e1f2a);
      const neu=new T.Group();g.add(neu);neu.add(new T.Mesh(blob(6,lo?24:36,lo?16:24,0.05,4),ghost(0xe6dbe8,0.5,{side:T.FrontSide,roughness:0.7})));
      const imL=imesh(blob(1,14,10,0.1,2),mat(0x5c4a8a,{roughness:0.45}),6,neu);
      const NPl=8,imPl=imesh(gN,mat(0xffffff,{roughness:0.5}),NPl,g),cPl=C(0xb49fcf);for(let i=0;i<NPl;i++)imPl.setColorAt(i,cPl);
      const wrapX=x=>{x=(x+LV/2)%LV;if(x<0)x+=LV;return x-LV/2};let nVis=0,lastLob=-1;
      const lR=V(0,0,0),lS=V(0,0,0),lN=V(0,0,0),lPl=V(0,0,0),
        lab=[[T_(L("еритроцит: двойновдлъбнат диск","red cell: biconcave disc")),V(-28,Rv+4,2),1],[T_(L("ретикулоцит","reticulocyte")),lR,1],[T_(L("неутрофил","neutrophil")),lN,1],[T_(L("тромбоцит","platelet")),lPl,0],[T_(L("ендотел (стената е срязана отпред)","endothelium (wall cut away at front)")),V(24,-Rv-3,-3),0]],
        labH=lab.concat([[T_(L("сфероцит / фрагмент","spherocyte / fragment")),lS,1]]),tNeu=T_(L("неутрофил","neutrophil")),tNeuH=T_(L("хиперсегментиран неутрофил","hypersegmented neutrophil"));
      return {g,tg:V(0,0,0),r:62,th:-0.35,phi:1.35,sb:[10,"10 µm"],lab,
        live(F,s){return "Hct "+fmt(F.Hct*100,0)+" % · MCV "+fmt(s.MCV,0)+" fL · "+T_(L("ретикулоцити","reticulocytes"))+" "+fmt(F.retPct,1)+" % · SaO₂ "+fmt(F.SaO2*100,0)+" % · "+T_(L("клетки в кадъра","cells in view"))+" "+nVis},
        upd(dt,t,F,s,p){const mcv=Math.cbrt(s.MCV/90),N=Math.min(NM,Math.round(0.75*F.Hct*Math.PI*(Rv-1)*(Rv-1)*LV/s.MCV)),fR=cl(F.retPct/100,0,0.3),hem=cl((70-p.life)/50,0,1),fS=0.25*hem,fF=0.06*hem,meg=cl(1-F.fB,0,1);nVis=N;
          cRbc.copy(cOx).lerp(cDe,cl((0.97-F.SaO2)/0.35,0,1));let nn=0,ns=0,nf=0,gotR=false,gotS=false;
          for(let i=0;i<N;i++){const x=wrapX(X0[i]+VS[i]*t),u=hash(i,7);_q.setFromAxisAngle(AXc[i],0.18*Math.sin(RT[i]*t+i));_q2.copy(Q0[i]).multiply(_q);_v.set(x,Y0[i],Z0[i]);
            if(u<fR){_s.setScalar(1.07*mcv);_m.compose(_v,_q2,_s);imN.setMatrixAt(nn,_m);imN.setColorAt(nn++,cRet);if(!gotR&&Z0[i]>0&&x>-30&&x<30){gotR=true;lR.set(x,Y0[i]+5,Z0[i])}}
            else if(u<fR+fS){_s.setScalar(mcv);_m.compose(_v,_q2,_s);imSp.setMatrixAt(ns,_m);imSp.setColorAt(ns++,cSp);if(!gotS&&x>-30&&x<30){gotS=true;lS.set(x,Y0[i]-5,Z0[i])}}
            else if(u<fR+fS+fF){_s.setScalar(mcv);_m.compose(_v,_q2,_s);imFr.setMatrixAt(nf,_m);imFr.setColorAt(nf++,cRbc)}
            else{const ov=hash(i,9)<0.6*meg?1:0;_s.set(mcv*(1+0.18*ov),mcv*(1-0.08*ov),mcv);_m.compose(_v,_q2,_s);imN.setMatrixAt(nn,_m);_c.copy(cRbc).multiplyScalar(0.93+0.12*hash(i,8));imN.setColorAt(nn++,_c)}}
          fin(imN,nn);fin(imSp,ns);fin(imFr,nf);if(!gotR)lR.set(-500,0,0);if(!gotS)lS.set(-500,0,0);
          /* неутрофил: търкаля се бавно по задната стена; 3 дяла, при дефицит на B12/фолат 6 (хиперсегментация) */
          const nx=wrapX(t*1.2-20),ny=-(Rv-6.4)*0.55,nz=-(Rv-6.4)*0.83;neu.position.set(nx,ny,nz);neu.rotation.z=-t*0.2;lN.set(nx,ny+7.5,nz+2);
          const nl=F.fB<0.5?6:3;if(nl!==lastLob){lastLob=nl;lab[2][0]=nl>3?tNeuH:tNeu;for(let j=0;j<nl;j++){const a=(j-(nl-1)/2)*(nl>3?0.62:0.9);put(imL,j,3.1*Math.sin(a),2.6*Math.cos(a)-1.4,0.6*Math.sin(j*2.1),qI,1.5,1.25,1.25)}fin(imL,nl)}
          for(let i=0;i<NPl;i++){const a=(1.15+0.7*hash(i,71))*Math.PI,x=wrapX(-LV/2+LV*hash(i,72)+t*2.2);_q.setFromAxisAngle(AXc[i],t*0.4+i);put(imPl,i,x,(Rv-2.2)*Math.cos(a),(Rv-2.2)*Math.sin(a),_q,0.33,0.33,0.45);if(i===0)lPl.set(x,(Rv-2.2)*Math.cos(a)-2.5,(Rv-2.2)*Math.sin(a)+2)}fin(imPl,NPl);
          this.cur=hem>0.05?labH:lab}}});
    /* ================= S4: дуоденален ентероцит (µm; белтъците — уголемени) ================= */
    SN.push(function(){const g=new T.Group(),HX=3.85,HY=12.5,CY=-21;
      const cg=new T.BoxGeometry(2*HX,2*HY,2*HX,lo?4:6,lo?8:14,lo?4:6),P=cg.attributes.position;
      for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);const ax=Math.abs(x)/HX,az=Math.abs(z)/HX;if(ax>0.999||az>0.999){const q=Math.pow(Math.pow(ax,4)+Math.pow(az,4),0.25);x/=q;z/=q}
        if(Math.abs(y)>HY-0.01){const r=Math.max(ax,az);y=Math.sign(y)*(HY-0.9*Math.pow(r,4))+(y>0?0.6*(1-ax*ax)*(1-az*az):0)}P.setXYZ(i,x,y,z)}cg.computeVertexNormals();rest(cg);
      const eP=[[0.88,0.62,0.66],[0.78,0.5,0.56],[0.94,0.74,0.77]],eM=tis(eP,{sc:0.5}),clipP=new T.Plane(V(0,0,-1),0.6),eMc=tis(eP,{sc:0.5});eMc.clippingPlanes=[clipP];
      [-16,-8,0,8,16].forEach(x=>{const o=new T.Mesh(cg,x?eM:eMc);o.position.x=x;g.add(o)});
      const nuc=new T.Mesh(new T.SphereGeometry(1,20,14),mat(0x5c4a8a,{roughness:0.45,clippingPlanes:[clipP],side:T.DoubleSide}));nuc.scale.set(2.3,4.4,2.3);nuc.position.set(0,-6,0);g.add(nuc);
      const gv=lo?4:6,NMv=5*gv*gv,imV=imesh(new T.CylinderGeometry(0.14,0.14,1.5,5,1),mat(0xd9a1ad,{roughness:0.6,clearcoat:0}),NMv,g);{let k=0;[-16,-8,0,8,16].forEach(cx=>{for(let a=0;a<gv;a++)for(let b=0;b<gv;b++){const x=(a+0.5)/gv*2-1,z=(b+0.5)/gv*2-1;if(!cx&&z*HX*0.85>0.6)continue;put(imV,k++,cx+x*HX*0.85,HY+0.6*(1-x*x*0.8)*(1-z*z*0.8)+0.55,z*HX*0.85,qI,1)}});fin(imV,k)}
      const bmb=new T.Mesh(new T.BoxGeometry(46,0.4,10),ghost(0xc9a3ad,0.45));bmb.position.y=-HY-0.9;g.add(bmb);
      const capM=ghost(0xe8a7ae,0.3),capm=new T.Mesh(new T.CylinderGeometry(4,4,56,28,1,true).rotateZ(Math.PI/2),capM);capm.position.y=CY;g.add(capm);
      const prot=(h,sx,sy,x,y)=>{const o=new T.Mesh(blob(1,16,12,0.07,2),mat(h,{roughness:0.45}));o.scale.set(sx,sy,sx);o.position.set(x,y,0.4);g.add(o);return o};
      prot(0x3b5bdb,0.85,1.6,-1.6,HY+0.4);prot(0xe599f7,0.7,1.2,1.6,HY+0.5);prot(0xf783ac,0.8,0.8,-1.75,-HY-1.2);prot(0xf783ac,0.8,0.8,1.75,-HY-1.2);
      const FP=mkFPN(g,[V(-0.9,-HY,0.4),V(0.9,-HY,0.4),V(-2.6,-HY,0.4),V(2.6,-HY,0.4)],V(0,-1,0));
      const cL=CR([[1.6,24,0.6],[1.8,19,0.8],[1.6,HY+1.7,0.6]]),cA=CR([[1.6,HY+1.3,0.6],[0,HY+1.8,0.7],[-1.6,HY+1.4,0.6],[-1.6,HY-1.4,0.7],[-1.2,4,0.9],[-0.6,-5,0.9],[-0.9,-HY+1.6,0.7],[-0.9,-HY+0.3,0.6]]),
        cS=CR([[-1.6,HY-1.4,0.7],[-0.4,9,1.0],[1.4,6,1.0]]),cO=CR([[-0.9,-HY-1.5,0.6],[-1.4,-16,0.7],[-0.5,-18.5,0.6],[1,CY,0.5]]),cH=CR([[-28,CY+1,0],[28,CY-1,0]]);
      const fL=zFlow(T,g,24,0x7b2d26,0.42),fA=zFlow(T,g,24,0xa5532a,0.42),fS=zFlow(T,g,14,0xa5532a,0.42),fO=zFlow(T,g,24,0x7b2d26,0.42);[fL,fA,fS,fO].forEach(f=>{f.mt.emissiveIntensity=0.25});const fH=zFlow(T,g,14,0x7048e8,0.42);
      const NFr=16,imFr=imesh(new T.IcosahedronGeometry(0.75,1),ferM,NFr,g);for(let i=0;i<NFr;i++){const a=hash(i,81)*6.28,r=0.8+2.2*Math.sqrt(hash(i,82));put(imFr,i,1.8+r*Math.cos(a),5.5+r*Math.sin(a)*1.3,0.2+1.4*hash(i,83),qI,1)}
      const TF=mkTf(g,lo?8:12,(u,o,i)=>o.set(-26+52*u,CY+2.2*Math.sin(i*2.1),2.2*Math.cos(i*1.3))),NRc=6,qX=new T.Quaternion().setFromUnitVectors(AX,AXX),imR=imesh(gN,rbM,NRc,g);
      let nFree=4;
      const lab=[[T_(L("лумен: Fe³⁺ от храната","lumen: dietary Fe³⁺")),V(1.6,25,0.6),1],[T_(L("Dcytb: Fe³⁺ → Fe²⁺","Dcytb: Fe³⁺ → Fe²⁺")),V(6,HY+4.5,0.6),0],[T_(L("DMT1 (Fe²⁺ + H⁺)","DMT1 (Fe²⁺ + H⁺)")),V(-6,HY+4.5,0.6),1],[T_(L("феритин (запас)","ferritin (store)")),V(5.6,6,1),1],
        [T_(L("феропортин","ferroportin")),V(-6,-HY+1,0.6),1],[T_(L("хепцидин","hepcidin")),V(6,-HY-2.4,0.6),1],[T_(L("хефестин","hephaestin")),V(-1.75,-HY-2.6,0.6),0],[T_(L("капиляр: трансферин","capillary: transferrin")),V(-15,CY-6,0),1],[T_(L("ентероцит (срязан)","enterocyte (cut open)")),V(-16,4,4.5),0]];
      return {g,tg:V(0,-1,0),r:72,th:0.3,phi:1.42,sb:[10,"10 µm"],lab,
        live(F,s){return T_(L("резорбция","absorption"))+" "+fmt(F.Abs,1)+" mg/"+T_(L("ден","day"))+" · "+T_(L("хепцидин","hepcidin"))+" ×"+fmt(s.Hep,2)+" · "+T_(L("свободен феропортин","free ferroportin"))+" "+nFree+"/4 · TSAT "+fmt(F.TSAT,0)+" %"},
        upd(dt,t,F,s,p){FP.upd(dt,F.fFP);nFree=FP.nFree;const imp=F.Abs/Math.max(0.05,F.fFP)*Math.max(1,F.fFP),ret=Math.max(0,imp-F.Abs),nO=nFree?Math.round(cl(F.Abs*5,0,24)):0;
          fL.set(cL,t*0.22,Math.round(cl(imp*5,1,24)),0.5);fA.set(cA,t*0.12,nO,0.3);fS.set(cS,t*0.15,Math.round(cl(ret*5,0,14)),0.3);fO.set(cO,t*0.2,nO,0.25);fH.set(cH,t*0.05,Math.round(cl(3*s.Hep,0,14)),2.4);
          fin(imFr,Math.round(cl(2+ret*6,1,NFr)));TF.upd(t,0.04,F.TSAT);cRbc.copy(cOx).lerp(cDe,cl((0.97-F.SaO2)/0.35,0,1));
          for(let i=0;i<NRc;i++){_q.setFromAxisAngle(AXX,0.4*Math.sin(t*0.5+i));_q.multiply(qX);put(imR,i,((i/NRc+t*0.04)%1)*52-26,CY+0.3*Math.sin(i*1.9),-0.3*Math.cos(i*1.1),_q,0.85*Math.cbrt(s.MCV/90));imR.setColorAt(i,cRbc)}fin(imR,NRc)}}});
    /* ================= S5: червена пулпа на слезката (µm) ================= */
    SN.push(function(){const g=new T.Group(),RM=13,SX=30,SR=11,SL=72,NSt=lo?12:16;
      const macM=mat(0xe3bcc0,{transparent:true,opacity:0.35,depthWrite:false,roughness:0.55,emissive:C(0xe3bcc0),emissiveIntensity:0.12}),mac=new T.Mesh(blob(RM,lo?36:52,lo?24:36,0.13,1.5),macM);mac.renderOrder=3;g.add(mac);
      const mnu=new T.Mesh(blob(1,20,14,0.1,2),mat(0x5c4a8a,{roughness:0.45}));mnu.scale.set(4.5,3,3.2);mnu.position.set(-5,3,-3);g.add(mnu);
      const plM=mat(0x8f2a3a,{roughness:0.5}),pl=new T.Mesh(new T.SphereGeometry(3.2,20,14),plM);pl.position.set(1,-3,2);g.add(pl);
      const imSt=imesh(new T.CylinderGeometry(1.1,1.1,SL,10,1),mat(0xffffff,{roughness:0.55}),NSt,g),cSt=C(0xd9a6b0);let k=0;
      for(let j=0;j<NSt;j++){const f=(j+0.5)/NSt*2*Math.PI;if(Math.sin(f)>0.35)continue;_q.setFromAxisAngle(AY,-f);put(imSt,k,SX+SR*Math.cos(f),0,SR*Math.sin(f),_q,1,1,lo?2.1:1.5);imSt.setColorAt(k++,cSt)}fin(imSt,k);
      const rfM=mat(0x9a8f96,{roughness:0.7,clearcoat:0});[-27,-9,9,27].forEach(y=>{const o=new T.Mesh(new T.TorusGeometry(SR+1.5,0.45,6,48,Math.PI*1.25),rfM);o.rotation.x=Math.PI/2;o.rotation.z=Math.PI*0.37;o.position.set(SX,y,0);g.add(o)});
      const NP=8,imP=imesh(gN,rbM,NP,g),imSp=imesh(gS,rbM,4,g),imO=imesh(gS,rbM,1,g),cOld=C(0x7d2240),cSp=C(0x9e1f2a),cPl0=C(0x8f2a3a),cPl1=C(0x6b3a2e);
      const FPp=[-1.5,1.5,-4.5,4.5].map(y=>V(Math.sqrt(RM*RM-y*y-4)*1.02,y,2)),FP=mkFPN(g,FPp,V(1,0,0)),xF=FPp[0].x;
      const cM=CR([[1,-3,2],[6,-2.6,2.6],[10,-1.8,2.3],[xF-0.6,-1.5,2]]),cX=CR([[xF+1.4,-1.5,2],[16,-1.5,1],[19,-1.2,0],[23,-3,0.5],[28,-8,1]]),cHp=CR([[SX-3,36,2],[SX-2,-36,2]]);
      const fM=zFlow(T,g,22,0xa5532a,0.42),fX=zFlow(T,g,22,0x7b2d26,0.42);fM.mt.emissiveIntensity=fX.mt.emissiveIntensity=0.25;const fH=zFlow(T,g,14,0x7048e8,0.42);
      const NFr=24,imFr=imesh(new T.IcosahedronGeometry(0.75,1),ferM,NFr,g);for(let i=0;i<NFr;i++){const a=hash(i,91)*6.28,b=Math.acos(2*hash(i,92)-1),r=3+5.5*Math.cbrt(hash(i,93));put(imFr,i,-1.5+r*Math.sin(b)*Math.cos(a),-1+r*Math.cos(b),2+r*Math.sin(b)*Math.sin(a)*0.8,qI,1)}
      const TF=mkTf(g,lo?8:12,(u,o,i)=>o.set(SX+1+5*(hash(i,95)-0.5)*2,34-68*u,4*(hash(i,96)-0.5)*2));
      const lO=V(0,0,0),lab=[[T_(L("макрофаг на червената пулпа","red-pulp macrophage")),V(-7,RM+3,0),1],[T_(L("фаголизозома → HRG1 → HO-1: хем → Fe²⁺","phagolysosome → HRG1 → HO-1: haem → Fe²⁺")),V(1,-3,6.5),1],[T_(L("феритин","ferritin")),V(-7,-5,7),1],
        [T_(L("феропортин ⟂ хепцидин","ferroportin ⟂ hepcidin")),V(15,7,2),1],[T_(L("процеп ~1 µm между ендотелните клетки","~1 µm slit between endothelial cells")),V(19,31,0),1],[T_(L("венозен синус (срязан)","venous sinus (cut open)")),V(SX+5,-38,0),0],
        [T_(L("стар еритроцит → фагоцитоза","senescent red cell → phagocytosis")),lO,0],[T_(L("трансферин","transferrin")),V(SX+9,12,5),0]];
      return {g,tg:V(14,0,0),r:82,th:-0.3,phi:1.35,sb:[10,"10 µm"],lab,
        live(F,s){return T_(L("разрушаване","destruction"))+" ×"+fmt(F.Destr/0.125,1)+" · "+T_(L("рециклиране","recycling"))+" "+fmt(F.RelM,0)+" mg/"+T_(L("ден","day"))+" · "+T_(L("феритин","ferritin"))+" "+fmt(F.Fer,0)+" ng/mL · TSAT "+fmt(F.TSAT,0)+" % · "+T_(L("хепцидин","hepcidin"))+" ×"+fmt(s.Hep,2)},
        upd(dt,t,F,s,p){const mcv=Math.cbrt(s.MCV/90),hR=F.Destr/0.125;FP.upd(dt,F.fFP);cRbc.copy(cOx).lerp(cDe,cl((0.97-F.SaO2)/0.35,0,1));
          /* преминаване през процепа: дискът се сплесква по z (процепът е тесен по z) */
          for(let i=0;i<NP;i++){const u=(hash(i,97)+t*0.06)%1,y=-24+i*6.5;let sq=0;
            if(u<0.35){const w=u/0.35;_v.set(lerp(9,16.5,w),y+4*(1-w),lerp(12,0.8,w))}else if(u<0.5){const w=(u-0.35)/0.15;sq=Math.sin(w*Math.PI);_v.set(lerp(16.5,21.5,w),y,lerp(0.8,0,w))}else if(u<0.65){const w=(u-0.5)/0.15;_v.set(lerp(21.5,30,w),y-6*w,2*w)}else{const w=(u-0.65)/0.35;_v.set(30,y-6-20*w,2+w)}
            _q.setFromAxisAngle(AY,(1-sq)*0.5*Math.sin(t*0.7+i));_s.set(mcv*(1+0.3*sq),mcv*(1+0.4*sq),mcv*(1-0.68*sq));_m.compose(_v,_q,_s);imP.setMatrixAt(i,_m);imP.setColorAt(i,cRbc)}fin(imP,NP);
          const nSt=Math.round(cl((hR-1)*0.8,0,4));for(let j=0;j<nSt;j++){_q.setFromAxisAngle(AXX,0.3*Math.sin(t+j));put(imSp,j,17.2+0.25*Math.sin(t*3+j),-18+12*j,0.8,_q,1);imSp.setColorAt(j,cSp)}fin(imSp,nSt);
          const Pp=5/cl(hR,0.5,6),w=(t/Pp)%1;let sc=1;if(w<0.5){const u=sm(0,1,w/0.5);_v.set(lerp(5,3,u),lerp(-17,-9,u),lerp(15,9,u))}else{const u=sm(0,1,(w-0.5)/0.3);_v.set(lerp(3,1,u),lerp(-9,-3,u),lerp(9,2,u));sc=1-0.6*u-0.4*sm(0.8,1,w)}
          _c.copy(cOld).lerp(cPl1,sm(0.5,0.8,w));put(imO,0,_v.x,_v.y,_v.z,qI,Math.max(0.01,sc*mcv));imO.setColorAt(0,_c);fin(imO,1);lO.set(_v.x-2,_v.y-5,_v.z+2);
          plM.color.copy(cPl0).lerp(cPl1,sm(0.6,1,w));
          fM.set(cM,t*0.15,FP.nFree?Math.round(cl(F.RelM/1.5,0,22)):0,0.4);fX.set(cX,t*0.15,FP.nFree?Math.round(cl(F.RelM/1.5,0,22)):0,0.4);fH.set(cHp,t*0.04,Math.round(cl(3*s.Hep,0,14)),6);
          fin(imFr,Math.round(cl(F.Fer/20,1,NFr)));TF.upd(t,0.035,F.TSAT)}}});
    /* ---------- станции, камера, мащаб, бележка ---------- */
    const ST=new Array(SN.length).fill(null),LO=[];let cur=-1,lastPre=null,tp=performance.now()/1000,lastPx=-1,ntT=0,ntS="";
    const sb=document.createElement("div");sb.style.cssText="position:absolute;left:12px;bottom:10px;pointer-events:none;font-size:11px;font-weight:600;color:var(--ink);display:flex;flex-direction:column;gap:3px;align-items:flex-start";
    sb.style.color="#fff";sb.style.textShadow="0 0 3px #000,0 1px 2px #000";sb.innerHTML='<div style="height:3px;border-radius:2px;background:#fff;box-shadow:0 0 3px rgba(0,0,0,.85);width:40px"></div><span></span>';wr.appendChild(sb);const sbBar=sb.firstChild,sbTx=sb.lastChild,tanF=Math.tan(19*Math.PI/180);
    const activate=i=>{if(!ST[i]){ST[i]=SN[i]();sc.add(ST[i].g)}ST.forEach((S,k)=>{if(S)S.g.visible=k===i});cur=i;const S=ST[i];G.flyTo(S.tg.x,S.tg.y,S.tg.z,S.r,S.th,S.phi);sbTx.textContent=S.sb[1];lastPx=-1;ntS="";ntT=1;
      chips.forEach((b,k)=>b.classList.toggle("primary",k===i))};
    const ctx={G,g:G};
    ctx.frame=()=>{const st=get(),s=st.s,p=st.p,now=performance.now()/1000,dt=Math.min(0.05,now-tp);tp=now;
      if(p&&p.pre!==lastPre){lastPre=p.pre;want=PRE[p.pre]||0;tour=false;tb.classList.remove("primary")}
      if(tour){tourT+=dt;if(tourT>7){tourT=0;want=((cur<0?0:cur)+1)%SN.length}}
      if(want<0)want=0;if(want!==cur)activate(want);
      if(!s){G.render([]);return}
      const F=erFlux(s,p),S=ST[cur],phN=G.cv.clientWidth<600;rbH.value=cl(s.hypo||0,0,1);rbK.value=cl(0.7+1.4*(s.hypo||0),0.7,2.0);_cd.copy(G.cam.position).sub(S.tg).normalize();S.upd(dt,now,F,s,p);
      const d=G.cam.position.distanceTo(S.tg),px=S.sb[0]/(2*d*tanF)*G.cv.clientHeight;if(Math.abs(px-lastPx)>0.5){lastPx=px;sbBar.style.width=Math.round(px)+"px"}
      ntT+=dt;if(ntT>0.4){ntT=0;const h="<b>"+T_(STN[cur][1])+"</b> — "+T_(DS[cur])+" <span style=\"opacity:.75\">["+T_(AC[cur])+"]</span><br><span style=\"color:var(--muted)\">"+S.live(F,s,p)+"</span>";if(h!==ntS){ntS=h;nt.innerHTML=h}}
      const lb=S.cur||S.lab;LO.length=0;for(let i=0;i<lb.length;i++){const e=lb[i];if(e[1].x>-400&&(!phN||e[2]))LO.push(e)}G.render(LO)};
    return ctx},ctx=>ctx.frame());
   return ()=>{if(scn)scn.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>x.dispose())});scn=null;stop()}}}}

/* ---------- урок ---------- */
const P_b=(b,e)=>"<p>"+L(b,e)+"</p>",LI=a=>"<ul>"+a.map(([b,e])=>"<li>"+L(b,e)+"</li>").join("")+"</ul>",OL=a=>"<ol>"+a.map(([b,e])=>"<li>"+L(b,e)+"</li>").join("")+"</ol>";
const book={title:L("Еритропоеза, желязо и анемии","Erythropoiesis, iron and anaemias"),
 adv:L("как хипоксията чрез EPO управлява костния мозък, как хепцидинът управлява желязото и как от това се раждат отделните видове анемия","how hypoxia drives the marrow through EPO, how hepcidin governs iron, and how the individual anaemias arise from this"),
 lead:L("Еритроцитът живее 120 дни; всяка секунда се раждат и умират по 2 милиона. Регулираната величина не е броят клетки, а доставката на кислород до бъбрека. По Guyton, гл. 33.","The red cell lives 120 days; 2 million are born and die every second. The regulated variable is not cell number but oxygen delivery to the kidney. After Guyton, ch. 33."),
 secs:[
 {h:L("Цели на урока","Learning objectives"),html:LI([
  ["Да обясниш веригата хипоксия → HIF-2α → EPO → BFU-E/CFU-E → ретикулоцит → еритроцит и нейните времена.","Explain the chain hypoxia → HIF-2α → EPO → BFU-E/CFU-E → reticulocyte → red cell and its time course."],
  ["Да проследиш един атом желязо: храна → DMT1 → ентероцит → феропортин → трансферин → еритробласт → макрофаг → отново трансферин.","Follow one iron atom: food → DMT1 → enterocyte → ferroportin → transferrin → erythroblast → macrophage → transferrin again."],
  ["Да обясниш защо хепцидинът е „централният клапан“ и как го местят запасите, възпалението и еритроферонът.","Explain why hepcidin is the “central valve” and how stores, inflammation and erythroferrone move it."],
  ["Да различиш анемиите по MCV, ретикулоцитен индекс, феритин и TSAT.","Distinguish the anaemias by MCV, reticulocyte index, ferritin and TSAT."],
  ["Да предскажеш какво става с Hb, EPO и желязото при кървене, височина, ХБЗ, хемолиза и дефицит на B12.","Predict Hb, EPO and iron after bleeding, at altitude, in CKD, haemolysis and B12 deficiency."]])},
 {h:L("Норма: числата","Normal values"),html:LI([
  ["Hb: мъже 13,5–17,5 g/dL, жени 12–16; Hct ≈ 3 × Hb; еритроцити 4,2–5,9×10¹²/L.","Hb: men 13.5–17.5 g/dL, women 12–16; Hct ≈ 3 × Hb; red cells 4.2–5.9×10¹²/L."],
  ["MCV 80–100 fL, MCH 27–33 pg, MCHC 32–36 g/dL; ретикулоцити 0,5–1,5 % (25–75×10⁹/L).","MCV 80–100 fL, MCH 27–33 pg, MCHC 32–36 g/dL; reticulocytes 0.5–1.5 % (25–75×10⁹/L)."],
  ["Живот 120 дни → ≈ 0,8 % от масата се подменя дневно (≈ 2×10¹¹ клетки). Съзряване в мозъка ≈ 5–7 дни; ретикулоцитът е ≈ 1 ден в кръвта (при силен стимул до 2–2,5 дни).","Lifespan 120 days → ≈ 0.8 % of the mass is renewed daily (≈ 2×10¹¹ cells). Marrow maturation ≈ 5–7 days; the reticulocyte spends ≈ 1 day in blood (up to 2–2.5 days with a strong stimulus)."],
  ["EPO 4–20 mU/mL, t½ 6–9 h; ≈ 90 % от перитубулните фибробласти на бъбречната кора, ≈ 10 % от черния дроб.","EPO 4–20 mU/mL, t½ 6–9 h; ≈ 90 % from cortical peritubular fibroblasts of the kidney, ≈ 10 % from the liver."],
  ["Телесно желязо 3–4 g: ≈ 2,5 g в хемоглобина, ≈ 1 g запаси (феритин, хемосидерин), 3 mg в плазмата върху трансферина. Резорбция 1–2 mg/ден (максимум ≈ 5), загуби ≈ 1 mg/ден; макрофагите рециклират ≈ 20–25 mg/ден.","Body iron 3–4 g: ≈ 2.5 g in haemoglobin, ≈ 1 g stores (ferritin, haemosiderin), 3 mg in plasma on transferrin. Absorption 1–2 mg/day (maximum ≈ 5), losses ≈ 1 mg/day; macrophages recycle ≈ 20–25 mg/day."],
  ["Феритин 30–300 ng/mL; TIBC 250–400 µg/dL; серумно желязо 60–160 µg/dL; TSAT 20–45 %. Запас на B12 за 3–5 години, на фолат — за 3–4 месеца.","Ferritin 30–300 ng/mL; TIBC 250–400 µg/dL; serum iron 60–160 µg/dL; TSAT 20–45 %. B12 stores last 3–5 years, folate 3–4 months."]])},
 {h:L("Механизмът стъпка по стъпка","The mechanism step by step"),html:OL([
  ["Перитубулните фибробласти на бъбрека измерват не Hb, а <b>доставката на O₂</b>. При хипоксия пролил-хидроксилазите спират (нужен им е O₂), <b>HIF-2α</b> не се разгражда и включва гена за EPO.","Renal peritubular fibroblasts sense not Hb but <b>O₂ delivery</b>. In hypoxia prolyl hydroxylases stop (they need O₂), <b>HIF-2α</b> escapes degradation and switches on the EPO gene."],
  ["EPO расте <b>логаритмично</b>: при спад на Hb от 14 към 7 g/dL се покачва ≈ 100 пъти. Затова „нормален“ EPO при тежка анемия е патологичен.","EPO rises <b>log-linearly</b>: as Hb falls from 14 to 7 g/dL it rises ≈ 100-fold. A “normal” EPO in severe anaemia is therefore pathological."],
  ["EPO действа чрез EPO-рецептора (JAK2/STAT5) на <b>CFU-E и проеритробластите</b>, главно като фактор за преживяване (спира апоптозата); максималният ефект е ≈ 6–8 пъти.","EPO acts via its receptor (JAK2/STAT5) on <b>CFU-E and proerythroblasts</b>, mainly as a survival factor (it blocks apoptosis); the maximal effect is ≈ 6–8-fold."],
  ["Еритробластът натрупва хемоглобин; хемът се синтезира в митохондрията (сукцинил-КоА + глицин → ALA → протопорфирин IX + Fe²⁺ чрез ферохелатаза).","The erythroblast accumulates haemoglobin; haem is made in the mitochondrion (succinyl-CoA + glycine → ALA → protoporphyrin IX + Fe²⁺ via ferrochelatase)."],
  ["Ортохромният нормобласт <b>изхвърля ядрото</b> → ретикулоцит с остатъчна рРНК; макрофагът на острова поглъща ядрото.","The orthochromatic normoblast <b>expels its nucleus</b> → a reticulocyte with residual rRNA; the island macrophage engulfs the nucleus."],
  ["Ретикулоцитът излиза в кръвта и за ≈ 24 h губи РНК и митохондриите → двойновдлъбнат диск без ядро, който живее на гликолиза.","The reticulocyte enters the blood and within ≈ 24 h loses RNA and mitochondria → an anucleate biconcave disc that lives on glycolysis."],
  ["След ≈ 120 дни макрофагите в слезката фагоцитират износената клетка: глобинът става аминокиселини, хемът — билирубин, а желязото се връща към трансферина.","After ≈ 120 days splenic macrophages phagocytose the worn cell: globin becomes amino acids, haem becomes bilirubin and iron returns to transferrin."],
  ["<b>Желязото</b>: Fe³⁺ от храната се редуцира от Dcytb → <b>DMT1</b> апикално → ентероцит → <b>феропортин</b> базолатерално + хефестин (Fe²⁺ → Fe³⁺) → <b>трансферин</b> (2 атома) → TfR1 на еритробласта.","<b>Iron</b>: dietary Fe³⁺ is reduced by Dcytb → <b>DMT1</b> apically → enterocyte → <b>ferroportin</b> basolaterally + hephaestin (Fe²⁺ → Fe³⁺) → <b>transferrin</b> (2 atoms) → TfR1 on the erythroblast."],
  ["<b>Хепцидинът</b> от черния дроб се свързва с феропортина и води до интернализацията и разграждането му → желязото остава заключено в ентероцита (който се олющва) и в макрофага.","<b>Hepcidin</b> from the liver binds ferroportin and causes its internalisation and degradation → iron stays locked in the enterocyte (which is shed) and in the macrophage."]])},
 {h:L("Регулация","Regulation"),html:LI([
  ["<b>Отрицателна обратна връзка по O₂</b>: ↓ доставка → ↑ EPO → ↑ еритропоеза → ↑ Hb → ↑ доставка. Контурът е бавен: ретикулоцитите растат от 3–5-ия ден, Hb — с около 1 g/dL на седмица.","<b>Negative feedback on O₂</b>: ↓ delivery → ↑ EPO → ↑ erythropoiesis → ↑ Hb → ↑ delivery. The loop is slow: reticulocytes rise from day 3–5, Hb by about 1 g/dL per week."],
  ["EPO вдигат още височината, белодробната болест, десен-ляв шънт, карбоксихемоглобинът, андрогените и EPO-секретиращи тумори.","EPO is also raised by altitude, lung disease, right-to-left shunts, carboxyhaemoglobin, androgens and EPO-secreting tumours."],
  ["<b>Хепцидин ↑</b>: пълни запаси (BMP6–SMAD), <b>възпаление (IL-6 → STAT3)</b>, намален бъбречен клирънс. <b>Хепцидин ↓</b>: празни запаси, хипоксия, <b>еритроферон</b> от еритробластите при силен EPO-стимул.","<b>Hepcidin ↑</b>: full stores (BMP6–SMAD), <b>inflammation (IL-6 → STAT3)</b>, reduced renal clearance. <b>Hepcidin ↓</b>: empty stores, hypoxia, <b>erythroferrone</b> from erythroblasts under strong EPO drive."],
  ["При дефицит ентероцитът сам вдига DMT1 и Dcytb (HIF-2α), но максимумът е ≈ 5 mg/ден — по-голяма загуба винаги води до дефицит.","In deficiency the enterocyte itself raises DMT1 and Dcytb (HIF-2α), but the maximum is ≈ 5 mg/day — a larger loss always leads to deficiency."],
  ["Еритропоезата изисква желязо, B12 и фолат (ДНК), B6 (хем), белтък, мед, тироксин и андрогени.","Erythropoiesis needs iron, B12 and folate (DNA), B6 (haem), protein, copper, thyroxine and androgens."]])},
 {h:L("Клинично значение","Clinical relevance"),html:LI([
  ["<b>По MCV</b>: микроцитна (желязодефицит, таласемия, сидеробластна, част от ACD) · нормоцитна (остро кървене, ХБЗ, ACD, хемолиза, апластична) · макроцитна (B12/фолат; алкохол, чернодробна болест, хипотиреоидизъм, ретикулоцитоза).","<b>By MCV</b>: microcytic (iron deficiency, thalassaemia, sideroblastic, some ACD) · normocytic (acute bleeding, CKD, ACD, haemolysis, aplastic) · macrocytic (B12/folate; alcohol, liver disease, hypothyroidism, reticulocytosis)."],
  ["<b>По ретикулоцитния индекс</b>: RPI > 2–3 = периферна загуба (хемолиза, кървене); RPI < 2 при анемия = проблем в мозъка.","<b>By reticulocyte index</b>: RPI > 2–3 = peripheral loss (haemolysis, bleeding); RPI < 2 in anaemia = a marrow problem."],
  ["<b>Желязодефицит или ACD</b>: феритин ↓↓ или ↑; TIBC ↑ или ↓; хепцидин ↓ или ↑.","<b>Iron deficiency or ACD</b>: ferritin ↓↓ or ↑; TIBC ↑ or ↓; hepcidin ↓ or ↑."],
  ["Желязодефицит при мъж или жена след менопауза = кървене от храносмилателния тракт, докато не се докаже друго.","Iron deficiency in a man or a post-menopausal woman = gastrointestinal bleeding until proven otherwise."],
  ["<b>Пернициозна анемия</b>: автоантитела срещу париеталните клетки или вътрешния фактор; фолатът коригира кръвната картина, но не и неврологията — затова B12-дефицитът се изключва първо.","<b>Pernicious anaemia</b>: autoantibodies against parietal cells or intrinsic factor; folate corrects the blood count but not the neurology — so B12 deficiency is excluded first."],
  ["<b>ХБЗ</b>: ЕСА плюс желязо; целеви Hb ≈ 10–11,5 g/dL — пълната корекция увеличава инсултите и тромбозите.","<b>CKD</b>: ESA plus iron; target Hb ≈ 10–11.5 g/dL — full correction increases strokes and thromboses."],
  ["<b>Полицитемия</b>: PV (EPO нисък, JAK2+) · вторична (EPO висок) · относителна (дехидратация).","<b>Polycythaemia</b>: PV (EPO low, JAK2+) · secondary (EPO high) · relative (dehydration)."],
  ["<b>Хемохроматоза</b> (HFE): хепцидинът е неадекватно нисък при пълни запаси → резорбцията не спира → натрупване на 20–40 g желязо.","<b>Haemochromatosis</b> (HFE): hepcidin is inappropriately low despite full stores → absorption does not stop → 20–40 g of iron accumulates."]])},
 {h:L("Чести заблуди","Common misconceptions"),html:LI([
  ["„Веднага след кръвоизлив Hb пада.“ — Губят се клетки и плазма заедно; концентрацията пада след хемодилуцията (12–72 h).","“Hb falls immediately after a haemorrhage.” — Cells and plasma are lost together; the concentration falls after haemodilution (12–72 h)."],
  ["„Ретикулоцити 2 % значи добър отговор.“ — При Hb 7 g/dL това е нисък абсолютен брой; смятай RPI.","“Reticulocytes of 2 % mean a good response.” — At an Hb of 7 g/dL that is a low absolute count; calculate the RPI."],
  ["„Високият феритин изключва желязодефицит.“ — Феритинът е острофазов белтък; при възпаление праговете са по-високи.","“A high ferritin excludes iron deficiency.” — Ferritin is an acute-phase protein; with inflammation the thresholds are higher."],
  ["„При възпаление желязото липсва.“ — То е налице, но е заключено от хепцидина.","“In inflammation iron is missing.” — It is present but locked away by hepcidin."],
  ["„Бъбрекът мери хемоглобина.“ — Мери доставката на O₂; при CO-отравяне Hb е нормален, а EPO расте.","“The kidney measures haemoglobin.” — It senses O₂ delivery; in CO poisoning Hb is normal yet EPO rises."],
  ["„EPO прави нови стволови клетки.“ — Действа главно като фактор за преживяване на вече ангажираните CFU-E.","“EPO makes new stem cells.” — It acts mainly as a survival factor for already committed CFU-E."]])},
 {h:L("Опростено в модела","Simplified in the model"),html:LI([
  ["Една усреднена „порция“ хемоглобин вместо отделни клетки; съзряването е верига от 3 компартмента по 2 дни.","One averaged “pool” of haemoglobin instead of individual cells; maturation is a chain of 3 compartments of 2 days each."],
  ["Плазменият обем се възстановява с една константа (1 ден); няма сърдечно-съдова компенсация, 2,3-ДФГ и изместване на дисоциационната крива.","Plasma volume recovers with one time constant (1 day); there is no cardiovascular compensation, 2,3-DPG or shift of the dissociation curve."],
  ["Желязото е в 3 пула (плазма, запаси, хемоглобин); хепцидинът е алгебрична функция на запасите, възпалението и еритроферона.","Iron is in 3 pools (plasma, stores, haemoglobin); hepcidin is an algebraic function of stores, inflammation and erythroferrone."],
  ["B12/фолат влизат само като процент ефективна еритропоеза и MCV, без неврология. Стойностите са за мъж 70 kg с 5 L кръв.","B12/folate enter only as a percentage of effective erythropoiesis and MCV, without neurology. Values are for a 70 kg man with 5 L of blood."],
  ["3D сцената: органите са истински модели (BodyParts3D); клетъчните станции са учебни реконструкции с верни относителни размери, а белтъците са опростени и уголемени.","The 3D scene: the organs are real models (BodyParts3D); the cell stations are teaching reconstructions with true relative sizes, and the proteins are simplified and enlarged."]])}],
 key:[["Бъбрекът мери доставката на O₂, не хемоглобина; HIF-2α → EPO.","The kidney senses O₂ delivery, not haemoglobin; HIF-2α → EPO."],
  ["EPO расте логаритмично: Hb 14 → 7 g/dL ≈ 100 пъти EPO. Нормален EPO при анемия = патология.","EPO rises log-linearly: Hb 14 → 7 g/dL ≈ 100-fold EPO. A normal EPO in anaemia is pathological."],
  ["Съзряване 5–7 дни → ретикулоцитите растат на 3–5-ия ден, Hb ≈ 1 g/dL на седмица.","Maturation 5–7 days → reticulocytes rise on day 3–5, Hb by ≈ 1 g/dL per week."],
  ["Живот 120 дни; рециклират се ≈ 22 mg желязо дневно, а се резорбират само 1–2 mg.","Lifespan 120 days; ≈ 22 mg of iron is recycled daily while only 1–2 mg is absorbed."],
  ["Хепцидинът е изходният клапан: ↑ при запаси и IL-6, ↓ при дефицит, хипоксия и еритроферон.","Hepcidin is the export valve: ↑ with stores and IL-6, ↓ with deficiency, hypoxia and erythroferrone."],
  ["Желязодефицит: феритин ↓, TIBC ↑, TSAT ↓, MCV ↓. ACD: феритин ↑, TIBC ↓, TSAT ↓, MCV норма.","Iron deficiency: ferritin ↓, TIBC ↑, TSAT ↓, MCV ↓. ACD: ferritin ↑, TIBC ↓, TSAT ↓, MCV normal."],
  ["RPI > 2–3 = периферна загуба; RPI < 2 при анемия = мозъкът не отговаря.","RPI > 2–3 = peripheral loss; RPI < 2 in anaemia = the marrow is not responding."],
  ["Полицитемия с нисък EPO = PV; с висок EPO = вторична.","Polycythaemia with low EPO = PV; with high EPO = secondary."]].map(([b,e])=>L(b,e))};

const Q=a=>a.map(([q,qe,opts,an,ex,exe])=>({q:L(q,qe),opts:opts.map(([b,e])=>L(b,e)),a:an,expl:L(ex,exe)}));
const tests=Q([
 ["Кой клетъчен тип произвежда ≈ 90 % от еритропоетина?","Which cell type produces ≈ 90 % of erythropoietin?",[["Перитубулни фибробласти в бъбречната кора","Peritubular fibroblasts of the renal cortex"],["Хепатоцити","Hepatocytes"],["Клетки на проксималния тубул","Proximal tubule cells"],["Макрофаги на слезката","Splenic macrophages"]],0,"Интерстициални фибробласти в дълбоката кора и кортикомедуларната зона; черният дроб дава ≈ 10 % (и доминира у плода).","Interstitial fibroblasts of the deep cortex and corticomedullary zone; the liver contributes ≈ 10 % (and dominates in the fetus)."],
 ["Какво „измерва“ бъбрекът при регулацията на EPO?","What does the kidney sense when regulating EPO?",[["Броя еритроцити","The red-cell count"],["Доставката на кислород до тъканта","Oxygen delivery to the tissue"],["Концентрацията на желязо","The iron concentration"],["pH на кръвта","Blood pH"]],1,"Hb × SaO₂ × кръвоток; затова при CO-отравяне EPO расте при нормален Hb.","Hb × SaO₂ × flow; hence EPO rises in CO poisoning despite a normal Hb."],
 ["Колко време минава от стимула до покачване на ретикулоцитите?","How long from the stimulus to a rise in reticulocytes?",[["2–4 часа","2–4 hours"],["1 ден","1 day"],["3–5 дни","3–5 days"],["4 седмици","4 weeks"]],2,"Съзряването в мозъка отнема 5–7 дни; първи се освобождават по-ранните форми.","Marrow maturation takes 5–7 days; earlier forms are released first."],
 ["Непосредствено след остра загуба на 1 L кръв хемоглобинът е:","Immediately after an acute loss of 1 L of blood the haemoglobin is:",[["Намален наполовина","Halved"],["Непроменен","Unchanged"],["Повишен","Raised"],["Намален с 2 g/dL","Lower by 2 g/dL"]],1,"Губят се клетки и плазма заедно; концентрацията пада след възстановяване на обема (12–72 h).","Cells and plasma are lost together; the concentration falls after volume is restored (12–72 h)."],
 ["Ретикулоцити 2 % при Hb 7 g/dL означават:","Reticulocytes of 2 % with an Hb of 7 g/dL mean:",[["Отличен отговор на мозъка","An excellent marrow response"],["Неадекватен отговор (RPI < 2)","An inadequate response (RPI < 2)"],["Хемолиза","Haemolysis"],["Полицитемия","Polycythaemia"]],1,"RPI = 2 × (7/15) / 2 ≈ 0,5 — коригира се за анемията и удълженото време на ретикулоцита в кръвта.","RPI = 2 × (7/15) / 2 ≈ 0.5 — corrected for the anaemia and the longer reticulocyte time in blood."],
 ["Хепцидинът понижава плазменото желязо, като:","Hepcidin lowers plasma iron by:",[["Блокира DMT1 апикално","Blocking DMT1 apically"],["Предизвиква интернализация и разграждане на феропортина","Causing internalisation and degradation of ferroportin"],["Свързва трансферина","Binding transferrin"],["Инхибира ферохелатазата","Inhibiting ferrochelatase"]],1,"Феропортинът е единственият износител на желязо от ентероцита, макрофага и хепатоцита.","Ferroportin is the only iron exporter of enterocytes, macrophages and hepatocytes."],
 ["При анемия на хроничното възпаление очакваме:","In anaemia of chronic disease we expect:",[["Феритин ↓, TIBC ↑, TSAT ↓","Ferritin ↓, TIBC ↑, TSAT ↓"],["Феритин ↑, TIBC ↓, TSAT ↓","Ferritin ↑, TIBC ↓, TSAT ↓"],["Феритин ↑, TIBC ↑, TSAT ↑","Ferritin ↑, TIBC ↑, TSAT ↑"],["Феритин норма, TIBC норма, TSAT ↑","Ferritin normal, TIBC normal, TSAT ↑"]],1,"IL-6 → хепцидин ↑ (желязото е заключено), феритинът е острофазов, а трансферинът — негативен острофазов белтък.","IL-6 → hepcidin ↑ (iron locked), ferritin is an acute-phase protein and transferrin a negative acute-phase protein."],
 ["Коя находка най-добре отличава желязодефицита от таласемия и ACD?","Which finding best separates iron deficiency from thalassaemia and ACD?",[["Нисък MCV","A low MCV"],["Нисък феритин с висок TIBC","A low ferritin with a high TIBC"],["Нисък Hb","A low Hb"],["Висок брой еритроцити","A high red-cell count"]],1,"Микроцитозата е обща; само при истински дефицит запасите са празни, а трансферинът е увеличен.","Microcytosis is shared; only in true deficiency are stores empty and transferrin increased."],
 ["Защо при тежка хемолиза феритинът расте?","Why does ferritin rise in severe haemolysis?",[["Еритроцитите съдържат феритин, който се освобождава при разрушаването им","Red cells contain ferritin that is released when they are destroyed"],["Желязото от разрушените клетки се рециклира и предлагането надвишава търсенето","Iron from destroyed cells is recycled and supply exceeds demand"],["Черният дроб спира да прави трансферин","The liver stops making transferrin"],["Хепцидинът е повишен","Hepcidin is raised"]],1,"При екстраваскуларна хемолиза желязото остава в макрофагите и се рециклира; хепцидинът е нисък и резорбцията дори расте. При интраваскуларна хемолиза то се губи с урината (хемосидеринурия).","In extravascular haemolysis iron stays in macrophages and is recycled; hepcidin is low and absorption even rises. In intravascular haemolysis it is lost in the urine (haemosiderinuria)."],
 ["Hb 9 g/dL, MCV 90 fL, креатинин 350 µmol/L, EPO 12 mU/mL. Оценката е:","Hb 9 g/dL, MCV 90 fL, creatinine 350 µmol/L, EPO 12 mU/mL. The assessment is:",[["EPO е нормален, търси друга причина","EPO is normal, look for another cause"],["EPO е неадекватно нисък за тази анемия","EPO is inappropriately low for this anaemia"],["EPO е повишен","EPO is raised"],["EPO няма значение","EPO is irrelevant"]],1,"При Hb 9 g/dL здравият бъбрек би направил стотици mU/mL; „нормата“ тук е дефицит.","At an Hb of 9 g/dL a healthy kidney would make hundreds of mU/mL; a “normal” value here is a deficiency."],
 ["Мегалобластната анемия при дефицит на B12 се характеризира с:","Megaloblastic anaemia from B12 deficiency is characterised by:",[["Хиперцелуларен мозък, нисък ретикулоцитен индекс, LDH и билирубин ↑","A hypercellular marrow, a low reticulocyte index, LDH and bilirubin ↑"],["Хипоцелуларен мозък и ретикулоцитоза","A hypocellular marrow and reticulocytosis"],["Микроцитоза и нисък феритин","Microcytosis and a low ferritin"],["Нормален MCV","A normal MCV"]],0,"Неефективна еритропоеза: клетките се правят, но загиват в мозъка.","Ineffective erythropoiesis: cells are made but die within the marrow."],
 ["Най-ранният лабораторен белег на изчерпващо се желязо е:","The earliest laboratory sign of depleting iron is:",[["Нисък хемоглобин","A low haemoglobin"],["Нисък MCV","A low MCV"],["Нисък феритин","A low ferritin"],["Висок RDW","A high RDW"]],2,"Последователност: запаси (феритин) → транспорт (TSAT, TIBC) → еритропоеза (MCV, RDW) → Hb.","Sequence: stores (ferritin) → transport (TSAT, TIBC) → erythropoiesis (MCV, RDW) → Hb."],
 ["След 3 седмици на 4000 m очакваме:","After 3 weeks at 4000 m we expect:",[["EPO остава висок, Hb не се променя","EPO stays high, Hb unchanged"],["EPO скача, после спада, докато Hb и Hct растат","EPO jumps, then falls as Hb and Hct rise"],["EPO и Hb падат","EPO and Hb fall"],["Хепцидинът расте","Hepcidin rises"]],1,"Пикът на EPO е на 1–2-ия ден; когато доставката на O₂ се възстанови с по-висок Hb, EPO се връща близо до нормата; еритроферонът потиска хепцидина.","The EPO peak is on day 1–2; once O₂ delivery is restored by a higher Hb, EPO returns near normal; erythroferrone suppresses hepcidin."],
 ["Hb 19,5 g/dL, Hct 58 %, EPO 1,2 mU/mL, нормална сатурация. Най-вероятно е:","Hb 19.5 g/dL, Hct 58 %, EPO 1.2 mU/mL, normal saturation. Most likely:",[["Вторична полицитемия от хипоксия","Secondary polycythaemia from hypoxia"],["Polycythemia vera","Polycythaemia vera"],["Дехидратация","Dehydration"],["EPO-секретиращ тумор","An EPO-secreting tumour"]],1,"Клоновата пролиферация (JAK2 V617F) потиска ендогенния EPO; при всяка вторична причина EPO е висок.","Clonal proliferation (JAK2 V617F) suppresses endogenous EPO; in every secondary cause EPO is high."]]);
const exp=Q([
 ["Пусни „Остра кръвозагуба 1 L“ и гледай първите 2 дни: какво прави измереният Hb?","Run “Acute blood loss 1 L” and watch the first 2 days: what does the measured Hb do?",[["Пада веднага","It falls at once"],["Пада след 12–24 h, докато се възстановява плазменият обем","It falls after 12–24 h as plasma volume recovers"]],1,"Следи реда „Плазмен обем“ — концентрацията пада, когато обемът се върне.","Watch the “Plasma volume” row — the concentration falls as volume returns."],
 ["Задай кръвозагуба 12 mL/ден. Кое пада първо?","Set blood loss to 12 mL/day. What falls first?",[["Хемоглобинът","Haemoglobin"],["Феритинът","Ferritin"]],1,"Запасите са буферът: първо феритин, после TSAT, последен Hb.","Stores are the buffer: ferritin first, then TSAT, Hb last."],
 ["Сравни „Желязодефицитна анемия“ и „Анемия при хронично възпаление“: кой показател ги разделя?","Compare “Iron deficiency anaemia” and “Anaemia of chronic disease”: which value separates them?",[["Хемоглобинът","Haemoglobin"],["Феритинът и хепцидинът","Ferritin and hepcidin"]],1,"При възпаление феритинът е висок, но желязото е заключено.","With inflammation ferritin is high, yet iron is locked away."],
 ["В „Пернициозна анемия“ изчакай ≥ 100 дни, после върни B12 на 100 %: кога ще видиш отговора?","In “Pernicious anaemia” wait ≥ 100 days, then return B12 to 100 %: when does the response appear?",[["Веднага на следващия ден","At once, the next day"],["Ретикулоцитите растат след 5–8 дни, Hb — с около 1 g/dL седмично","Reticulocytes rise after 5–8 days, Hb by about 1 g/dL per week"]],1,"Съзряването отнема 5–7 дни — същото закъснение важи и за лечението.","Maturation takes 5–7 days — the same lag applies to treatment."],
 ["„ХБЗ“: изчакай ≥ 150 дни анемията да се установи, после вдигни бъбречната продукция на EPO до 100 %, без да пипаш желязото. Какво става?","“CKD”: wait ≥ 150 days for the anaemia to develop, then raise renal EPO production to 100 % without touching iron. What happens?",[["Hb расте за 6–10 седмици; феритинът пада, а TSAT първо рязко спада (функционален железен дефицит)","Hb rises over 6–10 weeks; ferritin falls and TSAT first drops sharply (functional iron deficiency)"],["Нищо не се променя","Nothing changes"]],0,"Мозъкът веднага използва запасите — оттам и функционалният железен дефицит при ЕСА.","The marrow immediately draws on stores — hence functional iron deficiency during ESA therapy."]]);
[["bleed"],["norm",{loss:12}],["ida"],["perni"],["ckd"]].forEach(([k,sl],i)=>{exp[i].pre=k;if(sl)exp[i].sl=sl;exp[i].set={pre:k,sl:sl||{}}});
const gl=[{t:L("Еритропоетин (EPO)","Erythropoietin (EPO)"), re:"еритропоетин[а-я]*|\\bEPO\\b",
 d:L("Гликопротеинов хормон (≈34 kDa) от перитубулните фибробласти на бъбречната кора; при хипоксия HIF-2α включва гена му. Спасява CFU-E и проеритробластите от апоптоза; t½ 6–9 h, норма 4–20 mU/mL.",
     "A ≈34 kDa glycoprotein from cortical peritubular fibroblasts; hypoxia lets HIF-2α switch on its gene. It rescues CFU-E and proerythroblasts from apoptosis; t½ 6–9 h, normal 4–20 mU/mL.")},
{t:L("Хепцидин","Hepcidin"), re:"хепцидин[а-я]*",
 d:L("25-аминокиселинен чернодробен пептид — централният регулатор на желязото. Свързва феропортина и го разгражда, с което спира резорбцията и освобождаването от макрофагите. ↑ при пълни запаси и IL-6; ↓ при дефицит, хипоксия и еритроферон.",
     "A 25-amino-acid hepatic peptide — the master iron regulator. It binds ferroportin and degrades it, stopping absorption and macrophage release. ↑ with full stores and IL-6; ↓ with deficiency, hypoxia and erythroferrone.")},
{t:L("Феропортин","Ferroportin"), re:"феропортин[а-я]*",
 d:L("Единственият познат износител на желязо от клетката (SLC40A1); базолатерално в ентероцита, в макрофага и хепатоцита. Мишена на хепцидина; работи заедно с хефестин/церулоплазмин, които окисляват Fe²⁺ до Fe³⁺.",
     "The only known cellular iron exporter (SLC40A1); basolateral in enterocytes, present in macrophages and hepatocytes. Target of hepcidin; works with hephaestin/caeruloplasmin, which oxidise Fe²⁺ to Fe³⁺.")},
{t:L("Трансферин и TSAT","Transferrin and TSAT"), re:"трансферин[а-я]*|TSAT|насищане на трансферина",
 d:L("Плазмен белтък, който носи по 2 атома Fe³⁺ към TfR1. TIBC 250–400 µg/dL; TSAT = серумно желязо / TIBC (норма 20–45 %). TSAT <15–20 % означава, че желязото не стига на еритробластите.",
     "Plasma protein carrying 2 Fe³⁺ atoms to TfR1. TIBC 250–400 µg/dL; TSAT = serum iron / TIBC (normal 20–45 %). A TSAT <15–20 % means iron is not reaching the erythroblasts.")},
{t:L("Феритин","Ferritin"), re:"феритин[а-я]*",
 d:L("Белтък-депо (до 4500 Fe атома). Серумният феритин отразява запасите (1 ng/mL ≈ 8–10 mg), но е и острофазов белтък — при възпаление се вдига независимо от запасите.",
     "Storage protein (up to 4500 Fe atoms). Serum ferritin reflects stores (1 ng/mL ≈ 8–10 mg) but is also an acute-phase protein — inflammation raises it independently of stores.")},
{t:L("Ретикулоцит","Reticulocyte"), re:"ретикулоцит[а-я]*",
 d:L("Младият безядрен еритроцит с остатъчна рРНК (мрежа при бриляново-крезилово синьо). Норма 0,5–1,5 % (25–75×10⁹/L); остава ≈1 ден в кръвта, при силен EPO-стимул излиза по-рано и се задържа до 2–2,5 дни.",
     "The young anucleate red cell with residual rRNA (the network seen with brilliant cresyl blue). Normal 0.5–1.5 % (25–75×10⁹/L); it stays ≈1 day in blood, but with a strong EPO stimulus it exits earlier and persists up to 2–2.5 days.")},
{t:L("Ретикулоцитен продукционен индекс (RPI)","Reticulocyte production index (RPI)"), re:"ретикулоцит[а-я]* индекс|RPI|продукционен индекс",
 d:L("RPI = ретикулоцити % × (Hb/15) ÷ фактор на изместване (1–2,5). RPI >2–3 при анемия = мозъкът отговаря (хемолиза, кървене); RPI <2 = хипопролиферативна или неефективна еритропоеза.",
     "RPI = reticulocyte % × (Hb/15) ÷ shift factor (1–2.5). An RPI >2–3 in anaemia = the marrow is responding (haemolysis, bleeding); RPI <2 = hypoproliferative or ineffective erythropoiesis.")},
{t:L("Неефективна еритропоеза","Ineffective erythropoiesis"), re:"неефективн[а-я]* еритропоеза[а-я]*",
 d:L("Предшествениците се произвеждат в излишък, но загиват в костния мозък (дефицит на B12/фолат, таласемия, миелодисплазия): хиперцелуларен мозък + нисък ретикулоцитен индекс + ↑ LDH и неконюгиран билирубин.",
     "Precursors are produced in excess but die in the marrow (B12/folate deficiency, thalassaemia, myelodysplasia): a hypercellular marrow with a low reticulocyte index plus raised LDH and unconjugated bilirubin.")}];


/* ---------- поетапно, на клетъчно ниво: път на желязото (ентероцит) и синтеза на хема (еритробласт) ---------- */
const zO=(i,u,k,a=0,b=0.35)=>i>k?1:i===k?(typeof zsg==="function"?zsg(u,a,b):Math.min(1,u/b)):0,ZHo=x=>[x,0,1.5];
const STG_ER=typeof zCellStg!=="function"?null:zCellStg({id:"stgFe",title:L("На клетъчно ниво: пътят на желязото от храната до хема","At the cellular level: the path of iron from food to haem"),
 intro:L("Две клетки, през които минава желязото. В ентероцита горе е чревният лумен, долу — капилярът; в еритробласта горе е плазмата. Избери клетка и следвай атома желязо.","Two cells that iron passes through. In the enterocyte the gut lumen is above and the capillary below; in the erythroblast plasma is above. Choose a cell and follow the iron atom."),
 legend:[["#7b2d26","Fe³⁺"],["#a5532a","Fe²⁺"],["#1c7ed6","H⁺"],["#748ffc",L("трансферин","transferrin")],["#e64980",L("хепцидин","hepcidin")],["#9a6f72",L("феритин","ferritin")],["#b3262e",L("хем / хемоглобин","haem / haemoglobin")]],
 mechs:[{key:"duo",label:L("Ентероцит: резорбция","Enterocyte: absorption"),center:L("резорбция","absorption"),cam:[0,0,0,50,0.22,1.42],foc:[[-10,9,26],[-6,6,26],[-4,0,28],[5,-8,28],[4,-8,28]],stages:[
   {t:L("Dcytb редуцира Fe³⁺ до Fe²⁺","Dcytb reduces Fe³⁺ to Fe²⁺"),short:"Dcytb",badge:"Fe³⁺ → Fe²⁺",d:L("Нехемовото желязо в храната е предимно Fe³⁺, което не се резорбира. <b>Дуоденалният цитохром b (Dcytb)</b> на четковидния ръб го редуцира до Fe²⁺; витамин C помага, а киселата среда в дуоденума поддържа разтворимостта.","Non-haem dietary iron is mostly Fe³⁺, which is not absorbed. <b>Duodenal cytochrome b (Dcytb)</b> on the brush border reduces it to Fe²⁺; vitamin C helps, and the acid in the duodenum keeps it soluble.")},
   {t:L("DMT1 внася Fe²⁺ заедно с H⁺","DMT1 imports Fe²⁺ together with H⁺"),short:"DMT1",badge:L("симпорт с H⁺","H⁺ symport"),d:L("<b>DMT1</b> пренася Fe²⁺ в клетката, задвижван от протонния градиент. При дефицит HIF-2α увеличава DMT1 и Dcytb, но максимумът остава ≈ 5 mg/ден. Хемовото желязо влиза по отделен път.","<b>DMT1</b> carries Fe²⁺ into the cell, driven by the proton gradient. In deficiency HIF-2α raises DMT1 and Dcytb, but the maximum stays ≈ 5 mg/day. Haem iron enters by a separate route.")},
   {t:L("Склад във феритин или износ","Storage in ferritin or export"),short:L("феритин","ferritin"),badge:L("клетката живее 2–3 дни","the cell lives 2–3 days"),d:L("В цитоплазмата Fe²⁺ или се свързва с <b>феритин</b>, или отива към базолатералната мембрана. Желязото, останало във феритина, се губи, когато ентероцитът се олющи след 2–3 дни.","In the cytoplasm Fe²⁺ either binds <b>ferritin</b> or moves to the basolateral membrane. Iron left in ferritin is lost when the enterocyte is shed after 2–3 days.")},
   {t:L("Феропортин и хефестин → трансферин","Ferroportin and hephaestin → transferrin"),short:L("феропортин","ferroportin"),badge:L("Fe³⁺ върху трансферина","Fe³⁺ on transferrin"),d:L("<b>Феропортинът</b> — единственият износител на желязо — изнася Fe²⁺; <b>хефестинът</b> го окислява до Fe³⁺, което се свързва с <b>трансферина</b> (по 2 атома) и тръгва към костния мозък.","<b>Ferroportin</b> — the only iron exporter — exports Fe²⁺; <b>hephaestin</b> oxidises it to Fe³⁺, which binds <b>transferrin</b> (2 atoms each) and travels to the marrow.")},
   {t:L("Хепцидинът затваря изхода","Hepcidin shuts the exit"),short:L("хепцидин","hepcidin"),badge:L("феропортинът се интернализира","ferroportin is internalised"),d:L("<b>Хепцидинът</b> от черния дроб се свързва с феропортина; комплексът се интернализира и разгражда. Желязото остава в ентероцита и се губи при олющването му. Хепцидинът расте при пълни запаси и възпаление (IL-6) и пада при дефицит, хипоксия и висок EPO (еритроферон).","<b>Hepcidin</b> from the liver binds ferroportin; the complex is internalised and degraded. Iron stays in the enterocyte and is lost when it is shed. Hepcidin rises with full stores and inflammation (IL-6) and falls with deficiency, hypoxia and high EPO (erythroferrone).")}],
   spec:{mem:[{y:8,holes:[ZHo(-11),ZHo(-5)]},{y:-8,holes:[ZHo(4)]}],
    it:[{k:"dcyt",kind:"enz",col:0x9775fa,p:[-11,8,0],s:0.8},{k:"dmt",kind:"chan",col:0xae3ec9,p:[-5,8,0],s:1.05},{k:"fpn",kind:"chan",col:0x9c36b5,p:[4,-8,0],s:1.05},{k:"heph",kind:"enz",col:0x845ef7,p:[8,-10.2,0],s:0.6},
     {k:"f0",kind:"ball",col:0x9a6f72,p:[-7,-1,0],r:1.1},{k:"f1",kind:"ball",col:0x9a6f72,p:[-3.5,-3,0.5],r:1.1},{k:"f2",kind:"ball",col:0x9a6f72,p:[-9,-4,-0.5],r:1.1},
     {k:"tf0",kind:"ball",col:0x748ffc,p:[6,-13,0],r:0.9},{k:"tf1",kind:"ball",col:0x748ffc,p:[10,-13.5,0.5],r:0.9},{k:"tf2",kind:"ball",col:0x748ffc,p:[13,-12.6,-0.5],r:0.9}],
    pools:{fe3:[0x7b2d26,0.26],fe2:[0xa5532a,0.24,40],h:[0x1c7ed6,0.18],hep:[0xe64980,0.3]}},
   upd(C,i,u,t,sg,R){const a=k=>zO(i,u,k),a0=a(0),a1=a(1),a2=a(2),a3=a(3),a4=a(4),blk=1-a4;
    ZK.cloud(C,"fe3",[-9,13,0],10*(1-0.4*a0),4,t);ZK.glow(C,"dcyt",0.7*a0);if(a0>0)R("fe2",[[-11,11],[-8,12.5]],5*a0,t*0.4,0.3);
    ZK.glow(C,"dmt",0.7*a1);if(a1>0){R("fe2",[[-5,12],[-5,8],[-5,4]],8*a1,t*0.5,0.2);R("h",[[-5.6,12],[-5.6,8],[-5.6,5]],6*a1,t*0.6,0.2)}
    const fs=0.6+0.6*a2+0.5*a4;["f0","f1","f2"].forEach((k,j)=>{C.B[k].scale.setScalar(fs*(0.9+0.1*Math.sin(t+j)));ZK.glow(C,k,0.2*a2)});if(a2>0)R("fe2",[[-5,4],[-6.5,0],[-7,-1]],5*a2,t*0.4,0.3);
    ZK.glow(C,"fpn",0.7*a3*blk);ZK.glow(C,"heph",0.7*a3*blk);if(a3>0){R("fe2",[[-4,2],[1,-3],[4,-6],[4,-9.5]],8*a3*blk,t*0.45,0.25);R("fe3",[[5,-10],[7,-11.5],[9,-12.6]],6*a3*blk,t*0.45,0.25)}
    ["tf0","tf1","tf2"].forEach((k,j)=>{C.B[k].position.x=C.B[k].userData.p0.x+((t*0.6+j*2)%6)-3;ZK.glow(C,k,0.4*a3*blk)});
    ZK.dock(C,"hep",[4,-10.6],a4,t,-1);const fp=C.B.fpn;fp.position.y=-8+5*a4;fp.scale.setScalar(1.05*(1-0.45*a4))},
   lab:(i,V)=>[["Dcytb",V(-11,11.4)],["DMT1",V(-5,11.4)],[L("феропортин","ferroportin"),i>=4?V(4,-0.6):V(4,-11.6)]].concat(i>=2?[[L("феритин","ferritin"),V(-6,-6)]]:[]).concat(i>=3?[[L("хефестин","hephaestin"),V(9,-8.2)],[L("трансферин","transferrin"),V(10,-15.4)]]:[]).concat(i>=4?[[L("хепцидин","hepcidin"),V(1,-14)]]:[])},
  {key:"eb",label:L("Еритробласт: от трансферина до хема","Erythroblast: from transferrin to haem"),center:L("хем","haem"),cam:[0,1,0,46,0.22,1.44],foc:[[-10,8,26],[-6,2,28],[4,-3,26],[0,0,34]],stages:[
   {t:L("Трансферинът с 2 Fe³⁺ се свързва с TfR1","Transferrin with 2 Fe³⁺ binds TfR1"),short:"TfR1",badge:L("ендоцитоза","endocytosis"),d:L("Диферичният трансферин се свързва с <b>трансфериновия рецептор 1</b>, който еритробластите имат в най-голямо количество. Комплексът влиза чрез клатринова ендоцитоза.","Diferric transferrin binds <b>transferrin receptor 1</b>, which erythroblasts express most abundantly. The complex enters by clathrin-mediated endocytosis.")},
   {t:L("Ендозомата се подкиселява и пуска желязото","The endosome acidifies and releases iron"),short:L("ендозома","endosome"),badge:"pH ≈ 5,5",d:L("Протонната помпа подкиселява ендозомата → Fe³⁺ се отделя, STEAP3 го редуцира до Fe²⁺ и <b>DMT1</b> го изнася в цитоплазмата. Апотрансферинът и рецепторът се връщат на повърхността.","The proton pump acidifies the endosome → Fe³⁺ is released, STEAP3 reduces it to Fe²⁺ and <b>DMT1</b> exports it into the cytoplasm. Apotransferrin and the receptor return to the surface.")},
   {t:L("В митохондрия ферохелатазата вгражда Fe²⁺ в протопорфирина","In the mitochondrion ferrochelatase inserts Fe²⁺ into protoporphyrin"),short:L("ферохелатаза","ferrochelatase"),badge:L("хем","haem"),d:L("Fe²⁺ влиза в митохондрия през митоферин. Синтезата на хема започва и завършва там (сукцинил-КоА + глицин → ALA → … → протопорфирин IX); <b>ферохелатазата</b> вгражда желязото → <b>хем</b>. При недостиг на желязо се вгражда цинк (ZnPP ↑).","Fe²⁺ enters the mitochondrion via mitoferrin. Haem synthesis starts and ends there (succinyl-CoA + glycine → ALA → … → protoporphyrin IX); <b>ferrochelatase</b> inserts the iron → <b>haem</b>. With too little iron zinc is inserted instead (ZnPP ↑).")},
   {t:L("Хем + глобин → хемоглобин","Haem + globin → haemoglobin"),short:L("хемоглобин","haemoglobin"),badge:L("≈ 270 млн. молекули в клетка","≈ 270 million molecules per cell"),d:L("Хемът излиза в цитоплазмата и се свързва с α- и β-глобиновите вериги от рибозомите. Хемоглобинът изпълва клетката, тя се смалява и накрая изхвърля ядрото. При липса на желязо клетките остават малки и бледи (микроцитоза, хипохромия).","Haem leaves into the cytoplasm and joins α- and β-globin chains from the ribosomes. Haemoglobin fills the cell, which shrinks and finally expels its nucleus. Without iron the cells stay small and pale (microcytosis, hypochromia).")}],
   spec:{mem:[{y:8,holes:[ZHo(-10)]}],
    it:[{k:"tfr",kind:"chan",col:0x748ffc,p:[-10,8,0],s:1.05},{k:"endo",kind:"ves",col:0xd0bfff,p:[-9,4,0],r:2.2},{k:"dmt",kind:"enz",col:0xae3ec9,p:[-6,1.5,0],s:0.55},{k:"mi",kind:"mito",col:0xe8590c,p:[4,-3.5,0],s:1.05},{k:"fch",kind:"enz",col:0xc92a2a,p:[4,-0.8,0],s:0.6},{k:"rib",kind:"er",col:0x9775fa,p:[-6,-6,0],s:0.7},{k:"tfb",kind:"ball",col:0x748ffc,p:[-10,12,0],r:0.9}],
    pools:{fe3:[0x7b2d26,0.26],fe2:[0xa5532a,0.24,40],h:[0x1c7ed6,0.18],hem:[0xb3262e,0.26,50],hb:[0xc92a2a,0.22,80]}},
   upd(C,i,u,t,sg,R){const a=k=>zO(i,u,k),a0=a(0),a1=a(1),a2=a(2),a3=a(3),en=C.B.endo,tb=C.B.tfb;
    tb.position.set(-10,12-1.8*a0-6*a1*(1-a1)*0,0);tb.visible=a1<0.7;ZK.glow(C,"tfr",0.6*a0);ZK.glow(C,"tfb",0.5);
    en.position.set(-9+3*a1,6-4*a1,0);en.scale.setScalar(0.4+0.6*Math.max(a0*0.6,a1));if(a1>0){ZK.cloud(C,"h",[en.position.x,en.position.y,0],8*a1,1.3,t);R("fe2",[[en.position.x+1,en.position.y],[-3,0],[0,-1]],6*a1,t*0.45,0.25);ZK.glow(C,"dmt",0.7*a1)}
    ZK.glow(C,"mi",0.5*a2);ZK.glow(C,"fch",0.8*a2);if(a2>0){R("fe2",[[0,-1],[2.5,-2.5],[4,-3.5]],7*a2,t*0.45,0.25);ZK.cloud(C,"hem",[4.5,-3.5,0],8*a2,1.6,t)}
    ZK.glow(C,"rib",0.4*a3);if(a3>0){R("hem",[[4,-1],[1,0],[-3,-2]],6*a3,t*0.4,0.3);ZK.cloud(C,"hb",[-1,-1,0],50*a3,6,t)}},
   lab:(i,V)=>[[L("TfR1 (трансферинов рецептор)","TfR1 (transferrin receptor)"),V(-10,11.4)],[L("митохондрий","mitochondrion"),V(4,-7.4)]].concat(i>=1?[[L("ендозома","endosome"),V(-6,6.4)]]:[]).concat(i>=2?[[L("ферохелатаза","ferrochelatase"),V(4,1.2)]]:[]).concat(i>=3?[[L("рибозоми: глобин","ribosomes: globin"),V(-6,-9)]]:[])}]});


/* английски за легендата и номерираните заглавия на етапите (stageViewer ги сглобява като „N. текст“) */
const stgEN=c=>{if(!c)return;(c.legend||[]).forEach(([col,n])=>{if(EN[n])EN['<i class="dot" style="background:'+col+'"></i>'+n]='<i class="dot" style="background:'+col+'"></i>'+EN[n]});
  (c.mechs||[{stages:c.stages}]).forEach(m=>(m.stages||[]).forEach((st,k)=>["t","short"].forEach(f=>{const v=st[f];if(v&&EN[v])EN[(k+1)+". "+v]=(k+1)+". "+EN[v]})))};
stgEN(STG_ER);
/* ---------- изглед ---------- */
function view(main){let SS=null,lastPre="norm";const v3=er3D(()=>({s:SS,p:window.__erP||{fe:15,loss:0,life:120,infl:0,b12:100,kid:100,alt:0,pre:"norm"}}));
  const cfg={key:"erythro",h2:L("Еритропоеза, желязо и анемии","Erythropoiesis, iron and anaemias"),
   lead:L("Хипоксия → EPO → костен мозък → еритроцит, и железният кръговрат, управляван от хепцидина. 1 s = 1 ден. Опростено: усреднени стойности и 3-компартментна верига на съзряване.","Hypoxia → EPO → marrow → red cell, and the hepcidin-controlled iron cycle. 1 s = 1 day. Simplified: averaged values and a 3-compartment maturation chain."),
   ch:320,speed:1,dtmax:0.02,recdt:0.25,hmax:1200,
   sl:[{k:"fe",label:L("Желязо в храната","Dietary iron"),min:0,max:30,step:1,value:15,unit:"mg/ден",hint:L("норма 12–18 mg/ден; резорбират се ≈ 10 % (1–2 mg), максимум ≈ 5 mg/ден","normal 12–18 mg/day; ≈ 10 % absorbed (1–2 mg), maximum ≈ 5 mg/day")},
       {k:"loss",label:L("Хронична кръвозагуба","Chronic blood loss"),min:0,max:20,step:1,value:0,unit:"mL/ден",hint:L("1 mL кръв ≈ 0,5 mg желязо; менструация ≈ 1 mL/ден средно","1 mL blood ≈ 0.5 mg iron; menses ≈ 1 mL/day on average")},
       {k:"life",label:L("Живот на еритроцита","RBC lifespan"),min:10,max:120,step:5,value:120,unit:"дни",hint:L("норма 120 дни; под 30 дни — тежка хемолиза","normal 120 days; below 30 days — severe haemolysis")},
       {k:"infl",label:L("Възпаление (IL-6)","Inflammation (IL-6)"),min:0,max:100,step:5,value:0,unit:"%",hint:L("↑ хепцидин, ↓ EPO и ↓ отговор на мозъка; феритинът е острофазов","↑ hepcidin, ↓ EPO and ↓ marrow response; ferritin is an acute-phase protein")},
       {k:"b12",label:L("B12 / фолат","B12 / folate"),min:0,max:100,step:5,value:100,unit:"%",hint:L("ДНК-синтеза; дефицит → неефективна еритропоеза и макроцитоза","DNA synthesis; deficiency → ineffective erythropoiesis and macrocytosis")},
       {k:"kid",label:L("Бъбречна продукция на EPO","Renal EPO production"),min:0,max:100,step:5,value:100,unit:"%",hint:L("90 % от EPO идва от перитубулните фибробласти на кората; при ХБЗ ↓","90 % of EPO comes from cortical peritubular fibroblasts; ↓ in CKD")},
       {k:"alt",label:L("Надморска височина","Altitude"),min:0,max:5000,step:250,value:0,unit:"m",hint:L("4000 m: PaO₂ ≈ 45 mmHg, SaO₂ ≈ 82 %","4000 m: PaO₂ ≈ 45 mmHg, SaO₂ ≈ 82 %")}],
   pre:{norm:{n:L("Норма","Normal"),info:L("Равновесие: ≈ 2×10¹¹ еритроцита на ден се правят и толкова се разрушават. Съзряване в мозъка ≈ 5–7 дни, ретикулоцит 1 ден в кръвта, живот 120 дни. Рециклират се ≈ 22 mg желязо дневно, а от храната се резорбират само 1–2 mg.","Steady state: ≈ 2×10¹¹ red cells are made and destroyed per day. Marrow maturation ≈ 5–7 days, reticulocyte 1 day in blood, lifespan 120 days. ≈ 22 mg of iron is recycled daily while only 1–2 mg is absorbed from food.")},
     bleed:{n:L("Остра кръвозагуба 1 L","Acute blood loss 1 L"),info:L("Веднага след загубата Hb е още нормален (изгубени са клетки и плазма) — спадът до ≈ 12 g/dL се вижда след 12–24 h, когато плазменият обем се възстанови. EPO скача за часове, ретикулоцитите растат от 3–5-ия ден, Hb се нормализира за няколко седмици, ако има запаси от желязо.","Immediately after the loss Hb is still normal (cells and plasma were lost) — the fall to ≈ 12 g/dL appears after 12–24 h, once plasma volume is restored. EPO rises within hours, reticulocytes from day 3–5, and Hb normalises over several weeks if iron stores are adequate.")},
     ida:{n:L("Желязодефицитна анемия","Iron deficiency anaemia"),set:{loss:6,fe:10},info:L("Хронична загуба ≈ 3 mg Fe/ден (6 mL кръв) надвишава това, което резорбцията може да покрие. Последователност: първо падат запасите (феритин < 15 ng/mL), после TSAT < 15 %, накрая Hb. Еритроцитите са микроцитни и хипохромни; хепцидинът е потиснат, TIBC е висок.","A chronic loss of ≈ 3 mg Fe/day (6 mL of blood) exceeds what absorption can cover. Sequence: stores fall first (ferritin < 15 ng/mL), then TSAT < 15 %, Hb last. Cells are microcytic and hypochromic; hepcidin is suppressed and TIBC high.")},
     acd:{n:L("Анемия при хронично възпаление","Anaemia of chronic disease"),set:{infl:100},info:L("IL-6 → хепцидин ↑ → феропортинът е блокиран: желязото е заключено в макрофагите и ентероцитите. Феритинът е висок (острофазов белтък и пълни запаси), TSAT и TIBC са ниски, EPO е неадекватно нисък, а мозъкът отговаря слабо. Анемията е лека, нормоцитна.","IL-6 → hepcidin ↑ → ferroportin is blocked: iron is locked in macrophages and enterocytes. Ferritin is high (acute-phase protein and full stores), TSAT and TIBC are low, EPO is inappropriately low and the marrow responds poorly. The anaemia is mild and normocytic.")},
     perni:{n:L("Пернициозна анемия (дефицит на B12)","Pernicious anaemia (B12 deficiency)"),set:{b12:10},info:L("Без вътрешен фактор B12 не се резорбира в илеума. ДНК-синтезата изостава от цитоплазмената: мегалобласти, MCV > 110 fL, неефективна еритропоеза — мозъкът е хиперцелуларен, но клетките умират в него (билирубин и LDH ↑, ретикулоцитен индекс < 1).","Without intrinsic factor B12 is not absorbed in the ileum. DNA synthesis lags behind cytoplasmic maturation: megaloblasts, MCV > 110 fL, ineffective erythropoiesis — the marrow is hypercellular but cells die in it (bilirubin and LDH ↑, reticulocyte index < 1).")},
     ckd:{n:L("Хронично бъбречно заболяване","Chronic kidney disease"),set:{kid:5,infl:30,life:80},info:L("Перитубулните фибробласти загиват → EPO е нисък или „нормален“, но неадекватен за Hb 9 g/dL — това е диагностичният ключ. Добавят се уремично скъсен живот на еритроцитите (≈ 70–80 дни) и възпаление с висок хепцидин. Анемията е нормоцитна, нормохромна.","Peritubular fibroblasts are lost → EPO is low or “normal” but inappropriate for an Hb of 9 g/dL — this is the diagnostic key. Added are uraemic shortening of red-cell survival (≈ 70–80 days) and inflammation with high hepcidin. The anaemia is normocytic, normochromic.")},
     alt:{n:L("Височина 4000 m","Altitude 4000 m"),set:{alt:4000},info:L("PaO₂ ≈ 45 mmHg, SaO₂ ≈ 82 % → бъбречният HIF-2α не се разгражда → EPO скача за 1–2 дни, после пада, докато Hb се покачи до ≈ 18 g/dL. Запасите от желязо се изразходват. Hct 54–56 % повишава вискозитета.","PaO₂ ≈ 45 mmHg, SaO₂ ≈ 82 % → renal HIF-2α escapes degradation → EPO rises within 1–2 days, then falls as Hb climbs to ≈ 18 g/dL. Iron stores are consumed. An Hct of 54–56 % raises viscosity.")},
     hemo:{n:L("Хемолитична анемия","Haemolytic anaemia"),set:{life:20},info:L("Животът е 20 дни → разрушаването е 6 пъти по-голямо. Мозъкът компенсира до 6–8 пъти, затова Hb се стабилизира около 10 g/dL с висок ретикулоцитен индекс. Желязото се рециклира — феритинът расте; неконюгираният билирубин и LDH са високи.","A 20-day lifespan means 6-fold destruction. The marrow compensates up to 6–8-fold, so Hb settles around 10 g/dL with a high reticulocyte index. Iron is recycled — ferritin rises; unconjugated bilirubin and LDH are high.")},
     esa:{n:L("ЕСА / EPO-допинг","ESA / EPO doping"),info:L("Постоянен екзогенен EPO ≈ 12 mU/mL: Hb и Hct растат, ендогенната секреция е потисната. Запасите от желязо се изразходват (феритинът пада); при възпаление или ХБЗ TSAT пада < 20 % при феритин > 100 — функционален железен дефицит, затова ЕСА се комбинира с желязо. Hct > 55 % = тромботичен риск.","A constant exogenous EPO of ≈ 12 mU/mL: Hb and Hct rise while endogenous secretion is suppressed. Iron stores are drawn down (ferritin falls); with inflammation or CKD TSAT drops < 20 % with ferritin > 100 — functional iron deficiency, which is why ESA is combined with iron. Hct > 55 % = thrombotic risk.")},
     pv:{n:L("Polycythemia vera","Polycythaemia vera"),info:L("JAK2 V617F → EPO-независима пролиферация. Hb ≈ 20 g/dL, а EPO е потиснат (< 2 mU/mL) — това я отличава от вторичната полицитемия при височина или белодробна болест, където EPO е висок. Запасите от желязо намаляват (феритинът пада).","JAK2 V617F → EPO-independent proliferation. Hb ≈ 20 g/dL while EPO is suppressed (< 2 mU/mL) — this separates it from secondary polycythaemia at altitude or in lung disease, where EPO is high. Iron stores are being depleted (ferritin falls).")}},
   exp,init:p=>{const s=erInit();if(p&&p.pre==="bleed")erBleed(s);return s},
   step(s,p,dt){if(p.pre!==lastPre){if(p.pre==="bleed"&&s.t<0.05&&s.Vr>0.99)erBleed(s);lastPre=p.pre}erStep(s,p,dt);SS=s;window.__erP=p},
   rec:(s,p,t)=>{const F=erFlux(s,p);return [t,F.HbM,F.retPct,s.EPO,F.Fer,F.TSAT,s.Hep]},calc:(p,s)=>s?erFlux(s,p):null,
   stats:(p,R,s)=>{if(!s)return [];const F=erFlux(s,p);return [[L("Ден","Day"),fmt(s.t,0)],["Hb",fmt(F.HbM,1)+" g/dL"],[L("Хематокрит","Haematocrit"),fmt(F.Hct*100,0)+" %"],["MCV",fmt(s.MCV,0)+" fL (80–100)"],
     [L("Ретикулоцити","Reticulocytes"),fmt(F.retPct,1)+" % · "+fmt(F.retAbs,0)+"×10⁹/L · RPI "+fmt(F.RPI,1)],["EPO",fmt(s.EPO,s.EPO<100?1:0)+" mU/mL (4–20)"],[L("Хепцидин","Hepcidin"),"×"+fmt(s.Hep,2)],
     [L("Феритин","Ferritin"),fmt(F.Fer,0)+" ng/mL (30–300)"],["TSAT",fmt(F.TSAT,0)+" % (20–45)"],[L("Запаси желязо","Iron stores"),fmt(s.S,0)+" mg"],
     [L("Резорбция / загуба Fe","Fe absorbed / lost"),fmt(F.Abs,1)+" / "+fmt(P_.FeLoss+F.BleedFe,1)+" mg/"+T_(L("ден","day"))],[L("Еритропоеза","Erythropoiesis"),"×"+fmt(F.Pcom/P_.J0,1)+" ("+fmt(100*F.fB,0)+" % "+T_(L("ефективна","effective"))+")"],
     [L("Билирубин / LDH","Bilirubin / LDH"),fmt(s.Bili,1)+" mg/dL · ×"+fmt(s.LDH,1)],[L("Плазмен обем","Plasma volume"),fmt(s.Vr*100,0)+" %"]]},
   note:(p,R,s)=>{if(!s)return "";const F=erFlux(s,p);
     if(s.MCV<80&&F.Fer<30&&F.TSAT<16)return L("<b>Желязодефицит</b>: нисък феритин, висок TIBC и микроцитоза. Търси източник на кървене.","<b>Iron deficiency</b>: low ferritin, high TIBC and microcytosis. Look for a source of bleeding.");
     if(s.MCV<95&&F.Fer>200&&F.TSAT<20&&p.infl>40)return L("<b>Анемия при хронично заболяване</b>: феритинът е висок, а TSAT нисък — желязото е заключено от хепцидина, не липсва. TIBC е нисък (за разлика от желязодефицита).","<b>Anaemia of chronic disease</b>: ferritin is high while TSAT is low — iron is locked away by hepcidin, not missing. TIBC is low (unlike iron deficiency).");
     if(s.MCV>105&&F.RPI<2)return L("<b>Мегалобластна анемия</b>: голям MCV, нисък ретикулоцитен индекс и повишени LDH и билирубин = неефективна еритропоеза в хиперцелуларен мозък.","<b>Megaloblastic anaemia</b>: a high MCV, a low reticulocyte index and raised LDH and bilirubin = ineffective erythropoiesis in a hypercellular marrow.");
     if(F.RPI>2.5&&s.Bili>1.2)return L("<b>Хемолиза</b>: висок ретикулоцитен индекс, неконюгиран билирубин и LDH ↑; желязото се рециклира. Мозъкът работи — проблемът е в периферията.","<b>Haemolysis</b>: a high reticulocyte index, unconjugated bilirubin and LDH ↑; iron is recycled. The marrow works — the problem is peripheral.");
     if(F.HbM<11&&s.EPO<30&&p.kid<50)return L("<b>Неадекватен EPO</b>: при Hb 9 g/dL очакваме EPO в стотици mU/mL. „Нормалната“ стойност при ХБЗ е патологична.","<b>Inappropriate EPO</b>: at an Hb of 9 g/dL we expect EPO in the hundreds of mU/mL. A “normal” value in CKD is pathological.");
     if(F.HbM>17&&s.EPO<3)return L("<b>Полицитемия с потиснат EPO</b> → първична (PV). При вторична (височина, ХОББ, EPO-секретиращ тумор) EPO е висок.","<b>Polycythaemia with suppressed EPO</b> → primary (PV). In secondary causes (altitude, COPD, an EPO-secreting tumour) EPO is high.");
     if(F.HbM>17&&p.alt>2000)return L("<b>Вторична полицитемия от хипоксия</b>: EPO е повишен спрямо Hb, а запасите от желязо се изразходват.","<b>Secondary polycythaemia from hypoxia</b>: EPO is raised for the Hb and iron stores are being used up.");
     if(F.EPOexo>0&&F.TSAT<20&&F.Fer>=100)return L("<b>Функционален железен дефицит при ЕСА</b>: TSAT < 20 % при феритин > 100 — мобилизацията изостава от търсенето.","<b>Functional iron deficiency on ESA</b>: TSAT < 20 % with ferritin > 100 — mobilisation lags behind demand.");
     if(F.EPOexo>0&&F.Fer<100)return L("ЕСА изразходва запасите: феритинът пада, докато TSAT е нормален.","ESA drains iron stores: ferritin falls while TSAT stays normal.");
     if(p.pre==="bleed"&&s.Vr<0.97)return L("<b>Първите часове след кръвоизлив</b>: Hb още не е паднал — губят се клетки и плазма заедно. Следи реда „Плазмен обем“.","<b>The first hours after bleeding</b>: Hb has not fallen yet — cells and plasma are lost together. Watch the “Plasma volume” row.");
     if(p.pre==="bleed"&&s.t<21)return L("<b>Хемодилуция</b>: плазменият обем се възстанови и Hb падна; EPO е повишен, ретикулоцитите растат от 3–5-ия ден.","<b>Haemodilution</b>: plasma volume has recovered and Hb has fallen; EPO is raised and reticulocytes rise from day 3–5.");
     return L("Бъбрекът мери доставката на O₂ и управлява мозъка чрез EPO (<b>отрицателна обратна връзка</b>); хепцидинът управлява желязото.","The kidney senses O₂ delivery and drives the marrow through EPO (<b>negative feedback</b>); hepcidin governs iron.")},
   legend:`<span><i style="background:${C.hb}"></i>Hb (g/dL)</span><span><i style="background:${C.ret}"></i>${T_(L("ретикулоцити % ×2","reticulocytes % ×2"))}</span><span><i style="background:${C.epo}"></i>EPO (log)</span><span><i style="background:#e64980"></i>TSAT %</span><span><i style="background:${C.fer}"></i>${T_(L("феритин /10","ferritin /10"))}</span><span><i style="background:${C.hep}"></i>${T_(L("хепцидин ×10","hepcidin ×10"))}</span>`,
   plots:[{f:(p,R,h)=>{const x=h.map(a=>a[0]),T=Math.max(120,Math.ceil((x[x.length-1]||0)/10)*10);return {xmin:T-120,xmax:T,ymin:0,ymax:24,xlabel:L("време, дни","time, days"),ylabel:L("Hb (g/dL), ретикулоцити % ×2","Hb (g/dL), reticulocytes % ×2"),series:[{x,y:h.map(a=>a[1]),color:C.hb,width:2.4},{x,y:h.map(a=>Math.min(24,a[2]*2)),color:C.ret,width:2},{x:[T-120,T],y:[13,13],color:"#868e96",width:1,dash:[4,4]}]}}},
          {f:(p,R,h)=>{const x=h.map(a=>a[0]),T=Math.max(120,Math.ceil((x[x.length-1]||0)/10)*10);return {xmin:T-120,xmax:T,ymin:0,ymax:70,xlabel:L("време, дни","time, days"),ylabel:L("EPO: 5·log₁₀ (1/10/100/1000 → 0/5/10/15); TSAT %; феритин/10; хепцидин ×10","EPO: 5·log₁₀ (1/10/100/1000 → 0/5/10/15); TSAT %; ferritin/10; hepcidin ×10"),series:[{x,y:h.map(a=>5*Math.log10(Math.max(1,a[3]))),color:C.epo,width:2.2},{x,y:h.map(a=>a[5]),color:"#e64980",width:2},{x,y:h.map(a=>Math.min(70,a[4]/10)),color:C.fer,width:2},{x,y:h.map(a=>Math.min(70,a[6]*10)),color:C.hep,width:2,dash:[5,3]}]}}}],
   draw};
  window.__erCfg=cfg;mkSim(main,cfg);
  const card=main.querySelector(".card");card.parentNode.insertBefore(v3.el,card);(window.__cleanups=window.__cleanups||[]).push(v3.start());if(STG_ER&&typeof zAddStg==="function")zAddStg(main,STG_ER)}

zRegister("erythro",{name:L("Еритропоеза, желязо и анемии","Erythropoiesis, iron and anaemias"),view,book,tests,exp,gl});
window.__erModel={erInit,erStep,erFlux,erBleed};
})();
