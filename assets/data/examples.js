/* =============================================================================
 * Remember Them - reference examples
 * -----------------------------------------------------------------------------
 * One entry per memorial type, each pointing at the Google Drive folder its
 * photographs come from. Keeping this separate from catalog.js means a photo
 * import never has to touch the designer's own configuration.
 *
 * These are examples of work, not products. No prices, no inventory, no
 * add-to-cart anywhere near them.
 *
 * To fill this in, see docs/DRIVE-SYNC.md.
 * =========================================================================== */

window.RT_EXAMPLES = {
  version: 1,

  /* Where the photographs live. */
  source: {
    name: 'Memorial Options',
    id: '1P4JZ8GzZFylcqwEfBX4H18bM5Y5vuJYF',
    url: 'https://drive.google.com/drive/folders/1P4JZ8GzZFylcqwEfBX4H18bM5Y5vuJYF'
  },

  /* categoryId -> { driveFolder, examples[] }
   *
   * An example looks like this:
   *   {
   *     id: 'upright-001',
   *     image: 'assets/img/upright/upright-001.jpg',
   *     alt: 'Serpentine-top upright in dark granite with a carved rose.',
   *     configuration: 'companion',        // individual | companion | family
   *     granite: 'Jet Black',              // as the family would hear it named
   *     shape: 'serp-top',                 // optional, matches a shape id
   *     size: '36" x 24" x 8"',
   *     features: ['laser etching', 'vase'],
   *     notes: 'Optional one-liner.'
   *   }
   *
   * An empty examples array is fine - the designer simply does not show the
   * examples strip for that type.
   */
  categories: {
    'slant-pillow': { driveFolder: null, examples: [] },
    'upright':      { driveFolder: null, examples: [] },
    'flat':         { driveFolder: null, examples: [] },
    'sculpture':    { driveFolder: null, examples: [] },
    'bench':        { driveFolder: null, examples: [] },
    'ledger':       { driveFolder: null, examples: [] },
    'unique':       { driveFolder: null, examples: [] },
    'estate':       { driveFolder: null, examples: [] }
  }
};
