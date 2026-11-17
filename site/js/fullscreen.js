/* ===== Цял екран за симулациите =====
   Бутон в горния десен ъгъл на всеки 3D изглед (отваря цялата карта на модела с контролите)
   и бутон „Цял екран“ над раздела „Симулация“ (отваря целия раздел).
   Използва Fullscreen API, а където го няма (iPhone) — фиксиран слой върху целия екран. */
(function(){"use strict";
const tr=s=>(window.T?window.T(s):s);
const ICO_ON='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
const ICO_OFF='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
const css=`
.fs-btn{position:absolute;top:10px;right:10px;z-index:4;width:36px;height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.92);color:#1D1D1F;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.18);-webkit-tap-highlight-color:transparent}
.fs-btn:hover{background:#fff}.fs-btn:focus-visible{outline:2px solid #C8102E;outline-offset:2px}
.v3d.has-fs .cap-r{margin-right:44px}
.fs-bar{display:flex;justify-content:flex-end;margin:0 0 10px}
.fs-tab{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--line,#ddd);background:#fff;color:#1D1D1F;font:600 14px/1 inherit;cursor:pointer}
html body .fs-on,html body #main .card.fs-on,html body #main .fs-on:fullscreen{background:#F5F5F7!important;background-image:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;opacity:1!important;filter:none!important}
.fs-on::backdrop{background:#F5F5F7}
.fs-on{position:fixed!important;inset:0!important;z-index:2147483000!important;margin:0!important;max-width:none!important;width:100%!important;height:100%!important;border-radius:0!important;overflow:auto!important;-webkit-overflow-scrolling:touch;background:#F5F5F7!important;padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))!important;box-sizing:border-box!important}
.fs-on .v3d{height:calc(100vh - 150px)!important;height:calc(100dvh - 150px)!important;min-height:300px}
@media (orientation:landscape) and (max-height:560px){.fs-on .v3d{height:calc(100vh - 80px)!important;height:calc(100dvh - 80px)!important}.fs-on.card>h3,.fs-on.card>p.small{display:none!important}.fs-on .btns{margin-bottom:6px}}
.fs-on .fs-exit{position:sticky;top:0;float:right;z-index:5;margin:0 0 6px 8px}
html.fs-lock,html.fs-lock body{overflow:hidden!important}
`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

let cur=null;
const native=el=>el.requestFullscreen||el.webkitRequestFullscreen;
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
function resize(){window.dispatchEvent(new Event("resize"));setTimeout(()=>window.dispatchEvent(new Event("resize")),120)}
function setIcons(on){document.querySelectorAll(".fs-btn,.fs-tab").forEach(b=>{const o=on&&!!cur&&b._t===cur;
  const want=o?"off":"on";if(b.dataset.st===want)return;b.dataset.st=want;
  if(b.classList.contains("fs-tab"))b.innerHTML=(o?ICO_OFF:ICO_ON)+"<span>"+tr(o?"Изход от цял екран":"Цял екран")+"</span>";else b.innerHTML=o?ICO_OFF:ICO_ON;
  b.setAttribute("aria-label",tr(o?"Изход от цял екран":"Цял екран"));b.title=b.getAttribute("aria-label")})}
function enter(el){if(cur)exit();cur=el;el.classList.add("fs-on");document.documentElement.classList.add("fs-lock");
  const f=native(el);if(f){try{const r=f.call(el);if(r&&r.catch)r.catch(()=>{})}catch(e){}}
  setIcons(true);resize()}
function exit(){if(!cur)return;const el=cur;cur=null;el.classList.remove("fs-on");document.documentElement.classList.remove("fs-lock");
  if(fsEl()){const x=document.exitFullscreen||document.webkitExitFullscreen;try{const r=x.call(document);if(r&&r.catch)r.catch(()=>{})}catch(e){}}
  setIcons(false);resize();try{el.scrollIntoView({block:"start"})}catch(e){}}
const toggle=el=>{cur===el?exit():enter(el)};
["fullscreenchange","webkitfullscreenchange"].forEach(ev=>document.addEventListener(ev,()=>{if(!fsEl()&&cur)exit();else resize()}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&cur)exit()});
window.addEventListener("hashchange",()=>{if(cur)exit()});

function decorate(root){
  root.querySelectorAll(".v3d:not(.has-fs)").forEach(v=>{
    if(!v.closest("#main"))return;
    v.classList.add("has-fs");const b=document.createElement("button");b.type="button";b.className="fs-btn";
    b._t=v.closest(".card")||v;b.addEventListener("click",e=>{e.stopPropagation();toggle(b._t)});
    b.addEventListener("pointerdown",e=>e.stopPropagation());
    v.appendChild(b)});
  const tab=root.querySelector("#tab_sim");
  if(tab&&!tab.querySelector(":scope > .fs-bar")){const bar=document.createElement("div");bar.className="fs-bar";
    const b=document.createElement("button");b.type="button";b.className="fs-tab";b._t=tab;b.addEventListener("click",()=>toggle(tab));bar.appendChild(b);tab.insertBefore(bar,tab.firstChild)}
  setIcons(!!cur)}
let tm=0;const mo=new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>decorate(document),60)});
const start=()=>{decorate(document);mo.observe(document.body,{childList:true,subtree:true})};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
window.__fs={enter,exit};
})();
