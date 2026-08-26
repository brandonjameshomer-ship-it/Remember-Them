/* =============================================================================
 * Remember Them - monument renderer
 * -----------------------------------------------------------------------------
 * One function turns a design object into an SVG string. The preview on screen,
 * the printed proof and the exported PNG all come through here, so what a
 * family looks at is what they take away.
 *
 * The drawing is done in inches. viewBox units are inches, which keeps every
 * size in the code the same number the monument shop would quote.
 * =========================================================================== */
(function (global) {
  'use strict';

  var C = function () { return global.RT_CATALOG; };
  var SH = function () { return global.RT_SHAPES; };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function r2(n) { return Math.round(n * 100) / 100; }
  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }

  /* -- deterministic speckle, so the stone does not shimmer on every redraw -- */
  function seeded(seed) {
    var s = 0;
    for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* Specks per 10-inch tile. Granite grain is fine at arm's length - big dots
   * read as polka dots, not stone. */
  var GRAIN = {
    none:   { count: 0,  min: 0,    max: 0    },
    fine:   { count: 150, min: 0.03, max: 0.10 },
    medium: { count: 120, min: 0.05, max: 0.17 },
    coarse: { count: 80,  min: 0.08, max: 0.30 }
  };

  function granitePattern(g, id) {
    var spec = GRAIN[g.grain] || GRAIN.none;
    var rand = seeded(g.id);
    var specks = '';
    var TILE = 10;
    for (var i = 0; i < spec.count; i++) {
      var cx = r2(rand() * TILE), cy = r2(rand() * TILE);
      var rr = r2(spec.min + rand() * (spec.max - spec.min));
      var op = r2(0.12 + rand() * 0.34);
      specks += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr +
                '" fill="' + g.speck + '" opacity="' + op + '"/>';
    }
    return '<pattern id="' + id + '" width="' + TILE + '" height="' + TILE +
             '" patternUnits="userSpaceOnUse">' +
             '<rect width="' + TILE + '" height="' + TILE + '" fill="' + g.face + '"/>' + specks +
           '</pattern>';
  }

  /* -- text measurement -------------------------------------------------------
   * Width of a string at font-size 1. Multiply by the size you want. Uses a
   * canvas so it reflects the font the browser actually loaded. */
  var measureCanvas = null;
  function widthRatio(text, font) {
    if (!text) return 0;
    if (typeof document === 'undefined') return text.length * 0.55;
    if (!measureCanvas) measureCanvas = document.createElement('canvas');
    var ctx = measureCanvas.getContext('2d');
    ctx.font = (font.weight || 400) + ' 100px ' + font.stack;
    var w = ctx.measureText(text).width / 100;
    if (font.tracking) w += font.tracking * Math.max(0, text.length - 1);
    return w;
  }

  /* Largest font size that keeps `text` inside maxW wide and maxH tall. */
  function fitSize(text, font, maxW, maxH) {
    var ratio = widthRatio(text, font);
    if (!ratio) return maxH;
    return Math.min(maxH, maxW / ratio);
  }

  function textEl(text, font, x, y, size, fill, anchor) {
    if (!text) return '';
    return '<text x="' + r2(x) + '" y="' + r2(y) + '"' +
      ' font-family="' + esc(font.stack) + '"' +
      ' font-size="' + r2(size) + '"' +
      ' font-weight="' + (font.weight || 400) + '"' +
      ' letter-spacing="' + r2((font.tracking || 0) * size) + '"' +
      ' text-anchor="' + (anchor || 'middle') + '"' +
      ' fill="' + fill + '"' +
      ' dominant-baseline="alphabetic"' +
      ' xml:space="preserve">' + esc(text) + '</text>';
  }

  function applyCase(text, font) {
    return font.caps ? String(text || '').toUpperCase() : String(text || '');
  }

  /* -- inscription ------------------------------------------------------------
   * Lays the lettering out inside the shape's text box. Rows are allocated top
   * down: artwork, family name, the people, then the epitaph. */
  function layoutInscription(d, box, font, letterFill, motifRow) {
    var out = '';
    var top = box.y;
    /* On a very tall face - a ledger covering a whole grave - spreading four
     * lines over seven feet leaves lettering you cannot read from standing.
     * Real ledgers carry the inscription at the head end, so cap how far down
     * the block is allowed to run. */
    var bottom = box.y + Math.min(box.h, box.w * 1.15);
    var cx = box.x + box.w / 2;

    /* artwork sitting above the lettering */
    if (motifRow > 0) top += motifRow;

    var people = (d.people || []).filter(function (p) {
      return (p.given && p.given.trim()) || (p.dates && p.dates.trim());
    });
    var epitaph = (d.epitaph || []).filter(function (l) { return l && l.trim(); });

    var famText = applyCase(d.family, font);
    var hasFamily = !!famText.trim();

    /* row heights as a share of what is left */
    var avail = bottom - top;
    var famH = hasFamily ? avail * (people.length ? 0.26 : 0.42) : 0;
    var epiH = epitaph.length ? avail * Math.min(0.34, 0.15 * epitaph.length) : 0;
    var bodyH = avail - famH - epiH;

    /* family name */
    if (hasFamily) {
      var fs = fitSize(famText, font, box.w * 0.94, famH * 0.78);
      out += textEl(famText, font, cx, top + famH * 0.80, fs, letterFill);
    }

    /* the people - one centred column, or side by side for a companion stone */
    if (people.length) {
      var cols = Math.min(people.length, 2);
      var colW = (box.w / cols) * (cols > 1 ? 0.80 : 0.94);
      var rowY = top + famH;
      var nameH = bodyH * (cols > 1 ? 0.30 : 0.26);
      var dateH = bodyH * 0.17;

      people.slice(0, 2).forEach(function (p, i) {
        var colCx = cols > 1
          ? box.x + box.w * (i === 0 ? 0.25 : 0.75)
          : cx;
        var given = applyCase(p.given, font);
        var y = rowY + bodyH * 0.42;
        if (given) {
          var gs = fitSize(given, font, colW, nameH);
          out += textEl(given, font, colCx, y, gs, letterFill);
        }
        if (p.dates && p.dates.trim()) {
          var ds = fitSize(p.dates, font, colW * 0.92, dateH);
          out += textEl(p.dates, font, colCx, y + bodyH * 0.30, ds, letterFill);
        }
      });

      /* a third or fourth name drops to a continuation line */
      if (people.length > 2) {
        var extra = people.slice(2).map(function (p) {
          return [p.given, p.dates].filter(Boolean).join('  ');
        }).join('   ·   ');
        var es = fitSize(extra, font, box.w * 0.92, bodyH * 0.13);
        out += textEl(extra, font, cx, rowY + bodyH * 0.90, es, letterFill);
      }
    }

    /* epitaph */
    if (epitaph.length) {
      var lineH = epiH / epitaph.length;
      epitaph.forEach(function (line, i) {
        var ls = fitSize(line, font, box.w * 0.92, lineH * 0.74);
        out += textEl(line, font, cx, bottom - epiH + lineH * (i + 0.82), ls, letterFill);
      });
    }
    return out;
  }

  /* Artwork paths are drawn on a 100x100 grid but almost none of them fill it,
   * so scaling by the grid makes a rose half the size of a cross. Measuring the
   * real bounds once, and scaling by those, makes every motif land the same
   * visual weight. */
  var bboxCache = {};
  function motifBBox(motif) {
    if (bboxCache[motif.id]) return bboxCache[motif.id];
    var box = { x: 0, y: 0, w: 100, h: 100 };
    if (typeof document !== 'undefined') {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.cssText = 'position:absolute;left:-9999px;top:0;overflow:hidden';
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', motif.path);
      svg.appendChild(path);
      document.body.appendChild(svg);
      try {
        var b = path.getBBox();
        if (b.width > 0 && b.height > 0) box = { x: b.x, y: b.y, w: b.width, h: b.height };
      } catch (e) { /* keep the grid default */ }
      svg.remove();
    }
    bboxCache[motif.id] = box;
    return box;
  }

  function motifEl(motif, x, y, size, fill, opacity) {
    if (!motif || !motif.path) return '';
    var b = motifBBox(motif);
    var scale = size / Math.max(b.w, b.h);
    var offX = x + (size - b.w * scale) / 2 - b.x * scale;
    var offY = y + (size - b.h * scale) / 2 - b.y * scale;
    return '<g transform="translate(' + r2(offX) + ' ' + r2(offY) + ') scale(' + r2(scale * 1000) / 1000 + ')"' +
      ' fill="' + fill + '" opacity="' + (opacity || 1) + '" fill-rule="evenodd">' +
      '<path d="' + motif.path + '"/></g>';
  }

  function vaseEl(x, groundY, h, fill, stroke) {
    var w = h * 0.62;
    return '<g>' +
      '<path d="M' + r2(x - w / 2) + ' ' + r2(groundY - h) +
        'h' + r2(w) + 'l' + r2(-w * 0.14) + ' ' + r2(h) +
        'h' + r2(-w * 0.72) + 'z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.12"/>' +
      '<ellipse cx="' + r2(x) + '" cy="' + r2(groundY - h) + '" rx="' + r2(w / 2) +
        '" ry="' + r2(w * 0.16) + '" fill="' + stroke + '" opacity="0.55"/>' +
      '</g>';
  }

  /* ===========================================================================
   * render(design) -> SVG string
   * ========================================================================= */
  function render(d, opts) {
    opts = opts || {};
    var cat = find(C().categories, d.categoryId);
    var granite = find(C().granites, d.granite);
    var font = find(C().fonts, d.font);
    var motif = find(C().motifs, d.motif || 'none');

    var w = d.widthIn, h = d.heightIn;
    var shape = SH().build(d.shape, w, h);
    var wantsBase = !!d.base && shape.sits === 'base';

    /* base slab proportions follow monument-shop practice: a little wider than
     * the die, and roughly a sixth of its height. */
    var baseH = wantsBase ? Math.max(4, Math.min(8, h * 0.20)) : 0;
    var baseW = wantsBase ? w + Math.max(6, w * 0.18) : w;

    var pad = Math.max(6, w * 0.14);
    var vaseH = d.vases && d.vases !== 'none' ? Math.max(6, h * 0.24) : 0;
    var totalW = Math.max(baseW, w) + pad * 2;
    var totalH = h + baseH + pad * 1.7;

    var dieX = (totalW - w) / 2;
    var dieY = pad * 0.7;
    var groundY = dieY + h + baseH;

    var patId = 'gr-' + granite.id;
    var svg = [];
    svg.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + r2(totalW) + ' ' + r2(totalH) + '"' +
      ' width="100%" role="img" aria-label="' + esc(shape.name + ' in ' + granite.name) + '">');

    svg.push('<defs>');
    svg.push(granitePattern(granite, patId));
    svg.push('<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">' +
             '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>' +
             '<stop offset="55%" stop-color="#ffffff" stop-opacity="0.02"/>' +
             '<stop offset="100%" stop-color="#000000" stop-opacity="0.16"/></linearGradient>');
    svg.push('<filter id="cast" x="-30%" y="-30%" width="160%" height="160%">' +
             '<feDropShadow dx="0" dy="' + r2(h * 0.012) + '" stdDeviation="' + r2(h * 0.018) +
             '" flood-color="#0b0f14" flood-opacity="0.34"/></filter>');
    svg.push('</defs>');

    /* ground */
    if (opts.ground !== false) {
      svg.push('<rect x="0" y="' + r2(groundY) + '" width="' + r2(totalW) + '" height="' +
        r2(totalH - groundY) + '" fill="#dfe3da"/>');
      svg.push('<ellipse cx="' + r2(totalW / 2) + '" cy="' + r2(groundY + 0.6) + '" rx="' +
        r2(Math.max(baseW, w) * 0.62) + '" ry="' + r2(Math.max(2, h * 0.045)) +
        '" fill="#0b0f14" opacity="0.16"/>');
    }

    /* base slab */
    if (wantsBase) {
      var bx = (totalW - baseW) / 2;
      svg.push('<g filter="url(#cast)">');
      svg.push('<path d="' + SH().rect(bx, dieY + h, baseW, baseH) + '" fill="url(#' + patId + ')"/>');
      svg.push('<path d="' + SH().rect(bx, dieY + h, baseW, baseH) + '" fill="url(#sheen)"/>');
      svg.push('</g>');
    }

    /* the stone */
    svg.push('<g transform="translate(' + r2(dieX) + ' ' + r2(dieY) + ')" filter="url(#cast)">');
    shape.parts.forEach(function (p) {
      if (p.kind === 'score') {
        svg.push('<path d="' + p.d + '" fill="none" stroke="#000" stroke-opacity="0.30" stroke-width="' +
          r2(Math.max(0.12, w * 0.006)) + '"/>');
      } else if (p.kind === 'polish') {
        svg.push('<path d="' + p.d + '" fill="#ffffff" fill-opacity="0.07"/>');
      } else if (p.kind === 'accent') {
        svg.push('<path d="' + p.d + '" fill="#000000" fill-opacity="0.16"/>');
      } else {
        svg.push('<path d="' + p.d + '" fill="url(#' + patId + ')"/>');
        svg.push('<path d="' + p.d + '" fill="url(#sheen)"/>');
      }
    });
    svg.push('</g>');

    /* lettering and artwork sit on the stone, so they share its transform */
    svg.push('<g transform="translate(' + r2(dieX) + ' ' + r2(dieY) + ')">');

    var box = shape.text;
    var letter = granite.letter;
    var motifRow = 0;

    if (motif && motif.path) {
      var mSize;
      if (d.motifPos === 'top') {
        mSize = Math.min(box.w * 0.34, box.h * 0.30);
        motifRow = mSize * 1.12;
        svg.push(motifEl(motif, box.x + box.w / 2 - mSize / 2, box.y, mSize, letter, 0.92));
      } else if (d.motifPos === 'left' || d.motifPos === 'right') {
        mSize = Math.min(box.w * 0.24, box.h * 0.46);
        var mx = d.motifPos === 'left'
          ? box.x - mSize * 0.10
          : box.x + box.w - mSize * 0.90;
        svg.push(motifEl(motif, mx, box.y + box.h * 0.5 - mSize / 2, mSize, letter, 0.90));
        box = { x: box.x + (d.motifPos === 'left' ? mSize * 0.98 : 0),
                y: box.y, w: box.w - mSize * 0.98, h: box.h };
      } else if (d.motifPos === 'both') {
        mSize = Math.min(box.w * 0.20, box.h * 0.38);
        svg.push(motifEl(motif, box.x - mSize * 0.08, box.y + box.h * 0.52 - mSize / 2, mSize, letter, 0.88));
        svg.push(motifEl(motif, box.x + box.w - mSize * 0.92, box.y + box.h * 0.52 - mSize / 2, mSize, letter, 0.88));
        box = { x: box.x + mSize * 0.96, y: box.y, w: box.w - mSize * 1.92, h: box.h };
      } else if (d.motifPos === 'behind') {
        mSize = Math.min(box.w * 0.82, box.h * 0.86);
        svg.push(motifEl(motif, box.x + box.w / 2 - mSize / 2, box.y + box.h / 2 - mSize / 2,
          mSize, letter, 0.16));
      }
    }

    /* An empty stone tells a family nothing about what they are choosing, so
     * until they type something we show where the lettering will fall. It is
     * drawn faint, and it never appears once real words exist. */
    var hasWords = !!(String(d.family || '').trim()) ||
      (d.people || []).some(function (p) {
        return String(p.given || '').trim() || String(p.dates || '').trim();
      }) ||
      (d.epitaph || []).some(function (l) { return String(l || '').trim(); });

    if (hasWords) {
      svg.push(layoutInscription(d, box, font, letter, motifRow));
    } else if (opts.ghost !== false) {
      var stand = {
        family: 'Family Name',
        people: d.configuration === 'companion' || d.configuration === 'family'
          ? [{ given: 'Given Name', dates: '1941 - 2019' }, { given: 'Given Name', dates: '1938 - 2024' }]
          : [{ given: 'Given Name', dates: '1941 - 2019' }],
        epitaph: ['A line of your own']
      };
      svg.push('<g opacity="0.26">' +
        layoutInscription(stand, box, font, letter, motifRow) + '</g>');
    }

    /* names on the wings of an estate monument */
    if (shape.wings && d.wingNames && d.wingNames.length) {
      shape.wings.forEach(function (wb, i) {
        var t = applyCase(d.wingNames[i] || '', font);
        if (!t) return;
        var s = fitSize(t, font, wb.w * 0.9, wb.h * 0.30);
        svg.push(textEl(t, font, wb.x + wb.w / 2, wb.y + wb.h * 0.58, s, letter));
      });
    }
    svg.push('</g>');

    /* vases */
    if (d.vases === 'one') {
      svg.push(vaseEl(totalW / 2, groundY, vaseH, granite.face, granite.speck));
    } else if (d.vases === 'two') {
      var off = Math.max(baseW, w) / 2 - vaseH * 0.42;
      svg.push(vaseEl(totalW / 2 - off, groundY, vaseH, granite.face, granite.speck));
      svg.push(vaseEl(totalW / 2 + off, groundY, vaseH, granite.face, granite.speck));
    }

    svg.push('</svg>');
    return svg.join('');
  }

  global.RT_RENDER = { render: render, widthRatio: widthRatio, fitSize: fitSize, find: find };
})(typeof window !== 'undefined' ? window : globalThis);
