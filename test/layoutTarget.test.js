import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutOrgChart } from '../src/core/layout.js';
import { resolveInteractiveLayoutTarget } from '../src/vanilla/layoutTarget.js';

const NODES = [
  { id: 'root', label: 'Office Head' },
  { id: 'admin', parentId: 'root', label: 'Administrative Division' },
  { id: 'programs', parentId: 'root', label: 'Special Programs Division' },
  { id: 'admin-1', parentId: 'admin', label: 'Administrative Aide' },
  { id: 'admin-2', parentId: 'admin', label: 'Records Officer' },
  { id: 'programs-1', parentId: 'programs', label: 'Program Coordinator' },
  { id: 'programs-2', parentId: 'programs', label: 'Program Assistant' },
];

function geometryFor(options, viewport) {
  const target = resolveInteractiveLayoutTarget(options, viewport);
  const result = layoutOrgChart(NODES, {
    subtreeMode: 'GridSmart',
    ...target,
  });
  return {
    positioned: result.positioned.map(({ node, cx, cy, routePoints }) => ({
      id: node.id,
      cx,
      cy,
      routePoints,
    })),
    familyNetworks: result.familyNetworks,
  };
}

test('interactive geometry is independent of viewport size by default', () => {
  const desktop = geometryFor({ targetAspect: 1.6 }, { clientWidth: 1440, clientHeight: 720 });
  const tablet = geometryFor({ targetAspect: 1.6 }, { clientWidth: 768, clientHeight: 824 });
  const mobile = geometryFor({ targetAspect: 1.6 }, { clientWidth: 390, clientHeight: 620 });

  assert.deepEqual(tablet, desktop);
  assert.deepEqual(mobile, desktop);
});

test('responsive geometry uses the viewport only when explicitly enabled', () => {
  const viewport = { clientWidth: 390, clientHeight: 620 };

  assert.deepEqual(
    resolveInteractiveLayoutTarget({ targetAspect: 1.6, reflowOnResize: true }, viewport),
    { targetAspect: 1.6, targetSize: { width: 390, height: 620 } },
  );
});

test('an explicit target size takes precedence over the interactive viewport', () => {
  const targetSize = { width: 1024, height: 1024 };

  assert.deepEqual(
    resolveInteractiveLayoutTarget(
      { targetAspect: 1.6, targetSize, reflowOnResize: true },
      { clientWidth: 390, clientHeight: 620 },
    ),
    { targetAspect: 1.6, targetSize },
  );
});
