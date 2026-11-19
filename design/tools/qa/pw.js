const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const TH=process.env.SP+'/three/package';
async function open(hash,{lang='bg',w=1400,h=900,patch=null}={}){
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:w,height:h}});
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.route(/three(\.min)?\.js$|three@0\.128\.0\/examples/,r=>{const u=r.request().url();let f=u.includes('examples')?TH+'/examples'+u.split('/examples')[1]:TH+'/build/three.min.js';
   if(fs.existsSync(f))r.fulfill({path:f,contentType:'application/javascript'});else r.abort()});
 await p.route(/^https?:\/\/(?!localhost)(?!.*three)/,r=>r.abort());
 if(patch)for(const [rx,fn] of patch)await p.route(rx,async r=>{const resp=await r.fetch();r.fulfill({response:resp,body:fn(await resp.text())})});/*opts.patch*/
 await p.addInitScript(l=>{localStorage.setItem('fizsim_lang',JSON.stringify(l));localStorage.setItem('fizsim_auth_seen','1');
   Object.defineProperty(window,'__introPick',{get:()=>'none',set:()=>{}});let c;Object.defineProperty(window,'PHYS_CFG',{configurable:true,get:()=>c,set:v=>{c=Object.assign({},v,{testOpen:true})}})},lang);
 await p.goto('http://localhost:8765/index.html#'+hash,{waitUntil:'domcontentloaded'});await p.waitForTimeout(4000);try{await p.getByText(/^(SKIP|Skip|Пропусни)$/i).first().click({timeout:3000})}catch(e){}await p.evaluate(()=>{const o=document.getElementById('hxo');if(o)o.remove()});await p.waitForTimeout(4000);return {b,p}}
module.exports={open};
