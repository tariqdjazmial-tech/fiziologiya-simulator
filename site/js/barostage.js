/* ===== Барорефлекс — поетапно в самата 3D симулация =====
   Като другите симулации „стъпка по стъпка“: бутони Пауза / Назад / Следваща стъпка / Отначало над 3D изгледа, заглавие на стъпката
   в изгледа, списък на стъпките и обяснение под него. На всяка стъпка в 3D светят само участващите структури, импулси текат само по
   нейните нерви (window.__baroStage), камерата отива там, а живият модел е с повишено налягане (фенилефрин), за да се вижда отговорът.
   По Guyton & Hall, гл. 18. */
(function(){"use strict";
if(typeof VIEWS==="undefined"||!VIEWS.baro)return;
const ST=[
 {short:"Разтягане на синуса",badge:"PIEZO1/2 · рецепторен потенциал",view:"cs",parts:["aff_cs","aff_ao"],hl:["sinus","aorta"],
  t:"Налягането се покачва — стената на каротидния синус се разтяга",
  d:"Барорецепторите са разклонени нервни окончания в адвентицията на <b>каротидния синус</b> (разширението в началото на a. carotis interna) и на <b>аортната дъга</b>. При по-високо налягане стената се разтяга и в окончанията се отварят механочувствителни катионни канали (<b>PIEZO1 и PIEZO2</b>) — възниква рецепторен потенциал и честотата на импулсите расте. Барорецепторите реагират между ≈ 60 и 180 mmHg (най-чувствително около 100 mmHg) и особено силно на <b>бърза</b> промяна. В модела налягането е вдигнато с фенилефрин."},
 {short:"Аферентни нерви → NTS",badge:"n. IX (Hering) · n. X",view:"aff",parts:["aff_cs","aff_ao"],hl:["sinus","aorta","nts"],
  t:"Импулсите стигат до солитарното ядро",
  d:"От каротидния синус импулсите тръгват по <b>нерва на Hering</b> към <b>n. glossopharyngeus (IX)</b>, а от аортната дъга — по <b>n. vagus (X)</b>. Двата пътя завършват в <b>nucleus tractus solitarii (NTS)</b> в продълговатия мозък; медиаторът е глутамат. Каротидните рецептори са по-чувствителни от аортните."},
 {short:"NTS ⊣ RVLM: по-малко симпатикус",badge:"CVLM (GABA) потиска RVLM",view:"br",parts:["nts_cv","cv_rv","sy_cord"],hl:["nts","cvlm","rvlm","cord"],
  t:"NTS потиска симпатиковия център",
  d:"NTS възбужда <b>каудалната вентролатерална медула (CVLM)</b>; нейните GABA-ергични неврони <b>потискат</b> пресимпатиковите неврони в <b>ростралната вентролатерална медула (RVLM)</b> — вазомоторния център. RVLM нормално поддържа тоничен поток към <b>интермедиолатералния стълб (IML)</b> на гръбначния мозък (T1–L2). При високо налягане този поток намалява — импулсите по пътя към гръбначния мозък оредяват."},
 {short:"NTS → вагус → SA възел",badge:"ACh · M₂ · GIRK · ↓ I f",view:"vag",parts:["nts_na","vag"],hl:["nts","na","sa"],
  t:"Вагусът забавя сърцето",
  d:"NTS активира <b>nucleus ambiguus</b> (и дорзалното моторно ядро на X). Вагусовите влакна отделят <b>ACh</b> в синусовия възел: <b>M₂</b> рецепторите чрез Gᵢ намаляват cAMP (по-малък <b>I<sub>f</sub></b>), а βγ отварят <b>GIRK</b> канали (I<sub>K,ACh</sub>) — клетката се хиперполяризира и диастолната деполяризация става по-полегата. Честотата пада още след 1–2 удара; забавя се и AV провеждането."},
 {short:"Съдовете се отпускат",badge:"↓ норадреналин на α₁",view:"art",parts:["sy_cord","sy_pre","sy_ves"],hl:["cord","gang","art"],
  t:"Артериолите и вените се отпускат",
  d:"По-малко симпатикови импулси през ганглиите на симпатиковия ствол → по-малко <b>норадреналин</b> на α₁ рецепторите на гладката мускулатура. <b>Артериолите</b> се разширяват и общото периферно съпротивление пада; <b>вените</b> се отпускат и задържат повече кръв, затова венозното връщане намалява. Пада и симпатиковият стимул за ренина. Съдовият отговор се развива за 5–30 s — по-бавно от вагусовия."},
 {short:"Сърцето — по-слабо съкращение",badge:"↓ β₁ · ↓ контрактилитет",view:"ht",parts:["sy_cord","sy_pre","sy_heart"],hl:["cord","gang","heart","sa"],
  t:"Сърцето се съкращава по-слабо",
  d:"Намалява и симпатиковото действие върху <b>β₁</b> рецепторите на миокарда: по-малко cAMP и Ca²⁺ → по-слабо съкращение и по-малък ударен обем. Заедно с по-ниската честота сърдечният дебит (ЧСС × УО) пада."},
 {short:"Налягането се връща",badge:"отрицателна обратна връзка",view:"ov",parts:null,hl:null,
  t:"Налягането се връща към нормата — отрицателна обратна връзка",
  d:"Средното налягане = сърдечен дебит × периферно съпротивление; и двете намаляват, затова налягането се връща към изходното, а барорецепторите отново стрелят по-рядко — дъгата се затваря. Рефлексът е <b>буфер</b> срещу бързи колебания (изправяне, кървене, напъване); без него колебанията на налягането са 2–3 пъти по-големи. При продължителна промяна рецепторите се <b>пренастройват</b> за 1–2 дни, затова дългосрочното ниво се определя от бъбреците. При <b>спадане</b> на налягането веригата работи обратно: по-малко импулси → повече симпатикус, по-малко вагус → тахикардия и вазоконстрикция."}];
const DUR=11;
const orig=VIEWS.baro;
VIEWS.baro=function(main){orig(main);const w3=main.querySelector("#w3");if(!w3)return;const card=w3.closest(".card")||w3.parentElement;
  const I=typeof SVI!=="undefined"?SVI:{pause:"",prev:"",next:"",rs:"",play:""};
  /* бутоните на стъпките — над 3D изгледа */
  const bar=document.createElement("div");bar.className="btns bstg-bar";bar.innerHTML=`<button class="b primary" type="button" data-k="play">${I.pause||""}Пауза</button><button class="b" type="button" data-k="prev">${I.prev||""}Назад</button><button class="b" type="button" data-k="next">${I.next||""}Следваща стъпка</button><button class="b" type="button" data-k="rs">${I.rs||""}Отначало</button><button class="b" type="button" data-k="free">Свободен модел</button>`;
  w3.parentElement.insertBefore(bar,w3);
  /* заглавие и значка в самия изглед */
  const cap=document.createElement("div");cap.style.cssText="position:absolute;left:10px;top:10px;right:56px;z-index:2;pointer-events:none;display:flex;justify-content:space-between;align-items:flex-start;gap:8px";
  const capL=document.createElement("div"),capR=document.createElement("div");capL.className="cap-l";capR.className="cap-r";[capL,capR].forEach((d,k)=>{d.style.cssText=`font-weight:700;font-size:${k?12.5:14}px;background:color-mix(in srgb,var(--panel) 88%,transparent);border:1px solid var(--line);border-radius:10px;padding:6px 10px;max-width:${k?"40%":"62%"}`;cap.appendChild(d)});w3.appendChild(cap);
  /* показателите (ЧСС, УО, MAP) — долу вляво, за да не се застъпват със заглавието */
  const mv=setInterval(()=>{const o=[...w3.querySelectorAll(":scope > div")].find(d=>/^ЧСС/.test(d.textContent||""));if(o){o.style.top="auto";o.style.bottom="8px";clearInterval(mv)}},300);
  /* списък на стъпките и обяснение — под изгледа */
  const views=main.querySelector('[data-av="ov"]');const after=(views&&views.closest(".btns"))||w3;
  const panel=document.createElement("div");panel.className="grid2";panel.style.cssText="grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:10px;margin-top:8px";
  panel.innerHTML=`<div class="card" style="margin:0;padding:8px"><ol class="stg" data-k="list"></ol></div><div class="card" style="margin:0"><div data-k="txt" style="font-size:15px;min-height:8.5em"></div></div>`;
  after.parentElement.insertBefore(panel,after.nextSibling);
  const q=k=>card.querySelector(`[data-k="${k}"]`)||panel.querySelector(`[data-k="${k}"]`);
  const st={i:0,play:1,t:0,applied:0,free:0};
  const applyBP=()=>{const r=main.querySelector('[data-e="reset"]');r&&r.click();setTimeout(()=>{const p=main.querySelector('[data-e="phen"]');p&&!p.classList.contains("primary")&&p.click()},300);st.applied=1};
  const render=()=>{const s=ST[st.i];q("list").innerHTML=ST.map((x,i)=>`<li data-i="${i}" class="${i===st.i?"on":""}"><span>${i+1}</span>${x.short}</li>`).join("");
    q("list").querySelectorAll("li").forEach(li=>li.onclick=()=>{st.play=0;setB();go(+li.dataset.i)});
    q("txt").innerHTML=`<b>${st.i+1}. ${s.t}</b><div style="margin-top:6px">${s.d}</div>`;try{linkTerms(q("txt"))}catch(e){}
    capL.textContent=`${st.i+1}. ${s.short}`;capR.textContent=s.badge;cap.style.display=st.free?"none":"flex"};
  const go=i=>{st.i=Math.max(0,Math.min(ST.length-1,i));st.t=0;st.free=0;const s=ST[st.i];
    /* 3D изгледът чете стъпката (i), напредъка в нея (u, 0…1) и изгледа на камерата */
    window.__baroStage={i:st.i,u:0,parts:s.parts,hl:s.hl,view:s.view};
    if(!st.applied||st.i===0)applyBP();render();setB()};
  const setB=()=>{const b=q("play");b.innerHTML=st.play?`${I.pause||""}Пауза`:`${I.play||I.next||""}Пусни`;b.classList.toggle("primary",!!st.play);q("free").classList.toggle("primary",!!st.free)};
  bar.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const k=b.dataset.k;
    if(k==="play"){st.play^=1;if(st.free){st.free=0;go(st.i)}setB()}
    if(k==="prev"){st.play=0;go(st.i-1)}if(k==="next"){st.play=0;go(st.i+1)}if(k==="rs"){st.play=1;go(0)}
    if(k==="free"){st.free=1;st.play=0;window.__baroStage=null;cap.style.display="none";setB()}});
  /* часовник на стъпката: анимацията в 3D следва u; при пауза спира */
  const tick=setInterval(()=>{if(!document.body.contains(card)){clearInterval(tick);return}if(st.free)return;if(st.t<DUR)st.t=Math.min(DUR,st.t+(st.play||st.t<DUR*0.92?0.1:0));if(window.__baroStage)window.__baroStage.u=st.t/DUR;
    if(st.play&&st.t>=DUR){if(st.i<ST.length-1)go(st.i+1);else{st.play=0;setB()}}},100);
  (window.__cleanups=window.__cleanups||[]).push(()=>{clearInterval(tick);clearInterval(mv);window.__baroStage=null});
  setTimeout(()=>go(0),800)};
})();
