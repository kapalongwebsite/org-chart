import { makeNode as Me, indexNodes as Ie, normalizeRule as ue, exportLayout as Ln, calculateBounds as kt, fitBounds as En, computeDepths as On, childCount as Xt, searchNodes as An, resolveNodeStyle as Yt, buildChartSVG as Nn, effCenter as ne, normalizeImported as Tn, layoutOrgChart as Gn, routeConnector as Dt, normalizeConfig as Cn, edgeControlPoints as zn, isHorizontal as Rn, orthoThrough as $n } from "./core.js";
import { CANVAS_PAD as _n, DEFAULTS as Pn, DEFAULT_SETTINGS as Hn, DEPT_SIZE as Un, ORIENTATIONS as qn, POS_SIZE as Vn, SNAKE_STUB as Wn, SUBTREE_MODES as Jn, VIRTUAL_ROOT_ID as Kn, applyOrientation as Zn, buildTree as Qn, convertMoTree as eo, convertNestedTree as to, edgeEndpoints as no, getVisibleTree as oo, isMoArray as io, lh as lo, lw as so, normalizeSettings as ao, personNameFromPos as ro, visibleDepths as co, waypointPath as uo } from "./core.js";
const fe = "http://www.w3.org/2000/svg", jn = 0.5, kn = { Top: "TopToBottom", Bottom: "BottomToTop", Left: "LeftToRight", Right: "RightToLeft" };
function pe(W) {
  return kn[W] || W;
}
const Xn = {
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
  fitOnLayoutChange: !0,
  // re-frame after mode/orientation/re-layout: true|'fit' · 'recenter' · false|'none'
  fitOnInit: !0,
  toolbar: !0,
  // true | false | { subtree, orient, actions, grid, mode, export }
  persist: !1,
  storageKey: "local-org-chart.state"
};
function Dn(W, Ft = {}) {
  if (!W || !W.appendChild) throw new Error("createOrgChart: first argument must be a DOM element.");
  const r = Object.assign({}, Xn, Ft), i = {
    orientation: pe(r.orientation),
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
  let g = (r.nodes || []).map(Me), p = Ie(g), f = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), R = (r.settings && r.settings.themeRules || r.themeRules || []).map(ue), Bt = 0, E = [], v = /* @__PURE__ */ Object.create(null);
  const c = /* @__PURE__ */ Object.create(null), b = /* @__PURE__ */ Object.create(null), T = /* @__PURE__ */ Object.create(null);
  let A = null, m = null, oe = 0, k = /* @__PURE__ */ new Set();
  const ge = [], J = /* @__PURE__ */ Object.create(null);
  function _t(e, t) {
    return (J[e] || (J[e] = [])).push(t), qe;
  }
  function Pt(e, t) {
    return J[e] && (J[e] = J[e].filter((n) => n !== t)), qe;
  }
  function h(e, t) {
    (J[e] || []).forEach((n) => {
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
  const j = r.toolbar ? xn() : null;
  j && G.appendChild(j);
  const x = N("div", "loc-canvas"), K = N("div", "loc-content"), ie = N("div", "loc-grid"), Z = document.createElementNS(fe, "svg");
  Z.setAttribute("class", "loc-connectors");
  const le = document.createElementNS(fe, "g");
  le.setAttribute("class", "loc-edgehits"), Z.appendChild(le);
  const he = N("div", "loc-nodes"), se = document.createElementNS(fe, "svg");
  se.setAttribute("class", "loc-overlay");
  const C = document.createElementNS(fe, "g");
  C.setAttribute("class", "loc-edgehandles"), se.appendChild(C);
  const Le = N("div", "loc-zoomreadout");
  Le.textContent = "100%", K.appendChild(ie), K.appendChild(Z), K.appendChild(he), K.appendChild(se), x.appendChild(K), x.appendChild(Le);
  let X = null;
  r.fullscreenControl && (X = N("button", "loc-fsbtn"), X.type = "button", X.title = "Fullscreen", X.setAttribute("aria-label", "Toggle fullscreen"), X.innerHTML = "⛶", O(X, "click", (e) => {
    e.stopPropagation(), Ue();
  }), x.appendChild(X)), G.appendChild(x);
  const $ = N("div", "loc-panel");
  $.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Node</span><button class="loc-panel-close" title="Close" data-role="panel-close">✕</button></div><div class="loc-panel-body" data-role="panel-body"></div><div class="loc-panel-foot" data-role="panel-foot"></div>';
  const Ve = Ut(r.inspectorTarget) || x;
  Ve.appendChild($), Ve !== x && $.classList.add("loc-panel-external");
  const Ee = $.querySelector('[data-role="panel-body"]'), We = $.querySelector('[data-role="panel-foot"]'), Ht = $.querySelector(".loc-panel-title"), P = N("div", "loc-settings");
  P.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Settings</span><button class="loc-panel-close" title="Close" data-role="settings-close">✕</button></div><div class="loc-panel-body" data-role="settings-body"></div>', x.appendChild(P);
  const ae = P.querySelector('[data-role="settings-body"]');
  W.appendChild(G);
  function N(e, t) {
    const n = document.createElement(e);
    return t && (n.className = t), n;
  }
  function Ut(e) {
    if (!e) return null;
    const t = typeof e == "string" ? document.querySelector(e) : e;
    return t && t.appendChild ? t : null;
  }
  function re() {
    return Cn({
      orientation: i.orientation,
      subtreeMode: i.subtreeMode,
      spacingX: i.spacingX,
      spacingY: i.spacingY,
      gridSize: i.gridSize,
      alignGrid: i.alignGrid
    });
  }
  function qt() {
    const e = Gn(g, re());
    E = e.positioned, v = e.posById;
  }
  function M() {
    qt(), Zt(), Kt(), Je(), ce(), Ne(), S(), h("layout-change", { positioned: E, mode: i.subtreeMode, orientation: i.orientation });
  }
  function Je() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of E) {
      const n = t.node;
      e[n.id] = !0;
      let o = c[n.id];
      o || (o = Vt(n), c[n.id] = o, he.appendChild(o)), o.style.width = n.width + "px", o.style.height = n.height + "px";
      const l = ne(t, f);
      o.style.transform = `translate(${l.x - n.width / 2}px, ${l.y - n.height / 2}px)`, r.nodeSlots || (o.dataset.fitted || (Wt(o), o.dataset.fitted = "1"), yt(o, n)), o.classList.toggle("loc-selected", i.selectedNodeId === n.id), Jt(o, n);
    }
    for (const t in c) e[t] || (c[t].remove(), delete c[t]);
    h("nodes-rendered", { ids: E.map((t) => t.node.id) });
  }
  function Vt(e) {
    if (r.nodeSlots) {
      const n = N("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
      if (n.dataset.id = e.id, n.innerHTML = '<div class="loc-node-slot"></div>', e.type === "department") {
        const o = N("div", "loc-toggle");
        o.dataset.role = "toggle", n.appendChild(o);
      }
      return n;
    }
    const t = N("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
    if (t.dataset.id = e.id, e.type === "department") {
      t.innerHTML = '<span class="loc-lbl"></span>', t.querySelector(".loc-lbl").textContent = e.label;
      const n = N("div", "loc-toggle");
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
  function Ke(e) {
    return e.scrollWidth > e.clientWidth + 0.5 || e.scrollHeight > e.clientHeight + 0.5;
  }
  function Wt(e) {
    if (e.style.setProperty("--loc-fit", "1"), !Ke(e)) return;
    let t = jn, n = 1;
    for (let o = 0; o < 7; o++) {
      const l = (t + n) / 2;
      e.style.setProperty("--loc-fit", String(l)), Ke(e) ? n = l : t = l;
    }
    e.style.setProperty("--loc-fit", String(t));
  }
  function Jt(e, t) {
    const n = e.querySelector('[data-role="toggle"]');
    if (!n) return;
    const o = Xt(g, t.id) > 0;
    n.style.display = o ? "flex" : "none", n.textContent = t.collapsed ? "⊞" : "⊟";
  }
  function be(e) {
    return document.createElementNS(fe, e);
  }
  function Kt() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of E) {
      const n = t.node;
      if (!n.parentId) continue;
      const o = v[n.parentId];
      if (!o) continue;
      e[n.id] = !0;
      const l = Dt(o, t, re(), f, y, I);
      let s = b[n.id];
      s || (s = be("path"), b[n.id] = s, Z.appendChild(s)), s.setAttribute("d", l), s.classList.toggle("loc-sel", i.selectedEdgeId === n.id);
      let a = T[n.id];
      a || (a = be("path"), a.dataset.edge = n.id, T[n.id] = a, le.appendChild(a)), a.setAttribute("d", l);
    }
    for (const t in b) e[t] || (b[t].remove(), delete b[t]);
    for (const t in T) e[t] || (T[t].remove(), delete T[t]);
    i.selectedEdgeId && !e[i.selectedEdgeId] ? q() : F();
  }
  function H(e) {
    const t = v[e];
    if (!t) return;
    const n = v[t.node.parentId];
    if (!n) return;
    const o = Dt(n, t, re(), f, y, I);
    b[e] && b[e].setAttribute("d", o), T[e] && T[e].setAttribute("d", o);
  }
  function ce() {
    K.style.transform = `translate(${i.panX}px, ${i.panY}px) scale(${i.zoom})`, Le.textContent = Math.round(i.zoom * 100) + "%", i.selectedEdgeId && !A && F(), S();
  }
  function Zt() {
    let e = 0, t = 0;
    for (const n of E) {
      const o = ne(n, f);
      e = Math.max(e, o.x + n.node.width / 2 + 80), t = Math.max(t, o.y + n.node.height / 2 + 80);
    }
    Z.setAttribute("width", e), Z.setAttribute("height", t), se.setAttribute("width", e), se.setAttribute("height", t), ie.style.width = e + "px", ie.style.height = t + "px", ie.style.backgroundSize = i.gridSize + "px " + i.gridSize + "px";
  }
  function me() {
    ie.classList.toggle("loc-on", i.showGrid), x.classList.toggle("loc-gridon", i.showGrid);
  }
  function U() {
    if (!E.length) return;
    const e = kt(E, f, 0), t = En(e, x.clientWidth, x.clientHeight);
    i.zoom = t.zoom, i.panX = t.panX, i.panY = t.panY, ce();
  }
  function Oe(e) {
    const t = v[e];
    if (!t) return;
    const n = ne(t, f);
    i.panX = x.clientWidth / 2 - n.x * i.zoom, i.panY = x.clientHeight / 2 - n.y * i.zoom, ce();
  }
  function Qt() {
    const e = r.fitOnLayoutChange;
    return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
  }
  function Ae() {
    const e = Qt();
    if (e === "fit") {
      U();
      return;
    }
    if (e === "recenter") {
      const t = g.find((o) => !o.parentId), n = i.selectedNodeId && v[i.selectedNodeId] ? i.selectedNodeId : t && t.id;
      n && Oe(n);
    }
  }
  function Ze() {
    for (const e of g) e.collapsed = !1;
    M();
  }
  function Qe() {
    const e = On(g, p);
    for (const t of g) t.collapsed = e[t.id] >= 1 && Xt(g, t.id) > 0;
    M();
  }
  function et(e) {
    const t = p[e];
    t && (t.collapsed = !t.collapsed, M());
  }
  function tt(e) {
    if (k = An(g, e), Ne(), k.size) {
      const t = E.find((n) => k.has(n.node.id));
      t && Oe(t.node.id);
    }
    return k.size;
  }
  function nt() {
    k = /* @__PURE__ */ new Set(), Ne();
  }
  function Ne() {
    const e = k.size > 0;
    for (const t of E) {
      const n = c[t.node.id];
      if (!n) continue;
      const o = k.has(t.node.id);
      n.classList.toggle("loc-highlight", e && o), n.classList.toggle("loc-dim", e && !o);
    }
    for (const t in b) b[t].classList.toggle("loc-hl", e && k.has(t));
  }
  function en(e, t) {
    if (e.target.closest('[data-role="toggle"]') || (e.stopPropagation(), q(), lt(t), h("node-select", { id: t, node: p[t], rect: st(t) }), r.inspector && je(t), r.readonly || !r.enableDragging || !i.editMode)) return;
    const n = f[t] || { dx: 0, dy: 0 };
    m = { id: t, startX: e.clientX, startY: e.clientY, baseDx: n.dx, baseDy: n.dy, moved: !1 }, c[t].classList.add("loc-dragging"), h("node-drag-start", { id: t, node: p[t] }), B("pointermove", ot), B("pointerup", it);
  }
  function ot(e) {
    if (!m) return;
    let t = m.baseDx + (e.clientX - m.startX) / i.zoom, n = m.baseDy + (e.clientY - m.startY) / i.zoom;
    if (Math.abs(e.clientX - m.startX) + Math.abs(e.clientY - m.startY) > 3 && (m.moved = !0), i.snapGrid) {
      const o = i.gridSize, l = v[m.id];
      l && (t = Math.round((l.cx + t) / o) * o - l.cx, n = Math.round((l.cy + n) / o) * o - l.cy);
    }
    f[m.id] = { dx: t, dy: n }, oe || (oe = requestAnimationFrame(() => {
      oe = 0, tn(m.id), nn(m.id), h("node-drag", { id: m.id, node: p[m.id], offset: f[m.id] });
    }));
  }
  function it() {
    if (m) {
      const e = c[m.id];
      e && e.classList.remove("loc-dragging"), h("node-drag-end", { id: m.id, node: p[m.id], offset: f[m.id] });
    }
    m = null, _("pointermove", ot), _("pointerup", it), S();
  }
  function tn(e) {
    const t = v[e], n = c[e];
    if (!t || !n) return;
    const o = ne(t, f);
    n.style.transform = `translate(${o.x - t.node.width / 2}px, ${o.y - t.node.height / 2}px)`;
  }
  function nn(e) {
    const t = v[e];
    if (t) {
      v[t.node.parentId] && H(e);
      for (const n of E) n.node.parentId === e && H(n.node.id);
      i.selectedEdgeId && F();
    }
  }
  function lt(e) {
    i.selectedNodeId && c[i.selectedNodeId] && c[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = e, c[e] && c[e].classList.add("loc-selected");
  }
  function st(e) {
    const t = c[e];
    if (!t) return null;
    const n = t.getBoundingClientRect();
    return { left: n.left, top: n.top, right: n.right, bottom: n.bottom, width: n.width, height: n.height };
  }
  function ye(e, t) {
    const n = x.getBoundingClientRect();
    return { x: (e - n.left - i.panX) / i.zoom, y: (t - n.top - i.panY) / i.zoom };
  }
  function Te(e) {
    if (i.snapGrid) {
      const t = i.gridSize;
      return { x: Math.round(e.x / t) * t, y: Math.round(e.y / t) * t };
    }
    return { x: e.x, y: e.y };
  }
  function at(e) {
    const t = v[e];
    if (!t) return null;
    const n = v[t.node.parentId];
    if (!n) return null;
    const o = y[e] || [];
    return zn(n, t, o, re(), f, I[e]);
  }
  function rt(e) {
    const t = [], n = Rn(re());
    for (let o = 0; o < e.length - 1; o++) {
      const l = $n([e[o], e[o + 1]], n);
      for (let s = 0; s < l.length - 1; s++) t.push({ a: l[s], b: l[s + 1], insert: o });
    }
    return t;
  }
  function ct(e) {
    i.selectedEdgeId && b[i.selectedEdgeId] && b[i.selectedEdgeId].classList.remove("loc-sel"), i.selectedNodeId && c[i.selectedNodeId] && c[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = null, i.selectedEdgeId = e, b[e] && b[e].classList.add("loc-sel"), F();
  }
  function q() {
    i.selectedEdgeId && b[i.selectedEdgeId] && b[i.selectedEdgeId].classList.remove("loc-sel"), i.selectedEdgeId = null, C.innerHTML = "";
  }
  function Ge(e, t, n, o) {
    const l = be("circle");
    return l.setAttribute("cx", e), l.setAttribute("cy", t), l.setAttribute("r", n), l.setAttribute("class", o), l;
  }
  function dt(e, t, n, o) {
    const l = be("rect");
    return l.setAttribute("x", e - n), l.setAttribute("y", t - n), l.setAttribute("width", 2 * n), l.setAttribute("height", 2 * n), l.setAttribute("rx", 2 / i.zoom), l.setAttribute("class", o), l;
  }
  function F() {
    C.innerHTML = "";
    const e = i.selectedEdgeId;
    if (!e || r.readonly) return;
    const t = at(e);
    if (!t) return;
    const n = y[e] || [], o = 6 / i.zoom, l = 5 / i.zoom;
    if (!i.editMode) {
      for (let u = 0; u < n.length; u++) {
        const z = Ge(n[u].x, n[u].y, o, "loc-wp-handle loc-wp-readonly");
        z.dataset.wp = u, C.appendChild(z);
      }
      return;
    }
    for (const u of rt(t)) {
      const z = Ge((u.a.x + u.b.x) / 2, (u.a.y + u.b.y) / 2, l, "loc-wp-add");
      z.dataset.add = u.insert, C.appendChild(z);
    }
    for (let u = 0; u < n.length; u++) {
      const z = Ge(n[u].x, n[u].y, o, "loc-wp-handle");
      z.dataset.wp = u, C.appendChild(z);
    }
    const s = t[0], a = t[t.length - 1], d = dt(s.x, s.y, 6 / i.zoom, "loc-ep loc-ep-parent");
    d.dataset.ep = "parent", C.appendChild(d);
    const w = dt(a.x, a.y, 6 / i.zoom, "loc-ep loc-ep-child");
    w.dataset.ep = "child", C.appendChild(w);
  }
  function ut(e, t) {
    const n = ne(e, f), o = e.node.width, l = e.node.height;
    let s = (t.x - n.x) / (o / 2), a = (t.y - n.y) / (l / 2);
    const d = Math.max(Math.abs(s), Math.abs(a));
    return d > 1e-6 && (s /= d, a /= d), { nx: Math.max(-1, Math.min(1, s)), ny: Math.max(-1, Math.min(1, a)) };
  }
  function on(e, t) {
    const n = new Set([t].concat(Xe(t)));
    for (let o = E.length - 1; o >= 0; o--) {
      const l = E[o];
      if (n.has(l.node.id)) continue;
      const s = ne(l, f);
      if (e.x >= s.x - l.node.width / 2 && e.x <= s.x + l.node.width / 2 && e.y >= s.y - l.node.height / 2 && e.y <= s.y + l.node.height / 2) return l.node.id;
    }
    return null;
  }
  let Q = null;
  function Ce(e) {
    Q && c[Q] && c[Q].classList.remove("loc-reparent-target"), Q = e, e && c[e] && c[e].classList.add("loc-reparent-target");
  }
  function ft(e) {
    if (!A || A.kind !== "ep") return;
    const t = A.id, n = v[t];
    if (!n) return;
    const o = v[n.node.parentId];
    if (!o) return;
    const l = ye(e.clientX, e.clientY);
    if (I[t] = I[t] || {}, A.which === "child")
      I[t].c = ut(n, l);
    else {
      I[t].p = ut(o, l);
      const s = on(l, t);
      Ce(s && s !== n.node.parentId ? s : null);
    }
    H(t), F();
  }
  function pt() {
    const e = A;
    if (A = null, _("pointermove", ft), _("pointerup", pt), e && e.which === "parent" && Q) {
      const t = Q;
      Ce(null), ze(e.id, t);
      return;
    }
    Ce(null), S();
  }
  function ze(e, t) {
    const n = p[e];
    !n || t === e || t && Xe(e).indexOf(t) >= 0 || (n.parentId = t || "", L[e] = Object.assign(L[e] || {}, { parentId: n.parentId }), delete y[e], delete I[e], i.selectedEdgeId = null, C.innerHTML = "", v[e] && Object.assign(v[e].node, { parentId: n.parentId }), M(), h("node-change", { id: e, node: { ...n }, patch: { parentId: n.parentId }, reparented: !0 }), S());
  }
  function Re(e) {
    ze(e, "");
  }
  function ln(e, t, n) {
    const o = n.x - t.x, l = n.y - t.y, s = o * o + l * l;
    let a = s ? ((e.x - t.x) * o + (e.y - t.y) * l) / s : 0;
    return a = Math.max(0, Math.min(1, a)), Math.hypot(e.x - (t.x + a * o), e.y - (t.y + a * l));
  }
  function sn(e, t) {
    const n = rt(e);
    let o = 0, l = 1 / 0;
    for (const s of n) {
      const a = ln(t, s.a, s.b);
      a < l && (l = a, o = s.insert);
    }
    return o;
  }
  const an = ["", "Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Matrix"];
  function ve(e) {
    return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function $e() {
    G.classList.toggle("loc-edit", i.editMode);
  }
  function gt(e) {
    i.editMode = !!e, $e(), D(), i.editMode || q(), $.classList.contains("loc-open") && ke(), h("edit-mode-change", { editMode: i.editMode }), S();
  }
  function je(e) {
    r.inspector && (i.selectedNodeId = e, $.classList.add("loc-open"), ke(), h("inspector-open", { id: e, node: p[e] }));
  }
  function V() {
    $.classList.contains("loc-open") && ($.classList.remove("loc-open"), h("inspector-close", {}));
  }
  function ke() {
    const e = i.selectedNodeId, t = e && p[e];
    if (!t) {
      V();
      return;
    }
    if (Ht.textContent = t.label || t.personName || t.id, r.inspectorSlot) {
      We.innerHTML = "";
      return;
    }
    const n = i.editMode, o = n ? "" : " disabled", l = (w, u, z) => `<input data-field="${w}" type="${z || "text"}" value="${ve(u)}"${o}/>`, s = (w, u, z) => `<select data-field="${w}"${o}>` + z.map((te) => {
      const jt = Array.isArray(te) ? te[0] : te, In = Array.isArray(te) ? te[1] : te || "—";
      return `<option value="${ve(jt)}"${String(jt) === String(u ?? "") ? " selected" : ""}>${In}</option>`;
    }).join("") + "</select>", a = (w, u) => `<label class="loc-field"><span>${w}</span>${u}</label>`;
    let d = a("ID", `<input value="${ve(t.id)}" disabled/>`) + a("Type", s("type", t.type, [["department", "department"], ["position", "position"]])) + a("Label", l("label", t.label));
    t.type !== "department" && (d += a("Person name", l("personName", t.personName)) + a("Status", s("status", t.status, [["", "—"], ["FILLED", "FILLED"], ["VACANT", "VACANT"], ["UNFUNDED", "UNFUNDED"]])) + a("Photo URL", l("photo_url", t.data && t.data.photo_url || ""))), d += a("Layout override", s("layoutMode", t.layoutMode || "", an.map((w) => [w, w || "(inherit)"]))) + a("Width", l("width", t.width, "number")) + a("Height", l("height", t.height, "number")), Ee.innerHTML = d, We.innerHTML = n ? '<button data-role="add-child">+ Add child</button>' + (t.parentId ? '<button data-role="detach">Detach</button>' : "") + '<button data-role="del-node" class="loc-danger">Delete</button>' : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  function rn() {
    let e;
    do
      e = "node-" + ++Bt;
    while (p[e]);
    return e;
  }
  function ee(e, t) {
    const n = p[e];
    if (!n) return;
    Object.assign(n, t), v[e] && v[e].node !== n && Object.assign(v[e].node, t), L[e] = Object.assign(L[e] || {}, t);
    const o = ["type", "width", "height", "layoutMode"].some((l) => l in t);
    c[e] && (c[e].remove(), delete c[e]), o ? M() : Je(), h("node-change", { id: e, node: { ...n }, patch: t }), S();
  }
  function Xe(e) {
    const t = [], n = [e];
    for (; n.length; ) {
      const o = n.pop();
      for (const l of g) l.parentId === o && (t.push(l.id), n.push(l.id));
    }
    return t;
  }
  function ht(e) {
    if (!i.editMode) return;
    const t = rn(), n = Me({ id: t, parentId: e || "", type: "position", label: "NEW POSITION", personName: "", status: "" });
    g.push(n), p[t] = n, L[t] = Object.assign({ __new: !0 }, n), M(), lt(t), je(t), h("node-change", { id: t, node: { ...n }, added: !0 }), S();
  }
  function bt(e) {
    if (!i.editMode || !e) return;
    const t = [e].concat(Xe(e)), n = new Set(t);
    g = g.filter((o) => !n.has(o.id)), p = Ie(g), t.forEach((o) => {
      L[o] = { __deleted: !0 }, c[o] && (c[o].remove(), delete c[o]);
    }), n.has(i.selectedNodeId) && (i.selectedNodeId = null, V()), M(), h("node-change", { id: e, removed: !0, ids: t }), S();
  }
  function mt() {
    const e = new Set(Object.keys(L).filter((t) => L[t] && L[t].__deleted));
    e.size && (g = g.filter((t) => !e.has(t.id))), p = Ie(g);
    for (const t in L) {
      const n = L[t];
      if (!(!n || n.__deleted))
        if (n.__new) {
          if (!p[t]) {
            const o = Object.assign({}, n);
            delete o.__new;
            const l = Me(o);
            g.push(l), p[t] = l;
          }
        } else p[t] && Object.assign(p[t], n);
    }
  }
  const cn = [
    ["type", "Type"],
    ["status", "Status"],
    ["level", "Level (data.level)"],
    ["unit", "Unit (data.unit)"],
    ["id", "Node id"],
    ["label", "Label"]
  ];
  function yt(e, t) {
    const n = Yt(t, R);
    Ye(e, "--loc-node-bg", n && n.bg), Ye(e, "--loc-node-text", n && n.text), Ye(e, "--loc-node-border", n && n.border);
  }
  function Ye(e, t, n) {
    n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
  }
  function De() {
    for (const e in c) p[e] && yt(c[e], p[e]);
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
  function dn(e, t) {
    e = e || {}, typeof e.spacingX == "number" && (i.spacingX = e.spacingX), typeof e.spacingY == "number" && (i.spacingY = e.spacingY), typeof e.gridSize == "number" && (i.gridSize = e.gridSize), e.orientation && (i.orientation = pe(e.orientation)), e.subtreeMode && (i.subtreeMode = e.subtreeMode), "showGrid" in e && (i.showGrid = !!e.showGrid), "snapGrid" in e && (i.snapGrid = !!e.snapGrid), "alignGrid" in e && (i.alignGrid = !!e.alignGrid), Array.isArray(e.themeRules) && (R = e.themeRules.map(ue)), me(), D(), M(), P.classList.contains("loc-open") && Se(), t && t.silent || h("settings-change", Y()), S();
  }
  function Fe(e) {
    const t = e == null ? !P.classList.contains("loc-open") : !!e;
    P.classList.toggle("loc-open", t), j && j.querySelectorAll('button[data-act="settings"]').forEach((n) => n.classList.toggle("loc-active", t)), t && Se();
  }
  function Be(e, t, n, o, l) {
    return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${o}" max="${l}" value="${n}"/></label>`;
  }
  function _e(e, t, n, o) {
    return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${o ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${o || "#e0524d"}"/></label>`;
  }
  function un(e, t) {
    const n = (o, l) => `<option value="${o}"${e.field === o ? " selected" : ""}>${l}</option>`;
    return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + cn.map(([o, l]) => n(o, l)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${ve(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + _e(t, "bg", "BG", e.style.bg) + _e(t, "text", "Text", e.style.text) + _e(t, "border", "Border", e.style.border) + "</div></div>";
  }
  function Se() {
    let e = '<div class="loc-set-section"><div class="loc-set-title">Layout</div>' + Be("spacingX", "Spacing X", i.spacingX, 0, 200) + Be("spacingY", "Spacing Y", i.spacingY, 0, 260) + Be("gridSize", "Grid size", i.gridSize, 6, 80) + "</div>";
    e += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div><div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>', R.forEach((t, n) => {
      e += un(t, n);
    }), e += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>', ae.innerHTML = e;
  }
  function fn(e, t) {
    const n = ae.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
    return n && n.checked;
  }
  function pn(e, t) {
    const n = ae.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
    return n ? n.value : "";
  }
  function S() {
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
          manualOffsets: f,
          edgeWaypoints: y,
          edgeAnchors: I,
          nodeOverrides: L,
          themeRules: R,
          collapsed: g.filter((e) => e.collapsed).map((e) => e.id)
        }));
      } catch {
      }
  }
  function gn() {
    if (!r.persist) return;
    let e;
    try {
      e = JSON.parse(localStorage.getItem(r.storageKey) || "null");
    } catch {
      e = null;
    }
    if (e && (e.orientation && (i.orientation = pe(e.orientation)), e.subtreeMode && (i.subtreeMode = e.subtreeMode), ["spacingX", "spacingY", "zoom", "panX", "panY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (i[t] = e[t]);
    }), i.showGrid = !!e.showGrid, i.snapGrid = !!e.snapGrid, i.alignGrid = !!e.alignGrid, i.editMode = !!e.editMode, e.manualOffsets && (f = e.manualOffsets), e.edgeWaypoints && (y = e.edgeWaypoints), e.edgeAnchors && (I = e.edgeAnchors), e.nodeOverrides && (L = e.nodeOverrides, mt()), Array.isArray(e.themeRules) && (R = e.themeRules.map(ue)), Array.isArray(e.collapsed))) {
      const t = new Set(e.collapsed);
      for (const n of g) n.collapsed = t.has(n.id);
    }
  }
  function vt(e) {
    const t = Ln(i, g, f, y);
    return t.editMode = i.editMode, t.edgeAnchors = I, t.nodeOverrides = L, t.settings = Y(), e !== !1 && Pe(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
  }
  const St = document.createElement("canvas").getContext("2d");
  function hn(e, t) {
    return St.font = t, St.measureText(e).width;
  }
  function bn(e) {
    const t = c[e.id];
    if (!t) return 1;
    const n = parseFloat(t.style.getPropertyValue("--loc-fit"));
    return isFinite(n) && n > 0 ? n : 1;
  }
  function de(e) {
    const t = [];
    for (const n in b) t.push(b[n].getAttribute("d"));
    return Nn(E, t, { manualOffsets: f, raster: !!e, measureText: hn, fitOf: bn });
  }
  function wt() {
    return Pe(new Blob([de(!1)], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), de(!1);
  }
  function xt(e) {
    e = e || 3;
    const t = kt(E, f, 40), n = 16e3, o = 2e8;
    let l = Math.min(e, n / t.w, n / t.h);
    t.w * l * t.h * l > o && (l = Math.sqrt(o / (t.w * t.h))), l = Math.max(0.05, l);
    const s = URL.createObjectURL(new Blob([de(!0)], { type: "image/svg+xml;charset=utf-8" })), a = new Image();
    a.onload = () => {
      const d = document.createElement("canvas");
      d.width = Math.round(t.w * l), d.height = Math.round(t.h * l);
      const w = d.getContext("2d");
      w.setTransform(l, 0, 0, l, 0, 0), w.drawImage(a, 0, 0), URL.revokeObjectURL(s);
      try {
        d.toBlob((u) => {
          u && Pe(u, "org-chart.png");
        }, "image/png");
      } catch {
      }
    }, a.onerror = () => URL.revokeObjectURL(s), a.src = s;
  }
  function Mt() {
    const e = window.open("", "_blank");
    e && (e.document.open(), e.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + de(!1) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), e.document.close());
  }
  function Pe(e, t) {
    const n = URL.createObjectURL(e), o = document.createElement("a");
    o.href = n, o.download = t, document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(n);
  }
  function It(e, t, n) {
    const o = !(n && n.resetEdits);
    g = (e || []).map(Me), p = Ie(g), f = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), o || (L = /* @__PURE__ */ Object.create(null)), i.selectedNodeId = null, i.selectedEdgeId = null, k = /* @__PURE__ */ new Set(), V();
    for (const l in c)
      c[l].remove(), delete c[l];
    for (const l in b)
      b[l].remove(), delete b[l];
    for (const l in T)
      T[l].remove(), delete T[l];
    t && (t.subtreeMode && (i.subtreeMode = t.subtreeMode), t.orientation && (i.orientation = pe(t.orientation)), t.manualOffsets && (f = t.manualOffsets), t.edgeWaypoints && (y = t.edgeWaypoints), t.edgeAnchors && (I = t.edgeAnchors), t.nodeOverrides && (L = t.nodeOverrides), typeof t.editMode == "boolean" && (i.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (R = t.settings.themeRules.map(ue))), o && mt(), $e(), D(), M(), r.fitOnInit && U();
  }
  function mn(e) {
    const { nodes: t, meta: n } = Tn(e);
    return It(t, n), t.length;
  }
  function Lt(e) {
    const t = pe(e);
    i.orientation = t, f = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), q(), D(), M(), Ae(), h("orientation-change", { orientation: t });
  }
  function Et(e) {
    i.subtreeMode = e, f = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), q(), D(), M(), Ae(), h("subtree-mode-change", { subtreeMode: e });
  }
  function yn(e, t) {
    e != null && (i.spacingX = e), t != null && (i.spacingY = t), M(), h("settings-change", Y());
  }
  function we(e, t) {
    e in i ? (i[e] = t, e === "showGrid" && me(), e === "alignGrid" && (f = /* @__PURE__ */ Object.create(null), M()), D(), S(), ["showGrid", "snapGrid", "alignGrid", "gridSize"].includes(e) && h("settings-change", Y())) : r[e] = t;
  }
  function Ot(e) {
    return we("showGrid", !!e), i.showGrid;
  }
  function vn(e) {
    return we("snapGrid", !!e), i.snapGrid;
  }
  function Sn(e) {
    return we("alignGrid", !!e), i.alignGrid;
  }
  function wn(e) {
    return Ot(e ?? !i.showGrid);
  }
  function He() {
    f = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), I = /* @__PURE__ */ Object.create(null), q(), M(), Ae();
  }
  function At() {
    nt(), V(), He(), U();
  }
  function Nt() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function xe() {
    return Nt() === G;
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
  function Gt() {
    const e = document.exitFullscreen || document.webkitExitFullscreen;
    if (e && Nt())
      try {
        e.call(document);
      } catch {
      }
  }
  function Ue(e) {
    const t = e == null ? !xe() : !!e;
    return t ? Tt() : Gt(), t;
  }
  function Ct() {
    const e = xe();
    G.classList.toggle("loc-fullscreen", e), X && (X.title = e ? "Exit fullscreen" : "Fullscreen"), D(), U(), h("fullscreen-change", { fullscreen: e });
  }
  O(he, "pointerdown", (e) => {
    const t = e.target.closest(".loc-node");
    t && en(e, t.dataset.id);
  }), O(he, "click", (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !r.readonly) {
      et(t.closest(".loc-node").dataset.id);
      return;
    }
    const n = e.target.closest(".loc-node");
    n && h("node-click", { id: n.dataset.id, node: p[n.dataset.id] });
  }), O(le, "pointerdown", (e) => {
    const t = e.target.closest("path");
    t && (e.stopPropagation(), ct(t.dataset.edge));
  }), O(le, "dblclick", (e) => {
    if (r.readonly || !i.editMode) return;
    const t = e.target.closest("path");
    if (!t) return;
    const n = t.dataset.edge;
    ct(n);
    const o = at(n);
    if (!o) return;
    const l = Te(ye(e.clientX, e.clientY));
    (y[n] || (y[n] = [])).splice(sn(o, l), 0, l), H(n), F(), S();
  }), O(C, "pointerdown", (e) => {
    if (r.readonly || !i.editMode) return;
    const t = e.target, n = i.selectedEdgeId;
    if (!n) return;
    if (t.dataset.ep) {
      e.stopPropagation(), e.preventDefault(), A = { id: n, kind: "ep", which: t.dataset.ep }, B("pointermove", ft), B("pointerup", pt);
      return;
    }
    let o;
    if (t.dataset.wp != null) o = +t.dataset.wp;
    else if (t.dataset.add != null) {
      const l = +t.dataset.add;
      (y[n] || (y[n] = [])).splice(l, 0, Te(ye(e.clientX, e.clientY))), o = l, H(n);
    } else return;
    e.stopPropagation(), e.preventDefault(), A = { id: n, idx: o }, B("pointermove", zt), B("pointerup", Rt);
  }), O(C, "dblclick", (e) => {
    const t = e.target;
    if (t.dataset.ep === "parent") {
      Re(i.selectedEdgeId);
      return;
    }
    if (t.dataset.wp == null) return;
    const n = i.selectedEdgeId, o = y[n];
    o && (o.splice(+t.dataset.wp, 1), o.length || delete y[n], H(n), F(), S());
  });
  function zt(e) {
    if (!A) return;
    const t = y[A.id];
    t && (t[A.idx] = Te(ye(e.clientX, e.clientY)), H(A.id), F());
  }
  function Rt() {
    A = null, _("pointermove", zt), _("pointerup", Rt), S();
  }
  O($, "click", (e) => {
    if (e.target.closest('[data-role="panel-close"]')) {
      V();
      return;
    }
    if (e.target.closest('[data-role="add-child"]')) {
      ht(i.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="detach"]')) {
      Re(i.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="del-node"]')) {
      bt(i.selectedNodeId);
      return;
    }
  }), O(Ee, "input", (e) => {
    if (!i.editMode) return;
    const t = e.target.closest("[data-field]");
    if (!t) return;
    const n = i.selectedNodeId;
    if (!n) return;
    const o = t.dataset.field;
    let l = t.value;
    if (o === "type") {
      ee(n, { type: l }), ke();
      return;
    }
    if (o === "width" || o === "height") {
      ee(n, { [o]: Math.max(20, parseFloat(l) || 0) });
      return;
    }
    if (o === "photo_url") {
      const s = p[n];
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
      Fe(!1);
      return;
    }
    if (e.target.closest('[data-role="add-rule"]')) {
      R.push(ue({ field: "type", value: "", style: {} })), Se(), De(), S(), h("settings-change", Y());
      return;
    }
    const t = e.target.closest('[data-rk="remove"]');
    t && (R.splice(+t.dataset.rule, 1), Se(), De(), S(), h("settings-change", Y()));
  }), O(ae, "input", (e) => {
    const t = e.target;
    if (t.dataset.set != null) {
      const n = parseFloat(t.value);
      i[t.dataset.set] = n;
      const o = ae.querySelector(`[data-rangelabel="${t.dataset.set}"]`);
      o && (o.textContent = n), M(), h("settings-change", Y()), S();
      return;
    }
    if (t.dataset.rule != null) {
      const n = +t.dataset.rule, o = t.dataset.rk, l = R[n];
      if (!l) return;
      if (o === "enabled") l.enabled = t.checked;
      else if (o === "field") l.field = t.value;
      else if (o === "value") l.value = t.value;
      else if (o === "bg" || o === "text" || o === "border")
        fn(n, o) && (l.style[o] = t.value);
      else if (/-on$/.test(o)) {
        const s = o.replace("-on", "");
        l.style[s] = t.checked ? pn(n, s) || "#e0524d" : "";
      }
      De(), h("settings-change", Y()), S();
    }
  }), O(x, "pointerdown", (e) => {
    if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn"))
      return;
    const t = () => {
      i.selectedNodeId && (c[i.selectedNodeId] && c[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = null), i.selectedEdgeId && q(), V();
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
    }, w = () => {
      x.classList.remove("loc-panning"), _("pointermove", d), _("pointerup", w), a || t();
    };
    B("pointermove", d), B("pointerup", w);
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
  function xn() {
    const e = r.toolbar && typeof r.toolbar == "object" ? r.toolbar : {}, t = (a) => e[a] !== !1, n = N("div", "loc-toolbar");
    let o = "";
    return t("subtree") && (o += l("Subtree", ["Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Matrix"].map((a) => s("mode", a, a)).join(""))), t("orient") && (o += l("Orient", [["TopToBottom", "Top"], ["BottomToTop", "Bottom"], ["LeftToRight", "Left"], ["RightToLeft", "Right"]].map(([a, d]) => s("orient", a, d)).join(""))), t("actions") && (o += l("", '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button><button data-act="reset">Reset</button><button data-act="fullscreen" title="Toggle fullscreen">Fullscreen</button>')), t("search") && (o += l("Search", '<input type="search" data-role="search" class="loc-search-input" placeholder="Search…" />')), t("grid") && (o += l("Grid", '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>')), t("mode") && (o += l("Mode", '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="settings" title="Settings &amp; theming">Settings</button>')), t("export") && (o += l("Export", '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>')), n.innerHTML = o, n.addEventListener("click", (a) => {
      const d = a.target.closest("button");
      if (d)
        if (d.dataset.mode) Et(d.dataset.mode);
        else if (d.dataset.orient) Lt(d.dataset.orient);
        else if (d.dataset.flag)
          i[d.dataset.flag] = !i[d.dataset.flag], d.dataset.flag === "showGrid" ? me() : d.dataset.flag === "alignGrid" && (f = /* @__PURE__ */ Object.create(null), M()), D(), S();
        else switch (d.dataset.act) {
          case "expand":
            Ze();
            break;
          case "collapse":
            Qe();
            break;
          case "fit":
            U();
            break;
          case "relayout":
            He();
            break;
          case "reset":
            At();
            break;
          case "fullscreen":
            Ue();
            break;
          case "edit":
            gt(!i.editMode);
            break;
          case "settings":
            Fe();
            break;
          case "png":
            xt(3);
            break;
          case "svg":
            wt();
            break;
          case "pdf":
            Mt();
            break;
          case "json":
            vt(!0);
            break;
        }
    }), n.addEventListener("input", (a) => {
      const d = a.target.closest('[data-role="search"]');
      d && tt(d.value);
    }), n;
    function l(a, d) {
      return `<div class="loc-group">${a ? `<span class="loc-label">${a}</span>` : ""}${d}</div>`;
    }
    function s(a, d, w) {
      return `<button data-${a}="${d}">${w}</button>`;
    }
  }
  function D() {
    j && (j.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === i.subtreeMode)), j.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === i.orientation)), j.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!i[e.dataset.flag])), j.querySelectorAll('button[data-act="edit"]').forEach((e) => e.classList.toggle("loc-active", i.editMode)), j.querySelectorAll('button[data-act="fullscreen"]').forEach((e) => e.classList.toggle("loc-active", xe())));
  }
  O(document, "fullscreenchange", Ct), O(document, "webkitfullscreenchange", Ct), gn(), D(), me(), $e(), M(), r.fitOnInit && U();
  let $t = !1;
  function Mn() {
    if (!$t) {
      $t = !0, ge.forEach(({ target: e, type: t, fn: n, optsL: o }) => e.removeEventListener(t, n, o)), ge.length = 0, oe && cancelAnimationFrame(oe), G.remove();
      for (const e in c) delete c[e];
      for (const e in b) delete b[e];
      for (const e in T) delete T[e];
    }
  }
  const qe = {
    root: G,
    setNodes: It,
    loadJSON: mn,
    setOrientation: Lt,
    setSubtreeMode: Et,
    setSpacing: yn,
    setOption: we,
    setShowGrid: Ot,
    setSnapToGrid: vn,
    setAlignToGrid: Sn,
    toggleGrid: wn,
    fitToScreen: U,
    relayout: He,
    resetView: At,
    expandAll: Ze,
    collapseAll: Qe,
    toggleCollapse: et,
    centerOnNode: Oe,
    search: tt,
    clearSearch: nt,
    exportJSON: vt,
    exportSVG: wt,
    exportPNG: xt,
    exportPDF: Mt,
    buildSVG: de,
    setEditMode: gt,
    isEditMode: () => i.editMode,
    enterFullscreen: Tt,
    exitFullscreen: Gt,
    toggleFullscreen: Ue,
    isFullscreen: xe,
    updateNode: ee,
    addChild: ht,
    deleteNode: bt,
    reparentNode: ze,
    detachNode: Re,
    openInspector: je,
    closeInspector: V,
    nodeScreenRect: st,
    getSettings: Y,
    setSettings: dn,
    toggleSettings: Fe,
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (e) => c[e] || null,
    getNodeSlotEl: (e) => c[e] ? c[e].querySelector(".loc-node-slot") : null,
    getInspectorBody: () => Ee,
    nodeThemeStyle: (e) => p[e] ? Yt(p[e], R) : null,
    getState: () => ({ ...i }),
    getNodes: () => g.map((e) => ({ ...e })),
    getPositioned: () => E,
    on: _t,
    off: Pt,
    destroy: Mn
  };
  return qe;
}
export {
  _n as CANVAS_PAD,
  Pn as DEFAULTS,
  Hn as DEFAULT_SETTINGS,
  Un as DEPT_SIZE,
  qn as ORIENTATIONS,
  Vn as POS_SIZE,
  Wn as SNAKE_STUB,
  Jn as SUBTREE_MODES,
  Kn as VIRTUAL_ROOT_ID,
  Zn as applyOrientation,
  Nn as buildChartSVG,
  Qn as buildTree,
  kt as calculateBounds,
  Xt as childCount,
  On as computeDepths,
  eo as convertMoTree,
  to as convertNestedTree,
  Dn as createOrgChart,
  zn as edgeControlPoints,
  no as edgeEndpoints,
  ne as effCenter,
  Ln as exportLayout,
  En as fitBounds,
  oo as getVisibleTree,
  Ie as indexNodes,
  Rn as isHorizontal,
  io as isMoArray,
  Gn as layoutOrgChart,
  lo as lh,
  so as lw,
  Me as makeNode,
  Cn as normalizeConfig,
  Tn as normalizeImported,
  ue as normalizeRule,
  ao as normalizeSettings,
  $n as orthoThrough,
  ro as personNameFromPos,
  Yt as resolveNodeStyle,
  Dt as routeConnector,
  An as searchNodes,
  co as visibleDepths,
  uo as waypointPath
};
