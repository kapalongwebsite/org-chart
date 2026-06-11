// Bounds + fit math — pure (no DOM).
import { effCenter } from './connectors.js';

/* bounding box of positioned nodes including manual offsets, with padding */
export function calculateBounds(positioned, manualOffsets, pad) {
  pad = pad == null ? 0 : pad;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of positioned) {
    const c = effCenter(p, manualOffsets);
    minX = Math.min(minX, c.x - p.node.width / 2);
    minY = Math.min(minY, c.y - p.node.height / 2);
    maxX = Math.max(maxX, c.x + p.node.width / 2);
    maxY = Math.max(maxY, c.y + p.node.height / 2);
  }
  if (!isFinite(minX)) return { x: 0, y: 0, w: 100, h: 100 };
  return { x: minX - pad, y: minY - pad, w: (maxX - minX) + pad * 2, h: (maxY - minY) + pad * 2 };
}

/* given content bounds + a viewport, return {zoom, panX, panY} that frames it */
export function fitBounds(bounds, viewportW, viewportH, opts = {}) {
  const maxZoom = opts.maxZoom != null ? opts.maxZoom : 1.4;
  const margin = opts.margin != null ? opts.margin : 0.92;
  const cw = bounds.w || 1, ch = bounds.h || 1;
  const zoom = Math.min(viewportW / cw, viewportH / ch, maxZoom) * margin;
  return {
    zoom,
    panX: (viewportW - cw * zoom) / 2 - bounds.x * zoom,
    panY: (viewportH - ch * zoom) / 2 - bounds.y * zoom,
  };
}
