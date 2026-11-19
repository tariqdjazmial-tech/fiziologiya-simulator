const {open}=require('./pw.js');const fs=require('fs');
(async()=>{for(const topic of process.argv.slice(2)){let b,p;try{({b,p}=await open(topic,{w:1280,h:900}));
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.click('[role=tab][data-tab=sim]',{timeout:3000}).catch(()=>{});await p.waitForTimeout(12000);
 // mark stage viewers
 const n=await p.evaluate(()=>{const bs=[...document.querySelectorAll('#main button')].filter(b=>/Следваща стъпка/.test(b.textContent));const cards=[];bs.forEach(b=>{let c=b.parentElement;while(c&&!(c.querySelector('canvas'))&&c.id!=='main')c=c.parentElement;if(c&&cards.indexOf(c)<0)cards.push(c)});cards.forEach((c,i)=>c.setAttribute('data-sv',i));return cards.length});
 const meta={topic,viewers:[]};
 for(let v=0;v<n;v++){const sel=`[data-sv="${v}"]`;
  const info=await p.evaluate(sel=>{const c=document.querySelector(sel);c.scrollIntoView({block:'center'});const items=[...c.querySelectorAll('[data-i],li,.stl button,.steps button')].length;const t=c.querySelector('h3,h2');return {title:t?t.textContent.slice(0,80):'',items}},sel);
  const shots=[];for(let s=0;s<10;s++){await p.waitForTimeout(s?3500:2500);
    const cv=await p.evaluateHandle(sel=>{const c=document.querySelector(sel);const cs=[...c.querySelectorAll('canvas')].filter(x=>x.offsetWidth>200);return cs.sort((a,b)=>b.offsetWidth*b.offsetHeight-a.offsetWidth*a.offsetHeight)[0]},sel);
    const f=`${process.env.SP}/sheets/${topic}_${v}_${s}.png`;try{await cv.asElement().screenshot({path:f});shots.push(f)}catch(e){break}
    const lab=await p.evaluate(sel=>{const c=document.querySelector(sel);const bt=[...c.querySelectorAll('button')].find(b=>/Следваща стъпка/.test(b.textContent));const before=c.innerText.slice(0,4000);bt.click();return before.length},sel);
    const end=await p.evaluate(sel=>{const c=document.querySelector(sel);const bt=[...c.querySelectorAll('button')].find(b=>/Следваща стъпка/.test(b.textContent));return bt.disabled},sel);if(end&&s>0){await p.waitForTimeout(3500);try{const f2=`${process.env.SP}/sheets/${topic}_${v}_${s+1}.png`;await cv.asElement().screenshot({path:f2});shots.push(f2)}catch(e){}break}}
  meta.viewers.push({...info,shots})}
 // other big webgl canvases outside stage viewers
 const others=await p.evaluate(()=>{const cs=[...document.querySelectorAll('#main canvas')].filter(x=>x.offsetWidth>300&&!x.closest('[data-sv]'));cs.forEach((c,i)=>c.setAttribute('data-oc',i));return cs.length});
 for(let i=0;i<others;i++){const h=await p.$(`[data-oc="${i}"]`);await h.scrollIntoViewIfNeeded().catch(()=>{});await p.waitForTimeout(1500);const f=`${process.env.SP}/sheets/${topic}_o${i}.png`;try{await h.screenshot({path:f});meta.viewers.push({title:'other',shots:[f]})}catch(e){}}
 meta.errs=[...new Set(errs)].slice(0,8);fs.writeFileSync(`${process.env.SP}/sheets/${topic}.json`,JSON.stringify(meta));console.log(topic,n,others,meta.errs.length)}catch(e){console.log(topic,'FAIL',e.message.slice(0,150))}finally{if(b)await b.close()}}})();
