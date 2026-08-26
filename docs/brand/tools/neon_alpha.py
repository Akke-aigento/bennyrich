#!/usr/bin/env python3
"""
neon_alpha.py — lift a neon logo render off a PURE-BLACK ground into transparent PNGs.

    python3 neon_alpha.py docs/brand/logo-pink.jpg pink public/brand

Writes logo-lockup-<tone>.png, logo-wordmark-<tone>.png, logo-wordmark-worldwide-<tone>.png,
logo-monogram-<tone>.png. Layout is auto-detected as three horizontal bands
(monogram / wordmark / WORLDWIDE), so it works on any colour variant of the same lockup.

Method = GIMP "Color to Alpha (black)": alpha = max(r,g,b); rgb' = rgb / alpha. The glow keeps
its saturation and blends on any ground. Only valid for renders on a truly black background
(photos against a wall do NOT work — use imgeditor.co / Nano Banana for those).
Needs: python3, pillow, numpy. Compress afterwards: pngquant --quality=85-100 --speed 1.
"""
import sys, os
import numpy as np
from PIL import Image

src, tone, outdir = (sys.argv + ['', 'blue', '.'])[1:4]
if not src:
    sys.exit(__doc__)
os.makedirs(outdir, exist_ok=True)

a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
mx = a.max(axis=2)
alpha = np.clip((mx - 2.0) / 253.0, 0, 1)                     # 2/255 noise floor
rgb = np.clip(a * 255.0 / np.where(mx > 0, mx, 1.0)[..., None], 0, 255)
glow = a[(mx > 80) & (mx < 160)].mean(axis=0) if ((mx > 80) & (mx < 160)).any() else np.zeros(3)
rgb = np.where((alpha > 0)[..., None], rgb, glow)             # colour under alpha 0 = glow tint
full = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), 'RGBA')
W, H = full.size

# --- band detection (rows with any pixel brighter than 60) -------------------------------
rows = (mx > 60).sum(axis=1)
bands, inb = [], False
for y, v in enumerate(rows):
    if v and not inb: y0, inb = y, True
    if not v and inb: bands.append((y0, y)); inb = False
if inb: bands.append((y0, H))
bands = [b for b in bands if b[1] - b[0] > 8]
if len(bands) != 3:
    sys.exit(f'expected 3 bands (monogram, wordmark, worldwide), found {bands}')
def xr(b):
    cols = (mx[b[0]:b[1]] > 60).sum(axis=0); xs = np.where(cols > 0)[0]; return xs.min(), xs.max()
(m0, m1), (w0, w1), (v0, v1) = bands
mx0, mx1 = xr(bands[0]); wx0, wx1 = xr(bands[1])
PAD = 28
cut = (m1 + w0) // 2                                           # split row between monogram and wordmark

def feather(img, top=0, bottom=0):
    arr = np.asarray(img).astype(np.float32); h = arr.shape[0]; ramp = np.ones(h, np.float32)
    if top:    ramp[:top] = np.linspace(0, 1, top, endpoint=False)
    if bottom: ramp[h - bottom:] = np.linspace(1, 0, bottom, endpoint=False)
    arr[..., 3] *= ramp[:, None]; return Image.fromarray(arr.astype(np.uint8), 'RGBA')

out = {
    f'logo-lockup-{tone}':             full.crop((wx0 - PAD, m0 - PAD, wx1 + PAD, v1 + PAD)),
    f'logo-wordmark-{tone}':           feather(full.crop((wx0 - PAD, cut, wx1 + PAD, w1 + 12)), top=10, bottom=8),
    f'logo-wordmark-worldwide-{tone}': feather(full.crop((wx0 - PAD, cut, wx1 + PAD, v1 + PAD)), top=10),
    f'logo-monogram-{tone}':           feather(full.crop((mx0 - PAD, m0 - PAD, mx1 + PAD, cut)), bottom=8),
}
for name, img in out.items():
    p = os.path.join(outdir, name + '.png'); img.save(p, optimize=True); print(p, img.size)
