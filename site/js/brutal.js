/* ===== Груб (необруталистичен) слой: остри ъгли, черни рамки, твърди сенки, цветни блокове =====
   Иконите са в един цвят. Цветовете са в интерфейса: бутони, карти, ленти, секции. */
(function(){
const css=`
:root{
 --nb-ink:#111111; --nb-on:#111111; --nb-paper:#FFFFFF; --nb-bg:#F2F1EC;
 --nb-y:#FFD23F; --nb-pk:#FF90BB; --nb-bl:#8EC5FF; --nb-lm:#B9F18C; --nb-or:#FFA552; --nb-vi:#C4B1FF; --nb-tl:#0F766E; --nb-rd:#FF5A5F;
 --nb-b:2px solid var(--nb-ink); --nb-sh:4px 4px 0 var(--nb-ink); --nb-sh-h:6px 6px 0 var(--nb-ink); --nb-sh-s:2px 2px 0 var(--nb-ink);
 --pri:#0F766E; --bg:#F2F1EC; --accent:#111111; --pz-card:var(--nb-sh); --pz-sh-card-h:var(--nb-sh-h);
}
@media (prefers-color-scheme:dark){:root{--nb-ink:#EDEDED;--nb-paper:#16181D;--nb-bg:#0E0F12;--bg:#0E0F12;--accent:#EDEDED}}
html body{background:var(--nb-bg)!important}
html body:not(#nb) ::selection{background:var(--nb-y);color:#111}

/* --- единни икони: без цветни плочки по раздели --- */
html body:not(#nb) [style*="--sec"],html body:not(#nb) #main,html body:not(#nb) .ns,html body:not(#nb) .sec,html body:not(#nb) .cont2{--sec:var(--nb-ink)!important;--sec-50:var(--nb-paper)!important}
html body:not(#nb) .nsh .n,html body:not(#nb) .ns .nsh .n,html body:not(#nb) .sec .n,html body:not(#nb) .cont2 .cn,html body:not(#nb) .lp-sec .n{
 background:var(--nb-paper)!important;color:var(--nb-ink)!important;border:var(--nb-b)!important;border-radius:0!important;box-shadow:none!important}
html body:not(#nb) .ns.open .nsh .n{background:var(--nb-y)!important;color:#111!important}
html body:not(#nb) .ns.open .nsh .n .lc{color:#111!important;stroke:#111!important}
html body:not(#nb) .nsh .n .lc,html body:not(#nb) .sec .n .lc,html body:not(#nb) .cont2 .cn .lc{color:inherit!important}

/* --- горна лента и странично меню --- */
html body:not(#nb) header.bar{background:var(--nb-paper)!important;border-bottom:var(--nb-b)!important;box-shadow:none!important}
html body:not(#nb) aside#nav{background:var(--nb-paper)!important;border-right:var(--nb-b)!important;box-shadow:none!important}
html body:not(#nb) .navfoot{border-top:var(--nb-b)!important}
html body:not(#nb) .tb-search input,html body:not(#nb) #navq{border:var(--nb-b)!important;border-radius:0!important;background:var(--nb-paper)!important;box-shadow:none!important}
html body:not(#nb) .tb-search input:focus,html body:not(#nb) #navq:focus{box-shadow:var(--nb-sh-s)!important;background:#FFFBE6!important}
html body:not(#nb) .tb-prog i{border-radius:0!important;height:10px!important;border:var(--nb-b);box-shadow:none!important;background:var(--nb-paper)!important}
html body:not(#nb) .tb-prog b{border-radius:0!important;background:var(--nb-y)!important}
html body:not(#nb) .nsh{border-radius:0!important}
html body:not(#nb) .nsh:hover{background:#FFF4C2!important}
html body:not(#nb) .nsl a{border-radius:0!important;transform:none!important}
html body:not(#nb) .nsl a:hover:not(.active){background:#FFF4C2!important;box-shadow:inset 3px 0 0 var(--nb-ink)!important}
html body:not(#nb) .nsl a.active,html body:not(#nb) .ns.open .nsl a.active{background:var(--nb-y)!important;color:#111!important;box-shadow:inset 0 0 0 2px var(--nb-ink)!important;font-weight:700}
html body:not(#nb) .quick a:not(.prem)::after{background:var(--nb-ink)!important;height:3px!important;border-radius:0!important}

/* --- бутони: остри ъгли, черна рамка, твърда сянка --- */
html body:not(#nb) .b,html body:not(#nb) a.b,html body:not(#nb) button.b,html body:not(#nb) .btns button,html body:not(#nb) .buy-cta,html body:not(#nb) .cont2 .cg,html body:not(#nb) .sub,html body:not(#nb) .quick a.prem,html body:not(#nb) header.bar button:not(.iconbtn),html body:not(#nb) .pw-card .b,html body:not(#nb) .lp-ghost,html body:not(#nb) .hero-alt{
 border-radius:0!important;border:var(--nb-b)!important;box-shadow:var(--nb-sh)!important;text-shadow:none!important;filter:none!important;
 background:var(--nb-paper)!important;color:var(--nb-ink)!important;font-weight:750!important;
 transition:transform .12s ease,box-shadow .12s ease,background-color .12s!important}
html body:not(#nb) .b.primary,html body:not(#nb) .b.pri,html body:not(#nb) .btns button.on,html body:not(#nb) .buy-cta,html body:not(#nb) .cont2 .cg,html body:not(#nb) .sub,html body:not(#nb) .quick a.prem.on{
 background:var(--nb-y)!important;color:#111!important;border-color:#111!important}
html body:not(#nb) .quick a.prem:not(.on){background:var(--nb-pk)!important;color:#111!important;border-color:#111!important}
html body:not(#nb) header.bar button:not(.iconbtn){background:var(--nb-bl)!important;color:#111!important;border-color:#111!important}
html body:not(#nb) .b:hover,html body:not(#nb) .btns button:hover,html body:not(#nb) .buy-cta:hover,html body:not(#nb) .cont2:hover .cg,html body:not(#nb) .sub:hover,html body:not(#nb) .quick a.prem:hover,html body:not(#nb) header.bar button:not(.iconbtn):hover,html body:not(#nb) .lp-ghost:hover,html body:not(#nb) .hero-alt:hover{
 transform:translate(-2px,-2px)!important;box-shadow:var(--nb-sh-h)!important}
html body:not(#nb) .b:not(.primary):not(.pri):hover,html body:not(#nb) .btns button:not(.on):hover{background:#FFF4C2!important}
html body:not(#nb) .b.primary:hover,html body:not(#nb) .buy-cta:hover,html body:not(#nb) .cont2:hover .cg,html body:not(#nb) .sub:hover{background:#FFDE6B!important}
html body:not(#nb) .b:active,html body:not(#nb) .btns button:active,html body:not(#nb) .buy-cta:active,html body:not(#nb) .cont2:active .cg,html body:not(#nb) .sub:active,html body:not(#nb) .quick a.prem:active,html body:not(#nb) header.bar button:not(.iconbtn):active,html body:not(#nb) .lp-ghost:active{
 transform:translate(4px,4px)!important;box-shadow:0 0 0 var(--nb-ink)!important;transition-duration:.04s!important}
html body:not(#nb) .b::after,html body:not(#nb) .buy-cta::after,html body:not(#nb) .cont2 .cg::after,html body:not(#nb) .sub::after{display:none!important}
html body:not(#nb) .buy-cta,html body:not(#nb) .cont2 .cg{animation:none!important}
html body:not(#nb) .pz-rip{display:none!important}
html body:not(#nb) .b svg,html body:not(#nb) .btns button svg{transform:none}
html body:not(#nb) .b:hover svg{transform:translateX(2px)}

/* --- карти и блокове --- */
html body:not(#nb) .card,html body:not(#nb) section.book,html body:not(#nb) .sec,html body:not(#nb) .pw-card,html body:not(#nb) .fa-hero,html body:not(#nb) .cont2,html body:not(#nb) .kpi,html body:not(#nb) .fa-map li,html body:not(#nb) .faq details,html body:not(#nb) .pw-shot,html body:not(#nb) .fa-gal a,html body:not(#nb) .kt,html body:not(#nb) .steps li,html body:not(#nb) .pager a,html body:not(#nb) .navfoot .pm,html body:not(#nb) .lp-plan,html body:not(#nb) .lp-faq details,html body:not(#nb) .lp-feat li,html body:not(#nb) #pop,html body:not(#nb) .tb-res{
 border:var(--nb-b)!important;border-radius:0!important;box-shadow:var(--nb-sh)!important;background:var(--nb-paper)!important}
html body:not(#nb) .sec,html body:not(#nb) .cont2{box-shadow:var(--nb-sh)!important}
html body:not(#nb) .sec:hover,html body:not(#nb) .cont2:hover,html body:not(#nb) .pager a:hover,html body:not(#nb) .navfoot .pm:hover,html body:not(#nb) .fa-gal a:hover{transform:translate(-2px,-2px)!important;box-shadow:var(--nb-sh-h)!important}
html body:not(#nb) .sec .n,html body:not(#nb) .cont2 .cn{transform:none!important}
html body:not(#nb) .sec .pc{color:var(--nb-ink)!important}
html body:not(#nb) .sec li a{border-radius:0!important;padding-left:inherit}
html body:not(#nb) .sec li a:hover{background:#FFF4C2!important;color:#111!important}
html body:not(#nb) .pbar{border-radius:0!important;height:10px!important;border:var(--nb-b);background:var(--nb-paper)!important}
html body:not(#nb) .pbar>div{border-radius:0!important;background:var(--nb-tl)!important}
html body:not(#nb) figure,html body:not(#nb) .bfig{border:var(--nb-b)!important;border-radius:0!important;box-shadow:none!important;overflow:hidden}
html body:not(#nb) section.book h3 .num,html body:not(#nb) .book h3>span:first-child{border-radius:0!important}
html body:not(#nb) .secchip{border-radius:0!important;border:var(--nb-b)!important;background:var(--nb-lm)!important;color:#111!important}
html body:not(#nb) .secchip i{border-radius:0!important;background:#111!important;color:#fff!important}
html body:not(#nb) .bdg{border-radius:0!important;border:var(--nb-b)!important;color:#111!important;font-weight:700}
html body:not(#nb) .bdg.pri{background:var(--nb-bl)!important}html body:not(#nb) .bdg.gray{background:var(--nb-paper)!important;color:var(--nb-ink)!important}
html body:not(#nb) .bdg.ok{background:var(--nb-lm)!important}html body:not(#nb) .bdg.warn{background:var(--nb-y)!important}

html body:not(#nb) section.book:not(.keyp) h3::before{color:var(--nb-ink)!important;border:2px solid var(--nb-ink)!important;border-radius:0!important;background:var(--nb-y);color:#111!important}
html body:not(#nb) .booktabs,html body:not(#nb) .subnav{background:var(--nb-bg)!important;box-shadow:0 -8px 0 var(--nb-bg)!important}
/* бележки в теорията */
html body:not(#nb) .callout,html body:not(#nb) section.keyp,html body:not(#nb) .note,html body:not(#nb) .co-clin{border:var(--nb-b)!important;border-radius:0!important;box-shadow:var(--nb-sh-s)!important;color:#111!important}
html body:not(#nb) section.keyp{background:#FFF0A8!important}
html body:not(#nb) .note{background:#D9ECFF!important}
html body:not(#nb) .co-clin{background:#FFD6E5!important}
html body:not(#nb) .callout *,html body:not(#nb) section.keyp *,html body:not(#nb) .note *,html body:not(#nb) .co-clin *{color:#111}

/* табове */
html body:not(#nb) .booktabs{border-bottom:var(--nb-b)!important}
html body:not(#nb) .booktabs button{border-radius:0!important;margin-bottom:-2px!important;border:2px solid transparent!important;border-bottom:0!important}
html body:not(#nb) .booktabs button::after{display:none!important}
html body:not(#nb) .booktabs button.on{background:var(--nb-y)!important;color:#111!important;border-color:var(--nb-ink)!important}
html body:not(#nb) .booktabs button:hover:not(.on){background:#FFF4C2!important;color:#111!important}

/* отговори в тестовете */
html body:not(#nb) .opts button{border:var(--nb-b)!important;border-radius:0!important;box-shadow:var(--nb-sh-s)!important;background:var(--nb-paper)!important;color:var(--nb-ink)!important}
html body:not(#nb) .opts button:hover:not(:disabled){transform:translate(-2px,-2px)!important;box-shadow:var(--nb-sh)!important;background:#FFF4C2!important;color:#111!important}
html body:not(#nb) .opts button.right{background:var(--nb-lm)!important;color:#111!important;box-shadow:var(--nb-sh-s)!important}
html body:not(#nb) .opts button.wrong{background:#FFB3B5!important;color:#111!important;box-shadow:var(--nb-sh-s)!important}

html body:not(#nb) .exp{border:var(--nb-b)!important;border-radius:0!important;box-shadow:var(--nb-sh)!important;background:var(--nb-paper)!important}
html body:not(#nb) .expl{border:2px solid var(--nb-ink)!important;border-left-width:6px!important;border-radius:0!important;background:#D9ECFF!important;color:#111!important;box-shadow:none!important}
html body:not(#nb) .expl *{color:#111}
/* полета и плъзгачи в симулациите */
html body:not(#nb) #main input:not([type=range]):not([type=checkbox]):not([type=radio]),html body:not(#nb) #main select{border-radius:0!important;border:var(--nb-b)!important}
html body:not(#nb) input[type=checkbox]{accent-color:#111}
html body:not(#nb) input[type=range]{accent-color:var(--nb-tl)}

/* фокус */
html body:not(#nb) a:focus-visible,html body:not(#nb) button:focus-visible,html body:not(#nb) input:focus-visible,html body:not(#nb) select:focus-visible,html body:not(#nb) summary:focus-visible{
 outline:3px solid var(--nb-bl)!important;outline-offset:2px!important;box-shadow:none!important;border-radius:0!important}

/* долна лента на телефона */
html body:not(#nb) #tabbar{border-top:var(--nb-b)!important;background:var(--nb-paper)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html body:not(#nb) #tabbar a,html body:not(#nb) #tabbar button{border-radius:0!important}
html body:not(#nb) #tabbar .on{background:var(--nb-y)!important;color:#111!important;box-shadow:inset 0 0 0 2px #111}

/* ===== начална страница ===== */
html body:not(#nb) .lp-hero{border-bottom:var(--nb-b)}
html body:not(#nb) .lp-hero::before{background:linear-gradient(90deg,rgba(20,2,6,.88) 0%,rgba(30,4,9,.62) 42%,rgba(30,4,9,0) 80%)}
html body:not(#nb) .lp-kick{display:inline-block;color:#111!important;background:var(--nb-y);border:2px solid #111;padding:4px 10px;font-weight:800;box-shadow:3px 3px 0 #111}
html body:not(#nb) .lp-hero h1{text-shadow:none}
html body:not(#nb) .lp-ghost,html body:not(#nb) .hero-alt{background:var(--nb-paper)!important;color:var(--nb-ink)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html body:not(#nb) .lp-cta .b,html body:not(#nb) .lp-ghost{padding:15px 26px!important;font-size:16.5px!important}
html body:not(#nb) .lp-note{color:#fff}
html body:not(#nb) .lp-note .lc{color:var(--nb-lm)}
html body:not(#nb) .lp-stats{border:var(--nb-b);border-radius:0!important;box-shadow:var(--nb-sh-h)!important;background:var(--nb-paper)!important;overflow:hidden}
html body:not(#nb) .lp-stats>div{box-shadow:none!important;color:#111}
html body:not(#nb) .lp-stats>div+div{border-left:var(--nb-b)}
html body:not(#nb) .lp-stats>div:nth-child(1){background:var(--nb-y)}html body:not(#nb) .lp-stats>div:nth-child(2){background:var(--nb-pk)}
html body:not(#nb) .lp-stats>div:nth-child(3){background:var(--nb-bl)}html body:not(#nb) .lp-stats>div:nth-child(4){background:var(--nb-lm)}
html body:not(#nb) .lp-stats b{color:#111!important;font-size:40px}html body:not(#nb) .lp-stats span{color:#111!important;font-weight:600}
html body:not(#nb) .lp-h h2{font-weight:900!important;text-transform:none}
html body:not(#nb) .lp-feat li{color:#111}
html body:not(#nb) .lp-feat li:nth-child(1){background:var(--nb-y)!important}html body:not(#nb) .lp-feat li:nth-child(2){background:var(--nb-bl)!important}
html body:not(#nb) .lp-feat li:nth-child(3){background:var(--nb-pk)!important}html body:not(#nb) .lp-feat li:nth-child(4){background:var(--nb-lm)!important}
html body:not(#nb) .lp-feat li:nth-child(5){background:var(--nb-or)!important}html body:not(#nb) .lp-feat li:nth-child(6){background:var(--nb-vi)!important}
html body:not(#nb) .lp-feat li:hover{transform:translate(-3px,-3px)!important;box-shadow:7px 7px 0 var(--nb-ink)!important}
html body:not(#nb) .lp-feat i,html body:not(#nb) .steps li i{background:#fff!important;color:#111!important;border:2px solid #111;border-radius:0!important;box-shadow:3px 3px 0 #111!important;transform:none!important}
html body:not(#nb) .lp-feat h3,html body:not(#nb) .lp-feat p{color:#111!important}
html body:not(#nb) .lp-dark{background:#111!important;border-top:var(--nb-b);border-bottom:var(--nb-b)}
html body:not(#nb) .lp-gal a{border:2px solid #fff!important;border-radius:0!important;box-shadow:5px 5px 0 var(--nb-y)!important}
html body:not(#nb) .lp-gal a:hover{transform:translate(-2px,-2px)!important;box-shadow:7px 7px 0 var(--nb-y)!important}
html body:not(#nb) .lp-gal span{background:#111;padding:10px 14px}
html body:not(#nb) .lp-gal small{color:var(--nb-y)!important}
html body:not(#nb) .steps li::after{color:transparent!important;-webkit-text-stroke:2px #111}
html body:not(#nb) .steps li:nth-child(1){background:var(--nb-paper)!important}
html body:not(#nb) .steps li:nth-child(1) i{background:var(--nb-y)!important}html body:not(#nb) .steps li:nth-child(2) i{background:var(--nb-bl)!important}html body:not(#nb) .steps li:nth-child(3) i{background:var(--nb-pk)!important}
html body:not(#nb) .lp-tint{background:var(--nb-bl)!important;border-top:var(--nb-b);border-bottom:var(--nb-b)}
html body:not(#nb) .lp-tint .lp-h h2,html body:not(#nb) .lp-tint .lp-h p{color:#111!important}
html body:not(#nb) .sec.lp-sec{box-shadow:var(--nb-sh)!important;color:var(--nb-ink)}
html body:not(#nb) .sec.lp-sec:hover{background:var(--nb-y)!important;color:#111!important}
html body:not(#nb) .sec.lp-sec:hover .lp-sec-t small{color:#111}
html body:not(#nb) .lp-sec em.fr{border-radius:0!important;border:2px solid #111;background:var(--nb-lm)!important;color:#111!important}
html body:not(#nb) .lp-plan.pro{background:var(--nb-y)!important;color:#111;box-shadow:8px 8px 0 var(--nb-ink)!important}
html body:not(#nb) .lp-plan.pro *{color:#111}
html body:not(#nb) .lp-plan.pro .b.primary{background:#111!important;color:var(--nb-y)!important}
html body:not(#nb) .lp-plan li .lc{color:#111}
html body:not(#nb) .lp-tag{border-radius:0!important;background:#111!important;color:var(--nb-y)!important;border:2px solid #111}
html body:not(#nb) .lp-have{border-radius:0!important;border:2px solid #111;background:#fff!important;color:#111!important}
html body:not(#nb) .lp-faq details[open]{background:#FFF4C2!important}
html body:not(#nb) .lp-faq details[open] *{color:#111}
html body:not(#nb) .lp-faq summary .lc{color:inherit}
html body:not(#nb) .hband{border:var(--nb-b);border-radius:0!important;background:var(--nb-pk)!important;box-shadow:var(--nb-sh-h)!important;color:#111}
html body:not(#nb) .hband h3,html body:not(#nb) .hband p{color:#111!important}
html body:not(#nb) .hband .b.primary{background:#111!important;color:var(--nb-y)!important;border-color:#111!important}
html body:not(#nb) .lp-foot{background:#111!important;border-top:var(--nb-b)}
html body:not(#nb) .lp-foot h4{color:var(--nb-y)!important}
html body:not(#nb) .lp-plan .b.primary:hover,html body:not(#nb) .hband .b.primary:hover{background:#222!important}
html body:not(#nb) .hero,html body:not(#nb) .hero-img{border-radius:0!important}
@media (max-width:860px){html body:not(#nb) .lp-stats>div:nth-child(3){border-left:0;border-top:var(--nb-b)}html body:not(#nb) .lp-stats>div:nth-child(4){border-top:var(--nb-b)}html body:not(#nb) .lp-stats b{font-size:30px}}
@media (prefers-color-scheme:dark){html body:not(#nb) .lp-feat i,html body:not(#nb) .steps li i{color:#111!important}html body:not(#nb) .sec.lp-sec:hover .lp-sec-t b{color:#111}}
/* лента с темите */
html body:not(#nb) .lp-tick{margin:44px 0 0;background:#111;border-top:var(--nb-b);border-bottom:var(--nb-b);overflow:hidden;white-space:nowrap}
html body:not(#nb) .lp-tick-in{display:inline-flex;animation:nb-tick 160s linear infinite}
html body:not(#nb) .lp-tick:hover .lp-tick-in{animation-play-state:paused}
html body:not(#nb) .lp-tick span{display:inline-flex;align-items:center;padding:14px 0;color:#fff;font-weight:700;font-size:15px}
html body:not(#nb) .lp-tick span::after{content:"";width:10px;height:10px;margin:0 22px;background:var(--nb-y);border:2px solid #fff;transform:rotate(45deg)}
html body:not(#nb) .lp-tick span:nth-child(3n+2)::after{background:var(--nb-pk)}html body:not(#nb) .lp-tick span:nth-child(3n)::after{background:var(--nb-bl)}
@keyframes nb-tick{to{transform:translateX(-50%)}}
html body:not(#nb) .lp-tick+.lp-sect{padding-top:64px}

/* въпроси и отговори */
html body:not(#nb) .lp-qa{display:grid;grid-template-columns:minmax(260px,340px) 1fr;gap:48px;align-items:start}
html body:not(#nb) .lp-qa-side{position:sticky;top:calc(var(--barH,56px) + 24px)}
html body:not(#nb) .lp-qa-side h2{margin:0 0 12px!important;font-size:clamp(28px,3.4vw,40px)!important;font-weight:900!important;letter-spacing:-.03em;line-height:1.1!important}
html body:not(#nb) .lp-qa-side>p{margin:0 0 22px;font-size:16.5px;line-height:1.6;color:var(--muted)}
html body:not(#nb) .lp-qa-mail{display:grid;gap:4px;padding:18px 20px;background:var(--nb-y);border:var(--nb-b);box-shadow:var(--nb-sh);color:#111}
html body:not(#nb) .lp-qa-mail b{font-size:17px;color:#111}
html body:not(#nb) .lp-qa-mail span{font-size:14px;color:#111}
html body:not(#nb) .lp-qa-mail a{margin-top:6px;font-weight:800;color:#111!important;text-decoration:underline!important;text-underline-offset:3px;word-break:break-all}
html body:not(#nb) .lp-qa-g+.lp-qa-g{margin-top:30px}
html body:not(#nb) .lp-qa-g h3{display:inline-block;margin:0 0 14px!important;padding:5px 12px;font-size:15px!important;font-weight:800!important;background:#111;color:#fff!important}
html body:not(#nb) .lp-qa .lp-faq{max-width:none}
html body:not(#nb) .lp-qa .lp-faq details{margin-bottom:12px;box-shadow:var(--nb-sh-s)!important;transition:box-shadow .12s,transform .12s}
html body:not(#nb) .lp-qa .lp-faq details:hover{transform:translate(-2px,-2px);box-shadow:var(--nb-sh)!important}
html body:not(#nb) .lp-qa .lp-faq details[open]{background:var(--nb-paper)!important;box-shadow:var(--nb-sh)!important;transform:none}
html body:not(#nb) .lp-qa .lp-faq details[open] summary{background:var(--nb-y);color:#111;border-bottom:var(--nb-b)}
html body:not(#nb) .lp-qa summary{padding:17px 20px!important;font-size:16.5px!important;line-height:1.4}
html body:not(#nb) .lp-qa summary i{position:relative;flex:none;width:28px;height:28px;border:2px solid currentColor;background:var(--nb-paper)}
html body:not(#nb) .lp-qa summary i::before,html body:not(#nb) .lp-qa summary i::after{content:"";position:absolute;left:50%;top:50%;width:12px;height:2px;background:var(--nb-ink);transform:translate(-50%,-50%);transition:transform .2s ease}
html body:not(#nb) .lp-qa summary i::after{transform:translate(-50%,-50%) rotate(90deg)}
html body:not(#nb) .lp-qa details[open] summary i::after{transform:translate(-50%,-50%) rotate(0deg)}
html body:not(#nb) .lp-qa details[open] summary i{background:#fff}
html body:not(#nb) .lp-qa details[open] summary i::before,html body:not(#nb) .lp-qa details[open] summary i::after{background:#111}
html body:not(#nb) .lp-qa-a{padding:16px 20px 18px}
html body:not(#nb) .lp-qa-a p{margin:0!important;padding:0!important;font-size:15.5px;line-height:1.65;color:var(--nb-ink)!important;max-width:68ch}
html body:not(#nb) .lp-qa details[open] .lp-qa-a{animation:nb-open .22s ease}
@keyframes nb-open{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@media (max-width:860px){html body:not(#nb) .lp-qa{grid-template-columns:1fr;gap:26px}html body:not(#nb) .lp-qa-side{position:static}}
@media (prefers-reduced-motion:reduce){html body:not(#nb) .lp-tick-in{animation:none}}
`;
const st=document.createElement("style");st.id="brutal-css";st.textContent=css;document.head.appendChild(st);
})();
