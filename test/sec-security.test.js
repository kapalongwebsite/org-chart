import test from 'node:test';
import assert from 'node:assert/strict';
import { win, tick, sampleNodes } from './helpers/dom.mjs';

const { createOrgChart } = await import('../src/vanilla/createOrgChart.js');

const PAYLOAD = '240" onload="alert(1)"><script>alert(1)</script><rect x="';
function mount(opts = {}) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const chart = createOrgChart(host, Object.assign({ nodes: sampleNodes(), layoutWorker: false }, opts));
  return { host, chart };
}
function captureWarnings() {
  const warnings = [];
  const original = console.warn;
  console.warn = (...args) => { warnings.push(args.join(' ')); };
  return { warnings, restore: () => { console.warn = original; } };
}
function hostileLayout(chart) {
  const layout = JSON.parse(JSON.stringify(chart.getLayout()));
  layout.layout.nodeOverrides = { p1: { width: PAYLOAD, label: 'kept' }, p2: { height: 'NaN' } };
  layout.layout.manualOffsets = { p3: { dx: '10', dy: 5 }, p4: { dx: 12, dy: 8 } };
  layout.view.themeRules = [{ field: 'type', value: 'position', style: { bg: '"><img src=x onerror=alert(1)>', border: 'red;position:fixed;background:url(https://evil.test/x)' } }];
  layout.view.spacingX = '"><img src=x>';
  return layout;
}

test('a hostile saved layout is reduced to its valid entries and reported once', async () => {
  const cap = captureWarnings();
  try {
    const { chart } = mount({ editMode: true });
    await chart.whenLayoutSettled();
    await chart.applyLayout(hostileLayout(chart));
    const layout = chart.getLayout();
    assert.deepEqual(layout.layout.nodeOverrides, { p1: { label: 'kept' } });
    assert.deepEqual(Object.keys(layout.layout.manualOffsets), ['p4']);
    assert.equal(layout.view.spacingX, 40);
    assert.deepEqual(layout.view.themeRules[0].style, { bg: '', text: '', border: '' });
    const n1 = chart.getNodes().find((n) => n.id === 'p1');
    assert.equal(typeof n1.width, 'number');
    assert.equal(cap.warnings.length, 1);
    for (const entry of ['nodeOverrides.p1.width', 'nodeOverrides.p2.height', 'manualOffsets.p3', 'themeRules[0].style.bg', 'themeRules[0].style.border', 'view.spacingX']) {
      assert.ok(cap.warnings[0].includes(entry), entry);
    }
    const svg = chart.buildSVG(false, {});
    assert.equal(svg.includes('<script'), false);
    assert.equal(svg.includes('onload='), false);
    chart.destroy();
  } finally { cap.restore(); }
});

test('the settings drawer and legend only ever render validated colours', async () => {
  const cap = captureWarnings();
  try {
    const { host, chart } = mount({ toolbar: true, legend: true });
    await chart.whenLayoutSettled();
    await chart.applyLayout(hostileLayout(chart));
    chart.setSettings({ themeRules: [{ field: 'type', value: 'position', style: { bg: '#ff0000' } }, { field: 'status', value: 'FILLED', style: { bg: 'red" onfocus="x' } }] });
    chart.toggleSettings(true);
    chart.setShowLegend(true);
    assert.equal(host.querySelectorAll('.loc-settings img, .loc-legend img').length, 0);
    const colors = [...host.querySelectorAll('.loc-settings input[type="color"]')].map((i) => i.getAttribute('value'));
    assert.ok(colors.every((c) => /^#[0-9a-f]{6}$/i.test(c)), colors.join(','));
    const swatches = [...host.querySelectorAll('.loc-legend .loc-leg-swatch[style]')].map((e) => e.getAttribute('style'));
    assert.ok(swatches.every((st) => !/position|url\(/.test(st)), swatches.join(' | '));
    chart.destroy();
  } finally { cap.restore(); }
});

function fakePopup() {
  const real = document.implementation.createHTMLDocument('popup');
  let html = '';
  const popup = {
    closed: false, printed: false,
    focus() {}, print() { popup.printed = true; },
    document: {
      open() { html = ''; }, write(h) { html += h; }, close() {},
      querySelector: () => null,
      createElement: (tag) => real.createElement(tag),
      body: real.body,
    },
    html: () => html,
    body: real.body,
  };
  return popup;
}

test('PDF export opens its window synchronously and shows the chart only as an image', async () => {
  const nodes = sampleNodes().map((n) => (n.id === 'p1' ? { ...n, label: '<script>alert(1)</script>', personName: '<img src=x onerror=alert(1)>' } : n));
  const { chart } = mount({ nodes });
  await chart.whenLayoutSettled();
  const popup = fakePopup();
  const blobs = [];
  const createURL = URL.createObjectURL, revokeURL = URL.revokeObjectURL, open = window.open;
  URL.createObjectURL = (b) => { blobs.push(b); return 'blob:chart-' + blobs.length; };
  URL.revokeObjectURL = () => {};
  let openedBeforeReturn = false;
  window.open = () => { openedBeforeReturn = true; return popup; };
  try {
    const pending = chart.exportPDF();
    assert.equal(openedBeforeReturn, true);
    assert.equal(popup.html().includes('alert'), false);
    assert.equal(popup.html().includes('TITLE'), false);
    await tick(5);
    const img = popup.body.querySelector('img');
    assert.ok(img, 'chart image appended');
    assert.equal(img.getAttribute('src'), 'blob:chart-1');
    assert.equal(blobs[0].type, 'image/svg+xml;charset=utf-8');
    assert.equal(popup.body.querySelectorAll('script').length, 0);
    img.onload();
    assert.equal(await pending, true);
    assert.equal(popup.printed, true);
  } finally {
    URL.createObjectURL = createURL; URL.revokeObjectURL = revokeURL; window.open = open;
    chart.destroy();
  }
});

test('PDF export reports a blocked pop-up as false', async () => {
  const { chart } = mount();
  await chart.whenLayoutSettled();
  const open = window.open;
  window.open = () => null;
  try { assert.equal(await chart.exportPDF(), false); } finally { window.open = open; chart.destroy(); }
});

test('a photo that never loads cannot hold an export forever', async () => {
  const nodes = sampleNodes().map((n) => (n.type === 'position' ? { ...n, data: { photo_url: 'https://photos.test/' + n.id + '.png' } } : n));
  const OriginalImage = globalThis.Image;
  class StalledImage { constructor() { this.onload = null; this.onerror = null; } set src(v) { this._src = v; } get src() { return this._src; } }
  const cap = captureWarnings();
  const createURL = URL.createObjectURL, revokeURL = URL.revokeObjectURL;
  URL.createObjectURL = () => 'blob:x'; URL.revokeObjectURL = () => {};
  const click = win.HTMLAnchorElement.prototype.click;
  win.HTMLAnchorElement.prototype.click = function () {};
  try {
    const { chart } = mount({ nodes, exportPhotoTimeout: 30, showImages: true });
    await chart.whenLayoutSettled();
    globalThis.Image = StalledImage;   // cards are drawn; only the export's photo loads stall
    const started = Date.now();
    const svg = await chart.exportSVG();
    assert.ok(Date.now() - started < 2000);
    assert.equal(svg.includes('photos.test'), true);   // SVG export keeps the external link
    assert.ok(cap.warnings.some((w) => /placeholders for 12 photo\(s\).*timed out/.test(w)), cap.warnings.join('\n'));
    chart.destroy();
  } finally {
    globalThis.Image = OriginalImage; URL.createObjectURL = createURL; URL.revokeObjectURL = revokeURL;
    win.HTMLAnchorElement.prototype.click = click; cap.restore();
  }
});

test('duplicate ids and parent cycles reject the layout instead of drawing part of it', async () => {
  const cap = captureWarnings();
  try {
    const dup = sampleNodes().concat([{ id: 'p3', parentId: 'root', type: 'position', label: 'COPY' }]);
    const { host, chart } = mount({ nodes: dup });
    const errors = [];
    chart.on('layout-error', (e) => errors.push(e.error));
    assert.equal(await chart.whenLayoutSettled(), false);
    await tick(0);
    assert.equal(errors[0].code, 'INVALID_DATA');
    assert.deepEqual(errors[0].details, { duplicateIds: ['p3'], cycleIds: [] });
    assert.equal(host.querySelectorAll('.loc-node').length, 0);

    const cyclic = sampleNodes().map((n) => (n.id === 'p1' ? { ...n, parentId: 'p4' } : n));
    assert.equal(await chart.setNodes(cyclic), false);
    await tick(0);
    assert.deepEqual(errors[1].details, { duplicateIds: [], cycleIds: ['p1', 'p4'] });
    chart.collapseAll();   // must not overflow on the cycle
    await tick(0);

    assert.equal(await chart.setNodes(sampleNodes()), true);
    assert.equal(host.querySelectorAll('.loc-node').length, 13);
    chart.destroy();
  } finally { cap.restore(); }
});

test('export bounds include manual waypoints outside the cards', async () => {
  const { chart } = mount({ editMode: true });
  await chart.whenLayoutSettled();
  const layout = JSON.parse(JSON.stringify(chart.getLayout()));
  const p7 = chart.getPositioned().find((p) => p.node.id === 'p7');
  layout.layout.edgeWaypoints = { p7: [{ x: -600, y: p7.cy - 300 }] };
  await chart.applyLayout(layout);
  const svg = chart.buildSVG(false, {});
  const width = Number(svg.match(/<svg[^>]* width="(\d+)"/)[1]);
  const shift = Number(svg.match(/<g transform="translate\(([-\d.]+),/)[1]);
  assert.ok(shift >= 600 + 40 - 1, `content shifted by ${shift}`);
  const cardsOnly = chart.getPositioned().reduce((m, p) => Math.max(m, p.cx + p.node.width / 2), 0);
  assert.ok(width > cardsOnly + 600, `width ${width}`);
  chart.destroy();
});
