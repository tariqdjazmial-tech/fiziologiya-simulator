/* ===== Обвивка на приложението: визия, меню, начален екран, профил и абонамент ===== */
(function(){"use strict";
const SEC_COL={I:"#0D9488",II:"#EA580C",III:"#DC2626",IV:"#DB2777",V:"#0284C7",VI:"#4F46E5",VII:"#65A30D",VIII:"#D97706",IX:"#C026D3",X:"#7C3AED",XI:"#0891B2",XII:"#2563EB"};
const PREMIUM=window.PHYS_PREMIUM=Object.assign({lock:false,unlocked:false,free:SYLLABUS[0].items.filter(i=>i.ready).map(i=>i.id)},window.PHYS_PREMIUM||{});
const isFree=id=>!PREMIUM.lock||PREMIUM.unlocked||PREMIUM.free.includes(id);
const I={home:'<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/>',list:'<path d="M4 6h16M4 12h16M4 18h10"/>',test:'<path d="M9 11.5l2.2 2.2L15.5 9.5"/><rect x="4" y="3.5" width="16" height="17" rx="3"/>',book:'<path d="M5 4.5h10.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10.5"/>',user:'<circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20.5c1-4 4-5.6 7.5-5.6s6.5 1.6 7.5 5.6"/>',chev:'<path d="M6 9l6 6 6-6"/>',lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.500 9.7l5.9-.8z"/>',play:'<path d="M8 5.5v13l10.500-6.5z"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.500 4.500"/>'};
const ic=(k,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;
// ---------- стилове ----------
const css=`
:root{--bg:#f3f5f8;--panel:#fff;--line:#dfe4ea;--chip:#eef1f5;--r:14px;--r2:10px;--sh:0 1px 2px rgba(16,24,40,.05),0 2px 8px rgba(16,24,40,.04);--sh2:0 10px 30px rgba(16,24,40,.12);--tabH:0px;--sec:var(--accent)}
@media (prefers-color-scheme:dark){:root{--bg:#0f1318;--panel:#181d25;--line:#29303b;--chip:#212833;--sh:0 0 0 1px rgba(255,255,255,.04);--sh2:0 14px 40px rgba(0,0,0,.5)}}
html{scroll-padding-top:calc(var(--barH) + 60px)}
body{-webkit-font-smoothing:antialiased;padding-bottom:var(--tabH)}
header.bar{background:color-mix(in srgb,var(--panel) 86%,transparent);backdrop-filter:saturate(1.6) blur(14px);-webkit-backdrop-filter:saturate(1.6) blur(14px);padding-top:env(safe-area-inset-top);height:calc(var(--barH) + env(safe-area-inset-top))}
.iconbtn{border-radius:12px}.brand b{font-size:24px}
.quick a{border-radius:999px;padding:8px 14px;font-size:14.5px}
.quick a.prem{color:var(--accent);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--accent) 55%,transparent);gap:6px}.quick a.prem.on{background:var(--accent);color:#fff}
#langBtn{margin-left:8px;border:0;border-radius:999px;background:var(--chip);color:var(--ink);font:650 13px/1 var(--sans);padding:9px 12px;cursor:pointer;flex:none}#langBtn:hover{background:var(--line)}
@media (max-width:900px){#langBtn{margin-left:auto;margin-right:10px}}
/* карти и бутони */
.card{border-radius:var(--r);border-color:transparent;box-shadow:var(--sh);padding:16px}
.card .card{border-radius:var(--r2);box-shadow:none;border-color:var(--line)}
.exp{border-radius:var(--r2)}.exp .opts button{border-radius:10px;padding:11px 14px}
button.b,a.b{border-radius:10px;padding:8px 13px}button.b.primary{box-shadow:0 2px 8px color-mix(in srgb,var(--accent) 35%,transparent)}
select{border-radius:10px;padding:9px 12px}
.toggle{border-radius:12px;padding:4px}.toggle button{border-radius:9px;padding:7px 12px}
.note{border-radius:0 10px 10px 0}
.stat{border-top-width:1.5px}
h2{font-size:clamp(30px,5.2vw,42px)}
.booktabs{margin-left:0!important;box-shadow:0 0 0 6px var(--bg);background:var(--chip);border-radius:999px;padding:4px;display:inline-flex!important;flex-wrap:nowrap;max-width:100%;overflow-x:auto;scrollbar-width:none}.booktabs::-webkit-scrollbar{display:none}
.booktabs button{border:0;background:transparent;color:var(--muted);padding:8px 18px}.booktabs button.on{background:var(--panel);color:var(--ink);box-shadow:0 1px 3px rgba(16,24,40,.14)}
.booktabs .bt-hint{display:none}
.secchip{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:650;color:var(--sec);background:color-mix(in srgb,var(--sec) 10%,transparent);border-radius:999px;padding:4px 12px 4px 6px;margin:2px 0 4px;text-decoration:none}
.secchip i{font:600 15px/1 var(--cond);font-style:normal;background:var(--sec);color:#fff;border-radius:999px;min-width:26px;height:22px;display:inline-grid;place-items:center;padding:0 6px}
.pager a{border-radius:var(--r);border-color:transparent;box-shadow:var(--sh);padding:14px 16px}
/* странично меню */
#nav{width:330px;border-right:0;box-shadow:1px 0 0 var(--line)}
.navhead{padding:16px 16px 12px;border-bottom:0}.navhead h2{font-size:24px;margin:0 0 10px}
.navhead .sw{position:relative}.navhead .sw svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted)}
.navhead input{border-radius:12px;padding:10px 12px 10px 36px;background:var(--chip);border-color:transparent}.navhead input:focus{background:var(--panel);border-color:var(--line)}
#navlist{padding:2px 10px 14px}
.ns{border-radius:12px;margin-bottom:2px}.ns.open{background:color-mix(in srgb,var(--sec) 5%,transparent)}
.nsh{width:100%;display:grid;grid-template-columns:34px 1fr auto 18px;gap:8px;align-items:center;padding:9px 10px;border:0;background:transparent;color:var(--ink);font:inherit;text-align:left;cursor:pointer;border-radius:12px}
.nsh:hover{background:var(--chip)}
.nsh .n{font:600 15px/1 var(--cond);background:var(--sec);color:#fff;border-radius:8px;height:26px;display:grid;place-items:center}
.nsh .h{font-weight:650;font-size:14.5px;line-height:1.25}
.nsh .c{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
.nsh svg{color:var(--muted);transition:transform .18s}.ns.open .nsh svg{transform:rotate(180deg)}
.nsl{display:none;padding:0 4px 8px}.ns.open .nsl{display:block}
#navlist .nsl a{display:grid;grid-template-columns:14px 1fr auto;gap:10px;align-items:center;padding:8px 10px 8px 14px;border-radius:10px;font-size:14.5px}
#navlist .nsl a.active{background:var(--panel);box-shadow:var(--sh);font-weight:650}#navlist .nsl a.active::before{display:none}
.st{width:10px;height:10px;border-radius:50%;box-shadow:inset 0 0 0 1.6px var(--ref)}.st.part{box-shadow:inset 0 0 0 1.6px var(--sec);background:linear-gradient(90deg,var(--sec) 50%,transparent 50%)}.st.done{background:var(--sec);box-shadow:none}
.navfoot{border-top:0;padding:12px 16px calc(14px + env(safe-area-inset-bottom));background:linear-gradient(transparent,var(--panel) 30%)}
.navfoot .pm{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:12px;background:var(--ink);color:var(--panel);text-decoration:none;font-weight:650;font-size:14.5px;margin-top:10px}.navfoot .pm span{flex:1}.navfoot .pm small{font-weight:400;opacity:.75;display:block;font-size:12px}
@media (max-width:1279px){#nav{width:min(400px,92vw);top:0;z-index:60;border-radius:0 20px 20px 0;padding-top:env(safe-area-inset-top);box-shadow:var(--sh2)}body.navopen #scrim{inset:0;z-index:55;background:rgba(10,16,26,.42)}}
/* начален екран */
.hero2{position:relative;border-radius:22px;overflow:hidden;margin:2px 0 18px;padding:22px 24px 22px;background-color:var(--paper);background-image:linear-gradient(var(--paperbold) 1px,transparent 1px),linear-gradient(90deg,var(--paperbold) 1px,transparent 1px),linear-gradient(var(--paperline) 1px,transparent 1px),linear-gradient(90deg,var(--paperline) 1px,transparent 1px);background-size:40px 40px,40px 40px,8px 8px,8px 8px;background-position:-1px -1px;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:22px;align-items:end;min-height:250px}
.hero2 svg.trace{position:absolute;left:0;right:0;top:14px;width:100%;height:96px;pointer-events:none}
.hero2 h1{position:relative;font:600 clamp(52px,8.4vw,92px)/.9 var(--cond);margin:84px 0 8px;letter-spacing:-.01em}
.hero2 p{position:relative;margin:0;max-width:44ch;font-size:16px}
.cont{position:relative;background:var(--panel);border-radius:18px;box-shadow:var(--sh2);padding:16px 16px 14px;display:flex;flex-direction:column;gap:8px;text-decoration:none;color:var(--ink)}
.cont small{font-size:12.5px;color:var(--muted);font-weight:600}
.cont b{font-size:18px;line-height:1.25;font-weight:650}
.cont .go{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px}
.cont .go span{display:inline-flex;align-items:center;gap:6px;background:var(--accent);color:#fff;border-radius:999px;padding:8px 16px 8px 12px;font-weight:650;font-size:14.5px}
.cont .go em{font-style:normal;font-size:12.5px;color:var(--muted)}
.pbar{height:6px;border-radius:3px;background:var(--chip);overflow:hidden}.pbar>div{height:100%;border-radius:3px;background:var(--sec)}
.kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 22px}
.kpi{background:var(--panel);border-radius:var(--r);box-shadow:var(--sh);padding:12px 14px}
.kpi b{font:600 30px/1 var(--cond);display:block}.kpi b i{font-style:normal;font-size:17px;color:var(--muted);font-weight:500}.kpi span{font-size:12.5px;color:var(--muted)}
.hsec{display:flex;align-items:baseline;justify-content:space-between;margin:0 2px 10px}.hsec h3{margin:0;font-size:19px}.hsec a{font-size:13.5px;color:var(--muted)}
.secgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px}
.sec{background:var(--panel);border-radius:18px;box-shadow:var(--sh);overflow:hidden;display:flex;flex-direction:column}
.sec header{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:14px 16px 10px}
.sec .n{font:600 20px/1 var(--cond);min-width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--sec) 12%,transparent);color:var(--sec);padding:0 8px}
.sec h4{margin:0;font-size:16px;line-height:1.25;font-weight:650}.sec header small{display:block;color:var(--muted);font-size:12.5px;font-weight:400;margin-top:1px}
.sec .pc{font:600 15px/1 var(--cond);color:var(--muted)}
.sec .pbar{margin:0 16px;height:4px}
.sec ul{list-style:none;margin:8px 0 8px;padding:0 8px}
.sec li a{display:grid;grid-template-columns:14px 1fr auto;gap:10px;align-items:center;padding:8px 8px;border-radius:10px;color:var(--ink);text-decoration:none;font-size:14.5px;line-height:1.3}
.sec li a:hover{background:var(--chip)}.sec li a .p{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}.sec li a .lk{color:var(--muted);display:grid}
.homefoot{color:var(--muted);font-size:13.5px;margin:22px 2px 0}
/* профил и абонамент */
.plans{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:12px 0}
.plan{border-radius:18px;padding:18px;background:var(--panel);box-shadow:var(--sh);position:relative;display:flex;flex-direction:column;gap:6px}
.plan.best{box-shadow:0 0 0 2px var(--accent),var(--sh)}.plan .tag{position:absolute;top:-10px;right:14px;background:var(--accent);color:#fff;font-size:12px;font-weight:650;border-radius:999px;padding:3px 10px}
.plan h4{margin:0;font-size:17px}.plan .pr{font:600 34px/1 var(--cond)}.plan .pr small{font:400 14px var(--sans);color:var(--muted)}
.plan button{margin-top:8px;border:0;border-radius:12px;padding:12px;font:inherit;font-weight:650;background:var(--ink);color:var(--panel);cursor:pointer}.plan button:disabled{opacity:.45;cursor:default}
.feat{list-style:none;margin:8px 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:8px 18px}.feat li{display:grid;grid-template-columns:22px 1fr;gap:8px;font-size:15px;line-height:1.4}.feat li svg{color:var(--accent3);margin-top:1px}
.paywall{max-width:560px;margin:40px auto;text-align:center}.paywall .ic{width:64px;height:64px;border-radius:20px;background:color-mix(in srgb,var(--accent) 12%,transparent);color:var(--accent);display:grid;place-items:center;margin:0 auto 14px}
/* профил: вход и регистрация */
.auth{max-width:440px;margin:10px auto 30px}.auth h2{margin-bottom:4px}
.seg{display:grid;grid-template-columns:1fr 1fr;background:var(--chip);border-radius:12px;padding:4px;margin:14px 0}.seg button{border:0;background:transparent;font:inherit;font-weight:650;color:var(--muted);padding:9px;border-radius:9px;cursor:pointer}.seg button.on{background:var(--panel);color:var(--ink);box-shadow:0 1px 3px rgba(16,24,40,.14)}
.gbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:inherit;font-weight:650;border-radius:12px;padding:12px;cursor:pointer}.gbtn b{font:700 17px/1 var(--sans);width:24px;height:24px;border-radius:50%;background:var(--chip);display:grid;place-items:center}
.or{display:flex;align-items:center;gap:12px;color:var(--muted);font-size:13px;margin:16px 0 10px}.or::before,.or::after{content:"";flex:1;height:1px;background:var(--line)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fld{display:block;margin:0 0 10px}.fld span{display:block;font-size:13.5px;font-weight:650;margin-bottom:5px}
.fld input,.codef input{width:100%;font:inherit;font-size:16px;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 14px;outline:0}.fld input:focus,.codef input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
.fld select{width:100%;font:inherit;font-size:16px;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 14px;outline:0}
.fld select:focus{border-color:var(--accent)}.fld.bad select{border-color:var(--accent)}
.langpick{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0 0}.langpick>span{font-size:13.5px;font-weight:650;color:var(--muted)}.langpick .seg{margin:0;min-width:220px}
.agrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:14px}.agrid .card{margin:0}
@media (max-width:760px){.agrid{grid-template-columns:1fr}}
.abar{display:grid;grid-template-columns:minmax(90px,38%) 1fr 34px;gap:10px;align-items:center;padding:5px 0;font-size:14px}.abar span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.abar i{height:8px;border-radius:99px;background:var(--chip);overflow:hidden}.abar u{display:block;height:100%;background:var(--accent);border-radius:99px}.abar b{text-align:right;font-variant-numeric:tabular-nums}
.adays{display:grid;grid-template-columns:repeat(14,1fr);gap:5px;height:110px;align-items:end}.adays div{display:flex;flex-direction:column;justify-content:flex-end;height:100%;gap:4px}.adays i{display:block;background:var(--accent);border-radius:4px 4px 0 0;min-height:2px}.adays span{font-size:11px;color:var(--muted);text-align:center}
.ahead{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.genf{display:grid;grid-template-columns:1fr 84px auto;gap:8px;margin-bottom:6px}.genf input,.aq{font:inherit;font-size:15px;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:9px 12px;outline:0;min-width:0}.aq{min-width:220px}.genf input:focus,.aq:focus{border-color:var(--accent)}
.aerr{display:block;font-style:normal;font-size:13px;color:var(--accent)}
.fresh{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:var(--chip);border-radius:12px;padding:10px 12px;margin:8px 0 12px}.fresh b{width:100%;font-size:13.5px}
.atw{overflow-x:auto;margin:10px -4px 0}.atab{width:100%;border-collapse:collapse;font-size:14px;white-space:nowrap}.atab th{text-align:left;font-size:12.5px;color:var(--muted);font-weight:650;padding:7px 10px;border-bottom:1px solid var(--line)}.atab td{padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:middle}.atab tr.off td{color:var(--muted)}.atab tr.off code{text-decoration:line-through}
.atab code,.fresh code{font:600 13.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em}.atab .act{text-align:right}.b.sm{padding:6px 10px;font-size:13px;margin-left:6px}
.tagf,.tagu,.tagx{display:inline-block;font-size:12px;font-weight:650;border-radius:99px;padding:3px 9px;background:var(--chip)}.tagu{background:color-mix(in srgb,#2b8a5a 16%,transparent);color:#1f7a4c}.tagx{color:var(--muted)}
.acopy{width:100%;height:120px;margin-top:10px;font:12.5px ui-monospace,monospace}
.fld em,#e_code2{display:block;font-style:normal;font-size:13px;color:var(--accent);min-height:0;margin-top:4px}.fld.bad input{border-color:var(--accent)}
.sub{width:100%;border:0;border-radius:12px;padding:14px;margin-top:6px;font:inherit;font-weight:650;font-size:16px;background:var(--accent);color:#fff;cursor:pointer}.sub:disabled{opacity:.6}
.acct{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:16px}.acct>div:first-child{flex:1;min-width:230px}.acct b{display:block;font-size:16px}.acct .btns{margin:0}
.acct a.primary,.acct button.primary{background:var(--accent);color:#fff;border-color:var(--accent);text-decoration:none}
.codef{display:flex;gap:8px;margin-top:10px;max-width:340px}
/* долна лента */
#tabbar{display:none}
@media (max-width:900px){:root{--tabH:calc(60px + env(safe-area-inset-bottom))}
 #tabbar{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:50;height:var(--tabH);padding:4px 6px env(safe-area-inset-bottom);background:color-mix(in srgb,var(--panel) 90%,transparent);backdrop-filter:saturate(1.6) blur(16px);-webkit-backdrop-filter:saturate(1.6) blur(16px);box-shadow:0 -1px 0 var(--line)}
 #tabbar a,#tabbar button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:0;background:transparent;color:var(--muted);font:inherit;font-size:11.5px;font-weight:600;text-decoration:none;border-radius:12px;cursor:pointer;padding:0}
 #tabbar .on{color:var(--accent)}
 .quick{display:none}#menuBtn{display:none}.brand{margin-left:8px}
 .crumb{display:flex!important;border-left:0;padding-left:0}.crumb .s{display:none}
 main{padding:14px 14px 28px}
 .hero2{grid-template-columns:1fr;padding:18px 16px 16px;border-radius:18px;min-height:0}.hero2 h1{margin-top:70px}
 .kpis{gap:8px}.kpi{padding:10px 10px}.kpi b{font-size:26px}
 .secgrid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
 .pager{grid-template-columns:1fr}.pager a.nx{grid-column:1;text-align:left}
 .subnav{top:calc(var(--barH) + env(safe-area-inset-top))}
}
@media (max-width:560px){.plans{grid-template-columns:1fr}}
@media (max-width:900px) and (min-width:641px){.crumb .s{display:block}}
`;
const st=document.createElement("style");st.id="shellcss";st.textContent=css;document.head.appendChild(st);
{let m=document.querySelector('meta[name=viewport]');if(m)m.setAttribute("content","width=device-width, initial-scale=1, viewport-fit=cover");const t=document.createElement("meta");t.name="theme-color";t.content=matchMedia("(prefers-color-scheme:dark)").matches?"#181d25":"#ffffff";document.head.appendChild(t)}
// ---------- данни за напредъка ----------
const seen=id=>!!store.get("seen_"+id,0);
const status=id=>{const [a,t]=topicProg(id);return t&&a>=t?"done":(a>0||seen(id))?"part":"new"};
const secProg=sec=>{const R=sec.items.filter(i=>i.ready);let a=0,t=0,op=0;R.forEach(i=>{const p=topicProg(i.id);a+=p[0];t+=p[1];if(status(i.id)!=="new")op++});return {n:R.length,op,a,t,f:t?a/t:0}};
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
function touchDay(){const L=store.get("days",[]),d=today();if(L[L.length-1]!==d){L.push(d);store.set("days",L.slice(-400))}}
function streak(){const L=new Set(store.get("days",[]));let n=0;const d=new Date();for(;;){const k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(!L.has(k))break;n++;d.setDate(d.getDate()-1)}return n}
// ---------- меню ----------
const NAVOPEN=new Set();
{const sw=document.querySelector(".navhead");if(sw&&!sw.querySelector(".sw")){const inp=sw.querySelector("input"),w=document.createElement("div");w.className="sw";inp.parentNode.insertBefore(w,inp);w.appendChild(inp);w.insertAdjacentHTML("afterbegin",ic("search",17));sw.querySelector("h2").textContent="Теми"}}
window.buildNav=function(cur){const q=($("#navq").value||"").trim().toLowerCase();const TT=window.T||(x=>x);let h="",any=false;const curSec=SYLLABUS.find(s=>s.items.some(i=>i.id===cur));if(curSec&&window.__navCur!==cur){NAVOPEN.add(curSec.id);window.__navCur=cur}if(!NAVOPEN.size&&!cur)NAVOPEN.add("I");
  SYLLABUS.forEach(sec=>{const hit=(sec.name+" "+TT(sec.name)).toLowerCase().includes(q),items=sec.items.filter(it=>!q||hit||(it.t+" "+TT(it.t)).toLowerCase().includes(q));if(!items.length)return;any=true;const p=secProg(sec),open=q?true:NAVOPEN.has(sec.id);
    h+=`<div class="ns${open?" open":""}" style="--sec:${SEC_COL[sec.id]||"var(--accent)"}"><button class="nsh" data-sec="${sec.id}" aria-expanded="${open}"><span class="n">${sec.id}</span><span class="h">${sec.name}</span><span class="c">${p.op}/${p.n}</span>${ic("chev",16)}</button><div class="nsl">`;
    items.forEach(it=>{if(!it.ready){h+=`<div class="soon"><span>${it.t}</span><span class="p">предстои</span></div>`;return}const [a,t]=topicProg(it.id),on=cur===it.id;h+=`<a href="#${it.id}" class="${on?"active":""}"${on?' aria-current="page"':""}><i class="st ${status(it.id)}"></i><span>${it.t}</span><span class="p">${isFree(it.id)?(a?a+"/"+t:""):ic("lock",14)}</span></a>`});h+=`</div></div>`});
  $("#navlist").innerHTML=any?h:`<div class="none">Няма тема, която съдържа „${escH(q)}“.</div>`;
  const s=expStats();$("#navfoot").innerHTML=`<div style="display:flex;justify-content:space-between"><span>Решени въпроси</span><b style="color:var(--ink)">${s.ans} / ${s.tot}</b></div><div class="bar2"><div style="width:${s.tot?s.ans/s.tot*100:0}%"></div></div><a class="pm" href="#me">${ic("star",20)}<span>Профил и пълен достъп<small>напредък, покупка, код</small></span></a>`;const ac=$("#navlist a.active");if(ac&&window.__navScr!==cur){window.__navScr=cur;ac.scrollIntoView({block:"center"})}};
$("#navlist").addEventListener("click",e=>{const b=e.target.closest(".nsh");if(!b)return;const k=b.dataset.sec;NAVOPEN.has(k)?NAVOPEN.delete(k):NAVOPEN.add(k);b.parentNode.classList.toggle("open");b.setAttribute("aria-expanded",NAVOPEN.has(k))});
// ---------- горна и долна лента ----------
{const qn=document.querySelector(".quick");if(qn&&!qn.querySelector(".prem"))qn.insertAdjacentHTML("beforeend",`<a href="#me" data-v="me" class="prem">${ic("star",17)}Профил</a>`)}
{const lb=document.createElement("button");lb.id="langBtn";lb.type="button";const en=window.PHYS_LANG==="en";lb.textContent=en?"BG":"EN";lb.setAttribute("aria-label",en?"Български":"English");lb.onclick=()=>window.setLang&&setLang(en?"bg":"en");document.querySelector("header.bar").appendChild(lb)}
const tb=document.createElement("nav");tb.id="tabbar";tb.setAttribute("aria-label","Основна навигация");tb.innerHTML=`<a href="#home" data-v="home">${ic("home")}Начало</a><button type="button" data-v="nav">${ic("list")}Теми</button><a href="#test" data-v="test">${ic("test")}Тест</a><a href="#glossary" data-v="glossary">${ic("book")}Речник</a><a href="#me" data-v="me">${ic("user")}Профил</a>`;document.body.appendChild(tb);
tb.querySelector("button").onclick=()=>setNav(!navIsOpen());
// ---------- начален екран ----------
VIEWS.home=function(main){const s=expStats(),last=store.get("lastTopic",null),it=(last&&READY.find(r=>r.id===last))||READY[0],[a,t]=topicProg(it.id);
  document.body.classList.add("lp");
  const EN=window.PHYS_LANG==="en",LL=(b,e)=>EN?e:b,st=buyStats(),full=!PREMIUM.lock||PREMIUM.unlocked,price=typeof PRICE==="function"?PRICE():"24 €",mail=(window.PHYS_CFG||{}).email||"tariqaljazmiuni@gmail.com";
  const P={book:'<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
   checks:'<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
   box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
   search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
   sliders:'<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
   star:'<path d="M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.91l5.16-.75a2.12 2.12 0 0 0 1.6-1.16z"/>',
   check:'<path d="M20 6 9 17l-5-5"/>',
   phone:'<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
   arrow:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
   chev:'<path d="m6 9 6 6 6-6"/>'};
  const I=(n,z=22)=>`<svg class="lc" width="${z}" height="${z}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const first=sec=>sec.items.find(x=>x.ready);
  const feat=(k,ic,h,p)=>`<li style="--k:${k}"><i>${I(ic)}</i><h3>${h}</h3><p>${p}</p></li>`;
  const gal=["heart3d","lungmech","hbcurve","xb","gfr"].map(id=>READY.find(r=>r.id===id)).filter(Boolean);
  const lang=EN?"en":"bg";
  main.innerHTML=`
  <section class="lp-hero">
   <img class="lp-hero-img" src="img/hero-1600.webp" srcset="img/hero-900.webp 900w, img/hero-1600.webp 1600w" sizes="100vw" alt="" fetchpriority="high">
   <div class="lp-w lp-hero-in">
    <p class="lp-kick">${LL("Конспект по физиология за студенти по медицина","Physiology syllabus for medical students")}</p>
    <h1>${LL("Разбери физиологията, вместо да я зубриш","Understand physiology instead of memorizing it")}</h1>
    <p class="lp-lead">${LL(`Теория по Guyton, интерактивни симулации, 3D модели и ${st.q} въпроса с обяснения. По целия конспект, на телефон, таблет и компютър.`,`Theory based on Guyton, interactive simulations, 3D models and ${st.q} questions with explanations. The whole syllabus, on phone, tablet and computer.`)}</p>
    <div class="lp-cta"><a class="b primary" href="#${it.id}">${last?LL("Продължи ученето","Continue learning"):LL("Започни безплатно","Start for free")}</a><button type="button" class="lp-ghost" data-go="lp-price">${LL("Виж цената","See pricing")}</button></div>
    <p class="lp-note">${I("check",16)}${LL("Раздел I е безплатен. Не ти трябва карта.","Section I is free. No card needed.")}</p>
   </div>
  </section>
  <div class="lp-w"><div class="lp-stats">
   <div><b>${st.topics}</b><span>${LL("теми с теория","topics")}</span></div>
   <div><b>${st.q}</b><span>${LL("въпроса с обяснения","questions")}</span></div>
   <div><b>${st.secs}</b><span>${LL("раздела от конспекта","sections")}</span></div>
   <div><b>${st.gl}</b><span>${LL("термина в речника","glossary terms")}</span></div>
  </div>
  ${last?`<a class="cont2" href="#${it.id}" style="--sec:${SEC_COL[it.sec.id]}"><span class="cn">${it.sec.id}</span><span class="ct"><small>${T("Продължи оттам, докъдето стигна")}</small><b>${it.t}</b><em>${a} от ${t} въпроса решени</em></span><span class="cg">Продължи</span></a>`:""}
  </div>

  <div class="lp-tick" aria-hidden="true"><div class="lp-tick-in">${(()=>{const x=READY.map(r=>`<span>${r.t.replace(/\s*\(.*?\)\s*$/,"")}</span>`).join("");return x+x})()}</div></div>
  <section class="lp-sect"><div class="lp-w">
   <header class="lp-h"><h2>${LL("Всичко за изпита на едно място","Everything for the exam in one place")}</h2><p>${LL("Всяка тема е урок, симулация и тест. Учиш, пробваш и се проверяваш, без да сменяш учебник и сборник.","Each topic is a lesson, a simulation and a quiz. Learn, try and check yourself without switching between books.")}</p></header>
   <ul class="lp-feat">
    ${feat("#0D9488","book",LL("Теория по учебника","Textbook theory"),LL("Кратки уроци по Guyton с фигури, формули и клинични бележки.","Short lessons based on Guyton with figures, formulas and clinical notes."))}
    ${feat("#0284C7","sliders",LL("Интерактивни симулации","Interactive simulations"),LL("Променяш параметрите и виждаш как реагира организмът.","Change the parameters and see how the body responds."))}
    ${feat("#DC2626","box",LL("3D модели","3D models"),LL("Сърце, бели дробове и неврон, които въртиш и разглеждаш отблизо.","A heart, lungs and a neuron you can rotate and inspect up close."))}
    ${feat("#7C3AED","checks",LL("Тестове с обяснения","Quizzes with explanations"),LL(`${st.q} въпроса. След всеки отговор виждаш защо е верен или грешен.`,`${st.q} questions. After each answer you see why it is right or wrong.`))}
    ${feat("#D97706","star",LL("High-Yield обобщения","High-yield summaries"),LL("Най-важното за изпита, събрано в края на всяка тема.","The most important points for the exam at the end of each topic."))}
    ${feat("#DB2777","search",LL(`Речник с ${st.gl} термина`,`Glossary of ${st.gl} terms`),LL("Докосваш подчертан термин в текста и виждаш обяснението му.","Tap an underlined term in the text to see what it means."))}
   </ul>
  </div></section>

  ${gal.length?`<section class="lp-sect lp-dark"><div class="lp-w">
   <header class="lp-h"><h2>${LL("Виж как изглежда отвътре","See what's inside")}</h2><p>${LL("Част от симулациите в разделите за сърце, дишане, кръв и мускули.","A few of the simulations from the heart, breathing, blood and muscle sections.")}</p></header>
   <div class="lp-gal">${gal.map((r,i)=>`<a href="#${r.id}" class="${i===0?"big":""}" style="--sec:${SEC_COL[r.sec.id]}"><img src="img/${lang}_${r.id}.webp" alt="${String(r.t).replace(/"/g,"&quot;")}" loading="lazy"><span><small>${r.sec.name}</small>${r.t}</span></a>`).join("")}</div>
  </div></section>`:""}

  <section class="lp-sect"><div class="lp-w">
   <header class="lp-h"><h2>${LL("Как се учи една тема","How each topic works")}</h2></header>
   <ol class="steps">
    <li style="--k:#0D9488"><i>${I("book")}</i><b>${LL("Прочети","Read")}</b><p>${LL("Кратък текст по учебника с фигури. Непознатите думи са в речника.","A short text with figures. Unknown words are in the glossary.")}</p></li>
    <li style="--k:#0284C7"><i>${I("sliders")}</i><b>${LL("Пробвай","Try")}</b><p>${LL("Отвори симулацията и промени параметрите, за да видиш ефекта.","Open the simulation and change the parameters to see the effect.")}</p></li>
    <li style="--k:#E11D48"><i>${I("checks")}</i><b>${LL("Провери се","Check")}</b><p>${LL("Реши теста и прочети обяснението след всеки отговор.","Take the quiz and read the explanation after every answer.")}</p></li>
   </ol>
  </div></section>

  <section class="lp-sect lp-tint"><div class="lp-w">
   <header class="lp-h"><h2>${LL("12 раздела от конспекта","12 syllabus sections")}</h2><p>${LL("Раздел I е безплатен. Останалите се отключват с пълния достъп.","Section I is free. The rest unlock with full access.")}</p></header>
   <div class="lp-secs">${SYLLABUS.map(sec=>{const p=secProg(sec),f=first(sec),fr=f&&isFree(f.id);return `<a class="sec lp-sec" href="#${f?f.id:"home"}" style="--sec:${SEC_COL[sec.id]||"var(--pri)"}"><span class="n">${sec.id}</span><span class="lp-sec-t"><b>${sec.name}</b><small>${p.n} ${p.n===1?LL("тема","topic"):LL("теми","topics")}, ${p.t} ${LL("въпроса","questions")}</small></span>${fr?`<em class="fr">${LL("безплатно","free")}</em>`:`<em>${ic("lock",14)}</em>`}</a>`}).join("")}</div>
  </div></section>

  <section class="lp-sect" id="lp-price"><div class="lp-w">
   <header class="lp-h"><h2>${LL("Цена","Pricing")}</h2><p>${LL("Едно плащане. Без абонамент и без скрити такси.","One payment. No subscription, no hidden fees.")}</p></header>
   <div class="lp-price">
    <div class="lp-plan"><h3>${LL("Безплатно","Free")}</h3><p class="lp-amt"><b>0 €</b></p><ul>
     <li>${I("check",18)}${LL(`Раздел I: ${READY.filter(r=>PREMIUM.free.includes(r.id)).length} теми`,`Section I: ${READY.filter(r=>PREMIUM.free.includes(r.id)).length} topics`)}</li>
     <li>${I("check",18)}${LL("Теория, симулации и тестове в раздела","Theory, simulations and quizzes in it")}</li>
     <li>${I("check",18)}${LL("Целият речник","The full glossary")}</li></ul>
     <a class="b" href="#${READY[0].id}">${LL("Започни","Start")}</a></div>
    <div class="lp-plan pro"><span class="lp-tag">${LL("Всичко","Everything")}</span><h3>${LL("Пълен достъп","Full access")}</h3><p class="lp-amt"><b>${price}</b><span>${LL("еднократно","one-time")}</span></p><ul>
     <li>${I("check",18)}${LL(`Всички ${st.secs} раздела и ${st.topics} теми`,`All ${st.secs} sections and ${st.topics} topics`)}</li>
     <li>${I("check",18)}${LL(`${st.q} въпроса с обяснения`,`${st.q} questions with explanations`)}</li>
     <li>${I("check",18)}${LL("Всички 3D модели и симулации","All 3D models and simulations")}</li>
     <li>${I("check",18)}${LL("На телефон, таблет и компютър","On phone, tablet and computer")}</li></ul>
     ${full?`<span class="lp-have">${I("check",18)}${LL("Имаш пълен достъп","You have full access")}</span>`:`<a class="b primary" href="#me">${LL("Отключи всичко","Unlock everything")}</a><small>${LL("Карта, Apple Pay или Google Pay през Stripe","Card, Apple Pay or Google Pay via Stripe")}</small>`}</div>
   </div>
  </div></section>

  <section class="lp-sect" id="lp-faq"><div class="lp-w lp-qa">
   <aside class="lp-qa-side">
    <h2>${LL("Въпроси и отговори","Questions and answers")}</h2>
    <p>${LL("Най-важното за съдържанието, достъпа и плащането. Ако не намираш отговор, пиши ни.","The essentials about content, access and payment. If your question is not here, write to us.")}</p>
    <div class="lp-qa-mail"><b>${LL("Пиши ни","Contact us")}</b><span>${LL("Въпроси, предложения и технически проблеми.","Questions, suggestions and technical issues.")}</span><a href="mailto:${mail}">${mail}</a></div>
   </aside>
   <div class="lp-qa-main">${[
    [LL("Съдържание","Content"),[
     [LL("Какво покрива платформата?","What does the platform cover?"),LL(`Целия конспект по нормална физиология за студенти по медицина: ${st.secs} раздела и ${st.topics} теми, от възбудимите тъкани до централната нервна система. Всяка тема съдържа теория, интерактивна симулация и тест с обяснения.`,`The full normal physiology syllabus for medical students: ${st.secs} sections and ${st.topics} topics, from excitable tissues to the central nervous system. Each topic has theory, an interactive simulation and a quiz with explanations.`)],
     [LL("На какъв източник се основава съдържанието?","What is the content based on?"),LL("Теорията следва Guyton and Hall, Textbook of Medical Physiology. Текстовете са написани наново, на ясен език, и са подредени по университетския конспект. Източниците на 3D моделите и изображенията са посочени в раздел „За приложението“.","The theory follows Guyton and Hall, Textbook of Medical Physiology, rewritten in plain language and ordered by the university syllabus. Sources for 3D models and images are listed under About.")],
     [LL("Достатъчна ли е за подготовка за изпит?","Is it enough to prepare for the exam?"),LL(`Платформата е създадена за подготовка за колоквиуми и изпит: ${st.q} тестови въпроса с обяснения и High-Yield обобщение във всяка тема. Тя допълва лекциите и учебника, но не ги замества.`,`It is built for colloquium and exam preparation: ${st.q} quiz questions with explanations and a high-yield summary in every topic. It complements lectures and the textbook but does not replace them.`)]
    ]],
    [LL("Достъп и плащане","Access and payment"),[
     [LL("Какво мога да използвам безплатно?","What can I use for free?"),LL(`Целия Раздел I: ${READY.filter(r=>PREMIUM.free.includes(r.id)).length} теми с теория, симулации и тестове, както и пълния речник. Не е нужна регистрация.`,`All of Section I: ${READY.filter(r=>PREMIUM.free.includes(r.id)).length} topics with theory, simulations and quizzes, plus the full glossary. No account needed.`)],
     [LL("Как се отключва пълният достъп?","How do I unlock full access?"),LL(`Създаваш безплатен профил и плащаш еднократно ${price} през Stripe с карта, Apple Pay или Google Pay. Достъпът се отключва автоматично веднага след плащането.`,`Create a free account and pay ${price} once via Stripe by card, Apple Pay or Google Pay. Access unlocks automatically right after payment.`)],
     [LL("Абонамент ли е?","Is it a subscription?"),LL("Не. Плащането е еднократно, без автоматично подновяване и без скрити такси.","No. It is a one-time payment with no renewal and no hidden fees.")],
     [LL("Имам код за достъп. Как да го използвам?","I have an access code. How do I use it?"),LL("Отвори „Профил“, избери „Имам код за достъп“ и въведи кода. Темите се отключват веднага.","Open Profile, choose “I have an access code” and enter it. The topics unlock right away.")]
    ]],
    [LL("Устройства и профил","Devices and account"),[
     [LL("На какви устройства работи?","Which devices does it work on?"),LL("В браузъра на телефон, таблет и компютър, без инсталиране. За 3D моделите използвай актуална версия на Safari, Chrome или Edge.","In the browser on phone, tablet and computer, nothing to install. For 3D models use a current version of Safari, Chrome or Edge.")],
     [LL("Пази ли се напредъкът ми?","Is my progress saved?"),LL("Решените въпроси и отворените теми се пазят в браузъра на устройството, на което учиш. Пълният достъп е свързан с профила ти и работи на всяко устройство, на което влезеш.","Answered questions and opened topics are stored in the browser of the device you use. Full access is tied to your account and works on every device you sign in on.")]
    ]]
   ].map(([g,qs])=>`<div class="lp-qa-g"><h3>${g}</h3><div class="lp-faq">${qs.map(([q,a])=>`<details><summary><span>${q}</span><i aria-hidden="true"></i></summary><div class="lp-qa-a"><p>${a}</p></div></details>`).join("")}</div></div>`).join("")}</div>
  </div></section>

  ${full?"":`<div class="lp-w"><section class="hband"><div><h3>${LL("Отключи всички 12 раздела","Unlock all 12 sections")}</h3><p>${LL(`${st.locked} теми и ${st.lq} въпроса с обяснения. Плащаш веднъж, без абонамент.`,`${st.locked} topics and ${st.lq} questions with explanations. One payment, no subscription.`)}</p></div><a class="b primary" href="#me">${LL("Пълен достъп за ","Full access for ")+price}</a></section></div>`}

  <footer class="lp-foot"><div class="lp-w">
   <div class="lp-fb"><b>${LL("Физиология","Physiology")}</b><p>${LL("Интерактивен симулатор по физиология за студенти по медицина.","Interactive physiology simulator for medical students.")}</p></div>
   <nav><h4>${LL("Учене","Learn")}</h4><a href="#${READY[0].id}">${LL("Първа тема","First topic")}</a><a href="#test">${LL("Тест по всички теми","Quiz on all topics")}</a><a href="#glossary">${LL("Речник","Glossary")}</a><a href="#me">${LL("Профил","Profile")}</a></nav>
   <nav><h4>${LL("Информация","Info")}</h4><a href="#about">${LL("За приложението и лицензи","About and licences")}</a><a href="#privacy">${LL("Поверителност","Privacy")}</a><a href="#terms">${LL("Условия","Terms")}</a></nav>
   <nav><h4>${LL("Контакт","Contact")}</h4><a href="mailto:${mail}">${mail}</a></nav>
  </div><p class="lp-copy">© ${new Date().getFullYear()} ${LL("Физиология","Physiology")}</p></footer>`;
  main.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{const t=document.getElementById(b.dataset.go);if(t)t.scrollIntoView({behavior:"smooth",block:"start"})});
  window.onresize=null};
// ---------- профили, вход, кодове за достъп и админ ----------
const hex=b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");
async function sha(t){if(window.crypto&&crypto.subtle)return hex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)));let h=5381;for(const c of t)h=(h*33^c.charCodeAt(0))>>>0;return "x"+h.toString(16)}
const normCode=c=>(c||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
const codeHash=c=>sha("fizio:"+normCode(c));
const E=(f,m)=>({f,m});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const tt=s=>window.T?T(s):s;
const PURP={acad:"Академични проекти",teach:"Обучение на студенти",study:"Собствена подготовка",other:"Друго"};
// връзка с общата база (регистрации и кодове); без нея приложението работи само на устройството
const BK={db:null,user:null,uid:null,admin:false,owner:false};
BK.ready=(async()=>{try{if(window.PHYS_SB){await Promise.race([PHYS_SB.ready,new Promise(r=>setTimeout(r,8000))]);BK.db=PHYS_SB.db;BK.uid=PHYS_SB.uid;BK.admin=BK.owner=!!PHYS_SB.admin;return}let src=window.__PHYS_BACKEND||null;if(!src&&window.claude&&claude.use){const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);src={db,user}}
  if(src){BK.db=src.db||null;BK.user=src.user||null;if(BK.user){BK.uid=await BK.user.id();BK.admin=!!(await BK.user.canEdit());BK.owner=!!(await BK.user.isOwner())}}}catch(e){console.error(e)}})();
const bkReady=()=>Promise.race([BK.ready,wait(9000)]);
async function claimCode(c){await bkReady();
  if(!BK.db)throw E("code","Кодовете се проверяват онлайн, а в момента няма връзка. Опитай пак по-късно или остави полето празно.");
  const h=await codeHash(c);let s,q;
  try{s=await BK.db.doc("codes/"+h).get();q=s.exists?await BK.db.collection("claims").where("hash","==",h).get():null}catch(e){throw E("code","Кодът не можа да се провери. Опитай пак.")}
  if(!s.exists)throw E("code","Този код не е валиден. Провери го или остави полето празно.");
  if(q.docs.some(d=>d.id!==BK.uid))throw E("code","Този код вече е използван от друг профил.");
  if(!BK.uid)throw E("code","Кодът не може да се активира от този профил.");
  try{await BK.db.doc("claims/"+BK.uid).set({hash:h,at:Date.now()})}catch(e){throw E("code","Кодът не можа да се активира. Опитай пак.")}
  return h}
function devKind(){const u=navigator.userAgent||"",tp=navigator.maxTouchPoints||0;if(/iPad/.test(u)||(/Macintosh/.test(u)&&tp>1))return "iPad";if(/iPhone|iPod/.test(u))return "iPhone";if(/Android/.test(u))return /Mobile/.test(u)?"Android телефон":"Android таблет";if(/Windows/.test(u))return "Windows";if(/Macintosh/.test(u))return "Mac";if(/Linux/.test(u))return "Linux";return "друго"}
function progNow(){const s=expStats(),op=READY.filter(r=>status(r.id)!=="new"),dn=READY.filter(r=>status(r.id)==="done");return {opened:op.length,ans:s.ans,tot:s.tot,tp:op.map(r=>r.id).join(","),dn:dn.map(r=>r.id).join(","),dev:devKind(),days:(store.get("days",[])||[]).length||0}}
async function pushReg(u){await bkReady();if(window.PHYS_SB){if(!u||!PHYS_SB.uid)return false;const p=progNow();const ok=await PHYS_SB.push({opened:p.opened,ans:p.ans,tot:p.tot,tp:p.tp,dn:p.dn,dev:p.dev,days:p.days,lang:window.PHYS_LANG||"bg"});if(ok)store.set("reg_sig",regSig(u));return ok}if(!BK.db||!BK.uid||!u)return false;const p=progNow();
  try{await BK.db.doc("regs/"+BK.uid).set({first:u.first,last:u.last,email:u.email,inst:u.inst||"",purpose:u.purpose||"",other:u.other||"",lang:u.lang||"bg",at:u.at,codeHash:u.codeHash||"",seen:Date.now(),opened:p.opened,ans:p.ans,tot:p.tot,tp:p.tp,dn:p.dn,dev:p.dev,days:p.days});
    store.set("reg_sig",regSig(u));return true}catch(e){return false}}
const regSig=u=>{const p=progNow();return [u.email,u.codeHash||"",p.opened,p.ans,p.dn,new Date().toISOString().slice(0,10)].join("|")};
const AUTH=window.PHYS_AUTH={users:()=>store.get("auth_users",{}),
 me(){const e=store.get("auth_session",null);return e?(this.users()[e]||null):null},
 async register(d){const U=this.users(),email=d.email.trim().toLowerCase();if(U[email])throw E("email","Вече има профил с този имейл. Влез с него.");let code="",h="";if(normCode(d.code)){h=await claimCode(d.code);code=normCode(d.code)}
  const salt=Math.random().toString(36).slice(2)+Date.now().toString(36);U[email]={first:d.first.trim(),last:d.last.trim(),email,inst:d.inst.trim(),purpose:d.purpose,other:d.purpose==="other"?(d.other||"").trim():"",lang:window.PHYS_LANG||"bg",salt,hash:await sha(salt+d.pass),code,codeHash:h,at:Date.now()};store.set("auth_users",U);store.set("auth_session",email);sync();pushReg(U[email])},
 async login(email,pass){const u=this.users()[email.trim().toLowerCase()];if(!u||u.hash!==await sha(u.salt+pass))throw E("pass","Имейлът или паролата не са верни.");store.set("auth_session",u.email);sync();pushReg(u)},
 logout(){store.set("auth_session",null);sync()},
 async addCode(c){const u=this.me();if(!u)throw E("code","Първо влез в профила си.");const h=await claimCode(c);const U=this.users();U[u.email].code=normCode(c);U[u.email].codeHash=h;store.set("auth_users",U);sync();pushReg(U[u.email])}};
if(window.PHYS_SB){const SB=PHYS_SB;const msg=e=>{const m=(e&&e.message)||"";if(/invalid login/i.test(m))return E("pass","Имейлът или паролата не са верни.");if(/already (been )?registered|already exists/i.test(m))return E("email","Вече има профил с този имейл. Влез с него.");if(/password should|weak password/i.test(m))return E("pass","Паролата трябва да е поне 8 знака.");if(/not confirmed/i.test(m))return E("email","Първо потвърди имейла си — изпратихме ти писмо с връзка.");if(/rate limit/i.test(m))return E("email","Твърде много опити. Изчакай малко и опитай пак.");return E("pass","Нещо се обърка. Опитай пак.")};
 const after2=()=>{BK.uid=SB.uid;BK.admin=BK.owner=!!SB.admin;sync()};
 Object.assign(AUTH,{users:()=>({}),me:()=>SB.me(),
  async register(d){if(normCode(d.code)){let c;try{c=await SB.check(d.code)}catch(e){throw E("code","Кодът не можа да се провери. Опитай пак или остави полето празно.")}if(c==="used")throw E("code","Този код вече е използван от друг профил.");if(c!=="ok")throw E("code","Този код не е валиден. Провери го или остави полето празно.")}let r;try{r=await SB.signUp(Object.assign({},d,{email:d.email.trim().toLowerCase(),first:d.first.trim(),last:d.last.trim(),inst:d.inst.trim(),other:d.purpose==="other"?(d.other||"").trim():"",code:normCode(d.code)||null}))}catch(e){throw msg(e)}
   if(r.confirm)throw E("email","Изпратихме ти имейл за потвърждение. Отвори връзката в него — после ще влезеш автоматично.");after2();pushReg(SB.me())},
  async login(email,pass){try{await SB.signIn(email.trim().toLowerCase(),pass)}catch(e){throw msg(e)}after2();pushReg(SB.me())},
  logout(){SB.signOut().then(()=>{after2();try{route()}catch(e){}})},
  async addCode(c){if(!SB.uid)throw E("code","Първо влез в профила си.");let r;try{r=await SB.claim(c)}catch(e){throw E("code","Кодът не можа да се провери. Опитай пак.")}
   if(r.res==="invalid")throw E("code","Този код не е валиден. Провери го.");if(r.res==="used")throw E("code","Този код вече е използван от друг профил.");if(r.res!=="ok")throw E("code","Първо влез в профила си.");
   await SB.refresh();after2();pushReg(SB.me())}})}
function sync(){const u=AUTH.me();PREMIUM.unlocked=!!((u&&(u.codeHash||u.full))||BK.admin)}
PREMIUM.lock=true;sync();
// след зареждане: спрян код отнема достъпа; напредъкът се изпраща най-много веднъж на промяна
BK.ready.then(()=>{if(!BK.admin)return;const q=document.querySelector(".quick");if(q&&!q.querySelector('[data-v="admin"]')){const a=document.createElement("a");a.href="#admin";a.dataset.v="admin";a.textContent="Админ";a.className="admlink";q.appendChild(a)}const nf=document.getElementById("nav");if(nf&&!nf.querySelector(".admnav")){const a=document.createElement("a");a.href="#admin";a.className="admnav";a.textContent="Админ страница";const f=document.getElementById("navfoot");if(f)f.parentNode.insertBefore(a,f)}});
BK.ready.then(async()=>{if(window.PHYS_SB){sync();const v=AUTH.me();if(v&&store.get("reg_sig","")!==regSig(v))pushReg(v);try{route();after()}catch(e){}return}const u=AUTH.me();let re=BK.admin&&typeof curView!=="undefined"&&curView==="me";if(BK.admin&&!PREMIUM.unlocked){sync();re=true}
  if(u&&BK.db){if(u.codeHash){try{const s=await BK.db.doc("codes/"+u.codeHash).get();if(!s.exists&&!(s.metadata&&s.metadata.fromCache)){const U=AUTH.users();U[u.email].code="";U[u.email].codeHash="";store.set("auth_users",U);sync();re=true}}catch(e){}}
    const v=AUTH.me();if(store.get("reg_sig","")!==regSig(v))pushReg(v)}
  if(re)try{route();after()}catch(e){}});
let authMode="up";
const fld=(id,label,type,ac,extra="")=>`<label class="fld" for="f_${id}"><span>${label}</span><input id="f_${id}" name="${id}" type="${type}" autocomplete="${ac}" ${extra}><em id="e_${id}" role="alert"></em></label>`;
VIEWS.auth=function(main){const up=authMode==="up",en=window.PHYS_LANG==="en";
  main.innerHTML=`<div class="auth"><h2>${up?"Създай профил":"Вход"}</h2><p class="lead">${up?"С профил напредъкът ти е на твое име, а с код отключваш всички теми безплатно.":"Влез, за да продължиш оттам, докъдето стигна."}</p>
   <div class="langpick"><span>Language · Език</span><div class="seg lang"><button type="button" data-l="en" class="${en?"on":""}">English</button><button type="button" data-l="bg" class="${en?"":"on"}">Български</button></div></div>
   <div class="seg" role="tablist"><button type="button" data-m="up" class="${up?"on":""}">Регистрация</button><button type="button" data-m="in" class="${up?"":"on"}">Вход</button></div>
   <button type="button" class="gbtn" id="gbtn"><b>G</b>Продължи с Google</button><p class="small" id="gmsg" hidden>Входът с Google ще работи, след като приложението се свърже със сървър за профили. Дотогава използвай имейл и парола.</p>
   <div class="or"><span>или с имейл</span></div>
   <form id="authf" novalidate>${up?`<div class="two">${fld("first","Име","text","given-name")}${fld("last","Фамилия","text","family-name")}</div>`:""}
    ${fld("email","Имейл","email","email",'inputmode="email" autocapitalize="off"')}${fld("pass","Парола",'password',up?"new-password":"current-password")}
    ${up?fld("inst","Институция","text","organization",'placeholder="университет, училище, организация"')+
     `<label class="fld" for="f_purpose"><span>За какво ще ползваш приложението</span><select id="f_purpose" name="purpose"><option value="">Избери</option>${Object.keys(PURP).map(k=>`<option value="${k}">${PURP[k]}</option>`).join("")}</select><em id="e_purpose" role="alert"></em></label>
     <div id="otherWrap" hidden>${fld("other","Опиши накратко","text","off")}</div>`+
     fld("code","Код за безплатен достъп","text","off",'autocapitalize="characters" placeholder="ако имаш такъв"')+`<p class="small" style="margin:-4px 0 4px">Без код е отворен първият раздел.</p>`:""}
    <button class="sub" type="submit">${up?"Създай профил":"Влез"}</button>
    ${up?`<p class="small" style="margin-top:10px">Името, имейлът, институцията и целта се изпращат до администратора на приложението. Паролата остава само на това устройство. С регистрацията приемаш <a href="#terms">условията</a> и <a href="#privacy">политиката за поверителност</a>.</p>`:""}</form>
   <p class="small" style="text-align:center;margin-top:14px"><a href="#home">Разгледай без профил</a></p></div>`;
  main.querySelectorAll(".seg:not(.lang) button").forEach(b=>b.onclick=()=>{authMode=b.dataset.m;VIEWS.auth(main)});
  main.querySelectorAll(".seg.lang button").forEach(b=>b.onclick=()=>{if(b.dataset.l!==(en?"en":"bg")&&window.setLang)setLang(b.dataset.l)});
  $("#gbtn").onclick=async()=>{if(window.PHYS_SB){try{await PHYS_SB.google()}catch(e){const m=$("#gmsg");m.textContent=T("Входът с Google не е включен още. Влез с имейл и парола.");m.hidden=false}return}$("#gmsg").hidden=false};
  if(window.PHYS_SB&&PHYS_SB.oauthErr){const m=$("#gmsg");if(m){m.textContent=T("Входът с Google не успя: ")+PHYS_SB.oauthErr;m.hidden=false}}
  const ps=$("#f_purpose");if(ps)ps.onchange=()=>{$("#otherWrap").hidden=ps.value!=="other"};
  const f=$("#authf"),err=(k,m)=>{const e=$("#e_"+k);if(e){e.textContent=m||"";e.parentNode.classList.toggle("bad",!!m)}};
  f.onsubmit=async ev=>{ev.preventDefault();const d=Object.fromEntries(new FormData(f));["first","last","email","pass","inst","purpose","other","code"].forEach(k=>err(k));let bad=false;const no=(k,m)=>{err(k,m);if(!bad){bad=true;$("#f_"+k).focus()}};
   if(up&&!d.first.trim())no("first","Въведи името си.");if(up&&!d.last.trim())no("last","Въведи фамилията си.");
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim()))no("email","Въведи валиден имейл, например ime@primer.bg.");
   if(up?d.pass.length<8:!d.pass)no("pass",up?"Паролата трябва да е поне 8 знака.":"Въведи паролата си.");
   if(up&&!d.inst.trim())no("inst","Въведи институцията си.");if(up&&!d.purpose)no("purpose","Избери за какво ще ползваш приложението.");if(up&&d.purpose==="other"&&!(d.other||"").trim())no("other","Опиши накратко за какво.");
   if(bad)return;
   const sb=f.querySelector(".sub");sb.disabled=true;try{up?await AUTH.register(d):await AUTH.login(d.email,d.pass);location.hash="home"}catch(x){sb.disabled=false;if(x&&x.f)no(x.f,x.m);else{console.error(x);no("pass","Нещо се обърка. Опитай пак.")}}}};
function meHead(){const u=AUTH.me(),adm=BK.admin?`<a class="b" href="#admin">Админ страница</a>`:"";if(!u)return `<h2>Профил</h2><p class="lead">Напредъкът ти се пази на това устройство.</p><div class="card acct"><div><b>Нямаш профил на това устройство</b><span class="small">Регистрирай се с код, за да отключиш всички теми безплатно.</span></div><div class="btns"><a class="b primary" href="#auth" data-m="up">Създай профил</a><a class="b" href="#auth" data-m="in">Вход</a>${adm}</div></div>`;
  return `<h2>${escH(u.first+" "+u.last)}</h2><p class="lead">${escH(u.email)}</p><div class="card acct"><div><b>${u.codeHash?"Безплатният достъп е активен":"Имаш ли код за безплатен достъп?"}</b><span class="small">${u.codeHash?"Всички теми са отключени с твоя код.":"С него отключваш всички теми. Без код е отворен първият раздел."}</span>${u.codeHash?"":`<form id="codef" class="codef"><input name="code" aria-label="Код за безплатен достъп" autocapitalize="characters" autocomplete="off" placeholder="Код"><button class="b primary">Активирай</button></form><em id="e_code2" role="alert"></em>`}</div><div class="btns">${adm}<button class="b" id="meOut">Изход</button></div></div>`}
function meWire(){document.querySelectorAll('.acct a[data-m]').forEach(a=>a.addEventListener("click",()=>{authMode=a.dataset.m}));const o=$("#meOut");if(o)o.onclick=()=>{AUTH.logout();route()};const c=$("#codef");if(c)c.onsubmit=async ev=>{ev.preventDefault();const b=c.querySelector("button");b.disabled=true;try{await AUTH.addCode(new FormData(c).get("code"));route()}catch(x){b.disabled=false;$("#e_code2").textContent=(x&&x.m)||"Нещо се обърка. Опитай пак."}}}
// ---------- админ: регистрации, статистика и генератор на кодове ----------
const ALPHA="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode(){const a=new Uint8Array(12);crypto.getRandomValues(a);const s=Array.from(a,x=>ALPHA[x%32]).join("");return s.slice(0,4)+"-"+s.slice(4,8)+"-"+s.slice(8)}
const fdate=ts=>ts?new Date(ts).toLocaleDateString(window.PHYS_LANG==="en"?"en-GB":"bg-BG",{day:"2-digit",month:"2-digit",year:"numeric"}):"—";
VIEWS.admin=async function(main){
  main.innerHTML=`<h2>Админ</h2><p class="lead">Регистрации, активност и кодове за безплатен достъп.</p><div id="admBody"><p class="small">Зареждане…</p></div>`;
  await bkReady();const box=$("#admBody");if(!box)return;
  const note=(b,s)=>{box.innerHTML=`<div class="card"><b>${b}</b><p class="small" style="margin:6px 0 0">${s}</p></div>`};
  if(!BK.db)return note("Няма връзка с базата данни","Админ страницата чете регистрациите и кодовете от общата база. Отвори приложението онлайн и опитай пак.");
  if(!BK.admin)return note("Само за администратора","Тази страница се вижда само от собственика на приложението.");
  let regs=[],codes=[],claims=[],sales=[],q="",fresh=[];
  const all=p=>BK.db.collection(p).limit(1000).get().then(s=>s.docs.map(d=>Object.assign({id:d.id},d.data())));
  async function load(){try{[regs,codes,claims,sales]=await Promise.race([Promise.all([all("regs"),all("admcodes"),all("claims"),window.PHYS_SB?all("purchases"):Promise.resolve([])]),wait(12000).then(()=>{throw 0})])}catch(e){note("Данните не можаха да се заредят","Провери връзката и отвори страницата пак.");return false}
    regs.sort((a,b)=>(b.at||0)-(a.at||0));codes.sort((a,b)=>(b.at||0)-(a.at||0));return true}
  const purp=r=>r.purpose==="other"&&r.other?r.other:(PURP[r.purpose]||"—");
  function bars(title,M){const L=Object.entries(M).sort((a,b)=>b[1]-a[1]).slice(0,7),mx=Math.max(1,...L.map(x=>x[1]));
    return `<div class="card"><h3 style="margin-top:0">${title}</h3>${L.length?L.map(([k,n])=>`<div class="abar"><span>${k}</span><i><u style="width:${n/mx*100}%"></u></i><b>${n}</b></div>`).join(""):`<p class="small">Още няма данни.</p>`}</div>`}
  const tname=id=>{const it=READY.find(z=>z.id===id);return it?(it.title||it.name||it.t||id):id};
  const count=(f)=>{const M={};regs.forEach(r=>{const k=f(r);M[k]=(M[k]||0)+1});return M};
  function draw(){const now=Date.now(),D=864e5,byHash={};claims.forEach(c=>{byHash[c.hash]=c});const byId={};regs.forEach(r=>{byId[r.id]=r});
    const live=codes.filter(c=>!c.revoked),used=live.filter(c=>byHash[c.id]),lab={};codes.forEach(c=>{lab[c.id]=c.label||c.code});
    const full=regs.filter(r=>r.paid||(r.codeHash&&live.some(c=>c.id===r.codeHash))).length,avg=regs.length?Math.round(regs.reduce((s,r)=>s+(r.ans||0),0)/regs.length):0;
    const days=[];for(let i=13;i>=0;i--){const d0=new Date(now-i*D);d0.setHours(0,0,0,0);days.push({t:+d0,n:regs.filter(r=>r.at>=+d0&&r.at<+d0+D).length})}const dmx=Math.max(1,...days.map(d=>d.n));
    const act=[];for(let i=13;i>=0;i--){const d0=new Date(now-i*D);d0.setHours(0,0,0,0);act.push({t:+d0,n:regs.filter(r=>r.seen>=+d0&&r.seen<+d0+D).length})}const amx=Math.max(1,...act.map(d=>d.n));
    const TC={};regs.forEach(r=>String(r.tp||"").split(",").filter(Boolean).forEach(id=>TC[id]=(TC[id]||0)+1));const topT=Object.entries(TC).sort((a,b)=>b[1]-a[1]).slice(0,10),tmx=Math.max(1,...topT.map(x=>x[1]));
    const secR=SYLLABUS.map(sec=>{const ids=new Set((sec.items||[]).map(x=>x.id));const n=regs.filter(r=>String(r.tp||"").split(",").some(id=>ids.has(id))).length;return [sec.id,sec.name,n]});
    const ql=q.trim().toLowerCase(),rows=regs.filter(r=>!ql||[r.first,r.last,r.email,r.inst,purp(r)].join(" ").toLowerCase().includes(ql));
    box.innerHTML=`<div class="kpis"><div class="kpi"><b>${regs.length}</b><span>регистрации</span></div><div class="kpi"><b>${regs.filter(r=>now-r.at<7*D).length}</b><span>нови за 7 дни</span></div><div class="kpi"><b>${regs.filter(r=>now-(r.seen||0)<7*D).length}</b><span>активни за 7 дни</span></div>
      <div class="kpi"><b>${full}</b><span>с пълен достъп</span></div><div class="kpi"><b>${live.length-used.length}<i> / ${live.length}</i></b><span>свободни кодове</span></div><div class="kpi"><b>${avg}</b><span>решени въпроса средно</span></div>${window.PHYS_SB?`<div class="kpi"><b>${sales.length}</b><span>${tt("продажби")}</span></div><div class="kpi"><b>${(sales.reduce((a,x)=>a+(x.amount||0),0)/100).toFixed(2)}<i> €</i></b><span>${tt("приходи (бруто)")}</span></div><div class="kpi"><b>${regs.length?Math.round(regs.filter(r=>r.paid).length/regs.length*100):0}<i> %</i></b><span>${tt("купили от регистрираните")}</span></div>`:""}</div>
     <div class="agrid">${bars("Цел на ползване",count(r=>escH(tt(purp(r)))))}${bars("Институции",count(r=>escH((r.inst||"—").trim())))}${bars("Език",count(r=>r.lang==="en"?"English":"Български"))}
      <div class="card"><h3 style="margin-top:0">Регистрации по дни</h3><div class="adays">${days.map(d=>`<div title="${fdate(d.t)}: ${d.n}"><i style="height:${d.n/dmx*100}%"></i><span>${new Date(d.t).getDate()}</span></div>`).join("")}</div><p class="small" style="margin:8px 0 0">Последните 14 дни.</p></div></div>
     <div class="agrid">${bars("Устройства",count(r=>escH(tt(r.dev||"неизвестно"))))}
      <div class="card"><h3 style="margin-top:0">Активност по дни</h3><div class="adays">${act.map(d=>`<div title="${fdate(d.t)}: ${d.n}"><i style="height:${d.n/amx*100}%;background:var(--accent2)"></i><span>${new Date(d.t).getDate()}</span></div>`).join("")}</div><p class="small" style="margin:8px 0 0">${tt("Колко потребители са отворили приложението за последно в този ден.")}</p></div></div>
     <div class="agrid"><div class="card"><h3 style="margin-top:0">Най-отваряни теми</h3>${topT.length?topT.map(([id,n])=>`<div class="abar"><span>${escH(tt(tname(id)))}</span><i><u style="width:${n/tmx*100}%"></u></i><b>${n}</b></div>`).join(""):`<p class="small">${tt("Още няма данни.")}</p>`}</div>
      <div class="card"><h3 style="margin-top:0">Напредък по раздели</h3><p class="small" style="margin:-4px 0 8px">${tt("Дял от потребителите, отворили поне една тема от раздела.")}</p>${secR.map(([id,nm,n])=>`<div class="abar"><span>${id}. ${escH(tt(nm))}</span><i><u style="width:${regs.length?n/regs.length*100:0}%;background:var(--accent2)"></u></i><b>${n}</b></div>`).join("")}</div></div>
     <div class="card"><div class="ahead"><h3 style="margin:0">Кодове за безплатен достъп</h3></div><p class="small" style="margin:4px 0 10px">Всеки код важи за един профил. Спреш ли код, достъпът с него се отнема при следващото отваряне.</p>
      <form id="genf" class="genf"><input name="label" maxlength="60" placeholder="за кого е кодът" aria-label="За кого е кодът"><input name="n" type="number" min="1" max="20" value="1" aria-label="Брой кодове"><button class="b primary">Генерирай</button></form><em id="e_gen" class="aerr" role="alert"></em>
      ${fresh.length?`<div class="fresh"><b>${tt("Нови кодове")}</b>${fresh.map(c=>`<code>${c}</code>`).join("")}<button class="b" id="cpFresh">Копирай</button></div>`:""}
      <div class="atw"><table class="atab"><thead><tr><th>Код</th><th>За кого</th><th>Създаден</th><th>Състояние</th><th></th></tr></thead><tbody>${codes.length?codes.map(c=>{const cl=byHash[c.id],r=cl&&byId[cl.id];
        return `<tr class="${c.revoked?"off":""}"><td><code>${escH(c.code||"")}</code></td><td>${escH(c.label||"—")}</td><td>${fdate(c.at)}</td><td>${c.revoked?`<span class="tagx">${tt("спрян")}</span>`:cl?`<span class="tagu">${tt("използван")}</span> ${r?escH(r.first+" "+r.last):""} · ${fdate(cl.at)}`:`<span class="tagf">${tt("свободен")}</span>`}</td><td class="act">${c.revoked?"":`<button class="b sm" data-cp="${escH(c.code||"")}">Копирай</button><button class="b sm" data-rev="${c.id}">Спри</button>`}</td></tr>`}).join(""):`<tr><td colspan="5" class="small">Още няма кодове. Генерирай първия по-горе.</td></tr>`}</tbody></table></div></div>
     <div class="card"><div class="ahead"><h3 style="margin:0">Регистрирани потребители</h3><div class="btns" style="margin:0"><input id="admQ" class="aq" placeholder="Търси по име, имейл, институция" aria-label="Търси по име, имейл, институция" value="${escH(q)}"><button class="b" id="admCsv">Копирай като CSV</button><button class="b" id="admRe">Обнови</button></div></div>
      <div class="atw"><table class="atab"><thead><tr><th>Име и фамилия</th><th>Имейл</th><th>Институция</th><th>Цел</th><th>Език</th><th>Записан на</th><th>Последно</th><th>Напредък</th><th>Достъп</th>${BK.owner?"<th></th>":""}</tr></thead><tbody>${rows.length?rows.map(r=>{const ok=r.paid||(r.codeHash&&live.some(c=>c.id===r.codeHash));
        return `<tr class="arow" data-u="${r.id}" style="cursor:pointer"><td>${escH((r.first||"")+" "+(r.last||""))}</td><td>${escH(r.email||"")}</td><td>${escH(r.inst||"—")}</td><td>${escH(tt(purp(r)))}</td><td>${r.lang==="en"?"EN":"BG"}</td><td>${fdate(r.at)}</td><td>${fdate(r.seen)}</td><td>${r.opened||0} ${tt("теми")} · ${r.ans||0}/${r.tot||0}</td><td>${ok?`<span class="tagu">${tt(r.paid?"платен":"пълен")}</span> ${escH(r.paid?"":lab[r.codeHash]||"")}`:`<span class="tagf">${tt("раздел I")}</span>`}</td>${BK.owner?`<td class="act"><button class="b sm" data-del="${r.id}">Изтрий</button></td>`:""}</tr>`}).join(""):`<tr><td colspan="10" class="small">${regs.length?tt("Няма съвпадения."):tt("Още няма регистрации.")}</td></tr>`}</tbody></table></div></div>`;
    wire(rows)}
  const copy=async(t,b)=>{try{await navigator.clipboard.writeText(t);const o=b.textContent;b.textContent=tt("Копирано");setTimeout(()=>{if(b.isConnected)b.textContent=o},1500)}catch(e){const ta=document.createElement("textarea");ta.className="acopy";ta.value=t;ta.readOnly=true;b.closest(".card").appendChild(ta);ta.select()}};
  function wire(rows){const g=$("#genf");g.onsubmit=async ev=>{ev.preventDefault();const d=new FormData(g),n=Math.max(1,Math.min(20,parseInt(d.get("n"))||1)),label=String(d.get("label")||"").trim(),b=g.querySelector("button");b.disabled=true;fresh=[];
      try{for(let i=0;i<n;i++){const c=newCode(),h=await codeHash(c),at=Date.now();await BK.db.doc("codes/"+h).set({at});await BK.db.doc("admcodes/"+h).set({code:c,label:n>1&&label?label+" "+(i+1):label,at});fresh.push(c)}}
      catch(e){$("#e_gen").textContent=tt("Кодовете не можаха да се запишат. Опитай пак.");b.disabled=false;if(!fresh.length)return}
      if(await load())draw()};
    const cf=$("#cpFresh");if(cf)cf.onclick=()=>copy(fresh.join("\n"),cf);
    box.querySelectorAll("[data-cp]").forEach(b=>b.onclick=()=>copy(b.dataset.cp,b));
    const twice=(b,txt,fn)=>{if(!b.dataset.sure){b.dataset.sure=1;const o=b.textContent;b.textContent=tt(txt);setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent=o}},3500);return}b.disabled=true;fn()};
    box.querySelectorAll("[data-rev]").forEach(b=>b.onclick=()=>twice(b,"Натисни пак",async()=>{try{await BK.db.doc("codes/"+b.dataset.rev).delete();await BK.db.doc("admcodes/"+b.dataset.rev).update({revoked:Date.now()})}catch(e){}if(await load())draw()}));
    box.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>twice(b,"Натисни пак",async()=>{try{await BK.db.doc("regs/"+b.dataset.del).delete();await BK.db.doc("claims/"+b.dataset.del).delete()}catch(e){}if(await load())draw()}));
    box.querySelectorAll("tr.arow").forEach(tr=>tr.onclick=ev=>{if(ev.target.closest("button"))return;const nx=tr.nextElementSibling;if(nx&&nx.classList.contains("adet")){nx.remove();return}const r=regs.find(x=>x.id===tr.dataset.u);if(!r)return;const op=String(r.tp||"").split(",").filter(Boolean),dn=new Set(String(r.dn||"").split(",").filter(Boolean));
      const d=document.createElement("tr");d.className="adet";d.innerHTML=`<td colspan="10" style="white-space:normal;background:var(--chip)"><div class="small" style="display:flex;flex-wrap:wrap;gap:6px 18px;margin-bottom:6px"><span>${tt("Устройство")}: <b>${escH(tt(r.dev||"—"))}</b></span><span>${tt("Дни с активност")}: <b>${r.days||0}</b></span><span>${tt("Решени въпроси")}: <b>${r.ans||0}/${r.tot||0}</b></span>${r.purpose==="other"&&r.other?`<span>${tt("Цел")}: <b>${escH(r.other)}</b></span>`:""}</div>${op.length?`<div style="display:flex;flex-wrap:wrap;gap:6px">${op.map(id=>`<span class="${dn.has(id)?"tagu":"tagf"}">${escH(tt(tname(id)))}</span>`).join("")}</div>`:`<span class="small">${tt("Още не е отварял теми.")}</span>`}</td>`;tr.after(d)});
    const qi=$("#admQ");qi.oninput=()=>{q=qi.value;clearTimeout(qi._t);qi._t=setTimeout(()=>{draw();const n=$("#admQ");n.focus();n.setSelectionRange(q.length,q.length)},250)};
    $("#admRe").onclick=async()=>{if(await load())draw()};
    $("#admCsv").onclick=e=>{const cell=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"';
      copy([["first","last","email","institution","purpose","language","registered","last_seen","topics_opened","answered","access","device","topics"].join(",")].concat(rows.map(r=>[r.first,r.last,r.email,r.inst,purp(r),r.lang,r.at?new Date(r.at).toISOString():"",r.seen?new Date(r.seen).toISOString():"",r.opened||0,r.ans||0,r.codeHash?"full":"free",r.dev||"",String(r.tp||"").replace(/,/g," ")].map(cell).join(","))).join("\n"),e.currentTarget)}}
  if(await load())draw()};
// ---------- профил и абонамент ----------
/* ===== Покупка: заключена тема и пълен достъп ===== */
const BEN=window.PHYS_LANG==="en",L=(b,e)=>BEN?e:b;
Object.assign(I,{check:'<path d="M5 12.5l4.2 4.2L19 7"/>',card:'<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',bolt:'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',mail:'<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7l8 6 8-6"/>'});
const PRICE=()=>escH((window.PHYS_CFG||{}).price||"24 €");
function buyStats(){const s=expStats(),fr=PREMIUM.free.length,lq=READY.filter(r=>!PREMIUM.free.includes(r.id)).reduce((a,r)=>a+topicProg(r.id)[1],0);return {lq,topics:READY.length,locked:READY.length-fr,secs:SYLLABUS.length,q:s.tot,gl:typeof GL!=="undefined"?GL.length:0}}
const ECG=`<svg class="ecg" viewBox="0 0 300 36" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M0 22H58l5-3 5 3h10l3 3 5-19 6 27 4-8h18c6-7 14-7 20 0h46l5-3 5 3h10l3 3 5-19 6 27 4-8h18c6-7 14-7 20 0H300"/></svg>`;
function trustRow(){return `<ul class="trust"><li>${ic("lock",15)}<span>${L("Сигурно плащане през Stripe","Secure payment via Stripe")}</span></li><li>${ic("card",15)}<span>${L("Карта, Apple Pay или Google Pay","Card, Apple Pay or Google Pay")}</span></li><li>${ic("bolt",15)}<span>${L("Отключва се веднага след плащането","Unlocks right after payment")}</span></li></ul>`}
function ctaHTML(){
  if(!window.PHYS_SB)return `<a class="buy-cta" href="#me">${L("Въведи код в профила","Enter a code in your profile")}</a>`;
  if(!AUTH.me())return `<a class="buy-cta" href="#auth" data-m="up"><span>${L("Създай профил и отключи","Create an account to unlock")}</span></a><p class="buy-note">${L("Регистрацията е безплатна и отнема минута. След нея плащаш с един бутон.","Signing up is free and takes a minute. Then you pay with one tap.")}</p>`;
  return `<button type="button" class="buy-cta" data-buy><span>${L("Отключи всички теми","Unlock all topics")}</span><b>${PRICE()}</b></button>`}
function buyCard(){const st=buyStats();
  return `<aside class="pw-card" aria-label="${L("Пълен достъп","Full access")}">${ECG}
    <p class="pw-k">${L("Пълен достъп","Full access")}</p>
    <div class="pw-price"><b>${PRICE()}</b><span>${L("плащаш веднъж, без абонамент","pay once, no subscription")}</span></div>
    <p class="pw-all">${L("Отключва","Unlocks")} <b>${st.locked}</b> ${L("теми от раздели II–XII и","topics in sections II–XII and")} <b>${st.lq}</b> ${L("въпроса с обяснения","questions with explanations")}</p>
    ${ctaHTML()}<em class="buy-err" role="alert"></em>
    ${window.PHYS_SB?trustRow():""}
    <a class="pw-code" href="#me">${L("Имам код за достъп","I have an access code")}</a>
  </aside>`}
function wireBuy(root){
  root.querySelectorAll("[data-buy]").forEach(b=>b.onclick=async()=>{const er=root.querySelector(".buy-err");b.disabled=true;b.classList.add("busy");if(er)er.textContent="";
    try{await PHYS_SB.buy()}catch(e){b.disabled=false;b.classList.remove("busy");if(er)er.textContent=L("Плащането не можа да започне. Опитай пак след малко.","Payment could not start. Please try again shortly.")+(e&&e.message?" ("+e.message+")":"")}});
  root.querySelectorAll("a[data-m]").forEach(a=>a.addEventListener("click",()=>{authMode=a.dataset.m}))}
function paywallHTML(it){const [,q]=topicProg(it.id),sec=it.sec,first=READY.find(r=>PREMIUM.free.includes(r.id));
  return `<div class="pw">
   <header class="pw-head"><a class="pw-sec" href="#home" style="--c:${SEC_COL[sec.id]||"var(--accent)"}"><b>${sec.id}</b><span>${escH(tt(sec.name))}</span></a>
     <h1 class="pw-t">${tt(it.t)}</h1>
     <p class="pw-lead">${ic("lock",17)}<span>${L("Тази тема е в пълния достъп. Отключи я заедно с целия конспект.","This topic is part of full access. Unlock it together with the whole syllabus.")}</span></p></header>
   ${buyCard()}
   <figure class="pw-shot"><img src="img/${BEN?"en":"bg"}_${it.id}.webp" alt="${L("Преглед на симулацията","Simulation preview")}" loading="lazy" onerror="this.closest('figure').remove()"><figcaption>${ic("lock",14)}<span>${L("Така изглежда симулацията в тази тема","This is what the simulation in this topic looks like")}</span></figcaption></figure>
   <section class="pw-in"><h2>${L("Какво има в темата","What's in this topic")}</h2><ul>
     <li>${ic("book",19)}<div><b>${L("Теория по учебника","Textbook theory")}</b><span>${L("ясен текст с фигури, формули и клинични бележки","clear text with figures, formulas and clinical notes")}</span></div></li>
     <li>${ic("play",19)}<div><b>${L("Интерактивна симулация","Interactive simulation")}</b><span>${L("променяш параметрите и виждаш какво става","change the parameters and see what happens")}</span></div></li>
     ${q?`<li>${ic("test",19)}<div><b>${q} ${L("въпроса с обяснения в тази тема","questions with explanations in this topic")}</b><span>${L("проверяваш се веднага след урока","check yourself right after the lesson")}</span></div></li>`:""}
     <li>${ic("search",19)}<div><b>${L("Речник на термините","Glossary of terms")}</b><span>${L("натискаш непознат термин и виждаш обяснение","tap an unfamiliar term to see its meaning")}</span></div></li></ul></section>
   ${first?`<p class="pw-free">${L("Още се колебаеш? Раздел I е изцяло безплатен.","Still deciding? Section I is completely free.")} <a href="#${first.id}">${L("Започни с първата тема","Start with the first topic")}</a></p>`:""}
  </div>`}
function premiumHTML(){const st=buyStats();
  if(PREMIUM.unlocked||!PREMIUM.lock)return `<section class="fa-ok" id="premium"><span class="fa-ok-ic">${ic("check",24)}</span><div><h3>${L("Пълният достъп е активен","Full access is active")}</h3><p>${L("Всички теми са отключени за профила ти. Приятно учене!","All topics are unlocked for your account. Enjoy studying!")}</p></div></section>`;
  const faq=[
    [L("Абонамент ли е?","Is it a subscription?"),L(`Не. Плащаш веднъж ${PRICE()} и достъпът остава за профила ти, докато приложението се поддържа. Няма автоматични плащания.`,`No. You pay ${PRICE()} once and access stays with your account for as long as the app is maintained. No recurring charges.`)],
    [L("Какво включва цената?","What does the price include?"),L("Цената е 20 € + ДДС. За България това са 24 €. За друга държава Stripe показва точната сума с местния ДДС преди плащане и ти изпраща фактура по имейл.","The price is €20 + VAT, which is €24 in Bulgaria. For other countries Stripe shows the exact total with local VAT before you pay and emails you an invoice.")],
    [L("На какви устройства работи?","Which devices does it work on?"),L("В браузъра на телефон, таблет и компютър. Влизаш със същия профил и напредъкът ти е навсякъде.","In the browser on phone, tablet and computer. Sign in with the same account and your progress follows you.")],
    [L("Имам код от преподавател или приятел","I have a code from a teacher or friend"),L("Въведи го в полето за код горе в профила. Кодът отключва всичко без плащане.","Enter it in the code field at the top of your profile. The code unlocks everything without payment.")],
    [L("Ами ако нещо не работи?","What if something doesn't work?"),L("Пиши ни на имейла от Условията. Ако има технически проблем, който не можем да оправим, връщаме парите.","Email us at the address in the Terms. If there is a technical problem we cannot fix, we refund you.")]];
  return `<section class="fa" id="premium">
    <div class="fa-hero"><div class="fa-copy">
      <p class="pw-k">${L("Пълен достъп","Full access")}</p>
      <h2 class="fa-h">${L("Целият конспект по физиология. С едно плащане.","The entire physiology syllabus. One payment.")}</h2>
      <p class="fa-sub">${L("Теория по учебника, симулации, 3D модели и тестове с обяснения за всички раздели. За изпита, за колоквиума и за преговор.","Textbook theory, simulations, 3D models and quizzes with explanations for every section. For the exam, the colloquium and revision.")}</p>
      <dl class="fa-num"><div><dt>${st.topics}</dt><dd>${L("теми","topics")}</dd></div><div><dt>${st.secs}</dt><dd>${L("раздела","sections")}</dd></div><div><dt>${st.q}</dt><dd>${L("въпроса с обяснения","questions explained")}</dd></div>${st.gl?`<div><dt>${st.gl}</dt><dd>${L("термина в речника","glossary terms")}</dd></div>`:""}</dl>
    </div>${buyCard()}</div>
    <div class="fa-gal">${[["heart3d",L("3D сърце","3D heart")],["lungmech",L("Механика на дишането","Breathing mechanics")],["xb",L("Цикъл на напречните мостове","Cross-bridge cycle")],["gfr",L("Гломерулна филтрация","Glomerular filtration")]].map(([id,t])=>READY.some(r=>r.id===id)?`<a href="#${id}"><img src="img/${BEN?"en":"bg"}_${id}.webp" alt="${t}" loading="lazy" onerror="this.closest('a').remove()"><span>${t}</span></a>`:"").join("")}</div>
    <h3 class="fa-h3">${L("Какво отключваш","What you unlock")}</h3>
    <ol class="fa-map">${SYLLABUS.map(sec=>{const n=sec.items.filter(i=>i.ready).length,fr=sec.items.some(i=>PREMIUM.free.includes(i.id));
      return `<li class="${fr?"free":""}" style="--c:${SEC_COL[sec.id]||"var(--accent)"}"><b>${sec.id}</b><span>${escH(tt(sec.name))}</span><em>${fr?L("безплатно","free"):n?`${n} ${n===1?L("тема","topic"):L("теми","topics")}`:L("скоро","soon")}</em>${fr?ic("check",15):ic("lock",14)}</li>`}).join("")}</ol>
    <h3 class="fa-h3">${L("Често задавани въпроси","Frequently asked questions")}</h3>
    <div class="faq">${faq.map(([q,a])=>`<details><summary>${q}${ic("chev",18)}</summary><p>${a}</p></details>`).join("")}</div>
  </section>`}
{const css=`
.pw{max-width:1040px;margin:28px auto 48px;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.85fr);grid-template-areas:"head card" "shot card" "in card" "free free";gap:8px 40px;align-items:start}
.pw-head{grid-area:head}.pw-shot{grid-area:shot;margin:0 0 26px;position:relative;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:var(--panel)}
.pw-shot img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover}
.pw-shot figcaption{position:absolute;left:12px;bottom:12px;display:flex;gap:8px;align-items:center;padding:7px 11px;border-radius:999px;background:rgba(14,19,25,.78);color:#fff;font-size:13px;backdrop-filter:blur(6px)}
.pw-shot::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(14,19,25,.35));pointer-events:none}.pw-in{grid-area:in}.pw .pw-card{grid-area:card;position:sticky;top:84px}.pw-free{grid-area:free}
.pw-sec{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:var(--muted);font-size:14.5px;margin-bottom:14px}
.pw-sec b{font:600 15px/1 var(--serif,Georgia,serif);color:var(--c);border:1.5px solid var(--c);border-radius:8px;padding:5px 8px;min-width:22px;text-align:center}
.pw-t{font:600 clamp(28px,3.6vw,38px)/1.12 var(--serif,Georgia,serif);letter-spacing:-.01em;margin:0 0 14px;text-wrap:balance}
.pw-lead{display:flex;gap:10px;align-items:flex-start;color:var(--muted);font-size:16.5px;line-height:1.5;margin:0 0 26px;max-width:56ch}
.pw-lead svg{flex:none;margin-top:3px;color:var(--accent)}
.pw-in h2,.fa-h3{font:600 19px/1.3 var(--serif,Georgia,serif);margin:6px 0 12px}
.pw-in ul{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.pw-in li{display:grid;grid-template-columns:34px 1fr;gap:12px;padding:14px 0;border-bottom:1px solid var(--line)}
.pw-in li svg{color:var(--sec,var(--accent2));margin-top:2px}
.pw-in li b{display:block;font-size:16px;font-weight:620}.pw-in li span{color:var(--muted);font-size:14.5px;line-height:1.45}
.pw-free{margin:22px 0 0;padding:16px 18px;border:1px dashed var(--line);border-radius:14px;color:var(--muted);font-size:15px}
.pw-free a{color:var(--accent);font-weight:650;white-space:nowrap}
.pw-card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:22px 22px 18px;box-shadow:0 18px 50px -24px rgba(16,24,40,.35);overflow:hidden}
.pw-card .ecg{display:block;width:calc(100% + 44px);height:36px;margin:-22px -22px 14px;background:color-mix(in srgb,var(--accent) 7%,transparent);border-bottom:1px solid color-mix(in srgb,var(--accent) 22%,transparent)}
.pw-card .ecg path{fill:none;stroke:var(--accent);stroke-width:1.6;stroke-linejoin:round;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1;animation:ecgdraw 1.6s .2s ease-out forwards}
@keyframes ecgdraw{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.pw-card .ecg path{animation:none;stroke-dashoffset:0}}
.pw-k{margin:0 0 4px;font-size:14px;font-weight:650;color:var(--accent)}
.pw-price{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:0 0 6px}
.pw-price b{font:600 46px/1 var(--serif,Georgia,serif);font-variant-numeric:lining-nums tabular-nums;letter-spacing:-.02em;color:var(--ink)}
.pw-price span{color:var(--muted);font-size:14px}
.pw-all{margin:0 0 16px;font-size:15px;color:var(--ink)}.pw-all b{font-weight:700}
.buy-cta{display:flex;width:100%;align-items:center;justify-content:space-between;gap:12px;box-sizing:border-box;border:0;border-radius:13px;padding:15px 18px;background:var(--accent);color:#fff;font:650 16.5px/1.2 var(--sans,inherit);text-decoration:none;cursor:pointer;transition:transform .12s ease,filter .12s ease}
a.buy-cta{justify-content:center}
.buy-cta b{font:600 17px/1 var(--serif,Georgia,serif);background:rgba(255,255,255,.18);border-radius:8px;padding:6px 9px}
.buy-cta:hover{filter:brightness(1.06)}.buy-cta:active{transform:translateY(1px)}
.buy-cta:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 45%,transparent);outline-offset:3px}
.buy-cta.busy{opacity:.7;cursor:progress}.buy-cta.busy span::after{content:"…"}
.buy-note{margin:10px 2px 0;font-size:13.5px;color:var(--muted);line-height:1.45}
.buy-err{display:block;font-style:normal;color:var(--accent);font-size:13.5px;margin-top:8px}.buy-err:empty{display:none}
.trust{list-style:none;margin:16px 0 0;padding:14px 0 0;border-top:1px solid var(--line);display:grid;gap:9px}
.trust li{display:flex;gap:10px;align-items:center;font-size:13.5px;color:var(--muted)}.trust svg{flex:none;color:var(--ink);opacity:.7}
.pw-code{display:block;margin-top:14px;text-align:center;font-size:14px;color:var(--muted);text-decoration:underline;text-underline-offset:3px}
.fa{margin:30px 0 10px}
.fa-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(290px,.85fr);gap:32px;align-items:start;padding:28px;border:1px solid var(--line);border-radius:22px;background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 5%,var(--panel)),var(--panel) 60%)}
.fa-h{font:600 clamp(26px,3.6vw,36px)/1.14 var(--serif,Georgia,serif);letter-spacing:-.01em;margin:0 0 12px;text-wrap:balance}
.fa-sub{color:var(--muted);font-size:16px;line-height:1.55;margin:0 0 22px;max-width:52ch}
.fa-num{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 18px;margin:0}
.fa-num div{border-left:2px solid var(--accent);padding-left:12px}
.fa-num dt{font:600 32px/1 var(--serif,Georgia,serif);font-variant-numeric:lining-nums tabular-nums}
.fa-num dd{margin:5px 0 0;font-size:13.5px;color:var(--muted);line-height:1.3}
.fa-h3{margin-top:30px}
.fa-gal{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:18px 0 0}
.fa-gal a{position:relative;display:block;border-radius:14px;overflow:hidden;border:1px solid var(--line);text-decoration:none}
.fa-gal img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform .3s ease}
.fa-gal a:hover img{transform:scale(1.04)}
.fa-gal span{position:absolute;left:8px;bottom:8px;right:8px;padding:5px 9px;border-radius:9px;background:rgba(14,19,25,.78);color:#fff;font-size:12.5px;font-weight:600}
@media (max-width:820px){.fa-gal{grid-template-columns:repeat(2,minmax(0,1fr))}}
.fa .pw-card .pw-k{display:none}
.fa-map{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.fa-map li{display:grid;grid-template-columns:auto 1fr auto;grid-template-rows:auto auto;column-gap:12px;align-items:center;padding:12px 14px;border:1px solid var(--line);border-left:4px solid var(--c);border-radius:12px;background:var(--panel)}
.fa-map li b{grid-row:1/3;font:600 18px/1 var(--serif,Georgia,serif);color:var(--c);min-width:34px}
.fa-map li span{font-size:14.5px;line-height:1.3;font-weight:560}
.fa-map li em{grid-column:2;font-style:normal;font-size:12.5px;color:var(--muted)}
.fa-map li svg{grid-row:1/3;grid-column:3;color:var(--muted)}
.fa-map li.free{background:color-mix(in srgb,var(--c) 7%,var(--panel))}.fa-map li.free svg{color:var(--c)}.fa-map li.free em{color:var(--c);font-weight:650}
.faq{border-top:1px solid var(--line)}
.faq details{border-bottom:1px solid var(--line)}
.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 2px;font-weight:620;font-size:15.5px}
.faq summary::-webkit-details-marker{display:none}
.faq summary svg{flex:none;color:var(--muted);transition:transform .2s}.faq details[open] summary svg{transform:rotate(180deg)}
.faq p{margin:0 2px 16px;color:var(--muted);line-height:1.55;max-width:70ch}
.fa-ok{display:flex;gap:16px;align-items:center;margin:28px 0 10px;padding:20px 22px;border:1px solid color-mix(in srgb,#0d9488 40%,var(--line));border-radius:18px;background:color-mix(in srgb,#0d9488 7%,var(--panel))}
.fa-ok-ic{width:46px;height:46px;flex:none;border-radius:50%;display:grid;place-items:center;background:#0d9488;color:#fff}
.fa-ok h3{margin:0 0 3px;font:600 19px/1.3 var(--serif,Georgia,serif)}.fa-ok p{margin:0;color:var(--muted)}
@media (max-width:820px){
 .pw{grid-template-columns:1fr;grid-template-areas:"head" "shot" "card" "in" "free";margin-top:16px}
 .pw .pw-card{position:static}
 .fa-hero{grid-template-columns:1fr;padding:20px;gap:22px}
 .pw-price b{font-size:42px}
}`;const st=document.createElement("style");st.id="buy-css";st.textContent=css;document.head.appendChild(st)}

VIEWS.me=function(main){const s=expStats(),opened=READY.filter(r=>status(r.id)!=="new").length,done=READY.filter(r=>status(r.id)==="done").length,sk=streak(),ck=ic("test",20);
  main.innerHTML=`${meHead()}${PREMIUM.lock&&!PREMIUM.unlocked?premiumHTML():""}
   <div class="kpis"><div class="kpi"><b>${opened}<i> / ${READY.length}</i></b><span>отворени теми</span></div><div class="kpi"><b>${done}</b><span>${done===1?"завършена тема":"завършени теми"}</span></div><div class="kpi"><b>${s.ans}<i> / ${s.tot}</i></b><span>решени въпроса</span></div></div>
   <div class="card"><h3 style="margin-top:0">Напредък по раздели</h3>${SYLLABUS.map(sec=>{const p=secProg(sec);return `<div style="--sec:${SEC_COL[sec.id]};display:grid;grid-template-columns:44px 1fr 52px;gap:10px;align-items:center;padding:7px 0"><b style="font:600 17px/1 var(--cond);color:var(--sec)">${sec.id}</b><div><div style="font-size:14px;margin-bottom:4px">${sec.name}</div><div class="pbar"><div style="width:${p.f*100}%"></div></div></div><span class="small" style="text-align:right">${p.a}/${p.t}</span></div>`}).join("")}
     <div class="btns" style="margin-top:12px"><button class="b" id="meReset">Изчисти напредъка</button><a class="b" href="#about">За приложението и лицензи</a></div></div>
   ${PREMIUM.lock&&!PREMIUM.unlocked?"":premiumHTML()}`;meWire();
  wireBuy(main);
  $("#meReset").onclick=e=>{const b=e.currentTarget;if(!b.dataset.sure){b.dataset.sure=1;b.textContent="Натисни пак, за да изчистиш всичко";setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent="Изчисти напредъка"}},4000);return}Object.keys(localStorage).forEach(k=>{if(/exp_|seen_|days|tab_|lastTopic/.test(k))localStorage.removeItem(k)});route()}};
// ---------- след всяка смяна на страница ----------
function after(){const v=typeof curView!=="undefined"?curView:"home",it=READY.find(i=>i.id===v),mn=$("#main");touchDay();document.body.classList.toggle("lp",v==="home");
  document.querySelectorAll("#tabbar [data-v],.quick a").forEach(a=>a.classList.toggle("on",a.dataset.v===v||(a.dataset.v==="me"&&v==="auth")||(a.dataset.v==="nav"&&!!it)));
  if(v==="auth"){$("#crumb").style.visibility="";$("#crumb .s").textContent="Физиология";$("#crumb .t").textContent=authMode==="up"?"Регистрация":"Вход";document.title="Профил — Физиология"}
  if(v==="privacy"||v==="terms"){$("#crumb").style.visibility="";$("#crumb .s").textContent="Физиология";$("#crumb .t").textContent=v==="privacy"?"Поверителност":"Условия";document.title=(v==="privacy"?"Поверителност":"Условия")+" — Физиология"}
  if(v==="admin"){$("#crumb").style.visibility="";$("#crumb .s").textContent="Физиология";$("#crumb .t").textContent="Админ";document.title="Админ — Физиология"}
  if(v==="me"){$("#crumb").style.visibility="";$("#crumb .s").textContent="Физиология";$("#crumb .t").textContent="Профил и пълен достъп";document.title="Профил — Физиология"}
  if(it){if(isFree(v))store.set("seen_"+v,1);mn.style.setProperty("--sec",SEC_COL[it.sec.id]||"var(--accent)");
    if(!isFree(v)){(window.__cleanups||[]).forEach(f=>{try{f()}catch(e){}});window.__cleanups=[];mn.innerHTML=paywallHTML(it);wireBuy(mn);
      return}
    const h=mn.querySelector("h2");if(h&&!mn.querySelector(".secchip")){const c=document.createElement("a");c.className="secchip";c.href="#home";c.innerHTML=`<i>${it.sec.id}</i>${it.sec.name}`;h.parentNode.insertBefore(c,h)}}
  else mn.style.removeProperty("--sec")}
window.addEventListener("hashchange",after);

if(window.__i18nStart)try{__i18nStart()}catch(e){console.error(e)}
try{route()}catch(e){console.error(e)}after();
})();
