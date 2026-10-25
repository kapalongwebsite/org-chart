import test from 'node:test';
import assert from 'node:assert/strict';
import { tick, sampleNodes } from './helpers/dom.mjs';

const { createApp, h, ref, nextTick } = await import('vue');
const { OrgChart } = await import('../src/vue/OrgChart.js');

async function mountVue(render) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const warnings = [];
  const app = createApp({ setup: () => render });
  app.config.warnHandler = (msg) => warnings.push(msg);
  app.config.errorHandler = (err) => warnings.push(String(err && err.message || err));
  app.mount(host);
  await nextTick();
  return { app, host, warnings, unmount: () => { app.unmount(); host.remove(); } };
}

test('a two-way settings binding does not loop', async () => {
  const settings = ref({ themeRules: [] });
  const chart = ref(null);
  let changes = 0;
  const { warnings, unmount } = await mountVue(() => h(OrgChart, {
    ref: chart, nodes: sampleNodes(), layoutWorker: false, settings: settings.value,
    'onSettings-change': (s) => { changes++; settings.value = s; },
  }));
  await tick(20);
  chart.value.setSettings({ spacingX: 60 });
  for (let i = 0; i < 5; i++) { await nextTick(); await tick(5); }
  assert.ok(changes <= 2, `settings-change fired ${changes} times`);
  assert.equal(chart.value.getSettings().spacingX, 60);
  assert.deepEqual(warnings.filter((w) => /recursive/i.test(w)), []);
  unmount();
});

test('an inline settings object does not relayout on every parent render', async () => {
  const counter = ref(0);
  const nodes = sampleNodes();
  let layouts = 0;
  const { unmount } = await mountVue(() => h('div', [
    h('span', counter.value),
    h(OrgChart, { nodes, layoutWorker: false, settings: { themeRules: [] }, 'onLayout-start': () => { layouts++; } }),
  ]));
  await tick(20);
  layouts = 0;
  for (let i = 0; i < 5; i++) { counter.value++; await nextTick(); await tick(5); }
  assert.equal(layouts, 0);
  unmount();
});

test('the first layout-change reaches Vue without a worker; maxZoom is honoured', async () => {
  const events = [];
  const chart = ref(null);
  const { unmount } = await mountVue(() => h(OrgChart, {
    ref: chart, nodes: sampleNodes(), layoutWorker: false, maxZoom: 2.5,
    'onLayout-change': (e) => events.push(e),
  }));
  await tick(10);
  assert.equal(events.length, 1);
  assert.equal(events[0].positioned.length, 13);
  chart.value.zoomBy(100);
  assert.equal(chart.value.getState().zoom, 2.5);
  assert.equal(chart.value.fitToScreen({ minZoom: 0.01 }), true);
  unmount();
});
