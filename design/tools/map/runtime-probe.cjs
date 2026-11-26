// Зарежда приложението в headless Chromium и записва точните бройки по тема (JSON).
// Употреба: node design/tools/map/runtime-probe.cjs <изход.json> [порт] [папка на сайта]
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(process.argv[4] || path.join(__dirname, "../../../site")), OUT = process.argv[2] || "runtime.json", PORT = +(process.argv[3] || 8765);
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]).replace(/^\/$/, "/index.html")); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); });
srv.listen(PORT, async () => {
  const b = await chromium.launch(); const pg = await b.newPage(); const errors = [];
  pg.on("pageerror", e => errors.push(String(e.message).slice(0, 300)));
  pg.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
  await pg.addInitScript(() => { try { localStorage.setItem("fizsim_lang", '"bg"'); } catch (e) {} window.PHYS_CFG = Object.assign(window.PHYS_CFG || {}, { testOpen: true }); try { Object.defineProperty(window, "__introPick", { get: () => "none", set: () => {} }); } catch (e) {} });
  await pg.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "load", timeout: 120000 });
  await pg.waitForTimeout(1500);
  const r = await pg.evaluate(() => {
    const ex = typeof EXP_OF === "function" ? EXP_OF() : {}; const topics = {};
    SYLLABUS.forEach(s => s.items.forEach(i => { const v = VIEWS[i.id];
      topics[i.id] = { view: v ? (v.name || "(анонимна обвивка)") : null, tests: (TESTS[i.id] || []).length, exp: (ex[i.id] || []).length, book: typeof BOOK !== "undefined" && !!BOOK[i.id], stages: typeof STAGES !== "undefined" && STAGES[i.id] ? (STAGES[i.id].stages || (STAGES[i.id].mechs || []).flatMap(m => m.stages)).length : 0 }; }));
    return { topics, totalTests: Object.values(topics).reduce((a, t) => a + t.tests, 0), totalExp: Object.values(topics).reduce((a, t) => a + t.exp, 0), gl: GL.length, en: Object.keys(window.__EN || {}).length, sections: SYLLABUS.length };
  });
  r.errors = errors; fs.writeFileSync(OUT, JSON.stringify(r, null, 1)); console.log("tests", r.totalTests, "exp", r.totalExp, "gl", r.gl, "en", r.en, "errors", errors.length);
  await b.close(); srv.close();
});
