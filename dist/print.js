import { c as e, f as t, o as n, t as r, v as i } from "./bounds-CAhLOk4F.js";
//#region src/print/index.js
var a = Object.freeze([
	"portrait-sectioned",
	"wide-row",
	"portrait-spine",
	"custom"
]), o = Object.freeze({
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
}), s = Object.freeze({
	width: 82,
	height: 58
}), c = Object.freeze({
	width: 100,
	height: 30
}), l = Object.freeze({
	width: 96,
	height: 70
}), u = 3.2;
function d(e, t) {
	let n = Number(e);
	return Number.isFinite(n) ? n : t;
}
function f(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function p(e) {
	return String(e ?? "").replace(/[&<>"']/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&apos;"
	})[e]);
}
function m(e) {
	return e?.data?.printRole ? e.data.printRole : e?.data?.is_head || e?.data?.isHead ? "head" : e?.type === "department" ? "level" : "person";
}
function h(e, t = {}) {
	let n = m(e), r = n === "head" ? l : n === "level" ? c : s, i = t[e.id] || {};
	return {
		width: f(d(i.widthMm, r.width), 30, 300),
		height: f(d(i.heightMm, r.height), 16, 220)
	};
}
function g(e) {
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
function _(e, t) {
	let n = d(t?.widthMm, 0), r = d(t?.heightMm, 0);
	if (n <= 0 || r <= 0) throw Error("Physical canvas dimensions are required.");
	let i = g(e), a = n / r, o, s = [];
	return a >= 1.3 ? (o = "wide-row", s.push("The selected canvas is landscape or unusually wide.")) : i.maxDepth >= 4 || i.count >= 18 && i.maxChildren <= 5 ? (o = "portrait-spine", s.push("The chart is deep enough to benefit from a vertical spine.")) : (o = "portrait-sectioned", s.push("The canvas is portrait and the chart has a compact hierarchy.")), i.maxChildren >= 7 && o !== "wide-row" && s.push("A wide sibling group may need a larger canvas or a manual override."), {
		family: o,
		reasons: s,
		stats: i,
		canvasAspect: a
	};
}
function v(e = {}) {
	let t = d(e.widthMm, 0), n = d(e.heightMm, 0);
	if (t < 200 || t > 1e4 || n < 200 || n > 1e4) throw Error("Print width and height must be between 200 mm and 10,000 mm.");
	let r = a.includes(e.layoutFamily) ? e.layoutFamily : "portrait-sectioned", i = f(d(e.safeMarginMm, 25), 0, Math.min(t, n) / 4), o = f(d(e.headerHeightMm, n * .14), 0, n / 3), s = f(d(e.footerHeightMm, n * .06), 0, n / 4);
	return {
		schemaVersion: 1,
		templateId: String(e.templateId || "municipal-classic"),
		templateVersion: Math.max(1, Math.trunc(d(e.templateVersion, 1))),
		widthMm: t,
		heightMm: n,
		safeMarginMm: i,
		headerHeightMm: o,
		footerHeightMm: s,
		preferredUnit: [
			"mm",
			"cm",
			"in",
			"ft"
		].includes(e.preferredUnit) ? e.preferredUnit : "mm",
		dpi: f(Math.trunc(d(e.dpi, 150)), 72, 600),
		minFontMm: f(d(e.minFontMm, u), 2.5, 8),
		layoutFamily: r,
		layout: e.layout && typeof e.layout == "object" ? e.layout : {}
	};
}
function y(e) {
	return {
		x: e.safeMarginMm,
		y: e.safeMarginMm + e.headerHeightMm,
		width: e.widthMm - e.safeMarginMm * 2,
		height: e.heightMm - e.safeMarginMm * 2 - e.headerHeightMm - e.footerHeightMm
	};
}
function b(e, t) {
	let r = 0;
	for (let i = 0; i < e.length; i += 1) {
		let a = e[i], o = n(a, t);
		for (let s = i + 1; s < e.length; s += 1) {
			let i = e[s], c = n(i, t);
			Math.abs(o.x - c.x) * 2 < a.node.width + i.node.width && Math.abs(o.y - c.y) * 2 < a.node.height + i.node.height && (r += 1);
		}
	}
	return r;
}
function x(e, n) {
	let i = v(n), a = y(i), s = [];
	if (a.width <= 0 || a.height <= 0) return {
		ok: !1,
		profile: i,
		contentBox: a,
		diagnostics: [{
			level: "error",
			code: "invalid-content-box",
			message: "Header, footer, and margins leave no room for the chart."
		}]
	};
	let c = i.layout.nodeOverrides || {}, l = (e || []).map((e) => {
		let t = h(e, c);
		return {
			...e,
			width: t.width,
			height: t.height
		};
	});
	if (!l.length) return {
		ok: !1,
		profile: i,
		contentBox: a,
		diagnostics: [{
			level: "error",
			code: "empty-chart",
			message: "Add at least one chart entry before exporting."
		}]
	};
	let u = o[i.layoutFamily], d = i.layout.options || {}, f = {
		...i.layoutFamily === "custom" ? {
			...u,
			...d
		} : u,
		targetSize: {
			width: a.width,
			height: a.height
		}
	}, p = t(l, f), m = i.layout.nodeOffsets || {}, g = Object.keys(m).length ? r(p.positioned, m, 0) : p.framingBounds || r(p.positioned, m, 0), _ = Math.min(a.width / g.w, a.height / g.h), x = 4.2 * _;
	!Number.isFinite(_) || _ <= 0 ? s.push({
		level: "error",
		code: "invalid-layout",
		message: "The chart layout could not be measured."
	}) : x < i.minFontMm && s.push({
		level: "error",
		code: "text-too-small",
		message: `The fitted text would be about ${x.toFixed(1)} mm high, below the ${i.minFontMm.toFixed(1)} mm minimum. Increase the canvas, choose another layout, or reduce entries.`
	});
	let S = b(p.positioned, m);
	S && s.push({
		level: "error",
		code: "node-overlap",
		message: `${S} chart card overlap${S === 1 ? "s" : ""} must be resolved before export.`
	}), _ > 2.5 && s.push({
		level: "warning",
		code: "sparse-chart",
		message: "The chart occupies a small part of this canvas; review the preview before publishing."
	}), _ < .7 && !s.some((e) => e.code === "text-too-small") && s.push({
		level: "warning",
		code: "dense-chart",
		message: "The chart is densely packed. Inspect names and positions at 100% before publishing."
	});
	let C = a.x + (a.width - g.w * _) / 2 - g.x * _, w = a.y + (a.height - g.h * _) / 2 - g.y * _;
	return {
		ok: !s.some((e) => e.level === "error"),
		profile: i,
		contentBox: a,
		positioned: p.positioned,
		posById: p.posById,
		cfg: p.cfg,
		familyNetworks: p.familyNetworks || [],
		offsets: m,
		edgeWaypoints: i.layout.edgeWaypoints || {},
		edgeAnchors: i.layout.edgeAnchors || {},
		edgeStyles: i.layout.edgeStyles || {},
		bounds: g,
		transform: {
			scale: _,
			x: C,
			y: w
		},
		effectiveFontMm: x,
		diagnostics: s
	};
}
function S(e, t) {
	let n = String(e || "").trim().split(/\s+/).filter(Boolean), r = [], i = "";
	for (let e of n) {
		let n = i ? `${i} ${e}` : e;
		i && n.length > t ? (r.push(i), i = e) : i = n;
	}
	return i && r.push(i), r.slice(0, 4);
}
function C(e, t, n, r, i, a, o) {
	return e.map((e, s) => `<text x="${t}" y="${n + s * i}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${r}" font-weight="${a}" fill="${o}">${p(e)}</text>`).join("");
}
function w(e, t, r) {
	let i = e.node, a = n(e, t.offsets), o = a.x - i.width / 2, s = a.y - i.height / 2, c = m(i), l = r.photoDataByUrl || {}, u = i.data?.photo_url, d = l[u] || (r.allowRemotePhotos ? u : null), f = i.personName || i.data?.name || "", h = i.label || "";
	if (c === "level") {
		let e = S(h.toUpperCase(), Math.max(12, Math.floor(i.width / 4.2))), t = Math.min(8, i.height / (e.length + 1)), n = s + i.height / 2 - (e.length - 1) * t * 1.15 / 2 + t * .35;
		return `<g data-node-id="${p(i.id)}"><rect x="${o}" y="${s}" width="${i.width}" height="${i.height}" rx="3" fill="#0a5b5e" stroke="#073b3d" stroke-width="0.8"/>${C(e, a.x, n, t, t * 1.15, 700, "#ffffff")}</g>`;
	}
	let g = c === "head" ? "#d8aa35" : "#0a5b5e", _ = Math.min(i.height - 10, c === "head" ? 42 : 32), v = o + 5, y = s + (i.height - _) / 2, b = o + _ + 8 + (i.width - _ - 13) / 2, x = Math.max(10, Math.floor((i.width - _ - 16) / 3.7)), w = S(f || (i.status === "VACANT" ? "VACANT" : "—"), x), T = S(h, x), E = c === "head" ? 6.5 : 5.7, D = c === "head" ? 5.2 : 4.7, O = w.length * E * 1.15 + T.length * D * 1.15, k = s + (i.height - O) / 2 + E * .8, A = `<rect x="${o}" y="${s}" width="${i.width}" height="${i.height}" rx="3" fill="#ffffff" stroke="${g}" stroke-width="${c === "head" ? 1.4 : .8}"/>`;
	return A += `<rect x="${o}" y="${s}" width="3.5" height="${i.height}" rx="1.7" fill="${g}"/>`, A += d ? `<image href="${p(d)}" x="${v}" y="${y}" width="${_}" height="${_}" preserveAspectRatio="xMidYMid slice"/>` : `<circle cx="${v + _ / 2}" cy="${y + _ / 2}" r="${_ / 2}" fill="#e7eeec"/><text x="${v + _ / 2}" y="${y + _ * .68}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${_ * .5}" fill="#7b918d">●</text>`, A += C(w, b, k, E, E * 1.15, 700, "#173334"), k += w.length * E * 1.15, A += C(T, b, k, D, D * 1.15, 400, "#455b59"), `<g data-node-id="${p(i.id)}">${A}</g>`;
}
function T(t, n = {}) {
	if (!t?.positioned) throw Error("A completed print layout is required.");
	let r = [];
	for (let n of t.positioned) {
		if (!n.parentId) continue;
		let i = t.posById[n.parentId];
		if (!i) continue;
		let a = e(i, n, t.cfg, t.offsets, t.edgeWaypoints, t.edgeAnchors), o = t.edgeStyles[n.node.id] || {};
		r.push({
			id: n.node.id,
			d: a,
			style: {
				color: o.color || "#476965",
				widthMm: f(d(o.widthMm, 1), .3, 5),
				pattern: o.pattern === "dashed" ? "dashed" : "solid"
			}
		});
	}
	let a = {
		color: "#476965",
		widthMm: 1,
		pattern: "solid"
	}, o = /* @__PURE__ */ new Set(), s = (e) => {
		let n = t.offsets?.[e];
		return n && (Math.abs(d(n.dx, 0)) > .01 || Math.abs(d(n.dy, 0)) > .01);
	};
	for (let e of t.familyNetworks || []) (s(e.parentId) || e.childIds.some((e) => s(e) || t.edgeWaypoints?.[e] && t.edgeWaypoints[e].length || t.edgeAnchors?.[e])) && o.add(String(e.parentId));
	let c = i(r, t.familyNetworks || [], {
		sharedStyle: a,
		rebuildFamilyIds: o
	}).segments.map((e) => {
		let t = e.style || a, n = t.pattern === "dashed" ? " stroke-dasharray=\"5 4\"" : "";
		return `<path d="${e.d}" fill="none" stroke="${p(t.color)}" stroke-width="${t.widthMm}"${n}/>`;
	}), l = t.positioned.map((e) => w(e, t, n)).join(""), { x: u, y: m, scale: h } = t.transform;
	return `<g data-print-chart="true" transform="translate(${u} ${m}) scale(${h})">${c.join("")}${l}</g>`;
}
function E(e, t = {}) {
	let { widthMm: n, heightMm: r } = e.profile, i = t.background || "transparent";
	return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${n}mm" height="${r}mm" viewBox="0 0 ${n} ${r}" role="img" aria-label="${p(t.ariaLabel || "Organizational chart")}"><rect width="${n}" height="${r}" fill="${p(i)}"/>${T(e, t)}</svg>`;
}
async function D(e, t = {}) {
	if (!e || String(e.tagName).toLowerCase() !== "svg") throw Error("An SVG element is required.");
	let n = d(t.widthMm, 0), r = d(t.heightMm, 0);
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
export { a as PRINT_LAYOUT_FAMILIES, x as layoutPrintChart, v as normalizePrintProfile, _ as recommendPrintLayout, T as renderPrintChartFragment, E as renderPrintChartSvg, D as svgElementToPdfBlob };
