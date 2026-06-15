const G = "__virtual_root__", mt = 26, wt = 80, bt = [
  "Balanced",
  "Center",
  "Left",
  "Right",
  "Alternate",
  "AlternateLeft",
  "AlternateRight",
  "Matrix"
], $t = ["TopToBottom", "BottomToTop", "LeftToRight", "RightToLeft"], Tt = {
  orientation: "TopToBottom",
  subtreeMode: "Balanced",
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  alignGrid: !1
}, R = { width: 230, height: 64 }, F = { width: 180, height: 150 };
function At(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t) e[n.id] = n;
  return e;
}
function H(t) {
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
function U(t) {
  const e = { node: t.node, children: [] };
  if (!t.node.collapsed)
    for (const n of t.children) e.children.push(U(n));
  return e;
}
function j(t) {
  const e = /* @__PURE__ */ Object.create(null);
  return function n(i, o) {
    i.node.isVirtual || (e[i.node.id] = o);
    const s = i.node.isVirtual ? 0 : o + 1;
    for (const l of i.children) n(l, s);
  }(t, 0), e;
}
function Mt(t, e) {
  const n = /* @__PURE__ */ Object.create(null);
  function i(o) {
    if (o in n) return n[o];
    const s = e[o];
    return !s || !s.parentId ? n[o] = 0 : n[o] = i(s.parentId) + 1;
  }
  for (const o of t) i(o.id);
  return n;
}
function St(t, e) {
  let n = 0;
  for (const i of t) i.parentId === e && n++;
  return n;
}
function W(t) {
  return {
    id: t.id,
    parentId: t.parentId || "",
    type: t.type || "position",
    label: t.label || "",
    personName: t.personName || "",
    status: t.status || "",
    width: t.width || F.width,
    height: t.height || F.height,
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
function Y(t) {
  const e = [];
  function n(i, o) {
    const s = "org-" + (i.org_id != null ? i.org_id : i.id);
    e.push({
      id: s,
      parentId: o,
      type: "department",
      label: i.name || i.label || "UNIT",
      width: R.width,
      height: R.height,
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
        width: F.width,
        height: F.height,
        data: { photo_url: r.photo_url || r.photo || null }
      });
    const c = (i.children || []).slice().sort((r, a) => (r.sort_order || 0) - (a.sort_order || 0));
    for (const r of c) n(r, s);
  }
  for (const i of t) n(i, "");
  return e;
}
function D(t) {
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
        width: R.width,
        height: R.height,
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
        width: F.width,
        height: F.height,
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
function It(t) {
  let e, n = null;
  if (Array.isArray(t))
    t.length && K(t) ? e = D(t) : e = t;
  else if (t && Array.isArray(t.nodes))
    e = t.nodes, n = t;
  else if (t && Array.isArray(t.tree))
    e = Y(t.tree);
  else if (t && t.tree && typeof t.tree == "object")
    e = Y([t.tree]);
  else if (t && t.org_id != null)
    e = Y([t]);
  else if (t && Array.isArray(t.children) && t.type)
    e = D([t]);
  else
    throw new Error("Unrecognized JSON. Expected a flat node array, {nodes:[…]}, {tree:[…]}, or an API tree of {type,children}.");
  if (!e.length) throw new Error("No nodes found in data.");
  if (e.find((o) => !o || o.id == null)) throw new Error('Every node needs an "id" field.');
  return { nodes: e, meta: n };
}
function _(t) {
  return t.orientation === "LeftToRight" || t.orientation === "RightToLeft";
}
function L(t, e) {
  return _(e) ? t.height : t.width;
}
function B(t, e) {
  return _(e) ? t.width : t.height;
}
function q(t, e) {
  return t.isVirtual ? "Balanced" : t.layoutMode || e.subtreeMode;
}
function Q(t) {
  return t === "Alternate" || t === "AlternateLeft" || t === "AlternateRight";
}
function k(t, e) {
  const n = t.node, i = t.children, o = L(n, e), s = B(n, e);
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
  const l = i.map((r) => k(r, e)), c = q(n, e);
  return Q(c) ? tt(t, l, c, e) : J(t, l, c, e);
}
function J(t, e, n, i) {
  const o = t.node, s = L(o, i), l = o.isVirtual ? 0 : B(o, i), c = n === "Center" ? i.spacingX * 0.5 : i.spacingX, r = [];
  let a = 0;
  for (let x = 0; x < e.length; x++)
    r.push(a), a += e[x].w + c;
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
  const y = d + s / 2, g = Math.max(0, -(d - s / 2));
  for (let x = 0; x < r.length; x++) r[x] += g;
  d += g;
  const $ = Math.max(u + g, y + g), A = l + (o.isVirtual ? 0 : i.spacingY), I = Math.max(...e.map((x) => x.h)), b = [], T = [];
  for (let x = 0; x < e.length; x++)
    b.push({ entry: t.children[x], cx: r[x], cy: A, m: e[x] }), T.push({ childId: t.children[x].node.id, routeType: "bus" });
  return {
    w: $,
    h: A + I,
    anchorLeft: d,
    anchorRight: $ - d,
    nodeCenterX: d,
    nodeCenterY: l / 2,
    childPlacements: b,
    edgeRoutes: T
  };
}
function tt(t, e, n, i) {
  const o = t.node, s = L(o, i), l = o.isVirtual ? 0 : B(o, i), c = n !== "AlternateRight", r = n === "Alternate", a = Math.max(16, i.spacingY * 0.45), u = l + (o.isVirtual ? 0 : i.spacingY), h = (e.length ? e[0].h : 0) / 2 + a / 2;
  let d = u, y = u;
  c ? y += h : d += h;
  const g = [];
  for (let p = 0; p < e.length; p++) {
    const m = e[p];
    let N;
    r ? N = Math.abs(d - y) < 0.01 ? c : d < y : N = c ? p % 2 === 0 : p % 2 === 1, N ? (g.push({ i: p, side: -1, y: d, m }), d += m.h + a) : (g.push({ i: p, side: 1, y, m }), y += m.h + a);
  }
  const $ = (p) => g.filter((m) => m.side === p).reduce((m, N) => Math.max(m, N.m.w), 0), A = $(-1), I = $(1), b = Math.max(A + 26, s / 2), T = [], x = [];
  for (const p of g) {
    const m = p.side < 0 ? b - 26 - p.m.w : b + 26;
    T[p.i] = { entry: t.children[p.i], cx: m, cy: p.y, m: p.m }, x[p.i] = { childId: t.children[p.i].node.id, routeType: p.side < 0 ? "spine-left" : "spine-right" };
  }
  const C = Math.max(d, y) - a, M = Math.max(b + 26 + I, b + s / 2), w = Math.max(C, u);
  return {
    w: M,
    h: w,
    anchorLeft: b,
    anchorRight: M - b,
    nodeCenterX: b,
    nodeCenterY: l / 2,
    childPlacements: T,
    edgeRoutes: x
  };
}
function et(t, e) {
  const n = k(t, e), i = [], o = /* @__PURE__ */ Object.create(null);
  return function s(l, c, r, a) {
    const u = l.node, f = r + c.nodeCenterX, h = a + c.nodeCenterY;
    u.isVirtual || i.push({
      node: u,
      lx: f,
      ly: h,
      w: L(u, e),
      h: B(u, e),
      parentId: u.parentId,
      routeType: o[u.id] || "bus"
    });
    for (const d of c.edgeRoutes) o[d.childId] = d.routeType;
    for (const d of c.childPlacements) s(d.entry, d.m, r + d.cx, a + d.cy);
  }(t, n, 0, 0), i;
}
function nt(t, e, n) {
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
function ot(t, e, n) {
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
function it(t = {}) {
  return {
    orientation: t.orientation || "TopToBottom",
    subtreeMode: t.subtreeMode || "Balanced",
    spacingX: t.spacingX != null ? t.spacingX : 40,
    spacingY: t.spacingY != null ? t.spacingY : 70,
    gridSize: t.gridSize != null ? t.gridSize : 22,
    alignGrid: !!t.alignGrid
  };
}
function Nt(t, e = {}) {
  const n = it(e), i = (t || []).map(W), o = H(i), s = U(o), l = et(s, n);
  n.subtreeMode === "Matrix" && nt(l, j(s), n);
  for (const h of l) {
    const d = ot(h.lx, h.ly, n);
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
  return { positioned: l, posById: f, cfg: n, bounds: rt(l) };
}
function rt(t) {
  let e = 1 / 0, n = 1 / 0, i = -1 / 0, o = -1 / 0;
  for (const s of t)
    e = Math.min(e, s.cx - s.node.width / 2), n = Math.min(n, s.cy - s.node.height / 2), i = Math.max(i, s.cx + s.node.width / 2), o = Math.max(o, s.cy + s.node.height / 2);
  return isFinite(e) ? { x: e, y: n, w: i - e, h: o - n } : { x: 0, y: 0, w: 0, h: 0 };
}
function S(t, e) {
  const n = e && e[t.node.id];
  return { x: t.cx + (n ? n.dx : 0), y: t.cy + (n ? n.dy : 0) };
}
function Ct(t, e, n, i, o, s) {
  const l = o && o[e.node.id], c = s && s[e.node.id];
  if (l && l.length || c) return at(t, e, l || [], n, i, c);
  const r = S(t, i), a = S(e, i), u = t.node.width, f = t.node.height, h = e.node.width, d = e.node.height, y = _(n), g = r.y - f / 2, $ = r.y + f / 2, A = r.x - u / 2, I = r.x + u / 2, b = a.y - d / 2, T = a.y + d / 2, x = a.x - h / 2, C = a.x + h / 2, M = [];
  if (e.routeType === "bus")
    if (y) {
      const w = a.x >= r.x ? I : A, p = a.x >= r.x ? x : C, m = (w + p) / 2;
      M.push([w, r.y], [m, r.y], [m, a.y], [p, a.y]);
    } else {
      const w = a.y >= r.y ? $ : g, p = a.y >= r.y ? b : T, m = (w + p) / 2;
      M.push([r.x, w], [r.x, m], [a.x, m], [a.x, p]);
    }
  else if (y) {
    const w = a.x >= r.x ? I : A, p = a.y <= r.y ? T : b;
    M.push([w, r.y], [a.x, r.y], [a.x, p]);
  } else {
    const w = a.y >= r.y ? $ : g, p = a.x <= r.x ? C : x;
    M.push([r.x, w], [r.x, a.y], [p, a.y]);
  }
  return "M " + M.map((w) => w[0].toFixed(1) + " " + w[1].toFixed(1)).join(" L ");
}
function st(t, e, n, i, o, s, l) {
  const c = S(t, s), r = S(e, s), a = t.node.width, u = t.node.height, f = e.node.width, h = e.node.height;
  let d, y;
  return l && l.p ? d = { x: c.x + l.p.nx * a / 2, y: c.y + l.p.ny * u / 2 } : _(o) ? d = { x: n.x >= c.x ? c.x + a / 2 : c.x - a / 2, y: c.y } : d = { x: c.x, y: n.y >= c.y ? c.y + u / 2 : c.y - u / 2 }, l && l.c ? y = { x: r.x + l.c.nx * f / 2, y: r.y + l.c.ny * h / 2 } : _(o) ? y = { x: i.x >= r.x ? r.x + f / 2 : r.x - f / 2, y: r.y } : y = { x: r.x, y: i.y >= r.y ? r.y + h / 2 : r.y - h / 2 }, { S: d, E: y };
}
function ct(t, e, n, i, o, s) {
  const l = n.length ? n[0] : S(e, o), c = n.length ? n[n.length - 1] : S(t, o), r = st(t, e, l, c, i, o, s), a = r.S;
  let u = r.E;
  if (!n.length && !(s && s.c) && e.routeType !== "bus") {
    const f = S(e, o), h = S(t, o), d = e.node.width, y = e.node.height;
    u = _(i) ? { x: f.x, y: f.y <= h.y ? f.y + y / 2 : f.y - y / 2 } : { x: f.x <= h.x ? f.x + d / 2 : f.x - d / 2, y: f.y };
  }
  return [a].concat(n.map((f) => ({ x: f.x, y: f.y })), [u]);
}
function lt(t, e) {
  const n = [t[0]];
  for (let i = 1; i < t.length; i++) {
    const o = n[n.length - 1], s = t[i];
    o.x !== s.x && o.y !== s.y && n.push(e ? { x: s.x, y: o.y } : { x: o.x, y: s.y }), n.push(s);
  }
  return n;
}
function at(t, e, n, i, o, s) {
  return "M " + lt(ct(t, e, n, i, o, s), _(i)).map((c) => c.x.toFixed(1) + " " + c.y.toFixed(1)).join(" L ");
}
function Et(t, e) {
  const n = (e || "").trim().toLowerCase(), i = /* @__PURE__ */ new Set();
  if (!n) return i;
  for (const o of t)
    [o.label, o.personName, o.type, o.status, o.id].filter(Boolean).join(" ").toLowerCase().includes(n) && i.add(o.id);
  return i;
}
function dt(t, e, n) {
  n = n ?? 0;
  let i = 1 / 0, o = 1 / 0, s = -1 / 0, l = -1 / 0;
  for (const c of t) {
    const r = S(c, e);
    i = Math.min(i, r.x - c.node.width / 2), o = Math.min(o, r.y - c.node.height / 2), s = Math.max(s, r.x + c.node.width / 2), l = Math.max(l, r.y + c.node.height / 2);
  }
  return isFinite(i) ? { x: i - n, y: o - n, w: s - i + n * 2, h: l - o + n * 2 } : { x: 0, y: 0, w: 100, h: 100 };
}
function _t(t, e, n, i = {}) {
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
const E = '"Segoe UI", system-ui, -apple-system, Arial, sans-serif', ht = {
  FILLED: { bg: "#e6f4ea", fg: "#137a3e" },
  VACANT: { bg: "#fdf0e6", fg: "#b25a14" },
  UNFUNDED: { bg: "#fbe7e7", fg: "#b42318" }
};
function X(t) {
  return String(t).replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[e]);
}
function v(t, e, n, i) {
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
function V(t, e, n, i, o, s, l) {
  return `<text x="${t.toFixed(1)}" y="${e.toFixed(1)}" font-family='${E}' font-size="${n.toFixed(2)}" font-weight="${i}" fill="${o}" text-anchor="middle"${l ? ` letter-spacing="${l}"` : ""}>${X(s)}</text>`;
}
function ft(t, e, n, i, o) {
  return `M${t},${e + o} Q${t},${e} ${t + o},${e} H${t + n - o} Q${t + n},${e} ${t + n},${e + o} V${e + i} H${t} V${e + o} Z`;
}
function ut(t, e, n, i, o) {
  const s = t.width, l = t.height, c = 12.5 * i, r = s - 36, a = v((t.label || "").toUpperCase(), `600 ${c}px ${E}`, r, o), u = c * 1.2, f = e + 10 + r / 2;
  let h = n + l / 2 - a.length * u / 2 + c * 0.78, d = `<rect x="${e}" y="${n}" width="${s}" height="${l}" rx="8" fill="url(#loc-teal)"/>`;
  for (const y of a)
    d += V(f, h, c, 600, "#ffffff", y, "0.4"), h += u;
  return d;
}
function pt(t, e, n, i, o, s) {
  const l = t.width, c = t.height, r = 62, a = e + l / 2, u = l - 16;
  let f = `<rect x="${e}" y="${n}" width="${l}" height="${c}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
  f += `<path d="${ft(e, n, l, r, 8)}" fill="#e8edf4"/>`, f += `<line x1="${e}" y1="${n + r}" x2="${e + l}" y2="${n + r}" stroke="#d0d5dd"/>`;
  const h = t.data && t.data.photo_url;
  h && !o ? f += `<image x="${e}" y="${n}" width="${l}" height="${r}" href="${X(h)}" preserveAspectRatio="xMidYMid slice"/>` : f += `<text x="${a.toFixed(1)}" y="${(n + r / 2 + 10).toFixed(1)}" font-family='${E}' font-size="30" fill="#9ca3af" text-anchor="middle">●</text>`;
  const d = n + r, y = c - r, g = 12.5 * i, $ = 11 * i, A = g * 1.15, I = $ * 1.15, b = v((t.personName || "—").toUpperCase(), `700 ${g}px ${E}`, u, s), T = v(t.label || "", `${$}px ${E}`, u, s), x = t.status ? 15 : 0, C = t.status ? 5 : 0, M = b.length * A + T.length * I + C + x;
  let w = d + y / 2 - M / 2 + g * 0.8, p = "";
  for (const m of b)
    p += V(a, w, g, 700, "#1a1a2e", m), w += A;
  for (const m of T)
    p += V(a, w, $, 400, "#4a5568", m), w += I;
  if (t.status) {
    const N = ht[t.status] || { bg: "#eee", fg: "#333" }, O = s(t.status, `700 ${9.5}px ${E}`) + 16, P = a - O / 2, z = w - g * 0.8 + C;
    p += `<rect x="${P.toFixed(1)}" y="${z.toFixed(1)}" width="${O.toFixed(1)}" height="${x}" rx="7.5" fill="${N.bg}"/>`, p += `<text x="${a.toFixed(1)}" y="${(z + 11).toFixed(1)}" font-family='${E}' font-size="${9.5}" font-weight="700" fill="${N.fg}" text-anchor="middle" letter-spacing="0.4">${X(t.status)}</text>`;
  }
  return f + p;
}
function Rt(t, e, n = {}) {
  const i = n.manualOffsets || {}, o = !!n.raster, s = n.measureText || (() => 0), l = n.fitOf || (() => 1), c = dt(t, i, 40);
  let r = "";
  for (const h of e) h && (r += `<path d="${h}" fill="none" stroke="#4a5568" stroke-width="2"/>`);
  let a = "";
  for (const h of t) {
    const d = h.node, y = S(h, i), g = y.x - d.width / 2 - c.x, $ = y.y - d.height / 2 - c.y;
    a += d.type === "department" ? ut(d, g, $, l(d), s) : pt(d, g, $, l(d), o, s);
  }
  const u = c.w.toFixed(0), f = c.h.toFixed(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${u}" height="${f}" viewBox="0 0 ${u} ${f}"><defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#2a9d8f"/></linearGradient></defs><rect x="0" y="0" width="${u}" height="${f}" fill="#ffffff"/><g transform="translate(${(-c.x).toFixed(1)},${(-c.y).toFixed(1)})">${r}</g>` + a + "</svg>";
}
const yt = {
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
function Lt(t = {}) {
  const e = Object.assign({}, yt, t);
  return e.themeRules = Array.isArray(t.themeRules) ? t.themeRules.map(xt) : [], e;
}
function xt(t = {}) {
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
function gt(t, e) {
  if (e)
    return e.indexOf("data.") === 0 ? t.data ? t.data[e.slice(5)] : void 0 : e === "type" || e === "status" || e === "id" || e === "label" || e === "personName" ? t[e] : t.data ? t.data[e] : void 0;
}
function Bt(t, e) {
  if (!e || !e.length) return null;
  let n = null;
  for (const i of e) {
    if (i.enabled === !1) continue;
    const o = gt(t, i.field);
    o != null && String(o).toLowerCase() === String(i.value).toLowerCase() && (n = n || {}, i.style.bg && (n.bg = i.style.bg), i.style.text && (n.text = i.style.text), i.style.border && (n.border = i.style.border));
  }
  return n;
}
export {
  wt as CANVAS_PAD,
  Tt as DEFAULTS,
  yt as DEFAULT_SETTINGS,
  R as DEPT_SIZE,
  $t as ORIENTATIONS,
  F as POS_SIZE,
  mt as SNAKE_STUB,
  bt as SUBTREE_MODES,
  G as VIRTUAL_ROOT_ID,
  ot as applyOrientation,
  Rt as buildChartSVG,
  H as buildTree,
  dt as calculateBounds,
  St as childCount,
  Mt as computeDepths,
  D as convertMoTree,
  Y as convertNestedTree,
  ct as edgeControlPoints,
  st as edgeEndpoints,
  S as effCenter,
  Ft as exportLayout,
  _t as fitBounds,
  U as getVisibleTree,
  At as indexNodes,
  _ as isHorizontal,
  K as isMoArray,
  Nt as layoutOrgChart,
  B as lh,
  L as lw,
  W as makeNode,
  it as normalizeConfig,
  It as normalizeImported,
  xt as normalizeRule,
  Lt as normalizeSettings,
  lt as orthoThrough,
  Z as personNameFromPos,
  Bt as resolveNodeStyle,
  Ct as routeConnector,
  Et as searchNodes,
  j as visibleDepths,
  at as waypointPath
};
