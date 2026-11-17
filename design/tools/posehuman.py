"""Поставя базовия човек на MakeHuman (CC0) в седнала поза, наведен над бюро,
оцветява го по области (бяла престилка, кожа, коса, панталон, обувки) и го записва
в компактния формат на въведенията (m/*.txt, base64).

Входни файлове (CC0, makehumancommunity/makehuman): base.obj, default.mhskel, default_weights.mhw
Употреба: python3 posehuman.py <папка с файловете> <изход.txt>
"""
import sys, json, struct, base64
import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
sk = json.load(open(f"{SRC}/default.mhskel"))
W = json.load(open(f"{SRC}/default_weights.mhw"))["weights"]
V, faces, grp, G = [], [], [], None
for l in open(f"{SRC}/base.obj"):
    if l.startswith("v "): V.append([float(x) for x in l.split()[1:4]])
    elif l.startswith("g "): G = l.split()[1]
    elif l.startswith("f "): faces.append([int(x.split("/")[0]) - 1 for x in l.split()[1:]]); grp.append(G)
V = np.array(V)
J = lambda n: V[sk["joints"][n]].mean(0)
bones = sk["bones"]
H = {b: J(bones[b]["head"]) for b in bones}
TL = {b: J(bones[b]["tail"]) for b in bones}

def rot(axis, deg):
    a = np.asarray(axis, float); a /= np.linalg.norm(a); t = np.radians(deg)
    K = np.array([[0, -a[2], a[1]], [a[2], 0, -a[0]], [-a[1], a[0], 0]])
    return np.eye(3) + np.sin(t) * K + (1 - np.cos(t)) * K @ K

def rot_to(u, v):
    u = u / np.linalg.norm(u); v = v / np.linalg.norm(v); c = np.cross(u, v); s = np.linalg.norm(c); d = np.dot(u, v)
    if s < 1e-8: return np.eye(3)
    return rot(c / s, np.degrees(np.arctan2(s, d)))

# поза: ("rot", ос, градуси) — завъртане в покойната рамка; ("dir", посока) — посока на костта в света
X = [1, 0, 0]
POSE = {
    "upperleg01.L": ("dir", [0.05, -0.12, 1]), "upperleg01.R": ("dir", [-0.05, -0.12, 1]),
    "lowerleg01.L": ("dir", [0.05, -1, 0.12]), "lowerleg01.R": ("dir", [-0.05, -1, 0.12]),
    "foot.L": ("rot", X, -10), "foot.R": ("rot", X, -10),
    "spine05": ("rot", X, 7), "spine04": ("rot", X, 7), "spine03": ("rot", X, 6), "spine02": ("rot", X, 5), "spine01": ("rot", X, 4),
    "neck01": ("rot", X, 9), "neck02": ("rot", X, 9), "neck03": ("rot", X, 8), "head": ("rot", X, 14),
    "upperarm01.L": ("dir", [0.32, -0.62, 0.72]), "upperarm01.R": ("dir", [-0.32, -0.62, 0.72]),
    "lowerarm01.L": ("dir", [-0.48, 0.06, 0.88]), "lowerarm01.R": ("dir", [0.48, 0.06, 0.88]),
    "wrist.L": ("dir", [-0.55, -0.15, 0.82]), "wrist.R": ("dir", [0.55, -0.15, 0.82]),
}
for s in "LR":
    for f in range(1, 6):
        for k in (1, 2, 3):
            POSE[f"finger{f}-{k}.{s}"] = ("rot", X, 14 if f > 1 else 6)

# глобални трансформации (родителите преди децата)
order, seen = [], set()
def visit(b):
    if b in seen: return
    p = bones[b]["parent"]
    if p: visit(p)
    seen.add(b); order.append(b)
for b in bones: visit(b)
GR, GT = {}, {}  # глобално завъртане и преместване: x' = GR x + GT
for b in order:
    p = bones[b]["parent"]
    PR, PT = (GR[p], GT[p]) if p else (np.eye(3), np.zeros(3))
    Rl = np.eye(3)
    if b in POSE:
        kind, a, *r = POSE[b]
        if kind == "rot": Rl = rot(a, r[0])
        else: Rl = rot_to(TL[b] - H[b], PR.T @ np.asarray(a, float))
    # M_b = M_p · T(H) · R · T(-H)
    R = PR @ Rl; T = PR @ (H[b] - Rl @ H[b]) + PT
    GR[b], GT[b] = R, T

# тегла и деформация (linear blend skinning)
n = len(V); acc = np.zeros((n, 3)); ws = np.zeros(n); dom = {}; best = np.zeros(n)
for b, lst in W.items():
    if b not in GR: continue
    idx = np.array([i for i, _ in lst]); w = np.array([x for _, x in lst])
    acc[idx] += w[:, None] * (V[idx] @ GR[b].T + GT[b]); ws[idx] += w
    m = w > best[idx]; best[idx[m]] = w[m]
    for i in idx[m]: dom[i] = b
P = np.where(ws[:, None] > 0, acc / np.maximum(ws, 1e-9)[:, None], V)

body = [f for f, g in zip(faces, grp) if g == "body"]
used = sorted(set(i for f in body for i in f)); remap = {o: k for k, o in enumerate(used)}
tris = []
for f in body:
    a, b, c, d = [remap[i] for i in f]; tris += [(a, b, c), (a, c, d)]
tris = np.array(tris, np.uint32); Pu = P[used]

# оцветяване по области
COAT, SKIN, HAIR, PANTS, SHOE = (236, 238, 241), (198, 140, 112), (38, 27, 19), (34, 38, 48), (18, 18, 20)
hv, hd = GR["head"] @ (TL["head"] - H["head"]), GR["head"] @ H["head"] + GT["head"]
up = hv / np.linalg.norm(hv); fwd = GR["head"] @ np.array([0, 0, 1.0])
eyes = (GR["eye.L"] @ H["eye.L"] + GT["eye.L"] + GR["eye.R"] @ H["eye.R"] + GT["eye.R"]) / 2
side = np.cross(up, fwd); side /= np.linalg.norm(side)
col = np.zeros((len(used), 3), np.uint8); hair = np.zeros(len(used), bool)
for k, o in enumerate(used):
    b = dom.get(o, "spine03"); p = Pu[k]
    if b.startswith(("head", "jaw", "eye", "neck", "levator", "oculi", "orbic", "oris", "risor", "tempor", "special", "tongue")):
        rel = p - eyes; h_up = np.dot(rel, up); h_f = np.dot(rel, fwd)
        if b.startswith("neck") and h_up < -0.9: c = COAT if np.dot(p - hd, fwd) < 0.2 else SKIN
        else: c = SKIN
        lat = abs(np.dot(rel, side))
        if h_up > 0.32 or (h_f < -0.62 and h_up > -0.45 and lat < 0.62) or (h_f < -0.2 and h_up > 0.05 and lat < 0.78):
            c = HAIR; hair[k] = True
    elif b.startswith(("wrist", "metacarpal", "finger")): c = SKIN
    elif b.startswith(("foot", "toe")): c = SHOE
    elif b.startswith(("lowerleg",)): c = PANTS
    elif b.startswith(("upperleg",)): c = COAT if (V[o][1] > -2.2) else PANTS
    else: c = COAT
    col[k] = c
# фина вариация на цвета (кичури коса, тъкан)
rng = np.random.default_rng(7)
var = rng.normal(0, 1, len(used))
colf = col.astype(float)
colf[hair] *= (1 + 0.22 * var[hair])[:, None]
colf[~hair] *= (1 + 0.025 * var[~hair])[:, None]
col = np.clip(colf, 0, 255).astype(np.uint8)

# обем на косата: избутваме върховете навън по нормалата
N = np.zeros_like(Pu)
for t in tris:
    a, b, c = Pu[t[0]], Pu[t[1]], Pu[t[2]]; nrm = np.cross(b - a, c - a); N[t] += nrm
N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
Pu[hair] += N[hair] * (0.07 + 0.03 * rng.random(int(hair.sum())))[:, None]

Pu *= 0.1  # дециметри → метри
mn = Pu.min(0); sz = np.maximum(Pu.max(0) - mn, 1e-6)
q = np.round((Pu - mn) / sz * 65535).astype(np.uint16)
buf = struct.pack("<II", len(Pu), len(tris)) + struct.pack("<6f", *mn, *sz) + q.tobytes()
buf += b"\0" * ((4 - len(buf) % 4) % 4) + tris.tobytes() + col.tobytes()
open(OUT, "w").write(base64.b64encode(buf).decode())
hip = GR["upperleg01.L"] @ H["upperleg01.L"] + GT["upperleg01.L"]
ht = GR["head"] @ TL["head"] + GT["head"]
wl = GR["wrist.L"] @ H["wrist.L"] + GT["wrist.L"]
print("headtop(m)", np.round(ht*0.1,3), "wristL(m)", np.round(wl*0.1,3))
print("verts", len(Pu), "tris", len(tris), "bytes", len(buf), "hip(m)", np.round(hip * 0.1, 3), "head(m)", np.round(hd * 0.1, 3), "min", np.round(mn, 3), "size", np.round(sz, 3))
