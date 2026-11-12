/* ===== Втори език (английски): превод на ниво блок в DOM + надписите върху платната ===== */
(function(){"use strict";
let LANG="bg";try{const sv=localStorage.getItem("fizsim_lang");if(sv==='"en"')LANG="en";else if(sv==null&&!window.__HARVEST){LANG=localStorage.getItem("fizsim_auth_seen")||localStorage.getItem("fizsim_auth_users")?"bg":"en";localStorage.setItem("fizsim_lang",JSON.stringify(LANG))}}catch(e){}
const HV=!!window.__HARVEST;if(HV)LANG="en";
window.PHYS_LANG=LANG;
window.setLang=l=>{try{localStorage.setItem("fizsim_lang",JSON.stringify(l))}catch(e){}location.reload()};
const D=window.__EN||{},HAS=/[А-Яа-яЁё]/,MISS=window.__miss=new Set(),CACHE=new Map();
const norm=s=>s.replace(/\s+/g," ").trim();
const dec=s=>s.replace(/(\d),(\d)(?!\d*[–-]?(?:BPG|DPG|bisphospho|diphospho))/g,"$1.$2");
function lookup(k){if(CACHE.has(k))return CACHE.get(k);let v=D[k];
  if(v==null){const nums=[];const pk=k.replace(/\d+(?:[.,]\d+)?/g,m=>{nums.push(m);return "#"});
    if(nums.length&&D[pk]!=null){let i=0;v=D[pk].replace(/#/g,()=>dec(nums[i++]||"#"))}}
  if(v==null){v=null;if(MISS.size<60000)MISS.add(k)}
  if(CACHE.size<20000)CACHE.set(k,v);return v}
window.T=s=>{if(LANG!=="en"||typeof s!=="string"||!HAS.test(s))return s;const v=lookup(norm(s));return v==null?s:v};
if(LANG!=="en")return;
document.documentElement.lang="en";
// ---------- платна (2D графики и надписи в 3D) ----------
const trS=s=>{if(typeof s!=="string")return s;if(HAS.test(s)){const v=lookup(norm(s));return v==null?s:v}return /\d,\d/.test(s)?dec(s):s};
{const P=CanvasRenderingContext2D.prototype;["fillText","strokeText","measureText"].forEach(m=>{const o=P[m];P[m]=function(s,...a){return o.call(this,trS(s),...a)}})}
// ---------- DOM ----------
const INL=new Set(["B","I","EM","STRONG","SUB","SUP","SPAN","A","SMALL","BR","CODE","U","MARK","ABBR","WBR","TSPAN"]);
const SKIP=new Set(["SCRIPT","STYLE","CANVAS","TEXTAREA","NOSCRIPT"]);
const LINKSEL=".lead,.note,.expl,.q,ol li,.book .btxt,.keyp ul,.bfig figcaption";
function keyOf(el){let h=el.innerHTML;if(h.indexOf('class="term"')>=0){const c=el.cloneNode(true);c.querySelectorAll("span.term").forEach(s=>s.replaceWith(...s.childNodes));c.normalize();h=c.innerHTML}return norm(h)}
function link(el){if(typeof GL_ORDER==="undefined")return;const done=new Set([...el.querySelectorAll(".term")].map(x=>+x.dataset.g));
  GL_ORDER.forEach(g=>{if(done.has(g.id))return;for(const rx of [g.rx,g.rx2]){if(!rx||done.has(g.id))continue;const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest(".term,b.nolink")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;
    W:while((n=w.nextNode())){const s=n.nodeValue;rx.lastIndex=0;let mt;while((mt=rx.exec(s))){const a=mt.index,b=a+mt[0].length;if(!mt[0].length){g.rx.lastIndex++;continue}if(isL(s[a-1])||isL(s[b]))continue;
      const r=document.createRange();r.setStart(n,a);r.setEnd(n,b);const sp=document.createElement("span");sp.className="term";sp.dataset.g=g.id;try{r.surroundContents(sp)}catch(e){}done.add(g.id);break W}}}})}
const ATTR=["placeholder","title","aria-label"];
function attrs(el){for(const a of ATTR){const v=el.getAttribute&&el.getAttribute(a);if(v&&HAS.test(v)){const t=lookup(norm(v));if(t!=null)el.setAttribute(a,t.replace(/<[^>]+>/g,""))}}}
function trEl(el){if(el.nodeType===3){trText(el);return}if(el.nodeType!==1||SKIP.has(el.tagName))return;attrs(el);
  if(el.tagName==="INPUT"||el.tagName==="SELECT"&&false)return;
  const tc=el.textContent;if(!tc||(!HAS.test(tc)&&!/\d,\d/.test(tc))){if(el.children.length)el.querySelectorAll("[placeholder],[title],[aria-label]").forEach(attrs);return}
  let hasText=false,inl=true;
  for(const c of el.childNodes){if(c.nodeType===3){if(c.nodeValue.trim())hasText=true}else if(c.nodeType===1){if(!INL.has(c.tagName))inl=false;else if(c.firstElementChild&&c.querySelector("svg,canvas,input,button,select,div,p,li,table"))inl=false}}
  if(hasText&&inl&&el.children.length&&HAS.test(tc)){const k=keyOf(el),v=lookup(k);
    if(v!=null){el.innerHTML=v;if(el.closest(LINKSEL))link(el);return}if(HV)return}
  for(const c of Array.from(el.childNodes)){if(c.nodeType===3)trText(c);else trEl(c)}}
function trText(n){const t=n.nodeValue;if(!t)return;const p=n.parentNode;if(p&&p.nodeType===1&&SKIP.has(p.tagName))return;
  if(HAS.test(t)){const k=norm(t);if(!k)return;const v=lookup(k);if(v==null)return;
    if(v.indexOf("<")>=0||v.indexOf("&")>=0){const tp=document.createElement("template");tp.innerHTML=v;n.replaceWith(tp.content)}else n.nodeValue=t.replace(t.trim(),()=>v)}
  else if(/\d,\d/.test(t)&&p&&p.closest&&p.closest("#main")){const u=dec(t);if(u!==t)n.nodeValue=u}}
let busy=false;const Q=new Set();
function flush(){if(busy)return;busy=true;try{const L=[...Q];Q.clear();for(const n of L){if(!n.isConnected)continue;let skip=false;for(let p=n.parentNode;p;p=p.parentNode)if(Q.has(p)||L.indexOf(p)>=0&&p!==n){skip=true;break}if(!skip)trEl(n)}
  if(HAS.test(document.title)){const v=lookup(norm(document.title));if(v!=null)document.title=v.replace(/<[^>]+>/g,"")}
  relink()}finally{obs.takeRecords();busy=false}}
let rlT=0;function relink(){clearTimeout(rlT);rlT=setTimeout(()=>{busy=true;try{const m=document.getElementById("main");if(m)m.querySelectorAll(LINKSEL).forEach(el=>{if(!el.querySelector(LINKSEL))link(el)})}catch(e){}finally{obs.takeRecords();busy=false}},120)}
const obs=new MutationObserver(ms=>{if(busy)return;for(const m of ms){if(m.type==="characterData"){const p=m.target.parentNode;if(p)Q.add(p.nodeType===1&&p.children.length&&INL.has(p.tagName)&&p.parentNode?p.parentNode:m.target)}else{m.addedNodes.forEach(n=>{if(n.nodeType===1)Q.add(n);else if(n.nodeType===3&&n.parentNode)Q.add(n.parentNode.nodeType===1&&[...n.parentNode.childNodes].some(c=>c.nodeType===1)?n.parentNode:n)});
      if(m.target.nodeType===1&&m.addedNodes.length&&!m.target.firstElementChild)Q.add(m.target)}}if(Q.size)flush()});
// ---------- речник и търсене ----------
function glossary(){if(typeof GL==="undefined")return;const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  GL.forEach(g=>{const t=lookup(norm(g.t)),d=lookup(norm(g.d));if(d!=null)g.d=d;if(t!=null){g.t=t;const plain=t.replace(/<[^>]+>/g,"");const R=window.__EN_RE&&window.__EN_RE[plain],RC=window.__EN_RE_CS&&window.__EN_RE_CS[plain];
      try{g.rx2=RC?new RegExp(RC,"g"):null}catch(e){g.rx2=null}
      let src=R;if(!src&&window.__EN_RE&&window.__EN_RE_CS&&RC)src="";else if(!src){const vs=[];plain.split(/\s*\/\s*|\s*;\s*|,\s+and\s+|\s+and\s+|,\s*/).forEach(p=>{const m=p.match(/^(.*?)\s*\(([^)]+)\)\s*$/);if(m){vs.push(m[1]);vs.push(m[2])}else vs.push(p)});
        src=vs.map(v=>v.trim()).filter(v=>v.length>=3).sort((a,b)=>b.length-a.length).map(v=>esc(v)+(/[a-z]$/.test(v)&&v.length>4?"(?:e?s)?":"")).join("|")}
      try{g.rx=src?new RegExp(src,"gi"):null}catch(e){g.rx=null}if(!g.rx&&g.rx2){g.rx=g.rx2;g.rx2=null}}else if(!HV&&HAS.test(g.t))g.rx=null})}
function start(){glossary();trEl(document.body);if(HAS.test(document.title)){const v=lookup(norm(document.title));if(v!=null)document.title=v}
  obs.observe(document.body,{subtree:true,childList:true,characterData:true})}
window.__i18nStart=start;window.__trEl=trEl;
})();
