import { o as e, t, v as n } from "./bounds-CAhLOk4F.js";
//#region src/core/search.js
function r(e, t) {
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
function i(e, t, n, r) {
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
var a = "\"Segoe UI\", system-ui, -apple-system, Arial, sans-serif", o = {
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
function s(e) {
	return String(e).replace(/[&<>"']/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&apos;"
	})[e]);
}
function c(e, t, n, r) {
	let i = String(e || "").split(/\s+/).filter(Boolean);
	if (!i.length) return [""];
	let a = [], o = i[0];
	for (let e = 1; e < i.length; e++) {
		let s = o + " " + i[e];
		r(s, t) <= n ? o = s : (a.push(o), o = i[e]);
	}
	return a.push(o), a;
}
function l(e, t, n, r, i, o, c) {
	return `<text x="${e.toFixed(1)}" y="${t.toFixed(1)}" font-family='${a}' font-size="${n.toFixed(2)}" font-weight="${r}" fill="${i}" text-anchor="middle"${c ? ` letter-spacing="${c}"` : ""}>${s(o)}</text>`;
}
function u(e, t, n, r, i) {
	return `M${e},${t + i} Q${e},${t} ${e + i},${t} H${e + n - i} Q${e + n},${t} ${e + n},${t + i} V${t + r} H${e} V${t + i} Z`;
}
function d(e, t, n, r, i) {
	let o = e.width, s = e.height, u = 13.5 * r, d = o - 36, f = c((e.label || "").toUpperCase(), `600 ${u}px ${a}`, d, i), p = u * 1.2, m = t + 10 + d / 2, h = n + s / 2 - f.length * p / 2 + u * .78, g = `<rect x="${t}" y="${n}" width="${o}" height="${s}" rx="8" fill="url(#loc-teal)"/>`;
	for (let e of f) g += l(m, h, u, 600, "#ffffff", e, "0.4"), h += p;
	return g;
}
function f(e, t, n, r, i, d, f) {
	f ||= {};
	let p = e.width, m = e.height, h = t + p / 2, g = p - 16, _ = Math.max(20, Math.min(f.photoH || 62, m - 20)), v = `<rect x="${t}" y="${n}" width="${p}" height="${m}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
	v += `<path d="${u(t, n, p, _, 8)}" fill="#e8edf4"/>`, v += `<line x1="${t}" y1="${n + _}" x2="${t + p}" y2="${n + _}" stroke="#d0d5dd"/>`;
	let y = e.data && e.data.photo_url, b = (y && f.images ? f.images[y] : null) || (y && !i ? y : null);
	if (b) {
		let e = f.contain ? "xMidYMid meet" : "xMidYMid slice";
		v += `<image x="${t}" y="${n}" width="${p}" height="${_}" href="${s(b)}" preserveAspectRatio="${e}"/>`;
	} else v += `<text x="${h.toFixed(1)}" y="${(n + _ / 2 + 10).toFixed(1)}" font-family='${a}' font-size="30" fill="#9ca3af" text-anchor="middle">●</text>`;
	let x = n + _, S = m - _, C = 13.5 * r, w = 12 * r, T = C * 1.15, E = w * 1.15, D = c((e.personName || "—").toUpperCase(), `700 ${C}px ${a}`, g, d), O = c(e.label || "", `${w}px ${a}`, g, d), k = e.status ? 15 : 0, A = e.status ? 5 : 0, j = D.length * T + O.length * E + A + k, M = x + S / 2 - j / 2 + C * .8, N = "";
	for (let e of D) N += l(h, M, C, 700, "#1a1a2e", e), M += T;
	for (let e of O) N += l(h, M, w, 400, "#4a5568", e), M += E;
	if (e.status) {
		let t = o[e.status] || {
			bg: "#eee",
			fg: "#333"
		}, n = d(e.status, `700 10px ${a}`) + 16, r = h - n / 2, i = M - C * .8 + A;
		N += `<rect x="${r.toFixed(1)}" y="${i.toFixed(1)}" width="${n.toFixed(1)}" height="${k}" rx="7.5" fill="${t.bg}"/>`, N += `<text x="${h.toFixed(1)}" y="${(i + 11).toFixed(1)}" font-family='${a}' font-size="10" font-weight="700" fill="${t.fg}" text-anchor="middle" letter-spacing="0.4">${s(e.status)}</text>`;
	}
	return v + N;
}
function p(r, i, a = {}) {
	let o = a.manualOffsets || {}, s = !!a.raster, c = a.measureText || (() => 0), l = a.fitOf || (() => 1), u = {
		photoH: a.photoHeight || 62,
		images: a.images || null,
		contain: a.photoContain !== !1
	}, p = a.bounds || t(r, o, 40), m = "", h = n(i, a.familyNetworks || [], { rebuildFamilyIds: a.rebuildFamilyIds || [] });
	for (let e of h.segments) m += `<path d="${e.d}" fill="none" stroke="#4a5568" stroke-width="2"/>`;
	let g = "";
	for (let t of r) {
		let n = t.node, r = e(t, o), i = r.x - n.width / 2 - p.x, a = r.y - n.height / 2 - p.y;
		g += n.type === "department" ? d(n, i, a, l(n), c) : f(n, i, a, l(n), s, c, u);
	}
	let _ = p.w.toFixed(0), v = p.h.toFixed(0);
	return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${_}" height="${v}" viewBox="0 0 ${_} ${v}"><defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#2a9d8f"/></linearGradient></defs><rect x="0" y="0" width="${_}" height="${v}" fill="#ffffff"/><g transform="translate(${(-p.x).toFixed(1)},${(-p.y).toFixed(1)})">${m}</g>` + g + "</svg>";
}
//#endregion
//#region src/core/theme.js
var m = {
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
function h(e = {}) {
	let t = Object.assign({}, m, e);
	return t.themeRules = Array.isArray(e.themeRules) ? e.themeRules.map(g) : [], t;
}
function g(e = {}) {
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
function _(e, t) {
	if (t) return t.indexOf("data.") === 0 ? e.data ? e.data[t.slice(5)] : void 0 : t === "type" || t === "status" || t === "id" || t === "label" || t === "personName" ? e[t] : e.data ? e.data[t] : void 0;
}
function v(e, t) {
	if (!t || !t.length) return null;
	let n = null;
	for (let r of t) {
		if (r.enabled === !1) continue;
		let t = _(e, r.field);
		t != null && String(t).toLowerCase() === String(r.value).toLowerCase() && (n ||= {}, r.style.bg && (n.bg = r.style.bg), r.style.text && (n.text = r.style.text), r.style.border && (n.border = r.style.border));
	}
	return n;
}
//#endregion
export { p as a, v as i, g as n, i as o, h as r, r as s, m as t };
