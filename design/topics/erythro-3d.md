# erythro — 3D scene design: „Еритропоеза, желязо и анемии“

Status: DESIGN ONLY (not implemented). Target file: `site/js/mod-erythro.js` (add to `index.html` + `build.py`),
function `er3D(get)` following the `ad3D` pattern (mod-adrenal.js): `wrap3D` → `mk3DView("#erW", init, ctx=>ctx.frame())`
→ `make3D(...,{hq:true,fov:38})`, `zMat` tissues, `MK.loadMesh` BodyParts3D, `zFlow` particles, `MK.taper` vessels,
labels via `G.render([[text,Vector3],...])`, leader `LineSegments` (depthTest:false), `ph=innerWidth<600`, `LOWGPU`.

## 1. Composition — one WebGL context, six camera stops ("стоп-кадри")

One scene, six stations laid out far apart in world space (x spacing 40 units) so they never overlap; only the
active station group (and the one being tweened to) has `visible=true` → draw calls stay per-station.
A chip row under the canvas (`Обзор · Бъбрек · Костен мозък · Кръв · Дуоденум · Слезка`) plus auto-tour button.
Camera tween: 0.9 s ease-in-out on `G` orbit params (r, th, phi, target) — same fields as `make3D` opts.

| # | Station | Scale (say it in the legend!) | Accuracy class |
|---|---------|------|------|
| S0 | Body overview: kidney R, liver, duodenum, spleen, femur, aorta/IVC (BodyParts3D) + circulating "flux" particles between organs | organ, cm | anatomically accurate meshes; flows = educational schematic |
| S1 | Renal cortex: peritubular capillary between two proximal tubules, interstitial fibroblast-like EPO cell (REPC) | ~50 µm | educational simplification (procedural) |
| S2 | Bone-marrow erythroblastic island: central macrophage + ring of erythroblasts at 4 maturation stages, sinusoid wall | ~60 µm | educational simplification; cell sizes true-relative |
| S2b | (sub-stop of S2) enucleation + reticulocyte diapedesis through sinusoid endothelium | ~15 µm | simplification |
| S3 | Circulating blood: capillary/venule segment with RBC population morphology from the model | ~30 µm | RBC shape anatomically accurate (Evans–Fung); population mix physiologic from model |
| S4 | Duodenal enterocyte: apical DMT1/Dcytb, cytosolic ferritin, basolateral ferroportin (+hepcidin), hephaestin, transferrin in capillary | ~25 µm cell, proteins enlarged | proteins real PDB in "Реалистичен", NOT to cell scale (state it) |
| S5 | Splenic red pulp macrophage: phagocytosis of senescent RBC → heme → Fe → ferroportin → Tf | ~30 µm | simplification |

Why one scene + stops instead of linked panels: 1 context on phones (several contexts were a problem before),
shared materials/geometries (RBC geometry reused in S2b, S3, S5, S0 flux). Alternative kept open: `zCellStg`
for S4 only if the lesson wants a staged "step 1..n" mode for iron transport (see §7).

## 2. Model → visual mapping (adapter)

The physiology model (parallel design) is read via `get()` → `{s,p}`; the view uses ONLY this adapter so field
names can be fixed in one place. Recompute derived visuals only when values change (like `lastK` in ad3D).

```js
const A=s=>({ // all clamped; units as model
  pO2r:s.PaO2ren,  epo:s.EPO/10,          // EPO ×normal (≈10 mU/mL → 1)
  prog:s.prog,     ret:s.retic,           // retic % (norm 1)
  hb:s.Hb/14.5,    hct:s.Hct/0.43,  mcv:s.MCV, mch:s.MCH,
  fe:s.FeAbs/1.5,  tsat:s.TSAT/0.3,  fer:s.ferritin/100, hep:s.hepcidin/1, // ×normal
  hem:s.hemolysis, bleed:s.bleed, b12:s.B12fol, ckd:s.CKD, alt:s.alt, day:s.day});
```

| Variable | Station | Visual (and clamp) |
|---|---|---|
| renal PaO₂ (↓ in anemia/altitude) | S1, S0 | REPC halo emissive + HIF "nucleus glow" ∝ hypoxia `cl((40-pO2r)/25,0,1)`; capillary RBC density ∝ hct; O₂ particles (small `#4dabf7` dots) leaving capillary ∝ pO2r |
| EPO | S1→S2, S0 | `zFlow` EPO particles (`#be4bdb` violet) count `round(cl(8*epo,0,40))`; path: REPC → peritubular capillary → renal vein; in S0 along renal V → IVC → … → femur artery. Speed constant (blood transit), density = concentration |
| CKD | S1 | number of active REPC 3→1, fibrotic interstitium (darker, greyer zMat palette, `sc` noise ↑), EPO count capped |
| marrow progenitors / EPO drive | S2 | number of erythroblasts on island 6→14 (instanced, slots on rings); mitosis pulse (scale 1→1.08 split) rate ∝ epo |
| reticulocyte production (5–7 d lag is in the model, NOT faked by the view) | S2b | enucleation events/min ∝ ret production; reticulocytes in sinusoid ∝ ret |
| Hb / RBC count / Hct | S3, S0 | RBC instance count in vessel `round(NRBC*cl(hct,0.25,1.6))`; overall blood tint in S0 vessels mix(pale `#c98a8a`, `#a61e1e`, hb) |
| MCV | S3 | per-population scale: `sc=cbrt(MCV/90)` (volume ∝ MCV) → microcytes (<80) / macrocytes (>100) |
| MCH / TSAT (hypochromia) | S3, S2 | central pallor radius uniform `uPal = cl(0.33 + 0.9*(1-mch/30),0.33,0.75)` (normal pallor ≈ ⅓ diameter); haemoglobinization of late erythroblasts (colour lerp bluish-grey → red) ∝ tsat |
| B12/folate | S2, S3 | megaloblasts: larger erythroblasts, fine "open" chromatin texture, nucleus–cytoplasm asynchrony (red cytoplasm with still-large nucleus); hypersegmented neutrophil 1 instance in S3 (lobes 5–6) |
| hemolysis | S3, S5 | fraction of spherocytes + schistocytes (fragments) in S3; macrophage phagocytosis rate in S5 ∝ hem; free Hb haze (plasma tint) when intravascular |
| blood loss | S0, S3 | S0: drip of RBC particles from a marked vessel break (schematic); S3 Hct drop; all cells normochromic normocytic early |
| iron absorption | S4 | Fe²⁺ particle flux apical→basolateral (rust-red `#a5532a` Fe²⁺, dark brown-red `#7b2d26` Fe³⁺; never Na⁺ orange) count ∝ fe |
| hepcidin | S4, S5 | hepcidin peptides (small `#e64980` pink) bound on ferroportin = round(4*cl(hep,0,2)); bound FPN fades, internalizes (moves 1.5 µm into cell and scales 0.6) → basolateral flux 0 |
| ferritin | S4, S5 | number of ferritin cages in cytosol `round(cl(6*fer,0,24))` (real 2FHA shell when MK.real) |
| transferrin saturation | S4, S2 | fraction of Tf instances carrying 2 Fe (diferric, rust dot pair) vs apo-Tf; S2 TfR1 endocytosis on erythroblasts ∝ tsat |
| altitude | S0, S1 | pO2r ↓ → same as hypoxia; scene caption shows altitude |

Colour rule: no green / yellow / gold / cream. Na⁺ orange `#f76707` is NOT used for iron (avoid confusion).
Palette: RBC `#b3262e` → hypochromic centre `#e6b3b3`; EPO `#be4bdb`; hepcidin `#e64980`; Fe²⁺ `#a5532a`,
Fe³⁺ `#7b2d26`; Tf `#748ffc` (blue protein) with Fe dots; ferritin `#9a6f72` shell, `#7b2d26` core; O₂ `#4dabf7`;
nuclei `#5c4a8a` (haematoxylin-like violet-blue), macrophage cytoplasm `#d8b4b8`. Check every hex has no G-dominant / yellow hue.

## 3. Geometry recipes

### 3.1 Biconcave RBC (Evans & Fung 1972), one shared LatheGeometry
```js
// D0 = 7.82 µm, a0=0.0518, a1=2.0026, a2=-4.491  — h(x)=D0/2*sqrt(1-x²)*(a0+a1x²+a2x⁴), x=r/R
function rbcGeo(T,R=1,nr=lo?14:22,nth=lo?18:28){const a0=0.0518,a1=2.0026,a2=-4.491,pts=[];
  for(let i=0;i<=nr;i++){const x=Math.sin(i/nr*Math.PI/2);            // dense at rim
    const h=R*Math.sqrt(Math.max(0,1-x*x))*(a0+a1*x*x+a2*x**4);pts.push(new T.Vector2(x*R,h))}
  // profile: centre-top → rim → centre-bottom (lathe around y, then rotate so disc normal = z)
  const prof=pts.concat(pts.slice(0,-1).reverse().map(p=>new T.Vector2(p.x,-p.y)));
  const g=new T.LatheGeometry(prof,nth);g.rotateX(Math.PI/2);            // disc normal = z
  // attribute "rho" (0 centre → 1 rim) for pallor shader
  const P=g.attributes.position,rho=new Float32Array(P.count);for(let i=0;i<P.count;i++)rho[i]=Math.hypot(P.getX(i),P.getY(i))/R;
  g.setAttribute("rho",new T.BufferAttribute(rho,1));g.computeVertexNormals();return g}
```
Check: thickness at centre ≈ 0.81 µm, max ≈ 2.58 µm at x≈0.85 (verify numerically in QA).
Morphs (`geometry.morphAttributes.position`, r128 supports morphs on InstancedMesh as shared influence):
- **spherocyte**: same volume, smaller diameter (~6.2 µm), no pallor → morph target = sphere-ish `h=R'*sqrt(1-x²)*0.75`.
- **macrocyte / microcyte**: no morph, instance scale `cbrt(MCV/90)` in xy and z.
- **schistocyte**: separate tiny geometry: RBC lathe clipped by 2 planes (helmet/triangle) built once with CPU clip of vertices (pull vertices beyond plane onto it), 40 tris.
- **reticulocyte**: RBC with a=+15% diameter, morph 0.3 toward "less concave", faint bluish tint (polychromasia `#9a6f8a`).
- **megaloblastic macro-ovalocyte**: instance scale (1.15,1.0,1.1).

Populations = separate `InstancedMesh`es sharing `rbcGeo` and one `ShaderMaterial`/patched `MeshStandardMaterial`:
`normal`, `hypo` (micro), `macro`, `sphero`, `frag`, `retic`. Counts from model fractions; sum = N_RBC.
Per-population uniforms: `uPal` (pallor radius), `uCol`. Pallor via `onBeforeCompile` on MeshStandardMaterial
(keep PBR lighting): `diffuseColor.rgb = mix(uCol, uPale, (1.-smoothstep(uPal-0.12,uPal,vRho))*uPalAmt);`.
Subsurface fake: `emissive = 0.08*uCol` + rim `pow(1-dot(N,V),3)*0.15` → wet, not plastic. clearcoat 0.3, roughness 0.45.

### 3.2 RBC motion (S3) — no per-frame allocations
- Vessel: `zTube` capillary/venule (inner radius 4 µm capillary → RBCs fold "parachute": apply morph `para` 0..1 when lumen r < 4 µm; venule r=10 µm with tumbling).
- Each RBC i has precomputed `u0, rOff(θ, ρ), spinAxis, spinRate` in Float32Arrays; per frame `u=(u0+v*t)%1`;
  position = centreline point (pre-sampled 256-point LUT, no `getPoint` per instance) + frame(N,B)·offset, radial
  speed profile Poiseuille: `v(ρ)=vmax*(1-ρ²)` → central cells faster (physiologically correct, label it).
- One reused `Matrix4/Quaternion/Vector3` set (like zFlow).
- Count: desktop 260, LOWGPU 120 (capillary stop 30).

### 3.3 Erythroblastic island (S2)
- Central macrophage: icosphere (detail 4) displaced by 3-octave value noise + 10 pseudopod arms (`MK.taper` from
  surface to each erythroblast slot, r 0.6→0.2 µm) that wrap the erythroblasts. Ø ≈ 20 µm.
- Erythroblasts on 2 rings (slots 14): stage geometry by slot age `a∈[0,1)`:
  proerythroblast Ø 16 µm, nucleus 80% (fine chromatin) → basophilic Ø 13 → polychromatic Ø 10 → orthochromatic Ø 8,
  nucleus 50%→pyknotic 30% and dark. Cytoplasm colour lerp `#7a6fa8` (basophilic, ribosomes) → `#b3262e` (Hb) with
  `hbRate = cl(tsat,0.2,1.2)*(b12def?0.6:1)` (iron deficiency → late cells stay paler and smaller; B12 → nucleus lags).
- Two InstancedMeshes (cytoplasm sphere with noise, nucleus sphere) — 14+14 instances, one draw each.
- Age advances `a += dt*rate`, rate ∝ EPO (model value; do not add the 5–7 d lag here — it lives in the model).
- Sinusoid: `zTube` r=12 µm, thin endothelium (zMat translucent 0.35), fenestrae as darker spots in shader.
- **Enucleation (S2b)**: when slot age crosses 0.92: nucleus moves to one pole (0.6 s), cytoplasm becomes "dumbbell"
  (2 spheres) → pinches; pyrenocyte (nucleus + thin membrane, phosphatidylserine "eat-me" tint) is engulfed by macrophage
  (moves to arm, scale→0 over 1 s); reticulocyte travels through endothelial pore (squeeze: scale x 0.5) into sinusoid →
  joins `retic` population heading out. Slot reset to age 0 (new progenitor, CFU-E/BFU-E). Event queue is a fixed ring
  buffer of 6.

### 3.4 Kidney peritubular (S1)
- 2 proximal tubules: `zTube` r=25 µm (scaled units) with cuboidal-cell bumps (brush-border inner shell darker);
  peritubular capillary `zTube` r=4 µm in between; RBCs from S3 system (count 12, Hct-based).
- REPC: flattened stellate cell (sphere scale (1,0.35,0.7) + 6 tapered dendrites), nucleus with `uHIF` glow
  (`#be4bdb` emissive ∝ hypoxia). EPO particles bud from REPC into capillary.
- CKD preset: tubules atrophic (scale 0.8), interstitium fibrosis = dense instanced collagen fibres (thin cylinders,
  `#9a8f96`), only 1 REPC alive → visibly fewer EPO particles despite low Hb (the key teaching point).

### 3.5 Duodenal enterocyte (S4)
Reuse `MK.bilayer` / `zCellStg`-style cell: apical surface up = lumen (microvilli instanced cylinders 24–60),
basolateral down = lamina propria capillary with Tf.
- Apical: Dcytb reduces Fe³⁺→Fe²⁺ (colour swap at the surface), DMT1 imports Fe²⁺ (+ H⁺ symport, `#1c7ed6` small).
  Heme iron via HCP1 (optional, schematic).
- Cytosol: Fe²⁺ either → ferritin cage (stored; lost when enterocyte sheds, label "≈2-3 дни" lifespan)
  or → basolateral ferroportin → hephaestin oxidizes → Fe³⁺ loads apo-Tf → diferric Tf in capillary.
- Hepcidin binds FPN extracellular side, FPN tilts and endocytoses (anim. 1.2 s) — mapping in §2.
- Paths: `zFlow` along CatmullRom inside the cell volume; ensure points lie inside the cell box (clamp check in QA).

### 3.6 Splenic macrophage (S5)
- Red-pulp cord: macrophage (same generator as 3.3, no arms) + sinus wall slits (interendothelial slits ~1 µm,
  modelled as parallel stave cells `BoxGeometry` instanced 12). Old/spherocytic RBCs fail to pass the slit
  (stop, deform, get eaten) — hemolysis ↑ → more stuck spherocytes (extravascular hemolysis, correct for HS/AIHA).
- Inside macrophage: phagolysosome sphere darkens → heme oxygenase → Fe²⁺ particles → ferroportin (hepcidin-bound
  copies like S4) → Tf. Anemia of chronic disease: hepcidin high → Fe accumulates as ferritin in macrophage
  (ferritin count ↑ while Tf sat ↓) — the hallmark visual of ACD vs iron deficiency.

### 3.7 Overview (S0) with BodyParts3D
- Reuse existing: `m/bp_kidR.txt`, `bp_renA.txt`, `bp_renV.txt`, `bp_aorta.txt`, `bp_ivc.txt`, `bp_stomach.txt`, `bp_heart.txt`.
- New (convert with `design/tools/bp3d*.py`, decimate to ≤ 6k tris each, ≤ 60 KB each; verify IDs in `parts_list_e.txt`):
  spleen FMA7196, liver FMA7197 (hepcidin source), duodenum FMA7206, right femur FMA24474 (cut longitudinally with
  `clippingPlanes` to show red marrow in proximal femur; marrow fill = zMat red-pulp palette, fat = muted pink);
  optionally hip bone FMA16586 (main adult marrow site — pelvis/sternum/vertebrae more than femoral shaft; label it).
- Flux particles (`zFlow`, ≤ 30 each): EPO kidney→marrow (via IVC/heart/aorta, schematic route), Fe duodenum→portal→
  plasma Tf→marrow, retic marrow→circulation, old RBC→spleen, hepcidin liver→duodenum+spleen (pink). Routes drawn as
  CatmullRom inside the vessel meshes where available (centrelines via `gutpath.py`-style extraction for aorta/IVC);
  elsewhere label "схематичен път".
- Credit line: "бъбрек, слезка, черен дроб, дуоденум, бедрена кост: BodyParts3D (DBCLS, CC BY-SA 2.1 JP)".

## 4. Real molecular structures (MK.real, `pdbsurf.py`) — none relevant exist yet in `site/m/mol/`

Existing `site/m/mol/` has no hemoglobin, transferrin, TfR1, ferroportin, DMT1, ferritin or EPO/EPOR. Candidates
(verify on RCSB before running; membrane proteins with `AXIS`/`FLIP` so extracellular side is up):

| Protein | PDB | Use | Note |
|---|---|---|---|
| EPO–EPOR (2:1 ECD) | 1EER | S1/S2 receptor on erythroblast (CFU-E) | soluble ECD only; TM/JAK2 schematic |
| Ferroportin + hepcidin (human) | 6WBV | S4/S5 basolateral, bound state | apo: 6W4S; check IDs |
| DMT1 (human) | 8E60 (verify) | S4 apical | if no good human model: bacterial homolog EcoDMT 5M94 — label "хомолог" |
| Dcytb | 5ZLE | S4 apical | |
| Transferrin–TfR1 | 3S9L | S2 erythroblast endocytosis; Tf alone for plasma | |
| Ferritin H-chain 24-mer | 2FHA (verify assembly) | S4/S5 cytosol | build biological assembly |
| Hemoglobin (deoxy HbA) | 2DN2 | optional zoom inset in S3 ("Hb ≈ 270 млн/еритроцит") | |
| Hephaestin | none (homology only) | schematic blob | label simplified |

Budget: each mol file ≤ 40 KB (TGT ~3k tris), ≤ 8 files. Proteins shown at enlarged scale in S4/S5 — legend must say
"белтъците са уголемени ~×20 спрямо клетката". "Опростен" mode: `MK.vgChan`-like blobs/pills with same colours.

## 5. Camera stops & phone framing

```js
const STOP=[ // th,phi,r,target per stop; phone variants push r and lift target so chips/labels don't overlap
 {k:"ovw",  d:{r:30,th:-0.3,phi:1.35,t:[0,2,0]},   p:{r:38,t:[0,3.5,0]}},
 {k:"kid",  d:{r:11,th:0.5,phi:1.25,t:[40,0,0]},   p:{r:14,t:[40,-1,0]}},
 {k:"bm",   d:{r:13,th:0.2,phi:1.05,t:[80,0,0]},   p:{r:17,t:[80,-1.2,0]}},
 {k:"enuc", d:{r:5, th:0.9,phi:1.30,t:[86,0,2]},   p:{r:7, t:[86,-0.6,2]}},
 {k:"blood",d:{r:9, th:-0.6,phi:1.45,t:[120,0,0]}, p:{r:12,t:[120,-1,0]}},
 {k:"duo",  d:{r:10,th:0.3,phi:1.40,t:[160,0,0]},  p:{r:13,t:[160,-1,0]}},
 {k:"spl",  d:{r:10,th:-0.4,phi:1.30,t:[200,0,0]}, p:{r:13,t:[200,-1,0]}}];
```
- Height: `wrap3D("erW", ph?460:540)`. Chips in normal DOM below the canvas (not overlaid) → no covered buttons.
- Labels: ≤ 6 per stop on phone (`ph`), ≤ 9 desktop; anchors in a column at the left (desktop) / top (phone) with leader
  lines to targets (pattern from ad3D `anc`/`lgP`). Labels list is a pre-built array per stop; Vector3 updated in place.
- Each stop shows a scale bar (thin line + "10 µm" / "5 cm") — critical because scales jump 10⁴×.
- Auto-tour: 6 s per stop; pauses on user drag. Preset change → jump to the most diagnostic stop
  (bleeding→S0, iron def→S4, ACD→S5, pernicious→S2, CKD→S1, altitude→S1, hemolysis→S5/S3).

## 6. Performance budget (phone LOWGPU: pixel ratio ≤ 1.5)

| Item | Desktop | LOWGPU |
|---|---|---|
| Active-station triangles | ≤ 250k | ≤ 90k |
| Draw calls per frame | ≤ 60 | ≤ 35 |
| RBC instances (S3) | 260 | 120 |
| RBC geometry | 22×28 lathe ≈ 1.2k tris | 14×18 ≈ 500 tris |
| zFlow particles total | ≤ 160 | ≤ 80 |
| New organ meshes | 5 × ≤ 60 KB | same files; skip femur cut-plane when LOWGPU? (keep, just low noise) |
| New mol files | ≤ 8 × 40 KB (loaded lazily on first visit to S4/S5/S2) | "Опростен" default on LOWGPU |
| Shadows | none (use RoomEnvironment as make3D hq) | none |

- Hidden stations: `group.visible=false` and their update skipped; lazy-build station geometry on first visit.
- No per-frame `new`: reused Matrix4/Vector3/Quaternion/Color; label Vector3 mutated in place; LUT centrelines.
- Model step rate decoupled: model runs in days (from main view), the frame reads `get()`; only changed values
  trigger re-layout (counts, colours) — like `lastK` in ad3D.
- Dispose all geometries/materials/DataTextures in the mk3DView cleanup.

## 7. Staged mode (optional, for the lesson's "стъпка по стъпка")

`zCellStg` scene "Път на желязото" with stages (each really animated, per user rule):
1 Fe³⁺ in lumen → Dcytb reduction; 2 DMT1 import (H⁺ co-transport); 3 ferritin storage vs export;
4 FPN + hephaestin → Fe³⁺ → Tf; 5 hepcidin binds FPN → internalization (export stops); 6 Tf → TfR1 on erythroblast →
endosome → heme synthesis in mitochondrion. `upd(C,i,u,t,sg,R)` drives particle subsets per stage.

## 8. Accuracy labels to put in scene text / legend

- Anatomically accurate: organ meshes (BodyParts3D), RBC biconcave shape and size ratios (Evans–Fung),
  relative cell sizes of erythroblast stages, PDB protein shapes.
- Physiologically accurate (from model): EPO level, Hb/Hct, reticulocyte count and its lag, MCV, TSAT, ferritin,
  hepcidin effect direction, hemolysis rate. View only maps them; it never adds its own timing.
- Educational simplification: routes between organs (S0), number of cells, enucleation duration (real ≈ minutes,
  shown in ~3 s), protein scale ×20 in S4/S5, Poiseuille RBC speed profile (qualitative), single REPC count in CKD.
- Artistic: tissue textures/noise, background colours.
- Must say explicitly: "главните места на хемопоезата при възрастен са таз, гръдна кост, прешлени — бедрената кост
  е показана за нагледност"; "анимацията е ускорена: 1 s ≈ N дни" (display current model speed).

## 9. QA checklist (when implemented)
- Playwright sweep through all 7 stops × 8 presets (contact sheet), swiftshader + phone 390×844 DPR 3.
- Assert: RBC centre thickness/diameter ratio; particles inside vessels/cells (sample positions vs tube radius);
  hepcidin↑ → FPN flux 0; iron def → pallor ↑ and MCV scale <1; pernicious → macrocytes + megaloblasts; CKD → EPO
  low despite low Hb; altitude → EPO high, retic ↑ after lag; hemolysis → spherocytes/fragments, retic ↑.
- Colour lint: grep new file for hexes, reject hue 45–170° (yellow/green).
