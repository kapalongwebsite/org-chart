import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutOrgChart, layoutInputNode } from '../src/core/layout.js';
import { snapshotGeometry, GOLDEN_OPTIONS } from './fixtures/geometry.mjs';
import { loadRealCharts } from './fixtures/charts.mjs';
import { mountChart, sampleNodes } from './helpers/dom.mjs';

test('the solver input drops nothing that moves a card', () => {
  for (const chart of loadRealCharts()) {
    // Host payloads ride along on real nodes; they must not affect geometry.
    const hosted = chart.nodes.map((node) => ({
      ...node, personName: 'Someone', status: 'FILLED',
      data: { ...node.data, photo_url: 'https://example.test/p.png', originalNode: { deep: { tree: [1, 2, 3] } } },
    }));
    const full = snapshotGeometry(layoutOrgChart(hosted, GOLDEN_OPTIONS));
    const slim = snapshotGeometry(layoutOrgChart(hosted.map(layoutInputNode), GOLDEN_OPTIONS));
    assert.deepEqual(slim, full, chart.name);
  }
});

test('layoutInputNode keeps head labels and drops host data', () => {
  const head = layoutInputNode({ id: 'h', label: 'Municipal Mayor', data: { printRole: 'head', originalNode: {} } });
  const staff = layoutInputNode({ id: 's', label: 'Clerk', personName: 'A', data: { photo_url: 'x', originalNode: { a: 1 } } });
  assert.equal(head.label, 'Municipal Mayor');
  assert.deepEqual(head.data, { printRole: 'head' });
  assert.equal(staff.label, '');
  assert.deepEqual(staff.data, {});
  assert.equal('personName' in staff, false);
});

function captureLayouts(chart) {
  const done = [];
  chart.on('layout-complete', (detail) => done.push(detail));
  return done;
}

test('restoring a saved layout reuses the solved geometry', async () => {
  const nodes = sampleNodes(10);
  const { chart } = await mountChart({ nodes, subtreeMode: 'GridSmart', layoutCache: true });
  const done = captureLayouts(chart);
  const saved = JSON.parse(JSON.stringify(chart.getLayout()));
  // A JSON backend serialises an empty map as an empty list.
  saved.layout.familyRouteOverrides = [];
  await chart.applyLayout(saved);
  assert.equal(done.at(-1).cached, true);
  chart.destroy();
});

test('smart-edge toggles and non-structural text edits do not re-solve the layout', async () => {
  const nodes = sampleNodes(10);
  const { chart } = await mountChart({ nodes, subtreeMode: 'GridSmart', layoutCache: true });
  const done = captureLayouts(chart);
  chart.setAutoEdgeSide(true);
  await chart.whenLayoutSettled();
  chart.setAutoEdgeSide(false);
  await chart.whenLayoutSettled();
  chart.setNodes(nodes.map((node) => ({ ...node, personName: node.personName ? node.personName + ' Jr.' : node.personName })));
  await chart.whenLayoutSettled();
  assert.ok(done.length >= 1);
  assert.ok(done.every((detail) => detail.cached), JSON.stringify(done));
  chart.destroy();
});
