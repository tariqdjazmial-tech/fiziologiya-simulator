"""Тъмносив студиен фон: светлият кадър на симулацията (от simgrade.py) стои като заоблен екран
в центъра, с тънък светъл ръб и мека сянка. Нищо в самата сцена не се изрязва."""
import sys, os, glob, numpy as np
from PIL import Image, ImageDraw, ImageFilter
SRC, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
W, H = 1280, 800
y, x = np.mgrid[0:H, 0:W].astype(np.float32); u, v = x / W, y / H
bg = np.stack([np.full_like(u, c) for c in (24, 25, 28)], -1)
g = np.exp(-(((u - .5) / .55) ** 2 + ((v - .42) / .6) ** 2))[..., None]; bg = bg * (1 - g) + np.array([60, 62, 68]) * g
r = np.exp(-(((u - .97) / .3) ** 2 + ((v - 1.03) / .28) ** 2))[..., None] * .45; bg = bg * (1 - r) + np.array([125, 18, 36]) * r
s = np.exp(-(((u - .02) / .26) ** 2 + ((v + .03) / .26) ** 2))[..., None] * .2; bg = bg * (1 - s) + np.array([130, 136, 146]) * s
bg *= (1 - .38 * np.clip(np.hypot(u - .5, v - .5) * 1.4, 0, 1) ** 2)[..., None]
bg += np.random.default_rng(3).normal(0, 1.3, (H, W, 1))
cw, ch = int(W * .78), int(H * .78); ox, oy = (W - cw) // 2, int((H - ch) * .45); R = 26
mask = Image.new("L", (W, H), 0); ImageDraw.Draw(mask).rounded_rectangle([ox, oy, ox + cw, oy + ch], R, fill=255)
shadow = np.asarray(mask.transform((W, H), Image.AFFINE, (1, 0, 0, 0, 1, -18)).filter(ImageFilter.GaussianBlur(34))).astype(np.float32)[..., None] / 255
base = bg * (1 - .55 * shadow)
edge = Image.new("L", (W, H), 0); ImageDraw.Draw(edge).rounded_rectangle([ox, oy, ox + cw, oy + ch], R, outline=255, width=2)
edge = np.asarray(edge).astype(np.float32)[..., None] / 255
m = np.asarray(mask.filter(ImageFilter.GaussianBlur(.8))).astype(np.float32)[..., None] / 255
for f in sorted(glob.glob(os.path.join(SRC, "*.webp"))):
    im = Image.open(f).convert("RGB")
    sc = max(cw / im.width, ch / im.height); im = im.resize((int(im.width * sc) + 1, int(im.height * sc) + 1), Image.LANCZOS)
    l, t = (im.width - cw) // 2, (im.height - ch) // 2; im = im.crop((l, t, l + cw, t + ch))
    layer = np.zeros((H, W, 3), np.float32); layer[oy:oy + ch, ox:ox + cw] = np.asarray(im)
    layer = layer * np.array([.94, .945, .955])  # сцената малко по-тъмна и хладна, за да не блести на тъмния фон
    out = base * (1 - m) + layer * m
    out = out * (1 - edge * .5) + 255 * edge * .5
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(OUT, os.path.basename(f)), "WEBP", quality=84, method=6)
print("ok")
