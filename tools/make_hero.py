#!/usr/bin/env python3
"""Compose the README/social hero: the women's runway lineup on warm paper,
mirroring the site's depth slots (front model sharp at right)."""
from PIL import Image, ImageDraw, ImageFilter
import math

W, H = 2400, 1080
PAPER = (244, 243, 240)

canvas = Image.new('RGB', (W, H), PAPER)
draw = ImageDraw.Draw(canvas, 'RGBA')

# soft vignette backdrop
d = ImageDraw.Draw(canvas, 'RGBA')
for r, alpha in [(1500, 10), (1100, 14), (750, 18)]:
    d.ellipse([W // 2 - r, H // 2 - int(r * .62), W // 2 + r, H // 2 + int(r * .62)], fill=(21, 20, 18, 0))

# floor sheen
floor = Image.new('RGBA', (W, H), (0, 0, 0, 0))
fd = ImageDraw.Draw(floor)
fd.rectangle([0, H - 150, W, H], fill=(21, 20, 18, 14))
canvas.paste(Image.alpha_composite(canvas.convert('RGBA'), floor).convert('RGB'), (0, 0))
d = ImageDraw.Draw(canvas, 'RGBA')

SLOTS = [  # (look, left_pct_of_W, scale_of_SLOT0_height, bottom_offset_px)
    ('women-1', .79, 1.00, 0),
    ('women-2', .575, .80, 26),
    ('women-3', .415, .67, 56),
    ('women-4', .285, .57, 82),
    ('women-5', .175, .50, 108),
    ('women-6', .075, .44, 128),
]
BASE_H = 800

def shadow(cx, width, bottom, strength):
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.ellipse([cx - width // 2, bottom - 16, cx + width // 2, bottom + 16], fill=(21, 20, 18, strength))
    return sh.filter(ImageFilter.GaussianBlur(10))

def glow(cx, bottom, radius):
    g = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    for i, a in enumerate([130, 80, 40, 18]):
        rr = radius - i * 42
        gd.ellipse([cx - rr, bottom - 30 - i * 8, cx + rr, bottom + 34 + i * 6], fill=(255, 255, 255, a))
    return g.filter(ImageFilter.GaussianBlur(24))

FLOOR = H - 24
# paint back-to-front so the front model overlaps
for name, left, scale, lift in reversed(SLOTS):
    cut = Image.open(f'assets/img/cut/{name}.png')
    h = int(BASE_H * scale)
    w = round(cut.width * h / cut.height)
    cut = cut.resize((w, h), Image.LANCZOS)
    if left + (w / W) / 2 > 1:
        cut = cut.resize((int(w * .96), int(h * .96)), Image.LANCZOS)
        w, h = cut.size
    cx = int(left * W)
    bottom = FLOOR - lift
    # oval floor shadow (front stronger)
    strength = int(150 * scale)
    canvas.paste(Image.alpha_composite(canvas.convert('RGBA'), shadow(cx, int(w * 1.5), bottom, strength)).convert('RGB'), (0, 0))
    if name == 'women-1':
        canvas.paste(Image.alpha_composite(canvas.convert('RGBA'), glow(cx, bottom, 300)).convert('RGB'), (0, 0))
    canvas.paste(cut, (cx - w // 2, bottom - h), cut)

canvas.save('assets/img/lineup-hero.jpg', 'JPEG', quality=90, optimize=True, progressive=True)
print('hero saved', canvas.size)
