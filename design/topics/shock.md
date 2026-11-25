# PhysioNova — тема `shock`: „Шок и кръвозагуба: интегрирана регулация“
Guyton & Hall, гл. 24 (Circulatory Shock and Its Treatment) + гл. 20 (Cardiac Output, Venous Return — криви на Гайтън) + гл. 19/18 (барорефлекс, хеморецептори, CNS-исхемичен отговор, обемни рецептори) + гл. 16 (Старлинг, лимфа); Boron ch. 23–25; Costanzo ch. 4.
Клинично: ATLS 10th ed. (Table 3-1), Sepsis-3 (Singer 2016, JAMA 315:801), Surviving Sepsis Campaign 2021, SCAI/ESC кардиогенен шок.
Файл за имплементация: `site/js/mod-shock.js`, шаблон = `site/js/mod-erythro.js` / `mod-adrenal.js` (mkSim + zRegister).
Регистрация: `zRegister("shock",{name:L("Шок и кръвозагуба","Shock and haemorrhage"),view,book,tests,exp,gl})`.

**Време: моделна единица = 1 минута, с адаптивно „свиване“ на времето (time-warp).** Една реална секунда е 0,1 → 1 → 10 → 60 моделни минути според фазата (§1.0) — така в една сесия от ≈2,5 min се виждат секундният барорефлекс, минутните хормони, часовото транскапилярно пълнене и дневната жажда/бъбречна корекция. `speed:1, dtmax:0.05` (реални s), вътрешна стъпка **`h ≤ 0.02 min`**, `recdt:0.1` (реални s), `hmax:3000`, `ch:360`.
Всички низове през `L(bg,en)`; единици: mmHg, L/min, mL, mL/h, mmol/L.

---

## 1. Модел: време, променливи, уравнения, параметри

### 1.0 Време и твърдост (stiffness)
- Най-бързите процеси: вагусов отговор τ = 0,03 min (≈2 s), симпатиков τ = 0,15 min (≈9 s). Най-бавните: албумин τ ≈ 28 h, жажда/бъбрек — дни. Отношение ≈ 10⁵ → твърда система.
- Решение: (1) всички рефлексни/хормонални променливи се интегрират с **експоненциален релаксационен интегратор** `x += (x*−x)(1−e^(−h/τ))` (безусловно стабилен за всяка отделна променлива); (2) кръвообращението (RAP, CO, VR) е **алгебрично** — решава се на всяка стъпка като пресечна точка на кривите на Гайтън (бисекция, 24 итерации; без собствена динамика); (3) обемите/белтъците/лактатът — явен Ойлер.
- **Проверено с node:** `h = 0.005` и `h = 0.02 min` дават идентични резултати (разлика <1 % във всички изходи до 72 h); при `h = 0.05 min` барорефлексната верига (вагус + алгебричен MAP) осцилира — HR на 10-ата min 79 вместо 113. Затова **`h_max = 0.02 min` (1,2 s)** е задължително.
- Time-warp (моделни минути за 1 реална секунда), автоматично по `s.t`:
```js
const W=t=> t<3?0.1 : t<30?1 : t<360?10 : 60;        // 0–3 min: 1 s = 6 s модел; 3–30 min: 1 s = 1 min; до 6 h: 1 s = 10 min; после 1 s = 1 h
function step(s,p,dt){ if(s.t>=4320){return}           // спира на 72 h (бутон „Пусни пак“ = setPre)
  let D=dt*(s.warp||W(s.t)); const n=Math.max(1,Math.ceil(D/0.02)); for(let i=0;i<n;i++) shStep(s,p,D/n); SS=s }
```
  Обща продължителност до 72 h ≈ 30 + 27 + 33 + 66 s ≈ **2,6 min реално**. Бутони `ev` за ръчна скорост: „1 s = 1 s“ (`s.warp=1/60`), „1 s = 1 min“ (`1`), „1 s = 10 min“ (`10`), „1 s = 1 h“ (`60`), „Авто“ (`s.warp=0`). При 60 min/s и 60 fps → 50 подстъпки/кадър — евтино.
- Пред (stats) винаги показвай текущия мащаб: „1 s = 6 s / 1 min / 10 min / 1 h“.

### 1.1 Състояние (`shInit()`)
```js
function shInit(){return{
  t:0,                      // min
  Vp:2750, Vr:2250,         // mL плазма / еритроцити (кръв 5 L, Hct 45 %)
  Vi:11000,                 // mL интерстициална течност
  Mp:192.5, Mi:308,         // g белтък: плазма (7,0 g/dL) / интерстициум (2,8 g/dL)
  sym:1, par:1,             // централен симпатиков / вагусов изход (1 = норма)
  Ren:1, Ang:1, Ald:1, ADH:1, // относителни нива (1 = норма)
  Lac:1.0,                  // mmol/L
  D:0,                      // mL — кислороден дълг (кумулативен дефицит на VO₂)
  Ir:0,                     // 0…1,2 — индекс на необратимо увреждане
  e:{contr:100,tpr:100,symt:100,leak:0}, // „ефективни“ стойности на плъзгачите (плавно начало на болестта)
  bled:0, gC:0, gB:0,       // mL реално изтекли / вливани кристалоид / кръв
  MAP:93, RAP:0, UOc:0, dead:0, low:0, warp:0
}}
```

### 1.2 Константи (КАЛИБРИРАНИ — проверени с `node`, §1.6)
```js
const P_={
  Vu0:4000,   // mL ненапрегнат (unstressed) обем; MSFP = 0 при 4 L кръв без рефлекси (Guyton гл. 20)
  C0:143,     // mL/mmHg съдов капацитанс → MSFP = (5000−4000)/143 = 7,0 mmHg
  RVR0:1.4,   // mmHg·min/L съпротивление на венозното връщане: (7−0)/1,4 = 5 L/min
  TPR0:18.6,  // mmHg·min/L (≈1490 dyn·s·cm⁻⁵)
  SV0max:125, R0:-2, kS:2.5,   // Франк–Старлинг: SV = SVmax·(1−e^(−(RAP+2)/kS)); при RAP 0 → 69 mL
  M50:85.7, kB:8,              // барорефлексна сигмоида (sym = 1 при MAP 93)
  HRi:100,    // вътрешна (денервирана) честота
  kVu:400,    // mL намаление на Vu за единица симпатикус (венoконстрикция, max ≈600 mL)
  Kf0:6.67,   // mL/min/mmHg — цялостен Kf (Guyton гл. 16)
  L0:1.6895, PS0:1.1263,       // лимфа mL/min и белтъчен PS mL/min — изчислени, така че норма = равновесие
  Cint:1000,  // mL/mmHg интерстициален капацитанс при Pi < −3 (×8 над −3: оток)
  VO2:250, ER:0.7, def0:1.062, // mL O₂/min; max екстракция; базов „дефицит“ на softmin-а (изваждa се)
  Dc:7000, Ith:0.15, tI:20,    // O₂-дълг 100 mL/kg (Crowell & Smith 1964), праг на автокатализа, τ (min)
  UO0:1.0, INS:0.6, DR0:1.6,   // mL/min урина / неосезаеми загуби / базов прием
  Rb:100, Ri:100               // mL/min скорост на кървене / на вливане (2 широки венозни пътя)
};
const LP=C=>1.094*(2.1*C+0.16*C*C+0.009*C*C*C);   // Landis–Pappenheimer (g/dL → mmHg), 7 g/dL → 28 mmHg, 2,8 → 8 mmHg
```

### 1.3 Потоци (`shFlux(s,p)`) — точно проверения код
```js
const pre=p.pre||"norm", sept=pre==="sept", ana=pre==="anaph";
const V=s.Vp+s.Vr, Hct=s.Vr/V, Cp=100*s.Mp/s.Vp, Ci=100*s.Mi/s.Vi;          // g/dL
// --- киселинно-алкално (само лактатна ацидоза + компенсация по Winter) ---
const HCO3=Math.max(4,24-0.95*(s.Lac-1)), PaCO2=cl(1.5*HCO3+8,15,40), pH=6.1+Math.log10(HCO3/(0.03*PaCO2));
const fa=cl(1-2*(7.30-pH),0.35,1);                 // под pH 7,30 катехоламините действат по-слабо
const Ie=cl(s.Ir,0,1), rV=fa*(1-0.6*Ie), rM=fa*(1-0.7*Ie);   // съдова / миокардна отзивчивост
const E=s.e, symE=(E.symt/100)*s.sym, vd=E.tpr/100, leak=cl(E.leak/100+0.6*Ie,0,1);
// --- вени: MSFP от обема и ненапрегнатия обем ---
const Vu=P_.Vu0+700*Math.max(0,1-vd)*(ana?1.4:1)-P_.kVu*cl(symE-1,-1,1.5)*rV-150*Math.log(s.Ang);
const Cv=P_.C0/(1+0.2*(symE-1)*rV);
const sx=(V-Vu)/Cv, MSFP=sx>1?sx:Math.exp(sx-1);  // меко отрязване (MSFP > 0)
const RVR=P_.RVR0*(1+0.1*(symE-1))*Math.pow(vd,0.25)*Math.pow(Hct/0.45,0.3);
// --- сърце: Франк–Старлинг ---
const HR=cl(P_.HRi+30*cl(symE-1,-1,1.8)-28*s.par,30,210);
const fill=HR<=100?1:Math.max(0.2,1-Math.pow((HR-100)/160,1.5));          // скъсена диастола
const cf=Math.max(0.05,(E.contr/100)*(1+0.45*(symE-1)*rM)*rM*(1-0.5*Math.max(0,(40-s.MAP)/40)));  // + коронарна хипоперфузия
const aft=cl(Math.pow(93/Math.max(20,s.MAP),0.3),0.75,1.5);              // следнатоварване (MAP от предната стъпка)
const SVm=P_.SV0max*cf*fill*aft, kS=P_.kS/Math.pow(cl(E.contr/100,0.1,1.5),0.7);  // слабото сърце: по-ниска И по-полегата крива
const CO_h=r=>r<=P_.R0?0:HR*SVm*(1-Math.exp(-(r-P_.R0)/kS))/1000;       // L/min (сърдечна функционална крива)
const VR=r=>(MSFP-Math.max(r,P_.R0))/RVR;                                // L/min (венозно връщане; плато под −2 = колапс на вените)
let a=P_.R0,b=40; for(let i=0;i<24;i++){const m=(a+b)/2; if(CO_h(m)-VR(m)>0)b=m; else a=m}
const RAP=(a+b)/2, CO=CO_h(RAP), SV=CO>0?1000*CO/HR:0;
// --- артерии ---
const hv=sept?0.4:1;                                                     // сепсис: съдова хипореактивност (NO, K-ATP)
const TPR=P_.TPR0*vd*(1+0.3*cl(symE-1,-1,1.2)*rV*hv)*Math.pow(s.Ang,0.12*rV*hv)
         *(1+0.05*Math.log(Math.max(1,s.ADH))*rV*hv)*Math.pow(Hct/0.45,0.4)*(1-0.35*Ie);
const MAP=CO*TPR+RAP;
const Ca=1.7/(1+0.5*Math.max(0,symE-1));                                // mL/mmHg — артериите „изтвърдяват“ при симпатикус
const PP=SV/Ca, SBP=MAP+2/3*PP, DBP=MAP-PP/3;
// --- рефлекси (целеви стойности) ---
const chem=0.8*cl((80-MAP)/40,0,1)+0.1*Math.max(0,s.Lac-2);             // хеморецептори (MAP < 80)
const cns=1.5*cl((50-MAP)/30,0,1);                                       // CNS-исхемичен отговор (MAP < 50)
const cp=cl(0.15*(0-RAP),-0.3,0.8);                                      // кардиопулмонални обемни рецептори
const cm=1-0.7*Ie;                                                       // отказ на вазомоторния център
const symT=cl((0.2+2.8/(1+Math.exp((MAP-P_.M50)/P_.kB))+chem+cns+cp)*cm,0.05,4);
const parT=2/(1+Math.exp(-(MAP-93)/6));
// --- хормони ---
const RenT=cl(Math.exp(0.035*(93-MAP)),0.3,15)*Math.max(0.2,1+0.6*(symE-1));      // β1 на JG + перфузионно налягане
const ADHT=(sept?0.35:1)*cl(Math.exp(0.07*Math.max(0,90-MAP)+0.9*Math.max(0,-0.3-RAP)
          -0.3*Math.max(0,RAP-2)*cl((MAP-80)/10,0,1)),0.2,60);         // несмотична секреция; сепсис = относителен дефицит
const AldT=Math.pow(s.Ang,0.8);
// --- бъбрек и вход ---
const gfr=cl((MAP-50)/30,0,1)*(1-0.3*cl(symE-1,0,2))*Math.sqrt(cl(CO/4.5,0.2,1));
const pn=MAP>93?Math.exp(0.03*(MAP-93)):1;                               // натриуреза под налягане
const UO=P_.UO0*gfr*Math.pow(s.ADH,-0.45)*Math.pow(s.Ald,-0.25)*pn*(1+0.08*Math.max(0,RAP-2)*cl((MAP-85)/8,0,1));  // mL/min
const thirst=cl(1+0.8*Math.log(s.Ang)+0.4*Math.log(Math.max(1,s.ADH)),0.4,4);
const drink=(MAP>70&&s.t>360)?P_.DR0*thirst:0;                           // NPO първите 6 h; после пие, ако е в съзнание
// --- Старлинг + лимфа ---
const Pi=-3+(s.Vi-11000)/(s.Vi<11000?P_.Cint:P_.Cint*8);
const r=14.3*(1+0.8*(symE-1)*rV)*Math.pow(vd,0.7);                       // пре-/посткапилярно съпротивление
const Pvn=MSFP+5, Pc=Pvn+(MAP-Pvn)/(1+r);                                // 17,3 mmHg в норма
const Kf=P_.Kf0*(1+3*leak), sig=1-0.7*leak, PS=P_.PS0*(1+15*leak);
const pip=LP(Cp), pii=LP(Ci);
const Jv=Kf*((Pc-Pi)-sig*(pip-pii));                                     // mL/min (+ = филтрация към интерстициума)
const Lym=P_.L0*cl(Math.exp(0.5*(Pi+3)),0.05,20)*(1+0.4*cl(symE-1,0,2));
const Jp=Math.max(0,Jv)*(1-sig)*Cp/100+PS*(Cp-Ci)/100, JpL=Lym*Ci/100;   // g/min белтък навън / обратно с лимфата
// --- O₂, лактат, дишане ---
const Hb=Hct*100/3, CaO2=1.34*Hb*0.97+0.3, DO2=CO*CaO2*10;              // mL O₂/min (норма ≈990)
const dem=P_.VO2*(sept?1.3:1), ER=sept?0.35:(ana?0.6:P_.ER);             // сепсис: ↑ нужда, ↓ екстракция (микроциркулация)
const sup=ER*DO2, VO2=sup*dem/Math.pow(Math.pow(sup,4)+Math.pow(dem,4),1/4);   // мек минимум → регионална хипоксия преди DO2crit
const def=Math.max(0,dem-VO2-P_.def0);
const hep=cl(Math.pow(CO/5,0.7),0.1,1.3)*(1-0.5*Ie);                     // чернодробен клирънс ∝ кръвоток
const Lprod=1.0+0.05*def+0.3*Math.max(0,symE-1.5)*(sept?2:1);           // mmol/min (база ≈1440 mmol/d) + аеробна β2-гликолиза
const Lclr=6*s.Lac/(5+s.Lac)*hep*(sept?0.6:1);
const RR=cl(14+3*(s.Lac-1)+10*cl(symE-1,0,2)+6*cl((70-MAP)/30,0,1),8,50);
```
> **Защо алгебрично RAP:** това е буквално графичният анализ на Гайтън — CO и VR са равни във всеки момент; динамиката идва от обемите и рефлексите. За графика 2 (§3.2) същите `CO_h` и `VR` се рисуват като криви.

### 1.4 Интегриране (`shStep(s,p,h)`)
```js
const ex=(x,xt,tau)=>x+(xt-x)*(1-Math.exp(-h/tau));
const tr=pre==="sept"?30:pre==="neuro"?0.5:2;                 // начало на болестта: сепсис за ≈30 min, неврогенен за секунди
for(const k of ["contr","tpr","symt","leak"]) s.e[k]=ex(s.e[k],p[k],tr);
const F=shFlux(s,p); if(s.dead) return;
s.sym=ex(s.sym,F.symT,0.15);  s.par=ex(s.par,F.parT,0.03);    // секунди
s.Ren=ex(s.Ren,F.RenT,15);  s.Ang=ex(s.Ang,s.Ren,3);  s.Ald=ex(s.Ald,F.AldT,40);  s.ADH=ex(s.ADH,F.ADHT,8);  // минути
// кървене и вливания — 100 mL/min; вливанията започват при t ≥ 30 min (пристигане), в `irr` при t ≥ 300 min
const bR=Math.min(P_.Rb,Math.max(0,p.loss-s.bled)/h), tI=pre==="irr"?300:30, on=s.t>=tI;
const cR=on?Math.min(P_.Ri,Math.max(0,p.cry-s.gC)/h):0, kR=on?Math.min(P_.Ri,Math.max(0,p.bld-s.gB)/h):0;
s.bled+=bR*h; s.gC+=cR*h; s.gB+=kR*h;
const Cpm=s.Mp/s.Vp;
s.Vp+=(-bR*(1-F.Hct)+cR+0.6*kR-F.Jv+F.Lym-F.UO-P_.INS+F.drink)*h;   // кръвта е „1:1:1“: Hct 0,40, плазма 6 g/dL
s.Vr+=(-bR*F.Hct+0.4*kR)*h;
s.Vi+=(F.Jv-F.Lym)*h;
s.Mp+=(-bR*(1-F.Hct)*Cpm+0.6*kR*0.06-F.Jp+F.JpL+0.0006*(192.5-s.Mp))*h;   // + чернодробен синтез (τ ≈ 28 h)
s.Mi+=(F.Jp-F.JpL)*h;
s.Lac=Math.max(0.3,s.Lac+(F.Lprod-F.Lclr)/30*h);                         // Vd лактат 30 L
s.D=Math.max(0,s.D+(F.def-s.D/240*cl((F.sup-F.dem)/F.dem,0,1))*h);       // дългът се „изплаща“ само при резервен капацитет
s.Ir=Math.min(1.2,s.Ir+(Math.max(0,s.D-P_.Dc)/P_.Dc+(s.Ir>P_.Ith?0.5*s.Ir:0))/P_.tI*h);  // над Ith — автокаталитично
s.MAP=F.MAP; s.RAP=F.RAP; s.UOc+=F.UO*h;
s.low=F.MAP<25?s.low+h:0; if(s.low>5) s.dead=1;                          // „смърт“: MAP < 25 mmHg за > 5 min
s.t+=h;
```
**Контрол на баланса (тест):** `Vp+Vr+Vi` се променя само с `−кървене + вливания − UO − INS + drink`; `Mp+Mi` — само с кървене, кръв и синтеза (грешка < 0,1 %).
**Начало на болестта:** `s.e` пълзи към плъзгачите с τ (2 min; сепсис 30 min; неврогенен 0,5 min), за да не „скача“ MAP в t = 0 и за да се види реакцията на рефлекса.

### 1.5 Изходни величини
```js
SI   = HR/SBP;                       // шоков индекс, норма 0,5–0,7; > 0,9–1,0 = шок
CI   = CO/1.9;                       // L/min/m² (BSA 1,9 m²)
TPRd = TPR*80;                       // dyn·s·cm⁻⁵ (норма 900–1500)
BE   = -(24-HCO3);                   // mmol/L — САМО лактатна компонента (виж „Опростено“)
UOh  = UO*60;                        // mL/h; ≈ mL/kg/h × 70
lossPct = 100*s.bled/5000;           // ATLS клас: <15 I, 15–30 II, 30–40 III, >40 IV
```

### 1.6 Проверени стойности (node, h = 0,02 min; 72 h; стойности на **t = 30 min**, ако не е казано друго)
| пресет `set` | MAP | SBP/DBP | PP | HR | SV mL | CO L/min | RAP | TPR | V mL | Hct % | Lac | UO mL/h | SI | RR | ADH× | изход |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **norm** — | 93 | 120/79 | 41 | 72 | 69 | 5,0 | 0 | 18,6 | 5000 | 45 | 1,0 | 60 | 0,60 | 14 | 1 | стабилен (V −1,5 % до 6 h заради NPO, после обратно) |
| **h1** `{loss:500}` | 91 | 115/80 | 35 | 84 | 53 | 4,4 | −0,8 | 20,8 | 4618 | 43,9 | 1,1 | 44 | 0,73 | 17 | 1,6 | Hct 41,5 за 72 h |
| **h2** `{loss:1250}` | 86 | 103/78 | 26 | 110 | 31 | 3,4 | −1,5 | 25,6 | 4042 | 41,9 | 1,4 (1,8 на 2 h) | 21 | 1,07 | 23 | 3,9 | MAP 90 за 12 h, HR 88 за 24 h |
| **h3** `{loss:1750}` | 81 | 94/74 | 20 | 132 | 21 | 2,8 | −1,7 | 30,0 | 3632 | 40,8 | 1,7 → 3,1 (2 h) → 3,4 (4 h) | 11 | 1,40 | 29 | 7,6 | компенсиран; лактат < 2 след 12 h |
| **h4** `{loss:2250}` | 69 | 80/63 | 16 | 153 | 13 | 2,0 | −1,9 | 35,5 | 3251 | 39,3 | 3,0 → 7,8 (2 h) → 9,8 (4 h) | 2 | 1,92 | 40 | 33 | D > 7 L на ≈4,5 h → **смърт на 347 min** |
| **h3cry** `{loss:1750,cry:2000}` (вливане 30→50 min) | 86 (60 min) → 84 (2 h) | 104/77 | 27 | 111 → 120 | 33 | 3,7 → 3,2 | −1,5 | 23,7 | 4064 (+396 спрямо h3 = 20 % на 10-ата min след края) → 3844 (+139 = 7 %) | 36,5 | 1,7 → 2,4 (2 h) | 23 → 15 | 1,07 | 24 | 2,8 | хемодилуция; лактат 2,4 vs 3,1 без вливане |
| **h3bld** `{loss:1750,bld:1500}` (30→45 min) | 92 (60 min) | 118/80 | 38 | 76 | 61 | 4,7 | −0,4 | 19,9 | 4766 | 43,7 | 1,5 → 1,2 (2 h) | 47 | 0,65 | 17 | 1,3 | пълно възстановяване |
| **h4** + `sl:{bld:2250}` (30→52 min) | 95 (60 min) → 93 | 123/80 | 43 | 64 → 74 | 73 | 4,7 | +0,4 | 20,0 | 4949 | 44,0 | 2,5 → 1,4 (2 h) | 38 → 54 | 0,52 | 19 | 2,0 | преживява (D max ≈1,0 L) |
| **irr** `{loss:2250,bld:2250}`, кръв на **300 min** | 74 (300) → **98 (315)** → 83 (360) → **42 (420)** | 128/83 (315) | 45 | 152 → 69 → 104 → 111 | 78 → 25 | 4,6 → 2,7 | 0 | 18,5 → 15 | 5061 → 4240 | 43 → 52 (теч) | 10 → 6 | 29 → 0 | 0,5 → 2,0 | 50 | — | Ir 0,09 → 0,26 → 1,2; **смърт на 522 min** |
| **sept** `{tpr:30,leak:15}` (начало τ 30 min) | 84 → 76 (1 h) → **67 (2 h)** → 63 (4 h) | 117/42 (2 h) | 75 | 153 | 59 | **9,0** (2 h) | −1,3 | 7,6 (41 %) | 4664 | 48 | 3,3 (2 h) → 4,6 (4 h) | 6 | 1,31 | 42 | 3,8 (неадекватно) | смърт ≈ 31 h |
| **card** `{contr:18}` | 79 | 91/73 | 18 | 122 | 21 | 2,6 (CI 1,4) | **+7,5** → 9 (72 h) | 27,2 | 4911 | 45,8 | 1,7 → 2,9 (2 h) → 3,6 | 21 | 1,34 | 25 | 2,2 | стабилен „студен“ шок |
| **anaph** `{tpr:20,leak:35}` | **57 (5 min)** → 54 (1 h) → 49 (2 h) | 102/35 | 68 | 154 | 50 | 7,8 | −1,4 | 7,6 | 4591 | 46 → 49 → 52 | 1,0–1,5 | 1–3 | 1,5 | 37 | 28 | смърт 427 min без адреналин |
| **neuro** `{symt:10}` | 65 | 84/55 | 29 | **79** | 49 | 3,8 | −0,2 | 16,9 | 5002 | 45 | 1,2 | 12 | 0,94 | 16 | 5,9 | без лечение бавно влошаване (дни) |

**ATLS — съпоставка (модел на 30 min, след края на кървенето):**
| клас (загуба) | ATLS HR | модел HR | ATLS SBP | модел SBP | ATLS PP | модел PP | ATLS RR | модел RR | ATLS урина mL/h | модел UO | ATLS BD | модел BE (лактатен) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| I (10 %) | < 100 | 84 ✓ | ↔ | 115 ✓ | ↔ | 35 (−6) ✓ | 14–20 | 17 ✓ | > 30 | 44 ✓ | 0 до −2 | −0,1 ✓ |
| II (25 %) | 100–120 | 110 ✓ | ↔ | 103 ✓ (леко ↓) | ↓ | 26 ✓ | 20–30 | 23 ✓ | 20–30 | 21 ✓ | −2 до −6 | −0,4 (−0,8 на 2 h) ✗ |
| III (35 %) | 120–140 | 132 ✓ | ↔/↓ | 94 ✓ | ↓ | 20 ✓ | 30–40 | 29 ✓ | 5–15 | 11 ✓ | −6 до −10 | −0,7 → −2 (2 h) ✗ |
| IV (45 %) | > 140 | 153 ✓ | ↓ | 80 ✓ | ↓ | 16 ✓ | > 35 | 40 ✓ | ≈ 0 | 2 ✓ | ≤ −10 | −1,9 → −6,5 (2 h) ✗ |
HR/RR/урина — числови граници от ATLS 9-то изд.; 10-то изд. (2018) ги дава със стрелки и добавя BD. **Известно отклонение:** BE в модела е само лактатен и изостава (лактатът расте за часове) — затова е по-малък от ATLS-BD; в UI покажи BE с бележка „само лактатна компонента“ (виж „Опростено“).

**Транскапилярно пълнене (h3, проверено, интеграл `Lym − Jv`):** 0,30 L до края на кървенето (17,5 min) → **0,47 L на 1 h → 0,56 L на 2 h → 0,72 L на 4 h** (максимум), после пиенето поема. Hct 45 → 42,0 (17 min) → 40,8 (30 min) → 40,0 (2 h) → 39,3 (4 h) → 36,3 (12 h) → 33,7 (24 h) → 31,9 (72 h). Плазмен белтък 7,0 → 5,95–6,1 g/dL (протеинът ограничава пълненето; връща се с лимфата и синтеза за дни). Пиене: 0,4 L до 8 h, 3,2 L до 24 h.

**Точка без връщане (h4 без лечение, проверено чрез вливане на 2250 mL кръв в различно време):** 30 min → преживява; 180 min → преживява; 240 min → преживява; 285 min → преживява с остатъчен теч (Ir 0,08); **300 min → временно MAP 98, после колапс и смърт на 522 min**. Т.е. праг ≈ 4,75–5 h, когато D надхвърли 7 L (100 mL/kg) и Ir > 0,15.

**Контролни проверки за имплементатора**
1. `norm`: MAP 93 ± 1, HR 72–75, V 4900–5000 за 72 h.
2. dt: `h = 0.005` и `0.02` → разлика < 1 %; `h = 0.05` → осцилации (не го позволявай).
3. `h3`: HR > 120 на 30-ата min, урина 5–15 mL/h, Hct ≤ 40 на 2–4 h, пълнене ≈0,5–0,7 L до 4 h.
4. `h4`: смърт между 5 и 7 h; с `bld:2250` от 30-ата min — преживява; `irr` — MAP > 90 за ≈30 min след трансфузията, после < 45 до 420 min.
5. `card` + `cry:1000`: RAP ↑ (7,5 → 7,9), CO почти без промяна (2,62 → 2,64) — плоската част на кривата.
6. `sept` + `cry:2000`: MAP на 2 h 66 (≈ като без течности); `sept` + `{cry:2000,tpr:60}`: MAP 85–87, но лактатът пак расте (3,5 → 4,4 на 4 h).
7. `neuro` срещу `h3` при MAP ≈ 65–80: HR 79 vs 132.

---

## 2. Плъзгачи и пресети

### 2.1 Плъзгачи (`sl`, 7)
```js
{k:"loss", label:L("Кръвозагуба","Blood loss"),min:0,max:3000,step:50,value:0,unit:"mL",
  hint:L("изтича със 100 mL/min; 5 L кръв: <750 клас I, 750–1500 II, 1500–2000 III, >2000 IV","flows out at 100 mL/min; 5 L blood: <750 class I, 750–1500 II, 1500–2000 III, >2000 IV")},
{k:"cry",  label:L("Кристалоид (Рингер/0,9 % NaCl)","Crystalloid (Ringer/0.9 % NaCl)"),min:0,max:4000,step:250,value:0,unit:"mL",
  hint:L("влива се от 30-ата min със 100 mL/min; за час в съдовете остават ≈10–25 %","infused from minute 30 at 100 mL/min; after an hour ≈10–25 % stays intravascular")},
{k:"bld",  label:L("Кръв (ЕМ:плазма 1:1)","Blood (RBC:plasma 1:1)"),min:0,max:3000,step:250,value:0,unit:"mL",
  hint:L("Hct ≈40 %, белтък 6 g/dL; възстановява и обема, и кислородния капацитет","Hct ≈40 %, protein 6 g/dL; restores both volume and oxygen capacity")},
{k:"contr",label:L("Контрактилитет","Contractility"),min:10,max:150,step:5,value:100,unit:"%",
  hint:L("< 40 % = кардиогенен шок (обширен инфаркт); кривата става по-ниска и по-полегата","< 40 % = cardiogenic shock (large infarct); the curve becomes lower and flatter")},
{k:"tpr",  label:L("Съдов тонус (TPR)","Vascular tone (TPR)"),min:15,max:150,step:5,value:100,unit:"%",
  hint:L("< 100 % = вазодилатация (сепсис, анафилаксия) + венодилатация; > 100 % ≈ вазопресор","< 100 % = vasodilation (sepsis, anaphylaxis) + venodilation; > 100 % ≈ vasopressor")},
{k:"symt", label:L("Симпатиков еферентен тонус","Sympathetic efferent tone"),min:0,max:100,step:5,value:100,unit:"%",
  hint:L("< 30 % = неврогенен шок (гръбначна травма над Th6), спинална анестезия","< 30 % = neurogenic shock (spinal cord injury above T6), spinal anaesthesia")},
{k:"leak", label:L("Капилярен теч","Capillary leak"),min:0,max:100,step:5,value:0,unit:"%",
  hint:L("↑Kf, ↓σ за белтък: плазма и албумин излизат (сепсис, анафилаксия, изгаряния)","↑Kf, ↓σ for protein: plasma and albumin escape (sepsis, anaphylaxis, burns)")}
```

### 2.2 Пресети (`pre`)
```js
norm:{n:L("Норма","Normal"),info:L(
 "MAP 93 mmHg, CO 5 L/min, RAP 0, MSFP 7 mmHg. Венозното връщане се определя от разликата MSFP − RAP и от съпротивлението на връщането (1,4 mmHg·min/L); сърцето изпомпва каквото получи (Франк–Старлинг). От 5 L кръв ≈4 L са „ненапрегнат“ обем — пълнят вените, без да създават налягане.",
 "MAP 93 mmHg, CO 5 L/min, RAP 0, MSFP 7 mmHg. Venous return is set by MSFP − RAP and the resistance to venous return (1.4 mmHg·min/L); the heart pumps whatever it receives (Frank–Starling). Of the 5 L of blood ≈4 L is unstressed volume — it fills the veins without creating pressure.")},
h1:{n:L("Кръвозагуба клас I (500 mL)","Haemorrhage class I (500 mL)"),set:{loss:500},info:L(
 "10 % от обема (като кръводаряване). Венoконстрикцията мобилизира ненапрегнатия обем, HR се качва леко до ≈85. Налягането, пулсовото налягане, дишането и диурезата остават почти нормални. Компенсира се изцяло без лечение.",
 "10 % of volume (like a blood donation). Venoconstriction mobilises unstressed volume and HR rises slightly to ≈85. Pressure, pulse pressure, breathing and urine stay almost normal. Fully compensated without treatment.")},
h2:{n:L("Кръвозагуба клас II (1250 mL)","Haemorrhage class II (1250 mL)"),set:{loss:1250},info:L(
 "25 %. Тахикардия 100–120, систолното налягане е почти запазено, но диастолното е високо → тясно пулсово налягане (≈25 mmHg). Шоковият индекс > 1. Урината пада до 20–30 mL/h (ADH, ангиотензин II, алдостерон). Кожата е бледа и студена — периферна вазоконстрикция.",
 "25 %. Tachycardia 100–120, systolic pressure almost preserved but diastolic high → narrow pulse pressure (≈25 mmHg). Shock index > 1. Urine falls to 20–30 mL/h (ADH, angiotensin II, aldosterone). Skin is pale and cold — peripheral vasoconstriction.")},
h3:{n:L("Кръвозагуба клас III (1750 mL)","Haemorrhage class III (1750 mL)"),set:{loss:1750},info:L(
 "35 %. HR 120–140, систолното < 100, дишане ≈30/min, урина 5–15 mL/h, объркване. Лактатът расте за часове. Транскапилярното пълнене връща ≈0,5–0,7 L за 1–4 h и Hct пада до ≈38–39 % — без кръвопреливане моделът оцелява, но на ръба (кислороден дълг 2–3 L).",
 "35 %. HR 120–140, systolic < 100, breathing ≈30/min, urine 5–15 mL/h, confusion. Lactate climbs over hours. Transcapillary refill returns ≈0.5–0.7 L within 1–4 h and Hct falls to ≈38–39 % — without transfusion the model survives, but only just (oxygen debt 2–3 L).")},
h4:{n:L("Кръвозагуба клас IV (2250 mL)","Haemorrhage class IV (2250 mL)"),set:{loss:2250},info:L(
 "45 %. HR > 140, систолно < 90, урината спира, дишане > 35, лактат > 5. Сърцето е на стръмната част на кривата на Франк–Старлинг, но MSFP е ≈1–2 mmHg. Кислородният дълг расте ≈40 mL/min и след ≈4,5 h надминава 7 L (100 mL/kg) — започва необратимата фаза.",
 "45 %. HR > 140, systolic < 90, urine stops, breathing > 35, lactate > 5. The heart sits on the steep part of the Frank–Starling curve but MSFP is ≈1–2 mmHg. Oxygen debt grows by ≈40 mL/min and after ≈4.5 h exceeds 7 L (100 mL/kg) — the irreversible phase begins.")},
h3cry:{n:L("Клас III + 2 L кристалоид","Class III + 2 L crystalloid"),set:{loss:1750,cry:2000},info:L(
 "От 30-ата min се вливат 2 L Рингер. Налягането се вдига за кратко, но кристалоидът няма онкотично налягане: разрежда плазмения белтък и за час 75–90 % излизат в интерстициума. Hct пада (хемодилуция) и кислородното съдържание пада заедно с него. ATLS 10 препоръчва начално ≤ 1 L и ранна кръв.",
 "From minute 30, 2 L of Ringer's is infused. Pressure rises briefly, but crystalloid has no oncotic pressure: it dilutes plasma protein and within an hour 75–90 % has moved into the interstitium. Hct falls (haemodilution) and oxygen content with it. ATLS 10 recommends ≤ 1 L initially and early blood.")},
h3bld:{n:L("Клас III + 1,5 L кръв","Class III + 1.5 L blood"),set:{loss:1750,bld:1500},info:L(
 "Кръвта (еритроцити + плазма 1:1) остава в съдовете, връща MSFP, ударния обем и кислородния капацитет. HR пада под 80 за минути, лактатът се изчиства за 1–2 h, урината се нормализира.",
 "Blood (RBC + plasma 1:1) stays intravascular and restores MSFP, stroke volume and oxygen-carrying capacity. HR falls below 80 within minutes, lactate clears in 1–2 h and urine output normalises.")},
irr:{n:L("Необратим шок (кръв на 5-ия час)","Irreversible shock (blood at hour 5)"),set:{loss:2250,bld:2250},info:L(
 "Клас IV без лечение 5 часа, после се връща ЦЯЛАТА изгубена кръв. Налягането скача до ≈100 mmHg, но след ≈1 h пада отново и пациентът умира: натрупаният кислороден дълг е задействал порочния кръг — потиснат миокард, отказ на вазомоторния център, ацидоза, капилярен теч (Hct расте). Експериментът на Гайтън с кучета (гл. 24).",
 "Class IV untreated for 5 h, then ALL of the lost blood is returned. Pressure jumps to ≈100 mmHg, but after ≈1 h it falls again and the patient dies: the accumulated oxygen debt has triggered the vicious circle — depressed myocardium, failing vasomotor centre, acidosis, capillary leak (Hct rises). Guyton's dog experiment (ch. 24).")},
sept:{n:L("Септичен шок","Septic shock"),set:{tpr:30,leak:15},info:L(
 "Възпалителни медиатори (NO, простагландини) → артериоло- и венодилатация, съдова хипореактивност към катехоламините, относителен дефицит на ADH, капилярен теч. Рано CO е ВИСОК (8–9 L/min, „топъл“ шок), TPR ≈40 % от нормата, MAP < 65. Лактатът расте, въпреки че доставката на O₂ е висока — микроциркулаторен шънт и намалена екстракция. Sepsis-3: вазопресор за MAP ≥ 65 и лактат > 2 въпреки течности.",
 "Inflammatory mediators (NO, prostaglandins) → arteriolar and venous dilation, vascular hyporesponsiveness to catecholamines, relative ADH deficiency, capillary leak. Early CO is HIGH (8–9 L/min, 'warm' shock), TPR ≈40 % of normal, MAP < 65. Lactate rises although O₂ delivery is high — microcirculatory shunting and impaired extraction. Sepsis-3: vasopressor for MAP ≥ 65 and lactate > 2 despite fluids.")},
card:{n:L("Кардиогенен шок","Cardiogenic shock"),set:{contr:18},info:L(
 "Обширен инфаркт: кривата на сърдечната функция е ниска и полегата. CO 2,6 L/min (CI < 2,2), систолно ≈90, RAP се вдига до 7–9 mmHg и продължава да расте (задръжка на течности). TPR е висок, кожата студена, урината ≈20 mL/h. Допълнителна течност вдига RAP, но не и CO.",
 "Large infarct: the cardiac function curve is low and flat. CO 2.6 L/min (CI < 2.2), systolic ≈90, RAP rises to 7–9 mmHg and keeps rising (fluid retention). TPR is high, skin cold, urine ≈20 mL/h. Extra fluid raises RAP but not CO.")},
anaph:{n:L("Анафилактичен шок","Anaphylactic shock"),set:{tpr:20,leak:35},info:L(
 "IgE → мастоцити → хистамин, левкотриени, PAF: за минути масивна артериоло- и венодилатация и капилярен теч (до 35 % от плазмата за 10 min). MAP пада под 60 за 5 min, HR > 150, пулсовото налягане е широко (нисък диастолен), Hct расте. Лечение: адреналин i.m. 0,5 mg (α1 — тонус, β1 — сърце, β2 — бронхи, стабилизира мастоцитите) + течности.",
 "IgE → mast cells → histamine, leukotrienes, PAF: within minutes massive arteriolar and venous dilation and capillary leak (up to 35 % of plasma in 10 min). MAP drops below 60 within 5 min, HR > 150, pulse pressure is wide (low diastolic), Hct rises. Treatment: adrenaline 0.5 mg i.m. (α1 — tone, β1 — heart, β2 — bronchi, stabilises mast cells) + fluids.")},
neuro:{n:L("Неврогенен шок","Neurogenic shock"),set:{symt:10},info:L(
 "Прекъснат симпатиков изход (травма над Th6): венозен застой (ненапрегнатият обем расте), ниско TPR, а сърдечните симпатикови влакна (Th1–4) са загубени → НЯМА тахикардия (HR ≈80 при MAP 65), кожата е топла и суха. Барорецепторите сигнализират, но еферентното рамо липсва. Лечение: течности + вазопресор (норадреналин), при брадикардия — атропин.",
 "Sympathetic outflow interrupted (injury above T6): venous pooling (unstressed volume rises), low TPR, and the cardiac sympathetic fibres (T1–4) are lost → NO tachycardia (HR ≈80 at a MAP of 65), skin warm and dry. Baroreceptors still signal, but the efferent limb is missing. Treatment: fluids + vasopressor (noradrenaline), atropine for bradycardia.")}
```
`irr` е единственият пресет с отложено вливане (t ≥ 300 min); всички други вливания започват на 30-ата min. Ако потребителят мести `cry`/`bld` по време на симулацията, вливането започва веднага (ако t ≥ 30), със 100 mL/min.

---

## 3. Статистики, графики, бележки

### 3.1 `stats`
1. `L("Време","Time")` → `fmtT(s.t)` („42 s“, „17 min“, „3 h 20 min“, „2 d 4 h“) + `" · 1 s = "+warpLabel`
2. `MAP` → `fmt(MAP,0)+" mmHg ("+fmt(SBP,0)+"/"+fmt(DBP,0)+")"`
3. `L("Пулсово налягане","Pulse pressure")` → `fmt(PP,0)+" mmHg (35–50)"`
4. `HR` → `fmt(HR,0)+" /min · SI "+fmt(SI,2)`
5. `L("Ударен обем / CO","Stroke volume / CO")` → `fmt(SV,0)+" mL · "+fmt(CO,1)+" L/min (CI "+fmt(CO/1.9,1)+")"`
6. `RAP / MSFP` → `fmt(RAP,1)+" / "+fmt(MSFP,1)+" mmHg"`
7. `TPR` → `fmt(TPR*80,0)+" dyn·s·cm⁻⁵ (900–1500)"`
8. `L("Кръвен обем","Blood volume")` → `fmt(V,0)+" mL ("+fmt(100*(1-V/5000),0)+" % дефицит) · загуба "+fmt(s.bled,0)+" mL"`
9. `Hct` → `fmt(Hct*100,1)+" % · белтък "+fmt(Cp,1)+" g/dL"`
10. `L("Транскапилярен поток","Transcapillary flow")` → `fmt(Lym-Jv,1)+" mL/min към кръвта"` (знак: + = пълнене)
11. `L("Лактат / pH / BE","Lactate / pH / BE")` → `fmt(s.Lac,1)+" mmol/L · "+fmt(pH,2)+" · "+fmt(BE,1)`
12. `L("Урина","Urine")` → `fmt(UO*60,0)+" mL/h (> 0,5 mL/kg/h = 35)"`
13. `L("ADH / ренин / алдостерон","ADH / renin / aldosterone")` → `"×"+fmt(s.ADH,1)+" / ×"+fmt(s.Ren,1)+" / ×"+fmt(s.Ald,1)`
14. `L("Симпатикус / вагус","Sympathetic / vagal")` → `fmt(symE,2)+" / "+fmt(s.par,2)`
15. `L("O₂: доставка / дълг","O₂: delivery / debt")` → `fmt(DO2,0)+" mL/min · дълг "+fmt(s.D/1000,1)+" L (праг 7)"`
16. `L("Дишане","Respiration")` → `fmt(RR,0)+" /min"`

### 3.2 Графики (`rec:(s,p,t)=>[s.t,F.MAP,F.HR,F.CO,s.Lac,F.Hct*100,F.V,F.UO*60,s.ADH,s.D]`)
- **Графика 1 — времеви ход (логаритмична ос на времето):** x = `log10(max(0.1,t))` от −1 до 3,64 с етикети „6 s, 1 min, 10 min, 1 h, 6 h, 24 h, 72 h“ (−1; 0; 1; 1,78; 2,56; 3,16; 3,64); y 0–160. Серии: MAP — плътна червена `#c92a2a` (2,4 px); HR — синя `#1c7ed6`; CO×10 — лилава `#7048e8`; лактат×10 — тъмнооранжева `#d9480f`; Hct % — пурпурна `#a61e4d` пунктир; кръвен обем L×20 — индиго `#364fc7` пунктир. Хоризонтални линии: MAP 65 (сива пунктирана, „цел при шок“). Вертикални маркери: край на кървенето, начало/край на вливането (сиви).
- **Графика 2 — диаграма на Гайтън:** x = RAP от −4 до 16 mmHg, y = поток 0–12 L/min. Текуща крива на венозното връщане `VR(r)` (индиго `#364fc7`, плато под −2 = колапс на вените), текуща сърдечна функционална крива `CO_h(r)` (червена `#c92a2a`), нормални криви в сиво пунктир (MSFP 7, RVR 1,4; SVmax 125, kS 2,5, HR 72); работна точка — запълнен кръг с етикет „CO / RAP“; пресечната точка на VR с оста x = MSFP (малък триъгълник, етикет „MSFP“). Изчислява се в `calc` с текущите `HR, SVm, kS, MSFP, RVR` (върни ги от `shFlux`).
- `legend`: MAP · HR · CO×10 · лактат×10 · Hct · обем L×20 | VR · сърдечна крива · норма (пунктир) · работна точка.
(Без зелени и жълти цветове.)

### 3.3 `note` (първото съвпадение печели; всички през `L(bg,en)`)
```
s.dead                                  → "Смърт: MAP < 25 mmHg над 5 min. Необратимата фаза започва, когато кислородният дълг надхвърли ≈100 mL/kg." / "Death: MAP < 25 mmHg for > 5 min. The irreversible phase starts when the oxygen debt exceeds ≈100 mL/kg."
s.Ir>0.15                               → "Необратим шок: порочният кръг (миокард ↓, вазомоторен център ↓, ацидоза, капилярен теч) вече се самоподдържа — дори пълно възстановяване на обема дава само временно подобрение." / "Irreversible shock: the vicious circle (myocardium ↓, vasomotor centre ↓, acidosis, capillary leak) is now self-sustaining — even full volume replacement gives only a temporary improvement."
s.D>4000 && !s.Ir                       → "Прогресивен шок: кислородният дълг е "+fmt(D/1000,1)+" L. Под ≈7 L той още е обратим — сега е моментът за кръв и спиране на кървенето." / "Progressive shock: oxygen debt "+…+" L. Below ≈7 L it is still reversible — now is the time for blood and haemorrhage control."
E.symt<40 && MAP<75                     → "Неврогенен шок: хипотония БЕЗ тахикардия, топла кожа — барорефлексът не може да стигне до сърцето и съдовете." / "Neurogenic shock: hypotension WITHOUT tachycardia, warm skin — the baroreflex cannot reach heart and vessels."
E.contr<45 && RAP>4                     → "Кардиогенен шок: RAP е висок, а CO нисък — работната точка е на плоската част на ниската сърдечна крива; още течност вдига RAP, не CO." / "Cardiogenic shock: RAP high and CO low — the operating point lies on the flat part of a depressed cardiac curve; more fluid raises RAP, not CO."
TPR<11 && CO>6.5 && MAP<70              → "Дистрибутивен („топъл“) шок: CO е висок, но TPR е ≈40 % — налягането пада въпреки високия поток. Лактатът расте заради микроциркулацията, не заради ниската доставка." / "Distributive ('warm') shock: CO is high but TPR ≈40 % — pressure falls despite high flow. Lactate rises because of the microcirculation, not low delivery."
s.gC>500 && Hct<0.38 && s.t-30<180      → "Кристалоидът разрежда: от "+fmt(s.gC,0)+" mL в съдовете са останали ≈"+fmt(retained,0)+" mL. Hct и кислородното съдържание падат." / "Crystalloid dilutes: of "+…+" mL only ≈"+…+" mL remain intravascular. Hct and oxygen content fall."
s.bled>1500 && SBP<95                   → "ATLS клас III–IV: SBP пада едва при загуба > 30 %. По-ранни белези: HR, тясно пулсово налягане, шоков индекс > 1, лактат." / "ATLS class III–IV: SBP falls only after > 30 % loss. Earlier signs: HR, narrow pulse pressure, shock index > 1, lactate."
Lym-Jv>3 && s.t<480                     → "Транскапилярно пълнене: прекапилярната вазоконстрикция сваля Pc до ≈"+fmt(Pc,0)+" mmHg и течността влиза в капилярите (≈0,5–1 L за часове) → Hct пада." / "Transcapillary refill: precapillary constriction lowers Pc to ≈"+…+" mmHg and fluid enters the capillaries (≈0.5–1 L over hours) → Hct falls."
s.bled>300 && s.t<3                     → "Първите секунди: вагусът се изключва за 1–2 s (HR ↑), симпатикусът — за 5–20 s (съдове, вени, контрактилитет)." / "First seconds: vagal tone is withdrawn within 1–2 s (HR ↑), sympathetic activation follows in 5–20 s (vessels, veins, contractility)."
```
`retained = (V − V_h_без_вливане)` не е известен в реално време → приближение: `retained ≈ gC − ∫(Jv−Jv₀)dt` от началото на вливането (поддържай `s.cryOut`).

### 3.4 2D рисунка (`draw`, 640×360)
1. **Кръвообращение (център)** — затворен кръг: ляво „сърце“ (две камери; размерът пулсира с HR, амплитуда ∝ SV), горе „артерии“ (дебела тръба; дебелина на стената ∝ TPR, вътрешен цвят — наситеност ∝ SaO₂·Hb), дясно „капилярно легло“ (мрежа; стрелки навън/навътре ∝ Jv, синя пунктирана лимфа ∝ Lym), долу „вени“ — резервоар с две нива: **ненапрегнат** обем (светло, отдолу до Vu) и **напрегнат** обем (тъмно, над Vu; височината = MSFP); стени на вените се стягат при symE ↑. Частици кръв се движат със скорост ∝ CO.
2. **Кървене / вливане** — червена капка от артерията навън (брояч mL), спринцовка/банка в вената (синя за кристалоид, червена за кръв).
3. **Мозъчен ствол (горе вляво)** — каротиден синус (честота на импулси ∝ MAP, точки по нерва), NTS → RVLM; две стрелки: вагус към синусовия възел (дебелина ∝ par), симпатикус към сърце/артериоли/вени/надбъбрек (∝ symE); лампичка „хеморецептори“ (MAP < 80) и „CNS исхемия“ (MAP < 50).
4. **Хормони (горе вдясно)** — хипофиза → ADH (стрелка към бъбрека, ∝ log ADH), бъбрек → ренин → AngII → надбъбрек → алдостерон; капка урина под бъбрека (размер ∝ UO).
5. **Метаболизъм (долу вдясно)** — „термометър“ лактат (0–15), лента „O₂-дълг“ с червена черта на 7 L, кръг „порочен кръг“, който започва да се върти и почервенява при Ir > 0,15.
6. **Скала на времето (долу)** — лента с 4 зони (секунди / минути / часове / дни) и маркер на текущото време; активната зона е подчертана и показва кой механизъм „работи“ сега (рефлекси → хормони → пълнене → бъбрек/жажда).

---

## 3a. Поетапна 3D сцена (stages)
Сцена: торс в полупрозрачен изглед — сърце, аорта с каротидни синуси, мозъчен ствол, хипофиза, бъбреци с надбъбреци, порталната/спланхнична венозна мрежа, едно увеличено „капилярно прозорче“ (клетъчно ниво). Всеки етап има `t` (заглавие) и `d` (текст) BG+EN и `upd(dt,s)` с анимацията. Стойностите идват от модела (пресет `h3` по подразбиране), така че 3D и графиките са синхронни.

1. **Кръвоизлив и спад на пълненето (0–30 s)** / *Haemorrhage and falling preload*
   - Движи се: червени частици напускат бедрената артерия (поток 100 mL/min, брояч); венозният резервоар (спланхнични вени) се свива; камерите на сърцето се пълнят по-малко (диастолен обем ↓), ударът е по-слаб; стената на каротидния синус се разтяга по-малко → **импулсите в синусовия нерв (Херинг → IX) се разреждат** (светещи точки по нерва, честота ∝ MAP).
   - Текст: „Губи се обем → MSFP пада → венозното връщане и RAP падат → по Франк–Старлинг ударният обем пада. MAP е още нормален, но барорецепторите вече „чуват“ по-малкото разтягане при всеки удар.“
2. **Барорефлекс: вагус за 1–2 s, симпатикус за 5–20 s** / *Baroreflex: vagal 1–2 s, sympathetic 5–20 s*
   - Движи се: NTS (продълговат мозък) — по-малко възбуда → CVLM спира да потиска RVLM; първо **вагусът към SA-възела угасва** (HR ↑ веднага), после **симпатиковите влакна** (Th1–L2 → паравертебрални ганглии) светват: SA-възел (по-бърз ритъм, β1), камерите се свиват по-силно (β1, Ca²⁺), **артериолите на кожата, червата и бъбреците се стесняват** (α1; лумен ↓), **вените се стягат** (α1) → кръв от ненапрегнатия обем преминава в напрегнатия (MSFP ↑); надбъбречната медула изпуска адреналин.
   - Текст: „Мозъкът не мери обема, а налягането и разтягането. Отговорът е в секунди и запазва MAP почти нормален до ≈15–20 % загуба — затова ранните белези са тахикардия и тясно пулсово налягане, не хипотония. Кожата и бъбрекът се жертват, за да се пазят мозъкът и сърцето.“
3. **Хормони: ренин–ангиотензин–алдостерон и ADH (минути–часове)** / *Hormones: RAAS and ADH (minutes–hours)*
   - Движи се: юкстагломерулните клетки изпускат ренин (β1 + нисък перфузионен натиск) → ангиотензиноген → AngI → (АСЕ в белия дроб) → **AngII**: артериолите се стягат, надбъбречната кора (zona glomerulosa) изпуска **алдостерон** → Na⁺ задържане в събирателните каналчета; хипоталамус (супраоптично/паравентрикуларно ядро) → задна хипофиза → **ADH**: V1 — вазоконстрикция, V2 — аквапорин-2 в апикалната мембрана на главните клетки → водата се връща; **урината намалява** (капката се смалява до ≈10 mL/h). Жаждата (субфорникален орган, AngII) светва.
   - Текст: „Хормоните са по-бавни от рефлекса (минути), но действат по-дълго и пазят водата и солта. При голяма загуба ADH скача десетки пъти и става вазопресор.“
4. **Транскапилярно пълнене и хемодилуция (часове)** / *Transcapillary refill and haemodilution (hours)*
   - Движи се: в капилярното прозорче прекапилярният сфинктер/артериола се стеснява → хидростатичното налягане в капиляра пада (17 → ≈9 mmHg, цветна скала); стрелките на течността **обръщат посоката — навътре в капиляра** (протеин-бедна течност, сини частици); еритроцитите в лумена се разреждат (Hct 45 → 39 %); от лимфния съд албумин (бели частици) се връща в кръвта; черният дроб започва да синтезира албумин (часове–дни).
   - Текст: „Прекапилярната вазоконстрикция сваля капилярното налягане и онкотичното налягане на плазмата „всмуква“ интерстициална течност — ≈0,5–1 L за часове. Тази течност няма еритроцити: затова хематокритът пада едва часове след кръвоизлива. По ревизирания модел на Старлинг (гликокаликс) устойчива абсорбция няма — абсорбцията е преходна, точно колкото след внезапен спад на Pc.“
5. **Кислороден дълг и лактат** / *Oxygen debt and lactate*
   - Движи се: в мускулна/чревна клетка митохондриите угасват (по-малко O₂ частици), пируватът не влиза в цикъла на Кребс → **LDH: пируват → лактат + NAD⁺**, лактат и H⁺ излизат през MCT в кръвта; черният дроб (Кори) ги поема, но с намален кръвоток; лентата „O₂-дълг“ се пълни към прага 7 L; дишането се учестява (хеморецептори, ацидоза).
   - Текст: „Когато доставката падне под критичната (≈4–5 mL/kg/min), клетките превключват на гликолиза. Лактатът е маркер на тъканна хипоперфузия; кумулативният кислороден дълг (> 100 mL/kg при кучета) предсказва необратимостта.“
6. **Декомпенсация и необратим шок (порочният кръг)** / *Decompensation and irreversible shock (the vicious circle)*
   - Движи се: пръстен от 6 сегмента се върти и почервенява: (1) коронарна хипоперфузия → **миокардът отслабва** (камерите се свиват по-слабо); (2) **вазомоторният център отказва** (симпатиковите влакна угасват); (3) **ацидоза** → артериолите не отговарят на норадреналин (отпускат се); (4) **капилярен теч** — ендотелни междини, албумин и плазма излизат, Hct расте; (5) „утаяване“ (sludging) на кръвта в бавните капиляри; (6) освобождаване на токсини/цитокини от исхемичните черва. При `irr` червена банка кръв влиза → налягането скача, пръстенът забавя за 1 h, после пак се ускорява.
   - Текст: „Над определен кислороден дълг всяко влошаване намалява CO още повече — положителна обратна връзка. Тогава дори пълното връщане на обема не спасява: това е необратимият шок. Затова времето до спиране на кървенето и до кръвта е решаващо („златният час“).“

Технически: `stg` масив с 6 обекта `{t:L(..),d:L(..),dur:8,upd(dt,s){…}}`; бутони ◀ ▶; при пресети `sept/anaph/neuro/card` етап 1 сменя текста (дистрибутивен/кардиогенен механизъм) — `d` е функция на `p.pre`.

---

## 4. Теория (`book`)
`title:L("Шок и кръвозагуба: интегрирана регулация","Shock and haemorrhage: integrated regulation")`
`adv:L("как обемът, сърцето и съдовете се срещат в кривите на Гайтън, как рефлексите, хормоните и капилярите компенсират загубата в секунди, минути и часове, и кога компенсацията се превръща в порочен кръг","how volume, heart and vessels meet in Guyton's curves, how reflexes, hormones and capillaries compensate a loss over seconds, minutes and hours, and when compensation turns into a vicious circle")`
`lead:L("Шокът е неадекватен тъканен кръвоток спрямо нуждата от O₂ — не просто ниско налягане. По Guyton, гл. 24, 20 и 18.","Shock is tissue blood flow inadequate for O₂ demand — not simply low pressure. After Guyton, ch. 24, 20 and 18.")`

**secs:**

1. **Цели на урока / Learning objectives** (`LI`)
   - Да построиш работната точка CO = VR от MSFP, RAP и RVR и сърдечната крива, и да предскажеш как я местят кръвозагуба, вливане, симпатикус и инфаркт. / Build the operating point CO = VR from MSFP, RAP, RVR and the cardiac curve, and predict how haemorrhage, infusion, sympathetic drive and infarction move it.
   - Да подредиш компенсаторните механизми по време: барорефлекс (s) → хеморецептори/CNS-исхемия → RAAS и ADH (min) → транскапилярно пълнене (h) → бъбрек, жажда, албумин (h–d) → еритропоеза (седмици). / Order the compensations in time: baroreflex (s) → chemoreceptors/CNS ischaemia → RAAS and ADH (min) → transcapillary refill (h) → kidney, thirst, albumin (h–d) → erythropoiesis (weeks).
   - Да разпознаеш клас I–IV по ATLS и защо систолното налягане е късен белег. / Recognise ATLS classes I–IV and why systolic pressure is a late sign.
   - Да различиш хиповолемичен, кардиогенен, дистрибутивен (септичен, анафилактичен, неврогенен) и обструктивен шок по CO, RAP, TPR и HR. / Distinguish hypovolaemic, cardiogenic, distributive (septic, anaphylactic, neurogenic) and obstructive shock by CO, RAP, TPR and HR.
   - Да обясниш кислородния дълг, лактата и положителните обратни връзки на необратимия шок. / Explain oxygen debt, lactate and the positive feedbacks of irreversible shock.

2. **Норма: числата / Normal values**
   - Кръвен обем ≈ 70 mL/kg (5 L при 70 kg): ≈ 64 % във вени и венули, ≈ 13 % в артерии, ≈ 7 % в капиляри, ≈ 16 % в сърце и бял дроб.
   - Ненапрегнат обем ≈ 4 L, напрегнат ≈ 1 L; MSFP ≈ 7 mmHg; RAP ≈ 0 (CVP 2–8 mmHg спрямо средна аксиларна линия); RVR ≈ 1,4 mmHg·min/L.
   - CO 5 L/min (CI 2,5–4,0 L/min/m²), SV 60–100 mL, HR 60–100; MAP 70–105 mmHg; TPR 900–1500 dyn·s·cm⁻⁵; пулсово налягане 35–50 mmHg.
   - Шоков индекс HR/SBP 0,5–0,7 (> 0,9–1,0 = шок, дори при „нормално“ SBP).
   - Капиляр (Guyton): Pc ≈ 17 mmHg (средно), Pif ≈ −3, πp ≈ 28, πif ≈ 8 mmHg → нетно ≈ +0,3 mmHg; Kf ≈ 6,7 mL/min/mmHg; филтрацията ≈ 2 mL/min се връща с лимфата.
   - DO₂ ≈ 1000 mL/min (550–650 mL/min/m²), VO₂ ≈ 250 mL/min, екстракция ≈ 25 % (макс. 60–70 %); критична DO₂ ≈ 4–5 mL/kg/min.
   - Лактат 0,5–1,5 mmol/L, продукция ≈ 1400 mmol/ден (черен дроб и бъбрек я изчистват); > 2 = хипоперфузия, > 4 = висок риск.
   - Урина ≈ 1 mL/kg/h (60–70 mL/h); олигурия < 0,5 mL/kg/h.

3. **Механизмът стъпка по стъпка / The mechanism step by step** (`<ol>`)
   1. **Кривите на Гайтън:** венозното връщане VR = (MSFP − RAP)/RVR — права, която пресича оста x при MSFP; под RAP ≈ −2…−4 mmHg вените колабират и VR спира да расте. Сърдечната функционална крива расте с RAP (Франк–Старлинг) до плато. Сърцето и съдовете работят там, където двете се пресичат.
   2. **Кръвозагубата** намалява напрегнатия обем → MSFP пада → VR-правата се измества успоредно наляво → нова точка с по-нисък RAP и по-нисък CO. MAP = CO × TPR + RAP пада.
   3. **Барорецепторите** (каротиден синус, аортна дъга) намаляват честотата си за един удар. NTS спира да активира CVLM → RVLM се „освобождава“: вагусът спада за 1–2 s, симпатикусът расте за 5–20 s. Ниският RAP разтоварва и **кардиопулмоналните (обемни) рецептори** → допълнителен симпатикус и ADH.
   4. **Симпатикусът** вдига HR и контрактилитета (кривата на сърцето нагоре), **стяга вените** (по-малък ненапрегнат обем → MSFP ↑ — до ≈2,5 пъти при максимална стимулация) и **артериолите** (TPR ↑, особено кожа, черва, бъбрек); надбъбречната медула освобождава адреналин. Мозъкът и сърцето са пощадени — тяхната регулация е главно метаболитна.
   5. Под **MAP ≈ 80** се включват **хеморецепторите** (хипоперфузия на каротидните телца), под **≈ 50** — **CNS-исхемичният отговор**, най-силният симпатиков стимул („последната линия“).
   6. **Минути:** ренин (β1 + нисък перфузионен натиск на аферентната артериола + ↓ NaCl в macula densa) → AngII (вазоконстрикция, жажда, алдостерон, ADH); ADH от задната хипофиза (несмотичен стимул — загуба > 10–15 %) → V1 вазоконстрикция, V2 задържане на вода. Урината пада.
   7. **Часове:** прекапилярната вазоконстрикция сваля Pc → интерстициална течност навлиза в капилярите (**транскапилярно пълнене**, ≈0,5–1 L) → хемодилуция: Hct пада часове след кръвоизлива. Белтъкът се връща с лимфата; черният дроб синтезира албумин (дни).
   8. **Дни:** бъбрекът задържа сол и вода (алдостерон, ADH, ↓GFR), жаждата връща водата, обемът се нормализира за 1–3 дни; еритроцитната маса — за 3–6 седмици (EPO, тема `erythro`).
   9. **Кислороден дълг:** когато DO₂ падне под критичната, VO₂ става зависима от доставката → анаеробна гликолиза → лактат и H⁺. Кумулативният дефицит (O₂-дълг) предсказва изхода: при кучета ≈100 mL/kg е преживяем, 120 mL/kg — LD50, ≥ 140 — фатален (Crowell & Smith 1964).
   10. **Прогресивен шок (положителна обратна връзка):** коронарна хипоперфузия → слабо сърце → по-нисък CO; исхемия на вазомоторния център → симпатикусът отказва; ацидоза → съдовете не отговарят на катехоламини; капилярен теч → губи се плазма; „утаяване“ на кръвта; токсини от исхемичните черва; генерализирано клетъчно увреждане (Na⁺/K⁺-ATPase, лизозоми). Над определен праг кръгът се самоподдържа — **необратим шок**.

4. **Регулация / Regulation**
   - **Непрогресивен (компенсиран) шок:** отрицателните обратни връзки (барорефлекс, CNS, RAAS, ADH, пълнене, жажда) връщат налягането — загуби до ≈ 30–35 % се преживяват без лечение, ако кървенето спре.
   - **Прогресивен шок:** положителните обратни връзки надделяват; всяко влошаване увеличава следващото. Определя се от дълбочината × продължителността на хипоперфузията (O₂-дълг), не от едно измерване на налягането.
   - **Необратим шок:** дори пълно възстановяване на обема дава само временно повишение на налягането (експериментите на Гайтън с кучета, гл. 24) — клетъчните енергийни запаси (АТФ → аденозин → изчезва) не се възстановяват.
   - **Дистрибутивен шок** (сепсис, анафилаксия, неврогенен): проблемът е съдовото „легло“, не обемът — артериоло- и венодилатация, при сепсис и анафилаксия + капилярен теч. При сепсис съдовете са хипореактивни към норадреналин (NO, K-ATP канали), а ADH е неадекватно нисък (Landry 1997) — затова вазопресинът е втори вазопресор.
   - **Кардиогенен шок:** първичен спад на сърдечната крива; рефлексите (тахикардия, вазоконстрикция, задръжка на течности) увеличават следнатоварването и консумацията на O₂ от миокарда — сами по себе си порочен кръг.
   - **Обструктивен шок** (тампонада, тензионен пневмоторакс, масивна БЕ): кривата на сърцето е „отрязана“ от механично препятствие — висок RAP, нисък CO (в модела ≈ кардиогенен; лечението е механично).

5. **Клинично значение / Clinical relevance**
   - **ATLS (10-то изд., Table 3-1):** клас I < 15 % — почти без промени; II 15–30 % — тахикардия 100–120, тясно пулсово налягане, BD −2…−6; III 31–40 % — HR 120–140, SBP ↓, урина 5–15 mL/h, объркване, BD −6…−10, нужда от кръв; IV > 40 % — HR > 140, SBP ↓↓, анурия, летаргия, BD ≤ −10, масивна трансфузия.
   - **Лечение на хеморагичния шок:** спиране на кървенето (компресия, турникет, хирургия/емболизация), ранна кръв 1:1:1 (ЕМ:плазма:тромбоцити), транексамова киселина ≤ 3 h, ограничен кристалоид (≤ 1 L), пермисивна хипотония (SBP 80–90) до хемостазата (без ЧМТ), профилактика на „смъртоносната триада“ (хипотермия, ацидоза, коагулопатия).
   - **Сепсис (Sepsis-3, SSC 2021):** септичен шок = нужда от вазопресор за MAP ≥ 65 + лактат > 2 mmol/L въпреки адекватни течности. Кристалоид 30 mL/kg в първите 3 h (при хипоперфузия), норадреналин първа линия, цел MAP ≥ 65, вазопресин при нужда, антибиотик до 1 h.
   - **Кардиогенен шок:** SBP < 90 за > 30 min (или вазопресор), CI < 2,2 L/min/m², PCWP > 15 mmHg, белези на хипоперфузия; реваскуларизация, инотропи, механична поддръжка; течностите помагат само при нисък RAP/PCWP.
   - **Анафилаксия:** адреналин 0,5 mg i.m. (0,01 mg/kg) в бедрото, при нужда повторно след 5 min; бързо 1–2 L кристалоид; легнало положение.
   - **Неврогенен шок:** хипотония + брадикардия + топла кожа след гръбначна травма; течности, норадреналин, атропин; да се изключи кървене (травмата рядко е само неврогенна).
   - **Мониторинг:** лактат (и клирънс), шоков индекс, капилярно пълнене, диуреза, ScvO₂, ехокардиография; хемоглобинът в първите часове е подвеждащ.

6. **Чести заблуди / Common misconceptions**
   - „Нормално налягане = няма шок.“ — При клас II SBP е нормален; тахикардията, тясното пулсово налягане, лактатът и шоковият индекс са по-ранни.
   - „Hb веднага показва загубата.“ — Губи се цяла кръв; Hct пада едва с транскапилярното пълнене и вливанията (часове).
   - „Сърцето определя CO сам.“ — В покой CO се определя главно от венозното връщане (MSFP − RAP, RVR); сърцето е „разрешаващо“, докато не е на платото.
   - „Повече течност винаги вдига CO.“ — Само ако работната точка е на стръмната част на кривата; при кардиогенен шок вдига RAP и води до белодробен оток.
   - „1 L кристалоид замества 1 L кръв.“ — Остава ≈ 20–25 % в съдовете, разрежда Hb и белтъка; кръвта остава почти изцяло.
   - „Септичният шок винаги е студен.“ — Рано е хипердинамичен (CO висок, топла кожа); хипоксията е микроциркулаторна.
   - „Шок = тахикардия.“ — Неврогенният шок, β-блокерите, пейсмейкърът и старостта маскират тахикардията.
   - „Щом налягането се върне, опасността е минала.“ — След дълъг период на хипоперфузия кислородният дълг може да е задействал необратимите механизми.

7. **Опростено в модела / Simplified in the model**
   - Една „средна“ камера и една системна циркулация: няма отделни лява/дясна камера и белодробно кръвообращение — при кардиогенен шок RAP заменя PCWP; няма белодробен оток и хипоксемия (SaO₂ = 97 % винаги).
   - Кривите на Гайтън са квазистационарни (RAP се решава алгебрично); няма пулсова вълна — SBP/DBP се изчисляват от SV/Ca, а Ca намалява емпирично със симпатикуса.
   - Барорефлексът е една сигмоида + кардиопулмонални, хеморецепторни и CNS-членове; HR е ограничен до ≈ 155/min (в сепсис реално по-често 110–140) — HR в модела може да е по-висок от клиничния.
   - Капилярът е един „среден“ капиляр с класическия Старлинг (Kf, σ, Pc, Pi, πp, πi) + лимфа; гликокаликсът (ревизиран модел) не е моделиран отделно — абсорбцията е преходна по построение (спира, щом белтъкът се разреди и Pi падне).
   - BE отразява САМО лактата (Winter-компенсация); хиперхлоремията от физиологичен разтвор, кетоните и уремичните аниони липсват — затова BE е по-малък от ATLS-BD.
   - O₂-дългът и необратимостта използват кучешкия праг 100 mL/kg и един индекс Ir (миокард, вазомоторен център, съдове, теч); няма отделни цитокини, коагулация, хипотермия, СИР/ПОН.
   - Кръвта за вливане е „1:1“ (Hct 40 %, белтък 6 g/dL); няма тромбоцити, фактори, Ca²⁺/цитрат, калий. Кристалоидът е изотоничен и няма ICF; няма колоиди и хипертонични разтвори.
   - Сепсисът и анафилаксията са зададени с фиксирани параметри (tpr, leak, ER, ↑VO₂, ↓ADH); няма антибиотик, адреналин и норадреналин като отделни лекарства — вазопресор ≈ повишаване на „Съдов тонус“.
   - Пиенето започва след 6-ия час (NPO), ако MAP > 70; не е моделирана осмоларитетът (само изоосмотичен обем).
   - Разпределението на кристалоида е по-бързо от клиничните кинетични данни (модел: 20 % в съдовете 10 min след края, 7 % след час; Hahn: ≈ 15–25 % за ≈ 1 h) — Kf е цялостен, без гликокаликс и без намаления клирънс при анестезия/хиповолемия.
   - Стойностите са за 70-килограмов мъж: кръв 5 L (Hct 45 %, плазма 2,75 L), интерстициум 11 L.

8. **Запомни (`key`, 8)**
   1. „CO = VR: пресечна точка на венозното връщане (MSFP − RAP)/RVR и кривата на Франк–Старлинг.“ / "CO = VR: the intersection of venous return (MSFP − RAP)/RVR and the Frank–Starling curve."
   2. „Кръвозагубата сваля MSFP; симпатикусът го вдига чрез венoконстрикция — мобилизира ненапрегнатия обем.“ / "Blood loss lowers MSFP; sympathetic venoconstriction raises it by mobilising unstressed volume."
   3. „Секунди — барорефлекс; минути — RAAS и ADH; часове — транскапилярно пълнене (Hct ↓); дни — бъбрек и жажда; седмици — еритроцити.“ / "Seconds — baroreflex; minutes — RAAS and ADH; hours — transcapillary refill (Hct ↓); days — kidney and thirst; weeks — red cells."
   4. „ATLS: HR, пулсово налягане и шоков индекс се променят преди SBP; SBP пада едва при > 30 % загуба.“ / "ATLS: HR, pulse pressure and shock index change before SBP; SBP falls only after > 30 % loss."
   5. „Кристалоидът се разпределя в целия ECF — в съдовете остава ≈ 1/4–1/5; кръвта остава.“ / "Crystalloid spreads over the whole ECF — only ≈ 1/4–1/5 stays intravascular; blood stays."
   6. „Хиповолемичен: CO ↓ RAP ↓ TPR ↑; кардиогенен: CO ↓ RAP ↑ TPR ↑; дистрибутивен: CO N/↑ RAP ↓ TPR ↓↓.“ / "Hypovolaemic: CO ↓ RAP ↓ TPR ↑; cardiogenic: CO ↓ RAP ↑ TPR ↑; distributive: CO N/↑ RAP ↓ TPR ↓↓."
   7. „Неврогенен шок = хипотония без тахикардия, топла кожа.“ / "Neurogenic shock = hypotension without tachycardia, warm skin."
   8. „Шокът става необратим, когато кислородният дълг задейства положителните обратни връзки — времето до кръвта решава.“ / "Shock becomes irreversible once the oxygen debt engages the positive feedbacks — time to blood decides."

---

## 5. Тестове (`tests`, 14 × 4 опции)
Формат: `[q_bg, q_en, [[opt_bg,opt_en]×4], answerIndex, expl_bg, expl_en]`

1. Средното системно налягане на пълнене (MSFP) е налягането, което: / Mean systemic filling pressure (MSFP) is the pressure that:
   [[Измерваме в дясното предсърдие при нормален кръвоток | Measured in the right atrium at normal flow], [Се установява навсякъде в кръвообращението, ако сърцето спре и кръвта се преразпредели | Is reached everywhere in the circulation if the heart stops and blood redistributes], [Е равно на средното артериално налягане | Equals mean arterial pressure], [Създава ненапрегнатият обем | Is generated by the unstressed volume]] → **1**
   Експл.: MSFP ≈ 7 mmHg и зависи от напрегнатия обем (V − Vu) и капацитанса; ненапрегнатият обем по определение не създава налягане. / MSFP ≈ 7 mmHg and depends on stressed volume (V − Vu) and capacitance; unstressed volume by definition creates no pressure.
2. При кръвозагуба без рефлекси кривата на венозното връщане: / With haemorrhage and no reflexes, the venous return curve:
   [[Се измества успоредно наляво (MSFP ↓) | Shifts in parallel to the left (MSFP ↓)], [Се завърта нагоре (RVR ↓) | Rotates upward (RVR ↓)], [Не се променя, а пада сърдечната крива | Does not change; the cardiac curve falls], [Се измества надясно | Shifts to the right]] → **0**
   Експл.: По-малкият напрегнат обем сваля MSFP; наклонът (1/RVR) е почти същият. Новата пресечна точка е с по-нисък RAP и CO. / Less stressed volume lowers MSFP; the slope (1/RVR) is almost unchanged. The new intersection has lower RAP and CO.
3. Кой компенсаторен механизъм действа най-бързо след кръвоизлив? / Which compensation acts fastest after a haemorrhage?
   [[Транскапилярното пълнене | Transcapillary refill], [Отделянето на алдостерон | Aldosterone release], [Спадането на вагусовия тонус към синусовия възел | Withdrawal of vagal tone to the sinus node], [Жаждата | Thirst]] → **2**
   Експл.: Вагусовият ефект (ACh, M2, GIRK) се развива и изчезва за 1–2 s; симпатиковият — за 5–20 s; хормоните — минути; пълненето — часове. / The vagal effect (ACh, M2, GIRK) appears and fades within 1–2 s; sympathetic in 5–20 s; hormones in minutes; refill in hours.
4. Пациент: HR 115, АН 108/86 mmHg, дишане 24/min, урина 25 mL/h, тревожен. Най-вероятна загуба по ATLS: / Patient: HR 115, BP 108/86 mmHg, RR 24/min, urine 25 mL/h, anxious. Most likely ATLS loss:
   [[< 15 % (клас I) | < 15 % (class I)], [15–30 % (клас II) | 15–30 % (class II)], [31–40 % (клас III) | 31–40 % (class III)], [> 40 % (клас IV) | > 40 % (class IV)]] → **1**
   Експл.: Тахикардия 100–120 и тясно пулсово налягане (22 mmHg) при запазено SBP — клас II. SBP пада при клас III. / Tachycardia 100–120 and a narrow pulse pressure (22 mmHg) with preserved SBP — class II. SBP falls in class III.
5. Защо пулсовото налягане се стеснява рано при кръвозагуба? / Why does pulse pressure narrow early in haemorrhage?
   [[Защото пада диастолното налягане | Because diastolic pressure falls], [Ударният обем пада, а вазоконстрикцията задържа диастолното налягане | Stroke volume falls while vasoconstriction maintains diastolic pressure], [Защото HR пада | Because HR falls], [Аортата става по-еластична | The aorta becomes more compliant]] → **1**
   Експл.: PP ≈ SV/Ca; SV ↓ (по-малко пълнене), а TPR ↑ държи DBP високо. / PP ≈ SV/Ca; SV ↓ (less filling) while TPR ↑ keeps DBP high.
6. Хематокритът след остра загуба на 1,5 L кръв: / Haematocrit after an acute 1.5 L blood loss:
   [[Пада веднага пропорционално на загубата | Falls immediately in proportion to the loss], [Остава почти непроменен в първите минути и пада за часове | Stays nearly unchanged in the first minutes and falls over hours], [Расте трайно | Rises permanently], [Пада само след вливане на кръв | Falls only after blood transfusion]] → **1**
   Експл.: Губи се цяла кръв; Hct пада, когато протеин-бедна интерстициална течност (транскапилярно пълнене) и вливанията разредят еритроцитите. / Whole blood is lost; Hct falls when protein-poor interstitial fluid (refill) and infusions dilute the red cells.
7. Транскапилярното пълнене след кръвоизлив се дължи главно на: / Transcapillary refill after haemorrhage is mainly due to:
   [[Повишено онкотично налягане в интерстициума | Increased interstitial oncotic pressure], [Спад на капилярното хидростатично налягане от прекапилярна вазоконстрикция | Fall in capillary hydrostatic pressure from precapillary vasoconstriction], [Повишена капилярна пропускливост | Increased capillary permeability], [Активен транспорт на Na⁺ в ендотела | Active endothelial Na⁺ transport]] → **1**
   Експл.: Pc пада (17 → ≈ 9 mmHg), онкотичното налягане на плазмата надделява → ≈ 0,5–1 L за часове; спира, когато белтъкът се разреди. / Pc falls (17 → ≈ 9 mmHg), plasma oncotic pressure prevails → ≈ 0.5–1 L over hours; it stops as protein is diluted.
8. 1 h след вливане на 2 L изотоничен кристалоид при хеморагичен шок в съдовете остават приблизително: / 1 h after infusing 2 L of isotonic crystalloid in haemorrhagic shock, roughly how much stays intravascular?
   [[≈ 2 L | ≈ 2 L], [≈ 1,5 L | ≈ 1.5 L], [≈ 0,1–0,5 L | ≈ 0.1–0.5 L], [0 L | 0 L]] → **2**
   Експл.: Кристалоидът няма онкотично налягане и се разпределя в ECF (плазма : интерстициум ≈ 1 : 4); клинично остават ≈ 15–25 %, в модела 20 % на 10-ата min и 7 % след час. / Crystalloid has no oncotic pressure and distributes over the ECF (plasma : interstitium ≈ 1 : 4); clinically ≈ 15–25 % remains, in the model 20 % at 10 min and 7 % after an hour.
9. Кой профил отговаря на кардиогенен шок? / Which profile fits cardiogenic shock?
   [[CO ↓, RAP ↓, TPR ↑ | CO ↓, RAP ↓, TPR ↑], [CO ↓, RAP ↑, TPR ↑ | CO ↓, RAP ↑, TPR ↑], [CO ↑, RAP ↓, TPR ↓ | CO ↑, RAP ↓, TPR ↓], [CO ↓, RAP ↓, TPR ↓ | CO ↓, RAP ↓, TPR ↓]] → **1**
   Експл.: Сърдечната крива пада → работната точка се мести надясно и надолу (висок RAP); рефлексът вдига TPR. Първият профил е хиповолемичен, третият — септичен, четвъртият — неврогенен. / The cardiac curve falls → the operating point moves right and down (high RAP); the reflex raises TPR. The first profile is hypovolaemic, the third septic, the fourth neurogenic.
10. Пациент с гръбначна травма на ниво C6: АН 80/50 mmHg, HR 58/min, топла суха кожа. Механизмът е: / Patient with a C6 spinal cord injury: BP 80/50 mmHg, HR 58/min, warm dry skin. The mechanism is:
    [[Хиповолемия от скрито кървене | Hypovolaemia from occult bleeding], [Загуба на симпатиковия еферентен тонус към съдове и сърце | Loss of sympathetic efferent tone to vessels and heart], [Потиснати барорецептори | Depressed baroreceptors], [Анафилаксия | Anaphylaxis]] → **1**
    Експл.: Барорецепторите сигнализират, но еферентното рамо (RVLM → интермедиолатерален стълб → Th1–L2) е прекъснато: венозен застой, нисък TPR, без тахикардия. Кървенето винаги трябва да се изключи. / Baroreceptors signal, but the efferent limb (RVLM → intermediolateral column → T1–L2) is cut: venous pooling, low TPR, no tachycardia. Bleeding must always be excluded.
11. При ранен септичен шок обикновено намираме: / In early septic shock we usually find:
    [[Нисък CO, висок TPR, студена кожа | Low CO, high TPR, cold skin], [Висок или нормален CO, нисък TPR, лактат > 2 | High or normal CO, low TPR, lactate > 2], [Висок RAP и белодробен оток | High RAP and pulmonary oedema], [Брадикардия | Bradycardia]] → **1**
    Експл.: Вазодилатация (NO), хипореактивност и капилярен теч; лактатът расте въпреки високата DO₂ заради микроциркулаторния шънт и намалената екстракция. / Vasodilation (NO), hyporesponsiveness and capillary leak; lactate rises despite high DO₂ due to microcirculatory shunting and impaired extraction.
12. Защо при необратим шок пълното връщане на изгубената кръв не спасява? / Why does returning all the lost blood fail in irreversible shock?
    [[Кръвта се разрушава веднага | The blood is destroyed immediately], [Положителните обратни връзки (миокард, вазомоторен център, ацидоза, капилярен теч) вече се самоподдържат | Positive feedbacks (myocardium, vasomotor centre, acidosis, capillary leak) are already self-sustaining], [Бъбрекът изхвърля обема | The kidney excretes the volume], [Барорецепторите са се адаптирали | The baroreceptors have adapted]] → **1**
    Експл.: Гайтън, гл. 24: след дълга хипоперфузия налягането се вдига временно, после пада отново; кислородният дълг е надхвърлил прага на обратимост. / Guyton, ch. 24: after prolonged hypoperfusion pressure rises transiently and then falls again; the oxygen debt has exceeded the reversibility threshold.
13. Какво прави вливането на още 1 L течност при кардиогенен шок с RAP 8 mmHg (по кривите на Гайтън)? / What does another 1 L of fluid do in cardiogenic shock with a RAP of 8 mmHg (by Guyton's curves)?
    [[Вдига CO значително | Raises CO markedly], [Вдига RAP, а CO почти не се променя | Raises RAP while CO barely changes], [Сваля RAP | Lowers RAP], [Сваля TPR до нормата | Normalises TPR]] → **1**
    Експл.: Работната точка е на плоската част на ниската крива; MSFP ↑ мести VR надясно, пресечната точка се качва по RAP. В модела: RAP 7,5 → 7,9, CO 2,62 → 2,64. / The operating point lies on the flat part of a depressed curve; MSFP ↑ shifts VR right and the intersection moves along RAP. In the model: RAP 7.5 → 7.9, CO 2.62 → 2.64.
14. Шоков индекс 1,4 (HR 130, SBP 93) означава: / A shock index of 1.4 (HR 130, SBP 93) means:
    [[Норма | Normal], [Значителна хипоперфузия — вероятно загуба > 30 % | Significant hypoperfusion — likely > 30 % loss], [Само тревожност | Anxiety only], [Хипертония | Hypertension]] → **1**
    Експл.: Норма 0,5–0,7; > 1 е свързан с нужда от трансфузия и по-висока смъртност, дори когато SBP е „над 90“. / Normal 0.5–0.7; > 1 is associated with transfusion need and higher mortality even when SBP is "above 90".

---

## 6. Експерименти (`exp`, 5 × 2 опции)
Формат: `{pre, sl?, q:L(), o:[L(),L()], a, h:L()}`
1. `{pre:"h3"}` — „Гледай първите 30 s реално време (първите 3 min). Кое се качва първо?“ / "Watch the first 30 s of real time (first 3 min). What rises first?"
   [[Сърдечната честота | Heart rate], [ADH и алдостеронът | ADH and aldosterone]] → **0**
   Подсказка: Вагусът изчезва за 1–2 s, симпатикусът идва за 5–20 s; ADH има τ ≈ 8 min, алдостеронът ≈ 40 min. / Vagal tone vanishes in 1–2 s, sympathetic comes in 5–20 s; ADH has τ ≈ 8 min, aldosterone ≈ 40 min.
2. `{pre:"h3cry"}` (сравни после с `h3bld`) — „Час след края на 2 L кристалоид колко е останало в съдовете?“ / "An hour after 2 L of crystalloid ended, how much remains intravascular?"
   [[Почти всичко | Almost all of it], [Около една десета, а Hct е паднал | About a tenth, and Hct has fallen]] → **1**
   Подсказка: Сравни реда „Кръвен обем“ с пресет „Клас III“ на същото време; после пусни „Клас III + 1,5 L кръв“ — HR пада под 80, лактатът се изчиства. / Compare the 'Blood volume' row with the 'Class III' preset at the same time; then run 'Class III + 1.5 L blood' — HR falls below 80, lactate clears.
3. `{pre:"irr"}` — „Цялата кръв се връща на 5-ия час. Какво става?“ / "All of the blood is returned at hour 5. What happens?"
   [[Трайно възстановяване | Lasting recovery], [Временно повишение, после колапс | A transient rise, then collapse]] → **1**
   Подсказка: Повтори с пресет „Клас IV“ и `кръв 2250 mL` (вливане от 30-ата min) — пациентът оцелява. Решава кислородният дълг, не количеството кръв. / Repeat with the 'Class IV' preset and blood 2250 mL (from minute 30) — the patient survives. The oxygen debt decides, not the amount of blood.
4. `{pre:"sept", sl:{cry:2000}}` — „Даваме 2 L кристалоид. Достатъчно ли е за MAP ≥ 65 след 2–4 h?“ / "We give 2 L of crystalloid. Is it enough for a MAP ≥ 65 after 2–4 h?"
   [[Да, налягането се нормализира | Yes, pressure normalises], [Не — течността изтича и съдовете остават разширени; нужен е вазопресор | No — the fluid leaks out and vessels stay dilated; a vasopressor is needed]] → **1**
   Подсказка: Вдигни „Съдов тонус“ на 60 % (≈ норадреналин): MAP се връща над 80, но лактатът продължава да расте — сепсисът е и микроциркулаторен, и клетъчен проблем. / Raise 'Vascular tone' to 60 % (≈ noradrenaline): MAP returns above 80, but lactate keeps rising — sepsis is a microcirculatory and cellular problem too.
5. `{pre:"neuro"}` — „MAP е ≈ 65 mmHg. Каква е сърдечната честота в сравнение с клас III кървене при подобно налягане?“ / "MAP is ≈ 65 mmHg. How does heart rate compare with class III bleeding at a similar pressure?"
   [[Същата тахикардия > 120 | The same tachycardia > 120], [Няма тахикардия (≈ 80) | No tachycardia (≈ 80)]] → **1**
   Подсказка: Барорецепторите сигнализират (централният симпатикус е висок — ред „Симпатикус“), но еферентният тонус е 10 %. Върни „Симпатиков тонус“ на 100 %. / Baroreceptors still signal (central sympathetic drive is high — 'Sympathetic' row), but efferent tone is 10 %. Return 'Sympathetic tone' to 100 %.

---

## 7. Речник (`gl`, 8 термина)
```js
{t:L("Средно системно налягане на пълнене (MSFP)","Mean systemic filling pressure (MSFP)"), re:"MSFP|налягане на пълнене|системно налягане на пълнене",
 d:L("Налягането, което би се установило в цялото кръвообращение при спряно сърце (≈ 7 mmHg). Определя се от напрегнатия обем (кръвта над ненапрегнатия ≈ 4 L) и капацитанса; движещата сила на венозното връщане е MSFP − RAP.",
     "The pressure that would be reached throughout the circulation if the heart stopped (≈ 7 mmHg). It is set by the stressed volume (blood above the ≈ 4 L unstressed volume) and capacitance; the driving force of venous return is MSFP − RAP.")},
{t:L("Ненапрегнат обем","Unstressed volume"), re:"ненапрегнат[а-я]* обем[а-я]*|unstressed",
 d:L("Обемът кръв, който пълни съдовете, без да разтяга стените им и без да създава налягане (≈ 4 L от 5 L, главно във вените). Симпатиковата венoконстрикция го намалява и „превръща“ в напрегнат обем — автотрансфузия.",
     "The blood volume that fills the vessels without stretching their walls or creating pressure (≈ 4 L of 5 L, mostly veins). Sympathetic venoconstriction reduces it and converts it into stressed volume — autotransfusion.")},
{t:L("Венозно връщане","Venous return"), re:"венозн[а-я]* връщане[а-я]*",
 d:L("VR = (MSFP − RAP)/RVR; в равновесие е равно на CO. Кривата е права, която пресича оста при MSFP и стига плато под RAP ≈ −2…−4 mmHg (колапс на вените). RVR ≈ 1,4 mmHg·min/L.",
     "VR = (MSFP − RAP)/RVR; at steady state it equals CO. The curve is a line crossing the axis at MSFP that plateaus below RAP ≈ −2…−4 mmHg (venous collapse). RVR ≈ 1.4 mmHg·min/L.")},
{t:L("Транскапилярно пълнене","Transcapillary refill"), re:"транскапилярн[а-я]* пълнене[а-я]*|refill",
 d:L("Преходно навлизане на интерстициална течност в капилярите след кръвоизлив, защото прекапилярната вазоконстрикция сваля Pc под онкотичното налягане на плазмата. ≈ 0,5–1 L за часове; течността е без еритроцити и с малко белтък → хемодилуция.",
     "Transient entry of interstitial fluid into capillaries after haemorrhage, because precapillary vasoconstriction lowers Pc below plasma oncotic pressure. ≈ 0.5–1 L over hours; the fluid lacks red cells and is low in protein → haemodilution.")},
{t:L("Шоков индекс","Shock index"), re:"шоков[а-я]* индекс[а-я]*",
 d:L("HR/SBP. Норма 0,5–0,7; > 0,9–1,0 показва значителна хипоперфузия и нужда от кръв, дори при „нормално“ систолно налягане.",
     "HR/SBP. Normal 0.5–0.7; > 0.9–1.0 indicates significant hypoperfusion and transfusion need, even with a 'normal' systolic pressure.")},
{t:L("Кислороден дълг","Oxygen debt"), re:"кислороден дълг[а-я]*|O₂-дълг[а-я]*|oxygen debt",
 d:L("Кумулативната разлика между нужната и реално консумираната O₂ по време на хипоперфузия (mL/kg). При кучета ≈ 100 mL/kg е преживяем, 120 mL/kg — LD50, ≥ 140 — фатален (Crowell & Smith 1964). Лактатът е неговият биохимичен белег.",
     "The cumulative difference between required and actually consumed O₂ during hypoperfusion (mL/kg). In dogs ≈ 100 mL/kg is survivable, 120 mL/kg the LD50 and ≥ 140 fatal (Crowell & Smith 1964). Lactate is its biochemical marker.")},
{t:L("Необратим шок","Irreversible shock"), re:"необратим[а-я]* шок[а-я]*|прогресивен шок[а-я]*",
 d:L("Фаза, в която положителните обратни връзки (потиснат миокард, отказ на вазомоторния център, ацидоза, капилярен теч, утаяване на кръвта, клетъчно увреждане) се самоподдържат и дори пълното възстановяване на обема дава само временно подобрение.",
     "A phase in which positive feedbacks (depressed myocardium, failing vasomotor centre, acidosis, capillary leak, sludging, cellular injury) are self-sustaining, so even full volume replacement gives only a temporary improvement.")},
{t:L("Дистрибутивен шок","Distributive shock"), re:"дистрибутивен шок[а-я]*|септичен шок[а-я]*|анафилактичен шок[а-я]*|неврогенен шок[а-я]*",
 d:L("Шок от патологична вазодилатация и разпределение на кръвта: септичен (NO, хипореактивност, теч; CO рано висок), анафилактичен (хистамин; минути), неврогенен (загуба на симпатиков тонус; без тахикардия). TPR е нисък.",
     "Shock from pathological vasodilation and maldistribution of blood: septic (NO, hyporesponsiveness, leak; CO high early), anaphylactic (histamine; minutes), neurogenic (loss of sympathetic tone; no tachycardia). TPR is low.")}
```

---

## 8. Бележки за имплементацията
- `cfg.key:"shock"`, `h2:L("Шок и кръвозагуба: интегрирана регулация","Shock and haemorrhage: integrated regulation")`,
  `lead:L("Криви на Гайтън (венозно връщане × Франк–Старлинг), барорефлекс, RAAS/ADH, транскапилярно пълнене и кислороден дълг. Времето се свива автоматично: секунди → минути → часове → дни. Опростено: една камера, един среден капиляр, кучешки праг на O₂-дълга.","Guyton curves (venous return × Frank–Starling), baroreflex, RAAS/ADH, transcapillary refill and oxygen debt. Time compresses automatically: seconds → minutes → hours → days. Simplified: one ventricle, one average capillary, the canine oxygen-debt threshold.")`
- `init:()=>shInit()`, `step(s,p,dt){…time-warp, подстъпки ≤ 0.02 min…}`, `calc:(p,s)=>s?shFlux(s,p):null` (върни и `HR,SVm,kS,MSFP,RVR` за графика 2).
- `ev:{w1:{l:"1 s = 1 s",f:s=>s.warp=1/60}, wm:{l:"1 s = 1 min",f:s=>s.warp=1}, w10:{l:"1 s = 10 min",f:s=>s.warp=10}, wh:{l:"1 s = 1 h",f:s=>s.warp=60}, wa:{l:L("Авто","Auto"),f:s=>s.warp=0}}`.
- Плъзгачите `cry/bld` действат като „общо количество за вливане“: увеличението спрямо вече вляното се влива със 100 mL/min; намаление не „изважда“ течност.
- Цветове: MAP `#c92a2a`, HR `#1c7ed6`, CO `#7048e8`, лактат `#d9480f`, Hct `#a61e4d`, обем/VR `#364fc7`, ADH `#ae3ec9`, ренин `#e64980`, сиво `#868e96`. Без зелено и жълто.
- Валидация преди пускане (node върху изнесените `shInit/shFlux/shStep`): таблицата в §1.6 и контролните проверки 1–7; `window.__shModel={shInit,shStep,shFlux,P_}`.

## 9. Източници
- Guyton & Hall, Textbook of Medical Physiology, 14th ed.: гл. 24 (шок: непрогресивен/прогресивен/необратим, положителни обратни връзки, експеримент с трансфузия), гл. 20 (MSFP 7 mmHg, RVR, ненапрегнат обем, криви на венозното връщане и сърдечния дебит), гл. 18 (барорефлекс, хеморецептори под 80 mmHg, CNS-исхемичен отговор под 60/50 mmHg), гл. 16 (Старлинг: Pc 17,3, Pif −3, πp 28, πif 8; Kf 6,67; лимфа).
- Crowell JW, Smith EE. Oxygen deficit and irreversible hemorrhagic shock. Am J Physiol 1964;206:313–316 (кучета: 100 mL/kg — нелетален, 120 — LD50, ≥ 140 — фатален).
- ATLS Student Course Manual, 10th ed. (ACS 2018), Table 3-1; числовите граници на HR/RR/урина — 9th ed.
- Singer M et al. Sepsis-3. JAMA 2016;315:801–810. Evans L et al. Surviving Sepsis Campaign 2021. Crit Care Med 2021;49:e1063.
- Landry DW et al. Vasopressin deficiency contributes to the vasodilation of septic shock. Circulation 1997;95:1122–1125.
- Levick JR, Michel CC. Microvascular fluid exchange and the revised Starling principle. Cardiovasc Res 2010;87:198–210 (doi:10.1093/cvr/cvq062) — устойчива абсорбция няма, преходна абсорбция след спад на Pc има.
- Fisher MM. Clinical observations on the pathophysiology and treatment of anaphylactic cardiovascular collapse. Anaesth Intensive Care 1986;14:17–21 (загуба до ≈ 35 % от интраваскуларния обем за 10 min) — *не е проверено в пълен текст, средна увереност*.
- Hahn RG. Volume kinetics for infusion fluids. Anesthesiology 2010;113:470–481 (разпределение на кристалоида) — *средна увереност за конкретните проценти*.
