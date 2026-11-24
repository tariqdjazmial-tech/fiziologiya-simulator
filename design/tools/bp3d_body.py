"""Органи за общия изглед на темата „Еритропоеза, желязо и анемии“ от BodyParts3D (DBCLS, CC BY-SA 2.1 Japan).
Бъбреци (FMA7204/7205), черен дроб (FMA7197), слезка (FMA7196), дуоденум (FMA7206), стомах (FMA7148), сърце (FMA7274),
аорта (FMA3736/3768/3784), долна куха вена (FMA10951), дясна бедрена кост (FMA24474), дясна тазова кост (FMA16586).
Оси: BP3D (x — вляво на пациента, y — назад, z — нагоре, mm) → сцена (x, y — нагоре, z — напред), S единици/mm,
начало в средата на корема (x = 0, z = Z0). Изгледът е отпред: дясната страна на пациента е вляво на екрана.
Записва m/bd_*.txt. Източник: https://github.com/Kevin-Mattheus-Moerman/BodyParts3D
Употреба: python3 bp3d_body.py <папка със STL> <изходна папка m/>"""
import sys, struct, base64, numpy as np, trimesh, fast_simplification
SRC, OUT = sys.argv[1], sys.argv[2]
S, Z0, Y0 = 0.02, 1100.0, -60.0
def to_scene(p): return np.c_[p[:, 0] * S, (p[:, 2] - Z0) * S, -(p[:, 1] - Y0) * S]
G = {"kidR": ([7204], 2500), "kidL": ([7205], 2500), "liver": ([7197], 5000), "spleen": ([7196], 2000), "duo": ([7206], 2500),
     "stom": ([7148], 3000), "heart": ([7274], 4000), "aorta": ([3736, 3768, 3784], 2500), "ivc": ([10951], 1500),
     "femR": ([24474], 3000), "hipR": ([16586], 4000)}
for name, (ids, tgt) in G.items():
    Ps, Fs, off = [], [], 0
    for i in ids:
        m = trimesh.load(f"{SRC}/FMA{i}.stl", process=True)
        v, f = np.asarray(m.vertices, np.float32), np.asarray(m.faces)
        t = max(300, tgt // len(ids))
        if len(f) > t: v, f = fast_simplification.simplify(v, f, target_reduction=1 - t / len(f))
        Ps.append(to_scene(v)); Fs.append(f + off); off += len(v)
    P = np.concatenate(Ps).astype(np.float32); F = np.concatenate(Fs)
    mn = P.min(0); sz = np.maximum(P.max(0) - mn, 1e-6); q = np.round((P - mn) / sz * 65535).astype(np.uint16)
    buf = struct.pack("<II", len(P), len(F)) + struct.pack("<6f", *mn, *sz) + q.tobytes()
    buf += b"\0" * ((4 - len(buf) % 4) % 4) + F.astype(np.uint32).tobytes()
    open(f"{OUT}/bd_{name}.txt", "w").write(base64.b64encode(buf).decode())
    print(f"{name:6s} tris {len(F):5d} bytes {len(buf):6d} min {np.round(mn,2)} max {np.round(mn+sz,2)}")
