#!/usr/bin/env python3
"""Сглобява папката site/ за Netlify от работната версия.
Употреба: python3 build.py  (чете config.json за публичните ключове)"""
import json,os,shutil,re
H="/home/claude";D=os.path.dirname(os.path.abspath(__file__));S=os.path.join(D,"site")
cfg=json.load(open(os.path.join(D,"config.json")))
shutil.rmtree(S,ignore_errors=True);os.makedirs(S+"/js")
for f in os.listdir(H+"/js"):shutil.copy(H+"/js/"+f,S+"/js/"+f)
shutil.copytree(H+"/fonts",S+"/fonts",dirs_exist_ok=True)
shutil.copy("/tmp/sbjs/node_modules/@supabase/supabase-js/dist/umd/supabase.js",S+"/js/supabase.min.js")
pub={k:cfg[k] for k in ("supabaseUrl","supabaseAnon","price","email","siteUrl") if cfg.get(k)}
open(S+"/js/config.js","w").write("/* публични настройки на сайта (без тайни ключове) */\nwindow.PHYS_CFG="+json.dumps(pub,ensure_ascii=False)+";\n")
h=open(H+"/fiziologiya-simulator.html",encoding="utf8").read()
o='<script src="js/shell.js"></script>'
assert h.count(o)==1
h=h.replace(o,'<script src="js/config.js"></script><script src="js/supabase.min.js"></script><script src="js/sb.js"></script><script src="js/native.js"></script>'+o)
h=h.replace('<body>','<body>'+'<div id="hxo" style="position:fixed;inset:0;z-index:100000;background:linear-gradient(115deg,#D9DCE0 0%,#F4F5F6 28%,#C9CDD2 46%,#EEF0F2 64%,#D3D7DB 82%,#F6F7F8 100%);display:grid;place-items:center;color:#5E5E63;font:600 13px/1 system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase">PhysioNova</div><script>/* въведение: черен екран веднага; предпазител, ако js/heartintro.js не поеме */document.documentElement.style.overflow="hidden";setTimeout(function(){if(!window.__hxo){var o=document.getElementById("hxo");if(o)o.remove();document.documentElement.style.overflow=""}},25000);</script>',1)
h=h.replace('<script src="js/brutal.js"></script>','<script src="js/brutal.js"></script><script src="js/chrome.js"></script><script src="js/fullscreen.js"></script><script src="js/fonttest.js"></script><script src="js/heartintro.js"></script>',1)
h=h.replace("<title>","<meta name=\"description\" content=\"Интерактивен симулатор по физиология за студенти по медицина: 3D модели, симулации, тестове.\"><title>",1)
# тежките 3D модели — в отделни файлове, зареждат се при нужда (страницата се отваря бързо)
import re as _re
os.makedirs(S+"/m",exist_ok=True);_ids=[]
def _cut(m):
    i=m.group(1);open(S+"/m/"+i+".txt","w").write(m.group(2));_ids.append(i);return ""
h=_re.sub(r'<script type="text/plain" id="([a-z0-9]+)">(.*?)</script>',_cut,h,flags=_re.S)
_lz="""<script>(function(){var L=%s,C={},g=Document.prototype.getElementById;
function get(i){if(C[i]!=null)return C[i];var x=new XMLHttpRequest();x.open("GET","m/"+i+".txt",false);x.send();return C[i]=x.status==200?x.responseText:null}
Document.prototype.getElementById=function(i){var e=g.call(this,i);if(e||L.indexOf(i)<0||C[i]===false)return e;var t=get(i);if(t==null)return null;e=document.createElement("script");e.type="text/plain";e.id=i;e.textContent=t;C[i]=false;(document.body||document.head).appendChild(e);return e};
addEventListener("load",function(){setTimeout(function(){L.forEach(function(i){fetch("m/"+i+".txt").then(function(r){return r.text()}).then(function(t){if(C[i]==null)C[i]=t}).catch(function(){})})},4000)})})();</script>"""%json.dumps(_ids)
h=h.replace("<head>","<head>"+_lz,1)
open(S+"/index.html","w",encoding="utf8").write(h)
# снимки на симулациите за страницата за покупка
if os.path.isdir(os.path.join(D,"img")):
    shutil.copytree(os.path.join(D,"img"),S+"/img",dirs_exist_ok=True)
print("site ready:",sum(os.path.getsize(os.path.join(dp,f)) for dp,_,fs in os.walk(S) for f in fs)//1024,"KB")
shutil.copy(os.path.join(D,"site_headers.txt"),S+"/_headers")
