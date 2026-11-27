#!/usr/bin/env python3
"""Final tightening: crush low/mid alphas toward zero so no background haze
survives; slight erode; 1px feather. Usage: python3 tools/tighten.py <png> ..."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

for path in sys.argv[1:]:
    im = Image.open(path).convert('RGBA')
    a = np.array(im).astype(np.float32)
    alpha = a[..., 3] / 255.0
    alpha = np.clip((alpha - 0.16) / 0.84, 0, 1) ** 1.45
    alpha = ndimage.grey_erosion(alpha, size=(3, 3))   # 1px shave
    a[..., 3] = (alpha * 255).astype(np.uint8)
    out = Image.fromarray(a.astype(np.uint8), 'RGBA')
    out.putalpha(out.getchannel('A').filter(ImageFilter.GaussianBlur(0.6)))
    out.save(path, 'PNG', optimize=True)
    print('tightened', path)
