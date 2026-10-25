import test from 'node:test';
import assert from 'node:assert/strict';
import { makeNode, nodeInputProblems } from '../src/core/dataImport.js';
import { buildTree, computeDepths, findInvalidNodes, indexNodes } from '../src/core/tree.js';
import { isSafeColor, normalizeRule } from '../src/core/theme.js';
import { sanitizeSavedLayout } from '../src/core/layoutData.js';
import { buildChartSVG, escapeXml, exportBounds } from '../src/core/svgExport.js';
import { layoutOrgChart } from '../src/core/layout.js';
import { routeConnector } from '../src/core/connectors.js';
import { resolveConnectorGeometry, buildFamilyConnectorNetwork } from '../src/core/connectorGeometry.js';
import { ORIENTATIONS } from '../src/core/constants.js';

test('makeNode keeps only well-typed geometry and flags', () => {
  const n = makeNode({ id: 'a', parentId: 0, width: '240', height: -5, collapsed: 'false', layoutMode: 'Sideways', type: 'x" onclick="y' });
  assert.equal(n.parentId, 0);
  assert.deepEqual([n.width, n.height], [240, 380]);
  assert.equal(typeof n.width, 'number');
  assert.equal(n.collapsed, false);
  assert.equal(n.layoutMode, null);
  assert.equal(n.type, 'position');
  assert.equal(makeNode({ id: 'b', collapsed: 'true' }).collapsed, true);
  assert.deepEqual(makeNode(makeNode({ id: 'c', width: 300 })), makeNode({ id: 'c', width: 300 }));
  assert.deepEqual(
    nodeInputProblems({ id: 'a', width: '240', height: -5, collapsed: 'no', layoutMode: 'Sideways' }),
    ['width "240"', 'height -5', 'collapsed "no"', 'layoutMode "Sideways"'],
  );
});

test('id 0 is a usable parent', () => {
  const nodes = [{ id: 0, parentId: '' }, { id: 1, parentId: 0 }].map(makeNode);
  const tree = buildTree(nodes);
  assert.equal(tree.children.length, 1);
  assert.equal(tree.children[0].children[0].node.id, 1);
  const layout = layoutOrgChart([{ id: 0, label: 'ROOT', type: 'department' }, { id: 1, parentId: 0, label: 'CHILD' }], { subtreeMode: 'Balanced' });
  const child = layout.positioned.find((p) => p.node.id === 1);
  const root = layout.positioned.find((p) => p.node.id === 0);
  assert.ok(child.cy > root.cy, 'child sits below its parent instead of beside it as a second root');
});

test('duplicate ids, self-parents and cycles are reported instead of silently dropped', () => {
  assert.equal(findInvalidNodes([{ id: 'a', parentId: '' }, { id: 'b', parentId: 'missing' }]), null);
  assert.deepEqual(findInvalidNodes([{ id: 'a' }, { id: 'a' }]), { duplicateIds: ['a'], cycleIds: [] });
  assert.deepEqual(findInvalidNodes([{ id: 'a', parentId: 'a' }]), { duplicateIds: [], cycleIds: ['a'] });
  assert.deepEqual(
    findInvalidNodes([{ id: 'r' }, { id: 'a', parentId: 'b' }, { id: 'b', parentId: 'a' }, { id: 'c', parentId: 'a' }]),
    { duplicateIds: [], cycleIds: ['a', 'b'] },
  );
  assert.throws(() => layoutOrgChart([{ id: 'a', parentId: 'b' }, { id: 'b', parentId: 'a' }, { id: 'r' }]),
    (e) => e.code === 'INVALID_DATA' && e.details.cycleIds.join() === 'a,b');
  assert.throws(() => layoutOrgChart([{ id: 'x' }, { id: 'x', parentId: '' }]), (e) => e.code === 'INVALID_DATA');
});

test('computeDepths survives deep chains and cycles', () => {
  const chain = Array.from({ length: 20000 }, (_, i) => makeNode({ id: 'n' + i, parentId: i ? 'n' + (i - 1) : '' }));
  assert.equal(computeDepths(chain, indexNodes(chain))['n19999'], 19999);
  const cyc = [{ id: 'a', parentId: 'b' }, { id: 'b', parentId: 'a' }].map(makeNode);
  const d = computeDepths(cyc, indexNodes(cyc));
  assert.ok(Number.isFinite(d.a) && Number.isFinite(d.b));
});

test('theme rules keep colour literals only', () => {
  for (const ok of ['#fff', '#ffff', '#e0524d', '#e0524dcc', 'rgb(1, 2, 3)', 'rgba(1,2,3,.5)', 'hsl(120deg 50% 40%)']) assert.equal(isSafeColor(ok), true, ok);
  for (const bad of ['red;position:fixed', 'url(x)', '#fff" onerror="1', 'rgb(1,2)', 'expression(1)', 'var(--x)']) assert.equal(isSafeColor(bad), false, bad);
  assert.deepEqual(normalizeRule({ style: { bg: '"><img src=x>', text: '#000', border: 'red;top:0' } }).style, { bg: '', text: '#000', border: '' });
});

test('saved layouts from a PHP backend ([] for empty maps) validate cleanly', () => {
  const { layout, problems } = sanitizeSavedLayout({
    full: true,
    view: { spacingX: 40, orientation: 'Top', themeRules: [], renderedImage: { fit: 'contain', align: 'center', width: 420, height: 420, offsetX: 0, offsetY: 0 } },
    layout: { manualOffsets: [], edgeWaypoints: [], edgeAnchors: [], familyRouteOverrides: [], nodeOverrides: [], collapsed: [] },
  });
  assert.deepEqual(problems, []);
  assert.equal(layout.view.orientation, 'TopToBottom');
  assert.deepEqual(Object.keys(layout.layout.manualOffsets), []);
});

test('saved layouts drop every non-finite or mistyped entry and name it', () => {
  const { layout, problems } = sanitizeSavedLayout({
    full: true,
    view: { spacingX: 'wide', gridSize: Infinity, showGrid: 'yes', photoBackground: 'url(x)' },
    layout: {
      manualOffsets: { a: { dx: 1, dy: 2 }, b: { dx: '1', dy: 2 }, c: { dx: NaN, dy: 0 } },
      edgeWaypoints: { a: [{ x: 1, y: 2 }], b: [{ x: 'x', y: 1 }] },
      edgeAnchors: { a: { p: { nx: 0, ny: 1 } }, b: { c: { nx: 5, ny: 0 } } },
      familyRouteOverrides: { a: { trunkOffset: 22 }, b: { trunkOffset: '22' } },
      nodeOverrides: { a: { label: 'ok', width: '240"><x' }, b: { __deleted: true }, c: { evil: 1 } },
      collapsed: ['a', {}],
    },
  });
  assert.deepEqual(Object.keys(layout.view), []);
  assert.deepEqual(Object.keys(layout.layout.manualOffsets), ['a']);
  assert.deepEqual(Object.keys(layout.layout.edgeWaypoints), ['a']);
  assert.deepEqual(Object.keys(layout.layout.edgeAnchors), ['a']);
  assert.deepEqual(Object.keys(layout.layout.familyRouteOverrides), ['a']);
  assert.deepEqual({ ...layout.layout.nodeOverrides }, { a: { label: 'ok' }, b: { __deleted: true } });
  assert.deepEqual(layout.layout.collapsed, ['a']);
  for (const p of ['view.spacingX', 'view.gridSize', 'view.showGrid', 'view.photoBackground', 'manualOffsets.b', 'manualOffsets.c',
    'edgeWaypoints.b', 'edgeAnchors.b', 'familyRouteOverrides.b', 'nodeOverrides.a.width', 'nodeOverrides.c.evil', 'collapsed {}']) {
    assert.ok(problems.some((q) => q.includes(p)), `${p} in ${problems.join(' | ')}`);
  }
});

const card = (over = {}) => Object.assign({
  id: 'p', parentId: '', type: 'position', label: 'TITLE', personName: 'NAME', status: 'FILLED',
  width: 240, height: 380, data: {},
}, over);
const svgFor = (node, opts = {}) => buildChartSVG([{ node, cx: 120, cy: 190 }], [], Object.assign({ measureText: (t) => String(t).length * 7 }, opts));

test('SVG export refuses non-numeric geometry instead of writing it into markup', () => {
  assert.throws(() => svgFor(card({ width: '240" onload="alert(1)' })), /node width must be a finite number/);
  assert.throws(() => svgFor(card({ height: NaN })), /finite number/);
});

test('SVG export strips characters XML cannot carry and escapes markup', () => {
  const svg = svgFor(card({ personName: 'A\u0000B\u0007C￾\uD800D <script>&', label: 'Ñiño é ]]>' }));
  assert.equal(/[\u0000-\u0008￾\uD800]/.test(svg), false);
  assert.match(svg, /ABCD &lt;SCRIPT&gt;&amp;/);
  assert.match(svg, /Ñiño é \]\]&gt;/);
  assert.equal(escapeXml('a\u000Bb\tc\nd'), 'ab\tc\nd');
});

test('SVG export clamps text like the card on screen and breaks long words', () => {
  const svg = svgFor(card({ label: Array.from({ length: 40 }, (_, i) => 'WORD' + i).join(' '), personName: 'X'.repeat(90) }));
  const lines = [...svg.matchAll(/font-size="12\.00"[^>]*>([^<]*)</g)].map((m) => m[1]);
  assert.equal(lines.length, 4);
  assert.ok(lines[3].endsWith('…'));
  const names = [...svg.matchAll(/font-weight="700" fill="#1a1a2e"[^>]*>([^<]*)</g)].map((m) => m[1]);
  assert.ok(names.length > 1 && names.length <= 3, names.join('|'));
  assert.ok(names.every((n) => n.length * 7 <= 224), names.join('|'));
});

test('exportBounds grows to include connector points outside the cards', () => {
  const positioned = [{ node: card(), cx: 120, cy: 190 }];
  assert.deepEqual(exportBounds(positioned, {}, [], 0), { x: 0, y: 0, w: 240, h: 380 });
  const b = exportBounds(positioned, {}, [{ d: 'M 120 0 L -500 0 L -500 900' }], 10);
  assert.deepEqual(b, { x: -511, y: -11, w: 761, h: 922 });
});

test('a family stem is painted even when another line sits in the same column at a different precision', () => {
  const family = buildFamilyConnectorNetwork('P', [
    { id: 'a', d: 'M 3523.401 0 L 3523.401 50 L 20 50 L 20 80' },
    { id: 'b', d: 'M 3523.401 0 L 3523.401 50 L 180 50 L 180 80' },
  ], { horizontalFlow: false });
  const geometry = resolveConnectorGeometry([
    { id: 'a', d: 'M 3523.401 0 L 3523.401 50 L 20 50 L 20 80' },
    { id: 'b', d: 'M 3523.401 0 L 3523.401 50 L 180 50 L 180 80' },
    { id: 'other', d: 'M 3523.4 200.0 L 3523.4 300.0' },
  ], [family]);
  const column = geometry.segments.filter((s) => Math.abs(s.a.x - 3523.4) < 0.01 && Math.abs(s.a.x - s.b.x) < 0.01);
  assert.equal(column.length, 2);
  assert.ok(column.some((s) => s.a.y === 0 && s.b.y === 50));
  assert.ok(column.some((s) => s.a.y === 200 && s.b.y === 300));
});

// Random trees from the connector audit (same generator and seed). Every
// point of every logical parent->child route must be covered by a painted
// segment, otherwise a child looks cut off from its parent.
function randomTrees(seed, count) {
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const trees = [];
  for (let t = 0; t < count; t++) {
    const n = 5 + Math.floor(rnd() * 30);
    const nodes = [{ id: 'n0', parentId: '', type: 'department', label: 'Root' }];
    for (let i = 1; i < n; i++) {
      const parent = nodes[Math.floor(Math.pow(rnd(), 1.6) * nodes.length)];
      const type = rnd() < 0.35 ? 'department' : 'position';
      nodes.push({ id: `n${i}`, parentId: parent.id, type, label: `Node ${i}`, personName: type === 'position' ? `Person ${i}` : '' });
    }
    if (rnd() < 0.25) nodes.push({ id: 'r2', parentId: '', type: 'department', label: 'Second root' }, { id: 'r2c', parentId: 'r2', type: 'position', label: 'x' });
    if (rnd() < 0.25) nodes[Math.floor(rnd() * nodes.length)].collapsed = true;
    trees.push(nodes);
  }
  return trees;
}
const points = (d) => { const v = String(d).match(/-?\d+(?:\.\d+)?/g).map(Number); const p = []; for (let i = 0; i + 1 < v.length; i += 2) p.push({ x: v[i], y: v[i + 1] }); return p; };
const onSegment = (pt, s, e = 0.11) => (Math.abs(s.a.y - s.b.y) < 1e-6
  ? Math.abs(pt.y - s.a.y) < e && pt.x >= Math.min(s.a.x, s.b.x) - e && pt.x <= Math.max(s.a.x, s.b.x) + e
  : Math.abs(pt.x - s.a.x) < e && pt.y >= Math.min(s.a.y, s.b.y) - e && pt.y <= Math.max(s.a.y, s.b.y) + e);
function unpaintedEdges(nodes, orientation, subtreeMode) {
  const L = layoutOrgChart(nodes, { orientation, subtreeMode, targetAspect: 1.6 });
  const logical = [];
  for (const child of L.positioned) {
    const parent = L.posById[child.node.parentId]; if (!parent) continue;
    logical.push({ id: child.node.id, d: routeConnector(parent, child, L.cfg, {}, {}, {}) });
  }
  const { segments } = resolveConnectorGeometry(logical, L.familyNetworks || []);
  return logical.filter((e) => {
    const pts = points(e.d);
    for (let i = 1; i < pts.length; i++) {
      for (let k = 0; k <= 8; k++) {
        const q = { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k / 8, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k / 8 };
        if (!segments.some((s) => onSegment(q, s))) return true;
      }
    }
    return false;
  }).map((e) => e.id);
}

test('every logical connector is painted on the audit trees that lost their stems', { timeout: 240000 }, () => {
  const trees = randomTrees(12345, 22);
  for (const t of [10, 21]) assert.deepEqual(unpaintedEdges(trees[t], 'RightToLeft', 'AutoSmart'), [], `tree ${t}`);
});

test('every logical connector is painted across orientations and legacy modes', { timeout: 240000 }, () => {
  const trees = randomTrees(4242, 8);
  for (const nodes of trees) {
    for (const orientation of ORIENTATIONS) {
      for (const mode of ['Balanced', 'Left', 'Alternate', 'Center']) {
        assert.deepEqual(unpaintedEdges(nodes, orientation, mode), [], `${orientation}/${mode}`);
      }
    }
  }
});
