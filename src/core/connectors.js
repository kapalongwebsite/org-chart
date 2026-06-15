// Orthogonal connector routing — pure geometry (no DOM).
// Produces SVG path `d` strings in content space. Supports the engine's
// automatic routes (bus / spine) and manual orthogonal waypoints.
import { isHorizontal } from './layout.js';

/* effective center of a positioned node = layout center + manual offset */
export function effCenter(p, manualOffsets) {
  const off = manualOffsets && manualOffsets[p.node.id];
  return { x: p.cx + (off ? off.dx : 0), y: p.cy + (off ? off.dy : 0) };
}

/* one orthogonal path between parent & child.
   Manual waypoints OR manual endpoint anchors override the auto route. */
export function routeConnector(parent, child, cfg, manualOffsets, edgeWaypoints, edgeAnchors) {
  const wps = edgeWaypoints && edgeWaypoints[child.node.id];
  const anchors = edgeAnchors && edgeAnchors[child.node.id];
  if ((wps && wps.length) || anchors) return waypointPath(parent, child, wps || [], cfg, manualOffsets, anchors);

  const P = effCenter(parent, manualOffsets), C = effCenter(child, manualOffsets);
  const pw = parent.node.width, ph = parent.node.height;
  const cw = child.node.width, chh = child.node.height;
  const horizontal = isHorizontal(cfg);

  const pTop = P.y - ph / 2, pBot = P.y + ph / 2, pLeft = P.x - pw / 2, pRight = P.x + pw / 2;
  const cTop = C.y - chh / 2, cBot = C.y + chh / 2, cLeft = C.x - cw / 2, cRight = C.x + cw / 2;

  const pts = [];
  // 'grid' (Custom) gets a dedicated channel route in the renderer; here it just
  // falls back to a plain bus (used for non-TopToBottom orientations).
  if (child.routeType === 'bus' || child.routeType === 'grid') {
    if (!horizontal) {
      const pEdge = (C.y >= P.y) ? pBot : pTop;
      const cEdge = (C.y >= P.y) ? cTop : cBot;
      const midY = (pEdge + cEdge) / 2;
      pts.push([P.x, pEdge], [P.x, midY], [C.x, midY], [C.x, cEdge]);
    } else {
      const pEdge = (C.x >= P.x) ? pRight : pLeft;
      const cEdge = (C.x >= P.x) ? cLeft : cRight;
      const midX = (pEdge + cEdge) / 2;
      pts.push([pEdge, P.y], [midX, P.y], [midX, C.y], [cEdge, C.y]);
    }
  } else {
    if (!horizontal) {
      const pEdge = (C.y >= P.y) ? pBot : pTop;
      const facingX = (C.x <= P.x) ? cRight : cLeft;
      pts.push([P.x, pEdge], [P.x, C.y], [facingX, C.y]);
    } else {
      const pEdge = (C.x >= P.x) ? pRight : pLeft;
      const facingY = (C.y <= P.y) ? cBot : cTop;
      pts.push([pEdge, P.y], [C.x, P.y], [C.x, facingY]);
    }
  }
  return 'M ' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');
}

/* parent exit / child entry edges; manual anchors (normalized to [-1,1] on the
   box perimeter) override the auto facing-center logic. */
export function edgeEndpoints(parent, child, toward1, towardN, cfg, manualOffsets, anchors) {
  const P = effCenter(parent, manualOffsets), C = effCenter(child, manualOffsets);
  const pw = parent.node.width, ph = parent.node.height;
  const cw = child.node.width, chh = child.node.height;
  let S, E;
  if (anchors && anchors.p) {
    S = { x: P.x + anchors.p.nx * pw / 2, y: P.y + anchors.p.ny * ph / 2 };
  } else if (!isHorizontal(cfg)) {
    S = { x: P.x, y: (toward1.y >= P.y) ? P.y + ph / 2 : P.y - ph / 2 };
  } else {
    S = { x: (toward1.x >= P.x) ? P.x + pw / 2 : P.x - pw / 2, y: P.y };
  }
  if (anchors && anchors.c) {
    E = { x: C.x + anchors.c.nx * cw / 2, y: C.y + anchors.c.ny * chh / 2 };
  } else if (!isHorizontal(cfg)) {
    E = { x: C.x, y: (towardN.y >= C.y) ? C.y + chh / 2 : C.y - chh / 2 };
  } else {
    E = { x: (towardN.x >= C.x) ? C.x + cw / 2 : C.x - cw / 2, y: C.y };
  }
  return { S, E };
}

export function edgeControlPoints(parent, child, wps, cfg, manualOffsets, anchors) {
  const first = wps.length ? wps[0] : effCenter(child, manualOffsets);
  const last = wps.length ? wps[wps.length - 1] : effCenter(parent, manualOffsets);
  const ends = edgeEndpoints(parent, child, first, last, cfg, manualOffsets, anchors);
  const S = ends.S;
  let E = ends.E;
  // With no manual waypoints/anchor, the auto route (routeConnector) decides the
  // child entry by routeType: SPINE routes enter from the side facing the parent,
  // not the perpendicular center. Match that here so the selected-line edit
  // handles (add dots + endpoint square) land on the actual drawn line instead of
  // floating off to the side. (Manual anchors/waypoints keep the toward-based entry.)
  if (!wps.length && !(anchors && anchors.c) && child.routeType !== 'bus') {
    const C = effCenter(child, manualOffsets), P = effCenter(parent, manualOffsets);
    const cw = child.node.width, chh = child.node.height;
    E = !isHorizontal(cfg)
      ? { x: (C.x <= P.x) ? C.x + cw / 2 : C.x - cw / 2, y: C.y }
      : { x: C.x, y: (C.y <= P.y) ? C.y + chh / 2 : C.y - chh / 2 };
  }
  return [S].concat(wps.map((w) => ({ x: w.x, y: w.y })), [E]);
}

export function orthoThrough(controls, horizontal) {
  const out = [controls[0]];
  for (let i = 1; i < controls.length; i++) {
    const A = out[out.length - 1], B = controls[i];
    if (A.x !== B.x && A.y !== B.y) out.push(horizontal ? { x: B.x, y: A.y } : { x: A.x, y: B.y });
    out.push(B);
  }
  return out;
}

export function waypointPath(parent, child, wps, cfg, manualOffsets, anchors) {
  const pts = orthoThrough(edgeControlPoints(parent, child, wps, cfg, manualOffsets, anchors), isHorizontal(cfg));
  return 'M ' + pts.map((p) => p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' L ');
}
