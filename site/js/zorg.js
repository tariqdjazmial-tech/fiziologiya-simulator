/* ===== 2D симулации: органите се рисуват като анатомични икони вместо цветни кутии ===== */
(function(){if(typeof Z==="undefined")return;
const P=d=>new Path2D(d);
// всяка икона: пътища в кутия 100×100, основен цвят, тъмен контур и детайли
const IC={
 liver:{c:"#b8553f",d:"M6,42 C8,22 40,12 72,16 C90,18 98,30 94,42 C88,58 68,64 52,74 C40,82 26,86 16,78 C6,68 4,54 6,42Z",x:g=>{g.strokeStyle="rgba(90,30,20,.55)";g.lineWidth=2;g.stroke(P("M58,18 C54,36 50,54 44,76"));g.fillStyle="#6aa84f";g.fill(P("M40,70 C34,74 32,86 40,90 C48,92 52,82 48,74Z"))}},
 kidney:{c:"#b84a4a",d:"M58,8 C30,6 14,30 16,52 C18,80 38,96 60,92 C76,88 78,72 66,62 C58,54 58,46 66,38 C80,28 78,10 58,8Z",x:g=>{g.strokeStyle="#c92a2a";g.lineWidth=5;g.lineCap="round";g.stroke(P("M64,44 C76,42 86,40 96,38"));g.strokeStyle="#1c63b0";g.stroke(P("M64,54 C76,56 86,58 96,60"));g.strokeStyle="#e8c35a";g.lineWidth=4;g.stroke(P("M62,60 C66,74 70,86 72,98"));g.strokeStyle="rgba(255,255,255,.45)";g.lineWidth=1.6;g.stroke(P("M30,34 C26,46 26,60 32,72"))}},
 brain:{c:"#e899a6",d:"M12,58 C4,36 22,14 48,12 C72,10 94,24 94,48 C94,64 84,74 70,72 L64,72 C62,84 54,90 46,86 L42,76 C28,78 16,72 12,58Z",x:g=>{g.strokeStyle="rgba(140,50,70,.55)";g.lineWidth=1.8;["M24,40 C30,30 40,34 42,26","M48,20 C50,30 58,32 64,24","M70,30 C66,40 76,46 84,42","M22,58 C34,54 40,62 52,56","M56,48 C62,58 74,54 80,60","M36,44 C44,40 50,48 58,40"].forEach(d=>g.stroke(P(d)));g.fillStyle="#c97b88";g.fill(P("M64,72 C66,80 72,86 80,86 C88,84 92,76 88,70 C82,74 74,74 64,72Z"))}},
 hypo:{c:"#e7b8c2",d:"M10,56 C4,34 22,12 48,10 C72,8 94,22 94,46 C94,62 84,72 70,70 L60,70 C56,80 48,86 40,82 L36,72 C24,74 14,68 10,56Z",x:g=>{g.fillStyle="#9c36b5";g.beginPath();g.ellipse(52,58,9,6,0,0,7);g.fill();g.strokeStyle="#7a4b8f";g.lineWidth=3;g.stroke(P("M52,64 L54,78"));g.fillStyle="#3b6fd0";g.beginPath();g.ellipse(55,82,7,5.5,0,0,7);g.fill()}},
 pit:{c:"#7da6e8",d:"M38,58 C38,40 62,40 62,58 C64,76 54,86 50,86 C46,86 36,76 38,58Z",x:g=>{g.fillStyle="#e7b8c2";g.fill(P("M8,30 C14,10 86,10 92,30 C90,40 70,42 56,40 L44,40 C30,42 10,40 8,30Z"));g.strokeStyle="#9a6b78";g.lineWidth=5;g.lineCap="round";g.stroke(P("M50,40 L50,50"));g.fillStyle="#a8c4f2";g.fill(P("M50,52 C60,52 62,62 60,72 C58,80 50,84 50,84Z"))}},
 thyroid:{c:"#c9623f",d:"M50,42 C44,36 40,20 28,20 C14,20 12,48 16,64 C20,80 34,80 40,70 C44,62 47,58 50,58 C53,58 56,62 60,70 C66,80 80,80 84,64 C88,48 86,20 72,20 C60,20 56,36 50,42Z",b:g=>{g.fillStyle="#d8dee6";g.fillRect(42,4,16,94);g.strokeStyle="#aab4c2";g.lineWidth=2;for(let y=10;y<96;y+=9){g.beginPath();g.moveTo(42,y);g.lineTo(58,y);g.stroke()}}},
 para:{c:"#c9623f",d:"M50,42 C44,36 40,20 28,20 C14,20 12,48 16,64 C20,80 34,80 40,70 C44,62 47,58 50,58 C53,58 56,62 60,70 C66,80 80,80 84,64 C88,48 86,20 72,20 C60,20 56,36 50,42Z",o:.45,x:g=>{[[22,32],[78,32],[24,66],[76,66]].forEach(([x,y])=>{g.fillStyle="#f2c94c";g.strokeStyle="#a37b00";g.lineWidth=1.4;g.beginPath();g.ellipse(x,y,7,5.5,0,0,7);g.fill();g.stroke()})}},
 muscle:{c:"#c4474f",d:"M6,50 C24,24 76,24 94,50 C76,76 24,76 6,50Z",x:g=>{g.strokeStyle="rgba(90,10,20,.4)";g.lineWidth=1.3;for(let i=-3;i<=3;i++)g.stroke(P(`M12,50 C34,${50+i*7} 66,${50+i*7} 88,50`));g.fillStyle="#f3ead8";g.fill(P("M0,46 L8,46 L8,54 L0,54Z"));g.fill(P("M92,46 L100,46 L100,54 L92,54Z"))},b:g=>{g.fillStyle="#f6e6b8";g.beginPath();g.ellipse(80,74,16,10,0,0,7);g.fill();g.strokeStyle="#c9a24a";g.lineWidth=1.2;g.stroke()}},
 gut:{tube:1,c:"#eb9c86",d:"M18,22 C18,10 82,10 82,22 C82,34 18,34 18,46 C18,58 82,58 82,70 C82,82 30,82 30,92"},
 colon:{tube:1,c:"#d98a74",d:"M20,92 L20,24 C20,12 80,12 80,24 L80,90"},
 pancreas:{c:"#ebb75c",d:"M8,62 C14,46 38,50 54,42 C70,34 84,26 94,34 C98,42 88,50 74,54 C60,58 44,66 30,72 C18,76 4,74 8,62Z",x:g=>{g.fillStyle="rgba(150,95,10,.35)";for(let i=0;i<10;i++){g.beginPath();g.arc(20+i*7.5,62-i*2.6,2.2,0,7);g.fill()}g.strokeStyle="#5aa05a";g.lineWidth=3;g.stroke(P("M8,62 C30,58 60,46 92,34"))}},
 stomach:{c:"#ef9a9a",d:"M38,6 L52,6 L52,26 C64,22 84,30 88,52 C92,76 72,94 46,92 C26,90 12,76 20,60 C26,50 36,48 38,36Z",x:g=>{g.strokeStyle="rgba(140,40,50,.45)";g.lineWidth=1.6;["M30,62 C44,56 60,64 76,56","M28,74 C44,68 60,76 78,68","M40,84 C52,80 62,84 72,80"].forEach(d=>g.stroke(P(d)))}},
 gall:{c:"#5f9e4f",d:"M44,10 C56,10 56,26 58,34 C64,48 74,62 70,78 C66,92 40,94 32,80 C24,66 38,48 40,34 C42,24 38,10 44,10Z"},
 bone:{c:"#efe3c2",s:"#a8946a",d:"M18,12 C28,2 40,10 38,22 L76,62 C88,58 98,70 90,80 C96,90 82,100 74,92 C64,96 56,86 62,76 L24,38 C12,40 4,26 12,20 C8,14 14,10 18,12Z",x:g=>{g.strokeStyle="rgba(120,100,60,.45)";g.lineWidth=1.4;g.stroke(P("M36,30 L70,66"))}},
 heart:{c:"#c9453f",d:"M50,90 C30,76 8,58 10,36 C12,18 32,10 44,22 L50,28 L56,22 C68,10 88,18 90,36 C92,58 70,76 50,90Z"},
 nerve:{nv:1,c:"#e8a33d"},
 cell:{cell:1,c:"#e7a58c"},
 tissue:{tis:1,c:"#7fc79a"},
 mol:{mol:1,c:"#20a3a3"},
 blood:{bl:1,c:"#d9434e"}
};
const PICK=[[/Черен дроб|Liver/i,"liver"],[/Бъбрек|Kidney/i,"kidney"],[/Мозък|Brain/i,"brain"],[/Хипоталамус|Hypothal/i,"hypo"],[/хипофиз|pituitar/i,"pit"],[/Околощитовидн|Parathyr/i,"para"],[/Щитовидна|Thyroid/i,"thyroid"],[/Мускул|Muscle/i,"muscle"],[/Дуоден|Duoden/i,"gut"],[/Черво|Gut|Intestin/i,"gut"],[/Панкреас|Pancrea/i,"pancreas"],[/Стомах|Stomach/i,"stomach"],[/Жлъчен|Gallbl/i,"gall"],[/Кост|Bone/i,"bone"],[/Сърце|Heart/i,"heart"],[/Вагус|Симпатикус|Vagus|Sympath/i,"nerve"],[/Тъкани|Tissue/i,"tissue"],[/Калцитриол|Calcitriol/i,"mol"],[/клетка|^G-|^D-|Париетална|^S$|^I$|cell/i,"cell"]];
const shade=(c,k)=>{const n=parseInt(c.slice(1),16);let r=n>>16,gg=n>>8&255,b=n&255;const f=v=>Math.round(k<0?v*(1+k):v+(255-v)*k);return `rgb(${f(r)},${f(gg)},${f(b)})`};
function icon(g,key,x,y,s,act){const I=IC[key];if(!I)return;g.save();g.translate(x,y);g.scale(s/100,s/100);
 if(I.b){g.save();I.b(g);g.restore()}
 if(I.tube){const p=P(I.d);g.lineCap="round";g.lineJoin="round";g.strokeStyle=shade(I.c,-0.4);g.lineWidth=17;g.stroke(p);g.strokeStyle=I.c;g.lineWidth=13;g.stroke(p);g.strokeStyle="rgba(255,255,255,.45)";g.lineWidth=3.5;g.stroke(p);g.strokeStyle="rgba(120,40,30,.35)";g.lineWidth=1;g.setLineDash([2,5]);g.stroke(p);g.setLineDash([])}
 else if(I.nv){g.strokeStyle=shade(I.c,-0.35);g.lineWidth=4;g.lineCap="round";g.stroke(P("M30,50 C50,48 60,58 92,54"));g.lineWidth=2.2;["M24,42 L8,30","M22,56 L6,64","M30,40 L28,22"].forEach(d=>g.stroke(P(d)));for(let i=0;i<3;i++){g.fillStyle="#f3e2b0";g.strokeStyle="#b9954a";g.lineWidth=1;g.beginPath();g.ellipse(46+i*15,52+i*0.8,6,4.4,0,0,7);g.fill();g.stroke()}const gr=g.createRadialGradient(22,44,2,26,48,16);gr.addColorStop(0,shade(I.c,0.5));gr.addColorStop(1,I.c);g.fillStyle=gr;g.beginPath();g.arc(26,48,13,0,7);g.fill();g.strokeStyle=shade(I.c,-0.35);g.stroke();g.fillStyle=shade(I.c,-0.45);g.beginPath();g.arc(26,48,4.5,0,7);g.fill();[0,1,2].forEach(i=>{g.fillStyle="#f1c40f";g.beginPath();g.arc(94,48+i*6,2.6,0,7);g.fill()})}
 else if(I.cell||I.tis){const cells=I.tis?[[30,34,22],[70,32,20],[50,68,22],[16,70,12],[86,68,12]]:[[50,50,40]];cells.forEach(([cx,cy,r])=>{const gr=g.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);gr.addColorStop(0,shade(I.c,0.55));gr.addColorStop(1,I.c);g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();g.strokeStyle=shade(I.c,-0.35);g.lineWidth=2;g.stroke();g.fillStyle="#8e7cc3";g.beginPath();g.ellipse(cx+r*.15,cy+r*.1,r*.36,r*.3,0,0,7);g.fill();g.fillStyle="#4d3d85";g.beginPath();g.arc(cx+r*.2,cy+r*.05,r*.1,0,7);g.fill()})}
 else if(I.mol){g.strokeStyle=shade(I.c,-0.3);g.lineWidth=4;const hx=(cx,cy,r)=>{g.beginPath();for(let i=0;i<7;i++){const a=i*Math.PI/3+Math.PI/6;g[i?"lineTo":"moveTo"](cx+r*Math.cos(a),cy+r*Math.sin(a))}g.stroke()};hx(30,58,16);hx(58,42,16);hx(84,26,12);g.fillStyle="#ffd43b";g.strokeStyle="#c79100";g.lineWidth=2;g.beginPath();g.arc(22,22,10,0,7);g.fill();g.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(22+14*Math.cos(a),22+14*Math.sin(a));g.lineTo(22+19*Math.cos(a),22+19*Math.sin(a));g.stroke()}}
 else{const p=P(I.d),dk=I.s||shade(I.c,-0.38),gr=g.createLinearGradient(10,10,90,90);gr.addColorStop(0,shade(I.c,0.32));gr.addColorStop(.55,I.c);gr.addColorStop(1,shade(I.c,-0.18));
  g.save();g.shadowColor="rgba(20,33,58,.28)";g.shadowBlur=6;g.shadowOffsetY=2;g.globalAlpha=I.o||1;g.fillStyle=gr;g.fill(p);g.restore();g.globalAlpha=I.o||1;
  const hl=g.createRadialGradient(34,30,2,40,36,46);hl.addColorStop(0,"rgba(255,255,255,.55)");hl.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=hl;g.fill(p);g.globalAlpha=1;g.strokeStyle=dk;g.lineWidth=2.4;g.stroke(p);
  if(I.x)I.x(g)}
 g.restore();
 if(act>0.55){g.save();g.globalAlpha=Math.min(.5,(act-0.55)*1.2);g.strokeStyle="#fff3bf";g.lineWidth=3;g.beginPath();g.arc(x+s/2,y+s/2,s*0.56,0,7);g.stroke();g.restore()}}
const FONT=(s,w)=>RFONT(s,w);
function fit(g,s,max,fs,w){let f=fs;g.font=FONT(f,w);while(f>8.5&&g.measureText(s).width>max){f-=0.5;g.font=FONT(f,w)}return f}
const css2=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
Z.org=function(g,x,y,w,h,col,l1,l2,act=0.3){const a=Math.max(0,Math.min(1,act)),key=(PICK.find(([r])=>r.test(l1||""))||[])[1];
 const r=Math.min(12,h/3);g.save();
 // карта: светла плоча, тънка рамка в цвета на органа, лента за активност долу
 g.shadowColor="rgba(20,33,58,.12)";g.shadowBlur=8;g.shadowOffsetY=2;Z.box(g,x,y,w,h,css2("--panel")||"#fff",null,r);g.restore();
 Z.box(g,x,y,w,h,col,null,r,0,0.05+0.16*a);Z.box(g,x+0.5,y+0.5,w-1,h-1,null,col,r,1.2);
 g.save();g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h);g.clip();g.globalAlpha=.9;g.fillStyle=col;g.fillRect(x,y+h-3.5,w*(0.08+0.92*a),3.5);g.restore();
 const ink=css2("--ink")||"#14213a",mut=css2("--muted")||"#55627a";
 const tall=h>w*0.85&&h>=70,can=key&&h>=34&&w>=70;
 if(can&&tall){const s=Math.min(w-30,h-62);icon(g,key,x+(w-s)/2,y+6,s,a);const f=fit(g,l1,w-10,12.5,700);Z.T(g,x+w/2,y+s+21,l1,{w:700,fs:f,c:ink});if(l2){const f2=fit(g,l2,w-10,10.5,400);Z.T(g,x+w/2,y+s+34,l2,{fs:f2,c:mut})}return}
 const s0=Math.min(h-8,52);g.font=FONT(10.5,700);const need=Math.min(g.measureText(l1).width,110);
 if(can&&(w-s0-20)>=Math.max(64,need*0.82)){const s=s0,ix=x+6,tx=ix+s+8,mw=x+w-tx-6;icon(g,key,ix,y+(h-s)/2-1,s,a);
  const f=fit(g,l1,mw,12.5,700);Z.T(g,tx,y+h/2+(l2?-3:4),l1,{w:700,fs:f,a:"left",c:ink});if(l2){const f2=fit(g,l2,mw,10.5,400);Z.T(g,tx,y+h/2+11,l2,{fs:f2,a:"left",c:mut})}return}
 const f=fit(g,l1,w-8,12,700);Z.T(g,x+w/2,y+h/2+(l2?-2:4),l1,{w:700,fs:f,c:ink});if(l2){const f2=fit(g,l2,w-6,10,400);Z.T(g,x+w/2,y+h/2+12,l2,{fs:f2,c:mut})}};
window.__zicon=icon;
})();
/* ---- човешка фигура (изглед отпред) и крак за 2D симулациите ---- */
(function(){
const BODY=new Path2D("M60,4 C70,4 77,12 77,24 C77,34 72,42 67,45 L67,52 C80,54 92,58 97,66 C102,74 103,92 105,110 C107,128 110,146 112,160 C113,168 108,170 106,162 C103,148 99,130 95,114 C93,106 91,98 90,92 C89,110 89,130 90,146 C91,160 92,176 91,190 C90,214 87,240 86,262 C85,276 86,288 88,294 C84,298 76,298 74,294 C73,284 72,272 71,262 C69,240 66,218 63,196 L60,186 L57,196 C54,218 51,240 49,262 C48,272 47,284 46,294 C44,298 36,298 32,294 C34,288 35,276 34,262 C33,240 30,214 29,190 C28,176 29,160 30,146 C31,130 31,110 30,92 C29,98 27,106 25,114 C21,130 17,148 14,162 C12,170 7,168 8,160 C10,146 13,128 15,110 C17,92 18,74 23,66 C28,58 40,54 53,52 L53,45 C48,42 43,34 43,24 C43,12 50,4 60,4Z");
// cx — център, top — горе, h — височина в px, o.kx — ширина (затлъстяване), o.fill — цвят, o.core — цвят на ядрото
window.__body=function(g,cx,top,h,o={}){const k=h/300,kx=o.kx||1;g.save();g.translate(cx,top);g.scale(k*kx,k);g.translate(-60,0);
 g.save();g.shadowColor="rgba(20,33,58,.22)";g.shadowBlur=10;g.shadowOffsetY=3;g.fillStyle=o.fill||"#e8b896";g.fill(BODY);g.restore();
 g.save();g.clip(BODY);
 if(o.core){const r=g.createRadialGradient(60,120,6,60,128,70);r.addColorStop(0,o.core);r.addColorStop(.7,o.core);r.addColorStop(1,"rgba(0,0,0,0)");g.globalAlpha=.92;g.fillStyle=r;g.beginPath();g.ellipse(60,128,30,62,0,0,7);g.fill();const r2=g.createRadialGradient(60,24,2,60,26,16);r2.addColorStop(0,o.core);r2.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=r2;g.beginPath();g.arc(60,26,16,0,7);g.fill();g.globalAlpha=1}
 const sh=g.createLinearGradient(0,0,120,0);sh.addColorStop(0,"rgba(0,0,0,.18)");sh.addColorStop(.3,"rgba(255,255,255,.12)");sh.addColorStop(.62,"rgba(255,255,255,0)");sh.addColorStop(1,"rgba(0,0,0,.2)");g.fillStyle=sh;g.fillRect(0,0,120,300);
 g.strokeStyle="rgba(90,50,30,.22)";g.lineWidth=1.2;g.stroke(new Path2D("M45,64 C52,70 68,70 75,64 M60,72 L60,150 M42,150 C50,158 70,158 78,150 M60,186 L60,196"));
 g.restore();g.strokeStyle=o.stroke||"rgba(110,60,40,.55)";g.lineWidth=1.4/k;g.stroke(BODY);g.restore()};
// крак отстрани: бедро хоризонтално до коляното (kx,ky), подбедрица под ъгъл a; act — активация на четириглавия мускул
window.__leg=function(g,kx,ky,a,act,hold){const SK="#e9bc9b",SKD="#b27a5a";g.save();g.lineJoin="round";
 const th=new Path2D(`M4,${ky-30} C40,${ky-36} ${kx-40},${ky-26} ${kx-4},${ky-18} C${kx+16},${ky-12} ${kx+16},${ky+14} ${kx-2},${ky+18} C${kx-40},${ky+24} 40,${ky+30} 4,${ky+26}Z`);
 g.save();g.shadowColor="rgba(20,33,58,.2)";g.shadowBlur=8;g.shadowOffsetY=2;g.fillStyle=SK;g.fill(th);g.restore();
 g.save();g.clip(th);const q=new Path2D(`M14,${ky-26} C50,${ky-34} ${kx-50},${ky-24} ${kx-14},${ky-14} C${kx-30},${ky-4} 50,${ky-4} 14,${ky-6}Z`);g.fillStyle=`rgba(200,50,55,${0.35+0.55*act})`;g.fill(q);g.strokeStyle="rgba(120,20,30,.35)";g.lineWidth=1;for(let i=1;i<4;i++)g.stroke(new Path2D(`M20,${ky-24+i*4.5} C60,${ky-28+i*4} ${kx-60},${ky-22+i*3.6} ${kx-18},${ky-14+i*1.4}`));
 const hm=new Path2D(`M14,${ky+6} C50,${ky+4} ${kx-50},${ky+6} ${kx-20},${ky+10} C${kx-40},${ky+22} 50,${ky+26} 14,${ky+22}Z`);g.fillStyle=`rgba(40,110,200,${hold?0.45:0.25})`;g.fill(hm);g.restore();
 g.strokeStyle=SKD;g.lineWidth=1.3;g.stroke(th);
 g.save();g.translate(kx,ky);g.rotate(a-Math.PI/2);
 const sh=new Path2D("M-15,-4 C-18,30 -20,60 -12,96 C-10,108 -8,116 -9,122 L9,122 C10,110 14,96 16,80 C20,56 18,24 15,-4Z");
 g.save();g.shadowColor="rgba(20,33,58,.2)";g.shadowBlur=8;g.shadowOffsetX=2;g.fillStyle=SK;g.fill(sh);g.restore();
 g.save();g.clip(sh);g.fillStyle="rgba(200,90,80,.25)";g.fill(new Path2D("M4,8 C22,30 20,60 8,84 L16,84 L16,0Z"));g.strokeStyle="rgba(255,255,255,.5)";g.lineWidth=2.2;g.stroke(new Path2D("M-9,10 C-12,40 -12,70 -8,100"));g.restore();
 g.strokeStyle=SKD;g.lineWidth=1.3;g.stroke(sh);
 const ft=new Path2D("M-9,118 C-12,128 -10,136 -4,138 C8,140 26,140 36,136 C40,132 34,126 22,124 C14,122 10,118 9,116Z");g.fillStyle=SK;g.fill(ft);g.stroke(ft);
 g.fillStyle="rgba(240,230,210,.95)";g.strokeStyle="#a8946a";g.lineWidth=1;g.fill(new Path2D("M-16,8 C-22,10 -22,20 -16,22 Z"));
 g.strokeStyle="#f5ecd5";g.lineWidth=3;g.beginPath();g.moveTo(-15,2);g.lineTo(-17,16);g.stroke();
 g.restore();
 g.fillStyle="#f3ead2";g.strokeStyle="#a8946a";g.lineWidth=1.2;g.beginPath();g.ellipse(kx+8,ky-12,7,10,0.3,0,7);g.fill();g.stroke();
 g.strokeStyle="#e8dcbc";g.lineWidth=4;g.lineCap="round";g.beginPath();g.moveTo(kx+12,ky-2);g.lineTo(kx+10,ky+12);g.stroke();g.restore()};
})();
