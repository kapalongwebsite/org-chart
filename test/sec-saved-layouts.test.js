import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import './helpers/dom.mjs';

// De-identified copies of the saved office layouts in production use
// (synthetic labels; ids, structure, head flags and saved geometry kept).
// `expected` holds each card's effective centre as rendered by v1.18.7.
const dir = new URL('./fixtures/saved-layouts/', import.meta.url);
const fixtures = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();

function effectiveCentres(chart) {
  const offsets = chart.getLayout().layout.manualOffsets;
  const out = {};
  for (const p of chart.getPositioned()) {
    const o = offsets[p.node.id] || { dx: 0, dy: 0 };
    out[p.node.id] = [Math.round((p.cx + o.dx) * 100) / 100, Math.round((p.cy + o.dy) * 100) / 100];
  }
  return out;
}

test('every saved production layout applies without warnings and keeps its card positions', { timeout: 240000 }, async () => {
  const { createOrgChart } = await import('../src/vanilla/createOrgChart.js');
  assert.equal(fixtures.length, 10);
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => { warnings.push(args.join(' ')); };
  try {
    for (const file of fixtures) {
      const { nodes, layout, expected } = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
      const host = document.createElement('div');
      document.body.appendChild(host);
      const chart = createOrgChart(host, {
        nodes, subtreeMode: 'GridSmart', targetAspect: 1.6, targetSize: null, reflowOnResize: false,
        readonly: true, editMode: false, inspector: false, toolbar: false, layoutWorker: false,
      });
      const events = [];
      chart.on('input-warning', (e) => events.push(e));
      await chart.whenLayoutSettled();
      assert.equal(await chart.applyLayout(layout), true, file);
      assert.deepEqual(effectiveCentres(chart), expected, file);
      await Promise.resolve();
      assert.deepEqual(events, [], file);
      chart.destroy();
    }
  } finally {
    console.warn = originalWarn;
  }
  assert.deepEqual(warnings, []);
});
