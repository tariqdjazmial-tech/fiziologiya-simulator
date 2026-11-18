"""Cα-следа и карбонилни кислороди на филтъра от KcsA (PDB 1BL8, обществено достояние/CC0 — RCSB PDB)
за 3D модела „K⁺ канал отблизо“. Оста на порите → +y, мащаб nm, кислородът на T75 → y = 0.98.
Употреба: python3 pdbtrace.py 1BL8.pdb > kcsa.json"""
import sys, json, numpy as np
A = {}
for l in open(sys.argv[1]):
    if l.startswith("ATOM"):
        ch, rn, an = l[21], int(l[22:26]), l[12:16].strip()
        A.setdefault(ch, {}).setdefault(rn, {})[an] = np.array([float(l[30:38]), float(l[38:46]), float(l[46:54])])
chs = sorted(A)
ca = lambda c, r: A[c][r]["CA"]
common = sorted(set.intersection(*[set(r for r in A[c] if "CA" in A[c][r]) for c in chs]))
top = np.mean([ca(c, 78) for c in chs], 0); bot = np.mean([ca(c, common[-1]) for c in chs], 0)
y = top - bot; y /= np.linalg.norm(y)
o75 = np.mean([A[c][75]["O"] for c in chs], 0)
x0 = ca(chs[0], 78) - o75; x0 -= y * np.dot(x0, y); x0 /= np.linalg.norm(x0); z0 = np.cross(x0, y)
def T(p): d = p - o75; return [round(float(np.dot(d, x0)) * .1, 3), round(float(np.dot(d, y)) * .1 + .98, 3), round(float(np.dot(d, z0)) * .1, 3)]
out = {"res": common, "chains": [[T(ca(c, r)) for r in common] for c in chs],
       "ox": [[T(A[c][r]["O"]) for r in (75, 76, 77, 78)] for c in chs]}
json.dump(out, sys.stdout, separators=(",", ":"))
