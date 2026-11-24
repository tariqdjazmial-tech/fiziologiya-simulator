/* ===== Надбъбречна кора: кортизол, алдостерон, андрогени =====
   Редуциран образователен модел (Guyton & Hall, гл. 78); време в часове (1 s = 1 h).
   - денонощен ритъм на CRH (пик ≈ 06–07 h, минимум около полунощ), стрес усилва CRH;
   - ACTH: τ ≈ 0,3 h (t½ ≈ 10–20 min), потискан от кортизола и дексаметазона (отрицателна обратна връзка);
   - кортизол: синтез ∝ ACTH (насищане) × маса на кората × CYP21 × CYP11B1, разграждане с t½ ≈ 70 min;
   - маса на кората (трофичен ефект на ACTH): атрофия/хиперплазия — УСКОРЕНО (τ 5 дни вместо седмици–месеци);
   - алдостерон: главно ангиотензин II и K⁺ (ACTH — слабо); обем → ренин/Ang II (отрицателна връзка); K⁺ ← алдостерон;
   - андрогени (DHEA-S): ∝ ACTH × маса; при дефицит на CYP21 предшествениците се отклоняват към андрогени. */
(function(){"use strict";
if(typeof mkSim!=="function"||typeof zRegister!=="function")return;
const T_=x=>window.T?window.T(x):x,EN=window.__EN=window.__EN||{},L=(bg,en)=>{if(en)EN[bg]=en;return bg},cl=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- модел ---------- */
const hr=t=>((t%24)+24)%24;
function adInit(){return {t:6,A:30,F:12,M:1,Ald:8,Vol:1,K:4.2,AngII:1,DHEA:1,CRH:1,OHP:1,MAP:93}}
const AE=a=>Math.pow(a,1.5)/(Math.pow(a,1.5)+Math.pow(70,1.5));        // ефект на ACTH (насищане; EC50 ≈ 70 pg/mL)
function adFlux(s,p){const pre=p.pre||"norm",str=p.str/100,dex=p.dex,res=p.res/100,e21=p.e21/100,kin=p.kin;
  const h=hr(s.t),dh=((h-6.5+36)%24)-12,circ=0.05+0.95*Math.exp(-Math.pow(dh/3.8,2));
  const dexEq=30*dex,FB=s.F+dexEq;                                // дексаметазон: ≈ 25–30 пъти по-силен от кортизола; не се мери като кортизол
  const CRH=circ/(1+Math.pow(FB/QP.hc,2))+QP.st*str/(1+Math.pow(FB/QP.hs,2));               // хипоталамус: ритъм + стрес, потиснат от кортизола
  let Atg;
  if(pre==="cushD")Atg=QP.pa*(0.55+0.45*circ)/(1+FB/QP.pf)+QP.pb;    // аденом на хипофизата: автономен ACTH, слабо и с по-висок праг потискан
  else Atg=QP.a*CRH/(1+Math.pow(FB/QP.fs,2));                     // кортикотрофи: CRH, потиснати от кортизола
  Atg=Math.min(900,Atg);
  const Ae=AE(s.A);
  const auto=pre==="adrAd"?QP.auto:0;                             // кортизол-секретиращ аденом на кората (автономен), µg/dL·h⁻¹
  const PF=QP.v*Ae*s.M*res*e21+auto;                // µg/dL·h⁻¹
  const conn=pre==="conn"?32:0;
  const AldT=8*Math.pow(res,1.4)*Math.pow(e21,0.8)*s.AngII*Math.exp((s.K-4.2)/0.5)*(0.9+0.1*Math.min(1.5,Ae/QP.ae))+conn;  // ng/dL
  const VolT=cl(0.88+0.12*Math.log2(1+AldT/8),0.8,1.45);
  const MAP=93*(0.82+0.18*Math.min(1.3,FB/QP.fm))*(1+0.9*(s.Vol-1));
  const AngT=cl(Math.exp(-(s.Vol-1)*15)*Math.pow(93/MAP,2),0.03,8);
  const KT=cl(4.2-(AldT<8?1:0.62)*Math.log2(Math.max(0.15,AldT)/8)+0.55*Math.log2(kin/80),2.3,7.2);
  const DHt=Ae/QP.ae*s.M*res*(1+1.6*(1-e21));
  const OHt=Ae/QP.ae*s.M*res*(1+40*(1-e21)/Math.sqrt(Math.max(0.02,e21)))/(1+40*0);
  const Mt=pre==="adrAd"?0.55:0.3+0.7*Ae/QP.ae;
  return {h,circ,CRH,Atg,Ae,PF,AldT,VolT,AngT,KT,DHt,OHt,Mt,MAP,dexEq}}
const QP={a:240,fs:9,v:42,pa:110,pf:20,pb:8,auto:20,fm:8,ae:0.128,hc:16,st:5,hs:40};
function adStep(s,p,dt){const F=adFlux(s,p);
  s.A+=(F.Atg-s.A)*Math.min(1,dt/0.3);
  s.F=Math.max(0.2,s.F+(F.PF-0.6*s.F)*dt);
  s.M=cl(s.M+(F.Mt-s.M)*dt/120,0.25,2.2);s.OHP+=(F.OHt-s.OHP)*dt/6;
  s.Ald+=(F.AldT-s.Ald)*Math.min(1,dt/0.5);s.Vol+=(F.VolT-s.Vol)*dt/24;s.AngII+=(F.AngT-s.AngII)*Math.min(1,dt/0.5);s.K+=(F.KT-s.K)*dt/12;s.DHEA+=(F.DHt-s.DHEA)*dt/12;
  s.CRH=F.CRH;s.t+=dt;s.MAP=F.MAP;s.h=F.h}

/* ---------- 2D: оста и пътят на стероидната синтеза ---------- */
const C={crh:"#7048e8",acth:"#4c6ef5",cort:"#d9480f",ald:"#1c7ed6",andr:"#9c36b5",ang:"#e64980",blk:"#c92a2a"};
function draw(g,p,R,t,dt,s){if(!s||!R)return;const T=(x,y,txt,o)=>Z.T(g,x,y,T_(txt),o),mut=css("--muted"),e21=p.e21/100;
  Z.org(g,20,18,150,44,C.crh,T_(L("Хипоталамус","Hypothalamus")),"CRH",Math.min(1,s.CRH/2));
  Z.org(g,20,104,150,44,C.acth,T_(L("Предна хипофиза","Anterior pituitary")),"ACTH "+fmt(s.A,0)+" pg/mL",Math.min(1,s.A/80));
  Z.org(g,20,190,150,52,C.cort,T_(L("Надбъбречна кора","Adrenal cortex")),T_(L("маса","mass"))+" "+fmt(s.M*100*p.res/100,0)+" %",Math.min(1,s.F/25));
  Z.arr(g,95,64,95,100,C.crh,0.6+s.CRH*1.8,"");Z.arr(g,95,150,95,186,C.acth,0.6+s.A/18,"");
  Z.arr(g,178,206,178,132,C.cort,0.6+s.F/6,T_(L("кортизол ⊖","cortisol ⊖")),{dx:38,dash:[5,4]});Z.arr(g,196,206,196,48,C.cort,0.5+s.F/8,"",{dash:[5,4]});
  if(p.dex>0)Z.arr(g,250,96,200,96,"#495057",0.8+p.dex,T_(L("дексаметазон ⊖","dexamethasone ⊖")),{dy:-8,dash:[3,3]});
  // път на стероидната синтеза
  const x0=270,y0=26,cw=118,rh=50,box=(c,r,txt,col,act)=>{Z.box(g,x0+c*cw,y0+r*rh,112,30,col,col,8,1.2,0.1+0.45*act);T(x0+c*cw+56,y0+r*rh+19,txt,{fs:9.5,w:700})};
  box(1,0,L("холестерол","cholesterol"),"#868e96",0.4);box(1,0.9,L("прегненолон","pregnenolone"),"#868e96",0.5);
  const fZG=Math.min(1,s.Ald/16),fZF=Math.min(1,s.F/25),fZR=Math.min(1,s.DHEA/2);
  box(0,2,L("прогестерон","progesterone"),C.ald,fZG);box(1,2,L("17-OH-прогестерон","17-OH-progesterone"),C.cort,fZF);box(2,2,"DHEA",C.andr,fZR);
  box(0,3,L("дезоксикортикостерон","deoxycorticosterone"),C.ald,fZG*e21);box(1,3,L("11-дезоксикортизол","11-deoxycortisol"),C.cort,fZF*e21);box(2,3,L("андростендион","androstenedione"),C.andr,fZR);
  box(0,4.1,L("алдостерон","aldosterone"),C.ald,fZG);box(1,4.1,L("кортизол","cortisol"),C.cort,fZF);box(2,4.1,"DHEA-S",C.andr,fZR);
  const ar=(c1,r1,c2,r2,col,w,lab)=>Z.arr(g,x0+c1*cw+54,y0+r1*rh+31,x0+c2*cw+54,y0+r2*rh-1,col,w,lab,{dx:30,dy:4});
  ar(1,0,1,0.9,"#868e96",2,"");T(x0+cw+120,y0+0.62*rh,"StAR · CYP11A1",{fs:9.5,c:mut,a:"left"});ar(1,0.9,0,2,C.ald,1+2*fZG,"");T(x0+20,y0+1.75*rh,"3β-HSD2",{fs:9.5,c:C.ald,w:700,a:"left"});ar(1,0.9,1,2,C.cort,1+2*fZF,"");T(x0+cw+60,y0+1.78*rh,"CYP17",{fs:9.5,c:C.cort,w:700,a:"left"});T(x0+cw+60,y0+1.78*rh+11,"3β-HSD2",{fs:9.5,c:C.cort,w:700,a:"left"});ar(1,0.9,2,2,C.andr,1+2*fZR,"");T(x0+2*cw+116,y0+1.75*rh,"CYP17 (17,20-"+T_(L("лиаза","lyase"))+")",{fs:9.5,c:C.andr,w:700,a:"left"});
  const blk=e21<0.6;ar(0,2,0,3,blk?C.blk:C.ald,1+2*fZG*e21,"CYP21");ar(1,2,1,3,blk?C.blk:C.cort,1+2*fZF*e21,"CYP21");
  ar(0,3,0,4.1,C.ald,1+2*fZG,"CYP11B2");ar(1,3,1,4.1,C.cort,1+2*fZF,"CYP11B1");ar(2,2,2,3,C.andr,1+2*fZR,"3β-HSD2");ar(2,3,2,4.1,C.andr,1+2*fZR,"SULT2A1");
  if(blk){[[0,2.5],[1,2.5]].forEach(([c,r])=>{const x=x0+c*cw+54,y=y0+r*rh+14;g.strokeStyle=C.blk;g.lineWidth=3;g.beginPath();g.moveTo(x-8,y-8);g.lineTo(x+8,y+8);g.moveTo(x+8,y-8);g.lineTo(x-8,y+8);g.stroke()});
    Z.arr(g,x0+cw+112,y0+2*rh+24,x0+2*cw+4,y0+3*rh+8,C.andr,2+3*(1-e21),"");T(x0+2*cw+118,y0+2.62*rh+14,L("отклонение","shunt"),{fs:10,c:C.andr,w:700,a:"left"})}
  T(x0+0*cw+54,y0+5.3*rh,L("гломерулоза","glomerulosa"),{fs:10.5,c:C.ald,w:700});T(x0+1*cw+54,y0+5.3*rh,L("фасцикулата","fasciculata"),{fs:10.5,c:C.cort,w:700});T(x0+2*cw+54,y0+5.3*rh,L("ретикуларис","reticularis"),{fs:10.5,c:C.andr,w:700});
  // часовник
  const cx=95,cy=290,rr=26,h=hr(s.t);g.strokeStyle=mut;g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,rr,0,7);g.stroke();
  for(let k=0;k<24;k+=6){const a=k/24*Math.PI*2-Math.PI/2;T(cx+Math.cos(a)*(rr+10),cy+Math.sin(a)*(rr+10)+4,""+k,{fs:9,c:mut})}
  const a=h/24*Math.PI*2-Math.PI/2;g.strokeStyle=css("--ink");g.lineWidth=2.5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*rr*0.85,cy+Math.sin(a)*rr*0.85);g.stroke();
  T(cx+rr+46,cy+4,String(Math.floor(h)).padStart(2,"0")+":"+String(Math.floor((h%1)*60)).padStart(2,"0"),{fs:13,w:700})}

/* ---------- 3D: бъбрек и надбъбречна жлеза в напречен разрез ----------
   Разрезът има формата на обърнато Y (λ): тяло с медула и два крака (медиален и латерален), които са само кора.
   Зоните не са отделна геометрия: от контура веднъж се смята поле на разстоянието до капсулата (DataTexture),
   а шейдърът оцветява по дълбочина: капсула → гломерулоза → фасцикулата → ретикуларис → медула (само в тялото).
   Дебелината на кората следва масата ѝ (ACTH), а гломерулозата — ангиотензин II и K⁺. */
function ad3D(get){const W=document.createElement("div");W.className="card";W.style.cssText="padding:10px";
  const box=typeof wrap3D==="function"?wrap3D("adW",innerWidth<600?460:540):"<div id=\"adW\" style=\"position:relative;width:100%;height:440px;border-radius:6px;overflow:hidden\"></div>";
  W.innerHTML=box+"<div class=\"legend\" style=\"margin-top:6px\"><span><i style=\"background:#adb5bd\"></i>ACTH</span><span><i style=\"background:#e64980\"></i>"+T_(L("ангиотензин II","angiotensin II"))+"</span><span><i style=\"background:#1c7ed6\"></i>"+T_(L("алдостерон","aldosterone"))+"</span><span><i style=\"background:#d9480f\"></i>"+T_(L("кортизол","cortisol"))+"</span><span><i style=\"background:#9c36b5\"></i>"+T_(L("андрогени","androgens"))+"</span><span>"+T_(L("хормоните идват по артериите и излизат по централната вена; дебелината на зоните следва модела (схематично)","hormones arrive via the arteries and leave via the central vein; zone thickness follows the model (schematic)"))+"</span><span style=\"opacity:.75\">"+T_(L("бъбрек и съдове: BodyParts3D (DBCLS, CC BY-SA 2.1 JP)","kidney and vessels: BodyParts3D (DBCLS, CC BY-SA 2.1 JP)"))+"</span></div>";
  return {el:W,start(){const lo=window.LOWGPU,ph=innerWidth<600;
   return mk3DView("#adW",()=>{const G=make3D(document.getElementById("adW"),{r:ph?16:11.2,th:0.3,phi:1.38,target:[ph?-0.4:-0.7,ph?-1.4:-0.7,0],min:3,max:30,hq:true,fov:38}),T=G.T,sc=G.scene,V=(x,y,z)=>new T.Vector3(x,y,z);
    const rest=g=>{g.setAttribute("rest",new T.BufferAttribute(g.attributes.position.array.slice(),3));return g};
    const opaque=m=>{m.material.transparent=false;m.material.opacity=1;return m};
    /* контур на разреза (локални единици): тяло отгоре, медиален крак вляво, латерален вдясно */
    const CP=[[0,1.38],[-0.42,1.24],[-0.62,0.86],[-0.68,0.42],[-0.95,0.02],[-1.45,-0.48],[-1.86,-0.86],[-1.74,-1.02],[-1.3,-0.78],[-0.78,-0.46],[-0.3,-0.2],[0.02,-0.16],[0.36,-0.24],[0.86,-0.44],[1.42,-0.7],[1.8,-0.72],[1.76,-0.52],[1.26,-0.16],[0.76,0.24],[0.6,0.7],[0.48,1.12],[0.26,1.32]];
    const crv=new T.CatmullRomCurve3(CP.map(([x,y])=>V(x,y,0)),true,"centripetal"),NP=lo?120:180,OP=crv.getSpacedPoints(NP).slice(0,NP).map(v=>[v.x,v.y]);
    const seg=[],segL=[];let per=0;for(let i=0;i<NP;i++){const a=OP[i],b=OP[(i+1)%NP],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a[0],a[1],b[0],b[1],per,l]);per+=l}
    const inside=(x,y)=>{let c=false;for(let i=0,j=NP-1;i<NP;j=i++){const [xi,yi]=OP[i],[xj,yj]=OP[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
    const near=(x,y)=>{let best=1e9,pp=0;for(const [ax,ay,bx,by,p0,l] of seg){const dx=bx-ax,dy=by-ay,u=cl(((x-ax)*dx+(y-ay)*dy)/(l*l),0,1),qx=ax+u*dx-x,qy=ay+u*dy-y,d=qx*qx+qy*qy;if(d<best){best=d;pp=p0+u*l}}return [Math.sqrt(best),pp]};
    /* поле: R = дълбочина, G = локална полудебелина, B = радиални тръжички (фасцикулата), A = маска на тялото */
    const X0=-2.0,X1=2.0,Y0=-1.15,Y1=1.5,NX=lo?120:176,NY=Math.round(NX*(Y1-Y0)/(X1-X0)),DM=0.8,dd=new Float32Array(NX*NY),sp=new Float32Array(NX*NY),bm=new Float32Array(NX*NY);
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const x=X0+(i+0.5)/NX*(X1-X0),y=Y0+(j+0.5)/NY*(Y1-Y0),k=j*NX+i;if(!inside(x,y))continue;const [d,p]=near(x,y);dd[k]=d;sp[k]=0.5+0.5*Math.sin(p*95+Math.sin(p*7.3)*2);
      bm[k]=1-cl((Math.hypot(x*1.1,(y-0.66)*0.85)-0.42)/0.38,0,1)}
    const R=Math.round(0.45/(X1-X0)*NX),tmp=new Float32Array(NX*NY),dl=new Float32Array(NX*NY);
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){let m=0;for(let q=Math.max(0,i-R);q<=Math.min(NX-1,i+R);q++)m=Math.max(m,dd[j*NX+q]);tmp[j*NX+i]=m}
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){let m=0;for(let q=Math.max(0,j-R);q<=Math.min(NY-1,j+R);q++)m=Math.max(m,tmp[q*NX+i]);dl[j*NX+i]=Math.max(m,dd[j*NX+i],0.02)}
    const tx=new Uint8Array(NX*NY*4);for(let k=0;k<NX*NY;k++){tx[4*k]=Math.round(cl(dd[k]/DM,0,1)*255);tx[4*k+1]=Math.round(cl(dl[k]/DM,0,1)*255);tx[4*k+2]=Math.round(sp[k]*255);tx[4*k+3]=Math.round(bm[k]*255)}
    const FT=new T.DataTexture(tx,NX,NY,T.RGBAFormat);FT.magFilter=FT.minFilter=T.LinearFilter;FT.needsUpdate=true;
    const shape=new T.Shape(OP.map(([x,y])=>new T.Vector2(x,y)));
    const C3=h=>new T.Color(h);
    const U={F:{value:FT},bb:{value:new T.Vector4(X0,Y0,X1-X0,Y1-Y0)},DM:{value:DM},tCx:{value:0.32},fG:{value:0.15},fR:{value:0.1},cap:{value:0.035},
      cCap:{value:C3(0xd8a595)},cG:{value:C3(0xc98f7e)},cF:{value:C3(0xd9875f)},cR:{value:C3(0x8a4a4a)},cM:{value:C3(0x9a6f72)},
      eG:{value:C3(0x1c7ed6)},eF:{value:C3(0xd9480f)},eR:{value:C3(0x9c36b5)},aG:{value:0.2},aF:{value:0.2},aR:{value:0.2},
      nod:{value:new T.Vector3(0,0,0)},cN:{value:C3(0xc08a7a)},eN:{value:C3(0x1c7ed6)},aN:{value:0}};
    const faceM=new T.ShaderMaterial({uniforms:U,side:T.DoubleSide,
      vertexShader:"varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader:`uniform sampler2D F;uniform vec4 bb;uniform float DM,tCx,fG,fR,cap,aG,aF,aR,aN;uniform vec3 cCap,cG,cF,cR,cM,eG,eF,eR,nod,cN,eN;varying vec2 vP;
      float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){vec4 t=texture2D(F,(vP-bb.xy)/bb.zw);float d=t.r*DM,dl=max(t.g*DM,0.02),b=t.a;
        float C=mix(dl,min(dl,tCx),b);float u=(d-cap)/max(0.01,C-cap);vec3 c;float ln=0.0;
        if(d<cap){c=cCap;}
        else if(d>C+0.004){c=cM*(0.9+0.1*hs(floor(vP*90.0)));ln=1.0-smoothstep(0.0,0.012,d-C);}
        else if(u<fG){c=cG+eG*aG*0.55;ln=smoothstep(fG-0.03,fG,u);}
        else if(u<1.0-fR){c=cF*(0.86+0.16*t.b)+eF*aF*0.45;ln=smoothstep(1.0-fR-0.025,1.0-fR,u);}
        else {c=cR+eR*aR*0.55;}
        c=mix(c,c*0.72,ln*0.8);
        float vd=length(vP-vec2(0.04,0.7));if(vd<0.085){c=mix(vec3(0.17,0.2,0.36),c*0.6,smoothstep(0.06,0.085,vd));}
        float nd=length(vP-nod.xy);if(nod.z>0.0&&nd<nod.z){float e=smoothstep(nod.z*0.86,nod.z,nd);c=mix(cN+eN*aN*0.5,cN*0.7,e);}
        c*=0.93+0.07*hs(floor(vP*140.0));
        gl_FragColor=vec4(c,1.0);}`});
    const gland=new T.Group();sc.add(gland);
    const face=new T.Mesh(new T.ShapeGeometry(shape,1),faceM);face.position.z=0.012;gland.add(face);
    /* задна половина: контурът, изтеглен назад и закръглен към края (жлезата е тънка, листовидна) */
    const DEP=2.1,eg=new T.ExtrudeGeometry(shape,{depth:DEP,bevelEnabled:false,steps:lo?6:10,curveSegments:8});
    {const P=eg.attributes.position;for(let i=0;i<P.count;i++){const z=P.getZ(i),f=(DEP-z)/DEP,k=1-0.45*f*f;P.setXYZ(i,P.getX(i)*k,0.3+(P.getY(i)-0.3)*k,z-DEP)}eg.computeVertexNormals()}
    const back=opaque(new T.Mesh(rest(eg),zMat(T,[[0.8,0.5,0.42],[0.69,0.4,0.34],[0.87,0.6,0.5]],{sc:2.2,cc:lo?0:0.25})));gland.add(back);
    /* бъбрек: боб с вдлъбнатина към хилуса; горният полюс е под краката на жлезата, изцяло зад разреза */
    const kg=new T.SphereGeometry(1,lo?30:48,lo?22:36);{const P=kg.attributes.position;for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i);if(x>0)x-=0.32*x*Math.exp(-Math.pow(y/0.42,2));P.setX(i,x)}kg.computeVertexNormals()}
    const kid=opaque(new T.Mesh(rest(kg),zMat(T,[[0.45,0.19,0.16],[0.35,0.13,0.11],[0.55,0.26,0.21]],{sc:0.55,cc:lo?0:0.45,bump:0.3})));kid.scale.set(2.6,4.6,1.9);kid.position.set(-2.0,-3.2,-2.2);kid.rotation.z=0.18;sc.add(kid);
    /* истински десен бъбрек, бъбречни съдове, уретер и долна куха вена (BodyParts3D, CC BY-SA 2.1 JP); в координатите на сцената */
    const real=(f,m,cb)=>MK.loadMesh(T,"m/"+f).then(g=>{const o=new T.Mesh(rest(g),m);sc.add(o);cb&&cb(o);return o}).catch(()=>{});
    real("bp_kidR.txt",kid.material,()=>{kid.visible=false});
    G.ren.localClippingEnabled=true;const renAM=MK.mat(T,0xa61e1e,{roughness:0.45});renAM.clippingPlanes=[new T.Plane(new T.Vector3(-1,0,0),3.4)];real("bp_renA.txt",renAM);real("bp_renV.txt",MK.mat(T,0x3b4fa0,{roughness:0.45}));real("bp_ureR.txt",MK.mat(T,0xd2aca4,{roughness:0.5}));
    /* съдове: 3 надбъбречни артерии отгоре-вляво (горна, средна, долна) към капсулата; централна вена → долна куха вена */
    const oW=(i,s=1)=>{const [x,y]=OP[((i%NP)+NP)%NP];return V(x*s,y*s,0.06)};
    const aC=[[V(-2.6,2.4,-0.7),V(-1.5,1.95,-0.2),V(-0.75,1.6,0.06),oW(Math.round(NP*0.04),1.04)],
      [V(-2.7,0.9,-0.6),V(-1.8,0.75,-0.1),V(-1.05,0.55,0.06),oW(Math.round(NP*0.13),1.04)],
      [V(0.25,-1.95,0.3),V(0.85,-1.55,0.32),V(1.4,-1.05,0.15),V(1.66,-0.8,0.06)]].map(p=>new T.CatmullRomCurve3(p));
    aC.forEach(c=>gland.add(MK.taper(T,c,0.085,0.05,{seg:28,rad:10,color:0xa61e1e})));
    const vP=[V(0.04,0.7,-0.02),V(0.3,0.6,-0.4),V(0.95,0.42,-0.32),V(1.35,0.36,0.08),V(1.58,0.36,0.5)];
    gland.add(MK.taper(T,new T.CatmullRomCurve3(vP),0.085,0.13,{seg:28,rad:10,color:0x3b4fa0}));
    const ivcM=MK.mat(T,0x4a5aa8,{roughness:0.4});ivcM.transparent=true;ivcM.opacity=0.6;ivcM.depthWrite=false;real("bp_ivc.txt",ivcM,o=>{o.renderOrder=2});
    /* аденом (нодул в кората): Кон — в латералния крак (гломерулоза); кортизол-секретиращ — в тялото (фасцикулата) */
    const NOD={conn:[1.12,-0.36,0.2,0x9a8296,0x1c7ed6],adrAd:[-0.36,0.98,0.3,0xc08a7a,0xd9480f]};
    /* частици: ACTH и Ang II по артериите; хормоните — от зоната през медулата в централната вена и нагоре по долната куха вена */
    const fA=zFlow(T,gland,24,0xadb5bd,0.085),fAng=zFlow(T,gland,20,0xe64980,0.08),fAl=zFlow(T,gland,20,0x1c7ed6,0.08),fC=zFlow(T,gland,28,0xd9480f,0.085),fD=zFlow(T,gland,16,0x9c36b5,0.08);
    const vO=vP.concat([V(2.0,0.75,0.8),V(1.95,3.0,0.85)]),outC=(x,y)=>new T.CatmullRomCurve3([V(x,y,0.08),V(x*0.45+0.02,0.7+(y-0.7)*0.45,0.08),V(0.04,0.7,0.06),...vO]);
    const cAl=outC(1.38,-0.6),cC=outC(-0.48,1.0),cD=outC(-0.28,0.7);
    /* етикети с водещи линии: колона вляво, точки в средата на всяка зона по хоризонтала през тялото */
    const yR=[1.12,0.92,0.72,0.52],yM=0.66,xs=yR.map(y=>{for(let x=-1.0;x<0;x+=0.004)if(inside(x,y))return x;return -0.6});
    const zp=[V(0,0,0.02),V(0,0,0.02),V(0,0,0.02),V(0,0,0.02),V(0.05,yM,0.02)],anc=ph?[0,1,2,3,4].map(i=>V(-1.6,5.0-0.72*i,0.1)):[V(-4.4,2.7,0.1),V(-4.4,2.05,0.1),V(-4.4,1.4,0.1),V(-4.4,0.75,0.1),V(-4.4,0.1,0.1)];
    const lgP=new Float32Array(5*6),lg=new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:0x868e96,transparent:true,opacity:0.85}));lg.geometry.setAttribute("position",new T.BufferAttribute(lgP,3));sc.add(lg);
    const LB=[T_(L("капсула","capsule")),T_(L("гломерулоза → алдостерон","glomerulosa → aldosterone")),T_(L("фасцикулата → кортизол","fasciculata → cortisol")),T_(L("ретикуларис → андрогени","reticularis → androgens")),T_(L("медула (адреналин)","medulla (adrenaline)"))];
    const XL=[[T_(L("десен бъбрек","right kidney")),V(-3.0,-3.0,-0.3)],[T_(L("централна вена","central vein")),V(1.9,0.15,0.3)],[T_(L("долна куха вена","inferior vena cava")),V(2.8,-2.2,1.6)],[T_(L("бъбречни артерия и вена","renal artery and vein")),V(-0.2,-2.6,1.2)],[T_(L("уретер","ureter")),V(-0.5,-6.4,0.4)],[T_(L("надбъбречни артерии","suprarenal arteries")),ph?V(-2.9,0.2,-0.3):V(-0.6,3.1,-0.3)]];
    const LBL=LB.map((t,i)=>[t,anc[i]]).concat(XL),nodL=[T_(L("аденом","adenoma")),V(0,0,0)],LBLn=LBL.concat([nodL]);
    let gs=1,lastK=-1,lastG=-1;const W3=V(0,0,0);
    const ctx={G,g:G};
    ctx.frame=()=>{const st=get(),s=st.s,p=st.p;if(!s){G.render([]);return}const t=performance.now()/1000;
      const k=cl(s.M*p.res/100,0.06,2.2),gA=cl(Math.sqrt(s.AngII*Math.exp((s.K-4.2)/0.5)),0.4,1.9);
      if(Math.abs(k-lastK)>0.005||Math.abs(gA-lastG)>0.01){lastK=k;lastG=gA;
        gs=1.35*(0.8+0.2*Math.sqrt(k));gland.scale.setScalar(gs);
        U.tCx.value=cl(0.3*Math.sqrt(k),0.07,0.5);U.fG.value=cl(0.15*gA,0.05,0.3);U.fR.value=cl(0.1*Math.sqrt(k),0.05,0.16);
        const C=Math.min(U.tCx.value,0.62),cap=U.cap.value,fg=U.fG.value,fr=U.fR.value,dm=[cap*0.5,cap+(C-cap)*fg*0.5,cap+(C-cap)*(fg+(1-fg-fr)*0.5),cap+(C-cap)*(1-fr*0.5)];
        for(let i=0;i<4;i++)zp[i].set((xs[i]+dm[i]*1.15)*gs,yR[i]*gs,0.03);zp[4].set(0.05*gs,(yM-0.12)*gs,0.03);
        for(let i=0;i<5;i++){lgP.set([anc[i].x+(ph?0:0.05),anc[i].y-(ph?0.2:0),anc[i].z,zp[i].x,zp[i].y,zp[i].z],i*6)}lg.geometry.attributes.position.needsUpdate=true}
      U.aG.value=Math.min(1,s.AngII*0.6);U.aF.value=Math.min(1,s.F/30);U.aR.value=Math.min(1,s.DHEA/3);
      const nd=NOD[p.pre];if(nd){U.nod.value.set(nd[0],nd[1],nd[2]);U.cN.value.setHex(nd[3]);U.eN.value.setHex(nd[4]);U.aN.value=p.pre==="conn"?Math.min(1,s.Ald/30):Math.min(1,s.F/30);nodL[1].set(nd[0]*gs,(nd[1]+nd[2]+0.25)*gs,0.1)}else{U.nod.value.z=0}
      fA.set(aC[0],t*0.35,Math.round(cl(s.A/5,0,12)),0.02);fAng.set(aC[1],t*0.35,Math.round(cl(s.AngII*6,0,20)),0.02);
      fAl.set(cAl,t*0.18,Math.round(cl(s.Ald/1.6,0,20)),0.03);fC.set(cC,t*0.18,Math.round(cl(s.F*0.8,0,28)),0.03);fD.set(cD,t*0.18,Math.round(cl(s.DHEA*5,0,16)),0.03);
      G.render(nd?LBLn:LBL)};
    return ctx},ctx=>ctx.frame())}}}

/* ---------- урок ---------- */
const P_=(b,e)=>"<p>"+L(b,e)+"</p>",LI=a=>"<ul>"+a.map(([b,e])=>"<li>"+L(b,e)+"</li>").join("")+"</ul>";
const book={title:L("Надбъбречна кора: кортизол и алдостерон","Adrenal cortex: cortisol and aldosterone"),
 adv:L("оста CRH–ACTH–кортизол с денонощния ритъм, регулацията на алдостерона и пътя на стероидната синтеза; Адисон, Кушинг, ВНХ и Кон","the CRH–ACTH–cortisol axis with its circadian rhythm, aldosterone regulation and the steroid pathway; Addison, Cushing, CAH and Conn"),
 lead:L("Кората на надбъбрека прави три групи стероиди в три зони: алдостерон, кортизол и андрогени. Всяка зона има свой регулатор. По Guyton, гл. 78.","The adrenal cortex makes three groups of steroids in three zones: aldosterone, cortisol and androgens. Each zone has its own regulator. After Guyton, ch. 78."),
 secs:[
 {h:L("Цели на урока","Learning objectives"),html:LI([["Да свържеш всяка зона на кората с хормона ѝ и с регулатора му.","Link each cortical zone with its hormone and its regulator."],["Да обясниш оста CRH → ACTH → кортизол, отрицателната обратна връзка и денонощния ритъм.","Explain the CRH → ACTH → cortisol axis, its negative feedback and circadian rhythm."],["Да обясниш защо алдостеронът зависи главно от ангиотензин II и K⁺, а не от ACTH.","Explain why aldosterone depends mainly on angiotensin II and K⁺, not on ACTH."],["Да разпознаеш по ACTH, кортизол, алдостерон, ренин и K⁺ първичната и вторичната недостатъчност, синдрома на Кушинг, ВНХ и синдрома на Кон.","Recognise primary and secondary insufficiency, Cushing's syndrome, CAH and Conn's syndrome from ACTH, cortisol, aldosterone, renin and K⁺."]])},
 {h:L("Норма: зони и хормони","Normal physiology: zones and hormones"),html:LI([["<b>Зона гломерулоза</b> (външна, тънка) — <b>алдостерон</b>; има CYP11B2 (алдостерон синтаза), няма CYP17. Регулатори: ангиотензин II и K⁺.","<b>Zona glomerulosa</b> (outer, thin) — <b>aldosterone</b>; has CYP11B2 (aldosterone synthase), lacks CYP17. Regulators: angiotensin II and K⁺."],["<b>Зона фасцикулата</b> (средна, най-дебела) — <b>кортизол</b>; CYP17 и CYP11B1. Регулатор: ACTH.","<b>Zona fasciculata</b> (middle, thickest) — <b>cortisol</b>; CYP17 and CYP11B1. Regulator: ACTH."],["<b>Зона ретикуларис</b> (вътрешна) — <b>андрогени</b> (DHEA, DHEA-S, андростендион); регулатор ACTH.","<b>Zona reticularis</b> (inner) — <b>androgens</b> (DHEA, DHEA-S, androstenedione); regulator ACTH."],["Медулата прави адреналин; кортизолът от кората стига до нея по порталните съдове и индуцира PNMT.","The medulla makes adrenaline; cortisol from the cortex reaches it via portal vessels and induces PNMT."]])+P_("Кортизол сутрин ≈ 10–20 µg/dL, около полунощ под 5 µg/dL; t½ ≈ 60–90 min. ACTH сутрин ≈ 10–60 pg/mL, t½ ≈ 10–20 min. Алдостерон ≈ 5–15 ng/dL (в легнало положение), t½ под 20 min.","Cortisol in the morning ≈ 10–20 µg/dL, around midnight below 5 µg/dL; t½ ≈ 60–90 min. ACTH in the morning ≈ 10–60 pg/mL, t½ ≈ 10–20 min. Aldosterone ≈ 5–15 ng/dL (supine), t½ below 20 min.")},
 {h:L("Механизмът стъпка по стъпка","The mechanism step by step"),html:"<ol>"+[["Хипоталамусът (паравентрикуларното ядро) отделя <b>CRH</b> на пулсове — най-много в ранните сутрешни часове и при стрес.","The hypothalamus (paraventricular nucleus) secretes <b>CRH</b> in pulses — most in the early morning hours and during stress."],["CRH стимулира кортикотрофите да отделят <b>ACTH</b> (от POMC).","CRH stimulates corticotrophs to release <b>ACTH</b> (from POMC)."],["ACTH действа чрез MC2R → cAMP → <b>StAR</b> пренася холестерола в митохондрията, където CYP11A1 го превръща в прегненолон (скоростоопределящ етап).","ACTH acts via MC2R → cAMP → <b>StAR</b> carries cholesterol into the mitochondrion, where CYP11A1 converts it to pregnenolone (the rate-limiting step)."],["Във фасцикулата: 17α-хидроксилиране (CYP17) → 21-хидроксилиране (CYP21) → 11β-хидроксилиране (CYP11B1) = <b>кортизол</b>.","In the fasciculata: 17α-hydroxylation (CYP17) → 21-hydroxylation (CYP21) → 11β-hydroxylation (CYP11B1) = <b>cortisol</b>."],["Кортизолът потиска CRH и ACTH — <b>отрицателна обратна връзка</b>. ACTH е и трофичен: при дълго висок ACTH кората хипертрофира, при нисък — атрофира.","Cortisol suppresses CRH and ACTH — <b>negative feedback</b>. ACTH is also trophic: prolonged high ACTH causes cortical hypertrophy, low ACTH atrophy."],["В гломерулозата ангиотензин II и K⁺ (деполяризация → Ca²⁺) стимулират CYP11B2 → <b>алдостерон</b>, който задържа Na⁺ и изхвърля K⁺ и H⁺ в събирателния канал.","In the glomerulosa angiotensin II and K⁺ (depolarisation → Ca²⁺) stimulate CYP11B2 → <b>aldosterone</b>, which retains Na⁺ and excretes K⁺ and H⁺ in the collecting duct."]].map(([b,e])=>"<li>"+L(b,e)+"</li>").join("")+"</ol>"},
 {h:L("Регулация и обратни връзки","Regulation and feedback"),html:P_("<b>Кортизол</b>: денонощен ритъм (пик ≈ 06–08 h), стрес го надвива; обратната връзка е бърза (минути, по скоростта на промяната) и бавна (часове, по нивото). <b>Алдостерон</b>: обем ↓ → ренин ↑ → ангиотензин II ↑ → алдостерон ↑ → Na⁺ и вода ↑ → обем се възстановява; K⁺ ↑ → алдостерон ↑ → K⁺ се изхвърля. ACTH вдига алдостерона само кратко.","<b>Cortisol</b>: circadian rhythm (peak ≈ 06–08 h), overridden by stress; feedback is fast (minutes, by rate of change) and slow (hours, by level). <b>Aldosterone</b>: volume ↓ → renin ↑ → angiotensin II ↑ → aldosterone ↑ → Na⁺ and water ↑ → volume restored; K⁺ ↑ → aldosterone ↑ → K⁺ excreted. ACTH raises aldosterone only briefly.")+P_("Ефекти на кортизола: глюконеогенеза и хипергликемия, катаболизъм на белтъците, липолиза (и преразпределение на мазнините), противовъзпалителен и имуносупресивен ефект, „пермисивно“ действие за катехоламините (съдов тонус), потиска костното образуване.","Cortisol effects: gluconeogenesis and hyperglycaemia, protein catabolism, lipolysis (and fat redistribution), anti-inflammatory and immunosuppressive effects, a “permissive” action for catecholamines (vascular tone), suppression of bone formation.")+P_("Кортизолът се свързва с минералкортикоидния рецептор колкото алдостерона, но в бъбрека <b>11β-HSD2</b> го превръща в неактивен кортизон. При много висок кортизол (ектопичен ACTH) ензимът се насища → хипокалиемия и хипертония; женската чушка (глициризин) го потиска.","Cortisol binds the mineralocorticoid receptor as avidly as aldosterone, but in the kidney <b>11β-HSD2</b> converts it to inactive cortisone. With very high cortisol (ectopic ACTH) the enzyme saturates → hypokalaemia and hypertension; liquorice (glycyrrhizin) inhibits it.")},
 {h:L("Клинично значение","Clinical relevance"),html:LI([["<b>Болест на Адисон</b> (разрушаване на кората): ниски кортизол и алдостерон, висок ACTH (хиперпигментация от POMC/MSH), висок ренин, хиперкалиемия, хипонатриемия, хипотония.","<b>Addison's disease</b> (destruction of the cortex): low cortisol and aldosterone, high ACTH (hyperpigmentation from POMC/MSH), high renin, hyperkalaemia, hyponatraemia, hypotension."],["<b>Вторична недостатъчност</b> (хипофиза или спрени глюкокортикоиди): нисък ACTH и кортизол, алдостеронът е запазен (ренин–ангиотензин) — няма хиперкалиемия.","<b>Secondary insufficiency</b> (pituitary, or stopped glucocorticoids): low ACTH and cortisol, aldosterone preserved (renin–angiotensin) — no hyperkalaemia."],["<b>Синдром на Кушинг</b>: екзогенни глюкокортикоиди (най-често), болест на Кушинг (ACTH от аденом на хипофизата — потиска се от висока, но не от ниска доза дексаметазон), аденом на кората (нисък ACTH, атрофия на другата жлеза), ектопичен ACTH.","<b>Cushing's syndrome</b>: exogenous glucocorticoids (most common), Cushing's disease (ACTH from a pituitary adenoma — suppressed by high but not low dose dexamethasone), cortical adenoma (low ACTH, atrophy of the other gland), ectopic ACTH."],["<b>Вродена надбъбречна хиперплазия</b> (дефицит на 21-хидроксилаза): нисък кортизол и алдостерон, висок ACTH → хиперплазия и отклоняване към андрогени (вирилизация), загуба на сол (при солово-губещата форма, ≈ 3/4 от класическите случаи).","<b>Congenital adrenal hyperplasia</b> (21-hydroxylase deficiency): low cortisol and aldosterone, high ACTH → hyperplasia and shunting to androgens (virilisation), salt wasting."],["<b>Синдром на Кон</b> (първичен хипералдостеронизъм): висок алдостерон, потиснат ренин, хипертония; хипокалиемия (само при ≈ 1/3 — повечето са с нормален K⁺) и метаболитна алкалоза. Скрининг: съотношение алдостерон/ренин.","<b>Conn's syndrome</b> (primary hyperaldosteronism): high aldosterone, suppressed renin, hypertension; hypokalaemia (only in ≈ 1/3 — most are normokalaemic) and metabolic alkalosis. Screening: aldosterone/renin ratio."]])},
 {h:L("Чести заблуди","Common misconceptions"),html:LI([["„ACTH регулира алдостерона.“ — Главните регулатори са ангиотензин II и K⁺; затова при хипофизна недостатъчност алдостеронът е нормален.","“ACTH regulates aldosterone.” — The main regulators are angiotensin II and K⁺; that is why aldosterone is normal in pituitary insufficiency."],["„Дексаметазонът се мери като кортизол.“ — Не; той потиска ACTH и така сваля измерения кортизол.","“Dexamethasone is measured as cortisol.” — No; it suppresses ACTH and so lowers measured cortisol."],["„Нормален сутрешен кортизол изключва Кушинг.“ — Характерна е загубата на ритъма: висок кортизол около полунощ.","“A normal morning cortisol excludes Cushing's.” — The typical finding is the loss of rhythm: high cortisol around midnight."]])},
 {h:L("Опростено в модела","Simplified in the model"),html:P_("Моделът е <b>редуциран образователен</b>: една средна концентрация вместо пулсове, денонощният ритъм е зададена крива, обемът, ренинът и K⁺ са по една обобщена променлива, а промяната на масата на кората е <b>ускорена</b> (дни вместо седмици–месеци), за да се вижда в симулацията. 3D сцената е схематичен напречен разрез с форма на обърнато Y (тяло и два крака): медулата е само в тялото, а дебелината на зоните е по средни пропорции (гломерулоза ≈ 15 %, фасцикулата ≈ 75 %, ретикуларис ≈ 10 % от кората). Жлезата е уголемена около 1,5 пъти спрямо бъбрека, за да се виждат зоните; бъбрекът, бъбречните съдове, уретерът и долната куха вена са истински анатомични модели (BodyParts3D).","The model is a <b>reduced educational model</b>: one mean concentration instead of pulses, the circadian rhythm is a set curve, volume, renin and K⁺ are single summary variables, and the change in cortical mass is <b>accelerated</b> (days instead of weeks–months) so that it is visible in the simulation. The 3D scene is a schematic transverse section shaped like an inverted Y (body and two limbs): the medulla is only in the body, and zone thickness follows average proportions (glomerulosa ≈ 15 %, fasciculata ≈ 75 %, reticularis ≈ 10 % of the cortex). The gland is enlarged about 1.5-fold relative to the kidney so the zones are visible; the kidney, renal vessels, ureter and inferior vena cava are real anatomical models (BodyParts3D).")}],
 key:[["Гломерулоза — алдостерон (Ang II, K⁺); фасцикулата — кортизол (ACTH); ретикуларис — андрогени (ACTH).","Glomerulosa — aldosterone (Ang II, K⁺); fasciculata — cortisol (ACTH); reticularis — androgens (ACTH)."],["StAR + CYP11A1 = скоростоопределящ етап; ACTH го ускорява чрез cAMP.","StAR + CYP11A1 = rate-limiting step; ACTH speeds it via cAMP."],["Кортизол: пик ≈ 06–08 h, минимум около полунощ; t½ ≈ 60–90 min.","Cortisol: peak ≈ 06–08 h, nadir around midnight; t½ ≈ 60–90 min."],["Първична недостатъчност: ACTH ↑, кортизол ↓, алдостерон ↓, K⁺ ↑, ренин ↑.","Primary insufficiency: ACTH ↑, cortisol ↓, aldosterone ↓, K⁺ ↑, renin ↑."],["Вторична: ACTH ↓, кортизол ↓, алдостерон N.","Secondary: ACTH ↓, cortisol ↓, aldosterone N."],["Дефицит на CYP21: кортизол ↓, алдостерон ↓, андрогени ↑, ACTH ↑ (хиперплазия).","CYP21 deficiency: cortisol ↓, aldosterone ↓, androgens ↑, ACTH ↑ (hyperplasia)."],["Кон: алдостерон ↑, ренин ↓, K⁺ ↓, хипертония.","Conn: aldosterone ↑, renin ↓, K⁺ ↓, hypertension."]].map(([b,e])=>L(b,e))};

const Q=a=>a.map(([q,qe,opts,an,ex,exe])=>({q:L(q,qe),opts:opts.map(([b,e])=>L(b,e)),a:an,expl:L(ex,exe)}));
const tests=Q([
 ["Коя зона на кората прави алдостерон?","Which cortical zone makes aldosterone?",[["Гломерулоза","Glomerulosa"],["Фасцикулата","Fasciculata"],["Ретикуларис","Reticularis"],["Медула","Medulla"]],0,"Само тя има CYP11B2 (алдостерон синтаза).","Only it has CYP11B2 (aldosterone synthase)."],
 ["Главните регулатори на алдостерона са:","The main regulators of aldosterone are:",[["ACTH и кортизол","ACTH and cortisol"],["Ангиотензин II и K⁺","Angiotensin II and K⁺"],["Na⁺ и ADH","Na⁺ and ADH"],["Инсулин","Insulin"]],1,"ACTH има само кратък, малък ефект.","ACTH has only a brief, small effect."],
 ["Кое е скоростоопределящият етап на стероидната синтеза?","What is the rate-limiting step of steroid synthesis?",[["Пренос на холестерол в митохондрията (StAR) и CYP11A1","Cholesterol transport into the mitochondrion (StAR) and CYP11A1"],["CYP21","CYP21"],["CYP11B1","CYP11B1"],["Сулфатиране на DHEA","DHEA sulfation"]],0,"ACTH го ускорява чрез cAMP.","ACTH speeds it via cAMP."],
 ["Кога кортизолът е най-висок при нормален ритъм?","When is cortisol highest in a normal rhythm?",[["Около полунощ","Around midnight"],["Рано сутрин (06–08 h)","Early morning (06–08 h)"],["Следобед","Afternoon"],["Еднакво през деня","Same all day"]],1,"Минимумът е около полунощ.","The nadir is around midnight."],
 ["При болест на Адисон ACTH е:","In Addison's disease ACTH is:",[["Нисък","Low"],["Висок","High"],["Нормален","Normal"],["Не се отделя","Not secreted"]],1,"Липсва обратната връзка от кортизола; POMC ↑ → хиперпигментация.","Cortisol feedback is lost; POMC ↑ → hyperpigmentation."],
 ["Защо при хипофизна недостатъчност няма хиперкалиемия?","Why is there no hyperkalaemia in pituitary insufficiency?",[["Алдостеронът зависи главно от ренин–ангиотензин и K⁺","Aldosterone depends mainly on renin–angiotensin and K⁺"],["Кортизолът задържа K⁺","Cortisol retains K⁺"],["ACTH изхвърля K⁺","ACTH excretes K⁺"],["Медулата компенсира","The medulla compensates"]],0,"Гломерулозата не зависи от ACTH.","The glomerulosa does not depend on ACTH."],
 ["Дефицит на 21-хидроксилаза води до:","21-hydroxylase deficiency causes:",[["Кортизол ↑, андрогени ↓","Cortisol ↑, androgens ↓"],["Кортизол ↓, алдостерон ↓, андрогени ↑","Cortisol ↓, aldosterone ↓, androgens ↑"],["Само хипертония","Only hypertension"],["Нисък ACTH","Low ACTH"]],1,"ACTH расте, кората хиперплазира и предшествениците отиват към андрогените.","ACTH rises, the cortex becomes hyperplastic and precursors go to androgens."],
 ["Синдром на Кон — кое е вярно?","Conn's syndrome — which is true?",[["Ренинът е висок","Renin is high"],["Алдостерон ↑, ренин ↓, K⁺ ↓","Aldosterone ↑, renin ↓, K⁺ ↓"],["Хиперкалиемия","Hyperkalaemia"],["Хипотония","Hypotension"]],1,"Автономният алдостерон разширява обема и потиска ренина.","Autonomous aldosterone expands volume and suppresses renin."],
 ["Болест на Кушинг (аденом на хипофизата): ниска доза дексаметазон…","Cushing's disease (pituitary adenoma): low-dose dexamethasone…",[["потиска кортизола","suppresses cortisol"],["не го потиска, висока доза го потиска","does not suppress it; a high dose does"],["вдига ACTH","raises ACTH"],["няма ефект при никоя доза","has no effect at any dose"]],1,"Аденомът има по-висок праг на обратната връзка.","The adenoma has a higher feedback set point."],
 ["Кортизол-секретиращ аденом на кората: ACTH е…","Cortisol-secreting cortical adenoma: ACTH is…",[["висок","high"],["нисък, другата жлеза атрофира","low, the other gland atrophies"],["нормален","normal"],["пулсиращ","pulsatile"]],1,"Автономният кортизол потиска хипофизата.","Autonomous cortisol suppresses the pituitary."],
 ["Дълго лечение с глюкокортикоиди и рязко спиране води до:","Long glucocorticoid treatment stopped abruptly causes:",[["Хиперкортицизъм","Hypercortisolism"],["Вторична надбъбречна недостатъчност (атрофирала кора)","Secondary adrenal insufficiency (atrophied cortex)"],["Синдром на Кон","Conn's syndrome"],["Хиперкалиемия","Hyperkalaemia"]],1,"ACTH е потиснат и кората е атрофирала — нужно е постепенно спиране.","ACTH is suppressed and the cortex atrophied — tapering is needed."],
 ["Ефект на кортизола е:","An effect of cortisol is:",[["Хипогликемия","Hypoglycaemia"],["Глюконеогенеза и хипергликемия","Gluconeogenesis and hyperglycaemia"],["Анаболизъм на белтъците","Protein anabolism"],["Усилване на възпалението","Enhanced inflammation"]],1,"Кортизолът е контраинсуларен и катаболен.","Cortisol is counter-insulin and catabolic."],
 ["Хиперпигментацията при Адисон се дължи на:","Hyperpigmentation in Addison's is due to:",[["Висок POMC (ACTH и MSH)","High POMC (ACTH and MSH)"],["Висок алдостерон","High aldosterone"],["Нисък K⁺","Low K⁺"],["Висок адреналин","High adrenaline"]],0,"MSH и ACTH идват от общия предшественик POMC.","MSH and ACTH come from the common precursor POMC."],
 ["Повишен K⁺ в плазмата:","Raised plasma K⁺:",[["Потиска алдостерона","Suppresses aldosterone"],["Стимулира алдостерона пряко","Stimulates aldosterone directly"],["Не му влияе","Does not affect it"],["Действа само чрез ренина","Acts only via renin"]],1,"Деполяризация на клетките на гломерулозата → Ca²⁺ → CYP11B2.","Depolarisation of glomerulosa cells → Ca²⁺ → CYP11B2."]]);
const exp=Q([
 ["Нормален ритъм: кога ACTH и кортизолът са най-ниски?","Normal rhythm: when are ACTH and cortisol lowest?",[["Около 08:00","Around 08:00"],["Около полунощ","Around midnight"]],1,"Гледай часовника и графиката — минимумът е около полунощ.","Watch the clock and the plot — the nadir is around midnight."],
 ["Болест на Адисон: какво става с K⁺ и ACTH?","Addison's disease: what happens to K⁺ and ACTH?",[["K⁺ ↓, ACTH ↓","K⁺ ↓, ACTH ↓"],["K⁺ ↑, ACTH ↑","K⁺ ↑, ACTH ↑"]],1,"Без алдостерон K⁺ се задържа; без кортизол ACTH расте.","Without aldosterone K⁺ is retained; without cortisol ACTH rises."],
 ["Дефицит на CYP21: накъде отиват предшествениците?","CYP21 deficiency: where do the precursors go?",[["Към андрогените — DHEA-S расте","To androgens — DHEA-S rises"],["Към алдостерона","To aldosterone"]],0,"Високият ACTH увеличава кората, а блокът пренасочва синтезата.","High ACTH enlarges the cortex and the block redirects synthesis."],
 ["Синдром на Кон: какво става с ренина (Ang II)?","Conn's syndrome: what happens to renin (Ang II)?",[["Расте","It rises"],["Потиснат е","It is suppressed"]],1,"Задържането на Na⁺ разширява обема и потиска ренина.","Na⁺ retention expands volume and suppresses renin."],
 ["Екзогенен глюкокортикоид (дексаметазон): какво става с кората?","Exogenous glucocorticoid (dexamethasone): what happens to the cortex?",[["Хипертрофира","It hypertrophies"],["ACTH пада и кората атрофира","ACTH falls and the cortex atrophies"]],1,"В 3D сцената фасцикулата изтънява (ускорено).","In the 3D scene the fasciculata thins (accelerated)."]]);
[["norm"],["addison"],["cah"],["conn"],["dex"]].forEach(([k],i)=>{exp[i].set={pre:k};exp[i].pre=k});

/* ---------- изглед ---------- */
function view(main){let SS=null;const v3=ad3D(()=>({s:SS,p:window.__adP||{str:0,dex:0,res:100,e21:100,kin:80,pre:"norm"}}));
  const cfg={key:"adrenal",h2:L("Надбъбречна кора: кортизол и алдостерон","Adrenal cortex: cortisol and aldosterone"),
   lead:L("Оста CRH–ACTH–кортизол, денонощният ритъм и регулацията на алдостерона. 1 s = 1 час. Опростено: средни нива вместо пулсове; промяната на масата на кората е ускорена.","The CRH–ACTH–cortisol axis, the circadian rhythm and aldosterone regulation. 1 s = 1 hour. Simplified: mean levels instead of pulses; the change in cortical mass is accelerated."),
   ch:340,speed:1,dtmax:0.01,recdt:0.1,hmax:600,
   sl:[{k:"str",label:L("Стрес (физически, психичен)","Stress (physical, psychological)"),min:0,max:100,step:5,value:0,unit:"%",hint:L("усилва CRH; надвива денонощния ритъм и обратната връзка","amplifies CRH; overrides the rhythm and feedback")},
       {k:"dex",label:L("Дексаметазон","Dexamethasone"),min:0,max:8,step:0.25,value:0,unit:"mg",d:2,hint:L("1 mg = нискодозов тест; 8 mg = високодозов","1 mg = low-dose test; 8 mg = high-dose")},
       {k:"kin",label:L("Прием на K⁺","K⁺ intake"),min:30,max:200,step:5,value:80,unit:"mmol/ден",hint:L("норма ≈ 60–100; повече K⁺ вдига алдостерона","normal ≈ 60–100; more K⁺ raises aldosterone")},
       {k:"res",label:L("Запазена кора","Remaining cortex"),min:5,max:100,step:5,value:100,unit:"%",hint:L("под ≈ 10 % — болест на Адисон (автоимунна, ТБК)","below ≈ 10 % — Addison's disease (autoimmune, TB)")},
       {k:"e21",label:L("Активност на 21-хидроксилазата","21-hydroxylase activity"),min:2,max:100,step:2,value:100,unit:"%",hint:L("ниска — вродена надбъбречна хиперплазия","low — congenital adrenal hyperplasia")}],
   pre:{norm:{n:L("Норма","Normal"),info:L("Кортизолът следва ACTH със закъснение (при пулсовете ≈ 10–20 min, в модела с усреднени нива ≈ 1 h): пик сутрин, минимум около полунощ. Алдостеронът се определя от ангиотензин II и K⁺.","Cortisol follows ACTH with a lag (≈ 10–20 min for pulses, ≈ 1 h for the averaged levels in the model): morning peak, nadir around midnight. Aldosterone is set by angiotensin II and K⁺.")},
        stress:{n:L("Остър стрес","Acute stress"),set:{str:80},info:L("CRH и ACTH растат независимо от часа; кортизолът се покачва за минути–часове и надвива обратната връзка.","CRH and ACTH rise regardless of the hour; cortisol rises within minutes–hours and overrides the feedback.")},
        dex:{n:L("Екзогенен глюкокортикоид (дексаметазон 1 mg)","Exogenous glucocorticoid (dexamethasone 1 mg)"),set:{dex:1},info:L("Дексаметазонът потиска CRH и ACTH; измереният кортизол пада под ≈ 2 µg/dL, а без ACTH кората атрофира (ускорено) — при рязко спиране следва вторична недостатъчност.","Dexamethasone suppresses CRH and ACTH; measured cortisol falls below ≈ 2 µg/dL and without ACTH the cortex atrophies (accelerated) — stopping abruptly leads to secondary insufficiency.")},
        addison:{n:L("Болест на Адисон","Addison's disease"),set:{res:5},info:L("Разрушена кора: кортизолът и алдостеронът падат, ACTH и ренинът растат, K⁺ се задържа, налягането пада.","Destroyed cortex: cortisol and aldosterone fall, ACTH and renin rise, K⁺ is retained, pressure falls.")},
        cushD:{n:L("Болест на Кушинг (аденом на хипофизата)","Cushing's disease (pituitary adenoma)"),info:L("Автономен ACTH с по-висок праг на обратната връзка: кортизолът е висок без нощен минимум, кората е хиперплазирала. Опитай 1 mg и 8 mg дексаметазон.","Autonomous ACTH with a higher feedback set point: cortisol is high without a night nadir, the cortex is hyperplastic. Try 1 mg and 8 mg dexamethasone.")},
        adrAd:{n:L("Кортизол-секретиращ аденом на кората","Cortisol-secreting cortical adenoma"),info:L("Аденомът прави кортизол без ACTH: ACTH е потиснат, останалата кора атрофира и дексаметазонът не сваля кортизола.","The adenoma makes cortisol without ACTH: ACTH is suppressed, the rest of the cortex atrophies and dexamethasone does not lower cortisol.")},
        cah:{n:L("ВНХ (дефицит на 21-хидроксилаза)","CAH (21-hydroxylase deficiency)"),set:{e21:6},info:L("Блок на CYP21: кортизолът и алдостеронът са ниски, ACTH е висок, кората хиперплазира и предшествениците отиват към андрогените (вирилизация); загуба на сол, хиперкалиемия.","CYP21 block: cortisol and aldosterone are low, ACTH is high, the cortex becomes hyperplastic and precursors go to androgens (virilisation); salt wasting, hyperkalaemia.")},
        conn:{n:L("Синдром на Кон (алдостерома)","Conn's syndrome (aldosteronoma)"),info:L("Автономен алдостерон: задържане на Na⁺ и вода, ренинът и ангиотензин II са потиснати, K⁺ пада, налягането расте.","Autonomous aldosterone: Na⁺ and water retention, renin and angiotensin II are suppressed, K⁺ falls, pressure rises.")}},
   exp,init:()=>adInit(),
   step(s,p,dt){adStep(s,p,dt);SS=s;window.__adP=p},
   rec:(s,p,t)=>[t,s.A,s.F,s.Ald,s.K,s.AngII],calc:(p,s)=>s?adFlux(s,p):null,
   stats:(p,R,s)=>s?[[L("Час","Time"),String(Math.floor(hr(s.t))).padStart(2,"0")+":"+String(Math.floor((hr(s.t)%1)*60)).padStart(2,"0")],["ACTH",fmt(s.A,0)+" pg/mL"],[L("Кортизол","Cortisol"),fmt(s.F,1)+" µg/dL ("+fmt(s.F*27.6,0)+" nmol/L)"],[L("Алдостерон","Aldosterone"),fmt(s.Ald,1)+" ng/dL"],[L("Ренин (Ang II)","Renin (Ang II)"),fmt(s.AngII*100,0)+" %"],["K⁺",fmt(s.K,1)+" mmol/L"],[L("Андрогени (DHEA-S)","Androgens (DHEA-S)"),"×"+fmt(s.DHEA,1)],[L("17-OH-прогестерон","17-OH-progesterone"),"×"+fmt(s.OHP,s.OHP<10?1:0)],[L("Средно АН","Mean BP"),fmt(s.MAP,0)+" mmHg"],[L("Маса на кората","Cortical mass"),fmt(s.M*p.res,0)+" %"]]:[],
   note:(p,R,s)=>!s?"":s.DHEA>2.5&&p.e21<60?L("<b>Отклоняване към андрогените</b>: блокът на CYP21 и високият ACTH пренасочват предшествениците; 17-OH-прогестеронът е многократно повишен (диагностичен маркер).","<b>Shunt to androgens</b>: the CYP21 block and high ACTH redirect the precursors; 17-OH-progesterone is many-fold raised (the diagnostic marker)."):s.F<4&&s.A>80?L("<b>Първична недостатъчност</b>: кортизолът е нисък, затова обратната връзка липсва и ACTH расте.","<b>Primary insufficiency</b>: cortisol is low, so the feedback is lost and ACTH rises."):p.dex>0&&s.F<3?L("<b>Дексаметазон</b>: ACTH е потиснат, затова измереният кортизол е нисък — нормално потискане.","<b>Dexamethasone</b>: ACTH is suppressed, so measured cortisol is low — normal suppression."):p.dex>0&&s.F>5?L("Кортизолът <b>не се потиска</b> от дексаметазона: автономен източник или по-висок праг на обратната връзка.","Cortisol is <b>not suppressed</b> by dexamethasone: an autonomous source or a higher feedback set point."):s.Ald>25&&s.AngII<0.3?L("<b>Първичен хипералдостеронизъм</b>: алдостеронът е висок при потиснат ренин; K⁺ пада.","<b>Primary hyperaldosteronism</b>: aldosterone is high with suppressed renin; K⁺ falls."):s.DHEA>2?L("<b>Отклоняване към андрогените</b>: блокът на CYP21 и високият ACTH пренасочват предшествениците.","<b>Shunt to androgens</b>: the CYP21 block and high ACTH redirect the precursors."):L("Кортизолът следва ACTH със закъснение (при пулсовете ≈ 10–20 min, в модела с усреднени нива ≈ 1 h) и го потиска (<b>отрицателна обратна връзка</b>); алдостеронът се управлява от ангиотензин II и K⁺.","Cortisol follows ACTH with a lag (≈ 10–20 min for pulses, ≈ 1 h for the averaged levels in the model) and suppresses it (<b>negative feedback</b>); aldosterone is controlled by angiotensin II and K⁺."),
   legend:`<span><i style="background:${C.acth}"></i>ACTH</span><span><i style="background:${C.cort}"></i>${T_(L("кортизол ×4","cortisol ×4"))}</span><span><i style="background:${C.ald}"></i>${T_(L("алдостерон","aldosterone"))}</span><span><i style="background:${C.ang}"></i>${T_(L("ренин (Ang II) ×10","renin (Ang II) ×10"))}</span>`,
   plots:[{f:(p,R,h)=>{const x=h.map(a=>a[0]),T=Math.max(54,Math.ceil((x[x.length-1]||0)/6)*6);return {xmin:T-48,xmax:T,ymin:0,ymax:Math.max(120,Math.ceil(Math.max(...h.map(a=>Math.max(a[1],a[2]*4)))/20)*20),xlabel:L("време, часове","time, hours"),ylabel:L("ACTH (pg/mL), кортизол ×4 (µg/dL)","ACTH (pg/mL), cortisol ×4 (µg/dL)"),series:[{x,y:h.map(a=>a[1]),color:C.acth,width:2.2},{x,y:h.map(a=>a[2]*4),color:C.cort,width:2.2}]}}},
          {f:(p,R,h)=>{const x=h.map(a=>a[0]),T=Math.max(54,Math.ceil((x[x.length-1]||0)/6)*6);return {xmin:T-48,xmax:T,ymin:0,ymax:Math.max(30,Math.ceil(Math.max(...h.map(a=>Math.max(a[3],a[5]*10)))/10)*10),xlabel:L("време, часове","time, hours"),ylabel:L("алдостерон (ng/dL), ренин ×10","aldosterone (ng/dL), renin ×10"),series:[{x,y:h.map(a=>a[3]),color:C.ald,width:2.2},{x,y:h.map(a=>a[5]*10),color:C.ang,width:2,dash:[5,3]}]}}}],
   draw};
  window.__adCfg=cfg;mkSim(main,cfg);
  const card=main.querySelector(".card");card.parentNode.insertBefore(v3.el,card);(window.__cleanups=window.__cleanups||[]).push(v3.start())}

const gl=[{t:L("Адренокортикотропен хормон (ACTH)","Adrenocorticotropic hormone (ACTH)"),re:"адренокортикотроп[а-я]* хормон[а-я]*",d:L("Хормон на предната хипофиза от POMC; стимулира синтезата на кортизол и андрогени и поддържа масата на кората.","Anterior pituitary hormone from POMC; stimulates cortisol and androgen synthesis and maintains cortical mass.")},
 {t:L("Кортизол","Cortisol"),re:"кортизол[а-я]*",d:L("Главният глюкокортикоид: глюконеогенеза, катаболизъм, противовъзпалителен ефект; потиска CRH и ACTH.","The main glucocorticoid: gluconeogenesis, catabolism, anti-inflammatory effect; suppresses CRH and ACTH.")},
 {t:L("Алдостерон","Aldosterone"),re:"алдостерон[а-я]*",d:L("Минералкортикоид от гломерулозата; задържа Na⁺ и изхвърля K⁺ и H⁺; регулира се от ангиотензин II и K⁺.","Mineralocorticoid from the glomerulosa; retains Na⁺ and excretes K⁺ and H⁺; regulated by angiotensin II and K⁺.")},
 {t:L("Болест на Адисон","Addison's disease"),re:"Адисон[а-я]*",d:L("Първична недостатъчност на надбъбречната кора: ниски кортизол и алдостерон, висок ACTH, хиперкалиемия, хиперпигментация.","Primary adrenal insufficiency: low cortisol and aldosterone, high ACTH, hyperkalaemia, hyperpigmentation.")},
 {t:L("Синдром на Кушинг","Cushing's syndrome"),re:"Кушинг[а-я]*",d:L("Хиперкортицизъм от всякаква причина; болест на Кушинг е ACTH от аденом на хипофизата.","Hypercortisolism of any cause; Cushing's disease is ACTH from a pituitary adenoma.")},
 {t:L("Синдром на Кон","Conn's syndrome"),re:"синдром[а-я]* на Кон|Кон(?=[\\s.,;:)]|$)",d:L("Първичен хипералдостеронизъм: алдостерон ↑, ренин ↓, хипокалиемия, хипертония.","Primary hyperaldosteronism: aldosterone ↑, renin ↓, hypokalaemia, hypertension.")},
 {t:L("Вродена надбъбречна хиперплазия","Congenital adrenal hyperplasia"),re:"вроден[а-я]* надбъбречн[а-я]* хиперплази[а-я]*|ВНХ",d:L("Ензимен дефект на стероидната синтеза (най-често 21-хидроксилаза): кортизол ↓, ACTH ↑, хиперплазия, андрогени ↑.","Enzyme defect of steroid synthesis (most often 21-hydroxylase): cortisol ↓, ACTH ↑, hyperplasia, androgens ↑.")},
 {t:L("StAR белтък","StAR protein"),re:"StAR",d:L("Пренася холестерола във вътрешната митохондриална мембрана; заедно с CYP11A1 е скоростоопределящият етап.","Carries cholesterol into the inner mitochondrial membrane; with CYP11A1 it is the rate-limiting step.")}];

zRegister("adrenal",{name:L("Надбъбречна кора","Adrenal cortex"),view,book,tests,exp,gl});
window.__adModel={adInit,adStep,adFlux,QP};
})();
