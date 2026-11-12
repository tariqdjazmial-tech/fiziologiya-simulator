const HS_N={tf:1,plt:250,pf:100,vwf:100,f7:100,f8:100,f9:100,f10:100,f2:100,f5:100,f11:100,f12:100,fbg:3,at:100,hep:0,pc:100,leiden:0,tpa:100};
function hsInit(){return {t:0,P:0,IXa:0,Xa:0,T:0,Fn:0,Pm:0,A:0,X13:0,loss:0,Tpk:0,tc:null}}
function hsDer(s,p,mode){const f=k=>p[k]/100,at=f("at")*(1+p.hep*9),plt=Math.min(1.3,p.plt/250),fb=p.fbg/3;
  const S=mode?1:0.12+0.88*s.P,ext=mode==="aptt"?0:(mode==="pt"?6:p.tf)*f("f7")*Math.exp(-s.t/(mode?400:50));
  const contact=mode==="aptt"?0.004*f("f12"):mode?0:0.0004*f("f12");
  const apc=1/(1+4*s.A),V8=f("f8")*(0.04+s.T/(s.T+0.04))*apc,V5=f("f5")*s.T/(s.T+0.02)*(p.leiden?1/(1+0.4*s.A):apc);
  const d={};
  d.IXa=f("f9")*(0.012*ext+(contact+0.06*s.T)*f("f11"))-0.06*at*s.IXa;
  d.Xa=f("f10")*(0.02*ext+2.2*s.IXa*V8*S)-0.12*at*s.Xa;
  d.T=f("f2")*(0.9*s.Xa*(0.04+V5)*S)-0.07*at*s.T;
  d.Fn=0.6*s.T*s.T/(s.T*s.T+1)*(fb-s.Fn)*(fb>0?1:0)-0.05*s.Pm*s.Fn*(1-0.95*s.X13);
  d.X13=0.04*s.T*(1-s.X13);
  d.Pm=0.0007*f("tpa")*s.Fn*(1+2*Math.max(0,f("tpa")-1))-0.004*s.Pm;
  d.A=0.03*f("pc")*s.T-0.003*s.A;
  d.P=mode?0:(0.012*f("vwf")*p.tf+0.25*s.T)*plt*f("pf")*(Math.min(1,plt*1.1)-s.P);
  return d}
function hsStep(s,p,dt,mode){const d=hsDer(s,p,mode);for(const k in d){s[k]=Math.max(0,s[k]+d[k]*dt)}s.t+=dt;if(s.T>s.Tpk)s.Tpk=s.T;
  const cl=hsClot(s,p);if(s.tc==null&&cl>0.5)s.tc=s.t;if(!mode)s.loss+=p.tf*Math.pow(1-cl,2)*dt*0.6;return s}
function hsClot(s,p){const fb=Math.max(0.01,p.fbg/3);return Math.min(1,0.35*s.P/Math.min(1,Math.max(0.05,p.plt/250))*Math.min(1,p.plt/150)*(p.pf/100)+0.65*Math.min(1,s.Fn/Math.max(0.3,Math.min(1,fb)))*Math.min(1,fb*1.6))}
function hsLabRaw(p,mode){const s=hsInit();for(let i=0;i<24000;i++){hsStep(s,p,0.01,mode);if(s.Fn>0.15*Math.min(1,p.fbg/3)+0.02)return s.t}return 240}
let HS_REF=null;
function hsLabs(p){if(!HS_REF)HS_REF={pt:hsLabRaw(HS_N,"pt"),aptt:hsLabRaw(HS_N,"aptt")};
  const pt=12*hsLabRaw(p,"pt")/HS_REF.pt,aptt=30*hsLabRaw(p,"aptt")/HS_REF.aptt,fb=p.fbg/3,plt=Math.min(1,p.plt/200),vw=Math.min(1,p.vwf/100*0.9+0.1);
  const bt=Math.min(30,5/Math.pow(Math.max(0.03,plt*p.pf/100*vw),1.1));
  const tt=Math.min(120,16*Math.pow(Math.max(0.15,fb),-0.6)*(1+p.hep*3));
  return {pt,inr:Math.pow(pt/12,1.05),aptt,bt,tt}}
const HS_PRE={
 normal:{n:"Норма",o:{}},
 hemA:{n:"Хемофилия A (фактор VIII 2 %)",o:{f8:2}},
 hemB:{n:"Хемофилия B (фактор IX 2 %)",o:{f9:2}},
 vwd:{n:"Болест на фон Вилебранд",o:{vwf:20,f8:40}},
 thr:{n:"Тромбоцитопения (25 × 10⁹/L)",o:{plt:25}},
 asa:{n:"Аспирин (потисната функция на тромбоцитите)",o:{pf:25}},
 warf:{n:"Варфарин / дефицит на витамин K",o:{f2:40,f7:30,f9:40,f10:40,pc:40}},
 hep:{n:"Нефракциониран хепарин",o:{hep:1}},
 f12:{n:"Дефицит на фактор XII",o:{f12:0}},
 dic:{n:"ДИК (дисеминирана интраваскуларна коагулация)",o:{fbg:0.8,plt:50,f5:50,f8:50,f2:60,f10:60,tpa:400,at:50}},
 leiden:{n:"Фактор V Лайден (резистентност към APC)",o:{leiden:1}},
 tpa:{n:"Тромболиза с tPA",o:{tpa:500}}};
const HS_INFO={
 normal:"<b>Норма:</b> до секунди съдът се свива и тромбоцитите полепват по колагена чрез фактора на фон Вилебранд. Тъканният фактор (TF) с VIIa образува малко тромбин. Той активира тромбоцитите и факторите V, VIII и XI — следва „тромбинов взрив“ и фибринът укрепва тапата.",
 hemA:"<b>Хемофилия A:</b> без VIIIa теназата (IXa + VIIIa) не работи и тромбиновият взрив почти изчезва. Тромбоцитната тапа се образува нормално (времето на кървене е нормално), но фибринът е малко и нестабилен — кървенето се подновява. Удължено е aPTT, PT е нормално.",
 hemB:"<b>Хемофилия B (болест на Christmas):</b> същата картина като при хемофилия A — липсва IXa за теназата. aPTT е удължено, PT и времето на кървене са нормални.",
 vwd:"<b>Болест на фон Вилебранд:</b> тромбоцитите не могат да полепнат по колагена при бърз кръвоток — удължено време на кървене. vWF пренася и пази фактор VIII, затова VIII също пада и aPTT може леко да се удължи. Най-честото наследствено нарушение на кръвосъсирването.",
 thr:"<b>Тромбоцитопения:</b> под около 50 × 10⁹/L кървенето след травма е по-голямо, а под 10–20 × 10⁹/L се появяват спонтанни петехии. Тапата е малка, а и тромбинът е по-малко — тромбоцитите дават фосфолипидната повърхност за теназата и протромбиназата.",
 asa:"<b>Аспирин:</b> необратимо блокира COX-1 в тромбоцитите → няма тромбоксан A₂ и агрегацията отслабва за целия им живот (7–10 дни). Удължено време на кървене при нормални PT и aPTT.",
 warf:"<b>Варфарин / дефицит на витамин K:</b> без γ-карбоксилиране факторите II, VII, IX, X (и протеини C и S) не свързват Ca²⁺. Първо пада VII (най-кратък полуживот) — затова PT/INR е най-чувствителен. Целево INR при лечение — обикновено 2–3.",
 hep:"<b>Хепарин:</b> усилва около 1000 пъти антитромбин III, който инактивира тромбина и Xa (и IXa, XIa). Следи се с aPTT. При предозиране — протамин сулфат.",
 f12:"<b>Дефицит на фактор XII:</b> aPTT е силно удължено, но човекът не кърви — in vivo съсирването започва от тъканния фактор, а XI се активира от тромбина. Добър пример, че лабораторният тест не е същото като физиологията.",
 dic:"<b>ДИК:</b> при сепсис, травма или акушерски усложнения съсирването се включва в цялото тяло. Факторите, фибриногенът и тромбоцитите се изразходват, а плазминът разгражда фибрина. Резултат — едновременно микротромби и кървене. PT, aPTT и TT са удължени, D-димерът е висок.",
 leiden:"<b>Фактор V Лайден:</b> мутирал фактор V не се разгражда от активирания протеин C. Тромбинът продължава да се образува — тромбиновият пик е по-висок и по-дълъг. Склонност към венозни тромбози (тромбофилия); PT и aPTT са нормални.",
 tpa:"<b>Тромболиза:</b> тъканният плазминогенов активатор превръща плазминогена в плазмин, който разгражда фибрина до D-димери. Използва се при исхемичен инсулт и инфаркт — но разгражда и полезните съсиреци."};
const EXP_HS=[
 {q:"Хемофилия A: кой лабораторен тест е удължен?",opts:["PT (INR)","aPTT","Времето на кървене"],a:1,set:{pre:"hemA"},expl:"VIII е във вътрешния път, който aPTT измерва. Тромбоцитите са нормални, затова времето на кървене е нормално."},
 {q:"Пациент на варфарин. Кой тест се използва за контрол на дозата?",opts:["aPTT","PT/INR","Броят на тромбоцитите"],a:1,set:{pre:"warf"},expl:"Фактор VII е витамин K-зависим и с най-кратък полуживот (≈ 6 h). Той е само във външния път, който PT измерва."},
 {q:"Аспирин: какво се променя?",opts:["PT се удължава","aPTT се удължава","Удължава се времето на кървене, коагулационните тестове са нормални"],a:2,set:{pre:"asa"},expl:"Аспиринът засяга първичната (тромбоцитна) хемостаза, а не коагулационните фактори."},
 {q:"Дефицит на фактор XII: кърви ли пациентът повече при травма?",opts:["Да, като при хемофилия","Не — aPTT е удължено, но кървене няма","Само при спорт"],a:1,set:{pre:"f12"},expl:"In vivo каскадата започва от TF–VIIa, а фактор XI се активира от тромбина. Затова XII не е нужен за хемостазата."},
 {q:"Какъв е най-ранният стимул за тромбиновия взрив?",opts:["Фактор XII при контакт с колаген","Тъканният фактор с фактор VIIa","Плазминът"],a:1,set:{pre:"normal"},expl:"Малкото тромбин от TF–VIIa активира тромбоцитите и кофакторите V и VIII — така тръгва усилването на повърхността на тромбоцитите (клетъчен модел)."},
 {q:"Фактор V Лайден: какво ще стане с тромбиновия пик?",opts:["Ще е по-нисък","Ще е по-висок и по-продължителен","Няма да се промени"],a:1,set:{pre:"leiden"},expl:"Va не се разгражда от активирания протеин C, затова протромбиназата работи по-дълго. Следва тромбофилия."}];
const HS_NODES=[["XII","XIIa",395,30,"f12"],["XI","XIa",395,82,"f11"],["IX","IXa",395,134,"f9"],["VIII","VIIIa",480,134,"f8"],["TF·VII","VIIa",610,134,"f7"],["X","Xa",470,190,"f10"],["V","Va",560,190,"f5"],["II","тромбин",470,246,"f2"],["фибриноген","фибрин",470,302,"fbg"],["XIII","XIIIa",600,302,""]];
function viewHemost(main){
  main.innerHTML=`<h2>Хемостаза и коагулационна каскада</h2><p class="lead">Нараняване на малък съд: тромбоцитна тапа, каскада на факторите, тромбинов взрив, фибрин и фибринолиза. Промени факторите или избери заболяване и наблюдавай кога спира кървенето и какво показват PT, aPTT и времето на кървене.</p>
  <div class="card" style="padding:10px"><div class="btns"><select id="hsPre" style="width:auto;max-width:100%"></select><button class="b primary" id="hsGo">Нараняване ↻</button><button class="b" id="hsPl">⏸︎ Пауза</button><label class="small" style="display:flex;align-items:center;gap:6px">1 s =<select id="hsSp" style="width:auto"><option value="5">5 s</option><option value="15" selected>15 s</option><option value="40">40 s</option></select></label></div>
   <canvas id="hsC" style="width:100%;height:360px;display:block;margin-top:6px"></canvas>
   <div class="stats" id="hsS" style="margin-top:8px"></div>
   <div class="note" id="hsN" style="min-height:4.6em"></div>
   <canvas class="plot" id="hsG" style="height:200px"></canvas>
   <div class="legend"><span><i style="background:var(--accent)"></i>тромбин (спрямо нормалния пик)</span><span><i style="background:var(--accent4)"></i>фибрин</span><span><i style="background:var(--accent5)"></i>тромбоцитна тапа</span><span><i style="background:var(--accent3)"></i>здравина на съсирека</span><span><i class="dash" style="border-color:var(--accent2)"></i>нормата</span></div>
   <div class="grid2" style="grid-template-columns:1fr 1fr"><div id="hsc1"></div><div id="hsc2"></div></div></div>
  <h3>Експерименти</h3><div id="ex"></div>`;
  const sel=$("#hsPre");sel.innerHTML=Object.entries(HS_PRE).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("");
  const S={},ch=()=>{labs=null};
  const add=(c,k,o)=>S[k]=slider($(c),o,ch);
  add("#hsc1","tf",{label:"Размер на раната (TF, колаген)",min:0.3,max:3,step:0.1,value:1,d:1,show:v=>fmt(v,1)+"×"});
  add("#hsc1","plt",{label:"Тромбоцити",min:5,max:450,step:5,value:250,unit:"× 10⁹/L",hint:"норма 150–400"});
  add("#hsc1","pf",{label:"Функция на тромбоцитите",min:5,max:100,step:5,value:100,unit:"%",hint:"аспирин, клопидогрел ↓"});
  add("#hsc1","vwf",{label:"Фактор на фон Вилебранд",min:0,max:200,step:5,value:100,unit:"%"});
  add("#hsc1","fbg",{label:"Фибриноген",min:0.3,max:6,step:0.1,value:3,d:1,unit:"g/L",hint:"норма 2–4"});
  add("#hsc1","tpa",{label:"Фибринолиза (tPA)",min:20,max:600,step:10,value:100,unit:"%"});
  add("#hsc2","f7",{label:"Фактор VII",min:0,max:150,step:2,value:100,unit:"%"});
  add("#hsc2","f8",{label:"Фактор VIII",min:0,max:150,step:2,value:100,unit:"%"});
  add("#hsc2","f9",{label:"Фактор IX",min:0,max:150,step:2,value:100,unit:"%"});
  add("#hsc2","f10",{label:"Фактори X и II",min:0,max:150,step:2,value:100,unit:"%"});
  add("#hsc2","at",{label:"Антитромбин III",min:20,max:150,step:5,value:100,unit:"%"});
  const chk=(lab,id)=>{const w=el("label",{class:"small",style:"display:flex;gap:8px;align-items:center;margin:8px 0"},`<input type="checkbox" id="${id}"> ${lab}`);$("#hsc2").appendChild(w);const c=$("#"+id);c.onchange=ch;return c};
  const cH=chk("Хепарин (антитромбинът × 10)","hsHep"),cL=chk("Фактор V Лайден","hsLei"),c12=chk("Без фактор XII","hs12");
  let hid={};// параметри извън плъзгачите, задавани от заболяването
  const par=()=>Object.assign({},HS_N,hid,{tf:S.tf.get(),plt:S.plt.get(),pf:S.pf.get(),vwf:S.vwf.get(),fbg:S.fbg.get(),tpa:S.tpa.get(),f7:S.f7.get(),f8:S.f8.get(),f9:S.f9.get(),f10:S.f10.get(),f2:S.f10.get(),at:S.at.get(),hep:cH.checked?1:0,leiden:cL.checked?1:0,f12:c12.checked?0:100});
  let s,hist,ref,labs=null,st={play:1,sp:15},plts=[],fib=[],drops=[],rbc=[];
  const refRun=()=>{const p=Object.assign({},HS_N,{tf:S.tf.get()}),r=hsInit(),o=[];for(let i=0;i<=900/0.1;i++){hsStep(r,p,0.1);if(i%20===0)o.push([r.t,r.T/8,r.Fn])}return o};
  const restart=()=>{s=hsInit();hist=[];ref=refRun();plts=[];fib=[];drops=[];labs=null};
  for(let i=0;i<26;i++)rbc.push({x:Math.random()*330,y:40+Math.random()*90,v:30+Math.random()*30,st:0});
  const setPre=k=>{const o=HS_PRE[k].o;sel.value=k;const v=Object.assign({},HS_N,o);hid={pc:v.pc,f5:v.f5,f11:v.f11};
    ["tf","plt","pf","vwf","fbg","tpa","f7","f8","f9","at"].forEach(x=>S[x].set(v[x]));S.f10.set(v.f10);cH.checked=!!v.hep;cL.checked=!!v.leiden;c12.checked=v.f12===0;
    $("#hsN").innerHTML=HS_INFO[k];linkTerms($("#hsN"));restart()};
  sel.onchange=()=>setPre(sel.value);$("#hsGo").onclick=restart;
  $("#hsPl").onclick=()=>{st.play^=1;$("#hsPl").textContent=st.play?"⏸︎ Пауза":"▶︎ Пусни"};$("#hsSp").onchange=e=>st.sp=+e.target.value;
  function sim(dt){const p=par();const D=dt*st.sp,n=Math.ceil(D/0.05);for(let i=0;i<n;i++)if(s.t<900)hsStep(s,p,D/n);
    if(!hist.length||s.t-hist[hist.length-1][0]>=2)hist.push([s.t,s.T/8,s.Fn,s.P,hsClot(s,p)])}
  function draw(dt){const c=rcv($("#hsC"));if(!c)return;const {g,W,H}=c,k=Math.min(W/700,H/360);g.save();g.translate((W-700*k)/2,(H-360*k)/2);g.scale(k,k);
    const p=par(),cl=hsClot(s,p),fb=Math.min(1,p.fbg/3);
    // съд: лумен, стена с ендотел, рана
    g.fillStyle="rgba(224,49,49,.10)";g.fillRect(0,30,330,130);g.fillStyle="#f1c7c7";g.fillRect(0,160,330,26);
    for(let x=0;x<330;x+=30){if(x>=120&&x<210)continue;g.fillStyle="#f8dada";g.strokeStyle="#d08a8a";g.lineWidth=1;g.beginPath();g.ellipse(x+15,164,14,5,0,0,7);g.fill();g.stroke()}
    g.fillStyle="#fff3bf";g.fillRect(120,160,90,26);g.strokeStyle="#e0a800";g.lineWidth=1.3;for(let i=0;i<7;i++){g.beginPath();g.moveTo(122+i*12,186);g.bezierCurveTo(128+i*12,176,118+i*12,170,128+i*12,161);g.stroke()}
    g.fillStyle="#e9ecef";g.fillRect(0,186,330,40);g.fillStyle=css("--muted");g.font=RFONT(10.5,600);g.textAlign="left";g.fillText("лумен",6,44);g.fillText("ендотел",6,176);g.fillText("тъкан",6,214);g.textAlign="center";g.fillText("колаген + TF",165,200);
    // вазоконстрикция в първите минути
    const vc=Math.max(0,1-s.t/120)*0.5;if(vc>0.02){g.strokeStyle=css("--accent5");g.lineWidth=2;rArrow(g,60,22,60,34+vc*14,css("--accent5"),2);rArrow(g,270,22,270,34+vc*14,css("--accent5"),2);g.fillStyle=css("--accent5");g.font=RFONT(10.5,700);g.fillText("вазоконстрикция",165,20)}
    // еритроцити в потока
    rbc.forEach(r=>{if(!r.st){r.x+=r.v*dt*(st.play?1:0);if(r.x>340){r.x=-10;r.y=40+Math.random()*90}if(fib.length>8&&r.x>130&&r.x<200&&r.y>110&&Math.random()<0.004*fb)r.st=1}
      g.fillStyle="#d6336c";g.beginPath();g.ellipse(r.x,r.y,7,4,0,0,7);g.fill();g.fillStyle="#a61e4d";g.beginPath();g.ellipse(r.x,r.y,3,1.6,0,0,7);g.fill()});
    // тромбоцити в тапата
    const nP=Math.round(70*s.P);while(plts.length<nP){const i=plts.length;plts.push({x:124+((i*37)%84),y:156-Math.floor(i/8)*6-Math.random()*4,a:0})}plts.length=Math.min(plts.length,nP);
    plts.forEach(q=>{q.a=Math.min(1,q.a+dt);g.fillStyle=`rgba(112,72,232,${0.5+0.4*q.a})`;g.beginPath();const r=4;for(let j=0;j<8;j++){const an=j/8*6.283,rr=j%2?r:r+2.2*Math.min(1,s.T/2+p.pf/200);g.lineTo(q.x+Math.cos(an)*rr,q.y+Math.sin(an)*rr)}g.closePath();g.fill()});
    // фибринови нишки
    const nF=Math.round(36*Math.min(1,s.Fn/Math.max(0.3,fb)));while(fib.length<nF){fib.push([118+Math.random()*94,108+Math.random()*52,118+Math.random()*94,108+Math.random()*52])}fib.length=Math.min(fib.length,nF);
    g.strokeStyle="rgba(224,168,0,.9)";g.lineWidth=1.4;fib.forEach(f=>{g.beginPath();g.moveTo(f[0],f[1]);g.lineTo(f[2],f[3]);g.stroke()});
    // кървене навън
    const bl=p.tf*Math.pow(1-cl,2);if(st.play&&Math.random()<bl*dt*25)drops.push({x:140+Math.random()*50,y:188,v:20});
    drops=drops.filter(d=>{d.y+=d.v*dt;d.v+=60*dt;g.fillStyle="#c92a2a";g.beginPath();g.arc(d.x,d.y,3.2,0,7);g.fill();return d.y<236});
    rTag(g,8,236,[cl>0.85?"Кървенето спря":cl>0.5?"Кървенето намалява":"Кърви",`здравина на съсирека ${fmt(cl*100,0)} %`],{c:cl>0.85?css("--accent3"):css("--accent"),fs:12});
    // каскада
    const lev={XIIa:s.IXa*0.6*(p.f12/100),XIa:Math.min(1,s.T*0.4)*(p.f11/100),IXa:Math.min(1,s.IXa*12),VIIIa:Math.min(1,s.T/0.6)*p.f8/100,VIIa:Math.min(1,p.tf*Math.exp(-s.t/50))*p.f7/100,Xa:Math.min(1,s.Xa*3),Va:Math.min(1,s.T/0.4)*(p.f5/100),"тромбин":Math.min(1,s.T/4),"фибрин":Math.min(1,s.Fn),XIIIa:s.X13};
    const pos={};HS_NODES.forEach(([a,b,x,y])=>pos[b]=[x,y]);
    const lnk=(a,b,col,w,dash)=>{const [x1,y1]=pos[a],[x2,y2]=pos[b];g.setLineDash(dash||[]);rArrow(g,x1,y1+12,x2,y2-14,col,w);g.setLineDash([])};
    lnk("XIIa","XIa",css("--muted"),1.4);lnk("XIa","IXa",css("--muted"),1.4);lnk("IXa","Xa",css("--muted"),1.6);lnk("VIIa","Xa",css("--muted"),1.6);lnk("VIIa","IXa",css("--muted"),1.2,[3,3]);lnk("Xa","тромбин",css("--muted"),1.8);lnk("тромбин","фибрин",css("--muted"),1.8);
    // обратни връзки на тромбина
    const tA=Math.min(1,s.T/2);g.globalAlpha=0.3+0.7*tA;g.strokeStyle=css("--accent");g.lineWidth=1.6;g.setLineDash([4,3]);
    [[pos["тромбин"],pos.Va],[pos["тромбин"],pos.VIIIa],[pos["тромбин"],pos.XIa]].forEach(([a,b])=>{g.beginPath();g.moveTo(a[0]+30,a[1]);g.quadraticCurveTo(b[0]+70,(a[1]+b[1])/2,b[0]+30,b[1]+6);g.stroke()});g.setLineDash([]);g.globalAlpha=1;
    HS_NODES.forEach(([a,b,x,y,key])=>{const v=Math.max(0,Math.min(1,lev[b]||0)),low=key&&key!=="fbg"&&p[key]!=null&&p[key]<30,w=b.length>5?72:58;
      g.fillStyle=low?"rgba(224,49,49,.12)":css("--chip");g.strokeStyle=low?"#e03131":css("--line");g.lineWidth=1.2;g.beginPath();g.roundRect?g.roundRect(x-w/2,y-12,w,24,7):g.rect(x-w/2,y-12,w,24);g.fill();g.stroke();
      g.fillStyle=`rgba(240,140,0,${v*0.85})`;g.beginPath();g.roundRect?g.roundRect(x-w/2,y-12,w*v,24,7):g.rect(x-w/2,y-12,w*v,24);g.fill();
      g.fillStyle=css("--ink");g.font=RFONT(11,700);g.textAlign="center";g.fillText(b,x,y+4)});
    g.fillStyle=css("--muted");g.font=RFONT(10,600);g.textAlign="center";g.fillText("вътрешен път",395,12);g.fillText("външен път",610,112);g.fillText("общ път",540,226);
    // инхибитори
    const inh=(x,y,l,a,col)=>{g.globalAlpha=0.35+0.65*Math.min(1,a);rTag(g,x,y,[l],{fs:10.5,c:col,st:col,op:0.95});g.globalAlpha=1};
    inh(560,232,"антитромбин III"+(p.hep?" + хепарин":""),Math.min(1,p.at/100*(1+p.hep*2)),"#1c7ed6");inh(560,256,"протеин C → APC",Math.min(1,s.A*3),"#2b8a5a");inh(352,330,"плазмин → D-димер",Math.min(1,s.Pm*3),"#e03131");
    g.restore()}
  function stats(){const p=par();if(!labs)labs=hsLabs(p);const L=labs,fl=v=>v>150?"> 150":fmt(v,0);
    $("#hsS").innerHTML=statsHTML([["PT (норма 11–13 s)",fl(L.pt)+" s"],["INR",L.pt>150?"> 10":fmt(L.inr,2)],["aPTT (норма 25–35 s)",fl(L.aptt)+" s"],["Тромбиново време",fl(L.tt)+" s"],["Време на кървене",(L.bt>=30?"> 30":fmt(L.bt,0))+" min"],["Тромбоцити",fmt(p.plt,0)+" × 10⁹/L"],["Време на модела",fmt(s.t/60,1)+" min"],["Загуба на кръв",fmt(s.loss,0)+" отн. ед."]]);
    const tm=hist.map(h=>h[0]/60);plot($("#hsG"),{xmin:0,xmax:15,ymin:0,ymax:Math.max(1.2,Math.ceil(Math.max(1,...hist.map(h=>h[1]))*5)/5),xlabel:"време след нараняването, min",ylabel:"отн. ед.",
      series:[{x:ref.map(r=>r[0]/60),y:ref.map(r=>r[1]),color:css("--accent2"),width:1.4,dash:[5,4]},{x:tm,y:hist.map(h=>h[3]),color:css("--accent5"),width:1.8},{x:tm,y:hist.map(h=>h[2]),color:css("--accent4"),width:2.2},{x:tm,y:hist.map(h=>h[4]),color:css("--accent3"),width:2},{x:tm,y:hist.map(h=>h[1]),color:css("--accent"),width:2.4}]})}
  restart();setPre("normal");
  experiments($("#ex"),EXP_HS,"hemost",e=>{setPre(e.pre);$("#hsC").scrollIntoView({behavior:"smooth",block:"center"})});
  let fr=0;rLoop($("#hsC"),dt=>{if(st.play)sim(dt);{const pp=par();window.__HS={s,p:Object.assign({sp:st.sp},pp),cl:hsClot(s,pp)}}draw(dt);if(++fr%6===0)stats()});
  window.onresize=()=>stats();
}
/* ===== III.2 Хемоглобин и кислородна дисоциационна крива ===== */
const HB_PRE={
 normal:{n:"Норма (артериална кръв)",pH:7.4,pco2:40,temp:37,dpg:100,hb:150,co:0,met:0,type:"A",po2:40},
 ex:{n:"Работещ мускул (ацидоза, топлина, CO₂)",pH:7.2,pco2:60,temp:39,dpg:100,hb:150,co:0,met:0,type:"A",po2:20},
 alt:{n:"Аклиматизация на височина",pH:7.44,pco2:30,temp:37,dpg:150,hb:175,co:0,met:0,type:"A",po2:40},
 anem:{n:"Анемия (Hb 70 g/L)",pH:7.4,pco2:40,temp:37,dpg:130,hb:70,co:0,met:0,type:"A",po2:40},
 co:{n:"Отравяне с CO (COHb 40 %)",pH:7.4,pco2:40,temp:37,dpg:100,hb:150,co:40,met:0,type:"A",po2:40},
 met:{n:"Метхемоглобинемия (30 %)",pH:7.4,pco2:40,temp:37,dpg:100,hb:150,co:0,met:30,type:"A",po2:40},
 fet:{n:"Фетален хемоглобин (HbF)",pH:7.4,pco2:40,temp:37,dpg:100,hb:170,co:0,met:0,type:"F",po2:30},
 mb:{n:"Миоглобин (мускул)",pH:7.4,pco2:40,temp:37,dpg:100,hb:150,co:0,met:0,type:"M",po2:5},
 stored:{n:"Съхранена кръв (без 2,3-BPG)",pH:7.4,pco2:40,temp:37,dpg:10,hb:150,co:0,met:0,type:"A",po2:40}};
const HB_INFO={
 normal:"Хемоглобинът е тетрамер (α₂β₂) с 4 хема. Свързването е <b>кооперативно</b>: първата молекула O₂ се свързва трудно, а всяка следваща — по-лесно, защото тетрамерът преминава от напрегнато (T) в отпуснато (R) състояние. Затова кривата е сигмоидна. P<sub>50</sub> ≈ 26,8 mmHg.",
 ex:"В работещия мускул киселинността, CO₂ и температурата са по-високи. Кривата се измества <b>надясно</b> (ефект на Бор) и при същото P<sub>O₂</sub> хемоглобинът отдава повече кислород.",
 alt:"При височина хипервентилацията понижава P<sub>CO₂</sub> (отместване наляво), но 2,3-BPG в еритроцитите се увеличава и измества кривата надясно. Повече Hb (по-висок хематокрит) увеличава кислородния капацитет.",
 anem:"При анемия насищането е нормално (S<sub>aO₂</sub> ≈ 97 %) и P<sub>aO₂</sub> е нормално, но <b>кислородното съдържание</b> е намалено, защото Hb е малко. Компенсацията е по-висок сърдечен дебит и повече 2,3-BPG.",
 co:"CO се свързва с хема около 250 пъти по-силно от O₂. Той намалява капацитета, а останалите хеми задържат кислорода по-силно (отместване наляво). P<sub>aO₂</sub> е нормално и пулсоксиметърът показва фалшиво високи стойности. Лечение — 100 % O₂ или хипербарна оксигенация.",
 met:"Желязото в хема е окислено до Fe³⁺ и не свързва O₂. Останалите хеми свързват по-силно (наляво). Кръвта е „шоколадово“ кафява, има цианоза при нормално P<sub>aO₂</sub>. Причини — нитрити, дапсон, локални анестетици; антидот — метиленово синьо.",
 fet:"Феталният хемоглобин (α₂γ₂) свързва слабо 2,3-BPG, затова кривата му е <b>вляво</b> (P<sub>50</sub> ≈ 19 mmHg). Така в плацентата кислородът преминава от майката към плода.",
 mb:"Миоглобинът има само една верига и един хем — свързването не е кооперативно и кривата е хипербола. P<sub>50</sub> ≈ 2,8 mmHg: отдава кислород едва при много ниско P<sub>O₂</sub>, затова е <b>резерв</b> в мускула, а не транспортер.",
 stored:"В съхранената кръв 2,3-BPG намалява за дни. Кривата се измества наляво и прелятата кръв отначало отдава по-трудно кислород, докато 2,3-BPG се възстанови (часове до дни)."};
const EXP_HB=[
 {q:"Мускулът работи: pH 7,2, температура 39 °C, P<sub>CO₂</sub> 60 mmHg. Накъде се измества кривата?",opts:["Наляво","Надясно","Не се измества"],a:1,set:{pre:"ex"},expl:"Ефектът на Бор и топлината намаляват афинитета: P<sub>50</sub> расте и при P<sub>O₂</sub> 20 mmHg се отдава много повече O₂."},
 {q:"При анемия с Hb 70 g/L какво е S<sub>aO₂</sub>?",opts:["Около 50 %","Нормално (≈ 97 %)","Около 75 %"],a:1,set:{pre:"anem"},expl:"Насищането зависи от P<sub>O₂</sub>, а не от количеството Hb. Спада съдържанието — почти наполовина."},
 {q:"Отравяне с CO 40 % и анемия до 60 % от нормалния Hb — кое е по-опасно?",opts:["Анемията","Отравянето с CO","Еднакви са"],a:1,set:{pre:"co"},expl:"Капацитетът е сходен, но при CO кривата е вляво — останалият O₂ се отдава трудно в тъканите. Затова CO е по-опасен."},
 {q:"Защо кривата на миоглобина е хипербола, а на хемоглобина — сигмоида?",opts:["Миоглобинът няма хем","Миоглобинът има една субединица и няма кооперативност","Миоглобинът не свързва O₂"],a:1,set:{pre:"mb"},expl:"Без четири взаимодействащи субединици няма T↔R преход и коефициентът на Хил е 1."},
 {q:"Какво прави HbF спрямо HbA?",opts:["Има по-висок P<sub>50</sub>","Има по-нисък P<sub>50</sub> — по-висок афинитет","Не свързва O₂"],a:1,set:{pre:"fet"},expl:"γ-веригите свързват слабо 2,3-BPG. Затова в плацентата O₂ преминава към плода."},
 {q:"Как се променя кривата в съхранена кръв?",opts:["Измества се надясно","Измества се наляво","Става хипербола"],a:1,set:{pre:"stored"},expl:"2,3-BPG намалява при съхранение. Афинитетът се повишава и кислородът се отдава по-трудно."}];
function hbCalc(q){const ty=q.type;
  let p50=ty==="M"?2.8:ty==="F"?19.5:26.8,n=ty==="M"?1:2.7;
  if(ty!=="M"){p50*=Math.pow(10,0.48*(7.4-q.pH))*Math.pow(10,0.024*(q.temp-37))*Math.pow(q.pco2/40,0.06);if(ty==="A")p50*=Math.pow(Math.max(0.05,q.dpg/100),0.32);else p50*=Math.pow(Math.max(0.05,q.dpg/100),0.08);
    const lost=(q.co+q.met)/100;p50*=1-0.6*lost;n=2.7-1.3*lost}
  const S=P=>{const a=Math.pow(Math.max(P,0),n);return a/(a+Math.pow(p50,n))};
  const cap=1.34*q.hb/10*(ty==="M"?1:1-(q.co+q.met)/100);
  const C=P=>cap*S(P)+0.003*P;
  return {p50,n,S,C,cap}}
function viewHbCurve(main){
  main.innerHTML=`<h2>Хемоглобин и кислородна дисоциационна крива</h2><p class="lead">Свързването на кислорода с хемоглобина отблизо: четирите субединици, кооперативността, ефектът на Бор и 2,3-BPG, анемия, отравяне с CO, фетален хемоглобин и миоглобин. Премести точката по кривата и виж какво става с молекулата.</p>
  <div class="card" style="padding:10px"><div class="btns"><select id="hbPre" style="width:auto;max-width:100%"></select><div class="toggle" id="hbTy"><button data-t="A" class="on">HbA</button><button data-t="F">HbF</button><button data-t="M">Миоглобин</button></div><button class="b" id="hbRun">Еритроцит: бял дроб ⇄ тъкан</button></div>
   <canvas id="hbC" style="width:100%;height:300px;display:block;margin-top:6px"></canvas>
   <div class="stats" id="hbS" style="margin-top:8px"></div>
   <div class="note" id="hbN" style="min-height:4.6em"></div>
   <div class="grid2" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px"><canvas class="plot" id="hbG" style="height:240px"></canvas><canvas class="plot" id="hbK" style="height:240px"></canvas></div>
   <div class="legend"><span><i style="background:var(--accent)"></i>текущо състояние</span><span><i class="dash" style="border-color:var(--muted)"></i>нормален HbA</span><span><i style="background:var(--accent3)"></i>артериална точка (P<sub>O₂</sub> 95)</span><span><i style="background:var(--accent2)"></i>тъканна точка</span><span><i class="box" style="background:rgba(36,86,164,.18)"></i>отдаден O₂</span></div>
   <div class="grid2" style="grid-template-columns:1fr 1fr"><div id="hbc1"></div><div id="hbc2"></div></div></div>
  <h3>Експерименти</h3><div id="ex"></div>`;
  const sel=$("#hbPre");sel.innerHTML=Object.entries(HB_PRE).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("");
  const S={};let ty="A";const n=()=>{};
  S.po2=slider($("#hbc1"),{label:"P<sub>O₂</sub> в тъканта (точката)",min:1,max:100,step:1,value:40,unit:"mmHg",hint:"покой ≈ 40, работещ мускул ≈ 20"},n);
  S.pH=slider($("#hbc1"),{label:"pH",min:6.9,max:7.7,step:0.01,value:7.4,d:2},n);
  S.pco2=slider($("#hbc1"),{label:"P<sub>CO₂</sub>",min:20,max:80,step:1,value:40,unit:"mmHg"},n);
  S.temp=slider($("#hbc1"),{label:"Температура",min:32,max:42,step:0.5,value:37,d:1,unit:"°C"},n);
  S.dpg=slider($("#hbc2"),{label:"2,3-BPG",min:0,max:200,step:5,value:100,unit:"%"},n);
  S.hb=slider($("#hbc2"),{label:"Хемоглобин",min:40,max:220,step:5,value:150,unit:"g/L",hint:"мъже 135–175, жени 120–155"},n);
  S.co=slider($("#hbc2"),{label:"Карбоксихемоглобин (CO)",min:0,max:70,step:1,value:0,unit:"%"},n);
  S.met=slider($("#hbc2"),{label:"Метхемоглобин",min:0,max:70,step:1,value:0,unit:"%"},n);
  const tyBtns=$("#hbTy").querySelectorAll("button");const setTy=t=>{ty=t;tyBtns.forEach(b=>b.classList.toggle("on",b.dataset.t===t))};tyBtns.forEach(b=>b.onclick=()=>setTy(b.dataset.t));
  const q=()=>({pH:S.pH.get(),pco2:S.pco2.get(),temp:S.temp.get(),dpg:S.dpg.get(),hb:S.hb.get(),co:S.co.get(),met:S.met.get(),type:ty});
  const setPre=k=>{const p=HB_PRE[k];sel.value=k;["po2","pH","pco2","temp","dpg","hb","co","met"].forEach(x=>S[x].set(p[x]));setTy(p.type);$("#hbN").innerHTML=HB_INFO[k];linkTerms($("#hbN"));run.on=0};
  sel.onchange=()=>setPre(sel.value);
  const run={on:0,u:0};$("#hbRun").onclick=()=>{run.on^=1;run.u=0};
  // молекула: 4 субединици с хем; брой свързани O₂ следва S
  const sub=[{c:"#e8590c"},{c:"#e8590c"},{c:"#4263eb"},{c:"#4263eb"}];sub.forEach(s=>{s.o=0;s.k="free"});let Rst=0,o2=[];
  for(let i=0;i<40;i++)o2.push({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2});
  let curP=40;
  function drawMol(dt){const c=rcv($("#hbC"));
    const Q=q(),M=hbCalc(Q);
    if(run.on){run.u+=dt/8;const ph=(run.u%1);curP=ph<0.5?40+(95-40)*Math.min(1,ph*4):95-(95-S.po2.get())*Math.min(1,(ph-0.5)*4)}else curP=S.po2.get();
    const Sx=M.S(curP),blocked=ty==="M"?0:Math.round(((Q.co+Q.met)/100)*4*0.999+0.0);window.__HB={Sx,curP,blocked,ty};
    if(!c)return;const {g,W,H}=c,k=Math.min(W/700,H/300);g.save();g.translate((W-700*k)/2,(H-300*k)/2);g.scale(k,k);
    // фон: среда с O₂ (гъстота ∝ P)
    g.fillStyle=run.on?(curP>70?"rgba(224,49,49,.10)":"rgba(36,86,164,.10)"):"rgba(134,142,150,.07)";g.beginPath();g.roundRect?g.roundRect(10,10,420,280,14):g.rect(10,10,420,280);g.fill();
    const nO=Math.round(curP/100*40);o2.forEach((m,i)=>{m.x+=m.vx*dt;m.y+=m.vy*dt;if(m.x<0||m.x>1)m.vx*=-1;if(m.y<0||m.y>1)m.vy*=-1;if(i<nO){const x=20+m.x*400,y=20+m.y*260;g.fillStyle="#e03131";g.beginPath();g.arc(x-3,y,3,0,7);g.arc(x+3,y,3,0,7);g.fill()}});
    // целево брой свързани
    const nSub=ty==="M"?1:4,avail=nSub-(ty==="M"?0:blocked),tgt=Math.round(Sx*avail);
    let bound=sub.slice(0,nSub).filter(s=>s.k==="o2").length;
    sub.forEach((s,i)=>{if(i>=nSub)return;if(ty!=="M"&&i<blocked){s.k=Q.co>=Q.met?"co":"met";return}if(s.k!=="o2"&&s.k!=="free")s.k="free"});
    bound=sub.slice(0,nSub).filter(s=>s.k==="o2").length;
    if(Math.random()<dt*3){if(bound<tgt){const f=sub.slice(0,nSub).find(s=>s.k==="free");if(f)f.k="o2"}else if(bound>tgt){const f=[...sub.slice(0,nSub)].reverse().find(s=>s.k==="o2");if(f)f.k="free"}}
    bound=sub.slice(0,nSub).filter(s=>s.k==="o2").length;
    const rT=ty==="M"?1:(bound+(ty!=="M"?blocked:0))>=2?1:0;Rst+=(rT-Rst)*Math.min(1,dt*3);
    const cx=220,cy=150,gap=8+Rst*10,rot=Rst*0.26;
    const pos=ty==="M"?[[0,0]]:[[-1,-1],[1,-1],[-1,1],[1,1]];
    pos.forEach(([a,b],i)=>{const s=sub[i],x=cx+a*(42+gap),y=cy+b*(42+gap);g.save();g.translate(x,y);g.rotate(a*b*rot);
      g.fillStyle=ty==="M"?"#c2255c":(ty==="F"&&i>=2?"#2b8a3e":s.c);g.globalAlpha=0.85;g.beginPath();g.roundRect?g.roundRect(-38,-38,76,76,Rst>0.5?30:10):g.rect(-38,-38,76,76);g.fill();g.globalAlpha=1;
      // хем
      g.fillStyle="#fff";g.globalAlpha=0.9;g.beginPath();g.moveTo(-14,0);g.lineTo(0,-14);g.lineTo(14,0);g.lineTo(0,14);g.closePath();g.fill();g.globalAlpha=1;
      g.fillStyle=s.k==="met"?"#5c3d2e":"#7a4a00";g.beginPath();g.arc(0,0,5,0,7);g.fill();
      if(s.k==="o2"){g.fillStyle="#e03131";g.beginPath();g.arc(-4,-12,5,0,7);g.arc(5,-12,5,0,7);g.fill()}
      if(s.k==="co"){g.fillStyle="#495057";g.beginPath();g.arc(-4,-12,5,0,7);g.fill();g.fillStyle="#e03131";g.beginPath();g.arc(5,-12,5,0,7);g.fill();g.fillStyle="#fff";g.font=RFONT(8,700);g.textAlign="center";g.fillText("C",-4,-9)}
      g.fillStyle="#fff";g.font=RFONT(11,700);g.textAlign="center";g.fillText(ty==="M"?"Mb":(i<2?"α":(ty==="F"?"γ":"β"))+(ty==="M"?"":(i%2+1)),0,28);
      g.restore()});
    if(ty==="A"&&Q.dpg>5&&Rst<0.5){g.fillStyle="#f08c00";g.beginPath();g.moveTo(cx-10,cy);g.lineTo(cx,cy-9);g.lineTo(cx+10,cy);g.lineTo(cx,cy+9);g.closePath();g.fill();g.fillStyle=css("--ink");g.font=RFONT(10,700);g.textAlign="center";g.fillText("2,3-BPG",cx,cy+24)}
    rTag(g,20,18,[`P_O₂ = ${fmt(curP,0)} mmHg`,run.on?(curP>70?"в белодробния капиляр":"в тъканния капиляр"):"среда около молекулата"],{fs:12});
    // панел вдясно
    const X=460;g.fillStyle=css("--ink");g.font=RFONT(13,700);g.textAlign="left";g.fillText(ty==="M"?"Миоглобин":Rst>0.5?"R състояние (отпуснато)":"T състояние (напрегнато)",X,40);
    g.font=RFONT(11.5);g.fillStyle=css("--muted");
    const lines=ty==="M"?["една верига, един хем","няма кооперативност","n (Хил) = 1, P₅₀ ≈ 2,8 mmHg"]:Rst>0.5?["субединиците са се завъртели","висок афинитет към O₂","лесно свързва още O₂"]:["солеви мостове между веригите","нисък афинитет към O₂","2,3-BPG стабилизира T формата"];
    lines.forEach((l,i)=>g.fillText(l,X,62+i*17));
    g.fillStyle=css("--ink");g.font=RFONT(12,700);g.fillText(`Свързани O₂: ${bound} от ${nSub}`,X,130);
    for(let i=0;i<nSub;i++){const s=sub[i];g.fillStyle=s.k==="o2"?"#e03131":s.k==="co"?"#495057":s.k==="met"?"#5c3d2e":css("--chip");g.strokeStyle=css("--line");g.beginPath();g.arc(X+12+i*28,150,10,0,7);g.fill();g.stroke()}
    g.fillStyle=css("--muted");g.font=RFONT(11);g.fillText("■ O₂   ■ CO   ■ Fe³⁺ (метHb)   □ свободен",X,180);
    g.fillStyle=css("--ink");g.font=RFONT(12,700);g.fillText(`Насищане по кривата: ${fmt(Sx*100,0)} %`,X,210);
    g.fillStyle=css("--chip");g.fillRect(X,220,220,14);g.fillStyle="#e03131";g.fillRect(X,220,220*Sx*(ty==="M"?1:1-(Q.co+Q.met)/100),14);g.fillStyle="#495057";g.fillRect(X+220*(1-(ty==="M"?0:(Q.co+Q.met)/100)),220,220*(ty==="M"?0:(Q.co+Q.met)/100),14);
    g.fillStyle=css("--muted");g.font=RFONT(10.5);g.fillText("червено — O₂ от целия Hb; сиво — блокиран",X,250);
    g.restore();return {M,Q}}
  function plots(){const Q=q(),M=hbCalc(Q),N=hbCalc({pH:7.4,pco2:40,temp:37,dpg:100,hb:150,co:0,met:0,type:"A"});
    const xs=[],y=[],yn=[],c=[],cn=[];for(let P=0;P<=120;P+=1){xs.push(P);y.push(M.S(P)*100*(ty==="M"?1:1-(Q.co+Q.met)/100));yn.push(N.S(P)*100);c.push(M.C(P)*10);cn.push(N.C(P)*10)}
    const Pt=S.po2.get(),Pa=95;
    plot($("#hbG"),{xmin:0,xmax:120,ymin:0,ymax:100,xlabel:"PO₂, mmHg",ylabel:"насищане на целия Hb, %",series:[{x:xs,y:yn,color:css("--muted"),width:1.4,dash:[5,4]},{x:xs,y,color:css("--accent"),width:2.6}],hlines:[{y:50,color:css("--grid"),dash:[2,3]}],
      marks:[{x:Pa,y:M.S(Pa)*100*(ty==="M"?1:1-(Q.co+Q.met)/100),color:css("--accent3")},{x:Pt,y:M.S(Pt)*100*(ty==="M"?1:1-(Q.co+Q.met)/100),color:css("--accent2"),label:"тъкан"},{x:M.p50,y:50*(ty==="M"?1:1-(Q.co+Q.met)/100),color:css("--accent4"),label:"P₅₀ "+fmt(M.p50,1)}],shade:[{x0:Pt,x1:Pa,color:"rgba(36,86,164,.10)"}]});
    plot($("#hbK"),{xmin:0,xmax:120,ymin:0,ymax:Math.max(220,Math.ceil(Math.max(...c)/20)*20+20),xlabel:"PO₂, mmHg",ylabel:"O₂ съдържание, mL/L",series:[{x:xs,y:cn,color:css("--muted"),width:1.4,dash:[5,4]},{x:xs,y:c,color:css("--accent"),width:2.6}],marks:[{x:Pa,y:M.C(Pa)*10,color:css("--accent3"),label:"арт."},{x:Pt,y:M.C(Pt)*10,color:css("--accent2"),label:"вен."}]});
    const Ca=M.C(Pa),Cv=M.C(Pt),ext=(Ca-Cv)/Ca;
    $("#hbS").innerHTML=statsHTML([["P<sub>50</sub>",fmt(M.p50,1)+" mmHg"],["Коеф. на Хил n",fmt(M.n,1)],["Капацитет",fmt(M.cap*10,0)+" mL O₂/L"],["C<sub>aO₂</sub> (при 95 mmHg)",fmt(Ca*10,0)+" mL/L"],["C<sub>vO₂</sub> (при "+fmt(Pt,0)+" mmHg)",fmt(Cv*10,0)+" mL/L"],["Отдадени в тъканта",fmt((Ca-Cv)*10,0)+" mL/L"],["Коеф. на екстракция",fmt(ext*100,0)+" %"],["Доставка при СД 5 L/min",fmt(Ca*50,0)+" mL/min"]])}
  setPre("normal");
  experiments($("#ex"),EXP_HB,"hbcurve",e=>{setPre(e.pre);$("#hbC").scrollIntoView({behavior:"smooth",block:"center"})});
  let fr=0;rLoop($("#hbC"),dt=>{drawMol(dt);if(++fr%5===0)plots()});
  window.onresize=()=>plots();
}
/* ===== III.3 Кръвни групи и хематологични показатели ===== */
const BG_ALL=["O-","O+","A-","A+","B-","B+","AB-","AB+"];
const bgAnt=g=>({A:/A/.test(g),B:/B/.test(g),D:/\+/.test(g)});
const bgAbs=g=>({A:!/A/.test(g),B:!/B/.test(g)});// естествени анти-A/анти-B (IgM)
function bgCompat(don,rec,prod){const d=bgAnt(don),r=bgAnt(rec);
  if(prod==="rbc"){const abo=(!d.A||r.A)&&(!d.B||r.B),rh=!d.D||r.D;return {ok:abo&&rh,abo,rh}}
  const da=bgAbs(don);const abo=(!da.A||!r.A)&&(!da.B||!r.B);return {ok:abo,abo,rh:true}}
const HI_PRE={
 m:{n:"Норма (мъж)",rbc:5.0,hb:150,hct:45,ret:1.0,wbc:7,plt:250},
 f:{n:"Норма (жена)",rbc:4.5,hb:135,hct:40,ret:1.0,wbc:7,plt:260},
 fe:{n:"Желязодефицитна анемия",rbc:4.0,hb:85,hct:30,ret:0.8,wbc:6.5,plt:420},
 b12:{n:"Дефицит на B₁₂ / фолат",rbc:2.4,hb:95,hct:29,ret:0.5,wbc:3.8,plt:120},
 thal:{n:"β-таласемия минор",rbc:6.1,hb:115,hct:37,ret:1.8,wbc:7,plt:250},
 hem:{n:"Хемолитична анемия",rbc:3.0,hb:95,hct:28,ret:8,wbc:9,plt:260},
 bleed:{n:"Остра кръвозагуба (след 2 дни)",rbc:3.6,hb:110,hct:33,ret:3,wbc:11,plt:380},
 pv:{n:"Полицитемия вера",rbc:7.2,hb:205,hct:62,ret:1.2,wbc:14,plt:650},
 dehy:{n:"Дехидратация (хемоконцентрация)",rbc:5.6,hb:170,hct:51,ret:1,wbc:8,plt:300}};
const EXP_BG=[
 {q:"Анти-A аглутинира, анти-B не, анти-D аглутинира. Каква е групата?",opts:["B Rh+","A Rh+","AB Rh−"],a:1,set:{grp:"A+"},expl:"Аглутинация с анти-A → антиген A по еритроцитите; с анти-D → Rh положителен. В серума има анти-B, затова B клетките аглутинират в обратното определяне."},
 {q:"Кой е универсален донор на еритроцитна маса?",opts:["AB Rh+","O Rh−","A Rh−"],a:1,set:{don:"O-",rec:"AB+",prod:"rbc"},expl:"Еритроцитите на O Rh− нямат антигени A, B и D, затова не реагират с антителата на реципиента."},
 {q:"Кой е универсален донор на плазма?",opts:["O","AB","A"],a:1,set:{don:"AB+",rec:"O-",prod:"pl"},expl:"Плазмата на AB няма анти-A и анти-B. При плазма важат антителата на донора — обратно на еритроцитите."},
 {q:"Майката е Rh− (dd), бащата е Dd. Каква е вероятността детето да е Rh+?",opts:["0 %","50 %","100 %"],a:1,set:{mo:"OO dd",fa:"AO Dd"},expl:"Детето получава d от майката и D или d от бащата с еднаква вероятност. При Rh+ дете има риск от хемолитична болест на новороденото при следваща бременност, ако майката се сенсибилизира — затова се прилага анти-D имуноглобулин."},
 {q:"Родители с групи A (AO) и B (BO). Може ли детето да е група O?",opts:["Не","Да — с вероятност 25 %","Само при Rh−"],a:1,set:{mo:"AO DD",fa:"BO DD"},expl:"Всеки родител може да предаде O. Вероятността за OO е ½ × ½ = 25 %. Възможни са и четирите групи."},
 {q:"Hb 85 g/L, MCV 75 fL, MCHC 283 g/L. Какъв тип е анемията?",opts:["Макроцитна","Микроцитна хипохромна","Нормоцитна нормохромна"],a:1,set:{hi:"fe"},expl:"MCV < 80 fL и MCHC < 320 g/L — типично за железен дефицит. При B₁₂/фолатен дефицит MCV е > 100 fL."}];
function viewBloodGroups(main){
  main.innerHTML=`<h2>Кръвни групи и хематологични показатели</h2><p class="lead">Определи кръвна група с тест карта, провери съвместимостта при кръвопреливане, изчисли наследяването в семейството и разчети пълната кръвна картина. Аглутинацията се случва пред очите ти.</p>
  <div class="card" style="padding:10px"><h3 style="margin-top:0">1. Определяне на кръвната група</h3>
   <div class="btns"><select id="bgG" style="width:auto"></select><button class="b" id="bgQ">Непозната проба (познай)</button><span id="bgAns" class="btns" style="display:none"></span></div>
   <canvas id="bgC" style="width:100%;height:250px;display:block;margin-top:6px"></canvas>
   <div class="note" id="bgN" style="min-height:3.4em"></div></div>
  <div class="card" style="padding:10px"><h3 style="margin-top:0">2. Кръвопреливане</h3>
   <div class="btns"><label class="small">Донор <select id="bgD" style="width:auto"></select></label><label class="small">Реципиент <select id="bgR" style="width:auto"></select></label><div class="toggle" id="bgP"><button data-p="rbc" class="on">Еритроцитна маса</button><button data-p="pl">Плазма</button></div></div>
   <canvas id="bgT" style="width:100%;height:150px;display:block;margin-top:6px"></canvas>
   <div class="note" id="bgTN"></div>
   <div id="bgM" style="overflow-x:auto"></div></div>
  <div class="card" style="padding:10px"><h3 style="margin-top:0">3. Наследяване</h3>
   <div class="btns"><label class="small">Майка <select id="bgMo" style="width:auto"></select></label><label class="small">Баща <select id="bgFa" style="width:auto"></select></label></div>
   <div id="bgI"></div><div class="note" id="bgIN"></div></div>
  <div class="card" style="padding:10px"><h3 style="margin-top:0">4. Пълна кръвна картина</h3>
   <div class="btns"><select id="hiPre" style="width:auto;max-width:100%"></select></div>
   <div class="grid2" style="grid-template-columns:minmax(0,1fr) minmax(0,1.6fr);gap:12px;align-items:start"><canvas id="hiC" style="width:100%;height:280px;display:block"></canvas><div><div class="stats" id="hiS"></div><div class="note" id="hiN"></div></div></div>
   <div class="grid2" style="grid-template-columns:1fr 1fr"><div id="hic1"></div><div id="hic2"></div></div></div>
  <h3>Експерименти</h3><div id="ex"></div>`;
  const opt=a=>a.map(x=>`<option value="${x}">${x.replace("-"," Rh−").replace("+"," Rh+")}</option>`).join("");
  $("#bgG").innerHTML=opt(BG_ALL);$("#bgD").innerHTML=opt(BG_ALL);$("#bgR").innerHTML=opt(BG_ALL);
  const GT=["AA DD","AO DD","AA Dd","AO Dd","AA dd","AO dd","BB DD","BO DD","BB Dd","BO Dd","BB dd","BO dd","AB DD","AB Dd","AB dd","OO DD","OO Dd","OO dd"];
  $("#bgMo").innerHTML=GT.map(x=>`<option>${x}</option>`).join("");$("#bgFa").innerHTML=GT.map(x=>`<option>${x}</option>`).join("");$("#bgMo").value="AO dd";$("#bgFa").value="BO Dd";
  // --- 1. тест карта ---
  let grp="A+",hidden=false,wells=[],t0=0;
  const WL=[["анти-A","A"],["анти-B","B"],["анти-D","D"],["контрола",""],["A₁ клетки","rA"],["B клетки","rB"]];
  const mkWells=()=>{t0=performance.now();const an=bgAnt(grp),ab=bgAbs(grp);wells=WL.map(([l,k])=>{const pos=k==="A"?an.A:k==="B"?an.B:k==="D"?an.D:k==="rA"?ab.A:k==="rB"?ab.B:false;
    const cells=[];for(let i=0;i<46;i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*30;cells.push({x:Math.cos(a)*r,y:Math.sin(a)*r,cx:0,cy:0})}
    if(pos){const nc=4+Math.floor(Math.random()*2);const C=[];for(let j=0;j<nc;j++){const a=Math.random()*6.283,r=6+Math.random()*16;C.push([Math.cos(a)*r,Math.sin(a)*r])}cells.forEach((c,i)=>{const q=C[i%nc];c.cx=q[0]+(Math.random()-.5)*7;c.cy=q[1]+(Math.random()-.5)*7})}
    else cells.forEach(c=>{c.cx=c.x;c.cy=c.y});return {l,k,pos,cells}})};
  const showGrp=()=>{const an=bgAnt(grp),ab=bgAbs(grp),G=grp.replace(/[+-]/,"");$("#bgN").innerHTML=hidden?"Разгледай кладенчетата и избери групата отгоре.":`<b>${G} Rh${an.D?"+":"−"}:</b> антигени по еритроцитите — ${[an.A&&"A",an.B&&"B",an.D&&"D"].filter(Boolean).join(", ")||"няма A, B, D"}; антитела в плазмата — ${[ab.A&&"анти-A",ab.B&&"анти-B"].filter(Boolean).join(" и ")||"няма анти-A и анти-B"}. Правото определяне (с тест серуми) и обратното (със серума на пациента и стандартни клетки) трябва да съвпаднат.`};
  const setGrp=g=>{grp=g;$("#bgG").value=g;hidden=false;$("#bgAns").style.display="none";mkWells();showGrp()};
  $("#bgG").onchange=e=>setGrp(e.target.value);
  $("#bgQ").onclick=()=>{grp=BG_ALL[Math.floor(Math.random()*8)];hidden=true;mkWells();showGrp();const a=$("#bgAns");a.style.display="flex";a.innerHTML=BG_ALL.map(x=>`<button class="b" data-g="${x}">${x.replace("-","−")}</button>`).join("");
    a.querySelectorAll("button").forEach(b=>b.onclick=()=>{const ok=b.dataset.g===grp;if(ok)b.classList.add("primary");$("#bgN").innerHTML=(ok?"<b>Вярно!</b> ":"<b>Не е вярно.</b> Правилният отговор е "+grp.replace("-"," Rh−").replace("+"," Rh+")+". ");if(ok){hidden=false;$("#bgG").value=grp;setTimeout(showGrp,900)}})};
  function drawCard(){const c=rcv($("#bgC"));if(!c)return;const {g,W,H}=c,k=Math.min(W/700,H/250);g.save();g.translate((W-700*k)/2,(H-250*k)/2);g.scale(k,k);
    const u=Math.min(1,(performance.now()-t0)/2500),e=u*u*(3-2*u);
    g.fillStyle=css("--chip");g.beginPath();g.roundRect?g.roundRect(4,4,692,242,12):g.rect(4,4,692,242);g.fill();
    g.fillStyle=css("--muted");g.font=RFONT(11,700);g.textAlign="center";g.fillText("право определяне: еритроцити на пациента + тест серум",230,24);g.fillText("обратно: серум на пациента + стандартни клетки",580,24);
    g.strokeStyle=css("--line");g.beginPath();g.moveTo(468,14);g.lineTo(468,236);g.stroke();
    wells.forEach((w,i)=>{const x=60+i*112+(i>=4?14:0),y=118;g.fillStyle="#fff";g.strokeStyle=css("--line");g.lineWidth=1.5;g.beginPath();g.arc(x,y,44,0,7);g.fill();g.stroke();
      const tint=w.k==="A"?"rgba(28,126,214,.12)":w.k==="B"?"rgba(245,159,0,.15)":w.k==="D"?"rgba(134,142,150,.12)":"rgba(250,82,82,.06)";g.fillStyle=tint;g.beginPath();g.arc(x,y,42,0,7);g.fill();
      w.cells.forEach(cc=>{const px=x+cc.x+(cc.cx-cc.x)*e,py=y+cc.y+(cc.cy-cc.y)*e;g.fillStyle="#c92a2a";g.beginPath();g.arc(px,py,w.pos?3.3:2.6,0,7);g.fill()});
      g.fillStyle=css("--ink");g.font=RFONT(12,700);g.fillText(w.l,x,y+62);g.font=RFONT(11);g.fillStyle=w.pos&&e>0.8?css("--accent"):css("--muted");g.fillText(e<0.8?"…":w.pos?"аглутинация":"няма",x,y+77)});
    g.restore()}
  // --- 2. преливане ---
  let prod="rbc",mix=0;const pBtn=$("#bgP").querySelectorAll("button");pBtn.forEach(b=>b.onclick=()=>{prod=b.dataset.p;pBtn.forEach(x=>x.classList.toggle("on",x===b));trans()});
  const nm=x=>x.replace("-"," Rh−").replace("+"," Rh+");
  function trans(){const d=$("#bgD").value,r=$("#bgR").value,C=bgCompat(d,r,prod);mix=performance.now();
    $("#bgTN").innerHTML=C.ok?`<b>Съвместимо.</b> ${prod==="rbc"?`Еритроцитите на донора (${nm(d)}) нямат антиген, срещу който реципиентът има антитела.`:`Плазмата на донора (${nm(d)}) няма антитела срещу еритроцитите на реципиента.`}`:
      `<b>Несъвместимо!</b> ${prod==="rbc"?(!C.abo?`Анти-${!bgAnt(r).A&&bgAnt(d).A?"A":"B"} антителата (IgM) на реципиента свързват еритроцитите на донора, активират комплемента → остра интраваскуларна хемолиза: треска, болка в кръста, хемоглобинурия, шок, ДИК, бъбречна недостатъчност.`:`Rh+ еритроцити в Rh− реципиент: първия път антитела още няма, но се образуват анти-D (IgG) — при следващо преливане или бременност следва хемолиза.`):`Антителата в плазмата на донора реагират с еритроцитите на реципиента.`}`;
    const ab=g=>g.replace(/[+-]/,"");let h=`<table class="small" style="border-collapse:collapse;margin-top:8px"><tr><td style="padding:3px 6px">донор ↓ / реципиент →</td>${BG_ALL.map(x=>`<td style="padding:3px 6px;font-weight:700">${x.replace("-","−")}</td>`).join("")}</tr>`;
    BG_ALL.forEach(dd=>{h+=`<tr><td style="padding:3px 6px;font-weight:700">${dd.replace("-","−")}</td>`+BG_ALL.map(rr=>{const c=bgCompat(dd,rr,prod),cur=dd===d&&rr===r;return `<td style="padding:3px 6px;text-align:center;background:${c.ok?"rgba(43,138,90,.16)":"rgba(192,40,58,.10)"};${cur?"outline:2px solid var(--ink)":""}">${c.ok?"✓":"✗"}</td>`}).join("")+"</tr>"});
    $("#bgM").innerHTML=h+"</table>"}
  ["#bgD","#bgR"].forEach(s=>$(s).onchange=trans);
  function drawTrans(){const c=rcv($("#bgT"));if(!c)return;const {g,W,H}=c,k=Math.min(W/700,H/150);g.save();g.translate((W-700*k)/2,(H-150*k)/2);g.scale(k,k);
    const d=$("#bgD").value,r=$("#bgR").value,C=bgCompat(d,r,prod),u=Math.min(1,(performance.now()-mix)/2500);
    g.fillStyle="rgba(224,49,49,.07)";g.fillRect(0,40,700,70);g.strokeStyle="#e8a5a5";g.lineWidth=2;g.strokeRect(0,40,700,70);
    g.fillStyle=css("--ink");g.font=RFONT(12,700);g.textAlign="left";g.fillText("вена на реципиента ("+nm(r)+")",8,30);g.textAlign="right";g.fillText((prod==="rbc"?"еритроцити":"плазма")+" на донора ("+nm(d)+") →",692,30);
    const an=bgAnt(d),rn=bgAnt(r);
    for(let i=0;i<30;i++){const x=((i*53+performance.now()/30)%700),y=50+(i*37)%50,don=i%3===0,hem=!C.ok&&don&&prod==="rbc"&&u>0.6;
      if(prod==="pl"&&don){g.fillStyle="#f59f00";g.beginPath();g.moveTo(x,y-5);g.lineTo(x+4,y+4);g.lineTo(x-4,y+4);g.closePath();g.fill();continue}
      const col=don?"#862e9c":"#c92a2a";if(hem){g.strokeStyle=col;g.setLineDash([2,2]);g.beginPath();g.arc(x,y,6,0,7);g.stroke();g.setLineDash([]);continue}
      g.fillStyle=col;g.beginPath();g.ellipse(x,y,7,4.5,0,0,7);g.fill();
      if(!C.ok&&u>0.3&&(prod==="rbc"?don:!don)){g.strokeStyle="#f08c00";g.lineWidth=1.5;for(let j=0;j<3;j++){const a=j*2.1;g.beginPath();g.moveTo(x+Math.cos(a)*7,y+Math.sin(a)*5);g.lineTo(x+Math.cos(a)*12,y+Math.sin(a)*9);g.stroke()}}}
    g.fillStyle=C.ok?css("--accent3"):css("--accent");g.font=RFONT(12,700);g.textAlign="center";g.fillText(C.ok?"няма реакция":(prod==="rbc"?"антитела по донорските еритроцити → комплемент → хемолиза":"донорските антитела (▲) свързват еритроцитите на реципиента"),350,132);
    g.restore()}
  // --- 3. наследяване ---
  function inherit(){const [ma,md]=$("#bgMo").value.split(" "),[fa,fd]=$("#bgFa").value.split(" "),res={};
    for(const a of ma)for(const b of fa)for(const x of md)for(const y of fd){const al=[a,b].sort().join(""),abo=al==="OO"?"O":al.includes("A")&&al.includes("B")?"AB":al.includes("A")?"A":"B",rh=(x+y).includes("D")?"+":"-",k=abo+rh;res[k]=(res[k]||0)+1/16}
    $("#bgI").innerHTML=`<div style="display:grid;grid-template-columns:auto 1fr auto;gap:4px 10px;align-items:center;margin:6px 0">`+BG_ALL.map(gg=>{const p=res[gg]||0;return `<b>${nm(gg)}</b><div style="background:var(--chip);height:14px;border-radius:4px;overflow:hidden"><div style="width:${p*100}%;height:100%;background:var(--accent)"></div></div><span class="small">${fmt(p*100,1)} %</span>`}).join("")+"</div>";
    const rhRisk=md==="dd"&&(res["O+"]||res["A+"]||res["B+"]||res["AB+"]);
    $("#bgIN").innerHTML=`Всеки родител предава по един алел за ABO (A и B са кодоминантни, O е рецесивен) и един за RhD (D е доминантен). `+(rhRisk?`<b>Внимание:</b> майката е Rh− и детето може да е Rh+. При раждане фетални еритроцити влизат в кръвта ѝ → анти-D (IgG), които при следваща Rh+ бременност минават през плацентата → <b>хемолитична болест на новороденото</b>. Профилактика: анти-D имуноглобулин до 72 h след раждането (и в 28. седмица).`:"")}
  ["#bgMo","#bgFa"].forEach(s=>$(s).onchange=inherit);
  // --- 4. ПКК ---
  $("#hiPre").innerHTML=Object.entries(HI_PRE).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("");
  const Hs={},hn=()=>hiUpd();
  Hs.rbc=slider($("#hic1"),{label:"Еритроцити (RBC)",min:1.5,max:8,step:0.1,value:5,d:1,unit:"× 10¹²/L"},hn);
  Hs.hb=slider($("#hic1"),{label:"Хемоглобин (Hb)",min:40,max:220,step:1,value:150,unit:"g/L"},hn);
  Hs.hct=slider($("#hic1"),{label:"Хематокрит (Hct)",min:15,max:70,step:1,value:45,unit:"%"},hn);
  Hs.ret=slider($("#hic2"),{label:"Ретикулоцити",min:0.1,max:15,step:0.1,value:1,d:1,unit:"%"},hn);
  Hs.wbc=slider($("#hic2"),{label:"Левкоцити (WBC)",min:1,max:30,step:0.5,value:7,d:1,unit:"× 10⁹/L"},hn);
  Hs.plt=slider($("#hic2"),{label:"Тромбоцити (PLT)",min:10,max:900,step:10,value:250,unit:"× 10⁹/L"},hn);
  const hiSet=k=>{const p=HI_PRE[k];$("#hiPre").value=k;["rbc","hb","hct","ret","wbc","plt"].forEach(x=>Hs[x].set(p[x]));hiUpd()};$("#hiPre").onchange=e=>hiSet(e.target.value);
  function hiUpd(){const R=Hs.rbc.get(),Hb=Hs.hb.get(),Ht=Hs.hct.get(),mcv=Ht*10/R,mch=Hb/R,mchc=Hb/Ht*100,rt=Hs.ret.get(),W=Hs.wbc.get(),P=Hs.plt.get();
    const fl=(v,lo,hi)=>v<lo?" ↓":v>hi?" ↑":"";
    $("#hiS").innerHTML=statsHTML([["MCV = Hct/RBC",fmt(mcv,0)+" fL"+fl(mcv,80,100)],["MCH = Hb/RBC",fmt(mch,1)+" pg"+fl(mch,27,33)],["MCHC = Hb/Hct",fmt(mchc,0)+" g/L"+fl(mchc,320,360)],["Абс. ретикулоцити",fmt(R*rt*10,0)+" × 10⁹/L"],["WBC",fmt(W,1)+fl(W,4,10)],["PLT",fmt(P,0)+fl(P,150,400)]]);
    const anem=Hb<120,poly=Ht>54||Hb>185;let t=anem?(mcv<80?"<b>Микроцитна хипохромна анемия</b> — най-често железен дефицит (нисък феритин) или таласемия (при таласемия RBC често е нормален или висок, индекс на Mentzer MCV/RBC < 13 → тук "+fmt(mcv/R,1)+").":mcv>100?"<b>Макроцитна анемия</b> — дефицит на B₁₂ или фолиева киселина (мегалобластна; често и левко- и тромбоцитопения), алкохол, чернодробно заболяване.":"<b>Нормоцитна нормохромна анемия</b> — остра кръвозагуба, хемолиза, хронично заболяване, бъбречна недостатъчност (липса на еритропоетин).")
      +(rt>2.5?" Високите ретикулоцити показват, че костният мозък отговаря (хемолиза или кръвозагуба).":rt<0.8?" Ниските ретикулоцити показват недостатъчно производство.":""):poly?"<b>Еритроцитоза</b> — първична (полицитемия вера, често и левко- и тромбоцитоза) или вторична (хипоксия, височина, тумор с еритропоетин). При дехидратация повишението е само относително (хемоконцентрация).":"Показателите са в нормата. MCV оценява размера на еритроцитите, MCH и MCHC — съдържанието на хемоглобин в тях.";
    $("#hiN").innerHTML=t;linkTerms($("#hiN"));
    const c=rcv($("#hiC"));if(!c)return;const {g,W:Wc,H}=c,k=Math.min(Wc/240,H/280);g.save();g.translate((Wc-240*k)/2,(H-280*k)/2);g.scale(k,k);
    const x=60,y=20,w=56,h=230,hp=h*(1-Ht/100-0.01),hb=h*0.01+W/400*h;
    g.fillStyle="#fff7d6";g.fillRect(x,y,w,hp);g.fillStyle="#f1f3f5";g.fillRect(x,y+hp,w,hb);g.fillStyle="#b02525";g.fillRect(x,y+hp+hb,w,h-hp-hb);
    g.strokeStyle=css("--ink");g.lineWidth=1.5;g.beginPath();g.moveTo(x,y-6);g.lineTo(x,y+h-12);g.quadraticCurveTo(x+w/2,y+h+16,x+w,y+h-12);g.lineTo(x+w,y-6);g.stroke();
    g.fillStyle=css("--ink");g.font=RFONT(11,700);g.textAlign="left";g.fillText("плазма",x+w+10,y+hp/2);g.fillText(fmt(100-Ht,0)+" %",x+w+10,y+hp/2+14);g.fillText("левкоцити и",x+w+10,y+hp+4);g.fillText("тромбоцити",x+w+10,y+hp+17);
    g.fillText("еритроцити",x+w+10,y+hp+hb+(h-hp-hb)/2);g.fillText("Hct "+fmt(Ht,0)+" %",x+w+10,y+hp+hb+(h-hp-hb)/2+14);
    // размер на еритроцита
    const r=10*Math.cbrt(mcv/90),pale=Math.max(0,Math.min(1,(340-mchc)/60));g.fillStyle=`rgb(${200-pale*10},${40+pale*120},${40+pale*120})`;g.beginPath();g.ellipse(30,y+40,r,r*0.95,0,0,7);g.fill();g.fillStyle=`rgba(255,255,255,${0.25+pale*0.5})`;g.beginPath();g.ellipse(30,y+40,r*0.45,r*0.42,0,0,7);g.fill();
    g.fillStyle=css("--muted");g.font=RFONT(10);g.textAlign="center";g.fillText("еритроцит",30,y+70);g.fillText(fmt(mcv,0)+" fL",30,y+83);
    g.restore()}
  // начални стойности
  setGrp("A+");$("#bgD").value="O-";$("#bgR").value="A+";trans();inherit();hiSet("m");
  experiments($("#ex"),EXP_BG,"bgroups",e=>{if(e.grp){setGrp(e.grp);$("#bgC").scrollIntoView({behavior:"smooth",block:"center"})}if(e.don){$("#bgD").value=e.don;$("#bgR").value=e.rec;prod=e.prod;pBtn.forEach(x=>x.classList.toggle("on",x.dataset.p===prod));trans();$("#bgT").scrollIntoView({behavior:"smooth",block:"center"})}
    if(e.mo){$("#bgMo").value=e.mo;$("#bgFa").value=e.fa;inherit();$("#bgI").scrollIntoView({behavior:"smooth",block:"center"})}if(e.hi){hiSet(e.hi);$("#hiC").scrollIntoView({behavior:"smooth",block:"center"})}});
  rLoop($("#bgC"),()=>{window.__BG={wells,t0,mix,prod,C:bgCompat($("#bgD").value,$("#bgR").value,prod)};drawCard();drawTrans()});
  window.onresize=()=>hiUpd();
}
/* ===== VI.1 Гломерулна филтрация и клирънс ===== */
const piLP=C=>2.1*C+0.16*C*C+0.009*C*C*C;// Landis–Pappenheimer, C в g/dL
function gfrCore(p,Ra){// p:{map,Re,prot,pb,kf,hct}
  const Rv=0.0127,Pv=4,R=Ra+p.Re+Rv,RBF=Math.max(0,(p.map-Pv)/R),RPF=RBF*(1-p.hct/100),Pgc=p.map-RBF*Ra;
  const N=40;let Q=RPF,C=p.prot,G=0;const prof=[];
  for(let i=0;i<N;i++){const net=Pgc-p.pb-piLP(C),f=Math.max(0,net)*p.kf/N;const df=Math.min(f,Q*0.9);G+=df;C=C*Q/(Q-df);Q-=df;prof.push([i/(N-1),Pgc,p.pb+piLP(C),net])}
  return {RBF,RPF,Pgc,GFR:G,FF:RPF?G/RPF:0,piE:piLP(C),prof,Ra}}
const GFR_RA0=0.0364,GFR_RE0=0.0382;
function gfrSolve(p){const Ra0=GFR_RA0*p.aff,base=gfrCore(p,Ra0);if(!p.auto)return base;
  // миогенен отговор + тубулогломерулна обратна връзка: аферентното съпротивление се настройва (в граници)
  const tgt=125*(1+0.08*(p.map-100)/100)*(p.kf/12.5>1?1:Math.pow(p.kf/12.5,0.15));let lo=Ra0*0.35,hi=Ra0*3.2;
  if(gfrCore(p,lo).GFR<tgt)return gfrCore(p,lo);if(gfrCore(p,hi).GFR>tgt)return gfrCore(p,hi);
  for(let i=0;i<40;i++){const m=(lo+hi)/2;gfrCore(p,m).GFR>tgt?lo=m:hi=m}return gfrCore(p,(lo+hi)/2)}
const GFR_PRE={
 normal:{n:"Норма",map:100,aff:1,eff:1,prot:7,pb:18,kf:12.5,auto:1},
 hypo:{n:"Хипотония (САН 75 mmHg)",map:75,aff:1,eff:1,prot:7,pb:18,kf:12.5,auto:1},
 sym:{n:"Силна симпатикусова стимулация (шок)",map:65,aff:2.6,eff:1.6,prot:7,pb:18,kf:12.5,auto:0},
 ang:{n:"Ангиотензин II (умерено)",map:100,aff:1.15,eff:1.9,prot:7,pb:18,kf:12.5,auto:1},
 stenACE:{n:"Стеноза на бъбречната артерия + ACE инхибитор",map:70,aff:1,eff:0.7,prot:7,pb:18,kf:12.5,auto:1},
 nsaid:{n:"НСПВС при хиповолемия",map:80,aff:2.0,eff:1.3,prot:7,pb:18,kf:12.5,auto:0},
 obstr:{n:"Обструкция на уретера",map:100,aff:1,eff:1,prot:7,pb:40,kf:12.5,auto:1},
 lowprot:{n:"Хипопротеинемия (нефротичен синдром)",map:100,aff:1,eff:1,prot:4.2,pb:18,kf:12.5,auto:0},
 gn:{n:"Гломерулонефрит (K_f 35 %)",map:110,aff:1,eff:1,prot:7,pb:18,kf:4.4,auto:1},
 dm:{n:"Ранен захарен диабет (хиперфилтрация)",map:100,aff:0.7,eff:1,prot:7,pb:18,kf:14,auto:0}};
const GFR_INFO={
 normal:"<b>Норма:</b> P<sub>GC</sub> ≈ 60 mmHg навън, а навътре — налягането в капсулата на Боуман ≈ 18 и онкотичното ≈ 26–28 → 37 mmHg (белтъците се концентрират по дължината на капиляра). Нетно ≈ 10 mmHg × K<sub>f</sub> 12,5 mL/min/mmHg ≈ 125 mL/min. Филтрационна фракция ≈ 0,2.",
 hypo:"<b>Авторегулация:</b> между ≈ 75 и 160 mmHg миогенният отговор и тубулогломерулната обратна връзка (macula densa) разширяват или свиват аферентната артериола и GFR остава почти постоянна. Под ≈ 75 mmHg тя не стига и GFR пада.",
 sym:"<b>Силна симпатикусова активност:</b> свиват се и двете артериоли, повече аферентната. Бъбречният кръвоток и GFR рязко спадат — кръвта отива към сърцето и мозъка. Причина за пререналната остра бъбречна недостатъчност при шок.",
 ang:"<b>Ангиотензин II:</b> свива предимно еферентната артериола → P<sub>GC</sub> расте и GFR се запазва, въпреки че кръвотокът намалява. Филтрационната фракция расте и онкотичното налягане в перитубулните капиляри се повишава → повече реабсорбция на Na⁺ и вода.",
 stenACE:"<b>Стеноза + ACE инхибитор:</b> зад стенозата налягането е ниско и GFR се поддържа от Ang II чрез еферентната констрикция. ACE инхибиторът я премахва и GFR пада рязко. Затова при двустранна стеноза ACE инхибиторите са противопоказани.",
 nsaid:"<b>НСПВС при хиповолемия:</b> простагландините разширяват аферентната артериола и пазят бъбрека, когато симпатикусът и Ang II са високи. НСПВС ги потискат → аферентна вазоконстрикция и спад на GFR.",
 obstr:"<b>Обструкция:</b> налягането в капсулата на Боуман расте и намалява нетното филтрационно налягане. GFR пада въпреки нормалния кръвоток (постренална бъбречна недостатъчност).",
 lowprot:"<b>Хипопротеинемия:</b> по-ниско онкотично налягане в капиляра → GFR се повишава (при запазено K<sub>f</sub>). При нефротичен синдром K<sub>f</sub> обаче често е намален от болестта.",
 gn:"<b>Гломерулонефрит:</b> по-малко функциониращи капиляри и удебелена мембрана → K<sub>f</sub> пада. Авторегулацията не може да компенсира и GFR намалява дори при повишено налягане.",
 dm:"<b>Ранен диабет:</b> аферентната артериола е разширена и K<sub>f</sub> е малко по-голям → хиперфилтрация. Високото гломерулно налягане с годините уврежда гломерулите."};
const CL_SUB={inulin:{n:"Инулин",u:"mg/dL",P:10,max:100},creat:{n:"Креатинин",u:"mg/dL",P:1,max:12},glu:{n:"Глюкоза",u:"mg/dL",P:100,max:800},pah:{n:"PAH (парааминохипурат)",u:"mg/dL",P:2,max:60},urea:{n:"Урея",u:"mg/dL",P:26,max:200},na:{n:"Na⁺",u:"mmol/L",P:142,max:180}};
function clCalc(k,P,G,RPF){// върща mg/min (или mmol/min за Na)
  const FL=k==="na"?G*P/1000:G*P/100;let re=0,se=0;
  if(k==="creat")se=0.15*FL;
  if(k==="glu"){const Tm=375,th=0.995;re=(FL+Tm-Math.sqrt((FL+Tm)*(FL+Tm)-4*th*FL*Tm))/(2*th)}
  if(k==="pah"){const Tm=80,cap=Math.max(0,0.92*(RPF*P/100)-FL),th=0.98;se=(cap+Tm-Math.sqrt((cap+Tm)*(cap+Tm)-4*th*cap*Tm))/(2*th)}
  if(k==="urea")re=0.5*FL;if(k==="na")re=0.994*FL;
  const E=FL-re+se;return {FL,re,se,E,C:P?E/P*(k==="na"?1000:100):0}}
const EXP_GFR=[
 {q:"Средното артериално налягане пада от 100 на 80 mmHg. Какво става с GFR при запазена авторегулация?",opts:["Пада с 20 %","Остава почти същата","Расте"],a:1,set:{pre:"normal",map:80},expl:"Аферентната артериола се разширява (миогенен отговор и сигнал от macula densa) и P<sub>GC</sub> се запазва. Изключи авторегулацията и сравни."},
 {q:"Ангиотензин II свива еферентната артериола. Какво става с филтрационната фракция?",opts:["Намалява","Расте — GFR се запазва, а кръвотокът спада","Не се променя"],a:1,set:{pre:"ang"},expl:"FF = GFR/RPF. P<sub>GC</sub> расте, затова GFR се запазва, а плазменият кръвоток намалява."},
 {q:"При стеноза на бъбречната артерия даваме ACE инхибитор. Какво става с GFR?",opts:["Расте","Пада рязко","Не се променя"],a:1,set:{pre:"stenACE"},expl:"Без Ang II еферентната артериола се разширява, P<sub>GC</sub> пада и GFR намалява."},
 {q:"Камък запушва уретера. Коя сила се променя?",opts:["Онкотичното налягане","Налягането в капсулата на Боуман","K<sub>f</sub>"],a:1,set:{pre:"obstr"},expl:"P<sub>B</sub> расте и намалява нетното филтрационно налягане."},
 {q:"Плазмената глюкоза е 300 mg/dL. Има ли глюкоза в урината?",opts:["Не","Да — превишен е тубулният транспортен максимум","Само при ниска GFR"],a:1,set:{sub:"glu",P:300},expl:"Филтрираното количество (125 × 3 = 375 mg/min) достига T<sub>m</sub> ≈ 375 mg/min. Глюкоза се появява в урината над ≈ 200 mg/dL (бъбречен праг) заради неравномерността на нефроните (splay)."},
 {q:"Клирънсът на кое вещество е най-близо до бъбречния плазмен кръвоток?",opts:["Инулин","PAH при ниска концентрация","Глюкоза"],a:1,set:{sub:"pah",P:2},expl:"PAH се филтрира и активно секретира — около 90 % се изчиства за едно преминаване. Затова C<sub>PAH</sub> ≈ ефективен RPF ≈ 600 mL/min."}];
function viewGFR(main){
  main.innerHTML=`<h2>Гломерулна филтрация и клирънс</h2><p class="lead">Силите на Starling в гломерулния капиляр, аферентната и еферентната артериола, авторегулацията и клирънсът на различни вещества. Промени съпротивленията и наляганията и виж как се променят GFR, кръвотокът и съставът на урината.</p>
  <div class="card" style="padding:10px"><div class="btns"><select id="gfPre" style="width:auto;max-width:100%"></select><label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="gfAuto" checked> Авторегулация (миогенна + macula densa)</label></div>
   <canvas id="gfC" style="width:100%;height:340px;display:block;margin-top:6px"></canvas>
   <div class="stats" id="gfS" style="margin-top:8px"></div>
   <div class="note" id="gfN" style="min-height:4.6em"></div>
   <div class="grid2" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px"><canvas class="plot" id="gfA" style="height:220px"></canvas><canvas class="plot" id="gfP" style="height:220px"></canvas></div>
   <div class="legend"><span><i style="background:var(--accent)"></i>GFR</span><span><i style="background:var(--accent2)"></i>бъбречен кръвоток / 10</span><span><i class="dash" style="border-color:var(--muted)"></i>без авторегулация</span><span><i style="background:var(--accent4)"></i>P<sub>GC</sub></span><span><i style="background:var(--accent5)"></i>P<sub>B</sub> + π<sub>GC</sub></span><span><i class="box" style="background:rgba(43,138,90,.2)"></i>нетно филтрационно налягане</span></div>
   <div class="grid2" style="grid-template-columns:1fr 1fr"><div id="gfc1"></div><div id="gfc2"></div></div></div>
  <div class="card" style="padding:10px"><h3 style="margin-top:0">Клирънс: какво става с веществото</h3>
   <div class="btns"><div class="toggle" id="clT">${Object.entries(CL_SUB).map(([k,v])=>`<button data-s="${k}">${v.n}</button>`).join("")}</div></div>
   <div id="clc"></div><div class="stats" id="clS"></div>
   <canvas class="plot" id="clG" style="height:220px"></canvas>
   <div class="legend"><span><i style="background:var(--accent2)"></i>филтрирано</span><span><i style="background:var(--accent3)"></i>реабсорбирано</span><span><i style="background:var(--accent5)"></i>секретирано</span><span><i style="background:var(--accent)"></i>в урината</span></div>
   <div class="note" id="clN"></div></div>
  <h3>Експерименти</h3><div id="ex"></div>`;
  const sel=$("#gfPre");sel.innerHTML=Object.entries(GFR_PRE).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("");
  const S={},n=()=>upd();
  S.map=slider($("#gfc1"),{label:"Средно артериално налягане",min:40,max:200,step:1,value:100,unit:"mmHg"},n);
  S.aff=slider($("#gfc1"),{label:"Тонус на аферентната артериола",min:30,max:300,step:5,value:100,unit:"%",hint:"симпатикус, аденозин, НСПВС ↑; простагландини ↓"},n);
  S.eff=slider($("#gfc1"),{label:"Тонус на еферентната артериола",min:30,max:400,step:5,value:100,unit:"%",hint:"ангиотензин II ↑; ACE инхибитор ↓"},n);
  S.prot=slider($("#gfc2"),{label:"Плазмени белтъци",min:3,max:10,step:0.1,value:7,d:1,unit:"g/dL",hint:"π ≈ "+fmt(piLP(7),0)+" mmHg при 7 g/dL"},n);
  S.pb=slider($("#gfc2"),{label:"Налягане в капсулата на Боуман",min:5,max:60,step:1,value:18,unit:"mmHg"},n);
  S.kf=slider($("#gfc2"),{label:"K<sub>f</sub> (площ × пропускливост)",min:2,max:25,step:0.1,value:12.5,d:1,unit:"mL/min/mmHg"},n);
  const cA=$("#gfAuto");cA.onchange=n;
  const par=()=>({map:S.map.get(),aff:S.aff.get()/100,Re:GFR_RE0*S.eff.get()/100,prot:S.prot.get(),pb:S.pb.get(),kf:S.kf.get(),hct:45,auto:cA.checked});
  let R=gfrSolve(par()),parts=[],fil=[];
  const setPre=k=>{const p=GFR_PRE[k];sel.value=k;S.map.set(p.map);S.aff.set(p.aff*100);S.eff.set(p.eff*100);S.prot.set(p.prot);S.pb.set(p.pb);S.kf.set(p.kf);cA.checked=!!p.auto;$("#gfN").innerHTML=GFR_INFO[k];linkTerms($("#gfN"));upd()};
  sel.onchange=()=>setPre(sel.value);
  // клирънс
  let sub="inulin";const Cs=slider($("#clc"),{label:"Плазмена концентрация",min:0,max:100,step:1,value:10,show:v=>fmt(v,v<10?1:0)+" "+CL_SUB[sub].u},()=>clUpd());
  const cInp=$("#clc input");
  const clBtn=$("#clT").querySelectorAll("button");const setSub=(k,P)=>{sub=k;clBtn.forEach(b=>b.classList.toggle("on",b.dataset.s===k));const d=CL_SUB[k];cInp.max=d.max;cInp.step=d.max>=100?1:0.1;Cs.set(P!=null?P:d.P);clUpd()};
  clBtn.forEach(b=>b.onclick=()=>setSub(b.dataset.s));
  function clUpd(){const d=CL_SUB[sub],P=Cs.get(),r=clCalc(sub,P,R.GFR,R.RPF),u=sub==="na"?"mmol/min":"mg/min",f2=v=>v<10?fmt(v,2):fmt(v,0);
    $("#clS").innerHTML=statsHTML([["Филтрирано (GFR × P)",f2(r.FL)+" "+u],["Реабсорбирано",f2(r.re)+" "+u],["Секретирано",f2(r.se)+" "+u],["Екскретирано (U × V)",f2(r.E)+" "+u],["Клирънс",fmt(r.C,r.C<10?1:0)+" mL/min"],["Фракционна екскреция",fmt(r.FL?r.E/r.FL*100:0,1)+" %"]]);
    const xs=[],a=[],b=[],c=[],e=[];for(let i=0;i<=100;i++){const x=d.max*i/100,q=clCalc(sub,x,R.GFR,R.RPF);xs.push(x);a.push(q.FL);b.push(q.re);c.push(q.se);e.push(q.E)}
    const ym=Math.max(...a,...e)*1.05||1;
    plot($("#clG"),{xmin:0,xmax:d.max,ymin:0,ymax:ym,xlabel:"плазмена концентрация, "+d.u,ylabel:u,series:[{x:xs,y:a,color:css("--accent2"),width:2},{x:xs,y:b,color:css("--accent3"),width:2},{x:xs,y:c,color:css("--accent5"),width:2},{x:xs,y:e,color:css("--accent"),width:2.6}],marks:[{x:P,y:r.E,color:css("--ink"),label:"сега"}]});
    const T={inulin:"Инулинът се филтрира свободно и не се реабсорбира и не се секретира. Затова неговият клирънс е равен на GFR — златният стандарт за измерването ѝ.",
      creat:"Креатининът се образува постоянно в мускулите. Филтрира се и малко се секретира, затова клирънсът му е около 10–20 % над GFR. На практика се използва за оценка на GFR (eGFR). Когато GFR намалее наполовина, плазменият креатинин се удвоява.",
      glu:"Глюкозата се реабсорбира напълно в проксималния тубул чрез SGLT2 и SGLT1, докато не се достигне транспортният максимум (T<sub>m</sub> ≈ 375 mg/min). Над бъбречния праг (≈ 200 mg/dL) се появява глюкозурия — при захарен диабет или при лечение с SGLT2 инхибитори.",
      pah:"PAH се филтрира и активно се секретира от органичните анионни транспортери в проксималния тубул. При ниска концентрация почти цялото количество се отделя за едно преминаване — клирънсът му мери ефективния бъбречен плазмен кръвоток. При висока концентрация секрецията достига T<sub>m</sub>.",
      urea:"Уреята се реабсорбира пасивно около 50 % — клирънсът е под GFR. В медулата тя рециркулира и допринася за концентрирането на урината.",
      na:"Около 25 000 mmol Na⁺ се филтрират дневно, а се отделят само 100–200 mmol: реабсорбират се над 99 %. Фракционната екскреция на Na⁺ (FE<sub>Na</sub>) под 1 % говори за преренална причина при остра бъбречна недостатъчност."};
    $("#clN").innerHTML=T[sub];linkTerms($("#clN"))}
  function upd(){R=gfrSolve(par());const p=par();
    $("#gfS").innerHTML=statsHTML([["GFR",fmt(R.GFR,0)+" mL/min"],["Бъбречен кръвоток",fmt(R.RBF,0)+" mL/min"],["Плазмен кръвоток",fmt(R.RPF,0)+" mL/min"],["Филтрационна фракция",fmt(R.FF,2)],["P<sub>GC</sub>",fmt(R.Pgc,0)+" mmHg"],["π<sub>GC</sub> в началото / края",fmt(piLP(p.prot),0)+" / "+fmt(R.piE,0)+" mmHg"],["Аферентно съпротивление",fmt(R.Ra/GFR_RA0*100,0)+" %"],["Филтрат за денонощие",fmt(R.GFR*1.44,0)+" L"]]);
    const xs=[],g1=[],r1=[],g0=[];for(let m=40;m<=200;m+=4){const a=gfrSolve(Object.assign({},p,{map:m,auto:true})),b=gfrSolve(Object.assign({},p,{map:m,auto:false}));xs.push(m);g1.push(a.GFR);r1.push(a.RBF/10);g0.push(b.GFR)}
    plot($("#gfA"),{xmin:40,xmax:200,ymin:0,ymax:Math.max(200,Math.ceil(Math.max(...g1,...r1,R.GFR)/50)*50),xlabel:"САН, mmHg",ylabel:"mL/min",shade:[{x0:75,x1:160,color:"rgba(43,138,90,.08)"}],series:[{x:xs,y:g0,color:css("--muted"),width:1.4,dash:[5,4]},{x:xs,y:r1,color:css("--accent2"),width:2},{x:xs,y:g1,color:css("--accent"),width:2.4}],marks:[{x:p.map,y:R.GFR,color:css("--ink"),label:"сега"}]});
    const px=R.prof.map(q=>q[0]*100);plot($("#gfP"),{xmin:0,xmax:100,ymin:0,ymax:Math.max(80,Math.ceil(R.Pgc/10)*10+10),xlabel:"по дължината на капиляра, %",ylabel:"mmHg",series:[{x:px,y:R.prof.map(q=>q[1]),color:css("--accent4"),width:2.4},{x:px,y:R.prof.map(q=>q[2]),color:css("--accent5"),width:2.4}],shade:[]});
    clUpd()}
  function draw(dt){const c=rcv($("#gfC"));if(!c)return;const {g,W,H}=c,k=Math.min(W/700,H/340);g.save();g.translate((W-700*k)/2,(H-340*k)/2);g.scale(k,k);const p=par();
    const ra=R.Ra/GFR_RA0,re=p.Re/GFR_RE0,wA=Math.max(4,22/Math.pow(ra,0.25)),wE=Math.max(4,18/Math.pow(re,0.25));
    // капсула на Боуман
    g.fillStyle="rgba(250,176,5,.08)";g.strokeStyle="#c47f0e";g.lineWidth=3;g.beginPath();g.arc(330,170,128,0.35*Math.PI,2.65*Math.PI);g.stroke();g.beginPath();g.arc(330,170,128,0,7);g.fill();
    // тубул
    g.strokeStyle="#c47f0e";g.lineWidth=3;g.beginPath();g.moveTo(330+128*Math.cos(0.35*Math.PI),170+128*Math.sin(0.35*Math.PI));g.lineTo(420,330);g.moveTo(330+128*Math.cos(2.65*Math.PI)+0,170+128*Math.sin(2.65*Math.PI));g.lineTo(520,320);g.stroke();
    g.fillStyle="#fff3bf";g.beginPath();g.moveTo(330+128*Math.cos(0.35*Math.PI),170+128*Math.sin(0.35*Math.PI));g.lineTo(420,330);g.lineTo(520,320);g.lineTo(330+128*Math.cos(0.65*Math.PI-2*Math.PI),170+128*Math.sin(0.65*Math.PI));g.closePath();
    g.fillStyle=css("--muted");g.font=RFONT(11,700);g.textAlign="center";g.fillText("капсула на Боуман  P_B = "+fmt(p.pb,0)+" mmHg",330,28);g.fillText("→ проксимален тубул",520,336);
    // аферентна (отляво отгоре) и еферентна
    const vess=(x1,y1,x2,y2,w,col)=>{g.strokeStyle=col;g.lineWidth=w;g.lineCap="round";g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()};
    vess(20,100,250,150,wA,"#e03131");vess(250,190,40,250,wE,"#c2255c");
    g.fillStyle=css("--ink");g.font=RFONT(12,700);g.textAlign="left";g.fillText("аферентна артериола",20,80);g.font=RFONT(11);g.fillStyle=css("--muted");g.fillText("съпротивление "+fmt(ra*100,0)+" %",20,94);
    g.fillStyle=css("--ink");g.font=RFONT(12,700);g.fillText("еферентна артериола",20,284);g.font=RFONT(11);g.fillStyle=css("--muted");g.fillText("съпротивление "+fmt(re*100,0)+" %",20,298);
    // macula densa
    if(p.auto){g.fillStyle="#2b8a5a";g.beginPath();g.ellipse(240,128,12,7,0.4,0,7);g.fill();g.fillStyle="#2b8a5a";g.font=RFONT(10.5,700);g.textAlign="center";g.fillText("macula densa",210,66);g.strokeStyle="#2b8a5a";g.lineWidth=1;g.beginPath();g.moveTo(214,70);g.lineTo(236,120);g.stroke()}
    // капилярно кълбо — бримки
    const loops=[[290,120],[350,105],[395,150],[380,215],[315,235],[270,185]];g.strokeStyle="#e03131";g.lineWidth=9;g.lineCap="round";g.beginPath();g.moveTo(250,150);loops.forEach(([x,y],i)=>{const nx=loops[i+1]||[250,190];g.quadraticCurveTo(x+(x-330)*0.5,y+(y-170)*0.5,(x+nx[0])/2,(y+nx[1])/2)});g.lineTo(250,190);g.stroke();
    g.fillStyle=css("--ink");g.font=RFONT(12,700);g.textAlign="center";g.fillText("P_GC = "+fmt(R.Pgc,0)+" mmHg",330,166);g.font=RFONT(11);g.fillStyle=css("--muted");g.fillText("π: "+fmt(piLP(p.prot),0)+" → "+fmt(R.piE,0)+" mmHg",330,182);
    // стрелки на филтрация, намаляващи по дължината
    loops.forEach(([x,y],i)=>{const u=i/(loops.length-1),q=R.prof[Math.round(u*(R.prof.length-1))],net=Math.max(0,q[3]),L=4+net*2.2,ang=Math.atan2(y-170,x-330),x0=330+Math.cos(ang)*85,y0=170+Math.sin(ang)*85;if(net>0.3)rArrow(g,x0,y0,x0+Math.cos(ang)*L,y0+Math.sin(ang)*L,"#2b8a5a",2.2)});
    // поток на филтрата
    if(Math.random()<dt*R.GFR/8)fil.push({u:0});fil=fil.filter(f=>{f.u+=dt*0.45;const x=330+(470-330)*f.u,y=260+(325-260)*f.u;g.fillStyle="#f59f00";g.beginPath();g.arc(x,y,3,0,7);g.fill();return f.u<1});
    // кръв
    if(Math.random()<dt*R.RBF/60)parts.push({u:0,lane:Math.random()});parts=parts.filter(q=>{q.u+=dt*0.35*Math.min(2,R.RBF/1100+0.2);let x,y;if(q.u<0.5){const v=q.u/0.5;x=20+(250-20)*v;y=100+(150-100)*v+(q.lane-0.5)*wA*0.6}else{const v=(q.u-0.5)/0.5;x=250+(40-250)*v;y=190+(250-190)*v+(q.lane-0.5)*wE*0.6}g.fillStyle="#fff";g.globalAlpha=0.8;g.beginPath();g.arc(x,y,2.4,0,7);g.fill();g.globalAlpha=1;return q.u<1});
    rTag(g,560,30,["GFR "+fmt(R.GFR,0)+" mL/min","кръвоток "+fmt(R.RBF,0)+" mL/min"],{fs:12.5,c:R.GFR<60?css("--accent"):css("--ink")});
    g.restore()}
  setPre("normal");setSub("inulin");
  if(typeof k3Mount==="function")k3Mount("gfr",$("#gfC"),()=>({R,p:par()}));
  experiments($("#ex"),EXP_GFR,"gfr",e=>{if(e.pre){setPre(e.pre);if(e.map){S.map.set(e.map);upd()}$("#gfC").scrollIntoView({behavior:"smooth",block:"center"})}if(e.sub){setPre("normal");setSub(e.sub,e.P);$("#clG").scrollIntoView({behavior:"smooth",block:"center"})}});
  rLoop($("#gfC"),dt=>draw(dt));window.onresize=()=>upd();
}
/* ===== VI.2 Тубулен транспорт и противотоков механизъм ===== */
function tubCalc(p){// p:{adh 0–1 (≈ 0–10 pg/mL), resp, tal, dct, enac, aldo, vr, urea, load}
  const ae=p.adh*p.resp,G=p.tal*(0.55+0.45*Math.min(1.4,p.urea)*(0.5+0.5*Math.min(1,ae/0.3)))/(0.6+0.4*p.vr)/(0.85+0.15*p.load);
  const Mp=Math.max(300,Math.min(1400,300+900*G));
  const Otal=100+200*(1-p.tal),Odct=Otal-40*p.dct*p.tal,Umin=Math.max(50,Odct*0.55),Umax=0.95*Mp;
  let U=Umin+(Umax-Umin)*(1-Math.exp(-ae/0.35));U+=(320-U)*Math.min(0.8,Math.max(0,p.load-1)*0.35);
  const Sx=0.5*p.load*(1+2*(1-p.tal)+0.5*(1-p.dct)+0.25*(1-p.enac))*(1-0.1*(p.aldo-1));
  const V=Sx*1000/U,Cosm=Sx*1000/290,CH2O=V-Cosm;
  const UNa=Math.max(0.01,0.1*(1+4*(1-p.tal)+1*(1-p.dct)+0.6*(1-p.enac)+0.8*(p.load-1))*(1-0.3*(p.aldo-1)));
  const UK=0.06*Math.pow(p.aldo,0.8)*(1+0.8*(1-p.tal)+0.5*(1-p.dct)+0.3*(p.load-1))*(0.15+0.85*p.enac);
  const fTip=44-22*(Mp-300)/900,Occd=Odct+(300-Odct)*Math.min(1,ae/0.25),fCcd=Math.max(V,fTip*Odct/Occd*0.85);
  return {Mp,Otal,Odct,U,Sx,V,Cosm,CH2O,UNa,UK,fTip,Occd,fCcd,ae}}
const TUB_N={adh:0.25,resp:1,tal:1,dct:1,enac:1,aldo:1,vr:1,urea:1,load:1};
const TUB_PRE={
 normal:{n:"Норма (ADH ≈ 2,5 pg/mL)",o:{}},
 water:{n:"Изпити 1,5 L вода (няма ADH)",o:{adh:0}},
 dehyd:{n:"Жажда, дехидратация (висок ADH)",o:{adh:1}},
 furo:{n:"Фуроземид (бримков диуретик)",o:{tal:0.15}},
 thz:{n:"Тиазиден диуретик",o:{dct:0.15}},
 amil:{n:"Амилорид / спиронолактон",o:{enac:0.2,aldo:0.6}},
 mann:{n:"Манитол / глюкозурия (осмотична диуреза)",o:{load:3}},
 cdi:{n:"Централен безвкусен диабет",o:{adh:0}},
 ndi:{n:"Нефрогенен безвкусен диабет",o:{adh:1,resp:0.03}},
 siadh:{n:"SIADH",o:{adh:0.9}},
 lowp:{n:"Нискобелтъчна диета (малко урея)",o:{urea:0.3,adh:1}},
 conn:{n:"Първичен хипералдостеронизъм",o:{aldo:3}}};
const TUB_INFO={
 normal:"Около 65 % от филтрата се реабсорбира изоосмотично в <b>проксималния тубул</b>. Низходящото коляно пропуска вода, възходящото — не: дебелият му сегмент изпомпва NaCl чрез NKCC2 и създава градиента в медулата (<b>противотоков умножител</b>). Към дисталния тубул течността е хипотонична (≈ 100 mOsm/kg), а в събирателния канал ADH решава колко вода да се върне.",
 water:"Без ADH събирателният канал е непропусклив за вода. Урината остава хипотонична (до ≈ 50 mOsm/kg) и обемът ѝ расте до 15–20 mL/min — <b>водна диуреза</b>. Свободният воден клирънс е положителен.",
 dehyd:"Висок ADH: аквапорин-2 се вгражда в апикалната мембрана на главните клетки. Водата излиза към хипертоничната медула и урината се концентрира до ≈ 1200 mOsm/kg. ADH отваря и уреалните канали (UT-A1) в медуларния събирателен канал — уреята засилва градиента.",
 furo:"Фуроземидът блокира NKCC2 в дебелия възходящ сегмент. Медуларният градиент изчезва — урината не може нито да се концентрира, нито добре да се разреди (изостенурия). Много Na⁺ стига дистално → силна натриуреза и загуба на K⁺.",
 thz:"Тиазидите блокират NCC в дисталния тубул. Натриурезата е умерена, но се нарушава <b>разреждането</b> на урината — затова могат да дадат хипонатриемия. Повече Na⁺ към събирателния канал → загуба на K⁺. Повишават реабсорбцията на Ca²⁺.",
 amil:"Амилорид блокира ENaC, а спиронолактонът — минералкортикоидния рецептор в главните клетки. Без реабсорбция на Na⁺ липсва електрическият градиент за секреция на K⁺ → <b>калий-съхраняващи диуретици</b>, риск от хиперкалиемия.",
 mann:"Нереабсорбируемо вещество задържа вода в тубула. Потокът расте, медулата се „промива“ и урината се приближава до изоосмотична. Така действа и глюкозата при некомпенсиран захарен диабет (полиурия).",
 cdi:"Хипофизата не отделя ADH (травма, тумор, операция). Големи количества разредена урина (до 20 L/ден) и жажда. Десмопресинът (аналог на ADH) коригира състоянието.",
 ndi:"ADH е висок, но събирателният канал не отговаря (мутация на V2 рецептора или на аквапорин-2, литий, хиперкалциемия). Десмопресинът не помага.",
 siadh:"Неподходящо висок ADH (белодробни тумори, ЦНС, медикаменти). Урината е концентрирана въпреки ниския плазмен осмолалитет → задържане на вода и <b>хипонатриемия</b> при нормален обем.",
 lowp:"Уреята дава около половината от осмолалитета на вътрешната медула. При малко урея градиентът е по-слаб и максималната концентрация на урината спада.",
 conn:"Алдостеронът увеличава ENaC и Na⁺/K⁺-ATP-азата в главните клетки → повече реабсорбция на Na⁺ и секреция на K⁺ и H⁺. Резултат — хипертония, хипокалиемия и метаболитна алкалоза."};
const TUB_SEG=[
 {k:"pct",n:"Проксимален тубул",d:"Реабсорбира ≈ 65 % от водата и Na⁺, почти цялата глюкоза и аминокиселините (SGLT, котранспорт с Na⁺), ≈ 80 % от HCO₃⁻ (NHE3 + карбоанхидраза) и ≈ 50 % от уреята. Изоосмотична реабсорбция — течността остава ≈ 300 mOsm/kg. Тук се секретират органичните аниони и катиони (PAH, лекарства)."},
 {k:"dtl",n:"Тънко низходящо коляно",d:"Пропусклив за вода (аквапорин-1), слабо за соли. Водата излиза към хипертоничния интерстициум и течността се концентрира до осмолалитета на върха на папилата."},
 {k:"atl",n:"Тънко възходящо коляно",d:"Непропусклив за вода. NaCl излиза пасивно, защото концентрацията му в тубула е по-висока."},
 {k:"tal",n:"Дебел възходящ сегмент",d:"NKCC2 (1 Na⁺, 1 K⁺, 2 Cl⁻) реабсорбира ≈ 25 % от Na⁺; сегментът е непропусклив за вода → „разреждащ сегмент“. Създава градиент от 200 mOsm/kg на всяко ниво — основата на противотоковия умножител. K⁺ рециклира през ROMK и създава положителен потенциал в лумена, който движи Ca²⁺ и Mg²⁺ парацелуларно. Блокира се от фуроземид."},
 {k:"dct",n:"Дистален тубул",d:"NCC (Na⁺–Cl⁻ котранспорт) реабсорбира ≈ 5 % от Na⁺; непропусклив за вода — разрежда още. PTH стимулира реабсорбцията на Ca²⁺. В началото му е macula densa. Блокира се от тиазидите."},
 {k:"cd",n:"Събирателен канал",d:"Главни клетки: ENaC реабсорбира Na⁺ и ROMK секретира K⁺ под действие на алдостерона; аквапорин-2 под действие на ADH пропуска вода. Интеркаларни клетки: секреция на H⁺ (тип A) или HCO₃⁻ (тип B). В медуларната част ADH отваря и уреалните канали."}];
const EXP_TUB=[
 {q:"Изпиваш 1,5 L вода. Каква урина ще отделиш?",opts:["Малко и концентрирана","Много и разредена (≈ 50–100 mOsm/kg)","Нормална"],a:1,set:{pre:"water"},expl:"Плазменият осмолалитет пада, ADH спира и събирателният канал става непропусклив за вода."},
 {q:"Кой сегмент създава хиперосмоларния градиент в медулата?",opts:["Проксималният тубул","Дебелият възходящ сегмент на бримката на Хенле","Събирателният канал"],a:1,set:{pre:"normal",seg:"tal"},expl:"NKCC2 изпомпва NaCl без вода. С противотока на двете колена ефектът се умножава до ≈ 1200 mOsm/kg на върха."},
 {q:"Фуроземид: какво става с максималната концентрация на урината?",opts:["Расте","Пада — градиентът в медулата изчезва","Не се променя"],a:1,set:{pre:"furo"},expl:"Без NKCC2 интерстициумът не е хипертоничен и водата няма къде да излезе дори при висок ADH."},
 {q:"Защо тиазидите (а не бримковите диуретици) по-често причиняват хипонатриемия?",opts:["Защото са по-силни","Защото нарушават разреждането, но запазват концентрирането","Защото задържат Na⁺"],a:1,set:{pre:"thz"},expl:"Медулата остава хипертонична и ADH все още концентрира урината, но дисталното разреждане липсва — свободната вода се задържа."},
 {q:"ADH е висок, но урината е разредена. Кое е най-вероятно?",opts:["Централен безвкусен диабет","Нефрогенен безвкусен диабет","SIADH"],a:1,set:{pre:"ndi"},expl:"При нефрогенния вариант V2 рецепторът или аквапорин-2 не работят и бъбрекът не отговаря на ADH."},
 {q:"Какво прави алдостеронът в главните клетки?",opts:["Реабсорбира K⁺","Реабсорбира Na⁺ и секретира K⁺","Само реабсорбира вода"],a:1,set:{pre:"conn"},expl:"Повече ENaC и Na⁺/K⁺-ATP-аза. Отрицателният лумен засилва секрецията на K⁺ — при излишък има хипокалиемия."}];
function viewTubule(main){
  main.innerHTML=`<h2>Тубулен транспорт и противотоков механизъм</h2><p class="lead">Нефронът от гломерула до папилата: колко вода и NaCl се връщат във всеки сегмент, как бримката на Хенле създава медуларния градиент и как ADH и алдостеронът определят крайната урина. Докосни сегмент, за да видиш преносителите в него.</p>
  <div class="card" style="padding:10px"><div class="btns"><select id="tbPre" style="width:auto;max-width:100%"></select></div>
   <canvas id="tbC" style="width:100%;height:400px;display:block;margin-top:6px;cursor:pointer"></canvas>
   <div class="stats" id="tbS" style="margin-top:8px"></div>
   <div class="note" id="tbN" style="min-height:4.6em"></div>
   <div class="note" id="tbSeg" style="min-height:3em"></div>
   <div class="grid2" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px"><canvas class="plot" id="tbG" style="height:220px"></canvas><div id="tbB"></div></div>
   <div class="legend"><span><i style="background:var(--accent)"></i>осмолалитет на урината</span><span><i style="background:var(--accent2)"></i>обем на урината (mL/min × 50)</span><span><i class="dash" style="border-color:var(--muted)"></i>осмолалитет на плазмата</span></div>
   <div class="grid2" style="grid-template-columns:1fr 1fr"><div id="tbc1"></div><div id="tbc2"></div></div></div>
  <h3>Експерименти</h3><div id="ex"></div>`;
  const sel=$("#tbPre");sel.innerHTML=Object.entries(TUB_PRE).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("");
  const S={},n=()=>upd();
  S.adh=slider($("#tbc1"),{label:"ADH (вазопресин)",min:0,max:100,step:1,value:25,show:v=>fmt(v/10,1)+" pg/mL"},n);
  S.resp=slider($("#tbc1"),{label:"Отговор на V2 рецепторите",min:0,max:100,step:1,value:100,unit:"%"},n);
  S.aldo=slider($("#tbc1"),{label:"Алдостерон",min:20,max:300,step:5,value:100,unit:"%"},n);
  S.urea=slider($("#tbc1"),{label:"Урея (белтъци в храната)",min:20,max:150,step:5,value:100,unit:"%"},n);
  S.tal=slider($("#tbc2"),{label:"NKCC2 в дебелия сегмент",min:5,max:100,step:5,value:100,unit:"%",hint:"фуроземид ↓"},n);
  S.dct=slider($("#tbc2"),{label:"NCC в дисталния тубул",min:5,max:100,step:5,value:100,unit:"%",hint:"тиазиди ↓"},n);
  S.enac=slider($("#tbc2"),{label:"ENaC в събирателния канал",min:5,max:100,step:5,value:100,unit:"%",hint:"амилорид ↓"},n);
  S.vr=slider($("#tbc2"),{label:"Кръвоток във vasa recta",min:40,max:300,step:5,value:100,unit:"%",hint:"по-голям — промива градиента"},n);
  S.load=slider($("#tbc2"),{label:"Нереабсорбируеми осмоли",min:100,max:400,step:10,value:100,unit:"%",hint:"манитол, глюкоза ↑"},n);
  const par=()=>({adh:S.adh.get()/100,resp:S.resp.get()/100,aldo:S.aldo.get()/100,urea:S.urea.get()/100,tal:S.tal.get()/100,dct:S.dct.get()/100,enac:S.enac.get()/100,vr:S.vr.get()/100,load:S.load.get()/100});
  let R=tubCalc(TUB_N),seg=null,flow=[];
  const setPre=k=>{const v=Object.assign({},TUB_N,TUB_PRE[k].o);sel.value=k;S.adh.set(v.adh*100);S.resp.set(v.resp*100);S.aldo.set(v.aldo*100);S.urea.set(v.urea*100);S.tal.set(v.tal*100);S.dct.set(v.dct*100);S.enac.set(v.enac*100);S.vr.set(v.vr*100);S.load.set(v.load*100);$("#tbN").innerHTML=TUB_INFO[k];linkTerms($("#tbN"));upd()};
  sel.onchange=()=>setPre(sel.value);
  const showSeg=k=>{seg=k;const s=TUB_SEG.find(x=>x.k===k);$("#tbSeg").innerHTML=s?`<b>${s.n}:</b> ${s.d}`:"Докосни сегмент от нефрона.";linkTerms($("#tbSeg"))};
  // геометрия: кора 20–130, външна медула 130–250, вътрешна 250–390
  const P=[];const addP=(k,pts)=>pts.forEach(q=>P.push({k,x:q[0],y:q[1]}));
  const wig=(x0,y0,x1,y1,n,a)=>{const o=[];for(let i=0;i<=n*8;i++){const u=i/(n*8);o.push([x0+(x1-x0)*u+Math.sin(u*n*6.283)*a*0.4,y0+(y1-y0)*u+Math.sin(u*n*6.283)*a])}return o};
  addP("pct",wig(118,62,236,104,3,14));
  const lin=(x0,y0,x1,y1,n)=>{const o=[];for(let i=1;i<=n;i++){const u=i/n;o.push([x0+(x1-x0)*u,y0+(y1-y0)*u])}return o};
  addP("dtl",lin(236,104,250,365,30));addP("dtl",[[254,374],[262,378]]);addP("atl",[[270,374]].concat(lin(274,365,280,240,14)));addP("tal",lin(280,240,288,110,16));
  addP("dct",wig(288,110,390,70,2,12));addP("cd",lin(390,70,440,80,6).concat(lin(440,80,446,380,34)));
  const segOf=(i)=>P[i].k;
  function osmAt(i){const q=P[i],dep=y=>y<130?300:300+(R.Mp-300)*Math.min(1,(y-130)/250);
    if(q.k==="pct")return 300;if(q.k==="dtl")return dep(q.y);if(q.k==="atl")return dep(q.y)-30*Math.min(1,(380-q.y)/140);
    if(q.k==="tal"){const u=(240-q.y)/130;return (dep(240)-30)+((R.Otal)-(dep(240)-30))*Math.max(0,Math.min(1,u))}
    if(q.k==="dct"){const j=P.findIndex(z=>z.k==="dct"),m=P.filter(z=>z.k==="dct").length,u=(i-j)/m;return R.Otal+(R.Odct-R.Otal)*u}
    // събирателен канал
    if(q.y<130)return R.Odct+(R.Occd-R.Odct)*Math.min(1,(q.x-390)/50+(q.y-70)/200);return R.Occd+(R.U-R.Occd)*Math.min(1,(q.y-130)/250)}
  const oc=o=>{const u=Math.max(0,Math.min(1,(o-50)/1150));const r=Math.round(255-u*20),gg=Math.round(240-u*150),b=Math.round(200-u*170);return `rgb(${r},${gg},${b})`};
  $("#tbC").onclick=ev=>{const cv=$("#tbC"),rc=cv.getBoundingClientRect(),W=rc.width,H=rc.height,k=Math.min(W/700,H/400),x=(ev.clientX-rc.left-(W-700*k)/2)/k,y=(ev.clientY-rc.top-(H-400*k)/2)/k;let bi=-1,bd=1e9;P.forEach((q,i)=>{const d=Math.hypot(q.x-x,q.y-y);if(d<bd){bd=d;bi=i}});if(bd<26)showSeg(P[bi].k)};
  function draw(dt){const c=rcv($("#tbC"));if(!c)return;const {g,W,H}=c,k=Math.min(W/700,H/400);g.save();g.translate((W-700*k)/2,(H-400*k)/2);g.scale(k,k);
    // интерстициум
    for(let y=20;y<390;y+=4){const o=y<130?300:300+(R.Mp-300)*Math.min(1,(y-130)/250);g.fillStyle=oc(o);g.globalAlpha=0.45;g.fillRect(90,y,410,4)}g.globalAlpha=1;
    g.strokeStyle=css("--line");g.setLineDash([4,4]);g.beginPath();g.moveTo(90,130);g.lineTo(500,130);g.moveTo(90,250);g.lineTo(500,250);g.stroke();g.setLineDash([]);
    g.fillStyle=css("--muted");g.font=RFONT(11,700);g.textAlign="left";g.fillText("кора",96,36);g.fillText("външна медула",96,146);g.fillText("вътрешна медула",96,266);
    g.textAlign="right";g.fillText("300",496,36);g.fillText(fmt(300+(R.Mp-300)*0.48,0),496,256);g.fillText(fmt(R.Mp,0)+" mOsm/kg",430,394);
    // гломерул
    g.fillStyle="#ffe3e3";g.strokeStyle="#c47f0e";g.lineWidth=2;g.beginPath();g.arc(104,58,18,0,7);g.fill();g.stroke();g.fillStyle="#e03131";g.beginPath();g.arc(104,58,10,0,7);g.fill();
    // тубул
    for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];if(Math.hypot(b.x-a.x,b.y-a.y)>30)continue;const w=b.k==="tal"?11:b.k==="pct"?11:b.k==="cd"?12:7;g.strokeStyle=seg===b.k?css("--ink"):"#8d6e63";g.lineWidth=w+3;g.lineCap="round";g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle=oc(osmAt(i));g.lineWidth=w;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
    // транспорт: стрелки
    const p=par(),t=performance.now()/1000;
    const pump=(x,y,dx,dy,col,a)=>{if(a<0.05)return;g.globalAlpha=Math.min(1,0.25+a);rArrow(g,x,y,x+dx*(10+6*Math.sin(t*4+y)),y+dy*(10+6*Math.sin(t*4+y)),col,2);g.globalAlpha=1};
    [150,185,215].forEach(y=>pump(244,y,-1,0,"#1c7ed6",0.7));[290,330].forEach(y=>pump(252,y,-1,0,"#1c7ed6",(R.Mp-300)/900));
    [140,170,200,230].forEach(y=>pump(292,y,1,0,"#e8590c",p.tal));pump(330,84,0,-1,"#e8590c",p.dct);
    [160,220,280,340].forEach(y=>pump(452,y,1,0,"#1c7ed6",R.ae));[300,350].forEach(y=>pump(440,y,-1,0,"#9c36b5",R.ae*p.urea));
    // течност
    if(Math.random()<dt*5)flow.push({i:0});flow=flow.filter(f=>{const q=P[Math.floor(f.i)];if(!q)return false;const loc=q.k==="pct"?1.0:q.k==="cd"?0.35+R.V*0.06:0.7;f.i+=dt*30*loc;const z=P[Math.floor(f.i)];if(!z)return false;g.fillStyle="#fff";g.globalAlpha=0.9;g.beginPath();g.arc(z.x,z.y,2.3,0,7);g.fill();g.globalAlpha=1;return true});
    // етикети
    const lab=(x,y,l,v,a)=>rTag(g,x,y,[l,v],{fs:11,a:a||"l"});
    lab(130,108,"проксимален",`300 · ${fmt(44,0)} mL/min`);lab(160,330,"връх на бримката",`${fmt(R.Mp,0)} · ${fmt(R.fTip,0)} mL/min`);lab(300,200,"дебел възх. сегмент",`→ ${fmt(R.Otal,0)} mOsm/kg`);
    lab(330,34,"дистален тубул",`${fmt(R.Odct,0)} mOsm/kg`);lab(462,96,"кортикален СК",`${fmt(R.Occd,0)} mOsm/kg`);
    rTag(g,520,300,["урина",`${fmt(R.U,0)} mOsm/kg`,`${fmt(R.V,R.V<2?2:1)} mL/min`],{fs:12.5,c:css("--accent")});rArrow(g,450,384,516,330,css("--accent"),2);
    g.fillStyle=css("--muted");g.font=RFONT(10.5,600);g.textAlign="left";g.fillText("→ вода",520,150);g.fillStyle="#1c7ed6";g.fillRect(508,144,8,3);g.fillStyle=css("--muted");g.fillText("→ NaCl",520,166);g.fillStyle="#e8590c";g.fillRect(508,160,8,3);g.fillStyle=css("--muted");g.fillText("→ урея",520,182);g.fillStyle="#9c36b5";g.fillRect(508,176,8,3);
    g.fillStyle=css("--muted");g.fillText("цвят = осмолалитет",508,206);for(let i=0;i<10;i++){g.fillStyle=oc(50+i*125);g.fillRect(508+i*14,212,14,8)}g.fillText("50",508,232);g.textAlign="right";g.fillText("1200",648,232);
    g.restore()}
  function upd(){const p=par();R=tubCalc(p);
    $("#tbS").innerHTML=statsHTML([["Осмолалитет на урината",fmt(R.U,0)+" mOsm/kg"],["Обем на урината",fmt(R.V,2)+" mL/min ("+fmt(R.V*1.44,1)+" L/ден)"],["Връх на папилата",fmt(R.Mp,0)+" mOsm/kg"],["Осмоларен клирънс",fmt(R.Cosm,2)+" mL/min"],["Свободен воден клирънс",(R.CH2O>0?"+":"")+fmt(R.CH2O,2)+" mL/min"],["Na⁺ в урината",fmt(R.UNa*1440,0)+" mmol/ден"],["K⁺ в урината",fmt(R.UK*1440,0)+" mmol/ден"]]);
    const xs=[],u=[],v=[];for(let a=0;a<=100;a+=2){const q=tubCalc(Object.assign({},p,{adh:a/100}));xs.push(a/10);u.push(q.U);v.push(Math.min(1300,q.V*50))}
    plot($("#tbG"),{xmin:0,xmax:10,ymin:0,ymax:1300,xlabel:"ADH, pg/mL",ylabel:"mOsm/kg; mL/min × 50",hlines:[{y:290,color:css("--muted"),label:"плазма"}],series:[{x:xs,y:u,color:css("--accent"),width:2.4},{x:xs,y:v,color:css("--accent2"),width:2.2}],marks:[{x:p.adh*10,y:R.U,color:css("--ink"),label:"сега"}]});
    const fr=[["Проксимален тубул",65,"#2b8a5a"],["Бримка на Хенле",25*p.tal,"#e8590c"],["Дистален тубул",5*p.dct,"#c47f0e"],["Събирателен канал",4*p.enac*Math.min(1.6,p.aldo),"#9c36b5"]],tot=fr.reduce((a,b)=>a+b[1],0);
    $("#tbB").innerHTML=`<div class="small" style="font-weight:700;margin:4px 0 6px">Реабсорбция на филтрирания Na⁺ по сегменти</div>`+fr.map(([l,v,c])=>`<div style="display:grid;grid-template-columns:8.5em 1fr 3.4em;gap:6px;align-items:center;margin:4px 0" class="small"><span>${l}</span><div style="background:var(--chip);height:12px;border-radius:4px;overflow:hidden"><div style="width:${v/70*100}%;height:100%;background:${c}"></div></div><span>${fmt(v,1)} %</span></div>`).join("")+`<div class="small" style="margin-top:6px;color:var(--muted)">Общо ${fmt(Math.min(99.9,tot),1)} % · в урината ≈ ${fmt(Math.max(0.1,100-tot),1)} %</div>`}
  setPre("normal");showSeg(null);
  if(typeof k3Mount==="function")k3Mount("tubule",$("#tbC"),()=>({R,p:par(),seg,pick:k=>showSeg(k)}));
  experiments($("#ex"),EXP_TUB,"tubule",e=>{setPre(e.pre);if(e.seg)showSeg(e.seg);$("#tbC").scrollIntoView({behavior:"smooth",block:"center"})});
  rLoop($("#tbC"),dt=>draw(dt));window.onresize=()=>upd();
}
function vrInit(){return {t:0,TBW:42,NaE:1960,RBC:2.0,ICFos:8260,ADH:2.6,K:4.2,ren:1,ang:1,aldo:1,aldoE:1,anp:1,q:[],inW:0,inNa:0,outW:0,outNa:0,V:0.8,U:600,UNa:0.1}}
function vrDer(s,o){const Posm=(s.ICFos+2*s.NaE)/s.TBW,ECF=2*s.NaE/Posm,ICF=s.ICFos/Posm,PV=ECF*0.214,BV=PV+s.RBC,Na=(Posm-10)/2;
  const MAP=93*Math.pow(BV/5,0.8)*Math.pow(Math.max(0.05,s.ang),0.06);
  let ADHt=Math.max(0,0.33*(Posm-282))+0.6*(Math.exp(Math.max(0,1-BV/5)*12)-1)+0.5*Math.max(0,s.ang-1)*0.3;
  if(o.cdi)ADHt=0;if(o.siadh)ADHt=Math.max(ADHt,8);
  let rent=Math.exp(-(MAP-93)/10)*Math.pow(Na/140,-3)*Math.pow(Math.max(0.2,s.anp),-0.5);if(o.ace)rent*=2.5;
  const angt=o.ace?s.ren*0.12:s.ren;let aldt=Math.pow(Math.max(0.02,s.ang),0.9)*Math.pow(s.K/4.2,2);if(o.conn)aldt=4;if(o.addison)aldt=0.05;
  const anpt=Math.exp(3*(BV/5-1));
  return {Posm,ECF,ICF,PV,BV,Na,MAP,ADHt,rent,angt,aldt,anpt}}
function vrKid(s,o,D){const resp=o.ndi?0.03:1,angE=o.arb?1:Math.max(0.05,s.ang);
  const UNa=0.1*Math.pow(D.MAP/93,4)*Math.pow(D.ECF/14,3)*Math.pow(angE,-0.4)*Math.pow(Math.max(0.03,s.aldoE),-0.6)*Math.pow(Math.max(0.1,s.anp),0.6);
  const T=tubCalc({adh:Math.min(1,s.ADH/10),resp,tal:1,dct:1,enac:1,aldo:Math.max(0.2,Math.min(3,s.aldoE)),vr:1,urea:1,load:1});
  const UK=0.06*Math.pow(Math.max(0.03,s.aldoE),0.8)*Math.pow(s.K/4.2,1.5)*Math.pow(Math.max(0.3,T.V/0.8),0.15);const Sx=2*UNa+0.28;let U=T.U;U=Math.max(50,Math.min(1200,U));const V=Sx*1000/U;return {UNa,U,V,Sx,UK}}
let VR_BASE=null;
function vrBase(){if(VR_BASE)return VR_BASE;const s=vrInit(),D=vrDer(s,{}),K=vrKid(s,{},D);VR_BASE={w:K.V+0.6,na:K.UNa,k:K.UK};return VR_BASE}
function vrStep(s,o,dt){const D=vrDer(s,o),K=vrKid(s,o,D),B=vrBase();
  let w=o.wIn!=null?o.wIn/1.44:B.w,na=o.naIn!=null?o.naIn/1440:B.na;s.q=s.q.filter(e=>{w+=e.w;na+=e.na;e.d-=dt;return e.d>0});
  if(o.thirst&&(D.Posm>293||D.BV<4.55))w+=6;
  s.TBW+=(w-K.V-0.6)/1000*dt;s.NaE+=(na-K.UNa)*dt;s.TBW=Math.max(25,s.TBW);s.NaE=Math.max(800,s.NaE);
  s.inW+=w*dt;s.outW+=(K.V+0.6)*dt;s.inNa+=na*dt;s.outNa+=K.UNa*dt;
  const r=(x,tg,tau)=>x+(tg-x)*Math.min(1,dt/tau);
  s.K=Math.max(1.5,Math.min(9,s.K+(B.k-K.UK)*dt/250));s.ADH=r(s.ADH,D.ADHt,3);s.ren=r(s.ren,D.rent,10);s.ang=r(s.ang,D.angt,2);s.aldo=r(s.aldo,D.aldt,25);s.aldoE=r(s.aldoE,s.aldo,60);s.anp=r(s.anp,D.anpt,5);
  s.UK=K.UK;s.V=K.V;s.U=K.U;s.UNa=K.UNa;s.t+=dt;return D}
const VR_EV={water:{n:"Изпий 1 L вода",f:s=>s.q.push({w:100,na:0,d:10})},saline:{n:"1 L физиологичен разтвор i.v.",f:s=>s.q.push({w:100,na:15.4,d:10})},salt:{n:"Солена храна (9 g сол)",f:s=>s.q.push({w:0,na:15.4,d:10})},
 hyper:{n:"500 mL 3 % NaCl i.v.",f:s=>s.q.push({w:50,na:25.6,d:10})},bleed:{n:"Кръвозагуба 1 L",f:s=>{s.RBC-=0.4;const P=(s.ICFos+2*s.NaE)/s.TBW;s.TBW-=0.6;s.NaE-=0.6*P/2}},sweat:{n:"Изпотяване 2 L (2 h)",f:s=>s.q.push({w:-16.7,na:-0.42,d:120})}};
const VR_INFO={
 base:"Две отделни системи: <b>осмолалитетът</b> се пази от ADH и жаждата (контрол на водата), а <b>обемът</b> — от РААС, ANP и налягането (контрол на Na⁺). Количеството Na⁺ определя обема на извънклетъчната течност, а водата — концентрацията на Na⁺.",
 water:"Плазменият осмолалитет пада с няколко mOsm/kg → осморецепторите в хипоталамуса спират ADH за минути → водна диуреза с разредена урина. Обемът почти не се променя, защото 2/3 от водата отива в клетките.",
 saline:"Изотоничната течност остава в извънклетъчното пространство: обемът расте, а осмолалитетът — не. ADH почти не се променя. Спадат ренинът, Ang II и алдостеронът, а ANP расте → Na⁺ и водата се отделят за часове.",
 salt:"Солта повишава осмолалитета → жажда и ADH → водата се задържа и обемът расте. Следва потискане на РААС и натриуреза. Без пиене Na⁺ в плазмата расте.",
 hyper:"Хипертоничният разтвор изтегля вода от клетките. Извънклетъчният обем расте, вътреклетъчният намалява. Използва се при мозъчен оток и тежка хипонатриемия.",
 bleed:"Изотонична загуба на обем — осмолалитетът не се променя, но барорецепторите отчитат спадналото налягане. Ренинът, Ang II и алдостеронът растат, ADH се отделя от обемния стимул (а не от осмоларния). С жажда възстановяването става по-бързо — но ако се пие само вода, Na⁺ пада.",
 sweat:"Потта е хипотонична: губи се повече вода, отколкото сол. Осмолалитетът и Na⁺ се повишават, обемът намалява — ADH и жаждата се включват силно.",
 siadh:"<b>SIADH:</b> ADH не се потиска въпреки ниския осмолалитет. Пиенето на вода продължава, водата се задържа и Na⁺ пада бавно. Обемът е нормален или леко повишен (няма отоци), натриурезата се запазва чрез ANP и потиснат РААС („бягство“).",
 cdi:"<b>Централен безвкусен диабет:</b> без ADH урината е много и разредена. Ако човек не може да пие (без жажда), Na⁺ бързо расте — хипернатриемия. С жажда той пие 8–15 L дневно и Na⁺ се запазва.",
 ndi:"<b>Нефрогенен безвкусен диабет:</b> ADH е висок, но бъбрекът не отговаря. Картината е като при централната форма, но десмопресинът не помага.",
 conn:"<b>Първичен хипералдостеронизъм:</b> задържане на Na⁺ и загуба на K⁺. Обемът расте само малко — повишеното налягане и ANP засилват натриурезата („алдостероново бягство“), затова няма отоци. Ренинът е потиснат, калият пада.",
 addison:"<b>Надбъбречна недостатъчност (Адисон):</b> без алдостерон Na⁺ се губи с урината, обемът и налягането падат, K⁺ се покачва. Ренинът е висок.",
 ace:"<b>ACE инхибитор:</b> Ang II и алдостеронът спадат, налягането пада, натриурезата расте. Ренинът се повишава (няма обратна връзка). Калият може леко да се покачи."};
const EXP_VR=[
 {q:"Изпиваш 1 L вода. Кой хормон се променя най-бързо?",opts:["Алдостеронът","ADH (спада за минути)","Ренинът"],a:1,set:{ev:"water"},expl:"Осморецепторите реагират на 1–2 % промяна на осмолалитета. ADH има полуживот около 15 min, затова водната диуреза започва след 15–30 min."},
 {q:"Вливат се 1 L физиологичен разтвор. Какво става с ADH?",opts:["Силно се повишава","Почти не се променя — осмолалитетът е същият","Спира напълно"],a:1,set:{ev:"saline"},expl:"Изотоничният разтвор променя обема, а не осмолалитета. Реагират РААС и ANP, а не ADH."},
 {q:"След кръвозагуба 1 L защо се отделя ADH, след като осмолалитетът е нормален?",opts:["Заради ниския Na⁺","Обемният (барорецепторен) стимул е достатъчно силен","Заради алдостерона"],a:1,set:{ev:"bleed"},expl:"При загуба над ≈ 10 % от обема барорецепторите силно стимулират ADH — той се отделя дори при нормален осмолалитет."},
 {q:"SIADH: какъв е обемът на извънклетъчната течност?",opts:["Силно намален","Нормален или леко повишен — без отоци","Огромен, с отоци"],a:1,set:{cond:"siadh"},expl:"Задържаната вода се разпределя главно в клетките, а натриурезата продължава. Затова хипонатриемията е еуволемична."},
 {q:"Централен безвкусен диабет без достъп до вода. Какво ще стане с Na⁺?",opts:["Ще падне","Ще се покачи (хипернатриемия)","Няма да се промени"],a:1,set:{cond:"cdi",thirst:0},expl:"Губи се свободна вода. Включи „Жажда и пиене“ и сравни — пиенето компенсира загубата."},
 {q:"Първичен хипералдостеронизъм: какво става с K⁺ и ренина?",opts:["K⁺ ↑, ренин ↑","K⁺ ↓, ренин ↓","K⁺ ↓, ренин ↑"],a:1,set:{cond:"conn"},expl:"Алдостеронът засилва секрецията на K⁺. Задържането на Na⁺ и повишеното налягане потискат ренина."}];
function viewVolReg(main){
  main.innerHTML=`<h2>Регулация на обема и осмолалитета (ADH, РААС)</h2><p class="lead">Цялото тяло като затворен модел: вода и Na⁺ в клетките и извън тях, осморецептори и ADH, барорецептори, ренин–ангиотензин–алдостерон и предсърден натриуретичен пептид. Изпий вода, влей разтвор или предизвикай заболяване и гледай как бъбрекът връща равновесието.</p>
  <div class="card" style="padding:10px"><div class="btns" id="vrEv">${Object.entries(VR_EV).map(([k,v])=>`<button class="b" data-e="${k}">${v.n}</button>`).join("")}</div>
   <div class="btns"><select id="vrCond" style="width:auto;max-width:100%"><option value="">Без заболяване</option><option value="siadh">SIADH</option><option value="cdi">Централен безвкусен диабет</option><option value="ndi">Нефрогенен безвкусен диабет</option><option value="conn">Хипералдостеронизъм (Conn)</option><option value="addison">Болест на Адисон</option><option value="ace">ACE инхибитор</option></select><label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="vrTh"> Жажда и пиене</label><button class="b" id="vrRs">Начало ↺</button><button class="b" id="vrPl">⏸︎ Пауза</button><label class="small" style="display:flex;align-items:center;gap:6px">1 s =<select id="vrSp" style="width:auto"><option value="1">1 min</option><option value="5" selected>5 min</option><option value="20">20 min</option><option value="60">1 h</option></select></label></div>
   <canvas id="vrC" style="width:100%;height:380px;display:block;margin-top:6px"></canvas>
   <div class="stats" id="vrS" style="margin-top:8px"></div>
   <div class="note" id="vrN" style="min-height:4.6em"></div>
   <div class="grid2" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px"><canvas class="plot" id="vrA" style="height:200px"></canvas><canvas class="plot" id="vrB" style="height:200px"></canvas></div>
   <div class="legend"><span><i style="background:var(--accent2)"></i>Na⁺ (mmol/L − 100)</span><span><i style="background:var(--accent3)"></i>извънклетъчен обем × 2 (L)</span><span><i style="background:var(--accent4)"></i>урина × 10 (mL/min)</span><span><i style="background:var(--accent5)"></i>ADH (pg/mL)</span><span><i style="background:var(--accent)"></i>Ang II (× норма)</span><span><i class="dash" style="border-color:var(--accent4)"></i>алдостерон (× норма)</span><span><i class="dash" style="border-color:var(--accent3)"></i>ANP (× норма)</span></div>
   <div class="grid2" style="grid-template-columns:1fr 1fr"><div id="vrc1"></div><div id="vrc2"></div></div></div>
  <h3>Експерименти</h3><div id="ex"></div>`;
  const B=vrBase(),Sw=slider($("#vrc1"),{label:"Обичаен прием на вода",min:0.5,max:6,step:0.1,value:+(B.w*1.44).toFixed(1),d:1,unit:"L/ден"},()=>{}),Sn=slider($("#vrc2"),{label:"Прием на сол (Na⁺)",min:20,max:400,step:5,value:Math.round(B.na*1440/5)*5,unit:"mmol/ден",hint:"≈ 17 mmol = 1 g сол"},()=>{});
  const cond=$("#vrCond"),th=$("#vrTh");let s,hist,ref,st={play:1,sp:5};
  const opts=()=>{const c=cond.value;return {siadh:c==="siadh",cdi:c==="cdi",ndi:c==="ndi",conn:c==="conn",addison:c==="addison",ace:c==="ace",thirst:th.checked,wIn:Sw.get(),naIn:Sn.get()}};
  const reset=()=>{s=vrInit();const o=opts();o.siadh=o.cdi=o.ndi=o.conn=o.addison=o.ace=false;for(let i=0;i<600;i++)vrStep(s,o,0.5);ref={ang:s.ang,aldo:s.aldo,anp:s.anp,ren:s.ren};s.t=0;s.inW=s.outW=s.inNa=s.outNa=0;hist=[];info("base")};
  const info=k=>{$("#vrN").innerHTML=VR_INFO[k]||VR_INFO.base;linkTerms($("#vrN"))};
  $("#vrEv").querySelectorAll("button").forEach(b=>b.onclick=()=>{VR_EV[b.dataset.e].f(s);info(b.dataset.e)});
  cond.onchange=()=>info(cond.value||"base");$("#vrRs").onclick=()=>{cond.value="";reset()};
  $("#vrPl").onclick=()=>{st.play^=1;$("#vrPl").textContent=st.play?"⏸︎ Пауза":"▶︎ Пусни"};$("#vrSp").onchange=e=>st.sp=+e.target.value;
  let D=null,pulses=[];
  function sim(dt){const o=opts(),M=dt*st.sp,n=Math.max(1,Math.ceil(M/0.1));for(let i=0;i<n;i++)D=vrStep(s,o,M/n);if(!hist.length||s.t-hist[hist.length-1][0]>=Math.max(1,st.sp/5))hist.push([s.t,D.Na-100,D.ECF*2,s.V*10,s.ADH,s.ang/ref.ang,s.aldo/ref.aldo,s.anp/ref.anp]);if(hist.length>2000)hist.shift()}
  function draw(dt){if(!D)D=vrDer(s,opts());const c=rcv($("#vrC"));if(!c)return;const {g,W,H}=c,k=Math.min(W/700,H/380);g.save();g.translate((W-700*k)/2,(H-380*k)/2);g.scale(k,k);
    const o=opts();
    // отделения на телесната вода
    const sc=5.2,bx=20,by=360,bar=(x,v,col,l1,l2,hh)=>{const h=v*sc;g.fillStyle=col;g.fillRect(x,by-h,46,h);g.strokeStyle=css("--line");g.strokeRect(x,by-h,46,h);g.fillStyle=css("--ink");g.font=RFONT(11,700);g.textAlign="center";g.fillText(l1,x+23,by-h-18);g.font=RFONT(10.5);g.fillStyle=css("--muted");g.fillText(l2,x+23,by-h-5)};
    bar(bx,D.ICF,"rgba(28,126,214,.25)","в клетките",fmt(D.ICF,1)+" L");bar(bx+56,D.ECF-D.PV,"rgba(43,138,90,.25)","интерстиций",fmt(D.ECF-D.PV,1)+" L");bar(bx+112,D.PV,"rgba(224,49,49,.3)","плазма",fmt(D.PV,1)+" L");
    g.strokeStyle=css("--muted");g.setLineDash([3,3]);g.beginPath();g.moveTo(bx,by-28*sc);g.lineTo(bx+46,by-28*sc);g.moveTo(bx+56,by-10.5*sc);g.lineTo(bx+102,by-10.5*sc);g.moveTo(bx+112,by-3*sc);g.lineTo(bx+158,by-3*sc);g.stroke();g.setLineDash([]);
    g.fillStyle=css("--muted");g.font=RFONT(10.5,600);g.textAlign="left";g.fillText("пунктир — норма",bx,by+14);
    // органи
    const node=(x,y,l,sub,a,col)=>{g.globalAlpha=0.3+0.7*Math.max(0,Math.min(1,a));rTag(g,x,y,[l,sub],{fs:11.5,c:col,st:col,a:"c",op:0.96});g.globalAlpha=1};
    const ADHn=Math.min(1,s.ADH/6),An=Math.min(1,s.ang/ref.ang/2.5),Aln=Math.min(1,s.aldo/ref.aldo/2.5),ANn=Math.min(1,s.anp/ref.anp/2),Rn=Math.min(1,s.ren/ref.ren/2.5);
    node(300,16,"Хипоталамус",`осморецептори · ${fmt(D.Posm,0)} mOsm/kg`,Math.min(1,Math.abs(D.Posm-288)/8+0.4),"#7048e8");
    node(300,70,"Задна хипофиза",`ADH ${fmt(s.ADH,1)} pg/mL`,ADHn,"#7048e8");
    node(560,16,"Сърце (предсърдия)",`ANP × ${fmt(s.anp/ref.anp,2)}`,ANn,"#2b8a5a");
    node(560,92,"Барорецептори",`САН ${fmt(D.MAP,0)} mmHg`,Math.min(1,Math.abs(D.MAP-92)/10+0.3),"#1c7ed6");
    node(440,190,"Бъбрек — ЮГА",`ренин × ${fmt(s.ren/ref.ren,2)}`,Rn,"#e8590c");
    node(260,190,"Черен дроб",`ангиотензиноген`,0.7,"#868e96");
    node(260,262,"Бели дробове (ACE)",o.ace?"блокиран ACE":`Ang I → Ang II × ${fmt(s.ang/ref.ang,2)}`,An,"#e03131");
    node(600,262,"Надбъбрек",`алдостерон × ${fmt(s.aldo/ref.aldo,2)}`,Aln,"#c47f0e");
    node(440,320,"Събирателен канал",`урина ${fmt(s.V,2)} mL/min · ${fmt(s.U,0)} mOsm/kg`,0.9,"#1a2533");
    if(o.thirst&&(D.Posm>293||D.BV<4.55))node(300,128,"Жажда → пиене","",1,"#1c7ed6");
    // пътища с импулси
    const paths=[[[300,48],[300,70],ADHn,"#7048e8"],[[330,96],[420,320],ADHn,"#7048e8"],[[600,48],[600,92],0.6,"#1c7ed6"],[[560,118],[470,190],Rn,"#e8590c"],[[440,216],[300,206],Rn,"#e8590c"],[[260,216],[260,262],An,"#e03131"],[[330,276],[560,276],An,"#e03131"],[[600,290],[480,322],Aln,"#c47f0e"],[[540,42],[470,320],ANn,"#2b8a5a"],[[220,262],[240,60],An*0.7,"#e03131"]];
    paths.forEach(([a,b,v,col])=>{g.strokeStyle=col;g.globalAlpha=0.25+0.5*v;g.lineWidth=1.5+2*v;g.setLineDash([5,4]);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();g.setLineDash([]);g.globalAlpha=1});
    paths.forEach((p,i)=>{if(Math.random()<dt*8*p[2])pulses.push({i,u:0})});
    pulses=pulses.filter(q=>{q.u+=dt*0.7;const [a,b,,col]=paths[q.i];g.fillStyle=col;g.beginPath();g.arc(a[0]+(b[0]-a[0])*q.u,a[1]+(b[1]-a[1])*q.u,3.5,0,7);g.fill();return q.u<1});
    g.fillStyle=css("--muted");g.font=RFONT(10,600);g.textAlign="center";g.fillText("Ang II → жажда, ADH",205,150);g.fillText("Ang II → съдове, проксимален тубул",420,250);
    g.restore()}
  function stats(){if(!D)return;$("#vrS").innerHTML=statsHTML([["Na⁺ в плазмата",fmt(D.Na,0)+" mmol/L"],["K⁺ в плазмата",fmt(s.K,1)+" mmol/L"],["Осмолалитет",fmt(D.Posm,0)+" mOsm/kg"],["Извънклетъчен обем",fmt(D.ECF,1)+" L"],["Кръвен обем",fmt(D.BV,2)+" L"],["САН",fmt(D.MAP,0)+" mmHg"],["Урина",fmt(s.V,2)+" mL/min"],["Na⁺ в урината",fmt(s.UNa*1440,0)+" mmol/ден"],["Време",fmt(s.t/60,1)+" h"]]);
    const tm=hist.map(h=>(h[0]-s.t)/60),win=Math.max(1,Math.min(24,s.t/60));
    plot($("#vrA"),{xmin:-win,xmax:0,ymin:0,ymax:Math.max(70,Math.ceil(Math.max(0,...hist.map(h=>Math.max(h[1],h[2],h[3])))/10)*10),xlabel:"часове",ylabel:"",series:[{x:tm,y:hist.map(h=>h[1]),color:css("--accent2"),width:2.2},{x:tm,y:hist.map(h=>h[2]),color:css("--accent3"),width:2.2},{x:tm,y:hist.map(h=>h[3]),color:css("--accent4"),width:2}]});
    plot($("#vrB"),{xmin:-win,xmax:0,ymin:0,ymax:Math.max(6,Math.ceil(Math.max(0,...hist.map(h=>Math.max(h[4],h[5],h[6],h[7])))+0.5)),xlabel:"часове",ylabel:"",series:[{x:tm,y:hist.map(h=>h[4]),color:css("--accent5"),width:2.2},{x:tm,y:hist.map(h=>h[5]),color:css("--accent"),width:2.2},{x:tm,y:hist.map(h=>h[6]),color:css("--accent4"),width:2,dash:[5,4]},{x:tm,y:hist.map(h=>h[7]),color:css("--accent3"),width:2,dash:[5,4]}]})}
  reset();
  if(typeof k3Mount==="function")k3Mount("volreg",$("#vrC"),()=>({s,D,ref,o:opts(),sp:st.sp}));
  experiments($("#ex"),EXP_VR,"volreg",e=>{reset();if(e.ev){VR_EV[e.ev].f(s);info(e.ev)}if(e.cond){cond.value=e.cond;th.checked=!!e.thirst;if(e.cond==="siadh")Sw.set(3);info(e.cond)}$("#vrC").scrollIntoView({behavior:"smooth",block:"center"})});
  let fr=0;rLoop($("#vrC"),dt=>{if(st.play)sim(dt);draw(dt);if(++fr%6===0)stats()});window.onresize=()=>stats();
}
/* ---- схеми за раздели III и VI ---- */
(()=>{const {S,t,tt,box,ln,ar,cr,pth,RED,BLUE,GOLD,VIO,GRN}=BF._,F=BF,tint=(c,p)=>`color-mix(in srgb,${c} ${p||14}%,var(--panel))`;
 // фази на хемостазата
 F.hsPh=()=>{let b="";const P=[["1","Съдов спазъм","секунди","ендотелин, тромбоксан"],["2","Тромбоцитна тапа","1–3 min","vWF, GPIb, ADP, TXA₂"],["3","Съсирване","3–6 min","каскада → тромбин → фибрин"],["4","Ретракция и лизис","часове–дни","плазмин → D-димери"]];
  P.forEach(([n,a,c,d],i)=>{const x=6+i*150;b+=box(x,14,140,92,{f:tint([VIO,"#6f4bb2",GOLD,RED][i],14)})+t(x+70,36,n+". "+a,{fs:12,w:700})+t(x+70,54,c,{fs:11,c:"var(--muted)"})+tt(x+70,76,d.split(" → ").length>1?d.split(" → "):[d],{fs:10.5});if(i<3)b+=ar([[x+140,60],[x+150,60]],{w:2,h:6})});
  return S(600,116,b,"Четирите етапа на хемостазата")};
 // коагулационна каскада
 F.hsCas=()=>{let b="";const N=(x,y,l,o={})=>box(x-38,y-13,76,26,{f:o.f||"var(--chip)",st:o.st})+t(x,y+4,l,{fs:12,w:700});
  b+=N(70,24,"XII → XIIa")+N(70,74,"XI → XIa")+N(70,124,"IX → IXa")+N(170,124,"+ VIIIa, Ca²⁺");
  b+=N(330,124,"TF + VIIa",{f:tint(GOLD,18)});b+=N(200,186,"X → Xa")+N(300,186,"+ Va, Ca²⁺");b+=N(200,240,"II → тромбин",{f:tint(RED,16)});b+=N(200,294,"фибриноген",{f:tint(GOLD,12)})+N(330,294,"фибрин + XIIIa",{f:tint(GOLD,22)});
  b+=ar([[70,37],[70,61]])+ar([[70,87],[70,111]])+ar([[95,137],[180,172]])+ar([[320,137],[225,172]])+ar([[200,199],[200,227]])+ar([[200,253],[200,281]])+ar([[238,294],[292,294]]);
  b+=pth(`M238,236 C420,236 420,186 338,186`,{c:RED,w:1.5,dash:"4 3"})+pth(`M238,232 C430,200 260,110 208,118`,{c:RED,w:1.5,dash:"4 3"})+pth(`M238,228 C300,170 150,70 108,74`,{c:RED,w:1.5,dash:"4 3"});
  b+=t(250,268,"тромбин активира V, VIII, XI",{fs:10.5,c:RED,a:"start"});
  b+=box(4,4,140,152,{f:"none",st:BLUE,dash:"5 4"})+t(74,168,"вътрешен — aPTT",{fs:11,w:700,c:BLUE});
  b+=box(286,100,92,48,{f:"none",st:GOLD,dash:"5 4"})+t(332,164,"външен — PT",{fs:11,w:700,c:GOLD});
  b+=t(410,196,"общ път",{fs:11,w:700,c:"var(--muted)"});b+=t(80,300,"антитромбин III,",{fs:10.5,c:BLUE})+t(80,314,"протеини C и S, TFPI",{fs:10.5,c:BLUE});
  return S(460,326,b,"Коагулационна каскада")};
 // крива на дисоциация с изместванията
 F.hbC=()=>{let b="";const X=p=>40+p/110*380,Y=s=>210-s*190;[0,0.25,0.5,0.75,1].forEach(v=>{b+=ln(40,Y(v),420,Y(v),{c:"var(--grid)"})+t(34,Y(v)+4,String(v*100),{fs:10.5,a:"end",c:"var(--muted)"})});[0,20,40,60,80,100].forEach(p=>b+=t(X(p),226,String(p),{fs:10.5,c:"var(--muted)"}));
  const cur=(q,c,w,d)=>{const M=hbCalc(q),P=[];for(let p=0;p<=110;p+=2)P.push([X(p),Y(M.S(p))]);return pth(cr(P),{c,w:w||2.4,dash:d})};
  const base={pH:7.4,pco2:40,temp:37,dpg:100,hb:150,co:0,met:0,type:"A"};
  b+=cur(Object.assign({},base,{type:"M"}),VIO,1.8)+cur(Object.assign({},base,{type:"F"}),GRN,1.8)+cur(Object.assign({},base,{pH:7.2,temp:39,pco2:60}),BLUE,1.8,"5 4")+cur(base,RED,2.8);
  b+=ln(40,Y(0.5),X(26.8),Y(0.5),{c:"var(--muted)",dash:"3 3"})+ln(X(26.8),Y(0.5),X(26.8),210,{c:"var(--muted)",dash:"3 3"})+t(X(26.8),240,"P₅₀",{fs:10.5,c:"var(--muted)"});
  b+=t(X(9),Y(0.92),"Mb",{fs:11.5,w:700,c:VIO})+t(X(19),Y(0.86),"HbF",{fs:11.5,w:700,c:GRN})+t(X(64),Y(0.83),"HbA",{fs:11.5,w:700,c:RED})+tt(X(78),Y(0.55),["надясно:","pH↓ CO₂↑ T↑ 2,3-BPG↑"],{fs:10.5,c:BLUE});
  b+=t(230,254,"P_O₂, mmHg",{fs:11,c:"var(--muted)"})+t(12,110,"насищане, %",{fs:11,r:-90,c:"var(--muted)"});
  return S(440,262,b,"Крива на дисоциация на оксихемоглобина")};
 // ABO таблица
 F.abo=()=>{let b="";const G=[["A","A","анти-B"],["B","B","анти-A"],["AB","A и B","няма"],["O","няма","анти-A и анти-B"]];
  b+=t(60,20,"група",{fs:11.5,w:700,c:"var(--muted)"})+t(180,20,"антиген по еритроцита",{fs:11.5,w:700,c:"var(--muted)"})+t(330,20,"антитела в плазмата",{fs:11.5,w:700,c:"var(--muted)"});
  G.forEach(([g,a,ab],i)=>{const y=34+i*46;b+=box(20,y,80,38,{f:tint(RED,10)})+t(60,y+25,g,{fs:16,w:700});
   const cx=180,cy=y+19;b+=`<ellipse cx="${cx}" cy="${cy}" rx="22" ry="15" fill="#e8a5a5" stroke="#c92a2a"/>`;if(/A/.test(a))b+=`<rect x="${cx-26}" y="${cy-4}" width="7" height="7" fill="${BLUE}"/>`;if(/B/.test(a))b+=`<polygon points="${cx+22},${cy-6} ${cx+30},${cy} ${cx+22},${cy+6}" fill="${GOLD}"/>`;b+=t(cx+48,cy+4,a,{fs:11.5,a:"start"});
   b+=t(330,cy+4,ab,{fs:12})});
  return S(420,222,b,"Антигени и антитела в системата AB0")};
 // гломерулни сили
 F.glom=()=>{let b="";b+=`<circle cx="210" cy="120" r="96" fill="${tint(GOLD,10)}" stroke="#c47f0e" stroke-width="2.5"/>`;b+=pth(`M20,60 L140,104 C150,40 270,40 270,104 C330,110 330,170 270,170 C270,214 150,214 140,150 L20,190`,{c:RED,w:12});
  b+=t(30,46,"аферентна",{fs:11.5,w:700,a:"start"})+t(30,214,"еферентна",{fs:11.5,w:700,a:"start"});
  b+=ar([[300,72],[340,48]],{c:GRN,w:2.4})+t(350,44,"P_GC 60",{fs:12,w:700,c:GRN,a:"start"});b+=ar([[340,120],[306,120]],{c:VIO,w:2.4})+t(350,124,"π_GC 32",{fs:12,w:700,c:VIO,a:"start"});b+=ar([[340,190],[300,170]],{c:BLUE,w:2.4})+t(350,196,"P_B 18",{fs:12,w:700,c:BLUE,a:"start"});
  b+=t(210,124,"60 − 18 − 32 = 10 mmHg",{fs:12.5,w:700})+t(210,142,"× K_f 12,5 → GFR 125 mL/min",{fs:11.5,c:"var(--muted)"});
  return S(440,236,b,"Сили, които определят гломерулната филтрация")};
 // нефрон: дял на реабсорбцията
 F.neph=()=>{let b="";const Sg=[["Проксимален тубул","65 % Na⁺ и вода","глюкоза, аминокиселини, HCO₃⁻",GRN],["Бримка на Хенле","25 % Na⁺, 15 % вода","NKCC2 · градиент",GOLD],["Дистален тубул","5 % Na⁺","NCC · Ca²⁺ (PTH)",VIO],["Събирателен канал","3–5 % Na⁺, вода по ADH","ENaC, ROMK, AQP2",BLUE]];
  Sg.forEach(([a,c,d,col],i)=>{const y=8+i*58;b+=box(10,y,420,50,{f:tint(col,14)})+t(22,y+20,a,{fs:12.5,w:700,a:"start"})+t(22,y+38,d,{fs:11,c:"var(--muted)",a:"start"})+t(418,y+30,c,{fs:12,w:700,a:"end"})});
  return S(440,242,b,"Какво се реабсорбира в отделните сегменти")};
 // противотоков умножител
 F.cc=()=>{let b="";const Y=[30,80,130,180,230],O=[[300,300,100],[500,500,300],[700,700,500],[900,900,700],[1200,1200,1000]];
  Y.forEach((y,i)=>{const [d,ins,a]=O[i];b+=box(40,y-18,70,36,{f:tint(BLUE,8)})+t(75,y+4,d,{fs:12,w:700});b+=box(130,y-18,90,36,{f:tint(GOLD,16)})+t(175,y+4,ins,{fs:12,w:700});b+=box(240,y-18,70,36,{f:tint(GOLD,6)})+t(275,y+4,a,{fs:12,w:700});
   b+=ar([[240,y],[222,y]],{c:"#e8590c",w:2})+ar([[110,y-6],[128,y-6]],{c:BLUE,w:2})});
  b+=ar([[75,4],[75,10]],{c:"var(--ink)"})+t(75,262,"низходящо: вода излиза",{fs:10.5,c:BLUE})+t(275,262,"възходящо: NaCl излиза",{fs:10.5,c:"#e8590c"})+t(175,262,"интерстиций",{fs:10.5,c:"var(--muted)"});
  b+=t(360,40,"кора",{fs:11,a:"start",c:"var(--muted)"})+t(360,236,"папила",{fs:11,a:"start",c:"var(--muted)"})+t(360,140,"mOsm/kg",{fs:11,a:"start",c:"var(--muted)"});
  return S(420,272,b,"Противотоков умножител")};
 // РААС
 F.raas=()=>{let b="";const N=(x,y,w,l,s,col)=>box(x,y,w,40,{f:tint(col,14)})+t(x+w/2,y+17,l,{fs:12,w:700})+t(x+w/2,y+32,s,{fs:10.5,c:"var(--muted)"});
  b+=N(10,10,140,"↓ налягане, ↓ Na⁺","↑ симпатикус (β₁)",RED)+N(10,80,140,"ЮГА: ренин","",GOLD);b+=N(180,80,120,"ангиотензиноген","черен дроб",GRN)+N(180,150,120,"ангиотензин I","",GRN)+N(180,220,120,"ангиотензин II","ACE (бял дроб)",RED);
  b+=N(330,150,110,"надбъбрек","алдостерон",VIO)+N(330,220,110,"артериоли","вазоконстрикция",BLUE)+N(330,290,110,"хипоталамус","жажда, ADH",BLUE)+N(180,290,120,"бъбрек","↑ реабсорбция Na⁺",GOLD);
  b+=ar([[80,50],[80,78]])+ar([[150,100],[178,100]])+ar([[240,120],[240,148]])+ar([[240,190],[240,218]])+ar([[300,236],[330,176]])+ar([[300,240],[328,240]])+ar([[300,248],[330,300]])+ar([[240,260],[240,288]]);
  return S(450,340,b,"Система ренин–ангиотензин–алдостерон")};
 // ADH: осмоларен и обемен стимул
 F.adh=()=>{let b="";const X=v=>40+v/20*170,Y=v=>190-v/10*170;[0,2,4,6,8,10].forEach(v=>{b+=ln(40,Y(v),210,Y(v),{c:"var(--grid)"})+t(34,Y(v)+4,v,{fs:10,a:"end",c:"var(--muted)"})});
  const P=[];for(let o=270;o<=310;o+=2)P.push([40+(o-270)/40*170,Y(Math.max(0,0.33*(o-282)))]);b+=pth(cr(P),{c:VIO,w:2.4});[270,290,310].forEach(o=>b+=t(40+(o-270)/40*170,206,o,{fs:10,c:"var(--muted)"}));b+=t(125,222,"осмолалитет, mOsm/kg",{fs:10.5,c:"var(--muted)"});
  const Q=[];for(let d=0;d<=25;d+=1)Q.push([250+d/25*170,Y(Math.min(10,0.6*(Math.exp(d/100*12)-1)+2.6))]);b+=pth(cr(Q),{c:RED,w:2.4});[0,10,20].forEach(d=>b+=t(250+d/25*170,206,d,{fs:10,c:"var(--muted)"}));b+=t(335,222,"загуба на обем, %",{fs:10.5,c:"var(--muted)"});
  b+=t(125,16,"1–2 % промяна стига",{fs:11,w:700,c:VIO})+t(335,16,"нужни са > 10 %",{fs:11,w:700,c:RED})+t(14,110,"ADH, pg/mL",{fs:10.5,r:-90,c:"var(--muted)"});
  return S(440,230,b,"Стимули за отделяне на ADH")};
})();
Object.assign(BOOK,{
 hemost:{title:"Хемостаза и коагулационна каскада",adv:"рана в съд с тромбоцити и фибрин, каскада на факторите в реално време и лабораторни тестове",
  lead:"Хемостазата спира кървенето за минути и в същото време не позволява съсирекът да се разпространи. По Guyton, гл. 37.",
  secs:[
   {h:"Четирите етапа",fig:BF.hsPh(),html:`<p><b>1. Съдов спазъм.</b> Нараненият съд се свива веднага — от местни миогенни рефлекси, нервни сигнали и вещества от тромбоцитите (тромбоксан A₂). При малки съдове това почти спира кървенето.</p><p><b>2. Тромбоцитна тапа.</b> Тромбоцитите полепват по оголения колаген чрез фактора на фон Вилебранд (рецептор GPIb). Активират се, набъбват, изпускат ADP и тромбоксан A₂, които привличат още тромбоцити. Рецепторът GPIIb/IIIa ги свързва помежду им чрез фибриноген.</p><p><b>3. Съсирване.</b> Каскадата от фактори образува тромбин, който превръща фибриногена в нишки фибрин. Те укрепват тапата.</p><p><b>4. Ретракция и фибринолиза.</b> Тромбоцитите свиват съсирека. По-късно плазминът го разгражда, а съдът се възстановява.</p>`},
   {h:"Каскадата",fig:BF.hsCas(),html:`<p>Факторите са проензими — всеки активира следващия и сигналът се усилва многократно.</p><ul><li><b>Външен път:</b> тъканният фактор (TF) от увредената тъкан образува комплекс с фактор VII. TF–VIIa активира X (и IX). Бърз, отнема секунди.</li><li><b>Вътрешен път:</b> XII се активира при контакт с отрицателно заредена повърхност, следват XI и IX. IXa заедно с VIIIa (<b>теназа</b>) активира X. По-бавен, но дава повечето Xa.</li><li><b>Общ път:</b> Xa с Va (<b>протромбиназа</b>) върху фосфолипидите на тромбоцитите превръща протромбина (II) в тромбин. Тромбинът разцепва фибриногена; фактор XIIIa омрежва фибрина.</li></ul><p>Почти всички стъпки изискват <b>Ca²⁺</b> — затова цитратът и EDTA пазят кръвта несъсирена в епруветката.</p>`},
   {h:"Клетъчният модел: тромбиновият взрив",html:`<p>В организма каскадата не върви по две отделни линии. Започва с TF–VIIa, който дава <b>малко тромбин</b>. Този тромбин активира тромбоцитите и кофакторите V и VIII, а също и фактор XI. Следва <b>усилване</b> на повърхността на активираните тромбоцити — теназата и протромбиназата работят стотици хиляди пъти по-бързо, и се образува голямо количество тромбин („взрив“).</p><p>Така се обяснява защо при хемофилия (липса на VIII или IX) хората кървят, въпреки че външният път е запазен, а при дефицит на XII — не.</p>`},
   {h:"Противосъсирващи механизми",html:`<ul><li><b>Ендотел:</b> гладка повърхност, гликокаликс, тромбомодулин, простациклин (PGI₂) и NO.</li><li><b>Антитромбин III</b> инактивира тромбина, Xa, IXa и XIa. Хепаринът го усилва 100–1000 пъти.</li><li><b>Протеин C</b> се активира от комплекса тромбин–тромбомодулин и заедно с протеин S разгражда Va и VIIIa.</li><li><b>TFPI</b> спира комплекса TF–VIIa–Xa.</li><li><b>Фибринолиза:</b> tPA превръща плазминогена в плазмин, който разгражда фибрина до D-димери.</li></ul>`},
   {h:"Лабораторни тестове и нарушения",html:`<p><b>PT</b> (протромбиново време, 11–13 s; INR) — външен и общ път (VII, X, V, II, фибриноген). Следи лечението с варфарин. <b>aPTT</b> (25–35 s) — вътрешен и общ път (XII, XI, IX, VIII). Следи нефракционирания хепарин. <b>Време на кървене</b> — тромбоцитната функция.</p><ul><li><b>Витамин K</b> е нужен за γ-карбоксилирането на II, VII, IX, X и протеини C и S. Варфаринът го блокира.</li><li><b>Хемофилия A/B</b> — X-свързани дефицити на VIII/IX: кръвоизливи в ставите и мускулите, удължено aPTT.</li><li><b>Болест на фон Вилебранд</b> — най-честото наследствено нарушение: кървене от лигавиците, удължено време на кървене.</li><li><b>Тромбоцитопения</b> — петехии; спонтанно кървене под 10–20 × 10⁹/L.</li><li><b>ДИК</b> — едновременно тромбози и кървене при изразходване на факторите.</li></ul>`}],
  key:["Етапи: спазъм → тромбоцитна тапа (vWF, GPIb, GPIIb/IIIa) → съсирване → ретракция и фибринолиза.","Външен път: TF + VII; вътрешен: XII → XI → IX (+ VIII); общ: X (+ V) → тромбин → фибрин (XIII омрежва).","Тромбинът активира V, VIII, XI и тромбоцитите — положителна обратна връзка („взрив“).","Витамин K-зависими: II, VII, IX, X, протеини C и S.","PT/INR — външен път, варфарин; aPTT — вътрешен път, хепарин; време на кървене — тромбоцити.","Антитромбин III (+ хепарин), протеин C/S, TFPI; плазмин → D-димери."]},
 hbcurve:{title:"Хемоглобин и кислородна дисоциационна крива",adv:"тетрамер на хемоглобина с T↔R преход, кривата и кислородното съдържание при различни условия",
  lead:"Около 97 % от кислорода се пренася свързан с хемоглобина. Формата на кривата определя колко O₂ се взема в белия дроб и колко се отдава в тъканите. По Guyton, гл. 33 и 41.",
  secs:[
   {h:"Строеж на хемоглобина",html:`<p>HbA е тетрамер от две α и две β вериги (α₂β₂). Всяка верига носи хем — порфиринов пръстен с <b>Fe²⁺</b>, което свързва обратимо една молекула O₂. Една молекула Hb пренася до 4 O₂. 1 g Hb свързва ≈ <b>1,34 mL O₂</b>, затова при Hb 150 g/L капацитетът е ≈ 200 mL O₂/L.</p><p>Феталният HbF е α₂γ₂, а при възрастните има и малко HbA₂ (α₂δ₂). Миоглобинът в мускулите е една верига с един хем.</p>`},
   {h:"Кооперативност и форма на кривата",fig:BF.hbC(),html:`<p>Деоксихемоглобинът е в <b>T (напрегнато)</b> състояние със солеви мостове между веригите и нисък афинитет. Свързването на първия O₂ разкъсва част от мостовете и улеснява следващите — тетрамерът преминава в <b>R (отпуснато)</b> състояние. Затова кривата е <b>сигмоидна</b> (коефициент на Хил ≈ 2,7).</p><p>Горната плоска част пази насищането над 90 % дори при P<sub>O₂</sub> 60 mmHg. Стръмната средна част позволява голямо отдаване на O₂ при малък спад на P<sub>O₂</sub> в тъканите. При P<sub>O₂</sub> 40 mmHg насищането е ≈ 75 % — в покой се отдават ≈ 5 mL O₂ на 100 mL кръв (коефициент на екстракция ≈ 25 %).</p>`},
   {h:"Изместване на кривата",html:`<p>Мярка за афинитета е <b>P<sub>50</sub></b> — P<sub>O₂</sub> при 50 % насищане (≈ 26–27 mmHg).</p><ul><li><b>Надясно</b> (P<sub>50</sub> ↑, по-лесно отдаване): ↑ H⁺ (↓ pH), ↑ CO₂ (<b>ефект на Бор</b>), ↑ температура, ↑ 2,3-BPG. Това са условията в работещия мускул.</li><li><b>Наляво</b> (P<sub>50</sub> ↓, по-силно задържане): алкалоза, хипотермия, ↓ 2,3-BPG (съхранена кръв), HbF, CO, метхемоглобин.</li></ul><p><b>2,3-BPG</b> се образува при гликолизата в еритроцитите и се свързва в централната кухина на дезоксихемоглобина. Увеличава се при хронична хипоксия, анемия и на височина.</p>`},
   {h:"Съдържание на кислород: анемия, CO и MetHb",html:`<p>Кислородното съдържание C<sub>O₂</sub> = 1,34 × Hb × S<sub>O₂</sub> + 0,003 × P<sub>O₂</sub>. Насищането и P<sub>aO₂</sub> не показват колко кислород има в кръвта.</p><ul><li><b>Анемия:</b> нормални P<sub>aO₂</sub> и S<sub>aO₂</sub>, но ниско съдържание.</li><li><b>CO</b> се свързва около 250 пъти по-силно от O₂. Намалява капацитета и измества кривата наляво. Пулсоксиметърът не различава COHb.</li><li><b>Метхемоглобин</b> (Fe³⁺) не свързва O₂ и също измества кривата наляво. Лечение — метиленово синьо.</li></ul>`},
   {h:"HbF и миоглобин",html:`<p><b>HbF</b> свързва слабо 2,3-BPG и има P<sub>50</sub> ≈ 19 mmHg. Затова в плацентата O₂ преминава от майчината към феталната кръв. <b>Миоглобинът</b> има хиперболична крива с P<sub>50</sub> ≈ 2–3 mmHg — той е кислороден резерв, който се отдава едва при силна хипоксия в мускула.</p>`}],
  key:["Hb = α₂β₂, 4 хема с Fe²⁺; 1 g Hb свързва 1,34 mL O₂.","Сигмоидна крива поради кооперативност (T ↔ R); P₅₀ ≈ 26,8 mmHg.","Надясно: ↑ H⁺, ↑ CO₂, ↑ T, ↑ 2,3-BPG (ефект на Бор). Наляво: HbF, CO, MetHb, алкалоза, хипотермия.","Анемия — нормално S<sub>aO₂</sub> и P<sub>aO₂</sub>, ниско съдържание.","CO: ↓ капацитет + изместване наляво; пулсоксиметърът е ненадежден.","Миоглобин: хипербола, P₅₀ ≈ 2,8 mmHg — резерв, а не транспорт."]},
 bgroups:{title:"Кръвни групи и хематологични показатели",adv:"тест карта с аглутинация, съвместимост при преливане, наследяване и пълна кръвна картина",
  lead:"По мембраната на еритроцитите има стотици антигени, но клинично най-важни са системите AB0 и Rh. Пълната кръвна картина е най-честото лабораторно изследване. По Guyton, гл. 32, 33 и 36.",
  secs:[
   {h:"Системата AB0",fig:BF.abo(),html:`<p>Антигените A и B са олигозахариди по еритроцитите. Генът има три алела — A и B са кодоминантни, O е рецесивен. Групата O има само H антиген.</p><p>Срещу липсващите антигени в плазмата има <b>естествени антитела</b> (анти-A, анти-B, главно IgM). Те се появяват през първите месеци след раждането — вероятно от сходни антигени на чревните бактерии и храната. Затова още първото несъвместимо преливане е опасно.</p><p>Честота в България — приблизително A 40–45 %, O 30–33 %, B 15–17 %, AB 6–8 %.</p>`},
   {h:"Rh системата",html:`<p>Най-важният Rh антиген е <b>D</b>. Около 85 % от хората са Rh+ (имат D). За разлика от AB0 тук <b>естествени антитела няма</b> — анти-D (IgG) се образуват едва след контакт с Rh+ еритроцити (преливане или бременност).</p><p><b>Хемолитична болест на новороденото:</b> Rh− майка с Rh+ плод се сенсибилизира при раждането. При следваща Rh+ бременност IgG анти-D минават през плацентата и разрушават еритроцитите на плода — анемия, жълтеница, ядрена жълтеница, водянка. Профилактика — анти-D имуноглобулин в 28. седмица и до 72 h след раждането.</p>`},
   {h:"Определяне и кръвопреливане",html:`<p><b>Право определяне:</b> еритроцитите на пациента се смесват с тест серуми анти-A, анти-B и анти-D — аглутинацията показва кои антигени има. <b>Обратно определяне:</b> серумът на пациента се смесва със стандартни A₁ и B клетки — показва кои антитела има. Двете трябва да съвпаднат. Преди преливане се прави и <b>кръстосана проба</b>.</p><p>При еритроцитна маса важат антигените на донора: O Rh− е „универсален донор“, AB Rh+ — „универсален реципиент“. При плазма е обратното — AB плазмата няма антитела.</p><p><b>Остра хемолитична реакция:</b> антителата свързват донорските еритроцити, активира се комплементът → интраваскуларна хемолиза, треска, болка в кръста, хемоглобинурия, шок, ДИК и остра бъбречна недостатъчност.</p>`},
   {h:"Пълна кръвна картина",html:`<table class="small"><tr><td>Еритроцити</td><td>мъже 4,5–5,9; жени 4,0–5,2 × 10¹²/L</td></tr><tr><td>Хемоглобин</td><td>мъже 135–175; жени 120–155 g/L</td></tr><tr><td>Хематокрит</td><td>мъже 40–52; жени 36–46 %</td></tr><tr><td>MCV</td><td>80–100 fL</td></tr><tr><td>MCH</td><td>27–33 pg</td></tr><tr><td>MCHC</td><td>320–360 g/L</td></tr><tr><td>Ретикулоцити</td><td>0,5–2 %</td></tr><tr><td>Левкоцити</td><td>4–10 × 10⁹/L</td></tr><tr><td>Тромбоцити</td><td>150–400 × 10⁹/L</td></tr></table><p>Индексите се изчисляват: MCV = Hct/RBC, MCH = Hb/RBC, MCHC = Hb/Hct.</p>`},
   {h:"Видове анемии",html:`<ul><li><b>Микроцитна хипохромна</b> (MCV < 80): железен дефицит, таласемия, хронично заболяване.</li><li><b>Макроцитна</b> (MCV > 100): дефицит на B₁₂ или фолат (мегалобластна), алкохол, чернодробно заболяване.</li><li><b>Нормоцитна</b>: остра кръвозагуба, хемолиза, бъбречна недостатъчност (липсва еритропоетин), апластична анемия.</li></ul><p>Ретикулоцитите показват дали костният мозък отговаря: високи при хемолиза и кръвозагуба, ниски при дефицити и потиснат мозък. Еритропоезата се регулира от <b>еритропоетина</b>, който бъбрекът отделя при хипоксия.</p>`}],
  key:["AB0: A и B кодоминантни, O рецесивен; естествени антитела IgM срещу липсващите антигени.","Rh (D): няма естествени антитела; анти-D (IgG) след сенсибилизация → хемолитична болест на новороденото.","Еритроцити: универсален донор O Rh−; плазма: универсален донор AB.","MCV = Hct/RBC, MCH = Hb/RBC, MCHC = Hb/Hct.","Микроцитна — желязо, таласемия; макроцитна — B₁₂, фолат; ретикулоцитите показват отговора на мозъка.","Еритропоетинът се отделя от бъбрека при хипоксия."]},
 gfr:{title:"Гломерулна филтрация, бъбречен кръвоток и клирънс",adv:"гломерул с аферентна и еферентна артериола, сили на Starling по дължината на капиляра, авторегулация и клирънс на 6 вещества",
  lead:"Бъбреците получават ≈ 22 % от сърдечния дебит и филтрират ≈ 180 L плазма дневно. GFR е най-важният показател за бъбречната функция. По Guyton, гл. 26 и 27.",
  secs:[
   {h:"Гломерулната мембрана",html:`<p>Филтратът минава през три слоя: <b>фенестриран ендотел</b>, <b>базална мембрана</b> (отрицателно заредена) и <b>подоцити</b> с процепни диафрагми (нефрин). Свободно минават вещества до ≈ 7000 Da. Албуминът (69 000 Da, отрицателен) почти не минава — зарядът и размерът го задържат. При увреждане на заряда се появява протеинурия.</p>`},
   {h:"Сили на Starling в гломерула",fig:BF.glom(),html:`<p>GFR = K<sub>f</sub> × (P<sub>GC</sub> − P<sub>B</sub> − π<sub>GC</sub>).</p><ul><li><b>P<sub>GC</sub></b> — хидростатичното налягане в капиляра, ≈ 60 mmHg (много по-високо от другите капиляри).</li><li><b>P<sub>B</sub></b> — налягането в капсулата на Боуман, ≈ 18 mmHg.</li><li><b>π<sub>GC</sub></b> — онкотичното налягане; расте от 28 до ≈ 36 mmHg по дължината, защото 20 % от плазмата се филтрира и белтъците се концентрират.</li><li><b>K<sub>f</sub></b> ≈ 12,5 mL/min/mmHg — около 400 пъти повече от капилярите на мускулите.</li></ul><p>Нетно ≈ 10 mmHg → GFR ≈ 125 mL/min. Филтрационна фракция GFR/RPF ≈ 0,2.</p>`},
   {h:"Аферентна и еферентна артериола",html:`<ul><li><b>Свиване на аферентната</b> (симпатикус, аденозин, ендотелин): ↓ P<sub>GC</sub>, ↓ GFR и ↓ кръвотока.</li><li><b>Разширяване на аферентната</b> (простагландини, NO, брадикинин): ↑ GFR.</li><li><b>Свиване на еферентната</b> (ангиотензин II): ↑ P<sub>GC</sub> и GFR се запазва при спаднал кръвоток — <b>двуфазен ефект</b>: при силна констрикция кръвотокът пада толкова, че GFR също спада.</li></ul><p>Затова НСПВС (без простагландини) и ACE инхибиторите (без Ang II) могат да понижат GFR при хиповолемия или стеноза на бъбречната артерия.</p>`},
   {h:"Авторегулация",html:`<p>Между ≈ 75 и 160 mmHg GFR и кръвотокът се променят малко. Два механизма:</p><ul><li><b>Миогенен</b> — разтягането на аферентната артериола отваря механочувствителни Ca²⁺ канали и тя се свива.</li><li><b>Тубулогломерулна обратна връзка</b> — macula densa усеща NaCl в началото на дисталния тубул. Повече NaCl → аденозин → аферентна констрикция и ↓ GFR. По-малко NaCl → аферентна дилатация и ренин → Ang II → еферентна констрикция.</li></ul>`},
   {h:"Клирънс",html:`<p>Клирънсът е обемът плазма, напълно очистен от веществото за минута: <b>C = U × V / P</b>.</p><ul><li><b>Инулин</b> — само се филтрира: C = GFR (≈ 125 mL/min).</li><li><b>Креатинин</b> — филтрира се и малко се секретира: на практика за eGFR.</li><li><b>PAH</b> — филтрира се и активно се секретира: C ≈ ефективен RPF (≈ 600 mL/min).</li><li><b>Глюкоза</b> — реабсорбира се напълно до T<sub>m</sub> ≈ 375 mg/min; бъбречен праг ≈ 200 mg/dL.</li><li>C < GFR — веществото се реабсорбира; C > GFR — секретира се.</li></ul>`}],
  key:["GFR = K<sub>f</sub> × (P<sub>GC</sub> − P<sub>B</sub> − π<sub>GC</sub>) ≈ 12,5 × 10 = 125 mL/min (180 L/ден).","Филтрационна фракция ≈ 0,2; бъбречен кръвоток ≈ 1100 mL/min, RPF ≈ 600 mL/min.","Аферентна констрикция ↓ GFR и кръвоток; еферентна (Ang II) ↑ GFR при ↓ кръвоток.","Авторегулация 75–160 mmHg: миогенен механизъм + тубулогломерулна обратна връзка (macula densa).","C = UV/P; инулин = GFR, PAH ≈ RPF, глюкоза — T<sub>m</sub> 375 mg/min, праг ≈ 200 mg/dL.","НСПВС и ACE инхибитори могат да понижат GFR при хиповолемия и стеноза."]},
 tubule:{title:"Тубулен транспорт и противотоков механизъм",adv:"цял нефрон с осмолалитета на течността, транспорта във всеки сегмент, ADH, алдостерон и диуретици",
  lead:"От 180 L филтрат дневно в урината остават 1–2 L. Всеки сегмент на нефрона има собствени преносители, а бримката на Хенле и ADH позволяват урината да бъде от 50 до 1200 mOsm/kg. По Guyton, гл. 28 и 29.",
  secs:[
   {h:"Сегментите на нефрона",fig:BF.neph(),html:`<p>Реабсорбцията на Na⁺ става главно чрез Na⁺/K⁺-ATP-азата в базолатералната мембрана, която поддържа ниска вътреклетъчна концентрация на Na⁺. В апикалната мембрана всеки сегмент има свой вход за Na⁺ — и затова своя диуретик.</p><ul><li><b>Проксимален тубул:</b> NHE3, SGLT2, котранспорт с аминокиселини и фосфат. Изоосмотична реабсорбция. Карбоанхидразни инхибитори (ацетазоламид).</li><li><b>Дебел възходящ сегмент:</b> NKCC2 — бримкови диуретици (фуроземид).</li><li><b>Дистален тубул:</b> NCC — тиазиди.</li><li><b>Събирателен канал:</b> ENaC — амилорид; рецептор за алдостерон — спиронолактон.</li></ul>`},
   {h:"Противотоков умножител",fig:BF.cc(),html:`<p>Двете колена на бримката вървят успоредно в противоположни посоки. Дебелият възходящ сегмент изпомпва NaCl в интерстиция, но не пропуска вода — на всяко ниво създава разлика ≈ 200 mOsm/kg. Низходящото коляно пропуска вода, която излиза и концентрира течността. Повтарянето на тези два процеса, докато течността тече, „умножава“ градиента до ≈ 1200 mOsm/kg на върха на папилата.</p><p><b>Уреята</b> допринася за около половината от осмолалитета на вътрешната медула: ADH отваря уреалните канали (UT-A1) в медуларния събирателен канал и уреята рециркулира.</p><p><b>Vasa recta</b> са противотоков обменник: бавният им U-образен кръвоток храни медулата, без да отмива градиента.</p>`},
   {h:"ADH и концентриране на урината",html:`<p>ADH (вазопресин) се свързва с V2 рецепторите на главните клетки → cAMP → вграждане на <b>аквапорин-2</b> в апикалната мембрана. Водата излиза към хипертоничната медула и урината се концентрира.</p><ul><li>Без ADH: до 20 L/ден урина с ≈ 50 mOsm/kg (водна диуреза).</li><li>Максимален ADH: ≈ 0,5 L/ден с ≈ 1200 mOsm/kg.</li><li>Дневно трябва да се отделят ≈ 600 mOsm, затова минималният обем урина е ≈ 0,5 L (облигатен обем).</li></ul><p><b>Свободният воден клирънс</b> C<sub>H₂O</sub> = V − C<sub>osm</sub>: положителен при разредена урина, отрицателен при концентрирана.</p>`},
   {h:"Алдостерон и калий",html:`<p>Алдостеронът действа на главните клетки: повече ENaC, ROMK и Na⁺/K⁺-ATP-аза. Резултат — реабсорбция на Na⁺ и секреция на K⁺ (и H⁺ от интеркаларните клетки). Секрецията на K⁺ расте и при по-голям дистален поток — затова бримковите и тиазидните диуретици водят до хипокалиемия, а амилоридът и спиронолактонът — до задържане на K⁺.</p>`}],
  key:["Проксимален тубул: 65 % изоосмотично, глюкоза (SGLT2), HCO₃⁻, секреция на органични аниони.","Дебел възходящ сегмент: NKCC2, непропусклив за вода → градиент; фуроземид.","Дистален тубул: NCC, разреждане, Ca²⁺ (PTH); тиазиди.","Събирателен канал: ENaC/ROMK (алдостерон), AQP2 (ADH), уреални канали.","Противотоков умножител + урея → 1200 mOsm/kg; vasa recta — противотоков обменник.","Урина 50–1200 mOsm/kg; облигатен обем ≈ 0,5 L/ден; C<sub>H₂O</sub> = V − C<sub>osm</sub>."]},
 volreg:{title:"Регулация на обема и осмолалитета (ADH, РААС)",adv:"затворен модел на тялото с вода и Na⁺, ADH, ренин–ангиотензин–алдостерон, ANP и жажда",
  lead:"Концентрацията на Na⁺ в плазмата се пази чрез контрола на водата (ADH и жажда), а обемът на извънклетъчната течност — чрез контрола на Na⁺ (РААС, ANP, налягането). По Guyton, гл. 25, 29 и 30.",
  secs:[
   {h:"Телесни течности",html:`<p>Водата е ≈ 60 % от телесната маса (42 L при 70 kg): <b>вътреклетъчна</b> ≈ 28 L (2/3) и <b>извънклетъчна</b> ≈ 14 L (интерстициум ≈ 11 L, плазма ≈ 3 L). Мембраните пропускат вода, затова осмолалитетът навсякъде е еднакъв (≈ 290 mOsm/kg). Na⁺ е основният извънклетъчен осмол, K⁺ — вътреклетъчният.</p><ul><li><b>Изотонична</b> течност (0,9 % NaCl) остава извън клетките.</li><li><b>Вода (или 5 % глюкоза)</b> се разпределя навсякъде — 2/3 в клетките.</li><li><b>Хипертонична</b> течност изтегля вода от клетките.</li></ul>`},
   {h:"Осморецептори, ADH и жажда",fig:BF.adh(),html:`<p>Осморецепторите в предния хипоталамус (OVLT) усещат промяна на осмолалитета от 1–2 %. Невроните на супраоптичното и паравентрикуларното ядро отделят ADH от задната хипофиза. Над ≈ 280 mOsm/kg ADH расте линейно; при 295–300 се включва и <b>жаждата</b>.</p><p>Обемът и налягането също стимулират ADH (чрез барорецепторите и предсърдните рецептори), но е нужна загуба над ≈ 10 % — тогава стимулът е много силен и надделява над осмоларния.</p><p>Нарушения: <b>безвкусен диабет</b> (централен — липса на ADH; нефрогенен — липса на отговор) и <b>SIADH</b> (неподходящо висок ADH, еуволемична хипонатриемия).</p>`},
   {h:"Ренин–ангиотензин–алдостерон",fig:BF.raas(),html:`<p>Юкстагломерулните клетки отделят <b>ренин</b> при: ↓ налягане в аферентната артериола, ↓ NaCl в macula densa и симпатикусова стимулация (β₁). Ренинът превръща ангиотензиногена (от черния дроб) в ангиотензин I, а ACE (главно в белите дробове) — в <b>ангиотензин II</b>.</p><p>Ang II: свива артериолите (особено еферентната), засилва реабсорбцията на Na⁺ в проксималния тубул, стимулира алдостерона, жаждата и ADH. <b>Алдостеронът</b> засилва реабсорбцията на Na⁺ и секрецията на K⁺ в събирателния канал. Калият също стимулира пряко алдостерона.</p>`},
   {h:"ANP и налягането",html:`<p><b>Предсърдният натриуретичен пептид</b> се отделя при разтягане на предсърдията. Той увеличава GFR, потиска реабсорбцията на Na⁺ в събирателния канал и потиска ренина, алдостерона и ADH.</p><p><b>Налягателна натриуреза:</b> по-високото налягане увеличава отделянето на Na⁺ и вода. Според Guyton това е основният дългосрочен механизъм, който определя нивото на артериалното налягане. При първичен хипералдостеронизъм той ограничава задържането на Na⁺ („бягство“) — затова няма отоци.</p>`},
   {h:"Типични реакции",html:`<table class="small"><tr><td><b>Изпит 1 L вода</b></td><td>↓ осмолалитет → ↓ ADH → разредена урина за 1–2 h</td></tr><tr><td><b>1 L 0,9 % NaCl</b></td><td>↑ обем, осмолалитет непроменен → ↓ РААС, ↑ ANP → натриуреза за часове</td></tr><tr><td><b>Кръвозагуба</b></td><td>↓ обем → ↑ ренин, Ang II, алдостерон, ADH, жажда</td></tr><tr><td><b>Изпотяване</b></td><td>↑ осмолалитет, ↓ обем → силен ADH и жажда</td></tr><tr><td><b>Солена храна</b></td><td>↑ осмолалитет → ADH и жажда → задържане на вода → ↓ РААС → натриуреза</td></tr></table>`}],
  key:["Обща вода ≈ 60 % от масата: 2/3 в клетките, 1/3 извън тях (плазма ≈ 3 L).","Na⁺ (концентрация) ← вода ← ADH и жажда; обем ← количество Na⁺ ← РААС, ANP, налягане.","ADH: осмоларен стимул над ≈ 280 mOsm/kg (1–2 % стигат); обемен — при загуба > 10 %.","Ренин ← ↓ налягане, ↓ NaCl в macula densa, β₁; Ang II → вазоконстрикция, алдостерон, жажда, ADH.","Алдостерон: Na⁺ навътре, K⁺ и H⁺ навън; стимулира се от Ang II и K⁺.","ANP и налягателната натриуреза отделят излишния Na⁺; SIADH — еуволемична хипонатриемия."]}
});
/* ---- тестове, термини и регистрация за раздели III и VI ---- */
const TESTS_HS=[
 {q:"Кой фактор започва съсирването in vivo?",opts:["Фактор XII","Тъканният фактор с фактор VIIa","Фибриногенът","Плазминът"],a:1,expl:"TF се излага при увреждане на съда и с VIIa активира X и IX."},
 {q:"Кои фактори зависят от витамин K?",opts:["I, V, VIII, XIII","II, VII, IX, X","XI, XII","Само VIII"],a:1,expl:"Плюс протеините C и S. Витамин K е кофактор на γ-карбоксилирането им."},
 {q:"Какво измерва aPTT?",opts:["Външния път","Вътрешния и общия път","Броя на тромбоцитите","Фибринолизата"],a:1,expl:"XII, XI, IX, VIII, X, V, II, фибриноген. Използва се за контрол на нефракционирания хепарин."},
 {q:"Чрез кой рецептор тромбоцитите полепват по колагена при бърз кръвоток?",opts:["GPIIb/IIIa","GPIb — чрез фактора на фон Вилебранд","P2Y12","Рецептор за тромбин"],a:1,expl:"GPIIb/IIIa свързва тромбоцитите помежду им чрез фибриноген (агрегация)."},
 {q:"Как действа хепаринът?",opts:["Блокира витамин K","Усилва антитромбин III","Разгражда фибрина","Блокира COX-1"],a:1,expl:"Комплексът хепарин–антитромбин инактивира тромбина и Xa. Антидот — протамин сулфат."},
 {q:"Какво разгражда фибрина?",opts:["Тромбинът","Плазминът","Фактор XIII","Протеин C"],a:1,expl:"tPA превръща плазминогена в плазмин; продуктите са D-димери."},
 {q:"Хемофилия A се дължи на дефицит на:",opts:["Фактор IX","Фактор VIII","Фактор на фон Вилебранд","Фактор VII"],a:1,expl:"X-свързано наследяване; хемофилия B е дефицит на фактор IX."},
 {q:"Аспиринът потиска тромбоцитите, защото:",opts:["Блокира GPIIb/IIIa","Необратимо блокира COX-1 и синтеза на тромбоксан A₂","Блокира ADP рецептора","Унищожава тромбоцитите"],a:1,expl:"Тромбоцитите нямат ядро и не синтезират нов ензим — ефектът трае 7–10 дни."},
 {q:"Защо цитратът пази кръвта от съсирване в епруветката?",opts:["Разгражда фибриногена","Свързва Ca²⁺","Активира антитромбина","Блокира тромбоцитите"],a:1,expl:"Почти всички стъпки на каскадата изискват Ca²⁺."},
 {q:"Протеин C разгражда:",opts:["Фибрина","Активираните фактори V и VIII","Тромбина","Тъканния фактор"],a:1,expl:"Активира се от тромбин–тромбомодулин; протеин S е кофактор. Фактор V Лайден е резистентен."}];
const TESTS_HB=[
 {q:"Колко mL O₂ свързва 1 g хемоглобин?",opts:["0,003","1,34","4","20"],a:1,expl:"При Hb 150 g/L капацитетът е ≈ 200 mL O₂/L."},
 {q:"Какво е P<sub>50</sub> на HbA при нормални условия?",opts:["≈ 2,8 mmHg","≈ 19 mmHg","≈ 26,8 mmHg","≈ 40 mmHg"],a:2,expl:"2,8 — миоглобин; 19 — HbF."},
 {q:"Защо кривата е сигмоидна?",opts:["Заради 2,3-BPG","Заради кооперативното свързване на 4 субединици","Заради CO₂","Заради разтворения O₂"],a:1,expl:"Свързването на O₂ в една субединица улеснява следващите (T → R)."},
 {q:"Кое измества кривата надясно?",opts:["Алкалоза","Хипотермия","Повишен 2,3-BPG","HbF"],a:2,expl:"Надясно: ↑ H⁺, ↑ CO₂, ↑ температура, ↑ 2,3-BPG."},
 {q:"Как се нарича ефектът на CO₂ и H⁺ върху афинитета на Hb към O₂?",opts:["Ефект на Холдейн","Ефект на Бор","Ефект на Хамбургер","Ефект на Фарей"],a:1,expl:"Ефектът на Холдейн е обратният: O₂ влияе на свързването на CO₂."},
 {q:"При анемия с Hb 80 g/L какво е S<sub>aO₂</sub>?",opts:["Намалено до 50 %","Нормално","Повишено","0"],a:1,expl:"Насищането зависи от P<sub>O₂</sub>. Намалено е кислородното съдържание."},
 {q:"Защо HbF има по-висок афинитет?",opts:["Има повече хем","γ-веригите свързват слабо 2,3-BPG","Има Fe³⁺","Не е тетрамер"],a:1,expl:"Така O₂ преминава от майката към плода в плацентата."},
 {q:"Какво става с кривата при отравяне с CO?",opts:["Измества се надясно","Капацитетът пада и кривата се измества наляво","Не се променя","Става хипербола"],a:1,expl:"Остатъчният O₂ се отдава по-трудно — затова CO е опаснее от анемия със същия капацитет."},
 {q:"Каква е функцията на миоглобина?",opts:["Пренос на CO₂","Резерв на O₂ в мускула","Буфер на H⁺","Транспорт на желязо"],a:1,expl:"P<sub>50</sub> ≈ 2,8 mmHg — отдава O₂ едва при много ниско P<sub>O₂</sub>."}];
const TESTS_BG=[
 {q:"Какви антитела има в плазмата човек с група A?",opts:["Анти-A","Анти-B","Анти-A и анти-B","Няма"],a:1,expl:"Естествени IgM антитела срещу липсващия антиген B."},
 {q:"Кой е универсален донор на еритроцити?",opts:["AB Rh+","O Rh−","A Rh−","B Rh+"],a:1,expl:"Няма антигени A, B и D."},
 {q:"Кой клас са анти-D антителата, които минават през плацентата?",opts:["IgM","IgG","IgA","IgE"],a:1,expl:"IgM (анти-A, анти-B) не минават; IgG анти-D минават и причиняват хемолитична болест на новороденото."},
 {q:"Кога се прилага анти-D имуноглобулин?",opts:["На Rh+ майка","На Rh− майка с Rh+ дете, до 72 h след раждането","На новороденото","Само при преливане"],a:1,expl:"Неутрализира феталните Rh+ еритроцити, преди майката да се сенсибилизира."},
 {q:"Родители AB и O. Какви групи могат да имат децата?",opts:["AB и O","A и B","Само O","A, B, AB, O"],a:1,expl:"Детето получава A или B от единия и O от другия → AO или BO."},
 {q:"MCV се изчислява като:",opts:["Hb/RBC","Hct/RBC","Hb/Hct","RBC/Hct"],a:1,expl:"MCV = Hct (L/L) / RBC (10¹²/L) × 1000 fL."},
 {q:"Макроцитна анемия (MCV 112 fL) е типична за:",opts:["Железен дефицит","Дефицит на B₁₂ или фолат","Таласемия","Остра кръвозагуба"],a:1,expl:"Нарушен синтез на ДНК → мегалобласти."},
 {q:"Кой хормон стимулира образуването на еритроцити?",opts:["Тромбопоетин","Еритропоетин от бъбреците","Алдостерон","Кортизол"],a:1,expl:"Отделя се главно от перитубулните клетки на бъбрека при хипоксия."},
 {q:"Каква е реакцията при преливане на A кръв на човек с група O?",opts:["Няма реакция","Остра интраваскуларна хемолиза","Само уртикария","Забавена реакция след месеци"],a:1,expl:"Анти-A (IgM) активират комплемента — хемоглобинурия, шок, ДИК, остра бъбречна недостатъчност."}];
const TESTS_GFR=[
 {q:"Каква е нормалната GFR?",opts:["≈ 12,5 mL/min","≈ 125 mL/min","≈ 600 mL/min","≈ 1100 mL/min"],a:1,expl:"≈ 180 L/ден. 600 — бъбречен плазмен кръвоток, 1100 — кръвоток."},
 {q:"Колко е нормалното хидростатично налягане в гломерулния капиляр?",opts:["≈ 18 mmHg","≈ 30 mmHg","≈ 60 mmHg","≈ 100 mmHg"],a:2,expl:"Много по-високо от другите капиляри — затова филтрацията е по цялата дължина."},
 {q:"Какво е филтрационната фракция?",opts:["GFR/RBF","GFR/RPF ≈ 0,2","RPF/GFR","U/P"],a:1,expl:"Около 20 % от плазмата се филтрира."},
 {q:"Свиване на аферентната артериола:",opts:["↑ GFR","↓ GFR и ↓ кръвоток","↑ GFR и ↓ кръвоток","Не влияе"],a:1,expl:"P<sub>GC</sub> пада."},
 {q:"Умерено свиване на еферентната артериола:",opts:["↓ GFR","↑ GFR и ↓ кръвоток","↑ кръвоток","↓ филтрационна фракция"],a:1,expl:"P<sub>GC</sub> расте. При силна констрикция кръвотокът пада толкова, че и GFR спада."},
 {q:"Клетките на macula densa усещат:",opts:["Налягането в аферентната артериола","NaCl в началото на дисталния тубул","Глюкозата","Осмолалитета на плазмата"],a:1,expl:"Основата на тубулогломерулната обратна връзка."},
 {q:"Клирънсът на кое вещество е равен на GFR?",opts:["Глюкоза","Инулин","PAH","Урея"],a:1,expl:"Инулинът само се филтрира."},
 {q:"Защо албуминът почти не се филтрира?",opts:["Твърде лек","Голям и отрицателно зареден","Свързан с еритроцитите","Реабсорбира се в капсулата"],a:1,expl:"Базалната мембрана и подоцитите имат отрицателен заряд."},
 {q:"Какъв е тубулният транспортен максимум за глюкоза?",opts:["≈ 80 mg/min","≈ 200 mg/min","≈ 375 mg/min","Няма максимум"],a:2,expl:"Бъбречният праг (≈ 200 mg/dL) е по-нисък заради неравномерността на нефроните (splay)."},
 {q:"В какъв диапазон на САН действа авторегулацията?",opts:["40–80 mmHg","≈ 75–160 mmHg","160–250 mmHg","Във всеки диапазон"],a:1,expl:"Извън него GFR следва налягането."}];
const TESTS_TUB=[
 {q:"Колко от филтрирания Na⁺ се реабсорбира в проксималния тубул?",opts:["≈ 5 %","≈ 25 %","≈ 65 %","≈ 99 %"],a:2,expl:"Заедно с водата — изоосмотично."},
 {q:"Кой сегмент е непропусклив за вода и разрежда течността?",opts:["Низходящото коляно","Дебелият възходящ сегмент","Проксималният тубул","Медуларният събирателен канал при ADH"],a:1,expl:"„Разреждащ сегмент“: NaCl излиза, водата остава."},
 {q:"Къде действат тиазидите?",opts:["Проксимален тубул","Дебел възходящ сегмент","Дистален тубул (NCC)","Събирателен канал"],a:2,expl:"Фуроземидът — NKCC2; амилоридът — ENaC."},
 {q:"Как действа ADH?",opts:["Отваря ENaC","Вгражда аквапорин-2 чрез V2 рецептори и cAMP","Блокира NKCC2","Повишава GFR"],a:1,expl:"Водата излиза от събирателния канал към хипертоничната медула."},
 {q:"Колко е максималният осмолалитет на урината при човека?",opts:["≈ 300","≈ 600","≈ 1200 mOsm/kg","≈ 3000 mOsm/kg"],a:2,expl:"Равен на осмолалитета на върха на папилата."},
 {q:"Каква е ролята на уреята в медулата?",opts:["Никаква","Около половината от осмолалитета на вътрешната медула","Само токсин","Задържа K⁺"],a:1,expl:"ADH отваря уреалните канали UT-A1 и уреята рециркулира."},
 {q:"Каква е функцията на vasa recta?",opts:["Филтрация","Противотоков обменник, който не отмива градиента","Секреция на ренин","Реабсорбция на глюкоза"],a:1,expl:"Бавният U-образен кръвоток пази градиента."},
 {q:"Алдостеронът в главните клетки:",opts:["Реабсорбира K⁺","Реабсорбира Na⁺ и секретира K⁺","Реабсорбира глюкоза","Секретира Na⁺"],a:1,expl:"Повече ENaC, ROMK и Na⁺/K⁺-ATP-аза."},
 {q:"Кой диуретик е калий-съхраняващ?",opts:["Фуроземид","Хидрохлоротиазид","Спиронолактон","Ацетазоламид"],a:2,expl:"Блокира рецептора за алдостерон."},
 {q:"Свободният воден клирънс е положителен, когато:",opts:["Урината е хипотонична","Урината е хипертонична","Няма урина","GFR е висока"],a:0,expl:"C<sub>H₂O</sub> = V − C<sub>osm</sub>."}];
const TESTS_VR=[
 {q:"Колко е общата телесна вода при 70 kg?",opts:["≈ 14 L","≈ 28 L","≈ 42 L","≈ 60 L"],a:2,expl:"60 % от масата: 28 L вътреклетъчна и 14 L извънклетъчна."},
 {q:"Къде се разпределя 1 L изотоничен NaCl?",opts:["В клетките","В извънклетъчната течност","Равномерно навсякъде","Само в плазмата"],a:1,expl:"Na⁺ не влиза в клетките."},
 {q:"Къде се образува ADH?",opts:["В задната хипофиза","В супраоптичното и паравентрикуларното ядро на хипоталамуса","В бъбрека","В надбъбрека"],a:1,expl:"Отделя се от задната хипофиза."},
 {q:"С колко трябва да се промени осмолалитетът, за да се промени ADH?",opts:["1–2 %","10 %","20 %","50 %"],a:0,expl:"Обемният стимул изисква > 10 %."},
 {q:"Кое НЕ стимулира отделянето на ренин?",opts:["Ниско налягане в аферентната артериола","Малко NaCl в macula densa","Симпатикус (β₁)","Висок ANP"],a:3,expl:"ANP потиска ренина."},
 {q:"Къде се превръща ангиотензин I в ангиотензин II?",opts:["В черния дроб","Главно в белите дробове (ACE)","В надбъбрека","В хипофизата"],a:1,expl:"ACE е по ендотела, най-много в белодробните капиляри."},
 {q:"Кой е най-силният стимул за алдостерона освен Ang II?",opts:["Na⁺","K⁺","Глюкоза","ADH"],a:1,expl:"Хиперкалиемията пряко стимулира зона гломерулоза."},
 {q:"Какво е типично за SIADH?",opts:["Хипернатриемия и полиурия","Хипонатриемия при нормален обем и концентрирана урина","Отоци и хипертония","Хиперкалиемия"],a:1,expl:"Еуволемична хипонатриемия."},
 {q:"Защо при първичен хипералдостеронизъм няма отоци?",opts:["Алдостеронът не задържа Na⁺","Налягателната натриуреза и ANP ограничават задържането („бягство“)","Защото пациентите не пият","Защото GFR пада"],a:1,expl:"Остават хипертонията и хипокалиемията."},
 {q:"Какво прави ANP?",opts:["Задържа Na⁺","Засилва натриурезата и потиска РААС и ADH","Свива артериолите","Стимулира жаждата"],a:1,expl:"Отделя се при разтягане на предсърдията."}];
Object.assign(TESTS,{hemost:TESTS_HS,hbcurve:TESTS_HB,bgroups:TESTS_BG,gfr:TESTS_GFR,tubule:TESTS_TUB,volreg:TESTS_VR});
Object.assign(MOD_NAMES,{hemost:"Хемостаза",hbcurve:"Хемоглобин и O₂ крива",bgroups:"Кръвни групи и ПКК",gfr:"Гломерулна филтрация",tubule:"Тубулен транспорт",volreg:"Регулация на обема (ADH, РААС)"});
Object.assign(VIEWS,{hemost:viewHemost,hbcurve:viewHbCurve,bgroups:viewBloodGroups,gfr:viewGFR,tubule:viewTubule,volreg:viewVolReg});
GL.push(
 {t:"Хемостаза",re:"хемостаз[а-я]*",d:"Спирането на кървенето: съдов спазъм, тромбоцитна тапа, съсирване (фибрин) и накрая фибринолиза."},
 {t:"Тромбоцити",re:"тромбоцит[а-я]*",d:"Безядрени фрагменти от мегакариоцитите, 150–400 × 10⁹/L, живеят 7–10 дни. Образуват тапата и дават фосфолипидната повърхност за коагулационните ензими."},
 {t:"Фактор на фон Вилебранд",re:"фон Вилебранд|vWF",d:"Голям гликопротеин от ендотела и мегакариоцитите. Свързва тромбоцитите (GPIb) с колагена и пренася и пази фактор VIII."},
 {t:"Тъканен фактор",re:"тъканн[а-я]* фактор[а-я]*|TF(?![A-Za-z])",d:"Мембранен белтък на клетките извън съда. При нараняване влиза в контакт с кръвта, свързва VIIa и започва съсирването."},
 {t:"Тромбин",re:"тромбин(?!ово)[а-я]*",d:"Активираният фактор II. Превръща фибриногена във фибрин и активира тромбоцитите и факторите V, VIII, XI и XIII; с тромбомодулин активира протеин C."},
 {t:"Фибрин",re:"фибрин(?!оген|олиз)[а-я]*",d:"Неразтворими нишки от разцепения фибриноген. Фактор XIIIa ги омрежва и укрепва съсирека."},
 {t:"Фибриноген",re:"фибриноген[а-я]*",d:"Фактор I — разтворим плазмен белтък от черния дроб (2–4 g/L). Тромбинът го превръща във фибрин."},
 {t:"Фибринолиза",re:"фибринолиз[а-я]*|плазмин[а-я]*",d:"Разграждане на фибрина от плазмина. Плазминогенът се активира от tPA и урокиназа; продуктите са D-димери."},
 {t:"Теназа и протромбиназа",re:"теназ[а-я]*|протромбиназ[а-я]*",d:"Ензимни комплекси върху фосфолипидите на тромбоцитите: теназа = IXa + VIIIa (активира X), протромбиназа = Xa + Va (активира II). Изискват Ca²⁺."},
 {t:"Антитромбин III",re:"антитромбин[а-я]*",d:"Плазмен инхибитор на тромбина, Xa, IXa и XIa. Хепаринът ускорява действието му стотици пъти."},
 {t:"Протеин C",re:"протеин[а-я]* C(?![a-zA-Z])|APC",d:"Витамин K-зависим инхибитор. Активира се от тромбин–тромбомодулин и с протеин S разгражда Va и VIIIa."},
 {t:"Хемофилия",re:"хемофили[а-я]*",d:"X-свързан дефицит на фактор VIII (A) или IX (B). Кръвоизливи в ставите и мускулите, удължено aPTT, нормално PT и време на кървене."},
 {t:"PT и INR",re:"PT(?![A-Za-z])|INR|протромбинов[а-я]* време",d:"Протромбиново време — тест за външния и общия път (VII, X, V, II, фибриноген), 11–13 s. INR го стандартизира; използва се за контрол на варфарина."},
 {t:"aPTT",re:"aPTT",d:"Активирано парциално тромбопластиново време — вътрешен и общ път (XII, XI, IX, VIII, X, V, II), 25–35 s. Контрол на нефракционирания хепарин."},
 {t:"Време на кървене",re:"врем[ее]т?о? на кървене",d:"Тест за първичната (тромбоцитна) хемостаза. Удължено при тромбоцитопения, болест на фон Вилебранд и аспирин."},
 {t:"Витамин K",re:"витамин[а-я]* K",d:"Кофактор на γ-карбоксилирането на факторите II, VII, IX, X и протеини C и S. Варфаринът блокира регенерацията му."},
 {t:"Хепарин",re:"хепарин[а-я]*",d:"Антикоагулант, който усилва антитромбин III. Нефракционираният се следи с aPTT; антидот — протамин."},
 {t:"Варфарин",re:"варфарин[а-я]*",d:"Антагонист на витамин K — намалява функционалните II, VII, IX, X. Следи се с INR (обикновено 2–3)."},
 {t:"ДИК",re:"ДИК",d:"Дисеминирана интраваскуларна коагулация: генерализирано съсирване с изразходване на факторите и тромбоцитите и вторична фибринолиза — тромбози и кървене едновременно."},
 {t:"Тромбоцитопения",re:"тромбоцитопени[а-я]*",d:"Тромбоцити под 150 × 10⁹/L. Кървене при травма под около 50, спонтанни петехии под 10–20 × 10⁹/L."},
 {t:"Хемоглобин",re:"хемоглобин(?!ем)[а-я]*|HbA(?![a-z])",d:"Белтъкът на еритроцитите, който пренася O₂: тетрамер α₂β₂ с 4 хема (Fe²⁺). Норма: мъже 135–175, жени 120–155 g/L."},
 {t:"Кооперативност",re:"кооператив[а-я]*",d:"Свързването на лиганд с една субединица улеснява свързването с останалите. При хемоглобина — преход от T в R състояние и сигмоидна крива."},
 {t:"Коефициент на Хил",re:"коефициент[а-я]* на Хил",d:"Мярка за кооперативността в уравнението на Хил. За HbA ≈ 2,7; за миоглобина 1 (няма кооперативност)."},
 {t:"T и R състояние",re:"[TR] състояние|напрегнат[а-я]* \\(T\\)|отпуснат[а-я]* \\(R\\)",d:"Двете конформации на хемоглобина: T (напрегнато) с нисък афинитет и солеви мостове; R (отпуснато) с висок афинитет."},
 {t:"Миоглобин",re:"миоглобин[а-я]*",d:"Мускулен белтък с една верига и един хем. Хиперболична крива, P<sub>50</sub> ≈ 2,8 mmHg — кислороден резерв."},
 {t:"Фетален хемоглобин",re:"фетал[а-я]* хемоглобин[а-я]*|HbF",d:"α₂γ₂. Свързва слабо 2,3-BPG и има по-висок афинитет (P<sub>50</sub> ≈ 19 mmHg) — улеснява преминаването на O₂ от майката към плода."},
 {t:"Метхемоглобин",re:"метхемоглобин[а-я]*|MetHb",d:"Хемоглобин с окислено желязо (Fe³⁺), което не свързва O₂ и измества кривата наляво. Антидот — метиленово синьо."},
 {t:"Кислородно съдържание",re:"кислородн[а-я]* съдържание|съдържание(то)? на O₂",d:"C<sub>O₂</sub> = 1,34 × Hb × S<sub>O₂</sub> + 0,003 × P<sub>O₂</sub> (mL/dL). Артериално ≈ 20 mL/dL."},
 {t:"Анемия",re:"анеми[а-я]*",d:"Намален хемоглобин (мъже < 135, жени < 120 g/L). Делят се по MCV: микроцитни, нормоцитни и макроцитни."},
 {t:"Система AB0",re:"AB0|AB0-систем[а-я]*",d:"Кръвногрупова система с антигени A и B (олигозахариди) и естествени IgM антитела срещу липсващите антигени."},
 {t:"Rh система",re:"Rh(?![a-zA-Z])|резус",d:"Най-важният антиген е D. Няма естествени антитела — анти-D (IgG) се образуват след сенсибилизация."},
 {t:"Аглутинация",re:"аглутин[а-я]*",d:"Слепване на еритроцитите от антитела. Основа на определянето на кръвните групи; in vivo води до хемолиза."},
 {t:"Хемолитична болест на новороденото",re:"хемолитич[а-я]* болест",d:"Разрушаване на еритроцитите на плода от майчини IgG (най-често анти-D при Rh− майка и Rh+ плод). Предпазва анти-D имуноглобулин."},
 {t:"Хемолиза",re:"хемолиз[а-я]*|хемолитич[а-я]*",d:"Разрушаване на еритроцитите — в съдовете (интраваскуларна) или в далака (екстраваскуларна)."},
 {t:"Еритроцитни индекси",re:"MCV|MCHC|MCH(?!C)",d:"MCV = Hct/RBC (80–100 fL) — среден обем; MCH = Hb/RBC (27–33 pg) — Hb в един еритроцит; MCHC = Hb/Hct (320–360 g/L) — концентрация на Hb."},
 {t:"Ретикулоцити",re:"ретикулоцит[а-я]*",d:"Млади еритроцити с остатъци от РНК (0,5–2 %). Високи при хемолиза и кръвозагуба, ниски при недостатъчно производство."},
 {t:"Еритропоетин",re:"еритропоетин[а-я]*",d:"Хормон, отделян главно от бъбреците при хипоксия. Стимулира образуването на еритроцити в костния мозък."},
 {t:"Полицитемия",re:"полицитеми[а-я]*|еритроцитоз[а-я]*",d:"Увеличена маса на еритроцитите. Първична (полицитемия вера) или вторична (хипоксия, еритропоетин)."},
 {t:"Гломерулна филтрация",re:"гломерул[а-я]* филтраци[а-я]*|GFR",d:"Обемът плазма, филтриран за минута от всички гломерули: ≈ 125 mL/min (180 L/ден). GFR = K<sub>f</sub> × нетно филтрационно налягане."},
 {t:"Филтрационна фракция",re:"филтрационн[а-я]* фракци[а-я]*",d:"GFR / бъбречен плазмен кръвоток ≈ 0,2. Расте при еферентна вазоконстрикция."},
 {t:"Аферентна и еферентна артериола",re:"аферентн[а-я]* артериол[а-я]*|еферентн[а-я]* артериол[а-я]*",d:"Аферентната внася кръв в гломерула, еферентната я изнася. Свиването на аферентната понижава GFR, а на еферентната (Ang II) — повишава P<sub>GC</sub>."},
 {t:"Капсула на Боуман",re:"капсула(та)? на Боуман",d:"Двуслойната чашка около гломерула, която събира филтрата. Налягането в нея е ≈ 18 mmHg."},
 {t:"Авторегулация на бъбречния кръвоток",re:"авторегулаци[а-я]*",d:"Запазване на GFR и кръвотока при САН ≈ 75–160 mmHg чрез миогенния механизъм и тубулогломерулната обратна връзка."},
 {t:"Macula densa",re:"macula densa",d:"Клетки в началото на дисталния тубул до собствения гломерул. Усещат NaCl и регулират аферентната артериола и отделянето на ренин."},
 {t:"Тубулогломерулна обратна връзка",re:"тубулогломерул[а-я]* обратн[а-я]* връзк[а-я]*",d:"Повече NaCl в macula densa → аденозин → аферентна вазоконстрикция → ↓ GFR. Пази дисталния нефрон от претоварване."},
 {t:"Клирънс",re:"клирънс[а-я]*",d:"Обемът плазма, напълно очистен от веществото за минута: C = U × V / P. Инулин — GFR; PAH — бъбречен плазмен кръвоток."},
 {t:"Транспортен максимум",re:"транспортн[а-я]* максимум|T<sub>m<\\/sub>|бъбречн[а-я]* праг",d:"Най-голямото количество, което преносителите могат да пренесат за минута. За глюкозата ≈ 375 mg/min; бъбречният праг е ≈ 200 mg/dL плазмена глюкоза."},
 {t:"Креатинин",re:"креатинин[а-я]*|eGFR",d:"Продукт на мускулния креатин, образува се с постоянна скорост. Филтрира се и малко се секретира — използва се за оценка на GFR (eGFR)."},
 {t:"Бримка на Хенле",re:"бримк[а-я]* на Хенле|бримков[а-я]*",d:"U-образната част на нефрона в медулата. Низходящото коляно пропуска вода, възходящото — не; дебелият възходящ сегмент изпомпва NaCl чрез NKCC2."},
 {t:"Противотоков механизъм",re:"противоток[а-я]*",d:"Умножител: бримката на Хенле създава градиент 300 → 1200 mOsm/kg в медулата. Обменник: vasa recta го пазят."},
 {t:"Vasa recta",re:"vasa recta",d:"Правите капиляри в медулата, които следват бримките. Бавният им U-образен кръвоток не отмива медуларния градиент."},
 {t:"NKCC2",re:"NKCC2",d:"Na⁺–K⁺–2Cl⁻ котранспортер в дебелия възходящ сегмент. Блокира се от фуроземид."},
 {t:"ENaC",re:"ENaC",d:"Епителен Na⁺ канал в главните клетки на събирателния канал. Засилва се от алдостерона, блокира се от амилорид."},
 {t:"Диуретици",re:"диуретик[а-я]*|диуретиц[а-я]*",d:"Лекарства, които увеличават отделянето на Na⁺ и вода: бримкови (фуроземид), тиазиди, калий-съхраняващи (амилорид, спиронолактон), осмотични (манитол), карбоанхидразни инхибитори."},
 {t:"Осмолалитет",re:"осмолалитет[а-я]*|осмоларитет[а-я]*",d:"Броят осмотично активни частици в килограм вода. Плазма ≈ 290 mOsm/kg; урина 50–1200 mOsm/kg."},
 {t:"Свободен воден клирънс",re:"свобод[а-я]* вод[а-я]* клирънс[а-я]*",d:"C<sub>H₂O</sub> = V − C<sub>osm</sub>. Положителен — отделя се чиста вода (разредена урина); отрицателен — водата се задържа."},
 {t:"ADH (вазопресин)",re:"ADH|вазопресин[а-я]*|антидиуретичн[а-я]* хормон",d:"Хормон от хипоталамуса, отделян от задната хипофиза при висок осмолалитет или голяма загуба на обем. Чрез V2 рецептори вгражда аквапорин-2 в събирателния канал."},
 {t:"Осморецептори",re:"осморецептор[а-я]*",d:"Неврони в предния хипоталамус (OVLT), които усещат промяна на осмолалитета от 1–2 % и регулират ADH и жаждата."},
 {t:"Безвкусен диабет",re:"безвкус[а-я]* диабет",d:"Голям обем разредена урина. Централен — липса на ADH; нефрогенен — бъбрекът не отговаря на ADH."},
 {t:"SIADH",re:"SIADH",d:"Синдром на неадекватна секреция на ADH: задържане на вода, концентрирана урина и еуволемична хипонатриемия."},
 {t:"Хипонатриемия и хипернатриемия",re:"хипонатриеми[а-я]*|хипернатриеми[а-я]*",d:"Na⁺ под 135 или над 145 mmol/L. Отразяват главно излишък или недостиг на вода спрямо Na⁺."},
 {t:"Ренин",re:"ренин[а-я]*",d:"Ензим от юкстагломерулните клетки, който превръща ангиотензиногена в ангиотензин I. Отделя се при ↓ налягане, ↓ NaCl в macula densa и при симпатикусова стимулация."},
 {t:"Ангиотензин II",re:"ангиотензин[а-я]*|Ang II",d:"Образува се от ангиотензин I чрез ACE. Свива артериолите (особено еферентната), стимулира алдостерона, жаждата и ADH и реабсорбцията на Na⁺."},
 {t:"ACE и ACE инхибитори",re:"ACE",d:"Ангиотензин-конвертиращ ензим, главно в белодробния ендотел; разгражда и брадикинина. ACE инхибиторите понижават налягането и Ang II."},
 {t:"Алдостерон",re:"алдостерон[а-я]*",d:"Минералкортикоид от зона гломерулоза. Стимулира се от Ang II и K⁺. Засилва реабсорбцията на Na⁺ и секрецията на K⁺ и H⁺ в събирателния канал."},
 {t:"Предсърден натриуретичен пептид",re:"натриуретич[а-я]* пептид|ANP",d:"Отделя се при разтягане на предсърдията. Засилва натриурезата, повишава GFR и потиска ренина, алдостерона и ADH."},
 {t:"Налягателна натриуреза",re:"налягател[а-я]* натриурез[а-я]*|натриурез[а-я]*",d:"Повишеното артериално налягане увеличава отделянето на Na⁺ и вода. Според Guyton — основният дългосрочен регулатор на налягането."},
 {t:"Юкстагломерулен апарат",re:"юкстагломерул[а-я]*|ЮГА",d:"Macula densa, юкстагломерулните (гранулирани) клетки на аферентната артериола и мезангиалните клетки. Регулира GFR и отделянето на ренин."});
GL.forEach((g,i)=>{g.id=i;g.rx=new RegExp(g.re,"gi")});
GL_ORDER.length=0;[...GL].sort((a,b)=>b.t.split(/\s+/).length-a.t.split(/\s+/).length).forEach(g=>GL_ORDER.push(g));
window.__EXTRA_EXP={hemost:EXP_HS,hbcurve:EXP_HB,bgroups:EXP_BG,gfr:EXP_GFR,tubule:EXP_TUB,volreg:EXP_VR};
// модулът се зарежда след основния скрипт: показва отново текущата тема, вече с новите раздели
try{route()}catch(e){console.error(e)}
