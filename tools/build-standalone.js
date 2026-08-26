#!/usr/bin/env node
/* =============================================================================
 * Remember Them - build the single-file edition
 * -----------------------------------------------------------------------------
 *   node tools/build-standalone.js
 *
 * Inlines every stylesheet, script and data file into one HTML document at
 * dist/remember-them.html, so the whole designer can be emailed, dropped on a
 * USB stick, or opened straight from a phone with no server at all.
 *
 * Both views live in the one document and the memorial type is switched in
 * place through RT_DESIGNER.open(), because there is no second page to
 * navigate to.
 *
 * Pass --fragment to emit the body only, without the document wrapper.
 * =========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const FONTS =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600' +
  '&family=Cormorant+Garamond:wght@400;500;600;700' +
  '&family=IBM+Plex+Sans:wght@400;500;600' +
  '&family=Pinyon+Script&family=UnifrakturCook:wght@700&display=swap';

const css = [
  read('assets/css/site.css'),
  read('assets/css/designer.css'),
  /* Only the two-view shell differs from the multi-page site. */
  `
/* ---- single-file shell ---------------------------------------------------- */
.view[hidden] { display: none; }
.back-link {
  display: inline-flex; align-items: center; gap: .4rem;
  font-size: .9rem; color: var(--ink-soft); background: none; border: 0;
  font-family: inherit; cursor: pointer; padding: .3rem 0; margin-top: 1.5rem;
}
.back-link:hover { color: var(--accent-in); }
.site-head nav button {
  font: inherit; font-size: .93rem; background: none; border: 0;
  color: var(--ink-soft); cursor: pointer; padding: 0;
}
.site-head nav button:hover { color: var(--accent-in); }
`
].join('\n');

const scripts = [
  'assets/data/catalog.js',
  'assets/data/examples.js',
  'assets/js/shapes.js',
  'assets/js/render.js',
  'assets/js/analytics.js',
  'assets/js/gallery.js',
  'assets/js/designer.js',
  'assets/js/examples.js'
].map(read).join('\n;\n');

const shell = `
/* ---- single-file shell ------------------------------------------------------
 * Routes the gallery's links through RT_DESIGNER.open() instead of a page load.
 * ------------------------------------------------------------------------- */
(function () {
  'use strict';
  var types = document.getElementById('view-types');
  var designer = document.getElementById('view-designer');

  function showTypes() {
    designer.hidden = true;
    types.hidden = false;
    window.scrollTo(0, 0);
    document.title = 'Remember Them';
  }

  function showDesigner(categoryId) {
    window.RT_DESIGNER.open(categoryId);
    types.hidden = true;
    designer.hidden = false;
    window.scrollTo(0, 0);
    var h1 = document.getElementById('cat-name');
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus(); }
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('.type-card a[href*="type="]');
    if (link) {
      e.preventDefault();
      showDesigner(new URL(link.href, location.href).searchParams.get('type'));
      return;
    }
    if (e.target.closest && e.target.closest('[data-back]')) {
      e.preventDefault();
      showTypes();
    }
  });

  showTypes();
})();
`;

const body = `<title>Remember Them</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link data-webfonts rel="stylesheet" href="${FONTS}">
<style>
${css}
</style>

<a class="skip-link" href="#main">Skip to the memorial types</a>

<header class="site-head">
  <div class="wrap">
    <a class="brand" href="#" data-back>Remember Them<span>Memorial design</span></a>
    <nav aria-label="Main">
      <button type="button" data-back>All memorial types</button>
    </nav>
  </div>
</header>

<main id="main">

  <section class="view" id="view-types">
    <div class="wrap hero">
      <h1>Eight kinds of memorial.<br>Take the time you need.</h1>
      <p class="lede">
        Each of these opens a designer where you can try shapes, granite,
        lettering and artwork, and see the result straight away. Nothing you do
        here is an order, and nothing is sent to us until you decide to send it.
      </p>

      <div class="callout">
        <h2>One thing worth doing first</h2>
        <p>
          Ask your cemetery what they permit before you fall for a type. Many
          lawn-style cemeteries allow flat markers only, and finding that out
          afterwards is the most common disappointment families run into. If you
          would rather we asked on your behalf, we will.
        </p>
      </div>
    </div>

    <div class="wrap">
      <h2 class="visually-hidden">Memorial types</h2>
      <ul class="type-grid" id="type-grid"></ul>
    </div>
  </section>

  <section class="view wrap" id="view-designer" hidden>
    <div style="padding:1.75rem 0 .25rem">
      <h1 id="cat-name">Memorial designer</h1>
      <p class="lede measure" id="cat-lede" style="font-size:1.05rem;color:var(--ink-soft)"></p>
      <p class="measure" id="cat-long" style="color:var(--ink-soft);font-size:.95rem"></p>
      <div class="callout">
        <h2>Before you go far into this</h2>
        <p id="cat-cemetery"></p>
      </div>
      <p class="measure" style="font-size:.92rem;color:var(--ink-faint)">
        Change anything as often as you like. Your design stays in this browser,
        on this device &mdash; it is not sent to us, and there is no clock on it.
        You can come back to it tomorrow.
      </p>
    </div>

    <div class="designer">
      <div class="stage-col">
        <div class="stage" id="stage"></div>

        <div class="stage-bar">
          <button type="button" class="btn" id="btn-print">Print a proof</button>
          <button type="button" class="btn" id="btn-png">Save as an image</button>
          <button type="button" class="btn" id="btn-share">Copy a link to this design</button>
          <span class="spacer"></span>
          <button type="button" class="btn btn-quiet" id="btn-reset">Start again</button>
        </div>

        <p class="status" id="status" role="status" aria-live="polite"></p>

        <div class="summary">
          <h2 id="summary-title">Your design so far</h2>
          <p class="sub">A working sheet, not an order. Print it, save it, or bring it in.</p>
          <dl class="spec" id="spec"></dl>

          <div class="cta-band">
            <p class="note">
              When you are ready &mdash; and only then &mdash; we will look at this
              together and talk about what your cemetery allows.
            </p>
            <a class="btn btn-primary" id="btn-cta" href="#" data-back>Talk it through with us</a>
            <label class="btn" for="file-load">Open a saved design</label>
            <input type="file" id="file-load" accept="application/json,.json" class="visually-hidden">
            <button type="button" class="btn" id="btn-save">Save this design</button>
          </div>
        </div>

        <section class="examples" id="examples" hidden></section>

        <button type="button" class="back-link" data-back>&larr; All memorial types</button>
      </div>

      <div class="controls" id="controls" aria-label="Design controls"></div>
    </div>
  </section>
</main>

<footer class="site-foot">
  <div class="wrap">
    <span>Remember Them &mdash; take the time you need.</span>
  </div>
</footer>

<script>
${scripts}
;
${shell}
</script>
`;

const fragment = process.argv.indexOf('--fragment') !== -1;
const out = fragment
  ? body
  : '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    body.replace('<title>', '<title>') + '\n</html>\n';

const outDir = path.join(ROOT, 'dist');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, fragment ? 'artifact.html' : 'remember-them.html');
fs.writeFileSync(outPath, out);

console.log('Wrote ' + path.relative(ROOT, outPath) +
  '  (' + (out.length / 1024).toFixed(0) + ' KB)');
