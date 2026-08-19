// The subtree layout engine — extent-based recursive packing.
// Pure: every state read is threaded through an explicit `cfg` object,
// so this module never touches globals, the DOM, or window.
//
// Layout families:
//   Family A (Balanced/Center/Left/Right) — horizontal child row
//   Family B (Alternate*)                 — vertical "brick wall" snake
//   Family C (AutoSmart)                  — recursive measured block grid with
//                                           compact direct-staff groups
//   GridSmart                             — recursive occupancy-mould placement
//                                           with every edge routed on its lattice
//   Matrix                                 — uniform per-depth rows
// Orientation is a pure transform applied after a logical TopToBottom layout.

import dagre from '@dagrejs/dagre';
import { SNAKE_STUB, CANVAS_PAD } from './constants.js';
import { buildTree, getVisibleTree, visibleDepths } from './tree.js';
import { makeNode } from './dataImport.js';
import { buildFamilyConnectorNetwork } from './connectorGeometry.js';

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
function isAuto(mode) {
  return mode === 'Auto' || mode === 'AutoSmart' || mode === 'GridSmart';
}

/* recursive EXTENT-based measurement (logical TopToBottom space) */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function autoBlockCount(entry) {
  let hasLeaves = false;
  let branches = 0;
  for (const child of entry.children) {
    if (isFeatured(child)) continue;
    if (child.children.length === 0) hasLeaves = true;
    else branches += 1;
  }
  return branches + (hasLeaves ? 1 : 0);
}

function childTargetAspect(entry, targetAspect) {
  const blocks = autoBlockCount(entry);
  if (blocks <= 1) return targetAspect;
  // A parent may use the whole canvas shape, but each peer block only owns a
  // fraction of that width. Passing the full landscape target into every
  // nested branch makes all of them landscape too, producing a very wide,
  // shallow chart. This context-aware target lets those branches grow down
  // into the space allocated to them while the parent remains landscape.
  return clamp(targetAspect / Math.pow(blocks, 0.28), 0.88, Math.max(1.1, targetAspect));
}

function usesCenteredThreeBranchRank(entry, cfg, depth) {
  if (cfg.subtreeMode !== 'GridSmart' || depth > 1 || entry.node.isVirtual
    || cfg.visualTargetAspect < 0.8) return false;
  const regular = entry.children.filter((child) => !isFeatured(child));
  const branches = regular.filter((child) => child.children.length > 0);
  const leaves = regular.filter((child) => child.children.length === 0);
  return branches.length === 3
    && (leaves.length > 0 || regular.length < entry.children.length);
}

function measureSubtree(entry, cfg, targetAspect = cfg.targetAspect, depth = 0) {
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
  const mode = effectiveMode(node, cfg);
  const baseDescendantTarget = isAuto(mode) ? childTargetAspect(entry, targetAspect) : targetAspect;
  const centeredThreeBranchRank = usesCenteredThreeBranchRank(entry, cfg, depth);
  const childMeasures = kids.map((child) => {
    // A two-person division would otherwise become a narrow vertical stack
    // beside wider peer divisions. Let those two cards occupy one row so the
    // subtree uses its available grid cells instead of requiring a fake gap.
    const compactTwoLeafDivision = centeredThreeBranchRank
      && !isFeatured(child)
      && child.children.length === 2
      && child.children.every((grandchild) => grandchild.children.length === 0);
    const childTarget = compactTwoLeafDivision
      ? Math.max(1.15, baseDescendantTarget)
      : baseDescendantTarget;
    return measureSubtree(child, cfg, childTarget, depth + 1);
  });
  const descendantTarget = baseDescendantTarget;
  return isAuto(mode)
    ? measureAuto(entry, childMeasures, cfg, targetAspect, descendantTarget, depth)
    : isSnake(mode)
    ? measureSnake(entry, childMeasures, mode, cfg)
    : measureRow(entry, childMeasures, mode, cfg);
}

function arrangementScore(width, height, targetAspect, occupiedArea, rowCount) {
  const aspect = Math.max(0.01, width / Math.max(1, height));
  const shapePenalty = Math.abs(Math.log(aspect / targetAspect));
  const waste = Math.max(0, width * height - occupiedArea) / Math.max(1, occupiedArea);
  return shapePenalty + waste * 0.035 + rowCount * 0.002;
}

function balancedRowScore(rows, width, baseScore) {
  if (rows.length <= 1) return baseScore;
  const widestCount = Math.max(...rows.map((row) => row.cells.length));
  const narrowestCount = Math.min(...rows.map((row) => row.cells.length));
  const raggedWidth = rows.reduce((sum, row) => sum + (1 - row.w / Math.max(1, width)) ** 2, 0)
    / rows.length;
  const countImbalance = (widestCount - narrowestCount) / Math.max(1, widestCount);
  return baseScore + raggedWidth * 0.18 + countImbalance * 0.16;
}

/*
 * Pack ordered rectangles into deterministic rows. We evaluate every possible
 * column count instead of relying on a magic child-count threshold. This makes
 * the same data + target shape produce the same result on every machine.
 */
function packRows(
  items,
  targetAspect,
  gapX,
  gapY,
  minColumns = 1,
  allowShortFirst = false,
  flexibleRows = false,
  minRowFillRatio = 0.5,
) {
  if (!items.length) return { w: 0, h: 0, rows: [], columns: 0, placements: [], flow: 'rows' };
  let best = null;
  const occupiedArea = items.reduce((sum, item) => sum + item.w * item.h, 0);
  for (let columns = Math.min(items.length, Math.max(1, minColumns)); columns <= items.length; columns += 1) {
    const remainder = items.length % columns;
    const firstRowCounts = allowShortFirst && remainder ? [columns, remainder] : [columns];
    for (const firstRowCount of firstRowCounts) {
      const rows = [];
      let start = 0;
      let rowSize = firstRowCount;
      while (start < items.length) {
        const cells = items.slice(start, start + rowSize);
        const w = cells.reduce((sum, item) => sum + item.w, 0) + gapX * Math.max(0, cells.length - 1);
        const h = Math.max(...cells.map((item) => item.h));
        rows.push({ cells, w, h });
        start += rowSize;
        rowSize = columns;
      }
      const widestRowCount = Math.max(...rows.map((row) => row.cells.length));
      const narrowestRowCount = Math.min(...rows.map((row) => row.cells.length));
      if (rows.length > 1 && narrowestRowCount / widestRowCount < minRowFillRatio) continue;
      const w = Math.max(...rows.map((row) => row.w));
      const h = rows.reduce((sum, row) => sum + row.h, 0) + gapY * Math.max(0, rows.length - 1);
      const score = balancedRowScore(
        rows,
        w,
        arrangementScore(w, h, targetAspect, occupiedArea, rows.length),
      );
      if (!best || score < best.score - 1e-9
        || (Math.abs(score - best.score) < 1e-9 && columns < best.columns)) {
        best = { w, h, rows, columns, score };
      }
    }
  }

  // Structural blocks vary greatly in size. A fixed column count can leave a
  // large hole beneath a short block simply because its neighbour is tall.
  // For small peer sets, evaluate every ordered row partition as well. This
  // retains semantic order but permits compact patterns such as 3-2-1.
  if (flexibleRows && items.length > 1 && items.length <= 12) {
    const partitionCount = 2 ** (items.length - 1);
    for (let mask = 1; mask < partitionCount; mask += 1) {
      const rowCells = [];
      let current = [];
      items.forEach((item, index) => {
        current.push(item);
        if (index === items.length - 1 || (mask & (1 << index))) {
          rowCells.push(current);
          current = [];
        }
      });
      const rows = rowCells.map((cells) => ({
        cells,
        w: cells.reduce((sum, item) => sum + item.w, 0) + gapX * Math.max(0, cells.length - 1),
        h: Math.max(...cells.map((item) => item.h)),
      }));
      const widestRowCount = Math.max(...rows.map((row) => row.cells.length));
      const narrowestRowCount = Math.min(...rows.map((row) => row.cells.length));
      if (rows.length > 1 && narrowestRowCount / widestRowCount < minRowFillRatio) continue;
      const w = Math.max(...rows.map((row) => row.w));
      const h = rows.reduce((sum, row) => sum + row.h, 0) + gapY * Math.max(0, rows.length - 1);
      const columns = Math.max(...rows.map((row) => row.cells.length));
      const score = balancedRowScore(
        rows,
        w,
        arrangementScore(w, h, targetAspect, occupiedArea, rows.length),
      );
      if (score < best.score - 1e-9) best = { w, h, rows, columns, score };
    }
  }

  let y = 0;
  const placements = [];
  best.rows.forEach((row, rowIndex) => {
    let x = (best.w - row.w) / 2;
    row.cells.forEach((item) => {
      placements.push({ item, x, y, row: rowIndex, rowHeight: row.h });
      x += item.w + gapX;
    });
    y += row.h + gapY;
  });
  return { ...best, placements, flow: 'rows' };
}

function packColumns(items, targetAspect, gapX, gapY) {
  if (!items.length) return { w: 0, h: 0, columns: [], placements: [], flow: 'columns' };
  if (items.length > 12) return packRows(items, targetAspect, gapX, gapY);
  const occupiedArea = items.reduce((sum, item) => sum + item.w * item.h, 0);
  let best = null;
  const partitionCount = 2 ** Math.max(0, items.length - 1);
  for (let mask = 0; mask < partitionCount; mask += 1) {
    const columnCells = [];
    let current = [];
    items.forEach((item, index) => {
      current.push(item);
      if (index === items.length - 1 || (mask & (1 << index))) {
        columnCells.push(current);
        current = [];
      }
    });
    const columns = columnCells.map((cells) => ({
      cells,
      w: Math.max(...cells.map((item) => item.w)),
      h: cells.reduce((sum, item) => sum + item.h, 0) + gapY * Math.max(0, cells.length - 1),
    }));
    const w = columns.reduce((sum, column) => sum + column.w, 0) + gapX * Math.max(0, columns.length - 1);
    const h = Math.max(...columns.map((column) => column.h));
    const score = arrangementScore(w, h, targetAspect, occupiedArea, columns.length);
    if (!best || score < best.score - 1e-9
      || (Math.abs(score - best.score) < 1e-9 && columns.length < best.columns.length)) {
      best = { w, h, columns, score };
    }
  }

  let x = 0;
  const placements = [];
  best.columns.forEach((column, columnIndex) => {
    let y = 0;
    column.cells.forEach((item) => {
      placements.push({
        item,
        x: x + (column.w - item.w) / 2,
        y,
        column: columnIndex,
        columnWidth: column.w,
      });
      y += item.h + gapY;
    });
    x += column.w + gapX;
  });
  return { ...best, placements, flow: 'columns' };
}

/*
 * Pack ordered blocks into balanced vertical columns. The first visual row is
 * filled left-to-right; every remaining block goes into the currently shortest
 * column. Unlike rectangular rows, a tall branch therefore does not reserve
 * empty height underneath every shorter neighbour in that row.
 */
function packMasonryColumns(items, targetAspect, gapX, gapY) {
  if (!items.length) return { w: 0, h: 0, columns: [], placements: [], flow: 'columns', packing: 'masonry' };
  const occupiedArea = items.reduce((sum, item) => sum + item.w * item.h, 0);
  let best = null;
  for (let columnCount = 1; columnCount <= items.length; columnCount += 1) {
    const columns = Array.from({ length: columnCount }, () => ({ cells: [], w: 0, h: 0 }));
    items.forEach((item, itemIndex) => {
      let columnIndex = itemIndex;
      if (itemIndex >= columnCount) {
        columnIndex = 0;
        for (let index = 1; index < columns.length; index += 1) {
          if (columns[index].h < columns[columnIndex].h - 1e-9) columnIndex = index;
        }
      }
      const column = columns[columnIndex];
      column.cells.push(item);
      column.w = Math.max(column.w, item.w);
      column.h += item.h + (column.cells.length > 1 ? gapY : 0);
    });
    const w = columns.reduce((sum, column) => sum + column.w, 0) + gapX * Math.max(0, columns.length - 1);
    const h = Math.max(...columns.map((column) => column.h));
    const score = arrangementScore(w, h, targetAspect, occupiedArea, columns.length);
    if (!best || score < best.score - 1e-9
      || (Math.abs(score - best.score) < 1e-9 && columns.length < best.columns.length)) {
      best = { w, h, columns, score };
    }
  }

  let x = 0;
  const placements = [];
  best.columns.forEach((column, columnIndex) => {
    let y = 0;
    column.cells.forEach((item) => {
      placements.push({
        item,
        x: x + (column.w - item.w) / 2,
        y,
        column: columnIndex,
        columnWidth: column.w,
      });
      y += item.h + gapY;
    });
    x += column.w + gapX;
  });
  return { ...best, placements, flow: 'columns', packing: 'masonry' };
}

function gridCeil(value, gridSize) {
  return Math.ceil(value / gridSize) * gridSize;
}

function rectanglesHaveClearance(a, b, gapX, gapY) {
  return a.x + a.item.w + gapX <= b.x + 0.01
    || b.x + b.item.w + gapX <= a.x + 0.01
    || a.y + a.item.h + gapY <= b.y + 0.01
    || b.y + b.item.h + gapY <= a.y + 0.01;
}

function pushFootprintSegment(rects, from, to, thickness, width, height) {
  const half = thickness / 2;
  const left = clamp(Math.min(from.x, to.x) - half, 0, width);
  const right = clamp(Math.max(from.x, to.x) + half, 0, width);
  const top = clamp(Math.min(from.y, to.y) - half, 0, height);
  const bottom = clamp(Math.max(from.y, to.y) + half, 0, height);
  if (right - left > 0.01 && bottom - top > 0.01) {
    rects.push({ left, right, top, bottom, kind: 'channel' });
  }
}

function collectMeasureFootprint(entry, measure, cfg, offsetX = 0, offsetY = 0, rects = []) {
  const nodeWidth = lw(entry.node, cfg);
  const nodeHeight = entry.node.isVirtual ? 0 : lh(entry.node, cfg);
  if (!entry.node.isVirtual) {
    rects.push({
      left: offsetX + measure.nodeCenterX - nodeWidth / 2,
      right: offsetX + measure.nodeCenterX + nodeWidth / 2,
      top: offsetY + measure.nodeCenterY - nodeHeight / 2,
      bottom: offsetY + measure.nodeCenterY + nodeHeight / 2,
      kind: 'node',
    });
  }

  const placementById = new Map((measure.childPlacements || [])
    .map((placement) => [String(placement.entry.node.id), placement]));
  const channelThickness = Math.max(4, cfg.gridSize * 0.32);
  for (const route of measure.edgeRoutes || []) {
    const placement = placementById.get(String(route.childId));
    if (!placement) continue;
    const childHeight = placement.entry.node.isVirtual ? 0 : lh(placement.entry.node, cfg);
    const start = {
      x: offsetX + measure.nodeCenterX,
      y: offsetY + measure.nodeCenterY + nodeHeight / 2,
    };
    const end = {
      x: offsetX + placement.cx + placement.m.nodeCenterX,
      y: offsetY + placement.cy + placement.m.nodeCenterY - childHeight / 2,
    };
    const explicit = (route.points || []).map((point) => ({
      x: offsetX + point.x,
      y: offsetY + point.y,
    }));
    const midpointY = (start.y + end.y) / 2;
    const points = explicit.length
      ? simplifyOrthogonalPoints(orthogonalPoints([start, ...explicit, end], false))
      : simplifyOrthogonalPoints([start, { x: start.x, y: midpointY }, { x: end.x, y: midpointY }, end]);
    for (let index = 1; index < points.length; index += 1) {
      pushFootprintSegment(
        rects,
        points[index - 1],
        points[index],
        channelThickness,
        offsetX + measure.w,
        offsetY + measure.h,
      );
    }
  }

  for (const placement of measure.childPlacements || []) {
    collectMeasureFootprint(
      placement.entry,
      placement.m,
      cfg,
      offsetX + placement.cx,
      offsetY + placement.cy,
      rects,
    );
  }
  return rects;
}

function itemFootprintRects(item) {
  return item.footprint?.length ? item.footprint : [{
    left: 0,
    right: item.w,
    top: 0,
    bottom: item.h,
    kind: 'node',
  }];
}

function footprintClearance(first, second, gapX, gapY, gridSize) {
  if (first.kind === 'node' && second.kind === 'node') return { x: gapX, y: gapY };
  const channelGap = Math.max(5, gridSize * (first.kind === second.kind ? 0.28 : 0.48));
  return { x: channelGap, y: channelGap };
}

function buildFootprintSpatialIndex(rects, cellSize) {
  const buckets = new Map();
  rects.forEach((rect, index) => {
    const minX = Math.floor(rect.left / cellSize);
    const maxX = Math.floor(rect.right / cellSize);
    const minY = Math.floor(rect.top / cellSize);
    const maxY = Math.floor(rect.bottom / cellSize);
    for (let bx = minX; bx <= maxX; bx += 1) {
      for (let by = minY; by <= maxY; by += 1) {
        const key = `${bx}:${by}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(index);
      }
    }
  });
  return { rects, buckets, cellSize };
}

function nearbyFootprintRects(index, rect, padding) {
  const minX = Math.floor((rect.left - padding) / index.cellSize);
  const maxX = Math.floor((rect.right + padding) / index.cellSize);
  const minY = Math.floor((rect.top - padding) / index.cellSize);
  const maxY = Math.floor((rect.bottom + padding) / index.cellSize);
  const found = new Set();
  for (let bx = minX; bx <= maxX; bx += 1) {
    for (let by = minY; by <= maxY; by += 1) {
      for (const rectIndex of index.buckets.get(`${bx}:${by}`) || []) found.add(rectIndex);
    }
  }
  return [...found].map((rectIndex) => index.rects[rectIndex]);
}

function translatedFootprintsClear(currentRects, x, y, placedIndex, gapX, gapY, gridSize) {
  for (const current of currentRects) {
    const translated = {
      ...current,
      left: current.left + x,
      right: current.right + x,
      top: current.top + y,
      bottom: current.bottom + y,
    };
    const nearby = nearbyFootprintRects(placedIndex, translated, Math.max(gapX, gapY));
    for (const placed of nearby) {
      const clearance = footprintClearance(translated, placed, gapX, gapY, gridSize);
      if (translated.right + clearance.x <= placed.left + 0.01
        || placed.right + clearance.x <= translated.left + 0.01
        || translated.bottom + clearance.y <= placed.top + 0.01
        || placed.bottom + clearance.y <= translated.top + 0.01) continue;
      return false;
    }
  }
  return true;
}

function boundedGridCoordinates(values, limit = 18) {
  const sorted = [...new Set(values.filter((value) => Number.isFinite(value) && value >= 0))]
    .sort((a, b) => a - b);
  if (sorted.length <= limit) return sorted;
  const bounded = [];
  for (let index = 0; index < limit; index += 1) {
    bounded.push(sorted[Math.round(index * (sorted.length - 1) / (limit - 1))]);
  }
  return [...new Set(bounded)].sort((a, b) => a - b);
}

/*
 * Place measured subtree rectangles into an invisible occupancy mould. Unlike
 * row and column packing, every exposed card edge creates another legal grid
 * coordinate. A later, shorter block can therefore occupy the space beneath a
 * short neighbour while a taller peer continues alongside it.
 *
 * The mould is deterministic: source order is retained, all placement origins
 * are quantized, and candidate cells are tried from top-to-bottom then
 * left-to-right. Several bounded mould widths are evaluated so the whole-chart
 * target aspect can select a landscape, square, or portrait arrangement.
 */
function packOccupancyGrid(items, targetAspect, gapX, gapY, gridSize) {
  if (!items.length) {
    return {
      w: 0, h: 0, columns: [], rows: [], placements: [],
      flow: 'columns', packing: 'occupancy', score: 0,
    };
  }

  const latticeSize = Math.max(1, gridSize);
  const gridGapX = gridCeil(gapX, latticeSize);
  const gridGapY = gridCeil(gapY, latticeSize);
  const occupiedArea = items.reduce((sum, item) => sum + itemFootprintRects(item)
    .reduce((area, rect) => area + (rect.right - rect.left) * (rect.bottom - rect.top), 0), 0);
  const widest = Math.max(...items.map((item) => item.w));
  const totalWidth = items.reduce((sum, item) => sum + item.w, 0)
    + gridGapX * Math.max(0, items.length - 1);
  const idealWidth = Math.sqrt(Math.max(1, occupiedArea) * Math.max(0.2, targetAspect));
  const mouldWidths = new Set([
    gridCeil(widest, latticeSize),
    gridCeil(totalWidth, latticeSize),
  ]);
  for (const multiplier of [0.62, 0.76, 0.9, 1, 1.12, 1.3, 1.55, 1.85]) {
    mouldWidths.add(gridCeil(Math.max(widest, idealWidth * multiplier), latticeSize));
  }
  let prefixWidth = 0;
  items.forEach((item, index) => {
    prefixWidth += item.w + (index ? gridGapX : 0);
    mouldWidths.add(gridCeil(Math.max(widest, prefixWidth), latticeSize));
  });

  let best = null;
  for (const mouldWidth of [...mouldWidths].sort((a, b) => a - b)) {
    const placements = [];
    for (const item of items) {
      const currentRects = itemFootprintRects(item);
      const placedRects = placements.flatMap((placement) => itemFootprintRects(placement.item).map((rect) => ({
        ...rect,
        left: rect.left + placement.x,
        right: rect.right + placement.x,
        top: rect.top + placement.y,
        bottom: rect.bottom + placement.y,
      })));
      const placedIndex = buildFootprintSpatialIndex(
        placedRects,
        Math.max(64, gridGapX * 2, gridGapY * 1.2),
      );
      const xs = [0];
      const ys = [0];
      for (const placed of placements) {
        xs.push(gridCeil(placed.x + placed.item.w + gridGapX, latticeSize));
        ys.push(gridCeil(placed.y + placed.item.h + gridGapY, latticeSize));
      }
      for (const placedRect of placedRects) {
        for (const currentRect of currentRects) {
          xs.push(gridCeil(placedRect.right + gridGapX - currentRect.left, latticeSize));
          ys.push(gridCeil(placedRect.bottom + gridGapY - currentRect.top, latticeSize));
        }
      }
      let selected = null;
      for (const y of boundedGridCoordinates(ys)) {
        for (const x of boundedGridCoordinates(xs)) {
          if (x + item.w > mouldWidth + 0.01) continue;
          if (translatedFootprintsClear(
            currentRects,
            x,
            y,
            placedIndex,
            gridGapX,
            gridGapY,
            latticeSize,
          )) {
            selected = { item, x, y };
            break;
          }
        }
        if (selected) break;
      }
      // x=0 below the existing mould is always legal, so this is only a
      // defensive fallback for malformed dimensions.
      const fallbackY = placements.length
        ? gridCeil(Math.max(...placements.map((placed) => placed.y + placed.item.h)) + gridGapY, latticeSize)
        : 0;
      placements.push(selected || { item, x: 0, y: fallbackY });
    }

    const w = Math.max(...placements.map((placement) => placement.x + placement.item.w));
    const h = Math.max(...placements.map((placement) => placement.y + placement.item.h));
    const yLevels = [...new Set(placements.map((placement) => placement.y))].sort((a, b) => a - b);
    const rows = yLevels.map((y) => {
      const rowPlacements = placements.filter((placement) => placement.y === y);
      const minX = Math.min(...rowPlacements.map((placement) => placement.x));
      const maxX = Math.max(...rowPlacements.map((placement) => placement.x + placement.item.w));
      return {
        cells: rowPlacements.map((placement) => placement.item),
        w: maxX - minX,
        h: Math.max(...rowPlacements.map((placement) => placement.item.h)),
        y,
      };
    });
    const xLevels = [...new Set(placements.map((placement) => placement.x))].sort((a, b) => a - b);
    const columns = xLevels.map((x, columnIndex) => {
      const columnPlacements = placements
        .filter((placement) => placement.x === x)
        .sort((a, b) => a.y - b.y);
      for (const placement of columnPlacements) {
        placement.column = columnIndex;
        placement.columnWidth = Math.max(...columnPlacements.map((entry) => entry.item.w));
      }
      return {
        cells: columnPlacements.map((placement) => placement.item),
        w: Math.max(...columnPlacements.map((placement) => placement.item.w)),
        h: Math.max(...columnPlacements.map((placement) => placement.y + placement.item.h))
          - Math.min(...columnPlacements.map((placement) => placement.y)),
      };
    });
    rows.forEach((row, rowIndex) => {
      placements.filter((placement) => placement.y === row.y).forEach((placement) => {
        placement.row = rowIndex;
        placement.rowHeight = row.h;
      });
    });

    const score = arrangementScore(w, h, targetAspect, occupiedArea, yLevels.length)
      + Math.max(0, mouldWidth - w) / Math.max(1, w) * 0.01;
    const candidate = {
      w, h, rows, columns, placements, score,
      flow: 'columns', packing: 'occupancy', mouldWidth,
    };
    if (!best || score < best.score - 1e-9
      || (Math.abs(score - best.score) < 1e-9 && h < best.h - 0.01)
      || (Math.abs(score - best.score) < 1e-9 && Math.abs(h - best.h) < 0.01 && w < best.w)) {
      best = candidate;
    }
  }
  return best;
}

function safeInteriorRail(pack, minGap, targetX = pack.w / 2) {
  const intervals = (pack.placements || [])
    .map((placement) => [placement.x, placement.x + placement.item.w])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (!intervals.length) return null;

  const merged = [];
  for (const interval of intervals) {
    const last = merged[merged.length - 1];
    if (!last || interval[0] > last[1] + 0.01) merged.push(interval.slice());
    else last[1] = Math.max(last[1], interval[1]);
  }

  const gaps = [];
  for (let index = 1; index < merged.length; index += 1) {
    const left = merged[index - 1][1];
    const right = merged[index][0];
    if (right - left >= minGap) gaps.push({ x: (left + right) / 2, distance: Math.abs((left + right) / 2 - targetX) });
  }
  gaps.sort((a, b) => a.distance - b.distance || a.x - b.x);
  return gaps[0]?.x ?? null;
}

function safeWrappedFamilyRail(pack, minGap, targetX = pack.w / 2) {
  const placements = pack.placements || [];
  const rowLevels = [...new Set(placements.map((placement) => placement.y))].sort((a, b) => a - b);
  if (rowLevels.length < 2) return null;

  const firstRow = placements
    .filter((placement) => Math.abs(placement.y - rowLevels[0]) < 0.01)
    .sort((a, b) => a.x - b.x);
  const lastRowY = rowLevels.at(-1);
  const candidates = [];
  for (let index = 1; index < firstRow.length; index += 1) {
    const left = firstRow[index - 1].x + firstRow[index - 1].item.w;
    const right = firstRow[index].x;
    if (right - left < minGap) continue;
    const x = (left + right) / 2;
    // The rail may terminate at a last-row card, but it must remain in an
    // empty gutter through every earlier personnel row.
    const blocked = placements.some((placement) => placement.y < lastRowY - 0.01
      && x > placement.x + 0.01
      && x < placement.x + placement.item.w - 0.01);
    if (!blocked) candidates.push({ x, distance: Math.abs(x - targetX) });
  }
  candidates.sort((a, b) => a.distance - b.distance || a.x - b.x);
  return candidates[0]?.x ?? null;
}

function safeSharedRail(pack, targetX, clearance, minGap) {
  const interior = safeInteriorRail(pack, minGap, targetX);
  if (interior != null) return interior;
  const placements = pack.placements || [];
  const leftEdge = placements.length ? Math.min(...placements.map((placement) => placement.x)) : 0;
  const rightEdge = placements.length
    ? Math.max(...placements.map((placement) => placement.x + placement.item.w))
    : pack.w;
  const left = leftEdge - clearance;
  const right = rightEdge + clearance;
  return Math.abs(targetX - left) <= Math.abs(targetX - right) ? left : right;
}

function appendRoutePoint(points, point) {
  const last = points[points.length - 1];
  if (!last || Math.abs(last.x - point.x) > 0.01 || Math.abs(last.y - point.y) > 0.01) points.push(point);
}

function isFeatured(entry) {
  const data = entry?.node?.data || {};
  const label = String(entry?.node?.label || '');
  return data.printRole === 'head' || data.is_head === true || data.isHead === true
    || /\b(municipal (vice )?mayor|office head|department head|head of office)\b/i.test(label);
}

function countBoundedOneRankFamilies(entry) {
  const regularChildren = entry.children.filter((child) => !isFeatured(child));
  const eligible = regularChildren.length === 5
    && regularChildren.length === entry.children.length
    && regularChildren.every((child) => child.children.length === 0);
  return (eligible ? 1 : 0)
    + entry.children.reduce((sum, child) => sum + countBoundedOneRankFamilies(child), 0);
}

/*
 * AutoSmart groups leaf siblings into a compact band and treats every child
 * subtree as a measured block. Those blocks are packed again at the parent,
 * so one large branch no longer forces all peer cards into a single huge row.
 */
function measureAuto(entry, cms, cfg, targetAspect, blockTargetAspect, depth) {
  const node = entry.node;
  const W = lw(node, cfg), H = node.isVirtual ? 0 : lh(node, cfg);
  const autoSpacingY = cfg.spacingY * (cfg.autoSpacingYScale || 1);
  const gapX = Math.max(12, cfg.spacingX);
  // GridSmart needs a real routing row between card rows. AutoSmart may use a
  // tighter visual gap, but snapping both rows to the lattice can otherwise
  // collapse that gap until no card-free ingress channel remains.
  const gapY = cfg.subtreeMode === 'GridSmart'
    ? Math.max(cfg.gridSize * 2, autoSpacingY * 0.55)
    : Math.max(16, autoSpacingY * 0.55);
  const childTopGap = node.isVirtual ? 0 : autoSpacingY;
  const featured = [];
  const leaves = [];
  const branches = [];

  entry.children.forEach((child, index) => {
    const item = { index, entry: child, m: cms[index], w: cms[index].w, h: cms[index].h };
    if (isFeatured(child)) featured.push(item);
    else if (child.children.length === 0) leaves.push(item);
    else branches.push(item);
  });

  // Leaf bands should be close to square. The parent-level block packing then
  // uses the full target aspect, producing the wide banded result for tarp and
  // landscape screens without making each individual band excessively wide.
  const centeredThreeBranchRank = usesCenteredThreeBranchRank(entry, cfg, depth);
  const cohesiveTopLevelBranches = cfg.subtreeMode === 'GridSmart'
    // buildTree wraps the visible roots in one virtual entry, so an actual
    // office/organization root is normally measured at depth one.
    && depth <= 1
    && !node.isVirtual
    && (branches.length >= 4 || centeredThreeBranchRank);
  const separateLeafBand = (cfg.leafFlow === 'band' || cohesiveTopLevelBranches)
    && leaves.length > 0
    && branches.length > 0
    && (targetAspect >= 0.8 || cohesiveTopLevelBranches);
  const leafTarget = separateLeafBand
    ? clamp(targetAspect * 1.8, 1.8, 5)
    : blockTargetAspect;
  const forceOneRank = cfg.preferFiveLeafRank
    && cfg.visualTargetAspect >= 0.8
    && featured.length === 0
    && branches.length === 0
    && leaves.length === 5;
  const leafPack = packRows(
    leaves,
    leafTarget,
    gapX,
    gapY,
    forceOneRank ? leaves.length : 1,
  );
  const featuredPack = packRows(featured, Math.max(1, targetAspect), gapX, gapY);

  const blocks = [];
  if (leaves.length && !separateLeafBand) {
    const leafBlock = { kind: 'leaves', w: leafPack.w, h: leafPack.h, pack: leafPack };
    if (cfg.subtreeMode === 'GridSmart') {
      leafBlock.footprint = leafPack.placements.flatMap((placement) => collectMeasureFootprint(
        placement.item.entry,
        placement.item.m,
        cfg,
        placement.x,
        placement.y,
      ));
    }
    blocks.push(leafBlock);
  }
  branches.forEach((item) => {
    const block = { kind: 'branch', w: item.w, h: item.h, item };
    if (cfg.subtreeMode === 'GridSmart') {
      block.footprint = collectMeasureFootprint(item.entry, item.m, cfg);
    }
    blocks.push(block);
  });
  // Evaluate every row/column count. Forcing a small number of peer branches
  // into one row created a wide, shallow band with empty space below it. The
  // block packer may now wrap peers onto another grid row when that uses the
  // target rectangle more effectively.
  const blockGapX = gapX * 1.25;
  const blockGapY = gapY * 1.25;
  const rowBlockPack = packRows(
    blocks,
    targetAspect,
    blockGapX,
    blockGapY,
    centeredThreeBranchRank ? blocks.length : 1,
    !!cfg.preferShortFirst,
    !!cfg.flexibleRows,
    cohesiveTopLevelBranches && cfg.visualTargetAspect < 1.3 ? 0.75 : 0.5,
  );
  const allowColumnPacking = blocks.some((block) => block.kind === 'leaves');
  const columnBlockPack = cfg.blockFlow === 'rows' || !allowColumnPacking
    ? null
    : packColumns(blocks, targetAspect, blockGapX, blockGapY);
  const masonryBlockPack = cfg.blockFlow === 'rows' || cfg.blockFlow === 'columns' || !allowColumnPacking
    ? null
    : packMasonryColumns(blocks, targetAspect, blockGapX, blockGapY);
  const occupancyBlockPack = cfg.subtreeMode === 'GridSmart'
    ? packOccupancyGrid(blocks, targetAspect, blockGapX, blockGapY, cfg.gridSize)
    : null;
  const adaptiveBlockPack = [rowBlockPack, columnBlockPack, masonryBlockPack, occupancyBlockPack]
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || Number(a.flow === 'columns') - Number(b.flow === 'columns'))[0];
  // A large set of peer structural branches reads as one organizational rank.
  // Letting the occupancy mould tuck later peers beneath holes in earlier
  // subtrees is compact, but it also makes equal-level divisions look like
  // descendants. Keep those branch roots on coherent shelf rows; their own
  // descendants still use the sparse occupancy mould recursively.
  const preferCohesiveBranchRanks = cohesiveTopLevelBranches
    && (blocks.length >= 4 || centeredThreeBranchRank)
    && blocks.every((block) => block.kind === 'branch');
  let blockPack = cfg.subtreeMode === 'GridSmart'
    ? (preferCohesiveBranchRanks ? rowBlockPack : occupancyBlockPack)
    : cfg.blockFlow === 'columns'
      ? columnBlockPack || rowBlockPack
      : cfg.blockFlow === 'masonry'
        ? masonryBlockPack || rowBlockPack
        : cfg.blockFlow === 'adaptive'
          ? adaptiveBlockPack
        : rowBlockPack;
  const centeredBranchPlacement = centeredThreeBranchRank
    ? blockPack.placements[Math.floor(blockPack.placements.length / 2)]
    : null;
  const centeredBranchLocalX = centeredBranchPlacement?.item.kind === 'branch'
    ? centeredBranchPlacement.x + centeredBranchPlacement.item.item.m.nodeCenterX
    : null;
  // Three source-ordered office divisions read naturally as left / centre /
  // right. Uneven subtree widths must not push the middle division away from
  // the office centreline, so reserve symmetric mould space around its card.
  const centeredBranchWidth = centeredBranchLocalX == null
    ? 0
    : Math.max(centeredBranchLocalX, blockPack.w - centeredBranchLocalX) * 2;
  const contentW = Math.max(
    W,
    featuredPack.w,
    separateLeafBand ? leafPack.w : 0,
    blockPack.w,
    centeredBranchWidth,
  );
  const blocksX = centeredBranchLocalX == null
    ? (contentW - blockPack.w) / 2
    : contentW / 2 - centeredBranchLocalX;
  let parentCenter = contentW / 2;
  // When a section contains only personnel cards and those siblings wrap,
  // place the section card over the nearest continuous grid gutter. Routing
  // can then descend as one straight family spine instead of adding a small
  // corrective elbow below an otherwise movable box.
  if (cfg.subtreeMode === 'GridSmart'
    && featured.length === 0
    && branches.length === 0
    && leaves.length > 1
    && leafPack.rows.length > 1) {
    const leafBlockPlacement = blockPack.placements.find((placement) => placement.item.kind === 'leaves');
    const localRail = safeWrappedFamilyRail(
      leafPack,
      Math.max(8, gapX * 0.28),
      leafPack.w / 2,
    );
    if (leafBlockPlacement && localRail != null) {
      const candidate = blocksX + leafBlockPlacement.x + localRail;
      if (candidate - W / 2 >= -0.01 && candidate + W / 2 <= contentW + 0.01) parentCenter = candidate;
    }
  }
  const featuredTop = H + childTopGap;
  const directLeavesTop = featured.length
    ? featuredTop + featuredPack.h + childTopGap
    : H + childTopGap;
  const blocksTop = separateLeafBand
    ? directLeavesTop + leafPack.h + childTopGap
    : directLeavesTop;
  const childPlacements = [];
  const edgeRoutes = [];

  const featureX = (contentW - featuredPack.w) / 2;
  for (const p of featuredPack.placements || []) {
    childPlacements.push({ entry: p.item.entry, cx: featureX + p.x, cy: featuredTop + p.y, m: p.item.m });
    edgeRoutes.push({ childId: p.item.entry.node.id, routeType: 'bus' });
  }

  const topLaneY = H + Math.max(10, childTopGap * 0.38);
  const featuredLaneX = featureX - gapX * 0.35;
  const featuredBusY = featured.length
    ? featuredTop + featuredPack.h + Math.max(10, childTopGap * 0.38)
    : topLaneY;
  const featuredPrefix = featured.length ? [
    { x: parentCenter, y: topLaneY },
    { x: featuredLaneX, y: topLaneY },
    { x: featuredLaneX, y: featuredBusY },
  ] : [];
  const initialBlockRoute = featured.length
    ? featuredPrefix.slice()
    : [{ x: parentCenter, y: topLaneY }];
  let blockStartPrefix = initialBlockRoute;
  if (separateLeafBand) {
    const leavesX = (contentW - leafPack.w) / 2;
    const incomingX = initialBlockRoute.at(-1).x;
    const sharedRailX = leavesX + safeSharedRail(
      leafPack,
      incomingX - leavesX,
      gapX * 0.55,
      Math.max(8, gapX * 0.28),
    );
    const incomingY = initialBlockRoute.at(-1).y;
    for (const placement of leafPack.placements) {
      const item = placement.item;
      const childX = leavesX + placement.x;
      const childY = directLeavesTop + placement.y;
      const childCenterX = childX + item.m.nodeCenterX;
      const rowBusY = childY - Math.max(9, gapY * 0.34);
      childPlacements.push({ entry: item.entry, cx: childX, cy: childY, m: item.m });
      edgeRoutes.push({
        childId: item.entry.node.id,
        routeType: 'packed',
        points: [
          ...initialBlockRoute,
          { x: sharedRailX, y: incomingY },
          { x: sharedRailX, y: rowBusY },
          { x: childCenterX, y: rowBusY },
        ],
      });
    }
    blockStartPrefix = [
      ...initialBlockRoute,
      { x: sharedRailX, y: incomingY },
      { x: sharedRailX, y: blocksTop - Math.max(10, gapY * 0.34) },
    ];
  }
  const columnFlow = blockPack.flow === 'columns';
  const stackedBlocks = columnFlow
    ? blockPack.columns.some((column) => column.cells.length > 1)
    : blockPack.rows.length > 1;
  // A portrait grid often has no one x-coordinate that is open through every
  // row. Build a shared stair-step backbone instead: each row uses its nearest
  // safe gutter, and the rail shifts only in the empty space between rows.
  // Routes to every child in a row reuse the same prefix.
  const blockPrefixes = new Map();
  if (stackedBlocks && !columnFlow) {
    const route = blockStartPrefix.slice();
    let currentX = route.at(-1).x;
    let currentY = route.at(-1).y;
    for (let rowIndex = 0; rowIndex < blockPack.rows.length; rowIndex += 1) {
      const placements = blockPack.placements.filter((placement) => placement.row === rowIndex);
      const row = blockPack.rows[rowIndex];
      const localRailX = safeSharedRail(
        { w: blockPack.w, placements },
        parentCenter - blocksX,
        gapX * 0.55,
        Math.max(8, gapX * 0.28),
      );
      const railX = blocksX + localRailX;
      const rowTop = blocksTop + (placements[0]?.y || 0);
      const previous = rowIndex > 0 ? blockPack.rows[rowIndex - 1] : null;
      const previousPlacements = rowIndex > 0
        ? blockPack.placements.filter((placement) => placement.row === rowIndex - 1)
        : [];
      const previousBottom = previous
        ? blocksTop + (previousPlacements[0]?.y || 0) + previous.h
        : currentY;
      const transferY = rowIndex === 0 ? currentY : (previousBottom + rowTop) / 2;
      appendRoutePoint(route, { x: currentX, y: transferY });
      appendRoutePoint(route, { x: railX, y: transferY });
      const rowBusY = rowTop - Math.max(10, gapY * 0.34);
      appendRoutePoint(route, { x: railX, y: rowBusY });
      for (const placement of placements) blockPrefixes.set(placement, route.slice());
      currentX = railX;
      currentY = rowBusY;
    }
  }
  if (columnFlow) {
    // Column packing is used for narrow targets. Restarting a connector at the
    // parent for every column produced huge outer rectangles for lower sibling
    // subtrees. Chain vertically separated blocks through one stair-step
    // backbone instead: descend beside the current block, shift only in the
    // empty gap below it, then continue toward the next sibling.
    const ordered = blockPack.placements.slice().sort((a, b) => a.y - b.y || a.x - b.x);
    let route = blockStartPrefix.slice();
    let currentX = route.at(-1).x;
    let previousBottom = route.at(-1).y;
    for (const placement of ordered) {
      const blockTop = blocksTop + placement.y;
      const blockBottom = blockTop + placement.item.h;
      const localRailX = safeSharedRail(
        { w: blockPack.w, placements: [placement] },
        parentCenter - blocksX,
        gapX * 0.55,
        Math.max(8, gapX * 0.28),
      );
      const railX = blocksX + localRailX;
      const separated = blockTop >= previousBottom + Math.max(8, gapY * 0.18);
      if (separated) {
        const transferY = (previousBottom + blockTop) / 2;
        appendRoutePoint(route, { x: currentX, y: transferY });
        appendRoutePoint(route, { x: railX, y: transferY });
      } else {
        // Side-by-side blocks have no vertical transfer gap. Branch them from
        // the known-safe family start instead of cutting through a peer block.
        route = blockStartPrefix.slice();
        appendRoutePoint(route, { x: railX, y: route.at(-1).y });
      }
      appendRoutePoint(route, { x: railX, y: blockTop - Math.max(10, gapY * 0.34) });
      blockPrefixes.set(placement, route.slice());
      currentX = railX;
      previousBottom = Math.max(previousBottom, blockBottom);
    }
  }
  for (const bp of blockPack.placements || []) {
    const blockX = blocksX + bp.x;
    const blockY = blocksTop + bp.y;
    const blockPrefix = blockPrefixes.get(bp);
    if (bp.item.kind === 'branch') {
      const item = bp.item.item;
      const childCenterX = blockX + item.m.nodeCenterX;
      childPlacements.push({ entry: item.entry, cx: blockX, cy: blockY, m: item.m });
      edgeRoutes.push({
        childId: item.entry.node.id,
        routeType: 'bus',
        points: blockPrefix ? [
          ...blockPrefix,
          { x: childCenterX, y: blockY - Math.max(10, gapY * 0.34) },
        ] : [...blockStartPrefix, {
          x: childCenterX,
          y: blockStartPrefix.at(-1).y,
        }],
      });
      continue;
    }

    const pack = bp.item.pack;
    const incomingRailX = blockPrefix ? blockPrefix.at(-1).x : parentCenter;
    const sharedLeafRailX = blockX + safeSharedRail(
      pack,
      incomingRailX - blockX,
      gapX * 0.55,
      Math.max(8, gapX * 0.28),
    );
    for (const lp of pack.placements) {
      const item = lp.item;
      const childX = blockX + lp.x;
      const childY = blockY + lp.y;
      const childCenterX = childX + item.m.nodeCenterX;
      const rowBusY = childY - Math.max(9, gapY * 0.34);
      // Every card in the same personnel block shares one safe rail. This
      // avoids multiplying connector spines when an optimized grid shape has
      // no continuous interior gutter.
      let railX = sharedLeafRailX;
      childPlacements.push({ entry: item.entry, cx: childX, cy: childY, m: item.m });
      edgeRoutes.push({
        childId: item.entry.node.id,
        routeType: 'packed',
        points: blockPrefix ? [
          ...blockPrefix,
          { x: sharedLeafRailX, y: blockY - Math.max(10, gapY * 0.34) },
          { x: sharedLeafRailX, y: rowBusY },
          { x: childCenterX, y: rowBusY },
        ] : [
          ...(featured.length ? featuredPrefix : [{ x: parentCenter, y: topLaneY }]),
          { x: railX, y: featured.length ? featuredBusY : topLaneY },
          { x: railX, y: rowBusY },
          { x: childCenterX, y: rowBusY },
        ],
      });
    }
  }

  return {
    w: contentW,
    h: blocks.length ? blocksTop + blockPack.h : featuredTop + featuredPack.h,
    anchorLeft: parentCenter,
    anchorRight: contentW - parentCenter,
    nodeCenterX: parentCenter,
    nodeCenterY: H / 2,
    childPlacements,
    edgeRoutes,
    resolvedMode: cfg.subtreeMode === 'GridSmart' ? 'GridSmart' : 'AutoSmart',
  };
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

function entryIsStructural(entry) {
  return entry.children.length > 0 || entry.node.type === 'department' || isFeatured(entry);
}

function collectEntries(rootEntry) {
  const entries = [];
  (function visit(entry) {
    if (!entry.node.isVirtual) entries.push(entry);
    for (const child of entry.children) visit(child);
  })(rootEntry);
  return entries;
}

function supportsLayeredSmart(rootEntry) {
  return collectEntries(rootEntry).every((entry) => !entry.node.layoutMode || isAuto(entry.node.layoutMode));
}

function uniquePoints(points) {
  const result = [];
  for (const point of points || []) {
    const next = { x: Number(point.x), y: Number(point.y) };
    if (!Number.isFinite(next.x) || !Number.isFinite(next.y)) continue;
    const previous = result[result.length - 1];
    if (!previous || Math.abs(previous.x - next.x) > 0.01 || Math.abs(previous.y - next.y) > 0.01) result.push(next);
  }
  return result;
}

function internalEdgePoints(edge) {
  const points = uniquePoints(edge?.points);
  return points.length > 2 ? points.slice(1, -1) : [];
}

function edgePorts(parent, child, cfg) {
  const horizontal = isHorizontal(cfg);
  if (!horizontal) {
    const downward = child.cy >= parent.cy;
    return {
      start: { x: parent.cx, y: parent.cy + (downward ? parent.node.height / 2 : -parent.node.height / 2) },
      end: { x: child.cx, y: child.cy + (downward ? -child.node.height / 2 : child.node.height / 2) },
    };
  }
  const rightward = child.cx >= parent.cx;
  return {
    start: { x: parent.cx + (rightward ? parent.node.width / 2 : -parent.node.width / 2), y: parent.cy },
    end: { x: child.cx + (rightward ? -child.node.width / 2 : child.node.width / 2), y: child.cy },
  };
}

function orthogonalPoints(points, horizontalFirst) {
  const out = [points[0]];
  for (let index = 1; index < points.length; index += 1) {
    const previous = out[out.length - 1];
    const next = points[index];
    if (Math.abs(previous.x - next.x) > 0.01 && Math.abs(previous.y - next.y) > 0.01) {
      out.push(horizontalFirst ? { x: next.x, y: previous.y } : { x: previous.x, y: next.y });
    }
    out.push(next);
  }
  return uniquePoints(out);
}

function simplifyOrthogonalPoints(points) {
  const simplified = uniquePoints(points);
  let changed = true;
  while (changed && simplified.length > 2) {
    changed = false;
    for (let index = 1; index < simplified.length - 1; index += 1) {
      const before = simplified[index - 1];
      const point = simplified[index];
      const after = simplified[index + 1];
      const sameColumn = Math.abs(before.x - point.x) < 0.01
        && Math.abs(point.x - after.x) < 0.01;
      const sameRow = Math.abs(before.y - point.y) < 0.01
        && Math.abs(point.y - after.y) < 0.01;
      if (!sameColumn && !sameRow) continue;
      simplified.splice(index, 1);
      changed = true;
      break;
    }
  }
  return uniquePoints(simplified);
}

function pointInsideRect(point, rect) {
  const epsilon = 0.01;
  return point.x > rect.left + epsilon && point.x < rect.right - epsilon
    && point.y > rect.top + epsilon && point.y < rect.bottom - epsilon;
}

function segmentCrossesRect(a, b, rect) {
  const epsilon = 0.01;
  if (Math.abs(a.x - b.x) < epsilon) {
    return a.x > rect.left + epsilon && a.x < rect.right - epsilon
      && Math.max(a.y, b.y) > rect.top + epsilon && Math.min(a.y, b.y) < rect.bottom - epsilon;
  }
  if (Math.abs(a.y - b.y) < epsilon) {
    return a.y > rect.top + epsilon && a.y < rect.bottom - epsilon
      && Math.max(a.x, b.x) > rect.left + epsilon && Math.min(a.x, b.x) < rect.right - epsilon;
  }
  return true;
}

function pathCrossesRects(points, rects) {
  for (let index = 1; index < points.length; index += 1) {
    if (rects.some((rect) => segmentCrossesRect(points[index - 1], points[index], rect))) return true;
  }
  return false;
}

class MinHeap {
  constructor() { this.items = []; }
  push(item) {
    const items = this.items;
    items.push(item);
    let index = items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (items[parent].priority <= item.priority) break;
      items[index] = items[parent];
      index = parent;
    }
    items[index] = item;
  }
  pop() {
    const items = this.items;
    if (!items.length) return null;
    const root = items[0];
    const last = items.pop();
    if (items.length) {
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        if (left >= items.length) break;
        const child = right < items.length && items[right].priority < items[left].priority ? right : left;
        if (items[child].priority >= last.priority) break;
        items[index] = items[child];
        index = child;
      }
      items[index] = last;
    }
    return root;
  }
}

function obstacleRoute(parent, child, positioned, cfg, ports = null) {
  const nodePorts = edgePorts(parent, child, cfg);
  const { start, end } = ports || nodePorts;
  const reservedPaths = ports?.reservedPaths || [];
  const clearance = Math.max(6, Math.min(cfg.spacingX, cfg.spacingY) * 0.16);
  const ingress = Math.max(10, Math.min(cfg.spacingX, cfg.spacingY) * 0.22);
  const horizontal = isHorizontal(cfg);
  const startIsNodePort = Math.abs(start.x - nodePorts.start.x) < 0.01
    && Math.abs(start.y - nodePorts.start.y) < 0.01;
  const endIsNodePort = Math.abs(end.x - nodePorts.end.x) < 0.01
    && Math.abs(end.y - nodePorts.end.y) < 0.01;
  const flowSign = horizontal
    ? (nodePorts.end.x >= nodePorts.start.x ? 1 : -1)
    : (nodePorts.end.y >= nodePorts.start.y ? 1 : -1);
  const searchStart = startIsNodePort
    ? horizontal
      ? { x: start.x + flowSign * ingress, y: start.y }
      : { x: start.x, y: start.y + flowSign * ingress }
    : start;
  const searchEnd = endIsNodePort
    ? horizontal
      ? { x: end.x - flowSign * ingress, y: end.y }
      : { x: end.x, y: end.y - flowSign * ingress }
    : end;
  const rects = positioned.map((item) => {
    const endpoint = item.node.id === parent.node.id || item.node.id === child.node.id;
    const margin = endpoint ? 0 : clearance;
    return {
      left: item.cx - item.node.width / 2 - margin,
      right: item.cx + item.node.width / 2 + margin,
      top: item.cy - item.node.height / 2 - margin,
      bottom: item.cy + item.node.height / 2 + margin,
    };
  });
  const xs = [...new Set([
    start.x, end.x, searchStart.x, searchEnd.x,
    ...rects.flatMap((rect) => [rect.left, rect.right]),
  ])].sort((a, b) => a - b);
  const ys = [...new Set([
    start.y, end.y, searchStart.y, searchEnd.y,
    ...rects.flatMap((rect) => [rect.top, rect.bottom]),
  ])].sort((a, b) => a - b);
  const startX = xs.indexOf(searchStart.x), startY = ys.indexOf(searchStart.y);
  const endX = xs.indexOf(searchEnd.x), endY = ys.indexOf(searchEnd.y);
  const keyOf = (x, y, direction) => `${x}:${y}:${direction}`;
  const heap = new MinHeap();
  const distances = new Map();
  const previous = new Map();
  const startKey = keyOf(startX, startY, 0);
  distances.set(startKey, 0);
  heap.push({ x: startX, y: startY, direction: 0, cost: 0, priority: 0 });
  let finalKey = null;
  const bendPenalty = Math.max(20, Math.min(cfg.spacingX, cfg.spacingY) * 0.6);

  while (heap.items.length) {
    const current = heap.pop();
    const currentKey = keyOf(current.x, current.y, current.direction);
    if (current.cost !== distances.get(currentKey)) continue;
    if (current.x === endX && current.y === endY) { finalKey = currentKey; break; }
    const candidates = [
      { x: current.x - 1, y: current.y, direction: 1 },
      { x: current.x + 1, y: current.y, direction: 1 },
      { x: current.x, y: current.y - 1, direction: 2 },
      { x: current.x, y: current.y + 1, direction: 2 },
    ];
    const from = { x: xs[current.x], y: ys[current.y] };
    for (const candidate of candidates) {
      if (candidate.x < 0 || candidate.x >= xs.length || candidate.y < 0 || candidate.y >= ys.length) continue;
      const to = { x: xs[candidate.x], y: ys[candidate.y] };
      if (rects.some((rect) => pointInsideRect(to, rect) || segmentCrossesRect(from, to, rect))) continue;
      const conflictsWithReserved = reservedPaths.some((path) => {
        for (let index = 1; index < path.length; index += 1) {
          if (segmentsCrossOpen(from, to, path[index - 1], path[index])
            || segmentsOverlapOpen(from, to, path[index - 1], path[index])) return true;
        }
        return false;
      });
      if (conflictsWithReserved) continue;
      const distance = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
      const turn = current.direction && current.direction !== candidate.direction ? bendPenalty : 0;
      const cost = current.cost + distance + turn;
      const nextKey = keyOf(candidate.x, candidate.y, candidate.direction);
      if (cost >= (distances.get(nextKey) ?? Infinity)) continue;
      distances.set(nextKey, cost);
      previous.set(nextKey, currentKey);
      const heuristic = Math.abs(searchEnd.x - to.x) + Math.abs(searchEnd.y - to.y);
      heap.push({ ...candidate, cost, priority: cost + heuristic });
    }
  }
  if (!finalKey) return null;

  const points = [];
  let cursor = finalKey;
  while (cursor) {
    const [x, y] = cursor.split(':').map(Number);
    points.push({ x: xs[x], y: ys[y] });
    cursor = previous.get(cursor);
  }
  points.reverse();
  const compressed = [];
  for (const point of points) {
    const previousPoint = compressed[compressed.length - 1];
    const before = compressed[compressed.length - 2];
    if (before && previousPoint
      && ((Math.abs(before.x - previousPoint.x) < 0.01 && Math.abs(previousPoint.x - point.x) < 0.01)
        || (Math.abs(before.y - previousPoint.y) < 0.01 && Math.abs(previousPoint.y - point.y) < 0.01))) {
      compressed[compressed.length - 1] = point;
    } else compressed.push(point);
  }
  return simplifyOrthogonalPoints([
    ...(startIsNodePort ? [start] : []),
    ...compressed,
    ...(endIsNodePort ? [end] : []),
  ]);
}

function repairAutomaticRoutes(positioned, cfg) {
  const byId = new Map(positioned.map((item) => [String(item.node.id), item]));
  for (const child of positioned) {
    if (!child.parentId) continue;
    const parent = byId.get(String(child.parentId));
    if (!parent) continue;
    const { start, end } = edgePorts(parent, child, cfg);
    const existing = orthogonalPoints([start, ...(child.routePoints || []), end], isHorizontal(cfg));
    const unrelated = positioned
      .filter((item) => item.node.id !== parent.node.id && item.node.id !== child.node.id)
      .map((item) => ({
        left: item.cx - item.node.width / 2,
        right: item.cx + item.node.width / 2,
        top: item.cy - item.node.height / 2,
        bottom: item.cy + item.node.height / 2,
      }));
    if (!pathCrossesRects(existing, unrelated)) continue;
    const routed = obstacleRoute(parent, child, positioned, cfg);
    if (routed?.length > 2) {
      child.routeType = 'packed';
      child.routePoints = routed.slice(1, -1);
    }
  }
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function segmentsCrossOpen(a1, a2, b1, b2) {
  const aHorizontal = Math.abs(a1.y - a2.y) < 0.01;
  const bHorizontal = Math.abs(b1.y - b2.y) < 0.01;
  if (aHorizontal === bHorizontal) return false;
  const horizontal = aHorizontal ? [a1, a2] : [b1, b2];
  const vertical = aHorizontal ? [b1, b2] : [a1, a2];
  return vertical[0].x > Math.min(horizontal[0].x, horizontal[1].x) + 0.01
    && vertical[0].x < Math.max(horizontal[0].x, horizontal[1].x) - 0.01
    && horizontal[0].y > Math.min(vertical[0].y, vertical[1].y) + 0.01
    && horizontal[0].y < Math.max(vertical[0].y, vertical[1].y) - 0.01;
}

function pathsCrossOpen(first, second) {
  for (let firstIndex = 1; firstIndex < first.length; firstIndex += 1) {
    for (let secondIndex = 1; secondIndex < second.length; secondIndex += 1) {
      if (segmentsCrossOpen(
        first[firstIndex - 1],
        first[firstIndex],
        second[secondIndex - 1],
        second[secondIndex],
      )) return true;
    }
  }
  return false;
}

function segmentsOverlapOpen(a1, a2, b1, b2) {
  const aHorizontal = Math.abs(a1.y - a2.y) < 0.01;
  const bHorizontal = Math.abs(b1.y - b2.y) < 0.01;
  if (aHorizontal !== bHorizontal) return false;
  if (aHorizontal) {
    if (Math.abs(a1.y - b1.y) >= 0.01) return false;
    return Math.min(Math.max(a1.x, a2.x), Math.max(b1.x, b2.x))
      - Math.max(Math.min(a1.x, a2.x), Math.min(b1.x, b2.x)) > 0.01;
  }
  if (Math.abs(a1.x - b1.x) >= 0.01) return false;
  return Math.min(Math.max(a1.y, a2.y), Math.max(b1.y, b2.y))
    - Math.max(Math.min(a1.y, a2.y), Math.min(b1.y, b2.y)) > 0.01;
}

function pathsOverlapOpen(first, second) {
  for (let firstIndex = 1; firstIndex < first.length; firstIndex += 1) {
    for (let secondIndex = 1; secondIndex < second.length; secondIndex += 1) {
      if (segmentsOverlapOpen(
        first[firstIndex - 1],
        first[firstIndex],
        second[secondIndex - 1],
        second[secondIndex],
      )) return true;
    }
  }
  return false;
}

function sharedPointPrefix(first, second) {
  const limit = Math.min(first.length, second.length);
  const common = [];
  for (let index = 0; index < limit; index += 1) {
    const point = first[index];
    if (Math.abs(second[index].x - point.x) >= 0.01
      || Math.abs(second[index].y - point.y) >= 0.01) break;
    common.push(point);
  }
  return simplifyOrthogonalPoints(common);
}

/*
 * Preserve the measured packer's family-bus hints instead of reducing every
 * sibling group to one exit point. Each child receives the longest prefix it
 * shares with at least one sibling, so the family keeps one parent trunk and
 * row/column sub-buses while the obstacle router only rebuilds the private
 * tail into that child. A lone child still keeps just its exit gate; treating
 * its whole route as a shared bus recreates the old rectangular U-turn bug.
 */
function familyRoutePrefixes(children) {
  const routes = children.map((child) => ({
    child,
    points: uniquePoints(child.routePoints || []),
  }));
  const prefixes = new Map();
  for (const route of routes) {
    let best = route.points.slice(0, 1);
    for (const other of routes) {
      if (other === route || !route.points.length || !other.points.length) continue;
      const common = sharedPointPrefix(route.points, other.points);
      if (common.length > best.length) best = common;
    }
    prefixes.set(String(route.child.node.id), best);
  }
  return prefixes;
}

function reserveChildIngress(child, parent, cfg) {
  const points = child.routePoints;
  if (!points?.length) return;
  const ports = edgePorts(parent, child, cfg);
  const horizontal = isHorizontal(cfg);
  const clearance = Math.max(10, Math.min(cfg.spacingX, cfg.spacingY) * 0.22);
  const grid = Math.max(1, cfg.gridSize);
  const last = points.at(-1);
  if (!horizontal) {
    const downward = ports.end.y >= ports.start.y;
    const limit = downward ? ports.end.y - clearance : ports.end.y + clearance;
    const safe = downward ? Math.floor(limit / grid) * grid : Math.ceil(limit / grid) * grid;
    if ((downward && last.y <= safe) || (!downward && last.y >= safe)) return;
    const old = last.y;
    for (let index = points.length - 1; index >= 0 && Math.abs(points[index].y - old) < 0.01; index -= 1) {
      points[index] = { ...points[index], y: safe };
    }
    return;
  }
  const rightward = ports.end.x >= ports.start.x;
  const limit = rightward ? ports.end.x - clearance : ports.end.x + clearance;
  const safe = rightward ? Math.floor(limit / grid) * grid : Math.ceil(limit / grid) * grid;
  if ((rightward && last.x <= safe) || (!rightward && last.x >= safe)) return;
  const old = last.x;
  for (let index = points.length - 1; index >= 0 && Math.abs(points[index].x - old) < 0.01; index -= 1) {
    points[index] = { ...points[index], x: safe };
  }
}

/*
 * GridSmart treats the occupancy pack and obstacle visibility graph as one
 * invisible mould shared by cards and connectors. Measured subtree rectangles
 * occupy quantized cells, card centres are snapped to the same lattice, and
 * every automatic edge is rebuilt on the shortest available orthogonal
 * channels. This is deliberately different from collision repair:
 * a technically valid five-bend detour is replaced even when it crosses no
 * card at all.
 */
function routeOccupancyGrid(positioned, cfg) {
  const byId = new Map(positioned.map((item) => [String(item.node.id), item]));
  const childrenByParent = new Map();
  const pathsByChild = new Map();
  for (const child of positioned) {
    if (!child.parentId || !byId.has(String(child.parentId))) continue;
    const key = String(child.parentId);
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(child);
    const parent = byId.get(key);
    reserveChildIngress(child, parent, cfg);
    const ports = edgePorts(parent, child, cfg);
    pathsByChild.set(String(child.node.id), simplifyOrthogonalPoints(orthogonalPoints([
      ports.start,
      ...(child.routePoints || []),
      ports.end,
    ], isHorizontal(cfg))));
  }

  for (const [parentId, children] of childrenByParent) {
    const parent = byId.get(parentId);
    const routedChildren = children.filter((child) => !isFeatured({ node: child.node }));
    const familyPrefixes = familyRoutePrefixes(routedChildren);
    for (const child of children) {
      if (isFeatured({ node: child.node })) continue;
      const ports = edgePorts(parent, child, cfg);
      // Preserve the longest connector channel this child shares with another
      // sibling. The family therefore leaves the parent once, reuses common
      // buses, and branches only where the measured occupancy mould intended.
      const prefix = familyPrefixes.get(String(child.node.id))
        || uniquePoints(child.routePoints || []).slice(0, 1);
      const routeStart = prefix.at(-1) || ports.start;
      const routed = obstacleRoute(parent, child, positioned, cfg, {
        start: routeStart,
        end: ports.end,
      });
      if (!routed || routed.length < 2) continue;
      const complete = simplifyOrthogonalPoints(orthogonalPoints(
        uniquePoints([ports.start, ...prefix, ...routed.slice(1)]),
        isHorizontal(cfg),
      ));
      const crossesReservedChannel = positioned.some((other) => {
        if (!other.parentId || String(other.parentId) === parentId || other.node.id === child.node.id) return false;
        const otherPath = pathsByChild.get(String(other.node.id));
        return otherPath
          ? pathsCrossOpen(complete, otherPath) || pathsOverlapOpen(complete, otherPath)
          : false;
      });
      if (crossesReservedChannel) continue;

      child.routeType = 'packed';
      child.routePoints = complete.length > 2
        ? complete.slice(1, -1)
        : [midpoint(complete[0], complete[1])];
      pathsByChild.set(String(child.node.id), complete);
    }
  }

  // Apply simplified fallbacks too. A route can be collision-free yet contain
  // a same-axis overshoot such as A -> B -> C where B passes C and reverses.
  // Removing that middle point preserves the occupied channel while avoiding
  // the visually false extra branch.
  for (const child of positioned) {
    const path = pathsByChild.get(String(child.node.id));
    if (!path || path.length < 2 || isFeatured({ node: child.node })) continue;
    child.routeType = 'packed';
    child.routePoints = path.length > 2
      ? path.slice(1, -1)
      : [midpoint(path[0], path[1])];
  }

  // Snapping a card and its old row bus to different lattice lines can move
  // that bus just inside a neighbouring card. Repair card safety first, then
  // reserve the resulting channels against unrelated families.
  repairAutomaticRoutes(positioned, cfg);
  repairReservedChannelConflicts(positioned, cfg);
  // Shorten legacy per-edge routes before constructing the family network.
  // Running this cleanup afterward can flatten a valid multi-row family bus
  // into one ceiling rail with long drops, making later-row siblings look as
  // though they descend from the row above. The family router must own the
  // final shared geometry.
  compactAutomaticRouteTails(positioned, cfg);
  return routeFamilyConnectorNetworks(positioned, cfg);
}

function positionedEdgePath(parent, child, cfg) {
  const ports = edgePorts(parent, child, cfg);
  return simplifyOrthogonalPoints(orthogonalPoints([
    ports.start,
    ...(child.routePoints || []),
    ports.end,
  ], isHorizontal(cfg)));
}

function repairReservedChannelConflicts(positioned, cfg) {
  const byId = new Map(positioned.map((item) => [String(item.node.id), item]));
  const edges = positioned.map((child) => {
    const parent = child.parentId == null ? null : byId.get(String(child.parentId));
    return parent ? { child, parent, parentId: String(child.parentId) } : null;
  }).filter(Boolean);
  const childCount = new Map();
  for (const edge of edges) childCount.set(edge.parentId, (childCount.get(edge.parentId) || 0) + 1);
  const depthOf = (item) => {
    let depth = 0;
    let cursor = item;
    const seen = new Set();
    while (cursor?.parentId != null && !seen.has(String(cursor.node.id))) {
      seen.add(String(cursor.node.id));
      cursor = byId.get(String(cursor.parentId));
      depth += 1;
    }
    return depth;
  };
  const pathOf = (edge) => positionedEdgePath(edge.parent, edge.child, cfg);
  const conflicts = (first, second) => first.parentId !== second.parentId
    && (pathsCrossOpen(pathOf(first), pathOf(second)) || pathsOverlapOpen(pathOf(first), pathOf(second)));

  const maxAttempts = Math.max(1, edges.length * 2);
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let pair = null;
    for (let firstIndex = 0; firstIndex < edges.length && !pair; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < edges.length; secondIndex += 1) {
        if (conflicts(edges[firstIndex], edges[secondIndex])) {
          pair = [edges[firstIndex], edges[secondIndex]];
          break;
        }
      }
    }
    if (!pair) return;

    const candidates = pair.slice().sort((first, second) => {
      const firstStructural = childCount.has(String(first.child.node.id)) || first.child.node.type === 'department';
      const secondStructural = childCount.has(String(second.child.node.id)) || second.child.node.type === 'department';
      return Number(firstStructural) - Number(secondStructural)
        || depthOf(second.child) - depthOf(first.child);
    });
    let repaired = false;
    for (const edge of candidates) {
      const reservedPaths = edges
        .filter((other) => other !== edge && other.parentId !== edge.parentId)
        .map(pathOf);
      const ports = edgePorts(edge.parent, edge.child, cfg);
      const routed = obstacleRoute(edge.parent, edge.child, positioned, cfg, {
        ...ports,
        reservedPaths,
      });
      if (!routed || routed.length < 2) continue;
      const complete = simplifyOrthogonalPoints(routed);
      if (reservedPaths.some((path) => pathsCrossOpen(complete, path) || pathsOverlapOpen(complete, path))) continue;
      edge.child.routeType = 'packed';
      edge.child.routePoints = complete.length > 2
        ? complete.slice(1, -1)
        : [midpoint(complete[0], complete[1])];
      repaired = true;
      break;
    }
    if (!repaired) return;
  }
}

function orthogonalPathLength(points) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.abs(points[index].x - points[index - 1].x)
      + Math.abs(points[index].y - points[index - 1].y);
  }
  return length;
}

function orthogonalPathBends(points) {
  let bends = 0;
  for (let index = 2; index < points.length; index += 1) {
    const firstHorizontal = Math.abs(points[index - 2].y - points[index - 1].y) < 0.01;
    const secondHorizontal = Math.abs(points[index - 1].y - points[index].y) < 0.01;
    if (firstHorizontal !== secondHorizontal) bends += 1;
  }
  return bends;
}

function compactAutomaticRouteTails(positioned, cfg) {
  const byId = new Map(positioned.map((item) => [String(item.node.id), item]));
  const edges = positioned.map((child) => {
    const parent = child.parentId == null ? null : byId.get(String(child.parentId));
    return parent ? { child, parent, parentId: String(child.parentId) } : null;
  }).filter(Boolean);
  const siblingsByParent = new Map();
  for (const edge of edges) {
    if (!siblingsByParent.has(edge.parentId)) siblingsByParent.set(edge.parentId, []);
    siblingsByParent.get(edge.parentId).push(edge);
  }
  const pathByChild = new Map(edges.map((edge) => [
    String(edge.child.node.id),
    positionedEdgePath(edge.parent, edge.child, cfg),
  ]));
  const horizontal = isHorizontal(cfg);

  for (const edge of edges) {
    if (isFeatured({ node: edge.child.node })) continue;
    const childId = String(edge.child.node.id);
    const current = pathByChild.get(childId);
    if (!current || current.length < 3) continue;

    // A family bus is public until the final point shared with another child.
    // Only the private suffix may be shortened. A lone child owns the whole
    // route and can therefore take a direct card-safe approach from its parent.
    let protectedIndex = 0;
    for (const sibling of siblingsByParent.get(edge.parentId) || []) {
      if (sibling === edge) continue;
      const common = sharedPointPrefix(current, pathByChild.get(String(sibling.child.node.id)) || []);
      protectedIndex = Math.max(protectedIndex, common.length - 1);
    }

    const unrelatedRects = positioned
      .filter((item) => item.node.id !== edge.parent.node.id && item.node.id !== edge.child.node.id)
      .map((item) => ({
        left: item.cx - item.node.width / 2,
        right: item.cx + item.node.width / 2,
        top: item.cy - item.node.height / 2,
        bottom: item.cy + item.node.height / 2,
      }));
    const end = current.at(-1);
    const currentLength = orthogonalPathLength(current);
    const currentBends = orthogonalPathBends(current);
    let best = current;
    const candidateCrossesUnrelatedFamily = (candidate) => edges.some((other) => {
      if (other === edge || other.parentId === edge.parentId) return false;
      const otherPath = pathByChild.get(String(other.child.node.id));
      return otherPath
        && (pathsCrossOpen(candidate, otherPath) || pathsOverlapOpen(candidate, otherPath));
    });

    // A child already aligned with its parent should not be sent out to a
    // family rail and immediately brought back. The direct corridor is the
    // clearest possible edge and does not prevent its off-axis siblings from
    // continuing to share their bus.
    const direct = [current[0], end];
    const directlyAligned = horizontal
      ? Math.abs(direct[0].y - direct[1].y) < 0.01
      : Math.abs(direct[0].x - direct[1].x) < 0.01;
    if (directlyAligned
      && !pathCrossesRects(direct, unrelatedRects)
      && !candidateCrossesUnrelatedFamily(direct)) best = direct;

    for (let anchorIndex = protectedIndex; anchorIndex < current.length - 1; anchorIndex += 1) {
      const anchor = current[anchorIndex];
      const tail = horizontal
        ? (Math.abs(anchor.y - end.y) < 0.01
          ? [anchor, end]
          : [anchor, { x: anchor.x, y: end.y }, end])
        : (Math.abs(anchor.x - end.x) < 0.01
          ? [anchor, end]
          : [anchor, { x: end.x, y: anchor.y }, end]);
      const candidate = simplifyOrthogonalPoints([...current.slice(0, anchorIndex), ...tail]);
      const candidateLength = orthogonalPathLength(candidate);
      const candidateBends = orthogonalPathBends(candidate);
      const firstSegmentHorizontal = Math.abs(candidate[0].y - candidate[1].y) < 0.01;
      const lastSegmentHorizontal = Math.abs(candidate.at(-2).y - candidate.at(-1).y) < 0.01;
      if (firstSegmentHorizontal !== horizontal || lastSegmentHorizontal !== horizontal) continue;
      if (candidateBends > currentBends
        || (candidateBends === currentBends && candidateLength >= currentLength - 0.01)) continue;
      if (pathCrossesRects(candidate, unrelatedRects)) continue;
      if (candidateCrossesUnrelatedFamily(candidate)) continue;
      const bestLength = orthogonalPathLength(best);
      const bestBends = orthogonalPathBends(best);
      if (candidateBends < bestBends
        || (candidateBends === bestBends && candidateLength < bestLength - 0.01)) best = candidate;
    }

    if (best === current) continue;
    edge.child.routeType = 'packed';
    edge.child.routePoints = best.length > 2
      ? best.slice(1, -1)
      : [midpoint(best[0], best[1])];
    pathByChild.set(childId, best);
  }
}

function pointAxes(point, horizontal) {
  return horizontal
    ? { cross: point.y, flow: point.x }
    : { cross: point.x, flow: point.y };
}

function axesPoint(cross, flow, horizontal) {
  return horizontal ? { x: flow, y: cross } : { x: cross, y: flow };
}

function orthogonalNetworkLength(paths) {
  const lanes = new Map();
  for (const points of paths) {
    for (let index = 1; index < points.length; index += 1) {
      const before = points[index - 1], after = points[index];
      const horizontal = Math.abs(before.y - after.y) < 0.01;
      const fixed = horizontal ? before.y : before.x;
      const start = Math.min(horizontal ? before.x : before.y, horizontal ? after.x : after.y);
      const end = Math.max(horizontal ? before.x : before.y, horizontal ? after.x : after.y);
      if (end - start < 0.01) continue;
      const key = `${horizontal ? 'h' : 'v'}:${fixed.toFixed(3)}`;
      if (!lanes.has(key)) lanes.set(key, []);
      lanes.get(key).push([start, end]);
    }
  }
  let length = 0;
  for (const intervals of lanes.values()) {
    intervals.sort((first, second) => first[0] - second[0]);
    let [start, end] = intervals[0];
    for (const [nextStart, nextEnd] of intervals.slice(1)) {
      if (nextStart <= end + 0.01) end = Math.max(end, nextEnd);
      else { length += end - start; start = nextStart; end = nextEnd; }
    }
    length += end - start;
  }
  return length;
}

function familyNetworkScore(paths, cfg) {
  const bends = paths.reduce((sum, path) => sum + orthogonalPathBends(path), 0);
  const privateApproachLimit = Math.max(10, Math.min(cfg.spacingX, cfg.spacingY) * 0.22);
  // A long final drop from a shared rail is visually ambiguous in a wrapped
  // sibling family: cards on a later row can appear to be children of cards
  // above them. Prefer a trunk through an available grid gap with a short bus
  // beside each row. Straight parent-child routes are intentionally exempt.
  const longPrivateApproaches = paths.reduce((sum, path) => {
    if (path.length <= 2) return sum;
    const before = path.at(-2), end = path.at(-1);
    const length = Math.abs(before.x - end.x) + Math.abs(before.y - end.y);
    return sum + Math.max(0, length - privateApproachLimit);
  }, 0);
  return orthogonalNetworkLength(paths)
    + bends * Math.max(12, Math.min(cfg.spacingX, cfg.spacingY) * 0.45)
    + longPrivateApproaches;
}

/*
 * A parent-owned family network may deliberately share trunks and row buses,
 * but two segments with disjoint child membership must never pass through one
 * another. Such an intersection renders as a false `+` junction: users cannot
 * tell whether the lines connect, even though both relationships have the same
 * parent. Real trunk/bus junctions share at least one child id and remain valid.
 */
function familyNetworkFalseJunction(network) {
  const segments = network?.segments || [];
  for (let firstIndex = 0; firstIndex < segments.length; firstIndex += 1) {
    const first = segments[firstIndex];
    const firstMembers = new Set((first.childIds || []).map(String));
    for (let secondIndex = firstIndex + 1; secondIndex < segments.length; secondIndex += 1) {
      const second = segments[secondIndex];
      if ((second.childIds || []).some((id) => firstMembers.has(String(id)))) continue;
      if (segmentsCrossOpen(first.a, first.b, second.a, second.b)) {
        const firstHorizontal = Math.abs(first.a.y - first.b.y) < 0.01;
        const horizontal = firstHorizontal ? first : second;
        const vertical = firstHorizontal ? second : first;
        return {
          first,
          second,
          point: { x: vertical.a.x, y: horizontal.a.y },
        };
      }
    }
  }
  return null;
}

function familyNetworkFromPaths(parentId, children, paths, horizontal) {
  return buildFamilyConnectorNetwork(parentId, children.map((child, index) => ({
    id: String(child.node.id),
    points: paths[index],
  })), { horizontalFlow: horizontal });
}

function pointOnOrthogonalSegment(point, before, after) {
  const horizontal = Math.abs(before.y - after.y) < 0.01;
  if (horizontal) {
    return Math.abs(point.y - before.y) < 0.01
      && point.x >= Math.min(before.x, after.x) - 0.01
      && point.x <= Math.max(before.x, after.x) + 0.01;
  }
  return Math.abs(point.x - before.x) < 0.01
    && point.y >= Math.min(before.y, after.y) - 0.01
    && point.y <= Math.max(before.y, after.y) + 0.01;
}

function splitPathAtPoint(path, point) {
  for (let index = 1; index < path.length; index += 1) {
    if (!pointOnOrthogonalSegment(point, path[index - 1], path[index])) continue;
    return {
      prefix: uniquePoints([...path.slice(0, index), point]),
      suffix: uniquePoints([point, ...path.slice(index)]),
    };
  }
  return null;
}

function samePoint(first, second) {
  return first && second
    && Math.abs(first.x - second.x) < 0.01
    && Math.abs(first.y - second.y) < 0.01;
}

/*
 * Convert an accidental `+` inside one family into a real shared junction.
 * The receiving child paths discard their separate parent-side approach,
 * reuse the existing bus up to the intersection, then retain only their own
 * child-side tail. This never invents a new occupied segment: it joins pieces
 * of already card-safe routes and removes the line that passed through a bus.
 */
export function connectFamilyPathsAtSharedBuses(parentId, children, sourcePaths, horizontal) {
  const paths = sourcePaths.map((path) => path.map((point) => ({ ...point })));
  const indexByChild = new Map(children.map((child, index) => [String(child.node.id), index]));
  const maxRepairs = Math.max(4, children.length * 3);
  let network = familyNetworkFromPaths(parentId, children, paths, horizontal);
  let repaired = false;

  for (let attempt = 0; attempt < maxRepairs; attempt += 1) {
    const issue = familyNetworkFalseJunction(network);
    if (!issue || !issue.point) break;
    let donor = issue.first;
    let recipient = issue.second;
    if (recipient.role === 'bus' && donor.role !== 'bus') [donor, recipient] = [recipient, donor];
    else if (recipient.role === donor.role
      && (recipient.childIds?.length || 0) > (donor.childIds?.length || 0)) {
      [donor, recipient] = [recipient, donor];
    }

    const donorId = (donor.childIds || []).map(String).find((id) => {
      const index = indexByChild.get(id);
      return index != null && splitPathAtPoint(paths[index], issue.point);
    });
    if (!donorId) break;
    const donorSplit = splitPathAtPoint(paths[indexByChild.get(donorId)], issue.point);
    let changed = false;
    for (const childId of (recipient.childIds || []).map(String)) {
      const index = indexByChild.get(childId);
      if (index == null) continue;
      const recipientSplit = splitPathAtPoint(paths[index], issue.point);
      if (!recipientSplit || !samePoint(donorSplit.prefix[0], recipientSplit.prefix[0])) continue;
      const joined = simplifyOrthogonalPoints(uniquePoints([
        ...donorSplit.prefix,
        ...recipientSplit.suffix.slice(1),
      ]));
      if (joined.length < 2) continue;
      paths[index] = joined;
      changed = true;
    }
    if (!changed) break;
    repaired = true;
    network = familyNetworkFromPaths(parentId, children, paths, horizontal);
  }

  return { paths, network, repaired };
}

function candidateFamilyChannels(parent, children, positioned, cfg) {
  const horizontal = isHorizontal(cfg);
  const start = pointAxes(edgePorts(parent, children[0], cfg).start, horizontal);
  const clearance = Math.max(cfg.gridSize, Math.min(cfg.spacingX, cfg.spacingY) * 0.35);
  const ranges = children.map((child) => {
    const center = pointAxes({ x: child.cx, y: child.cy }, horizontal);
    const half = horizontal ? child.node.height / 2 : child.node.width / 2;
    return { min: center.cross - half, max: center.cross + half };
  });
  const channels = [
    Math.min(...ranges.map((range) => range.min)) - clearance,
    Math.max(...ranges.map((range) => range.max)) + clearance,
  ];
  const childFlowCenters = children.map((child) => pointAxes({ x: child.cx, y: child.cy }, horizontal).flow);
  const minFlow = Math.min(start.flow, ...childFlowCenters);
  const maxFlow = Math.max(start.flow, ...childFlowCenters);
  for (const item of positioned) {
    if (item.node.id === parent.node.id || children.includes(item)) continue;
    const center = pointAxes({ x: item.cx, y: item.cy }, horizontal);
    const flowHalf = horizontal ? item.node.width / 2 : item.node.height / 2;
    if (center.flow + flowHalf < minFlow || center.flow - flowHalf > maxFlow) continue;
    const crossHalf = horizontal ? item.node.height / 2 : item.node.width / 2;
    channels.push(center.cross - crossHalf - clearance, center.cross + crossHalf + clearance);
  }
  const boundaries = [...new Set(ranges.flatMap((range) => [range.min, range.max]))].sort((a, b) => a - b);
  for (let index = 1; index < boundaries.length; index += 1) {
    if (boundaries[index] - boundaries[index - 1] >= clearance * 1.4) {
      channels.push((boundaries[index] + boundaries[index - 1]) / 2);
    }
  }
  for (const child of children) {
    const path = positionedEdgePath(parent, child, cfg);
    for (let index = 1; index < path.length; index += 1) {
      const before = pointAxes(path[index - 1], horizontal);
      const after = pointAxes(path[index], horizontal);
      if (Math.abs(before.cross - after.cross) < 0.01
        && Math.abs(before.flow - after.flow) > clearance) channels.push(before.cross);
    }
  }
  const override = cfg.familyRouteOverrides?.[String(parent.node.id)];
  if (Number.isFinite(Number(override?.trunkOffset))) {
    channels.unshift(start.cross + Number(override.trunkOffset));
  }
  const grid = Math.max(1, cfg.gridSize);
  return [...new Set(channels.map((value) => Math.round(value / grid) * grid))];
}

function routeFamilyConnectorNetworks(positioned, cfg) {
  const horizontal = isHorizontal(cfg);
  const byId = new Map(positioned.map((item) => [String(item.node.id), item]));
  const families = new Map();
  const pathByChild = new Map();
  const networks = [];
  for (const child of positioned) {
    if (child.parentId == null) continue;
    const parent = byId.get(String(child.parentId));
    if (!parent) continue;
    pathByChild.set(String(child.node.id), positionedEdgePath(parent, child, cfg));
    if (isFeatured({ node: child.node })) continue;
    const parentId = String(child.parentId);
    if (!families.has(parentId)) families.set(parentId, { parent, children: [] });
    families.get(parentId).children.push(child);
  }

  const orderedFamilies = [...families.entries()].sort((first, second) => first[0].localeCompare(second[0]));
  for (const [parentId, family] of orderedFamilies) {
    if (family.children.length < 2) continue;
    const { parent, children } = family;
    const currentPaths = children.map((child) => pathByChild.get(String(child.node.id)));
    let best = {
      paths: currentPaths,
      score: familyNetworkScore(currentPaths, cfg),
      generated: false,
    };
    const samplePorts = edgePorts(parent, children[0], cfg);
    const startAxis = pointAxes(samplePorts.start, horizontal);
    const childFlows = children.map((child) => pointAxes(edgePorts(parent, child, cfg).end, horizontal).flow);
    const flowSign = childFlows.reduce((sum, value) => sum + Math.sign(value - startAxis.flow), 0) >= 0 ? 1 : -1;
    const ingress = Math.max(10, Math.min(cfg.spacingX, cfg.spacingY) * 0.22);
    const gateFlow = startAxis.flow + flowSign * ingress;
    const override = cfg.familyRouteOverrides?.[parentId];

    for (const trunkCross of candidateFamilyChannels(parent, children, positioned, cfg)) {
      const candidates = [];
      let valid = true;
      for (const child of children) {
        const ports = edgePorts(parent, child, cfg);
        const start = pointAxes(ports.start, horizontal);
        const end = pointAxes(ports.end, horizontal);
        const direct = [ports.start, ports.end];
        const unrelatedRects = positioned
          .filter((item) => item.node.id !== parent.node.id && item.node.id !== child.node.id)
          .map((item) => ({
            left: item.cx - item.node.width / 2,
            right: item.cx + item.node.width / 2,
            top: item.cy - item.node.height / 2,
            bottom: item.cy + item.node.height / 2,
          }));
        if (Math.abs(start.cross - end.cross) < 0.01 && !pathCrossesRects(direct, unrelatedRects)) {
          candidates.push(direct);
          continue;
        }
        const branchFlow = end.flow - flowSign * ingress;
        const path = simplifyOrthogonalPoints([
          ports.start,
          axesPoint(start.cross, gateFlow, horizontal),
          axesPoint(trunkCross, gateFlow, horizontal),
          axesPoint(trunkCross, branchFlow, horizontal),
          axesPoint(end.cross, branchFlow, horizontal),
          ports.end,
        ]);
        if (pathCrossesRects(path, unrelatedRects)) { valid = false; break; }
        candidates.push(path);
      }
      if (!valid) continue;
      const collidesWithOtherFamily = candidates.some((candidate) => [...pathByChild].some(([childId, otherPath]) => {
        const other = byId.get(childId);
        return other && String(other.parentId) !== parentId
          && (pathsCrossOpen(candidate, otherPath) || pathsOverlapOpen(candidate, otherPath));
      }));
      if (collidesWithOtherFamily) continue;
      // A mathematically short median rail can still create a conspicuous
      // ceiling-shaped detour immediately below the parent. Prefer a channel
      // near the parent exit unless the more distant lane materially reduces
      // the rest of the family network.
      const departurePenalty = Math.abs(trunkCross - startAxis.cross) * 1.75;
      const score = familyNetworkScore(candidates, cfg) + departurePenalty;
      const requestedCross = Number.isFinite(Number(override?.trunkOffset))
        ? Math.round((startAxis.cross + Number(override.trunkOffset)) / Math.max(1, cfg.gridSize)) * Math.max(1, cfg.gridSize)
        : null;
      const isRequestedChannel = requestedCross != null && Math.abs(trunkCross - requestedCross) < 0.01;
      if ((isRequestedChannel && !best.requested)
        || (isRequestedChannel === !!best.requested && score < best.score - 0.01)) {
        best = {
          paths: candidates,
          score,
          generated: true,
          requested: isRequestedChannel,
        };
      }
    }

    const connectedBest = connectFamilyPathsAtSharedBuses(
      parentId,
      children,
      best.paths,
      horizontal,
    );
    best.paths = connectedBest.paths;
    best.network = connectedBest.network;
    best.repaired = connectedBest.repaired;

    if (best.generated || best.repaired) {
      children.forEach((child, index) => {
        const path = best.paths[index];
        child.routeType = 'packed';
        child.routePoints = path.length > 2 ? path.slice(1, -1) : [midpoint(path[0], path[1])];
        pathByChild.set(String(child.node.id), path);
      });
    }

    const network = best.network || familyNetworkFromPaths(
      parentId,
      children,
      children.map((child) => pathByChild.get(String(child.node.id))),
      horizontal,
    );
    if (network) networks.push(network);
  }
  return networks;
}

function buildFamilyNetworks(positioned, cfg) {
  const byId = new Map(positioned.map((item) => [String(item.node.id), item]));
  const families = new Map();
  for (const child of positioned) {
    if (child.parentId == null) continue;
    const parent = byId.get(String(child.parentId));
    if (!parent) continue;
    const parentId = String(child.parentId);
    if (!families.has(parentId)) families.set(parentId, []);
    families.get(parentId).push({
      childId: String(child.node.id),
      points: positionedEdgePath(parent, child, cfg),
    });
  }
  const result = [];
  for (const [parentId, paths] of families) {
    const network = buildFamilyConnectorNetwork(parentId, paths.map((path) => ({
      id: path.childId,
      points: path.points,
    })), { horizontalFlow: isHorizontal(cfg) });
    if (network) result.push(network);
  }
  return result;
}

function layoutGraphToTarget(graph, targetAspect, baseRankSep) {
  const multipliers = [0.25, 0.4, 0.6, 0.8, 1, 1.35, 1.75, 2.25, 3, 4, 5.5];
  const baseOptions = graph.graph();
  let best = null;

  for (const multiplier of multipliers) {
    const ranksep = Math.max(8, baseRankSep * multiplier);
    graph.setGraph({ ...baseOptions, ranksep });
    dagre.layout(graph);
    const dimensions = graph.graph();
    const aspect = Number(dimensions.width) / Math.max(1, Number(dimensions.height));
    const shapeError = Math.abs(Math.log(Math.max(0.01, aspect) / targetAspect));
    if (!best || shapeError < best.shapeError - 1e-9
      || (Math.abs(shapeError - best.shapeError) < 1e-9 && ranksep < best.ranksep)) {
      best = { ranksep, shapeError };
    }
  }

  graph.setGraph({ ...baseOptions, ranksep: best.ranksep });
  dagre.layout(graph);
  return best.ranksep;
}

/*
 * Mermaid's default flowchart layout is layered rather than recursively boxed.
 * AutoSmart uses the same class of rank/order solver for structural nodes, but
 * represents direct personnel as compact synthetic blocks. This keeps section
 * headings on unambiguous ranks while avoiding a single enormous personnel row.
 * The synthetic blocks never escape this function; callers still receive only
 * their real nodes and the original data model remains unchanged.
 */
function layoutLayeredSmart(rootEntry, cfg) {
  const entries = collectEntries(rootEntry);
  const structural = entries.filter(entryIsStructural);
  const structuralById = new Map(structural.map((entry) => [String(entry.node.id), entry]));
  const structuralIds = new Set(structural.map((entry) => String(entry.node.id)));
  const nodeSep = Math.max(8, cfg.spacingX * 0.25);
  const baseRankSep = Math.max(24, cfg.spacingY * 0.8);
  const edgeSep = Math.max(6, cfg.spacingX * 0.18);
  const graph = new dagre.graphlib.Graph({ multigraph: false, compound: false })
    .setGraph({
      rankdir: 'TB',
      ranker: 'network-simplex',
      nodesep: nodeSep,
      ranksep: baseRankSep,
      edgesep: edgeSep,
      marginx: 0,
      marginy: 0,
    })
    .setDefaultEdgeLabel(() => ({}));

  const leafGapX = Math.max(12, cfg.spacingX * 0.5);
  const leafGapY = Math.max(12, cfg.spacingY * 0.42);
  // Direct-personnel groups must be allowed to become genuinely portrait on a
  // narrow host. The previous 0.9 floor forced large offices to remain nearly
  // square/landscape even when the requested mobile aspect was below 0.5.
  const leafTarget = clamp(cfg.targetAspect * Math.sqrt(8 / Math.max(1, structural.length)), 0.3, 2.6);
  const groups = [];

  for (const entry of structural) {
    graph.setNode(String(entry.node.id), {
      width: lw(entry.node, cfg),
      height: lh(entry.node, cfg),
      kind: 'real',
    });
  }

  for (const entry of structural) {
    const parentId = String(entry.node.id);
    const structuralChildren = entry.children.filter(entryIsStructural);
    const leafChildren = entry.children.filter((child) => !entryIsStructural(child));
    const hasFeaturedChild = structuralChildren.some(isFeatured);

    for (const child of structuralChildren) {
      graph.setEdge(parentId, String(child.node.id), {
        minlen: isFeatured(child) ? 1 : hasFeaturedChild ? 2 : 1,
        weight: isFeatured(child) ? 100 : 1,
      });
    }

    if (!leafChildren.length) continue;
    const items = leafChildren.map((child) => {
      const m = measureSubtree(child, cfg, leafTarget);
      return { entry: child, m, w: m.w, h: m.h };
    });
    const pack = packRows(items, leafTarget, leafGapX, leafGapY);
    const id = `\u0000leaf-group:${parentId}`;
    const railMargin = Math.max(6, nodeSep * 0.6);
    // Exterior fallbacks are part of the synthetic block's measured width, so
    // Dagre reserves a real corridor instead of letting a neighboring block's
    // card occupy the connector lane.
    graph.setNode(id, { width: pack.w + railMargin * 2, height: pack.h, kind: 'leaf-group' });
    graph.setEdge(parentId, id, { minlen: hasFeaturedChild ? 2 : 1 });
    groups.push({ id, parent: entry, items, pack, railMargin });
  }

  // Forest roots are intentionally left as separate components; Dagre packs
  // them deterministically without introducing a fake visible parent.
  // Rank spacing is a layout variable, not a universal constant. Evaluate a
  // bounded deterministic set and choose the spacing whose graph shape best
  // matches the real screen/print content box. This lets shallow and deep
  // offices use the same engine without leaving a large unused strip.
  const rankSep = layoutGraphToTarget(graph, cfg.targetAspect, baseRankSep);

  const centeredHeadByParent = new Map();
  for (const entry of structural) {
    if (!isFeatured(entry) || entry.children.length > 0 || !entry.node.parentId) continue;
    const parentId = String(entry.node.parentId);
    if (structuralIds.has(parentId) && !centeredHeadByParent.has(parentId)) centeredHeadByParent.set(parentId, entry);
  }

  function routedEdgePoints(parentId, targetId, targetX) {
    const base = internalEdgePoints(graph.edge(parentId, targetId));
    const head = centeredHeadByParent.get(parentId);
    if (!head || targetId === String(head.node.id)) return base;
    const parentPoint = graph.node(parentId);
    const headPoint = graph.node(String(head.node.id));
    const parentEntry = structuralById.get(parentId);
    if (!parentPoint || !headPoint || !parentEntry) return base;

    const parentBottom = parentPoint.y + lh(parentEntry.node, cfg) / 2;
    const headTop = headPoint.y - lh(head.node, cfg) / 2;
    const headBottom = headPoint.y + lh(head.node, cfg) / 2;
    const aboveY = (parentBottom + headTop) / 2;
    const belowY = headBottom + Math.max(8, rankSep * 0.2);
    const side = targetX < parentPoint.x ? -1 : 1;
    const laneX = parentPoint.x + side * (lw(head.node, cfg) / 2 + Math.max(10, edgeSep * 1.5));
    const remainder = base.filter((point) => point.y > belowY + 0.01);
    return uniquePoints([
      { x: parentPoint.x, y: aboveY },
      { x: laneX, y: aboveY },
      { x: laneX, y: belowY },
      { x: targetX, y: belowY },
      ...remainder,
    ]);
  }

  const positionedById = new Map();
  for (const entry of structural) {
    const id = String(entry.node.id);
    const point = graph.node(id);
    if (!point) continue;
    const parentId = entry.node.parentId ? String(entry.node.parentId) : '';
    const parentPoint = parentId ? graph.node(parentId) : null;
    // A leaf office head owns the otherwise empty rank immediately below the
    // office container. Center it exactly under that container; Dagre is still
    // free to order and route the wider structural rank below it.
    const alignFeatured = isFeatured(entry) && entry.children.length === 0 && parentPoint;
    positionedById.set(id, {
      node: entry.node,
      lx: alignFeatured ? parentPoint.x : point.x,
      ly: point.y,
      w: lw(entry.node, cfg),
      h: lh(entry.node, cfg),
      parentId: entry.node.parentId,
      routeType: 'bus',
      routePoints: alignFeatured || !parentId || !structuralIds.has(parentId)
        ? [] : routedEdgePoints(parentId, id, point.x),
      resolvedLayoutMode: 'AutoSmart',
    });
  }

  for (const group of groups) {
    const box = graph.node(group.id);
    const parentId = String(group.parent.node.id);
    const edgePoints = routedEdgePoints(parentId, group.id, box.x);
    const left = box.x - group.pack.w / 2;
    const top = box.y - group.pack.h / 2;
    const safeRail = safeInteriorRail(group.pack, Math.max(8, leafGapX * 0.28));
    const leftRail = left - group.railMargin * 0.5;
    const rightRail = left + group.pack.w + group.railMargin * 0.5;
    const centerX = box.x;
    const topLaneY = top - Math.max(9, leafGapY * 0.34);

    for (const placement of group.pack.placements) {
      const item = placement.item;
      const childCenterX = left + placement.x + item.m.nodeCenterX;
      const childCenterY = top + placement.y + item.m.nodeCenterY;
      const rowBusY = top + placement.y - Math.max(9, leafGapY * 0.34);
      const railX = safeRail == null
        ? (childCenterX <= centerX ? leftRail : rightRail)
        : left + safeRail;
      const routePoints = uniquePoints([
        ...edgePoints,
        { x: centerX, y: topLaneY },
        { x: railX, y: topLaneY },
        { x: railX, y: rowBusY },
        { x: childCenterX, y: rowBusY },
      ]);
      positionedById.set(String(item.entry.node.id), {
        node: item.entry.node,
        lx: childCenterX,
        ly: childCenterY,
        w: lw(item.entry.node, cfg),
        h: lh(item.entry.node, cfg),
        parentId: item.entry.node.parentId,
        routeType: 'packed',
        routePoints,
        resolvedLayoutMode: 'AutoSmart',
      });
    }
  }

  return entries.map((entry) => positionedById.get(String(entry.node.id))).filter(Boolean);
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
      const route = routeOf[node.id] || { routeType: 'bus', points: null };
      out.push({ node, lx: cx, ly: cy, w: lw(node, cfg), h: lh(node, cfg),
                 parentId: node.parentId, routeType: route.routeType,
                 routePoints: route.points || null,
                 resolvedLayoutMode: meas.resolvedMode || effectiveMode(node, cfg) });
    }
    for (const r of meas.edgeRoutes) {
      routeOf[r.childId] = {
        routeType: r.routeType,
        points: r.points ? r.points.map((point) => ({ x: boxLeft + point.x, y: boxTop + point.y })) : null,
      };
    }
    for (const cp of meas.childPlacements) place(cp.entry, cp.m, boxLeft + cp.cx, boxTop + cp.cy);
  })(rootEntry, m, 0, 0);
  return out;
}

function logicalBoundsOf(positioned) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const item of positioned) {
    minX = Math.min(minX, item.lx - item.w / 2);
    minY = Math.min(minY, item.ly - item.h / 2);
    maxX = Math.max(maxX, item.lx + item.w / 2);
    maxY = Math.max(maxY, item.ly + item.h / 2);
  }
  if (!Number.isFinite(minX)) return { w: 0, h: 0 };
  return { w: maxX - minX, h: maxY - minY };
}

function automaticClarityMetrics(positioned) {
  const byId = new Map(positioned.map((item) => [String(item.node.id), item]));
  const childIds = new Map();
  for (const item of positioned) {
    if (!item.parentId) continue;
    const parentId = String(item.parentId);
    if (!childIds.has(parentId)) childIds.set(parentId, []);
    childIds.get(parentId).push(item);
  }

  let edgeCount = 0;
  let detourTotal = 0;
  let bendTotal = 0;
  for (const child of positioned) {
    if (!child.parentId) continue;
    const parent = byId.get(String(child.parentId));
    if (!parent) continue;
    const points = uniquePoints([
      { x: parent.lx, y: parent.ly + parent.h / 2 },
      ...(child.routePoints || []),
      { x: child.lx, y: child.ly - child.h / 2 },
    ]);
    let length = 0;
    for (let index = 1; index < points.length; index += 1) {
      length += Math.abs(points[index].x - points[index - 1].x)
        + Math.abs(points[index].y - points[index - 1].y);
    }
    const direct = Math.abs(child.lx - parent.lx)
      + Math.abs((child.ly - child.h / 2) - (parent.ly + parent.h / 2));
    detourTotal += Math.max(0, length / Math.max(1, direct) - 1);
    bendTotal += Math.max(0, points.length - 2);
    edgeCount += 1;
  }

  let rankPenaltyTotal = 0;
  let structuralParentCount = 0;
  let mixedBandPenaltyTotal = 0;
  let mixedParentCount = 0;
  for (const children of childIds.values()) {
    const structural = children.filter((child) => childIds.has(String(child.node.id))
      || child.node.type === 'department');
    const directLeaves = children.filter((child) => {
      if (structural.includes(child)) return false;
      const data = child.node.data || {};
      return data.printRole !== 'head' && data.is_head !== true && data.isHead !== true
        && !/\b(municipal (vice )?mayor|office head|department head|head of office)\b/i.test(String(child.node.label || ''));
    });
    if (structural.length && directLeaves.length) {
      const lastLeafBottom = Math.max(...directLeaves.map((child) => child.ly + child.h / 2));
      const firstBranchTop = Math.min(...structural.map((child) => child.ly - child.h / 2));
      mixedBandPenaltyTotal += firstBranchTop < lastLeafBottom + 1 ? 1 : 0;
      mixedParentCount += 1;
    }
    if (structural.length < 2) continue;
    const ranks = [];
    for (const child of structural.sort((a, b) => a.ly - b.ly)) {
      if (!ranks.some((rank) => Math.abs(rank - child.ly) < 1)) ranks.push(child.ly);
    }
    rankPenaltyTotal += (ranks.length - 1) / (structural.length - 1);
    structuralParentCount += 1;
  }

  return {
    detourRatio: detourTotal / Math.max(1, edgeCount),
    bendsPerEdge: bendTotal / Math.max(1, edgeCount),
    rankScatter: rankPenaltyTotal / Math.max(1, structuralParentCount),
    mixedBandPenalty: mixedBandPenaltyTotal / Math.max(1, mixedParentCount),
  };
}

function layoutTreeAutoGrid(rootEntry, cfg) {
  // The target rectangle describes the final chart, while every recursive
  // packer works on only one nested block. Evaluate a bounded family of nearby
  // internal shapes and the mode's row/column/occupancy strategies end-to-end, then
  // keep the final chart that best fills the requested shape. This is
  // deterministic and lets a square or portrait canvas use a different grid
  // from a wide screen.
  const targetMultipliers = cfg.subtreeMode === 'GridSmart'
    ? [1, 1.8]
    : [0.72, 0.84, 0.92, 1, 1.08, 1.18, 1.32, 1.55, 1.8];
  const verticalSpacingScales = [0.78, 1, 1.22];
  const packingStrategies = cfg.subtreeMode === 'GridSmart'
    ? [
      { blockFlow: 'occupancy', leafFlow: 'inline', flexibleRows: false, preferShortFirst: false },
      { blockFlow: 'occupancy', leafFlow: 'band', flexibleRows: false, preferShortFirst: false },
    ]
    : [
      { blockFlow: 'rows', leafFlow: 'inline', flexibleRows: false, preferShortFirst: false },
      { blockFlow: 'rows', leafFlow: 'inline', flexibleRows: false, preferShortFirst: true },
      { blockFlow: 'rows', leafFlow: 'inline', flexibleRows: true, preferShortFirst: false },
      { blockFlow: 'rows', leafFlow: 'inline', flexibleRows: true, preferShortFirst: true },
      { blockFlow: 'adaptive', leafFlow: 'inline', flexibleRows: false, preferShortFirst: false },
      { blockFlow: 'adaptive', leafFlow: 'inline', flexibleRows: true, preferShortFirst: false },
      { blockFlow: 'masonry', leafFlow: 'inline', flexibleRows: false, preferShortFirst: false },
      { blockFlow: 'columns', leafFlow: 'inline', flexibleRows: false, preferShortFirst: false },
      { blockFlow: 'rows', leafFlow: 'band', flexibleRows: true, preferShortFirst: false },
      { blockFlow: 'adaptive', leafFlow: 'band', flexibleRows: true, preferShortFirst: false },
    ];
  const candidates = [];
  const evaluateMultipliers = (multipliers) => {
    for (const targetMultiplier of multipliers) {
      const packingAspect = clamp(cfg.targetAspect * targetMultiplier, 0.2, 6);
      for (const autoSpacingYScale of verticalSpacingScales) {
        for (const strategy of packingStrategies) {
          const positioned = layoutTree(rootEntry, {
            ...cfg,
            targetAspect: packingAspect,
            autoSpacingYScale,
            ...strategy,
          });
          const bounds = logicalBoundsOf(positioned);
          const aspect = bounds.w / Math.max(1, bounds.h);
          const occupiedArea = positioned.reduce((sum, item) => sum + item.w * item.h, 0);
          const densityRatio = Math.max(1, bounds.w * bounds.h / Math.max(1, occupiedArea));
          const shapePenalty = Math.abs(Math.log(Math.max(0.01, aspect) / cfg.targetAspect));
          const clarity = automaticClarityMetrics(positioned);
          const clarityScore = Math.log(densityRatio) * 0.65
            + clarity.detourRatio * 0.25
            + clarity.bendsPerEdge * 0.02
            + clarity.rankScatter * 1.4
            + clarity.mixedBandPenalty * 0.9;
          candidates.push({
            positioned,
            shapePenalty,
            densityRatio,
            clarityScore,
            ...clarity,
            ...strategy,
            targetMultiplier,
            autoSpacingYScale,
          });
        }
      }
    }
  };
  evaluateMultipliers(targetMultipliers);
  if (cfg.subtreeMode === 'GridSmart'
    && Math.min(...candidates.map((candidate) => candidate.shapePenalty)) > 0.08) {
    evaluateMultipliers([0.72, 1.4]);
  }
  const bestShapePenalty = Math.min(...candidates.map((candidate) => candidate.shapePenalty));
  // Sparse interlocking can produce a materially denser/readable chart whose
  // aspect is only a few percent farther from the exact target. GridSmart gets
  // a wider finalist band so a cosmetically exact square cannot beat a much
  // smaller square-like layout merely by adding whitespace.
  const acceptableShapePenalty = cfg.subtreeMode === 'GridSmart'
    ? Math.max(0.08, bestShapePenalty + 0.04)
    : Math.max(0.05, bestShapePenalty + 0.02);
  const finalists = candidates.filter((candidate) => candidate.shapePenalty <= acceptableShapePenalty);
  finalists.sort((a, b) => a.clarityScore - b.clarityScore
    || a.densityRatio - b.densityRatio
    || a.shapePenalty - b.shapePenalty
    || Math.abs(a.targetMultiplier - 1) - Math.abs(b.targetMultiplier - 1)
    || Math.abs(a.autoSpacingYScale - 1) - Math.abs(b.autoSpacingYScale - 1)
    || Number(a.blockFlow !== 'rows') - Number(b.blockFlow !== 'rows')
    || Number(a.flexibleRows) - Number(b.flexibleRows)
    || Number(a.preferShortFirst) - Number(b.preferShortFirst));
  const best = finalists[0];
  // A five-card family can be clearer on one rank, but local forcing is not
  // enough: several widened subtrees can compound into a much larger and
  // slower occupancy grid. Evaluate one bounded whole-chart alternative only
  // when there is a single eligible family, and reject it if any final
  // dimension or total area grows materially.
  if (cfg.subtreeMode === 'GridSmart'
    && cfg.visualTargetAspect >= 0.8
    && countBoundedOneRankFamilies(rootEntry) === 1) {
    const forced = layoutTree(rootEntry, {
      ...cfg,
      targetAspect: clamp(cfg.targetAspect * best.targetMultiplier, 0.2, 6),
      autoSpacingYScale: best.autoSpacingYScale,
      blockFlow: best.blockFlow,
      leafFlow: best.leafFlow,
      flexibleRows: best.flexibleRows,
      preferShortFirst: best.preferShortFirst,
      preferFiveLeafRank: true,
    });
    const baseBounds = logicalBoundsOf(best.positioned);
    const forcedBounds = logicalBoundsOf(forced);
    const widthRatio = forcedBounds.w / Math.max(1, baseBounds.w);
    const heightRatio = forcedBounds.h / Math.max(1, baseBounds.h);
    const areaRatio = (forcedBounds.w * forcedBounds.h)
      / Math.max(1, baseBounds.w * baseBounds.h);
    if (widthRatio <= 1.12 && heightRatio <= 1.12 && areaRatio <= 1.15) return forced;
  }
  return best.positioned;
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
  const orientation = options.orientation || 'TopToBottom';
  const subtreeMode = options.subtreeMode || 'AutoSmart';
  const size = options.targetSize;
  const sizeAspect = size && Number(size.width) > 0 && Number(size.height) > 0
    ? Number(size.width) / Number(size.height)
    : null;
  const visualTargetAspect = sizeAspect || Number(options.targetAspect) || 1.6;
  const horizontal = orientation === 'LeftToRight' || orientation === 'RightToLeft';
  const targetAspect = horizontal ? 1 / visualTargetAspect : visualTargetAspect;
  return {
    orientation,
    subtreeMode,
    spacingX: options.spacingX != null ? options.spacingX : 40,
    spacingY: options.spacingY != null ? options.spacingY : 70,
    gridSize: options.gridSize != null ? options.gridSize : 22,
    alignGrid: options.alignGrid != null ? !!options.alignGrid : subtreeMode === 'GridSmart',
    autoEdgeSide: !!options.autoEdgeSide,
    familyRouteOverrides: options.familyRouteOverrides || null,
    // Keep the caller's requested canvas shape stable while the bounded
    // Auto/GridSmart search evaluates different internal packing aspects.
    visualTargetAspect,
    targetAspect: Math.min(6, Math.max(0.2, targetAspect)),
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

  // Auto Smart uses measured subtree blocks so shorter branches can share rows
  // with deeper branches and occupy otherwise empty regions. The layered
  // solver remains available internally while the compact grid becomes the
  // default placement strategy requested by screen and export consumers.
  const logical = isAuto(cfg.subtreeMode)
    ? layoutTreeAutoGrid(visible, cfg)
    : layoutTree(visible, cfg);

  if (cfg.subtreeMode === 'Matrix') applyMatrix(logical, visibleDepths(visible), cfg);

  for (const p of logical) {
    const o = applyOrientation(p.lx, p.ly, cfg);
    p.cx = o.x; p.cy = o.y;
    if (p.routePoints) p.routePoints = p.routePoints.map((point) => applyOrientation(point.x, point.y, cfg));
  }

  let minX = Infinity, minY = Infinity;
  for (const p of logical) {
    minX = Math.min(minX, p.cx - p.node.width / 2);
    minY = Math.min(minY, p.cy - p.node.height / 2);
  }
  if (!isFinite(minX)) { minX = 0; minY = 0; }
  const dx = CANVAS_PAD - minX, dy = CANVAS_PAD - minY;
  for (const p of logical) {
    p.cx += dx; p.cy += dy;
    if (p.routePoints) p.routePoints = p.routePoints.map((point) => ({ x: point.x + dx, y: point.y + dy }));
  }

  if (cfg.alignGrid) {
    const g = cfg.gridSize;
    for (const p of logical) {
      p.cx = Math.round(p.cx / g) * g; p.cy = Math.round(p.cy / g) * g;
      if (p.routePoints) p.routePoints = p.routePoints.map((point) => ({
        x: Math.round(point.x / g) * g,
        y: Math.round(point.y / g) * g,
      }));
    }
  }

  let familyNetworks = [];
  if (cfg.subtreeMode === 'GridSmart') familyNetworks = routeOccupancyGrid(logical, cfg) || [];
  else if (isAuto(cfg.subtreeMode)) {
    repairAutomaticRoutes(logical, cfg);
    familyNetworks = buildFamilyNetworks(logical, cfg);
  }

  const posById = Object.create(null);
  for (const p of logical) posById[p.node.id] = p;
  const bounds = boundsOf(logical);

  return {
    positioned: logical,
    posById,
    cfg,
    bounds,
    framingBounds: framingBoundsOf(logical, bounds, cfg),
    familyNetworks,
  };
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

function framingBoundsOf(positioned, bounds, cfg) {
  if (cfg.subtreeMode !== 'GridSmart' || !positioned.length) return bounds;
  const byId = new Map(positioned.map((item) => [String(item.node.id), item]));
  const roots = positioned.filter((item) => !item.parentId || !byId.has(String(item.parentId)));
  if (roots.length !== 1) return bounds;
  const root = roots[0];
  const parentIds = new Set(positioned
    .filter((item) => item.parentId != null)
    .map((item) => String(item.parentId)));
  const rootChildren = positioned.filter((item) => String(item.parentId) === String(root.node.id));
  const regular = rootChildren.filter((item) => !isFeatured({ node: item.node }));
  const branches = regular.filter((item) => parentIds.has(String(item.node.id)));
  const leaves = regular.filter((item) => !parentIds.has(String(item.node.id)));
  if (branches.length !== 3
    || (leaves.length === 0 && regular.length === rootChildren.length)) return bounds;

  const horizontal = isHorizontal(cfg);
  const crossOf = (item) => horizontal ? item.cy : item.cx;
  const flowOf = (item) => horizontal ? item.cx : item.cy;
  branches.sort((a, b) => crossOf(a) - crossOf(b));
  const middle = branches[1];
  const tolerance = cfg.gridSize / 2 + 0.01;
  if (Math.abs(crossOf(root) - crossOf(middle)) > tolerance
    || branches.some((branch) => Math.abs(flowOf(branch) - flowOf(middle)) > tolerance)) return bounds;

  const center = crossOf(root);
  if (horizontal) {
    const half = Math.max(center - bounds.y, bounds.y + bounds.h - center);
    return { ...bounds, y: center - half, h: half * 2 };
  }
  const half = Math.max(center - bounds.x, bounds.x + bounds.w - center);
  return { ...bounds, x: center - half, w: half * 2 };
}
