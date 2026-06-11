import { makeNode as ve, indexNodes as Se, normalizeRule as re, exportLayout as an, calculateBounds as St, fitBounds as ln, computeDepths as rn, childCount as wt, resolveNodeStyle as Mt, buildChartSVG as dn, searchNodes as cn, effCenter as Q, normalizeImported as un, layoutOrgChart as pn, routeConnector as xt, normalizeConfig as fn, edgeControlPoints as gn } from "./core.js";
import { CANVAS_PAD as wn, DEFAULTS as Mn, DEFAULT_SETTINGS as xn, DEPT_SIZE as In, ORIENTATIONS as En, POS_SIZE as On, SNAKE_STUB as Ln, SUBTREE_MODES as An, VIRTUAL_ROOT_ID as Nn, applyOrientation as Tn, buildTree as Cn, convertMoTree as Gn, convertNestedTree as zn, edgeEndpoints as $n, getVisibleTree as jn, isHorizontal as Rn, isMoArray as Xn, lh as kn, lw as Yn, normalizeSettings as Dn, orthoThrough as _n, personNameFromPos as Bn, visibleDepths as Pn, waypointPath as Un } from "./core.js";
const de = "http://www.w3.org/2000/svg", hn = 0.5, bn = {
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
  // show the slide-in inspector panel on node click
  inspectorSlot: !1,
  // leave the inspector body empty for an external (Vue) slot
  nodeSlots: !1,
  // render empty positioned hosts (Vue teleports card content in)
  fitOnInit: !0,
  toolbar: !0,
  // true | false | { subtree, orient, actions, grid, mode, export }
  persist: !1,
  storageKey: "local-org-chart.state"
};
function yn(we, It = {}) {
  if (!we || !we.appendChild) throw new Error("createOrgChart: first argument must be a DOM element.");
  const d = Object.assign({}, bn, It), o = {
    orientation: d.orientation,
    subtreeMode: d.subtreeMode,
    spacingX: d.spacingX,
    spacingY: d.spacingY,
    zoom: 1,
    panX: 0,
    panY: 0,
    selectedNodeId: null,
    selectedEdgeId: null,
    gridSize: d.gridSize,
    showGrid: d.showGrid,
    snapGrid: d.snapGrid,
    alignGrid: d.alignGrid,
    editMode: !!d.editMode
  };
  let f = (d.nodes || []).map(ve), p = Se(f), u = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), M = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), C = (d.settings && d.settings.themeRules || d.themeRules || []).map(re), Et = 0, I = [], v = /* @__PURE__ */ Object.create(null);
  const r = /* @__PURE__ */ Object.create(null), g = /* @__PURE__ */ Object.create(null), A = /* @__PURE__ */ Object.create(null);
  let L = null, h = null, ee = 0, $ = /* @__PURE__ */ new Set();
  const ce = [], F = /* @__PURE__ */ Object.create(null);
  function Ot(e, t) {
    return (F[e] || (F[e] = [])).push(t), Ye;
  }
  function Lt(e, t) {
    return F[e] && (F[e] = F[e].filter((n) => n !== t)), Ye;
  }
  function m(e, t) {
    (F[e] || []).forEach((n) => {
      try {
        n(t);
      } catch {
      }
    });
  }
  function N(e, t, n, i) {
    e.addEventListener(t, n, i), ce.push({ target: e, type: t, fn: n, optsL: i });
  }
  const B = document.createElement("div");
  B.className = "loc-root";
  const j = d.toolbar ? nn() : null;
  j && B.appendChild(j);
  const E = T("div", "loc-canvas"), V = T("div", "loc-content"), te = T("div", "loc-grid"), W = document.createElementNS(de, "svg");
  W.setAttribute("class", "loc-connectors");
  const ne = document.createElementNS(de, "g");
  ne.setAttribute("class", "loc-edgehits"), W.appendChild(ne);
  const ue = T("div", "loc-nodes"), oe = document.createElementNS(de, "svg");
  oe.setAttribute("class", "loc-overlay");
  const G = document.createElementNS(de, "g");
  G.setAttribute("class", "loc-edgehandles"), oe.appendChild(G);
  const Me = T("div", "loc-zoomreadout");
  Me.textContent = "100%", V.appendChild(te), V.appendChild(W), V.appendChild(ue), V.appendChild(oe), E.appendChild(V), E.appendChild(Me), B.appendChild(E);
  const z = T("div", "loc-panel");
  z.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Node</span><button class="loc-panel-close" title="Close" data-role="panel-close">✕</button></div><div class="loc-panel-body" data-role="panel-body"></div><div class="loc-panel-foot" data-role="panel-foot"></div>', E.appendChild(z);
  const xe = z.querySelector('[data-role="panel-body"]'), De = z.querySelector('[data-role="panel-foot"]'), At = z.querySelector(".loc-panel-title"), P = T("div", "loc-settings");
  P.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Settings</span><button class="loc-panel-close" title="Close" data-role="settings-close">✕</button></div><div class="loc-panel-body" data-role="settings-body"></div>', E.appendChild(P);
  const ie = P.querySelector('[data-role="settings-body"]');
  we.appendChild(B);
  function T(e, t) {
    const n = document.createElement(e);
    return t && (n.className = t), n;
  }
  function pe() {
    return fn({
      orientation: o.orientation,
      subtreeMode: o.subtreeMode,
      spacingX: o.spacingX,
      spacingY: o.spacingY,
      gridSize: o.gridSize,
      alignGrid: o.alignGrid
    });
  }
  function Nt() {
    const e = pn(f, pe());
    I = e.positioned, v = e.posById;
  }
  function w() {
    Nt(), $t(), zt(), _e(), se(), Ie(), S(), m("layout-change", { positioned: I, mode: o.subtreeMode, orientation: o.orientation });
  }
  function _e() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of I) {
      const n = t.node;
      e[n.id] = !0;
      let i = r[n.id];
      i || (i = Tt(n), r[n.id] = i, ue.appendChild(i)), i.style.width = n.width + "px", i.style.height = n.height + "px";
      const s = Q(t, u);
      i.style.transform = `translate(${s.x - n.width / 2}px, ${s.y - n.height / 2}px)`, d.nodeSlots || (i.dataset.fitted || (Ct(i), i.dataset.fitted = "1"), lt(i, n)), i.classList.toggle("loc-selected", o.selectedNodeId === n.id), Gt(i, n);
    }
    for (const t in r) e[t] || (r[t].remove(), delete r[t]);
    m("nodes-rendered", { ids: I.map((t) => t.node.id) });
  }
  function Tt(e) {
    if (d.nodeSlots) {
      const n = T("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
      if (n.dataset.id = e.id, n.innerHTML = '<div class="loc-node-slot"></div>', e.type === "department") {
        const i = T("div", "loc-toggle");
        i.dataset.role = "toggle", n.appendChild(i);
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
      const n = t.querySelector(".loc-photo"), i = e.data && e.data.photo_url;
      if (i) {
        const a = new Image();
        a.alt = "", a.referrerPolicy = "no-referrer", a.onerror = () => {
          n.textContent = "●";
        }, a.src = i, n.appendChild(a);
      } else
        n.textContent = "●";
      t.querySelector(".loc-pname").textContent = e.personName || "—", t.querySelector(".loc-ptitle").textContent = e.label;
      const s = t.querySelector(".loc-badge");
      e.status ? (s.textContent = e.status, s.className = "loc-badge loc-" + e.status) : s.remove();
    }
    return t;
  }
  function Be(e) {
    return e.scrollWidth > e.clientWidth + 0.5 || e.scrollHeight > e.clientHeight + 0.5;
  }
  function Ct(e) {
    if (e.style.setProperty("--loc-fit", "1"), !Be(e)) return;
    let t = hn, n = 1;
    for (let i = 0; i < 7; i++) {
      const s = (t + n) / 2;
      e.style.setProperty("--loc-fit", String(s)), Be(e) ? n = s : t = s;
    }
    e.style.setProperty("--loc-fit", String(t));
  }
  function Gt(e, t) {
    const n = e.querySelector('[data-role="toggle"]');
    if (!n) return;
    const i = wt(f, t.id) > 0;
    n.style.display = i ? "flex" : "none", n.textContent = t.collapsed ? "⊞" : "⊟";
  }
  function fe(e) {
    return document.createElementNS(de, e);
  }
  function zt() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of I) {
      const n = t.node;
      if (!n.parentId) continue;
      const i = v[n.parentId];
      if (!i) continue;
      e[n.id] = !0;
      const s = xt(i, t, pe(), u, y, M);
      let a = g[n.id];
      a || (a = fe("path"), g[n.id] = a, W.appendChild(a)), a.setAttribute("d", s), a.classList.toggle("loc-sel", o.selectedEdgeId === n.id);
      let l = A[n.id];
      l || (l = fe("path"), l.dataset.edge = n.id, A[n.id] = l, ne.appendChild(l)), l.setAttribute("d", s);
    }
    for (const t in g) e[t] || (g[t].remove(), delete g[t]);
    for (const t in A) e[t] || (A[t].remove(), delete A[t]);
    o.selectedEdgeId && !e[o.selectedEdgeId] ? H() : k();
  }
  function U(e) {
    const t = v[e];
    if (!t) return;
    const n = v[t.node.parentId];
    if (!n) return;
    const i = xt(n, t, pe(), u, y, M);
    g[e] && g[e].setAttribute("d", i), A[e] && A[e].setAttribute("d", i);
  }
  function se() {
    V.style.transform = `translate(${o.panX}px, ${o.panY}px) scale(${o.zoom})`, Me.textContent = Math.round(o.zoom * 100) + "%", o.selectedEdgeId && !L && k(), S();
  }
  function $t() {
    let e = 0, t = 0;
    for (const n of I) {
      const i = Q(n, u);
      e = Math.max(e, i.x + n.node.width / 2 + 80), t = Math.max(t, i.y + n.node.height / 2 + 80);
    }
    W.setAttribute("width", e), W.setAttribute("height", t), oe.setAttribute("width", e), oe.setAttribute("height", t), te.style.width = e + "px", te.style.height = t + "px", te.style.backgroundSize = o.gridSize + "px " + o.gridSize + "px";
  }
  function ge() {
    te.classList.toggle("loc-on", o.showGrid), E.classList.toggle("loc-gridon", o.showGrid);
  }
  function he() {
    if (!I.length) return;
    const e = St(I, u, 0), t = ln(e, E.clientWidth, E.clientHeight);
    o.zoom = t.zoom, o.panX = t.panX, o.panY = t.panY, se();
  }
  function Pe(e) {
    const t = v[e];
    if (!t) return;
    const n = Q(t, u);
    o.panX = E.clientWidth / 2 - n.x * o.zoom, o.panY = E.clientHeight / 2 - n.y * o.zoom, se();
  }
  function Ue() {
    for (const e of f) e.collapsed = !1;
    w();
  }
  function He() {
    const e = rn(f, p);
    for (const t of f) t.collapsed = e[t.id] >= 1 && wt(f, t.id) > 0;
    w();
  }
  function qe(e) {
    const t = p[e];
    t && (t.collapsed = !t.collapsed, w());
  }
  function jt(e) {
    if ($ = cn(f, e), Ie(), $.size) {
      const t = I.find((n) => $.has(n.node.id));
      t && Pe(t.node.id);
    }
    return $.size;
  }
  function Rt() {
    $ = /* @__PURE__ */ new Set(), Ie();
  }
  function Ie() {
    const e = $.size > 0;
    for (const t of I) {
      const n = r[t.node.id];
      if (!n) continue;
      const i = $.has(t.node.id);
      n.classList.toggle("loc-highlight", e && i), n.classList.toggle("loc-dim", e && !i);
    }
    for (const t in g) g[t].classList.toggle("loc-hl", e && $.has(t));
  }
  function Xt(e, t) {
    if (e.target.closest('[data-role="toggle"]') || (e.stopPropagation(), H(), We(t), m("node-select", { id: t, node: p[t] }), d.inspector && Te(t), d.readonly || !d.enableDragging || !o.editMode)) return;
    const n = u[t] || { dx: 0, dy: 0 };
    h = { id: t, startX: e.clientX, startY: e.clientY, baseDx: n.dx, baseDy: n.dy, moved: !1 }, r[t].classList.add("loc-dragging"), m("node-drag-start", { id: t, node: p[t] }), Y("pointermove", Fe), Y("pointerup", Ve);
  }
  function Fe(e) {
    if (!h) return;
    let t = h.baseDx + (e.clientX - h.startX) / o.zoom, n = h.baseDy + (e.clientY - h.startY) / o.zoom;
    if (Math.abs(e.clientX - h.startX) + Math.abs(e.clientY - h.startY) > 3 && (h.moved = !0), o.snapGrid) {
      const i = o.gridSize, s = v[h.id];
      s && (t = Math.round((s.cx + t) / i) * i - s.cx, n = Math.round((s.cy + n) / i) * i - s.cy);
    }
    u[h.id] = { dx: t, dy: n }, ee || (ee = requestAnimationFrame(() => {
      ee = 0, kt(h.id), Yt(h.id), m("node-drag", { id: h.id, node: p[h.id], offset: u[h.id] });
    }));
  }
  function Ve() {
    if (h) {
      const e = r[h.id];
      e && e.classList.remove("loc-dragging"), m("node-drag-end", { id: h.id, node: p[h.id], offset: u[h.id] });
    }
    h = null, D("pointermove", Fe), D("pointerup", Ve), S();
  }
  function kt(e) {
    const t = v[e], n = r[e];
    if (!t || !n) return;
    const i = Q(t, u);
    n.style.transform = `translate(${i.x - t.node.width / 2}px, ${i.y - t.node.height / 2}px)`;
  }
  function Yt(e) {
    const t = v[e];
    if (t) {
      v[t.node.parentId] && U(e);
      for (const n of I) n.node.parentId === e && U(n.node.id);
      o.selectedEdgeId && k();
    }
  }
  function We(e) {
    o.selectedNodeId && r[o.selectedNodeId] && r[o.selectedNodeId].classList.remove("loc-selected"), o.selectedNodeId = e, r[e] && r[e].classList.add("loc-selected");
  }
  function be(e, t) {
    const n = E.getBoundingClientRect();
    return { x: (e - n.left - o.panX) / o.zoom, y: (t - n.top - o.panY) / o.zoom };
  }
  function Ee(e) {
    if (o.snapGrid) {
      const t = o.gridSize;
      return { x: Math.round(e.x / t) * t, y: Math.round(e.y / t) * t };
    }
    return { x: e.x, y: e.y };
  }
  function Je(e) {
    const t = v[e];
    if (!t) return null;
    const n = v[t.node.parentId];
    if (!n) return null;
    const i = y[e] || [];
    return gn(n, t, i, pe(), u, M[e]);
  }
  function Ke(e) {
    o.selectedEdgeId && g[o.selectedEdgeId] && g[o.selectedEdgeId].classList.remove("loc-sel"), o.selectedNodeId && r[o.selectedNodeId] && r[o.selectedNodeId].classList.remove("loc-selected"), o.selectedNodeId = null, o.selectedEdgeId = e, g[e] && g[e].classList.add("loc-sel"), k();
  }
  function H() {
    o.selectedEdgeId && g[o.selectedEdgeId] && g[o.selectedEdgeId].classList.remove("loc-sel"), o.selectedEdgeId = null, G.innerHTML = "";
  }
  function Ze(e, t, n, i) {
    const s = fe("circle");
    return s.setAttribute("cx", e), s.setAttribute("cy", t), s.setAttribute("r", n), s.setAttribute("class", i), s;
  }
  function Qe(e, t, n, i) {
    const s = fe("rect");
    return s.setAttribute("x", e - n), s.setAttribute("y", t - n), s.setAttribute("width", 2 * n), s.setAttribute("height", 2 * n), s.setAttribute("rx", 2 / o.zoom), s.setAttribute("class", i), s;
  }
  function k() {
    G.innerHTML = "";
    const e = o.selectedEdgeId;
    if (!e || d.readonly || !o.editMode) return;
    const t = Je(e);
    if (!t) return;
    const n = y[e] || [], i = 6 / o.zoom, s = 5 / o.zoom;
    for (let b = 0; b < t.length - 1; b++) {
      const R = t[b], X = t[b + 1], le = Ze((R.x + X.x) / 2, (R.y + X.y) / 2, s, "loc-wp-add");
      le.dataset.add = b, G.appendChild(le);
    }
    for (let b = 0; b < n.length; b++) {
      const R = Ze(n[b].x, n[b].y, i, "loc-wp-handle");
      R.dataset.wp = b, G.appendChild(R);
    }
    const a = t[0], l = t[t.length - 1], c = Qe(a.x, a.y, 6 / o.zoom, "loc-ep loc-ep-parent");
    c.dataset.ep = "parent", G.appendChild(c);
    const O = Qe(l.x, l.y, 6 / o.zoom, "loc-ep loc-ep-child");
    O.dataset.ep = "child", G.appendChild(O);
  }
  function et(e, t) {
    const n = Q(e, u), i = e.node.width, s = e.node.height;
    let a = (t.x - n.x) / (i / 2), l = (t.y - n.y) / (s / 2);
    const c = Math.max(Math.abs(a), Math.abs(l));
    return c > 1e-6 && (a /= c, l /= c), { nx: Math.max(-1, Math.min(1, a)), ny: Math.max(-1, Math.min(1, l)) };
  }
  function Dt(e, t) {
    const n = new Set([t].concat(Ge(t)));
    for (let i = I.length - 1; i >= 0; i--) {
      const s = I[i];
      if (n.has(s.node.id)) continue;
      const a = Q(s, u);
      if (e.x >= a.x - s.node.width / 2 && e.x <= a.x + s.node.width / 2 && e.y >= a.y - s.node.height / 2 && e.y <= a.y + s.node.height / 2) return s.node.id;
    }
    return null;
  }
  let J = null;
  function Oe(e) {
    J && r[J] && r[J].classList.remove("loc-reparent-target"), J = e, e && r[e] && r[e].classList.add("loc-reparent-target");
  }
  function tt(e) {
    if (!L || L.kind !== "ep") return;
    const t = L.id, n = v[t];
    if (!n) return;
    const i = v[n.node.parentId];
    if (!i) return;
    const s = be(e.clientX, e.clientY);
    if (M[t] = M[t] || {}, L.which === "child")
      M[t].c = et(n, s);
    else {
      M[t].p = et(i, s);
      const a = Dt(s, t);
      Oe(a && a !== n.node.parentId ? a : null);
    }
    U(t), k();
  }
  function nt() {
    const e = L;
    if (L = null, D("pointermove", tt), D("pointerup", nt), e && e.which === "parent" && J) {
      const t = J;
      Oe(null), Le(e.id, t);
      return;
    }
    Oe(null), S();
  }
  function Le(e, t) {
    const n = p[e];
    !n || t === e || t && Ge(e).indexOf(t) >= 0 || (n.parentId = t || "", x[e] = Object.assign(x[e] || {}, { parentId: n.parentId }), delete y[e], delete M[e], o.selectedEdgeId = null, G.innerHTML = "", v[e] && Object.assign(v[e].node, { parentId: n.parentId }), w(), m("node-change", { id: e, node: { ...n }, patch: { parentId: n.parentId }, reparented: !0 }), S());
  }
  function Ae(e) {
    Le(e, "");
  }
  function _t(e, t, n) {
    const i = n.x - t.x, s = n.y - t.y, a = i * i + s * s;
    let l = a ? ((e.x - t.x) * i + (e.y - t.y) * s) / a : 0;
    return l = Math.max(0, Math.min(1, l)), Math.hypot(e.x - (t.x + l * i), e.y - (t.y + l * s));
  }
  function Bt(e, t) {
    let n = 0, i = 1 / 0;
    for (let s = 0; s < e.length - 1; s++) {
      const a = _t(t, e[s], e[s + 1]);
      a < i && (i = a, n = s);
    }
    return n;
  }
  const Pt = ["", "Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Matrix"];
  function me(e) {
    return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function Ne() {
    B.classList.toggle("loc-edit", o.editMode);
  }
  function ot(e) {
    o.editMode = !!e, Ne(), _(), o.editMode || H(), z.classList.contains("loc-open") && Ce(), m("edit-mode-change", { editMode: o.editMode }), S();
  }
  function Te(e) {
    d.inspector && (o.selectedNodeId = e, z.classList.add("loc-open"), Ce(), m("inspector-open", { id: e, node: p[e] }));
  }
  function K() {
    z.classList.contains("loc-open") && (z.classList.remove("loc-open"), m("inspector-close", {}));
  }
  function Ce() {
    const e = o.selectedNodeId, t = e && p[e];
    if (!t) {
      K();
      return;
    }
    if (At.textContent = t.label || t.personName || t.id, d.inspectorSlot) {
      De.innerHTML = "";
      return;
    }
    const n = o.editMode, i = n ? "" : " disabled", s = (O, b, R) => `<input data-field="${O}" type="${R || "text"}" value="${me(b)}"${i}/>`, a = (O, b, R) => `<select data-field="${O}"${i}>` + R.map((X) => {
      const le = Array.isArray(X) ? X[0] : X, sn = Array.isArray(X) ? X[1] : X || "—";
      return `<option value="${me(le)}"${String(le) === String(b ?? "") ? " selected" : ""}>${sn}</option>`;
    }).join("") + "</select>", l = (O, b) => `<label class="loc-field"><span>${O}</span>${b}</label>`;
    let c = l("ID", `<input value="${me(t.id)}" disabled/>`) + l("Type", a("type", t.type, [["department", "department"], ["position", "position"]])) + l("Label", s("label", t.label));
    t.type !== "department" && (c += l("Person name", s("personName", t.personName)) + l("Status", a("status", t.status, [["", "—"], ["FILLED", "FILLED"], ["VACANT", "VACANT"], ["UNFUNDED", "UNFUNDED"]])) + l("Photo URL", s("photo_url", t.data && t.data.photo_url || ""))), c += l("Layout override", a("layoutMode", t.layoutMode || "", Pt.map((O) => [O, O || "(inherit)"]))) + l("Width", s("width", t.width, "number")) + l("Height", s("height", t.height, "number")), xe.innerHTML = c, De.innerHTML = n ? '<button data-role="add-child">+ Add child</button>' + (t.parentId ? '<button data-role="detach">Detach</button>' : "") + '<button data-role="del-node" class="loc-danger">Delete</button>' : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  function Ut() {
    let e;
    do
      e = "node-" + ++Et;
    while (p[e]);
    return e;
  }
  function Z(e, t) {
    const n = p[e];
    if (!n) return;
    Object.assign(n, t), v[e] && v[e].node !== n && Object.assign(v[e].node, t), x[e] = Object.assign(x[e] || {}, t);
    const i = ["type", "width", "height", "layoutMode"].some((s) => s in t);
    r[e] && (r[e].remove(), delete r[e]), i ? w() : _e(), m("node-change", { id: e, node: { ...n }, patch: t }), S();
  }
  function Ge(e) {
    const t = [], n = [e];
    for (; n.length; ) {
      const i = n.pop();
      for (const s of f) s.parentId === i && (t.push(s.id), n.push(s.id));
    }
    return t;
  }
  function it(e) {
    if (!o.editMode) return;
    const t = Ut(), n = ve({ id: t, parentId: e || "", type: "position", label: "NEW POSITION", personName: "", status: "" });
    f.push(n), p[t] = n, x[t] = Object.assign({ __new: !0 }, n), w(), We(t), Te(t), m("node-change", { id: t, node: { ...n }, added: !0 }), S();
  }
  function st(e) {
    if (!o.editMode || !e) return;
    const t = [e].concat(Ge(e)), n = new Set(t);
    f = f.filter((i) => !n.has(i.id)), p = Se(f), t.forEach((i) => {
      x[i] = { __deleted: !0 }, r[i] && (r[i].remove(), delete r[i]);
    }), n.has(o.selectedNodeId) && (o.selectedNodeId = null, K()), w(), m("node-change", { id: e, removed: !0, ids: t }), S();
  }
  function at() {
    const e = new Set(Object.keys(x).filter((t) => x[t] && x[t].__deleted));
    e.size && (f = f.filter((t) => !e.has(t.id))), p = Se(f);
    for (const t in x) {
      const n = x[t];
      if (!(!n || n.__deleted))
        if (n.__new) {
          if (!p[t]) {
            const i = Object.assign({}, n);
            delete i.__new;
            const s = ve(i);
            f.push(s), p[t] = s;
          }
        } else p[t] && Object.assign(p[t], n);
    }
  }
  const Ht = [
    ["type", "Type"],
    ["status", "Status"],
    ["level", "Level (data.level)"],
    ["unit", "Unit (data.unit)"],
    ["id", "Node id"],
    ["label", "Label"]
  ];
  function lt(e, t) {
    const n = Mt(t, C);
    ze(e, "--loc-node-bg", n && n.bg), ze(e, "--loc-node-text", n && n.text), ze(e, "--loc-node-border", n && n.border);
  }
  function ze(e, t, n) {
    n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
  }
  function $e() {
    for (const e in r) p[e] && lt(r[e], p[e]);
  }
  function q() {
    return {
      spacingX: o.spacingX,
      spacingY: o.spacingY,
      gridSize: o.gridSize,
      orientation: o.orientation,
      subtreeMode: o.subtreeMode,
      showGrid: o.showGrid,
      snapGrid: o.snapGrid,
      alignGrid: o.alignGrid,
      themeRules: C.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    };
  }
  function qt(e, t) {
    e = e || {}, typeof e.spacingX == "number" && (o.spacingX = e.spacingX), typeof e.spacingY == "number" && (o.spacingY = e.spacingY), typeof e.gridSize == "number" && (o.gridSize = e.gridSize), e.orientation && (o.orientation = e.orientation), e.subtreeMode && (o.subtreeMode = e.subtreeMode), "showGrid" in e && (o.showGrid = !!e.showGrid), "snapGrid" in e && (o.snapGrid = !!e.snapGrid), "alignGrid" in e && (o.alignGrid = !!e.alignGrid), Array.isArray(e.themeRules) && (C = e.themeRules.map(re)), ge(), _(), w(), P.classList.contains("loc-open") && ye(), t && t.silent || m("settings-change", q()), S();
  }
  function je(e) {
    const t = e == null ? !P.classList.contains("loc-open") : !!e;
    P.classList.toggle("loc-open", t), j && j.querySelectorAll('button[data-act="settings"]').forEach((n) => n.classList.toggle("loc-active", t)), t && ye();
  }
  function Re(e, t, n, i, s) {
    return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${i}" max="${s}" value="${n}"/></label>`;
  }
  function Xe(e, t, n, i) {
    return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${i ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${i || "#e0524d"}"/></label>`;
  }
  function Ft(e, t) {
    const n = (i, s) => `<option value="${i}"${e.field === i ? " selected" : ""}>${s}</option>`;
    return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + Ht.map(([i, s]) => n(i, s)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${me(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Xe(t, "bg", "BG", e.style.bg) + Xe(t, "text", "Text", e.style.text) + Xe(t, "border", "Border", e.style.border) + "</div></div>";
  }
  function ye() {
    let e = '<div class="loc-set-section"><div class="loc-set-title">Layout</div>' + Re("spacingX", "Spacing X", o.spacingX, 0, 200) + Re("spacingY", "Spacing Y", o.spacingY, 0, 260) + Re("gridSize", "Grid size", o.gridSize, 6, 80) + "</div>";
    e += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div><div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>', C.forEach((t, n) => {
      e += Ft(t, n);
    }), e += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>', ie.innerHTML = e;
  }
  function Vt(e, t) {
    const n = ie.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
    return n && n.checked;
  }
  function Wt(e, t) {
    const n = ie.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
    return n ? n.value : "";
  }
  function S() {
    if (d.persist)
      try {
        localStorage.setItem(d.storageKey, JSON.stringify({
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
          editMode: o.editMode,
          manualOffsets: u,
          edgeWaypoints: y,
          edgeAnchors: M,
          nodeOverrides: x,
          themeRules: C,
          collapsed: f.filter((e) => e.collapsed).map((e) => e.id)
        }));
      } catch {
      }
  }
  function Jt() {
    if (!d.persist) return;
    let e;
    try {
      e = JSON.parse(localStorage.getItem(d.storageKey) || "null");
    } catch {
      e = null;
    }
    if (e && (e.orientation && (o.orientation = e.orientation), e.subtreeMode && (o.subtreeMode = e.subtreeMode), ["spacingX", "spacingY", "zoom", "panX", "panY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (o[t] = e[t]);
    }), o.showGrid = !!e.showGrid, o.snapGrid = !!e.snapGrid, o.alignGrid = !!e.alignGrid, o.editMode = !!e.editMode, e.manualOffsets && (u = e.manualOffsets), e.edgeWaypoints && (y = e.edgeWaypoints), e.edgeAnchors && (M = e.edgeAnchors), e.nodeOverrides && (x = e.nodeOverrides, at()), Array.isArray(e.themeRules) && (C = e.themeRules.map(re)), Array.isArray(e.collapsed))) {
      const t = new Set(e.collapsed);
      for (const n of f) n.collapsed = t.has(n.id);
    }
  }
  function rt(e) {
    const t = an(o, f, u, y);
    return t.editMode = o.editMode, t.edgeAnchors = M, t.nodeOverrides = x, t.settings = q(), e !== !1 && ke(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
  }
  const dt = document.createElement("canvas").getContext("2d");
  function Kt(e, t) {
    return dt.font = t, dt.measureText(e).width;
  }
  function Zt(e) {
    const t = r[e.id];
    if (!t) return 1;
    const n = parseFloat(t.style.getPropertyValue("--loc-fit"));
    return isFinite(n) && n > 0 ? n : 1;
  }
  function ae(e) {
    const t = [];
    for (const n in g) t.push(g[n].getAttribute("d"));
    return dn(I, t, { manualOffsets: u, raster: !!e, measureText: Kt, fitOf: Zt });
  }
  function ct() {
    return ke(new Blob([ae(!1)], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), ae(!1);
  }
  function ut(e) {
    e = e || 3;
    const t = St(I, u, 40), n = 16e3, i = 2e8;
    let s = Math.min(e, n / t.w, n / t.h);
    t.w * s * t.h * s > i && (s = Math.sqrt(i / (t.w * t.h))), s = Math.max(0.05, s);
    const a = URL.createObjectURL(new Blob([ae(!0)], { type: "image/svg+xml;charset=utf-8" })), l = new Image();
    l.onload = () => {
      const c = document.createElement("canvas");
      c.width = Math.round(t.w * s), c.height = Math.round(t.h * s);
      const O = c.getContext("2d");
      O.setTransform(s, 0, 0, s, 0, 0), O.drawImage(l, 0, 0), URL.revokeObjectURL(a);
      try {
        c.toBlob((b) => {
          b && ke(b, "org-chart.png");
        }, "image/png");
      } catch {
      }
    }, l.onerror = () => URL.revokeObjectURL(a), l.src = a;
  }
  function pt() {
    const e = window.open("", "_blank");
    e && (e.document.open(), e.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + ae(!1) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), e.document.close());
  }
  function ke(e, t) {
    const n = URL.createObjectURL(e), i = document.createElement("a");
    i.href = n, i.download = t, document.body.appendChild(i), i.click(), i.remove(), URL.revokeObjectURL(n);
  }
  function ft(e, t, n) {
    const i = !(n && n.resetEdits);
    f = (e || []).map(ve), p = Se(f), u = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), M = /* @__PURE__ */ Object.create(null), i || (x = /* @__PURE__ */ Object.create(null)), o.selectedNodeId = null, o.selectedEdgeId = null, $ = /* @__PURE__ */ new Set(), K();
    for (const s in r)
      r[s].remove(), delete r[s];
    for (const s in g)
      g[s].remove(), delete g[s];
    for (const s in A)
      A[s].remove(), delete A[s];
    t && (t.subtreeMode && (o.subtreeMode = t.subtreeMode), t.orientation && (o.orientation = t.orientation), t.manualOffsets && (u = t.manualOffsets), t.edgeWaypoints && (y = t.edgeWaypoints), t.edgeAnchors && (M = t.edgeAnchors), t.nodeOverrides && (x = t.nodeOverrides), typeof t.editMode == "boolean" && (o.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (C = t.settings.themeRules.map(re))), i && at(), Ne(), _(), w(), d.fitOnInit && he();
  }
  function Qt(e) {
    const { nodes: t, meta: n } = un(e);
    return ft(t, n), t.length;
  }
  function gt(e) {
    o.orientation = e, u = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), M = /* @__PURE__ */ Object.create(null), H(), _(), w(), m("orientation-change", { orientation: e });
  }
  function ht(e) {
    o.subtreeMode = e, u = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), M = /* @__PURE__ */ Object.create(null), H(), _(), w(), m("subtree-mode-change", { subtreeMode: e });
  }
  function en(e, t) {
    e != null && (o.spacingX = e), t != null && (o.spacingY = t), w();
  }
  function tn(e, t) {
    e in o ? (o[e] = t, e === "showGrid" && ge(), e === "alignGrid" && (u = /* @__PURE__ */ Object.create(null), w()), _()) : d[e] = t;
  }
  function bt() {
    u = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), M = /* @__PURE__ */ Object.create(null), H(), w();
  }
  N(ue, "pointerdown", (e) => {
    const t = e.target.closest(".loc-node");
    t && Xt(e, t.dataset.id);
  }), N(ue, "click", (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !d.readonly) {
      qe(t.closest(".loc-node").dataset.id);
      return;
    }
    const n = e.target.closest(".loc-node");
    n && m("node-click", { id: n.dataset.id, node: p[n.dataset.id] });
  }), N(ne, "pointerdown", (e) => {
    const t = e.target.closest("path");
    t && (e.stopPropagation(), Ke(t.dataset.edge));
  }), N(ne, "dblclick", (e) => {
    if (d.readonly || !o.editMode) return;
    const t = e.target.closest("path");
    if (!t) return;
    const n = t.dataset.edge;
    Ke(n);
    const i = Je(n);
    if (!i) return;
    const s = Ee(be(e.clientX, e.clientY));
    (y[n] || (y[n] = [])).splice(Bt(i, s), 0, s), U(n), k(), S();
  }), N(G, "pointerdown", (e) => {
    if (d.readonly || !o.editMode) return;
    const t = e.target, n = o.selectedEdgeId;
    if (!n) return;
    if (t.dataset.ep) {
      e.stopPropagation(), e.preventDefault(), L = { id: n, kind: "ep", which: t.dataset.ep }, Y("pointermove", tt), Y("pointerup", nt);
      return;
    }
    let i;
    if (t.dataset.wp != null) i = +t.dataset.wp;
    else if (t.dataset.add != null) {
      const s = +t.dataset.add;
      (y[n] || (y[n] = [])).splice(s, 0, Ee(be(e.clientX, e.clientY))), i = s, U(n);
    } else return;
    e.stopPropagation(), e.preventDefault(), L = { id: n, idx: i }, Y("pointermove", mt), Y("pointerup", yt);
  }), N(G, "dblclick", (e) => {
    const t = e.target;
    if (t.dataset.ep === "parent") {
      Ae(o.selectedEdgeId);
      return;
    }
    if (t.dataset.wp == null) return;
    const n = o.selectedEdgeId, i = y[n];
    i && (i.splice(+t.dataset.wp, 1), i.length || delete y[n], U(n), k(), S());
  });
  function mt(e) {
    if (!L) return;
    const t = y[L.id];
    t && (t[L.idx] = Ee(be(e.clientX, e.clientY)), U(L.id), k());
  }
  function yt() {
    L = null, D("pointermove", mt), D("pointerup", yt), S();
  }
  N(z, "click", (e) => {
    if (e.target.closest('[data-role="panel-close"]')) {
      K();
      return;
    }
    if (e.target.closest('[data-role="add-child"]')) {
      it(o.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="detach"]')) {
      Ae(o.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="del-node"]')) {
      st(o.selectedNodeId);
      return;
    }
  }), N(xe, "input", (e) => {
    if (!o.editMode) return;
    const t = e.target.closest("[data-field]");
    if (!t) return;
    const n = o.selectedNodeId;
    if (!n) return;
    const i = t.dataset.field;
    let s = t.value;
    if (i === "type") {
      Z(n, { type: s }), Ce();
      return;
    }
    if (i === "width" || i === "height") {
      Z(n, { [i]: Math.max(20, parseFloat(s) || 0) });
      return;
    }
    if (i === "photo_url") {
      const a = p[n];
      Z(n, { data: Object.assign({}, a.data, { photo_url: s || null }) });
      return;
    }
    if (i === "layoutMode") {
      Z(n, { layoutMode: s || null });
      return;
    }
    Z(n, { [i]: s });
  }), N(P, "click", (e) => {
    if (e.target.closest('[data-role="settings-close"]')) {
      je(!1);
      return;
    }
    if (e.target.closest('[data-role="add-rule"]')) {
      C.push(re({ field: "type", value: "", style: {} })), ye(), $e(), S(), m("settings-change", q());
      return;
    }
    const t = e.target.closest('[data-rk="remove"]');
    t && (C.splice(+t.dataset.rule, 1), ye(), $e(), S(), m("settings-change", q()));
  }), N(ie, "input", (e) => {
    const t = e.target;
    if (t.dataset.set != null) {
      const n = parseFloat(t.value);
      o[t.dataset.set] = n;
      const i = ie.querySelector(`[data-rangelabel="${t.dataset.set}"]`);
      i && (i.textContent = n), w(), m("settings-change", q()), S();
      return;
    }
    if (t.dataset.rule != null) {
      const n = +t.dataset.rule, i = t.dataset.rk, s = C[n];
      if (!s) return;
      if (i === "enabled") s.enabled = t.checked;
      else if (i === "field") s.field = t.value;
      else if (i === "value") s.value = t.value;
      else if (i === "bg" || i === "text" || i === "border")
        Vt(n, i) && (s.style[i] = t.value);
      else if (/-on$/.test(i)) {
        const a = i.replace("-on", "");
        s.style[a] = t.checked ? Wt(n, a) || "#e0524d" : "";
      }
      $e(), m("settings-change", q()), S();
    }
  }), N(E, "pointerdown", (e) => {
    if (!(e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings"))) {
      if (o.selectedNodeId && (r[o.selectedNodeId] && r[o.selectedNodeId].classList.remove("loc-selected"), o.selectedNodeId = null), o.selectedEdgeId && H(), K(), !d.enablePan) return;
      E.classList.add("loc-panning");
      const t = e.clientX, n = e.clientY, i = o.panX, s = o.panY, a = (c) => {
        o.panX = i + (c.clientX - t), o.panY = s + (c.clientY - n), se();
      }, l = () => {
        E.classList.remove("loc-panning"), D("pointermove", a), D("pointerup", l);
      };
      Y("pointermove", a), Y("pointerup", l);
    }
  }), N(E, "wheel", (e) => {
    if (!d.enableZoom) return;
    e.preventDefault();
    const t = E.getBoundingClientRect(), n = e.clientX - t.left, i = e.clientY - t.top, s = e.deltaY < 0 ? 1.1 : 1 / 1.1, a = Math.min(3, Math.max(0.15, o.zoom * s));
    o.panX = n - (n - o.panX) * (a / o.zoom), o.panY = i - (i - o.panY) * (a / o.zoom), o.zoom = a, se();
  }, { passive: !1 });
  function Y(e, t) {
    window.addEventListener(e, t), ce.push({ target: window, type: e, fn: t });
  }
  function D(e, t) {
    window.removeEventListener(e, t);
  }
  function nn() {
    const e = d.toolbar && typeof d.toolbar == "object" ? d.toolbar : {}, t = (l) => e[l] !== !1, n = T("div", "loc-toolbar");
    let i = "";
    return t("subtree") && (i += s("Subtree", ["Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Matrix"].map((l) => a("mode", l, l)).join(""))), t("orient") && (i += s("Orient", [["TopToBottom", "Top"], ["BottomToTop", "Bottom"], ["LeftToRight", "Left"], ["RightToLeft", "Right"]].map(([l, c]) => a("orient", l, c)).join(""))), t("actions") && (i += s("", '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button>')), t("grid") && (i += s("Grid", '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>')), t("mode") && (i += s("Mode", '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="settings" title="Settings &amp; theming">Settings</button>')), t("export") && (i += s("Export", '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>')), n.innerHTML = i, n.addEventListener("click", (l) => {
      const c = l.target.closest("button");
      if (c)
        if (c.dataset.mode) ht(c.dataset.mode);
        else if (c.dataset.orient) gt(c.dataset.orient);
        else if (c.dataset.flag)
          o[c.dataset.flag] = !o[c.dataset.flag], c.dataset.flag === "showGrid" ? ge() : c.dataset.flag === "alignGrid" && (u = /* @__PURE__ */ Object.create(null), w()), _(), S();
        else switch (c.dataset.act) {
          case "expand":
            Ue();
            break;
          case "collapse":
            He();
            break;
          case "fit":
            he();
            break;
          case "relayout":
            bt();
            break;
          case "edit":
            ot(!o.editMode);
            break;
          case "settings":
            je();
            break;
          case "png":
            ut(3);
            break;
          case "svg":
            ct();
            break;
          case "pdf":
            pt();
            break;
          case "json":
            rt(!0);
            break;
        }
    }), n;
    function s(l, c) {
      return `<div class="loc-group">${l ? `<span class="loc-label">${l}</span>` : ""}${c}</div>`;
    }
    function a(l, c, O) {
      return `<button data-${l}="${c}">${O}</button>`;
    }
  }
  function _() {
    j && (j.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === o.subtreeMode)), j.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === o.orientation)), j.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!o[e.dataset.flag])), j.querySelectorAll('button[data-act="edit"]').forEach((e) => e.classList.toggle("loc-active", o.editMode)));
  }
  Jt(), _(), ge(), Ne(), w(), d.fitOnInit && he();
  let vt = !1;
  function on() {
    if (!vt) {
      vt = !0, ce.forEach(({ target: e, type: t, fn: n, optsL: i }) => e.removeEventListener(t, n, i)), ce.length = 0, ee && cancelAnimationFrame(ee), B.remove();
      for (const e in r) delete r[e];
      for (const e in g) delete g[e];
      for (const e in A) delete A[e];
    }
  }
  const Ye = {
    root: B,
    setNodes: ft,
    loadJSON: Qt,
    setOrientation: gt,
    setSubtreeMode: ht,
    setSpacing: en,
    setOption: tn,
    fitToScreen: he,
    relayout: bt,
    expandAll: Ue,
    collapseAll: He,
    toggleCollapse: qe,
    centerOnNode: Pe,
    search: jt,
    clearSearch: Rt,
    exportJSON: rt,
    exportSVG: ct,
    exportPNG: ut,
    exportPDF: pt,
    buildSVG: ae,
    setEditMode: ot,
    isEditMode: () => o.editMode,
    updateNode: Z,
    addChild: it,
    deleteNode: st,
    reparentNode: Le,
    detachNode: Ae,
    openInspector: Te,
    closeInspector: K,
    getSettings: q,
    setSettings: qt,
    toggleSettings: je,
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (e) => r[e] || null,
    getNodeSlotEl: (e) => r[e] ? r[e].querySelector(".loc-node-slot") : null,
    getInspectorBody: () => xe,
    nodeThemeStyle: (e) => p[e] ? Mt(p[e], C) : null,
    getState: () => ({ ...o }),
    getNodes: () => f.map((e) => ({ ...e })),
    getPositioned: () => I,
    on: Ot,
    off: Lt,
    destroy: on
  };
  return Ye;
}
export {
  wn as CANVAS_PAD,
  Mn as DEFAULTS,
  xn as DEFAULT_SETTINGS,
  In as DEPT_SIZE,
  En as ORIENTATIONS,
  On as POS_SIZE,
  Ln as SNAKE_STUB,
  An as SUBTREE_MODES,
  Nn as VIRTUAL_ROOT_ID,
  Tn as applyOrientation,
  dn as buildChartSVG,
  Cn as buildTree,
  St as calculateBounds,
  wt as childCount,
  rn as computeDepths,
  Gn as convertMoTree,
  zn as convertNestedTree,
  yn as createOrgChart,
  gn as edgeControlPoints,
  $n as edgeEndpoints,
  Q as effCenter,
  an as exportLayout,
  ln as fitBounds,
  jn as getVisibleTree,
  Se as indexNodes,
  Rn as isHorizontal,
  Xn as isMoArray,
  pn as layoutOrgChart,
  kn as lh,
  Yn as lw,
  ve as makeNode,
  fn as normalizeConfig,
  un as normalizeImported,
  re as normalizeRule,
  Dn as normalizeSettings,
  _n as orthoThrough,
  Bn as personNameFromPos,
  Mt as resolveNodeStyle,
  xt as routeConnector,
  cn as searchNodes,
  Pn as visibleDepths,
  Un as waypointPath
};
