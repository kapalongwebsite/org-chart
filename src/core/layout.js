// The subtree layout engine — extent-based recursive packing.
// Pure: every state read is threaded through an explicit `cfg` object,
// so this module never touches globals, the DOM, or window.
//
// The algorithm is unchanged from the original single-file implementation:
//   Family A (Balanced/Center/Left/Right) — horizontal child row
//   Family B (Alternate*)                 — vertical "brick wall" snake
//   Matrix                                 — uniform per-depth rows
// Orientation is a pure transform applied after a logical TopToBottom layout.

import { SNAKE_STUB, CANVAS_PAD } from './constants.js';
import { buildTree, getVisibleTree, visibleDepths } from './tree.js';
import { makeNode } from './dataImport.js';

export function isHorizontal(cfg) {
  return cfg.orientation === 'LeftToRight' || cfg.orientation === 'RightToLeft';
}
// orientation-aware logical footprint (swap for horizontal flow)
export function lw(node, cfg) { return isHorizontal(cfg) ? node.height : node.width; }
export function lh(node, cfg) { return isHorizontal(cfg) ? node.width : node.height; }

function effectiveMode(node, cfg) {
  if (node.isVirtual) return 'Balanced';
  return node.layoutMode || cfg.subtreeMode;          // per-node override
}
function isSnake(mode) {
  return mode === 'Alternate' || mode === 'AlternateLeft' || mode === 'AlternateRight';
}

/* recursive EXTENT-based measurement (logical TopToBottom space) */
function measureSubtree(entry, cfg) {
  const node = entry.node;
  const kids = entry.children;
  const W = lw(node, cfg), H = lh(node, cfg);

  if (kids.length === 0) {
    return {
      w: W, h: H,
      anchorLeft: W / 2, anchorRight: W / 2,
      nodeCenterX: W / 2, nodeCenterY: H / 2,
      childPlacements: [], edgeRoutes: [],
    };
  }
  const childMeasures = kids.map((c) => measureSubtree(c, cfg));
  const mode = effectiveMode(node, cfg);
  return isSnake(mode)
    ? measureSnake(entry, childMeasures, mode, cfg)
    : measureRow(entry, childMeasures, mode, cfg);
}

/* Family A: children in a horizontal row; parent x-alignment varies */
function measureRow(entry, cms, mode, cfg) {
  const node = entry.node;
  const W = lw(node, cfg), H = node.isVirtual ? 0 : lh(node, cfg);
  const spacing = (mode === 'Center') ? cfg.spacingX * 0.5 : cfg.spacingX;

  const childXs = [];
  let x = 0;
  for (let i = 0; i < cms.length; i++) { childXs.push(x); x += cms[i].w + spacing; }
  const childrenW = x - spacing;
  const firstCenter = childXs[0] + cms[0].nodeCenterX;
  const lastCenter = childXs[cms.length - 1] + cms[cms.length - 1].nodeCenterX;

  let parentCenter;
  switch (mode) {
    case 'Left':  parentCenter = firstCenter; break;
    case 'Right': parentCenter = lastCenter;  break;
    default:      parentCenter = (firstCenter + lastCenter) / 2;
  }
  const parentRight = parentCenter + W / 2;
  const shift = Math.max(0, -(parentCenter - W / 2));
  for (let i = 0; i < childXs.length; i++) childXs[i] += shift;
  parentCenter += shift;

  const w = Math.max(childrenW + shift, parentRight + shift);
  const childrenTopY = H + (node.isVirtual ? 0 : cfg.spacingY);
  const maxChildH = Math.max(...cms.map((c) => c.h));

  const childPlacements = [];
  const edgeRoutes = [];
  for (let i = 0; i < cms.length; i++) {
    childPlacements.push({ entry: entry.children[i], cx: childXs[i], cy: childrenTopY, m: cms[i] });
    edgeRoutes.push({ childId: entry.children[i].node.id, routeType: 'bus' });
  }
  return {
    w, h: childrenTopY + maxChildH,
    anchorLeft: parentCenter, anchorRight: w - parentCenter,
    nodeCenterX: parentCenter, nodeCenterY: H / 2,
    childPlacements, edgeRoutes,
  };
}

/* Family B: vertical snake with running-bond / masonry brick packing */
function measureSnake(entry, cms, mode, cfg) {
  const node = entry.node;
  const W = lw(node, cfg), H = node.isVirtual ? 0 : lh(node, cfg);

  const leftFirst = (mode !== 'AlternateRight');
  const masonry = (mode === 'Alternate');
  const gapY = Math.max(16, cfg.spacingY * 0.45);

  const topY = H + (node.isVirtual ? 0 : cfg.spacingY);
  const firstH = cms.length ? cms[0].h : 0;
  const stagger = firstH / 2 + gapY / 2;

  let yL = topY, yR = topY;
  if (leftFirst) yR += stagger; else yL += stagger;

  const placed = [];
  for (let i = 0; i < cms.length; i++) {
    const m = cms[i];
    let goLeft;
    if (masonry) goLeft = (Math.abs(yL - yR) < 0.01) ? leftFirst : (yL < yR);
    else         goLeft = leftFirst ? (i % 2 === 0) : (i % 2 === 1);
    if (goLeft) { placed.push({ i, side: -1, y: yL, m }); yL += m.h + gapY; }
    else        { placed.push({ i, side: +1, y: yR, m }); yR += m.h + gapY; }
  }

  const widthOf = (side) => placed.filter((p) => p.side === side).reduce((mx, p) => Math.max(mx, p.m.w), 0);
  const leftW = widthOf(-1), rightW = widthOf(1);
  const spineX = Math.max(leftW + SNAKE_STUB, W / 2);

  const childPlacements = [];
  const edgeRoutes = [];
  for (const p of placed) {
    const cx = p.side < 0 ? (spineX - SNAKE_STUB - p.m.w) : (spineX + SNAKE_STUB);
    childPlacements[p.i] = { entry: entry.children[p.i], cx, cy: p.y, m: p.m };
    edgeRoutes[p.i] = { childId: entry.children[p.i].node.id, routeType: p.side < 0 ? 'spine-left' : 'spine-right' };
  }

  const bottom = Math.max(yL, yR) - gapY;
  const w = Math.max(spineX + SNAKE_STUB + rightW, spineX + W / 2);
  const h = Math.max(bottom, topY);
  return {
    w, h,
    anchorLeft: spineX, anchorRight: w - spineX,
    nodeCenterX: spineX, nodeCenterY: H / 2,
    childPlacements, edgeRoutes,
  };
}

/* assign absolute LOGICAL centers; returns flat positioned records */
function layoutTree(rootEntry, cfg) {
  const m = measureSubtree(rootEntry, cfg);
  const out = [];
  const routeOf = Object.create(null);
  (function place(entry, meas, boxLeft, boxTop) {
    const node = entry.node;
    const cx = boxLeft + meas.nodeCenterX;
    const cy = boxTop + meas.nodeCenterY;
    if (!node.isVirtual) {
      out.push({ node, lx: cx, ly: cy, w: lw(node, cfg), h: lh(node, cfg),
                 parentId: node.parentId, routeType: routeOf[node.id] || 'bus' });
    }
    for (const r of meas.edgeRoutes) routeOf[r.childId] = r.routeType;
    for (const cp of meas.childPlacements) place(cp.entry, cp.m, boxLeft + cp.cx, boxTop + cp.cy);
  })(rootEntry, m, 0, 0);
  return out;
}

/* Matrix: lock each depth onto a uniform logical row line (in logical space) */
function applyMatrix(logical, depthById, cfg) {
  const byDepth = Object.create(null);
  for (const p of logical) {
    const d = depthById[p.node.id] || 0;
    (byDepth[d] || (byDepth[d] = [])).push(p);
  }
  const depths = Object.keys(byDepth).map(Number).sort((a, b) => a - b);
  const g = cfg.gridSize;
  let top = 0;
  for (const d of depths) {
    const rows = byDepth[d];
    const maxH = Math.max(...rows.map((p) => p.h));
    for (const p of rows) p.ly = top + maxH / 2;
    let pitch = maxH + cfg.spacingY;
    if (cfg.alignGrid) pitch = Math.ceil(pitch / g) * g;
    top += pitch;
  }
}

/* pure logical -> oriented transform */
export function applyOrientation(lx, ly, cfg) {
  switch (cfg.orientation) {
    case 'BottomToTop': return { x: lx, y: -ly };
    case 'LeftToRight': return { x: ly, y: lx };
    case 'RightToLeft': return { x: -ly, y: lx };
    case 'TopToBottom':
    default:            return { x: lx, y: ly };
  }
}

/* normalize a cfg from loose options + defaults */
export function normalizeConfig(options = {}) {
  return {
    orientation: options.orientation || 'TopToBottom',
    subtreeMode: options.subtreeMode || 'Balanced',
    spacingX: options.spacingX != null ? options.spacingX : 40,
    spacingY: options.spacingY != null ? options.spacingY : 70,
    gridSize: options.gridSize != null ? options.gridSize : 22,
    alignGrid: !!options.alignGrid,
  };
}

/* ============================================================
   layoutOrgChart(nodes, options) -> { positioned, posById, bounds, cfg }
   The single public entry point for the framework-independent layout.
   ============================================================ */
export function layoutOrgChart(nodes, options = {}) {
  const cfg = normalizeConfig(options);
  // ensure every node has width/height/defaults (makeNode is idempotent)
  const norm = (nodes || []).map(makeNode);
  const tree = buildTree(norm);
  const visible = getVisibleTree(tree);
  const logical = layoutTree(visible, cfg);

  if (cfg.subtreeMode === 'Matrix') applyMatrix(logical, visibleDepths(visible), cfg);

  for (const p of logical) {
    const o = applyOrientation(p.lx, p.ly, cfg);
    p.cx = o.x; p.cy = o.y;
  }

  let minX = Infinity, minY = Infinity;
  for (const p of logical) {
    minX = Math.min(minX, p.cx - p.node.width / 2);
    minY = Math.min(minY, p.cy - p.node.height / 2);
  }
  if (!isFinite(minX)) { minX = 0; minY = 0; }
  const dx = CANVAS_PAD - minX, dy = CANVAS_PAD - minY;
  for (const p of logical) { p.cx += dx; p.cy += dy; }

  if (cfg.alignGrid) {
    const g = cfg.gridSize;
    for (const p of logical) { p.cx = Math.round(p.cx / g) * g; p.cy = Math.round(p.cy / g) * g; }
  }

  const posById = Object.create(null);
  for (const p of logical) posById[p.node.id] = p;

  return { positioned: logical, posById, cfg, bounds: boundsOf(logical) };
}

/* tight bounding box of positioned nodes (no manual offsets) */
function boundsOf(positioned) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of positioned) {
    minX = Math.min(minX, p.cx - p.node.width / 2);
    minY = Math.min(minY, p.cy - p.node.height / 2);
    maxX = Math.max(maxX, p.cx + p.node.width / 2);
    maxY = Math.max(maxY, p.cy + p.node.height / 2);
  }
  if (!isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
