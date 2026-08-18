import { a as e, t } from "./bounds-Bzdsw6ck.js";
//#region src/core/search.js
function n(e, t) {
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
function r(e, t, n, r) {
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
var i = "\"Segoe UI\", system-ui, -apple-system, Arial, sans-serif", a = {
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
function o(e) {
	return String(e).replace(/[&<>"']/g, (e) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&apos;"
	})[e]);
}
function s(e, t, n, r) {
	let i = String(e || "").split(/\s+/).filter(Boolean);
	if (!i.length) return [""];
	let a = [], o = i[0];
	for (let e = 1; e < i.length; e++) {
		let s = o + " " + i[e];
		r(s, t) <= n ? o = s : (a.push(o), o = i[e]);
	}
	return a.push(o), a;
}
function c(e, t, n, r, a, s, c) {
	return `<text x="${e.toFixed(1)}" y="${t.toFixed(1)}" font-family='${i}' font-size="${n.toFixed(2)}" font-weight="${r}" fill="${a}" text-anchor="middle"${c ? ` letter-spacing="${c}"` : ""}>${o(s)}</text>`;
}
function l(e, t, n, r, i) {
	return `M${e},${t + i} Q${e},${t} ${e + i},${t} H${e + n - i} Q${e + n},${t} ${e + n},${t + i} V${t + r} H${e} V${t + i} Z`;
}
function u(e, t, n, r, a) {
	let o = e.width, l = e.height, u = 13.5 * r, d = o - 36, f = s((e.label || "").toUpperCase(), `600 ${u}px ${i}`, d, a), p = u * 1.2, m = t + 10 + d / 2, h = n + l / 2 - f.length * p / 2 + u * .78, g = `<rect x="${t}" y="${n}" width="${o}" height="${l}" rx="8" fill="url(#loc-teal)"/>`;
	for (let e of f) g += c(m, h, u, 600, "#ffffff", e, "0.4"), h += p;
	return g;
}
function d(e, t, n, r, u, d, f) {
	f ||= {};
	let p = e.width, m = e.height, h = t + p / 2, g = p - 16, _ = Math.max(20, Math.min(f.photoH || 62, m - 20)), v = `<rect x="${t}" y="${n}" width="${p}" height="${m}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
	v += `<path d="${l(t, n, p, _, 8)}" fill="#e8edf4"/>`, v += `<line x1="${t}" y1="${n + _}" x2="${t + p}" y2="${n + _}" stroke="#d0d5dd"/>`;
	let y = e.data && e.data.photo_url, b = (y && f.images ? f.images[y] : null) || (y && !u ? y : null);
	if (b) {
		let e = f.contain ? "xMidYMid meet" : "xMidYMid slice";
		v += `<image x="${t}" y="${n}" width="${p}" height="${_}" href="${o(b)}" preserveAspectRatio="${e}"/>`;
	} else v += `<text x="${h.toFixed(1)}" y="${(n + _ / 2 + 10).toFixed(1)}" font-family='${i}' font-size="30" fill="#9ca3af" text-anchor="middle">●</text>`;
	let x = n + _, S = m - _, C = 13.5 * r, w = 12 * r, T = C * 1.15, E = w * 1.15, D = s((e.personName || "—").toUpperCase(), `700 ${C}px ${i}`, g, d), O = s(e.label || "", `${w}px ${i}`, g, d), k = e.status ? 15 : 0, A = e.status ? 5 : 0, j = D.length * T + O.length * E + A + k, M = x + S / 2 - j / 2 + C * .8, N = "";
	for (let e of D) N += c(h, M, C, 700, "#1a1a2e", e), M += T;
	for (let e of O) N += c(h, M, w, 400, "#4a5568", e), M += E;
	if (e.status) {
		let t = a[e.status] || {
			bg: "#eee",
			fg: "#333"
		}, n = d(e.status, `700 10px ${i}`) + 16, r = h - n / 2, s = M - C * .8 + A;
		N += `<rect x="${r.toFixed(1)}" y="${s.toFixed(1)}" width="${n.toFixed(1)}" height="${k}" rx="7.5" fill="${t.bg}"/>`, N += `<text x="${h.toFixed(1)}" y="${(s + 11).toFixed(1)}" font-family='${i}' font-size="10" font-weight="700" fill="${t.fg}" text-anchor="middle" letter-spacing="0.4">${o(e.status)}</text>`;
	}
	return v + N;
}
function f(n, r, i = {}) {
	let a = i.manualOffsets || {}, o = !!i.raster, s = i.measureText || (() => 0), c = i.fitOf || (() => 1), l = {
		photoH: i.photoHeight || 62,
		images: i.images || null,
		contain: i.photoContain !== !1
	}, f = t(n, a, 40), p = "";
	for (let e of r) e && (p += `<path d="${e}" fill="none" stroke="#4a5568" stroke-width="2"/>`);
	let m = "";
	for (let t of n) {
		let n = t.node, r = e(t, a), i = r.x - n.width / 2 - f.x, p = r.y - n.height / 2 - f.y;
		m += n.type === "department" ? u(n, i, p, c(n), s) : d(n, i, p, c(n), o, s, l);
	}
	let h = f.w.toFixed(0), g = f.h.toFixed(0);
	return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${h}" height="${g}" viewBox="0 0 ${h} ${g}"><defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#2a9d8f"/></linearGradient></defs><rect x="0" y="0" width="${h}" height="${g}" fill="#ffffff"/><g transform="translate(${(-f.x).toFixed(1)},${(-f.y).toFixed(1)})">${p}</g>` + m + "</svg>";
}
//#endregion
//#region src/core/theme.js
var p = {
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
};
function m(e = {}) {
	let t = Object.assign({}, p, e);
	return t.themeRules = Array.isArray(e.themeRules) ? e.themeRules.map(h) : [], t;
}
function h(e = {}) {
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
function g(e, t) {
	if (t) return t.indexOf("data.") === 0 ? e.data ? e.data[t.slice(5)] : void 0 : t === "type" || t === "status" || t === "id" || t === "label" || t === "personName" ? e[t] : e.data ? e.data[t] : void 0;
}
function _(e, t) {
	if (!t || !t.length) return null;
	let n = null;
	for (let r of t) {
		if (r.enabled === !1) continue;
		let t = g(e, r.field);
		t != null && String(t).toLowerCase() === String(r.value).toLowerCase() && (n ||= {}, r.style.bg && (n.bg = r.style.bg), r.style.text && (n.text = r.style.text), r.style.border && (n.border = r.style.border));
	}
	return n;
}
//#endregion
export { f as a, _ as i, h as n, r as o, m as r, n as s, p as t };
