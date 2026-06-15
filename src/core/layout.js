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

const BANNER_H = 44;   // height of a department "banner" bar in Custom/Custom

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
function isCustom(mode) { return mode === 'Custom'; }

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
  if (isCustom(mode)) return measureCustom(entry, childMeasures, cfg);
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

/* Custom: children flow into horizontal ROWS under the parent, wrapping toward a
   near-square block (≈√n per row). Reads like "rows of cards under a header" —
   closer to a designed departmental chart. Bus connectors form a bar per row. */
function measureCustom(entry, cms, cfg) {
  const node = entry.node;
  const n = cms.length;
  // a non-root department with children becomes a wide "banner" header spanning
  // its block (TopToBottom only). Its width = block width, height = BANNER_H.
  const isBanner = !node.isVirtual && node.type === 'department' && !!node.parentId
    && n > 0 && cfg.orientation === 'TopToBottom';
  const W = lw(node, cfg);
  const H = node.isVirtual ? 0 : (isBanner ? BANNER_H : lh(node, cfg));
  const spacingX = cfg.spacingX, gapY = Math.max(16, cfg.spacingY * 0.45);
  // wrap by COUNT (≈√n per row, scaled by the aspect-fit density) so a wide-subtree
  // sibling can't defeat the wrap. density>1 = wider rows (fill width), <1 = narrower.
  const perRow = Math.max(1, Math.round(Math.sqrt(n) * (cfg._rowDensity || 1)));
  const rows = [];
  for (let i = 0; i < n; i += perRow) {
    const row = []; for (let k = 0; k < perRow && i + k < n; k++) row.push(i + k);
    rows.push(row);
  }

  // banner sits closer to its row of cards than a normal parent does
  const headerGap = node.isVirtual ? 0 : (isBanner ? Math.max(12, cfg.spacingY * 0.3) : cfg.spacingY);
  const topY = H + headerGap;
  let y = topY, blockW = 0;
  const rowInfo = [];
  for (const row of rows) {
    const rowW = row.reduce((s, i) => s + cms[i].w, 0) + (row.length - 1) * spacingX;
    const rowH = Math.max(...row.map((i) => cms[i].h));
    rowInfo.push({ y, rowW, rowH, row }); blockW = Math.max(blockW, rowW); y += rowH + gapY;
  }
  const blockBottom = y - gapY;

  const childPlacements = [], edgeRoutes = [];
  for (const { y: ry, rowW, rowH, row } of rowInfo) {
    let x = (blockW - rowW) / 2;                 // center each row in the block
    for (const i of row) {
      const m = cms[i];
      childPlacements[i] = { entry: entry.children[i], cx: x, cy: ry + (rowH - m.h) / 2, m };
      edgeRoutes[i] = { childId: entry.children[i].node.id, routeType: 'grid' };
      x += m.w + spacingX;
    }
  }

  // a banner spans exactly its block; a normal parent is just centered over it
  const w = isBanner ? blockW : Math.max(blockW, W);
  const shift = (w - blockW) / 2;
  if (shift > 0.01) for (let i = 0; i < n; i++) childPlacements[i].cx += shift;
  const parentCenter = w / 2;
  return {
    w, h: blockBottom,
    anchorLeft: parentCenter, anchorRight: w - parentCenter,
    nodeCenterX: parentCenter, nodeCenterY: H / 2,
    childPlacements, edgeRoutes,
    banner: isBanner, bannerW: isBanner ? blockW : 0, bannerH: isBanner ? BANNER_H : 0,
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
      // a banner department is resized to span its block (safe: `node` is a fresh
      // makeNode copy, so this never mutates the caller's data)
      if (meas.banner) { node.width = meas.bannerW; node.height = meas.bannerH; }
      out.push({ node, lx: cx, ly: cy, w: lw(node, cfg), h: lh(node, cfg),
                 parentId: node.parentId, routeType: routeOf[node.id] || 'bus', banner: !!meas.banner });
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
  // Custom fills a target shape: aspect = width/height. `targetSize` (e.g. a tarp's
  // dimensions, any units) overrides; otherwise `targetAspect`; default ≈ landscape tarp.
  let targetAspect = options.targetAspect != null ? options.targetAspect : 1.6;
  const ts = options.targetSize;
  if (ts && ts.width > 0 && ts.height > 0) targetAspect = ts.width / ts.height;
  return {
    orientation: options.orientation || 'TopToBottom',
    subtreeMode: options.subtreeMode || 'Balanced',
    spacingX: options.spacingX != null ? options.spacingX : 40,
    spacingY: options.spacingY != null ? options.spacingY : 70,
    gridSize: options.gridSize != null ? options.gridSize : 22,
    alignGrid: !!options.alignGrid,
    targetAspect: targetAspect > 0 ? targetAspect : 1.6,
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

  // Custom: search a row-density that makes the overall shape best fill targetAspect.
  if (cfg.subtreeMode === 'Custom') {
    const candidates = [0.4, 0.55, 0.7, 0.85, 1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 4];
    let best = 1, bestErr = Infinity;
    for (const f of candidates) {
      const m = measureSubtree(visible, { ...cfg, _rowDensity: f });
      const asp = m.h > 0 ? m.w / m.h : 1;
      const err = Math.abs(Math.log(asp) - Math.log(cfg.targetAspect));  // ratio-symmetric error
      if (err < bestErr) { bestErr = err; best = f; }
    }
    cfg._rowDensity = best;
  }

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
