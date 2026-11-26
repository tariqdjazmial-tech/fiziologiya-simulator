/* ===== cardio: Сърдечен цикъл и PV примка — модел, урок, тест, речник =====
   Спецификация: design/topics/cardio/spec.json. Източници: Guyton & Hall 14 изд., гл. 9; Suga & Sagawa 1974;
   Stergiopulos 1996; Burkhoff 2005; Westerhof 2009. Модел: еластанс, който се мени във времето (ЛК и ЛП),
   клапи като диоди с линейно съпротивление, 2-елементен Windkessel; явен Ойлер, dt = 1e-4 s. */
(function () {
  "use strict";
  const ID = "cardio";

  // ---------- МОДЕЛ (чист JS, без DOM) ----------
  // нормиран еластанс на ЛК (двоен Hill; Stergiopulos 1996), Tmax = 0,2 + 0,15·T s
  function act(tc, T) { const tn = Math.max(0, tc) / (0.2 + 0.15 * T), a = Math.pow(tn / 0.7, 1.9), b = Math.pow(tn / 1.17, 21.9); return (a / (1 + a)) / (1 + b); }
  const P0 = {
    HR: 72,        // /min
    Pv: 9.5,       // mmHg, налягане в белодробните вени (преднатоварване)
    Ees: 2.8,      // mmHg/mL, наклон на ESPVR (контрактилитет)
    R: 1.1,        // mmHg·s/mL, периферно съпротивление (следнатоварване)
    C: 1.2,        // mL/mmHg, комплайънс на аортата
    V0: 10,        // mL, обем при нулево налягане (ESPVR)
    A: 0.6,        // mmHg, мащаб на EDPVR
    k: 0.024,      // 1/mL, диастолна скованост
    Rav: 0.004,    // mmHg·s/mL, отворена аортна клапа (стеноза: 0,3)
    Rmv: 0.004,    // mmHg·s/mL, отворена митрална клапа
    Rmr: 1e9,      // mmHg·s/mL, обратно съпротивление на затворена митрална клапа (регургитация: 0,4)
    Rpv: 0.03,     // mmHg·s/mL, белодробни вени → ЛП
    Ela_min: 0.15, Ela_max: 0.3, // mmHg/mL, еластанс на ЛП
    V0_la: 4,      // mL
    PR: 0.10,      // s, механично закъснение: предсърдното съкращение започва PR преди камерното (електричният PR ≈ 0,16 s; механиката изостава)
    Tas: 0.08,     // s, полупродължителност на предсърдната систола
    Pven: 5        // mmHg, налягане на изтичане на системния кръг
  };
  const fresh = () => ({ Vmax: -1e9, Vmin: 1e9, Pmax: -1e9, Pmin: 1e9, Plvmax: -1e9, Plamax: -1e9, sumP: 0, sumPla: 0, n: 0, qr: 0, qf: 0, sw: 0, Pes: 0 });
  // нормиране и момент на пика на еластанса за дадена честота
  function norm(s, p) { const T = 60 / p.HR; let em = 0, tp = 0; for (let t = 0; t < T; t += 1e-4) { const a = act(t, T); if (a > em) { em = a; tp = t; } } s.em = em; s.tpk = tp; s.HR = p.HR; }
  const W = {}; // работен обект (без заемане на памет във всяка стъпка)
  function inst(s, p, o) {
    const T = 60 / p.HR, e = act(s.tc, T) / s.em, Pd = p.A * (Math.exp(p.k * (s.V_lv - p.V0)) - 1);
    const P_lv = e * p.Ees * (s.V_lv - p.V0) + (1 - e) * Pd;
    const PR = Math.min(p.PR, 0.2 * T), Tas = Math.min(p.Tas, 0.13 * T); // при тахикардия AV закъснението и предсърдната систола се скъсяват
    const x = ((s.tc - (T - PR)) % T + T) % T, ea = x < 2 * Tas ? Math.pow(Math.sin(Math.PI * x / (2 * Tas)), 2) : 0;
    const P_la = (p.Ela_min + (p.Ela_max - p.Ela_min) * ea) * (s.V_la - p.V0_la);
    o.T = T; o.e_lv = e; o.e_la = ea; o.P_lv = P_lv; o.P_la = P_la;
    o.Q_pv = (p.Pv - P_la) / p.Rpv;
    o.Q_mv = P_la > P_lv ? (P_la - P_lv) / p.Rmv : (P_la - P_lv) / p.Rmr;
    o.Q_av = P_lv > s.P_ao ? (P_lv - s.P_ao) / p.Rav : 0;
    o.Q_out = (s.P_ao - p.Pven) / p.R;
    o.mv_open = P_la > P_lv ? 1 : 0; o.av_open = P_lv > s.P_ao ? 1 : 0;
    // фаза 1–7 (Guyton гл. 9); s.ej = имало е изтласкване в този цикъл, s.red = вече е бавно изтласкване
    let ph;
    if (o.av_open) ph = !s.av0 || s.tc - s.tAO < s.ejT / 3 ? 2 : 3; // бързо = първата трета на изтласкването (Guyton гл. 9)
    else if (o.mv_open) ph = ea > 0 ? 7 : (!s.mv0 || s.tc - s.tMO < (T - s.tMO) / 3 ? 5 : 6);
    else ph = s.ej ? 4 : 1; // затворени клапи: след изтласкване = релаксация, след пълнене = съкращение
    o.phase = ph;
    return o;
  }
  const M = {
    params0: () => Object.assign({}, P0),
    init(p) { const s = { tc: 0, V_lv: 120, V_la: 50, P_ao: 85, tMO: 0, mv0: 1, tAO: 0, av0: 0, ej: 0, ejT: 0.27, em: 1, tpk: 0.3, HR: 0, c: fresh(), sum: {} }; norm(s, p); return s; },
    step(s, p, dt) {
      if (!(dt > 0)) return s;
      if (s.HR !== p.HR) norm(s, p);
      const i = inst(s, p, W), c = s.c, dV = dt * (i.Q_mv - i.Q_av);
      if (s.V_lv > c.Vmax) c.Vmax = s.V_lv; if (s.V_lv < c.Vmin) c.Vmin = s.V_lv;
      if (s.P_ao > c.Pmax) c.Pmax = s.P_ao; if (s.P_ao < c.Pmin) c.Pmin = s.P_ao;
      if (i.P_lv > c.Plvmax) c.Plvmax = i.P_lv; if (i.P_la > c.Plamax) c.Plamax = i.P_la;
      c.sumP += s.P_ao; c.sumPla += i.P_la; c.n++;
      if (i.Q_mv < 0) c.qr -= i.Q_mv * dt; c.qf += i.Q_av * dt; c.sw -= i.P_lv * dV;
      if (i.mv_open && !s.mv0) { s.tMO = s.tc; s.ej = 0; } s.mv0 = i.mv_open;
      if (i.av_open && !s.av0) s.tAO = s.tc;
      if (!i.av_open && s.av0) { s.ejT = ((s.tc - s.tAO) % i.T + i.T) % i.T; c.Pes = i.P_lv; } s.av0 = i.av_open;
      if (i.av_open) s.ej = 1;
      s.V_lv += dV; s.V_la += dt * (i.Q_pv - i.Q_mv); s.P_ao += dt * (i.Q_av - i.Q_out) / p.C; s.tc += dt;
      if (s.tc >= i.T) {
        s.tc %= i.T; s.tMO = 0; s.tAO -= i.T;
        const SV = c.Vmax - c.Vmin;
        s.sum = { EDV: c.Vmax, ESV: c.Vmin, SV, SVf: c.qf, RSV: c.qr, RF: c.qr / SV, EF: SV / c.Vmax, CO: c.qf * p.HR / 1000,
          SBP: c.Pmax, DBP: c.Pmin, PP: c.Pmax - c.Pmin, MAP: c.sumP / c.n, LVSP: c.Plvmax, LVEDP: i.P_lv,
          AVgrad: c.Plvmax - c.Pmax, Pla_max: c.Plamax, Pla_mean: c.sumPla / c.n, SW: c.sw, Ea: (c.Pes || c.Plvmax) / SV, Pes: c.Pes };
        s.c = fresh();
      }
      return s;
    },
    derived(s, p) { return Object.assign(inst(s, p, {}), s.sum); }
  };
  (window.__M = window.__M || {})[ID] = M;
  if (typeof zRegister !== "function" || typeof mkSim !== "function") return; // в Node спираме тук

  const T_ = x => (window.T ? window.T(x) : x), EN = (window.__EN = window.__EN || {}), L = (bg, en) => { if (en) EN[bg] = en; return bg; };
  const f = (v, d) => (Number.isFinite(v) ? (typeof fmt === "function" ? fmt(v, d) : v.toFixed(d)) : "—");
  const ZCc = (typeof ZC !== "undefined" ? ZC : { grn: "#495057", red: "#e03131", blue: "#1c7ed6", vio: "#9c36b5", teal: "#0c8599", gray: "#868e96", org: "#e8590c", pink: "#c2566b" });

  // ---------- СЪСТОЯНИЕ ----------
  const S = (window.__S = window.__S || {})[ID] = { p: M.params0(), s: null };
  S.s = M.init(S.p);

  const PRE = {
    norm: { n: L("Норма", "Normal"), set: {}, info: L("Покой, 72/min: EDV ≈ 120 mL, ESV ≈ 50 mL, ударен обем ≈ 70 mL, EF ≈ 0,58, аорта 120/80 mmHg, дебит ≈ 5 L/min (Guyton, гл. 9).", "Rest, 72/min: EDV ≈ 120 mL, ESV ≈ 50 mL, stroke volume ≈ 70 mL, EF ≈ 0.58, aorta 120/80 mmHg, output ≈ 5 L/min (Guyton, ch. 9).") },
    htn: { n: L("Хипертония (↑следнатоварване)", "Hypertension (↑afterload)"), set: { R: 1.8, C: 0.8 }, info: L("Периферното съпротивление е ↑ и аортата е по-скована. Камерата изтласква срещу ≈ 160 mmHg: изтласкването спира по-рано по ESPVR, ESV ↑ и ударният обем ↓.", "Peripheral resistance is ↑ and the aorta is stiffer. The ventricle ejects against ≈ 160 mmHg: ejection stops earlier on the ESPVR, ESV ↑ and stroke volume ↓.") },
    symp: { n: L("Симпатикус (↑контрактилитет)", "Sympathetic drive (↑contractility)"), set: { Ees: 4.2, HR: 90 }, info: L("Норадреналин през β1 рецепторите: ESPVR е по-стръмна (Ees 2,8 → 4,2 mmHg/mL) и честотата е 90/min. Камерата се изпразва по-пълно: ESV ↓, EF ↑, дебитът ↑.", "Noradrenaline via β1 receptors: the ESPVR is steeper (Ees 2.8 → 4.2 mmHg/mL) and the rate is 90/min. The ventricle empties more completely: ESV ↓, EF ↑, output ↑.") },
    as: { n: L("Аортна стеноза", "Aortic stenosis"), set: { Rav: 0.3 }, info: L("Аортният отвор е стеснен. За да мине кръвта, налягането в ЛК трябва да е много над аортното: градиент пик-пик ≈ 75 mmHg (тежка АС; ехо критерий: среден градиент ≥ 40 mmHg), LVSP ≈ 180 mmHg. Хронично: концентрична хипертрофия.", "The aortic orifice is narrowed. For blood to pass, LV pressure must be far above aortic pressure: peak-to-peak gradient ≈ 75 mmHg (severe AS; echo criterion: mean gradient ≥ 40 mmHg), LVSP ≈ 180 mmHg. Chronically: concentric hypertrophy.") },
    mr: { n: L("Митрална регургитация", "Mitral regurgitation"), set: { Rmr: 0.4 }, info: L("Митралната клапа не се затваря плътно. В систолата около половината от кръвта се връща в ЛП: ЛП се раздува (v-вълна), EF изглежда висока, но дебитът напред и аортното налягане (≈ 80/50 mmHg) падат. Няма изоволумични фази. В модела налягането в белодробните вени е фиксирано, затова v-вълната е малка; при остра тежка МР тя е много по-висока и се развива белодробен застой.", "The mitral valve does not close tightly. In systole about half of the blood flows back into the LA: the LA distends (v wave), EF looks high, but forward output and aortic pressure (≈ 80/50 mmHg) fall. There are no isovolumic phases. In the model pulmonary venous pressure is fixed, so the v wave is small; in acute severe MR it is much higher and pulmonary congestion develops.") }
  };
  const PH = [null,
    L("Изоволумично съкращение", "Isovolumic contraction"), L("Бързо изтласкване", "Rapid ejection"), L("Бавно изтласкване", "Reduced ejection"),
    L("Изоволумична релаксация", "Isovolumic relaxation"), L("Бързо пълнене", "Rapid filling"), L("Диастаза (бавно пълнене)", "Diastasis (slow filling)"), L("Предсърдна систола", "Atrial systole")];
  const PHN = [null,
    L("<b>Изоволумично съкращение</b>: митралната клапа току-що се е затворила (I тон), аортната още е затворена. Обемът не се мени, а налягането в ЛК расте до аортното.", "<b>Isovolumic contraction</b>: the mitral valve has just closed (first sound), the aortic valve is still closed. Volume does not change while LV pressure rises to aortic pressure."),
    L("<b>Бързо изтласкване</b>: P<sub>ЛК</sub> е над аортното и аортната клапа е отворена. Около 70% от ударния обем излиза в първата трета на изтласкването и разтяга аортата.", "<b>Rapid ejection</b>: P<sub>LV</sub> is above aortic pressure and the aortic valve is open. About 70% of the stroke volume leaves in the first third of ejection and distends the aorta."),
    L("<b>Бавно изтласкване</b>: камерата още изтласква, но по-слабо, отколкото кръвта изтича към периферията — аортното налягане вече пада.", "<b>Reduced ejection</b>: the ventricle still ejects, but less than flows out to the periphery — aortic pressure is already falling."),
    L("<b>Изоволумична релаксация</b>: аортната клапа се е затворила (II тон, инцизура). Двете клапи са затворени, налягането в ЛК пада при постоянен обем (ESV).", "<b>Isovolumic relaxation</b>: the aortic valve has closed (second sound, incisura). Both valves are closed and LV pressure falls at constant volume (ESV)."),
    L("<b>Бързо пълнене</b>: P<sub>ЛК</sub> е под P<sub>ЛП</sub>, митралната клапа е отворена и натрупаната в ЛП кръв нахлува в камерата.", "<b>Rapid filling</b>: P<sub>LV</sub> is below P<sub>LA</sub>, the mitral valve is open and the blood stored in the LA rushes into the ventricle."),
    L("<b>Диастаза</b>: наляганията в ЛП и ЛК почти са се изравнили и притокът е малък. Аортата се свива и поддържа диастолното налягане (Windkessel).", "<b>Diastasis</b>: LA and LV pressures have almost equalised and inflow is small. The aorta recoils and maintains diastolic pressure (Windkessel)."),
    L("<b>Предсърдна систола</b>: ЛП се съкращава (a-вълна) и добавя около 20% от пълненето. Камерата достига крайния диастолен обем.", "<b>Atrial systole</b>: the LA contracts (a wave) and adds about 20% of filling. The ventricle reaches its end-diastolic volume.")];

  const PH_MR = { 1: L("Съкращение с регургитация", "Contraction with regurgitation"), 4: L("Релаксация с регургитация", "Relaxation with regurgitation") };
  const PHN_MR = {
    1: L("<b>Съкращение с регургитация</b>: аортната клапа още е затворена, но митралната не държи — кръвта се връща в ЛП и обемът на ЛК пада още преди изтласкването. Истинска изоволумична фаза няма.", "<b>Contraction with regurgitation</b>: the aortic valve is still closed but the mitral valve leaks — blood flows back into the LA and LV volume falls even before ejection. There is no true isovolumic phase."),
    4: L("<b>Релаксация с регургитация</b>: аортната клапа се е затворила, а през митралната още тече кръв назад към ЛП, докато P<sub>ЛК</sub> е над P<sub>ЛП</sub>.", "<b>Relaxation with regurgitation</b>: the aortic valve has closed, but blood still flows back through the mitral valve into the LA while P<sub>LV</sub> is above P<sub>LA</sub>.")
  };

  // ---------- 2D: Wiggers диаграма + PV примка от кръгов буфер ----------
  const NB = 1400, B = { t: new Float32Array(NB), plv: new Float32Array(NB), pao: new Float32Array(NB), pla: new Float32Array(NB), v: new Float32Array(NB), ph: new Uint8Array(NB), i: 0, n: 0, last: -1 };
  let ref = null; // предишна примка (сиво) за сравнение след смяна на пресета
  function bufReset() { if (B.n > 50) ref = loopPts(); B.i = 0; B.n = 0; B.last = -1; }
  function bufPush(t, s, d) { const k = B.i; B.t[k] = t; B.plv[k] = d.P_lv; B.pao[k] = s.P_ao; B.pla[k] = d.P_la; B.v[k] = s.V_lv; B.ph[k] = d.phase; B.i = (k + 1) % NB; if (B.n < NB) B.n++; }
  function each(fromT, fn) { for (let j = 0; j < B.n; j++) { const k = (B.i - B.n + j + NB) % NB; if (B.t[k] >= fromT) fn(k); } }
  function loopPts() { const T = 60 / S.p.HR, tn = B.t[(B.i - 1 + NB) % NB], x = [], y = []; each(tn - T, k => { x.push(B.v[k]); y.push(B.plv[k]); }); return { x, y }; }
  const css = (v, d) => { try { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || d; } catch (e) { return d; } };

  function draw(g, p, R, t, dt, s) {
    const cw = 640, ch = 340, x0 = 52, x1 = cw - 14, yP0 = 18, yP1 = 210, yV0 = 232, yV1 = 326;
    const ink = css("--ink", "#1D1D1F"), mut = css("--muted", "#5E5E63"), line = css("--line", "rgba(29,29,31,.12)");
    g.clearRect(0, 0, cw, ch); g.font = "12px Commissioner, sans-serif"; g.lineWidth = 1;
    if (!B.n) return;
    const T = 60 / S.p.HR, tn = B.t[(B.i - 1 + NB) % NB], t0 = tn - T;
    const X = tt => x0 + (tt - t0) / T * (x1 - x0), Pmax = Math.max(140, Math.ceil(((s.sum && s.sum.LVSP) || 120) / 20) * 20 + 20);
    const YP = v => yP1 - v / Pmax * (yP1 - yP0), YV = v => yV1 - (v - 20) / 160 * (yV1 - yV0);
    // ленти на фазите (сиви тонове)
    let pk = -1, px = x0;
    each(t0, k => { const ph = B.ph[k], xx = X(B.t[k]); if (ph !== pk) { if (pk > 0) { g.fillStyle = (pk === 1 || pk === 4) ? "rgba(73,80,87,.13)" : (pk <= 3 ? "rgba(134,142,150,.09)" : "rgba(0,0,0,0)"); g.fillRect(px, yP0, xx - px, yV1 - yP0); } pk = ph; px = xx; } });
    if (pk > 0) { g.fillStyle = (pk === 1 || pk === 4) ? "rgba(73,80,87,.13)" : (pk <= 3 ? "rgba(134,142,150,.09)" : "rgba(0,0,0,0)"); g.fillRect(px, yP0, x1 - px, yV1 - yP0); }
    // мрежа и оси
    g.strokeStyle = line; g.fillStyle = mut; g.textAlign = "right"; g.textBaseline = "middle";
    for (let v = 0; v <= Pmax; v += 40) { g.beginPath(); g.moveTo(x0, YP(v)); g.lineTo(x1, YP(v)); g.stroke(); g.fillText(v, x0 - 6, YP(v)); }
    for (const v of [50, 150]) { g.beginPath(); g.moveTo(x0, YV(v)); g.lineTo(x1, YV(v)); g.stroke(); g.fillText(v, x0 - 6, YV(v)); }
    g.save(); g.translate(13, (yP0 + yP1) / 2); g.rotate(-Math.PI / 2); g.textAlign = "center"; g.fillText(T_(L("налягане, mmHg", "pressure, mmHg")), 0, 0); g.restore();
    g.save(); g.translate(13, (yV0 + yV1) / 2); g.rotate(-Math.PI / 2); g.textAlign = "center"; g.fillText("mL", 0, 0); g.restore();
    const curve = (arr, Y, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); let st = 0; each(t0, k => { const xx = X(B.t[k]), yy = Y(arr[k]); if (!st) { g.moveTo(xx, yy); st = 1; } else g.lineTo(xx, yy); }); g.stroke(); };
    curve(B.pao, YP, ZCc.blue, 2.2); curve(B.pla, YP, ZCc.vio, 2); curve(B.plv, YP, ZCc.red, 2.4); curve(B.v, YV, ZCc.teal, 2.2);
    // маркер „сега“
    g.strokeStyle = ink; g.lineWidth = 1.2; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(x1, yP0); g.lineTo(x1, yV1); g.stroke(); g.setLineDash([]);
    // надписи на кривите (вдясно, без застъпване)
    const d = inst(s, S.full || S.p, {}), labs = [[YP(d.P_lv), ZCc.red, L("ЛК", "LV")], [YP(s.P_ao), ZCc.blue, L("аорта", "aorta")], [YP(d.P_la), ZCc.vio, L("ЛП", "LA")]].map(l => (l[0] = Math.min(yP1 - 6, l[0] - 8), l)).sort((a, b) => b[0] - a[0]);
    for (let j = 1; j < labs.length; j++) if (labs[j - 1][0] - labs[j][0] < 14) labs[j][0] = labs[j - 1][0] - 14;
    g.textAlign = "right"; g.font = "600 12px Commissioner, sans-serif";
    labs.forEach(([y, c, tx]) => { g.fillStyle = c; g.fillText(T_(tx), x1 - 6, y); });
    g.fillStyle = ZCc.teal; g.fillText(T_(L("обем ЛК", "LV volume")), x1 - 6, YV(s.V_lv) - 10);
    g.fillStyle = ink; g.textAlign = "left"; g.font = "600 13px Commissioner, sans-serif"; g.fillText(T_((S.full || S.p).Rmr < 1e6 && (d.phase === 1 || d.phase === 4) ? PH_MR[d.phase] : PH[d.phase]), x0 + 4, yP0 + 8);
  }

  const plots = [{
    h: 230,
    f: (p, R, h, s) => {
      const P = S.full || S.p, lp = loopPts(), EDV = (s.sum && s.sum.EDV) || 120, ESV = (s.sum && s.sum.ESV) || 50, LVSP = (s.sum && s.sum.LVSP) || 120;
      const vx = [], es = [], ed = []; for (let v = P.V0; v <= 220; v += 5) { vx.push(v); es.push(P.Ees * (v - P.V0)); ed.push(P.A * (Math.exp(P.k * (v - P.V0)) - 1)); }
      const ser = [];
      if (ref && ref.x.length) ser.push({ x: ref.x, y: ref.y, color: ZCc.gray, width: 1.4, dash: [3, 3] });
      ser.push({ x: vx, y: es, color: ZCc.gray, width: 1.6, dash: [6, 4] }, { x: vx, y: ed, color: ZCc.grn || "#495057", width: 1.6, dash: [6, 4] },
        { x: [ESV, EDV], y: [LVSP, 0], color: ZCc.blue, width: 1.2, dash: [2, 3] }, { x: lp.x, y: lp.y, color: ZCc.red, width: 2.4 },
        { x: [s.V_lv - 1.5, s.V_lv + 1.5], y: [inst(s, P, {}).P_lv, inst(s, P, {}).P_lv], color: css("--ink", "#1D1D1F"), width: 7 });
      return { xmin: 0, xmax: 220, ymin: 0, ymax: Math.max(160, Math.ceil((LVSP + 20) / 20) * 20), xlabel: L("обем ЛК, mL", "LV volume, mL"), ylabel: L("P ЛК, mmHg", "LV P, mmHg"), series: ser };
    }
  }];

  const SL = [
    { k: "HR", label: L("Сърдечна честота HR", "Heart rate HR"), min: 40, max: 180, step: 1, value: 72, unit: "/min", hint: L("норма 60–80/min; при тахикардия се скъсява главно диастолата", "normal 60–80/min; tachycardia mainly shortens diastole") },
    { k: "Pv", label: L("Налягане на пълнене Pv", "Filling pressure Pv"), min: 3, max: 25, step: 0.5, value: 9.5, d: 1, unit: "mmHg", hint: L("преднатоварване: налягане в белодробните вени", "preload: pulmonary venous pressure") },
    { k: "Ees", label: L("Контрактилитет Ees", "Contractility Ees"), min: 1, max: 5, step: 0.1, value: 2.8, d: 1, unit: "mmHg/mL", hint: L("наклон на ESPVR; ↑ при симпатикус и инотропи", "ESPVR slope; ↑ with sympathetic drive and inotropes") },
    { k: "R", label: L("Периферно съпротивление R", "Peripheral resistance R"), min: 0.5, max: 2.5, step: 0.05, value: 1.1, d: 2, unit: "mmHg·s/mL", hint: L("следнатоварване; норма ≈ 1,1", "afterload; normal ≈ 1.1") },
    { k: "C", label: L("Комплайънс на аортата C", "Aortic compliance C"), min: 0.5, max: 3, step: 0.1, value: 1.2, d: 1, unit: "mL/mmHg", hint: L("↓ с възрастта (скована аорта → по-голямо пулсово налягане)", "↓ with age (stiff aorta → wider pulse pressure)") }
  ];

  const exp = [
    { q: L("Вдигни налягането на пълнене Pv до 16 mmHg (↑преднатоварване). Какво става с ударния обем и крайно-систолния обем?", "Raise the filling pressure Pv to 16 mmHg (↑preload). What happens to stroke volume and end-systolic volume?"),
      opts: [L("SV ↑, ESV се променя малко", "SV ↑, ESV changes little"), L("SV ↓, ESV ↑", "SV ↓, ESV ↑"), L("SV не се променя", "SV does not change")], a: 0, set: { pre: "norm", sl: { Pv: 16 } },
      expl: L("Франк–Старлинг: EDV расте (≈120 → ≈150 mL). ESV расте малко (≈52 → ≈62 mL), защото по-високото аортно налягане спира изтласкването малко по-рано, но SV расте много повече (≈71 → ≈90 mL). Примката се разширява надясно.", "Frank–Starling: EDV rises (≈120 → ≈150 mL). ESV rises a little (≈52 → ≈62 mL), because the higher aortic pressure stops ejection slightly earlier, but SV rises much more (≈71 → ≈90 mL). The loop widens to the right.") },
    { q: L("Включи „Хипертония“. Как се променя PV примката?", "Select “Hypertension”. How does the PV loop change?"),
      opts: [L("По-висока и по-тясна: ESV ↑, SV ↓", "Taller and narrower: ESV ↑, SV ↓"), L("По-ниска и по-широка", "Lower and wider"), L("Само се измества наляво", "It only shifts to the left")], a: 0, set: { pre: "htn" },
      expl: L("Камерата изтласква срещу ≈160 mmHg. Изтласкването свършва по-рано по ESPVR: ESV ≈67 mL, SV ≈60 mL, EF ≈0,47.", "The ventricle ejects against ≈160 mmHg. Ejection ends earlier on the ESPVR: ESV ≈67 mL, SV ≈60 mL, EF ≈0.47.") },
    { q: L("Включи „Симпатикус“. Какво става с ESPVR и ESV?", "Select “Sympathetic drive”. What happens to the ESPVR and ESV?"),
      opts: [L("ESPVR е по-стръмна, ESV ↓, EF ↑", "ESPVR is steeper, ESV ↓, EF ↑"), L("ESPVR е по-полегата, ESV ↑", "ESPVR is flatter, ESV ↑"), L("EDPVR става по-стръмна", "EDPVR becomes steeper")], a: 0, set: { pre: "symp" },
      expl: L("Ees расте (2,8 → 4,2 mmHg/mL): камерата се изпразва по-пълно (ESV ≈42 mL, EF ≈0,62), а с по-високата честота CO става ≈6 L/min.", "Ees rises (2.8 → 4.2 mmHg/mL): the ventricle empties more completely (ESV ≈42 mL, EF ≈0.62), and with the higher rate CO becomes ≈6 L/min.") },
    { q: L("Включи „Аортна стеноза“ и гледай Wiggers диаграмата. Какво се вижда по време на изтласкването?", "Select “Aortic stenosis” and watch the Wiggers diagram. What do you see during ejection?"),
      opts: [L("P_ЛК е много над P_аорта — градиент", "P_LV is far above P_aorta — a gradient"), L("P_аорта е над P_ЛК", "P_aorta is above P_LV"), L("Двете криви съвпадат", "The two curves coincide")], a: 0, set: { pre: "as" },
      expl: L("LVSP ≈180 mmHg при аортно ≈105 mmHg: градиент ≈75 mmHg. Струята през тесния отвор е бърза, а ударният обем леко пада.", "LVSP ≈180 mmHg with aortic ≈105 mmHg: a gradient of ≈75 mmHg. The jet through the narrow orifice is fast and stroke volume falls slightly.") },
    { q: L("Включи „Митрална регургитация“. Какво става с налягането в ЛП и с дебита напред?", "Select “Mitral regurgitation”. What happens to LA pressure and forward output?"),
      opts: [L("P_ЛП ↑ (v-вълна), дебитът напред ↓", "P_LA ↑ (v wave), forward output ↓"), L("P_ЛП ↓, дебитът ↑", "P_LA ↓, output ↑"), L("Без промяна", "No change")], a: 0, set: { pre: "mr" },
      expl: L("В систолата около половината от SV (RF ≈0,5) се връща в ЛП: върхът на P_ЛП расте (≈9 → ≈12 mmHg), а CO пада (≈5 → ≈3,3 L/min), въпреки че EF изглежда висока (≈0,78).", "In systole about half of SV (RF ≈0.5) flows back into the LA: peak P_LA rises (≈9 → ≈12 mmHg) and CO falls (≈5 → ≈3.3 L/min), although EF looks high (≈0.78).") }
  ];

  function view(main) {
    B.i = 0; B.n = 0; ref = null; // ново влизане: без примка от предишното посещение
    const DTM = 1e-4; let lastPre = null, tsim = 0, nextRec = 0;
    const full = (p) => { const pr = PRE[p.pre] || PRE.norm, o = S.full && S.full.__k === p.pre ? S.full : Object.assign(M.params0(), pr.set, { __k: p.pre }); for (const d of SL) o[d.k] = p[d.k]; return (S.full = o); };
    const cfg = {
      key: ID, h2: L("Сърдечен цикъл и PV примка", "Cardiac cycle and PV loop"),
      lead: L("Графиките вървят два пъти по-бавно, а етапите в 3D — още по-бавно.", "The graphs run at half speed and the 3D stages even slower."),
      ch: 340, cw: 640, speed: 0.5, dtmax: DTM,
      sl: SL, pre: PRE, exp,
      init: (p) => { bufReset(); const s = M.init(full(p)); S.s = s; tsim = 0; nextRec = 0; return s; },
      step(s, p, dt) {
        if (!(dt > 0)) return; // първият кадър на rLoop понякога дава dt ≤ 0
        const P = full(p); S.p = P; M.step(s, P, dt); tsim += dt;
        if (tsim >= nextRec) { nextRec = tsim + 0.003; bufPush(tsim, s, inst(s, P, W)); }
      },
      calc: (p, s) => s,
      stats: (p, R, s) => {
        if (!s) return []; const m = s.sum || {}, P = S.full || S.p, d = inst(s, P, {});
        const a = [["EDV / ESV, mL", f(m.EDV, 0) + " / " + f(m.ESV, 0)], [L("Ударен обем", "Stroke volume"), f(m.SV, 0) + " mL"],
          ["EF", f(m.EF * 100, 0) + " %"], [L("Сърдечен дебит", "Cardiac output"), f(m.CO, 1) + " L/min"],
          [L("Аорта, mmHg", "Aorta, mmHg"), f(m.SBP, 0) + "/" + f(m.DBP, 0)], ["LVSP / LVEDP", f(m.LVSP, 0) + " / " + f(m.LVEDP, 0)],
          [L("Ударна работа", "Stroke work"), f(m.SW * 1.333e-4, 2) + " J"]];
        if (P.Rav > 0.01) a.push([L("Градиент, mmHg", "Gradient, mmHg"), f(m.AVgrad, 0)]);
        if (P.Rmr < 1e6) a.push([L("Регургитация", "Regurgitation"), f(m.RF * 100, 0) + " %"], [L("P ЛП макс.", "Peak LA P"), f(m.Pla_max, 0) + " mmHg"]);
        return a;
      },
      note: (p, R, s) => { if (!s) return ""; const P = S.full || S.p, ph = inst(s, P, {}).phase; return P.Rmr < 1e6 && (ph === 1 || ph === 4) ? PHN_MR[ph] : PHN[ph]; },
      legend: `<span><i style="background:${ZCc.red}"></i>${T_(L("налягане в ЛК", "LV pressure"))}</span><span><i style="background:${ZCc.blue}"></i>${T_(L("аорта", "aorta"))}</span><span><i style="background:${ZCc.vio}"></i>${T_(L("ляво предсърдие", "left atrium"))}</span><span><i style="background:${ZCc.teal}"></i>${T_(L("обем ЛК", "LV volume"))}</span><span><i style="background:${ZCc.gray}"></i>ESPVR</span><span><i style="background:${ZCc.grn || "#495057"}"></i>EDPVR</span>`,
      plots, draw
    };
    mkSim(main, cfg);
    // 3D сцената е над картата с плъзгачите
    const card = main.querySelector(".card"), box = document.createElement("div");
    box.innerHTML = typeof wrap3D === "function" ? wrap3D("w3" + ID, innerWidth <= 700 ? Math.min(460, Math.round(innerHeight * 0.62)) : 460) : `<div id="w3${ID}" style="height:460px"></div>`;
    const w3 = box.firstElementChild; card.parentNode.insertBefore(w3, card);
    const get = () => { const P = S.full || S.p; return Object.assign({}, S.s, M.derived(S.s, P), { p: P }); };
    if (window.SEC3D && SEC3D[ID]) { try { const stop = SEC3D[ID].mount(w3, get); if (typeof stop === "function") (window.__cleanups = window.__cleanups || []).push(stop); } catch (e) { console.error(e); } }
  }

  // ---------- ТЕОРИЯ ----------
  const book = {
    title: L("Сърдечен цикъл и PV примка", "Cardiac cycle and PV loop"),
    lead: L("Как налягането, обемът и клапите на лявото сърце се сменят през един удар и как PV примката показва преднатоварването, контрактилитета и следнатоварването.", "How pressure, volume and the valves of the left heart change during one beat, and how the PV loop shows preload, contractility and afterload."),
    adv: L("Guyton & Hall, гл. 9; Boron & Boulpaep, гл. 21", "Guyton & Hall, ch. 9; Boron & Boulpaep, ch. 21"),
    secs: [
      { h: L("Цел", "Goal"), html: "<p>" + L("Да проследиш един сърдечен цикъл в лявото сърце по Wiggers диаграмата и PV примката: кога се отварят и затварят клапите, как се сменят фазите и защо ударният обем зависи от преднатоварването, контрактилитета и следнатоварването.", "To follow one cardiac cycle of the left heart on the Wiggers diagram and the PV loop: when the valves open and close, how the phases follow each other, and why stroke volume depends on preload, contractility and afterload.") + "</p>" },
      { h: L("Норма", "Normal values"), html: "<p>" + L("При 72/min цикълът трае 0,83 s; систолата е ≈ 0,3 s, а диастолата ≈ 0,5 s. Крайният диастолен обем (EDV) е 110–120 mL, крайният систолен (ESV) — 40–50 mL, ударният обем ≈ 70 mL, а фракцията на изтласкване ≈ 0,6. Налягането в аортата е 120/80 mmHg, в ЛК — 120/0–8 mmHg, а в ЛП 0–10 mmHg (a-вълна ≈ 7–8 mmHg). Сърдечният дебит е ≈ 5 L/min.", "At 72/min the cycle lasts 0.83 s; systole is ≈ 0.3 s and diastole ≈ 0.5 s. End-diastolic volume (EDV) is 110–120 mL, end-systolic volume (ESV) 40–50 mL, stroke volume ≈ 70 mL and ejection fraction ≈ 0.6. Aortic pressure is 120/80 mmHg, LV 120/0–8 mmHg and LA 0–10 mmHg (a wave ≈ 7–8 mmHg). Cardiac output is ≈ 5 L/min.") + "</p>" },
      { h: L("Механизъм: фазите", "Mechanism: the phases"), html: "<p>" + L("Клапите се движат пасивно по градиента на налягането. <b>Изоволумично съкращение</b>: камерата се съкращава, митралната клапа се затваря (I тон), аортната още е затворена — налягането расте без промяна на обема. <b>Изтласкване</b>: когато P<sub>ЛК</sub> надмине ≈ 80 mmHg, аортната клапа се отваря; ≈ 70% от кръвта излиза в първата трета (бързо), останалото — бавно. <b>Изоволумична релаксация</b>: аортната клапа се затваря (II тон, инцизура), налягането пада при постоянен обем. <b>Пълнене</b>: щом P<sub>ЛК</sub> падне под P<sub>ЛП</sub>, митралната клапа се отваря; бързо пълнене, диастаза и накрая предсърдна систола, която добавя ≈ 20%.", "The valves move passively along the pressure gradient. <b>Isovolumic contraction</b>: the ventricle contracts, the mitral valve closes (first sound) and the aortic valve is still closed — pressure rises without a change in volume. <b>Ejection</b>: when P<sub>LV</sub> exceeds ≈ 80 mmHg the aortic valve opens; ≈ 70% of the blood leaves in the first third (rapid), the rest slowly. <b>Isovolumic relaxation</b>: the aortic valve closes (second sound, incisura) and pressure falls at constant volume. <b>Filling</b>: as soon as P<sub>LV</sub> drops below P<sub>LA</sub> the mitral valve opens; rapid filling, diastasis and finally atrial systole, which adds ≈ 20%.") + "</p>" + "<p>" + L("<b>PV примка</b>: налягането в ЛК спрямо обема описва затворена крива. Ширината ѝ е ударният обем, площта — ударната работа. Горният ляв ъгъл (краят на систолата) лежи на <b>ESPVR</b>, P = E<sub>es</sub>·(V − V<sub>0</sub>); долният ръб следва пасивната <b>EDPVR</b>.", "<b>PV loop</b>: LV pressure plotted against volume forms a closed curve. Its width is the stroke volume and its area the stroke work. The upper-left corner (end of systole) lies on the <b>ESPVR</b>, P = E<sub>es</sub>·(V − V<sub>0</sub>); the lower edge follows the passive <b>EDPVR</b>.") + "</p>" },
      { h: L("Регулация", "Regulation"), html: "<p>" + L("<b>Преднатоварване</b> (закон на Франк–Старлинг): по-голямото пълнене разтяга саркомерите и камерата изтласква повече — примката се разширява надясно, ESV почти не се мени. <b>Контрактилитет</b>: симпатикусът (норадреналин през β1) прави ESPVR по-стръмна — ESV ↓, EF ↑. <b>Следнатоварване</b>: по-високото аортно налягане спира изтласкването по-рано по същата ESPVR — ESV ↑, SV ↓. <b>Честота</b>: тахикардията скъсява главно диастолата, затова ударният обем намалява постепенно с честотата. Над ≈ 120–150/min (без симпатикус; в модела ≈ 120/min) пада и сърдечният дебит.", "<b>Preload</b> (Frank–Starling law): greater filling stretches the sarcomeres and the ventricle ejects more — the loop widens to the right while ESV barely changes. <b>Contractility</b>: sympathetic drive (noradrenaline via β1) steepens the ESPVR — ESV ↓, EF ↑. <b>Afterload</b>: a higher aortic pressure stops ejection earlier on the same ESPVR — ESV ↑, SV ↓. <b>Rate</b>: tachycardia mainly shortens diastole, so stroke volume falls gradually with rate. Above ≈ 120–150/min (without sympathetic drive; ≈ 120/min in the model) cardiac output falls too.") + "</p>" },
      { h: L("Клиника", "Clinical relevance"), html: "<p>" + L("<b>Аортна стеноза</b>: стесненият отвор изисква голям градиент между ЛК и аортата; хронично води до концентрична хипертрофия, стенокардия и синкоп при усилие. <b>Митрална регургитация</b>: част от ударния обем се връща в ЛП — v-вълна, разширено ЛП, нормална или висока EF при намален дебит напред. <b>Систолна недостатъчност</b>: ниска Ees, ESV ↑, EF ≤ 0,40 (0,41–0,49 — леко намалена). <b>Скована аорта</b> с възрастта: по-малък комплайънс, по-голямо пулсово налягане (изолирана систолна хипертония).", "<b>Aortic stenosis</b>: the narrowed orifice requires a large LV–aorta gradient; chronically it causes concentric hypertrophy, angina and exertional syncope. <b>Mitral regurgitation</b>: part of the stroke volume flows back into the LA — v wave, dilated LA, normal or high EF with reduced forward output. <b>Systolic failure</b>: low Ees, ESV ↑, EF ≤ 0.40 (0.41–0.49 — mildly reduced). <b>Stiff aorta</b> with age: lower compliance, wider pulse pressure (isolated systolic hypertension).") + "</p>" }
    ],
    key: [
      L("Клапите се отварят и затварят пасивно, по градиента на налягането.", "The valves open and close passively, along the pressure gradient."),
      L("EDV ≈ 120 mL, ESV ≈ 50 mL, ударен обем ≈ 70 mL, EF ≈ 0,6.", "EDV ≈ 120 mL, ESV ≈ 50 mL, stroke volume ≈ 70 mL, EF ≈ 0.6."),
      L("Ширината на PV примката е ударният обем, площта е ударната работа.", "The width of the PV loop is the stroke volume; its area is the stroke work."),
      L("Наклонът на ESPVR (Ees) е мярка за контрактилитета; EDPVR — за диастолната скованост.", "The ESPVR slope (Ees) measures contractility; the EDPVR reflects diastolic stiffness."),
      L("↑преднатоварване → SV ↑; ↑следнатоварване → ESV ↑, SV ↓; ↑контрактилитет → ESV ↓.", "↑preload → SV ↑; ↑afterload → ESV ↑, SV ↓; ↑contractility → ESV ↓.")
    ]
  };

  // ---------- ТЕСТ ----------
  const Q = (q, qe, opts, a, expl, ex) => ({ q: L(q, qe), opts: opts.map(o => L(o[0], o[1])), a, expl: L(expl, ex) });
  const tests = [
    Q("Нормалният краен диастолен обем на лявата камера (Guyton) е около:", "The normal end-diastolic volume of the left ventricle (Guyton) is about:", [["40–50 mL", "40–50 mL"], ["70 mL", "70 mL"], ["110–120 mL", "110–120 mL"], ["250 mL", "250 mL"]], 2, "EDV ≈ 110–120 mL, ESV ≈ 40–50 mL, ударният обем ≈ 70 mL.", "EDV ≈ 110–120 mL, ESV ≈ 40–50 mL, stroke volume ≈ 70 mL."),
    Q("Фракцията на изтласкване при EDV 120 mL и ESV 50 mL е:", "The ejection fraction with EDV 120 mL and ESV 50 mL is:", [["≈0,30", "≈0.30"], ["≈0,42", "≈0.42"], ["≈0,58", "≈0.58"], ["≈0,85", "≈0.85"]], 2, "EF = (EDV − ESV)/EDV = 70/120 ≈ 0,58 (≈60%). ≤ 0,40 е систолна недостатъчност с намалена EF (ESC 2021).", "EF = (EDV − ESV)/EDV = 70/120 ≈ 0.58 (≈60%). ≤ 0.40 is heart failure with reduced EF (ESC 2021)."),
    Q("По време на изоволумичното съкращение:", "During isovolumic contraction:", [["Аортната клапа е отворена и обемът намалява", "The aortic valve is open and volume decreases"], ["Двете клапи са затворени, налягането расте, обемът е постоянен", "Both valves are closed, pressure rises, volume is constant"], ["Митралната клапа е отворена", "The mitral valve is open"], ["Налягането в ЛК пада", "LV pressure falls"]], 1, "Митралната клапа вече е затворена, а аортната още не е отворена, защото P_ЛК < P_аорта (≈80 mmHg).", "The mitral valve is already closed and the aortic valve not yet open, because P_LV < P_aorta (≈80 mmHg)."),
    Q("Аортната клапа се отваря, когато налягането в ЛК надмине:", "The aortic valve opens when LV pressure exceeds:", [["≈8 mmHg", "≈8 mmHg"], ["≈80 mmHg (диастолното аортно)", "≈80 mmHg (aortic diastolic)"], ["≈120 mmHg", "≈120 mmHg"], ["≈25 mmHg", "≈25 mmHg"]], 1, "Клапите се движат пасивно по градиента. Аортната се отваря, щом P_ЛК &gt; P_аорта, което в края на диастолата е ≈80 mmHg.", "The valves move passively along the gradient. The aortic valve opens once P_LV &gt; P_aorta, which at the end of diastole is ≈80 mmHg."),
    Q("Митралната клапа се отваря:", "The mitral valve opens:", [["В началото на систолата", "At the start of systole"], ["В края на изоволумичната релаксация, когато P_ЛК падне под P_ЛП", "At the end of isovolumic relaxation, when P_LV falls below P_LA"], ["По време на изтласкването", "During ejection"], ["В края на предсърдната систола", "At the end of atrial systole"]], 1, "Отварянето ѝ бележи началото на бързото пълнене.", "Its opening marks the start of rapid filling."),
    Q("Каква част от кръвта се изтласква през първата трета на изтласкването (Guyton)?", "What fraction of the blood is ejected in the first third of ejection (Guyton)?", [["≈10%", "≈10%"], ["≈30%", "≈30%"], ["≈70%", "≈70%"], ["100%", "100%"]], 2, "Около 70% излиза в първата трета (бързо изтласкване), а 30% — в следващите две трети (бавно изтласкване).", "About 70% leaves in the first third (rapid ejection) and 30% in the next two thirds (reduced ejection)."),
    Q("Площта на PV примката е:", "The area of the PV loop is:", [["Ударният обем", "The stroke volume"], ["Ударната (външна) работа", "The (external) stroke work"], ["Фракцията на изтласкване", "The ejection fraction"], ["Сърдечният дебит", "The cardiac output"]], 1, "Ширината на примката е SV, а площта ∮P·dV е ударната работа (≈7000 mmHg·mL ≈ 0,9 J).", "The loop width is SV and the area ∮P·dV is the stroke work (≈7000 mmHg·mL ≈ 0.9 J)."),
    Q("Наклонът на ESPVR (Ees) отразява:", "The slope of the ESPVR (Ees) reflects:", [["Диастолната скованост", "Diastolic stiffness"], ["Контрактилитета, относително независимо от натоварването", "Contractility, relatively independent of loading"], ["Периферното съпротивление", "Peripheral resistance"], ["Сърдечната честота", "Heart rate"]], 1, "Ees е наклонът на крайно-систолната зависимост налягане–обем. Инотропните средства и симпатикусът го увеличават.", "Ees is the slope of the end-systolic pressure–volume relation. Inotropes and sympathetic drive increase it."),
    Q("При повишено преднатоварване (по-високо налягане на пълнене) при иначе същото сърце:", "With increased preload (higher filling pressure) in an otherwise unchanged heart:", [["EDV ↑ и SV ↑ (Франк–Старлинг)", "EDV ↑ and SV ↑ (Frank–Starling)"], ["EDV ↓ и SV ↓", "EDV ↓ and SV ↓"], ["ESV ↓ силно, EDV без промяна", "ESV ↓ strongly, EDV unchanged"], ["Нищо не се променя", "Nothing changes"]], 0, "Примката се разширява надясно по EDPVR; ESV се променя малко, затова SV расте.", "The loop widens to the right along the EDPVR; ESV changes little, so SV rises."),
    Q("При остро повишено следнатоварване (хипертония):", "With acutely increased afterload (hypertension):", [["ESV ↓, SV ↑", "ESV ↓, SV ↑"], ["ESV ↑, SV ↓", "ESV ↑, SV ↓"], ["EDV ↓, EF ↑", "EDV ↓, EF ↑"], ["Ees ↓", "Ees ↓"]], 1, "Изтласкването спира по-рано, при по-високо налягане по същата ESPVR, затова ESV расте и SV пада.", "Ejection stops earlier, at a higher pressure on the same ESPVR, so ESV rises and SV falls."),
    Q("Предсърдното съкращение повишава ефективността на камерното помпане с около (Guyton):", "Atrial contraction increases the effectiveness of ventricular pumping by about (Guyton):", [["5%", "5%"], ["20%", "20%"], ["50%", "50%"], ["80%", "80%"]], 1, "Около 80% от кръвта минава пасивно, а предсърдията добавят ≈20%. Затова предсърдното мъждене често се понася в покой.", "About 80% of the blood passes passively and the atria add ≈20%. That is why atrial fibrillation is often tolerated at rest."),
    Q("При тахикардия се скъсява предимно:", "Tachycardia mainly shortens:", [["Систолата", "Systole"], ["Диастолата", "Diastole"], ["Двете еднакво", "Both equally"], ["Изоволумичното съкращение", "Isovolumic contraction"]], 1, "Скъсената диастола ограничава пълненето: EDV ↓ и SV ↓. Над определена честота пада и сърдечният дебит.", "The shortened diastole limits filling: EDV ↓ and SV ↓. Above a certain rate cardiac output falls too."),
    Q("При тежка аортна стеноза систолното налягане в ЛК е:", "In severe aortic stenosis the systolic LV pressure is:", [["Равно на аортното", "Equal to aortic pressure"], ["Много по-високо от аортното (трансвалвуларен градиент)", "Much higher than aortic (transvalvular gradient)"], ["По-ниско от аортното", "Lower than aortic"], ["Под 80 mmHg", "Below 80 mmHg"]], 1, "Стесненият отвор изисква голям градиент, за да мине същият поток. Хронично това води до концентрична хипертрофия на ЛК.", "The narrowed orifice requires a large gradient for the same flow. Chronically this leads to concentric LV hypertrophy."),
    Q("При митрална регургитация фракцията на изтласкване често е нормална или висока, защото:", "In mitral regurgitation the ejection fraction is often normal or high because:", [["Контрактилитетът винаги расте", "Contractility always increases"], ["Част от SV отива назад в ЛП с ниско налягане, а напред излиза по-малко", "Part of SV goes back into the low-pressure LA and less goes forward"], ["Аортната клапа е стеснена", "The aortic valve is narrowed"], ["EDV пада до нула", "EDV falls to zero"]], 1, "Камерата се изпразва и към ЛП (ниско следнатоварване), затова ESV ↓ и EF ↑, но ударният обем напред и дебитът падат.", "The ventricle also empties into the LA (low afterload), so ESV ↓ and EF ↑, but forward stroke volume and output fall.")
  ];

  // ---------- РЕЧНИК ----------
  const G = (t, te, re, d, de) => ({ t: L(t, te), re, d: L(d, de) });
  const gl = [
    G("Изоволумично съкращение", "Isovolumic contraction", "изоволум[а-я]* съкращени[ея]", "Начало на систолата: двете клапи са затворени, налягането в камерата расте, обемът е постоянен (Guyton: 0,02–0,03 s; в модела ≈ 0,1 s).", "Start of systole: both valves are closed, ventricular pressure rises and volume is constant (Guyton: 0.02–0.03 s; ≈ 0.1 s in the model)."),
    G("Краен диастолен обем (EDV)", "End-diastolic volume (EDV)", "кра[ейн][а-я]*[ -]диастол[а-я]* обем[а-я]*|EDV", "Обемът на камерата в края на пълненето, ≈110–120 mL. Мярка за преднатоварването.", "Ventricular volume at the end of filling, ≈110–120 mL. A measure of preload."),
    G("Краен систолен обем (ESV)", "End-systolic volume (ESV)", "кра[ейн][а-я]*[ -]систол[а-я]* обем[а-я]*|ESV", "Обемът, останал в камерата след изтласкването, ≈40–50 mL.", "The volume left in the ventricle after ejection, ≈40–50 mL."),
    G("Фракция на изтласкване", "Ejection fraction", "фракци[яи]т?[а-я]* на изтласкване|EF\\b", "SV/EDV, нормално ≈0,55–0,65. Индекс на систолната функция.", "SV/EDV, normally ≈0.55–0.65. An index of systolic function."),
    G("Преднатоварване", "Preload", "преднатоварван[а-я]*|предобременяван[а-я]*|preload", "Разтягането на камерата в края на диастолата (EDV или крайно-диастолното налягане).", "Ventricular stretch at the end of diastole (EDV or end-diastolic pressure)."),
    G("Следнатоварване", "Afterload", "следнатоварван[а-я]*|следобременяван[а-я]*|afterload", "Налягането (съпротивлението), срещу което камерата изтласква кръвта; главно аортното налягане.", "The pressure (resistance) against which the ventricle ejects; mainly aortic pressure."),
    G("ESPVR", "ESPVR", "ESPVR|крайно-систолн[а-я]* зависимост", "Крайно-систолна зависимост налягане–обем: P = Ees·(V − V0). Наклонът Ees е индекс на контрактилитета.", "End-systolic pressure–volume relation: P = Ees·(V − V0). The slope Ees is an index of contractility."),
    G("EDPVR", "EDPVR", "EDPVR|крайно-диастолн[а-я]* зависимост", "Пасивна (експоненциална) диастолна зависимост налягане–обем; по-стръмна при скована камера.", "Passive (exponential) diastolic pressure–volume relation; steeper in a stiff ventricle."),
    G("Закон на Франк–Старлинг", "Frank–Starling law", "Франк[ -–]+Старлинг[а-я]*", "Колкото повече се пълни камерата, толкова по-силно се съкращава; сърцето изпомпва толкова, колкото му се връща.", "The more the ventricle fills, the more forcefully it contracts; the heart pumps what returns to it."),
    G("Windkessel", "Windkessel", "Windkessel|уиндкесел[а-я]*|вятърн[а-я]* котел", "Модел на аортата като еластичен резервоар (C) и периферно съпротивление (R): поема удара в систола и поддържа налягането в диастола.", "Model of the aorta as an elastic reservoir (C) and peripheral resistance (R): absorbs the stroke in systole and maintains pressure in diastole.")
  ];

  // текстове от общото ядро на mkSim и 3D етикетите, които може да не са в __EN
  L("Сърдечен цикъл", "Cardiac cycle"); L("Сърдечен цикъл и PV примка — PhysioNova", "Cardiac cycle and PV loop — PhysioNova"); L("ESPVR", "ESPVR"); L("EDPVR", "EDPVR"); L("EDV / ESV, mL", "EDV / ESV, mL"); L("LVSP / LVEDP", "LVSP / LVEDP"); L("EF", "EF"); L("забавено ×0,5", "slowed ×0.5");
  zRegister(ID, { name: L("Сърдечен цикъл и PV примка", "Cardiac cycle and PV loop"), view, book, tests, exp, gl, en: EN });
})();
