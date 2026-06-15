import { makeNode as Me, indexNodes as Ee, normalizeRule as ue, exportLayout as Mn, calculateBounds as jt, fitBounds as En, computeDepths as In, childCount as kt, searchNodes as Ln, resolveNodeStyle as Xt, buildChartSVG as On, effCenter as ne, normalizeImported as An, layoutOrgChart as Tn, routeConnector as Yt, normalizeConfig as Nn, edgeControlPoints as Gn, isHorizontal as Cn, orthoThrough as zn } from "./core.js";
import { CANVAS_PAD as Fn, DEFAULTS as Bn, DEFAULT_SETTINGS as _n, DEPT_SIZE as Pn, ORIENTATIONS as Hn, POS_SIZE as Un, SNAKE_STUB as qn, SUBTREE_MODES as Vn, VIRTUAL_ROOT_ID as Wn, applyOrientation as Jn, buildTree as Kn, convertMoTree as Zn, convertNestedTree as Qn, edgeEndpoints as eo, getVisibleTree as to, isMoArray as no, lh as oo, lw as io, normalizeSettings as lo, personNameFromPos as so, visibleDepths as ao, waypointPath as ro } from "./core.js";
const pe = "http://www.w3.org/2000/svg", Rn = 0.5, $n = { Top: "TopToBottom", Bottom: "BottomToTop", Left: "LeftToRight", Right: "RightToLeft" };
function fe(V) {
  return $n[V] || V;
}
const jn = {
  nodes: [],
  orientation: "TopToBottom",
  subtreeMode: "Balanced",
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  showGrid: !1,
  snapGrid: !1,
  alignGrid: !1,
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
  nodeSlots: !1,
  // render empty positioned hosts (Vue teleports card content in)
  fullscreenControl: !0,
  // show the floating fullscreen button on the canvas
  fitOnInit: !0,
  toolbar: !0,
  // true | false | { subtree, orient, actions, grid, mode, export }
  persist: !1,
  storageKey: "local-org-chart.state"
};
function Xn(V, Dt = {}) {
  if (!V || !V.appendChild) throw new Error("createOrgChart: first argument must be a DOM element.");
  const r = Object.assign({}, jn, Dt), i = {
    orientation: fe(r.orientation),
    subtreeMode: r.subtreeMode,
    spacingX: r.spacingX,
    spacingY: r.spacingY,
    zoom: 1,
    panX: 0,
    panY: 0,
    selectedNodeId: null,
    selectedEdgeId: null,
    gridSize: r.gridSize,
    showGrid: r.showGrid,
    snapGrid: r.snapGrid,
    alignGrid: r.alignGrid,
    editMode: !!r.editMode
  };
  let h = (r.nodes || []).map(Me), f = Ee(h), p = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), E = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), R = (r.settings && r.settings.themeRules || r.themeRules || []).map(ue), Ft = 0, L = [], w = /* @__PURE__ */ Object.create(null);
  const c = /* @__PURE__ */ Object.create(null), b = /* @__PURE__ */ Object.create(null), N = /* @__PURE__ */ Object.create(null);
  let A = null, m = null, oe = 0, k = /* @__PURE__ */ new Set();
  const ge = [], W = /* @__PURE__ */ Object.create(null);
  function Bt(e, t) {
    return (W[e] || (W[e] = [])).push(t), He;
  }
  function _t(e, t) {
    return W[e] && (W[e] = W[e].filter((n) => n !== t)), He;
  }
  function g(e, t) {
    (W[e] || []).forEach((n) => {
      try {
        n(t);
      } catch {
      }
    });
  }
  function O(e, t, n, o) {
    e.addEventListener(t, n, o), ge.push({ target: e, type: t, fn: n, optsL: o });
  }
  const G = document.createElement("div");
  G.className = "loc-root";
  const j = r.toolbar ? Sn() : null;
  j && G.appendChild(j);
  const x = T("div", "loc-canvas"), J = T("div", "loc-content"), ie = T("div", "loc-grid"), K = document.createElementNS(pe, "svg");
  K.setAttribute("class", "loc-connectors");
  const le = document.createElementNS(pe, "g");
  le.setAttribute("class", "loc-edgehits"), K.appendChild(le);
  const he = T("div", "loc-nodes"), se = document.createElementNS(pe, "svg");
  se.setAttribute("class", "loc-overlay");
  const C = document.createElementNS(pe, "g");
  C.setAttribute("class", "loc-edgehandles"), se.appendChild(C);
  const Ie = T("div", "loc-zoomreadout");
  Ie.textContent = "100%", J.appendChild(ie), J.appendChild(K), J.appendChild(he), J.appendChild(se), x.appendChild(J), x.appendChild(Ie);
  let X = null;
  r.fullscreenControl && (X = T("button", "loc-fsbtn"), X.type = "button", X.title = "Fullscreen", X.setAttribute("aria-label", "Toggle fullscreen"), X.innerHTML = "⛶", O(X, "click", (e) => {
    e.stopPropagation(), Pe();
  }), x.appendChild(X)), G.appendChild(x);
  const $ = T("div", "loc-panel");
  $.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Node</span><button class="loc-panel-close" title="Close" data-role="panel-close">✕</button></div><div class="loc-panel-body" data-role="panel-body"></div><div class="loc-panel-foot" data-role="panel-foot"></div>';
  const Ue = Ht(r.inspectorTarget) || x;
  Ue.appendChild($), Ue !== x && $.classList.add("loc-panel-external");
  const Le = $.querySelector('[data-role="panel-body"]'), qe = $.querySelector('[data-role="panel-foot"]'), Pt = $.querySelector(".loc-panel-title"), P = T("div", "loc-settings");
  P.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Settings</span><button class="loc-panel-close" title="Close" data-role="settings-close">✕</button></div><div class="loc-panel-body" data-role="settings-body"></div>', x.appendChild(P);
  const ae = P.querySelector('[data-role="settings-body"]');
  V.appendChild(G);
  function T(e, t) {
    const n = document.createElement(e);
    return t && (n.className = t), n;
  }
  function Ht(e) {
    if (!e) return null;
    const t = typeof e == "string" ? document.querySelector(e) : e;
    return t && t.appendChild ? t : null;
  }
  function re() {
    return Nn({
      orientation: i.orientation,
      subtreeMode: i.subtreeMode,
      spacingX: i.spacingX,
      spacingY: i.spacingY,
      gridSize: i.gridSize,
      alignGrid: i.alignGrid
    });
  }
  function Ut() {
    const e = Tn(h, re());
    L = e.positioned, w = e.posById;
  }
  function M() {
    Ut(), Kt(), Jt(), Ve(), ce(), Oe(), v(), g("layout-change", { positioned: L, mode: i.subtreeMode, orientation: i.orientation });
  }
  function Ve() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of L) {
      const n = t.node;
      e[n.id] = !0;
      let o = c[n.id];
      o || (o = qt(n), c[n.id] = o, he.appendChild(o)), o.style.width = n.width + "px", o.style.height = n.height + "px";
      const l = ne(t, p);
      o.style.transform = `translate(${l.x - n.width / 2}px, ${l.y - n.height / 2}px)`, r.nodeSlots || (o.dataset.fitted || (Vt(o), o.dataset.fitted = "1"), mt(o, n)), o.classList.toggle("loc-selected", i.selectedNodeId === n.id), Wt(o, n);
    }
    for (const t in c) e[t] || (c[t].remove(), delete c[t]);
    g("nodes-rendered", { ids: L.map((t) => t.node.id) });
  }
  function qt(e) {
    if (r.nodeSlots) {
      const n = T("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
      if (n.dataset.id = e.id, n.innerHTML = '<div class="loc-node-slot"></div>', e.type === "department") {
        const o = T("div", "loc-toggle");
        o.dataset.role = "toggle", n.appendChild(o);
      }
      return n;
    }
    const t = T("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
    if (t.dataset.id = e.id, e.type === "department") {
      t.innerHTML = '<span class="loc-lbl"></span>', t.querySelector(".loc-lbl").textContent = e.label;
      const n = T("div", "loc-toggle");
      n.dataset.role = "toggle", t.appendChild(n);
    } else {
      t.innerHTML = '<div class="loc-photo"></div><div class="loc-ptext"><div class="loc-pname"></div><div class="loc-ptitle"></div><div class="loc-badge"></div></div>';
      const n = t.querySelector(".loc-photo"), o = e.data && e.data.photo_url;
      if (o) {
        const s = new Image();
        s.alt = "", s.referrerPolicy = "no-referrer", s.onerror = () => {
          n.textContent = "●";
        }, s.src = o, n.appendChild(s);
      } else
        n.textContent = "●";
      t.querySelector(".loc-pname").textContent = e.personName || "—", t.querySelector(".loc-ptitle").textContent = e.label;
      const l = t.querySelector(".loc-badge");
      e.status ? (l.textContent = e.status, l.className = "loc-badge loc-" + e.status) : l.remove();
    }
    return t;
  }
  function We(e) {
    return e.scrollWidth > e.clientWidth + 0.5 || e.scrollHeight > e.clientHeight + 0.5;
  }
  function Vt(e) {
    if (e.style.setProperty("--loc-fit", "1"), !We(e)) return;
    let t = Rn, n = 1;
    for (let o = 0; o < 7; o++) {
      const l = (t + n) / 2;
      e.style.setProperty("--loc-fit", String(l)), We(e) ? n = l : t = l;
    }
    e.style.setProperty("--loc-fit", String(t));
  }
  function Wt(e, t) {
    const n = e.querySelector('[data-role="toggle"]');
    if (!n) return;
    const o = kt(h, t.id) > 0;
    n.style.display = o ? "flex" : "none", n.textContent = t.collapsed ? "⊞" : "⊟";
  }
  function be(e) {
    return document.createElementNS(pe, e);
  }
  function Jt() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of L) {
      const n = t.node;
      if (!n.parentId) continue;
      const o = w[n.parentId];
      if (!o) continue;
      e[n.id] = !0;
      const l = Yt(o, t, re(), p, y, E);
      let s = b[n.id];
      s || (s = be("path"), b[n.id] = s, K.appendChild(s)), s.setAttribute("d", l), s.classList.toggle("loc-sel", i.selectedEdgeId === n.id);
      let a = N[n.id];
      a || (a = be("path"), a.dataset.edge = n.id, N[n.id] = a, le.appendChild(a)), a.setAttribute("d", l);
    }
    for (const t in b) e[t] || (b[t].remove(), delete b[t]);
    for (const t in N) e[t] || (N[t].remove(), delete N[t]);
    i.selectedEdgeId && !e[i.selectedEdgeId] ? U() : F();
  }
  function H(e) {
    const t = w[e];
    if (!t) return;
    const n = w[t.node.parentId];
    if (!n) return;
    const o = Yt(n, t, re(), p, y, E);
    b[e] && b[e].setAttribute("d", o), N[e] && N[e].setAttribute("d", o);
  }
  function ce() {
    J.style.transform = `translate(${i.panX}px, ${i.panY}px) scale(${i.zoom})`, Ie.textContent = Math.round(i.zoom * 100) + "%", i.selectedEdgeId && !A && F(), v();
  }
  function Kt() {
    let e = 0, t = 0;
    for (const n of L) {
      const o = ne(n, p);
      e = Math.max(e, o.x + n.node.width / 2 + 80), t = Math.max(t, o.y + n.node.height / 2 + 80);
    }
    K.setAttribute("width", e), K.setAttribute("height", t), se.setAttribute("width", e), se.setAttribute("height", t), ie.style.width = e + "px", ie.style.height = t + "px", ie.style.backgroundSize = i.gridSize + "px " + i.gridSize + "px";
  }
  function me() {
    ie.classList.toggle("loc-on", i.showGrid), x.classList.toggle("loc-gridon", i.showGrid);
  }
  function Z() {
    if (!L.length) return;
    const e = jt(L, p, 0), t = En(e, x.clientWidth, x.clientHeight);
    i.zoom = t.zoom, i.panX = t.panX, i.panY = t.panY, ce();
  }
  function Je(e) {
    const t = w[e];
    if (!t) return;
    const n = ne(t, p);
    i.panX = x.clientWidth / 2 - n.x * i.zoom, i.panY = x.clientHeight / 2 - n.y * i.zoom, ce();
  }
  function Ke() {
    for (const e of h) e.collapsed = !1;
    M();
  }
  function Ze() {
    const e = In(h, f);
    for (const t of h) t.collapsed = e[t.id] >= 1 && kt(h, t.id) > 0;
    M();
  }
  function Qe(e) {
    const t = f[e];
    t && (t.collapsed = !t.collapsed, M());
  }
  function et(e) {
    if (k = Ln(h, e), Oe(), k.size) {
      const t = L.find((n) => k.has(n.node.id));
      t && Je(t.node.id);
    }
    return k.size;
  }
  function tt() {
    k = /* @__PURE__ */ new Set(), Oe();
  }
  function Oe() {
    const e = k.size > 0;
    for (const t of L) {
      const n = c[t.node.id];
      if (!n) continue;
      const o = k.has(t.node.id);
      n.classList.toggle("loc-highlight", e && o), n.classList.toggle("loc-dim", e && !o);
    }
    for (const t in b) b[t].classList.toggle("loc-hl", e && k.has(t));
  }
  function Zt(e, t) {
    if (e.target.closest('[data-role="toggle"]') || (e.stopPropagation(), U(), it(t), g("node-select", { id: t, node: f[t], rect: lt(t) }), r.inspector && Re(t), r.readonly || !r.enableDragging || !i.editMode)) return;
    const n = p[t] || { dx: 0, dy: 0 };
    m = { id: t, startX: e.clientX, startY: e.clientY, baseDx: n.dx, baseDy: n.dy, moved: !1 }, c[t].classList.add("loc-dragging"), g("node-drag-start", { id: t, node: f[t] }), B("pointermove", nt), B("pointerup", ot);
  }
  function nt(e) {
    if (!m) return;
    let t = m.baseDx + (e.clientX - m.startX) / i.zoom, n = m.baseDy + (e.clientY - m.startY) / i.zoom;
    if (Math.abs(e.clientX - m.startX) + Math.abs(e.clientY - m.startY) > 3 && (m.moved = !0), i.snapGrid) {
      const o = i.gridSize, l = w[m.id];
      l && (t = Math.round((l.cx + t) / o) * o - l.cx, n = Math.round((l.cy + n) / o) * o - l.cy);
    }
    p[m.id] = { dx: t, dy: n }, oe || (oe = requestAnimationFrame(() => {
      oe = 0, Qt(m.id), en(m.id), g("node-drag", { id: m.id, node: f[m.id], offset: p[m.id] });
    }));
  }
  function ot() {
    if (m) {
      const e = c[m.id];
      e && e.classList.remove("loc-dragging"), g("node-drag-end", { id: m.id, node: f[m.id], offset: p[m.id] });
    }
    m = null, _("pointermove", nt), _("pointerup", ot), v();
  }
  function Qt(e) {
    const t = w[e], n = c[e];
    if (!t || !n) return;
    const o = ne(t, p);
    n.style.transform = `translate(${o.x - t.node.width / 2}px, ${o.y - t.node.height / 2}px)`;
  }
  function en(e) {
    const t = w[e];
    if (t) {
      w[t.node.parentId] && H(e);
      for (const n of L) n.node.parentId === e && H(n.node.id);
      i.selectedEdgeId && F();
    }
  }
  function it(e) {
    i.selectedNodeId && c[i.selectedNodeId] && c[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = e, c[e] && c[e].classList.add("loc-selected");
  }
  function lt(e) {
    const t = c[e];
    if (!t) return null;
    const n = t.getBoundingClientRect();
    return { left: n.left, top: n.top, right: n.right, bottom: n.bottom, width: n.width, height: n.height };
  }
  function ye(e, t) {
    const n = x.getBoundingClientRect();
    return { x: (e - n.left - i.panX) / i.zoom, y: (t - n.top - i.panY) / i.zoom };
  }
  function Ae(e) {
    if (i.snapGrid) {
      const t = i.gridSize;
      return { x: Math.round(e.x / t) * t, y: Math.round(e.y / t) * t };
    }
    return { x: e.x, y: e.y };
  }
  function st(e) {
    const t = w[e];
    if (!t) return null;
    const n = w[t.node.parentId];
    if (!n) return null;
    const o = y[e] || [];
    return Gn(n, t, o, re(), p, E[e]);
  }
  function at(e) {
    const t = [], n = Cn(re());
    for (let o = 0; o < e.length - 1; o++) {
      const l = zn([e[o], e[o + 1]], n);
      for (let s = 0; s < l.length - 1; s++) t.push({ a: l[s], b: l[s + 1], insert: o });
    }
    return t;
  }
  function rt(e) {
    i.selectedEdgeId && b[i.selectedEdgeId] && b[i.selectedEdgeId].classList.remove("loc-sel"), i.selectedNodeId && c[i.selectedNodeId] && c[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = null, i.selectedEdgeId = e, b[e] && b[e].classList.add("loc-sel"), F();
  }
  function U() {
    i.selectedEdgeId && b[i.selectedEdgeId] && b[i.selectedEdgeId].classList.remove("loc-sel"), i.selectedEdgeId = null, C.innerHTML = "";
  }
  function Te(e, t, n, o) {
    const l = be("circle");
    return l.setAttribute("cx", e), l.setAttribute("cy", t), l.setAttribute("r", n), l.setAttribute("class", o), l;
  }
  function ct(e, t, n, o) {
    const l = be("rect");
    return l.setAttribute("x", e - n), l.setAttribute("y", t - n), l.setAttribute("width", 2 * n), l.setAttribute("height", 2 * n), l.setAttribute("rx", 2 / i.zoom), l.setAttribute("class", o), l;
  }
  function F() {
    C.innerHTML = "";
    const e = i.selectedEdgeId;
    if (!e || r.readonly) return;
    const t = st(e);
    if (!t) return;
    const n = y[e] || [], o = 6 / i.zoom, l = 5 / i.zoom;
    if (!i.editMode) {
      for (let u = 0; u < n.length; u++) {
        const z = Te(n[u].x, n[u].y, o, "loc-wp-handle loc-wp-readonly");
        z.dataset.wp = u, C.appendChild(z);
      }
      return;
    }
    for (const u of at(t)) {
      const z = Te((u.a.x + u.b.x) / 2, (u.a.y + u.b.y) / 2, l, "loc-wp-add");
      z.dataset.add = u.insert, C.appendChild(z);
    }
    for (let u = 0; u < n.length; u++) {
      const z = Te(n[u].x, n[u].y, o, "loc-wp-handle");
      z.dataset.wp = u, C.appendChild(z);
    }
    const s = t[0], a = t[t.length - 1], d = ct(s.x, s.y, 6 / i.zoom, "loc-ep loc-ep-parent");
    d.dataset.ep = "parent", C.appendChild(d);
    const S = ct(a.x, a.y, 6 / i.zoom, "loc-ep loc-ep-child");
    S.dataset.ep = "child", C.appendChild(S);
  }
  function dt(e, t) {
    const n = ne(e, p), o = e.node.width, l = e.node.height;
    let s = (t.x - n.x) / (o / 2), a = (t.y - n.y) / (l / 2);
    const d = Math.max(Math.abs(s), Math.abs(a));
    return d > 1e-6 && (s /= d, a /= d), { nx: Math.max(-1, Math.min(1, s)), ny: Math.max(-1, Math.min(1, a)) };
  }
  function tn(e, t) {
    const n = new Set([t].concat(je(t)));
    for (let o = L.length - 1; o >= 0; o--) {
      const l = L[o];
      if (n.has(l.node.id)) continue;
      const s = ne(l, p);
      if (e.x >= s.x - l.node.width / 2 && e.x <= s.x + l.node.width / 2 && e.y >= s.y - l.node.height / 2 && e.y <= s.y + l.node.height / 2) return l.node.id;
    }
    return null;
  }
  let Q = null;
  function Ne(e) {
    Q && c[Q] && c[Q].classList.remove("loc-reparent-target"), Q = e, e && c[e] && c[e].classList.add("loc-reparent-target");
  }
  function ut(e) {
    if (!A || A.kind !== "ep") return;
    const t = A.id, n = w[t];
    if (!n) return;
    const o = w[n.node.parentId];
    if (!o) return;
    const l = ye(e.clientX, e.clientY);
    if (E[t] = E[t] || {}, A.which === "child")
      E[t].c = dt(n, l);
    else {
      E[t].p = dt(o, l);
      const s = tn(l, t);
      Ne(s && s !== n.node.parentId ? s : null);
    }
    H(t), F();
  }
  function pt() {
    const e = A;
    if (A = null, _("pointermove", ut), _("pointerup", pt), e && e.which === "parent" && Q) {
      const t = Q;
      Ne(null), Ge(e.id, t);
      return;
    }
    Ne(null), v();
  }
  function Ge(e, t) {
    const n = f[e];
    !n || t === e || t && je(e).indexOf(t) >= 0 || (n.parentId = t || "", I[e] = Object.assign(I[e] || {}, { parentId: n.parentId }), delete y[e], delete E[e], i.selectedEdgeId = null, C.innerHTML = "", w[e] && Object.assign(w[e].node, { parentId: n.parentId }), M(), g("node-change", { id: e, node: { ...n }, patch: { parentId: n.parentId }, reparented: !0 }), v());
  }
  function Ce(e) {
    Ge(e, "");
  }
  function nn(e, t, n) {
    const o = n.x - t.x, l = n.y - t.y, s = o * o + l * l;
    let a = s ? ((e.x - t.x) * o + (e.y - t.y) * l) / s : 0;
    return a = Math.max(0, Math.min(1, a)), Math.hypot(e.x - (t.x + a * o), e.y - (t.y + a * l));
  }
  function on(e, t) {
    const n = at(e);
    let o = 0, l = 1 / 0;
    for (const s of n) {
      const a = nn(t, s.a, s.b);
      a < l && (l = a, o = s.insert);
    }
    return o;
  }
  const ln = ["", "Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Matrix"];
  function ve(e) {
    return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function ze() {
    G.classList.toggle("loc-edit", i.editMode);
  }
  function ft(e) {
    i.editMode = !!e, ze(), D(), i.editMode || U(), $.classList.contains("loc-open") && $e(), g("edit-mode-change", { editMode: i.editMode }), v();
  }
  function Re(e) {
    r.inspector && (i.selectedNodeId = e, $.classList.add("loc-open"), $e(), g("inspector-open", { id: e, node: f[e] }));
  }
  function q() {
    $.classList.contains("loc-open") && ($.classList.remove("loc-open"), g("inspector-close", {}));
  }
  function $e() {
    const e = i.selectedNodeId, t = e && f[e];
    if (!t) {
      q();
      return;
    }
    if (Pt.textContent = t.label || t.personName || t.id, r.inspectorSlot) {
      qe.innerHTML = "";
      return;
    }
    const n = i.editMode, o = n ? "" : " disabled", l = (S, u, z) => `<input data-field="${S}" type="${z || "text"}" value="${ve(u)}"${o}/>`, s = (S, u, z) => `<select data-field="${S}"${o}>` + z.map((te) => {
      const $t = Array.isArray(te) ? te[0] : te, xn = Array.isArray(te) ? te[1] : te || "—";
      return `<option value="${ve($t)}"${String($t) === String(u ?? "") ? " selected" : ""}>${xn}</option>`;
    }).join("") + "</select>", a = (S, u) => `<label class="loc-field"><span>${S}</span>${u}</label>`;
    let d = a("ID", `<input value="${ve(t.id)}" disabled/>`) + a("Type", s("type", t.type, [["department", "department"], ["position", "position"]])) + a("Label", l("label", t.label));
    t.type !== "department" && (d += a("Person name", l("personName", t.personName)) + a("Status", s("status", t.status, [["", "—"], ["FILLED", "FILLED"], ["VACANT", "VACANT"], ["UNFUNDED", "UNFUNDED"]])) + a("Photo URL", l("photo_url", t.data && t.data.photo_url || ""))), d += a("Layout override", s("layoutMode", t.layoutMode || "", ln.map((S) => [S, S || "(inherit)"]))) + a("Width", l("width", t.width, "number")) + a("Height", l("height", t.height, "number")), Le.innerHTML = d, qe.innerHTML = n ? '<button data-role="add-child">+ Add child</button>' + (t.parentId ? '<button data-role="detach">Detach</button>' : "") + '<button data-role="del-node" class="loc-danger">Delete</button>' : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  function sn() {
    let e;
    do
      e = "node-" + ++Ft;
    while (f[e]);
    return e;
  }
  function ee(e, t) {
    const n = f[e];
    if (!n) return;
    Object.assign(n, t), w[e] && w[e].node !== n && Object.assign(w[e].node, t), I[e] = Object.assign(I[e] || {}, t);
    const o = ["type", "width", "height", "layoutMode"].some((l) => l in t);
    c[e] && (c[e].remove(), delete c[e]), o ? M() : Ve(), g("node-change", { id: e, node: { ...n }, patch: t }), v();
  }
  function je(e) {
    const t = [], n = [e];
    for (; n.length; ) {
      const o = n.pop();
      for (const l of h) l.parentId === o && (t.push(l.id), n.push(l.id));
    }
    return t;
  }
  function gt(e) {
    if (!i.editMode) return;
    const t = sn(), n = Me({ id: t, parentId: e || "", type: "position", label: "NEW POSITION", personName: "", status: "" });
    h.push(n), f[t] = n, I[t] = Object.assign({ __new: !0 }, n), M(), it(t), Re(t), g("node-change", { id: t, node: { ...n }, added: !0 }), v();
  }
  function ht(e) {
    if (!i.editMode || !e) return;
    const t = [e].concat(je(e)), n = new Set(t);
    h = h.filter((o) => !n.has(o.id)), f = Ee(h), t.forEach((o) => {
      I[o] = { __deleted: !0 }, c[o] && (c[o].remove(), delete c[o]);
    }), n.has(i.selectedNodeId) && (i.selectedNodeId = null, q()), M(), g("node-change", { id: e, removed: !0, ids: t }), v();
  }
  function bt() {
    const e = new Set(Object.keys(I).filter((t) => I[t] && I[t].__deleted));
    e.size && (h = h.filter((t) => !e.has(t.id))), f = Ee(h);
    for (const t in I) {
      const n = I[t];
      if (!(!n || n.__deleted))
        if (n.__new) {
          if (!f[t]) {
            const o = Object.assign({}, n);
            delete o.__new;
            const l = Me(o);
            h.push(l), f[t] = l;
          }
        } else f[t] && Object.assign(f[t], n);
    }
  }
  const an = [
    ["type", "Type"],
    ["status", "Status"],
    ["level", "Level (data.level)"],
    ["unit", "Unit (data.unit)"],
    ["id", "Node id"],
    ["label", "Label"]
  ];
  function mt(e, t) {
    const n = Xt(t, R);
    ke(e, "--loc-node-bg", n && n.bg), ke(e, "--loc-node-text", n && n.text), ke(e, "--loc-node-border", n && n.border);
  }
  function ke(e, t, n) {
    n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
  }
  function Xe() {
    for (const e in c) f[e] && mt(c[e], f[e]);
  }
  function Y() {
    return {
      spacingX: i.spacingX,
      spacingY: i.spacingY,
      gridSize: i.gridSize,
      orientation: i.orientation,
      subtreeMode: i.subtreeMode,
      showGrid: i.showGrid,
      snapGrid: i.snapGrid,
      alignGrid: i.alignGrid,
      themeRules: R.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    };
  }
  function rn(e, t) {
    e = e || {}, typeof e.spacingX == "number" && (i.spacingX = e.spacingX), typeof e.spacingY == "number" && (i.spacingY = e.spacingY), typeof e.gridSize == "number" && (i.gridSize = e.gridSize), e.orientation && (i.orientation = fe(e.orientation)), e.subtreeMode && (i.subtreeMode = e.subtreeMode), "showGrid" in e && (i.showGrid = !!e.showGrid), "snapGrid" in e && (i.snapGrid = !!e.snapGrid), "alignGrid" in e && (i.alignGrid = !!e.alignGrid), Array.isArray(e.themeRules) && (R = e.themeRules.map(ue)), me(), D(), M(), P.classList.contains("loc-open") && Se(), t && t.silent || g("settings-change", Y()), v();
  }
  function Ye(e) {
    const t = e == null ? !P.classList.contains("loc-open") : !!e;
    P.classList.toggle("loc-open", t), j && j.querySelectorAll('button[data-act="settings"]').forEach((n) => n.classList.toggle("loc-active", t)), t && Se();
  }
  function De(e, t, n, o, l) {
    return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${o}" max="${l}" value="${n}"/></label>`;
  }
  function Fe(e, t, n, o) {
    return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${o ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${o || "#e0524d"}"/></label>`;
  }
  function cn(e, t) {
    const n = (o, l) => `<option value="${o}"${e.field === o ? " selected" : ""}>${l}</option>`;
    return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + an.map(([o, l]) => n(o, l)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${ve(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Fe(t, "bg", "BG", e.style.bg) + Fe(t, "text", "Text", e.style.text) + Fe(t, "border", "Border", e.style.border) + "</div></div>";
  }
  function Se() {
    let e = '<div class="loc-set-section"><div class="loc-set-title">Layout</div>' + De("spacingX", "Spacing X", i.spacingX, 0, 200) + De("spacingY", "Spacing Y", i.spacingY, 0, 260) + De("gridSize", "Grid size", i.gridSize, 6, 80) + "</div>";
    e += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div><div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>', R.forEach((t, n) => {
      e += cn(t, n);
    }), e += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>', ae.innerHTML = e;
  }
  function dn(e, t) {
    const n = ae.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
    return n && n.checked;
  }
  function un(e, t) {
    const n = ae.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
    return n ? n.value : "";
  }
  function v() {
    if (r.persist)
      try {
        localStorage.setItem(r.storageKey, JSON.stringify({
          orientation: i.orientation,
          subtreeMode: i.subtreeMode,
          spacingX: i.spacingX,
          spacingY: i.spacingY,
          zoom: i.zoom,
          panX: i.panX,
          panY: i.panY,
          showGrid: i.showGrid,
          snapGrid: i.snapGrid,
          alignGrid: i.alignGrid,
          gridSize: i.gridSize,
          editMode: i.editMode,
          manualOffsets: p,
          edgeWaypoints: y,
          edgeAnchors: E,
          nodeOverrides: I,
          themeRules: R,
          collapsed: h.filter((e) => e.collapsed).map((e) => e.id)
        }));
      } catch {
      }
  }
  function pn() {
    if (!r.persist) return;
    let e;
    try {
      e = JSON.parse(localStorage.getItem(r.storageKey) || "null");
    } catch {
      e = null;
    }
    if (e && (e.orientation && (i.orientation = fe(e.orientation)), e.subtreeMode && (i.subtreeMode = e.subtreeMode), ["spacingX", "spacingY", "zoom", "panX", "panY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (i[t] = e[t]);
    }), i.showGrid = !!e.showGrid, i.snapGrid = !!e.snapGrid, i.alignGrid = !!e.alignGrid, i.editMode = !!e.editMode, e.manualOffsets && (p = e.manualOffsets), e.edgeWaypoints && (y = e.edgeWaypoints), e.edgeAnchors && (E = e.edgeAnchors), e.nodeOverrides && (I = e.nodeOverrides, bt()), Array.isArray(e.themeRules) && (R = e.themeRules.map(ue)), Array.isArray(e.collapsed))) {
      const t = new Set(e.collapsed);
      for (const n of h) n.collapsed = t.has(n.id);
    }
  }
  function yt(e) {
    const t = Mn(i, h, p, y);
    return t.editMode = i.editMode, t.edgeAnchors = E, t.nodeOverrides = I, t.settings = Y(), e !== !1 && Be(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
  }
  const vt = document.createElement("canvas").getContext("2d");
  function fn(e, t) {
    return vt.font = t, vt.measureText(e).width;
  }
  function gn(e) {
    const t = c[e.id];
    if (!t) return 1;
    const n = parseFloat(t.style.getPropertyValue("--loc-fit"));
    return isFinite(n) && n > 0 ? n : 1;
  }
  function de(e) {
    const t = [];
    for (const n in b) t.push(b[n].getAttribute("d"));
    return On(L, t, { manualOffsets: p, raster: !!e, measureText: fn, fitOf: gn });
  }
  function St() {
    return Be(new Blob([de(!1)], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), de(!1);
  }
  function wt(e) {
    e = e || 3;
    const t = jt(L, p, 40), n = 16e3, o = 2e8;
    let l = Math.min(e, n / t.w, n / t.h);
    t.w * l * t.h * l > o && (l = Math.sqrt(o / (t.w * t.h))), l = Math.max(0.05, l);
    const s = URL.createObjectURL(new Blob([de(!0)], { type: "image/svg+xml;charset=utf-8" })), a = new Image();
    a.onload = () => {
      const d = document.createElement("canvas");
      d.width = Math.round(t.w * l), d.height = Math.round(t.h * l);
      const S = d.getContext("2d");
      S.setTransform(l, 0, 0, l, 0, 0), S.drawImage(a, 0, 0), URL.revokeObjectURL(s);
      try {
        d.toBlob((u) => {
          u && Be(u, "org-chart.png");
        }, "image/png");
      } catch {
      }
    }, a.onerror = () => URL.revokeObjectURL(s), a.src = s;
  }
  function xt() {
    const e = window.open("", "_blank");
    e && (e.document.open(), e.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + de(!1) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), e.document.close());
  }
  function Be(e, t) {
    const n = URL.createObjectURL(e), o = document.createElement("a");
    o.href = n, o.download = t, document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(n);
  }
  function Mt(e, t, n) {
    const o = !(n && n.resetEdits);
    h = (e || []).map(Me), f = Ee(h), p = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), E = /* @__PURE__ */ Object.create(null), o || (I = /* @__PURE__ */ Object.create(null)), i.selectedNodeId = null, i.selectedEdgeId = null, k = /* @__PURE__ */ new Set(), q();
    for (const l in c)
      c[l].remove(), delete c[l];
    for (const l in b)
      b[l].remove(), delete b[l];
    for (const l in N)
      N[l].remove(), delete N[l];
    t && (t.subtreeMode && (i.subtreeMode = t.subtreeMode), t.orientation && (i.orientation = fe(t.orientation)), t.manualOffsets && (p = t.manualOffsets), t.edgeWaypoints && (y = t.edgeWaypoints), t.edgeAnchors && (E = t.edgeAnchors), t.nodeOverrides && (I = t.nodeOverrides), typeof t.editMode == "boolean" && (i.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (R = t.settings.themeRules.map(ue))), o && bt(), ze(), D(), M(), r.fitOnInit && Z();
  }
  function hn(e) {
    const { nodes: t, meta: n } = An(e);
    return Mt(t, n), t.length;
  }
  function Et(e) {
    const t = fe(e);
    i.orientation = t, p = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), E = /* @__PURE__ */ Object.create(null), U(), D(), M(), g("orientation-change", { orientation: t });
  }
  function It(e) {
    i.subtreeMode = e, p = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), E = /* @__PURE__ */ Object.create(null), U(), D(), M(), g("subtree-mode-change", { subtreeMode: e });
  }
  function bn(e, t) {
    e != null && (i.spacingX = e), t != null && (i.spacingY = t), M(), g("settings-change", Y());
  }
  function we(e, t) {
    e in i ? (i[e] = t, e === "showGrid" && me(), e === "alignGrid" && (p = /* @__PURE__ */ Object.create(null), M()), D(), v(), ["showGrid", "snapGrid", "alignGrid", "gridSize"].includes(e) && g("settings-change", Y())) : r[e] = t;
  }
  function Lt(e) {
    return we("showGrid", !!e), i.showGrid;
  }
  function mn(e) {
    return we("snapGrid", !!e), i.snapGrid;
  }
  function yn(e) {
    return we("alignGrid", !!e), i.alignGrid;
  }
  function vn(e) {
    return Lt(e ?? !i.showGrid);
  }
  function _e() {
    p = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), E = /* @__PURE__ */ Object.create(null), U(), M();
  }
  function Ot() {
    tt(), q(), _e(), Z();
  }
  function At() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function xe() {
    return At() === G;
  }
  function Tt() {
    const e = G.requestFullscreen || G.webkitRequestFullscreen;
    if (e)
      try {
        const t = e.call(G);
        t && t.catch && t.catch(() => {
        });
      } catch {
      }
  }
  function Nt() {
    const e = document.exitFullscreen || document.webkitExitFullscreen;
    if (e && At())
      try {
        e.call(document);
      } catch {
      }
  }
  function Pe(e) {
    const t = e == null ? !xe() : !!e;
    return t ? Tt() : Nt(), t;
  }
  function Gt() {
    const e = xe();
    G.classList.toggle("loc-fullscreen", e), X && (X.title = e ? "Exit fullscreen" : "Fullscreen"), D(), Z(), g("fullscreen-change", { fullscreen: e });
  }
  O(he, "pointerdown", (e) => {
    const t = e.target.closest(".loc-node");
    t && Zt(e, t.dataset.id);
  }), O(he, "click", (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !r.readonly) {
      Qe(t.closest(".loc-node").dataset.id);
      return;
    }
    const n = e.target.closest(".loc-node");
    n && g("node-click", { id: n.dataset.id, node: f[n.dataset.id] });
  }), O(le, "pointerdown", (e) => {
    const t = e.target.closest("path");
    t && (e.stopPropagation(), rt(t.dataset.edge));
  }), O(le, "dblclick", (e) => {
    if (r.readonly || !i.editMode) return;
    const t = e.target.closest("path");
    if (!t) return;
    const n = t.dataset.edge;
    rt(n);
    const o = st(n);
    if (!o) return;
    const l = Ae(ye(e.clientX, e.clientY));
    (y[n] || (y[n] = [])).splice(on(o, l), 0, l), H(n), F(), v();
  }), O(C, "pointerdown", (e) => {
    if (r.readonly || !i.editMode) return;
    const t = e.target, n = i.selectedEdgeId;
    if (!n) return;
    if (t.dataset.ep) {
      e.stopPropagation(), e.preventDefault(), A = { id: n, kind: "ep", which: t.dataset.ep }, B("pointermove", ut), B("pointerup", pt);
      return;
    }
    let o;
    if (t.dataset.wp != null) o = +t.dataset.wp;
    else if (t.dataset.add != null) {
      const l = +t.dataset.add;
      (y[n] || (y[n] = [])).splice(l, 0, Ae(ye(e.clientX, e.clientY))), o = l, H(n);
    } else return;
    e.stopPropagation(), e.preventDefault(), A = { id: n, idx: o }, B("pointermove", Ct), B("pointerup", zt);
  }), O(C, "dblclick", (e) => {
    const t = e.target;
    if (t.dataset.ep === "parent") {
      Ce(i.selectedEdgeId);
      return;
    }
    if (t.dataset.wp == null) return;
    const n = i.selectedEdgeId, o = y[n];
    o && (o.splice(+t.dataset.wp, 1), o.length || delete y[n], H(n), F(), v());
  });
  function Ct(e) {
    if (!A) return;
    const t = y[A.id];
    t && (t[A.idx] = Ae(ye(e.clientX, e.clientY)), H(A.id), F());
  }
  function zt() {
    A = null, _("pointermove", Ct), _("pointerup", zt), v();
  }
  O($, "click", (e) => {
    if (e.target.closest('[data-role="panel-close"]')) {
      q();
      return;
    }
    if (e.target.closest('[data-role="add-child"]')) {
      gt(i.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="detach"]')) {
      Ce(i.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="del-node"]')) {
      ht(i.selectedNodeId);
      return;
    }
  }), O(Le, "input", (e) => {
    if (!i.editMode) return;
    const t = e.target.closest("[data-field]");
    if (!t) return;
    const n = i.selectedNodeId;
    if (!n) return;
    const o = t.dataset.field;
    let l = t.value;
    if (o === "type") {
      ee(n, { type: l }), $e();
      return;
    }
    if (o === "width" || o === "height") {
      ee(n, { [o]: Math.max(20, parseFloat(l) || 0) });
      return;
    }
    if (o === "photo_url") {
      const s = f[n];
      ee(n, { data: Object.assign({}, s.data, { photo_url: l || null }) });
      return;
    }
    if (o === "layoutMode") {
      ee(n, { layoutMode: l || null });
      return;
    }
    ee(n, { [o]: l });
  }), O(P, "click", (e) => {
    if (e.target.closest('[data-role="settings-close"]')) {
      Ye(!1);
      return;
    }
    if (e.target.closest('[data-role="add-rule"]')) {
      R.push(ue({ field: "type", value: "", style: {} })), Se(), Xe(), v(), g("settings-change", Y());
      return;
    }
    const t = e.target.closest('[data-rk="remove"]');
    t && (R.splice(+t.dataset.rule, 1), Se(), Xe(), v(), g("settings-change", Y()));
  }), O(ae, "input", (e) => {
    const t = e.target;
    if (t.dataset.set != null) {
      const n = parseFloat(t.value);
      i[t.dataset.set] = n;
      const o = ae.querySelector(`[data-rangelabel="${t.dataset.set}"]`);
      o && (o.textContent = n), M(), g("settings-change", Y()), v();
      return;
    }
    if (t.dataset.rule != null) {
      const n = +t.dataset.rule, o = t.dataset.rk, l = R[n];
      if (!l) return;
      if (o === "enabled") l.enabled = t.checked;
      else if (o === "field") l.field = t.value;
      else if (o === "value") l.value = t.value;
      else if (o === "bg" || o === "text" || o === "border")
        dn(n, o) && (l.style[o] = t.value);
      else if (/-on$/.test(o)) {
        const s = o.replace("-on", "");
        l.style[s] = t.checked ? un(n, s) || "#e0524d" : "";
      }
      Xe(), g("settings-change", Y()), v();
    }
  }), O(x, "pointerdown", (e) => {
    if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn"))
      return;
    const t = () => {
      i.selectedNodeId && (c[i.selectedNodeId] && c[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = null), i.selectedEdgeId && U(), q();
    };
    if (!r.enablePan) {
      t();
      return;
    }
    const n = e.clientX, o = e.clientY, l = i.panX, s = i.panY;
    let a = !1;
    x.classList.add("loc-panning");
    const d = (u) => {
      !a && Math.abs(u.clientX - n) + Math.abs(u.clientY - o) > 3 && (a = !0), i.panX = l + (u.clientX - n), i.panY = s + (u.clientY - o), ce();
    }, S = () => {
      x.classList.remove("loc-panning"), _("pointermove", d), _("pointerup", S), a || t();
    };
    B("pointermove", d), B("pointerup", S);
  }), O(x, "wheel", (e) => {
    if (!r.enableZoom) return;
    e.preventDefault();
    const t = x.getBoundingClientRect(), n = e.clientX - t.left, o = e.clientY - t.top, l = e.deltaY < 0 ? 1.1 : 1 / 1.1, s = Math.min(3, Math.max(0.15, i.zoom * l));
    i.panX = n - (n - i.panX) * (s / i.zoom), i.panY = o - (o - i.panY) * (s / i.zoom), i.zoom = s, ce();
  }, { passive: !1 });
  function B(e, t) {
    window.addEventListener(e, t), ge.push({ target: window, type: e, fn: t });
  }
  function _(e, t) {
    window.removeEventListener(e, t);
  }
  function Sn() {
    const e = r.toolbar && typeof r.toolbar == "object" ? r.toolbar : {}, t = (a) => e[a] !== !1, n = T("div", "loc-toolbar");
    let o = "";
    return t("subtree") && (o += l("Subtree", ["Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Matrix"].map((a) => s("mode", a, a)).join(""))), t("orient") && (o += l("Orient", [["TopToBottom", "Top"], ["BottomToTop", "Bottom"], ["LeftToRight", "Left"], ["RightToLeft", "Right"]].map(([a, d]) => s("orient", a, d)).join(""))), t("actions") && (o += l("", '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button><button data-act="reset">Reset</button><button data-act="fullscreen" title="Toggle fullscreen">Fullscreen</button>')), t("search") && (o += l("Search", '<input type="search" data-role="search" class="loc-search-input" placeholder="Search…" />')), t("grid") && (o += l("Grid", '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>')), t("mode") && (o += l("Mode", '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="settings" title="Settings &amp; theming">Settings</button>')), t("export") && (o += l("Export", '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>')), n.innerHTML = o, n.addEventListener("click", (a) => {
      const d = a.target.closest("button");
      if (d)
        if (d.dataset.mode) It(d.dataset.mode);
        else if (d.dataset.orient) Et(d.dataset.orient);
        else if (d.dataset.flag)
          i[d.dataset.flag] = !i[d.dataset.flag], d.dataset.flag === "showGrid" ? me() : d.dataset.flag === "alignGrid" && (p = /* @__PURE__ */ Object.create(null), M()), D(), v();
        else switch (d.dataset.act) {
          case "expand":
            Ke();
            break;
          case "collapse":
            Ze();
            break;
          case "fit":
            Z();
            break;
          case "relayout":
            _e();
            break;
          case "reset":
            Ot();
            break;
          case "fullscreen":
            Pe();
            break;
          case "edit":
            ft(!i.editMode);
            break;
          case "settings":
            Ye();
            break;
          case "png":
            wt(3);
            break;
          case "svg":
            St();
            break;
          case "pdf":
            xt();
            break;
          case "json":
            yt(!0);
            break;
        }
    }), n.addEventListener("input", (a) => {
      const d = a.target.closest('[data-role="search"]');
      d && et(d.value);
    }), n;
    function l(a, d) {
      return `<div class="loc-group">${a ? `<span class="loc-label">${a}</span>` : ""}${d}</div>`;
    }
    function s(a, d, S) {
      return `<button data-${a}="${d}">${S}</button>`;
    }
  }
  function D() {
    j && (j.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === i.subtreeMode)), j.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === i.orientation)), j.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!i[e.dataset.flag])), j.querySelectorAll('button[data-act="edit"]').forEach((e) => e.classList.toggle("loc-active", i.editMode)), j.querySelectorAll('button[data-act="fullscreen"]').forEach((e) => e.classList.toggle("loc-active", xe())));
  }
  O(document, "fullscreenchange", Gt), O(document, "webkitfullscreenchange", Gt), pn(), D(), me(), ze(), M(), r.fitOnInit && Z();
  let Rt = !1;
  function wn() {
    if (!Rt) {
      Rt = !0, ge.forEach(({ target: e, type: t, fn: n, optsL: o }) => e.removeEventListener(t, n, o)), ge.length = 0, oe && cancelAnimationFrame(oe), G.remove();
      for (const e in c) delete c[e];
      for (const e in b) delete b[e];
      for (const e in N) delete N[e];
    }
  }
  const He = {
    root: G,
    setNodes: Mt,
    loadJSON: hn,
    setOrientation: Et,
    setSubtreeMode: It,
    setSpacing: bn,
    setOption: we,
    setShowGrid: Lt,
    setSnapToGrid: mn,
    setAlignToGrid: yn,
    toggleGrid: vn,
    fitToScreen: Z,
    relayout: _e,
    resetView: Ot,
    expandAll: Ke,
    collapseAll: Ze,
    toggleCollapse: Qe,
    centerOnNode: Je,
    search: et,
    clearSearch: tt,
    exportJSON: yt,
    exportSVG: St,
    exportPNG: wt,
    exportPDF: xt,
    buildSVG: de,
    setEditMode: ft,
    isEditMode: () => i.editMode,
    enterFullscreen: Tt,
    exitFullscreen: Nt,
    toggleFullscreen: Pe,
    isFullscreen: xe,
    updateNode: ee,
    addChild: gt,
    deleteNode: ht,
    reparentNode: Ge,
    detachNode: Ce,
    openInspector: Re,
    closeInspector: q,
    nodeScreenRect: lt,
    getSettings: Y,
    setSettings: rn,
    toggleSettings: Ye,
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (e) => c[e] || null,
    getNodeSlotEl: (e) => c[e] ? c[e].querySelector(".loc-node-slot") : null,
    getInspectorBody: () => Le,
    nodeThemeStyle: (e) => f[e] ? Xt(f[e], R) : null,
    getState: () => ({ ...i }),
    getNodes: () => h.map((e) => ({ ...e })),
    getPositioned: () => L,
    on: Bt,
    off: _t,
    destroy: wn
  };
  return He;
}
export {
  Fn as CANVAS_PAD,
  Bn as DEFAULTS,
  _n as DEFAULT_SETTINGS,
  Pn as DEPT_SIZE,
  Hn as ORIENTATIONS,
  Un as POS_SIZE,
  qn as SNAKE_STUB,
  Vn as SUBTREE_MODES,
  Wn as VIRTUAL_ROOT_ID,
  Jn as applyOrientation,
  On as buildChartSVG,
  Kn as buildTree,
  jt as calculateBounds,
  kt as childCount,
  In as computeDepths,
  Zn as convertMoTree,
  Qn as convertNestedTree,
  Xn as createOrgChart,
  Gn as edgeControlPoints,
  eo as edgeEndpoints,
  ne as effCenter,
  Mn as exportLayout,
  En as fitBounds,
  to as getVisibleTree,
  Ee as indexNodes,
  Cn as isHorizontal,
  no as isMoArray,
  Tn as layoutOrgChart,
  oo as lh,
  io as lw,
  Me as makeNode,
  Nn as normalizeConfig,
  An as normalizeImported,
  ue as normalizeRule,
  lo as normalizeSettings,
  zn as orthoThrough,
  so as personNameFromPos,
  Xt as resolveNodeStyle,
  Yt as routeConnector,
  Ln as searchNodes,
  ao as visibleDepths,
  ro as waypointPath
};
