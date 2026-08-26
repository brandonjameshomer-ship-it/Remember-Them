# Remember Them — memorial designer

A browsable set of memorial types, each with its own designer, for families who
would rather take their time than be walked through a catalogue.

Open `index.html`. That is the whole install — no build step, no package
manager, no server. Every page is plain HTML, CSS and JavaScript, so it can be
hosted anywhere or lifted into a Shopify theme as assets.

```
index.html            the eight memorial types
designer.html         the designer, opened as designer.html?type=upright
assets/
  data/catalog.js     categories, granites, lettering, artwork, designer rules
  data/examples.js    reference photographs, per type, imported from Drive
  js/shapes.js        monument shapes, as front elevations in inches
  js/render.js        turns a design into SVG
  js/designer.js      the controls and the export tools
  js/gallery.js       the index of types
  js/examples.js      the examples strip and its lightbox
  js/analytics.js     one documented event, with no family's words in it
  css/               site and designer styles
docs/
  CATALOG.md          how to add a type, a granite, a shape or a piece of artwork
  DRIVE-SYNC.md       how to bring photographs in from Google Drive
tools/
  drive-folders.json  which Drive folder feeds which memorial type
  import-drive.js     turns a folder listing into assets/data/examples.js
```

## What a family can do

Pick a shape, a size, a granite and a lettering style; write the names, the
dates and an epitaph; place sandblast artwork; add vases. The stone redraws as
they go. When they are ready they can print a proof, save it as an image, save
the design to their own computer to open later, or copy a link that reopens the
exact design for someone else in the family.

Nothing is transmitted anywhere. The working design lives in that browser's own
storage on that device, and it stays there until they choose to send it.

## What it deliberately does not do

- No prices to the dollar. Relative investment bands only, because a memorial
  is quoted after a conversation, not before one.
- No cart, no checkout, no inventory, no "sold out", no stock counts.
- No countdown, no scarcity, no "limited time", nothing that adds pressure to
  a decision that should not be hurried.
- No claim about what a cemetery permits. Every type says plainly that the
  cemetery decides, and says it before the browsing rather than after.

## Adding to it

Almost everything is data. A new memorial type is one object in
`assets/data/catalog.js` and it gets a working designer with no code changes.
See `docs/CATALOG.md`.

## Browser support

Anything current. It uses `URLSearchParams`, `fetch`, `canvas.toBlob` and CSS
grid. Saving as an image needs a browser that can draw an SVG to a canvas;
where that fails the designer says so and printing a proof still works.
