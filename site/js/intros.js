/* ===== Избор на въведение =====
   При всяко отваряне се избира различно въведение (не се повтаря предишното).
   За проверка: ?intro=heart или ?intro=neuro в адреса. */
(function(){"use strict";
const ALL=["heart","neuro"];
let q=null;try{q=new URLSearchParams(location.search).get("intro")}catch(e){}
let last=null;try{last=localStorage.getItem("pn_intro_last")}catch(e){}
let pick=ALL.includes(q)?q:null;
if(!pick){const opts=ALL.filter(x=>x!==last);pick=opts[Math.floor(Math.random()*opts.length)]||ALL[0]}
try{localStorage.setItem("pn_intro_last",pick)}catch(e){}
window.__introPick=pick;
})();
