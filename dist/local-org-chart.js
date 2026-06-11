import { makeNode as At, indexNodes as zt, exportLayout as ce, calculateBounds as Tt, fitBounds as de, computeDepths as le, childCount as Xt, buildChartSVG as ue, searchNodes as fe, effCenter as B, normalizeImported as pe, layoutOrgChart as ge, routeConnector as Yt, normalizeConfig as he, edgeControlPoints as me, edgeEndpoints as be } from "./core.js";
import { CANVAS_PAD as Ee, DEFAULTS as Oe, DEPT_SIZE as Ne, ORIENTATIONS as Le, POS_SIZE as Me, SNAKE_STUB as Ce, SUBTREE_MODES as Ge, VIRTUAL_ROOT_ID as Ae, applyOrientation as ze, buildTree as Te, convertMoTree as Xe, convertNestedTree as Ye, getVisibleTree as je, isHorizontal as Pe, isMoArray as De, lh as Re, lw as Be, orthoThrough as ke, personNameFromPos as Ue, visibleDepths as He, waypointPath as _e } from "./core.js";
const V = "http://www.w3.org/2000/svg", ye = 0.5, we = {
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
  fitOnInit: !0,
  toolbar: !0,
  persist: !1,
  storageKey: "local-org-chart.state"
};
function xe(Q, jt = {}) {
  if (!Q || !Q.appendChild) throw new Error("createOrgChart: first argument must be a DOM element.");
  const c = Object.assign({}, we, jt), o = {
    orientation: c.orientation,
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
    alignGrid: c.alignGrid
  };
  let g = (c.nodes || []).map(At), S = zt(g), r = /* @__PURE__ */ Object.create(null), p = /* @__PURE__ */ Object.create(null), m = [], y = /* @__PURE__ */ Object.create(null);
  const l = /* @__PURE__ */ Object.create(null), u = /* @__PURE__ */ Object.create(null), b = /* @__PURE__ */ Object.create(null);
  let L = null, f = null, k = 0, x = /* @__PURE__ */ new Set();
  const J = [], G = /* @__PURE__ */ Object.create(null);
  function Pt(t, e) {
    return (G[t] || (G[t] = [])).push(e), rt;
  }
  function Dt(t, e) {
    return G[t] && (G[t] = G[t].filter((n) => n !== e)), rt;
  }
  function I(t, e) {
    (G[t] || []).forEach((n) => {
      try {
        n(e);
      } catch {
      }
    });
  }
  function E(t, e, n, i) {
    t.addEventListener(e, n, i), J.push({ target: t, type: e, fn: n, optsL: i });
  }
  const A = document.createElement("div");
  A.className = "loc-root";
  const z = c.toolbar ? ae() : null;
  z && A.appendChild(z);
  const h = N("div", "loc-canvas"), T = N("div", "loc-content"), U = N("div", "loc-grid"), X = document.createElementNS(V, "svg");
  X.setAttribute("class", "loc-connectors");
  const H = document.createElementNS(V, "g");
  H.setAttribute("class", "loc-edgehits"), X.appendChild(H);
  const K = N("div", "loc-nodes"), _ = document.createElementNS(V, "svg");
  _.setAttribute("class", "loc-overlay");
  const O = document.createElementNS(V, "g");
  O.setAttribute("class", "loc-edgehandles"), _.appendChild(O);
  const tt = N("div", "loc-zoomreadout");
  tt.textContent = "100%", T.appendChild(U), T.appendChild(X), T.appendChild(K), T.appendChild(_), h.appendChild(T), h.appendChild(tt), A.appendChild(h), Q.appendChild(A);
  function N(t, e) {
    const n = document.createElement(t);
    return e && (n.className = e), n;
  }
  function $() {
    return he({
      orientation: o.orientation,
      subtreeMode: o.subtreeMode,
      spacingX: o.spacingX,
      spacingY: o.spacingY,
      gridSize: o.gridSize,
      alignGrid: o.alignGrid
    });
  }
  function Rt() {
    const t = ge(g, $());
    m = t.positioned, y = t.posById;
  }
  function w() {
    Rt(), $t(), _t(), Bt(), q(), ot(), C(), I("layout-change", { positioned: m, mode: o.subtreeMode, orientation: o.orientation });
  }
  function Bt() {
    const t = /* @__PURE__ */ Object.create(null);
    for (const e of m) {
      const n = e.node;
      t[n.id] = !0;
      let i = l[n.id];
      i || (i = kt(n), l[n.id] = i, K.appendChild(i)), i.style.width = n.width + "px", i.style.height = n.height + "px";
      const s = B(e, r);
      i.style.transform = `translate(${s.x - n.width / 2}px, ${s.y - n.height / 2}px)`, i.dataset.fitted || (Ut(i), i.dataset.fitted = "1"), i.classList.toggle("loc-selected", o.selectedNodeId === n.id), Ht(i, n);
    }
    for (const e in l) t[e] || (l[e].remove(), delete l[e]);
  }
  function kt(t) {
    const e = N("div", "loc-node loc-" + t.type + (t.status ? " loc-status-" + t.status : ""));
    if (e.dataset.id = t.id, t.type === "department") {
      e.innerHTML = '<span class="loc-lbl"></span>', e.querySelector(".loc-lbl").textContent = t.label;
      const n = N("div", "loc-toggle");
      n.dataset.role = "toggle", e.appendChild(n);
    } else {
      e.innerHTML = '<div class="loc-photo"></div><div class="loc-ptext"><div class="loc-pname"></div><div class="loc-ptitle"></div><div class="loc-badge"></div></div>';
      const n = e.querySelector(".loc-photo"), i = t.data && t.data.photo_url;
      if (i) {
        const a = new Image();
        a.alt = "", a.referrerPolicy = "no-referrer", a.onerror = () => {
          n.textContent = "●";
        }, a.src = i, n.appendChild(a);
      } else
        n.textContent = "●";
      e.querySelector(".loc-pname").textContent = t.personName || "—", e.querySelector(".loc-ptitle").textContent = t.label;
      const s = e.querySelector(".loc-badge");
      t.status ? (s.textContent = t.status, s.className = "loc-badge loc-" + t.status) : s.remove();
    }
    return e;
  }
  function dt(t) {
    return t.scrollWidth > t.clientWidth + 0.5 || t.scrollHeight > t.clientHeight + 0.5;
  }
  function Ut(t) {
    if (t.style.setProperty("--loc-fit", "1"), !dt(t)) return;
    let e = ye, n = 1;
    for (let i = 0; i < 7; i++) {
      const s = (e + n) / 2;
      t.style.setProperty("--loc-fit", String(s)), dt(t) ? n = s : e = s;
    }
    t.style.setProperty("--loc-fit", String(e));
  }
  function Ht(t, e) {
    const n = t.querySelector('[data-role="toggle"]');
    if (!n) return;
    const i = Xt(g, e.id) > 0;
    n.style.display = i ? "flex" : "none", n.textContent = e.collapsed ? "⊞" : "⊟";
  }
  function et(t) {
    return document.createElementNS(V, t);
  }
  function _t() {
    const t = /* @__PURE__ */ Object.create(null);
    for (const e of m) {
      const n = e.node;
      if (!n.parentId) continue;
      const i = y[n.parentId];
      if (!i) continue;
      t[n.id] = !0;
      const s = Yt(i, e, $(), r, p);
      let a = u[n.id];
      a || (a = et("path"), u[n.id] = a, X.appendChild(a)), a.setAttribute("d", s), a.classList.toggle("loc-sel", o.selectedEdgeId === n.id);
      let d = b[n.id];
      d || (d = et("path"), d.dataset.edge = n.id, b[n.id] = d, H.appendChild(d)), d.setAttribute("d", s);
    }
    for (const e in u) t[e] || (u[e].remove(), delete u[e]);
    for (const e in b) t[e] || (b[e].remove(), delete b[e]);
    o.selectedEdgeId && !t[o.selectedEdgeId] ? j() : M();
  }
  function Y(t) {
    const e = y[t];
    if (!e) return;
    const n = y[e.node.parentId];
    if (!n) return;
    const i = Yt(n, e, $(), r, p);
    u[t] && u[t].setAttribute("d", i), b[t] && b[t].setAttribute("d", i);
  }
  function q() {
    T.style.transform = `translate(${o.panX}px, ${o.panY}px) scale(${o.zoom})`, tt.textContent = Math.round(o.zoom * 100) + "%", o.selectedEdgeId && !L && M(), C();
  }
  function $t() {
    let t = 0, e = 0;
    for (const n of m) {
      const i = B(n, r);
      t = Math.max(t, i.x + n.node.width / 2 + 80), e = Math.max(e, i.y + n.node.height / 2 + 80);
    }
    X.setAttribute("width", t), X.setAttribute("height", e), _.setAttribute("width", t), _.setAttribute("height", e), U.style.width = t + "px", U.style.height = e + "px", U.style.backgroundSize = o.gridSize + "px " + o.gridSize + "px";
  }
  function nt() {
    U.classList.toggle("loc-on", o.showGrid), h.classList.toggle("loc-gridon", o.showGrid);
  }
  function Z() {
    if (!m.length) return;
    const t = Tt(m, r, 0), e = de(t, h.clientWidth, h.clientHeight);
    o.zoom = e.zoom, o.panX = e.panX, o.panY = e.panY, q();
  }
  function lt(t) {
    const e = y[t];
    if (!e) return;
    const n = B(e, r);
    o.panX = h.clientWidth / 2 - n.x * o.zoom, o.panY = h.clientHeight / 2 - n.y * o.zoom, q();
  }
  function ut() {
    for (const t of g) t.collapsed = !1;
    w();
  }
  function ft() {
    const t = le(g, S);
    for (const e of g) e.collapsed = t[e.id] >= 1 && Xt(g, e.id) > 0;
    w();
  }
  function pt(t) {
    const e = S[t];
    e && (e.collapsed = !e.collapsed, w());
  }
  function qt(t) {
    if (x = fe(g, t), ot(), x.size) {
      const e = m.find((n) => x.has(n.node.id));
      e && lt(e.node.id);
    }
    return x.size;
  }
  function Ft() {
    x = /* @__PURE__ */ new Set(), ot();
  }
  function ot() {
    const t = x.size > 0;
    for (const e of m) {
      const n = l[e.node.id];
      if (!n) continue;
      const i = x.has(e.node.id);
      n.classList.toggle("loc-highlight", t && i), n.classList.toggle("loc-dim", t && !i);
    }
    for (const e in u) u[e].classList.toggle("loc-hl", t && x.has(e));
  }
  function Wt(t, e) {
    if (t.target.closest('[data-role="toggle"]') || (t.stopPropagation(), j(), Kt(e), I("node-select", { id: e, node: S[e] }), c.readonly || !c.enableDragging)) return;
    const n = r[e] || { dx: 0, dy: 0 };
    f = { id: e, startX: t.clientX, startY: t.clientY, baseDx: n.dx, baseDy: n.dy, moved: !1 }, l[e].classList.add("loc-dragging"), I("node-drag-start", { id: e, node: S[e] }), P("pointermove", gt), P("pointerup", ht);
  }
  function gt(t) {
    if (!f) return;
    let e = f.baseDx + (t.clientX - f.startX) / o.zoom, n = f.baseDy + (t.clientY - f.startY) / o.zoom;
    if (Math.abs(t.clientX - f.startX) + Math.abs(t.clientY - f.startY) > 3 && (f.moved = !0), o.snapGrid) {
      const i = o.gridSize, s = y[f.id];
      s && (e = Math.round((s.cx + e) / i) * i - s.cx, n = Math.round((s.cy + n) / i) * i - s.cy);
    }
    r[f.id] = { dx: e, dy: n }, k || (k = requestAnimationFrame(() => {
      k = 0, Vt(f.id), Jt(f.id), I("node-drag", { id: f.id, node: S[f.id], offset: r[f.id] });
    }));
  }
  function ht() {
    if (f) {
      const t = l[f.id];
      t && t.classList.remove("loc-dragging"), I("node-drag-end", { id: f.id, node: S[f.id], offset: r[f.id] });
    }
    f = null, D("pointermove", gt), D("pointerup", ht), C();
  }
  function Vt(t) {
    const e = y[t], n = l[t];
    if (!e || !n) return;
    const i = B(e, r);
    n.style.transform = `translate(${i.x - e.node.width / 2}px, ${i.y - e.node.height / 2}px)`;
  }
  function Jt(t) {
    const e = y[t];
    if (e) {
      y[e.node.parentId] && Y(t);
      for (const n of m) n.node.parentId === t && Y(n.node.id);
      o.selectedEdgeId && M();
    }
  }
  function Kt(t) {
    o.selectedNodeId && l[o.selectedNodeId] && l[o.selectedNodeId].classList.remove("loc-selected"), o.selectedNodeId = t, l[t] && l[t].classList.add("loc-selected");
  }
  function it(t, e) {
    const n = h.getBoundingClientRect();
    return { x: (t - n.left - o.panX) / o.zoom, y: (e - n.top - o.panY) / o.zoom };
  }
  function st(t) {
    if (o.snapGrid) {
      const e = o.gridSize;
      return { x: Math.round(t.x / e) * e, y: Math.round(t.y / e) * e };
    }
    return { x: t.x, y: t.y };
  }
  function mt(t) {
    const e = y[t];
    if (!e) return null;
    const n = y[e.node.parentId];
    if (!n) return null;
    const i = p[t] || [];
    if (i.length) return me(n, e, i, $(), r);
    const { S: s, E: a } = be(n, e, B(e, r), B(n, r), $(), r);
    return [s, a];
  }
  function bt(t) {
    o.selectedEdgeId && u[o.selectedEdgeId] && u[o.selectedEdgeId].classList.remove("loc-sel"), o.selectedNodeId && l[o.selectedNodeId] && l[o.selectedNodeId].classList.remove("loc-selected"), o.selectedNodeId = null, o.selectedEdgeId = t, u[t] && u[t].classList.add("loc-sel"), M();
  }
  function j() {
    o.selectedEdgeId && u[o.selectedEdgeId] && u[o.selectedEdgeId].classList.remove("loc-sel"), o.selectedEdgeId = null, O.innerHTML = "";
  }
  function yt(t, e, n, i) {
    const s = et("circle");
    return s.setAttribute("cx", t), s.setAttribute("cy", e), s.setAttribute("r", n), s.setAttribute("class", i), s;
  }
  function M() {
    O.innerHTML = "";
    const t = o.selectedEdgeId;
    if (!t || c.readonly) return;
    const e = mt(t);
    if (!e) return;
    const n = p[t] || [], i = 6 / o.zoom, s = 5 / o.zoom;
    for (let a = 0; a < e.length - 1; a++) {
      const d = e[a], v = e[a + 1], W = yt((d.x + v.x) / 2, (d.y + v.y) / 2, s, "loc-wp-add");
      W.dataset.add = a, O.appendChild(W);
    }
    for (let a = 0; a < n.length; a++) {
      const d = yt(n[a].x, n[a].y, i, "loc-wp-handle");
      d.dataset.wp = a, O.appendChild(d);
    }
  }
  function Zt(t, e, n) {
    const i = n.x - e.x, s = n.y - e.y, a = i * i + s * s;
    let d = a ? ((t.x - e.x) * i + (t.y - e.y) * s) / a : 0;
    return d = Math.max(0, Math.min(1, d)), Math.hypot(t.x - (e.x + d * i), t.y - (e.y + d * s));
  }
  function Qt(t, e) {
    let n = 0, i = 1 / 0;
    for (let s = 0; s < t.length - 1; s++) {
      const a = Zt(e, t[s], t[s + 1]);
      a < i && (i = a, n = s);
    }
    return n;
  }
  function C() {
    if (c.persist)
      try {
        localStorage.setItem(c.storageKey, JSON.stringify({
          orientation: o.orientation,
          subtreeMode: o.subtreeMode,
          spacingX: o.spacingX,
          spacingY: o.spacingY,
          zoom: o.zoom,
          panX: o.panX,
          panY: o.panY,
          showGrid: o.showGrid,
          snapGrid: o.snapGrid,
          alignGrid: o.alignGrid,
          gridSize: o.gridSize,
          manualOffsets: r,
          edgeWaypoints: p,
          collapsed: g.filter((t) => t.collapsed).map((t) => t.id)
        }));
      } catch {
      }
  }
  function te() {
    if (!c.persist) return;
    let t;
    try {
      t = JSON.parse(localStorage.getItem(c.storageKey) || "null");
    } catch {
      t = null;
    }
    if (t && (t.orientation && (o.orientation = t.orientation), t.subtreeMode && (o.subtreeMode = t.subtreeMode), ["spacingX", "spacingY", "zoom", "panX", "panY", "gridSize"].forEach((e) => {
      typeof t[e] == "number" && (o[e] = t[e]);
    }), o.showGrid = !!t.showGrid, o.snapGrid = !!t.snapGrid, o.alignGrid = !!t.alignGrid, t.manualOffsets && (r = t.manualOffsets), t.edgeWaypoints && (p = t.edgeWaypoints), Array.isArray(t.collapsed))) {
      const e = new Set(t.collapsed);
      for (const n of g) n.collapsed = e.has(n.id);
    }
  }
  function wt(t) {
    const e = ce(o, g, r, p);
    return t !== !1 && at(new Blob([JSON.stringify(e, null, 2)], { type: "application/json" }), "org-chart-layout.json"), e;
  }
  const vt = document.createElement("canvas").getContext("2d");
  function ee(t, e) {
    return vt.font = e, vt.measureText(t).width;
  }
  function ne(t) {
    const e = l[t.id];
    if (!e) return 1;
    const n = parseFloat(e.style.getPropertyValue("--loc-fit"));
    return isFinite(n) && n > 0 ? n : 1;
  }
  function F(t) {
    const e = [];
    for (const n in u) e.push(u[n].getAttribute("d"));
    return ue(m, e, { manualOffsets: r, raster: !!t, measureText: ee, fitOf: ne });
  }
  function xt() {
    return at(new Blob([F(!1)], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), F(!1);
  }
  function St(t) {
    t = t || 3;
    const e = Tt(m, r, 40), n = 16e3, i = 2e8;
    let s = Math.min(t, n / e.w, n / e.h);
    e.w * s * e.h * s > i && (s = Math.sqrt(i / (e.w * e.h))), s = Math.max(0.05, s);
    const a = URL.createObjectURL(new Blob([F(!0)], { type: "image/svg+xml;charset=utf-8" })), d = new Image();
    d.onload = () => {
      const v = document.createElement("canvas");
      v.width = Math.round(e.w * s), v.height = Math.round(e.h * s);
      const W = v.getContext("2d");
      W.setTransform(s, 0, 0, s, 0, 0), W.drawImage(d, 0, 0), URL.revokeObjectURL(a);
      try {
        v.toBlob((ct) => {
          ct && at(ct, "org-chart.png");
        }, "image/png");
      } catch {
      }
    }, d.onerror = () => URL.revokeObjectURL(a), d.src = a;
  }
  function It() {
    const t = window.open("", "_blank");
    t && (t.document.open(), t.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + F(!1) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), t.document.close());
  }
  function at(t, e) {
    const n = URL.createObjectURL(t), i = document.createElement("a");
    i.href = n, i.download = e, document.body.appendChild(i), i.click(), i.remove(), URL.revokeObjectURL(n);
  }
  function Et(t, e) {
    g = (t || []).map(At), S = zt(g), r = /* @__PURE__ */ Object.create(null), p = /* @__PURE__ */ Object.create(null), o.selectedNodeId = null, o.selectedEdgeId = null, x = /* @__PURE__ */ new Set();
    for (const n in l)
      l[n].remove(), delete l[n];
    for (const n in u)
      u[n].remove(), delete u[n];
    for (const n in b)
      b[n].remove(), delete b[n];
    e && (e.subtreeMode && (o.subtreeMode = e.subtreeMode), e.orientation && (o.orientation = e.orientation), e.manualOffsets && (r = e.manualOffsets), e.edgeWaypoints && (p = e.edgeWaypoints)), R(), w(), c.fitOnInit && Z();
  }
  function oe(t) {
    const { nodes: e, meta: n } = pe(t);
    return Et(e, n), e.length;
  }
  function Ot(t) {
    o.orientation = t, r = /* @__PURE__ */ Object.create(null), p = /* @__PURE__ */ Object.create(null), j(), R(), w(), I("orientation-change", { orientation: t });
  }
  function Nt(t) {
    o.subtreeMode = t, r = /* @__PURE__ */ Object.create(null), p = /* @__PURE__ */ Object.create(null), j(), R(), w(), I("subtree-mode-change", { subtreeMode: t });
  }
  function ie(t, e) {
    t != null && (o.spacingX = t), e != null && (o.spacingY = e), w();
  }
  function se(t, e) {
    t in o ? (o[t] = e, t === "showGrid" && nt(), t === "alignGrid" && (r = /* @__PURE__ */ Object.create(null), w()), R()) : c[t] = e;
  }
  function Lt() {
    r = /* @__PURE__ */ Object.create(null), p = /* @__PURE__ */ Object.create(null), j(), w();
  }
  E(K, "pointerdown", (t) => {
    const e = t.target.closest(".loc-node");
    e && Wt(t, e.dataset.id);
  }), E(K, "click", (t) => {
    const e = t.target.closest('[data-role="toggle"]');
    if (e && !c.readonly) {
      pt(e.closest(".loc-node").dataset.id);
      return;
    }
    const n = t.target.closest(".loc-node");
    n && I("node-click", { id: n.dataset.id, node: S[n.dataset.id] });
  }), E(H, "pointerdown", (t) => {
    const e = t.target.closest("path");
    e && (t.stopPropagation(), bt(e.dataset.edge));
  }), E(H, "dblclick", (t) => {
    if (c.readonly) return;
    const e = t.target.closest("path");
    if (!e) return;
    const n = e.dataset.edge;
    bt(n);
    const i = mt(n);
    if (!i) return;
    const s = st(it(t.clientX, t.clientY));
    (p[n] || (p[n] = [])).splice(Qt(i, s), 0, s), Y(n), M(), C();
  }), E(O, "pointerdown", (t) => {
    if (c.readonly) return;
    const e = t.target, n = o.selectedEdgeId;
    if (!n) return;
    let i;
    if (e.dataset.wp != null) i = +e.dataset.wp;
    else if (e.dataset.add != null) {
      const s = +e.dataset.add;
      (p[n] || (p[n] = [])).splice(s, 0, st(it(t.clientX, t.clientY))), i = s, Y(n);
    } else return;
    t.stopPropagation(), t.preventDefault(), L = { id: n, idx: i }, P("pointermove", Mt), P("pointerup", Ct);
  }), E(O, "dblclick", (t) => {
    const e = t.target;
    if (e.dataset.wp == null) return;
    const n = o.selectedEdgeId, i = p[n];
    i && (i.splice(+e.dataset.wp, 1), i.length || delete p[n], Y(n), M(), C());
  });
  function Mt(t) {
    if (!L) return;
    const e = p[L.id];
    e && (e[L.idx] = st(it(t.clientX, t.clientY)), Y(L.id), M());
  }
  function Ct() {
    L = null, D("pointermove", Mt), D("pointerup", Ct), C();
  }
  E(h, "pointerdown", (t) => {
    if (!(t.target.closest(".loc-node") || t.target.closest(".loc-edgehits path") || t.target.closest(".loc-edgehandles *"))) {
      if (o.selectedNodeId && (l[o.selectedNodeId] && l[o.selectedNodeId].classList.remove("loc-selected"), o.selectedNodeId = null), o.selectedEdgeId && j(), !c.enablePan) return;
      h.classList.add("loc-panning");
      const e = t.clientX, n = t.clientY, i = o.panX, s = o.panY, a = (v) => {
        o.panX = i + (v.clientX - e), o.panY = s + (v.clientY - n), q();
      }, d = () => {
        h.classList.remove("loc-panning"), D("pointermove", a), D("pointerup", d);
      };
      P("pointermove", a), P("pointerup", d);
    }
  }), E(h, "wheel", (t) => {
    if (!c.enableZoom) return;
    t.preventDefault();
    const e = h.getBoundingClientRect(), n = t.clientX - e.left, i = t.clientY - e.top, s = t.deltaY < 0 ? 1.1 : 1 / 1.1, a = Math.min(3, Math.max(0.15, o.zoom * s));
    o.panX = n - (n - o.panX) * (a / o.zoom), o.panY = i - (i - o.panY) * (a / o.zoom), o.zoom = a, q();
  }, { passive: !1 });
  function P(t, e) {
    window.addEventListener(t, e), J.push({ target: window, type: t, fn: e });
  }
  function D(t, e) {
    window.removeEventListener(t, e);
  }
  function ae() {
    const t = N("div", "loc-toolbar");
    return t.innerHTML = "" + e("Subtree", ["Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Matrix"].map((i) => n("mode", i, i)).join("")) + e("Orient", [["TopToBottom", "Top"], ["BottomToTop", "Bottom"], ["LeftToRight", "Left"], ["RightToLeft", "Right"]].map(([i, s]) => n("orient", i, s)).join("")) + e("", '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button>') + e("Grid", '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>') + e("Export", '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>'), t.addEventListener("click", (i) => {
      const s = i.target.closest("button");
      if (s)
        if (s.dataset.mode) Nt(s.dataset.mode);
        else if (s.dataset.orient) Ot(s.dataset.orient);
        else if (s.dataset.flag)
          o[s.dataset.flag] = !o[s.dataset.flag], s.dataset.flag === "showGrid" ? nt() : s.dataset.flag === "alignGrid" && (r = /* @__PURE__ */ Object.create(null), w()), R(), C();
        else switch (s.dataset.act) {
          case "expand":
            ut();
            break;
          case "collapse":
            ft();
            break;
          case "fit":
            Z();
            break;
          case "relayout":
            Lt();
            break;
          case "png":
            St(3);
            break;
          case "svg":
            xt();
            break;
          case "pdf":
            It();
            break;
          case "json":
            wt(!0);
            break;
        }
    }), t;
    function e(i, s) {
      return `<div class="loc-group">${i ? `<span class="loc-label">${i}</span>` : ""}${s}</div>`;
    }
    function n(i, s, a) {
      return `<button data-${i}="${s}">${a}</button>`;
    }
  }
  function R() {
    z && (z.querySelectorAll("button[data-mode]").forEach((t) => t.classList.toggle("loc-active", t.dataset.mode === o.subtreeMode)), z.querySelectorAll("button[data-orient]").forEach((t) => t.classList.toggle("loc-active", t.dataset.orient === o.orientation)), z.querySelectorAll("button[data-flag]").forEach((t) => t.classList.toggle("loc-active", !!o[t.dataset.flag])));
  }
  te(), R(), nt(), w(), c.fitOnInit && Z();
  let Gt = !1;
  function re() {
    if (!Gt) {
      Gt = !0, J.forEach(({ target: t, type: e, fn: n, optsL: i }) => t.removeEventListener(e, n, i)), J.length = 0, k && cancelAnimationFrame(k), A.remove();
      for (const t in l) delete l[t];
      for (const t in u) delete u[t];
      for (const t in b) delete b[t];
    }
  }
  const rt = {
    root: A,
    setNodes: Et,
    loadJSON: oe,
    setOrientation: Ot,
    setSubtreeMode: Nt,
    setSpacing: ie,
    setOption: se,
    fitToScreen: Z,
    relayout: Lt,
    expandAll: ut,
    collapseAll: ft,
    toggleCollapse: pt,
    centerOnNode: lt,
    search: qt,
    clearSearch: Ft,
    exportJSON: wt,
    exportSVG: xt,
    exportPNG: St,
    exportPDF: It,
    buildSVG: F,
    getState: () => ({ ...o }),
    getNodes: () => g.map((t) => ({ ...t })),
    getPositioned: () => m,
    on: Pt,
    off: Dt,
    destroy: re
  };
  return rt;
}
export {
  Ee as CANVAS_PAD,
  Oe as DEFAULTS,
  Ne as DEPT_SIZE,
  Le as ORIENTATIONS,
  Me as POS_SIZE,
  Ce as SNAKE_STUB,
  Ge as SUBTREE_MODES,
  Ae as VIRTUAL_ROOT_ID,
  ze as applyOrientation,
  ue as buildChartSVG,
  Te as buildTree,
  Tt as calculateBounds,
  Xt as childCount,
  le as computeDepths,
  Xe as convertMoTree,
  Ye as convertNestedTree,
  xe as createOrgChart,
  me as edgeControlPoints,
  be as edgeEndpoints,
  B as effCenter,
  ce as exportLayout,
  de as fitBounds,
  je as getVisibleTree,
  zt as indexNodes,
  Pe as isHorizontal,
  De as isMoArray,
  ge as layoutOrgChart,
  Re as lh,
  Be as lw,
  At as makeNode,
  he as normalizeConfig,
  pe as normalizeImported,
  ke as orthoThrough,
  Ue as personNameFromPos,
  Yt as routeConnector,
  fe as searchNodes,
  He as visibleDepths,
  _e as waypointPath
};
//# sourceMappingURL=local-org-chart.js.map
