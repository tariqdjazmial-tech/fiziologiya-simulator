/* ===== Измерване на артериалното налягане по Коротков =====
   Маншет на мишницата, анероиден манометър и слушалка над a. brachialis в лакътната ямка.
   Студентът помпа маншета, пуска въздуха със скорост 2–3 mmHg/s, слуша тоновете на Коротков
   (фаза I–V) и сам отчита систолното и диастолното налягане. Звукът се синтезира в браузъра (Web Audio).
   Модел: пулсова вълна P(t) между диастолно и систолно налягане (с инцизура); под маншета артерията
   се отваря, когато P(t) > ефективното налягане на маншета. Тонът е удар при рязкото отваряне;
   силата и характерът му зависят от това колко над диастолното е маншетът (фази на Коротков). */
(function(){"use strict";
if(typeof VIEWS==="undefined")return;
const PRE={
 norm:{n:"Здрав възрастен 120/80",s:120,d:80,hr:70},
 htn:{n:"Хипертония 165/100",s:165,d:100,hr:78},
 gap:{n:"Хипертония с аускултаторна празнина",s:178,d:104,hr:72,gap:[132,150]},
 ar:{n:"Аортна регургитация (тоновете не изчезват)",s:150,d:45,hr:84,ar:1},
 brady:{n:"Брадикардия 48/min",s:125,d:78,hr:48},
 af:{n:"Предсърдно мъждене (неравен ритъм)",s:132,d:84,hr:96,af:1},
 kid:{n:"Дете 8 г. 100/60",s:100,d:60,hr:92},
 small:{n:"Твърде тесен маншет при обемна мишница",s:130,d:84,hr:72,cuff:"small"}};
const CUFF={ok:{n:"Подходящ (40 % от обиколката)",k:1},small:{n:"Тесен маншет",k:0.86},large:{n:"Широк маншет",k:1.06}};

function viewBP(main){
  main.innerHTML=`<h2>Измерване на артериалното налягане (метод на Коротков)</h2><p class="lead">Маншет на мишницата, манометър и слушалка над <b>a. brachialis</b> в лакътната ямка. Напомпай маншета над систолното, пускай въздуха бавно и слушай: първият тон е <b>систолното</b>, изчезването на тоновете — <b>диастолното</b> налягане. Отбележи ги сам и сравни с истинските стойности.</p>
  <div class="card" style="padding:10px">
   <div class="btns"><select id="bpPre" style="width:auto;max-width:100%"></select><button class="b primary" id="bpPump">Помпай (+30 mmHg)</button><button class="b" id="bpHold">Задръж и помпай</button><button class="b" id="bpDump">Изпусни целия въздух</button><button class="b" id="bpSnd">🔈 Звук: изключен</button></div>
   <canvas id="bpC" style="width:100%;height:380px;display:block;margin-top:6px;border-radius:10px"></canvas>
   <div class="btns" style="margin-top:8px"><button class="b" id="bpSys">Чух първия тон → систолно</button><button class="b" id="bpDia">Тоновете изчезнаха → диастолно</button><button class="b" id="bpRes">Нулирай отчитането</button></div>
   <div class="stats" id="bpS" style="margin-top:8px"></div><div class="note" id="bpN" style="min-height:3.2em"></div>
   <canvas class="plot" id="bpG" style="height:220px;margin-top:6px"></canvas>
   <div class="legend"><span><i style="background:#c8102e"></i>налягане в артерията</span><span><i style="background:#1c7ed6"></i>налягане в маншета</span><span><i style="background:#7950f2;width:10px;height:10px;border-radius:50%"></i>тон на Коротков</span><span><i class="box" style="background:rgba(200,16,46,.10)"></i>зона на тоновете</span></div>
   <div class="grid2" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px"><div id="bpc1"></div><div id="bpc2"></div></div></div>
  <h3>Експерименти</h3><div id="ex"></div>`;
  const sel=$("#bpPre");sel.innerHTML=Object.entries(PRE).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("");
  const S={};
  S.rate=slider($("#bpc1"),{label:"Скорост на изпускане (вентил)",min:0,max:10,step:0.5,value:2.5,unit:"mmHg/s",hint:"правилно: 2–3 mmHg/s (по-бързо → подценяване)",d:1},()=>{});
  S.s=slider($("#bpc1"),{label:"Истинско систолно налягане",min:80,max:220,step:1,value:120,unit:"mmHg"},()=>{});
  S.d=slider($("#bpc1"),{label:"Истинско диастолно налягане",min:30,max:130,step:1,value:80,unit:"mmHg"},()=>{});
  S.hr=slider($("#bpc2"),{label:"Сърдечна честота",min:40,max:150,step:1,value:70,unit:"/min"},()=>{});
  $("#bpc2").insertAdjacentHTML("beforeend",`<div class="ctrl"><label><span>Маншет</span></label><select id="bpCuff">${Object.entries(CUFF).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("")}</select></div>
   <label class="small" style="display:block;margin:6px 0"><input type="checkbox" id="bpArm"> Ръката виси под нивото на сърцето (+10 mmHg хидростатично)</label>`);
  const st={pc:0,t:0,ph:0,inf:0,hold:0,beats:[],hist:[],marks:[],sys:null,dia:null,pre:"norm",af:0,ar:0,gap:null,rr:60/70,beatT:0,lastSound:-9,snd:0,tone:0,phase:"—"};
  const setPre=k=>{const p=PRE[k];st.pre=k;sel.value=k;S.s.set(p.s);S.d.set(p.d);S.hr.set(p.hr);$("#bpCuff").value=p.cuff||"ok";st.af=p.af||0;st.ar=p.ar||0;st.gap=p.gap||null;st.sys=st.dia=null;st.marks=[];st.pc=0;upd()};
  sel.onchange=()=>setPre(sel.value);
  /* звук: удар (нискочестотен тон + шумов импулс), шум при фаза II, приглушен при фаза IV */
  let AC=null,MG=null;const audio=()=>{if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=0.9;MG.connect(AC.destination)}catch(e){AC=null}};
  const thump=(amp,kind)=>{if(!AC||!st.snd||amp<=0.01)return;const t0=AC.currentTime,o=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=kind==="muffled"?140:kind==="crisp"?420:300;
    o.type="sine";o.frequency.setValueAtTime(kind==="muffled"?48:62,t0);o.frequency.exponentialRampToValueAtTime(34,t0+0.12);g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(0.9*amp,t0+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t0+(kind==="muffled"?0.2:0.13));
    o.connect(g);g.connect(lp);lp.connect(MG);o.start(t0);o.stop(t0+0.25);
    const n=Math.floor(AC.sampleRate*(kind==="murmur"?0.16:0.05)),buf=AC.createBuffer(1,n,AC.sampleRate),dd=buf.getChannelData(0);for(let i=0;i<n;i++)dd[i]=(Math.random()*2-1)*Math.pow(1-i/n,kind==="murmur"?1:3);
    const src=AC.createBufferSource(),ng=AC.createGain(),bp=AC.createBiquadFilter();bp.type="bandpass";bp.frequency.value=kind==="murmur"?260:kind==="crisp"?520:300;bp.Q.value=0.9;src.buffer=buf;ng.gain.value=(kind==="murmur"?0.55:kind==="muffled"?0.12:0.3)*amp;src.connect(bp);bp.connect(ng);ng.connect(MG);src.start(t0)};
  $("#bpSnd").onclick=()=>{audio();st.snd^=1;if(AC&&AC.state==="suspended")AC.resume();$("#bpSnd").textContent=st.snd?"🔊 Звук: включен":"🔈 Звук: изключен"};
  $("#bpPump").onclick=()=>{st.pc=Math.min(300,st.pc+30)};
  $("#bpDump").onclick=()=>{st.pc=0};
  const hb=$("#bpHold");["pointerdown"].forEach(e=>hb.addEventListener(e,()=>{st.hold=1}));["pointerup","pointerleave","pointercancel"].forEach(e=>hb.addEventListener(e,()=>{st.hold=0}));
  $("#bpSys").onclick=()=>{st.sys=Math.round(st.pc);st.marks.push({t:st.t,y:st.pc,c:"#c8102e"});upd()};
  $("#bpDia").onclick=()=>{st.dia=Math.round(st.pc);st.marks.push({t:st.t,y:st.pc,c:"#1c7ed6"});upd()};
  $("#bpRes").onclick=()=>{st.sys=st.dia=null;st.marks=[];upd()};
  /* пулсова вълна: бърз възход, връх, инцизура, диастолно спадане; при аортна регургитация — висок пулс и ниско диастолно */
  const wave=(f,s,d,ar)=>{const up=f<0.13?Math.sin(f/0.13*Math.PI/2):f<0.36?1-0.18*((f-0.13)/0.23):f<0.4?0.82-0.12*((f-0.36)/0.04):f<0.46?0.7+0.06*Math.sin((f-0.4)/0.06*Math.PI):0.76*Math.exp(-(f-0.46)*(ar?5.5:2.6));return d+(s-d)*Math.max(0,up)};
  const truth=()=>{const arm=$("#bpArm").checked?10:0;return {s:S.s.get()+arm,d:Math.min(S.d.get(),S.s.get()-10)+arm}};
  const kf=()=>CUFF[$("#bpCuff").value].k;
  /* фаза на Коротков по налягането в маншета */
  const phaseOf=(pc,s,d)=>{if(pc>=s||pc<3)return "—";if(st.gap&&pc>st.gap[0]&&pc<st.gap[1])return "празнина";const r=(s-pc)/Math.max(10,s-d);if(st.ar&&pc<d+8)return "IV";if(pc<=d)return "V";if(r<0.15)return "I";if(r<0.4)return "II";if(pc>d+8)return "III";return "IV"};
  const upd=()=>{const tr=truth(),eff=Math.round(st.pc*kf());$("#bpS").innerHTML=[["Маншет",`${Math.round(st.pc)} mmHg`],["Фаза",st.phase],["Отчетено",`${st.sys??"—"}/${st.dia??"—"}`],["Истинско",(st.sys!=null&&st.dia!=null)?`${tr.s}/${tr.d}`:"скрито до отчитане"]].reduce((h,[a,b])=>h,"");$("#bpS").innerHTML=statsHTML([["Маншет",`${Math.round(st.pc)} mmHg`],["Фаза на Коротков",st.phase],["Отчетено",`${st.sys??"—"}/${st.dia??"—"}`],["Истинско",(st.sys!=null&&st.dia!=null)?`${tr.s}/${tr.d}`:"скрито до отчитане"]]);
    let n="";if(st.sys!=null&&st.dia!=null){const es=st.sys-tr.s,ed=st.dia-tr.d;n=`Отчете <b>${st.sys}/${st.dia}</b>, истинското е <b>${tr.s}/${tr.d}</b> mmHg (грешка ${es>0?"+":""}${es} / ${ed>0?"+":""}${ed}). `;
      if(S.rate.get()>4)n+="Вентилът е пуснат твърде бързо — между два удара маншетът пада с няколко mmHg и стойностите се подценяват. ";
      if(kf()<1)n+="Тесният маншет предава по-малко от налягането си към артерията — показва по-високо от истинското. ";if(kf()>1)n+="Широкият маншет леко подценява. ";
      if($("#bpArm").checked)n+="Ръката е под нивото на сърцето: хидростатичното налягане добавя ≈ 10 mmHg. ";if(st.gap)n+="Ако си спрял да помпаш под празнината, щеше да отчетеш грешно систолно — затова се палпира радиалният пулс при напомпване. ";
      if(st.ar)n+="При аортна регургитация тоновете се чуват почти до нула — за диастолно се приема фаза IV (заглъхването). ";}
    else n=st.pc<5?"Напомпай маншета на ≈ 30 mmHg над очакваното систолно (или докато радиалният пулс изчезне), после пускай бавно.":st.pc>=tr.s/kf()?"Артерията под маншета е затворена — няма кръвоток и няма тонове. Пусни въздуха бавно.":"Слушай: натисни бутона, когато чуеш първия тон, и когато тоновете изчезнат.";
    $("#bpN").innerHTML=n};
  const cv=$("#bpC");let raf=0,last=performance.now();
  /* --- рисуване --- */
  const draw=()=>{const dpr=Math.min(2,window.devicePixelRatio||1),W=cv.clientWidth,H=cv.clientHeight;if(!W)return;if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
    const g=cv.getContext("2d");g.setTransform(dpr,0,0,dpr,0,0);const narrow=W<640;
    const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#1b1d22");bg.addColorStop(1,"#0f1013");g.fillStyle=bg;g.fillRect(0,0,W,H);
    const tr=truth(),pe=st.pc*kf(),P=st.P||tr.d,open=P>pe,frac=Math.max(0,Math.min(1,(P-pe)/18));
    /* манометър */
    const R=narrow?Math.min(W*0.2,62):Math.min(H*0.34,112),cx=narrow?R+12:R+26,cy=narrow?R+14:H/2;
    let gr=g.createRadialGradient(cx-R*0.3,cy-R*0.35,R*0.1,cx,cy,R*1.08);gr.addColorStop(0,"#fafafa");gr.addColorStop(1,"#c9ccd2");g.fillStyle="#2b2e35";g.beginPath();g.arc(cx,cy,R*1.1,0,7);g.fill();g.fillStyle=gr;g.beginPath();g.arc(cx,cy,R,0,7);g.fill();
    const A=v=>-Math.PI*0.75+v/300*Math.PI*1.5-Math.PI/2+Math.PI/2;g.strokeStyle="#22252b";
    for(let v=0;v<=300;v+=2){const a=A(v)-Math.PI/2,l=v%20===0?R*0.14:v%10===0?R*0.09:R*0.05;g.lineWidth=v%20===0?1.6:0.8;g.beginPath();g.moveTo(cx+Math.cos(a)*(R*0.92),cy+Math.sin(a)*(R*0.92));g.lineTo(cx+Math.cos(a)*(R*0.92-l),cy+Math.sin(a)*(R*0.92-l));g.stroke();
      if(v%40===0){g.fillStyle="#22252b";g.font=`600 ${Math.max(9,R*0.13)}px system-ui,sans-serif`;g.textAlign="center";g.textBaseline="middle";g.fillText(v,cx+Math.cos(a)*R*0.62,cy+Math.sin(a)*R*0.62)}}
    g.fillStyle="#5e6066";g.font=`500 ${Math.max(8,R*0.1)}px system-ui,sans-serif`;g.fillText("mmHg",cx,cy+R*0.36);
    const na=A(st.pc+0.6*Math.sin(st.t*40)*(open&&st.pc>tr.d?1:0))-Math.PI/2;g.strokeStyle="#c8102e";g.lineWidth=2.4;g.beginPath();g.moveTo(cx-Math.cos(na)*R*0.14,cy-Math.sin(na)*R*0.14);g.lineTo(cx+Math.cos(na)*R*0.86,cy+Math.sin(na)*R*0.86);g.stroke();g.fillStyle="#22252b";g.beginPath();g.arc(cx,cy,R*0.07,0,7);g.fill();
    /* ръка в надлъжен разрез: кожа, подкожие, мускул, артерия; маншет отгоре; слушалка в лакътната ямка */
    const x0=narrow?12:cx+R+40,x1=W-14,ay=narrow?cy+R+30+(H-cy-R-30)*0.5:H/2,w=x1-x0,th=narrow?(H-cy-R-36)*0.42:H*0.27;
    const skin=g.createLinearGradient(0,ay-th,0,ay+th);skin.addColorStop(0,"#e8b39a");skin.addColorStop(0.1,"#f2c9b3");skin.addColorStop(0.2,"#f6dccc");skin.addColorStop(0.35,"#c97a72");skin.addColorStop(0.65,"#b9635d");skin.addColorStop(0.8,"#f6dccc");skin.addColorStop(1,"#e8b39a");
    g.fillStyle=skin;g.beginPath();g.moveTo(x0,ay-th);g.bezierCurveTo(x0+w*0.5,ay-th*1.04,x0+w*0.8,ay-th*0.94,x1,ay-th*0.82);g.lineTo(x1,ay+th*0.82);g.bezierCurveTo(x0+w*0.8,ay+th*0.94,x0+w*0.5,ay+th*1.04,x0,ay+th);g.closePath();g.fill();
    g.strokeStyle="rgba(120,40,40,.18)";g.lineWidth=1;for(let k=0;k<9;k++){const yy=ay-th*0.3+k*th*0.075;g.beginPath();g.moveTo(x0,yy);g.bezierCurveTo(x0+w*0.3,yy+3,x0+w*0.6,yy-3,x1,yy);g.stroke()}
    /* маншет */
    const c0=x0+w*0.12,c1=x0+w*0.56,bul=Math.min(1,st.pc/220);
    const sq=Math.min(1,pe/Math.max(40,P));const cuffT=th*(0.18+0.22*bul);
    [-1,1].forEach(sd=>{const yb=ay+sd*(th*(1-0.08*bul)),yo=yb+sd*cuffT;const cg=g.createLinearGradient(0,yb,0,yo);cg.addColorStop(0,"#3c5a8c");cg.addColorStop(1,"#26395c");g.fillStyle=cg;g.beginPath();g.moveTo(c0,yb);g.bezierCurveTo(c0,yo,c1,yo,c1,yb);g.closePath();g.fill();
      g.strokeStyle="rgba(255,255,255,.13)";g.lineWidth=1;for(let x=c0+6;x<c1-4;x+=7){g.beginPath();g.moveTo(x,yb+sd*2);g.lineTo(x,yb+sd*cuffT*0.6);g.stroke()}});
    /* артерия: под маншета се стеснява според трансмуралното налягане */
    const r0=th*0.11,rad=x=>{if(x<c0-8||x>c1+8)return r0*(0.92+0.08*(P-tr.d)/Math.max(10,tr.s-tr.d));const u=Math.sin(Math.PI*Math.max(0,Math.min(1,(x-c0+8)/(c1-c0+16))));const o=open?0.18+0.82*frac:0.02;return r0*(1-u*(1-o)*Math.min(1,sq*1.05))};
    g.fillStyle="#7a1720";g.beginPath();for(let x=x0;x<=x1;x+=3)g.lineTo(x,ay-rad(x)-2.5);for(let x=x1;x>=x0;x-=3)g.lineTo(x,ay+rad(x)+2.5);g.closePath();g.fill();
    const bl=g.createLinearGradient(0,ay-r0,0,ay+r0);bl.addColorStop(0,"#d32a35");bl.addColorStop(0.5,"#9c0f1c");bl.addColorStop(1,"#d32a35");g.fillStyle=bl;g.beginPath();for(let x=x0;x<=x1;x+=3)g.lineTo(x,ay-rad(x));for(let x=x1;x>=x0;x-=3)g.lineTo(x,ay+rad(x));g.closePath();g.fill();
    /* еритроцити: спират под затворен маншет; при рязко отваряне — струя и вихри след маншета */
    st.cells=st.cells||Array.from({length:70},(_,i)=>({x:Math.random(),y:(Math.random()-0.5)*1.6,s:0.6+Math.random()*0.5,v:0}));
    const flow=pe<tr.d?1:open?frac:0,turb=pe<tr.s&&pe>tr.d&&open?1:0;
    st.cells.forEach(c=>{const X=x0+c.x*w,rr=rad(X);if(!(X>c0-6&&X<c1+6&&!open&&pe>tr.d)){c.v=0.0009+0.0055*flow*(1+1.5*turb*(X>c1?1:0))}else c.v*=0.8;c.x+=c.v;if(X>c1&&turb)c.y+=Math.sin(st.t*14+c.x*40)*0.08;c.y=Math.max(-0.85,Math.min(0.85,c.y*0.995));if(c.x>1){c.x=0;c.y=(Math.random()-0.5)*1.6}
      const yy=ay+c.y*rad(X)*0.9;g.save();g.translate(X,yy);g.rotate(turb&&X>c1?Math.sin(st.t*9+c.x*30):0);const e=r0*0.32*c.s;const rg=g.createRadialGradient(0,0,e*0.2,0,0,e);rg.addColorStop(0,"#c2333d");rg.addColorStop(0.55,"#e0505a");rg.addColorStop(1,"#8f0d18");g.fillStyle=rg;g.beginPath();g.ellipse(0,0,e,e*0.45,0,0,7);g.fill();g.restore()});
    /* слушалка (мембрана) в лакътната ямка */
    const sx=x0+w*0.72,sy=ay-th*0.92;g.fillStyle="#9aa0a8";g.beginPath();g.ellipse(sx,sy-6,th*0.24,th*0.07,0,0,7);g.fill();const sg=g.createLinearGradient(sx-th*0.24,0,sx+th*0.24,0);sg.addColorStop(0,"#6c727b");sg.addColorStop(0.5,"#e3e6ea");sg.addColorStop(1,"#6c727b");g.fillStyle=sg;g.fillRect(sx-th*0.24,sy-th*0.16,th*0.48,th*0.1);
    g.strokeStyle="#3a3d44";g.lineWidth=4;g.beginPath();g.moveTo(sx,sy-th*0.16);g.bezierCurveTo(sx,sy-th*0.6,sx+th*0.6,sy-th*0.6,Math.min(W-8,sx+th*0.9),sy-th*0.95);g.stroke();
    if(st.tone>0.02){g.strokeStyle=`rgba(121,80,242,${0.7*st.tone})`;g.lineWidth=2;for(let k=1;k<=3;k++){g.beginPath();g.arc(sx,sy-th*0.1,th*0.25*k*(1.2-st.tone*0.5),Math.PI*1.1,Math.PI*1.9);g.stroke()}}
    /* надписи */
    g.fillStyle="rgba(255,255,255,.85)";g.font="600 12px system-ui,sans-serif";g.textAlign="left";g.textBaseline="alphabetic";
    g.fillText("маншет",c0+4,ay-th-cuffT-6);g.fillText("a. brachialis",x0+6,ay-r0-8);g.fillText("слушалка",sx-th*0.2,sy-th*0.28-4);
    g.fillStyle=open?"#ff8787":"#9aa0a8";g.fillText(pe>=tr.s?"артерията е затворена":pe>tr.d?(open?"отваря се за миг → тон":"затворена между ударите"):"отворена — ламинарен поток (тишина)",c0,ay+th+cuffT+16)};
  /* графика: налягане в артерията и в маншета, тоновете */
  const graph=()=>{const t1=st.t,xs=st.hist.map(h=>h[0]),tr=truth();plot($("#bpG"),{xmin:Math.max(0,t1-20),xmax:Math.max(20,t1),ymin:0,ymax:Math.max(200,tr.s+30),xlabel:"време, s",ylabel:"mmHg",
    series:[{x:xs,y:st.hist.map(h=>h[1]),color:"#c8102e",width:1.4},{x:xs,y:st.hist.map(h=>h[2]),color:"#1c7ed6",width:2.2}],
    marks:st.beats.filter(b=>b.t>t1-20).map(b=>({x:b.t,y:b.pc,color:"#7950f2"})).concat(st.marks.filter(m=>m.t>t1-20).map(m=>({x:m.t,y:m.y,color:m.c}))),
    hlines:[{y:tr.s,color:"rgba(200,16,46,.5)",label:"систолно"},{y:tr.d,color:"rgba(28,126,214,.5)",label:"диастолно"}]})};
  const step=n=>{raf=requestAnimationFrame(step);if(!document.body.contains(cv)){cancelAnimationFrame(raf);return}const dt=Math.min(0.05,(n-last)/1000);last=n;st.t+=dt;
    const tr=truth();if(st.hold)st.pc=Math.min(300,st.pc+70*dt);else if(st.pc>0)st.pc=Math.max(0,st.pc-S.rate.get()*dt*(1+0.002*st.pc));
    st.beatT+=dt;if(st.beatT>=st.rr){st.beatT=0;const base=60/S.hr.get();st.rr=st.af?base*(0.6+0.8*Math.random()):base;st.bS=st.af?tr.s+(Math.random()-0.5)*24:tr.s;st.fired=0}
    const f=Math.min(1,st.beatT/Math.min(st.rr,0.95));st.P=wave(f,st.bS||tr.s,tr.d,st.ar);const pe=st.pc*kf();
    st.phase=phaseOf(pe,st.bS||tr.s,tr.d);
    if(!st.fired&&st.P>pe&&pe<(st.bS||tr.s)&&pe>0.5){st.fired=1;const ph=st.phase;let amp=0,kind="tap";
      if(ph==="I")amp=0.55;else if(ph==="II"){amp=0.45;kind="murmur"}else if(ph==="III"){amp=1;kind="crisp"}else if(ph==="IV"){amp=0.35;kind="muffled"}
      if(amp>0){thump(amp,kind);st.tone=1;st.beats.push({t:st.t,pc:st.pc})}}
    st.tone*=Math.pow(0.02,dt);
    st.hist.push([st.t,st.P,st.pc]);if(st.hist.length>1400)st.hist.splice(0,200);if(st.beats.length>200)st.beats.splice(0,50);
    draw();if((st.k=(st.k||0)+1)%3===0){graph();upd()}};
  raf=requestAnimationFrame(step);
  (window.__cleanups=window.__cleanups||[]).push(()=>{cancelAnimationFrame(raf);try{AC&&AC.close()}catch(e){}});
  setPre("norm");window.__bp=st;
  experiments($("#ex"),EXP_BP,"bp",e=>{setPre(e.pre||"norm");if(e.cuff)$("#bpCuff").value=e.cuff;if(e.arm!=null)$("#bpArm").checked=!!e.arm;if(e.rate)S.rate.set(e.rate);cv.scrollIntoView({behavior:"smooth",block:"center"})});
}
const EXP_BP=[
 {q:"Пускаш въздуха с 10 mmHg/s при пулс 60/min. Как ще излезе отчетеното налягане?",opts:["Точно","Систолното — по-ниско, диастолното — по-ниско","Двете — по-високи"],a:1,set:{pre:"norm",rate:10},expl:"Между два удара маншетът пада с ≈ 10 mmHg, затова първият тон се чува чак когато маншетът вече е под систолното. Правилно: 2–3 mmHg/s (или 2 mmHg на удар при брадикардия)."},
 {q:"Твърде тесен маншет на обемна мишница. Какво показва апаратът?",opts:["По-високо от истинското","По-ниско","Същото"],a:0,set:{pre:"small",cuff:"small"},expl:"Тесният маншет предава по-малко от налягането си към артерията, затова трябва повече налягане, за да я затвори — „псевдохипертония от маншета“. Ширината на маншета трябва да е ≈ 40 % от обиколката."},
 {q:"Пациент с хипертония: тоновете изчезват при 150 и се появяват отново при 132 mmHg. Какво е систолното?",opts:["132 mmHg","150 mmHg","Около 178 mmHg — над празнината"],a:2,set:{pre:"gap"},expl:"Аускултаторната празнина е тиха зона във фаза II. Ако маншетът е напомпан само до 140–150, систолното се подценява. Затова първо се палпира радиалният пулс и маншетът се помпа 30 mmHg над изчезването му."},
 {q:"Аортна регургитация: тоновете се чуват почти до 0 mmHg. Кое се приема за диастолно?",opts:["0 mmHg","Фаза IV — заглъхването на тоновете","Няма как да се измери"],a:1,set:{pre:"ar"},expl:"При висок ударен обем и ниско диастолно налягане (и при деца, бременни, след натоварване) тоновете не изчезват. Тогава за диастолно се отчита фаза IV."},
 {q:"Ръката виси надолу под нивото на сърцето. Как се променя показанието?",opts:["Не се променя","Расте с ≈ 10 mmHg","Пада с ≈ 10 mmHg"],a:1,set:{pre:"norm",arm:1},expl:"Хидростатичното налягане: 10 cm воден стълб ≈ 7,4 mmHg; при ръка, висяща 13–14 cm под сърцето, ≈ 10 mmHg. Мишницата трябва да е на нивото на сърцето."}];
const TESTS_BP=[
 {q:"Какво поражда тоновете на Коротков?",opts:["Затварянето на сърдечните клапи","Турбулентната струя и трептенето на стената, когато притисната артерия рязко се отваря","Шумът на въздуха в маншета","Пулсът на вената"],a:1,expl:"Под маншета артерията се отваря само в пика на пулсовата вълна. Струята е бърза и турбулентна и разтриса стената — това се чува като удар."},
 {q:"Кога се чува първият тон (фаза I)?",opts:["Когато налягането в маншета падне малко под систолното","Когато падне под диастолното","Веднага щом започне изпускането","При средното артериално налягане"],a:0,expl:"Първият тон = систолно налягане: върхът на вълната за първи път надвишава налягането в маншета."},
 {q:"Какво съответства на диастолното налягане при възрастен?",opts:["Фаза III","Фаза IV","Фаза V — изчезването на тоновете","Фаза II"],a:2,expl:"При възрастни — фаза V. Фаза IV (заглъхване) се ползва, когато тоновете не изчезват (аортна регургитация, бременност, деца)."},
 {q:"Защо под диастолното налягане няма тонове?",opts:["Артерията е напълно затворена","Артерията е отворена през целия цикъл и потокът е ламинарен","Маншетът е изпуснат","Сърцето спира"],a:1,expl:"Когато маншетът е под диастолното, артерията не се затваря нито за миг — няма рязко отваряне и турбулентност."},
 {q:"Каква ширина на маншета е правилна?",opts:["≈ 20 % от обиколката на мишницата","≈ 40 % от обиколката","Цялата мишница","Няма значение"],a:1,expl:"Ширина ≈ 40 %, дължина на балона ≈ 80 % от обиколката. Тесният маншет надценява, широкият леко подценява."},
 {q:"С каква скорост се изпуска маншетът?",opts:["10 mmHg/s","2–3 mmHg/s","0,5 mmHg/s","Наведнъж"],a:1,expl:"2–3 mmHg/s (или 2 mmHg на удар). По-бързо — подценяване; прекалено бавно — венозен застой и болка."},
 {q:"Средното артериално налягане при 120/80 mmHg е около:",opts:["100 mmHg","93 mmHg","80 mmHg","110 mmHg"],a:1,expl:"СрАН ≈ ДН + (СН − ДН)/3 = 80 + 40/3 ≈ 93 mmHg (защото диастолата трае по-дълго)."},
 {q:"Какво е аускултаторна празнина?",opts:["Пауза между два удара","Тиха зона между систолното и диастолното при някои хипертоници","Разлика между двете ръце","Липса на пулс"],a:1,expl:"Тоновете изчезват за 10–30 mmHg във фаза II и после се появяват отново. Палпирането на радиалния пулс предпазва от подценяване."}];
const BOOK_BP={title:"Измерване на артериалното налягане",adv:"манометър, маншет и слушалка с тоновете на Коротков — отчиташ сам и сравняваш",
 lead:"Артериалното налягане се мери неинвазивно с маншет и слушалка — методът на Коротков (1905) и до днес е еталонът в клиниката. По Guyton, гл. 15.",
 secs:[
  {h:"Принцип на метода",html:`<p>Маншетът притиска <b>a. brachialis</b> към раменната кост. Докато налягането в него е над систолното, артерията е затворена и под нея няма кръвоток. Когато маншетът се изпуска, в един момент <b>върхът</b> на пулсовата вълна надвишава налягането в маншета — артерията се отваря за миг, кръвта минава като бърза турбулентна струя и стената трепти. В слушалката над лакътната ямка това се чува като почукване — <b>тон на Коротков</b>.</p><p>Докато маншетът е между систолното и диастолното, артерията се отваря и затваря при всеки удар. Под диастолното тя остава отворена през целия цикъл, потокът е ламинарен и <b>тоновете изчезват</b>.</p>`},
  {h:"Петте фази на Коротков",html:`<ul><li><b>Фаза I</b> — първи ясни почуквания: <b>систолно налягане</b>.</li><li><b>Фаза II</b> — почукванията стават шумни, „съскащи“ (тук може да има <b>аускултаторна празнина</b>).</li><li><b>Фаза III</b> — отново ясни и по-силни удари.</li><li><b>Фаза IV</b> — рязко заглъхване, тоновете стават меки и приглушени.</li><li><b>Фаза V</b> — тоновете изчезват: <b>диастолно налягане</b> при възрастни.</li></ul><p>Когато тоновете не изчезват (аортна регургитация, бременност, деца, хиперкинетично състояние), за диастолно се отчита фаза IV.</p>`},
  {h:"Как се мери правилно",html:`<ol><li>Пациентът седи спокойно 5 минути, гърбът е облегнат, краката не са кръстосани; без кафе и цигари 30 минути преди това.</li><li>Мишницата е <b>на нивото на сърцето</b>; маншетът е на 2–3 cm над лакътната ямка, с ширина ≈ 40 % от обиколката.</li><li>Палпира се радиалният пулс и маншетът се помпа на 30 mmHg над изчезването му.</li><li>Слушалката се поставя над a. brachialis; въздухът се пуска с <b>2–3 mmHg/s</b>.</li><li>Отчитат се фаза I и V, закръглено до 2 mmHg; първото измерване е на двете ръце, после — на ръката с по-високите стойности.</li></ol>`},
  {h:"Чести грешки",html:`<table class="t"><tr><th>Грешка</th><th>Ефект</th></tr><tr><td>Тесен маншет</td><td>надценява (до 10–30 mmHg)</td></tr><tr><td>Широк маншет</td><td>леко подценява</td></tr><tr><td>Ръката под нивото на сърцето</td><td>надценява (≈ 0,8 mmHg на cm)</td></tr><tr><td>Бързо изпускане</td><td>подценява систолното, неточно диастолно</td></tr><tr><td>Помпане само до 140 при празнина</td><td>грубо подценява систолното</td></tr><tr><td>Разговор, пълен пикочен мехур, болка</td><td>надценява с 5–15 mmHg</td></tr></table>`},
  {h:"Стойности и средно артериално налягане",html:`<p>Оптимално: < 120/80 mmHg; нормално: 120–129/80–84; високо нормално: 130–139/85–89; хипертония: ≥ 140/90 mmHg (ESC/ESH). <b>Пулсовото налягане</b> = систолно − диастолно (≈ 40 mmHg). <b>Средното артериално налягане</b> ≈ ДН + ⅓ (СН − ДН), защото диастолата трае по-дълго — около 93 mmHg при 120/80. То определя перфузията на органите.</p>`}],
 key:["Първият тон (фаза I) = систолно; изчезване на тоновете (фаза V) = диастолно.","Тоновете идват от турбулентна струя при рязко отваряне на притисната артерия.","Маншет ≈ 40 % от обиколката; ръката на нивото на сърцето; 2–3 mmHg/s.","Аускултаторна празнина: първо палпирай радиалния пулс.","СрАН ≈ ДН + (СН − ДН)/3."]};
Object.assign(VIEWS,{bp:viewBP});
if(typeof TESTS!=="undefined")TESTS.bp=TESTS_BP;
if(typeof MOD_NAMES!=="undefined")MOD_NAMES.bp="Измерване на кръвното налягане";
if(typeof BOOK!=="undefined")BOOK.bp=BOOK_BP;
window.__EXTRA_EXP=Object.assign(window.__EXTRA_EXP||{},{bp:EXP_BP});
if(typeof GL!=="undefined")GL.push({t:"Тонове на Коротков",re:"Коротков[а-я]*",d:"Звуци над притисната артерия при измерване на кръвното налягане: турбулентна струя, когато артерията рязко се отваря. Фаза I = систолно, фаза V (изчезване) = диастолно налягане."},{t:"Аускултаторна празнина",re:"аускултаторн[а-я]* празнин[а-я]*",d:"Тиха зона между систолното и диастолното налягане при някои хипертоници; може да доведе до подценяване на систолното, ако не се палпира пулсът."});
})();
