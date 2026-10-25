import test from 'node:test';
import assert from 'node:assert/strict';
import { win, tick, sampleNodes, pointer } from './helpers/dom.mjs';

const { createOrgChart } = await import('../src/vanilla/createOrgChart.js');

function mount(opts = {}) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const chart = createOrgChart(host, Object.assign({ nodes: sampleNodes(), layoutWorker: false }, opts));
  return { host, chart };
}
function centre(chart, id) {
  const p = chart.getPositioned().find((q) => q.node.id === id);
  const o = chart.getLayout().layout.manualOffsets[id] || { dx: 0, dy: 0 };
  return { x: Math.round(p.cx + o.dx), y: Math.round(p.cy + o.dy) };
}
function centres(chart) {
  return Object.fromEntries(chart.getPositioned().map((p) => [p.node.id, centre(chart, p.node.id)]));
}
function dragNode(host, chart, id, dx, dy) {
  const el = host.querySelector(`.loc-node[data-id="${id}"]`);
  const z = chart.getState().zoom;
  pointer('pointerdown', el, 100, 100);
  pointer('pointermove', window, 100 + dx * z, 100 + dy * z);
  pointer('pointerup', window, 100 + dx * z, 100 + dy * z);
}
function captureWarnings() {
  const warnings = [];
  const original = console.warn;
  console.warn = (...args) => { warnings.push(args.join(' ')); };
  return { warnings, restore: () => { console.warn = original; } };
}

test('undoing a mode change puts a moved card back where it was', async () => {
  const { host, chart } = mount({ editMode: true, subtreeMode: 'AutoSmart' });
  await chart.whenLayoutSettled();
  dragNode(host, chart, 'p7', 150, 90);
  await tick(5);
  const moved = centre(chart, 'p7');
  await chart.setSubtreeMode('Left');
  chart.undo();
  await chart.whenLayoutSettled();
  assert.equal(chart.getState().subtreeMode, 'AutoSmart');
  assert.deepEqual(centre(chart, 'p7'), moved);
  chart.destroy();
});

test('applyLayout and loadJSON restore saved positions while another mode is on screen', async () => {
  const a = mount({ editMode: true, subtreeMode: 'AutoSmart' });
  await a.chart.whenLayoutSettled();
  dragNode(a.host, a.chart, 'p7', 150, 90);
  await tick(5);
  const saved = JSON.parse(JSON.stringify(a.chart.getLayout()));
  const exported = JSON.parse(JSON.stringify(a.chart.exportJSON(false)));
  const expected = centres(a.chart);
  await a.chart.setSubtreeMode('Left');
  await a.chart.applyLayout(saved);
  assert.deepEqual(centres(a.chart), expected);
  a.chart.destroy();

  const b = mount({ editMode: true, subtreeMode: 'Left', spacingX: 10 });
  await b.chart.whenLayoutSettled();
  b.chart.loadJSON(exported);
  await b.chart.whenLayoutSettled();
  assert.equal(b.chart.getState().subtreeMode, 'AutoSmart');
  assert.equal(b.chart.getState().spacingX, 40);
  assert.deepEqual(centres(b.chart), expected);
  b.chart.destroy();
});

test('collapse, undo, redo returns exactly to the collapsed arrangement', async () => {
  const { chart } = mount({ nodes: sampleNodes(24) });
  await chart.whenLayoutSettled();
  chart.toggleCollapse('p1');
  await chart.whenLayoutSettled();
  const seen = centres(chart);
  chart.undo(); await chart.whenLayoutSettled();
  chart.redo(); await chart.whenLayoutSettled();
  assert.deepEqual(centres(chart), seen);
  chart.destroy();
});

test('undo and redo of a reparent tell the host the parent changed', async () => {
  const { chart } = mount({ editMode: true });
  await chart.whenLayoutSettled();
  const changes = [];
  chart.on('node-change', (e) => { if (e.reparented) changes.push([e.id, e.patch.parentId, !!e.history]); });
  chart.reparentNode('p7', 'p2');
  await chart.whenLayoutSettled();
  chart.undo(); await chart.whenLayoutSettled();
  chart.redo(); await chart.whenLayoutSettled();
  assert.deepEqual(changes, [['p7', 'p2', false], ['p7', 'p1', true], ['p7', 'p2', true]]);
  chart.destroy();
});

test('undo keeps per-node sizes and shares node data instead of copying it', async () => {
  const data = { photo_url: null, big: { nested: [1, 2, 3] } };
  const nodes = sampleNodes().map((n) => (n.id === 'p3' ? { ...n, data } : n));
  const { chart } = mount({ editMode: true, nodes });
  await chart.whenLayoutSettled();
  chart.updateNode('p4', { width: 400 });
  await chart.whenLayoutSettled();
  chart.updateNode('p5', { label: 'RENAMED' });
  chart.undo();
  await chart.whenLayoutSettled();
  const byId = Object.fromEntries(chart.getNodes().map((n) => [n.id, n]));
  assert.equal(byId.p4.width, 400);
  assert.equal(byId.p5.label, 'TITLE 5');
  assert.equal(byId.p3.data, data);
  chart.destroy();
});

test('per-node sizes from the data are respected; other cards follow the global card size', async () => {
  const nodes = sampleNodes().map((n) => (n.id === 'p2' ? { ...n, width: 330, height: 120 } : n));
  const { chart } = mount({ nodes, cardWidth: 260 });
  await chart.whenLayoutSettled();
  const byId = Object.fromEntries(chart.getNodes().map((n) => [n.id, n]));
  assert.deepEqual([byId.p2.width, byId.p2.height], [330, 120]);
  assert.equal(byId.p3.width, 260);
  chart.destroy();
});

test('manual geometry edits announce layout-change', async () => {
  const { host, chart } = mount({ editMode: true });
  await chart.whenLayoutSettled();
  const reasons = [];
  chart.on('layout-change', (e) => { if (e.edit) reasons.push(e.reason); });
  dragNode(host, chart, 'p7', 60, 40);
  await tick(5);
  const hit = host.querySelector('.loc-edgehits path[data-edge="p7"]');
  hit.dispatchEvent(new win.MouseEvent('dblclick', { bubbles: true, clientX: 300, clientY: 300 }));
  const handle = host.querySelector('.loc-edgehandles [data-wp="0"]');
  handle.dispatchEvent(new win.MouseEvent('dblclick', { bubbles: true }));
  assert.deepEqual(reasons, ['node-drag', 'waypoint-add', 'waypoint-remove']);
  chart.destroy();
});

test('a readonly chart refuses public edits', async () => {
  const cap = captureWarnings();
  try {
    const { chart } = mount({ readonly: true, editMode: true });
    await chart.whenLayoutSettled();
    assert.equal(chart.isEditMode(), false);
    assert.equal(chart.isReadonly(), true);
    assert.equal(chart.setEditMode(true), false);
    assert.equal(chart.updateNode('p1', { label: 'X' }), false);
    assert.equal(chart.reparentNode('p7', 'p2'), false);
    assert.equal(chart.deleteNode('p1'), false);
    assert.equal(chart.addChild('p1'), null);
    assert.equal(chart.getNodes().find((n) => n.id === 'p1').label, 'TITLE 1');
    assert.ok(cap.warnings.some((w) => /updateNode\(\) ignored because the chart is readonly/.test(w)));
    chart.destroy();
  } finally { cap.restore(); }
});

test('fresh data drops manual state for removed ids and wins over a local reparent', async () => {
  const { host, chart } = mount({ editMode: true });
  await chart.whenLayoutSettled();
  dragNode(host, chart, 'p7', 60, 40);
  await tick(5);
  const hit = host.querySelector('.loc-edgehits path[data-edge="p7"]');
  hit.dispatchEvent(new win.MouseEvent('dblclick', { bubbles: true, clientX: 300, clientY: 300 }));
  chart.reparentNode('p8', 'p1');
  await chart.whenLayoutSettled();
  await chart.setNodes(sampleNodes().filter((n) => n.id !== 'p7'));
  const layout = chart.getLayout().layout;
  assert.equal('p7' in layout.manualOffsets, false);
  assert.equal('p7' in layout.edgeWaypoints, false);
  assert.equal(chart.getNodes().find((n) => n.id === 'p8').parentId, 'p2');
  chart.destroy();
});

test('importing an older export replaces every manual map and restores its spacing', async () => {
  const { chart } = mount({ editMode: true });
  await chart.whenLayoutSettled();
  chart.updateNode('p3', { label: 'LOCAL EDIT' });
  chart.setFamilyRouteOverride('p1', { trunkOffset: 22 });
  await chart.whenLayoutSettled();
  const legacy = {   // a version-1 file: offsets + waypoints only
    orientation: 'TopToBottom', subtreeMode: 'Balanced', spacingX: 90, spacingY: 120,
    manualOffsets: {}, edgeWaypoints: {}, nodes: sampleNodes(),
  };
  chart.loadJSON(legacy);
  await chart.whenLayoutSettled();
  const layout = chart.getLayout().layout;
  assert.deepEqual(Object.keys(layout.nodeOverrides), []);
  assert.deepEqual(Object.keys(layout.familyRouteOverrides), []);
  assert.equal(chart.getNodes().find((n) => n.id === 'p3').label, 'TITLE 3');
  assert.deepEqual([chart.getState().spacingX, chart.getState().spacingY], [90, 120]);
  assert.equal(chart.exportJSON(false).version, 2);
  chart.destroy();
});

test('setSettings with unchanged values neither relayouts nor emits', async () => {
  const { chart } = mount();
  await chart.whenLayoutSettled();
  let starts = 0, changes = 0;
  chart.on('layout-start', () => { starts++; });
  chart.on('settings-change', () => { changes++; });
  assert.equal(chart.setSettings(chart.getSettings()), false);
  assert.equal(chart.setSettings({ spacingX: chart.getSettings().spacingX }), false);
  assert.deepEqual([starts, changes], [0, 0]);
  assert.equal(chart.setSettings({ spacingX: 55 }), true);
  assert.deepEqual([starts, changes], [1, 1]);
  chart.destroy();
});

test('the settings option sets spacing, grid and orientation at construction', async () => {
  const { chart } = mount({ settings: { spacingX: 77, gridSize: 30, orientation: 'LeftToRight', showGrid: true } });
  await chart.whenLayoutSettled();
  const s = chart.getSettings();
  assert.deepEqual([s.spacingX, s.gridSize, s.orientation, s.showGrid], [77, 30, 'LeftToRight', true]);
  chart.destroy();
});
