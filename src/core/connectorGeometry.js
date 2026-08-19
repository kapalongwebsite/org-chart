const EPSILON = 0.001;

function rounded(value) {
  return Math.round(Number(value) * 1000) / 1000;
}

function coordinate(value) {
  const clean = rounded(value);
  return Number.isInteger(clean) ? String(clean) : String(clean);
}

function pointsFromPath(path) {
  const values = String(path || '').match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)?.map(Number) || [];
  const points = [];
  for (let index = 0; index + 1 < values.length; index += 2) {
    points.push({ x: rounded(values[index]), y: rounded(values[index + 1]) });
  }
  return points;
}

function defaultStyleKey(style) {
  if (style == null) return '';
  if (typeof style !== 'object') return String(style);
  return JSON.stringify(Object.keys(style).sort().reduce((result, key) => {
    result[key] = style[key];
    return result;
  }, {}));
}

function memberKey(memberIds) {
  return [...memberIds].map(String).sort().join('\u0000');
}

function pointKey(point) {
  return `${coordinate(point.x)},${coordinate(point.y)}`;
}

function samePoint(first, second) {
  return Math.abs(first.x - second.x) < EPSILON && Math.abs(first.y - second.y) < EPSILON;
}

function segmentLength(segment) {
  return Math.abs(segment.b.x - segment.a.x) + Math.abs(segment.b.y - segment.a.y);
}

function pathFromPoints(points) {
  return points.map((point, index) => `${index ? 'L' : 'M'} ${coordinate(point.x)} ${coordinate(point.y)}`).join(' ');
}

function mergeRenderableSegments(segments) {
  const ordered = segments.map((segment) => {
    const horizontal = Math.abs(segment.a.y - segment.b.y) < EPSILON;
    return {
      ...segment,
      horizontal,
      fixed: rounded(horizontal ? segment.a.y : segment.a.x),
      start: rounded(Math.min(horizontal ? segment.a.x : segment.a.y, horizontal ? segment.b.x : segment.b.y)),
      end: rounded(Math.max(horizontal ? segment.a.x : segment.a.y, horizontal ? segment.b.x : segment.b.y)),
      styleKey: defaultStyleKey(segment.style),
    };
  }).sort((first, second) => Number(first.horizontal) - Number(second.horizontal)
    || first.fixed - second.fixed
    || first.styleKey.localeCompare(second.styleKey)
    || first.start - second.start
    || first.end - second.end);
  const merged = [];
  for (const segment of ordered) {
    const previous = merged.at(-1);
    if (previous
      && previous.horizontal === segment.horizontal
      && Math.abs(previous.fixed - segment.fixed) < EPSILON
      && previous.styleKey === segment.styleKey
      && segment.start <= previous.end + EPSILON) {
      previous.end = Math.max(previous.end, segment.end);
      previous.memberIds = [...new Set([...previous.memberIds, ...segment.memberIds])];
      previous.shared = previous.shared || segment.shared;
      continue;
    }
    merged.push({ ...segment, memberIds: [...segment.memberIds] });
  }
  return merged.map((segment) => {
    const a = segment.horizontal
      ? { x: segment.start, y: segment.fixed }
      : { x: segment.fixed, y: segment.start };
    const b = segment.horizontal
      ? { x: segment.end, y: segment.fixed }
      : { x: segment.fixed, y: segment.end };
    return {
      ...segment,
      a,
      b,
      d: `M ${coordinate(a.x)} ${coordinate(a.y)} L ${coordinate(b.x)} ${coordinate(b.y)}`,
    };
  });
}

/*
 * Convert complete logical child paths into a visible orthogonal segment
 * union. Logical paths may overlap because siblings share a trunk or bus; the
 * returned geometry paints every occupied interval exactly once.
 *
 * Input entries may be path strings or { id, d, style } records. Shared atoms
 * use options.sharedStyle, while a private atom keeps its owning edge style.
 * Per-child hit/edit paths remain the caller's responsibility.
 */
export function buildVisibleConnectorSegments(paths, options = {}) {
  const entries = (paths || []).map((value, index) => (typeof value === 'string'
    ? { id: String(index), d: value, style: null }
    : { id: String(value.id ?? index), d: value.d, style: value.style ?? null }));
  const lanes = new Map();

  for (const entry of entries) {
    const points = pointsFromPath(entry.d);
    for (let index = 1; index < points.length; index += 1) {
      const before = points[index - 1], after = points[index];
      const horizontal = Math.abs(before.y - after.y) < EPSILON;
      const vertical = Math.abs(before.x - after.x) < EPSILON;
      if (!horizontal && !vertical) continue;
      const fixed = rounded(horizontal ? before.y : before.x);
      const start = rounded(Math.min(horizontal ? before.x : before.y, horizontal ? after.x : after.y));
      const end = rounded(Math.max(horizontal ? before.x : before.y, horizontal ? after.x : after.y));
      if (end - start < EPSILON) continue;
      const key = `${horizontal ? 'h' : 'v'}:${fixed}`;
      if (!lanes.has(key)) lanes.set(key, { horizontal, fixed, segments: [] });
      lanes.get(key).segments.push({ start, end, entry });
    }
  }

  const styleKeyOf = options.styleKey || defaultStyleKey;
  const atoms = [];
  for (const lane of lanes.values()) {
    const boundaries = [...new Set(lane.segments.flatMap((segment) => [segment.start, segment.end]))]
      .sort((a, b) => a - b);
    for (let index = 1; index < boundaries.length; index += 1) {
      const start = boundaries[index - 1], end = boundaries[index];
      if (end - start < EPSILON) continue;
      const covering = lane.segments.filter((segment) => segment.start <= start + EPSILON
        && segment.end >= end - EPSILON);
      if (!covering.length) continue;
      const members = [...new Map(covering.map((segment) => [segment.entry.id, segment.entry])).values()];
      const shared = members.length > 1;
      const style = shared ? (options.sharedStyle ?? null) : members[0].style;
      atoms.push({
        horizontal: lane.horizontal,
        fixed: lane.fixed,
        start,
        end,
        style,
        styleKey: styleKeyOf(style),
        shared,
        memberIds: members.map((member) => member.id),
      });
    }
  }

  atoms.sort((first, second) => Number(first.horizontal) - Number(second.horizontal)
    || first.fixed - second.fixed
    || first.start - second.start
    || first.end - second.end
    || first.styleKey.localeCompare(second.styleKey));

  const merged = [];
  for (const atom of atoms) {
    const previous = merged.at(-1);
    if (previous
      && previous.horizontal === atom.horizontal
      && Math.abs(previous.fixed - atom.fixed) < EPSILON
      && Math.abs(previous.end - atom.start) < EPSILON
      && previous.styleKey === atom.styleKey
      && (!options.preserveMembership || memberKey(previous.memberIds) === memberKey(atom.memberIds))) {
      previous.end = atom.end;
      previous.shared = previous.shared || atom.shared;
      previous.memberIds = [...new Set([...previous.memberIds, ...atom.memberIds])];
      continue;
    }
    merged.push({ ...atom });
  }

  return merged.map((segment) => {
    const a = segment.horizontal
      ? { x: segment.start, y: segment.fixed }
      : { x: segment.fixed, y: segment.start };
    const b = segment.horizontal
      ? { x: segment.end, y: segment.fixed }
      : { x: segment.fixed, y: segment.end };
    return {
      a,
      b,
      d: `M ${coordinate(a.x)} ${coordinate(a.y)} L ${coordinate(b.x)} ${coordinate(b.y)}`,
      style: segment.style,
      shared: segment.shared,
      memberIds: segment.memberIds,
    };
  });
}

/*
 * Promote sibling relationship paths into one first-class parent-owned
 * connector network. Complete child paths are accepted as logical routing
 * constraints, but the returned `segments` are the only physical geometry:
 * every occupied interval exists once and records the child relationships that
 * use it. This is the structural difference between painting N child paths and
 * rendering one family stem/bus with N private branches.
 */
export function buildFamilyConnectorNetwork(parentId, childPaths, options = {}) {
  const entries = (childPaths || []).map((value, index) => {
    const id = String(value?.id ?? value?.childId ?? index);
    const points = Array.isArray(value?.points)
      ? value.points.map((point) => ({ x: rounded(point.x), y: rounded(point.y) }))
      : pointsFromPath(value?.d ?? value);
    return { id, points, d: pathFromPoints(points), style: value?.style ?? null };
  }).filter((entry) => entry.points.length >= 2);
  if (entries.length < 2) return null;

  const childIds = entries.map((entry) => entry.id);
  const childIdKey = memberKey(childIds);
  const source = entries[0].points[0];
  const segments = buildVisibleConnectorSegments(entries, { preserveMembership: true }).map((segment, index) => ({
    id: `${String(parentId)}:${index}`,
    a: segment.a,
    b: segment.b,
    d: segment.d,
    childIds: [...segment.memberIds].map(String).sort(),
    role: 'branch',
  }));

  const membershipSharedSegments = segments.filter((segment) => segment.childIds.length > 1);
  const allChildSegments = membershipSharedSegments.filter((segment) => memberKey(segment.childIds) === childIdKey);
  const stemSegments = [];
  const connectedPoints = new Set([pointKey(source)]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const segment of allChildSegments) {
      if (stemSegments.includes(segment)) continue;
      const aKey = pointKey(segment.a), bKey = pointKey(segment.b);
      if (!connectedPoints.has(aKey) && !connectedPoints.has(bKey)) continue;
      stemSegments.push(segment);
      connectedPoints.add(aKey); connectedPoints.add(bKey);
      changed = true;
    }
  }

  const flowHorizontal = !!options.horizontalFlow;
  const flowStemSegments = stemSegments.filter((segment) => {
    const horizontal = Math.abs(segment.a.y - segment.b.y) < EPSILON;
    return horizontal === flowHorizontal;
  });
  const trunk = [...(flowStemSegments.length ? flowStemSegments : stemSegments)]
    .sort((first, second) => segmentLength(second) - segmentLength(first))[0] || null;
  const stemIds = new Set(stemSegments.map((segment) => segment.id));
  const stemEndpointKeys = new Set(stemSegments.flatMap((segment) => [pointKey(segment.a), pointKey(segment.b)]));

  // A family bus is one contiguous cross-flow rail, even though the logical
  // route to the left child uses only its left half and the route to the right
  // child uses only its right half. Classifying ownership solely by overlap
  // count would incorrectly call those halves private child lines (model A).
  // Group the rail spatially and promote it when it serves two or more children.
  const crossSegments = segments.map((segment) => {
    const horizontal = Math.abs(segment.a.y - segment.b.y) < EPSILON;
    return {
      segment,
      horizontal,
      fixed: rounded(horizontal ? segment.a.y : segment.a.x),
      start: rounded(Math.min(horizontal ? segment.a.x : segment.a.y, horizontal ? segment.b.x : segment.b.y)),
      end: rounded(Math.max(horizontal ? segment.a.x : segment.a.y, horizontal ? segment.b.x : segment.b.y)),
    };
  }).filter((entry) => entry.horizontal !== flowHorizontal)
    .sort((first, second) => Number(first.horizontal) - Number(second.horizontal)
      || first.fixed - second.fixed || first.start - second.start || first.end - second.end);
  const busRuns = [];
  for (const entry of crossSegments) {
    const previous = busRuns.at(-1);
    if (previous && previous.horizontal === entry.horizontal
      && Math.abs(previous.fixed - entry.fixed) < EPSILON
      && entry.start <= previous.end + EPSILON) {
      previous.end = Math.max(previous.end, entry.end);
      previous.segmentIds.push(entry.segment.id);
      previous.childIds = [...new Set([...previous.childIds, ...entry.segment.childIds])].sort();
      continue;
    }
    busRuns.push({
      horizontal: entry.horizontal,
      fixed: entry.fixed,
      start: entry.start,
      end: entry.end,
      segmentIds: [entry.segment.id],
      childIds: [...entry.segment.childIds],
    });
  }
  const buses = busRuns.filter((run) => {
    const a = run.horizontal ? { x: run.start, y: run.fixed } : { x: run.fixed, y: run.start };
    const b = run.horizontal ? { x: run.end, y: run.fixed } : { x: run.fixed, y: run.end };
    return run.childIds.length >= 2 || stemEndpointKeys.has(pointKey(a)) || stemEndpointKeys.has(pointKey(b));
  }).map((run, index) => {
    const a = run.horizontal ? { x: run.start, y: run.fixed } : { x: run.fixed, y: run.start };
    const b = run.horizontal ? { x: run.end, y: run.fixed } : { x: run.fixed, y: run.end };
    return {
      id: `${String(parentId)}:bus:${index}`,
      a,
      b,
      d: `M ${coordinate(a.x)} ${coordinate(a.y)} L ${coordinate(b.x)} ${coordinate(b.y)}`,
      childIds: run.childIds,
      segmentIds: run.segmentIds,
      role: 'bus',
    };
  });
  const busSegmentIds = new Set(buses.flatMap((bus) => bus.segmentIds));
  for (const segment of segments) {
    if (stemIds.has(segment.id)) segment.role = 'stem';
    else if (busSegmentIds.has(segment.id)) segment.role = 'bus';
    else if (segment.childIds.length > 1) segment.role = 'shared';
  }
  const sharedSegments = [
    ...stemSegments,
    ...buses,
    ...membershipSharedSegments.filter((segment) => !stemIds.has(segment.id)
      && !busSegmentIds.has(segment.id)),
  ];
  const branches = childIds.map((childId) => ({
    childId,
    segments: segments.filter((segment) => segment.role === 'branch'
      && segment.childIds.length === 1 && segment.childIds[0] === childId),
  }));

  const endpointSegments = new Map();
  for (const segment of segments) {
    for (const point of [segment.a, segment.b]) {
      const key = pointKey(point);
      if (!endpointSegments.has(key)) endpointSegments.set(key, { point, segments: [] });
      endpointSegments.get(key).segments.push(segment.id);
    }
  }
  const junctions = [...endpointSegments.values()]
    .filter((entry) => entry.segments.length >= 3)
    .map((entry) => ({ point: entry.point, segmentIds: entry.segments }));

  return {
    model: 'shared-family-network',
    parentId: String(parentId),
    childIds,
    source,
    segments,
    stemSegments,
    sharedSegments,
    buses,
    branches,
    junctions,
    trunk,
    horizontalFlow: flowHorizontal,
  };
}

/*
 * Resolve the physical connector layer. Family members are consumed by their
 * parent-owned network and therefore never painted as complete child routes.
 * Standalone relationships retain the legacy one-path behavior. Callers may
 * request a family rebuild when manual node/edge edits move its geometry.
 */
export function resolveConnectorGeometry(logicalPaths, familyNetworks = [], options = {}) {
  const entries = (logicalPaths || []).map((value, index) => (typeof value === 'string'
    ? { id: String(index), d: value, style: null }
    : { id: String(value.id ?? index), d: value.d, style: value.style ?? null }));
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const rebuildIds = new Set([...(options.rebuildFamilyIds || [])].map(String));
  const resolvedNetworks = [];
  const consumed = new Set();
  const segments = [];

  for (const configured of familyNetworks || []) {
    const members = (configured.childIds || []).map(String).filter((id) => byId.has(id));
    if (members.length < 2) continue;
    const shouldRebuild = rebuildIds.has(String(configured.parentId))
      || !Array.isArray(configured.segments)
      || !configured.segments.length;
    const network = shouldRebuild
      ? buildFamilyConnectorNetwork(configured.parentId, members.map((id) => byId.get(id)), {
        horizontalFlow: configured.horizontalFlow,
      })
      : configured;
    if (!network) continue;
    resolvedNetworks.push(network);
    for (const segment of network.segments) {
      const memberIds = segment.childIds.map(String).filter((id) => byId.has(id));
      if (!memberIds.length) continue;
      memberIds.forEach((id) => consumed.add(id));
      const familyOwned = segment.role !== 'branch';
      const style = familyOwned
        ? (options.sharedStyle ?? null)
        : byId.get(memberIds[0])?.style ?? null;
      segments.push({
        ...segment,
        d: segment.d || `M ${coordinate(segment.a.x)} ${coordinate(segment.a.y)} L ${coordinate(segment.b.x)} ${coordinate(segment.b.y)}`,
        memberIds,
        shared: familyOwned,
        style,
      });
    }
  }

  const standalone = entries.filter((entry) => !consumed.has(entry.id));
  segments.push(...buildVisibleConnectorSegments(standalone, options));
  return {
    segments: mergeRenderableSegments(segments),
    familyNetworks: resolvedNetworks,
    standaloneIds: standalone.map((entry) => entry.id),
  };
}
