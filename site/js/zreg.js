/* ===== Регистриране на тема от отделен файл (след sys2.js) =====
   zRegister("foo",{name,view,book,tests,exp,gl,stage,en,enRe})
   - name: кратко име за статистиките (MOD_NAMES);
   - view: функция view(main), която изгражда раздела „Симулация“ (обикновено mkSim + по желание zAddStg/3D);
   - book: {title, adv, lead, secs:[{h,html,fig?,cap?}], key:[…]} — раздел „Теория“;
   - tests: [{q,opts,a,expl}] — раздел „Тест“; exp: експериментите на симулацията (същият формат);
   - gl: [{t,re,d}] — речник; stage: поетапен 3D изглед за урока (по желание);
   - en/enRe: английските преводи на всички нови текстове (обединяват се с window.__EN / __EN_RE).
   Темата трябва да е добавена и в SYLLABUS в index.html (менюто се чете веднъж при зареждане). */
(function(){"use strict";
window.zRegister=function(id,o){
  if(o.en)Object.assign(window.__EN=window.__EN||{},o.en);
  if(o.enRe)Object.assign(window.__EN_RE=window.__EN_RE||{},o.enRe);
  if(o.book)BOOK[id]=o.book;
  if(o.tests)TESTS[id]=o.tests;
  if(o.name)MOD_NAMES[id]=o.name;
  if(o.view)VIEWS[id]=o.view;
  if(o.stage)STAGES[id]=o.stage;
  if(o.exp){window.__EXTRA_EXP=window.__EXTRA_EXP||{};window.__EXTRA_EXP[id]=o.exp}
  if(o.gl&&o.gl.length){o.gl.forEach(n=>{if(!GL.some(g=>g.t===n.t))GL.push(n)});
    GL.forEach((g,i)=>{g.id=i;g.rx=new RegExp(g.re,"gi")});
    GL_ORDER.length=0;[...GL].sort((a,b)=>b.t.split(/\s+/).length-a.t.split(/\s+/).length).forEach(g=>GL_ORDER.push(g))}
  if(location.hash.slice(1)===id){try{route()}catch(e){console.error(e)}}
};
})();
