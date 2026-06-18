const Z = "__virtual_root__", Tt = 26, Mt = 80, St = [
  "Balanced",
  "Center",
  "Left",
  "Right",
  "Alternate",
  "AlternateLeft",
  "AlternateRight",
  "Matrix"
], At = ["TopToBottom", "BottomToTop", "LeftToRight", "RightToLeft"], It = {
  orientation: "TopToBottom",
  subtreeMode: "Balanced",
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  alignGrid: !1
}, Y = { width: 240, height: 70 }, R = { width: 196, height: 188 };
function Nt(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t) e[n.id] = n;
  return e;
}
function K(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const i of t) e[i.id] = { node: i, children: [] };
  const n = {
    node: {
      id: Z,
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
function G(t) {
  const e = { node: t.node, children: [] };
  if (!t.node.collapsed)
    for (const n of t.children) e.children.push(G(n));
  return e;
}
function q(t) {
  const e = /* @__PURE__ */ Object.create(null);
  return function n(i, o) {
    i.node.isVirtual || (e[i.node.id] = o);
    const s = i.node.isVirtual ? 0 : o + 1;
    for (const l of i.children) n(l, s);
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
function Et(t, e) {
  let n = 0;
  for (const i of t) i.parentId === e && n++;
  return n;
}
function Q(t) {
  return {
    id: t.id,
    parentId: t.parentId || "",
    type: t.type || "position",
    label: t.label || "",
    personName: t.personName || "",
    status: t.status || "",
    width: t.width || R.width,
    height: t.height || R.height,
    collapsed: !!t.collapsed,
    layoutMode: t.layoutMode || null,
    // per-node subtree override
    data: t.data || {}
  };
}
function J(t) {
  const e = [t.firstname, t.lastname].filter(Boolean).join(" ").trim();
  return t.status === "VACANT" ? "— VACANT —" : t.status === "UNFUNDED" ? e || "— UNFUNDED —" : e || "—";
}
function v(t) {
  const e = [];
  function n(i, o) {
    const s = "org-" + (i.org_id != null ? i.org_id : i.id);
    e.push({
      id: s,
      parentId: o,
      type: "department",
      label: i.name || i.label || "UNIT",
      width: Y.width,
      height: Y.height,
      data: { level: i.level }
    });
    const l = (i.positions || []).slice().sort((r, a) => (r.org_order || 0) - (a.org_order || 0));
    for (const r of l)
      e.push({
        id: "pos-" + r.id,
        parentId: s,
        type: "position",
        label: r.position_title || "POSITION",
        personName: J(r),
        status: r.status || "",
        width: R.width,
        height: R.height,
        data: { photo_url: r.photo_url || r.photo || null }
      });
    const c = (i.children || []).slice().sort((r, a) => (r.sort_order || 0) - (a.sort_order || 0));
    for (const r of c) n(r, s);
  }
  for (const i of t) n(i, "");
  return e;
}
function H(t) {
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
        width: Y.width,
        height: Y.height,
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
        width: R.width,
        height: R.height,
        data: { photo_url: o.photo_url || null, srcId: o.id }
      });
    }
    const c = (o.children || []).slice().sort((r, a) => (r.meta && r.meta.sort_order || 0) - (a.meta && a.meta.sort_order || 0));
    for (const r of c) i(r, l);
  }
  for (const o of t) i(o, "");
  return e;
}
function tt(t) {
  return t.some((e) => e && !("parentId" in e) && (e.type === "organization" || e.type === "filled" || e.type === "vacant" || Array.isArray(e.children) && ("position" in e || "photo_url" in e)));
}
function _t(t) {
  let e, n = null;
  if (Array.isArray(t))
    t.length && tt(t) ? e = H(t) : e = t;
  else if (t && Array.isArray(t.nodes))
    e = t.nodes, n = t;
  else if (t && Array.isArray(t.tree))
    e = v(t.tree);
  else if (t && t.tree && typeof t.tree == "object")
    e = v([t.tree]);
  else if (t && t.org_id != null)
    e = v([t]);
  else if (t && Array.isArray(t.children) && t.type)
    e = H([t]);
  else
    throw new Error("Unrecognized JSON. Expected a flat node array, {nodes:[…]}, {tree:[…]}, or an API tree of {type,children}.");
  if (!e.length) throw new Error("No nodes found in data.");
  if (e.find((o) => !o || o.id == null)) throw new Error('Every node needs an "id" field.');
  return { nodes: e, meta: n };
}
function _(t) {
  return t.orientation === "LeftToRight" || t.orientation === "RightToLeft";
}
function B(t, e) {
  return _(e) ? t.height : t.width;
}
function X(t, e) {
  return _(e) ? t.width : t.height;
}
function et(t, e) {
  return t.isVirtual ? "Balanced" : t.layoutMode || e.subtreeMode;
}
function nt(t) {
  return t === "Alternate" || t === "AlternateLeft" || t === "AlternateRight";
}
function j(t, e) {
  const n = t.node, i = t.children, o = B(n, e), s = X(n, e);
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
  const l = i.map((r) => j(r, e)), c = et(n, e);
  return nt(c) ? it(t, l, c, e) : ot(t, l, c, e);
}
function ot(t, e, n, i) {
  const o = t.node, s = B(o, i), l = o.isVirtual ? 0 : X(o, i), c = n === "Center" ? i.spacingX * 0.5 : i.spacingX, r = [];
  let a = 0;
  for (let g = 0; g < e.length; g++)
    r.push(a), a += e[g].w + c;
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
  const y = d + s / 2, x = Math.max(0, -(d - s / 2));
  for (let g = 0; g < r.length; g++) r[g] += x;
  d += x;
  const $ = Math.max(u + x, y + x), T = l + (o.isVirtual ? 0 : i.spacingY), M = Math.max(...e.map((g) => g.h)), w = [], A = [];
  for (let g = 0; g < e.length; g++)
    w.push({ entry: t.children[g], cx: r[g], cy: T, m: e[g] }), A.push({ childId: t.children[g].node.id, routeType: "bus" });
  return {
    w: $,
    h: T + M,
    anchorLeft: d,
    anchorRight: $ - d,
    nodeCenterX: d,
    nodeCenterY: l / 2,
    childPlacements: w,
    edgeRoutes: A
  };
}
function it(t, e, n, i) {
  const o = t.node, s = B(o, i), l = o.isVirtual ? 0 : X(o, i), c = n !== "AlternateRight", r = n === "Alternate", a = Math.max(16, i.spacingY * 0.45), u = l + (o.isVirtual ? 0 : i.spacingY), h = (e.length ? e[0].h : 0) / 2 + a / 2;
  let d = u, y = u;
  c ? y += h : d += h;
  const x = [];
  for (let p = 0; p < e.length; p++) {
    const m = e[p];
    let N;
    r ? N = Math.abs(d - y) < 0.01 ? c : d < y : N = c ? p % 2 === 0 : p % 2 === 1, N ? (x.push({ i: p, side: -1, y: d, m }), d += m.h + a) : (x.push({ i: p, side: 1, y, m }), y += m.h + a);
  }
  const $ = (p) => x.filter((m) => m.side === p).reduce((m, N) => Math.max(m, N.m.w), 0), T = $(-1), M = $(1), w = Math.max(T + 26, s / 2), A = [], g = [];
  for (const p of x) {
    const m = p.side < 0 ? w - 26 - p.m.w : w + 26;
    A[p.i] = { entry: t.children[p.i], cx: m, cy: p.y, m: p.m }, g[p.i] = { childId: t.children[p.i].node.id, routeType: p.side < 0 ? "spine-left" : "spine-right" };
  }
  const C = Math.max(d, y) - a, I = Math.max(w + 26 + M, w + s / 2), b = Math.max(C, u);
  return {
    w: I,
    h: b,
    anchorLeft: w,
    anchorRight: I - w,
    nodeCenterX: w,
    nodeCenterY: l / 2,
    childPlacements: A,
    edgeRoutes: g
  };
}
function rt(t, e) {
  const n = j(t, e), i = [], o = /* @__PURE__ */ Object.create(null);
  return function s(l, c, r, a) {
    const u = l.node, f = r + c.nodeCenterX, h = a + c.nodeCenterY;
    u.isVirtual || i.push({
      node: u,
      lx: f,
      ly: h,
      w: B(u, e),
      h: X(u, e),
      parentId: u.parentId,
      routeType: o[u.id] || "bus"
    });
    for (const d of c.edgeRoutes) o[d.childId] = d.routeType;
    for (const d of c.childPlacements) s(d.entry, d.m, r + d.cx, a + d.cy);
  }(t, n, 0, 0), i;
}
function st(t, e, n) {
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
function ct(t, e, n) {
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
function lt(t = {}) {
  return {
    orientation: t.orientation || "TopToBottom",
    subtreeMode: t.subtreeMode || "Balanced",
    spacingX: t.spacingX != null ? t.spacingX : 40,
    spacingY: t.spacingY != null ? t.spacingY : 70,
    gridSize: t.gridSize != null ? t.gridSize : 22,
    alignGrid: !!t.alignGrid,
    autoEdgeSide: !!t.autoEdgeSide
  };
}
function Ft(t, e = {}) {
  const n = lt(e), i = (t || []).map(Q), o = K(i), s = G(o), l = rt(s, n);
  n.subtreeMode === "Matrix" && st(l, q(s), n);
  for (const h of l) {
    const d = ct(h.lx, h.ly, n);
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
  return { positioned: l, posById: f, cfg: n, bounds: at(l) };
}
function at(t) {
  let e = 1 / 0, n = 1 / 0, i = -1 / 0, o = -1 / 0;
  for (const s of t)
    e = Math.min(e, s.cx - s.node.width / 2), n = Math.min(n, s.cy - s.node.height / 2), i = Math.max(i, s.cx + s.node.width / 2), o = Math.max(o, s.cy + s.node.height / 2);
  return isFinite(e) ? { x: e, y: n, w: i - e, h: o - n } : { x: 0, y: 0, w: 0, h: 0 };
}
function S(t, e) {
  const n = e && e[t.node.id];
  return { x: t.cx + (n ? n.dx : 0), y: t.cy + (n ? n.dy : 0) };
}
function Rt(t, e, n, i, o, s) {
  const l = o && o[e.node.id], c = s && s[e.node.id];
  if (l && l.length || c) return ut(t, e, l || [], n, i, c);
  const r = S(t, i), a = S(e, i), u = t.node.width, f = t.node.height, h = e.node.width, d = e.node.height, y = _(n), x = r.y - f / 2, $ = r.y + f / 2, T = r.x - u / 2, M = r.x + u / 2, w = a.y - d / 2, A = a.y + d / 2, g = a.x - h / 2, C = a.x + h / 2, I = [];
  if (e.routeType === "bus")
    if (y) {
      const b = a.x >= r.x ? M : T, p = a.x >= r.x ? g : C, m = (b + p) / 2;
      I.push([b, r.y], [m, r.y], [m, a.y], [p, a.y]);
    } else {
      const b = a.y >= r.y ? $ : x, p = a.y >= r.y ? w : A, m = (b + p) / 2;
      I.push([r.x, b], [r.x, m], [a.x, m], [a.x, p]);
    }
  else if (y) {
    const b = a.x >= r.x ? M : T, p = a.y <= r.y ? A : w;
    I.push([b, r.y], [a.x, r.y], [a.x, p]);
  } else {
    const b = a.y >= r.y ? $ : x, p = a.x <= r.x ? C : g;
    I.push([r.x, b], [r.x, a.y], [p, a.y]);
  }
  return "M " + I.map((b) => b[0].toFixed(1) + " " + b[1].toFixed(1)).join(" L ");
}
function dt(t, e, n, i, o, s, l) {
  const c = S(t, s), r = S(e, s), a = t.node.width, u = t.node.height, f = e.node.width, h = e.node.height;
  let d, y;
  return l && l.p ? d = { x: c.x + l.p.nx * a / 2, y: c.y + l.p.ny * u / 2 } : _(o) ? d = { x: n.x >= c.x ? c.x + a / 2 : c.x - a / 2, y: c.y } : d = { x: c.x, y: n.y >= c.y ? c.y + u / 2 : c.y - u / 2 }, l && l.c ? y = { x: r.x + l.c.nx * f / 2, y: r.y + l.c.ny * h / 2 } : _(o) ? y = { x: i.x >= r.x ? r.x + f / 2 : r.x - f / 2, y: r.y } : y = { x: r.x, y: i.y >= r.y ? r.y + h / 2 : r.y - h / 2 }, { S: d, E: y };
}
function ht(t, e, n, i, o, s) {
  const l = n.length ? n[0] : S(e, o), c = n.length ? n[n.length - 1] : S(t, o), r = dt(t, e, l, c, i, o, s);
  let a = r.S, u = r.E;
  if (i.autoEdgeSide && n.length)
    s && s.p || (a = P(t, S(t, o), n[0])), s && s.c || (u = P(e, S(e, o), n[n.length - 1]));
  else if (!n.length && !(s && s.c) && e.routeType !== "bus") {
    const f = S(e, o), h = S(t, o), d = e.node.width, y = e.node.height;
    u = _(i) ? { x: f.x, y: f.y <= h.y ? f.y + y / 2 : f.y - y / 2 } : { x: f.x <= h.x ? f.x + d / 2 : f.x - d / 2, y: f.y };
  }
  return [a].concat(n.map((f) => ({ x: f.x, y: f.y })), [u]);
}
function P(t, e, n) {
  const i = t.node.width, o = t.node.height, s = n.x - e.x, l = n.y - e.y;
  return Math.abs(s) * o >= Math.abs(l) * i ? { x: e.x + (s >= 0 ? i / 2 : -i / 2), y: e.y } : { x: e.x, y: e.y + (l >= 0 ? o / 2 : -o / 2) };
}
function ft(t, e) {
  const n = [t[0]];
  for (let i = 1; i < t.length; i++) {
    const o = n[n.length - 1], s = t[i];
    o.x !== s.x && o.y !== s.y && n.push(e ? { x: s.x, y: o.y } : { x: o.x, y: s.y }), n.push(s);
  }
  return n;
}
function ut(t, e, n, i, o, s) {
  return "M " + ft(ht(t, e, n, i, o, s), _(i)).map((c) => c.x.toFixed(1) + " " + c.y.toFixed(1)).join(" L ");
}
function Lt(t, e) {
  const n = (e || "").trim().toLowerCase(), i = /* @__PURE__ */ new Set();
  if (!n) return i;
  for (const o of t)
    [o.label, o.personName, o.type, o.status, o.id].filter(Boolean).join(" ").toLowerCase().includes(n) && i.add(o.id);
  return i;
}
function pt(t, e, n) {
  n = n ?? 0;
  let i = 1 / 0, o = 1 / 0, s = -1 / 0, l = -1 / 0;
  for (const c of t) {
    const r = S(c, e);
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
function Bt(t, e, n, i) {
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
const E = '"Segoe UI", system-ui, -apple-system, Arial, sans-serif', yt = {
  FILLED: { bg: "#e6f4ea", fg: "#137a3e" },
  VACANT: { bg: "#fdf0e6", fg: "#b25a14" },
  UNFUNDED: { bg: "#fbe7e7", fg: "#b42318" }
};
function V(t) {
  return String(t).replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[e]);
}
function z(t, e, n, i) {
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
function O(t, e, n, i, o, s, l) {
  return `<text x="${t.toFixed(1)}" y="${e.toFixed(1)}" font-family='${E}' font-size="${n.toFixed(2)}" font-weight="${i}" fill="${o}" text-anchor="middle"${l ? ` letter-spacing="${l}"` : ""}>${V(s)}</text>`;
}
function gt(t, e, n, i, o) {
  return `M${t},${e + o} Q${t},${e} ${t + o},${e} H${t + n - o} Q${t + n},${e} ${t + n},${e + o} V${e + i} H${t} V${e + o} Z`;
}
function xt(t, e, n, i, o) {
  const s = t.width, l = t.height, c = 13.5 * i, r = s - 36, a = z((t.label || "").toUpperCase(), `600 ${c}px ${E}`, r, o), u = c * 1.2, f = e + 10 + r / 2;
  let h = n + l / 2 - a.length * u / 2 + c * 0.78, d = `<rect x="${e}" y="${n}" width="${s}" height="${l}" rx="8" fill="url(#loc-teal)"/>`;
  for (const y of a)
    d += O(f, h, c, 600, "#ffffff", y, "0.4"), h += u;
  return d;
}
function mt(t, e, n, i, o, s, l) {
  l = l || {};
  const c = t.width, r = t.height, a = e + c / 2, u = c - 16, f = Math.max(20, Math.min(l.photoH || 62, r - 20));
  let h = `<rect x="${e}" y="${n}" width="${c}" height="${r}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
  h += `<path d="${gt(e, n, c, f, 8)}" fill="#e8edf4"/>`, h += `<line x1="${e}" y1="${n + f}" x2="${e + c}" y2="${n + f}" stroke="#d0d5dd"/>`;
  const d = t.data && t.data.photo_url, x = (d && l.images ? l.images[d] : null) || (d && !o ? d : null);
  if (x) {
    const F = l.contain ? "xMidYMid meet" : "xMidYMid slice";
    h += `<image x="${e}" y="${n}" width="${c}" height="${f}" href="${V(x)}" preserveAspectRatio="${F}"/>`;
  } else
    h += `<text x="${a.toFixed(1)}" y="${(n + f / 2 + 10).toFixed(1)}" font-family='${E}' font-size="30" fill="#9ca3af" text-anchor="middle">●</text>`;
  const $ = n + f, T = r - f, M = 13.5 * i, w = 12 * i, A = M * 1.15, g = w * 1.15, C = z((t.personName || "—").toUpperCase(), `700 ${M}px ${E}`, u, s), I = z(t.label || "", `${w}px ${E}`, u, s), b = t.status ? 15 : 0, p = t.status ? 5 : 0, m = C.length * A + I.length * g + p + b;
  let N = $ + T / 2 - m / 2 + M * 0.8, L = "";
  for (const F of C)
    L += O(a, N, M, 700, "#1a1a2e", F), N += A;
  for (const F of I)
    L += O(a, N, w, 400, "#4a5568", F), N += g;
  if (t.status) {
    const D = yt[t.status] || { bg: "#eee", fg: "#333" }, U = s(t.status, `700 10px ${E}`) + 16, W = a - U / 2, k = N - M * 0.8 + p;
    L += `<rect x="${W.toFixed(1)}" y="${k.toFixed(1)}" width="${U.toFixed(1)}" height="${b}" rx="7.5" fill="${D.bg}"/>`, L += `<text x="${a.toFixed(1)}" y="${(k + 11).toFixed(1)}" font-family='${E}' font-size="10" font-weight="700" fill="${D.fg}" text-anchor="middle" letter-spacing="0.4">${V(t.status)}</text>`;
  }
  return h + L;
}
function Xt(t, e, n = {}) {
  const i = n.manualOffsets || {}, o = !!n.raster, s = n.measureText || (() => 0), l = n.fitOf || (() => 1), c = { photoH: n.photoHeight || 62, images: n.images || null, contain: n.photoContain !== !1 }, r = pt(t, i, 40);
  let a = "";
  for (const d of e) d && (a += `<path d="${d}" fill="none" stroke="#4a5568" stroke-width="2"/>`);
  let u = "";
  for (const d of t) {
    const y = d.node, x = S(d, i), $ = x.x - y.width / 2 - r.x, T = x.y - y.height / 2 - r.y;
    u += y.type === "department" ? xt(y, $, T, l(y), s) : mt(y, $, T, l(y), o, s, c);
  }
  const f = r.w.toFixed(0), h = r.h.toFixed(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${f}" height="${h}" viewBox="0 0 ${f} ${h}"><defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#2a9d8f"/></linearGradient></defs><rect x="0" y="0" width="${f}" height="${h}" fill="#ffffff"/><g transform="translate(${(-r.x).toFixed(1)},${(-r.y).toFixed(1)})">${a}</g>` + u + "</svg>";
}
const wt = {
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
function vt(t = {}) {
  const e = Object.assign({}, wt, t);
  return e.themeRules = Array.isArray(t.themeRules) ? t.themeRules.map(bt) : [], e;
}
function bt(t = {}) {
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
function $t(t, e) {
  if (e)
    return e.indexOf("data.") === 0 ? t.data ? t.data[e.slice(5)] : void 0 : e === "type" || e === "status" || e === "id" || e === "label" || e === "personName" ? t[e] : t.data ? t.data[e] : void 0;
}
function Vt(t, e) {
  if (!e || !e.length) return null;
  let n = null;
  for (const i of e) {
    if (i.enabled === !1) continue;
    const o = $t(t, i.field);
    o != null && String(o).toLowerCase() === String(i.value).toLowerCase() && (n = n || {}, i.style.bg && (n.bg = i.style.bg), i.style.text && (n.text = i.style.text), i.style.border && (n.border = i.style.border));
  }
  return n;
}
export {
  Mt as CANVAS_PAD,
  It as DEFAULTS,
  wt as DEFAULT_SETTINGS,
  Y as DEPT_SIZE,
  At as ORIENTATIONS,
  R as POS_SIZE,
  Tt as SNAKE_STUB,
  St as SUBTREE_MODES,
  Z as VIRTUAL_ROOT_ID,
  ct as applyOrientation,
  Xt as buildChartSVG,
  K as buildTree,
  pt as calculateBounds,
  Et as childCount,
  Ct as computeDepths,
  H as convertMoTree,
  v as convertNestedTree,
  ht as edgeControlPoints,
  dt as edgeEndpoints,
  S as effCenter,
  Bt as exportLayout,
  Yt as fitBounds,
  G as getVisibleTree,
  Nt as indexNodes,
  _ as isHorizontal,
  tt as isMoArray,
  Ft as layoutOrgChart,
  X as lh,
  B as lw,
  Q as makeNode,
  lt as normalizeConfig,
  _t as normalizeImported,
  bt as normalizeRule,
  vt as normalizeSettings,
  ft as orthoThrough,
  J as personNameFromPos,
  Vt as resolveNodeStyle,
  Rt as routeConnector,
  Lt as searchNodes,
  q as visibleDepths,
  ut as waypointPath
};
