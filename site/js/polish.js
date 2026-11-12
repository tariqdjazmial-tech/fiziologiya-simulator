/* ===== Довършителен слой: сенки, анимации на бутоните, обратна връзка при отговор =====
   Само визия. Не променя логиката. Уважава "намалено движение" в настройките на устройството. */
(function(){
const css=`
:root{
 --pz-ease:cubic-bezier(.2,.8,.2,1);
 --pz-sh-btn:0 1px 2px rgba(15,23,42,.06),0 1px 1px rgba(15,23,42,.04);
 --pz-sh-btn-h:0 4px 10px -2px rgba(15,23,42,.10),0 2px 4px -2px rgba(15,23,42,.06);
 --pz-sh-pri:0 1px 2px color-mix(in srgb,var(--pri) 30%,transparent),0 4px 12px -3px color-mix(in srgb,var(--pri) 45%,transparent);
 --pz-sh-pri-h:0 2px 4px color-mix(in srgb,var(--pri) 30%,transparent),0 10px 22px -6px color-mix(in srgb,var(--pri) 55%,transparent);
 --pz-sh-card-h:0 2px 4px rgba(15,23,42,.04),0 12px 28px -8px rgba(15,23,42,.14);
 --pz-ring:0 0 0 3px color-mix(in srgb,var(--pri) 28%,transparent);
}
@media (prefers-color-scheme:dark){:root{
 --pz-sh-btn:0 1px 2px rgba(0,0,0,.4);
 --pz-sh-btn-h:0 6px 14px -4px rgba(0,0,0,.55);
 --pz-sh-card-h:0 14px 30px -10px rgba(0,0,0,.6);
}}

/* --- шрифт: Onest (SIL OFL 1.1), с Inter като резерва за символи --- */
@font-face{font-family:"Onest";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/onest-latin-wght-normal.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Onest";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/onest-latin-ext-wght-normal.woff2) format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Onest";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/onest-cyrillic-wght-normal.woff2) format("woff2");unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:"Onest";font-style:normal;font-weight:100 900;font-display:swap;src:url(fonts/onest-cyrillic-ext-wght-normal.woff2) format("woff2");unicode-range:U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F}
:root{--font:"Onest","Inter",ui-sans-serif,-apple-system,"Segoe UI",Roboto,Arial,sans-serif!important}
body,button,input,select,textarea,h1,h2,h3,h4,h5{font-family:var(--font)!important}
h1,h2{letter-spacing:-.02em}

/* --- основни бутони: обем, долен ръб, блясък --- */
:root{
 --pz-edge:color-mix(in srgb,var(--pri) 62%,#000);
 --pz-top:color-mix(in srgb,var(--pri) 82%,#fff);
}
.b.primary,.b.pri,button.b.primary,a.b.primary,.buy-cta,.cont2 .cg,.sub,.btns button.on{
 position:relative;overflow:hidden;border-radius:10px!important;
 border:1px solid var(--pz-edge)!important;color:#fff!important;
 background:linear-gradient(180deg,var(--pz-top),var(--pri) 55%)!important;
 box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 2px 0 var(--pz-edge),0 6px 14px -4px color-mix(in srgb,var(--pri) 55%,transparent)!important;
 text-shadow:0 1px 0 rgba(0,0,0,.12);
 transition:transform .18s var(--pz-ease),box-shadow .18s var(--pz-ease),filter .18s!important}
.b.primary:hover,.b.pri:hover,.buy-cta:hover,.sub:hover,.btns button.on:hover,.cont2:hover .cg,.cont2 .cg:hover{
 transform:translateY(-2px);background:linear-gradient(180deg,color-mix(in srgb,var(--pri) 74%,#fff),color-mix(in srgb,var(--pri) 92%,#fff) 60%)!important;
 box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 4px 0 var(--pz-edge),0 14px 26px -8px color-mix(in srgb,var(--pri) 65%,transparent)!important}
.b.primary:active,.b.pri:active,.buy-cta:active,.sub:active,.btns button.on:active,.cont2:active .cg{
 transform:translateY(2px);filter:brightness(.97);
 box-shadow:inset 0 2px 4px rgba(0,0,0,.18),0 0 0 var(--pz-edge),0 2px 6px -2px color-mix(in srgb,var(--pri) 45%,transparent)!important;
 transition-duration:.05s!important}
/* блясък при посочване */
.b.primary::after,.buy-cta::after,.cont2 .cg::after,.sub::after{content:"";position:absolute;inset:0;pointer-events:none;
 background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.32) 50%,transparent 65%);transform:translateX(-130%)}
.b.primary:hover::after,.buy-cta:hover::after,.cont2:hover .cg::after,.sub:hover::after{transform:translateX(130%);transition:transform .75s var(--pz-ease)}
/* главните бутони "дишат", за да се забелязват */
.buy-cta,.cont2 .cg{animation:pz-breathe 3.6s ease-in-out 1.2s infinite}
.buy-cta:hover,.cont2:hover .cg{animation:none}
@keyframes pz-breathe{0%{outline:2px solid color-mix(in srgb,var(--pri) 50%,transparent);outline-offset:0}45%,100%{outline:2px solid color-mix(in srgb,var(--pri) 0%,transparent);outline-offset:9px}}

/* --- нови контури: без сиви рамки, мек пръстен и сянка; бутоните са с форма на хапче --- */
:root{--pz-ring1:0 0 0 1px rgba(15,23,42,.07);--pz-card:0 0 0 1px rgba(15,23,42,.06),0 1px 2px rgba(15,23,42,.04),0 8px 20px -12px rgba(15,23,42,.18)}
@media (prefers-color-scheme:dark){:root{--pz-ring1:0 0 0 1px rgba(255,255,255,.08);--pz-card:0 0 0 1px rgba(255,255,255,.07),0 10px 24px -14px rgba(0,0,0,.7)}}
.b.primary,.b.pri,button.b.primary,a.b.primary,.buy-cta,.cont2 .cg,.sub,.btns button.on,.quick a.prem.on{border-radius:999px!important}
.b:not(.primary):not(.pri),.btns button:not(.on),.quick a.prem:not(.on),header.bar button:not(.iconbtn),.pw-card .b{
 border:0!important;border-radius:999px!important;
 background:color-mix(in srgb,var(--pri) 9%,var(--panel))!important;color:var(--pri)!important;
 box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pri) 24%,transparent),0 1px 2px rgba(15,23,42,.06)!important;
 transition:transform .18s var(--pz-ease),box-shadow .18s var(--pz-ease),background-color .15s,color .15s!important}
.b:not(.primary):not(.pri):hover,.btns button:not(.on):hover,.quick a.prem:not(.on):hover,header.bar button:not(.iconbtn):hover{
 transform:translateY(-2px);background:color-mix(in srgb,var(--pri) 15%,var(--panel))!important;
 box-shadow:inset 0 0 0 1.5px var(--pri),0 8px 16px -8px color-mix(in srgb,var(--pri) 55%,transparent)!important}
.b:not(.primary):not(.pri):active,.btns button:not(.on):active,.quick a.prem:active,header.bar button:not(.iconbtn):active{
 transform:translateY(1px) scale(.98);box-shadow:inset 0 0 0 1.5px var(--pri),inset 0 2px 4px rgba(15,23,42,.1)!important;transition-duration:.05s!important}
.card,section.book,.sec,.pw-card,.fa-hero,.cont2,.kpi,.fa-map li,.faq details,.pw-shot,.fa-gal a,.kt,.steps li,.pager a,.navfoot .pm{
 border:0!important;border-radius:16px!important;box-shadow:var(--pz-card)!important}
.callout,section.keyp,.note{border:0!important;border-left:4px solid var(--c)!important;border-radius:12px!important;box-shadow:var(--pz-ring1)!important}
.opts button{border:0!important;border-radius:14px!important;box-shadow:var(--pz-ring1),0 1px 2px rgba(15,23,42,.05)!important}
.opts button:hover:not(:disabled){box-shadow:inset 0 0 0 2px var(--pri),0 10px 18px -10px rgba(15,23,42,.25)!important}
.opts button.right{box-shadow:inset 0 0 0 2px var(--ok),0 6px 14px -8px color-mix(in srgb,var(--ok) 60%,transparent)!important}
.opts button.wrong{box-shadow:inset 0 0 0 2px var(--err),0 6px 14px -8px color-mix(in srgb,var(--err) 60%,transparent)!important}
#navq,.tb-search input{border-radius:999px!important}

/* --- палитра по раздели --- */
.sec,.cont2,.ns{--sec-50:color-mix(in srgb,var(--sec) 13%,var(--panel))}
.sec{box-shadow:inset 0 4px 0 var(--sec),var(--pz-card)!important;overflow:hidden}
.sec .n,.cont2 .cn{background:var(--sec-50)!important;color:var(--sec)!important}
.sec .pbar>div,.cont2 .pbar>div{background:var(--sec)!important}
.sec .pc{color:var(--sec)!important;font-weight:700}
.sec li a:hover{background:var(--sec-50)!important;color:var(--sec)!important}
.sec:hover{box-shadow:inset 0 4px 0 var(--sec),var(--pz-sh-card-h)!important}
.cont2{box-shadow:inset 5px 0 0 var(--sec),var(--pz-card)!important}
.cont2:hover{box-shadow:inset 5px 0 0 var(--sec),var(--pz-sh-card-h)!important}
.nsh .n,.ns .nsh .n{background:var(--sec-50)!important;color:var(--sec)!important}
.ns.open .nsh .n{background:var(--sec)!important;color:#fff!important}
.ns.open .nsl a.active{color:var(--sec)!important;background:var(--sec-50)!important;box-shadow:inset 3px 0 0 var(--sec)!important}
.secchip{background:color-mix(in srgb,var(--sec,var(--pri)) 13%,var(--panel))!important;color:var(--sec,var(--pri))!important}
.secchip i{background:var(--sec,var(--pri))!important}

/* --- начална страница --- */
.hero{position:relative;isolation:isolate;overflow:hidden;border-radius:24px;min-height:380px;display:flex;align-items:flex-end;margin:2px 0 18px;
 background:#3b0a10;box-shadow:0 24px 48px -26px rgba(127,29,29,.7),0 0 0 1px rgba(127,29,29,.15)}
.hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 45%;z-index:-2;transform-origin:65% 45%;animation:pz-kb 26s ease-in-out infinite alternate}
.hero::before{content:"";position:absolute;inset:0;z-index:-1;
 background:linear-gradient(90deg,rgba(35,4,9,.86) 0%,rgba(55,6,14,.6) 42%,rgba(55,6,14,.05) 78%),linear-gradient(0deg,rgba(30,3,8,.5),transparent 50%)}
.hero-in{position:relative;padding:40px 44px;max-width:600px;color:#fff;animation:pz-in .7s var(--pz-ease) .1s both}
.hero-kick{margin:0;color:#FECDD3;font-weight:600;font-size:14.5px}
.hero h1{color:#fff!important;font-size:clamp(40px,5.4vw,64px)!important;font-weight:800!important;line-height:1!important;letter-spacing:-.035em;margin:10px 0 14px!important;text-shadow:0 2px 24px rgba(0,0,0,.35)}
.hero-lead{margin:0 0 24px;color:rgba(255,255,255,.9);font-size:17px;line-height:1.6}
.hero a,.hband a,.b{text-decoration:none!important}
.nsh .n .lc,.sec .n .lc,.cont2 .cn .lc{color:inherit!important;stroke:currentColor!important}
.ns.open .nsh .n .lc{color:#fff!important}
.hero-cta{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.hero .b.primary{padding:14px 26px!important;font-size:16px!important}
.hero-alt{display:inline-flex;align-items:center;padding:13px 22px;border-radius:999px;color:#fff!important;font-weight:650;text-decoration:none;
 background:rgba(255,255,255,.12);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.4);
 transition:transform .18s var(--pz-ease),background-color .18s}
.hero-alt:hover{background:rgba(255,255,255,.22);transform:translateY(-2px)}
.hero-alt:active{transform:translateY(1px)}
/* ===== истинска начална страница (лендинг) ===== */
body.lp:not(.navopen) #nav{display:none!important}
body.lp main,body.lp #main{max-width:none!important;padding:0!important;margin:0!important;width:100%}
body.lp .layout{display:block}
.lp-w{max-width:1160px;margin:0 auto;padding:0 32px;box-sizing:border-box}
.lp-hero{position:relative;isolation:isolate;overflow:hidden;min-height:min(86vh,700px);display:flex;align-items:center;background:#2a050b;color:#fff}
.lp-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:60% 45%;z-index:-2;transform-origin:60% 45%;animation:pz-kb 28s ease-in-out infinite alternate}
.lp-hero::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(28,3,8,.9) 0%,rgba(45,5,12,.7) 38%,rgba(45,5,12,.15) 75%,rgba(45,5,12,0) 100%),linear-gradient(0deg,rgba(20,2,6,.55),transparent 35%)}
.lp-hero-in{width:100%;padding-top:72px;padding-bottom:110px;animation:pz-in .8s var(--pz-ease) .1s both}
.lp-hero-in>*{max-width:620px}
.lp-kick{margin:0;color:#FDA4AF;font-weight:650;font-size:15px}
.lp-hero h1{color:#fff!important;font-size:clamp(38px,5.6vw,68px)!important;font-weight:800!important;line-height:1.02!important;letter-spacing:-.035em!important;margin:14px 0 18px!important;text-shadow:0 2px 30px rgba(0,0,0,.35);border:0!important;padding:0!important}
.lp-lead{margin:0 0 28px;font-size:18.5px;line-height:1.6;color:rgba(255,255,255,.9)}
.lp-cta{display:flex;flex-wrap:wrap;gap:12px}
.lp-cta .b.primary{padding:15px 28px!important;font-size:16.5px!important}
.lp-ghost{font:inherit;font-weight:650;font-size:16px;padding:14px 24px;border:0;border-radius:999px;cursor:pointer;color:#fff!important;background:rgba(255,255,255,.12)!important;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.45)!important;transition:transform .18s var(--pz-ease),background-color .18s!important}
.lp-ghost:hover{background:rgba(255,255,255,.22)!important;transform:translateY(-2px)}
.lp-note{display:flex;align-items:center;gap:8px;margin:20px 0 0;font-size:14px;color:rgba(255,255,255,.75)}
.lp-note .lc{color:#6EE7B7}
.lp-stats{position:relative;z-index:2;margin:-56px 0 0;display:grid;grid-template-columns:repeat(4,1fr);background:var(--panel);border-radius:20px;box-shadow:0 0 0 1px rgba(15,23,42,.05),0 24px 50px -24px rgba(15,23,42,.35)}
.lp-stats>div{padding:22px 24px;text-align:center}
.lp-stats>div+div{box-shadow:-1px 0 0 var(--line)}
.lp-stats b{display:block;font-size:34px;font-weight:800;letter-spacing:-.03em;line-height:1.1}
.lp-stats>div:nth-child(1) b{color:#0D9488}.lp-stats>div:nth-child(2) b{color:#E11D48}.lp-stats>div:nth-child(3) b{color:#4F46E5}.lp-stats>div:nth-child(4) b{color:#D97706}
.lp-stats span{font-size:14px;color:var(--muted)}
.lp-w>.cont2{margin-top:22px}
.lp-sect{padding:84px 0 0}
.lp-tint{margin-top:84px;padding:72px 0;background:color-mix(in srgb,var(--pri) 5%,var(--bg))}
.lp-tint+.lp-sect{padding-top:72px}
.lp-dark{margin-top:84px;padding:76px 0;background:#14060A;color:#fff}
.lp-dark+.lp-sect{padding-top:76px}
.lp-dark .lp-h h2{color:#fff!important}.lp-dark .lp-h p{color:rgba(255,255,255,.72)}
.lp-h{max-width:680px;margin:0 0 34px}
.lp-h h2{margin:0 0 10px!important;font-size:clamp(28px,3.4vw,40px)!important;font-weight:800!important;letter-spacing:-.03em!important;line-height:1.12!important;border:0!important;padding:0!important}
.lp-h p{margin:0;font-size:17px;line-height:1.6;color:var(--muted)}
.lp-feat{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.lp-feat li{padding:26px 24px;border-radius:20px;background:var(--panel);box-shadow:var(--pz-card);transition:transform .22s var(--pz-ease),box-shadow .22s var(--pz-ease)}
.lp-feat li:hover{transform:translateY(-4px);box-shadow:0 0 0 1px color-mix(in srgb,var(--k) 30%,transparent),0 22px 40px -22px color-mix(in srgb,var(--k) 60%,transparent)}
.lp-feat i{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;color:#fff;background:var(--k);box-shadow:0 10px 20px -10px var(--k);margin-bottom:16px;transition:transform .25s var(--pz-ease)}
.lp-feat li:hover i{transform:rotate(-6deg) scale(1.06)}
.lp-feat h3{margin:0 0 6px!important;font-size:18.5px!important;font-weight:750!important}
.lp-feat p{margin:0;font-size:15px;line-height:1.6;color:var(--muted)}
.lp-gal{display:grid;grid-template-columns:1.3fr 1fr 1fr;grid-template-rows:repeat(2,230px);gap:16px}
.lp-gal a{position:relative;overflow:hidden;border-radius:18px;background:#fff;display:block;text-decoration:none;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
.lp-gal a.big{grid-row:span 2}
.lp-gal img{width:100%;height:100%;object-fit:cover;object-position:center 30%;transition:transform .5s var(--pz-ease)}
.lp-gal a:hover img{transform:scale(1.05)}
.lp-gal span{position:absolute;left:0;right:0;bottom:0;padding:30px 16px 14px;color:#fff;font-weight:700;font-size:15.5px;line-height:1.3;background:linear-gradient(0deg,rgba(10,3,6,.88),transparent)}
.lp-gal small{display:block;font-weight:600;font-size:12.5px;color:color-mix(in srgb,var(--sec) 45%,#fff);margin-bottom:2px}
.lp-secs{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.sec.lp-sec{display:flex!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center;gap:14px;padding:16px 18px!important;text-decoration:none;color:var(--ink);box-shadow:inset 4px 0 0 var(--sec),var(--pz-card)!important;transition:transform .2s var(--pz-ease),box-shadow .2s var(--pz-ease)!important}
.sec.lp-sec:hover{transform:translateY(-3px);box-shadow:inset 4px 0 0 var(--sec),var(--pz-sh-card-h)!important}
.lp-sec .n{flex:none;width:44px!important;height:44px!important;min-width:44px!important;border-radius:12px!important}
.lp-sec-t{flex:1;min-width:0}
.lp-sec-t b{display:block;font-size:15.5px;font-weight:700;line-height:1.3}
.lp-sec-t small{color:var(--muted);font-size:13px}
.lp-sec em{flex:none;font-style:normal;color:var(--muted)}
.lp-sec em.fr{font-size:12.5px;font-weight:700;color:var(--ok,#10B981);background:color-mix(in srgb,var(--ok,#10B981) 12%,var(--panel));padding:4px 10px;border-radius:999px}
.lp-price{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:880px}
.lp-plan{position:relative;display:flex;flex-direction:column;gap:14px;padding:30px 28px;border-radius:22px;background:var(--panel);box-shadow:var(--pz-card)}
.lp-plan h3{margin:0!important;font-size:19px!important;font-weight:750!important}
.lp-amt{margin:0;display:flex;align-items:baseline;gap:10px}
.lp-amt b{font-size:46px;font-weight:800;letter-spacing:-.03em;line-height:1}
.lp-amt span{color:var(--muted)}
.lp-plan ul{list-style:none;margin:4px 0 6px;padding:0;display:grid;gap:10px;flex:1;align-content:start}
.lp-plan li{display:flex;gap:10px;align-items:flex-start;font-size:15.5px;line-height:1.45}
.lp-plan li .lc{flex:none;color:var(--pri);margin-top:2px}
.lp-plan .b{justify-content:center;padding:13px 20px!important;font-size:15.5px!important}
.lp-plan small{text-align:center;color:var(--muted);font-size:13px}
.lp-plan.pro{background:linear-gradient(160deg,color-mix(in srgb,var(--pri) 9%,var(--panel)),var(--panel) 60%);box-shadow:0 0 0 2px var(--pri),0 26px 50px -26px color-mix(in srgb,var(--pri) 70%,transparent)}
.lp-tag{position:absolute;top:-13px;left:28px;padding:5px 12px;border-radius:999px;background:var(--pri);color:#fff;font-size:12.5px;font-weight:700}
.lp-have{display:flex;justify-content:center;gap:8px;align-items:center;padding:12px;border-radius:999px;font-weight:700;color:var(--pri);background:var(--pri-50)}
.lp-faq{max-width:820px}
.lp-faq details{border-radius:16px;background:var(--panel);box-shadow:var(--pz-card);margin-bottom:12px;overflow:hidden}
.lp-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:14px;padding:18px 22px;font-weight:700;font-size:16.5px}
.lp-faq summary::-webkit-details-marker{display:none}
.lp-faq summary .lc{flex:none;color:var(--muted);transition:transform .25s var(--pz-ease)}
.lp-faq details[open] summary .lc{transform:rotate(180deg)}
.lp-faq p{margin:0;padding:0 22px 20px;color:var(--muted);font-size:15.5px;line-height:1.6}
.lp-w>.hband{margin-top:80px}
.lp-foot{margin-top:84px;padding:56px 0 28px;background:#0B1220;color:#CBD5E1}
.lp-foot .lp-w{display:grid;grid-template-columns:1.6fr 1fr 1fr 1.2fr;gap:30px}
.lp-fb b{font-size:20px;color:#fff}.lp-fb p{margin:8px 0 0;font-size:14.5px;line-height:1.6;color:#94A3B8;max-width:300px}
.lp-foot h4{margin:0 0 12px;font-size:13.5px;color:#fff;font-weight:700}
.lp-foot nav a{display:block;margin:0 0 9px;color:#94A3B8!important;text-decoration:none;font-size:14.5px;transition:color .15s}
.lp-foot nav a:hover{color:#fff!important}
.lp-copy{max-width:1160px;margin:36px auto 0;padding:20px 32px 0;box-sizing:border-box;border-top:1px solid rgba(255,255,255,.08);font-size:13px;color:#64748B}
body.lp .tb-line{display:none!important}
@media (max-width:980px){.lp-feat,.lp-secs{grid-template-columns:repeat(2,1fr)}.lp-foot .lp-w{grid-template-columns:1fr 1fr}}
@media (max-width:860px){
 .lp-w{padding:0 18px}
 .lp-hero{min-height:620px;align-items:flex-end}
 .lp-hero::before{background:linear-gradient(0deg,rgba(28,3,8,.94) 0%,rgba(45,5,12,.72) 55%,rgba(45,5,12,.2) 100%)}
 .lp-hero-in{padding-top:120px;padding-bottom:90px}
 .lp-lead{font-size:16px}
 .lp-cta>*{flex:1 1 100%;justify-content:center;text-align:center}
 .lp-stats{grid-template-columns:repeat(2,1fr);margin-top:-44px}
 .lp-stats>div{padding:16px 10px}.lp-stats b{font-size:27px}
 .lp-stats>div:nth-child(3){box-shadow:0 -1px 0 var(--line)}.lp-stats>div:nth-child(4){box-shadow:-1px 0 0 var(--line),0 -1px 0 var(--line)}
 .lp-sect{padding-top:60px}.lp-tint,.lp-dark{margin-top:60px;padding:52px 0}.lp-tint+.lp-sect,.lp-dark+.lp-sect{padding-top:52px}
 .lp-feat,.lp-secs,.lp-price{grid-template-columns:1fr}
 .lp-gal{grid-template-columns:1fr 1fr;grid-template-rows:none;grid-auto-rows:150px}
 .lp-gal a.big{grid-column:span 2;grid-row:auto;height:220px}
 .lp-foot{padding-bottom:calc(var(--tabH,64px) + 24px)}
 .lp-foot .lp-w{grid-template-columns:1fr}
 .lp-w>.hband{margin-top:56px}
}
@media (prefers-color-scheme:dark){.lp-stats{box-shadow:0 0 0 1px rgba(255,255,255,.07),0 24px 50px -24px rgba(0,0,0,.8)}.lp-foot{background:#060A13}}
@keyframes pz-kb{from{transform:scale(1)}to{transform:scale(1.08)}}
.kgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:0 0 18px}
.kt{display:flex;align-items:center;gap:14px;padding:16px 18px;background:var(--panel)}
.kt i{flex:none;width:46px;height:46px;border-radius:14px;display:grid;place-items:center;color:var(--k);background:color-mix(in srgb,var(--k) 13%,var(--panel))}
.kt b{display:block;font-size:26px;font-weight:780;letter-spacing:-.02em;line-height:1.05;color:var(--ink)}
.kt span{font-size:13px;color:var(--muted);line-height:1.35}
.steps{list-style:none;padding:0;margin:0 0 26px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;counter-reset:st}
.steps li{position:relative;padding:20px 20px 18px;background:var(--panel);counter-increment:st;overflow:hidden}
.steps li::after{content:counter(st);position:absolute;right:16px;top:10px;font-size:46px;font-weight:800;color:color-mix(in srgb,var(--k) 14%,transparent);line-height:1}
.steps li i{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:#fff;background:var(--k);box-shadow:0 8px 16px -8px var(--k);margin-bottom:12px}
.steps li b{display:block;font-size:17px;font-weight:720;color:var(--ink);margin-bottom:4px}
.steps li p{margin:0;font-size:14.5px;line-height:1.55;color:var(--muted)}
.hsec{margin-top:6px!important}
.hband{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:26px 0 6px;padding:28px 30px;border-radius:24px;color:#fff;
 background:radial-gradient(120% 140% at 0% 0%,#9F1239 0%,#4C0519 55%,#1E1B4B 100%);box-shadow:0 24px 44px -26px rgba(76,5,25,.8)}
.hband h3{margin:0 0 6px;color:#fff!important;font-size:22px;font-weight:780;letter-spacing:-.02em}
.hband p{margin:0;color:rgba(255,255,255,.82);font-size:15px}
.hband .b.primary{flex:none;padding:14px 24px!important;font-size:15.5px!important;background:#fff!important;color:#9F1239!important;border-color:#fff!important;text-shadow:none;
 box-shadow:0 2px 0 rgba(0,0,0,.25),0 10px 24px -8px rgba(0,0,0,.5)!important}
.hband .b.primary:hover{background:#FFF1F2!important}
@media (max-width:1100px){.kgrid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:860px){
 .hero{min-height:440px;border-radius:18px;margin-top:0}
 .hero::before{background:linear-gradient(0deg,rgba(35,4,9,.92) 0%,rgba(55,6,14,.65) 50%,rgba(55,6,14,.1) 100%)}
 .hero-in{padding:24px 22px}
 .hero-lead{font-size:15.5px}
 .hero-cta>*{flex:1 1 auto;justify-content:center;text-align:center}
 .kgrid{gap:10px}.kt{padding:14px;gap:10px}.kt i{width:40px;height:40px;border-radius:12px}.kt b{font-size:22px}
 .steps{grid-template-columns:1fr;gap:10px}
 .hband{flex-direction:column;align-items:stretch;padding:24px 22px;border-radius:18px}
 .hband .b.primary{justify-content:center}
}

/* иконите в бутоните се движат */
button svg,.b svg,.quick a svg,.navfoot .pm svg,.buy-cta svg{transition:transform .25s var(--pz-ease)}
.b:hover svg,.btns button:hover svg,.buy-cta:hover svg{transform:translateX(2px) scale(1.08)}
.quick a.prem:hover svg{transform:rotate(-18deg) scale(1.2)}
.navfoot .pm:hover svg{transform:scale(1.15) rotate(-6deg)}

/* връзките в горната лента: подчертаване, което се плъзга */
.quick a:not(.prem){position:relative}
.quick a:not(.prem)::after{content:"";position:absolute;left:12px;right:12px;bottom:4px;height:2px;border-radius:2px;background:var(--pri);
 transform:scaleX(0);transform-origin:left;transition:transform .25s var(--pz-ease)}
.quick a:not(.prem):hover::after,.quick a.on:not(.prem)::after{transform:scaleX(1)}

/* други карти-бутони */
.pager a,.navfoot .pm{border:0!important;border-radius:16px!important;
 box-shadow:var(--pz-card)!important;
 transition:transform .2s var(--pz-ease),box-shadow .2s var(--pz-ease),border-color .15s,background-color .15s!important}
.pager a:hover,.navfoot .pm:hover{transform:translateY(-2px);
 box-shadow:inset 0 0 0 1.5px var(--pri),0 14px 24px -12px rgba(15,23,42,.25)!important}
.pager a:active,.navfoot .pm:active{transform:translateY(1px);transition-duration:.05s!important}
.pager a.nx b::after{content:"";display:inline-block;width:.5em;height:.5em;margin-left:.45em;vertical-align:.08em;
 border-right:2px solid currentColor;border-top:2px solid currentColor;transform:rotate(45deg);transition:transform .2s var(--pz-ease)}
.pager a.nx:hover b::after{transform:translateX(5px) rotate(45deg)}

/* долната лента на телефона */
#tabbar a,#tabbar button{transition:transform .15s var(--pz-ease),color .15s}
#tabbar a:active,#tabbar button:active{transform:scale(.9)}
#tabbar .on svg{animation:pz-hop .4s var(--pz-ease)}
@keyframes pz-hop{0%{transform:translateY(0)}40%{transform:translateY(-4px) scale(1.1)}100%{transform:none}}

/* --- вълна при докосване --- */
.pz-rip{position:absolute;border-radius:50%;pointer-events:none;transform:scale(0);opacity:.35;
 background:currentColor;animation:pz-rip .55s var(--pz-ease) forwards}
.b.primary .pz-rip,.buy-cta .pz-rip,.cont2 .cg .pz-rip,.sub .pz-rip,.btns button.on .pz-rip{background:#fff;opacity:.4}
@keyframes pz-rip{to{transform:scale(1);opacity:0}}

/* --- карти, по които се цъка --- */
.cont2,.sec,.fa-gal a,.pw-shot{transition:transform .22s var(--pz-ease),box-shadow .22s var(--pz-ease),border-color .15s!important}
.cont2:hover,.fa-gal a:hover{transform:translateY(-2px);box-shadow:var(--pz-sh-card-h)!important}
.sec:hover{box-shadow:var(--pz-sh-card-h)!important}
.sec .n,.cont2 .cn{transition:transform .25s var(--pz-ease),background-color .2s,color .2s}
.sec:hover .n,.cont2:hover .cn{transform:scale(1.06) rotate(-4deg)}
.sec li a{transition:background .15s,color .15s,padding-left .2s var(--pz-ease)!important}
.sec li a:hover{padding-left:14px!important}

/* --- табове: подчертаване, което се разтяга --- */
.booktabs button{position:relative;border-bottom-color:transparent!important}
.booktabs button::after{content:"";position:absolute;left:12px;right:12px;bottom:-1px;height:3px;border-radius:3px 3px 0 0;
 background:var(--pri);transform:scaleX(0);transition:transform .28s var(--pz-ease)}
.booktabs button.on::after{transform:scaleX(1)}
.booktabs button:hover:not(.on)::after{transform:scaleX(.35);opacity:.35}

/* --- странично меню --- */
.nsl a{transition:background .15s,color .15s,transform .2s var(--pz-ease)!important}
.nsl a:hover:not(.active){transform:translateX(3px)}
.nsh svg:last-child{transition:transform .25s var(--pz-ease)}

/* --- отговори в тестовете --- */
.opts button{border-width:1.5px!important;border-radius:12px!important;transition:transform .16s var(--pz-ease),box-shadow .16s var(--pz-ease),border-color .15s,background-color .15s!important}
.opts button:hover:not(:disabled){transform:translateY(-2px);border-color:var(--pri)!important;box-shadow:inset 4px 0 0 var(--pri),0 10px 18px -10px rgba(15,23,42,.25)!important}
.opts button:active:not(:disabled){transform:scale(.99)}
.opts button.right{animation:pz-pop .38s var(--pz-ease)}
.opts button.wrong{animation:pz-shake .42s ease}
@keyframes pz-pop{0%{transform:scale(1)}40%{transform:scale(1.025)}100%{transform:scale(1)}}
@keyframes pz-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}

/* --- плъзгачи в симулациите --- */
input[type=range]{cursor:pointer}
input[type=range]::-webkit-slider-thumb{transition:transform .15s var(--pz-ease),box-shadow .15s}
input[type=range]:hover::-webkit-slider-thumb,input[type=range]:active::-webkit-slider-thumb{transform:scale(1.15);box-shadow:var(--pz-ring)}
input[type=checkbox]{accent-color:var(--pri);cursor:pointer}

/* --- фокус с клавиатура --- */
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{
 outline:0!important;box-shadow:var(--pz-ring)!important;border-radius:8px}

/* --- поява на съдържанието при смяна на страница --- */
#main.pz-in>*{animation:pz-in .35s var(--pz-ease) both}
#main.pz-in>*:nth-child(2){animation-delay:.04s}
#main.pz-in>*:nth-child(3){animation-delay:.08s}
#main.pz-in>*:nth-child(n+4){animation-delay:.12s}
@keyframes pz-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

/* --- лента за напредък: плавно запълване --- */
.tb-prog b,.tb-line b{transition:width .6s var(--pz-ease)!important}

/* --- менюто на търсачката се появява меко --- */
.tb-res.on{animation:pz-drop .18s var(--pz-ease)}
@keyframes pz-drop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}

@media (hover:none){
 .b:hover,.btns button:hover,.pager a:hover,.opts button:hover,.cont2:hover,.fa-gal a:hover,.nsl a:hover,.buy-cta:hover,.b.primary:hover{transform:none!important}
}
@media (prefers-reduced-motion:reduce){
 *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
 .pz-rip{display:none}
}
`;
const st=document.createElement("style");st.id="polish-css";st.textContent=css;document.head.appendChild(st);

const RM=matchMedia("(prefers-reduced-motion: reduce)");
const RIP="button,.b,a.b,.buy-cta,.pager a,.navfoot .pm,.quick a,.opts button";
document.addEventListener("pointerdown",e=>{
 if(RM.matches||e.button>0)return;
 let el=e.target.closest(RIP);
 if(!el&&e.target.closest(".cont2"))el=document.querySelector(".cont2 .cg");
 if(!el||el.disabled||el.closest(".booktabs"))return;
 const cs=getComputedStyle(el);if(cs.position==="static")el.style.position="relative";
 if(cs.overflow!=="hidden")el.style.overflow="hidden";
 const r=el.getBoundingClientRect(),d=Math.max(r.width,r.height)*2.2;
 const s=document.createElement("span");s.className="pz-rip";
 const x=e.target.closest(RIP)?e.clientX:r.left+r.width/2,y=e.target.closest(RIP)?e.clientY:r.top+r.height/2;
 s.style.cssText=`width:${d}px;height:${d}px;left:${x-r.left-d/2}px;top:${y-r.top-d/2}px`;
 el.appendChild(s);setTimeout(()=>s.remove(),600);
},{passive:true});

/* поява при смяна на страница */
let last=location.hash;
const enter=()=>{const m=document.getElementById("main");if(!m||RM.matches)return;
 m.classList.remove("pz-in");void m.offsetWidth;m.classList.add("pz-in");
 clearTimeout(enter.t);enter.t=setTimeout(()=>m.classList.remove("pz-in"),700)};
addEventListener("hashchange",()=>{const h=location.hash;if(h===last)return;last=h;requestAnimationFrame(()=>requestAnimationFrame(enter))});
})();
