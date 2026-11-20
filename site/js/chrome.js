/* ===== „Течен метал“: металически фон (WebGL), стъклени повърхности по Apple HIG, движение с GSAP =====
   Заменя js/palette.js и js/palette-metal.js (в index.html се зарежда само един от трите файла).
   Фонът е полиран метал под студийна светлина: отблясъците бавно текат, следват курсора и се плъзгат при скрол.
   Повърхностите са матирано стъкло (материал от Apple HIG), през което прозира металът. */
(function(){"use strict";
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const SYS='-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';

/* ---------- цветове и материали ---------- */
const css=`
html:root{
 --bg:transparent!important;--panel:#FFFFFF!important;--plate:#FFFFFF!important;--chip:#F1F2F4!important;--line:rgba(29,29,31,.12)!important;--ink:#1D1D1F!important;--muted:#5E5E63!important;
 --pri:#C8102E!important;--pri-h:#A50D25!important;--pri-50:rgba(200,16,46,.08)!important;--pri-100:rgba(200,16,46,.16)!important;--accent:#C8102E!important;--accent2:#1D1D1F!important;--accent3:#4F79B3!important;
 --ok:#0A60D6!important;--ok-50:rgba(10,96,214,.10)!important;--err:#C2410C!important;--err-50:rgba(194,65,12,.10)!important;--warn:#A86A00!important;--warn-50:rgba(168,106,0,.10)!important;--warn-ink:#7A4E0B!important;
 --c:#C8102E!important;--cb:#FFFFFF!important;
 --nb-ink:#1D1D1F!important;--nb-on:#FFFFFF!important;--nb-paper:#FFFFFF!important;--nb-bg:transparent!important;
 --nb-red:#C8102E!important;--nb-red-50:rgba(200,16,46,.08)!important;
 --nb-y:rgba(255,255,255,.72)!important;--nb-y-50:rgba(255,255,255,.5)!important;--nb-lm:rgba(255,255,255,.72)!important;
 --nb-pk:#C8102E!important;--nb-or:#C8102E!important;--nb-tl:#C8102E!important;--nb-rd:#C8102E!important;--nb-bl:rgba(255,255,255,.62)!important;--nb-vi:rgba(255,255,255,.62)!important;
 --nb-b:1px solid rgba(255,255,255,.75)!important;
 --glass:rgba(255,255,255,.58);--glass-strong:rgba(255,255,255,.74);--glass-edge:rgba(255,255,255,.8);
 --glass-sh:inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(29,29,31,.04),0 1px 2px rgba(20,24,32,.06),0 12px 32px rgba(20,24,32,.10);
 --nb-sh:var(--glass-sh)!important;--nb-sh-h:inset 0 1px 0 rgba(255,255,255,.95),0 20px 44px rgba(20,24,32,.16)!important;--nb-sh-s:inset 0 1px 0 rgba(255,255,255,.9),0 2px 8px rgba(20,24,32,.08)!important;
 --ease-out:cubic-bezier(.19,1,.22,1);
 color-scheme:light}
html{background:#E7E9EC!important}
html body{background:transparent!important;color:#1D1D1F;font-family:${SYS}!important;-webkit-font-smoothing:antialiased}
html body:not(#nb) h1,html body:not(#nb) h2,html body:not(#nb) h3,html body:not(#nb) .lp-h h2{font-family:${SYS}!important;letter-spacing:-.022em}
#lm-bg{position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;display:block;pointer-events:none}
#lm-bg-fallback{position:fixed;inset:0;z-index:-2;background:
 radial-gradient(120% 80% at 20% 0%,#FBFBFC 0%,rgba(251,251,252,0) 55%),
 linear-gradient(115deg,#D9DCE0 0%,#F4F5F6 28%,#C9CDD2 46%,#EEF0F2 64%,#D3D7DB 82%,#F6F7F8 100%)}
html body:not(#nb) ::selection{background:#C8102E;color:#fff}

/* стъкло: карти, панели, менюта (материал „thin/regular“ от HIG) */
html body:not(#nb) .lp-card,html body:not(#nb) .card,html body:not(#nb) .lp-plan,html body:not(#nb) .lp-feat>li,html body:not(#nb) .steps>li,
html body:not(#nb) .lp-qa-mail,html body:not(#nb) .kpi,html body:not(#nb) .sec,html body:not(#nb) .lp-stats,html body:not(#nb) .lp-qa-main details,html body:not(#nb) .lp-qa-main .qa{
 background:var(--glass)!important;-webkit-backdrop-filter:blur(22px) saturate(170%);backdrop-filter:blur(22px) saturate(170%);
 border:1px solid var(--glass-edge)!important;box-shadow:var(--glass-sh)!important;border-radius:22px!important;color:#1D1D1F}
html body:not(#nb) .lp-card{position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;transition:box-shadow .4s var(--ease-out),border-color .4s}
html body:not(#nb) .lp-card:hover{box-shadow:var(--nb-sh-h)!important}
/* метален отблясък, който следва курсора по картата */
html body:not(#nb) .lp-card::after,html body:not(#nb) .lp-feat>li::after,html body:not(#nb) .lp-plan::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:var(--sheen,0);transition:opacity .4s;
 background:radial-gradient(420px circle at var(--mx,50%) var(--my,0%),rgba(255,255,255,.75),rgba(255,255,255,0) 45%),linear-gradient(115deg,rgba(255,255,255,0) 35%,rgba(255,255,255,.35) 50%,rgba(255,255,255,0) 65%);mix-blend-mode:soft-light}
html body:not(#nb) .lp-feat>li,html body:not(#nb) .lp-plan{position:relative;overflow:hidden}
html body:not(#nb) .lp-card .n,html body:not(#nb) .nsh .n,html body:not(#nb) .sec .n{background:rgba(255,255,255,.8)!important;border:1px solid rgba(29,29,31,.08)!important;border-radius:12px!important;color:#1D1D1F!important;box-shadow:0 1px 2px rgba(20,24,32,.08)!important}
html body:not(#nb) .lp-card-img{display:block;width:100%;aspect-ratio:16/7;object-fit:cover;border-bottom:1px solid rgba(255,255,255,.6);transition:transform .9s var(--ease-out)}
html body:not(#nb) .lp-card:hover .lp-card-img{transform:scale(1.05)}
html body:not(#nb) .lp-card-tp i{border-left-color:#C8102E!important}
html body:not(#nb) .lp-card .fr{background:#C8102E!important;color:#fff!important;border:0!important;border-radius:999px!important;padding:4px 10px!important}
html body:not(#nb) .lp-card .lk{background:rgba(255,255,255,.8)!important;border:1px solid rgba(29,29,31,.1)!important;border-radius:999px!important}

/* лента за навигация: стъкло отгоре (HIG navigation bar) */
html body:not(#nb) header.bar{background:#F7F7F9!important;-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgba(29,29,31,.08)!important;box-shadow:none!important}
html body:not(#nb) aside#nav{background:rgba(250,250,252,.66)!important;-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);border-right:1px solid rgba(29,29,31,.08)!important}
html body:not(#nb) #tabbar{background:#F7F7F9!important;-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);border-top:1px solid rgba(29,29,31,.08)!important}
html body:not(#nb) .tb-search input,html body:not(#nb) #navq{background:rgba(118,118,128,.12)!important;border:0!important;border-radius:10px!important;color:#1D1D1F!important;min-height:36px}

/* бутони: капсули, поне 44 pt (HIG), червен основен и стъклен второстепенен */
html body:not(#nb) .lp-cta>a,html body:not(#nb) .b.primary,html body:not(#nb) .buy-cta,html body:not(#nb) .lp-plan .b,html body:not(#nb) .lp-plan a{border-radius:999px!important;min-height:44px}
html body:not(#nb) .lp-cta>a:first-child,html body:not(#nb) .b.primary,html body:not(#nb) .buy-cta{background:#C8102E!important;color:#fff!important;border:0!important;box-shadow:0 1px 0 rgba(255,255,255,.25) inset,0 8px 22px rgba(200,16,46,.30)!important}
html body:not(#nb) .lp-cta>a:first-child *,html body:not(#nb) .b.primary *{color:#fff!important}
html body:not(#nb) .lp-cta>a:nth-child(2){background:rgba(255,255,255,.22)!important;color:#fff!important;border:1px solid rgba(255,255,255,.55)!important;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
html body:not(#nb) .lp-cta>a:nth-child(2) *{color:#fff!important}

/* горната снимка: рамка със заоблени ъгли, като медийните рамки на Apple */
html body:not(#nb) .lp-hero{margin:12px clamp(10px,1.6vw,22px) 0!important;border-radius:28px!important;overflow:hidden!important;box-shadow:0 30px 60px rgba(20,24,32,.18)!important}
html body:not(#nb) .lp-hero::before{background:linear-gradient(90deg,rgba(12,13,16,.86) 0%,rgba(12,13,16,.55) 45%,rgba(60,10,18,.12) 100%)!important}
@media (max-width:860px){html body:not(#nb) .lp-hero::before{background:linear-gradient(0deg,rgba(12,13,16,.92) 0%,rgba(12,13,16,.6) 55%,rgba(60,10,18,.12) 100%)!important}}
html body:not(#nb) .lp-kick,html body:not(#nb) .lp-hero .lp-tag{background:rgba(255,255,255,.18)!important;color:#fff!important;border:1px solid rgba(255,255,255,.45)!important;border-radius:999px!important;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
html body:not(#nb) .lp-ecg path{stroke:#FF4D5A!important}
html body:not(#nb) .lp-sl-dots{gap:8px}
html body:not(#nb) .lp-sl-dots button{width:8px!important;height:8px!important;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.45)!important;transition:width .5s var(--ease-out),background-color .3s!important}
html body:not(#nb) .lp-sl-dots button.on{width:26px!important;background:#fff!important}
html body:not(#nb) .lp-sl-cap{border-radius:999px!important;border:1px solid rgba(255,255,255,.3)!important;background:rgba(12,13,16,.45)!important;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);padding:6px 12px!important}
html body:not(#nb) .lp-stats{border-radius:22px!important}
html body:not(#nb) .lp-stats>div,html body:not(#nb) .lp-stats>div:nth-child(n){background:transparent!important}
html body:not(#nb) .lp-stats>div+div{border-left:1px solid rgba(29,29,31,.08)!important}
html body:not(#nb) .lp-stats b,html body:not(#nb) .lp-stats>div:nth-child(n) b{color:#1D1D1F!important;font-family:${SYS}!important;letter-spacing:-.03em}
html body:not(#nb) .lp-stats>div:nth-child(2) b{color:#C8102E!important}
html body:not(#nb) .lp-stats span,html body:not(#nb) .lp-stats>div:nth-child(n) span{color:#5E5E63!important}

/* секции: прозрачни, металът прозира; тъмните ленти стават заоблени „витрини“ */
html body:not(#nb) .lp-sect,html body:not(#nb) .lp-tint{background:transparent!important;border:0!important}
html body:not(#nb) .lp-tint .lp-h h2,html body:not(#nb) .lp-sect .lp-h h2{color:#1D1D1F!important}
html body:not(#nb) .lp-tint .lp-h p,html body:not(#nb) .lp-sect .lp-h p{color:#5E5E63!important}
html body:not(#nb) .lp-dark{margin:0 clamp(10px,1.6vw,22px)!important;border-radius:28px!important;background:linear-gradient(180deg,#17181B,#0E0F11)!important;box-shadow:0 30px 60px rgba(20,24,32,.22)!important}
html body:not(#nb) .lp-dark .lp-h h2{color:#F5F5F7!important}html body:not(#nb) .lp-dark .lp-h p{color:#A1A1A6!important}
html body:not(#nb) .lp-gal a{border-radius:18px!important;overflow:hidden;border:0!important;box-shadow:0 14px 34px rgba(0,0,0,.4)!important}
html body:not(#nb) #tabbar *{box-shadow:none!important}
html body:not(#nb) #tabbar .on,html body:not(#nb) #tabbar [aria-current]{border-color:transparent!important;background:rgba(200,16,46,.10)!important;color:#C8102E!important;border-radius:12px!important}
html body:not(#nb) #tabbar .on *,html body:not(#nb) #tabbar [aria-current] *{color:#C8102E!important}
html body:not(#nb) .lp-tick{background:rgba(255,255,255,.4)!important;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-top:1px solid rgba(255,255,255,.7)!important;border-bottom:1px solid rgba(29,29,31,.06)!important;color:#1D1D1F!important}
html body:not(#nb) .lp-tick *{color:#1D1D1F!important}
html body:not(#nb) .lp-foot{background:linear-gradient(180deg,#17181B,#0E0F11)!important;border-radius:28px 28px 0 0;margin:0 clamp(10px,1.6vw,22px)}

/* остатъци от стария стил: без жълто, без твърди черни сенки и черни етикети */
html body:not(#nb) .lp-feat li:nth-child(4){background:linear-gradient(180deg,#1E1F23,#121316)!important}
html body:not(#nb) .lp-feat li:nth-child(4) h3,html body:not(#nb) .lp-feat li:nth-child(4) p{color:#F5F5F7!important}
html body:not(#nb) .lp-feat li:nth-child(4) p{color:#A1A1A6!important}
html body:not(#nb) .lp-feat>li i,html body:not(#nb) .steps>li i{background:rgba(255,255,255,.85)!important;border:1px solid rgba(29,29,31,.08)!important;border-radius:12px!important;box-shadow:0 1px 2px rgba(20,24,32,.08)!important;color:#1D1D1F!important}
html body:not(#nb) .lp-feat>li[style*="--k"] i{color:#1D1D1F!important}
html body:not(#nb) .lp-plan.pro{border:1.5px solid rgba(200,16,46,.55)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 24px 48px rgba(200,16,46,.14)!important;background:rgba(255,255,255,.72)!important}
html body:not(#nb) .lp-plan.pro .lp-tag{background:#C8102E!important;color:#fff!important;border-radius:999px!important;padding:5px 12px!important}
html body:not(#nb) .lp-plan.pro a.b.primary,html body:not(#nb) .lp-plan.pro .b.primary{background:#C8102E!important;color:#fff!important;box-shadow:0 8px 22px rgba(200,16,46,.30)!important}
html body:not(#nb) .lp-plan a.b:not(.primary){background:rgba(255,255,255,.8)!important;color:#1D1D1F!important;border:1px solid rgba(29,29,31,.1)!important;box-shadow:0 1px 2px rgba(20,24,32,.06)!important}
html body:not(#nb) .lp-qa-g>:first-child:not(details){display:inline-block;background:rgba(200,16,46,.08)!important;color:#C8102E!important;border:0!important;border-radius:999px!important;padding:6px 14px!important;box-shadow:none!important}
html body:not(#nb) .lp-qa-main summary>span:last-child:not(:first-child){border:1px solid rgba(29,29,31,.15)!important;border-radius:8px!important;box-shadow:none!important;background:rgba(255,255,255,.7)!important}
html body:not(#nb) .lp-card .lp-card-top em.fr{background:#C8102E!important;color:#fff!important;border:0!important;border-radius:999px!important;padding:4px 10px!important;box-shadow:none!important}
html body:not(#nb) header.bar a.prem{border:0!important;border-radius:999px!important;box-shadow:0 6px 16px rgba(200,16,46,.25)!important}
html body:not(#nb) header.bar .quick>*:not(.prem){border-radius:999px!important;box-shadow:none!important}
html body:not(#nb) header.bar .quick>a:last-child:not(.prem){background:rgba(255,255,255,.7)!important;border:1px solid rgba(29,29,31,.12)!important}
html body:not(#nb) .lp-cta>*:nth-child(2){background:rgba(255,255,255,.22)!important;color:#fff!important;border:1px solid rgba(255,255,255,.55)!important;border-radius:999px!important;box-shadow:none!important;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
html body:not(#nb) .lp-cta>*:nth-child(2) *{color:#fff!important}
html body:not(#nb) .lp-cta>*:first-child{border-radius:999px!important}
/* ===== урок: иконки, номера, значки и табове в стила на iOS (по-силна специфичност от стария слой) ===== */
html:root body:not(#nb) .secchip{border:0!important;border-radius:999px!important;background:rgba(255,255,255,.75)!important;box-shadow:0 1px 2px rgba(20,24,32,.08)!important;padding:5px 12px 5px 5px!important;gap:8px}
html:root body:not(#nb) .secchip i{background:#C8102E!important;color:#fff!important;border-radius:999px!important;min-width:24px;height:24px;display:inline-grid!important;place-items:center;font-style:normal;padding:0 7px!important}
html:root body:not(#nb) .badges .bdg{border:0!important;border-radius:999px!important;background:rgba(255,255,255,.75)!important;box-shadow:0 1px 2px rgba(20,24,32,.08)!important;padding:5px 11px!important;color:#1D1D1F!important}
html:root body:not(#nb) .badges .bdg.red,html:root body:not(#nb) .badges .bdg.hy,html:root body:not(#nb) .badges .bdg[class*="pri"]{background:#C8102E!important;color:#fff!important}
html:root body:not(#nb) .badges .bdg .lc{color:inherit!important}
/* табове на урока: сегментиран контрол (HIG), плътно стъкло, за да не прозира текстът при скрол */
html:root body:not(#nb) .booktabs{background:#EEEFF2!important;-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);
 border:0!important;border-radius:14px!important;padding:4px!important;gap:2px!important;box-shadow:0 1px 2px rgba(20,24,32,.06),0 8px 24px rgba(20,24,32,.08)!important;z-index:5}
html:root body:not(#nb) .booktabs button{border:0!important;border-radius:10px!important;background:transparent!important;box-shadow:none!important;color:#5E5E63!important;min-height:36px;padding:8px 16px!important}
html:root body:not(#nb) .booktabs button.on{background:#fff!important;color:#1D1D1F!important;box-shadow:0 1px 3px rgba(20,24,32,.14),0 1px 1px rgba(20,24,32,.06)!important}
html:root body:not(#nb) .booktabs button::after,html:root body:not(#nb) .booktabs button.on::after{display:none!important}
/* номерата на секциите в урока */
html:root body:not(#nb) section.book:not(.keyp) h3::before,html:root body:not(#nb) section.book h3::before{border:0!important;border-radius:9px!important;background:rgba(200,16,46,.10)!important;color:#C8102E!important;box-shadow:none!important}
/* карти, фигури, бележки и въпроси: заоблени */
html:root body:not(#nb) #main .card,html:root body:not(#nb) #main .exp,html:root body:not(#nb) #main section.card{border-radius:22px!important;border:1px solid rgba(255,255,255,.8)!important;box-shadow:var(--glass-sh)!important;background:rgba(255,255,255,.7)!important}
html:root body:not(#nb) #main .bfig,html:root body:not(#nb) #main .note,html:root body:not(#nb) #main .keyp,html:root body:not(#nb) #main table.t{border-radius:16px!important;overflow:hidden}
html:root body:not(#nb) #main .exp .tag{border:0!important;border-radius:999px!important;background:rgba(29,29,31,.06)!important;padding:3px 10px!important}
html:root body:not(#nb) #main .opts button{border:1px solid rgba(29,29,31,.08)!important;box-shadow:0 1px 2px rgba(20,24,32,.05)!important}
/* бутоните в симулациите: капсули */
html:root body:not(#nb) #main .b,html:root body:not(#nb) #main .btns button{border-radius:999px!important;border:1px solid rgba(29,29,31,.10)!important;background:rgba(255,255,255,.85)!important;box-shadow:0 1px 2px rgba(20,24,32,.06)!important;color:#1D1D1F!important}
html:root body:not(#nb) #main .b.primary{background:#C8102E!important;color:#fff!important;border-color:#C8102E!important}
html:root body:not(#nb) #main .toggle{border-radius:12px!important;border:0!important;background:rgba(118,118,128,.12)!important;padding:3px!important}
html:root body:not(#nb) #main .toggle button{border:0!important;border-radius:9px!important;box-shadow:none!important;background:transparent!important}
html:root body:not(#nb) #main .toggle button.on{background:#fff!important;box-shadow:0 1px 3px rgba(20,24,32,.14)!important}
/* платната на симулациите */
html:root body:not(#nb) #main canvas{border-radius:14px}
/* странично меню: иконки в мек заоблен квадрат, активна тема без черна рамка */
html:root body:not(#nb) aside#nav .nsh .n{border:0!important;border-radius:10px!important;background:rgba(255,255,255,.85)!important;box-shadow:0 1px 2px rgba(20,24,32,.08)!important}
html:root body:not(#nb) aside#nav .ns.open .nsh .n{background:#C8102E!important;color:#fff!important}
html:root body:not(#nb) aside#nav .ns.open .nsh .n .lc{color:#fff!important;stroke:#fff!important}
html:root body:not(#nb) aside#nav a.active{box-shadow:none!important;border:0!important;border-radius:12px!important;background:rgba(200,16,46,.09)!important;color:#C8102E!important}
html:root body:not(#nb) aside#nav .nsl a{border-radius:12px!important}
/* горна лента: езиков бутон и лента за напредъка */
html:root body:not(#nb) #langBtn{border-radius:999px!important;border:1px solid rgba(29,29,31,.12)!important;background:rgba(255,255,255,.75)!important;box-shadow:none!important;min-width:40px}
html:root body:not(#nb) .tb-prog,html:root body:not(#nb) .tb-prog *{border-radius:999px!important}
/* термини от речника: тънко плътно подчертаване вместо червени точки (не прилича на правописна грешка) */
html:root body:not(#nb) .term{border-bottom:0!important;text-decoration:underline!important;text-decoration-thickness:1.5px!important;text-underline-offset:3px!important;
 text-decoration-color:rgba(29,29,31,.28)!important;text-decoration-style:solid!important;cursor:help;border-radius:4px;transition:background-color .2s,text-decoration-color .2s;color:inherit!important}
html:root body:not(#nb) .term:hover,html:root body:not(#nb) .term:focus-visible,html:root body:not(#nb) .term.on{text-decoration-color:#C8102E!important;background:rgba(200,16,46,.07)!important}
/* изскачащото обяснение и всички плаващи панели: плътни, за да се четат */
html:root body:not(#nb) #pop{background:#FFFFFF!important;border:1px solid rgba(29,29,31,.10)!important;border-radius:16px!important;
 box-shadow:0 2px 6px rgba(20,24,32,.08),0 18px 44px rgba(20,24,32,.20)!important;padding:14px 16px!important;color:#1D1D1F!important;max-width:min(360px,calc(100vw - 32px))}
html:root body:not(#nb) #pop b{display:block;font-size:15px;margin-bottom:6px;color:#1D1D1F!important}
html:root body:not(#nb) #pop div{color:#3A3A3E!important;line-height:1.5}
html:root body:not(#nb) #pop a{color:#C8102E!important;font-weight:600;text-decoration:none!important;display:inline-block;margin-top:8px}
@media (max-width:980px){html:root body:not(#nb) aside#nav{background:#F7F7F9!important}}
html:root body:not(#nb) .tb-res,html:root body:not(#nb) .tb-search .res,html:root body:not(#nb) [role=listbox],html:root body:not(#nb) .menu,html:root body:not(#nb) dialog{background:#FFFFFF!important}
/* иконките на разделите в менюто: центрирани в заоблено квадратче */
html:root body:not(#nb) .nsh .n,html:root body:not(#nb) aside#nav .nsh .n{display:inline-grid!important;place-items:center!important;justify-content:center!important;align-content:center!important;
 width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;line-height:0!important;color:#1D1D1F!important}
html:root body:not(#nb) .nsh .n svg,html:root body:not(#nb) .lp-card .n svg,html:root body:not(#nb) .sec .n svg{display:block!important;margin:0!important;width:17px!important;height:17px!important;stroke-width:1.8!important}
html:root body:not(#nb) .lp-card .n,html:root body:not(#nb) .sec .n{display:inline-grid!important;place-items:center!important;justify-content:center!important;align-content:center!important;padding:0!important;line-height:0!important}
/* галерия със симулациите: снимката на цялата карта, надписът върху мек тъмен преход */
html:root body:not(#nb) .lp-gal a{position:relative!important;display:block;border:0!important;border-radius:20px!important;overflow:hidden!important;background:#18191C!important;
 box-shadow:0 1px 0 rgba(255,255,255,.08) inset,0 18px 40px rgba(0,0,0,.45)!important;transform:none;transition:transform .6s var(--ease-out),box-shadow .6s var(--ease-out)!important}
html:root body:not(#nb) .lp-gal a:hover{transform:translateY(-4px)!important;box-shadow:0 26px 54px rgba(0,0,0,.55)!important}
html:root body:not(#nb) .lp-gal img{display:block;width:100%!important;height:100%!important;object-fit:contain!important;object-position:50% 40%!important;transition:transform 1.2s var(--ease-out)}
html:root body:not(#nb) .lp-gal a:hover img{transform:scale(1.045)}
html:root body:not(#nb) .lp-gal a.big img{object-fit:cover!important;object-position:50% 46%!important;transform:scale(1.18)}
html:root body:not(#nb) .lp-gal a.big:hover img{transform:scale(1.22)}
html:root body:not(#nb) .lp-gal span{position:absolute!important;left:0;right:0;bottom:0;padding:44px 18px 16px!important;background:linear-gradient(0deg,rgba(12,13,16,.88) 0%,rgba(12,13,16,.55) 55%,rgba(12,13,16,0) 100%)!important;color:#fff!important}
html:root body:not(#nb) .lp-gal small{color:#FF8A95!important;letter-spacing:.02em}
/* тестове: синьо с ✓ за вярно, оранжево с ✕ за грешно (HIG системни цветове) */
html body:not(#nb) .opts button{border-radius:14px!important}
html body:not(#nb) .opts button.right{background:#0A60D6!important;color:#fff!important;border-color:#0A60D6!important}
html body:not(#nb) .opts button.right *{color:#fff!important}
html body:not(#nb) .opts button.wrong{background:#C2410C!important;color:#fff!important;border-color:#C2410C!important}
html body:not(#nb) .opts button.wrong *{color:#fff!important}
html body:not(#nb) .opts button.right::after{content:" ✓";font-weight:800}
html body:not(#nb) .opts button.wrong::after{content:" ✕";font-weight:800}
@media (prefers-reduced-transparency:reduce){html body:not(#nb) .lp-card,html body:not(#nb) .card,html body:not(#nb) header.bar{background:#F5F5F7!important;-webkit-backdrop-filter:none;backdrop-filter:none}}
`;
const st=document.createElement("style");st.id="liquid-metal";st.textContent=css;document.head.appendChild(st);
new MutationObserver(()=>{if(st.nextElementSibling&&st.nextElementSibling.tagName==="STYLE")document.head.appendChild(st)}).observe(document.head,{childList:true});
const tc=()=>{document.querySelectorAll('meta[name="theme-color"]').forEach(m=>m.content="#E7E9EC");document.documentElement.style.colorScheme="light"};tc();addEventListener("load",tc);

/* ---------- металически фон: шейдър ---------- */
const fb=document.createElement("div");fb.id="lm-bg-fallback";
const cv=document.createElement("canvas");cv.id="lm-bg";cv.setAttribute("aria-hidden","true");
function mountBg(){if(!document.body)return setTimeout(mountBg,30);document.body.prepend(cv);document.body.prepend(fb);startGL()}
const U={mx:.5,my:.35,scroll:0,calm:0};
function startGL(){
  const gl=cv.getContext("webgl",{antialias:false,alpha:false,premultipliedAlpha:false,powerPreference:"low-power"});if(!gl){cv.remove();return}
  const VS="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const FS=`precision highp float;
uniform vec2 uRes;uniform float uTime,uScroll,uCalm;uniform vec2 uMouse;
/* тапет в стила на iPadOS: големи гладки дъги от ъглите, с мек светъл ръб; сребро, графит, кардио червено.
   Лявата и средната част остават светли, защото там е текстът. */
float arc(vec2 p,vec2 c,float r,float t,float k){vec2 d=p-c;float a=atan(d.y,d.x);
  return length(d)-r-.035*sin(a*3.+t)-.02*sin(a*5.-t*1.3+k);}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float ar=uRes.x/uRes.y;vec2 p=vec2((uv.x-.5)*ar,uv.y-.5);
  float t=uTime*.15;vec2 m=(uMouse-.5)*.05;float sc=uScroll;
  vec3 col=mix(vec3(.83,.845,.86),vec3(.975,.978,.982),smoothstep(-.2,1.,uv.y-.2*uv.x+.2));
  /* 1) голям светъл сатенен лист отляво горе */
  float d1=arc(p-m*.6,vec2(-.55*ar,.95),1.05+.03*sin(t*.7),t,0.);
  col=mix(col,vec3(.985,.987,.99),(1.-smoothstep(-.04,.02,d1))*.8);
  col+=exp(-pow(d1/.014,2.))*.18;
  /* 2) графитна дъга в горния десен ъгъл */
  float d2=arc(p-m*1.5,vec2(.5*ar+.20,.60+sc*.12),(.56+.02*sin(t*.9+1.))*mix(.72,1.,clamp(ar,0.,1.)),t*1.1,1.7);
  float s2=1.-smoothstep(-.006,.006,d2);
  vec3 c2=mix(vec3(.30,.32,.36),vec3(.12,.13,.15),smoothstep(-.35,0.,d2));
  col*=1.-.12*exp(-pow((d2-.03)/.05,2.))*(1.-s2);
  col=mix(col,c2,s2);
  col+=vec3(.93,.95,.98)*exp(-pow(d2/.009,2.))*.6;
  /* 3) червена дъга в долния десен ъгъл */
  float d3=arc(p+m*1.3,vec2(.5*ar+.10,-.70-sc*.10),(.60+.02*sin(t*.8+2.))*mix(.72,1.,clamp(ar,0.,1.)),-t,.6);
  float s3=1.-smoothstep(-.006,.006,d3);
  vec3 c3=mix(vec3(.86,.12,.22),vec3(.45,.03,.09),smoothstep(-.4,0.,d3));
  col*=1.-.12*exp(-pow((d3-.03)/.05,2.))*(1.-s3);
  col=mix(col,c3,s3);
  col+=vec3(1.,.84,.86)*exp(-pow(d3/.009,2.))*.55;
  col+=(hash(gl_FragCoord.xy)-.5)*.012;
  /* в уроците: почти равномерен сребрист фон */
  vec3 flt=mix(vec3(.885,.89,.90),vec3(.955,.958,.962),uv.y);
  col=mix(col,flt,uCalm*.85);
  gl_FragColor=vec4(col,1.);
}`;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(o));return null}return o};
  const vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs){cv.remove();return}
  const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.useProgram(pr);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,"p");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const uRes=gl.getUniformLocation(pr,"uRes"),uTime=gl.getUniformLocation(pr,"uTime"),uScroll=gl.getUniformLocation(pr,"uScroll"),uMouse=gl.getUniformLocation(pr,"uMouse"),uCalm=gl.getUniformLocation(pr,"uCalm");
  /* рисуваме на половин разделителна способност: металът е мек и така фонът не натоварва телефона */
  const SCALE=.5;function size(){cv.width=Math.max(2,Math.round(innerWidth*SCALE));cv.height=Math.max(2,Math.round(innerHeight*SCALE));gl.viewport(0,0,cv.width,cv.height)}
  size();addEventListener("resize",size);
  let t0=performance.now(),last=0,vis=true;document.addEventListener("visibilitychange",()=>{vis=!document.hidden});
  /* плавно движение около 30 кадъра/s; при „намалено движение“ фонът стои */
  /* телефон: в уроците фонът е почти равномерен — рисува се само при промяна (скрол, размер, преход), без време;
     на началната страница тече, но спира, докато пръстът превърта — така скролът и бутоните остават плавни */
  const PHONE=(()=>{try{return matchMedia("(max-width:700px)").matches||/iPhone|Android.+Mobile/i.test(navigator.userAgent)}catch(e){return false}})();
  let touching=false,sig="",tFrozen=0;if(PHONE){addEventListener("touchstart",()=>touching=true,{passive:true});addEventListener("touchend",()=>setTimeout(()=>touching=false,250),{passive:true});addEventListener("touchcancel",()=>touching=false,{passive:true})}
  function draw(now){if(PHONE&&vis){const calm=U.calm>0.5;if(!calm&&!touching)tFrozen=(now-t0)/1000;const k=[cv.width,cv.height,U.calm.toFixed(3),U.scroll.toFixed(3),U.mx.toFixed(3),U.my.toFixed(3),calm?0:tFrozen.toFixed(2)].join();
      if(k===sig||now-last<(calm?66:40)){requestAnimationFrame(draw);return}sig=k;last=now;gl.uniform2f(uRes,cv.width,cv.height);gl.uniform1f(uTime,RM?0:tFrozen);gl.uniform1f(uScroll,U.scroll);gl.uniform2f(uMouse,U.mx,U.my);gl.uniform1f(uCalm,U.calm);gl.drawArrays(gl.TRIANGLES,0,3);requestAnimationFrame(draw);return}
    if(vis&&now-last>=33){last=now;gl.uniform2f(uRes,cv.width,cv.height);gl.uniform1f(uTime,RM?0:(now-t0)/1000);gl.uniform1f(uScroll,U.scroll);gl.uniform2f(uMouse,U.mx,U.my);gl.uniform1f(uCalm,U.calm);gl.drawArrays(gl.TRIANGLES,0,3)}
    requestAnimationFrame(draw)}
  requestAnimationFrame(draw);
}
mountBg();

/* ---------- движение с GSAP ---------- */
const load=src=>new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
const G="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/";
(window.gsap?Promise.resolve():load(G+"gsap.min.js")).then(()=>window.ScrollTrigger?null:load(G+"ScrollTrigger.min.js")).then(initMotion).catch(()=>{});
function initMotion(){const gsap=window.gsap;gsap.registerPlugin(window.ScrollTrigger);const ST=window.ScrollTrigger;
  /* курсорът и скролът местят отблясъците по метала плавно, с инерция */
  const qx=gsap.quickTo(U,"mx",{duration:3.5,ease:"power2.out"}),qy=gsap.quickTo(U,"my",{duration:3.5,ease:"power2.out"});
  const calmNow=()=>gsap.to(U,{calm:document.body.classList.contains("lp")?0:1,duration:1.2,ease:"power2.out"});calmNow();addEventListener("hashchange",()=>setTimeout(calmNow,60));
  addEventListener("pointermove",e=>{qx(e.clientX/innerWidth);qy(1-e.clientY/innerHeight)},{passive:true});
  const qs=gsap.quickTo(U,"scroll",{duration:2.5,ease:"power2.out"});
  addEventListener("scroll",()=>qs(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)),{passive:true});
  if(RM)return;
  const EASE="expo.out";
  function enhance(){const main=document.getElementById("main");if(!main)return;
    /* началото: заглавие, текст, бутони и числата влизат едно след друго */
    const hero=main.querySelector(".lp-hero:not([data-gs])");
    if(hero){hero.dataset.gs=1;const parts=[...hero.querySelectorAll(".lp-tag,.lp-kick,h1,.lp-lead,.lp-cta,.lp-free,.lp-sl-ui")].filter(Boolean);
      gsap.from(parts,{y:28,opacity:0,duration:1.25,ease:EASE,stagger:.08,delay:.15,clearProps:"transform,opacity"});
      const stats=main.querySelector(".lp-stats");if(stats)gsap.from(stats,{y:40,opacity:0,duration:1.25,ease:EASE,delay:.5,clearProps:"transform,opacity"})}
    /* секции: заглавието и картите се появяват при скрол, на групи */
    main.querySelectorAll(".lp-sect:not([data-gs])").forEach(sec=>{sec.dataset.gs=1;
      const h=sec.querySelector(".lp-h,.lp-qa-side");if(h)gsap.from(h,{y:36,opacity:0,duration:1.25,ease:EASE,clearProps:"transform,opacity",scrollTrigger:{trigger:h,start:"top 88%",once:true}});
      const items=sec.querySelectorAll(".lp-card,.lp-feat>li,.steps>li,.lp-gal>a,.lp-plan,.lp-qa-main>*");
      if(items.length)ST.batch(items,{start:"top 92%",once:true,onEnter:b=>gsap.from(b,{y:48,opacity:0,duration:1.25,ease:EASE,stagger:.07,clearProps:"transform,opacity"})})});
    /* вътрешни страници: картите и блоковете се появяват меко */
    main.querySelectorAll(".card:not([data-gs]),.sec:not([data-gs])").forEach(c=>{c.dataset.gs=1;gsap.from(c,{y:24,opacity:0,duration:1,ease:EASE,clearProps:"transform,opacity",scrollTrigger:{trigger:c,start:"top 94%",once:true}})});
    /* карти: лек наклон към курсора и метален отблясък, който го следва */
    main.querySelectorAll(".lp-card:not([data-tilt]),.lp-feat>li:not([data-tilt]),.lp-plan:not([data-tilt])").forEach(c=>{c.dataset.tilt=1;
      const rx=gsap.quickTo(c,"rotationX",{duration:.8,ease:"power3.out"}),ry=gsap.quickTo(c,"rotationY",{duration:.8,ease:"power3.out"});gsap.set(c,{transformPerspective:900});
      c.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        rx((.5-y)*5);ry((x-.5)*6);c.style.setProperty("--mx",(x*100)+"%");c.style.setProperty("--my",(y*100)+"%");c.style.setProperty("--sheen",1)});
      c.addEventListener("pointerleave",()=>{rx(0);ry(0);c.style.setProperty("--sheen",0)})});
    ST.refresh()}
  enhance();
  const main=document.getElementById("main");if(main)new MutationObserver(()=>requestAnimationFrame(enhance)).observe(main,{childList:true});
}
})();
/* телефон: таблиците се превъртат в собствената си рамка, надписите в 3D са по-компактни */
(function(){const st=document.createElement("style");st.textContent=`@media (max-width:700px){#main table.t{display:block;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;font-size:13px}#main table.t th,#main table.t td{padding:7px 8px}}
#main .book table.t{margin:6px 0 16px}
@media (max-width:560px){.cap-l{font-size:12px!important;padding:4px 8px!important;max-width:60%!important}.cap-r{font-size:11px!important;padding:4px 7px!important;max-width:38%!important}}`;document.head.appendChild(st)})();
