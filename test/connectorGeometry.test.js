import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFamilyConnectorNetwork,
  buildVisibleConnectorSegments,
  resolveConnectorGeometry,
} from '../src/core/connectorGeometry.js';
import { buildChartSVG } from '../src/core/svgExport.js';
import { routeConnector } from '../src/core/connectors.js';

test('visible connector geometry paints a shared five-child stem and bus once', () => {
  const logicalPaths = [
    'M 1452 1905 L 1452 1964 L 968 1964 L 968 1974',
    'M 1452 1905 L 1452 1964 L 1210 1964 L 1210 1974',
    'M 1452 1905 L 1452 1974',
    'M 1452 1905 L 1452 1964 L 1672 1964 L 1672 1974',
    'M 1452 1905 L 1452 1964 L 1914 1964 L 1914 1974',
  ];
  const visible = buildVisibleConnectorSegments(logicalPaths);

  assert.equal(visible.filter((segment) => segment.a.x === 1452 && segment.b.x === 1452).length, 1,
    'the shared parent stem must be one visible segment, not five stacked paths');
  assert.ok(visible.some((segment) => segment.a.y === 1964 && segment.b.y === 1964
    && segment.a.x === 968 && segment.b.x === 1914),
  'overlapping left and right child routes should become one continuous visible bus');
  assert.equal(visible.length, 6,
    'the visible union is one stem, one bus, and four off-axis child drops');
  assert.deepEqual(new Set(visible.flatMap((segment) => segment.memberIds)), new Set(['0', '1', '2', '3', '4']));

  const svg = buildChartSVG([], logicalPaths);
  assert.equal((svg.match(/<path d=/g) || []).length, 6,
    'standalone SVG/PNG/PDF source must use the same deduplicated visible geometry');
});

test('shared geometry uses the family style while private branches keep child styles', () => {
  const sharedStyle = { color: '#444', width: 1 };
  const visible = buildVisibleConnectorSegments([
    { id: 'left', d: 'M 50 0 L 50 20 L 0 20 L 0 30', style: { color: 'red', width: 2 } },
    { id: 'right', d: 'M 50 0 L 50 20 L 100 20 L 100 30', style: { color: 'blue', width: 3 } },
  ], { sharedStyle });

  const trunk = visible.find((segment) => segment.a.x === 50 && segment.b.x === 50);
  const leftDrop = visible.find((segment) => segment.a.x === 0 && segment.b.x === 0);
  const rightDrop = visible.find((segment) => segment.a.x === 100 && segment.b.x === 100);
  assert.deepEqual(trunk.style, sharedStyle);
  assert.deepEqual(leftDrop.style, { color: 'red', width: 2 });
  assert.deepEqual(rightDrop.style, { color: 'blue', width: 3 });
});

test('family connector is a parent-owned physical network, not a collection of painted child paths', () => {
  const logical = [
    { id: 'left', d: 'M 100 0 L 100 40 L 20 40 L 20 80' },
    { id: 'middle', d: 'M 100 0 L 100 80' },
    { id: 'right', d: 'M 100 0 L 100 40 L 180 40 L 180 80' },
  ];
  const network = buildFamilyConnectorNetwork('parent', logical, { horizontalFlow: false });

  assert.equal(network.model, 'shared-family-network');
  assert.equal(network.parentId, 'parent');
  assert.deepEqual(network.childIds, ['left', 'middle', 'right']);
  assert.ok(network.stemSegments.length >= 1, 'the parent must own one shared stem');
  assert.ok(network.stemSegments.every((segment) => segment.childIds.length === 3));
  assert.ok(network.buses.length >= 1, 'the family must own its shared bus');
  assert.deepEqual(network.branches.map((branch) => branch.childId), ['left', 'middle', 'right']);
  assert.ok(network.branches.every((branch) => branch.segments.length >= 1),
    'each child should own only a private final branch');

  const physicalKeys = network.segments.map((segment) => {
    const ends = [`${segment.a.x},${segment.a.y}`, `${segment.b.x},${segment.b.y}`].sort();
    return ends.join('|');
  });
  assert.equal(new Set(physicalKeys).size, physicalKeys.length,
    'a physical family interval must exist exactly once');

  const styled = resolveConnectorGeometry(logical.map((entry) => ({
    ...entry,
    style: { color: entry.id === 'left' ? 'red' : entry.id === 'right' ? 'blue' : 'purple' },
  })), [network], { sharedStyle: { color: 'green' } });
  const familyBus = styled.segments.find((segment) => segment.a.y === 40 && segment.b.y === 40);
  const leftBranch = styled.segments.find((segment) => segment.a.x === 20 && segment.b.x === 20);
  assert.deepEqual(familyBus.style, { color: 'green' }, 'the full family bus owns the family style');
  assert.deepEqual(leftBranch.style, { color: 'red' }, 'only the private branch keeps the child style');
});

test('configured family network is the primary geometry until a manual edit requests a rebuild', () => {
  const automatic = [
    { id: 'left', d: 'M 100 0 L 100 40 L 20 40 L 20 80' },
    { id: 'right', d: 'M 100 0 L 100 40 L 180 40 L 180 80' },
  ];
  const network = buildFamilyConnectorNetwork('parent', automatic, { horizontalFlow: false });
  const manuallyChangedLogicalPaths = [
    { id: 'left', d: 'M 100 0 L 999 0 L 999 80 L 20 80' },
    { id: 'right', d: 'M 100 0 L 999 0 L 999 80 L 180 80' },
  ];

  const primary = resolveConnectorGeometry(manuallyChangedLogicalPaths, [network]);
  assert.deepEqual(primary.standaloneIds, []);
  assert.ok(primary.segments.every((segment) => !segment.d.includes('999')),
    'logical relationship paths must not replace the configured physical network');

  const rebuilt = resolveConnectorGeometry(manuallyChangedLogicalPaths, [network], {
    rebuildFamilyIds: ['parent'],
  });
  assert.ok(rebuilt.segments.some((segment) => segment.d.includes('999')),
    'an explicit manual edit may rebuild the family network from edited constraints');
});

test('marquee-moved sibling cards carry their automatic row bus instead of leaving doglegs behind', () => {
  const parent = { cx: 100, cy: 80, node: { id: 'parent', width: 100, height: 50 } };
  const children = [40, 100, 160].map((cx, index) => ({
    cx,
    cy: 300,
    parentId: 'parent',
    routeType: 'packed',
    routePoints: [
      { x: 100, y: 120 },
      { x: 80, y: 120 },
      { x: 80, y: 230 },
      { x: cx, y: 230 },
    ],
    node: { id: `child-${index}`, parentId: 'parent', width: 50, height: 100 },
  }));
  const cfg = { orientation: 'TopToBottom', autoEdgeSide: false };
  const manualOffsets = Object.fromEntries(children.map((child) => [child.node.id, { dx: 40, dy: 60 }]));
  const paths = children.map((child) => ({
    id: child.node.id,
    d: routeConnector(parent, child, cfg, manualOffsets, {}, {}),
  }));
  const network = buildFamilyConnectorNetwork('parent', paths, { horizontalFlow: false });

  assert.ok(network.buses.some((bus) => bus.a.y === 290 && bus.b.y === 290
    && bus.a.x === 80 && bus.b.x === 200),
  'the shared row bus should move down by the same 60px as the marquee-selected cards');
  assert.ok(!network.buses.some((bus) => bus.a.y === 230 && bus.b.y === 230),
  'the selected family bus must not remain at its old row');
  assert.deepEqual(network.branches.map((branch) => branch.segments.at(-1)?.b.x).sort((a, b) => a - b),
    [80, 140, 200],
  'each private approach should finish at the card x-coordinate after the 40px group move');
});

test('marquee-moved sibling cards carry their automatic column bus in horizontal layouts', () => {
  const parent = { cx: 80, cy: 100, node: { id: 'parent', width: 80, height: 50 } };
  const children = [40, 100, 160].map((cy, index) => ({
    cx: 300,
    cy,
    parentId: 'parent',
    routeType: 'packed',
    routePoints: [
      { x: 120, y: 100 },
      { x: 120, y: 80 },
      { x: 230, y: 80 },
      { x: 230, y: cy },
    ],
    node: { id: `child-${index}`, parentId: 'parent', width: 50, height: 50 },
  }));
  const cfg = { orientation: 'LeftToRight', autoEdgeSide: false };
  const manualOffsets = Object.fromEntries(children.map((child) => [child.node.id, { dx: 60, dy: 40 }]));
  const paths = children.map((child) => ({
    id: child.node.id,
    d: routeConnector(parent, child, cfg, manualOffsets, {}, {}),
  }));
  const network = buildFamilyConnectorNetwork('parent', paths, { horizontalFlow: true });

  assert.ok(network.buses.some((bus) => bus.a.x === 290 && bus.b.x === 290
    && bus.a.y === 80 && bus.b.y === 200),
  'the shared column bus should move right by the same 60px as the marquee-selected cards');
  assert.ok(!network.buses.some((bus) => bus.a.x === 230 && bus.b.x === 230),
  'the selected family bus must not remain at its old column');
  assert.deepEqual(network.branches.map((branch) => branch.segments.at(-1)?.b.y).sort((a, b) => a - b),
    [80, 140, 200],
  'each private approach should finish at the card y-coordinate after the 40px group move');
});
