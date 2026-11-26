# PROJECT_MAP — PhysioNova

> Генерирано автоматично от `node tools/gen-map.mjs --runtime …` на 2026-11-26. **Не редактирай на ръка** — пусни скрипта отново (`npm run map`).
> Номерата на редовете са към текущите файлове. Токените са груба оценка (UTF-8 байтове / 3,5).

## Обобщение

- Теми в SYLLABUS: **46**, готови: **46**, раздели: **12**
- Въпроси (TESTS, по браузъра): **469**; експерименти: **251**; термини в речника (GL): **476**; превод en.js: **17435** записа
- Проверка в браузъра: без грешки в конзолата при зареждане
- index.html: 1.6 MB, 7793 реда; код ≈ 1.4 MB (≈432.3k токена); останалото са шрифтове (редове 9–12) и base64 3D данни.

## Ред на зареждане

Всичко е класически `<script>` (не модули). `const`/`function` на най-горно ниво са общи за всички скриптове. Главният inline скрипт (ред 275) дефинира всичко и в края вика `route()`. **Всеки по-късен файл, който заменя `VIEWS.<id>`, сам вика `route()` отново** (вж. края на blood-renal.js, resp-renal-3d.js, blood-3d.js).

| # | Ред в index.html | Скрипт | Размер | Роля |
|---|---|---|---|---|
| 1 | 3 | inline |  | екран за зареждане |
| 2 | 6 | `js/dark.js` | 2 KB |  |
| 3 | 234 | inline |  | екран за зареждане |
| 4 | 240 | inline |  | екран за зареждане |
| 5 | 275 | inline |  | ЦЯЛОТО ЯДРО: SYLLABUS, библиотеки, теми I–V, TESTS, GL, BOOK, рутер |
| 6 | 7781 | `js/blood-renal.js` | 214 KB | раздели III и VI (2D модели, TESTS_*, EXP_*, речник) → Object.assign(VIEWS,…) |
| 7 | 7788 | `js/resp-renal-3d.js` | 67 KB | 3D за V и VI (R3, r3Attach) — обвива VIEWS.lungmech/gasx/respreg |
| 8 | 7789 | `js/blood-3d.js` | 107 KB | 3D за III — обвива VIEWS.hemost/hbcurve/bgroups |
| 9 | 7789 | `js/bpsim.js` | 34 KB | измерване на АН по Коротков |
| 10 | 7789 | `js/theory-cv.js` | 33 KB | допълнителна теория ССС (след sys2/figs2) |
| 11 | 7789 | `js/barostage.js` | 12 KB | поетапен барорефлекс в 3D |
| 12 | 7790 | `js/gutdata.js` | 1.1 MB | GLB данни за ГИТ (window.__HB.gutglb) |
| 13 | 7790 | `js/bladder.js` | 144 KB | GLB данни за пикочен мехур (window.__HB.blad) |
| 14 | 7791 | `js/sys2.js` | 673 KB | раздели VII–XII: Z (2D скелет), Z_BOOK/Z_TESTS/Z_EXP/Z_VIEWS/Z_GL → Object.assign |
| 15 | 7791 | `js/zorg.js` | 15 KB | анатомични икони за Z.org, __body, __leg |
| 16 | 7791 | `js/figs2.js` | 59 KB | заменя теоретичните фигури по aria-label |
| 17 | 7791 | `js/theory-rest.js` | 34 KB | допълнителна теория (останалите) |
| 18 | 7791 | `js/en.js` | 3.1 MB | речник BG→EN (window.__EN) |
| 19 | 7791 | `js/en_re.js` | 36 KB | регулярни изрази за английския речник |
| 20 | 7791 | `js/i18n.js` | 7 KB | превод на DOM и надписите в платната (T()) |
| 21 | 7791 | `js/config.js` | 293 B | публични настройки (НЕ се публикува в артефакта) |
| 22 | 7791 | `js/supabase.min.js` | 215 KB | Supabase клиент |
| 23 | 7791 | `js/sb.js` | 8 KB | профили/Supabase |
| 24 | 7791 | `js/native.js` | 5 KB | Capacitor (приложение) |
| 25 | 7791 | `js/shell.js` | 102 KB | обвивка: меню, начален екран, профил, admin, auth |
| 26 | 7791 | `js/legal.js` | 13 KB | поверителност и условия |
| 27 | 7791 | `js/atlas.js` | 122 KB | типография и SVG дефиниции |
| 28 | 7791 | `js/calm.js` | 4 KB |  |
| 29 | 7791 | `js/theme.js` | 25 KB |  |
| 30 | 7791 | `js/polish.js` | 31 KB |  |
| 31 | 7791 | `js/brutal.js` | 34 KB |  |
| 32 | 7791 | `js/chrome.js` | 36 KB |  |
| 33 | 7791 | `js/fullscreen.js` | 6 KB |  |
| 34 | 7791 | `js/fonttest.js` | 8 KB |  |
| 35 | 7791 | `js/intros.js` | 720 B | въведения (английски) |
| 36 | 7791 | `js/heartintro.js` | 32 KB |  |
| 37 | 7791 | `js/neurointro.js` | 55 KB |  |
| 38 | 7791 | `js/lungintro.js` | 41 KB |  |
| 39 | 7791 | `js/zreg.js` | 2 KB | zRegister — регистрация на тема от отделен файл |
| 40 | 7791 | `js/mod-menst.js` | 66 KB | модул: менструален цикъл |
| 41 | 7791 | `js/mod-adrenal.js` | 78 KB | модул: надбъбречна кора |
| 42 | 7791 | `js/mod-erythro.js` | 131 KB | модул: еритропоеза |
| 43 | 7791 | `js/mod-shock.js` | 101 KB | модул: шок |
| 44 | 7791 | `js/mobile.js` | 4 KB | телефони |
| 45 | 7791 | `js/glass.js` | 4 KB | стъклени бутони |
| 46 | 7791 | `js/sections/index.js` | 3 KB | ЗАРЕЖДАЧ: js/sections/*.js по списъка PHYS_SECTIONS, след всичко останало; zSection, SEC3D |

## Теми

Колони: **Изглед** = функцията, която рисува темата (последната регистрация печели; „обвивка“ = `VIEWS.id=function(m){стар(m); 3D…}`). **3D** = какво 3D ползва изгледът транзитивно (до 3 нива извиквания).

### I. Обща физиология и възбудими тъкани

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `ghk` | Мембранен потенциал на покой (Нернст, GHK) | `viewGHK` index.html:428–467 (5 KB, ≈1.4k)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_GHK` 4186–4251 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.* | 10 · index.html:5402–5412 | 4 · index.html:418–427 `EXP_GHK` | index.html:7288–7344 |
| `ap` | Акционен потенциал (Hodgkin–Huxley) | `viewAP` index.html:519–570 (6 KB, ≈1.7k)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_AP` 4257–4298 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 10 · index.html:5413–5423 | 6 · index.html:505–518 `EXP_AP` | index.html:7345–7412 |
| `neuron3d` | 3D неврон: провеждане и йонни канали | `viewNeuron3D` index.html:698–927 (28 KB, ≈8.1k)<br>+ обвивка js/sys2.js:2349 (+STG_FIBERS)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_NEU` 4368–4428<br>`STG_FIBERS` js/sys2.js:1248–1273 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes, GLB/вградени данни | 8 · index.html:5424–5432 | 4 · index.html:688–697 `EXP_N3D` | index.html:7413–7430 |
| `channels` | Йонни канали отблизо: врати и градиенти | `viewChannels` index.html:942–1149 (23 KB, ≈6.7k)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_CH` 4303–4364 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), MK.* | 10 · index.html:5433–5443 | 5 · index.html:930–941 `EXP_CH` | index.html:7431–7447 |
| `transport` | Мембранен транспорт: дифузия, преносители, помпи | `viewTransport` index.html:1234–1313 (12 KB, ≈3.5k)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_TR` 4431–4559 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.* | 9 · index.html:1223–1233 `TESTS_TR` | 4 · index.html:1217–1222 `EXP_TR` | index.html:7448–7466 |
| `nka` | Na⁺/K⁺-ATP-аза: фазите на помпата | `viewNKA` index.html:1353–1469 (23 KB, ≈6.7k)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_NKA` 4562–4723 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.* | 10 · index.html:5810–5820 `TESTS_NKA` | 9 · index.html:1343–1352 `EXP_NKA` | index.html:7467–7481 |
| `synapse` | Нервно-мускулен синапс | `viewSynapse` index.html:1489–1633 (21 KB, ≈6.2k)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_NMJ` 4726–4834 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 9 · index.html:1478–1488 `TESTS_SYN` | 4 · index.html:1472–1477 `EXP_SYN` | index.html:7482–7494 |
| `chemsyn` | Химичен синапс (ЦНС): EPSP, IPSP, сумация | `viewChemSyn` index.html:1937–2068 (20 KB, ≈5.9k)<br>+ обвивка js/sys2.js:2349 (+STG_IONMET)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_CS` 4837–4944<br>`STG_IONMET` js/sys2.js:1220–1244 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes, GLB/вградени данни | 9 · index.html:1926–1936 `TESTS_CS` | 5 · index.html:1919–1925 `EXP_CS` | index.html:7495–7512 |
| `elecsyn` | Електричен синапс (gap junction) | `viewElecSyn` index.html:2085–2128 (7 KB, ≈2.2k)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_ES` 4947–5014 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), MK.* | 6 · index.html:2077–2084 `TESTS_ES` | 4 · index.html:2071–2076 `EXP_ES` | index.html:7513–7527 |

### II. Мускули

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `skeletal` | Скелетен мускул: саркомер, тетанус, дължина–сила | `viewSkeletal` index.html:1655–1775 (20 KB, ≈5.9k)<br><sub>рег.: index.html:7716 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 10 · index.html:1643–1654 `TESTS_SK` | 5 · index.html:1636–1642 `EXP_SK` | index.html:7528–7544 |
| `xb` | Цикъл на напречните мостове: миозин, тропомиозин, ATP | `viewXB` index.html:2153–2282 (20 KB, ≈5.8k)<br><sub>рег.: index.html:7716 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, R3.*, MarchingCubes | 7 · index.html:2144–2152 `TESTS_XB` | 3 · index.html:2139–2143 `EXP_XB` | index.html:7545–7559 |
| `smooth` | Гладък мускул: калмодулин, MLCK, латч | `viewSmooth` index.html:1794–1916 (20 KB, ≈5.8k)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_SM` 5017–5174 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, R3.*, MarchingCubes | 8 · index.html:1784–1793 `TESTS_SM` | 4 · index.html:1778–1783 `EXP_SM` | index.html:7560–7579 |

### III. Кръв

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `hemost` | Хемостаза и коагулационна каскада | `viewHemost` js/blood-renal.js:61–147 (12 KB, ≈3.6k)<br>+ обвивка js/blood-3d.js:192<br><sub>рег.: js/blood-renal.js:952 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, r3Attach, MK.*, R3.*, MarchingCubes | 10 · js/blood-renal.js:886–896 `TESTS_HS` | 6 · js/blood-renal.js:53–59 `EXP_HS` | js/blood-renal.js:831–839 |
| `hbcurve` | Хемоглобин и кислородна дисоциационна крива | `viewHbCurve` js/blood-renal.js:184–266 (11 KB, ≈3.3k)<br>+ обвивка js/blood-3d.js:193<br><sub>рег.: js/blood-renal.js:952 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, r3Attach, MK.*, MarchingCubes | 9 · js/blood-renal.js:897–906 `TESTS_HB` | 6 · js/blood-renal.js:169–175 `EXP_HB` | js/blood-renal.js:840–848 |
| `bgroups` | Кръвни групи, хематологични показатели | `viewBloodGroups` js/blood-renal.js:291–397 (18 KB, ≈5.3k)<br>+ обвивка js/blood-3d.js:194<br><sub>рег.: js/blood-renal.js:952 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, r3Attach, MK.*, R3.*, MarchingCubes | 9 · js/blood-renal.js:907–916 `TESTS_BG` | 6 · js/blood-renal.js:284–290 `EXP_BG` | js/blood-renal.js:849–857 |
| `erythro` | Еритропоеза, желязо и анемии | модул `js/mod-erythro.js` (131 KB, ≈38.2k)<br>`view` 516–563<br><sub>рег.: zRegister js/mod-erythro.js:565</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.* | 14 · js/mod-erythro.js:423–437 | 5 · js/mod-erythro.js:438–443 | js/mod-erythro.js:358–420 |

### IV. Сърдечно-съдова система

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `heart3d` | Сърце: 3D модел и движение | `viewHeartSwitch` index.html:2449–2449 (107 B, ≈0.0k)<br><sub>рег.: index.html:7716 (map)</sub> | — | make3D, mk3DView, MarchingCubes, GLB/вградени данни | 11 · index.html:2313–2321 `TESTS_HA` | 8 · index.html:2307–2312 `EXP_HA.concat(EXP_HR)` | index.html:7113–7135 |
| `cardio` | Сърдечен цикъл и PV примка | `viewCardio` index.html:610–662 (7 KB, ≈2.0k)<br><sub>рег.: index.html:7716 (map)</sub> | — | THREE директно | 12 · index.html:5444–5456 | 6 · index.html:596–609 `EXP_CARDIO` | index.html:7136–7161 |
| `cardap` | Акционни потенциали на кардиомиоцити, автоматия | `viewCardiacAP` index.html:3012–3179 (24 KB, ≈6.9k)<br>+ обвивка js/sys2.js:2349 (+STG_MYOCH)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_MYOCH` js/sys2.js:1279–1308 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, R3.*, MarchingCubes, GLB/вградени данни | 12 · index.html:5667–5680 `TESTS_CAP` | 9 · index.html:3001–3011 `EXP_CAP` | index.html:7162–7183 |
| `ecg` | ЕКГ: 12 отвеждания, ритми и патологии | `viewECG` index.html:2837–2942 (16 KB, ≈4.6k)<br><sub>рег.: index.html:7716 (map)</sub> | — | make3D, mk3DView, MK.*, MarchingCubes, GLB/вградени данни | 12 · index.html:2823–2836 `TESTS_ECG` | 7 · index.html:2814–2822 `EXP_ECG` | index.html:7184–7208 |
| `hemo` | Хемодинамика: Поазьой, съпротивление, Guyton | `viewHemo` index.html:3299–3467 (28 KB, ≈8.1k)<br><sub>рег.: index.html:7716 (map)</sub> | — | make3D, mk3DView, MK.*, R3.*, MarchingCubes, GLB/вградени данни | 12 · index.html:5708–5721 `TESTS_HEMO` | 9 · index.html:3288–3298 `EXP_HEMO` | index.html:7209–7234 |
| `bp` | Измерване на кръвното налягане (Коротков) | `viewBP` js/bpsim.js:21–132 (19 KB, ≈5.4k)<br><sub>рег.: js/bpsim.js:157 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, R3.*, MarchingCubes | 8 · js/bpsim.js:139–147 `TESTS_BP` | 5 · js/bpsim.js:133–138 `EXP_BP` | js/bpsim.js:148–156 |
| `baro` | Барорефлекс и регулация на АН | `viewBaro` index.html:3530–3712 (30 KB, ≈8.9k)<br>+ обвивка js/barostage.js:32–67<br><sub>рег.: index.html:7716 (map)</sub> | — | make3D, mk3DView, MK.*, R3.*, MarchingCubes, GLB/вградени данни | 12 · index.html:5745–5758 `TESTS_BARO` | 8 · index.html:3520–3529 `EXP_BARO` | index.html:7235–7257 |
| `starling` | Микроциркулация — сили на Starling | `viewStarling` index.html:3748–3888 (26 KB, ≈7.5k)<br><sub>рег.: index.html:7716 (map)</sub> | `STG_STAR` 5177–5270 | stageViewer (етапи), make3D, mk3DView, MK.*, MarchingCubes | 12 · index.html:5779–5792 `TESTS_STAR` | 7 · index.html:3739–3747 `EXP_STAR` | index.html:7258–7285 |
| `shock` | Шок и кръвозагуба | модул `js/mod-shock.js` (101 KB, ≈29.5k)<br>`view` 350–435<br><sub>рег.: zRegister js/mod-shock.js:437</sub> | — | **няма 3D** | 14 · js/mod-shock.js:301–315 | 5 · js/mod-shock.js:316–321 | js/mod-shock.js:225–298 |

### V. Дишане

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `lungmech` | Механика на дишането: обеми, комплайънс, спирометрия | `viewLungMech` index.html:5965–6042 (14 KB, ≈4.1k)<br>+ обвивка js/resp-renal-3d.js:162–174<br><sub>рег.: index.html:7716 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, r3Attach, MK.*, R3.*, MarchingCubes, GLB/вградени данни | 11 · index.html:6530–6541 `TESTS_LM` | 6 · index.html:5958–5964 `EXP_LM` | index.html:7582–7617 |
| `gasx` | Газообмен, V/Q и транспорт на O₂ и CO₂ | `viewGasX` index.html:6315–6401 (15 KB, ≈4.3k)<br>+ обвивка js/resp-renal-3d.js:177–230<br><sub>рег.: index.html:7716 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, r3Attach, MK.*, R3.*, MarchingCubes | 14 · index.html:6542–6556 `TESTS_GX` | 7 · index.html:6307–6314 `EXP_GX` | index.html:7618–7651 |
| `respreg` | Регулация на дишането: център и хеморецептори | `viewRespReg` index.html:6430–6528 (17 KB, ≈4.9k)<br>+ обвивка js/resp-renal-3d.js:233–270<br><sub>рег.: index.html:7716 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, r3Attach, MK.*, R3.*, MarchingCubes, GLB/вградени данни | 11 · index.html:6557–6568 `TESTS_RR` | 6 · index.html:6423–6429 `EXP_RR` | index.html:7652–7678 |

### VI. Бъбреци и водно-електролитен баланс

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `gfr` | Гломерулна филтрация, клирънс | `viewGFR` js/blood-renal.js:448–530 (14 KB, ≈4.2k)<br>+ обвивка js/sys2.js:2349 (+STG_GFILT)<br><sub>рег.: js/blood-renal.js:952 (map)</sub> | `STG_GFILT` js/sys2.js:1312–1349 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, r3Attach, MK.*, R3.*, MarchingCubes, GLB/вградени данни | 10 · js/blood-renal.js:917–927 `TESTS_GFR` | 6 · js/blood-renal.js:441–447 `EXP_GFR` | js/blood-renal.js:858–866 |
| `tubule` | Тубулен транспорт, противотоков механизъм | `viewTubule` js/blood-renal.js:584–663 (12 KB, ≈3.4k)<br><sub>рег.: js/blood-renal.js:952 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, r3Attach, MK.*, R3.*, MarchingCubes, GLB/вградени данни | 10 · js/blood-renal.js:928–938 `TESTS_TUB` | 6 · js/blood-renal.js:577–583 `EXP_TUB` | js/blood-renal.js:867–874 |
| `volreg` | Регулация на обема и осмолалитета (ADH, РААС) | `viewVolReg` js/blood-renal.js:710–766 (10 KB, ≈2.9k)<br><sub>рег.: js/blood-renal.js:952 (map)</sub> | — | MK.loadMesh (PDB/органи от m/), make3D, mk3DView, r3Attach, MK.*, R3.*, MarchingCubes, GLB/вградени данни | 10 · js/blood-renal.js:939–949 `TESTS_VR` | 6 · js/blood-renal.js:703–709 `EXP_VR` | js/blood-renal.js:875–883 |

### VII. Киселинно-алкален баланс

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `acidbase` | Хендерсон–Хаселбалх, диаграма на Давенпорт | `viewAcidBase` js/sys2.js:1367–1400 (6 KB, ≈1.8k)<br><sub>рег.: js/sys2.js:1432 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 9 · js/sys2.js:1422–1431 | 6 · js/sys2.js:1360–1366 | js/sys2.js:1414–1421 |

### VIII. Храносмилане

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `gimot` | Моторика на храносмилателния тракт | `viewGiMot` js/sys2.js:1451–1493 (10 KB, ≈2.8k)<br><sub>рег.: js/sys2.js:1590 (Z_VIEWS)</sub> | `STG_GIMOT` js/sys2.js:124–149 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes, GLB/вградени данни | 8 · js/sys2.js:1571–1579 | 5 · js/sys2.js:1445–1450 | js/sys2.js:1555–1562 |
| `gisec` | Секреция и регулация: гастрин, секретин, CCK | `viewGiSec` js/sys2.js:1506–1540 (8 KB, ≈2.2k)<br><sub>рег.: js/sys2.js:1590 (Z_VIEWS)</sub> | `STG_GISEC` js/sys2.js:150–180 | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes, GLB/вградени данни | 9 · js/sys2.js:1580–1589 | 6 · js/sys2.js:1499–1505 | js/sys2.js:1563–1570 |

### IX. Обмяна на веществата и терморегулация

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `energy` | Енергиен баланс, основна обмяна | `viewEnergy` js/sys2.js:1619–1643 (7 KB, ≈2.0k)<br><sub>рег.: js/sys2.js:1735 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 8 · js/sys2.js:1716–1724 | 5 · js/sys2.js:1613–1618 | js/sys2.js:1700–1707 |
| `thermo` | Терморегулация | `viewThermo` js/sys2.js:1655–1689 (9 KB, ≈2.6k)<br><sub>рег.: js/sys2.js:1735 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 9 · js/sys2.js:1725–1734 | 6 · js/sys2.js:1648–1654 | js/sys2.js:1708–1715 |

### X. Ендокринна система

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `hpaxis` | Обратни връзки: хипоталамус–хипофиза–периферия | `viewHpAxis` js/sys2.js:1833–1857 (7 KB, ≈1.9k)<br><sub>рег.: js/sys2.js:1896 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 10 · js/sys2.js:1877–1887 | 4 · js/sys2.js:1828–1832 | js/sys2.js:1867–1876 |
| `glucose` | Глюкозна хомеостаза: инсулин и глюкагон | `viewGlucose` js/sys2.js:1758–1785 (7 KB, ≈2.1k)<br><sub>рег.: js/sys2.js:1824 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 10 · js/sys2.js:1805–1815 | 4 · js/sys2.js:1753–1757 | js/sys2.js:1795–1804 |
| `calcium` | Калциева хомеостаза: PTH, витамин D, калцитонин | `viewCalcium` js/sys2.js:1908–1933 (7 KB, ≈2.1k)<br><sub>рег.: js/sys2.js:1968 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 10 · js/sys2.js:1949–1959 | 4 · js/sys2.js:1903–1907 | js/sys2.js:1939–1948 |
| `adrenal` | Надбъбречна кора: кортизол и алдостерон | модул `js/mod-adrenal.js` (78 KB, ≈22.7k)<br>`view` 264–291<br><sub>рег.: zRegister js/mod-adrenal.js:302</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.* | 14 · js/mod-adrenal.js:194–208 | 5 · js/mod-adrenal.js:209–214 | js/mod-adrenal.js:180–191 |
| `menst` | Женска полова ос и менструален цикъл | модул `js/mod-menst.js` (66 KB, ≈19.4k)<br>`view` 228–253<br><sub>рег.: zRegister js/mod-menst.js:265</sub> | — | make3D, mk3DView, MK.* | 14 · js/mod-menst.js:99–113 | 5 · js/mod-menst.js:114–119 | js/mod-menst.js:84–95 |

### XI. Сензорни системи

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `receptor` | Рецепторен потенциал, кодиране | `viewReceptor` js/sys2.js:1978–2006 (7 KB, ≈1.9k)<br><sub>рег.: js/sys2.js:2039 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 8 · js/sys2.js:2023–2031 | 4 · js/sys2.js:1973–1977 | js/sys2.js:2014–2022 |
| `senses` | Зрение, слух, вестибуларен апарат | `viewSenses` js/sys2.js:2050–2083 (9 KB, ≈2.5k)<br><sub>рег.: js/sys2.js:2123 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 11 · js/sys2.js:2100–2111 | 4 · js/sys2.js:2045–2049 | js/sys2.js:2091–2099 |

### XII. ЦНС и вегетативна нервна система

| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |
|---|---|---|---|---|---|---|---|
| `reflex` | Рефлекси, мускулно вретено | `viewReflex` js/sys2.js:2134–2164 (8 KB, ≈2.2k)<br><sub>рег.: js/sys2.js:2200 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 10 · js/sys2.js:2181–2191 | 4 · js/sys2.js:2129–2133 | js/sys2.js:2171–2180 |
| `ans` | Вегетативна регулация на органите | `viewAns` js/sys2.js:2210–2237 (8 KB, ≈2.2k)<br><sub>рег.: js/sys2.js:2271 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 10 · js/sys2.js:2252–2262 | 4 · js/sys2.js:2205–2209 | js/sys2.js:2243–2251 |
| `eeg` | ЕЕГ, сън, висши функции | `viewEeg` js/sys2.js:2288–2309 (6 KB, ≈1.8k)<br><sub>рег.: js/sys2.js:2341 (Z_VIEWS)</sub> | в изгледа | stageViewer (етапи), MK.loadMesh (PDB/органи от m/), make3D, mk3DView, MK.*, MarchingCubes | 10 · js/sys2.js:2322–2332 | 4 · js/sys2.js:2283–2287 | js/sys2.js:2313–2321 |

### Помощни функции по тема (транзитивно извиквани, сума от размерите)

<details><summary>разгъни</summary>

- **ghk** (39 KB): `draw` js/mod-shock.js:128, `p` js/lungintro.js:294, `lerp` i:3896, `R` js/mod-adrenal.js:98, `t` js/theme.js:223, `dt` js/lungintro.js:165, `shFlux` js/mod-shock.js:19, `cl` js/sys2.js:110, `exp` js/mod-shock.js:316, `CO_h` js/mod-shock.js:40, `VR` js/mod-shock.js:41, `LP` js/mod-shock.js:14, `V` js/mod-erythro.js:94, `HCO3` js/mod-shock.js:22, `Ie` js/mod-shock.js:24, `HR` js/mod-shock.js:35, `CO` i:3261, `RAP` js/mod-shock.js:43, `PP` i:3847, `kS` js/mod-menst.js:208, `symT` js/mod-shock.js:54, `RenT` js/mod-shock.js:57, `ADHT` js/mod-shock.js:58, `AldT` js/mod-shock.js:59, `thirst` js/mod-shock.js:64 … (+84)
- **ap** (70 KB): `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `draw` js/mod-shock.js:128, `p` js/lungintro.js:294, `lerp` i:3896, `R` js/mod-adrenal.js:98, `t` js/theme.js:223, `dt` js/lungintro.js:165, `shFlux` js/mod-shock.js:19, `cl` js/sys2.js:110, `exp` js/mod-shock.js:316, `CO_h` js/mod-shock.js:40, `VR` js/mod-shock.js:41, `LP` js/mod-shock.js:14, `V` js/mod-erythro.js:94, `HCO3` js/mod-shock.js:22, `Ie` js/mod-shock.js:24, `HR` js/mod-shock.js:35, `CO` i:3261, `RAP` js/mod-shock.js:43, `PP` i:3847, `kS` js/mod-menst.js:208, `symT` js/mod-shock.js:54, `RenT` js/mod-shock.js:57, `ADHT` js/mod-shock.js:58 … (+110)
- **neuron3d** (216 KB): `makeCable` i:667, `N` js/figs2.js:25, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `settleCable` i:686, `stepCable` i:675, `I` js/shell.js:6, `V` js/mod-erythro.js:94, `m` js/mod-menst.js:163, `h` js/mod-adrenal.js:18, `n` js/mod-erythro.js:55, `vtrap` i:482, `exp` js/mod-shock.js:316, `setMyelin` i:891, `rebuild` i:740, `apply` js/fonttest.js:31, `on` js/fonttest.js:26, `B` js/sys2.js:1859, `y` js/heartintro.js:196, `w` js/mod-menst.js:63, `l` i:1158, `box` js/lungintro.js:191 … (+195)
- **channels** (48 KB): `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `vtrap` i:482, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `stepM` i:977, `rates` i:487, `E` js/shell.js:310, `f` js/lungintro.js:128, `m` js/mod-menst.js:163, `settle` i:982, `apply` js/fonttest.js:31, `on` js/fonttest.js:26, `B` js/sys2.js:1859, `y` js/heartintro.js:196, `w` js/mod-menst.js:63, `l` i:1158, `box` js/lungintro.js:191, `c` js/mod-erythro.js:211, `t` js/theme.js:223 … (+121)
- **transport** (94 KB): `controls` i:1247, `reset` js/blood-renal.js:724, `vrInit` js/blood-renal.js:664, `opts` js/blood-renal.js:723, `get` i:4, `vrStep` js/blood-renal.js:679, `o` js/shell.js:391, `vrDer` js/blood-renal.js:665, `vrKid` js/blood-renal.js:673, `vrBase` js/blood-renal.js:678, `tg` js/resp-renal-3d.js:332, `r` js/heartintro.js:186, `info` js/blood-renal.js:725, `setMode` js/neurointro.js:125, `toggle` js/fullscreen.js:39, `exit` js/fullscreen.js:36, `fsEl` js/fullscreen.js:27, `setIcons` js/fullscreen.js:29, `resize` js/fullscreen.js:28, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `now` i:763, `tick` js/barostage.js:64, `finish` js/lungintro.js:145, `J` i:1271 … (+87)
- **nka** (57 KB): `kDraw` i:1400, `kc0` i:1381, `get` i:4, `nkaSS` i:1319, `exp` js/mod-shock.js:316, `f` js/lungintro.js:128, `b` js/lungintro.js:125, `nkaInh` i:1326, `drawCycle` i:1385, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `F` js/mod-shock.js:92, `x` js/mod-erythro.js:192, `y` js/heartintro.js:196, `rr` js/mod-erythro.js:253, `cx` i:3876, `statsHTML` i:1214, `d` js/mod-shock.js:121, `push` js/lungintro.js:148, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `vEff` i:1382, `c` js/mod-erythro.js:211, `dS` i:3697, `K05` i:1383 … (+75)
- **synapse** (45 KB): `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `qc` i:1511, `g` js/sys2.js:304, `stepM` i:977, `rates` i:487, `vtrap` i:482, `exp` js/mod-shock.js:316, `E` js/shell.js:310, `f` js/lungintro.js:128, `m` js/mod-menst.js:163, `push` js/lungintro.js:148, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `now` i:763, `tick` js/barostage.js:64, `finish` js/lungintro.js:145 … (+117)
- **chemsyn** (185 KB): `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `toggle` js/fullscreen.js:39, `exit` js/fullscreen.js:36, `fsEl` js/fullscreen.js:27, `setIcons` js/fullscreen.js:29, `resize` js/fullscreen.js:28, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `now` i:763, `tick` js/barostage.js:64, `finish` js/lungintro.js:145, `tgUpd` i:1952, `stepM` i:977, `rates` i:487, `vtrap` i:482, `exp` js/mod-shock.js:316, `E` js/shell.js:310, `f` js/lungintro.js:128, `m` js/mod-menst.js:163, `get` i:4, `send` i:1022 … (+188)
- **elecsyn** (30 KB): `toggle` js/fullscreen.js:39, `exit` js/fullscreen.js:36, `fsEl` js/fullscreen.js:27, `setIcons` js/fullscreen.js:29, `resize` js/fullscreen.js:28, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `now` i:763, `tick` js/barostage.js:64, `finish` js/lungintro.js:145, `mk` js/blood-3d.js:177, `R` js/mod-adrenal.js:98, `V3` js/resp-renal-3d.js:115, `y` js/heartintro.js:196, `dt` js/lungintro.js:165, `vtrap` i:482, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `stepM` i:977, `rates` i:487 … (+62)
- **skeletal** (41 KB): `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `opts` js/blood-renal.js:723, `an` js/blood-renal.js:317, `ex` js/mod-shock.js:89, `L` js/sys2.js:1545, `apply` js/fonttest.js:31, `on` js/fonttest.js:26, `B` js/sys2.js:1859, `y` js/heartintro.js:196, `l` i:1158, `box` js/lungintro.js:191, `c` js/mod-erythro.js:211, `t` js/theme.js:223, `th` js/figs2.js:195, `P` js/mod-menst.js:83, `cx` i:3876, `mix` js/figs2.js:5, `ln` i:6638, `prot` js/mod-erythro.js:290 … (+101)
- **xb** (44 KB): `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `toggle` js/fullscreen.js:39, `exit` js/fullscreen.js:36, `fsEl` js/fullscreen.js:27, `setIcons` js/fullscreen.js:29, `resize` js/fullscreen.js:28, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `now` i:763, `tick` js/barostage.js:64, `finish` js/lungintro.js:145, `setB` js/barostage.js:58, `q` js/lungintro.js:114, `canAdvance` i:2164, `advance` js/neurointro.js:149, `experiments` i:395, `list` js/sections/index.js:37, `key` js/resp-renal-3d.js:380, `apply` js/fonttest.js:31, `on` js/fonttest.js:26, `B` js/sys2.js:1859 … (+99)
- **smooth** (49 KB): `M` js/lungintro.js:265, `tissue` js/lungintro.js:257, `rc` js/mod-erythro.js:228, `c2` i:3442, `sp` js/i18n.js:29, `mix` js/figs2.js:5, `step` js/bpsim.js:117, `dot` i:6363, `exp` js/mod-shock.js:316, `Mp` js/blood-renal.js:534, `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `setP` i:1806, `experiments` i:395, `list` js/sections/index.js:37, `key` js/resp-renal-3d.js:380, `apply` js/fonttest.js:31, `on` js/fonttest.js:26, `B` js/sys2.js:1859, `th` js/figs2.js:195, `span` js/neurointro.js:374, `a` js/neurointro.js:115 … (+114)
- **hemost** (160 KB): `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `o` js/shell.js:391, `add` js/sys2.js:93, `mat` js/mod-erythro.js:99, `h` js/mod-adrenal.js:18, `copy` js/shell.js:436, `tt` js/shell.js:312, `select` i:2340, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `lab` js/mod-erythro.js:162, `T_` js/mod-shock.js:10, `x` js/mod-erythro.js:192, `L` js/sys2.js:1545, `V` js/mod-erythro.js:94, `y` js/heartintro.js:196, `chk` js/blood-renal.js:85, `HS_N` js/blood-renal.js:1, `hid` js/blood-renal.js:87, `get` i:4, `send` i:1022, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `hsInit` js/blood-renal.js:2 … (+235)
- **hbcurve** (139 KB): `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `toggle` js/fullscreen.js:39, `exit` js/fullscreen.js:36, `fsEl` js/fullscreen.js:27, `setIcons` js/fullscreen.js:29, `resize` js/fullscreen.js:28, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `now` i:763, `tick` js/barostage.js:64, `finish` js/lungintro.js:145, `setTy` js/blood-renal.js:204, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `ty` i:1732, `typ` i:1670, `setPre` js/sys2.js:28, `P` js/mod-menst.js:83, `L` js/sys2.js:1545, `f` js/lungintro.js:128, `flow` js/lungintro.js:115 … (+173)
- **bgroups** (144 KB): `x` js/mod-erythro.js:192, `hash` js/mod-erythro.js:96, `opt` js/blood-renal.js:310, `now` i:763, `bgAnt` js/blood-renal.js:269, `bgAbs` js/blood-renal.js:270, `push` js/lungintro.js:148, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `tick` js/barostage.js:64, `finish` js/lungintro.js:145, `l` i:1158, `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `pos` js/blood-renal.js:124, `cells` js/blood-3d.js:67, `G` js/blood-renal.js:794, `B` js/sys2.js:1859, `y` js/heartintro.js:196, `rnd` js/lungintro.js:179, `w` js/mod-menst.js:63, `box` js/lungintro.js:191, `h` js/mod-adrenal.js:18, `p` js/lungintro.js:294, `c` js/mod-erythro.js:211 … (+183)
- **erythro** (351 KB): `d` js/mod-shock.js:121, `x` js/mod-erythro.js:192, `hash` js/mod-erythro.js:96, `a` js/neurointro.js:115, `L` js/sys2.js:1545, `erInit` js/mod-erythro.js:15, `erFlux` js/mod-erythro.js:16, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `opts` js/blood-renal.js:723, `an` js/blood-renal.js:317, `ex` js/mod-shock.js:89, `cl` js/sys2.js:110, `PaO2` i:6282, `gxPofC` i:6275, `q` js/lungintro.js:114, `gxC` i:6274, `HbM` js/mod-erythro.js:18, `ERFE` js/mod-erythro.js:21, `fFP` js/mod-erythro.js:22, `fE` js/mod-erythro.js:23, `Rec` js/mod-erythro.js:27, `erStep` js/mod-erythro.js:30, `p` js/lungintro.js:294, `lerp` i:3896 … (+338)
- **heart3d** (83 KB): `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `viewHeartReal` i:2458, `heartModelBar` i:2450, `wrap3D` i:1208, `id` js/lungintro.js:181, `h` js/mod-adrenal.js:18, `bindHeartBar` i:2451, `runHeart` i:574, `elastanceShape` i:573, `exp` js/mod-shock.js:316, `push` js/lungintro.js:148, `EDV` i:591, `toggle` js/fullscreen.js:39, `exit` js/fullscreen.js:36, `enter` js/lungintro.js:143, `setAv` i:2474, `experiments` i:395, `list` js/sections/index.js:37, `key` js/resp-renal-3d.js:380, `apply` js/fonttest.js:31, `add` js/sys2.js:93 … (+95)
- **cardio** (39 KB): `draw` js/mod-shock.js:128, `p` js/lungintro.js:294, `lerp` i:3896, `R` js/mod-adrenal.js:98, `t` js/theme.js:223, `dt` js/lungintro.js:165, `shFlux` js/mod-shock.js:19, `cl` js/sys2.js:110, `exp` js/mod-shock.js:316, `CO_h` js/mod-shock.js:40, `VR` js/mod-shock.js:41, `LP` js/mod-shock.js:14, `V` js/mod-erythro.js:94, `HCO3` js/mod-shock.js:22, `Ie` js/mod-shock.js:24, `HR` js/mod-shock.js:35, `CO` i:3261, `RAP` js/mod-shock.js:43, `PP` i:3847, `kS` js/mod-menst.js:208, `symT` js/mod-shock.js:54, `RenT` js/mod-shock.js:57, `ADHT` js/mod-shock.js:58, `AldT` js/mod-shock.js:59, `thirst` js/mod-shock.js:64 … (+87)
- **cardap** (229 KB): `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `v` js/lungintro.js:319, `upd` js/sys2.js:26, `P` js/mod-menst.js:83, `L` js/sys2.js:1545, `s` js/sections/index.js:42, `stats` js/chrome.js:279, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `a` js/neurointro.js:115, `sym` i:3045, `vag` i:3647, `addNerve` i:3640, `pts` js/neurointro.js:246, `c` js/mod-erythro.js:211, `tube` js/figs2.js:22 … (+255)
- **ecg** (80 KB): `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `EcgEngine` i:2741, `push` js/lungintro.js:148, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `t` js/theme.js:223, `rr` js/mod-erythro.js:253, `hash` js/mod-erythro.js:96, `v` js/lungintro.js:319, `enoise` i:2740, `ehash` i:2739, `add` js/sys2.js:93, `mat` js/mod-erythro.js:99, `copy` js/shell.js:436 … (+148)
- **hemo** (74 KB): `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `pUpd` i:3331, `poiseuille` i:3254, `hemoEta` i:3253, `v` js/lungintro.js:319, `get` i:4, `send` i:1022, `statsHTML` i:1214, `drawQR` i:3336, `r` js/heartintro.js:186, `push` js/lungintro.js:148, `plot` i:353, `ymax` i:3337, `xs` js/blood-renal.js:255, `gUpd` i:3357, `guytonCurves` i:3259, `Pms` i:3358, `VR` js/mod-shock.js:41, `CO` i:3261, `tprF` i:3355, `reduce` js/shell.js:301 … (+127)
- **bp** (118 KB): `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `s` js/sections/index.js:42, `upd` js/sys2.js:26, `P` js/mod-menst.js:83, `L` js/sys2.js:1545, `stats` js/chrome.js:279, `setPre` js/sys2.js:28, `f` js/lungintro.js:128, `flow` js/lungintro.js:115, `start` js/neurointro.js:372, `sub` js/blood-renal.js:210, `stop` js/mod-erythro.js:92, `mk3DView` i:1199, `frame` js/lungintro.js:321, `now` i:763, `dispose` i:924, `loadThree` i:665, `loadMC` i:3894, `show3DError` i:1157, `loop` js/mod-shock.js:144, `make3D` i:1161, `cv` js/lungintro.js:186, `add` js/sys2.js:93, `get` i:4 … (+180)
- **baro** (81 KB): `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `Baro0` i:3476, `baroStep` i:3479, `BARO_CO` i:3475, `push` js/lungintro.js:148, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `setTog` i:3549, `toggle` js/fullscreen.js:39, `exit` js/fullscreen.js:36, `info` js/blood-renal.js:725, `t` js/theme.js:223, `reset` js/blood-renal.js:724, `vrInit` js/blood-renal.js:664, `opts` js/blood-renal.js:723, `get` i:4, `vrStep` js/blood-renal.js:679, `o` js/shell.js:391, `vrDer` js/blood-renal.js:665 … (+163)
- **starling** (62 KB): `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `L` js/sys2.js:1545, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `F` js/mod-shock.js:92, `shFlux` js/mod-shock.js:19, `exp` js/mod-shock.js:316, `CO_h` js/mod-shock.js:40, `VR` js/mod-shock.js:41, `LP` js/mod-shock.js:14, `V` js/mod-erythro.js:94, `HCO3` js/mod-shock.js:22, `Ie` js/mod-shock.js:24, `HR` js/mod-shock.js:35, `CO` i:3261, `RAP` js/mod-shock.js:43 … (+166)
- **shock** (201 KB): `x` js/mod-erythro.js:192, `hash` js/mod-erythro.js:96, `a` js/neurointro.js:115, `L` js/sys2.js:1545, `shInit` js/mod-shock.js:17, `shFlux` js/mod-shock.js:19, `cl` js/sys2.js:110, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `opts` js/blood-renal.js:723, `an` js/blood-renal.js:317, `ex` js/mod-shock.js:89, `CO_h` js/mod-shock.js:40, `VR` js/mod-shock.js:41, `LP` js/mod-shock.js:14, `V` js/mod-erythro.js:94, `y` js/heartintro.js:196, `rnd` js/lungintro.js:179, `HCO3` js/mod-shock.js:22, `Ie` js/mod-shock.js:24, `HR` js/mod-shock.js:35, `CO` i:3261, `RAP` js/mod-shock.js:43, `PP` i:3847, `kS` js/mod-menst.js:208 … (+229)
- **lungmech** (215 KB): `wrap3D` i:1208, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `lmDerive` i:5953, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `c` js/mod-erythro.js:211, `par` js/blood-renal.js:88, `HS_N` js/blood-renal.js:1, `hid` js/blood-renal.js:87, `get` i:4, `send` i:1022, `statsSp` i:6020, `statsHTML` i:1214, `drawFV` i:6018, `push` js/lungintro.js:148, `plot` i:353, `xs` js/blood-renal.js:255, `spReset` i:6002, `setPre` js/sys2.js:28, `P` js/mod-menst.js:83 … (+260)
- **gasx** (167 KB): `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `recalc` i:6348, `q` js/lungintro.js:114, `gxSolve` i:6277, `gxP50` i:6272, `exp` js/mod-shock.js:316, `Ca` js/blood-renal.js:260, `gxS` i:6273, `push` js/lungintro.js:148, `gxC` i:6274, `gxPofC` i:6275, `PACO2` i:6278, `PaO2` i:6282, `prof` js/blood-renal.js:402, `tt` js/shell.js:312, `CO` i:3261, `R` js/mod-adrenal.js:98, `Q` js/mod-shock.js:300, `opts` js/blood-renal.js:723, `an` js/blood-renal.js:317, `ex` js/mod-shock.js:89, `L` js/sys2.js:1545, `statsHTML` i:1214, `plot` i:353 … (+200)
- **respreg** (204 KB): `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `id` js/lungintro.js:181, `w` js/mod-menst.js:63, `lab` js/mod-erythro.js:162, `T_` js/mod-shock.js:10, `x` js/mod-erythro.js:192, `L` js/sys2.js:1545, `V` js/mod-erythro.js:94, `y` js/heartintro.js:196, `chk` js/blood-renal.js:85, `get` i:4, `send` i:1022, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `model` i:6462, `par` js/blood-renal.js:88, `HS_N` js/blood-renal.js:1, `hid` js/blood-renal.js:87, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `drives` i:6457, `P` js/mod-menst.js:83, `cen` js/heartintro.js:249, `hyp` js/mod-erythro.js:200 … (+304)
- **gfr** (255 KB): `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `upd` js/sys2.js:26, `P` js/mod-menst.js:83, `L` js/sys2.js:1545, `s` js/sections/index.js:42, `stats` js/chrome.js:279, `piLP` js/blood-renal.js:399, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `gfrSolve` js/blood-renal.js:406, `gfrCore` js/blood-renal.js:400, `prot` js/mod-erythro.js:290, `pb` i:4015, `kf` js/bpsim.js:60, `push` js/lungintro.js:148, `G` js/blood-renal.js:794, `prof` js/blood-renal.js:402, `p` js/lungintro.js:294, `lerp` i:3896, `par` js/blood-renal.js:88, `HS_N` js/blood-renal.js:1 … (+310)
- **tubule** (155 KB): `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `upd` js/sys2.js:26, `P` js/mod-menst.js:83, `L` js/sys2.js:1545, `s` js/sections/index.js:42, `stats` js/chrome.js:279, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `tubCalc` js/blood-renal.js:532, `vr` js/mod-shock.js:425, `push` js/lungintro.js:148, `xs` js/blood-renal.js:255, `load` js/lungintro.js:16, `res` js/sections/index.js:40, `now` i:763, `w` js/mod-menst.js:63, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `Mp` js/blood-renal.js:534, `U` js/mod-adrenal.js:104, `Sx` js/blood-renal.js:216 … (+235)
- **volreg** (156 KB): `k` js/mod-adrenal.js:164, `cl` js/sys2.js:110, `vrBase` js/blood-renal.js:678, `vrInit` js/blood-renal.js:664, `vrDer` js/blood-renal.js:665, `exp` js/mod-shock.js:316, `Na` i:4241, `ADHt` js/blood-renal.js:667, `rent` js/blood-renal.js:669, `aldt` js/blood-renal.js:670, `anpt` js/blood-renal.js:671, `vrKid` js/blood-renal.js:673, `o` js/shell.js:391, `tubCalc` js/blood-renal.js:532, `UNa` js/blood-renal.js:539, `U` js/mod-adrenal.js:104, `V` js/mod-erythro.js:94, `Sx` js/blood-renal.js:216, `get` i:4, `send` i:1022, `x` js/mod-erythro.js:192, `dir` js/resp-renal-3d.js:80, `rnd` js/lungintro.js:179, `opts` js/blood-renal.js:723, `vrStep` js/blood-renal.js:679 … (+238)
- **acidbase** (146 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+85)
- **gimot** (182 KB): `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `L` js/sys2.js:1545, `curves` i:6519, `tone` js/heartintro.js:112, `I` js/shell.js:6, `h` js/mod-adrenal.js:18, `leak` js/mod-shock.js:28, `mg` js/sys2.js:2153, `exp` js/mod-shock.js:316, `shInit` js/mod-shock.js:17, `step` js/bpsim.js:117, `p` js/lungintro.js:294, `W` js/mod-shock.js:118, `shStep` js/mod-shock.js:88, `tInf` js/mod-shock.js:123, `parse` i:2348, `s` js/sections/index.js:42, `shFlux` js/mod-shock.js:19, `R` js/mod-adrenal.js:98, `fmtT` js/mod-shock.js:120, `wLab` js/mod-shock.js:122, `T_` js/mod-shock.js:10, `X` js/blood-renal.js:785, `cl` js/sys2.js:110 … (+147)
- **gisec** (196 KB): `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `L` js/sys2.js:1545, `curves` i:6519, `tone` js/heartintro.js:112, `I` js/shell.js:6, `h` js/mod-adrenal.js:18, `leak` js/mod-shock.js:28, `mg` js/sys2.js:2153, `exp` js/mod-shock.js:316, `shInit` js/mod-shock.js:17, `step` js/bpsim.js:117, `p` js/lungintro.js:294, `W` js/mod-shock.js:118, `shStep` js/mod-shock.js:88, `tInf` js/mod-shock.js:123, `parse` i:2348, `s` js/sections/index.js:42, `shFlux` js/mod-shock.js:19, `R` js/mod-adrenal.js:98, `fmtT` js/mod-shock.js:120, `wLab` js/mod-shock.js:122, `T_` js/mod-shock.js:10, `X` js/blood-renal.js:785, `cl` js/sys2.js:110 … (+151)
- **energy** (166 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+83)
- **thermo** (157 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+95)
- **hpaxis** (151 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+78)
- **glucose** (153 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+81)
- **calcium** (152 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+85)
- **adrenal** (307 KB): `h` js/mod-adrenal.js:18, `hr` js/mod-adrenal.js:14, `x` js/mod-erythro.js:192, `hash` js/mod-erythro.js:96, `a` js/neurointro.js:115, `adInit` js/mod-adrenal.js:15, `adFlux` js/mod-adrenal.js:17, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `opts` js/blood-renal.js:723, `an` js/blood-renal.js:317, `ex` js/mod-shock.js:89, `L` js/sys2.js:1545, `AE` js/mod-adrenal.js:16, `cl` js/sys2.js:110, `circ` js/figs2.js:6, `y` js/heartintro.js:196, `rnd` js/lungintro.js:179, `r` js/heartintro.js:186, `f` js/lungintro.js:128, `flow` js/lungintro.js:115, `s` js/sections/index.js:42, `Ae` js/mod-adrenal.js:25, `AldT` js/mod-shock.js:59, `VolT` js/mod-adrenal.js:30 … (+303)
- **menst** (238 KB): `LH` js/mod-menst.js:25, `cl` js/sys2.js:110, `x` js/mod-erythro.js:192, `hash` js/mod-erythro.js:96, `a` js/neurointro.js:115, `msInit` js/mod-menst.js:14, `msHorm` js/mod-menst.js:15, `exp` js/mod-shock.js:316, `Q` js/mod-shock.js:300, `opts` js/blood-renal.js:723, `an` js/blood-renal.js:317, `ex` js/mod-shock.js:89, `L` js/sys2.js:1545, `surge` js/mod-menst.js:17, `msStep` js/mod-menst.js:27, `p` js/lungintro.js:294, `lerp` i:3896, `b` js/lungintro.js:125, `push` js/lungintro.js:148, `enter` js/lungintro.js:143, `setC` js/lungintro.js:142, `now` i:763, `tick` js/barostage.js:64, `finish` js/lungintro.js:145, `draw` js/mod-shock.js:128 … (+230)
- **receptor** (143 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+69)
- **senses** (145 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+73)
- **reflex** (148 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+80)
- **ans** (142 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+70)
- **eeg** (146 KB): `zAddStg` js/sys2.js:441, `stageViewer` i:3956, `cfg` js/mod-shock.js:352, `l` i:1158, `c` js/mod-erythro.js:211, `wrap3D` i:1208, `leg` i:3959, `k` js/mod-adrenal.js:164, `q` js/lungintro.js:114, `toggle` js/fullscreen.js:39, `go` js/barostage.js:54, `setB` js/barostage.js:58, `setMech` i:3970, `showTxt` i:3980, `lockMinH` i:1210, `drawDia` i:3981, `i` i:779, `W` js/mod-shock.js:118, `R` js/mod-adrenal.js:98, `push` js/lungintro.js:148, `y` js/heartintro.js:196, `x` js/mod-erythro.js:192, `lx` i:3799, `cx` i:3876, `mix` js/figs2.js:5 … (+66)

</details>

### Теми без 3D (кандидати за надграждане)

- `cardio` — Сърдечен цикъл и PV примка
- `shock` — Шок и кръвозагуба

## Общи библиотеки

| Име | Файл:редове | Размер | Какво прави |
|---|---|---|---|
| `loadThree` | index.html:665 | 316 B | зарежда three.js r128 от cdnjs (Promise) |
| `loadMC` | index.html:3894 | 261 B | зарежда THREE.MarchingCubes (за MK.blob) |
| `make3D` | index.html:1161–1190 | 4 KB | сцена+камера+рендерер, орбита с пръст/щипване, етикети в HTML, flyTo |
| `mk3DView` | index.html:1199–1207 | 2 KB | цикъл rAF с пауза извън екрана и cleanup |
| `wrap3D` | index.html:1208 | 674 B | HTML контейнер за 3D сцена със зареждащ индикатор |
| `vcolor` | index.html:1154–1155 | 311 B | цветова скала за мембранен потенциал (−90…+30 mV) |
| `LIN` | index.html:1191 | 47 B | hex → линеен THREE.Color |
| `stripeTex` | index.html:1192–1193 | 513 B | раирана CanvasTexture |
| `lipidSlab` | index.html:1194–1198 | 761 B | опростена мембрана (InstancedMesh) |
| `MK` | index.html:3897–3951 | 8 KB | библиотека за молекулни модели: mat, bilayer, blob, helix, pool, mol, sign, arrow, along, rnd |
| `easeIO` | index.html:3895 | 44 B | плавна крива 0..1 |
| `lerp` | index.html:3896 | 23 B | линейна интерполация |
| `SVI` | index.html:3953–3955 | 868 B | SVG икони на бутоните |
| `stageViewer` | index.html:3956–4009 | 9 KB | общ визуализатор на ЕТАПИ (бутони, кръгова/списъчна диаграма, текст, статистики, 3D) |
| `STAGES` | index.html:5272 | 170 B | карта тема → STG_* конфигурация |
| `r3Attach` | js/resp-renal-3d.js:4–15 | 2 KB | слага 3D сцена на мястото на 2D платно (бутон 3D/Схема) |
| `R3` | js/resp-renal-3d.js:16–45 | 4 KB | материали и анатомични модели за раздели V–VI (std, phys, glass, glow, …) |
| `r3Body` | js/resp-renal-3d.js:120–126 | 906 B | силует на тяло (3D) |
| `r3Thorax` | js/resp-renal-3d.js:128–159 | 4 KB | гръден кош (3D) |
| `Z` | js/sys2.js:2–10 | 2 KB | 2D скелет за раздели VII–XII (Z.T, Z.box, Z.org …) |
| `slider` | index.html:383–392 | 547 B | плъзгач с етикет и единица |
| `statsHTML` | index.html:1214 | 145 B | плочки със стойности |
| `lockMinH` | index.html:1210–1211 | 433 B | фиксира височина на сменящ се текст |
| `ratchetH` | index.html:1213 | 394 B | блоковете със стойности само растат |
| `TESTS` | index.html:5401–5457 | 24 KB | въпроси по тема (основен обект) |
| `MOD_NAMES` | index.html:5458 | 233 B | имена на модулите |
| `EXP_OF` | index.html:5459 | 376 B | карта тема → експерименти |
| `expLists` | index.html:5896 | 356 B | същото за напредъка |
| `testCard` | index.html:5460–5461 | 267 B | рисува теста на темата |
| `experiments` | index.html:395–410 | 829 B | рисува списък с въпроси/експерименти |
| `GL` | index.html:5276–5339 | 29 KB | речник: {t, re, d} |
| `GL_ORDER` | index.html:5341 | 77 B | речник, подреден за подчертаване |
| `linkTerms` | index.html:5343–5356 | 928 B | подчертава термините от речника в DOM |
| `BOOK` | index.html:7112–7286 | 55 KB | теория по тема: {title, adv, lead, secs[], key[]} |
| `BF` | index.html:6633–6778 | 20 KB | SVG помощници за фигурите в теорията |
| `renderBook` | index.html:7681–7698 | 3 KB | урок с табове Теория/Симулация/Тест/Речник |
| `lessonParts` | index.html:7699–7702 | 785 B | тест и речник в урока |
| `route` | index.html:7748–7767 | 2 KB | рутер по #hash → VIEWS[id] |
| `RFONT` | index.html:5920 | 75 B | шрифт за платната |
| `LOWGPU` | index.html:1153 | 181 B | флаг за слаби GPU (телефони): pixel ratio ≤1,5, по-леки липиди |
| `show3DError` | index.html:1157–1160 | 1 KB | причина + „Опитай отново“ вместо черен прозорец |
| `plot` | index.html:353–379 | 3 KB | 2D графики (оси, серии) |
| `EcgEngine` | index.html:2741–2787 | 4 KB | ЕКГ двигател |
| `Baro0` | index.html:3476–3478 | 513 B | модел на барорефлекса |
| `mkSim` | js/sys2.js:12–39 | 3 KB | ОБЩА СИМУЛАЦИЯ: mkSim(main,{sl,ev,pre,init,step,stats,note,plots,exp}) — плъзгачи, пресети, графики |
| `ZC` | js/sys2.js:11 | 135 B | цветова палитра за VII–XII (без зелено/жълто) |
| `zMat` | js/sys2.js:48–59 | 2 KB | материал за процедурни органи |
| `zTube` | js/sys2.js:61–69 | 1 KB | процедурна тръба (ГИТ, съдове) |
| `zPool` | js/sys2.js:217–223 | 2 KB | частици (InstancedMesh); 3-ти елемент в ZSH = молекулен модел |
| `ZSH` | js/sys2.js:186–188 | 1 KB | форми/етикети на частиците |
| `ZK` | js/sys2.js:224–291 | 13 KB | помощници за клетъчните сцени |
| `zCellStg` | js/sys2.js:430–434 | 1022 B | поетапна клетъчна сцена: {mem, it:[{k,kind,col,p,pdb,extra,nm}], pools} + upd(C,i,u,t,sg,R) |
| `zAddStg` | js/sys2.js:441 | 218 B | добавя поетапен 3D изглед към изгледа на тема |
| `zMuscle` | js/sys2.js:1056–1062 | 1 KB | 3D мускул с корем и сухожилия |
| `zSpindle` | js/sys2.js:1064–1068 | 786 B | мускулно вретено |
| `caFlux` | js/sys2.js:1899–1902 | 601 B | модел на калциевия баланс |
| `zRegister` | — |  | регистрира тема от отделен файл: zRegister(id,{name,view,book,tests,exp,gl,stage,en,enRe}) |
| `store` | index.html:341–344 | 199 B | localStorage с префикс fizsim_ |
| `SYLLABUS` | index.html:278–338 | 5 KB | списък на разделите и темите |

### Етапи (STG_* → STAGES)

| Тема | Конфигурация | Файл:редове | Размер | Етапи |
|---|---|---|---|---|
| ghk | `STG_GHK` | index.html:4186–4251 | 12 KB | 5 |
| ap | `STG_AP` | index.html:4257–4298 | 9 KB | 7 |
| channels | `STG_CH` | index.html:4303–4364 | 11 KB | 6 |
| neuron3d | `STG_NEU` | index.html:4368–4428 | 11 KB | 6 |
| transport | `STG_TR` | index.html:4431–4559 | 25 KB | 18 |
| nka | `STG_NKA` | index.html:4562–4723 | 29 KB | 13 |
| synapse | `STG_NMJ` | index.html:4726–4834 | 19 KB | 7 |
| chemsyn | `STG_CS` | index.html:4837–4944 | 19 KB | 9 |
| elecsyn | `STG_ES` | index.html:4947–5014 | 13 KB | 6 |
| smooth | `STG_SM` | index.html:5017–5174 | 27 KB | 8 |
| starling | `STG_STAR` | index.html:5177–5270 | 18 KB | 7 |
| gimot | `STG_GIMOT` | js/sys2.js:124–149 | 7 KB | 7 |
| gisec | `STG_GISEC` | js/sys2.js:150–180 | 8 KB | 6 |

Други STG_* (подават се директно на stageViewer от изгледа): `STG_GICELL` (js/sys2.js:326–396), `STG_SMC` (js/sys2.js:398–426), `STG_ABCELL` (js/sys2.js:456–513), `STG_MITO` (js/sys2.js:548–575), `STG_THCELL` (js/sys2.js:578–616), `STG_GLUCELL` (js/sys2.js:620–683), `STG_THYCELL` (js/sys2.js:688–748), `STG_CACELL` (js/sys2.js:750–813), `STG_RECCELL` (js/sys2.js:818–855), `STG_SENSCELL` (js/sys2.js:857–900), `STG_REFCELL` (js/sys2.js:908–951), `STG_ANSCELL` (js/sys2.js:953–996), `STG_EEGCELL` (js/sys2.js:998–1032), `STG_REFARC` (js/sys2.js:1075–1134), `STG_ANSPATH` (js/sys2.js:1141–1215), `STG_IONMET` (js/sys2.js:1220–1244), `STG_FIBERS` (js/sys2.js:1248–1273), `STG_MYOCH` (js/sys2.js:1279–1308), `STG_GFILT` (js/sys2.js:1312–1349)

### 3D модели в site/m/ (зареждат се при нужда през getElementById → m/<id>.txt)

Органи: 36 файла в `site/m/`; белтъци (PDB): 82 файла в `site/m/mol/`. Формат: base64 `<II nv,nf><6f min,size>`, uint16 позиции, uint32 индекси, по желание uint8 RGB.

### Вградени 3D данни

| id | Ред | Размер |
|---|---|---|

| `window.__HB.gutglb` | js/gutdata.js | 1.1 MB |
| `window.__HB.blad` | js/bladder.js | 144 KB |

### Речник и превод

- `GL` (index.html:5276–5339) + `GL.push(…)` в js/blood-renal.js + `Z_GL.push(…)` в js/sys2.js. Запис: `{t:"Термин", re:"регулярен израз за подчертаване", d:"обяснение"}`.
- `js/en.js`: `window.__EN={"български текст":"English", …}`; ключът е нормализиран текст/innerHTML на блок. Числата се заменят с `#` (шаблонни ключове).
- `js/i18n.js`: `T(s)` превежда низ; автоматично превежда DOM (MutationObserver) и `fillText` в платната. Липсващите ключове се събират в `window.__miss`.
