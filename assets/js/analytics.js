/* =============================================================================
 * Remember Them - analytics
 * -----------------------------------------------------------------------------
 * One event name, a set of documented interaction values. Everything pushes to
 * window.dataLayer, so a tag manager can pick it up without another script.
 *
 *   dataLayer.push({
 *     event:        'memorial_designer_interaction',
 *     interaction:  'category_click' | 'designer_open' | 'shape_change'
 *                 | 'granite_change'  | 'font_change'  | 'motif_change'
 *                 | 'option_change'   | 'export_png'   | 'print_proof'
 *                 | 'save_design'     | 'load_design'  | 'share_link'
 *                 | 'reset_design'    | 'cta_click',
 *     category_id:  'upright',
 *     detail:       'serp-top',       // the value chosen, never free text
 *     value:        36                // a number where one applies
 *   })
 *
 * NEVER send a name, a date of death, an epitaph, an email address, a phone
 * number or a cemetery through this. Those belong to the family, not to us.
 * =========================================================================== */
(function (global) {
  'use strict';

  var ALLOWED = {
    category_click: 1, designer_open: 1, shape_change: 1, granite_change: 1,
    font_change: 1, motif_change: 1, option_change: 1, size_change: 1,
    export_png: 1, print_proof: 1, save_design: 1, load_design: 1,
    share_link: 1, reset_design: 1, cta_click: 1
  };

  function track(interaction, categoryId, detail, value) {
    if (!ALLOWED[interaction]) return;
    global.dataLayer = global.dataLayer || [];
    var payload = {
      event: 'memorial_designer_interaction',
      interaction: interaction,
      category_id: categoryId || null
    };
    /* Only ever pass through short identifiers - never anything a family typed. */
    if (detail != null && /^[a-z0-9_-]{1,40}$/i.test(String(detail))) payload.detail = String(detail);
    if (typeof value === 'number' && isFinite(value)) payload.value = value;
    global.dataLayer.push(payload);
  }

  global.RT_TRACK = track;
})(typeof window !== 'undefined' ? window : globalThis);
