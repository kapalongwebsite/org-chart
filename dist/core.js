const P = "__virtual_root__", bt = 26, $t = 80, Tt = [
  "Balanced",
  "Center",
  "Left",
  "Right",
  "Alternate",
  "AlternateLeft",
  "AlternateRight",
  "Matrix"
], Mt = ["TopToBottom", "BottomToTop", "LeftToRight", "RightToLeft"], At = {
  orientation: "TopToBottom",
  subtreeMode: "Balanced",
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  alignGrid: !1
}, L = { width: 230, height: 64 }, E = { width: 180, height: 150 };
function St(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t) e[n.id] = n;
  return e;
}
function W(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const i of t) e[i.id] = { node: i, children: [] };
  const n = {
    node: {
      id: P,
      isVirtual: !0,
      width: 0,
      height: 0,
      type: "virtual",
      collapsed: !1,
      layoutMode: "Balanced"
    },
    children: []
  };
  for (const i of t) {
    const o = e[i.id], s = i.parentId;
    s && e[s] ? e[s].children.push(o) : n.children.push(o);
  }
  return n;
}
function U(t) {
  const e = { node: t.node, children: [] };
  if (!t.node.collapsed)
    for (const n of t.children) e.children.push(U(n));
  return e;
}
function G(t) {
  const e = /* @__PURE__ */ Object.create(null);
  return function n(i, o) {
    i.node.isVirtual || (e[i.node.id] = o);
    const s = i.node.isVirtual ? 0 : o + 1;
    for (const l of i.children) n(l, s);
  }(t, 0), e;
}
function It(t, e) {
  const n = /* @__PURE__ */ Object.create(null);
  function i(o) {
    if (o in n) return n[o];
    const s = e[o];
    return !s || !s.parentId ? n[o] = 0 : n[o] = i(s.parentId) + 1;
  }
  for (const o of t) i(o.id);
  return n;
}
function Nt(t, e) {
  let n = 0;
  for (const i of t) i.parentId === e && n++;
  return n;
}
function j(t) {
  return {
    id: t.id,
    parentId: t.parentId || "",
    type: t.type || "position",
    label: t.label || "",
    personName: t.personName || "",
    status: t.status || "",
    width: t.width || E.width,
    height: t.height || E.height,
    collapsed: !!t.collapsed,
    layoutMode: t.layoutMode || null,
    // per-node subtree override
    data: t.data || {}
  };
}
function Z(t) {
  const e = [t.firstname, t.lastname].filter(Boolean).join(" ").trim();
  return t.status === "VACANT" ? "— VACANT —" : t.status === "UNFUNDED" ? e || "— UNFUNDED —" : e || "—";
}
function B(t) {
  const e = [];
  function n(i, o) {
    const s = "org-" + (i.org_id != null ? i.org_id : i.id);
    e.push({
      id: s,
      parentId: o,
      type: "department",
      label: i.name || i.label || "UNIT",
      width: L.width,
      height: L.height,
      data: { level: i.level }
    });
    const l = (i.positions || []).slice().sort((r, a) => (r.org_order || 0) - (a.org_order || 0));
    for (const r of l)
      e.push({
        id: "pos-" + r.id,
        parentId: s,
        type: "position",
        label: r.position_title || "POSITION",
        personName: Z(r),
        status: r.status || "",
        width: E.width,
        height: E.height,
        data: { photo_url: r.photo_url || r.photo || null }
      });
    const c = (i.children || []).slice().sort((r, a) => (r.sort_order || 0) - (a.sort_order || 0));
    for (const r of c) n(r, s);
  }
  for (const i of t) n(i, "");
  return e;
}
function z(t) {
  const e = [];
  let n = 0;
  function i(o, s) {
    const l = "mo-" + n++;
    if (o.type === "organization")
      e.push({
        id: l,
        parentId: s,
        type: "department",
        label: o.name || "UNIT",
        width: L.width,
        height: L.height,
        data: { level: o.meta && o.meta.level, srcId: o.id }
      });
    else {
      const r = o.type === "vacant";
      e.push({
        id: l,
        parentId: s,
        type: "position",
        label: o.position || "POSITION",
        personName: r ? "— VACANT —" : o.name || "—",
        status: r ? "VACANT" : "FILLED",
        width: E.width,
        height: E.height,
        data: { photo_url: o.photo_url || null, srcId: o.id }
      });
    }
    const c = (o.children || []).slice().sort((r, a) => (r.meta && r.meta.sort_order || 0) - (a.meta && a.meta.sort_order || 0));
    for (const r of c) i(r, l);
  }
  for (const o of t) i(o, "");
  return e;
}
function K(t) {
  return t.some((e) => e && !("parentId" in e) && (e.type === "organization" || e.type === "filled" || e.type === "vacant" || Array.isArray(e.children) && ("position" in e || "photo_url" in e)));
}
function Ct(t) {
  let e, n = null;
  if (Array.isArray(t))
    t.length && K(t) ? e = z(t) : e = t;
  else if (t && Array.isArray(t.nodes))
    e = t.nodes, n = t;
  else if (t && Array.isArray(t.tree))
    e = B(t.tree);
  else if (t && t.tree && typeof t.tree == "object")
    e = B([t.tree]);
  else if (t && t.org_id != null)
    e = B([t]);
  else if (t && Array.isArray(t.children) && t.type)
    e = z([t]);
  else
    throw new Error("Unrecognized JSON. Expected a flat node array, {nodes:[…]}, {tree:[…]}, or an API tree of {type,children}.");
  if (!e.length) throw new Error("No nodes found in data.");
  if (e.find((o) => !o || o.id == null)) throw new Error('Every node needs an "id" field.');
  return { nodes: e, meta: n };
}
function _(t) {
  return t.orientation === "LeftToRight" || t.orientation === "RightToLeft";
}
function Y(t, e) {
  return _(e) ? t.height : t.width;
}
function F(t, e) {
  return _(e) ? t.width : t.height;
}
function q(t, e) {
  return t.isVirtual ? "Balanced" : t.layoutMode || e.subtreeMode;
}
function Q(t) {
  return t === "Alternate" || t === "AlternateLeft" || t === "AlternateRight";
}
function J(t) {
  return t === "RowWrap";
}
function D(t, e) {
  const n = t.node, i = t.children, o = Y(n, e), s = F(n, e);
  if (i.length === 0)
    return {
      w: o,
      h: s,
      anchorLeft: o / 2,
      anchorRight: o / 2,
      nodeCenterX: o / 2,
      nodeCenterY: s / 2,
      childPlacements: [],
      edgeRoutes: []
    };
  const l = i.map((r) => D(r, e)), c = q(n, e);
  return J(c) ? nt(t, l, e) : Q(c) ? et(t, l, c, e) : tt(t, l, c, e);
}
function tt(t, e, n, i) {
  const o = t.node, s = Y(o, i), l = o.isVirtual ? 0 : F(o, i), c = n === "Center" ? i.spacingX * 0.5 : i.spacingX, r = [];
  let a = 0;
  for (let p = 0; p < e.length; p++)
    r.push(a), a += e[p].w + c;
  const u = a - c, f = r[0] + e[0].nodeCenterX, h = r[e.length - 1] + e[e.length - 1].nodeCenterX;
  let d;
  switch (n) {
    case "Left":
      d = f;
      break;
    case "Right":
      d = h;
      break;
    default:
      d = (f + h) / 2;
  }
  const g = d + s / 2, m = Math.max(0, -(d - s / 2));
  for (let p = 0; p < r.length; p++) r[p] += m;
  d += m;
  const b = Math.max(u + m, g + m), A = l + (o.isVirtual ? 0 : i.spacingY), M = Math.max(...e.map((p) => p.h)), T = [], S = [];
  for (let p = 0; p < e.length; p++)
    T.push({ entry: t.children[p], cx: r[p], cy: A, m: e[p] }), S.push({ childId: t.children[p].node.id, routeType: "bus" });
  return {
    w: b,
    h: A + M,
    anchorLeft: d,
    anchorRight: b - d,
    nodeCenterX: d,
    nodeCenterY: l / 2,
    childPlacements: T,
    edgeRoutes: S
  };
}
function et(t, e, n, i) {
  const o = t.node, s = Y(o, i), l = o.isVirtual ? 0 : F(o, i), c = n !== "AlternateRight", r = n === "Alternate", a = Math.max(16, i.spacingY * 0.45), u = l + (o.isVirtual ? 0 : i.spacingY), h = (e.length ? e[0].h : 0) / 2 + a / 2;
  let d = u, g = u;
  c ? g += h : d += h;
  const m = [];
  for (let y = 0; y < e.length; y++) {
    const x = e[y];
    let N;
    r ? N = Math.abs(d - g) < 0.01 ? c : d < g : N = c ? y % 2 === 0 : y % 2 === 1, N ? (m.push({ i: y, side: -1, y: d, m: x }), d += x.h + a) : (m.push({ i: y, side: 1, y: g, m: x }), g += x.h + a);
  }
  const b = (y) => m.filter((x) => x.side === y).reduce((x, N) => Math.max(x, N.m.w), 0), A = b(-1), M = b(1), T = Math.max(A + 26, s / 2), S = [], p = [];
  for (const y of m) {
    const x = y.side < 0 ? T - 26 - y.m.w : T + 26;
    S[y.i] = { entry: t.children[y.i], cx: x, cy: y.y, m: y.m }, p[y.i] = { childId: t.children[y.i].node.id, routeType: y.side < 0 ? "spine-left" : "spine-right" };
  }
  const I = Math.max(d, g) - a, $ = Math.max(T + 26 + M, T + s / 2), w = Math.max(I, u);
  return {
    w: $,
    h: w,
    anchorLeft: T,
    anchorRight: $ - T,
    nodeCenterX: T,
    nodeCenterY: l / 2,
    childPlacements: S,
    edgeRoutes: p
  };
}
function nt(t, e, n) {
  const i = t.node, o = Y(i, n), s = i.isVirtual ? 0 : F(i, n), l = e.length, c = n.spacingX, r = Math.max(16, n.spacingY * 0.45), a = Math.max(1, Math.round(Math.sqrt(l) * (n._rowDensity || 1))), u = [];
  for (let p = 0; p < l; p += a) {
    const I = [];
    for (let $ = 0; $ < a && p + $ < l; $++) I.push(p + $);
    u.push(I);
  }
  let h = s + (i.isVirtual ? 0 : n.spacingY), d = 0;
  const g = [];
  for (const p of u) {
    const I = p.reduce((w, y) => w + e[y].w, 0) + (p.length - 1) * c, $ = Math.max(...p.map((w) => e[w].h));
    g.push({ y: h, rowW: I, rowH: $, row: p }), d = Math.max(d, I), h += $ + r;
  }
  const m = h - r, b = [], A = [];
  for (const { y: p, rowW: I, rowH: $, row: w } of g) {
    let y = (d - I) / 2;
    for (const x of w) {
      const N = e[x];
      b[x] = { entry: t.children[x], cx: y, cy: p + ($ - N.h) / 2, m: N }, A[x] = { childId: t.children[x].node.id, routeType: "grid" }, y += N.w + c;
    }
  }
  const M = Math.max(d, o), T = (M - d) / 2;
  if (T > 0.01) for (let p = 0; p < l; p++) b[p].cx += T;
  const S = M / 2;
  return {
    w: M,
    h: m,
    anchorLeft: S,
    anchorRight: M - S,
    nodeCenterX: S,
    nodeCenterY: s / 2,
    childPlacements: b,
    edgeRoutes: A
  };
}
function ot(t, e) {
  const n = D(t, e), i = [], o = /* @__PURE__ */ Object.create(null);
  return function s(l, c, r, a) {
    const u = l.node, f = r + c.nodeCenterX, h = a + c.nodeCenterY;
    u.isVirtual || i.push({
      node: u,
      lx: f,
      ly: h,
      w: Y(u, e),
      h: F(u, e),
      parentId: u.parentId,
      routeType: o[u.id] || "bus"
    });
    for (const d of c.edgeRoutes) o[d.childId] = d.routeType;
    for (const d of c.childPlacements) s(d.entry, d.m, r + d.cx, a + d.cy);
  }(t, n, 0, 0), i;
}
function it(t, e, n) {
  const i = /* @__PURE__ */ Object.create(null);
  for (const c of t) {
    const r = e[c.node.id] || 0;
    (i[r] || (i[r] = [])).push(c);
  }
  const o = Object.keys(i).map(Number).sort((c, r) => c - r), s = n.gridSize;
  let l = 0;
  for (const c of o) {
    const r = i[c], a = Math.max(...r.map((f) => f.h));
    for (const f of r) f.ly = l + a / 2;
    let u = a + n.spacingY;
    n.alignGrid && (u = Math.ceil(u / s) * s), l += u;
  }
}
function rt(t, e, n) {
  switch (n.orientation) {
    case "BottomToTop":
      return { x: t, y: -e };
    case "LeftToRight":
      return { x: e, y: t };
    case "RightToLeft":
      return { x: -e, y: t };
    case "TopToBottom":
    default:
      return { x: t, y: e };
  }
}
function st(t = {}) {
  let e = t.targetAspect != null ? t.targetAspect : 1.6;
  const n = t.targetSize;
  return n && n.width > 0 && n.height > 0 && (e = n.width / n.height), {
    orientation: t.orientation || "TopToBottom",
    subtreeMode: t.subtreeMode || "Balanced",
    spacingX: t.spacingX != null ? t.spacingX : 40,
    spacingY: t.spacingY != null ? t.spacingY : 70,
    gridSize: t.gridSize != null ? t.gridSize : 22,
    alignGrid: !!t.alignGrid,
    targetAspect: e > 0 ? e : 1.6
  };
}
function Rt(t, e = {}) {
  const n = st(e), i = (t || []).map(j), o = W(i), s = U(o);
  if (n.subtreeMode === "RowWrap") {
    const h = [0.4, 0.55, 0.7, 0.85, 1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 4];
    let d = 1, g = 1 / 0;
    for (const m of h) {
      const b = D(s, { ...n, _rowDensity: m }), A = b.h > 0 ? b.w / b.h : 1, M = Math.abs(Math.log(A) - Math.log(n.targetAspect));
      M < g && (g = M, d = m);
    }
    n._rowDensity = d;
  }
  const l = ot(s, n);
  n.subtreeMode === "Matrix" && it(l, G(s), n);
  for (const h of l) {
    const d = rt(h.lx, h.ly, n);
    h.cx = d.x, h.cy = d.y;
  }
  let c = 1 / 0, r = 1 / 0;
  for (const h of l)
    c = Math.min(c, h.cx - h.node.width / 2), r = Math.min(r, h.cy - h.node.height / 2);
  isFinite(c) || (c = 0, r = 0);
  const a = 80 - c, u = 80 - r;
  for (const h of l)
    h.cx += a, h.cy += u;
  if (n.alignGrid) {
    const h = n.gridSize;
    for (const d of l)
      d.cx = Math.round(d.cx / h) * h, d.cy = Math.round(d.cy / h) * h;
  }
  const f = /* @__PURE__ */ Object.create(null);
  for (const h of l) f[h.node.id] = h;
  return { positioned: l, posById: f, cfg: n, bounds: ct(l) };
}
function ct(t) {
  let e = 1 / 0, n = 1 / 0, i = -1 / 0, o = -1 / 0;
  for (const s of t)
    e = Math.min(e, s.cx - s.node.width / 2), n = Math.min(n, s.cy - s.node.height / 2), i = Math.max(i, s.cx + s.node.width / 2), o = Math.max(o, s.cy + s.node.height / 2);
  return isFinite(e) ? { x: e, y: n, w: i - e, h: o - n } : { x: 0, y: 0, w: 0, h: 0 };
}
function C(t, e) {
  const n = e && e[t.node.id];
  return { x: t.cx + (n ? n.dx : 0), y: t.cy + (n ? n.dy : 0) };
}
function _t(t, e, n, i, o, s) {
  const l = o && o[e.node.id], c = s && s[e.node.id];
  if (l && l.length || c) return ht(t, e, l || [], n, i, c);
  const r = C(t, i), a = C(e, i), u = t.node.width, f = t.node.height, h = e.node.width, d = e.node.height, g = _(n), m = r.y - f / 2, b = r.y + f / 2, A = r.x - u / 2, M = r.x + u / 2, T = a.y - d / 2, S = a.y + d / 2, p = a.x - h / 2, I = a.x + h / 2, $ = [];
  if (e.routeType === "bus" || e.routeType === "grid")
    if (g) {
      const w = a.x >= r.x ? M : A, y = a.x >= r.x ? p : I, x = (w + y) / 2;
      $.push([w, r.y], [x, r.y], [x, a.y], [y, a.y]);
    } else {
      const w = a.y >= r.y ? b : m, y = a.y >= r.y ? T : S, x = (w + y) / 2;
      $.push([r.x, w], [r.x, x], [a.x, x], [a.x, y]);
    }
  else if (g) {
    const w = a.x >= r.x ? M : A, y = a.y <= r.y ? S : T;
    $.push([w, r.y], [a.x, r.y], [a.x, y]);
  } else {
    const w = a.y >= r.y ? b : m, y = a.x <= r.x ? I : p;
    $.push([r.x, w], [r.x, a.y], [y, a.y]);
  }
  return "M " + $.map((w) => w[0].toFixed(1) + " " + w[1].toFixed(1)).join(" L ");
}
function lt(t, e, n, i, o, s, l) {
  const c = C(t, s), r = C(e, s), a = t.node.width, u = t.node.height, f = e.node.width, h = e.node.height;
  let d, g;
  return l && l.p ? d = { x: c.x + l.p.nx * a / 2, y: c.y + l.p.ny * u / 2 } : _(o) ? d = { x: n.x >= c.x ? c.x + a / 2 : c.x - a / 2, y: c.y } : d = { x: c.x, y: n.y >= c.y ? c.y + u / 2 : c.y - u / 2 }, l && l.c ? g = { x: r.x + l.c.nx * f / 2, y: r.y + l.c.ny * h / 2 } : _(o) ? g = { x: i.x >= r.x ? r.x + f / 2 : r.x - f / 2, y: r.y } : g = { x: r.x, y: i.y >= r.y ? r.y + h / 2 : r.y - h / 2 }, { S: d, E: g };
}
function at(t, e, n, i, o, s) {
  const l = n.length ? n[0] : C(e, o), c = n.length ? n[n.length - 1] : C(t, o), r = lt(t, e, l, c, i, o, s), a = r.S;
  let u = r.E;
  if (!n.length && !(s && s.c) && e.routeType !== "bus") {
    const f = C(e, o), h = C(t, o), d = e.node.width, g = e.node.height;
    u = _(i) ? { x: f.x, y: f.y <= h.y ? f.y + g / 2 : f.y - g / 2 } : { x: f.x <= h.x ? f.x + d / 2 : f.x - d / 2, y: f.y };
  }
  return [a].concat(n.map((f) => ({ x: f.x, y: f.y })), [u]);
}
function dt(t, e) {
  const n = [t[0]];
  for (let i = 1; i < t.length; i++) {
    const o = n[n.length - 1], s = t[i];
    o.x !== s.x && o.y !== s.y && n.push(e ? { x: s.x, y: o.y } : { x: o.x, y: s.y }), n.push(s);
  }
  return n;
}
function ht(t, e, n, i, o, s) {
  return "M " + dt(at(t, e, n, i, o, s), _(i)).map((c) => c.x.toFixed(1) + " " + c.y.toFixed(1)).join(" L ");
}
function Et(t, e) {
  const n = (e || "").trim().toLowerCase(), i = /* @__PURE__ */ new Set();
  if (!n) return i;
  for (const o of t)
    [o.label, o.personName, o.type, o.status, o.id].filter(Boolean).join(" ").toLowerCase().includes(n) && i.add(o.id);
  return i;
}
function ft(t, e, n) {
  n = n ?? 0;
  let i = 1 / 0, o = 1 / 0, s = -1 / 0, l = -1 / 0;
  for (const c of t) {
    const r = C(c, e);
    i = Math.min(i, r.x - c.node.width / 2), o = Math.min(o, r.y - c.node.height / 2), s = Math.max(s, r.x + c.node.width / 2), l = Math.max(l, r.y + c.node.height / 2);
  }
  return isFinite(i) ? { x: i - n, y: o - n, w: s - i + n * 2, h: l - o + n * 2 } : { x: 0, y: 0, w: 100, h: 100 };
}
function Yt(t, e, n, i = {}) {
  const o = i.maxZoom != null ? i.maxZoom : 1.4, s = i.margin != null ? i.margin : 0.92, l = t.w || 1, c = t.h || 1, r = Math.min(e / l, n / c, o) * s;
  return {
    zoom: r,
    panX: (e - l * r) / 2 - t.x * r,
    panY: (n - c * r) / 2 - t.y * r
  };
}
function Ft(t, e, n, i) {
  return {
    orientation: t.orientation,
    subtreeMode: t.subtreeMode,
    spacingX: t.spacingX,
    spacingY: t.spacingY,
    zoom: t.zoom,
    panX: t.panX,
    panY: t.panY,
    manualOffsets: n || {},
    edgeWaypoints: i || {},
    nodes: e.map((o) => ({
      id: o.id,
      parentId: o.parentId,
      type: o.type,
      label: o.label,
      personName: o.personName,
      status: o.status,
      width: o.width,
      height: o.height,
      collapsed: o.collapsed,
      layoutMode: o.layoutMode,
      data: o.data
    }))
  };
}
const R = '"Segoe UI", system-ui, -apple-system, Arial, sans-serif', ut = {
  FILLED: { bg: "#e6f4ea", fg: "#137a3e" },
  VACANT: { bg: "#fdf0e6", fg: "#b25a14" },
  UNFUNDED: { bg: "#fbe7e7", fg: "#b42318" }
};
function X(t) {
  return String(t).replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[e]);
}
function V(t, e, n, i) {
  const o = String(t || "").split(/\s+/).filter(Boolean);
  if (!o.length) return [""];
  const s = [];
  let l = o[0];
  for (let c = 1; c < o.length; c++) {
    const r = l + " " + o[c];
    i(r, e) <= n ? l = r : (s.push(l), l = o[c]);
  }
  return s.push(l), s;
}
function v(t, e, n, i, o, s, l) {
  return `<text x="${t.toFixed(1)}" y="${e.toFixed(1)}" font-family='${R}' font-size="${n.toFixed(2)}" font-weight="${i}" fill="${o}" text-anchor="middle"${l ? ` letter-spacing="${l}"` : ""}>${X(s)}</text>`;
}
function pt(t, e, n, i, o) {
  return `M${t},${e + o} Q${t},${e} ${t + o},${e} H${t + n - o} Q${t + n},${e} ${t + n},${e + o} V${e + i} H${t} V${e + o} Z`;
}
function yt(t, e, n, i, o) {
  const s = t.width, l = t.height, c = 12.5 * i, r = s - 36, a = V((t.label || "").toUpperCase(), `600 ${c}px ${R}`, r, o), u = c * 1.2, f = e + 10 + r / 2;
  let h = n + l / 2 - a.length * u / 2 + c * 0.78, d = `<rect x="${e}" y="${n}" width="${s}" height="${l}" rx="8" fill="url(#loc-teal)"/>`;
  for (const g of a)
    d += v(f, h, c, 600, "#ffffff", g, "0.4"), h += u;
  return d;
}
function gt(t, e, n, i, o, s) {
  const l = t.width, c = t.height, r = 62, a = e + l / 2, u = l - 16;
  let f = `<rect x="${e}" y="${n}" width="${l}" height="${c}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
  f += `<path d="${pt(e, n, l, r, 8)}" fill="#e8edf4"/>`, f += `<line x1="${e}" y1="${n + r}" x2="${e + l}" y2="${n + r}" stroke="#d0d5dd"/>`;
  const h = t.data && t.data.photo_url;
  h && !o ? f += `<image x="${e}" y="${n}" width="${l}" height="${r}" href="${X(h)}" preserveAspectRatio="xMidYMid slice"/>` : f += `<text x="${a.toFixed(1)}" y="${(n + r / 2 + 10).toFixed(1)}" font-family='${R}' font-size="30" fill="#9ca3af" text-anchor="middle">●</text>`;
  const d = n + r, g = c - r, m = 12.5 * i, b = 11 * i, A = m * 1.15, M = b * 1.15, T = V((t.personName || "—").toUpperCase(), `700 ${m}px ${R}`, u, s), S = V(t.label || "", `${b}px ${R}`, u, s), p = t.status ? 15 : 0, I = t.status ? 5 : 0, $ = T.length * A + S.length * M + I + p;
  let w = d + g / 2 - $ / 2 + m * 0.8, y = "";
  for (const x of T)
    y += v(a, w, m, 700, "#1a1a2e", x), w += A;
  for (const x of S)
    y += v(a, w, b, 400, "#4a5568", x), w += M;
  if (t.status) {
    const N = ut[t.status] || { bg: "#eee", fg: "#333" }, O = s(t.status, `700 ${9.5}px ${R}`) + 16, H = a - O / 2, k = w - m * 0.8 + I;
    y += `<rect x="${H.toFixed(1)}" y="${k.toFixed(1)}" width="${O.toFixed(1)}" height="${p}" rx="7.5" fill="${N.bg}"/>`, y += `<text x="${a.toFixed(1)}" y="${(k + 11).toFixed(1)}" font-family='${R}' font-size="${9.5}" font-weight="700" fill="${N.fg}" text-anchor="middle" letter-spacing="0.4">${X(t.status)}</text>`;
  }
  return f + y;
}
function Lt(t, e, n = {}) {
  const i = n.manualOffsets || {}, o = !!n.raster, s = n.measureText || (() => 0), l = n.fitOf || (() => 1), c = ft(t, i, 40);
  let r = "";
  for (const h of e) h && (r += `<path d="${h}" fill="none" stroke="#4a5568" stroke-width="2"/>`);
  let a = "";
  for (const h of t) {
    const d = h.node, g = C(h, i), m = g.x - d.width / 2 - c.x, b = g.y - d.height / 2 - c.y;
    a += d.type === "department" ? yt(d, m, b, l(d), s) : gt(d, m, b, l(d), o, s);
  }
  const u = c.w.toFixed(0), f = c.h.toFixed(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${u}" height="${f}" viewBox="0 0 ${u} ${f}"><defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#2a9d8f"/></linearGradient></defs><rect x="0" y="0" width="${u}" height="${f}" fill="#ffffff"/><g transform="translate(${(-c.x).toFixed(1)},${(-c.y).toFixed(1)})">${r}</g>` + a + "</svg>";
}
const xt = {
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  orientation: "TopToBottom",
  subtreeMode: "Balanced",
  showToolbar: !0,
  showGrid: !1,
  snapGrid: !1,
  alignGrid: !1,
  themeRules: []
  // [{ enabled, field, value, style:{bg,text,border} }]
};
function Bt(t = {}) {
  const e = Object.assign({}, xt, t);
  return e.themeRules = Array.isArray(t.themeRules) ? t.themeRules.map(mt) : [], e;
}
function mt(t = {}) {
  return {
    enabled: t.enabled !== !1,
    field: t.field || "type",
    value: t.value != null ? String(t.value) : "",
    style: {
      bg: t.style && t.style.bg || "",
      text: t.style && t.style.text || "",
      border: t.style && t.style.border || ""
    }
  };
}
function wt(t, e) {
  if (e)
    return e.indexOf("data.") === 0 ? t.data ? t.data[e.slice(5)] : void 0 : e === "type" || e === "status" || e === "id" || e === "label" || e === "personName" ? t[e] : t.data ? t.data[e] : void 0;
}
function Xt(t, e) {
  if (!e || !e.length) return null;
  let n = null;
  for (const i of e) {
    if (i.enabled === !1) continue;
    const o = wt(t, i.field);
    o != null && String(o).toLowerCase() === String(i.value).toLowerCase() && (n = n || {}, i.style.bg && (n.bg = i.style.bg), i.style.text && (n.text = i.style.text), i.style.border && (n.border = i.style.border));
  }
  return n;
}
export {
  $t as CANVAS_PAD,
  At as DEFAULTS,
  xt as DEFAULT_SETTINGS,
  L as DEPT_SIZE,
  Mt as ORIENTATIONS,
  E as POS_SIZE,
  bt as SNAKE_STUB,
  Tt as SUBTREE_MODES,
  P as VIRTUAL_ROOT_ID,
  rt as applyOrientation,
  Lt as buildChartSVG,
  W as buildTree,
  ft as calculateBounds,
  Nt as childCount,
  It as computeDepths,
  z as convertMoTree,
  B as convertNestedTree,
  at as edgeControlPoints,
  lt as edgeEndpoints,
  C as effCenter,
  Ft as exportLayout,
  Yt as fitBounds,
  U as getVisibleTree,
  St as indexNodes,
  _ as isHorizontal,
  K as isMoArray,
  Rt as layoutOrgChart,
  F as lh,
  Y as lw,
  j as makeNode,
  st as normalizeConfig,
  Ct as normalizeImported,
  mt as normalizeRule,
  Bt as normalizeSettings,
  dt as orthoThrough,
  Z as personNameFromPos,
  Xt as resolveNodeStyle,
  _t as routeConnector,
  Et as searchNodes,
  G as visibleDepths,
  ht as waypointPath
};
