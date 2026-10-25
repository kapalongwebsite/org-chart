import { B as e, D as t, K as n, S as r, T as i, U as a, W as o, o as s, q as c, t as l, w as u, y as d } from "./bounds-Cig4UHsX.js";
// src/core/search.js
function f(e, t) {
	let n = (t || "").trim().toLowerCase(), r = /* @__PURE__ */ new Set();
	if (!n) return r;
	for (let t of e) [
		t.label,
		t.personName,
		t.type,
		t.status,
		t.id
	].filter(Boolean).join(" ").toLowerCase().includes(n) && r.add(t.id);
	return r;
}
// src/core/exportLayout.js
var p = 2;
function m(e, t, n, r) {
	return {
		version: 2,
		orientation: e.orientation,
		subtreeMode: e.subtreeMode,
		spacingX: e.spacingX,
		spacingY: e.spacingY,
		zoom: e.zoom,
		panX: e.panX,
		panY: e.panY,
		manualOffsets: n || {},
		edgeWaypoints: r || {},
		nodes: t.map((e) => ({
			id: e.id,
			parentId: e.parentId,
			type: e.type,
			label: e.label,
			personName: e.personName,
			status: e.status,
			width: e.width,
			height: e.height,
			collapsed: e.collapsed,
			layoutMode: e.layoutMode,
			data: e.data
		}))
	};
}
// src/core/svgExport.js
var h = "\"Segoe UI\", system-ui, -apple-system, Arial, sans-serif", g = {
	FILLED: {
		bg: "#e6f4ea",
		fg: "#137a3e"
	},
	VACANT: {
		bg: "#fdf0e6",
		fg: "#a3520f"
	},
	UNFUNDED: {
		bg: "#fbe7e7",
		fg: "#b42318"
	}
}, _ = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
function v(e) {
	return String(e ?? "").replace(_, "").replace(/[&<>"']/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&apos;"
	})[e]);
}
var y = v;
function b(e, t) {
	let n = typeof e == "number" ? e : NaN;
	if (!Number.isFinite(n)) throw TypeError(`buildChartSVG: ${t} must be a finite number`);
	return n;
}
function x(e, t, n = 1) {
	return b(e, t).toFixed(n);
}
function S(e, t, n, r) {
	if (r(e, t) <= n) return [e];
	let i = [], a = "";
	for (let o of e) a && r(a + o, t) > n ? (i.push(a), a = o) : a += o;
	return a && i.push(a), i;
}
function C(e, t, n, r, i = Infinity) {
	let a = String(e || "").split(/\s+/).filter(Boolean).flatMap((e) => S(e, t, n, r));
	if (!a.length) return [""];
	let o = [], s = a[0];
	for (let e = 1; e < a.length; e++) {
		let i = s + " " + a[e];
		r(i, t) <= n ? s = i : (o.push(s), s = a[e]);
	}
	if (o.push(s), o.length <= i) return o;
	let c = o.slice(0, i), l = c[i - 1];
	for (; l && r(l + "…", t) > n;) l = l.slice(0, -1).trimEnd();
	return c[i - 1] = l + "…", c;
}
var w = 6, T = 3, ee = 4;
function E(e, t, n, r, i, a, o) {
	return `<text x="${x(e, "text x")}" y="${x(t, "text y")}" font-family='${h}' font-size="${x(n, "font size", 2)}" font-weight="${r}" fill="${i}" text-anchor="middle"${o ? ` letter-spacing="${o}"` : ""}>${y(a)}</text>`;
}
function D(e, t, n, r, i) {
	let a = b(e, "x"), o = b(t, "y"), s = b(n, "width"), c = b(r, "height");
	return `M${a},${o + i} Q${a},${o} ${a + i},${o} H${a + s - i} Q${a + s},${o} ${a + s},${o + i} V${o + c} H${a} V${o + i} Z`;
}
function O(e, t, n, r, i) {
	let a = b(e.width, "node width"), o = b(e.height, "node height"), s = 13.5 * b(r, "text fit"), c = a - 36, l = C((e.label || "").toUpperCase(), `600 ${s}px ${h}`, c, i, w), u = s * 1.2, d = t + 10 + c / 2, f = n + o / 2 - l.length * u / 2 + s * .78, p = `<rect x="${x(t, "x", 2)}" y="${x(n, "y", 2)}" width="${a}" height="${o}" rx="8" fill="url(#loc-teal)"/>`;
	for (let e of l) p += E(d, f, s, 600, "#ffffff", e, "0.4"), f += u;
	return p;
}
function k(e, t, n, r, i, s, l, u) {
	l ||= {};
	let d = b(e.width, "node width"), f = b(e.height, "node height");
	b(t, "x"), b(n, "y"), b(r, "text fit");
	let p = t + d / 2, m = d - 16, _ = Math.max(20, Math.min(l.photoH || a.height - 140, f - 20)), v = `<rect x="${x(t, "x", 2)}" y="${x(n, "y", 2)}" width="${d}" height="${f}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
	v += `<path d="${D(t, n, d, _, 8)}" fill="${y(l.photoBackground || "#004264")}"/>`;
	let S = e.data && e.data.photo_url, w = (S && l.images ? l.images[S] : null) || (S && !i ? S : null);
	if (w) {
		let e = l.contain ? "xMidYMid meet" : "xMidYMid slice", r = Math.max(1, l.frameWidth || c.width), i = Math.max(1, l.frameHeight || c.height), a = d * (Math.max(1, l.imageWidth || o.width) / r), s = _ * (Math.max(1, l.imageHeight || o.height) / i), f = t + (d - a) / 2 + (l.offsetX || 0) * d / r, p = n + (_ - s) / 2 + (l.offsetY || 0) * _ / i, m = `loc-photo-clip-${u}`;
		v += `<defs><clipPath id="${m}"><path d="${D(t, n, d, _, 8)}"/></clipPath></defs>`, v += `<image x="${f.toFixed(2)}" y="${p.toFixed(2)}" width="${a.toFixed(2)}" height="${s.toFixed(2)}" href="${y(w)}" preserveAspectRatio="${e}" clip-path="url(#${m})"/>`;
	} else v += `<text x="${p.toFixed(1)}" y="${(n + _ / 2 + 10).toFixed(1)}" font-family='${h}' font-size="30" fill="#ffffff" fill-opacity="0.72" text-anchor="middle">●</text>`;
	v += `<line x1="${x(t, "x", 2)}" y1="${x(n + _, "y", 2)}" x2="${x(t + d, "x", 2)}" y2="${x(n + _, "y", 2)}" stroke="#d0d5dd"/>`;
	let O = n + _, k = f - _, A = 13.5 * r, j = 12 * r, M = A * 1.15, N = j * 1.15, P = C((e.personName || "—").toUpperCase(), `700 ${A}px ${h}`, m, s, T), F = C(e.label || "", `${j}px ${h}`, m, s, ee), I = e.status ? 15 : 0, L = e.status ? 5 : 0, R = P.length * M + F.length * N + L + I, z = O + k / 2 - R / 2 + A * .8, B = "";
	for (let e of P) B += E(p, z, A, 700, "#1a1a2e", e), z += M;
	for (let e of F) B += E(p, z, j, 400, "#4a5568", e), z += N;
	if (e.status) {
		let t = g[e.status] || {
			bg: "#eee",
			fg: "#333"
		}, n = b(s(e.status, `700 10px ${h}`), "measured badge width") + 16, r = p - n / 2, i = z - A * .8 + L;
		B += `<rect x="${r.toFixed(1)}" y="${i.toFixed(1)}" width="${n.toFixed(1)}" height="${I}" rx="7.5" fill="${t.bg}"/>`, B += `<text x="${p.toFixed(1)}" y="${(i + 11).toFixed(1)}" font-family='${h}' font-size="10" font-weight="700" fill="${t.fg}" text-anchor="middle" letter-spacing="0.4">${y(e.status)}</text>`;
	}
	return v + B;
}
function A(e, t, n, r = 40) {
	let i = l(e, t, 0), a = i.x, o = i.y, s = i.x + i.w, c = i.y + i.h;
	e.length || (a = Infinity, o = Infinity, s = -Infinity, c = -Infinity);
	for (let e of n || []) {
		let t = String(e && e.d || "").match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi) || [];
		for (let e = 0; e + 1 < t.length; e += 2) {
			let n = Number(t[e]), r = Number(t[e + 1]);
			Number.isFinite(n) && Number.isFinite(r) && (a = Math.min(a, n - 1), o = Math.min(o, r - 1), s = Math.max(s, n + 1), c = Math.max(c, r + 1));
		}
	}
	return Number.isFinite(a) ? {
		x: a - r,
		y: o - r,
		w: s - a + r * 2,
		h: c - o + r * 2
	} : {
		x: -r,
		y: -r,
		w: 100 + r * 2,
		h: 100 + r * 2
	};
}
function j(e, t, n = {}) {
	let r = n.manualOffsets || {}, i = !!n.raster, l = n.measureText || (() => 0), u = n.fitOf || (() => 1), f = n.virtualPhotoFrame || {}, p = n.renderedImage || {}, m = {
		photoH: n.photoHeight || a.height - 140,
		images: n.images || null,
		contain: n.photoContain == null ? p.fit !== "cover" : n.photoContain !== !1,
		frameWidth: +f.width || c.width,
		frameHeight: +f.height || c.height,
		imageWidth: +p.width || o.width,
		imageHeight: +p.height || o.height,
		offsetX: Number.isFinite(+p.offsetX) ? +p.offsetX : o.offsetX,
		offsetY: Number.isFinite(+p.offsetY) ? +p.offsetY : o.offsetY,
		photoBackground: n.photoBackground || "#004264"
	}, h = n.bounds || A(e, r, t, 40), g = "", _ = d(t, n.familyNetworks || [], { rebuildFamilyIds: n.rebuildFamilyIds || [] });
	for (let e of _.segments) g += `<path d="${e.d}" fill="none" stroke="#4a5568" stroke-width="2"/>`;
	let v = "", y = 0;
	for (let t of e) {
		let e = t.node, n = s(t, r), a = n.x - e.width / 2 - h.x, o = n.y - e.height / 2 - h.y;
		v += e.type === "department" ? O(e, a, o, u(e), l) : k(e, a, o, u(e), i, l, m, y++);
	}
	let S = x(h.w, "bounds width", 0), C = x(h.h, "bounds height", 0);
	return b(h.x, "bounds x"), b(h.y, "bounds y"), `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${S}" height="${C}" viewBox="0 0 ${S} ${C}"><defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#1f7f74"/></linearGradient></defs><rect x="0" y="0" width="${S}" height="${C}" fill="#ffffff"/><g transform="translate(${(-h.x).toFixed(1)},${(-h.y).toFixed(1)})">${g}</g>` + v + "</svg>";
}
// src/core/theme.js
var M = {
	spacingX: 40,
	spacingY: 70,
	gridSize: 22,
	orientation: "TopToBottom",
	subtreeMode: "AutoSmart",
	showToolbar: !0,
	showGrid: !1,
	snapGrid: !1,
	alignGrid: !1,
	themeRules: []
};
function N(e = {}) {
	let t = Object.assign({}, M, e);
	return t.themeRules = Array.isArray(e.themeRules) ? e.themeRules.map(z) : [], t;
}
var P = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i, F = "[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:%|deg)?", I = RegExp(`^(?:rgba?|hsla?)\\(\\s*${F}(?:\\s*[,\\s/]\\s*${F}){2,3}\\s*\\)$`, "i");
function L(e) {
	if (typeof e != "string") return !1;
	let t = e.trim();
	return P.test(t) || I.test(t);
}
function R(e = {}) {
	let t = e && e.style || {};
	return [
		"bg",
		"text",
		"border"
	].filter((e) => t[e] != null && t[e] !== "" && !L(t[e]));
}
function z(e = {}) {
	let t = e && e.style || {}, n = (e) => L(e) ? e.trim() : "";
	return {
		enabled: e.enabled !== !1,
		field: e.field ? String(e.field) : "type",
		value: e.value == null ? "" : String(e.value),
		style: {
			bg: n(t.bg),
			text: n(t.text),
			border: n(t.border)
		}
	};
}
function B(e, t) {
	if (t) return t.indexOf("data.") === 0 ? e.data ? e.data[t.slice(5)] : void 0 : t === "type" || t === "status" || t === "id" || t === "label" || t === "personName" ? e[t] : e.data ? e.data[t] : void 0;
}
function V(e, t) {
	if (!t || !t.length) return null;
	let n = null;
	for (let r of t) {
		if (r.enabled === !1) continue;
		let t = B(e, r.field);
		t != null && String(t).toLowerCase() === String(r.value).toLowerCase() && (n ||= {}, r.style.bg && (n.bg = r.style.bg), r.style.text && (n.text = r.style.text), r.style.border && (n.border = r.style.border));
	}
	return n;
}
// src/core/layoutData.js
var H = {
	Top: "TopToBottom",
	Bottom: "BottomToTop",
	Left: "LeftToRight",
	Right: "RightToLeft"
}, U = /* @__PURE__ */ new Set([...n, "Auto"]), W = (e) => typeof e == "number" && Number.isFinite(e), G = (e) => W(e) && e > 0;
function K(e) {
	return Array.isArray(e) && e.length === 0 ? {} : e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
var q = {
	spacingX: [0, 2e3],
	spacingY: [0, 2e3],
	gridSize: [2, 400],
	cardWidth: [20, 4e3],
	photoHeight: [20, 4e3],
	textHeight: [20, 4e3],
	departmentWidth: [20, 4e3],
	departmentHeight: [20, 4e3]
}, J = [
	"showGrid",
	"snapGrid",
	"alignGrid",
	"showImages",
	"autoEdgeSide",
	"photoContain"
];
function Y(t, n = [], r = "view") {
	let i = {};
	if (t == null) return i;
	if (typeof t != "object" || Array.isArray(t)) return n.push(`${r} (not an object)`), i;
	let a = (e, t) => n.push(`${r}.${e} ${JSON.stringify(t)}`);
	if (t.subtreeMode != null && (U.has(t.subtreeMode) ? i.subtreeMode = t.subtreeMode : a("subtreeMode", t.subtreeMode)), t.orientation != null) {
		let n = H[t.orientation] || t.orientation;
		e.includes(n) ? i.orientation = n : a("orientation", t.orientation);
	}
	for (let [e, [n, r]] of Object.entries(q)) t[e] != null && (W(t[e]) && t[e] >= n && t[e] <= r ? i[e] = t[e] : a(e, t[e]));
	for (let e of J) t[e] != null && (typeof t[e] == "boolean" ? i[e] = t[e] : a(e, t[e]));
	t.contain != null && (typeof t.contain == "boolean" ? i.contain = t.contain : a("contain", t.contain)), t.photoBackground != null && (L(t.photoBackground) ? i.photoBackground = t.photoBackground.trim() : a("photoBackground", t.photoBackground));
	for (let e of [
		"width",
		"photoFrameWidth",
		"photoFrameHeight",
		"photoImageWidth",
		"photoImageHeight"
	]) t[e] != null && (G(t[e]) ? i[e] = t[e] : a(e, t[e]));
	for (let e of ["photoOffsetX", "photoOffsetY"]) t[e] != null && (W(t[e]) ? i[e] = t[e] : a(e, t[e]));
	let o = (e, n) => {
		if (t[e] == null) return;
		if (typeof t[e] != "object" || Array.isArray(t[e])) {
			a(e, t[e]);
			return;
		}
		let r = {};
		for (let [i, o] of Object.entries(n)) {
			let n = t[e][i];
			n != null && (o(n) ? r[i] = n : a(`${e}.${i}`, n));
		}
		i[e] = r;
	};
	return o("virtualPhotoFrame", {
		width: G,
		height: G
	}), o("renderedImage", {
		width: G,
		height: G,
		offsetX: W,
		offsetY: W,
		fit: (e) => e === "contain" || e === "cover",
		align: (e) => e === "center"
	}), o("node", {
		width: G,
		photoHeight: G,
		textHeight: G,
		totalHeight: G
	}), o("departmentNode", {
		width: G,
		height: G
	}), t.themeRules != null && (Array.isArray(t.themeRules) ? i.themeRules = t.themeRules.filter((e, t) => {
		if (!e || typeof e != "object") return n.push(`${r}.themeRules[${t}] (not an object)`), !1;
		for (let i of R(e)) n.push(`${r}.themeRules[${t}].style.${i} ${JSON.stringify(e.style[i])}`);
		return !0;
	}).map(z) : a("themeRules", t.themeRules)), i;
}
function X(e) {
	return e && typeof e == "object" && W(e.x) && W(e.y) ? {
		x: e.x,
		y: e.y
	} : null;
}
function Z(e) {
	return e && typeof e == "object" && W(e.nx) && W(e.ny) && Math.abs(e.nx) <= 1 && Math.abs(e.ny) <= 1 ? {
		nx: e.nx,
		ny: e.ny
	} : null;
}
function Q(e, t, n, r) {
	let i = Object.create(null);
	if (e == null) return i;
	let a = K(e);
	if (!a) return n.push(`${t} (not an object)`), i;
	for (let e of Object.keys(a)) {
		let o = r(a[e]);
		o == null ? n.push(`${t}.${e}`) : i[e] = o;
	}
	return i;
}
var te = [
	"label",
	"personName",
	"status"
];
function ne(e, n, a, o) {
	if (!e || typeof e != "object" || Array.isArray(e)) return null;
	if (e.__deleted === !0) return { __deleted: !0 };
	let s = {}, c = (e) => a.push(`${o}.${n}.${e}`);
	if (e.__new === !0) {
		for (let t of i(e)) a.push(`${o}.${n} ${t}`);
		let t = u(Object.assign({}, e, { id: e.id == null ? n : e.id }));
		return Object.assign({ __new: !0 }, t);
	}
	for (let n of Object.keys(e)) {
		let i = e[n];
		if (n === "parentId") i == null || typeof i == "string" || W(i) ? s.parentId = t(i) : c(n);
		else if (te.includes(n)) i == null || typeof i == "string" || W(i) ? s[n] = i == null ? "" : String(i) : c(n);
		else if (n === "type") typeof i == "string" && /^[A-Za-z][\w-]*$/.test(i) ? s.type = i : c(n);
		else if (n === "width" || n === "height") G(i) ? s[n] = i : c(n);
		else if (n === "collapsed") typeof i == "boolean" || i === "true" || i === "false" ? s.collapsed = r(i) : c(n);
		else if (n === "layoutMode") i == null || i === "" ? s.layoutMode = null : U.has(i) ? s.layoutMode = i : c(n);
		else if (n === "data") {
			if (!i || typeof i != "object" || Array.isArray(i)) {
				c(n);
				continue;
			}
			let e = Object.assign({}, i);
			e.photo_url != null && typeof e.photo_url != "string" && (c("data.photo_url"), delete e.photo_url), s.data = e;
		} else n !== "id" && c(n);
	}
	return Object.keys(s).length ? s : null;
}
function $(e, t = [], n = "layout") {
	let r = e && typeof e == "object" && !Array.isArray(e) ? e : {};
	e != null && r !== e && t.push(`${n} (not an object)`);
	let i = {
		manualOffsets: Q(r.manualOffsets, `${n}.manualOffsets`, t, (e) => e && W(e.dx) && W(e.dy) ? {
			dx: e.dx,
			dy: e.dy
		} : null),
		edgeWaypoints: Q(r.edgeWaypoints, `${n}.edgeWaypoints`, t, (e) => {
			if (!Array.isArray(e)) return null;
			let t = e.map(X);
			return t.length && t.every(Boolean) ? t : null;
		}),
		edgeAnchors: Q(r.edgeAnchors, `${n}.edgeAnchors`, t, (e) => {
			if (!e || typeof e != "object") return null;
			let t = {};
			if (e.p != null) {
				let n = Z(e.p);
				if (!n) return null;
				t.p = n;
			}
			if (e.c != null) {
				let n = Z(e.c);
				if (!n) return null;
				t.c = n;
			}
			return Object.keys(t).length ? t : null;
		}),
		familyRouteOverrides: Q(r.familyRouteOverrides, `${n}.familyRouteOverrides`, t, (e) => e && W(e.trunkOffset) ? { trunkOffset: e.trunkOffset } : null),
		nodeOverrides: Object.create(null),
		collapsed: []
	}, a = r.nodeOverrides == null ? {} : K(r.nodeOverrides);
	if (!a) t.push(`${n}.nodeOverrides (not an object)`);
	else for (let e of Object.keys(a)) {
		let r = ne(a[e], e, t, `${n}.nodeOverrides`);
		if (r) i.nodeOverrides[e] = r;
		else if (a[e] && typeof a[e] == "object" && !Object.keys(a[e]).length) continue;
		else t.push(`${n}.nodeOverrides.${e}`);
	}
	if (r.collapsed != null) {
		if (!Array.isArray(r.collapsed)) t.push(`${n}.collapsed (not an array)`);
		else for (let e of r.collapsed) typeof e == "string" || W(e) ? i.collapsed.push(e) : t.push(`${n}.collapsed ${JSON.stringify(e)}`);
	}
	return i;
}
function re(e) {
	let t = [];
	if (!e || typeof e != "object" || Array.isArray(e)) return {
		layout: null,
		problems: ["layout (not an object)"]
	};
	e.full != null && typeof e.full != "boolean" && t.push(`full ${JSON.stringify(e.full)}`);
	let n = e.full === !0 && e.layout != null, r = {
		full: n,
		view: Y(e.view, t, "view")
	};
	return n && (r.layout = $(e.layout, t, "layout")), {
		layout: r,
		problems: t
	};
}
export { R as a, N as c, v as d, A as f, f as h, M as i, V as l, m, re as n, L as o, p, Y as r, z as s, $ as t, j as u };
