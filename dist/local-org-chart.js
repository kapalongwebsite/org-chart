import { makeNode as Se, indexNodes as we, normalizeRule as de, exportLayout as gn, calculateBounds as Lt, fitBounds as hn, computeDepths as bn, childCount as At, resolveNodeStyle as Nt, buildChartSVG as mn, searchNodes as yn, effCenter as Q, normalizeImported as vn, layoutOrgChart as Sn, routeConnector as Gt, normalizeConfig as wn, edgeControlPoints as Mn } from "./core.js";
import { CANVAS_PAD as Nn, DEFAULTS as Gn, DEFAULT_SETTINGS as Tn, DEPT_SIZE as Cn, ORIENTATIONS as zn, POS_SIZE as $n, SNAKE_STUB as jn, SUBTREE_MODES as Rn, VIRTUAL_ROOT_ID as Xn, applyOrientation as Yn, buildTree as kn, convertMoTree as Dn, convertNestedTree as Bn, edgeEndpoints as _n, getVisibleTree as Pn, isHorizontal as Un, isMoArray as Hn, lh as qn, lw as Fn, normalizeSettings as Vn, orthoThrough as Wn, personNameFromPos as Jn, visibleDepths as Kn, waypointPath as Zn } from "./core.js";
const ce = "http://www.w3.org/2000/svg", xn = 0.5, In = {
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
function En(Me, Tt = {}) {
  if (!Me || !Me.appendChild) throw new Error("createOrgChart: first argument must be a DOM element.");
  const d = Object.assign({}, In, Tt), o = {
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
  let f = (d.nodes || []).map(Se), p = we(f), u = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), M = /* @__PURE__ */ Object.create(null), x = /* @__PURE__ */ Object.create(null), T = (d.settings && d.settings.themeRules || d.themeRules || []).map(de), Ct = 0, I = [], S = /* @__PURE__ */ Object.create(null);
  const r = /* @__PURE__ */ Object.create(null), h = /* @__PURE__ */ Object.create(null), A = /* @__PURE__ */ Object.create(null);
  let L = null, b = null, ee = 0, $ = /* @__PURE__ */ new Set();
  const ue = [], V = /* @__PURE__ */ Object.create(null);
  function zt(e, t) {
    return (V[e] || (V[e] = [])).push(t), _e;
  }
  function $t(e, t) {
    return V[e] && (V[e] = V[e].filter((n) => n !== t)), _e;
  }
  function g(e, t) {
    (V[e] || []).forEach((n) => {
      try {
        n(t);
      } catch {
      }
    });
  }
  function N(e, t, n, i) {
    e.addEventListener(t, n, i), ue.push({ target: e, type: t, fn: n, optsL: i });
  }
  const P = document.createElement("div");
  P.className = "loc-root";
  const j = d.toolbar ? un() : null;
  j && P.appendChild(j);
  const O = G("div", "loc-canvas"), W = G("div", "loc-content"), te = G("div", "loc-grid"), J = document.createElementNS(ce, "svg");
  J.setAttribute("class", "loc-connectors");
  const ne = document.createElementNS(ce, "g");
  ne.setAttribute("class", "loc-edgehits"), J.appendChild(ne);
  const pe = G("div", "loc-nodes"), oe = document.createElementNS(ce, "svg");
  oe.setAttribute("class", "loc-overlay");
  const C = document.createElementNS(ce, "g");
  C.setAttribute("class", "loc-edgehandles"), oe.appendChild(C);
  const xe = G("div", "loc-zoomreadout");
  xe.textContent = "100%", W.appendChild(te), W.appendChild(J), W.appendChild(pe), W.appendChild(oe), O.appendChild(W), O.appendChild(xe), P.appendChild(O);
  const z = G("div", "loc-panel");
  z.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Node</span><button class="loc-panel-close" title="Close" data-role="panel-close">✕</button></div><div class="loc-panel-body" data-role="panel-body"></div><div class="loc-panel-foot" data-role="panel-foot"></div>', O.appendChild(z);
  const Ie = z.querySelector('[data-role="panel-body"]'), Pe = z.querySelector('[data-role="panel-foot"]'), jt = z.querySelector(".loc-panel-title"), U = G("div", "loc-settings");
  U.innerHTML = '<div class="loc-panel-head"><span class="loc-panel-title">Settings</span><button class="loc-panel-close" title="Close" data-role="settings-close">✕</button></div><div class="loc-panel-body" data-role="settings-body"></div>', O.appendChild(U);
  const ie = U.querySelector('[data-role="settings-body"]');
  Me.appendChild(P);
  function G(e, t) {
    const n = document.createElement(e);
    return t && (n.className = t), n;
  }
  function fe() {
    return wn({
      orientation: o.orientation,
      subtreeMode: o.subtreeMode,
      spacingX: o.spacingX,
      spacingY: o.spacingY,
      gridSize: o.gridSize,
      alignGrid: o.alignGrid
    });
  }
  function Rt() {
    const e = Sn(f, fe());
    I = e.positioned, S = e.posById;
  }
  function w() {
    Rt(), Bt(), Dt(), Ue(), se(), Oe(), v(), g("layout-change", { positioned: I, mode: o.subtreeMode, orientation: o.orientation });
  }
  function Ue() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of I) {
      const n = t.node;
      e[n.id] = !0;
      let i = r[n.id];
      i || (i = Xt(n), r[n.id] = i, pe.appendChild(i)), i.style.width = n.width + "px", i.style.height = n.height + "px";
      const s = Q(t, u);
      i.style.transform = `translate(${s.x - n.width / 2}px, ${s.y - n.height / 2}px)`, d.nodeSlots || (i.dataset.fitted || (Yt(i), i.dataset.fitted = "1"), ut(i, n)), i.classList.toggle("loc-selected", o.selectedNodeId === n.id), kt(i, n);
    }
    for (const t in r) e[t] || (r[t].remove(), delete r[t]);
    g("nodes-rendered", { ids: I.map((t) => t.node.id) });
  }
  function Xt(e) {
    if (d.nodeSlots) {
      const n = G("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
      if (n.dataset.id = e.id, n.innerHTML = '<div class="loc-node-slot"></div>', e.type === "department") {
        const i = G("div", "loc-toggle");
        i.dataset.role = "toggle", n.appendChild(i);
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
  function He(e) {
    return e.scrollWidth > e.clientWidth + 0.5 || e.scrollHeight > e.clientHeight + 0.5;
  }
  function Yt(e) {
    if (e.style.setProperty("--loc-fit", "1"), !He(e)) return;
    let t = xn, n = 1;
    for (let i = 0; i < 7; i++) {
      const s = (t + n) / 2;
      e.style.setProperty("--loc-fit", String(s)), He(e) ? n = s : t = s;
    }
    e.style.setProperty("--loc-fit", String(t));
  }
  function kt(e, t) {
    const n = e.querySelector('[data-role="toggle"]');
    if (!n) return;
    const i = At(f, t.id) > 0;
    n.style.display = i ? "flex" : "none", n.textContent = t.collapsed ? "⊞" : "⊟";
  }
  function ge(e) {
    return document.createElementNS(ce, e);
  }
  function Dt() {
    const e = /* @__PURE__ */ Object.create(null);
    for (const t of I) {
      const n = t.node;
      if (!n.parentId) continue;
      const i = S[n.parentId];
      if (!i) continue;
      e[n.id] = !0;
      const s = Gt(i, t, fe(), u, y, M);
      let a = h[n.id];
      a || (a = ge("path"), h[n.id] = a, J.appendChild(a)), a.setAttribute("d", s), a.classList.toggle("loc-sel", o.selectedEdgeId === n.id);
      let l = A[n.id];
      l || (l = ge("path"), l.dataset.edge = n.id, A[n.id] = l, ne.appendChild(l)), l.setAttribute("d", s);
    }
    for (const t in h) e[t] || (h[t].remove(), delete h[t]);
    for (const t in A) e[t] || (A[t].remove(), delete A[t]);
    o.selectedEdgeId && !e[o.selectedEdgeId] ? q() : k();
  }
  function H(e) {
    const t = S[e];
    if (!t) return;
    const n = S[t.node.parentId];
    if (!n) return;
    const i = Gt(n, t, fe(), u, y, M);
    h[e] && h[e].setAttribute("d", i), A[e] && A[e].setAttribute("d", i);
  }
  function se() {
    W.style.transform = `translate(${o.panX}px, ${o.panY}px) scale(${o.zoom})`, xe.textContent = Math.round(o.zoom * 100) + "%", o.selectedEdgeId && !L && k(), v();
  }
  function Bt() {
    let e = 0, t = 0;
    for (const n of I) {
      const i = Q(n, u);
      e = Math.max(e, i.x + n.node.width / 2 + 80), t = Math.max(t, i.y + n.node.height / 2 + 80);
    }
    J.setAttribute("width", e), J.setAttribute("height", t), oe.setAttribute("width", e), oe.setAttribute("height", t), te.style.width = e + "px", te.style.height = t + "px", te.style.backgroundSize = o.gridSize + "px " + o.gridSize + "px";
  }
  function he() {
    te.classList.toggle("loc-on", o.showGrid), O.classList.toggle("loc-gridon", o.showGrid);
  }
  function ae() {
    if (!I.length) return;
    const e = Lt(I, u, 0), t = hn(e, O.clientWidth, O.clientHeight);
    o.zoom = t.zoom, o.panX = t.panX, o.panY = t.panY, se();
  }
  function qe(e) {
    const t = S[e];
    if (!t) return;
    const n = Q(t, u);
    o.panX = O.clientWidth / 2 - n.x * o.zoom, o.panY = O.clientHeight / 2 - n.y * o.zoom, se();
  }
  function Fe() {
    for (const e of f) e.collapsed = !1;
    w();
  }
  function Ve() {
    const e = bn(f, p);
    for (const t of f) t.collapsed = e[t.id] >= 1 && At(f, t.id) > 0;
    w();
  }
  function We(e) {
    const t = p[e];
    t && (t.collapsed = !t.collapsed, w());
  }
  function _t(e) {
    if ($ = yn(f, e), Oe(), $.size) {
      const t = I.find((n) => $.has(n.node.id));
      t && qe(t.node.id);
    }
    return $.size;
  }
  function Je() {
    $ = /* @__PURE__ */ new Set(), Oe();
  }
  function Oe() {
    const e = $.size > 0;
    for (const t of I) {
      const n = r[t.node.id];
      if (!n) continue;
      const i = $.has(t.node.id);
      n.classList.toggle("loc-highlight", e && i), n.classList.toggle("loc-dim", e && !i);
    }
    for (const t in h) h[t].classList.toggle("loc-hl", e && $.has(t));
  }
  function Pt(e, t) {
    if (e.target.closest('[data-role="toggle"]') || (e.stopPropagation(), q(), Qe(t), g("node-select", { id: t, node: p[t] }), d.inspector && Te(t), d.readonly || !d.enableDragging || !o.editMode)) return;
    const n = u[t] || { dx: 0, dy: 0 };
    b = { id: t, startX: e.clientX, startY: e.clientY, baseDx: n.dx, baseDy: n.dy, moved: !1 }, r[t].classList.add("loc-dragging"), g("node-drag-start", { id: t, node: p[t] }), D("pointermove", Ke), D("pointerup", Ze);
  }
  function Ke(e) {
    if (!b) return;
    let t = b.baseDx + (e.clientX - b.startX) / o.zoom, n = b.baseDy + (e.clientY - b.startY) / o.zoom;
    if (Math.abs(e.clientX - b.startX) + Math.abs(e.clientY - b.startY) > 3 && (b.moved = !0), o.snapGrid) {
      const i = o.gridSize, s = S[b.id];
      s && (t = Math.round((s.cx + t) / i) * i - s.cx, n = Math.round((s.cy + n) / i) * i - s.cy);
    }
    u[b.id] = { dx: t, dy: n }, ee || (ee = requestAnimationFrame(() => {
      ee = 0, Ut(b.id), Ht(b.id), g("node-drag", { id: b.id, node: p[b.id], offset: u[b.id] });
    }));
  }
  function Ze() {
    if (b) {
      const e = r[b.id];
      e && e.classList.remove("loc-dragging"), g("node-drag-end", { id: b.id, node: p[b.id], offset: u[b.id] });
    }
    b = null, B("pointermove", Ke), B("pointerup", Ze), v();
  }
  function Ut(e) {
    const t = S[e], n = r[e];
    if (!t || !n) return;
    const i = Q(t, u);
    n.style.transform = `translate(${i.x - t.node.width / 2}px, ${i.y - t.node.height / 2}px)`;
  }
  function Ht(e) {
    const t = S[e];
    if (t) {
      S[t.node.parentId] && H(e);
      for (const n of I) n.node.parentId === e && H(n.node.id);
      o.selectedEdgeId && k();
    }
  }
  function Qe(e) {
    o.selectedNodeId && r[o.selectedNodeId] && r[o.selectedNodeId].classList.remove("loc-selected"), o.selectedNodeId = e, r[e] && r[e].classList.add("loc-selected");
  }
  function be(e, t) {
    const n = O.getBoundingClientRect();
    return { x: (e - n.left - o.panX) / o.zoom, y: (t - n.top - o.panY) / o.zoom };
  }
  function Ee(e) {
    if (o.snapGrid) {
      const t = o.gridSize;
      return { x: Math.round(e.x / t) * t, y: Math.round(e.y / t) * t };
    }
    return { x: e.x, y: e.y };
  }
  function et(e) {
    const t = S[e];
    if (!t) return null;
    const n = S[t.node.parentId];
    if (!n) return null;
    const i = y[e] || [];
    return Mn(n, t, i, fe(), u, M[e]);
  }
  function tt(e) {
    o.selectedEdgeId && h[o.selectedEdgeId] && h[o.selectedEdgeId].classList.remove("loc-sel"), o.selectedNodeId && r[o.selectedNodeId] && r[o.selectedNodeId].classList.remove("loc-selected"), o.selectedNodeId = null, o.selectedEdgeId = e, h[e] && h[e].classList.add("loc-sel"), k();
  }
  function q() {
    o.selectedEdgeId && h[o.selectedEdgeId] && h[o.selectedEdgeId].classList.remove("loc-sel"), o.selectedEdgeId = null, C.innerHTML = "";
  }
  function nt(e, t, n, i) {
    const s = ge("circle");
    return s.setAttribute("cx", e), s.setAttribute("cy", t), s.setAttribute("r", n), s.setAttribute("class", i), s;
  }
  function ot(e, t, n, i) {
    const s = ge("rect");
    return s.setAttribute("x", e - n), s.setAttribute("y", t - n), s.setAttribute("width", 2 * n), s.setAttribute("height", 2 * n), s.setAttribute("rx", 2 / o.zoom), s.setAttribute("class", i), s;
  }
  function k() {
    C.innerHTML = "";
    const e = o.selectedEdgeId;
    if (!e || d.readonly || !o.editMode) return;
    const t = et(e);
    if (!t) return;
    const n = y[e] || [], i = 6 / o.zoom, s = 5 / o.zoom;
    for (let m = 0; m < t.length - 1; m++) {
      const X = t[m], Y = t[m + 1], re = nt((X.x + Y.x) / 2, (X.y + Y.y) / 2, s, "loc-wp-add");
      re.dataset.add = m, C.appendChild(re);
    }
    for (let m = 0; m < n.length; m++) {
      const X = nt(n[m].x, n[m].y, i, "loc-wp-handle");
      X.dataset.wp = m, C.appendChild(X);
    }
    const a = t[0], l = t[t.length - 1], c = ot(a.x, a.y, 6 / o.zoom, "loc-ep loc-ep-parent");
    c.dataset.ep = "parent", C.appendChild(c);
    const E = ot(l.x, l.y, 6 / o.zoom, "loc-ep loc-ep-child");
    E.dataset.ep = "child", C.appendChild(E);
  }
  function it(e, t) {
    const n = Q(e, u), i = e.node.width, s = e.node.height;
    let a = (t.x - n.x) / (i / 2), l = (t.y - n.y) / (s / 2);
    const c = Math.max(Math.abs(a), Math.abs(l));
    return c > 1e-6 && (a /= c, l /= c), { nx: Math.max(-1, Math.min(1, a)), ny: Math.max(-1, Math.min(1, l)) };
  }
  function qt(e, t) {
    const n = new Set([t].concat(ze(t)));
    for (let i = I.length - 1; i >= 0; i--) {
      const s = I[i];
      if (n.has(s.node.id)) continue;
      const a = Q(s, u);
      if (e.x >= a.x - s.node.width / 2 && e.x <= a.x + s.node.width / 2 && e.y >= a.y - s.node.height / 2 && e.y <= a.y + s.node.height / 2) return s.node.id;
    }
    return null;
  }
  let K = null;
  function Le(e) {
    K && r[K] && r[K].classList.remove("loc-reparent-target"), K = e, e && r[e] && r[e].classList.add("loc-reparent-target");
  }
  function st(e) {
    if (!L || L.kind !== "ep") return;
    const t = L.id, n = S[t];
    if (!n) return;
    const i = S[n.node.parentId];
    if (!i) return;
    const s = be(e.clientX, e.clientY);
    if (M[t] = M[t] || {}, L.which === "child")
      M[t].c = it(n, s);
    else {
      M[t].p = it(i, s);
      const a = qt(s, t);
      Le(a && a !== n.node.parentId ? a : null);
    }
    H(t), k();
  }
  function at() {
    const e = L;
    if (L = null, B("pointermove", st), B("pointerup", at), e && e.which === "parent" && K) {
      const t = K;
      Le(null), Ae(e.id, t);
      return;
    }
    Le(null), v();
  }
  function Ae(e, t) {
    const n = p[e];
    !n || t === e || t && ze(e).indexOf(t) >= 0 || (n.parentId = t || "", x[e] = Object.assign(x[e] || {}, { parentId: n.parentId }), delete y[e], delete M[e], o.selectedEdgeId = null, C.innerHTML = "", S[e] && Object.assign(S[e].node, { parentId: n.parentId }), w(), g("node-change", { id: e, node: { ...n }, patch: { parentId: n.parentId }, reparented: !0 }), v());
  }
  function Ne(e) {
    Ae(e, "");
  }
  function Ft(e, t, n) {
    const i = n.x - t.x, s = n.y - t.y, a = i * i + s * s;
    let l = a ? ((e.x - t.x) * i + (e.y - t.y) * s) / a : 0;
    return l = Math.max(0, Math.min(1, l)), Math.hypot(e.x - (t.x + l * i), e.y - (t.y + l * s));
  }
  function Vt(e, t) {
    let n = 0, i = 1 / 0;
    for (let s = 0; s < e.length - 1; s++) {
      const a = Ft(t, e[s], e[s + 1]);
      a < i && (i = a, n = s);
    }
    return n;
  }
  const Wt = ["", "Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Matrix"];
  function me(e) {
    return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function Ge() {
    P.classList.toggle("loc-edit", o.editMode);
  }
  function lt(e) {
    o.editMode = !!e, Ge(), _(), o.editMode || q(), z.classList.contains("loc-open") && Ce(), g("edit-mode-change", { editMode: o.editMode }), v();
  }
  function Te(e) {
    d.inspector && (o.selectedNodeId = e, z.classList.add("loc-open"), Ce(), g("inspector-open", { id: e, node: p[e] }));
  }
  function F() {
    z.classList.contains("loc-open") && (z.classList.remove("loc-open"), g("inspector-close", {}));
  }
  function Ce() {
    const e = o.selectedNodeId, t = e && p[e];
    if (!t) {
      F();
      return;
    }
    if (jt.textContent = t.label || t.personName || t.id, d.inspectorSlot) {
      Pe.innerHTML = "";
      return;
    }
    const n = o.editMode, i = n ? "" : " disabled", s = (E, m, X) => `<input data-field="${E}" type="${X || "text"}" value="${me(m)}"${i}/>`, a = (E, m, X) => `<select data-field="${E}"${i}>` + X.map((Y) => {
      const re = Array.isArray(Y) ? Y[0] : Y, fn = Array.isArray(Y) ? Y[1] : Y || "—";
      return `<option value="${me(re)}"${String(re) === String(m ?? "") ? " selected" : ""}>${fn}</option>`;
    }).join("") + "</select>", l = (E, m) => `<label class="loc-field"><span>${E}</span>${m}</label>`;
    let c = l("ID", `<input value="${me(t.id)}" disabled/>`) + l("Type", a("type", t.type, [["department", "department"], ["position", "position"]])) + l("Label", s("label", t.label));
    t.type !== "department" && (c += l("Person name", s("personName", t.personName)) + l("Status", a("status", t.status, [["", "—"], ["FILLED", "FILLED"], ["VACANT", "VACANT"], ["UNFUNDED", "UNFUNDED"]])) + l("Photo URL", s("photo_url", t.data && t.data.photo_url || ""))), c += l("Layout override", a("layoutMode", t.layoutMode || "", Wt.map((E) => [E, E || "(inherit)"]))) + l("Width", s("width", t.width, "number")) + l("Height", s("height", t.height, "number")), Ie.innerHTML = c, Pe.innerHTML = n ? '<button data-role="add-child">+ Add child</button>' + (t.parentId ? '<button data-role="detach">Detach</button>' : "") + '<button data-role="del-node" class="loc-danger">Delete</button>' : '<span class="loc-foot-hint">Turn on Edit to modify fields</span>';
  }
  function Jt() {
    let e;
    do
      e = "node-" + ++Ct;
    while (p[e]);
    return e;
  }
  function Z(e, t) {
    const n = p[e];
    if (!n) return;
    Object.assign(n, t), S[e] && S[e].node !== n && Object.assign(S[e].node, t), x[e] = Object.assign(x[e] || {}, t);
    const i = ["type", "width", "height", "layoutMode"].some((s) => s in t);
    r[e] && (r[e].remove(), delete r[e]), i ? w() : Ue(), g("node-change", { id: e, node: { ...n }, patch: t }), v();
  }
  function ze(e) {
    const t = [], n = [e];
    for (; n.length; ) {
      const i = n.pop();
      for (const s of f) s.parentId === i && (t.push(s.id), n.push(s.id));
    }
    return t;
  }
  function rt(e) {
    if (!o.editMode) return;
    const t = Jt(), n = Se({ id: t, parentId: e || "", type: "position", label: "NEW POSITION", personName: "", status: "" });
    f.push(n), p[t] = n, x[t] = Object.assign({ __new: !0 }, n), w(), Qe(t), Te(t), g("node-change", { id: t, node: { ...n }, added: !0 }), v();
  }
  function dt(e) {
    if (!o.editMode || !e) return;
    const t = [e].concat(ze(e)), n = new Set(t);
    f = f.filter((i) => !n.has(i.id)), p = we(f), t.forEach((i) => {
      x[i] = { __deleted: !0 }, r[i] && (r[i].remove(), delete r[i]);
    }), n.has(o.selectedNodeId) && (o.selectedNodeId = null, F()), w(), g("node-change", { id: e, removed: !0, ids: t }), v();
  }
  function ct() {
    const e = new Set(Object.keys(x).filter((t) => x[t] && x[t].__deleted));
    e.size && (f = f.filter((t) => !e.has(t.id))), p = we(f);
    for (const t in x) {
      const n = x[t];
      if (!(!n || n.__deleted))
        if (n.__new) {
          if (!p[t]) {
            const i = Object.assign({}, n);
            delete i.__new;
            const s = Se(i);
            f.push(s), p[t] = s;
          }
        } else p[t] && Object.assign(p[t], n);
    }
  }
  const Kt = [
    ["type", "Type"],
    ["status", "Status"],
    ["level", "Level (data.level)"],
    ["unit", "Unit (data.unit)"],
    ["id", "Node id"],
    ["label", "Label"]
  ];
  function ut(e, t) {
    const n = Nt(t, T);
    $e(e, "--loc-node-bg", n && n.bg), $e(e, "--loc-node-text", n && n.text), $e(e, "--loc-node-border", n && n.border);
  }
  function $e(e, t, n) {
    n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
  }
  function je() {
    for (const e in r) p[e] && ut(r[e], p[e]);
  }
  function R() {
    return {
      spacingX: o.spacingX,
      spacingY: o.spacingY,
      gridSize: o.gridSize,
      orientation: o.orientation,
      subtreeMode: o.subtreeMode,
      showGrid: o.showGrid,
      snapGrid: o.snapGrid,
      alignGrid: o.alignGrid,
      themeRules: T.map((e) => ({ enabled: e.enabled, field: e.field, value: e.value, style: Object.assign({}, e.style) }))
    };
  }
  function Zt(e, t) {
    e = e || {}, typeof e.spacingX == "number" && (o.spacingX = e.spacingX), typeof e.spacingY == "number" && (o.spacingY = e.spacingY), typeof e.gridSize == "number" && (o.gridSize = e.gridSize), e.orientation && (o.orientation = yt(e.orientation)), e.subtreeMode && (o.subtreeMode = e.subtreeMode), "showGrid" in e && (o.showGrid = !!e.showGrid), "snapGrid" in e && (o.snapGrid = !!e.snapGrid), "alignGrid" in e && (o.alignGrid = !!e.alignGrid), Array.isArray(e.themeRules) && (T = e.themeRules.map(de)), he(), _(), w(), U.classList.contains("loc-open") && ye(), t && t.silent || g("settings-change", R()), v();
  }
  function Re(e) {
    const t = e == null ? !U.classList.contains("loc-open") : !!e;
    U.classList.toggle("loc-open", t), j && j.querySelectorAll('button[data-act="settings"]').forEach((n) => n.classList.toggle("loc-active", t)), t && ye();
  }
  function Xe(e, t, n, i, s) {
    return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${i}" max="${s}" value="${n}"/></label>`;
  }
  function Ye(e, t, n, i) {
    return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${i ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${i || "#e0524d"}"/></label>`;
  }
  function Qt(e, t) {
    const n = (i, s) => `<option value="${i}"${e.field === i ? " selected" : ""}>${s}</option>`;
    return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + Kt.map(([i, s]) => n(i, s)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${me(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Ye(t, "bg", "BG", e.style.bg) + Ye(t, "text", "Text", e.style.text) + Ye(t, "border", "Border", e.style.border) + "</div></div>";
  }
  function ye() {
    let e = '<div class="loc-set-section"><div class="loc-set-title">Layout</div>' + Xe("spacingX", "Spacing X", o.spacingX, 0, 200) + Xe("spacingY", "Spacing Y", o.spacingY, 0, 260) + Xe("gridSize", "Grid size", o.gridSize, 6, 80) + "</div>";
    e += '<div class="loc-set-section"><div class="loc-set-title">Theme rules</div><div class="loc-set-hint">Recolor nodes that match a field = value. Later rules win.</div>', T.forEach((t, n) => {
      e += Qt(t, n);
    }), e += '<button class="loc-set-add" data-role="add-rule">+ Add rule</button></div>', ie.innerHTML = e;
  }
  function en(e, t) {
    const n = ie.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
    return n && n.checked;
  }
  function tn(e, t) {
    const n = ie.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
    return n ? n.value : "";
  }
  function v() {
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
          themeRules: T,
          collapsed: f.filter((e) => e.collapsed).map((e) => e.id)
        }));
      } catch {
      }
  }
  function nn() {
    if (!d.persist) return;
    let e;
    try {
      e = JSON.parse(localStorage.getItem(d.storageKey) || "null");
    } catch {
      e = null;
    }
    if (e && (e.orientation && (o.orientation = e.orientation), e.subtreeMode && (o.subtreeMode = e.subtreeMode), ["spacingX", "spacingY", "zoom", "panX", "panY", "gridSize"].forEach((t) => {
      typeof e[t] == "number" && (o[t] = e[t]);
    }), o.showGrid = !!e.showGrid, o.snapGrid = !!e.snapGrid, o.alignGrid = !!e.alignGrid, o.editMode = !!e.editMode, e.manualOffsets && (u = e.manualOffsets), e.edgeWaypoints && (y = e.edgeWaypoints), e.edgeAnchors && (M = e.edgeAnchors), e.nodeOverrides && (x = e.nodeOverrides, ct()), Array.isArray(e.themeRules) && (T = e.themeRules.map(de)), Array.isArray(e.collapsed))) {
      const t = new Set(e.collapsed);
      for (const n of f) n.collapsed = t.has(n.id);
    }
  }
  function pt(e) {
    const t = gn(o, f, u, y);
    return t.editMode = o.editMode, t.edgeAnchors = M, t.nodeOverrides = x, t.settings = R(), e !== !1 && ke(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
  }
  const ft = document.createElement("canvas").getContext("2d");
  function on(e, t) {
    return ft.font = t, ft.measureText(e).width;
  }
  function sn(e) {
    const t = r[e.id];
    if (!t) return 1;
    const n = parseFloat(t.style.getPropertyValue("--loc-fit"));
    return isFinite(n) && n > 0 ? n : 1;
  }
  function le(e) {
    const t = [];
    for (const n in h) t.push(h[n].getAttribute("d"));
    return mn(I, t, { manualOffsets: u, raster: !!e, measureText: on, fitOf: sn });
  }
  function gt() {
    return ke(new Blob([le(!1)], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), le(!1);
  }
  function ht(e) {
    e = e || 3;
    const t = Lt(I, u, 40), n = 16e3, i = 2e8;
    let s = Math.min(e, n / t.w, n / t.h);
    t.w * s * t.h * s > i && (s = Math.sqrt(i / (t.w * t.h))), s = Math.max(0.05, s);
    const a = URL.createObjectURL(new Blob([le(!0)], { type: "image/svg+xml;charset=utf-8" })), l = new Image();
    l.onload = () => {
      const c = document.createElement("canvas");
      c.width = Math.round(t.w * s), c.height = Math.round(t.h * s);
      const E = c.getContext("2d");
      E.setTransform(s, 0, 0, s, 0, 0), E.drawImage(l, 0, 0), URL.revokeObjectURL(a);
      try {
        c.toBlob((m) => {
          m && ke(m, "org-chart.png");
        }, "image/png");
      } catch {
      }
    }, l.onerror = () => URL.revokeObjectURL(a), l.src = a;
  }
  function bt() {
    const e = window.open("", "_blank");
    e && (e.document.open(), e.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + le(!1) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), e.document.close());
  }
  function ke(e, t) {
    const n = URL.createObjectURL(e), i = document.createElement("a");
    i.href = n, i.download = t, document.body.appendChild(i), i.click(), i.remove(), URL.revokeObjectURL(n);
  }
  function mt(e, t, n) {
    const i = !(n && n.resetEdits);
    f = (e || []).map(Se), p = we(f), u = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), M = /* @__PURE__ */ Object.create(null), i || (x = /* @__PURE__ */ Object.create(null)), o.selectedNodeId = null, o.selectedEdgeId = null, $ = /* @__PURE__ */ new Set(), F();
    for (const s in r)
      r[s].remove(), delete r[s];
    for (const s in h)
      h[s].remove(), delete h[s];
    for (const s in A)
      A[s].remove(), delete A[s];
    t && (t.subtreeMode && (o.subtreeMode = t.subtreeMode), t.orientation && (o.orientation = t.orientation), t.manualOffsets && (u = t.manualOffsets), t.edgeWaypoints && (y = t.edgeWaypoints), t.edgeAnchors && (M = t.edgeAnchors), t.nodeOverrides && (x = t.nodeOverrides), typeof t.editMode == "boolean" && (o.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (T = t.settings.themeRules.map(de))), i && ct(), Ge(), _(), w(), d.fitOnInit && ae();
  }
  function an(e) {
    const { nodes: t, meta: n } = vn(e);
    return mt(t, n), t.length;
  }
  const ln = {
    Top: "TopToBottom",
    Bottom: "BottomToTop",
    Left: "LeftToRight",
    Right: "RightToLeft"
  };
  function yt(e) {
    return ln[e] || e;
  }
  function vt(e) {
    const t = yt(e);
    o.orientation = t, u = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), M = /* @__PURE__ */ Object.create(null), q(), _(), w(), g("orientation-change", { orientation: t });
  }
  function St(e) {
    o.subtreeMode = e, u = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), M = /* @__PURE__ */ Object.create(null), q(), _(), w(), g("subtree-mode-change", { subtreeMode: e });
  }
  function rn(e, t) {
    e != null && (o.spacingX = e), t != null && (o.spacingY = t), w(), g("settings-change", R());
  }
  function ve(e, t) {
    e in o ? (o[e] = t, e === "showGrid" && he(), e === "alignGrid" && (u = /* @__PURE__ */ Object.create(null), w()), _(), v(), ["showGrid", "snapGrid", "alignGrid", "gridSize"].includes(e) && g("settings-change", R())) : d[e] = t;
  }
  function De(e) {
    return ve("showGrid", !!e), o.showGrid;
  }
  function wt(e) {
    return ve("snapGrid", !!e), o.snapGrid;
  }
  function Mt(e) {
    return ve("alignGrid", !!e), o.alignGrid;
  }
  function dn(e) {
    return De(e ?? !o.showGrid);
  }
  function Be() {
    u = /* @__PURE__ */ Object.create(null), y = /* @__PURE__ */ Object.create(null), M = /* @__PURE__ */ Object.create(null), q(), w();
  }
  function xt() {
    Je(), F(), Be(), ae();
  }
  function cn() {
    xt();
  }
  N(pe, "pointerdown", (e) => {
    const t = e.target.closest(".loc-node");
    t && Pt(e, t.dataset.id);
  }), N(pe, "click", (e) => {
    const t = e.target.closest('[data-role="toggle"]');
    if (t && !d.readonly) {
      We(t.closest(".loc-node").dataset.id);
      return;
    }
    const n = e.target.closest(".loc-node");
    n && g("node-click", { id: n.dataset.id, node: p[n.dataset.id] });
  }), N(ne, "pointerdown", (e) => {
    const t = e.target.closest("path");
    t && (e.stopPropagation(), tt(t.dataset.edge));
  }), N(ne, "dblclick", (e) => {
    if (d.readonly || !o.editMode) return;
    const t = e.target.closest("path");
    if (!t) return;
    const n = t.dataset.edge;
    tt(n);
    const i = et(n);
    if (!i) return;
    const s = Ee(be(e.clientX, e.clientY));
    (y[n] || (y[n] = [])).splice(Vt(i, s), 0, s), H(n), k(), v();
  }), N(C, "pointerdown", (e) => {
    if (d.readonly || !o.editMode) return;
    const t = e.target, n = o.selectedEdgeId;
    if (!n) return;
    if (t.dataset.ep) {
      e.stopPropagation(), e.preventDefault(), L = { id: n, kind: "ep", which: t.dataset.ep }, D("pointermove", st), D("pointerup", at);
      return;
    }
    let i;
    if (t.dataset.wp != null) i = +t.dataset.wp;
    else if (t.dataset.add != null) {
      const s = +t.dataset.add;
      (y[n] || (y[n] = [])).splice(s, 0, Ee(be(e.clientX, e.clientY))), i = s, H(n);
    } else return;
    e.stopPropagation(), e.preventDefault(), L = { id: n, idx: i }, D("pointermove", It), D("pointerup", Ot);
  }), N(C, "dblclick", (e) => {
    const t = e.target;
    if (t.dataset.ep === "parent") {
      Ne(o.selectedEdgeId);
      return;
    }
    if (t.dataset.wp == null) return;
    const n = o.selectedEdgeId, i = y[n];
    i && (i.splice(+t.dataset.wp, 1), i.length || delete y[n], H(n), k(), v());
  });
  function It(e) {
    if (!L) return;
    const t = y[L.id];
    t && (t[L.idx] = Ee(be(e.clientX, e.clientY)), H(L.id), k());
  }
  function Ot() {
    L = null, B("pointermove", It), B("pointerup", Ot), v();
  }
  N(z, "click", (e) => {
    if (e.target.closest('[data-role="panel-close"]')) {
      F();
      return;
    }
    if (e.target.closest('[data-role="add-child"]')) {
      rt(o.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="detach"]')) {
      Ne(o.selectedNodeId);
      return;
    }
    if (e.target.closest('[data-role="del-node"]')) {
      dt(o.selectedNodeId);
      return;
    }
  }), N(Ie, "input", (e) => {
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
  }), N(U, "click", (e) => {
    if (e.target.closest('[data-role="settings-close"]')) {
      Re(!1);
      return;
    }
    if (e.target.closest('[data-role="add-rule"]')) {
      T.push(de({ field: "type", value: "", style: {} })), ye(), je(), v(), g("settings-change", R());
      return;
    }
    const t = e.target.closest('[data-rk="remove"]');
    t && (T.splice(+t.dataset.rule, 1), ye(), je(), v(), g("settings-change", R()));
  }), N(ie, "input", (e) => {
    const t = e.target;
    if (t.dataset.set != null) {
      const n = parseFloat(t.value);
      o[t.dataset.set] = n;
      const i = ie.querySelector(`[data-rangelabel="${t.dataset.set}"]`);
      i && (i.textContent = n), w(), g("settings-change", R()), v();
      return;
    }
    if (t.dataset.rule != null) {
      const n = +t.dataset.rule, i = t.dataset.rk, s = T[n];
      if (!s) return;
      if (i === "enabled") s.enabled = t.checked;
      else if (i === "field") s.field = t.value;
      else if (i === "value") s.value = t.value;
      else if (i === "bg" || i === "text" || i === "border")
        en(n, i) && (s.style[i] = t.value);
      else if (/-on$/.test(i)) {
        const a = i.replace("-on", "");
        s.style[a] = t.checked ? tn(n, a) || "#e0524d" : "";
      }
      je(), g("settings-change", R()), v();
    }
  }), N(O, "pointerdown", (e) => {
    if (!(e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings"))) {
      if (o.selectedNodeId && (r[o.selectedNodeId] && r[o.selectedNodeId].classList.remove("loc-selected"), o.selectedNodeId = null), o.selectedEdgeId && q(), F(), !d.enablePan) return;
      O.classList.add("loc-panning");
      const t = e.clientX, n = e.clientY, i = o.panX, s = o.panY, a = (c) => {
        o.panX = i + (c.clientX - t), o.panY = s + (c.clientY - n), se();
      }, l = () => {
        O.classList.remove("loc-panning"), B("pointermove", a), B("pointerup", l);
      };
      D("pointermove", a), D("pointerup", l);
    }
  }), N(O, "wheel", (e) => {
    if (!d.enableZoom) return;
    e.preventDefault();
    const t = O.getBoundingClientRect(), n = e.clientX - t.left, i = e.clientY - t.top, s = e.deltaY < 0 ? 1.1 : 1 / 1.1, a = Math.min(3, Math.max(0.15, o.zoom * s));
    o.panX = n - (n - o.panX) * (a / o.zoom), o.panY = i - (i - o.panY) * (a / o.zoom), o.zoom = a, se();
  }, { passive: !1 });
  function D(e, t) {
    window.addEventListener(e, t), ue.push({ target: window, type: e, fn: t });
  }
  function B(e, t) {
    window.removeEventListener(e, t);
  }
  function un() {
    const e = d.toolbar && typeof d.toolbar == "object" ? d.toolbar : {}, t = (l) => e[l] !== !1, n = G("div", "loc-toolbar");
    let i = "";
    return t("subtree") && (i += s("Subtree", ["Balanced", "Center", "Left", "Right", "Alternate", "AlternateLeft", "AlternateRight", "Matrix"].map((l) => a("mode", l, l)).join(""))), t("orient") && (i += s("Orient", [["TopToBottom", "Top"], ["BottomToTop", "Bottom"], ["LeftToRight", "Left"], ["RightToLeft", "Right"]].map(([l, c]) => a("orient", l, c)).join(""))), t("actions") && (i += s("", '<button data-act="expand">Expand</button><button data-act="collapse">Collapse</button><button data-act="fit">Fit</button><button data-act="relayout">Re-layout</button>')), t("grid") && (i += s("Grid", '<button data-flag="showGrid">Show</button><button data-flag="snapGrid">Snap</button><button data-flag="alignGrid">Align</button>')), t("mode") && (i += s("Mode", '<button data-act="edit" title="Toggle edit mode">Edit</button><button data-act="settings" title="Settings &amp; theming">Settings</button>')), t("export") && (i += s("Export", '<button data-act="png">PNG</button><button data-act="svg">SVG</button><button data-act="pdf">PDF</button><button data-act="json">JSON</button>')), n.innerHTML = i, n.addEventListener("click", (l) => {
      const c = l.target.closest("button");
      if (c)
        if (c.dataset.mode) St(c.dataset.mode);
        else if (c.dataset.orient) vt(c.dataset.orient);
        else if (c.dataset.flag)
          o[c.dataset.flag] = !o[c.dataset.flag], c.dataset.flag === "showGrid" ? he() : c.dataset.flag === "alignGrid" && (u = /* @__PURE__ */ Object.create(null), w()), _(), v();
        else switch (c.dataset.act) {
          case "expand":
            Fe();
            break;
          case "collapse":
            Ve();
            break;
          case "fit":
            ae();
            break;
          case "relayout":
            Be();
            break;
          case "edit":
            lt(!o.editMode);
            break;
          case "settings":
            Re();
            break;
          case "png":
            ht(3);
            break;
          case "svg":
            gt();
            break;
          case "pdf":
            bt();
            break;
          case "json":
            pt(!0);
            break;
        }
    }), n;
    function s(l, c) {
      return `<div class="loc-group">${l ? `<span class="loc-label">${l}</span>` : ""}${c}</div>`;
    }
    function a(l, c, E) {
      return `<button data-${l}="${c}">${E}</button>`;
    }
  }
  function _() {
    j && (j.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === o.subtreeMode)), j.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === o.orientation)), j.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!o[e.dataset.flag])), j.querySelectorAll('button[data-act="edit"]').forEach((e) => e.classList.toggle("loc-active", o.editMode)));
  }
  nn(), _(), he(), Ge(), w(), d.fitOnInit && ae();
  let Et = !1;
  function pn() {
    if (!Et) {
      Et = !0, ue.forEach(({ target: e, type: t, fn: n, optsL: i }) => e.removeEventListener(t, n, i)), ue.length = 0, ee && cancelAnimationFrame(ee), P.remove();
      for (const e in r) delete r[e];
      for (const e in h) delete h[e];
      for (const e in A) delete A[e];
    }
  }
  const _e = {
    root: P,
    setNodes: mt,
    loadJSON: an,
    setOrientation: vt,
    setSubtreeMode: St,
    setSpacing: rn,
    setOption: ve,
    setShowGrid: De,
    setSnapToGrid: wt,
    setAlignToGrid: Mt,
    toggleGrid: dn,
    fitToScreen: ae,
    relayout: Be,
    resetView: xt,
    reset: cn,
    expandAll: Fe,
    collapseAll: Ve,
    toggleCollapse: We,
    centerOnNode: qe,
    search: _t,
    clearSearch: Je,
    exportJSON: pt,
    exportSVG: gt,
    exportPNG: ht,
    exportPDF: bt,
    buildSVG: le,
    setEditMode: lt,
    isEditMode: () => o.editMode,
    updateNode: Z,
    addChild: rt,
    deleteNode: dt,
    reparentNode: Ae,
    detachNode: Ne,
    openInspector: Te,
    closeInspector: F,
    getSettings: R,
    setSettings: Zt,
    toggleSettings: Re,
    // convenience aliases (match the Vue expose names)
    showGrid: (e) => De(e),
    snapToGrid: (e) => wt(e),
    alignToGrid: (e) => Mt(e),
    // slot bridging (used by the Vue wrapper's teleports)
    getNodeHost: (e) => r[e] || null,
    getNodeSlotEl: (e) => r[e] ? r[e].querySelector(".loc-node-slot") : null,
    getInspectorBody: () => Ie,
    nodeThemeStyle: (e) => p[e] ? Nt(p[e], T) : null,
    getState: () => ({ ...o }),
    getNodes: () => f.map((e) => ({ ...e })),
    getPositioned: () => I,
    on: zt,
    off: $t,
    destroy: pn
  };
  return _e;
}
export {
  Nn as CANVAS_PAD,
  Gn as DEFAULTS,
  Tn as DEFAULT_SETTINGS,
  Cn as DEPT_SIZE,
  zn as ORIENTATIONS,
  $n as POS_SIZE,
  jn as SNAKE_STUB,
  Rn as SUBTREE_MODES,
  Xn as VIRTUAL_ROOT_ID,
  Yn as applyOrientation,
  mn as buildChartSVG,
  kn as buildTree,
  Lt as calculateBounds,
  At as childCount,
  bn as computeDepths,
  Dn as convertMoTree,
  Bn as convertNestedTree,
  En as createOrgChart,
  Mn as edgeControlPoints,
  _n as edgeEndpoints,
  Q as effCenter,
  gn as exportLayout,
  hn as fitBounds,
  Pn as getVisibleTree,
  we as indexNodes,
  Un as isHorizontal,
  Hn as isMoArray,
  Sn as layoutOrgChart,
  qn as lh,
  Fn as lw,
  Se as makeNode,
  wn as normalizeConfig,
  vn as normalizeImported,
  de as normalizeRule,
  Vn as normalizeSettings,
  Wn as orthoThrough,
  Jn as personNameFromPos,
  Nt as resolveNodeStyle,
  Gt as routeConnector,
  yn as searchNodes,
  Kn as visibleDepths,
  Zn as waypointPath
};
