/* ===== Мобилно приложение (Capacitor): включва се само вътре в приложението за Android/iOS.
   В браузъра не прави нищо. Адресът на сайта е в js/config.js (siteUrl). ===== */
(function(){"use strict";
const Cap=window.Capacitor;if(!Cap||!Cap.isNativePlatform||!Cap.isNativePlatform())return;
const P=Cap.Plugins||{},C=window.PHYS_CFG||{},platform=Cap.getPlatform();
const SITE=String(C.siteUrl||"").replace(/\/$/,"");
const SCHEME="com.physionova.app",AUTH_CB=SCHEME+"://auth";
window.PHYS_NATIVE={platform,site:SITE};
const html=document.documentElement;html.classList.add("native","native-"+platform);

// --- екранът да стига до ръбовете (под изреза и долната лента на iPhone) ---
const vp=document.querySelector('meta[name="viewport"]');
if(vp&&!/viewport-fit/.test(vp.content))vp.content+=", viewport-fit=cover";
const st=document.createElement("style");st.id="native-css";st.textContent=`
html.native,html.native body{overscroll-behavior:none;-webkit-tap-highlight-color:transparent}
html.native body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html.native input,html.native textarea,html.native [contenteditable],html.native .legal,html.native .book{-webkit-user-select:text;user-select:text}
`;document.head.appendChild(st);

// --- сървърните функции (/api/...) са на сайта, не в приложението ---
if(SITE){const f0=window.fetch.bind(window);
  window.fetch=(u,o)=>{if(typeof u==="string"&&u.startsWith("/api/"))u=SITE+u;return f0(u,o)}}
else console.warn("PhysioNova: няма siteUrl в js/config.js — плащането няма да работи в приложението");

// --- лента най-горе и начален екран ---
try{P.StatusBar&&P.StatusBar.setStyle({style:"DARK"});if(platform==="android"&&P.StatusBar)P.StatusBar.setBackgroundColor({color:"#000000"})}catch(e){}
addEventListener("load",()=>{try{P.SplashScreen&&P.SplashScreen.hide()}catch(e){}});

// --- външните връзки се отварят в браузъра на телефона ---
const openExt=url=>{try{if(P.Browser)return P.Browser.open({url,presentationStyle:"popover"})}catch(e){}window.open(url,"_system")};
document.addEventListener("click",ev=>{const a=ev.target.closest&&ev.target.closest("a[href]");if(!a)return;const h=a.getAttribute("href");
  if(/^(mailto:|tel:)/i.test(h))return;
  if(/^https?:\/\//i.test(h)&&new URL(h).host!==location.host){ev.preventDefault();openExt(h)}},true);

// --- бутонът „назад“ на Android: назад в приложението, а от началото — изход ---
if(P.App)P.App.addListener("backButton",({canGoBack})=>{
  const h=location.hash.replace(/^#/,"");
  if(document.querySelector(".modal.open,.sheet.open,dialog[open]")){history.back();return}
  if(canGoBack&&h&&h!=="home")history.back();else if(h&&h!=="home")location.hash="home";else P.App.exitApp()});

// --- вход с Google: през браузъра на телефона и обратно в приложението ---
function patchSB(){const SB=window.PHYS_SB;if(!SB||SB.__native)return;SB.__native=true;
  SB.google=async()=>{const {data,error}=await SB.client.auth.signInWithOAuth({provider:"google",options:{redirectTo:AUTH_CB,skipBrowserRedirect:true,queryParams:{prompt:"select_account"}}});
    if(error)throw error;await openExt(data.url)};
  // имейлите за потвърждение и нова парола водят към сайта; после влизаш в приложението с паролата
  if(SITE){const a=SB.client.auth,su=a.signUp.bind(a),rp=a.resetPasswordForEmail.bind(a);
    a.signUp=c=>{if(c&&c.options)c.options.emailRedirectTo=SITE+"/#me";return su(c)};
    a.resetPasswordForEmail=(e,o)=>rp(e,Object.assign({},o,{redirectTo:SITE+"/#me"}))}}
patchSB();
if(P.App)P.App.addListener("appUrlOpen",async({url})=>{if(!url||!url.startsWith(AUTH_CB))return;
  try{P.Browser&&P.Browser.close()}catch(e){}
  const q=new URLSearchParams((url.split("?")[1]||"").split("#")[0]),code=q.get("code");
  if(code&&window.PHYS_SB){try{await PHYS_SB.client.auth.exchangeCodeForSession(code)}catch(e){console.error(e)}}
  location.hash="me";location.reload()});

// --- след плащане в браузъра: при връщане в приложението проверяваме покупката ---
if(P.App)P.App.addListener("appStateChange",async({isActive})=>{if(!isActive||!window.PHYS_SB)return;
  const pend=+(localStorage.getItem("fizsim_pay_pending")||0);if(!pend||Date.now()-pend>7*864e5)return;
  try{await PHYS_SB.ready;if(await PHYS_SB.confirm())location.reload()}catch(e){}});
})();
