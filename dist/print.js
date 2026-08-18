import { a as e, d as t, s as n, t as r } from "./bounds-Bzdsw6ck.js";
//#region src/print/index.js
var i = Object.freeze([
	"portrait-sectioned",
	"wide-row",
	"portrait-spine",
	"custom"
]), a = Object.freeze({
	"portrait-sectioned": {
		orientation: "TopToBottom",
		subtreeMode: "Balanced",
		spacingX: 26,
		spacingY: 42
	},
	"wide-row": {
		orientation: "TopToBottom",
		subtreeMode: "Balanced",
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
}), o = Object.freeze({
	width: 82,
	height: 58
}), s = Object.freeze({
	width: 100,
	height: 30
}), c = Object.freeze({
	width: 96,
	height: 70
}), l = 3.2;
function u(e, t) {
	let n = Number(e);
	return Number.isFinite(n) ? n : t;
}
function d(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function f(e) {
	return String(e ?? "").replace(/[&<>"']/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&apos;"
	})[e]);
}
function p(e) {
	return e?.data?.printRole ? e.data.printRole : e?.data?.is_head || e?.data?.isHead ? "head" : e?.type === "department" ? "level" : "person";
}
function m(e, t = {}) {
	let n = p(e), r = n === "head" ? c : n === "level" ? s : o, i = t[e.id] || {};
	return {
		width: d(u(i.widthMm, r.width), 30, 300),
		height: d(u(i.heightMm, r.height), 16, 220)
	};
}
function h(e) {
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
function g(e, t) {
	let n = u(t?.widthMm, 0), r = u(t?.heightMm, 0);
	if (n <= 0 || r <= 0) throw Error("Physical canvas dimensions are required.");
	let i = h(e), a = n / r, o, s = [];
	return a >= 1.3 ? (o = "wide-row", s.push("The selected canvas is landscape or unusually wide.")) : i.maxDepth >= 4 || i.count >= 18 && i.maxChildren <= 5 ? (o = "portrait-spine", s.push("The chart is deep enough to benefit from a vertical spine.")) : (o = "portrait-sectioned", s.push("The canvas is portrait and the chart has a compact hierarchy.")), i.maxChildren >= 7 && o !== "wide-row" && s.push("A wide sibling group may need a larger canvas or a manual override."), {
		family: o,
		reasons: s,
		stats: i,
		canvasAspect: a
	};
}
function _(e = {}) {
	let t = u(e.widthMm, 0), n = u(e.heightMm, 0);
	if (t < 200 || t > 1e4 || n < 200 || n > 1e4) throw Error("Print width and height must be between 200 mm and 10,000 mm.");
	let r = i.includes(e.layoutFamily) ? e.layoutFamily : "portrait-sectioned", a = d(u(e.safeMarginMm, 25), 0, Math.min(t, n) / 4), o = d(u(e.headerHeightMm, n * .14), 0, n / 3), s = d(u(e.footerHeightMm, n * .06), 0, n / 4);
	return {
		schemaVersion: 1,
		templateId: String(e.templateId || "municipal-classic"),
		templateVersion: Math.max(1, Math.trunc(u(e.templateVersion, 1))),
		widthMm: t,
		heightMm: n,
		safeMarginMm: a,
		headerHeightMm: o,
		footerHeightMm: s,
		preferredUnit: [
			"mm",
			"cm",
			"in",
			"ft"
		].includes(e.preferredUnit) ? e.preferredUnit : "mm",
		dpi: d(Math.trunc(u(e.dpi, 150)), 72, 600),
		minFontMm: d(u(e.minFontMm, l), 2.5, 8),
		layoutFamily: r,
		layout: e.layout && typeof e.layout == "object" ? e.layout : {}
	};
}
function v(e) {
	return {
		x: e.safeMarginMm,
		y: e.safeMarginMm + e.headerHeightMm,
		width: e.widthMm - e.safeMarginMm * 2,
		height: e.heightMm - e.safeMarginMm * 2 - e.headerHeightMm - e.footerHeightMm
	};
}
function y(t, n) {
	let r = 0;
	for (let i = 0; i < t.length; i += 1) {
		let a = t[i], o = e(a, n);
		for (let s = i + 1; s < t.length; s += 1) {
			let i = t[s], c = e(i, n);
			Math.abs(o.x - c.x) * 2 < a.node.width + i.node.width && Math.abs(o.y - c.y) * 2 < a.node.height + i.node.height && (r += 1);
		}
	}
	return r;
}
function b(e, n) {
	let i = _(n), o = v(i), s = [];
	if (o.width <= 0 || o.height <= 0) return {
		ok: !1,
		profile: i,
		contentBox: o,
		diagnostics: [{
			level: "error",
			code: "invalid-content-box",
			message: "Header, footer, and margins leave no room for the chart."
		}]
	};
	let c = i.layout.nodeOverrides || {}, l = (e || []).map((e) => {
		let t = m(e, c);
		return {
			...e,
			width: t.width,
			height: t.height
		};
	});
	if (!l.length) return {
		ok: !1,
		profile: i,
		contentBox: o,
		diagnostics: [{
			level: "error",
			code: "empty-chart",
			message: "Add at least one chart entry before exporting."
		}]
	};
	let u = a[i.layoutFamily], d = i.layout.options || {}, f = i.layoutFamily === "custom" ? {
		...u,
		...d
	} : u, p = t(l, f), h = i.layout.nodeOffsets || {}, g = r(p.positioned, h, 0), b = Math.min(o.width / g.w, o.height / g.h), x = 4.2 * b;
	!Number.isFinite(b) || b <= 0 ? s.push({
		level: "error",
		code: "invalid-layout",
		message: "The chart layout could not be measured."
	}) : x < i.minFontMm && s.push({
		level: "error",
		code: "text-too-small",
		message: `The fitted text would be about ${x.toFixed(1)} mm high, below the ${i.minFontMm.toFixed(1)} mm minimum. Increase the canvas, choose another layout, or reduce entries.`
	});
	let S = y(p.positioned, h);
	S && s.push({
		level: "error",
		code: "node-overlap",
		message: `${S} chart card overlap${S === 1 ? "s" : ""} must be resolved before export.`
	}), b > 2.5 && s.push({
		level: "warning",
		code: "sparse-chart",
		message: "The chart occupies a small part of this canvas; review the preview before publishing."
	}), b < .7 && !s.some((e) => e.code === "text-too-small") && s.push({
		level: "warning",
		code: "dense-chart",
		message: "The chart is densely packed. Inspect names and positions at 100% before publishing."
	});
	let C = o.x + (o.width - g.w * b) / 2 - g.x * b, w = o.y + (o.height - g.h * b) / 2 - g.y * b;
	return {
		ok: !s.some((e) => e.level === "error"),
		profile: i,
		contentBox: o,
		positioned: p.positioned,
		posById: p.posById,
		cfg: p.cfg,
		offsets: h,
		edgeWaypoints: i.layout.edgeWaypoints || {},
		edgeAnchors: i.layout.edgeAnchors || {},
		edgeStyles: i.layout.edgeStyles || {},
		bounds: g,
		transform: {
			scale: b,
			x: C,
			y: w
		},
		effectiveFontMm: x,
		diagnostics: s
	};
}
function x(e, t) {
	let n = String(e || "").trim().split(/\s+/).filter(Boolean), r = [], i = "";
	for (let e of n) {
		let n = i ? `${i} ${e}` : e;
		i && n.length > t ? (r.push(i), i = e) : i = n;
	}
	return i && r.push(i), r.slice(0, 4);
}
function S(e, t, n, r, i, a, o) {
	return e.map((e, s) => `<text x="${t}" y="${n + s * i}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${r}" font-weight="${a}" fill="${o}">${f(e)}</text>`).join("");
}
function C(t, n, r) {
	let i = t.node, a = e(t, n.offsets), o = a.x - i.width / 2, s = a.y - i.height / 2, c = p(i), l = r.photoDataByUrl || {}, u = i.data?.photo_url, d = l[u] || (r.allowRemotePhotos ? u : null), m = i.personName || i.data?.name || "", h = i.label || "";
	if (c === "level") {
		let e = x(h.toUpperCase(), Math.max(12, Math.floor(i.width / 4.2))), t = Math.min(8, i.height / (e.length + 1)), n = s + i.height / 2 - (e.length - 1) * t * 1.15 / 2 + t * .35;
		return `<g data-node-id="${f(i.id)}"><rect x="${o}" y="${s}" width="${i.width}" height="${i.height}" rx="3" fill="#0a5b5e" stroke="#073b3d" stroke-width="0.8"/>${S(e, a.x, n, t, t * 1.15, 700, "#ffffff")}</g>`;
	}
	let g = c === "head" ? "#d8aa35" : "#0a5b5e", _ = Math.min(i.height - 10, c === "head" ? 42 : 32), v = o + 5, y = s + (i.height - _) / 2, b = o + _ + 8 + (i.width - _ - 13) / 2, C = Math.max(10, Math.floor((i.width - _ - 16) / 3.7)), w = x(m || (i.status === "VACANT" ? "VACANT" : "—"), C), T = x(h, C), E = c === "head" ? 6.5 : 5.7, D = c === "head" ? 5.2 : 4.7, O = w.length * E * 1.15 + T.length * D * 1.15, k = s + (i.height - O) / 2 + E * .8, A = `<rect x="${o}" y="${s}" width="${i.width}" height="${i.height}" rx="3" fill="#ffffff" stroke="${g}" stroke-width="${c === "head" ? 1.4 : .8}"/>`;
	return A += `<rect x="${o}" y="${s}" width="3.5" height="${i.height}" rx="1.7" fill="${g}"/>`, A += d ? `<image href="${f(d)}" x="${v}" y="${y}" width="${_}" height="${_}" preserveAspectRatio="xMidYMid slice"/>` : `<circle cx="${v + _ / 2}" cy="${y + _ / 2}" r="${_ / 2}" fill="#e7eeec"/><text x="${v + _ / 2}" y="${y + _ * .68}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${_ * .5}" fill="#7b918d">●</text>`, A += S(w, b, k, E, E * 1.15, 700, "#173334"), k += w.length * E * 1.15, A += S(T, b, k, D, D * 1.15, 400, "#455b59"), `<g data-node-id="${f(i.id)}">${A}</g>`;
}
function w(e, t = {}) {
	if (!e?.positioned) throw Error("A completed print layout is required.");
	let r = [];
	for (let t of e.positioned) {
		if (!t.parentId) continue;
		let i = e.posById[t.parentId];
		if (!i) continue;
		let a = n(i, t, e.cfg, e.offsets, e.edgeWaypoints, e.edgeAnchors[t.node.id]), o = e.edgeStyles[t.node.id] || {}, s = o.pattern === "dashed" ? " stroke-dasharray=\"5 4\"" : "";
		r.push(`<path d="${a}" fill="none" stroke="${f(o.color || "#476965")}" stroke-width="${d(u(o.widthMm, 1), .3, 5)}"${s}/>`);
	}
	let i = e.positioned.map((n) => C(n, e, t)).join(""), { x: a, y: o, scale: s } = e.transform;
	return `<g data-print-chart transform="translate(${a} ${o}) scale(${s})">${r.join("")}${i}</g>`;
}
function T(e, t = {}) {
	let { widthMm: n, heightMm: r } = e.profile, i = t.background || "transparent";
	return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${n}mm" height="${r}mm" viewBox="0 0 ${n} ${r}" role="img" aria-label="${f(t.ariaLabel || "Organizational chart")}"><rect width="${n}" height="${r}" fill="${f(i)}"/>${w(e, t)}</svg>`;
}
async function E(e, t = {}) {
	if (!e || String(e.tagName).toLowerCase() !== "svg") throw Error("An SVG element is required.");
	let n = u(t.widthMm, 0), r = u(t.heightMm, 0);
	if (n <= 0 || r <= 0) throw Error("PDF width and height are required.");
	let [{ jsPDF: i }, { svg2pdf: a }] = await Promise.all([import("./jspdf.es.min-Ce93Cekf.js"), import("./svg2pdf.es.min-BoEOYI8g.js")]), o = new i({
		orientation: n > r ? "landscape" : "portrait",
		unit: "mm",
		format: [n, r],
		compress: !0,
		putOnlyUsedFonts: !0
	});
	return await a(e, o, {
		xOffset: 0,
		yOffset: 0,
		scale: 1
	}), o.output("blob");
}
//#endregion
export { i as PRINT_LAYOUT_FAMILIES, b as layoutPrintChart, _ as normalizePrintProfile, g as recommendPrintLayout, w as renderPrintChartFragment, T as renderPrintChartSvg, E as svgElementToPdfBlob };
