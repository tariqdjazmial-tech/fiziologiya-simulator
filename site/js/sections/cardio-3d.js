/* ===== cardio: 3D — ляво сърце в разрез по дългата ос (3-камерен изглед). САМО рендерира getState(). =====
   Модел: HuBMAP HRA сърце (m/hglb1.txt + m/hglb2.txt, същите файлове като heart3d; не се дублират), истински мащаб
   (1 единица ≈ 3,7 cm). Режим „Опростен“ (MK.real=false): процедурни ЛК/ЛП/аорта на същите места.
   Платната на клапите са процедурни (митрална: 2 платна + хорди към 2 папиларни мускула; аортна: 3 полулунни),
   поставени на пръстените от HRA модела.
   Вход всеки кадър (spec.json state/derived): tc, T, V_lv, V_la, P_ao, P_lv, P_la, Q_mv, Q_av, Q_pv, e_lv, e_la,
   mv_open, av_open, phase, EDV, ESV, SW, LVSP, AVgrad, RF и p:{HR, Ees, V0, A, k, Rav, Rmr}.
   3D само записва последния завършен цикъл от getState() и го пуска забавено за всеки етап (прозорец по phase).
   SEC3D.cardio.mount(wrap, getState) → stop: заменя wrap с поетапен изглед (stageViewer) на същото място.
   SEC3D.cardio.stage — същият изглед като cfg за zRegister({stage}) (чете window.__S.cardio / __M.cardio). */
(function () {
  "use strict";
  const ID = "cardio";
  const EN = {}, L = (bg, en) => { EN[bg] = en; return bg; };
  const TT = s => (typeof window.T === "function" ? window.T(s) : s);
  const isEN = () => window.PHYS_LANG === "en";
  const fx = (x, d) => { const s = (isFinite(x) ? +x : 0).toFixed(d); return isEN() ? s : s.replace(".", ","); };
  const fill = (tpl, a, b, c) => { let i = 0; const v = [a, b, c]; return tpl.replace(/#/g, () => (i < 3 && v[i] != null ? v[i++] : "#")); };
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const sm = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const tab = (X, Y, x) => { const n = X.length - 1; if (x <= X[0]) return Y[0]; if (x >= X[n]) return Y[n]; let i = 1; while (X[i] < x) i++; return Y[i - 1] + (Y[i] - Y[i - 1]) * (x - X[i - 1]) / (X[i] - X[i - 1]); };
  const LOW = () => (typeof LOWGPU !== "undefined" && !!LOWGPU);

  // ---------- цветове (ZC / 3D_API.md; без зелено и жълто) ----------
  const C = { red: "#e03131", dark: "#7a1a1a", blue: "#1c7ed6", vio: "#9c36b5", teal: "#0c8599", pink: "#c2566b", org: "#e8590c", gray: "#868e96", g2: "#495057" };

  // ---------- ориентири в света на сцената (изчислени от HRA: разрез през върха, митралния и аортния пръстен; z = към зрителя) ----------
  const LM = {
    apex: [1.295, -1.243, 0], mv: [-0.73, 0.159, 0.036], mvN: [0.869, -0.495, -0.017], av: [-0.466, 0.918, -0.013], avN: [-0.12, 0.985, -0.13], la: [-1.073, 0.812, -0.16],
    ao: [[-0.466, 0.918, -0.013], [-0.485, 1.247, -0.046], [-0.57, 1.555, -0.099], [-0.55, 1.839, -0.254], [-0.624, 1.973, -0.531], [-0.709, 2.179, -0.802], [-0.878, 2.086, -1.092],
      [-1.144, 1.995, -1.273], [-1.374, 1.761, -1.18], [-1.635, 1.65, -1.06], [-1.825, 1.403, -0.88], [-1.935, 1.188, -0.657], [-2.027, 0.955, -0.458], [-1.968, 0.683, -0.28], [-1.997, 0.439, -0.071]],
    br: [[[-0.66, 2.15, -0.8], [-0.69, 2.95, -1.05]], [[-0.8, 2.12, -1.1], [-0.74, 2.85, -1.55]], [[-1.05, 2.05, -1.25], [-1.08, 2.7, -1.75]]],
    pv: [[[-1.743, 1.304, 0.847], [-1.619, 1.009, 0.423]], [[-1.414, 1.505, 0.977], [-1.186, 1.557, 0.456]], [[-1.47, 0.088, -0.734], [-1.526, 0.556, -0.347]], [[-0.911, 1.046, -1.328], [-0.969, 0.778, -0.945]]],
    pap: [[[0.017, -0.285, -0.25], [-0.19, -0.07, -0.23]], [[-0.004, -0.493, -0.1], [-0.19, -0.36, -0.1]]],
    // HRA → сцена: w = [ex,ey,ez]·(s·(p − cen) − c0)
    XF: { cen: [0.018727120012044907, 0.4760887771844864, 0.03758065542206168], s: 26.79917479490788, c0: [0.39905324143668014, -0.1531730641921361, 0.10140831458071867],
      ex: [0.17400707797449144, 0, 0.9847444017686922], ey: [-0.6325464925010678, 0.7664148957326489, 0.11177272665417833], ez: [-0.7547227780048618, -0.6423458629111836, 0.13336161652256276] }
  };
  const RC_U = [0, 0.05, 0.15, 0.3, 0.5, 0.7, 0.9, 1, 1.15], RC_R = [0, 0.15, 0.3, 0.41, 0.48, 0.52, 0.52, 0.48, 0.42];       // кухина на ЛК (HRA, ED)
  const RE_U = [-0.05, 0, 0.1, 0.25, 0.45, 0.65, 0.85, 1, 1.04], RE_R = [0, 0.25, 0.5, 0.66, 0.76, 0.8, 0.8, 0.72, 0.6];      // епикард (опростен)
  const LA_H = [0, 0.2, 0.5, 0.8, 1.1, 1.3, 1.45], LA_R = [0.44, 0.58, 0.72, 0.74, 0.62, 0.38, 0];                           // ЛП от пръстена нагоре
  const Rc = u => tab(RC_U, RC_R, u), RLa = h => tab(LA_H, LA_R, h);

  // ---------- текстове (BG → EN) ----------
  const TX = {
    title: L("Сърдечен цикъл в 3D: лявото сърце", "Cardiac cycle in 3D: the left heart"),
    intro: L("Разрез по дългата ос на ЛК (модел HuBMAP HRA, истински мащаб). Частиците са маркери на кръвта (≈3 mL всяка), не еритроцити. Всяка фаза се пуска забавено от последния цикъл на модела.",
      "Long-axis cut through the LV (HuBMAP HRA model, true scale). The particles are blood markers (≈3 mL each), not red cells. Each phase is replayed in slow motion from the model's last cycle."),
    mA: L("Фазите", "The phases"), mB: L("Криви и клапи", "Curves and valves"), cA: L("Един удар", "One beat"), cB: L("Wiggers, PV, патология", "Wiggers, PV, pathology"),
    lv: L("ЛК", "LV"), la: L("ЛП", "LA"), ao: L("Аорта", "Aorta"), mvl: L("Митрална клапа", "Mitral valve"), avl: L("Аортна клапа", "Aortic valve"), pvl: L("Бел. вени", "Pulm. veins"),
    pLV: L("P ЛК # mmHg", "LV P # mmHg"), pAO: L("P ао # mmHg", "Ao P # mmHg"), pLA: L("P ЛП # mmHg", "LA P # mmHg"), qMV: L("Q митр. # mL/s", "Q mitral # mL/s"), qAV: L("Q аорт. # mL/s", "Q aortic # mL/s"),
    grad: L("градиент # mmHg", "gradient # mmHg"), rf: L("регург. # %", "regurg. # %"), back: L("обратна струя", "backflow jet"),
    slow: L("забавено ×# · t = # s", "slowed ×# · t = # s"), live: L("на живо · t = # s", "live · t = # s"), rec: L("запис на цикъла…", "recording the cycle…"),
    hint: L("избери пресет „Аортна стеноза“ или „Митрална регургитация“", "choose the “Aortic stenosis” or “Mitral regurgitation” preset"),
    phase: L("Фаза #", "Phase #"), sPh: L("Фаза", "Phase"), sV: L("Обем ЛК", "LV volume"), sP: L("P ЛК / аорта", "LV / aortic P"), sPla: L("P ЛП", "LA P"), sQ: L("Q митр. / аорт.", "Q mitral / aortic"),
    sSV: L("Ударен обем", "Stroke volume"), sSW: L("Ударна работа", "Stroke work"), sEF: L("EF", "EF"), sGr: L("Градиент ЛК–аорта", "LV–aorta gradient"), sRF: L("Регургитантна фракция", "Regurgitant fraction"),
    wT: L("Wiggers: ЛК, аорта, ЛП", "Wiggers: LV, aorta, LA"), pvT: L("PV примка на ЛК", "LV PV loop"), Vlv: L("V ЛК", "LV V"), Plv: L("P ЛК", "LV P"), Pao: L("P ао", "Ao P"), Pla: L("P ЛП", "LA P"),
    vax: L("обем ЛК, mL", "LV volume, mL"), pax: L("P ЛК, mmHg", "LV P, mmHg"), sv: L("SV = # mL", "SV = # mL"), sw: L("SW = # J", "SW = # J"), vw: L("v-вълна", "v wave"), aw: L("a-вълна", "a wave"),
    gr: L("градиент", "gradient"), prev: L("преди", "before")
  };
  const PH = ["", L("изоволумично съкращение", "isovolumic contraction"), L("бързо изтласкване", "rapid ejection"), L("бавно изтласкване", "reduced ejection"),
    L("изоволумична релаксация", "isovolumic relaxation"), L("бързо пълнене", "rapid filling"), L("диастаза", "diastasis"), L("предсърдна систола", "atrial systole")];
  const LEG = [[C.red, L("кръв, P ЛК", "blood, LV P")], [C.pink, L("регургитация", "regurgitation")], [C.vio, L("ЛП, P ЛП", "LA, LA P"), "box"], [C.blue, L("аорта, P ао", "aorta, Ao P"), "box"],
    [C.teal, L("обем ЛК (контур)", "LV volume (contour)")], [C.gray, L("клапи, ESPVR", "valves, ESPVR"), "box"], [C.org, L("бел. вени, EDPVR", "pulm. veins, EDPVR"), "box"]];
  LEG.forEach(([c, bg, sh]) => { const i = `<i class="${sh || "dot"}" style="background:${c}"></i>`; EN[i + bg] = i + EN[bg]; });   // i18n превежда целия <span>
  // етапите — от spec.json (t, short, badge, d)
  const SD = [
    ["Бързо и бавно пълнене", "Rapid and slow filling", "Пълнене", "Filling", "1",
      "Налягането в ЛК пада под това в ЛП и <b>митралната клапа се отваря</b>. През първата трета на диастолата кръвта нахлува бързо, после притокът почти спира (диастаза). Аортната клапа е затворена, а аортата се свива и поддържа налягането.",
      "LV pressure falls below LA pressure and <b>the mitral valve opens</b>. In the first third of diastole blood rushes in, then inflow almost stops (diastasis). The aortic valve is closed, and the aorta recoils and maintains the pressure."],
    ["Предсърдна систола", "Atrial systole", "Предсърдие", "Atrium", "2",
      "В края на диастолата ЛП се съкращава (a-вълна, 7–8 mmHg) и довършва пълненето. Добавя около 20% от ударния обем — ЛК достига крайния диастолен обем (≈120 mL).",
      "At the end of diastole the LA contracts (a wave, 7–8 mmHg) and completes filling. It adds about 20% of the stroke volume — the LV reaches its end-diastolic volume (≈120 mL)."],
    ["Изоволумично съкращение", "Isovolumic contraction", "Изоволумно", "Isovolumic", "3",
      "Камерата започва да се съкращава и <b>митралната клапа се затваря</b> (първи тон). И двете клапи са затворени: обемът не се променя, а налягането в ЛК бързо расте до ≈80 mmHg.",
      "The ventricle begins to contract and <b>the mitral valve closes</b> (first heart sound). Both valves are closed: the volume does not change, while LV pressure rises rapidly to ≈80 mmHg."],
    ["Бързо и бавно изтласкване", "Rapid and reduced ejection", "Изтласкване", "Ejection", "4",
      "Когато P<sub>ЛК</sub> надмине аортното (≈80 mmHg), <b>аортната клапа се отваря</b>. Около 70% от кръвта излиза в първата трета на изтласкването (бързо), останалото — по-бавно. Налягането в аортата стига ≈120 mmHg и стената ѝ се разтяга.",
      "When P<sub>LV</sub> exceeds aortic pressure (≈80 mmHg), <b>the aortic valve opens</b>. About 70% of the blood leaves in the first third of ejection (rapid), the rest more slowly. Aortic pressure reaches ≈120 mmHg and its wall stretches."],
    ["Изоволумична релаксация", "Isovolumic relaxation", "Релаксация", "Relaxation", "5",
      "Камерата се отпуска, налягането пада и <b>аортната клапа се затваря</b> (втори тон, инцизура). И двете клапи са затворени, обемът остава ≈50 mL (ESV), а P<sub>ЛК</sub> спада до под налягането в ЛП.",
      "The ventricle relaxes, pressure falls and <b>the aortic valve closes</b> (second heart sound, incisura). Both valves are closed, the volume stays ≈50 mL (ESV), and P<sub>LV</sub> drops below LA pressure."],
    ["Wiggers диаграма", "Wiggers diagram", "Wiggers", "Wiggers", "t",
      "Наляганията в ЛК, аортата и ЛП и обемът на ЛК през един цикъл. Клапите се отварят и затварят там, където кривите се пресичат. Маркерът показва текущия момент и фазата.",
      "Pressures in the LV, aorta and LA and the LV volume over one cycle. The valves open and close where the curves cross. The marker shows the current moment and phase."],
    ["PV примка: ESPVR и EDPVR", "PV loop: ESPVR and EDPVR", "PV примка", "PV loop", "PV",
      "Налягането спрямо обема на ЛК описва примка: ширината ѝ е ударният обем, площта — ударната работа. Горният ляв ъгъл лежи на ESPVR (наклон E<sub>es</sub>, контрактилитет), долният ръб — на EDPVR (скованост).",
      "LV pressure plotted against volume traces a loop: its width is the stroke volume, its area the stroke work. The upper-left corner lies on the ESPVR (slope E<sub>es</sub>, contractility), the lower edge on the EDPVR (stiffness)."],
    ["Патология: стеноза и регургитация", "Pathology: stenosis and regurgitation", "Клапи", "Valves", "!",
      "При аортна стеноза ЛК развива много по-високо налягане от аортата (градиент). При митрална регургитация част от кръвта се връща в ЛП по време на систолата: ЛП се раздува (v-вълна), а дебитът напред пада.",
      "In aortic stenosis the LV develops a much higher pressure than the aorta (gradient). In mitral regurgitation part of the blood returns to the LA during systole: the LA distends (v wave) and forward output falls."]
  ];
  const STG = SD.map(a => { L(a[0], a[1]); L(a[2], a[3]); L(a[5], a[6]); EN["#. " + a[0]] = "#. " + a[1]; EN["#. " + a[2]] = "#. " + a[3]; return { t: a[0], short: a[2], badge: a[4], d: a[5] }; });
  // етап → фази за забавения прозорец (spec: phase 1–7)
  const WIN = [[5, 6], [7], [1], [2, 3], [4], null, null, null];

  // ---------- MOCK: само докато моделът липсва; нормата от spec.json (EDV 123, ESV 52, 118/76, HR 72) ----------
  const MO = { p: { HR: 72, Pv: 9.5, Ees: 2.8, R: 1.1, C: 1.2, V0: 10, A: 0.6, k: 0.024, Rav: 0.004, Rmv: 0.004, Rmr: 1e9 } };
  function MOCK() {
    const T = 60 / 72, tc = (performance.now() / 1000 * 0.5) % T, x = tc / T, b = [0, 0.06, 0.17, 0.36, 0.45, 0.6, 0.81, 1];
    let ph = 1; while (ph < 7 && x >= b[ph]) ph++;
    const t = (x - b[ph - 1]) / (b[ph] - b[ph - 1]), E = 123, S = 52, o = MO;
    let V, P, Pao, Pla, Qm = 0, Qa = 0, Vla;
    if (ph === 1) { V = E; P = 8 + 72 * t * t; Pao = 77 - t; }
    else if (ph === 2) { V = E - 50 * (1 - Math.pow(1 - t, 1.5)); P = 80 + 40 * Math.sin(t * Math.PI / 2); Pao = P - 3; Qa = 520 * Math.sin(Math.PI * (0.2 + 0.8 * t) / 1.2); }
    else if (ph === 3) { V = E - 50 - 21 * (1 - Math.pow(1 - t, 1.5)); P = 120 - 22 * t; Pao = P - 2; Qa = 380 * Math.pow(1 - t, 1.2); }
    else if (ph === 4) { V = S; P = 98 * Math.pow(1 - t, 2) + 4 * t; Pao = 96 - 5 * Math.sin(Math.PI * t) + 2 * t; }
    else { const td = (x - 0.45) / 0.55; Pao = 76 + 22 * Math.exp(-2.2 * td); if (ph === 5) { V = S + 48 * (1 - Math.pow(1 - t, 2)); P = 4 - t; Qm = 450 * Math.sin(Math.PI * t); } else if (ph === 6) { V = 100 + 4 * t; P = 3 + 1.5 * t; Qm = 25; } else { V = 104 + 19 * Math.pow(Math.sin(Math.PI * t / 2), 2); P = 4.5 + 3.5 * Math.sin(Math.PI * t / 2); Qm = 220 * Math.sin(Math.PI * t); } }
    if (x < 0.45) { Pla = 6 + 4 * x / 0.45; Vla = 40 + 22 * x / 0.45; } else if (x < 0.81) { const q = (x - 0.45) / 0.36; Pla = 10 - 5 * Math.min(1, q * 2); Vla = 62 - 20 * Math.min(1, q * 1.6); } else { Pla = 5 + 3 * Math.sin(Math.PI * t); Vla = 42 - 4 * Math.sin(Math.PI * t / 2); }
    Object.assign(o, { tc, T, V_lv: V, V_la: Vla, P_lv: P, P_ao: Pao, P_la: Pla, Q_mv: Qm, Q_av: Qa, Q_pv: 70 + 50 * Math.sin(2 * Math.PI * x), phase: ph, mv_open: ph >= 5 ? 1 : 0, av_open: ph === 2 || ph === 3 ? 1 : 0,
      e_lv: x < 0.45 ? Math.pow(Math.sin(Math.PI * x / 0.45), 2) : 0, e_la: ph === 7 ? Math.sin(Math.PI * t) : 0, EDV: E, ESV: S, SV: E - S, SW: 7100, LVSP: 120, SBP: 118, DBP: 76, AVgrad: 2, RF: 0, Pla_max: 10 });
    return o;
  }
  function defGet() {
    try {
      const S = window.__S && window.__S[ID], M = window.__M && window.__M[ID];
      if (S && S.s && M && M.derived) { const P = S.full || S.p; return Object.assign({}, S.s, M.derived(S.s, P), { p: P }); }
    } catch (e) { /* пада на MOCK */ }
    return MOCK();
  }

  // ---------- запис на последния цикъл (само копие на getState по бинове на tc) ----------
  const RF = ["V_lv", "V_la", "P_lv", "P_ao", "P_la", "Q_mv", "Q_av", "Q_pv", "e_lv", "e_la", "mv_open", "av_open", "phase"], DISC = { mv_open: 1, av_open: 1, phase: 1 };
  const NB = 180;
  function mkBuf() { const f = {}; RF.forEach(k => { f[k] = new Float32Array(NB); }); return { f, hit: new Uint8Array(NB), n: 0, T: 0.833, ok: false, ver: 0, win: [] }; }
  const num = (v, d) => (typeof v === "number" && isFinite(v) ? v : d);
  function sig(p) { if (!p) return 0; return num(p.HR, 72) * 1.31 + num(p.Pv, 9) * 7.1 + num(p.Ees, 2.8) * 13.7 + num(p.R, 1.1) * 31.3 + num(p.C, 1.2) * 17.9 + num(p.Rav, 0.004) * 1009 + Math.min(num(p.Rmr, 1e9), 1e4) * 0.37 + num(p.A, 0.6) * 3.3 + num(p.k, 0.024) * 977 + num(p.V0, 10) * 0.71; }
  function record(ctx, r) {
    const R = ctx.rec, T = num(r.T, 60 / num(r.p && r.p.HR, 72)), tc = num(r.tc, 0), sg = sig(r.p);
    if (sg !== ctx.sig) { if (ctx.sig != null && ctx.play.ok) { ctx.ghost.V.set(ctx.play.f.V_lv); ctx.ghost.P.set(ctx.play.f.P_lv); ctx.ghost.ok = true; } ctx.sig = sg; R.dirty = true; }
    if (tc < ctx.lastTc - 1e-6) finalize(ctx, R);
    if (tc === ctx.lastTc) return;
    ctx.lastTc = tc; R.T = T;
    const b = clamp(Math.floor(tc / T * NB), 0, NB - 1);
    for (let j = 0; j < RF.length; j++) { const k = RF[j]; R.f[k][b] = num(r[k], 0); }
    if (!R.hit[b]) { R.hit[b] = 1; R.n++; }
  }
  function finalize(ctx, R) {
    let first = -1, last = -1; for (let b = 0; b < NB; b++) if (R.hit[b]) { if (first < 0) first = b; last = b; }
    if (!R.dirty && R.n >= 14 && first <= NB * 0.12 && last >= NB * 0.88) {
      // празните бинове: линейно между съседните записани (дискретните — предишната стойност)
      for (let j = 0; j < RF.length; j++) {
        const a = R.f[RF[j]], disc = DISC[RF[j]]; let prev = last;
        for (let b = 0; b < NB; b++) {
          if (R.hit[b]) { prev = b; continue; }
          let nx = b; while (!R.hit[nx % NB] && nx < b + NB) nx++; nx %= NB;
          const span = ((nx - prev) + NB) % NB || NB, w = (((b - prev) + NB) % NB) / span;
          a[b] = disc ? a[prev] : a[prev] + (a[nx] - a[prev]) * w;
        }
      }
      const P = ctx.play; ctx.play = R; ctx.rec = P;
      R.ok = true; R.ver = (P.ver || 0) + 1; R.win = WIN.map(set => winFor(R, set));
      P.ok = false; P.dirty = false; P.hit.fill(0); P.n = 0; return;
    }
    R.hit.fill(0); R.n = 0; R.dirty = false;
  }
  function winFor(B, set) {
    const T = B.T, dtb = T / NB; if (!set) return [0, T];
    const ph = B.f.phase, inS = b => set.indexOf(Math.round(ph[(b + NB) % NB])) >= 0;
    let s0 = -1; for (let b = 0; b < NB; b++) if (!inS(b)) { s0 = b; break; }
    if (s0 < 0) return [0, T];
    let best = 0, bs = 0;
    for (let k = 0; k < NB; k++) { const b = (s0 + k) % NB; if (inS(b) && !inS(b - 1)) { let n = 0; while (n < NB && inS(b + n)) n++; if (n > best) { best = n; bs = b; } } }
    if (!best) return [0, T];
    const len = best * dtb, m = clamp(0.25 * len, 0.025, 0.06);
    return [((bs * dtb - m) % T + T) % T, len + 2 * m];
  }

  // ---------- cfg за stageViewer ----------
  function mkCfg(H, id, h) {
    return {
      id, title: TX.title, intro: TX.intro, h: h || 460, dur: 5,
      cam: { r: 8.2, th: 0.12, phi: 1.42, target: [-0.38, 0.72, 0], min: 2.5, max: 22, fov: 38 },
      foc: {
        cyc: [[-0.5, 0.2, 0, 4.9, 0.2, 1.42], [-0.95, 0.7, -0.1, 4.7, -0.12, 1.38], [0.15, -0.2, 0, 5.4, 0.22, 1.48], [-0.45, 1.05, -0.05, 4.9, 0.1, 1.38], [0.05, -0.05, 0, 5.6, 0.25, 1.48]],
        curves: [[-3.3, 0.72, 0, 9.2, 0.1, 1.45], [-3.3, 0.72, 0, 9.2, 0.1, 1.45], [-3.3, 0.6, 0, 9.2, 0.1, 1.45]]
      },
      legend: LEG,
      mechs: [{ key: "cyc", label: TX.mA, center: TX.cA, stages: STG.slice(0, 5) }, { key: "curves", label: TX.mB, center: TX.cB, stages: STG.slice(5) }],
      build(G, T, ctx) { build(G, T, ctx, H); },
      update(ctx, i, u, dt) { if (!ctx.dead && !H.dead) update(ctx, i, u, dt); },
      labels(ctx, i) { return ctx.dead || !ctx.labOut ? [] : ctx.labOut; },
      stats(ctx, i) { return ctx.dead ? [] : stats(ctx, i); }
    };
  }

  // ---------- изграждане ----------
  function build(G, T, ctx, H) {
    H.ctx = ctx; ctx.H = H; if (window.SEC3D && SEC3D[ID]) SEC3D[ID]._ctx = ctx; ctx.get = () => (H.get ? H.get() : defGet());
    (window.__cleanups = window.__cleanups || []).push(() => dispose(ctx));
    if (typeof MK !== "undefined") { try { MK.usedView = typeof curView !== "undefined" ? curView : location.hash; } catch (e) { /* без превключвател */ } }
    const low = LOW(), sc = G.scene, V3 = a => new T.Vector3(a[0], a[1], a[2]);
    G.ren.localClippingEnabled = true; G.ren.toneMappingExposure = 1.08;
    ctx.low = low; ctx.rec = mkBuf(); ctx.play = mkBuf(); ctx.ghost = { V: new Float32Array(NB), P: new Float32Array(NB), ok: false }; ctx.lastTc = -1; ctx.sig = null;
    ctx.S = {}; ctx.frame = 0; ctx.tl = 0; ctx.hold = 0; ctx.stgKey = -1; ctx.om = 0; ctx.oa = 0; ctx.defKey = -1; ctx.defN = 0;
    // рамки
    const A = V3(LM.apex), mv = V3(LM.mv), av = V3(LM.av), la = V3(LM.la), ez = new T.Vector3(0, 0, 1);
    const ax = mv.clone().sub(A), Lv = ax.length(); ax.normalize();
    const e1 = ez.clone().cross(ax).normalize(), q2 = ez.clone().negate().addScaledVector(ax, ax.z).normalize();          // q2: назад (зад разреза)
    const nM = V3(LM.mvN).normalize(), e1M = av.clone().sub(mv); e1M.addScaledVector(nM, -e1M.dot(nM)).normalize(); const e2M = nM.clone().cross(e1M).normalize();
    const nA = V3(LM.avN).normalize(), f1 = ez.clone().addScaledVector(nA, -nA.z).normalize(), f2 = nA.clone().cross(f1).normalize();
    const yL = la.clone().sub(mv).normalize(), q2L = ez.clone().negate().addScaledVector(yL, yL.z).normalize(), q1L = yL.clone().cross(q2L).normalize();
    Object.assign(ctx, { A, mv, av, la, ax, Lv, e1, q2, nM, e1M, e2M, nA, f1, f2, yL, q1L, q2L,
      dMV: new T.Vector3(), dAV: new T.Vector3(), avD: new T.Vector3(), mvD: new T.Vector3(), tv: new T.Vector3(), tv2: new T.Vector3(), tv3: new T.Vector3(), tv4: new T.Vector3(),
      sR: 1, sL: 1, sLa: 1, dl: 0 });
    // крива на аортата (таблица от точки и рамки — без заемане на памет в кадъра)
    const aoC = new T.CatmullRomCurve3(LM.ao.map(V3)), NA = 64, aoP = new Float32Array((NA + 1) * 3), aoN = new Float32Array((NA + 1) * 3), aoB = new Float32Array((NA + 1) * 3);
    const fr = aoC.computeFrenetFrames(NA, false);
    for (let i = 0; i <= NA; i++) { const p = aoC.getPointAt(i / NA); aoP.set([p.x, p.y, p.z], 3 * i); aoN.set([fr.normals[i].x, fr.normals[i].y, fr.normals[i].z], 3 * i); aoB.set([fr.binormals[i].x, fr.binormals[i].y, fr.binormals[i].z], 3 * i); }
    Object.assign(ctx, { aoC, aoP, aoN, aoB, NA });
    ctx.clip = new T.Plane(new T.Vector3(0, 0, -1), 0);       // остава z ≤ 0 (разрезът е към зрителя)
    // материали
    const M = ctx.M = {};
    const tissue = (hex, o) => { const m = new T.MeshPhysicalMaterial(Object.assign({ color: LIN(T, hex), roughness: 0.52, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.4, side: T.DoubleSide, clippingPlanes: [ctx.clip] }, o || {}));
      m.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace("#include <dithering_fragment>", "#include <dithering_fragment>\n if(!gl_FrontFacing) gl_FragColor.rgb *= 0.5;"); }; return m; };
    M.lv = tissue(C.red); M.lv.color.multiplyScalar(0.62); M.lv.emissive = LIN(T, C.red); M.lv.emissiveIntensity = 0.04;
    M.la = tissue(C.vio); M.la.color.multiplyScalar(0.78); M.la.emissive = LIN(T, C.vio); M.la.emissiveIntensity = 0.03;
    M.ao = tissue(C.blue, { roughness: 0.45 }); M.pv = tissue(C.org);
    M.valve = new T.MeshPhysicalMaterial({ color: LIN(T, C.gray), roughness: 0.6, clearcoat: 0.2, side: T.DoubleSide, clippingPlanes: [ctx.clip], transparent: true, opacity: 0.96 });
    M.valve.color.multiplyScalar(1.7); M.valve.emissive = LIN(T, C.gray); M.valve.emissiveIntensity = 0.25;
    M.chord = new T.LineBasicMaterial({ color: LIN(T, C.gray), clippingPlanes: [ctx.clip] });
    M.blood = new T.MeshStandardMaterial({ color: LIN(T, C.dark), roughness: 0.4, transparent: true, opacity: 0.3, depthWrite: false, side: T.DoubleSide, clippingPlanes: [ctx.clip] });
    M.cont = new T.MeshBasicMaterial({ color: LIN(T, C.teal) });
    M.part = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0 });
    M.part.onBeforeCompile = s => { s.fragmentShader = s.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n#ifdef USE_COLOR\n totalEmissiveRadiance += vColor * 0.55;\n#endif"); };
    ctx.col = { red: LIN(T, C.red), dark: LIN(T, C.dark), pink: LIN(T, C.pink), vio: LIN(T, C.vio), c: new T.Color(), lv: new T.Color(), la: new T.Color(), ao: new T.Color() };
    ctx.grp = { lv: [], la: [], ao: [] }; ctx.simple = [];
    buildSimple(ctx, T, sc);
    buildValves(ctx, T, sc);
    buildCavity(ctx, T, sc);
    buildParticles(ctx, T, sc);
    buildHUD(ctx, T, G);
    // етикети (предварително заделени двойки)
    ctx.lp = []; for (let i = 0; i < 6; i++) ctx.lp.push(["", new T.Vector3()]); ctx.labOut = [];
    const REAL = !(typeof MK !== "undefined" && MK.real === false);
    if (REAL) loadHRA(ctx, T, sc).catch(e => { if (!ctx.dead) console.warn("cardio-3d: HRA модел — остава опростеният", e && e.message); });
  }

  // деформируеми мрежи: база + помощни данни за всеки връх
  function addDef(ctx, T, sc, kind, geo, mat, simple) {
    const pos = geo.attributes.position, n = pos.count, B = new Float32Array(pos.array), X = new Float32Array(n * 4);
    if (!geo.attributes.normal) geo.computeVertexNormals();
    const N = new Float32Array(geo.attributes.normal.array);
    const { A, ax, mv, yL, av, nA } = ctx;
    for (let i = 0; i < n; i++) {
      const x = B[3 * i], y = B[3 * i + 1], z = B[3 * i + 2];
      if (kind === "lv") { const dx = x - A.x, dy = y - A.y, dz = z - A.z, a = dx * ax.x + dy * ax.y + dz * ax.z; X[4 * i] = a; X[4 * i + 1] = dx - ax.x * a; X[4 * i + 2] = dy - ax.y * a; X[4 * i + 3] = dz - ax.z * a; }
      else if (kind === "la") { X[4 * i] = (x - mv.x) * yL.x + (y - mv.y) * yL.y + (z - mv.z) * yL.z; }
      else { X[4 * i] = (x - av.x) * nA.x + (y - av.y) * nA.y + (z - av.z) * nA.z; }
    }
    pos.setUsage && pos.setUsage(T.DynamicDrawUsage);
    const mesh = new T.Mesh(geo, mat); mesh.frustumCulled = false; sc.add(mesh);
    const it = { mesh, geo, B, X, N, kind }; ctx.grp[kind].push(it); if (simple) ctx.simple.push(it); return it;
  }
  // базисна матрица за процедурни части (локален Y = ос)
  function bake(T, geo, o, bx, by, bz) { const m = new T.Matrix4().makeBasis(bx, by, bz); m.setPosition(o); geo.applyMatrix4(m); return geo; }
  function tubeAlong(T, pts, r, seg, rs) { return new T.TubeGeometry(new T.CatmullRomCurve3(pts), seg, r, rs, false); }
  function buildSimple(ctx, T, sc) {
    const low = ctx.low, { A, ax, Lv, e1, mv, yL, q1L, q2L, av, nA, M } = ctx, V3 = a => new T.Vector3(a[0], a[1], a[2]);
    const bz = e1.clone().cross(ax).normalize();
    // ЛК: затворен профил (епикард → ръб → ендокард), въртян около дългата ос
    const prof = []; RE_U.forEach((u, i) => prof.push(new T.Vector2(RE_R[i], u * Lv)));
    for (let k = 0; k <= 16; k++) { const u = 1 - k / 16; prof.push(new T.Vector2(Rc(u) * (u > 0 ? 1 : 0), u * Lv + 0.02 * (1 - u))); }
    addDef(ctx, T, sc, "lv", bake(T, new T.LatheGeometry(prof, low ? 36 : 56), A, e1, ax, bz), M.lv, true);
    // изходен тракт на ЛК → аортна клапа
    const p1 = A.clone().addScaledVector(ax, 2.2).addScaledVector(e1, -0.3), p2 = av.clone().addScaledVector(nA, -0.04), pm = p1.clone().lerp(p2, 0.5).addScaledVector(e1, -0.08);
    addDef(ctx, T, sc, "lv", tubeAlong(T, [p1, pm, p2], 0.24, 10, low ? 12 : 18), M.lv, true);
    // папиларни мускули (антеролатерален, постеромедиален)
    LM.pap.forEach(([b, t]) => { const p0 = V3(b), p1_ = V3(t), d = p1_.clone().sub(p0), h = d.length(); d.normalize();
      const g = new T.CylinderGeometry(0.05, 0.12, h, low ? 8 : 12, 1); g.translate(0, h / 2, 0); const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d); g.applyMatrix4(new T.Matrix4().compose(p0, q, new T.Vector3(1, 1, 1)));
      addDef(ctx, T, sc, "lv", g, M.lv, true); });
    // ЛП: тънка стена от митралния пръстен нагоре
    const lp = []; for (let k = 0; k <= 14; k++) { const hh = LA_H[LA_H.length - 1] * k / 14; lp.push(new T.Vector2(RLa(hh), hh)); }
    addDef(ctx, T, sc, "la", bake(T, new T.LatheGeometry(lp, low ? 28 : 44), mv, q1L, yL, q2L), M.la, true);
    // белодробни вени (влизат в ЛП)
    LM.pv.forEach(([f, n]) => { const a = V3(f), b = V3(n), c = b.clone().addScaledVector(b.clone().sub(a).normalize(), 0.12); addDef(ctx, T, sc, "la", tubeAlong(T, [a, b, c], 0.09, 8, 10), M.pv, true); });
    // аорта: възходяща, дъга, низходяща + 3 клона на дъгата
    addDef(ctx, T, sc, "ao", new T.TubeGeometry(ctx.aoC, low ? 60 : 90, 0.25, low ? 14 : 20, false), M.ao, true);
    LM.br.forEach(([a, b]) => addDef(ctx, T, sc, "ao", tubeAlong(T, [V3(a), V3(a).lerp(V3(b), 0.5), V3(b)], 0.085, 8, 10), M.ao, true));
  }

  // ---------- истински модел (HRA) ----------
  const HRA_SEL = [[/heart_left_ventricle|interventricular_septum|papillary_muscle_of_heart_(anterolateral|posteromedial)$/, "lv", "lv"], [/left_cardiac_atrium/, "la", "la"], [/pulmonary_vein/, "la", "pv"],
    [/ascending_aorta|aortic_arch|descending_aorta_a|brachiocephalic_artery_a|left_common_carotid_artery_a|left_subclavian_artery_a/, "ao", "ao"]];
  function hraText(id) {
    window.__HB = window.__HB || {};
    if (window.__HB[id]) return Promise.resolve(window.__HB[id]);
    return fetch("m/" + id + ".txt").then(r => { if (!r.ok) throw new Error("m/" + id + ".txt"); return r.text(); }).then(t => (window.__HB[id] = t.trim()));
  }
  function loadHRA(ctx, T, sc) {
    if (typeof loadScript !== "function" || typeof GLTF_URL === "undefined") return Promise.reject(new Error("GLTFLoader"));
    return loadScript(GLTF_URL).then(() => Promise.all(["hglb1", "hglb2"].map(id => hraText(id).then(t => new Promise((res, rej) => {
      const bin = atob(t), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      new THREE.GLTFLoader().parse(u8.buffer, "", res, rej);
    }))))).then(gl => {
      if (ctx.dead) return;
      const X = LM.XF, v = new T.Vector3(), out = [];
      gl.forEach(g => { g.scene.updateMatrixWorld(true); g.scene.traverse(o => {
        if (!o.isMesh) return; const sel = HRA_SEL.find(s => s[0].test(o.name)); if (!sel) return;
        const at = o.geometry.attributes.position, n = at.count, arr = at.isInterleavedBufferAttribute ? at.data.array : at.array;
        const div = !at.normalized ? 1 : arr instanceof Int16Array ? 32767 : arr instanceof Int8Array ? 127 : arr instanceof Uint16Array ? 65535 : arr instanceof Uint8Array ? 255 : 1;
        const P = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { v.set(at.getX(i) / div, at.getY(i) / div, at.getZ(i) / div).applyMatrix4(o.matrixWorld);
          const qx = (v.x - X.cen[0]) * X.s - X.c0[0], qy = (v.y - X.cen[1]) * X.s - X.c0[1], qz = (v.z - X.cen[2]) * X.s - X.c0[2];
          P[3 * i] = qx * X.ex[0] + qy * X.ex[1] + qz * X.ex[2]; P[3 * i + 1] = qx * X.ey[0] + qy * X.ey[1] + qz * X.ey[2]; P[3 * i + 2] = qx * X.ez[0] + qy * X.ez[1] + qz * X.ez[2]; }
        const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(P, 3)); if (o.geometry.index) geo.setIndex(new T.BufferAttribute(new Uint32Array(o.geometry.index.array), 1)); geo.computeVertexNormals();
        out.push([sel[1], sel[2], geo]);
      }); g.scene.traverse(o => { if (o.isMesh) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); } }); });
      if (!out.length || ctx.dead) return;
      // смяна: процедурните стени излизат, HRA влиза на същото място
      ctx.simple.forEach(it => { sc.remove(it.mesh); it.geo.dispose(); const g = ctx.grp[it.kind], k = g.indexOf(it); if (k >= 0) g.splice(k, 1); });
      ctx.simple.length = 0;
      out.forEach(([kind, mk, geo]) => addDef(ctx, T, sc, kind, geo, mk === "pv" ? ctx.M.pv : ctx.M[mk], false));
      ctx.defKey = -1; ctx.real = true;
    });
  }

  // ---------- клапи (процедурни платна) и хорди ----------
  function grid(T, nu, nv) { const g = new T.BufferGeometry(), pos = new Float32Array((nu + 1) * (nv + 1) * 3), idx = [];
    for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    g.setAttribute("position", new T.BufferAttribute(pos, 3).setUsage(T.DynamicDrawUsage)); g.setIndex(idx); return g; }
  function buildValves(ctx, T, sc) {
    const low = ctx.low, ns = low ? 5 : 7;
    ctx.leaf = [];
    // митрална: предно (≈130°) и задно платно (≈230°)
    [[-1.13, 1.13, low ? 10 : 14], [1.13, 2 * Math.PI - 1.13, low ? 16 : 22]].forEach(([a0, a1, nu]) => { const g = grid(T, nu, ns), m = new T.Mesh(g, ctx.M.valve); m.frustumCulled = false; sc.add(m); ctx.leaf.push({ v: "m", a0, a1, nu, ns, g, m }); });
    // аортна: 3 полулунни платна
    for (let k = 0; k < 3; k++) { const c = Math.PI / 2 + k * 2 * Math.PI / 3, nu = low ? 10 : 14, g = grid(T, nu, ns), m = new T.Mesh(g, ctx.M.valve); m.frustumCulled = false; sc.add(m); ctx.leaf.push({ v: "a", c, a0: c - Math.PI / 3, a1: c + Math.PI / 3, nu, ns, g, m }); }
    // хорди: от свободния ръб към върховете на папиларните мускули
    ctx.chA = [-0.8, -0.3, 0.3, 0.8, 1.7, 2.3, Math.PI, 3.95, 4.6];
    const cg = new T.BufferGeometry(); cg.setAttribute("position", new T.BufferAttribute(new Float32Array(ctx.chA.length * 6), 3).setUsage(T.DynamicDrawUsage));
    ctx.chord = new T.LineSegments(cg, ctx.M.chord); ctx.chord.frustumCulled = false; sc.add(ctx.chord);
    ctx.papT = LM.pap.map(p => new T.Vector3(p[1][0], p[1][1], p[1][2])); ctx.papD = [new T.Vector3(), new T.Vector3()];
  }
  // деформация на точка от ЛК (същата като за стената): кухината се свива радиално (стената се удебелява), основата слиза
  function defLV(ctx, p, out) {
    const { A, ax, Lv, sR, sL } = ctx, dx = p.x - A.x, dy = p.y - A.y, dz = p.z - A.z, a = dx * ax.x + dy * ax.y + dz * ax.z;
    const rx = dx - ax.x * a, ry = dy - ax.y * a, rz = dz - ax.z * a, r = Math.hypot(rx, ry, rz), rc = Rc(clamp(a / Lv, 0, 1.15));
    const r2 = Math.sqrt(Math.max(r * r - rc * rc * (1 - sR * sR), 0.09 * r * r)), k = r > 1e-6 ? r2 / r : 0, aa = a * sL;
    return out.set(A.x + ax.x * aa + rx * k, A.y + ax.y * aa + ry * k, A.z + ax.z * aa + rz * k);
  }
  function updValves(ctx, S) {
    const { mvD, avD, nM, e1M, e2M, nA, f1, f2 } = ctx, p = S.p || {}, leaky = num(p.Rmr, 1e9) < 1e3;
    const omax = clamp(1 / Math.sqrt(Math.max(num(p.Rav, 0.004), 0.004) / 0.004), 0.22, 1);
    ctx.omax = omax;
    const om = ctx.om, oa = ctx.oa * omax, R1 = 0.4, R2 = 0.47, xc = -0.05, Ra = 0.25;
    for (const L_ of ctx.leaf) {
      const arr = L_.g.attributes.position.array; let q = 0;
      for (let i = 0; i <= L_.nu; i++) {
        const ph = L_.a0 + (L_.a1 - L_.a0) * i / L_.nu, c = Math.cos(ph), s = Math.sin(ph);
        let Ax, Ay, Az, dcx, dcy, dcz, dox, doy, doz, bx, by, bz, ob, cb;
        if (L_.v === "m") {
          Ax = mvD.x + e1M.x * R1 * c + e2M.x * R2 * s; Ay = mvD.y + e1M.y * R1 * c + e2M.y * R2 * s; Az = mvD.z + e1M.z * R1 * c + e2M.z * R2 * s;
          let Ex = mvD.x + e1M.x * xc + e2M.x * R2 * 0.9 * s - nM.x * 0.05, Ey = mvD.y + e1M.y * xc + e2M.y * R2 * 0.9 * s - nM.y * 0.05, Ez = mvD.z + e1M.z * xc + e2M.z * R2 * 0.9 * s - nM.z * 0.05;
          dcx = Ex - Ax; dcy = Ey - Ay; dcz = Ez - Az; if (leaky) { dcx *= 0.8; dcy *= 0.8; dcz *= 0.8; }
          const Lc = Math.hypot(dcx, dcy, dcz), ix = -(e1M.x * R1 * c + e2M.x * R2 * s), iy = -(e1M.y * R1 * c + e2M.y * R2 * s), iz = -(e1M.z * R1 * c + e2M.z * R2 * s), il = Math.hypot(ix, iy, iz) || 1;
          dox = nM.x * Lc * 0.92 + ix / il * Lc * 0.28; doy = nM.y * Lc * 0.92 + iy / il * Lc * 0.28; doz = nM.z * Lc * 0.92 + iz / il * Lc * 0.28;
          bx = -nM.x * 0.07 * (1 - om) - ix / il * 0.05 * om; by = -nM.y * 0.07 * (1 - om) - iy / il * 0.05 * om; bz = -nM.z * 0.07 * (1 - om) - iz / il * 0.05 * om; ob = om; cb = 1;
        } else {
          const t = Math.abs(ph - L_.c) / (Math.PI / 3), pc = L_.c + (ph >= L_.c ? 1 : -1) * Math.PI / 3, cc = Math.cos(pc), cs = Math.sin(pc), hA = 0.55 * Ra * t * t;
          Ax = avD.x + Ra * (f1.x * c + f2.x * s) + nA.x * hA; Ay = avD.y + Ra * (f1.y * c + f2.y * s) + nA.y * hA; Az = avD.z + Ra * (f1.z * c + f2.z * s) + nA.z * hA;
          const Ex = avD.x + (f1.x * cc + f2.x * cs) * Ra * t * 0.98 + nA.x * (hA * 0.9 + 0.02), Ey = avD.y + (f1.y * cc + f2.y * cs) * Ra * t * 0.98 + nA.y * (hA * 0.9 + 0.02), Ez = avD.z + (f1.z * cc + f2.z * cs) * Ra * t * 0.98 + nA.z * (hA * 0.9 + 0.02);
          dcx = Ex - Ax; dcy = Ey - Ay; dcz = Ez - Az; const Lc = Math.max(0.06, Math.hypot(dcx, dcy, dcz));
          dox = nA.x * Lc * 0.95 + (f1.x * c + f2.x * s) * 0.03; doy = nA.y * Lc * 0.95 + (f1.y * c + f2.y * s) * 0.03; doz = nA.z * Lc * 0.95 + (f1.z * c + f2.z * s) * 0.03;
          const sg = 0.35 * Ra * (1 - t * t) * (1 - oa); bx = -nA.x * sg; by = -nA.y * sg; bz = -nA.z * sg; ob = oa; cb = 1;
        }
        const dx = dcx + (dox - dcx) * ob, dy = dcy + (doy - dcy) * ob, dz = dcz + (doz - dcz) * ob;
        for (let j = 0; j <= L_.ns; j++) { const u = j / L_.ns, w = Math.sin(Math.PI * u) * cb; arr[q++] = Ax + dx * u + bx * w; arr[q++] = Ay + dy * u + by * w; arr[q++] = Az + dz * u + bz * w; }
      }
      L_.g.attributes.position.needsUpdate = true; L_.g.computeVertexNormals(); L_.g.computeBoundingSphere();
    }
    // хорди: свободният ръб на митралните платна → най-близкият папиларен мускул
    const ca = ctx.chord.geometry.attributes.position.array, mA = ctx.leaf[0], mP = ctx.leaf[1];
    ctx.papT.forEach((t, k) => defLV(ctx, t, ctx.papD[k]));
    ctx.chA.forEach((ph, k) => {
      const Lf = ph > -1.13 && ph < 1.13 ? mA : mP, a = Lf.g.attributes.position.array; let f = (ph - Lf.a0) / (Lf.a1 - Lf.a0); f = clamp(Math.round(f * Lf.nu), 0, Lf.nu);
      const o = (f * (Lf.ns + 1) + Lf.ns) * 3, x = a[o], y = a[o + 1], z = a[o + 2];
      const s = Math.sin(ph), d0 = ctx.papD[0], d1 = ctx.papD[1], pick = ((d0.x - mvD.x) * e2M.x + (d0.y - mvD.y) * e2M.y + (d0.z - mvD.z) * e2M.z) * s >= ((d1.x - mvD.x) * e2M.x + (d1.y - mvD.y) * e2M.y + (d1.z - mvD.z) * e2M.z) * s ? d0 : d1;
      const q = k * 6; ca[q] = x; ca[q + 1] = y; ca[q + 2] = z; ca[q + 3] = pick.x; ca[q + 4] = pick.y; ca[q + 5] = pick.z;
    });
    ctx.chord.geometry.attributes.position.needsUpdate = true;
  }

  // ---------- кръв в кухината на ЛК + ендокарден контур (като ехо трасиране за обем) ----------
  function buildCavity(ctx, T, sc) {
    const { A, ax, e1, Lv } = ctx, g = new T.Group(), bz = e1.clone().cross(ax).normalize(), m = new T.Matrix4().makeBasis(e1, ax, bz);
    g.position.copy(A); g.quaternion.setFromRotationMatrix(m); sc.add(g); ctx.cav = g;
    const prof = []; for (let k = 0; k <= 18; k++) { const u = k / 18; prof.push(new T.Vector2(Rc(u) * 0.97 * (u > 0 && u < 1 ? 1 : u >= 1 ? 0.97 : 0), u * Lv)); }
    prof.push(new T.Vector2(0, Lv));
    const bl = new T.Mesh(new T.LatheGeometry(prof, ctx.low ? 28 : 44), ctx.M.blood); bl.renderOrder = 2; g.add(bl); ctx.bloodM = bl;
    const cp = []; for (let k = 0; k <= 20; k++) { const u = 1 - k / 20; cp.push(new T.Vector3(Rc(u), u * Lv, 0)); } for (let k = 1; k <= 20; k++) { const u = k / 20; cp.push(new T.Vector3(-Rc(u), u * Lv, 0)); }
    cp.forEach(p => { p.z = bz.z > 0 ? -0.03 : 0.03; });
    const ct = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(cp, true), 90, 0.016, 5, true), ctx.M.cont); ct.renderOrder = 3; g.add(ct);
  }

  // ---------- частици: маркери на кръвта; брой в камера ∝ обем, път и скорост ∝ поток ----------
  const K = { FREE: 0, LA: 1, LV: 2, AO: 3, MVJ: 4, AVJ: 5, MRJ: 6, PVI: 7, AOX: 8 }, OWN = [0, 1, 2, 3, 2, 3, 1, 1, 0];
  function buildParticles(ctx, T, sc) {
    const n = ctx.low ? 170 : 240, P = ctx.P = { n, k: new Int8Array(n), a: new Float32Array(n), b: new Float32Array(n), c: new Float32Array(n), t: new Float32Array(n), sx: new Float32Array(n), sy: new Float32Array(n), sz: new Float32Array(n),
      da: new Float32Array(n), db: new Float32Array(n), dc: new Float32Array(n), oo: new Float32Array(n), vi: new Int8Array(n), pk: new Float32Array(n), sc: new Float32Array(n), out: new Int8Array(n), ph: new Float32Array(n) };
    ctx.vPer = ctx.low ? 3.4 : 2.8; ctx.seed = 12345;
    for (let i = 0; i < n; i++) P.ph[i] = (i * 2.399) % 6.283;
    const im = new T.InstancedMesh(new T.IcosahedronGeometry(0.05, ctx.low ? 0 : 1), ctx.M.part, n); im.frustumCulled = false;
    im.instanceMatrix.setUsage(T.DynamicDrawUsage);
    im.count = n; const c0 = new T.Color(1, 1, 1); for (let i = 0; i < n; i++) im.setColorAt(i, c0); im.count = 0;   // setColorAt заделя по count
    sc.add(im); ctx.im = im; ctx.mtx = new T.Matrix4();
    ctx.pvA = LM.pv.map(v => new T.Vector3(v[0][0], v[0][1], Math.min(v[0][2], -0.05))); ctx.pvB = LM.pv.map(v => new T.Vector3(v[1][0], v[1][1], Math.min(v[1][2], -0.05)));
  }
  function rnd(ctx) { ctx.seed = (ctx.seed * 16807) % 2147483647; return ctx.seed / 2147483647; }
  function posLV(ctx, u, r, f, o) { const a = u * ctx.Lv * ctx.sL, R = Rc(u) * ctx.sR * r * 0.8, c = Math.cos(f), s = Math.sin(f), { A, ax, e1, q2 } = ctx;
    o.set(A.x + ax.x * a + (e1.x * c + q2.x * s) * R, A.y + ax.y * a + (e1.y * c + q2.y * s) * R, A.z + ax.z * a + (e1.z * c + q2.z * s) * R); if (o.z > -0.03) o.z = -0.03; return o; }
  function posLA(ctx, h, r, f, o) { const H0 = 0.12 + h * 1.12, R = RLa(H0) * r * 0.72, c = Math.cos(f), s = Math.sin(f), { mv, yL, q1L, q2L, dMV } = ctx, k = 1 + (ctx.sLa - 1) * sm(H0 / 0.55), w = 1 - sm(H0 / 1.5);
    o.set(mv.x + (yL.x * H0 + (q1L.x * c + q2L.x * s) * R) * k + dMV.x * w, mv.y + (yL.y * H0 + (q1L.y * c + q2L.y * s) * R) * k + dMV.y * w, mv.z + (yL.z * H0 + (q1L.z * c + q2L.z * s) * R) * k + dMV.z * w); if (o.z > -0.03) o.z = -0.03; return o; }
  function posAO(ctx, s, r, f, o) { const NA = ctx.NA, x = clamp(s, 0, 1) * NA, i = Math.min(NA - 1, Math.floor(x)), w = x - i, P = ctx.aoP, N = ctx.aoN, B = ctx.aoB, c = Math.cos(f) * r * 0.16, sn = Math.sin(f) * r * 0.16, ww = 1 - sm(s / 0.25);
    for (let k = 0; k < 3; k++) { const p = P[3 * i + k] + (P[3 * i + 3 + k] - P[3 * i + k]) * w, nn = N[3 * i + k], bb = B[3 * i + k]; ctx.tv4.setComponent(k, p + nn * c + bb * sn + ctx.dAV.getComponent(k) * ww); }
    o.copy(ctx.tv4); if (o.z > -0.03) o.z = -0.03; return o; }
  function spawnPool(ctx, i, kind) { const P = ctx.P; P.k[i] = kind; P.out[i] = 0; P.pk[i] = 0;
    if (kind === K.LV) { P.a[i] = 0.08 + 0.85 * rnd(ctx); P.b[i] = Math.sqrt(rnd(ctx)); P.c[i] = 0.15 + 2.84 * rnd(ctx); }
    else if (kind === K.LA) { P.a[i] = 0.05 + 0.85 * rnd(ctx); P.b[i] = Math.sqrt(rnd(ctx)); P.c[i] = 0.15 + 2.84 * rnd(ctx); }
    else { P.a[i] = 0.04 + 0.5 * rnd(ctx); P.b[i] = Math.sqrt(rnd(ctx)); P.c[i] = 6.283 * rnd(ctx); } }
  function freeSlot(ctx) { const P = ctx.P; for (let i = 0; i < P.n; i++) if (P.k[i] === K.FREE) return i; return -1; }
  function snapParticles(ctx, S) {
    const P = ctx.P; P.k.fill(0);
    const nLV = Math.round(S.V_lv / ctx.vPer), nLA = Math.round(S.V_la / ctx.vPer), nAO = aoTarget(S);
    let i = 0; for (let k = 0; k < nLV && i < P.n; k++, i++) { spawnPool(ctx, i, K.LV); P.sc[i] = 1; }
    for (let k = 0; k < nLA && i < P.n; k++, i++) { spawnPool(ctx, i, K.LA); P.sc[i] = 1; }
    for (let k = 0; k < nAO && i < P.n; k++, i++) { spawnPool(ctx, i, K.AO); P.sc[i] = 1; }
  }
  const aoTarget = S => Math.round(clamp((S.P_ao - 20) / 4, 0, 40));   // Windkessel: запасът в аортата ∝ налягането
  function launch(ctx, i, kind, S) {
    const P = ctx.P, o = ctx.tv; let p;
    if (P.k[i] === K.LV) p = posLV(ctx, P.a[i], P.b[i], P.c[i], o); else if (P.k[i] === K.LA) p = posLA(ctx, P.a[i], P.b[i], P.c[i], o); else p = posAO(ctx, P.a[i], P.b[i], P.c[i], o);
    P.sx[i] = p.x; P.sy[i] = p.y; P.sz[i] = p.z; P.t[i] = 0; P.k[i] = kind; P.oo[i] = rnd(ctx) * 2 - 1;
    if (kind === K.MVJ) { P.da[i] = 0.3 + 0.55 * rnd(ctx); P.db[i] = Math.sqrt(rnd(ctx)); P.dc[i] = 0.2 + 2.7 * rnd(ctx); }
    else if (kind === K.AVJ) { P.da[i] = 0.08 + 0.35 * rnd(ctx); P.db[i] = Math.sqrt(rnd(ctx)); P.dc[i] = 6.283 * rnd(ctx); }
    else if (kind === K.MRJ) { P.da[i] = 0.35 + 0.5 * rnd(ctx); P.db[i] = 0.4 + 0.6 * rnd(ctx); P.dc[i] = 0.3 + 1.2 * rnd(ctx); P.pk[i] = 1; }
  }
  function pick(ctx, kind, hi) { const P = ctx.P; let best = -1, bv = hi ? -1e9 : 1e9; for (let i = 0; i < P.n; i++) if (P.k[i] === kind && !P.out[i]) { const v = P.a[i] + 0.15 * P.b[i]; if (hi ? v > bv : v < bv) { bv = v; best = i; } } return best; }
  function updParticles(ctx, S, dt) {
    const P = ctx.P, sim = ctx.simDt, vPer = ctx.vPer;
    if (ctx.snap) { snapParticles(ctx, S); ctx.snap = false; }
    // броене по „собственик“ (камерата, в която частицата е или към която пътува)
    let cLV = 0, cLA = 0, cAO = 0; for (let i = 0; i < P.n; i++) { if (P.out[i]) continue; const w = OWN[P.k[i]]; if (w === 2) cLV++; else if (w === 1) cLA++; else if (w === 3) cAO++; }
    const nLV = Math.round(S.V_lv / vPer), nLA = Math.round(S.V_la / vPer), nAO = aoTarget(S), Qm = S.Q_mv, Qa = S.Q_av;
    let d = nLV - cLV;
    if (d > 0 && Qm > 1) for (let k = 0; k < Math.min(d, 4); k++) { let i = pick(ctx, K.LA, false); if (i < 0) { i = freeSlot(ctx); if (i < 0) break; spawnPool(ctx, i, K.LA); P.a[i] = 0.02; P.sc[i] = 0; } launch(ctx, i, K.MVJ, S); }
    else if (d < 0) {
      const fA = Qa > 1 ? Qa : 0, fR = Qm < -1 ? -Qm : 0;
      if (fA + fR > 0) { const out = Math.min(-d, 4), nR = Math.round(out * fR / (fA + fR)); for (let k = 0; k < out; k++) { const i = pick(ctx, K.LV, true); if (i < 0) break; launch(ctx, i, k < nR ? K.MRJ : K.AVJ, S); } }
      else if (d < -2) for (let k = 0; k < Math.min(-d - 2, 2); k++) { const i = pick(ctx, K.LV, true); if (i >= 0) P.out[i] = 1; }
    }
    d = nLA - cLA;
    if (d > 0) for (let k = 0; k < Math.min(d, 3); k++) { const i = freeSlot(ctx); if (i < 0) break; P.k[i] = K.PVI; P.vi[i] = 2 + ((ctx.frame + k) & 1); /* вените зад разреза */ P.t[i] = 0; P.sc[i] = 0; P.out[i] = 0; P.pk[i] = 0; P.da[i] = 0.4 + 0.55 * rnd(ctx); P.db[i] = Math.sqrt(rnd(ctx)); P.dc[i] = 0.2 + 2.7 * rnd(ctx); }
    else if (d < -2) { const i = pick(ctx, K.LA, false); if (i >= 0) P.out[i] = 1; }
    d = nAO - cAO;
    if (d < 0) for (let k = 0; k < Math.min(-d, 3); k++) { const i = pick(ctx, K.AO, true); if (i < 0) break; P.k[i] = K.AOX; }
    // скорости (единици/s в симулационно време; 1 ед. ≈ 3,7 cm): v = Q / площ на отвора
    const om = Math.max(ctx.om, 0.15), oa = Math.max(ctx.oa * ctx.omax, 0.05);
    const vMV = clamp(Math.abs(Qm) / (4 * om) / 3.7, 3, 40), vAV = clamp(Qa / (3 * oa) / 3.7, 3, 60), vMR = clamp(Math.abs(Qm) / 0.4 / 3.7, 6, 60), vPV = clamp(num(S.Q_pv, 90) / 6 / 3.7, 2, 20);
    const o = ctx.tv, m = ctx.tv2, e = ctx.tv3, { mvD, avD, e1M, nA, f1 } = ctx;
    const im = ctx.im, M4 = ctx.mtx, col = ctx.col; let j = 0;
    const pLV = 0.45 + 0.55 * clamp(S.P_lv / 120, 0, 1), pLA = 0.5, pAO = 0.45 + 0.55 * clamp(S.P_ao / 120, 0, 1);
    col.lv.copy(col.dark).lerp(col.red, pLV); col.la.copy(col.dark).lerp(col.red, pLA); col.ao.copy(col.dark).lerp(col.red, pAO);
    for (let i = 0; i < P.n; i++) {
      const k = P.k[i]; if (k === K.FREE) continue;
      P.ph[i] += sim * 1.3;
      if (k === K.LV) { P.a[i] = clamp(P.a[i] + Math.sin(P.ph[i] * 1.7) * sim * 0.12, 0.05, 0.95); P.c[i] = clamp(P.c[i] + Math.cos(P.ph[i]) * sim * 0.4, 0.1, 3.04); posLV(ctx, P.a[i], P.b[i], P.c[i], o); }
      else if (k === K.LA) { P.a[i] = clamp(P.a[i] + Math.sin(P.ph[i] * 1.3) * sim * 0.1, 0.03, 0.95); P.c[i] = clamp(P.c[i] + Math.cos(P.ph[i]) * sim * 0.4, 0.1, 3.04); posLA(ctx, P.a[i], P.b[i], P.c[i], o); }
      else if (k === K.AO || k === K.AOX) {
        P.a[i] += sim * (0.12 + Math.max(0, Qa) / 900) * (k === K.AOX ? 3 : 1);
        if (k === K.AO && P.a[i] > 0.55) P.a[i] = 0.55;
        if (k === K.AOX && P.a[i] >= 0.72) P.out[i] = 1;
        posAO(ctx, P.a[i], P.b[i], P.c[i], o);
      } else {
        // струя: квадратична Безие S → (през отвора M) → D
        let v, len;
        if (k === K.MVJ) { m.copy(mvD).addScaledVector(e1M, P.oo[i] * 0.18 * om); m.z = Math.min(m.z, -0.04); posLV(ctx, P.da[i], P.db[i], P.dc[i], e); v = vMV; }
        else if (k === K.AVJ) { m.copy(avD).addScaledVector(f1, P.oo[i] * 0.12 * oa); m.z = Math.min(m.z, -0.04); posAO(ctx, P.da[i], P.db[i], P.dc[i], e); v = vAV; }
        else if (k === K.MRJ) { m.copy(mvD).addScaledVector(e1M, -0.08 + P.oo[i] * 0.03); m.z = Math.min(m.z, -0.04); posLA(ctx, P.da[i], P.db[i], P.dc[i], e); v = vMR; }
        else { const vi = P.vi[i]; P.sx[i] = ctx.pvA[vi].x; P.sy[i] = ctx.pvA[vi].y; P.sz[i] = ctx.pvA[vi].z; m.copy(ctx.pvB[vi]); posLA(ctx, P.da[i], P.db[i], P.dc[i], e); v = vPV; }
        len = Math.hypot(m.x - P.sx[i], m.y - P.sy[i], m.z - P.sz[i]) + m.distanceTo(e) + 0.05;
        P.t[i] += v * sim / len;
        const t = Math.min(1, P.t[i]), a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
        const cx = 2 * m.x - (P.sx[i] + e.x) / 2, cy = 2 * m.y - (P.sy[i] + e.y) / 2, cz = 2 * m.z - (P.sz[i] + e.z) / 2;
        o.set(a * P.sx[i] + b * cx + c * e.x, a * P.sy[i] + b * cy + c * e.y, Math.min(-0.03, a * P.sz[i] + b * cz + c * e.z));
        if (P.t[i] >= 1) { const dst = k === K.MVJ ? K.LV : k === K.AVJ ? K.AO : K.LA; P.k[i] = dst; P.a[i] = P.da[i]; P.b[i] = P.db[i]; P.c[i] = P.dc[i]; }
      }
      // поява / изчезване
      if (P.out[i]) { P.sc[i] -= dt * 3; if (P.sc[i] <= 0) { P.k[i] = K.FREE; P.out[i] = 0; continue; } } else if (P.sc[i] < 1) P.sc[i] = Math.min(1, P.sc[i] + dt * 4);
      if (P.pk[i] > 0 && (k === K.LA || k === K.MVJ || k === K.LV)) P.pk[i] = Math.max(0, P.pk[i] - sim / 1.5);
      const own = OWN[P.k[i]], base = k === K.MRJ ? col.pink : own === 2 ? col.lv : own === 3 || k === K.AOX ? col.ao : col.la;
      col.c.copy(base); if (P.pk[i] > 0) col.c.lerp(col.pink, P.pk[i]);
      const s = 0.4 + 0.6 * P.sc[i]; M4.makeScale(s, s, s); M4.setPosition(o.x, o.y, o.z); im.setMatrixAt(j, M4); im.setColorAt(j, col.c); j++;
    }
    im.count = j; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }

  // ---------- деформация на стените по обемите и налягането ----------
  function applyGeom(ctx, S) {
    const s = Math.cbrt(clamp(S.V_lv, 8, 320) / 120), sR = Math.pow(s, 1.25), sL = Math.sqrt(s), sLa = clamp(Math.cbrt(clamp(S.V_la, 5, 400) / 50), 0.6, 1.8);
    const dl = clamp(0.25 * 0.08 * (S.P_ao - 80) / 40, -0.05, 0.06);              // spec: радиус ∝ 1 + 0,08·(P_ao − 80)/40
    ctx.sR = sR; ctx.sL = sL; ctx.sLa = sLa; ctx.dl = dl;
    const { A, ax, Lv } = ctx;
    ctx.dMV.copy(ax).multiplyScalar(-Lv * (1 - sL)); ctx.mvD.copy(ctx.mv).add(ctx.dMV);
    defLV(ctx, ctx.av, ctx.avD); ctx.dAV.copy(ctx.avD).sub(ctx.av);
    const key = Math.round(sR * 2000) + Math.round(sL * 2000) * 3 + Math.round(sLa * 1000) * 7 + Math.round(dl * 4000) * 11 + (ctx.grp.lv.length + ctx.grp.la.length * 31) * 13;
    if (key !== ctx.defKey) {
      ctx.defKey = key; ctx.defN++;
      const nrm = ctx.defN % (ctx.low ? 5 : 3) === 0, dMV = ctx.dMV, dAV = ctx.dAV, mv = ctx.mv, yL = ctx.yL;
      for (const it of ctx.grp.lv) { const B = it.B, X = it.X, p = it.geo.attributes.position.array, n = B.length / 3;
        for (let i = 0; i < n; i++) { const a = X[4 * i], rx = X[4 * i + 1], ry = X[4 * i + 2], rz = X[4 * i + 3], r = Math.hypot(rx, ry, rz), rc = Rc(clamp(a / Lv, 0, 1.15));
          const k = r > 1e-6 ? Math.sqrt(Math.max(r * r - rc * rc * (1 - sR * sR), 0.09 * r * r)) / r : 0, aa = a * sL;
          p[3 * i] = A.x + ax.x * aa + rx * k; p[3 * i + 1] = A.y + ax.y * aa + ry * k; p[3 * i + 2] = A.z + ax.z * aa + rz * k; }
        it.geo.attributes.position.needsUpdate = true; if (nrm) it.geo.computeVertexNormals(); }
      for (const it of ctx.grp.la) { const B = it.B, X = it.X, p = it.geo.attributes.position.array, n = B.length / 3;
        for (let i = 0; i < n; i++) { const h = X[4 * i], k = 1 + (sLa - 1) * sm(h / 0.55), w = 1 - sm(h / 1.5);
          p[3 * i] = mv.x + (B[3 * i] - mv.x) * k + dMV.x * w; p[3 * i + 1] = mv.y + (B[3 * i + 1] - mv.y) * k + dMV.y * w; p[3 * i + 2] = mv.z + (B[3 * i + 2] - mv.z) * k + dMV.z * w; }
        it.geo.attributes.position.needsUpdate = true; if (nrm) it.geo.computeVertexNormals(); }
      for (const it of ctx.grp.ao) { const B = it.B, X = it.X, N = it.N, p = it.geo.attributes.position.array, n = B.length / 3;
        for (let i = 0; i < n; i++) { const h = X[4 * i], w = h <= 0 ? 1 : 1 - sm(h / 1.3);
          p[3 * i] = B[3 * i] + N[3 * i] * dl + dAV.x * w; p[3 * i + 1] = B[3 * i + 1] + N[3 * i + 1] * dl + dAV.y * w; p[3 * i + 2] = B[3 * i + 2] + N[3 * i + 2] * dl + dAV.z * w; }
        it.geo.attributes.position.needsUpdate = true; }
    }
    // кръв в кухината: мащаб по оста и радиално (= същият закон като стената), цвят ∝ P_ЛК
    ctx.cav.scale.set(sR, sL, sR);
    ctx.M.blood.color.copy(ctx.col.dark).lerp(ctx.col.red, clamp(S.P_lv / 120, 0, 1));
    ctx.M.blood.opacity = 0.3 + 0.2 * clamp(S.P_lv / 120, 0, 1);
    // светене: миокард ∝ e_lv, ЛП ∝ e_la
    ctx.M.lv.emissiveIntensity = 0.04 + 0.5 * clamp(num(S.e_lv, 0), 0, 1);
    ctx.M.la.emissiveIntensity = 0.03 + 0.55 * clamp(num(S.e_la, 0), 0, 1);
    // клапи: плавен преход (~15 ms симулационно време)
    const kf = 1 - Math.exp(-ctx.simDt / 0.015);
    ctx.om += ((S.mv_open > 0.5 ? 1 : 0) - ctx.om) * kf; ctx.oa += ((S.av_open > 0.5 ? 1 : 0) - ctx.oa) * kf;
    if (ctx.snapV) { ctx.om = S.mv_open > 0.5 ? 1 : 0; ctx.oa = S.av_open > 0.5 ? 1 : 0; ctx.snapV = false; }
    updValves(ctx, S);
  }

  // ---------- забавено пускане на записания цикъл ----------
  function sample(ctx, stg, dt, raw) {
    const S = ctx.S, P = ctx.play;
    S.p = raw.p || MO.p; S.raw = raw;
    if (!P.ok) {
      for (let j = 0; j < RF.length; j++) S[RF[j]] = num(raw[RF[j]], 0);
      const T = num(raw.T, 0.833), tc = num(raw.tc, 0); let d = tc - num(ctx.liveTc, tc); if (d < 0) d += T;
      ctx.simDt = d > 0.1 ? 0 : d; ctx.liveTc = tc; S.tau = tc; S.T = T; S.slow = 0; S.ok = false;
    } else {
      const w = P.win[stg] || [0, P.T], Dl = stg <= 4 ? 2.6 : 3.6, sp = w[1] / Dl;
      if (ctx.stgKey !== stg || ctx.ver !== P.ver) { if (ctx.stgKey !== stg) { ctx.tl = 0; ctx.hold = 0; } ctx.stgKey = stg; ctx.ver = P.ver; ctx.tl = Math.min(ctx.tl, w[1]); }
      let adv = dt * sp;
      if (ctx.tl >= w[1]) { adv = 0; ctx.hold += dt; if (ctx.hold > (stg <= 4 ? 0.45 : 0)) { ctx.tl = 0; ctx.hold = 0; } }
      else ctx.tl = Math.min(w[1], ctx.tl + adv);
      ctx.simDt = adv;
      const tau = ((w[0] + ctx.tl) % P.T + P.T) % P.T, f = tau / P.T * NB, b0 = Math.floor(f) % NB, b1 = (b0 + 1) % NB, u = f - Math.floor(f), br = Math.round(f) % NB;
      for (let j = 0; j < RF.length; j++) { const a = P.f[RF[j]]; S[RF[j]] = DISC[RF[j]] ? a[br] : a[b0] + (a[b1] - a[b0]) * u; }
      S.tau = tau; S.T = P.T; S.slow = 1 / sp; S.ok = true;
    }
    // скок в обема (нов прозорец/цикъл) → частиците и клапите се подреждат наново
    if (ctx.prevV == null || Math.abs(S.V_lv - ctx.prevV) > 8 || Math.abs(S.V_la - ctx.prevVla) > 8) { ctx.snap = true; ctx.snapV = true; }
    ctx.prevV = S.V_lv; ctx.prevVla = S.V_la;
    return S;
  }

  // ---------- HUD: Wiggers и PV като платно в сцената (дете на камерата) ----------
  function buildHUD(ctx, T, G) {
    G.scene.add(G.cam);
    const cv = document.createElement("canvas"); cv.width = 16; cv.height = 16;
    const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.minFilter = T.LinearFilter; tex.generateMipmaps = false;
    const m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
    m.renderOrder = 20; m.frustumCulled = false; m.visible = false; G.cam.add(m);
    ctx.hud = { cv, g: cv.getContext("2d"), tex, m, w: 0, h: 0, asp: 0, k: 1 };
  }
  function hudLayout(ctx) {
    const H = ctx.hud, cv = ctx.G.cv, w = cv.clientWidth || 1, h = cv.clientHeight || 1, asp = w / h, port = asp < 1.15;
    const r = port ? [-0.96, 0.96, 0.0, 0.78] : [-0.975, -0.03, -0.8, 0.79];
    const pw = (r[1] - r[0]) / 2 * w, ph = (r[3] - r[2]) / 2 * h, k = Math.min(ctx.low ? 1.3 : 1.7, (window.devicePixelRatio || 1) * 1.05), W = Math.round(Math.min(1100, pw * k)), Hh = Math.round(Math.min(900, ph * k));
    if (Math.abs(W - H.w) > 8 || Math.abs(Hh - H.h) > 8 || Math.abs(asp - H.asp) > 0.01) {
      H.w = W; H.h = Hh; H.asp = asp; H.k = W / pw; H.cv.width = W; H.cv.height = Hh; H.tex.dispose(); H.tex.needsUpdate = true;
      const hh = Math.tan((ctx.G.cam.fov / 2) * Math.PI / 180), hw = hh * asp;
      H.m.position.set((r[0] + r[1]) / 2 * hw, (r[2] + r[3]) / 2 * hh, -1); H.m.scale.set((r[1] - r[0]) * hw, (r[3] - r[2]) * hh, 1);
    }
    return port;
  }
  function hud(ctx, stg, S) {
    const H = ctx.hud;
    if (stg < 5) { H.m.visible = false; return; }
    hudLayout(ctx); H.m.visible = true;
    if (ctx.frame % (ctx.low ? 3 : 2)) return;
    const g = H.g, W = H.w, Hh = H.h, k = H.k;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, Hh);
    g.fillStyle = "rgba(16,17,19,0.86)"; rr(g, 1, 1, W - 2, Hh - 2, 10 * k); g.fill(); g.strokeStyle = "rgba(255,255,255,0.14)"; g.lineWidth = 1; g.stroke();
    if (!ctx.play.ok) { g.fillStyle = "#ced4da"; g.font = `600 ${13 * k}px Commissioner, sans-serif`; g.textAlign = "center"; g.fillText(TT(TX.rec), W / 2, Hh / 2); H.tex.needsUpdate = true; return; }
    if (stg === 6) drawPV(ctx, g, W, Hh, k, S); else drawW(ctx, g, W, Hh, k, S, stg === 7);
    H.tex.needsUpdate = true;
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  const FONT = (k, s, w) => `${w || 500} ${(s * k).toFixed(1)}px Commissioner, sans-serif`;
  function drawW(ctx, g, W, H, k, S, patho) {
    const P = ctx.play, f = P.f, raw = S.raw || {}, x0 = 44 * k, x1 = W - 46 * k, yTop = 34 * k, yP1 = yTop + 16 * k, yP0 = H * 0.64, yV1 = H * 0.71, yV0 = H - 18 * k;
    let pmx = 0, vmn = 1e9, vmx = 0; for (let b = 0; b < NB; b++) { pmx = Math.max(pmx, f.P_lv[b], f.P_ao[b]); vmn = Math.min(vmn, f.V_lv[b]); vmx = Math.max(vmx, f.V_lv[b]); }
    const pmax = Math.ceil(Math.max(140, pmx * 1.08) / 20) * 20, vlo = Math.max(0, Math.floor(vmn / 20) * 20 - 10), vhi = Math.ceil(vmx / 20) * 20 + 10;
    const X = b => x0 + b / NB * (x1 - x0), YP = p => yP0 - p / pmax * (yP0 - yP1), YV = v => yV0 - (v - vlo) / (vhi - vlo) * (yV0 - yV1);
    g.fillStyle = "#e9ecef"; g.font = FONT(k, 12.5, 600); g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillText(TT(TX.wT), 12 * k, 20 * k);
    // фазови ленти (сиви тонове) с номерата 1–7
    let b0 = 0, alt = 0;
    for (let b = 1; b <= NB; b++) { const ph = Math.round(f.phase[b0]); if (b === NB || Math.round(f.phase[b]) !== ph) { g.fillStyle = alt ? "rgba(73,80,87,0.30)" : "rgba(134,142,150,0.13)"; g.fillRect(X(b0), yTop, X(b) - X(b0), yV0 - yTop);
      if (X(b) - X(b0) > 11 * k) { g.fillStyle = "#adb5bd"; g.font = FONT(k, 10, 600); g.textAlign = "center"; g.fillText(String(ph), (X(b0) + X(b)) / 2, yTop + 11 * k); } alt ^= 1; b0 = b; } }
    // решетка и оси
    g.strokeStyle = "rgba(255,255,255,0.09)"; g.lineWidth = 1; g.fillStyle = "#adb5bd"; g.font = FONT(k, 10); g.textAlign = "right";
    for (let p = 0; p <= pmax; p += 40) { const y = YP(p); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); g.fillText(String(p), x0 - 5 * k, y + 3.5 * k); }
    g.fillText("mmHg", x0 - 5 * k, yP1 - 4 * k);
    [vlo + 10, vhi - 10].forEach(v => { const y = YV(v); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); g.fillText(String(v), x0 - 5 * k, y + 3.5 * k); }); g.fillText("mL", x0 - 5 * k, yV1 - 4 * k);
    // градиент при стеноза: площ между P_ЛК и P_ао в изтласкването
    if (patho && num(raw.AVgrad, 0) > 15) { g.fillStyle = "rgba(224,49,49,0.28)"; g.beginPath(); let on = false;
      for (let b = 0; b < NB; b++) { if (f.av_open[b] > 0.5) { const x = X(b); if (!on) { g.moveTo(x, YP(f.P_ao[b])); on = true; } g.lineTo(x, YP(f.P_lv[b])); } }
      for (let b = NB - 1; b >= 0; b--) if (f.av_open[b] > 0.5) g.lineTo(X(b), YP(f.P_ao[b])); g.closePath(); g.fill(); }
    const line = (arr, Y, col, w) => { g.strokeStyle = col; g.lineWidth = w * k; g.lineJoin = "round"; g.beginPath(); for (let b = 0; b < NB; b++) { const x = X(b), y = Y(arr[b]); b ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
    line(f.P_la, YP, C.vio, 2); line(f.P_ao, YP, C.blue, 2.2); line(f.P_lv, YP, C.red, 2.4); line(f.V_lv, YV, C.teal, 2.2);
    // клапни събития: MC, AO, AC, MO
    g.font = FONT(k, 9.5, 700); g.textAlign = "center"; let done = "";
    for (let b = 0; b < NB; b++) { const pb = (b + NB - 1) % NB, mo = f.mv_open[b] > 0.5, mo0 = f.mv_open[pb] > 0.5, ao = f.av_open[b] > 0.5, ao0 = f.av_open[pb] > 0.5;
      let ev = mo && !mo0 ? "MO" : !mo && mo0 ? "MC" : ao && !ao0 ? "AO" : !ao && ao0 ? "AC" : null; if (!ev) continue;
      const fld = ev[0] === "M" ? f.mv_open : f.av_open, nv = ev[1] === "O" ? 1 : 0; for (let q = 1; q <= 4; q++) if ((fld[(b + q) % NB] > 0.5 ? 1 : 0) !== nv) { ev = null; break; } if (!ev || done.indexOf(ev) >= 0) continue; done += ev;   // по едно събитие на цикъл, без трептене около прехода
      const x = X(b), y = YP(ev[0] === "M" ? f.P_la[b] : f.P_ao[b]); g.fillStyle = "#f1f3f5"; g.beginPath(); g.arc(x, y, 3.2 * k, 0, 7); g.fill(); g.fillText(ev, x, y - 7 * k); }
    // надписи на кривите
    const lab = (t, y, col) => { g.fillStyle = col; g.font = FONT(k, 10.5, 700); g.textAlign = "left"; g.fillText(t, x1 + 4 * k, y); };
    const ye = [YP(f.P_lv[NB - 1]), YP(f.P_ao[NB - 1]), YP(f.P_la[NB - 1])]; ye[1] = Math.min(ye[1], ye[0] - 12 * k); ye[2] = Math.max(ye[2], ye[0] + 12 * k);
    lab(TT(TX.Pao), ye[1], C.blue); lab(TT(TX.Plv), ye[0], C.red); lab(TT(TX.Pla), ye[2], "#cc5de8"); lab(TT(TX.Vlv), YV(f.V_lv[NB - 1]) - 6 * k, "#3bc9db");
    if (patho && num(raw.RF, 0) > 0.1) { let bm = 0; for (let b = 0; b < NB; b++) if (f.P_la[b] > f.P_la[bm]) bm = b; g.fillStyle = "#cc5de8"; g.font = FONT(k, 10, 700); g.textAlign = "center"; g.fillText(TT(TX.vw), X(bm), YP(f.P_la[bm]) - 7 * k); }
    // маркер на текущия момент
    const xc = x0 + S.tau / S.T * (x1 - x0); g.strokeStyle = "#ffffff"; g.lineWidth = 1.5 * k; g.beginPath(); g.moveTo(xc, yTop); g.lineTo(xc, yV0); g.stroke();
    [[S.P_lv, YP, C.red], [S.P_ao, YP, C.blue], [S.P_la, YP, C.vio], [S.V_lv, YV, C.teal]].forEach(([v, Y, c]) => { g.fillStyle = c; g.strokeStyle = "#fff"; g.lineWidth = 1.2 * k; g.beginPath(); g.arc(xc, Y(v), 4 * k, 0, 7); g.fill(); g.stroke(); });
    const ph = Math.round(S.phase); g.fillStyle = "#f8f9fa"; g.font = FONT(k, 11.5, 600); g.textAlign = "right";
    g.fillText(fill(TT(TX.phase), ph) + (PH[ph] ? " · " + TT(PH[ph]) : ""), W - 12 * k, 20 * k);
    if (patho) { g.textAlign = "left"; g.font = FONT(k, 10.5, 600); g.fillStyle = "#ffc9c9"; const p = S.p || {};
      const t = num(raw.AVgrad, 0) > 15 ? fill(TT(TX.grad), fx(raw.AVgrad, 0)) : num(p.Rmr, 1e9) < 1e3 ? fill(TT(TX.rf), fx(num(raw.RF, 0) * 100, 0)) : TT(TX.hint);
      g.fillText(t, x0, yV1 - 8 * k); }
  }
  function drawPV(ctx, g, W, H, k, S) {
    const P = ctx.play, f = P.f, raw = S.raw || {}, p = S.p || {}, x0 = 46 * k, x1 = W - 16 * k, y0 = H - 34 * k, y1 = 38 * k;
    let vmn = 1e9, vmx = 0, pmx = 0; for (let b = 0; b < NB; b++) { vmn = Math.min(vmn, f.V_lv[b]); vmx = Math.max(vmx, f.V_lv[b]); pmx = Math.max(pmx, f.P_lv[b]); }
    const vmax = Math.ceil(Math.max(170, vmx * 1.3) / 20) * 20, pmax = Math.ceil(Math.max(140, pmx * 1.12) / 20) * 20;
    const X = v => x0 + v / vmax * (x1 - x0), Y = q => y0 - q / pmax * (y0 - y1);
    g.fillStyle = "#e9ecef"; g.font = FONT(k, 12.5, 600); g.textAlign = "left"; g.fillText(TT(TX.pvT), 12 * k, 20 * k);
    g.strokeStyle = "rgba(255,255,255,0.09)"; g.lineWidth = 1; g.fillStyle = "#adb5bd"; g.font = FONT(k, 10);
    g.textAlign = "right"; for (let q = 0; q <= pmax; q += 40) { const y = Y(q); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); g.fillText(String(q), x0 - 5 * k, y + 3.5 * k); }
    g.textAlign = "center"; for (let v = 0; v <= vmax; v += 40) { const x = X(v); g.beginPath(); g.moveTo(x, y1); g.lineTo(x, y0); g.stroke(); g.fillText(String(v), x, y0 + 13 * k); }
    g.fillText(TT(TX.vax), (x0 + x1) / 2, y0 + 27 * k); g.save(); g.translate(12 * k, (y0 + y1) / 2); g.rotate(-Math.PI / 2); g.fillText(TT(TX.pax), 0, 0); g.restore();
    g.save(); g.beginPath(); g.rect(x0, y1, x1 - x0, y0 - y1); g.clip();
    const Ees = num(p.Ees, 2.8), V0 = num(p.V0, 10), Ap = num(p.A, 0.6), kk = num(p.k, 0.024);
    // EDPVR (#e8590c) и ESPVR (#868e96), пунктир
    g.setLineDash([6 * k, 4 * k]); g.lineWidth = 1.8 * k;
    g.strokeStyle = C.org; g.beginPath(); for (let v = V0, n = 0; v <= vmax; v += 2, n++) { const q = Ap * (Math.exp(kk * (v - V0)) - 1); n ? g.lineTo(X(v), Y(q)) : g.moveTo(X(v), Y(q)); if (q > pmax) break; } g.stroke();
    g.strokeStyle = "#adb5bd"; g.beginPath(); g.moveTo(X(V0), Y(0)); g.lineTo(X(V0 + pmax / Ees), Y(pmax)); g.stroke(); g.setLineDash([]);
    // предишната примка (сиво), за сравнение след смяна на параметрите
    if (ctx.ghost.ok) { g.strokeStyle = "rgba(173,181,189,0.55)"; g.lineWidth = 1.6 * k; g.beginPath(); for (let b = 0; b <= NB; b++) { const i = b % NB, x = X(ctx.ghost.V[i]), y = Y(ctx.ghost.P[i]); b ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    // примката: площ = ударна работа
    g.beginPath(); for (let b = 0; b <= NB; b++) { const i = b % NB, x = X(f.V_lv[i]), y = Y(f.P_lv[i]); b ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.fillStyle = "rgba(224,49,49,0.2)"; g.fill(); g.strokeStyle = C.red; g.lineWidth = 2.6 * k; g.lineJoin = "round"; g.stroke();
    // Ea: (ESV, LVSP) → (EDV, 0)
    g.strokeStyle = C.blue; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(X(vmn), Y(pmx)); g.lineTo(X(vmx), Y(0)); g.stroke();
    g.restore();
    // текуща точка
    g.fillStyle = "#fff"; g.beginPath(); g.arc(X(S.V_lv), Y(S.P_lv), 5 * k, 0, 7); g.fill(); g.strokeStyle = C.red; g.lineWidth = 2 * k; g.stroke();
    // надписи
    g.font = FONT(k, 10.5, 700); g.textAlign = "left";
    const vE = Math.min(vmax * 0.92, V0 + pmax * 0.82 / Ees); g.fillStyle = "#ced4da"; g.fillText("ESPVR", X(vE) + 5 * k, Y(Ees * (vE - V0)) + 4 * k);
    let vD = V0; while (vD < vmax * 0.95 && Ap * (Math.exp(kk * (vD - V0)) - 1) < pmax * 0.3) vD += 2; g.fillStyle = "#ff8f5a"; g.textAlign = "right"; g.fillText("EDPVR", X(vD) - 4 * k, Y(Ap * (Math.exp(kk * (vD - V0)) - 1)) - 4 * k);
    g.fillStyle = "#74c0fc"; g.textAlign = "left"; g.fillText("Ea", X(vmx) + 4 * k, Y(10) );
    if (ctx.ghost.ok) { g.fillStyle = "#adb5bd"; g.font = FONT(k, 10, 600); g.fillText(TT(TX.prev), X(ctx.ghost.V[0]) + 5 * k, Y(ctx.ghost.P[0]) + 14 * k); }
    // SV (ширина) и SW (площ)
    const yb = Y(0) - 10 * k; g.strokeStyle = "#f1f3f5"; g.lineWidth = 1.2 * k; g.beginPath(); g.moveTo(X(vmn), yb); g.lineTo(X(vmx), yb); g.moveTo(X(vmn), yb - 4 * k); g.lineTo(X(vmn), yb + 4 * k); g.moveTo(X(vmx), yb - 4 * k); g.lineTo(X(vmx), yb + 4 * k); g.stroke();
    g.fillStyle = "#f1f3f5"; g.textAlign = "center"; g.font = FONT(k, 10.5, 700); g.fillText(fill(TT(TX.sv), fx(vmx - vmn, 0)), (X(vmn) + X(vmx)) / 2, yb - 7 * k);
    g.textAlign = "right"; g.font = FONT(k, 11.5, 600); g.fillText(fill(TT(TX.sw), fx(num(raw.SW, 0) * 1.333e-4, 2)), W - 12 * k, 20 * k);
  }

  // ---------- камера за етапите с HUD (сърцето в свободната половина) ----------
  function camFix(ctx, stg) {
    const cv = ctx.G.cv, asp = (cv.clientWidth || 1) / (cv.clientHeight || 1), port = asp < 1.15, key = stg + (port ? "p" : "l");
    if (ctx.camKey === key) return; ctx.camKey = key; if (stg < 5) return;
    const r = port ? 6.8 : 7.6, rk = asp < 1.3 ? Math.pow(1.3 / asp, 0.8) : 1, hh = r * rk * Math.tan(19 * Math.PI / 180), hw = hh * asp;
    let x = stg === 7 ? -0.55 : -0.4, y = stg === 7 ? 0.5 : 0.72; if (port) y += 0.42 * hh; else x -= 0.5 * hw;
    ctx.G.flyTo(x, y, 0, r, 0.12, 1.44);
  }

  // ---------- кадър ----------
  function update(ctx, i, u, dt) {
    ctx.frame++;
    const mech = (ctx.st && ctx.st.mech) || "cyc", stg = mech === "curves" ? 5 + i : i;
    let raw = null; try { raw = ctx.get(); } catch (e) { raw = null; }
    if (!raw || !isFinite(raw.V_lv) || !isFinite(raw.tc)) raw = MOCK();
    record(ctx, raw);
    const S = sample(ctx, stg, dt, raw);
    applyGeom(ctx, S);
    updParticles(ctx, S, dt);
    hud(ctx, stg, S);
    camFix(ctx, stg);
    labels(ctx, stg, S);
    if (ctx.vm && ctx.frame % 6 === 0) {
      ctx.vm.style.display = "block";
      const t = S.ok ? fill(TT(TX.slow), fx(S.slow, S.slow < 10 ? 1 : 0), fx(S.tau, 2)) : ctx.play.ok ? fill(TT(TX.live), fx(S.tau, 2)) : TT(TX.rec);
      if (ctx.vm.textContent !== t) ctx.vm.textContent = t;
    }
  }
  function labels(ctx, stg, S) {
    const out = ctx.labOut, lp = ctx.lp; out.length = 0; let n = 0;
    const put = (t, x, y, z) => { if (n >= 6) return; const q = lp[n++]; q[0] = t; q[1].set(x, y, z); out.push(q); };
    const { A, ax, Lv, sL, mvD, avD } = ctx, cx = A.x + ax.x * Lv * sL * 0.45, cy = A.y + ax.y * Lv * sL * 0.45;
    const L_ = s => TT(s);
    if (stg === 6) { put(L_(TX.lv), cx, cy, -0.3); return; }
    put(L_(TX.lv), cx, cy, -0.3); put(L_(TX.la), -1.2, 1.12, -0.25);
    if (stg !== 1) put(L_(TX.ao), -0.62, 2.55, -0.9);
    if (stg <= 2 || stg === 4 || stg === 7) put(L_(TX.mvl), mvD.x - 0.05, mvD.y - 0.28, -0.05);
    if (stg >= 2 && stg !== 5 && stg !== 6) put(L_(TX.avl), avD.x + 0.42, avD.y + 0.1, -0.05);
    if (stg === 1) put(L_(TX.pvl), -0.9, 1.25, -1.0);
    // една стойност по темата на етапа
    if (stg === 0) put(fill(L_(TX.qMV), fx(Math.max(0, S.Q_mv), 0)), mvD.x + 0.75, mvD.y - 0.55, -0.05);
    else if (stg === 1) put(fill(L_(TX.pLA), fx(S.P_la, 1)), -1.6, 0.55, -0.2);
    else if (stg === 2 || stg === 4) put(fill(L_(TX.pLV), fx(S.P_lv, 0)), cx + 0.2, cy - 0.45, -0.3);
    else if (stg === 3) put(fill(L_(TX.pAO), fx(S.P_ao, 0)), -0.15, 1.75, -0.1);
    else if (stg === 7 && S.Q_mv < -1) put(TT(TX.back), mvD.x - 0.6, mvD.y + 0.35, -0.1);
  }
  function stats(ctx, i) {
    const S = ctx.S; if (!S || S.V_lv == null) return [];
    const raw = S.raw || {}, ph = Math.round(S.phase), mech = (ctx.st && ctx.st.mech) || "cyc";
    const a = [[TT(TX.sPh), (ph ? ph + " · " : "") + TT(PH[ph] || "")], [TT(TX.sV), fx(S.V_lv, 0) + " mL"], [TT(TX.sP), fx(S.P_lv, 0) + " / " + fx(S.P_ao, 0) + " mmHg"]];
    if (mech === "curves") {
      a.push([TT(TX.sSV), fx(num(raw.SV, num(raw.EDV, 0) - num(raw.ESV, 0)), 0) + " mL"], [TT(TX.sSW), fx(num(raw.SW, 0) * 1.333e-4, 2) + " J"]);
      if (num(raw.AVgrad, 0) > 15) a.push([TT(TX.sGr), fx(raw.AVgrad, 0) + " mmHg"]);
      if (num(raw.RF, 0) > 0.05) a.push([TT(TX.sRF), fx(raw.RF * 100, 0) + " %"]);
    } else a.push([TT(TX.sPla), fx(S.P_la, 1) + " mmHg"], [TT(TX.sQ), fx(Math.max(0, S.Q_mv), 0) + " / " + fx(Math.max(0, S.Q_av), 0) + " mL/s"]);
    return a;
  }

  function dispose(ctx) {
    if (!ctx || ctx.dead) return; ctx.dead = true;
    try {
      const G = ctx.G; if (!G) return;
      G.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); });
      if (ctx.hud) ctx.hud.tex.dispose();
    } catch (e) { /* вече изчистено */ }
  }

  // ---------- регистрация ----------
  Object.assign(window.__EN = window.__EN || {}, EN);
  const SHARED = { get: null, dead: false, ctx: null };
  (window.SEC3D = window.SEC3D || {})[ID] = {
    MOCK,
    mount(wrap, getState) {
      const H = { get: typeof getState === "function" ? getState : null, dead: false, ctx: null };
      if (!wrap || !wrap.parentNode || typeof stageViewer !== "function") return () => {};
      const par = wrap.parentNode, next = wrap.nextSibling, id = wrap.id || "w3" + ID, hpx = parseInt(wrap.style.height, 10) || 460;
      wrap.remove();
      let sv = null; try { sv = stageViewer(par, mkCfg(H, id, hpx), next); } catch (e) { console.error(e); }
      return () => { H.dead = true; dispose(H.ctx); if (sv && sv.card && sv.card.parentNode) sv.card.remove(); };
    },
    cfg: (getState, id, h) => mkCfg({ get: typeof getState === "function" ? getState : null, dead: false, ctx: null }, id || "stg" + ID, h),
    stage: mkCfg(SHARED, "stgCardio", 460)
  };
})();
