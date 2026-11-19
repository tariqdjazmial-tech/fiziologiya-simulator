"""Молекулна повърхност от PDB структура (RCSB PDB, обществено достояние) за 3D моделите.
Повърхността е гаусова (както в научните фигури), разделена на части по вериги и остатъци
(напр. N- и C-половина на GLUT1, домени A/N/P на Na⁺/K⁺-ATP-азата), подравнена спрямо мембраната
(хидрофобният пояс → y ∈ [-1.5, 1.5] nm, по-масивната страна извън пояса → надолу, цитоплазма).
Записва всяка част в компактния формат на въведенията/моделите (позиции, индекси, цветове на върхове).

Употреба: python3 pdbsurf.py файл.pdb изход_префикс "име:вериги:от-до,от-до:цвят" ...
  пример: python3 pdbsurf.py 4PYP.pdb m/glut1 "n:A:1-250:4dabf7" "c:A:251-500:748ffc"
"""
import sys, struct, base64, numpy as np
from skimage import measure
import fast_simplification

pdb, OUT, specs = sys.argv[1], sys.argv[2], sys.argv[3:]
import os
SIG = float(os.environ.get("SIG", .16)); ISO = float(os.environ.get("ISO", .55)); TGT = int(os.environ.get("TGT", 9000)); FLIP = os.environ.get("FLIP") == "1"
# SIG/ISO: за структури само с Cα (много големи, напр. RyR2) — по-широка гаусиана; FLIP=1 обръща посоката (когато извънклетъчната част е по-масивна)
HYD = set("ALA VAL LEU ILE PHE MET TRP".split())
atoms = []
for l in open(pdb):
    if l.startswith("ATOM"):
        atoms.append((l[21], int(l[22:26]), l[17:20], l[12:16].strip(), np.array([float(l[30:38]), float(l[38:46]), float(l[46:54])])))

def sel(chs, rngs):
    out = []
    for a in atoms:
        if a[0] not in chs: continue
        if rngs and not any(lo <= a[1] <= hi for lo, hi in rngs): continue
        out.append(a)
    return out
parts = []
for sp in specs:
    name, chs, rr, col = sp.split(":")
    rngs = [tuple(map(int, x.split("-"))) for x in rr.split(",")] if rr else []
    parts.append((name, set(chs), sel(set(chs), rngs), col))
allA = [a for p in parts for a in p[2]]
X = np.array([a[4] for a in allA]); ctr = X.mean(0)

# мембранна нормала: посоката с най-хидрофобен пояс от 30 Å
BELT = set(os.environ.get("BELT", ""))   # по желание: само тези вериги определят мембранния пояс (напр. трансмембранните субединици)
CA = [(a[4] - ctr, a[2] in HYD) for a in allA if a[3] == "CA" and (not BELT or a[0] in BELT)]
P = np.array([c[0] for c in CA]); H = np.array([c[1] for c in CA], float)
best = (-1e9, None, 0)
g = (1 + 5 ** .5) / 2
for i in range(1500):
    z = 1 - (i + .5) / 1500; r = (1 - z * z) ** .5; ph = 2 * np.pi * i / g
    n = np.array([r * np.cos(ph), z, r * np.sin(ph)])
    if n[1] < 0: continue
    d = P @ n
    for c in np.arange(d.min() + 15, d.max() - 15, 1.0):
        m = np.abs(d - c) < 15
        if m.sum() < 30: continue
        sc = (H[m].mean() - H[~m].mean() if (~m).any() else 0) * np.sqrt(m.sum())
        if sc > best[0]: best = (sc, n, c)
_, nrm, c0 = best
d = (X - ctr) @ nrm - c0
if ((d > 15).sum() > (d < -15).sum()) != FLIP: nrm, c0 = -nrm, -c0   # масивната страна → цитоплазма (−y)
ex = np.cross(nrm, [0, 0, 1.0]) if abs(nrm[2]) < .9 else np.cross(nrm, [1.0, 0, 0]); ex /= np.linalg.norm(ex); ez = np.cross(ex, nrm)
def tf(p):
    q = p - ctr; return np.c_[q @ ex, q @ nrm - c0, q @ ez] * .1   # Å → nm

for name, chs, A, col in parts:
    Y = tf(np.array([a[4] for a in A]))
    lo = Y.min(0) - .5; hi = Y.max(0) + .5; h = float(os.environ.get("H", .085))
    dims = np.ceil((hi - lo) / h).astype(int) + 1
    grid = np.zeros(dims, np.float32)
    sig = SIG; R = int(np.ceil(3 * sig / h))
    ax = np.arange(-R, R + 1) * h
    kern = np.exp(-(ax[:, None, None] ** 2 + ax[None, :, None] ** 2 + ax[None, None, :] ** 2) / (2 * sig * sig))
    for p in Y:
        i = np.round((p - lo) / h).astype(int)
        s = [slice(max(0, i[k] - R), min(dims[k], i[k] + R + 1)) for k in range(3)]
        ks = [slice(s[k].start - (i[k] - R), s[k].stop - (i[k] - R)) for k in range(3)]
        grid[s[0], s[1], s[2]] += kern[ks[0], ks[1], ks[2]]
    v, f, _, _ = measure.marching_cubes(grid, ISO)
    v = v * h + lo
    tgt = TGT
    if len(f) > tgt: v, f = fast_simplification.simplify(v.astype(np.float32), f.astype(np.int64), target_reduction=1 - tgt / len(f))
    base = np.array([int(col[i:i + 2], 16) for i in (0, 2, 4)], float)
    # лек шум в цвета по остатъци: съседните атоми задават тона
    from scipy.spatial import cKDTree
    t = cKDTree(Y); _, ia = t.query(v)
    hyd = np.array([A[k][2] in HYD for k in ia]); chg = np.array([A[k][2] in ("LYS", "ARG", "ASP", "GLU") for k in ia])
    C = np.tile(base, (len(v), 1)); C[hyd] *= .9; C[chg] *= 1.1
    C = np.clip(C, 0, 255).astype(np.uint8)
    mn = v.min(0); sz = np.maximum(v.max(0) - mn, 1e-6); q = np.round((v - mn) / sz * 65535).astype(np.uint16)
    buf = struct.pack("<II", len(v), len(f)) + struct.pack("<6f", *mn, *sz) + q.tobytes()
    buf += b"\0" * ((4 - len(buf) % 4) % 4) + np.asarray(f, np.uint32).tobytes() + C.tobytes()
    open(f"{OUT}_{name}.txt", "w").write(base64.b64encode(buf).decode())
    print(name, "tris", len(f), "bounds", np.round(v.min(0), 2), np.round(v.max(0), 2), "bytes", len(buf))
