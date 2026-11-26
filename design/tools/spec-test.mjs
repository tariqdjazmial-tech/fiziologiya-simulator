#!/usr/bin/env node
// Пуска физиологичния модел на тема в Node срещу тестовите случаи от spec.json.
// Употреба: node design/tools/spec-test.mjs <id> [--model site/js/sections/<id>.js] [--spec design/topics/<id>/spec.json]
// Моделът (в js/sections/<id>.js) се излага така:
//   (window.__M = window.__M || {})["<id>"] = { params0(), init(p), step(s, p, dt), derived?(s, p) };
// Всичко останало във файла (zRegister, DOM) трябва да е под typeof-проверки или вътре във view(), за да не пречи тук.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const a = process.argv.slice(2), id = a[0];
if (!id) { console.error("Употреба: node design/tools/spec-test.mjs <id>"); process.exit(2); }
const arg = (k, d) => (a.includes(k) ? a[a.indexOf(k) + 1] : d);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const specF = path.resolve(ROOT, arg("--spec", `design/topics/${id}/spec.json`));
const modelF = path.resolve(ROOT, arg("--model", `site/js/sections/${id}.js`));
const spec = JSON.parse(fs.readFileSync(specF, "utf8"));

// пясъчник: window + празни заместители на API-то на сайта
const noop = () => {};
const win = { __M: {}, __EN: {}, __cleanups: [], location: { hash: "" }, addEventListener: noop };
const ctx = { window: win, console, Math, zRegister: noop, zSection: noop, SEC3D: {}, document: undefined, setTimeout, clearTimeout };
win.window = win; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(modelF, "utf8"), ctx, { filename: modelF });
const M = win.__M[id];
if (!M) { console.error(`Моделът не се изложи: очаквам window.__M["${id}"] в ${modelF}`); process.exit(2); }

const presets = Object.fromEntries((spec.presets || []).map(p => [p.key, p.set || {}]));
const num = v => (typeof v === "number" ? v : NaN);
let fail = 0;
const rows = [];
for (const c of spec.cases || []) {
  const p = Object.assign({}, M.params0(), c.preset ? presets[c.preset] || {} : {}, c.set || {});
  let s = M.init(p);
  const run = Object.assign({ dt: 0.01, t: 60 }, spec.run || {}, c.run || {});
  let t = 0, steps = 0;
  const maxSteps = Math.ceil(run.t / run.dt);
  const snap = () => Object.assign({}, s, M.derived ? M.derived(s, p) : {});
  // "steady": спира, когато всички следени величини се променят с < tol за 1 моделна единица време
  const keys = Object.keys(c.expect || {});
  let prev = snap(), lastCheck = 0;
  while (steps < maxSteps) {
    s = M.step(s, p, run.dt) || s; t += run.dt; steps++;
    if (run.steady && t - lastCheck >= 1) {
      const cur = snap();
      const still = keys.every(k => Math.abs(num(cur[k]) - num(prev[k])) <= (run.tol || 1e-3) * Math.max(1, Math.abs(num(cur[k]))));
      prev = cur; lastCheck = t; if (still && t > 2) break;
    }
  }
  const out = snap();
  for (const [k, rng] of Object.entries(c.expect || {})) {
    const v = num(out[k]); const [lo, hi] = rng;
    const ok = Number.isFinite(v) && v >= lo && v <= hi; if (!ok) fail++;
    rows.push([ok ? "OK " : "ГРЕШКА", c.name, k, Number.isFinite(v) ? +v.toPrecision(4) : String(out[k]), `[${lo}, ${hi}]`, `t=${+t.toFixed(2)}`]);
  }
}
const w = [6, 0, 0, 0, 0, 0]; rows.forEach(r => r.forEach((x, i) => (w[i] = Math.max(w[i], String(x).length))));
rows.forEach(r => console.log(r.map((x, i) => String(x).padEnd(w[i])).join("  ")));
console.log(`\n${rows.length - fail}/${rows.length} проверки минават` + (fail ? ` — ${fail} ГРЕШКИ` : ""));
process.exit(fail ? 1 : 0);
