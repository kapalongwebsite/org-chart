import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutOrgChart } from '../src/core/layout.js';
import { snapshotGeometry, GOLDEN_OPTIONS } from './fixtures/geometry.mjs';
import { loadRealCharts, loadGolden } from './fixtures/charts.mjs';

test('real office charts keep their approved GridSmart geometry', () => {
  const charts = loadRealCharts();
  assert.equal(charts.length, 28);
  for (const chart of charts) {
    const actual = snapshotGeometry(layoutOrgChart(chart.nodes, GOLDEN_OPTIONS));
    assert.deepEqual(actual, loadGolden(chart.name), `${chart.name} geometry changed`);
  }
});
