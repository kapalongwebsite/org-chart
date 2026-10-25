import test from 'node:test';
import assert from 'node:assert/strict';
import { mountChart, pointer, tick, canvasSize, win, sampleNodes } from './helpers/dom.mjs';

function cam(chart) { const s = chart.getState(); return { zoom: s.zoom, panX: s.panX, panY: s.panY }; }
function wheel(target, init) {
  const ev = new win.WheelEvent('wheel', Object.assign({ bubbles: true, cancelable: true, clientX: 600, clientY: 350 }, init));
  target.dispatchEvent(ev);
  return ev;
}
function withCanvas(w, h, fn) {
  const prev = { ...canvasSize };
  canvasSize.w = w; canvasSize.h = h;
  return Promise.resolve().then(fn).finally(() => { canvasSize.w = prev.w; canvasSize.h = prev.h; });
}

test('a horizontal wheel pans and never zooms; the vertical wheel zooms in proportion to its distance', async () => {
  const { canvas, chart } = await mountChart({ readonly: true });
  const start = cam(chart);
  wheel(canvas, { deltaX: 50, deltaY: 0 });
  assert.equal(cam(chart).zoom, start.zoom);
  assert.equal(cam(chart).panX, start.panX - 50);
  const z0 = cam(chart).zoom;
  wheel(canvas, { deltaY: -100 });
  assert.ok(Math.abs(cam(chart).zoom / z0 - Math.exp(0.1)) < 1e-9);
  const z1 = cam(chart).zoom;
  wheel(canvas, { deltaY: -10 });   // a small trackpad step zooms a little
  assert.ok(Math.abs(cam(chart).zoom / z1 - Math.exp(0.01)) < 1e-9);
  chart.destroy();
});

test('zooming out never zooms in when the fitted view is below the wheel floor', async () => {
  await withCanvas(240, 160, async () => {
    const nodes = sampleNodes(60);
    const { canvas, chart } = await mountChart({ readonly: true, nodes });
    const fitted = cam(chart).zoom;
    assert.ok(fitted < 0.15, `fitted zoom ${fitted} is below the 15% floor`);
    for (let i = 0; i < 5; i++) wheel(canvas, { deltaY: 300, clientX: 120, clientY: 80 });
    assert.ok(cam(chart).zoom <= fitted + 1e-12, 'scrolling out did not zoom in');
    chart.destroy();
  });
});

test('a chart mounted with no size never gets a zero zoom and fits once it is laid out', async () => {
  await withCanvas(0, 0, async () => {
    const { canvas, chart } = await mountChart({ readonly: true });
    assert.equal(chart.fitToScreen(), false);
    const z = cam(chart);
    assert.ok(Number.isFinite(z.zoom) && z.zoom > 0);
    wheel(canvas, { deltaY: -100 });
    assert.ok(Number.isFinite(cam(chart).panX) && Number.isFinite(cam(chart).panY));
    canvasSize.w = 1000; canvasSize.h = 600;
    assert.equal(chart.fitToScreen(), true);
    assert.ok(cam(chart).zoom > 0 && cam(chart).zoom < 1.4);
    chart.destroy();
  });
});

test('fitToScreen({ minZoom }) shows a readable top-anchored view instead of a tiny overview', async () => {
  await withCanvas(375, 600, async () => {
    const { chart } = await mountChart({ readonly: true, nodes: sampleNodes(30) });
    chart.fitToScreen();
    const overview = cam(chart).zoom;
    assert.ok(overview < 0.5);
    assert.equal(chart.fitToScreen({ minZoom: 0.6 }), true);
    const v = cam(chart);
    assert.equal(v.zoom, 0.6);
    const root = chart.getPositioned().find((p) => p.node.id === 'root');
    assert.ok(Math.abs(v.panX + root.cx * v.zoom - 187.5) < 1e-6, 'root is horizontally centred');
    const top = Math.min(...chart.getPositioned().map((p) => p.cy - p.node.height / 2));
    assert.ok(Math.abs(v.panY + top * v.zoom - 24) < 1e-6, 'chart top sits at the margin');
    // a chart that already fits is framed normally
    chart.fitToScreen({ minZoom: 0.01 });
    assert.equal(cam(chart).zoom, overview);
    chart.destroy();
  });
});

test('zoomBy zooms around the canvas centre or a client point and respects maxZoom', async () => {
  const { chart } = await mountChart({ readonly: true, maxZoom: 2 });
  chart.fitToScreen();
  const a = cam(chart);
  const contentAtCentre = { x: (600 - a.panX) / a.zoom, y: (350 - a.panY) / a.zoom };
  chart.zoomBy(1.5);
  const b = cam(chart);
  assert.ok(Math.abs(b.zoom - a.zoom * 1.5) < 1e-9);
  assert.ok(Math.abs((600 - b.panX) / b.zoom - contentAtCentre.x) < 1e-6);
  assert.ok(Math.abs((350 - b.panY) / b.zoom - contentAtCentre.y) < 1e-6);
  chart.zoomBy(100, { x: 10, y: 10 });
  assert.equal(cam(chart).zoom, 2);
  chart.setOption('maxZoom', 3);
  chart.zoomBy(100);
  assert.equal(cam(chart).zoom, 3);
  chart.destroy();
});

test('the camera persists once when a pan settles, not on every move', async () => {
  const key = 'pan-persist-test';
  const stored = () => JSON.parse(globalThis.localStorage.getItem(key) || 'null');
  const { canvas, chart } = await mountChart({ readonly: true, persist: true, storageKey: key });
  await tick(200);
  const before = stored();
  pointer('pointerdown', canvas, 100, 100);
  for (let i = 1; i <= 30; i++) pointer('pointermove', window, 100 + i * 3, 100);
  pointer('pointerup', window, 190, 100);
  for (let i = 0; i < 20; i++) wheel(canvas, { deltaY: -20 });
  assert.equal(stored().panX, before.panX, 'nothing written while gesturing');
  assert.equal(stored().zoom, before.zoom);
  await tick(250);
  assert.equal(stored().panX, cam(chart).panX, 'written once the gestures settle');
  assert.equal(stored().zoom, cam(chart).zoom);
  chart.destroy();
  globalThis.localStorage.removeItem(key);
});

test('another element entering fullscreen does not refit this chart', async () => {
  const { chart } = await mountChart({ readonly: true });
  const seen = [];
  chart.on('fullscreen-change', (e) => seen.push(e));
  chart.zoomBy(1.7);
  const before = cam(chart);
  document.dispatchEvent(new win.Event('fullscreenchange'));
  assert.deepEqual(cam(chart), before);
  assert.equal(seen.length, 0);
  chart.destroy();
});

test('cards form an ARIA tree with one tab stop and arrow-key navigation', async () => {
  const { host, chart } = await mountChart({ readonly: false, inspector: false });
  const tree = host.querySelector('[role="tree"]');
  assert.ok(tree && tree.getAttribute('aria-label'));
  const items = [...host.querySelectorAll('.loc-node')];
  assert.ok(items.every((e) => e.getAttribute('role') === 'treeitem'));
  assert.equal(items.filter((e) => e.tabIndex === 0).length, 1);
  const rootCard = host.querySelector('.loc-node[data-id="root"]');
  assert.equal(rootCard.tabIndex, 0);
  assert.equal(rootCard.getAttribute('aria-level'), '1');
  assert.equal(rootCard.getAttribute('aria-expanded'), 'true');
  const p3 = host.querySelector('.loc-node[data-id="p3"]');
  assert.equal(p3.getAttribute('aria-level'), '3');
  assert.match(p3.getAttribute('aria-label'), /TITLE 3, PERSON 3, Filled/);

  const key = (target, k) => target.dispatchEvent(new win.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  key(rootCard, 'ArrowDown');
  const firstChild = chart.getPositioned().filter((p) => p.node.parentId === 'root').sort((a, b) => a.cx - b.cx)[0].node.id;
  assert.equal(document.activeElement && document.activeElement.dataset.id, firstChild);
  key(document.activeElement, 'ArrowRight');
  const second = chart.getPositioned().filter((p) => p.node.parentId === 'root').sort((a, b) => a.cx - b.cx)[1].node.id;
  assert.equal(document.activeElement.dataset.id, second);
  key(document.activeElement, 'ArrowUp');
  assert.equal(document.activeElement.dataset.id, 'root');
  assert.equal(items.filter((e) => e.tabIndex === 0).length, 1, 'still one tab stop');

  const seen = [];
  chart.on('node-select', (e) => seen.push(['select', e.id]));
  chart.on('node-click', (e) => seen.push(['click', e.id]));
  key(document.activeElement, 'Enter');
  assert.deepEqual(seen, [['select', 'root'], ['click', 'root']]);

  key(document.activeElement, '-');
  await chart.whenLayoutSettled();
  assert.equal(chart.getNodes().find((n) => n.id === 'root').collapsed, true);
  assert.equal(host.querySelector('.loc-node[data-id="root"]').getAttribute('aria-expanded'), 'false');
  chart.destroy();
});

test('the collapse toggle is a labelled button and every library button is type="button"', async () => {
  const { host, chart } = await mountChart({ readonly: false, toolbar: true, inspector: true });
  const toggle = host.querySelector('.loc-node[data-id="root"] [data-role="toggle"]');
  assert.equal(toggle.tagName, 'BUTTON');
  assert.equal(toggle.getAttribute('type'), 'button');
  assert.ok(toggle.getAttribute('aria-label'));
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  chart.openInspector('p0');
  chart.toggleSettings(true);
  await tick(0);
  const buttons = [...host.querySelectorAll('button')];
  assert.ok(buttons.length > 20);
  assert.deepEqual(buttons.filter((b) => b.getAttribute('type') !== 'button').map((b) => b.outerHTML.slice(0, 60)), []);
  for (const b of host.querySelectorAll('.loc-panel-close, .loc-legend-close')) assert.ok(b.getAttribute('aria-label'));
  chart.destroy();
});

test('destroy removes external drawers and leaves an inert instance', async () => {
  const targets = ['ins', 'set', 'leg'].map((id) => { const d = document.createElement('div'); d.id = 'ext-' + id; document.body.appendChild(d); return d; });
  const { chart } = await mountChart({ inspectorTarget: targets[0], settingsTarget: targets[1], legendTarget: targets[2], legend: true });
  assert.ok(targets.every((t) => t.children.length === 1));
  const seen = [];
  chart.on('layout-change', () => seen.push('layout-change'));
  chart.destroy();
  assert.ok(targets.every((t) => t.children.length === 0), 'external drawers removed');
  assert.equal(chart.fitToScreen(), null);
  assert.deepEqual(chart.getPositioned(), []);
  assert.equal(chart.isLayoutBusy(), false);
  assert.equal(await chart.whenLayoutSettled(), false);
  assert.equal(chart.relayout(), null);
  assert.equal(seen.length, 0);
  targets.forEach((t) => t.remove());
});
