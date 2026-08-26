/* =============================================================================
 * Remember Them - Memorial Catalog
 * -----------------------------------------------------------------------------
 * This file is the single source of truth for the designer and the gallery.
 * It is plain data. Edit it like JSON - no build step, no tooling required.
 *
 * It is assigned to a global rather than stored as .json so the site opens
 * straight from the filesystem (double-click index.html) without a server and
 * without tripping CORS. Dropping it into a Shopify theme as an asset works the
 * same way.
 *
 * HOW TO ADD A CATEGORY .... see docs/CATALOG.md
 * HOW TO ADD AN EXAMPLE .... see docs/CATALOG.md
 * =========================================================================== */

window.RT_CATALOG = {
  meta: {
    brand: 'Remember Them',
    tagline: 'Take the time you need.',
    /* Relative investment bands. Deliberately not dollar figures - this is a
     * browsing and design tool, not a storefront. */
    priceBands: [
      { id: 'lower',    label: 'Lower',        order: 1 },
      { id: 'moderate', label: 'Moderate',     order: 2 },
      { id: 'higher',   label: 'Higher',       order: 3 },
      { id: 'premium',  label: 'Premium',      order: 4 },
      { id: 'custom',   label: 'Highly custom', order: 5 }
    ]
  },

  /* ---------------------------------------------------------------------------
   * Granite. `face` is the polished stone. `letter` is how sandblasted or
   * etched lettering reads against it - frosted lettering is always lighter
   * than the polished face it sits in.
   * `category` is the wholesale color group (1 = most economical).
   * ------------------------------------------------------------------------ */
  granites: [
    { id: 'georgia-gray',    name: 'Georgia Gray',     category: 1, face: '#8b8d88', speck: '#6f716d', letter: '#e6e7e4', grain: 'fine'   },
    { id: 'barre-gray',      name: 'Barre Gray',       category: 1, face: '#9a9c99', speck: '#7c7e7b', letter: '#f0f1ef', grain: 'fine'   },
    { id: 'sierra-white',    name: 'Sierra White',     category: 1, face: '#b9b8b3', speck: '#8e8d88', letter: '#f7f7f5', grain: 'coarse' },
    { id: 'jet-black',       name: 'Jet Black',        category: 3, face: '#141414', speck: '#242424', letter: '#f2f2f2', grain: 'none'   },
    { id: 'india-red',       name: 'India Red',        category: 2, face: '#6d2b2b', speck: '#4f1d1d', letter: '#e9d7d2', grain: 'medium' },
    { id: 'missouri-red',    name: 'Missouri Red',     category: 2, face: '#8c4436', speck: '#6a3128', letter: '#f0ddd6', grain: 'coarse' },
    { id: 'dakota-mahogany', name: 'Dakota Mahogany',  category: 2, face: '#6b4436', speck: '#4d3027', letter: '#ecdcd3', grain: 'medium' },
    { id: 'bahama-blue',     name: 'Bahama Blue',      category: 2, face: '#5a6470', speck: '#434b55', letter: '#e4e9ee', grain: 'medium' },
    { id: 'blue-pearl',      name: 'Blue Pearl',       category: 3, face: '#3d4756', speck: '#5b6a80', letter: '#e2e7ee', grain: 'medium' },
    { id: 'emerald-pearl',   name: 'Emerald Pearl',    category: 4, face: '#25342e', speck: '#3d5a4a', letter: '#dfe8e3', grain: 'medium' },
    { id: 'paradiso',        name: 'Paradiso',         category: 3, face: '#6f5f66', speck: '#4d4048', letter: '#eee6ea', grain: 'coarse' },
    { id: 'morning-rose',    name: 'Morning Rose',     category: 2, face: '#9c7b78', speck: '#7a5c59', letter: '#f6ecea', grain: 'medium' },
    { id: 'salisbury-pink',  name: 'Salisbury Pink',   category: 2, face: '#a98784', speck: '#856663', letter: '#f7edec', grain: 'coarse' },
    { id: 'autumn-brown',    name: 'Autumn Brown',     category: 2, face: '#5f4a3c', speck: '#45342a', letter: '#ebe0d7', grain: 'fine'   }
  ],

  /* ---------------------------------------------------------------------------
   * Lettering. Monument shops still talk in these terms, so families see the
   * same words their memorial counselor uses.
   * ------------------------------------------------------------------------ */
  fonts: [
    { id: 'roman',       name: 'Roman',        stack: '"Cinzel", "Trajan Pro", Georgia, serif',              caps: true,  weight: 500, tracking: 0.08 },
    { id: 'modern-roman',name: 'Modern Roman', stack: '"Cormorant Garamond", Georgia, "Times New Roman", serif', caps: true, weight: 600, tracking: 0.06 },
    { id: 'old-english', name: 'Old English',  stack: '"UnifrakturCook", "Old English Text MT", serif',      caps: false, weight: 700, tracking: 0.02 },
    { id: 'script',      name: 'Script',       stack: '"Pinyon Script", "Edwardian Script ITC", cursive',    caps: false, weight: 400, tracking: 0.00 },
    { id: 'block',       name: 'Block',        stack: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif', caps: true,  weight: 600, tracking: 0.12 }
  ],

  /* ---------------------------------------------------------------------------
   * Sandblast / etching art. Silhouette paths on a 0 0 100 100 viewBox, which
   * is how this artwork is actually cut - so what a family sees here is close
   * to what the stencil does.
   * ------------------------------------------------------------------------ */
  motifs: [
    { id: 'none', name: 'No artwork', group: 'None', path: '' },
    { id: 'cross-latin', name: 'Latin Cross', group: 'Faith',
      path: 'M43 6 h14 v24 h24 v14 h-24 v50 h-14 v-50 h-24 v-14 h24 z' },
    { id: 'cross-celtic', name: 'Celtic Cross', group: 'Faith',
      path: 'M44 4h12v18h26v12H56v60H44V34H18V22h26z M50 10a22 22 0 1 1-.1 0z M50 18a14 14 0 1 0 .1 0z' },
    { id: 'praying-hands', name: 'Praying Hands', group: 'Faith',
      path: 'M50 8c-6 6-12 16-14 28-2 12-2 26 0 38 1 8 4 14 8 18h12c4-4 7-10 8-18 2-12 2-26 0-38-2-12-8-22-14-28z M36 40c-5 4-8 12-8 22 0 12 3 22 8 30l6-2c-4-8-6-18-6-28 0-9 2-16 5-21z M64 40c5 4 8 12 8 22 0 12-3 22-8 30l-6-2c4-8 6-18 6-28 0-9-2-16-5-21z' },
    { id: 'star-of-david', name: 'Star of David', group: 'Faith',
      path: 'M50 6 L88 72 H12 Z M50 94 L12 28 H88 Z' },
    { id: 'lds-temple', name: 'Temple Spire', group: 'Faith',
      path: 'M50 4l4 10h-8zM48 14h4v14h-4zM30 30h40v8H30zM26 38h48v46H26zM34 46h8v30h-8zM46 46h8v30h-8zM58 46h8v30h-8zM18 84h64v10H18z' },
    { id: 'rose', name: 'Rose', group: 'Nature',
      path: 'M50 14c9 0 16 6 16 14s-7 15-16 15-16-7-16-15 7-14 16-14z M50 22c5 0 8 3 8 7s-3 7-8 7-8-3-8-7 3-7 8-7z M48 44h4v48h-4z M50 56c-10-4-20-2-24 6 8 6 19 4 24-2z M50 70c10-4 20-2 24 6-8 6-19 4-24-2z' },
    { id: 'lily', name: 'Lilies', group: 'Nature',
      path: 'M50 10c-4 10-12 16-22 18 10 4 18 12 22 22 4-10 12-18 22-22-10-2-18-8-22-18z M48 50h4v42h-4z M50 62c-8-3-16-1-20 5 7 5 16 3 20-1z M50 76c8-3 16-1 20 5-7 5-16 3-20-1z' },
    { id: 'wheat', name: 'Wheat', group: 'Nature',
      path: 'M48 20h4v72h-4z M50 22c-6 2-10 8-10 14 6 0 10-6 10-14z M50 22c6 2 10 8 10 14-6 0-10-6-10-14z M50 40c-6 2-10 8-10 14 6 0 10-6 10-14z M50 40c6 2 10 8 10 14-6 0-10-6-10-14z M50 58c-6 2-10 8-10 14 6 0 10-6 10-14z M50 58c6 2 10 8 10 14-6 0-10-6-10-14z' },
    { id: 'oak-leaf', name: 'Oak & Acorn', group: 'Nature',
      path: 'M50 8c-6 6-6 12-12 12-6 0-10-2-12 4 4 4 2 8-2 10 4 4 4 8 0 12 6 2 6 8 4 12 6 0 10 4 12 10 4-4 8-4 10-2V8z M50 8c6 6 6 12 12 12 6 0 10-2 12 4-4 4-2 8 2 10-4 4-4 8 0 12-6 2-6 8-4 12-6 0-10 4-12 10-4-4-8-4-10-2V8z' },
    { id: 'dove', name: 'Dove', group: 'Nature',
      path: 'M14 56c14-18 34-26 54-26 6 0 12 1 18 4-6 2-10 6-12 12 8 2 12 8 12 16-6-4-12-4-18-2-6 12-18 20-32 20-8 0-16-2-22-8 8 0 14-2 18-6-8-2-14-6-18-10z M74 32a3 3 0 1 1 .1 0z' },
    { id: 'mountains', name: 'Mountain Scene', group: 'Landscape',
      path: 'M4 84h92l-24-40-14 20-10-16-18 24-10-10z M70 12a10 10 0 1 1 .1 0z' },
    { id: 'pines', name: 'Pines', group: 'Landscape',
      path: 'M30 84h10V70h8L38 52h6L34 34h4L28 16 18 34h4L12 52h6L8 70h8v14z M70 84h10V72h7L76 56h5L70 40h4L66 24 58 40h4L52 56h5L46 72h7v12z M4 86h92v6H4z' },
    { id: 'deer', name: 'Buck', group: 'Landscape',
      path: 'M34 30c-4-8-2-16 2-20 2 6 6 8 8 12 4-4 8-4 12 0 2-4 6-6 8-12 4 4 6 12 2 20 4 4 6 10 6 16 0 14-10 24-22 24S28 60 28 46c0-6 2-12 6-16z M42 46a3 3 0 1 1 .1 0z M58 46a3 3 0 1 1 .1 0z M40 70h4v20h-4z M56 70h4v20h-4z' },
    { id: 'heart', name: 'Heart', group: 'Symbols',
      path: 'M50 88C24 68 10 54 10 38 10 26 20 16 32 16c8 0 14 4 18 10 4-6 10-10 18-10 12 0 22 10 22 22 0 16-14 30-40 50z' },
    { id: 'rings', name: 'Wedding Rings', group: 'Symbols',
      path: 'M36 30a26 26 0 1 0 .1 0z M36 40a16 16 0 1 1-.1 0z M64 30a26 26 0 1 0 .1 0z M64 40a16 16 0 1 1-.1 0z' },
    { id: 'flag', name: 'Service Flag', group: 'Veteran',
      path: 'M12 10h6v82h-6z M20 12h68v34H20z M20 12h30v18H20z M24 32h60v4H24z M24 40h60v4H24z' },
    { id: 'anchor', name: 'Anchor', group: 'Veteran',
      path: 'M46 8h8v10h-8z M50 4a8 8 0 1 1-.1 0z M46 20h8v66h-8z M28 30h44v8H28z M16 58c0 18 15 32 34 32s34-14 34-32h-9c0 13-11 23-25 23S25 71 25 58z' },
    { id: 'fish', name: 'Ichthys', group: 'Faith',
      path: 'M8 50c18-20 44-26 62-16 6-8 14-12 22-14-6 10-8 20-8 30s2 20 8 30c-8-2-16-6-22-14-18 10-44 4-62-16z' },
    { id: 'hummingbird', name: 'Hummingbird', group: 'Nature',
      path: 'M8 40c14 4 26 12 34 22 8-14 20-22 34-24-8 8-12 16-12 24 0 10 4 18 12 24-16 0-30-8-36-20-8 8-20 12-32 12 8-6 12-14 12-22 0-6-4-12-12-16z M74 30a3 3 0 1 1 .1 0z' }
  ],

  /* ---------------------------------------------------------------------------
   * Categories. Each one gets its own designer, driven entirely by the
   * `designer` block below. `driveFolder` records where the reference photos
   * for this category live so the two stay in step.
   * ------------------------------------------------------------------------ */
  categories: [
    {
      id: 'slant-pillow',
      order: 1,
      name: 'Slant & Pillow Markers',
      short_description: 'A low memorial that sits at an angle, readable from standing height.',
      long_description: 'A slant marker rests on the grave at an angle so the inscription faces someone standing in front of it. A pillow marker is its smaller, gently rounded cousin. Both sit low to the ground, which is why many cemeteries that will not permit an upright monument will permit these. They suit an individual or a couple, hold a full name, dates and a short line of verse comfortably, and are the most common choice for a first memorial in a lawn-style cemetery.',
      cemetery_note: 'Permitted at most cemeteries, including many that restrict uprights. Confirm the allowed size with your cemetery before you settle on one.',
      typical_price_band: 'lower',
      typical_lead_time: '3-4 months',
      driveFolder: { name: null, id: null },
      designer: {
        shapes: ['slant-flat', 'slant-serp', 'slant-oval', 'pillow', 'book'],
        defaults: { shape: 'slant-flat', widthIn: 24, heightIn: 16, thicknessIn: 10, granite: 'georgia-gray', font: 'roman', base: false },
        size: { widthIn: { min: 16, max: 44, step: 2 }, heightIn: { min: 10, max: 22, step: 1 } },
        features: ['vase', 'laser-etching', 'ceramic-photo', 'flower-accent'],
        allowBase: true
      },
      examples: []
    },
    {
      id: 'upright',
      order: 2,
      name: 'Upright Monuments',
      short_description: 'The traditional standing monument - a die on a base.',
      long_description: 'An upright monument is what most people picture: a standing tablet, called the die, set on a granite base. It carries the most lettering of any common memorial and is visible from across a cemetery, which matters to families who visit often. Uprights are made for one person, for a couple, or for a family, and they hold portrait etching, carved roses, scenes and scripture without feeling crowded. The size you can place is set by the cemetery, not by the monument.',
      cemetery_note: 'Many lawn-style and newer cemeteries do not allow uprights at all. Check first - this is the single most common surprise families run into.',
      typical_price_band: 'moderate',
      typical_lead_time: '4-6 months',
      driveFolder: { name: null, id: null },
      designer: {
        shapes: ['serp-top', 'half-serp', 'oval-top', 'flat-top', 'gothic', 'heart-die', 'cross-die'],
        defaults: { shape: 'serp-top', widthIn: 36, heightIn: 24, thicknessIn: 8, granite: 'georgia-gray', font: 'roman', base: true },
        size: { widthIn: { min: 20, max: 72, step: 2 }, heightIn: { min: 16, max: 48, step: 2 } },
        features: ['vase', 'laser-etching', 'ceramic-photo', 'carved-shape', 'flower-accent'],
        allowBase: true
      },
      examples: []
    },
    {
      id: 'flat',
      order: 3,
      name: 'Flat Markers',
      short_description: 'Set level with the ground, so mowers pass over it.',
      long_description: 'A flat marker lies flush with the turf. Cemeteries favour them because grounds crews can mow straight over the top, and many memorial parks permit nothing else. Granite flats are usually three or four inches thick with a polished top and a rock-pitched edge; bronze flats sit on a granite base. There is less room for lettering than on an upright, so the inscription is usually a name, two dates and a short line - which is often exactly what a family wants.',
      cemetery_note: 'Almost universally permitted. Cemeteries usually specify exact allowed sizes - 24x12 and 28x16 are the most common.',
      typical_price_band: 'lower',
      typical_lead_time: '2-4 months',
      driveFolder: { name: null, id: null },
      designer: {
        shapes: ['flat-rect', 'flat-bevel', 'pillow'],
        defaults: { shape: 'flat-rect', widthIn: 24, heightIn: 12, thicknessIn: 4, granite: 'georgia-gray', font: 'block', base: false },
        size: { widthIn: { min: 12, max: 44, step: 2 }, heightIn: { min: 8, max: 24, step: 2 } },
        features: ['vase', 'laser-etching', 'flower-accent'],
        allowBase: false
      },
      examples: []
    },
    {
      id: 'sculpture',
      order: 4,
      name: 'Sculpted Monuments',
      short_description: 'Dimensional carving or statuary worked into the monument itself.',
      long_description: 'A sculpted monument goes past lettering and etching into carving that has real depth - a rose worked in relief, a draped cross, a pair of hands, or a full statue standing beside the die. The work is done by hand by a carver, which is why it takes longer and costs more than a standard upright, and why no two are quite alike. Families usually come to this when the memorial is meant to say something a line of verse cannot.',
      cemetery_note: 'Height and footprint limits apply, and statuary is restricted in some cemeteries. Bring your design to the cemetery before it is cut.',
      typical_price_band: 'premium',
      typical_lead_time: '6-9 months',
      driveFolder: { name: null, id: null },
      designer: {
        shapes: ['serp-top', 'oval-top', 'flat-top', 'gothic', 'cross-die', 'heart-die'],
        defaults: { shape: 'oval-top', widthIn: 40, heightIn: 30, thicknessIn: 10, granite: 'india-red', font: 'modern-roman', base: true },
        size: { widthIn: { min: 24, max: 84, step: 2 }, heightIn: { min: 20, max: 60, step: 2 } },
        features: ['carved-shape', 'vase', 'laser-etching', 'ceramic-photo', 'flower-accent'],
        allowBase: true
      },
      examples: []
    },
    {
      id: 'bench',
      order: 5,
      name: 'Memorial Benches',
      short_description: 'A place to sit with them, not only a place to read a name.',
      long_description: 'A memorial bench does something no other memorial does: it invites the family to stay. The inscription goes on the seat front, on the back rest, or on the pedestal legs. Benches are cut as a solid granite seat on two pedestals, or with a full back. They are heavier and larger than an upright, so cemeteries treat them as a separate class - some place them only in designated areas, and some require the family to buy the adjacent space.',
      cemetery_note: 'Often restricted to specific sections, and some cemeteries require you to own the space beside the grave. Ask early.',
      typical_price_band: 'higher',
      typical_lead_time: '4-6 months',
      driveFolder: { name: null, id: null },
      designer: {
        shapes: ['bench-pedestal', 'bench-slab'],
        defaults: { shape: 'bench-pedestal', widthIn: 48, heightIn: 18, thicknessIn: 16, granite: 'barre-gray', font: 'modern-roman', base: false },
        size: { widthIn: { min: 36, max: 72, step: 2 }, heightIn: { min: 16, max: 22, step: 1 } },
        features: ['laser-etching', 'flower-accent'],
        allowBase: false
      },
      examples: []
    },
    {
      id: 'ledger',
      order: 6,
      name: 'Full Ledgers',
      short_description: 'Granite covering the length of the grave.',
      long_description: 'A ledger is a single slab that covers the full grave, sometimes flush with the ground and sometimes raised on a low granite curb. It gives the largest uninterrupted inscription surface of any memorial, which makes it the usual choice when a family wants a long passage, a poem, or the record of several people in one place. Because of the weight, ledgers need to be set on a proper foundation, and that work is arranged with the cemetery.',
      cemetery_note: 'Requires a foundation and cemetery approval of the footprint. Not permitted everywhere - confirm before design.',
      typical_price_band: 'higher',
      typical_lead_time: '4-6 months',
      driveFolder: { name: null, id: null },
      designer: {
        shapes: ['ledger-flat', 'ledger-curbed'],
        defaults: { shape: 'ledger-flat', widthIn: 36, heightIn: 84, thicknessIn: 4, granite: 'jet-black', font: 'modern-roman', base: false },
        size: { widthIn: { min: 30, max: 60, step: 2 }, heightIn: { min: 60, max: 96, step: 2 } },
        features: ['laser-etching', 'flower-accent'],
        allowBase: false
      },
      examples: []
    },
    {
      id: 'unique',
      order: 7,
      name: 'Unique Materials',
      short_description: 'Cast glass, bronze on stone, glass art and mosaic.',
      long_description: 'Not every memorial is granite alone. Cast glass panels set into a granite frame catch light in a way stone cannot. Bronze plaques mounted on a granite base carry a different weight and patina. Fused glass art, mosaic inlay and hand-painted ceramic portraits all belong here. These take longer because the glass or bronze is made to order and then fitted, and they need a maker who has done it before - but for a family who has looked at a hundred grey monuments and felt nothing, this is often the one.',
      cemetery_note: 'Some cemeteries restrict non-granite components. Bring the specification, not just a photograph.',
      typical_price_band: 'premium',
      typical_lead_time: '6-9 months',
      driveFolder: { name: null, id: null },
      designer: {
        shapes: ['serp-top', 'flat-top', 'oval-top', 'slant-flat', 'pillow'],
        defaults: { shape: 'flat-top', widthIn: 32, heightIn: 26, thicknessIn: 8, granite: 'jet-black', font: 'block', base: true },
        size: { widthIn: { min: 18, max: 60, step: 2 }, heightIn: { min: 14, max: 44, step: 2 } },
        features: ['glass-inlay', 'bronze-plaque', 'ceramic-photo', 'laser-etching', 'vase'],
        allowBase: true
      },
      examples: []
    },
    {
      id: 'estate',
      order: 8,
      name: 'Family Estate Monuments',
      short_description: 'A central monument for a family plot, with room for generations.',
      long_description: 'An estate monument marks a whole family plot rather than a single grave. The family name goes on the centre die, often on both faces, with individual names either on the wings of the monument or on companion markers set at each grave. These are designed as a group: the centre stone, the wings, sometimes a curb or corner posts. Because they are meant to serve people not yet born, the layout question that matters most is how many names still need to fit.',
      cemetery_note: 'Plot-wide approval is required and the footprint is measured against the plot you own. Start with the cemetery map.',
      typical_price_band: 'custom',
      typical_lead_time: '6-12 months',
      driveFolder: { name: null, id: null },
      designer: {
        shapes: ['estate-wings', 'serp-top', 'flat-top', 'gothic', 'oval-top'],
        defaults: { shape: 'estate-wings', widthIn: 60, heightIn: 36, thicknessIn: 12, granite: 'barre-gray', font: 'roman', base: true },
        size: { widthIn: { min: 40, max: 120, step: 4 }, heightIn: { min: 24, max: 72, step: 2 } },
        features: ['carved-shape', 'vase', 'laser-etching', 'flower-accent'],
        allowBase: true
      },
      examples: []
    }
  ],

  /* Optional add-ons, shown only when a category lists them in designer.features */
  features: {
    'vase':           { name: 'Granite vase',        note: 'Turned granite vase, set on the base or the marker.' },
    'laser-etching':  { name: 'Laser etching',       note: 'Photographic detail etched into polished black granite.' },
    'ceramic-photo':  { name: 'Ceramic photo',       note: 'Fired porcelain portrait, mounted into the face.' },
    'carved-shape':   { name: 'Dimensional carving', note: 'Hand-carved relief with real depth.' },
    'flower-accent':  { name: 'Flower accent',       note: 'Shaped and shaded floral work beside the lettering.' },
    'glass-inlay':    { name: 'Cast glass inlay',    note: 'Cast glass panel set into the granite face.' },
    'bronze-plaque':  { name: 'Bronze plaque',       note: 'Cast bronze plate mounted on granite.' }
  }
};
