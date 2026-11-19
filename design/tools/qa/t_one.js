const {open}=require('./pw.js');
(async()=>{const [topic,n,tag]=process.argv.slice(2);const {b,p}=await open(topic,{w:1280,h:900});p.on('pageerror',e=>console.log('ERR',e.message));
 await p.click('[role=tab][data-tab=sim]',{timeout:3000}).catch(()=>{});await p.waitForTimeout(12000);
 const vi=+(process.env.V||0);
 await p.evaluate(vi=>{const bs=[...document.querySelectorAll('#main button')].filter(b=>/Следваща стъпка/.test(b.textContent));const cards=[];bs.forEach(b=>{let c=b.parentElement;while(c&&!(c.querySelector('canvas'))&&c.id!=='main')c=c.parentElement;if(c&&cards.indexOf(c)<0)cards.push(c)});cards[vi].setAttribute('data-sv','x');cards[vi].scrollIntoView({block:'center'})},vi);
 for(let i=0;i<+n;i++){await p.evaluate(()=>{const c=document.querySelector('[data-sv=x]');[...c.querySelectorAll('button')].find(b=>/Следваща стъпка/.test(b.textContent)).click()});await p.waitForTimeout(1500)}
 await p.waitForTimeout(4000);const cv=await p.evaluateHandle(()=>{const c=document.querySelector('[data-sv=x]');return [...c.querySelectorAll('canvas')].filter(x=>x.offsetWidth>200).sort((a,b)=>b.offsetWidth*b.offsetHeight-a.offsetWidth*a.offsetHeight)[0]});
 await cv.asElement().screenshot({path:process.env.SP+'/one_'+tag+'.png'});await b.close()})();
