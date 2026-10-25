import { B as e, H as t, K as n, W as r, c as i, o as a, p as o, q as s, t as c, y as l } from "./bounds-Cig4UHsX.js";
// src/print/helveticaMetrics.js
var u = [];
for (let e = 32; e <= 126; e += 1) u.push(e);
for (let e = 160; e <= 255; e += 1) u.push(e);
u.push(8364, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 381, 8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 382, 376);
var d = {
	normal: [
		280,
		280,
		350,
		550,
		550,
		890,
		660,
		190,
		330,
		330,
		390,
		580,
		280,
		330,
		280,
		280,
		550,
		550,
		550,
		550,
		550,
		550,
		550,
		550,
		550,
		550,
		280,
		280,
		580,
		580,
		580,
		550,
		1010,
		660,
		660,
		720,
		720,
		660,
		610,
		780,
		720,
		280,
		500,
		660,
		550,
		830,
		720,
		780,
		660,
		780,
		720,
		660,
		610,
		720,
		660,
		940,
		660,
		660,
		610,
		280,
		280,
		280,
		470,
		550,
		330,
		550,
		550,
		500,
		550,
		550,
		280,
		550,
		550,
		220,
		220,
		500,
		220,
		830,
		550,
		550,
		550,
		550,
		330,
		500,
		280,
		550,
		500,
		720,
		500,
		500,
		500,
		330,
		260,
		330,
		580,
		530,
		330,
		550,
		550,
		550,
		550,
		530,
		550,
		330,
		730,
		370,
		550,
		580,
		530,
		730,
		330,
		400,
		580,
		530,
		530,
		330,
		550,
		530,
		280,
		330,
		530,
		360,
		550,
		530,
		530,
		530,
		610,
		660,
		660,
		660,
		660,
		660,
		660,
		1e3,
		720,
		660,
		660,
		660,
		660,
		280,
		280,
		280,
		280,
		530,
		720,
		780,
		780,
		780,
		780,
		780,
		530,
		780,
		720,
		720,
		720,
		720,
		530,
		530,
		610,
		550,
		550,
		550,
		550,
		550,
		550,
		890,
		500,
		550,
		550,
		550,
		550,
		280,
		280,
		280,
		280,
		530,
		550,
		550,
		550,
		550,
		550,
		550,
		580,
		610,
		550,
		550,
		550,
		550,
		530,
		530,
		500,
		530,
		220,
		550,
		330,
		1e3,
		550,
		550,
		330,
		1e3,
		530,
		330,
		530,
		530,
		220,
		220,
		330,
		330,
		350,
		550,
		1e3,
		330,
		1e3,
		530,
		330,
		530,
		530,
		660
	],
	bold: [
		280,
		330,
		470,
		550,
		550,
		890,
		720,
		240,
		330,
		330,
		390,
		580,
		280,
		330,
		280,
		280,
		550,
		550,
		550,
		550,
		550,
		550,
		550,
		550,
		550,
		550,
		330,
		330,
		580,
		580,
		580,
		610,
		970,
		720,
		720,
		720,
		720,
		660,
		610,
		780,
		720,
		280,
		550,
		720,
		610,
		830,
		720,
		780,
		660,
		780,
		720,
		660,
		610,
		720,
		660,
		940,
		660,
		660,
		610,
		330,
		280,
		330,
		580,
		550,
		330,
		550,
		610,
		550,
		610,
		550,
		330,
		610,
		610,
		280,
		280,
		550,
		280,
		890,
		610,
		610,
		610,
		610,
		390,
		550,
		330,
		610,
		550,
		780,
		550,
		550,
		500,
		390,
		280,
		390,
		580,
		560,
		330,
		550,
		550,
		550,
		550,
		560,
		550,
		330,
		730,
		370,
		550,
		580,
		560,
		730,
		330,
		400,
		580,
		560,
		560,
		330,
		610,
		550,
		280,
		330,
		560,
		360,
		550,
		560,
		560,
		560,
		610,
		720,
		720,
		720,
		720,
		720,
		720,
		1e3,
		720,
		660,
		660,
		660,
		660,
		280,
		280,
		280,
		280,
		560,
		720,
		780,
		780,
		780,
		780,
		780,
		560,
		780,
		720,
		720,
		720,
		720,
		560,
		560,
		610,
		550,
		550,
		550,
		550,
		550,
		550,
		890,
		550,
		550,
		550,
		550,
		550,
		280,
		280,
		280,
		280,
		560,
		610,
		610,
		610,
		610,
		610,
		610,
		580,
		610,
		610,
		610,
		610,
		610,
		560,
		560,
		550,
		560,
		280,
		550,
		500,
		1e3,
		550,
		550,
		330,
		1e3,
		560,
		330,
		560,
		560,
		280,
		280,
		500,
		500,
		350,
		550,
		1e3,
		330,
		1e3,
		560,
		330,
		560,
		560,
		660
	]
}, f = new Map(u.map((e, t) => [e, t])), p = 560;
function m(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of String(e ?? "")) f.has(n.codePointAt(0)) || t.add(n);
	return [...t];
}
function h(e, t, n = "normal") {
	let r = n === "bold" || Number(n) >= 600 ? d.bold : d.normal, i = 0;
	for (let t of String(e ?? "")) {
		let e = f.get(t.codePointAt(0));
		i += e === void 0 ? p : r[e];
	}
	return i / 1e3 * t;
}
// src/print/textLayout.js
var g = .97, _ = 1.15, v = "…";
function y(e, t, n, r) {
	return h(e, n, r) <= t * g;
}
function b(e, t, n, r) {
	let i = [], a = "";
	for (let o of e) a && !y(a + o, t, n, r) ? (i.push(a), a = o) : a += o;
	return a && i.push(a), i;
}
function x(e, t, n, r) {
	return (e.match(/[^-]+-+|[^-]+$|-+/g) || [e]).flatMap((e) => y(e, t, n, r) ? [e] : b(e, t, n, r));
}
function S(e, t, n, r = "normal") {
	let i = String(e ?? "").trim().split(/\s+/).filter(Boolean), a = [], o = "";
	for (let e of i) (y(e, t, n, r) ? [e] : x(e, t, n, r)).forEach((e, i) => {
		let s = o ? `${o}${i ? "" : " "}${e}` : e;
		o && !y(s, t, n, r) ? (a.push(o), o = e) : o = s;
	});
	return o && a.push(o), a;
}
function C(e, t, n, r, i = "normal") {
	let a = Math.max(0, Math.floor(t));
	if (e.length <= a) return {
		lines: e,
		truncated: !1
	};
	if (a === 0) return {
		lines: [],
		truncated: e.length > 0
	};
	let o = e.slice(0, a), s = o[a - 1];
	for (; s && !y(s + v, n, r, i);) s = s.slice(0, -1).trimEnd();
	return o[a - 1] = s + v, {
		lines: o,
		truncated: !0
	};
}
function w(e) {
	return e.reduce((e, t) => e + t.lines.length * t.fontSize * _, 0);
}
function T(e, t, n, r) {
	let i = Math.min(...e.map((e) => e.fontSize)), a = Math.min(1, r / i), o = [];
	for (let e = 1; e > a + 1e-9; e -= .04) o.push(e);
	o.push(a);
	let s = (n) => e.map((e) => {
		let r = e.fontSize * n;
		return {
			...e,
			fontSize: r,
			lines: S(e.text, t, r, e.weight)
		};
	});
	for (let e of o) {
		let t = s(e);
		if (w(t) <= n) return {
			groups: t,
			truncated: !1,
			scale: e
		};
	}
	let c = s(a), l = !1, u = n;
	for (let e = 0; e < c.length; e += 1) {
		let n = c[e], r = n.fontSize * _, i = c.slice(e + 1).reduce((e, t) => e + (t.lines.length ? t.fontSize * _ : 0), 0), a = n.maxLines ?? Infinity, o = Math.min(a, Math.max(+!!n.lines.length, Math.floor((u - i) / r + 1e-9))), s = C(n.lines, o, t, n.fontSize, n.weight);
		n.lines = s.lines, l ||= s.truncated, u -= n.lines.length * r;
	}
	return {
		groups: c,
		truncated: l,
		scale: a
	};
}
// src/print/photos.js
var E = 2e3, D = 16, ee = 25.4;
function O(e, t, n = E) {
	let r = Number(e), i = Number(t);
	if (!(r > 0) || !(i > 0)) throw Error("A printed photo size and resolution are required.");
	let a = Math.ceil(r / ee * i);
	return Math.min(Math.max(D, a), Math.max(D, Math.floor(n)));
}
function k(e, t, n) {
	let i = Number(e), a = Number(t);
	if (!(i > 0) || !(a > 0)) throw Error("The photo has no pixel dimensions.");
	let o = n * (r.width / s.width), c = Math.min(o / i, o / a), l = i * c, u = a * c;
	return {
		x: (n - l) / 2,
		y: (n - u) / 2,
		width: l,
		height: u
	};
}
function te(e, t) {
	if (!e?.positioned || !e.transform) throw Error("A completed print layout is required.");
	let n = e.profile?.dpi, r = {};
	for (let i of e.positioned) {
		let a = i.node?.data?.photo_url;
		if (!a) continue;
		let o = t(i.node) * e.transform.scale;
		if (!(o > 0)) continue;
		let s = O(o, n);
		r[a] = Math.max(r[a] || 0, s);
	}
	return r;
}
function ne(e) {
	return new Promise((t, n) => {
		let r = new Image();
		r.decoding = "async", r.onload = () => t(r), r.onerror = () => n(/* @__PURE__ */ Error("The photo could not be decoded.")), r.src = e;
	});
}
function re(e, t) {
	let n = document.createElement("canvas");
	return n.width = e, n.height = t, n;
}
function ie(e, t, n) {
	let r = n.createCanvas || re, i = k(e.naturalWidth || e.width, e.naturalHeight || e.height, t), a = r(t, t), o = a.getContext("2d");
	if (!o) throw Error("The browser could not create a drawing surface for the photo.");
	return o.fillStyle = n.background || "#004264", o.fillRect(0, 0, t, t), o.imageSmoothingEnabled = !0, o.imageSmoothingQuality = "high", o.drawImage(e, i.x, i.y, i.width, i.height), a;
}
async function A(e, t, n = {}) {
	let r = n.loadImage || ne, i = n.charBudget || 3e6, a = await r(e), o = t;
	for (;;) {
		let e = ie(a, o, n);
		try {
			for (let t of [
				n.quality ?? .9,
				.75,
				.6
			]) {
				let n = e.toDataURL("image/jpeg", t);
				if (n.length <= i) return n;
			}
		} finally {
			e.width = 0, e.height = 0;
		}
		if (o <= D) throw Error("The photo could not be compressed enough to embed in the PDF.");
		o = Math.max(D, Math.floor(o * .75));
	}
}
async function ae(e, t, n, r = {}) {
	let i = te(e, n), a = {}, o = [];
	for (let [e, n] of Object.entries(i)) {
		let i = t?.[e];
		if (i) try {
			a[e] = await A(i, n, r);
		} catch {
			o.push(e);
		}
	}
	return {
		photos: a,
		failed: o
	};
}
// src/print/index.js
var j = Object.freeze([
	"portrait-sectioned",
	"wide-row",
	"portrait-spine",
	"custom"
]), oe = Object.freeze({
	"portrait-sectioned": {
		orientation: "TopToBottom",
		subtreeMode: "AutoSmart",
		spacingX: 26,
		spacingY: 42
	},
	"wide-row": {
		orientation: "TopToBottom",
		subtreeMode: "AutoSmart",
		spacingX: 34,
		spacingY: 38
	},
	"portrait-spine": {
		orientation: "TopToBottom",
		subtreeMode: "Alternate",
		spacingX: 28,
		spacingY: 34
	},
	custom: {
		orientation: "TopToBottom",
		subtreeMode: "Custom",
		spacingX: 28,
		spacingY: 38
	}
}), se = Object.freeze({
	width: 82,
	height: 58
}), ce = Object.freeze({
	width: 100,
	height: 30
}), le = Object.freeze({
	width: 96,
	height: 70
}), ue = 3.2;
function M(e, t) {
	let n = Number(e);
	return Number.isFinite(n) ? n : t;
}
function N(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
var P = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
function F(e) {
	return String(e ?? "").replace(P, "");
}
function I(e) {
	return F(e).replace(/[&<>"']/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&apos;"
	})[e]);
}
function L(e) {
	return e?.data?.printRole ? e.data.printRole : e?.data?.is_head || e?.data?.isHead ? "head" : e?.type === "department" ? "level" : "person";
}
function de(e, t = {}) {
	let n = L(e), r = n === "head" ? le : n === "level" ? ce : se, i = t[e.id] || {};
	return {
		width: N(M(i.widthMm, r.width), 30, 300),
		height: N(M(i.heightMm, r.height), 16, 220)
	};
}
function fe(e) {
	let t = /* @__PURE__ */ new Map(), n = new Map((e || []).map((e) => [String(e.id), e]));
	for (let n of e || []) {
		let e = String(n.parentId || "");
		t.set(e, (t.get(e) || 0) + 1);
	}
	let r = 0;
	for (let t of e || []) {
		let e = 0, i = t, a = /* @__PURE__ */ new Set();
		for (; i?.parentId && n.has(String(i.parentId)) && !a.has(String(i.parentId));) a.add(String(i.parentId)), e += 1, i = n.get(String(i.parentId));
		r = Math.max(r, e);
	}
	return {
		count: (e || []).length,
		maxDepth: r,
		maxChildren: Math.max(0, ...t.values())
	};
}
function pe(e, t) {
	let n = M(t?.widthMm, 0), r = M(t?.heightMm, 0);
	if (n <= 0 || r <= 0) throw Error("Physical canvas dimensions are required.");
	let i = fe(e), a = n / r, o, s = [];
	return a >= 1.3 ? (o = "wide-row", s.push("The selected canvas is landscape or unusually wide.")) : i.maxDepth >= 4 || i.count >= 18 && i.maxChildren <= 5 ? (o = "portrait-spine", s.push("The chart is deep enough to benefit from a vertical spine.")) : (o = "portrait-sectioned", s.push("The canvas is portrait and the chart has a compact hierarchy.")), i.maxChildren >= 7 && o !== "wide-row" && s.push("A wide sibling group may need a larger canvas or a manual override."), {
		family: o,
		reasons: s,
		stats: i,
		canvasAspect: a
	};
}
function R(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function z(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var me = /^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\))$/i, he = /* @__PURE__ */ new Set([
	"orientation",
	"subtreeMode",
	"spacingX",
	"spacingY"
]);
function ge(e, t, n, r) {
	let i = {};
	if (!R(e)) return n.push(t), i;
	for (let [a, o] of Object.entries(e)) {
		let e = r(o, `${t}.${a}`);
		e === null ? n.push(`${t}.${a}`) : i[a] = e;
	}
	return i;
}
function B(e) {
	if (e !== void 0) return !R(e) || !z(e.nx) || !z(e.ny) || Math.abs(e.nx) > 1 || Math.abs(e.ny) > 1 ? null : {
		nx: e.nx,
		ny: e.ny
	};
}
function V(t) {
	let r = [];
	if (t == null) return {
		layout: {},
		issues: r
	};
	if (!R(t)) return {
		layout: {},
		issues: ["layout"]
	};
	let i = {}, a = (e, n) => {
		t[e] !== void 0 && (i[e] = ge(t[e], e, r, n));
	};
	if (a("nodeOverrides", (e) => {
		if (!R(e)) return null;
		let t = {};
		for (let n of ["widthMm", "heightMm"]) if (e[n] !== void 0) {
			if (!z(e[n])) return null;
			t[n] = e[n];
		}
		return t;
	}), a("nodeOffsets", (e) => R(e) && z(e.dx) && z(e.dy) ? {
		dx: e.dx,
		dy: e.dy
	} : null), a("edgeWaypoints", (e) => {
		if (!Array.isArray(e)) return null;
		let t = [];
		for (let n of e) {
			if (!R(n) || !z(n.x) || !z(n.y)) return null;
			t.push({
				x: n.x,
				y: n.y
			});
		}
		return t;
	}), a("edgeAnchors", (e) => {
		if (!R(e)) return null;
		let t = B(e.p), n = B(e.c);
		if (t === null || n === null) return null;
		let r = {};
		return t && (r.p = t), n && (r.c = n), r;
	}), a("edgeStyles", (e) => {
		if (!R(e)) return null;
		let t = {};
		if (e.color !== void 0) {
			if (typeof e.color != "string" || !me.test(e.color.trim())) return null;
			t.color = e.color.trim();
		}
		if (e.widthMm !== void 0) {
			if (!z(e.widthMm)) return null;
			t.widthMm = e.widthMm;
		}
		if (e.pattern !== void 0) {
			if (e.pattern !== "solid" && e.pattern !== "dashed") return null;
			t.pattern = e.pattern;
		}
		return t;
	}), t.options !== void 0) {
		if (!R(t.options)) r.push("options");
		else {
			let a = {};
			for (let [i, o] of Object.entries(t.options)) he.has(i) && (i === "orientation" && e.includes(o) || i === "subtreeMode" && n.includes(o) || (i === "spacingX" || i === "spacingY") && z(o) && o >= 0 && o <= 500) ? a[i] = o : r.push(`options.${i}`);
			i.options = a;
		}
	}
	return {
		layout: i,
		issues: r
	};
}
function H(e = {}) {
	let t = M(e.widthMm, 0), n = M(e.heightMm, 0);
	if (t < 200 || t > 1e4 || n < 200 || n > 1e4) throw Error("Print width and height must be between 200 mm and 10,000 mm.");
	let r = j.includes(e.layoutFamily) ? e.layoutFamily : "portrait-sectioned", i = N(M(e.safeMarginMm, 25), 0, Math.min(t, n) / 4), a = N(M(e.headerHeightMm, n * .14), 0, n / 3), o = N(M(e.footerHeightMm, n * .06), 0, n / 4);
	return {
		schemaVersion: 1,
		templateId: String(e.templateId || "municipal-classic"),
		templateVersion: Math.max(1, Math.trunc(M(e.templateVersion, 1))),
		widthMm: t,
		heightMm: n,
		safeMarginMm: i,
		headerHeightMm: a,
		footerHeightMm: o,
		preferredUnit: [
			"mm",
			"cm",
			"in",
			"ft"
		].includes(e.preferredUnit) ? e.preferredUnit : "mm",
		dpi: N(Math.trunc(M(e.dpi, 150)), 72, 600),
		minFontMm: N(M(e.minFontMm, ue), 2.5, 8),
		layoutFamily: r,
		layout: V(e.layout).layout
	};
}
function _e(e) {
	return {
		x: e.safeMarginMm,
		y: e.safeMarginMm + e.headerHeightMm,
		width: e.widthMm - e.safeMarginMm * 2,
		height: e.heightMm - e.safeMarginMm * 2 - e.headerHeightMm - e.footerHeightMm
	};
}
function ve(e, t) {
	let n = 0;
	for (let r = 0; r < e.length; r += 1) {
		let i = e[r], o = a(i, t);
		for (let s = r + 1; s < e.length; s += 1) {
			let r = e[s], c = a(r, t);
			Math.abs(o.x - c.x) * 2 < i.node.width + r.node.width && Math.abs(o.y - c.y) * 2 < i.node.height + r.node.height && (n += 1);
		}
	}
	return n;
}
var U = Object.freeze({
	color: "#476965",
	widthMm: 1,
	pattern: "solid"
});
function W(e) {
	let t = [];
	for (let n of e.positioned) {
		if (!n.parentId) continue;
		let r = e.posById[n.parentId];
		if (!r) continue;
		let a = i(r, n, e.cfg, e.offsets, e.edgeWaypoints, e.edgeAnchors), o = e.edgeStyles[n.node.id] || {};
		t.push({
			id: n.node.id,
			d: a,
			style: {
				color: o.color || U.color,
				widthMm: N(M(o.widthMm, U.widthMm), .3, 5),
				pattern: o.pattern === "dashed" ? "dashed" : "solid"
			}
		});
	}
	let n = /* @__PURE__ */ new Set(), r = (t) => {
		let n = e.offsets?.[t];
		return n && (Math.abs(M(n.dx, 0)) > .01 || Math.abs(M(n.dy, 0)) > .01);
	};
	for (let t of e.familyNetworks || []) (r(t.parentId) || t.childIds.some((t) => r(t) || e.edgeWaypoints?.[t] && e.edgeWaypoints[t].length || e.edgeAnchors?.[t])) && n.add(String(t.parentId));
	return l(t, e.familyNetworks || [], {
		sharedStyle: U,
		rebuildFamilyIds: n
	}).segments;
}
function ye(e, t) {
	let n = e.x, r = e.y, i = e.x + e.w, a = e.y + e.h, o = U.widthMm;
	for (let e of t) {
		o = Math.max(o, M(e.style?.widthMm, U.widthMm));
		let t = String(e.d).match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi) || [];
		for (let e = 0; e + 1 < t.length; e += 2) {
			let o = Number(t[e]), s = Number(t[e + 1]);
			n = Math.min(n, o), i = Math.max(i, o), r = Math.min(r, s), a = Math.max(a, s);
		}
	}
	let s = o / 2;
	return {
		x: n - s,
		y: r - s,
		w: i - n + s * 2,
		h: a - r + s * 2
	};
}
function be(e, t) {
	let n = Math.max(20, e.w * .25), r = Math.max(20, e.h * .25), i = [];
	for (let [a, o] of Object.entries(t || {})) (o || []).some((t) => t.x < e.x - n || t.x > e.x + e.w + n || t.y < e.y - r || t.y > e.y + e.h + r) && i.push(a);
	return i;
}
function xe(e) {
	return F(e.personName || e.data?.name || e.label || e.id).trim();
}
var Se = Object.freeze({
	head: {
		name: 6.5,
		title: 5.2
	},
	person: {
		name: 5.7,
		title: 4.7
	}
}), G = 4.2, Ce = 8, K = 3;
function q(e) {
	let t = L(e);
	return t === "level" ? 0 : Math.min(e.height - 10, t === "head" ? 42 : 32);
}
function J(e) {
	let t = L(e);
	if (t === "level") {
		let n = e.width - 6, r = e.height - K, i = Math.min(Ce, e.height / 2);
		return {
			role: t,
			...T([{
				key: "title",
				text: F(e.label || "").toUpperCase(),
				fontSize: i,
				weight: "bold"
			}], n, r, Math.min(i, G))
		};
	}
	let n = Se[t === "head" ? "head" : "person"], r = q(e), i = e.width - r - 13, a = e.height - 6;
	return {
		role: t,
		...T([{
			key: "name",
			text: F(e.personName || e.data?.name || "") || (e.status === "VACANT" ? "VACANT" : "—"),
			fontSize: n.name,
			weight: "bold",
			maxLines: 2
		}, {
			key: "title",
			text: F(e.label || ""),
			fontSize: n.title,
			weight: "normal"
		}], i, a, G)
	};
}
function we(e, t) {
	let n = [];
	for (let r of e) {
		let e = r.node, i = xe(e), a = m(`${e.personName || ""} ${e.label || ""}`.replace(P, "").replace(/\s/g, " "));
		a.length && n.push({
			level: "warning",
			code: "unsupported-characters",
			nodeId: e.id,
			message: `"${i}" uses ${a.map((e) => `"${e}"`).join(", ")}, which the PDF fonts cannot print. Edit the entry or use a supported spelling before publishing.`
		}), t[e.id]?.truncated && n.push({
			level: "warning",
			code: "text-truncated",
			nodeId: e.id,
			message: `Text for "${i}" was shortened to fit its card. Enlarge the card or shorten the entry before publishing.`
		});
	}
	return n;
}
function Te(e, t) {
	let n = H(t), r = _e(n), i = [];
	if (r.width <= 0 || r.height <= 0) return {
		ok: !1,
		profile: n,
		contentBox: r,
		diagnostics: [{
			level: "error",
			code: "invalid-content-box",
			message: "Header, footer, and margins leave no room for the chart."
		}]
	};
	let { issues: a } = V(t?.layout);
	if (a.length) {
		let e = a.slice(0, 5).join(", ") + (a.length > 5 ? `, and ${a.length - 5} more` : "");
		i.push({
			level: "error",
			code: "invalid-saved-layout",
			message: `The saved print layout has invalid values (${e}). A MIO administrator must review and save the print settings again.`
		});
	}
	let s = n.layout.nodeOverrides || {}, l = (e || []).map((e) => {
		let t = de(e, s);
		return {
			...e,
			width: t.width,
			height: t.height
		};
	});
	if (!l.length) return {
		ok: !1,
		profile: n,
		contentBox: r,
		diagnostics: [{
			level: "error",
			code: "empty-chart",
			message: "Add at least one chart entry before exporting."
		}]
	};
	let u = oe[n.layoutFamily], d = n.layout.options || {}, f = {
		...n.layoutFamily === "custom" ? {
			...u,
			...d
		} : u,
		targetSize: {
			width: r.width,
			height: r.height
		}
	}, p = o(l, f), m = n.layout.nodeOffsets || {}, h = n.layout.edgeWaypoints || {}, g = n.layout.edgeAnchors || {}, _ = n.layout.edgeStyles || {}, v = Object.keys(m).length ? c(p.positioned, m, 0) : p.framingBounds || c(p.positioned, m, 0), y = W({
		positioned: p.positioned,
		posById: p.posById,
		cfg: p.cfg,
		familyNetworks: p.familyNetworks || [],
		offsets: m,
		edgeWaypoints: h,
		edgeAnchors: g,
		edgeStyles: _
	}), b = be(c(p.positioned, m, 0), h);
	b.length && i.push({
		level: "error",
		code: "stray-connector",
		message: `Connector bend points for ${b.slice(0, 5).join(", ")}${b.length > 5 ? ` and ${b.length - 5} more` : ""} lie far outside the chart. Reset those connectors before exporting.`
	});
	let x = ye(v, y), S = Math.min(r.width / x.w, r.height / x.h), C = G * S;
	!Number.isFinite(S) || S <= 0 ? i.push({
		level: "error",
		code: "invalid-layout",
		message: "The chart layout could not be measured."
	}) : C < n.minFontMm && i.push({
		level: "error",
		code: "text-too-small",
		message: `The fitted text would be about ${C.toFixed(1)} mm high, below the ${n.minFontMm.toFixed(1)} mm minimum. Increase the canvas, choose another layout, or reduce entries.`
	});
	let w = ve(p.positioned, m);
	w && i.push({
		level: "error",
		code: "node-overlap",
		message: `${w} chart card overlap${w === 1 ? "s" : ""} must be resolved before export.`
	}), S > 2.5 && i.push({
		level: "warning",
		code: "sparse-chart",
		message: "The chart occupies a small part of this canvas; review the preview before publishing."
	}), S < .7 && !i.some((e) => e.code === "text-too-small") && i.push({
		level: "warning",
		code: "dense-chart",
		message: "The chart is densely packed. Inspect names and positions at 100% before publishing."
	});
	let T = {};
	for (let e of p.positioned) T[e.node.id] = J(e.node);
	i.push(...we(p.positioned, T));
	let E = r.x + (r.width - x.w * S) / 2 - x.x * S, D = r.y + (r.height - x.h * S) / 2 - x.y * S;
	return {
		ok: !i.some((e) => e.level === "error"),
		profile: n,
		contentBox: r,
		positioned: p.positioned,
		posById: p.posById,
		cfg: p.cfg,
		familyNetworks: p.familyNetworks || [],
		offsets: m,
		edgeWaypoints: h,
		edgeAnchors: g,
		edgeStyles: _,
		connectorSegments: y,
		cardText: T,
		bounds: x,
		transform: {
			scale: S,
			x: E,
			y: D
		},
		effectiveFontMm: C,
		diagnostics: i
	};
}
function Ee(e, t, n, r, i, a, o) {
	return e.map((e, s) => `<text x="${t}" y="${n + s * i}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${r}" font-weight="${a}" fill="${o}">${I(e)}</text>`).join("");
}
function Y(e, t, n, r, i) {
	let a = n + (r - e.reduce((e, t) => e + t.lines.length * t.fontSize * _, 0)) / 2, o = "";
	for (let n of e) {
		if (!n.lines.length) continue;
		let e = n.fontSize * _;
		o += Ee(n.lines, t, a + n.fontSize * .8, n.fontSize, e, n.weight === "bold" ? 700 : 400, i[n.key]), a += n.lines.length * e;
	}
	return o;
}
function De(e, n, i, a, o, c) {
	let l = e.data?.photo_url, u = l ? c.preparedPhotos?.[l] : null, d = l ? c.photoDataByUrl?.[l] || (c.allowRemotePhotos ? l : null) : null, f = `<defs><clipPath id="${o}"><rect x="${n}" y="${i}" width="${a}" height="${a}"/></clipPath></defs>`;
	if (f += `<rect x="${n}" y="${i}" width="${a}" height="${a}" fill="${t}"/>`, u) f += `<image href="${I(u)}" x="${n}" y="${i}" width="${a}" height="${a}" preserveAspectRatio="none" clip-path="url(#${o})"/>`;
	else if (d) {
		let e = a * (r.width / s.width), t = (e - a) / 2;
		f += `<image href="${I(d)}" x="${n - t}" y="${i - t}" width="${e}" height="${e}" preserveAspectRatio="xMidYMid meet" clip-path="url(#${o})"/>`;
	} else {
		let e = n + a / 2;
		f += `<g clip-path="url(#${o})" fill="#ffffff" fill-opacity="0.72"><circle cx="${e}" cy="${i + a * .4}" r="${a * .17}"/><ellipse cx="${e}" cy="${i + a * .93}" rx="${a * .33}" ry="${a * .25}"/></g>`;
	}
	return f;
}
function Oe(e, t, n, r) {
	let i = e.node, o = a(e, t.offsets), s = o.x - i.width / 2, c = o.y - i.height / 2, l = t.cardText?.[i.id] || J(i), u = I(i.id);
	if (l.role === "level") {
		let e = Y(l.groups, o.x, c + K / 2, i.height - K, { title: "#ffffff" });
		return `<g data-node-id="${u}"><rect x="${s}" y="${c}" width="${i.width}" height="${i.height}" rx="3" fill="#0a5b5e" stroke="#073b3d" stroke-width="0.8"/>${e}</g>`;
	}
	let d = l.role === "head" ? "#d8aa35" : "#0a5b5e", f = q(i), p = s + 5, m = c + (i.height - f) / 2, h = s + f + 8 + (i.width - f - 13) / 2, g = `<rect x="${s}" y="${c}" width="${i.width}" height="${i.height}" rx="3" fill="#ffffff" stroke="${d}" stroke-width="${l.role === "head" ? 1.4 : .8}"/>`;
	return g += `<rect x="${s}" y="${c}" width="3.5" height="${i.height}" rx="1.7" fill="${d}"/>`, g += De(i, p, m, f, `loc-print-photo-${r}`, n), g += Y(l.groups, h, c + K, i.height - 6, {
		name: "#173334",
		title: "#455b59"
	}), `<g data-node-id="${u}">${g}</g>`;
}
function X(e, t = {}) {
	if (!e?.positioned) throw Error("A completed print layout is required.");
	let n = (e.connectorSegments || W(e)).map((e) => {
		let t = e.style || U, n = t.pattern === "dashed" ? " stroke-dasharray=\"5 4\"" : "";
		return `<path d="${I(e.d)}" fill="none" stroke="${I(t.color)}" stroke-width="${M(t.widthMm, 1)}"${n}/>`;
	}), r = e.positioned.map((n, r) => Oe(n, e, t, r)).join(""), { x: i, y: a, scale: o } = e.transform;
	return `<g data-print-chart="true" transform="translate(${i} ${a}) scale(${o})">${n.join("")}${r}</g>`;
}
function ke(e, t = {}) {
	let { widthMm: n, heightMm: r } = e.profile, i = t.background || "transparent";
	return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${n}mm" height="${r}mm" viewBox="0 0 ${n} ${r}" role="img" aria-label="${I(t.ariaLabel || "Organizational chart")}"><rect width="${n}" height="${r}" fill="${I(i)}"/>${X(e, t)}</svg>`;
}
function Ae(e, t, n = {}) {
	return ae(e, t, q, n);
}
var Z = 72 / 25.4, Q = 14400, je = 4e6;
function $(e, t) {
	let n = Math.max(e, t) * Z, r = n > Q ? Math.ceil(n / Q * 1e3 + 1e-6) / 1e3 : 1, i = Z / r;
	return {
		userUnit: r,
		unitsPerMm: i,
		pageWidth: e * i,
		pageHeight: t * i
	};
}
function Me(e) {
	for (let t of e.querySelectorAll("image")) {
		let e = t.getAttribute("href") || t.getAttribute("xlink:href") || "";
		if (e.length > 4e6) {
			let n = t.closest("[data-node-id]");
			return {
				nodeId: n ? n.getAttribute("data-node-id") : null,
				megabytes: e.length / 1e6
			};
		}
	}
	return null;
}
async function Ne(e, t = {}) {
	if (!e || String(e.tagName).toLowerCase() !== "svg") throw Error("An SVG element is required.");
	let n = M(t.widthMm, 0), r = M(t.heightMm, 0);
	if (n <= 0 || r <= 0) throw Error("PDF width and height are required.");
	let i = Me(e);
	if (i) throw Error(`A photo${i.nodeId ? ` for ${i.nodeId}` : ""} is too large to embed in the PDF (${i.megabytes.toFixed(1)} MB). Prepare photos with preparePrintPhotos() before exporting.`);
	let [a, o] = await Promise.all([import("jspdf"), import("svg2pdf.js")]), s = a.jsPDF || a.default?.jsPDF, c = o.svg2pdf || o.default?.svg2pdf, l = $(n, r), u = new s({
		orientation: n > r ? "landscape" : "portrait",
		unit: l.unitsPerMm,
		userUnit: l.userUnit,
		format: [n, r],
		compress: !0,
		putOnlyUsedFonts: !0
	});
	return l.userUnit !== 1 && u.__private__.setPdfVersion("1.6"), await c(e, u, {
		xOffset: 0,
		yOffset: 0,
		scale: 1
	}), u.output("blob");
}
export { je as MAX_EMBEDDED_IMAGE_CHARS, E as MAX_PRINT_PHOTO_PX, j as PRINT_LAYOUT_FAMILIES, Te as layoutPrintChart, H as normalizePrintProfile, Ae as preparePrintPhotos, $ as printPdfPageGeometry, O as printPhotoPixelSize, k as printPhotoPlacement, A as rasterizePrintPhoto, pe as recommendPrintLayout, X as renderPrintChartFragment, ke as renderPrintChartSvg, V as sanitizePrintLayout, Ne as svgElementToPdfBlob };
