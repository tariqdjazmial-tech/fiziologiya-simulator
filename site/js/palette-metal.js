/* ===== Палитра „Хирургическа стомана“: светъл металически фон, графит и кардиологично червено =====
   Алтернатива на js/palette.js (тъмната „Кардиолаб“). В index.html се зарежда едната от двете.
   Заменя само цветовете и повърхностите; подредбата на сайта не се променя. */
(function(){
/* фина четкана текстура като на неръждаема стомана (SVG шум, разтеглен хоризонтално) */
const brushed="url(\"data:image/svg+xml,"+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.0018 0.9' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.47 0 0 0 0 0.5 0 0 0 0.11 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>")+"\")";
const css=`
html:root{
 --bg:#E6E9ED!important;--panel:#F7F8FA!important;--plate:#F7F8FA!important;--chip:#E1E5EA!important;--line:#C5CBD3!important;--ink:#15181D!important;--muted:#555D68!important;
 --pri:#C8102E!important;--pri-h:#A50D25!important;--pri-50:#FBE7EA!important;--pri-100:#F5C9D0!important;--accent:#C8102E!important;--accent2:#15181D!important;
 --ok:#1D4ED8!important;--ok-50:#E3EAFD!important;--err:#C2410C!important;--err-50:#FCEBE2!important;--warn:#B7791F!important;--warn-50:#FDF3DC!important;--warn-ink:#7A4E0B!important;
 --c:#C8102E!important;--cb:#F7F8FA!important;
 --nb-ink:#15181D!important;--nb-on:#FFFFFF!important;--nb-paper:#F7F8FA!important;--nb-bg:#E6E9ED!important;
 --nb-red:#C8102E!important;--nb-red-50:#FBE7EA!important;
 --nb-y:#D6DBE1!important;--nb-y-50:#E9ECF0!important;--nb-lm:#D6DBE1!important;
 --nb-pk:#C8102E!important;--nb-or:#C8102E!important;--nb-tl:#C8102E!important;--nb-rd:#C8102E!important;--nb-bl:#F7F8FA!important;--nb-vi:#F7F8FA!important;
 --nb-b:1px solid #BCC3CC!important;
 --nb-sh:inset 0 1px 0 rgba(255,255,255,.95),0 6px 18px rgba(18,24,34,.10)!important;
 --nb-sh-h:inset 0 1px 0 rgba(255,255,255,.95),0 14px 30px rgba(18,24,34,.16)!important;
 --nb-sh-s:inset 0 1px 0 rgba(255,255,255,.9),0 2px 6px rgba(18,24,34,.10)!important;
 color-scheme:light}
html,html body{background-color:#E3E7EB!important}
html body{background:${brushed},linear-gradient(180deg,#F2F4F6 0px,#E3E7EB 1400px,#DDE1E6 100%)!important;color:#15181D}
html body:not(#nb) ::selection{background:#C8102E;color:#fff}
/* повърхности: сребрист отблясък отгоре, мек сенчест ръб */
html body:not(#nb) .lp-card,html body:not(#nb) .card,html body:not(#nb) .lp-plan,html body:not(#nb) .lp-feat>li,html body:not(#nb) .steps>li,html body:not(#nb) .lp-qa-mail,html body:not(#nb) .kpi,html body:not(#nb) .sec,html body:not(#nb) .lp-stats{
 background:linear-gradient(180deg,#FCFCFD 0%,#EEF1F4 100%)!important;border:1px solid #BCC3CC!important;box-shadow:var(--nb-sh)!important;border-radius:10px!important}
html body:not(#nb) .lp-card:hover{transform:translateY(-3px)!important;box-shadow:var(--nb-sh-h)!important;border-color:#C8102E!important}
html body:not(#nb) .lp-card:active{transform:translateY(0)!important}
html body:not(#nb) .lp-card .n,html body:not(#nb) .nsh .n,html body:not(#nb) .sec .n{background:linear-gradient(180deg,#FFFFFF,#E4E8EC)!important;border:1px solid #BCC3CC!important;border-radius:8px!important;color:#15181D!important}
/* горна лента: светла стомана; странично меню */
html body:not(#nb) header.bar{background:${brushed},linear-gradient(180deg,#F7F8FA,#E4E8EC)!important;border-bottom:1px solid #BCC3CC!important;box-shadow:0 1px 0 #fff inset,0 4px 14px rgba(18,24,34,.08)!important}
html body:not(#nb) aside#nav{background:linear-gradient(180deg,#F4F6F8,#E6E9ED)!important;border-right:1px solid #BCC3CC!important}
html body:not(#nb) .tb-search input,html body:not(#nb) #navq{background:#FFFFFF!important;border:1px solid #BCC3CC!important;border-radius:8px!important;color:#15181D!important}
/* бутони: червен основен, стоманен второстепенен */
html body:not(#nb) .lp-cta>a:first-child,html body:not(#nb) .b.primary,html body:not(#nb) .buy-cta{background:linear-gradient(180deg,#D81E3A,#B30E28)!important;color:#fff!important;border:1px solid #9E0B22!important;border-radius:10px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 6px 16px rgba(200,16,46,.28)!important}
html body:not(#nb) .lp-cta>a:first-child *,html body:not(#nb) .b.primary *{color:#fff!important}
html body:not(#nb) .lp-cta>a:nth-child(2){background:linear-gradient(180deg,#FFFFFF,#E4E8EC)!important;color:#15181D!important;border:1px solid #BCC3CC!important;border-radius:10px!important}
/* верен и грешен отговор: синьо с ✓, оранжево с ✕ */
html body:not(#nb) .opts button.right{background:#1D4ED8!important;color:#fff!important;border-color:#1D4ED8!important}
html body:not(#nb) .opts button.right *{color:#fff!important}
html body:not(#nb) .opts button.wrong{background:#C2410C!important;color:#fff!important;border-color:#C2410C!important}
html body:not(#nb) .opts button.wrong *{color:#fff!important}
html body:not(#nb) .opts button.right::after{content:" ✓";font-weight:800}
html body:not(#nb) .opts button.wrong::after{content:" ✕";font-weight:800}
/* плочки с числа */
html body:not(#nb) .lp-stats>div,html body:not(#nb) .lp-stats>div:nth-child(n){background:transparent!important}
html body:not(#nb) .lp-stats>div+div{border-left:1px solid #C9CFD6!important}
html body:not(#nb) .lp-stats b,html body:not(#nb) .lp-stats>div:nth-child(n) b{color:#15181D!important}
html body:not(#nb) .lp-stats>div:nth-child(2) b{color:#C8102E!important}
html body:not(#nb) .lp-stats span,html body:not(#nb) .lp-stats>div:nth-child(n) span{color:#555D68!important}
/* секцията с разделите и снимките в картите */
html body:not(#nb) .lp-tint{background:linear-gradient(180deg,#DDE1E6,#D2D7DD)!important;border-top:1px solid #BCC3CC!important;border-bottom:1px solid #BCC3CC!important}
html body:not(#nb) .lp-tint .lp-h h2{color:#15181D!important}html body:not(#nb) .lp-tint .lp-h p{color:#555D68!important}
html body:not(#nb) .lp-card-img{display:block;width:100%;aspect-ratio:16/7;object-fit:cover;border-bottom:1px solid #BCC3CC;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
html body:not(#nb) .lp-card{overflow:hidden}
html body:not(#nb) .lp-card:hover .lp-card-img{transform:scale(1.04)}
html body:not(#nb) .lp-card-tp i{border-left-color:#C8102E!important}
html body:not(#nb) .lp-card .fr{background:#C8102E!important;color:#fff!important;border:0!important;border-radius:6px!important}
/* етикети, активен таб, точки на карусела: червено с бял текст */
html body:not(#nb) .lp-kick,html body:not(#nb) .lp-hero .lp-tag{background:#C8102E!important;color:#fff!important}
html body:not(#nb) .lp-ecg path{stroke:#FF4D5A!important}
/* горната снимка остава тъмна, за да се чете белият текст върху нея */
html body:not(#nb) .lp-hero::before{background:linear-gradient(90deg,rgba(14,16,20,.9) 0%,rgba(14,16,20,.62) 45%,rgba(60,10,18,.15) 100%)!important}
@media (max-width:860px){html body:not(#nb) .lp-hero::before{background:linear-gradient(0deg,rgba(14,16,20,.94) 0%,rgba(14,16,20,.65) 55%,rgba(60,10,18,.15) 100%)!important}}
/* долната лента с табове на телефон */
html body:not(#nb) #tabbar{background:linear-gradient(180deg,#F7F8FA,#E4E8EC)!important;border-top:1px solid #BCC3CC!important}
`;
const st=document.createElement("style");st.id="palette-metal";st.textContent=css;document.head.appendChild(st);
const keep=()=>{if(st.nextElementSibling&&st.nextElementSibling.tagName==="STYLE")document.head.appendChild(st)};
new MutationObserver(keep).observe(document.head,{childList:true});
/* лентата на браузъра на телефон да е светла стомана, а не черна */
const tc=()=>{document.querySelectorAll('meta[name="theme-color"]').forEach(m=>m.content="#E6E9ED");document.documentElement.style.colorScheme="light"};
tc();addEventListener("load",tc);
})();
