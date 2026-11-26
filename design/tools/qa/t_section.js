// Проверка на ЕДНА тема в браузъра — общ инструмент за агентите „Проверка на кода“ и „Дизайн“.
// Употреба (от корена на репото):
//   SP=<папка за резултати> NODE_PATH=$(npm root -g) node design/tools/qa/t_section.js <id> [--sections a-3d,a] [--lang bg|en] [--dev ipad,phone]
// --sections: файлове от site/js/sections/ за зареждане (по подразбиране "<id>-3d,<id>", ако съществуват; "-" = нищо — за стара тема)
// Сам вдига статичен сървър върху site/. three.js: от SP/three/package, ако го има, иначе от CDN.
// Внимание: frameMs е под софтуерен WebGL (swiftshader) — сравнявай теми помежду си, не с истинския iPad.
// Резултат: SP/qa/<id>/<dev>_s<етап>.png, <dev>_page.png и report.json {errors, frameMs, webgl, stages, miss}
const { chromium } = require("playwright"), http = require("http"), fs = require("fs"), path = require("path");
const a = process.argv.slice(2), id = a[0]; if (!id) { console.error("нужен е id"); process.exit(2); }
const opt = k => (a.includes(k) ? a[a.indexOf(k) + 1] : null);
const ROOT = path.resolve(__dirname, "../../../site"), SP = process.env.SP || "/tmp/qa", OUT = path.join(SP, "qa", id);
fs.mkdirSync(OUT, { recursive: true });
const exists = n => fs.existsSync(path.join(ROOT, "js/sections", n + ".js"));
let secs = opt("--sections"); secs = secs === "-" ? [] : secs ? secs.split(",") : [id + "-3d", id].filter(exists);
const lang = opt("--lang") || "bg";
const DEV = { ipad: { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }, desk: { viewport: { width: 1280, height: 900 } } };
const devs = (opt("--dev") || "ipad,phone").split(",");
const TH = path.join(SP, "three/package");
const MIME = { ".js": "text/javascript; charset=utf-8", ".html": "text/html; charset=utf-8", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]).replace(/^\/$/, "/index.html")); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": MIME[path.extname(p)] || "text/plain; charset=utf-8" }); fs.createReadStream(p).pipe(r); });
srv.listen(0, async () => {
  const port = srv.address().port, rep = { id, sections: secs, lang, devices: {} };
  const b = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const dn of devs) {
    const ctx = await b.newContext(DEV[dn] || DEV.ipad), p = await ctx.newPage(), errs = [];
    p.on("pageerror", e => errs.push("PAGE: " + e.message.slice(0, 200))); p.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 200)); });
    if (fs.existsSync(TH)) await p.route(/three(\.min)?\.js$|three@0\.128\.0\/examples/, r => { const u = r.request().url(); const f = u.includes("examples") ? TH + "/examples" + u.split("/examples")[1] : TH + "/build/three.min.js"; fs.existsSync(f) ? r.fulfill({ path: f, contentType: "application/javascript" }) : r.continue(); });
    await p.addInitScript(([s, l]) => { window.__SECTIONS_EXTRA = s; if (l === "en") window.__HARVEST = 1; localStorage.setItem("fizsim_lang", JSON.stringify(l)); localStorage.setItem("fizsim_auth_seen", "1");
      try { Object.defineProperty(window, "__introPick", { get: () => "none", set: () => {} }); } catch (e) {}
      let c; Object.defineProperty(window, "PHYS_CFG", { configurable: true, get: () => c, set: v => { c = Object.assign({}, v, { testOpen: true }); } }); window.PHYS_CFG = window.PHYS_CFG || {};
      const gc = HTMLCanvasElement.prototype.getContext; window.__gl = 0; HTMLCanvasElement.prototype.getContext = function (t, ...r) { const x = gc.call(this, t, ...r); if (x && /webgl/.test(t) && !this.__c) { this.__c = 1; window.__gl++; } return x; }; }, [secs, lang]);
    await p.goto(`http://localhost:${port}/index.html#${id}`, { waitUntil: "load", timeout: 120000 });
    await p.evaluate(() => window.__sectionsReady).catch(() => {});
    await p.waitForTimeout(2500);
    await p.evaluate(() => { const o = document.getElementById("hxo"); if (o) o.remove(); const t = document.querySelector("[role=tab][data-tab=sim]"); if (t) t.click(); });
    await p.waitForTimeout(6000);
    // време за кадър (rAF) за 3 s
    const frameMs = await p.evaluate(() => new Promise(res => { const d = []; let l = performance.now(), t0 = l; const f = n => { d.push(n - l); l = n; if (n - t0 < 3000) requestAnimationFrame(f); else { d.sort((x, y) => x - y); res({ median: +d[d.length >> 1].toFixed(1), p95: +d[Math.floor(d.length * 0.95)].toFixed(1), n: d.length }); } }; requestAnimationFrame(f); }));
    await p.screenshot({ path: path.join(OUT, dn + "_page.png"), fullPage: false });
    // етапи: всеки stageViewer на страницата (window.__stg[id].go(i))
    const viewers = await p.evaluate(() => Object.keys(window.__stg || {}).filter(k => document.getElementById(k)));
    const stages = [];
    for (const v of viewers) {
      for (let i = 0; i < 20; i++) {
        const r = await p.evaluate(([v, i]) => { const S = window.__stg[v]; S.go(i); const w = document.getElementById(v); w.scrollIntoView({ block: "center" }); const card = w.closest(".stage-card"); const b = card && card.querySelector("[data-k=txt] b"); return { at: S.st.i, cap: b ? b.textContent : "" }; }, [v, i]);
        const cap = r.cap; if (r.at !== i) break; // go() завърта по модул N → етапите свършиха
        await p.waitForTimeout(2600);
        const f = path.join(OUT, `${dn}_${v}_s${i + 1}.png`); await p.locator("#" + v).screenshot({ path: f }).catch(() => {});
        stages.push({ viewer: v, i: i + 1, caption: cap, shot: path.basename(f) });
      }
    }
    const miss = lang === "en" ? await p.evaluate(() => [...(window.__miss || [])].slice(0, 80)) : [];
    rep.devices[dn] = { errors: [...new Set(errs)], frameMs, webgl: await p.evaluate(() => window.__gl), stages, miss };
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(rep, null, 1));
  for (const [dn, r] of Object.entries(rep.devices)) console.log(`${dn}: грешки ${r.errors.length}, кадър медиана ${r.frameMs.median} ms (p95 ${r.frameMs.p95}), WebGL ${r.webgl}, етапи ${r.stages.length}${lang === "en" ? ", непреведени " + r.miss.length : ""}`);
  console.log("→ " + OUT); await b.close(); srv.close();
});
