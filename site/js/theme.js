/* ===== Клинична тема: светла, чиста, в стила на платформите за медицинско обучение =====
   Само визия и малки помощни елементи (търсачка, напредък, баджове, кутии). Логиката не се променя.
   Иконите са от Lucide (ISC лиценз), шрифтът е Inter (SIL OFL 1.1). */
(function(){
const EN=window.PHYS_LANG==="en",L=(b,e)=>EN?e:b;
/* --- икони (Lucide, 24×24, линия) --- */
const P={
 zap:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
 dumbbell:'<path d="M14.4 14.4 9.6 9.6"/><path d="M18.66 21.49a2 2 0 1 1-2.83-2.83l-1.77 1.77a2 2 0 1 1-2.83-2.83l6.36-6.36a2 2 0 1 1 2.83 2.83l-1.77 1.77a2 2 0 1 1 2.83 2.83z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.4 12.77a2 2 0 1 1-2.83-2.83l1.77-1.77a2 2 0 1 1-2.83-2.83l2.83-2.83a2 2 0 1 1 2.83 2.83l1.77-1.77a2 2 0 1 1 2.83 2.83z"/>',
 droplet:'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
 heartpulse:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
 wind:'<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
 droplets:'<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
 flask:'<path d="M10 2v7.53a2 2 0 0 1-.21.9L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.07-10.13a2 2 0 0 1-.21-.9V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
 utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
 thermo:'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
 dna:'<path d="m10 16 1.5 1.5"/><path d="m14 8-1.5-1.5"/><path d="M15 2c-1.8 2-2.52 4-2.8 6"/><path d="m16.5 10.5 1 1"/><path d="m17 6-2.89-2.89"/><path d="M2 15c6.67-6 13.33 0 20-6"/><path d="m20 9 .89.89"/><path d="M3.11 14.11 4 15"/><path d="m6.5 12.5 1 1"/><path d="m7 18 2.89 2.89"/><path d="M9 22c1.8-2 2.52-4 2.8-6"/>',
 eye:'<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
 brain:'<path d="M12 5a3 3 0 1 0-6 .13 4 4 0 0 0-2.52 5.77 4 4 0 0 0 .55 6.59A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 6 .13 4 4 0 0 1 2.52 5.77 4 4 0 0 1-.55 6.59A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.6 6.5A3 3 0 0 0 18 5"/><path d="M6 5a3 3 0 0 0 .4 1.5"/>',
 search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 star:'<path d="M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.91l5.16-.75a2.12 2.12 0 0 0 1.6-1.16z"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
 steth:'<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
 box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
 sliders:'<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
 checks:'<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
 shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
 check:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
 micro:'<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>'
};
const ico=(n,s=18)=>`<svg class="lc" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||""}</svg>`;
const SEC_ICO={I:"zap",II:"dumbbell",III:"droplet",IV:"heartpulse",V:"wind",VI:"droplets",VII:"flask",VIII:"utensils",IX:"thermo",X:"dna",XI:"eye",XII:"brain"};
window.PHYS_ICO=ico;

/* --- стилове --- */
const css=`
@font-face{font-family:"Inter";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/inter-latin-wght-normal.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Inter";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/inter-latin-ext-wght-normal.woff2) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Inter";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/inter-cyrillic-wght-normal.woff2) format("woff2");unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:"Inter";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/inter-cyrillic-ext-wght-normal.woff2) format("woff2");unicode-range:U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F}
@font-face{font-family:"Inter";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/inter-greek-wght-normal.woff2) format("woff2");unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF}
:root{--font:"Inter",ui-sans-serif,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
 --sans:var(--font);--serif:var(--font);--cond:var(--font);
 --bg:#F4F7F9;--panel:#FFFFFF;--line:#E2E8F0;--chip:#F1F5F9;--ink:#0F172A;--muted:#64748B;--plate:#FFFFFF;
 --accent:#0F766E;--accent2:#0F766E;--pri:#0F766E;--pri-h:#0B5F59;--pri-50:#F0FDFA;--pri-100:#CCFBF1;
 --ok:#10B981;--ok-50:#ECFDF5;--err:#EF4444;--err-50:#FEF2F2;--warn:#F59E0B;--warn-50:#FFFBEB;--warn-ink:#92400E;
 --r:10px;--r2:8px;--sh:0 1px 2px rgba(15,23,42,.04),0 1px 3px rgba(15,23,42,.05);--sh2:0 8px 24px rgba(15,23,42,.08)}
@media (prefers-color-scheme:dark){:root{--bg:#0B1220;--panel:#111A2B;--line:#1E293B;--chip:#162133;--ink:#E2E8F0;--muted:#94A3B8;--plate:#111A2B;
 --accent:#2DD4BF;--accent2:#2DD4BF;--pri:#14B8A6;--pri-h:#0D9488;--pri-50:#0F2A2A;--pri-100:#134E4A;
 --ok-50:#0B2A22;--err-50:#2A1414;--warn-50:#2A2110;--warn-ink:#FCD34D;--sh:0 0 0 1px rgba(255,255,255,.02);--sh2:0 8px 24px rgba(0,0,0,.4)}}
html,body{background:var(--bg)}
body{font-family:var(--font);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased;font-feature-settings:"cv11","ss01"}
h1,h2,h3,h4,.pw-t,.fa-h,.intro h1{font-family:var(--font)!important;letter-spacing:-.02em}
h1{font-weight:750}h2,h3{font-weight:700}
.btxt p,.btxt li,.lead,main p{line-height:1.6}
/* горна лента */
header.bar{background:var(--panel)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;border-bottom:1px solid var(--line);box-shadow:none}
.brand b{font-family:var(--font)!important;font-weight:750;letter-spacing:-.02em}
.brand svg path{stroke:var(--pri)}
.crumb .t{font-weight:650}
.tb-search{position:relative;flex:0 1 340px;min-width:180px;margin-left:auto}
.tb-search input{width:100%;box-sizing:border-box;height:38px;border:1px solid var(--line);border-radius:8px;background:var(--chip);padding:0 12px 0 36px;font:500 14px/1 var(--font);color:var(--ink);transition:border-color .15s,background .15s,box-shadow .15s}
.tb-search input:hover{border-color:#CBD5E1}
.tb-search input:focus{outline:0;background:var(--panel);border-color:var(--pri);box-shadow:0 0 0 3px color-mix(in srgb,var(--pri) 18%,transparent)}
.tb-search>.lc{position:absolute;left:11px;top:10px;color:var(--muted);pointer-events:none}
.tb-res{position:absolute;left:0;right:0;top:44px;z-index:70;background:var(--panel);border:1px solid var(--line);border-radius:10px;box-shadow:var(--sh2);padding:6px;display:none;max-height:min(60vh,420px);overflow:auto}
.tb-res.on{display:block}
.tb-res a{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:center;padding:8px 10px;border-radius:7px;color:var(--ink);text-decoration:none;font-size:14px;line-height:1.35}
.tb-res a small{display:block;color:var(--muted);font-size:12px}
.tb-res a:hover,.tb-res a.sel{background:var(--pri-50)}
.tb-res a .ic{width:28px;height:28px;border-radius:7px;display:grid;place-items:center;background:var(--pri-50);color:var(--pri)}
.tb-res .none{padding:10px;color:var(--muted);font-size:14px}
.tb-prog{display:flex;align-items:center;gap:10px;flex:none;font-size:12.5px;color:var(--muted);font-weight:600}
.tb-prog i{display:block;width:110px;height:6px;border-radius:99px;background:var(--chip);overflow:hidden;box-shadow:inset 0 0 0 1px var(--line)}
.tb-prog b{display:block;height:100%;background:var(--pri);border-radius:99px;transition:width .4s}
.quick{margin-left:0!important}
.quick a{border-radius:8px!important;font-weight:600;color:var(--ink);transition:background .15s,color .15s}
.quick a:hover{background:var(--chip)}
.quick a.on{background:var(--pri-50)!important;color:var(--pri)!important}
.quick a.prem{color:var(--pri)!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pri) 45%,transparent)!important}
.quick a.prem.on{background:var(--pri)!important;color:#fff!important}
#langBtn{border-radius:8px!important;background:var(--chip);border:1px solid var(--line)!important}
@media (max-width:1100px){.tb-prog i{width:70px}}
@media (max-width:860px){.tb-search{display:none}.tb-prog{display:none}}
.tb-line{display:none}
@media (max-width:860px){.tb-line{display:block;position:fixed;left:0;right:0;top:calc(var(--barH) + env(safe-area-inset-top));height:3px;z-index:39;background:transparent}.tb-line b{display:block;height:100%;background:var(--pri);transition:width .4s}}
/* странична лента */
aside#nav{background:var(--panel)!important;border-right:1px solid var(--line)}
.navhead h2{font-weight:750;font-size:13px!important;text-transform:none;color:var(--muted)}
#navq{border:1px solid var(--line)!important;border-radius:8px!important;background:var(--chip)!important;font-family:var(--font)}
#navq:focus{outline:0;border-color:var(--pri)!important;background:var(--panel)!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--pri) 18%,transparent)}
.nsh{border-radius:8px!important;transition:background .15s}
.nsh:hover{background:var(--chip)!important}
.nsh .n,.ns .nsh .n{width:30px;height:30px!important;border-radius:8px!important;background:var(--pri-50)!important;color:var(--pri)!important;display:grid!important;place-items:center!important;font-size:0!important}
.ns.open .nsh .n{background:var(--pri)!important;color:#fff!important}
.ns.open .nsh .n .lc{color:#fff;stroke:#fff}
.nsh .h{font-weight:600;font-size:14px}
.nsl a{border-radius:7px!important;color:var(--ink);transition:background .15s,color .15s}
.nsl a:hover{background:var(--chip)}
.nsl a.active{background:var(--pri-50)!important;color:var(--pri)!important;box-shadow:inset 3px 0 0 var(--pri)!important;font-weight:650}
.navfoot{background:var(--panel)!important;border-top:1px solid var(--line)}
.navfoot .pm{border-color:var(--line)!important;transition:border-color .15s,background .15s}
.navfoot .pm:hover{border-color:var(--pri)!important;background:var(--pri-50)!important}
.navfoot .pm svg{color:var(--pri)}
/* карти */
.card,section.book,.sec,.pw-card,.fa-hero,.cont2,.kpi,.fa-map li,.faq details,.pw-shot,.fa-gal a{background:var(--panel);border:1px solid var(--line)!important;border-radius:12px!important;box-shadow:var(--sh)!important}
.card{border-radius:12px!important}
.sec{transition:border-color .15s,box-shadow .15s}
.sec:hover{border-color:#CBD5E1!important;box-shadow:var(--sh2)!important}
.sec .n{width:36px;height:36px!important;min-width:36px!important;border-radius:9px!important;background:var(--pri-50)!important;color:var(--pri)!important;display:grid!important;place-items:center!important;font-size:0!important}
.sec h4{font-family:var(--font)!important;font-weight:650;font-size:16px;letter-spacing:-.01em}
.sec li a{transition:background .15s,color .15s}
.sec li a:hover{background:var(--pri-50);color:var(--pri)}
.pbar{background:var(--chip)!important;border-radius:99px;overflow:hidden}
.pbar>div{background:var(--pri)!important;border-radius:99px}
/* начало */
.intro{border-bottom:0;padding-top:4px}
.intro h1{font-size:clamp(32px,4.4vw,44px)!important;font-weight:780!important;letter-spacing:-.03em}
.cont2{border-left:4px solid var(--pri)!important;transition:box-shadow .15s,border-color .15s}
.cont2:hover{box-shadow:var(--sh2)!important}
.cont2 .cn{width:42px;height:42px;border-radius:10px;background:var(--pri-50);color:var(--pri);display:grid;place-items:center;font-size:0}
.cont2 b{font-family:var(--font)!important;font-weight:700;letter-spacing:-.01em}
.cont2 .cg{background:var(--pri)!important;color:#fff!important;border-radius:8px;transition:background .15s}
.cont2:hover .cg{background:var(--pri-h)!important}
.hsec h3{font-family:var(--font)!important;font-weight:750}
.hsec a{color:var(--pri)}
/* тема: заглавие, табове, баджове */
.secchip{background:var(--pri-50)!important;color:var(--pri)!important;border-radius:999px!important;font-weight:650}
.secchip i{background:var(--pri)!important;border-radius:999px!important}
.badges{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 16px}
.bdg{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font:600 12.5px/1 var(--font);border:1px solid transparent;white-space:nowrap}
.bdg .lc{width:14px;height:14px}
.bdg.pri{background:var(--pri-50);color:var(--pri);border-color:var(--pri-100)}
.bdg.gray{background:var(--chip);color:#334155;border-color:var(--line)}
.bdg.ok{background:var(--ok-50);color:#047857;border-color:#A7F3D0}
.bdg.warn{background:var(--warn-50);color:var(--warn-ink);border-color:#FDE68A}
@media (prefers-color-scheme:dark){.bdg.gray{color:var(--ink)}.bdg.ok{color:#6EE7B7;border-color:#065F46}.bdg.warn{border-color:#78350F}}
.booktabs{border-bottom:1px solid var(--line)!important;background:var(--bg)!important;box-shadow:0 -8px 0 var(--bg)!important}
.subnav{background:var(--bg)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.booktabs button{font-family:var(--font)!important;font-weight:600!important;color:var(--muted)!important;transition:color .15s,border-color .15s}
.booktabs button:hover{color:var(--ink)!important}
.booktabs button.on{color:var(--pri)!important;border-bottom-color:var(--pri)!important}
.subnav a.on{background:var(--pri)!important;color:#fff!important}
section.book h3{font-family:var(--font)!important;font-weight:700;letter-spacing:-.015em}
section.book h3 .num,section.book h3>span:first-child{color:var(--pri)!important;border-color:var(--pri-100)!important;background:var(--pri-50)!important;border-radius:7px!important}
.bfig{border-radius:10px!important}
.bfig figcaption b{color:var(--pri)}
a.gl,abbr,.term{text-decoration-color:color-mix(in srgb,var(--pri) 55%,transparent)!important}
/* кутии */
.callout,section.keyp,.note{position:relative;border:1px solid var(--line)!important;border-left:4px solid var(--c)!important;border-radius:10px!important;background:var(--cb)!important;box-shadow:none!important;padding:14px 16px 14px 16px!important}
section.keyp{--c:var(--warn);--cb:var(--warn-50)}
.note{--c:var(--pri);--cb:var(--pri-50);font-size:14.5px;line-height:1.55;color:var(--ink)}
.co-clin{--c:#0284C7;--cb:#F0F9FF}
@media (prefers-color-scheme:dark){.co-clin{--cb:#0C2333}}
.co-lbl{display:flex;align-items:center;gap:8px;margin:0 0 8px;font:700 12.5px/1 var(--font);letter-spacing:.01em;color:var(--c)}
section.keyp .co-lbl{color:var(--warn-ink)}
.co-clin{display:block;margin:12px 0;padding:12px 14px 12px 16px;border:1px solid var(--line);border-left:4px solid var(--c);border-radius:10px;background:var(--cb)}
/* бутони и полета */
button,.b,a.b{transition:background .15s,border-color .15s,color .15s,box-shadow .15s,transform .1s}
.b,a.b,.btns button,button.b{border-radius:8px!important;font-family:var(--font)!important;font-weight:600}
.btns button:hover,.b:hover{border-color:var(--pri)!important;color:var(--pri)}
.btns button.on,.b.pri,.b.primary,.sub{background:var(--pri)!important;border-color:var(--pri)!important;color:#fff!important}
.btns button.on:hover,.sub:hover{background:var(--pri-h)!important}
button:active{transform:translateY(1px)}
:focus-visible{outline:2px solid var(--pri)!important;outline-offset:2px}
input[type=range]{accent-color:var(--pri)}
input[type=checkbox],input[type=radio]{accent-color:var(--pri)}
input:not([type]),input[type=text],input[type=email],input[type=password],input[type=search],select,textarea{font-family:var(--font)}
/* тестове */
.opts{gap:8px!important}
.opts button{border:1px solid var(--line)!important;border-radius:10px!important;background:var(--panel)!important;padding:12px 14px!important;font-family:var(--font)!important;line-height:1.45;box-shadow:var(--sh)}
.opts button:hover:not(:disabled){border-color:var(--pri)!important;background:var(--pri-50)!important}
.opts button.right{border-color:var(--ok)!important;background:var(--ok-50)!important;box-shadow:inset 3px 0 0 var(--ok)}
.opts button.wrong{border-color:var(--err)!important;background:var(--err-50)!important;box-shadow:inset 3px 0 0 var(--err)}
.expl{border-left:4px solid var(--pri);background:var(--pri-50);border-radius:8px;padding:10px 14px}
/* покупка — в основния цвят */
.buy-cta{background:var(--pri)!important;border-radius:8px!important}
.buy-cta:hover{background:var(--pri-h)!important;filter:none!important}
.pw-k{color:var(--pri)!important;font-family:var(--font)!important}
.pw-price b,.fa-num dt{font-family:var(--font)!important;font-weight:780!important;letter-spacing:-.03em}
.pw-lead svg,.pw-in li svg{color:var(--pri)!important}
.pw-free a,.pw-code:hover{color:var(--pri)}
.fa-num div{border-left:3px solid var(--pri-100)!important}
.fa-map li{border-left:1px solid var(--line)!important}
.fa-map li b{width:30px;height:30px;border-radius:8px;background:var(--pri-50);color:var(--pri)!important;display:grid;place-items:center;font-size:0!important}
.fa-map li.free b{background:var(--ok-50);color:#047857!important}
.fa-map li.free em{color:#047857!important}
.fa-ok{border-color:#A7F3D0!important;background:var(--ok-50)!important}.fa-ok-ic{background:var(--ok)!important}
.pw-sec b{display:none}
.pw-sec{background:var(--pri-50);color:var(--pri)!important;border-radius:999px;padding:5px 12px;font-weight:650}
/* таблици */
table.t{border-collapse:separate;border-spacing:0;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--panel)}
table.t th{background:var(--chip);font-weight:650;color:#334155;text-align:left}
table.t th,table.t td{padding:8px 12px;border-bottom:1px solid var(--line)}
table.t tr:last-child td{border-bottom:0}
@media (prefers-color-scheme:dark){table.t th{color:var(--ink)}}
#pop{border-radius:10px!important;box-shadow:var(--sh2)!important;border-color:var(--line)!important}
`;
const st=document.createElement("style");st.id="theme-css";st.textContent=css;document.head.appendChild(st);

/* --- горна лента: търсачка и напредък --- */
const $=s=>document.querySelector(s);
function topics(){return typeof READY!=="undefined"?READY:[]}
function addBar(){const bar=$("header.bar");if(!bar||$(".tb-search"))return;
  const wrap=document.createElement("div");wrap.className="tb-search";wrap.setAttribute("role","search");
  wrap.innerHTML=`${ico("search",17)}<input id="tbq" type="search" autocomplete="off" placeholder="${L("Търси тема, напр. ЕКГ, нефрон…","Search topics, e.g. ECG, nephron…")}" aria-label="${L("Търси тема","Search topics")}"><div class="tb-res" role="listbox"></div>`;
  const pr=document.createElement("div");pr.className="tb-prog";pr.title=L("Решени въпроси","Questions solved");pr.innerHTML=`<span id="tbpt">0%</span><i><b id="tbpb" style="width:0"></b></i>`;
  const quick=bar.querySelector(".quick");bar.insertBefore(wrap,quick);bar.insertBefore(pr,quick);
  const line=document.createElement("div");line.className="tb-line";line.innerHTML='<b id="tbpl" style="width:0"></b>';document.body.appendChild(line);
  const q=wrap.querySelector("input"),res=wrap.querySelector(".tb-res");let sel=0,list=[];
  const norm=s=>(s||"").toLowerCase().replace(/<[^>]+>/g,"");
  function render(){const v=norm(q.value).trim();if(!v){res.classList.remove("on");return}
    list=topics().filter(r=>norm((window.T?T(r.t):r.t)+" "+r.t+" "+(r.sec&&r.sec.name)).includes(v)).slice(0,8);sel=0;
    res.innerHTML=list.length?list.map((r,i)=>`<a href="#${r.id}" class="${i===0?"sel":""}"><span class="ic">${ico(SEC_ICO[r.sec.id]||"micro",16)}</span><span>${window.T?T(r.t):r.t}<small>${r.sec.id}. ${window.T?T(r.sec.name):r.sec.name}</small></span></a>`).join(""):`<div class="none">${L("Няма такава тема. Опитай с друга дума или виж Речника.","No matching topic. Try another word or check the Glossary.")}</div>`;
    res.classList.add("on")}
  q.addEventListener("input",render);q.addEventListener("focus",render);
  q.addEventListener("keydown",e=>{const a=[...res.querySelectorAll("a")];if(!a.length)return;
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();sel=(sel+(e.key==="ArrowDown"?1:-1)+a.length)%a.length;a.forEach((x,i)=>x.classList.toggle("sel",i===sel))}
    else if(e.key==="Enter"){e.preventDefault();location.hash=a[sel].getAttribute("href").slice(1);q.value="";res.classList.remove("on");q.blur()}
    else if(e.key==="Escape"){res.classList.remove("on");q.blur()}});
  res.addEventListener("click",e=>{if(e.target.closest("a")){q.value="";res.classList.remove("on")}});
  document.addEventListener("click",e=>{if(!wrap.contains(e.target))res.classList.remove("on")})}
function prog(){try{const s=expStats(),p=s.tot?Math.round(s.ans/s.tot*100):0;const t=$("#tbpt"),b=$("#tbpb"),l=$("#tbpl");if(t&&t.textContent!==p+"%")t.textContent=p+"%";if(b)b.style.width=p+"%";if(l)l.style.width=p+"%";const w=$(".tb-prog");if(w)w.title=L(`Решени въпроси: ${s.ans} от ${s.tot}`,`Questions solved: ${s.ans} of ${s.tot}`)}catch(e){}}

/* --- икони на разделите, баджове и информационни кутии --- */
function decorate(){
  document.querySelectorAll(".nsh .n,.sec .n,.cont2 .cn,.fa-map li b").forEach(n=>{if(n.dataset.ic)return;const id=n.textContent.trim();if(!SEC_ICO[id])return;n.dataset.ic=1;n.title=L("Раздел ","Section ")+id;n.innerHTML=ico(SEC_ICO[id],n.closest(".nsh")?16:18)});
  // баджове под заглавието на темата
  const id=(location.hash||"").slice(1),it=topics().find(r=>r.id===id),main=$("#main");
  if(it&&main&&!main.querySelector(".badges")&&!main.querySelector(".pw")){const h=main.querySelector("h1,h2");if(h&&!h.closest(".card,section")){
    let q=0;try{q=topicProg(id)[1]}catch(e){}
    const bk=(typeof BOOK!=="undefined"&&BOOK[id])||{},is3d=/3D/.test((bk.adv||"")+" "+it.t),free=!!(window.PHYS_PREMIUM&&PHYS_PREMIUM.free&&PHYS_PREMIUM.free.includes(id));
    const tag=(i,t,c)=>`<span class="bdg ${c}">${ico(i,14)}${t}</span>`;
    const b=[tag("sliders",L("Симулация","Simulation"),"gray")];
    if(is3d)b.push(tag("box",L("3D модел","3D model"),"gray"));
    if(q)b.push(tag("checks",q+" "+L("въпроса","questions"),"gray"));
    if(main.querySelector("section.keyp"))b.push(tag("star","High-Yield","warn"));
    if(free)b.push(tag("check",L("Безплатно","Free"),"ok"));
    h.insertAdjacentHTML("afterend",`<div class="badges">${b.join("")}</div>`)}}
  // кутии
  document.querySelectorAll("section.keyp").forEach(s=>{if(s.querySelector(".co-lbl"))return;s.insertAdjacentHTML("afterbegin",`<div class="co-lbl">${ico("star",15)}High-Yield</div>`)});
  document.querySelectorAll(".btxt p").forEach(p=>{if(p.dataset.co)return;p.dataset.co=1;if(/^\s*(Клинич|Clinical|В клиниката|In the clinic)/.test(p.textContent)){p.classList.add("co-clin");p.insertAdjacentHTML("afterbegin",`<span class="co-lbl">${ico("steth",15)}${L("Клинична бележка","Clinical note")}</span>`)}});
  document.querySelectorAll(".navfoot .pm svg").forEach(s=>{if(s.dataset.ic)return;s.outerHTML=ico("shield",18).replace('class="lc"','class="lc" data-ic="1"')});
}
let tm=0;const mo=new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{decorate();prog()},150)});
function start(){addBar();decorate();prog();mo.observe(document.body,{childList:true,subtree:true});addEventListener("hashchange",()=>setTimeout(prog,300));setInterval(prog,4000)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
