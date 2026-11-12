/* ===== 3D модели за раздели V (дишане) и VI (бъбреци) ===== */
let R3N=0;
// поставя 3D сцена на мястото на 2D платно; 2D схемата остава достъпна с бутон
function r3Attach(cv,h,cam,build,opt={}){if(!cv)return;const id="r3w"+(++R3N),box=document.createElement("div");const grid=opt.full&&cv.parentNode.classList.contains("grid2")?cv.parentNode:null,gcol=grid?grid.style.gridTemplateColumns:"";
  box.innerHTML=`<div class="toggle" style="margin:6px 0 4px"><button data-m="3d" class="on">3D модел</button><button data-m="2d">Схема</button></div>`+wrap3D(id,h);
  if(grid){grid.parentNode.insertBefore(box,grid);grid.style.gridTemplateColumns="minmax(0,1fr)"}else cv.parentNode.insertBefore(box,cv);const w=box.querySelector("#"+id);cv.style.display="none";
  box.querySelectorAll(".toggle button").forEach(b=>b.onclick=()=>{const m=b.dataset.m;box.querySelectorAll(".toggle button").forEach(x=>x.classList.toggle("on",x===b));w.style.display=m==="3d"?"":"none";cv.style.display=m==="3d"?"none":"block";if(grid)grid.style.gridTemplateColumns=m==="3d"?"minmax(0,1fr)":gcol;window.dispatchEvent(new Event("resize"))});
  const stop=mk3DView("#"+id,()=>{const G=make3D(w,Object.assign({hq:true,min:1,max:40},cam));const ctx={G,g:G,wrap:w};window.__r3G=G;
      const ov=document.createElement("div");ov.style.cssText="position:absolute;left:8px;top:8px;font-size:12.5px;font-weight:600;background:color-mix(in srgb,var(--panel) 84%,transparent);padding:4px 8px;border-radius:8px;pointer-events:none;font-variant-numeric:tabular-nums;max-width:70%";w.appendChild(ov);ctx.ov=ov;
      const hint=document.createElement("div");hint.style.cssText="position:absolute;right:8px;bottom:6px;font-size:11px;color:var(--muted);pointer-events:none";hint.textContent="плъзни за завъртане · щипни за мащаб";w.appendChild(hint);
      if(opt.views){const vb=document.createElement("div");vb.style.cssText="position:absolute;left:8px;bottom:8px;display:flex;flex-wrap:wrap;gap:4px;z-index:3;max-width:75%";
        opt.views.forEach(([l,c])=>{const b=document.createElement("button");b.className="b";b.style.cssText="padding:3px 9px;font-size:12px;background:color-mix(in srgb,var(--panel) 88%,transparent)";b.textContent=l;b.onclick=()=>G.flyTo(...c);vb.appendChild(b)});w.appendChild(vb);hint.style.bottom="auto";hint.style.top="8px"}
      ctx.frame=build(G,ctx);return ctx},
    (ctx,dt)=>{if(!w.offsetParent)return;ctx.frame(dt)},{mc:true});
  (window.__cleanups=window.__cleanups||[]).push(stop);return w}
const R3={
  std(T,c,o={}){return new T.MeshStandardMaterial(Object.assign({color:LIN(T,c),roughness:0.55},o))},
  phys(T,c,o={}){return MK.mat(T,c,o)},
  glass(T,c,op,o={}){return new T.MeshPhysicalMaterial(Object.assign({color:LIN(T,c),roughness:0.35,transparent:true,opacity:op,depthWrite:false,side:T.DoubleSide},o))},
  glow(T,c,op=0.5){return new T.MeshBasicMaterial({color:LIN(T,c),transparent:true,opacity:op,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending})},
  tube(T,pts,r,mat,o={}){const c=pts.getPointAt?pts:new T.CatmullRomCurve3(pts.map(p=>p.isVector3?p:new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(c,o.seg||48,r,o.rad||10,!!o.closed),mat);m.userData.curve=c;return m},
  // тръба с променлив радиус r(u)
  vtube(T,pts,rf,mat,o={}){const c=pts.getPointAt?pts:new T.CatmullRomCurve3(pts.map(p=>p.isVector3?p:new T.Vector3(...p)));const seg=o.seg||48,rad=o.rad||12,g=new T.TubeGeometry(c,seg,1,rad,false),P=g.attributes.position,fr=c.computeFrenetFrames(seg,false),q=new T.Vector3();
    for(let i=0;i<=seg;i++){const u=i/seg,ce=c.getPointAt(u),r=rf(u);for(let j=0;j<=rad;j++){const k=i*(rad+1)+j;q.set(P.getX(k),P.getY(k),P.getZ(k)).sub(ce).normalize().multiplyScalar(r).add(ce);P.setXYZ(k,q.x,q.y,q.z)}}
    g.computeVertexNormals();const m=new T.Mesh(g,mat);m.userData.curve=c;return m},
  // обединява няколко геометрии (позиции, нормали, uv, цветове) в една
  merge(T,list){let nv=0,ni=0;list.forEach(g=>{nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count});
    const P=new Float32Array(nv*3),N=new Float32Array(nv*3),C=new Float32Array(nv*3),I=new Uint32Array(ni);let ov=0,oi=0;
    list.forEach(g=>{const p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color;P.set(p.array,ov*3);if(n)N.set(n.array,ov*3);if(c)C.set(c.array,ov*3);else C.fill(1,ov*3,(ov+p.count)*3);
      if(g.index){for(let i=0;i<g.index.count;i++)I[oi+i]=g.index.array[i]+ov;oi+=g.index.count}else{for(let i=0;i<p.count;i++)I[oi+i]=i+ov;oi+=p.count}ov+=p.count});
    const g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(P,3));g.setAttribute("normal",new T.BufferAttribute(N,3));g.setAttribute("color",new T.BufferAttribute(C,3));g.setIndex(new T.BufferAttribute(I,1));return g},
  // процедурна текстура: fn(g,W,H)
  tex(T,W,H,fn,rep){const c=document.createElement("canvas");c.width=W;c.height=H;fn(c.getContext("2d"),W,H);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);t.anisotropy=4;return t},
  noise(seed){const R=MK.rnd(seed);return R},
  // поток от частици по крива: ст. брой, цвят; update(dt,rate,dir) — dir ±1
  stream(T,curves,n,r,col,o={}){const im=MK.pool(T,col,r,n,{glow:o.glow||0.35,seg:10});const P=[];const m=new T.Matrix4();
    const api={mesh:im,P,update(dt,rate,dir=1,colorFn){if(rate>0&&Math.random()<dt*rate)for(let k=0;k<Math.ceil(dt*rate);k++){if(P.length<n)P.push({c:curves[Math.floor(Math.random()*curves.length)],u:dir>0?0:1,j:(Math.random()-0.5)*(o.jit||0),sp:(o.speed||0.4)*(0.7+Math.random()*0.6)})}
      let k=0;for(let i=P.length-1;i>=0;i--){const q=P[i];q.u+=dir*q.sp*dt*(o.mult||1);if(q.u>1||q.u<0){P.splice(i,1);continue}}
      P.forEach(q=>{const p=q.c.getPointAt(q.u);m.makeTranslation(p.x+q.j,p.y+q.j*0.6,p.z-q.j*0.8);im.setMatrixAt(k,m);if(colorFn){im.setColorAt(k,colorFn(q));}k++});im.count=k;im.instanceMatrix.needsUpdate=true;if(colorFn&&im.instanceColor)im.instanceColor.needsUpdate=true}};return api},
  // импулси по нерв (крива): светещи топчета
  pulses(T,curve,col,n=12,r=0.04){const im=new T.InstancedMesh(new T.SphereGeometry(r,10,8),R3.glow(T,col,0.95),n);im.count=0;im.frustumCulled=false;const P=[],m=new T.Matrix4();
    return {mesh:im,update(dt,rate,speed=0.8){if(Math.random()<dt*rate&&P.length<n)P.push(0);for(let i=P.length-1;i>=0;i--){P[i]+=dt*speed;if(P[i]>1)P.splice(i,1)}P.forEach((u,i)=>{const p=curve.getPointAt(u);m.makeTranslation(p.x,p.y,p.z);im.setMatrixAt(i,m)});im.count=P.length;im.instanceMatrix.needsUpdate=true}}},
  // „Еритроцит“ — двойновдлъбнат диск
  rbcGeo(T,r=0.1){const pts=[];for(let i=0;i<=16;i++){const u=i/16,x=u*r,h=r*0.42*(0.35+1.3*u*u-1.1*u*u*u*u)*Math.sqrt(Math.max(0,1-u*u))+0.002;pts.push(new T.Vector2(x,h))}for(let i=16;i>=0;i--){const p=pts[i];pts.push(new T.Vector2(p.x,-p.y))}return new T.LatheGeometry(pts,20)}
};
/* ---- гръден кош: координати като в анатомичния модел (×10 m); +x — лява страна, +z — отпред ---- */
const TX={apex:6.32,hil:5.12};
const txA=y=>y<4.85?1.33-0.05*Math.max(0,4.3-y):1.33*(1-0.6*Math.pow(Math.min(1,(y-4.85)/1.5),1.5));// полуширина на гръдната кухина
function txDome(x,z,d){const px=Math.abs(x),r2=Math.pow((px-0.6)/0.78,2)+Math.pow((z+0.05)/0.95,2);return 4.43+(x<0?0.13:0)-d-0.58*Math.min(1.7,r2)*(1-0.25*Math.min(1,d))-0.1*Math.exp(-Math.pow(x/0.28,2))*Math.exp(-Math.pow((z-0.1)/0.5,2))}
function txSpineZ(y){return y>6.2?-0.32:y>5.6?-0.32-(6.2-y)*0.35:y>4.6?-0.53-(5.6-y)*0.12:-0.65+(4.6-y)*0.1}// предна повърхност на прешлените
// форма на белия дроб; s = −1 дясно, +1 ляво; V — обем над FRC (L); d — слизане на диафрагмата; col — колапс 0..1
function lungPos(s,dx,dy,dz,V,d,col,out){const v=(dy+1)/2,hl=Math.hypot(dx,dz)||1,hx=dx/hl,hz=dz/hl,inf=1+0.022*Math.min(4,V);
  const rho=Math.pow(Math.sin(Math.min(1,v/0.15)*Math.PI/2),0.6)*(v>0.42?Math.pow(Math.max(0,1-Math.pow((v-0.42)/0.58,2.3)),0.55):1);
  const gv=Math.max(0,(v-0.1)/0.9);const apex=TX.apex-(s>0?0.05:0);
  let y=4.2+gv*(apex-4.2);const cx=s*0.66,cz=-0.12;
  const lat=Math.max(0.2,txA(y)-0.7)*inf,card=s>0?0.32*Math.exp(-Math.pow((y-4.75)/0.45,2))*Math.max(0,hz+0.2):0,med=(0.44-card)*(s>0?1:1.04);
  const fz=Math.min(0.82,0.98-0.12*Math.max(0,(y-5.6)))*inf,bz=1.0*inf-(y>5.8?(y-5.8)*0.5:0);
  let x=cx+hx*(hx*s>0?lat:med)*rho,z=cz+hz*(hz>0?fz:bz)*rho;
  const yb=txDome(x,z,d)+0.05;y=yb+gv*(apex-yb);
  // фисури (бразди)
  const fo=y-(5.85-(z+0.95)*0.95);let gr=0.05*Math.exp(-Math.pow(fo/0.05,2));if(s<0&&z>-0.25&&y>5.0){gr+=0.04*Math.exp(-Math.pow((y-5.33)/0.045,2))}
  x-= (x-cx)*gr*0.6;z-=(z-cz)*gr*0.6;
  if(col>0){const hx0=s*0.42,hy0=TX.hil,hz0=-0.18,k=col;x+=(hx0-x)*k;y+=(hy0-y)*k*0.92;z+=(hz0-z)*k}
  out.set(x,y,z);return out}
function lungTex(T,seed){return R3.tex(T,1024,512,(g,W,H)=>{const R=MK.rnd(seed);const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#e48d9c");gr.addColorStop(0.5,"#dc7b8c");gr.addColorStop(1,"#cf6a7e");g.fillStyle=gr;g.fillRect(0,0,W,H);
  // лобули: многоъгълни петна с по-тъмни ръбове
  for(let i=0;i<900;i++){const x=R()*W,y=R()*H,r=6+R()*16;g.beginPath();for(let k=0;k<6;k++){const a=k/6*6.283+R()*0.4;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath();g.fillStyle=`rgba(${230+R()*25|0},${140+R()*40|0},${150+R()*40|0},.35)`;g.fill();g.strokeStyle="rgba(150,70,85,.25)";g.lineWidth=1;g.stroke()}
  for(let i=0;i<260;i++){g.fillStyle=`rgba(60,45,55,${0.15+R()*0.35})`;g.beginPath();g.arc(R()*W,R()*H,0.8+R()*2.2,0,7);g.fill()}
  for(let i=0;i<40;i++){g.strokeStyle="rgba(120,40,60,.18)";g.lineWidth=1.5;g.beginPath();let x=R()*W,y=R()*H;g.moveTo(x,y);for(let k=0;k<8;k++){x+=(R()-0.5)*40;y+=(R()-0.5)*40;g.lineTo(x,y)}g.stroke()}})}
// бял дроб като деформирана сфера; update(V,d,col)
function mkLung(T,s,mat){const geo=new T.SphereGeometry(1,72,56),P=geo.attributes.position,D=new Float32Array(P.array),q=new T.Vector3();const m=new T.Mesh(geo,mat);
  m.userData.update=(V,d,col)=>{for(let i=0;i<P.count;i++){lungPos(s,D[3*i],D[3*i+1],D[3*i+2],V,d,col,q);P.setXYZ(i,q.x,q.y,q.z)}P.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere()};
  m.userData.update(0,0,0);return m}
// бронхиално дърво (обединена геометрия) + пътища за въздушните частици
function mkBronchi(T,s,seed){const R=MK.rnd(seed),geos=[],paths=[],q=new T.Vector3(),V3=(x,y,z)=>new T.Vector3(x,y,z);
  const inLung=()=>{const a=R()*6.283,v=0.18+R()*0.75,rr=0.25+R()*0.6;const dx=Math.cos(a)*Math.sqrt(1-(2*v-1)**2),dz=Math.sin(a)*Math.sqrt(1-(2*v-1)**2);lungPos(s,dx,2*v-1,dz,0,0,0,q);const c=V3(s*0.62,q.y,-0.12);return c.lerp(q,rr)};
  const carina=V3(0,5.36,-0.2),hil=V3(s*0.48,s<0?5.2:5.16,-0.22);
  const rec=(a,b,r,gen,path)=>{const mid=a.clone().lerp(b,0.5).add(V3((R()-0.5)*0.06,(R()-0.5)*0.06,(R()-0.5)*0.06));const c=new T.CatmullRomCurve3([a,mid,b]);geos.push(new T.TubeGeometry(c,gen<2?10:6,r,gen<2?10:6,false));const np=path.concat([mid,b]);
    if(gen>=5){paths.push(new T.CatmullRomCurve3(np));return}
    const dir=b.clone().sub(a).normalize(),L=a.distanceTo(b)*0.78;for(let k=0;k<2;k++){const t=inLung(),d2=t.sub(b).normalize().lerp(dir,0.45).normalize();rec(b,b.clone().add(d2.multiplyScalar(L*(0.8+R()*0.35))),r*0.74,gen+1,np)}};
  rec(carina,hil,0.072,0,[V3(0,6.95,0.12),V3(0,6.2,-0.08),carina]);
  const g=R3.merge(T,geos);g.computeVertexNormals();return {geo:g,paths}}
function mkRibcage(T,par){const bone=R3.phys(T,0xd9c9a8,{roughness:0.5,clearcoat:0.25}),cart=R3.phys(T,0xcfe0e6,{roughness:0.35,clearcoat:0.5,transparent:true,opacity:0.9}),ribs=[],V3=(x,y,z)=>new T.Vector3(x,y,z);
  const ster=new T.Group();par.add(ster);
  const ends=[];
  for(let i=0;i<12;i++){const y0=6.3-i*0.192,A=[0.7,0.95,1.1,1.21,1.28,1.32,1.34,1.34,1.32,1.27,1.18,1.02][i],drop=[0.3,0.42,0.55,0.68,0.8,0.9,0.98,1.02,1.02,0.98,0.7,0.5][i],ext=[0.95,0.95,0.94,0.93,0.92,0.9,0.88,0.82,0.74,0.66,0.45,0.3][i];
    for(const s of [-1,1]){const P0=V3(s*0.17,y0,txSpineZ(y0)-0.22),g=new T.Group();g.position.copy(P0);par.add(g);const pts=[V3(0,0,0)];
      for(let k=0;k<=16;k++){const t=k/16,ph=-Math.PI/2+0.16+t*ext*Math.PI,zc=-0.06,bb=1.02,bf=0.97;const x=s*A*Math.sin(ph+Math.PI/2),z=zc+(Math.sin(ph)<0?bb:bf)*Math.sin(ph),y=y0-drop*Math.pow(t,1.25)+0.06*Math.sin(t*3.1);
        if(k===0)continue;pts.push(V3(x,y,z).sub(P0))}
      const rib=R3.vtube(T,pts,u=>0.032+0.016*Math.sin(Math.min(1,u*1.3)*3.14),bone,{seg:44,rad:8});g.add(rib);
      const e=pts[pts.length-1].clone().add(P0);if(s>0)ends[i]=e;
      if(i<10){let st;if(i<7)st=V3(s*0.13,6.0-i*0.2,0.99);else{const pe=ends[i-1]||e;st=V3(s*Math.max(0.3,Math.abs(pe.x)*0.75),pe.y+0.06,pe.z*0.9)}
        const mid=e.clone().lerp(st,0.5).add(V3(0,i<7?-0.06:0.05,0.05));g.add(R3.tube(T,[e,mid,st].map(p=>p.clone().sub(P0)),0.034,cart,{seg:16,rad:8}))}
      ribs.push({g,s,i})}}
  // гръдна кост
  const sm=R3.phys(T,0xe8dcc5,{roughness:0.5});const st=new T.Mesh(new T.CylinderGeometry(0.15,0.12,1.35,16,8),sm);st.scale.set(1.15,1,0.22);st.position.set(0,5.28,1.0);st.rotation.x=0.14;ster.add(st);
  const man=new T.Mesh(new T.SphereGeometry(0.2,20,14),sm);man.scale.set(1.15,0.9,0.35);man.position.set(0,6.02,0.92);ster.add(man);
  const xi=new T.Mesh(new T.ConeGeometry(0.06,0.25,10),sm);xi.rotation.x=Math.PI;xi.position.set(0,4.5,1.06);ster.add(xi);
  // ключици
  for(const s of [-1,1])par.add(R3.vtube(T,[V3(s*0.17,6.08,0.9),V3(s*0.7,6.18,0.78),V3(s*1.2,6.22,0.35),V3(s*1.55,6.3,-0.05)],u=>0.06-0.01*u,bone,{seg:24,rad:8}));
  // прешлени
  const sp=new T.Group();par.add(sp);for(let i=0;i<16;i++){const y=6.5-i*0.2,z=txSpineZ(y)-0.18;const b=new T.Mesh(new T.CylinderGeometry(0.16,0.17,0.15,18),bone);b.position.set(0,y,z);sp.add(b);
    const dsk=new T.Mesh(new T.CylinderGeometry(0.155,0.155,0.045,18),cart);dsk.position.set(0,y-0.1,z);sp.add(dsk);
    const pr=new T.Mesh(new T.BoxGeometry(0.06,0.08,0.38),bone);pr.position.set(0,y-0.06,z-0.4);pr.rotation.x=0.5;sp.add(pr);
    for(const s of [-1,1]){const tp=new T.Mesh(new T.BoxGeometry(0.26,0.06,0.07),bone);tp.position.set(s*0.2,y,z-0.22);tp.rotation.y=-s*0.4;sp.add(tp)}}
  return {ribs,ster,update(V){const e=Math.min(1.3,V*0.55);ribs.forEach(r=>{const k=(r.i<1?0.3:r.i>9?0.4:1);r.g.rotation.x=-0.085*e*k;r.g.rotation.z=r.s*0.05*e*k*(r.i>4?1.4:0.6)});ster.position.set(0,0.07*e,0.07*e)}}}
function mkDiaphragm(T){const NR=26,NA=72,P=[],U=[],I=[];for(let r=0;r<=NR;r++)for(let a=0;a<=NA;a++){const rr=r/NR,an=a/NA*6.283;P.push(0,0,0);U.push(a/NA,rr)}
  for(let r=0;r<NR;r++)for(let a=0;a<NA;a++){const i=r*(NA+1)+a,j=i+NA+1;I.push(i,j,i+1,i+1,j,j+1)}
  const g=new T3G(P,U,I);const tex=R3.tex(THREE,1024,256,(c,W,H)=>{const R=MK.rnd(5);c.fillStyle="#b4483f";c.fillRect(0,0,W,H);for(let x=0;x<W;x+=3){c.fillStyle=`rgba(${120+R()*60|0},${30+R()*25|0},${30+R()*20|0},.5)`;c.fillRect(x,H*0.3,2,H)}
    const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,"rgba(236,228,214,1)");gr.addColorStop(0.3,"rgba(236,228,214,1)");gr.addColorStop(0.42,"rgba(236,228,214,0)");c.fillStyle=gr;c.fillRect(0,0,W,H);for(let i=0;i<300;i++){c.strokeStyle="rgba(200,190,170,.5)";c.beginPath();const x=R()*W;c.moveTo(x,0);c.lineTo(x+(R()-0.5)*30,H*0.32);c.stroke()}});
  const m=new THREE.Mesh(g,R3.phys(THREE,0xffffff,{map:tex,roughness:0.6,clearcoat:0.2,side:THREE.DoubleSide}));const Pa=g.attributes.position;
  m.userData.update=d=>{for(let r=0;r<=NR;r++)for(let a=0;a<=NA;a++){const rr=r/NR,an=a/NA*6.283,i=r*(NA+1)+a;let x=Math.cos(an)*rr*1.42,z=-0.05+Math.sin(an)*rr*(Math.sin(an)>0?0.98:1.0);// ръбът е залепен за стената
      const y=rr>0.97?txDome(x,z,0)-(rr-0.97)*4:txDome(x,z,d*Math.min(1,(1-rr)*1.6+0.15));Pa.setXYZ(i,x,y-0.02,z)}Pa.needsUpdate=true;g.computeVertexNormals()};m.userData.update(0);return m}
function T3G(P,U,I){const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2));g.setIndex(I);return g}
function mkHeart(T){const g=new T.Group();const V3=(x,y,z)=>new T.Vector3(x,y,z);
  const h=MK.blob(T,[[0.05,5.0,0.22,0.36,0xa8323a],[0.22,4.82,0.38,0.38,0xb03a40],[0.38,4.65,0.52,0.3,0xb03a40],[0.5,4.52,0.62,0.18,0xa8323a],[-0.22,4.92,0.3,0.28,0x9c2f36],[0.12,5.12,-0.05,0.25,0x8f2a33],[-0.25,5.1,0.05,0.24,0x7a3b6e]],{res:40});
  g.add(h);const cor=R3.phys(T,0xf2d27a,{roughness:0.7});[[[0.0,5.18,0.36],[0.3,4.95,0.6],[0.5,4.62,0.72]],[[-0.15,5.1,0.35],[-0.38,4.85,0.42],[-0.3,4.6,0.4]]].forEach(p=>g.add(R3.tube(T,p.map(a=>V3(...a)),0.022,R3.phys(T,0xc0392b),{seg:20,rad:6})));
  const fat=new T.Mesh(new T.SphereGeometry(0.12,14,10),cor);fat.position.set(0.0,5.1,0.42);fat.scale.set(2,0.6,0.7);g.add(fat);return g}
/* ---- общ анатомичен фон: кожа, аорта, сънни артерии от анатомичния модел ---- */
function r3Body(T,sc,o={}){const A=loadArcBin(),body=new T.Group();body.scale.setScalar(10);sc.add(body);const out={body};
  const mk=(g,mat,ro)=>{const d=A[g];const geo=new T.BufferGeometry();geo.setAttribute("position",new T.BufferAttribute(d.P,3));geo.setIndex(new T.BufferAttribute(d.I,1));geo.computeVertexNormals();const me=new T.Mesh(geo,mat);if(ro)me.renderOrder=ro;body.add(me);return me};
  out.skin=mk("skin",R3.glass(T,0xe8b89a,o.skin||0.07,{side:T.FrontSide}),20);
  if(o.vessels!==false){const art=R3.phys(T,0xc92a2a,{roughness:0.4});out.aorta=mk("aorta",art);mk("neckart",art)}
  if(o.brain){out.cortex=mk("cortex",R3.glass(T,0xf2b6c0,0.13),11);out.cereb=mk("cerebellum",R3.glass(T,0xe39aa6,0.2),11);out.pons=mk("pons",R3.glass(T,0xd59a6a,0.55),9);out.med=mk("medulla",R3.glass(T,0xd8955e,0.6),9);
    ["cordC","cordT14","cordT58"].forEach(k=>mk(k,R3.phys(T,0xe9c896,{roughness:0.6})))}
  return out}
// целият гръден кош с дишане; връща {update(V,ptxL,opts)}
function r3Thorax(T,sc,o={}){const g=new T.Group();sc.add(g);const V3=(x,y,z)=>new T.Vector3(x,y,z);
  const rc=mkRibcage(T,g),dia=mkDiaphragm(T);g.add(dia);
  const lm=[];const L={};for(const s of [-1,1]){const mat=R3.phys(T,0xffffff,{map:lungTex(T,s>0?11:7),roughness:0.58,clearcoat:0.35,clearcoatRoughness:0.5,transparent:true,opacity:o.op||0.86,depthWrite:true,side:T.FrontSide});const lu=mkLung(T,s,mat);lu.renderOrder=6;g.add(lu);L[s]=lu;lm.push(mat)}
  // плевра (париетален лист) — по-голямата обвивка
  const plM={},pl={};for(const s of [-1,1]){plM[s]=R3.glass(T,0xbfe3ff,0.1,{roughness:0.2});const m=mkLung(T,s,plM[s]);m.userData.update(0.9,0.3,0);m.scale.set(1.03,1.01,1.03);m.position.set(-s*0.66*0.03,-0.03,0.12*0.03);m.renderOrder=7;g.add(m);pl[s]=m}
  // бронхи и трахея
  const brM=R3.phys(T,0xf1e4d4,{roughness:0.45,clearcoat:0.5,emissive:LIN(T,0xff6b00),emissiveIntensity:0}),B={},paths=[];
  for(const s of [-1,1]){const b=mkBronchi(T,s,s>0?23:41);const m=new T.Mesh(b.geo,brM);m.renderOrder=3;g.add(m);B[s]=m;b.paths.forEach(p=>{p.s=s;paths.push(p)})}
  const rings=new T.InstancedMesh(new T.TorusGeometry(0.105,0.022,6,20),R3.phys(T,0xf8f0e3,{roughness:0.4}),14),mm=new T.Matrix4(),qq=new T.Quaternion();
  for(let i=0;i<14;i++){const c=new T.CatmullRomCurve3([V3(0,6.95,0.12),V3(0,6.2,-0.08),V3(0,5.36,-0.2)]),u=i/14,p=c.getPointAt(u),tg=c.getTangentAt(u);qq.setFromUnitVectors(V3(0,0,1),tg);mm.compose(p,qq,V3(1,1,1));rings.setMatrixAt(i,mm)}g.add(rings);
  // сърце и белодробни съдове
  const heart=mkHeart(T);g.add(heart);
  // реални модели: бели дробове HuBMAP HRA и реалистичното сърце от сърдечно-съдовите уроци
  const RL=typeof RealLungs==="function"?RealLungs(T,g,new T.Box3().setFromObject(L[-1]).union(new T.Box3().setFromObject(L[1])),{op:o.op}):null;
  if(RL){for(const s of [-1,1]){L[s].visible=false;B[s].visible=false;pl[s].visible=false}rings.visible=false}
  const RH=typeof RealHeart==="function"&&window.__r3G?RealHeart(window.__r3G,g,new T.Box3().setFromObject(heart)):null;if(RH)heart.visible=false;
  const pa=R3.phys(T,0x3b5bdb,{roughness:0.4}),pv=R3.phys(T,0xc0392b,{roughness:0.4});
  g.add(R3.vtube(T,[V3(0.12,4.98,0.5),V3(0.15,5.22,0.3),V3(0.05,5.32,0.02)],u=>0.13-0.02*u,pa,{seg:20}));
  for(const s of [-1,1]){g.add(R3.vtube(T,[V3(0.05,5.32,0.02),V3(s*0.25,5.3,-0.05),V3(s*0.46,5.2,-0.1),V3(s*0.75,5.15,-0.15)],u=>0.085-0.03*u,pa,{seg:20}));
    for(const dy of [0.12,-0.12])g.add(R3.vtube(T,[V3(s*0.62,5.0+dy,-0.08),V3(s*0.35,4.98+dy*0.6,-0.18),V3(0.1,4.96,-0.25)],u=>0.04+0.01*u,pv,{seg:16,rad:8}))}
  // въздух в пътищата
  const airIn=R3.stream(T,paths,240,0.03,0x22b8cf,{speed:0.55,glow:0.6}),airOut=R3.stream(T,paths,240,0.03,0x748ffc,{speed:0.45,glow:0.4});g.add(airIn.mesh,airOut.mesh);
  // въздух в плевралната кухина при пневмоторакс
  let col={[-1]:0,[1]:0},t=0;
  return {g,rc,dia,L,pl,B,heart,lm,brM,
    update(dt,V,flow,ptxL,op){t+=dt;const d=Math.min(1.1,0.42*V);dia.userData.update(d);rc.update(V);
      col[1]+=((ptxL?0.58:0)-col[1])*Math.min(1,dt*1.5);col[-1]*=0.9;
      for(const s of [-1,1]){L[s].userData.update(V*(col[s]>0.3?0.15:1),d,col[s]);B[s].scale.setScalar(1);if(col[s]>0.01){const k=1-col[s]*0.55;B[s].position.set(0,0,0);B[s].scale.set(k,k,k);B[s].position.set(s*0.48*(1-k),TX.hil*(1-k),-0.2*(1-k))}else{B[s].scale.setScalar(1);B[s].position.set(0,0,0)}}
      plM[1].color.set(ptxL?LIN(T,0x74c0fc):LIN(T,0xbfe3ff));plM[1].opacity=ptxL?0.32:0.1;
      if(RL){RL.update({V,dd:d,col:Math.min(1,col[1]/0.58)});pl[1].visible=!!ptxL}if(RH)RH.update(dt,70);
      const hb=1+0.035*Math.max(0,Math.sin(t*7.5))**3;const k=0.8*hb;heart.scale.setScalar(k);heart.position.set(0.15*(1-k)+0.1,4.85*(1-k)-0.06,0.3*(1-k));
      const r=Math.min(400,Math.abs(flow)*260);if(flow>0.02){airIn.update(dt,r,1);airOut.update(dt,0,-1)}else if(flow<-0.02){airOut.update(dt,r,-1);airIn.update(dt,0,1)}else{airIn.update(dt,0,1);airOut.update(dt,0,-1)}}}}
// ---------- V.1 Механика: 3D гръден кош ----------
const _vLM=VIEWS.lungmech;
VIEWS.lungmech=function(main){_vLM(main);window.__R3=null;
  r3Attach($("#lmC"),440,{r:6.9,th:0.38,phi:1.4,target:[0,5.15,0],fov:38,min:2.5,max:22},(G,ctx)=>{const T=G.T,sc=G.scene,V3=(x,y,z)=>new T.Vector3(x,y,z);G.ren.toneMappingExposure=1.08;
    const bd=r3Body(T,sc,{skin:0.06});const th=r3Thorax(T,sc);
    let lastS=null;
    return dt=>{const S=window.__R3;if(!S||S.V==null){G.render([]);return}const p=S.p,surf=p.surf,ptx=!!p.ptx;
      th.update(dt,S.V,S.flow,ptx);
      th.lm.forEach(m=>{const at=Math.max(0,(60-surf)/60);m.color.setRGB(1-0.25*at,1-0.45*at,1-0.4*at)});
      th.brM.emissiveIntensity=Math.min(0.6,Math.max(0,(p.R-3)/12)*0.6);
      const sz=Math.cbrt(S.D.TLC/5.8);[th.L[-1],th.L[1]].forEach(l=>{l.scale.set(sz,1,sz);l.position.set(0,0,0)});
      const d=Math.min(1.1,0.42*S.V);
      ctx.ov.innerHTML=`<span style="color:${S.insp?"var(--accent3)":"var(--accent4)"}">${S.insp?"Вдишване":"Издишване"}</span> · P<sub>pl</sub> ${fmt(S.P.Ppl,1)} · P<sub>alv</sub> ${fmt(S.P.Palv,1)} cmH₂O · ΔV ${fmt(S.V*1000,0)} mL`;
      G.render([["трахея",V3(0,6.75,0.1)],["десен бял дроб",V3(-1.15,5.35,0.35)],["ляв бял дроб",V3(1.15,5.35,0.35)],["диафрагма",V3(-0.6,txDome(-0.6,0.6,d)+0.02,0.75)],["сърце",V3(0.3,4.7,0.75)],[ptx?"въздух в плеврата":"плевра",V3(ptx?1.0:-1.3,ptx?5.6:4.6,0.4)]])}},{full:true,views:[["Отпред",[0,5.15,0,6.9,0.38,1.4]],["Отстрани",[0,5.1,0,7.2,1.57,1.45]],["Отгоре",[0,5.3,0,6.5,0.2,0.45]],["Бронхи",[0,5.3,0,3.6,0.1,1.4]]]});
};
// ---------- V.2 Газообмен: алвеола и капиляри ----------
const _vGX=VIEWS.gasx;
VIEWS.gasx=function(main){_vGX(main);window.__R3=null;
  r3Attach($("#gxC"),440,{r:10.5,th:0.35,phi:1.3,target:[0,0,-0.5],fov:38,min:3,max:24},(G,ctx)=>{const T=G.T,sc=G.scene,V3=(x,y,z)=>new T.Vector3(x,y,z),R=MK.rnd(9);G.ren.toneMappingExposure=0.95;
    // алвеоларна торбичка: централна алвеола (разрязана) + съседни алвеоли
    const RA=2.6,cut=new T.Plane(V3(0,0,-1),0.15);
    const wallTex=R3.tex(T,512,256,(g,W,H)=>{g.fillStyle="#efb2bc";g.fillRect(0,0,W,H);const r=MK.rnd(3);for(let i=0;i<500;i++){g.fillStyle=`rgba(230,${150+r()*40|0},${160+r()*30|0},.45)`;g.beginPath();g.ellipse(r()*W,r()*H,8+r()*14,5+r()*9,r()*3,0,7);g.fill()}for(let i=0;i<120;i++){g.fillStyle="rgba(150,80,120,.35)";g.beginPath();g.arc(r()*W,r()*H,2+r()*2,0,7);g.fill()}});
    const wallM=R3.phys(T,0xffffff,{map:wallTex,roughness:0.5,clearcoat:0.5,side:T.DoubleSide,clippingPlanes:[cut],transparent:true,opacity:0.42,depthWrite:false});G.ren.localClippingEnabled=true;
    const alv=new T.Mesh(new T.SphereGeometry(RA,64,48),wallM);alv.renderOrder=5;sc.add(alv);
    const surfM=R3.glass(T,0x9be7ff,0.18,{clippingPlanes:[cut]});const surfL=new T.Mesh(new T.SphereGeometry(RA-0.06,48,36),surfM);sc.add(surfL);
    const intM=R3.glass(T,0xffe8a3,0.25,{clippingPlanes:[cut]});const inter=new T.Mesh(new T.SphereGeometry(RA+0.1,48,36),intM);sc.add(inter);
    const nb=[[3.3,1.8,-2.6],[-3.5,1.3,-2.4],[0.4,3.8,-2.6],[-1.4,-3.6,-2.4],[3.0,-2.5,-2.2],[-4.0,-1.6,-1.4],[4.1,0.1,-1.2]];
    nb.forEach(([x,y,z],i)=>{const m=new T.Mesh(new T.SphereGeometry(1.9+R()*0.5,40,30),R3.phys(T,0xffffff,{map:wallTex,roughness:0.55,clearcoat:0.3,transparent:true,opacity:0.2,depthWrite:false}));m.position.set(x,y,z);m.renderOrder=1;sc.add(m)});
    // алвеоларен канал
    sc.add(R3.vtube(T,[V3(0,RA*0.8,-1.2),V3(0.3,4.2,-1.6),V3(0.6,6,-1.8)],u=>0.9-0.2*u,R3.phys(T,0xf1c4cb,{roughness:0.5,transparent:true,opacity:0.6,depthWrite:false}),{seg:20}));
    // клетки: пневмоцити тип II и макрофаг
    const p2=[];for(let i=0;i<7;i++){const th=R()*6.283,ph=0.5+R()*2.2,p=V3(Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)).multiplyScalar(RA-0.12);if(p.z>0.2)p.z=-p.z;const m=MK.blob(T,[[p.x,p.y,p.z,0.24,0xf783ac],[p.x*0.97,p.y*0.97,p.z*0.97,0.16,0xd6336c]],{res:22});sc.add(m);p2.push(p)}
    const mac=MK.blob(T,[[-0.6,-1.6,-1.1,0.32,0xb197fc],[-0.9,-1.5,-1.0,0.2,0xb197fc],[-0.35,-1.85,-1.05,0.18,0x9775fa]],{res:26});sc.add(mac);
    // капилярна мрежа по външната повърхност
    const capM=R3.phys(T,0xe66a6a,{roughness:0.3,clearcoat:0.5,transparent:true,opacity:0.4,depthWrite:false}),caps=[];
    const sp=(al,be)=>V3(Math.sin(al)*Math.cos(be),Math.sin(al)*Math.sin(be),-Math.cos(al)).multiplyScalar(RA+0.22);
    for(let k=0;k<7;k++){const a0=0.35+k*0.17,b0=R()*6.28,pts=[];for(let i=0;i<=30;i++){const be=b0+i/30*3.4;pts.push(sp(Math.min(1.42,a0+0.12*Math.sin(be*2+k)),be))}const m=R3.tube(T,pts,0.15,capM,{seg:90,rad:12});m.renderOrder=4;sc.add(m);caps.push(m.userData.curve)}
    for(let k=0;k<7;k++){const b0=k/7*6.28+R()*0.3,pts=[];for(let i=0;i<=24;i++){const al=0.15+i/24*1.27;pts.push(sp(al,b0+0.25*Math.sin(al*5+k)))}const m=R3.tube(T,pts,0.15,capM,{seg:70,rad:12});m.renderOrder=4;sc.add(m);caps.push(m.userData.curve)}
    // еритроцити в капилярите
    const nR=170,rbc=new T.InstancedMesh(R3.rbcGeo(T,0.15),R3.phys(T,0xffffff,{roughness:0.35,clearcoat:0.6}),nR);rbc.frustumCulled=false;sc.add(rbc);
    const rb=[];for(let i=0;i<nR;i++)rb.push({c:i%caps.length,u:Math.random(),sp:0.9+Math.random()*0.2,rot:Math.random()*6});
    // молекули
    const o2=MK.pool(T,0xe03131,0.06,700,{glow:0.4,seg:10}),co2=MK.pool(T,0x868e96,0.065,500,{glow:0.2,seg:10}),coM=MK.pool(T,0x212529,0.08,200,{glow:0.1,seg:10});sc.add(o2,co2,coM);
    const fl=[],m4=new T.Matrix4(),q4=new T.Quaternion(),cA=new T.Color(),cV=new T.Color(),cC=new T.Color(),tmp=new T.Color();cA.set(0xd6141e).convertSRGBToLinear();cV.set(0x3b1d5e).convertSRGBToLinear();cC.set(0xff6b6b).convertSRGBToLinear();
    const randIn=()=>{for(;;){const p=V3(R()*2-1,R()*2-1,R()*2-1);if(p.length()<1&&p.z<0.05)return p.multiplyScalar(RA-0.25)}};
    const hsh=(i,s)=>((Math.sin(i*12.9898+s)*43758.5453)%1+1)%1;let t=0;
    return dt=>{t+=dt;const S=window.__R3;if(!S||!S.R){G.render([]);return}const Rr=S.R,Q=S.Q,tr=Rr.tt||0.75;
      inter.scale.setScalar(1+0.06*(1-Q.D/100));intM.opacity=0.18+0.5*(1-Q.D/100);
      // еритроцити: цвят по насищането в съответната точка на капиляра
      const Pf=u=>{const pr=Rr.prof,n=pr.length;if(!n)return Rr.PaO2;const x=Math.min(n-1,u*(n-1)),i=Math.floor(x),f=x-i;return pr[i][1]+(pr[Math.min(n-1,i+1)][1]-pr[i][1])*f};
      const shuntK=Q.sh/100;
      for(let i=0;i<nR;i++){const r=rb[i];r.u+=dt*r.sp*0.22*(0.75/tr);if(r.u>1)r.u-=1;const c=caps[r.c],p=c.getPointAt(r.u),tg=c.getTangentAt(r.u);q4.setFromUnitVectors(V3(0,1,0),tg);m4.compose(p,q4,V3(1,1,1));rbc.setMatrixAt(i,m4);
        const sh=(r.c/caps.length)<shuntK;const P=sh?Rr.Pv:Pf(r.u),s=gxS(P,Rr.p50);tmp.copy(cV).lerp(Q.co>15?cC:cA,Math.max(0,Math.min(1,s*1.05-0.05)));rbc.setColorAt(i,tmp)}
      rbc.instanceMatrix.needsUpdate=true;if(rbc.instanceColor)rbc.instanceColor.needsUpdate=true;
      // O₂ в алвеоларния въздух ∝ P_AO₂, CO₂ ∝ P_ACO₂
      const nO=Math.min(560,Math.round(Rr.PAO2*1.7)),nC=Math.min(300,Math.round(Rr.PACO2*2.6));let k=0;
      for(let i=0;i<nO;i++){const x=(hsh(i,1)*2-1),y=(hsh(i,2)*2-1),z=-hsh(i,3);const L=Math.hypot(x,y,z)||1,rr=(RA-0.3)*Math.cbrt(hsh(i,4));m4.makeTranslation(x/L*rr+Math.sin(t*1.2+i)*0.06,y/L*rr+Math.cos(t+i)*0.06,z/L*rr);o2.setMatrixAt(k++,m4)}o2.count=k;
      k=0;for(let i=0;i<nC;i++){const x=(hsh(i,5)*2-1),y=(hsh(i,6)*2-1),z=-hsh(i,7);const L=Math.hypot(x,y,z)||1,rr=(RA-0.3)*Math.cbrt(hsh(i,8));m4.makeTranslation(x/L*rr+Math.cos(t*1.1+i)*0.06,y/L*rr,z/L*rr+Math.sin(t+i)*0.05);co2.setMatrixAt(k++,m4)}co2.count=k;
      // дифундиращи молекули през мембраната
      const rate=Q.D/100;if(Math.random()<dt*40){const ci=Math.floor(Math.random()*caps.length),u=Math.random();const P=Pf(u),gO=(Rr.PAO2-P)/60,gC=(Rr.PaCO2+6-Rr.PACO2)*(1-u)/6;const cp=caps[ci].getPointAt(u);
        if(Math.random()<Math.min(1,Math.abs(gO))*rate+0.03)fl.push({k:"o",a:cp.clone().multiplyScalar((RA-0.35)/cp.length()),b:cp.clone(),u:0,dir:gO>=0?1:-1});if(Math.random()<Math.min(1,gC)*rate)fl.push({k:"c",a:cp.clone(),b:cp.clone().multiplyScalar((RA-0.35)/cp.length()),u:0,dir:1})}
      let ko=o2.count,kc=co2.count;for(let i=fl.length-1;i>=0;i--){const f=fl[i];f.u+=dt*(0.5+0.8*rate);if(f.u>1){fl.splice(i,1);continue}const a=f.dir>0?f.a:f.b,b=f.dir>0?f.b:f.a,p=a.clone().lerp(b,f.u);m4.makeTranslation(p.x,p.y,p.z);if(f.k==="o"&&ko<700)o2.setMatrixAt(ko++,m4);else if(kc<500)co2.setMatrixAt(kc++,m4)}
      o2.count=ko;co2.count=kc;o2.instanceMatrix.needsUpdate=true;co2.instanceMatrix.needsUpdate=true;
      k=0;if(Q.co>0){const nCO=Math.min(200,Math.round(Q.co*4));for(let i=0;i<nCO;i++){const r=rb[i%nR],p=caps[r.c].getPointAt(r.u);m4.makeTranslation(p.x+0.12,p.y+0.12,p.z);coM.setMatrixAt(k++,m4)}}coM.count=k;coM.instanceMatrix.needsUpdate=true;
      surfM.opacity=0.18;
      ctx.ov.innerHTML=`P<sub>AO₂</sub> ${fmt(Rr.PAO2,0)} · P<sub>aO₂</sub> ${fmt(Rr.PaO2,0)} mmHg · S<sub>aO₂</sub> ${fmt(Rr.SaO2*100,0)} % · преминаване ${fmt(tr,2)} s`;
      G.render([["алвеоларен въздух",V3(0,0.4,-0.6)],["капиляр",caps[0].getPointAt(0.35)],["сурфактант",V3(-1.7,1.6,-0.9)],["пневмоцит II тип",p2[0]],["макрофаг",V3(-0.6,-2.0,-1.1)],["интерстиций",V3(1.9,-1.6,0.1)]])}},{views:[["Алвеола",[0,0,-0.5,10.5,0.35,1.3]],["Капиляри отблизо",[0.8,0.6,-2.0,3.2,0.3,1.35]],["Отстрани",[0,0,-0.5,10,1.3,1.3]]]});
};
// ---------- V.3 Регулация: мозъчен ствол, хеморецептори, нерви ----------
const _vRR=VIEWS.respreg;
VIEWS.respreg=function(main){_vRR(main);window.__R3=null;
  r3Attach($("#rrC"),470,{r:6.2,th:0.85,phi:1.45,target:[0,6.6,0],fov:38,min:1.2,max:22},(G,ctx)=>{const T=G.T,sc=G.scene,V3=(x,y,z)=>new T.Vector3(x,y,z);G.ren.toneMappingExposure=1.05;
    const bd=r3Body(T,sc,{skin:0.05,brain:true});const th=r3Thorax(T,sc,{op:0.8});
    const nM=R3.phys(T,0xf5c518,{roughness:0.45,emissive:LIN(T,0xf5c518),emissiveIntensity:0.15});
    const nuc=(p,c,r)=>{const g=new T.Mesh(new T.SphereGeometry(r,18,14),R3.glow(T,c,0.7));g.position.copy(p);g.renderOrder=14;sc.add(g);const core=new T.Mesh(new T.SphereGeometry(r*0.5,14,10),R3.phys(T,c));core.position.copy(p);sc.add(core);return g};
    const DRG=[],VRG=[],CC=[],CB=[],PNX=[];
    for(const s of [-1,1]){DRG.push(nuc(V3(s*0.045,7.75,-0.15),0x339af0,0.035));VRG.push(nuc(V3(s*0.1,7.69,-0.06),0x37b24d,0.035));CC.push(nuc(V3(s*0.08,7.66,0.04),0xf76707,0.04));PNX.push(nuc(V3(s*0.08,8.14,-0.12),0xae3ec9,0.035));
      CB.push(nuc(V3(s*0.31,6.8,0.29),0xe03131,0.045))}
    {const art=R3.phys(T,0xc92a2a,{roughness:0.4});sc.add(R3.vtube(T,[V3(-0.22,5.95,0.2),V3(-0.28,6.3,0.26),V3(-0.31,6.68,0.3),V3(-0.31,6.8,0.3)],u=>0.034,art,{seg:30}));sc.add(R3.tube(T,[V3(-0.31,6.8,0.3),V3(-0.34,7.05,0.23),V3(-0.32,7.35,0.14),V3(-0.24,7.62,0.08)],0.026,art,{seg:30}));sc.add(R3.tube(T,[V3(-0.31,6.8,0.3),V3(-0.28,7.0,0.38),V3(-0.25,7.22,0.46)],0.02,art,{seg:20}))}
    const AB=nuc(V3(0.1,5.66,0.11),0xe03131,0.06);
    // нерви
    const nerve=(pts,r=0.011)=>{const m=R3.tube(T,pts.map(p=>V3(...p)),r,nM,{seg:80,rad:6});sc.add(m);return m.userData.curve};
    const N={};
    N.ixL=nerve([[0.31,6.8,0.29],[0.26,7.1,0.15],[0.16,7.45,0.0],[0.1,7.68,-0.06]]);N.ixR=nerve([[-0.31,6.8,0.29],[-0.26,7.1,0.15],[-0.16,7.45,0.0],[-0.1,7.68,-0.06]]);
    N.vL=nerve([[0.45,5.15,-0.2],[0.3,5.6,-0.12],[0.28,6.3,0.08],[0.24,6.9,0.12],[0.15,7.45,-0.02],[0.07,7.72,-0.12]]);N.vR=nerve([[-0.45,5.2,-0.2],[-0.3,5.6,-0.12],[-0.28,6.3,0.08],[-0.24,6.9,0.12],[-0.15,7.45,-0.02],[-0.07,7.72,-0.12]]);
    N.phL=nerve([[0.05,7.15,-0.12],[0.25,7.0,0.05],[0.35,6.4,0.15],[0.5,5.6,0.35],[0.62,4.9,0.4],[0.62,4.4,0.1]]);N.phR=nerve([[-0.05,7.15,-0.12],[-0.25,7.0,0.05],[-0.35,6.4,0.15],[-0.5,5.6,0.3],[-0.62,4.9,0.35],[-0.62,4.5,0.1]]);
    N.ab=nerve([[0.1,5.66,0.11],[0.2,6.0,0.0],[0.26,6.6,0.06]],0.012);
    const tract=new T.CatmullRomCurve3([V3(0,7.7,-0.1),V3(0,7.4,-0.12),V3(0,7.15,-0.12)]),cortex=new T.CatmullRomCurve3([V3(0.15,8.7,0.1),V3(0.1,8.3,0),V3(0.06,7.85,-0.08)]);
    const P={};const pc=(k,c,cv)=>{P[k]=R3.pulses(T,cv||N[k],c,14,0.026);sc.add(P[k].mesh)};
    pc("ixL",0xff6b6b);pc("ixR",0xff6b6b);pc("vL",0x4dabf7);pc("vR",0x4dabf7);pc("phL",0x51cf66);pc("phR",0x51cf66);pc("ab",0xff6b6b);pc("tr",0x51cf66,tract);pc("cx",0x20c997,cortex);
    // прекъснат вагус
    const cutM=new T.Mesh(new T.SphereGeometry(0.06,12,10),R3.glow(T,0xe03131,0.9));sc.add(cutM);const cutM2=cutM.clone();sc.add(cutM2);
    let lastV=0,t=0;
    return dt=>{t+=dt;const S=window.__R3;if(!S||!S.s){G.render([]);return}const s=S.s,p=S.p,d=s.dr||{cen:0,hyp:0,acid:0,exr:0,tot:4};
      const V=s.vol||0,flow=(V-lastV)/Math.max(dt,1e-3);lastV=V;th.update(dt,V,flow,false);
      const insp=flow>0.02,ramp=s.ramp||0;
      const k=x=>Math.max(0,Math.min(1,x));
      CC.forEach(m=>{const a=k(0.25+d.cen/12);m.material.opacity=0.25+0.7*a;m.scale.setScalar(0.8+a*0.9)});
      CB.forEach(m=>{const a=k(0.2+(d.hyp+Math.max(0,d.acid))/10);m.material.opacity=0.25+0.7*a;m.scale.setScalar(0.8+a*0.9)});AB.material.opacity=0.2+0.5*k(d.hyp/12);
      DRG.forEach(m=>{const a=k(ramp/2.5+0.15);m.material.opacity=0.3+0.65*a;m.scale.setScalar(0.8+a)});VRG.forEach(m=>{const a=k((d.tot-6)/30+ (insp?0.2:0));m.material.opacity=0.25+0.6*a});PNX.forEach(m=>{m.material.opacity=0.25+0.5*k((p.pnx-0.3)/1.7)});
      P.ixL.update(dt,4+(d.hyp+Math.max(0,d.acid))*3);P.ixR.update(dt,4+(d.hyp+Math.max(0,d.acid))*3);P.ab.update(dt,1+d.hyp*1.5);
      const vr=p.vag?0:Math.max(0,V)*30;P.vL.update(dt,vr,0.7);P.vR.update(dt,vr,0.7);
      const ph=insp&&!s.bh?8+ramp*16:0;P.phL.update(dt,ph,1.1);P.phR.update(dt,ph,1.1);P.tr.update(dt,ph,1.4);P.cx.update(dt,(p.ex||0)/5+(s.hv>0?12:0),0.9);
      cutM.visible=cutM2.visible=!!p.vag;cutM.position.copy(N.vL.getPointAt(0.55));cutM2.position.copy(N.vR.getPointAt(0.55));
      const pH=6.1+Math.log10(p.hco3/(0.03*s.P));
      ctx.ov.innerHTML=`P<sub>aCO₂</sub> ${fmt(s.P,0)} · P<sub>aO₂</sub> ${fmt(Math.max(15,s.O-(p.copd?25:6)),0)} mmHg · pH ${fmt(pH,2)} · V<sub>A</sub> ${fmt(s.VA,1)} L/min${s.bh?" · задържан дъх":""}`;
      G.render([["продълговат мозък (ДДГ, ВДГ)",V3(0,7.78,-0.35)],["централни хеморецептори",V3(-0.1,7.6,0.18)],["пневмотаксичен център",V3(0,8.22,-0.3)],["каротидно телце",V3(0.31,6.85,0.38)],["аортни телца",V3(0.2,5.72,0.2)],["n. vagus",N.vR.getPointAt(0.45)],["n. phrenicus",N.phL.getPointAt(0.55)],["диафрагма",V3(-0.7,4.2,0.7)]])}},{full:true,views:[["Цяло",[0,6.6,0,6.2,0.85,1.45]],["Мозъчен ствол",[0,7.8,-0.05,1.6,1.1,1.5]],["Каротидно телце",[0.25,6.9,0.2,1.5,0.9,1.4]],["Гръден кош",[0,5.2,0,5.5,0.4,1.35]]]});
};
/* ===== VI. Бъбреци — 3D сцени ===== */
function k3Mount(kind,cv,get){const F={gfr:k3GFR,tubule:k3Tub,volreg:k3Vol}[kind];if(F)F(cv,get)}
// ---- VI.1 Гломерул ----
function k3GFR(cv,get){
  r3Attach(cv,440,{r:8.4,th:0.22,phi:1.3,target:[-0.3,0.4,0],fov:38,min:3,max:30},(G,ctx)=>{const T=G.T,sc=G.scene,V3=(x,y,z)=>new T.Vector3(x,y,z),R=MK.rnd(17);G.ren.toneMappingExposure=1.05;G.ren.localClippingEnabled=true;
    const RB=2.4,cut=new T.Plane(V3(0,0,-1),0.15),pole=V3(-1.55,1.75,0);
    // капсула на Боуман: париетален лист (разрязан отпред) и пространство
    const capTex=R3.tex(T,512,256,(g,W,H)=>{g.fillStyle="#f3d9a4";g.fillRect(0,0,W,H);const r=MK.rnd(4);for(let i=0;i<700;i++){g.strokeStyle="rgba(190,140,70,.35)";g.beginPath();const x=r()*W,y=r()*H;g.ellipse(x,y,7+r()*5,5+r()*3,r()*3,0,7);g.stroke();g.fillStyle="rgba(150,100,60,.4)";g.beginPath();g.arc(x,y,1.5,0,7);g.fill()}});
    const cap=new T.Mesh(new T.SphereGeometry(RB,64,48),R3.phys(T,0xffffff,{map:capTex,roughness:0.55,side:T.DoubleSide,clippingPlanes:[cut],transparent:true,opacity:0.5,depthWrite:false}));cap.renderOrder=5;sc.add(cap);
    const bsp=new T.Mesh(new T.SphereGeometry(RB-0.05,48,36),R3.glass(T,0xfff3bf,0.12,{clippingPlanes:[cut]}));sc.add(bsp);
    // проксимален тубул от уринарния полюс
    const pctC=new T.CatmullRomCurve3([V3(1.55,-1.75,0),V3(2.6,-2.9,0.3),V3(4.2,-3.2,-0.4),V3(5.4,-2.2,0.6),V3(6.6,-2.8,0.2)]);
    const pct=R3.vtube(T,pctC,u=>0.6+0.08*Math.sin(u*20),R3.phys(T,0xf2c49b,{roughness:0.5,transparent:true,opacity:0.55,depthWrite:false,side:T.DoubleSide}),{seg:90,rad:20});pct.renderOrder=6;sc.add(pct);
    // аферентна и еферентна артериола
    const affC=new T.CatmullRomCurve3([V3(-7.5,4.2,-0.5),V3(-5,3.4,-0.3),V3(-3,2.5,-0.1),pole.clone().add(V3(-0.1,0.05,-0.15))]),effC=new T.CatmullRomCurve3([pole.clone().add(V3(0.05,0.2,0.3)),V3(-2.8,3.4,0.8),V3(-5,4.6,1.2),V3(-7.5,5.6,1.5)]);
    const affM=R3.phys(T,0xd9363e,{roughness:0.35,clearcoat:0.5,transparent:true,opacity:0.5,depthWrite:false}),effM=R3.phys(T,0xb02a4f,{roughness:0.35,clearcoat:0.5,transparent:true,opacity:0.5,depthWrite:false});
    let aff=null,eff=null,lastA=-1,lastE=-1;const mkArt=(c,r,m)=>{const me=R3.tube(T,c,r,m,{seg:60,rad:16});me.renderOrder=7;sc.add(me);return me};
    // гладкомускулни пръстени по аферентната
    const ringN=16,rings=new T.InstancedMesh(new T.TorusGeometry(1,0.12,8,24),R3.phys(T,0xf08c00,{roughness:0.5}),ringN*2),m4=new T.Matrix4(),q4=new T.Quaternion();sc.add(rings);
    // юкстагломерулни клетки и macula densa
    const jg=[];for(let i=0;i<9;i++){const p=affC.getPointAt(0.82+i*0.018);const m=new T.Mesh(new T.SphereGeometry(0.13,12,10),R3.phys(T,0xc0eb75,{emissive:LIN(T,0x94d82d),emissiveIntensity:0.1}));m.position.copy(p).add(V3(0,0.36,0.1*(i%3-1)));sc.add(m);jg.push(m)}
    const dctC=new T.CatmullRomCurve3([V3(-2.0,-1.8,3.6),V3(-2.6,0.6,2.2),V3(-2.15,2.25,0.55),V3(-2.4,4.2,-1.0),V3(-1.5,6,-2)]);sc.add(Object.assign(R3.vtube(T,dctC,()=>0.3,R3.phys(T,0xcfe2b9,{roughness:0.5,transparent:true,opacity:0.3,depthWrite:false,side:T.DoubleSide}),{seg:60,rad:16}),{renderOrder:6}));
    const md=MK.blob(T,[[-2.3,2.0,0.6,0.28,0x40c057],[-2.25,2.35,0.45,0.26,0x40c057],[-2.4,1.7,0.75,0.22,0x37b24d]],{res:24});sc.add(md);
    // капилярно кълбо: бримки от аферентната към еферентната
    const loops=[],capM=R3.phys(T,0xe8737a,{roughness:0.3,clearcoat:0.5,transparent:true,opacity:0.5,depthWrite:false});
    const tc0=V3(0.15,-0.1,0),inBall=()=>{for(;;){const p=V3(R()*2-1,R()*2-1,R()*2-1);if(p.length()<1)return p.multiplyScalar(1.75).add(tc0)}};
    for(let k=0;k<13;k++){const ax=V3(R()-0.5,R()-0.5,R()-0.5).normalize(),q=[];for(let i=0;i<5;i++){let p=inBall();for(let j=0;j<6&&p.clone().sub(tc0).dot(ax)<-0.3;j++)p=inBall();q.push(p)}
      q.sort((a,b)=>Math.atan2(a.y-tc0.y,a.x-tc0.x)-Math.atan2(b.y-tc0.y,b.x-tc0.x));const pts=[pole.clone().add(V3(0.1,-0.1,-0.12))].concat(q,[pole.clone().add(V3(0.12,0.12,0.22))]);
      const me=R3.tube(T,pts,0.15,capM,{seg:110,rad:12});me.renderOrder=8;sc.add(me);loops.push(me.userData.curve)}
    // подоцити и крачета
    const podB=new T.InstancedMesh(new T.SphereGeometry(0.15,12,10),R3.phys(T,0xd0bfff,{roughness:0.45,clearcoat:0.4}),40),feet=new T.InstancedMesh(new T.SphereGeometry(0.04,6,5),R3.phys(T,0xb197fc,{roughness:0.5}),900);
    let fi=0;for(let i=0;i<40;i++){const c=loops[i%loops.length],u=0.15+R()*0.7,p=c.getPointAt(u),tg=c.getTangentAt(u),n=V3(R()-0.5,R()-0.5,R()-0.5).cross(tg).normalize();m4.makeTranslation(p.x+n.x*0.24,p.y+n.y*0.24,p.z+n.z*0.24);podB.setMatrixAt(i,m4);
      for(let j=0;j<22&&fi<900;j++){const uu=Math.max(0,Math.min(1,u+(R()-0.5)*0.12)),pp=c.getPointAt(uu),t2=c.getTangentAt(uu),nn=V3(R()-0.5,R()-0.5,R()-0.5).cross(t2).normalize();q4.setFromUnitVectors(V3(0,1,0),nn);m4.compose(pp.add(nn.multiplyScalar(0.18)),q4,V3(1,2.2,1));feet.setMatrixAt(fi++,m4)}}feet.count=fi;sc.add(podB,feet);
    const mes=MK.blob(T,[[-0.9,0.9,0,0.3,0xffa8a8],[-0.5,0.5,0.1,0.25,0xffa8a8],[-1.1,0.4,-0.2,0.22,0xff8787]],{res:24});sc.add(mes);
    // еритроцити: аферентна → бримка → еферентна
    const paths=loops.map(c=>{const P=[];for(let i=0;i<=10;i++)P.push(affC.getPointAt(i/10));for(let i=1;i<=24;i++)P.push(c.getPointAt(i/24));for(let i=1;i<=10;i++)P.push(effC.getPointAt(i/10));return new T.CatmullRomCurve3(P)});
    const nR=150,rbc=new T.InstancedMesh(R3.rbcGeo(T,0.13),R3.phys(T,0xd6202a,{roughness:0.35,clearcoat:0.6}),nR);rbc.frustumCulled=false;sc.add(rbc);const rb=[];for(let i=0;i<nR;i++)rb.push({c:i%paths.length,u:Math.random(),sp:0.85+Math.random()*0.3});
    // филтрат: от капилярите към уринарния полюс и тубула
    const fil=MK.pool(T,0xfab005,0.06,500,{glow:0.5,seg:8});sc.add(fil);const FL=[];
    const prot=MK.pool(T,0x845ef7,0.09,120,{glow:0.2,seg:8});sc.add(prot);
    let t=0;
    return dt=>{t+=dt;const S=get();if(!S||!S.R){G.render([]);return}const Rr=S.R,p=S.p;
      const ra=Rr.Ra/GFR_RA0,re=p.Re/GFR_RE0,rA=Math.max(0.16,0.42/Math.pow(ra,0.35)),rE=Math.max(0.12,0.32/Math.pow(re,0.35));
      if(Math.abs(rA-lastA)>0.01){if(aff){sc.remove(aff);aff.geometry.dispose()}aff=mkArt(affC,rA,affM);lastA=rA;for(let i=0;i<ringN;i++){const u=0.15+i*0.042,pp=affC.getPointAt(u),tg=affC.getTangentAt(u);q4.setFromUnitVectors(V3(0,0,1),tg);m4.compose(pp,q4,V3(rA+0.05,rA+0.05,rA+0.05));rings.setMatrixAt(i,m4)}rings.instanceMatrix.needsUpdate=true}
      if(Math.abs(rE-lastE)>0.01){if(eff){sc.remove(eff);eff.geometry.dispose()}eff=mkArt(effC,rE,effM);lastE=rE;for(let i=0;i<ringN;i++){const u=0.1+i*0.045,pp=effC.getPointAt(u),tg=effC.getTangentAt(u);q4.setFromUnitVectors(V3(0,0,1),tg);m4.compose(pp,q4,V3(rE+0.04,rE+0.04,rE+0.04).multiplyScalar(0.9));rings.setMatrixAt(ringN+i,m4)}rings.instanceMatrix.needsUpdate=true}
      rings.material.emissive=rings.material.emissive||new T.Color();
      const sp=Math.min(2.5,Rr.RBF/1100);for(let i=0;i<nR;i++){const r=rb[i];r.u+=dt*0.08*sp*r.sp;if(r.u>1)r.u-=1;const c=paths[r.c],pp=c.getPointAt(r.u),tg=c.getTangentAt(r.u);q4.setFromUnitVectors(V3(0,1,0),tg);m4.compose(pp,q4,V3(1,1,1));rbc.setMatrixAt(i,m4)}rbc.instanceMatrix.needsUpdate=true;
      // филтрация ∝ GFR, по-силна в началото на бримката (нетното налягане пада)
      const rate=Rr.GFR*0.6;if(Math.random()<dt*rate)for(let k=0;k<Math.ceil(dt*rate);k++){const c=loops[Math.floor(Math.random()*loops.length)],u=Math.pow(Math.random(),1.6)*0.9+0.05,a=c.getPointAt(u),o=a.clone().sub(V3(-0.6,0.4,0)).normalize();FL.push({a,b:a.clone().add(o.multiplyScalar(0.7)),u:0,ph:0})}
      let k=0;for(let i=FL.length-1;i>=0;i--){const f=FL[i];f.u+=dt*(f.ph?0.35:0.9);if(f.u>=1){if(f.ph===0){f.ph=1;f.u=0;f.a=f.b;f.b=V3(1.55,-1.75,0)}else if(f.ph===1){f.ph=2;f.u=0}else{FL.splice(i,1);continue}}}
      FL.forEach(f=>{const pp=f.ph<2?f.a.clone().lerp(f.b,f.u):pctC.getPointAt(Math.min(1,f.u));if(k<500){m4.makeTranslation(pp.x,pp.y,pp.z);fil.setMatrixAt(k++,m4)}});if(FL.length>480)FL.splice(0,FL.length-480);fil.count=k;fil.instanceMatrix.needsUpdate=true;
      // белтъци остават в капилярите (концентрацията им расте по дължината)
      k=0;for(let i=0;i<120;i++){const c=loops[i%loops.length],u=((i*0.137+t*0.05*sp)%1),pp=c.getPointAt(u);m4.makeScale(1,1,1);m4.setPosition(pp.x+0.05,pp.y-0.05,pp.z);prot.setMatrixAt(k++,m4)}prot.count=k;prot.instanceMatrix.needsUpdate=true;
      jg.forEach(m=>{m.material.emissiveIntensity=0.1+0.9*Math.max(0,Math.min(1,(95-p.map)/30))});
      ctx.ov.innerHTML=`GFR ${fmt(Rr.GFR,0)} mL/min · кръвоток ${fmt(Rr.RBF,0)} mL/min · P<sub>GC</sub> ${fmt(Rr.Pgc,0)} · P<sub>B</sub> ${fmt(p.pb,0)} · π ${fmt(piLP(p.prot),0)}→${fmt(Rr.piE,0)} mmHg`;
      G.render([["аферентна артериола",affC.getPointAt(0.35).add(V3(0,0.9,0))],["еферентна артериола",effC.getPointAt(0.65).add(V3(0,0.9,0))],["капсула на Боуман",V3(1.2,1.9,-1.0)],["капилярно кълбо",V3(-0.3,0.1,0.5)],["подоцити",V3(0.6,-0.6,0.4)],["macula densa",V3(-2.5,1.8,1.2)],["проксимален тубул",pctC.getPointAt(0.6).add(V3(0,0.9,0))],["ЮГ клетки (ренин)",affC.getPointAt(0.86).add(V3(0,0.8,0))]])}},{full:false,views:[["Цял гломерул",[-0.3,0.4,0,8.4,0.22,1.3]],["Съдов полюс",[-2,2,0.3,4.5,0.9,1.2]],["Кълбо отблизо",[-0.5,0.3,0.4,3.6,0.2,1.35]],["Уринарен полюс",[2.5,-2.4,0.2,5,0.6,1.3]]]})}
// ---- VI.2 Нефрон в тъканта на бъбрека ----
function k3Tub(cv,get){
  r3Attach(cv,480,{r:12.5,th:0.45,phi:1.38,target:[0.3,-0.9,0],fov:38,min:3,max:40},(G,ctx)=>{const T=G.T,sc=G.scene,V3=(x,y,z)=>new T.Vector3(x,y,z),Rn=MK.rnd(31);G.ren.toneMappingExposure=1.05;
    const Y0=4.2,Y1=1.2,Y2=-1.8,Y3=-6.0;// кора | външна медула | вътрешна медула | папила
    // тъканен блок с градиент на осмолалитета
    const tc=document.createElement("canvas");tc.width=16;tc.height=256;const tg=tc.getContext("2d");const ttex=new T.CanvasTexture(tc);ttex.encoding=T.sRGBEncoding;
    const OC=[[50,[116,192,252]],[300,[255,224,102]],[700,[247,103,7]],[1250,[165,30,40]]],oc=o=>{let i=0;while(i<OC.length-2&&o>OC[i+1][0])i++;const [a,ca]=OC[i],[b,cb]=OC[i+1],u=Math.max(0,Math.min(1,(o-a)/(b-a)));return `rgb(${ca.map((c,k)=>Math.round(c+(cb[k]-c)*u)).join(",")})`};
    let lastMp=0;const paintT=Mp=>{for(let y=0;y<256;y++){const Y=Y0-(Y0-Y3)*y/255,o=Y>Y1?300:300+(Mp-300)*Math.min(1,(Y1-Y)/(Y1-Y3));tg.fillStyle=oc(o);tg.fillRect(0,y,16,1)}ttex.needsUpdate=true};
    const blk=new T.Mesh(new T.BoxGeometry(11,Y0-Y3,4.2),new T.MeshStandardMaterial({map:ttex,transparent:true,opacity:0.16,depthWrite:false,side:T.DoubleSide,roughness:0.9}));blk.position.set(0.5,(Y0+Y3)/2,0);blk.renderOrder=1;sc.add(blk);
    const edges=new T.LineSegments(new T.EdgesGeometry(blk.geometry),new T.LineBasicMaterial({color:0xadb5bd,transparent:true,opacity:0.5}));edges.position.copy(blk.position);sc.add(edges);
    [Y1,Y2].forEach(y=>{const pl=new T.Mesh(new T.PlaneGeometry(11,4.2),new T.MeshBasicMaterial({color:0x868e96,transparent:true,opacity:0.07,side:T.DoubleSide,depthWrite:false}));pl.rotation.x=Math.PI/2;pl.position.set(0.5,y,0);sc.add(pl)});
    // капсула на бъбрека отгоре
    const capsM=R3.phys(T,0xf1e3d3,{roughness:0.6,transparent:true,opacity:0.6,depthWrite:false});const caps=new T.Mesh(new T.BoxGeometry(11,0.12,4.2),capsM);caps.position.set(0.5,Y0+0.06,0);sc.add(caps);
    // път на нефрона
    const g0=V3(-3.2,3.2,0),seg={};const path=(k,pts)=>{seg[k]=new T.CatmullRomCurve3(pts)};
    const pctP=[V3(-2.75,3.0,0.1)];for(let i=1;i<=22;i++){const u=i/22;pctP.push(V3(-2.75+u*2.2+Math.sin(u*19)*0.45,3.0-u*1.4+Math.cos(u*15)*0.35,Math.sin(u*23)*0.7))}pctP.push(V3(-0.5,1.3,0));path("pct",pctP);
    path("dtl",[V3(-0.5,1.3,0),V3(-0.45,-1,0.05),V3(-0.42,-3.5,0.05),V3(-0.38,-5.3,0.05),V3(-0.1,-5.62,0.05)]);
    path("atl",[V3(-0.1,-5.62,0.05),V3(0.18,-5.3,0.05),V3(0.2,-3.5,0.05),V3(0.22,-1.8,0.05)]);
    path("tal",[V3(0.22,-1.8,0.05),V3(0.25,0,0.05),V3(0.3,1.6,0.05),V3(-1.6,2.85,0.45),V3(-2.55,3.35,0.45)]);
    const dctP=[V3(-2.55,3.35,0.45)];for(let i=1;i<=16;i++){const u=i/16;dctP.push(V3(-2.55+u*4.0+Math.sin(u*14)*0.4,3.35-u*0.2+Math.cos(u*12)*0.3,0.45+Math.sin(u*17)*0.6))}dctP.push(V3(2.5,2.6,0));path("dct",dctP);
    path("cd",[V3(2.5,2.6,0),V3(3.2,2.0,0),V3(3.3,0,0),V3(3.35,-3,0),V3(3.4,-5.4,0),V3(3.45,-6.1,0)]);
    const SEG=[["pct",0.34,0xf2c49b],["dtl",0.12,0xc5d9f1],["atl",0.12,0xd3e4f5],["tal",0.24,0xf8c98a],["dct",0.24,0xcfe2b9],["cd",0.36,0xe2d4f3]],meshes={};
    SEG.forEach(([k,r,c])=>{const g=new T.TubeGeometry(seg[k],k==="pct"||k==="dct"?160:60,r,14,false);const col=new Float32Array(g.attributes.position.count*3).fill(1);g.setAttribute("color",new T.BufferAttribute(col,3));
      const m=new T.Mesh(g,R3.phys(T,0xffffff,{vertexColors:true,roughness:0.4,clearcoat:0.5}));m.userData.k=k;m.userData.base=c;sc.add(m);meshes[k]=m});
    // гломерул и капсула на Боуман
    const bc=new T.Mesh(new T.SphereGeometry(0.62,32,24),R3.glass(T,0xf3d9a4,0.45));bc.position.copy(g0);sc.add(bc);sc.add(Object.assign(MK.blob(T,[[g0.x,g0.y,g0.z,0.35,0xd6336c],[g0.x+0.2,g0.y-0.1,g0.z+0.15,0.28,0xe03131],[g0.x-0.15,g0.y+0.12,g0.z-0.12,0.26,0xc92a2a]],{res:24})));
    // vasa recta
    const vrM=R3.phys(T,0xe8737a,{roughness:0.4,transparent:true,opacity:0.55,depthWrite:false}),vvM=R3.phys(T,0x748ffc,{roughness:0.4,transparent:true,opacity:0.55,depthWrite:false});
    for(const dz of [-0.9,0.9]){const x=-0.1+dz*0.2;sc.add(R3.tube(T,[V3(x-0.25,1.5,dz),V3(x-0.25,-3,dz),V3(x-0.2,-5.2,dz),V3(x,-5.5,dz)],0.07,vrM,{seg:40,rad:8}));sc.add(R3.tube(T,[V3(x,-5.5,dz),V3(x+0.2,-5.2,dz),V3(x+0.25,-3,dz),V3(x+0.25,1.5,dz)],0.08,vvM,{seg:40,rad:8}))}
    // папила и отвор
    const pap=new T.Mesh(new T.ConeGeometry(1.4,1.0,32,1,true),R3.phys(T,0xe9b7a8,{transparent:true,opacity:0.35,depthWrite:false,side:T.DoubleSide}));pap.rotation.x=Math.PI;pap.position.set(3.4,Y3-0.4,0);sc.add(pap);
    // течност в тубула и транспорт през стената
    const order=["pct","dtl","atl","tal","dct","cd"],Ls=order.map(k=>seg[k].getLength()),Lt=Ls.reduce((a,b)=>a+b,0);
    const flP=MK.pool(T,0xffffff,0.07,400,{glow:0.6,seg:8});sc.add(flP);const fl=[];
    const wP=MK.pool(T,0x339af0,0.085,400,{glow:0.6,seg:8}),nP=MK.pool(T,0xf76707,0.085,400,{glow:0.6,seg:8}),uP=MK.pool(T,0xae3ec9,0.085,200,{glow:0.6,seg:8});sc.add(wP,nP,uP);const ex={w:[],n:[],u:[]};
    const m4=new T.Matrix4();
    const emit=(arr,k,u0,u1,rate,dt,dir=1)=>{if(Math.random()<dt*rate)for(let i=0;i<Math.ceil(dt*rate);i++){const u=u0+Math.random()*(u1-u0),p=seg[k].getPointAt(u),tg=seg[k].getTangentAt(u),n=V3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).cross(tg).normalize();arr.push({a:p.clone().add(n.clone().multiplyScalar(0.2)),b:p.clone().add(n.multiplyScalar(0.9)),u:0})}};
    const drawEx=(pool,arr,dt,max)=>{let k=0;for(let i=arr.length-1;i>=0;i--){arr[i].u+=dt*1.2;if(arr[i].u>1){arr.splice(i,1)}}arr.forEach(q=>{if(k>=max)return;const p=q.a.clone().lerp(q.b,q.u);m4.makeTranslation(p.x,p.y,p.z);pool.setMatrixAt(k++,m4)});pool.count=k;pool.instanceMatrix.needsUpdate=true};
    // избор на сегмент с докосване
    const ray=new T.Raycaster(),mv=new T.Vector2();let down=null;
    G.cv.addEventListener("pointerdown",e=>{down=[e.clientX,e.clientY]});G.cv.addEventListener("pointerup",e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=G.cv.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,G.cam);const h=ray.intersectObjects(Object.values(meshes));if(h.length){const S=get();if(S&&S.pick)S.pick(h[0].object.userData.k)}});
    let lastKey="";const tmpC=new T.Color();
    return dt=>{const S=get();if(!S||!S.R){G.render([]);return}const R=S.R,p=S.p;
      if(Math.abs(R.Mp-lastMp)>2){paintT(R.Mp);lastMp=R.Mp}
      // цвят на течността по осмолалитета
      const key=[R.Mp,R.Otal,R.Odct,R.Occd,R.U,S.seg].map(v=>typeof v==="number"?Math.round(v):v).join();
      if(key!==lastKey){lastKey=key;const dep=y=>y>Y1?300:300+(R.Mp-300)*Math.min(1,(Y1-y)/(Y1-Y3));
        order.forEach(k=>{const m=meshes[k],g=m.geometry,P=g.attributes.position,C=g.attributes.color,segs=g.parameters.tubularSegments,rad=g.parameters.radialSegments;
          for(let i=0;i<=segs;i++){const u=i/segs,y=seg[k].getPointAt(u).y;let o=300;
            if(k==="dtl")o=dep(y);else if(k==="atl")o=dep(y)-40*u;else if(k==="tal")o=u<0.55?(dep(y)-40)+(R.Otal-(dep(y)-40))*Math.min(1,u/0.55):R.Otal;else if(k==="dct")o=R.Otal+(R.Odct-R.Otal)*u;else if(k==="cd")o=y>Y1?R.Odct+(R.Occd-R.Odct)*Math.min(1,u*3):R.Occd+(R.U-R.Occd)*Math.min(1,(Y1-y)/(Y1-Y3+0.3));
            tmpC.set(oc(o));if(S.seg===k)tmpC.lerp(new T.Color(0x1971c2),0.35);for(let j=0;j<=rad;j++){const idx=i*(rad+1)+j;C.setXYZ(idx,tmpC.r,tmpC.g,tmpC.b)}}C.needsUpdate=true})}
      // поток в тубула
      if(Math.random()<dt*8)fl.push({d:0});const spd=d=>{const L=Ls[0],L2=L+Ls[1]+Ls[2]+Ls[3]+Ls[4];return d<L?2.2:d<L2?1.3:0.6+Math.min(2,R.V*0.15)};
      let k=0;for(let i=fl.length-1;i>=0;i--){const f=fl[i];f.d+=dt*spd(f.d);if(f.d>=Lt){fl.splice(i,1);continue}let d=f.d,si=0;while(si<5&&d>Ls[si]){d-=Ls[si];si++}const pp=seg[order[si]].getPointAt(Math.min(1,d/Ls[si]));m4.makeTranslation(pp.x,pp.y,pp.z);if(k<400)flP.setMatrixAt(k++,m4)}flP.count=k;flP.instanceMatrix.needsUpdate=true;
      // реабсорбция: вода (проксимален, низходящо коляно, СК според ADH), NaCl (проксимален, дебел сегмент, дистален), урея (вътрешна медула)
      emit(ex.w,"pct",0,1,18,dt);emit(ex.w,"dtl",0.1,0.95,18*(R.Mp-300)/900,dt);emit(ex.w,"cd",0.25,1,30*R.ae,dt);
      emit(ex.n,"pct",0,1,14,dt);emit(ex.n,"tal",0,0.6,28*p.tal,dt);emit(ex.n,"dct",0,1,12*p.dct,dt);emit(ex.n,"cd",0.1,0.6,6*p.enac*Math.min(1.6,p.aldo),dt);emit(ex.u,"cd",0.6,1,16*R.ae*p.urea,dt);
      drawEx(wP,ex.w,dt,400);drawEx(nP,ex.n,dt,400);drawEx(uP,ex.u,dt,200);
      ctx.ov.innerHTML=`Урина ${fmt(R.U,0)} mOsm/kg · ${fmt(R.V,2)} mL/min · връх на папилата ${fmt(R.Mp,0)} mOsm/kg <span style="color:#339af0">● вода</span> <span style="color:#f76707">● NaCl</span> <span style="color:#ae3ec9">● урея</span>`;
      G.render([["кора",V3(-4.6,3.8,2.1)],["външна медула",V3(-4.4,-0.3,2.1)],["вътрешна медула",V3(-4.3,-4,2.1)],["проксимален тубул",V3(-1.6,2.3,0.8)],["низходящо коляно",seg.dtl.getPointAt(0.5).add(V3(-0.9,0,0))],["дебел възх. сегмент",seg.tal.getPointAt(0.3).add(V3(1.1,0,0))],["дистален тубул",V3(0.4,3.85,0.9)],["събирателен канал",seg.cd.getPointAt(0.55).add(V3(1.0,0,0))],["vasa recta",V3(-0.5,-2.6,1.2)]])}},{full:true,views:[["Цял нефрон",[0.4,-0.6,0,15,0.55,1.35]],["Кора",[-1,2.8,0,6,0.4,1.25]],["Бримка на Хенле",[0,-4,0,6,0.7,1.45]],["Отгоре",[0.4,-0.6,0,14,0.3,0.4]]]})}
// ---- VI.3 Цялото тяло: ADH, РААС, ANP ----
function mkKidney(T,s){const g=new T.Group();const V3=(x,y,z)=>new T.Vector3(x,y,z);
  // бобовидна форма: деформирана сфера с вдлъбнат хилус
  const geo=new T.SphereGeometry(1,48,36),P=geo.attributes.position;for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),z=P.getZ(i);const hil=Math.exp(-(y*y)/0.18)*Math.max(0,-x*s)*0.55;x=x*0.55*(1-hil*0.9);P.setXYZ(i,x+s*0.0,y*1.0,z*0.38)}geo.computeVertexNormals();
  const tex=R3.tex(T,512,256,(c,W,H)=>{const R=MK.rnd(s>0?3:8);c.fillStyle="#8f3b2f";c.fillRect(0,0,W,H);for(let i=0;i<400;i++){c.fillStyle=`rgba(${120+R()*50|0},${40+R()*20|0},${35+R()*20|0},.4)`;c.beginPath();c.arc(R()*W,R()*H,3+R()*10,0,7);c.fill()}});
  const k=new T.Mesh(geo,R3.phys(T,0xffffff,{map:tex,roughness:0.35,clearcoat:0.6,emissive:LIN(T,0xe8590c),emissiveIntensity:0}));g.add(k);g.userData.k=k;
  const adr=new T.Mesh(new T.ConeGeometry(0.32,0.38,4),R3.phys(T,0xf2c14e,{roughness:0.5,emissive:LIN(T,0xf59f00),emissiveIntensity:0}));adr.position.set(-s*0.05,1.08,0);adr.scale.set(1,1,0.5);g.add(adr);g.userData.adr=adr;return g}
function k3Vol(cv,get){
  r3Attach(cv,520,{r:9.5,th:0.45,phi:1.45,target:[0,5.4,0],fov:38,min:2,max:30},(G,ctx)=>{const T=G.T,sc=G.scene,V3=(x,y,z)=>new T.Vector3(x,y,z);G.ren.toneMappingExposure=1.05;
    const bd=r3Body(T,sc,{skin:0.06,brain:true});
    // бели дробове (статични) и сърце
    const oldL=[];for(const s of [-1,1]){const m=mkLung(T,s,R3.phys(T,0xffffff,{map:lungTex(T,s>0?11:7),roughness:0.6,transparent:true,opacity:0.35,depthWrite:false}));m.renderOrder=4;sc.add(m);oldL.push(m)}
    const heart=mkHeart(T);heart.scale.setScalar(0.8);heart.position.set(0.15*0.2+0.1,4.85*0.2-0.06,0.3*0.2);sc.add(heart);
    if(typeof RealLungs==="function"){const b=new T.Box3().setFromObject(oldL[0]).union(new T.Box3().setFromObject(oldL[1]));ctx.__RL=RealLungs(T,sc,b,{op:0.35,G});oldL.forEach(m=>m.visible=false)}
    if(typeof RealHeart==="function"){ctx.__RH=RealHeart(G,sc,new T.Box3().setFromObject(heart));heart.visible=false}
    const atr=new T.Mesh(new T.SphereGeometry(0.2,20,14),R3.glow(T,0x51cf66,0.0));atr.position.set(-0.15,5.05,0.15);sc.add(atr);
    // черен дроб
    const liv=MK.blob(T,[[-0.55,4.05,0.25,0.6,0x7f3b2a],[-0.05,4.15,0.35,0.45,0x7f3b2a],[0.4,4.2,0.3,0.32,0x86412e],[-0.9,3.8,0.0,0.45,0x7a3826]],{res:36});liv.material.transparent=true;liv.material.opacity=0.75;sc.add(liv);
    if(typeof RealLiverFromLungs==="function"&&ctx.__RL){RealLiverFromLungs(T,sc,ctx.__RL,{});liv.visible=false}
    // бъбреци, надбъбреци, уретери, пикочен мехур
    const K={};for(const s of [-1,1]){const k=mkKidney(T,s);k.position.set(s*0.62,s<0?3.55:3.68,-0.55);k.scale.setScalar(0.5);k.rotation.z=s*0.18;sc.add(k);K[s]=k}
    const urM=R3.phys(T,0xf6e7b0,{roughness:0.4});const ureC={};for(const s of [-1,1]){const c=new T.CatmullRomCurve3([V3(s*0.45,(s<0?3.5:3.62),-0.45),V3(s*0.42,3.2,-0.3),V3(s*0.35,2.9,0.05),V3(s*0.15,2.72,0.45)]);ureC[s]=c;sc.add(R3.tube(T,c,0.03,urM,{seg:30,rad:6}))}
    const blad=new T.Group();blad.position.set(0,2.7,0.55);sc.add(blad);{const ph=new T.Mesh(new T.SphereGeometry(0.32,24,18),R3.glass(T,0xf6d365,0.55));blad.add(ph);
      if(typeof zGlb==="function")zGlb("blad").then(raw=>{if(G.dead)return;const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];raw.forEach(r=>{for(let q=0;q<r.P.length;q++){const d=q%3;if(r.P[q]<mn[d])mn[d]=r.P[q];if(r.P[q]>mx[d])mx[d]=r.P[q]}});const c=mn.map((v,d)=>(v+mx[d])/2),k=0.8/Math.max(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2]),W=new T.Group();
        raw.forEach(r=>{const ge=new T.BufferGeometry(),P=new Float32Array(r.P.length);for(let q=0;q<P.length;q++)P[q]=(r.P[q]-c[q%3])*k;ge.setAttribute("position",new T.BufferAttribute(P,3));if(r.idx)ge.setIndex(new T.BufferAttribute(r.idx,1));ge.computeVertexNormals();const main=/dome|base/.test(r.nm);
          W.add(new T.Mesh(ge,new T.MeshPhysicalMaterial({color:LIN(T,main?0xe6a48f:/trigone/.test(r.nm)?0xc97b7b:0x9c4f4f),roughness:0.42,clearcoat:0.45,side:T.DoubleSide,transparent:main,opacity:main?0.9:1})))});
        const ur=new T.Mesh(new T.SphereGeometry(0.2,20,14),R3.glass(T,0xf6d365,0.7));ur.position.y=-0.02;W.add(ur);blad.remove(ph);blad.add(W)}).catch(e=>console.error(e))}
    const rv=R3.phys(T,0xc92a2a,{roughness:0.4});for(const s of [-1,1])sc.add(R3.tube(T,[V3(0.08,3.68,-0.42),V3(s*0.3,3.64,-0.5),V3(s*0.5,3.6,-0.55)],0.035,rv,{seg:16,rad:6}));
    sc.add(R3.tube(T,[V3(0.12,4.1,-0.38),V3(0.11,3.6,-0.4),V3(0.1,3.0,-0.35)],0.08,rv,{seg:20,rad:10}));
    // хипоталамус и хипофиза
    const hyp=new T.Mesh(new T.SphereGeometry(0.08,18,14),R3.glow(T,0x7048e8,0.5));hyp.position.set(0,8.05,0.15);sc.add(hyp);const pit=new T.Mesh(new T.SphereGeometry(0.06,16,12),R3.phys(T,0xb197fc,{emissive:LIN(T,0x7048e8),emissiveIntensity:0.3}));pit.position.set(0,7.9,0.28);sc.add(pit);
    // хормони като частици по кръвта
    const C=(pts)=>new T.CatmullRomCurve3(pts.map(p=>V3(...p)));
    const routes={adh:[C([[0,7.9,0.28],[0.15,7.2,0.3],[0.2,6.2,0.1],[0.15,5.0,-0.3],[0.2,4.0,-0.45],[0.55,3.7,-0.55]]),C([[0,7.9,0.28],[-0.15,7.2,0.3],[-0.2,6.2,0.1],[-0.15,5.0,-0.3],[-0.2,4.0,-0.45],[-0.55,3.6,-0.55]])],
      ren:[C([[0.55,3.7,-0.5],[0.3,3.85,-0.2],[0.0,4.0,0.1],[-0.4,4.05,0.3]]),C([[-0.55,3.6,-0.5],[-0.4,3.8,-0.2],[-0.4,4.0,0.2]])],
      ang:[C([[-0.4,4.05,0.3],[-0.2,4.6,0.2],[-0.5,5.3,0.1],[-0.3,5.6,0.0],[0.1,5.5,0.1],[0.55,4.3,-0.5],[0.6,4.2,-0.55]]),C([[-0.4,4.05,0.3],[-0.2,4.6,0.2],[-0.5,5.3,0.1],[-0.1,6.4,0.2],[0,7.8,0.2]]),C([[-0.4,4.05,0.3],[-0.5,4.6,0.0],[-0.55,4.2,-0.5]])],
      ald:[C([[0.6,4.22,-0.55],[0.6,3.95,-0.55]]),C([[-0.6,4.1,-0.55],[-0.6,3.85,-0.55]])],
      anp:[C([[-0.15,5.05,0.15],[0.0,4.6,-0.1],[0.3,4.0,-0.4],[0.55,3.7,-0.55]]),C([[-0.15,5.05,0.15],[-0.2,4.6,-0.1],[-0.4,4.0,-0.4],[-0.6,3.6,-0.55]])]};
    const S3={adh:R3.stream(T,routes.adh,120,0.045,0x7048e8,{speed:0.35,glow:0.8}),ren:R3.stream(T,routes.ren,80,0.045,0xe8590c,{speed:0.5,glow:0.8}),ang:R3.stream(T,routes.ang,140,0.045,0xe03131,{speed:0.35,glow:0.8}),ald:R3.stream(T,routes.ald,60,0.04,0xf59f00,{speed:0.6,glow:0.8}),anp:R3.stream(T,routes.anp,80,0.045,0x2b8a3e,{speed:0.4,glow:0.8})};
    Object.values(S3).forEach(s=>sc.add(s.mesh));
    const urine={[-1]:R3.stream(T,[ureC[-1]],60,0.035,0xfab005,{speed:0.6,glow:0.6}),[1]:R3.stream(T,[ureC[1]],60,0.035,0xfab005,{speed:0.6,glow:0.6})};sc.add(urine[-1].mesh,urine[1].mesh);
    const drink=R3.stream(T,[C([[0,7.55,1.6],[0,7.5,1.1],[0,7.42,0.8],[0,7.2,0.4],[0.05,6.4,0.0],[0.1,5.0,-0.35],[0.25,4.25,0.15]])],100,0.05,0x4dabf7,{speed:0.45,glow:0.7});sc.add(drink.mesh);
    let bl=0,t=0;
    return dt=>{t+=dt;const S=get();if(!S||!S.D){G.render([]);return}const s=S.s,D=S.D,ref=S.ref,o=S.o;
      const r=x=>Math.max(0,x);const adh=s.ADH,ren=s.ren/ref.ren,ang=s.ang/ref.ang,ald=s.aldo/ref.aldo,anp=s.anp/ref.anp;
      S3.adh.update(dt,adh*6);S3.ren.update(dt,ren*6);S3.ang.update(dt,ang*7);S3.ald.update(dt,ald*5);S3.anp.update(dt,anp*6);
      hyp.material.opacity=0.25+0.6*Math.min(1,Math.abs(D.Posm-286)/10);hyp.scale.setScalar(1+Math.min(1,Math.abs(D.Posm-286)/10));
      atr.material.opacity=Math.min(0.8,0.1+0.35*(anp-0.8));
      for(const k of [-1,1]){K[k].userData.k.material.emissiveIntensity=Math.min(0.6,0.12*(ren-0.6));K[k].userData.adr.material.emissiveIntensity=Math.min(0.8,0.2*(ald-0.5));urine[k].update(dt,s.V*14)}
      bl=Math.min(1,bl+s.V*dt*0.004*(S.sp||5));if(bl>=1)bl=0;blad.scale.setScalar(0.7+bl*0.7);
      const drinking=s.q.some(e=>e.w>0)||(o.thirst&&(D.Posm>293||D.BV<4.55));drink.update(dt,drinking?30:0);
      if(ctx.__RH)ctx.__RH.update(dt,70);const hb=1+0.03*Math.max(0,Math.sin(t*7.5))**3,kk=0.8*hb;heart.scale.setScalar(kk);heart.position.set(0.15*(1-kk)+0.1,4.85*(1-kk)-0.06,0.3*(1-kk));
      bd.skin.material.opacity=0.06;
      const bar=(l,v,n,c)=>`<div style="display:flex;align-items:center;gap:6px;margin-top:3px"><span style="width:86px">${l}</span><span style="display:inline-block;height:8px;width:${Math.round(v/n*60)}px;background:${c};border-radius:3px"></span><span>${fmt(v,1)} L</span></div>`;
      ctx.ov.innerHTML=`Na⁺ ${fmt(D.Na,0)} mmol/L · ${fmt(D.Posm,0)} mOsm/kg · САН ${fmt(D.MAP,0)} mmHg · урина ${fmt(s.V,2)} mL/min${bar("в клетките",D.ICF,28,"#74c0fc")}${bar("интерстиций",D.ECF-D.PV,28,"#8ce99a")}${bar("плазма",D.PV,28,"#ff8787")}
        <div style="margin-top:4px;font-weight:500"><span style="color:#7048e8">● ADH</span> <span style="color:#e8590c">● ренин</span> <span style="color:#e03131">● Ang II</span> <span style="color:#f59f00">● алдостерон</span> <span style="color:#2b8a3e">● ANP</span></div>`;
      G.render([["хипоталамус и хипофиза",V3(0.5,8.0,0.3)],["сърце (ANP)",V3(-0.6,5.0,0.5)],["черен дроб",V3(-1.0,4.1,0.4)],["бял дроб (ACE)",V3(1.1,5.6,0.2)],["надбъбрек",V3(0.62,4.35,-0.55)],["бъбрек",V3(0.95,3.55,-0.5)],["пикочен мехур",V3(0,2.4,0.7)]])}},{full:false,views:[["Цяло тяло",[0,5.4,0,9.5,0.45,1.45]],["Бъбреци",[0,3.8,-0.4,3.6,0.5,1.25]],["Хипофиза",[0,7.95,0.2,1.8,0.9,1.45]],["Сърце и бели дробове",[0,5.1,0,5,0.4,1.35]]]})}
try{route()}catch(e){console.error(e)}
