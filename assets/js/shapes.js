/* =============================================================================
 * Remember Them - monument shapes
 * -----------------------------------------------------------------------------
 * Every shape is a front elevation drawn in inches, with (0,0) at the top-left
 * of the stone. buildShape() hands back the stone outline, any secondary parts
 * (bench legs, estate wings, a raised curb), and the rectangle inside which the
 * inscription may safely be set.
 *
 * Adding a shape is one entry in SHAPES. Nothing else needs to change - the
 * designer reads this table.
 * =========================================================================== */
(function (global) {
  'use strict';

  var round = function (n) { return Math.round(n * 100) / 100; };

  /* A plain rectangle, optionally with corner radius. */
  function rect(x, y, w, h, r) {
    x = round(x); y = round(y); w = round(w); h = round(h);
    if (!r) return 'M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + (-w) + 'z';
    r = Math.min(r, w / 2, h / 2);
    return 'M' + (x + r) + ' ' + y +
      'h' + (w - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r +
      'v' + (h - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + r +
      'h' + (-(w - 2 * r)) + 'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + (-r) +
      'v' + (-(h - 2 * r)) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + (-r) + 'z';
  }

  /* Serpentine top: apex at the centre, sweeping down to square shoulders.
   * `rise` is how far the apex sits above the shoulders, as a fraction of h. */
  function serpentine(w, h, rise) {
    var sy = round(h * rise);          // shoulder height
    var hw = w / 2;
    return 'M0 ' + round(h) +
      'L0 ' + sy +
      'C' + round(hw * 0.34) + ' ' + sy + ' ' + round(hw * 0.62) + ' 0 ' + round(hw) + ' 0' +
      'C' + round(hw + hw * 0.38) + ' 0 ' + round(hw + hw * 0.66) + ' ' + sy + ' ' + round(w) + ' ' + sy +
      'L' + round(w) + ' ' + round(h) + 'z';
  }

  /* Half-round / oval top: a true half-ellipse springing from the shoulders. */
  function ovalTop(w, h, rise) {
    var s = round(h * rise);
    return 'M0 ' + round(h) + 'L0 ' + s +
      'A' + round(w / 2) + ' ' + s + ' 0 0 1 ' + round(w) + ' ' + s +
      'L' + round(w) + ' ' + round(h) + 'z';
  }

  /* Gothic: two arcs meeting in a point at the crown. */
  function gothic(w, h, rise) {
    var s = round(h * rise);
    var hw = round(w / 2);
    return 'M0 ' + round(h) + 'L0 ' + s +
      'Q' + round(w * 0.04) + ' ' + round(s * 0.52) + ' ' + hw + ' 0' +
      'Q' + round(w * 0.96) + ' ' + round(s * 0.52) + ' ' + round(w) + ' ' + s +
      'L' + round(w) + ' ' + round(h) + 'z';
  }

  /* Chamfered rectangle - the bevelled edge of a granite flat marker. */
  function bevelRect(w, h) {
    var c = round(Math.min(w, h) * 0.08);
    return 'M' + c + ' 0H' + round(w - c) + 'L' + round(w) + ' ' + c +
      'V' + round(h - c) + 'L' + round(w - c) + ' ' + round(h) +
      'H' + c + 'L0 ' + round(h - c) + 'V' + c + 'z';
  }

  function heart(w, h) {
    var x = function (p) { return round(w * p); };
    var y = function (p) { return round(h * p); };
    return 'M' + x(0.5) + ' ' + y(1) +
      'C' + x(0.05) + ' ' + y(0.62) + ' ' + x(0) + ' ' + y(0.34) + ' ' + x(0.14) + ' ' + y(0.16) +
      'C' + x(0.28) + ' ' + y(-0.02) + ' ' + x(0.44) + ' ' + y(0.04) + ' ' + x(0.5) + ' ' + y(0.2) +
      'C' + x(0.56) + ' ' + y(0.04) + ' ' + x(0.72) + ' ' + y(-0.02) + ' ' + x(0.86) + ' ' + y(0.16) +
      'C' + x(1) + ' ' + y(0.34) + ' ' + x(0.95) + ' ' + y(0.62) + ' ' + x(0.5) + ' ' + y(1) + 'z';
  }

  function crossDie(w, h) {
    var armT = round(h * 0.26);       // top of the horizontal arm
    var armB = round(h * 0.56);
    var stemL = round(w * 0.32);
    var stemR = round(w * 0.68);
    return 'M' + stemL + ' 0H' + stemR + 'V' + armT + 'H' + round(w) +
      'V' + armB + 'H' + stemR + 'V' + round(h) + 'H' + stemL +
      'V' + armB + 'H0V' + armT + 'H' + stemL + 'z';
  }

  /* Open book, as cut for a pillow or slant marker. */
  function book(w, h) {
    return 'M0 ' + round(h * 0.20) +
      'Q' + round(w * 0.25) + ' ' + round(h * 0.01) + ' ' + round(w * 0.5) + ' ' + round(h * 0.14) +
      'Q' + round(w * 0.75) + ' ' + round(h * 0.01) + ' ' + round(w) + ' ' + round(h * 0.20) +
      'V' + round(h) + 'H0z';
  }

  /* ---------------------------------------------------------------------------
   * The shape table.
   *
   * build(w, h) returns:
   *   parts    - drawn back to front. kind 'stone' takes the granite fill,
   *              'accent' is a darker recess, 'polish' a lighter polished panel.
   *   text     - {x, y, w, h} inscription area, in inches
   *   sits     - 'base'   this shape normally sits on a granite base
   *              'ground' it sits directly on the ground
   * ------------------------------------------------------------------------ */
  var SHAPES = {
    'flat-top': {
      name: 'Flat Top', sits: 'base',
      build: function (w, h) {
        return { parts: [{ d: rect(0, 0, w, h), kind: 'stone' }],
                 text: { x: w * 0.08, y: h * 0.10, w: w * 0.84, h: h * 0.80 } };
      }
    },
    'serp-top': {
      name: 'Serpentine Top', sits: 'base',
      build: function (w, h) {
        return { parts: [{ d: serpentine(w, h, 0.22), kind: 'stone' }],
                 text: { x: w * 0.08, y: h * 0.26, w: w * 0.84, h: h * 0.64 } };
      }
    },
    'half-serp': {
      name: 'Half Serpentine', sits: 'base',
      build: function (w, h) {
        return { parts: [{ d: serpentine(w, h, 0.13), kind: 'stone' }],
                 text: { x: w * 0.08, y: h * 0.18, w: w * 0.84, h: h * 0.72 } };
      }
    },
    'oval-top': {
      name: 'Oval Top', sits: 'base',
      build: function (w, h) {
        return { parts: [{ d: ovalTop(w, h, 0.34), kind: 'stone' }],
                 text: { x: w * 0.10, y: h * 0.30, w: w * 0.80, h: h * 0.60 } };
      }
    },
    'gothic': {
      name: 'Gothic', sits: 'base',
      build: function (w, h) {
        return { parts: [{ d: gothic(w, h, 0.36), kind: 'stone' }],
                 text: { x: w * 0.12, y: h * 0.34, w: w * 0.76, h: h * 0.56 } };
      }
    },
    'heart-die': {
      name: 'Heart', sits: 'base',
      build: function (w, h) {
        return { parts: [{ d: heart(w, h), kind: 'stone' }],
                 text: { x: w * 0.20, y: h * 0.24, w: w * 0.60, h: h * 0.44 } };
      }
    },
    'cross-die': {
      name: 'Cross', sits: 'base',
      build: function (w, h) {
        return { parts: [{ d: crossDie(w, h), kind: 'stone' }],
                 text: { x: w * 0.05, y: h * 0.285, w: w * 0.90, h: h * 0.255 } };
      }
    },

    /* --- low markers ------------------------------------------------------ */
    'slant-flat': {
      name: 'Slant, Flat Top', sits: 'ground',
      build: function (w, h) {
        return { parts: [
                   { d: rect(0, 0, w, h), kind: 'stone' },
                   { d: rect(0, 0, w, h * 0.07), kind: 'polish' }   // the top wash
                 ],
                 text: { x: w * 0.08, y: h * 0.16, w: w * 0.84, h: h * 0.74 } };
      }
    },
    'slant-serp': {
      name: 'Slant, Serpentine Top', sits: 'ground',
      build: function (w, h) {
        return { parts: [{ d: serpentine(w, h, 0.16), kind: 'stone' }],
                 text: { x: w * 0.08, y: h * 0.22, w: w * 0.84, h: h * 0.68 } };
      }
    },
    'slant-oval': {
      name: 'Slant, Oval Top', sits: 'ground',
      build: function (w, h) {
        return { parts: [{ d: ovalTop(w, h, 0.22), kind: 'stone' }],
                 text: { x: w * 0.10, y: h * 0.26, w: w * 0.80, h: h * 0.64 } };
      }
    },
    'pillow': {
      name: 'Pillow', sits: 'ground',
      build: function (w, h) {
        return { parts: [{ d: rect(0, 0, w, h, Math.min(w, h) * 0.22), kind: 'stone' }],
                 text: { x: w * 0.12, y: h * 0.16, w: w * 0.76, h: h * 0.68 } };
      }
    },
    'book': {
      name: 'Open Book', sits: 'ground',
      build: function (w, h) {
        return { parts: [
                   { d: book(w, h), kind: 'stone' },
                   { d: 'M' + round(w / 2) + ' ' + round(h * 0.15) + 'V' + round(h * 0.97), kind: 'score' }
                 ],
                 text: { x: w * 0.06, y: h * 0.28, w: w * 0.88, h: h * 0.62 } };
      }
    },
    'flat-rect': {
      name: 'Rectangle', sits: 'ground',
      build: function (w, h) {
        return { parts: [{ d: rect(0, 0, w, h), kind: 'stone' },
                         { d: rect(w * 0.05, h * 0.09, w * 0.90, h * 0.82), kind: 'polish' }],
                 text: { x: w * 0.09, y: h * 0.14, w: w * 0.82, h: h * 0.72 } };
      }
    },
    'flat-bevel': {
      name: 'Bevelled Rectangle', sits: 'ground',
      build: function (w, h) {
        return { parts: [{ d: bevelRect(w, h), kind: 'stone' }],
                 text: { x: w * 0.10, y: h * 0.15, w: w * 0.80, h: h * 0.70 } };
      }
    },

    /* --- benches ---------------------------------------------------------- */
    'bench-pedestal': {
      name: 'Pedestal Bench', sits: 'ground',
      build: function (w, h) {
        var seatH = h * 0.26;
        var legW = w * 0.14;
        var legInset = w * 0.09;
        return { parts: [
                   { d: rect(legInset, seatH, legW, h - seatH), kind: 'stone' },
                   { d: rect(w - legInset - legW, seatH, legW, h - seatH), kind: 'stone' },
                   { d: rect(0, 0, w, seatH), kind: 'stone' },
                   { d: rect(0, seatH * 0.62, w, seatH * 0.06), kind: 'score' }
                 ],
                 text: { x: w * 0.06, y: h * 0.03, w: w * 0.88, h: seatH * 0.55 } };
      }
    },
    'bench-slab': {
      name: 'Slab-End Bench', sits: 'ground',
      build: function (w, h) {
        var seatH = h * 0.24;
        var endW = w * 0.09;
        return { parts: [
                   { d: rect(0, seatH, endW, h - seatH), kind: 'stone' },
                   { d: rect(w - endW, seatH, endW, h - seatH), kind: 'stone' },
                   { d: rect(0, 0, w, seatH), kind: 'stone' }
                 ],
                 text: { x: w * 0.14, y: h * 0.02, w: w * 0.72, h: seatH * 0.62 } };
      }
    },

    /* --- ledgers (drawn in plan, looking down at the grave) ---------------- */
    'ledger-flat': {
      name: 'Flush Ledger', sits: 'ground',
      build: function (w, h) {
        return { parts: [{ d: rect(0, 0, w, h), kind: 'stone' },
                         { d: rect(w * 0.04, h * 0.02, w * 0.92, h * 0.96), kind: 'polish' }],
                 text: { x: w * 0.10, y: h * 0.08, w: w * 0.80, h: h * 0.84 } };
      }
    },
    'ledger-curbed': {
      name: 'Ledger on Curb', sits: 'ground',
      build: function (w, h) {
        return { parts: [{ d: rect(0, 0, w, h), kind: 'stone' },
                         { d: rect(w * 0.09, h * 0.045, w * 0.82, h * 0.91), kind: 'accent' },
                         { d: rect(w * 0.12, h * 0.06, w * 0.76, h * 0.88), kind: 'polish' }],
                 text: { x: w * 0.16, y: h * 0.11, w: w * 0.68, h: h * 0.78 } };
      }
    },

    /* --- estate ----------------------------------------------------------- */
    'estate-wings': {
      name: 'Centre Die with Wings', sits: 'base',
      build: function (w, h) {
        var dieW = w * 0.44;
        var dieX = (w - dieW) / 2;
        var wingW = w * 0.26;
        var wingH = h * 0.46;
        var wingY = h - wingH;
        return { parts: [
                   { d: rect(0, wingY, wingW, wingH), kind: 'stone' },
                   { d: rect(w - wingW, wingY, wingW, wingH), kind: 'stone' },
                   { d: 'M' + round(dieX) + ' ' + round(h) +
                        'L' + round(dieX) + ' ' + round(h * 0.20) +
                        'C' + round(dieX) + ' ' + round(h * 0.04) + ' ' +
                              round(dieX + dieW * 0.30) + ' 0 ' + round(dieX + dieW / 2) + ' 0' +
                        'C' + round(dieX + dieW * 0.70) + ' 0 ' +
                              round(dieX + dieW) + ' ' + round(h * 0.04) + ' ' +
                              round(dieX + dieW) + ' ' + round(h * 0.20) +
                        'L' + round(dieX + dieW) + ' ' + round(h) + 'z', kind: 'stone' }
                 ],
                 text: { x: dieX + dieW * 0.08, y: h * 0.26, w: dieW * 0.84, h: h * 0.62 },
                 wings: [
                   { x: wingW * 0.10, y: wingY + wingH * 0.16, w: wingW * 0.80, h: wingH * 0.66 },
                   { x: w - wingW + wingW * 0.10, y: wingY + wingH * 0.16, w: wingW * 0.80, h: wingH * 0.66 }
                 ] };
      }
    }
  };

  global.RT_SHAPES = {
    list: SHAPES,
    names: function () { return Object.keys(SHAPES); },
    name: function (id) { return SHAPES[id] ? SHAPES[id].name : id; },
    build: function (id, w, h) {
      var s = SHAPES[id] || SHAPES['flat-top'];
      var out = s.build(w, h);
      out.id = id;
      out.name = s.name;
      out.sits = s.sits;
      return out;
    },
    rect: rect
  };
})(typeof window !== 'undefined' ? window : globalThis);
