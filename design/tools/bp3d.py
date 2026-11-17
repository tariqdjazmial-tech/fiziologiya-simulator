"""Органи от BodyParts3D (DBCLS, CC BY-SA 2.1 Japan) за въведението „Дихателна система“.
Опростява STL файловете, обръща осите (BP3D: x — вляво, y — назад, z — нагоре, mm) към сцената
(x, y — нагоре, z — напред, m) и ги вписва в гръдния кош на пациента (m/patient.txt).
Записва по един файл на група в компактния формат на въведенията (m/bp_*.txt).

Употреба: python3 bp3d.py <папка със STL> <изходна папка m/>
"""
import sys, struct, base64, glob, os
import numpy as np, trimesh, fast_simplification

SRC, OUT = sys.argv[1], sys.argv[2]
# групи: име → (FMA номера, брой триъгълници за всяка част)
G = {
    "lungs":  ([7333, 7337, 7383, 7370, 7371], 7000),
    "airway": ([7394], 2500),
    "bronch": ([7409], 26000),
    "heart":  ([7274], 22000),
    "aorta":  ([3736, 3768, 3784], 3000),
    "partery": ([66326], 16000),
    "pvein":  ([66643], 12000),
    "diaph":  ([13295], 7000),
    "bone":   ([7487, 7486, 7857, 7987, 7882, 8012, 7909, 8039, 7957, 8148, 8066, 8093, 8175, 8202, 8229, 8256, 8283, 8310, 8364, 8391, 8445, 8472], 1800),
    "cart":   ([7875, 8005, 7886, 8031, 7913, 8058, 7976, 8167, 8070, 8112, 8194, 8221, 8248, 8275], 700),
}
S = 0.00092                      # mm → m (гръдният кош се вписва в торса на модела)
TOP_Z, MID_Y = 1388.0, -106.0    # горен ръб на първите ребра; среден фронтален план
def to_scene(p):  # (x, y, z)_BP3D → (X, Y, Z)_сцена (в координатите на модела на пациента)
    return np.c_[p[:, 0] * S, (p[:, 2] - TOP_Z) * S + 0.628, -(p[:, 1] - MID_Y) * S + 0.008]

def write(name, P, F):
    mn = P.min(0); sz = np.maximum(P.max(0) - mn, 1e-6)
    q = np.round((P - mn) / sz * 65535).astype(np.uint16)
    buf = struct.pack("<II", len(P), len(F)) + struct.pack("<6f", *mn, *sz) + q.tobytes()
    buf += b"\0" * ((4 - len(buf) % 4) % 4) + F.astype(np.uint32).tobytes()
    open(f"{OUT}/bp_{name}.txt", "w").write(base64.b64encode(buf).decode())
    return len(buf)

tot = 0
for name, (ids, tgt) in G.items():
    Ps, Fs, off = [], [], 0
    for i in ids:
        m = trimesh.load(f"{SRC}/FMA{i}.stl", process=True)
        v, f = np.asarray(m.vertices, np.float32), np.asarray(m.faces)
        red = max(0.0, 1 - tgt / len(f))
        if red > 0: v, f = fast_simplification.simplify(v, f, target_reduction=red)
        Ps.append(to_scene(v)); Fs.append(f + off); off += len(v)
    P = np.concatenate(Ps); F = np.concatenate(Fs)
    n = write(name, P, F); tot += n
    print(f"{name:8s} tris {len(F):6d} bytes {n:8d} bounds {np.round(P.min(0),3)} {np.round(P.max(0),3)}")
print("total bytes", tot)
