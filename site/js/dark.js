/* Сайтът е само в тъмен режим, независимо от настройката на браузъра или устройството.
   Правилата „@media (prefers-color-scheme: dark)“ се прилагат винаги, а светлите се изключват. */
(function(){
var DARK=/prefers-color-scheme\s*:\s*dark/i, LIGHT=/prefers-color-scheme\s*:\s*light/i;
var mm=window.matchMedia&&window.matchMedia.bind(window);
if(mm)window.matchMedia=function(q){
  if(DARK.test(q)||LIGHT.test(q)){var m=DARK.test(q);
    return {matches:m,media:q,onchange:null,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return false}}}
  return mm(q)};
function fix(list){for(var i=0;i<list.length;i++){var r=list[i];
  if(r.media&&r.cssRules){var t=r.media.mediaText;
    if(DARK.test(t)){r.media.mediaText=t.replace(/\(\s*prefers-color-scheme\s*:\s*dark\s*\)/ig,"(min-width:0px)")}
    else if(LIGHT.test(t)){r.media.mediaText="not all"}
    fix(r.cssRules)}
  else if(r.cssRules)fix(r.cssRules)}}
function run(){var s=document.styleSheets;for(var i=0;i<s.length;i++){try{fix(s[i].cssRules)}catch(e){}}}
document.documentElement.style.colorScheme="dark";
var meta=document.createElement("meta");meta.name="color-scheme";meta.content="dark";document.head.appendChild(meta);
var tc=document.createElement("meta");tc.name="theme-color";tc.content="#000000";document.head.appendChild(tc);
run();
new MutationObserver(function(ms){for(var i=0;i<ms.length;i++)for(var j=0;j<ms[i].addedNodes.length;j++){var n=ms[i].addedNodes[j];if(n.tagName==="STYLE"||n.tagName==="LINK"){run();return}}}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener("DOMContentLoaded",run);window.addEventListener("load",run);
})();
