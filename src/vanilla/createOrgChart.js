// Plain-JavaScript renderer for the org chart. Builds its own DOM inside the
// host element, wires pan/zoom/drag/waypoint editing, and drives everything
// through the framework-independent core. Returns an instance with a clean
// method surface and a destroy() that removes all DOM + listeners.
import {
  makeNode, indexNodes, layoutOrgChart, normalizeConfig, isHorizontal,
  routeConnector, edgeEndpoints, edgeControlPoints, orthoThrough, effCenter,
  searchNodes as coreSearch, calculateBounds, fitBounds,
  childCount, computeDepths, normalizeImported, exportLayout, buildChartSVG,
  resolveNodeStyle, normalizeRule, POS_SIZE,
} from '../core/index.js';

// person-card height = photo height + this fixed text block, so the image always
// "tops" the card at its full size and the name/title area stays consistent.
const CARD_TEXT_BLOCK = 68;

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
  snapAlign: true,    // while dragging, snap to the parent's connector axis + sibling centers (with guide lines)
  enableDragging: true,
  enablePan: true,
  enableZoom: true,
  readonly: false,
  editMode: false,    // when true: drag nodes, edit lines, edit fields in the panel
  inspector: true,    // show the slide-in inspector panel on node click (false = headless: emit node-select only)
  inspectorSlot: false, // leave the inspector body empty for an external (Vue) slot
  inspectorTarget: null, // mount the inspector drawer into an external element (selector or node) instead of the canvas
  settingsTarget: null,  // mount the settings drawer into an external element (selector or node) instead of the canvas
  settingsSlot: false,   // leave the settings body empty for an external (Vue) slot
  nodeSlots: false,   // render empty positioned hosts (Vue teleports card content in)
  fullscreenControl: true, // show the floating fullscreen button on the canvas
  autoEdgeSide: false,     // (opt-in) connector endpoints follow waypoints onto any box side (L/R/top/bottom)
  legend: false,           // show a floating legend (type / status / active theme rules); toggle via toolbar
  legendTarget: null,      // mount the legend into an external element instead of the canvas corner
  legendSlot: false,       // leave the legend body empty for an external (Vue #legend) slot
  photoHeight: 104,        // person-photo height in px (uniform across cards; bigger = larger profile image)
  cardWidth: POS_SIZE.width, // person-card width in px (global; card height = photoHeight + text block)
  photoContain: true,      // fit the WHOLE profile image inside the photo area (no crop); false = cover/crop
  showImages: true,        // show person photos; when off (or no photo) a user-silhouette icon is drawn
  // optional async person lookup for the inspector's "Person name" field. A function
  //   (query, node) => Promise<Array<user>> | Array<user>
  // turns the field into a typeahead so you can pick a user from your own backend API.
  userSearch: null,
  // map a chosen user object to a node field patch (default: name/title/photo_url)
  userToFields: null,
  fitOnLayoutChange: true, // re-frame after mode/orientation/re-layout: true|'fit' · 'recenter' · false|'none'
  fitOnInit: true,
  toolbar: true,      // true | false | { subtree, orient, actions, grid, mode, export }
  persist: false,
  storageKey: 'local-org-chart.state',
};

export function createOrgChart(host, userOpts = {}) {
  if (!host || !host.appendChild) throw new Error('createOrgChart: first argument must be a DOM element.');
  const opts = Object.assign({}, DEFAULT_OPTS, userOpts);
  const MAX_ZOOM = +opts.maxZoom > 1 ? +opts.maxZoom : 4;   // how far the wheel can zoom in

  // ---- per-instance state ----
  const state = {
    orientation: normalizeOrientation(opts.orientation), subtreeMode: opts.subtreeMode,
    spacingX: opts.spacingX, spacingY: opts.spacingY,
    zoom: 1, panX: 0, panY: 0,
    selectedNodeId: null, selectedEdgeId: null,
    gridSize: opts.gridSize, showGrid: opts.showGrid,
    snapGrid: opts.snapGrid, alignGrid: opts.alignGrid,
    editMode: !!opts.editMode,
    showImages: opts.showImages !== false,
    showLegend: !!opts.legend,
    autoEdgeSide: !!opts.autoEdgeSide,
    photoHeight: +opts.photoHeight || 104,
    cardWidth: +opts.cardWidth || POS_SIZE.width,
    photoContain: opts.photoContain !== false,
  };
  let NODES = (opts.nodes || []).map(makeNode);
  let nodeById = indexNodes(NODES);
  let manualOffsets = Object.create(null);
  let edgeWaypoints = Object.create(null);
  let edgeAnchors = Object.create(null);     // childId -> { p:{nx,ny}, c:{nx,ny} } manual line endpoints
  let nodeOverrides = Object.create(null);   // id -> {field: value} manual node edits (persisted overlay)
  let selectedIds = new Set();               // multi-select set; state.selectedNodeId is the "primary" member
  let themeRules = ((opts.settings && opts.settings.themeRules) || opts.themeRules || []).map(normalizeRule);
  // snapshot of the as-configured settings — the target that resetSettings() restores to
  const INITIAL_SETTINGS = {
    spacingX: opts.spacingX, spacingY: opts.spacingY, gridSize: opts.gridSize,
    showGrid: !!opts.showGrid, snapGrid: !!opts.snapGrid, alignGrid: !!opts.alignGrid,
    themeRules: themeRules.map((r) => ({ enabled: r.enabled, field: r.field, value: r.value, style: Object.assign({}, r.style) })),
  };
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
  root.tabIndex = -1;   // focusable (not a tab-stop) so Ctrl+Z / Ctrl+Shift+Z reach the chart, scoped to it
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
  const alignG = document.createElementNS(SVGNS, 'g'); alignG.setAttribute('class', 'loc-aligns');
  overlay.appendChild(alignG);
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
  // like the inspector, the settings drawer can live in an external element.
  const settingsHost = resolveTarget(opts.settingsTarget) || canvas;
  settingsHost.appendChild(settingsPanel);
  if (settingsHost !== canvas) settingsPanel.classList.add('loc-panel-external');
  const settingsBody = settingsPanel.querySelector('[data-role="settings-body"]');

  // floating legend (type / status / active theme rules). Lives in the canvas
  // corner by default; `legendTarget` mounts it into any external element.
  const legendEl = el('div', 'loc-legend');
  legendEl.innerHTML = '<div class="loc-legend-head"><span class="loc-legend-title">Legend</span>'
    + '<button class="loc-legend-close" title="Hide legend" data-role="legend-close">✕</button></div>'
    + '<div class="loc-legend-body" data-role="legend-body"></div>';
  const legendHost = resolveTarget(opts.legendTarget) || canvas;
  legendHost.appendChild(legendEl);
  if (legendHost !== canvas) legendEl.classList.add('loc-legend-external');
  const legendBody = legendEl.querySelector('[data-role="legend-body"]');

  // uniform person-photo height + card width + image-fit (bigger profile images, all the same size)
  applyCardSizeVars();
  applyCardSizeToNodes();

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
      autoEdgeSide: state.autoEdgeSide,
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
    if (state.showLegend) renderLegend();   // keep the auto legend in sync with the data
    persist();
    emit('layout-change', { positioned, mode: state.subtreeMode, orientation: state.orientation });
  }
  /* Apply a structural change (parent/child wiring) WITHOUT visually moving anything.
     We snapshot every node's on-screen position, run the change + layout, then pin
     any node the relayout would have moved back to where it was (via manualOffsets).
     So "detach"/"attach" just add or remove a connection — the boxes stay put.
     A later Re-layout clears the pins and reflows normally. */
  function structuralEditKeepPositions(mutate) {
    const oldEff = Object.create(null);
    for (const p of positioned) oldEff[p.node.id] = effCenter(p, manualOffsets);
    mutate();
    runLayout();
    for (const p of positioned) {
      const o = oldEff[p.node.id]; if (!o) continue;          // brand-new node → keep its laid-out spot
      const dx = o.x - p.cx, dy = o.y - p.cy;
      // pin the node to where it was; if the relayout already lands it there, drop
      // any (now-stale) pin instead of leaving it — else it double-displaces.
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) manualOffsets[p.node.id] = { dx, dy };
      else delete manualOffsets[p.node.id];
    }
    sizeSvg(); drawConnectors(); drawNodes(); applyTransform(); applySearchDim(); persist();
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
      elNode.classList.toggle('loc-selected', selectedIds.has(n.id));
      elNode.classList.toggle('loc-primary', state.selectedNodeId === n.id && selectedIds.size > 1);
      updateToggle(elNode, n);
    }
    for (const id in elById) if (!seen[id]) { elById[id].remove(); delete elById[id]; }
    emit('nodes-rendered', { ids: positioned.map((p) => p.node.id) });
  }
  // ---- global card sizing (photo height + card width + image fit) ----
  function applyCardSizeVars() {
    root.style.setProperty('--loc-photo-h', (state.photoHeight || 104) + 'px');
    root.style.setProperty('--loc-photo-fit', state.photoContain ? 'contain' : 'cover');
  }
  /* push the global size onto every person card (departments keep their own size) */
  function applyCardSizeToNodes() {
    const w = Math.max(100, state.cardWidth || POS_SIZE.width);
    const h = Math.max(60, (state.photoHeight || 104) + CARD_TEXT_BLOCK);
    for (const n of NODES) if (n.type !== 'department') { n.width = w; n.height = h; }
  }
  /* change global card size / photo height / image fit, refit text + relayout */
  function setCardSize(o) {
    o = o || {};
    if (typeof o.width === 'number') state.cardWidth = Math.max(100, o.width);
    if (typeof o.photoHeight === 'number') state.photoHeight = Math.max(40, o.photoHeight);
    if ('contain' in o) state.photoContain = !!o.contain;
    applyCardSizeVars(); applyCardSizeToNodes();
    for (const id in elById) delete elById[id].dataset.fitted;   // re-fit text at the new size
    refresh(); persist(); emit('settings-change', getSettings());
  }

  // neutral user-silhouette placeholder drawn when images are off / missing / broken
  const USER_ICON = '<svg class="loc-usericon" viewBox="0 0 24 24" aria-hidden="true">'
    + '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
  function showUserIcon(photo) { photo.textContent = ''; photo.innerHTML = USER_ICON; }
  function buildNodeEl(n) {
    // host mode: empty positioned shell; the consumer (Vue #node slot) fills it
    if (opts.nodeSlots) {
      const h = el('div', 'loc-node loc-node-host loc-' + n.type + (n.status ? ' loc-status-' + n.status : ''));
      h.dataset.id = n.id;
      h.innerHTML = '<div class="loc-node-slot"></div>';
      h.appendChild(makeToggleEl());
      return h;
    }
    const d = el('div', 'loc-node loc-' + n.type + (n.status ? ' loc-status-' + n.status : ''));
    d.dataset.id = n.id;
    if (n.type === 'department') {
      d.innerHTML = '<span class="loc-lbl"></span>';
      d.querySelector('.loc-lbl').textContent = n.label;
      d.querySelector('.loc-lbl').title = n.label || '';
    } else {
      d.innerHTML = '<div class="loc-photo"></div><div class="loc-ptext">'
        + '<div class="loc-pname"></div><div class="loc-ptitle"></div><div class="loc-badge"></div></div>';
      const photo = d.querySelector('.loc-photo');
      const url = n.data && n.data.photo_url;
      // when images are toggled off, or there is no URL, fall back to a neutral
      // user-silhouette icon (the alt placeholder)
      if (state.showImages && url) {
        const img = new Image(); img.alt = n.personName || ''; img.referrerPolicy = 'no-referrer';
        img.onerror = () => { showUserIcon(photo); }; img.src = url; photo.appendChild(img);
      } else { showUserIcon(photo); }
      const pn = d.querySelector('.loc-pname'), pt = d.querySelector('.loc-ptitle');
      pn.textContent = n.personName || '—'; pn.title = n.personName || '';     // full text on hover when clamped
      pt.textContent = n.label; pt.title = n.label || '';
      const b = d.querySelector('.loc-badge');
      if (n.status) { b.textContent = n.status; b.className = 'loc-badge loc-' + n.status; } else b.remove();
    }
    d.appendChild(makeToggleEl());   // expand/collapse handle (shown only when the node has children)
    return d;
  }
  /* the +/- collapse handle that sits centered on the bottom edge of a node */
  function makeToggleEl() { const t = el('div', 'loc-toggle'); t.dataset.role = 'toggle'; return t; }
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
    t.textContent = n.collapsed ? '+' : '−';   // + when collapsed (has hidden children), − when expanded
    const tip = n.collapsed ? 'Expand' : 'Collapse';
    t.title = tip; t.setAttribute('aria-label', tip);
  }

  // ================= connectors =================
  function createNS(tag) { return document.createElementNS(SVGNS, tag); }
  function connectorD(p) {
    return routeConnector(posById[p.node.parentId], p, cfg(), manualOffsets, edgeWaypoints, edgeAnchors);
  }
  function drawConnectors() {
    const seen = Object.create(null);
    for (const p of positioned) {
      const n = p.node; if (!n.parentId) continue;
      const parent = posById[n.parentId]; if (!parent) continue;
      seen[n.id] = true;
      const d = connectorD(p);
      let path = pathById[n.id];
      if (!path) { path = createNS('path'); pathById[n.id] = path; svg.appendChild(path); }
      path.setAttribute('d', d); path.classList.toggle('loc-sel', state.selectedEdgeId === n.id);
      path.classList.toggle('loc-incident', isIncidentEdge(n));
      let hit = hitById[n.id];
      if (!hit) { hit = createNS('path'); hit.dataset.edge = n.id; hitById[n.id] = hit; edgeHitsG.appendChild(hit); }
      hit.setAttribute('d', d);
    }
    for (const id in pathById) if (!seen[id]) { pathById[id].remove(); delete pathById[id]; }
    for (const id in hitById) if (!seen[id]) { hitById[id].remove(); delete hitById[id]; }
    applyEdgeSelectionClasses();
    if (state.selectedEdgeId && !seen[state.selectedEdgeId]) deselectEdge(); else renderEdgeHandles();
  }
  function updateEdgeGeom(id) {
    const child = posById[id]; if (!child) return;
    const parent = posById[child.node.parentId]; if (!parent) return;
    const d = connectorD(child);
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
    // Track the FULL content bounds (incl. negative space from nodes dragged
    // above/left of the origin) so the grid + canvas extend to cover them.
    let minX = 0, minY = 0, maxX = 0, maxY = 0;
    for (const p of positioned) {
      const c = effCenter(p, manualOffsets), hw = p.node.width / 2, hh = p.node.height / 2;
      minX = Math.min(minX, c.x - hw - 80); minY = Math.min(minY, c.y - hh - 80);
      maxX = Math.max(maxX, c.x + hw + 80); maxY = Math.max(maxY, c.y + hh + 80);
    }
    svg.setAttribute('width', maxX); svg.setAttribute('height', maxY);
    overlay.setAttribute('width', maxX); overlay.setAttribute('height', maxY);
    const g = state.gridSize;
    gridEl.style.left = minX + 'px'; gridEl.style.top = minY + 'px';
    gridEl.style.width = (maxX - minX) + 'px'; gridEl.style.height = (maxY - minY) + 'px';
    gridEl.style.backgroundSize = g + 'px ' + g + 'px';
    // keep grid lines aligned to the content origin so they don't jump as bounds change
    gridEl.style.backgroundPosition = (((-minX) % g) + g) % g + 'px ' + ((((-minY) % g) + g) % g) + 'px';
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
  /* after a structural relayout (mode / orientation / re-layout) the new tree can
     sit elsewhere, leaving the old pan/zoom pointed at empty space. This re-frames
     per `fitOnLayoutChange`: 'fit' (frame all), 'recenter' (keep zoom, pan to it), 'none'. */
  function layoutChangeMode() {
    const v = opts.fitOnLayoutChange;
    if (v === true) return 'fit';
    if (v === false) return 'none';
    return (v === 'recenter' || v === 'none' || v === 'fit') ? v : 'fit';
  }
  function applyLayoutChangeView() {
    const mode = layoutChangeMode();
    if (mode === 'fit') { fitToScreen(); return; }
    if (mode === 'recenter') {
      const root = NODES.find((n) => !n.parentId);
      const id = (state.selectedNodeId && posById[state.selectedNodeId]) ? state.selectedNodeId : (root && root.id);
      if (id) centerOnNode(id);
    }
  }

  // ================= expand / collapse =================
  function expandAll() { for (const n of NODES) n.collapsed = false; refresh(); pushHistory(); }
  function collapseAll() {
    const depth = computeDepths(NODES, nodeById);
    for (const n of NODES) n.collapsed = (depth[n.id] >= 1 && childCount(NODES, n.id) > 0);
    refresh(); pushHistory();
  }
  /* Collapse/expand a single node WITHOUT re-flowing the rest of the chart — the
     other boxes stay exactly where they are (no stagger). Collapsing hides the whole
     subtree (children, grandchildren, …); expanding brings it back in place. A
     manual Re-layout reflows normally. */
  function toggleCollapse(id) {
    const n = nodeById[id]; if (!n) return;
    structuralEditKeepPositions(() => { n.collapsed = !n.collapsed; });
    applyIncident();
    pushHistory();
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
    focusRoot();
    if (attaching) { if (tryAttachTo(id)) return; }   // attach mode: this click picks the parent
    deselectEdge();
    // Ctrl/⌘+click toggles this node in the selection (multi-select) and does NOT
    // start a drag or open the inspector.
    if (e.ctrlKey || e.metaKey) { toggleInSelection(id); return; }
    // plain click: if the node is already part of a multi-selection, KEEP the set
    // (so we can group-drag); otherwise reset to a single selection.
    if (!selectedIds.has(id)) selectNode(id); else { state.selectedNodeId = id; applySelectionClasses(); applyIncident(); }
    emit('node-select', { id, node: nodeById[id], rect: nodeScreenRect(id) });
    if (opts.inspector) openInspector(id);
    if (opts.readonly || !opts.enableDragging || !state.editMode) return;
    // group drag when 2+ nodes are selected and this is one of them; else single.
    const groupIds = (selectedIds.has(id) && selectedIds.size > 1) ? [...selectedIds] : [id];
    const bases = Object.create(null);
    for (const gid of groupIds) { const o = manualOffsets[gid] || { dx: 0, dy: 0 }; bases[gid] = { dx: o.dx, dy: o.dy }; if (elById[gid]) elById[gid].classList.add('loc-dragging'); }
    drag = { id, groupIds, bases, startX: e.clientX, startY: e.clientY, moved: false };
    emit('node-drag-start', { id, node: nodeById[id], group: groupIds });
    addWin('pointermove', onNodePointerMove); addWin('pointerup', onNodePointerUp);
  }
  function onNodePointerMove(e) {
    if (!drag) return;
    // pointer delta in content space (applied uniformly to the whole group)
    let ddx = (e.clientX - drag.startX) / state.zoom;
    let ddy = (e.clientY - drag.startY) / state.zoom;
    if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 3) drag.moved = true;
    const base = posById[drag.id], pb = drag.bases[drag.id];
    if (base) {
      const ox = base.cx + pb.dx, oy = base.cy + pb.dy;   // primary's current (pre-move) center
      if (state.snapGrid) { const g = state.gridSize; ddx = Math.round((ox + ddx) / g) * g - ox; ddy = Math.round((oy + ddy) / g) * g - oy; }
      if (drag.groupIds.length === 1) {                    // align-snap only for a single node
        const snap = alignSnap(drag.id, ox + ddx, oy + ddy);
        ddx = snap.cx - ox; ddy = snap.cy - oy;
        drawAlignGuides(snap.gx, snap.gy);
      }
    }
    for (const gid of drag.groupIds) { const b = drag.bases[gid]; manualOffsets[gid] = { dx: b.dx + ddx, dy: b.dy + ddy }; }
    if (!dragRaf) dragRaf = requestAnimationFrame(() => {
      dragRaf = 0;
      for (const gid of drag.groupIds) { redrawNode(gid); redrawIncident(gid); }
      emit('node-drag', { id: drag.id, node: nodeById[drag.id], offset: manualOffsets[drag.id], group: drag.groupIds });
    });
  }
  function onNodePointerUp() {
    let moved = false;
    if (drag) {
      for (const gid of drag.groupIds) { if (elById[gid]) elById[gid].classList.remove('loc-dragging'); }
      emit('node-drag-end', { id: drag.id, node: nodeById[drag.id], offset: manualOffsets[drag.id], group: drag.groupIds });
      sizeSvg();   // a dragged node may extend the content bounds → grow grid/canvas now, not only on refresh
      moved = !!drag.moved;
    }
    drag = null;
    clearAlignGuides();
    rmWin('pointermove', onNodePointerMove); rmWin('pointerup', onNodePointerUp);
    persist();
    if (moved) pushHistory();   // one undo step per drag (whole group)
  }

  // ---- alignment snapping: snap a dragged node/waypoint to the parent's connector
  //      axis + sibling centers, and show guide lines while aligned ----
  const ALIGN_PX = 8;
  function alignSnap(id, cx, cy) {
    if (!opts.snapAlign) return { cx, cy, gx: null, gy: null };
    const node = nodeById[id]; if (!node) return { cx, cy, gx: null, gy: null };
    const th = ALIGN_PX / state.zoom, xs = [], ys = [];
    const parent = node.parentId && posById[node.parentId];
    if (parent) xs.push(effCenter(parent, manualOffsets).x);          // the parent's connector axis
    for (const q of positioned) {
      if (q.node.id === id || !node.parentId || q.node.parentId !== node.parentId) continue;
      const c = effCenter(q, manualOffsets); xs.push(c.x); ys.push(c.y); // siblings
    }
    let gx = null, bx = th; for (const x of xs) { const d = Math.abs(cx - x); if (d < bx) { bx = d; cx = x; gx = x; } }
    let gy = null, by = th; for (const y of ys) { const d = Math.abs(cy - y); if (d < by) { by = d; cy = y; gy = y; } }
    return { cx, cy, gx, gy };
  }
  function waypointAlignSnap(id, pt) {
    if (!opts.snapAlign) return pt;
    const child = posById[id]; if (!child) return pt;
    const parent = posById[child.node.parentId];
    const th = ALIGN_PX / state.zoom;
    const C = effCenter(child, manualOffsets);
    const xs = [C.x], ys = [C.y];                     // align to the child + parent center lines
    if (parent) { const P = effCenter(parent, manualOffsets); xs.push(P.x); ys.push(P.y); }
    let gx = null, bx = th, x = pt.x;
    for (const cx of xs) { const d = Math.abs(pt.x - cx); if (d < bx) { bx = d; x = cx; gx = cx; } }
    let gy = null, by = th, y = pt.y;                 // ...on BOTH axes, so the circle snaps left/right AND top/bottom
    for (const cy of ys) { const d = Math.abs(pt.y - cy); if (d < by) { by = d; y = cy; gy = cy; } }
    drawAlignGuides(gx, gy);
    return { x, y };
  }
  function drawAlignGuides(gx, gy) {
    alignG.innerHTML = '';
    const W = +overlay.getAttribute('width') || 0, H = +overlay.getAttribute('height') || 0;
    const line = (x1, y1, x2, y2) => { const l = createNS('line'); l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); l.setAttribute('class', 'loc-align-line'); alignG.appendChild(l); };
    if (gx != null) line(gx, 0, gx, H);
    if (gy != null) line(0, gy, W, gy);
  }
  function clearAlignGuides() { alignG.innerHTML = ''; }
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
  // ---- selection model: a SET of selected ids + a "primary" (state.selectedNodeId)
  //      that drives the inspector + incident highlight. selectNode() = single-select. ----
  function applySelectionClasses() {
    for (const id in elById) {
      elById[id].classList.toggle('loc-selected', selectedIds.has(id));
      elById[id].classList.toggle('loc-primary', state.selectedNodeId === id && selectedIds.size > 1);
    }
  }
  function emitSelection() { emit('selection-change', { ids: [...selectedIds], primary: state.selectedNodeId }); }
  function selectNode(id) {                       // single-select (replaces the whole set)
    selectedIds = new Set(id ? [id] : []);
    state.selectedNodeId = id || null;
    applySelectionClasses(); applyIncident();
  }
  /* Ctrl/⌘+click: toggle a node in the selection (Windows-11 style multi-select) */
  function toggleInSelection(id) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
      if (state.selectedNodeId === id) state.selectedNodeId = selectedIds.size ? [...selectedIds][selectedIds.size - 1] : null;
    } else {
      selectedIds.add(id); state.selectedNodeId = id;   // newly added becomes primary
    }
    applySelectionClasses(); applyIncident(); emitSelection();
  }
  function setSelectionSet(ids, primary) {
    selectedIds = new Set(ids);
    state.selectedNodeId = primary != null ? primary : (ids.length ? ids[ids.length - 1] : null);
    applySelectionClasses(); applyIncident(); emitSelection();
  }
  function clearNodeSelection() {
    selectedIds = new Set(); state.selectedNodeId = null;
    applySelectionClasses(); applyIncident();
  }
  /* Ctrl/⌘+drag on empty canvas: draw a marquee box and select the nodes inside it
     (hold Shift to add to the current selection). Selects by node center. */
  function startMarquee(e) {
    const p0 = clientToContent(e.clientX, e.clientY);
    const baseSet = e.shiftKey ? new Set(selectedIds) : new Set();
    const rect = createNS('rect'); rect.setAttribute('class', 'loc-marquee');
    overlay.appendChild(rect);
    canvas.classList.add('loc-marqueeing');
    let did = false;
    const apply = (ev) => {
      const p = clientToContent(ev.clientX, ev.clientY);
      const x = Math.min(p0.x, p.x), y = Math.min(p0.y, p.y), w = Math.abs(p.x - p0.x), h = Math.abs(p.y - p0.y);
      rect.setAttribute('x', x); rect.setAttribute('y', y); rect.setAttribute('width', w); rect.setAttribute('height', h);
      const hit = new Set(baseSet);
      for (const pp of positioned) { const c = effCenter(pp, manualOffsets); if (c.x >= x && c.x <= x + w && c.y >= y && c.y <= y + h) hit.add(pp.node.id); }
      selectedIds = hit; state.selectedNodeId = selectedIds.size ? [...selectedIds][selectedIds.size - 1] : null;
      applySelectionClasses(); applyIncident(); did = true;
    };
    const up = () => {
      rect.remove(); canvas.classList.remove('loc-marqueeing');
      rmWin('pointermove', apply); rmWin('pointerup', up);
      if (!did) { clearNodeSelection(); closeInspector(); }          // ctrl-click empty with no drag → clear
      else { emitSelection(); if (selectedIds.size === 1 && opts.inspector) openInspector([...selectedIds][0]); }
    };
    addWin('pointermove', apply); addWin('pointerup', up);
  }
  /* is this edge connected to ANY selected node (as parent OR child end)? — so a
     marquee / multi-selection highlights every incident connector, not just one. */
  function isIncidentEdge(n) {
    return selectedIds.has(n.id) || selectedIds.has(n.parentId);
  }

  // ---- connector (line) multi-selection: Alt+drag marquee picks lines ----
  let selectedEdges = new Set();
  function applyEdgeSelectionClasses() {
    for (const id in pathById) pathById[id].classList.toggle('loc-edge-selected', selectedEdges.has(id));
  }
  function clearEdgeSelection() {
    if (!selectedEdges.size) return;
    selectedEdges = new Set(); applyEdgeSelectionClasses(); emit('edges-select', { ids: [] });
  }
  function setEdgeSelection(ids) {
    selectedEdges = new Set((ids || []).filter((id) => pathById[id]));
    applyEdgeSelectionClasses(); emit('edges-select', { ids: [...selectedEdges] });
  }
  /* straighten the selected lines: drop their manual waypoints + endpoint anchors */
  function resetSelectedEdges() {
    if (!selectedEdges.size) return;
    let changed = false;
    for (const id of selectedEdges) {
      if (edgeWaypoints[id]) { delete edgeWaypoints[id]; changed = true; }
      if (edgeAnchors[id]) { delete edgeAnchors[id]; changed = true; }
    }
    if (!changed) return;
    if (state.selectedEdgeId && selectedEdges.has(state.selectedEdgeId)) deselectEdge();
    drawConnectors(); applyEdgeSelectionClasses(); persist(); pushHistory();
    emit('edges-reset', { ids: [...selectedEdges] });
  }
  function segSeg(ax, ay, bx, by, cx, cy, dx, dy) {
    const d = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
    if (Math.abs(d) < 1e-9) return false;
    const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / d;
    const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / d;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }
  function segIntersectsRect(a, b, x, y, w, h) {
    const x2 = x + w, y2 = y + h;
    const inside = (p) => p.x >= x && p.x <= x2 && p.y >= y && p.y <= y2;
    if (inside(a) || inside(b)) return true;
    return segSeg(a.x, a.y, b.x, b.y, x, y, x2, y) || segSeg(a.x, a.y, b.x, b.y, x2, y, x2, y2)
        || segSeg(a.x, a.y, b.x, b.y, x2, y2, x, y2) || segSeg(a.x, a.y, b.x, b.y, x, y2, x, y);
  }
  function edgeIntersectsRect(id, x, y, w, h) {
    const controls = controlsFor(id); if (!controls) return false;
    for (const s of renderedHandleSegments(controls)) if (segIntersectsRect(s.a, s.b, x, y, w, h)) return true;
    return false;
  }
  /* Alt+drag on empty canvas: rubber-band select connector LINES (Shift adds). The
     selected lines highlight; press Delete to straighten them, Esc to deselect. */
  function startLineMarquee(e) {
    const p0 = clientToContent(e.clientX, e.clientY);
    const base = e.shiftKey ? new Set(selectedEdges) : new Set();
    const rect = createNS('rect'); rect.setAttribute('class', 'loc-marquee loc-marquee-edge');
    overlay.appendChild(rect);
    canvas.classList.add('loc-marqueeing');
    let did = false;
    const apply = (ev) => {
      const p = clientToContent(ev.clientX, ev.clientY);
      const x = Math.min(p0.x, p.x), y = Math.min(p0.y, p.y), w = Math.abs(p.x - p0.x), h = Math.abs(p.y - p0.y);
      rect.setAttribute('x', x); rect.setAttribute('y', y); rect.setAttribute('width', w); rect.setAttribute('height', h);
      const hit = new Set(base);
      for (const id in pathById) if (edgeIntersectsRect(id, x, y, w, h)) hit.add(id);
      selectedEdges = hit; applyEdgeSelectionClasses(); did = true;
    };
    const up = () => {
      rect.remove(); canvas.classList.remove('loc-marqueeing');
      rmWin('pointermove', apply); rmWin('pointerup', up);
      if (!did) clearEdgeSelection();
      else emit('edges-select', { ids: [...selectedEdges] });
    };
    addWin('pointermove', apply); addWin('pointerup', up);
  }
  /* highlight every connector touching the selected node so you can see where it
     connects (both its parent edge and its child edges) */
  function applyIncident() {
    for (const id in pathById) {
      const p = posById[id];
      pathById[id].classList.toggle('loc-incident', !!p && isIncidentEdge(p.node));
    }
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
    selectedIds = new Set(); state.selectedNodeId = null; applySelectionClasses();
    state.selectedEdgeId = id;
    if (pathById[id]) pathById[id].classList.add('loc-sel');
    applyIncident();
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
  // snap a perimeter anchor toward the nearest SIDE MIDPOINT so an endpoint clicks
  // cleanly onto the center of any side — top, bottom, left OR right (not just top/bottom).
  const SIDE_SNAP = 0.34;
  function sideSnapAnchor(a) {
    let nx = a.nx, ny = a.ny;
    if (Math.abs(Math.abs(ny) - 1) < 1e-6 && Math.abs(nx) < SIDE_SNAP) nx = 0; // top/bottom → center X
    else if (Math.abs(Math.abs(nx) - 1) < 1e-6 && Math.abs(ny) < SIDE_SNAP) ny = 0; // left/right → center Y
    return { nx, ny };
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
    // grid-snap the drag point (so the endpoint square lands on the grid, like a
    // waypoint), then snap the resulting box anchor to the nearest side midpoint.
    const pt = snapPoint(clientToContent(e.clientX, e.clientY));
    edgeAnchors[id] = edgeAnchors[id] || {}; edgeDrag.changed = true;
    if (edgeDrag.which === 'child') {
      edgeAnchors[id].c = sideSnapAnchor(perimeterAnchor(child, pt));
    } else {
      edgeAnchors[id].p = sideSnapAnchor(perimeterAnchor(parent, pt));
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
    if (d && d.changed) pushHistory();   // an endpoint anchor was moved
  }
  /* change a node's parent (''/null = detach to a root). Positions are preserved —
     this only adds/removes the connection, it does not re-flow the chart. */
  function reparentNode(id, newParentId) {
    const n = nodeById[id]; if (!n || newParentId === id) return;
    if (newParentId && descendantsOf(id).indexOf(newParentId) >= 0) return;   // no cycles
    const pid = newParentId || '';
    if ((n.parentId || '') === pid) return;                                   // no change
    state.selectedEdgeId = null; edgeHandlesG.innerHTML = '';
    structuralEditKeepPositions(() => {
      n.parentId = pid;
      nodeOverrides[id] = Object.assign(nodeOverrides[id] || {}, { parentId: pid });
      delete edgeWaypoints[id]; delete edgeAnchors[id];
      if (posById[id]) Object.assign(posById[id].node, { parentId: pid });
    });
    applyIncident();
    // keep the open inspector in sync so its footer flips Detach <-> Attach…
    if (panel.classList.contains('loc-open') && state.selectedNodeId === id) renderInspector();
    emit('node-change', { id, node: { ...n }, patch: { parentId: pid }, reparented: true });
    pushHistory();
  }
  function detachNode(id) { reparentNode(id, ''); }
  function attachNode(id, parentId) { if (parentId) reparentNode(id, parentId); }

  // ---- interactive "Attach": pick this node, then click a target parent ----
  let attaching = null;
  function beginAttach(id) {
    if (!id) return;
    attaching = id; root.classList.add('loc-attaching');
    emit('attach-start', { id });
  }
  function cancelAttach() {
    if (!attaching) return;
    attaching = null; root.classList.remove('loc-attaching');
    emit('attach-cancel', {});
  }
  /* a node was clicked while in attach mode → wire it up as the new parent */
  function tryAttachTo(targetId) {
    const id = attaching;
    if (!id || !targetId || targetId === id) { cancelAttach(); return false; }
    if (descendantsOf(id).indexOf(targetId) >= 0) { cancelAttach(); return false; } // no cycles
    attaching = null; root.classList.remove('loc-attaching');
    attachNode(id, targetId);
    if (opts.inspector) openInspector(id);
    return true;
  }
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
  // 'Matrix' is intentionally omitted from the picker UIs — for uniform-height
  // cards it lays out identically to Balanced. It's still accepted by the API
  // (setSubtreeMode('Matrix') / a node's layoutMode) for mixed-height data.
  const SUBMODES = ['', 'Balanced', 'Center', 'Left', 'Right', 'Alternate', 'AlternateLeft', 'AlternateRight'];
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
      // when a userSearch function is supplied, the Person name field becomes a
      // typeahead backed by your API (results dropdown rendered below the input)
      h += opts.userSearch
        ? `<label class="loc-field loc-usersearch"><span>Person name</span>${inp('personName', n.personName)}`
          + '<div class="loc-usersearch-list" data-role="user-results" hidden></div></label>'
        : fld('Person name', inp('personName', n.personName));
      h += fld('Status', sel('status', n.status, [['', '—'], ['FILLED', 'FILLED'], ['VACANT', 'VACANT'], ['UNFUNDED', 'UNFUNDED']]))
        + fld('Photo URL', inp('photo_url', (n.data && n.data.photo_url) || ''));
    }
    h += fld('Layout override', sel('layoutMode', n.layoutMode || '', SUBMODES.map((m) => [m, m || '(inherit)'])))
      + fld('Width', inp('width', n.width, 'number'))
      + fld('Height', inp('height', n.height, 'number'));
    panelBody.innerHTML = h;
    panelFoot.innerHTML = ed
      ? '<button data-role="add-child">+ Add child</button>'
        + (n.parentId
          ? '<button data-role="detach">Detach</button>'
          : '<button data-role="attach">Attach…</button>')
        + '<button data-role="del-node" class="loc-danger">Delete</button>'
      : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  // ---- person-name typeahead backed by opts.userSearch (your backend API) ----
  let userSearchTimer = 0, userSearchSeq = 0;
  function runUserSearch(query) {
    if (!opts.userSearch) return;
    const box = panelBody.querySelector('[data-role="user-results"]'); if (!box) return;
    if (userSearchTimer) clearTimeout(userSearchTimer);
    const q = (query || '').trim();
    if (!q) { box.hidden = true; box.innerHTML = ''; return; }
    const seq = ++userSearchSeq;
    userSearchTimer = setTimeout(() => {
      try {
        Promise.resolve(opts.userSearch(q, nodeById[state.selectedNodeId]))
          .then((list) => { if (seq === userSearchSeq) renderUserResults(box, Array.isArray(list) ? list : []); })
          .catch(() => {});
      } catch (e) { /* ignore */ }
    }, 220);
  }
  function renderUserResults(box, list) {
    if (!list.length) { box.hidden = true; box.innerHTML = ''; return; }
    box.innerHTML = list.slice(0, 8).map((u, i) => {
      const name = escAttr(u.name || u.personName || u.label || '');
      const sub = escAttr(u.title || u.label || u.email || '');
      return `<button type="button" class="loc-usersearch-item" data-uidx="${i}"><b>${name}</b>${sub ? `<small>${sub}</small>` : ''}</button>`;
    }).join('');
    box.hidden = false; box._users = list;
  }
  function chooseUser(u) {
    const id = state.selectedNodeId, n = id && nodeById[id]; if (!n) return;
    let patch = opts.userToFields ? opts.userToFields(u, n) : null;
    if (!patch) {
      patch = {};
      const name = u.name || u.personName || u.label; if (name) patch.personName = name;
      if (u.title) patch.label = u.title;
      const photo = u.photo_url || u.avatar || u.image; if (photo) patch.photo_url = photo;
    }
    if ('photo_url' in patch) { const url = patch.photo_url; delete patch.photo_url; patch.data = Object.assign({}, n.data, { photo_url: url || null }); }
    updateNode(id, patch);
    const box = panelBody.querySelector('[data-role="user-results"]'); if (box) { box.hidden = true; box.innerHTML = ''; }
    renderInspector();
    emit('user-select', { id, user: u, node: { ...nodeById[id] } });
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
    // coalesce successive edits to the same field(s) of the same node into one step
    pushHistory('field:' + id + ':' + Object.keys(patch).join(','));
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
    emit('node-change', { id, node: { ...node }, added: true }); persist(); pushHistory();
  }
  function deleteNode(id) {
    if (!state.editMode || !id) return;
    const ids = [id].concat(descendantsOf(id)), set = new Set(ids);
    NODES = NODES.filter((n) => !set.has(n.id)); nodeById = indexNodes(NODES);
    ids.forEach((x) => { nodeOverrides[x] = { __deleted: true }; if (elById[x]) { elById[x].remove(); delete elById[x]; } selectedIds.delete(x); });
    if (set.has(state.selectedNodeId)) { state.selectedNodeId = selectedIds.size ? [...selectedIds][selectedIds.size - 1] : null; if (!state.selectedNodeId) closeInspector(); }
    refresh(); emit('node-change', { id, removed: true, ids }); persist(); pushHistory();
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
  function applyThemeAll() { for (const id in elById) if (nodeById[id]) applyTheme(elById[id], nodeById[id]); if (state.showLegend) renderLegend(); }

  // ================= legend =================
  const STATUS_LABELS = { FILLED: 'Filled', VACANT: 'Vacant', UNFUNDED: 'Unfunded' };
  function applyLegend() { legendEl.classList.toggle('loc-on', state.showLegend); if (state.showLegend) renderLegend(); }
  function setShowLegend(on) {
    state.showLegend = on == null ? !state.showLegend : !!on;
    applyLegend(); syncToolbar(); persist();
    emit('legend-change', { legend: state.showLegend });
    return state.showLegend;
  }
  function toggleLegend(force) { return setShowLegend(force == null ? !state.showLegend : force); }
  /* legend content is auto-derived from the data (types + statuses present) and the
     enabled theme rules — so it always matches what's on screen. */
  function renderLegend() {
    if (opts.legendSlot) return;   // body supplied by the external (#legend) slot
    const types = Object.create(null), statuses = Object.create(null);
    for (const n of NODES) { if (n.type) types[n.type] = true; if (n.status) statuses[n.status] = true; }
    let h = '';
    const typeRows = [];
    if (types.department) typeRows.push(legSwatch('loc-leg-dept', 'Department'));
    if (types.position) typeRows.push(legSwatch('loc-leg-pos', 'Position'));
    if (typeRows.length) h += legSection('Type', typeRows.join(''));
    const stRows = ['FILLED', 'VACANT', 'UNFUNDED'].filter((s) => statuses[s])
      .map((s) => `<div class="loc-leg-row"><span class="loc-leg-badge loc-${s}">${STATUS_LABELS[s] || s}</span></div>`);
    if (stRows.length) h += legSection('Status', stRows.join(''));
    const ruleRows = themeRules.filter((r) => r.enabled && (r.style.bg || r.style.border)).map((r) =>
      `<div class="loc-leg-row"><span class="loc-leg-swatch" style="background:${escAttr(r.style.bg || '#fff')};border-color:${escAttr(r.style.border || r.style.bg || '#d0d5dd')}"></span>`
      + `<span class="loc-leg-label">${escAttr(r.field)} = ${escAttr(r.value || '—')}</span></div>`).join('');
    if (ruleRows) h += legSection('Rules', ruleRows);
    legendBody.innerHTML = h || '<div class="loc-leg-empty">No legend items yet.</div>';
  }
  function legSection(title, rows) { return `<div class="loc-leg-section"><div class="loc-leg-title">${title}</div>${rows}</div>`; }
  function legSwatch(cls, label) { return `<div class="loc-leg-row"><span class="loc-leg-swatch ${cls}"></span><span class="loc-leg-label">${label}</span></div>`; }
  function getSettings() {
    return {
      spacingX: state.spacingX, spacingY: state.spacingY, gridSize: state.gridSize,
      orientation: state.orientation, subtreeMode: state.subtreeMode,
      showGrid: state.showGrid, snapGrid: state.snapGrid, alignGrid: state.alignGrid,
      showImages: state.showImages, autoEdgeSide: state.autoEdgeSide,
      cardWidth: state.cardWidth, photoHeight: state.photoHeight, photoContain: state.photoContain,
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
    if ('showImages' in s && !!s.showImages !== state.showImages) {
      state.showImages = !!s.showImages;
      for (const id in elById) { elById[id].remove(); delete elById[id]; }   // rebuild cards on image toggle
    }
    if ('autoEdgeSide' in s) state.autoEdgeSide = !!s.autoEdgeSide;
    let sized = false;
    if (typeof s.cardWidth === 'number') { state.cardWidth = Math.max(100, s.cardWidth); sized = true; }
    if (typeof s.photoHeight === 'number') { state.photoHeight = Math.max(40, s.photoHeight); sized = true; }
    if ('photoContain' in s) { state.photoContain = !!s.photoContain; sized = true; }
    if (sized) { applyCardSizeVars(); applyCardSizeToNodes(); for (const id in elById) delete elById[id].dataset.fitted; }
    if (Array.isArray(s.themeRules)) themeRules = s.themeRules.map(normalizeRule);
    applyGridOverlay(); syncToolbar(); refresh();
    if (settingsPanel.classList.contains('loc-open')) renderSettings();
    if (!(o && o.silent)) emit('settings-change', getSettings());
    persist();
  }
  function toggleSettings(force) {
    const wasOpen = settingsPanel.classList.contains('loc-open');
    const open = force == null ? !wasOpen : !!force;
    settingsPanel.classList.toggle('loc-open', open);
    if (toolbarEl) toolbarEl.querySelectorAll('button[data-act="settings"]').forEach((b) => b.classList.toggle('loc-active', open));
    if (open) renderSettings();
    if (open !== wasOpen) emit(open ? 'settings-open' : 'settings-close', {});
  }
  /* restore spacing / grid / theme rules to the as-configured defaults */
  function resetSettings() {
    setSettings({
      spacingX: INITIAL_SETTINGS.spacingX, spacingY: INITIAL_SETTINGS.spacingY, gridSize: INITIAL_SETTINGS.gridSize,
      showGrid: INITIAL_SETTINGS.showGrid, snapGrid: INITIAL_SETTINGS.snapGrid, alignGrid: INITIAL_SETTINGS.alignGrid,
      themeRules: INITIAL_SETTINGS.themeRules.map((r) => ({ enabled: r.enabled, field: r.field, value: r.value, style: Object.assign({}, r.style) })),
    });
    applyThemeAll();
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
  function presetsSectionHTML() {
    const list = listLayoutPresets();
    let rows = list.map((p) =>
      `<div class="loc-preset"><button class="loc-preset-apply" data-role="preset-apply" data-name="${escAttr(p.name)}" title="Apply this saved layout">${escAttr(p.name)}</button>`
      + `<span class="loc-preset-tag">${p.full ? 'full' : 'pattern'}</span>`
      + `<button class="loc-preset-del" data-role="preset-del" data-name="${escAttr(p.name)}" title="Delete preset">✕</button></div>`).join('');
    if (!rows) rows = '<div class="loc-set-hint">No saved presets yet.</div>';
    return '<div class="loc-set-section"><div class="loc-set-title">Presets</div>'
      + '<div class="loc-set-hint">Save the current arrangement so an accidental mode change can’t lose it (Undo / Ctrl+Z restores it too).</div>'
      + '<div class="loc-preset-save"><input type="text" data-role="preset-name" placeholder="Preset name…"/>'
      + '<label class="loc-preset-full"><input type="checkbox" data-role="preset-full" checked/> positions</label>'
      + '<button data-role="preset-save">Save</button></div>'
      + `<div class="loc-preset-list">${rows}</div></div>`;
  }
  function renderSettings() {
    if (opts.settingsSlot) return;   // body is filled by the external (Vue #settings) slot
    let h = presetsSectionHTML()
      + '<div class="loc-set-section"><div class="loc-set-title">Layout</div>'
      + setRange('spacingX', 'Spacing X', state.spacingX, 0, 200)
      + setRange('spacingY', 'Spacing Y', state.spacingY, 0, 260)
      + setRange('gridSize', 'Grid size', state.gridSize, 6, 80)
      + `<label class="loc-color"><input type="checkbox" data-set-toggle="showImages"${state.showImages ? ' checked' : ''}/><span>Show photos (off → user icon)</span></label>`
      + `<label class="loc-color"><input type="checkbox" data-set-toggle="autoEdgeSide"${state.autoEdgeSide ? ' checked' : ''}/><span>Smart edges (lines follow waypoints to any side)</span></label>`
      + '</div>';
    h += '<div class="loc-set-section"><div class="loc-set-title">Card size</div>'
      + '<div class="loc-set-hint">Applies to every person card. The photo tops the card at its full size; the name/title sit below.</div>'
      + setRange('cardWidth', 'Card width', state.cardWidth, 120, 320)
      + setRange('photoHeight', 'Photo height', state.photoHeight, 60, 240)
      + `<label class="loc-color"><input type="checkbox" data-set-toggle="photoContain"${state.photoContain ? ' checked' : ''}/><span>Show whole photo (no crop)</span></label>`
      + '</div>';
    h += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div>'
      + '<div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>';
    themeRules.forEach((r, i) => { h += ruleRow(r, i); });
    h += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>';
    h += '<div class="loc-set-foot"><button class="loc-set-reset" data-role="reset-settings" title="Restore spacing, grid &amp; theme rules to defaults">↺ Reset settings</button></div>';
    settingsBody.innerHTML = h;
  }
  function colorOn(i, ck) { const c = settingsBody.querySelector(`[data-rule="${i}"][data-rk="${ck}-on"]`); return c && c.checked; }
  function colorVal(i, ck) { const c = settingsBody.querySelector(`[data-rule="${i}"][data-rk="${ck}"]`); return c ? c.value : ''; }

  // ================= undo / redo =================
  // A bounded history of editable-state snapshots. Every "change" (move, edit,
  // add/delete, attach/detach, waypoint/anchor edit, collapse) pushes one entry;
  // typing into a field coalesces into a single step via a coalesce key.
  let history = [], histIndex = -1, applyingHistory = false, lastHistKey = null;
  function cloneData(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  // the view config (mode/orientation/spacing/grid/images/theme) — captured by
  // snapshots so an accidental subtree/orientation click is fully undoable, and
  // reused by the layout presets below.
  function viewConfig() {
    return {
      subtreeMode: state.subtreeMode, orientation: state.orientation,
      spacingX: state.spacingX, spacingY: state.spacingY, gridSize: state.gridSize,
      showGrid: state.showGrid, snapGrid: state.snapGrid, alignGrid: state.alignGrid,
      showImages: state.showImages, autoEdgeSide: state.autoEdgeSide,
      cardWidth: state.cardWidth, photoHeight: state.photoHeight, photoContain: state.photoContain,
      themeRules: themeRules.map((r) => ({ enabled: r.enabled, field: r.field, value: r.value, style: Object.assign({}, r.style) })),
    };
  }
  function applyViewConfig(v) {
    if (!v) return;
    if (v.subtreeMode) state.subtreeMode = v.subtreeMode;
    if (v.orientation) state.orientation = normalizeOrientation(v.orientation);
    ['spacingX', 'spacingY', 'gridSize'].forEach((k) => { if (typeof v[k] === 'number') state[k] = v[k]; });
    if ('showGrid' in v) state.showGrid = !!v.showGrid;
    if ('snapGrid' in v) state.snapGrid = !!v.snapGrid;
    if ('alignGrid' in v) state.alignGrid = !!v.alignGrid;
    if ('showImages' in v) state.showImages = !!v.showImages;
    if ('autoEdgeSide' in v) state.autoEdgeSide = !!v.autoEdgeSide;
    if (typeof v.cardWidth === 'number') state.cardWidth = Math.max(100, v.cardWidth);
    if (typeof v.photoHeight === 'number') state.photoHeight = Math.max(40, v.photoHeight);
    if ('photoContain' in v) state.photoContain = !!v.photoContain;
    applyCardSizeVars(); applyCardSizeToNodes();
    if (Array.isArray(v.themeRules)) themeRules = v.themeRules.map(normalizeRule);
  }
  function snapshot() {
    return {
      nodes: NODES.map((n) => cloneData(n)),
      manualOffsets: cloneData(manualOffsets),
      edgeWaypoints: cloneData(edgeWaypoints),
      edgeAnchors: cloneData(edgeAnchors),
      nodeOverrides: cloneData(nodeOverrides),
      view: viewConfig(),
      selectedNodeId: state.selectedNodeId,
    };
  }
  function restoreSnapshot(s) {
    applyingHistory = true;
    NODES = (s.nodes || []).map(makeNode); nodeById = indexNodes(NODES);
    manualOffsets = cloneData(s.manualOffsets) || Object.create(null);
    edgeWaypoints = cloneData(s.edgeWaypoints) || Object.create(null);
    edgeAnchors = cloneData(s.edgeAnchors) || Object.create(null);
    nodeOverrides = cloneData(s.nodeOverrides) || Object.create(null);
    applyViewConfig(s.view);   // restores mode/orientation/spacing too — so an accidental relayout undoes cleanly
    for (const id in elById) { elById[id].remove(); delete elById[id]; }
    for (const id in pathById) { pathById[id].remove(); delete pathById[id]; }
    for (const id in hitById) { hitById[id].remove(); delete hitById[id]; }
    state.selectedEdgeId = null; edgeHandlesG.innerHTML = '';
    state.selectedNodeId = (s.selectedNodeId && nodeById[s.selectedNodeId]) ? s.selectedNodeId : null;
    applyGridOverlay(); refresh();
    if (state.selectedNodeId) selectNode(state.selectedNodeId);
    if (panel.classList.contains('loc-open')) { if (state.selectedNodeId) renderInspector(); else closeInspector(); }
    if (settingsPanel.classList.contains('loc-open')) renderSettings();
    applyingHistory = false;
  }
  function pushHistory(key) {
    if (applyingHistory) return;
    const snap = snapshot();
    if (key != null && key === lastHistKey && histIndex >= 0) {
      history[histIndex] = snap;                       // coalesce successive same-key edits
    } else {
      history = history.slice(0, histIndex + 1);
      history.push(snap); histIndex = history.length - 1;
      if (history.length > 100) { history.shift(); histIndex--; }   // bound memory
    }
    lastHistKey = key != null ? key : null;
    emitHistory();
  }
  function resetHistory() { history = [snapshot()]; histIndex = 0; lastHistKey = null; emitHistory(); }
  function canUndo() { return histIndex > 0; }
  function canRedo() { return histIndex >= 0 && histIndex < history.length - 1; }
  function undo() { if (!canUndo()) return; histIndex--; lastHistKey = null; restoreSnapshot(history[histIndex]); emitHistory(); }
  function redo() { if (!canRedo()) return; histIndex++; lastHistKey = null; restoreSnapshot(history[histIndex]); emitHistory(); }
  function emitHistory() { syncToolbar(); emit('history-change', { canUndo: canUndo(), canRedo: canRedo() }); }

  // ================= persistence =================
  function persist() {
    if (!opts.persist) return;
    try {
      localStorage.setItem(opts.storageKey, JSON.stringify({
        orientation: state.orientation, subtreeMode: state.subtreeMode,
        spacingX: state.spacingX, spacingY: state.spacingY,
        zoom: state.zoom, panX: state.panX, panY: state.panY,
        showGrid: state.showGrid, snapGrid: state.snapGrid, alignGrid: state.alignGrid, gridSize: state.gridSize,
        editMode: state.editMode, showImages: state.showImages, showLegend: state.showLegend,
        autoEdgeSide: state.autoEdgeSide,
        cardWidth: state.cardWidth, photoHeight: state.photoHeight, photoContain: state.photoContain,
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
    if ('showImages' in s) state.showImages = !!s.showImages;
    if ('showLegend' in s) state.showLegend = !!s.showLegend;
    if ('autoEdgeSide' in s) state.autoEdgeSide = !!s.autoEdgeSide;
    if (typeof s.cardWidth === 'number') state.cardWidth = Math.max(100, s.cardWidth);
    if (typeof s.photoHeight === 'number') state.photoHeight = Math.max(40, s.photoHeight);
    if ('photoContain' in s) state.photoContain = !!s.photoContain;
    applyCardSizeVars(); applyCardSizeToNodes();
    if (s.manualOffsets) manualOffsets = s.manualOffsets;
    if (s.edgeWaypoints) edgeWaypoints = s.edgeWaypoints;
    if (s.edgeAnchors) edgeAnchors = s.edgeAnchors;
    if (s.nodeOverrides) { nodeOverrides = s.nodeOverrides; applyOverrides(); }
    if (Array.isArray(s.themeRules)) themeRules = s.themeRules.map(normalizeRule);
    if (Array.isArray(s.collapsed)) { const set = new Set(s.collapsed); for (const n of NODES) n.collapsed = set.has(n.id); }
  }

  // ================= layout presets =================
  // Named saved layouts in localStorage (key `${storageKey}.presets`), independent
  // of the `persist` flag. A preset is the view config and (optionally) the full
  // manual layout. The raw objects are exposed (getLayout / applyLayout /
  // getLayoutPresets) so you can round-trip them through your own backend API.
  function presetsKey() { return opts.storageKey + '.presets'; }
  function readPresets() { try { return JSON.parse(localStorage.getItem(presetsKey()) || '{}') || {}; } catch (e) { return {}; } }
  function writePresets(map) { try { localStorage.setItem(presetsKey(), JSON.stringify(map)); } catch (e) { /* quota / unavailable */ } }
  /* capture the current state as a portable layout object (full = include manual positions/edits) */
  function captureLayout(full) {
    const obj = { full: full !== false, view: viewConfig() };
    if (obj.full) obj.layout = {
      manualOffsets: cloneData(manualOffsets), edgeWaypoints: cloneData(edgeWaypoints),
      edgeAnchors: cloneData(edgeAnchors), nodeOverrides: cloneData(nodeOverrides),
      collapsed: NODES.filter((n) => n.collapsed).map((n) => n.id),
    };
    return obj;
  }
  function getLayout(o) { return captureLayout(!(o && o.full === false)); }
  /* apply a layout object (from a preset or your backend) onto the current data */
  function applyLayout(obj) {
    if (!obj) return;
    applyViewConfig(obj.view);
    if (obj.full && obj.layout) {
      manualOffsets = cloneData(obj.layout.manualOffsets) || Object.create(null);
      edgeWaypoints = cloneData(obj.layout.edgeWaypoints) || Object.create(null);
      edgeAnchors = cloneData(obj.layout.edgeAnchors) || Object.create(null);
      nodeOverrides = cloneData(obj.layout.nodeOverrides) || Object.create(null);
      applyOverrides();
      const cset = new Set(obj.layout.collapsed || []);
      for (const n of NODES) n.collapsed = cset.has(n.id);
    } else {
      manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); edgeAnchors = Object.create(null);  // pattern-only → fresh auto layout
    }
    state.selectedNodeId = null; state.selectedEdgeId = null; edgeHandlesG.innerHTML = '';
    for (const id in elById) { elById[id].remove(); delete elById[id]; }
    for (const id in pathById) { pathById[id].remove(); delete pathById[id]; }
    for (const id in hitById) { hitById[id].remove(); delete hitById[id]; }
    applyGridOverlay(); syncToolbar(); refresh();
    if (settingsPanel.classList.contains('loc-open')) renderSettings();
    applyLayoutChangeView(); pushHistory();
    emit('settings-change', getSettings());
  }
  function listLayoutPresets() {
    const m = readPresets();
    return Object.keys(m).map((name) => ({ name, full: !!m[name].full, savedAt: m[name].savedAt || null }));
  }
  function getLayoutPresets() { return readPresets(); }
  function saveLayoutPreset(name, o) {
    name = String(name == null ? '' : name).trim(); if (!name) return null;
    const obj = captureLayout(!(o && o.full === false));
    obj.name = name; obj.savedAt = Date.now();
    const m = readPresets(); m[name] = obj; writePresets(m);
    if (settingsPanel.classList.contains('loc-open')) renderSettings();
    emit('presets-change', { presets: listLayoutPresets() });
    return obj;
  }
  function loadLayoutPreset(name) {
    const obj = readPresets()[String(name)]; if (!obj) return false;
    applyLayout(obj); emit('preset-load', { name: String(name), preset: obj }); return true;
  }
  function deleteLayoutPreset(name) {
    const m = readPresets(); if (!(String(name) in m)) return false;
    delete m[String(name)]; writePresets(m);
    if (settingsPanel.classList.contains('loc-open')) renderSettings();
    emit('presets-change', { presets: listLayoutPresets() }); return true;
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
  function buildSVG(raster, images) {
    const paths = []; for (const id in pathById) paths.push(pathById[id].getAttribute('d'));
    return buildChartSVG(positioned, paths, {
      manualOffsets, raster: !!raster, measureText, fitOf,
      photoHeight: state.photoHeight, photoContain: state.photoContain, images: images || null,
    });
  }
  /* load a photo cross-origin and convert it to a base64 data URL so it can be
     embedded in the export (works in SVG + PNG/PDF, no canvas taint). Resolves to
     null if the image is missing or the host blocks CORS — caller falls back to a
     placeholder for that card. */
  function photoToDataURL(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
          if (!w || !h) { resolve(null); return; }
          const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0);
          resolve(cv.toDataURL('image/png'));
        } catch (e) { resolve(null); }      // tainted (no CORS headers) → give up on this one
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
  /* { photo_url -> dataURL } for every person card (skips ones that can't be embedded) */
  function collectPhotoData() {
    if (!state.showImages) return Promise.resolve({});
    const urls = [], seen = new Set();
    for (const n of NODES) {
      const u = n.type !== 'department' && n.data && n.data.photo_url;
      if (u && !seen.has(u)) { seen.add(u); urls.push(u); }
    }
    if (!urls.length) return Promise.resolve({});
    return Promise.all(urls.map((u) => photoToDataURL(u).then((d) => [u, d])))
      .then((pairs) => { const m = {}; for (const [u, d] of pairs) if (d) m[u] = d; return m; });
  }
  function exportSVG() {
    return collectPhotoData().then((images) => {
      const svg = buildSVG(false, images);
      downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'org-chart.svg');
      return svg;
    });
  }
  function exportPNG(scale) {
    scale = scale || 3;
    return collectPhotoData().then((images) => new Promise((resolve) => {
      const b = calculateBounds(positioned, manualOffsets, 40);
      const MAX_SIDE = 16000, MAX_AREA = 200e6;
      let s = Math.min(scale, MAX_SIDE / b.w, MAX_SIDE / b.h);
      if (b.w * s * b.h * s > MAX_AREA) s = Math.sqrt(MAX_AREA / (b.w * b.h));
      s = Math.max(0.05, s);
      const url = URL.createObjectURL(new Blob([buildSVG(true, images)], { type: 'image/svg+xml;charset=utf-8' }));
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas'); cv.width = Math.round(b.w * s); cv.height = Math.round(b.h * s);
        const ctx = cv.getContext('2d'); ctx.setTransform(s, 0, 0, s, 0, 0); ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        try { cv.toBlob((bl) => { if (bl) downloadBlob(bl, 'org-chart.png'); resolve(!!bl); }, 'image/png'); }
        catch (e) { resolve(false); /* taint */ }
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(false); };
      img.src = url;
    }));
  }
  /* Render the chart to a WebP — tuned for website display: balanced size vs.
     quality (scale 2, quality .82). Unlike the file-download exporters this
     RESOLVES the encoded image so it can be handed to your API / upload instead
     of forcing a download — no button needed, just `await chart.exportWebP()`.
       opt: {
         scale:    pixel multiplier (default 2),
         quality:  0..1 WebP quality (default .82),
         maxSide:  clamp longest side in px (default 4000, keeps files small),
         as:       'blob' (default) | 'dataURL',
         download: true to also save a file (default false),
         filename: download name (default 'org-chart.webp')
       }
     Resolves a Blob (or data-URL string), or null if encoding fails / the browser
     can't produce WebP. Photos are embedded just like the other exporters, so a
     CORS-blocked photo falls back to its placeholder. */
  function exportWebP(opt) {
    opt = opt || {};
    const scale = +opt.scale > 0 ? +opt.scale : 2;
    const quality = typeof opt.quality === 'number' ? Math.min(1, Math.max(0.3, opt.quality)) : 0.82;
    const maxSide = +opt.maxSide > 0 ? +opt.maxSide : 4000;
    const asDataURL = opt.as === 'dataURL' || opt.as === 'dataurl';
    const fname = opt.filename || 'org-chart.webp';
    return collectPhotoData().then((images) => new Promise((resolve) => {
      const b = calculateBounds(positioned, manualOffsets, 40);
      const MAX_AREA = 200e6;
      let s = Math.min(scale, maxSide / b.w, maxSide / b.h);
      if (b.w * s * b.h * s > MAX_AREA) s = Math.sqrt(MAX_AREA / (b.w * b.h));
      s = Math.max(0.05, s);
      const url = URL.createObjectURL(new Blob([buildSVG(true, images)], { type: 'image/svg+xml;charset=utf-8' }));
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = Math.round(b.w * s); cv.height = Math.round(b.h * s);
        const ctx = cv.getContext('2d'); ctx.setTransform(s, 0, 0, s, 0, 0); ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        try {
          if (asDataURL) {
            const durl = cv.toDataURL('image/webp', quality);
            if (opt.download) {
              const a = document.createElement('a'); a.href = durl; a.download = fname;
              document.body.appendChild(a); a.click(); a.remove();
            }
            resolve(durl); return;
          }
          cv.toBlob((bl) => {
            if (bl && opt.download) downloadBlob(bl, fname);
            resolve(bl || null);
          }, 'image/webp', quality);
        } catch (e) { resolve(null); /* taint / unsupported */ }
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    }));
  }
  function exportPDF() {
    return collectPhotoData().then((images) => {
      const w = window.open('', '_blank'); if (!w) return false;
      w.document.open();
      w.document.write('<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>'
        + buildSVG(false, images) + '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};</scr' + 'ipt></body></html>');
      w.document.close();
      return true;
    });
  }
  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // ================= public setters =================
  function setNodes(nodes, meta, opts2) {
    const keepEdits = !(opts2 && opts2.resetEdits);
    NODES = (nodes || []).map(makeNode); nodeById = indexNodes(NODES);
    // Positional edits (offsets / waypoints / anchors) now survive a data refresh
    // by default — same as node field edits — so a reactive `nodes` change no
    // longer wipes manually-dragged positions. Only resetEdits clears them, and
    // `meta` (e.g. from loadJSON / a saved layout) still overrides per-field below.
    if (!keepEdits) {
      manualOffsets = Object.create(null); edgeWaypoints = Object.create(null);
      edgeAnchors = Object.create(null); nodeOverrides = Object.create(null);
    }
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
    state.orientation = orientation; manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); edgeAnchors = Object.create(null); deselectEdge(); syncToolbar(); refresh(); applyLayoutChangeView(); emit('orientation-change', { orientation }); pushHistory();
  }
  function setSubtreeMode(m) { state.subtreeMode = m; manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); edgeAnchors = Object.create(null); deselectEdge(); syncToolbar(); refresh(); applyLayoutChangeView(); emit('subtree-mode-change', { subtreeMode: m }); pushHistory(); }
  function setSpacing(x, y) {
    if (x != null) state.spacingX = x; if (y != null) state.spacingY = y;
    refresh(); emit('settings-change', getSettings()); pushHistory('spacing');
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
  /* (opt-in) let connector endpoints follow waypoints onto any box side (left/right/top/bottom) */
  function setAutoEdgeSide(on) {
    state.autoEdgeSide = on == null ? !state.autoEdgeSide : !!on;
    deselectEdge(); refresh();
    if (settingsPanel.classList.contains('loc-open')) renderSettings();
    persist(); emit('settings-change', getSettings());
    return state.autoEdgeSide;
  }
  /* toggle person photos; when off (or a photo is missing) the user-silhouette icon shows */
  function setShowImages(on) {
    state.showImages = on == null ? !state.showImages : !!on;
    for (const id in elById) { elById[id].remove(); delete elById[id]; }  // rebuild cards
    drawNodes(); syncToolbar(); persist();
    emit('settings-change', getSettings());
    return state.showImages;
  }
  function relayout() { manualOffsets = Object.create(null); edgeWaypoints = Object.create(null); edgeAnchors = Object.create(null); deselectEdge(); refresh(); applyLayoutChangeView(); pushHistory(); }
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
    updateEdgeGeom(id); renderEdgeHandles(); persist(); pushHistory();
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
    updateEdgeGeom(id); renderEdgeHandles(); persist(); pushHistory();
  });
  function onHandleMove(e) { if (!edgeDrag) return; const wps = edgeWaypoints[edgeDrag.id]; if (!wps) return; wps[edgeDrag.idx] = waypointAlignSnap(edgeDrag.id, snapPoint(clientToContent(e.clientX, e.clientY))); updateEdgeGeom(edgeDrag.id); renderEdgeHandles(); }
  function onHandleUp() { edgeDrag = null; clearAlignGuides(); rmWin('pointermove', onHandleMove); rmWin('pointerup', onHandleUp); persist(); pushHistory(); }

  // legend close button
  addL(legendEl, 'click', (e) => { if (e.target.closest('[data-role="legend-close"]')) setShowLegend(false); });

  // inspector panel
  addL(panel, 'click', (e) => {
    if (e.target.closest('[data-role="panel-close"]')) { closeInspector(); return; }
    if (e.target.closest('[data-role="add-child"]')) { addChild(state.selectedNodeId); return; }
    if (e.target.closest('[data-role="detach"]')) { detachNode(state.selectedNodeId); return; }
    if (e.target.closest('[data-role="attach"]')) { const id = state.selectedNodeId; closeInspector(); beginAttach(id); return; }
    if (e.target.closest('[data-role="del-node"]')) { deleteNode(state.selectedNodeId); return; }
    const ures = e.target.closest('[data-uidx]');
    if (ures) { const box = ures.closest('[data-role="user-results"]'); const u = box && box._users && box._users[+ures.dataset.uidx]; if (u) chooseUser(u); return; }
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
    if (f === 'personName') runUserSearch(v);   // drive the typeahead from your API
  });

  // settings panel
  addL(settingsPanel, 'click', (e) => {
    if (e.target.closest('[data-role="settings-close"]')) { toggleSettings(false); return; }
    if (e.target.closest('[data-role="reset-settings"]')) { resetSettings(); return; }
    if (e.target.closest('[data-role="preset-save"]')) {
      const nm = (settingsBody.querySelector('[data-role="preset-name"]') || {}).value || '';
      const full = !!(settingsBody.querySelector('[data-role="preset-full"]') || {}).checked;
      if (nm.trim()) { saveLayoutPreset(nm, { full }); }
      return;
    }
    const pa = e.target.closest('[data-role="preset-apply"]');
    if (pa) { loadLayoutPreset(pa.dataset.name); return; }
    const pd = e.target.closest('[data-role="preset-del"]');
    if (pd) { deleteLayoutPreset(pd.dataset.name); return; }
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
      const key = t.dataset.set, v = parseFloat(t.value);
      const lab = settingsBody.querySelector(`[data-rangelabel="${key}"]`); if (lab) lab.textContent = v;
      if (key === 'cardWidth') { setCardSize({ width: v }); return; }
      if (key === 'photoHeight') { setCardSize({ photoHeight: v }); return; }
      state[key] = v; refresh(); emit('settings-change', getSettings()); persist(); return;
    }
    if (t.dataset.setToggle === 'showImages') { setShowImages(t.checked); return; }
    if (t.dataset.setToggle === 'autoEdgeSide') { setAutoEdgeSide(t.checked); return; }
    if (t.dataset.setToggle === 'photoContain') { setCardSize({ contain: t.checked }); return; }
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
        || e.target.closest('.loc-settings') || e.target.closest('.loc-fsbtn')
        || e.target.closest('.loc-legend')) {
      return; // node / edge / handle / panel / control interaction — don't pan or deselect
    }
    focusRoot();
    const clearSelection = () => {
      clearNodeSelection();
      if (state.selectedEdgeId) deselectEdge();
      clearEdgeSelection();
      if (attaching) cancelAttach();
      closeInspector();
    };
    // Alt + drag on empty canvas → marquee box select connector LINES
    if (e.altKey) { startLineMarquee(e); return; }
    // Ctrl/⌘ + drag on empty canvas → marquee box select nodes (Windows-11 style)
    if (e.ctrlKey || e.metaKey) { startMarquee(e); return; }
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
    // Let the drawers/legend scroll natively when the pointer is over them —
    // otherwise the wheel would zoom the canvas instead of scrolling the panel.
    if (e.target.closest && (e.target.closest('.loc-panel') || e.target.closest('.loc-settings') || e.target.closest('.loc-legend'))) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const nz = Math.min(MAX_ZOOM, Math.max(0.15, state.zoom * factor));
    state.panX = mx - (mx - state.panX) * (nz / state.zoom);
    state.panY = my - (my - state.panY) * (nz / state.zoom);
    state.zoom = nz; applyTransform();
  }, { passive: false });

  function addWin(type, fn) { window.addEventListener(type, fn); listeners.push({ target: window, type, fn }); }
  function rmWin(type, fn) { window.removeEventListener(type, fn); }

  // keyboard undo/redo — scoped to the chart (root is focusable; we focus it on
  // canvas/node interaction). Skipped while typing in a field so native text undo works.
  function focusRoot() { try { root.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  addL(root, 'keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    const k = (e.key || '').toLowerCase();
    // line-marquee actions (no modifier): Delete straightens selected lines, Esc clears
    if (!(e.ctrlKey || e.metaKey)) {
      if (selectedEdges.size && (k === 'delete' || k === 'backspace')) { e.preventDefault(); resetSelectedEdges(); return; }
      if (k === 'escape' && selectedEdges.size) { e.preventDefault(); clearEdgeSelection(); return; }
      return;
    }
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); redo(); }
  });

  // ================= optional toolbar =================
  function buildToolbar() {
    const tcfg = (opts.toolbar && typeof opts.toolbar === 'object') ? opts.toolbar : {};
    const show = (g) => tcfg[g] !== false;          // each group defaults visible
    const bar = el('div', 'loc-toolbar');
    let html = '';
    if (show('subtree')) html += group('Subtree', ['Balanced', 'Center', 'Left', 'Right', 'Alternate', 'AlternateLeft', 'AlternateRight'].map((m) => btn('mode', m, m)).join(''));
    if (show('orient')) html += group('Orient', [['TopToBottom', 'Top'], ['BottomToTop', 'Bottom'], ['LeftToRight', 'Left'], ['RightToLeft', 'Right']].map(([o, l]) => btn('orient', o, l)).join(''));
    if (show('history')) html += group('', '<button data-act="undo" title="Undo (Ctrl+Z)">Undo</button><button data-act="redo" title="Redo (Ctrl+Shift+Z)">Redo</button>');
    if (show('actions')) html += group('', '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button><button data-act="reset">Reset</button><button data-act="fullscreen" title="Toggle fullscreen">Fullscreen</button>');
    if (show('search')) html += group('Search', '<input type="search" data-role="search" class="loc-search-input" placeholder="Search…" />');
    if (show('grid')) html += group('Grid', '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>');
    if (show('mode')) html += group('Mode', '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="images" title="Toggle photos / user icons">Images</button><button data-act="legend" title="Toggle legend">Legend</button><button data-act="settings" title="Settings &amp; theming">Settings</button>');
    if (show('export')) html += group('Export', '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>');
    bar.innerHTML = html;
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.mode) setSubtreeMode(b.dataset.mode);
      else if (b.dataset.orient) setOrientation(b.dataset.orient);
      else if (b.dataset.flag) { state[b.dataset.flag] = !state[b.dataset.flag]; if (b.dataset.flag === 'showGrid') applyGridOverlay(); else if (b.dataset.flag === 'alignGrid') { manualOffsets = Object.create(null); refresh(); } syncToolbar(); persist(); }
      else switch (b.dataset.act) {
        case 'undo': undo(); break;
        case 'redo': redo(); break;
        case 'expand': expandAll(); break;
        case 'collapse': collapseAll(); break;
        case 'fit': fitToScreen(); break;
        case 'relayout': relayout(); break;
        case 'reset': resetView(); break;
        case 'fullscreen': toggleFullscreen(); break;
        case 'edit': setEditMode(!state.editMode); break;
        case 'images': setShowImages(); break;
        case 'legend': toggleLegend(); break;
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
    toolbarEl.querySelectorAll('button[data-act="images"]').forEach((b) => b.classList.toggle('loc-active', state.showImages));
    toolbarEl.querySelectorAll('button[data-act="legend"]').forEach((b) => b.classList.toggle('loc-active', state.showLegend));
    toolbarEl.querySelectorAll('button[data-act="fullscreen"]').forEach((b) => b.classList.toggle('loc-active', isFullscreen()));
    toolbarEl.querySelectorAll('button[data-act="undo"]').forEach((b) => { b.disabled = !canUndo(); });
    toolbarEl.querySelectorAll('button[data-act="redo"]').forEach((b) => { b.disabled = !canRedo(); });
  }

  // keep toolbar/float button + emitted event in sync with the browser's
  // fullscreen state (covers Esc / F11 exits too)
  addL(document, 'fullscreenchange', onFullscreenChange);
  addL(document, 'webkitfullscreenchange', onFullscreenChange);

  // ================= boot =================
  restore();
  syncToolbar();
  applyGridOverlay();
  applyLegend();
  applyEditModeUI();
  refresh();
  resetHistory();   // baseline snapshot so the first edit is undoable
  if (opts.fitOnInit) fitToScreen();

  // ================= destroy =================
  let destroyed = false;
  function destroy() {
    if (destroyed) return; destroyed = true;
    listeners.forEach(({ target, type, fn, optsL }) => target.removeEventListener(type, fn, optsL));
    listeners.length = 0;
    if (dragRaf) cancelAnimationFrame(dragRaf);
    if (userSearchTimer) clearTimeout(userSearchTimer);
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
    search, clearSearch, exportJSON, exportSVG, exportPNG, exportWebP, exportPDF, buildSVG,
    setEditMode, isEditMode: () => state.editMode,
    setShowImages, isShowingImages: () => state.showImages,
    setShowLegend, toggleLegend, isShowingLegend: () => state.showLegend, getLegendBody: () => legendBody,
    setAutoEdgeSide, isAutoEdgeSide: () => state.autoEdgeSide,
    // global card sizing
    setPhotoHeight: (px) => setCardSize({ photoHeight: px }),
    setCardWidth: (px) => setCardSize({ width: px }),
    setCardSize, setPhotoContain: (on) => setCardSize({ contain: on !== false }),
    // multi-select (nodes)
    getSelection: () => [...selectedIds],
    setSelection: (ids) => setSelectionSet(Array.isArray(ids) ? ids : (ids ? [ids] : [])),
    clearSelection: () => { clearNodeSelection(); emitSelection(); },
    // multi-select (connector lines)
    getEdgeSelection: () => [...selectedEdges],
    setEdgeSelection, clearEdgeSelection, resetSelectedEdges,
    enterFullscreen, exitFullscreen, toggleFullscreen, isFullscreen,
    undo, redo, canUndo, canRedo,
    updateNode, addChild, deleteNode, reparentNode, detachNode, attachNode,
    beginAttach, cancelAttach, isAttaching: () => !!attaching,
    openInspector, closeInspector, nodeScreenRect,
    getSettings, setSettings, toggleSettings, resetSettings,
    // layout presets + raw layout round-trip (for your own backend)
    saveLayoutPreset, loadLayoutPreset, deleteLayoutPreset, listLayoutPresets, getLayoutPresets,
    getLayout, applyLayout,
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (id) => elById[id] || null,
    getNodeSlotEl: (id) => (elById[id] ? elById[id].querySelector('.loc-node-slot') : null),
    getInspectorBody: () => panelBody,
    getSettingsBody: () => settingsBody,
    nodeThemeStyle: (id) => (nodeById[id] ? resolveNodeStyle(nodeById[id], themeRules) : null),
    getState: () => ({ ...state }),
    getNodes: () => NODES.map((n) => ({ ...n })),
    getPositioned: () => positioned,
    on, off, destroy,
  };
  return api;
}
