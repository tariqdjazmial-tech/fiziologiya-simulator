/* ===== <id>: 3D (шаблон; копирай в site/js/sections/<id>-3d.js). САМО рендерира getState(). ===== */
(function () {
  "use strict";
  const ID = "_template";
  // макет, докато моделът не е готов: същите имена и стойности като в spec.json
  const MOCK = () => ({ t: performance.now() / 1000, V: -70 + 10 * Math.sin(performance.now() / 900), tau: 10 });
  (window.SEC3D = window.SEC3D || {})[ID] = {
    mount(wrap, getState) {
      const get = getState || MOCK;
      return mk3DView("#" + wrap.id, () => {
        const G = make3D(wrap, { r: 30, th: 0.3, phi: 1.25, hq: true, min: 8, max: 80 }), T = G.T;
        const mem = MK.bilayer(T, { w: 24, d: 10 }); G.scene.add(mem);
        const ions = MK.pool(T, 0xf76707, 0.3, LOWGPU ? 60 : 140); G.scene.add(ions);   // Na⁺ оранжев
        return { G, T, mem, ions, col: new T.Color() };
      }, (c, dt) => {
        const st = get();                                   // ← единственият вход
        vcolor(c.T, st.V, c.col);                           // Vm → цвят
        c.mem.userData.heads.material.color.copy(c.col);
        c.G.render([[`V = ${st.V.toFixed(1)} mV`, new c.T.Vector3(0, 4, 0)]]);
      }, { mc: false });
    }
  };
})();
