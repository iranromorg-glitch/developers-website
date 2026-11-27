# Customizing LINEUP

Everything about the catalogue lives in **`js/data.js`**. You do not touch the layout code to change looks, prices, colours, or images.

## The data model

Each look is an object in the `LOOKS` array:

```js
{
  id: 'w1',                 // unique id; the product page lives at #look-w1
  gender: 'women',          // 'women' | 'men'
  index: 1,                 // number shown as "01 / 06"
  name: 'The Camel Overcoat',
  tagline: 'The city uniform…',
  desc: 'Two sentences shown on the product page.',
  model: { w: 'assets/img/cut/women-1.png', name: 'Adaeze', height: "5'10\"", wears: 'S' },
  turntable: true,          // enables the 360° view (Look 01 of each cast)
  fabric: '…', fit: '…',    // product-page accordion copy
  colours: [                // exactly three colourways
    { id: 'camel', name: 'Camel', hex: '#b98a5e', filter: 'none', delta: 0 },
    { id: 'black', name: 'Black', hex: '#262320', filter: 'grayscale(.95) brightness(.48) contrast(1.12)', delta: 25 },
  ],
  pieces: [                 // first piece is the hero piece — colourway deltas apply to it
    { id: 'w1a', name: 'Double-Breasted Wool Overcoat', colour: 'Camel', price: 248, img: 'assets/img/products/w1a.svg', kind: 'coat' },
  ],
}
```

### Colourway `filter`

The same model photo is re-tinted per colourway with a CSS filter string (e.g. black wool via greyscale + low brightness). `delta` is an optional price upcharge applied to the hero piece (first piece) for that colourway.

### Sizes

Size ranges come from `SIZES` at the top of `data.js`: women `XS–XL`, men `S–XXL`, `shoeW`/`shoeM` `6–10`/`8–12`. Piece `kind: 'shoeW' | 'shoeM'` selects the shoe range.

### Prices

USD, whole dollars. `lookTotal` = sum of pieces + active colourway delta; `lookTotalLive` = same but only over the pieces left included on the product page.

## Changing the imagery

| Asset | Location | Notes |
|---|---|---|
| Model cutouts | `assets/img/cut/*.png` | transparent PNGs; `tools/cutout.py` removes backgrounds via MediaPipe |
| Product shots | `assets/img/products/*.svg` | flat-lay illustrations; regenerate with `python3 tools/make_flats.py` |
| Lookbook plates | `assets/img/cut/men-5.svg`, `men-6.svg` | typographic plate stand-ins |

To swap in real photography, drop files with the same names (or update `model.w` / `piece.img` in `data.js`). Product photos can be real images: just point `piece.img` at them.

## Adding a new look

1. Add a `model` entry (or generate one with the pipeline in `tools/`).
2. Append a look object to `LOOKS`. Keep six per gender for the runway animation.
3. Add its pieces and three colourways.
4. Run `npm run check` and `python3 tools/check_assets.py`.
5. Open a PR with screenshots.

## Deployment

The site is fully static — every path is relative. Any static host works:

- **GitHub Pages**: Settings → Pages → *Deploy from a branch* → `main` / root. Your site goes live at `https://<user>.github.io/<repo>/`.
- **Netlify / Vercel / Cloudflare Pages**: publish directory = repo root, no build command.
