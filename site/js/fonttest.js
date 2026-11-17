/* ===== Тест на шрифтове (само в тестовата версия) =====
   Плаващ бутон „Шрифт“ превключва двойки шрифтове върху целия сайт.
   Всички двойки са с отворен лиценз (SIL OFL) и имат български форми на кирилицата (locl BGR). */
(function(){"use strict";
const SET=[
 {k:"sys",n:"Системен (стар)",d:"SF Pro / Segoe UI / Roboto",ui:null},
 {k:"source",n:"Source Serif 4 + Source Sans 3",d:"Adobe · учебник, научно издание",
  ui:'"Source Sans 3"',h:'"Source Serif 4"',r:'"Source Serif 4"',
  css:"family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Source+Sans+3:wght@400;500;600;700"},
 {k:"plex",n:"IBM Plex Sans + Spectral",d:"IBM / Production Type · лаборатория, прецизност",
  ui:'"IBM Plex Sans"',h:'"Spectral"',r:'"IBM Plex Sans"',
  css:"family=IBM+Plex+Sans:wght@400;500;600;700&family=Spectral:wght@500;600;700"},
 {k:"wix",n:"Wix Madefor Display + Text",d:"Dalton Maag · съвременен, чист",
  ui:'"Wix Madefor Text"',h:'"Wix Madefor Display"',r:'"Wix Madefor Text"',
  css:"family=Wix+Madefor+Display:wght@600;700;800&family=Wix+Madefor+Text:wght@400;500;600;700"},
 {k:"piaz",n:"Piazzolla + Commissioner",d:"Huerta Tipográfica / Kostas Bartsokas · редакционен",
  ui:'"Commissioner"',h:'"Piazzolla"',r:'"Piazzolla"',
  css:"family=Piazzolla:opsz,wght@8..30,400;8..30,600;8..30,700&family=Commissioner:wght@400;500;600;700"},
 {k:"geo",n:"Geologica + Source Sans 3",d:"Monokrom (кирилица по рождение) · технологичен",
  ui:'"Source Sans 3"',h:'"Geologica"',r:'"Source Sans 3"',
  css:"family=Geologica:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700"},
 {k:"ysab",n:"Vollkorn + Ysabeau Office",d:"F. Althausen / C. Fahrner · класически, хуманистичен",
  ui:'"Ysabeau Office"',h:'"Vollkorn"',r:'"Ysabeau Office"',
  css:"family=Vollkorn:wght@500;600;700&family=Ysabeau+Office:wght@400;500;600;700"}
];
function on(){const c=window.PHYS_CFG||{};return !!c.testOpen||/[?&]fonts\b/.test(location.search)}
const DEF="piaz";let cur=DEF;try{cur=localStorage.getItem("physio_fonttest2")||DEF}catch(e){}
const q=new URLSearchParams(location.search).get("font");if(q)cur=q;
const st=document.createElement("style");st.id="ft-style";
const lk=document.createElement("link");lk.rel="stylesheet";lk.id="ft-link";
function apply(k){const s=SET.find(x=>x.k===k)||SET[0];cur=s.k;try{if(on())localStorage.setItem("physio_fonttest2",cur)}catch(e){}
  if(!s.ui){st.textContent="";lk.removeAttribute("href")}
  else{lk.href="https://fonts.googleapis.com/css2?"+s.css+"&display=swap";
    const B="html:root body:not(#ft0)";
    st.textContent=`${B},${B} :is(p,li,td,th,span,div,a,label,b,strong,em,i,small,button,input,select,textarea,summary,figcaption,.lead,.note,.small,.tag){font-family:${s.ui},system-ui,sans-serif!important}
${B}:not(#ft1) :is(h1,h2,h3,h4,.lp-h h2,.lp-h h1){font-family:${s.h},Georgia,serif!important;letter-spacing:-.01em!important}
${B}:not(#ft1) :is(.book .btxt,.book .btxt p,.book .btxt li,.book .btxt b,.lead,.keyp li){font-family:${s.r},Georgia,serif!important}
${B}:not(#ft1) :is(.stat .v,.stats .v,.lp-stats b,td){font-variant-numeric:tabular-nums lining-nums}
${B}:not(#ft1) :is(svg,svg *,code,pre,.mono){font-family:revert!important}`}
  document.querySelectorAll(".ft-opt").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k===cur?"true":"false"));
  const lb=document.querySelector(".ft-fab span");if(lb)lb.textContent=s.n.split(" + ")[0];
  window.__canvasFont=s.ui?s.ui.replace(/"/g,"'"):null;
  const redraw=()=>{window.dispatchEvent(new Event("resize"))};if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>setTimeout(redraw,50));setTimeout(redraw,1200)}
// шрифтът в графиките (canvas) следва избрания шрифт на интерфейса
{const P=CanvasRenderingContext2D.prototype,d=Object.getOwnPropertyDescriptor(P,"font");if(d&&d.set)Object.defineProperty(P,"font",{configurable:true,get(){return d.get.call(this)},set(v){const f=window.__canvasFont;if(f&&typeof v==="string"&&/-apple-system|system-ui|Segoe UI|Arial|sans-serif/.test(v)&&!/Georgia|serif\b(?!-)|mono/i.test(v.replace(/sans-serif/g,"")))v=v.replace(/(-apple-system|system-ui)[^;]*$/,f+",-apple-system,Segoe UI,Arial,sans-serif");d.set.call(this,v)}})}
function ui(){
  const css=document.createElement("style");css.textContent=`
.ft-fab{position:fixed;left:16px;bottom:16px;z-index:2147482000;display:flex;align-items:center;gap:8px;height:40px;padding:0 14px;border-radius:999px;border:1px solid rgba(0,0,0,.12);background:#1D1D1F;color:#fff;font:600 13px/1 system-ui,sans-serif!important;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.22)}
.ft-fab b{font:700 15px/1 Georgia,serif!important}
.ft-fab span{font:600 13px/1 system-ui,sans-serif!important;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ft-pan{position:fixed;left:16px;bottom:64px;z-index:2147482001;width:min(340px,calc(100vw - 32px));max-height:min(70vh,560px);overflow:auto;background:#fff;color:#1D1D1F;border-radius:16px;border:1px solid rgba(0,0,0,.1);box-shadow:0 18px 50px rgba(0,0,0,.25);padding:10px}
.ft-pan[hidden]{display:none}
.ft-pan h4{margin:4px 8px 8px;font:700 13px/1.3 system-ui,sans-serif!important;color:#6E6E73;text-transform:uppercase;letter-spacing:.04em}
.ft-opt{display:block;width:100%;text-align:left;border:1px solid transparent;background:#F5F5F7;border-radius:12px;padding:10px 12px;margin:0 0 6px;cursor:pointer;color:#1D1D1F}
.ft-opt[aria-pressed=true]{border-color:#C8102E;background:#FFF1F2}
.ft-opt .s{display:block;font-size:20px;line-height:1.2;margin-bottom:4px}
.ft-opt .m{display:block;font:600 12.5px/1.3 system-ui,sans-serif!important}
.ft-opt .d{display:block;font:400 11.5px/1.3 system-ui,sans-serif!important;color:#6E6E73}
@media (max-width:900px){.ft-fab{bottom:calc(84px + env(safe-area-inset-bottom))}.ft-pan{bottom:calc(132px + env(safe-area-inset-bottom))}}`;
  document.head.appendChild(css);
  // предварително зареждане на образците в менюто
  const pre=document.createElement("link");pre.rel="stylesheet";pre.href="https://fonts.googleapis.com/css2?"+SET.filter(s=>s.css).map(s=>s.css).join("&")+"&display=swap&text="+encodeURIComponent("Мембранен потенциал жгщюяЖЩЮЯ");document.head.appendChild(pre);
  const fab=document.createElement("button");fab.type="button";fab.className="ft-fab";fab.innerHTML="<b>Аа</b><span></span>";fab.setAttribute("aria-label","Тест на шрифтове");
  const pan=document.createElement("div");pan.className="ft-pan";pan.hidden=true;
  pan.innerHTML="<h4>Тест на шрифтове</h4>"+SET.map(s=>`<button type="button" class="ft-opt" data-k="${s.k}"><span class="s" style="font-family:${s.h||"system-ui"},sans-serif">Мембранен потенциал · жгщюя</span><span class="m">${s.n}</span><span class="d">${s.d}</span></button>`).join("");
  fab.onclick=()=>{pan.hidden=!pan.hidden};
  pan.addEventListener("click",e=>{const b=e.target.closest(".ft-opt");if(b){apply(b.dataset.k)}});
  document.addEventListener("click",e=>{if(!pan.hidden&&!pan.contains(e.target)&&!fab.contains(e.target))pan.hidden=true});
  document.body.appendChild(fab);document.body.appendChild(pan)}
function start(){document.head.appendChild(lk);document.head.appendChild(st);if(on()){ui()}else cur=DEF;apply(cur)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
window.__fontTest={apply,SET};
})();
