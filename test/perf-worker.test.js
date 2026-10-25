import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutOrgChart } from '../src/core/layout.js';
import { mountChart, sampleNodes, tick } from './helpers/dom.mjs';

// A Worker stand-in that runs the real solver on a later task, like the
// browser worker. `mode` controls how it answers.
function fakeWorkerClass(mode = 'answer') {
  const instances = [];
  class FakeWorker extends EventTarget {
    constructor() { super(); this.terminated = false; this.posted = 0; instances.push(this); }
    postMessage(message) {
      this.posted += 1;
      if (mode === 'silent') return;
      setTimeout(() => {
        if (this.terminated) return;
        if (mode === 'messageerror') { this.dispatchEvent(new MessageEvent('messageerror')); return; }
        if (mode === 'fail') {
          this.dispatchEvent(new MessageEvent('message', { data: { id: message.id, ok: false, error: { name: 'RangeError', message: 'solver exploded' } } }));
          return;
        }
        const result = layoutOrgChart(message.nodes, message.options);
        const data = { id: message.id, ok: true, durationMs: 1, result: JSON.parse(JSON.stringify({
          positioned: result.positioned, bounds: result.bounds, framingBounds: result.framingBounds,
          familyNetworks: result.familyNetworks, cfg: result.cfg,
        })) };
        this.dispatchEvent(new MessageEvent('message', { data }));
      }, 0);
    }
    terminate() { this.terminated = true; }
  }
  return { FakeWorker, instances };
}

async function withWorker(mode, fn) {
  const { FakeWorker, instances } = fakeWorkerClass(mode);
  globalThis.__testLayoutWorker = FakeWorker;
  globalThis.Worker = FakeWorker;
  try { await fn(instances); } finally { delete globalThis.__testLayoutWorker; delete globalThis.Worker; }
}

test('successive layouts reuse one worker and destroy terminates it', async () => {
  await withWorker('answer', async (instances) => {
    const { chart } = await mountChart({ layoutWorker: true, layoutCache: false });
    await chart.forceRelayout();
    chart.setNodes(sampleNodes(9));
    await chart.whenLayoutSettled();
    assert.equal(instances.length, 1);
    assert.ok(instances[0].posted >= 3);
    assert.equal(instances[0].terminated, false);
    chart.destroy();
    assert.equal(instances[0].terminated, true);
  });
});

test('a request superseding a running solve replaces the busy worker', async () => {
  await withWorker('answer', async (instances) => {
    const { chart } = await mountChart({ layoutWorker: true, layoutCache: false });
    chart.setNodes(sampleNodes(8));
    chart.setNodes(sampleNodes(10));
    assert.equal(await chart.whenLayoutSettled(), true);
    assert.equal(instances[0].terminated, true);
    assert.equal(instances.length, 2);
    assert.equal(chart.getPositioned().length, 11);
    chart.destroy();
  });
});

test('worker failures surface as layout-error with the original error name', async () => {
  await withWorker('fail', async () => {
    const errors = [];
    const { chart } = await mountChart({ layoutWorker: true, layoutCache: false });
    chart.on('layout-error', (detail) => errors.push(detail.error));
    chart.setNodes(sampleNodes(5));
    assert.equal(await chart.whenLayoutSettled(), false);
    assert.equal(errors.at(-1).name, 'RangeError');
    assert.equal(errors.at(-1).message, 'solver exploded');
    chart.destroy();
  });
  await withWorker('messageerror', async () => {
    const errors = [];
    const { chart } = await mountChart({ layoutWorker: true, layoutCache: false });
    chart.on('layout-error', (detail) => errors.push(detail.error));
    chart.setNodes(sampleNodes(5));
    assert.equal(await chart.whenLayoutSettled(), false);
    assert.match(errors.at(-1).message, /could not be read/);
    chart.destroy();
  });
});

test('a worker that never answers fails after layoutTimeout and is replaced', async () => {
  await withWorker('silent', async (instances) => {
    const errors = [];
    const { chart } = await mountChart({ layoutWorker: true, layoutCache: false, layoutTimeout: 30 });
    chart.on('layout-error', (detail) => errors.push(detail.error));
    chart.setNodes(sampleNodes(5));
    assert.equal(await chart.whenLayoutSettled(), false);
    await tick(5);
    assert.match(errors.at(-1).message, /did not answer/);
    assert.equal(instances.at(-1).terminated, true);
    chart.destroy();
  });
});
