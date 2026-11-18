/* ===== Телефон: по-чист изглед =====
   - фонът, заглавието в горната лента и бутонът за шрифтове остават както са договорени;
   - значката „Тестов режим“ е вдясно и не се застъпва с бутона за шрифтове;
   - по-плътни отстъпи, по-четим текст и по-удобни бутони. */
(function(){"use strict";
const st=document.createElement("style");st.id="mobileCss";st.textContent=`
@media (max-width:700px){
  html body #testbadge{left:auto!important;right:10px!important;transform:none!important;bottom:calc(74px + env(safe-area-inset-bottom,0px))!important;font-size:10px!important;padding:5px 9px!important;opacity:.82;box-shadow:0 2px 8px #0003!important}
  html body #main{padding:12px 12px 32px!important}
  html body #main .card{padding:14px!important;border-radius:16px!important}
  html body #main .card .card{padding:12px!important}
  html body #main p,html body #main li{line-height:1.6}
  html body #main h2{font-size:26px!important;line-height:1.15!important}
  html body #main h3{font-size:19px!important;line-height:1.25!important}
  html body #main .btns{gap:6px!important}
  html body #main .btns .b{padding:9px 13px!important;font-size:13.5px!important}
  html body #main .legend{font-size:12px!important;gap:4px 10px!important}
  html body #main .stats{gap:8px!important}
  html body #main canvas.plot{max-width:100%}
  html body #hxo .side.l{background:linear-gradient(180deg,rgba(8,9,12,.66) 0%,rgba(8,9,12,.42) 72%,rgba(8,9,12,0) 100%);top:0!important;left:0!important;right:0!important;margin:0!important;padding:max(64px,calc(env(safe-area-inset-top,0px) + 52px)) 20px 36px!important;border-radius:0}
  html body .mdl-sw.out{position:static!important;margin:8px 0 0 auto;width:max-content;box-shadow:none;background:#fff}
}`;
document.head.appendChild(st)})();
