/* LINEUP — Fall '26 catalogue data. Prices in USD. */

const SIZES = {
  women: ['XS', 'S', 'M', 'L', 'XL'],
  men: ['S', 'M', 'L', 'XL', 'XXL'],
  shoeW: ['6', '7', '8', '9', '10'],
  shoeM: ['8', '9', '10', '11', '12'],
};

const LOOKS = [
  {
    id: 'w1', gender: 'women', index: 1, name: 'The Camel Overcoat',
    tagline: 'The city uniform, October through March.',
    desc: 'A double-breasted camel overcoat over cashmere, cut long and worn with a straight black trouser. Quiet authority, head to toe.',
    model: { w: 'assets/img/cut/women-1.png', name: 'Adaeze', height: "5'10\"", wears: 'S' },
    turntable: true,
    fabric: 'Double-faced wool overcoat (80% wool, 20% cashmere), dry clean only. Cashmere-blend knit in 100% Grade-A cashmere — hand wash cold, dry flat. Wool trouser — dry clean or gentle cold cycle, cool iron.',
    fit: "Model is 5'10\" and wears size S. The overcoat runs oversized through the body with a dropped shoulder; take your true size for the intended drape, or size down for a closer line.",
    colours: [
      { id: 'camel', name: 'Camel', hex: '#b98a5e', filter: "none", delta: 0 },
      { id: 'black', name: 'Black', hex: '#262320', filter: "grayscale(.95) brightness(.48) contrast(1.12)", delta: 25 },
      { id: 'ivory', name: 'Ivory', hex: '#e9e3d7', filter: "saturate(.34) brightness(1.22) sepia(.16) contrast(.94)", delta: 0 },
    ],
    pieces: [
      { id: 'w1a', name: 'Double-Breasted Wool Overcoat', colour: 'Camel', price: 248, img: 'assets/img/products/w1a.svg', kind: 'coat' },
      { id: 'w1b', name: 'Cashmere Turtleneck Knit', colour: 'Ivory', price: 89, img: 'assets/img/products/w1b.svg', kind: 'knit' },
      { id: 'w1c', name: 'Tailored Wool Trouser', colour: 'Black', price: 128, img: 'assets/img/products/w1c.svg', kind: 'trouser' },
    ],
  },
  {
    id: 'w2', gender: 'women', index: 2, name: 'The Satin Midi',
    tagline: 'Bias-cut satin, worn late.',
    desc: 'A bias-cut slip in liquid champagne satin, belted low and worn with barely-there mules. One piece, fully dressed.',
    model: { w: 'assets/img/cut/women-2.png', name: 'Yuna', height: "5'8\"", wears: 'XS' },
    turntable: false,
    fabric: '100% mulberry silk satin, 19 momme. Dry clean only. Belt in full-grain leather — wipe with a soft dry cloth.',
    fit: "Model is 5'8\" and wears size XS. The slip runs bias, so it skims rather than grips — take your true size. Length sits mid-calf.",
    colours: [
      { id: 'champagne', name: 'Champagne', hex: '#d9c3a5', filter: "none", delta: 0 },
      { id: 'black', name: 'Black', hex: '#211f1d', filter: "grayscale(.95) brightness(.48) contrast(1.12)", delta: 0 },
      { id: 'espresso', name: 'Espresso', hex: '#49311f', filter: "saturate(1.25) brightness(.55) sepia(.3) contrast(1.05)", delta: 15 },
    ],
    pieces: [
      { id: 'w2a', name: 'Bias-Cut Satin Slip Midi', colour: 'Champagne', price: 188, img: 'assets/img/products/w2a.svg', kind: 'dress' },
      { id: 'w2b', name: 'Full-Grain Leather Belt', colour: 'Black', price: 58, img: 'assets/img/products/w2b.svg', kind: 'belt' },
    ],
  },
  {
    id: 'w3', gender: 'women', index: 3, name: 'The Suede Shacket',
    tagline: 'The layer you reach for first.',
    desc: 'A boxy suede shacket over crisp poplin, with straight ecru trousers. Built for cold mornings and warm offices.',
    model: { w: 'assets/img/cut/women-3.png', name: 'Ines', height: "5'9\"", wears: 'S' },
    turntable: false,
    fabric: 'Shacket in goat suede, suede-protectant spray recommended, spot clean only. Poplin shirt in 100% organic cotton — machine wash cold. Trouser in brushed cotton twill — wash cold, line dry.',
    fit: "Model is 5'9\" and wears size S. The shacket is intentionally boxy with a cropped body; poplin and trouser are true to size.",
    colours: [
      { id: 'tobacco', name: 'Tobacco', hex: '#8a5a33', filter: "none", delta: 0 },
      { id: 'olive', name: 'Olive', hex: '#6b6a4e', filter: "hue-rotate(34deg) saturate(.6) brightness(.95)", delta: 0 },
      { id: 'black', name: 'Black', hex: '#211f1d', filter: "grayscale(.95) brightness(.48) contrast(1.12)", delta: 20 },
    ],
    pieces: [
      { id: 'w3a', name: 'Boxy Goat-Suede Shacket', colour: 'Tobacco', price: 228, img: 'assets/img/products/w3a.svg', kind: 'jacket' },
      { id: 'w3b', name: 'Crisp Poplin Shirt', colour: 'White', price: 78, img: 'assets/img/products/w3b.svg', kind: 'shirt' },
      { id: 'w3c', name: 'Straight Ecru Trouser', colour: 'Ecru', price: 112, img: 'assets/img/products/w3c.svg', kind: 'trouser' },
    ],
  },
  {
    id: 'w4', gender: 'women', index: 4, name: 'The Ribbed Set',
    tagline: 'One texture, head to toe.',
    desc: 'A fine-rib knit shell and matching wide trouser in oat. Seamless, soft, and entirely everyday.',
    model: { w: 'assets/img/cut/women-4.png', name: 'Marisol', height: "5'7\"", wears: 'XS' },
    turntable: false,
    fabric: 'Fine-rib knit in 70% Tencel, 30% organic cotton. Machine wash cold inside a laundry bag, dry flat. Do not tumble dry or bleach.',
    fit: "Model is 5'7\" and wears size XS. Both pieces are slim with a high waist; take your true size for a close fit, size up for drape.",
    colours: [
      { id: 'oat', name: 'Oat', hex: '#d8cfc0', filter: "none", delta: 0 },
      { id: 'charcoal', name: 'Charcoal', hex: '#3a3835', filter: "grayscale(.95) brightness(.48) contrast(1.12)", delta: 0 },
      { id: 'burgundy', name: 'Burgundy', hex: '#6e2f35', filter: "hue-rotate(-24deg) saturate(1.9) brightness(.7)", delta: 10 },
    ],
    pieces: [
      { id: 'w4a', name: 'Fine-Rib Knit Shell', colour: 'Oat', price: 68, img: 'assets/img/products/w4a.svg', kind: 'knit' },
      { id: 'w4b', name: 'Wide-Leg Ribbed Trouser', colour: 'Oat', price: 88, img: 'assets/img/products/w4b.svg', kind: 'trouser' },
    ],
  },
  {
    id: 'w5', gender: 'women', index: 5, name: 'The Linen Blazer',
    tagline: 'Soft tailoring, noon light.',
    desc: 'An unstructured linen blazer, silk camisole and tailored midi skirt in sand. Tailoring that breathes.',
    model: { w: 'assets/img/cut/women-5.png', name: 'Freja', height: "5'9\"", wears: 'S' },
    turntable: false,
    fabric: 'Blazer and skirt in stonewashed European flax linen — gentle cold wash or dry clean, cool iron with a cloth. Camisole in washed silk — dry clean only.',
    fit: "Model is 5'9\" and wears size S. The blazer is unlined with a soft, extended shoulder; the skirt sits at the natural waist, mid-calf.",
    colours: [
      { id: 'sand', name: 'Sand', hex: '#cbb694', filter: "none", delta: 0 },
      { id: 'ink', name: 'Ink', hex: '#23252b', filter: "saturate(.2) brightness(.38) contrast(1.15)", delta: 0 },
      { id: 'moss', name: 'Moss', hex: '#5f6350', filter: "hue-rotate(42deg) saturate(.6) brightness(.8)", delta: 10 },
    ],
    pieces: [
      { id: 'w5a', name: 'Unstructured Linen Blazer', colour: 'Sand', price: 218, img: 'assets/img/products/w5a.svg', kind: 'blazer' },
      { id: 'w5b', name: 'Washed Silk Camisole', colour: 'Ivory', price: 64, img: 'assets/img/products/w5b.svg', kind: 'top' },
      { id: 'w5c', name: 'Tailored Linen Midi Skirt', colour: 'Sand', price: 98, img: 'assets/img/products/w5c.svg', kind: 'skirt' },
    ],
  },
  {
    id: 'w6', gender: 'women', index: 6, name: 'The Baggy Denim',
    tagline: 'Volume denim, off-duty.',
    desc: 'Baggy selvedge denim, a boxy tee and a satin bomber, finished with suede ankle boots. The weekend, considered.',
    model: { w: 'assets/img/cut/women-6.png', name: 'Nia', height: "5'8\"", wears: 'M' },
    turntable: false,
    fabric: 'Denim in 14.5oz Japanese selvedge — wash inside out, cold, hang dry. Tee in heavyweight organic cotton. Bomber in recycled satin. Boots in calf suede — protective spray, brush after wear.',
    fit: "Model is 5'8\" and wears size M. Denim is baggy with a dropped rise and tapered ankle; tee and bomber are boxy. Boots are true to size.",
    colours: [
      { id: 'indigo', name: 'Indigo', hex: '#2e3a52', filter: "none", delta: 0 },
      { id: 'washed', name: 'Washed Black', hex: '#2a2826', filter: "grayscale(.9) brightness(.3) contrast(1.05)", delta: 0 },
      { id: 'ecru', name: 'Ecru', hex: '#ded6c8', filter: "saturate(.34) brightness(1.22) sepia(.16) contrast(.94)", delta: 0 },
    ],
    pieces: [
      { id: 'w6a', name: 'Baggy Selvedge Denim', colour: 'Indigo', price: 138, img: 'assets/img/products/w6a.svg', kind: 'trouser' },
      { id: 'w6b', name: 'Boxy Heavyweight Tee', colour: 'White', price: 28, img: 'assets/img/products/w6b.svg', kind: 'top' },
      { id: 'w6c', name: 'Satin Bomber Jacket', colour: 'Black', price: 158, img: 'assets/img/products/w6c.svg', kind: 'jacket' },
      { id: 'w6d', name: 'Suede Ankle Boot', colour: 'Tan', price: 248, img: 'assets/img/products/w6d.svg', kind: 'shoeW' },
    ],
  },
  {
    id: 'm1', gender: 'men', index: 1, name: 'The Evening Blazer',
    tagline: 'Dinner after dark.',
    desc: 'An Italian wool blazer over black merino, with pleated charcoal trousers and derbies. Evening, without a tie.',
    model: { w: 'assets/img/cut/men-1.png', name: 'Arjun', height: "6'1\"", wears: 'M' },
    turntable: true,
    fabric: 'Blazer in Italian 12.5oz wool (Vitale Barberis), half-canvas — dry clean. Turtleneck in extra-fine merino — hand wash cold, dry flat. Trousers — dry clean or cold gentle cycle, cool iron.',
    fit: "Model is 6'1\" and wears size M. The blazer is tailored with a natural shoulder and soft lapel; the trouser is pleated with a tapered leg. Take your true size.",
    colours: [
      { id: 'charcoal', name: 'Charcoal', hex: '#35342f', filter: "none", delta: 0 },
      { id: 'navy', name: 'Navy', hex: '#232a38', filter: "hue-rotate(175deg) saturate(.55) brightness(.65)", delta: 0 },
      { id: 'camel', name: 'Camel', hex: '#b0824f', filter: "grayscale(1) brightness(1.5) sepia(.5) saturate(2) contrast(.92)", delta: 25 },
    ],
    pieces: [
      { id: 'm1a', name: 'Italian Wool Blazer', colour: 'Charcoal', price: 258, img: 'assets/img/products/m1a.svg', kind: 'blazer' },
      { id: 'm1b', name: 'Extra-Fine Merino Turtleneck', colour: 'Black', price: 88, img: 'assets/img/products/m1b.svg', kind: 'knit' },
    ],
  },
  {
    id: 'm2', gender: 'men', index: 2, name: 'The Knit Polo',
    tagline: 'Off duty, with intention.',
    desc: 'A tobacco knit polo tucked into stone pleats. The Sunday reservation, handled.',
    model: { w: 'assets/img/cut/men-2.png', name: 'Luca', height: "6'0\"", wears: 'M' },
    turntable: false,
    fabric: 'Polo in cotton-silk knit — hand wash cold, dry flat. Trousers in pleated wool-blend twill — dry clean recommended, cool iron over a cloth.',
    fit: "Model is 6'0\" and wears size M. The polo is a slim knit with a tidy collar; trouser is pleated with a tapered ankle and sits at the natural waist.",
    colours: [
      { id: 'tobacco', name: 'Tobacco', hex: '#8a5a33', filter: "none", delta: 0 },
      { id: 'ecru', name: 'Ecru', hex: '#e3dbc9', filter: "saturate(.34) brightness(1.22) sepia(.16) contrast(.94)", delta: 0 },
      { id: 'black', name: 'Black', hex: '#201e1c', filter: "grayscale(.95) brightness(.48) contrast(1.12)", delta: 0 },
    ],
    pieces: [
      { id: 'm2a', name: 'Cotton-Silk Knit Polo', colour: 'Tobacco', price: 78, img: 'assets/img/products/m2a.svg', kind: 'knit' },
      { id: 'm2b', name: 'Pleated Stone Trouser', colour: 'Stone', price: 128, img: 'assets/img/products/m2b.svg', kind: 'trouser' },
    ],
  },
  {
    id: 'm3', gender: 'men', index: 3, name: 'The Chore Jacket',
    tagline: 'Workwear, refined.',
    desc: 'A moss chore jacket over heavyweight cotton, with fatigue trousers. Built to work, cut to last.',
    model: { w: 'assets/img/cut/men-3.png', name: 'Dele', height: "6'2\"", wears: 'L' },
    turntable: false,
    fabric: 'Chore jacket in 12oz cotton moleskin with triple-stitched seams — machine wash cold, hang dry. Tee in 240gsm organic cotton. Fatigue trouser in brushed twill — wash cold.',
    fit: "Model is 6'2\" and wears size L. The jacket is boxy by design with a cropped body; trousers are relaxed with a straight leg. Take your true size.",
    colours: [
      { id: 'moss', name: 'Moss', hex: '#5c614b', filter: "none", delta: 0 },
      { id: 'khaki', name: 'Khaki', hex: '#a4956f', filter: "hue-rotate(28deg) saturate(.5) brightness(1.4) sepia(.3)", delta: 0 },
      { id: 'ink', name: 'Ink', hex: '#1f2226', filter: "grayscale(.85) brightness(.45) contrast(1.1)", delta: 15 },
    ],
    pieces: [
      { id: 'm3a', name: 'Cotton Moleskin Chore Jacket', colour: 'Moss', price: 148, img: 'assets/img/products/m3a.svg', kind: 'jacket' },
      { id: 'm3b', name: 'Heavyweight Cotton Tee', colour: 'White', price: 32, img: 'assets/img/products/m3b.svg', kind: 'top' },
      { id: 'm3c', name: 'Relaxed Fatigue Trouser', colour: 'Ecru', price: 98, img: 'assets/img/products/m3c.svg', kind: 'trouser' },
    ],
  },
  {
    id: 'm4', gender: 'men', index: 4, name: 'The Selvedge Denim',
    tagline: 'The everyday foundation.',
    desc: 'Baggy selvedge, a rolled oxford and white court sneakers. Nothing more required.',
    model: { w: 'assets/img/cut/men-4.png', name: 'Ren', height: "5'11\"", wears: 'M' },
    turntable: false,
    fabric: 'Denim in 14oz Japanese selvedge, rope-dyed indigo — wash inside out, cold, hang dry. Oxford in organic cotton oxford. Sneakers in white leather — wipe clean, cedar trees overnight.',
    fit: "Model is 5'11\" and wears size M. Denim is baggy with a stacked ankle; the oxford is a classic athletic fit. Sneakers run true to size — take your normal UK/US size.",
    colours: [
      { id: 'indigo', name: 'Indigo', hex: '#2d3850', filter: "none", delta: 0 },
      { id: 'washed', name: 'Washed', hex: '#55606f', filter: "brightness(1.55) saturate(.55) contrast(.9)", delta: 0 },
      { id: 'ecru', name: 'Ecru', hex: '#ded6c8', filter: "saturate(.34) brightness(1.22) sepia(.16) contrast(.94)", delta: 0 },
    ],
    pieces: [
      { id: 'm4a', name: 'Baggy Selvedge Denim', colour: 'Indigo', price: 148, img: 'assets/img/products/m4a.svg', kind: 'trouser' },
      { id: 'm4b', name: 'Organic Oxford Shirt', colour: 'White', price: 88, img: 'assets/img/products/m4b.svg', kind: 'shirt' },
      { id: 'm4c', name: 'White Leather Court Sneaker', colour: 'White', price: 168, img: 'assets/img/products/m4c.svg', kind: 'shoeM' },
    ],
  },
  {
    id: 'm5', gender: 'men', index: 5, name: 'The Suede Racer',
    tagline: 'After the weekend, before midnight.',
    desc: 'An espresso suede racer over black merino, with charcoal wool. The leather jacket, grown up.',
    model: { w: 'assets/img/cut/men-5.svg', name: 'Tiago', height: "6'0\"", wears: 'M' },
    turntable: false,
    fabric: 'Racer in goat suede — protective spray before first wear, brush regularly, spot clean. Turtleneck in extra-fine merino. Trousers in Italian wool twill — dry clean.',
    fit: "Model is 6'0\" and wears size M. The racer is cut trim through the body with a short hem; take your true size. Trouser is slim with a clean taper.",
    colours: [
      { id: 'espresso', name: 'Espresso', hex: '#463024', filter: "none", delta: 0 },
      { id: 'black', name: 'Black', hex: '#211f1d', filter: "grayscale(.95) brightness(.48) contrast(1.12)", delta: 20 },
      { id: 'olive', name: 'Olive', hex: '#57583f', filter: "hue-rotate(48deg) saturate(.6) brightness(1.15)", delta: 0 },
    ],
    pieces: [
      { id: 'm5a', name: 'Goat-Suede Racer Jacket', colour: 'Espresso', price: 298, img: 'assets/img/products/m5a.svg', kind: 'jacket' },
      { id: 'm5b', name: 'Extra-Fine Merino Turtleneck', colour: 'Black', price: 76, img: 'assets/img/products/m5b.svg', kind: 'knit' },
      { id: 'm5c', name: 'Slim Charcoal Wool Trouser', colour: 'Charcoal', price: 132, img: 'assets/img/products/m5c.svg', kind: 'trouser' },
    ],
  },
  {
    id: 'm6', gender: 'men', index: 6, name: 'The Linen Suit',
    tagline: 'The summer case, out of season.',
    desc: 'An unstructured sand linen blazer and matching trouser over bone. Soft, warm, unforced.',
    model: { w: 'assets/img/cut/men-6.svg', name: 'Felix', height: "6'1\"", wears: 'L' },
    turntable: false,
    fabric: 'Blazer and trouser in stonewashed European flax linen — gentle cold wash or dry clean, cool iron over a cloth. Linen creases are part of the language.',
    fit: "Model is 6'1\" and wears size L. The blazer is unlined with a soft, extended shoulder; the trouser is a relaxed straight leg with a drawstring waist.",
    colours: [
      { id: 'sand', name: 'Sand', hex: '#c8b28c', filter: "none", delta: 0 },
      { id: 'navy', name: 'Navy', hex: '#26303f', filter: "saturate(1.5) brightness(.42) hue-rotate(185deg)", delta: 0 },
      { id: 'stone', name: 'Stone', hex: '#d5cdbd', filter: "saturate(.34) brightness(1.22) sepia(.16) contrast(.94)", delta: 10 },
    ],
    pieces: [
      { id: 'm6a', name: 'Unstructured Linen Blazer', colour: 'Sand', price: 228, img: 'assets/img/products/m6a.svg', kind: 'blazer' },
      { id: 'm6b', name: 'Relaxed Linen Trouser', colour: 'Sand', price: 118, img: 'assets/img/products/m6b.svg', kind: 'trouser' },
    ],
  },
];

const LOOKS_BY_ID = Object.fromEntries(LOOKS.map(l => [l.id, l]));

function lookTotal(look, colourId) {
  const base = look.pieces.reduce((s, p) => s + p.price, 0);
  const cw = look.colours.find(c => c.id === colourId) || look.colours[0];
  return base + (cw.delta || 0);
}

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('en-US');
}

/* size range for a piece */
function sizeRangeFor(piece, gender) {
  const key = piece.kind === 'shoeW' ? 'shoeW' : piece.kind === 'shoeM' ? 'shoeM' : gender;
  return SIZES[key];
}

/* window scope for non-module scripts */
window.LINEUP = { LOOKS, LOOKS_BY_ID, lookTotal, formatPrice, sizeRangeFor };
