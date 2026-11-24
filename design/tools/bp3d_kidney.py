"""Десен бъбрек и съседните съдове от BodyParts3D (DBCLS, CC BY-SA 2.1 Japan) за темата „Надбъбречна кора“.
Части: десен бъбрек (FMA7204), дясна бъбречна артерия (FMA14752), дясна бъбречна вена (FMA14335),
десен уретер (FMA15571), долна куха вена (FMA10951). Истинската дясна надбъбречна жлеза (FMA15629) служи само
за опорна точка: центърът ѝ съвпада с центъра на схематичния разрез в сцената.

Оси: BP3D (x — вляво на пациента, y — назад, z — нагоре, mm) → сцена (x, y — нагоре, z — напред), мащаб S единици/mm.
Изгледът е отпред, затова медиалната страна (хилусът, долната куха вена) е вдясно на екрана.
Всичко се измества назад (DZ), така че предната повърхност на бъбрека да е зад равнината на разреза (z = 0);
долната куха вена остава пред нея и в сцената е полупрозрачна.

Източник: https://github.com/Kevin-Mattheus-Moerman/BodyParts3D (assets/BodyParts3D_data/stl/FMA*.stl)
Употреба: python3 bp3d_kidney.py <папка със STL> <изходна папка m/>"""
import sys, struct, base64, numpy as np, trimesh, fast_simplification
SRC, OUT = sys.argv[1], sys.argv[2]
S = 0.09                                   # единици на сцената за 1 mm
ad = trimesh.load(f"{SRC}/FMA15629.stl")
C = ad.bounds.mean(0)                      # център на истинската надбъбречна жлеза
K = trimesh.load(f"{SRC}/FMA7204.stl")
DZ = (-K.bounds[0][1]) - (-C[1]) + 0.3 / S # предната повърхност на бъбрека → z = −0,3
def to_scene(p):
    return np.c_[(p[:, 0] - C[0]) * S + 0.2, (p[:, 2] - C[2]) * S + 0.6, (-(p[:, 1] - C[1]) - DZ) * S]
for name, fid, tgt in [("kidR", 7204, 7000), ("renA", 14752, 1400), ("renV", 14335, 1400), ("ureR", 15571, 1200), ("ivc", 10951, 2600)]:
    m = trimesh.load(f"{SRC}/FMA{fid}.stl", process=True)
    v, f = np.asarray(m.vertices, np.float32), np.asarray(m.faces)
    if len(f) > tgt: v, f = fast_simplification.simplify(v, f, target_reduction=1 - tgt / len(f))
    P = to_scene(v).astype(np.float32)
    mn = P.min(0); sz = np.maximum(P.max(0) - mn, 1e-6); q = np.round((P - mn) / sz * 65535).astype(np.uint16)
    buf = struct.pack("<II", len(P), len(f)) + struct.pack("<6f", *mn, *sz) + q.tobytes()
    buf += b"\0" * ((4 - len(buf) % 4) % 4) + np.asarray(f, np.uint32).tobytes()
    open(f"{OUT}/bp_{name}.txt", "w").write(base64.b64encode(buf).decode())
    print(name, "tris", len(f), "bytes", len(buf), "min", np.round(mn, 2), "max", np.round(mn + sz, 2))
