#!/usr/bin/env node
// Генерира PROJECT_MAP.md без ръчно четене на файловете.
// Статичен анализ (регистрации във VIEWS, граници на функции, 3D маркери) + по избор
// проверка в браузъра (точен брой въпроси/експерименти, кой запис реално печели).
// Употреба: npm run map  (или node design/tools/map/gen-map.mjs [--root site] [--runtime file.json] [--out PROJECT_MAP.md])
import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv.includes("--root") ? path.resolve(process.argv[process.argv.indexOf("--root") + 1]) : path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../../site");
const OUTF = process.argv.includes("--out") ? path.resolve(process.argv[process.argv.indexOf("--out") + 1]) : path.join(ROOT, "..", "PROJECT_MAP.md");
const rd = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const args = process.argv.slice(2);
const rtFile = args.includes("--runtime") ? args[args.indexOf("--runtime") + 1] : null;
const RT = rtFile && fs.existsSync(rtFile) ? JSON.parse(fs.readFileSync(rtFile, "utf8")) : null;

// ---------- ред на зареждане ----------
const html = rd("index.html");
const htmlLines = html.split("\n");
const loadOrder = [];
{
  const re = /<script(?:\s+src="([^"]+)"|\s+type="text\/plain"\s+id="([^"]+)"|\s*)>/g; let m;
  while ((m = re.exec(html))) {
    const line = html.slice(0, m.index).split("\n").length;
    if (m[1]) loadOrder.push({ kind: "src", file: m[1], line });
    else if (m[2]) loadOrder.push({ kind: "data", id: m[2], line, bytes: htmlLines[line - 1].length });
    else loadOrder.push({ kind: "inline", line });
  }
}
// исходни текстове за анализ: вграденият код от index.html (без base64 редовете) + js файловете
const CODE_FILES = ["index.html", ...loadOrder.filter(s => s.kind === "src" && fs.existsSync(path.join(ROOT, s.file))).map(s => s.file)];
const SRC = {};
for (const f of CODE_FILES) {
  let t = rd(f);
  if (f === "index.html") t = t.split("\n").map(l => (l.length > 20000 ? "" : l)).join("\n"); // шрифтове и 3D данни
  SRC[f] = t;
}
const isData = f => /^js\/(en|en_re|gutdata|bladder|supabase\.min)\.js$/.test(f) || !fs.existsSync(path.join(ROOT, f));

// ---------- лексер: намира затварящата скоба, като прескача низове, шаблони, коментари, регулярни изрази ----------
function matchClose(t, i) { // t[i] е '{' '(' или '['
  const open = t[i], close = { "{": "}", "(": ")", "[": "]" }[open];
  const st = [close]; let j = i + 1, prevSig = open;
  const tmpl = []; // стек на дълбочината при ${ в шаблон
  while (j < t.length) {
    const c = t[j], n = t[j + 1];
    if (c === "/" && n === "/") { j = t.indexOf("\n", j); if (j < 0) return -1; continue; }
    if (c === "/" && n === "*") { j = t.indexOf("*/", j + 2); if (j < 0) return -1; j += 2; continue; }
    if (c === '"' || c === "'") { j++; while (j < t.length && t[j] !== c) { if (t[j] === "\\") j++; if (t[j] === "\n") break; j++; } j++; prevSig = "a"; continue; }
    if (c === "`") { j = skipTmpl(t, j + 1); prevSig = "a"; continue; }
    if (c === "/" && /[(,=:[!&|?{};+\-*%<>~^\n]/.test(prevSig)) { // регулярен израз
      j++; let cls = false; while (j < t.length) { const d = t[j]; if (d === "\\") { j += 2; continue; } if (d === "[") cls = true; else if (d === "]") cls = false; else if (d === "/" && !cls) break; else if (d === "\n") break; j++; }
      j++; while (/[a-z]/.test(t[j] || "")) j++; prevSig = "a"; continue;
    }
    if (c === "{" || c === "(" || c === "[") st.push({ "{": "}", "(": ")", "[": "]" }[c]);
    else if (c === "}" || c === ")" || c === "]") { if (st.pop() !== c) { /* несъответствие — продължаваме */ } if (!st.length) return j; }
    if (!/\s/.test(c)) prevSig = /[\w$]/.test(c) ? "a" : c;
    else if (c === "\n" && prevSig === "}") prevSig = "\n";
    j++;
  }
  return -1;
}
function skipTmpl(t, j) { // след отварящия `
  while (j < t.length) {
    const c = t[j];
    if (c === "\\") { j += 2; continue; }
    if (c === "`") return j + 1;
    if (c === "$" && t[j + 1] === "{") { const e = matchClose(t, j + 1); if (e < 0) return t.length; j = e + 1; continue; }
    j++;
  }
  return j;
}
// край на израз (стойност на const): поредица от групи в скоби и токени до ; или нов ред на дълбочина 0
function exprEnd(t, v) {
  let j = v, last = v;
  while (j < t.length) {
    const c = t[j];
    if (c === "{" || c === "(" || c === "[") { const e = matchClose(t, j); if (e < 0) return -1; last = j = e; j++; continue; }
    if (c === '"' || c === "'") { j++; while (j < t.length && t[j] !== c) { if (t[j] === "\\") j++; j++; } last = j; j++; continue; }
    if (c === "`") { j = skipTmpl(t, j + 1); last = j - 1; continue; }
    if (c === ";" || c === "," && t.slice(last + 1, j).trim() === "" && /[)\]}]/.test(t[last])) return last;
    if (c === "\n") { const nx = t.slice(j).match(/^\s*(\S)/); if (!nx || !/[.?:+\-*/&|=]/.test(nx[1])) return last; }
    if (!/\s/.test(c)) last = j;
    j++;
  }
  return last;
}
const lineOf = (t, i) => { let n = 1; for (let k = 0; k < i; k++) if (t.charCodeAt(k) === 10) n++; return n; };
const lineIdx = {}; // бързо: масив с отместванията на редовете
function lineAt(f, i) { if (!lineIdx[f]) { const a = [0]; const t = SRC[f]; for (let k = 0; k < t.length; k++) if (t.charCodeAt(k) === 10) a.push(k + 1); lineIdx[f] = a; }
  const a = lineIdx[f]; let lo = 0, hi = a.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (a[mid] <= i) lo = mid; else hi = mid - 1; } return lo + 1; }

// ---------- дефиниции на функции и константи ----------
const DEF = Object.create(null); // name -> {file, start, end, l0, l1, bytes, body}
for (const f of CODE_FILES) {
  if (isData(f)) continue;
  const t = SRC[f];
  const re = /(?:^|[\n;{}])\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(|(?:^|[\n;])\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?=[{\[(]|function|[\w$]+\s*=>|[\w$.]+\s*\()/g;
  let m;
  while ((m = re.exec(t))) {
    const name = m[1] || m[2]; const s = m.index + m[0].indexOf(name);
    let e;
    if (m[1]) { const p = t.indexOf("(", s); const pe = matchClose(t, p); const b = t.indexOf("{", pe); e = matchClose(t, b); }
    else e = exprEnd(t, re.lastIndex);
    if (e < 0) continue;
    if (DEF[name] && DEF[name].file === f) continue; // първата дефиниция
    const body = t.slice(s, e + 1);
    DEF[name] = { name, file: f, start: s, end: e, l0: lineAt(f, s), l1: lineAt(f, e), bytes: Buffer.byteLength(body), body };
  }
}

// ---------- регистрации във VIEWS (по реда на зареждане) ----------
const REG = Object.create(null); // id -> [{file,line,kind,fn,body}]
const addReg = (id, r) => (REG[id] = REG[id] || []).push(r);
for (const f of CODE_FILES) {
  if (isData(f)) continue; const t = SRC[f]; let m;
  const reMap = /(?:const\s+VIEWS\s*=|Object\.assign\(\s*VIEWS\s*,)\s*\{/g;
  while ((m = reMap.exec(t))) { const b = t.indexOf("{", m.index + m[0].length - 1); const e = matchClose(t, b); const inner = t.slice(b + 1, e);
    for (const p of inner.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$]*)/g)) addReg(p[1], { file: f, line: lineAt(f, m.index), kind: "map", fn: p[2] }); }
  const reOne = /(?<![\w.])(Z_)?VIEWS\.([A-Za-z_$][\w$]*)\s*=\s*(?!=)/g;
  while ((m = reOne.exec(t))) { const id = m[2]; const after = t.slice(reOne.lastIndex, reOne.lastIndex + 30); const line = lineAt(f, m.index);
    const fm = after.match(/^([A-Za-z_$][\w$]*)\s*[;,\n)]/);
    if (fm && fm[1] !== "function") addReg(id, { file: f, line, kind: m[1] ? "Z_VIEWS" : "assign", fn: fm[1] });
    else { const b = t.indexOf("{", reOne.lastIndex); const e = matchClose(t, b); addReg(id, { file: f, line, l1: lineAt(f, e), kind: "wrapper", fn: null, body: t.slice(reOne.lastIndex, e + 1), bytes: e - reOne.lastIndex }); } }
}

// ---------- 3D маркери ----------
const DATA_IDS = loadOrder.filter(s => s.kind === "data").map(s => s.id).concat(["blad", "gutglb"]);
const MARK = [
  ["stageViewer (етапи)", /stageViewer\(|STAGES\[|zAddStg\(|zCellStg\(/], ["MK.loadMesh (PDB/органи от m/)", /MK\.(loadMesh|realize|swapGeo|molMat)|loadMesh\(/], ["make3D", /make3D\(/], ["mk3DView", /mk3DView\(/], ["r3Attach", /r3Attach\(/],
  ["MK.*", /MK\.(bilayer|blob|helix|pool|mol|sign|arrow|mat|along)/], ["R3.*", /R3\.[a-z]/], ["MarchingCubes", /loadMC\(|MarchingCubes|mc:true/],
  ["GLB/вградени данни", new RegExp(`(getElementById\\(["'](${DATA_IDS.join("|")})["']\\)|__HB\\.(blad|gutglb)|GLTFLoader|glb)`)], ["THREE директно", /THREE\.|\bT\.Mesh/],
];
const CALL = /([A-Za-z_$][\w$]*)\s*\(|[:{,]\s*([A-Za-z_$][\w$]*)\s*(?=[,}])/g;
// извиквания, защитени с typeof X, когато X не съществува никъде, не се броят (напр. sh3D, STG_SH)
const ALLTXT = CODE_FILES.filter(f => !isData(f)).map(f => SRC[f]).join("\n");
const defined = n => !!DEF[n] || new RegExp(`(function\\s+${n}\\b|(const|let|var)\\s+${n}\\b|window\\.${n}\\s*=|\\b${n}\\s*=\\s*[^=])`).test(ALLTXT);
function stripGuards(body) { return body.replace(/typeof\s+([A-Za-z_$][\w$]*)\s*[!=]==?\s*["'](?:function|undefined)["'][^;\n]*/g, (m, n) => (defined(n) ? m : "")); }
function closure(body, depth = 3, seen = new Set()) { // функции, извикани транзитивно
  if (depth < 0) return seen; body = stripGuards(body);
  for (const m of body.matchAll(CALL)) { const n = m[1] || m[2]; const d = DEF[n]; if (!d || seen.has(n) || /^(slider|\$|css|el|fmt|T|linkTerms|route|after)$/.test(n)) continue; if (d.bytes > 300000) continue; seen.add(n); closure(d.body, depth - 1, seen); }
  return seen;
}
function marks(text) { return MARK.filter(([, r]) => r.test(text)).map(([k]) => k); }

// ---------- обекти на темата: STAGES, TESTS, EXP, BOOK (всички начини на регистрация) ----------
// литерал {k: стойност, …}: ключове на първо ниво с редове и (ако стойността е име) препратка
function litKeys(f, b) { const t = SRC[f]; const end = matchClose(t, b); const out = {}; let j = b + 1;
  while (j < end) { const c = t[j];
    if (c === "{" || c === "[" || c === "(") { j = matchClose(t, j) + 1; continue; }
    if (c === '"' || c === "'") { j++; while (t[j] !== c) { if (t[j] === "\\") j++; j++; } j++; continue; }
    if (c === "`") { j = skipTmpl(t, j + 1); continue; }
    const km = /^([A-Za-z_$][\w$]*)\s*:/.exec(t.slice(j, j + 60));
    if (km && /[\s,{]/.test(t[j - 1])) { let v = j + km[0].length; while (/\s/.test(t[v])) v++; const lit = /[{\[]/.test(t[v]); const e = lit ? matchClose(t, v) : v + (/^[\w$.()]+/.exec(t.slice(v)) || [""])[0].length;
      out[km[1]] = { file: f, l0: lineAt(f, j), l1: lineAt(f, e), bytes: e - j, ref: lit ? null : t.slice(v, e) }; j = e + 1; continue; }
    j++; }
  return out; }
const OBJ = { STAGES: {}, TESTS: {}, BOOK: {}, EXP: {} };
for (const f of CODE_FILES) { if (isData(f)) continue; const t = SRC[f]; let m;
  const reL = /(?:const\s+(STAGES|TESTS|BOOK)\s*=|Object\.assign\(\s*(STAGES|TESTS|BOOK)\s*,|(?:window\.)?__EXTRA_EXP\s*=\s*(?:Object\.assign\([^,]*,\s*)?|const\s+EXP_OF\s*=\s*\(\)\s*=>\s*\()\s*\{/g;
  while ((m = reL.exec(t))) { const k = m[1] || m[2] || "EXP"; const b = reL.lastIndex - 1; for (const [id, v] of Object.entries(litKeys(f, b))) OBJ[k][id] = OBJ[k][id] || v; }
  const reD = /(?<![\w.])(?:Z_)?(STAGES|TESTS|BOOK|EXP)\.([A-Za-z_$][\w$]*)\s*=(?!=)\s*/g;
  while ((m = reD.exec(t))) { const v = reD.lastIndex; const lit = /[{\[]/.test(t[v]); const e = lit ? matchClose(t, v) : v + (/^[\w$.]+/.exec(t.slice(v)) || [""])[0].length;
    OBJ[m[1]][m[2]] = OBJ[m[1]][m[2]] || { file: f, l0: lineAt(f, m.index), l1: lineAt(f, e), bytes: e - m.index, ref: lit ? null : t.slice(v, e) }; }
  // sys2.js: [["chemsyn",STG_X],…].forEach(([k,c])=>{… VIEWS[k]=m=>{f(m);zAddStg(m,c)}})
  const reA = /\[((?:\["\w+",\s*STG_\w+\],?\s*)+)\]\.forEach\([^]*?VIEWS\[k\]\s*=/g;
  while ((m = reA.exec(t))) for (const p of m[1].matchAll(/\["(\w+)",\s*(STG_\w+)\]/g)) addReg(p[1], { file: f, line: lineAt(f, m.index), l1: lineAt(f, m.index), kind: "wrapper", fn: null, body: "stageViewer(" + p[2], bytes: 0, stg: p[2] });
}
// zRegister("id",{view,book,tests,exp,gl,…}) в отделен файл (js/zreg.js) — локалните имена са във файла
const MODS = Object.create(null);
for (const f of CODE_FILES) { if (isData(f)) continue; const t = SRC[f]; let m; const re = /zRegister\(\s*["']([\w-]+)["']\s*,\s*\{/g;
  while ((m = re.exec(t))) { const id = m[1]; const loc1 = k => { const r = new RegExp(`(?:const|let|var)\\s+${k}\\s*=\\s*`).exec(t); if (!r) return null; const e = exprEnd(t, r.index + r[0].length); return { file: f, l0: lineAt(f, r.index), l1: lineAt(f, e), bytes: e - r.index }; };
    const vf = /(?:^|\n)\s*function\s+view\s*\(/.exec(t); let vl = null; if (vf) { const p0 = t.indexOf("(", vf.index + vf[0].length - 1); const b = t.indexOf("{", matchClose(t, p0)); const e = matchClose(t, b); vl = { l0: lineAt(f, vf.index + 1), l1: lineAt(f, e), bytes: e - vf.index }; }
    MODS[id] = { file: f, line: lineAt(f, m.index), view: vl, book: loc1("book"), tests: loc1("tests"), exp: loc1("exp"), gl: loc1("gl"), bytes: Buffer.byteLength(t) };
    addReg(id, { file: f, line: lineAt(f, m.index), kind: "zRegister", fn: null, body: t, bytes: Buffer.byteLength(t), mod: true }); } }
const locOf = (x) => { if (!x) return null; if (x.ref) { const d = DEF[x.ref.replace(/\.concat.*/, "")]; if (d) return { file: d.file, l0: d.l0, l1: d.l1, bytes: d.bytes, ref: x.ref }; } return x; };
const STAGES = OBJ.STAGES;

// ---------- SYLLABUS ----------
const SYL = []; { const d = DEF.SYLLABUS; let cur = null;
  for (const m of d.body.matchAll(/\{id:"([^"]+)",\s*name:"([^"]+)"|\{id:"([^"]+)",\s*t:"([^"]+)",\s*ready:(true|false)/g)) {
    if (m[1]) { cur = { id: m[1], name: m[2], items: [] }; SYL.push(cur); } else cur.items.push({ id: m[3], t: m[4], ready: m[5] === "true" }); } }

// ---------- сглобяване ----------
const fmtB = b => (b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : b >= 1024 ? (b / 1024).toFixed(0) + " KB" : b + " B");
const tok = b => "≈" + (Math.round(b / 3.5 / 100) / 10).toFixed(1) + "k";
const loc = x => (x ? `${x.file}:${x.l0}${x.l1 && x.l1 !== x.l0 ? "–" + x.l1 : ""}` : "—");
const rows = []; let totQ = 0; const EXPKEYS = { neuron3d: "n3d", channels: "ch" };
for (const sec of SYL) for (const it of sec.items) {
  const id = it.id, regs = REG[id] || []; const base = [...regs].reverse().find(r => r.fn) || null; const wr = regs.filter(r => r.kind === "wrapper" || r.kind === "zRegister"); const MOD = MODS[id];
  const baseDef = base && DEF[base.fn];
  const fns = closure((baseDef ? baseDef.body : "") + wr.map(w => w.body).join("\n"));
  if (baseDef) fns.add(base.fn);
  const stg = STAGES[id] && STAGES[id].ref; const stgDef = stg && DEF[stg];
  const stgX = wr.filter(w => w.stg).map(w => w.stg);
  let text = stripGuards([...fns].map(n => DEF[n].body).join("\n") + wr.map(w => w.body).join("\n")) + [stg, ...stgX].filter(Boolean).map(n => "stageViewer(" + (DEF[n] ? DEF[n].body : "")).join("\n");
  const m3 = MOD ? marks(stripGuards(SRC[MOD.file])) : marks(text); const bytes = (baseDef ? baseDef.bytes : 0) + wr.reduce((a, w) => a + w.bytes, 0);
  const helperBytes = [...fns].filter(n => n !== (base && base.fn)).reduce((a, n) => a + DEF[n].bytes, 0);
  const testsLoc = MOD ? MOD.tests : locOf(OBJ.TESTS[id]); const expLoc = MOD ? MOD.exp : locOf(OBJ.EXP[id] || OBJ.EXP[EXPKEYS[id]]); const bookLoc = MOD ? MOD.book : locOf(OBJ.BOOK[id]);
  const rt = RT && RT.topics[id];
  if (rt) totQ += rt.tests || 0;
  rows.push({ MOD, sec: sec.id, id, t: it.t, ready: it.ready, regs, base, baseDef, wr, stg, stgDef, stgX, m3, bytes, helperBytes, helpers: [...fns].filter(n => n !== (base && base.fn)), testsLoc, expLoc, bookLoc, rt });
}

// ---------- общи библиотеки ----------
const LIBS = [
  ["loadThree", "зарежда three.js r128 от cdnjs (Promise)"], ["loadMC", "зарежда THREE.MarchingCubes (за MK.blob)"],
  ["make3D", "сцена+камера+рендерер, орбита с пръст/щипване, етикети в HTML, flyTo"], ["mk3DView", "цикъл rAF с пауза извън екрана и cleanup"],
  ["wrap3D", "HTML контейнер за 3D сцена със зареждащ индикатор"], ["vcolor", "цветова скала за мембранен потенциал (−90…+30 mV)"],
  ["LIN", "hex → линеен THREE.Color"], ["stripeTex", "раирана CanvasTexture"], ["lipidSlab", "опростена мембрана (InstancedMesh)"],
  ["MK", "библиотека за молекулни модели: mat, bilayer, blob, helix, pool, mol, sign, arrow, along, rnd"],
  ["easeIO", "плавна крива 0..1"], ["lerp", "линейна интерполация"], ["SVI", "SVG икони на бутоните"],
  ["stageViewer", "общ визуализатор на ЕТАПИ (бутони, кръгова/списъчна диаграма, текст, статистики, 3D)"],
  ["STAGES", "карта тема → STG_* конфигурация"], ["r3Attach", "слага 3D сцена на мястото на 2D платно (бутон 3D/Схема)"],
  ["R3", "материали и анатомични модели за раздели V–VI (std, phys, glass, glow, …)"], ["r3Body", "силует на тяло (3D)"], ["r3Thorax", "гръден кош (3D)"],
  ["Z", "2D скелет за раздели VII–XII (Z.T, Z.box, Z.org …)"], ["slider", "плъзгач с етикет и единица"], ["statsHTML", "плочки със стойности"],
  ["lockMinH", "фиксира височина на сменящ се текст"], ["ratchetH", "блоковете със стойности само растат"],
  ["TESTS", "въпроси по тема (основен обект)"], ["MOD_NAMES", "имена на модулите"], ["EXP_OF", "карта тема → експерименти"], ["expLists", "същото за напредъка"],
  ["testCard", "рисува теста на темата"], ["experiments", "рисува списък с въпроси/експерименти"], ["GL", "речник: {t, re, d}"], ["GL_ORDER", "речник, подреден за подчертаване"],
  ["linkTerms", "подчертава термините от речника в DOM"], ["BOOK", "теория по тема: {title, adv, lead, secs[], key[]}"], ["BF", "SVG помощници за фигурите в теорията"],
  ["renderBook", "урок с табове Теория/Симулация/Тест/Речник"], ["lessonParts", "тест и речник в урока"], ["route", "рутер по #hash → VIEWS[id]"], ["RFONT", "шрифт за платната"],
  ["LOWGPU", "флаг за слаби GPU (телефони): pixel ratio ≤1,5, по-леки липиди"], ["show3DError", "причина + „Опитай отново“ вместо черен прозорец"],
  ["plot", "2D графики (оси, серии)"], ["EcgEngine", "ЕКГ двигател"], ["Baro0", "модел на барорефлекса"],
  ["mkSim", "ОБЩА СИМУЛАЦИЯ: mkSim(main,{sl,ev,pre,init,step,stats,note,plots,exp}) — плъзгачи, пресети, графики"],
  ["ZC", "цветова палитра за VII–XII (без зелено/жълто)"], ["zMat", "материал за процедурни органи"], ["zTube", "процедурна тръба (ГИТ, съдове)"],
  ["zPool", "частици (InstancedMesh); 3-ти елемент в ZSH = молекулен модел"], ["ZSH", "форми/етикети на частиците"], ["ZK", "помощници за клетъчните сцени"],
  ["zCellStg", "поетапна клетъчна сцена: {mem, it:[{k,kind,col,p,pdb,extra,nm}], pools} + upd(C,i,u,t,sg,R)"], ["zAddStg", "добавя поетапен 3D изглед към изгледа на тема"],
  ["zMuscle", "3D мускул с корем и сухожилия"], ["zSpindle", "мускулно вретено"], ["caFlux", "модел на калциевия баланс"],
  ["zRegister", "регистрира тема от отделен файл: zRegister(id,{name,view,book,tests,exp,gl,stage,en,enRe})"],
  ["store", "localStorage с префикс fizsim_"], ["SYLLABUS", "списък на разделите и темите"],
];
const libRows = LIBS.map(([n, d]) => { const x = DEF[n]; return `| \`${n}\` | ${x ? `${x.file}:${x.l0}${x.l1 !== x.l0 ? "–" + x.l1 : ""}` : "—"} | ${x ? fmtB(x.bytes) : ""} | ${d} |`; });

// етапи STG_*
const stgRows = Object.entries(STAGES).filter(([, v]) => v.ref).map(([id, v]) => { const d = DEF[v.ref]; const n = RT && RT.topics[id] ? RT.topics[id].stages : d ? (d.body.match(/\{t:"|S\("/g) || []).length : 0; return `| ${id} | \`${v.ref}\` | ${d ? `${d.file}:${d.l0}–${d.l1}` : "—"} | ${d ? fmtB(d.bytes) : ""} | ${n} |`; });
// STG извън STAGES (напр. в sys2.js)
const stgExtra = Object.keys(DEF).filter(n => /^STG_/.test(n) && !Object.values(STAGES).some(v => v.ref === n)).map(n => `\`${n}\` (${DEF[n].file}:${DEF[n].l0}–${DEF[n].l1})`);

// ---------- изход ----------
const now = new Date().toISOString().slice(0, 10);
let o = `# PROJECT_MAP — PhysioNova\n\n> Генерирано автоматично от \`node tools/gen-map.mjs${RT ? " --runtime …" : ""}\` на ${now}. **Не редактирай на ръка** — пусни скрипта отново (\`npm run map\`).\n> Номерата на редовете са към текущите файлове. Токените са груба оценка (UTF-8 байтове / 3,5).\n\n`;
o += `## Обобщение\n\n- Теми в SYLLABUS: **${rows.length}**, готови: **${rows.filter(r => r.ready).length}**, раздели: **${SYL.length}**\n`;
if (RT) o += `- Въпроси (TESTS, по браузъра): **${RT.totalTests}**; експерименти: **${RT.totalExp}**; термини в речника (GL): **${RT.gl}**; превод en.js: **${RT.en}** записа\n- Проверка в браузъра: ${RT.errors.length ? "грешки в конзолата: " + RT.errors.length : "без грешки в конзолата при зареждане"}\n`;
o += `- index.html: ${fmtB(Buffer.byteLength(html))}, ${htmlLines.length - (html.endsWith("\n") ? 1 : 0)} реда; код ≈ ${fmtB(Buffer.byteLength(SRC["index.html"]))} (${tok(Buffer.byteLength(SRC["index.html"]))} токена); останалото са шрифтове (редове 9–12) и base64 3D данни.\n\n`;

o += `## Ред на зареждане\n\nВсичко е класически \`<script>\` (не модули). \`const\`/\`function\` на най-горно ниво са общи за всички скриптове. Главният inline скрипт (ред ${loadOrder.find(s => s.kind === "inline" && s.line > 250)?.line}) дефинира всичко и в края вика \`route()\`. **Всеки по-късен файл, който заменя \`VIEWS.<id>\`, сам вика \`route()\` отново** (вж. края на blood-renal.js, resp-renal-3d.js, blood-3d.js).\n\n| # | Ред в index.html | Скрипт | Размер | Роля |\n|---|---|---|---|---|\n`;
const ROLE = { "js/blood-renal.js": "раздели III и VI (2D модели, TESTS_*, EXP_*, речник) → Object.assign(VIEWS,…)", "js/resp-renal-3d.js": "3D за V и VI (R3, r3Attach) — обвива VIEWS.lungmech/gasx/respreg", "js/blood-3d.js": "3D за III — обвива VIEWS.hemost/hbcurve/bgroups", "js/gutdata.js": "GLB данни за ГИТ (window.__HB.gutglb)", "js/bladder.js": "GLB данни за пикочен мехур (window.__HB.blad)", "js/sys2.js": "раздели VII–XII: Z (2D скелет), Z_BOOK/Z_TESTS/Z_EXP/Z_VIEWS/Z_GL → Object.assign", "js/zorg.js": "анатомични икони за Z.org, __body, __leg", "js/figs2.js": "заменя теоретичните фигури по aria-label", "js/en.js": "речник BG→EN (window.__EN)", "js/i18n.js": "превод на DOM и надписите в платната (T())", "js/shell.js": "обвивка: меню, начален екран, профил, admin, auth", "js/legal.js": "поверителност и условия", "js/atlas.js": "типография и SVG дефиниции", "js/sections-loader.js": "зарежда js/sections/*.js СЛЕД всички (нови теми)", "js/zreg.js": "zRegister — регистрация на тема от отделен файл", "js/mod-menst.js": "модул: менструален цикъл", "js/mod-adrenal.js": "модул: надбъбречна кора", "js/mod-erythro.js": "модул: еритропоеза", "js/mod-shock.js": "модул: шок", "js/bpsim.js": "измерване на АН по Коротков", "js/barostage.js": "поетапен барорефлекс в 3D", "js/theory-cv.js": "допълнителна теория ССС (след sys2/figs2)", "js/theory-rest.js": "допълнителна теория (останалите)", "js/en_re.js": "регулярни изрази за английския речник", "js/glass.js": "стъклени бутони", "js/mobile.js": "телефони", "js/intros.js": "въведения (английски)", "js/config.js": "публични настройки (НЕ се публикува в артефакта)", "js/supabase.min.js": "Supabase клиент", "js/sb.js": "профили/Supabase", "js/native.js": "Capacitor (приложение)" };
loadOrder.forEach((s, i) => { o += `| ${i + 1} | ${s.line} | ${s.kind === "src" ? "`" + s.file + "`" : s.kind === "data" ? `data \`#${s.id}\`` : "inline"} | ${s.kind === "src" ? fmtB(fs.statSync(path.join(ROOT, s.file)).size) : s.kind === "data" ? fmtB(s.bytes) : ""} | ${s.kind === "src" ? ROLE[s.file] || "" : s.kind === "data" ? "base64 3D модел (GLB/бинарни данни)" : s.line < 270 ? "екран за зареждане" : "ЦЯЛОТО ЯДРО: SYLLABUS, библиотеки, теми I–V, TESTS, GL, BOOK, рутер"} |\n`; });

o += `\n## Теми\n\nКолони: **Изглед** = функцията, която рисува темата (последната регистрация печели; „обвивка“ = \`VIEWS.id=function(m){стар(m); 3D…}\`). **3D** = какво 3D ползва изгледът транзитивно (до 3 нива извиквания).\n\n`;
for (const sec of SYL) {
  o += `### ${sec.id}. ${sec.name}\n\n| id | Тема | Изглед (файл:редове, размер) | Етапи | 3D | Тест | Експ. | Теория |\n|---|---|---|---|---|---|---|---|\n`;
  for (const r of rows.filter(x => x.sec === sec.id)) {
    const v = r.MOD ? `модул \`${r.MOD.file}\` (${fmtB(r.MOD.bytes)}, ${tok(r.MOD.bytes)})${r.MOD.view ? `<br>\`view\` ${r.MOD.view.l0}–${r.MOD.view.l1}` : ""}<br><sub>рег.: zRegister ${r.MOD.file}:${r.MOD.line}</sub>` : r.baseDef ? `\`${r.base.fn}\` ${r.baseDef.file}:${r.baseDef.l0}–${r.baseDef.l1} (${fmtB(r.baseDef.bytes)}, ${tok(r.baseDef.bytes)})` : "—";
    const w = r.wr.filter(x => x.kind !== "zRegister").map(x => `<br>+ обвивка ${x.file}:${x.line}${x.l1 && x.l1 !== x.line ? "–" + x.l1 : ""}${x.stg ? " (+" + x.stg + ")" : ""}`).join("");
    const reg = r.MOD ? "" : r.base ? `<br><sub>рег.: ${r.base.file}:${r.base.line} (${r.base.kind})</sub>` : "";
    const stgL = [r.stg, ...r.stgX].filter(Boolean).map(n => DEF[n] ? `\`${n}\` ${DEF[n].file.replace("index.html", "")}${DEF[n].file === "index.html" ? "" : ":"}${DEF[n].l0}–${DEF[n].l1}` : `\`${n}\``);
    const stg = stgL.length ? stgL.join("<br>") : (r.m3.includes("stageViewer (етапи)") ? "в изгледа" : "—");
    const nT = r.rt ? r.rt.tests : "?"; const nE = r.rt ? r.rt.exp : "?";
    o += `| \`${r.id}\` | ${r.t} | ${v}${w}${reg} | ${stg} | ${r.m3.length ? r.m3.filter(x => x !== "THREE директно" || r.m3.length === 1).join(", ") : "**няма 3D**"} | ${nT} · ${loc(r.testsLoc)}${r.testsLoc && r.testsLoc.ref ? " `" + r.testsLoc.ref + "`" : ""} | ${nE} · ${loc(r.expLoc)}${r.expLoc && r.expLoc.ref ? " `" + r.expLoc.ref + "`" : ""} | ${r.bookLoc ? loc(r.bookLoc) : "—"} |\n`;
  }
  o += "\n";
}
o += `### Помощни функции по тема (транзитивно извиквани, сума от размерите)\n\n<details><summary>разгъни</summary>\n\n`;
for (const r of rows) o += `- **${r.id}** (${fmtB(r.helperBytes)}): ${r.helpers.slice(0, 25).map(n => `\`${n}\` ${DEF[n].file.replace("index.html", "i")}:${DEF[n].l0}`).join(", ")}${r.helpers.length > 25 ? ` … (+${r.helpers.length - 25})` : ""}\n`;
o += `\n</details>\n\n`;
const no3d = rows.filter(r => !r.m3.some(x => x !== "THREE директно"));
o += `### Теми без 3D (кандидати за надграждане)\n\n${no3d.length ? no3d.map(r => `- \`${r.id}\` — ${r.t}`).join("\n") : "Няма — всички теми ползват някакво 3D."}\n\n`;
o += `## Общи библиотеки\n\n| Име | Файл:редове | Размер | Какво прави |\n|---|---|---|---|\n${libRows.join("\n")}\n\n`;
o += `### Етапи (STG_* → STAGES)\n\n| Тема | Конфигурация | Файл:редове | Размер | Етапи |\n|---|---|---|---|---|\n${stgRows.join("\n")}\n\nДруги STG_* (подават се директно на stageViewer от изгледа): ${stgExtra.join(", ") || "—"}\n\n`;
o += `### 3D модели в site/m/ (зареждат се при нужда през getElementById → m/<id>.txt)\n\n${fs.existsSync(path.join(ROOT, "m")) ? `Органи: ${fs.readdirSync(path.join(ROOT, "m")).filter(x => x.endsWith(".txt")).length} файла в \`site/m/\`; белтъци (PDB): ${fs.existsSync(path.join(ROOT, "m/mol")) ? fs.readdirSync(path.join(ROOT, "m/mol")).length : 0} файла в \`site/m/mol/\`. Формат: base64 \`<II nv,nf><6f min,size>\`, uint16 позиции, uint32 индекси, по желание uint8 RGB.` : ""}\n\n### Вградени 3D данни\n\n| id | Ред | Размер |\n|---|---|---|\n${loadOrder.filter(s => s.kind === "data").map(s => `| \`#${s.id}\` | ${s.line} | ${fmtB(s.bytes)} |`).join("\n")}\n| \`window.__HB.gutglb\` | js/gutdata.js | ${fmtB(fs.statSync(path.join(ROOT, "js/gutdata.js")).size)} |\n| \`window.__HB.blad\` | js/bladder.js | ${fmtB(fs.statSync(path.join(ROOT, "js/bladder.js")).size)} |\n\n`;
o += `### Речник и превод\n\n- \`GL\` (index.html:${DEF.GL?.l0}–${DEF.GL?.l1}) + \`GL.push(…)\` в js/blood-renal.js + \`Z_GL.push(…)\` в js/sys2.js. Запис: \`{t:"Термин", re:"регулярен израз за подчертаване", d:"обяснение"}\`.\n- \`js/en.js\`: \`window.__EN={"български текст":"English", …}\`; ключът е нормализиран текст/innerHTML на блок. Числата се заменят с \`#\` (шаблонни ключове).\n- \`js/i18n.js\`: \`T(s)\` превежда низ; автоматично превежда DOM (MutationObserver) и \`fillText\` в платната. Липсващите ключове се събират в \`window.__miss\`.\n`;
fs.writeFileSync(OUTF, o);
console.log("PROJECT_MAP.md:", o.length, "chars,", rows.length, "topics");
