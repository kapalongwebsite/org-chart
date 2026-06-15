const G = "__virtual_root__", $t = 26, Tt = 80, Mt = [
  "Balanced",
  "Center",
  "Left",
  "Right",
  "Alternate",
  "AlternateLeft",
  "AlternateRight",
  "Matrix"
], At = ["TopToBottom", "BottomToTop", "LeftToRight", "RightToLeft"], St = {
  orientation: "TopToBottom",
  subtreeMode: "Balanced",
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  alignGrid: !1
}, X = { width: 230, height: 64 }, Y = { width: 180, height: 150 };
function It(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t) e[n.id] = n;
  return e;
}
function W(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const i of t) e[i.id] = { node: i, children: [] };
  const n = {
    node: {
      id: G,
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
function P(t) {
  const e = { node: t.node, children: [] };
  if (!t.node.collapsed)
    for (const n of t.children) e.children.push(P(n));
  return e;
}
function j(t) {
  const e = /* @__PURE__ */ Object.create(null);
  return function n(i, o) {
    i.node.isVirtual || (e[i.node.id] = o);
    const s = i.node.isVirtual ? 0 : o + 1;
    for (const a of i.children) n(a, s);
  }(t, 0), e;
}
function Ct(t, e) {
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
function Z(t) {
  return {
    id: t.id,
    parentId: t.parentId || "",
    type: t.type || "position",
    label: t.label || "",
    personName: t.personName || "",
    status: t.status || "",
    width: t.width || Y.width,
    height: t.height || Y.height,
    collapsed: !!t.collapsed,
    layoutMode: t.layoutMode || null,
    // per-node subtree override
    data: t.data || {}
  };
}
function K(t) {
  const e = [t.firstname, t.lastname].filter(Boolean).join(" ").trim();
  return t.status === "VACANT" ? "— VACANT —" : t.status === "UNFUNDED" ? e || "— UNFUNDED —" : e || "—";
}
function V(t) {
  const e = [];
  function n(i, o) {
    const s = "org-" + (i.org_id != null ? i.org_id : i.id);
    e.push({
      id: s,
      parentId: o,
      type: "department",
      label: i.name || i.label || "UNIT",
      width: X.width,
      height: X.height,
      data: { level: i.level }
    });
    const a = (i.positions || []).slice().sort((r, l) => (r.org_order || 0) - (l.org_order || 0));
    for (const r of a)
      e.push({
        id: "pos-" + r.id,
        parentId: s,
        type: "position",
        label: r.position_title || "POSITION",
        personName: K(r),
        status: r.status || "",
        width: Y.width,
        height: Y.height,
        data: { photo_url: r.photo_url || r.photo || null }
      });
    const c = (i.children || []).slice().sort((r, l) => (r.sort_order || 0) - (l.sort_order || 0));
    for (const r of c) n(r, s);
  }
  for (const i of t) n(i, "");
  return e;
}
function H(t) {
  const e = [];
  let n = 0;
  function i(o, s) {
    const a = "mo-" + n++;
    if (o.type === "organization")
      e.push({
        id: a,
        parentId: s,
        type: "department",
        label: o.name || "UNIT",
        width: X.width,
        height: X.height,
        data: { level: o.meta && o.meta.level, srcId: o.id }
      });
    else {
      const r = o.type === "vacant";
      e.push({
        id: a,
        parentId: s,
        type: "position",
        label: o.position || "POSITION",
        personName: r ? "— VACANT —" : o.name || "—",
        status: r ? "VACANT" : "FILLED",
        width: Y.width,
        height: Y.height,
        data: { photo_url: o.photo_url || null, srcId: o.id }
      });
    }
    const c = (o.children || []).slice().sort((r, l) => (r.meta && r.meta.sort_order || 0) - (l.meta && l.meta.sort_order || 0));
    for (const r of c) i(r, a);
  }
  for (const o of t) i(o, "");
  return e;
}
function q(t) {
  return t.some((e) => e && !("parentId" in e) && (e.type === "organization" || e.type === "filled" || e.type === "vacant" || Array.isArray(e.children) && ("position" in e || "photo_url" in e)));
}
function _t(t) {
  let e, n = null;
  if (Array.isArray(t))
    t.length && q(t) ? e = H(t) : e = t;
  else if (t && Array.isArray(t.nodes))
    e = t.nodes, n = t;
  else if (t && Array.isArray(t.tree))
    e = V(t.tree);
  else if (t && t.tree && typeof t.tree == "object")
    e = V([t.tree]);
  else if (t && t.org_id != null)
    e = V([t]);
  else if (t && Array.isArray(t.children) && t.type)
    e = H([t]);
  else
    throw new Error("Unrecognized JSON. Expected a flat node array, {nodes:[…]}, {tree:[…]}, or an API tree of {type,children}.");
  if (!e.length) throw new Error("No nodes found in data.");
  if (e.find((o) => !o || o.id == null)) throw new Error('Every node needs an "id" field.');
  return { nodes: e, meta: n };
}
const U = 44;
function R(t) {
  return t.orientation === "LeftToRight" || t.orientation === "RightToLeft";
}
function F(t, e) {
  return R(e) ? t.height : t.width;
}
function L(t, e) {
  return R(e) ? t.width : t.height;
}
function Q(t, e) {
  return t.isVirtual ? "Balanced" : t.layoutMode || e.subtreeMode;
}
function J(t) {
  return t === "Alternate" || t === "AlternateLeft" || t === "AlternateRight";
}
function tt(t) {
  return t === "Custom";
}
function k(t, e) {
  const n = t.node, i = t.children, o = F(n, e), s = L(n, e);
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
  const a = i.map((r) => k(r, e)), c = Q(n, e);
  return tt(c) ? ot(t, a, e) : J(c) ? nt(t, a, c, e) : et(t, a, c, e);
}
function et(t, e, n, i) {
  const o = t.node, s = F(o, i), a = o.isVirtual ? 0 : L(o, i), c = n === "Center" ? i.spacingX * 0.5 : i.spacingX, r = [];
  let l = 0;
  for (let x = 0; x < e.length; x++)
    r.push(l), l += e[x].w + c;
  const p = l - c, f = r[0] + e[0].nodeCenterX, h = r[e.length - 1] + e[e.length - 1].nodeCenterX;
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
  const y = d + s / 2, g = Math.max(0, -(d - s / 2));
  for (let x = 0; x < r.length; x++) r[x] += g;
  d += g;
  const $ = Math.max(p + g, y + g), S = a + (o.isVirtual ? 0 : i.spacingY), M = Math.max(...e.map((x) => x.h)), T = [], A = [];
  for (let x = 0; x < e.length; x++)
    T.push({ entry: t.children[x], cx: r[x], cy: S, m: e[x] }), A.push({ childId: t.children[x].node.id, routeType: "bus" });
  return {
    w: $,
    h: S + M,
    anchorLeft: d,
    anchorRight: $ - d,
    nodeCenterX: d,
    nodeCenterY: a / 2,
    childPlacements: T,
    edgeRoutes: A
  };
}
function nt(t, e, n, i) {
  const o = t.node, s = F(o, i), a = o.isVirtual ? 0 : L(o, i), c = n !== "AlternateRight", r = n === "Alternate", l = Math.max(16, i.spacingY * 0.45), p = a + (o.isVirtual ? 0 : i.spacingY), h = (e.length ? e[0].h : 0) / 2 + l / 2;
  let d = p, y = p;
  c ? y += h : d += h;
  const g = [];
  for (let u = 0; u < e.length; u++) {
    const w = e[u];
    let I;
    r ? I = Math.abs(d - y) < 0.01 ? c : d < y : I = c ? u % 2 === 0 : u % 2 === 1, I ? (g.push({ i: u, side: -1, y: d, m: w }), d += w.h + l) : (g.push({ i: u, side: 1, y, m: w }), y += w.h + l);
  }
  const $ = (u) => g.filter((w) => w.side === u).reduce((w, I) => Math.max(w, I.m.w), 0), S = $(-1), M = $(1), T = Math.max(S + 26, s / 2), A = [], x = [];
  for (const u of g) {
    const w = u.side < 0 ? T - 26 - u.m.w : T + 26;
    A[u.i] = { entry: t.children[u.i], cx: w, cy: u.y, m: u.m }, x[u.i] = { childId: t.children[u.i].node.id, routeType: u.side < 0 ? "spine-left" : "spine-right" };
  }
  const C = Math.max(d, y) - l, b = Math.max(T + 26 + M, T + s / 2), m = Math.max(C, p);
  return {
    w: b,
    h: m,
    anchorLeft: T,
    anchorRight: b - T,
    nodeCenterX: T,
    nodeCenterY: a / 2,
    childPlacements: A,
    edgeRoutes: x
  };
}
function ot(t, e, n) {
  const i = t.node, o = e.length, s = !i.isVirtual && i.type === "department" && !!i.parentId && o > 0 && n.orientation === "TopToBottom", a = F(i, n), c = i.isVirtual ? 0 : s ? U : L(i, n), r = n.spacingX, l = Math.max(16, n.spacingY * 0.45), p = Math.max(1, Math.round(Math.sqrt(o) * (n._rowDensity || 1))), f = [];
  for (let b = 0; b < o; b += p) {
    const m = [];
    for (let u = 0; u < p && b + u < o; u++) m.push(b + u);
    f.push(m);
  }
  const h = i.isVirtual ? 0 : s ? Math.max(12, n.spacingY * 0.3) : n.spacingY;
  let y = c + h, g = 0;
  const $ = [];
  for (const b of f) {
    const m = b.reduce((w, I) => w + e[I].w, 0) + (b.length - 1) * r, u = Math.max(...b.map((w) => e[w].h));
    $.push({ y, rowW: m, rowH: u, row: b }), g = Math.max(g, m), y += u + l;
  }
  const S = y - l, M = [], T = [];
  for (const { y: b, rowW: m, rowH: u, row: w } of $) {
    let I = (g - m) / 2;
    for (const _ of w) {
      const B = e[_];
      M[_] = { entry: t.children[_], cx: I, cy: b + (u - B.h) / 2, m: B }, T[_] = { childId: t.children[_].node.id, routeType: "grid" }, I += B.w + r;
    }
  }
  const A = s ? g : Math.max(g, a), x = (A - g) / 2;
  if (x > 0.01) for (let b = 0; b < o; b++) M[b].cx += x;
  const C = A / 2;
  return {
    w: A,
    h: S,
    anchorLeft: C,
    anchorRight: A - C,
    nodeCenterX: C,
    nodeCenterY: c / 2,
    childPlacements: M,
    edgeRoutes: T,
    banner: s,
    bannerW: s ? g : 0,
    bannerH: s ? U : 0
  };
}
function it(t, e) {
  const n = k(t, e), i = [], o = /* @__PURE__ */ Object.create(null);
  return function s(a, c, r, l) {
    const p = a.node, f = r + c.nodeCenterX, h = l + c.nodeCenterY;
    p.isVirtual || (c.banner && (p.width = c.bannerW, p.height = c.bannerH), i.push({
      node: p,
      lx: f,
      ly: h,
      w: F(p, e),
      h: L(p, e),
      parentId: p.parentId,
      routeType: o[p.id] || "bus",
      banner: !!c.banner
    }));
    for (const d of c.edgeRoutes) o[d.childId] = d.routeType;
    for (const d of c.childPlacements) s(d.entry, d.m, r + d.cx, l + d.cy);
  }(t, n, 0, 0), i;
}
function rt(t, e, n) {
  const i = /* @__PURE__ */ Object.create(null);
  for (const c of t) {
    const r = e[c.node.id] || 0;
    (i[r] || (i[r] = [])).push(c);
  }
  const o = Object.keys(i).map(Number).sort((c, r) => c - r), s = n.gridSize;
  let a = 0;
  for (const c of o) {
    const r = i[c], l = Math.max(...r.map((f) => f.h));
    for (const f of r) f.ly = a + l / 2;
    let p = l + n.spacingY;
    n.alignGrid && (p = Math.ceil(p / s) * s), a += p;
  }
}
function st(t, e, n) {
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
function ct(t = {}) {
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
function Et(t, e = {}) {
  const n = ct(e), i = (t || []).map(Z), o = W(i), s = P(o);
  if (n.subtreeMode === "Custom") {
    const h = [0.4, 0.55, 0.7, 0.85, 1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 4];
    let d = 1, y = 1 / 0;
    for (const g of h) {
      const $ = k(s, { ...n, _rowDensity: g }), S = $.h > 0 ? $.w / $.h : 1, M = Math.abs(Math.log(S) - Math.log(n.targetAspect));
      M < y && (y = M, d = g);
    }
    n._rowDensity = d;
  }
  const a = it(s, n);
  n.subtreeMode === "Matrix" && rt(a, j(s), n);
  for (const h of a) {
    const d = st(h.lx, h.ly, n);
    h.cx = d.x, h.cy = d.y;
  }
  let c = 1 / 0, r = 1 / 0;
  for (const h of a)
    c = Math.min(c, h.cx - h.node.width / 2), r = Math.min(r, h.cy - h.node.height / 2);
  isFinite(c) || (c = 0, r = 0);
  const l = 80 - c, p = 80 - r;
  for (const h of a)
    h.cx += l, h.cy += p;
  if (n.alignGrid) {
    const h = n.gridSize;
    for (const d of a)
      d.cx = Math.round(d.cx / h) * h, d.cy = Math.round(d.cy / h) * h;
  }
  const f = /* @__PURE__ */ Object.create(null);
  for (const h of a) f[h.node.id] = h;
  return { positioned: a, posById: f, cfg: n, bounds: at(a) };
}
function at(t) {
  let e = 1 / 0, n = 1 / 0, i = -1 / 0, o = -1 / 0;
  for (const s of t)
    e = Math.min(e, s.cx - s.node.width / 2), n = Math.min(n, s.cy - s.node.height / 2), i = Math.max(i, s.cx + s.node.width / 2), o = Math.max(o, s.cy + s.node.height / 2);
  return isFinite(e) ? { x: e, y: n, w: i - e, h: o - n } : { x: 0, y: 0, w: 0, h: 0 };
}
function N(t, e) {
  const n = e && e[t.node.id];
  return { x: t.cx + (n ? n.dx : 0), y: t.cy + (n ? n.dy : 0) };
}
function Rt(t, e, n, i, o, s) {
  const a = o && o[e.node.id], c = s && s[e.node.id];
  if (a && a.length || c) return ft(t, e, a || [], n, i, c);
  const r = N(t, i), l = N(e, i), p = t.node.width, f = t.node.height, h = e.node.width, d = e.node.height, y = R(n), g = r.y - f / 2, $ = r.y + f / 2, S = r.x - p / 2, M = r.x + p / 2, T = l.y - d / 2, A = l.y + d / 2, x = l.x - h / 2, C = l.x + h / 2, b = [];
  if (e.routeType === "bus" || e.routeType === "grid")
    if (y) {
      const m = l.x >= r.x ? M : S, u = l.x >= r.x ? x : C, w = (m + u) / 2;
      b.push([m, r.y], [w, r.y], [w, l.y], [u, l.y]);
    } else {
      const m = l.y >= r.y ? $ : g, u = l.y >= r.y ? T : A, w = (m + u) / 2;
      b.push([r.x, m], [r.x, w], [l.x, w], [l.x, u]);
    }
  else if (y) {
    const m = l.x >= r.x ? M : S, u = l.y <= r.y ? A : T;
    b.push([m, r.y], [l.x, r.y], [l.x, u]);
  } else {
    const m = l.y >= r.y ? $ : g, u = l.x <= r.x ? C : x;
    b.push([r.x, m], [r.x, l.y], [u, l.y]);
  }
  return "M " + b.map((m) => m[0].toFixed(1) + " " + m[1].toFixed(1)).join(" L ");
}
function lt(t, e, n, i, o, s, a) {
  const c = N(t, s), r = N(e, s), l = t.node.width, p = t.node.height, f = e.node.width, h = e.node.height;
  let d, y;
  return a && a.p ? d = { x: c.x + a.p.nx * l / 2, y: c.y + a.p.ny * p / 2 } : R(o) ? d = { x: n.x >= c.x ? c.x + l / 2 : c.x - l / 2, y: c.y } : d = { x: c.x, y: n.y >= c.y ? c.y + p / 2 : c.y - p / 2 }, a && a.c ? y = { x: r.x + a.c.nx * f / 2, y: r.y + a.c.ny * h / 2 } : R(o) ? y = { x: i.x >= r.x ? r.x + f / 2 : r.x - f / 2, y: r.y } : y = { x: r.x, y: i.y >= r.y ? r.y + h / 2 : r.y - h / 2 }, { S: d, E: y };
}
function dt(t, e, n, i, o, s) {
  const a = n.length ? n[0] : N(e, o), c = n.length ? n[n.length - 1] : N(t, o), r = lt(t, e, a, c, i, o, s), l = r.S;
  let p = r.E;
  if (!n.length && !(s && s.c) && e.routeType !== "bus") {
    const f = N(e, o), h = N(t, o), d = e.node.width, y = e.node.height;
    p = R(i) ? { x: f.x, y: f.y <= h.y ? f.y + y / 2 : f.y - y / 2 } : { x: f.x <= h.x ? f.x + d / 2 : f.x - d / 2, y: f.y };
  }
  return [l].concat(n.map((f) => ({ x: f.x, y: f.y })), [p]);
}
function ht(t, e) {
  const n = [t[0]];
  for (let i = 1; i < t.length; i++) {
    const o = n[n.length - 1], s = t[i];
    o.x !== s.x && o.y !== s.y && n.push(e ? { x: s.x, y: o.y } : { x: o.x, y: s.y }), n.push(s);
  }
  return n;
}
function ft(t, e, n, i, o, s) {
  return "M " + ht(dt(t, e, n, i, o, s), R(i)).map((c) => c.x.toFixed(1) + " " + c.y.toFixed(1)).join(" L ");
}
function Yt(t, e) {
  const n = (e || "").trim().toLowerCase(), i = /* @__PURE__ */ new Set();
  if (!n) return i;
  for (const o of t)
    [o.label, o.personName, o.type, o.status, o.id].filter(Boolean).join(" ").toLowerCase().includes(n) && i.add(o.id);
  return i;
}
function ut(t, e, n) {
  n = n ?? 0;
  let i = 1 / 0, o = 1 / 0, s = -1 / 0, a = -1 / 0;
  for (const c of t) {
    const r = N(c, e);
    i = Math.min(i, r.x - c.node.width / 2), o = Math.min(o, r.y - c.node.height / 2), s = Math.max(s, r.x + c.node.width / 2), a = Math.max(a, r.y + c.node.height / 2);
  }
  return isFinite(i) ? { x: i - n, y: o - n, w: s - i + n * 2, h: a - o + n * 2 } : { x: 0, y: 0, w: 100, h: 100 };
}
function Bt(t, e, n, i = {}) {
  const o = i.maxZoom != null ? i.maxZoom : 1.4, s = i.margin != null ? i.margin : 0.92, a = t.w || 1, c = t.h || 1, r = Math.min(e / a, n / c, o) * s;
  return {
    zoom: r,
    panX: (e - a * r) / 2 - t.x * r,
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
const E = '"Segoe UI", system-ui, -apple-system, Arial, sans-serif', pt = {
  FILLED: { bg: "#e6f4ea", fg: "#137a3e" },
  VACANT: { bg: "#fdf0e6", fg: "#b25a14" },
  UNFUNDED: { bg: "#fbe7e7", fg: "#b42318" }
};
function v(t) {
  return String(t).replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[e]);
}
function D(t, e, n, i) {
  const o = String(t || "").split(/\s+/).filter(Boolean);
  if (!o.length) return [""];
  const s = [];
  let a = o[0];
  for (let c = 1; c < o.length; c++) {
    const r = a + " " + o[c];
    i(r, e) <= n ? a = r : (s.push(a), a = o[c]);
  }
  return s.push(a), s;
}
function O(t, e, n, i, o, s, a) {
  return `<text x="${t.toFixed(1)}" y="${e.toFixed(1)}" font-family='${E}' font-size="${n.toFixed(2)}" font-weight="${i}" fill="${o}" text-anchor="middle"${a ? ` letter-spacing="${a}"` : ""}>${v(s)}</text>`;
}
function yt(t, e, n, i, o) {
  return `M${t},${e + o} Q${t},${e} ${t + o},${e} H${t + n - o} Q${t + n},${e} ${t + n},${e + o} V${e + i} H${t} V${e + o} Z`;
}
function gt(t, e, n, i, o) {
  const s = t.width, a = t.height, c = 12.5 * i, r = s - 36, l = D((t.label || "").toUpperCase(), `600 ${c}px ${E}`, r, o), p = c * 1.2, f = e + 10 + r / 2;
  let h = n + a / 2 - l.length * p / 2 + c * 0.78, d = `<rect x="${e}" y="${n}" width="${s}" height="${a}" rx="8" fill="url(#loc-teal)"/>`;
  for (const y of l)
    d += O(f, h, c, 600, "#ffffff", y, "0.4"), h += p;
  return d;
}
function xt(t, e, n, i, o, s) {
  const a = t.width, c = t.height, r = 62, l = e + a / 2, p = a - 16;
  let f = `<rect x="${e}" y="${n}" width="${a}" height="${c}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
  f += `<path d="${yt(e, n, a, r, 8)}" fill="#e8edf4"/>`, f += `<line x1="${e}" y1="${n + r}" x2="${e + a}" y2="${n + r}" stroke="#d0d5dd"/>`;
  const h = t.data && t.data.photo_url;
  h && !o ? f += `<image x="${e}" y="${n}" width="${a}" height="${r}" href="${v(h)}" preserveAspectRatio="xMidYMid slice"/>` : f += `<text x="${l.toFixed(1)}" y="${(n + r / 2 + 10).toFixed(1)}" font-family='${E}' font-size="30" fill="#9ca3af" text-anchor="middle">●</text>`;
  const d = n + r, y = c - r, g = 12.5 * i, $ = 11 * i, S = g * 1.15, M = $ * 1.15, T = D((t.personName || "—").toUpperCase(), `700 ${g}px ${E}`, p, s), A = D(t.label || "", `${$}px ${E}`, p, s), x = t.status ? 15 : 0, C = t.status ? 5 : 0, b = T.length * S + A.length * M + C + x;
  let m = d + y / 2 - b / 2 + g * 0.8, u = "";
  for (const w of T)
    u += O(l, m, g, 700, "#1a1a2e", w), m += S;
  for (const w of A)
    u += O(l, m, $, 400, "#4a5568", w), m += M;
  if (t.status) {
    const I = pt[t.status] || { bg: "#eee", fg: "#333" }, _ = s(t.status, `700 ${9.5}px ${E}`) + 16, B = l - _ / 2, z = m - g * 0.8 + C;
    u += `<rect x="${B.toFixed(1)}" y="${z.toFixed(1)}" width="${_.toFixed(1)}" height="${x}" rx="7.5" fill="${I.bg}"/>`, u += `<text x="${l.toFixed(1)}" y="${(z + 11).toFixed(1)}" font-family='${E}' font-size="${9.5}" font-weight="700" fill="${I.fg}" text-anchor="middle" letter-spacing="0.4">${v(t.status)}</text>`;
  }
  return f + u;
}
function Lt(t, e, n = {}) {
  const i = n.manualOffsets || {}, o = !!n.raster, s = n.measureText || (() => 0), a = n.fitOf || (() => 1), c = ut(t, i, 40);
  let r = "";
  for (const h of e) h && (r += `<path d="${h}" fill="none" stroke="#4a5568" stroke-width="2"/>`);
  let l = "";
  for (const h of t) {
    const d = h.node, y = N(h, i), g = y.x - d.width / 2 - c.x, $ = y.y - d.height / 2 - c.y;
    l += d.type === "department" ? gt(d, g, $, a(d), s) : xt(d, g, $, a(d), o, s);
  }
  const p = c.w.toFixed(0), f = c.h.toFixed(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${p}" height="${f}" viewBox="0 0 ${p} ${f}"><defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#2a9d8f"/></linearGradient></defs><rect x="0" y="0" width="${p}" height="${f}" fill="#ffffff"/><g transform="translate(${(-c.x).toFixed(1)},${(-c.y).toFixed(1)})">${r}</g>` + l + "</svg>";
}
const mt = {
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
function Xt(t = {}) {
  const e = Object.assign({}, mt, t);
  return e.themeRules = Array.isArray(t.themeRules) ? t.themeRules.map(wt) : [], e;
}
function wt(t = {}) {
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
function bt(t, e) {
  if (e)
    return e.indexOf("data.") === 0 ? t.data ? t.data[e.slice(5)] : void 0 : e === "type" || e === "status" || e === "id" || e === "label" || e === "personName" ? t[e] : t.data ? t.data[e] : void 0;
}
function Vt(t, e) {
  if (!e || !e.length) return null;
  let n = null;
  for (const i of e) {
    if (i.enabled === !1) continue;
    const o = bt(t, i.field);
    o != null && String(o).toLowerCase() === String(i.value).toLowerCase() && (n = n || {}, i.style.bg && (n.bg = i.style.bg), i.style.text && (n.text = i.style.text), i.style.border && (n.border = i.style.border));
  }
  return n;
}
export {
  Tt as CANVAS_PAD,
  St as DEFAULTS,
  mt as DEFAULT_SETTINGS,
  X as DEPT_SIZE,
  At as ORIENTATIONS,
  Y as POS_SIZE,
  $t as SNAKE_STUB,
  Mt as SUBTREE_MODES,
  G as VIRTUAL_ROOT_ID,
  st as applyOrientation,
  Lt as buildChartSVG,
  W as buildTree,
  ut as calculateBounds,
  Nt as childCount,
  Ct as computeDepths,
  H as convertMoTree,
  V as convertNestedTree,
  dt as edgeControlPoints,
  lt as edgeEndpoints,
  N as effCenter,
  Ft as exportLayout,
  Bt as fitBounds,
  P as getVisibleTree,
  It as indexNodes,
  R as isHorizontal,
  q as isMoArray,
  Et as layoutOrgChart,
  L as lh,
  F as lw,
  Z as makeNode,
  ct as normalizeConfig,
  _t as normalizeImported,
  wt as normalizeRule,
  Xt as normalizeSettings,
  ht as orthoThrough,
  K as personNameFromPos,
  Vt as resolveNodeStyle,
  Rt as routeConnector,
  Yt as searchNodes,
  j as visibleDepths,
  ft as waypointPath
};
