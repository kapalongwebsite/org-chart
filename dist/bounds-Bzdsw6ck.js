//#region src/core/constants.js
var e = "__virtual_root__", t = 26, n = 80, r = [
	"Balanced",
	"Center",
	"Left",
	"Right",
	"Alternate",
	"AlternateLeft",
	"AlternateRight",
	"Matrix"
], i = [
	"TopToBottom",
	"BottomToTop",
	"LeftToRight",
	"RightToLeft"
], a = {
	orientation: "TopToBottom",
	subtreeMode: "Balanced",
	spacingX: 40,
	spacingY: 70,
	gridSize: 22,
	alignGrid: !1
}, o = {
	width: 240,
	height: 70
}, s = {
	width: 196,
	height: 188
};
//#endregion
//#region src/core/tree.js
function c(e) {
	let t = Object.create(null);
	for (let n of e) t[n.id] = n;
	return t;
}
function l(t) {
	let n = Object.create(null);
	for (let e of t) n[e.id] = {
		node: e,
		children: []
	};
	let r = {
		node: {
			id: e,
			isVirtual: !0,
			width: 0,
			height: 0,
			type: "virtual",
			collapsed: !1,
			layoutMode: "Balanced"
		},
		children: []
	};
	for (let e of t) {
		let t = n[e.id], i = e.parentId;
		i && n[i] ? n[i].children.push(t) : r.children.push(t);
	}
	return r;
}
function u(e) {
	let t = {
		node: e.node,
		children: []
	};
	if (!e.node.collapsed) for (let n of e.children) t.children.push(u(n));
	return t;
}
function d(e) {
	let t = Object.create(null);
	return (function e(n, r) {
		n.node.isVirtual || (t[n.node.id] = r);
		let i = n.node.isVirtual ? 0 : r + 1;
		for (let t of n.children) e(t, i);
	})(e, 0), t;
}
function f(e, t) {
	let n = Object.create(null);
	function r(e) {
		if (e in n) return n[e];
		let i = t[e];
		return !i || !i.parentId ? n[e] = 0 : n[e] = r(i.parentId) + 1;
	}
	for (let t of e) r(t.id);
	return n;
}
function p(e, t) {
	let n = 0;
	for (let r of e) r.parentId === t && n++;
	return n;
}
//#endregion
//#region src/core/dataImport.js
function m(e) {
	return {
		id: e.id,
		parentId: e.parentId || "",
		type: e.type || "position",
		label: e.label || "",
		personName: e.personName || "",
		status: e.status || "",
		width: e.width || s.width,
		height: e.height || s.height,
		collapsed: !!e.collapsed,
		layoutMode: e.layoutMode || null,
		data: e.data || {}
	};
}
function h(e) {
	let t = [e.firstname, e.lastname].filter(Boolean).join(" ").trim();
	return e.status === "VACANT" ? "— VACANT —" : e.status === "UNFUNDED" ? t || "— UNFUNDED —" : t || "—";
}
function g(e) {
	let t = [];
	function n(e, r) {
		let i = "org-" + (e.org_id == null ? e.id : e.org_id);
		t.push({
			id: i,
			parentId: r,
			type: "department",
			label: e.name || e.label || "UNIT",
			width: o.width,
			height: o.height,
			data: { level: e.level }
		});
		let a = (e.positions || []).slice().sort((e, t) => (e.org_order || 0) - (t.org_order || 0));
		for (let e of a) t.push({
			id: "pos-" + e.id,
			parentId: i,
			type: "position",
			label: e.position_title || "POSITION",
			personName: h(e),
			status: e.status || "",
			width: s.width,
			height: s.height,
			data: { photo_url: e.photo_url || e.photo || null }
		});
		let c = (e.children || []).slice().sort((e, t) => (e.sort_order || 0) - (t.sort_order || 0));
		for (let e of c) n(e, i);
	}
	for (let t of e) n(t, "");
	return t;
}
function _(e) {
	let t = [], n = 0;
	function r(e, i) {
		let a = "mo-" + n++;
		if (e.type === "organization") t.push({
			id: a,
			parentId: i,
			type: "department",
			label: e.name || "UNIT",
			width: o.width,
			height: o.height,
			data: {
				level: e.meta && e.meta.level,
				srcId: e.id
			}
		});
		else {
			let n = e.type === "vacant";
			t.push({
				id: a,
				parentId: i,
				type: "position",
				label: e.position || "POSITION",
				personName: n ? "— VACANT —" : e.name || "—",
				status: n ? "VACANT" : "FILLED",
				width: s.width,
				height: s.height,
				data: {
					photo_url: e.photo_url || null,
					srcId: e.id
				}
			});
		}
		let c = (e.children || []).slice().sort((e, t) => (e.meta && e.meta.sort_order || 0) - (t.meta && t.meta.sort_order || 0));
		for (let e of c) r(e, a);
	}
	for (let t of e) r(t, "");
	return t;
}
function v(e) {
	return e.some((e) => e && !("parentId" in e) && (e.type === "organization" || e.type === "filled" || e.type === "vacant" || Array.isArray(e.children) && ("position" in e || "photo_url" in e)));
}
function y(e) {
	let t, n = null;
	if (Array.isArray(e)) t = e.length && v(e) ? _(e) : e;
	else if (e && Array.isArray(e.nodes)) t = e.nodes, n = e;
	else if (e && Array.isArray(e.tree)) t = g(e.tree);
	else if (e && e.tree && typeof e.tree == "object") t = g([e.tree]);
	else if (e && e.org_id != null) t = g([e]);
	else if (e && Array.isArray(e.children) && e.type) t = _([e]);
	else throw Error("Unrecognized JSON. Expected a flat node array, {nodes:[…]}, {tree:[…]}, or an API tree of {type,children}.");
	if (!t.length) throw Error("No nodes found in data.");
	if (t.find((e) => !e || e.id == null)) throw Error("Every node needs an \"id\" field.");
	return {
		nodes: t,
		meta: n
	};
}
//#endregion
//#region src/core/layout.js
function b(e) {
	return e.orientation === "LeftToRight" || e.orientation === "RightToLeft";
}
function x(e, t) {
	return b(t) ? e.height : e.width;
}
function S(e, t) {
	return b(t) ? e.width : e.height;
}
function C(e, t) {
	return e.isVirtual ? "Balanced" : e.layoutMode || t.subtreeMode;
}
function w(e) {
	return e === "Alternate" || e === "AlternateLeft" || e === "AlternateRight";
}
function T(e, t) {
	let n = e.node, r = e.children, i = x(n, t), a = S(n, t);
	if (r.length === 0) return {
		w: i,
		h: a,
		anchorLeft: i / 2,
		anchorRight: i / 2,
		nodeCenterX: i / 2,
		nodeCenterY: a / 2,
		childPlacements: [],
		edgeRoutes: []
	};
	let o = r.map((e) => T(e, t)), s = C(n, t);
	return w(s) ? D(e, o, s, t) : E(e, o, s, t);
}
function E(e, t, n, r) {
	let i = e.node, a = x(i, r), o = i.isVirtual ? 0 : S(i, r), s = n === "Center" ? r.spacingX * .5 : r.spacingX, c = [], l = 0;
	for (let e = 0; e < t.length; e++) c.push(l), l += t[e].w + s;
	let u = l - s, d = c[0] + t[0].nodeCenterX, f = c[t.length - 1] + t[t.length - 1].nodeCenterX, p;
	switch (n) {
		case "Left":
			p = d;
			break;
		case "Right":
			p = f;
			break;
		default: p = (d + f) / 2;
	}
	let m = p + a / 2, h = Math.max(0, -(p - a / 2));
	for (let e = 0; e < c.length; e++) c[e] += h;
	p += h;
	let g = Math.max(u + h, m + h), _ = o + (i.isVirtual ? 0 : r.spacingY), v = Math.max(...t.map((e) => e.h)), y = [], b = [];
	for (let n = 0; n < t.length; n++) y.push({
		entry: e.children[n],
		cx: c[n],
		cy: _,
		m: t[n]
	}), b.push({
		childId: e.children[n].node.id,
		routeType: "bus"
	});
	return {
		w: g,
		h: _ + v,
		anchorLeft: p,
		anchorRight: g - p,
		nodeCenterX: p,
		nodeCenterY: o / 2,
		childPlacements: y,
		edgeRoutes: b
	};
}
function D(e, t, n, r) {
	let i = e.node, a = x(i, r), o = i.isVirtual ? 0 : S(i, r), s = n !== "AlternateRight", c = n === "Alternate", l = Math.max(16, r.spacingY * .45), u = o + (i.isVirtual ? 0 : r.spacingY), d = (t.length ? t[0].h : 0) / 2 + l / 2, f = u, p = u;
	s ? p += d : f += d;
	let m = [];
	for (let e = 0; e < t.length; e++) {
		let n = t[e], r;
		r = c ? Math.abs(f - p) < .01 ? s : f < p : s ? e % 2 == 0 : e % 2 == 1, r ? (m.push({
			i: e,
			side: -1,
			y: f,
			m: n
		}), f += n.h + l) : (m.push({
			i: e,
			side: 1,
			y: p,
			m: n
		}), p += n.h + l);
	}
	let h = (e) => m.filter((t) => t.side === e).reduce((e, t) => Math.max(e, t.m.w), 0), g = h(-1), _ = h(1), v = Math.max(g + 26, a / 2), y = [], b = [];
	for (let t of m) {
		let n = t.side < 0 ? v - 26 - t.m.w : v + 26;
		y[t.i] = {
			entry: e.children[t.i],
			cx: n,
			cy: t.y,
			m: t.m
		}, b[t.i] = {
			childId: e.children[t.i].node.id,
			routeType: t.side < 0 ? "spine-left" : "spine-right"
		};
	}
	let C = Math.max(f, p) - l, w = Math.max(v + 26 + _, v + a / 2);
	return {
		w,
		h: Math.max(C, u),
		anchorLeft: v,
		anchorRight: w - v,
		nodeCenterX: v,
		nodeCenterY: o / 2,
		childPlacements: y,
		edgeRoutes: b
	};
}
function O(e, t) {
	let n = T(e, t), r = [], i = Object.create(null);
	return (function e(n, a, o, s) {
		let c = n.node, l = o + a.nodeCenterX, u = s + a.nodeCenterY;
		c.isVirtual || r.push({
			node: c,
			lx: l,
			ly: u,
			w: x(c, t),
			h: S(c, t),
			parentId: c.parentId,
			routeType: i[c.id] || "bus"
		});
		for (let e of a.edgeRoutes) i[e.childId] = e.routeType;
		for (let t of a.childPlacements) e(t.entry, t.m, o + t.cx, s + t.cy);
	})(e, n, 0, 0), r;
}
function k(e, t, n) {
	let r = Object.create(null);
	for (let n of e) {
		let e = t[n.node.id] || 0;
		(r[e] || (r[e] = [])).push(n);
	}
	let i = Object.keys(r).map(Number).sort((e, t) => e - t), a = n.gridSize, o = 0;
	for (let e of i) {
		let t = r[e], i = Math.max(...t.map((e) => e.h));
		for (let e of t) e.ly = o + i / 2;
		let s = i + n.spacingY;
		n.alignGrid && (s = Math.ceil(s / a) * a), o += s;
	}
}
function A(e, t, n) {
	switch (n.orientation) {
		case "BottomToTop": return {
			x: e,
			y: -t
		};
		case "LeftToRight": return {
			x: t,
			y: e
		};
		case "RightToLeft": return {
			x: -t,
			y: e
		};
		default: return {
			x: e,
			y: t
		};
	}
}
function j(e = {}) {
	return {
		orientation: e.orientation || "TopToBottom",
		subtreeMode: e.subtreeMode || "Balanced",
		spacingX: e.spacingX == null ? 40 : e.spacingX,
		spacingY: e.spacingY == null ? 70 : e.spacingY,
		gridSize: e.gridSize == null ? 22 : e.gridSize,
		alignGrid: !!e.alignGrid,
		autoEdgeSide: !!e.autoEdgeSide
	};
}
function M(e, t = {}) {
	let n = j(t), r = u(l((e || []).map(m))), i = O(r, n);
	n.subtreeMode === "Matrix" && k(i, d(r), n);
	for (let e of i) {
		let t = A(e.lx, e.ly, n);
		e.cx = t.x, e.cy = t.y;
	}
	let a = Infinity, o = Infinity;
	for (let e of i) a = Math.min(a, e.cx - e.node.width / 2), o = Math.min(o, e.cy - e.node.height / 2);
	isFinite(a) || (a = 0, o = 0);
	let s = 80 - a, c = 80 - o;
	for (let e of i) e.cx += s, e.cy += c;
	if (n.alignGrid) {
		let e = n.gridSize;
		for (let t of i) t.cx = Math.round(t.cx / e) * e, t.cy = Math.round(t.cy / e) * e;
	}
	let f = Object.create(null);
	for (let e of i) f[e.node.id] = e;
	return {
		positioned: i,
		posById: f,
		cfg: n,
		bounds: N(i)
	};
}
function N(e) {
	let t = Infinity, n = Infinity, r = -Infinity, i = -Infinity;
	for (let a of e) t = Math.min(t, a.cx - a.node.width / 2), n = Math.min(n, a.cy - a.node.height / 2), r = Math.max(r, a.cx + a.node.width / 2), i = Math.max(i, a.cy + a.node.height / 2);
	return isFinite(t) ? {
		x: t,
		y: n,
		w: r - t,
		h: i - n
	} : {
		x: 0,
		y: 0,
		w: 0,
		h: 0
	};
}
//#endregion
//#region src/core/connectors.js
function P(e, t) {
	let n = t && t[e.node.id];
	return {
		x: e.cx + (n ? n.dx : 0),
		y: e.cy + (n ? n.dy : 0)
	};
}
function F(e, t, n, r, i, a) {
	let o = i && i[t.node.id], s = a && a[t.node.id];
	if (o && o.length || s) return B(e, t, o || [], n, r, s);
	let c = P(e, r), l = P(t, r), u = e.node.width, d = e.node.height, f = t.node.width, p = t.node.height, m = b(n), h = c.y - d / 2, g = c.y + d / 2, _ = c.x - u / 2, v = c.x + u / 2, y = l.y - p / 2, x = l.y + p / 2, S = l.x - f / 2, C = l.x + f / 2, w = [];
	if (t.routeType === "bus") {
		if (m) {
			let e = l.x >= c.x ? v : _, t = l.x >= c.x ? S : C, n = (e + t) / 2;
			w.push([e, c.y], [n, c.y], [n, l.y], [t, l.y]);
		} else {
			let e = l.y >= c.y ? g : h, t = l.y >= c.y ? y : x, n = (e + t) / 2;
			w.push([c.x, e], [c.x, n], [l.x, n], [l.x, t]);
		}
	} else if (m) {
		let e = l.x >= c.x ? v : _, t = l.y <= c.y ? x : y;
		w.push([e, c.y], [l.x, c.y], [l.x, t]);
	} else {
		let e = l.y >= c.y ? g : h, t = l.x <= c.x ? C : S;
		w.push([c.x, e], [c.x, l.y], [t, l.y]);
	}
	return "M " + w.map((e) => e[0].toFixed(1) + " " + e[1].toFixed(1)).join(" L ");
}
function I(e, t, n, r, i, a, o) {
	let s = P(e, a), c = P(t, a), l = e.node.width, u = e.node.height, d = t.node.width, f = t.node.height, p, m;
	return p = o && o.p ? {
		x: s.x + o.p.nx * l / 2,
		y: s.y + o.p.ny * u / 2
	} : b(i) ? {
		x: n.x >= s.x ? s.x + l / 2 : s.x - l / 2,
		y: s.y
	} : {
		x: s.x,
		y: n.y >= s.y ? s.y + u / 2 : s.y - u / 2
	}, m = o && o.c ? {
		x: c.x + o.c.nx * d / 2,
		y: c.y + o.c.ny * f / 2
	} : b(i) ? {
		x: r.x >= c.x ? c.x + d / 2 : c.x - d / 2,
		y: c.y
	} : {
		x: c.x,
		y: r.y >= c.y ? c.y + f / 2 : c.y - f / 2
	}, {
		S: p,
		E: m
	};
}
function L(e, t, n, r, i, a) {
	let o = I(e, t, n.length ? n[0] : P(t, i), n.length ? n[n.length - 1] : P(e, i), r, i, a), s = o.S, c = o.E;
	if (r.autoEdgeSide && n.length) a && a.p || (s = R(e, P(e, i), n[0])), a && a.c || (c = R(t, P(t, i), n[n.length - 1]));
	else if (!n.length && !(a && a.c) && t.routeType !== "bus") {
		let n = P(t, i), a = P(e, i), o = t.node.width, s = t.node.height;
		c = b(r) ? {
			x: n.x,
			y: n.y <= a.y ? n.y + s / 2 : n.y - s / 2
		} : {
			x: n.x <= a.x ? n.x + o / 2 : n.x - o / 2,
			y: n.y
		};
	}
	return [s].concat(n.map((e) => ({
		x: e.x,
		y: e.y
	})), [c]);
}
function R(e, t, n) {
	let r = e.node.width, i = e.node.height, a = n.x - t.x, o = n.y - t.y;
	return Math.abs(a) * i >= Math.abs(o) * r ? {
		x: t.x + (a >= 0 ? r / 2 : -r / 2),
		y: t.y
	} : {
		x: t.x,
		y: t.y + (o >= 0 ? i / 2 : -i / 2)
	};
}
function z(e, t) {
	let n = [e[0]];
	for (let r = 1; r < e.length; r++) {
		let i = n[n.length - 1], a = e[r];
		i.x !== a.x && i.y !== a.y && n.push(t ? {
			x: a.x,
			y: i.y
		} : {
			x: i.x,
			y: a.y
		}), n.push(a);
	}
	return n;
}
function B(e, t, n, r, i, a) {
	return "M " + z(L(e, t, n, r, i, a), b(r)).map((e) => e.x.toFixed(1) + " " + e.y.toFixed(1)).join(" L ");
}
//#endregion
//#region src/core/bounds.js
function V(e, t, n) {
	n ??= 0;
	let r = Infinity, i = Infinity, a = -Infinity, o = -Infinity;
	for (let n of e) {
		let e = P(n, t);
		r = Math.min(r, e.x - n.node.width / 2), i = Math.min(i, e.y - n.node.height / 2), a = Math.max(a, e.x + n.node.width / 2), o = Math.max(o, e.y + n.node.height / 2);
	}
	return isFinite(r) ? {
		x: r - n,
		y: i - n,
		w: a - r + n * 2,
		h: o - i + n * 2
	} : {
		x: 0,
		y: 0,
		w: 100,
		h: 100
	};
}
function H(e, t, n, r = {}) {
	let i = r.maxZoom == null ? 1.4 : r.maxZoom, a = r.margin == null ? .92 : r.margin, o = e.w || 1, s = e.h || 1, c = Math.min(t / o, n / s, i) * a;
	return {
		zoom: c,
		panX: (t - o * c) / 2 - e.x * c,
		panY: (n - s * c) / 2 - e.y * c
	};
}
//#endregion
export { i as A, f as C, n as D, d as E, t as M, r as N, a as O, e as P, p as S, c as T, v as _, P as a, h as b, B as c, M as d, S as f, g, _ as h, I as i, s as j, o as k, A as l, j as m, H as n, z as o, x as p, L as r, F as s, V as t, b as u, m as v, u as w, l as x, y };
