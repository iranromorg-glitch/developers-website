#!/usr/bin/env python3
"""Generate LINEUP Fall '26 flat-lay garment illustrations as SVG."""
import math, os

INK = '#151412'
BG_INNER = '#eceae6'
BG_OUTER = '#d8d6d1'

PIECES = {  # id: (kind, hex, label)
  'w1a': ('overcoat', '#b98a5e'), 'w1b': ('knit', '#ece6da'), 'w1c': ('trouser', '#232019'),
  'w2a': ('dress', '#d9c3a5'), 'w2b': ('belt', '#1e1c1a'),
  'w3a': ('shacket', '#8a5a33'), 'w3b': ('shirt', '#f4f2ec'), 'w3c': ('trouser', '#e4dccb'),
  'w4a': ('knit', '#d8cfc0'), 'w4b': ('trouser', '#d8cfc0'),
  'w5a': ('blazer', '#cbb694'), 'w5b': ('camisole', '#ece6da'), 'w5c': ('skirt', '#cbb694'),
  'w6a': ('trouser', '#2e3a52'), 'w6b': ('tee', '#f4f2ec'), 'w6c': ('bomber', '#1f1d1b'), 'w6d': ('boot', '#a9763f'),
  'm1a': ('blazer', '#35342f'), 'm1b': ('knit', '#1e1c1a'),
  'm2a': ('polo', '#8a5a33'), 'm2b': ('trouser', '#cfc6b4'),
  'm3a': ('chore', '#5c614b'), 'm3b': ('tee', '#f4f2ec'), 'm3c': ('trouser', '#ddd6c7'),
  'm4a': ('trouser', '#2d3850'), 'm4b': ('shirt', '#f4f2ec'), 'm4c': ('sneaker', '#eceae6'),
  'm5a': ('shacket', '#463024'), 'm5b': ('knit', '#1e1c1a'), 'm5c': ('trouser', '#38342f'),
  'm6a': ('blazer', '#c8b28c'), 'm6b': ('trouser', '#c8b28c'),
}

def shade(hexcol, f):
    """darken/lighten hex by factor f (<1 darker, >1 lighter)"""
    h = hexcol.lstrip('#')
    r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    r, g, b = (max(0, min(255, round(c * f))) for c in (r, g, b))
    return '#%02x%02x%02x' % (r, g, b)

def bg():
    return f'''<defs>
<radialGradient id="bg" cx="50%" cy="38%" r="75%">
  <stop offset="0%" stop-color="{BG_INNER}"/><stop offset="100%" stop-color="{BG_OUTER}"/>
</radialGradient>
<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#151412" flood-opacity="0.28"/></filter>
</defs>
<rect width="800" height="800" fill="url(#bg)"/>'''

def g_open(c):
    return f'<g filter="url(#soft)" stroke="{INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">'

def g_close():
    return '</g>'

def stitch(x1, y1, x2, y2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{INK}" stroke-opacity=".38" stroke-width="2" stroke-dasharray="7 8" fill="none"/>'

def coat(c, long_hem=True, double=True, lapel='notch'):
    d = shade(c, .72); dd = shade(c, .55); l = shade(c, 1.28)
    hem_y = 690 if long_hem else 560
    body = f'''
<path d="M298 178 Q400 132 502 178 L520 196 L536 470 L528 {hem_y} L272 {hem_y} L264 470 L280 196 Z" fill="{c}"/>
<path d="M280 196 L206 236 L226 560 L268 548 L264 470" fill="{c}"/>
<path d="M520 196 L594 236 L574 560 L532 548 L536 470" fill="{c}"/>'''
    lapels = f'''
<path d="M400 190 L340 214 L372 330 L400 268 Z" fill="{d}"/>
<path d="M400 190 L460 214 L428 330 L400 268 Z" fill="{d}"/>'''
    collar = f'<path d="M352 172 L384 158 L388 196 L356 200 Z" fill="{dd}"/><path d="M448 172 L416 158 L412 196 L444 200 Z" fill="{dd}"/>'
    buttons = ''
    if double:
        for y in (330, 420, 510):
            buttons += f'<circle cx="368" cy="{y}" r="6.5" fill="{dd}" stroke="none"/><circle cx="432" cy="{y}" r="6.5" fill="{dd}" stroke="none"/>'
    else:
        for y in (330, 410, 490):
            buttons += f'<circle cx="400" cy="{y}" r="6.5" fill="{dd}" stroke="none"/>'
    front = f'<line x1="400" y1="268" x2="400" y2="{hem_y - 14}" stroke="{INK}" stroke-opacity=".5" stroke-width="2.5"/>'
    seams = stitch(283, 240, 265, 540) + stitch(517, 240, 535, 540)
    pockets = stitch(308, 470, 356, 470) + stitch(444, 470, 492, 470)
    return f'{g_open(c)}{body}{lapels}{collar}{front}{seams}{pockets}{buttons}{g_close()}'

def knit(c, polo=False, turtleneck=True):
    d = shade(c, .78); dd = shade(c, .6)
    neck = ('<rect x="352" y="138" width="96" height="34" rx="14" fill="%s"/>' % dd) if turtleneck else ('<path d="M352 168 L400 200 L448 168 L436 138 L364 138 Z" fill="%s"/>' % dd if polo else '<path d="M350 150 Q400 128 450 150 L438 182 Q400 158 362 182 Z" fill="%s"/>' % dd)
    body = f'''
<path d="M296 190 Q400 148 504 190 L516 226 L524 470 Q400 500 276 470 L284 226 Z" fill="{c}"/>
<path d="M284 226 L212 268 L236 512 L284 496 Z" fill="{c}"/>
<path d="M516 226 L588 268 L564 512 L516 496 Z" fill="{c}"/>'''
    rib = ''.join(f'<line x1="{x}" y1="238" x2="{x}" y2="455" stroke="{INK}" stroke-opacity=".14" stroke-width="4"/>' for x in range(310, 510, 18))
    hem = stitch(290, 452, 510, 452)
    if polo:
        placket = '<line x1="400" y1="190" x2="400" y2="252" stroke="%s" stroke-width="3" stroke-opacity=".6"/><circle cx="400" cy="222" r="5" fill="%s" stroke="none"/><circle cx="400" cy="246" r="5" fill="%s" stroke="none"/>' % (INK, dd, dd)
    else:
        placket = ''
    return f'{g_open(c)}{body}{neck}{rib}{hem}{placket}{g_close()}'

def tee(c):
    dd = shade(c, .55)
    body = f'''
<path d="M290 200 Q400 162 510 200 L522 232 L532 430 Q400 462 268 430 L278 232 Z" fill="{c}"/>
<path d="M278 232 L236 262 L252 372 L288 366 Z" fill="{c}"/>
<path d="M522 232 L564 262 L548 372 L512 366 Z" fill="{c}"/>
<path d="M344 176 Q400 148 456 176 L444 208 Q400 182 356 208 Z" fill="{dd}"/>'''
    return f'{g_open(c)}{body}{stitch(280, 412, 520, 412)}{g_close()}'

def shirt(c, oxford=True):
    dd = shade(c, .6); d = shade(c, .8)
    body = f'''
<path d="M292 192 Q400 150 508 192 L520 228 L528 560 Q400 592 272 560 L280 228 Z" fill="{c}"/>
<path d="M280 228 L210 266 L232 560 L276 548 Z" fill="{c}"/>
<path d="M520 228 L590 266 L568 560 L524 548 Z" fill="{c}"/>
<path d="M352 162 L400 204 L448 162 L428 132 L372 132 Z" fill="{d}"/>'''
    placket = '<line x1="400" y1="204" x2="400" y2="566" stroke="%s" stroke-opacity=".55" stroke-width="3"/>' % INK
    buttons = ''.join(f'<circle cx="400" cy="{y}" r="5.5" fill="{dd}" stroke="none"/>' for y in range(250, 550, 52))
    pocket = stitch(306, 330, 366, 330) + stitch(306, 330, 306, 386) + stitch(366, 330, 366, 386) + stitch(306, 386, 366, 386)
    return f'{g_open(c)}{body}{placket}{buttons}{pocket}{g_close()}'

def trouser(c, selvedge=False):
    d = shade(c, .75); dd = shade(c, .6)
    legs = f'''
<path d="M252 172 L548 172 L560 268 L540 664 L424 664 L400 320 L376 664 L260 664 L240 268 Z" fill="{c}"/>
<rect x="248" y="158" width="304" height="46" rx="10" fill="{d}"/>'''
    crease = '<line x1="330" y1="340" x2="305" y2="640" stroke="%s" stroke-opacity=".4" stroke-width="2.5" stroke-dasharray="10 9"/><line x1="470" y1="340" x2="495" y2="640" stroke="%s" stroke-opacity=".4" stroke-width="2.5" stroke-dasharray="10 9"/>' % (INK, INK)
    fly = '<path d="M400 210 L400 300" stroke="%s" stroke-opacity=".55" stroke-width="3"/>' % INK
    btn = f'<circle cx="400" cy="181" r="6" fill="{dd}" stroke="none"/>'
    return f'{g_open(c)}{legs}{crease}{fly}{btn}{g_close()}'

def skirt(c):
    d = shade(c, .8); dd = shade(c, .6)
    body = f'''
<rect x="268" y="150" width="264" height="52" rx="10" fill="{d}"/>
<path d="M268 200 L532 200 L610 620 Q400 668 190 620 Z" fill="{c}"/>'''
    pleats = ''.join(f'<line x1="{x}" y1="220" x2="{x + (x - 400) * .32:.0f}" y2="610" stroke="{INK}" stroke-opacity=".16" stroke-width="4"/>' for x in range(272, 530, 32))
    return f'{g_open(c)}{body}{pleats}<circle cx="400" cy="176" r="6" fill="{dd}" stroke="none"/>{g_close()}'

def dress(c):
    d = shade(c, .78); dd = shade(c, .58)
    body = f'''
<path d="M330 132 L336 220 Q400 240 464 220 L470 132" fill="none" stroke="{c}" stroke-width="14"/>
<path d="M330 226 Q400 252 470 226 L486 330 L560 620 Q400 676 240 620 L314 330 Z" fill="{c}"/>
<path d="M330 226 Q400 252 470 226 L478 268 Q400 292 322 268 Z" fill="{d}"/>'''
    shine = '<path d="M372 300 L356 610" stroke="#ffffff" stroke-opacity=".5" stroke-width="10" stroke-linecap="round"/>'
    return f'{g_open(c)}{body}{shine}{g_close()}'

def camisole(c):
    d = shade(c, .72)
    body = f'''
<path d="M330 150 L338 236 Q400 256 462 236 L470 150" fill="none" stroke="{c}" stroke-width="12"/>
<path d="M330 240 Q400 264 470 240 L478 380 Q400 404 322 380 Z" fill="{c}"/>'''
    return f'{g_open(c)}{body}<line x1="400" y1="270" x2="400" y2="392" stroke="{INK}" stroke-opacity=".25" stroke-width="3" stroke-dasharray="8 8"/>{g_close()}'

def belt(c):
    d = shade(c, .7)
    return f'''<g filter="url(#soft)" stroke="{INK}" stroke-width="3" stroke-linejoin="round">
<rect x="90" y="330" width="620" height="120" rx="16" fill="{c}"/>
<rect x="90" y="348" width="620" height="8" fill="{d}" stroke="none" opacity=".7"/>
<rect x="330" y="300" width="150" height="180" rx="18" fill="none" stroke-width="14" stroke="{d}"/>
<line x1="405" y1="300" x2="405" y2="480" stroke="{d}" stroke-width="14"/>
<rect x="540" y="368" width="46" height="18" rx="9" fill="{d}" stroke="none"/>
</g>'''

def boot(c):
    d = shade(c, .7); dd = shade(c, .5)
    return f'''<g filter="url(#soft)" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
<path d="M208 180 L356 180 L356 420 Q436 428 528 470 L556 512 L556 556 L196 556 L196 180 Z" fill="{c}"/>
<rect x="196" y="540" width="360" height="34" fill="{dd}"/>
<rect x="196" y="566" width="96" height="30" fill="{dd}"/>
<path d="M208 240 L356 240 M208 300 L356 300 M208 360 L356 360" stroke="{INK}" stroke-opacity=".3" stroke-width="3"/>
<line x1="392" y1="556" x2="392" y2="596" stroke="{INK}" stroke-width="0" />
<path d="M196 556 L556 556" stroke="{dd}" stroke-width="6"/>
</g>'''

def sneaker(c):
    d = shade(c, .82); dd = shade(c, .6)
    return f'''<g filter="url(#soft)" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
<path d="M120 470 Q120 380 250 380 L300 330 Q380 320 430 380 L560 420 Q660 440 664 500 L664 530 L120 530 Z" fill="{c}"/>
<path d="M120 470 L664 470 L664 536 Q400 566 120 536 Z" fill="{d}"/>
<path d="M300 380 L360 430 M340 358 L398 424 M380 344 L436 420" stroke="{INK}" stroke-opacity=".4" stroke-width="4"/>
<circle cx="210" cy="420" r="4.5" fill="{dd}" stroke="none"/><circle cx="180" cy="442" r="4.5" fill="{dd}" stroke="none"/>
<path d="M150 500 L620 500" stroke="{dd}" stroke-width="4" stroke-opacity=".8"/>
</g>'''

def render(kind, c):
    if kind == 'overcoat': return coat(c, True, True)
    if kind == 'blazer': return coat(c, False, False)
    if kind == 'shacket': return coat(c, False, False).replace('stroke-width="3"', 'stroke-width="3"') # chore-ish
    if kind == 'chore': return coat(c, False, False)
    if kind == 'bomber': return coat(c, False, True)
    if kind == 'knit': return knit(c, polo=False, turtleneck=True)
    if kind == 'polo': return knit(c, polo=True, turtleneck=False)
    if kind == 'tee': return tee(c)
    if kind == 'shirt': return shirt(c)
    if kind == 'trouser': return trouser(c)
    if kind == 'skirt': return skirt(c)
    if kind == 'dress': return dress(c)
    if kind == 'camisole': return camisole(c)
    if kind == 'belt': return belt(c)
    if kind == 'boot': return boot(c)
    if kind == 'sneaker': return sneaker(c)
    raise ValueError(kind)

out_dir = 'assets/img/products'
os.makedirs(out_dir, exist_ok=True)
for pid, (kind, hexcol) in PIECES.items():
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="{kind}">{bg()}{render(kind, hexcol)}</svg>'
    with open(f'{out_dir}/{pid}.svg', 'w') as f:
        f.write(svg)
print('wrote', len(PIECES), 'product flats')

# ═══════════════ LOOKBOOK PLATE STAND-INS (Looks 05 & 06 men) ═══════════════
def hanger_plate(num, name, kind, hexcol):
    d = shade(hexcol, .72); dd = shade(hexcol, .55)
    inner = render(kind, hexcol).replace(' filter="url(#soft)"', '')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 1000" role="img" aria-label="Look {num} — {name} preview">
<g stroke="{INK}" stroke-linecap="round" fill="none">
  <path d="M320 56 a30 30 0 1 0 -30 -30" stroke-width="12"/>
  <line x1="320" y1="56" x2="320" y2="116" stroke-width="12"/>
  <path d="M92 158 L320 116 L548 158" stroke-width="14" stroke-linejoin="round"/>
</g>
<g transform="translate(-80 56)">{inner}</g>
</svg>'''

plates = [('05', 'The Suede Racer', 'shacket', '#463024', 'men-5'),
          ('06', 'The Linen Suit', 'blazer', '#c8b28c', 'men-6')]
for num, name, kind, hexcol, out in plates:
    svg = hanger_plate(num, name, kind, hexcol)
    with open(f'assets/img/cut/{out}.svg', 'w') as f:
        f.write(svg)
print('wrote 2 lookbook plates')
