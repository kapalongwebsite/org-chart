// Stable, rounded geometry snapshot of a layoutOrgChart() result, used by the
// real-chart golden test. Coordinates are rounded to 3 decimals so the
// snapshot ignores floating-point noise but catches any visible change.
const round = (value) => Math.round(value * 1000) / 1000;

function roundDeep(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? round(value) : String(value);
  if (Array.isArray(value)) return value.map(roundDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (key === 'node' || key === 'parent') continue;
      out[key] = roundDeep(value[key]);
    }
    return out;
  }
  return value;
}

export function snapshotGeometry(result) {
  return roundDeep({
    positioned: result.positioned.map((p) => ({
      id: p.node.id, cx: p.cx, cy: p.cy, w: p.node.width, h: p.node.height,
      routePoints: p.routePoints || null,
    })),
    bounds: result.bounds,
    framingBounds: result.framingBounds,
    familyNetworks: result.familyNetworks,
  });
}

export const GOLDEN_OPTIONS = { subtreeMode: 'GridSmart', targetAspect: 1.6, orientation: 'TopToBottom' };
