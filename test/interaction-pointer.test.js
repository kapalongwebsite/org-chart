import test from 'node:test';
import assert from 'node:assert/strict';
import { mountChart, pointer, tick, canvasSize, win } from './helpers/dom.mjs';

function card(host, id) { return host.querySelector(`.loc-node[data-id="${id}"]`); }
function cam(chart) { const s = chart.getState(); return { zoom: s.zoom, panX: s.panX, panY: s.panY }; }
function recorder(chart, names) {
  const seen = [];
  for (const n of names) chart.on(n, (p) => seen.push([n, p]));
  return seen;
}

test('view mode: pressing a card pans; a release without movement is the click that selects it', async () => {
  const { host, chart } = await mountChart({ readonly: true, inspector: false });
  const seen = recorder(chart, ['node-select']);
  const before = cam(chart);
  pointer('pointerdown', card(host, 'p0'), 300, 300);
  for (let i = 1; i <= 8; i++) pointer('pointermove', window, 300 + i * 5, 300 + i * 2);
  pointer('pointerup', window, 340, 316);
  const after = cam(chart);
  assert.equal(after.panX - before.panX, 40);
  assert.equal(after.panY - before.panY, 16);
  assert.equal(seen.length, 0, 'a pan from a card is not a selection');

  pointer('pointerdown', card(host, 'p1'), 200, 200);
  pointer('pointermove', window, 202, 201);   // jitter within the click slop
  pointer('pointerup', window, 202, 201);
  assert.deepEqual(cam(chart), after, 'a click never pans');
  assert.equal(seen.length, 1);
  assert.equal(seen[0][1].id, 'p1');
  assert.deepEqual(chart.getSelection(), ['p1']);
  chart.destroy();
});

test('edit mode: click jitter and snap never move a card or create history', async () => {
  const { host, chart } = await mountChart({ editMode: true, inspector: false, snapGrid: true, gridSize: 40 });
  const history = recorder(chart, ['history-change']);
  const seen = recorder(chart, ['node-select']);
  const centre = () => { const p = chart.getPositioned().find((q) => q.node.id === 'p2'); return p; };
  const offsetBefore = JSON.stringify(chart.getLayout().layout.manualOffsets);
  pointer('pointerdown', card(host, 'p2'), 500, 400);
  assert.equal(seen.length, 1, 'node-select fires on press in edit mode');
  pointer('pointermove', window, 502, 402);
  pointer('pointerup', window, 502, 402);
  await tick(5);
  assert.equal(JSON.stringify(chart.getLayout().layout.manualOffsets), offsetBefore);
  assert.equal(history.length, 0);
  assert.ok(centre());
  chart.destroy();
});

test('edit mode: right button never starts a card drag; middle button pans from a card', async () => {
  const { host, chart } = await mountChart({ editMode: true, inspector: false });
  const drags = recorder(chart, ['node-drag-start']);
  pointer('pointerdown', card(host, 'p0'), 300, 300, { button: 2, buttons: 2 });
  pointer('pointermove', window, 360, 360, { buttons: 2 });
  pointer('pointerup', window, 360, 360, { button: 2, buttons: 0 });
  assert.equal(drags.length, 0);

  const before = cam(chart);
  pointer('pointerdown', card(host, 'p0'), 300, 300, { button: 1, buttons: 4 });
  pointer('pointermove', window, 330, 310, { buttons: 4 });
  pointer('pointerup', window, 330, 310, { button: 1, buttons: 0 });
  assert.equal(drags.length, 0);
  assert.equal(cam(chart).panX - before.panX, 30);
  assert.equal(cam(chart).panY - before.panY, 10);
  chart.destroy();
});

test('pointercancel ends a pan; later moves do not drag the view', async () => {
  const { canvas, chart } = await mountChart({ readonly: true, inspector: false });
  pointer('pointerdown', canvas, 100, 100);
  pointer('pointermove', window, 150, 100);
  pointer('pointercancel', window, 150, 100);
  const after = cam(chart);
  pointer('pointermove', window, 400, 400, { buttons: 0 });
  assert.deepEqual(cam(chart), after);
  chart.destroy();
});

test('repeated pans do not grow the teardown listener list', async () => {
  // destroy() removes every listener the renderer still tracks; count those
  // removals after zero pans and after fifty.
  async function removalsAfterPans(n) {
    const { canvas, chart } = await mountChart({ readonly: true, inspector: false });
    for (let i = 0; i < n; i++) {
      pointer('pointerdown', canvas, 100, 100);
      pointer('pointermove', window, 120, 100);
      pointer('pointerup', window, 120, 100);
    }
    const origRemove = window.removeEventListener;
    let removals = 0;
    window.removeEventListener = function (type, fn, o) { removals++; return origRemove.call(this, type, fn, o); };
    try { chart.destroy(); } finally { window.removeEventListener = origRemove; }
    return removals;
  }
  assert.equal(await removalsAfterPans(50), await removalsAfterPans(0));
});

test('two-finger pinch zooms around the midpoint without a jump when fingers land or lift', async () => {
  const { canvas, chart } = await mountChart({ readonly: true, inspector: false });
  const touch = { pointerType: 'touch' };
  pointer('pointerdown', canvas, 100, 100, { ...touch, pointerId: 11 });
  pointer('pointermove', window, 130, 100, { ...touch, pointerId: 11 });
  const panned = cam(chart);
  pointer('pointerdown', canvas, 230, 100, { ...touch, pointerId: 12 });
  assert.deepEqual(cam(chart), panned, 'a landing finger does not move the view');

  // spread the fingers from 100px to 200px apart around a fixed midpoint
  pointer('pointermove', window, 80, 100, { ...touch, pointerId: 11 });
  pointer('pointermove', window, 280, 100, { ...touch, pointerId: 12 });
  const pinched = cam(chart);
  assert.ok(Math.abs(pinched.zoom / panned.zoom - 2) < 1e-9, 'zoom follows finger distance');
  const contentX = (180 - panned.panX) / panned.zoom;
  assert.ok(Math.abs((180 - pinched.panX) / pinched.zoom - contentX) < 1e-6, 'midpoint stays anchored');

  pointer('pointerup', window, 80, 100, { ...touch, pointerId: 11 });
  const lifted = cam(chart);
  assert.deepEqual(lifted, pinched, 'a lifting finger does not move the view');
  pointer('pointermove', window, 300, 120, { ...touch, pointerId: 12 });
  assert.equal(cam(chart).panX - lifted.panX, 20, 'the remaining finger keeps panning');
  assert.equal(cam(chart).panY - lifted.panY, 20);
  pointer('pointerup', window, 300, 120, { ...touch, pointerId: 12 });
  chart.destroy();
});

test('a press never starts a native text selection or drag on the chart', async () => {
  const { host, chart } = await mountChart({ readonly: true });
  const ev = new win.Event('selectstart', { bubbles: true, cancelable: true });
  card(host, 'p0').dispatchEvent(ev);
  assert.equal(ev.defaultPrevented, true);
  const drag = new win.Event('dragstart', { bubbles: true, cancelable: true });
  card(host, 'p0').dispatchEvent(drag);
  assert.equal(drag.defaultPrevented, true);
  chart.destroy();
});

test('a layout that lands mid-drag does not make the dragged card jump', async () => {
  const { host, chart } = await mountChart({ editMode: true, inspector: false, snapAlign: false });
  const centreOf = (id) => {
    const p = chart.getPositioned().find((q) => q.node.id === id);
    const o = chart.getLayout().layout.manualOffsets[id] || { dx: 0, dy: 0 };
    return { x: p.cx + o.dx, y: p.cy + o.dy };
  };
  const zoom = chart.getState().zoom;
  pointer('pointerdown', card(host, 'p4'), 400, 400);
  pointer('pointermove', window, 460, 400);
  await tick(5);
  const mid = centreOf('p4');
  await chart.setSpacing(80, 120);   // a full relayout lands while the pointer is still down
  pointer('pointermove', window, 470, 400);
  await tick(5);
  const after = centreOf('p4');
  assert.ok(Math.abs(after.x - (mid.x + 10 / zoom)) < 0.01, `x continued from ${mid.x} to ${after.x}`);
  assert.ok(Math.abs(after.y - mid.y) < 0.01);
  pointer('pointerup', window, 470, 400);
  chart.destroy();
  canvasSize.w = 1200; canvasSize.h = 700;
});
