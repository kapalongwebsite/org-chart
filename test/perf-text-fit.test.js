import test from 'node:test';
import assert from 'node:assert/strict';
import { win, mountChart } from './helpers/dom.mjs';

// happy-dom performs no layout. Text blocks report a content height that grows
// with their text length and the card's --loc-fit scale; the card itself
// always reports overflow, like a real card whose collapse handle hangs below
// its bottom edge.
const TEXT = ['loc-ptext', 'loc-pname', 'loc-ptitle', 'loc-lbl'];
const BLOCK_HEIGHT = 100;
let reads = 0, phase = 'write', flips = 0;
function fitOf(el) {
  const card = el.closest('.loc-node');
  return Number(card?.style.getPropertyValue('--loc-fit') || 1);
}
function measured(el, key) {
  if (phase === 'write') { phase = 'read'; flips += 1; }
  reads += 1;
  if (el.classList.contains('loc-node')) return key === 'scrollHeight' ? 999 : 380;
  const length = (el.textContent || '').length;
  return key === 'scrollHeight' ? Math.round(length * 4 * fitOf(el)) : BLOCK_HEIGHT;
}
for (const key of ['scrollHeight', 'clientHeight']) {
  Object.defineProperty(win.HTMLElement.prototype, key, {
    configurable: true,
    get() {
      if (this.classList && (this.classList.contains('loc-node') || TEXT.some((c) => this.classList.contains(c)))) return measured(this, key);
      return 0;
    },
  });
}
const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
win.CSSStyleDeclaration.prototype.setProperty = function (name, ...rest) {
  if (name === '--loc-fit') phase = 'write';
  return setProperty.call(this, name, ...rest);
};

function nodes(count, label) {
  const list = [{ id: 'root', type: 'department', label: 'OFFICE' }];
  for (let i = 0; i < count; i++) list.push({ id: 'p' + i, parentId: i ? 'p0' : 'root', type: 'position', label, personName: 'NAME' });
  return list;
}

test('cards whose text fits keep full-size text despite the hanging toggle', async () => {
  const { host, chart } = await mountChart({ nodes: nodes(6, 'CLERK') });
  const fits = [...host.querySelectorAll('.loc-node')].map((card) => card.style.getPropertyValue('--loc-fit'));
  assert.ok(fits.length > 0);
  assert.deepEqual([...new Set(fits)], ['1']);
  chart.destroy();
});

test('long text shrinks only as far as needed and stops at the floor', async () => {
  const fitting = 'X'.repeat(28);       // 112 at full size, fits at <= ~0.89
  const huge = 'X'.repeat(200);         // never fits; lands on the 0.72 floor
  const { host, chart } = await mountChart({ nodes: [
    { id: 'root', type: 'department', label: 'OFFICE' },
    { id: 'a', parentId: 'root', type: 'position', label: fitting, personName: 'N' },
    { id: 'b', parentId: 'root', type: 'position', label: huge, personName: 'N' },
  ] });
  const fit = (id) => Number(host.querySelector(`.loc-node[data-id="${id}"]`).style.getPropertyValue('--loc-fit'));
  assert.equal(fit('root'), 1);
  assert.ok(fit('a') < 0.9 && fit('a') > 0.85, String(fit('a')));
  assert.equal(fit('b'), 0.72);
  chart.destroy();
});

test('fitting a batch of cards costs one layout per search step, not per card', async () => {
  flips = 0;
  const { chart } = await mountChart({ nodes: nodes(40, 'X'.repeat(30)) });
  // 1 initial read + 7 binary-search steps; a per-card fit would flip 300+ times.
  assert.ok(flips <= 9, `layout flushes: ${flips}`);
  chart.destroy();
});
