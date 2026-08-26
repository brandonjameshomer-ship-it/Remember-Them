/* =============================================================================
 * Remember Them - the examples strip
 * -----------------------------------------------------------------------------
 * Shows real photographs of this memorial type beneath the designer. If a type
 * has no photographs yet, nothing renders and nothing breaks.
 *
 * The lightbox is keyboard-complete: arrows move, Escape closes, focus is held
 * inside while open and handed back to the thumbnail on the way out.
 * =========================================================================== */
(function () {
  'use strict';

  var DATA = window.RT_EXAMPLES;
  var track = window.RT_TRACK || function () {};
  if (!DATA) return;

  var params = new URLSearchParams(location.search);
  var catalog = window.RT_CATALOG;
  var categoryId = params.get('type') || catalog.categories[0].id;
  var entry = DATA.categories[categoryId];
  var items = (entry && entry.examples) || [];

  var host = document.getElementById('examples');
  if (!host) return;

  if (!items.length) {
    host.hidden = true;
    return;
  }

  var lastFocused = null;
  var current = 0;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* --- lightbox ----------------------------------------------------------- */
  var dialog = el('div', { class: 'lightbox', role: 'dialog', 'aria-modal': 'true',
    'aria-label': 'Example, larger view', hidden: 'hidden' });
  var figure = el('figure', { class: 'lightbox-figure' });
  var closeBtn = el('button', { type: 'button', class: 'btn lb-close', text: 'Close' });
  var prevBtn = el('button', { type: 'button', class: 'btn lb-nav lb-prev', 'aria-label': 'Previous example', text: '‹' });
  var nextBtn = el('button', { type: 'button', class: 'btn lb-nav lb-next', 'aria-label': 'Next example', text: '›' });
  dialog.appendChild(prevBtn);
  dialog.appendChild(figure);
  dialog.appendChild(nextBtn);
  dialog.appendChild(closeBtn);
  document.body.appendChild(dialog);

  function specLine(item) {
    return [
      item.granite,
      item.size,
      item.configuration === 'companion' ? 'For a couple'
        : item.configuration === 'family' ? 'For a family'
        : item.configuration === 'individual' ? 'For one person' : null,
      (item.features || []).join(', ') || null,
      item.notes || null
    ].filter(Boolean).join(' · ');
  }

  function show(i) {
    current = (i + items.length) % items.length;
    var item = items[current];
    figure.innerHTML = '';
    figure.appendChild(el('img', { src: item.image, alt: item.alt || '' }));
    figure.appendChild(el('figcaption', { text: specLine(item) }));
    prevBtn.hidden = nextBtn.hidden = items.length < 2;
  }

  function open(i, from) {
    lastFocused = from || document.activeElement;
    show(i);
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    track('category_click', categoryId, items[current].id);
  }

  function close() {
    dialog.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(current - 1); });
  nextBtn.addEventListener('click', function () { show(current + 1); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });

  document.addEventListener('keydown', function (e) {
    if (dialog.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowLeft') { show(current - 1); return; }
    if (e.key === 'ArrowRight') { show(current + 1); return; }
    if (e.key === 'Tab') {
      /* hold focus inside while the dialog is up */
      var focusable = Array.prototype.filter.call(
        dialog.querySelectorAll('button'), function (b) { return !b.hidden; });
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* --- the strip ---------------------------------------------------------- */
  var grid = el('ul', { class: 'example-grid' });
  items.forEach(function (item, i) {
    var btn = el('button', { type: 'button', 'aria-label': 'Open example: ' + (item.alt || item.id) });
    btn.appendChild(el('img', { src: item.image, alt: '', loading: i < 4 ? 'eager' : 'lazy' }));
    btn.addEventListener('click', function () { open(i, btn); });
    grid.appendChild(el('li', {}, [btn]));
  });

  host.appendChild(el('h2', { text: 'Memorials of this kind we have made' }));
  host.appendChild(el('p', { class: 'sub',
    text: 'Photographs of finished work, to look at. None of these is a product ' +
          'and none of them commits you to anything — they are here to help you ' +
          'notice what you respond to.' }));
  host.appendChild(grid);
  if (entry.driveFolder && entry.driveFolder.name) {
    host.appendChild(el('p', { class: 'source',
      text: 'From the ' + entry.driveFolder.name + ' folder.' }));
  }
})();
