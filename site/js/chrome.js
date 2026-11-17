/* ===== „Течен метал“: металически фон (WebGL), стъклени повърхности по Apple HIG, движение с GSAP =====
   Заменя js/palette.js и js/palette-metal.js (в index.html се зарежда само един от трите файла).
   Фонът е полиран метал под студийна светлина: отблясъците бавно текат, следват курсора и се плъзгат при скрол.
   Повърхностите са матирано стъкло (материал от Apple HIG), през което прозира металът. */
(function(){"use strict";
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const SYS='-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';

/* ---------- цветове и материали ---------- */
const css=`
html:root{
 --bg:transparent!important;--panel:rgba(255,255,255,.62)!important;--plate:rgba(255,255,255,.62)!important;--chip:rgba(255,255,255,.5)!important;--line:rgba(29,29,31,.12)!important;--ink:#1D1D1F!important;--muted:#5E5E63!important;
 --pri:#C8102E!important;--pri-h:#A50D25!important;--pri-50:rgba(200,16,46,.08)!important;--pri-100:rgba(200,16,46,.16)!important;--accent:#C8102E!important;--accent2:#1D1D1F!important;
 --ok:#0A60D6!important;--ok-50:rgba(10,96,214,.10)!important;--err:#C2410C!important;--err-50:rgba(194,65,12,.10)!important;--warn:#A86A00!important;--warn-50:rgba(168,106,0,.10)!important;--warn-ink:#7A4E0B!important;
 --c:#C8102E!important;--cb:rgba(255,255,255,.62)!important;
 --nb-ink:#1D1D1F!important;--nb-on:#FFFFFF!important;--nb-paper:rgba(255,255,255,.62)!important;--nb-bg:transparent!important;
 --nb-red:#C8102E!important;--nb-red-50:rgba(200,16,46,.08)!important;
 --nb-y:rgba(255,255,255,.72)!important;--nb-y-50:rgba(255,255,255,.5)!important;--nb-lm:rgba(255,255,255,.72)!important;
 --nb-pk:#C8102E!important;--nb-or:#C8102E!important;--nb-tl:#C8102E!important;--nb-rd:#C8102E!important;--nb-bl:rgba(255,255,255,.62)!important;--nb-vi:rgba(255,255,255,.62)!important;
 --nb-b:1px solid rgba(255,255,255,.75)!important;
 --glass:rgba(255,255,255,.58);--glass-strong:rgba(255,255,255,.74);--glass-edge:rgba(255,255,255,.8);
 --glass-sh:inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(29,29,31,.04),0 1px 2px rgba(20,24,32,.06),0 12px 32px rgba(20,24,32,.10);
 --nb-sh:var(--glass-sh)!important;--nb-sh-h:inset 0 1px 0 rgba(255,255,255,.95),0 20px 44px rgba(20,24,32,.16)!important;--nb-sh-s:inset 0 1px 0 rgba(255,255,255,.9),0 2px 8px rgba(20,24,32,.08)!important;
 --ease-out:cubic-bezier(.19,1,.22,1);
 color-scheme:light}
html{background:#E7E9EC!important}
html body{background:transparent!important;color:#1D1D1F;font-family:${SYS}!important;-webkit-font-smoothing:antialiased}
html body:not(#nb) h1,html body:not(#nb) h2,html body:not(#nb) h3,html body:not(#nb) .lp-h h2{font-family:${SYS}!important;letter-spacing:-.022em}
#lm-bg{position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;display:block;pointer-events:none}
#lm-bg-fallback{position:fixed;inset:0;z-index:-2;background:
 radial-gradient(120% 80% at 20% 0%,#FBFBFC 0%,rgba(251,251,252,0) 55%),
 linear-gradient(115deg,#D9DCE0 0%,#F4F5F6 28%,#C9CDD2 46%,#EEF0F2 64%,#D3D7DB 82%,#F6F7F8 100%)}
html body:not(#nb) ::selection{background:#C8102E;color:#fff}

/* стъкло: карти, панели, менюта (материал „thin/regular“ от HIG) */
html body:not(#nb) .lp-card,html body:not(#nb) .card,html body:not(#nb) .lp-plan,html body:not(#nb) .lp-feat>li,html body:not(#nb) .steps>li,
html body:not(#nb) .lp-qa-mail,html body:not(#nb) .kpi,html body:not(#nb) .sec,html body:not(#nb) .lp-stats,html body:not(#nb) .lp-qa-main details,html body:not(#nb) .lp-qa-main .qa{
 background:var(--glass)!important;-webkit-backdrop-filter:blur(22px) saturate(170%);backdrop-filter:blur(22px) saturate(170%);
 border:1px solid var(--glass-edge)!important;box-shadow:var(--glass-sh)!important;border-radius:22px!important;color:#1D1D1F}
html body:not(#nb) .lp-card{position:relative;overflow:hidden;transform-style:preserve-3d;will-change:transform;transition:box-shadow .4s var(--ease-out),border-color .4s}
html body:not(#nb) .lp-card:hover{box-shadow:var(--nb-sh-h)!important}
/* метален отблясък, който следва курсора по картата */
html body:not(#nb) .lp-card::after,html body:not(#nb) .lp-feat>li::after,html body:not(#nb) .lp-plan::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:var(--sheen,0);transition:opacity .4s;
 background:radial-gradient(420px circle at var(--mx,50%) var(--my,0%),rgba(255,255,255,.75),rgba(255,255,255,0) 45%),linear-gradient(115deg,rgba(255,255,255,0) 35%,rgba(255,255,255,.35) 50%,rgba(255,255,255,0) 65%);mix-blend-mode:soft-light}
html body:not(#nb) .lp-feat>li,html body:not(#nb) .lp-plan{position:relative;overflow:hidden}
html body:not(#nb) .lp-card .n,html body:not(#nb) .nsh .n,html body:not(#nb) .sec .n{background:rgba(255,255,255,.8)!important;border:1px solid rgba(29,29,31,.08)!important;border-radius:12px!important;color:#1D1D1F!important;box-shadow:0 1px 2px rgba(20,24,32,.08)!important}
html body:not(#nb) .lp-card-img{display:block;width:100%;aspect-ratio:16/7;object-fit:cover;border-bottom:1px solid rgba(255,255,255,.6);transition:transform .9s var(--ease-out)}
html body:not(#nb) .lp-card:hover .lp-card-img{transform:scale(1.05)}
html body:not(#nb) .lp-card-tp i{border-left-color:#C8102E!important}
html body:not(#nb) .lp-card .fr{background:#C8102E!important;color:#fff!important;border:0!important;border-radius:999px!important;padding:4px 10px!important}
html body:not(#nb) .lp-card .lk{background:rgba(255,255,255,.8)!important;border:1px solid rgba(29,29,31,.1)!important;border-radius:999px!important}

/* лента за навигация: стъкло отгоре (HIG navigation bar) */
html body:not(#nb) header.bar{background:rgba(250,250,252,.62)!important;-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgba(29,29,31,.08)!important;box-shadow:none!important}
html body:not(#nb) aside#nav{background:rgba(250,250,252,.66)!important;-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);border-right:1px solid rgba(29,29,31,.08)!important}
html body:not(#nb) #tabbar{background:rgba(250,250,252,.7)!important;-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);border-top:1px solid rgba(29,29,31,.08)!important}
html body:not(#nb) .tb-search input,html body:not(#nb) #navq{background:rgba(118,118,128,.12)!important;border:0!important;border-radius:10px!important;color:#1D1D1F!important;min-height:36px}

/* бутони: капсули, поне 44 pt (HIG), червен основен и стъклен второстепенен */
html body:not(#nb) .lp-cta>a,html body:not(#nb) .b.primary,html body:not(#nb) .buy-cta,html body:not(#nb) .lp-plan .b,html body:not(#nb) .lp-plan a{border-radius:999px!important;min-height:44px}
html body:not(#nb) .lp-cta>a:first-child,html body:not(#nb) .b.primary,html body:not(#nb) .buy-cta{background:#C8102E!important;color:#fff!important;border:0!important;box-shadow:0 1px 0 rgba(255,255,255,.25) inset,0 8px 22px rgba(200,16,46,.30)!important}
html body:not(#nb) .lp-cta>a:first-child *,html body:not(#nb) .b.primary *{color:#fff!important}
html body:not(#nb) .lp-cta>a:nth-child(2){background:rgba(255,255,255,.22)!important;color:#fff!important;border:1px solid rgba(255,255,255,.55)!important;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
html body:not(#nb) .lp-cta>a:nth-child(2) *{color:#fff!important}

/* горната снимка: рамка със заоблени ъгли, като медийните рамки на Apple */
html body:not(#nb) .lp-hero{margin:12px clamp(10px,1.6vw,22px) 0!important;border-radius:28px!important;overflow:hidden!important;box-shadow:0 30px 60px rgba(20,24,32,.18)!important}
html body:not(#nb) .lp-hero::before{background:linear-gradient(90deg,rgba(12,13,16,.86) 0%,rgba(12,13,16,.55) 45%,rgba(60,10,18,.12) 100%)!important}
@media (max-width:860px){html body:not(#nb) .lp-hero::before{background:linear-gradient(0deg,rgba(12,13,16,.92) 0%,rgba(12,13,16,.6) 55%,rgba(60,10,18,.12) 100%)!important}}
html body:not(#nb) .lp-kick,html body:not(#nb) .lp-hero .lp-tag{background:rgba(255,255,255,.18)!important;color:#fff!important;border:1px solid rgba(255,255,255,.45)!important;border-radius:999px!important;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
html body:not(#nb) .lp-ecg path{stroke:#FF4D5A!important}
html body:not(#nb) .lp-stats{border-radius:22px!important}
html body:not(#nb) .lp-stats>div,html body:not(#nb) .lp-stats>div:nth-child(n){background:transparent!important}
html body:not(#nb) .lp-stats>div+div{border-left:1px solid rgba(29,29,31,.08)!important}
html body:not(#nb) .lp-stats b,html body:not(#nb) .lp-stats>div:nth-child(n) b{color:#1D1D1F!important;font-family:${SYS}!important;letter-spacing:-.03em}
html body:not(#nb) .lp-stats>div:nth-child(2) b{color:#C8102E!important}
html body:not(#nb) .lp-stats span,html body:not(#nb) .lp-stats>div:nth-child(n) span{color:#5E5E63!important}

/* секции: прозрачни, металът прозира; тъмните ленти стават заоблени „витрини“ */
html body:not(#nb) .lp-sect,html body:not(#nb) .lp-tint{background:transparent!important;border:0!important}
html body:not(#nb) .lp-tint .lp-h h2,html body:not(#nb) .lp-sect .lp-h h2{color:#1D1D1F!important}
html body:not(#nb) .lp-tint .lp-h p,html body:not(#nb) .lp-sect .lp-h p{color:#5E5E63!important}
html body:not(#nb) .lp-dark{margin:0 clamp(10px,1.6vw,22px)!important;border-radius:28px!important;background:linear-gradient(180deg,#17181B,#0E0F11)!important;box-shadow:0 30px 60px rgba(20,24,32,.22)!important}
html body:not(#nb) .lp-dark .lp-h h2{color:#F5F5F7!important}html body:not(#nb) .lp-dark .lp-h p{color:#A1A1A6!important}
html body:not(#nb) .lp-gal a{border-radius:18px!important;overflow:hidden;border:0!important;box-shadow:0 14px 34px rgba(0,0,0,.4)!important}
html body:not(#nb) #tabbar *{box-shadow:none!important}
html body:not(#nb) #tabbar .on,html body:not(#nb) #tabbar [aria-current]{border-color:transparent!important;background:rgba(200,16,46,.10)!important;color:#C8102E!important;border-radius:12px!important}
html body:not(#nb) #tabbar .on *,html body:not(#nb) #tabbar [aria-current] *{color:#C8102E!important}
html body:not(#nb) .lp-tick{background:rgba(255,255,255,.4)!important;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-top:1px solid rgba(255,255,255,.7)!important;border-bottom:1px solid rgba(29,29,31,.06)!important;color:#1D1D1F!important}
html body:not(#nb) .lp-tick *{color:#1D1D1F!important}
html body:not(#nb) .lp-foot{background:linear-gradient(180deg,#17181B,#0E0F11)!important;border-radius:28px 28px 0 0;margin:0 clamp(10px,1.6vw,22px)}

/* остатъци от стария стил: без твърди черни сенки и черни етикети */
html body:not(#nb) .lp-feat>li i,html body:not(#nb) .steps>li i{background:rgba(255,255,255,.85)!important;border:1px solid rgba(29,29,31,.08)!important;border-radius:12px!important;box-shadow:0 1px 2px rgba(20,24,32,.08)!important;color:#1D1D1F!important}
html body:not(#nb) .lp-feat>li[style*="--k"] i{color:#1D1D1F!important}
html body:not(#nb) .lp-plan.pro{border:1.5px solid rgba(200,16,46,.55)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 24px 48px rgba(200,16,46,.14)!important;background:rgba(255,255,255,.72)!important}
html body:not(#nb) .lp-plan.pro .lp-tag{background:#C8102E!important;color:#fff!important;border-radius:999px!important;padding:5px 12px!important}
html body:not(#nb) .lp-plan.pro a.b.primary,html body:not(#nb) .lp-plan.pro .b.primary{background:#C8102E!important;color:#fff!important;box-shadow:0 8px 22px rgba(200,16,46,.30)!important}
html body:not(#nb) .lp-plan a.b:not(.primary){background:rgba(255,255,255,.8)!important;color:#1D1D1F!important;border:1px solid rgba(29,29,31,.1)!important;box-shadow:0 1px 2px rgba(20,24,32,.06)!important}
html body:not(#nb) .lp-qa-g>:first-child:not(details){display:inline-block;background:rgba(200,16,46,.08)!important;color:#C8102E!important;border:0!important;border-radius:999px!important;padding:6px 14px!important;box-shadow:none!important}
html body:not(#nb) .lp-qa-main summary>span:last-child:not(:first-child){border:1px solid rgba(29,29,31,.15)!important;border-radius:8px!important;box-shadow:none!important;background:rgba(255,255,255,.7)!important}
html body:not(#nb) .lp-card .lp-card-top em.fr{background:#C8102E!important;color:#fff!important;border:0!important;border-radius:999px!important;padding:4px 10px!important;box-shadow:none!important}
html body:not(#nb) header.bar a.prem{border:0!important;border-radius:999px!important;box-shadow:0 6px 16px rgba(200,16,46,.25)!important}
html body:not(#nb) header.bar .quick>*:not(.prem){border-radius:999px!important;box-shadow:none!important}
html body:not(#nb) header.bar .quick>a:last-child:not(.prem){background:rgba(255,255,255,.7)!important;border:1px solid rgba(29,29,31,.12)!important}
html body:not(#nb) .lp-cta>*:nth-child(2){background:rgba(255,255,255,.22)!important;color:#fff!important;border:1px solid rgba(255,255,255,.55)!important;border-radius:999px!important;box-shadow:none!important;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
html body:not(#nb) .lp-cta>*:nth-child(2) *{color:#fff!important}
html body:not(#nb) .lp-cta>*:first-child{border-radius:999px!important}
/* тестове: синьо с ✓ за вярно, оранжево с ✕ за грешно (HIG системни цветове) */
html body:not(#nb) .opts button{border-radius:14px!important}
html body:not(#nb) .opts button.right{background:#0A60D6!important;color:#fff!important;border-color:#0A60D6!important}
html body:not(#nb) .opts button.right *{color:#fff!important}
html body:not(#nb) .opts button.wrong{background:#C2410C!important;color:#fff!important;border-color:#C2410C!important}
html body:not(#nb) .opts button.wrong *{color:#fff!important}
html body:not(#nb) .opts button.right::after{content:" ✓";font-weight:800}
html body:not(#nb) .opts button.wrong::after{content:" ✕";font-weight:800}
@media (prefers-reduced-transparency:reduce){html body:not(#nb) .lp-card,html body:not(#nb) .card,html body:not(#nb) header.bar{background:#F5F5F7!important;-webkit-backdrop-filter:none;backdrop-filter:none}}
`;
const st=document.createElement("style");st.id="liquid-metal";st.textContent=css;document.head.appendChild(st);
new MutationObserver(()=>{if(st.nextElementSibling&&st.nextElementSibling.tagName==="STYLE")document.head.appendChild(st)}).observe(document.head,{childList:true});
const tc=()=>{document.querySelectorAll('meta[name="theme-color"]').forEach(m=>m.content="#E7E9EC");document.documentElement.style.colorScheme="light"};tc();addEventListener("load",tc);

/* ---------- металически фон: шейдър ---------- */
const fb=document.createElement("div");fb.id="lm-bg-fallback";
const cv=document.createElement("canvas");cv.id="lm-bg";cv.setAttribute("aria-hidden","true");
function mountBg(){if(!document.body)return setTimeout(mountBg,30);document.body.prepend(cv);document.body.prepend(fb);startGL()}
const U={mx:.5,my:.35,scroll:0};
function startGL(){
  const gl=cv.getContext("webgl",{antialias:false,alpha:false,premultipliedAlpha:false,powerPreference:"low-power"});if(!gl){cv.remove();return}
  const VS="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const FS=`precision highp float;
uniform vec2 uRes;uniform float uTime,uScroll;uniform vec2 uMouse;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return v;}
float field(vec2 p){float t=uTime*.035;vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t));vec2 r=vec2(fbm(p+3.*q+vec2(1.7,9.2)+t*.6),fbm(p+3.*q+vec2(8.3,2.8)));return fbm(p+2.2*r+vec2(uScroll*.9,0.));}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y*1.25;
  float e=1.5/uRes.y;float h=field(p);vec2 g=vec2(field(p+vec2(e,0.))-h,field(p+vec2(0.,e))-h)/e;
  vec3 n=normalize(vec3(-g*.035,1.));vec3 r=reflect(vec3(0.,0.,-1.),n);
  /* студийна среда: светло отгоре, по-тъмно отдолу, меки „софтбоксове“ */
  float y=clamp(r.y*.9+.55+(uv.y-.5)*.35,0.,1.);
  vec3 col=mix(vec3(.70,.72,.75),vec3(.975,.978,.982),smoothstep(.05,.95,y));
  float a=r.x*2.2+r.y*.8+(uMouse.x-.5)*1.4-uScroll*1.6;
  float b1=exp(-pow((fract(a*.22)-.5)*6.,2.));col+=b1*.16;
  float b2=exp(-pow((r.x*1.6+(uMouse.y-.5)*1.1-uScroll*.6-.35)*5.,2.));col+=b2*.10;
  float dark=exp(-pow((r.x*1.4+r.y+.9+uScroll*.5)*3.,2.));col-=dark*.10;
  float red=exp(-pow((r.y*2.4-r.x*.7+.95-(uMouse.x-.5)*.5)*4.,2.));col=mix(col,vec3(.80,.16,.22),red*.09);
  /* фини следи от полиране, като на четкан метал */
  float br=noise(vec2(gl_FragCoord.x*.0025,gl_FragCoord.y*.9));col*=.988+br*.024;
  col*=1.-.10*smoothstep(.35,1.,length(uv-.5)*1.3);
  gl_FragColor=vec4(col,1.);
}`;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(o));return null}return o};
  const vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs){cv.remove();return}
  const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.useProgram(pr);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,"p");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const uRes=gl.getUniformLocation(pr,"uRes"),uTime=gl.getUniformLocation(pr,"uTime"),uScroll=gl.getUniformLocation(pr,"uScroll"),uMouse=gl.getUniformLocation(pr,"uMouse");
  /* рисуваме на половин разделителна способност: металът е мек и така фонът не натоварва телефона */
  const SCALE=.5;function size(){cv.width=Math.max(2,Math.round(innerWidth*SCALE));cv.height=Math.max(2,Math.round(innerHeight*SCALE));gl.viewport(0,0,cv.width,cv.height)}
  size();addEventListener("resize",size);
  let t0=performance.now(),last=0,vis=true;document.addEventListener("visibilitychange",()=>{vis=!document.hidden});
  function draw(now){if(vis&&now-last>=33){last=now;gl.uniform2f(uRes,cv.width,cv.height);gl.uniform1f(uTime,RM?0:(now-t0)/1000);gl.uniform1f(uScroll,U.scroll);gl.uniform2f(uMouse,U.mx,U.my);gl.drawArrays(gl.TRIANGLES,0,3)}
    if(!RM)requestAnimationFrame(draw)}
  requestAnimationFrame(draw);if(RM){addEventListener("scroll",()=>requestAnimationFrame(n=>{last=0;draw(n)}),{passive:true});addEventListener("resize",()=>requestAnimationFrame(n=>{last=0;draw(n)}))}
}
mountBg();

/* ---------- движение с GSAP ---------- */
const load=src=>new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
const G="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/";
(window.gsap?Promise.resolve():load(G+"gsap.min.js")).then(()=>window.ScrollTrigger?null:load(G+"ScrollTrigger.min.js")).then(initMotion).catch(()=>{});
function initMotion(){const gsap=window.gsap;gsap.registerPlugin(window.ScrollTrigger);const ST=window.ScrollTrigger;
  /* курсорът и скролът местят отблясъците по метала плавно, с инерция */
  const qx=gsap.quickTo(U,"mx",{duration:1.6,ease:"power3.out"}),qy=gsap.quickTo(U,"my",{duration:1.6,ease:"power3.out"});
  addEventListener("pointermove",e=>{qx(e.clientX/innerWidth);qy(1-e.clientY/innerHeight)},{passive:true});
  const qs=gsap.quickTo(U,"scroll",{duration:1.2,ease:"power2.out"});
  addEventListener("scroll",()=>qs(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)),{passive:true});
  if(RM)return;
  const EASE="expo.out";
  function enhance(){const main=document.getElementById("main");if(!main)return;
    /* началото: заглавие, текст, бутони и числата влизат едно след друго */
    const hero=main.querySelector(".lp-hero:not([data-gs])");
    if(hero){hero.dataset.gs=1;const parts=[...hero.querySelectorAll(".lp-tag,.lp-kick,h1,.lp-lead,.lp-cta,.lp-free,.lp-sl-ui")].filter(Boolean);
      gsap.from(parts,{y:28,opacity:0,duration:1.25,ease:EASE,stagger:.08,delay:.15,clearProps:"transform,opacity"});
      const stats=main.querySelector(".lp-stats");if(stats)gsap.from(stats,{y:40,opacity:0,duration:1.25,ease:EASE,delay:.5,clearProps:"transform,opacity"})}
    /* секции: заглавието и картите се появяват при скрол, на групи */
    main.querySelectorAll(".lp-sect:not([data-gs])").forEach(sec=>{sec.dataset.gs=1;
      const h=sec.querySelector(".lp-h,.lp-qa-side");if(h)gsap.from(h,{y:36,opacity:0,duration:1.25,ease:EASE,clearProps:"transform,opacity",scrollTrigger:{trigger:h,start:"top 88%",once:true}});
      const items=sec.querySelectorAll(".lp-card,.lp-feat>li,.steps>li,.lp-gal>a,.lp-plan,.lp-qa-main>*");
      if(items.length)ST.batch(items,{start:"top 92%",once:true,onEnter:b=>gsap.from(b,{y:48,opacity:0,duration:1.25,ease:EASE,stagger:.07,clearProps:"transform,opacity"})})});
    /* вътрешни страници: картите и блоковете се появяват меко */
    main.querySelectorAll(".card:not([data-gs]),.sec:not([data-gs])").forEach(c=>{c.dataset.gs=1;gsap.from(c,{y:24,opacity:0,duration:1,ease:EASE,clearProps:"transform,opacity",scrollTrigger:{trigger:c,start:"top 94%",once:true}})});
    /* карти: лек наклон към курсора и метален отблясък, който го следва */
    main.querySelectorAll(".lp-card:not([data-tilt]),.lp-feat>li:not([data-tilt]),.lp-plan:not([data-tilt])").forEach(c=>{c.dataset.tilt=1;
      const rx=gsap.quickTo(c,"rotationX",{duration:.8,ease:"power3.out"}),ry=gsap.quickTo(c,"rotationY",{duration:.8,ease:"power3.out"});gsap.set(c,{transformPerspective:900});
      c.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
        rx((.5-y)*5);ry((x-.5)*6);c.style.setProperty("--mx",(x*100)+"%");c.style.setProperty("--my",(y*100)+"%");c.style.setProperty("--sheen",1)});
      c.addEventListener("pointerleave",()=>{rx(0);ry(0);c.style.setProperty("--sheen",0)})});
    ST.refresh()}
  enhance();
  const main=document.getElementById("main");if(main)new MutationObserver(()=>requestAnimationFrame(enhance)).observe(main,{childList:true});
}
})();
