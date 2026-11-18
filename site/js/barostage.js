/* ===== Барорефлекс — стъпка по стъпка =====
   Карта над симулацията: схема на рефлексната дъга (SVG), в която на всяка стъпка светват участващите звена и по връзките
   текат импулси; 3D изгледът отива на съответното място, а първата стъпка вдига налягането в живия модел (фенилефрин),
   така че стойностите отдолу (АН, ЧСС, симпатикус/вагус) се променят заедно с обяснението. По Guyton & Hall, гл. 18. */
(function(){"use strict";
if(typeof VIEWS==="undefined"||!VIEWS.baro)return;
const N={ // възли: x, y, ширина, надпис (2 реда) — отляво рецепторите, в средата продълговатият мозък, отдолу ефекторите
 cs:[90,330,124,["Каротиден синус","и аортна дъга"]],
 ix:[90,205,124,["n. IX (Hering)","n. X (аортен)"]],
 nts:[285,75,124,["NTS","(солитарно ядро)"]],
 na:[285,170,124,["N. ambiguus","дорзално ядро на X"]],
 cvlm:[470,75,124,["CVLM","GABA-ергичен"]],
 rvlm:[470,170,124,["RVLM","симпатиков център"]],
 iml:[470,262,124,["Гръбначен мозък","IML, T1–L2"]],
 sa:[285,330,124,["SA възел","M₂ → I K,ACh ↑, I f ↓"]],
 hrt:[470,350,124,["Миокард","β₁ — контрактилитет"]],
 ves:[660,262,124,["Артериоли и вени","α₁ — тонус"]],
 bp:[660,360,124,["Артериално","налягане"]]};
const E=[ // връзки: от, до, вид (exc — възбуждане, inh — потискане), id
 ["cs","ix","exc","a1"],["ix","nts","exc","a2"],["nts","cvlm","exc","c1"],["cvlm","rvlm","inh","c2"],["rvlm","iml","exc","c3"],["iml","hrt","exc","s1"],["iml","ves","exc","s2"],
 ["nts","na","exc","v1"],["na","sa","exc","v2"],["sa","bp","exc","f1"],["hrt","bp","exc","f2"],["ves","bp","exc","f3"],["bp","cs","exc","fb"]];
const ST=[
 {t:"Налягането се покачва — стената на синуса се разтяга",nodes:["cs","bp"],edges:["fb"],view:"cs",act:"phen",
  d:"Барорецепторите са разклонени нервни окончания в адвентицията на <b>каротидния синус</b> (разширението в началото на a. carotis interna) и в <b>аортната дъга</b>. Когато налягането се вдигне, стената се разтяга и в окончанията се отварят механочувствителни катионни канали (<b>PIEZO1 и PIEZO2</b>) — възниква рецепторен потенциал. Честотата на импулсите расте с налягането между ≈ 60 и 180 mmHg (най-стръмно около 100 mmHg) и още повече при <b>бърза</b> промяна. Тук налягането се вдига с фенилефрин (α₁-агонист) — гледай как реагира моделът отдолу."},
 {t:"Аферентните импулси стигат до солитарното ядро",nodes:["cs","ix","nts"],edges:["a1","a2"],view:"br",
  d:"От каротидния синус импулсите тръгват по <b>нерва на Hering</b> към <b>n. glossopharyngeus (IX)</b>, а от аортната дъга — по <b>n. vagus (X)</b>. И двата пътя завършват в <b>nucleus tractus solitarii (NTS)</b> в продълговатия мозък. Медиаторът е глутамат. Каротидните рецептори са по-чувствителни и реагират в по-широк диапазон от аортните."},
 {t:"NTS потиска симпатиковия център",nodes:["nts","cvlm","rvlm","iml"],edges:["c1","c2","c3"],view:"br",
  d:"NTS възбужда <b>каудалната вентролатерална медула (CVLM)</b>, чиито GABA-ергични неврони <b>потискат</b> пресимпатиковите неврони в <b>ростралната вентролатерална медула (RVLM)</b> — вазомоторния център. RVLM нормално поддържа тоничен симпатиков поток към <b>интермедиолатералния стълб (IML)</b> на гръбначния мозък (T1–L2). При високо налягане този поток намалява."},
 {t:"NTS активира вагуса към сърцето",nodes:["nts","na","sa"],edges:["v1","v2"],view:"ht",
  d:"Едновременно NTS активира <b>nucleus ambiguus</b> (и дорзалното моторно ядро на X). Вагусовите влакна отделят <b>ACh</b> в SA възела: <b>M₂</b> рецепторите чрез Gᵢ намаляват cAMP (по-малък <b>I<sub>f</sub></b>), а βγ отварят <b>GIRK</b> канали (I<sub>K,ACh</sub>) — клетката се хиперполяризира и фаза 4 става по-полегата. Честотата пада за 1–2 удара (вагусът действа бързо), забавя се и AV провеждането."},
 {t:"Съдовете се отпускат",nodes:["iml","ves"],edges:["s2"],view:"lat",
  d:"По-малко симпатикови импулси → по-малко <b>норадреналин</b> на α₁ рецепторите на гладката мускулатура: <b>артериолите</b> се разширяват и общото периферно съпротивление пада; <b>вените</b> се отпускат и задържат повече кръв, затова венозното връщане и преднатоварването намаляват. Пада и симпатиковият стимул за ренина в бъбрека. Съдовият ефект се развива за 5–30 s — по-бавно от вагусовия."},
 {t:"Сърцето работи по-слабо",nodes:["iml","hrt"],edges:["s1"],view:"ht",
  d:"Намалява и симпатиковото действие върху <b>β₁</b> рецепторите на миокарда: по-малко cAMP и Ca²⁺ → по-слаба контракция (отрицателен инотропен ефект), по-малък ударен обем. Заедно с по-ниската честота сърдечният дебит (ЧСС × УО) намалява."},
 {t:"Налягането се връща — отрицателна обратна връзка",nodes:["sa","hrt","ves","bp","cs"],edges:["f1","f2","f3","fb"],view:"ov",
  d:"Средното налягане = сърдечен дебит × периферно съпротивление; и двете намаляват, затова налягането се връща към изходното, а барорецепторите отново стрелят по-рядко. Рефлексът е <b>буфер</b> срещу бързи колебания (изправяне, кървене, напъване); при денервация колебанията на налягането стават 2–3 пъти по-големи. При продължителна промяна рецепторите се <b>пренастройват</b> за 1–2 дни, затова дългосрочното ниво се определя от бъбреците. При <b>спадане</b> на налягането веригата работи обратно: по-малко импулси → повече симпатикус, по-малко вагус → тахикардия и вазоконстрикция."}];
function svg(){const w=760,h=452;let s=`<svg viewBox="0 0 ${w} ${h}" class="bstg-svg" role="img" aria-label="Рефлексна дъга на барорефлекса"><defs>
  <marker id="bsA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
  <marker id="bsI" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M5,0 L5,10" stroke="currentColor" stroke-width="3"/></marker></defs>`;
  s+=`<rect x="205" y="30" width="345" height="182" rx="18" class="bstg-zone"/><text x="210" y="22" class="bstg-zt">продълговат мозък</text>`;
  const C=k=>{const n=N[k];return [n[0],n[1]]};
  E.forEach(([a,b,kind,id])=>{const [x1,y1]=C(a),[x2,y2]=C(b),dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,o1=34,o2=40;
    /* конците се изрязват по ръба на правоъгълниците; обратната връзка и пътят от SA възела минават под схемата */
    const clip=(k,sg)=>{const n=N[k],hw=n[2]/2+5,hh=29,t=Math.min(Math.abs(ux)>1e-6?hw/Math.abs(ux):1e9,Math.abs(uy)>1e-6?hh/Math.abs(uy):1e9);return [n[0]+sg*ux*t,n[1]+sg*uy*t]};
    let p1=clip(a,1),p2=clip(b,-1),mx=(p1[0]+p2[0])/2,my=(p1[1]+p2[1])/2;
    if(id==="fb"){p1=[N.bp[0],N.bp[1]+29];p2=[N.cs[0],N.cs[1]+29];mx=375;my=478}
    if(id==="f1"){p1=[N.sa[0]+20,N.sa[1]+29];p2=[N.bp[0]-30,N.bp[1]+29];mx=470;my=412}
    s+=`<path id="bse-${id}" class="bstg-e ${kind}" d="M${p1[0].toFixed(1)},${p1[1].toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" marker-end="url(#${kind==="inh"?"bsI":"bsA"})"/>`});
  Object.entries(N).forEach(([k,[x,y,bw,t]])=>{s+=`<g id="bsn-${k}" class="bstg-n"><rect x="${x-bw/2}" y="${y-24}" width="${bw}" height="48" rx="12"/><text x="${x}" y="${y-4}" class="t1">${t[0]}</text><text x="${x}" y="${y+13}" class="t2">${t[1]}</text></g>`});
  return s+`</svg>`}
const css=`.bstg{padding:12px 12px 14px}.bstg h3{margin:0 0 6px}.bstg-svg{width:100%;height:auto;display:block;margin:6px 0 4px}
.bstg-zone{fill:color-mix(in srgb,var(--accent) 5%,transparent);stroke:color-mix(in srgb,var(--accent) 22%,transparent);stroke-dasharray:4 4}.bstg-zt{font-size:12px;fill:var(--muted);font-weight:600}
.bstg-n rect{fill:var(--panel);stroke:var(--line);stroke-width:1.4;transition:all .35s}.bstg-n text{text-anchor:middle;fill:var(--muted);transition:fill .35s}.bstg-n .t1{font-size:13px;font-weight:700}.bstg-n .t2{font-size:10.5px}
.bstg-n.on rect{fill:color-mix(in srgb,#c8102e 10%,var(--panel));stroke:#c8102e;stroke-width:2.2;filter:drop-shadow(0 0 6px rgba(200,16,46,.35))}.bstg-n.on text{fill:var(--ink)}
.bstg-e{fill:none;stroke:var(--line);stroke-width:2;color:var(--line);transition:stroke .35s,color .35s}.bstg-e.inh{stroke-dasharray:5 4}
.bstg-e.on{stroke:#1c7ed6;color:#1c7ed6;stroke-width:2.6;stroke-dasharray:7 9;animation:bstgFlow .9s linear infinite}.bstg-e.inh.on{stroke:#c8102e;color:#c8102e}
@keyframes bstgFlow{to{stroke-dashoffset:-16}}
.bstg-steps{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}.bstg-steps button{min-width:34px}.bstg-steps button.on{background:#1f2329!important;color:#fff!important}
.bstg-txt{min-height:7.5em}.bstg-leg{font-size:12px;color:var(--muted);display:flex;gap:14px;flex-wrap:wrap}.bstg-leg i{display:inline-block;width:22px;height:0;border-top:2.6px solid #1c7ed6;vertical-align:middle;margin-right:6px}.bstg-leg i.inh{border-top:2.6px dashed #c8102e}
@media (prefers-reduced-motion:reduce){.bstg-e.on{animation:none}}`;
const orig=VIEWS.baro;
VIEWS.baro=function(main){orig(main);if(!document.getElementById("bstgCss")){const st=document.createElement("style");st.id="bstgCss";st.textContent=css;document.head.appendChild(st)}
  const lead=main.querySelector(".lead");const card=document.createElement("div");card.className="card bstg";
  card.innerHTML=`<h3>Барорефлексът стъпка по стъпка</h3><div class="bstg-steps">${ST.map((s,i)=>`<button class="b" type="button" data-i="${i}">${i+1}</button>`).join("")}<button class="b" type="button" data-n="-1">◀︎ Назад</button><button class="b primary" type="button" data-n="1">Напред ▶︎</button><button class="b" type="button" data-p="1">▶︎ Автоматично</button></div>
   ${svg()}<div class="bstg-leg"><span><i></i>възбуждане (импулси текат)</span><span><i class="inh"></i>потискане</span><span>3D изгледът и моделът отдолу следват стъпките</span></div>
   <div class="note bstg-txt"></div>`;
  (lead&&lead.nextElementSibling?main.insertBefore(card,lead.nextElementSibling):main.prepend(card));
  let cur=-1,timer=null;
  const go=i=>{i=Math.max(0,Math.min(ST.length-1,i));const s=ST[i];const first=cur!==i;cur=i;
    card.querySelectorAll(".bstg-steps [data-i]").forEach(b=>b.classList.toggle("on",+b.dataset.i===i));
    card.querySelectorAll(".bstg-n").forEach(g=>g.classList.toggle("on",s.nodes.includes(g.id.slice(4))));
    card.querySelectorAll(".bstg-e").forEach(p=>p.classList.toggle("on",s.edges.includes(p.id.slice(4))));
    card.querySelector(".bstg-txt").innerHTML=`<b>${i+1}. ${s.t}</b><br>${s.d}`;try{linkTerms(card.querySelector(".bstg-txt"))}catch(e){}
    const vb=main.querySelector(`[data-av="${s.view}"]`);vb&&vb.click();
    if(first&&s.act==="phen"){const r=main.querySelector('[data-e="reset"]');r&&r.click();setTimeout(()=>{const p=main.querySelector('[data-e="phen"]');p&&!p.classList.contains("primary")&&p.click()},400)}};
  card.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.i!=null)go(+b.dataset.i);if(b.dataset.n)go(cur+ +b.dataset.n);
    if(b.dataset.p){if(timer){clearInterval(timer);timer=null;b.textContent="▶︎ Автоматично"}else{go(cur<0||cur===ST.length-1?0:cur+1);timer=setInterval(()=>{if(cur>=ST.length-1){clearInterval(timer);timer=null;b.textContent="▶︎ Автоматично";return}go(cur+1)},9000);b.textContent="⏸︎ Спри"}}});
  (window.__cleanups=window.__cleanups||[]).push(()=>{if(timer)clearInterval(timer)});
  /* първоначално: показва първата стъпка без да променя модела */
  cur=0;card.querySelectorAll(".bstg-steps [data-i]").forEach(b=>b.classList.toggle("on",+b.dataset.i===0));card.querySelectorAll(".bstg-n").forEach(g=>g.classList.toggle("on",ST[0].nodes.includes(g.id.slice(4))));card.querySelectorAll(".bstg-e").forEach(p=>p.classList.toggle("on",ST[0].edges.includes(p.id.slice(4))));card.querySelector(".bstg-txt").innerHTML=`<b>1. ${ST[0].t}</b><br>${ST[0].d.replace("Тук налягането се вдига с фенилефрин (α₁-агонист) — гледай как реагира моделът отдолу.","Натисни „Напред“ — моделът отдолу ще вдигне налягането с фенилефрин.")}`;cur=-1};
})();
