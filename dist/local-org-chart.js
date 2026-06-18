import { POS_SIZE as qt, makeNode as Fe, indexNodes as We, normalizeRule as Ce, exportLayout as ps, calculateBounds as Ut, fitBounds as gs, computeDepths as hs, childCount as fo, searchNodes as ms, resolveNodeStyle as po, buildChartSVG as bs, effCenter as Q, normalizeImported as ys, layoutOrgChart as ws, normalizeConfig as Ss, routeConnector as vs, edgeControlPoints as Ls, isHorizontal as xs, orthoThrough as Is } from "./core.js";
import { CANVAS_PAD as zs, DEFAULTS as Rs, DEFAULT_SETTINGS as Hs, DEPT_SIZE as js, ORIENTATIONS as $s, SNAKE_STUB as ks, SUBTREE_MODES as Ps, VIRTUAL_ROOT_ID as Xs, applyOrientation as Ys, buildTree as Ds, convertMoTree as Us, convertNestedTree as qs, edgeEndpoints as _s, getVisibleTree as Fs, isMoArray as Ws, lh as Bs, lw as Ks, normalizeSettings as Vs, personNameFromPos as Js, visibleDepths as Zs, waypointPath as Qs } from "./core.js";
const Ms = 116, Ne = "http://www.w3.org/2000/svg", Es = 0.72, As = { Top: "TopToBottom", Bottom: "BottomToTop", Left: "LeftToRight", Right: "RightToLeft" };
function Te(Se) {
  return As[Se] || Se;
}
const Os = {
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
  cardWidth: qt.width,
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
function Ns(Se, go = {}) {
  if (!Se || !Se.appendChild) throw new Error("createOrgChart: first argument must be a DOM element.");
  const c = Object.assign({}, Os, go), ho = +c.maxZoom > 1 ? +c.maxZoom : 4, s = {
    orientation: Te(c.orientation),
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
    cardWidth: +c.cardWidth || qt.width,
    photoContain: c.photoContain !== !1
  };
  let y = (c.nodes || []).map(Fe), w = We(y), h = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), N = /* @__PURE__ */ Object.create(null), b = /* @__PURE__ */ new Set(), X = (c.settings && c.settings.themeRules || c.themeRules || []).map(Ce);
  const pe = {
    spacingX: c.spacingX,
    spacingY: c.spacingY,
    gridSize: c.gridSize,
    showGrid: !!c.showGrid,
    snapGrid: !!c.snapGrid,
    alignGrid: !!c.alignGrid,
    themeRules: X.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
  };
  let mo = 0, C = [], E = /* @__PURE__ */ Object.create(null);
  const f = /* @__PURE__ */ Object.create(null), m = /* @__PURE__ */ Object.create(null), R = /* @__PURE__ */ Object.create(null);
  let P = null, v = null, Ge = 0, oe = /* @__PURE__ */ new Set();
  const Be = [], ve = /* @__PURE__ */ Object.create(null);
  function bo(e, t) {
    return (ve[e] || (ve[e] = [])).push(t), Dt;
  }
  function yo(e, t) {
    return ve[e] && (ve[e] = ve[e].filter((n) => n !== t)), Dt;
  }
  function p(e, t) {
    (ve[e] || []).forEach((n) => {
      try {
        n(t);
      } catch {
      }
    });
  }
  function $(e, t, n, o) {
    e.addEventListener(t, n, o), Be.push({ target: e, type: t, fn: n, optsL: o });
  }
  const T = document.createElement("div");
  T.className = "loc-root", T.tabIndex = -1;
  const D = c.toolbar ? us() : null;
  D && T.appendChild(D);
  const I = F("div", "loc-canvas"), Le = F("div", "loc-content"), re = F("div", "loc-grid"), xe = document.createElementNS(Ne, "svg");
  xe.setAttribute("class", "loc-connectors");
  const ze = document.createElementNS(Ne, "g");
  ze.setAttribute("class", "loc-edgehits"), xe.appendChild(ze);
  const Ke = F("div", "loc-nodes"), te = document.createElementNS(Ne, "svg");
  te.setAttribute("class", "loc-overlay");
  const U = document.createElementNS(Ne, "g");
  U.setAttribute("class", "loc-edgehandles");
  const Re = document.createElementNS(Ne, "g");
  Re.setAttribute("class", "loc-aligns"), te.appendChild(Re), te.appendChild(U);
  const mt = F("div", "loc-zoomreadout");
  mt.textContent = "100%", Le.appendChild(re), Le.appendChild(xe), Le.appendChild(Ke), Le.appendChild(te), I.appendChild(Le), I.appendChild(mt);
  let se = null;
  c.fullscreenControl && (se = F("button", "loc-fsbtn"), se.type = "button", se.title = "Fullscreen", se.setAttribute("aria-label", "Toggle fullscreen"), se.innerHTML = "⛶", $(se, "click", (e) => {
    e.stopPropagation(), Yt();
  }), I.appendChild(se)), T.appendChild(I);
  const q = F("div", "loc-panel");
  q.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Node</span><button class="loc-panel-close" title="Close" data-role="panel-close">✕</button></div><div class="loc-panel-body" data-role="panel-body"></div><div class="loc-panel-foot" data-role="panel-foot"></div>';
  const _t = bt(c.inspectorTarget) || I;
  _t.appendChild(q), _t !== I && q.classList.add("loc-panel-external");
  const He = q.querySelector('[data-role="panel-body"]'), Ft = q.querySelector('[data-role="panel-foot"]'), wo = q.querySelector(".loc-panel-title"), _ = F("div", "loc-settings");
  _.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Settings</span><button class="loc-panel-close" title="Close" data-role="settings-close">✕</button></div><div class="loc-panel-body" data-role="settings-body"></div>';
  const Wt = bt(c.settingsTarget) || I;
  Wt.appendChild(_), Wt !== I && _.classList.add("loc-panel-external");
  const ce = _.querySelector('[data-role="settings-body"]'), Ie = F("div", "loc-legend");
  Ie.innerHTML = '<div class="loc-legend-head"><span class="loc-legend-title">Legend</span><button class="loc-legend-close" title="Hide legend" data-role="legend-close">✕</button></div><div class="loc-legend-body" data-role="legend-body"></div>';
  const Bt = bt(c.legendTarget) || I;
  Bt.appendChild(Ie), Bt !== I && Ie.classList.add("loc-legend-external");
  const Kt = Ie.querySelector('[data-role="legend-body"]');
  je(), $e(), Se.appendChild(T);
  function F(e, t) {
    const n = document.createElement(e);
    return t && (n.className = t), n;
  }
  function bt(e) {
    if (!e) return null;
    const t = typeof e == "string" ? document.querySelector(e) : e;
    return t && t.appendChild ? t : null;
  }
  function Ve() {
    return Ss({
      orientation: s.orientation,
      subtreeMode: s.subtreeMode,
      spacingX: s.spacingX,
      spacingY: s.spacingY,
      gridSize: s.gridSize,
      alignGrid: s.alignGrid,
      autoEdgeSide: s.autoEdgeSide
    });
  }
  function Vt() {
    const e = ws(y, Ve());
    C = e.positioned, E = e.posById;
  }
  function G() {
    Vt(), wt(), yt(), Je(), Me(), Qe(), s.showLegend && Gt(), A(), p("layout-change", { positioned: C, mode: s.subtreeMode, orientation: s.orientation });
  }
  function Jt(e) {
    const t = /* @__PURE__ */ Object.create(null);
    for (const n of C) t[n.node.id] = Q(n, h);
    e(), Vt();
    for (const n of C) {
      const o = t[n.node.id];
      if (!o) continue;
      const i = o.x - n.cx, a = o.y - n.cy;
      Math.abs(i) > 0.5 || Math.abs(a) > 0.5 ? h[n.node.id] = { dx: i, dy: a } : delete h[n.node.id];
    }
    wt(), yt(), Je(), Me(), Qe(), A(), p("layout-change", { positioned: C, mode: s.subtreeMode, orientation: s.orientation });
  }
  function Je() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of C) {
      const n = t.node;
      e[n.id] = !0;
      let o = f[n.id];
      o || (o = vo(n), f[n.id] = o, Ke.appendChild(o)), o.style.width = n.width + "px", o.style.height = n.height + "px";
      const i = Q(t, h);
      o.style.transform = `translate(${i.x - n.width / 2}px, ${i.y - n.height / 2}px)`, c.nodeSlots || (o.dataset.fitted || (Lo(o), o.dataset.fitted = "1"), Cn(o, n)), o.classList.toggle("loc-selected", b.has(n.id)), o.classList.toggle("loc-primary", s.selectedNodeId === n.id && b.size > 1), xo(o, n);
    }
    for (const t in f) e[t] || (f[t].remove(), delete f[t]);
    p("nodes-rendered", { ids: C.map((t) => t.node.id) });
  }
  function je() {
    T.style.setProperty("--loc-photo-h", (s.photoHeight || 104) + "px"), T.style.setProperty("--loc-photo-fit", s.photoContain ? "contain" : "cover");
  }
  function $e() {
    const e = Math.max(100, s.cardWidth || qt.width), t = Math.max(60, (s.photoHeight || 104) + Ms);
    for (const n of y) n.type !== "department" && (n.width = e, n.height = t);
  }
  function ge(e) {
    e = e || {};
    const t = typeof e.width == "number" || typeof e.photoHeight == "number";
    if (typeof e.width == "number" && (s.cardWidth = Math.max(100, e.width)), typeof e.photoHeight == "number" && (s.photoHeight = Math.max(40, e.photoHeight)), "contain" in e && (s.photoContain = !!e.contain), je(), t) {
      $e();
      for (const n in f) delete f[n].dataset.fitted;
      G();
    }
    A(), p("settings-change", B());
  }
  const So = '<svg class="loc-usericon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
  function Zt(e) {
    e.textContent = "", e.innerHTML = So;
  }
  function vo(e) {
    if (c.nodeSlots) {
      const n = F("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
      return n.dataset.id = e.id, n.innerHTML = '<div class="loc-node-slot"></div>', n.appendChild(Qt()), n;
    }
    const t = F("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
    if (t.dataset.id = e.id, e.type === "department")
      t.innerHTML = '<span class="loc-lbl"></span>', t.querySelector(".loc-lbl").textContent = e.label, t.querySelector(".loc-lbl").title = e.label || "";
    else {
      t.innerHTML = '<div class="loc-photo"></div><div class="loc-ptext"><div class="loc-pname"></div><div class="loc-ptitle"></div><div class="loc-badge"></div></div>';
      const n = t.querySelector(".loc-photo"), o = e.data && e.data.photo_url;
      if (s.showImages && o) {
        const r = new Image();
        r.alt = e.personName || "", r.referrerPolicy = "no-referrer", r.onerror = () => {
          Zt(n);
        }, r.src = o, n.appendChild(r);
      } else
        Zt(n);
      const i = t.querySelector(".loc-pname"), a = t.querySelector(".loc-ptitle");
      i.textContent = e.personName || "—", i.title = e.personName || "", a.textContent = e.label, a.title = e.label || "";
      const l = t.querySelector(".loc-badge");
      e.status ? (l.textContent = e.status, l.className = "loc-badge loc-" + e.status) : l.remove();
    }
    return t.appendChild(Qt()), t;
  }
  function Qt() {
    const e = F("div", "loc-toggle");
    return e.dataset.role = "toggle", e;
  }
  function en(e) {
    return e.scrollWidth > e.clientWidth + 0.5 || e.scrollHeight > e.clientHeight + 0.5;
  }
  function Lo(e) {
    if (e.style.setProperty("--loc-fit", "1"), !en(e)) return;
    let t = Es, n = 1;
    for (let o = 0; o < 7; o++) {
      const i = (t + n) / 2;
      e.style.setProperty("--loc-fit", String(i)), en(e) ? n = i : t = i;
    }
    e.style.setProperty("--loc-fit", String(t));
  }
  function xo(e, t) {
    const n = e.querySelector('[data-role="toggle"]');
    if (!n) return;
    const o = fo(y, t.id) > 0;
    n.style.display = o ? "flex" : "none", n.textContent = t.collapsed ? "+" : "−";
    const i = t.collapsed ? "Expand" : "Collapse";
    n.title = i, n.setAttribute("aria-label", i);
  }
  function he(e) {
    return document.createElementNS(Ne, e);
  }
  function tn(e) {
    return vs(E[e.node.parentId], e, Ve(), h, x, O);
  }
  function yt() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of C) {
      const n = t.node;
      if (!n.parentId || !E[n.parentId]) continue;
      e[n.id] = !0;
      const i = tn(t);
      let a = m[n.id];
      a || (a = he("path"), m[n.id] = a, xe.appendChild(a)), a.setAttribute("d", i), a.classList.toggle("loc-sel", s.selectedEdgeId === n.id), a.classList.toggle("loc-incident", pn(n));
      let l = R[n.id];
      l || (l = he("path"), l.dataset.edge = n.id, R[n.id] = l, ze.appendChild(l)), l.setAttribute("d", i);
    }
    for (const t in m) e[t] || (m[t].remove(), delete m[t]);
    for (const t in R) e[t] || (R[t].remove(), delete R[t]);
    ke(), s.selectedEdgeId && !e[s.selectedEdgeId] ? ae() : ue();
  }
  function me(e) {
    const t = E[e];
    if (!t || !E[t.node.parentId]) return;
    const o = tn(t);
    m[e] && m[e].setAttribute("d", o), R[e] && R[e].setAttribute("d", o);
  }
  function Me() {
    Le.style.transform = `translate(${s.panX}px, ${s.panY}px) scale(${s.zoom})`, mt.textContent = Math.round(s.zoom * 100) + "%", s.selectedEdgeId && !P && ue(), A();
  }
  function wt() {
    let e = 0, t = 0, n = 0, o = 0;
    for (const a of C) {
      const l = Q(a, h), r = a.node.width / 2, u = a.node.height / 2;
      e = Math.min(e, l.x - r - 80), t = Math.min(t, l.y - u - 80), n = Math.max(n, l.x + r + 80), o = Math.max(o, l.y + u + 80);
    }
    xe.setAttribute("width", n), xe.setAttribute("height", o), te.setAttribute("width", n), te.setAttribute("height", o);
    const i = s.gridSize;
    re.style.left = e + "px", re.style.top = t + "px", re.style.width = n - e + "px", re.style.height = o - t + "px", re.style.backgroundSize = i + "px " + i + "px", re.style.backgroundPosition = (-e % i + i) % i + "px " + (-t % i + i) % i + "px";
  }
  function Ee() {
    re.classList.toggle("loc-on", s.showGrid), I.classList.toggle("loc-gridon", s.showGrid);
  }
  function be() {
    if (!C.length) return;
    const e = Ut(C, h, 0), t = gs(e, I.clientWidth, I.clientHeight);
    s.zoom = t.zoom, s.panX = t.panX, s.panY = t.panY, Me();
  }
  function St(e) {
    const t = E[e];
    if (!t) return;
    const n = Q(t, h);
    s.panX = I.clientWidth / 2 - n.x * s.zoom, s.panY = I.clientHeight / 2 - n.y * s.zoom, Me();
  }
  function Io() {
    const e = c.fitOnLayoutChange;
    return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
  }
  function Ze() {
    const e = Io();
    if (e === "fit") {
      be();
      return;
    }
    if (e === "recenter") {
      const t = y.find((o) => !o.parentId), n = s.selectedNodeId && E[s.selectedNodeId] ? s.selectedNodeId : t && t.id;
      n && St(n);
    }
  }
  function nn() {
    for (const e of y) e.collapsed = !1;
    G(), H();
  }
  function on() {
    const e = hs(y, w);
    for (const t of y) t.collapsed = e[t.id] >= 1 && fo(y, t.id) > 0;
    G(), H();
  }
  function sn(e) {
    const t = w[e];
    t && (Jt(() => {
      t.collapsed = !t.collapsed;
    }), ie(), H());
  }
  function an(e) {
    if (oe = ms(y, e), Qe(), oe.size) {
      const t = C.find((n) => oe.has(n.node.id));
      t && St(t.node.id);
    }
    return oe.size;
  }
  function ln() {
    oe = /* @__PURE__ */ new Set(), Qe();
  }
  function Qe() {
    const e = oe.size > 0;
    for (const t of C) {
      const n = f[t.node.id];
      if (!n) continue;
      const o = oe.has(t.node.id);
      n.classList.toggle("loc-highlight", e && o), n.classList.toggle("loc-dim", e && !o);
    }
    for (const t in m) m[t].classList.toggle("loc-hl", e && oe.has(t));
  }
  function Mo(e, t) {
    if (e.target.closest('[data-role="toggle"]') || (e.stopPropagation(), co(), fe && ko(t)))
      return;
    if (ae(), e.ctrlKey || e.metaKey) {
      No(t);
      return;
    }
    if (b.has(t) ? (s.selectedNodeId = t, ye(), ie()) : vt(t), p("node-select", { id: t, node: w[t], rect: hn(t) }), c.inspector && Pe(t), c.readonly || !c.enableDragging || !s.editMode) return;
    const n = b.has(t) && b.size > 1 ? [...b] : [t], o = /* @__PURE__ */ Object.create(null);
    for (const i of n) {
      const a = h[i] || { dx: 0, dy: 0 };
      o[i] = { dx: a.dx, dy: a.dy }, f[i] && f[i].classList.add("loc-dragging");
    }
    v = { id: t, groupIds: n, bases: o, startX: e.clientX, startY: e.clientY, moved: !1 }, p("node-drag-start", { id: t, node: w[t], group: n }), J("pointermove", rn), J("pointerup", cn);
  }
  function rn(e) {
    if (!v) return;
    let t = (e.clientX - v.startX) / s.zoom, n = (e.clientY - v.startY) / s.zoom;
    Math.abs(e.clientX - v.startX) + Math.abs(e.clientY - v.startY) > 3 && (v.moved = !0);
    const o = E[v.id], i = v.bases[v.id];
    if (o) {
      const a = o.cx + i.dx, l = o.cy + i.dy;
      if (s.snapGrid) {
        const r = s.gridSize;
        t = Math.round((a + t) / r) * r - a, n = Math.round((l + n) / r) * r - l;
      }
      if (v.groupIds.length === 1) {
        const r = Eo(v.id, a + t, l + n);
        t = r.cx - a, n = r.cy - l, un(r.gx, r.gy);
      }
    }
    for (const a of v.groupIds) {
      const l = v.bases[a];
      h[a] = { dx: l.dx + t, dy: l.dy + n };
    }
    Ge || (Ge = requestAnimationFrame(() => {
      Ge = 0;
      for (const a of v.groupIds)
        Oo(a), Co(a);
      p("node-drag", { id: v.id, node: w[v.id], offset: h[v.id], group: v.groupIds });
    }));
  }
  function cn() {
    let e = !1;
    if (v) {
      for (const t of v.groupIds)
        f[t] && f[t].classList.remove("loc-dragging");
      p("node-drag-end", { id: v.id, node: w[v.id], offset: h[v.id], group: v.groupIds }), wt(), e = !!v.moved;
    }
    v = null, fn(), Z("pointermove", rn), Z("pointerup", cn), A(), e && H();
  }
  const dn = 8;
  function Eo(e, t, n) {
    if (!c.snapAlign) return { cx: t, cy: n, gx: null, gy: null };
    const o = w[e];
    if (!o) return { cx: t, cy: n, gx: null, gy: null };
    const i = dn / s.zoom, a = [], l = [], r = o.parentId && E[o.parentId];
    r && a.push(Q(r, h).x);
    for (const S of C) {
      if (S.node.id === e || !o.parentId || S.node.parentId !== o.parentId) continue;
      const M = Q(S, h);
      a.push(M.x), l.push(M.y);
    }
    let u = null, d = i;
    for (const S of a) {
      const M = Math.abs(t - S);
      M < d && (d = M, t = S, u = S);
    }
    let g = null, L = i;
    for (const S of l) {
      const M = Math.abs(n - S);
      M < L && (L = M, n = S, g = S);
    }
    return { cx: t, cy: n, gx: u, gy: g };
  }
  function Ao(e, t) {
    if (!c.snapAlign) return t;
    const n = E[e];
    if (!n) return t;
    const o = E[n.node.parentId], i = dn / s.zoom, a = Q(n, h), l = [a.x], r = [a.y];
    if (o) {
      const z = Q(o, h);
      l.push(z.x), r.push(z.y);
    }
    let u = null, d = i, g = t.x;
    for (const z of l) {
      const j = Math.abs(t.x - z);
      j < d && (d = j, g = z, u = z);
    }
    let L = null, S = i, M = t.y;
    for (const z of r) {
      const j = Math.abs(t.y - z);
      j < S && (S = j, M = z, L = z);
    }
    return un(u, L), { x: g, y: M };
  }
  function un(e, t) {
    Re.innerHTML = "";
    const n = +te.getAttribute("width") || 0, o = +te.getAttribute("height") || 0, i = (a, l, r, u) => {
      const d = he("line");
      d.setAttribute("x1", a), d.setAttribute("y1", l), d.setAttribute("x2", r), d.setAttribute("y2", u), d.setAttribute("class", "loc-align-line"), Re.appendChild(d);
    };
    e != null && i(e, 0, e, o), t != null && i(0, t, n, t);
  }
  function fn() {
    Re.innerHTML = "";
  }
  function Oo(e) {
    const t = E[e], n = f[e];
    if (!t || !n) return;
    const o = Q(t, h);
    n.style.transform = `translate(${o.x - t.node.width / 2}px, ${o.y - t.node.height / 2}px)`;
  }
  function Co(e) {
    const t = E[e];
    if (t) {
      E[t.node.parentId] && me(e);
      for (const n of C) n.node.parentId === e && me(n.node.id);
      s.selectedEdgeId && ue();
    }
  }
  function ye() {
    for (const e in f)
      f[e].classList.toggle("loc-selected", b.has(e)), f[e].classList.toggle("loc-primary", s.selectedNodeId === e && b.size > 1);
  }
  function et() {
    p("selection-change", { ids: [...b], primary: s.selectedNodeId });
  }
  function vt(e) {
    b = new Set(e ? [e] : []), s.selectedNodeId = e || null, ye(), ie();
  }
  function No(e) {
    b.has(e) ? (b.delete(e), s.selectedNodeId === e && (s.selectedNodeId = b.size ? [...b][b.size - 1] : null)) : (b.add(e), s.selectedNodeId = e), ye(), ie(), et();
  }
  function To(e, t) {
    b = new Set(e), s.selectedNodeId = e.length ? e[e.length - 1] : null, ye(), ie(), et();
  }
  function Lt() {
    b = /* @__PURE__ */ new Set(), s.selectedNodeId = null, ye(), ie();
  }
  function Go(e) {
    const t = de(e.clientX, e.clientY), n = e.shiftKey ? new Set(b) : /* @__PURE__ */ new Set(), o = he("rect");
    o.setAttribute("class", "loc-marquee"), te.appendChild(o), I.classList.add("loc-marqueeing");
    let i = !1;
    const a = (r) => {
      const u = de(r.clientX, r.clientY), d = Math.min(t.x, u.x), g = Math.min(t.y, u.y), L = Math.abs(u.x - t.x), S = Math.abs(u.y - t.y);
      o.setAttribute("x", d), o.setAttribute("y", g), o.setAttribute("width", L), o.setAttribute("height", S);
      const M = new Set(n);
      for (const z of C) {
        const j = Q(z, h);
        j.x >= d && j.x <= d + L && j.y >= g && j.y <= g + S && M.add(z.node.id);
      }
      b = M, s.selectedNodeId = b.size ? [...b][b.size - 1] : null, ye(), ie(), i = !0;
    }, l = () => {
      o.remove(), I.classList.remove("loc-marqueeing"), Z("pointermove", a), Z("pointerup", l), i ? (et(), b.size === 1 && c.inspector && Pe([...b][0])) : (Lt(), ne());
    };
    J("pointermove", a), J("pointerup", l);
  }
  function pn(e) {
    return b.has(e.id) || b.has(e.parentId);
  }
  let Y = /* @__PURE__ */ new Set();
  function ke() {
    for (const e in m) m[e].classList.toggle("loc-edge-selected", Y.has(e));
  }
  function tt() {
    Y.size && (Y = /* @__PURE__ */ new Set(), ke(), p("edges-select", { ids: [] }));
  }
  function zo(e) {
    Y = new Set((e || []).filter((t) => m[t])), ke(), p("edges-select", { ids: [...Y] });
  }
  function gn() {
    if (!Y.size) return;
    let e = !1;
    for (const t of Y)
      x[t] && (delete x[t], e = !0), O[t] && (delete O[t], e = !0);
    e && (s.selectedEdgeId && Y.has(s.selectedEdgeId) && ae(), yt(), ke(), A(), H(), p("edges-reset", { ids: [...Y] }));
  }
  function nt(e, t, n, o, i, a, l, r) {
    const u = (n - e) * (r - a) - (o - t) * (l - i);
    if (Math.abs(u) < 1e-9) return !1;
    const d = ((i - e) * (r - a) - (a - t) * (l - i)) / u, g = ((i - e) * (o - t) - (a - t) * (n - e)) / u;
    return d >= 0 && d <= 1 && g >= 0 && g <= 1;
  }
  function Ro(e, t, n, o, i, a) {
    const l = n + i, r = o + a, u = (d) => d.x >= n && d.x <= l && d.y >= o && d.y <= r;
    return u(e) || u(t) ? !0 : nt(e.x, e.y, t.x, t.y, n, o, l, o) || nt(e.x, e.y, t.x, t.y, l, o, l, r) || nt(e.x, e.y, t.x, t.y, l, r, n, r) || nt(e.x, e.y, t.x, t.y, n, r, n, o);
  }
  function Ho(e, t, n, o, i) {
    const a = xt(e);
    if (!a) return !1;
    for (const l of It(a)) if (Ro(l.a, l.b, t, n, o, i)) return !0;
    return !1;
  }
  function jo(e) {
    const t = de(e.clientX, e.clientY), n = e.shiftKey ? new Set(Y) : /* @__PURE__ */ new Set(), o = he("rect");
    o.setAttribute("class", "loc-marquee loc-marquee-edge"), te.appendChild(o), I.classList.add("loc-marqueeing");
    let i = !1;
    const a = (r) => {
      const u = de(r.clientX, r.clientY), d = Math.min(t.x, u.x), g = Math.min(t.y, u.y), L = Math.abs(u.x - t.x), S = Math.abs(u.y - t.y);
      o.setAttribute("x", d), o.setAttribute("y", g), o.setAttribute("width", L), o.setAttribute("height", S);
      const M = new Set(n);
      for (const z in m) Ho(z, d, g, L, S) && M.add(z);
      Y = M, ke(), i = !0;
    }, l = () => {
      o.remove(), I.classList.remove("loc-marqueeing"), Z("pointermove", a), Z("pointerup", l), i ? p("edges-select", { ids: [...Y] }) : tt();
    };
    J("pointermove", a), J("pointerup", l);
  }
  function ie() {
    for (const e in m) {
      const t = E[e];
      m[e].classList.toggle("loc-incident", !!t && pn(t.node));
    }
  }
  function hn(e) {
    const t = f[e];
    if (!t) return null;
    const n = t.getBoundingClientRect();
    return { left: n.left, top: n.top, right: n.right, bottom: n.bottom, width: n.width, height: n.height };
  }
  function de(e, t) {
    const n = I.getBoundingClientRect();
    return { x: (e - n.left - s.panX) / s.zoom, y: (t - n.top - s.panY) / s.zoom };
  }
  function ot(e) {
    if (s.snapGrid) {
      const t = s.gridSize;
      return { x: Math.round(e.x / t) * t, y: Math.round(e.y / t) * t };
    }
    return { x: e.x, y: e.y };
  }
  function xt(e) {
    const t = E[e];
    if (!t) return null;
    const n = E[t.node.parentId];
    if (!n) return null;
    const o = x[e] || [];
    return Ls(n, t, o, Ve(), h, O[e]);
  }
  function It(e) {
    const t = [], n = xs(Ve());
    for (let o = 0; o < e.length - 1; o++) {
      const i = Is([e[o], e[o + 1]], n);
      for (let a = 0; a < i.length - 1; a++) t.push({ a: i[a], b: i[a + 1], insert: o });
    }
    return t;
  }
  function mn(e) {
    s.selectedEdgeId && m[s.selectedEdgeId] && m[s.selectedEdgeId].classList.remove("loc-sel"), b = /* @__PURE__ */ new Set(), s.selectedNodeId = null, ye(), s.selectedEdgeId = e, m[e] && m[e].classList.add("loc-sel"), ie(), ue();
  }
  function ae() {
    s.selectedEdgeId && m[s.selectedEdgeId] && m[s.selectedEdgeId].classList.remove("loc-sel"), s.selectedEdgeId = null, U.innerHTML = "";
  }
  function Mt(e, t, n, o) {
    const i = he("circle");
    return i.setAttribute("cx", e), i.setAttribute("cy", t), i.setAttribute("r", n), i.setAttribute("class", o), i;
  }
  function bn(e, t, n, o) {
    const i = he("rect");
    return i.setAttribute("x", e - n), i.setAttribute("y", t - n), i.setAttribute("width", 2 * n), i.setAttribute("height", 2 * n), i.setAttribute("rx", 2 / s.zoom), i.setAttribute("class", o), i;
  }
  function ue() {
    U.innerHTML = "";
    const e = s.selectedEdgeId;
    if (!e || c.readonly) return;
    const t = xt(e);
    if (!t) return;
    const n = x[e] || [], o = 6 / s.zoom, i = 5 / s.zoom;
    if (!s.editMode) {
      for (let d = 0; d < n.length; d++) {
        const g = Mt(n[d].x, n[d].y, o, "loc-wp-handle loc-wp-readonly");
        g.dataset.wp = d, U.appendChild(g);
      }
      return;
    }
    for (const d of It(t)) {
      const g = Mt((d.a.x + d.b.x) / 2, (d.a.y + d.b.y) / 2, i, "loc-wp-add");
      g.dataset.add = d.insert, U.appendChild(g);
    }
    for (let d = 0; d < n.length; d++) {
      const g = Mt(n[d].x, n[d].y, o, "loc-wp-handle");
      g.dataset.wp = d, U.appendChild(g);
    }
    const a = t[0], l = t[t.length - 1], r = bn(a.x, a.y, 6 / s.zoom, "loc-ep loc-ep-parent");
    r.dataset.ep = "parent", U.appendChild(r);
    const u = bn(l.x, l.y, 6 / s.zoom, "loc-ep loc-ep-child");
    u.dataset.ep = "child", U.appendChild(u);
  }
  function yn(e, t) {
    const n = Q(e, h), o = e.node.width, i = e.node.height;
    let a = (t.x - n.x) / (o / 2), l = (t.y - n.y) / (i / 2);
    const r = Math.max(Math.abs(a), Math.abs(l));
    return r > 1e-6 && (a /= r, l /= r), { nx: Math.max(-1, Math.min(1, a)), ny: Math.max(-1, Math.min(1, l)) };
  }
  const wn = 0.34;
  function Sn(e) {
    let t = e.nx, n = e.ny;
    return Math.abs(Math.abs(n) - 1) < 1e-6 && Math.abs(t) < wn ? t = 0 : Math.abs(Math.abs(t) - 1) < 1e-6 && Math.abs(n) < wn && (n = 0), { nx: t, ny: n };
  }
  function $o(e, t) {
    const n = new Set([t].concat(at(t)));
    for (let o = C.length - 1; o >= 0; o--) {
      const i = C[o];
      if (n.has(i.node.id)) continue;
      const a = Q(i, h);
      if (e.x >= a.x - i.node.width / 2 && e.x <= a.x + i.node.width / 2 && e.y >= a.y - i.node.height / 2 && e.y <= a.y + i.node.height / 2) return i.node.id;
    }
    return null;
  }
  let Ae = null;
  function Et(e) {
    Ae && f[Ae] && f[Ae].classList.remove("loc-reparent-target"), Ae = e, e && f[e] && f[e].classList.add("loc-reparent-target");
  }
  function vn(e) {
    if (!P || P.kind !== "ep") return;
    const t = P.id, n = E[t];
    if (!n) return;
    const o = E[n.node.parentId];
    if (!o) return;
    const i = ot(de(e.clientX, e.clientY));
    if (O[t] = O[t] || {}, P.changed = !0, P.which === "child")
      O[t].c = Sn(yn(n, i));
    else {
      O[t].p = Sn(yn(o, i));
      const a = $o(i, t);
      Et(a && a !== n.node.parentId ? a : null);
    }
    me(t), ue();
  }
  function Ln() {
    const e = P;
    if (P = null, Z("pointermove", vn), Z("pointerup", Ln), e && e.which === "parent" && Ae) {
      const t = Ae;
      Et(null), st(e.id, t);
      return;
    }
    Et(null), A(), e && e.changed && H();
  }
  function st(e, t) {
    const n = w[e];
    if (!n || t === e || t && at(e).indexOf(t) >= 0) return;
    const o = t || "";
    (n.parentId || "") !== o && (s.selectedEdgeId = null, U.innerHTML = "", Jt(() => {
      n.parentId = o, N[e] = Object.assign(N[e] || {}, { parentId: o }), delete x[e], delete O[e], E[e] && Object.assign(E[e].node, { parentId: o });
    }), ie(), q.classList.contains("loc-open") && s.selectedNodeId === e && Oe(), p("node-change", { id: e, node: { ...n }, patch: { parentId: o }, reparented: !0 }), H());
  }
  function At(e) {
    st(e, "");
  }
  function xn(e, t) {
    t && st(e, t);
  }
  let fe = null;
  function In(e) {
    e && (fe = e, T.classList.add("loc-attaching"), p("attach-start", { id: e }));
  }
  function it() {
    fe && (fe = null, T.classList.remove("loc-attaching"), p("attach-cancel", {}));
  }
  function ko(e) {
    const t = fe;
    return !t || !e || e === t || at(t).indexOf(e) >= 0 ? (it(), !1) : (fe = null, T.classList.remove("loc-attaching"), xn(t, e), c.inspector && Pe(t), !0);
  }
  function Po(e, t, n) {
    const o = n.x - t.x, i = n.y - t.y, a = o * o + i * i;
    let l = a ? ((e.x - t.x) * o + (e.y - t.y) * i) / a : 0;
    return l = Math.max(0, Math.min(1, l)), Math.hypot(e.x - (t.x + l * o), e.y - (t.y + l * i));
  }
  function Xo(e, t) {
    const n = It(e);
    let o = 0, i = 1 / 0;
    for (const a of n) {
      const l = Po(t, a.a, a.b);
      l < i && (i = l, o = a.insert);
    }
    return o;
  }
  const Yo = ["", "Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight"];
  function W(e) {
    return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function Ot() {
    T.classList.toggle("loc-edit", s.editMode);
  }
  function Mn(e) {
    s.editMode = !!e, Ot(), V(), s.editMode || ae(), q.classList.contains("loc-open") && Oe(), p("edit-mode-change", { editMode: s.editMode }), A();
  }
  function Pe(e) {
    c.inspector && (s.selectedNodeId = e, q.classList.add("loc-open"), Oe(), p("inspector-open", { id: e, node: w[e] }));
  }
  function ne() {
    q.classList.contains("loc-open") && (q.classList.remove("loc-open"), p("inspector-close", {}));
  }
  function Oe() {
    const e = s.selectedNodeId, t = e && w[e];
    if (!t) {
      ne();
      return;
    }
    if (wo.textContent = t.label || t.personName || t.id, c.inspectorSlot) {
      Ft.innerHTML = "";
      return;
    }
    const n = s.editMode, o = n ? "" : " disabled", i = (u, d, g) => `<input data-field="${u}" type="${g || "text"}" value="${W(d)}"${o}/>`, a = (u, d, g) => `<select data-field="${u}"${o}>` + g.map((L) => {
      const S = Array.isArray(L) ? L[0] : L, M = Array.isArray(L) ? L[1] : L || "—";
      return `<option value="${W(S)}"${String(S) === String(d ?? "") ? " selected" : ""}>${M}</option>`;
    }).join("") + "</select>", l = (u, d) => `<label class="loc-field"><span>${u}</span>${d}</label>`;
    let r = l("ID", `<input value="${W(t.id)}" disabled/>`) + l("Type", a("type", t.type, [["department", "department"], ["position", "position"]])) + l("Label", i("label", t.label));
    t.type !== "department" && (r += c.userSearch ? `<label class="loc-field loc-usersearch"><span>Person name</span>${i("personName", t.personName)}<div class="loc-usersearch-list" data-role="user-results" hidden></div></label>` : l("Person name", i("personName", t.personName)), r += l("Status", a("status", t.status, [["", "—"], ["FILLED", "FILLED"], ["VACANT", "VACANT"], ["UNFUNDED", "UNFUNDED"]])) + l("Photo URL", i("photo_url", t.data && t.data.photo_url || ""))), r += l("Layout override", a("layoutMode", t.layoutMode || "", Yo.map((u) => [u, u || "(inherit)"]))) + l("Width", i("width", t.width, "number")) + l("Height", i("height", t.height, "number")), He.innerHTML = r, Ft.innerHTML = n ? '<button data-role="add-child">+ Add child</button>' + (t.parentId ? '<button data-role="detach">Detach</button>' : '<button data-role="attach">Attach…</button>') + '<button data-role="del-node" class="loc-danger">Delete</button>' : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  let Xe = 0, En = 0;
  function Do(e) {
    if (!c.userSearch) return;
    const t = He.querySelector('[data-role="user-results"]');
    if (!t) return;
    Xe && clearTimeout(Xe);
    const n = (e || "").trim();
    if (!n) {
      t.hidden = !0, t.innerHTML = "";
      return;
    }
    const o = ++En;
    Xe = setTimeout(() => {
      try {
        Promise.resolve(c.userSearch(n, w[s.selectedNodeId])).then((i) => {
          o === En && Uo(t, Array.isArray(i) ? i : []);
        }).catch(() => {
        });
      } catch {
      }
    }, 220);
  }
  function Uo(e, t) {
    if (!t.length) {
      e.hidden = !0, e.innerHTML = "";
      return;
    }
    e.innerHTML = t.slice(0, 8).map((n, o) => {
      const i = W(n.name || n.personName || n.label || ""), a = W(n.title || n.label || n.email || "");
      return `<button type="button" class="loc-usersearch-item" data-uidx="${o}"><b>${i}</b>${a ? `<small>${a}</small>` : ""}</button>`;
    }).join(""), e.hidden = !1, e._users = t;
  }
  function qo(e) {
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
    we(t, o);
    const i = He.querySelector('[data-role="user-results"]');
    i && (i.hidden = !0, i.innerHTML = ""), Oe(), p("user-select", { id: t, user: e, node: { ...w[t] } });
  }
  function _o() {
    let e;
    do
      e = "node-" + ++mo;
    while (w[e]);
    return e;
  }
  function we(e, t) {
    const n = w[e];
    if (!n) return;
    Object.assign(n, t), E[e] && E[e].node !== n && Object.assign(E[e].node, t), N[e] = Object.assign(N[e] || {}, t);
    const o = ["type", "width", "height", "layoutMode"].some((i) => i in t);
    f[e] && (f[e].remove(), delete f[e]), o ? G() : Je(), p("node-change", { id: e, node: { ...n }, patch: t }), A(), H("field:" + e + ":" + Object.keys(t).join(","));
  }
  function at(e) {
    const t = [], n = [e];
    for (; n.length; ) {
      const o = n.pop();
      for (const i of y) i.parentId === o && (t.push(i.id), n.push(i.id));
    }
    return t;
  }
  function An(e) {
    if (!s.editMode) return;
    const t = _o(), n = Fe({ id: t, parentId: e || "", type: "position", label: "NEW POSITION", personName: "", status: "" });
    y.push(n), w[t] = n, N[t] = Object.assign({ __new: !0 }, n), G(), vt(t), Pe(t), p("node-change", { id: t, node: { ...n }, added: !0 }), A(), H();
  }
  function On(e) {
    if (!s.editMode || !e) return;
    const t = [e].concat(at(e)), n = new Set(t);
    y = y.filter((o) => !n.has(o.id)), w = We(y), t.forEach((o) => {
      N[o] = { __deleted: !0 }, f[o] && (f[o].remove(), delete f[o]), b.delete(o);
    }), n.has(s.selectedNodeId) && (s.selectedNodeId = b.size ? [...b][b.size - 1] : null, s.selectedNodeId || ne()), G(), p("node-change", { id: e, removed: !0, ids: t }), A(), H();
  }
  function Ct() {
    const e = new Set(Object.keys(N).filter((t) => N[t] && N[t].__deleted));
    e.size && (y = y.filter((t) => !e.has(t.id))), w = We(y);
    for (const t in N) {
      const n = N[t];
      if (!(!n || n.__deleted))
        if (n.__new) {
          if (!w[t]) {
            const o = Object.assign({}, n);
            delete o.__new;
            const i = Fe(o);
            y.push(i), w[t] = i;
          }
        } else w[t] && Object.assign(w[t], n);
    }
  }
  const Fo = [
    ["type", "Type"],
    ["status", "Status"],
    ["level", "Level (data.level)"],
    ["unit", "Unit (data.unit)"],
    ["id", "Node id"],
    ["label", "Label"]
  ];
  function Cn(e, t) {
    const n = po(t, X);
    Nt(e, "--loc-node-bg", n && n.bg), Nt(e, "--loc-node-text", n && n.text), Nt(e, "--loc-node-border", n && n.border);
  }
  function Nt(e, t, n) {
    n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
  }
  function lt() {
    for (const e in f) w[e] && Cn(f[e], w[e]);
    s.showLegend && Gt();
  }
  const Wo = { FILLED: "Filled", VACANT: "Vacant", UNFUNDED: "Unfunded" };
  function Nn() {
    Ie.classList.toggle("loc-on", s.showLegend), s.showLegend && Gt();
  }
  function Tt(e) {
    return s.showLegend = e == null ? !s.showLegend : !!e, Nn(), V(), A(), p("legend-change", { legend: s.showLegend }), s.showLegend;
  }
  function Tn(e) {
    return Tt(e ?? !s.showLegend);
  }
  function Gt() {
    if (c.legendSlot) return;
    const e = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ Object.create(null);
    for (const l of y)
      l.type && (e[l.type] = !0), l.status && (t[l.status] = !0);
    let n = "";
    const o = [];
    e.department && o.push(Gn("loc-leg-dept", "Department")), e.position && o.push(Gn("loc-leg-pos", "Position")), o.length && (n += zt("Type", o.join("")));
    const i = ["FILLED", "VACANT", "UNFUNDED"].filter((l) => t[l]).map((l) => `<div class="loc-leg-row"><span class="loc-leg-badge loc-${l}">${Wo[l] || l}</span></div>`);
    i.length && (n += zt("Status", i.join("")));
    const a = X.filter((l) => l.enabled && (l.style.bg || l.style.border)).map((l) => `<div class="loc-leg-row"><span class="loc-leg-swatch" style="background:${W(l.style.bg || "#fff")};border-color:${W(l.style.border || l.style.bg || "#d0d5dd")}"></span><span class="loc-leg-label">${W(l.field)} = ${W(l.value || "—")}</span></div>`).join("");
    a && (n += zt("Rules", a)), Kt.innerHTML = n || '<div class="loc-leg-empty">No legend items yet.</div>';
  }
  function zt(e, t) {
    return `<div class="loc-leg-section"><div class="loc-leg-title">${e}</div>${t}</div>`;
  }
  function Gn(e, t) {
    return `<div class="loc-leg-row"><span class="loc-leg-swatch ${e}"></span><span class="loc-leg-label">${t}</span></div>`;
  }
  function B() {
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
      themeRules: X.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    };
  }
  function zn(e, t) {
    if (e = e || {}, typeof e.spacingX == "number" && (s.spacingX = e.spacingX), typeof e.spacingY == "number" && (s.spacingY = e.spacingY), typeof e.gridSize == "number" && (s.gridSize = e.gridSize), e.orientation && (s.orientation = Te(e.orientation)), e.subtreeMode && (s.subtreeMode = e.subtreeMode), "showGrid" in e && (s.showGrid = !!e.showGrid), "snapGrid" in e && (s.snapGrid = !!e.snapGrid), "alignGrid" in e && (s.alignGrid = !!e.alignGrid), "showImages" in e && !!e.showImages !== s.showImages) {
      s.showImages = !!e.showImages;
      for (const o in f)
        f[o].remove(), delete f[o];
    }
    "autoEdgeSide" in e && (s.autoEdgeSide = !!e.autoEdgeSide);
    let n = !1;
    if (typeof e.cardWidth == "number" && (s.cardWidth = Math.max(100, e.cardWidth), n = !0), typeof e.photoHeight == "number" && (s.photoHeight = Math.max(40, e.photoHeight), n = !0), "photoContain" in e && (s.photoContain = !!e.photoContain, n = !0), n) {
      je(), $e();
      for (const o in f) delete f[o].dataset.fitted;
    }
    Array.isArray(e.themeRules) && (X = e.themeRules.map(Ce)), Ee(), V(), G(), _.classList.contains("loc-open") && le(), t && t.silent || p("settings-change", B()), A();
  }
  function Rt(e) {
    const t = _.classList.contains("loc-open"), n = e == null ? !t : !!e;
    _.classList.toggle("loc-open", n), D && D.querySelectorAll('button[data-act="settings"]').forEach((o) => o.classList.toggle("loc-active", n)), n && le(), n !== t && p(n ? "settings-open" : "settings-close", {});
  }
  function Rn() {
    zn({
      spacingX: pe.spacingX,
      spacingY: pe.spacingY,
      gridSize: pe.gridSize,
      showGrid: pe.showGrid,
      snapGrid: pe.snapGrid,
      alignGrid: pe.alignGrid,
      themeRules: pe.themeRules.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    }), lt();
  }
  function Ye(e, t, n, o, i) {
    return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${o}" max="${i}" value="${n}"/></label>`;
  }
  function Ht(e, t, n, o) {
    return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${o ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${o || "#e0524d"}"/></label>`;
  }
  function Bo(e, t) {
    const n = (o, i) => `<option value="${o}"${e.field === o ? " selected" : ""}>${i}</option>`;
    return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + Fo.map(([o, i]) => n(o, i)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${W(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Ht(t, "bg", "BG", e.style.bg) + Ht(t, "text", "Text", e.style.text) + Ht(t, "border", "Border", e.style.border) + "</div></div>";
  }
  function Ko() {
    let t = ut().map((n) => `<div class="loc-preset"><button class="loc-preset-apply" data-role="preset-apply" data-name="${W(n.name)}" title="Apply this saved layout">${W(n.name)}</button><span class="loc-preset-tag">${n.full ? "full" : "pattern"}</span><button class="loc-preset-del" data-role="preset-del" data-name="${W(n.name)}" title="Delete preset">✕</button></div>`).join("");
    return t || (t = '<div class="loc-set-hint">No saved presets yet.</div>'), `<div class="loc-set-section"><div class="loc-set-title">Presets</div><div class="loc-set-hint">Save the current arrangement so an accidental mode change can’t lose it (Undo / Ctrl+Z restores it too).</div><div class="loc-preset-save"><input type="text" data-role="preset-name" placeholder="Preset name…"/><label class="loc-preset-full"><input type="checkbox" data-role="preset-full" checked/> positions</label><button data-role="preset-save">Save</button></div><div class="loc-preset-list">${t}</div></div>`;
  }
  function le() {
    if (c.settingsSlot) return;
    let e = Ko() + '<div class="loc-set-section"><div class="loc-set-title">Layout</div>' + Ye("spacingX", "Spacing X", s.spacingX, 0, 200) + Ye("spacingY", "Spacing Y", s.spacingY, 0, 260) + Ye("gridSize", "Grid size", s.gridSize, 6, 80) + `<label class="loc-color"><input type="checkbox" data-set-toggle="showImages"${s.showImages ? " checked" : ""}/><span>Show photos (off → user icon)</span></label><label class="loc-color"><input type="checkbox" data-set-toggle="autoEdgeSide"${s.autoEdgeSide ? " checked" : ""}/><span>Smart edges (lines follow waypoints to any side)</span></label></div>`;
    e += '<div class="loc-set-section"><div class="loc-set-title">Card size</div><div class="loc-set-hint">Applies to every person card. The photo tops the card at its full size; the name/title sit below.</div>' + Ye("cardWidth", "Card width", s.cardWidth, 120, 320) + Ye("photoHeight", "Photo height", s.photoHeight, 60, 240) + `<label class="loc-color"><input type="checkbox" data-set-toggle="photoContain"${s.photoContain ? " checked" : ""}/><span>Show whole photo (no crop)</span></label></div>`, e += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div><div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>', X.forEach((t, n) => {
      e += Bo(t, n);
    }), e += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>', e += '<div class="loc-set-foot"><button class="loc-set-reset" data-role="reset-settings" title="Restore spacing, grid &amp; theme rules to defaults">↺ Reset settings</button></div>', ce.innerHTML = e;
  }
  function Vo(e, t) {
    const n = ce.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
    return n && n.checked;
  }
  function Jo(e, t) {
    const n = ce.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
    return n ? n.value : "";
  }
  let ee = [], K = -1, jt = !1, De = null;
  function k(e) {
    return e == null ? e : JSON.parse(JSON.stringify(e));
  }
  function Hn() {
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
      themeRules: X.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    };
  }
  function jn(e) {
    e && (e.subtreeMode && (s.subtreeMode = e.subtreeMode), e.orientation && (s.orientation = Te(e.orientation)), ["spacingX", "spacingY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (s[t] = e[t]);
    }), "showGrid" in e && (s.showGrid = !!e.showGrid), "snapGrid" in e && (s.snapGrid = !!e.snapGrid), "alignGrid" in e && (s.alignGrid = !!e.alignGrid), "showImages" in e && (s.showImages = !!e.showImages), "autoEdgeSide" in e && (s.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (s.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (s.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (s.photoContain = !!e.photoContain), je(), $e(), Array.isArray(e.themeRules) && (X = e.themeRules.map(Ce)));
  }
  function $n() {
    return {
      nodes: y.map((e) => k(e)),
      manualOffsets: k(h),
      edgeWaypoints: k(x),
      edgeAnchors: k(O),
      nodeOverrides: k(N),
      view: Hn(),
      selectedNodeId: s.selectedNodeId
    };
  }
  function kn(e) {
    jt = !0, y = (e.nodes || []).map(Fe), w = We(y), h = k(e.manualOffsets) || /* @__PURE__ */ Object.create(null), x = k(e.edgeWaypoints) || /* @__PURE__ */ Object.create(null), O = k(e.edgeAnchors) || /* @__PURE__ */ Object.create(null), N = k(e.nodeOverrides) || /* @__PURE__ */ Object.create(null), jn(e.view);
    for (const t in f)
      f[t].remove(), delete f[t];
    for (const t in m)
      m[t].remove(), delete m[t];
    for (const t in R)
      R[t].remove(), delete R[t];
    s.selectedEdgeId = null, U.innerHTML = "", s.selectedNodeId = e.selectedNodeId && w[e.selectedNodeId] ? e.selectedNodeId : null, Ee(), G(), s.selectedNodeId && vt(s.selectedNodeId), q.classList.contains("loc-open") && (s.selectedNodeId ? Oe() : ne()), _.classList.contains("loc-open") && le(), jt = !1;
  }
  function H(e) {
    if (jt) return;
    const t = $n();
    e != null && e === De && K >= 0 ? ee[K] = t : (ee = ee.slice(0, K + 1), ee.push(t), K = ee.length - 1, ee.length > 100 && (ee.shift(), K--)), De = e ?? null, dt();
  }
  function Zo() {
    ee = [$n()], K = 0, De = null, dt();
  }
  function rt() {
    return K > 0;
  }
  function ct() {
    return K >= 0 && K < ee.length - 1;
  }
  function $t() {
    rt() && (K--, De = null, kn(ee[K]), dt());
  }
  function kt() {
    ct() && (K++, De = null, kn(ee[K]), dt());
  }
  function dt() {
    V(), p("history-change", { canUndo: rt(), canRedo: ct() });
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
          edgeWaypoints: x,
          edgeAnchors: O,
          nodeOverrides: N,
          themeRules: X,
          collapsed: y.filter((e) => e.collapsed).map((e) => e.id)
        }));
      } catch {
      }
  }
  function Qo() {
    if (!c.persist) return;
    let e;
    try {
      e = JSON.parse(localStorage.getItem(c.storageKey) || "null");
    } catch {
      e = null;
    }
    if (e && (e.orientation && (s.orientation = Te(e.orientation)), e.subtreeMode && (s.subtreeMode = e.subtreeMode), ["spacingX", "spacingY", "zoom", "panX", "panY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (s[t] = e[t]);
    }), s.showGrid = !!e.showGrid, s.snapGrid = !!e.snapGrid, s.alignGrid = !!e.alignGrid, s.editMode = !!e.editMode, "showImages" in e && (s.showImages = !!e.showImages), "showLegend" in e && (s.showLegend = !!e.showLegend), "autoEdgeSide" in e && (s.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (s.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (s.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (s.photoContain = !!e.photoContain), je(), $e(), e.manualOffsets && (h = e.manualOffsets), e.edgeWaypoints && (x = e.edgeWaypoints), e.edgeAnchors && (O = e.edgeAnchors), e.nodeOverrides && (N = e.nodeOverrides, Ct()), Array.isArray(e.themeRules) && (X = e.themeRules.map(Ce)), Array.isArray(e.collapsed))) {
      const t = new Set(e.collapsed);
      for (const n of y) n.collapsed = t.has(n.id);
    }
  }
  function Pn() {
    return c.storageKey + ".presets";
  }
  function Ue() {
    try {
      return JSON.parse(localStorage.getItem(Pn()) || "{}") || {};
    } catch {
      return {};
    }
  }
  function Xn(e) {
    try {
      localStorage.setItem(Pn(), JSON.stringify(e));
    } catch {
    }
  }
  function Yn(e) {
    const t = { full: e !== !1, view: Hn() };
    return t.full && (t.layout = {
      manualOffsets: k(h),
      edgeWaypoints: k(x),
      edgeAnchors: k(O),
      nodeOverrides: k(N),
      collapsed: y.filter((n) => n.collapsed).map((n) => n.id)
    }), t;
  }
  function es(e) {
    return Yn(!(e && e.full === !1));
  }
  function Dn(e) {
    if (e) {
      if (jn(e.view), e.full && e.layout) {
        h = k(e.layout.manualOffsets) || /* @__PURE__ */ Object.create(null), x = k(e.layout.edgeWaypoints) || /* @__PURE__ */ Object.create(null), O = k(e.layout.edgeAnchors) || /* @__PURE__ */ Object.create(null), N = k(e.layout.nodeOverrides) || /* @__PURE__ */ Object.create(null), Ct();
        const t = new Set(e.layout.collapsed || []);
        for (const n of y) n.collapsed = t.has(n.id);
      } else
        h = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null);
      s.selectedNodeId = null, s.selectedEdgeId = null, U.innerHTML = "";
      for (const t in f)
        f[t].remove(), delete f[t];
      for (const t in m)
        m[t].remove(), delete m[t];
      for (const t in R)
        R[t].remove(), delete R[t];
      Ee(), V(), G(), _.classList.contains("loc-open") && le(), Ze(), H(), p("settings-change", B());
    }
  }
  function ut() {
    const e = Ue();
    return Object.keys(e).map((t) => ({ name: t, full: !!e[t].full, savedAt: e[t].savedAt || null }));
  }
  function ts() {
    return Ue();
  }
  function Un(e, t) {
    if (e = String(e ?? "").trim(), !e) return null;
    const n = Yn(!(t && t.full === !1));
    n.name = e, n.savedAt = Date.now();
    const o = Ue();
    return o[e] = n, Xn(o), _.classList.contains("loc-open") && le(), p("presets-change", { presets: ut() }), n;
  }
  function qn(e) {
    const t = Ue()[String(e)];
    return t ? (Dn(t), p("preset-load", { name: String(e), preset: t }), !0) : !1;
  }
  function _n(e) {
    const t = Ue();
    return String(e) in t ? (delete t[String(e)], Xn(t), _.classList.contains("loc-open") && le(), p("presets-change", { presets: ut() }), !0) : !1;
  }
  function Fn(e) {
    const t = ps(s, y, h, x);
    return t.editMode = s.editMode, t.edgeAnchors = O, t.nodeOverrides = N, t.settings = B(), e !== !1 && pt(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
  }
  const Wn = document.createElement("canvas").getContext("2d");
  function ns(e, t) {
    return Wn.font = t, Wn.measureText(e).width;
  }
  function os(e) {
    const t = f[e.id];
    if (!t) return 1;
    const n = parseFloat(t.style.getPropertyValue("--loc-fit"));
    return isFinite(n) && n > 0 ? n : 1;
  }
  function qe(e, t) {
    const n = [];
    for (const o in m) n.push(m[o].getAttribute("d"));
    return bs(C, n, {
      manualOffsets: h,
      raster: !!e,
      measureText: ns,
      fitOf: os,
      photoHeight: s.photoHeight,
      photoContain: s.photoContain,
      images: t || null
    });
  }
  function ss(e) {
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
  function ft() {
    if (!s.showImages) return Promise.resolve({});
    const e = [], t = /* @__PURE__ */ new Set();
    for (const n of y) {
      const o = n.type !== "department" && n.data && n.data.photo_url;
      o && !t.has(o) && (t.add(o), e.push(o));
    }
    return e.length ? Promise.all(e.map((n) => ss(n).then((o) => [n, o]))).then((n) => {
      const o = {};
      for (const [i, a] of n) a && (o[i] = a);
      return o;
    }) : Promise.resolve({});
  }
  function Bn() {
    return ft().then((e) => {
      const t = qe(!1, e);
      return pt(new Blob([t], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), t;
    });
  }
  function Kn(e) {
    return e = e || 3, ft().then((t) => new Promise((n) => {
      const o = Ut(C, h, 40), i = 16e3, a = 2e8;
      let l = Math.min(e, i / o.w, i / o.h);
      o.w * l * o.h * l > a && (l = Math.sqrt(a / (o.w * o.h))), l = Math.max(0.05, l);
      const r = URL.createObjectURL(new Blob([qe(!0, t)], { type: "image/svg+xml;charset=utf-8" })), u = new Image();
      u.onload = () => {
        const d = document.createElement("canvas");
        d.width = Math.round(o.w * l), d.height = Math.round(o.h * l);
        const g = d.getContext("2d");
        g.setTransform(l, 0, 0, l, 0, 0), g.drawImage(u, 0, 0), URL.revokeObjectURL(r);
        try {
          d.toBlob((L) => {
            L && pt(L, "org-chart.png"), n(!!L);
          }, "image/png");
        } catch {
          n(!1);
        }
      }, u.onerror = () => {
        URL.revokeObjectURL(r), n(!1);
      }, u.src = r;
    }));
  }
  function is(e) {
    e = e || {};
    const t = +e.scale > 0 ? +e.scale : 2, n = typeof e.quality == "number" ? Math.min(1, Math.max(0.3, e.quality)) : 0.82, o = +e.maxSide > 0 ? +e.maxSide : 4e3, i = e.as === "dataURL" || e.as === "dataurl", a = e.filename || "org-chart.webp";
    return ft().then((l) => new Promise((r) => {
      const u = Ut(C, h, 40), d = 2e8;
      let g = Math.min(t, o / u.w, o / u.h);
      u.w * g * u.h * g > d && (g = Math.sqrt(d / (u.w * u.h))), g = Math.max(0.05, g);
      const L = URL.createObjectURL(new Blob([qe(!0, l)], { type: "image/svg+xml;charset=utf-8" })), S = new Image();
      S.onload = () => {
        const M = document.createElement("canvas");
        M.width = Math.round(u.w * g), M.height = Math.round(u.h * g);
        const z = M.getContext("2d");
        z.setTransform(g, 0, 0, g, 0, 0), z.drawImage(S, 0, 0), URL.revokeObjectURL(L);
        try {
          if (i) {
            const j = M.toDataURL("image/webp", n);
            if (e.download) {
              const _e = document.createElement("a");
              _e.href = j, _e.download = a, document.body.appendChild(_e), _e.click(), _e.remove();
            }
            r(j);
            return;
          }
          M.toBlob((j) => {
            j && e.download && pt(j, a), r(j || null);
          }, "image/webp", n);
        } catch {
          r(null);
        }
      }, S.onerror = () => {
        URL.revokeObjectURL(L), r(null);
      }, S.src = L;
    }));
  }
  function Vn() {
    return ft().then((e) => {
      const t = window.open("", "_blank");
      return t ? (t.document.open(), t.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + qe(!1, e) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), t.document.close(), !0) : !1;
    });
  }
  function pt(e, t) {
    const n = URL.createObjectURL(e), o = document.createElement("a");
    o.href = n, o.download = t, document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(n);
  }
  function Jn(e, t, n) {
    const o = !(n && n.resetEdits);
    y = (e || []).map(Fe), w = We(y), o || (h = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), N = /* @__PURE__ */ Object.create(null)), s.selectedNodeId = null, s.selectedEdgeId = null, oe = /* @__PURE__ */ new Set(), ne();
    for (const i in f)
      f[i].remove(), delete f[i];
    for (const i in m)
      m[i].remove(), delete m[i];
    for (const i in R)
      R[i].remove(), delete R[i];
    t && (t.subtreeMode && (s.subtreeMode = t.subtreeMode), t.orientation && (s.orientation = Te(t.orientation)), t.manualOffsets && (h = t.manualOffsets), t.edgeWaypoints && (x = t.edgeWaypoints), t.edgeAnchors && (O = t.edgeAnchors), t.nodeOverrides && (N = t.nodeOverrides), typeof t.editMode == "boolean" && (s.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (X = t.settings.themeRules.map(Ce))), o && Ct(), Ot(), V(), G(), c.fitOnInit && be();
  }
  function as(e) {
    const { nodes: t, meta: n } = ys(e);
    return Jn(t, n), t.length;
  }
  function Zn(e) {
    const t = Te(e);
    s.orientation = t, h = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), ae(), V(), G(), Ze(), p("orientation-change", { orientation: t }), H();
  }
  function Qn(e) {
    s.subtreeMode = e, h = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), ae(), V(), G(), Ze(), p("subtree-mode-change", { subtreeMode: e }), H();
  }
  function ls(e, t) {
    e != null && (s.spacingX = e), t != null && (s.spacingY = t), G(), p("settings-change", B()), H("spacing");
  }
  function gt(e, t) {
    e in s ? (s[e] = t, e === "showGrid" && Ee(), e === "alignGrid" && (h = /* @__PURE__ */ Object.create(null), G()), V(), A(), ["showGrid", "snapGrid", "alignGrid", "gridSize"].includes(e) && p("settings-change", B())) : c[e] = t;
  }
  function eo(e) {
    return gt("showGrid", !!e), s.showGrid;
  }
  function rs(e) {
    return gt("snapGrid", !!e), s.snapGrid;
  }
  function cs(e) {
    return gt("alignGrid", !!e), s.alignGrid;
  }
  function ds(e) {
    return eo(e ?? !s.showGrid);
  }
  function to(e) {
    return s.autoEdgeSide = e == null ? !s.autoEdgeSide : !!e, ae(), G(), _.classList.contains("loc-open") && le(), A(), p("settings-change", B()), s.autoEdgeSide;
  }
  function Pt(e) {
    s.showImages = e == null ? !s.showImages : !!e;
    for (const t in f)
      f[t].remove(), delete f[t];
    return Je(), V(), A(), p("settings-change", B()), s.showImages;
  }
  function Xt() {
    h = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), ae(), G(), Ze(), H();
  }
  function no() {
    ln(), ne(), Xt(), be();
  }
  function oo() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function ht() {
    return oo() === T;
  }
  function so() {
    const e = T.requestFullscreen || T.webkitRequestFullscreen;
    if (e)
      try {
        const t = e.call(T);
        t && t.catch && t.catch(() => {
        });
      } catch {
      }
  }
  function io() {
    const e = document.exitFullscreen || document.webkitExitFullscreen;
    if (e && oo())
      try {
        e.call(document);
      } catch {
      }
  }
  function Yt(e) {
    const t = e == null ? !ht() : !!e;
    return t ? so() : io(), t;
  }
  function ao() {
    const e = ht();
    T.classList.toggle("loc-fullscreen", e), se && (se.title = e ? "Exit fullscreen" : "Fullscreen"), V(), be(), p("fullscreen-change", { fullscreen: e });
  }
  $(Ke, "pointerdown", (e) => {
    const t = e.target.closest(".loc-node");
    t && Mo(e, t.dataset.id);
  }), $(Ke, "click", (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !c.readonly) {
      sn(t.closest(".loc-node").dataset.id);
      return;
    }
    const n = e.target.closest(".loc-node");
    n && p("node-click", { id: n.dataset.id, node: w[n.dataset.id] });
  }), $(ze, "pointerdown", (e) => {
    const t = e.target.closest("path");
    t && (e.stopPropagation(), mn(t.dataset.edge));
  }), $(ze, "dblclick", (e) => {
    if (c.readonly || !s.editMode) return;
    const t = e.target.closest("path");
    if (!t) return;
    const n = t.dataset.edge;
    mn(n);
    const o = xt(n);
    if (!o) return;
    const i = ot(de(e.clientX, e.clientY));
    (x[n] || (x[n] = [])).splice(Xo(o, i), 0, i), me(n), ue(), A(), H();
  }), $(U, "pointerdown", (e) => {
    if (c.readonly || !s.editMode) return;
    const t = e.target, n = s.selectedEdgeId;
    if (!n) return;
    if (t.dataset.ep) {
      e.stopPropagation(), e.preventDefault(), P = { id: n, kind: "ep", which: t.dataset.ep }, J("pointermove", vn), J("pointerup", Ln);
      return;
    }
    let o;
    if (t.dataset.wp != null) o = +t.dataset.wp;
    else if (t.dataset.add != null) {
      const i = +t.dataset.add;
      (x[n] || (x[n] = [])).splice(i, 0, ot(de(e.clientX, e.clientY))), o = i, me(n);
    } else return;
    e.stopPropagation(), e.preventDefault(), P = { id: n, idx: o }, J("pointermove", lo), J("pointerup", ro);
  }), $(U, "dblclick", (e) => {
    const t = e.target;
    if (t.dataset.ep === "parent") {
      At(s.selectedEdgeId);
      return;
    }
    if (t.dataset.wp == null) return;
    const n = s.selectedEdgeId, o = x[n];
    o && (o.splice(+t.dataset.wp, 1), o.length || delete x[n], me(n), ue(), A(), H());
  });
  function lo(e) {
    if (!P) return;
    const t = x[P.id];
    t && (t[P.idx] = Ao(P.id, ot(de(e.clientX, e.clientY))), me(P.id), ue());
  }
  function ro() {
    P = null, fn(), Z("pointermove", lo), Z("pointerup", ro), A(), H();
  }
  $(Ie, "click", (e) => {
    e.target.closest('[data-role="legend-close"]') && Tt(!1);
  }), $(q, "click", (e) => {
    if (e.target.closest('[data-role="panel-close"]')) {
      ne();
      return;
    }
    if (e.target.closest('[data-role="add-child"]')) {
      An(s.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="detach"]')) {
      At(s.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="attach"]')) {
      const n = s.selectedNodeId;
      ne(), In(n);
      return;
    }
    if (e.target.closest('[data-role="del-node"]')) {
      On(s.selectedNodeId);
      return;
    }
    const t = e.target.closest("[data-uidx]");
    if (t) {
      const n = t.closest('[data-role="user-results"]'), o = n && n._users && n._users[+t.dataset.uidx];
      o && qo(o);
      return;
    }
  }), $(He, "input", (e) => {
    if (!s.editMode) return;
    const t = e.target.closest("[data-field]");
    if (!t) return;
    const n = s.selectedNodeId;
    if (!n) return;
    const o = t.dataset.field;
    let i = t.value;
    if (o === "type") {
      we(n, { type: i }), Oe();
      return;
    }
    if (o === "width" || o === "height") {
      we(n, { [o]: Math.max(20, parseFloat(i) || 0) });
      return;
    }
    if (o === "photo_url") {
      const a = w[n];
      we(n, { data: Object.assign({}, a.data, { photo_url: i || null }) });
      return;
    }
    if (o === "layoutMode") {
      we(n, { layoutMode: i || null });
      return;
    }
    we(n, { [o]: i }), o === "personName" && Do(i);
  }), $(_, "click", (e) => {
    if (e.target.closest('[data-role="settings-close"]')) {
      Rt(!1);
      return;
    }
    if (e.target.closest('[data-role="reset-settings"]')) {
      Rn();
      return;
    }
    if (e.target.closest('[data-role="preset-save"]')) {
      const i = (ce.querySelector('[data-role="preset-name"]') || {}).value || "", a = !!(ce.querySelector('[data-role="preset-full"]') || {}).checked;
      i.trim() && Un(i, { full: a });
      return;
    }
    const t = e.target.closest('[data-role="preset-apply"]');
    if (t) {
      qn(t.dataset.name);
      return;
    }
    const n = e.target.closest('[data-role="preset-del"]');
    if (n) {
      _n(n.dataset.name);
      return;
    }
    if (e.target.closest('[data-role="add-rule"]')) {
      X.push(Ce({ field: "type", value: "", style: {} })), le(), lt(), A(), p("settings-change", B());
      return;
    }
    const o = e.target.closest('[data-rk="remove"]');
    o && (X.splice(+o.dataset.rule, 1), le(), lt(), A(), p("settings-change", B()));
  }), $(ce, "input", (e) => {
    const t = e.target;
    if (t.dataset.set != null) {
      const n = t.dataset.set, o = parseFloat(t.value), i = ce.querySelector(`[data-rangelabel="${n}"]`);
      if (i && (i.textContent = o), n === "cardWidth") {
        ge({ width: o });
        return;
      }
      if (n === "photoHeight") {
        ge({ photoHeight: o });
        return;
      }
      s[n] = o, G(), p("settings-change", B()), A();
      return;
    }
    if (t.dataset.setToggle === "showImages") {
      Pt(t.checked);
      return;
    }
    if (t.dataset.setToggle === "autoEdgeSide") {
      to(t.checked);
      return;
    }
    if (t.dataset.setToggle === "photoContain") {
      ge({ contain: t.checked });
      return;
    }
    if (t.dataset.rule != null) {
      const n = +t.dataset.rule, o = t.dataset.rk, i = X[n];
      if (!i) return;
      if (o === "enabled") i.enabled = t.checked;
      else if (o === "field") i.field = t.value;
      else if (o === "value") i.value = t.value;
      else if (o === "bg" || o === "text" || o === "border")
        Vo(n, o) && (i.style[o] = t.value);
      else if (/-on$/.test(o)) {
        const a = o.replace("-on", "");
        i.style[a] = t.checked ? Jo(n, a) || "#e0524d" : "";
      }
      lt(), p("settings-change", B()), A();
    }
  }), $(I, "pointerdown", (e) => {
    if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn") || e.target.closest(".loc-legend"))
      return;
    co();
    const t = () => {
      Lt(), s.selectedEdgeId && ae(), tt(), fe && it(), ne();
    };
    if (e.altKey) {
      jo(e);
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      Go(e);
      return;
    }
    if (!c.enablePan) {
      t();
      return;
    }
    const n = e.clientX, o = e.clientY, i = s.panX, a = s.panY;
    let l = !1;
    I.classList.add("loc-panning");
    const r = (d) => {
      !l && Math.abs(d.clientX - n) + Math.abs(d.clientY - o) > 3 && (l = !0), s.panX = i + (d.clientX - n), s.panY = a + (d.clientY - o), Me();
    }, u = () => {
      I.classList.remove("loc-panning"), Z("pointermove", r), Z("pointerup", u), l || t();
    };
    J("pointermove", r), J("pointerup", u);
  }), $(I, "wheel", (e) => {
    if (!c.enableZoom || e.target.closest && (e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-legend"))) return;
    e.preventDefault();
    const t = I.getBoundingClientRect(), n = e.clientX - t.left, o = e.clientY - t.top, i = e.deltaY < 0 ? 1.1 : 1 / 1.1, a = Math.min(ho, Math.max(0.15, s.zoom * i));
    s.panX = n - (n - s.panX) * (a / s.zoom), s.panY = o - (o - s.panY) * (a / s.zoom), s.zoom = a, Me();
  }, { passive: !1 });
  function J(e, t) {
    window.addEventListener(e, t), Be.push({ target: window, type: e, fn: t });
  }
  function Z(e, t) {
    window.removeEventListener(e, t);
  }
  function co() {
    try {
      T.focus({ preventScroll: !0 });
    } catch {
    }
  }
  $(T, "keydown", (e) => {
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
    const n = (e.key || "").toLowerCase();
    if (!(e.ctrlKey || e.metaKey)) {
      if (Y.size && (n === "delete" || n === "backspace")) {
        e.preventDefault(), gn();
        return;
      }
      if (n === "escape" && Y.size) {
        e.preventDefault(), tt();
        return;
      }
      return;
    }
    n === "z" && !e.shiftKey ? (e.preventDefault(), $t()) : (n === "z" && e.shiftKey || n === "y") && (e.preventDefault(), kt());
  });
  function us() {
    const e = c.toolbar && typeof c.toolbar == "object" ? c.toolbar : {}, t = (l) => e[l] !== !1, n = F("div", "loc-toolbar");
    let o = "";
    return t("subtree") && (o += i("Subtree", ["Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight"].map((l) => a("mode", l, l)).join(""))), t("orient") && (o += i("Orient", [["TopToBottom", "Top"], ["BottomToTop", "Bottom"], ["LeftToRight", "Left"], ["RightToLeft", "Right"]].map(([l, r]) => a("orient", l, r)).join(""))), t("history") && (o += i("", '<button data-act="undo" title="Undo (Ctrl+Z)">Undo</button><button data-act="redo" title="Redo (Ctrl+Shift+Z)">Redo</button>')), t("actions") && (o += i("", '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button><button data-act="reset">Reset</button><button data-act="fullscreen" title="Toggle fullscreen">Fullscreen</button>')), t("search") && (o += i("Search", '<input type="search" data-role="search" class="loc-search-input" placeholder="Search…" />')), t("grid") && (o += i("Grid", '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>')), t("mode") && (o += i("Mode", '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="images" title="Toggle photos / user icons">Images</button><button data-act="legend" title="Toggle legend">Legend</button><button data-act="settings" title="Settings &amp; theming">Settings</button>')), t("export") && (o += i("Export", '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>')), n.innerHTML = o, n.addEventListener("click", (l) => {
      const r = l.target.closest("button");
      if (r)
        if (r.dataset.mode) Qn(r.dataset.mode);
        else if (r.dataset.orient) Zn(r.dataset.orient);
        else if (r.dataset.flag)
          s[r.dataset.flag] = !s[r.dataset.flag], r.dataset.flag === "showGrid" ? Ee() : r.dataset.flag === "alignGrid" && (h = /* @__PURE__ */ Object.create(null), G()), V(), A();
        else switch (r.dataset.act) {
          case "undo":
            $t();
            break;
          case "redo":
            kt();
            break;
          case "expand":
            nn();
            break;
          case "collapse":
            on();
            break;
          case "fit":
            be();
            break;
          case "relayout":
            Xt();
            break;
          case "reset":
            no();
            break;
          case "fullscreen":
            Yt();
            break;
          case "edit":
            Mn(!s.editMode);
            break;
          case "images":
            Pt();
            break;
          case "legend":
            Tn();
            break;
          case "settings":
            Rt();
            break;
          case "png":
            Kn(3);
            break;
          case "svg":
            Bn();
            break;
          case "pdf":
            Vn();
            break;
          case "json":
            Fn(!0);
            break;
        }
    }), n.addEventListener("input", (l) => {
      const r = l.target.closest('[data-role="search"]');
      r && an(r.value);
    }), n;
    function i(l, r) {
      return `<div class="loc-group">${l ? `<span class="loc-label">${l}</span>` : ""}${r}</div>`;
    }
    function a(l, r, u) {
      return `<button data-${l}="${r}">${u}</button>`;
    }
  }
  function V() {
    D && (D.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === s.subtreeMode)), D.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === s.orientation)), D.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!s[e.dataset.flag])), D.querySelectorAll('button[data-act="edit"]').forEach((e) => e.classList.toggle("loc-active", s.editMode)), D.querySelectorAll('button[data-act="images"]').forEach((e) => e.classList.toggle("loc-active", s.showImages)), D.querySelectorAll('button[data-act="legend"]').forEach((e) => e.classList.toggle("loc-active", s.showLegend)), D.querySelectorAll('button[data-act="fullscreen"]').forEach((e) => e.classList.toggle("loc-active", ht())), D.querySelectorAll('button[data-act="undo"]').forEach((e) => {
      e.disabled = !rt();
    }), D.querySelectorAll('button[data-act="redo"]').forEach((e) => {
      e.disabled = !ct();
    }));
  }
  $(document, "fullscreenchange", ao), $(document, "webkitfullscreenchange", ao), Qo(), V(), Ee(), Nn(), Ot(), G(), Zo(), c.fitOnInit && be();
  let uo = !1;
  function fs() {
    if (!uo) {
      uo = !0, Be.forEach(({ target: e, type: t, fn: n, optsL: o }) => e.removeEventListener(t, n, o)), Be.length = 0, Ge && cancelAnimationFrame(Ge), Xe && clearTimeout(Xe), T.remove();
      for (const e in f) delete f[e];
      for (const e in m) delete m[e];
      for (const e in R) delete R[e];
    }
  }
  const Dt = {
    root: T,
    setNodes: Jn,
    loadJSON: as,
    setOrientation: Zn,
    setSubtreeMode: Qn,
    setSpacing: ls,
    setOption: gt,
    setShowGrid: eo,
    setSnapToGrid: rs,
    setAlignToGrid: cs,
    toggleGrid: ds,
    fitToScreen: be,
    relayout: Xt,
    resetView: no,
    expandAll: nn,
    collapseAll: on,
    toggleCollapse: sn,
    centerOnNode: St,
    search: an,
    clearSearch: ln,
    exportJSON: Fn,
    exportSVG: Bn,
    exportPNG: Kn,
    exportWebP: is,
    exportPDF: Vn,
    buildSVG: qe,
    setEditMode: Mn,
    isEditMode: () => s.editMode,
    setShowImages: Pt,
    isShowingImages: () => s.showImages,
    setShowLegend: Tt,
    toggleLegend: Tn,
    isShowingLegend: () => s.showLegend,
    getLegendBody: () => Kt,
    setAutoEdgeSide: to,
    isAutoEdgeSide: () => s.autoEdgeSide,
    // global card sizing
    setPhotoHeight: (e) => ge({ photoHeight: e }),
    setCardWidth: (e) => ge({ width: e }),
    setCardSize: ge,
    setPhotoContain: (e) => ge({ contain: e !== !1 }),
    // multi-select (nodes)
    getSelection: () => [...b],
    setSelection: (e) => To(Array.isArray(e) ? e : e ? [e] : []),
    clearSelection: () => {
      Lt(), et();
    },
    // multi-select (connector lines)
    getEdgeSelection: () => [...Y],
    setEdgeSelection: zo,
    clearEdgeSelection: tt,
    resetSelectedEdges: gn,
    enterFullscreen: so,
    exitFullscreen: io,
    toggleFullscreen: Yt,
    isFullscreen: ht,
    undo: $t,
    redo: kt,
    canUndo: rt,
    canRedo: ct,
    updateNode: we,
    addChild: An,
    deleteNode: On,
    reparentNode: st,
    detachNode: At,
    attachNode: xn,
    beginAttach: In,
    cancelAttach: it,
    isAttaching: () => !!fe,
    openInspector: Pe,
    closeInspector: ne,
    nodeScreenRect: hn,
    getSettings: B,
    setSettings: zn,
    toggleSettings: Rt,
    resetSettings: Rn,
    // layout presets + raw layout round-trip (for your own backend)
    saveLayoutPreset: Un,
    loadLayoutPreset: qn,
    deleteLayoutPreset: _n,
    listLayoutPresets: ut,
    getLayoutPresets: ts,
    getLayout: es,
    applyLayout: Dn,
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (e) => f[e] || null,
    getNodeSlotEl: (e) => f[e] ? f[e].querySelector(".loc-node-slot") : null,
    getInspectorBody: () => He,
    getSettingsBody: () => ce,
    nodeThemeStyle: (e) => w[e] ? po(w[e], X) : null,
    getState: () => ({ ...s }),
    getNodes: () => y.map((e) => ({ ...e })),
    getPositioned: () => C,
    on: bo,
    off: yo,
    destroy: fs
  };
  return Dt;
}
export {
  zs as CANVAS_PAD,
  Rs as DEFAULTS,
  Hs as DEFAULT_SETTINGS,
  js as DEPT_SIZE,
  $s as ORIENTATIONS,
  qt as POS_SIZE,
  ks as SNAKE_STUB,
  Ps as SUBTREE_MODES,
  Xs as VIRTUAL_ROOT_ID,
  Ys as applyOrientation,
  bs as buildChartSVG,
  Ds as buildTree,
  Ut as calculateBounds,
  fo as childCount,
  hs as computeDepths,
  Us as convertMoTree,
  qs as convertNestedTree,
  Ns as createOrgChart,
  Ls as edgeControlPoints,
  _s as edgeEndpoints,
  Q as effCenter,
  ps as exportLayout,
  gs as fitBounds,
  Fs as getVisibleTree,
  We as indexNodes,
  xs as isHorizontal,
  Ws as isMoArray,
  ws as layoutOrgChart,
  Bs as lh,
  Ks as lw,
  Fe as makeNode,
  Ss as normalizeConfig,
  ys as normalizeImported,
  Ce as normalizeRule,
  Vs as normalizeSettings,
  Is as orthoThrough,
  Js as personNameFromPos,
  po as resolveNodeStyle,
  vs as routeConnector,
  ms as searchNodes,
  Zs as visibleDepths,
  Qs as waypointPath
};
