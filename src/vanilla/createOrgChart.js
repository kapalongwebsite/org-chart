// Plain-JavaScript renderer for the org chart. Builds its own DOM inside the
// host element, wires pan/zoom/drag/waypoint editing, and drives everything
// through the framework-independent core. Returns an instance with a clean
// method surface and a destroy() that removes all DOM + listeners.
import {
  makeNode, indexNodes, layoutOrgChart, normalizeConfig, isHorizontal,
  routeConnector, edgeEndpoints, edgeControlPoints, effCenter,
  searchNodes as coreSearch, calculateBounds, fitBounds,
  childCount, computeDepths, normalizeImported, exportLayout, buildChartSVG,
} from '../core/index.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const FIT_MIN = 0.5;

const DEFAULT_OPTS = {
  nodes: [],
  orientation: 'TopToBottom',
  subtreeMode: 'Balanced',
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  showGrid: false,
  snapGrid: false,
  alignGrid: false,
  enableDragging: true,
  enablePan: true,
  enableZoom: true,
  readonly: false,
  fitOnInit: true,
  toolbar: true,
  persist: false,
  storageKey: 'local-org-chart.state',
};

export function createOrgChart(host, userOpts = {}) {
  if (!host || !host.appendChild) throw new Error('createOrgChart: first argument must be a DOM element.');
  const opts = Object.assign({}, DEFAULT_OPTS, userOpts);

  // ---- per-instance state ----
  const state = {
    orientation: opts.orientation, subtreeMode: opts.subtreeMode,
    spacingX: opts.spacingX, spacingY: opts.spacingY,
    zoom: 1, panX: 0, panY: 0,
    selectedNodeId: null, selectedEdgeId: null,
    gridSize: opts.gridSize, showGrid: opts.showGrid,
    snapGrid: opts.snapGrid, alignGrid: opts.alignGrid,
  };
  let NODES = (opts.nodes || []).map(makeNode);
  let nodeById = indexNodes(NODES);
  let manualOffsets = Object.create(null);
  let edgeWaypoints = Object.create(null);
  let positioned = [], posById = Object.create(null);

  const elById = Object.create(null);
  const pathById = Object.create(null);
  const hitById = Object.create(null);
  let edgeDrag = null, drag = null, dragRaf = 0, searchMatches = new Set();
  const listeners = [];                 // {target,type,fn} for clean teardown
  const events = Object.create(null);   // name -> [cb]

  // ---- tiny event emitter ----
  function on(name, cb) { (events[name] || (events[name] = [])).push(cb); return api; }
  function off(name, cb) { if (events[name]) events[name] = events[name].filter((f) => f !== cb); return api; }
  function emit(name, payload) { (events[name] || []).forEach((cb) => { try { cb(payload); } catch (e) { /* swallow */ } }); }
  function addL(target, type, fn, optsL) { target.addEventListener(type, fn, optsL); listeners.push({ target, type, fn, optsL }); }

  // ---- DOM scaffold ----
  const root = document.createElement('div');
  root.className = 'loc-root';
  const toolbarEl = opts.toolbar ? buildToolbar() : null;
  if (toolbarEl) root.appendChild(toolbarEl);

  const canvas = el('div', 'loc-canvas');
  const content = el('div', 'loc-content');
  const gridEl = el('div', 'loc-grid');
  const svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('class', 'loc-connectors');
  const edgeHitsG = document.createElementNS(SVGNS, 'g'); edgeHitsG.setAttribute('class', 'loc-edgehits');
  svg.appendChild(edgeHitsG);
  const nodesLayer = el('div', 'loc-nodes');
  const overlay = document.createElementNS(SVGNS, 'svg'); overlay.setAttribute('class', 'loc-overlay');
  const edgeHandlesG = document.createElementNS(SVGNS, 'g'); edgeHandlesG.setAttribute('class', 'loc-edgehandles');
  overlay.appendChild(edgeHandlesG);
  const zoomReadout = el('div', 'loc-zoomreadout'); zoomReadout.textContent = '100%';

  content.appendChild(gridEl); content.appendChild(svg); content.appendChild(nodesLayer); content.appendChild(overlay);
  canvas.appendChild(content); canvas.appendChild(zoomReadout);
  root.appendChild(canvas);
  host.appendChild(root);

  function el(tag, cls) { const d = document.createElement(tag); if (cls) d.className = cls; return d; }

  // ================= layout pipeline =================
  function cfg() {
    return normalizeConfig({
      orientation: state.orientation, subtreeMode: state.subtreeMode,
      spacingX: state.spacingX, spacingY: state.spacingY,
      gridSize: state.gridSize, alignGrid: state.alignGrid,
    });
  }
  function runLayout() {
    const res = layoutOrgChart(NODES, cfg());
    positioned = res.positioned; posById = res.posById;
  }
  function refresh() {
    runLayout();
    sizeSvg();
    drawConnectors();
    drawNodes();
    applyTransform();
    applySearchDim();
    persist();
    emit('layout-change', { positioned, mode: state.subtreeMode, orientation: state.orientation });
  }

  // ================= nodes =================
  function drawNodes() {
    const seen = Object.create(null);
    for (const p of positioned) {
      const n = p.node; seen[n.id] = true;
      let elNode = elById[n.id];
      if (!elNode) { elNode = buildNodeEl(n); elById[n.id] = elNode; nodesLayer.appendChild(elNode); }
      elNode.style.width = n.width + 'px';
      elNode.style.height = n.height + 'px';
      const c = effCenter(p, manualOffsets);
      elNode.style.transform = `translate(${c.x - n.width / 2}px, ${c.y - n.height / 2}px)`;
      if (!elNode.dataset.fitted) { fitNodeText(elNode); elNode.dataset.fitted = '1'; }
      elNode.classList.toggle('loc-selected', state.selectedNodeId === n.id);
      updateToggle(elNode, n);
    }
    for (const id in elById) if (!seen[id]) { elById[id].remove(); delete elById[id]; }
  }
  function buildNodeEl(n) {
    const d = el('div', 'loc-node loc-' + n.type + (n.status ? ' loc-status-' + n.status : ''));
    d.dataset.id = n.id;
    if (n.type === 'department') {
      d.innerHTML = '<span class="loc-lbl"></span>';
      d.querySelector('.loc-lbl').textContent = n.label;
      const t = el('div', 'loc-toggle'); t.dataset.role = 'toggle'; d.appendChild(t);
    } else {
      d.innerHTML = '<div class="loc-photo"></div><div class="loc-ptext">'
        + '<div class="loc-pname"></div><div class="loc-ptitle"></div><div class="loc-badge"></div></div>';
      const photo = d.querySelector('.loc-photo');
      const url = n.data && n.data.photo_url;
      if (url) {
        const img = new Image(); img.alt = ''; img.referrerPolicy = 'no-referrer';
        img.onerror = () => { photo.textContent = '●'; }; img.src = url; photo.appendChild(img);
      } else { photo.textContent = '●'; }
      d.querySelector('.loc-pname').textContent = n.personName || '—';
      d.querySelector('.loc-ptitle').textContent = n.label;
      const b = d.querySelector('.loc-badge');
      if (n.status) { b.textContent = n.status; b.className = 'loc-badge loc-' + n.status; } else b.remove();
    }
    return d;
  }
  function isOverflowing(e) { return e.scrollWidth > e.clientWidth + 0.5 || e.scrollHeight > e.clientHeight + 0.5; }
  function fitNodeText(e) {
    e.style.setProperty('--loc-fit', '1');
    if (!isOverflowing(e)) return;
    let lo = FIT_MIN, hi = 1;
    for (let i = 0; i < 7; i++) { const mid = (lo + hi) / 2; e.style.setProperty('--loc-fit', String(mid)); if (isOverflowing(e)) hi = mid; else lo = mid; }
    e.style.setProperty('--loc-fit', String(lo));
  }
  function updateToggle(elNode, n) {
    const t = elNode.querySelector('[data-role="toggle"]'); if (!t) return;
    const has = childCount(NODES, n.id) > 0;
    t.style.display = has ? 'flex' : 'none';
    t.textContent = n.collapsed ? '⊞' : '⊟';
  }

  // ================= connectors =================
  function createNS(tag) { return document.createElementNS(SVGNS, tag); }
  function drawConnectors() {
    const seen = Object.create(null);
    for (const p of positioned) {
      const n = p.node; if (!n.parentId) continue;
      const parent = posById[n.parentId]; if (!parent) continue;
      seen[n.id] = true;
      const d = routeConnector(parent, p, cfg(), manualOffsets, edgeWaypoints);
      let path = pathById[n.id];
      if (!path) { path = createNS('path'); pathById[n.id] = path; svg.appendChild(path); }
      path.setAttribute('d', d); path.classList.toggle('loc-sel', state.selectedEdgeId === n.id);
      let hit = hitById[n.id];
      if (!hit) { hit = createNS('path'); hit.dataset.edge = n.id; hitById[n.id] = hit; edgeHitsG.appendChild(hit); }
      hit.setAttribute('d', d);
    }
    for (const id in pathById) if (!seen[id]) { pathById[id].remove(); delete pathById[id]; }
    for (const id in hitById) if (!seen[id]) { hitById[id].remove(); delete hitById[id]; }
    if (state.selectedEdgeId && !seen[state.selectedEdgeId]) deselectEdge(); else renderEdgeHandles();
  }
  function updateEdgeGeom(id) {
    const child = posById[id]; if (!child) return;
    const parent = posById[child.node.parentId]; if (!parent) return;
    const d = routeConnector(parent, child, cfg(), manualOffsets, edgeWaypoints);
    if (pathById[id]) pathById[id].setAttribute('d', d);
    if (hitById[id]) hitById[id].setAttribute('d', d);
  }

  // ================= transform / sizing =================
  function applyTransform() {
    content.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
    zoomReadout.textContent = Math.round(state.zoom * 100) + '%';
    if (state.selectedEdgeId && !edgeDrag) renderEdgeHandles();
    persist();
  }
  function sizeSvg() {
    let maxX = 0, maxY = 0;
    for (const p of positioned) {
      const c = effCenter(p, manualOffsets);
      maxX = Math.max(maxX, c.x + p.node.width / 2 + 80);
      maxY = Math.max(maxY, c.y + p.node.height / 2 + 80);
    }
    svg.setAttribute('width', maxX); svg.setAttribute('height', maxY);
    overlay.setAttribute('width', maxX); overlay.setAttribute('height', maxY);
    gridEl.style.width = maxX + 'px'; gridEl.style.height = maxY + 'px';
    gridEl.style.backgroundSize = state.gridSize + 'px ' + state.gridSize + 'px';
  }
  function applyGridOverlay() {
    gridEl.classList.toggle('loc-on', state.showGrid);
    canvas.classList.toggle('loc-gridon', state.showGrid);
  }

  // ================= fit / center =================
  function fitToScreen() {
    if (!positioned.length) return;
    const b = calculateBounds(positioned, manualOffsets, 0);
    const v = fitBounds(b, canvas.clientWidth, canvas.clientHeight);
    state.zoom = v.zoom; state.panX = v.panX; state.panY = v.panY;
    applyTransform();
  }
  function centerOnNode(id) {
    const p = posById[id]; if (!p) return;
    const c = effCenter(p, manualOffsets);
    state.panX = canvas.clientWidth / 2 - c.x * state.zoom;
    state.panY = canvas.clientHeight / 2 - c.y * state.zoom;
    applyTransform();
  }

  // ================= expand / collapse =================
  function expandAll() { for (const n of NODES) n.collapsed = false; refresh(); }
  function collapseAll() {
    const depth = computeDepths(NODES, nodeById);
    for (const n of NODES) n.collapsed = (depth[n.id] >= 1 && childCount(NODES, n.id) > 0);
    refresh();
  }
  function toggleCollapse(id) {
    const n = nodeById[id]; if (!n) return;
    n.collapsed = !n.collapsed; refresh();
  }

  // ================= search =================
  function search(query) {
    searchMatches = coreSearch(NODES, query);
    applySearchDim();
    if (searchMatches.size) { const f = positioned.find((p) => searchMatches.has(p.node.id)); if (f) centerOnNode(f.node.id); }
    return searchMatches.size;
  }
  function clearSearch() { searchMatches = new Set(); applySearchDim(); }
  function applySearchDim() {
    const active = searchMatches.size > 0;
    for (const p of positioned) {
      const e = elById[p.node.id]; if (!e) continue;
      const hit = searchMatches.has(p.node.id);
      e.classList.toggle('loc-highlight', active && hit);
      e.classList.toggle('loc-dim', active && !hit);
    }
    for (const id in pathById) pathById[id].classList.toggle('loc-hl', active && searchMatches.has(id));
  }

  // ================= node dragging =================
  function onNodePointerDown(e, id) {
    if (e.target.closest('[data-role="toggle"]')) return;
    e.stopPropagation();
    deselectEdge();
    selectNode(id);
    emit('node-select', { id, node: nodeById[id] });
    if (opts.readonly || !opts.enableDragging) return;
    const off = manualOffsets[id] || { dx: 0, dy: 0 };
    drag = { id, startX: e.clientX, startY: e.clientY, baseDx: off.dx, baseDy: off.dy, moved: false };
    elById[id].classList.add('loc-dragging');
    emit('node-drag-start', { id, node: nodeById[id] });
    addWin('pointermove', onNodePointerMove); addWin('pointerup', onNodePointerUp);
  }
  function onNodePointerMove(e) {
    if (!drag) return;
    let dx = drag.baseDx + (e.clientX - drag.startX) / state.zoom;
    let dy = drag.baseDy + (e.clientY - drag.startY) / state.zoom;
    if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 3) drag.moved = true;
    if (state.snapGrid) {
      const g = state.gridSize, base = posById[drag.id];
      if (base) { dx = Math.round((base.cx + dx) / g) * g - base.cx; dy = Math.round((base.cy + dy) / g) * g - base.cy; }
    }
    manualOffsets[drag.id] = { dx, dy };
    if (!dragRaf) dragRaf = requestAnimationFrame(() => {
      dragRaf = 0; redrawNode(drag.id); redrawIncident(drag.id);
      emit('node-drag', { id: drag.id, node: nodeById[drag.id], offset: manualOffsets[drag.id] });
    });
  }
  function onNodePointerUp() {
    if (drag) { const e = elById[drag.id]; if (e) e.classList.remove('loc-dragging'); emit('node-drag-end', { id: drag.id, node: nodeById[drag.id], offset: manualOffsets[drag.id] }); }
    drag = null;
    rmWin('pointermove', onNodePointerMove); rmWin('pointerup', onNodePointerUp);
    persist();
  }
  function redrawNode(id) {
    const p = posById[id], e = elById[id]; if (!p || !e) return;
    const c = effCenter(p, manualOffsets);
    e.style.transform = `translate(${c.x - p.node.width / 2}px, ${c.y - p.node.height / 2}px)`;
  }
  function redrawIncident(id) {
    const p = posById[id]; if (!p) return;
    if (posById[p.node.parentId]) updateEdgeGeom(id);
    for (const q of positioned) if (q.node.parentId === id) updateEdgeGeom(q.node.id);
    if (state.selectedEdgeId) renderEdgeHandles();
  }
  function selectNode(id) {
    if (state.selectedNodeId && elById[state.selectedNodeId]) elById[state.selectedNodeId].classList.remove('loc-selected');
    state.selectedNodeId = id;
    if (elById[id]) elById[id].classList.add('loc-selected');
  }

  // ================= edge waypoint editing =================
  function clientToContent(cx, cy) {
    const r = canvas.getBoundingClientRect();
    return { x: (cx - r.left - state.panX) / state.zoom, y: (cy - r.top - state.panY) / state.zoom };
  }
  function snapPoint(p) {
    if (state.snapGrid) { const g = state.gridSize; return { x: Math.round(p.x / g) * g, y: Math.round(p.y / g) * g }; }
    return { x: p.x, y: p.y };
  }
  function controlsFor(id) {
    const child = posById[id]; if (!child) return null;
    const parent = posById[child.node.parentId]; if (!parent) return null;
    const wps = edgeWaypoints[id] || [];
    if (wps.length) return edgeControlPoints(parent, child, wps, cfg(), manualOffsets);
    const { S, E } = edgeEndpoints(parent, child, effCenter(child, manualOffsets), effCenter(parent, manualOffsets), cfg(), manualOffsets);
    return [S, E];
  }
  function selectEdge(id) {
    if (state.selectedEdgeId && pathById[state.selectedEdgeId]) pathById[state.selectedEdgeId].classList.remove('loc-sel');
    if (state.selectedNodeId && elById[state.selectedNodeId]) elById[state.selectedNodeId].classList.remove('loc-selected');
    state.selectedNodeId = null; state.selectedEdgeId = id;
    if (pathById[id]) pathById[id].classList.add('loc-sel');
    renderEdgeHandles();
  }
  function deselectEdge() {
    if (state.selectedEdgeId && pathById[state.selectedEdgeId]) pathById[state.selectedEdgeId].classList.remove('loc-sel');
    state.selectedEdgeId = null; edgeHandlesG.innerHTML = '';
  }
  function mkCircle(x, y, r, cls) {
    const c = createNS('circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r); c.setAttribute('class', cls); return c;
  }
  function renderEdgeHandles() {
    edgeHandlesG.innerHTML = '';
    const id = state.selectedEdgeId; if (!id || opts.readonly) return;
    const controls = controlsFor(id); if (!controls) return;
    const wps = edgeWaypoints[id] || [];
    const r = 6 / state.zoom, ra = 5 / state.zoom;
    for (let s = 0; s < controls.length - 1; s++) {
      const A = controls[s], B = controls[s + 1];
      const c = mkCircle((A.x + B.x) / 2, (A.y + B.y) / 2, ra, 'loc-wp-add'); c.dataset.add = s; edgeHandlesG.appendChild(c);
    }
    for (let i = 0; i < wps.length; i++) { const c = mkCircle(wps[i].x, wps[i].y, r, 'loc-wp-handle'); c.dataset.wp = i; edgeHandlesG.appendChild(c); }
  }
  function distToSeg(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
    let t = L2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2 : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }
  function nearestSegment(controls, pt) {
    let best = 0, bestD = Infinity;
    for (let s = 0; s < controls.length - 1; s++) { const d = distToSeg(pt, controls[s], controls[s + 1]); if (d < bestD) { bestD = d; best = s; } }
    return best;
  }

  // ================= persistence =================
  function persist() {
    if (!opts.persist) return;
    try {
      localStorage.setItem(opts.storageKey, JSON.stringify({
        orientation: state.orientation, subtreeMode: state.subtreeMode,
        spacingX: state.spacingX, spacingY: state.spacingY,
        zoom: state.zoom, panX: state.panX, panY: state.panY,
        showGrid: state.showGrid, snapGrid: state.snapGrid, alignGrid: state.alignGrid, gridSize: state.gridSize,
        manualOffsets, edgeWaypoints, collapsed: NODES.filter((n) => n.collapsed).map((n) => n.id),
      }));
    } catch (e) { /* quota / unavailable — ignore */ }
  }
  function restore() {
    if (!opts.persist) return;
    let s; try { s = JSON.parse(localStorage.getItem(opts.storageKey) || 'null'); } catch (e) { s = null; }
    if (!s) return;
    if (s.orientation) state.orientation = s.orientation;
    if (s.subtreeMode) state.subtreeMode = s.subtreeMode;
    ['spacingX', 'spacingY', 'zoom', 'panX', 'panY', 'gridSize'].forEach((k) => { if (typeof s[k] === 'number') state[k] = s[k]; });
    state.showGrid = !!s.showGrid; state.snapGrid = !!s.snapGrid; state.alignGrid = !!s.alignGrid;
    if (s.manualOffsets) manualOffsets = s.manualOffsets;
    if (s.edgeWaypoints) edgeWaypoints = s.edgeWaypoints;
    if (Array.isArray(s.collapsed)) { const set = new Set(s.collapsed); for (const n of NODES) n.collapsed = set.has(n.id); }
  }

  // ================= export =================
  function exportJSON(download) {
    const payload = exportLayout(state, NODES, manualOffsets, edgeWaypoints);
    if (download !== false) downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), 'org-chart-layout.json');
    return payload;
  }
  const _measCtx = document.createElement('canvas').getContext('2d');
  function measureText(t, font) { _measCtx.font = font; return _measCtx.measureText(t).width; }
  function fitOf(n) { const e = elById[n.id]; if (!e) return 1; const f = parseFloat(e.style.getPropertyValue('--loc-fit')); return (isFinite(f) && f > 0) ? f : 1; }
  function buildSVG(raster) {
    const paths = []; for (const id in pathById) paths.push(pathById[id].getAttribute('d'));
    return buildChartSVG(positioned, paths, { manualOffsets, raster: !!raster, measureText, fitOf });
  }
  function exportSVG() { downloadBlob(new Blob([buildSVG(false)], { type: 'image/svg+xml;charset=utf-8' }), 'org-chart.svg'); return buildSVG(false); }
  function exportPNG(scale) {
    scale = scale || 3;
    const b = calculateBounds(positioned, manualOffsets, 40);
    const MAX_SIDE = 16000, MAX_AREA = 200e6;
    let s = Math.min(scale, MAX_SIDE / b.w, MAX_SIDE / b.h);
    if (b.w * s * b.h * s > MAX_AREA) s = Math.sqrt(MAX_AREA / (b.w * b.h));
    s = Math.max(0.05, s);
    const url = URL.createObjectURL(new Blob([buildSVG(true)], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas'); cv.width = Math.round(b.w * s); cv.height = Math.round(b.h * s);
      const ctx = cv.getContext('2d'); ctx.setTransform(s, 0, 0, s, 0, 0); ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      try { cv.toBlob((bl) => { if (bl) downloadBlob(bl, 'org-chart.png'); }, 'image/png'); } catch (e) { /* taint */ }
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }
  function exportPDF() {
    const w = window.open('', '_blank'); if (!w) return;
    w.document.open();
    w.document.write('<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>'
      + buildSVG(false) + '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};</scr' + 'ipt></body></html>');
    w.document.close();
  }
  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // ================= public setters =================
  function setNodes(nodes, meta) {
    NODES = (nodes || []).map(makeNode); nodeById = indexNodes(NODES);
    manualOffsets = Object.create(null); edgeWaypoints = Object.create(null);
    state.selectedNodeId = null; state.selectedEdgeId = null; searchMatches = new Set();
    for (const id in elById) { elById[id].remove(); delete elById[id]; }
    for (const id in pathById) { pathById[id].remove(); delete pathById[id]; }
    for (const id in hitById) { hitById[id].remove(); delete hitById[id]; }
    if (meta) {
      if (meta.subtreeMode) state.subtreeMode = meta.subtreeMode;
      if (meta.orientation) state.orientation = meta.orientation;
      if (meta.manualOffsets) manualOffsets = meta.manualOffsets;
      if (meta.edgeWaypoints) edgeWaypoints = meta.edgeWaypoints;
    }
    syncToolbar(); refresh();
    if (opts.fitOnInit) fitToScreen();
  }
  function loadJSON(data) { const { nodes, meta } = normalizeImported(data); setNodes(nodes, meta); return nodes.length; }
  function setOrientation(o) { state.orientation = o; manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); deselectEdge(); syncToolbar(); refresh(); emit('orientation-change', { orientation: o }); }
  function setSubtreeMode(m) { state.subtreeMode = m; manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); deselectEdge(); syncToolbar(); refresh(); emit('subtree-mode-change', { subtreeMode: m }); }
  function setSpacing(x, y) { if (x != null) state.spacingX = x; if (y != null) state.spacingY = y; refresh(); }
  function setOption(key, val) {
    if (key in state) { state[key] = val; if (key === 'showGrid') applyGridOverlay(); if (key === 'alignGrid') { manualOffsets = Object.create(null); refresh(); } syncToolbar(); }
    else opts[key] = val;
  }
  function relayout() { manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); deselectEdge(); refresh(); }

  // ================= global interaction wiring =================
  addL(nodesLayer, 'pointerdown', (e) => { const el2 = e.target.closest('.loc-node'); if (el2) onNodePointerDown(e, el2.dataset.id); });
  addL(nodesLayer, 'click', (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !opts.readonly) { toggleCollapse(t.closest('.loc-node').dataset.id); return; }
    const node = e.target.closest('.loc-node'); if (node) emit('node-click', { id: node.dataset.id, node: nodeById[node.dataset.id] });
  });

  addL(edgeHitsG, 'pointerdown', (e) => { const t = e.target.closest('path'); if (!t) return; e.stopPropagation(); selectEdge(t.dataset.edge); });
  addL(edgeHitsG, 'dblclick', (e) => {
    if (opts.readonly) return;
    const t = e.target.closest('path'); if (!t) return;
    const id = t.dataset.edge; selectEdge(id);
    const controls = controlsFor(id); if (!controls) return;
    const pt = snapPoint(clientToContent(e.clientX, e.clientY));
    const arr = edgeWaypoints[id] || (edgeWaypoints[id] = []);
    arr.splice(nearestSegment(controls, pt), 0, pt);
    updateEdgeGeom(id); renderEdgeHandles(); persist();
  });
  addL(edgeHandlesG, 'pointerdown', (e) => {
    if (opts.readonly) return;
    const t = e.target, id = state.selectedEdgeId; if (!id) return;
    let idx;
    if (t.dataset.wp != null) idx = +t.dataset.wp;
    else if (t.dataset.add != null) { const s = +t.dataset.add; const wps = edgeWaypoints[id] || (edgeWaypoints[id] = []); wps.splice(s, 0, snapPoint(clientToContent(e.clientX, e.clientY))); idx = s; updateEdgeGeom(id); }
    else return;
    e.stopPropagation(); e.preventDefault();
    edgeDrag = { id, idx }; addWin('pointermove', onHandleMove); addWin('pointerup', onHandleUp);
  });
  addL(edgeHandlesG, 'dblclick', (e) => {
    const t = e.target; if (t.dataset.wp == null) return;
    const id = state.selectedEdgeId, wps = edgeWaypoints[id]; if (!wps) return;
    wps.splice(+t.dataset.wp, 1); if (!wps.length) delete edgeWaypoints[id];
    updateEdgeGeom(id); renderEdgeHandles(); persist();
  });
  function onHandleMove(e) { if (!edgeDrag) return; const wps = edgeWaypoints[edgeDrag.id]; if (!wps) return; wps[edgeDrag.idx] = snapPoint(clientToContent(e.clientX, e.clientY)); updateEdgeGeom(edgeDrag.id); renderEdgeHandles(); }
  function onHandleUp() { edgeDrag = null; rmWin('pointermove', onHandleMove); rmWin('pointerup', onHandleUp); persist(); }

  // pan
  addL(canvas, 'pointerdown', (e) => {
    if (e.target.closest('.loc-node') || e.target.closest('.loc-edgehits path') || e.target.closest('.loc-edgehandles *')) {
      // selection clearing handled elsewhere; just don't pan
    } else {
      if (state.selectedNodeId) { if (elById[state.selectedNodeId]) elById[state.selectedNodeId].classList.remove('loc-selected'); state.selectedNodeId = null; }
      if (state.selectedEdgeId) deselectEdge();
      if (!opts.enablePan) return;
      canvas.classList.add('loc-panning');
      const sx = e.clientX, sy = e.clientY, px = state.panX, py = state.panY;
      const mv = (ev) => { state.panX = px + (ev.clientX - sx); state.panY = py + (ev.clientY - sy); applyTransform(); };
      const up = () => { canvas.classList.remove('loc-panning'); rmWin('pointermove', mv); rmWin('pointerup', up); };
      addWin('pointermove', mv); addWin('pointerup', up);
    }
  });
  // zoom
  addL(canvas, 'wheel', (e) => {
    if (!opts.enableZoom) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const nz = Math.min(3, Math.max(0.15, state.zoom * factor));
    state.panX = mx - (mx - state.panX) * (nz / state.zoom);
    state.panY = my - (my - state.panY) * (nz / state.zoom);
    state.zoom = nz; applyTransform();
  }, { passive: false });

  function addWin(type, fn) { window.addEventListener(type, fn); listeners.push({ target: window, type, fn }); }
  function rmWin(type, fn) { window.removeEventListener(type, fn); }

  // ================= optional toolbar =================
  function buildToolbar() {
    const bar = el('div', 'loc-toolbar');
    bar.innerHTML = ''
      + group('Subtree', ['Balanced', 'Center', 'Left', 'Right', 'Alternate', 'AlternateLeft', 'AlternateRight', 'Matrix'].map((m) => btn('mode', m, m)).join(''))
      + group('Orient', [['TopToBottom', 'Top'], ['BottomToTop', 'Bottom'], ['LeftToRight', 'Left'], ['RightToLeft', 'Right']].map(([o, l]) => btn('orient', o, l)).join(''))
      + group('', '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button>')
      + group('Grid', '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>')
      + group('Export', '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>');
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.mode) setSubtreeMode(b.dataset.mode);
      else if (b.dataset.orient) setOrientation(b.dataset.orient);
      else if (b.dataset.flag) { state[b.dataset.flag] = !state[b.dataset.flag]; if (b.dataset.flag === 'showGrid') applyGridOverlay(); else if (b.dataset.flag === 'alignGrid') { manualOffsets = Object.create(null); refresh(); } syncToolbar(); persist(); }
      else switch (b.dataset.act) {
        case 'expand': expandAll(); break;
        case 'collapse': collapseAll(); break;
        case 'fit': fitToScreen(); break;
        case 'relayout': relayout(); break;
        case 'png': exportPNG(3); break;
        case 'svg': exportSVG(); break;
        case 'pdf': exportPDF(); break;
        case 'json': exportJSON(true); break;
      }
    });
    return bar;
    function group(label, inner) { return `<div class="loc-group">${label ? `<span class="loc-label">${label}</span>` : ''}${inner}</div>`; }
    function btn(attr, val, label) { return `<button data-${attr}="${val}">${label}</button>`; }
  }
  function syncToolbar() {
    if (!toolbarEl) return;
    toolbarEl.querySelectorAll('button[data-mode]').forEach((b) => b.classList.toggle('loc-active', b.dataset.mode === state.subtreeMode));
    toolbarEl.querySelectorAll('button[data-orient]').forEach((b) => b.classList.toggle('loc-active', b.dataset.orient === state.orientation));
    toolbarEl.querySelectorAll('button[data-flag]').forEach((b) => b.classList.toggle('loc-active', !!state[b.dataset.flag]));
  }

  // ================= boot =================
  restore();
  syncToolbar();
  applyGridOverlay();
  refresh();
  if (opts.fitOnInit) fitToScreen();

  // ================= destroy =================
  let destroyed = false;
  function destroy() {
    if (destroyed) return; destroyed = true;
    listeners.forEach(({ target, type, fn, optsL }) => target.removeEventListener(type, fn, optsL));
    listeners.length = 0;
    if (dragRaf) cancelAnimationFrame(dragRaf);
    root.remove();
    for (const k in elById) delete elById[k];
    for (const k in pathById) delete pathById[k];
    for (const k in hitById) delete hitById[k];
  }

  // ================= public API =================
  const api = {
    root,
    setNodes, loadJSON, setOrientation, setSubtreeMode, setSpacing, setOption,
    fitToScreen, relayout, expandAll, collapseAll, toggleCollapse, centerOnNode,
    search, clearSearch, exportJSON, exportSVG, exportPNG, exportPDF, buildSVG,
    getState: () => ({ ...state }),
    getNodes: () => NODES.map((n) => ({ ...n })),
    getPositioned: () => positioned,
    on, off, destroy,
  };
  return api;
}
