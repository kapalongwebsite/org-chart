import { L as e, R as t, V as n, o as r, t as i, v as a } from "./bounds-PDieHcY6.js";
//#region src/core/search.js
function o(e, t) {
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
//#endregion
//#region src/core/exportLayout.js
function s(e, t, n, r) {
	return {
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
//#endregion
//#region src/core/svgExport.js
var c = "\"Segoe UI\", system-ui, -apple-system, Arial, sans-serif", l = {
	FILLED: {
		bg: "#e6f4ea",
		fg: "#137a3e"
	},
	VACANT: {
		bg: "#fdf0e6",
		fg: "#b25a14"
	},
	UNFUNDED: {
		bg: "#fbe7e7",
		fg: "#b42318"
	}
};
function u(e) {
	return String(e).replace(/[&<>"']/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&apos;"
	})[e]);
}
function d(e, t, n, r) {
	let i = String(e || "").split(/\s+/).filter(Boolean);
	if (!i.length) return [""];
	let a = [], o = i[0];
	for (let e = 1; e < i.length; e++) {
		let s = o + " " + i[e];
		r(s, t) <= n ? o = s : (a.push(o), o = i[e]);
	}
	return a.push(o), a;
}
function f(e, t, n, r, i, a, o) {
	return `<text x="${e.toFixed(1)}" y="${t.toFixed(1)}" font-family='${c}' font-size="${n.toFixed(2)}" font-weight="${r}" fill="${i}" text-anchor="middle"${o ? ` letter-spacing="${o}"` : ""}>${u(a)}</text>`;
}
function p(e, t, n, r, i) {
	return `M${e},${t + i} Q${e},${t} ${e + i},${t} H${e + n - i} Q${e + n},${t} ${e + n},${t + i} V${t + r} H${e} V${t + i} Z`;
}
function m(e, t, n, r, i) {
	let a = e.width, o = e.height, s = 13.5 * r, l = a - 36, u = d((e.label || "").toUpperCase(), `600 ${s}px ${c}`, l, i), p = s * 1.2, m = t + 10 + l / 2, h = n + o / 2 - u.length * p / 2 + s * .78, g = `<rect x="${t}" y="${n}" width="${a}" height="${o}" rx="8" fill="url(#loc-teal)"/>`;
	for (let e of u) g += f(m, h, s, 600, "#ffffff", e, "0.4"), h += p;
	return g;
}
function h(r, i, a, o, s, m, h, g) {
	h ||= {};
	let _ = r.width, v = r.height, y = i + _ / 2, b = _ - 16, x = Math.max(20, Math.min(h.photoH || e.height - 140, v - 20)), S = `<rect x="${i}" y="${a}" width="${_}" height="${v}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
	S += `<path d="${p(i, a, _, x, 8)}" fill="${u(h.photoBackground || "#004264")}"/>`;
	let C = r.data && r.data.photo_url, w = (C && h.images ? h.images[C] : null) || (C && !s ? C : null);
	if (w) {
		let e = h.contain ? "xMidYMid meet" : "xMidYMid slice", r = Math.max(1, h.frameWidth || n.width), o = Math.max(1, h.frameHeight || n.height), s = _ * (Math.max(1, h.imageWidth || t.width) / r), c = x * (Math.max(1, h.imageHeight || t.height) / o), l = i + (_ - s) / 2 + (h.offsetX || 0) * _ / r, d = a + (x - c) / 2 + (h.offsetY || 0) * x / o, f = `loc-photo-clip-${g}`;
		S += `<defs><clipPath id="${f}"><path d="${p(i, a, _, x, 8)}"/></clipPath></defs>`, S += `<image x="${l.toFixed(2)}" y="${d.toFixed(2)}" width="${s.toFixed(2)}" height="${c.toFixed(2)}" href="${u(w)}" preserveAspectRatio="${e}" clip-path="url(#${f})"/>`;
	} else S += `<text x="${y.toFixed(1)}" y="${(a + x / 2 + 10).toFixed(1)}" font-family='${c}' font-size="30" fill="#ffffff" fill-opacity="0.72" text-anchor="middle">●</text>`;
	S += `<line x1="${i}" y1="${a + x}" x2="${i + _}" y2="${a + x}" stroke="#d0d5dd"/>`;
	let T = a + x, E = v - x, D = 13.5 * o, O = 12 * o, k = D * 1.15, A = O * 1.15, j = d((r.personName || "—").toUpperCase(), `700 ${D}px ${c}`, b, m), M = d(r.label || "", `${O}px ${c}`, b, m), N = r.status ? 15 : 0, P = r.status ? 5 : 0, F = j.length * k + M.length * A + P + N, I = T + E / 2 - F / 2 + D * .8, L = "";
	for (let e of j) L += f(y, I, D, 700, "#1a1a2e", e), I += k;
	for (let e of M) L += f(y, I, O, 400, "#4a5568", e), I += A;
	if (r.status) {
		let e = l[r.status] || {
			bg: "#eee",
			fg: "#333"
		}, t = m(r.status, `700 10px ${c}`) + 16, n = y - t / 2, i = I - D * .8 + P;
		L += `<rect x="${n.toFixed(1)}" y="${i.toFixed(1)}" width="${t.toFixed(1)}" height="${N}" rx="7.5" fill="${e.bg}"/>`, L += `<text x="${y.toFixed(1)}" y="${(i + 11).toFixed(1)}" font-family='${c}' font-size="10" font-weight="700" fill="${e.fg}" text-anchor="middle" letter-spacing="0.4">${u(r.status)}</text>`;
	}
	return S + L;
}
function g(o, s, c = {}) {
	let l = c.manualOffsets || {}, u = !!c.raster, d = c.measureText || (() => 0), f = c.fitOf || (() => 1), p = c.virtualPhotoFrame || {}, g = c.renderedImage || {}, _ = {
		photoH: c.photoHeight || e.height - 140,
		images: c.images || null,
		contain: c.photoContain == null ? g.fit !== "cover" : c.photoContain !== !1,
		frameWidth: +p.width || n.width,
		frameHeight: +p.height || n.height,
		imageWidth: +g.width || t.width,
		imageHeight: +g.height || t.height,
		offsetX: Number.isFinite(+g.offsetX) ? +g.offsetX : t.offsetX,
		offsetY: Number.isFinite(+g.offsetY) ? +g.offsetY : t.offsetY,
		photoBackground: c.photoBackground || "#004264"
	}, v = c.bounds || i(o, l, 40), y = "", b = a(s, c.familyNetworks || [], { rebuildFamilyIds: c.rebuildFamilyIds || [] });
	for (let e of b.segments) y += `<path d="${e.d}" fill="none" stroke="#4a5568" stroke-width="2"/>`;
	let x = "", S = 0;
	for (let e of o) {
		let t = e.node, n = r(e, l), i = n.x - t.width / 2 - v.x, a = n.y - t.height / 2 - v.y;
		x += t.type === "department" ? m(t, i, a, f(t), d) : h(t, i, a, f(t), u, d, _, S++);
	}
	let C = v.w.toFixed(0), w = v.h.toFixed(0);
	return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${C}" height="${w}" viewBox="0 0 ${C} ${w}"><defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#2a9d8f"/></linearGradient></defs><rect x="0" y="0" width="${C}" height="${w}" fill="#ffffff"/><g transform="translate(${(-v.x).toFixed(1)},${(-v.y).toFixed(1)})">${y}</g>` + x + "</svg>";
}
//#endregion
//#region src/core/theme.js
var _ = {
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
function v(e = {}) {
	let t = Object.assign({}, _, e);
	return t.themeRules = Array.isArray(e.themeRules) ? e.themeRules.map(y) : [], t;
}
function y(e = {}) {
	return {
		enabled: e.enabled !== !1,
		field: e.field || "type",
		value: e.value == null ? "" : String(e.value),
		style: {
			bg: e.style && e.style.bg || "",
			text: e.style && e.style.text || "",
			border: e.style && e.style.border || ""
		}
	};
}
function b(e, t) {
	if (t) return t.indexOf("data.") === 0 ? e.data ? e.data[t.slice(5)] : void 0 : t === "type" || t === "status" || t === "id" || t === "label" || t === "personName" ? e[t] : e.data ? e.data[t] : void 0;
}
function x(e, t) {
	if (!t || !t.length) return null;
	let n = null;
	for (let r of t) {
		if (r.enabled === !1) continue;
		let t = b(e, r.field);
		t != null && String(t).toLowerCase() === String(r.value).toLowerCase() && (n ||= {}, r.style.bg && (n.bg = r.style.bg), r.style.text && (n.text = r.style.text), r.style.border && (n.border = r.style.border));
	}
	return n;
}
//#endregion
export { g as a, x as i, y as n, s as o, v as r, o as s, _ as t };
