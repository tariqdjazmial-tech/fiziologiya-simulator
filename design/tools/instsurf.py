"""Малка молекулна повърхност за InstancedMesh (стотици копия в саркомера):
G-актин (PDB 1J6Z) и глава на миозина S1 (PDB 2MYS). RCSB PDB — обществено достояние.
Повърхността е центрирана, най-дългата ос е по z, а половината дължина е 1 (сцената мащабира).
Цветовете на върховете са сиви тонове (инстанцията задава оттенъка).

Употреба: python3 instsurf.py файл.pdb изход.txt триъгълници "вериги:от-до:тон (0–1) или цвят rrggbb" ... [--tip вериги:от-до]
  --tip: частта, която трябва да сочи към +z (при миозина — моторният домен към актина)
"""
import sys, struct, base64, numpy as np
from skimage import measure
import fast_simplification
from scipy.spatial import cKDTree

a = sys.argv[1:]; tip = None
if "--tip" in a: k = a.index("--tip"); tip = a[k + 1]; a = a[:k] + a[k + 2:]
pdb, out, tgt, specs = a[0], a[1], int(a[2]), a[3:]
at = []
for l in open(pdb):
    if l.startswith("ATOM"):
        at.append((l[21], int(l[22:26]), np.array([float(l[30:38]), float(l[38:46]), float(l[46:54])])))
def pick(sp):
    ch, rr = sp.split(":")[:2]
    lo, hi = map(int, rr.split("-")) if rr else (-9999, 99999)
    return [i for i, x in enumerate(at) if x[0] in ch and lo <= x[1] <= hi]
idx, tone = [], []
for sp in specs:
    ii = pick(sp); t = sp.split(":")[2]
    rgb = [int(t[k:k + 2], 16) / 255 for k in (0, 2, 4)] if len(t) == 6 and not t.replace(".", "").isdigit() else [float(t)] * 3
    idx += ii; tone += [rgb] * len(ii)
X = np.array([at[i][2] for i in idx]) * .1; tone = np.array(tone)
c = X.mean(0); X = X - c
ev = np.linalg.svd(X, full_matrices=False)[2]          # главни оси: ev[0] — най-дългата
B = np.array([ev[1], ev[2], ev[0]])
if np.linalg.det(B) < 0: B[0] = -B[0]
Y = X @ B.T
if tip:
    T = np.array([at[i][2] for i in pick(tip + ":1")]) * .1 - c
    if (T @ B.T)[:, 2].mean() < 0: Y[:, 2] *= -1; Y[:, 0] *= -1
lo = Y.min(0) - .5; hi = Y.max(0) + .5; g = .12
dims = np.ceil((hi - lo) / g).astype(int) + 1; grid = np.zeros(dims, np.float32)
sig = .2; R = int(np.ceil(3 * sig / g)); ax = np.arange(-R, R + 1) * g
kern = np.exp(-(ax[:, None, None] ** 2 + ax[None, :, None] ** 2 + ax[None, None, :] ** 2) / (2 * sig * sig))
for p in Y:
    i = np.round((p - lo) / g).astype(int)
    s = [slice(max(0, i[k] - R), min(dims[k], i[k] + R + 1)) for k in range(3)]
    ks = [slice(s[k].start - (i[k] - R), s[k].stop - (i[k] - R)) for k in range(3)]
    grid[s[0], s[1], s[2]] += kern[ks[0], ks[1], ks[2]]
v, f, _, _ = measure.marching_cubes(grid, .6); v = v * g + lo
if len(f) > tgt: v, f = fast_simplification.simplify(v.astype(np.float32), f.astype(np.int64), target_reduction=1 - tgt / len(f))
_, ia = cKDTree(Y).query(v); C = np.clip(tone[ia] * 255, 0, 255).astype(np.uint8)
half = (v[:, 2].max() - v[:, 2].min()) / 2; v[:, 2] -= (v[:, 2].max() + v[:, 2].min()) / 2; v /= half
mn = v.min(0); sz = np.maximum(v.max(0) - mn, 1e-6); q = np.round((v - mn) / sz * 65535).astype(np.uint16)
buf = struct.pack("<II", len(v), len(f)) + struct.pack("<6f", *mn, *sz) + q.tobytes()
buf += b"\0" * ((4 - len(buf) % 4) % 4) + np.asarray(f, np.uint32).tobytes() + C.tobytes()
open(out, "w").write(base64.b64encode(buf).decode())
print(out, "tris", len(f), "extent", np.round(v.max(0) - v.min(0), 2), "real length nm", round(2 * half, 1), "bytes", len(buf))
