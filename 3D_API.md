# 3D_API — кратък справочник (three.js r128, глобален `THREE`)

Местата във файловете са в PROJECT_MAP.md. Тук са само договорите. **Не чети index.html целия.**

## 1. Сцена и цикъл (index.html)
| Функция | Договор |
|---|---|
| `wrap3D(id,h=420)` | HTML низ: контейнер `#id` с „зареждане…“. Сложи го в `main.innerHTML`. |
| `mk3DView(sel,init,frame,opt)` | Зарежда three.js и пуска rAF. `init()` → ctx (веднъж); `frame(ctx,dt)` всеки кадър; пауза извън екрана. `opt.mc` = зарежда MarchingCubes, `opt.bg` = не спира извън екрана. Връща `stop` → `window.__cleanups.push(stop)`. |
| `make3D(wrap,{r,th,phi,target,min,max,fov,hq})` | `{T,scene,cam,ren,cv,flyTo(x,y,z,r,th,phi),render(labels),dispose()}`. Орбита с пръст/щипване. `render([[html,Vector3],…])` рисува HTML етикети. `hq:true` = ACES + 4 светлини. |
| `LOWGPU` | true на телефон/таблет → по-малко геометрия, pixel ratio ≤1,5 (iPad затваря страницата при тежки сцени). |
| `show3DError(wrap,err)` | Причина + „Опитай отново“ вместо черен прозорец. |
| `LIN(T,hex)` | sRGB → линеен `Color`. Ползвай го за всеки цвят в материал. |
| `easeIO(u)`, `lerp(a,b,u)` | Плавност 0..1. |

```js
main.innerHTML += wrap3D("w3x", 440);
const stop = mk3DView("#w3x", () => { const G = make3D($("#w3x"), {r:30, hq:true}); /* build */ return {G}; },
  (ctx, dt) => { /* update от state */ ctx.G.render([["K⁺ канал", new ctx.G.T.Vector3(0,2,0)]]); }, {mc:true});
(window.__cleanups = window.__cleanups || []).push(stop);
```

## 2. Модели: `MK` (index.html)
- `MK.mat(T,hex,o)` — гланцов MeshPhysical. `MK.molMat(T,o)` — материал за PDB повърхности (vertexColors).
- `MK.bilayer(T,{w,d,z0,sp,holes:[[x,z,r]],pal})` — липиден двоен слой (InstancedMesh). Липидите са корал.
- `MK.blob(T,[[x,y,z,r,hex?]],{res,color})` — белтък от метатопки (иска `opt.mc`).
- `MK.helix(T,p0,p1,{rad,pitch,tube,color})`, `MK.vgChan(T,{col,seed,…})` — волтаж-зависим канал (S4, врата, IFM).
- `MK.pool(T,hex,r,n)` → `im.put([{x,y,z,s}])` — частици. `MK.smoothPut(pool,targets,dt)` — плавно.
- `MK.mol(T,"atp|pi|glc|o2|ach|glu|gaba|camp|h2o")`, `MK.sign(T,"+",col)`, `MK.arrow(T,hex)` → `.setLen(L)`, `MK.along(pts,u)`, `MK.rnd(seed)`.
- **Истински структури:** `MK.loadMesh(T,"m/mol/<pdb>.txt"|"m/<орган>.txt")` → Promise<BufferGeometry>. `MK.realize(T,grp,urls,{keep,ghost})` вписва многочастна PDB структура на мястото на схемата. `MK.swapGeo(T,mesh,url)` сменя само геометрията, анимациите остават. `MK.cullLipids()` скрива липидите вътре в белтъка.
- `MK.real` е превключвателят „Реалистичен | Опростен“ (`fizsim_models`). В опростен режим `/mol/` не се зарежда — **и двата режима трябва да работят.**
- Нов PDB модел: `design/tools/pdbsurf.py` (env `SIG ISO TGT H FLIP BELT AXIS`). Формат на `.txt`: base64 `<II nv,nf><6f min,size>` + uint16 позиции + uint32 индекси (+uint8 RGB).

## 3. Етапи
**`stageViewer(parent,cfg,before)`** (общ). Сам рисува бутоните, диаграмата, текста, статистиките и 3D.
```js
cfg = { id:"stgX", title, intro, h:460, dur:4, cycle:false, cam:{r,th,phi,target}, foc:[[x,y,z,r,th?,phi?] /*за етап*/],
  legend:[["#f76707","Na⁺"],["#7950f2","K⁺ канал","box"]],
  stages:[{t:"Заглавие", short, badge, tag, d:"HTML обяснение", dm:1 /*множител на времето*/}],
  mechs:[{key,label,center,stages}] /*по избор: превключвател*/,
  build(G,T,ctx){}, update(ctx,i,u,dt,tAbs){}, labels(ctx,i,u)=>[[html,V3]], stats(ctx,i,u)=>[[k,v]] }
```
`i` = етап, `u` = 0..1 напредък в етапа. Регистрация: `STAGES[id]=cfg` (рутерът я слага сам) или `zAddStg(main,cfg)` от изгледа.

**`zCellStg({id,title,intro,legend,mechs:[…]})`** (sys2.js) — клетъчно ниво. Връща cfg за stageViewer.
```js
{key:"fasc", label, center, cam:[x,y,z,r,th,phi], foc:[[x,y,r,phi?]], stages:[…],
 spec:{ mem:[{y:8, holes:[[x,0,1.5]]}], nm:0.55 /*истински мащаб*/,
   it:[{k:"mc2r", kind:"gpcr|chan|enz|pump|ball|ves|er|mito|drop|nuc|…", col:0x4c6ef5, p:[x,y,z], s, r, pdb}],
   pools:{camp:[0xff8787, радиус, брой?, форма?, символ?]} },   // ключ от ZSH → форма и надпис
 upd(C,i,u,t,sg,R){ /* само рендерира: */ ZK.glow(C,"ac",0.6*a); R("camp",[[x,y],[x2,y2]],n,t*0.5,0.3);
   ZK.cloud(C,"acth",[x,y,0],n,r,t); ZK.dock(C,"acth",[x,y],on,t,1); return "Vm = −70 mV" /*по избор*/ },
 lab:(i,V)=>[["MC2R",V(-12,10)]], stats:[[["Рецептор","MC2R"]]] }
```
Помощници: `zO(i,u,k)` = 0 → 1, когато етап k започне, и остава 1 след него. `sg(a,b)` = плавно вътре в етапа.

Органи и тяло: `r3Attach(cv,h,cam,build,{views})` (3D на мястото на 2D платно, бутон 3D/Схема), `R3.std|phys|glass|glow`, `r3Body`, `r3Thorax`, `zTube`, `zMat`, `zMuscle`, `zSpindle`.

## 4. Цветова схема (задължително)
**Без зелено и без жълто** (и златисто, кремаво, open-color yellow `#f08c00`). Палитра `ZC` в sys2.js: red `#e03131`, blue `#1c7ed6`, gold=`#f76707` (оранжев), vio `#9c36b5`, org `#e8590c`, teal `#0c8599`, gray `#868e96`, pink `#c2566b`. `ZC.grn` е сиво `#495057`.

| Частица | Цвят | | Частица | Цвят |
|---|---|---|---|---|
| Na⁺ | `#f76707` оранжев | | H⁺ | `#e03131` |
| K⁺ | `#7950f2` виолетов (белтъци `#9c36b5`) | | O₂ | `#e03131` / `#ff6b6b` |
| Ca²⁺ | `#74c0fc` светлосин | | CO₂ | `#adb5bd` |
| Cl⁻ | `#4dabf7` | | H₂O | `#99e9f2` |
| ATP, cAMP | `#ff8787` | | ACh | `#4c6ef5` |
| HCO₃⁻ | `#1c7ed6` | | глюкоза | `#f06595` |
| мембрана | корал (липиди) | | Vm | `vcolor`: синьо-сиво (−90) → червено (+30) |

⚠ Ca²⁺ и Cl⁻ са с почти еднакъв син цвят. В една сцена различавай Cl⁻ по форма (`ZSH`: `an`) или по по-тъмен тон. `MK.mol("atp")` съдържа жълто (`0xfab005`) — да не се ползва без замяна.

## 5. Договор модел ↔ 3D
- Моделът (`js/sections/<id>.js`) държи състоянието: `window.__<id>S = {t, Vm, Na_i, flux…}` с мерни единици в коментар.
- 3D (`js/sections/<id>-3d.js`) **само чете** състоянието в `frame`/`upd`. Не смята физиология и не пише в него.
- Докато моделът не е готов, 3D ползва макет със същите имена и стойности от spec.json.
- Всеки цвят, позиция и скорост се изчислява от състоянието (скорост на частици ∝ поток, светене ∝ активност).
- Изчистване: `dispose` на геометрии и материали, `stop` в `window.__cleanups`, без заемане на памет във всеки кадър.
