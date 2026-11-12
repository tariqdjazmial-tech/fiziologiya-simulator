/* ===== Сървърна версия: вход, профили, кодове и покупки през Supabase + Stripe.
   Включва се само ако в js/config.js има supabaseUrl; иначе приложението работи както досега. ===== */
(function(){"use strict";
const C=window.PHYS_CFG||{};if(!C.supabaseUrl||!C.supabaseAnon||!window.supabase)return;
const sb=window.supabase.createClient(C.supabaseUrl,C.supabaseAnon,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,flowType:"pkce",lock:(n,t,fn)=>fn()}});
const SB=window.PHYS_SB={client:sb,uid:null,email:null,admin:false,profile:null};
const ts=v=>v?Date.parse(v):0;
// профил от Supabase → обектът, който очаква останалото приложение
SB.me=()=>{const p=SB.profile;if(!p)return null;return {first:p.first||"",last:p.last||"",email:p.email||SB.email||"",inst:p.inst||"",purpose:p.purpose||"",other:p.other||"",lang:p.lang||"bg",at:ts(p.created_at),codeHash:p.code_hash||(p.full_access?"paid":""),paid:!!p.full_access&&!p.code_hash,full:!!p.full_access}};
async function loadProfile(user){SB.uid=user?user.id:null;SB.email=user?user.email:null;SB.profile=null;SB.admin=false;if(!user)return;
  let {data:p}=await sb.from("profiles").select("*").eq("id",user.id).maybeSingle();
  if(!p){const m=user.user_metadata||{},nm=(m.full_name||m.name||"").split(" ");
    const row={id:user.id,email:user.email,first:m.first||nm[0]||"",last:m.last||nm.slice(1).join(" ")||"",inst:m.inst||"",purpose:m.purpose||"",other:m.other||"",lang:m.lang||window.PHYS_LANG||"bg"};
    const r=await sb.from("profiles").insert(row).select().maybeSingle();p=r.data||row;
    if(m.pending_code){try{await SB.claim(m.pending_code)}catch(e){}try{await sb.auth.updateUser({data:{pending_code:null}})}catch(e){}const r2=await sb.from("profiles").select("*").eq("id",user.id).maybeSingle();if(r2.data)p=r2.data}}
  SB.profile=p;try{const {data}=await sb.rpc("is_admin");SB.admin=!!data}catch(e){SB.admin=false}}
SB.oauthErr=(()=>{const q=new URLSearchParams(location.search+"&"+location.hash.replace(/^#/,""));return q.get("error_description")||q.get("error")||""})();
SB.ready=(async()=>{try{const code=new URLSearchParams(location.search).get("code");
  if(code){try{const r=await Promise.race([sb.auth.exchangeCodeForSession(code),new Promise(res=>setTimeout(()=>res({error:{message:"timeout"}}),12000))]);if(r&&r.error)SB.oauthErr=r.error.message||String(r.error)}catch(e){SB.oauthErr=e.message||String(e)}
    history.replaceState(null,"",location.pathname+"#me")}
  const {data:{session}}=await sb.auth.getSession();await loadProfile(session&&session.user)}catch(e){console.error(e)}
  // след плащане: сървърът проверява в Stripe и отключва профила
  const back=/[?&]paid=1/.test(location.search),pend=+(localStorage.getItem("fizsim_pay_pending")||0);
  if(SB.uid&&!(SB.profile&&SB.profile.full_access)&&(back||(pend&&Date.now()-pend<7*864e5))){for(let i=0;i<(back?5:1);i++){if(await SB.confirm())break;await new Promise(r=>setTimeout(r,2000))}}
  if(back)history.replaceState(null,"",location.pathname+location.hash)
  if(/[?&](login=google|code=|error=)/.test(location.search)||/error_description=/.test(location.hash)){history.replaceState(null,"",location.pathname+"#me")}
  return SB})();
sb.auth.onAuthStateChange((ev,session)=>{if(ev==="SIGNED_OUT"){SB.uid=null;SB.profile=null;SB.admin=false}});
const sha=async s=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,"0")).join("");
SB.codeHash=c=>sha("fizio:"+String(c||"").toUpperCase().replace(/[^A-Z0-9]/g,""));
SB.claim=async code=>{const h=await SB.codeHash(code);const {data,error}=await sb.rpc("claim_code",{p_hash:h});if(error)throw error;return {res:data,hash:h}};
SB.check=async code=>{const h=await SB.codeHash(code);const {data,error}=await sb.rpc("check_code",{p_hash:h});if(error)throw error;return data};
SB.signUp=async d=>{const meta={first:d.first,last:d.last,inst:d.inst,purpose:d.purpose,other:d.other||"",lang:window.PHYS_LANG||"bg",pending_code:d.code||null};
  const {data,error}=await sb.auth.signUp({email:d.email,password:d.pass,options:{data:meta,emailRedirectTo:location.origin+location.pathname+"#me"}});if(error)throw error;
  if(data.session){await loadProfile(data.user);return {confirm:false}}return {confirm:true}};
SB.signIn=async(email,pass)=>{const {data,error}=await sb.auth.signInWithPassword({email,password:pass});if(error)throw error;await loadProfile(data.user)};
SB.refresh=async()=>{const {data:{user}}=await sb.auth.getUser();await loadProfile(user)};
SB.signOut=async()=>{await sb.auth.signOut();SB.uid=null;SB.profile=null;SB.admin=false};
SB.google=async()=>{const {error}=await sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+"/",queryParams:{prompt:"select_account"}}});if(error)throw error};
SB.reset=email=>sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname+"#me"});
SB.push=async p=>{if(!SB.uid)return false;const {error}=await sb.from("profiles").update(Object.assign({seen_at:new Date().toISOString()},p)).eq("id",SB.uid);return !error};
SB.confirm=async()=>{try{const {data:{session}}=await sb.auth.getSession();if(!session)return false;const r=await fetch("/api/confirm",{method:"POST",headers:{"Authorization":"Bearer "+session.access_token}});const j=await r.json().catch(()=>({}));
  if(j.full){localStorage.removeItem("fizsim_pay_pending");const {data}=await sb.from("profiles").select("*").eq("id",SB.uid).maybeSingle();if(data)SB.profile=data;return true}}catch(e){}return false};
SB.buy=async()=>{const {data:{session}}=await sb.auth.getSession();if(!session)throw new Error("auth");
  const r=await fetch("/api/checkout",{method:"POST",headers:{"Authorization":"Bearer "+session.access_token,"Content-Type":"application/json"},body:JSON.stringify({lang:window.PHYS_LANG||"bg",back:location.origin+location.pathname})});
  const j=await r.json().catch(()=>({}));if(j.error==="already"){await SB.confirm();location.reload();return}if(!r.ok||!j.url)throw new Error((j.detail||j.error||"checkout")+" ("+r.status+")");localStorage.setItem("fizsim_pay_pending",String(Date.now()));location.href=j.url};
// --- база за админ страницата: същият интерфейс като в claude.ai версията ---
const snap=(id,d)=>({id,exists:d!=null,data:()=>d,metadata:{fromCache:false}});
const rows={
 regs:async()=>{const {data,error}=await sb.from("profiles").select("*").limit(5000);if(error)throw error;return data.map(p=>snap(p.id,{first:p.first,last:p.last,email:p.email,inst:p.inst,purpose:p.purpose,other:p.other,lang:p.lang,at:ts(p.created_at),seen:ts(p.seen_at),opened:p.opened,ans:p.ans,tot:p.tot,tp:p.tp,dn:p.dn,dev:p.dev,days:p.days,codeHash:p.code_hash||"",paid:!!p.full_access&&!p.code_hash}))},
 admcodes:async()=>{const {data,error}=await sb.from("codes").select("*").limit(5000);if(error)throw error;return data.map(c=>snap(c.hash,{code:c.code,label:c.label,at:ts(c.created_at),revoked:c.revoked_at?ts(c.revoked_at):0}))},
 claims:async()=>{const {data,error}=await sb.from("codes").select("hash,used_by,used_at").not("used_by","is",null).limit(5000);if(error)throw error;return data.map(c=>snap(c.used_by,{hash:c.hash,at:ts(c.used_at)}))},
 purchases:async()=>{const {data,error}=await sb.from("purchases").select("*").limit(5000);if(error)throw error;return data.map(x=>snap(String(x.id),{user:x.user_id,amount:x.amount,currency:x.currency,email:x.email,at:ts(x.created_at)}))}};
const coll=name=>{const q={limit:()=>q,where:()=>q,get:async()=>{const docs=rows[name]?await rows[name]():[];return {docs,size:docs.length,empty:!docs.length}}};return q};
const doc=path=>{const [c,id]=path.split("/");return {
  get:async()=>{if(c==="codes"){const {data}=await sb.from("codes").select("hash,revoked_at").eq("hash",id).maybeSingle();return snap(id,data&&!data.revoked_at?{}:null)}return snap(id,null)},
  set:async d=>{if(c==="admcodes"){const {error}=await sb.from("codes").insert({hash:id,code:d.code,label:d.label||null});if(error)throw error}},
  update:async()=>{},
  delete:async()=>{if(c==="codes"){const {error}=await sb.rpc("revoke_code",{p_hash:id});if(error)throw error}else if(c==="regs"){const {error}=await sb.from("profiles").delete().eq("id",id);if(error)throw error}}}};
SB.db={doc,collection:coll};
})();
