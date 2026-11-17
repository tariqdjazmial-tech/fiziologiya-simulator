/* ===== Палитра B „Кардиолаб“: нощно мастило, кардиологично червено, бяло; синьо за „вярно“ =====
   Слага се след js/brutal.js и заменя само цветовете; подредбата на сайта не се променя.
   За да се върнеш към старите цветове, махни <script src="js/palette.js"> от index.html. */
(function(){
const css=`
html:root{
 --bg:#0B111C!important;--panel:#121A28!important;--plate:#121A28!important;--chip:#1A2435!important;--line:#2E3B55!important;--ink:#EEF1F6!important;--muted:#9AA6BC!important;
 --pri:#E5383B!important;--pri-h:#FF5A5F!important;--pri-50:#2A0D12!important;--pri-100:#4A1219!important;--accent:#E5383B!important;--accent2:#EEF1F6!important;
 --ok:#8DB4FF!important;--ok-50:#101C33!important;--err:#FF8A4C!important;--err-50:#2A160C!important;--warn:#FFD23F!important;--warn-50:#2A2200!important;--warn-ink:#FFD23F!important;
 --c:#E5383B!important;--cb:#121A28!important;
 --nb-ink:#EEF1F6!important;--nb-on:#0B111C!important;--nb-paper:#121A28!important;--nb-bg:#0B111C!important;
 --nb-red:#D72F33!important;--nb-red-50:#2A0D12!important;
 --nb-y:#EEF1F6!important;--nb-y-50:#1A2435!important;--nb-lm:#EEF1F6!important;
 --nb-pk:#E5383B!important;--nb-or:#E5383B!important;--nb-tl:#E5383B!important;--nb-rd:#E5383B!important;--nb-bl:#121A28!important;--nb-vi:#121A28!important;
 --nb-b:1.5px solid #34425E!important;--nb-sh:4px 4px 0 #04070D!important;--nb-sh-h:6px 6px 0 #04070D!important;--nb-sh-s:2px 2px 0 #04070D!important;
 color-scheme:dark}
html body{background:#0B111C!important}
html body:not(#nb) ::selection{background:#FFD23F;color:#111}
/* верен и грешен отговор: синьо с ✓, оранжево с ✕ (двойка, която се различава и при червено-зелена далтонистия) */
html body:not(#nb) .opts button.right{background:#8DB4FF!important;color:#0A1428!important;border-color:#8DB4FF!important}
html body:not(#nb) .opts button.right *{color:#0A1428!important}
html body:not(#nb) .opts button.wrong{background:#FF8A4C!important;color:#1A0A02!important;border-color:#FF8A4C!important}
html body:not(#nb) .opts button.wrong *{color:#1A0A02!important}
html body:not(#nb) .opts button.right::after{content:" ✓";font-weight:800}
html body:not(#nb) .opts button.wrong::after{content:" ✕";font-weight:800}
/* жълтото остава само като маркер за подчертаване */
html body:not(#nb) mark,html body:not(#nb) .hl{background:#FFD23F!important;color:#111!important}
/* горна лента и картите получават тънки линии вместо бели рамки */
html body:not(#nb) header.bar{background:#0B111C!important;border-bottom:1px solid #26324A!important}
html body:not(#nb) .lp-card:hover{box-shadow:6px 6px 0 #04070D!important;border-color:#E5383B!important}
/* главният бутон на началната страница: червен с бял текст */
html body:not(#nb) .lp-cta>a:first-child,html body:not(#nb) .lp-cta>.b:first-child{background:#D72F33!important;color:#fff!important;border-color:#D72F33!important}
html body:not(#nb) .lp-cta>a:first-child *{color:#fff!important}
/* снимка в горната част на всяка карта на раздел */
html body:not(#nb) .lp-card-img{display:block;width:100%;aspect-ratio:16/7;object-fit:cover;border-bottom:1px solid #26324A;filter:saturate(1.05);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
html body:not(#nb) .lp-card{overflow:hidden}
html body:not(#nb) .lp-card:hover .lp-card-img{transform:scale(1.04)}
/* секцията с разделите: тъмна лента вместо цветен фон */
html body:not(#nb) .lp-tint{background:#0E1626!important;border-top:1px solid #26324A!important;border-bottom:1px solid #26324A!important}
html body:not(#nb) .lp-tint .lp-h h2{color:#EEF1F6!important}html body:not(#nb) .lp-tint .lp-h p{color:#9AA6BC!important}
/* плочките с числа: еднаква тъмна повърхност, цветът е само в числото */
html body:not(#nb) .lp-stats>div,html body:not(#nb) .lp-stats>div:nth-child(n){background:#121A28!important}
html body:not(#nb) .lp-stats span,html body:not(#nb) .lp-stats>div:nth-child(n) span{color:#9AA6BC!important}
html body:not(#nb) .lp-stats>div:nth-child(1) b{color:#8DB4FF!important}
html body:not(#nb) .lp-stats>div:nth-child(2) b{color:#FF5A5F!important}
html body:not(#nb) .lp-stats>div:nth-child(3) b{color:#FFD23F!important}
html body:not(#nb) .lp-stats>div:nth-child(4) b{color:#EEF1F6!important}
/* ЕКГ линията в горната снимка: червена като в интрото */
html body:not(#nb) .lp-ecg path{stroke:#FF4D5A!important}
html body:not(#nb) .lp-hero::before{background:linear-gradient(90deg,rgba(8,11,18,.94) 0%,rgba(8,11,18,.72) 42%,rgba(40,8,14,.25) 100%)!important}
@media (max-width:860px){html body:not(#nb) .lp-hero::before{background:linear-gradient(0deg,rgba(8,11,18,.95) 0%,rgba(8,11,18,.7) 55%,rgba(40,8,14,.2) 100%)!important}}
`;
const st=document.createElement("style");st.id="palette-b";st.textContent=css;document.head.appendChild(st);
/* слоят се слага последен, за да е над всички стари правила */
const keep=()=>{if(st.nextElementSibling&&st.nextElementSibling.tagName==="STYLE")document.head.appendChild(st)};
new MutationObserver(keep).observe(document.head,{childList:true});
})();
