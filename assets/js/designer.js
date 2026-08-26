/* =============================================================================
 * Remember Them - designer controller
 * -----------------------------------------------------------------------------
 * Reads ?type= from the URL, builds the controls that category allows, keeps
 * the design in one plain object, and re-renders on every change.
 *
 * Nothing here is category-specific. A new category in catalog.js gets a
 * working designer with no changes to this file.
 * =========================================================================== */
(function () {
  'use strict';

  var CAT = window.RT_CATALOG;
  var SHAPES = window.RT_SHAPES;
  var R = window.RT_RENDER;
  var track = window.RT_TRACK || function () {};

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k in n && k !== 'list' && typeof attrs[k] !== 'string') n[k] = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  };

  /* ------------------------------------------------------------------------ */
  /* category resolution                                                       */
  /* -----------------------------------------------------------------------
   * Which memorial type is being designed can change without a page load -
   * a single-page build switches types in place - so these are set through
   * setCategory() rather than fixed when the file is read.
   * ------------------------------------------------------------------------ */
  var params = new URLSearchParams(location.search);
  var category, cfg, STORE_KEY;

  function setCategory(id) {
    category = R.find(CAT.categories, id || CAT.categories[0].id);
    cfg = category.designer;
    STORE_KEY = 'rt.design.' + category.id;
  }
  setCategory(params.get('type'));

  /* ------------------------------------------------------------------------ */
  /* state                                                                     */
  /* ------------------------------------------------------------------------ */
  function freshDesign() {
    var d = cfg.defaults;
    return {
      categoryId: category.id,
      configuration: 'individual',
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
      family: '',
      people: [{ given: '', dates: '' }],
      epitaph: ['', '', ''],
      wingNames: ['', ''],
      features: []
    };
  }

  var design;

  /* A design may arrive in the URL (a shared link) or from this browser's own
   * last session. The link wins - someone sent it deliberately. */
  function restore(packed) {
    design = freshDesign();
    if (packed) {
      try {
        var fromLink = JSON.parse(decodeURIComponent(escape(atob(packed.replace(/-/g, '+').replace(/_/g, '/')))));
        if (fromLink && fromLink.categoryId === category.id) {
          design = Object.assign(freshDesign(), fromLink);
          return;
        }
      } catch (e) { /* a malformed link just falls through to the defaults */ }
    }
    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (saved) design = Object.assign(freshDesign(), JSON.parse(saved));
    } catch (e) { /* private browsing, or storage turned off */ }
  }
  restore(params.get('d'));

  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(design)); } catch (e) {}
  }

  /* ------------------------------------------------------------------------ */
  /* small control builders                                                    */
  /* ------------------------------------------------------------------------ */
  function panel(title, open) {
    var body = el('div', { class: 'panel-body' });
    var d = el('details', { class: 'panel' }, [
      el('summary', { text: title }), body
    ]);
    if (open) d.open = true;
    return { root: d, body: body };
  }

  function field(labelText, control, hint) {
    var id = control.id || ('f' + Math.random().toString(36).slice(2, 8));
    control.id = id;
    return el('div', { class: 'field' }, [
      el('label', { text: labelText, for: id }),
      control,
      hint ? el('p', { class: 'hint', text: hint }) : null
    ]);
  }

  /* A group of buttons behaving as one choice. */
  function picker(opts) {
    var wrap = el('div', {
      class: 'picker cols-' + (opts.cols || 3),
      role: 'group', 'aria-label': opts.label
    });
    opts.items.forEach(function (item) {
      var btn = el('button', {
        type: 'button',
        'aria-pressed': String(item.id === opts.value),
        title: item.title || item.name
      });
      if (item.thumb) btn.insertAdjacentHTML('afterbegin', item.thumb);
      btn.appendChild(el('span', { text: item.name }));
      btn.addEventListener('click', function () {
        opts.onPick(item.id);
        Array.prototype.forEach.call(wrap.children, function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function chips(opts) {
    var wrap = el('div', { class: 'chips', role: 'group', 'aria-label': opts.label });
    opts.items.forEach(function (item) {
      var on = opts.multi
        ? opts.value.indexOf(item.id) !== -1
        : item.id === opts.value;
      var btn = el('button', { type: 'button', 'aria-pressed': String(on), text: item.name });
      btn.addEventListener('click', function () {
        if (opts.multi) {
          var next = btn.getAttribute('aria-pressed') !== 'true';
          btn.setAttribute('aria-pressed', String(next));
          opts.onPick(item.id, next);
        } else {
          Array.prototype.forEach.call(wrap.children, function (b) {
            b.setAttribute('aria-pressed', String(b === btn));
          });
          opts.onPick(item.id, true);
        }
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function slider(opts) {
    var input = el('input', {
      type: 'range', min: opts.min, max: opts.max, step: opts.step,
      value: opts.value, 'aria-label': opts.label
    });
    var out = el('output', { text: opts.format(opts.value) });
    input.addEventListener('input', function () {
      var v = Number(input.value);
      out.textContent = opts.format(v);
      opts.onInput(v);
    });
    return el('div', { class: 'range-row' }, [input, out]);
  }

  /* thumbnails ------------------------------------------------------------- */
  function shapeThumb(id) {
    var s = SHAPES.build(id, 36, 26);
    var paths = s.parts.filter(function (p) { return p.kind === 'stone'; })
      .map(function (p) { return '<path d="' + p.d + '"/>'; }).join('');
    return '<svg viewBox="-1 -1 38 28" aria-hidden="true" fill="currentColor" ' +
           'fill-opacity="0.72" focusable="false">' + paths + '</svg>';
  }
  function motifThumb(m) {
    if (!m.path) return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '<line x1="18" y1="82" x2="82" y2="18" stroke="currentColor" stroke-opacity=".4" stroke-width="6"/></svg>';
    return '<svg viewBox="-4 -4 108 108" aria-hidden="true" fill="currentColor" ' +
           'fill-opacity="0.8" fill-rule="evenodd" focusable="false"><path d="' + m.path + '"/></svg>';
  }

  /* ------------------------------------------------------------------------ */
  /* build the panels                                                          */
  /* ------------------------------------------------------------------------ */
  var controls = $('#controls');
  var stage = $('#stage');
  var statusEl = $('#status');

  function say(msg) { statusEl.textContent = msg; }

  /* --- shape and size ----------------------------------------------------- */
  function buildShapePanel() {
    var p = panel('Shape & size', true);

    p.body.appendChild(field('Shape', picker({
      label: 'Shape', cols: 3, value: design.shape,
      items: cfg.shapes.map(function (id) {
        return { id: id, name: SHAPES.name(id), thumb: shapeThumb(id) };
      }),
      onPick: function (id) {
        design.shape = id;
        track('shape_change', category.id, id);
        rebuildWings();
        update('Shape set to ' + SHAPES.name(id) + '.');
      }
    })));

    var sz = cfg.size;
    p.body.appendChild(field('Width', slider({
      label: 'Width in inches', min: sz.widthIn.min, max: sz.widthIn.max, step: sz.widthIn.step,
      value: design.widthIn, format: function (v) { return v + '"'; },
      onInput: function (v) { design.widthIn = v; update(); }
    }), 'Cemeteries set the size you are allowed. Check yours before you settle on one.'));

    p.body.appendChild(field('Height', slider({
      label: 'Height in inches', min: sz.heightIn.min, max: sz.heightIn.max, step: sz.heightIn.step,
      value: design.heightIn, format: function (v) { return v + '"'; },
      onInput: function (v) { design.heightIn = v; update(); }
    })));

    var thickSel = el('select', { 'aria-label': 'Thickness in inches' });
    [3, 4, 5, 6, 8, 10, 12, 14, 16].forEach(function (t) {
      thickSel.appendChild(el('option', { value: String(t), text: t + '"',
        selected: t === design.thicknessIn }));
    });
    thickSel.addEventListener('change', function () {
      design.thicknessIn = Number(thickSel.value);
      track('size_change', category.id, 'thickness', design.thicknessIn);
      update('Thickness set to ' + design.thicknessIn + ' inches.');
    });
    p.body.appendChild(field('Thickness', thickSel,
      'Front to back. Thicker stone reads heavier and costs more.'));

    if (cfg.allowBase) {
      var baseChips = chips({
        label: 'Base', value: design.base ? 'yes' : 'no',
        items: [{ id: 'yes', name: 'On a granite base' }, { id: 'no', name: 'No base' }],
        onPick: function (id) {
          design.base = id === 'yes';
          track('option_change', category.id, 'base');
          update(design.base ? 'Set on a granite base.' : 'Base removed.');
        }
      });
      p.body.appendChild(field('Base', baseChips));
    }
    controls.appendChild(p.root);
  }

  /* --- granite ------------------------------------------------------------ */
  function buildGranitePanel() {
    var p = panel('Granite', true);
    p.body.appendChild(field('Colour', picker({
      label: 'Granite colour', cols: 4, value: design.granite,
      items: CAT.granites.map(function (g) {
        return {
          id: g.id, name: g.name, title: g.name + ' - colour group ' + g.category,
          thumb: '<span class="sw" style="background:' + g.face + '"></span>'
        };
      }),
      onPick: function (id) {
        design.granite = id;
        track('granite_change', category.id, id);
        var g = R.find(CAT.granites, id);
        update(g.name + ' selected, colour group ' + g.category + '.');
      }
    }), 'Lower colour groups are the more economical quarries. Lettering is frosted, so it always reads lighter than the polished face.'));
    controls.appendChild(p.root);
  }

  /* --- inscription -------------------------------------------------------- */
  var peopleWrap;
  function personCard(idx) {
    var p = design.people[idx];
    var given = el('input', { type: 'text', value: p.given, maxlength: '28',
      'aria-label': 'Given name, person ' + (idx + 1), placeholder: 'Given name' });
    var dates = el('input', { type: 'text', value: p.dates, maxlength: '28',
      'aria-label': 'Dates, person ' + (idx + 1), placeholder: '1941 - 2019' });
    given.addEventListener('input', function () { design.people[idx].given = given.value; update(); });
    dates.addEventListener('input', function () { design.people[idx].dates = dates.value; update(); });

    var head = el('div', { class: 'person-head', text: 'Person ' + (idx + 1) });
    if (design.people.length > 1) {
      var rm = el('button', { type: 'button', class: 'btn btn-quiet', text: 'Remove',
        'aria-label': 'Remove person ' + (idx + 1) });
      rm.style.fontSize = '.78rem';
      rm.style.padding = '.1rem .5rem';
      rm.addEventListener('click', function () {
        design.people.splice(idx, 1);
        renderPeople();
        update('Person removed.');
      });
      head.appendChild(rm);
    }
    return el('div', { class: 'person' }, [
      head,
      el('div', { class: 'row-2' }, [given, dates])
    ]);
  }

  function renderPeople() {
    peopleWrap.innerHTML = '';
    design.people.forEach(function (_, i) { peopleWrap.appendChild(personCard(i)); });
    if (design.people.length < 4) {
      var add = el('button', { type: 'button', class: 'btn', text: 'Add another name' });
      add.style.marginTop = '.7rem';
      add.addEventListener('click', function () {
        design.people.push({ given: '', dates: '' });
        renderPeople();
        update('A name was added. Three or more names run on a continuation line.');
      });
      peopleWrap.appendChild(add);
    }
  }

  function buildInscriptionPanel() {
    var p = panel('Inscription', true);

    p.body.appendChild(field('This memorial is for', chips({
      label: 'Configuration', value: design.configuration,
      items: [
        { id: 'individual', name: 'One person' },
        { id: 'companion', name: 'A couple' },
        { id: 'family', name: 'A family' }
      ],
      onPick: function (id) {
        design.configuration = id;
        if (id === 'companion' && design.people.length < 2) design.people.push({ given: '', dates: '' });
        if (id === 'individual') design.people = design.people.slice(0, 1);
        renderPeople();
        track('option_change', category.id, id);
        update();
      }
    })));

    var fam = el('input', { type: 'text', value: design.family, maxlength: '24',
      placeholder: 'Family name' });
    fam.addEventListener('input', function () { design.family = fam.value; update(); });
    p.body.appendChild(field('Family name', fam, 'Usually the surname, cut largest across the top.'));

    peopleWrap = el('div');
    p.body.appendChild(el('div', { class: 'field' }, [
      el('span', { class: 'label', text: 'Names and dates' }), peopleWrap
    ]));
    renderPeople();

    var epiWrap = el('div');
    design.epitaph.forEach(function (line, i) {
      var input = el('input', { type: 'text', value: line, maxlength: '40',
        'aria-label': 'Epitaph line ' + (i + 1), placeholder: i === 0 ? 'A line of your own' : '' });
      input.style.marginTop = i ? '.35rem' : '0';
      input.addEventListener('input', function () { design.epitaph[i] = input.value; update(); });
      epiWrap.appendChild(input);
    });
    p.body.appendChild(el('div', { class: 'field' }, [
      el('span', { class: 'label', text: 'Epitaph' }),
      epiWrap,
      el('p', { class: 'hint', text: 'Three lines at most. Short reads better in stone than long.' })
    ]));

    p.body.appendChild(field('Lettering', picker({
      label: 'Lettering style', cols: 3, value: design.font,
      items: CAT.fonts.map(function (f) {
        return {
          id: f.id, name: f.name,
          thumb: '<svg viewBox="0 0 60 22" aria-hidden="true" focusable="false">' +
            '<text x="30" y="17" text-anchor="middle" font-size="16" fill="currentColor" ' +
            'font-family=\'' + f.stack.replace(/"/g, '&quot;') + '\'>' +
            (f.caps ? 'ABC' : 'Abc') + '</text></svg>'
        };
      }),
      onPick: function (id) {
        design.font = id;
        track('font_change', category.id, id);
        update(R.find(CAT.fonts, id).name + ' lettering.');
      }
    })));

    controls.appendChild(p.root);
  }

  /* --- wings (estate monuments only) -------------------------------------- */
  var wingPanel = null;
  function rebuildWings() {
    var hasWings = !!SHAPES.build(design.shape, 36, 24).wings;
    if (hasWings && !wingPanel) {
      var p = panel('Wing panels', false);
      ['Left wing', 'Right wing'].forEach(function (label, i) {
        var input = el('input', { type: 'text', value: design.wingNames[i] || '',
          maxlength: '22', placeholder: 'Name' });
        input.addEventListener('input', function () { design.wingNames[i] = input.value; update(); });
        p.body.appendChild(field(label, input));
      });
      wingPanel = p.root;
      controls.insertBefore(wingPanel, controls.children[3] || null);
    } else if (!hasWings && wingPanel) {
      wingPanel.remove();
      wingPanel = null;
    }
  }

  /* --- artwork ------------------------------------------------------------ */
  function buildArtPanel() {
    var p = panel('Artwork', false);
    p.body.appendChild(field('Sandblast or etched art', picker({
      label: 'Artwork', cols: 4, value: design.motif,
      items: CAT.motifs.map(function (m) {
        return { id: m.id, name: m.name, title: m.name + (m.group !== 'None' ? ' - ' + m.group : ''),
                 thumb: motifThumb(m) };
      }),
      onPick: function (id) {
        design.motif = id;
        track('motif_change', category.id, id);
        update(R.find(CAT.motifs, id).name + ' selected.');
      }
    })));
    p.body.appendChild(field('Where it sits', chips({
      label: 'Artwork position', value: design.motifPos,
      items: [
        { id: 'top', name: 'Above the name' },
        { id: 'left', name: 'Left' },
        { id: 'right', name: 'Right' },
        { id: 'both', name: 'Both sides' },
        { id: 'behind', name: 'Faint, behind' }
      ],
      onPick: function (id) { design.motifPos = id; track('option_change', category.id, id); update(); }
    })));
    controls.appendChild(p.root);
  }

  /* --- options ------------------------------------------------------------ */
  function buildOptionsPanel() {
    var p = panel('Options', false);

    if ((cfg.features || []).indexOf('vase') !== -1) {
      p.body.appendChild(field('Vases', chips({
        label: 'Vases', value: design.vases,
        items: [{ id: 'none', name: 'None' }, { id: 'one', name: 'One, centred' }, { id: 'two', name: 'A pair' }],
        onPick: function (id) { design.vases = id; track('option_change', category.id, id); update(); }
      })));
    }

    var extras = (cfg.features || []).filter(function (f) { return f !== 'vase'; });
    if (extras.length) {
      p.body.appendChild(el('div', { class: 'field' }, [
        el('span', { class: 'label', text: 'Also consider' }),
        chips({
          label: 'Additional work', multi: true, value: design.features,
          items: extras.map(function (id) {
            return { id: id, name: (CAT.features[id] || { name: id }).name };
          }),
          onPick: function (id, on) {
            var i = design.features.indexOf(id);
            if (on && i === -1) design.features.push(id);
            if (!on && i !== -1) design.features.splice(i, 1);
            track('option_change', category.id, id);
            update();
          }
        }),
        el('p', { class: 'hint', text: 'These are noted on your design sheet. We work out the detail together, later.' })
      ]));
    }
    controls.appendChild(p.root);
  }

  /* ------------------------------------------------------------------------ */
  /* render + summary                                                          */
  /* ------------------------------------------------------------------------ */
  function specRows() {
    var g = R.find(CAT.granites, design.granite);
    var f = R.find(CAT.fonts, design.font);
    var m = R.find(CAT.motifs, design.motif);
    var band = R.find(CAT.meta.priceBands, category.typical_price_band);

    var rows = [
      ['Memorial type', category.name],
      ['Shape', SHAPES.name(design.shape)],
      ['Size', design.widthIn + '" wide × ' + design.heightIn + '" high × ' + design.thicknessIn + '" thick'],
      ['Base', cfg.allowBase ? (design.base ? 'Granite base included' : 'No base') : 'Not applicable'],
      ['Granite', g.name + ' (colour group ' + g.category + ')'],
      ['Lettering', f.name],
      ['Artwork', m.path ? m.name + ' — ' + ({ top: 'above the name', left: 'to the left',
        right: 'to the right', both: 'both sides', behind: 'faint, behind the lettering' }[design.motifPos] || '') : 'None'],
      ['Vases', { none: 'None', one: 'One, centred', two: 'A pair' }[design.vases] || 'None']
    ];

    if (design.features.length) {
      rows.push(['Additional work', design.features.map(function (id) {
        return (CAT.features[id] || { name: id }).name;
      }).join(', ')]);
    }

    var inscription = [];
    if (design.family.trim()) inscription.push(design.family.trim());
    design.people.forEach(function (p) {
      var line = [p.given, p.dates].map(function (s) { return (s || '').trim(); })
        .filter(Boolean).join('   ');
      if (line) inscription.push(line);
    });
    design.epitaph.forEach(function (l) { if (l && l.trim()) inscription.push(l.trim()); });
    rows.push(['Inscription', inscription.length ? inscription.join('\n') : 'Not yet written']);

    rows.push(['Typical lead time', category.typical_lead_time]);
    rows.push(['Relative investment', band.label + ' — a range, not a quote']);
    return rows;
  }

  function renderSummary() {
    var dl = $('#spec');
    dl.innerHTML = '';
    specRows().forEach(function (row) {
      dl.appendChild(el('dt', { text: row[0] }));
      var dd = el('dd', { text: row[1] });
      dd.style.whiteSpace = 'pre-line';
      dl.appendChild(dd);
    });
  }

  var raf = null;
  function update(message) {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      stage.innerHTML = R.render(design);
      renderSummary();
      persist();
      if (message) say(message);
    });
  }

  /* ------------------------------------------------------------------------ */
  /* export                                                                    */
  /* ------------------------------------------------------------------------ */
  function fileStem() {
    var name = (design.family || design.people[0].given || category.name)
      .trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    return 'remember-them-' + category.id + (name ? '-' + name : '');
  }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = el('a', { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* Fonts live on Google's CDN, and an SVG drawn into a canvas cannot reach
   * out for them. Pulling the woff2 files in as data URIs first is what keeps
   * the exported PNG in the lettering the family actually chose. */
  var fontCssPromise = null;
  function inlineFontCss() {
    if (fontCssPromise) return fontCssPromise;
    var link = document.querySelector('link[data-webfonts]');
    if (!link) return (fontCssPromise = Promise.resolve(''));

    fontCssPromise = fetch(link.href)
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (css) {
        var urls = [];
        css.replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g, function (_, u) {
          if (urls.indexOf(u) === -1) urls.push(u);
          return _;
        });
        return Promise.all(urls.map(function (u) {
          return fetch(u).then(function (r) { return r.blob(); }).then(function (b) {
            return new Promise(function (res) {
              var fr = new FileReader();
              fr.onload = function () { res([u, fr.result]); };
              fr.onerror = function () { res([u, null]); };
              fr.readAsDataURL(b);
            });
          }).catch(function () { return [u, null]; });
        })).then(function (pairs) {
          pairs.forEach(function (pair) {
            if (pair[1]) css = css.split(pair[0]).join(pair[1]);
          });
          return css;
        });
      })
      .catch(function () { return ''; });
    return fontCssPromise;
  }

  function exportPng() {
    say('Preparing your image…');
    inlineFontCss().then(function (css) {
      var svg = R.render(design);
      if (css) svg = svg.replace('<defs>', '<defs><style type="text/css">' + css + '</style>');

      var vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      var vw = vb ? parseFloat(vb[1]) : 100;
      var vh = vb ? parseFloat(vb[2]) : 100;
      var scale = Math.min(2600 / vw, 2600 / vh, 40);

      var img = new Image();
      img.onload = function () {
        var canvas = el('canvas', {});
        canvas.width = Math.round(vw * scale);
        canvas.height = Math.round(vh * scale);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function (blob) {
          if (!blob) { say('The image could not be created in this browser. Printing the proof works everywhere.'); return; }
          download(blob, fileStem() + '.png');
          say('Image saved. Nothing about this design is sent anywhere until you choose to send it.');
          track('export_png', category.id, design.shape);
        }, 'image/png');
      };
      img.onerror = function () {
        say('The image could not be created in this browser. Printing the proof works everywhere.');
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }

  function saveDesign() {
    var payload = JSON.stringify({ rememberThem: 1, savedFor: category.name, design: design }, null, 2);
    download(new Blob([payload], { type: 'application/json' }), fileStem() + '.json');
    say('Design saved to your computer. Open it again from “Open a saved design”.');
    track('save_design', category.id, design.shape);
  }

  function loadDesign(file) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var parsed = JSON.parse(fr.result);
        var loaded = parsed.design || parsed;
        if (loaded.categoryId && loaded.categoryId !== category.id) {
          location.href = 'designer.html?type=' + encodeURIComponent(loaded.categoryId) +
            '&d=' + packDesign(loaded);
          return;
        }
        design = Object.assign(freshDesign(), loaded);
        rebuild();
        say('Design opened.');
        track('load_design', category.id, design.shape);
      } catch (e) {
        say('That file could not be read as a saved design.');
      }
    };
    fr.readAsText(file);
  }

  function packDesign(d) {
    var json = JSON.stringify(d);
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function shareLink() {
    var url = location.origin + location.pathname +
      '?type=' + encodeURIComponent(category.id) + '&d=' + packDesign(design);
    var done = function () { say('Link copied. Anyone you send it to opens this exact design.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () { prompt('Copy this link:', url); });
    } else {
      prompt('Copy this link:', url);
    }
    track('share_link', category.id, design.shape);
  }

  /* ------------------------------------------------------------------------ */
  /* wiring                                                                    */
  /* ------------------------------------------------------------------------ */
  function rebuild() {
    controls.innerHTML = '';
    wingPanel = null;
    buildShapePanel();
    buildGranitePanel();
    buildInscriptionPanel();
    rebuildWings();
    buildArtPanel();
    buildOptionsPanel();
    update();
  }

  function paintCategoryCopy() {
    $('#cat-name').textContent = category.name;
    $('#cat-lede').textContent = category.short_description;
    $('#cat-long').textContent = category.long_description;
    $('#cat-cemetery').textContent = category.cemetery_note;
    $('#summary-title').textContent = 'Your ' + category.name.replace(/s$/, '').toLowerCase() + ' so far';
    document.title = category.name + ' designer · Remember Them';
  }

  function boot() {
    paintCategoryCopy();

    $('#btn-print').addEventListener('click', function () {
      track('print_proof', category.id, design.shape);
      window.print();
    });
    $('#btn-png').addEventListener('click', exportPng);
    $('#btn-save').addEventListener('click', saveDesign);
    $('#btn-share').addEventListener('click', shareLink);
    $('#file-load').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) loadDesign(e.target.files[0]);
      e.target.value = '';
    });
    $('#btn-reset').addEventListener('click', function () {
      design = freshDesign();
      rebuild();
      say('Started again from the beginning. Nothing was lost anywhere else.');
      track('reset_design', category.id);
    });
    $('#btn-cta').addEventListener('click', function () { track('cta_click', category.id, design.shape); });

    rebuild();
    track('designer_open', category.id, design.shape);

    /* Re-measure once the lettering has actually loaded, or the first draw
     * lays out against a fallback face. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { update(); });
    }
  }

  /* Used by the single-file build, which has no page loads to hang a category
   * change on. The multi-page site never calls it. */
  window.RT_DESIGNER = {
    open: function (categoryId) {
      setCategory(categoryId);
      restore(null);
      paintCategoryCopy();
      rebuild();
      say('');
      track('designer_open', category.id, design.shape);
      return category;
    },
    current: function () { return category; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
