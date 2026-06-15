import { makeNode as Le, indexNodes as Ee, normalizeRule as pe, exportLayout as An, calculateBounds as _t, fitBounds as Gn, computeDepths as Tn, childCount as Pt, searchNodes as Nn, resolveNodeStyle as Ht, buildChartSVG as Cn, effCenter as se, normalizeImported as zn, layoutOrgChart as Rn, routeConnector as Ut, normalizeConfig as jn, edgeControlPoints as $n, isHorizontal as kn, orthoThrough as Xn } from "./core.js";
import { CANVAS_PAD as Un, DEFAULTS as qn, DEFAULT_SETTINGS as Vn, DEPT_SIZE as Wn, ORIENTATIONS as Jn, POS_SIZE as Kn, SNAKE_STUB as Zn, SUBTREE_MODES as Qn, VIRTUAL_ROOT_ID as eo, applyOrientation as to, buildTree as no, convertMoTree as oo, convertNestedTree as io, edgeEndpoints as so, getVisibleTree as lo, isMoArray as ao, lh as ro, lw as co, normalizeSettings as uo, personNameFromPos as po, visibleDepths as fo, waypointPath as go } from "./core.js";
const fe = "http://www.w3.org/2000/svg", Yn = 0.5, Dn = { Top: "TopToBottom", Bottom: "BottomToTop", Left: "LeftToRight", Right: "RightToLeft" };
function ge(K) {
  return Dn[K] || K;
}
const Fn = {
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
  settingsTarget: null,
  // mount the settings drawer into an external element (selector or node) instead of the canvas
  settingsSlot: !1,
  // leave the settings body empty for an external (Vue) slot
  nodeSlots: !1,
  // render empty positioned hosts (Vue teleports card content in)
  fullscreenControl: !0,
  // show the floating fullscreen button on the canvas
  // RowWrap fills this target shape. `targetSize` (a tarp's W×H, any units) wins; else targetAspect.
  targetAspect: 1.6,
  // default ≈ landscape tarp (W/H)
  targetSize: null,
  // e.g. { width: 8, height: 4 } → aspect 2.0
  fitOnLayoutChange: !0,
  // re-frame after mode/orientation/re-layout: true|'fit' · 'recenter' · false|'none'
  fitOnInit: !0,
  toolbar: !0,
  // true | false | { subtree, orient, actions, grid, mode, export }
  persist: !1,
  storageKey: "local-org-chart.state"
};
function _n(K, qt = {}) {
  if (!K || !K.appendChild) throw new Error("createOrgChart: first argument must be a DOM element.");
  const r = Object.assign({}, Fn, qt), i = {
    orientation: ge(r.orientation),
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
  let h = (r.nodes || []).map(Le), f = Ee(h), p = /* @__PURE__ */ Object.create(null), v = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), T = (r.settings && r.settings.themeRules || r.themeRules || []).map(pe);
  const U = {
    spacingX: r.spacingX,
    spacingY: r.spacingY,
    gridSize: r.gridSize,
    showGrid: !!r.showGrid,
    snapGrid: !!r.snapGrid,
    alignGrid: !!r.alignGrid,
    themeRules: T.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
  };
  let Vt = 0, E = [], S = /* @__PURE__ */ Object.create(null);
  const d = /* @__PURE__ */ Object.create(null), b = /* @__PURE__ */ Object.create(null), N = /* @__PURE__ */ Object.create(null);
  let A = null, m = null, le = 0, k = /* @__PURE__ */ new Set();
  const he = [], Z = /* @__PURE__ */ Object.create(null);
  function Wt(e, t) {
    return (Z[e] || (Z[e] = [])).push(t), Ve;
  }
  function Jt(e, t) {
    return Z[e] && (Z[e] = Z[e].filter((n) => n !== t)), Ve;
  }
  function g(e, t) {
    (Z[e] || []).forEach((n) => {
      try {
        n(t);
      } catch {
      }
    });
  }
  function O(e, t, n, o) {
    e.addEventListener(t, n, o), he.push({ target: e, type: t, fn: n, optsL: o });
  }
  const C = document.createElement("div");
  C.className = "loc-root";
  const $ = r.toolbar ? Ln() : null;
  $ && C.appendChild($);
  const w = G("div", "loc-canvas"), Q = G("div", "loc-content"), F = G("div", "loc-grid"), ee = document.createElementNS(fe, "svg");
  ee.setAttribute("class", "loc-connectors");
  const ae = document.createElementNS(fe, "g");
  ae.setAttribute("class", "loc-edgehits"), ee.appendChild(ae);
  const be = G("div", "loc-nodes"), re = document.createElementNS(fe, "svg");
  re.setAttribute("class", "loc-overlay");
  const z = document.createElementNS(fe, "g");
  z.setAttribute("class", "loc-edgehandles"), re.appendChild(z);
  const Oe = G("div", "loc-zoomreadout");
  Oe.textContent = "100%", Q.appendChild(F), Q.appendChild(ee), Q.appendChild(be), Q.appendChild(re), w.appendChild(Q), w.appendChild(Oe);
  let X = null;
  r.fullscreenControl && (X = G("button", "loc-fsbtn"), X.type = "button", X.title = "Fullscreen", X.setAttribute("aria-label", "Toggle fullscreen"), X.innerHTML = "⛶", O(X, "click", (e) => {
    e.stopPropagation(), qe();
  }), w.appendChild(X)), C.appendChild(w);
  const j = G("div", "loc-panel");
  j.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Node</span><button class="loc-panel-close" title="Close" data-role="panel-close">✕</button></div><div class="loc-panel-body" data-role="panel-body"></div><div class="loc-panel-foot" data-role="panel-foot"></div>';
  const We = Ze(r.inspectorTarget) || w;
  We.appendChild(j), We !== w && j.classList.add("loc-panel-external");
  const Ae = j.querySelector('[data-role="panel-body"]'), Je = j.querySelector('[data-role="panel-foot"]'), Kt = j.querySelector(".loc-panel-title"), B = G("div", "loc-settings");
  B.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Settings</span><button class="loc-panel-close" title="Close" data-role="settings-close">✕</button></div><div class="loc-panel-body" data-role="settings-body"></div>';
  const Ke = Ze(r.settingsTarget) || w;
  Ke.appendChild(B), Ke !== w && B.classList.add("loc-panel-external");
  const te = B.querySelector('[data-role="settings-body"]');
  K.appendChild(C);
  function G(e, t) {
    const n = document.createElement(e);
    return t && (n.className = t), n;
  }
  function Ze(e) {
    if (!e) return null;
    const t = typeof e == "string" ? document.querySelector(e) : e;
    return t && t.appendChild ? t : null;
  }
  function ce() {
    return jn({
      orientation: i.orientation,
      subtreeMode: i.subtreeMode,
      spacingX: i.spacingX,
      spacingY: i.spacingY,
      gridSize: i.gridSize,
      alignGrid: i.alignGrid,
      targetAspect: r.targetAspect,
      targetSize: r.targetSize
    });
  }
  function Zt() {
    const e = Rn(h, ce());
    E = e.positioned, S = e.posById;
  }
  function M() {
    Zt(), tt(), nn(), Qe(), de(), Ne(), x(), g("layout-change", { positioned: E, mode: i.subtreeMode, orientation: i.orientation });
  }
  function Qe() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of E) {
      const n = t.node;
      e[n.id] = !0;
      let o = d[n.id];
      o || (o = Qt(n), d[n.id] = o, be.appendChild(o)), o.style.width = n.width + "px", o.style.height = n.height + "px";
      const s = se(t, p);
      o.style.transform = `translate(${s.x - n.width / 2}px, ${s.y - n.height / 2}px)`, r.nodeSlots || (o.dataset.fitted || (en(o), o.dataset.fitted = "1"), xt(o, n)), o.classList.toggle("loc-selected", i.selectedNodeId === n.id), tn(o, n);
    }
    for (const t in d) e[t] || (d[t].remove(), delete d[t]);
    g("nodes-rendered", { ids: E.map((t) => t.node.id) });
  }
  function Qt(e) {
    if (r.nodeSlots) {
      const n = G("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
      if (n.dataset.id = e.id, n.innerHTML = '<div class="loc-node-slot"></div>', e.type === "department") {
        const o = G("div", "loc-toggle");
        o.dataset.role = "toggle", n.appendChild(o);
      }
      return n;
    }
    const t = G("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
    if (t.dataset.id = e.id, e.type === "department") {
      t.innerHTML = '<span class="loc-lbl"></span>', t.querySelector(".loc-lbl").textContent = e.label;
      const n = G("div", "loc-toggle");
      n.dataset.role = "toggle", t.appendChild(n);
    } else {
      t.innerHTML = '<div class="loc-photo"></div><div class="loc-ptext"><div class="loc-pname"></div><div class="loc-ptitle"></div><div class="loc-badge"></div></div>';
      const n = t.querySelector(".loc-photo"), o = e.data && e.data.photo_url;
      if (o) {
        const l = new Image();
        l.alt = "", l.referrerPolicy = "no-referrer", l.onerror = () => {
          n.textContent = "●";
        }, l.src = o, n.appendChild(l);
      } else
        n.textContent = "●";
      t.querySelector(".loc-pname").textContent = e.personName || "—", t.querySelector(".loc-ptitle").textContent = e.label;
      const s = t.querySelector(".loc-badge");
      e.status ? (s.textContent = e.status, s.className = "loc-badge loc-" + e.status) : s.remove();
    }
    return t;
  }
  function et(e) {
    return e.scrollWidth > e.clientWidth + 0.5 || e.scrollHeight > e.clientHeight + 0.5;
  }
  function en(e) {
    if (e.style.setProperty("--loc-fit", "1"), !et(e)) return;
    let t = Yn, n = 1;
    for (let o = 0; o < 7; o++) {
      const s = (t + n) / 2;
      e.style.setProperty("--loc-fit", String(s)), et(e) ? n = s : t = s;
    }
    e.style.setProperty("--loc-fit", String(t));
  }
  function tn(e, t) {
    const n = e.querySelector('[data-role="toggle"]');
    if (!n) return;
    const o = Pt(h, t.id) > 0;
    n.style.display = o ? "flex" : "none", n.textContent = t.collapsed ? "⊞" : "⊟";
  }
  function me(e) {
    return document.createElementNS(fe, e);
  }
  function nn() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of E) {
      const n = t.node;
      if (!n.parentId) continue;
      const o = S[n.parentId];
      if (!o) continue;
      e[n.id] = !0;
      const s = Ut(o, t, ce(), p, v, I);
      let l = b[n.id];
      l || (l = me("path"), b[n.id] = l, ee.appendChild(l)), l.setAttribute("d", s), l.classList.toggle("loc-sel", i.selectedEdgeId === n.id);
      let a = N[n.id];
      a || (a = me("path"), a.dataset.edge = n.id, N[n.id] = a, ae.appendChild(a)), a.setAttribute("d", s);
    }
    for (const t in b) e[t] || (b[t].remove(), delete b[t]);
    for (const t in N) e[t] || (N[t].remove(), delete N[t]);
    i.selectedEdgeId && !e[i.selectedEdgeId] ? W() : _();
  }
  function q(e) {
    const t = S[e];
    if (!t) return;
    const n = S[t.node.parentId];
    if (!n) return;
    const o = Ut(n, t, ce(), p, v, I);
    b[e] && b[e].setAttribute("d", o), N[e] && N[e].setAttribute("d", o);
  }
  function de() {
    Q.style.transform = `translate(${i.panX}px, ${i.panY}px) scale(${i.zoom})`, Oe.textContent = Math.round(i.zoom * 100) + "%", i.selectedEdgeId && !A && _(), x();
  }
  function tt() {
    let e = 0, t = 0, n = 0, o = 0;
    for (const l of E) {
      const a = se(l, p), c = l.node.width / 2, y = l.node.height / 2;
      e = Math.min(e, a.x - c - 80), t = Math.min(t, a.y - y - 80), n = Math.max(n, a.x + c + 80), o = Math.max(o, a.y + y + 80);
    }
    ee.setAttribute("width", n), ee.setAttribute("height", o), re.setAttribute("width", n), re.setAttribute("height", o);
    const s = i.gridSize;
    F.style.left = e + "px", F.style.top = t + "px", F.style.width = n - e + "px", F.style.height = o - t + "px", F.style.backgroundSize = s + "px " + s + "px", F.style.backgroundPosition = (-e % s + s) % s + "px " + (-t % s + s) % s + "px";
  }
  function ye() {
    F.classList.toggle("loc-on", i.showGrid), w.classList.toggle("loc-gridon", i.showGrid);
  }
  function V() {
    if (!E.length) return;
    const e = _t(E, p, 0), t = Gn(e, w.clientWidth, w.clientHeight);
    i.zoom = t.zoom, i.panX = t.panX, i.panY = t.panY, de();
  }
  function Ge(e) {
    const t = S[e];
    if (!t) return;
    const n = se(t, p);
    i.panX = w.clientWidth / 2 - n.x * i.zoom, i.panY = w.clientHeight / 2 - n.y * i.zoom, de();
  }
  function on() {
    const e = r.fitOnLayoutChange;
    return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
  }
  function Te() {
    const e = on();
    if (e === "fit") {
      V();
      return;
    }
    if (e === "recenter") {
      const t = h.find((o) => !o.parentId), n = i.selectedNodeId && S[i.selectedNodeId] ? i.selectedNodeId : t && t.id;
      n && Ge(n);
    }
  }
  function nt() {
    for (const e of h) e.collapsed = !1;
    M();
  }
  function ot() {
    const e = Tn(h, f);
    for (const t of h) t.collapsed = e[t.id] >= 1 && Pt(h, t.id) > 0;
    M();
  }
  function it(e) {
    const t = f[e];
    t && (t.collapsed = !t.collapsed, M());
  }
  function st(e) {
    if (k = Nn(h, e), Ne(), k.size) {
      const t = E.find((n) => k.has(n.node.id));
      t && Ge(t.node.id);
    }
    return k.size;
  }
  function lt() {
    k = /* @__PURE__ */ new Set(), Ne();
  }
  function Ne() {
    const e = k.size > 0;
    for (const t of E) {
      const n = d[t.node.id];
      if (!n) continue;
      const o = k.has(t.node.id);
      n.classList.toggle("loc-highlight", e && o), n.classList.toggle("loc-dim", e && !o);
    }
    for (const t in b) b[t].classList.toggle("loc-hl", e && k.has(t));
  }
  function sn(e, t) {
    if (e.target.closest('[data-role="toggle"]') || (e.stopPropagation(), W(), ct(t), g("node-select", { id: t, node: f[t], rect: dt(t) }), r.inspector && Xe(t), r.readonly || !r.enableDragging || !i.editMode)) return;
    const n = p[t] || { dx: 0, dy: 0 };
    m = { id: t, startX: e.clientX, startY: e.clientY, baseDx: n.dx, baseDy: n.dy, moved: !1 }, d[t].classList.add("loc-dragging"), g("node-drag-start", { id: t, node: f[t] }), P("pointermove", at), P("pointerup", rt);
  }
  function at(e) {
    if (!m) return;
    let t = m.baseDx + (e.clientX - m.startX) / i.zoom, n = m.baseDy + (e.clientY - m.startY) / i.zoom;
    if (Math.abs(e.clientX - m.startX) + Math.abs(e.clientY - m.startY) > 3 && (m.moved = !0), i.snapGrid) {
      const o = i.gridSize, s = S[m.id];
      s && (t = Math.round((s.cx + t) / o) * o - s.cx, n = Math.round((s.cy + n) / o) * o - s.cy);
    }
    p[m.id] = { dx: t, dy: n }, le || (le = requestAnimationFrame(() => {
      le = 0, ln(m.id), an(m.id), g("node-drag", { id: m.id, node: f[m.id], offset: p[m.id] });
    }));
  }
  function rt() {
    if (m) {
      const e = d[m.id];
      e && e.classList.remove("loc-dragging"), g("node-drag-end", { id: m.id, node: f[m.id], offset: p[m.id] }), tt();
    }
    m = null, H("pointermove", at), H("pointerup", rt), x();
  }
  function ln(e) {
    const t = S[e], n = d[e];
    if (!t || !n) return;
    const o = se(t, p);
    n.style.transform = `translate(${o.x - t.node.width / 2}px, ${o.y - t.node.height / 2}px)`;
  }
  function an(e) {
    const t = S[e];
    if (t) {
      S[t.node.parentId] && q(e);
      for (const n of E) n.node.parentId === e && q(n.node.id);
      i.selectedEdgeId && _();
    }
  }
  function ct(e) {
    i.selectedNodeId && d[i.selectedNodeId] && d[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = e, d[e] && d[e].classList.add("loc-selected");
  }
  function dt(e) {
    const t = d[e];
    if (!t) return null;
    const n = t.getBoundingClientRect();
    return { left: n.left, top: n.top, right: n.right, bottom: n.bottom, width: n.width, height: n.height };
  }
  function ve(e, t) {
    const n = w.getBoundingClientRect();
    return { x: (e - n.left - i.panX) / i.zoom, y: (t - n.top - i.panY) / i.zoom };
  }
  function Ce(e) {
    if (i.snapGrid) {
      const t = i.gridSize;
      return { x: Math.round(e.x / t) * t, y: Math.round(e.y / t) * t };
    }
    return { x: e.x, y: e.y };
  }
  function ut(e) {
    const t = S[e];
    if (!t) return null;
    const n = S[t.node.parentId];
    if (!n) return null;
    const o = v[e] || [];
    return $n(n, t, o, ce(), p, I[e]);
  }
  function pt(e) {
    const t = [], n = kn(ce());
    for (let o = 0; o < e.length - 1; o++) {
      const s = Xn([e[o], e[o + 1]], n);
      for (let l = 0; l < s.length - 1; l++) t.push({ a: s[l], b: s[l + 1], insert: o });
    }
    return t;
  }
  function ft(e) {
    i.selectedEdgeId && b[i.selectedEdgeId] && b[i.selectedEdgeId].classList.remove("loc-sel"), i.selectedNodeId && d[i.selectedNodeId] && d[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = null, i.selectedEdgeId = e, b[e] && b[e].classList.add("loc-sel"), _();
  }
  function W() {
    i.selectedEdgeId && b[i.selectedEdgeId] && b[i.selectedEdgeId].classList.remove("loc-sel"), i.selectedEdgeId = null, z.innerHTML = "";
  }
  function ze(e, t, n, o) {
    const s = me("circle");
    return s.setAttribute("cx", e), s.setAttribute("cy", t), s.setAttribute("r", n), s.setAttribute("class", o), s;
  }
  function gt(e, t, n, o) {
    const s = me("rect");
    return s.setAttribute("x", e - n), s.setAttribute("y", t - n), s.setAttribute("width", 2 * n), s.setAttribute("height", 2 * n), s.setAttribute("rx", 2 / i.zoom), s.setAttribute("class", o), s;
  }
  function _() {
    z.innerHTML = "";
    const e = i.selectedEdgeId;
    if (!e || r.readonly) return;
    const t = ut(e);
    if (!t) return;
    const n = v[e] || [], o = 6 / i.zoom, s = 5 / i.zoom;
    if (!i.editMode) {
      for (let u = 0; u < n.length; u++) {
        const R = ze(n[u].x, n[u].y, o, "loc-wp-handle loc-wp-readonly");
        R.dataset.wp = u, z.appendChild(R);
      }
      return;
    }
    for (const u of pt(t)) {
      const R = ze((u.a.x + u.b.x) / 2, (u.a.y + u.b.y) / 2, s, "loc-wp-add");
      R.dataset.add = u.insert, z.appendChild(R);
    }
    for (let u = 0; u < n.length; u++) {
      const R = ze(n[u].x, n[u].y, o, "loc-wp-handle");
      R.dataset.wp = u, z.appendChild(R);
    }
    const l = t[0], a = t[t.length - 1], c = gt(l.x, l.y, 6 / i.zoom, "loc-ep loc-ep-parent");
    c.dataset.ep = "parent", z.appendChild(c);
    const y = gt(a.x, a.y, 6 / i.zoom, "loc-ep loc-ep-child");
    y.dataset.ep = "child", z.appendChild(y);
  }
  function ht(e, t) {
    const n = se(e, p), o = e.node.width, s = e.node.height;
    let l = (t.x - n.x) / (o / 2), a = (t.y - n.y) / (s / 2);
    const c = Math.max(Math.abs(l), Math.abs(a));
    return c > 1e-6 && (l /= c, a /= c), { nx: Math.max(-1, Math.min(1, l)), ny: Math.max(-1, Math.min(1, a)) };
  }
  function rn(e, t) {
    const n = new Set([t].concat(De(t)));
    for (let o = E.length - 1; o >= 0; o--) {
      const s = E[o];
      if (n.has(s.node.id)) continue;
      const l = se(s, p);
      if (e.x >= l.x - s.node.width / 2 && e.x <= l.x + s.node.width / 2 && e.y >= l.y - s.node.height / 2 && e.y <= l.y + s.node.height / 2) return s.node.id;
    }
    return null;
  }
  let ne = null;
  function Re(e) {
    ne && d[ne] && d[ne].classList.remove("loc-reparent-target"), ne = e, e && d[e] && d[e].classList.add("loc-reparent-target");
  }
  function bt(e) {
    if (!A || A.kind !== "ep") return;
    const t = A.id, n = S[t];
    if (!n) return;
    const o = S[n.node.parentId];
    if (!o) return;
    const s = ve(e.clientX, e.clientY);
    if (I[t] = I[t] || {}, A.which === "child")
      I[t].c = ht(n, s);
    else {
      I[t].p = ht(o, s);
      const l = rn(s, t);
      Re(l && l !== n.node.parentId ? l : null);
    }
    q(t), _();
  }
  function mt() {
    const e = A;
    if (A = null, H("pointermove", bt), H("pointerup", mt), e && e.which === "parent" && ne) {
      const t = ne;
      Re(null), je(e.id, t);
      return;
    }
    Re(null), x();
  }
  function je(e, t) {
    const n = f[e];
    !n || t === e || t && De(e).indexOf(t) >= 0 || (n.parentId = t || "", L[e] = Object.assign(L[e] || {}, { parentId: n.parentId }), delete v[e], delete I[e], i.selectedEdgeId = null, z.innerHTML = "", S[e] && Object.assign(S[e].node, { parentId: n.parentId }), M(), g("node-change", { id: e, node: { ...n }, patch: { parentId: n.parentId }, reparented: !0 }), x());
  }
  function $e(e) {
    je(e, "");
  }
  function cn(e, t, n) {
    const o = n.x - t.x, s = n.y - t.y, l = o * o + s * s;
    let a = l ? ((e.x - t.x) * o + (e.y - t.y) * s) / l : 0;
    return a = Math.max(0, Math.min(1, a)), Math.hypot(e.x - (t.x + a * o), e.y - (t.y + a * s));
  }
  function dn(e, t) {
    const n = pt(e);
    let o = 0, s = 1 / 0;
    for (const l of n) {
      const a = cn(t, l.a, l.b);
      a < s && (s = a, o = l.insert);
    }
    return o;
  }
  const un = ["", "Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "RowWrap"];
  function Se(e) {
    return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function ke() {
    C.classList.toggle("loc-edit", i.editMode);
  }
  function yt(e) {
    i.editMode = !!e, ke(), D(), i.editMode || W(), j.classList.contains("loc-open") && Ye(), g("edit-mode-change", { editMode: i.editMode }), x();
  }
  function Xe(e) {
    r.inspector && (i.selectedNodeId = e, j.classList.add("loc-open"), Ye(), g("inspector-open", { id: e, node: f[e] }));
  }
  function J() {
    j.classList.contains("loc-open") && (j.classList.remove("loc-open"), g("inspector-close", {}));
  }
  function Ye() {
    const e = i.selectedNodeId, t = e && f[e];
    if (!t) {
      J();
      return;
    }
    if (Kt.textContent = t.label || t.personName || t.id, r.inspectorSlot) {
      Je.innerHTML = "";
      return;
    }
    const n = i.editMode, o = n ? "" : " disabled", s = (y, u, R) => `<input data-field="${y}" type="${R || "text"}" value="${Se(u)}"${o}/>`, l = (y, u, R) => `<select data-field="${y}"${o}>` + R.map((ie) => {
      const Bt = Array.isArray(ie) ? ie[0] : ie, On = Array.isArray(ie) ? ie[1] : ie || "—";
      return `<option value="${Se(Bt)}"${String(Bt) === String(u ?? "") ? " selected" : ""}>${On}</option>`;
    }).join("") + "</select>", a = (y, u) => `<label class="loc-field"><span>${y}</span>${u}</label>`;
    let c = a("ID", `<input value="${Se(t.id)}" disabled/>`) + a("Type", l("type", t.type, [["department", "department"], ["position", "position"]])) + a("Label", s("label", t.label));
    t.type !== "department" && (c += a("Person name", s("personName", t.personName)) + a("Status", l("status", t.status, [["", "—"], ["FILLED", "FILLED"], ["VACANT", "VACANT"], ["UNFUNDED", "UNFUNDED"]])) + a("Photo URL", s("photo_url", t.data && t.data.photo_url || ""))), c += a("Layout override", l("layoutMode", t.layoutMode || "", un.map((y) => [y, y || "(inherit)"]))) + a("Width", s("width", t.width, "number")) + a("Height", s("height", t.height, "number")), Ae.innerHTML = c, Je.innerHTML = n ? '<button data-role="add-child">+ Add child</button>' + (t.parentId ? '<button data-role="detach">Detach</button>' : "") + '<button data-role="del-node" class="loc-danger">Delete</button>' : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  function pn() {
    let e;
    do
      e = "node-" + ++Vt;
    while (f[e]);
    return e;
  }
  function oe(e, t) {
    const n = f[e];
    if (!n) return;
    Object.assign(n, t), S[e] && S[e].node !== n && Object.assign(S[e].node, t), L[e] = Object.assign(L[e] || {}, t);
    const o = ["type", "width", "height", "layoutMode"].some((s) => s in t);
    d[e] && (d[e].remove(), delete d[e]), o ? M() : Qe(), g("node-change", { id: e, node: { ...n }, patch: t }), x();
  }
  function De(e) {
    const t = [], n = [e];
    for (; n.length; ) {
      const o = n.pop();
      for (const s of h) s.parentId === o && (t.push(s.id), n.push(s.id));
    }
    return t;
  }
  function vt(e) {
    if (!i.editMode) return;
    const t = pn(), n = Le({ id: t, parentId: e || "", type: "position", label: "NEW POSITION", personName: "", status: "" });
    h.push(n), f[t] = n, L[t] = Object.assign({ __new: !0 }, n), M(), ct(t), Xe(t), g("node-change", { id: t, node: { ...n }, added: !0 }), x();
  }
  function St(e) {
    if (!i.editMode || !e) return;
    const t = [e].concat(De(e)), n = new Set(t);
    h = h.filter((o) => !n.has(o.id)), f = Ee(h), t.forEach((o) => {
      L[o] = { __deleted: !0 }, d[o] && (d[o].remove(), delete d[o]);
    }), n.has(i.selectedNodeId) && (i.selectedNodeId = null, J()), M(), g("node-change", { id: e, removed: !0, ids: t }), x();
  }
  function wt() {
    const e = new Set(Object.keys(L).filter((t) => L[t] && L[t].__deleted));
    e.size && (h = h.filter((t) => !e.has(t.id))), f = Ee(h);
    for (const t in L) {
      const n = L[t];
      if (!(!n || n.__deleted))
        if (n.__new) {
          if (!f[t]) {
            const o = Object.assign({}, n);
            delete o.__new;
            const s = Le(o);
            h.push(s), f[t] = s;
          }
        } else f[t] && Object.assign(f[t], n);
    }
  }
  const fn = [
    ["type", "Type"],
    ["status", "Status"],
    ["level", "Level (data.level)"],
    ["unit", "Unit (data.unit)"],
    ["id", "Node id"],
    ["label", "Label"]
  ];
  function xt(e, t) {
    const n = Ht(t, T);
    Fe(e, "--loc-node-bg", n && n.bg), Fe(e, "--loc-node-text", n && n.text), Fe(e, "--loc-node-border", n && n.border);
  }
  function Fe(e, t, n) {
    n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
  }
  function we() {
    for (const e in d) f[e] && xt(d[e], f[e]);
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
      themeRules: T.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    };
  }
  function Mt(e, t) {
    e = e || {}, typeof e.spacingX == "number" && (i.spacingX = e.spacingX), typeof e.spacingY == "number" && (i.spacingY = e.spacingY), typeof e.gridSize == "number" && (i.gridSize = e.gridSize), e.orientation && (i.orientation = ge(e.orientation)), e.subtreeMode && (i.subtreeMode = e.subtreeMode), "showGrid" in e && (i.showGrid = !!e.showGrid), "snapGrid" in e && (i.snapGrid = !!e.snapGrid), "alignGrid" in e && (i.alignGrid = !!e.alignGrid), Array.isArray(e.themeRules) && (T = e.themeRules.map(pe)), ye(), D(), M(), B.classList.contains("loc-open") && xe(), t && t.silent || g("settings-change", Y()), x();
  }
  function Be(e) {
    const t = B.classList.contains("loc-open"), n = e == null ? !t : !!e;
    B.classList.toggle("loc-open", n), $ && $.querySelectorAll('button[data-act="settings"]').forEach((o) => o.classList.toggle("loc-active", n)), n && xe(), n !== t && g(n ? "settings-open" : "settings-close", {});
  }
  function It() {
    Mt({
      spacingX: U.spacingX,
      spacingY: U.spacingY,
      gridSize: U.gridSize,
      showGrid: U.showGrid,
      snapGrid: U.snapGrid,
      alignGrid: U.alignGrid,
      themeRules: U.themeRules.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    }), we();
  }
  function _e(e, t, n, o, s) {
    return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${o}" max="${s}" value="${n}"/></label>`;
  }
  function Pe(e, t, n, o) {
    return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${o ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${o || "#e0524d"}"/></label>`;
  }
  function gn(e, t) {
    const n = (o, s) => `<option value="${o}"${e.field === o ? " selected" : ""}>${s}</option>`;
    return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + fn.map(([o, s]) => n(o, s)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${Se(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Pe(t, "bg", "BG", e.style.bg) + Pe(t, "text", "Text", e.style.text) + Pe(t, "border", "Border", e.style.border) + "</div></div>";
  }
  function xe() {
    if (r.settingsSlot) return;
    let e = '<div class="loc-set-section"><div class="loc-set-title">Layout</div>' + _e("spacingX", "Spacing X", i.spacingX, 0, 200) + _e("spacingY", "Spacing Y", i.spacingY, 0, 260) + _e("gridSize", "Grid size", i.gridSize, 6, 80) + "</div>";
    e += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div><div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>', T.forEach((t, n) => {
      e += gn(t, n);
    }), e += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>', e += '<div class="loc-set-foot"><button class="loc-set-reset" data-role="reset-settings" title="Restore spacing, grid &amp; theme rules to defaults">↺ Reset settings</button></div>', te.innerHTML = e;
  }
  function hn(e, t) {
    const n = te.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
    return n && n.checked;
  }
  function bn(e, t) {
    const n = te.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
    return n ? n.value : "";
  }
  function x() {
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
          edgeWaypoints: v,
          edgeAnchors: I,
          nodeOverrides: L,
          themeRules: T,
          collapsed: h.filter((e) => e.collapsed).map((e) => e.id)
        }));
      } catch {
      }
  }
  function mn() {
    if (!r.persist) return;
    let e;
    try {
      e = JSON.parse(localStorage.getItem(r.storageKey) || "null");
    } catch {
      e = null;
    }
    if (e && (e.orientation && (i.orientation = ge(e.orientation)), e.subtreeMode && (i.subtreeMode = e.subtreeMode), ["spacingX", "spacingY", "zoom", "panX", "panY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (i[t] = e[t]);
    }), i.showGrid = !!e.showGrid, i.snapGrid = !!e.snapGrid, i.alignGrid = !!e.alignGrid, i.editMode = !!e.editMode, e.manualOffsets && (p = e.manualOffsets), e.edgeWaypoints && (v = e.edgeWaypoints), e.edgeAnchors && (I = e.edgeAnchors), e.nodeOverrides && (L = e.nodeOverrides, wt()), Array.isArray(e.themeRules) && (T = e.themeRules.map(pe)), Array.isArray(e.collapsed))) {
      const t = new Set(e.collapsed);
      for (const n of h) n.collapsed = t.has(n.id);
    }
  }
  function Lt(e) {
    const t = An(i, h, p, v);
    return t.editMode = i.editMode, t.edgeAnchors = I, t.nodeOverrides = L, t.settings = Y(), e !== !1 && He(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
  }
  const Et = document.createElement("canvas").getContext("2d");
  function yn(e, t) {
    return Et.font = t, Et.measureText(e).width;
  }
  function vn(e) {
    const t = d[e.id];
    if (!t) return 1;
    const n = parseFloat(t.style.getPropertyValue("--loc-fit"));
    return isFinite(n) && n > 0 ? n : 1;
  }
  function ue(e) {
    const t = [];
    for (const n in b) t.push(b[n].getAttribute("d"));
    return Cn(E, t, { manualOffsets: p, raster: !!e, measureText: yn, fitOf: vn });
  }
  function Ot() {
    return He(new Blob([ue(!1)], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), ue(!1);
  }
  function At(e) {
    e = e || 3;
    const t = _t(E, p, 40), n = 16e3, o = 2e8;
    let s = Math.min(e, n / t.w, n / t.h);
    t.w * s * t.h * s > o && (s = Math.sqrt(o / (t.w * t.h))), s = Math.max(0.05, s);
    const l = URL.createObjectURL(new Blob([ue(!0)], { type: "image/svg+xml;charset=utf-8" })), a = new Image();
    a.onload = () => {
      const c = document.createElement("canvas");
      c.width = Math.round(t.w * s), c.height = Math.round(t.h * s);
      const y = c.getContext("2d");
      y.setTransform(s, 0, 0, s, 0, 0), y.drawImage(a, 0, 0), URL.revokeObjectURL(l);
      try {
        c.toBlob((u) => {
          u && He(u, "org-chart.png");
        }, "image/png");
      } catch {
      }
    }, a.onerror = () => URL.revokeObjectURL(l), a.src = l;
  }
  function Gt() {
    const e = window.open("", "_blank");
    e && (e.document.open(), e.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + ue(!1) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), e.document.close());
  }
  function He(e, t) {
    const n = URL.createObjectURL(e), o = document.createElement("a");
    o.href = n, o.download = t, document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(n);
  }
  function Tt(e, t, n) {
    const o = !(n && n.resetEdits);
    h = (e || []).map(Le), f = Ee(h), o || (p = /* @__PURE__ */ Object.create(null), v = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null)), i.selectedNodeId = null, i.selectedEdgeId = null, k = /* @__PURE__ */ new Set(), J();
    for (const s in d)
      d[s].remove(), delete d[s];
    for (const s in b)
      b[s].remove(), delete b[s];
    for (const s in N)
      N[s].remove(), delete N[s];
    t && (t.subtreeMode && (i.subtreeMode = t.subtreeMode), t.orientation && (i.orientation = ge(t.orientation)), t.manualOffsets && (p = t.manualOffsets), t.edgeWaypoints && (v = t.edgeWaypoints), t.edgeAnchors && (I = t.edgeAnchors), t.nodeOverrides && (L = t.nodeOverrides), typeof t.editMode == "boolean" && (i.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (T = t.settings.themeRules.map(pe))), o && wt(), ke(), D(), M(), r.fitOnInit && V();
  }
  function Sn(e) {
    const { nodes: t, meta: n } = zn(e);
    return Tt(t, n), t.length;
  }
  function Nt(e) {
    const t = ge(e);
    i.orientation = t, p = /* @__PURE__ */ Object.create(null), v = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), W(), D(), M(), Te(), g("orientation-change", { orientation: t });
  }
  function Ct(e) {
    i.subtreeMode = e, p = /* @__PURE__ */ Object.create(null), v = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), W(), D(), M(), Te(), g("subtree-mode-change", { subtreeMode: e });
  }
  function wn(e, t) {
    e != null && (i.spacingX = e), t != null && (i.spacingY = t), M(), g("settings-change", Y());
  }
  function Me(e, t) {
    e in i ? (i[e] = t, e === "showGrid" && ye(), e === "alignGrid" && (p = /* @__PURE__ */ Object.create(null), M()), D(), x(), ["showGrid", "snapGrid", "alignGrid", "gridSize"].includes(e) && g("settings-change", Y())) : r[e] = t;
  }
  function zt(e) {
    return Me("showGrid", !!e), i.showGrid;
  }
  function xn(e) {
    return Me("snapGrid", !!e), i.snapGrid;
  }
  function Mn(e) {
    return Me("alignGrid", !!e), i.alignGrid;
  }
  function In(e) {
    return zt(e ?? !i.showGrid);
  }
  function Ue() {
    p = /* @__PURE__ */ Object.create(null), v = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), W(), M(), Te();
  }
  function Rt() {
    lt(), J(), Ue(), V();
  }
  function jt() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function Ie() {
    return jt() === C;
  }
  function $t() {
    const e = C.requestFullscreen || C.webkitRequestFullscreen;
    if (e)
      try {
        const t = e.call(C);
        t && t.catch && t.catch(() => {
        });
      } catch {
      }
  }
  function kt() {
    const e = document.exitFullscreen || document.webkitExitFullscreen;
    if (e && jt())
      try {
        e.call(document);
      } catch {
      }
  }
  function qe(e) {
    const t = e == null ? !Ie() : !!e;
    return t ? $t() : kt(), t;
  }
  function Xt() {
    const e = Ie();
    C.classList.toggle("loc-fullscreen", e), X && (X.title = e ? "Exit fullscreen" : "Fullscreen"), D(), V(), g("fullscreen-change", { fullscreen: e });
  }
  O(be, "pointerdown", (e) => {
    const t = e.target.closest(".loc-node");
    t && sn(e, t.dataset.id);
  }), O(be, "click", (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !r.readonly) {
      it(t.closest(".loc-node").dataset.id);
      return;
    }
    const n = e.target.closest(".loc-node");
    n && g("node-click", { id: n.dataset.id, node: f[n.dataset.id] });
  }), O(ae, "pointerdown", (e) => {
    const t = e.target.closest("path");
    t && (e.stopPropagation(), ft(t.dataset.edge));
  }), O(ae, "dblclick", (e) => {
    if (r.readonly || !i.editMode) return;
    const t = e.target.closest("path");
    if (!t) return;
    const n = t.dataset.edge;
    ft(n);
    const o = ut(n);
    if (!o) return;
    const s = Ce(ve(e.clientX, e.clientY));
    (v[n] || (v[n] = [])).splice(dn(o, s), 0, s), q(n), _(), x();
  }), O(z, "pointerdown", (e) => {
    if (r.readonly || !i.editMode) return;
    const t = e.target, n = i.selectedEdgeId;
    if (!n) return;
    if (t.dataset.ep) {
      e.stopPropagation(), e.preventDefault(), A = { id: n, kind: "ep", which: t.dataset.ep }, P("pointermove", bt), P("pointerup", mt);
      return;
    }
    let o;
    if (t.dataset.wp != null) o = +t.dataset.wp;
    else if (t.dataset.add != null) {
      const s = +t.dataset.add;
      (v[n] || (v[n] = [])).splice(s, 0, Ce(ve(e.clientX, e.clientY))), o = s, q(n);
    } else return;
    e.stopPropagation(), e.preventDefault(), A = { id: n, idx: o }, P("pointermove", Yt), P("pointerup", Dt);
  }), O(z, "dblclick", (e) => {
    const t = e.target;
    if (t.dataset.ep === "parent") {
      $e(i.selectedEdgeId);
      return;
    }
    if (t.dataset.wp == null) return;
    const n = i.selectedEdgeId, o = v[n];
    o && (o.splice(+t.dataset.wp, 1), o.length || delete v[n], q(n), _(), x());
  });
  function Yt(e) {
    if (!A) return;
    const t = v[A.id];
    t && (t[A.idx] = Ce(ve(e.clientX, e.clientY)), q(A.id), _());
  }
  function Dt() {
    A = null, H("pointermove", Yt), H("pointerup", Dt), x();
  }
  O(j, "click", (e) => {
    if (e.target.closest('[data-role="panel-close"]')) {
      J();
      return;
    }
    if (e.target.closest('[data-role="add-child"]')) {
      vt(i.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="detach"]')) {
      $e(i.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="del-node"]')) {
      St(i.selectedNodeId);
      return;
    }
  }), O(Ae, "input", (e) => {
    if (!i.editMode) return;
    const t = e.target.closest("[data-field]");
    if (!t) return;
    const n = i.selectedNodeId;
    if (!n) return;
    const o = t.dataset.field;
    let s = t.value;
    if (o === "type") {
      oe(n, { type: s }), Ye();
      return;
    }
    if (o === "width" || o === "height") {
      oe(n, { [o]: Math.max(20, parseFloat(s) || 0) });
      return;
    }
    if (o === "photo_url") {
      const l = f[n];
      oe(n, { data: Object.assign({}, l.data, { photo_url: s || null }) });
      return;
    }
    if (o === "layoutMode") {
      oe(n, { layoutMode: s || null });
      return;
    }
    oe(n, { [o]: s });
  }), O(B, "click", (e) => {
    if (e.target.closest('[data-role="settings-close"]')) {
      Be(!1);
      return;
    }
    if (e.target.closest('[data-role="reset-settings"]')) {
      It();
      return;
    }
    if (e.target.closest('[data-role="add-rule"]')) {
      T.push(pe({ field: "type", value: "", style: {} })), xe(), we(), x(), g("settings-change", Y());
      return;
    }
    const t = e.target.closest('[data-rk="remove"]');
    t && (T.splice(+t.dataset.rule, 1), xe(), we(), x(), g("settings-change", Y()));
  }), O(te, "input", (e) => {
    const t = e.target;
    if (t.dataset.set != null) {
      const n = parseFloat(t.value);
      i[t.dataset.set] = n;
      const o = te.querySelector(`[data-rangelabel="${t.dataset.set}"]`);
      o && (o.textContent = n), M(), g("settings-change", Y()), x();
      return;
    }
    if (t.dataset.rule != null) {
      const n = +t.dataset.rule, o = t.dataset.rk, s = T[n];
      if (!s) return;
      if (o === "enabled") s.enabled = t.checked;
      else if (o === "field") s.field = t.value;
      else if (o === "value") s.value = t.value;
      else if (o === "bg" || o === "text" || o === "border")
        hn(n, o) && (s.style[o] = t.value);
      else if (/-on$/.test(o)) {
        const l = o.replace("-on", "");
        s.style[l] = t.checked ? bn(n, l) || "#e0524d" : "";
      }
      we(), g("settings-change", Y()), x();
    }
  }), O(w, "pointerdown", (e) => {
    if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn"))
      return;
    const t = () => {
      i.selectedNodeId && (d[i.selectedNodeId] && d[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = null), i.selectedEdgeId && W(), J();
    };
    if (!r.enablePan) {
      t();
      return;
    }
    const n = e.clientX, o = e.clientY, s = i.panX, l = i.panY;
    let a = !1;
    w.classList.add("loc-panning");
    const c = (u) => {
      !a && Math.abs(u.clientX - n) + Math.abs(u.clientY - o) > 3 && (a = !0), i.panX = s + (u.clientX - n), i.panY = l + (u.clientY - o), de();
    }, y = () => {
      w.classList.remove("loc-panning"), H("pointermove", c), H("pointerup", y), a || t();
    };
    P("pointermove", c), P("pointerup", y);
  }), O(w, "wheel", (e) => {
    if (!r.enableZoom) return;
    e.preventDefault();
    const t = w.getBoundingClientRect(), n = e.clientX - t.left, o = e.clientY - t.top, s = e.deltaY < 0 ? 1.1 : 1 / 1.1, l = Math.min(3, Math.max(0.15, i.zoom * s));
    i.panX = n - (n - i.panX) * (l / i.zoom), i.panY = o - (o - i.panY) * (l / i.zoom), i.zoom = l, de();
  }, { passive: !1 });
  function P(e, t) {
    window.addEventListener(e, t), he.push({ target: window, type: e, fn: t });
  }
  function H(e, t) {
    window.removeEventListener(e, t);
  }
  function Ln() {
    const e = r.toolbar && typeof r.toolbar == "object" ? r.toolbar : {}, t = (a) => e[a] !== !1, n = G("div", "loc-toolbar");
    let o = "";
    return t("subtree") && (o += s("Subtree", ["Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "RowWrap"].map((a) => l("mode", a, a)).join(""))), t("orient") && (o += s("Orient", [["TopToBottom", "Top"], ["BottomToTop", "Bottom"], ["LeftToRight", "Left"], ["RightToLeft", "Right"]].map(([a, c]) => l("orient", a, c)).join(""))), t("actions") && (o += s("", '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button><button data-act="reset">Reset</button><button data-act="fullscreen" title="Toggle fullscreen">Fullscreen</button>')), t("search") && (o += s("Search", '<input type="search" data-role="search" class="loc-search-input" placeholder="Search…" />')), t("grid") && (o += s("Grid", '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>')), t("mode") && (o += s("Mode", '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="settings" title="Settings &amp; theming">Settings</button>')), t("export") && (o += s("Export", '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>')), n.innerHTML = o, n.addEventListener("click", (a) => {
      const c = a.target.closest("button");
      if (c)
        if (c.dataset.mode) Ct(c.dataset.mode);
        else if (c.dataset.orient) Nt(c.dataset.orient);
        else if (c.dataset.flag)
          i[c.dataset.flag] = !i[c.dataset.flag], c.dataset.flag === "showGrid" ? ye() : c.dataset.flag === "alignGrid" && (p = /* @__PURE__ */ Object.create(null), M()), D(), x();
        else switch (c.dataset.act) {
          case "expand":
            nt();
            break;
          case "collapse":
            ot();
            break;
          case "fit":
            V();
            break;
          case "relayout":
            Ue();
            break;
          case "reset":
            Rt();
            break;
          case "fullscreen":
            qe();
            break;
          case "edit":
            yt(!i.editMode);
            break;
          case "settings":
            Be();
            break;
          case "png":
            At(3);
            break;
          case "svg":
            Ot();
            break;
          case "pdf":
            Gt();
            break;
          case "json":
            Lt(!0);
            break;
        }
    }), n.addEventListener("input", (a) => {
      const c = a.target.closest('[data-role="search"]');
      c && st(c.value);
    }), n;
    function s(a, c) {
      return `<div class="loc-group">${a ? `<span class="loc-label">${a}</span>` : ""}${c}</div>`;
    }
    function l(a, c, y) {
      return `<button data-${a}="${c}">${y}</button>`;
    }
  }
  function D() {
    $ && ($.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === i.subtreeMode)), $.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === i.orientation)), $.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!i[e.dataset.flag])), $.querySelectorAll('button[data-act="edit"]').forEach((e) => e.classList.toggle("loc-active", i.editMode)), $.querySelectorAll('button[data-act="fullscreen"]').forEach((e) => e.classList.toggle("loc-active", Ie())));
  }
  O(document, "fullscreenchange", Xt), O(document, "webkitfullscreenchange", Xt), mn(), D(), ye(), ke(), M(), r.fitOnInit && V();
  let Ft = !1;
  function En() {
    if (!Ft) {
      Ft = !0, he.forEach(({ target: e, type: t, fn: n, optsL: o }) => e.removeEventListener(t, n, o)), he.length = 0, le && cancelAnimationFrame(le), C.remove();
      for (const e in d) delete d[e];
      for (const e in b) delete b[e];
      for (const e in N) delete N[e];
    }
  }
  const Ve = {
    root: C,
    setNodes: Tt,
    loadJSON: Sn,
    setOrientation: Nt,
    setSubtreeMode: Ct,
    setSpacing: wn,
    setOption: Me,
    setShowGrid: zt,
    setSnapToGrid: xn,
    setAlignToGrid: Mn,
    toggleGrid: In,
    fitToScreen: V,
    relayout: Ue,
    resetView: Rt,
    expandAll: nt,
    collapseAll: ot,
    toggleCollapse: it,
    centerOnNode: Ge,
    search: st,
    clearSearch: lt,
    exportJSON: Lt,
    exportSVG: Ot,
    exportPNG: At,
    exportPDF: Gt,
    buildSVG: ue,
    setEditMode: yt,
    isEditMode: () => i.editMode,
    enterFullscreen: $t,
    exitFullscreen: kt,
    toggleFullscreen: qe,
    isFullscreen: Ie,
    updateNode: oe,
    addChild: vt,
    deleteNode: St,
    reparentNode: je,
    detachNode: $e,
    openInspector: Xe,
    closeInspector: J,
    nodeScreenRect: dt,
    getSettings: Y,
    setSettings: Mt,
    toggleSettings: Be,
    resetSettings: It,
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (e) => d[e] || null,
    getNodeSlotEl: (e) => d[e] ? d[e].querySelector(".loc-node-slot") : null,
    getInspectorBody: () => Ae,
    getSettingsBody: () => te,
    nodeThemeStyle: (e) => f[e] ? Ht(f[e], T) : null,
    getState: () => ({ ...i }),
    getNodes: () => h.map((e) => ({ ...e })),
    getPositioned: () => E,
    on: Wt,
    off: Jt,
    destroy: En
  };
  return Ve;
}
export {
  Un as CANVAS_PAD,
  qn as DEFAULTS,
  Vn as DEFAULT_SETTINGS,
  Wn as DEPT_SIZE,
  Jn as ORIENTATIONS,
  Kn as POS_SIZE,
  Zn as SNAKE_STUB,
  Qn as SUBTREE_MODES,
  eo as VIRTUAL_ROOT_ID,
  to as applyOrientation,
  Cn as buildChartSVG,
  no as buildTree,
  _t as calculateBounds,
  Pt as childCount,
  Tn as computeDepths,
  oo as convertMoTree,
  io as convertNestedTree,
  _n as createOrgChart,
  $n as edgeControlPoints,
  so as edgeEndpoints,
  se as effCenter,
  An as exportLayout,
  Gn as fitBounds,
  lo as getVisibleTree,
  Ee as indexNodes,
  kn as isHorizontal,
  ao as isMoArray,
  Rn as layoutOrgChart,
  ro as lh,
  co as lw,
  Le as makeNode,
  jn as normalizeConfig,
  zn as normalizeImported,
  pe as normalizeRule,
  uo as normalizeSettings,
  Xn as orthoThrough,
  po as personNameFromPos,
  Ht as resolveNodeStyle,
  Ut as routeConnector,
  Nn as searchNodes,
  fo as visibleDepths,
  go as waypointPath
};
