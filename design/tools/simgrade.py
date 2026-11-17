"""Прави снимките на симулациите да изглеждат като продуктови кадри:
изрязва празното поле и интерфейсните ленти, изчиства фона до бяло, поставя сцената
върху мек студиен градиент (сребро с лек червен отблясък), засилва детайла и сянката."""
import sys, os, glob
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

SRC = sys.argv[1]; OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
W, H = 1280, 800

def studio_bg():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    u, v = x / W, y / H
    base = np.stack([np.full_like(u, c) for c in (238, 240, 243)], -1)
    # меко осветено петно в центъра и топъл червен рефлекс долу вдясно
    glow = np.exp(-(((u - .5) / .55) ** 2 + ((v - .45) / .6) ** 2))[..., None]
    base = base * (1 - glow) + np.array([252, 252, 253]) * glow
    red = np.exp(-(((u - .95) / .35) ** 2 + ((v - 1.0) / .35) ** 2))[..., None] * .22
    base = base * (1 - red) + np.array([226, 120, 132]) * red
    sil = np.exp(-(((u - .05) / .3) ** 2 + ((v - .0) / .3) ** 2))[..., None] * .25
    base = base * (1 - sil) + np.array([205, 210, 218]) * sil
    vig = (1 - .10 * np.clip(np.hypot(u - .5, v - .5) * 1.5, 0, 1) ** 2)[..., None]
    return np.clip(base * vig, 0, 255)

BG = studio_bg()

def process(path):
    im = Image.open(path).convert("RGB"); a = np.asarray(im).astype(np.float32); h, w, _ = a.shape
    # оценка на фона (бавно променящ се светъл градиент) и изравняване до бяло
    bgest = np.asarray(im.resize((24, 14), Image.BILINEAR).filter(ImageFilter.MaxFilter(3)).resize((w, h), Image.BILINEAR)).astype(np.float32)
    flat = np.clip(a / np.maximum(bgest, 1) * 255, 0, 255)
    # маска на съдържанието: всичко, което се различава от бялото
    diff = 255 - flat.min(-1)
    mask = diff > 22
    # интерфейсните ленти горе и долу (етапи, бутони, надписи) не определят рамката
    plot = (a[:6].mean() > 252 and a[-6:].mean() > 252)  # 2D графика върху бяло: осите остават
    band_t, band_b = (0, 0) if plot else (int(h * .075), int(h * .085))
    m2 = mask.copy(); m2[:band_t] = False; m2[h - band_b:] = False; m2[:, :int(w * .012)] = False; m2[:, w - int(w * .012):] = False
    rows = np.where(m2.sum(1) > w * .004)[0]; cols = np.where(m2.sum(0) > h * .004)[0]
    if len(rows) < 10 or len(cols) < 10:
        y0, y1, x0, x1 = 0, h, 0, w
    else:
        y0, y1, x0, x1 = rows[0], rows[-1], cols[0], cols[-1]
    # махаме интерфейсните ленти от картината
    if band_t: flat[:band_t] = 255; flat[h - band_b:] = 255
    pad = int(max(y1 - y0, x1 - x0) * .06)
    y0, y1 = max(0, y0 - pad), min(h, y1 + pad); x0, x1 = max(0, x0 - pad), min(w, x1 + pad)
    crop = Image.fromarray(flat[y0:y1, x0:x1].astype(np.uint8))
    # мащабиране да запълни кадъра (без да се реже съдържание)
    cw, ch = crop.size; s = min(W * .9 / cw, H * .86 / ch); s = min(s, 2.4)
    crop = crop.resize((max(1, int(cw * s)), max(1, int(ch * s))), Image.LANCZOS)
    crop = crop.filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
    crop = ImageEnhance.Color(crop).enhance(1.12); crop = ImageEnhance.Contrast(crop).enhance(1.06)
    # плавно преливане към бяло по краищата на изрязването, за да не личи рамка
    c = np.asarray(crop).astype(np.float32); ch2, cw2 = c.shape[:2]; f = max(8, int(min(ch2, cw2) * .06))
    ry = np.clip(np.minimum(np.arange(ch2), np.arange(ch2)[::-1]) / f, 0, 1); rx = np.clip(np.minimum(np.arange(cw2), np.arange(cw2)[::-1]) / f, 0, 1)
    ramp = (np.minimum(ry[:, None], rx[None, :]) ** 1.5)[..., None]
    c = 255 - (255 - c) * ramp; crop = Image.fromarray(c.astype(np.uint8))
    layer = np.full((H, W, 3), 255, np.float32)
    ox, oy = (W - crop.size[0]) // 2, int((H - crop.size[1]) * .52)
    layer[oy:oy + crop.size[1], ox:ox + crop.size[0]] = np.asarray(crop)
    # мека контактна сянка под обекта
    m = (255 - layer.min(-1)) > 22
    sh = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(26))
    sh = np.asarray(sh.transform((W, H), Image.AFFINE, (1, 0, 0, 0, 1, -14))).astype(np.float32)[..., None] / 255 * .16
    out = BG * (1 - sh) * (layer / 255)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

for f in sorted(glob.glob(os.path.join(SRC, "*_*.webp"))):
    n = os.path.basename(f)
    if not (n.startswith("en_") or n.startswith("bg_")): continue
    process(f).save(os.path.join(OUT, n), "WEBP", quality=84, method=6)
print("ok")
