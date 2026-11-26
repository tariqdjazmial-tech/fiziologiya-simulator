/* ===== Нови и надградени теми: по един файл на тема в js/sections/ =====
   Зарежда се ПОСЛЕДЕН (след mod-*.js, mobile.js, glass.js). Затова файловете тук могат да заменят
   VIEWS/BOOK/TESTS/STAGES на съществуваща тема или да добавят нова. Старият код остава непокътнат.

   Добави тема: впиши имената на файловете (без .js) в PHYS_SECTIONS, в реда на зареждане:
     "<id>-3d" (3D, по избор) ПРЕДИ "<id>" (модел + zRegister), за да е готов SEC3D.<id>, когато темата се рисува.
   Договор:
     js/sections/<id>-3d.js:  SEC3D.<id> = { mount(wrapEl, getState) → stop }   — само рендерира състоянието
     js/sections/<id>.js:     zSection(id,{sec,t,after}) (само за НОВА тема) + zRegister(id,{name,view,book,tests,exp,gl,stage,en,enRe})
   За тестове: window.__SECTIONS_EXTRA=[…] зарежда допълнителни файлове; window.__sectionsReady (Promise) се изпълнява, когато всички файлове са заредени. */
window.PHYS_SECTIONS = [
  "cardio-3d", "cardio",
].concat(window.__SECTIONS_EXTRA || []); // __SECTIONS_EXTRA: само за тест (addInitScript), преди темата да се включи за всички
(function () {
  "use strict";
  window.SEC3D = window.SEC3D || {};

  // нова тема в менюто: добавя я в SYLLABUS и в READY (без да пипаме index.html); за съществуваща — само ready:true и заглавие
  window.zSection = function (id, o) {
    o = o || {};
    if (typeof SYLLABUS === "undefined") return;
    let it = null, sec = null;
    SYLLABUS.forEach(s => s.items.forEach(i => { if (i.id === id) { it = i; sec = s; } }));
    if (!it) {
      sec = SYLLABUS.find(s => s.id === o.sec) || SYLLABUS[SYLLABUS.length - 1];
      it = { id, t: o.t || id, ready: true };
      const k = o.after ? sec.items.findIndex(i => i.id === o.after) : -1;
      if (k >= 0) sec.items.splice(k + 1, 0, it); else sec.items.push(it);
    } else { it.ready = true; if (o.t) it.t = o.t; }
    if (typeof READY !== "undefined") { // READY е const масив: пресъздаваме го на място, в реда на SYLLABUS
      const fresh = SYLLABUS.flatMap(s => s.items.filter(i => i.ready).map(i => Object.assign({ sec: s }, i)));
      READY.length = 0; fresh.forEach(r => READY.push(r));
    }
    try { if (typeof buildNav === "function" && typeof curView !== "undefined") buildNav(curView); } catch (e) { console.error(e); }
  };

  const list = (window.PHYS_SECTIONS || []).filter(Boolean);
  window.__sectionsReady = new Promise(done => {
    if (!list.length) return done([]);
    const res = []; let left = list.length;
    list.forEach(name => {
      const s = document.createElement("script");
      s.src = "js/sections/" + name + ".js";
      s.async = false; // запазва реда на изпълнение
      s.onload = () => { res.push([name, true]); if (!--left) done(res); };
      s.onerror = () => { console.error("Липсва js/sections/" + name + ".js"); res.push([name, false]); if (!--left) done(res); };
      document.body.appendChild(s);
    });
  });
})();
