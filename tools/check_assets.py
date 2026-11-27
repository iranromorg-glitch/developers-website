#!/usr/bin/env python3
"""Fail if the site references assets that don't exist."""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pat = re.compile(r"""assets/[A-Za-z0-9_\-./]+""")
missing, checked = [], 0
for base, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules')]
    for f in files:
        if not f.endswith(('.html', '.css', '.js', '.md', '.svg')):
            continue
        path = os.path.join(base, f)
        for ref in pat.findall(open(path, encoding='utf8').read()):
            checked += 1
            target = ref.split('#')[0].split('?')[0]
            if not os.path.exists(os.path.join(ROOT, target)):
                missing.append(f'{os.path.relpath(path, ROOT)} -> {target}')
print(f'checked {checked} asset references')
if missing:
    print('MISSING ASSETS:')
    for m in missing:
        print(' -', m)
    sys.exit(1)
print('all asset references resolve')
