// happy-dom environment for renderer tests. Importing this module installs the
// browser globals the renderer reads; happy-dom performs no layout, so the
// chart canvas reports the size held in `canvasSize`.
import { Window } from 'happy-dom';

export const win = new Window({ url: 'https://example.test/', width: 1280, height: 720 });
const g = globalThis;
for (const k of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'SVGElement', 'Image', 'Event',
  'MouseEvent', 'PointerEvent', 'WheelEvent', 'KeyboardEvent', 'CustomEvent', 'localStorage', 'getComputedStyle',
  'HTMLInputElement', 'HTMLButtonElement', 'HTMLFormElement', 'SubmitEvent', 'DOMParser', 'XMLSerializer', 'MutationObserver']) {
  try { Object.defineProperty(g, k, { value: win[k], configurable: true, writable: true }); } catch { /* read-only global */ }
}
g.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
g.cancelAnimationFrame = (id) => clearTimeout(id);
// happy-dom canvases have no 2d context; the renderer only measures text.
win.HTMLCanvasElement.prototype.getContext = function () {
  return { font: '', measureText: (t) => ({ width: String(t).length * 7 }), drawImage() {}, setTransform() {} };
};

export const canvasSize = { w: 1200, h: 700 };
for (const [prop, key] of [['clientWidth', 'w'], ['clientHeight', 'h']]) {
  const desc = Object.getOwnPropertyDescriptor(win.HTMLElement.prototype, prop)
    || Object.getOwnPropertyDescriptor(win.Element.prototype, prop);
  Object.defineProperty(win.HTMLElement.prototype, prop, {
    configurable: true,
    get() {
      if (this.classList && this.classList.contains('loc-canvas')) return canvasSize[key];
      return desc && desc.get ? desc.get.call(this) : 0;
    },
  });
}
const baseRect = win.HTMLElement.prototype.getBoundingClientRect;
win.HTMLElement.prototype.getBoundingClientRect = function () {
  if (this.classList && this.classList.contains('loc-canvas')) {
    const { w, h } = canvasSize;
    return { left: 0, top: 0, right: w, bottom: h, width: w, height: h, x: 0, y: 0 };
  }
  return baseRect.call(this);
};

export const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

export function sampleNodes(n = 12) {
  const nodes = [{ id: 'root', type: 'department', label: 'ROOT OFFICE' }];
  for (let i = 0; i < n; i++) {
    nodes.push({ id: 'p' + i, parentId: i < 3 ? 'root' : 'p' + (i % 3), type: 'position', label: 'TITLE ' + i, personName: 'PERSON ' + i, status: 'FILLED' });
  }
  return nodes;
}

export function pointer(type, target, x, y, extra = {}) {
  const ev = new win.PointerEvent(type, {
    bubbles: true, cancelable: true, clientX: x, clientY: y,
    pointerId: extra.pointerId || 1, button: extra.button || 0, buttons: extra.buttons ?? 1,
    ctrlKey: !!extra.ctrlKey, altKey: !!extra.altKey, pointerType: extra.pointerType || 'mouse',
  });
  target.dispatchEvent(ev);
  return ev;
}

export async function mountChart(opts = {}) {
  const { createOrgChart } = await import('../../src/vanilla/createOrgChart.js');
  const host = document.createElement('div');
  document.body.appendChild(host);
  const chart = createOrgChart(host, Object.assign({ nodes: sampleNodes(), layoutWorker: false }, opts));
  await chart.whenLayoutSettled();
  return { host, chart, canvas: host.querySelector('.loc-canvas') };
}
