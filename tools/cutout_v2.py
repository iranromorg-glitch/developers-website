#!/usr/bin/env python3
"""Clean cutout pipeline — v2. No forced core-boost this time.

Alpha comes straight from the selfie-segmentation mask with a soft ramp,
largest connected component kept, holes filled, then background un-mixing.
Colours of partial pixels are pulled toward the nearest foreground colour
(decontamination), so no background tint survives on any backdrop.

Usage: python3 tools/cutout_v2.py <src-jpg> <dst-png>
"""
import sys
import numpy as np
import mediapipe as mp
from PIL import Image, ImageFilter
from scipy import ndimage

def estimate_bg(src):
    w, h = src.size
    pts = [src.getpixel((2,2)), src.getpixel((w-3,2)), src.getpixel((2,h-3)), src.getpixel((w-3,h-3)),
           src.getpixel((w//2,2)), src.getpixel((2,h//2)), src.getpixel((w-3,h//2)), src.getpixel((w//2,h-3))]
    return np.array(pts, dtype=np.float32).mean(axis=0)

seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=1)

def run(src_path, dst_path, max_h=1500):
    img = Image.open(src_path).convert('RGB')
    arr = np.array(img)
    mask = seg.process(arr).segmentation_mask.astype(np.float32)
    bg = estimate_bg(img)

    alpha = np.clip((mask - 0.34) * 3.4, 0, 1) ** 1.15

    core = alpha > 0.45
    core = ndimage.binary_fill_holes(core)
    lab, n = ndimage.label(core)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        core = lab == (np.argmax(sizes) + 1)
    alpha = np.where(core, alpha, 0.0)

    rgb = arr.astype(np.float32)
    # un-mix background from partial pixels
    safe = np.clip(alpha, 1e-3, 1.0)
    rgb = np.clip((rgb - (1.0 - alpha[..., None]) * bg[None, None, :]) / safe[..., None], 0, 255)
    # nearest-foreground colour for anything not solid
    fg = alpha > 0.92
    if fg.any():
        ind = ndimage.distance_transform_edt(~fg, return_distances=False, return_indices=True)
        rgb = np.where(fg[..., None], rgb, rgb[tuple(ind)])
    out = np.dstack([rgb, (alpha * 255).astype(np.uint8)]).astype(np.uint8)
    im = Image.fromarray(out, 'RGBA')
    bbox = im.getbbox()
    if bbox:
        pad = 16
        l, t, r, b = bbox
        l, t, r, b = max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)
        im = im.crop((l, t, r, b))
    if im.height > max_h:
        im = im.resize((round(im.width * max_h / im.height), max_h), Image.LANCZOS)
    im.putalpha(im.getchannel('A').filter(ImageFilter.GaussianBlur(0.6)))
    im.save(dst_path, 'PNG', optimize=True)
    print(dst_path, im.size)

if __name__ == '__main__':
    run(sys.argv[1], sys.argv[2])
