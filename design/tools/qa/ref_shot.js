// Снимка на основния 3D прозорец на тема (за еталони за реалистичност).
// Употреба: NODE_PATH=$(npm root -g) node design/tools/qa/ref_shot.js <id> <out.png> [ширина=820] [чакане_ms=25000] [етап]
const { chromium } = require("playwright"), http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../../../site"), [, , topic, out, vw, wait, stage] = process.argv;
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]).replace(/^\/$/, "/index.html"));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": p.endsWith(".js") ? "text/javascript; charset=utf-8" : p.endsWith(".html") ? "text/html; charset=utf-8" : "" });
  fs.createReadStream(p).pipe(r);
});
srv.listen(0, async () => {
  const b = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
  const W = +(vw || 820), p = await b.newPage({ viewport: { width: W, height: W < 500 ? 844 : 1180 }, deviceScaleFactor: 1 });
  await p.addInitScript(() => {
    localStorage.setItem("fizsim_lang", '"bg"'); localStorage.setItem("fizsim_auth_seen", "1");
    try { Object.defineProperty(window, "__introPick", { get: () => "none", set: () => {} }); } catch (e) {}
    let c; Object.defineProperty(window, "PHYS_CFG", { configurable: true, get: () => c, set: v => { c = Object.assign({}, v, { testOpen: true }); } });
    window.PHYS_CFG = window.PHYS_CFG || {};
  });
  await p.goto(`http://localhost:${srv.address().port}/index.html#${topic}`, { waitUntil: "load", timeout: 120000 });
  await p.evaluate(() => window.__sectionsReady).catch(() => {});
  await p.waitForTimeout(2000);
  await p.evaluate(() => { const o = document.getElementById("hxo"); if (o) o.parentNode.removeChild(o); const t = document.querySelector("[role=tab][data-tab=sim]"); if (t) t.click(); });
  await p.waitForTimeout(+(wait || 25000));
  if (stage) await p.evaluate(k => { const s = window.__stg && Object.values(window.__stg)[0]; if (s && s.go) s.go(+k); }, stage);
  if (stage) await p.waitForTimeout(4000);
  const v = await p.$(".v3d");
  await v.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
  await v.screenshot({ path: out });
  await b.close(); srv.close();
});
