// src/core/constants.js
var e = "__virtual_root__", t = 26, n = 80, r = [
	"AutoSmart",
	"GridSmart",
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
	subtreeMode: "AutoSmart",
	spacingX: 40,
	spacingY: 70,
	gridSize: 22,
	alignGrid: !1
}, o = {
	width: 400,
	height: 400
}, s = {
	width: 420,
	height: 420,
	fit: "contain",
	align: "center",
	offsetX: 0,
	offsetY: 0
}, c = "#004264", l = 140, u = {
	width: 240,
	height: 100
}, d = {
	width: 240,
	height: 380
};
// src/core/tree.js
function f(e) {
	let t = Object.create(null);
	for (let n of e) t[n.id] = n;
	return t;
}
function p(e) {
	return e.parentId !== "" && e.parentId != null && e.parentId !== !1;
}
function m(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
	for (let r of e || []) {
		let e = String(r.id);
		t.has(e) ? n.add(e) : t.set(e, r);
	}
	let r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Set();
	for (let e of t.keys()) {
		if (r.has(e)) continue;
		let n = [], a = e;
		for (; a != null && t.has(a) && !r.has(a);) {
			r.set(a, 1), n.push(a);
			let e = t.get(a);
			a = p(e) ? String(e.parentId) : null;
		}
		if (a != null && r.get(a) === 1) for (let e = n.indexOf(a); e < n.length; e++) i.add(n[e]);
		for (let e of n) r.set(e, 2);
	}
	return !n.size && !i.size ? null : {
		duplicateIds: [...n].sort(),
		cycleIds: [...i].sort()
	};
}
function h(e) {
	let t = [];
	e.duplicateIds.length && t.push(`duplicate ids: ${e.duplicateIds.join(", ")}`), e.cycleIds.length && t.push(`parent cycles through: ${e.cycleIds.join(", ")}`);
	let n = /* @__PURE__ */ Error(`Invalid org chart data (${t.join("; ")}).`);
	return n.code = "INVALID_DATA", n.details = {
		duplicateIds: e.duplicateIds.slice(),
		cycleIds: e.cycleIds.slice()
	}, n;
}
function g(t) {
	let n = m(t);
	if (n) throw h(n);
	let r = Object.create(null);
	for (let e of t) r[e.id] = {
		node: e,
		children: []
	};
	let i = {
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
		let t = r[e.id];
		p(e) && r[e.parentId] ? r[e.parentId].children.push(t) : i.children.push(t);
	}
	return i;
}
function _(e) {
	let t = {
		node: e.node,
		children: []
	};
	if (!e.node.collapsed) for (let n of e.children) t.children.push(_(n));
	return t;
}
function v(e) {
	let t = Object.create(null);
	return (function e(n, r) {
		n.node.isVirtual || (t[n.node.id] = r);
		let i = n.node.isVirtual ? 0 : r + 1;
		for (let t of n.children) e(t, i);
	})(e, 0), t;
}
function y(e, t) {
	let n = Object.create(null);
	for (let r of e) {
		if (r.id in n) continue;
		let e = [], i = /* @__PURE__ */ new Set(), a = r, o = 0;
		for (; a;) {
			if (a.id in n) {
				o = n[a.id] + 1;
				break;
			}
			if (i.has(a.id)) {
				o = 0;
				break;
			}
			i.add(a.id), e.push(a), a = p(a) ? t[a.parentId] : null;
		}
		for (let t = e.length - 1; t >= 0; t--) n[e[t].id] = o + (e.length - 1 - t);
	}
	return n;
}
function b(e, t) {
	let n = 0;
	for (let r of e) r.parentId === t && n++;
	return n;
}
// src/core/dataImport.js
var x = /* @__PURE__ */ new Set([...r, "Auto"]), S = /^[A-Za-z][\w-]*$/;
function C(e) {
	return typeof e == "number" && Number.isFinite(e) && e > 0 ? e : null;
}
function w(e) {
	return e == null ? "" : String(e);
}
function T(e) {
	return e == null || e === !1 ? "" : e;
}
function E(e) {
	return e === !0 || e === "true";
}
function D(e) {
	let t = e.type == null ? "position" : S.test(String(e.type)) ? String(e.type) : "position", n = t === "department" ? u : d;
	return {
		id: e.id,
		parentId: T(e.parentId),
		type: t,
		label: w(e.label),
		personName: w(e.personName),
		status: w(e.status),
		width: C(e.width) || n.width,
		height: C(e.height) || n.height,
		collapsed: E(e.collapsed),
		layoutMode: x.has(e.layoutMode) ? e.layoutMode : null,
		data: e.data && typeof e.data == "object" && !Array.isArray(e.data) ? e.data : {}
	};
}
function ee(e) {
	let t = [];
	return !e || typeof e != "object" ? ["not an object"] : (e.width != null && !C(e.width) && t.push(`width ${JSON.stringify(e.width)}`), e.height != null && !C(e.height) && t.push(`height ${JSON.stringify(e.height)}`), e.collapsed != null && typeof e.collapsed != "boolean" && e.collapsed !== "true" && e.collapsed !== "false" && t.push(`collapsed ${JSON.stringify(e.collapsed)}`), e.layoutMode != null && e.layoutMode !== "" && !x.has(e.layoutMode) && t.push(`layoutMode ${JSON.stringify(e.layoutMode)}`), e.type != null && !S.test(String(e.type)) && t.push(`type ${JSON.stringify(e.type)}`), e.data != null && (typeof e.data != "object" || Array.isArray(e.data)) && t.push("data"), t);
}
function te(e) {
	let t = [e.firstname, e.lastname].filter(Boolean).join(" ").trim();
	return e.status === "VACANT" ? "— VACANT —" : e.status === "UNFUNDED" ? t || "— UNFUNDED —" : t || "—";
}
function O(e) {
	let t = [];
	function n(e, r) {
		let i = "org-" + (e.org_id == null ? e.id : e.org_id);
		t.push({
			id: i,
			parentId: r,
			type: "department",
			label: e.name || e.label || "UNIT",
			data: { level: e.level }
		});
		let a = (e.positions || []).slice().sort((e, t) => (e.org_order || 0) - (t.org_order || 0));
		for (let e of a) t.push({
			id: "pos-" + e.id,
			parentId: i,
			type: "position",
			label: e.position_title || "POSITION",
			personName: te(e),
			status: e.status || "",
			data: { photo_url: e.photo_url || e.photo || null }
		});
		let o = (e.children || []).slice().sort((e, t) => (e.sort_order || 0) - (t.sort_order || 0));
		for (let e of o) n(e, i);
	}
	for (let t of e) n(t, "");
	return t;
}
function k(e) {
	let t = [], n = 0;
	function r(e, i) {
		let a = "mo-" + n++;
		if (e.type === "organization") t.push({
			id: a,
			parentId: i,
			type: "department",
			label: e.name || "UNIT",
			data: {
				is_head: !!e.is_head,
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
				data: {
					is_head: !!e.is_head,
					photo_url: e.photo_url || null,
					srcId: e.id
				}
			});
		}
		let o = (e.children || []).slice().sort((e, t) => (e.meta && e.meta.sort_order || 0) - (t.meta && t.meta.sort_order || 0));
		for (let e of o) r(e, a);
	}
	for (let t of e) r(t, "");
	return t;
}
function A(e) {
	return e.some((e) => e && !("parentId" in e) && (e.type === "organization" || e.type === "filled" || e.type === "vacant" || Array.isArray(e.children) && ("position" in e || "photo_url" in e)));
}
function j(e) {
	let t, n = null;
	if (Array.isArray(e)) t = e.length && A(e) ? k(e) : e;
	else if (e && Array.isArray(e.nodes)) t = e.nodes, n = e;
	else if (e && Array.isArray(e.tree)) t = O(e.tree);
	else if (e && e.tree && typeof e.tree == "object") t = O([e.tree]);
	else if (e && e.org_id != null) t = O([e]);
	else if (e && Array.isArray(e.children) && e.type) t = k([e]);
	else throw Error("Unrecognized JSON. Expected a flat node array, {nodes:[…]}, {tree:[…]}, or an API tree of {type,children}.");
	if (!t.length) throw Error("No nodes found in data.");
	if (t.find((e) => !e || e.id == null)) throw Error("Every node needs an \"id\" field.");
	return {
		nodes: t,
		meta: n
	};
}
// src/core/connectorGeometry.js
var M = .001;
function N(e) {
	return Math.round(Number(e) * 1e3) / 1e3;
}
function P(e) {
	let t = N(e);
	return String(t);
}
function F(e) {
	let t = String(e || "").match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)?.map(Number) || [], n = [];
	for (let e = 0; e + 1 < t.length; e += 2) n.push({
		x: N(t[e]),
		y: N(t[e + 1])
	});
	return n;
}
function ne(e) {
	return e == null ? "" : typeof e == "object" ? JSON.stringify(Object.keys(e).sort().reduce((t, n) => (t[n] = e[n], t), {})) : String(e);
}
function I(e) {
	return [...e].map(String).sort().join("\0");
}
function L(e) {
	return `${P(e.x)},${P(e.y)}`;
}
function R(e) {
	return Math.abs(e.b.x - e.a.x) + Math.abs(e.b.y - e.a.y);
}
function re(e) {
	return e.map((e, t) => `${t ? "L" : "M"} ${P(e.x)} ${P(e.y)}`).join(" ");
}
var ie = 100;
function z(e) {
	return Math.round(e * ie);
}
function ae(e) {
	let t = e.map((e) => {
		let t = Math.abs(e.a.y - e.b.y) < M, n = N(t ? e.a.y : e.a.x);
		return {
			...e,
			horizontal: t,
			fixed: n,
			lane: z(n),
			start: N(Math.min(t ? e.a.x : e.a.y, t ? e.b.x : e.b.y)),
			end: N(Math.max(t ? e.a.x : e.a.y, t ? e.b.x : e.b.y)),
			styleKey: ne(e.style)
		};
	}).sort((e, t) => Number(e.horizontal) - Number(t.horizontal) || e.lane - t.lane || e.styleKey.localeCompare(t.styleKey) || e.start - t.start || e.end - t.end), n = [];
	for (let e of t) {
		let t = n.at(-1);
		t && t.horizontal === e.horizontal && t.lane === e.lane && t.styleKey === e.styleKey && e.start <= t.end + M ? (t.end = Math.max(t.end, e.end), t.memberIds = [.../* @__PURE__ */ new Set([...t.memberIds, ...e.memberIds])], t.shared = t.shared || e.shared) : n.push({
			...e,
			memberIds: [...e.memberIds]
		});
	}
	return n.map((e) => {
		let t = e.horizontal ? {
			x: e.start,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.start
		}, n = e.horizontal ? {
			x: e.end,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.end
		};
		return {
			...e,
			a: t,
			b: n,
			d: `M ${P(t.x)} ${P(t.y)} L ${P(n.x)} ${P(n.y)}`
		};
	});
}
function oe(e, t = {}) {
	let n = (e || []).map((e, t) => typeof e == "string" ? {
		id: String(t),
		d: e,
		style: null
	} : {
		id: String(e.id ?? t),
		d: e.d,
		style: e.style ?? null
	}), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = F(e.d);
		for (let n = 1; n < t.length; n += 1) {
			let i = t[n - 1], a = t[n], o = Math.abs(i.y - a.y) < M, s = Math.abs(i.x - a.x) < M;
			if (!o && !s) continue;
			let c = N(o ? i.y : i.x), l = N(Math.min(o ? i.x : i.y, o ? a.x : a.y)), u = N(Math.max(o ? i.x : i.y, o ? a.x : a.y));
			if (u - l < M) continue;
			let d = `${o ? "h" : "v"}:${c}`;
			r.has(d) || r.set(d, {
				horizontal: o,
				fixed: c,
				segments: []
			}), r.get(d).segments.push({
				start: l,
				end: u,
				entry: e
			});
		}
	}
	let i = t.styleKey || ne, a = [];
	for (let e of r.values()) {
		let n = [...new Set(e.segments.flatMap((e) => [e.start, e.end]))].sort((e, t) => e - t);
		for (let r = 1; r < n.length; r += 1) {
			let o = n[r - 1], s = n[r];
			if (s - o < M) continue;
			let c = e.segments.filter((e) => e.start <= o + M && e.end >= s - M);
			if (!c.length) continue;
			let l = [...new Map(c.map((e) => [e.entry.id, e.entry])).values()], u = l.length > 1, d = u ? t.sharedStyle ?? null : l[0].style;
			a.push({
				horizontal: e.horizontal,
				fixed: e.fixed,
				start: o,
				end: s,
				style: d,
				styleKey: i(d),
				shared: u,
				memberIds: l.map((e) => e.id)
			});
		}
	}
	a.sort((e, t) => Number(e.horizontal) - Number(t.horizontal) || e.fixed - t.fixed || e.start - t.start || e.end - t.end || e.styleKey.localeCompare(t.styleKey));
	let o = [];
	for (let e of a) {
		let n = o.at(-1);
		n && n.horizontal === e.horizontal && Math.abs(n.fixed - e.fixed) < M && Math.abs(n.end - e.start) < M && n.styleKey === e.styleKey && (!t.preserveMembership || I(n.memberIds) === I(e.memberIds)) ? (n.end = e.end, n.shared = n.shared || e.shared, n.memberIds = [.../* @__PURE__ */ new Set([...n.memberIds, ...e.memberIds])]) : o.push({ ...e });
	}
	return o.map((e) => {
		let t = e.horizontal ? {
			x: e.start,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.start
		}, n = e.horizontal ? {
			x: e.end,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.end
		};
		return {
			a: t,
			b: n,
			d: `M ${P(t.x)} ${P(t.y)} L ${P(n.x)} ${P(n.y)}`,
			style: e.style,
			shared: e.shared,
			memberIds: e.memberIds
		};
	});
}
function se(e, t, n = {}) {
	let r = (t || []).map((e, t) => {
		let n = String(e?.id ?? e?.childId ?? t), r = Array.isArray(e?.points) ? e.points.map((e) => ({
			x: N(e.x),
			y: N(e.y)
		})) : F(e?.d ?? e);
		return {
			id: n,
			points: r,
			d: re(r),
			style: e?.style ?? null
		};
	}).filter((e) => e.points.length >= 2);
	if (r.length < 2) return null;
	let i = r.map((e) => e.id), a = I(i), o = r[0].points[0], s = oe(r, { preserveMembership: !0 }).map((t, n) => ({
		id: `${String(e)}:${n}`,
		a: t.a,
		b: t.b,
		d: t.d,
		childIds: [...t.memberIds].map(String).sort(),
		role: "branch"
	})), c = s.filter((e) => e.childIds.length > 1), l = c.filter((e) => I(e.childIds) === a), u = [], d = /* @__PURE__ */ new Set([L(o)]), f = !0;
	for (; f;) {
		f = !1;
		for (let e of l) {
			if (u.includes(e)) continue;
			let t = L(e.a), n = L(e.b);
			(d.has(t) || d.has(n)) && (u.push(e), d.add(t), d.add(n), f = !0);
		}
	}
	let p = !!n.horizontalFlow, m = u.filter((e) => Math.abs(e.a.y - e.b.y) < M === p), h = [...m.length ? m : u].sort((e, t) => R(t) - R(e))[0] || null, g = new Set(u.map((e) => e.id)), _ = new Set(u.flatMap((e) => [L(e.a), L(e.b)])), v = s.map((e) => {
		let t = Math.abs(e.a.y - e.b.y) < M;
		return {
			segment: e,
			horizontal: t,
			fixed: N(t ? e.a.y : e.a.x),
			lane: z(N(t ? e.a.y : e.a.x)),
			start: N(Math.min(t ? e.a.x : e.a.y, t ? e.b.x : e.b.y)),
			end: N(Math.max(t ? e.a.x : e.a.y, t ? e.b.x : e.b.y))
		};
	}).filter((e) => e.horizontal !== p).sort((e, t) => Number(e.horizontal) - Number(t.horizontal) || e.lane - t.lane || e.start - t.start || e.end - t.end), y = [];
	for (let e of v) {
		let t = y.at(-1);
		t && t.horizontal === e.horizontal && t.lane === e.lane && e.start <= t.end + M ? (t.end = Math.max(t.end, e.end), t.segmentIds.push(e.segment.id), t.childIds = [.../* @__PURE__ */ new Set([...t.childIds, ...e.segment.childIds])].sort()) : y.push({
			horizontal: e.horizontal,
			fixed: e.fixed,
			lane: e.lane,
			start: e.start,
			end: e.end,
			segmentIds: [e.segment.id],
			childIds: [...e.segment.childIds]
		});
	}
	let b = y.filter((e) => {
		let t = e.horizontal ? {
			x: e.start,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.start
		}, n = e.horizontal ? {
			x: e.end,
			y: e.fixed
		} : {
			x: e.fixed,
			y: e.end
		};
		return e.childIds.length >= 2 || _.has(L(t)) || _.has(L(n));
	}).map((t, n) => {
		let r = t.horizontal ? {
			x: t.start,
			y: t.fixed
		} : {
			x: t.fixed,
			y: t.start
		}, i = t.horizontal ? {
			x: t.end,
			y: t.fixed
		} : {
			x: t.fixed,
			y: t.end
		};
		return {
			id: `${String(e)}:bus:${n}`,
			a: r,
			b: i,
			d: `M ${P(r.x)} ${P(r.y)} L ${P(i.x)} ${P(i.y)}`,
			childIds: t.childIds,
			segmentIds: t.segmentIds,
			role: "bus"
		};
	}), x = new Set(b.flatMap((e) => e.segmentIds));
	for (let e of s) g.has(e.id) ? e.role = "stem" : x.has(e.id) ? e.role = "bus" : e.childIds.length > 1 && (e.role = "shared");
	let S = [
		...u,
		...b,
		...c.filter((e) => !g.has(e.id) && !x.has(e.id))
	], C = i.map((e) => ({
		childId: e,
		segments: s.filter((t) => t.role === "branch" && t.childIds.length === 1 && t.childIds[0] === e)
	})), w = /* @__PURE__ */ new Map();
	for (let e of s) for (let t of [e.a, e.b]) {
		let n = L(t);
		w.has(n) || w.set(n, {
			point: t,
			segments: []
		}), w.get(n).segments.push(e.id);
	}
	let T = [...w.values()].filter((e) => e.segments.length >= 3).map((e) => ({
		point: e.point,
		segmentIds: e.segments
	}));
	return {
		model: "shared-family-network",
		parentId: String(e),
		childIds: i,
		source: o,
		segments: s,
		stemSegments: u,
		sharedSegments: S,
		buses: b,
		branches: C,
		junctions: T,
		trunk: h,
		horizontalFlow: p
	};
}
function B(e, t = [], n = {}) {
	let r = (e || []).map((e, t) => typeof e == "string" ? {
		id: String(t),
		d: e,
		style: null
	} : {
		id: String(e.id ?? t),
		d: e.d,
		style: e.style ?? null
	}), i = new Map(r.map((e) => [e.id, e])), a = new Set([...n.rebuildFamilyIds || []].map(String)), o = [], s = /* @__PURE__ */ new Set(), c = [];
	for (let e of t || []) {
		let t = (e.childIds || []).map(String).filter((e) => i.has(e));
		if (t.length < 2) continue;
		let r = a.has(String(e.parentId)) || !Array.isArray(e.segments) || !e.segments.length ? se(e.parentId, t.map((e) => i.get(e)), { horizontalFlow: e.horizontalFlow }) : e;
		if (r) {
			o.push(r);
			for (let e of r.segments) {
				let t = e.childIds.map(String).filter((e) => i.has(e));
				if (!t.length) continue;
				t.forEach((e) => s.add(e));
				let r = e.role !== "branch", a = r ? n.sharedStyle ?? null : i.get(t[0])?.style ?? null;
				c.push({
					...e,
					d: e.d || `M ${P(e.a.x)} ${P(e.a.y)} L ${P(e.b.x)} ${P(e.b.y)}`,
					memberIds: t,
					shared: r,
					style: a
				});
			}
		}
	}
	let l = r.filter((e) => !s.has(e.id));
	return c.push(...oe(l, n)), {
		segments: ae(c),
		familyNetworks: o,
		standaloneIds: l.map((e) => e.id)
	};
}
// src/core/layout.js
function V(e) {
	return e.orientation === "LeftToRight" || e.orientation === "RightToLeft";
}
function H(e, t) {
	return V(t) ? e.height : e.width;
}
function U(e, t) {
	return V(t) ? e.width : e.height;
}
function ce(e, t) {
	return e.isVirtual ? "Balanced" : e.layoutMode || t.subtreeMode;
}
function le(e) {
	return e === "Alternate" || e === "AlternateLeft" || e === "AlternateRight";
}
function W(e) {
	return e === "Auto" || e === "AutoSmart" || e === "GridSmart";
}
function G(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function ue(e) {
	let t = !1, n = 0;
	for (let r of e.children) J(r) || (r.children.length === 0 ? t = !0 : n += 1);
	return n + +!!t;
}
function de(e, t) {
	let n = ue(e);
	return n <= 1 ? t : G(t / n ** .28, .88, Math.max(1.1, t));
}
function fe(e, t, n) {
	if (t.subtreeMode !== "GridSmart" || n > 1 || e.node.isVirtual || t.visualTargetAspect < .8) return !1;
	let r = e.children.filter((e) => !J(e)), i = r.filter((e) => e.children.length > 0), a = r.filter((e) => e.children.length === 0);
	return i.length === 3 && (a.length > 0 || r.length < e.children.length);
}
function pe(e, t, n = t.targetAspect, r = 0) {
	let i = e.node, a = e.children, o = H(i, t), s = U(i, t);
	if (a.length === 0) return {
		w: o,
		h: s,
		anchorLeft: o / 2,
		anchorRight: o / 2,
		nodeCenterX: o / 2,
		nodeCenterY: s / 2,
		childPlacements: [],
		edgeRoutes: []
	};
	let c = ce(i, t), l = W(c) ? de(e, n) : n, u = fe(e, t, r), d = a.map((e) => pe(e, t, u && !J(e) && e.children.length === 2 && e.children.every((e) => e.children.length === 0) ? Math.max(1.15, l) : l, r + 1)), f = l;
	return W(c) ? Ie(e, d, t, n, f, r) : le(c) ? Re(e, d, c, t) : Le(e, d, c, t);
}
function me(e, t, n, r, i) {
	let a = Math.max(.01, e / Math.max(1, t));
	return Math.abs(Math.log(a / n)) + Math.max(0, e * t - r) / Math.max(1, r) * .035 + i * .002;
}
function he(e, t, n) {
	if (e.length <= 1) return n;
	let r = Math.max(...e.map((e) => e.cells.length)), i = Math.min(...e.map((e) => e.cells.length)), a = e.reduce((e, n) => e + (1 - n.w / Math.max(1, t)) ** 2, 0) / e.length, o = (r - i) / Math.max(1, r);
	return n + a * .18 + o * .16;
}
function ge(e, t, n, r, i = 1, a = !1, o = !1, s = .5) {
	if (!e.length) return {
		w: 0,
		h: 0,
		rows: [],
		columns: 0,
		placements: [],
		flow: "rows"
	};
	let c = null, l = e.reduce((e, t) => e + t.w * t.h, 0);
	for (let o = Math.min(e.length, Math.max(1, i)); o <= e.length; o += 1) {
		let i = e.length % o, u = a && i ? [o, i] : [o];
		for (let i of u) {
			let a = [], u = 0, d = i;
			for (; u < e.length;) {
				let t = e.slice(u, u + d), r = t.reduce((e, t) => e + t.w, 0) + n * Math.max(0, t.length - 1), i = Math.max(...t.map((e) => e.h));
				a.push({
					cells: t,
					w: r,
					h: i
				}), u += d, d = o;
			}
			let f = Math.max(...a.map((e) => e.cells.length)), p = Math.min(...a.map((e) => e.cells.length));
			if (a.length > 1 && p / f < s) continue;
			let m = Math.max(...a.map((e) => e.w)), h = a.reduce((e, t) => e + t.h, 0) + r * Math.max(0, a.length - 1), g = he(a, m, me(m, h, t, l, a.length));
			(!c || g < c.score - 1e-9 || Math.abs(g - c.score) < 1e-9 && o < c.columns) && (c = {
				w: m,
				h,
				rows: a,
				columns: o,
				score: g
			});
		}
	}
	if (o && e.length > 1 && e.length <= 12) {
		let i = 2 ** (e.length - 1);
		for (let a = 1; a < i; a += 1) {
			let i = [], o = [];
			e.forEach((t, n) => {
				o.push(t), (n === e.length - 1 || a & 1 << n) && (i.push(o), o = []);
			});
			let u = i.map((e) => ({
				cells: e,
				w: e.reduce((e, t) => e + t.w, 0) + n * Math.max(0, e.length - 1),
				h: Math.max(...e.map((e) => e.h))
			})), d = Math.max(...u.map((e) => e.cells.length)), f = Math.min(...u.map((e) => e.cells.length));
			if (u.length > 1 && f / d < s) continue;
			let p = Math.max(...u.map((e) => e.w)), m = u.reduce((e, t) => e + t.h, 0) + r * Math.max(0, u.length - 1), h = Math.max(...u.map((e) => e.cells.length)), g = he(u, p, me(p, m, t, l, u.length));
			g < c.score - 1e-9 && (c = {
				w: p,
				h: m,
				rows: u,
				columns: h,
				score: g
			});
		}
	}
	let u = 0, d = [];
	return c.rows.forEach((e, t) => {
		let i = (c.w - e.w) / 2;
		e.cells.forEach((r) => {
			d.push({
				item: r,
				x: i,
				y: u,
				row: t,
				rowHeight: e.h
			}), i += r.w + n;
		}), u += e.h + r;
	}), {
		...c,
		placements: d,
		flow: "rows"
	};
}
function _e(e, t, n, r) {
	if (!e.length) return {
		w: 0,
		h: 0,
		columns: [],
		placements: [],
		flow: "columns"
	};
	if (e.length > 12) return ge(e, t, n, r);
	let i = e.reduce((e, t) => e + t.w * t.h, 0), a = null, o = 2 ** Math.max(0, e.length - 1);
	for (let s = 0; s < o; s += 1) {
		let o = [], c = [];
		e.forEach((t, n) => {
			c.push(t), (n === e.length - 1 || s & 1 << n) && (o.push(c), c = []);
		});
		let l = o.map((e) => ({
			cells: e,
			w: Math.max(...e.map((e) => e.w)),
			h: e.reduce((e, t) => e + t.h, 0) + r * Math.max(0, e.length - 1)
		})), u = l.reduce((e, t) => e + t.w, 0) + n * Math.max(0, l.length - 1), d = Math.max(...l.map((e) => e.h)), f = me(u, d, t, i, l.length);
		(!a || f < a.score - 1e-9 || Math.abs(f - a.score) < 1e-9 && l.length < a.columns.length) && (a = {
			w: u,
			h: d,
			columns: l,
			score: f
		});
	}
	let s = 0, c = [];
	return a.columns.forEach((e, t) => {
		let i = 0;
		e.cells.forEach((n) => {
			c.push({
				item: n,
				x: s + (e.w - n.w) / 2,
				y: i,
				column: t,
				columnWidth: e.w
			}), i += n.h + r;
		}), s += e.w + n;
	}), {
		...a,
		placements: c,
		flow: "columns"
	};
}
function ve(e, t, n, r) {
	if (!e.length) return {
		w: 0,
		h: 0,
		columns: [],
		placements: [],
		flow: "columns",
		packing: "masonry"
	};
	let i = e.reduce((e, t) => e + t.w * t.h, 0), a = null;
	for (let o = 1; o <= e.length; o += 1) {
		let s = Array.from({ length: o }, () => ({
			cells: [],
			w: 0,
			h: 0
		}));
		e.forEach((e, t) => {
			let n = t;
			if (t >= o) {
				n = 0;
				for (let e = 1; e < s.length; e += 1) s[e].h < s[n].h - 1e-9 && (n = e);
			}
			let i = s[n];
			i.cells.push(e), i.w = Math.max(i.w, e.w), i.h += e.h + (i.cells.length > 1 ? r : 0);
		});
		let c = s.reduce((e, t) => e + t.w, 0) + n * Math.max(0, s.length - 1), l = Math.max(...s.map((e) => e.h)), u = me(c, l, t, i, s.length);
		(!a || u < a.score - 1e-9 || Math.abs(u - a.score) < 1e-9 && s.length < a.columns.length) && (a = {
			w: c,
			h: l,
			columns: s,
			score: u
		});
	}
	let o = 0, s = [];
	return a.columns.forEach((e, t) => {
		let i = 0;
		e.cells.forEach((n) => {
			s.push({
				item: n,
				x: o + (e.w - n.w) / 2,
				y: i,
				column: t,
				columnWidth: e.w
			}), i += n.h + r;
		}), o += e.w + n;
	}), {
		...a,
		placements: s,
		flow: "columns",
		packing: "masonry"
	};
}
function K(e, t) {
	return Math.ceil(e / t) * t;
}
function ye(e, t, n, r, i, a) {
	let o = r / 2, s = G(Math.min(t.x, n.x) - o, 0, i), c = G(Math.max(t.x, n.x) + o, 0, i), l = G(Math.min(t.y, n.y) - o, 0, a), u = G(Math.max(t.y, n.y) + o, 0, a);
	c - s > .01 && u - l > .01 && e.push({
		left: s,
		right: c,
		top: l,
		bottom: u,
		kind: "channel"
	});
}
function be(e, t, n, r = 0, i = 0, a = []) {
	let o = H(e.node, n), s = e.node.isVirtual ? 0 : U(e.node, n);
	e.node.isVirtual || a.push({
		left: r + t.nodeCenterX - o / 2,
		right: r + t.nodeCenterX + o / 2,
		top: i + t.nodeCenterY - s / 2,
		bottom: i + t.nodeCenterY + s / 2,
		kind: "node"
	});
	let c = new Map((t.childPlacements || []).map((e) => [String(e.entry.node.id), e])), l = Math.max(4, n.gridSize * .32);
	for (let e of t.edgeRoutes || []) {
		let o = c.get(String(e.childId));
		if (!o) continue;
		let u = o.entry.node.isVirtual ? 0 : U(o.entry.node, n), d = {
			x: r + t.nodeCenterX,
			y: i + t.nodeCenterY + s / 2
		}, f = {
			x: r + o.cx + o.m.nodeCenterX,
			y: i + o.cy + o.m.nodeCenterY - u / 2
		}, p = (e.points || []).map((e) => ({
			x: r + e.x,
			y: i + e.y
		})), m = (d.y + f.y) / 2, h = p.length ? Z(ze([
			d,
			...p,
			f
		], !1)) : Z([
			d,
			{
				x: d.x,
				y: m
			},
			{
				x: f.x,
				y: m
			},
			f
		]);
		for (let e = 1; e < h.length; e += 1) ye(a, h[e - 1], h[e], l, r + t.w, i + t.h);
	}
	for (let e of t.childPlacements || []) be(e.entry, e.m, n, r + e.cx, i + e.cy, a);
	return a;
}
function xe(e) {
	return e.footprint?.length ? e.footprint : [{
		left: 0,
		right: e.w,
		top: 0,
		bottom: e.h,
		kind: "node"
	}];
}
function Se(e, t, n, r, i) {
	if (e.kind === "node" && t.kind === "node") return {
		x: n,
		y: r
	};
	let a = Math.max(5, i * (e.kind === t.kind ? .28 : .48));
	return {
		x: a,
		y: a
	};
}
function Ce(e, t) {
	return {
		rects: [],
		buckets: /* @__PURE__ */ new Map(),
		cellSize: e,
		seen: new Uint32Array(Math.max(1, t)),
		queryStamp: 0
	};
}
function we(e, t) {
	let n = e.rects.length;
	if (e.rects.push(t), n >= e.seen.length) {
		let t = new Uint32Array(e.seen.length * 2);
		t.set(e.seen), e.seen = t;
	}
	let r = Math.floor(t.left / e.cellSize), i = Math.floor(t.right / e.cellSize), a = Math.floor(t.top / e.cellSize), o = Math.floor(t.bottom / e.cellSize);
	for (let t = r; t <= i; t += 1) {
		let r = e.buckets.get(t);
		r || (r = /* @__PURE__ */ new Map(), e.buckets.set(t, r));
		for (let e = a; e <= o; e += 1) {
			let t = r.get(e);
			t || (t = [], r.set(e, t)), t.push(n);
		}
	}
}
function Te(e, t, n, r, i, a, o) {
	let s = Math.max(i, a);
	for (let c of e) {
		let e = c.left + t, l = c.right + t, u = c.top + n, d = c.bottom + n, f = Math.floor((e - s) / r.cellSize), p = Math.floor((l + s) / r.cellSize), m = Math.floor((u - s) / r.cellSize), h = Math.floor((d + s) / r.cellSize);
		r.queryStamp >= 4294967294 ? (r.seen.fill(0), r.queryStamp = 1) : r.queryStamp += 1;
		let g = r.queryStamp;
		for (let t = f; t <= p; t += 1) {
			let n = r.buckets.get(t);
			if (n) for (let t = m; t <= h; t += 1) for (let s of n.get(t) || []) {
				if (r.seen[s] === g) continue;
				r.seen[s] = g;
				let t = r.rects[s], n = Se(c, t, i, a, o);
				if (!(l + n.x <= t.left + .01 || t.right + n.x <= e + .01 || d + n.y <= t.top + .01 || t.bottom + n.y <= u + .01)) return !1;
			}
		}
	}
	return !0;
}
function Ee(e, t, n, r, i, a = 18) {
	let o = 0;
	for (let t of e) t > o && (o = t);
	let s = -Infinity, c = Infinity;
	for (let e of t) e > s && (s = e);
	for (let e of n) e < c && (c = e);
	t.size && n.length && (o = Math.max(o, Math.ceil((s + r - c) / i)));
	let l = new Uint8Array(o + 2);
	for (let t of e) t >= 0 && (l[t] = 1);
	for (let e of t) for (let t of n) {
		let n = Math.ceil((e + r - t) / i);
		n >= 0 && (l[n] = 1);
	}
	let u = [];
	for (let e = 0; e < l.length; e += 1) l[e] && u.push(e);
	if (u.length <= a) return u.map((e) => e * i);
	let d = [];
	for (let e = 0; e < a; e += 1) {
		let t = u[Math.round(e * (u.length - 1) / (a - 1))];
		t !== d[d.length - 1] && d.push(t);
	}
	return d.map((e) => e * i);
}
function De(e, t, n, r, i) {
	if (!e.length) return {
		w: 0,
		h: 0,
		columns: [],
		rows: [],
		placements: [],
		flow: "columns",
		packing: "occupancy",
		score: 0
	};
	let a = Math.max(1, i), o = K(n, a), s = K(r, a), c = e.reduce((e, t) => e + xe(t).reduce((e, t) => e + (t.right - t.left) * (t.bottom - t.top), 0), 0), l = Math.max(...e.map((e) => e.w)), u = e.reduce((e, t) => e + t.w, 0) + o * Math.max(0, e.length - 1), d = Math.sqrt(Math.max(1, c) * Math.max(.2, t)), f = /* @__PURE__ */ new Set([K(l, a), K(u, a)]);
	for (let e of [
		.62,
		.76,
		.9,
		1,
		1.12,
		1.3,
		1.55,
		1.85
	]) f.add(K(Math.max(l, d * e), a));
	let p = 0;
	e.forEach((e, t) => {
		p += e.w + (t ? o : 0), f.add(K(Math.max(l, p), a));
	});
	let m = e.map((e) => {
		let t = xe(e);
		return {
			rects: t,
			lefts: [...new Set(t.map((e) => e.left))],
			tops: [...new Set(t.map((e) => e.top))]
		};
	}), h = Math.max(64, o * 2, s * 1.2), g = m.reduce((e, t) => e + t.rects.length, 0), _ = { next: /* @__PURE__ */ new Map() }, v = null;
	for (let n of [...f].sort((e, t) => e - t)) {
		let r = [], i = Ce(h, g), l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set(), d = [0], f = [0], p = -Infinity, y = _, b = !1;
		e.forEach((e, t) => {
			let c = m[t];
			y.candidateXs || (y.candidateXs = Ee(d, l, c.lefts, o, a), y.candidateYs = Ee(f, u, c.tops, s, a), y.probes = new Int8Array(y.candidateXs.length * y.candidateYs.length));
			let { candidateXs: h, candidateYs: g, probes: _ } = y, v = null, x = -1;
			for (let t = 0; t < g.length && !v; t += 1) {
				let r = g[t];
				for (let l = 0; l < h.length; l += 1) {
					let u = h[l];
					if (u + e.w > n + .01) {
						b = !0;
						continue;
					}
					let d = t * h.length + l;
					if (_[d] === 0 && (_[d] = Te(c.rects, u, r, i, o, s, a) ? 1 : -1), _[d] === 1) {
						v = {
							item: e,
							x: u,
							y: r
						}, x = d;
						break;
					}
				}
			}
			let S = r.length ? K(p + s, a) : 0, C = v || {
				item: e,
				x: 0,
				y: S
			};
			r.push(C);
			let w = y.next.get(x);
			w || (w = { next: /* @__PURE__ */ new Map() }, y.next.set(x, w)), y = w, p = Math.max(p, C.y + e.h), d.push(Math.ceil((C.x + e.w + o) / a)), f.push(Math.ceil((C.y + e.h + s) / a));
			for (let e of c.rects) {
				let t = {
					...e,
					left: e.left + C.x,
					right: e.right + C.x,
					top: e.top + C.y,
					bottom: e.bottom + C.y
				};
				we(i, t), l.add(t.right), u.add(t.bottom);
			}
		});
		let x = Math.max(...r.map((e) => e.x + e.item.w)), S = Math.max(...r.map((e) => e.y + e.item.h)), C = [...new Set(r.map((e) => e.y))].sort((e, t) => e - t), w = C.map((e) => {
			let t = r.filter((t) => t.y === e), n = Math.min(...t.map((e) => e.x)), i = Math.max(...t.map((e) => e.x + e.item.w));
			return {
				cells: t.map((e) => e.item),
				w: i - n,
				h: Math.max(...t.map((e) => e.item.h)),
				y: e
			};
		}), T = [...new Set(r.map((e) => e.x))].sort((e, t) => e - t).map((e, t) => {
			let n = r.filter((t) => t.x === e).sort((e, t) => e.y - t.y);
			for (let e of n) e.column = t, e.columnWidth = Math.max(...n.map((e) => e.item.w));
			return {
				cells: n.map((e) => e.item),
				w: Math.max(...n.map((e) => e.item.w)),
				h: Math.max(...n.map((e) => e.y + e.item.h)) - Math.min(...n.map((e) => e.y))
			};
		});
		w.forEach((e, t) => {
			r.filter((t) => t.y === e.y).forEach((n) => {
				n.row = t, n.rowHeight = e.h;
			});
		});
		let E = me(x, S, t, c, C.length) + Math.max(0, n - x) / Math.max(1, x) * .01, D = {
			w: x,
			h: S,
			rows: w,
			columns: T,
			placements: r,
			score: E,
			flow: "columns",
			packing: "occupancy",
			mouldWidth: n
		};
		if ((!v || E < v.score - 1e-9 || Math.abs(E - v.score) < 1e-9 && S < v.h - .01 || Math.abs(E - v.score) < 1e-9 && Math.abs(S - v.h) < .01 && x < v.w) && (v = D), !b) break;
	}
	return v;
}
function Oe(e, t, n = e.w / 2) {
	let r = (e.placements || []).map((e) => [e.x, e.x + e.item.w]).sort((e, t) => e[0] - t[0] || e[1] - t[1]);
	if (!r.length) return null;
	let i = [];
	for (let e of r) {
		let t = i[i.length - 1];
		!t || e[0] > t[1] + .01 ? i.push(e.slice()) : t[1] = Math.max(t[1], e[1]);
	}
	let a = [];
	for (let e = 1; e < i.length; e += 1) {
		let r = i[e - 1][1], o = i[e][0];
		o - r >= t && a.push({
			x: (r + o) / 2,
			distance: Math.abs((r + o) / 2 - n)
		});
	}
	return a.sort((e, t) => e.distance - t.distance || e.x - t.x), a[0]?.x ?? null;
}
function ke(e, t, n = e.w / 2) {
	let r = e.placements || [], i = [...new Set(r.map((e) => e.y))].sort((e, t) => e - t);
	if (i.length < 2) return null;
	let a = r.filter((e) => Math.abs(e.y - i[0]) < .01).sort((e, t) => e.x - t.x), o = i.at(-1), s = [];
	for (let e = 1; e < a.length; e += 1) {
		let i = a[e - 1].x + a[e - 1].item.w, c = a[e].x;
		if (c - i < t) continue;
		let l = (i + c) / 2;
		r.some((e) => e.y < o - .01 && l > e.x + .01 && l < e.x + e.item.w - .01) || s.push({
			x: l,
			distance: Math.abs(l - n)
		});
	}
	return s.sort((e, t) => e.distance - t.distance || e.x - t.x), s[0]?.x ?? null;
}
function Ae(e, t, n, r) {
	let i = Oe(e, r, t);
	if (i != null) return i;
	let a = e.placements || [], o = a.length ? Math.min(...a.map((e) => e.x)) : 0, s = a.length ? Math.max(...a.map((e) => e.x + e.item.w)) : e.w, c = o - n, l = s + n;
	return Math.abs(t - c) <= Math.abs(t - l) ? c : l;
}
function q(e, t) {
	let n = e[e.length - 1];
	(!n || Math.abs(n.x - t.x) > .01 || Math.abs(n.y - t.y) > .01) && e.push(t);
}
var je = /\b(municipal (vice )?mayor|office head|department head|head of office)\b/i;
function Me(e) {
	let t = e?.data || {};
	return t.printRole === "head" || t.is_head === !0 || t.isHead === !0 || je.test(String(e?.label || ""));
}
function J(e) {
	return Me(e?.node);
}
function Ne(e) {
	let t = e.data || {}, n = {};
	for (let e of [
		"printRole",
		"is_head",
		"isHead"
	]) t[e] !== void 0 && (n[e] = t[e]);
	let r = String(e.label || "");
	return {
		id: e.id,
		parentId: e.parentId,
		type: e.type,
		label: je.test(r) ? r : "",
		width: e.width,
		height: e.height,
		collapsed: e.collapsed,
		layoutMode: e.layoutMode,
		data: n
	};
}
function Pe(e, t, n = 0) {
	let r = 0, i = 0;
	for (let t of e.children) J(t) || (t.children.length === 0 ? r += 1 : i += 1);
	let a = t.subtreeMode === "GridSmart" && n <= 1 && !e.node.isVirtual && (i >= 4 || fe(e, t, n));
	return r && i && !a ? !0 : e.children.some((e) => Pe(e, t, n + 1));
}
function Fe(e) {
	let t = e.children.filter((e) => !J(e));
	return (t.length === 5 && t.length === e.children.length && t.every((e) => e.children.length === 0) ? 1 : 0) + e.children.reduce((e, t) => e + Fe(t), 0);
}
function Ie(e, t, n, r, i, a) {
	let o = e.node, s = H(o, n), c = o.isVirtual ? 0 : U(o, n), l = n.spacingY * (n.autoSpacingYScale || 1), u = Math.max(12, n.spacingX), d = n.subtreeMode === "GridSmart" ? Math.max(n.gridSize * 2, l * .55) : Math.max(16, l * .55), f = o.isVirtual ? 0 : l, p = [], m = [], h = [];
	e.children.forEach((e, n) => {
		let r = {
			index: n,
			entry: e,
			m: t[n],
			w: t[n].w,
			h: t[n].h
		};
		J(e) ? p.push(r) : e.children.length === 0 ? m.push(r) : h.push(r);
	});
	let g = fe(e, n, a), _ = n.subtreeMode === "GridSmart" && a <= 1 && !o.isVirtual && (h.length >= 4 || g), v = (n.leafFlow === "band" || _) && m.length > 0 && h.length > 0 && (r >= .8 || _), y = ge(m, v ? G(r * 1.8, 1.8, 5) : i, u, d, n.preferFiveLeafRank && n.visualTargetAspect >= .8 && p.length === 0 && h.length === 0 && m.length === 5 ? m.length : 1), b = ge(p, Math.max(1, r), u, d), x = [];
	if (m.length && !v) {
		let e = {
			kind: "leaves",
			w: y.w,
			h: y.h,
			pack: y
		};
		n.subtreeMode === "GridSmart" && (e.footprint = y.placements.flatMap((e) => be(e.item.entry, e.item.m, n, e.x, e.y))), x.push(e);
	}
	h.forEach((e) => {
		let t = {
			kind: "branch",
			w: e.w,
			h: e.h,
			item: e
		};
		n.subtreeMode === "GridSmart" && (t.footprint = be(e.entry, e.m, n)), x.push(t);
	});
	let S = u * 1.25, C = d * 1.25, w = ge(x, r, S, C, g ? x.length : 1, !!n.preferShortFirst, !!n.flexibleRows, _ && n.visualTargetAspect < 1.3 ? .75 : .5), T = x.some((e) => e.kind === "leaves"), E = n.blockFlow === "rows" || !T ? null : _e(x, r, S, C), D = n.blockFlow === "rows" || n.blockFlow === "columns" || !T ? null : ve(x, r, S, C), ee = n.subtreeMode === "GridSmart" ? De(x, r, S, C, n.gridSize) : null, te = [
		w,
		E,
		D,
		ee
	].filter(Boolean).sort((e, t) => e.score - t.score || Number(e.flow === "columns") - Number(t.flow === "columns"))[0], O = _ && (x.length >= 4 || g) && x.every((e) => e.kind === "branch"), k = n.subtreeMode === "GridSmart" ? O ? w : ee : n.blockFlow === "columns" ? E || w : n.blockFlow === "masonry" ? D || w : n.blockFlow === "adaptive" ? te : w, A = g ? k.placements[Math.floor(k.placements.length / 2)] : null, j = A?.item.kind === "branch" ? A.x + A.item.item.m.nodeCenterX : null, M = j == null ? 0 : Math.max(j, k.w - j) * 2, N = Math.max(s, b.w, v ? y.w : 0, k.w, M), P = j == null ? (N - k.w) / 2 : N / 2 - j, F = N / 2;
	if (n.subtreeMode === "GridSmart" && p.length === 0 && h.length === 0 && m.length > 1 && y.rows.length > 1) {
		let e = k.placements.find((e) => e.item.kind === "leaves"), t = ke(y, Math.max(8, u * .28), y.w / 2);
		if (e && t != null) {
			let n = P + e.x + t;
			n - s / 2 >= -.01 && n + s / 2 <= N + .01 && (F = n);
		}
	}
	let ne = c + f, I = p.length ? ne + b.h + f : c + f, L = v ? I + y.h + f : I, R = [], re = [], ie = (N - b.w) / 2;
	for (let e of b.placements || []) R.push({
		entry: e.item.entry,
		cx: ie + e.x,
		cy: ne + e.y,
		m: e.item.m
	}), re.push({
		childId: e.item.entry.node.id,
		routeType: "bus"
	});
	let z = c + Math.max(10, f * .38), ae = ie - u * .35, oe = p.length ? ne + b.h + Math.max(10, f * .38) : z, se = p.length ? [
		{
			x: F,
			y: z
		},
		{
			x: ae,
			y: z
		},
		{
			x: ae,
			y: oe
		}
	] : [], B = p.length ? se.slice() : [{
		x: F,
		y: z
	}], V = B;
	if (v) {
		let e = (N - y.w) / 2, t = B.at(-1).x, n = e + Ae(y, t - e, u * .55, Math.max(8, u * .28)), r = B.at(-1).y;
		for (let t of y.placements) {
			let i = t.item, a = e + t.x, o = I + t.y, s = a + i.m.nodeCenterX, c = o - Math.max(9, d * .34);
			R.push({
				entry: i.entry,
				cx: a,
				cy: o,
				m: i.m
			}), re.push({
				childId: i.entry.node.id,
				routeType: "packed",
				points: [
					...B,
					{
						x: n,
						y: r
					},
					{
						x: n,
						y: c
					},
					{
						x: s,
						y: c
					}
				]
			});
		}
		V = [
			...B,
			{
				x: n,
				y: r
			},
			{
				x: n,
				y: L - Math.max(10, d * .34)
			}
		];
	}
	let ce = k.flow === "columns", le = ce ? k.columns.some((e) => e.cells.length > 1) : k.rows.length > 1, W = /* @__PURE__ */ new Map();
	if (le && !ce) {
		let e = V.slice(), t = e.at(-1).x, n = e.at(-1).y;
		for (let r = 0; r < k.rows.length; r += 1) {
			let i = k.placements.filter((e) => e.row === r);
			k.rows[r];
			let a = P + Ae({
				w: k.w,
				placements: i
			}, F - P, u * .55, Math.max(8, u * .28)), o = L + (i[0]?.y || 0), s = r > 0 ? k.rows[r - 1] : null, c = r > 0 ? k.placements.filter((e) => e.row === r - 1) : [], l = s ? L + (c[0]?.y || 0) + s.h : n, f = r === 0 ? n : (l + o) / 2;
			q(e, {
				x: t,
				y: f
			}), q(e, {
				x: a,
				y: f
			});
			let p = o - Math.max(10, d * .34);
			q(e, {
				x: a,
				y: p
			});
			for (let t of i) W.set(t, e.slice());
			t = a, n = p;
		}
	}
	if (ce) {
		let e = k.placements.slice().sort((e, t) => e.y - t.y || e.x - t.x), t = V.slice(), n = t.at(-1).x, r = t.at(-1).y;
		for (let i of e) {
			let e = L + i.y, a = e + i.item.h, o = P + Ae({
				w: k.w,
				placements: [i]
			}, F - P, u * .55, Math.max(8, u * .28));
			if (e >= r + Math.max(8, d * .18)) {
				let i = (r + e) / 2;
				q(t, {
					x: n,
					y: i
				}), q(t, {
					x: o,
					y: i
				});
			} else t = V.slice(), q(t, {
				x: o,
				y: t.at(-1).y
			});
			q(t, {
				x: o,
				y: e - Math.max(10, d * .34)
			}), W.set(i, t.slice()), n = o, r = Math.max(r, a);
		}
	}
	for (let e of k.placements || []) {
		let t = P + e.x, n = L + e.y, r = W.get(e);
		if (e.item.kind === "branch") {
			let i = e.item.item, a = t + i.m.nodeCenterX;
			R.push({
				entry: i.entry,
				cx: t,
				cy: n,
				m: i.m
			}), re.push({
				childId: i.entry.node.id,
				routeType: "bus",
				points: r ? [...r, {
					x: a,
					y: n - Math.max(10, d * .34)
				}] : [...V, {
					x: a,
					y: V.at(-1).y
				}]
			});
			continue;
		}
		let i = e.item.pack, a = t + Ae(i, (r ? r.at(-1).x : F) - t, u * .55, Math.max(8, u * .28));
		for (let e of i.placements) {
			let i = e.item, o = t + e.x, s = n + e.y, c = o + i.m.nodeCenterX, l = s - Math.max(9, d * .34), u = a;
			R.push({
				entry: i.entry,
				cx: o,
				cy: s,
				m: i.m
			}), re.push({
				childId: i.entry.node.id,
				routeType: "packed",
				points: r ? [
					...r,
					{
						x: a,
						y: n - Math.max(10, d * .34)
					},
					{
						x: a,
						y: l
					},
					{
						x: c,
						y: l
					}
				] : [
					...p.length ? se : [{
						x: F,
						y: z
					}],
					{
						x: u,
						y: p.length ? oe : z
					},
					{
						x: u,
						y: l
					},
					{
						x: c,
						y: l
					}
				]
			});
		}
	}
	return {
		w: N,
		h: x.length ? L + k.h : ne + b.h,
		anchorLeft: F,
		anchorRight: N - F,
		nodeCenterX: F,
		nodeCenterY: c / 2,
		childPlacements: R,
		edgeRoutes: re,
		resolvedMode: n.subtreeMode === "GridSmart" ? "GridSmart" : "AutoSmart"
	};
}
function Le(e, t, n, r) {
	let i = e.node, a = H(i, r), o = i.isVirtual ? 0 : U(i, r), s = n === "Center" ? r.spacingX * .5 : r.spacingX, c = [], l = 0;
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
function Re(e, t, n, r) {
	let i = e.node, a = H(i, r), o = i.isVirtual ? 0 : U(i, r), s = n !== "AlternateRight", c = n === "Alternate", l = Math.max(16, r.spacingY * .45), u = o + (i.isVirtual ? 0 : r.spacingY), d = (t.length ? t[0].h : 0) / 2 + l / 2, f = u, p = u;
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
	let x = Math.max(f, p) - l, S = Math.max(v + 26 + _, v + a / 2);
	return {
		w: S,
		h: Math.max(x, u),
		anchorLeft: v,
		anchorRight: S - v,
		nodeCenterX: v,
		nodeCenterY: o / 2,
		childPlacements: y,
		edgeRoutes: b
	};
}
function Y(e) {
	let t = [];
	for (let n of e || []) {
		let e = {
			x: Number(n.x),
			y: Number(n.y)
		};
		if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) continue;
		let r = t[t.length - 1];
		(!r || Math.abs(r.x - e.x) > .01 || Math.abs(r.y - e.y) > .01) && t.push(e);
	}
	return t;
}
function X(e, t, n) {
	if (!V(n)) {
		let n = t.cy >= e.cy;
		return {
			start: {
				x: e.cx,
				y: e.cy + (n ? e.node.height / 2 : -e.node.height / 2)
			},
			end: {
				x: t.cx,
				y: t.cy + (n ? -t.node.height / 2 : t.node.height / 2)
			}
		};
	}
	let r = t.cx >= e.cx;
	return {
		start: {
			x: e.cx + (r ? e.node.width / 2 : -e.node.width / 2),
			y: e.cy
		},
		end: {
			x: t.cx + (r ? -t.node.width / 2 : t.node.width / 2),
			y: t.cy
		}
	};
}
function ze(e, t) {
	let n = [e[0]];
	for (let r = 1; r < e.length; r += 1) {
		let i = n[n.length - 1], a = e[r];
		Math.abs(i.x - a.x) > .01 && Math.abs(i.y - a.y) > .01 && n.push(t ? {
			x: a.x,
			y: i.y
		} : {
			x: i.x,
			y: a.y
		}), n.push(a);
	}
	return Y(n);
}
function Z(e) {
	let t = Y(e), n = !0;
	for (; n && t.length > 2;) {
		n = !1;
		for (let e = 1; e < t.length - 1; e += 1) {
			let r = t[e - 1], i = t[e], a = t[e + 1], o = Math.abs(r.x - i.x) < .01 && Math.abs(i.x - a.x) < .01, s = Math.abs(r.y - i.y) < .01 && Math.abs(i.y - a.y) < .01;
			if (o || s) {
				t.splice(e, 1), n = !0;
				break;
			}
		}
	}
	return Y(t);
}
function Be(e, t) {
	let n = .01;
	return e.x > t.left + n && e.x < t.right - n && e.y > t.top + n && e.y < t.bottom - n;
}
function Ve(e, t, n) {
	let r = .01;
	return Math.abs(e.x - t.x) < r ? e.x > n.left + r && e.x < n.right - r && Math.max(e.y, t.y) > n.top + r && Math.min(e.y, t.y) < n.bottom - r : Math.abs(e.y - t.y) < r ? e.y > n.top + r && e.y < n.bottom - r && Math.max(e.x, t.x) > n.left + r && Math.min(e.x, t.x) < n.right - r : !0;
}
function He(e, t) {
	for (let n = 1; n < e.length; n += 1) if (t.some((t) => Ve(e[n - 1], e[n], t))) return !0;
	return !1;
}
var Ue = class {
	constructor() {
		this.items = [];
	}
	push(e) {
		let t = this.items;
		t.push(e);
		let n = t.length - 1;
		for (; n > 0;) {
			let r = Math.floor((n - 1) / 2);
			if (t[r].priority <= e.priority) break;
			t[n] = t[r], n = r;
		}
		t[n] = e;
	}
	pop() {
		let e = this.items;
		if (!e.length) return null;
		let t = e[0], n = e.pop();
		if (e.length) {
			let t = 0;
			for (;;) {
				let r = t * 2 + 1, i = r + 1;
				if (r >= e.length) break;
				let a = i < e.length && e[i].priority < e[r].priority ? i : r;
				if (e[a].priority >= n.priority) break;
				e[t] = e[a], t = a;
			}
			e[t] = n;
		}
		return t;
	}
};
function We(e, t, n, r, i = null) {
	let a = X(e, t, r), { start: o, end: s } = i || a, c = i?.reservedPaths || [], l = Math.max(6, Math.min(r.spacingX, r.spacingY) * .16), u = Math.max(10, Math.min(r.spacingX, r.spacingY) * .22), d = V(r), f = Math.abs(o.x - a.start.x) < .01 && Math.abs(o.y - a.start.y) < .01, p = Math.abs(s.x - a.end.x) < .01 && Math.abs(s.y - a.end.y) < .01, m = d ? a.end.x >= a.start.x ? 1 : -1 : a.end.y >= a.start.y ? 1 : -1, h = f ? d ? {
		x: o.x + m * u,
		y: o.y
	} : {
		x: o.x,
		y: o.y + m * u
	} : o, g = p ? d ? {
		x: s.x - m * u,
		y: s.y
	} : {
		x: s.x,
		y: s.y - m * u
	} : s, _ = n.map((n) => {
		let r = n.node.id === e.node.id || n.node.id === t.node.id ? 0 : l;
		return {
			left: n.cx - n.node.width / 2 - r,
			right: n.cx + n.node.width / 2 + r,
			top: n.cy - n.node.height / 2 - r,
			bottom: n.cy + n.node.height / 2 + r
		};
	}), v = [.../* @__PURE__ */ new Set([
		o.x,
		s.x,
		h.x,
		g.x,
		..._.flatMap((e) => [e.left, e.right])
	])].sort((e, t) => e - t), y = [.../* @__PURE__ */ new Set([
		o.y,
		s.y,
		h.y,
		g.y,
		..._.flatMap((e) => [e.top, e.bottom])
	])].sort((e, t) => e - t), b = v.indexOf(h.x), x = y.indexOf(h.y), S = v.indexOf(g.x), C = y.indexOf(g.y), w = v.length, T = (e, t, n) => (t * w + e) * 3 + n, E = w * y.length * 3, D = new Float64Array(E).fill(Infinity), ee = new Int32Array(E).fill(-1), te = new Int8Array(w * y.length * 4), O = new Ue(), k = T(b, x, 0);
	D[k] = 0, O.push({
		x: b,
		y: x,
		direction: 0,
		cost: 0,
		priority: 0
	});
	let A = -1, j = Math.max(20, Math.min(r.spacingX, r.spacingY) * .6);
	for (; O.items.length;) {
		let e = O.pop(), t = T(e.x, e.y, e.direction);
		if (e.cost !== D[t]) continue;
		if (e.x === S && e.y === C) {
			A = t;
			break;
		}
		let n = [
			{
				x: e.x - 1,
				y: e.y,
				direction: 1
			},
			{
				x: e.x + 1,
				y: e.y,
				direction: 1
			},
			{
				x: e.x,
				y: e.y - 1,
				direction: 2
			},
			{
				x: e.x,
				y: e.y + 1,
				direction: 2
			}
		], r = {
			x: v[e.x],
			y: y[e.y]
		};
		for (let i = 0; i < n.length; i += 1) {
			let a = n[i];
			if (a.x < 0 || a.x >= v.length || a.y < 0 || a.y >= y.length) continue;
			let o = {
				x: v[a.x],
				y: y[a.y]
			}, s = (e.y * w + e.x) * 4 + i;
			if (te[s] === 0 && (te[s] = _.some((e) => Be(o, e) || Ve(r, o, e)) || c.some((e) => {
				for (let t = 1; t < e.length; t += 1) if (qe(r, o, e[t - 1], e[t]) || Ye(r, o, e[t - 1], e[t])) return !0;
				return !1;
			}) ? -1 : 1), te[s] === -1) continue;
			let l = Math.abs(o.x - r.x) + Math.abs(o.y - r.y), u = e.direction && e.direction !== a.direction ? j : 0, d = e.cost + l + u, f = T(a.x, a.y, a.direction);
			if (d >= D[f]) continue;
			D[f] = d, ee[f] = t;
			let p = Math.abs(g.x - o.x) + Math.abs(g.y - o.y);
			O.push({
				...a,
				cost: d,
				priority: d + p
			});
		}
	}
	if (A < 0) return null;
	let M = [];
	for (let e = A; e >= 0; e = ee[e]) {
		let t = Math.floor(e / 3);
		M.push({
			x: v[t % w],
			y: y[Math.floor(t / w)]
		});
	}
	M.reverse();
	let N = [];
	for (let e of M) {
		let t = N[N.length - 1], n = N[N.length - 2];
		n && t && (Math.abs(n.x - t.x) < .01 && Math.abs(t.x - e.x) < .01 || Math.abs(n.y - t.y) < .01 && Math.abs(t.y - e.y) < .01) ? N[N.length - 1] = e : N.push(e);
	}
	return Z([
		...f ? [o] : [],
		...N,
		...p ? [s] : []
	]);
}
function Ge(e, t) {
	let n = new Map(e.map((e) => [String(e.node.id), e]));
	for (let r of e) {
		if (!r.parentId) continue;
		let i = n.get(String(r.parentId));
		if (!i) continue;
		let { start: a, end: o } = X(i, r, t);
		if (!He(ze([
			a,
			...r.routePoints || [],
			o
		], V(t)), e.filter((e) => e.node.id !== i.node.id && e.node.id !== r.node.id).map((e) => ({
			left: e.cx - e.node.width / 2,
			right: e.cx + e.node.width / 2,
			top: e.cy - e.node.height / 2,
			bottom: e.cy + e.node.height / 2
		})))) continue;
		let s = We(i, r, e, t);
		s?.length > 2 && (r.routeType = "packed", r.routePoints = s.slice(1, -1));
	}
}
function Ke(e, t) {
	return {
		x: (e.x + t.x) / 2,
		y: (e.y + t.y) / 2
	};
}
function qe(e, t, n, r) {
	let i = Math.abs(e.y - t.y) < .01;
	if (i === Math.abs(n.y - r.y) < .01) return !1;
	let a = i ? [e, t] : [n, r], o = i ? [n, r] : [e, t];
	return o[0].x > Math.min(a[0].x, a[1].x) + .01 && o[0].x < Math.max(a[0].x, a[1].x) - .01 && a[0].y > Math.min(o[0].y, o[1].y) + .01 && a[0].y < Math.max(o[0].y, o[1].y) - .01;
}
function Je(e, t) {
	for (let n = 1; n < e.length; n += 1) for (let r = 1; r < t.length; r += 1) if (qe(e[n - 1], e[n], t[r - 1], t[r])) return !0;
	return !1;
}
function Ye(e, t, n, r) {
	let i = Math.abs(e.y - t.y) < .01;
	return i === Math.abs(n.y - r.y) < .01 ? i ? Math.abs(e.y - n.y) >= .01 ? !1 : Math.min(Math.max(e.x, t.x), Math.max(n.x, r.x)) - Math.max(Math.min(e.x, t.x), Math.min(n.x, r.x)) > .01 : Math.abs(e.x - n.x) >= .01 ? !1 : Math.min(Math.max(e.y, t.y), Math.max(n.y, r.y)) - Math.max(Math.min(e.y, t.y), Math.min(n.y, r.y)) > .01 : !1;
}
function Xe(e, t) {
	for (let n = 1; n < e.length; n += 1) for (let r = 1; r < t.length; r += 1) if (Ye(e[n - 1], e[n], t[r - 1], t[r])) return !0;
	return !1;
}
function Ze(e, t) {
	let n = Math.min(e.length, t.length), r = [];
	for (let i = 0; i < n; i += 1) {
		let n = e[i];
		if (Math.abs(t[i].x - n.x) >= .01 || Math.abs(t[i].y - n.y) >= .01) break;
		r.push(n);
	}
	return Z(r);
}
function Qe(e) {
	let t = e.map((e) => ({
		child: e,
		points: Y(e.routePoints || [])
	})), n = /* @__PURE__ */ new Map();
	for (let e of t) {
		let r = e.points.slice(0, 1);
		for (let n of t) {
			if (n === e || !e.points.length || !n.points.length) continue;
			let t = Ze(e.points, n.points);
			t.length > r.length && (r = t);
		}
		n.set(String(e.child.node.id), r);
	}
	return n;
}
function $e(e, t, n) {
	let r = e.routePoints;
	if (!r?.length) return;
	let i = X(t, e, n), a = V(n), o = Math.max(10, Math.min(n.spacingX, n.spacingY) * .22), s = Math.max(1, n.gridSize), c = r.at(-1);
	if (!a) {
		let e = i.end.y >= i.start.y, t = e ? i.end.y - o : i.end.y + o, n = e ? Math.floor(t / s) * s : Math.ceil(t / s) * s;
		if (e && c.y <= n || !e && c.y >= n) return;
		let a = c.y;
		for (let e = r.length - 1; e >= 0 && Math.abs(r[e].y - a) < .01; --e) r[e] = {
			...r[e],
			y: n
		};
		return;
	}
	let l = i.end.x >= i.start.x, u = l ? i.end.x - o : i.end.x + o, d = l ? Math.floor(u / s) * s : Math.ceil(u / s) * s;
	if (l && c.x <= d || !l && c.x >= d) return;
	let f = c.x;
	for (let e = r.length - 1; e >= 0 && Math.abs(r[e].x - f) < .01; --e) r[e] = {
		...r[e],
		x: d
	};
}
function et(e, t) {
	let n = new Map(e.map((e) => [String(e.node.id), e])), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
	for (let a of e) {
		if (!a.parentId || !n.has(String(a.parentId))) continue;
		let e = String(a.parentId);
		r.has(e) || r.set(e, []), r.get(e).push(a);
		let o = n.get(e);
		$e(a, o, t);
		let s = X(o, a, t);
		i.set(String(a.node.id), Z(ze([
			s.start,
			...a.routePoints || [],
			s.end
		], V(t))));
	}
	for (let [a, o] of r) {
		let r = n.get(a), s = Qe(o.filter((e) => !J({ node: e.node })));
		for (let n of o) {
			if (J({ node: n.node })) continue;
			let o = X(r, n, t), c = s.get(String(n.node.id)) || Y(n.routePoints || []).slice(0, 1), l = We(r, n, e, t, {
				start: c.at(-1) || o.start,
				end: o.end
			});
			if (!l || l.length < 2) continue;
			let u = Z(ze(Y([
				o.start,
				...c,
				...l.slice(1)
			]), V(t)));
			u.length < 2 || e.some((e) => {
				if (!e.parentId || String(e.parentId) === a || e.node.id === n.node.id) return !1;
				let t = i.get(String(e.node.id));
				return t ? Je(u, t) || Xe(u, t) : !1;
			}) || (n.routeType = "packed", n.routePoints = u.length > 2 ? u.slice(1, -1) : [Ke(u[0], u[1])], i.set(String(n.node.id), u));
		}
	}
	for (let t of e) {
		let e = i.get(String(t.node.id));
		!e || e.length < 2 || J({ node: t.node }) || (t.routeType = "packed", t.routePoints = e.length > 2 ? e.slice(1, -1) : [Ke(e[0], e[1])]);
	}
	return Ge(e, t), nt(e, t), at(e, t), gt(e, t);
}
function tt(e, t, n) {
	let r = X(e, t, n);
	return Z(ze([
		r.start,
		...t.routePoints || [],
		r.end
	], V(n)));
}
function nt(e, t) {
	let n = new Map(e.map((e) => [String(e.node.id), e])), r = e.map((e) => {
		let t = e.parentId == null ? null : n.get(String(e.parentId));
		return t ? {
			child: e,
			parent: t,
			parentId: String(e.parentId)
		} : null;
	}).filter(Boolean), i = /* @__PURE__ */ new Map();
	for (let e of r) i.set(e.parentId, (i.get(e.parentId) || 0) + 1);
	let a = (e) => {
		let t = 0, r = e, i = /* @__PURE__ */ new Set();
		for (; r?.parentId != null && !i.has(String(r.node.id));) i.add(String(r.node.id)), r = n.get(String(r.parentId)), t += 1;
		return t;
	}, o = /* @__PURE__ */ new Map(), s = (e) => {
		let n = o.get(e);
		return n || (n = tt(e.parent, e.child, t), o.set(e, n)), n;
	}, c = new Map(r.map((e, t) => [e, t])), l = new Int8Array(r.length * r.length), u = (e, t) => {
		let n = r[e], i = r[t];
		if (n.parentId === i.parentId) return !1;
		let a = e * r.length + t;
		if (l[a] === 0) {
			let e = s(n), t = s(i);
			l[a] = Je(e, t) || Xe(e, t) ? 1 : -1;
		}
		return l[a] === 1;
	}, d = (e) => {
		o.delete(e);
		let t = c.get(e);
		for (let e = 0; e < r.length; e += 1) l[t * r.length + e] = 0, l[e * r.length + t] = 0;
	}, f = Math.max(1, r.length * 2);
	for (let n = 0; n < f; n += 1) {
		let n = null;
		for (let e = 0; e < r.length && !n; e += 1) for (let t = e + 1; t < r.length; t += 1) if (u(e, t)) {
			n = [r[e], r[t]];
			break;
		}
		if (!n) return;
		let o = n.slice().sort((e, t) => {
			let n = i.has(String(e.child.node.id)) || e.child.node.type === "department", r = i.has(String(t.child.node.id)) || t.child.node.type === "department";
			return Number(n) - Number(r) || a(t.child) - a(e.child);
		}), c = !1;
		for (let n of o) {
			let i = r.filter((e) => e !== n && e.parentId !== n.parentId).map(s), a = X(n.parent, n.child, t), o = We(n.parent, n.child, e, t, {
				...a,
				reservedPaths: i
			});
			if (!o || o.length < 2) continue;
			let l = Z(o);
			if (!(l.length < 2) && !i.some((e) => Je(l, e) || Xe(l, e))) {
				n.child.routeType = "packed", n.child.routePoints = l.length > 2 ? l.slice(1, -1) : [Ke(l[0], l[1])], d(n), c = !0;
				break;
			}
		}
		if (!c) return;
	}
}
function rt(e) {
	let t = 0;
	for (let n = 1; n < e.length; n += 1) t += Math.abs(e[n].x - e[n - 1].x) + Math.abs(e[n].y - e[n - 1].y);
	return t;
}
function it(e) {
	let t = 0;
	for (let n = 2; n < e.length; n += 1) Math.abs(e[n - 2].y - e[n - 1].y) < .01 != Math.abs(e[n - 1].y - e[n].y) < .01 && (t += 1);
	return t;
}
function at(e, t) {
	let n = new Map(e.map((e) => [String(e.node.id), e])), r = e.map((e) => {
		let t = e.parentId == null ? null : n.get(String(e.parentId));
		return t ? {
			child: e,
			parent: t,
			parentId: String(e.parentId)
		} : null;
	}).filter(Boolean), i = /* @__PURE__ */ new Map();
	for (let e of r) i.has(e.parentId) || i.set(e.parentId, []), i.get(e.parentId).push(e);
	let a = new Map(r.map((e) => [String(e.child.node.id), tt(e.parent, e.child, t)])), o = V(t);
	for (let t of r) {
		if (J({ node: t.child.node })) continue;
		let n = String(t.child.node.id), s = a.get(n);
		if (!s || s.length < 3) continue;
		let c = 0;
		for (let e of i.get(t.parentId) || []) {
			if (e === t) continue;
			let n = Ze(s, a.get(String(e.child.node.id)) || []);
			c = Math.max(c, n.length - 1);
		}
		let l = e.filter((e) => e.node.id !== t.parent.node.id && e.node.id !== t.child.node.id).map((e) => ({
			left: e.cx - e.node.width / 2,
			right: e.cx + e.node.width / 2,
			top: e.cy - e.node.height / 2,
			bottom: e.cy + e.node.height / 2
		})), u = s.at(-1), d = rt(s), f = it(s), p = s, m = (e) => r.some((n) => {
			if (n === t || n.parentId === t.parentId) return !1;
			let r = a.get(String(n.child.node.id));
			return r && (Je(e, r) || Xe(e, r));
		}), h = [s[0], u];
		(o ? Math.abs(h[0].y - h[1].y) < .01 : Math.abs(h[0].x - h[1].x) < .01) && !He(h, l) && !m(h) && (p = h);
		for (let e = c; e < s.length - 1; e += 1) {
			let t = s[e], n = o ? Math.abs(t.y - u.y) < .01 ? [t, u] : [
				t,
				{
					x: t.x,
					y: u.y
				},
				u
			] : Math.abs(t.x - u.x) < .01 ? [t, u] : [
				t,
				{
					x: u.x,
					y: t.y
				},
				u
			], r = Z([...s.slice(0, e), ...n]);
			if (r.length < 2) continue;
			let i = rt(r), a = it(r), c = Math.abs(r[0].y - r[1].y) < .01, h = Math.abs(r.at(-2).y - r.at(-1).y) < .01;
			if (c !== o || h !== o || a > f || a === f && i >= d - .01 || He(r, l) || m(r)) continue;
			let g = rt(p), _ = it(p);
			(a < _ || a === _ && i < g - .01) && (p = r);
		}
		p !== s && (t.child.routeType = "packed", t.child.routePoints = p.length > 2 ? p.slice(1, -1) : [Ke(p[0], p[1])], a.set(n, p));
	}
}
function Q(e, t) {
	return t ? {
		cross: e.y,
		flow: e.x
	} : {
		cross: e.x,
		flow: e.y
	};
}
function ot(e, t, n) {
	return n ? {
		x: t,
		y: e
	} : {
		x: e,
		y: t
	};
}
function st(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) for (let e = 1; e < n.length; e += 1) {
		let r = n[e - 1], i = n[e], a = Math.abs(r.y - i.y) < .01, o = a ? r.y : r.x, s = Math.min(a ? r.x : r.y, a ? i.x : i.y), c = Math.max(a ? r.x : r.y, a ? i.x : i.y);
		if (c - s < .01) continue;
		let l = `${a ? "h" : "v"}:${o.toFixed(3)}`;
		t.has(l) || t.set(l, []), t.get(l).push([s, c]);
	}
	let n = 0;
	for (let e of t.values()) {
		e.sort((e, t) => e[0] - t[0]);
		let [t, r] = e[0];
		for (let [i, a] of e.slice(1)) i <= r + .01 ? r = Math.max(r, a) : (n += r - t, t = i, r = a);
		n += r - t;
	}
	return n;
}
function ct(e, t) {
	let n = e.reduce((e, t) => e + it(t), 0), r = Math.max(10, Math.min(t.spacingX, t.spacingY) * .22), i = e.reduce((e, t) => {
		if (t.length <= 2) return e;
		let n = t.at(-2), i = t.at(-1), a = Math.abs(n.x - i.x) + Math.abs(n.y - i.y);
		return e + Math.max(0, a - r);
	}, 0);
	return st(e) + n * Math.max(12, Math.min(t.spacingX, t.spacingY) * .45) + i;
}
function lt(e) {
	let t = e?.segments || [];
	for (let e = 0; e < t.length; e += 1) {
		let n = t[e], r = new Set((n.childIds || []).map(String));
		for (let i = e + 1; i < t.length; i += 1) {
			let e = t[i];
			if (!(e.childIds || []).some((e) => r.has(String(e))) && qe(n.a, n.b, e.a, e.b)) {
				let t = Math.abs(n.a.y - n.b.y) < .01, r = t ? n : e;
				return {
					first: n,
					second: e,
					point: {
						x: (t ? e : n).a.x,
						y: r.a.y
					}
				};
			}
		}
	}
	return null;
}
function ut(e, t, n, r) {
	return se(e, t.map((e, t) => ({
		id: String(e.node.id),
		points: n[t]
	})), { horizontalFlow: r });
}
function dt(e, t, n) {
	return Math.abs(t.y - n.y) < .01 ? Math.abs(e.y - t.y) < .01 && e.x >= Math.min(t.x, n.x) - .01 && e.x <= Math.max(t.x, n.x) + .01 : Math.abs(e.x - t.x) < .01 && e.y >= Math.min(t.y, n.y) - .01 && e.y <= Math.max(t.y, n.y) + .01;
}
function ft(e, t) {
	for (let n = 1; n < e.length; n += 1) if (dt(t, e[n - 1], e[n])) return {
		prefix: Y([...e.slice(0, n), t]),
		suffix: Y([t, ...e.slice(n)])
	};
	return null;
}
function pt(e, t) {
	return e && t && Math.abs(e.x - t.x) < .01 && Math.abs(e.y - t.y) < .01;
}
function mt(e, t, n, r) {
	let i = n.map((e) => e.map((e) => ({ ...e }))), a = new Map(t.map((e, t) => [String(e.node.id), t])), o = Math.max(4, t.length * 3), s = ut(e, t, i, r), c = !1;
	for (let n = 0; n < o; n += 1) {
		let n = lt(s);
		if (!n || !n.point) break;
		let o = n.first, l = n.second;
		(l.role === "bus" && o.role !== "bus" || l.role === o.role && (l.childIds?.length || 0) > (o.childIds?.length || 0)) && ([o, l] = [l, o]);
		let u = (o.childIds || []).map(String).find((e) => {
			let t = a.get(e);
			return t != null && ft(i[t], n.point);
		});
		if (!u) break;
		let d = ft(i[a.get(u)], n.point), f = !1;
		for (let e of (l.childIds || []).map(String)) {
			let t = a.get(e);
			if (t == null) continue;
			let r = ft(i[t], n.point);
			if (!r || !pt(d.prefix[0], r.prefix[0])) continue;
			let o = Z(Y([...d.prefix, ...r.suffix.slice(1)]));
			o.length < 2 || (i[t] = o, f = !0);
		}
		if (!f) break;
		c = !0, s = ut(e, t, i, r);
	}
	return {
		paths: i,
		network: s,
		repaired: c
	};
}
function ht(e, t, n, r) {
	let i = V(r), a = Q(X(e, t[0], r).start, i), o = Math.max(r.gridSize, Math.min(r.spacingX, r.spacingY) * .35), s = t.map((e) => {
		let t = Q({
			x: e.cx,
			y: e.cy
		}, i), n = i ? e.node.height / 2 : e.node.width / 2;
		return {
			min: t.cross - n,
			max: t.cross + n
		};
	}), c = [Math.min(...s.map((e) => e.min)) - o, Math.max(...s.map((e) => e.max)) + o], l = t.map((e) => Q({
		x: e.cx,
		y: e.cy
	}, i).flow), u = Math.min(a.flow, ...l), d = Math.max(a.flow, ...l);
	for (let r of n) {
		if (r.node.id === e.node.id || t.includes(r)) continue;
		let n = Q({
			x: r.cx,
			y: r.cy
		}, i), a = i ? r.node.width / 2 : r.node.height / 2;
		if (n.flow + a < u || n.flow - a > d) continue;
		let s = i ? r.node.height / 2 : r.node.width / 2;
		c.push(n.cross - s - o, n.cross + s + o);
	}
	let f = [...new Set(s.flatMap((e) => [e.min, e.max]))].sort((e, t) => e - t);
	for (let e = 1; e < f.length; e += 1) f[e] - f[e - 1] >= o * 1.4 && c.push((f[e] + f[e - 1]) / 2);
	for (let n of t) {
		let t = tt(e, n, r);
		for (let e = 1; e < t.length; e += 1) {
			let n = Q(t[e - 1], i), r = Q(t[e], i);
			Math.abs(n.cross - r.cross) < .01 && Math.abs(n.flow - r.flow) > o && c.push(n.cross);
		}
	}
	let p = r.familyRouteOverrides?.[String(e.node.id)];
	Number.isFinite(Number(p?.trunkOffset)) && c.unshift(a.cross + Number(p.trunkOffset));
	let m = Math.max(1, r.gridSize);
	return [...new Set(c.map((e) => Math.round(e / m) * m))];
}
function gt(e, t) {
	let n = V(t), r = new Map(e.map((e) => [String(e.node.id), e])), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = [];
	for (let n of e) {
		if (n.parentId == null) continue;
		let e = r.get(String(n.parentId));
		if (!e || (a.set(String(n.node.id), tt(e, n, t)), J({ node: n.node }))) continue;
		let o = String(n.parentId);
		i.has(o) || i.set(o, {
			parent: e,
			children: []
		}), i.get(o).children.push(n);
	}
	let s = [...i.entries()].sort((e, t) => e[0].localeCompare(t[0]));
	for (let [i, c] of s) {
		if (c.children.length < 2) continue;
		let { parent: s, children: l } = c, u = l.map((e) => a.get(String(e.node.id))), d = {
			paths: u,
			score: ct(u, t),
			generated: !1
		}, f = Q(X(s, l[0], t).start, n), p = l.map((e) => Q(X(s, e, t).end, n).flow).reduce((e, t) => e + Math.sign(t - f.flow), 0) >= 0 ? 1 : -1, m = Math.max(10, Math.min(t.spacingX, t.spacingY) * .22), h = f.flow + p * m, g = t.familyRouteOverrides?.[i], _ = l.map((t) => e.filter((e) => e.node.id !== s.node.id && e.node.id !== t.node.id).map((e) => ({
			left: e.cx - e.node.width / 2,
			right: e.cx + e.node.width / 2,
			top: e.cy - e.node.height / 2,
			bottom: e.cy + e.node.height / 2
		}))), v = [...a].filter(([e]) => {
			let t = r.get(e);
			return t && String(t.parentId) !== i;
		}).map(([, e]) => e);
		for (let r of ht(s, l, e, t)) {
			let e = [], i = !0;
			for (let [a, o] of l.entries()) {
				let c = X(s, o, t), l = Q(c.start, n), u = Q(c.end, n), d = [c.start, c.end], f = _[a];
				if (Math.abs(l.cross - u.cross) < .01 && !He(d, f)) {
					e.push(d);
					continue;
				}
				let g = u.flow - p * m, v = Z([
					c.start,
					ot(l.cross, h, n),
					ot(r, h, n),
					ot(r, g, n),
					ot(u.cross, g, n),
					c.end
				]);
				if (He(v, f)) {
					i = !1;
					break;
				}
				e.push(v);
			}
			if (!i || e.some((e) => v.some((t) => Je(e, t) || Xe(e, t)))) continue;
			let a = Math.abs(r - f.cross) * 1.75, o = ct(e, t) + a, c = Number.isFinite(Number(g?.trunkOffset)) ? Math.round((f.cross + Number(g.trunkOffset)) / Math.max(1, t.gridSize)) * Math.max(1, t.gridSize) : null, u = c != null && Math.abs(r - c) < .01;
			(u && !d.requested || u === !!d.requested && o < d.score - .01) && (d = {
				paths: e,
				score: o,
				generated: !0,
				requested: u
			});
		}
		let y = mt(i, l, d.paths, n);
		d.paths = y.paths, d.network = y.network, d.repaired = y.repaired, (d.generated || d.repaired) && l.forEach((e, t) => {
			let n = d.paths[t];
			!n || n.length < 2 || (e.routeType = "packed", e.routePoints = n.length > 2 ? n.slice(1, -1) : [Ke(n[0], n[1])], a.set(String(e.node.id), n));
		});
		let b = d.network || ut(i, l, l.map((e) => a.get(String(e.node.id))), n);
		b && o.push(b);
	}
	return o;
}
function _t(e, t) {
	let n = new Map(e.map((e) => [String(e.node.id), e])), r = /* @__PURE__ */ new Map();
	for (let i of e) {
		if (i.parentId == null) continue;
		let e = n.get(String(i.parentId));
		if (!e) continue;
		let a = String(i.parentId);
		r.has(a) || r.set(a, []), r.get(a).push({
			childId: String(i.node.id),
			points: tt(e, i, t)
		});
	}
	let i = [];
	for (let [e, n] of r) {
		let r = se(e, n.map((e) => ({
			id: e.childId,
			points: e.points
		})), { horizontalFlow: V(t) });
		r && i.push(r);
	}
	return i;
}
function vt(e, t) {
	let n = pe(e, t), r = [], i = Object.create(null);
	return (function e(n, a, o, s) {
		let c = n.node, l = o + a.nodeCenterX, u = s + a.nodeCenterY;
		if (!c.isVirtual) {
			let e = i[c.id] || {
				routeType: "bus",
				points: null
			};
			r.push({
				node: c,
				lx: l,
				ly: u,
				w: H(c, t),
				h: U(c, t),
				parentId: c.parentId,
				routeType: e.routeType,
				routePoints: e.points || null,
				resolvedLayoutMode: a.resolvedMode || ce(c, t)
			});
		}
		for (let e of a.edgeRoutes) i[e.childId] = {
			routeType: e.routeType,
			points: e.points ? e.points.map((e) => ({
				x: o + e.x,
				y: s + e.y
			})) : null
		};
		for (let t of a.childPlacements) e(t.entry, t.m, o + t.cx, s + t.cy);
	})(e, n, 0, 0), r;
}
function yt(e) {
	let t = Infinity, n = Infinity, r = -Infinity, i = -Infinity;
	for (let a of e) t = Math.min(t, a.lx - a.w / 2), n = Math.min(n, a.ly - a.h / 2), r = Math.max(r, a.lx + a.w / 2), i = Math.max(i, a.ly + a.h / 2);
	return Number.isFinite(t) ? {
		w: r - t,
		h: i - n
	} : {
		w: 0,
		h: 0
	};
}
function bt(e) {
	let t = new Map(e.map((e) => [String(e.node.id), e])), n = /* @__PURE__ */ new Map();
	for (let t of e) {
		if (!t.parentId) continue;
		let e = String(t.parentId);
		n.has(e) || n.set(e, []), n.get(e).push(t);
	}
	let r = 0, i = 0, a = 0;
	for (let n of e) {
		if (!n.parentId) continue;
		let e = t.get(String(n.parentId));
		if (!e) continue;
		let o = Y([
			{
				x: e.lx,
				y: e.ly + e.h / 2
			},
			...n.routePoints || [],
			{
				x: n.lx,
				y: n.ly - n.h / 2
			}
		]), s = 0;
		for (let e = 1; e < o.length; e += 1) s += Math.abs(o[e].x - o[e - 1].x) + Math.abs(o[e].y - o[e - 1].y);
		let c = Math.abs(n.lx - e.lx) + Math.abs(n.ly - n.h / 2 - (e.ly + e.h / 2));
		i += Math.max(0, s / Math.max(1, c) - 1), a += Math.max(0, o.length - 2), r += 1;
	}
	let o = 0, s = 0, c = 0, l = 0;
	for (let e of n.values()) {
		let t = e.filter((e) => n.has(String(e.node.id)) || e.node.type === "department"), r = e.filter((e) => !t.includes(e) && !Me(e.node));
		if (t.length && r.length) {
			let e = Math.max(...r.map((e) => e.ly + e.h / 2)), n = Math.min(...t.map((e) => e.ly - e.h / 2));
			c += +(n < e + 1), l += 1;
		}
		if (t.length < 2) continue;
		let i = [];
		for (let e of t.sort((e, t) => e.ly - t.ly)) i.some((t) => Math.abs(t - e.ly) < 1) || i.push(e.ly);
		o += (i.length - 1) / (t.length - 1), s += 1;
	}
	return {
		detourRatio: i / Math.max(1, r),
		bendsPerEdge: a / Math.max(1, r),
		rankScatter: o / Math.max(1, s),
		mixedBandPenalty: c / Math.max(1, l)
	};
}
function xt(e, t) {
	let n = t.subtreeMode === "GridSmart" ? [1, 1.8] : [
		.72,
		.84,
		.92,
		1,
		1.08,
		1.18,
		1.32,
		1.55,
		1.8
	], r = [
		.78,
		1,
		1.22
	], i = t.subtreeMode === "GridSmart" ? [{
		blockFlow: "occupancy",
		leafFlow: "inline",
		flexibleRows: !1,
		preferShortFirst: !1
	}, {
		blockFlow: "occupancy",
		leafFlow: "band",
		flexibleRows: !1,
		preferShortFirst: !1
	}] : [
		{
			blockFlow: "rows",
			leafFlow: "inline",
			flexibleRows: !1,
			preferShortFirst: !1
		},
		{
			blockFlow: "rows",
			leafFlow: "inline",
			flexibleRows: !1,
			preferShortFirst: !0
		},
		{
			blockFlow: "rows",
			leafFlow: "inline",
			flexibleRows: !0,
			preferShortFirst: !1
		},
		{
			blockFlow: "rows",
			leafFlow: "inline",
			flexibleRows: !0,
			preferShortFirst: !0
		},
		{
			blockFlow: "adaptive",
			leafFlow: "inline",
			flexibleRows: !1,
			preferShortFirst: !1
		},
		{
			blockFlow: "adaptive",
			leafFlow: "inline",
			flexibleRows: !0,
			preferShortFirst: !1
		},
		{
			blockFlow: "masonry",
			leafFlow: "inline",
			flexibleRows: !1,
			preferShortFirst: !1
		},
		{
			blockFlow: "columns",
			leafFlow: "inline",
			flexibleRows: !1,
			preferShortFirst: !1
		},
		{
			blockFlow: "rows",
			leafFlow: "band",
			flexibleRows: !0,
			preferShortFirst: !1
		},
		{
			blockFlow: "adaptive",
			leafFlow: "band",
			flexibleRows: !0,
			preferShortFirst: !1
		}
	], a = Pe(e, t) ? i : i.filter((e) => e.leafFlow !== "band"), o = [], s = (n) => {
		for (let i of n) {
			let n = G(t.targetAspect * i, .2, 6);
			for (let s of r) for (let r of a) {
				let a = vt(e, {
					...t,
					targetAspect: n,
					autoSpacingYScale: s,
					...r
				}), c = yt(a), l = c.w / Math.max(1, c.h), u = a.reduce((e, t) => e + t.w * t.h, 0), d = Math.max(1, c.w * c.h / Math.max(1, u)), f = Math.abs(Math.log(Math.max(.01, l) / t.targetAspect)), p = bt(a), m = Math.log(d) * .65 + p.detourRatio * .25 + p.bendsPerEdge * .02 + p.rankScatter * 1.4 + p.mixedBandPenalty * .9;
				o.push({
					positioned: a,
					shapePenalty: f,
					densityRatio: d,
					clarityScore: m,
					...p,
					...r,
					targetMultiplier: i,
					autoSpacingYScale: s
				});
			}
		}
	};
	s(n), t.subtreeMode === "GridSmart" && Math.min(...o.map((e) => e.shapePenalty)) > .08 && s([.72, 1.4]);
	let c = Math.min(...o.map((e) => e.shapePenalty)), l = t.subtreeMode === "GridSmart" ? Math.max(.08, c + .04) : Math.max(.05, c + .02), u = o.filter((e) => e.shapePenalty <= l);
	u.sort((e, t) => e.clarityScore - t.clarityScore || e.densityRatio - t.densityRatio || e.shapePenalty - t.shapePenalty || Math.abs(e.targetMultiplier - 1) - Math.abs(t.targetMultiplier - 1) || Math.abs(e.autoSpacingYScale - 1) - Math.abs(t.autoSpacingYScale - 1) || Number(e.blockFlow !== "rows") - Number(t.blockFlow !== "rows") || Number(e.flexibleRows) - Number(t.flexibleRows) || Number(e.preferShortFirst) - Number(t.preferShortFirst));
	let d = u[0];
	if (t.subtreeMode === "GridSmart" && t.visualTargetAspect >= .8 && Fe(e) === 1) {
		let n = vt(e, {
			...t,
			targetAspect: G(t.targetAspect * d.targetMultiplier, .2, 6),
			autoSpacingYScale: d.autoSpacingYScale,
			blockFlow: d.blockFlow,
			leafFlow: d.leafFlow,
			flexibleRows: d.flexibleRows,
			preferShortFirst: d.preferShortFirst,
			preferFiveLeafRank: !0
		}), r = yt(d.positioned), i = yt(n), a = i.w / Math.max(1, r.w), o = i.h / Math.max(1, r.h), s = i.w * i.h / Math.max(1, r.w * r.h);
		if (a <= 1.12 && o <= 1.12 && s <= 1.15) return n;
	}
	return d.positioned;
}
function St(e, t, n) {
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
function Ct(e, t, n) {
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
function wt(e = {}) {
	let t = e.orientation || "TopToBottom", n = e.subtreeMode || "AutoSmart", r = e.targetSize, i = r && Number(r.width) > 0 && Number(r.height) > 0 ? Number(r.width) / Number(r.height) : null, a = Number(e.visualTargetAspect), o = i || (Number.isFinite(a) && a > 0 ? a : 0) || Number(e.targetAspect) || 1.6, s = t === "LeftToRight" || t === "RightToLeft" ? 1 / o : o;
	return {
		orientation: t,
		subtreeMode: n,
		spacingX: e.spacingX == null ? 40 : e.spacingX,
		spacingY: e.spacingY == null ? 70 : e.spacingY,
		gridSize: e.gridSize == null ? 22 : e.gridSize,
		alignGrid: e.alignGrid == null ? n === "GridSmart" : !!e.alignGrid,
		autoEdgeSide: !!e.autoEdgeSide,
		familyRouteOverrides: e.familyRouteOverrides || null,
		visualTargetAspect: o,
		targetAspect: Math.min(6, Math.max(.2, s))
	};
}
function Tt(e, t = {}) {
	let n = wt(t), r = _(g((e || []).map(D))), i = W(n.subtreeMode) ? xt(r, n) : vt(r, n);
	n.subtreeMode === "Matrix" && St(i, v(r), n);
	for (let e of i) {
		let t = Ct(e.lx, e.ly, n);
		e.cx = t.x, e.cy = t.y, e.routePoints &&= e.routePoints.map((e) => Ct(e.x, e.y, n));
	}
	let a = Infinity, o = Infinity;
	for (let e of i) a = Math.min(a, e.cx - e.node.width / 2), o = Math.min(o, e.cy - e.node.height / 2);
	isFinite(a) || (a = 0, o = 0);
	let s = 80 - a, c = 80 - o;
	for (let e of i) e.cx += s, e.cy += c, e.routePoints &&= e.routePoints.map((e) => ({
		x: e.x + s,
		y: e.y + c
	}));
	if (n.alignGrid) {
		let e = n.gridSize;
		for (let t of i) t.cx = Math.round(t.cx / e) * e, t.cy = Math.round(t.cy / e) * e, t.routePoints &&= t.routePoints.map((t) => ({
			x: Math.round(t.x / e) * e,
			y: Math.round(t.y / e) * e
		}));
	}
	let l = [];
	n.subtreeMode === "GridSmart" ? l = et(i, n) || [] : W(n.subtreeMode) && (Ge(i, n), l = _t(i, n));
	let u = Object.create(null);
	for (let e of i) u[e.node.id] = e;
	let d = Et(i);
	return {
		positioned: i,
		posById: u,
		cfg: n,
		bounds: d,
		framingBounds: Dt(i, d, n),
		familyNetworks: l
	};
}
function Et(e) {
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
function Dt(e, t, n) {
	if (n.subtreeMode !== "GridSmart" || !e.length) return t;
	let r = new Map(e.map((e) => [String(e.node.id), e])), i = e.filter((e) => !e.parentId || !r.has(String(e.parentId)));
	if (i.length !== 1) return t;
	let a = i[0], o = new Set(e.filter((e) => e.parentId != null).map((e) => String(e.parentId))), s = e.filter((e) => String(e.parentId) === String(a.node.id)), c = s.filter((e) => !J({ node: e.node })), l = c.filter((e) => o.has(String(e.node.id))), u = c.filter((e) => !o.has(String(e.node.id)));
	if (l.length !== 3 || u.length === 0 && c.length === s.length) return t;
	let d = V(n), f = (e) => d ? e.cy : e.cx, p = (e) => d ? e.cx : e.cy;
	l.sort((e, t) => f(e) - f(t));
	let m = l[1], h = n.gridSize / 2 + .01;
	if (Math.abs(f(a) - f(m)) > h || l.some((e) => Math.abs(p(e) - p(m)) > h)) return t;
	let g = f(a);
	if (d) {
		let e = Math.max(g - t.y, t.y + t.h - g);
		return {
			...t,
			y: g - e,
			h: e * 2
		};
	}
	let _ = Math.max(g - t.x, t.x + t.w - g);
	return {
		...t,
		x: g - _,
		w: _ * 2
	};
}
// src/core/connectors.js
function $(e, t) {
	let n = t && t[e.node.id];
	return {
		x: e.cx + (n ? n.dx : 0),
		y: e.cy + (n ? n.dy : 0)
	};
}
function Ot(e, t) {
	let n = e && t && t[e.node.id];
	return {
		dx: Number(n?.dx) || 0,
		dy: Number(n?.dy) || 0
	};
}
function kt(e, t, n, r) {
	let i = Array.isArray(t?.routePoints) ? t.routePoints : [];
	if (!i.length) return i;
	let a = Ot(e, r), o = Ot(t, r), s = {
		dx: o.dx - a.dx,
		dy: o.dy - a.dy
	}, c = i.map((e) => ({
		x: e.x + a.dx,
		y: e.y + a.dy
	})), l = c.length - 1, u = c[l], d = l;
	if (V(n)) {
		for (; d > 0 && Math.abs(c[d - 1].x - u.x) < .01;) --d;
		for (let e = d; e <= l; e += 1) c[e].x += s.dx;
		c[l].y += s.dy;
	} else {
		for (; d > 0 && Math.abs(c[d - 1].y - u.y) < .01;) --d;
		for (let e = d; e <= l; e += 1) c[e].y += s.dy;
		c[l].x += s.dx;
	}
	return c;
}
function At(e, t, n, r, i, a) {
	let o = i && i[t.node.id], s = a && a[t.node.id];
	if (o && o.length || s) return It(e, t, o || [], n, r, s);
	if (t.routePoints && t.routePoints.length) return It(e, t, kt(e, t, n, r), n, r, null);
	let c = $(e, r), l = $(t, r), u = e.node.width, d = e.node.height, f = t.node.width, p = t.node.height, m = V(n), h = c.y - d / 2, g = c.y + d / 2, _ = c.x - u / 2, v = c.x + u / 2, y = l.y - p / 2, b = l.y + p / 2, x = l.x - f / 2, S = l.x + f / 2, C = [];
	if (t.routeType === "bus") {
		if (m) {
			let e = l.x >= c.x ? v : _, t = l.x >= c.x ? x : S, n = (e + t) / 2;
			C.push([e, c.y], [n, c.y], [n, l.y], [t, l.y]);
		} else {
			let e = l.y >= c.y ? g : h, t = l.y >= c.y ? y : b, n = (e + t) / 2;
			C.push([c.x, e], [c.x, n], [l.x, n], [l.x, t]);
		}
	} else if (m) {
		let e = l.x >= c.x ? v : _, t = l.y <= c.y ? b : y;
		C.push([e, c.y], [l.x, c.y], [l.x, t]);
	} else {
		let e = l.y >= c.y ? g : h, t = l.x <= c.x ? S : x;
		C.push([c.x, e], [c.x, l.y], [t, l.y]);
	}
	return "M " + C.map((e) => e[0].toFixed(1) + " " + e[1].toFixed(1)).join(" L ");
}
function jt(e, t, n, r, i, a, o) {
	let s = $(e, a), c = $(t, a), l = e.node.width, u = e.node.height, d = t.node.width, f = t.node.height, p, m;
	return p = o && o.p ? {
		x: s.x + o.p.nx * l / 2,
		y: s.y + o.p.ny * u / 2
	} : V(i) ? {
		x: n.x >= s.x ? s.x + l / 2 : s.x - l / 2,
		y: s.y
	} : {
		x: s.x,
		y: n.y >= s.y ? s.y + u / 2 : s.y - u / 2
	}, m = o && o.c ? {
		x: c.x + o.c.nx * d / 2,
		y: c.y + o.c.ny * f / 2
	} : V(i) ? {
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
function Mt(e, t, n, r, i, a) {
	let o = jt(e, t, n.length ? n[0] : $(t, i), n.length ? n[n.length - 1] : $(e, i), r, i, a), s = o.S, c = o.E;
	if (r.autoEdgeSide && n.length) a && a.p || (s = Pt(e, $(e, i), n[0])), a && a.c || (c = Pt(t, $(t, i), n[n.length - 1]));
	else if (!n.length && !(a && a.c) && t.routeType !== "bus") {
		let n = $(t, i), a = $(e, i), o = t.node.width, s = t.node.height;
		c = V(r) ? {
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
function Nt(e, t, n, r, i, a) {
	return n || Array.isArray(t) && t.length ? t || [] : r && i ? kt(r, e, i, a) : Array.isArray(e?.routePoints) ? e.routePoints : [];
}
function Pt(e, t, n) {
	let r = e.node.width, i = e.node.height, a = n.x - t.x, o = n.y - t.y;
	return Math.abs(a) * i >= Math.abs(o) * r ? {
		x: t.x + (a >= 0 ? r / 2 : -r / 2),
		y: t.y
	} : {
		x: t.x,
		y: t.y + (o >= 0 ? i / 2 : -i / 2)
	};
}
function Ft(e, t) {
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
	let r = !0;
	for (; r && n.length > 2;) {
		r = !1;
		for (let e = 1; e < n.length - 1; e += 1) {
			let t = n[e - 1], i = n[e], a = n[e + 1], o = Math.abs(t.x - i.x) < .01 && Math.abs(i.x - a.x) < .01, s = Math.abs(t.y - i.y) < .01 && Math.abs(i.y - a.y) < .01;
			if (o || s) {
				n.splice(e, 1), r = !0;
				break;
			}
		}
	}
	return n.filter((e, t) => t === 0 || Math.abs(e.x - n[t - 1].x) > .01 || Math.abs(e.y - n[t - 1].y) > .01);
}
function It(e, t, n, r, i, a) {
	return "M " + Ft(Mt(e, t, n, r, i, a), V(r)).map((e) => e.x.toFixed(1) + " " + e.y.toFixed(1)).join(" L ");
}
// src/core/bounds.js
function Lt(e, t, n) {
	n ??= 0;
	let r = Infinity, i = Infinity, a = -Infinity, o = -Infinity;
	for (let n of e) {
		let e = $(n, t);
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
function Rt(e, t, n, r = {}) {
	let i = r.maxZoom == null ? 1.4 : r.maxZoom, a = r.margin == null ? .92 : r.margin, o = e.w || 1, s = e.h || 1, c = Math.min(t / o, n / s, i) * a;
	return {
		zoom: c,
		panX: (t - o * c) / 2 - e.x * c,
		panY: (n - s * c) / 2 - e.y * c
	};
}
export { b as A, i as B, A as C, T as D, j as E, h as F, t as G, c as H, v as I, e as J, r as K, n as L, m as M, _ as N, te as O, f as P, a as R, E as S, ee as T, d as U, l as V, s as W, se as _, jt as a, k as b, At as c, V as d, Ne as f, wt as g, H as h, Nt as i, y as j, g as k, It as l, U as m, Rt as n, $ as o, Tt as p, o as q, Mt as r, Ft as s, Lt as t, Ct as u, oe as v, D as w, O as x, B as y, u as z };
