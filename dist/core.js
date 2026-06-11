const H = "__virtual_root__", xt = 26, gt = 80, yt = [
  "Balanced",
  "Center",
  "Left",
  "Right",
  "Alternate",
  "AlternateLeft",
  "AlternateRight",
  "Matrix"
], mt = ["TopToBottom", "BottomToTop", "LeftToRight", "RightToLeft"], wt = {
  orientation: "TopToBottom",
  subtreeMode: "Balanced",
  spacingX: 40,
  spacingY: 70,
  gridSize: 22,
  alignGrid: !1
}, L = { width: 230, height: 64 }, _ = { width: 180, height: 150 };
function $t(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const n of t) e[n.id] = n;
  return e;
}
function j(t) {
  const e = /* @__PURE__ */ Object.create(null);
  for (const i of t) e[i.id] = { node: i, children: [] };
  const n = {
    node: {
      id: H,
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
    const o = e[i.id], c = i.parentId;
    c && e[c] ? e[c].children.push(o) : n.children.push(o);
  }
  return n;
}
function v(t) {
  const e = { node: t.node, children: [] };
  if (!t.node.collapsed)
    for (const n of t.children) e.children.push(v(n));
  return e;
}
function G(t) {
  const e = /* @__PURE__ */ Object.create(null);
  return function n(i, o) {
    i.node.isVirtual || (e[i.node.id] = o);
    const c = i.node.isVirtual ? 0 : o + 1;
    for (const r of i.children) n(r, c);
  }(t, 0), e;
}
function bt(t, e) {
  const n = /* @__PURE__ */ Object.create(null);
  function i(o) {
    if (o in n) return n[o];
    const c = e[o];
    return !c || !c.parentId ? n[o] = 0 : n[o] = i(c.parentId) + 1;
  }
  for (const o of t) i(o.id);
  return n;
}
function Tt(t, e) {
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
    width: t.width || _.width,
    height: t.height || _.height,
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
function R(t) {
  const e = [];
  function n(i, o) {
    const c = "org-" + (i.org_id != null ? i.org_id : i.id);
    e.push({
      id: c,
      parentId: o,
      type: "department",
      label: i.name || i.label || "UNIT",
      width: L.width,
      height: L.height,
      data: { level: i.level }
    });
    const r = (i.positions || []).slice().sort((l, h) => (l.org_order || 0) - (h.org_order || 0));
    for (const l of r)
      e.push({
        id: "pos-" + l.id,
        parentId: c,
        type: "position",
        label: l.position_title || "POSITION",
        personName: Z(l),
        status: l.status || "",
        width: _.width,
        height: _.height,
        data: { photo_url: l.photo_url || l.photo || null }
      });
    const s = (i.children || []).slice().sort((l, h) => (l.sort_order || 0) - (h.sort_order || 0));
    for (const l of s) n(l, c);
  }
  for (const i of t) n(i, "");
  return e;
}
function U(t) {
  const e = [];
  let n = 0;
  function i(o, c) {
    const r = "mo-" + n++;
    if (o.type === "organization")
      e.push({
        id: r,
        parentId: c,
        type: "department",
        label: o.name || "UNIT",
        width: L.width,
        height: L.height,
        data: { level: o.meta && o.meta.level, srcId: o.id }
      });
    else {
      const l = o.type === "vacant";
      e.push({
        id: r,
        parentId: c,
        type: "position",
        label: o.position || "POSITION",
        personName: l ? "— VACANT —" : o.name || "—",
        status: l ? "VACANT" : "FILLED",
        width: _.width,
        height: _.height,
        data: { photo_url: o.photo_url || null, srcId: o.id }
      });
    }
    const s = (o.children || []).slice().sort((l, h) => (l.meta && l.meta.sort_order || 0) - (h.meta && h.meta.sort_order || 0));
    for (const l of s) i(l, r);
  }
  for (const o of t) i(o, "");
  return e;
}
function K(t) {
  return t.some((e) => e && !("parentId" in e) && (e.type === "organization" || e.type === "filled" || e.type === "vacant" || Array.isArray(e.children) && ("position" in e || "photo_url" in e)));
}
function At(t) {
  let e, n = null;
  if (Array.isArray(t))
    t.length && K(t) ? e = U(t) : e = t;
  else if (t && Array.isArray(t.nodes))
    e = t.nodes, n = t;
  else if (t && Array.isArray(t.tree))
    e = R(t.tree);
  else if (t && t.tree && typeof t.tree == "object")
    e = R([t.tree]);
  else if (t && t.org_id != null)
    e = R([t]);
  else if (t && Array.isArray(t.children) && t.type)
    e = U([t]);
  else
    throw new Error("Unrecognized JSON. Expected a flat node array, {nodes:[…]}, {tree:[…]}, or an API tree of {type,children}.");
  if (!e.length) throw new Error("No nodes found in data.");
  if (e.find((o) => !o || o.id == null)) throw new Error('Every node needs an "id" field.');
  return { nodes: e, meta: n };
}
function F(t) {
  return t.orientation === "LeftToRight" || t.orientation === "RightToLeft";
}
function Y(t, e) {
  return F(e) ? t.height : t.width;
}
function B(t, e) {
  return F(e) ? t.width : t.height;
}
function q(t, e) {
  return t.isVirtual ? "Balanced" : t.layoutMode || e.subtreeMode;
}
function Q(t) {
  return t === "Alternate" || t === "AlternateLeft" || t === "AlternateRight";
}
function z(t, e) {
  const n = t.node, i = t.children, o = Y(n, e), c = B(n, e);
  if (i.length === 0)
    return {
      w: o,
      h: c,
      anchorLeft: o / 2,
      anchorRight: o / 2,
      nodeCenterX: o / 2,
      nodeCenterY: c / 2,
      childPlacements: [],
      edgeRoutes: []
    };
  const r = i.map((l) => z(l, e)), s = q(n, e);
  return Q(s) ? tt(t, r, s, e) : J(t, r, s, e);
}
function J(t, e, n, i) {
  const o = t.node, c = Y(o, i), r = o.isVirtual ? 0 : B(o, i), s = n === "Center" ? i.spacingX * 0.5 : i.spacingX, l = [];
  let h = 0;
  for (let p = 0; p < e.length; p++)
    l.push(h), h += e[p].w + s;
  const f = h - s, u = l[0] + e[0].nodeCenterX, d = l[e.length - 1] + e[e.length - 1].nodeCenterX;
  let a;
  switch (n) {
    case "Left":
      a = u;
      break;
    case "Right":
      a = d;
      break;
    default:
      a = (u + d) / 2;
  }
  const y = a + c / 2, g = Math.max(0, -(a - c / 2));
  for (let p = 0; p < l.length; p++) l[p] += g;
  a += g;
  const $ = Math.max(f + g, y + g), I = r + (o.isVirtual ? 0 : i.spacingY), S = Math.max(...e.map((p) => p.h)), w = [], M = [];
  for (let p = 0; p < e.length; p++)
    w.push({ entry: t.children[p], cx: l[p], cy: I, m: e[p] }), M.push({ childId: t.children[p].node.id, routeType: "bus" });
  return {
    w: $,
    h: I + S,
    anchorLeft: a,
    anchorRight: $ - a,
    nodeCenterX: a,
    nodeCenterY: r / 2,
    childPlacements: w,
    edgeRoutes: M
  };
}
function tt(t, e, n, i) {
  const o = t.node, c = Y(o, i), r = o.isVirtual ? 0 : B(o, i), s = n !== "AlternateRight", l = n === "Alternate", h = Math.max(16, i.spacingY * 0.45), f = r + (o.isVirtual ? 0 : i.spacingY), d = (e.length ? e[0].h : 0) / 2 + h / 2;
  let a = f, y = f;
  s ? y += d : a += d;
  const g = [];
  for (let x = 0; x < e.length; x++) {
    const b = e[x];
    let N;
    l ? N = Math.abs(a - y) < 0.01 ? s : a < y : N = s ? x % 2 === 0 : x % 2 === 1, N ? (g.push({ i: x, side: -1, y: a, m: b }), a += b.h + h) : (g.push({ i: x, side: 1, y, m: b }), y += b.h + h);
  }
  const $ = (x) => g.filter((b) => b.side === x).reduce((b, N) => Math.max(b, N.m.w), 0), I = $(-1), S = $(1), w = Math.max(I + 26, c / 2), M = [], p = [];
  for (const x of g) {
    const b = x.side < 0 ? w - 26 - x.m.w : w + 26;
    M[x.i] = { entry: t.children[x.i], cx: b, cy: x.y, m: x.m }, p[x.i] = { childId: t.children[x.i].node.id, routeType: x.side < 0 ? "spine-left" : "spine-right" };
  }
  const m = Math.max(a, y) - h, T = Math.max(w + 26 + S, w + c / 2), A = Math.max(m, f);
  return {
    w: T,
    h: A,
    anchorLeft: w,
    anchorRight: T - w,
    nodeCenterX: w,
    nodeCenterY: r / 2,
    childPlacements: M,
    edgeRoutes: p
  };
}
function et(t, e) {
  const n = z(t, e), i = [], o = /* @__PURE__ */ Object.create(null);
  return function c(r, s, l, h) {
    const f = r.node, u = l + s.nodeCenterX, d = h + s.nodeCenterY;
    f.isVirtual || i.push({
      node: f,
      lx: u,
      ly: d,
      w: Y(f, e),
      h: B(f, e),
      parentId: f.parentId,
      routeType: o[f.id] || "bus"
    });
    for (const a of s.edgeRoutes) o[a.childId] = a.routeType;
    for (const a of s.childPlacements) c(a.entry, a.m, l + a.cx, h + a.cy);
  }(t, n, 0, 0), i;
}
function nt(t, e, n) {
  const i = /* @__PURE__ */ Object.create(null);
  for (const s of t) {
    const l = e[s.node.id] || 0;
    (i[l] || (i[l] = [])).push(s);
  }
  const o = Object.keys(i).map(Number).sort((s, l) => s - l), c = n.gridSize;
  let r = 0;
  for (const s of o) {
    const l = i[s], h = Math.max(...l.map((u) => u.h));
    for (const u of l) u.ly = r + h / 2;
    let f = h + n.spacingY;
    n.alignGrid && (f = Math.ceil(f / c) * c), r += f;
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
function Mt(t, e = {}) {
  const n = it(e), i = (t || []).map(W), o = j(i), c = v(o), r = et(c, n);
  n.subtreeMode === "Matrix" && nt(r, G(c), n);
  for (const d of r) {
    const a = ot(d.lx, d.ly, n);
    d.cx = a.x, d.cy = a.y;
  }
  let s = 1 / 0, l = 1 / 0;
  for (const d of r)
    s = Math.min(s, d.cx - d.node.width / 2), l = Math.min(l, d.cy - d.node.height / 2);
  isFinite(s) || (s = 0, l = 0);
  const h = 80 - s, f = 80 - l;
  for (const d of r)
    d.cx += h, d.cy += f;
  if (n.alignGrid) {
    const d = n.gridSize;
    for (const a of r)
      a.cx = Math.round(a.cx / d) * d, a.cy = Math.round(a.cy / d) * d;
  }
  const u = /* @__PURE__ */ Object.create(null);
  for (const d of r) u[d.node.id] = d;
  return { positioned: r, posById: u, cfg: n, bounds: rt(r) };
}
function rt(t) {
  let e = 1 / 0, n = 1 / 0, i = -1 / 0, o = -1 / 0;
  for (const c of t)
    e = Math.min(e, c.cx - c.node.width / 2), n = Math.min(n, c.cy - c.node.height / 2), i = Math.max(i, c.cx + c.node.width / 2), o = Math.max(o, c.cy + c.node.height / 2);
  return isFinite(e) ? { x: e, y: n, w: i - e, h: o - n } : { x: 0, y: 0, w: 0, h: 0 };
}
function E(t, e) {
  const n = e && e[t.node.id];
  return { x: t.cx + (n ? n.dx : 0), y: t.cy + (n ? n.dy : 0) };
}
function It(t, e, n, i, o) {
  const c = o && o[e.node.id];
  if (c && c.length) return at(t, e, c, n, i);
  const r = E(t, i), s = E(e, i), l = t.node.width, h = t.node.height, f = e.node.width, u = e.node.height, d = F(n), a = r.y - h / 2, y = r.y + h / 2, g = r.x - l / 2, $ = r.x + l / 2, I = s.y - u / 2, S = s.y + u / 2, w = s.x - f / 2, M = s.x + f / 2, p = [];
  if (e.routeType === "bus")
    if (d) {
      const m = s.x >= r.x ? $ : g, T = s.x >= r.x ? w : M, A = (m + T) / 2;
      p.push([m, r.y], [A, r.y], [A, s.y], [T, s.y]);
    } else {
      const m = s.y >= r.y ? y : a, T = s.y >= r.y ? I : S, A = (m + T) / 2;
      p.push([r.x, m], [r.x, A], [s.x, A], [s.x, T]);
    }
  else if (d) {
    const m = s.x >= r.x ? $ : g, T = s.y <= r.y ? S : I;
    p.push([m, r.y], [s.x, r.y], [s.x, T]);
  } else {
    const m = s.y >= r.y ? y : a, T = s.x <= r.x ? M : w;
    p.push([r.x, m], [r.x, s.y], [T, s.y]);
  }
  return "M " + p.map((m) => m[0].toFixed(1) + " " + m[1].toFixed(1)).join(" L ");
}
function st(t, e, n, i, o, c) {
  const r = E(t, c), s = E(e, c), l = t.node.width, h = t.node.height, f = e.node.width, u = e.node.height;
  let d, a;
  return F(o) ? (d = { x: n.x >= r.x ? r.x + l / 2 : r.x - l / 2, y: r.y }, a = { x: i.x >= s.x ? s.x + f / 2 : s.x - f / 2, y: s.y }) : (d = { x: r.x, y: n.y >= r.y ? r.y + h / 2 : r.y - h / 2 }, a = { x: s.x, y: i.y >= s.y ? s.y + u / 2 : s.y - u / 2 }), { S: d, E: a };
}
function ct(t, e, n, i, o) {
  const { S: c, E: r } = st(t, e, n[0], n[n.length - 1], i, o);
  return [c].concat(n.map((s) => ({ x: s.x, y: s.y })), [r]);
}
function lt(t, e) {
  const n = [t[0]];
  for (let i = 1; i < t.length; i++) {
    const o = n[n.length - 1], c = t[i];
    o.x !== c.x && o.y !== c.y && n.push(e ? { x: c.x, y: o.y } : { x: o.x, y: c.y }), n.push(c);
  }
  return n;
}
function at(t, e, n, i, o) {
  return "M " + lt(ct(t, e, n, i, o), F(i)).map((r) => r.x.toFixed(1) + " " + r.y.toFixed(1)).join(" L ");
}
function St(t, e) {
  const n = (e || "").trim().toLowerCase(), i = /* @__PURE__ */ new Set();
  if (!n) return i;
  for (const o of t)
    [o.label, o.personName, o.type, o.status, o.id].filter(Boolean).join(" ").toLowerCase().includes(n) && i.add(o.id);
  return i;
}
function dt(t, e, n) {
  n = n ?? 0;
  let i = 1 / 0, o = 1 / 0, c = -1 / 0, r = -1 / 0;
  for (const s of t) {
    const l = E(s, e);
    i = Math.min(i, l.x - s.node.width / 2), o = Math.min(o, l.y - s.node.height / 2), c = Math.max(c, l.x + s.node.width / 2), r = Math.max(r, l.y + s.node.height / 2);
  }
  return isFinite(i) ? { x: i - n, y: o - n, w: c - i + n * 2, h: r - o + n * 2 } : { x: 0, y: 0, w: 100, h: 100 };
}
function Nt(t, e, n, i = {}) {
  const o = i.maxZoom != null ? i.maxZoom : 1.4, c = i.margin != null ? i.margin : 0.92, r = t.w || 1, s = t.h || 1, l = Math.min(e / r, n / s, o) * c;
  return {
    zoom: l,
    panX: (e - r * l) / 2 - t.x * l,
    panY: (n - s * l) / 2 - t.y * l
  };
}
function Ct(t, e, n, i) {
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
const C = '"Segoe UI", system-ui, -apple-system, Arial, sans-serif', ht = {
  FILLED: { bg: "#e6f4ea", fg: "#137a3e" },
  VACANT: { bg: "#fdf0e6", fg: "#b25a14" },
  UNFUNDED: { bg: "#fbe7e7", fg: "#b42318" }
};
function O(t) {
  return String(t).replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[e]);
}
function X(t, e, n, i) {
  const o = String(t || "").split(/\s+/).filter(Boolean);
  if (!o.length) return [""];
  const c = [];
  let r = o[0];
  for (let s = 1; s < o.length; s++) {
    const l = r + " " + o[s];
    i(l, e) <= n ? r = l : (c.push(r), r = o[s]);
  }
  return c.push(r), c;
}
function V(t, e, n, i, o, c, r) {
  return `<text x="${t.toFixed(1)}" y="${e.toFixed(1)}" font-family='${C}' font-size="${n.toFixed(2)}" font-weight="${i}" fill="${o}" text-anchor="middle"${r ? ` letter-spacing="${r}"` : ""}>${O(c)}</text>`;
}
function ft(t, e, n, i, o) {
  return `M${t},${e + o} Q${t},${e} ${t + o},${e} H${t + n - o} Q${t + n},${e} ${t + n},${e + o} V${e + i} H${t} V${e + o} Z`;
}
function ut(t, e, n, i, o) {
  const c = t.width, r = t.height, s = 12.5 * i, l = c - 36, h = X((t.label || "").toUpperCase(), `600 ${s}px ${C}`, l, o), f = s * 1.2, u = e + 10 + l / 2;
  let d = n + r / 2 - h.length * f / 2 + s * 0.78, a = `<rect x="${e}" y="${n}" width="${c}" height="${r}" rx="8" fill="url(#loc-teal)"/>`;
  for (const y of h)
    a += V(u, d, s, 600, "#ffffff", y, "0.4"), d += f;
  return a;
}
function pt(t, e, n, i, o, c) {
  const r = t.width, s = t.height, l = 62, h = e + r / 2, f = r - 16;
  let u = `<rect x="${e}" y="${n}" width="${r}" height="${s}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
  u += `<path d="${ft(e, n, r, l, 8)}" fill="#e8edf4"/>`, u += `<line x1="${e}" y1="${n + l}" x2="${e + r}" y2="${n + l}" stroke="#d0d5dd"/>`;
  const d = t.data && t.data.photo_url;
  d && !o ? u += `<image x="${e}" y="${n}" width="${r}" height="${l}" href="${O(d)}" preserveAspectRatio="xMidYMid slice"/>` : u += `<text x="${h.toFixed(1)}" y="${(n + l / 2 + 10).toFixed(1)}" font-family='${C}' font-size="30" fill="#9ca3af" text-anchor="middle">●</text>`;
  const a = n + l, y = s - l, g = 12.5 * i, $ = 11 * i, I = g * 1.15, S = $ * 1.15, w = X((t.personName || "—").toUpperCase(), `700 ${g}px ${C}`, f, c), M = X(t.label || "", `${$}px ${C}`, f, c), p = t.status ? 15 : 0, m = t.status ? 5 : 0, T = w.length * I + M.length * S + m + p;
  let A = a + y / 2 - T / 2 + g * 0.8, x = "";
  for (const b of w)
    x += V(h, A, g, 700, "#1a1a2e", b), A += I;
  for (const b of M)
    x += V(h, A, $, 400, "#4a5568", b), A += S;
  if (t.status) {
    const N = ht[t.status] || { bg: "#eee", fg: "#333" }, k = c(t.status, `700 ${9.5}px ${C}`) + 16, P = h - k / 2, D = A - g * 0.8 + m;
    x += `<rect x="${P.toFixed(1)}" y="${D.toFixed(1)}" width="${k.toFixed(1)}" height="${p}" rx="7.5" fill="${N.bg}"/>`, x += `<text x="${h.toFixed(1)}" y="${(D + 11).toFixed(1)}" font-family='${C}' font-size="${9.5}" font-weight="700" fill="${N.fg}" text-anchor="middle" letter-spacing="0.4">${O(t.status)}</text>`;
  }
  return u + x;
}
function _t(t, e, n = {}) {
  const i = n.manualOffsets || {}, o = !!n.raster, c = n.measureText || (() => 0), r = n.fitOf || (() => 1), s = dt(t, i, 40);
  let l = "";
  for (const d of e) d && (l += `<path d="${d}" fill="none" stroke="#4a5568" stroke-width="2"/>`);
  let h = "";
  for (const d of t) {
    const a = d.node, y = E(d, i), g = y.x - a.width / 2 - s.x, $ = y.y - a.height / 2 - s.y;
    h += a.type === "department" ? ut(a, g, $, r(a), c) : pt(a, g, $, r(a), o, c);
  }
  const f = s.w.toFixed(0), u = s.h.toFixed(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${f}" height="${u}" viewBox="0 0 ${f} ${u}"><defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#2a9d8f"/></linearGradient></defs><rect x="0" y="0" width="${f}" height="${u}" fill="#ffffff"/><g transform="translate(${(-s.x).toFixed(1)},${(-s.y).toFixed(1)})">${l}</g>` + h + "</svg>";
}
export {
  gt as CANVAS_PAD,
  wt as DEFAULTS,
  L as DEPT_SIZE,
  mt as ORIENTATIONS,
  _ as POS_SIZE,
  xt as SNAKE_STUB,
  yt as SUBTREE_MODES,
  H as VIRTUAL_ROOT_ID,
  ot as applyOrientation,
  _t as buildChartSVG,
  j as buildTree,
  dt as calculateBounds,
  Tt as childCount,
  bt as computeDepths,
  U as convertMoTree,
  R as convertNestedTree,
  ct as edgeControlPoints,
  st as edgeEndpoints,
  E as effCenter,
  Ct as exportLayout,
  Nt as fitBounds,
  v as getVisibleTree,
  $t as indexNodes,
  F as isHorizontal,
  K as isMoArray,
  Mt as layoutOrgChart,
  B as lh,
  Y as lw,
  W as makeNode,
  it as normalizeConfig,
  At as normalizeImported,
  lt as orthoThrough,
  Z as personNameFromPos,
  It as routeConnector,
  St as searchNodes,
  G as visibleDepths,
  at as waypointPath
};
//# sourceMappingURL=core.js.map
