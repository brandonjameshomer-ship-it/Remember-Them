/* =============================================================================
 * Remember Them - the index of memorial types
 * Builds one card per category in the catalog, each opening its own designer.
 * =========================================================================== */
(function () {
  'use strict';

  var CAT = window.RT_CATALOG;
  var SHAPES = window.RT_SHAPES;
  var track = window.RT_TRACK || function () {};

  function bandLabel(id) {
    for (var i = 0; i < CAT.meta.priceBands.length; i++) {
      if (CAT.meta.priceBands[i].id === id) return CAT.meta.priceBands[i].label;
    }
    return id;
  }

  /* The card shows the category's own default design, drawn by the same
   * renderer the designer uses - so what a family clicks is what they get.
   * No ground line and no placeholder lettering: at this size both are noise. */
  function thumb(cat) {
    var d = cat.designer.defaults;
    return window.RT_RENDER.render({
      categoryId: cat.id,
      shape: d.shape,
      widthIn: d.widthIn,
      heightIn: d.heightIn,
      thicknessIn: d.thicknessIn,
      granite: d.granite,
      font: d.font,
      base: !!d.base,
      motif: 'none',
      motifPos: 'top',
      vases: 'none',
      configuration: 'individual',
      family: '',
      people: [{ given: '', dates: '' }],
      epitaph: [],
      wingNames: [],
      features: []
    }, { ground: false, ghost: false });
  }

  function card(cat) {
    var li = document.createElement('li');
    li.className = 'type-card';
    li.innerHTML =
      '<div class="thumb">' + thumb(cat).replace('<svg ', '<svg aria-hidden="true" focusable="false" ').replace(' width="100%"', '') + '</div>' +
      '<div class="body">' +
        '<h3>' + cat.name + '</h3>' +
        '<p>' + cat.short_description + '</p>' +
        '<div class="meta">' +
          '<span class="tag">' + bandLabel(cat.typical_price_band) + '</span>' +
          '<span class="tag">' + cat.typical_lead_time + '</span>' +
        '</div>' +
        '<div class="actions">' +
          '<a class="btn btn-primary" href="designer.html?type=' + encodeURIComponent(cat.id) + '">Start a design</a>' +
        '</div>' +
      '</div>';
    li.querySelector('a').addEventListener('click', function () {
      track('category_click', cat.id);
    });
    return li;
  }

  function boot() {
    var grid = document.getElementById('type-grid');
    if (!grid) return;
    CAT.categories.slice().sort(function (a, b) { return a.order - b.order; })
      .forEach(function (cat) { grid.appendChild(card(cat)); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
