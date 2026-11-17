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
import os
ROLL = float(os.environ.get("ROLL", "10"))
ROLLR = float(os.environ.get("ROLLR", "-10"))
POSE = {
    "upperleg01.L": ("dir", [0.05, -0.12, 1]), "upperleg01.R": ("dir", [-0.05, -0.12, 1]),
    "lowerleg01.L": ("dir", [0.05, -1, 0.12]), "lowerleg01.R": ("dir", [-0.05, -1, 0.12]),
    "foot.L": ("rot", X, -10), "foot.R": ("rot", X, -10),
    "spine05": ("rot", X, 7), "spine04": ("rot", X, 7), "spine03": ("rot", X, 6), "spine02": ("rot", X, 5), "spine01": ("rot", X, 4),
    "neck01": ("rot", X, 9), "neck02": ("rot", X, 9), "neck03": ("rot", X, 8), "head": ("rot", X, 14),
    "upperarm01.L": ("dir", [0.32, -0.62, 0.72]), "upperarm01.R": ("dir", [-0.32, -0.62, 0.72]),
    "lowerarm01.L": ("dir", [-0.48, 0.0, 0.88], ROLL), "lowerarm01.R": ("dir", [0.48, 0.0, 0.88], ROLLR),
    "wrist.L": ("dir", [-0.5, 0.02, 0.86]), "wrist.R": ("dir", [0.5, 0.02, 0.86]),
}
for s in "LR":
    for f in range(1, 6):
        for k in (1, 2, 3):
            POSE[f"finger{f}-{k}.{s}"] = ("rot", X, 5 if f > 1 else 3)

# глобални трансформации (родителите преди децата)
order, seen = [], set()
def visit(b):
    if b in seen: return
    p = bones[b]["parent"]
    if p: visit(p)
    seen.add(b); order.append(b)
for b in bones: visit(b)
def transforms(pose):
    GR, GT = {}, {}  # глобално завъртане и преместване: x' = GR x + GT
    for b in order:
        p = bones[b]["parent"]
        PR, PT = (GR[p], GT[p]) if p else (np.eye(3), np.zeros(3))
        Rl = np.eye(3)
        if b in pose:
            kind, a, *r = pose[b]
            if kind == "rot": Rl = rot(a, r[0])
            else:
                rd = TL[b] - H[b]; Rl = rot_to(rd, PR.T @ np.asarray(a, float))
                if r: Rl = Rl @ rot(rd, r[0])  # завъртане около собствената ос (пронация/супинация)
        # M_b = M_p · T(H) · R · T(-H)
        R = PR @ Rl; T = PR @ (H[b] - Rl @ H[b]) + PT
        GR[b], GT[b] = R, T
    return GR, GT
GR, GT = transforms(POSE)
wpos = lambda G, T_, b: G[b] @ H[b] + T_[b]

# втора поза: дясната ръка почесва главата (двузвенна инверсна кинематика)
S_ = wpos(GR, GT, "upperarm01.R"); Lu = np.linalg.norm(TL["upperarm02.R"] - H["upperarm01.R"]); Ll = np.linalg.norm(TL["lowerarm02.R"] - H["lowerarm01.R"])
HT = GR["head"] @ TL["head"] + GT["head"]; HJ = wpos(GR, GT, "head")
scratch = HJ + (HT - HJ) * 0.75 + np.array([-0.55, 0.35, -0.15])     # точка отстрани на темето
Tg = scratch + np.array([-0.55, 0.85, 0.25])                          # китката е над и встрани от главата
d = np.linalg.norm(Tg - S_); d = min(d, (Lu + Ll) * 0.98); u = (Tg - S_) / np.linalg.norm(Tg - S_); Tg = S_ + u * d
ca = (Lu * Lu + d * d - Ll * Ll) / (2 * Lu * d); sa = np.sqrt(max(0, 1 - ca * ca))
pole = np.array([-1.0, -0.2, -0.3]); pp = pole - u * np.dot(pole, u); pp /= np.linalg.norm(pp)
EL = S_ + Lu * (ca * u + sa * pp)
POSE2 = dict(POSE)
POSE2["upperarm01.R"] = ("dir", list(EL - S_)); POSE2["lowerarm01.R"] = ("dir", list(Tg - EL), 90)
POSE2["wrist.R"] = ("dir", list(scratch - Tg)); POSE2["clavicle.R"] = ("rot", [0, 0, 1], -12)
GR2, GT2 = transforms(POSE2)

# тегла и деформация (linear blend skinning)
GROUPS = ["root", "head", "clav", "up", "lo", "hand"]
def group(b):
    if b.endswith(".R"):
        if b.startswith(("clavicle", "shoulder01")): return 2
        if b.startswith("upperarm"): return 3
        if b.startswith("lowerarm"): return 4
        if b.startswith(("wrist", "metacarpal", "finger")): return 5
    if b.startswith(("neck", "head", "jaw", "eye", "levator", "oculi", "orbic", "oris", "risor", "tempor", "special", "tongue")): return 1
    return 0
n = len(V); acc = np.zeros((n, 3)); ws = np.zeros(n); dom = {}; best = np.zeros(n); GW = np.zeros((n, 6))
for b, lst in W.items():
    if b not in GR: continue
    idx = np.array([i for i, _ in lst]); w = np.array([x for _, x in lst])
    acc[idx] += w[:, None] * (V[idx] @ GR[b].T + GT[b]); ws[idx] += w; GW[idx, group(b)] += w
    m = w > best[idx]; best[idx[m]] = w[m]
    for i in idx[m]: dom[i] = b
P = np.where(ws[:, None] > 0, acc / np.maximum(ws, 1e-9)[:, None], V)

body = [f for f, g in zip(faces, grp) if g == "body"]
used = sorted(set(i for f in body for i in f)); remap = {o: k for k, o in enumerate(used)}
quads = np.array([[remap[i] for i in f] for f in body], np.int64)
tris = np.concatenate([quads[:, [0, 1, 2]], quads[:, [0, 2, 3]]]).astype(np.uint32); Pu = P[used]

# оцветяване по области
COAT, SKIN, HAIR, PANTS, SHOE = (236, 238, 241), (198, 140, 112), (38, 27, 19), (34, 38, 48), (18, 18, 20)
hv, hd = GR["head"] @ (TL["head"] - H["head"]), GR["head"] @ H["head"] + GT["head"]
up = hv / np.linalg.norm(hv); fwd = GR["head"] @ np.array([0, 0, 1.0])
eyes = (GR["eye.L"] @ H["eye.L"] + GT["eye.L"] + GR["eye.R"] @ H["eye.R"] + GT["eye.R"]) / 2
side = np.cross(up, fwd); side /= np.linalg.norm(side)
nb_ = wpos(GR, GT, "neck01"); nup = wpos(GR, GT, "head") - nb_; nup /= np.linalg.norm(nup)
col = np.zeros((len(used), 3), np.uint8); hair = np.zeros(len(used), bool)
for k, o in enumerate(used):
    b = dom.get(o, "spine03"); p = Pu[k]
    if b.startswith(("head", "jaw", "eye", "neck", "levator", "oculi", "orbic", "oris", "risor", "tempor", "special", "tongue")):
        rel = p - eyes; h_up = np.dot(rel, up); h_f = np.dot(rel, fwd)
        c = SKIN
        rn = p - nb_; aln = np.dot(rn, nup)
        if b.startswith("neck") and aln < 0.05: c = COAT   # под яката е престилката
        lat = abs(np.dot(rel, side))
        if h_up > 0.32 or (h_f < -0.62 and h_up > -0.45 and lat < 0.62) or (h_f < -0.2 and h_up > 0.05 and lat < 0.78):
            c = HAIR; hair[k] = True
    elif b.startswith(("wrist", "metacarpal", "finger")): c = SKIN
    elif b.startswith(("foot", "toe")): c = SHOE
    elif b.startswith(("lowerleg",)): c = PANTS
    elif b.startswith(("upperleg",)): c = COAT if (V[o][1] > -2.2) else PANTS
    else:
        c = COAT
        # кожата на шията над яката: по оста на шията, близо до нея
        rel = p - nb_; along = np.dot(rel, nup); lat = np.linalg.norm(rel - along * nup)
        if along > 0.05 and lat < 0.55: c = SKIN
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

def catmull_clark(Pv, Cv, Q):
    """едно ниво Catmull–Clark за четириъгълна мрежа (с краища)"""
    nv = len(Pv); nf = len(Q)
    fp = Pv[Q].mean(1); fc = Cv[Q].mean(1)
    e = np.stack([Q, np.roll(Q, -1, 1)], 2).reshape(-1, 2); es = np.sort(e, 1)
    uniq, inv, cnt = np.unique(es, axis=0, return_inverse=True, return_counts=True); inv = inv.reshape(-1)
    ne = len(uniq); fidx = np.repeat(np.arange(nf), 4)
    fsum = np.zeros((ne, 3)); np.add.at(fsum, inv, fp[fidx])
    mid = Pv[uniq].mean(1); border = cnt[: ne] < 2
    ep = np.where(border[:, None], mid, (Pv[uniq].sum(1) + fsum) / (2 + cnt[:, None]))
    ec = Cv[uniq].mean(1)
    # новите позиции на старите върхове
    val = np.zeros(nv); np.add.at(val, uniq[:, 0], 1); np.add.at(val, uniq[:, 1], 1)
    Rs = np.zeros((nv, 3)); np.add.at(Rs, uniq[:, 0], mid); np.add.at(Rs, uniq[:, 1], mid)
    Qs = np.zeros((nv, 3)); fv = np.zeros(nv); np.add.at(Qs, Q.reshape(-1), np.repeat(fp, 4, 0)); np.add.at(fv, Q.reshape(-1), 1)
    onb = np.zeros(nv, bool); onb[uniq[border].reshape(-1)] = True
    n = np.maximum(val, 1)[:, None]
    vp = (Qs / np.maximum(fv, 1)[:, None] + 2 * Rs / n + (n - 3) * Pv) / n
    vp[onb] = Pv[onb]; vp[val < 3] = Pv[val < 3]
    NP = np.concatenate([vp, ep, fp]); NC = np.concatenate([Cv, ec, fc])
    E = inv.reshape(nf, 4) + nv; Fc = np.arange(nf) + nv + ne
    nq = []
    for i in range(4):
        nq.append(np.stack([Q[:, i], E[:, i], Fc, E[:, (i - 1) % 4]], 1))
    return NP, NC, np.concatenate(nq)

GWu = GW[used] / np.maximum(GW[used].sum(1, keepdims=True), 1e-9); GWu[GW[used].sum(1) == 0, 0] = 1
both = np.concatenate([col.astype(float), GWu], 1)
Pu, both, quads = catmull_clark(Pu, both, quads)
col = np.clip(both[:, :3], 0, 255).astype(np.uint8); GWs = both[:, 3:]
tris = np.concatenate([quads[:, [0, 1, 2]], quads[:, [0, 2, 3]]]).astype(np.uint32)
Pu *= 0.1  # дециметри → метри
mn = Pu.min(0); sz = np.maximum(Pu.max(0) - mn, 1e-6)
q = np.round((Pu - mn) / sz * 65535).astype(np.uint16)
buf = struct.pack("<II", len(Pu), len(tris)) + struct.pack("<6f", *mn, *sz) + q.tobytes()
buf += b"\0" * ((4 - len(buf) % 4) % 4) + tris.tobytes() + col.tobytes()
# опростен скелет за анимацията: опора на всяка група, родител и завъртане към позата „почесване“
REP = {"root": "root", "head": "neck01", "clav": "clavicle.R", "up": "upperarm01.R", "lo": "lowerarm01.R", "hand": "wrist.R"}
PAR = [-1, 0, 0, 2, 3, 4]
def quat(M):
    w = np.sqrt(max(0, 1 + M[0, 0] + M[1, 1] + M[2, 2])) / 2; x = np.sqrt(max(0, 1 + M[0, 0] - M[1, 1] - M[2, 2])) / 2
    y = np.sqrt(max(0, 1 - M[0, 0] + M[1, 1] - M[2, 2])) / 2; z = np.sqrt(max(0, 1 - M[0, 0] - M[1, 1] + M[2, 2])) / 2
    x = np.copysign(x, M[2, 1] - M[1, 2]); y = np.copysign(y, M[0, 2] - M[2, 0]); z = np.copysign(z, M[1, 0] - M[0, 1]); return [x, y, z, w]
Dg = [GR2[REP[g]] @ GR[REP[g]].T for g in GROUPS]
buf += b"SKN1" + struct.pack("<B", len(GROUPS))
for i, g in enumerate(GROUPS):
    piv = wpos(GR, GT, REP[g]) * 0.1; loc = (Dg[PAR[i]].T @ Dg[i]) if PAR[i] >= 0 else Dg[i]
    buf += struct.pack("<b3f4f", PAR[i], *piv, *quat(loc))
order4 = np.argsort(-GWs, 1)[:, :4]; w4 = np.take_along_axis(GWs, order4, 1); w4 = w4 / np.maximum(w4.sum(1, keepdims=True), 1e-9)
buf += order4.astype(np.uint8).tobytes() + np.round(w4 * 255).astype(np.uint8).tobytes()
open(OUT, "w").write(base64.b64encode(buf).decode())
hip = GR["upperleg01.L"] @ H["upperleg01.L"] + GT["upperleg01.L"]
ht = GR["head"] @ TL["head"] + GT["head"]
wl = GR["wrist.L"] @ H["wrist.L"] + GT["wrist.L"]
n1 = GR["neck01"] @ H["neck01"] + GT["neck01"]; cl_ = GR["clavicle.L"] @ TL["clavicle.L"] + GT["clavicle.L"]
print("neck01(m)", np.round(n1*0.1,3), "shoulderL(m)", np.round(cl_*0.1,3))
print("headtop(m)", np.round(ht*0.1,3), "wristL(m)", np.round(wl*0.1,3))
print("verts", len(Pu), "tris", len(tris), "bytes", len(buf), "hip(m)", np.round(hip * 0.1, 3), "head(m)", np.round(hd * 0.1, 3), "min", np.round(mn, 3), "size", np.round(sz, 3))
