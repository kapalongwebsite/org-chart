import { makeNode as Oe, indexNodes as Ge, normalizeRule as me, exportLayout as Rn, calculateBounds as Wt, fitBounds as jn, computeDepths as $n, childCount as Vt, searchNodes as Xn, resolveNodeStyle as Jt, buildChartSVG as kn, effCenter as Y, normalizeImported as Yn, layoutOrgChart as Dn, routeConnector as Kt, normalizeConfig as Fn, edgeControlPoints as Bn, isHorizontal as _n, orthoThrough as Pn } from "./core.js";
import { CANVAS_PAD as Zn, DEFAULTS as Qn, DEFAULT_SETTINGS as eo, DEPT_SIZE as to, ORIENTATIONS as no, POS_SIZE as oo, SNAKE_STUB as io, SUBTREE_MODES as so, VIRTUAL_ROOT_ID as lo, applyOrientation as ao, buildTree as ro, convertMoTree as co, convertNestedTree as uo, edgeEndpoints as po, getVisibleTree as fo, isMoArray as go, lh as ho, lw as bo, normalizeSettings as mo, personNameFromPos as yo, visibleDepths as vo, waypointPath as So } from "./core.js";
const ce = "http://www.w3.org/2000/svg", Hn = 0.5, qn = { Top: "TopToBottom", Bottom: "BottomToTop", Left: "LeftToRight", Right: "RightToLeft" };
function ye(ne) {
  return qn[ne] || ne;
}
const Un = {
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
function Vn(ne, Zt = {}) {
  if (!ne || !ne.appendChild) throw new Error("createOrgChart: first argument must be a DOM element.");
  const r = Object.assign({}, Un, Zt), i = {
    orientation: ye(r.orientation),
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
  let b = (r.nodes || []).map(Oe), g = Ge(b), p = /* @__PURE__ */ Object.create(null), S = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), E = /* @__PURE__ */ Object.create(null), C = (r.settings && r.settings.themeRules || r.themeRules || []).map(me);
  const K = {
    spacingX: r.spacingX,
    spacingY: r.spacingY,
    gridSize: r.gridSize,
    showGrid: !!r.showGrid,
    snapGrid: !!r.snapGrid,
    alignGrid: !!r.alignGrid,
    themeRules: C.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
  };
  let Qt = 0, I = [], y = /* @__PURE__ */ Object.create(null);
  const u = /* @__PURE__ */ Object.create(null), v = /* @__PURE__ */ Object.create(null), z = /* @__PURE__ */ Object.create(null);
  let O = null, m = null, de = 0, D = /* @__PURE__ */ new Set();
  const ve = [], oe = /* @__PURE__ */ Object.create(null);
  function en(e, t) {
    return (oe[e] || (oe[e] = [])).push(t), Ke;
  }
  function tn(e, t) {
    return oe[e] && (oe[e] = oe[e].filter((n) => n !== t)), Ke;
  }
  function h(e, t) {
    (oe[e] || []).forEach((n) => {
      try {
        n(t);
      } catch {
      }
    });
  }
  function G(e, t, n, o) {
    e.addEventListener(t, n, o), ve.push({ target: e, type: t, fn: n, optsL: o });
  }
  const R = document.createElement("div");
  R.className = "loc-root";
  const X = r.toolbar ? Cn() : null;
  X && R.appendChild(X);
  const w = N("div", "loc-canvas"), ie = N("div", "loc-content"), H = N("div", "loc-grid"), se = document.createElementNS(ce, "svg");
  se.setAttribute("class", "loc-connectors");
  const ue = document.createElementNS(ce, "g");
  ue.setAttribute("class", "loc-edgehits"), se.appendChild(ue);
  const Se = N("div", "loc-nodes"), q = document.createElementNS(ce, "svg");
  q.setAttribute("class", "loc-overlay");
  const j = document.createElementNS(ce, "g");
  j.setAttribute("class", "loc-edgehandles");
  const pe = document.createElementNS(ce, "g");
  pe.setAttribute("class", "loc-aligns"), q.appendChild(pe), q.appendChild(j);
  const Te = N("div", "loc-zoomreadout");
  Te.textContent = "100%", ie.appendChild(H), ie.appendChild(se), ie.appendChild(Se), ie.appendChild(q), w.appendChild(ie), w.appendChild(Te);
  let F = null;
  r.fullscreenControl && (F = N("button", "loc-fsbtn"), F.type = "button", F.title = "Fullscreen", F.setAttribute("aria-label", "Toggle fullscreen"), F.innerHTML = "⛶", G(F, "click", (e) => {
    e.stopPropagation(), Je();
  }), w.appendChild(F)), R.appendChild(w);
  const $ = N("div", "loc-panel");
  $.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Node</span><button class="loc-panel-close" title="Close" data-role="panel-close">✕</button></div><div class="loc-panel-body" data-role="panel-body"></div><div class="loc-panel-foot" data-role="panel-foot"></div>';
  const Ze = tt(r.inspectorTarget) || w;
  Ze.appendChild($), Ze !== w && $.classList.add("loc-panel-external");
  const Ne = $.querySelector('[data-role="panel-body"]'), Qe = $.querySelector('[data-role="panel-foot"]'), nn = $.querySelector(".loc-panel-title"), U = N("div", "loc-settings");
  U.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Settings</span><button class="loc-panel-close" title="Close" data-role="settings-close">✕</button></div><div class="loc-panel-body" data-role="settings-body"></div>';
  const et = tt(r.settingsTarget) || w;
  et.appendChild(U), et !== w && U.classList.add("loc-panel-external");
  const le = U.querySelector('[data-role="settings-body"]');
  ne.appendChild(R);
  function N(e, t) {
    const n = document.createElement(e);
    return t && (n.className = t), n;
  }
  function tt(e) {
    if (!e) return null;
    const t = typeof e == "string" ? document.querySelector(e) : e;
    return t && t.appendChild ? t : null;
  }
  function fe() {
    return Fn({
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
  function on() {
    const e = Dn(b, fe());
    I = e.positioned, y = e.posById;
  }
  function A() {
    on(), it(), rn(), nt(), he(), Re(), x(), h("layout-change", { positioned: I, mode: i.subtreeMode, orientation: i.orientation });
  }
  function nt() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of I) {
      const n = t.node;
      e[n.id] = !0;
      let o = u[n.id];
      o || (o = sn(n), u[n.id] = o, Se.appendChild(o)), o.style.width = n.width + "px", o.style.height = n.height + "px";
      const s = Y(t, p);
      o.style.transform = `translate(${s.x - n.width / 2}px, ${s.y - n.height / 2}px)`, r.nodeSlots || (o.dataset.fitted || (ln(o), o.dataset.fitted = "1"), Ot(o, n)), o.classList.toggle("loc-selected", i.selectedNodeId === n.id), an(o, n);
    }
    for (const t in u) e[t] || (u[t].remove(), delete u[t]);
    h("nodes-rendered", { ids: I.map((t) => t.node.id) });
  }
  function sn(e) {
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
  function ot(e) {
    return e.scrollWidth > e.clientWidth + 0.5 || e.scrollHeight > e.clientHeight + 0.5;
  }
  function ln(e) {
    if (e.style.setProperty("--loc-fit", "1"), !ot(e)) return;
    let t = Hn, n = 1;
    for (let o = 0; o < 7; o++) {
      const s = (t + n) / 2;
      e.style.setProperty("--loc-fit", String(s)), ot(e) ? n = s : t = s;
    }
    e.style.setProperty("--loc-fit", String(t));
  }
  function an(e, t) {
    const n = e.querySelector('[data-role="toggle"]');
    if (!n) return;
    const o = Vt(b, t.id) > 0;
    n.style.display = o ? "flex" : "none", n.textContent = t.collapsed ? "⊞" : "⊟";
  }
  function ge(e) {
    return document.createElementNS(ce, e);
  }
  function rn() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of I) {
      const n = t.node;
      if (!n.parentId) continue;
      const o = y[n.parentId];
      if (!o) continue;
      e[n.id] = !0;
      const s = Kt(o, t, fe(), p, S, L);
      let l = v[n.id];
      l || (l = ge("path"), v[n.id] = l, se.appendChild(l)), l.setAttribute("d", s), l.classList.toggle("loc-sel", i.selectedEdgeId === n.id);
      let a = z[n.id];
      a || (a = ge("path"), a.dataset.edge = n.id, z[n.id] = a, ue.appendChild(a)), a.setAttribute("d", s);
    }
    for (const t in v) e[t] || (v[t].remove(), delete v[t]);
    for (const t in z) e[t] || (z[t].remove(), delete z[t]);
    i.selectedEdgeId && !e[i.selectedEdgeId] ? ee() : W();
  }
  function Z(e) {
    const t = y[e];
    if (!t) return;
    const n = y[t.node.parentId];
    if (!n) return;
    const o = Kt(n, t, fe(), p, S, L);
    v[e] && v[e].setAttribute("d", o), z[e] && z[e].setAttribute("d", o);
  }
  function he() {
    ie.style.transform = `translate(${i.panX}px, ${i.panY}px) scale(${i.zoom})`, Te.textContent = Math.round(i.zoom * 100) + "%", i.selectedEdgeId && !O && W(), x();
  }
  function it() {
    let e = 0, t = 0, n = 0, o = 0;
    for (const l of I) {
      const a = Y(l, p), c = l.node.width / 2, f = l.node.height / 2;
      e = Math.min(e, a.x - c - 80), t = Math.min(t, a.y - f - 80), n = Math.max(n, a.x + c + 80), o = Math.max(o, a.y + f + 80);
    }
    se.setAttribute("width", n), se.setAttribute("height", o), q.setAttribute("width", n), q.setAttribute("height", o);
    const s = i.gridSize;
    H.style.left = e + "px", H.style.top = t + "px", H.style.width = n - e + "px", H.style.height = o - t + "px", H.style.backgroundSize = s + "px " + s + "px", H.style.backgroundPosition = (-e % s + s) % s + "px " + (-t % s + s) % s + "px";
  }
  function we() {
    H.classList.toggle("loc-on", i.showGrid), w.classList.toggle("loc-gridon", i.showGrid);
  }
  function Q() {
    if (!I.length) return;
    const e = Wt(I, p, 0), t = jn(e, w.clientWidth, w.clientHeight);
    i.zoom = t.zoom, i.panX = t.panX, i.panY = t.panY, he();
  }
  function Ce(e) {
    const t = y[e];
    if (!t) return;
    const n = Y(t, p);
    i.panX = w.clientWidth / 2 - n.x * i.zoom, i.panY = w.clientHeight / 2 - n.y * i.zoom, he();
  }
  function cn() {
    const e = r.fitOnLayoutChange;
    return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
  }
  function ze() {
    const e = cn();
    if (e === "fit") {
      Q();
      return;
    }
    if (e === "recenter") {
      const t = b.find((o) => !o.parentId), n = i.selectedNodeId && y[i.selectedNodeId] ? i.selectedNodeId : t && t.id;
      n && Ce(n);
    }
  }
  function st() {
    for (const e of b) e.collapsed = !1;
    A();
  }
  function lt() {
    const e = $n(b, g);
    for (const t of b) t.collapsed = e[t.id] >= 1 && Vt(b, t.id) > 0;
    A();
  }
  function at(e) {
    const t = g[e];
    t && (t.collapsed = !t.collapsed, A());
  }
  function rt(e) {
    if (D = Xn(b, e), Re(), D.size) {
      const t = I.find((n) => D.has(n.node.id));
      t && Ce(t.node.id);
    }
    return D.size;
  }
  function ct() {
    D = /* @__PURE__ */ new Set(), Re();
  }
  function Re() {
    const e = D.size > 0;
    for (const t of I) {
      const n = u[t.node.id];
      if (!n) continue;
      const o = D.has(t.node.id);
      n.classList.toggle("loc-highlight", e && o), n.classList.toggle("loc-dim", e && !o);
    }
    for (const t in v) v[t].classList.toggle("loc-hl", e && D.has(t));
  }
  function dn(e, t) {
    if (e.target.closest('[data-role="toggle"]') || (e.stopPropagation(), ee(), ht(t), h("node-select", { id: t, node: g[t], rect: bt(t) }), r.inspector && Fe(t), r.readonly || !r.enableDragging || !i.editMode)) return;
    const n = p[t] || { dx: 0, dy: 0 };
    m = { id: t, startX: e.clientX, startY: e.clientY, baseDx: n.dx, baseDy: n.dy, moved: !1 }, u[t].classList.add("loc-dragging"), h("node-drag-start", { id: t, node: g[t] }), V("pointermove", dt), V("pointerup", ut);
  }
  function dt(e) {
    if (!m) return;
    let t = m.baseDx + (e.clientX - m.startX) / i.zoom, n = m.baseDy + (e.clientY - m.startY) / i.zoom;
    if (Math.abs(e.clientX - m.startX) + Math.abs(e.clientY - m.startY) > 3 && (m.moved = !0), i.snapGrid) {
      const s = i.gridSize, l = y[m.id];
      l && (t = Math.round((l.cx + t) / s) * s - l.cx, n = Math.round((l.cy + n) / s) * s - l.cy);
    }
    const o = y[m.id];
    if (o) {
      const s = un(m.id, o.cx + t, o.cy + n);
      t = s.cx - o.cx, n = s.cy - o.cy, ft(s.gx, s.gy);
    }
    p[m.id] = { dx: t, dy: n }, de || (de = requestAnimationFrame(() => {
      de = 0, fn(m.id), gn(m.id), h("node-drag", { id: m.id, node: g[m.id], offset: p[m.id] });
    }));
  }
  function ut() {
    if (m) {
      const e = u[m.id];
      e && e.classList.remove("loc-dragging"), h("node-drag-end", { id: m.id, node: g[m.id], offset: p[m.id] }), it();
    }
    m = null, gt(), J("pointermove", dt), J("pointerup", ut), x();
  }
  const pt = 8;
  function un(e, t, n) {
    if (!r.snapAlign) return { cx: t, cy: n, gx: null, gy: null };
    const o = g[e];
    if (!o) return { cx: t, cy: n, gx: null, gy: null };
    const s = pt / i.zoom, l = [], a = [], c = o.parentId && y[o.parentId];
    c && l.push(Y(c, p).x);
    for (const T of I) {
      if (T.node.id === e || !o.parentId || T.node.parentId !== o.parentId) continue;
      const k = Y(T, p);
      l.push(k.x), a.push(k.y);
    }
    let f = null, d = s;
    for (const T of l) {
      const k = Math.abs(t - T);
      k < d && (d = k, t = T, f = T);
    }
    let M = null, P = s;
    for (const T of a) {
      const k = Math.abs(n - T);
      k < P && (P = k, n = T, M = T);
    }
    return { cx: t, cy: n, gx: f, gy: M };
  }
  function pn(e, t) {
    if (!r.snapAlign) return t;
    const n = y[e];
    if (!n) return t;
    const o = y[n.node.parentId], s = pt / i.zoom, l = [Y(n, p).x];
    o && l.push(Y(o, p).x);
    let a = null, c = s, f = t.x;
    for (const d of l) {
      const M = Math.abs(t.x - d);
      M < c && (c = M, f = d, a = d);
    }
    return ft(a, null), { x: f, y: t.y };
  }
  function ft(e, t) {
    pe.innerHTML = "";
    const n = +q.getAttribute("width") || 0, o = +q.getAttribute("height") || 0, s = (l, a, c, f) => {
      const d = ge("line");
      d.setAttribute("x1", l), d.setAttribute("y1", a), d.setAttribute("x2", c), d.setAttribute("y2", f), d.setAttribute("class", "loc-align-line"), pe.appendChild(d);
    };
    e != null && s(e, 0, e, o), t != null && s(0, t, n, t);
  }
  function gt() {
    pe.innerHTML = "";
  }
  function fn(e) {
    const t = y[e], n = u[e];
    if (!t || !n) return;
    const o = Y(t, p);
    n.style.transform = `translate(${o.x - t.node.width / 2}px, ${o.y - t.node.height / 2}px)`;
  }
  function gn(e) {
    const t = y[e];
    if (t) {
      y[t.node.parentId] && Z(e);
      for (const n of I) n.node.parentId === e && Z(n.node.id);
      i.selectedEdgeId && W();
    }
  }
  function ht(e) {
    i.selectedNodeId && u[i.selectedNodeId] && u[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = e, u[e] && u[e].classList.add("loc-selected");
  }
  function bt(e) {
    const t = u[e];
    if (!t) return null;
    const n = t.getBoundingClientRect();
    return { left: n.left, top: n.top, right: n.right, bottom: n.bottom, width: n.width, height: n.height };
  }
  function xe(e, t) {
    const n = w.getBoundingClientRect();
    return { x: (e - n.left - i.panX) / i.zoom, y: (t - n.top - i.panY) / i.zoom };
  }
  function je(e) {
    if (i.snapGrid) {
      const t = i.gridSize;
      return { x: Math.round(e.x / t) * t, y: Math.round(e.y / t) * t };
    }
    return { x: e.x, y: e.y };
  }
  function mt(e) {
    const t = y[e];
    if (!t) return null;
    const n = y[t.node.parentId];
    if (!n) return null;
    const o = S[e] || [];
    return Bn(n, t, o, fe(), p, L[e]);
  }
  function yt(e) {
    const t = [], n = _n(fe());
    for (let o = 0; o < e.length - 1; o++) {
      const s = Pn([e[o], e[o + 1]], n);
      for (let l = 0; l < s.length - 1; l++) t.push({ a: s[l], b: s[l + 1], insert: o });
    }
    return t;
  }
  function vt(e) {
    i.selectedEdgeId && v[i.selectedEdgeId] && v[i.selectedEdgeId].classList.remove("loc-sel"), i.selectedNodeId && u[i.selectedNodeId] && u[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = null, i.selectedEdgeId = e, v[e] && v[e].classList.add("loc-sel"), W();
  }
  function ee() {
    i.selectedEdgeId && v[i.selectedEdgeId] && v[i.selectedEdgeId].classList.remove("loc-sel"), i.selectedEdgeId = null, j.innerHTML = "";
  }
  function $e(e, t, n, o) {
    const s = ge("circle");
    return s.setAttribute("cx", e), s.setAttribute("cy", t), s.setAttribute("r", n), s.setAttribute("class", o), s;
  }
  function St(e, t, n, o) {
    const s = ge("rect");
    return s.setAttribute("x", e - n), s.setAttribute("y", t - n), s.setAttribute("width", 2 * n), s.setAttribute("height", 2 * n), s.setAttribute("rx", 2 / i.zoom), s.setAttribute("class", o), s;
  }
  function W() {
    j.innerHTML = "";
    const e = i.selectedEdgeId;
    if (!e || r.readonly) return;
    const t = mt(e);
    if (!t) return;
    const n = S[e] || [], o = 6 / i.zoom, s = 5 / i.zoom;
    if (!i.editMode) {
      for (let d = 0; d < n.length; d++) {
        const M = $e(n[d].x, n[d].y, o, "loc-wp-handle loc-wp-readonly");
        M.dataset.wp = d, j.appendChild(M);
      }
      return;
    }
    for (const d of yt(t)) {
      const M = $e((d.a.x + d.b.x) / 2, (d.a.y + d.b.y) / 2, s, "loc-wp-add");
      M.dataset.add = d.insert, j.appendChild(M);
    }
    for (let d = 0; d < n.length; d++) {
      const M = $e(n[d].x, n[d].y, o, "loc-wp-handle");
      M.dataset.wp = d, j.appendChild(M);
    }
    const l = t[0], a = t[t.length - 1], c = St(l.x, l.y, 6 / i.zoom, "loc-ep loc-ep-parent");
    c.dataset.ep = "parent", j.appendChild(c);
    const f = St(a.x, a.y, 6 / i.zoom, "loc-ep loc-ep-child");
    f.dataset.ep = "child", j.appendChild(f);
  }
  function wt(e, t) {
    const n = Y(e, p), o = e.node.width, s = e.node.height;
    let l = (t.x - n.x) / (o / 2), a = (t.y - n.y) / (s / 2);
    const c = Math.max(Math.abs(l), Math.abs(a));
    return c > 1e-6 && (l /= c, a /= c), { nx: Math.max(-1, Math.min(1, l)), ny: Math.max(-1, Math.min(1, a)) };
  }
  function hn(e, t) {
    const n = new Set([t].concat(_e(t)));
    for (let o = I.length - 1; o >= 0; o--) {
      const s = I[o];
      if (n.has(s.node.id)) continue;
      const l = Y(s, p);
      if (e.x >= l.x - s.node.width / 2 && e.x <= l.x + s.node.width / 2 && e.y >= l.y - s.node.height / 2 && e.y <= l.y + s.node.height / 2) return s.node.id;
    }
    return null;
  }
  let ae = null;
  function Xe(e) {
    ae && u[ae] && u[ae].classList.remove("loc-reparent-target"), ae = e, e && u[e] && u[e].classList.add("loc-reparent-target");
  }
  function xt(e) {
    if (!O || O.kind !== "ep") return;
    const t = O.id, n = y[t];
    if (!n) return;
    const o = y[n.node.parentId];
    if (!o) return;
    const s = xe(e.clientX, e.clientY);
    if (L[t] = L[t] || {}, O.which === "child")
      L[t].c = wt(n, s);
    else {
      L[t].p = wt(o, s);
      const l = hn(s, t);
      Xe(l && l !== n.node.parentId ? l : null);
    }
    Z(t), W();
  }
  function Mt() {
    const e = O;
    if (O = null, J("pointermove", xt), J("pointerup", Mt), e && e.which === "parent" && ae) {
      const t = ae;
      Xe(null), ke(e.id, t);
      return;
    }
    Xe(null), x();
  }
  function ke(e, t) {
    const n = g[e];
    !n || t === e || t && _e(e).indexOf(t) >= 0 || (n.parentId = t || "", E[e] = Object.assign(E[e] || {}, { parentId: n.parentId }), delete S[e], delete L[e], i.selectedEdgeId = null, j.innerHTML = "", y[e] && Object.assign(y[e].node, { parentId: n.parentId }), A(), h("node-change", { id: e, node: { ...n }, patch: { parentId: n.parentId }, reparented: !0 }), x());
  }
  function Ye(e) {
    ke(e, "");
  }
  function bn(e, t, n) {
    const o = n.x - t.x, s = n.y - t.y, l = o * o + s * s;
    let a = l ? ((e.x - t.x) * o + (e.y - t.y) * s) / l : 0;
    return a = Math.max(0, Math.min(1, a)), Math.hypot(e.x - (t.x + a * o), e.y - (t.y + a * s));
  }
  function mn(e, t) {
    const n = yt(e);
    let o = 0, s = 1 / 0;
    for (const l of n) {
      const a = bn(t, l.a, l.b);
      a < s && (s = a, o = l.insert);
    }
    return o;
  }
  const yn = ["", "Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "RowWrap"];
  function Me(e) {
    return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function De() {
    R.classList.toggle("loc-edit", i.editMode);
  }
  function It(e) {
    i.editMode = !!e, De(), _(), i.editMode || ee(), $.classList.contains("loc-open") && Be(), h("edit-mode-change", { editMode: i.editMode }), x();
  }
  function Fe(e) {
    r.inspector && (i.selectedNodeId = e, $.classList.add("loc-open"), Be(), h("inspector-open", { id: e, node: g[e] }));
  }
  function te() {
    $.classList.contains("loc-open") && ($.classList.remove("loc-open"), h("inspector-close", {}));
  }
  function Be() {
    const e = i.selectedNodeId, t = e && g[e];
    if (!t) {
      te();
      return;
    }
    if (nn.textContent = t.label || t.personName || t.id, r.inspectorSlot) {
      Qe.innerHTML = "";
      return;
    }
    const n = i.editMode, o = n ? "" : " disabled", s = (f, d, M) => `<input data-field="${f}" type="${M || "text"}" value="${Me(d)}"${o}/>`, l = (f, d, M) => `<select data-field="${f}"${o}>` + M.map((P) => {
      const T = Array.isArray(P) ? P[0] : P, k = Array.isArray(P) ? P[1] : P || "—";
      return `<option value="${Me(T)}"${String(T) === String(d ?? "") ? " selected" : ""}>${k}</option>`;
    }).join("") + "</select>", a = (f, d) => `<label class="loc-field"><span>${f}</span>${d}</label>`;
    let c = a("ID", `<input value="${Me(t.id)}" disabled/>`) + a("Type", l("type", t.type, [["department", "department"], ["position", "position"]])) + a("Label", s("label", t.label));
    t.type !== "department" && (c += a("Person name", s("personName", t.personName)) + a("Status", l("status", t.status, [["", "—"], ["FILLED", "FILLED"], ["VACANT", "VACANT"], ["UNFUNDED", "UNFUNDED"]])) + a("Photo URL", s("photo_url", t.data && t.data.photo_url || ""))), c += a("Layout override", l("layoutMode", t.layoutMode || "", yn.map((f) => [f, f || "(inherit)"]))) + a("Width", s("width", t.width, "number")) + a("Height", s("height", t.height, "number")), Ne.innerHTML = c, Qe.innerHTML = n ? '<button data-role="add-child">+ Add child</button>' + (t.parentId ? '<button data-role="detach">Detach</button>' : "") + '<button data-role="del-node" class="loc-danger">Delete</button>' : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  function vn() {
    let e;
    do
      e = "node-" + ++Qt;
    while (g[e]);
    return e;
  }
  function re(e, t) {
    const n = g[e];
    if (!n) return;
    Object.assign(n, t), y[e] && y[e].node !== n && Object.assign(y[e].node, t), E[e] = Object.assign(E[e] || {}, t);
    const o = ["type", "width", "height", "layoutMode"].some((s) => s in t);
    u[e] && (u[e].remove(), delete u[e]), o ? A() : nt(), h("node-change", { id: e, node: { ...n }, patch: t }), x();
  }
  function _e(e) {
    const t = [], n = [e];
    for (; n.length; ) {
      const o = n.pop();
      for (const s of b) s.parentId === o && (t.push(s.id), n.push(s.id));
    }
    return t;
  }
  function At(e) {
    if (!i.editMode) return;
    const t = vn(), n = Oe({ id: t, parentId: e || "", type: "position", label: "NEW POSITION", personName: "", status: "" });
    b.push(n), g[t] = n, E[t] = Object.assign({ __new: !0 }, n), A(), ht(t), Fe(t), h("node-change", { id: t, node: { ...n }, added: !0 }), x();
  }
  function Lt(e) {
    if (!i.editMode || !e) return;
    const t = [e].concat(_e(e)), n = new Set(t);
    b = b.filter((o) => !n.has(o.id)), g = Ge(b), t.forEach((o) => {
      E[o] = { __deleted: !0 }, u[o] && (u[o].remove(), delete u[o]);
    }), n.has(i.selectedNodeId) && (i.selectedNodeId = null, te()), A(), h("node-change", { id: e, removed: !0, ids: t }), x();
  }
  function Et() {
    const e = new Set(Object.keys(E).filter((t) => E[t] && E[t].__deleted));
    e.size && (b = b.filter((t) => !e.has(t.id))), g = Ge(b);
    for (const t in E) {
      const n = E[t];
      if (!(!n || n.__deleted))
        if (n.__new) {
          if (!g[t]) {
            const o = Object.assign({}, n);
            delete o.__new;
            const s = Oe(o);
            b.push(s), g[t] = s;
          }
        } else g[t] && Object.assign(g[t], n);
    }
  }
  const Sn = [
    ["type", "Type"],
    ["status", "Status"],
    ["level", "Level (data.level)"],
    ["unit", "Unit (data.unit)"],
    ["id", "Node id"],
    ["label", "Label"]
  ];
  function Ot(e, t) {
    const n = Jt(t, C);
    Pe(e, "--loc-node-bg", n && n.bg), Pe(e, "--loc-node-text", n && n.text), Pe(e, "--loc-node-border", n && n.border);
  }
  function Pe(e, t, n) {
    n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
  }
  function Ie() {
    for (const e in u) g[e] && Ot(u[e], g[e]);
  }
  function B() {
    return {
      spacingX: i.spacingX,
      spacingY: i.spacingY,
      gridSize: i.gridSize,
      orientation: i.orientation,
      subtreeMode: i.subtreeMode,
      showGrid: i.showGrid,
      snapGrid: i.snapGrid,
      alignGrid: i.alignGrid,
      themeRules: C.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    };
  }
  function Gt(e, t) {
    e = e || {}, typeof e.spacingX == "number" && (i.spacingX = e.spacingX), typeof e.spacingY == "number" && (i.spacingY = e.spacingY), typeof e.gridSize == "number" && (i.gridSize = e.gridSize), e.orientation && (i.orientation = ye(e.orientation)), e.subtreeMode && (i.subtreeMode = e.subtreeMode), "showGrid" in e && (i.showGrid = !!e.showGrid), "snapGrid" in e && (i.snapGrid = !!e.snapGrid), "alignGrid" in e && (i.alignGrid = !!e.alignGrid), Array.isArray(e.themeRules) && (C = e.themeRules.map(me)), we(), _(), A(), U.classList.contains("loc-open") && Ae(), t && t.silent || h("settings-change", B()), x();
  }
  function He(e) {
    const t = U.classList.contains("loc-open"), n = e == null ? !t : !!e;
    U.classList.toggle("loc-open", n), X && X.querySelectorAll('button[data-act="settings"]').forEach((o) => o.classList.toggle("loc-active", n)), n && Ae(), n !== t && h(n ? "settings-open" : "settings-close", {});
  }
  function Tt() {
    Gt({
      spacingX: K.spacingX,
      spacingY: K.spacingY,
      gridSize: K.gridSize,
      showGrid: K.showGrid,
      snapGrid: K.snapGrid,
      alignGrid: K.alignGrid,
      themeRules: K.themeRules.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    }), Ie();
  }
  function qe(e, t, n, o, s) {
    return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${o}" max="${s}" value="${n}"/></label>`;
  }
  function Ue(e, t, n, o) {
    return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${o ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${o || "#e0524d"}"/></label>`;
  }
  function wn(e, t) {
    const n = (o, s) => `<option value="${o}"${e.field === o ? " selected" : ""}>${s}</option>`;
    return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + Sn.map(([o, s]) => n(o, s)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${Me(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Ue(t, "bg", "BG", e.style.bg) + Ue(t, "text", "Text", e.style.text) + Ue(t, "border", "Border", e.style.border) + "</div></div>";
  }
  function Ae() {
    if (r.settingsSlot) return;
    let e = '<div class="loc-set-section"><div class="loc-set-title">Layout</div>' + qe("spacingX", "Spacing X", i.spacingX, 0, 200) + qe("spacingY", "Spacing Y", i.spacingY, 0, 260) + qe("gridSize", "Grid size", i.gridSize, 6, 80) + "</div>";
    e += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div><div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>', C.forEach((t, n) => {
      e += wn(t, n);
    }), e += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>', e += '<div class="loc-set-foot"><button class="loc-set-reset" data-role="reset-settings" title="Restore spacing, grid &amp; theme rules to defaults">↺ Reset settings</button></div>', le.innerHTML = e;
  }
  function xn(e, t) {
    const n = le.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
    return n && n.checked;
  }
  function Mn(e, t) {
    const n = le.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
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
          edgeWaypoints: S,
          edgeAnchors: L,
          nodeOverrides: E,
          themeRules: C,
          collapsed: b.filter((e) => e.collapsed).map((e) => e.id)
        }));
      } catch {
      }
  }
  function In() {
    if (!r.persist) return;
    let e;
    try {
      e = JSON.parse(localStorage.getItem(r.storageKey) || "null");
    } catch {
      e = null;
    }
    if (e && (e.orientation && (i.orientation = ye(e.orientation)), e.subtreeMode && (i.subtreeMode = e.subtreeMode), ["spacingX", "spacingY", "zoom", "panX", "panY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (i[t] = e[t]);
    }), i.showGrid = !!e.showGrid, i.snapGrid = !!e.snapGrid, i.alignGrid = !!e.alignGrid, i.editMode = !!e.editMode, e.manualOffsets && (p = e.manualOffsets), e.edgeWaypoints && (S = e.edgeWaypoints), e.edgeAnchors && (L = e.edgeAnchors), e.nodeOverrides && (E = e.nodeOverrides, Et()), Array.isArray(e.themeRules) && (C = e.themeRules.map(me)), Array.isArray(e.collapsed))) {
      const t = new Set(e.collapsed);
      for (const n of b) n.collapsed = t.has(n.id);
    }
  }
  function Nt(e) {
    const t = Rn(i, b, p, S);
    return t.editMode = i.editMode, t.edgeAnchors = L, t.nodeOverrides = E, t.settings = B(), e !== !1 && We(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
  }
  const Ct = document.createElement("canvas").getContext("2d");
  function An(e, t) {
    return Ct.font = t, Ct.measureText(e).width;
  }
  function Ln(e) {
    const t = u[e.id];
    if (!t) return 1;
    const n = parseFloat(t.style.getPropertyValue("--loc-fit"));
    return isFinite(n) && n > 0 ? n : 1;
  }
  function be(e) {
    const t = [];
    for (const n in v) t.push(v[n].getAttribute("d"));
    return kn(I, t, { manualOffsets: p, raster: !!e, measureText: An, fitOf: Ln });
  }
  function zt() {
    return We(new Blob([be(!1)], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), be(!1);
  }
  function Rt(e) {
    e = e || 3;
    const t = Wt(I, p, 40), n = 16e3, o = 2e8;
    let s = Math.min(e, n / t.w, n / t.h);
    t.w * s * t.h * s > o && (s = Math.sqrt(o / (t.w * t.h))), s = Math.max(0.05, s);
    const l = URL.createObjectURL(new Blob([be(!0)], { type: "image/svg+xml;charset=utf-8" })), a = new Image();
    a.onload = () => {
      const c = document.createElement("canvas");
      c.width = Math.round(t.w * s), c.height = Math.round(t.h * s);
      const f = c.getContext("2d");
      f.setTransform(s, 0, 0, s, 0, 0), f.drawImage(a, 0, 0), URL.revokeObjectURL(l);
      try {
        c.toBlob((d) => {
          d && We(d, "org-chart.png");
        }, "image/png");
      } catch {
      }
    }, a.onerror = () => URL.revokeObjectURL(l), a.src = l;
  }
  function jt() {
    const e = window.open("", "_blank");
    e && (e.document.open(), e.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + be(!1) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), e.document.close());
  }
  function We(e, t) {
    const n = URL.createObjectURL(e), o = document.createElement("a");
    o.href = n, o.download = t, document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(n);
  }
  function $t(e, t, n) {
    const o = !(n && n.resetEdits);
    b = (e || []).map(Oe), g = Ge(b), o || (p = /* @__PURE__ */ Object.create(null), S = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), E = /* @__PURE__ */ Object.create(null)), i.selectedNodeId = null, i.selectedEdgeId = null, D = /* @__PURE__ */ new Set(), te();
    for (const s in u)
      u[s].remove(), delete u[s];
    for (const s in v)
      v[s].remove(), delete v[s];
    for (const s in z)
      z[s].remove(), delete z[s];
    t && (t.subtreeMode && (i.subtreeMode = t.subtreeMode), t.orientation && (i.orientation = ye(t.orientation)), t.manualOffsets && (p = t.manualOffsets), t.edgeWaypoints && (S = t.edgeWaypoints), t.edgeAnchors && (L = t.edgeAnchors), t.nodeOverrides && (E = t.nodeOverrides), typeof t.editMode == "boolean" && (i.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (C = t.settings.themeRules.map(me))), o && Et(), De(), _(), A(), r.fitOnInit && Q();
  }
  function En(e) {
    const { nodes: t, meta: n } = Yn(e);
    return $t(t, n), t.length;
  }
  function Xt(e) {
    const t = ye(e);
    i.orientation = t, p = /* @__PURE__ */ Object.create(null), S = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), ee(), _(), A(), ze(), h("orientation-change", { orientation: t });
  }
  function kt(e) {
    i.subtreeMode = e, p = /* @__PURE__ */ Object.create(null), S = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), ee(), _(), A(), ze(), h("subtree-mode-change", { subtreeMode: e });
  }
  function On(e, t) {
    e != null && (i.spacingX = e), t != null && (i.spacingY = t), A(), h("settings-change", B());
  }
  function Le(e, t) {
    e in i ? (i[e] = t, e === "showGrid" && we(), e === "alignGrid" && (p = /* @__PURE__ */ Object.create(null), A()), _(), x(), ["showGrid", "snapGrid", "alignGrid", "gridSize"].includes(e) && h("settings-change", B())) : r[e] = t;
  }
  function Yt(e) {
    return Le("showGrid", !!e), i.showGrid;
  }
  function Gn(e) {
    return Le("snapGrid", !!e), i.snapGrid;
  }
  function Tn(e) {
    return Le("alignGrid", !!e), i.alignGrid;
  }
  function Nn(e) {
    return Yt(e ?? !i.showGrid);
  }
  function Ve() {
    p = /* @__PURE__ */ Object.create(null), S = /* @__PURE__ */ Object.create(null), L = /* @__PURE__ */ Object.create(null), ee(), A(), ze();
  }
  function Dt() {
    ct(), te(), Ve(), Q();
  }
  function Ft() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function Ee() {
    return Ft() === R;
  }
  function Bt() {
    const e = R.requestFullscreen || R.webkitRequestFullscreen;
    if (e)
      try {
        const t = e.call(R);
        t && t.catch && t.catch(() => {
        });
      } catch {
      }
  }
  function _t() {
    const e = document.exitFullscreen || document.webkitExitFullscreen;
    if (e && Ft())
      try {
        e.call(document);
      } catch {
      }
  }
  function Je(e) {
    const t = e == null ? !Ee() : !!e;
    return t ? Bt() : _t(), t;
  }
  function Pt() {
    const e = Ee();
    R.classList.toggle("loc-fullscreen", e), F && (F.title = e ? "Exit fullscreen" : "Fullscreen"), _(), Q(), h("fullscreen-change", { fullscreen: e });
  }
  G(Se, "pointerdown", (e) => {
    const t = e.target.closest(".loc-node");
    t && dn(e, t.dataset.id);
  }), G(Se, "click", (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !r.readonly) {
      at(t.closest(".loc-node").dataset.id);
      return;
    }
    const n = e.target.closest(".loc-node");
    n && h("node-click", { id: n.dataset.id, node: g[n.dataset.id] });
  }), G(ue, "pointerdown", (e) => {
    const t = e.target.closest("path");
    t && (e.stopPropagation(), vt(t.dataset.edge));
  }), G(ue, "dblclick", (e) => {
    if (r.readonly || !i.editMode) return;
    const t = e.target.closest("path");
    if (!t) return;
    const n = t.dataset.edge;
    vt(n);
    const o = mt(n);
    if (!o) return;
    const s = je(xe(e.clientX, e.clientY));
    (S[n] || (S[n] = [])).splice(mn(o, s), 0, s), Z(n), W(), x();
  }), G(j, "pointerdown", (e) => {
    if (r.readonly || !i.editMode) return;
    const t = e.target, n = i.selectedEdgeId;
    if (!n) return;
    if (t.dataset.ep) {
      e.stopPropagation(), e.preventDefault(), O = { id: n, kind: "ep", which: t.dataset.ep }, V("pointermove", xt), V("pointerup", Mt);
      return;
    }
    let o;
    if (t.dataset.wp != null) o = +t.dataset.wp;
    else if (t.dataset.add != null) {
      const s = +t.dataset.add;
      (S[n] || (S[n] = [])).splice(s, 0, je(xe(e.clientX, e.clientY))), o = s, Z(n);
    } else return;
    e.stopPropagation(), e.preventDefault(), O = { id: n, idx: o }, V("pointermove", Ht), V("pointerup", qt);
  }), G(j, "dblclick", (e) => {
    const t = e.target;
    if (t.dataset.ep === "parent") {
      Ye(i.selectedEdgeId);
      return;
    }
    if (t.dataset.wp == null) return;
    const n = i.selectedEdgeId, o = S[n];
    o && (o.splice(+t.dataset.wp, 1), o.length || delete S[n], Z(n), W(), x());
  });
  function Ht(e) {
    if (!O) return;
    const t = S[O.id];
    t && (t[O.idx] = pn(O.id, je(xe(e.clientX, e.clientY))), Z(O.id), W());
  }
  function qt() {
    O = null, gt(), J("pointermove", Ht), J("pointerup", qt), x();
  }
  G($, "click", (e) => {
    if (e.target.closest('[data-role="panel-close"]')) {
      te();
      return;
    }
    if (e.target.closest('[data-role="add-child"]')) {
      At(i.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="detach"]')) {
      Ye(i.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="del-node"]')) {
      Lt(i.selectedNodeId);
      return;
    }
  }), G(Ne, "input", (e) => {
    if (!i.editMode) return;
    const t = e.target.closest("[data-field]");
    if (!t) return;
    const n = i.selectedNodeId;
    if (!n) return;
    const o = t.dataset.field;
    let s = t.value;
    if (o === "type") {
      re(n, { type: s }), Be();
      return;
    }
    if (o === "width" || o === "height") {
      re(n, { [o]: Math.max(20, parseFloat(s) || 0) });
      return;
    }
    if (o === "photo_url") {
      const l = g[n];
      re(n, { data: Object.assign({}, l.data, { photo_url: s || null }) });
      return;
    }
    if (o === "layoutMode") {
      re(n, { layoutMode: s || null });
      return;
    }
    re(n, { [o]: s });
  }), G(U, "click", (e) => {
    if (e.target.closest('[data-role="settings-close"]')) {
      He(!1);
      return;
    }
    if (e.target.closest('[data-role="reset-settings"]')) {
      Tt();
      return;
    }
    if (e.target.closest('[data-role="add-rule"]')) {
      C.push(me({ field: "type", value: "", style: {} })), Ae(), Ie(), x(), h("settings-change", B());
      return;
    }
    const t = e.target.closest('[data-rk="remove"]');
    t && (C.splice(+t.dataset.rule, 1), Ae(), Ie(), x(), h("settings-change", B()));
  }), G(le, "input", (e) => {
    const t = e.target;
    if (t.dataset.set != null) {
      const n = parseFloat(t.value);
      i[t.dataset.set] = n;
      const o = le.querySelector(`[data-rangelabel="${t.dataset.set}"]`);
      o && (o.textContent = n), A(), h("settings-change", B()), x();
      return;
    }
    if (t.dataset.rule != null) {
      const n = +t.dataset.rule, o = t.dataset.rk, s = C[n];
      if (!s) return;
      if (o === "enabled") s.enabled = t.checked;
      else if (o === "field") s.field = t.value;
      else if (o === "value") s.value = t.value;
      else if (o === "bg" || o === "text" || o === "border")
        xn(n, o) && (s.style[o] = t.value);
      else if (/-on$/.test(o)) {
        const l = o.replace("-on", "");
        s.style[l] = t.checked ? Mn(n, l) || "#e0524d" : "";
      }
      Ie(), h("settings-change", B()), x();
    }
  }), G(w, "pointerdown", (e) => {
    if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn"))
      return;
    const t = () => {
      i.selectedNodeId && (u[i.selectedNodeId] && u[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = null), i.selectedEdgeId && ee(), te();
    };
    if (!r.enablePan) {
      t();
      return;
    }
    const n = e.clientX, o = e.clientY, s = i.panX, l = i.panY;
    let a = !1;
    w.classList.add("loc-panning");
    const c = (d) => {
      !a && Math.abs(d.clientX - n) + Math.abs(d.clientY - o) > 3 && (a = !0), i.panX = s + (d.clientX - n), i.panY = l + (d.clientY - o), he();
    }, f = () => {
      w.classList.remove("loc-panning"), J("pointermove", c), J("pointerup", f), a || t();
    };
    V("pointermove", c), V("pointerup", f);
  }), G(w, "wheel", (e) => {
    if (!r.enableZoom) return;
    e.preventDefault();
    const t = w.getBoundingClientRect(), n = e.clientX - t.left, o = e.clientY - t.top, s = e.deltaY < 0 ? 1.1 : 1 / 1.1, l = Math.min(3, Math.max(0.15, i.zoom * s));
    i.panX = n - (n - i.panX) * (l / i.zoom), i.panY = o - (o - i.panY) * (l / i.zoom), i.zoom = l, he();
  }, { passive: !1 });
  function V(e, t) {
    window.addEventListener(e, t), ve.push({ target: window, type: e, fn: t });
  }
  function J(e, t) {
    window.removeEventListener(e, t);
  }
  function Cn() {
    const e = r.toolbar && typeof r.toolbar == "object" ? r.toolbar : {}, t = (a) => e[a] !== !1, n = N("div", "loc-toolbar");
    let o = "";
    return t("subtree") && (o += s("Subtree", ["Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "RowWrap"].map((a) => l("mode", a, a)).join(""))), t("orient") && (o += s("Orient", [["TopToBottom", "Top"], ["BottomToTop", "Bottom"], ["LeftToRight", "Left"], ["RightToLeft", "Right"]].map(([a, c]) => l("orient", a, c)).join(""))), t("actions") && (o += s("", '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button><button data-act="reset">Reset</button><button data-act="fullscreen" title="Toggle fullscreen">Fullscreen</button>')), t("search") && (o += s("Search", '<input type="search" data-role="search" class="loc-search-input" placeholder="Search…" />')), t("grid") && (o += s("Grid", '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>')), t("mode") && (o += s("Mode", '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="settings" title="Settings &amp; theming">Settings</button>')), t("export") && (o += s("Export", '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>')), n.innerHTML = o, n.addEventListener("click", (a) => {
      const c = a.target.closest("button");
      if (c)
        if (c.dataset.mode) kt(c.dataset.mode);
        else if (c.dataset.orient) Xt(c.dataset.orient);
        else if (c.dataset.flag)
          i[c.dataset.flag] = !i[c.dataset.flag], c.dataset.flag === "showGrid" ? we() : c.dataset.flag === "alignGrid" && (p = /* @__PURE__ */ Object.create(null), A()), _(), x();
        else switch (c.dataset.act) {
          case "expand":
            st();
            break;
          case "collapse":
            lt();
            break;
          case "fit":
            Q();
            break;
          case "relayout":
            Ve();
            break;
          case "reset":
            Dt();
            break;
          case "fullscreen":
            Je();
            break;
          case "edit":
            It(!i.editMode);
            break;
          case "settings":
            He();
            break;
          case "png":
            Rt(3);
            break;
          case "svg":
            zt();
            break;
          case "pdf":
            jt();
            break;
          case "json":
            Nt(!0);
            break;
        }
    }), n.addEventListener("input", (a) => {
      const c = a.target.closest('[data-role="search"]');
      c && rt(c.value);
    }), n;
    function s(a, c) {
      return `<div class="loc-group">${a ? `<span class="loc-label">${a}</span>` : ""}${c}</div>`;
    }
    function l(a, c, f) {
      return `<button data-${a}="${c}">${f}</button>`;
    }
  }
  function _() {
    X && (X.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === i.subtreeMode)), X.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === i.orientation)), X.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!i[e.dataset.flag])), X.querySelectorAll('button[data-act="edit"]').forEach((e) => e.classList.toggle("loc-active", i.editMode)), X.querySelectorAll('button[data-act="fullscreen"]').forEach((e) => e.classList.toggle("loc-active", Ee())));
  }
  G(document, "fullscreenchange", Pt), G(document, "webkitfullscreenchange", Pt), In(), _(), we(), De(), A(), r.fitOnInit && Q();
  let Ut = !1;
  function zn() {
    if (!Ut) {
      Ut = !0, ve.forEach(({ target: e, type: t, fn: n, optsL: o }) => e.removeEventListener(t, n, o)), ve.length = 0, de && cancelAnimationFrame(de), R.remove();
      for (const e in u) delete u[e];
      for (const e in v) delete v[e];
      for (const e in z) delete z[e];
    }
  }
  const Ke = {
    root: R,
    setNodes: $t,
    loadJSON: En,
    setOrientation: Xt,
    setSubtreeMode: kt,
    setSpacing: On,
    setOption: Le,
    setShowGrid: Yt,
    setSnapToGrid: Gn,
    setAlignToGrid: Tn,
    toggleGrid: Nn,
    fitToScreen: Q,
    relayout: Ve,
    resetView: Dt,
    expandAll: st,
    collapseAll: lt,
    toggleCollapse: at,
    centerOnNode: Ce,
    search: rt,
    clearSearch: ct,
    exportJSON: Nt,
    exportSVG: zt,
    exportPNG: Rt,
    exportPDF: jt,
    buildSVG: be,
    setEditMode: It,
    isEditMode: () => i.editMode,
    enterFullscreen: Bt,
    exitFullscreen: _t,
    toggleFullscreen: Je,
    isFullscreen: Ee,
    updateNode: re,
    addChild: At,
    deleteNode: Lt,
    reparentNode: ke,
    detachNode: Ye,
    openInspector: Fe,
    closeInspector: te,
    nodeScreenRect: bt,
    getSettings: B,
    setSettings: Gt,
    toggleSettings: He,
    resetSettings: Tt,
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (e) => u[e] || null,
    getNodeSlotEl: (e) => u[e] ? u[e].querySelector(".loc-node-slot") : null,
    getInspectorBody: () => Ne,
    getSettingsBody: () => le,
    nodeThemeStyle: (e) => g[e] ? Jt(g[e], C) : null,
    getState: () => ({ ...i }),
    getNodes: () => b.map((e) => ({ ...e })),
    getPositioned: () => I,
    on: en,
    off: tn,
    destroy: zn
  };
  return Ke;
}
export {
  Zn as CANVAS_PAD,
  Qn as DEFAULTS,
  eo as DEFAULT_SETTINGS,
  to as DEPT_SIZE,
  no as ORIENTATIONS,
  oo as POS_SIZE,
  io as SNAKE_STUB,
  so as SUBTREE_MODES,
  lo as VIRTUAL_ROOT_ID,
  ao as applyOrientation,
  kn as buildChartSVG,
  ro as buildTree,
  Wt as calculateBounds,
  Vt as childCount,
  $n as computeDepths,
  co as convertMoTree,
  uo as convertNestedTree,
  Vn as createOrgChart,
  Bn as edgeControlPoints,
  po as edgeEndpoints,
  Y as effCenter,
  Rn as exportLayout,
  jn as fitBounds,
  fo as getVisibleTree,
  Ge as indexNodes,
  _n as isHorizontal,
  go as isMoArray,
  Dn as layoutOrgChart,
  ho as lh,
  bo as lw,
  Oe as makeNode,
  Fn as normalizeConfig,
  Yn as normalizeImported,
  me as normalizeRule,
  mo as normalizeSettings,
  Pn as orthoThrough,
  yo as personNameFromPos,
  Jt as resolveNodeStyle,
  Kt as routeConnector,
  Xn as searchNodes,
  vo as visibleDepths,
  So as waypointPath
};
