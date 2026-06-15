import { makeNode as Oe, indexNodes as Te, normalizeRule as ye, exportLayout as Xn, calculateBounds as Kt, fitBounds as Yn, computeDepths as Dn, childCount as Zt, searchNodes as Bn, resolveNodeStyle as Qt, buildChartSVG as Fn, effCenter as Y, normalizeImported as Pn, layoutOrgChart as _n, normalizeConfig as Hn, routeConnector as qn, edgeControlPoints as Un, isHorizontal as Vn, orthoThrough as Wn } from "./core.js";
import { CANVAS_PAD as oo, DEFAULTS as io, DEFAULT_SETTINGS as so, DEPT_SIZE as lo, ORIENTATIONS as ao, POS_SIZE as ro, SNAKE_STUB as co, SUBTREE_MODES as uo, VIRTUAL_ROOT_ID as fo, applyOrientation as po, buildTree as go, convertMoTree as ho, convertNestedTree as bo, edgeEndpoints as mo, getVisibleTree as yo, isMoArray as vo, lh as So, lw as wo, normalizeSettings as xo, personNameFromPos as Mo, visibleDepths as Io, waypointPath as Lo } from "./core.js";
const de = "http://www.w3.org/2000/svg", Jn = 0.5, Kn = { Top: "TopToBottom", Bottom: "BottomToTop", Left: "LeftToRight", Right: "RightToLeft" };
function ve(oe) {
  return Kn[oe] || oe;
}
const Zn = {
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
  // Custom fills this target shape. `targetSize` (a tarp's W×H, any units) wins; else targetAspect.
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
function eo(oe, en = {}) {
  if (!oe || !oe.appendChild) throw new Error("createOrgChart: first argument must be a DOM element.");
  const r = Object.assign({}, Zn, en), i = {
    orientation: ve(r.orientation),
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
  let y = (r.nodes || []).map(Oe), g = Te(y), p = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), T = /* @__PURE__ */ Object.create(null), z = (r.settings && r.settings.themeRules || r.themeRules || []).map(ye);
  const Q = {
    spacingX: r.spacingX,
    spacingY: r.spacingY,
    gridSize: r.gridSize,
    showGrid: !!r.showGrid,
    snapGrid: !!r.snapGrid,
    alignGrid: !!r.alignGrid,
    themeRules: z.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
  };
  let tn = 0, E = [], h = /* @__PURE__ */ Object.create(null);
  const u = /* @__PURE__ */ Object.create(null), w = /* @__PURE__ */ Object.create(null), $ = /* @__PURE__ */ Object.create(null);
  let G = null, v = null, ue = 0, B = /* @__PURE__ */ new Set();
  const Se = [], ie = /* @__PURE__ */ Object.create(null);
  function nn(e, t) {
    return (ie[e] || (ie[e] = [])).push(t), Ke;
  }
  function on(e, t) {
    return ie[e] && (ie[e] = ie[e].filter((n) => n !== t)), Ke;
  }
  function b(e, t) {
    (ie[e] || []).forEach((n) => {
      try {
        n(t);
      } catch {
      }
    });
  }
  function N(e, t, n, o) {
    e.addEventListener(t, n, o), Se.push({ target: e, type: t, fn: n, optsL: o });
  }
  const R = document.createElement("div");
  R.className = "loc-root";
  const D = r.toolbar ? jn() : null;
  D && R.appendChild(D);
  const L = C("div", "loc-canvas"), se = C("div", "loc-content"), U = C("div", "loc-grid"), le = document.createElementNS(de, "svg");
  le.setAttribute("class", "loc-connectors");
  const fe = document.createElementNS(de, "g");
  fe.setAttribute("class", "loc-edgehits"), le.appendChild(fe);
  const we = C("div", "loc-nodes"), V = document.createElementNS(de, "svg");
  V.setAttribute("class", "loc-overlay");
  const j = document.createElementNS(de, "g");
  j.setAttribute("class", "loc-edgehandles");
  const pe = document.createElementNS(de, "g");
  pe.setAttribute("class", "loc-aligns"), V.appendChild(pe), V.appendChild(j);
  const Ge = C("div", "loc-zoomreadout");
  Ge.textContent = "100%", se.appendChild(U), se.appendChild(le), se.appendChild(we), se.appendChild(V), L.appendChild(se), L.appendChild(Ge);
  let F = null;
  r.fullscreenControl && (F = C("button", "loc-fsbtn"), F.type = "button", F.title = "Fullscreen", F.setAttribute("aria-label", "Toggle fullscreen"), F.innerHTML = "⛶", N(F, "click", (e) => {
    e.stopPropagation(), Je();
  }), L.appendChild(F)), R.appendChild(L);
  const k = C("div", "loc-panel");
  k.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Node</span><button class="loc-panel-close" title="Close" data-role="panel-close">✕</button></div><div class="loc-panel-body" data-role="panel-body"></div><div class="loc-panel-foot" data-role="panel-foot"></div>';
  const Ze = tt(r.inspectorTarget) || L;
  Ze.appendChild(k), Ze !== L && k.classList.add("loc-panel-external");
  const Ne = k.querySelector('[data-role="panel-body"]'), Qe = k.querySelector('[data-role="panel-foot"]'), sn = k.querySelector(".loc-panel-title"), P = C("div", "loc-settings");
  P.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Settings</span><button class="loc-panel-close" title="Close" data-role="settings-close">✕</button></div><div class="loc-panel-body" data-role="settings-body"></div>';
  const et = tt(r.settingsTarget) || L;
  et.appendChild(P), et !== L && P.classList.add("loc-panel-external");
  const W = P.querySelector('[data-role="settings-body"]');
  oe.appendChild(R);
  function C(e, t) {
    const n = document.createElement(e);
    return t && (n.className = t), n;
  }
  function tt(e) {
    if (!e) return null;
    const t = typeof e == "string" ? document.querySelector(e) : e;
    return t && t.appendChild ? t : null;
  }
  function xe() {
    return Hn({
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
  function ln() {
    const e = _n(y, xe());
    E = e.positioned, h = e.posById;
  }
  function A() {
    ln(), st(), fn(), nt(), he(), $e(), M(), b("layout-change", { positioned: E, mode: i.subtreeMode, orientation: i.orientation });
  }
  function nt() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of E) {
      const n = t.node;
      e[n.id] = !0;
      let o = u[n.id];
      o || (o = an(n), u[n.id] = o, we.appendChild(o)), o.style.width = n.width + "px", o.style.height = n.height + "px";
      const s = Y(t, p);
      o.style.transform = `translate(${s.x - n.width / 2}px, ${s.y - n.height / 2}px)`, r.nodeSlots || (o.dataset.fitted || (rn(o), o.dataset.fitted = "1"), Tt(o, n)), o.classList.toggle("loc-selected", i.selectedNodeId === n.id), o.classList.toggle("loc-banner", !!t.banner), cn(o, n);
    }
    for (const t in u) e[t] || (u[t].remove(), delete u[t]);
    b("nodes-rendered", { ids: E.map((t) => t.node.id) });
  }
  function an(e) {
    if (r.nodeSlots) {
      const n = C("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
      if (n.dataset.id = e.id, n.innerHTML = '<div class="loc-node-slot"></div>', e.type === "department") {
        const o = C("div", "loc-toggle");
        o.dataset.role = "toggle", n.appendChild(o);
      }
      return n;
    }
    const t = C("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
    if (t.dataset.id = e.id, e.type === "department") {
      t.innerHTML = '<span class="loc-lbl"></span>', t.querySelector(".loc-lbl").textContent = e.label;
      const n = C("div", "loc-toggle");
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
  function rn(e) {
    if (e.style.setProperty("--loc-fit", "1"), !ot(e)) return;
    let t = Jn, n = 1;
    for (let o = 0; o < 7; o++) {
      const s = (t + n) / 2;
      e.style.setProperty("--loc-fit", String(s)), ot(e) ? n = s : t = s;
    }
    e.style.setProperty("--loc-fit", String(t));
  }
  function cn(e, t) {
    const n = e.querySelector('[data-role="toggle"]');
    if (!n) return;
    const o = Zt(y, t.id) > 0;
    n.style.display = o ? "flex" : "none", n.textContent = t.collapsed ? "⊞" : "⊟";
  }
  function ge(e) {
    return document.createElementNS(de, e);
  }
  const dn = 16;
  function un(e) {
    const t = h[e.node.parentId];
    if (!t) return null;
    const n = E.filter((S) => S.node.parentId === e.node.parentId && S.routeType === "grid");
    if (!n.length) return null;
    const o = (S) => Y(S, p), s = o(t), l = s.y + t.node.height / 2;
    let a = 1 / 0;
    for (const S of n) a = Math.min(a, o(S).y - S.node.height / 2);
    const c = (l + a) / 2, f = o(e);
    let d = 1 / 0;
    for (const S of n) {
      const Jt = o(S);
      Math.abs(Jt.x - f.x) < 1 && (d = Math.min(d, Jt.x - S.node.width / 2));
    }
    const I = d - dn, X = f.x - e.node.width / 2, m = (S) => S.toFixed(1);
    return `M ${m(s.x)} ${m(l)} L ${m(s.x)} ${m(c)} L ${m(I)} ${m(c)} L ${m(I)} ${m(f.y)} L ${m(X)} ${m(f.y)}`;
  }
  function it(e) {
    const t = e.node.id;
    if (!(x[t] && x[t].length || O[t]) && e.routeType === "grid" && i.orientation === "TopToBottom") {
      const o = un(e);
      if (o) return o;
    }
    return qn(h[e.node.parentId], e, xe(), p, x, O);
  }
  function fn() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of E) {
      const n = t.node;
      if (!n.parentId || !h[n.parentId]) continue;
      e[n.id] = !0;
      const s = it(t);
      let l = w[n.id];
      l || (l = ge("path"), w[n.id] = l, le.appendChild(l)), l.setAttribute("d", s), l.classList.toggle("loc-sel", i.selectedEdgeId === n.id);
      let a = $[n.id];
      a || (a = ge("path"), a.dataset.edge = n.id, $[n.id] = a, fe.appendChild(a)), a.setAttribute("d", s);
    }
    for (const t in w) e[t] || (w[t].remove(), delete w[t]);
    for (const t in $) e[t] || ($[t].remove(), delete $[t]);
    i.selectedEdgeId && !e[i.selectedEdgeId] ? te() : J();
  }
  function ee(e) {
    const t = h[e];
    if (!t || !h[t.node.parentId]) return;
    const o = it(t);
    w[e] && w[e].setAttribute("d", o), $[e] && $[e].setAttribute("d", o);
  }
  function he() {
    se.style.transform = `translate(${i.panX}px, ${i.panY}px) scale(${i.zoom})`, Ge.textContent = Math.round(i.zoom * 100) + "%", i.selectedEdgeId && !G && J(), M();
  }
  function st() {
    let e = 0, t = 0, n = 0, o = 0;
    for (const l of E) {
      const a = Y(l, p), c = l.node.width / 2, f = l.node.height / 2;
      e = Math.min(e, a.x - c - 80), t = Math.min(t, a.y - f - 80), n = Math.max(n, a.x + c + 80), o = Math.max(o, a.y + f + 80);
    }
    le.setAttribute("width", n), le.setAttribute("height", o), V.setAttribute("width", n), V.setAttribute("height", o);
    const s = i.gridSize;
    U.style.left = e + "px", U.style.top = t + "px", U.style.width = n - e + "px", U.style.height = o - t + "px", U.style.backgroundSize = s + "px " + s + "px", U.style.backgroundPosition = (-e % s + s) % s + "px " + (-t % s + s) % s + "px";
  }
  function Me() {
    U.classList.toggle("loc-on", i.showGrid), L.classList.toggle("loc-gridon", i.showGrid);
  }
  function _() {
    if (!E.length) return;
    const e = Kt(E, p, 0), t = Yn(e, L.clientWidth, L.clientHeight);
    i.zoom = t.zoom, i.panX = t.panX, i.panY = t.panY, he();
  }
  function Ce(e) {
    const t = h[e];
    if (!t) return;
    const n = Y(t, p);
    i.panX = L.clientWidth / 2 - n.x * i.zoom, i.panY = L.clientHeight / 2 - n.y * i.zoom, he();
  }
  function pn() {
    const e = r.fitOnLayoutChange;
    return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
  }
  function ze() {
    const e = pn();
    if (e === "fit") {
      _();
      return;
    }
    if (e === "recenter") {
      const t = y.find((o) => !o.parentId), n = i.selectedNodeId && h[i.selectedNodeId] ? i.selectedNodeId : t && t.id;
      n && Ce(n);
    }
  }
  function lt() {
    for (const e of y) e.collapsed = !1;
    A();
  }
  function at() {
    const e = Dn(y, g);
    for (const t of y) t.collapsed = e[t.id] >= 1 && Zt(y, t.id) > 0;
    A();
  }
  function rt(e) {
    const t = g[e];
    t && (t.collapsed = !t.collapsed, A());
  }
  function ct(e) {
    if (B = Bn(y, e), $e(), B.size) {
      const t = E.find((n) => B.has(n.node.id));
      t && Ce(t.node.id);
    }
    return B.size;
  }
  function dt() {
    B = /* @__PURE__ */ new Set(), $e();
  }
  function $e() {
    const e = B.size > 0;
    for (const t of E) {
      const n = u[t.node.id];
      if (!n) continue;
      const o = B.has(t.node.id);
      n.classList.toggle("loc-highlight", e && o), n.classList.toggle("loc-dim", e && !o);
    }
    for (const t in w) w[t].classList.toggle("loc-hl", e && B.has(t));
  }
  function gn(e, t) {
    if (e.target.closest('[data-role="toggle"]') || (e.stopPropagation(), te(), bt(t), b("node-select", { id: t, node: g[t], rect: mt(t) }), r.inspector && Be(t), r.readonly || !r.enableDragging || !i.editMode)) return;
    const n = p[t] || { dx: 0, dy: 0 };
    v = { id: t, startX: e.clientX, startY: e.clientY, baseDx: n.dx, baseDy: n.dy, moved: !1 }, u[t].classList.add("loc-dragging"), b("node-drag-start", { id: t, node: g[t] }), K("pointermove", ut), K("pointerup", ft);
  }
  function ut(e) {
    if (!v) return;
    let t = v.baseDx + (e.clientX - v.startX) / i.zoom, n = v.baseDy + (e.clientY - v.startY) / i.zoom;
    if (Math.abs(e.clientX - v.startX) + Math.abs(e.clientY - v.startY) > 3 && (v.moved = !0), i.snapGrid) {
      const s = i.gridSize, l = h[v.id];
      l && (t = Math.round((l.cx + t) / s) * s - l.cx, n = Math.round((l.cy + n) / s) * s - l.cy);
    }
    const o = h[v.id];
    if (o) {
      const s = hn(v.id, o.cx + t, o.cy + n);
      t = s.cx - o.cx, n = s.cy - o.cy, gt(s.gx, s.gy);
    }
    p[v.id] = { dx: t, dy: n }, ue || (ue = requestAnimationFrame(() => {
      ue = 0, mn(v.id), yn(v.id), b("node-drag", { id: v.id, node: g[v.id], offset: p[v.id] });
    }));
  }
  function ft() {
    if (v) {
      const e = u[v.id];
      e && e.classList.remove("loc-dragging"), b("node-drag-end", { id: v.id, node: g[v.id], offset: p[v.id] }), st();
    }
    v = null, ht(), Z("pointermove", ut), Z("pointerup", ft), M();
  }
  const pt = 8;
  function hn(e, t, n) {
    if (!r.snapAlign) return { cx: t, cy: n, gx: null, gy: null };
    const o = g[e];
    if (!o) return { cx: t, cy: n, gx: null, gy: null };
    const s = pt / i.zoom, l = [], a = [], c = o.parentId && h[o.parentId];
    c && l.push(Y(c, p).x);
    for (const m of E) {
      if (m.node.id === e || !o.parentId || m.node.parentId !== o.parentId) continue;
      const S = Y(m, p);
      l.push(S.x), a.push(S.y);
    }
    let f = null, d = s;
    for (const m of l) {
      const S = Math.abs(t - m);
      S < d && (d = S, t = m, f = m);
    }
    let I = null, X = s;
    for (const m of a) {
      const S = Math.abs(n - m);
      S < X && (X = S, n = m, I = m);
    }
    return { cx: t, cy: n, gx: f, gy: I };
  }
  function bn(e, t) {
    if (!r.snapAlign) return t;
    const n = h[e];
    if (!n) return t;
    const o = h[n.node.parentId], s = pt / i.zoom, l = [Y(n, p).x];
    o && l.push(Y(o, p).x);
    let a = null, c = s, f = t.x;
    for (const d of l) {
      const I = Math.abs(t.x - d);
      I < c && (c = I, f = d, a = d);
    }
    return gt(a, null), { x: f, y: t.y };
  }
  function gt(e, t) {
    pe.innerHTML = "";
    const n = +V.getAttribute("width") || 0, o = +V.getAttribute("height") || 0, s = (l, a, c, f) => {
      const d = ge("line");
      d.setAttribute("x1", l), d.setAttribute("y1", a), d.setAttribute("x2", c), d.setAttribute("y2", f), d.setAttribute("class", "loc-align-line"), pe.appendChild(d);
    };
    e != null && s(e, 0, e, o), t != null && s(0, t, n, t);
  }
  function ht() {
    pe.innerHTML = "";
  }
  function mn(e) {
    const t = h[e], n = u[e];
    if (!t || !n) return;
    const o = Y(t, p);
    n.style.transform = `translate(${o.x - t.node.width / 2}px, ${o.y - t.node.height / 2}px)`;
  }
  function yn(e) {
    const t = h[e];
    if (t) {
      h[t.node.parentId] && ee(e);
      for (const n of E) n.node.parentId === e && ee(n.node.id);
      i.selectedEdgeId && J();
    }
  }
  function bt(e) {
    i.selectedNodeId && u[i.selectedNodeId] && u[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = e, u[e] && u[e].classList.add("loc-selected");
  }
  function mt(e) {
    const t = u[e];
    if (!t) return null;
    const n = t.getBoundingClientRect();
    return { left: n.left, top: n.top, right: n.right, bottom: n.bottom, width: n.width, height: n.height };
  }
  function Ie(e, t) {
    const n = L.getBoundingClientRect();
    return { x: (e - n.left - i.panX) / i.zoom, y: (t - n.top - i.panY) / i.zoom };
  }
  function Re(e) {
    if (i.snapGrid) {
      const t = i.gridSize;
      return { x: Math.round(e.x / t) * t, y: Math.round(e.y / t) * t };
    }
    return { x: e.x, y: e.y };
  }
  function yt(e) {
    const t = h[e];
    if (!t) return null;
    const n = h[t.node.parentId];
    if (!n) return null;
    const o = x[e] || [];
    return Un(n, t, o, xe(), p, O[e]);
  }
  function vt(e) {
    const t = [], n = Vn(xe());
    for (let o = 0; o < e.length - 1; o++) {
      const s = Wn([e[o], e[o + 1]], n);
      for (let l = 0; l < s.length - 1; l++) t.push({ a: s[l], b: s[l + 1], insert: o });
    }
    return t;
  }
  function St(e) {
    i.selectedEdgeId && w[i.selectedEdgeId] && w[i.selectedEdgeId].classList.remove("loc-sel"), i.selectedNodeId && u[i.selectedNodeId] && u[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = null, i.selectedEdgeId = e, w[e] && w[e].classList.add("loc-sel"), J();
  }
  function te() {
    i.selectedEdgeId && w[i.selectedEdgeId] && w[i.selectedEdgeId].classList.remove("loc-sel"), i.selectedEdgeId = null, j.innerHTML = "";
  }
  function je(e, t, n, o) {
    const s = ge("circle");
    return s.setAttribute("cx", e), s.setAttribute("cy", t), s.setAttribute("r", n), s.setAttribute("class", o), s;
  }
  function wt(e, t, n, o) {
    const s = ge("rect");
    return s.setAttribute("x", e - n), s.setAttribute("y", t - n), s.setAttribute("width", 2 * n), s.setAttribute("height", 2 * n), s.setAttribute("rx", 2 / i.zoom), s.setAttribute("class", o), s;
  }
  function J() {
    j.innerHTML = "";
    const e = i.selectedEdgeId;
    if (!e || r.readonly) return;
    const t = yt(e);
    if (!t) return;
    const n = x[e] || [], o = 6 / i.zoom, s = 5 / i.zoom;
    if (!i.editMode) {
      for (let d = 0; d < n.length; d++) {
        const I = je(n[d].x, n[d].y, o, "loc-wp-handle loc-wp-readonly");
        I.dataset.wp = d, j.appendChild(I);
      }
      return;
    }
    for (const d of vt(t)) {
      const I = je((d.a.x + d.b.x) / 2, (d.a.y + d.b.y) / 2, s, "loc-wp-add");
      I.dataset.add = d.insert, j.appendChild(I);
    }
    for (let d = 0; d < n.length; d++) {
      const I = je(n[d].x, n[d].y, o, "loc-wp-handle");
      I.dataset.wp = d, j.appendChild(I);
    }
    const l = t[0], a = t[t.length - 1], c = wt(l.x, l.y, 6 / i.zoom, "loc-ep loc-ep-parent");
    c.dataset.ep = "parent", j.appendChild(c);
    const f = wt(a.x, a.y, 6 / i.zoom, "loc-ep loc-ep-child");
    f.dataset.ep = "child", j.appendChild(f);
  }
  function xt(e, t) {
    const n = Y(e, p), o = e.node.width, s = e.node.height;
    let l = (t.x - n.x) / (o / 2), a = (t.y - n.y) / (s / 2);
    const c = Math.max(Math.abs(l), Math.abs(a));
    return c > 1e-6 && (l /= c, a /= c), { nx: Math.max(-1, Math.min(1, l)), ny: Math.max(-1, Math.min(1, a)) };
  }
  function vn(e, t) {
    const n = new Set([t].concat(Pe(t)));
    for (let o = E.length - 1; o >= 0; o--) {
      const s = E[o];
      if (n.has(s.node.id)) continue;
      const l = Y(s, p);
      if (e.x >= l.x - s.node.width / 2 && e.x <= l.x + s.node.width / 2 && e.y >= l.y - s.node.height / 2 && e.y <= l.y + s.node.height / 2) return s.node.id;
    }
    return null;
  }
  let ae = null;
  function ke(e) {
    ae && u[ae] && u[ae].classList.remove("loc-reparent-target"), ae = e, e && u[e] && u[e].classList.add("loc-reparent-target");
  }
  function Mt(e) {
    if (!G || G.kind !== "ep") return;
    const t = G.id, n = h[t];
    if (!n) return;
    const o = h[n.node.parentId];
    if (!o) return;
    const s = Ie(e.clientX, e.clientY);
    if (O[t] = O[t] || {}, G.which === "child")
      O[t].c = xt(n, s);
    else {
      O[t].p = xt(o, s);
      const l = vn(s, t);
      ke(l && l !== n.node.parentId ? l : null);
    }
    ee(t), J();
  }
  function It() {
    const e = G;
    if (G = null, Z("pointermove", Mt), Z("pointerup", It), e && e.which === "parent" && ae) {
      const t = ae;
      ke(null), Xe(e.id, t);
      return;
    }
    ke(null), M();
  }
  function Xe(e, t) {
    const n = g[e];
    !n || t === e || t && Pe(e).indexOf(t) >= 0 || (n.parentId = t || "", T[e] = Object.assign(T[e] || {}, { parentId: n.parentId }), delete x[e], delete O[e], i.selectedEdgeId = null, j.innerHTML = "", h[e] && Object.assign(h[e].node, { parentId: n.parentId }), A(), b("node-change", { id: e, node: { ...n }, patch: { parentId: n.parentId }, reparented: !0 }), M());
  }
  function Ye(e) {
    Xe(e, "");
  }
  function Sn(e, t, n) {
    const o = n.x - t.x, s = n.y - t.y, l = o * o + s * s;
    let a = l ? ((e.x - t.x) * o + (e.y - t.y) * s) / l : 0;
    return a = Math.max(0, Math.min(1, a)), Math.hypot(e.x - (t.x + a * o), e.y - (t.y + a * s));
  }
  function wn(e, t) {
    const n = vt(e);
    let o = 0, s = 1 / 0;
    for (const l of n) {
      const a = Sn(t, l.a, l.b);
      a < s && (s = a, o = l.insert);
    }
    return o;
  }
  const xn = ["", "Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Custom"];
  function Le(e) {
    return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function De() {
    R.classList.toggle("loc-edit", i.editMode);
  }
  function Lt(e) {
    i.editMode = !!e, De(), q(), i.editMode || te(), k.classList.contains("loc-open") && Fe(), b("edit-mode-change", { editMode: i.editMode }), M();
  }
  function Be(e) {
    r.inspector && (i.selectedNodeId = e, k.classList.add("loc-open"), Fe(), b("inspector-open", { id: e, node: g[e] }));
  }
  function ne() {
    k.classList.contains("loc-open") && (k.classList.remove("loc-open"), b("inspector-close", {}));
  }
  function Fe() {
    const e = i.selectedNodeId, t = e && g[e];
    if (!t) {
      ne();
      return;
    }
    if (sn.textContent = t.label || t.personName || t.id, r.inspectorSlot) {
      Qe.innerHTML = "";
      return;
    }
    const n = i.editMode, o = n ? "" : " disabled", s = (f, d, I) => `<input data-field="${f}" type="${I || "text"}" value="${Le(d)}"${o}/>`, l = (f, d, I) => `<select data-field="${f}"${o}>` + I.map((X) => {
      const m = Array.isArray(X) ? X[0] : X, S = Array.isArray(X) ? X[1] : X || "—";
      return `<option value="${Le(m)}"${String(m) === String(d ?? "") ? " selected" : ""}>${S}</option>`;
    }).join("") + "</select>", a = (f, d) => `<label class="loc-field"><span>${f}</span>${d}</label>`;
    let c = a("ID", `<input value="${Le(t.id)}" disabled/>`) + a("Type", l("type", t.type, [["department", "department"], ["position", "position"]])) + a("Label", s("label", t.label));
    t.type !== "department" && (c += a("Person name", s("personName", t.personName)) + a("Status", l("status", t.status, [["", "—"], ["FILLED", "FILLED"], ["VACANT", "VACANT"], ["UNFUNDED", "UNFUNDED"]])) + a("Photo URL", s("photo_url", t.data && t.data.photo_url || ""))), c += a("Layout override", l("layoutMode", t.layoutMode || "", xn.map((f) => [f, f || "(inherit)"]))) + a("Width", s("width", t.width, "number")) + a("Height", s("height", t.height, "number")), Ne.innerHTML = c, Qe.innerHTML = n ? '<button data-role="add-child">+ Add child</button>' + (t.parentId ? '<button data-role="detach">Detach</button>' : "") + '<button data-role="del-node" class="loc-danger">Delete</button>' : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  function Mn() {
    let e;
    do
      e = "node-" + ++tn;
    while (g[e]);
    return e;
  }
  function re(e, t) {
    const n = g[e];
    if (!n) return;
    Object.assign(n, t), h[e] && h[e].node !== n && Object.assign(h[e].node, t), T[e] = Object.assign(T[e] || {}, t);
    const o = ["type", "width", "height", "layoutMode"].some((s) => s in t);
    u[e] && (u[e].remove(), delete u[e]), o ? A() : nt(), b("node-change", { id: e, node: { ...n }, patch: t }), M();
  }
  function Pe(e) {
    const t = [], n = [e];
    for (; n.length; ) {
      const o = n.pop();
      for (const s of y) s.parentId === o && (t.push(s.id), n.push(s.id));
    }
    return t;
  }
  function At(e) {
    if (!i.editMode) return;
    const t = Mn(), n = Oe({ id: t, parentId: e || "", type: "position", label: "NEW POSITION", personName: "", status: "" });
    y.push(n), g[t] = n, T[t] = Object.assign({ __new: !0 }, n), A(), bt(t), Be(t), b("node-change", { id: t, node: { ...n }, added: !0 }), M();
  }
  function Et(e) {
    if (!i.editMode || !e) return;
    const t = [e].concat(Pe(e)), n = new Set(t);
    y = y.filter((o) => !n.has(o.id)), g = Te(y), t.forEach((o) => {
      T[o] = { __deleted: !0 }, u[o] && (u[o].remove(), delete u[o]);
    }), n.has(i.selectedNodeId) && (i.selectedNodeId = null, ne()), A(), b("node-change", { id: e, removed: !0, ids: t }), M();
  }
  function Ot() {
    const e = new Set(Object.keys(T).filter((t) => T[t] && T[t].__deleted));
    e.size && (y = y.filter((t) => !e.has(t.id))), g = Te(y);
    for (const t in T) {
      const n = T[t];
      if (!(!n || n.__deleted))
        if (n.__new) {
          if (!g[t]) {
            const o = Object.assign({}, n);
            delete o.__new;
            const s = Oe(o);
            y.push(s), g[t] = s;
          }
        } else g[t] && Object.assign(g[t], n);
    }
  }
  const In = [
    ["type", "Type"],
    ["status", "Status"],
    ["level", "Level (data.level)"],
    ["unit", "Unit (data.unit)"],
    ["id", "Node id"],
    ["label", "Label"]
  ];
  function Tt(e, t) {
    const n = Qt(t, z);
    _e(e, "--loc-node-bg", n && n.bg), _e(e, "--loc-node-text", n && n.text), _e(e, "--loc-node-border", n && n.border);
  }
  function _e(e, t, n) {
    n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
  }
  function Ae() {
    for (const e in u) g[e] && Tt(u[e], g[e]);
  }
  function H() {
    return {
      spacingX: i.spacingX,
      spacingY: i.spacingY,
      gridSize: i.gridSize,
      orientation: i.orientation,
      subtreeMode: i.subtreeMode,
      showGrid: i.showGrid,
      snapGrid: i.snapGrid,
      alignGrid: i.alignGrid,
      themeRules: z.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    };
  }
  function Gt(e, t) {
    e = e || {}, typeof e.spacingX == "number" && (i.spacingX = e.spacingX), typeof e.spacingY == "number" && (i.spacingY = e.spacingY), typeof e.gridSize == "number" && (i.gridSize = e.gridSize), e.orientation && (i.orientation = ve(e.orientation)), e.subtreeMode && (i.subtreeMode = e.subtreeMode), "showGrid" in e && (i.showGrid = !!e.showGrid), "snapGrid" in e && (i.snapGrid = !!e.snapGrid), "alignGrid" in e && (i.alignGrid = !!e.alignGrid), Array.isArray(e.themeRules) && (z = e.themeRules.map(ye)), Me(), q(), A(), P.classList.contains("loc-open") && be(), t && t.silent || b("settings-change", H()), M();
  }
  function He(e) {
    const t = P.classList.contains("loc-open"), n = e == null ? !t : !!e;
    P.classList.toggle("loc-open", n), D && D.querySelectorAll('button[data-act="settings"]').forEach((o) => o.classList.toggle("loc-active", n)), n && be(), n !== t && b(n ? "settings-open" : "settings-close", {});
  }
  function Nt(e, t) {
    ce("targetSize", { width: e, height: t }), P.classList.contains("loc-open") && be(), A(), _(), M();
  }
  function Ct() {
    Gt({
      spacingX: Q.spacingX,
      spacingY: Q.spacingY,
      gridSize: Q.gridSize,
      showGrid: Q.showGrid,
      snapGrid: Q.snapGrid,
      alignGrid: Q.alignGrid,
      themeRules: Q.themeRules.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    }), Ae();
  }
  function qe(e, t, n, o, s) {
    return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${o}" max="${s}" value="${n}"/></label>`;
  }
  function Ue(e, t, n, o) {
    return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${o ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${o || "#e0524d"}"/></label>`;
  }
  function Ln(e, t) {
    const n = (o, s) => `<option value="${o}"${e.field === o ? " selected" : ""}>${s}</option>`;
    return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + In.map(([o, s]) => n(o, s)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${Le(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Ue(t, "bg", "BG", e.style.bg) + Ue(t, "text", "Text", e.style.text) + Ue(t, "border", "Border", e.style.border) + "</div></div>";
  }
  function be() {
    if (r.settingsSlot) return;
    let e = '<div class="loc-set-section"><div class="loc-set-title">Layout</div>' + qe("spacingX", "Spacing X", i.spacingX, 0, 200) + qe("spacingY", "Spacing Y", i.spacingY, 0, 260) + qe("gridSize", "Grid size", i.gridSize, 6, 80) + "</div>";
    const t = r.targetSize && r.targetSize.width > 0 && r.targetSize.height > 0 ? r.targetSize : { width: Math.round((r.targetAspect || 1.6) * 100), height: 100 };
    e += `<div class="loc-set-section"><div class="loc-set-title">Fill target — Custom</div><div class="loc-set-hint">Only affects the <b>Custom</b> mode — it spreads to fill this width : height (e.g. a tarp). Other modes ignore it.</div><label class="loc-field"><span>Width</span><input type="number" min="1" data-tgt="width" value="${t.width}"/></label><label class="loc-field"><span>Height</span><input type="number" min="1" data-tgt="height" value="${t.height}"/></label><div class="loc-set-orient"><button data-role="tgt-portrait">Portrait</button><button data-role="tgt-landscape">Landscape</button></div></div>`, e += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div><div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>', z.forEach((n, o) => {
      e += Ln(n, o);
    }), e += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>', e += '<div class="loc-set-foot"><button class="loc-set-reset" data-role="reset-settings" title="Restore spacing, grid &amp; theme rules to defaults">↺ Reset settings</button></div>', W.innerHTML = e;
  }
  function An(e, t) {
    const n = W.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
    return n && n.checked;
  }
  function En(e, t) {
    const n = W.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
    return n ? n.value : "";
  }
  function M() {
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
          edgeWaypoints: x,
          edgeAnchors: O,
          nodeOverrides: T,
          themeRules: z,
          collapsed: y.filter((e) => e.collapsed).map((e) => e.id)
        }));
      } catch {
      }
  }
  function On() {
    if (!r.persist) return;
    let e;
    try {
      e = JSON.parse(localStorage.getItem(r.storageKey) || "null");
    } catch {
      e = null;
    }
    if (e && (e.orientation && (i.orientation = ve(e.orientation)), e.subtreeMode && (i.subtreeMode = e.subtreeMode), ["spacingX", "spacingY", "zoom", "panX", "panY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (i[t] = e[t]);
    }), i.showGrid = !!e.showGrid, i.snapGrid = !!e.snapGrid, i.alignGrid = !!e.alignGrid, i.editMode = !!e.editMode, e.manualOffsets && (p = e.manualOffsets), e.edgeWaypoints && (x = e.edgeWaypoints), e.edgeAnchors && (O = e.edgeAnchors), e.nodeOverrides && (T = e.nodeOverrides, Ot()), Array.isArray(e.themeRules) && (z = e.themeRules.map(ye)), Array.isArray(e.collapsed))) {
      const t = new Set(e.collapsed);
      for (const n of y) n.collapsed = t.has(n.id);
    }
  }
  function zt(e) {
    const t = Xn(i, y, p, x);
    return t.editMode = i.editMode, t.edgeAnchors = O, t.nodeOverrides = T, t.settings = H(), e !== !1 && Ve(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
  }
  const $t = document.createElement("canvas").getContext("2d");
  function Tn(e, t) {
    return $t.font = t, $t.measureText(e).width;
  }
  function Gn(e) {
    const t = u[e.id];
    if (!t) return 1;
    const n = parseFloat(t.style.getPropertyValue("--loc-fit"));
    return isFinite(n) && n > 0 ? n : 1;
  }
  function me(e) {
    const t = [];
    for (const n in w) t.push(w[n].getAttribute("d"));
    return Fn(E, t, { manualOffsets: p, raster: !!e, measureText: Tn, fitOf: Gn });
  }
  function Rt() {
    return Ve(new Blob([me(!1)], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), me(!1);
  }
  function jt(e) {
    e = e || 3;
    const t = Kt(E, p, 40), n = 16e3, o = 2e8;
    let s = Math.min(e, n / t.w, n / t.h);
    t.w * s * t.h * s > o && (s = Math.sqrt(o / (t.w * t.h))), s = Math.max(0.05, s);
    const l = URL.createObjectURL(new Blob([me(!0)], { type: "image/svg+xml;charset=utf-8" })), a = new Image();
    a.onload = () => {
      const c = document.createElement("canvas");
      c.width = Math.round(t.w * s), c.height = Math.round(t.h * s);
      const f = c.getContext("2d");
      f.setTransform(s, 0, 0, s, 0, 0), f.drawImage(a, 0, 0), URL.revokeObjectURL(l);
      try {
        c.toBlob((d) => {
          d && Ve(d, "org-chart.png");
        }, "image/png");
      } catch {
      }
    }, a.onerror = () => URL.revokeObjectURL(l), a.src = l;
  }
  function kt() {
    const e = window.open("", "_blank");
    e && (e.document.open(), e.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + me(!1) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), e.document.close());
  }
  function Ve(e, t) {
    const n = URL.createObjectURL(e), o = document.createElement("a");
    o.href = n, o.download = t, document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(n);
  }
  function Xt(e, t, n) {
    const o = !(n && n.resetEdits);
    y = (e || []).map(Oe), g = Te(y), o || (p = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), T = /* @__PURE__ */ Object.create(null)), i.selectedNodeId = null, i.selectedEdgeId = null, B = /* @__PURE__ */ new Set(), ne();
    for (const s in u)
      u[s].remove(), delete u[s];
    for (const s in w)
      w[s].remove(), delete w[s];
    for (const s in $)
      $[s].remove(), delete $[s];
    t && (t.subtreeMode && (i.subtreeMode = t.subtreeMode), t.orientation && (i.orientation = ve(t.orientation)), t.manualOffsets && (p = t.manualOffsets), t.edgeWaypoints && (x = t.edgeWaypoints), t.edgeAnchors && (O = t.edgeAnchors), t.nodeOverrides && (T = t.nodeOverrides), typeof t.editMode == "boolean" && (i.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (z = t.settings.themeRules.map(ye))), o && Ot(), De(), q(), A(), r.fitOnInit && _();
  }
  function Nn(e) {
    const { nodes: t, meta: n } = Pn(e);
    return Xt(t, n), t.length;
  }
  function Yt(e) {
    const t = ve(e);
    i.orientation = t, p = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), te(), q(), A(), ze(), b("orientation-change", { orientation: t });
  }
  function Dt(e) {
    i.subtreeMode = e, p = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), te(), q(), A(), ze(), b("subtree-mode-change", { subtreeMode: e });
  }
  function Cn(e, t) {
    e != null && (i.spacingX = e), t != null && (i.spacingY = t), A(), b("settings-change", H());
  }
  function ce(e, t) {
    e in i ? (i[e] = t, e === "showGrid" && Me(), e === "alignGrid" && (p = /* @__PURE__ */ Object.create(null), A()), q(), M(), ["showGrid", "snapGrid", "alignGrid", "gridSize"].includes(e) && b("settings-change", H())) : r[e] = t;
  }
  function Bt(e) {
    return ce("showGrid", !!e), i.showGrid;
  }
  function zn(e) {
    return ce("snapGrid", !!e), i.snapGrid;
  }
  function $n(e) {
    return ce("alignGrid", !!e), i.alignGrid;
  }
  function Rn(e) {
    return Bt(e ?? !i.showGrid);
  }
  function We() {
    p = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), O = /* @__PURE__ */ Object.create(null), te(), A(), ze();
  }
  function Ft() {
    dt(), ne(), We(), _();
  }
  function Pt() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function Ee() {
    return Pt() === R;
  }
  function _t() {
    const e = R.requestFullscreen || R.webkitRequestFullscreen;
    if (e)
      try {
        const t = e.call(R);
        t && t.catch && t.catch(() => {
        });
      } catch {
      }
  }
  function Ht() {
    const e = document.exitFullscreen || document.webkitExitFullscreen;
    if (e && Pt())
      try {
        e.call(document);
      } catch {
      }
  }
  function Je(e) {
    const t = e == null ? !Ee() : !!e;
    return t ? _t() : Ht(), t;
  }
  function qt() {
    const e = Ee();
    R.classList.toggle("loc-fullscreen", e), F && (F.title = e ? "Exit fullscreen" : "Fullscreen"), q(), _(), b("fullscreen-change", { fullscreen: e });
  }
  N(we, "pointerdown", (e) => {
    const t = e.target.closest(".loc-node");
    t && gn(e, t.dataset.id);
  }), N(we, "click", (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !r.readonly) {
      rt(t.closest(".loc-node").dataset.id);
      return;
    }
    const n = e.target.closest(".loc-node");
    n && b("node-click", { id: n.dataset.id, node: g[n.dataset.id] });
  }), N(fe, "pointerdown", (e) => {
    const t = e.target.closest("path");
    t && (e.stopPropagation(), St(t.dataset.edge));
  }), N(fe, "dblclick", (e) => {
    if (r.readonly || !i.editMode) return;
    const t = e.target.closest("path");
    if (!t) return;
    const n = t.dataset.edge;
    St(n);
    const o = yt(n);
    if (!o) return;
    const s = Re(Ie(e.clientX, e.clientY));
    (x[n] || (x[n] = [])).splice(wn(o, s), 0, s), ee(n), J(), M();
  }), N(j, "pointerdown", (e) => {
    if (r.readonly || !i.editMode) return;
    const t = e.target, n = i.selectedEdgeId;
    if (!n) return;
    if (t.dataset.ep) {
      e.stopPropagation(), e.preventDefault(), G = { id: n, kind: "ep", which: t.dataset.ep }, K("pointermove", Mt), K("pointerup", It);
      return;
    }
    let o;
    if (t.dataset.wp != null) o = +t.dataset.wp;
    else if (t.dataset.add != null) {
      const s = +t.dataset.add;
      (x[n] || (x[n] = [])).splice(s, 0, Re(Ie(e.clientX, e.clientY))), o = s, ee(n);
    } else return;
    e.stopPropagation(), e.preventDefault(), G = { id: n, idx: o }, K("pointermove", Ut), K("pointerup", Vt);
  }), N(j, "dblclick", (e) => {
    const t = e.target;
    if (t.dataset.ep === "parent") {
      Ye(i.selectedEdgeId);
      return;
    }
    if (t.dataset.wp == null) return;
    const n = i.selectedEdgeId, o = x[n];
    o && (o.splice(+t.dataset.wp, 1), o.length || delete x[n], ee(n), J(), M());
  });
  function Ut(e) {
    if (!G) return;
    const t = x[G.id];
    t && (t[G.idx] = bn(G.id, Re(Ie(e.clientX, e.clientY))), ee(G.id), J());
  }
  function Vt() {
    G = null, ht(), Z("pointermove", Ut), Z("pointerup", Vt), M();
  }
  N(k, "click", (e) => {
    if (e.target.closest('[data-role="panel-close"]')) {
      ne();
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
      Et(i.selectedNodeId);
      return;
    }
  }), N(Ne, "input", (e) => {
    if (!i.editMode) return;
    const t = e.target.closest("[data-field]");
    if (!t) return;
    const n = i.selectedNodeId;
    if (!n) return;
    const o = t.dataset.field;
    let s = t.value;
    if (o === "type") {
      re(n, { type: s }), Fe();
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
  }), N(P, "click", (e) => {
    if (e.target.closest('[data-role="settings-close"]')) {
      He(!1);
      return;
    }
    if (e.target.closest('[data-role="reset-settings"]')) {
      Ct();
      return;
    }
    if (e.target.closest('[data-role="tgt-portrait"]')) {
      Nt(3, 4);
      return;
    }
    if (e.target.closest('[data-role="tgt-landscape"]')) {
      Nt(4, 3);
      return;
    }
    if (e.target.closest('[data-role="add-rule"]')) {
      z.push(ye({ field: "type", value: "", style: {} })), be(), Ae(), M(), b("settings-change", H());
      return;
    }
    const t = e.target.closest('[data-rk="remove"]');
    t && (z.splice(+t.dataset.rule, 1), be(), Ae(), M(), b("settings-change", H()));
  }), N(W, "input", (e) => {
    const t = e.target;
    if (t.dataset.set != null) {
      const n = parseFloat(t.value);
      i[t.dataset.set] = n;
      const o = W.querySelector(`[data-rangelabel="${t.dataset.set}"]`);
      o && (o.textContent = n), A(), b("settings-change", H()), M();
      return;
    }
    if (t.dataset.tgt != null) {
      const n = +(W.querySelector('[data-tgt="width"]') || {}).value || 0, o = +(W.querySelector('[data-tgt="height"]') || {}).value || 0;
      n > 0 && o > 0 && (ce("targetSize", { width: n, height: o }), A(), _(), M());
      return;
    }
    if (t.dataset.rule != null) {
      const n = +t.dataset.rule, o = t.dataset.rk, s = z[n];
      if (!s) return;
      if (o === "enabled") s.enabled = t.checked;
      else if (o === "field") s.field = t.value;
      else if (o === "value") s.value = t.value;
      else if (o === "bg" || o === "text" || o === "border")
        An(n, o) && (s.style[o] = t.value);
      else if (/-on$/.test(o)) {
        const l = o.replace("-on", "");
        s.style[l] = t.checked ? En(n, l) || "#e0524d" : "";
      }
      Ae(), b("settings-change", H()), M();
    }
  }), N(L, "pointerdown", (e) => {
    if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn"))
      return;
    const t = () => {
      i.selectedNodeId && (u[i.selectedNodeId] && u[i.selectedNodeId].classList.remove("loc-selected"), i.selectedNodeId = null), i.selectedEdgeId && te(), ne();
    };
    if (!r.enablePan) {
      t();
      return;
    }
    const n = e.clientX, o = e.clientY, s = i.panX, l = i.panY;
    let a = !1;
    L.classList.add("loc-panning");
    const c = (d) => {
      !a && Math.abs(d.clientX - n) + Math.abs(d.clientY - o) > 3 && (a = !0), i.panX = s + (d.clientX - n), i.panY = l + (d.clientY - o), he();
    }, f = () => {
      L.classList.remove("loc-panning"), Z("pointermove", c), Z("pointerup", f), a || t();
    };
    K("pointermove", c), K("pointerup", f);
  }), N(L, "wheel", (e) => {
    if (!r.enableZoom) return;
    e.preventDefault();
    const t = L.getBoundingClientRect(), n = e.clientX - t.left, o = e.clientY - t.top, s = e.deltaY < 0 ? 1.1 : 1 / 1.1, l = Math.min(3, Math.max(0.15, i.zoom * s));
    i.panX = n - (n - i.panX) * (l / i.zoom), i.panY = o - (o - i.panY) * (l / i.zoom), i.zoom = l, he();
  }, { passive: !1 });
  function K(e, t) {
    window.addEventListener(e, t), Se.push({ target: window, type: e, fn: t });
  }
  function Z(e, t) {
    window.removeEventListener(e, t);
  }
  function jn() {
    const e = r.toolbar && typeof r.toolbar == "object" ? r.toolbar : {}, t = (a) => e[a] !== !1, n = C("div", "loc-toolbar");
    let o = "";
    return t("subtree") && (o += s("Subtree", ["Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Custom"].map((a) => l("mode", a, a)).join(""))), t("orient") && (o += s("Orient", [["TopToBottom", "Top"], ["BottomToTop", "Bottom"], ["LeftToRight", "Left"], ["RightToLeft", "Right"]].map(([a, c]) => l("orient", a, c)).join(""))), t("actions") && (o += s("", '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button><button data-act="reset">Reset</button><button data-act="fullscreen" title="Toggle fullscreen">Fullscreen</button>')), t("search") && (o += s("Search", '<input type="search" data-role="search" class="loc-search-input" placeholder="Search…" />')), t("grid") && (o += s("Grid", '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>')), t("mode") && (o += s("Mode", '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="settings" title="Settings &amp; theming">Settings</button>')), t("export") && (o += s("Export", '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>')), n.innerHTML = o, n.addEventListener("click", (a) => {
      const c = a.target.closest("button");
      if (c)
        if (c.dataset.mode) Dt(c.dataset.mode);
        else if (c.dataset.orient) Yt(c.dataset.orient);
        else if (c.dataset.flag)
          i[c.dataset.flag] = !i[c.dataset.flag], c.dataset.flag === "showGrid" ? Me() : c.dataset.flag === "alignGrid" && (p = /* @__PURE__ */ Object.create(null), A()), q(), M();
        else switch (c.dataset.act) {
          case "expand":
            lt();
            break;
          case "collapse":
            at();
            break;
          case "fit":
            _();
            break;
          case "relayout":
            We();
            break;
          case "reset":
            Ft();
            break;
          case "fullscreen":
            Je();
            break;
          case "edit":
            Lt(!i.editMode);
            break;
          case "settings":
            He();
            break;
          case "png":
            jt(3);
            break;
          case "svg":
            Rt();
            break;
          case "pdf":
            kt();
            break;
          case "json":
            zt(!0);
            break;
        }
    }), n.addEventListener("input", (a) => {
      const c = a.target.closest('[data-role="search"]');
      c && ct(c.value);
    }), n;
    function s(a, c) {
      return `<div class="loc-group">${a ? `<span class="loc-label">${a}</span>` : ""}${c}</div>`;
    }
    function l(a, c, f) {
      return `<button data-${a}="${c}">${f}</button>`;
    }
  }
  function q() {
    D && (D.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === i.subtreeMode)), D.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === i.orientation)), D.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!i[e.dataset.flag])), D.querySelectorAll('button[data-act="edit"]').forEach((e) => e.classList.toggle("loc-active", i.editMode)), D.querySelectorAll('button[data-act="fullscreen"]').forEach((e) => e.classList.toggle("loc-active", Ee())));
  }
  N(document, "fullscreenchange", qt), N(document, "webkitfullscreenchange", qt), On(), q(), Me(), De(), A(), r.fitOnInit && _();
  let Wt = !1;
  function kn() {
    if (!Wt) {
      Wt = !0, Se.forEach(({ target: e, type: t, fn: n, optsL: o }) => e.removeEventListener(t, n, o)), Se.length = 0, ue && cancelAnimationFrame(ue), R.remove();
      for (const e in u) delete u[e];
      for (const e in w) delete w[e];
      for (const e in $) delete $[e];
    }
  }
  const Ke = {
    root: R,
    setNodes: Xt,
    loadJSON: Nn,
    setOrientation: Yt,
    setSubtreeMode: Dt,
    setSpacing: Cn,
    setOption: ce,
    setShowGrid: Bt,
    setSnapToGrid: zn,
    setAlignToGrid: $n,
    toggleGrid: Rn,
    fitToScreen: _,
    relayout: We,
    resetView: Ft,
    expandAll: lt,
    collapseAll: at,
    toggleCollapse: rt,
    centerOnNode: Ce,
    search: ct,
    clearSearch: dt,
    exportJSON: zt,
    exportSVG: Rt,
    exportPNG: jt,
    exportPDF: kt,
    buildSVG: me,
    setEditMode: Lt,
    isEditMode: () => i.editMode,
    enterFullscreen: _t,
    exitFullscreen: Ht,
    toggleFullscreen: Je,
    isFullscreen: Ee,
    updateNode: re,
    addChild: At,
    deleteNode: Et,
    reparentNode: Xe,
    detachNode: Ye,
    openInspector: Be,
    closeInspector: ne,
    nodeScreenRect: mt,
    getSettings: H,
    setSettings: Gt,
    toggleSettings: He,
    resetSettings: Ct,
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (e) => u[e] || null,
    getNodeSlotEl: (e) => u[e] ? u[e].querySelector(".loc-node-slot") : null,
    getInspectorBody: () => Ne,
    getSettingsBody: () => W,
    nodeThemeStyle: (e) => g[e] ? Qt(g[e], z) : null,
    getState: () => ({ ...i }),
    getNodes: () => y.map((e) => ({ ...e })),
    getPositioned: () => E,
    on: nn,
    off: on,
    destroy: kn
  };
  return Ke;
}
export {
  oo as CANVAS_PAD,
  io as DEFAULTS,
  so as DEFAULT_SETTINGS,
  lo as DEPT_SIZE,
  ao as ORIENTATIONS,
  ro as POS_SIZE,
  co as SNAKE_STUB,
  uo as SUBTREE_MODES,
  fo as VIRTUAL_ROOT_ID,
  po as applyOrientation,
  Fn as buildChartSVG,
  go as buildTree,
  Kt as calculateBounds,
  Zt as childCount,
  Dn as computeDepths,
  ho as convertMoTree,
  bo as convertNestedTree,
  eo as createOrgChart,
  Un as edgeControlPoints,
  mo as edgeEndpoints,
  Y as effCenter,
  Xn as exportLayout,
  Yn as fitBounds,
  yo as getVisibleTree,
  Te as indexNodes,
  Vn as isHorizontal,
  vo as isMoArray,
  _n as layoutOrgChart,
  So as lh,
  wo as lw,
  Oe as makeNode,
  Hn as normalizeConfig,
  Pn as normalizeImported,
  ye as normalizeRule,
  xo as normalizeSettings,
  Wn as orthoThrough,
  Mo as personNameFromPos,
  Qt as resolveNodeStyle,
  qn as routeConnector,
  Bn as searchNodes,
  Io as visibleDepths,
  Lo as waypointPath
};
