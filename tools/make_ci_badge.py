#!/usr/bin/env python3
"""Generate assets/badges/ci.svg — self-hosted «CI · PASSING» pill (vector, no fonts needed).

NOTE: this is a static snapshot of CI status on main (green as of 2026-11-27).
It links to the Actions tab from the README; it does not poll live status.
Re-run this script and commit the result to refresh the snapshot.
"""
import math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
OUT = 'assets/badges/ci.svg'
SIZE = 13
PAD = 19
BASELINE = 25.5
C_BG, C_LEFT, C_LABEL, C_VALUE = '#151412', '#403f3b', '#e8e6e1', '#3fb950'

font = TTFont(FONT)
cmap = font.getBestCmap()
hmtx = font['hmtx']
upm = font['head'].unitsPerEm
glyph_set = font.getGlyphSet()
S = SIZE / upm

def advance(text):
    return sum(hmtx[cmap[ord(ch)]][0] for ch in text) * S

def text_paths(text, fill, x):
    paths, cx = [], 0.0
    for ch in text:
        if ch == ' ':
            cx += hmtx['space'][0] * S
            continue
        pen = SVGPathPen(glyph_set)
        glyph_set[cmap[ord(ch)]].draw(pen)
        d = pen.getCommands()
        paths.append(f'<path d="{d}" transform="translate({x + cx:.2f} {BASELINE}) scale({S:.6f} {-S:.6f})" fill="{fill}"/>')
        cx += hmtx[cmap[ord(ch)]][0] * S
    return ''.join(paths), cx

label = 'CI'
value = 'PASSING'
label_w = advance(label)
value_w = advance(value)
CHECK_W = 11
GAP = 7
left_w = math.ceil(label_w + 2 * PAD)
right_w = math.ceil(PAD + CHECK_W + GAP + value_w + PAD)
W = left_w + right_w

cx = left_w + PAD
check = f'<path d="M {cx:.2f} 20.4 L {cx + 3.6:.2f} 24.0 L {cx + 10.6:.2f} 14.6" fill="none" stroke="{C_VALUE}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>'
value_start = cx + CHECK_W + GAP
text_svg, _ = text_paths(value, C_VALUE, value_start)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="40" role="img" aria-label="CI: passing on main">
<rect width="{W}" height="40" rx="20" fill="{C_BG}"/>
<rect width="{left_w}" height="40" rx="20" fill="{C_LEFT}"/>
<rect x="{left_w - 20}" width="20" height="40" fill="{C_LEFT}"/>
{text_paths(label, C_LABEL, PAD)[0]}{check}{text_svg}
</svg>
'''
open(OUT, 'w', encoding='utf8').write(svg)
print(f'wrote {OUT}  width={W} (left {left_w} + right {right_w})  label_w={label_w:.1f}  value_w={value_w:.1f}')
