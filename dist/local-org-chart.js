import { POS_SIZE as Ft, makeNode as Be, indexNodes as Ke, normalizeRule as Ne, exportLayout as ws, calculateBounds as _t, fitBounds as Ss, computeDepths as vs, childCount as bo, searchNodes as xs, resolveNodeStyle as yo, buildChartSVG as Is, effCenter as Q, normalizeImported as Ls, layoutOrgChart as Ms, normalizeConfig as Es, routeConnector as As, edgeControlPoints as Os, isHorizontal as Cs, orthoThrough as Ns } from "./core.js";
import { CANVAS_PAD as Xs, DEFAULTS as Ps, DEFAULT_SETTINGS as Ys, DEPT_SIZE as Ds, ORIENTATIONS as Us, SNAKE_STUB as qs, SUBTREE_MODES as _s, VIRTUAL_ROOT_ID as Fs, applyOrientation as Ws, buildTree as Bs, convertMoTree as Ks, convertNestedTree as Vs, edgeEndpoints as Zs, getVisibleTree as Js, isMoArray as Qs, lh as ei, lw as ti, normalizeSettings as ni, personNameFromPos as oi, visibleDepths as si, waypointPath as ii } from "./core.js";
const Ts = 116, Te = "http://www.w3.org/2000/svg", Gs = 0.72, zs = { Top: "TopToBottom", Bottom: "BottomToTop", Left: "LeftToRight", Right: "RightToLeft" };
function Ge(xe) {
  return zs[xe] || xe;
}
const Rs = {
  nodes: [],
  orientation: "TopToBottom",
  subtreeMode: "Balanced",
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  showGrid: !1,
  snapGrid: !1,
  alignGrid: !1,
  snapAlign: !0,
  // while dragging, snap to the parent's connector axis + sibling centers (with guide lines)
  enableDragging: !0,
  enablePan: !0,
  enableZoom: !0,
  readonly: !1,
  editMode: !1,
  // when true: drag nodes, edit lines, edit fields in the panel
  inspector: !0,
  // show the slide-in inspector panel on node click (false = headless: emit node-select only)
  inspectorSlot: !1,
  // leave the inspector body empty for an external (Vue) slot
  inspectorTarget: null,
  // mount the inspector drawer into an external element (selector or node) instead of the canvas
  settingsTarget: null,
  // mount the settings drawer into an external element (selector or node) instead of the canvas
  settingsSlot: !1,
  // leave the settings body empty for an external (Vue) slot
  nodeSlots: !1,
  // render empty positioned hosts (Vue teleports card content in)
  fullscreenControl: !0,
  // show the floating fullscreen button on the canvas
  autoEdgeSide: !0,
  // smart edges (default on): connector endpoints follow waypoints onto any box side (L/R/top/bottom)
  legend: !1,
  // show a floating legend (type / status / active theme rules); toggle via toolbar
  legendTarget: null,
  // mount the legend into an external element instead of the canvas corner
  legendSlot: !1,
  // leave the legend body empty for an external (Vue #legend) slot
  photoHeight: 104,
  // person-photo height in px (uniform across cards; bigger = larger profile image)
  cardWidth: Ft.width,
  // person-card width in px (global; card height = photoHeight + text block)
  photoContain: !0,
  // fit the WHOLE profile image inside the photo area (no crop); false = cover/crop
  showImages: !0,
  // show person photos; when off (or no photo) a user-silhouette icon is drawn
  // optional async person lookup for the inspector's "Person name" field. A function
  //   (query, node) => Promise<Array<user>> | Array<user>
  // turns the field into a typeahead so you can pick a user from your own backend API.
  userSearch: null,
  // map a chosen user object to a node field patch (default: name/title/photo_url)
  userToFields: null,
  fitOnLayoutChange: !0,
  // re-frame after mode/orientation/re-layout: true|'fit' · 'recenter' · false|'none'
  fitOnInit: !0,
  toolbar: !0,
  // true | false | { subtree, orient, actions, grid, mode, export }
  persist: !1,
  storageKey: "local-org-chart.state"
};
function js(xe, wo = {}) {
  if (!xe || !xe.appendChild) throw new Error("createOrgChart: first argument must be a DOM element.");
  const c = Object.assign({}, Rs, wo), Wt = +c.maxZoom > 1 ? +c.maxZoom : 4, s = {
    orientation: Ge(c.orientation),
    subtreeMode: c.subtreeMode,
    spacingX: c.spacingX,
    spacingY: c.spacingY,
    zoom: 1,
    panX: 0,
    panY: 0,
    selectedNodeId: null,
    selectedEdgeId: null,
    gridSize: c.gridSize,
    showGrid: c.showGrid,
    snapGrid: c.snapGrid,
    alignGrid: c.alignGrid,
    editMode: !!c.editMode,
    showImages: c.showImages !== !1,
    showLegend: !!c.legend,
    autoEdgeSide: !!c.autoEdgeSide,
    photoHeight: +c.photoHeight || 104,
    cardWidth: +c.cardWidth || Ft.width,
    photoContain: c.photoContain !== !1
  };
  let y = (c.nodes || []).map(Be), w = Ke(y), h = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), N = /* @__PURE__ */ Object.create(null), b = /* @__PURE__ */ new Set(), P = (c.settings && c.settings.themeRules || c.themeRules || []).map(Ne);
  const ge = {
    spacingX: c.spacingX,
    spacingY: c.spacingY,
    gridSize: c.gridSize,
    showGrid: !!c.showGrid,
    snapGrid: !!c.snapGrid,
    alignGrid: !!c.alignGrid,
    themeRules: P.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
  };
  let So = 0, C = [], E = /* @__PURE__ */ Object.create(null);
  const f = /* @__PURE__ */ Object.create(null), m = /* @__PURE__ */ Object.create(null), R = /* @__PURE__ */ Object.create(null);
  let X = null, x = null, ze = 0, se = /* @__PURE__ */ new Set();
  const Ve = [], Ie = /* @__PURE__ */ Object.create(null);
  function vo(e, t) {
    return (Ie[e] || (Ie[e] = [])).push(t), qt;
  }
  function xo(e, t) {
    return Ie[e] && (Ie[e] = Ie[e].filter((n) => n !== t)), qt;
  }
  function p(e, t) {
    (Ie[e] || []).forEach((n) => {
      try {
        n(t);
      } catch {
      }
    });
  }
  function H(e, t, n, o) {
    e.addEventListener(t, n, o), Ve.push({ target: e, type: t, fn: n, optsL: o });
  }
  const T = document.createElement("div");
  T.className = "loc-root", T.tabIndex = -1;
  const U = c.toolbar ? bs() : null;
  U && T.appendChild(U);
  const S = W("div", "loc-canvas"), Le = W("div", "loc-content"), ce = W("div", "loc-grid"), Me = document.createElementNS(Te, "svg");
  Me.setAttribute("class", "loc-connectors");
  const Re = document.createElementNS(Te, "g");
  Re.setAttribute("class", "loc-edgehits"), Me.appendChild(Re);
  const Ze = W("div", "loc-nodes"), ne = document.createElementNS(Te, "svg");
  ne.setAttribute("class", "loc-overlay");
  const q = document.createElementNS(Te, "g");
  q.setAttribute("class", "loc-edgehandles");
  const He = document.createElementNS(Te, "g");
  He.setAttribute("class", "loc-aligns"), ne.appendChild(He), ne.appendChild(q);
  const yt = W("div", "loc-zoomreadout");
  yt.textContent = "100%", Le.appendChild(ce), Le.appendChild(Me), Le.appendChild(Ze), Le.appendChild(ne), S.appendChild(Le), S.appendChild(yt);
  let ie = null;
  c.fullscreenControl && (ie = W("button", "loc-fsbtn"), ie.type = "button", ie.title = "Fullscreen", ie.setAttribute("aria-label", "Toggle fullscreen"), ie.innerHTML = "⛶", H(ie, "click", (e) => {
    e.stopPropagation(), Ut();
  }), S.appendChild(ie)), T.appendChild(S);
  const _ = W("div", "loc-panel");
  _.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Node</span><button class="loc-panel-close" title="Close" data-role="panel-close">✕</button></div><div class="loc-panel-body" data-role="panel-body"></div><div class="loc-panel-foot" data-role="panel-foot"></div>';
  const Bt = wt(c.inspectorTarget) || S;
  Bt.appendChild(_), Bt !== S && _.classList.add("loc-panel-external");
  const je = _.querySelector('[data-role="panel-body"]'), Kt = _.querySelector('[data-role="panel-foot"]'), Io = _.querySelector(".loc-panel-title"), F = W("div", "loc-settings");
  F.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Settings</span><button class="loc-panel-close" title="Close" data-role="settings-close">✕</button></div><div class="loc-panel-body" data-role="settings-body"></div>';
  const Vt = wt(c.settingsTarget) || S;
  Vt.appendChild(F), Vt !== S && F.classList.add("loc-panel-external");
  const de = F.querySelector('[data-role="settings-body"]'), Ee = W("div", "loc-legend");
  Ee.innerHTML = '<div class="loc-legend-head"><span class="loc-legend-title">Legend</span><button class="loc-legend-close" title="Hide legend" data-role="legend-close">✕</button></div><div class="loc-legend-body" data-role="legend-body"></div>';
  const Zt = wt(c.legendTarget) || S;
  Zt.appendChild(Ee), Zt !== S && Ee.classList.add("loc-legend-external");
  const Jt = Ee.querySelector('[data-role="legend-body"]');
  $e(), ke(), xe.appendChild(T);
  function W(e, t) {
    const n = document.createElement(e);
    return t && (n.className = t), n;
  }
  function wt(e) {
    if (!e) return null;
    const t = typeof e == "string" ? document.querySelector(e) : e;
    return t && t.appendChild ? t : null;
  }
  function Je() {
    return Es({
      orientation: s.orientation,
      subtreeMode: s.subtreeMode,
      spacingX: s.spacingX,
      spacingY: s.spacingY,
      gridSize: s.gridSize,
      alignGrid: s.alignGrid,
      autoEdgeSide: s.autoEdgeSide
    });
  }
  function Qt() {
    const e = Ms(y, Je());
    C = e.positioned, E = e.posById;
  }
  function G() {
    Qt(), vt(), St(), Qe(), ye(), tt(), s.showLegend && Rt(), A(), p("layout-change", { positioned: C, mode: s.subtreeMode, orientation: s.orientation });
  }
  function en(e) {
    const t = /* @__PURE__ */ Object.create(null);
    for (const n of C) t[n.node.id] = Q(n, h);
    e(), Qt();
    for (const n of C) {
      const o = t[n.node.id];
      if (!o) continue;
      const i = o.x - n.cx, a = o.y - n.cy;
      Math.abs(i) > 0.5 || Math.abs(a) > 0.5 ? h[n.node.id] = { dx: i, dy: a } : delete h[n.node.id];
    }
    vt(), St(), Qe(), ye(), tt(), A(), p("layout-change", { positioned: C, mode: s.subtreeMode, orientation: s.orientation });
  }
  function Qe() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of C) {
      const n = t.node;
      e[n.id] = !0;
      let o = f[n.id];
      o || (o = Mo(n), f[n.id] = o, Ze.appendChild(o)), o.style.width = n.width + "px", o.style.height = n.height + "px";
      const i = Q(t, h);
      o.style.transform = `translate(${i.x - n.width / 2}px, ${i.y - n.height / 2}px)`, c.nodeSlots || (o.dataset.fitted || (Eo(o), o.dataset.fitted = "1"), Gn(o, n)), o.classList.toggle("loc-selected", b.has(n.id)), o.classList.toggle("loc-primary", s.selectedNodeId === n.id && b.size > 1), Ao(o, n);
    }
    for (const t in f) e[t] || (f[t].remove(), delete f[t]);
    p("nodes-rendered", { ids: C.map((t) => t.node.id) });
  }
  function $e() {
    T.style.setProperty("--loc-photo-h", (s.photoHeight || 104) + "px"), T.style.setProperty("--loc-photo-fit", s.photoContain ? "contain" : "cover");
  }
  function ke() {
    const e = Math.max(100, s.cardWidth || Ft.width), t = Math.max(60, (s.photoHeight || 104) + Ts);
    for (const n of y) n.type !== "department" && (n.width = e, n.height = t);
  }
  function he(e) {
    e = e || {};
    const t = typeof e.width == "number" || typeof e.photoHeight == "number";
    if (typeof e.width == "number" && (s.cardWidth = Math.max(100, e.width)), typeof e.photoHeight == "number" && (s.photoHeight = Math.max(40, e.photoHeight)), "contain" in e && (s.photoContain = !!e.contain), $e(), t) {
      ke();
      for (const n in f) delete f[n].dataset.fitted;
      G();
    }
    A(), p("settings-change", K());
  }
  const Lo = '<svg class="loc-usericon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
  function tn(e) {
    e.textContent = "", e.innerHTML = Lo;
  }
  function Mo(e) {
    if (c.nodeSlots) {
      const n = W("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
      return n.dataset.id = e.id, n.innerHTML = '<div class="loc-node-slot"></div>', n.appendChild(nn()), n;
    }
    const t = W("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
    if (t.dataset.id = e.id, e.type === "department")
      t.innerHTML = '<span class="loc-lbl"></span>', t.querySelector(".loc-lbl").textContent = e.label, t.querySelector(".loc-lbl").title = e.label || "";
    else {
      t.innerHTML = '<div class="loc-photo"></div><div class="loc-ptext"><div class="loc-pname"></div><div class="loc-ptitle"></div><div class="loc-badge"></div></div>';
      const n = t.querySelector(".loc-photo"), o = e.data && e.data.photo_url;
      if (s.showImages && o) {
        const r = new Image();
        r.crossOrigin = "anonymous", r.alt = e.personName || "", r.referrerPolicy = "no-referrer", r.onerror = () => {
          tn(n);
        }, r.src = o, n.appendChild(r);
      } else
        tn(n);
      const i = t.querySelector(".loc-pname"), a = t.querySelector(".loc-ptitle");
      i.textContent = e.personName || "—", i.title = e.personName || "", a.textContent = e.label, a.title = e.label || "";
      const l = t.querySelector(".loc-badge");
      e.status ? (l.textContent = e.status, l.className = "loc-badge loc-" + e.status) : l.remove();
    }
    return t.appendChild(nn()), t;
  }
  function nn() {
    const e = W("div", "loc-toggle");
    return e.dataset.role = "toggle", e;
  }
  function on(e) {
    return e.scrollWidth > e.clientWidth + 0.5 || e.scrollHeight > e.clientHeight + 0.5;
  }
  function Eo(e) {
    if (e.style.setProperty("--loc-fit", "1"), !on(e)) return;
    let t = Gs, n = 1;
    for (let o = 0; o < 7; o++) {
      const i = (t + n) / 2;
      e.style.setProperty("--loc-fit", String(i)), on(e) ? n = i : t = i;
    }
    e.style.setProperty("--loc-fit", String(t));
  }
  function Ao(e, t) {
    const n = e.querySelector('[data-role="toggle"]');
    if (!n) return;
    const o = bo(y, t.id) > 0;
    n.style.display = o ? "flex" : "none", n.textContent = t.collapsed ? "+" : "−";
    const i = t.collapsed ? "Expand" : "Collapse";
    n.title = i, n.setAttribute("aria-label", i);
  }
  function me(e) {
    return document.createElementNS(Te, e);
  }
  function sn(e) {
    return As(E[e.node.parentId], e, Je(), h, L, O);
  }
  function St() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of C) {
      const n = t.node;
      if (!n.parentId || !E[n.parentId]) continue;
      e[n.id] = !0;
      const i = sn(t);
      let a = m[n.id];
      a || (a = me("path"), m[n.id] = a, Me.appendChild(a)), a.setAttribute("d", i), a.classList.toggle("loc-sel", s.selectedEdgeId === n.id), a.classList.toggle("loc-incident", mn(n));
      let l = R[n.id];
      l || (l = me("path"), l.dataset.edge = n.id, R[n.id] = l, Re.appendChild(l)), l.setAttribute("d", i);
    }
    for (const t in m) e[t] || (m[t].remove(), delete m[t]);
    for (const t in R) e[t] || (R[t].remove(), delete R[t]);
    Xe(), s.selectedEdgeId && !e[s.selectedEdgeId] ? le() : fe();
  }
  function be(e) {
    const t = E[e];
    if (!t || !E[t.node.parentId]) return;
    const o = sn(t);
    m[e] && m[e].setAttribute("d", o), R[e] && R[e].setAttribute("d", o);
  }
  function ye() {
    Le.style.transform = `translate(${s.panX}px, ${s.panY}px) scale(${s.zoom})`, yt.textContent = Math.round(s.zoom * 100) + "%", s.selectedEdgeId && !X && fe(), A();
  }
  function vt() {
    let e = 0, t = 0, n = 0, o = 0;
    for (const a of C) {
      const l = Q(a, h), r = a.node.width / 2, u = a.node.height / 2;
      e = Math.min(e, l.x - r - 80), t = Math.min(t, l.y - u - 80), n = Math.max(n, l.x + r + 80), o = Math.max(o, l.y + u + 80);
    }
    Me.setAttribute("width", n), Me.setAttribute("height", o), ne.setAttribute("width", n), ne.setAttribute("height", o);
    const i = s.gridSize;
    ce.style.left = e + "px", ce.style.top = t + "px", ce.style.width = n - e + "px", ce.style.height = o - t + "px", ce.style.backgroundSize = i + "px " + i + "px", ce.style.backgroundPosition = (-e % i + i) % i + "px " + (-t % i + i) % i + "px";
  }
  function Ae() {
    ce.classList.toggle("loc-on", s.showGrid), S.classList.toggle("loc-gridon", s.showGrid);
  }
  function we() {
    if (!C.length) return;
    const e = _t(C, h, 0), t = Ss(e, S.clientWidth, S.clientHeight);
    s.zoom = t.zoom, s.panX = t.panX, s.panY = t.panY, ye();
  }
  function xt(e) {
    const t = E[e];
    if (!t) return;
    const n = Q(t, h);
    s.panX = S.clientWidth / 2 - n.x * s.zoom, s.panY = S.clientHeight / 2 - n.y * s.zoom, ye();
  }
  function Oo() {
    const e = c.fitOnLayoutChange;
    return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
  }
  function et() {
    const e = Oo();
    if (e === "fit") {
      we();
      return;
    }
    if (e === "recenter") {
      const t = y.find((o) => !o.parentId), n = s.selectedNodeId && E[s.selectedNodeId] ? s.selectedNodeId : t && t.id;
      n && xt(n);
    }
  }
  function an() {
    for (const e of y) e.collapsed = !1;
    G(), j();
  }
  function ln() {
    const e = vs(y, w);
    for (const t of y) t.collapsed = e[t.id] >= 1 && bo(y, t.id) > 0;
    G(), j();
  }
  function rn(e) {
    const t = w[e];
    t && (en(() => {
      t.collapsed = !t.collapsed;
    }), ae(), j());
  }
  function cn(e) {
    if (se = xs(y, e), tt(), se.size) {
      const t = C.find((n) => se.has(n.node.id));
      t && xt(t.node.id);
    }
    return se.size;
  }
  function dn() {
    se = /* @__PURE__ */ new Set(), tt();
  }
  function tt() {
    const e = se.size > 0;
    for (const t of C) {
      const n = f[t.node.id];
      if (!n) continue;
      const o = se.has(t.node.id);
      n.classList.toggle("loc-highlight", e && o), n.classList.toggle("loc-dim", e && !o);
    }
    for (const t in m) m[t].classList.toggle("loc-hl", e && se.has(t));
  }
  function Co(e, t) {
    if (e.target.closest('[data-role="toggle"]') || (e.stopPropagation(), ho(), pe && Do(t)))
      return;
    if (le(), e.ctrlKey || e.metaKey) {
      Ro(t);
      return;
    }
    if (b.has(t) ? (s.selectedNodeId = t, Se(), ae()) : It(t), p("node-select", { id: t, node: w[t], rect: yn(t) }), c.inspector && Pe(t), c.readonly || !c.enableDragging || !s.editMode) return;
    const n = b.has(t) && b.size > 1 ? [...b] : [t], o = /* @__PURE__ */ Object.create(null);
    for (const i of n) {
      const a = h[i] || { dx: 0, dy: 0 };
      o[i] = { dx: a.dx, dy: a.dy }, f[i] && f[i].classList.add("loc-dragging");
    }
    x = { id: t, groupIds: n, bases: o, startX: e.clientX, startY: e.clientY, moved: !1 }, p("node-drag-start", { id: t, node: w[t], group: n }), D("pointermove", un), D("pointerup", fn);
  }
  function un(e) {
    if (!x) return;
    let t = (e.clientX - x.startX) / s.zoom, n = (e.clientY - x.startY) / s.zoom;
    Math.abs(e.clientX - x.startX) + Math.abs(e.clientY - x.startY) > 3 && (x.moved = !0);
    const o = E[x.id], i = x.bases[x.id];
    if (o) {
      const a = o.cx + i.dx, l = o.cy + i.dy;
      if (s.snapGrid) {
        const r = s.gridSize;
        t = Math.round((a + t) / r) * r - a, n = Math.round((l + n) / r) * r - l;
      }
      if (x.groupIds.length === 1) {
        const r = No(x.id, a + t, l + n);
        t = r.cx - a, n = r.cy - l, gn(r.gx, r.gy);
      }
    }
    for (const a of x.groupIds) {
      const l = x.bases[a];
      h[a] = { dx: l.dx + t, dy: l.dy + n };
    }
    ze || (ze = requestAnimationFrame(() => {
      ze = 0;
      for (const a of x.groupIds)
        Go(a), zo(a);
      p("node-drag", { id: x.id, node: w[x.id], offset: h[x.id], group: x.groupIds });
    }));
  }
  function fn() {
    let e = !1;
    if (x) {
      for (const t of x.groupIds)
        f[t] && f[t].classList.remove("loc-dragging");
      p("node-drag-end", { id: x.id, node: w[x.id], offset: h[x.id], group: x.groupIds }), vt(), e = !!x.moved;
    }
    x = null, hn(), J("pointermove", un), J("pointerup", fn), A(), e && j();
  }
  const pn = 8;
  function No(e, t, n) {
    if (!c.snapAlign) return { cx: t, cy: n, gx: null, gy: null };
    const o = w[e];
    if (!o) return { cx: t, cy: n, gx: null, gy: null };
    const i = pn / s.zoom, a = [], l = [], r = o.parentId && E[o.parentId];
    r && a.push(Q(r, h).x);
    for (const v of C) {
      if (v.node.id === e || !o.parentId || v.node.parentId !== o.parentId) continue;
      const M = Q(v, h);
      a.push(M.x), l.push(M.y);
    }
    let u = null, d = i;
    for (const v of a) {
      const M = Math.abs(t - v);
      M < d && (d = M, t = v, u = v);
    }
    let g = null, I = i;
    for (const v of l) {
      const M = Math.abs(n - v);
      M < I && (I = M, n = v, g = v);
    }
    return { cx: t, cy: n, gx: u, gy: g };
  }
  function To(e, t) {
    if (!c.snapAlign) return t;
    const n = E[e];
    if (!n) return t;
    const o = E[n.node.parentId], i = pn / s.zoom, a = Q(n, h), l = [a.x], r = [a.y];
    if (o) {
      const z = Q(o, h);
      l.push(z.x), r.push(z.y);
    }
    let u = null, d = i, g = t.x;
    for (const z of l) {
      const $ = Math.abs(t.x - z);
      $ < d && (d = $, g = z, u = z);
    }
    let I = null, v = i, M = t.y;
    for (const z of r) {
      const $ = Math.abs(t.y - z);
      $ < v && (v = $, M = z, I = z);
    }
    return gn(u, I), { x: g, y: M };
  }
  function gn(e, t) {
    He.innerHTML = "";
    const n = +ne.getAttribute("width") || 0, o = +ne.getAttribute("height") || 0, i = (a, l, r, u) => {
      const d = me("line");
      d.setAttribute("x1", a), d.setAttribute("y1", l), d.setAttribute("x2", r), d.setAttribute("y2", u), d.setAttribute("class", "loc-align-line"), He.appendChild(d);
    };
    e != null && i(e, 0, e, o), t != null && i(0, t, n, t);
  }
  function hn() {
    He.innerHTML = "";
  }
  function Go(e) {
    const t = E[e], n = f[e];
    if (!t || !n) return;
    const o = Q(t, h);
    n.style.transform = `translate(${o.x - t.node.width / 2}px, ${o.y - t.node.height / 2}px)`;
  }
  function zo(e) {
    const t = E[e];
    if (t) {
      E[t.node.parentId] && be(e);
      for (const n of C) n.node.parentId === e && be(n.node.id);
      s.selectedEdgeId && fe();
    }
  }
  function Se() {
    for (const e in f)
      f[e].classList.toggle("loc-selected", b.has(e)), f[e].classList.toggle("loc-primary", s.selectedNodeId === e && b.size > 1);
  }
  function nt() {
    p("selection-change", { ids: [...b], primary: s.selectedNodeId });
  }
  function It(e) {
    b = new Set(e ? [e] : []), s.selectedNodeId = e || null, Se(), ae();
  }
  function Ro(e) {
    b.has(e) ? (b.delete(e), s.selectedNodeId === e && (s.selectedNodeId = b.size ? [...b][b.size - 1] : null)) : (b.add(e), s.selectedNodeId = e), Se(), ae(), nt();
  }
  function Ho(e, t) {
    b = new Set(e), s.selectedNodeId = e.length ? e[e.length - 1] : null, Se(), ae(), nt();
  }
  function Lt() {
    b = /* @__PURE__ */ new Set(), s.selectedNodeId = null, Se(), ae();
  }
  function jo(e) {
    const t = ue(e.clientX, e.clientY), n = e.shiftKey ? new Set(b) : /* @__PURE__ */ new Set(), o = me("rect");
    o.setAttribute("class", "loc-marquee"), ne.appendChild(o), S.classList.add("loc-marqueeing");
    let i = !1;
    const a = (r) => {
      const u = ue(r.clientX, r.clientY), d = Math.min(t.x, u.x), g = Math.min(t.y, u.y), I = Math.abs(u.x - t.x), v = Math.abs(u.y - t.y);
      o.setAttribute("x", d), o.setAttribute("y", g), o.setAttribute("width", I), o.setAttribute("height", v);
      const M = new Set(n);
      for (const z of C) {
        const $ = Q(z, h);
        $.x >= d && $.x <= d + I && $.y >= g && $.y <= g + v && M.add(z.node.id);
      }
      b = M, s.selectedNodeId = b.size ? [...b][b.size - 1] : null, Se(), ae(), i = !0;
    }, l = () => {
      o.remove(), S.classList.remove("loc-marqueeing"), J("pointermove", a), J("pointerup", l), i ? (nt(), b.size === 1 && c.inspector && Pe([...b][0])) : (Lt(), oe());
    };
    D("pointermove", a), D("pointerup", l);
  }
  function mn(e) {
    return b.has(e.id) || b.has(e.parentId);
  }
  let Y = /* @__PURE__ */ new Set();
  function Xe() {
    for (const e in m) m[e].classList.toggle("loc-edge-selected", Y.has(e));
  }
  function ot() {
    Y.size && (Y = /* @__PURE__ */ new Set(), Xe(), p("edges-select", { ids: [] }));
  }
  function $o(e) {
    Y = new Set((e || []).filter((t) => m[t])), Xe(), p("edges-select", { ids: [...Y] });
  }
  function bn() {
    if (!Y.size) return;
    let e = !1;
    for (const t of Y)
      L[t] && (delete L[t], e = !0), O[t] && (delete O[t], e = !0);
    e && (s.selectedEdgeId && Y.has(s.selectedEdgeId) && le(), St(), Xe(), A(), j(), p("edges-reset", { ids: [...Y] }));
  }
  function st(e, t, n, o, i, a, l, r) {
    const u = (n - e) * (r - a) - (o - t) * (l - i);
    if (Math.abs(u) < 1e-9) return !1;
    const d = ((i - e) * (r - a) - (a - t) * (l - i)) / u, g = ((i - e) * (o - t) - (a - t) * (n - e)) / u;
    return d >= 0 && d <= 1 && g >= 0 && g <= 1;
  }
  function ko(e, t, n, o, i, a) {
    const l = n + i, r = o + a, u = (d) => d.x >= n && d.x <= l && d.y >= o && d.y <= r;
    return u(e) || u(t) ? !0 : st(e.x, e.y, t.x, t.y, n, o, l, o) || st(e.x, e.y, t.x, t.y, l, o, l, r) || st(e.x, e.y, t.x, t.y, l, r, n, r) || st(e.x, e.y, t.x, t.y, n, r, n, o);
  }
  function Xo(e, t, n, o, i) {
    const a = Mt(e);
    if (!a) return !1;
    for (const l of Et(a)) if (ko(l.a, l.b, t, n, o, i)) return !0;
    return !1;
  }
  function Po(e) {
    const t = ue(e.clientX, e.clientY), n = e.shiftKey ? new Set(Y) : /* @__PURE__ */ new Set(), o = me("rect");
    o.setAttribute("class", "loc-marquee loc-marquee-edge"), ne.appendChild(o), S.classList.add("loc-marqueeing");
    let i = !1;
    const a = (r) => {
      const u = ue(r.clientX, r.clientY), d = Math.min(t.x, u.x), g = Math.min(t.y, u.y), I = Math.abs(u.x - t.x), v = Math.abs(u.y - t.y);
      o.setAttribute("x", d), o.setAttribute("y", g), o.setAttribute("width", I), o.setAttribute("height", v);
      const M = new Set(n);
      for (const z in m) Xo(z, d, g, I, v) && M.add(z);
      Y = M, Xe(), i = !0;
    }, l = () => {
      o.remove(), S.classList.remove("loc-marqueeing"), J("pointermove", a), J("pointerup", l), i ? p("edges-select", { ids: [...Y] }) : ot();
    };
    D("pointermove", a), D("pointerup", l);
  }
  function ae() {
    for (const e in m) {
      const t = E[e];
      m[e].classList.toggle("loc-incident", !!t && mn(t.node));
    }
  }
  function yn(e) {
    const t = f[e];
    if (!t) return null;
    const n = t.getBoundingClientRect();
    return { left: n.left, top: n.top, right: n.right, bottom: n.bottom, width: n.width, height: n.height };
  }
  function ue(e, t) {
    const n = S.getBoundingClientRect();
    return { x: (e - n.left - s.panX) / s.zoom, y: (t - n.top - s.panY) / s.zoom };
  }
  function it(e) {
    if (s.snapGrid) {
      const t = s.gridSize;
      return { x: Math.round(e.x / t) * t, y: Math.round(e.y / t) * t };
    }
    return { x: e.x, y: e.y };
  }
  function Mt(e) {
    const t = E[e];
    if (!t) return null;
    const n = E[t.node.parentId];
    if (!n) return null;
    const o = L[e] || [];
    return Os(n, t, o, Je(), h, O[e]);
  }
  function Et(e) {
    const t = [], n = Cs(Je());
    for (let o = 0; o < e.length - 1; o++) {
      const i = Ns([e[o], e[o + 1]], n);
      for (let a = 0; a < i.length - 1; a++) t.push({ a: i[a], b: i[a + 1], insert: o });
    }
    return t;
  }
  function wn(e) {
    s.selectedEdgeId && m[s.selectedEdgeId] && m[s.selectedEdgeId].classList.remove("loc-sel"), b = /* @__PURE__ */ new Set(), s.selectedNodeId = null, Se(), s.selectedEdgeId = e, m[e] && m[e].classList.add("loc-sel"), ae(), fe();
  }
  function le() {
    s.selectedEdgeId && m[s.selectedEdgeId] && m[s.selectedEdgeId].classList.remove("loc-sel"), s.selectedEdgeId = null, q.innerHTML = "";
  }
  function At(e, t, n, o) {
    const i = me("circle");
    return i.setAttribute("cx", e), i.setAttribute("cy", t), i.setAttribute("r", n), i.setAttribute("class", o), i;
  }
  function Sn(e, t, n, o) {
    const i = me("rect");
    return i.setAttribute("x", e - n), i.setAttribute("y", t - n), i.setAttribute("width", 2 * n), i.setAttribute("height", 2 * n), i.setAttribute("rx", 2 / s.zoom), i.setAttribute("class", o), i;
  }
  function fe() {
    q.innerHTML = "";
    const e = s.selectedEdgeId;
    if (!e || c.readonly) return;
    const t = Mt(e);
    if (!t) return;
    const n = L[e] || [], o = 6 / s.zoom, i = 5 / s.zoom;
    if (!s.editMode) {
      for (let d = 0; d < n.length; d++) {
        const g = At(n[d].x, n[d].y, o, "loc-wp-handle loc-wp-readonly");
        g.dataset.wp = d, q.appendChild(g);
      }
      return;
    }
    for (const d of Et(t)) {
      const g = At((d.a.x + d.b.x) / 2, (d.a.y + d.b.y) / 2, i, "loc-wp-add");
      g.dataset.add = d.insert, q.appendChild(g);
    }
    for (let d = 0; d < n.length; d++) {
      const g = At(n[d].x, n[d].y, o, "loc-wp-handle");
      g.dataset.wp = d, q.appendChild(g);
    }
    const a = t[0], l = t[t.length - 1], r = Sn(a.x, a.y, 6 / s.zoom, "loc-ep loc-ep-parent");
    r.dataset.ep = "parent", q.appendChild(r);
    const u = Sn(l.x, l.y, 6 / s.zoom, "loc-ep loc-ep-child");
    u.dataset.ep = "child", q.appendChild(u);
  }
  function vn(e, t) {
    const n = Q(e, h), o = e.node.width, i = e.node.height;
    let a = (t.x - n.x) / (o / 2), l = (t.y - n.y) / (i / 2);
    const r = Math.max(Math.abs(a), Math.abs(l));
    return r > 1e-6 && (a /= r, l /= r), { nx: Math.max(-1, Math.min(1, a)), ny: Math.max(-1, Math.min(1, l)) };
  }
  const xn = 0.34;
  function In(e) {
    let t = e.nx, n = e.ny;
    return Math.abs(Math.abs(n) - 1) < 1e-6 && Math.abs(t) < xn ? t = 0 : Math.abs(Math.abs(t) - 1) < 1e-6 && Math.abs(n) < xn && (n = 0), { nx: t, ny: n };
  }
  function Yo(e, t) {
    const n = new Set([t].concat(rt(t)));
    for (let o = C.length - 1; o >= 0; o--) {
      const i = C[o];
      if (n.has(i.node.id)) continue;
      const a = Q(i, h);
      if (e.x >= a.x - i.node.width / 2 && e.x <= a.x + i.node.width / 2 && e.y >= a.y - i.node.height / 2 && e.y <= a.y + i.node.height / 2) return i.node.id;
    }
    return null;
  }
  let Oe = null;
  function Ot(e) {
    Oe && f[Oe] && f[Oe].classList.remove("loc-reparent-target"), Oe = e, e && f[e] && f[e].classList.add("loc-reparent-target");
  }
  function Ln(e) {
    if (!X || X.kind !== "ep") return;
    const t = X.id, n = E[t];
    if (!n) return;
    const o = E[n.node.parentId];
    if (!o) return;
    const i = it(ue(e.clientX, e.clientY));
    if (O[t] = O[t] || {}, X.changed = !0, X.which === "child")
      O[t].c = In(vn(n, i));
    else {
      O[t].p = In(vn(o, i));
      const a = Yo(i, t);
      Ot(a && a !== n.node.parentId ? a : null);
    }
    be(t), fe();
  }
  function Mn() {
    const e = X;
    if (X = null, J("pointermove", Ln), J("pointerup", Mn), e && e.which === "parent" && Oe) {
      const t = Oe;
      Ot(null), at(e.id, t);
      return;
    }
    Ot(null), A(), e && e.changed && j();
  }
  function at(e, t) {
    const n = w[e];
    if (!n || t === e || t && rt(e).indexOf(t) >= 0) return;
    const o = t || "";
    (n.parentId || "") !== o && (s.selectedEdgeId = null, q.innerHTML = "", en(() => {
      n.parentId = o, N[e] = Object.assign(N[e] || {}, { parentId: o }), delete L[e], delete O[e], E[e] && Object.assign(E[e].node, { parentId: o });
    }), ae(), _.classList.contains("loc-open") && s.selectedNodeId === e && Ce(), p("node-change", { id: e, node: { ...n }, patch: { parentId: o }, reparented: !0 }), j());
  }
  function Ct(e) {
    at(e, "");
  }
  function En(e, t) {
    t && at(e, t);
  }
  let pe = null;
  function An(e) {
    e && (pe = e, T.classList.add("loc-attaching"), p("attach-start", { id: e }));
  }
  function lt() {
    pe && (pe = null, T.classList.remove("loc-attaching"), p("attach-cancel", {}));
  }
  function Do(e) {
    const t = pe;
    return !t || !e || e === t || rt(t).indexOf(e) >= 0 ? (lt(), !1) : (pe = null, T.classList.remove("loc-attaching"), En(t, e), c.inspector && Pe(t), !0);
  }
  function Uo(e, t, n) {
    const o = n.x - t.x, i = n.y - t.y, a = o * o + i * i;
    let l = a ? ((e.x - t.x) * o + (e.y - t.y) * i) / a : 0;
    return l = Math.max(0, Math.min(1, l)), Math.hypot(e.x - (t.x + l * o), e.y - (t.y + l * i));
  }
  function qo(e, t) {
    const n = Et(e);
    let o = 0, i = 1 / 0;
    for (const a of n) {
      const l = Uo(t, a.a, a.b);
      l < i && (i = l, o = a.insert);
    }
    return o;
  }
  const _o = ["", "Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight"];
  function B(e) {
    return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function Nt() {
    T.classList.toggle("loc-edit", s.editMode);
  }
  function On(e) {
    s.editMode = !!e, Nt(), Z(), s.editMode || le(), _.classList.contains("loc-open") && Ce(), p("edit-mode-change", { editMode: s.editMode }), A();
  }
  function Pe(e) {
    c.inspector && (s.selectedNodeId = e, _.classList.add("loc-open"), Ce(), p("inspector-open", { id: e, node: w[e] }));
  }
  function oe() {
    _.classList.contains("loc-open") && (_.classList.remove("loc-open"), p("inspector-close", {}));
  }
  function Ce() {
    const e = s.selectedNodeId, t = e && w[e];
    if (!t) {
      oe();
      return;
    }
    if (Io.textContent = t.label || t.personName || t.id, c.inspectorSlot) {
      Kt.innerHTML = "";
      return;
    }
    const n = s.editMode, o = n ? "" : " disabled", i = (u, d, g) => `<input data-field="${u}" type="${g || "text"}" value="${B(d)}"${o}/>`, a = (u, d, g) => `<select data-field="${u}"${o}>` + g.map((I) => {
      const v = Array.isArray(I) ? I[0] : I, M = Array.isArray(I) ? I[1] : I || "—";
      return `<option value="${B(v)}"${String(v) === String(d ?? "") ? " selected" : ""}>${M}</option>`;
    }).join("") + "</select>", l = (u, d) => `<label class="loc-field"><span>${u}</span>${d}</label>`;
    let r = l("ID", `<input value="${B(t.id)}" disabled/>`) + l("Type", a("type", t.type, [["department", "department"], ["position", "position"]])) + l("Label", i("label", t.label));
    t.type !== "department" && (r += c.userSearch ? `<label class="loc-field loc-usersearch"><span>Person name</span>${i("personName", t.personName)}<div class="loc-usersearch-list" data-role="user-results" hidden></div></label>` : l("Person name", i("personName", t.personName)), r += l("Status", a("status", t.status, [["", "—"], ["FILLED", "FILLED"], ["VACANT", "VACANT"], ["UNFUNDED", "UNFUNDED"]])) + l("Photo URL", i("photo_url", t.data && t.data.photo_url || ""))), r += l("Layout override", a("layoutMode", t.layoutMode || "", _o.map((u) => [u, u || "(inherit)"]))) + l("Width", i("width", t.width, "number")) + l("Height", i("height", t.height, "number")), je.innerHTML = r, Kt.innerHTML = n ? '<button data-role="add-child">+ Add child</button>' + (t.parentId ? '<button data-role="detach">Detach</button>' : '<button data-role="attach">Attach…</button>') + '<button data-role="del-node" class="loc-danger">Delete</button>' : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  let Ye = 0, Cn = 0;
  function Fo(e) {
    if (!c.userSearch) return;
    const t = je.querySelector('[data-role="user-results"]');
    if (!t) return;
    Ye && clearTimeout(Ye);
    const n = (e || "").trim();
    if (!n) {
      t.hidden = !0, t.innerHTML = "";
      return;
    }
    const o = ++Cn;
    Ye = setTimeout(() => {
      try {
        Promise.resolve(c.userSearch(n, w[s.selectedNodeId])).then((i) => {
          o === Cn && Wo(t, Array.isArray(i) ? i : []);
        }).catch(() => {
        });
      } catch {
      }
    }, 220);
  }
  function Wo(e, t) {
    if (!t.length) {
      e.hidden = !0, e.innerHTML = "";
      return;
    }
    e.innerHTML = t.slice(0, 8).map((n, o) => {
      const i = B(n.name || n.personName || n.label || ""), a = B(n.title || n.label || n.email || "");
      return `<button type="button" class="loc-usersearch-item" data-uidx="${o}"><b>${i}</b>${a ? `<small>${a}</small>` : ""}</button>`;
    }).join(""), e.hidden = !1, e._users = t;
  }
  function Bo(e) {
    const t = s.selectedNodeId, n = t && w[t];
    if (!n) return;
    let o = c.userToFields ? c.userToFields(e, n) : null;
    if (!o) {
      o = {};
      const a = e.name || e.personName || e.label;
      a && (o.personName = a), e.title && (o.label = e.title);
      const l = e.photo_url || e.avatar || e.image;
      l && (o.photo_url = l);
    }
    if ("photo_url" in o) {
      const a = o.photo_url;
      delete o.photo_url, o.data = Object.assign({}, n.data, { photo_url: a || null });
    }
    ve(t, o);
    const i = je.querySelector('[data-role="user-results"]');
    i && (i.hidden = !0, i.innerHTML = ""), Ce(), p("user-select", { id: t, user: e, node: { ...w[t] } });
  }
  function Ko() {
    let e;
    do
      e = "node-" + ++So;
    while (w[e]);
    return e;
  }
  function ve(e, t) {
    const n = w[e];
    if (!n) return;
    Object.assign(n, t), E[e] && E[e].node !== n && Object.assign(E[e].node, t), N[e] = Object.assign(N[e] || {}, t);
    const o = ["type", "width", "height", "layoutMode"].some((i) => i in t);
    f[e] && (f[e].remove(), delete f[e]), o ? G() : Qe(), p("node-change", { id: e, node: { ...n }, patch: t }), A(), j("field:" + e + ":" + Object.keys(t).join(","));
  }
  function rt(e) {
    const t = [], n = [e];
    for (; n.length; ) {
      const o = n.pop();
      for (const i of y) i.parentId === o && (t.push(i.id), n.push(i.id));
    }
    return t;
  }
  function Nn(e) {
    if (!s.editMode) return;
    const t = Ko(), n = Be({ id: t, parentId: e || "", type: "position", label: "NEW POSITION", personName: "", status: "" });
    y.push(n), w[t] = n, N[t] = Object.assign({ __new: !0 }, n), G(), It(t), Pe(t), p("node-change", { id: t, node: { ...n }, added: !0 }), A(), j();
  }
  function Tn(e) {
    if (!s.editMode || !e) return;
    const t = [e].concat(rt(e)), n = new Set(t);
    y = y.filter((o) => !n.has(o.id)), w = Ke(y), t.forEach((o) => {
      N[o] = { __deleted: !0 }, f[o] && (f[o].remove(), delete f[o]), b.delete(o);
    }), n.has(s.selectedNodeId) && (s.selectedNodeId = b.size ? [...b][b.size - 1] : null, s.selectedNodeId || oe()), G(), p("node-change", { id: e, removed: !0, ids: t }), A(), j();
  }
  function Tt() {
    const e = new Set(Object.keys(N).filter((t) => N[t] && N[t].__deleted));
    e.size && (y = y.filter((t) => !e.has(t.id))), w = Ke(y);
    for (const t in N) {
      const n = N[t];
      if (!(!n || n.__deleted))
        if (n.__new) {
          if (!w[t]) {
            const o = Object.assign({}, n);
            delete o.__new;
            const i = Be(o);
            y.push(i), w[t] = i;
          }
        } else w[t] && Object.assign(w[t], n);
    }
  }
  const Vo = [
    ["type", "Type"],
    ["status", "Status"],
    ["level", "Level (data.level)"],
    ["unit", "Unit (data.unit)"],
    ["id", "Node id"],
    ["label", "Label"]
  ];
  function Gn(e, t) {
    const n = yo(t, P);
    Gt(e, "--loc-node-bg", n && n.bg), Gt(e, "--loc-node-text", n && n.text), Gt(e, "--loc-node-border", n && n.border);
  }
  function Gt(e, t, n) {
    n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
  }
  function ct() {
    for (const e in f) w[e] && Gn(f[e], w[e]);
    s.showLegend && Rt();
  }
  const Zo = { FILLED: "Filled", VACANT: "Vacant", UNFUNDED: "Unfunded" };
  function zn() {
    Ee.classList.toggle("loc-on", s.showLegend), s.showLegend && Rt();
  }
  function zt(e) {
    return s.showLegend = e == null ? !s.showLegend : !!e, zn(), Z(), A(), p("legend-change", { legend: s.showLegend }), s.showLegend;
  }
  function Rn(e) {
    return zt(e ?? !s.showLegend);
  }
  function Rt() {
    if (c.legendSlot) return;
    const e = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ Object.create(null);
    for (const l of y)
      l.type && (e[l.type] = !0), l.status && (t[l.status] = !0);
    let n = "";
    const o = [];
    e.department && o.push(Hn("loc-leg-dept", "Department")), e.position && o.push(Hn("loc-leg-pos", "Position")), o.length && (n += Ht("Type", o.join("")));
    const i = ["FILLED", "VACANT", "UNFUNDED"].filter((l) => t[l]).map((l) => `<div class="loc-leg-row"><span class="loc-leg-badge loc-${l}">${Zo[l] || l}</span></div>`);
    i.length && (n += Ht("Status", i.join("")));
    const a = P.filter((l) => l.enabled && (l.style.bg || l.style.border)).map((l) => `<div class="loc-leg-row"><span class="loc-leg-swatch" style="background:${B(l.style.bg || "#fff")};border-color:${B(l.style.border || l.style.bg || "#d0d5dd")}"></span><span class="loc-leg-label">${B(l.field)} = ${B(l.value || "—")}</span></div>`).join("");
    a && (n += Ht("Rules", a)), Jt.innerHTML = n || '<div class="loc-leg-empty">No legend items yet.</div>';
  }
  function Ht(e, t) {
    return `<div class="loc-leg-section"><div class="loc-leg-title">${e}</div>${t}</div>`;
  }
  function Hn(e, t) {
    return `<div class="loc-leg-row"><span class="loc-leg-swatch ${e}"></span><span class="loc-leg-label">${t}</span></div>`;
  }
  function K() {
    return {
      spacingX: s.spacingX,
      spacingY: s.spacingY,
      gridSize: s.gridSize,
      orientation: s.orientation,
      subtreeMode: s.subtreeMode,
      showGrid: s.showGrid,
      snapGrid: s.snapGrid,
      alignGrid: s.alignGrid,
      showImages: s.showImages,
      autoEdgeSide: s.autoEdgeSide,
      cardWidth: s.cardWidth,
      photoHeight: s.photoHeight,
      photoContain: s.photoContain,
      themeRules: P.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    };
  }
  function jn(e, t) {
    if (e = e || {}, typeof e.spacingX == "number" && (s.spacingX = e.spacingX), typeof e.spacingY == "number" && (s.spacingY = e.spacingY), typeof e.gridSize == "number" && (s.gridSize = e.gridSize), e.orientation && (s.orientation = Ge(e.orientation)), e.subtreeMode && (s.subtreeMode = e.subtreeMode), "showGrid" in e && (s.showGrid = !!e.showGrid), "snapGrid" in e && (s.snapGrid = !!e.snapGrid), "alignGrid" in e && (s.alignGrid = !!e.alignGrid), "showImages" in e && !!e.showImages !== s.showImages) {
      s.showImages = !!e.showImages;
      for (const o in f)
        f[o].remove(), delete f[o];
    }
    "autoEdgeSide" in e && (s.autoEdgeSide = !!e.autoEdgeSide);
    let n = !1;
    if (typeof e.cardWidth == "number" && (s.cardWidth = Math.max(100, e.cardWidth), n = !0), typeof e.photoHeight == "number" && (s.photoHeight = Math.max(40, e.photoHeight), n = !0), "photoContain" in e && (s.photoContain = !!e.photoContain, n = !0), n) {
      $e(), ke();
      for (const o in f) delete f[o].dataset.fitted;
    }
    Array.isArray(e.themeRules) && (P = e.themeRules.map(Ne)), Ae(), Z(), G(), F.classList.contains("loc-open") && re(), t && t.silent || p("settings-change", K()), A();
  }
  function jt(e) {
    const t = F.classList.contains("loc-open"), n = e == null ? !t : !!e;
    F.classList.toggle("loc-open", n), U && U.querySelectorAll('button[data-act="settings"]').forEach((o) => o.classList.toggle("loc-active", n)), n && re(), n !== t && p(n ? "settings-open" : "settings-close", {});
  }
  function $n() {
    jn({
      spacingX: ge.spacingX,
      spacingY: ge.spacingY,
      gridSize: ge.gridSize,
      showGrid: ge.showGrid,
      snapGrid: ge.snapGrid,
      alignGrid: ge.alignGrid,
      themeRules: ge.themeRules.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    }), ct();
  }
  function De(e, t, n, o, i) {
    return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${o}" max="${i}" value="${n}"/></label>`;
  }
  function $t(e, t, n, o) {
    return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${o ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${o || "#e0524d"}"/></label>`;
  }
  function Jo(e, t) {
    const n = (o, i) => `<option value="${o}"${e.field === o ? " selected" : ""}>${i}</option>`;
    return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + Vo.map(([o, i]) => n(o, i)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${B(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + $t(t, "bg", "BG", e.style.bg) + $t(t, "text", "Text", e.style.text) + $t(t, "border", "Border", e.style.border) + "</div></div>";
  }
  function Qo() {
    let t = pt().map((n) => `<div class="loc-preset"><button class="loc-preset-apply" data-role="preset-apply" data-name="${B(n.name)}" title="Apply this saved layout">${B(n.name)}</button><span class="loc-preset-tag">${n.full ? "full" : "pattern"}</span><button class="loc-preset-del" data-role="preset-del" data-name="${B(n.name)}" title="Delete preset">✕</button></div>`).join("");
    return t || (t = '<div class="loc-set-hint">No saved presets yet.</div>'), `<div class="loc-set-section"><div class="loc-set-title">Presets</div><div class="loc-set-hint">Save the current arrangement so an accidental mode change can’t lose it (Undo / Ctrl+Z restores it too).</div><div class="loc-preset-save"><input type="text" data-role="preset-name" placeholder="Preset name…"/><label class="loc-preset-full"><input type="checkbox" data-role="preset-full" checked/> positions</label><button data-role="preset-save">Save</button></div><div class="loc-preset-list">${t}</div></div>`;
  }
  function re() {
    if (c.settingsSlot) return;
    let e = Qo() + '<div class="loc-set-section"><div class="loc-set-title">Layout</div>' + De("spacingX", "Spacing X", s.spacingX, 0, 200) + De("spacingY", "Spacing Y", s.spacingY, 0, 260) + De("gridSize", "Grid size", s.gridSize, 6, 80) + `<label class="loc-color"><input type="checkbox" data-set-toggle="showImages"${s.showImages ? " checked" : ""}/><span>Show photos (off → user icon)</span></label><label class="loc-color"><input type="checkbox" data-set-toggle="autoEdgeSide"${s.autoEdgeSide ? " checked" : ""}/><span>Smart edges (lines follow waypoints to any side)</span></label></div>`;
    e += '<div class="loc-set-section"><div class="loc-set-title">Card size</div><div class="loc-set-hint">Applies to every person card. The photo tops the card at its full size; the name/title sit below.</div>' + De("cardWidth", "Card width", s.cardWidth, 120, 320) + De("photoHeight", "Photo height", s.photoHeight, 60, 240) + `<label class="loc-color"><input type="checkbox" data-set-toggle="photoContain"${s.photoContain ? " checked" : ""}/><span>Show whole photo (no crop)</span></label></div>`, e += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div><div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>', P.forEach((t, n) => {
      e += Jo(t, n);
    }), e += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>', e += '<div class="loc-set-foot"><button class="loc-set-reset" data-role="reset-settings" title="Restore spacing, grid &amp; theme rules to defaults">↺ Reset settings</button></div>', de.innerHTML = e;
  }
  function es(e, t) {
    const n = de.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
    return n && n.checked;
  }
  function ts(e, t) {
    const n = de.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
    return n ? n.value : "";
  }
  let ee = [], V = -1, kt = !1, Ue = null;
  function k(e) {
    return e == null ? e : JSON.parse(JSON.stringify(e));
  }
  function kn() {
    return {
      subtreeMode: s.subtreeMode,
      orientation: s.orientation,
      spacingX: s.spacingX,
      spacingY: s.spacingY,
      gridSize: s.gridSize,
      showGrid: s.showGrid,
      snapGrid: s.snapGrid,
      alignGrid: s.alignGrid,
      showImages: s.showImages,
      autoEdgeSide: s.autoEdgeSide,
      cardWidth: s.cardWidth,
      photoHeight: s.photoHeight,
      photoContain: s.photoContain,
      themeRules: P.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    };
  }
  function Xn(e) {
    e && (e.subtreeMode && (s.subtreeMode = e.subtreeMode), e.orientation && (s.orientation = Ge(e.orientation)), ["spacingX", "spacingY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (s[t] = e[t]);
    }), "showGrid" in e && (s.showGrid = !!e.showGrid), "snapGrid" in e && (s.snapGrid = !!e.snapGrid), "alignGrid" in e && (s.alignGrid = !!e.alignGrid), "showImages" in e && (s.showImages = !!e.showImages), "autoEdgeSide" in e && (s.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (s.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (s.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (s.photoContain = !!e.photoContain), $e(), ke(), Array.isArray(e.themeRules) && (P = e.themeRules.map(Ne)));
  }
  function Pn() {
    return {
      nodes: y.map((e) => k(e)),
      manualOffsets: k(h),
      edgeWaypoints: k(L),
      edgeAnchors: k(O),
      nodeOverrides: k(N),
      view: kn(),
      selectedNodeId: s.selectedNodeId
    };
  }
  function Yn(e) {
    kt = !0, y = (e.nodes || []).map(Be), w = Ke(y), h = k(e.manualOffsets) || /* @__PURE__ */ Object.create(null), L = k(e.edgeWaypoints) || /* @__PURE__ */ Object.create(null), O = k(e.edgeAnchors) || /* @__PURE__ */ Object.create(null), N = k(e.nodeOverrides) || /* @__PURE__ */ Object.create(null), Xn(e.view);
    for (const t in f)
      f[t].remove(), delete f[t];
    for (const t in m)
      m[t].remove(), delete m[t];
    for (const t in R)
      R[t].remove(), delete R[t];
    s.selectedEdgeId = null, q.innerHTML = "", s.selectedNodeId = e.selectedNodeId && w[e.selectedNodeId] ? e.selectedNodeId : null, Ae(), G(), s.selectedNodeId && It(s.selectedNodeId), _.classList.contains("loc-open") && (s.selectedNodeId ? Ce() : oe()), F.classList.contains("loc-open") && re(), kt = !1;
  }
  function j(e) {
    if (kt) return;
    const t = Pn();
    e != null && e === Ue && V >= 0 ? ee[V] = t : (ee = ee.slice(0, V + 1), ee.push(t), V = ee.length - 1, ee.length > 100 && (ee.shift(), V--)), Ue = e ?? null, ft();
  }
  function ns() {
    ee = [Pn()], V = 0, Ue = null, ft();
  }
  function dt() {
    return V > 0;
  }
  function ut() {
    return V >= 0 && V < ee.length - 1;
  }
  function Xt() {
    dt() && (V--, Ue = null, Yn(ee[V]), ft());
  }
  function Pt() {
    ut() && (V++, Ue = null, Yn(ee[V]), ft());
  }
  function ft() {
    Z(), p("history-change", { canUndo: dt(), canRedo: ut() });
  }
  function A() {
    if (c.persist)
      try {
        localStorage.setItem(c.storageKey, JSON.stringify({
          orientation: s.orientation,
          subtreeMode: s.subtreeMode,
          spacingX: s.spacingX,
          spacingY: s.spacingY,
          zoom: s.zoom,
          panX: s.panX,
          panY: s.panY,
          showGrid: s.showGrid,
          snapGrid: s.snapGrid,
          alignGrid: s.alignGrid,
          gridSize: s.gridSize,
          editMode: s.editMode,
          showImages: s.showImages,
          showLegend: s.showLegend,
          autoEdgeSide: s.autoEdgeSide,
          cardWidth: s.cardWidth,
          photoHeight: s.photoHeight,
          photoContain: s.photoContain,
          manualOffsets: h,
          edgeWaypoints: L,
          edgeAnchors: O,
          nodeOverrides: N,
          themeRules: P,
          collapsed: y.filter((e) => e.collapsed).map((e) => e.id)
        }));
      } catch {
      }
  }
  function os() {
    if (!c.persist) return;
    let e;
    try {
      e = JSON.parse(localStorage.getItem(c.storageKey) || "null");
    } catch {
      e = null;
    }
    if (e && (e.orientation && (s.orientation = Ge(e.orientation)), e.subtreeMode && (s.subtreeMode = e.subtreeMode), ["spacingX", "spacingY", "zoom", "panX", "panY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (s[t] = e[t]);
    }), s.showGrid = !!e.showGrid, s.snapGrid = !!e.snapGrid, s.alignGrid = !!e.alignGrid, s.editMode = !!e.editMode, "showImages" in e && (s.showImages = !!e.showImages), "showLegend" in e && (s.showLegend = !!e.showLegend), "autoEdgeSide" in e && (s.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (s.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (s.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (s.photoContain = !!e.photoContain), $e(), ke(), e.manualOffsets && (h = e.manualOffsets), e.edgeWaypoints && (L = e.edgeWaypoints), e.edgeAnchors && (O = e.edgeAnchors), e.nodeOverrides && (N = e.nodeOverrides, Tt()), Array.isArray(e.themeRules) && (P = e.themeRules.map(Ne)), Array.isArray(e.collapsed))) {
      const t = new Set(e.collapsed);
      for (const n of y) n.collapsed = t.has(n.id);
    }
  }
  function Dn() {
    return c.storageKey + ".presets";
  }
  function qe() {
    try {
      return JSON.parse(localStorage.getItem(Dn()) || "{}") || {};
    } catch {
      return {};
    }
  }
  function Un(e) {
    try {
      localStorage.setItem(Dn(), JSON.stringify(e));
    } catch {
    }
  }
  function qn(e) {
    const t = { full: e !== !1, view: kn() };
    return t.full && (t.layout = {
      manualOffsets: k(h),
      edgeWaypoints: k(L),
      edgeAnchors: k(O),
      nodeOverrides: k(N),
      collapsed: y.filter((n) => n.collapsed).map((n) => n.id)
    }), t;
  }
  function ss(e) {
    return qn(!(e && e.full === !1));
  }
  function _n(e) {
    if (e) {
      if (Xn(e.view), e.full && e.layout) {
        h = k(e.layout.manualOffsets) || /* @__PURE__ */ Object.create(null), L = k(e.layout.edgeWaypoints) || /* @__PURE__ */ Object.create(null), O = k(e.layout.edgeAnchors) || /* @__PURE__ */ Object.create(null), N = k(e.layout.nodeOverrides) || /* @__PURE__ */ Object.create(null), Tt();
        const t = new Set(e.layout.collapsed || []);
        for (const n of y) n.collapsed = t.has(n.id);
      } else
        h = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null);
      s.selectedNodeId = null, s.selectedEdgeId = null, q.innerHTML = "";
      for (const t in f)
        f[t].remove(), delete f[t];
      for (const t in m)
        m[t].remove(), delete m[t];
      for (const t in R)
        R[t].remove(), delete R[t];
      Ae(), Z(), G(), F.classList.contains("loc-open") && re(), et(), j(), p("settings-change", K());
    }
  }
  function pt() {
    const e = qe();
    return Object.keys(e).map((t) => ({ name: t, full: !!e[t].full, savedAt: e[t].savedAt || null }));
  }
  function is() {
    return qe();
  }
  function Fn(e, t) {
    if (e = String(e ?? "").trim(), !e) return null;
    const n = qn(!(t && t.full === !1));
    n.name = e, n.savedAt = Date.now();
    const o = qe();
    return o[e] = n, Un(o), F.classList.contains("loc-open") && re(), p("presets-change", { presets: pt() }), n;
  }
  function Wn(e) {
    const t = qe()[String(e)];
    return t ? (_n(t), p("preset-load", { name: String(e), preset: t }), !0) : !1;
  }
  function Bn(e) {
    const t = qe();
    return String(e) in t ? (delete t[String(e)], Un(t), F.classList.contains("loc-open") && re(), p("presets-change", { presets: pt() }), !0) : !1;
  }
  function Kn(e) {
    const t = ws(s, y, h, L);
    return t.editMode = s.editMode, t.edgeAnchors = O, t.nodeOverrides = N, t.settings = K(), e !== !1 && ht(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
  }
  const Vn = document.createElement("canvas").getContext("2d");
  function as(e, t) {
    return Vn.font = t, Vn.measureText(e).width;
  }
  function ls(e) {
    const t = f[e.id];
    if (!t) return 1;
    const n = parseFloat(t.style.getPropertyValue("--loc-fit"));
    return isFinite(n) && n > 0 ? n : 1;
  }
  function _e(e, t) {
    const n = [];
    for (const o in m) n.push(m[o].getAttribute("d"));
    return Is(C, n, {
      manualOffsets: h,
      raster: !!e,
      measureText: as,
      fitOf: ls,
      photoHeight: s.photoHeight,
      photoContain: s.photoContain,
      images: t || null
    });
  }
  function rs(e) {
    return new Promise((t) => {
      const n = new Image();
      n.crossOrigin = "anonymous", n.referrerPolicy = "no-referrer", n.onload = () => {
        try {
          const o = n.naturalWidth || n.width, i = n.naturalHeight || n.height;
          if (!o || !i) {
            t(null);
            return;
          }
          const a = document.createElement("canvas");
          a.width = o, a.height = i, a.getContext("2d").drawImage(n, 0, 0), t(a.toDataURL("image/png"));
        } catch {
          t(null);
        }
      }, n.onerror = () => t(null), n.src = e;
    });
  }
  function gt() {
    if (!s.showImages) return Promise.resolve({});
    const e = [], t = /* @__PURE__ */ new Set();
    for (const n of y) {
      const o = n.type !== "department" && n.data && n.data.photo_url;
      o && !t.has(o) && (t.add(o), e.push(o));
    }
    return e.length ? Promise.all(e.map((n) => rs(n).then((o) => [n, o]))).then((n) => {
      const o = {};
      for (const [i, a] of n) a && (o[i] = a);
      return o;
    }) : Promise.resolve({});
  }
  function Zn() {
    return gt().then((e) => {
      const t = _e(!1, e);
      return ht(new Blob([t], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), t;
    });
  }
  function Jn(e) {
    return e = e || 3, gt().then((t) => new Promise((n) => {
      const o = _t(C, h, 40), i = 16e3, a = 2e8;
      let l = Math.min(e, i / o.w, i / o.h);
      o.w * l * o.h * l > a && (l = Math.sqrt(a / (o.w * o.h))), l = Math.max(0.05, l);
      const r = URL.createObjectURL(new Blob([_e(!0, t)], { type: "image/svg+xml;charset=utf-8" })), u = new Image();
      u.onload = () => {
        const d = document.createElement("canvas");
        d.width = Math.round(o.w * l), d.height = Math.round(o.h * l);
        const g = d.getContext("2d");
        g.setTransform(l, 0, 0, l, 0, 0), g.drawImage(u, 0, 0), URL.revokeObjectURL(r);
        try {
          d.toBlob((I) => {
            I && ht(I, "org-chart.png"), n(!!I);
          }, "image/png");
        } catch {
          n(!1);
        }
      }, u.onerror = () => {
        URL.revokeObjectURL(r), n(!1);
      }, u.src = r;
    }));
  }
  function cs(e) {
    e = e || {};
    const t = +e.scale > 0 ? +e.scale : 2, n = typeof e.quality == "number" ? Math.min(1, Math.max(0.3, e.quality)) : 0.82, o = +e.maxSide > 0 ? +e.maxSide : 4e3, i = e.as === "dataURL" || e.as === "dataurl", a = e.filename || "org-chart.webp";
    return gt().then((l) => new Promise((r) => {
      const u = _t(C, h, 40), d = 2e8;
      let g = Math.min(t, o / u.w, o / u.h);
      u.w * g * u.h * g > d && (g = Math.sqrt(d / (u.w * u.h))), g = Math.max(0.05, g);
      const I = URL.createObjectURL(new Blob([_e(!0, l)], { type: "image/svg+xml;charset=utf-8" })), v = new Image();
      v.onload = () => {
        const M = document.createElement("canvas");
        M.width = Math.round(u.w * g), M.height = Math.round(u.h * g);
        const z = M.getContext("2d");
        z.setTransform(g, 0, 0, g, 0, 0), z.drawImage(v, 0, 0), URL.revokeObjectURL(I);
        try {
          if (i) {
            const $ = M.toDataURL("image/webp", n);
            if (e.download) {
              const We = document.createElement("a");
              We.href = $, We.download = a, document.body.appendChild(We), We.click(), We.remove();
            }
            r($);
            return;
          }
          M.toBlob(($) => {
            $ && e.download && ht($, a), r($ || null);
          }, "image/webp", n);
        } catch {
          r(null);
        }
      }, v.onerror = () => {
        URL.revokeObjectURL(I), r(null);
      }, v.src = I;
    }));
  }
  function Qn() {
    return gt().then((e) => {
      const t = window.open("", "_blank");
      return t ? (t.document.open(), t.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + _e(!1, e) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), t.document.close(), !0) : !1;
    });
  }
  function ht(e, t) {
    const n = URL.createObjectURL(e), o = document.createElement("a");
    o.href = n, o.download = t, document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(n);
  }
  function eo(e, t, n) {
    const o = !(n && n.resetEdits);
    y = (e || []).map(Be), w = Ke(y), o || (h = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), N = /* @__PURE__ */ Object.create(null)), s.selectedNodeId = null, s.selectedEdgeId = null, se = /* @__PURE__ */ new Set(), oe();
    for (const i in f)
      f[i].remove(), delete f[i];
    for (const i in m)
      m[i].remove(), delete m[i];
    for (const i in R)
      R[i].remove(), delete R[i];
    t && (t.subtreeMode && (s.subtreeMode = t.subtreeMode), t.orientation && (s.orientation = Ge(t.orientation)), t.manualOffsets && (h = t.manualOffsets), t.edgeWaypoints && (L = t.edgeWaypoints), t.edgeAnchors && (O = t.edgeAnchors), t.nodeOverrides && (N = t.nodeOverrides), typeof t.editMode == "boolean" && (s.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (P = t.settings.themeRules.map(Ne))), o && Tt(), Nt(), Z(), G(), c.fitOnInit && we();
  }
  function ds(e) {
    const { nodes: t, meta: n } = Ls(e);
    return eo(t, n), t.length;
  }
  function to(e) {
    const t = Ge(e);
    s.orientation = t, h = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), le(), Z(), G(), et(), p("orientation-change", { orientation: t }), j();
  }
  function no(e) {
    s.subtreeMode = e, h = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), le(), Z(), G(), et(), p("subtree-mode-change", { subtreeMode: e }), j();
  }
  function us(e, t) {
    e != null && (s.spacingX = e), t != null && (s.spacingY = t), G(), p("settings-change", K()), j("spacing");
  }
  function mt(e, t) {
    e in s ? (s[e] = t, e === "showGrid" && Ae(), e === "alignGrid" && (h = /* @__PURE__ */ Object.create(null), G()), Z(), A(), ["showGrid", "snapGrid", "alignGrid", "gridSize"].includes(e) && p("settings-change", K())) : c[e] = t;
  }
  function oo(e) {
    return mt("showGrid", !!e), s.showGrid;
  }
  function fs(e) {
    return mt("snapGrid", !!e), s.snapGrid;
  }
  function ps(e) {
    return mt("alignGrid", !!e), s.alignGrid;
  }
  function gs(e) {
    return oo(e ?? !s.showGrid);
  }
  function so(e) {
    return s.autoEdgeSide = e == null ? !s.autoEdgeSide : !!e, le(), G(), F.classList.contains("loc-open") && re(), A(), p("settings-change", K()), s.autoEdgeSide;
  }
  function Yt(e) {
    s.showImages = e == null ? !s.showImages : !!e;
    for (const t in f)
      f[t].remove(), delete f[t];
    return Qe(), Z(), A(), p("settings-change", K()), s.showImages;
  }
  function Dt() {
    h = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), le(), G(), et(), j();
  }
  function io() {
    dn(), oe(), Dt(), we();
  }
  function ao() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function bt() {
    return ao() === T;
  }
  function lo() {
    const e = T.requestFullscreen || T.webkitRequestFullscreen;
    if (e)
      try {
        const t = e.call(T);
        t && t.catch && t.catch(() => {
        });
      } catch {
      }
  }
  function ro() {
    const e = document.exitFullscreen || document.webkitExitFullscreen;
    if (e && ao())
      try {
        e.call(document);
      } catch {
      }
  }
  function Ut(e) {
    const t = e == null ? !bt() : !!e;
    return t ? lo() : ro(), t;
  }
  function co() {
    const e = bt();
    T.classList.toggle("loc-fullscreen", e), ie && (ie.title = e ? "Exit fullscreen" : "Fullscreen"), Z(), we(), p("fullscreen-change", { fullscreen: e });
  }
  H(Ze, "pointerdown", (e) => {
    const t = e.target.closest(".loc-node");
    t && Co(e, t.dataset.id);
  }), H(Ze, "click", (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !c.readonly) {
      rn(t.closest(".loc-node").dataset.id);
      return;
    }
    const n = e.target.closest(".loc-node");
    n && p("node-click", { id: n.dataset.id, node: w[n.dataset.id] });
  }), H(Re, "pointerdown", (e) => {
    const t = e.target.closest("path");
    t && (e.stopPropagation(), wn(t.dataset.edge));
  }), H(Re, "dblclick", (e) => {
    if (c.readonly || !s.editMode) return;
    const t = e.target.closest("path");
    if (!t) return;
    const n = t.dataset.edge;
    wn(n);
    const o = Mt(n);
    if (!o) return;
    const i = it(ue(e.clientX, e.clientY));
    (L[n] || (L[n] = [])).splice(qo(o, i), 0, i), be(n), fe(), A(), j();
  }), H(q, "pointerdown", (e) => {
    if (c.readonly || !s.editMode) return;
    const t = e.target, n = s.selectedEdgeId;
    if (!n) return;
    if (t.dataset.ep) {
      e.stopPropagation(), e.preventDefault(), X = { id: n, kind: "ep", which: t.dataset.ep }, D("pointermove", Ln), D("pointerup", Mn);
      return;
    }
    let o;
    if (t.dataset.wp != null) o = +t.dataset.wp;
    else if (t.dataset.add != null) {
      const i = +t.dataset.add;
      (L[n] || (L[n] = [])).splice(i, 0, it(ue(e.clientX, e.clientY))), o = i, be(n);
    } else return;
    e.stopPropagation(), e.preventDefault(), X = { id: n, idx: o }, D("pointermove", uo), D("pointerup", fo);
  }), H(q, "dblclick", (e) => {
    const t = e.target;
    if (t.dataset.ep === "parent") {
      Ct(s.selectedEdgeId);
      return;
    }
    if (t.dataset.wp == null) return;
    const n = s.selectedEdgeId, o = L[n];
    o && (o.splice(+t.dataset.wp, 1), o.length || delete L[n], be(n), fe(), A(), j());
  });
  function uo(e) {
    if (!X) return;
    const t = L[X.id];
    t && (t[X.idx] = To(X.id, it(ue(e.clientX, e.clientY))), be(X.id), fe());
  }
  function fo() {
    X = null, hn(), J("pointermove", uo), J("pointerup", fo), A(), j();
  }
  H(Ee, "click", (e) => {
    e.target.closest('[data-role="legend-close"]') && zt(!1);
  }), H(_, "click", (e) => {
    if (e.target.closest('[data-role="panel-close"]')) {
      oe();
      return;
    }
    if (e.target.closest('[data-role="add-child"]')) {
      Nn(s.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="detach"]')) {
      Ct(s.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="attach"]')) {
      const n = s.selectedNodeId;
      oe(), An(n);
      return;
    }
    if (e.target.closest('[data-role="del-node"]')) {
      Tn(s.selectedNodeId);
      return;
    }
    const t = e.target.closest("[data-uidx]");
    if (t) {
      const n = t.closest('[data-role="user-results"]'), o = n && n._users && n._users[+t.dataset.uidx];
      o && Bo(o);
      return;
    }
  }), H(je, "input", (e) => {
    if (!s.editMode) return;
    const t = e.target.closest("[data-field]");
    if (!t) return;
    const n = s.selectedNodeId;
    if (!n) return;
    const o = t.dataset.field;
    let i = t.value;
    if (o === "type") {
      ve(n, { type: i }), Ce();
      return;
    }
    if (o === "width" || o === "height") {
      ve(n, { [o]: Math.max(20, parseFloat(i) || 0) });
      return;
    }
    if (o === "photo_url") {
      const a = w[n];
      ve(n, { data: Object.assign({}, a.data, { photo_url: i || null }) });
      return;
    }
    if (o === "layoutMode") {
      ve(n, { layoutMode: i || null });
      return;
    }
    ve(n, { [o]: i }), o === "personName" && Fo(i);
  }), H(F, "click", (e) => {
    if (e.target.closest('[data-role="settings-close"]')) {
      jt(!1);
      return;
    }
    if (e.target.closest('[data-role="reset-settings"]')) {
      $n();
      return;
    }
    if (e.target.closest('[data-role="preset-save"]')) {
      const i = (de.querySelector('[data-role="preset-name"]') || {}).value || "", a = !!(de.querySelector('[data-role="preset-full"]') || {}).checked;
      i.trim() && Fn(i, { full: a });
      return;
    }
    const t = e.target.closest('[data-role="preset-apply"]');
    if (t) {
      Wn(t.dataset.name);
      return;
    }
    const n = e.target.closest('[data-role="preset-del"]');
    if (n) {
      Bn(n.dataset.name);
      return;
    }
    if (e.target.closest('[data-role="add-rule"]')) {
      P.push(Ne({ field: "type", value: "", style: {} })), re(), ct(), A(), p("settings-change", K());
      return;
    }
    const o = e.target.closest('[data-rk="remove"]');
    o && (P.splice(+o.dataset.rule, 1), re(), ct(), A(), p("settings-change", K()));
  }), H(de, "input", (e) => {
    const t = e.target;
    if (t.dataset.set != null) {
      const n = t.dataset.set, o = parseFloat(t.value), i = de.querySelector(`[data-rangelabel="${n}"]`);
      if (i && (i.textContent = o), n === "cardWidth") {
        he({ width: o });
        return;
      }
      if (n === "photoHeight") {
        he({ photoHeight: o });
        return;
      }
      s[n] = o, G(), p("settings-change", K()), A();
      return;
    }
    if (t.dataset.setToggle === "showImages") {
      Yt(t.checked);
      return;
    }
    if (t.dataset.setToggle === "autoEdgeSide") {
      so(t.checked);
      return;
    }
    if (t.dataset.setToggle === "photoContain") {
      he({ contain: t.checked });
      return;
    }
    if (t.dataset.rule != null) {
      const n = +t.dataset.rule, o = t.dataset.rk, i = P[n];
      if (!i) return;
      if (o === "enabled") i.enabled = t.checked;
      else if (o === "field") i.field = t.value;
      else if (o === "value") i.value = t.value;
      else if (o === "bg" || o === "text" || o === "border")
        es(n, o) && (i.style[o] = t.value);
      else if (/-on$/.test(o)) {
        const a = o.replace("-on", "");
        i.style[a] = t.checked ? ts(n, a) || "#e0524d" : "";
      }
      ct(), p("settings-change", K()), A();
    }
  });
  const te = /* @__PURE__ */ new Map();
  let Fe = null;
  H(S, "pointerdown", (e) => {
    if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn") || e.target.closest(".loc-legend"))
      return;
    ho();
    const t = () => {
      Lt(), s.selectedEdgeId && le(), ot(), pe && lt(), oe();
    };
    if (e.altKey) {
      Po(e);
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      jo(e);
      return;
    }
    if (!c.enablePan) {
      t();
      return;
    }
    const n = e.clientX, o = e.clientY, i = s.panX, a = s.panY;
    let l = !1;
    S.classList.add("loc-panning");
    const r = (d) => {
      te.size >= 2 || (!l && Math.abs(d.clientX - n) + Math.abs(d.clientY - o) > 3 && (l = !0), s.panX = i + (d.clientX - n), s.panY = a + (d.clientY - o), ye());
    }, u = () => {
      S.classList.remove("loc-panning"), J("pointermove", r), J("pointerup", u), l || t();
    };
    D("pointermove", r), D("pointerup", u);
  }), H(S, "wheel", (e) => {
    if (!c.enableZoom || e.target.closest && (e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-legend"))) return;
    e.preventDefault();
    const t = S.getBoundingClientRect(), n = e.clientX - t.left, o = e.clientY - t.top, i = e.deltaY < 0 ? 1.1 : 1 / 1.1, a = Math.min(Wt, Math.max(0.15, s.zoom * i));
    s.panX = n - (n - s.panX) * (a / s.zoom), s.panY = o - (o - s.panY) * (a / s.zoom), s.zoom = a, ye();
  }, { passive: !1 });
  const hs = () => {
    const [e, t] = [...te.values()], n = S.getBoundingClientRect();
    return { x: (e.x + t.x) / 2 - n.left, y: (e.y + t.y) / 2 - n.top };
  }, po = () => {
    const [e, t] = [...te.values()];
    return Math.hypot(e.x - t.x, e.y - t.y) || 1;
  };
  H(S, "pointerdown", (e) => {
    e.pointerType !== "touch" || !c.enableZoom || e.target.closest && (e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-legend")) || (te.set(e.pointerId, { x: e.clientX, y: e.clientY }), te.size === 2 && (Fe = { dist: po(), zoom: s.zoom }, S.classList.remove("loc-panning")));
  });
  const ms = (e) => {
    if (!te.has(e.pointerId) || (te.set(e.pointerId, { x: e.clientX, y: e.clientY }), te.size < 2 || !Fe)) return;
    const t = hs(), n = Math.min(Wt, Math.max(0.15, Fe.zoom * (po() / Fe.dist)));
    s.panX = t.x - (t.x - s.panX) * (n / s.zoom), s.panY = t.y - (t.y - s.panY) * (n / s.zoom), s.zoom = n, ye();
  }, go = (e) => {
    te.has(e.pointerId) && (te.delete(e.pointerId), te.size < 2 && (Fe = null));
  };
  D("pointermove", ms), D("pointerup", go), D("pointercancel", go);
  function D(e, t) {
    window.addEventListener(e, t), Ve.push({ target: window, type: e, fn: t });
  }
  function J(e, t) {
    window.removeEventListener(e, t);
  }
  function ho() {
    try {
      T.focus({ preventScroll: !0 });
    } catch {
    }
  }
  H(T, "keydown", (e) => {
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
    const n = (e.key || "").toLowerCase();
    if (!(e.ctrlKey || e.metaKey)) {
      if (Y.size && (n === "delete" || n === "backspace")) {
        e.preventDefault(), bn();
        return;
      }
      if (n === "escape" && Y.size) {
        e.preventDefault(), ot();
        return;
      }
      return;
    }
    n === "z" && !e.shiftKey ? (e.preventDefault(), Xt()) : (n === "z" && e.shiftKey || n === "y") && (e.preventDefault(), Pt());
  });
  function bs() {
    const e = c.toolbar && typeof c.toolbar == "object" ? c.toolbar : {}, t = (l) => e[l] !== !1, n = W("div", "loc-toolbar");
    let o = "";
    return t("subtree") && (o += i("Subtree", ["Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight"].map((l) => a("mode", l, l)).join(""))), t("orient") && (o += i("Orient", [["TopToBottom", "Top"], ["BottomToTop", "Bottom"], ["LeftToRight", "Left"], ["RightToLeft", "Right"]].map(([l, r]) => a("orient", l, r)).join(""))), t("history") && (o += i("", '<button data-act="undo" title="Undo (Ctrl+Z)">Undo</button><button data-act="redo" title="Redo (Ctrl+Shift+Z)">Redo</button>')), t("actions") && (o += i("", '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button><button data-act="reset">Reset</button><button data-act="fullscreen" title="Toggle fullscreen">Fullscreen</button>')), t("search") && (o += i("Search", '<input type="search" data-role="search" class="loc-search-input" placeholder="Search…" />')), t("grid") && (o += i("Grid", '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>')), t("mode") && (o += i("Mode", '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="images" title="Toggle photos / user icons">Images</button><button data-act="legend" title="Toggle legend">Legend</button><button data-act="settings" title="Settings &amp; theming">Settings</button>')), t("export") && (o += i("Export", '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>')), n.innerHTML = o, n.addEventListener("click", (l) => {
      const r = l.target.closest("button");
      if (r)
        if (r.dataset.mode) no(r.dataset.mode);
        else if (r.dataset.orient) to(r.dataset.orient);
        else if (r.dataset.flag)
          s[r.dataset.flag] = !s[r.dataset.flag], r.dataset.flag === "showGrid" ? Ae() : r.dataset.flag === "alignGrid" && (h = /* @__PURE__ */ Object.create(null), G()), Z(), A();
        else switch (r.dataset.act) {
          case "undo":
            Xt();
            break;
          case "redo":
            Pt();
            break;
          case "expand":
            an();
            break;
          case "collapse":
            ln();
            break;
          case "fit":
            we();
            break;
          case "relayout":
            Dt();
            break;
          case "reset":
            io();
            break;
          case "fullscreen":
            Ut();
            break;
          case "edit":
            On(!s.editMode);
            break;
          case "images":
            Yt();
            break;
          case "legend":
            Rn();
            break;
          case "settings":
            jt();
            break;
          case "png":
            Jn(3);
            break;
          case "svg":
            Zn();
            break;
          case "pdf":
            Qn();
            break;
          case "json":
            Kn(!0);
            break;
        }
    }), n.addEventListener("input", (l) => {
      const r = l.target.closest('[data-role="search"]');
      r && cn(r.value);
    }), n;
    function i(l, r) {
      return `<div class="loc-group">${l ? `<span class="loc-label">${l}</span>` : ""}${r}</div>`;
    }
    function a(l, r, u) {
      return `<button data-${l}="${r}">${u}</button>`;
    }
  }
  function Z() {
    U && (U.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === s.subtreeMode)), U.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === s.orientation)), U.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!s[e.dataset.flag])), U.querySelectorAll('button[data-act="edit"]').forEach((e) => e.classList.toggle("loc-active", s.editMode)), U.querySelectorAll('button[data-act="images"]').forEach((e) => e.classList.toggle("loc-active", s.showImages)), U.querySelectorAll('button[data-act="legend"]').forEach((e) => e.classList.toggle("loc-active", s.showLegend)), U.querySelectorAll('button[data-act="fullscreen"]').forEach((e) => e.classList.toggle("loc-active", bt())), U.querySelectorAll('button[data-act="undo"]').forEach((e) => {
      e.disabled = !dt();
    }), U.querySelectorAll('button[data-act="redo"]').forEach((e) => {
      e.disabled = !ut();
    }));
  }
  H(document, "fullscreenchange", co), H(document, "webkitfullscreenchange", co), os(), Z(), Ae(), zn(), Nt(), G(), ns(), c.fitOnInit && we();
  let mo = !1;
  function ys() {
    if (!mo) {
      mo = !0, Ve.forEach(({ target: e, type: t, fn: n, optsL: o }) => e.removeEventListener(t, n, o)), Ve.length = 0, ze && cancelAnimationFrame(ze), Ye && clearTimeout(Ye), T.remove();
      for (const e in f) delete f[e];
      for (const e in m) delete m[e];
      for (const e in R) delete R[e];
    }
  }
  const qt = {
    root: T,
    setNodes: eo,
    loadJSON: ds,
    setOrientation: to,
    setSubtreeMode: no,
    setSpacing: us,
    setOption: mt,
    setShowGrid: oo,
    setSnapToGrid: fs,
    setAlignToGrid: ps,
    toggleGrid: gs,
    fitToScreen: we,
    relayout: Dt,
    resetView: io,
    expandAll: an,
    collapseAll: ln,
    toggleCollapse: rn,
    centerOnNode: xt,
    search: cn,
    clearSearch: dn,
    exportJSON: Kn,
    exportSVG: Zn,
    exportPNG: Jn,
    exportWebP: cs,
    exportPDF: Qn,
    buildSVG: _e,
    setEditMode: On,
    isEditMode: () => s.editMode,
    setShowImages: Yt,
    isShowingImages: () => s.showImages,
    setShowLegend: zt,
    toggleLegend: Rn,
    isShowingLegend: () => s.showLegend,
    getLegendBody: () => Jt,
    setAutoEdgeSide: so,
    isAutoEdgeSide: () => s.autoEdgeSide,
    // global card sizing
    setPhotoHeight: (e) => he({ photoHeight: e }),
    setCardWidth: (e) => he({ width: e }),
    setCardSize: he,
    setPhotoContain: (e) => he({ contain: e !== !1 }),
    // multi-select (nodes)
    getSelection: () => [...b],
    setSelection: (e) => Ho(Array.isArray(e) ? e : e ? [e] : []),
    clearSelection: () => {
      Lt(), nt();
    },
    // multi-select (connector lines)
    getEdgeSelection: () => [...Y],
    setEdgeSelection: $o,
    clearEdgeSelection: ot,
    resetSelectedEdges: bn,
    enterFullscreen: lo,
    exitFullscreen: ro,
    toggleFullscreen: Ut,
    isFullscreen: bt,
    undo: Xt,
    redo: Pt,
    canUndo: dt,
    canRedo: ut,
    updateNode: ve,
    addChild: Nn,
    deleteNode: Tn,
    reparentNode: at,
    detachNode: Ct,
    attachNode: En,
    beginAttach: An,
    cancelAttach: lt,
    isAttaching: () => !!pe,
    openInspector: Pe,
    closeInspector: oe,
    nodeScreenRect: yn,
    getSettings: K,
    setSettings: jn,
    toggleSettings: jt,
    resetSettings: $n,
    // layout presets + raw layout round-trip (for your own backend)
    saveLayoutPreset: Fn,
    loadLayoutPreset: Wn,
    deleteLayoutPreset: Bn,
    listLayoutPresets: pt,
    getLayoutPresets: is,
    getLayout: ss,
    applyLayout: _n,
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (e) => f[e] || null,
    getNodeSlotEl: (e) => f[e] ? f[e].querySelector(".loc-node-slot") : null,
    getInspectorBody: () => je,
    getSettingsBody: () => de,
    nodeThemeStyle: (e) => w[e] ? yo(w[e], P) : null,
    getState: () => ({ ...s }),
    getNodes: () => y.map((e) => ({ ...e })),
    getPositioned: () => C,
    on: vo,
    off: xo,
    destroy: ys
  };
  return qt;
}
export {
  Xs as CANVAS_PAD,
  Ps as DEFAULTS,
  Ys as DEFAULT_SETTINGS,
  Ds as DEPT_SIZE,
  Us as ORIENTATIONS,
  Ft as POS_SIZE,
  qs as SNAKE_STUB,
  _s as SUBTREE_MODES,
  Fs as VIRTUAL_ROOT_ID,
  Ws as applyOrientation,
  Is as buildChartSVG,
  Bs as buildTree,
  _t as calculateBounds,
  bo as childCount,
  vs as computeDepths,
  Ks as convertMoTree,
  Vs as convertNestedTree,
  js as createOrgChart,
  Os as edgeControlPoints,
  Zs as edgeEndpoints,
  Q as effCenter,
  ws as exportLayout,
  Ss as fitBounds,
  Js as getVisibleTree,
  Ke as indexNodes,
  Cs as isHorizontal,
  Qs as isMoArray,
  Ms as layoutOrgChart,
  ei as lh,
  ti as lw,
  Be as makeNode,
  Es as normalizeConfig,
  Ls as normalizeImported,
  Ne as normalizeRule,
  ni as normalizeSettings,
  Ns as orthoThrough,
  oi as personNameFromPos,
  yo as resolveNodeStyle,
  As as routeConnector,
  xs as searchNodes,
  si as visibleDepths,
  ii as waypointPath
};
