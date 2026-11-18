"""Един коннексин (Cx26, PDB 2ZW3, Maeda et al. 2009; RCSB PDB — обществено достояние) за 3D модела
на електричния синапс. Веригата A се поставя в координатите на „шарнира“ в сцената:
y — оста на канала (нагоре = към междуклетъчната цепка), 0 = средата на мембраната,
x — от оста към центъра на веригата. Сцената завърта копия на веригата през 60° (коннексон),
а втория коннексон — с 2-кратна ос, както в кристала.

Употреба: python3 gjsurf.py 2ZW3.pdb изход.txt [мащаб, единици/Å = 0.075]
"""
import sys, struct, base64, numpy as np
from skimage import measure
import fast_simplification
from scipy.spatial import cKDTree

pdb, out = sys.argv[1], sys.argv[2]; S = float(sys.argv[3]) if len(sys.argv) > 3 else 0.075
HYD = set("ALA VAL LEU ILE PHE MET TRP".split())
at = []
for l in open(pdb):
    if l.startswith("ATOM"):
        at.append((l[21], int(l[22:26]), l[17:20], l[12:16].strip(), np.array([float(l[30:38]), float(l[38:46]), float(l[46:54])])))
chs = sorted(set(a[0] for a in at))
M = np.array([np.mean([a[4] for a in at if a[0] == c], 0) for c in chs]); m0 = M.mean(0)
ax = np.linalg.svd(M - m0)[2][2]
t0 = (-m0) @ ax                      # 2-кратната ос (y в кристала) минава през центъра на връзката
if t0 < 0: ax, t0 = -ax, -t0
J = m0 + ax * t0
A = [a for a in at if a[0] == "A"]
X = np.array([a[4] for a in A]) - J
h = X @ ax
ca = [(a[2], (a[4] - J) @ ax) for a in A if a[3] == "CA"]
hz = np.array([z for r, z in ca if r in HYD and -68 < z < -22])
mc = hz.mean()                       # средата на мембраната по оста
rad = X - np.outer(h, ax); ex = rad.mean(0); ex /= np.linalg.norm(ex); ez = np.cross(ex, ax)
Y = np.c_[X @ ex, h - mc, X @ ez] * 0.1           # nm
print("membrane centre", round(mc, 1), "Å; centroid radius", round(np.linalg.norm(rad.mean(0)) * S, 3))
lo = Y.min(0) - .5; hi = Y.max(0) + .5; g = .085
dims = np.ceil((hi - lo) / g).astype(int) + 1; grid = np.zeros(dims, np.float32)
sig = .16; R = int(np.ceil(3 * sig / g)); axr = np.arange(-R, R + 1) * g
kern = np.exp(-(axr[:, None, None] ** 2 + axr[None, :, None] ** 2 + axr[None, None, :] ** 2) / (2 * sig * sig))
for p in Y:
    i = np.round((p - lo) / g).astype(int)
    s = [slice(max(0, i[k] - R), min(dims[k], i[k] + R + 1)) for k in range(3)]
    ks = [slice(s[k].start - (i[k] - R), s[k].stop - (i[k] - R)) for k in range(3)]
    grid[s[0], s[1], s[2]] += kern[ks[0], ks[1], ks[2]]
v, f, _, _ = measure.marching_cubes(grid, .55); v = v * g + lo
tgt = 6000
if len(f) > tgt: v, f = fast_simplification.simplify(v.astype(np.float32), f.astype(np.int64), target_reduction=1 - tgt / len(f))
_, ia = cKDTree(Y).query(v)
hyd = np.array([A[k][2] in HYD for k in ia]); chg = np.array([A[k][2] in ("LYS", "ARG", "ASP", "GLU") for k in ia])
C = np.full((len(v), 3), 238.0); C[hyd] *= .86; C[chg] *= 1.07
C = np.clip(C, 0, 255).astype(np.uint8)
v = v * 10 * S                                   # nm → единици на сцената
mn = v.min(0); sz = np.maximum(v.max(0) - mn, 1e-6); q = np.round((v - mn) / sz * 65535).astype(np.uint16)
buf = struct.pack("<II", len(v), len(f)) + struct.pack("<6f", *mn, *sz) + q.tobytes()
buf += b"\0" * ((4 - len(buf) % 4) % 4) + np.asarray(f, np.uint32).tobytes() + C.tobytes()
open(out, "w").write(base64.b64encode(buf).decode())
r = np.hypot(v[:, 0], v[:, 2])
print("tris", len(f), "y", v[:, 1].min().round(2), v[:, 1].max().round(2), "r max", r.max().round(2),
      "r at membrane", r[np.abs(v[:, 1]) < 1.2].max().round(2), "bytes", len(buf))
