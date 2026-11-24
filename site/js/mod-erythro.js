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

/* ---------- модел ---------- */
const P_={J0:0.125,tauM:2.0,FeHb:173,FeLoss:1.0};
function erInit(){return {t:0,Hb:15.0,Rt:0.125,E1:0.25,E2:0.25,E3:0.25,EPO:9,Hep:1.0,Fp:3.0,S:1000,MCV:90,Vr:1.0,Bili:0.6,LDH:1.0}}
function erFlux(s,p){const pre=p.pre||"norm",alt=p.alt,infl=p.infl,kid=p.kid,b12=p.b12,fe=p.fe,loss=p.loss,life=p.life,EPOexo=pre==="esa"?12:0;
  const PB=760*Math.exp(-alt/7990),PiO2=0.2093*(PB-47),PaCO2=40-10*Math.min(1,alt/4000),PaO2=PiO2-PaCO2/0.8-5,SaO2=Math.pow(PaO2,2.7)/(Math.pow(PaO2,2.7)+Math.pow(26.6,2.7));
  const HbM=(s.Hb+s.Rt)/s.Vr,DO2=HbM*SaO2/0.97;
  let EPOt=8*(kid/100)*Math.exp(0.65*(15-DO2))*Math.exp(0.012*(95-PaO2))*(1-0.6*infl/100)+EPOexo;EPOt=cl(EPOt,0.2,20000);if(pre==="pv")EPOt=1.0;
  const TIBC=9*(1+0.8*cl(1-s.S/500,0,1))*(1-0.3*infl/100),TSAT=Math.min(100,100*s.Fp/TIBC),Fer=0.125*s.S*(1+1.5*infl/100);
  const ERFE=cl(Math.log10(Math.max(0.01,s.EPO)/8)/1.5,0,2),Hept=cl(Math.pow(cl(s.S/1000,0.02,3),1.6)*(1+6*infl/100)*(1+(1-kid/100))/(1+3*ERFE),0.02,6);
  const fFP=cl(2/(1+s.Hep),0.1,1.8),aMax=0.067*(1+1.5*cl(1-s.S/500,0,1)),Abs=Math.min(5,fe*aMax*fFP);
  const fE=Math.min(8,Math.pow(Math.max(0.01,s.EPO)/8,0.45))*(1-0.45*infl/100),fFe=Math.min(1,(TSAT/(TSAT+10))/0.75);
  const Hct=HbM*3/100,fV=cl((0.65-Hct)/0.05,0,1);let Pcom=P_.J0*fE*fFe*fV;if(pre==="pv")Pcom=0.26*fFe*fV;
  const fB=b12/100,Rel=(s.E3/2)*fB,Ineff=(s.E3/2)*(1-fB),Tr=1+1.2*cl(Math.log10(Math.max(0.01,s.EPO)/8)/2,0,1);
  const LifeE=life*(1-0.25*infl/100),Destr=s.Hb/LifeE,BleedHb=s.Hb*loss/5000,BleedFe=loss*HbM*0.0347;
  const Rec=(Destr+Ineff)*173,RelM=Rec*Math.min(1,0.45+0.55*fFP),Mob=0.02*Math.min(s.S,1200)*(0.3+0.7*fFP)*Math.max(0,1-s.Fp/3),Upt=Pcom*173,Dep=25*Math.max(0,s.Fp-3);
  const retPct=100*s.Rt/(s.Hb+s.Rt),RPI=retPct*(HbM/15)/Tr,RBC=HbM*10/(s.MCV*0.33),retAbs=retPct/100*RBC*1000;
  return {PaO2,SaO2,HbM,DO2,EPOt,TIBC,TSAT,Fer,ERFE,Hept,fFP,Abs,fE,fFe,Hct,fV,Pcom,fB,Rel,Ineff,Tr,Destr,BleedHb,BleedFe,Rec,RelM,Mob,Upt,Dep,retPct,RPI,RBC,retAbs,EPOexo}}
function erStep(s,p,dt){const F=erFlux(s,p);
  s.EPO+=(F.EPOt-s.EPO)*Math.min(1,dt/0.25);s.Hep+=(F.Hept-s.Hep)*Math.min(1,dt/0.5);
  s.E1+=(F.Pcom-s.E1/2)*dt;s.E2+=(s.E1-s.E2)/2*dt;s.E3+=(s.E2-s.E3)/2*dt;
  s.Rt+=(F.Rel-s.Rt/F.Tr)*dt;s.Hb=Math.max(1,s.Hb+(s.Rt/F.Tr-F.Destr-F.BleedHb)*dt);
  s.Fp=Math.max(0.05,s.Fp+(F.Abs+F.RelM+F.Mob-F.Upt-F.Dep)*dt);
  s.S+=(F.Dep+F.Rec-F.RelM-F.Mob-P_.FeLoss-F.BleedFe)*dt;if(s.S<0){s.Fp=Math.max(0.05,s.Fp+s.S);s.S=0}if(s.S>4000)s.S=4000;
  const MCVt=cl(90-26*(1-F.fFe)+32*(1-F.fB)+3*Math.min(2,F.retPct/5),58,128);s.MCV+=(MCVt-s.MCV)*dt/20;s.Vr+=(1-s.Vr)*dt/1.0;
  s.Bili+=(0.3+0.3*(F.Destr/0.125)+0.45*(F.Ineff/0.125)-s.Bili)*dt;s.LDH+=(1+1.2*(F.Destr/0.125-1)+2.5*(F.Ineff/0.125)-s.LDH)*dt;s.t+=dt}
function erBleed(s){s.Hb*=0.8;s.Rt*=0.8;s.Vr=0.80;s.S=Math.max(0,s.S-250)}   // остра загуба 1 L: клетки и плазма заедно

/* ---------- 2D: бъбрек → костен мозък → кръв и железен кръговрат ---------- */
const C={epo:"#1c7ed6",hb:"#c92a2a",ret:"#f76707",fe:"#a5532a",tf:"#748ffc",hep:"#7048e8",fer:"#9c6644",il:"#e64980",gr:"#868e96"};
function draw(g,p,R,t,dt,s){if(!s)return;const F=erFlux(s,p),T=(x,y,txt,o)=>Z.T(g,x,y,T_(txt),o),mut=css("--muted");
  // бъбрек
  Z.org(g,18,16,170,48,C.epo,T_(L("Бъбрек","Kidney")),"PaO₂ "+fmt(F.PaO2,0)+" · SaO₂ "+fmt(F.SaO2*100,0)+" %",cl((15-F.DO2)/8,0,1));
  T(103,82,"EPO "+fmt(s.EPO,s.EPO<100?1:0)+" mU/mL",{fs:11.5,w:700,c:C.epo});
  Z.arr(g,103,88,103,112,C.epo,1+1.6*Math.log10(1+s.EPO/4),"");
  // костен мозък: верига
  const st=[[L("BFU-E/CFU-E","BFU-E/CFU-E"),s.E1],[L("еритробласти","erythroblasts"),s.E2],[L("нормобласти","normoblasts"),s.E3]],x0=18,y0=116;
  st.forEach(([n,v],i)=>{const x=x0+i*92;Z.box(g,x,y0,84,34,C.hb,C.hb,8,1.2,0.08+0.5*cl(v/0.6,0,1));T(x+42,y0+21,n,{fs:10,w:700});if(i<2)Z.arr(g,x+85,y0+17,x+91,y0+17,C.gr,1.5,"")});
  T(x0+138,y0+50,T_(L("ефективност","efficiency"))+" "+fmt(F.fB*100,0)+" %  ·  ×"+fmt(F.Pcom/P_.J0,1),{fs:10.5,c:mut});
  if(F.fB<0.99)Z.arr(g,x0+230,y0+36,x0+250,y0+66,C.blk||"#c92a2a",1+3*(1-F.fB),T_(L("умират в мозъка","die in the marrow")),{dash:[4,3],dx:8});
  Z.arr(g,x0+268,y0+17,x0+300,y0+17,C.ret,1+F.Rel*12,"");T(x0+318,y0+21,L("ретикулоцити","reticulocytes"),{fs:10.5,c:C.ret,w:700,a:"left"});
  // кръв: еритроцити (брой ∝ Hb, диаметър ∝ ∛MCV, бледост ∝ TSAT)
  const bx=18,by=206,bw=360,bh=96;Z.box(g,bx,by,bw,bh,css("--line"),null,10,1,0);
  const n=Math.round(cl(F.HbM*2.6,6,60)),r=5.2*Math.cbrt(s.MCV/90),pal=cl(0.33+0.9*(1-F.fFe),0.33,0.8);
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
/*__3D__*/

/* ---------- урок ---------- */
/*__BOOK__*/

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
     esa:{n:L("ЕСА / EPO-допинг","ESA / EPO doping"),info:L("Постоянен екзогенен EPO ≈ 12 mU/mL: Hb и Hct растат, ендогенната секреция е потисната. Появява се функционален железен дефицит — феритинът пада, въпреки че запасите не са нула; затова при лечение с ЕСА се дава и желязо. Hct > 55 % = тромботичен риск.","A constant exogenous EPO of ≈ 12 mU/mL: Hb and Hct rise while endogenous secretion is suppressed. Functional iron deficiency appears — ferritin falls although stores are not empty; this is why ESA therapy is given with iron. Hct > 55 % = thrombotic risk.")},
     pv:{n:L("Polycythemia vera","Polycythaemia vera"),info:L("JAK2 V617F → EPO-независима пролиферация. Hb ≈ 20 g/dL, а EPO е потиснат (< 2 mU/mL) — това я отличава от вторичната полицитемия при височина или белодробна болест, където EPO е висок. Запасите от желязо се изчерпват.","JAK2 V617F → EPO-independent proliferation. Hb ≈ 20 g/dL while EPO is suppressed (< 2 mU/mL) — this separates it from secondary polycythaemia at altitude or in lung disease, where EPO is high. Iron stores are exhausted.")}},
   exp,init:()=>erInit(),
   step(s,p,dt){if(p.pre!==lastPre){lastPre=p.pre;if(p.pre==="bleed")erBleed(s)}erStep(s,p,dt);SS=s;window.__erP=p},
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
     if(F.RPI>2.5&&s.Bili>1.5)return L("<b>Хемолиза</b>: висок ретикулоцитен индекс, неконюгиран билирубин и LDH ↑; желязото се рециклира. Мозъкът работи — проблемът е в периферията.","<b>Haemolysis</b>: a high reticulocyte index, unconjugated bilirubin and LDH ↑; iron is recycled. The marrow works — the problem is peripheral.");
     if(F.HbM<11&&s.EPO<30&&p.kid<50)return L("<b>Неадекватен EPO</b>: при Hb 9 g/dL очакваме EPO в стотици mU/mL. „Нормалната“ стойност при ХБЗ е патологична.","<b>Inappropriate EPO</b>: at an Hb of 9 g/dL we expect EPO in the hundreds of mU/mL. A “normal” value in CKD is pathological.");
     if(F.HbM>17&&s.EPO<3)return L("<b>Полицитемия с потиснат EPO</b> → първична (PV). При вторична (височина, ХОББ, EPO-секретиращ тумор) EPO е висок.","<b>Polycythaemia with suppressed EPO</b> → primary (PV). In secondary causes (altitude, COPD, an EPO-secreting tumour) EPO is high.");
     if(F.HbM>17&&p.alt>2000)return L("<b>Вторична полицитемия от хипоксия</b>: EPO е повишен спрямо Hb, а запасите от желязо се изразходват.","<b>Secondary polycythaemia from hypoxia</b>: EPO is raised for the Hb and iron stores are being used up.");
     if(F.EPOexo>0&&F.Fer<100)return L("<b>Функционален железен дефицит при ЕСА</b>: мобилизацията на желязо изостава от търсенето.","<b>Functional iron deficiency on ESA</b>: iron mobilisation lags behind demand.");
     if(p.pre==="bleed"&&s.t<3)return L("<b>Първите часове след кръвоизлив</b>: Hb още не е паднал — губят се клетки и плазма заедно. Следи реда „Плазмен обем“.","<b>The first hours after bleeding</b>: Hb has not fallen yet — cells and plasma are lost together. Watch the “Plasma volume” row.");
     return L("Бъбрекът мери доставката на O₂ и управлява мозъка чрез EPO (<b>отрицателна обратна връзка</b>); хепцидинът управлява желязото.","The kidney senses O₂ delivery and drives the marrow through EPO (<b>negative feedback</b>); hepcidin governs iron.")},
   legend:`<span><i style="background:${C.hb}"></i>Hb (g/dL)</span><span><i style="background:${C.ret}"></i>${T_(L("ретикулоцити % ×2","reticulocytes % ×2"))}</span><span><i style="background:${C.epo}"></i>EPO (log)</span><span><i style="background:#e64980"></i>TSAT %</span><span><i style="background:${C.fer}"></i>${T_(L("феритин /10","ferritin /10"))}</span><span><i style="background:${C.hep}"></i>${T_(L("хепцидин ×10","hepcidin ×10"))}</span>`,
   plots:[{f:(p,R,h)=>{const x=h.map(a=>a[0]),T=Math.max(120,Math.ceil((x[x.length-1]||0)/10)*10);return {xmin:T-120,xmax:T,ymin:0,ymax:24,xlabel:L("време, дни","time, days"),ylabel:L("Hb (g/dL), ретикулоцити % ×2","Hb (g/dL), reticulocytes % ×2"),series:[{x,y:h.map(a=>a[1]),color:C.hb,width:2.4},{x,y:h.map(a=>Math.min(24,a[2]*2)),color:C.ret,width:2},{x:[T-120,T],y:[13,13],color:"#868e96",width:1,dash:[4,4]}]}}},
          {f:(p,R,h)=>{const x=h.map(a=>a[0]),T=Math.max(120,Math.ceil((x[x.length-1]||0)/10)*10);return {xmin:T-120,xmax:T,ymin:0,ymax:70,xlabel:L("време, дни","time, days"),ylabel:L("EPO: 5·log₁₀ (1/10/100/1000 → 0/5/10/15); TSAT %; феритин/10; хепцидин ×10","EPO: 5·log₁₀ (1/10/100/1000 → 0/5/10/15); TSAT %; ferritin/10; hepcidin ×10"),series:[{x,y:h.map(a=>5*Math.log10(Math.max(1,a[3]))),color:C.epo,width:2.2},{x,y:h.map(a=>a[5]),color:"#e64980",width:2},{x,y:h.map(a=>Math.min(70,a[4]/10)),color:C.fer,width:2},{x,y:h.map(a=>Math.min(70,a[6]*10)),color:C.hep,width:2,dash:[5,3]}]}}}],
   draw};
  window.__erCfg=cfg;mkSim(main,cfg);
  const card=main.querySelector(".card");card.parentNode.insertBefore(v3.el,card);(window.__cleanups=window.__cleanups||[]).push(v3.start())}

zRegister("erythro",{name:L("Еритропоеза, желязо и анемии","Erythropoiesis, iron and anaemias"),view,book,tests,exp,gl});
window.__erModel={erInit,erStep,erFlux,erBleed};
})();
