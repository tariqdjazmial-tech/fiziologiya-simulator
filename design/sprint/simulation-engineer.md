# Simulation Engineer: архитектура, преглед на моделите, нови модули

Обхват: само анализ, без промени в кода. Номерата на редовете са към текущото дърво `site/` (2026-11-24).
Проверено числено в node (код, извлечен от файловете): `runHeart`, `glFlux`, `hpFlux`, `ansCalc`. Не са проверявани числено: `respreg`, `gasx`, `lungmech`, `reflex`, `thermo`, `hemost`, `volreg` (за тях има само преглед на кода).

---

## 1. Integration guide (English code terms)

### 1.1 Script load order (`site/index.html:7777-7787`)
`index.html` inline script (helpers, SYLLABUS, engines, BOOK, VIEWS, `route()` at :7771) → `blood-renal.js` → `resp-renal-3d.js`, `blood-3d.js`, `bpsim.js`, `theory-cv.js`, `barostage.js` → `gutdata.js`, `bladder.js` → **`sys2.js`** → `zorg.js`, `figs2.js`, `theory-rest.js` → `en.js`, `en_re.js`, `i18n.js` → `config.js` … `shell.js` (overrides `buildNav`, `VIEWS.home`) … `chrome.js`, `fullscreen.js`, `mobile.js`, `glass.js`.

Implications:
- `mkSim`, `Z`, `ZC`, `Z_*` registries exist only from `sys2.js` on. A module file must load **after** `sys2.js`.
- `sys2.js:2343-2350` merges the `Z_*` registries into the core tables and calls `route()` again. A file loaded **after** that tail must register itself (see 1.6), or the code must go into `sys2.js` above line 2343. The second option is the simplest.
- `READY` is computed **once** at `index.html:5894` from `SYLLABUS`. A nav entry must therefore be written into `SYLLABUS` in `index.html:278-334`. A later `SYLLABUS.push` is not seen by `READY`, the pager or the home page.
- `build.py` is stale: it reads `/home/claude/...` and `fiziologiya-simulator.html` (build.py:5,173). The source of truth is now `site/index.html`. The HANDOFF rule "new `<script>` → add it to build.py" means: put the tag in `site/index.html` and, if build.py is ever revived, add it to the injected list at build.py:178 or keep it in the HTML.

### 1.2 Core helpers (index.html)
- `plot(cv,o)` :349 draws on a canvas. `o={xmin,xmax,ymin,ymax,xlabel,ylabel,series:[{x[],y[],color,width,dash}],hlines:[{y,color,label,dash}],marks:[{x,y,color,label}],shade:[{x0,x1,color}],texts:[{x,text,color,align}]}`. It skips off-screen canvases, and its labels pass through `fillText`, which `i18n.js` translates.
- `slider(parent,o,onchange)` :379. `o={label,min,max,step,value,unit,d(decimals),show(v)→string,hint}`. Returns `{get,set}`.
- `experiments(parent,list,key,apply,label)` :391. Items are `{q,opts[],a,expl,set?}`, stored in localStorage as `fizsim_exp_<key>`. A click calls `apply(e.set)`.
- `statsHTML([[k,v]])` :1210, `rcv(cv)` :5917 (DPR-correct 2D context), `rLoop(anchor,fn(dt))` :5921 (rAF loop, **dt clamped to 0.05 s**, auto-stops when the anchor is detached, registered in `__cleanups`), `rArrow`, `rTag`, `RFONT`, `fmt(x,d)` :346 (decimal comma), `css(var)`, `store.get/set` :337, `linkTerms(root)` :5339.
- `stageViewer(parent,cfg,before)` :3952 is the step-by-step 3D viewer. `STAGES` :5268 maps topic → stage cfg. In `sys2.js`, `zAddStg(main,cfg)` :441 inserts one, and `zCellStg({...})` :430 builds cell scenes with `ZK`.

### 1.3 `mkSim(main,c)`: `site/js/sys2.js:12-39`
It renders: `h2`, `lead`, preset `<select id=zPre>`, event buttons, pause button (only when `c.step`), canvas `#zC` (virtual size `cw×ch`, default 640×340, scaled to fit), stats `#zS`, preset info `#zN`, dynamic note `#zD`, plot canvases `#zP<i>`, `legend`, sliders split into 2 columns, `after` HTML, then "Експерименти".

| field | required | signature / meaning |
|---|---|---|
| `key` | yes | experiment storage key **and** must equal the topic id (progress lookup uses `__EXTRA_EXP[id]`) |
| `h2`, `lead` | yes | HTML strings (`h2` is removed inside BOOK view) |
| `sl` | yes | array of slider specs (1.2) plus `k` = param name. Values are read live into `p[k]` |
| `pre` | yes | `{id:{n:name, set:{k:v}, info:html, ev?:evKey}}`. The first key is the default. `p.pre` = current preset id |
| `ev` | no | `{id:{l:label, f(s,p,t)}}`. Buttons mutate the state `s` (bolus, bleed, meal…) |
| `init(p)` | if `step` | returns a fresh state object. Called on every preset change / experiment |
| `step(s,p,dt,t)` | no | integrates `s` in place. Without it the sim is static (recalc on slider input) |
| `calc(p,s,t)` | **yes** | returns `R`, the derived values for stats/draw. Called after every frame of stepping, or on slider input when static |
| `stats(p,R,s,t)` | yes | `[[label,valueString]]`. Refreshed every 8 frames when stepping |
| `note(p,R,s,t)` | no | dynamic HTML interpretation. It is re-linked only when the string changes |
| `rec(s,p,t)` | no | returns a row array pushed to `hist` when `t-last≥recdt` |
| `plots` | no | `[{h, f(p,R,hist,s,t)→plot-options}]` |
| `draw(g,p,R,t,dt,s)` | **yes** | canvas drawing in virtual `cw×ch` coordinates (use `Z.box/org/bar/arr/dots/T`) |
| `exp` | **yes** (array) | `Z_EXP[key]`. `set:{pre, sl:{k:v}, ev}` → `setPre(set.pre||first, set)` |
| `speed` | no (1) | model-time units per real second |
| `dtmax` | no (0.05) | max sub-step. `n=ceil(dt·speed/dtmax)` explicit-Euler sub-steps per frame |
| `recdt`, `hmax` | no (0, 700) | history sampling interval / ring length |
| `ch`, `cw`, `legend`, `after` | no | layout extras |

Important behaviour:
- Explicit Euler is the only integrator. Stability needs `dtmax < 2·τ_min` (in model units), and accuracy needs about `τ_min/10`.
- Model time slows on slow devices because the frame dt is clamped to 0.05 s.
- Slider moves during stepping do not reset the state. Only a preset change calls `init`.
- Element ids are global (`#zC`, `#zS`, …), so there can be **only one mkSim per page**.
- Hard-coded Bulgarian UI strings ("⏸︎ Пауза", "Експерименти") are translated through `__EN`.

### 1.4 Registries
- Core (index.html): `SYLLABUS` :278, `BOOK` :7108, `TESTS` :5397, `MOD_NAMES` :5454, `GL` :5272 (+`GL_ORDER` :5337), `VIEWS` :7712, `STAGES` :5268, `TB` :5377 ("Сверка с учебника"), `EXP_*` lists via `expStats` :407 / `expLists` :5892 / `EXP_OF` :5455, which all spread `window.__EXTRA_EXP`.
- sys2 (`sys2.js:40`): `Z_BOOK, Z_TESTS, Z_EXP, Z_NAMES, Z_VIEWS, Z_GL`, merged at :2343-2347. `Z_NAVL` :435 holds short labels for stage buttons.
- Router `route()` :7744: if `BOOK[v]` exists, `renderBook` :7677 draws tabs `LTABS` :7676 (Теория / Симулация / Тест / Речник), and the sim is built lazily into `#simBody` by `VIEWS[v](body)`. The sim is torn down when the tab is left (`__cleanup(s)`, `onresize`).

### 1.5 Adding a NEW topic `foo`, end to end
1. **Nav**: in `index.html` SYLLABUS add `{id:"foo", t:"Заглавие", ready:true}` to an existing section. A new section `{id:"XIII",name,items}` also needs an image key in `shell.js:238` `IMG={…}`. Section I is free (`shell.js:4`); everything else is premium.
2. **Model + view** (in `sys2.js` before :2343, or in a new file, see 1.6):
   ```js
   function fooFlux(s,p){/* pure: derivatives + derived */ return {...}}
   Z_EXP.foo=[{q,opts,a,set:{pre,sl,ev},expl}, ...];      // 4–6 items
   function viewFoo(main){ /* zAddStg(main,STG_FOO); optional 3D */
     mkSim(main,{key:"foo",h2,lead,ch:330,speed,dtmax,recdt,hmax,
       sl:[...],ev:{...},pre:{norm:{n,info},...},exp:Z_EXP.foo,
       init:()=>({...}),step(s,p,dt){const F=fooFlux(s,p); s.x+=F.dx*dt;...},
       rec:(s,p,t)=>[t,...],calc:(p,s)=>fooFlux(s,p),stats,note,plots,legend,draw})}
   ```
3. **Theory**: `Z_BOOK.foo={title, adv:"<hint for the Sim tab>", lead, secs:[{h, html, fig?:BF.zFoo(), cap?}], key:["Запомни…"]}`. SVG figures use the `BF._` helpers `{S,t,tt,box,ln,ar,cr,pth}` (example at sys2.js:1784). Extra sections for existing topics go into `theory-rest.js` `ADD`.
4. **Tests**: `Z_TESTS.foo=[{q,opts,a,expl}]` (16–20 items is the house norm). Stored as `t_foo`.
5. **Names/registration**: `Z_NAMES.foo="…"; Z_VIEWS.foo=viewFoo;`. Optional: `STAGES.foo=STG_X` (for book view) or `zAddStg` inside the view.
6. **Glossary**: `Z_GL.push({t:"Термин", re:"bg-regex[а-я]*", d:"дефиниция"})`. It is skipped if the title already exists.
7. **English**: append `Object.assign(window.__EN,{ "bg": "en", ... })` at the end of `en.js` for every Cyrillic string: SYLLABUS title, h2, lead, slider labels/hints, preset `n`/`info`, `ev.l`, stats labels, note branches, canvas `fillText` strings, plot x/ylabel, legend, BOOK, tests, experiments, glossary `t`/`d`. Strings containing numbers are matched with each number replaced by `#` (`i18n.js` `lookup`). Keys containing `<`/`>` need an extra `&gt;`-escaped copy (HANDOFF). For glossary detection in English add `window.__EN_RE["English title"]="regex"` (`en_re.js`). Verify with `__HARVEST=1` + `fizsim_lang="en"` → `window.__miss`.
8. **Script tag** (only if a new file is used): insert `<script src="js/foo.js"></script>` after `sys2.js` in `site/index.html:7787`. Leave `config.js` alone.
9. **Checks**: run the model in node to steady state for every preset and slider extreme, check `dtmax` against the smallest τ, then check in the page (Playwright, tab `[data-tab=sim]`).

### 1.6 Registering from a file loaded after `sys2.js`
The tail merge has already run, so do it directly:
```js
Object.assign(BOOK,{foo:B});Object.assign(TESTS,{foo:Q});MOD_NAMES.foo=N;VIEWS.foo=viewFoo;
window.__EXTRA_EXP.foo=E;GL.push(...g);GL.forEach((g,i)=>{g.id=i;g.rx=new RegExp(g.re,"gi")});
GL_ORDER.length=0;[...GL].sort((a,b)=>b.t.split(/\s+/).length-a.t.split(/\s+/).length).forEach(g=>GL_ORDER.push(g));
if(location.hash.slice(1)==="foo")route();
```
Proposal: wrap this once as `zRegister(id,{view,book,tests,exp,name,gl,stage})` in `sys2.js`. Every new module file would use it (this is reusable component #0).

### 1.7 Other engines (index.html)
- **AP**: `runHH(p)` :479. Classic Hodgkin–Huxley (squid; gNa 120, gK 36, gL 0.3), Euler dt=0.01 ms, Ca²⁺ shifts the gates (`s=6·(Ca−2.4)`), Nernst for E_K/E_Na. Precomputed trace; modes dc/pulse/pair.
- **Cardiac cycle**: `runHeart(p)` :570. Time-varying elastance (double-Hill `elastanceShape` :569), exponential EDPVR, diodes with resistances Rmv/Rav, 2-element Windkessel (R, C), fixed left-atrial pressure, 10 beats, dt 0.5 ms → EDV/ESV/SV/EF/CO/SBP/DBP/MAP.
- **ECG**: `EcgEngine()` :2737 is a rhythm scheduler (P/QRS event lists for sinus, Wenckebach, Mobitz II, PVC, AV3, AF, flutter, VT, VF, QT=0.37·∛RR), projected through the Dower matrix (`ecgLeads` :2695). Cell models: `sanStep` :2944 (simplified SA node: If, ICaL, ICaT, IK, IKACh, ANS modulation) and `lr1Step` :2953 (Luo–Rudy I + Ito, Rush–Larsen gates).
- **Haemodynamics**: `poiseuille` :3250 (Re, Blasius for turbulence), `guytonCurves` :3255 (VR = (Pms−RAP)/RVR, Hill cardiac-function curve, bisection for the equilibrium).
- **Baroreflex**: `Baro0()` :3472 + `baroStep(m,dt)` :3475. Three compliances (arterial, venous, central), beat-by-beat ejection with SV from the Starling curve `BARO_CO` :3471, sigmoid baroreceptor firing + dP/dt, vagal/sympathetic efferents with 1.3 s delay, TPR, venous unstressed volume, HR, contractility. Events: stand, Valsalva, massage, bleed, drugs.
- **Starling**: `slForces/slStep` :3714. Microcirculation with pre/post resistances, Pif(Vif), lymph, protein leak.
- **Lungs/gas**: `lmDerive` :5949, `gxSolve` :6273 (alveolar gas equation + Bohr integration along the capillary + shunt + Fick), respiratory controller `drives/steadyAt` inside `viewRespReg` :6426.
- **blood-renal.js**: `hsDer` :2 (coagulation ODE), `hbCalc` :176 (Hill + Bohr/T/DPG/CO), `gfrCore/gfrSolve` :400 (Deen-type glomerular profile + autoregulation), `tubCalc` :532, `vrDer/vrKid/vrStep` :665-679 (TBW, Na, ADH, RAAS, ANP).

---

## 2. Математическите модели и слабите места

| Тема | Модел | Оценка |
|---|---|---|
| ap | HH, Euler 0.01 ms | ✓ стандарт |
| cardap | LR-I (Rush–Larsen) ✓; SA възел: собствен опростен модел | SA е образователен модел, а не публикуван (Kurata/DiFrancesco). Да се отбележи в текста |
| cardio | варираща еластичност + Windkessel, **фиксирано P_LA** | Отворена верига: дебитът расте с HR до 150 (проверено: SV 44,5, CO 6,7, MAP 132 при HR 150), защото няма венозно връщане. При Emax=5 dt/τ≈0,96: стабилно, но неточно. Предлагам dt 0,25 ms или RK2 |
| ans | `ansCalc` sys2:2203 | **Нефизиологичен модел**: MAP=93·(CO/5,24)^0,2·(TPR/1,196)^0,8 вместо MAP≈CO·TPR. При S=100 % CO=18,4 L/min (в покой е невъзможно); при денервирано сърце CO=7 L/min. Не пипа SV↔HR (без Starling). Да се замени с MAP=CO·TPR+RAP и SV(HR, контрактилитет, преднатоварване) от `BARO_CO` |
| baro | 3-компартментен, ударен | ✓ добър. Липсват бавните механизми (РААС/ADH, хеморефлекс, CNS исхемичен отговор), а `hrf`/`aft` са линейни подбрани коефициенти |
| glucose | собствен; периферното поемане ∝ I·G, без отдалечен инсулин | Инсулинът действа мигновено (няма X на Bergman), затова пикът след 75 g е в 15-ата минута (норма 30–60), а G@2h=5,3. Т1 в равновесие = 14 mmol/L без кетоза. Предлагам Bergman minimal model (p1≈0,03/min, p2≈0,02/min, p3≈1,3·10⁻⁵) |
| hpaxis | log-линеен TSH–FT4 ✓ | τ_TSH 0,6 дни (реално t½≈1 h) е забавено нарочно, да се каже в текста. Няма T4→T3 |
| calcium | настроен, проверен в миналата сесия | Фосфатът и FGF23 липсват в модела, а теорията ги има |
| energy | Mifflin–St Jeor + Weir ✓ | Правилото 7700 kcal/kg без адаптивна термогенеза надценява загубата в дълъг срок (Hall 2011). Единица време: седмица |
| thermo | 2-възлов (тип Stolwijk) ✓ | Стабилен (C_core 194 kJ/K) |
| acidbase | H–H + Van Slyke β, правило на Winter ✓ | ок |
| volreg | MAP=93·(BV/5)^0,8 (емпирично), натриуреза ∝ MAP⁴ | Подбрана степенна връзка. Липсва връзка с CO/TPR |
| gfr | профил по капиляра + ауторегулация 75 % ✓ | ок |
| hemost | феноменологична каскада | Образователна, без кинетични константи от литературата (Hockin–Mann би бил истинският модел) |
| gimot | наложена синусоида за бавната вълна | Описателен модел |
| gisec | алгебрична фиксирана точка | Описателен модел |
| eeg | сума от синусоиди | Феноменологичен (Jansen–Rit би бил механистичен, но не е нужен) |
| reflex | `rfStep` sys2:2126 | **Закъснението е в брой стъпки** (`nd=28` проби), а dt=D/n се мени с кадъра, затова латентността „плава“ (≤28 ms). Трябва `nd=round(0.028/dt)` при фиксиран dt или буфер по време |
| lungmech | `lmDerive`: TLC/RV подбрани по c; сурфактантът е линеен фактор | Образователно приближение. Модулът за Лаплас (3.8) ще го замени |

Общи проблеми: само Euler; модельното време зависи от FPS (клампа 0,05 s); забавените отговори се пазят като масиви с брой проби (barо: `round(1.3/dt)` е коректно само при фиксиран dt).

---

## 3. Нови модули (всички пасват в mkSim)

Обозначения: τ = времеконстанта, H(x,K,n)=xⁿ/(Kⁿ+xⁿ), Hi = 1−H.

### 3.1 Менструален цикъл (време: дни; speed 1 ден/s; dtmax 0,02; recdt 0,1; hmax 900)
Редуциран модел по Harris-Clark и сътр. 2003 (Bull Math Biol 65:157) и Reinecke & Deuflhard 2007. Да се маркира като „редуциран образователен“.
- Състояния: G (GnRH пулсова честота, отн.), R_LH и R_FSH (хипофизен резерв), LH, FSH (IU/L), Fol (фоликулна маса), Lut (жълто тяло, 0–1), age_CL (дни), E2 (pg/mL), P4 (ng/mL), InhA, InhB.
- dR_LH/dt = V_LH·(1+ a_E·H(E2,K_E=190,n=8))/(1+P4/K_P) − k_rel·G·R_LH; LH = k_rel·G·R_LH/k_clear (t½ LH ≈ 20–40 min → квазистационарно).
- FSH: синтез ∝ G/(1+(InhA+InhB)/K_I), t½ ≈ 3–4 h.
- dFol/dt = b·FSH·Fol·(1−Fol/Fmax) − ovul; овулация при LH>25 IU/L → Fol→Lut, age_CL=0.
- Lut: лутеолиза при age_CL>14 д (σ 1 д), освен ако hCG>0.
- E2 = 25+e1·Fol+e2·Lut (фоликуларна 30–100, пик 200–400); P4 = 0,5+18·Lut (лутеална >10); InhB ∝ Fol, InhA ∝ Lut.
- Обратни връзки: E2 ниско → ⊖ (FSH); E2 >≈200 pg/mL за 36–48 h → ⊕ (LH пик 30–100 IU/L); P4 ⊖ G и блокира пика.
- Плъзгачи: GnRH пулсатилност %, яйчников резерв % (AMH), естроген+прогестин (ОК), hCG, андрогени/инсулин (PCOS: LH/FSH↑), енергиен баланс (хипоталамусна аменорея), кломифен.
- Пресети: норма 28 д, ОК, бременност (hCG от ден 21), PCOS, хипоталамусна аменорея, менопауза (FSH>30), хиперпролактинемия.

### 3.2 HPA ос и надбъбрек (време: часове; speed 0,5 h/s; dtmax 0,01 h)
По Gupta и сътр. 2007 (Theor Biol Med Model 4:8) и Vinther и сътр. 2011.
- Състояния: CRH, ACTH (pg/mL), F (кортизол, nmol/L), GR (рецептор в хипофизата), M (маса на кората, отн.).
- dCRH/dt = (C(t)·(1+stress)·Hi(F,K=300,n=2) − CRH)/τ_C, τ_C ≈ 0,1 h; циркаден ритъм C(t)=1+0,8·cos(2π(t−7)/24).
- dACTH/dt = (k·CRH·pit/(1+(F·GR+dex·20)/K_F) − ACTH)/τ_A, τ_A≈0,25 h (t½≈10 min).
- dF/dt = (k_F·M·adr·ACTH/(ACTH+K_A) − F)/τ_F, τ_F≈1,5 h (t½ 60–90 min).
- dM/dt = (ACTH_ср/ACTH₀ − M)/τ_M, τ_M≈14 дни ≈ 336 h. Тук е бавна трофична обратна връзка: екзогенните стероиди атрофират кората, а при спиране идва криза.
- Норма: ACTH 10–60 pg/mL, кортизол в 8 h 140–700, полунощ <50 nmol/L.
- Плъзгачи: стрес, функция на кората (Адисон), функция на хипофизата, аденом (изместена точка K_F×4), ектопичен ACTH (независим източник), декзаметазон 1/8 mg, преднизолон хронично, 21-хидроксилаза (ВНХ: F↓ → ACTH↑ → андрогени).
- Пресети: норма, остър стрес, Адисон, вторична недостатъчност, болест на Кушинг, ектопичен ACTH, аденом на надбъбрека, ВНХ, спиране на стероид.
- Експерименти: тестове с малка и голяма доза дексаметазон.

### 3.3 Коронарен кръвоток и O₂ баланс на миокарда (статичен calc + бавен step за ауторегулацията, τ 10 s)
- Търсене: MVO₂ (mL/min/100 g) = 1,5 + 7,5·(HR·SBP)/(72·120)·(Emax/3)^0,5 (норма ≈8–10). Индексът RPP е клиничният ориентир. Точната алтернатива е Suga: MVO₂ = a·PVA + b·Emax + c, a≈1,8·10⁻⁵ mL O₂/(mmHg·mL); PVA може да се вземе от `runHeart`.
- Доставка: Q = (DBP − LVEDP)·DTF/(R_cor + R_st(Q)). DTF = 1 − T_sys/T, T_sys ≈ 0,33·(RR)^0,4 s. Стеноза по Gould: ΔP = F·Q + S·Q² (F ∝ L/r⁴, S ∝ (1/A_s − 1/A_n)²).
- Ауторегулация (аденозин): R_cor се стреми към R, при което Q·CaO₂·0,75 = MVO₂, но не под R_min = R₀/4,5 (резерв 4–5×). Покой: 0,8 mL/min/g ≈ 250 mL/min; екстракция 70–75 %; PO₂ в коронарния синус ≈ 20 mmHg.
- Субендокард/субепикард: систолно притискане ∝ LVSP. Субендокардът се храни само в диастола.
- CaO₂: от общ O₂ помощник (4.3).
- Плъзгачи: HR, SBP, контрактилитет, DBP, LVEDP, стеноза %, Hb, нитрати (LVEDP↓, MVO₂↓), β-блокер, дипиридамол („steal“).
- Пресети: покой, натоварване, стабилна стенокардия 70 % + натоварване, тахикардия 160, аортна регургитация (DBP 40), ЛКХ, анемия.

### 3.4 Кардиореспираторен отговор при натоварване (време s; speed 10; dtmax 0,05)
- VO₂ кинетика: dVO₂/dt = (VO₂_ss(W) − VO₂)/τ, τ ≈ 30 s (фаза II); над LT бавен компонент.
- VO₂_ss = 3,5·m + 10,3·W mL/min (ACSM, колело).
- HR = HR₀ + (HR_max − HR₀)·%VO₂R (Swain); HR_max = 208 − 0,7·възраст (Tanaka 2001). SV: 70 → 100–120 mL до 40–50 % VO₂max, после плато. Дебитът следва от Фик: a-vO₂ = VO₂/CO (5 → 15 mL/dL).
- TPR пада (метаболитна вазодилатация); SBP +8–10 mmHg/MET, DBP ≈ постоянно.
- VE = 0,863·VCO₂/(PaCO₂·(1−VD/VT)); VD/VT пада от 0,3 до 0,15. Над VT VCO₂ се ускорява от буферирането (RER>1).
- Лактат = 1 + a·exp(b·(%VO₂max − LT)), LT 50–60 % (нетрениран) или 70–80 % (трениран).
- Плъзгачи: W, VO₂max, възраст, маса, β-блокер, височина, Hb, сърдечна недостатъчност (SV_max).
- Пресети: покой → 100 W, стъпаловиден тест до отказ, трениран, СН, β-блокер, 3000 m.
- Преизползва `gxSolve` (PaO₂/SaO₂) и O₂ помощника.

### 3.5 Хеморагия и компенсация на шока (време min; speed 2; dtmax 0,02)
Не ударен модел, а сгъстен Guyton.
- Състояния: V_b (L), V_is, S (симпатикус, τ 10 s → квазистационарно), AH (Ang II+ADH, τ 10–20 min), D (депресия на миокарда), Lac.
- MSFP = (V_b − V₀(1−0,25·S))/C_sys; VR = (MSFP − RAP)/RVR; CO = функционалната крива (`BARO_CO`)·(1+0,5·S)·(1−D); MAP = CO·TPR; TPR = TPR₀·(1 + 0,8·S + 0,4·AH)·(1 − 0,3·acid).
- S = H(93 − MAP; сигмоида k≈11); хеморефлекс при MAP<80; CNS исхемичен отговор при MAP<50.
- Попълване от интерстициума (Starling): J = K_f·(P_c − P_if − σΔπ), P_c = P_v + (MAP−P_v)·R_post/(R_pre+R_post), R_pre расте със S. Около 0,5–1 L през първия час.
- Положителна обратна връзка: dD/dt = k·max(0, 1 − Q_cor/Q_crit) − 0,01·D, Q_cor ∝ DBP·DTF. Тя дава необратимия шок (Guyton гл. 24, Crowell).
- Цели: загуба 10 % ≈ без промяна; 15–30 % тахикардия 100–120; 30–40 % SBP↓, HR 120–140; >40 % декомпенсация (ATLS).
- Плъзгачи: кръвозагуба %, скорост, кристалоид L, кръв L, време до лечение, β-блокер, симпатектомия (спинална анестезия).
- Пресети: 10/25/35/45 %; 35 % + 2 L разтвор; 35 % + кръв; късно преливане.

### 3.6 Еритропоеза, желязо и EPO (време дни; speed 2; dtmax 0,05)
- Състояния: EPO (mU/mL, t½ 5–8 h → τ 0,3 д), прогениторна верига P₁…P₅ (гама-закъснение, общо ≈5 д), Ret (τ 1 д в кръвта), RBC (Hb g/dL, живот 120 д → изход Hb/L_RBC), Fe_s (серумно, TSAT), Fe_st (феритин), Hep (хепцидин).
- EPO_тгт = EPO₀·exp(k·(1 − DO₂_бъбрек/DO₂₀)), EPO₀ ≈ 10, k така че при Hb 7 → EPO ≈ 500–1000 (log-линейна връзка, Erslev). Множител CKD.
- Вход във веригата = basal·(1 + 7·H(EPO,K=50,n=1,5))·fe; fe = TSAT/(TSAT+15 %).
- Желязо: в 1 g Hb има 3,4 mg Fe; оборот ≈ 20–25 mg/д; всмукване 1–2 mg/д·Hi(Hep); Hep ∝ Fe_st·(1+възпаление)/(1+еритроферон∝P).
- Плъзгачи: остра кръвозагуба, хронична загуба mL/д, Fe в храната, бъбречна функция, височина (SaO₂ от O₂ помощника), EPO инжекции, възпаление, живот на еритроцитите, B12/фолат (неефективна еритропоеза).
- Пресети: норма, 1 L кръвозагуба, хронично ГИТ кървене, ХБЗ, 4000 m, EPO допинг, анемия при възпаление, хемолиза (30 д), полицитемия вера (продукция без EPO → EPO↓).

### 3.7 Чревна абсорбция (време min; speed 2; dtmax 0,05)
- Лумен на N=20 сегмента по 30 cm (plug flow, транзит 2–4 h).
- SGLT1: J = Vmax·G/(K_m+G)·Na/(K_Na+Na), K_m ≈ 0,5 mM, 2Na⁺:1 глюкоза.
- GLUT2 базолатерално: K_m ≈ 17 mM. Апикален GLUT2 при G>30 mM е хипотеза на Kellett и е спорна, затова опция и надпис.
- Водата следва осмотично (механизмът на ОРС).
- Мазнини: емулгиране при жлъчни соли >CMC (≈2–4 mM), липаза M-M (с колипаза) TG→2-MG+2FFA, мицели, по