import sys, os, time
import numpy as np
import mediapipe as mp
from PIL import Image, ImageFilter
from scipy import ndimage

seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=1)

def cutout(src, dst, max_h=1500):
    img = Image.open(src).convert('RGB')
    arr = np.array(img)
    mask = seg.process(arr).segmentation_mask.astype(np.float32)
    core = mask > 0.45
    core = ndimage.binary_fill_holes(core)
    lab, n = ndimage.label(core)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n+1))
        keep = np.argmax(sizes) + 1
        core = lab == keep
    alpha = np.clip((mask - 0.28) * 3.0, 0, 1) ** 1.1
    alpha = np.where(core, np.maximum(alpha, 0.96), alpha * 0.25)
    a = Image.fromarray((alpha*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
    out = np.dstack([arr, np.array(a)])
    im = Image.fromarray(out, 'RGBA')
    bbox = im.getbbox()
    if bbox:
        pad = 16
        l,t,r,b = bbox
        l=max(0,l-pad); t=max(0,t-pad); r=min(im.width,r+pad); b=min(im.height,b+pad)
        im = im.crop((l,t,r,b))
    if im.height > max_h:
        im = im.resize((round(im.width*max_h/im.height), max_h), Image.LANCZOS)
    im.save(dst, 'PNG', optimize=True)
    print(os.path.basename(dst), im.size)

for src in sys.argv[1:]:
    base = os.path.basename(src).rsplit('.',1)[0]
    t=time.time()
    cutout(src, os.path.join('assets/img/cut', base + '.png'))
    print('   %.1fs' % (time.time()-t))
