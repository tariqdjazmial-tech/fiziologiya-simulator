"""Стомах (FMA7148) и хранопровод (FMA7131) от BodyParts3D (DBCLS, CC BY-SA 2.1 Japan) за 3D моделите на храносмилането.
Записва ги в анатомичната ориентация на сцените (x — вляво на пациента, y — нагоре, z — напред, m); в сцената
те се вписват по процедурните органи и „облякат“ тяхната средна линия, за да остане перисталтиката.
Употреба: python3 bp3d_gi.py <папка със STL> <изходна папка m/>"""
import sys, struct, base64, numpy as np, trimesh, fast_simplification
SRC, OUT = sys.argv[1], sys.argv[2]
for name, fid, tgt in [("stomach", 7148, 9000), ("eso", 7131, 3000)]:
    m = trimesh.load(f"{SRC}/FMA{fid}.stl", process=True)
    v, f = np.asarray(m.vertices, np.float32), np.asarray(m.faces)
    if len(f) > tgt: v, f = fast_simplification.simplify(v, f, target_reduction=1 - tgt / len(f))
    P = np.c_[v[:, 0], v[:, 2], -v[:, 1]] * 0.001
    mn = P.min(0); sz = np.maximum(P.max(0) - mn, 1e-6); q = np.round((P - mn) / sz * 65535).astype(np.uint16)
    buf = struct.pack("<II", len(P), len(f)) + struct.pack("<6f", *mn, *sz) + q.tobytes()
    buf += b"\0" * ((4 - len(buf) % 4) % 4) + np.asarray(f, np.uint32).tobytes()
    open(f"{OUT}/bp_{name}.txt", "w").write(base64.b64encode(buf).decode())
    print(name, "tris", len(f), "size m", np.round(sz, 3))
