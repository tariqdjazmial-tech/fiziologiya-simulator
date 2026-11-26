/* ===== <id>: <заглавие> — модел, урок, тест (шаблон; копирай в site/js/sections/<id>.js) =====
   Спецификация: design/topics/<id>/spec.json. Източници: … */
(function () {
  "use strict";
  const ID = "_template";
  // ---------- МОДЕЛ (чист JS, без DOM; тества се с node design/tools/spec-test.mjs <id>) ----------
  const M = {
    params0: () => ({ Vrest: -70, Rm: 20, Cm: 0.5, I: 0 }),        // mV, MΩ, nF, nA
    init: p => ({ t: 0, V: p.Vrest }),                             // ms, mV
    step(s, p, dt) { const dV = (p.Vrest - s.V) / (p.Rm * p.Cm) + p.I / p.Cm; return { t: s.t + dt, V: s.V + dt * dV }; },
    derived: (s, p) => ({ tau: p.Rm * p.Cm })                      // ms
  };
  (window.__M = window.__M || {})[ID] = M;
  if (typeof zRegister !== "function") return;                     // в Node спираме тук

  // ---------- СЪСТОЯНИЕ: единственият източник за 3D и 2D ----------
  const S = (window.__S = window.__S || {})[ID] = { p: M.params0(), s: null };
  S.s = M.init(S.p);

  function view(main) {
    // mkSim(main,{sl,ev,pre,init,step,stats,note,plots,exp}) — вж. site/js/sys2.js и PROJECT_MAP.md
    main.innerHTML = `<h2>…</h2><p class="lead">…</p>` + wrap3D("w3" + ID, 440);
    const get = () => Object.assign({}, S.s, M.derived(S.s, S.p), { p: S.p });
    if (window.SEC3D && SEC3D[ID]) (window.__cleanups = window.__cleanups || []).push(SEC3D[ID].mount(document.getElementById("w3" + ID), get));
  }
  if (typeof zSection === "function") zSection(ID, { sec: "I", after: "ghk", t: "…" }); // само за НОВА тема
  zRegister(ID, { name: "…", view, book: { title: "…", lead: "…", adv: "…", secs: [], key: [] }, tests: [], exp: [], gl: [], en: {} });
})();
