# Editing the catalog

Everything the designer offers lives in `assets/data/catalog.js`. It is plain
data. Edit it in any text editor, save, reload the page.

It is a `.js` file rather than `.json` only so the site opens straight from the
filesystem without a web server. Inside, it is ordinary JSON.

---

## Add a memorial type

Append an object to `categories`. This is the whole contract — a type with
these fields gets a working designer and a card on the index with no code
changes anywhere.

```js
{
  id: 'cremation-pedestal',        // url-safe, used in designer.html?type=
  order: 9,                        // where it sits on the index page
  name: 'Cremation Pedestals',
  short_description: 'One sentence, plain language.',
  long_description: '100-150 words. What it is, who it suits, where it is allowed.',
  cemetery_note: 'What this type runs into with cemeteries.',
  typical_price_band: 'moderate',  // an id from meta.priceBands
  typical_lead_time: '3-4 months',
  driveFolder: { name: null, id: null },
  designer: {
    shapes: ['flat-top', 'oval-top'],   // ids from assets/js/shapes.js
    defaults: {
      shape: 'flat-top', widthIn: 16, heightIn: 30, thicknessIn: 12,
      granite: 'barre-gray', font: 'roman', base: true
    },
    size: {
      widthIn:  { min: 12, max: 30, step: 2 },
      heightIn: { min: 20, max: 48, step: 2 }
    },
    features: ['vase', 'laser-etching'],  // keys from the features table
    allowBase: true
  },
  examples: []
}
```

`defaults.shape` must appear in `shapes`, and `defaults.widthIn` /
`heightIn` must fall inside `size` — otherwise the sliders open at a value
they cannot represent.

## Add a granite

Append to `granites`.

```js
{ id: 'oakwood', name: 'Oakwood', category: 2,
  face: '#6a5a4a', speck: '#4b3f34', letter: '#efe7dd', grain: 'medium' }
```

- `face` is the polished stone.
- `speck` is the grain flecked through it.
- `letter` is how frosted lettering reads against that face. Sandblasted
  letters are always **lighter** than the polished surface, on every colour —
  near-white on black granite, only slightly lighter on a pale grey.
- `grain` is `none`, `fine`, `medium` or `coarse`.
- `category` is the wholesale colour group. 1 is the most economical.

## Add a lettering style

Append to `fonts`. `caps: true` means the style is only ever cut in capitals.
`tracking` is letter-spacing as a fraction of the size — Roman wants a lot of
it, Script wants none.

If the face is a web font, add it to the `fonts.googleapis.com` link in both
`index.html` and `designer.html`, keeping the `data-webfonts` attribute — that
attribute is how the PNG export finds the fonts to embed.

## Add artwork

Append to `motifs`. The path is a silhouette on a `0 0 100 100` grid, which is
close to how the stencil is actually cut. It does not need to fill the grid —
the renderer measures each piece and scales it so every motif lands the same
visual weight.

```js
{ id: 'compass', name: 'Compass', group: 'Symbols', path: 'M50 6 ...' }
```

`group` only shows in the button's tooltip; artwork is not filtered by it yet.

## Add a shape

Shapes are geometry, so they live in `assets/js/shapes.js`. Add one entry to
the `SHAPES` table:

```js
'my-shape': {
  name: 'My Shape',
  sits: 'base',              // 'base' if it stands on a granite base, else 'ground'
  build: function (w, h) {
    return {
      parts: [{ d: rect(0, 0, w, h), kind: 'stone' }],
      text: { x: w * 0.08, y: h * 0.10, w: w * 0.84, h: h * 0.80 }
    };
  }
}
```

`build` works in inches with `(0,0)` at the top-left of the stone.

- `parts` draw back to front. `kind` is `stone` (takes the granite),
  `polish` (a lighter panel), `accent` (a darker recess) or `score` (a cut
  line, stroked not filled).
- `text` is the rectangle the inscription may occupy. Get this wrong and
  lettering runs off the stone — there is no clipping, deliberately, because
  silently cropping a name is worse than showing it overflowing.
- `wings` is optional, and only for monuments with side panels that carry
  their own names.

Then list the shape's id in the `designer.shapes` array of every category that
should offer it.
