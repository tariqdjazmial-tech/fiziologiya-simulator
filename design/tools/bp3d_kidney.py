"""Дясна надбъбречна жлеза, десен бъбрек и съседните съдове от BodyParts3D (DBCLS, CC BY-SA 2.1 Japan)
за темата „Надбъбречна кора“, в истинското им взаимно положение.
Части: дясна надбъбречна жлеза (FMA15629), десен бъбрек (FMA7204), дясна бъбречна артерия (FMA14752),
дясна бъбречна вена (FMA14335), десен уретер (FMA15571), долна куха вена (FMA10951).

Оси: BP3D (x — вляво на пациента, y — назад, z — нагоре, mm) → сцена (x, y — нагоре, z — напред), S единици/mm.
Изгледът е отпред: медиалната страна (хилусът, долната куха вена) е вдясно на екрана.
Началото на сцената е центърът на коронален разрез през средата на жлезата (равнината z = 0 в сцената).
Бъбрекът изпъква на ≈ 6 mm пред тази равнина в долния ръб на жлезата; бъбрекът, бъбречните съдове и уретерът
са изместени назад с KDZ mm, за да не закриват разреза (сцената го казва в „Опростено в модела“).
Записва m/bp_*.txt и отпечатва контура на разреза (ADR_SEC в site/js/mod-adrenal.js).

Източник: https://github.com/Kevin-Mattheus-Moerman/BodyParts3D (assets/BodyParts3D_data/stl/FMA*.stl)
Употреба: python3 bp3d_kidney.py <папка със STL> <изходна папка site/>"""
import sys, struct, base64, json, numpy as np, trimesh, fast_simplification
SRC, OUT = sys.argv[1], sys.argv[2]
S, KDZ = 0.14, 7.0
A = trimesh.load(f"{SRC}/FMA15629.stl")
C = A.bounds.mean(0)
sec = A.section(plane_origin=C, plane_normal=[0, 1, 0]).discrete[0]     # коронално сечение през центъра
O = np.array([sec[:, 0].mean(), C[1], sec[:, 2].mean()])                 # начало на сцената
def to_scene(p, dz=0.0):
    return np.c_[(p[:, 0] - O[0]) * S, (p[:, 2] - O[2]) * S, (-(p[:, 1] - O[1]) - dz) * S]
def write(name, v, f, tgt, dz=0.0):
    v, f = np.asarray(v, np.float32), np.asarray(f)
    if len(f) > tgt: v, f = fast_simplification.simplify(v, f, target_reduction=1 - tgt / len(f))
    P = to_scene(v, dz).astype(np.float32)
    mn = P.min(0); sz = np.maximum(P.max(0) - mn, 1e-6); q = np.round((P - mn) / sz * 65535).astype(np.uint16)
    buf = struct.pack("<II", len(P), len(f)) + struct.pack("<6f", *mn, *sz) + q.tobytes()
    buf += b"\0" * ((4 - len(buf) % 4) % 4) + np.asarray(f, np.uint32).tobytes()
    open(f"{OUT}/m/bp_{name}.txt", "w").write(base64.b64encode(buf).decode())
    print(name, "tris", len(f), "bytes", len(buf), "min", np.round(mn, 2), "max", np.round(mn + sz, 2))
write("adrR", A.vertices, A.faces, 5000)
for name, fid, tgt, dz in [("kidR", 7204, 7000, KDZ), ("renA", 14752, 1400, KDZ), ("renV", 14335, 1400, KDZ), ("ureR", 15571, 1200, KDZ), ("ivc", 10951, 2600, 0.0)]:
    m = trimesh.load(f"{SRC}/FMA{fid}.stl", process=True)
    write(name, m.vertices, m.faces, tgt, dz)
# контур на разреза (сцена, z = 0), опростен до ≈ 140 точки с равна стъпка
L = to_scene(sec)[:, :2]
seg = np.r_[0, np.cumsum(np.linalg.norm(np.diff(np.r_[L, L[:1]], axis=0), axis=1))]
t = np.linspace(0, seg[-1], 141)[:-1]
P = np.c_[np.interp(t, seg, np.r_[L[:, 0], L[0, 0]]), np.interp(t, seg, np.r_[L[:, 1], L[0, 1]])]
# долна куха вена: център на височината на разреза (за централната вена)
I = trimesh.load(f"{SRC}/FMA10951.stl").vertices
Iz = to_scene(I); sl = Iz[np.abs(Iz[:, 1]) < 0.4]
print("ADR_SEC=" + json.dumps(np.round(P, 3).tolist(), separators=(",", ":")))  # вмъква се в site/js/mod-adrenal.js
print("outline bbox", np.round(P.min(0), 2), np.round(P.max(0), 2), "ivc", np.round(sl.mean(0), 2), "r", np.round((sl.max(0) - sl.min(0)) / 2, 2))
