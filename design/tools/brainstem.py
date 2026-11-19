"""Гладък анатомичен мозъчен ствол за барорефлекса и дихателния център.

Заменя групите "medulla" и "pons" в site/m/arcbin.txt (HRA моделът е груб: мостът на плоскости,
продълговатият мозък почти като кутия). Повърхността е неявна функция (SDF) от анатомични части,
вписани в обема на оригинала (същата ос, ширина и дълбочина), затова ядрата и нервите остават на място:
  продълговат мозък — пирамиди с предна срединна цепка, оливи, клиновидни/нежни туберкули, преход към
  гръбначния мозък; мост — вентрална издутина с базиларна бразда, средни малкомозъчни дръжки; среден мозък — мозъчни крачета, междукрачна ямка, четирихълмие.
Мрежата се получава с marching cubes, изглажда се (Taubin) и се разделя на две групи по
моcто-булбарната бразда.

  python3 design/tools/brainstem.py site/m/arcbin.txt [voxel_m]
"""
import sys, base64, struct, json
import numpy as np
from skimage.measure import marching_cubes


def load(path):
    d = base64.b64decode(open(path).read().strip())
    hl = struct.unpack('<I', d[:4])[0]
    H = json.loads(d[4:4 + hl])
    base = 4 + hl + ((4 - ((4 + hl) % 4)) % 4)
    out = []
    for g in H['groups']:
        q = np.frombuffer(d, dtype='<i2', count=g['n'] * 3, offset=base + g['po']).reshape(-1, 3).astype(float)
        mn, mx = np.array(g['mn']), np.array(g['mx'])
        P = mn + (q + 32767) / 65534 * (mx - mn)
        I = np.frombuffer(d, dtype='<u4' if g['big'] else '<u2', count=g['ni'], offset=base + g['io']).reshape(-1, 3)
        out.append((g['g'], P, I.copy()))
    return out


def save(path, groups):
    hdr, blobs, off = [], [], 0
    pad = lambda b: b + b'\0' * ((4 - len(b) % 4) % 4)
    for name, P, I in groups:
        mn, mx = P.min(0), P.max(0)
        q = np.round((P - mn) / np.where(mx - mn > 0, mx - mn, 1) * 65534 - 32767).astype('<i2').tobytes()
        big = bool(len(P) > 65535)
        ib = np.asarray(I).astype('<u4' if big else '<u2').tobytes()
        q, ib = pad(q), pad(ib)
        hdr.append({"g": name, "n": int(len(P)), "ni": int(np.asarray(I).size), "big": big,
                    "mn": mn.tolist(), "mx": mx.tolist(), "po": off, "io": off + len(q)})
        off += len(q) + len(ib)
        blobs += [q, ib]
    hj = json.dumps({"groups": hdr}).encode()
    head = struct.pack('<I', len(hj)) + hj
    head += b'\0' * ((4 - len(head) % 4) % 4)
    open(path, 'w').write(base64.b64encode(head + b''.join(blobs)).decode())


# ---------- примитиви (x — латерално, y — нагоре, z — напред/вентрално; метри) ----------
def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


def smax(a, b, k):
    return -smin(-a, -b, k)


def ellipsoid(X, Y, Z, c, r):
    # приблизително разстояние до елипсоид (Quilez)
    px, py, pz = (X - c[0]) / r[0], (Y - c[1]) / r[1], (Z - c[2]) / r[2]
    k0 = np.sqrt(px * px + py * py + pz * pz)
    k1 = np.sqrt((px / r[0]) ** 2 + (py / r[1]) ** 2 + (pz / r[2]) ** 2)
    return k0 * (k0 - 1) / np.maximum(k1, 1e-9)


def capsule(X, Y, Z, a, b, ra, rb=None):
    rb = ra if rb is None else rb
    a, b = np.array(a, float), np.array(b, float)
    ab = b - a
    t = np.clip(((X - a[0]) * ab[0] + (Y - a[1]) * ab[1] + (Z - a[2]) * ab[2]) / ab.dot(ab), 0, 1)
    dx, dy, dz = X - (a[0] + ab[0] * t), Y - (a[1] + ab[1] * t), Z - (a[2] + ab[2] * t)
    return np.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * t)


def axis(y):
    """Ос на ствола (от гръбначния мозък до средния мозък) — по центроидите на HRA модела; наклон напред нагоре."""
    ys = np.array([0.744, 0.758, 0.770, 0.781, 0.790, 0.805, 0.826])
    xs = np.array([-0.0034, -0.0013, -0.0010, -0.0008, -0.0004, 0.0000, 0.0004])
    zs = np.array([-0.0075, -0.0068, -0.0058, -0.0050, -0.0040, -0.0028, -0.0016])
    return np.interp(y, ys, xs), np.interp(y, ys, zs)


def brainstem(X, Y, Z):
    ax, az = axis(Y)
    u, w = X - ax, Z - az          # локални координати около оста
    au = np.abs(u)
    # --- продълговат мозък: коничен ствол, разширява се нагоре ---
    t = np.clip((Y - 0.746) / (0.782 - 0.746), 0, 1)
    hw = 0.0058 + 0.0040 * t ** 1.3                      # полуширина
    hd = 0.0052 + 0.0022 * t                             # полудълбочина
    core = (np.sqrt((u / hw) ** 2 + (w / hd) ** 2) - 1) * np.minimum(hw, hd)
    core = smax(core, Y - 0.786, 0.002)
    core = smax(core, 0.7485 - Y, 0.0025)
    # пирамиди (вентрално, от двете страни на предната срединна цепка)
    pyr = capsule(au, Y, w, (0.0024, 0.752, 0.0038), (0.0030, 0.782, 0.0062), 0.0019, 0.0026)
    med = smin(core, pyr, 0.0012)
    # оливи — овоидни издутини латерално от пирамидите
    oli = ellipsoid(au, Y, w, (0.0062, 0.7715, 0.0030), (0.0026, 0.0068, 0.0028))
    med = smin(med, oli, 0.0010)
    # туберкули на gracilis/cuneatus (дорзално, долна половина)
    tub = capsule(au, Y, w, (0.0017, 0.753, -0.0046), (0.0022, 0.768, -0.0064), 0.0014, 0.0017)
    tub2 = capsule(au, Y, w, (0.0045, 0.755, -0.0036), (0.0056, 0.769, -0.0054), 0.0013, 0.0016)
    med = smin(med, smin(tub, tub2, 0.0010), 0.0016)
    # предна срединна цепка и задна срединна бразда
    band = lambda y0, y1, e: np.clip((Y - y0) / e, 0, 1) * np.clip((y1 - Y) / e, 0, 1)   # плавна маска по височина
    fis = np.sqrt(u * u + ((w - 0.0074) / 2.0) ** 2) - 0.0007 + (1 - band(0.745, 0.7815, 0.002)) * 0.004
    med = smax(med, -fis, 0.0006)
    psul = np.sqrt(u * u + ((w + 0.0080) / 2.0) ** 2) - 0.0005 + (1 - band(0.745, 0.766, 0.003)) * 0.004
    med = smax(med, -psul, 0.0005)
    # бразда между пирамидата и оливата (preolivary)
    pre = np.sqrt((au - 0.0050) ** 2 + ((w - 0.0058) / 1.6) ** 2) - 0.0005 + (1 - band(0.762, 0.780, 0.003)) * 0.004
    med = smax(med, -pre, 0.0005)

    # --- мост: вентрална издутина с базиларна бразда и средни малкомозъчни дръжки ---
    pons = ellipsoid(u, Y, w, (0.0, 0.7890, 0.0024), (0.0140, 0.0120, 0.0102))
    teg = capsule(u, Y, w, (0.0, 0.781, -0.0060), (0.0, 0.799, -0.0050), 0.0072)
    pons = smin(pons, teg, 0.002)
    mcp = capsule(au, Y, w, (0.0085, 0.7895, -0.0030), (0.0150, 0.7880, -0.0150), 0.0074, 0.0062)
    mcp2 = capsule(au, Y, w, (0.0150, 0.7880, -0.0150), (0.0175, 0.7875, -0.0215), 0.0062, 0.0050)
    pons = smin(pons, smin(mcp, mcp2, 0.002), 0.0045)
    bas = np.sqrt(u * u + ((w - 0.0130) / 1.5) ** 2) - 0.0016    # базиларна бразда (a. basilaris)
    pons = smax(pons, -bas, 0.0016)

    # --- среден мозък: tegmentum, мозъчни крачета, четирихълмие ---
    mid = capsule(u, Y, w, (0.0, 0.797, -0.0052), (0.0, 0.817, -0.0038), 0.0078, 0.0084)
    crus = capsule(au, Y, w, (0.0030, 0.7965, 0.0022), (0.0072, 0.8170, 0.0040), 0.0042, 0.0048)
    mid = smin(mid, crus, 0.0030)
    ipf = capsule(u, Y, w, (0.0, 0.7995, 0.0072), (0.0, 0.8185, 0.0094), 0.0016, 0.0028)   # междукрачна ямка
    mid = smax(mid, -ipf, 0.0012)
    for yc, rr in ((0.8060, 0.0030), (0.8125, 0.0026)):
        col = ellipsoid(au, Y, w, (0.0034, yc, -0.0112), (rr, rr * 0.95, 0.0019))
        mid = smin(mid, col, 0.0010)
    mid = smax(mid, Y - 0.8220, 0.005)

    d = smin(med, pons, 0.0022)
    d = smin(d, mid, 0.0028)
    return d


def taubin(P, F, it=30, lam=0.5, mu=-0.53):
    n = len(P)
    e = np.vstack([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    e = np.vstack([e, e[:, ::-1]])
    deg = np.bincount(e[:, 0], minlength=n).astype(float)
    for _ in range(it):
        for f in (lam, mu):
            S = np.zeros_like(P)
            np.add.at(S, e[:, 0], P[e[:, 1]])
            P = P + f * (S / deg[:, None] - P)
    return P


TARGET = 22000   # триъгълника общо (оригиналът: ≈ 5800, на плоскости)


def build(voxel):
    lo, hi = np.array([-0.032, 0.741, -0.031]), np.array([0.032, 0.829, 0.019])
    nx, ny, nz = np.ceil((hi - lo) / voxel).astype(int) + 1
    xs, ys, zs = (lo[i] + np.arange(n) * voxel for i, n in enumerate((nx, ny, nz)))
    vol = np.empty((nx, ny, nz), np.float32)
    for i in range(0, nx, 16):
        X, Y, Z = np.meshgrid(xs[i:i + 16], ys, zs, indexing='ij')
        vol[i:i + 16] = brainstem(X, Y, Z)
    V, F, _, _ = marching_cubes(vol, 0.0, spacing=(voxel,) * 3)
    V = V + lo
    V = taubin(V, F)
    # опростяване с квадрични грешки: запазва кривината, гладките нормали правят останалото
    import pyfqmr
    s = pyfqmr.Simplify()
    s.setMesh(V.astype(np.float64), F.astype(np.int32))
    s.simplify_mesh(target_count=TARGET, aggressiveness=3, preserve_border=True, verbose=False)
    V, F, _ = s.getMesh()
    F = F.astype(np.int64)
    return V, F


def split(V, F):
    """Граница продълговат мозък / мост: моcто-булбарната бразда — вентрално ниско, дорзално по-високо
    (дъното на IV вентрикул принадлежи на продълговатия мозък отдолу)."""
    c = V[F].mean(1)
    ax, az = axis(c[:, 1])
    w = c[:, 2] - az
    ycut = 0.7815 - np.clip(-w, 0, None) * 0.55
    lat = np.abs(c[:, 0] - ax) > 0.0115    # дръжките са на моста
    isM = (c[:, 1] < ycut) & ~lat
    out = []
    for m in (isM, ~isM):
        f = F[m]
        used, inv = np.unique(f, return_inverse=True)
        out.append((V[used], inv.reshape(-1, 3)))
    return out


if __name__ == '__main__':
    path = sys.argv[1]
    voxel = float(sys.argv[2]) if len(sys.argv) > 2 else 0.00035
    groups = load(path)
    V, F = build(voxel)
    (mP, mI), (pP, pI) = split(V, F)
    print('medulla', len(mP), len(mI), 'pons', len(pP), len(pI))
    rep = {'medulla': (mP, mI), 'pons': (pP, pI)}
    save(path, [(g, *rep[g]) if g in rep else (g, P, I) for g, P, I in groups])
