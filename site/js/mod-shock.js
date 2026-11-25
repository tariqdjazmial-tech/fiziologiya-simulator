/* ===== Шок и кръвозагуба: интегрирана регулация =====
   Образователен модел (Guyton & Hall, гл. 24, 20, 18, 16; ATLS 10; Sepsis-3). Спецификация: design/topics/shock.md.
   Време: 1 моделна единица = 1 min; time-warp 1 s реално = 6 s → 1 min → 10 min → 1 h модел (по s.t), вътрешна стъпка ≤ 0,02 min.
   - кръвообращението е алгебрично: CO = VR в пресечната точка на кривите на Гайтън (бисекция);
   - рефлекси и хормони: експоненциален релаксационен интегратор (безусловно стабилен); обеми/белтък/лактат — явен Ойлер;
   - много коефициенти (сигмоиди на рефлексите, хормоните, O₂-дълга, Ir) са калибрирани образователни приближения
     (проверени срещу ATLS и Guyton, §1.6 на спецификацията) — не са измерени константи. */
(function(){"use strict";
if(typeof mkSim!=="function"||typeof zRegister!=="function")return;
const T_=x=>window.T?window.T(x):x,EN=window.__EN=window.__EN||{},L=(bg,en)=>{if(en)EN[bg]=en;return bg},cl=(v,a,b)=>Math.max(a,Math.min(b,v));
[["# mL","# mL"],["# %","# %"],["# mmHg","# mmHg"],["# L/min","# L/min"],["# mL/h","# mL/h"],["# min","# min"],["# h","# h"]].forEach(([b,e])=>L(b,e));

/* ---------- модел (проверен с node; виж §1.3–1.6 на спецификацията) ---------- */
const LP=C=>1.094*(2.1*C+0.16*C*C+0.009*C*C*C); // Landis–Pappenheimer, C g/dL → mmHg (28 при 7 g/dL)
const P_={V0:5000,Vu0:4000,C0:143,RVR0:1.4,TPR0:18.6,SV0max:125,R0:-2,kS:2.5,M50:85.7,kB:8,HRi:100,kVu:400,Kf0:6.67,PS0:1.5,L0:2.0,Cint:1000,
  VO2:250,ER:0.7,Dc:7000,Ith:0.15,tI:20,def0:0,UO0:1.0,INS:0.6,DR0:1.6,Rb:100,Ri:100};
function shInit(p){return {t:0,Vp:2750,Vr:2250,Vi:11000,Mp:192.5,Mi:308,sym:1,par:1,Ren:1,Ang:1,Ald:1,ADH:1,Lac:1.0,D:0,Ir:0,
  bled:0,gC:0,gB:0,MAP:93,RAP:0,UOc:0,dead:0,low:0}}
function shFlux(s,p){
  const pre=p.pre||"norm",sept=pre==="sept",ana=pre==="anaph";
  const V=s.Vp+s.Vr,Hct=s.Vr/V,Cp=100*s.Mp/s.Vp,Ci=100*s.Mi/s.Vi;
  const HCO3=Math.max(4,24-0.95*(s.Lac-1)),PaCO2=cl(1.5*HCO3+8,15,40),pH=6.1+Math.log10(HCO3/(0.03*PaCO2));
  const fa=cl(1-2*(7.30-pH),0.35,1);                          // ацидоза: ↓ отговор на катехоламини под pH 7,30
  const Ie=cl(s.Ir,0,1);
  const rV=fa*(1-0.6*Ie), rM=fa*(1-0.7*Ie);
  const E=s.e||p, tone=E.symt/100, symE=tone*s.sym;                       // ефективен еферентен симпатикус
  const vd=E.tpr/100;                                           // съдов тонус
  const leak=cl(E.leak/100+0.6*Ie,0,1);
  // вени
  const Vu=P_.Vu0+700*Math.max(0,1-vd)*(ana?1.4:1)-P_.kVu*cl(symE-1,-1,1.5)*rV-150*Math.log(s.Ang);
  const Cv=P_.C0/(1+0.2*(symE-1)*rV);
  const sx=(V-Vu)/Cv, MSFP=sx>1?sx:Math.exp(sx-1);              // меко отрязване при V<Vu
  const RVR=P_.RVR0*(1+0.1*(symE-1))*Math.pow(vd,0.25)*Math.pow(Hct/0.45,0.3);
  // сърце
  const HR=cl(P_.HRi+30*cl(symE-1,-1,1.8)-28*s.par,30,210);
  const fill=HR<=100?1:Math.max(0.2,1-Math.pow((HR-100)/160,1.5));
  const cf=Math.max(0.05,(E.contr/100)*(1+0.45*(symE-1)*rM)*rM*(1-0.5*Math.max(0,(40-s.MAP)/40)));  // + коронарна хипоперфузия
  const aft=cl(Math.pow(93/Math.max(20,s.MAP),0.3),0.75,1.5);
  const SVm=P_.SV0max*cf*fill*aft, kS=P_.kS/Math.pow(cl(E.contr/100,0.1,1.5),0.7);   // слабото сърце: по-ниска И по-полегата крива
  const CO_h=r=>r<=P_.R0?0:HR*SVm*(1-Math.exp(-(r-P_.R0)/kS))/1000;
  const VR=r=>(MSFP-Math.max(r,P_.R0))/RVR;
  let a=P_.R0,b=40;for(let i=0;i<24;i++){const m=(a+b)/2;if(CO_h(m)-VR(m)>0)b=m;else a=m}
  const RAP=(a+b)/2,CO=CO_h(RAP),SV=CO>0?1000*CO/HR:0;
  const hv=sept?0.4:1;   // сепсис: съдова хипореактивност (NO, K-ATP)
  const TPR=P_.TPR0*vd*(1+0.3*cl(symE-1,-1,1.2)*rV*hv)*Math.pow(s.Ang,0.12*rV*hv)*(1+0.05*Math.log(Math.max(1,s.ADH))*rV*hv)*Math.pow(Hct/0.45,0.4)*(1-0.35*Ie);
  const MAP=CO*TPR+RAP;
  const Ca=1.7/(1+0.5*Math.max(0,symE-1));
  const PP=SV/Ca, SBP=MAP+2/3*PP, DBP=MAP-PP/3;
  // рефлекси (таргети)
  const chem=0.8*cl((80-MAP)/40,0,1)+0.1*Math.max(0,s.Lac-2);
  const cns=1.5*cl((50-MAP)/30,0,1);
  const cp=cl(0.15*(0-RAP),-0.3,0.8);                           // кардиопулмонални (обемни) рецептори
  const cm=1-0.7*Ie;                                            // отказ на вазомоторния център
  const symT=cl((0.2+2.8/(1+Math.exp((MAP-P_.M50)/P_.kB))+chem+cns+cp)*cm,0.05,4);
  const parT=2/(1+Math.exp(-(MAP-93)/6));
  // хормони
  const RenT=cl(Math.exp(0.035*(93-MAP)),0.3,15)*Math.max(0.2,1+0.6*(symE-1));
  const ADHT=(sept?0.35:1)*cl(Math.exp(0.07*Math.max(0,90-MAP)+0.9*Math.max(0,-0.3-RAP)-0.3*Math.max(0,RAP-2)*cl((MAP-80)/10,0,1)),0.2,60);
  const AldT=Math.pow(s.Ang,0.8);
  // бъбрек
  const gfr=cl((MAP-50)/30,0,1)*(1-0.3*cl(symE-1,0,2))*Math.sqrt(cl(CO/4.5,0.2,1));
  const pn=MAP>93?Math.exp(0.03*(MAP-93)):1;
  const UO=P_.UO0*gfr*Math.pow(s.ADH,-0.45)*Math.pow(s.Ald,-0.25)*pn*(1+0.08*Math.max(0,RAP-2)*cl((MAP-85)/8,0,1));
  const thirst=cl(1+0.8*Math.log(s.Ang)+0.4*Math.log(Math.max(1,s.ADH)),0.4,4);
  const drink=(MAP>70&&s.t>360)?P_.DR0*thirst:0;
  // Старлинг
  const Pi=-3+(s.Vi-11000)/(s.Vi<11000?P_.Cint:P_.Cint*8);
  const r=14.3*(1+0.8*(symE-1)*rV)*Math.pow(vd,0.7);
  const Pvn=MSFP+5,Pc=Pvn+(MAP-Pvn)/(1+r);
  const Kf=P_.Kf0*(1+3*leak),sig=1-0.7*leak,PS=P_.PS0*(1+15*leak);
  const pip=LP(Cp),pii=LP(Ci);
  const Jv=Kf*((Pc-Pi)-sig*(pip-pii));                          // mL/min плазма → интерстициум
  const Lym=P_.L0*cl(Math.exp(0.5*(Pi+3)),0.05,20)*(1+0.4*cl(symE-1,0,2));
  const Jp=Math.max(0,Jv)*(1-sig)*Cp/100+PS*(Cp-Ci)/100;        // g/min
  const JpL=Lym*Ci/100;
  // O2
  const Hb=Hct*100/3,CaO2=1.34*Hb*0.97+0.3,DO2=CO*CaO2*10;
  const dem=P_.VO2*(sept?1.3:1),ER=sept?0.35:(ana?0.6:P_.ER);
  const sup=ER*DO2,VO2=sup*dem/Math.pow(Math.pow(sup,4)+Math.pow(dem,4),1/4);
  const def=Math.max(0,dem-VO2-P_.def0);
  // лактат (mmol/min; Vd 30 L)
  const hep=cl(Math.pow(CO/5,0.7),0.1,1.3)*(1-0.5*Ie);
  const Lprod=1.0+0.05*def+0.3*Math.max(0,symE-1.5)*(sept?2:1);
  const Lclr=6*s.Lac/(5+s.Lac)*hep*(sept?0.6:1);
  const RR=cl(14+3*(s.Lac-1)+10*cl(symE-1,0,2)+6*cl((70-MAP)/30,0,1),8,50);
  return {V,Hct,Cp,Ci,pH,HCO3,BE:-(24-HCO3),PaCO2,Ie,symE,Vu,MSFP,RVR,HR,SV,CO,RAP,TPR,MAP,PP,SBP,DBP,SI:HR/Math.max(1,SBP),
    SVm,kS,symT,parT,RenT,ADHT,AldT,UO,thirst,drink,Pi,Pc,Jv,Lym,Jp,JpL,pip,pii,DO2,VO2,dem,def,Lprod,Lclr,RR,ER,sup,leak,cf,fa}}
function shStep(s,p,dt){const pre=p.pre||"norm";
  const ex=(x,xt,tau)=>x+(xt-x)*(1-Math.exp(-dt/tau));
  if(!s.e)s.e={contr:100,tpr:100,symt:100,leak:0};const tr=pre==="sept"?30:pre==="neuro"?0.5:2;
  for(const k of ["contr","tpr","symt","leak"])s.e[k]=ex(s.e[k],p[k],tr);
  const F=shFlux(s,p);if(s.dead)return F;
  s.sym=ex(s.sym,F.symT,0.15);s.par=ex(s.par,F.parT,0.03);
  s.Ren=ex(s.Ren,F.RenT,15);s.Ang=ex(s.Ang,s.Ren,3);s.Ald=ex(s.Ald,F.AldT,40);s.ADH=ex(s.ADH,F.ADHT,8);
  // кръвозагуба и вливания (100 mL/min)
  const bR=Math.min(P_.Rb,Math.max(0,p.loss-s.bled)/dt);
  const tI=pre==="irr"?300:30, on=s.t>=tI;
  const cR=on?Math.min(P_.Ri,Math.max(0,p.cry-s.gC)/dt):0;
  const kR=on?Math.min(P_.Ri,Math.max(0,p.bld-s.gB)/dt):0;
  s.bled+=bR*dt;s.gC+=cR*dt;s.gB+=kR*dt;
  const Vp=s.Vp,Cpm=s.Mp/s.Vp;
  s.Vp+=(-bR*(1-F.Hct)+cR+0.6*kR-F.Jv+F.Lym-F.UO-P_.INS+F.drink)*dt;
  s.Vr+=(-bR*F.Hct+0.4*kR)*dt;
  s.Vi+=(F.Jv-F.Lym)*dt;
  const syn=0.0006*(192.5-s.Mp-0.0*s.Mi)*(1); // черен дроб: τ ≈ 28 h
  s.Mp+=(-bR*(1-F.Hct)*Cpm+0.6*kR*0.06-F.Jp+F.JpL+syn)*dt;
  s.Mi+=(F.Jp-F.JpL)*dt;
  s.Lac=Math.max(0.3,s.Lac+(F.Lprod-F.Lclr)/30*dt);
  const spare=F.sup-F.dem;
  s.D=Math.max(0,s.D+(F.def-s.D/240*cl(spare/F.dem,0,1))*dt);   // „изплащане“ на O₂-дълга само при резервен капацитет
  s.Ir=Math.min(1.2,s.Ir+(Math.max(0,s.D-P_.Dc)/P_.Dc+(s.Ir>P_.Ith?0.5*s.Ir:0))/P_.tI*dt);   // > Ith: автокаталитично (порочен кръг)
  s.MAP=F.MAP;s.RAP=F.RAP;s.UOc+=F.UO*dt;
  s.low=F.MAP<25?s.low+dt:0;if(s.low>5)s.dead=1;
  s.t+=dt;return F}
{const s0=shInit({}),F0=shFlux(s0,{loss:0,cry:0,bld:0,contr:100,tpr:100,symt:100,leak:0});P_.L0=P_.L0*F0.Jv/F0.Lym;const F1=shFlux(s0,{loss:0,cry:0,bld:0,contr:100,tpr:100,symt:100,leak:0});P_.PS0=F1.JpL*100/(F1.Cp-F1.Ci);P_.def0=Math.max(0,F1.dem-F1.VO2);P_.DR0=F1.UO+P_.INS}

/* ---------- време: автоматично „свиване“ (моделни минути за 1 реална секунда) ---------- */
const W=t=>t<3?0.1:t<30?1:t<360?10:60;
const TEND=4320;                                    // спира на 72 h
const fmtT=t=>{if(t<1)return Math.round(t*60)+" s";if(t<60)return fmt(t,0)+" min";if(t<1440){const h=Math.floor(t/60),m=Math.floor(t-60*h);return h+" h"+(m?" "+m+" min":"")}
  const d=Math.floor(t/1440),h=Math.floor((t-1440*d)/60);return d+" d"+(h?" "+h+" h":"")};
const wLab=w=>w<0.05?"1 s":w<0.5?"6 s":w<5?"1 min":w<30?"10 min":"1 h";
const tInf=p=>p.pre==="irr"?300:30;                 // начало на вливанията (min)

/* ---------- 2D: мозъчен ствол · кръвообращение (кривите на Гайтън „на живо“) · хормони · метаболизъм · скала на времето ---------- */
const C={map:"#c92a2a",hr:"#1c7ed6",co:"#7048e8",lac:"#d9480f",hct:"#a61e4d",vol:"#364fc7",adh:"#ae3ec9",ren:"#e64980",gr:"#868e96",ven:"#364fc7",venL:"#bac8ff",cry:"#1c7ed6",bld:"#c92a2a"};
const AN={hp:0,pc:0,pn:0,vc:0,dr:0};
function draw(g,p,R,t,dt,s){if(!s)return;const F=shFlux(s,p),E=s.e||p,T=(x,y,txt,o)=>Z.T(g,x,y,T_(txt),o),mut=css("--muted"),line=css("--line");
  dt=Math.min(dt||0.016,0.1);AN.hp+=dt*F.HR/60;AN.pc+=dt*0.05*F.CO;AN.pn+=dt*F.MAP/90;AN.dr+=dt;
  if(s.Ir>0.15&&!s.dead)AN.vc+=dt*(0.6+1.5*cl(s.Ir,0,1.2));
  const pnl=(x,y,w,h,ti)=>{Z.box(g,x,y,w,h,null,line,10,1);T(x+8,y+15,ti,{fs:11.5,w:700,a:"left",c:mut})};
  /* 1. мозъчен ствол (горе вляво) */
  pnl(8,8,192,128,L("Мозъчен ствол","Brainstem"));
  g.strokeStyle=C.map;g.lineWidth=2;g.beginPath();g.arc(30,112,9,0,7);g.stroke();T(12,131,L("каротиден синус","carotid sinus"),{fs:9.5,c:mut,a:"left"});
  g.strokeStyle=mut;g.lineWidth=1.2;g.beginPath();g.moveTo(36,104);g.lineTo(66,60);g.stroke();
  Z.dots(g,[[36,104],[66,60]],AN.pn,C.map,Math.round(cl(F.MAP/14,1,8)),2.4);
  Z.org(g,54,36,58,26,C.hr,"NTS","",0.2);Z.org(g,130,36,62,26,C.map,"RVLM","",cl(F.symE/3,0,1));
  Z.arr(g,113,49,128,49,mut,1.2,"",{dash:[3,2]});T(120,74,L("− (през CVLM)","− (via CVLM)"),{fs:9,c:mut});
  const lamp=(x,y,on,lab)=>{g.beginPath();g.arc(x,y,5,0,7);if(on){g.fillStyle=C.map;g.fill()}g.strokeStyle=on?C.map:mut;g.lineWidth=1.2;g.stroke();T(x+9,y+4,lab,{fs:9.5,a:"left",c:on?C.map:mut,w:on?700:500})};
  lamp(52,94,F.MAP<80,L("хеморецептори","chemoreceptors"));lamp(52,112,F.MAP<50,L("CNS исхемия","CNS ischaemia"));
  T(194,104,T_(L("симп.","symp."))+" ×"+fmt(F.symE,2),{fs:9.5,c:C.map,w:700,a:"right"});T(194,118,T_(L("вагус","vagus"))+" ×"+fmt(s.par,2),{fs:9.5,c:C.hr,w:700,a:"right"});
  /* 2. кръвообращение (център) */
  const hx=232,hy=168,bt=Math.pow(Math.max(0,Math.sin(2*Math.PI*AN.hp)),2),amp=cl(F.SV/70,0.1,1.4),sq=1-0.16*amp*bt;
  const loop=[[246,142],[262,62],[402,62],[414,100],[414,196],[402,236],[262,236],[232,196],[244,150]];
  // вени: резервоар (ненапрегнат + напрегнат обем)
  const vx=270,vy=208,vw=124,vh=56,uh=cl(F.Vu/5000,0,1.3)*30,sh=cl(F.MSFP,0,16)*1.6;
  Z.box(g,vx,vy+vh-uh,vw,uh,C.venL,null,4,0,0.9);Z.box(g,vx,vy+vh-uh-sh,vw,sh,C.ven,null,3,0,0.85);
  g.strokeStyle=C.ven;g.lineWidth=1+1.2*cl(F.symE,0,3);const vin=2*cl(F.symE-1,0,2);g.strokeRect(vx+vin,vy+vin,vw-2*vin,vh-2*vin);
  T(vx+vw/2,vy+vh-4,T_(L("ненапрегнат","unstressed"))+" "+fmt(F.Vu/1000,1)+" L",{fs:9.5,c:"#1b2a6b"});
  T(vx+vw/2,vy-5,T_(L("вени · MSFP","veins · MSFP"))+" "+fmt(F.MSFP,1)+" mmHg",{fs:10,c:C.ven,w:700});
  // съдова примка (кръвен път)
  g.strokeStyle="rgba(54,79,199,.5)";g.lineWidth=6;g.beginPath();g.moveTo(414,196);g.lineTo(402,236);g.lineTo(262,236);g.lineTo(232,196);g.stroke();
  // артерии: дебелина на стената ∝ TPR; цвят ∝ Hb·SaO₂
  const wall=cl(F.TPR/18.6,0.3,2.6)*3,Hb=F.Hct*100/3,bc="rgba(201,42,42,"+cl(Hb/15,0.25,1).toFixed(2)+")";
  g.lineCap="round";g.strokeStyle="#7a1f1f";g.lineWidth=8+2*wall;g.beginPath();g.moveTo(246,142);g.lineTo(262,62);g.lineTo(402,62);g.lineTo(414,96);g.stroke();
  g.strokeStyle=bc;g.lineWidth=8;g.stroke();g.lineCap="butt";
  T(332,48,T_(L("артерии · TPR","arteries · TPR"))+" "+fmt(F.TPR*80,0),{fs:10,c:C.map,w:700});
  // капилярно легло: мрежа, Jv (+ навън), лимфа
  for(let i=0;i<6;i++){g.strokeStyle="rgba(166,30,77,.55)";g.lineWidth=1;g.beginPath();g.moveTo(404,106+i*16);g.bezierCurveTo(414,100+i*16,422,114+i*16,430,106+i*16);g.stroke()}
  g.strokeStyle="rgba(166,30,77,.55)";g.beginPath();g.moveTo(414,100);g.lineTo(414,196);g.stroke();
  const jw=Math.min(6,Math.abs(F.Jv)/1.5);if(Math.abs(F.Jv)>0.3){if(F.Jv>0)Z.arr(g,434,140,452,140,C.cry,jw,"");else Z.arr(g,452,140,434,140,C.cry,jw,"")}
  T(399,140,"Jv "+fmt(F.Jv,1),{fs:9.5,c:C.cry,w:700,a:"right"});
  Z.arr(g,446,170,404,224,C.hr,0.6+F.Lym/1.2,"",{dash:[4,3]});T(399,186,T_(L("лимфа","lymph"))+" "+fmt(F.Lym,1),{fs:9.5,c:C.hr,a:"right"});
  T(399,162,"Pc "+fmt(F.Pc,0),{fs:9.5,c:mut,a:"right"});
  // сърце: две камери; пулсира с HR, амплитуда ∝ SV
  g.fillStyle="#9c2c2c";g.beginPath();g.ellipse(hx,hy-22,13*sq,10*sq,0,0,7);g.fill();
  g.fillStyle="#b3262e";g.beginPath();g.ellipse(hx,hy+2,20*sq,24*sq,0,0,7);g.fill();
  T(hx-18,hy+44,L("сърце","heart"),{fs:10,c:mut});
  // частици кръв ∝ CO
  Z.dots(g,loop,AN.pc,"#f1c0c6",14,2.4);
  // симпатикус и вагус → сърце / съдове
  Z.arr(g,95,138,212,160,C.hr,0.4+2.6*cl(s.par,0,2),"",{dash:[5,3]});
  Z.arr(g,165,64,218,140,C.map,0.4+1.8*cl(F.symE,0,3),"");Z.arr(g,192,52,258,62,C.map,0.3+1.4*cl(F.symE,0,3),"");
  /* кървене / вливане */
  const bOn=s.bled<p.loss-0.5&&!s.dead;
  if(s.bled>0||p.loss>0){const dx=330,yy=62-8-((AN.dr*1.6)%1)*20;if(bOn){g.fillStyle=C.bld;g.beginPath();g.moveTo(dx,yy-6);g.quadraticCurveTo(dx+5,yy+2,dx,yy+4);g.quadraticCurveTo(dx-5,yy+2,dx,yy-6);g.fill()}
    T(372,28,T_(L("кървене","bleeding"))+" −"+fmt(s.bled,0)+" mL",{fs:10.5,c:C.bld,w:700})}
  const on=s.t>=tInf(p),cOn=on&&s.gC<p.cry-0.5,kOn=on&&s.gB<p.bld-0.5,bag=(x,col,act,lab)=>{Z.box(g,x,282,20,26,col,col,4,1.2,act?0.55:0.15);g.strokeStyle=col;g.lineWidth=1.2;g.setLineDash(act?[]:[3,3]);g.beginPath();g.moveTo(x+10,282);g.lineTo(x+10,266);g.stroke();g.setLineDash([]);
    if(act)Z.dots(g,[[x+10,308],[x+10,318],[vx-6,318],[vx-6,vy+vh-6]],AN.dr*0.8,col,4,2);T(x+10,276,lab,{fs:9.5,c:col,w:700})};
  if(p.cry>0||s.gC>0)bag(222,C.cry,cOn,"+"+fmt(s.gC,0));if(p.bld>0||s.gB>0)bag(250,C.bld,kOn,"+"+fmt(s.gB,0));
  /* лява долна карта: пациент */
  pnl(8,144,192,152,L("Пациент","Patient"));
  const lp=100*s.bled/5000,cls=lp<15?"I":lp<30?"II":lp<40?"III":"IV";
  T(16,178,"MAP "+fmt(F.MAP,0)+" ("+fmt(F.SBP,0)+"/"+fmt(F.DBP,0)+")",{fs:12,a:"left",w:700,c:C.map});
  T(16,196,"HR "+fmt(F.HR,0)+" · SI "+fmt(F.SI,2),{fs:12,a:"left",w:700,c:C.hr});
  T(16,214,"CO "+fmt(F.CO,1)+" L/min · RAP "+fmt(F.RAP,1),{fs:11,a:"left",c:C.co,w:700});
  if(s.bled>0)T(16,232,T_(L("загуба","loss"))+" "+fmt(lp,0)+" % · ATLS "+cls,{fs:11,a:"left",c:mut});
  const warm=F.TPR<12,skin=warm?L("кожа: топла","skin: warm"):F.symE>1.4?L("кожа: бледа, студена","skin: pale, cold"):L("кожа: нормална","skin: normal");
  T(16,250,skin,{fs:11,a:"left",c:mut});
  T(16,268,T_(L("съзнание","mental state"))+": "+T_(F.MAP<50?L("летаргия","lethargic"):F.MAP<70||lp>30?L("объркан","confused"):lp>15?L("тревожен","anxious"):L("ясно","clear")),{fs:11,a:"left",c:mut});
  if(s.dead)T(104,288,L("СМЪРТ","DEATH"),{fs:13,w:800,c:C.map});
  /* 3. хормони (горе вдясно) */
  pnl(462,8,170,148,L("Хормони","Hormones"));
  Z.org(g,470,28,72,30,C.adh,T_(L("хипофиза","pituitary")),"ADH ×"+fmt(s.ADH,1),cl(Math.log10(Math.max(1,s.ADH))/1.6,0,1));
  Z.org(g,554,28,72,30,C.ren,T_(L("бъбрек","kidney")),T_(L("ренин ×","renin ×"))+fmt(s.Ren,1),cl((s.Ren-1)/8,0,1));
  Z.org(g,470,76,72,30,C.ren,"AngII","×"+fmt(s.Ang,1),cl((s.Ang-1)/8,0,1));
  Z.org(g,554,76,72,30,C.adh,T_(L("надбъбрек","adrenal")),T_(L("алдост.","aldost."))+" ×"+fmt(s.Ald,1),cl((s.Ald-1)/4,0,1));
  Z.arr(g,543,40,553,40,C.adh,1+1.5*Math.log10(Math.max(1,s.ADH)),"");Z.arr(g,580,60,520,75,C.ren,0.8+0.4*Math.log(Math.max(1,s.Ren))*2,"");
  Z.arr(g,543,92,553,92,C.ren,0.8+Math.log(Math.max(1,s.Ang)),"");Z.arr(g,600,75,600,60,C.adh,0.8+Math.log(Math.max(1,s.Ald)),"");
  const ur=cl(Math.sqrt(F.UO)*6,1.5,9);g.fillStyle="rgba(54,79,199,.75)";g.beginPath();g.moveTo(488,120-ur*1.3);g.quadraticCurveTo(488+ur,128,488,128+ur*0.6);g.quadraticCurveTo(488-ur,128,488,120-ur*1.3);g.fill();
  T(502,132,T_(L("урина","urine"))+" "+fmt(F.UO*60,0)+" mL/h",{fs:10.5,a:"left",w:700,c:C.ven});
  /* 4. метаболизъм (долу вдясно) */
  pnl(462,164,170,132,L("Метаболизъм","Metabolism"));
  const tx=478,ty0=188,th=88,lf=cl(s.Lac/15,0,1);Z.box(g,tx-5,ty0,10,th,null,mut,5,1);Z.box(g,tx-4,ty0+th*(1-lf),8,Math.max(2,th*lf),C.lac,null,4,0,0.9);
  g.beginPath();g.arc(tx,ty0+th+6,7,0,7);g.fillStyle=C.lac;g.fill();
  [2,4].forEach(v=>{const y=ty0+th*(1-v/15);g.strokeStyle=mut;g.lineWidth=1;g.beginPath();g.moveTo(tx+6,y);g.lineTo(tx+10,y);g.stroke();T(tx+17,y+3,""+v,{fs:8.5,c:mut})});
  T(492,194,T_(L("лактат","lactate"))+" "+fmt(s.Lac,1)+" mmol/L",{fs:10,c:C.lac,w:700,a:"left"});
  Z.bar(g,510,218,112,s.D/10000,C.hct,T_(L("O₂-дълг","O₂ debt")),fmt(s.D/1000,1)+" L");
  g.strokeStyle=C.map;g.lineWidth=2;g.beginPath();g.moveTo(510+112*0.7,214);g.lineTo(510+112*0.7,230);g.stroke();T(510+112*0.7,240,"7 L",{fs:8.5,c:C.map});
  T(506,254,"pH "+fmt(F.pH,2)+" · BE "+fmt(F.BE,1),{fs:10,a:"left",c:mut});
  const vcx=602,vcy=276,act=s.Ir>0.15;for(let k=0;k<6;k++){const a0=AN.vc+k*Math.PI/3;g.strokeStyle=act?C.map:mut;g.globalAlpha=act?0.45+0.5*cl(s.Ir,0,1):0.35;g.lineWidth=4;g.beginPath();g.arc(vcx,vcy,15,a0+0.12,a0+Math.PI/3-0.12);g.stroke()}
  g.globalAlpha=1;T(vcx-24,vcy+4,L("порочен кръг","vicious circle"),{fs:9.5,a:"right",c:act?C.map:mut,w:act?700:500});
  T(vcx-24,vcy+16,"Ir "+fmt(s.Ir,2),{fs:9,a:"right",c:mut});
  /* 5. скала на времето (долу) */
  const zx=20,zw=600,zy=318,X=tt=>zx+zw*(Math.log10(Math.max(0.1,tt))+1)/4.64;
  const ZN=[[0.1,3,L("секунди: рефлекси","seconds: reflexes")],[3,60,L("минути: хормони","minutes: hormones")],[60,1440,L("часове: пълнене","hours: refill")],[1440,TEND,L("дни: бъбрек и жажда","days: kidney and thirst")]];
  ZN.forEach(([a,b,lab])=>{const x0=X(a),x1=X(b),cur=s.t>=a&&s.t<b||(b===TEND&&s.t>=TEND);Z.box(g,x0+1,zy,x1-x0-2,14,cur?C.co:css("--chip"),null,4,0,cur?0.8:1);T((x0+x1)/2,zy+30,lab,{fs:10,c:cur?C.co:mut,w:cur?700:500})});
  const mx=X(Math.min(s.t,TEND));g.fillStyle=C.map;g.beginPath();g.moveTo(mx,zy-1);g.lineTo(mx-5,zy-9);g.lineTo(mx+5,zy-9);g.fill();
  T(Math.min(zx+zw-40,Math.max(zx+40,mx)),zy-13,fmtT(s.t)+" · 1 s = "+wLab(s.warp||W(s.t)),{fs:10,w:700,c:C.map})}

/*__3D__*/

/* ---------- урок ---------- */
const LI=a=>"<ul>"+a.map(([b,e])=>"<li>"+L(b,e)+"</li>").join("")+"</ul>",OL=a=>"<ol>"+a.map(([b,e])=>"<li>"+L(b,e)+"</li>").join("")+"</ol>";
const book={title:L("Шок и кръвозагуба: интегрирана регулация","Shock and haemorrhage: integrated regulation"),
 adv:L("как обемът, сърцето и съдовете се срещат в кривите на Гайтън, как рефлексите, хормоните и капилярите компенсират загубата в секунди, минути и часове, и кога компенсацията се превръща в порочен кръг","how volume, heart and vessels meet in Guyton's curves, how reflexes, hormones and capillaries compensate a loss over seconds, minutes and hours, and when compensation turns into a vicious circle"),
 lead:L("Шокът е неадекватен тъканен кръвоток спрямо нуждата от O₂ — не просто ниско налягане. По Guyton, гл. 24, 20 и 18.","Shock is tissue blood flow inadequate for O₂ demand — not simply low pressure. After Guyton, ch. 24, 20 and 18."),
 secs:[
 {h:L("Цели на урока","Learning objectives"),html:LI([
  ["Да построиш работната точка CO = VR от MSFP, RAP и RVR и сърдечната крива, и да предскажеш как я местят кръвозагуба, вливане, симпатикус и инфаркт.","Build the operating point CO = VR from MSFP, RAP, RVR and the cardiac curve, and predict how haemorrhage, infusion, sympathetic drive and infarction move it."],
  ["Да подредиш компенсаторните механизми по време: барорефлекс (s) → хеморецептори/CNS-исхемия → RAAS и ADH (min) → транскапилярно пълнене (h) → бъбрек, жажда, албумин (h–d) → еритропоеза (седмици).","Order the compensations in time: baroreflex (s) → chemoreceptors/CNS ischaemia → RAAS and ADH (min) → transcapillary refill (h) → kidney, thirst, albumin (h–d) → erythropoiesis (weeks)."],
  ["Да разпознаеш клас I–IV по ATLS и защо систолното налягане е късен белег.","Recognise ATLS classes I–IV and why systolic pressure is a late sign."],
  ["Да различиш хиповолемичен, кардиогенен, дистрибутивен (септичен, анафилактичен, неврогенен) и обструктивен шок по CO, RAP, TPR и HR.","Distinguish hypovolaemic, cardiogenic, distributive (septic, anaphylactic, neurogenic) and obstructive shock by CO, RAP, TPR and HR."],
  ["Да обясниш кислородния дълг, лактата и положителните обратни връзки на необратимия шок.","Explain oxygen debt, lactate and the positive feedbacks of irreversible shock."]])},
 {h:L("Норма: числата","Normal values"),html:LI([
  ["Кръвен обем ≈ 70 mL/kg (5 L при 70 kg): ≈ 64 % във вени и венули, ≈ 13 % в артерии, ≈ 7 % в капиляри, ≈ 16 % в сърце и бял дроб.","Blood volume ≈ 70 mL/kg (5 L at 70 kg): ≈ 64 % in veins and venules, ≈ 13 % in arteries, ≈ 7 % in capillaries, ≈ 16 % in heart and lungs."],
  ["Ненапрегнат обем ≈ 4 L, напрегнат ≈ 1 L; MSFP ≈ 7 mmHg; RAP ≈ 0 (CVP 2–8 mmHg спрямо средна аксиларна линия); RVR ≈ 1,4 mmHg·min/L.","Unstressed volume ≈ 4 L, stressed ≈ 1 L; MSFP ≈ 7 mmHg; RAP ≈ 0 (CVP 2–8 mmHg relative to the mid-axillary line); RVR ≈ 1.4 mmHg·min/L."],
  ["CO 5 L/min (CI 2,5–4,0 L/min/m²), SV 60–100 mL, HR 60–100; MAP 70–105 mmHg; TPR 900–1500 dyn·s·cm⁻⁵; пулсово налягане 35–50 mmHg.","CO 5 L/min (CI 2.5–4.0 L/min/m²), SV 60–100 mL, HR 60–100; MAP 70–105 mmHg; TPR 900–1500 dyn·s·cm⁻⁵; pulse pressure 35–50 mmHg."],
  ["Шоков индекс HR/SBP 0,5–0,7 (> 0,9–1,0 = шок, дори при „нормално“ SBP).","Shock index HR/SBP 0.5–0.7 (> 0.9–1.0 = shock, even with a “normal” SBP)."],
  ["Капиляр (Guyton): Pc ≈ 17 mmHg (средно), Pif ≈ −3, πp ≈ 28, πif ≈ 8 mmHg → нетно ≈ +0,3 mmHg; Kf ≈ 6,7 mL/min/mmHg; филтрацията ≈ 2 mL/min се връща с лимфата.","Capillary (Guyton): Pc ≈ 17 mmHg (mean), Pif ≈ −3, πp ≈ 28, πif ≈ 8 mmHg → net ≈ +0.3 mmHg; Kf ≈ 6.7 mL/min/mmHg; the ≈ 2 mL/min filtrate returns with the lymph."],
  ["DO₂ ≈ 1000 mL/min (550–650 mL/min/m²), VO₂ ≈ 250 mL/min, екстракция ≈ 25 % (макс. 60–70 %); критична DO₂ ≈ 4–5 mL/kg/min.","DO₂ ≈ 1000 mL/min (550–650 mL/min/m²), VO₂ ≈ 250 mL/min, extraction ≈ 25 % (max. 60–70 %); critical DO₂ ≈ 4–5 mL/kg/min."],
  ["Лактат 0,5–1,5 mmol/L, продукция ≈ 1400 mmol/ден (черен дроб и бъбрек я изчистват); > 2 = хипоперфузия, > 4 = висок риск.","Lactate 0.5–1.5 mmol/L, production ≈ 1400 mmol/day (cleared by liver and kidney); > 2 = hypoperfusion, > 4 = high risk."],
  ["Урина ≈ 1 mL/kg/h (60–70 mL/h); олигурия < 0,5 mL/kg/h.","Urine ≈ 1 mL/kg/h (60–70 mL/h); oliguria < 0.5 mL/kg/h."]])},
 {h:L("Механизмът стъпка по стъпка","The mechanism step by step"),html:OL([
  ["<b>Кривите на Гайтън:</b> венозното връщане VR = (MSFP − RAP)/RVR — права, която пресича оста x при MSFP; под RAP ≈ −2…−4 mmHg вените колабират и VR спира да расте. Сърдечната функционална крива расте с RAP (Франк–Старлинг) до плато. Сърцето и съдовете работят там, където двете се пресичат.","<b>Guyton's curves:</b> venous return VR = (MSFP − RAP)/RVR — a line crossing the x-axis at MSFP; below a RAP of ≈ −2…−4 mmHg the veins collapse and VR stops rising. The cardiac function curve rises with RAP (Frank–Starling) to a plateau. Heart and vessels operate where the two intersect."],
  ["<b>Кръвозагубата</b> намалява напрегнатия обем → MSFP пада → VR-правата се измества успоредно наляво → нова точка с по-нисък RAP и по-нисък CO. MAP = CO × TPR + RAP пада.","<b>Haemorrhage</b> reduces stressed volume → MSFP falls → the VR line shifts in parallel to the left → a new point with lower RAP and lower CO. MAP = CO × TPR + RAP falls."],
  ["<b>Барорецепторите</b> (каротиден синус, аортна дъга) намаляват честотата си за един удар. NTS спира да активира CVLM → RVLM се „освобождава“: вагусът спада за 1–2 s, симпатикусът расте за 5–20 s. Ниският RAP разтоварва и <b>кардиопулмоналните (обемни) рецептори</b> → допълнителен симпатикус и ADH.","<b>Baroreceptors</b> (carotid sinus, aortic arch) reduce their firing within one beat. NTS stops exciting the CVLM → the RVLM is “released”: vagal tone falls within 1–2 s and sympathetic drive rises over 5–20 s. The low RAP also unloads the <b>cardiopulmonary (volume) receptors</b> → extra sympathetic drive and ADH."],
  ["<b>Симпатикусът</b> вдига HR и контрактилитета (кривата на сърцето нагоре), <b>стяга вените</b> (по-малък ненапрегнат обем → MSFP ↑ — до ≈ 2,5 пъти при максимална стимулация) и <b>артериолите</b> (TPR ↑, особено кожа, черва, бъбрек); надбъбречната медула освобождава адреналин. Мозъкът и сърцето са пощадени — тяхната регулация е главно метаболитна.","<b>Sympathetic drive</b> raises HR and contractility (the cardiac curve moves up), <b>constricts the veins</b> (less unstressed volume → MSFP ↑ — up to ≈ 2.5-fold with maximal stimulation) and the <b>arterioles</b> (TPR ↑, especially skin, gut, kidney); the adrenal medulla releases adrenaline. Brain and heart are spared — their regulation is mainly metabolic."],
  ["Под <b>MAP ≈ 80</b> се включват <b>хеморецепторите</b> (хипоперфузия на каротидните телца), под <b>≈ 50</b> — <b>CNS-исхемичният отговор</b>, най-силният симпатиков стимул („последната линия“).","Below a <b>MAP of ≈ 80</b> the <b>chemoreceptors</b> join in (carotid body hypoperfusion), below <b>≈ 50</b> the <b>CNS ischaemic response</b> — the strongest sympathetic stimulus (“the last line”)."],
  ["<b>Минути:</b> ренин (β1 + нисък перфузионен натиск на аферентната артериола + ↓ NaCl в macula densa) → AngII (вазоконстрикция, жажда, алдостерон, ADH); ADH от задната хипофиза (несмотичен стимул — загуба > 10–15 %) → V1 вазоконстрикция, V2 задържане на вода. Урината пада.","<b>Minutes:</b> renin (β1 + low afferent arteriolar perfusion pressure + ↓ NaCl at the macula densa) → AngII (vasoconstriction, thirst, aldosterone, ADH); ADH from the posterior pituitary (non-osmotic stimulus — loss > 10–15 %) → V1 vasoconstriction, V2 water retention. Urine output falls."],
  ["<b>Часове:</b> прекапилярната вазоконстрикция сваля Pc → интерстициална течност навлиза в капилярите (<b>транскапилярно пълнене</b>, ≈ 0,5–1 L) → хемодилуция: Hct пада часове след кръвоизлива. Белтъкът се връща с лимфата; черният дроб синтезира албумин (дни).","<b>Hours:</b> precapillary vasoconstriction lowers Pc → interstitial fluid enters the capillaries (<b>transcapillary refill</b>, ≈ 0.5–1 L) → haemodilution: Hct falls hours after the haemorrhage. Protein returns with the lymph; the liver synthesises albumin (days)."],
  ["<b>Дни:</b> бъбрекът задържа сол и вода (алдостерон, ADH, ↓GFR), жаждата връща водата, обемът се нормализира за 1–3 дни; еритроцитната маса — за 3–6 седмици (EPO, тема „Еритропоеза“).","<b>Days:</b> the kidney retains salt and water (aldosterone, ADH, ↓GFR), thirst restores water and volume normalises within 1–3 days; red-cell mass within 3–6 weeks (EPO, topic “Erythropoiesis”)."],
  ["<b>Кислороден дълг:</b> когато DO₂ падне под критичната, VO₂ става зависима от доставката → анаеробна гликолиза → лактат и H⁺. Кумулативният дефицит (O₂-дълг) предсказва изхода: при кучета ≈ 100 mL/kg е преживяем, 120 mL/kg — LD50, ≥ 140 — фатален (Crowell & Smith 1964).","<b>Oxygen debt:</b> when DO₂ falls below the critical level, VO₂ becomes supply-dependent → anaerobic glycolysis → lactate and H⁺. The cumulative deficit (O₂ debt) predicts the outcome: in dogs ≈ 100 mL/kg is survivable, 120 mL/kg is the LD50 and ≥ 140 is fatal (Crowell & Smith 1964)."],
  ["<b>Прогресивен шок (положителна обратна връзка):</b> коронарна хипоперфузия → слабо сърце → по-нисък CO; исхемия на вазомоторния център → симпатикусът отказва; ацидоза → съдовете не отговарят на катехоламини; капилярен теч → губи се плазма; „утаяване“ на кръвта; токсини от исхемичните черва; генерализирано клетъчно увреждане (Na⁺/K⁺-ATPase, лизозоми). Над определен праг кръгът се самоподдържа — <b>необратим шок</b>.","<b>Progressive shock (positive feedback):</b> coronary hypoperfusion → a weak heart → lower CO; vasomotor-centre ischaemia → sympathetic drive fails; acidosis → vessels stop responding to catecholamines; capillary leak → plasma is lost; blood “sludging”; toxins from the ischaemic gut; generalised cell injury (Na⁺/K⁺-ATPase, lysosomes). Beyond a threshold the circle sustains itself — <b>irreversible shock</b>."]])},
 {h:L("Регулация","Regulation"),html:LI([
  ["<b>Непрогресивен (компенсиран) шок:</b> отрицателните обратни връзки (барорефлекс, CNS, RAAS, ADH, пълнене, жажда) връщат налягането — загуби до ≈ 30–35 % се преживяват без лечение, ако кървенето спре.","<b>Non-progressive (compensated) shock:</b> negative feedbacks (baroreflex, CNS, RAAS, ADH, refill, thirst) restore pressure — losses up to ≈ 30–35 % are survived without treatment if the bleeding stops."],
  ["<b>Прогресивен шок:</b> положителните обратни връзки надделяват; всяко влошаване увеличава следващото. Определя се от дълбочината × продължителността на хипоперфузията (O₂-дълг), не от едно измерване на налягането.","<b>Progressive shock:</b> positive feedbacks prevail; each deterioration amplifies the next. It is set by the depth × duration of hypoperfusion (O₂ debt), not by a single pressure reading."],
  ["<b>Необратим шок:</b> дори пълно възстановяване на обема дава само временно повишение на налягането (експериментите на Гайтън с кучета, гл. 24) — клетъчните енергийни запаси (АТФ → аденозин → изчезва) не се възстановяват.","<b>Irreversible shock:</b> even full volume replacement gives only a transient rise in pressure (Guyton's dog experiments, ch. 24) — cellular energy stores (ATP → adenosine → washed out) are not restored."],
  ["<b>Дистрибутивен шок</b> (сепсис, анафилаксия, неврогенен): проблемът е съдовото „легло“, не обемът — артериоло- и венодилатация, при сепсис и анафилаксия + капилярен теч. При сепсис съдовете са хипореактивни към норадреналин (NO, K-ATP канали), а ADH е неадекватно нисък (Landry 1997) — затова вазопресинът е втори вазопресор.","<b>Distributive shock</b> (sepsis, anaphylaxis, neurogenic): the problem is the vascular “bed”, not the volume — arteriolar and venous dilation, plus capillary leak in sepsis and anaphylaxis. In sepsis vessels are hyporesponsive to noradrenaline (NO, K-ATP channels) and ADH is inappropriately low (Landry 1997) — hence vasopressin as the second vasopressor."],
  ["<b>Кардиогенен шок:</b> първичен спад на сърдечната крива; рефлексите (тахикардия, вазоконстрикция, задръжка на течности) увеличават следнатоварването и консумацията на O₂ от миокарда — сами по себе си порочен кръг.","<b>Cardiogenic shock:</b> a primary fall of the cardiac curve; the reflexes (tachycardia, vasoconstriction, fluid retention) raise afterload and myocardial O₂ consumption — a vicious circle in themselves."],
  ["<b>Обструктивен шок</b> (тампонада, тензионен пневмоторакс, масивна БЕ): кривата на сърцето е „отрязана“ от механично препятствие — висок RAP, нисък CO (в модела ≈ кардиогенен; лечението е механично).","<b>Obstructive shock</b> (tamponade, tension pneumothorax, massive PE): the cardiac curve is “cut off” by a mechanical obstruction — high RAP, low CO (≈ cardiogenic in the model; treatment is mechanical)."]])},
 {h:L("Клинично значение","Clinical relevance"),html:LI([
  ["<b>ATLS (10-то изд., Table 3-1):</b> клас I < 15 % — почти без промени; II 15–30 % — тахикардия 100–120, тясно пулсово налягане, BD −2…−6; III 31–40 % — HR 120–140, SBP ↓, урина 5–15 mL/h, объркване, BD −6…−10, нужда от кръв; IV > 40 % — HR > 140, SBP ↓↓, анурия, летаргия, BD ≤ −10, масивна трансфузия.","<b>ATLS (10th ed., Table 3-1):</b> class I < 15 % — almost no change; II 15–30 % — tachycardia 100–120, narrow pulse pressure, BD −2…−6; III 31–40 % — HR 120–140, SBP ↓, urine 5–15 mL/h, confusion, BD −6…−10, blood needed; IV > 40 % — HR > 140, SBP ↓↓, anuria, lethargy, BD ≤ −10, massive transfusion."],
  ["<b>Лечение на хеморагичния шок:</b> спиране на кървенето (компресия, турникет, хирургия/емболизация), ранна кръв 1:1:1 (ЕМ:плазма:тромбоцити), транексамова киселина ≤ 3 h, ограничен кристалоид (≤ 1 L), пермисивна хипотония (SBP 80–90) до хемостазата (без ЧМТ), профилактика на „смъртоносната триада“ (хипотермия, ацидоза, коагулопатия).","<b>Treating haemorrhagic shock:</b> stop the bleeding (compression, tourniquet, surgery/embolisation), early blood 1:1:1 (RBC:plasma:platelets), tranexamic acid ≤ 3 h, limited crystalloid (≤ 1 L), permissive hypotension (SBP 80–90) until haemostasis (no head injury), prevention of the “lethal triad” (hypothermia, acidosis, coagulopathy)."],
  ["<b>Сепсис (Sepsis-3, SSC 2021):</b> септичен шок = нужда от вазопресор за MAP ≥ 65 + лактат > 2 mmol/L въпреки адекватни течности. Кристалоид 30 mL/kg в първите 3 h (при хипоперфузия), норадреналин първа линия, цел MAP ≥ 65, вазопресин при нужда, антибиотик до 1 h.","<b>Sepsis (Sepsis-3, SSC 2021):</b> septic shock = a vasopressor needed for MAP ≥ 65 + lactate > 2 mmol/L despite adequate fluids. Crystalloid 30 mL/kg within 3 h (if hypoperfused), noradrenaline first line, target MAP ≥ 65, vasopressin if needed, antibiotic within 1 h."],
  ["<b>Кардиогенен шок:</b> SBP < 90 за > 30 min (или вазопресор), CI < 2,2 L/min/m², PCWP > 15 mmHg, белези на хипоперфузия; реваскуларизация, инотропи, механична поддръжка; течностите помагат само при нисък RAP/PCWP.","<b>Cardiogenic shock:</b> SBP < 90 for > 30 min (or a vasopressor), CI < 2.2 L/min/m², PCWP > 15 mmHg, signs of hypoperfusion; revascularisation, inotropes, mechanical support; fluids help only with a low RAP/PCWP."],
  ["<b>Анафилаксия:</b> адреналин 0,5 mg i.m. (0,01 mg/kg) в бедрото, при нужда повторно след 5 min; бързо 1–2 L кристалоид; легнало положение.","<b>Anaphylaxis:</b> adrenaline 0.5 mg i.m. (0.01 mg/kg) into the thigh, repeated after 5 min if needed; rapid 1–2 L crystalloid; supine position."],
  ["<b>Неврогенен шок:</b> хипотония + брадикардия + топла кожа след гръбначна травма; течности, норадреналин, атропин; да се изключи кървене (травмата рядко е само неврогенна).","<b>Neurogenic shock:</b> hypotension + bradycardia + warm skin after spinal cord injury; fluids, noradrenaline, atropine; exclude bleeding (trauma is rarely purely neurogenic)."],
  ["<b>Мониторинг:</b> лактат (и клирънс), шоков индекс, капилярно пълнене, диуреза, ScvO₂, ехокардиография; хемоглобинът в първите часове е подвеждащ.","<b>Monitoring:</b> lactate (and its clearance), shock index, capillary refill, urine output, ScvO₂, echocardiography; haemoglobin in the first hours is misleading."]])},
 {h:L("Чести заблуди","Common misconceptions"),html:LI([
  ["„Нормално налягане = няма шок.“ — При клас II SBP е нормален; тахикардията, тясното пулсово налягане, лактатът и шоковият индекс са по-ранни.","“Normal pressure = no shock.” — In class II SBP is normal; tachycardia, narrow pulse pressure, lactate and the shock index change earlier."],
  ["„Hb веднага показва загубата.“ — Губи се цяла кръв; Hct пада едва с транскапилярното пълнене и вливанията (часове).","“Hb shows the loss at once.” — Whole blood is lost; Hct falls only with transcapillary refill and infusions (hours)."],
  ["„Сърцето определя CO само.“ — В покой CO се определя главно от венозното връщане (MSFP − RAP, RVR); сърцето е „разрешаващо“, докато не е на платото.","“The heart alone sets CO.” — At rest CO is set mainly by venous return (MSFP − RAP, RVR); the heart is “permissive” as long as it is not on its plateau."],
  ["„Повече течност винаги вдига CO.“ — Само ако работната точка е на стръмната част на кривата; при кардиогенен шок вдига RAP и води до белодробен оток.","“More fluid always raises CO.” — Only if the operating point is on the steep part of the curve; in cardiogenic shock it raises RAP and leads to pulmonary oedema."],
  ["„1 L кристалоид замества 1 L кръв.“ — Остава ≈ 20–25 % в съдовете, разрежда Hb и белтъка; кръвта остава почти изцяло.","“1 L of crystalloid replaces 1 L of blood.” — Only ≈ 20–25 % stays intravascular and it dilutes Hb and protein; blood stays almost entirely."],
  ["„Септичният шок винаги е студен.“ — Рано е хипердинамичен (CO висок, топла кожа); хипоксията е микроциркулаторна.","“Septic shock is always cold.” — Early on it is hyperdynamic (high CO, warm skin); the hypoxia is microcirculatory."],
  ["„Шок = тахикардия.“ — Неврогенният шок, β-блокерите, пейсмейкърът и старостта маскират тахикардията.","“Shock = tachycardia.” — Neurogenic shock, β-blockers, pacemakers and old age mask tachycardia."],
  ["„Щом налягането се върне, опасността е минала.“ — След дълъг период на хипоперфузия кислородният дълг може да е задействал необратимите механизми.","“Once pressure is back, the danger is over.” — After a long period of hypoperfusion the oxygen debt may already have triggered the irreversible mechanisms."]])},
 {h:L("Опростено в модела","Simplified in the model"),html:LI([
  ["Една „средна“ камера и една системна циркулация: няма отделни лява/дясна камера и белодробно кръвообращение — при кардиогенен шок RAP заменя PCWP; няма белодробен оток и хипоксемия (SaO₂ = 97 % винаги).","One “average” ventricle and one systemic circulation: no separate left/right ventricle and no pulmonary circulation — in cardiogenic shock RAP stands in for PCWP; no pulmonary oedema or hypoxaemia (SaO₂ = 97 % always)."],
  ["Кривите на Гайтън са квазистационарни (RAP се решава алгебрично); няма пулсова вълна — SBP/DBP се изчисляват от SV/Ca, а Ca намалява емпирично със симпатикуса.","Guyton's curves are quasi-steady (RAP is solved algebraically); there is no pulse wave — SBP/DBP are computed from SV/Ca, and Ca falls empirically with sympathetic drive."],
  ["Барорефлексът е една сигмоида + кардиопулмонални, хеморецепторни и CNS-членове; HR е ограничен до ≈ 155/min (в сепсис реално по-често 110–140) — HR в модела може да е по-висок от клиничния.","The baroreflex is one sigmoid + cardiopulmonary, chemoreceptor and CNS terms; HR is limited to ≈ 155/min (in sepsis really more often 110–140) — model HR may be higher than clinical."],
  ["Капилярът е един „среден“ капиляр с класическия Старлинг (Kf, σ, Pc, Pi, πp, πi) + лимфа; гликокаликсът (ревизиран модел) не е моделиран отделно — абсорбцията е преходна по построение (спира, щом белтъкът се разреди и Pi падне).","The capillary is one “average” capillary with classical Starling forces (Kf, σ, Pc, Pi, πp, πi) + lymph; the glycocalyx (revised model) is not modelled separately — absorption is transient by construction (it stops once protein is diluted and Pi falls)."],
  ["BE отразява САМО лактата (Winter-компенсация); хиперхлоремията от физиологичен разтвор, кетоните и уремичните аниони липсват — затова BE е по-малък от ATLS-BD.","BE reflects ONLY lactate (Winter compensation); hyperchloraemia from saline, ketones and uraemic anions are missing — hence BE is smaller than the ATLS BD."],
  ["O₂-дългът и необратимостта използват кучешкия праг 100 mL/kg и един индекс Ir (миокард, вазомоторен център, съдове, теч); няма отделни цитокини, коагулация, хипотермия, СИР/ПОН.","O₂ debt and irreversibility use the canine 100 mL/kg threshold and a single index Ir (myocardium, vasomotor centre, vessels, leak); there are no separate cytokines, coagulation, hypothermia, SIRS/MODS."],
  ["Кръвта за вливане е „1:1“ (Hct 40 %, белтък 6 g/dL); няма тромбоцити, фактори, Ca²⁺/цитрат, калий. Кристалоидът е изотоничен и няма ICF; няма колоиди и хипертонични разтвори.","Transfused blood is “1:1” (Hct 40 %, protein 6 g/dL); no platelets, factors, Ca²⁺/citrate or potassium. Crystalloid is isotonic and there is no ICF; no colloids or hypertonic solutions."],
  ["Сепсисът и анафилаксията са зададени с фиксирани параметри (tpr, leak, ER, ↑VO₂, ↓ADH); няма антибиотик, адреналин и норадреналин като отделни лекарства — вазопресор ≈ повишаване на „Съдов тонус“.","Sepsis and anaphylaxis are set by fixed parameters (tpr, leak, ER, ↑VO₂, ↓ADH); there is no antibiotic, adrenaline or noradrenaline as separate drugs — a vasopressor ≈ raising “Vascular tone”."],
  ["Пиенето започва след 6-ия час (NPO), ако MAP > 70; не е моделиран осмоларитетът (само изоосмотичен обем).","Drinking starts after hour 6 (NPO) if MAP > 70; osmolarity is not modelled (isosmotic volume only)."],
  ["Разпределението на кристалоида е по-бързо от клиничните кинетични данни (модел: 20 % в съдовете 10 min след края, 7 % след час; Hahn: ≈ 15–25 % за ≈ 1 h) — Kf е цялостен, без гликокаликс и без намаления клирънс при анестезия/хиповолемия.","Crystalloid distribution is faster than clinical kinetic data (model: 20 % intravascular 10 min after the end, 7 % after an hour; Hahn: ≈ 15–25 % for ≈ 1 h) — Kf is lumped, without glycocalyx and without the reduced clearance of anaesthesia/hypovolaemia."],
  ["Много коефициенти (сигмоидите на рефлексите и хормоните, прагът и скоростта на необратимото увреждане) са калибрирани образователни приближения, а не измерени константи. Стойностите са за 70-килограмов мъж: кръв 5 L (Hct 45 %, плазма 2,75 L), интерстициум 11 L.","Many coefficients (the reflex and hormone sigmoids, the threshold and rate of irreversible injury) are calibrated educational approximations, not measured constants. Values are for a 70 kg man: blood 5 L (Hct 45 %, plasma 2.75 L), interstitium 11 L."]])}],
 key:[["CO = VR: пресечна точка на венозното връщане (MSFP − RAP)/RVR и кривата на Франк–Старлинг.","CO = VR: the intersection of venous return (MSFP − RAP)/RVR and the Frank–Starling curve."],
  ["Кръвозагубата сваля MSFP; симпатикусът го вдига чрез венoконстрикция — мобилизира ненапрегнатия обем.","Blood loss lowers MSFP; sympathetic venoconstriction raises it by mobilising unstressed volume."],
  ["Секунди — барорефлекс; минути — RAAS и ADH; часове — транскапилярно пълнене (Hct ↓); дни — бъбрек и жажда; седмици — еритроцити.","Seconds — baroreflex; minutes — RAAS and ADH; hours — transcapillary refill (Hct ↓); days — kidney and thirst; weeks — red cells."],
  ["ATLS: HR, пулсово налягане и шоков индекс се променят преди SBP; SBP пада едва при > 30 % загуба.","ATLS: HR, pulse pressure and shock index change before SBP; SBP falls only after > 30 % loss."],
  ["Кристалоидът се разпределя в целия ECF — в съдовете остава ≈ 1/4–1/5; кръвта остава.","Crystalloid spreads over the whole ECF — only ≈ 1/4–1/5 stays intravascular; blood stays."],
  ["Хиповолемичен: CO ↓ RAP ↓ TPR ↑; кардиогенен: CO ↓ RAP ↑ TPR ↑; дистрибутивен: CO N/↑ RAP ↓ TPR ↓↓.","Hypovolaemic: CO ↓ RAP ↓ TPR ↑; cardiogenic: CO ↓ RAP ↑ TPR ↑; distributive: CO N/↑ RAP ↓ TPR ↓↓."],
  ["Неврогенен шок = хипотония без тахикардия, топла кожа.","Neurogenic shock = hypotension without tachycardia, warm skin."],
  ["Шокът става необратим, когато кислородният дълг задейства положителните обратни връзки — времето до кръвта решава.","Shock becomes irreversible once the oxygen debt engages the positive feedbacks — time to blood decides."]].map(([b,e])=>L(b,e))};

const Q=a=>a.map(([q,qe,opts,an,ex,exe])=>({q:L(q,qe),opts:opts.map(([b,e])=>L(b,e)),a:an,expl:L(ex,exe)}));
const tests=Q([
 ["Средното системно налягане на пълнене (MSFP) е налягането, което:","Mean systemic filling pressure (MSFP) is the pressure that:",[["Измерваме в дясното предсърдие при нормален кръвоток","Is measured in the right atrium at normal flow"],["Се установява навсякъде в кръвообращението, ако сърцето спре и кръвта се преразпредели","Is reached everywhere in the circulation if the heart stops and blood redistributes"],["Е равно на средното артериално налягане","Equals mean arterial pressure"],["Създава ненапрегнатият обем","Is generated by the unstressed volume"]],1,"MSFP ≈ 7 mmHg и зависи от напрегнатия обем (V − Vu) и капацитанса; ненапрегнатият обем по определение не създава налягане.","MSFP ≈ 7 mmHg and depends on stressed volume (V − Vu) and capacitance; unstressed volume by definition creates no pressure."],
 ["При кръвозагуба без рефлекси кривата на венозното връщане:","With haemorrhage and no reflexes, the venous return curve:",[["Се измества успоредно наляво (MSFP ↓)","Shifts in parallel to the left (MSFP ↓)"],["Се завърта нагоре (RVR ↓)","Rotates upward (RVR ↓)"],["Не се променя, а пада сърдечната крива","Does not change; the cardiac curve falls"],["Се измества надясно","Shifts to the right"]],0,"По-малкият напрегнат обем сваля MSFP; наклонът (1/RVR) е почти същият. Новата пресечна точка е с по-нисък RAP и CO.","Less stressed volume lowers MSFP; the slope (1/RVR) is almost unchanged. The new intersection has lower RAP and CO."],
 ["Кой компенсаторен механизъм действа най-бързо след кръвоизлив?","Which compensation acts fastest after a haemorrhage?",[["Транскапилярното пълнене","Transcapillary refill"],["Отделянето на алдостерон","Aldosterone release"],["Спадането на вагусовия тонус към синусовия възел","Withdrawal of vagal tone to the sinus node"],["Жаждата","Thirst"]],2,"Вагусовият ефект (ACh, M2, GIRK) се развива и изчезва за 1–2 s; симпатиковият — за 5–20 s; хормоните — минути; пълненето — часове.","The vagal effect (ACh, M2, GIRK) appears and fades within 1–2 s; sympathetic in 5–20 s; hormones in minutes; refill in hours."],
 ["Пациент: HR 115, АН 108/86 mmHg, дишане 24/min, урина 25 mL/h, тревожен. Най-вероятна загуба по ATLS:","Patient: HR 115, BP 108/86 mmHg, RR 24/min, urine 25 mL/h, anxious. Most likely ATLS loss:",[["< 15 % (клас I)","< 15 % (class I)"],["15–30 % (клас II)","15–30 % (class II)"],["31–40 % (клас III)","31–40 % (class III)"],["> 40 % (клас IV)","> 40 % (class IV)"]],1,"Тахикардия 100–120 и тясно пулсово налягане (22 mmHg) при запазено SBP — клас II. SBP пада при клас III.","Tachycardia 100–120 and a narrow pulse pressure (22 mmHg) with preserved SBP — class II. SBP falls in class III."],
 ["Защо пулсовото налягане се стеснява рано при кръвозагуба?","Why does pulse pressure narrow early in haemorrhage?",[["Защото пада диастолното налягане","Because diastolic pressure falls"],["Ударният обем пада, а вазоконстрикцията задържа диастолното налягане","Stroke volume falls while vasoconstriction maintains diastolic pressure"],["Защото HR пада","Because HR falls"],["Аортата става по-еластична","The aorta becomes more compliant"]],1,"PP ≈ SV/Ca; SV ↓ (по-малко пълнене), а TPR ↑ държи DBP високо.","PP ≈ SV/Ca; SV ↓ (less filling) while TPR ↑ keeps DBP high."],
 ["Хематокритът след остра загуба на 1,5 L кръв:","Haematocrit after an acute 1.5 L blood loss:",[["Пада веднага пропорционално на загубата","Falls immediately in proportion to the loss"],["Остава почти непроменен в първите минути и пада за часове","Stays nearly unchanged in the first minutes and falls over hours"],["Расте трайно","Rises permanently"],["Пада само след вливане на кръв","Falls only after blood transfusion"]],1,"Губи се цяла кръв; Hct пада, когато протеин-бедна интерстициална течност (транскапилярно пълнене) и вливанията разредят еритроцитите.","Whole blood is lost; Hct falls when protein-poor interstitial fluid (refill) and infusions dilute the red cells."],
 ["Транскапилярното пълнене след кръвоизлив се дължи главно на:","Transcapillary refill after haemorrhage is mainly due to:",[["Повишено онкотично налягане в интерстициума","Increased interstitial oncotic pressure"],["Спад на капилярното хидростатично налягане от прекапилярна вазоконстрикция","A fall in capillary hydrostatic pressure from precapillary vasoconstriction"],["Повишена капилярна пропускливост","Increased capillary permeability"],["Активен транспорт на Na⁺ в ендотела","Active endothelial Na⁺ transport"]],1,"Pc пада (17 → ≈ 9 mmHg), онкотичното налягане на плазмата надделява → ≈ 0,5–1 L за часове; спира, когато белтъкът се разреди.","Pc falls (17 → ≈ 9 mmHg), plasma oncotic pressure prevails → ≈ 0.5–1 L over hours; it stops as protein is diluted."],
 ["1 h след вливане на 2 L изотоничен кристалоид при хеморагичен шок в съдовете остават приблизително:","1 h after infusing 2 L of isotonic crystalloid in haemorrhagic shock, roughly how much stays intravascular?",[["≈ 2 L","≈ 2 L"],["≈ 1,5 L","≈ 1.5 L"],["≈ 0,1–0,5 L","≈ 0.1–0.5 L"],["0 L","0 L"]],2,"Кристалоидът няма онкотично налягане и се разпределя в ECF (плазма : интерстициум ≈ 1 : 4); клинично остават ≈ 15–25 %, в модела 20 % на 10-ата min и 7 % след час.","Crystalloid has no oncotic pressure and distributes over the ECF (plasma : interstitium ≈ 1 : 4); clinically ≈ 15–25 % remains, in the model 20 % at 10 min and 7 % after an hour."],
 ["Кой профил отговаря на кардиогенен шок?","Which profile fits cardiogenic shock?",[["CO ↓, RAP ↓, TPR ↑","CO ↓, RAP ↓, TPR ↑"],["CO ↓, RAP ↑, TPR ↑","CO ↓, RAP ↑, TPR ↑"],["CO ↑, RAP ↓, TPR ↓","CO ↑, RAP ↓, TPR ↓"],["CO ↓, RAP ↓, TPR ↓","CO ↓, RAP ↓, TPR ↓"]],1,"Сърдечната крива пада → работната точка се мести надясно и надолу (висок RAP); рефлексът вдига TPR. Първият профил е хиповолемичен, третият — септичен, четвъртият — неврогенен.","The cardiac curve falls → the operating point moves right and down (high RAP); the reflex raises TPR. The first profile is hypovolaemic, the third septic, the fourth neurogenic."],
 ["Пациент с гръбначна травма на ниво C6: АН 80/50 mmHg, HR 58/min, топла суха кожа. Механизмът е:","Patient with a C6 spinal cord injury: BP 80/50 mmHg, HR 58/min, warm dry skin. The mechanism is:",[["Хиповолемия от скрито кървене","Hypovolaemia from occult bleeding"],["Загуба на симпатиковия еферентен тонус към съдове и сърце","Loss of sympathetic efferent tone to vessels and heart"],["Потиснати барорецептори","Depressed baroreceptors"],["Анафилаксия","Anaphylaxis"]],1,"Барорецепторите сигнализират, но еферентното рамо (RVLM → интермедиолатерален стълб → Th1–L2) е прекъснато: венозен застой, нисък TPR, без тахикардия. Кървенето винаги трябва да се изключи.","Baroreceptors signal, but the efferent limb (RVLM → intermediolateral column → T1–L2) is cut: venous pooling, low TPR, no tachycardia. Bleeding must always be excluded."],
 ["При ранен септичен шок обикновено намираме:","In early septic shock we usually find:",[["Нисък CO, висок TPR, студена кожа","Low CO, high TPR, cold skin"],["Висок или нормален CO, нисък TPR, лактат > 2","High or normal CO, low TPR, lactate > 2"],["Висок RAP и белодробен оток","High RAP and pulmonary oedema"],["Брадикардия","Bradycardia"]],1,"Вазодилатация (NO), хипореактивност и капилярен теч; лактатът расте въпреки високата DO₂ заради микроциркулаторния шънт и намалената екстракция.","Vasodilation (NO), hyporesponsiveness and capillary leak; lactate rises despite high DO₂ due to microcirculatory shunting and impaired extraction."],
 ["Защо при необратим шок пълното връщане на изгубената кръв не спасява?","Why does returning all the lost blood fail in irreversible shock?",[["Кръвта се разрушава веднага","The blood is destroyed immediately"],["Положителните обратни връзки (миокард, вазомоторен център, ацидоза, капилярен теч) вече се самоподдържат","Positive feedbacks (myocardium, vasomotor centre, acidosis, capillary leak) are already self-sustaining"],["Бъбрекът изхвърля обема","The kidney excretes the volume"],["Барорецепторите са се адаптирали","The baroreceptors have adapted"]],1,"Гайтън, гл. 24: след дълга хипоперфузия налягането се вдига временно, после пада отново; кислородният дълг е надхвърлил прага на обратимост.","Guyton, ch. 24: after prolonged hypoperfusion pressure rises transiently and then falls again; the oxygen debt has exceeded the reversibility threshold."],
 ["Какво прави вливането на още 1 L течност при кардиогенен шок с RAP 8 mmHg (по кривите на Гайтън)?","What does another 1 L of fluid do in cardiogenic shock with a RAP of 8 mmHg (by Guyton's curves)?",[["Вдига CO значително","Raises CO markedly"],["Вдига RAP, а CO почти не се променя","Raises RAP while CO barely changes"],["Сваля RAP","Lowers RAP"],["Сваля TPR до нормата","Normalises TPR"]],1,"Работната точка е на плоската част на ниската крива; MSFP ↑ мести VR надясно, пресечната точка се качва по RAP. В модела: RAP 7,5 → 7,9, CO 2,62 → 2,64.","The operating point lies on the flat part of a depressed curve; MSFP ↑ shifts VR right and the intersection moves along RAP. In the model: RAP 7.5 → 7.9, CO 2.62 → 2.64."],
 ["Шоков индекс 1,4 (HR 130, SBP 93) означава:","A shock index of 1.4 (HR 130, SBP 93) means:",[["Норма","Normal"],["Значителна хипоперфузия — вероятно загуба > 30 %","Significant hypoperfusion — likely > 30 % loss"],["Само тревожност","Anxiety only"],["Хипертония","Hypertension"]],1,"Норма 0,5–0,7; > 1 е свързан с нужда от трансфузия и по-висока смъртност, дори когато SBP е „над 90“.","Normal 0.5–0.7; > 1 is associated with transfusion need and higher mortality even when SBP is “above 90”."]]);
const exp=Q([
 ["Гледай първите 30 s реално време (първите 3 min). Кое се качва първо?","Watch the first 30 s of real time (first 3 min). What rises first?",[["Сърдечната честота","Heart rate"],["ADH и алдостеронът","ADH and aldosterone"]],0,"Вагусът изчезва за 1–2 s, симпатикусът идва за 5–20 s; ADH има τ ≈ 8 min, алдостеронът ≈ 40 min.","Vagal tone vanishes in 1–2 s, sympathetic comes in 5–20 s; ADH has τ ≈ 8 min, aldosterone ≈ 40 min."],
 ["Час след края на 2 L кристалоид колко е останало в съдовете?","An hour after 2 L of crystalloid ended, how much remains intravascular?",[["Почти всичко","Almost all of it"],["Около една десета, а Hct е паднал","About a tenth, and Hct has fallen"]],1,"Сравни реда „Кръвен обем“ с пресет „Клас III“ на същото време; после пусни „Клас III + 1,5 L кръв“ — HR пада под 80, лактатът се изчиства.","Compare the “Blood volume” row with the “Class III” preset at the same time; then run “Class III + 1.5 L blood” — HR falls below 80, lactate clears."],
 ["Цялата кръв се връща на 5-ия час. Какво става?","All of the blood is returned at hour 5. What happens?",[["Трайно възстановяване","Lasting recovery"],["Временно повишение, после колапс","A transient rise, then collapse"]],1,"Повтори с пресет „Клас IV“ и „Кръв“ 2250 mL (вливане от 30-ата min) — пациентът оцелява. Решава кислородният дълг, не количеството кръв.","Repeat with the “Class IV” preset and “Blood” 2250 mL (from minute 30) — the patient survives. The oxygen debt decides, not the amount of blood."],
 ["Даваме 2 L кристалоид. Достатъчно ли е за MAP ≥ 65 след 2–4 h?","We give 2 L of crystalloid. Is it enough for a MAP ≥ 65 after 2–4 h?",[["Да, налягането се нормализира","Yes, pressure normalises"],["Не — течността изтича и съдовете остават разширени; нужен е вазопресор","No — the fluid leaks out and vessels stay dilated; a vasopressor is needed"]],1,"Вдигни „Съдов тонус“ на 60 % (≈ норадреналин): MAP се връща над 80, но лактатът продължава да расте — сепсисът е и микроциркулаторен, и клетъчен проблем.","Raise “Vascular tone” to 60 % (≈ noradrenaline): MAP returns above 80, but lactate keeps rising — sepsis is a microcirculatory and cellular problem too."],
 ["MAP е ≈ 65 mmHg. Каква е сърдечната честота в сравнение с клас III кървене при подобно налягане?","MAP is ≈ 65 mmHg. How does heart rate compare with class III bleeding at a similar pressure?",[["Същата тахикардия > 120","The same tachycardia > 120"],["Няма тахикардия (≈ 80)","No tachycardia (≈ 80)"]],1,"Барорецепторите сигнализират (централният симпатикус е висок), но еферентният тонус е 10 %. Върни „Симпатиков еферентен тонус“ на 100 %.","Baroreceptors still signal (central sympathetic drive is high), but efferent tone is 10 %. Return “Sympathetic efferent tone” to 100 %."]]);
/* experiments() в index.html прилага e.set при отговор; mkSim чете e.pre / e.sl — попълваме и двете */
[["h3"],["h3cry"],["irr"],["sept",{cry:2000}],["neuro"]].forEach(([k,sl],i)=>{exp[i].pre=k;if(sl)exp[i].sl=sl;exp[i].set={pre:k,sl:sl||{}}});
const gl=[{t:L("Средно системно налягане на пълнене (MSFP)","Mean systemic filling pressure (MSFP)"),re:"MSFP|налягане на пълнене|системно налягане на пълнене",
  d:L("Налягането, което би се установило в цялото кръвообращение при спряно сърце (≈ 7 mmHg). Определя се от напрегнатия обем (кръвта над ненапрегнатия ≈ 4 L) и капацитанса; движещата сила на венозното връщане е MSFP − RAP.","The pressure that would be reached throughout the circulation if the heart stopped (≈ 7 mmHg). It is set by the stressed volume (blood above the ≈ 4 L unstressed volume) and capacitance; the driving force of venous return is MSFP − RAP.")},
 {t:L("Ненапрегнат обем","Unstressed volume"),re:"ненапрегнат[а-я]* обем[а-я]*|unstressed",
  d:L("Обемът кръв, който пълни съдовете, без да разтяга стените им и без да създава налягане (≈ 4 L от 5 L, главно във вените). Симпатиковата венoконстрикция го намалява и „превръща“ в напрегнат обем — автотрансфузия.","The blood volume that fills the vessels without stretching their walls or creating pressure (≈ 4 L of 5 L, mostly veins). Sympathetic venoconstriction reduces it and converts it into stressed volume — autotransfusion.")},
 {t:L("Венозно връщане","Venous return"),re:"венозн[а-я]* връщане[а-я]*",
  d:L("VR = (MSFP − RAP)/RVR; в равновесие е равно на CO. Кривата е права, която пресича оста при MSFP и стига плато под RAP ≈ −2…−4 mmHg (колапс на вените). RVR ≈ 1,4 mmHg·min/L.","VR = (MSFP − RAP)/RVR; at steady state it equals CO. The curve is a line crossing the axis at MSFP that plateaus below RAP ≈ −2…−4 mmHg (venous collapse). RVR ≈ 1.4 mmHg·min/L.")},
 {t:L("Транскапилярно пълнене","Transcapillary refill"),re:"транскапилярн[а-я]* пълнене[а-я]*|refill",
  d:L("Преходно навлизане на интерстициална течност в капилярите след кръвоизлив, защото прекапилярната вазоконстрикция сваля Pc под онкотичното налягане на плазмата. ≈ 0,5–1 L за часове; течността е без еритроцити и с малко белтък → хемодилуция.","Transient entry of interstitial fluid into capillaries after haemorrhage, because precapillary vasoconstriction lowers Pc below plasma oncotic pressure. ≈ 0.5–1 L over hours; the fluid lacks red cells and is low in protein → haemodilution.")},
 {t:L("Шоков индекс","Shock index"),re:"шоков[а-я]* индекс[а-я]*",
  d:L("HR/SBP. Норма 0,5–0,7; > 0,9–1,0 показва значителна хипоперфузия и нужда от кръв, дори при „нормално“ систолно налягане.","HR/SBP. Normal 0.5–0.7; > 0.9–1.0 indicates significant hypoperfusion and transfusion need, even with a “normal” systolic pressure.")},
 {t:L("Кислороден дълг","Oxygen debt"),re:"кислороден дълг[а-я]*|O₂-дълг[а-я]*|oxygen debt",
  d:L("Кумулативната разлика между нужната и реално консумираната O₂ по време на хипоперфузия (mL/kg). При кучета ≈ 100 mL/kg е преживяем, 120 mL/kg — LD50, ≥ 140 — фатален (Crowell & Smith 1964). Лактатът е неговият биохимичен белег.","The cumulative difference between required and actually consumed O₂ during hypoperfusion (mL/kg). In dogs ≈ 100 mL/kg is survivable, 120 mL/kg the LD50 and ≥ 140 fatal (Crowell & Smith 1964). Lactate is its biochemical marker.")},
 {t:L("Необратим шок","Irreversible shock"),re:"необратим[а-я]* шок[а-я]*|прогресивен шок[а-я]*",
  d:L("Фаза, в която положителните обратни връзки (потиснат миокард, отказ на вазомоторния център, ацидоза, капилярен теч, утаяване на кръвта, клетъчно увреждане) се самоподдържат и дори пълното възстановяване на обема дава само временно подобрение.","A phase in which positive feedbacks (depressed myocardium, failing vasomotor centre, acidosis, capillary leak, sludging, cellular injury) are self-sustaining, so even full volume replacement gives only a temporary improvement.")},
 {t:L("Дистрибутивен шок","Distributive shock"),re:"дистрибутивен шок[а-я]*|септичен шок[а-я]*|анафилактичен шок[а-я]*|неврогенен шок[а-я]*",
  d:L("Шок от патологична вазодилатация и разпределение на кръвта: септичен (NO, хипореактивност, теч; CO рано висок), анафилактичен (хистамин; минути), неврогенен (загуба на симпатиков тонус; без тахикардия). TPR е нисък.","Shock from pathological vasodilation and maldistribution of blood: septic (NO, hyporesponsiveness, leak; CO high early), anaphylactic (histamine; minutes), neurogenic (loss of sympathetic tone; no tachycardia). TPR is low.")}];

/*__STG__*/

/* английски за легендата и номерираните заглавия на етапите (stageViewer ги сглобява като „N. текст“) */
const stgEN=c=>{if(!c)return;(c.legend||[]).forEach(([col,n])=>{if(EN[n])EN['<i class="dot" style="background:'+col+'"></i>'+n]='<i class="dot" style="background:'+col+'"></i>'+EN[n]});
  (c.mechs||[{stages:c.stages}]).forEach(m=>(m.stages||[]).forEach((st,k)=>["t","short"].forEach(f=>{const v=st[f];if(typeof v==="string"&&EN[v])EN[(k+1)+". "+v]=(k+1)+". "+EN[v]})))};
if(typeof STG_SH!=="undefined")stgEN(STG_SH);

/* ---------- изглед ---------- */
const SH_P0={loss:0,cry:0,bld:0,contr:100,tpr:100,symt:100,leak:0,pre:"norm"};
function view(main){let SS=null;window.__shP=Object.assign({},SH_P0);
  const v3=typeof sh3D==="function"?sh3D(()=>({s:SS,p:window.__shP})):null;
  const cfg={key:"shock",h2:L("Шок и кръвозагуба: интегрирана регулация","Shock and haemorrhage: integrated regulation"),
   lead:L("Криви на Гайтън (венозно връщане × Франк–Старлинг), барорефлекс, RAAS/ADH, транскапилярно пълнене и кислороден дълг. Времето се свива автоматично: секунди → минути → часове → дни. Опростено: една камера, един среден капиляр, кучешки праг на O₂-дълга.","Guyton curves (venous return × Frank–Starling), baroreflex, RAAS/ADH, transcapillary refill and oxygen debt. Time compresses automatically: seconds → minutes → hours → days. Simplified: one ventricle, one average capillary, the canine oxygen-debt threshold."),
   ch:360,speed:1,dtmax:0.05,recdt:0.1,hmax:3000,
   sl:[{k:"loss",label:L("Кръвозагуба","Blood loss"),min:0,max:3000,step:50,value:0,unit:"mL",hint:L("изтича със 100 mL/min; 5 L кръв: <750 клас I, 750–1500 II, 1500–2000 III, >2000 IV","flows out at 100 mL/min; 5 L blood: <750 class I, 750–1500 II, 1500–2000 III, >2000 IV")},
       {k:"cry",label:L("Кристалоид (Рингер/0,9 % NaCl)","Crystalloid (Ringer/0.9 % NaCl)"),min:0,max:4000,step:250,value:0,unit:"mL",hint:L("влива се от 30-ата min със 100 mL/min; за час в съдовете остават ≈10–25 %","infused from minute 30 at 100 mL/min; after an hour ≈10–25 % stays intravascular")},
       {k:"bld",label:L("Кръв (ЕМ:плазма 1:1)","Blood (RBC:plasma 1:1)"),min:0,max:3000,step:250,value:0,unit:"mL",hint:L("Hct ≈40 %, белтък 6 g/dL; възстановява и обема, и кислородния капацитет","Hct ≈40 %, protein 6 g/dL; restores both volume and oxygen capacity")},
       {k:"contr",label:L("Контрактилитет","Contractility"),min:10,max:150,step:5,value:100,unit:"%",hint:L("< 40 % = кардиогенен шок (обширен инфаркт); кривата става по-ниска и по-полегата","< 40 % = cardiogenic shock (large infarct); the curve becomes lower and flatter")},
       {k:"tpr",label:L("Съдов тонус (TPR)","Vascular tone (TPR)"),min:15,max:150,step:5,value:100,unit:"%",hint:L("< 100 % = вазодилатация (сепсис, анафилаксия) + венодилатация; > 100 % ≈ вазопресор","< 100 % = vasodilation (sepsis, anaphylaxis) + venodilation; > 100 % ≈ vasopressor")},
       {k:"symt",label:L("Симпатиков еферентен тонус","Sympathetic efferent tone"),min:0,max:100,step:5,value:100,unit:"%",hint:L("< 30 % = неврогенен шок (гръбначна травма над Th6), спинална анестезия","< 30 % = neurogenic shock (spinal cord injury above T6), spinal anaesthesia")},
       {k:"leak",label:L("Капилярен теч","Capillary leak"),min:0,max:100,step:5,value:0,unit:"%",hint:L("↑Kf, ↓σ за белтък: плазма и албумин излизат (сепсис, анафилаксия, изгаряния)","↑Kf, ↓σ for protein: plasma and albumin escape (sepsis, anaphylaxis, burns)")}],
   pre:{norm:{n:L("Норма","Normal"),info:L("MAP 93 mmHg, CO 5 L/min, RAP 0, MSFP 7 mmHg. Венозното връщане се определя от разликата MSFP − RAP и от съпротивлението на връщането (1,4 mmHg·min/L); сърцето изпомпва каквото получи (Франк–Старлинг). От 5 L кръв ≈4 L са „ненапрегнат“ обем — пълнят вените, без да създават налягане.","MAP 93 mmHg, CO 5 L/min, RAP 0, MSFP 7 mmHg. Venous return is set by MSFP − RAP and the resistance to venous return (1.4 mmHg·min/L); the heart pumps whatever it receives (Frank–Starling). Of the 5 L of blood ≈4 L is unstressed volume — it fills the veins without creating pressure.")},
    h1:{n:L("Кръвозагуба клас I (500 mL)","Haemorrhage class I (500 mL)"),set:{loss:500},info:L("10 % от обема (като кръводаряване). Венoконстрикцията мобилизира ненапрегнатия обем, HR се качва леко до ≈85. Налягането, пулсовото налягане, дишането и диурезата остават почти нормални. Компенсира се изцяло без лечение.","10 % of volume (like a blood donation). Venoconstriction mobilises unstressed volume and HR rises slightly to ≈85. Pressure, pulse pressure, breathing and urine stay almost normal. Fully compensated without treatment.")},
    h2:{n:L("Кръвозагуба клас II (1250 mL)","Haemorrhage class II (1250 mL)"),set:{loss:1250},info:L("25 %. Тахикардия 100–120, систолното налягане е почти запазено, но диастолното е високо → тясно пулсово налягане (≈25 mmHg). Шоковият индекс > 1. Урината пада до 20–30 mL/h (ADH, ангиотензин II, алдостерон). Кожата е бледа и студена — периферна вазоконстрикция.","25 %. Tachycardia 100–120, systolic pressure almost preserved but diastolic high → narrow pulse pressure (≈25 mmHg). Shock index > 1. Urine falls to 20–30 mL/h (ADH, angiotensin II, aldosterone). Skin is pale and cold — peripheral vasoconstriction.")},
    h3:{n:L("Кръвозагуба клас III (1750 mL)","Haemorrhage class III (1750 mL)"),set:{loss:1750},info:L("35 %. HR 120–140, систолното < 100, дишане ≈30/min, урина 5–15 mL/h, объркване. Лактатът расте за часове. Транскапилярното пълнене връща ≈0,5–0,7 L за 1–4 h и Hct пада до ≈38–39 % — без кръвопреливане моделът оцелява, но на ръба (кислороден дълг 2–3 L).","35 %. HR 120–140, systolic < 100, breathing ≈30/min, urine 5–15 mL/h, confusion. Lactate climbs over hours. Transcapillary refill returns ≈0.5–0.7 L within 1–4 h and Hct falls to ≈38–39 % — without transfusion the model survives, but only just (oxygen debt 2–3 L).")},
    h4:{n:L("Кръвозагуба клас IV (2250 mL)","Haemorrhage class IV (2250 mL)"),set:{loss:2250},info:L("45 %. HR > 140, систолно < 90, урината спира, дишане > 35, лактат > 5. Сърцето е на стръмната част на кривата на Франк–Старлинг, но MSFP е ≈1–2 mmHg. Кислородният дълг расте ≈40 mL/min и след ≈4,5 h надминава 7 L (100 mL/kg) — започва необратимата фаза.","45 %. HR > 140, systolic < 90, urine stops, breathing > 35, lactate > 5. The heart sits on the steep part of the Frank–Starling curve but MSFP is ≈1–2 mmHg. Oxygen debt grows by ≈40 mL/min and after ≈4.5 h exceeds 7 L (100 mL/kg) — the irreversible phase begins.")},
    h3cry:{n:L("Клас III + 2 L кристалоид","Class III + 2 L crystalloid"),set:{loss:1750,cry:2000},info:L("От 30-ата min се вливат 2 L Рингер. Налягането се вдига за кратко, но кристалоидът няма онкотично налягане: разрежда плазмения белтък и за час 75–90 % излизат в интерстициума. Hct пада (хемодилуция) и кислородното съдържание пада заедно с него. ATLS 10 препоръчва начално ≤ 1 L и ранна кръв.","From minute 30, 2 L of Ringer's is infused. Pressure rises briefly, but crystalloid has no oncotic pressure: it dilutes plasma protein and within an hour 75–90 % has moved into the interstitium. Hct falls (haemodilution) and oxygen content with it. ATLS 10 recommends ≤ 1 L initially and early blood.")},
    h3bld:{n:L("Клас III + 1,5 L кръв","Class III + 1.5 L blood"),set:{loss:1750,bld:1500},info:L("Кръвта (еритроцити + плазма 1:1) остава в съдовете, връща MSFP, ударния обем и кислородния капацитет. HR пада под 80 за минути, лактатът се изчиства за 1–2 h, урината се нормализира.","Blood (RBC + plasma 1:1) stays intravascular and restores MSFP, stroke volume and oxygen-carrying capacity. HR falls below 80 within minutes, lactate clears in 1–2 h and urine output normalises.")},
    irr:{n:L("Необратим шок (кръв на 5-ия час)","Irreversible shock (blood at hour 5)"),set:{loss:2250,bld:2250},info:L("Клас IV без лечение 5 часа, после се връща ЦЯЛАТА изгубена кръв. Налягането скача до ≈100 mmHg, но след ≈1 h пада отново и пациентът умира: натрупаният кислороден дълг е задействал порочния кръг — потиснат миокард, отказ на вазомоторния център, ацидоза, капилярен теч (Hct расте). Експериментът на Гайтън с кучета (гл. 24).","Class IV untreated for 5 h, then ALL of the lost blood is returned. Pressure jumps to ≈100 mmHg, but after ≈1 h it falls again and the patient dies: the accumulated oxygen debt has triggered the vicious circle — depressed myocardium, failing vasomotor centre, acidosis, capillary leak (Hct rises). Guyton's dog experiment (ch. 24).")},
    sept:{n:L("Септичен шок","Septic shock"),set:{tpr:30,leak:15},info:L("Възпалителни медиатори (NO, простагландини) → артериоло- и венодилатация, съдова хипореактивност към катехоламините, относителен дефицит на ADH, капилярен теч. Рано CO е ВИСОК (8–9 L/min, „топъл“ шок), TPR ≈40 % от нормата, MAP < 65. Лактатът расте, въпреки че доставката на O₂ е висока — микроциркулаторен шънт и намалена екстракция. Sepsis-3: вазопресор за MAP ≥ 65 и лактат > 2 въпреки течности.","Inflammatory mediators (NO, prostaglandins) → arteriolar and venous dilation, vascular hyporesponsiveness to catecholamines, relative ADH deficiency, capillary leak. Early CO is HIGH (8–9 L/min, “warm” shock), TPR ≈40 % of normal, MAP < 65. Lactate rises although O₂ delivery is high — microcirculatory shunting and impaired extraction. Sepsis-3: vasopressor for MAP ≥ 65 and lactate > 2 despite fluids.")},
    card:{n:L("Кардиогенен шок","Cardiogenic shock"),set:{contr:18},info:L("Обширен инфаркт: кривата на сърдечната функция е ниска и полегата. CO 2,6 L/min (CI < 2,2), систолно ≈90, RAP се вдига до 7–9 mmHg и продължава да расте (задръжка на течности). TPR е висок, кожата студена, урината ≈20 mL/h. Допълнителна течност вдига RAP, но не и CO.","Large infarct: the cardiac function curve is low and flat. CO 2.6 L/min (CI < 2.2), systolic ≈90, RAP rises to 7–9 mmHg and keeps rising (fluid retention). TPR is high, skin cold, urine ≈20 mL/h. Extra fluid raises RAP but not CO.")},
    anaph:{n:L("Анафилактичен шок","Anaphylactic shock"),set:{tpr:20,leak:35},info:L("IgE → мастоцити → хистамин, левкотриени, PAF: за минути масивна артериоло- и венодилатация и капилярен теч (до 35 % от плазмата за 10 min). MAP пада под 60 за 5 min, HR > 150, пулсовото налягане е широко (нисък диастолен), Hct расте. Лечение: адреналин i.m. 0,5 mg (α1 — тонус, β1 — сърце, β2 — бронхи, стабилизира мастоцитите) + течности.","IgE → mast cells → histamine, leukotrienes, PAF: within minutes massive arteriolar and venous dilation and capillary leak (up to 35 % of plasma in 10 min). MAP drops below 60 within 5 min, HR > 150, pulse pressure is wide (low diastolic), Hct rises. Treatment: adrenaline 0.5 mg i.m. (α1 — tone, β1 — heart, β2 — bronchi, stabilises mast cells) + fluids.")},
    neuro:{n:L("Неврогенен шок","Neurogenic shock"),set:{symt:10},info:L("Прекъснат симпатиков изход (травма над Th6): венозен застой (ненапрегнатият обем расте), ниско TPR, а сърдечните симпатикови влакна (Th1–4) са загубени → НЯМА тахикардия (HR ≈80 при MAP 65), кожата е топла и суха. Барорецепторите сигнализират, но еферентното рамо липсва. Лечение: течности + вазопресор (норадреналин), при брадикардия — атропин.","Sympathetic outflow interrupted (injury above T6): venous pooling (unstressed volume rises), low TPR, and the cardiac sympathetic fibres (T1–4) are lost → NO tachycardia (HR ≈80 at a MAP of 65), skin warm and dry. Baroreceptors still signal, but the efferent limb is missing. Treatment: fluids + vasopressor (noradrenaline), atropine for bradycardia.")}},
   ev:{w1:{l:"1 s = 1 s",f:s=>{if(s)s.warp=1/60}},wm:{l:"1 s = 1 min",f:s=>{if(s)s.warp=1}},w10:{l:"1 s = 10 min",f:s=>{if(s)s.warp=10}},wh:{l:"1 s = 1 h",f:s=>{if(s)s.warp=60}},wa:{l:L("Авто","Auto"),f:s=>{if(s)s.warp=0}}},
   exp,init:p=>{const s=shInit(p);s.e={contr:100,tpr:100,symt:100,leak:0};s.warp=0;s.cryRet=0;s.sh=null;SS=s;window.__shP=p;return s},
   step(s,p,dt){SS=s;window.__shP=p;if(s.dead||s.t>=TEND)return;
     const D=dt*(s.warp||W(s.t)),n=Math.max(1,Math.ceil(D/0.02)),h=D/n;   // h ≤ 0,02 min (при 0,05 барорефлексът осцилира — §1.0)
     for(let i=0;i<n;i++){const F=shStep(s,p,h);if(!F||s.dead)break;
       /* „останал в съдовете кристалоид“ (§3.3): вместо приближението ∫(Jv−Jv₀)dt — сянка-симулация без кристалоид от началото на вливането;
          retained = V − V_сянка (точно за модела); пази се 4 h след началото на вливането */
       if(s.gC>0&&s.t<tInf(p)+240){if(!s.sh){const c=JSON.parse(JSON.stringify(Object.assign({},s,{sh:null})));c.gC=s.gC;s.sh=c}
         s.sh.t=s.t-h;shStep(s.sh,Object.assign({},p,{cry:s.sh.gC}),h);s.cryRet=(s.Vp+s.Vr)-(s.sh.Vp+s.sh.Vr)+s.sh.gC}else if(s.sh&&s.t>=tInf(p)+240)s.sh=null;
       if(s.t>=TEND)break}},
   rec:(s,p,t)=>{const F=shFlux(s,p);return [s.t,F.MAP,F.HR,F.CO,s.Lac,F.Hct*100,F.V,F.UO*60,s.ADH,s.D]},
   calc:(p,s)=>s?shFlux(s,p):null,
   stats:(p,R,s)=>{if(!s)return [];const F=shFlux(s,p),auto=!s.warp;
     return [[L("Време","Time"),fmtT(s.t)+" · 1 s = "+wLab(s.warp||W(s.t))+(auto?" ("+T_(L("авто","auto"))+")":"")],
      ["MAP",fmt(F.MAP,0)+" mmHg ("+fmt(F.SBP,0)+"/"+fmt(F.DBP,0)+")"],
      [L("Пулсово налягане","Pulse pressure"),fmt(F.PP,0)+" mmHg (35–50)"],
      ["HR",fmt(F.HR,0)+" /min · SI "+fmt(F.SI,2)],
      [L("Ударен обем / CO","Stroke volume / CO"),fmt(F.SV,0)+" mL · "+fmt(F.CO,1)+" L/min (CI "+fmt(F.CO/1.9,1)+")"],
      ["RAP / MSFP",fmt(F.RAP,1)+" / "+fmt(F.MSFP,1)+" mmHg"],
      ["TPR",fmt(F.TPR*80,0)+" dyn·s·cm⁻⁵ (900–1500)"],
      [L("Кръвен обем","Blood volume"),fmt(F.V,0)+" mL ("+fmt(100*(1-F.V/5000),0)+" % "+T_(L("дефицит","deficit"))+") · "+T_(L("загуба","loss"))+" "+fmt(s.bled,0)+" mL"],
      ["Hct",fmt(F.Hct*100,1)+" % · "+T_(L("белтък","protein"))+" "+fmt(F.Cp,1)+" g/dL"],
      [L("Транскапилярен поток","Transcapillary flow"),fmt(F.Lym-F.Jv,1)+" mL/min "+T_(L("към кръвта","into the blood"))],
      [L("Лактат / pH / BE","Lactate / pH / BE"),fmt(s.Lac,1)+" mmol/L · "+fmt(F.pH,2)+" · "+fmt(F.BE,1)+" "+T_(L("(само лактатна компонента)","(lactate component only)"))],
      [L("Урина","Urine"),fmt(F.UO*60,0)+" mL/h (> 0,5 mL/kg/h = 35)"],
      [L("ADH / ренин / алдостерон","ADH / renin / aldosterone"),"×"+fmt(s.ADH,1)+" / ×"+fmt(s.Ren,1)+" / ×"+fmt(s.Ald,1)],
      [L("Симпатикус / вагус","Sympathetic / vagal"),fmt(F.symE,2)+" / "+fmt(s.par,2)],
      [L("O₂: доставка / дълг","O₂: delivery / debt"),fmt(F.DO2,0)+" mL/min · "+T_(L("дълг","debt"))+" "+fmt(s.D/1000,1)+" L ("+T_(L("праг","threshold"))+" 7)"],
      [L("Дишане","Respiration"),fmt(F.RR,0)+" /min"]]},
   note:(p,R,s)=>{if(!s)return "";const F=shFlux(s,p),E=s.e||p,X=(b,e)=>T_(L(b,e));
     if(s.dead)return X("<b>Смърт</b>: MAP < 25 mmHg над 5 min. Необратимата фаза започва, когато кислородният дълг надхвърли ≈100 mL/kg.","<b>Death</b>: MAP < 25 mmHg for > 5 min. The irreversible phase starts when the oxygen debt exceeds ≈100 mL/kg.");
     if(s.Ir>0.15)return X("<b>Необратим шок</b>: порочният кръг (миокард ↓, вазомоторен център ↓, ацидоза, капилярен теч) вече се самоподдържа — дори пълно възстановяване на обема дава само временно подобрение.","<b>Irreversible shock</b>: the vicious circle (myocardium ↓, vasomotor centre ↓, acidosis, capillary leak) is now self-sustaining — even full volume replacement gives only a temporary improvement.");
     if(s.D>4000&&!s.Ir)return X("<b>Прогресивен шок</b>: кислородният дълг е ","<b>Progressive shock</b>: oxygen debt ")+fmt(s.D/1000,1)+X(" L. Под ≈7 L той още е обратим — сега е моментът за кръв и спиране на кървенето."," L. Below ≈7 L it is still reversible — now is the time for blood and haemorrhage control.");
     if(E.symt<40&&F.MAP<75)return X("<b>Неврогенен шок</b>: хипотония БЕЗ тахикардия, топла кожа — барорефлексът не може да стигне до сърцето и съдовете.","<b>Neurogenic shock</b>: hypotension WITHOUT tachycardia, warm skin — the baroreflex cannot reach heart and vessels.");
     if(E.contr<45&&F.RAP>4)return X("<b>Кардиогенен шок</b>: RAP е висок, а CO нисък — работната точка е на плоската част на ниската сърдечна крива; още течност вдига RAP, не CO.","<b>Cardiogenic shock</b>: RAP high and CO low — the operating point lies on the flat part of a depressed cardiac curve; more fluid raises RAP, not CO.");
     if(F.TPR<11&&F.CO>6.5&&F.MAP<70)return X("<b>Дистрибутивен („топъл“) шок</b>: CO е висок, но TPR е ≈40 % — налягането пада въпреки високия поток. Лактатът расте заради микроциркулацията, не заради ниската доставка.","<b>Distributive (“warm”) shock</b>: CO is high but TPR ≈40 % — pressure falls despite high flow. Lactate rises because of the microcirculation, not low delivery.");
     if(s.gC>500&&F.Hct<0.38&&s.t-30<180)return X("<b>Кристалоидът разрежда</b>: от ","<b>Crystalloid dilutes</b>: of ")+fmt(s.gC,0)+X(" mL в съдовете са останали ≈"," mL only ≈")+fmt(cl(s.cryRet,0,s.gC),0)+X(" mL. Hct и кислородното съдържание падат."," mL remain intravascular. Hct and oxygen content fall.");
     if(s.bled>1500&&F.SBP<95)return X("<b>ATLS клас III–IV</b>: SBP пада едва при загуба > 30 %. По-ранни белези: HR, тясно пулсово налягане, шоков индекс > 1, лактат.","<b>ATLS class III–IV</b>: SBP falls only after > 30 % loss. Earlier signs: HR, narrow pulse pressure, shock index > 1, lactate.");
     if(F.Lym-F.Jv>3&&s.t<480)return X("<b>Транскапилярно пълнене</b>: прекапилярната вазоконстрикция сваля Pc до ≈","<b>Transcapillary refill</b>: precapillary constriction lowers Pc to ≈")+fmt(F.Pc,0)+X(" mmHg и течността влиза в капилярите (≈0,5–1 L за часове) → Hct пада."," mmHg and fluid enters the capillaries (≈0.5–1 L over hours) → Hct falls.");
     if(s.bled>300&&s.t<3)return X("<b>Първите секунди</b>: вагусът се изключва за 1–2 s (HR ↑), симпатикусът — за 5–20 s (съдове, вени, контрактилитет).","<b>First seconds</b>: vagal tone is withdrawn within 1–2 s (HR ↑), sympathetic activation follows in 5–20 s (vessels, veins, contractility).");
     if(s.t>=TEND)return X("Края на 72 h. Избери пресет отново, за да пуснеш пак.","End of 72 h. Choose a preset again to rerun.");
     return X("Времето се свива автоматично (ред „Време“); бутоните горе задават скоростта ръчно. Работната точка CO = VR е на втората графика.","Time compresses automatically (“Time” row); the buttons above set the speed by hand. The CO = VR operating point is on the second plot.")},
   legend:`<span><i style="background:${C.map}"></i>MAP</span><span><i style="background:${C.hr}"></i>HR</span><span><i style="background:${C.co}"></i>CO×10</span><span><i style="background:${C.lac}"></i>${T_(L("лактат×10","lactate×10"))}</span><span><i style="background:${C.hct}"></i>Hct %</span><span><i style="background:${C.vol}"></i>${T_(L("обем L×20","volume L×20"))}</span> | <span><i style="background:${C.vol}"></i>${T_(L("венозно връщане","venous return"))}</span><span><i style="background:${C.map}"></i>${T_(L("сърдечна крива","cardiac curve"))}</span><span><i style="background:${C.gr}"></i>${T_(L("норма (пунктир)","normal (dashed)"))}</span><span><i style="background:${C.map};border-radius:50%"></i>${T_(L("работна точка","operating point"))}</span>`,
   plots:[{h:230,f:(p,R,h)=>{const x=h.map(a=>Math.log10(Math.max(0.1,a[0]))),vl=(t,o)=>{const lx=Math.log10(Math.max(0.1,t));return {x:[lx,lx],y:[0,160],color:C.gr,width:1,dash:o||[2,3]}},ser=[];
       if(p.loss>0)ser.push(vl(p.loss/100));const ti=tInf(p),di=Math.max(p.cry,p.bld)/100;if(di>0){ser.push(vl(ti,[6,3]));ser.push(vl(ti+di,[6,3]))}
       const tk=[[-1,"6 s"],[0,"1 min"],[1,"10 min"],[1.78,"1 h"],[2.56,"6 h"],[3.16,"24 h"],[3.6,"72 h"]];
       return {xmin:-1,xmax:3.64,ymin:0,ymax:160,xlabel:T_(L("време, log₁₀(min) — 6 s … 72 h","time, log₁₀(min) — 6 s … 72 h")),ylabel:T_(L("MAP · HR · CO×10 · лактат×10 · Hct · L×20","MAP · HR · CO×10 · lactate×10 · Hct · L×20")),
        hlines:[{y:65,color:C.gr,label:T_(L("MAP 65 — цел при шок","MAP 65 — shock target"))}],texts:tk.map(([v,t],i)=>({x:v,text:t,align:i===0?"left":i===tk.length-1?"right":"center"})),
        series:ser.concat([{x,y:h.map(a=>a[6]/1000*20),color:C.vol,width:1.6,dash:[5,3]},{x,y:h.map(a=>a[5]),color:C.hct,width:1.6,dash:[4,3]},{x,y:h.map(a=>Math.min(160,a[4]*10)),color:C.lac,width:2},{x,y:h.map(a=>a[3]*10),color:C.co,width:2},{x,y:h.map(a=>a[2]),color:C.hr,width:2},{x,y:h.map(a=>a[1]),color:C.map,width:2.4}])}}},
    {h:230,f:(p,R)=>{const o={xmin:-4,xmax:16,ymin:0,ymax:12,xlabel:T_(L("RAP, mmHg","RAP, mmHg")),ylabel:T_(L("поток (CO = VR), L/min","flow (CO = VR), L/min")),series:[],marks:[]};
       const rs=[];for(let r=-4;r<=16.001;r+=0.25)rs.push(r);
       const vr=(M,Rv)=>{const xs=[],ys=[];rs.forEach(r=>{const y=(M-Math.max(r,-2))/Rv;if(y>=0){xs.push(r);ys.push(y)}});if(M>-2){xs.push(M);ys.push(0)}return {xs,ys}};
       const ch=(hr,svm,k)=>rs.map(r=>r<=-2?0:Math.min(14,hr*svm*(1-Math.exp(-(r+2)/k))/1000));
       const n1=vr(7,1.4);o.series.push({x:n1.xs,y:n1.ys,color:C.gr,width:1.3,dash:[5,4]},{x:rs,y:ch(72,125,2.5),color:C.gr,width:1.3,dash:[5,4]});
       if(R){const v=vr(R.MSFP,R.RVR);o.series.push({x:v.xs,y:v.ys,color:C.vol,width:2.4},{x:rs,y:ch(R.HR,R.SVm,R.kS),color:C.map,width:2.4});
         const M=R.MSFP;o.series.push({x:[M-0.3,M+0.3,M,M-0.3],y:[0.02,0.02,0.55,0.02],color:C.vol,width:2});
         o.marks.push({x:M,y:0.6,color:C.vol,label:"MSFP "+fmt(M,1)},{x:R.RAP,y:R.CO,color:C.map,label:"CO "+fmt(R.CO,1)+" / RAP "+fmt(R.RAP,1)})}
       return o}}],
   draw};
  window.__shCfg=cfg;mkSim(main,cfg);
  if(v3){const card=main.querySelector(".card");if(card&&card.parentNode)card.parentNode.insertBefore(v3.el,card);(window.__cleanups=window.__cleanups||[]).push(v3.start())}
  if(typeof STG_SH!=="undefined"&&STG_SH&&typeof zAddStg==="function")zAddStg(main,STG_SH)}

zRegister("shock",{name:L("Шок и кръвозагуба","Shock and haemorrhage"),view,book,tests,exp,gl});
window.__shModel={shInit,shStep,shFlux,P_,LP};
L("Шок и кръвозагуба","Shock and haemorrhage");
})();
