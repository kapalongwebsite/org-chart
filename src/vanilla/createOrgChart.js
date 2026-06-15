// Plain-JavaScript renderer for the org chart. Builds its own DOM inside the
// host element, wires pan/zoom/drag/waypoint editing, and drives everything
// through the framework-independent core. Returns an instance with a clean
// method surface and a destroy() that removes all DOM + listeners.
import {
  makeNode, indexNodes, layoutOrgChart, normalizeConfig, isHorizontal,
  routeConnector, edgeEndpoints, edgeControlPoints, orthoThrough, effCenter,
  searchNodes as coreSearch, calculateBounds, fitBounds,
  childCount, computeDepths, normalizeImported, exportLayout, buildChartSVG,
  resolveNodeStyle, normalizeRule,
} from '../core/index.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const FIT_MIN = 0.5;

// Short orientation aliases → canonical names. Applied at EVERY entry point
// (constructor, setOrientation, setSettings, setNodes/meta, restore) so the
// shorthand resolves consistently no matter how the value arrives.
const ORIENTATION_ALIASES = { Top: 'TopToBottom', Bottom: 'BottomToTop', Left: 'LeftToRight', Right: 'RightToLeft' };
function normalizeOrientation(o) { return ORIENTATION_ALIASES[o] || o; }

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
  editMode: false,    // when true: drag nodes, edit lines, edit fields in the panel
  inspector: true,    // show the slide-in inspector panel on node click (false = headless: emit node-select only)
  inspectorSlot: false, // leave the inspector body empty for an external (Vue) slot
  inspectorTarget: null, // mount the inspector drawer into an external element (selector or node) instead of the canvas
  nodeSlots: false,   // render empty positioned hosts (Vue teleports card content in)
  fullscreenControl: true, // show the floating fullscreen button on the canvas
  fitOnInit: true,
  toolbar: true,      // true | false | { subtree, orient, actions, grid, mode, export }
  persist: false,
  storageKey: 'local-org-chart.state',
};

export function createOrgChart(host, userOpts = {}) {
  if (!host || !host.appendChild) throw new Error('createOrgChart: first argument must be a DOM element.');
  const opts = Object.assign({}, DEFAULT_OPTS, userOpts);

  // ---- per-instance state ----
  const state = {
    orientation: normalizeOrientation(opts.orientation), subtreeMode: opts.subtreeMode,
    spacingX: opts.spacingX, spacingY: opts.spacingY,
    zoom: 1, panX: 0, panY: 0,
    selectedNodeId: null, selectedEdgeId: null,
    gridSize: opts.gridSize, showGrid: opts.showGrid,
    snapGrid: opts.snapGrid, alignGrid: opts.alignGrid,
    editMode: !!opts.editMode,
  };
  let NODES = (opts.nodes || []).map(makeNode);
  let nodeById = indexNodes(NODES);
  let manualOffsets = Object.create(null);
  let edgeWaypoints = Object.create(null);
  let edgeAnchors = Object.create(null);     // childId -> { p:{nx,ny}, c:{nx,ny} } manual line endpoints
  let nodeOverrides = Object.create(null);   // id -> {field: value} manual node edits (persisted overlay)
  let themeRules = ((opts.settings && opts.settings.themeRules) || opts.themeRules || []).map(normalizeRule);
  let idCounter = 0;
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

  // floating canvas-level fullscreen control (opt-out via fullscreenControl: false)
  let fsFloat = null;
  if (opts.fullscreenControl) {
    fsFloat = el('button', 'loc-fsbtn'); fsFloat.type = 'button';
    fsFloat.title = 'Fullscreen'; fsFloat.setAttribute('aria-label', 'Toggle fullscreen');
    fsFloat.innerHTML = '⛶';
    addL(fsFloat, 'click', (e) => { e.stopPropagation(); toggleFullscreen(); });
    canvas.appendChild(fsFloat);
  }
  root.appendChild(canvas);

  // right slide-in inspector panel
  const panel = el('div', 'loc-panel');
  panel.innerHTML =
    '<div class="loc-panel-head"><span class="loc-panel-title">Node</span>'
    + '<button class="loc-panel-close" title="Close" data-role="panel-close">✕</button></div>'
    + '<div class="loc-panel-body" data-role="panel-body"></div>'
    + '<div class="loc-panel-foot" data-role="panel-foot"></div>';
  // The drawer lives inside the canvas by default, but `inspectorTarget` can
  // mount it into any external element (so it can sit outside the chart).
  const inspectorHost = resolveTarget(opts.inspectorTarget) || canvas;
  inspectorHost.appendChild(panel);
  if (inspectorHost !== canvas) panel.classList.add('loc-panel-external');
  const panelBody = panel.querySelector('[data-role="panel-body"]');
  const panelFoot = panel.querySelector('[data-role="panel-foot"]');
  const panelTitle = panel.querySelector('.loc-panel-title');

  // left slide-in settings panel
  const settingsPanel = el('div', 'loc-settings');
  settingsPanel.innerHTML =
    '<div class="loc-panel-head"><span class="loc-panel-title">Settings</span>'
    + '<button class="loc-panel-close" title="Close" data-role="settings-close">✕</button></div>'
    + '<div class="loc-panel-body" data-role="settings-body"></div>';
  canvas.appendChild(settingsPanel);
  const settingsBody = settingsPanel.querySelector('[data-role="settings-body"]');

  host.appendChild(root);

  function el(tag, cls) { const d = document.createElement(tag); if (cls) d.className = cls; return d; }
  /* resolve a selector string or element to a mountable node; null if not usable */
  function resolveTarget(t) {
    if (!t) return null;
    const node = typeof t === 'string' ? document.querySelector(t) : t;
    return (node && node.appendChild) ? node : null;
  }

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
      if (!opts.nodeSlots) {
        if (!elNode.dataset.fitted) { fitNodeText(elNode); elNode.dataset.fitted = '1'; }
        applyTheme(elNode, n);
      }
      elNode.classList.toggle('loc-selected', state.selectedNodeId === n.id);
      updateToggle(elNode, n);
    }
    for (const id in elById) if (!seen[id]) { elById[id].remove(); delete elById[id]; }
    emit('nodes-rendered', { ids: positioned.map((p) => p.node.id) });
  }
  function buildNodeEl(n) {
    // host mode: empty positioned shell; the consumer (Vue #node slot) fills it
    if (opts.nodeSlots) {
      const h = el('div', 'loc-node loc-node-host loc-' + n.type + (n.status ? ' loc-status-' + n.status : ''));
      h.dataset.id = n.id;
      h.innerHTML = '<div class="loc-node-slot"></div>';
      if (n.type === 'department') { const t = el('div', 'loc-toggle'); t.dataset.role = 'toggle'; h.appendChild(t); }
      return h;
    }
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
      const d = routeConnector(parent, p, cfg(), manualOffsets, edgeWaypoints, edgeAnchors);
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
    const d = routeConnector(parent, child, cfg(), manualOffsets, edgeWaypoints, edgeAnchors);
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
    // rect lets a headless/external inspector position itself next to the node.
    emit('node-select', { id, node: nodeById[id], rect: nodeScreenRect(id) });
    if (opts.inspector) openInspector(id);
    if (opts.readonly || !opts.enableDragging || !state.editMode) return;
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
  /* the selected node's on-screen rectangle (viewport coords), or null */
  function nodeScreenRect(id) {
    const e = elById[id]; if (!e) return null;
    const r = e.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
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
    return edgeControlPoints(parent, child, wps, cfg(), manualOffsets, edgeAnchors[id]);
  }
  function renderedHandleSegments(controls) {
    const out = [], horizontal = isHorizontal(cfg());
    for (let i = 0; i < controls.length - 1; i++) {
      const pts = orthoThrough([controls[i], controls[i + 1]], horizontal);
      for (let j = 0; j < pts.length - 1; j++) out.push({ a: pts[j], b: pts[j + 1], insert: i });
    }
    return out;
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
  function mkRect(x, y, r, cls) {
    const c = createNS('rect'); c.setAttribute('x', x - r); c.setAttribute('y', y - r);
    c.setAttribute('width', 2 * r); c.setAttribute('height', 2 * r); c.setAttribute('rx', 2 / state.zoom);
    c.setAttribute('class', cls); return c;
  }
  function renderEdgeHandles() {
    edgeHandlesG.innerHTML = '';
    const id = state.selectedEdgeId; if (!id || opts.readonly) return;
    const controls = controlsFor(id); if (!controls) return;
    const wps = edgeWaypoints[id] || [];
    const r = 6 / state.zoom, ra = 5 / state.zoom;
    // Outside edit mode a selected line still SHOWS its waypoints (read-only) so
    // you can see where they are; the interactive add/endpoint handles below are
    // only rendered in edit mode.
    if (!state.editMode) {
      for (let i = 0; i < wps.length; i++) { const c = mkCircle(wps[i].x, wps[i].y, r, 'loc-wp-handle loc-wp-readonly'); c.dataset.wp = i; edgeHandlesG.appendChild(c); }
      return;
    }
    for (const seg of renderedHandleSegments(controls)) {
      const c = mkCircle((seg.a.x + seg.b.x) / 2, (seg.a.y + seg.b.y) / 2, ra, 'loc-wp-add');
      c.dataset.add = seg.insert; edgeHandlesG.appendChild(c);
    }
    for (let i = 0; i < wps.length; i++) { const c = mkCircle(wps[i].x, wps[i].y, r, 'loc-wp-handle'); c.dataset.wp = i; edgeHandlesG.appendChild(c); }
    // endpoint anchors: square = where the line meets the box (drag to move;
    // drag the parent-end onto another box to re-parent; dbl-click it to detach)
    const S = controls[0], E = controls[controls.length - 1];
    const pe = mkRect(S.x, S.y, 6 / state.zoom, 'loc-ep loc-ep-parent'); pe.dataset.ep = 'parent'; edgeHandlesG.appendChild(pe);
    const ce = mkRect(E.x, E.y, 6 / state.zoom, 'loc-ep loc-ep-child'); ce.dataset.ep = 'child'; edgeHandlesG.appendChild(ce);
  }
  /* nearest point on a node's box perimeter, as normalized [-1,1] offsets */
  function perimeterAnchor(posNode, pt) {
    const c = effCenter(posNode, manualOffsets), w = posNode.node.width, h = posNode.node.height;
    let nx = (pt.x - c.x) / (w / 2), ny = (pt.y - c.y) / (h / 2);
    const m = Math.max(Math.abs(nx), Math.abs(ny));
    if (m > 1e-6) { nx /= m; ny /= m; }
    return { nx: Math.max(-1, Math.min(1, nx)), ny: Math.max(-1, Math.min(1, ny)) };
  }
  /* topmost node whose box contains pt, excluding this edge's child + its subtree */
  function nodeAtContentPoint(pt, edgeId) {
    const banned = new Set([edgeId].concat(descendantsOf(edgeId)));
    for (let i = positioned.length - 1; i >= 0; i--) {
      const p = positioned[i]; if (banned.has(p.node.id)) continue;
      const c = effCenter(p, manualOffsets);
      if (pt.x >= c.x - p.node.width / 2 && pt.x <= c.x + p.node.width / 2
        && pt.y >= c.y - p.node.height / 2 && pt.y <= c.y + p.node.height / 2) return p.node.id;
    }
    return null;
  }
  let reparentTarget = null;
  function highlightReparentTarget(id) {
    if (reparentTarget && elById[reparentTarget]) elById[reparentTarget].classList.remove('loc-reparent-target');
    reparentTarget = id;
    if (id && elById[id]) elById[id].classList.add('loc-reparent-target');
  }
  function onEpMove(e) {
    if (!edgeDrag || edgeDrag.kind !== 'ep') return;
    const id = edgeDrag.id, child = posById[id]; if (!child) return;
    const parent = posById[child.node.parentId]; if (!parent) return;
    const pt = clientToContent(e.clientX, e.clientY);
    edgeAnchors[id] = edgeAnchors[id] || {};
    if (edgeDrag.which === 'child') {
      edgeAnchors[id].c = perimeterAnchor(child, pt);
    } else {
      edgeAnchors[id].p = perimeterAnchor(parent, pt);
      const tgt = nodeAtContentPoint(pt, id);
      highlightReparentTarget(tgt && tgt !== child.node.parentId ? tgt : null);
    }
    updateEdgeGeom(id); renderEdgeHandles();
  }
  function onEpUp() {
    const d = edgeDrag; edgeDrag = null;
    rmWin('pointermove', onEpMove); rmWin('pointerup', onEpUp);
    if (d && d.which === 'parent' && reparentTarget) { const t = reparentTarget; highlightReparentTarget(null); reparentNode(d.id, t); return; }
    highlightReparentTarget(null); persist();
  }
  function reparentNode(id, newParentId) {
    const n = nodeById[id]; if (!n || newParentId === id) return;
    if (newParentId && descendantsOf(id).indexOf(newParentId) >= 0) return;   // no cycles
    n.parentId = newParentId || '';
    nodeOverrides[id] = Object.assign(nodeOverrides[id] || {}, { parentId: n.parentId });
    delete edgeWaypoints[id]; delete edgeAnchors[id];
    state.selectedEdgeId = null; edgeHandlesG.innerHTML = '';
    if (posById[id]) Object.assign(posById[id].node, { parentId: n.parentId });
    refresh();
    emit('node-change', { id, node: { ...n }, patch: { parentId: n.parentId }, reparented: true });
    persist();
  }
  function detachNode(id) { reparentNode(id, ''); }
  function distToSeg(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
    let t = L2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2 : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }
  function nearestSegment(controls, pt) {
    const segments = renderedHandleSegments(controls);
    let best = 0, bestD = Infinity;
    for (const seg of segments) { const d = distToSeg(pt, seg.a, seg.b); if (d < bestD) { bestD = d; best = seg.insert; } }
    return best;
  }

  // ================= edit mode + inspector + node editing =================
  const SUBMODES = ['', 'Balanced', 'Center', 'Left', 'Right', 'Alternate', 'AlternateLeft', 'AlternateRight', 'Matrix'];
  function escAttr(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function applyEditModeUI() { root.classList.toggle('loc-edit', state.editMode); }
  function setEditMode(on) {
    state.editMode = !!on;
    applyEditModeUI(); syncToolbar();
    if (!state.editMode) deselectEdge();
    if (panel.classList.contains('loc-open')) renderInspector();
    emit('edit-mode-change', { editMode: state.editMode });
    persist();
  }
  function openInspector(id) {
    if (!opts.inspector) return;
    state.selectedNodeId = id;
    panel.classList.add('loc-open');
    renderInspector();
    emit('inspector-open', { id, node: nodeById[id] });
  }
  function closeInspector() {
    if (!panel.classList.contains('loc-open')) return;
    panel.classList.remove('loc-open');
    emit('inspector-close', {});
  }
  function renderInspector() {
    const id = state.selectedNodeId, n = id && nodeById[id];
    if (!n) { closeInspector(); return; }
    panelTitle.textContent = n.label || n.personName || n.id;
    if (opts.inspectorSlot) { panelFoot.innerHTML = ''; return; }  // body filled by the external slot
    const ed = state.editMode, dis = ed ? '' : ' disabled';
    const inp = (f, v, t) => `<input data-field="${f}" type="${t || 'text'}" value="${escAttr(v)}"${dis}/>`;
    const sel = (f, v, opt) => `<select data-field="${f}"${dis}>` + opt.map((o) => {
      const val = Array.isArray(o) ? o[0] : o, lbl = Array.isArray(o) ? o[1] : (o || '—');
      return `<option value="${escAttr(val)}"${String(val) === String(v == null ? '' : v) ? ' selected' : ''}>${lbl}</option>`;
    }).join('') + '</select>';
    const fld = (label, html) => `<label class="loc-field"><span>${label}</span>${html}</label>`;
    let h = fld('ID', `<input value="${escAttr(n.id)}" disabled/>`)
      + fld('Type', sel('type', n.type, [['department', 'department'], ['position', 'position']]))
      + fld('Label', inp('label', n.label));
    if (n.type !== 'department') {
      h += fld('Person name', inp('personName', n.personName))
        + fld('Status', sel('status', n.status, [['', '—'], ['FILLED', 'FILLED'], ['VACANT', 'VACANT'], ['UNFUNDED', 'UNFUNDED']]))
        + fld('Photo URL', inp('photo_url', (n.data && n.data.photo_url) || ''));
    }
    h += fld('Layout override', sel('layoutMode', n.layoutMode || '', SUBMODES.map((m) => [m, m || '(inherit)'])))
      + fld('Width', inp('width', n.width, 'number'))
      + fld('Height', inp('height', n.height, 'number'));
    panelBody.innerHTML = h;
    panelFoot.innerHTML = ed
      ? '<button data-role="add-child">+ Add child</button>'
        + (n.parentId ? '<button data-role="detach">Detach</button>' : '')
        + '<button data-role="del-node" class="loc-danger">Delete</button>'
      : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  function genId() { let id; do { id = 'node-' + (++idCounter); } while (nodeById[id]); return id; }
  /* apply a field patch to a node + record it as a persisted overlay */
  function updateNode(id, patch) {
    const n = nodeById[id]; if (!n) return;
    Object.assign(n, patch);
    // layout works on node COPIES; keep the positioned copy in sync for non-structural redraws
    if (posById[id] && posById[id].node !== n) Object.assign(posById[id].node, patch);
    nodeOverrides[id] = Object.assign(nodeOverrides[id] || {}, patch);
    const structural = ['type', 'width', 'height', 'layoutMode'].some((k) => k in patch);
    if (elById[id]) { elById[id].remove(); delete elById[id]; }   // rebuild the card content
    if (structural) refresh(); else { drawNodes(); }
    emit('node-change', { id, node: { ...n }, patch });
    persist();
  }
  function descendantsOf(id) {
    const out = [], stack = [id];
    while (stack.length) { const p = stack.pop(); for (const n of NODES) if (n.parentId === p) { out.push(n.id); stack.push(n.id); } }
    return out;
  }
  function addChild(parentId) {
    if (!state.editMode) return;
    const id = genId();
    const node = makeNode({ id, parentId: parentId || '', type: 'position', label: 'NEW POSITION', personName: '', status: '' });
    NODES.push(node); nodeById[id] = node;
    nodeOverrides[id] = Object.assign({ __new: true }, node);
    refresh(); selectNode(id); openInspector(id);
    emit('node-change', { id, node: { ...node }, added: true }); persist();
  }
  function deleteNode(id) {
    if (!state.editMode || !id) return;
    const ids = [id].concat(descendantsOf(id)), set = new Set(ids);
    NODES = NODES.filter((n) => !set.has(n.id)); nodeById = indexNodes(NODES);
    ids.forEach((x) => { nodeOverrides[x] = { __deleted: true }; if (elById[x]) { elById[x].remove(); delete elById[x]; } });
    if (set.has(state.selectedNodeId)) { state.selectedNodeId = null; closeInspector(); }
    refresh(); emit('node-change', { id, removed: true, ids }); persist();
  }
  /* re-apply the persisted edit overlay onto the current NODES (after props/restore) */
  function applyOverrides() {
    const del = new Set(Object.keys(nodeOverrides).filter((k) => nodeOverrides[k] && nodeOverrides[k].__deleted));
    if (del.size) NODES = NODES.filter((n) => !del.has(n.id));
    nodeById = indexNodes(NODES);
    for (const id in nodeOverrides) {
      const ov = nodeOverrides[id]; if (!ov || ov.__deleted) continue;
      if (ov.__new) {
        if (!nodeById[id]) { const rest = Object.assign({}, ov); delete rest.__new; const node = makeNode(rest); NODES.push(node); nodeById[id] = node; }
      } else if (nodeById[id]) { Object.assign(nodeById[id], ov); }
    }
  }

  // ================= settings + conditional theming =================
  const RULE_FIELDS = [['type', 'Type'], ['status', 'Status'], ['level', 'Level (data.level)'],
    ['unit', 'Unit (data.unit)'], ['id', 'Node id'], ['label', 'Label']];
  function applyTheme(elNode, n) {
    const st = resolveNodeStyle(n, themeRules);
    setVar(elNode, '--loc-node-bg', st && st.bg);
    setVar(elNode, '--loc-node-text', st && st.text);
    setVar(elNode, '--loc-node-border', st && st.border);
  }
  function setVar(elNode, name, val) { if (val) elNode.style.setProperty(name, val); else elNode.style.removeProperty(name); }
  function applyThemeAll() { for (const id in elById) if (nodeById[id]) applyTheme(elById[id], nodeById[id]); }
  function getSettings() {
    return {
      spacingX: state.spacingX, spacingY: state.spacingY, gridSize: state.gridSize,
      orientation: state.orientation, subtreeMode: state.subtreeMode,
      showGrid: state.showGrid, snapGrid: state.snapGrid, alignGrid: state.alignGrid,
      themeRules: themeRules.map((r) => ({ enabled: r.enabled, field: r.field, value: r.value, style: Object.assign({}, r.style) })),
    };
  }
  function setSettings(s, o) {
    s = s || {};
    if (typeof s.spacingX === 'number') state.spacingX = s.spacingX;
    if (typeof s.spacingY === 'number') state.spacingY = s.spacingY;
    if (typeof s.gridSize === 'number') state.gridSize = s.gridSize;
    if (s.orientation) state.orientation = normalizeOrientation(s.orientation);
    if (s.subtreeMode) state.subtreeMode = s.subtreeMode;
    if ('showGrid' in s) state.showGrid = !!s.showGrid;
    if ('snapGrid' in s) state.snapGrid = !!s.snapGrid;
    if ('alignGrid' in s) state.alignGrid = !!s.alignGrid;
    if (Array.isArray(s.themeRules)) themeRules = s.themeRules.map(normalizeRule);
    applyGridOverlay(); syncToolbar(); refresh();
    if (settingsPanel.classList.contains('loc-open')) renderSettings();
    if (!(o && o.silent)) emit('settings-change', getSettings());
    persist();
  }
  function toggleSettings(force) {
    const open = force == null ? !settingsPanel.classList.contains('loc-open') : !!force;
    settingsPanel.classList.toggle('loc-open', open);
    if (toolbarEl) toolbarEl.querySelectorAll('button[data-act="settings"]').forEach((b) => b.classList.toggle('loc-active', open));
    if (open) renderSettings();
  }
  function setRange(key, label, val, min, max) {
    return `<label class="loc-field"><span>${label}: <b data-rangelabel="${key}">${val}</b></span>`
      + `<input type="range" data-set="${key}" min="${min}" max="${max}" value="${val}"/></label>`;
  }
  function colorField(i, key, label, val) {
    return `<label class="loc-color"><input type="checkbox" data-rule="${i}" data-rk="${key}-on"${val ? ' checked' : ''}/>`
      + `<span>${label}</span><input type="color" data-rule="${i}" data-rk="${key}" value="${val || '#e0524d'}"/></label>`;
  }
  function ruleRow(r, i) {
    const opt = (v, l) => `<option value="${v}"${r.field === v ? ' selected' : ''}>${l}</option>`;
    return `<div class="loc-rule">`
      + `<div class="loc-rule-top">`
      + `<input type="checkbox" data-rule="${i}" data-rk="enabled"${r.enabled ? ' checked' : ''} title="enable rule"/>`
      + `<select data-rule="${i}" data-rk="field">` + RULE_FIELDS.map(([v, l]) => opt(v, l)).join('') + `</select>`
      + `<input class="loc-rule-val" data-rule="${i}" data-rk="value" placeholder="value" value="${escAttr(r.value)}"/>`
      + `<button class="loc-rule-del" data-rule="${i}" data-rk="remove" title="Remove rule">✕</button></div>`
      + `<div class="loc-rule-colors">`
      + colorField(i, 'bg', 'BG', r.style.bg) + colorField(i, 'text', 'Text', r.style.text) + colorField(i, 'border', 'Border', r.style.border)
      + `</div></div>`;
  }
  function renderSettings() {
    let h = '<div class="loc-set-section"><div class="loc-set-title">Layout</div>'
      + setRange('spacingX', 'Spacing X', state.spacingX, 0, 200)
      + setRange('spacingY', 'Spacing Y', state.spacingY, 0, 260)
      + setRange('gridSize', 'Grid size', state.gridSize, 6, 80)
      + '</div>';
    h += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div>'
      + '<div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>';
    themeRules.forEach((r, i) => { h += ruleRow(r, i); });
    h += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>';
    settingsBody.innerHTML = h;
  }
  function colorOn(i, ck) { const c = settingsBody.querySelector(`[data-rule="${i}"][data-rk="${ck}-on"]`); return c && c.checked; }
  function colorVal(i, ck) { const c = settingsBody.querySelector(`[data-rule="${i}"][data-rk="${ck}"]`); return c ? c.value : ''; }

  // ================= persistence =================
  function persist() {
    if (!opts.persist) return;
    try {
      localStorage.setItem(opts.storageKey, JSON.stringify({
        orientation: state.orientation, subtreeMode: state.subtreeMode,
        spacingX: state.spacingX, spacingY: state.spacingY,
        zoom: state.zoom, panX: state.panX, panY: state.panY,
        showGrid: state.showGrid, snapGrid: state.snapGrid, alignGrid: state.alignGrid, gridSize: state.gridSize,
        editMode: state.editMode,
        manualOffsets, edgeWaypoints, edgeAnchors, nodeOverrides, themeRules,
        collapsed: NODES.filter((n) => n.collapsed).map((n) => n.id),
      }));
    } catch (e) { /* quota / unavailable — ignore */ }
  }
  function restore() {
    if (!opts.persist) return;
    let s; try { s = JSON.parse(localStorage.getItem(opts.storageKey) || 'null'); } catch (e) { s = null; }
    if (!s) return;
    if (s.orientation) state.orientation = normalizeOrientation(s.orientation);
    if (s.subtreeMode) state.subtreeMode = s.subtreeMode;
    ['spacingX', 'spacingY', 'zoom', 'panX', 'panY', 'gridSize'].forEach((k) => { if (typeof s[k] === 'number') state[k] = s[k]; });
    state.showGrid = !!s.showGrid; state.snapGrid = !!s.snapGrid; state.alignGrid = !!s.alignGrid;
    state.editMode = !!s.editMode;
    if (s.manualOffsets) manualOffsets = s.manualOffsets;
    if (s.edgeWaypoints) edgeWaypoints = s.edgeWaypoints;
    if (s.edgeAnchors) edgeAnchors = s.edgeAnchors;
    if (s.nodeOverrides) { nodeOverrides = s.nodeOverrides; applyOverrides(); }
    if (Array.isArray(s.themeRules)) themeRules = s.themeRules.map(normalizeRule);
    if (Array.isArray(s.collapsed)) { const set = new Set(s.collapsed); for (const n of NODES) n.collapsed = set.has(n.id); }
  }

  // ================= export =================
  function exportJSON(download) {
    const payload = exportLayout(state, NODES, manualOffsets, edgeWaypoints);
    payload.editMode = state.editMode;
    payload.edgeAnchors = edgeAnchors;
    payload.nodeOverrides = nodeOverrides;
    payload.settings = getSettings();
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
  function setNodes(nodes, meta, opts2) {
    const keepEdits = !(opts2 && opts2.resetEdits);
    NODES = (nodes || []).map(makeNode); nodeById = indexNodes(NODES);
    manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); edgeAnchors = Object.create(null);
    if (!keepEdits) nodeOverrides = Object.create(null);
    state.selectedNodeId = null; state.selectedEdgeId = null; searchMatches = new Set();
    closeInspector();
    for (const id in elById) { elById[id].remove(); delete elById[id]; }
    for (const id in pathById) { pathById[id].remove(); delete pathById[id]; }
    for (const id in hitById) { hitById[id].remove(); delete hitById[id]; }
    if (meta) {
      if (meta.subtreeMode) state.subtreeMode = meta.subtreeMode;
      if (meta.orientation) state.orientation = normalizeOrientation(meta.orientation);
      if (meta.manualOffsets) manualOffsets = meta.manualOffsets;
      if (meta.edgeWaypoints) edgeWaypoints = meta.edgeWaypoints;
      if (meta.edgeAnchors) edgeAnchors = meta.edgeAnchors;
      if (meta.nodeOverrides) { nodeOverrides = meta.nodeOverrides; }
      if (typeof meta.editMode === 'boolean') state.editMode = meta.editMode;
      if (meta.settings && Array.isArray(meta.settings.themeRules)) themeRules = meta.settings.themeRules.map(normalizeRule);
    }
    if (keepEdits) applyOverrides();   // re-layer persisted node edits onto the new data
    applyEditModeUI(); syncToolbar(); refresh();
    if (opts.fitOnInit) fitToScreen();
  }
  function loadJSON(data) { const { nodes, meta } = normalizeImported(data); setNodes(nodes, meta); return nodes.length; }
  function setOrientation(o) {
    const orientation = normalizeOrientation(o);
    state.orientation = orientation; manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); edgeAnchors = Object.create(null); deselectEdge(); syncToolbar(); refresh(); emit('orientation-change', { orientation });
  }
  function setSubtreeMode(m) { state.subtreeMode = m; manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); edgeAnchors = Object.create(null); deselectEdge(); syncToolbar(); refresh(); emit('subtree-mode-change', { subtreeMode: m }); }
  function setSpacing(x, y) {
    if (x != null) state.spacingX = x; if (y != null) state.spacingY = y;
    refresh(); emit('settings-change', getSettings());
  }
  function setOption(key, val) {
    if (key in state) {
      state[key] = val;
      if (key === 'showGrid') applyGridOverlay();
      if (key === 'alignGrid') { manualOffsets = Object.create(null); refresh(); }
      syncToolbar(); persist();
      if (['showGrid', 'snapGrid', 'alignGrid', 'gridSize'].includes(key)) emit('settings-change', getSettings());
    }
    else opts[key] = val;
  }
  function setShowGrid(on) { setOption('showGrid', !!on); return state.showGrid; }
  function setSnapToGrid(on) { setOption('snapGrid', !!on); return state.snapGrid; }
  function setAlignToGrid(on) { setOption('alignGrid', !!on); return state.alignGrid; }
  function toggleGrid(force) { return setShowGrid(force == null ? !state.showGrid : force); }
  function relayout() { manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); edgeAnchors = Object.create(null); deselectEdge(); refresh(); }
  function resetView() {
    clearSearch();
    closeInspector();
    relayout();
    fitToScreen();
  }

  // ================= fullscreen =================
  function fullscreenElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function isFullscreen() { return fullscreenElement() === root; }
  function enterFullscreen() {
    const fn = root.requestFullscreen || root.webkitRequestFullscreen;
    if (fn) { try { const p = fn.call(root); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignore */ } }
  }
  function exitFullscreen() {
    const fn = document.exitFullscreen || document.webkitExitFullscreen;
    if (fn && fullscreenElement()) { try { fn.call(document); } catch (e) { /* ignore */ } }
  }
  function toggleFullscreen(force) {
    const want = force == null ? !isFullscreen() : !!force;
    if (want) enterFullscreen(); else exitFullscreen();
    return want;
  }
  function onFullscreenChange() {
    const fs = isFullscreen();
    root.classList.toggle('loc-fullscreen', fs);
    if (fsFloat) fsFloat.title = fs ? 'Exit fullscreen' : 'Fullscreen';
    syncToolbar();
    fitToScreen();
    emit('fullscreen-change', { fullscreen: fs });
  }

  // ================= global interaction wiring =================
  addL(nodesLayer, 'pointerdown', (e) => { const el2 = e.target.closest('.loc-node'); if (el2) onNodePointerDown(e, el2.dataset.id); });
  addL(nodesLayer, 'click', (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !opts.readonly) { toggleCollapse(t.closest('.loc-node').dataset.id); return; }
    const node = e.target.closest('.loc-node'); if (node) emit('node-click', { id: node.dataset.id, node: nodeById[node.dataset.id] });
  });

  addL(edgeHitsG, 'pointerdown', (e) => { const t = e.target.closest('path'); if (!t) return; e.stopPropagation(); selectEdge(t.dataset.edge); });
  addL(edgeHitsG, 'dblclick', (e) => {
    if (opts.readonly || !state.editMode) return;
    const t = e.target.closest('path'); if (!t) return;
    const id = t.dataset.edge; selectEdge(id);
    const controls = controlsFor(id); if (!controls) return;
    const pt = snapPoint(clientToContent(e.clientX, e.clientY));
    const arr = edgeWaypoints[id] || (edgeWaypoints[id] = []);
    arr.splice(nearestSegment(controls, pt), 0, pt);
    updateEdgeGeom(id); renderEdgeHandles(); persist();
  });
  addL(edgeHandlesG, 'pointerdown', (e) => {
    if (opts.readonly || !state.editMode) return;
    const t = e.target, id = state.selectedEdgeId; if (!id) return;
    if (t.dataset.ep) {   // endpoint anchor drag (parent-end can re-parent)
      e.stopPropagation(); e.preventDefault();
      edgeDrag = { id, kind: 'ep', which: t.dataset.ep };
      addWin('pointermove', onEpMove); addWin('pointerup', onEpUp); return;
    }
    let idx;
    if (t.dataset.wp != null) idx = +t.dataset.wp;
    else if (t.dataset.add != null) { const s = +t.dataset.add; const wps = edgeWaypoints[id] || (edgeWaypoints[id] = []); wps.splice(s, 0, snapPoint(clientToContent(e.clientX, e.clientY))); idx = s; updateEdgeGeom(id); }
    else return;
    e.stopPropagation(); e.preventDefault();
    edgeDrag = { id, idx }; addWin('pointermove', onHandleMove); addWin('pointerup', onHandleUp);
  });
  addL(edgeHandlesG, 'dblclick', (e) => {
    const t = e.target;
    if (t.dataset.ep === 'parent') { detachNode(state.selectedEdgeId); return; }  // detach -> make root
    if (t.dataset.wp == null) return;
    const id = state.selectedEdgeId, wps = edgeWaypoints[id]; if (!wps) return;
    wps.splice(+t.dataset.wp, 1); if (!wps.length) delete edgeWaypoints[id];
    updateEdgeGeom(id); renderEdgeHandles(); persist();
  });
  function onHandleMove(e) { if (!edgeDrag) return; const wps = edgeWaypoints[edgeDrag.id]; if (!wps) return; wps[edgeDrag.idx] = snapPoint(clientToContent(e.clientX, e.clientY)); updateEdgeGeom(edgeDrag.id); renderEdgeHandles(); }
  function onHandleUp() { edgeDrag = null; rmWin('pointermove', onHandleMove); rmWin('pointerup', onHandleUp); persist(); }

  // inspector panel
  addL(panel, 'click', (e) => {
    if (e.target.closest('[data-role="panel-close"]')) { closeInspector(); return; }
    if (e.target.closest('[data-role="add-child"]')) { addChild(state.selectedNodeId); return; }
    if (e.target.closest('[data-role="detach"]')) { detachNode(state.selectedNodeId); return; }
    if (e.target.closest('[data-role="del-node"]')) { deleteNode(state.selectedNodeId); return; }
  });
  addL(panelBody, 'input', (e) => {
    if (!state.editMode) return;
    const t = e.target.closest('[data-field]'); if (!t) return;
    const id = state.selectedNodeId; if (!id) return;
    const f = t.dataset.field; let v = t.value;
    if (f === 'type') { updateNode(id, { type: v }); renderInspector(); return; }
    if (f === 'width' || f === 'height') { updateNode(id, { [f]: Math.max(20, parseFloat(v) || 0) }); return; }
    if (f === 'photo_url') { const n = nodeById[id]; updateNode(id, { data: Object.assign({}, n.data, { photo_url: v || null }) }); return; }
    if (f === 'layoutMode') { updateNode(id, { layoutMode: v || null }); return; }
    updateNode(id, { [f]: v });
  });

  // settings panel
  addL(settingsPanel, 'click', (e) => {
    if (e.target.closest('[data-role="settings-close"]')) { toggleSettings(false); return; }
    if (e.target.closest('[data-role="add-rule"]')) {
      themeRules.push(normalizeRule({ field: 'type', value: '', style: {} }));
      renderSettings(); applyThemeAll(); persist(); emit('settings-change', getSettings()); return;
    }
    const del = e.target.closest('[data-rk="remove"]');
    if (del) { themeRules.splice(+del.dataset.rule, 1); renderSettings(); applyThemeAll(); persist(); emit('settings-change', getSettings()); }
  });
  addL(settingsBody, 'input', (e) => {
    const t = e.target;
    if (t.dataset.set != null) {
      const v = parseFloat(t.value); state[t.dataset.set] = v;
      const lab = settingsBody.querySelector(`[data-rangelabel="${t.dataset.set}"]`); if (lab) lab.textContent = v;
      refresh(); emit('settings-change', getSettings()); persist(); return;
    }
    if (t.dataset.rule != null) {
      const i = +t.dataset.rule, rk = t.dataset.rk, r = themeRules[i]; if (!r) return;
      if (rk === 'enabled') r.enabled = t.checked;
      else if (rk === 'field') r.field = t.value;
      else if (rk === 'value') r.value = t.value;
      else if (rk === 'bg' || rk === 'text' || rk === 'border') { if (colorOn(i, rk)) r.style[rk] = t.value; }
      else if (/-on$/.test(rk)) { const ck = rk.replace('-on', ''); r.style[ck] = t.checked ? (colorVal(i, ck) || '#e0524d') : ''; }
      applyThemeAll(); emit('settings-change', getSettings()); persist();
    }
  });

  // pan — the current node/edge selection is PRESERVED while panning; only a
  // click on empty space (a press that doesn't turn into a drag) clears it.
  addL(canvas, 'pointerdown', (e) => {
    if (e.target.closest('.loc-node') || e.target.closest('.loc-edgehits path')
        || e.target.closest('.loc-edgehandles *') || e.target.closest('.loc-panel')
        || e.target.closest('.loc-settings') || e.target.closest('.loc-fsbtn')) {
      return; // node / edge / handle / panel / control interaction — don't pan or deselect
    }
    const clearSelection = () => {
      if (state.selectedNodeId) { if (elById[state.selectedNodeId]) elById[state.selectedNodeId].classList.remove('loc-selected'); state.selectedNodeId = null; }
      if (state.selectedEdgeId) deselectEdge();
      closeInspector();
    };
    if (!opts.enablePan) { clearSelection(); return; }
    const sx = e.clientX, sy = e.clientY, px = state.panX, py = state.panY;
    let moved = false;
    canvas.classList.add('loc-panning');
    const mv = (ev) => {
      if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 3) moved = true;
      state.panX = px + (ev.clientX - sx); state.panY = py + (ev.clientY - sy); applyTransform();
    };
    const up = () => {
      canvas.classList.remove('loc-panning'); rmWin('pointermove', mv); rmWin('pointerup', up);
      if (!moved) clearSelection();   // a click (not a pan) on empty space clears selection
    };
    addWin('pointermove', mv); addWin('pointerup', up);
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
    const tcfg = (opts.toolbar && typeof opts.toolbar === 'object') ? opts.toolbar : {};
    const show = (g) => tcfg[g] !== false;          // each group defaults visible
    const bar = el('div', 'loc-toolbar');
    let html = '';
    if (show('subtree')) html += group('Subtree', ['Balanced', 'Center', 'Left', 'Right', 'Alternate', 'AlternateLeft', 'AlternateRight', 'Matrix'].map((m) => btn('mode', m, m)).join(''));
    if (show('orient')) html += group('Orient', [['TopToBottom', 'Top'], ['BottomToTop', 'Bottom'], ['LeftToRight', 'Left'], ['RightToLeft', 'Right']].map(([o, l]) => btn('orient', o, l)).join(''));
    if (show('actions')) html += group('', '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button><button data-act="reset">Reset</button><button data-act="fullscreen" title="Toggle fullscreen">Fullscreen</button>');
    if (show('search')) html += group('Search', '<input type="search" data-role="search" class="loc-search-input" placeholder="Search…" />');
    if (show('grid')) html += group('Grid', '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>');
    if (show('mode')) html += group('Mode', '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="settings" title="Settings &amp; theming">Settings</button>');
    if (show('export')) html += group('Export', '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>');
    bar.innerHTML = html;
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
        case 'reset': resetView(); break;
        case 'fullscreen': toggleFullscreen(); break;
        case 'edit': setEditMode(!state.editMode); break;
        case 'settings': toggleSettings(); break;
        case 'png': exportPNG(3); break;
        case 'svg': exportSVG(); break;
        case 'pdf': exportPDF(); break;
        case 'json': exportJSON(true); break;
      }
    });
    bar.addEventListener('input', (e) => {
      const s = e.target.closest('[data-role="search"]'); if (s) search(s.value);
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
    toolbarEl.querySelectorAll('button[data-act="edit"]').forEach((b) => b.classList.toggle('loc-active', state.editMode));
    toolbarEl.querySelectorAll('button[data-act="fullscreen"]').forEach((b) => b.classList.toggle('loc-active', isFullscreen()));
  }

  // keep toolbar/float button + emitted event in sync with the browser's
  // fullscreen state (covers Esc / F11 exits too)
  addL(document, 'fullscreenchange', onFullscreenChange);
  addL(document, 'webkitfullscreenchange', onFullscreenChange);

  // ================= boot =================
  restore();
  syncToolbar();
  applyGridOverlay();
  applyEditModeUI();
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
    setShowGrid, setSnapToGrid, setAlignToGrid, toggleGrid,
    fitToScreen, relayout, resetView, expandAll, collapseAll, toggleCollapse, centerOnNode,
    search, clearSearch, exportJSON, exportSVG, exportPNG, exportPDF, buildSVG,
    setEditMode, isEditMode: () => state.editMode,
    enterFullscreen, exitFullscreen, toggleFullscreen, isFullscreen,
    updateNode, addChild, deleteNode, reparentNode, detachNode,
    openInspector, closeInspector, nodeScreenRect,
    getSettings, setSettings, toggleSettings,
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (id) => elById[id] || null,
    getNodeSlotEl: (id) => (elById[id] ? elById[id].querySelector('.loc-node-slot') : null),
    getInspectorBody: () => panelBody,
    nodeThemeStyle: (id) => (nodeById[id] ? resolveNodeStyle(nodeById[id], themeRules) : null),
    getState: () => ({ ...state }),
    getNodes: () => NODES.map((n) => ({ ...n })),
    getPositioned: () => positioned,
    on, off, destroy,
  };
  return api;
}
