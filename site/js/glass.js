/* ===== Стъклени бутони (в стил Apple) =====
   Полупрозрачна „матова“ повърхност с размазване на фона, светъл ръб отгоре и мека сянка.
   Само визия — размерите, разположението и поведението на бутоните не се променят. */
(function(){"use strict";
const R="html:root body:not(#nb)";
const GL=`background:linear-gradient(180deg,rgba(255,255,255,.72) 0%,rgba(255,255,255,.42) 100%)!important;-webkit-backdrop-filter:blur(18px) saturate(180%)!important;backdrop-filter:blur(18px) saturate(180%)!important;border:1px solid rgba(255,255,255,.75)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(0,0,0,.05),0 1px 2px rgba(20,22,30,.08),0 6px 18px rgba(20,22,30,.10)!important`;
const RED=`background:linear-gradient(180deg,rgba(226,38,62,.94) 0%,rgba(190,14,40,.9) 100%)!important;-webkit-backdrop-filter:blur(14px) saturate(160%)!important;backdrop-filter:blur(14px) saturate(160%)!important;border:1px solid rgba(255,255,255,.28)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.12),0 8px 22px rgba(200,16,46,.28)!important;color:#fff!important`;
const DARK=`background:linear-gradient(180deg,rgba(40,42,48,.72) 0%,rgba(22,23,27,.62) 100%)!important;-webkit-backdrop-filter:blur(18px) saturate(170%)!important;backdrop-filter:blur(18px) saturate(170%)!important;border:1px solid rgba(255,255,255,.16)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 6px 18px rgba(0,0,0,.25)!important;color:#fff!important`;
const st=document.createElement("style");st.id="glassCss";st.textContent=`
/* бутони в симулациите и уроците */
${R} #main .b:not(.primary){${GL};color:#1D1D1F!important;transition:transform .12s ease,box-shadow .2s ease,background .2s ease}
${R} #main .b:not(.primary):hover{background:linear-gradient(180deg,rgba(255,255,255,.88),rgba(255,255,255,.58))!important}
${R} #main .b.primary,${R} .lp-cta>a:first-child{${RED}}
${R} #main .b:active,${R} .lp-cta>a:active{transform:scale(.97)}
/* раздели „Теория · Симулация · Тест · Речник“: стъклена лента, активният раздел — светло стъкло */
${R} .booktabs{background:rgba(245,245,247,.84)!important;-webkit-backdrop-filter:blur(30px) saturate(180%)!important;backdrop-filter:blur(30px) saturate(180%)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.6),0 6px 20px rgba(20,22,30,.08)!important}
${R} .booktabs button.on{${GL};color:#1D1D1F!important}
/* бутоните върху 3D изгледите */
${R} .fs-btn,${R} .fs-tab,${R} .mdl-sw{${GL};color:#1D1D1F!important}
${R} .mdl-sw button.on{${DARK}}
/* горната лента и плаващите елементи */
${R} #langBtn{${GL};color:#1D1D1F!important}
${R} .ft-fab,${R} #testbadge{${DARK}}
${R} #tabbar{background:rgba(247,247,249,.8)!important;-webkit-backdrop-filter:blur(30px) saturate(180%)!important;backdrop-filter:blur(30px) saturate(180%)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.7)!important}
/* надписите за лиценз на 3D моделите: връзките в цвета на текста (не жълти) */
${R} .credit3d a{color:inherit!important;text-decoration:underline;text-underline-offset:2px}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){${R} #main .b:not(.primary),${R} .fs-btn,${R} .mdl-sw,${R} #langBtn{background:#fff!important}}
`;document.head.appendChild(st)})();
