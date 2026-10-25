import test from 'node:test';
import assert from 'node:assert/strict';
import { mountChart } from './helpers/dom.mjs';

test('renderer mounts, lays out every card and tears down', async () => {
  const { host, chart } = await mountChart();
  assert.equal(chart.getPositioned().length, 13);
  assert.equal(host.querySelectorAll('.loc-node').length, 13);
  chart.destroy();
  assert.equal(host.querySelectorAll('.loc-node').length, 0);
});
