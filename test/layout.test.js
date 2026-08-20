import test from 'node:test';
import assert from 'node:assert/strict';
import { connectFamilyPathsAtSharedBuses, layoutOrgChart } from '../src/core/layout.js';
import { edgeControlPoints, edgeEditingWaypoints, routeConnector } from '../src/core/connectors.js';
import { convertMoTree } from '../src/core/dataImport.js';

function officeFixture() {
  const nodes = [
    { id: 'office', type: 'department', label: 'Office' },
    { id: 'head', parentId: 'office', type: 'position', label: 'Office head', data: { is_head: true } },
  ];
  for (let index = 0; index < 15; index += 1) {
    nodes.push({ id: `direct-${index}`, parentId: 'office', type: 'position', label: `Direct staff ${index + 1}` });
  }
  nodes.push({ id: 'legislative', parentId: 'office', type: 'department', label: 'Legislative' });
  for (const [group, count] of [['members', 14], ['administration', 5], ['utility', 2]]) {
    nodes.push({ id: group, parentId: 'legislative', type: 'department', label: group });
    for (let index = 0; index < count; index += 1) {
      nodes.push({ id: `${group}-${index}`, parentId: group, type: 'position', label: `${group} ${index + 1}` });
    }
  }
  return nodes;
}

function overlaps(positioned) {
  const found = [];
  for (let i = 0; i < positioned.length; i += 1) {
    const a = positioned[i];
    for (let j = i + 1; j < positioned.length; j += 1) {
      const b = positioned[j];
      if (Math.abs(a.cx - b.cx) * 2 < a.node.width + b.node.width
        && Math.abs(a.cy - b.cy) * 2 < a.node.height + b.node.height) {
        found.push([a.node.id, b.node.id]);
      }
    }
  }
  return found;
}

function falseFamilyJunctions(networks) {
  const found = [];
  for (const network of networks || []) {
    const segments = network.segments || [];
    for (let firstIndex = 0; firstIndex < segments.length; firstIndex += 1) {
      const first = segments[firstIndex];
      for (let secondIndex = firstIndex + 1; secondIndex < segments.length; secondIndex += 1) {
        const second = segments[secondIndex];
        if ((first.childIds || []).some((id) => (second.childIds || []).includes(id))) continue;
        const firstHorizontal = Math.abs(first.a.y - first.b.y) < 0.01;
        const secondHorizontal = Math.abs(second.a.y - second.b.y) < 0.01;
        if (firstHorizontal === secondHorizontal) continue;
        const horizontal = firstHorizontal ? first : second;
        const vertical = firstHorizontal ? second : first;
        const crosses = vertical.a.x > Math.min(horizontal.a.x, horizontal.b.x) + 0.01
          && vertical.a.x < Math.max(horizontal.a.x, horizontal.b.x) - 0.01
          && horizontal.a.y > Math.min(vertical.a.y, vertical.b.y) + 0.01
          && horizontal.a.y < Math.max(vertical.a.y, vertical.b.y) - 0.01;
        if (crosses) found.push({ parentId: network.parentId, first, second });
      }
    }
  }
  return found;
}

function pathPoints(path) {
  const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
  const points = [];
  for (let index = 0; index < values.length; index += 2) points.push({ x: values[index], y: values[index + 1] });
  return points;
}

function routeTotals(result) {
  let bends = 0;
  let length = 0;
  for (const child of result.positioned) {
    if (!child.parentId) continue;
    const parent = result.posById[child.parentId];
    const points = pathPoints(routeConnector(parent, child, result.cfg, {}, {}, {}));
    bends += Math.max(0, points.length - 2);
    for (let index = 1; index < points.length; index += 1) {
      length += Math.abs(points[index].x - points[index - 1].x)
        + Math.abs(points[index].y - points[index - 1].y);
    }
  }
  return { bends, length };
}

/* Visible family buses are shared geometry even though each logical child edge
   retains a complete selectable path. Merge collinear intervals so a trunk is
   measured once rather than once per child. */
function connectorNetworkLength(result) {
  const lanes = new Map();
  for (const child of result.positioned) {
    if (!child.parentId) continue;
    const parent = result.posById[child.parentId];
    const points = pathPoints(routeConnector(parent, child, result.cfg, {}, {}, {}));
    for (let index = 1; index < points.length; index += 1) {
      const before = points[index - 1], after = points[index];
      const horizontal = Math.abs(before.y - after.y) < 0.01;
      const fixed = horizontal ? before.y : before.x;
      const start = Math.min(horizontal ? before.x : before.y, horizontal ? after.x : after.y);
      const end = Math.max(horizontal ? before.x : before.y, horizontal ? after.x : after.y);
      const key = `${horizontal ? 'h' : 'v'}:${fixed}`;
      if (!lanes.has(key)) lanes.set(key, []);
      lanes.get(key).push([start, end]);
    }
  }
  let length = 0;
  for (const intervals of lanes.values()) {
    intervals.sort((a, b) => a[0] - b[0]);
    let [start, end] = intervals[0];
    for (const [nextStart, nextEnd] of intervals.slice(1)) {
      if (nextStart <= end + 0.01) end = Math.max(end, nextEnd);
      else { length += end - start; start = nextStart; end = nextEnd; }
    }
    length += end - start;
  }
  return length;
}

function segmentCrossesCard(a, b, positioned) {
  const inset = 0.5;
  const left = positioned.cx - positioned.node.width / 2 + inset;
  const right = positioned.cx + positioned.node.width / 2 - inset;
  const top = positioned.cy - positioned.node.height / 2 + inset;
  const bottom = positioned.cy + positioned.node.height / 2 - inset;
  if (Math.abs(a.x - b.x) < 0.01) {
    return a.x > left && a.x < right && Math.max(a.y, b.y) > top && Math.min(a.y, b.y) < bottom;
  }
  if (Math.abs(a.y - b.y) < 0.01) {
    return a.y > top && a.y < bottom && Math.max(a.x, b.x) > left && Math.min(a.x, b.x) < right;
  }
  return true;
}

function unrelatedConnectorCrossings(result) {
  const edges = result.positioned.map((child) => {
    const parent = child.parentId == null ? null : result.posById[child.parentId];
    return {
      child,
      parentId: parent ? String(child.parentId) : null,
      points: parent ? pathPoints(routeConnector(parent, child, result.cfg, {}, {}, {})) : [],
    };
  }).filter((edge) => edge.parentId && edge.points.length > 1);
  const betweenOpen = (value, a, b) => value > Math.min(a, b) + 0.01 && value < Math.max(a, b) - 0.01;
  const crossings = [];
  for (let firstIndex = 0; firstIndex < edges.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < edges.length; secondIndex += 1) {
      const first = edges[firstIndex], second = edges[secondIndex];
      if (first.parentId === second.parentId) continue;
      for (let aIndex = 1; aIndex < first.points.length; aIndex += 1) {
        const a1 = first.points[aIndex - 1], a2 = first.points[aIndex];
        for (let bIndex = 1; bIndex < second.points.length; bIndex += 1) {
          const b1 = second.points[bIndex - 1], b2 = second.points[bIndex];
          const aHorizontal = Math.abs(a1.y - a2.y) < 0.01;
          const bHorizontal = Math.abs(b1.y - b2.y) < 0.01;
          if (aHorizontal === bHorizontal) continue;
          const horizontal = aHorizontal ? [a1, a2] : [b1, b2];
          const vertical = aHorizontal ? [b1, b2] : [a1, a2];
          if (betweenOpen(vertical[0].x, horizontal[0].x, horizontal[1].x)
            && betweenOpen(horizontal[0].y, vertical[0].y, vertical[1].y)) {
            crossings.push([first.child.node.id, second.child.node.id]);
          }
        }
      }
    }
  }
  return crossings;
}

function connectorBacktracks(result) {
  const found = [];
  for (const child of result.positioned) {
    if (!child.parentId) continue;
    const points = pathPoints(routeConnector(result.posById[child.parentId], child, result.cfg, {}, {}, {}));
    for (let index = 1; index < points.length - 1; index += 1) {
      const before = points[index - 1], point = points[index], after = points[index + 1];
      const horizontalReverse = Math.abs(before.y - point.y) < 0.01
        && Math.abs(point.y - after.y) < 0.01
        && (point.x - before.x) * (after.x - point.x) < 0;
      const verticalReverse = Math.abs(before.x - point.x) < 0.01
        && Math.abs(point.x - after.x) < 0.01
        && (point.y - before.y) * (after.y - point.y) < 0;
      if (horizontalReverse || verticalReverse) found.push(child.node.id);
    }
  }
  return found;
}

function connectorEndpointIssues(result) {
  const found = [];
  const horizontal = result.cfg.orientation === 'LeftToRight' || result.cfg.orientation === 'RightToLeft';
  for (const child of result.positioned) {
    if (!child.parentId) continue;
    const parent = result.posById[child.parentId];
    if (!parent) continue;
    const points = pathPoints(routeConnector(parent, child, result.cfg, {}, {}, {}));
    if (points.length < 2) continue;
    const first = points[0], afterFirst = points[1];
    const beforeLast = points.at(-2), last = points.at(-1);
    const badExit = horizontal
      ? Math.abs(first.y - afterFirst.y) > 0.01 || Math.abs(first.x - afterFirst.x) < 8
      : Math.abs(first.x - afterFirst.x) > 0.01 || Math.abs(first.y - afterFirst.y) < 8;
    const badEntry = horizontal
      ? Math.abs(beforeLast.y - last.y) > 0.01 || Math.abs(beforeLast.x - last.x) < 8
      : Math.abs(beforeLast.x - last.x) > 0.01 || Math.abs(beforeLast.y - last.y) < 8;
    if (badExit || badEntry) found.push(child.node.id);
  }
  return found;
}

function unrelatedConnectorOverlaps(result) {
  const edges = result.positioned.map((child) => {
    const parent = child.parentId == null ? null : result.posById[child.parentId];
    return {
      child,
      parentId: parent ? String(child.parentId) : null,
      points: parent ? pathPoints(routeConnector(parent, child, result.cfg, {}, {}, {})) : [],
    };
  }).filter((edge) => edge.parentId && edge.points.length > 1);
  const found = [];
  for (let firstIndex = 0; firstIndex < edges.length; firstIndex += 1) {
    const first = edges[firstIndex];
    for (let secondIndex = firstIndex + 1; secondIndex < edges.length; secondIndex += 1) {
      const second = edges[secondIndex];
      if (first.parentId === second.parentId) continue;
      for (let aIndex = 1; aIndex < first.points.length; aIndex += 1) {
        const a1 = first.points[aIndex - 1], a2 = first.points[aIndex];
        const aHorizontal = Math.abs(a1.y - a2.y) < 0.01;
        for (let bIndex = 1; bIndex < second.points.length; bIndex += 1) {
          const b1 = second.points[bIndex - 1], b2 = second.points[bIndex];
          const bHorizontal = Math.abs(b1.y - b2.y) < 0.01;
          if (aHorizontal !== bHorizontal) continue;
          const aligned = aHorizontal ? Math.abs(a1.y - b1.y) < 0.01 : Math.abs(a1.x - b1.x) < 0.01;
          if (!aligned) continue;
          const aStart = aHorizontal ? a1.x : a1.y;
          const aEnd = aHorizontal ? a2.x : a2.y;
          const bStart = aHorizontal ? b1.x : b1.y;
          const bEnd = aHorizontal ? b2.x : b2.y;
          const overlap = Math.min(Math.max(aStart, aEnd), Math.max(bStart, bEnd))
            - Math.max(Math.min(aStart, aEnd), Math.min(bStart, bEnd));
          if (overlap > 0.01) found.push([first.child.node.id, second.child.node.id]);
        }
      }
    }
  }
  return found;
}

function connectorCardCrossings(result) {
  const crossings = [];
  for (const child of result.positioned) {
    if (!child.parentId) continue;
    const parent = result.posById[child.parentId];
    const points = pathPoints(routeConnector(parent, child, result.cfg, {}, {}, {}));
    for (let index = 1; index < points.length; index += 1) {
      for (const other of result.positioned) {
        if (other.node.id === child.node.id || other.node.id === parent.node.id) continue;
        if (segmentCrossesCard(points[index - 1], points[index], other)) {
          crossings.push([parent.node.id, child.node.id, other.node.id]);
        }
      }
    }
  }
  return crossings;
}

test('selected GridSmart edges expose endpoint handles on the painted entry side', () => {
  const parent = {
    cx: 100,
    cy: 100,
    node: { id: 'parent', width: 80, height: 40 },
  };
  const child = {
    cx: 300,
    cy: 300,
    routeType: 'packed',
    routePoints: [
      { x: 100, y: 140 },
      { x: 300, y: 140 },
      { x: 300, y: 250 },
    ],
    node: { id: 'child', parentId: 'parent', width: 100, height: 60 },
  };
  const cfg = { orientation: 'TopToBottom', autoEdgeSide: true };
  const automatic = edgeEditingWaypoints(child, null, null);
  const controls = edgeControlPoints(parent, child, automatic, cfg, {}, null);

  assert.deepEqual(controls.at(-1), { x: 300, y: 270 },
    'a line descending into the child must expose its endpoint handle on the top edge');
  assert.notDeepEqual(
    edgeControlPoints(parent, child, [], cfg, {}, null).at(-1),
    controls.at(-1),
    'discarding the automatic route would incorrectly fall back to a horizontal side');

  const manual = [{ x: 360, y: 300 }];
  assert.equal(edgeEditingWaypoints(child, manual, null), manual,
    'manual waypoints remain authoritative after editing begins');
  assert.deepEqual(edgeEditingWaypoints(child, null, { c: { nx: 1, ny: 0 } }), [],
    'a manual endpoint anchor intentionally replaces the automatic route');
});

test('AutoSmart recursively packs a mixed 42-node office without overlap', () => {
  const nodes = officeFixture();
  const balanced = layoutOrgChart(nodes, { subtreeMode: 'Balanced', targetAspect: 1.6 });
  const smart = layoutOrgChart(nodes, { subtreeMode: 'AutoSmart', targetAspect: 1.6 });

  assert.equal(smart.positioned.length, 42);
  assert.deepEqual(overlaps(smart.positioned), []);
  assert.ok(smart.bounds.w < balanced.bounds.w * 0.5, 'packed layout should eliminate the extreme single-row width');
  assert.ok(smart.bounds.w / smart.bounds.h > 1.2);
  assert.ok(smart.bounds.w / smart.bounds.h < 2.1);
  assert.equal(smart.posById.office.resolvedLayoutMode, 'AutoSmart');
});

test('AutoSmart is deterministic and follows the requested target shape', () => {
  const nodes = officeFixture();
  const first = layoutOrgChart(nodes, { subtreeMode: 'AutoSmart', targetAspect: 1.6 });
  const second = layoutOrgChart(nodes, { subtreeMode: 'AutoSmart', targetAspect: 1.6 });
  const portrait = layoutOrgChart(nodes, { subtreeMode: 'AutoSmart', targetAspect: 0.65 });
  const square = layoutOrgChart(nodes, { subtreeMode: 'AutoSmart', targetSize: { width: 1024, height: 1024 } });
  const mobile = layoutOrgChart(nodes, { subtreeMode: 'AutoSmart', targetSize: { width: 390, height: 844 } });

  assert.deepEqual(
    first.positioned.map(({ node, cx, cy, routeType, routePoints }) => ({ id: node.id, cx, cy, routeType, routePoints })),
    second.positioned.map(({ node, cx, cy, routeType, routePoints }) => ({ id: node.id, cx, cy, routeType, routePoints })),
  );
  assert.ok(first.bounds.w / first.bounds.h > portrait.bounds.w / portrait.bounds.h);
  assert.ok(square.bounds.w / square.bounds.h > 0.85 && square.bounds.w / square.bounds.h < 1.15);
  assert.ok(mobile.bounds.w / mobile.bounds.h < 0.75, 'direct personnel groups must be allowed to reflow into a narrow mobile shape');
  assert.deepEqual(overlaps(mobile.positioned), []);
  assert.deepEqual(unrelatedConnectorCrossings(mobile), []);
});

test('GridSmart snaps the chart to one occupancy lattice and simplifies its routes', () => {
  const nodes = officeFixture();
  const automatic = layoutOrgChart(nodes, { subtreeMode: 'AutoSmart', targetAspect: 1.6 });
  const grid = layoutOrgChart(nodes, { subtreeMode: 'GridSmart', targetAspect: 1.6 });
  const repeated = layoutOrgChart(nodes, { subtreeMode: 'GridSmart', targetAspect: 1.6 });

  assert.equal(grid.posById.office.resolvedLayoutMode, 'GridSmart');
  assert.ok(grid.positioned.every((item) => item.cx % grid.cfg.gridSize === 0
    && item.cy % grid.cfg.gridSize === 0), 'every card centre should occupy a lattice coordinate');
  assert.deepEqual(
    grid.positioned.map(({ node, cx, cy, routePoints }) => ({ id: node.id, cx, cy, routePoints })),
    repeated.positioned.map(({ node, cx, cy, routePoints }) => ({ id: node.id, cx, cy, routePoints })),
    'the same invisible mould must produce identical placement and channels',
  );
  assert.ok(connectorNetworkLength(grid) <= connectorNetworkLength(automatic) * 1.2,
    'shared family buses may trade a small amount of distance for clarity but must stay compact');
  assert.deepEqual(overlaps(grid.positioned), []);
  assert.deepEqual(connectorCardCrossings(grid), []);
  assert.deepEqual(unrelatedConnectorCrossings(grid), []);
  assert.deepEqual(connectorBacktracks(grid), []);
  assert.deepEqual(unrelatedConnectorOverlaps(grid), []);
  assert.deepEqual(connectorEndpointIssues(grid), []);
  assert.deepEqual(falseFamilyJunctions(grid.familyNetworks), []);
});

test('GridSmart keeps one family trunk and reuses row buses for sibling edges', () => {
  const nodes = [{ id: 'office', type: 'department', label: 'Office' }];
  for (let index = 0; index < 12; index += 1) {
    nodes.push({ id: `staff-${index}`, parentId: 'office', type: 'position', label: `Staff ${index + 1}` });
  }
  const result = layoutOrgChart(nodes, {
    subtreeMode: 'GridSmart',
    targetSize: { width: 1024, height: 1024 },
  });
  const routes = result.positioned
    .filter((item) => item.parentId === 'office')
    .map((child) => pathPoints(routeConnector(result.posById.office, child, result.cfg, {}, {}, {})));

  const family = result.familyNetworks.find((network) => network.parentId === 'office');
  assert.ok(family?.trunk, 'the family should expose one first-class editable trunk');
  assert.ok(family.sharedSegments.some((segment) => segment.childIds.length === routes.length),
    'all siblings should reuse the family exit before branching');
  assert.ok(family.sharedSegments.some((segment) => Math.abs(segment.a.y - segment.b.y) < 0.01
    && segment.childIds.length >= 2),
  'siblings in a packed row should expose one shared row bus');
  assert.deepEqual(connectorCardCrossings(result), []);
  assert.deepEqual(connectorBacktracks(result), []);
  assert.deepEqual(falseFamilyJunctions(result.familyNetworks), []);
});

test('family routing joins a child branch to the shared bus instead of crossing through it', () => {
  const children = [{ node: { id: 'row-child' } }, { node: { id: 'drop-child' } }];
  const sourcePaths = [
    [
      { x: 0, y: 0 }, { x: 0, y: 10 }, { x: -10, y: 10 },
      { x: -10, y: 20 }, { x: 100, y: 20 }, { x: 100, y: 30 },
    ],
    [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 50, y: 10 }, { x: 50, y: 30 }],
  ];

  const repaired = connectFamilyPathsAtSharedBuses('parent', children, sourcePaths, false);

  assert.equal(repaired.repaired, true);
  assert.deepEqual(falseFamilyJunctions([repaired.network]), [],
    'a private drop must terminate at the shared network rather than pass through its bus');
  assert.ok(repaired.network.junctions.some(({ point }) => point.x === 50 && point.y === 20),
    'the former crossing should become an explicit shared junction');
  assert.deepEqual(repaired.paths.map((path) => path[0]), [{ x: 0, y: 0 }, { x: 0, y: 0 }]);
  assert.deepEqual(repaired.paths.map((path) => path.at(-1)), [{ x: 100, y: 30 }, { x: 50, y: 30 }]);
});

test('GridSmart honors a safe parent-family trunk override without changing relationships', () => {
  const nodes = [{ id: 'office', type: 'department', label: 'Office' }];
  for (let index = 0; index < 6; index += 1) {
    nodes.push({ id: `staff-${index}`, parentId: 'office', type: 'position', label: `Staff ${index + 1}` });
  }
  const base = layoutOrgChart(nodes, {
    subtreeMode: 'GridSmart',
    targetSize: { width: 1024, height: 1024 },
  });
  const requestedOffset = 286;
  const moved = layoutOrgChart(nodes, {
    subtreeMode: 'GridSmart',
    targetSize: { width: 1024, height: 1024 },
    familyRouteOverrides: { office: { trunkOffset: requestedOffset } },
  });
  const trunk = moved.familyNetworks.find((network) => network.parentId === 'office')?.trunk;

  assert.ok(trunk, 'the manually constrained family still needs a shared trunk');
  assert.equal(trunk.a.x, moved.posById.office.cx + requestedOffset);
  assert.ok(moved.positioned.every((item) => item.parentId === base.posById[item.node.id].parentId),
    'moving the visual family bus must not rewrite parent-child relationships');
  assert.deepEqual(connectorCardCrossings(moved), []);
  assert.deepEqual(unrelatedConnectorCrossings(moved), []);
  assert.deepEqual(connectorEndpointIssues(moved), []);
});

test('GridSmart family networks remain safe in every chart orientation', () => {
  const nodes = [{ id: 'office', type: 'department', label: 'Office' }];
  for (let index = 0; index < 8; index += 1) {
    nodes.push({ id: `staff-${index}`, parentId: 'office', type: 'position', label: `Staff ${index + 1}` });
  }
  for (const orientation of ['TopToBottom', 'BottomToTop', 'LeftToRight', 'RightToLeft']) {
    const result = layoutOrgChart(nodes, {
      orientation,
      subtreeMode: 'GridSmart',
      targetSize: { width: 1024, height: 768 },
    });
    assert.ok(result.familyNetworks.some((network) => network.parentId === 'office' && network.trunk),
      `${orientation} should expose an editable shared trunk`);
    assert.deepEqual(connectorCardCrossings(result), [], `${orientation} card safety`);
    assert.deepEqual(unrelatedConnectorCrossings(result), [], `${orientation} crossing safety`);
    assert.deepEqual(connectorEndpointIssues(result), [], `${orientation} endpoint safety`);
  }
});

test('GridSmart keeps a single-child connector straight instead of routing out and back', () => {
  const nodes = [
    { id: 'office', type: 'department', label: 'Office' },
    { id: 'section', parentId: 'office', type: 'department', label: 'Section' },
    { id: 'staff', parentId: 'section', type: 'position', label: 'Staff' },
  ];
  const result = layoutOrgChart(nodes, { subtreeMode: 'GridSmart', targetAspect: 1.6 });
  const points = pathPoints(routeConnector(
    result.posById.section,
    result.posById.staff,
    result.cfg,
    {},
    {},
    {},
  ));

  assert.equal(points.length, 2, 'a lone child directly below its parent needs one straight segment');
  assert.equal(points[0].x, points[1].x);
  assert.deepEqual(connectorBacktracks(result), []);
});

test('GridSmart keeps a bounded five-person family compact and wraps it safely on mobile', () => {
  const nodes = [{ id: 'office', type: 'department', label: 'Office' }];
  for (let index = 0; index < 5; index += 1) {
    nodes.push({ id: `staff-${index}`, parentId: 'office', type: 'position', label: `Staff ${index + 1}` });
  }
  const square = layoutOrgChart(officeFixture(), {
    subtreeMode: 'GridSmart',
    targetSize: { width: 1024, height: 1024 },
  });
  const squareChildren = square.positioned.filter((item) => item.parentId === 'administration');
  const squareFamily = square.familyNetworks.find((network) => network.parentId === 'administration');

  assert.ok(new Set(squareChildren.map((child) => child.cy)).size <= 2,
    'larger approved person cards should need at most two compact ranks on a square canvas');
  assert.equal(squareFamily?.buses.length, 1,
    'the compact sibling ranks should still use one shared family bus');
  assert.ok(squareFamily?.stemSegments.some((segment) => segment.childIds.length === squareChildren.length),
    'all siblings should share one parent stem before branching');
  assert.deepEqual(connectorCardCrossings(square), []);
  assert.deepEqual(unrelatedConnectorCrossings(square), []);

  const compactFixture = [
    { id: 'root', type: 'department', label: 'Root' },
    { id: 'compact', parentId: 'root', type: 'department', label: 'Compact section' },
    { id: 'peer', parentId: 'root', type: 'department', label: 'Peer section' },
  ];
  for (let index = 0; index < 3; index += 1) {
    compactFixture.push({ id: `small-${index}`, parentId: 'compact', type: 'position', label: `Small ${index}` });
  }
  for (let index = 0; index < 8; index += 1) {
    compactFixture.push({ id: `peer-${index}`, parentId: 'peer', type: 'position', label: `Peer ${index}` });
  }
  const small = layoutOrgChart(compactFixture, {
    subtreeMode: 'GridSmart',
    targetSize: { width: 1024, height: 1024 },
  });
  const smallChildren = small.positioned.filter((item) => item.parentId === 'compact');
  assert.ok(new Set(smallChildren.map((child) => child.cy)).size <= 2,
    '2-3 person groups should remain in one or two compact ranks');

  const mobile = layoutOrgChart(nodes, {
    subtreeMode: 'GridSmart',
    targetSize: { width: 390, height: 844 },
  });
  const mobileParent = mobile.posById.office;
  const mobileChildren = mobile.positioned.filter((item) => item.parentId === 'office');
  const firstRowY = Math.min(...mobileChildren.map((child) => child.cy));
  const firstRow = mobileChildren.filter((child) => Math.abs(child.cy - firstRowY) < 0.01);
  const mobileRoutes = mobileChildren.map((child) => pathPoints(routeConnector(
    mobileParent,
    child,
    mobile.cfg,
    {},
    {},
    {},
  )));

  assert.ok(new Set(mobileChildren.map((child) => child.cy)).size > 1,
    'the same family should wrap on a narrow mobile canvas');
  assert.ok(firstRow.every((child) => mobileParent.cx <= child.cx - child.node.width / 2
    || mobileParent.cx >= child.cx + child.node.width / 2),
  'the section card should align with a card-free gutter in the first mobile row');
  assert.ok(mobileRoutes.every((points) => Math.abs(points[0].x - points[1].x) < 0.01),
  'wrapped siblings should leave through one straight family spine');
  assert.ok(mobileRoutes.every((points) => points.length <= 2
    || Math.abs(points.at(-2).y - points.at(-1).y) <= 10.01),
  'wrapped rows should use short local approaches instead of long drops');
  assert.deepEqual(connectorCardCrossings(mobile), []);
  assert.deepEqual(unrelatedConnectorCrossings(mobile), []);
});

test('GridSmart interlocks sparse sibling footprints instead of reserving solid subtree rectangles', () => {
  const nodes = [
    { id: 'root', type: 'department', label: 'Root office' },
    { id: 'large', parentId: 'root', type: 'department', label: 'Large division' },
    { id: 'medium', parentId: 'root', type: 'department', label: 'Medium division' },
    { id: 'small', parentId: 'root', type: 'department', label: 'Small division' },
  ];
  for (const group of ['large-a', 'large-b', 'large-c']) {
    nodes.push({ id: group, parentId: 'large', type: 'department', label: group });
    for (let index = 0; index < 5; index += 1) {
      nodes.push({ id: `${group}-${index}`, parentId: group, type: 'position', label: `${group} staff ${index}` });
    }
  }
  for (let index = 0; index < 4; index += 1) {
    nodes.push({ id: `medium-${index}`, parentId: 'medium', type: 'position', label: `Medium staff ${index}` });
  }
  nodes.push({ id: 'small-0', parentId: 'small', type: 'position', label: 'Small staff' });

  // This scenario exercises sparse interlocking with an intentionally taller
  // custom department footprint. Type-specific visual defaults are covered by
  // dataImport.test.js and must not silently redefine this packing fixture.
  const sizedNodes = nodes.map((node) => node.type === 'department'
    ? { ...node, width: 240, height: 100 }
    : { ...node, width: 196, height: 188 });
  const result = layoutOrgChart(sizedNodes, { subtreeMode: 'GridSmart', targetAspect: 1 });
  const subtreeBounds = (rootId) => {
    const ids = new Set([rootId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of result.positioned) {
        if (item.parentId == null || !ids.has(String(item.parentId)) || ids.has(String(item.node.id))) continue;
        ids.add(String(item.node.id));
        changed = true;
      }
    }
    const items = result.positioned.filter((item) => ids.has(String(item.node.id)));
    return {
      left: Math.min(...items.map((item) => item.cx - item.node.width / 2)),
      right: Math.max(...items.map((item) => item.cx + item.node.width / 2)),
      top: Math.min(...items.map((item) => item.cy - item.node.height / 2)),
      bottom: Math.max(...items.map((item) => item.cy + item.node.height / 2)),
    };
  };
  const large = subtreeBounds('large');
  const medium = subtreeBounds('medium');
  const small = subtreeBounds('small');

  assert.ok(medium.left < large.right && medium.right > large.left
    && medium.top < large.bottom && medium.bottom > large.top,
  'sibling subtree bounding boxes should overlap when their actual occupied cells remain disjoint');
  assert.ok(small.left >= medium.left,
    'source-ordered later branches should remain on or after the earlier branch territory');
  assert.deepEqual(overlaps(result.positioned), []);
  assert.deepEqual(connectorCardCrossings(result), []);
  assert.deepEqual(unrelatedConnectorCrossings(result), []);
  assert.deepEqual(connectorBacktracks(result), []);
  assert.deepEqual(unrelatedConnectorOverlaps(result), []);
  assert.deepEqual(connectorEndpointIssues(result), []);
});

test('GridSmart keeps uneven top-level divisions in coherent balanced ranks', () => {
  const nodes = [
    { id: 'office', type: 'department', label: 'Office' },
    { id: 'head', parentId: 'office', type: 'position', label: 'Office head', data: { is_head: true } },
    { id: 'assistant', parentId: 'office', type: 'position', label: 'Assistant' },
  ];
  const dimensions = [[900, 500], [260, 180], [700, 250], [300, 520], [600, 180], [240, 420]];
  dimensions.forEach(([width, height], index) => {
    nodes.push({ id: `division-${index}`, parentId: 'office', type: 'department', label: `Division ${index}` });
    nodes.push({
      id: `division-${index}-staff`,
      parentId: `division-${index}`,
      type: 'position',
      label: `Division ${index} staff`,
      width,
      height,
    });
  });

  const assertRanks = (result, expectedCounts) => {
    const divisions = dimensions.map((_, index) => result.posById[`division-${index}`]);
    const ranks = [...new Set(divisions.map((division) => division.cy))]
      .sort((a, b) => a - b)
      .map((cy) => divisions.filter((division) => division.cy === cy));
    assert.deepEqual(ranks.map((rank) => rank.length), expectedCounts,
      'equal-level divisions should use balanced shelf rows instead of unrelated staggered cells');
    assert.deepEqual(
      ranks.flat().map((division) => division.node.id),
      dimensions.map((_, index) => `division-${index}`),
      'wrapping should retain the source order across structural ranks',
    );
    const assistant = result.posById.assistant;
    const firstDivisionTop = Math.min(...divisions.map((division) => division.cy - division.node.height / 2));
    assert.ok(assistant.cy + assistant.node.height / 2 < firstDivisionTop,
      'direct personnel should stay in a distinct band above the structural branches');
    assert.deepEqual(overlaps(result.positioned), []);
    assert.deepEqual(connectorCardCrossings(result), []);
    assert.deepEqual(unrelatedConnectorCrossings(result), []);
    assert.deepEqual(connectorBacktracks(result), []);
    assert.deepEqual(unrelatedConnectorOverlaps(result), []);
    assert.deepEqual(connectorEndpointIssues(result), []);
    assert.deepEqual(falseFamilyJunctions(result.familyNetworks), []);
  };

  assertRanks(layoutOrgChart(nodes, {
    subtreeMode: 'GridSmart',
    targetSize: { width: 1024, height: 1024 },
  }), [3, 3]);
  assertRanks(layoutOrgChart(nodes, {
    subtreeMode: 'GridSmart',
    targetSize: { width: 390, height: 844 },
  }), [2, 2, 2]);
});

test('GridSmart centers the middle of three office divisions on square and desktop canvases', () => {
  const nodes = [
    { id: 'office', type: 'department', label: 'Office' },
    { id: 'head', parentId: 'office', type: 'position', label: 'Office head', data: { is_head: true } },
    { id: 'direct-a', parentId: 'office', type: 'position', label: 'Direct staff A' },
    { id: 'direct-b', parentId: 'office', type: 'position', label: 'Direct staff B' },
    { id: 'direct-c', parentId: 'office', type: 'position', label: 'Direct staff C' },
  ];
  for (const [division, count] of [['administrative', 5], ['appraisal', 6], ['mapping', 2]]) {
    nodes.push({ id: division, parentId: 'office', type: 'department', label: `${division} division` });
    for (let index = 0; index < count; index += 1) {
      nodes.push({ id: `${division}-${index}`, parentId: division, type: 'position', label: `${division} staff ${index + 1}` });
    }
  }

  for (const targetSize of [{ width: 1024, height: 1024 }, { width: 1440, height: 900 }]) {
    const result = layoutOrgChart(nodes, { subtreeMode: 'GridSmart', targetSize });
    const divisions = ['administrative', 'appraisal', 'mapping'].map((id) => result.posById[id]);
    assert.ok(divisions.every((division) => division.cy === divisions[0].cy),
      'three peer office divisions should share one truthful structural rank');
    assert.ok(divisions[0].cx < divisions[1].cx && divisions[1].cx < divisions[2].cx,
      'the three divisions should retain source order from left to right');
    assert.equal(divisions[1].cx, result.posById.office.cx,
      'the middle source division should occupy the office centerline');
    assert.equal(result.framingBounds.x + result.framingBounds.w / 2, result.posById.office.cx,
      'external framing should place the office and middle division on the exact fitted centreline');
    assert.ok(result.framingBounds.w >= result.bounds.w,
      'external framing may add canvas margin but must never crop compact chart content');
    const mappingStaff = result.positioned.filter((item) => item.parentId === 'mapping');
    assert.equal(new Set(mappingStaff.map((item) => item.cy)).size, 1,
      'a two-person outer division should occupy one row instead of creating balancing whitespace');
    const subtreeBounds = (rootId) => {
      const ids = new Set([rootId]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const item of result.positioned) {
          if (item.parentId == null || !ids.has(String(item.parentId)) || ids.has(String(item.node.id))) continue;
          ids.add(String(item.node.id));
          changed = true;
        }
      }
      const items = result.positioned.filter((item) => ids.has(String(item.node.id)));
      return {
        left: Math.min(...items.map((item) => item.cx - item.node.width / 2)),
        right: Math.max(...items.map((item) => item.cx + item.node.width / 2)),
      };
    };
    const [administrativeBounds, appraisalBounds, mappingBounds] =
      ['administrative', 'appraisal', 'mapping'].map(subtreeBounds);
    assert.ok(Math.abs(
      (appraisalBounds.left - administrativeBounds.right)
      - (mappingBounds.left - appraisalBounds.right)
    ) <= result.cfg.gridSize,
    'three centered division subtrees should use compact sibling gutters within one grid cell');
    assert.deepEqual(overlaps(result.positioned), []);
    assert.deepEqual(connectorCardCrossings(result), []);
    assert.deepEqual(unrelatedConnectorCrossings(result), []);
    assert.deepEqual(connectorBacktracks(result), []);
    assert.deepEqual(unrelatedConnectorOverlaps(result), []);
    assert.deepEqual(connectorEndpointIssues(result), []);
  }

  const mobile = layoutOrgChart(nodes, {
    subtreeMode: 'GridSmart',
    targetSize: { width: 390, height: 844 },
  });
  assert.ok(new Set(['administrative', 'appraisal', 'mapping'].map((id) => mobile.posById[id].cy)).size > 1,
    'a narrow mobile canvas may still stack the same divisions');
});

test('AutoSmart connector lanes remain finite and manual subtree modes still win', () => {
  const nodes = officeFixture();
  nodes[0].layoutMode = 'Alternate';
  const result = layoutOrgChart(nodes, { subtreeMode: 'AutoSmart', targetAspect: 1.6 });

  assert.equal(result.posById.office.resolvedLayoutMode, 'Alternate');
  for (const child of result.positioned) {
    if (!child.parentId) continue;
    const path = routeConnector(result.posById[child.parentId], child, result.cfg, {}, {}, {});
    assert.match(path, /^M /);
    assert.doesNotMatch(path, /NaN|undefined|Infinity/);
  }
});

test('AutoSmart keeps structural peers in compact source-ordered ranks and routes around unrelated cards', () => {
  const nodes = officeFixture();
  const result = layoutOrgChart(nodes, { subtreeMode: 'AutoSmart', targetAspect: 1.6 });
  const structuralPeers = ['members', 'administration', 'utility'].map((id) => result.posById[id]);
  assert.ok(new Set(structuralPeers.map((peer) => peer.cy)).size <= 2,
    'larger approved cards may wrap three unequal subtrees, but should not scatter them');
  assert.ok(structuralPeers[0].cy <= structuralPeers[1].cy && structuralPeers[1].cy <= structuralPeers[2].cy,
    'structural peers should retain row-major source order');
  assert.equal(result.posById.head.cx, result.posById.office.cx, 'the featured office head should be centered under the office');

  assert.deepEqual(connectorCardCrossings(result), []);
  assert.deepEqual(unrelatedConnectorCrossings(result), []);
});

test('AutoSmart keeps mixed-height structural peers in balanced source-order ranks', () => {
  const nodes = [
    { id: 'office', type: 'department', label: 'Office' },
    { id: 'head', parentId: 'office', type: 'position', label: 'Office head', data: { is_head: true } },
  ];
  for (const [branch, count] of [['a', 9], ['b', 1], ['c', 7], ['d', 2], ['e', 5], ['f', 1]]) {
    nodes.push({ id: branch, parentId: 'office', type: 'department', label: `Division ${branch}` });
    for (let index = 0; index < count; index += 1) {
      nodes.push({ id: `${branch}-${index}`, parentId: branch, type: 'position', label: `${branch} staff ${index + 1}` });
    }
  }

  const result = layoutOrgChart(nodes, {
    subtreeMode: 'AutoSmart',
    targetSize: { width: 1440, height: 900 },
  });

  const branches = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => result.posById[id]);
  assert.ok(branches.every((branch) => branch.cy === branches[0].cy), 'peer division headings should share one rank');
  assert.deepEqual(
    branches.map((branch) => branch.cx),
    branches.map((branch) => branch.cx).sort((a, b) => a - b),
    'peer divisions should retain source order from left to right',
  );
  const occupiedArea = result.positioned.reduce((sum, item) => sum + item.node.width * item.node.height, 0);
  assert.ok(result.bounds.w * result.bounds.h < occupiedArea * 3.5,
    'mixed-height peers should remain compact relative to their configured card area');
  assert.deepEqual(overlaps(result.positioned), []);
  assert.deepEqual(connectorCardCrossings(result), []);
  assert.deepEqual(unrelatedConnectorCrossings(result), []);
});

test('AutoSmart routes a regular staff grid through a safe interior trunk', () => {
  const nodes = [
    { id: 'office', type: 'department', label: 'Office' },
    { id: 'head', parentId: 'office', type: 'position', label: 'Office head', data: { is_head: true } },
  ];
  for (let index = 0; index < 16; index += 1) {
    nodes.push({ id: `staff-${index}`, parentId: 'office', type: 'position', label: `Staff ${index + 1}` });
  }

  const result = layoutOrgChart(nodes, { subtreeMode: 'AutoSmart', targetAspect: 1.6 });
  const staff = result.positioned.filter((item) => String(item.node.id).startsWith('staff-'));
  const rails = new Set(staff.map((item) => item.routePoints?.at(-2)?.x));
  assert.equal(rails.size, 1, 'a regular grid should share one connector trunk');

  const railX = [...rails][0];
  const left = Math.min(...staff.map((item) => item.cx - item.node.width / 2));
  const right = Math.max(...staff.map((item) => item.cx + item.node.width / 2));
  assert.ok(railX > left && railX < right, 'the trunk should not wrap around the outside of the staff group');
  assert.ok(staff.every((item) => railX <= item.cx - item.node.width / 2
    || railX >= item.cx + item.node.width / 2), 'the trunk must stay in a card-free gutter');
});

test('MIO tree import preserves head metadata used by smart packing and print', () => {
  const imported = convertMoTree([{
    id: 10,
    type: 'organization',
    name: 'Office',
    meta: { level: 'office' },
    children: [{
      id: 11,
      type: 'filled',
      name: 'Example Person',
      position: 'Office Head',
      is_head: true,
      meta: { employee_id: 99 },
      children: [],
    }],
  }]);

  assert.equal(imported[1].data.is_head, true);
  assert.equal(imported[1].data.employee_id, undefined, 'unrelated source metadata must not leak into chart data');
});
