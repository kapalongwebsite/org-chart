import { C as e, S as t, T as n, a as r, d as i, j as a, m as o, n as s, o as c, r as l, s as u, t as d, u as ee, v as f, y as te } from "./bounds-Bzdsw6ck.js";
import { a as ne, i as re, n as ie, o as ae, s as oe } from "./core-CmbzIrLi.js";
//#region src/vanilla/createOrgChart.js
var se = 116, ce = "http://www.w3.org/2000/svg", le = .72, ue = {
	Top: "TopToBottom",
	Bottom: "BottomToTop",
	Left: "LeftToRight",
	Right: "RightToLeft"
};
function de(e) {
	return ue[e] || e;
}
var fe = {
	nodes: [],
	orientation: "TopToBottom",
	subtreeMode: "Balanced",
	spacingX: 40,
	spacingY: 70,
	gridSize: 22,
	showGrid: !1,
	snapGrid: !1,
	alignGrid: !1,
	snapAlign: !0,
	enableDragging: !0,
	enablePan: !0,
	enableZoom: !0,
	readonly: !1,
	editMode: !1,
	inspector: !0,
	inspectorSlot: !1,
	inspectorTarget: null,
	settingsTarget: null,
	settingsSlot: !1,
	nodeSlots: !1,
	fullscreenControl: !0,
	autoEdgeSide: !0,
	legend: !1,
	legendTarget: null,
	legendSlot: !1,
	photoHeight: 104,
	cardWidth: a.width,
	photoContain: !0,
	showImages: !0,
	userSearch: null,
	userToFields: null,
	fitOnLayoutChange: !0,
	fitOnInit: !0,
	toolbar: !0,
	persist: !1,
	storageKey: "local-org-chart.state"
};
function pe(ue, pe = {}) {
	if (!ue || !ue.appendChild) throw Error("createOrgChart: first argument must be a DOM element.");
	let p = Object.assign({}, fe, pe), me = +p.maxZoom > 1 ? +p.maxZoom : 4, m = {
		orientation: de(p.orientation),
		subtreeMode: p.subtreeMode,
		spacingX: p.spacingX,
		spacingY: p.spacingY,
		zoom: 1,
		panX: 0,
		panY: 0,
		selectedNodeId: null,
		selectedEdgeId: null,
		gridSize: p.gridSize,
		showGrid: p.showGrid,
		snapGrid: p.snapGrid,
		alignGrid: p.alignGrid,
		editMode: !!p.editMode,
		showImages: p.showImages !== !1,
		showLegend: !!p.legend,
		autoEdgeSide: !!p.autoEdgeSide,
		photoHeight: +p.photoHeight || 104,
		cardWidth: +p.cardWidth || a.width,
		photoContain: p.photoContain !== !1
	}, h = (p.nodes || []).map(f), g = n(h), _ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.create(null), x = /* @__PURE__ */ new Set(), S = (p.settings && p.settings.themeRules || p.themeRules || []).map(ie), he = {
		spacingX: p.spacingX,
		spacingY: p.spacingY,
		gridSize: p.gridSize,
		showGrid: !!p.showGrid,
		snapGrid: !!p.snapGrid,
		alignGrid: !!p.alignGrid,
		themeRules: S.map((e) => ({
			enabled: e.enabled,
			field: e.field,
			value: e.value,
			style: Object.assign({}, e.style)
		}))
	}, ge = 0, C = [], w = Object.create(null), T = Object.create(null), E = Object.create(null), D = Object.create(null), O = null, k = null, _e = 0, ve = /* @__PURE__ */ new Set(), ye = [], be = Object.create(null);
	function xe(e, t) {
		return (be[e] || (be[e] = [])).push(t), si;
	}
	function Se(e, t) {
		return be[e] && (be[e] = be[e].filter((e) => e !== t)), si;
	}
	function A(e, t) {
		(be[e] || []).forEach((e) => {
			try {
				e(t);
			} catch {}
		});
	}
	function j(e, t, n, r) {
		e.addEventListener(t, n, r), ye.push({
			target: e,
			type: t,
			fn: n,
			optsL: r
		});
	}
	let M = document.createElement("div");
	M.className = "loc-root", M.tabIndex = -1;
	let N = p.toolbar ? ii() : null;
	N && M.appendChild(N);
	let P = z("div", "loc-canvas"), Ce = z("div", "loc-content"), we = z("div", "loc-grid"), Te = document.createElementNS(ce, "svg");
	Te.setAttribute("class", "loc-connectors");
	let Ee = document.createElementNS(ce, "g");
	Ee.setAttribute("class", "loc-edgehits"), Te.appendChild(Ee);
	let De = z("div", "loc-nodes"), F = document.createElementNS(ce, "svg");
	F.setAttribute("class", "loc-overlay");
	let I = document.createElementNS(ce, "g");
	I.setAttribute("class", "loc-edgehandles");
	let Oe = document.createElementNS(ce, "g");
	Oe.setAttribute("class", "loc-aligns"), F.appendChild(Oe), F.appendChild(I);
	let ke = z("div", "loc-zoomreadout");
	ke.textContent = "100%", Ce.appendChild(we), Ce.appendChild(Te), Ce.appendChild(De), Ce.appendChild(F), P.appendChild(Ce), P.appendChild(ke);
	let Ae = null;
	p.fullscreenControl && (Ae = z("button", "loc-fsbtn"), Ae.type = "button", Ae.title = "Fullscreen", Ae.setAttribute("aria-label", "Toggle fullscreen"), Ae.innerHTML = "⛶", j(Ae, "click", (e) => {
		e.stopPropagation(), $r();
	}), P.appendChild(Ae)), M.appendChild(P);
	let L = z("div", "loc-panel");
	L.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Node</span><button class=\"loc-panel-close\" title=\"Close\" data-role=\"panel-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"panel-body\"></div><div class=\"loc-panel-foot\" data-role=\"panel-foot\"></div>";
	let je = Be(p.inspectorTarget) || P;
	je.appendChild(L), je !== P && L.classList.add("loc-panel-external");
	let Me = L.querySelector("[data-role=\"panel-body\"]"), Ne = L.querySelector("[data-role=\"panel-foot\"]"), Pe = L.querySelector(".loc-panel-title"), R = z("div", "loc-settings");
	R.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Settings</span><button class=\"loc-panel-close\" title=\"Close\" data-role=\"settings-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"settings-body\"></div>";
	let Fe = Be(p.settingsTarget) || P;
	Fe.appendChild(R), Fe !== P && R.classList.add("loc-panel-external");
	let Ie = R.querySelector("[data-role=\"settings-body\"]"), Le = z("div", "loc-legend");
	Le.innerHTML = "<div class=\"loc-legend-head\"><span class=\"loc-legend-title\">Legend</span><button class=\"loc-legend-close\" title=\"Hide legend\" data-role=\"legend-close\">✕</button></div><div class=\"loc-legend-body\" data-role=\"legend-body\"></div>";
	let Re = Be(p.legendTarget) || P;
	Re.appendChild(Le), Re !== P && Le.classList.add("loc-legend-external");
	let ze = Le.querySelector("[data-role=\"legend-body\"]");
	Ge(), Ke(), ue.appendChild(M);
	function z(e, t) {
		let n = document.createElement(e);
		return t && (n.className = t), n;
	}
	function Be(e) {
		if (!e) return null;
		let t = typeof e == "string" ? document.querySelector(e) : e;
		return t && t.appendChild ? t : null;
	}
	function Ve() {
		return o({
			orientation: m.orientation,
			subtreeMode: m.subtreeMode,
			spacingX: m.spacingX,
			spacingY: m.spacingY,
			gridSize: m.gridSize,
			alignGrid: m.alignGrid,
			autoEdgeSide: m.autoEdgeSide
		});
	}
	function He() {
		let e = i(h, Ve());
		C = e.positioned, w = e.posById;
	}
	function B() {
		He(), at(), nt(), We(), it(), gt(), m.showLegend && Bn(), X(), A("layout-change", {
			positioned: C,
			mode: m.subtreeMode,
			orientation: m.orientation
		});
	}
	function Ue(e) {
		let t = Object.create(null);
		for (let e of C) t[e.node.id] = r(e, _);
		e(), He();
		for (let e of C) {
			let n = t[e.node.id];
			if (!n) continue;
			let r = n.x - e.cx, i = n.y - e.cy;
			Math.abs(r) > .5 || Math.abs(i) > .5 ? _[e.node.id] = {
				dx: r,
				dy: i
			} : delete _[e.node.id];
		}
		at(), nt(), We(), it(), gt(), X(), A("layout-change", {
			positioned: C,
			mode: m.subtreeMode,
			orientation: m.orientation
		});
	}
	function We() {
		let e = Object.create(null);
		for (let t of C) {
			let n = t.node;
			e[n.id] = !0;
			let i = T[n.id];
			i || (i = Ye(n), T[n.id] = i, De.appendChild(i)), i.style.width = n.width + "px", i.style.height = n.height + "px";
			let a = r(t, _);
			i.style.transform = `translate(${a.x - n.width / 2}px, ${a.y - n.height / 2}px)`, p.nodeSlots || (i.dataset.fitted || (Qe(i), i.dataset.fitted = "1"), Nn(i, n)), i.classList.toggle("loc-selected", x.has(n.id)), i.classList.toggle("loc-primary", m.selectedNodeId === n.id && x.size > 1), $e(i, n);
		}
		for (let t in T) e[t] || (T[t].remove(), delete T[t]);
		A("nodes-rendered", { ids: C.map((e) => e.node.id) });
	}
	function Ge() {
		M.style.setProperty("--loc-photo-h", (m.photoHeight || 104) + "px"), M.style.setProperty("--loc-photo-fit", m.photoContain ? "contain" : "cover");
	}
	function Ke() {
		let e = Math.max(100, m.cardWidth || a.width), t = Math.max(60, (m.photoHeight || 104) + se);
		for (let n of h) n.type !== "department" && (n.width = e, n.height = t);
	}
	function qe(e) {
		e ||= {};
		let t = typeof e.width == "number" || typeof e.photoHeight == "number";
		if (typeof e.width == "number" && (m.cardWidth = Math.max(100, e.width)), typeof e.photoHeight == "number" && (m.photoHeight = Math.max(40, e.photoHeight)), "contain" in e && (m.photoContain = !!e.contain), Ge(), t) {
			Ke();
			for (let e in T) delete T[e].dataset.fitted;
			B();
		}
		X(), A("settings-change", G());
	}
	function Je(e) {
		e.textContent = "", e.innerHTML = "<svg class=\"loc-usericon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7\"/></svg>";
	}
	function Ye(e) {
		if (p.nodeSlots) {
			let t = z("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
			return t.dataset.id = e.id, t.innerHTML = "<div class=\"loc-node-slot\"></div>", t.appendChild(Xe()), t;
		}
		let t = z("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
		if (t.dataset.id = e.id, e.type === "department") t.innerHTML = "<span class=\"loc-lbl\"></span>", t.querySelector(".loc-lbl").textContent = e.label, t.querySelector(".loc-lbl").title = e.label || "";
		else {
			t.innerHTML = "<div class=\"loc-photo\"></div><div class=\"loc-ptext\"><div class=\"loc-pname\"></div><div class=\"loc-ptitle\"></div><div class=\"loc-badge\"></div></div>";
			let n = t.querySelector(".loc-photo"), r = e.data && e.data.photo_url;
			if (m.showImages && r) {
				let t = new Image();
				t.crossOrigin = "anonymous", t.alt = e.personName || "", t.referrerPolicy = "no-referrer", t.onerror = () => {
					Je(n);
				}, t.src = r, n.appendChild(t);
			} else Je(n);
			let i = t.querySelector(".loc-pname"), a = t.querySelector(".loc-ptitle");
			i.textContent = e.personName || "—", i.title = e.personName || "", a.textContent = e.label, a.title = e.label || "";
			let o = t.querySelector(".loc-badge");
			e.status ? (o.textContent = e.status, o.className = "loc-badge loc-" + e.status) : o.remove();
		}
		return t.appendChild(Xe()), t;
	}
	function Xe() {
		let e = z("div", "loc-toggle");
		return e.dataset.role = "toggle", e;
	}
	function Ze(e) {
		return e.scrollWidth > e.clientWidth + .5 || e.scrollHeight > e.clientHeight + .5;
	}
	function Qe(e) {
		if (e.style.setProperty("--loc-fit", "1"), !Ze(e)) return;
		let t = le, n = 1;
		for (let r = 0; r < 7; r++) {
			let r = (t + n) / 2;
			e.style.setProperty("--loc-fit", String(r)), Ze(e) ? n = r : t = r;
		}
		e.style.setProperty("--loc-fit", String(t));
	}
	function $e(e, n) {
		let r = e.querySelector("[data-role=\"toggle\"]");
		if (!r) return;
		let i = t(h, n.id) > 0;
		r.style.display = i ? "flex" : "none", r.textContent = n.collapsed ? "+" : "−";
		let a = n.collapsed ? "Expand" : "Collapse";
		r.title = a, r.setAttribute("aria-label", a);
	}
	function et(e) {
		return document.createElementNS(ce, e);
	}
	function tt(e) {
		return u(w[e.node.parentId], e, Ve(), _, v, y);
	}
	function nt() {
		let e = Object.create(null);
		for (let t of C) {
			let n = t.node;
			if (!n.parentId || !w[n.parentId]) continue;
			e[n.id] = !0;
			let r = tt(t), i = E[n.id];
			i || (i = et("path"), E[n.id] = i, Te.appendChild(i)), i.setAttribute("d", r), i.classList.toggle("loc-sel", m.selectedEdgeId === n.id), i.classList.toggle("loc-incident", Nt(n));
			let a = D[n.id];
			a || (a = et("path"), a.dataset.edge = n.id, D[n.id] = a, Ee.appendChild(a)), a.setAttribute("d", r);
		}
		for (let t in E) e[t] || (E[t].remove(), delete E[t]);
		for (let t in D) e[t] || (D[t].remove(), delete D[t]);
		Pt(), m.selectedEdgeId && !e[m.selectedEdgeId] ? Jt() : Zt();
	}
	function rt(e) {
		let t = w[e];
		if (!t || !w[t.node.parentId]) return;
		let n = tt(t);
		E[e] && E[e].setAttribute("d", n), D[e] && D[e].setAttribute("d", n);
	}
	function it() {
		Ce.style.transform = `translate(${m.panX}px, ${m.panY}px) scale(${m.zoom})`, ke.textContent = Math.round(m.zoom * 100) + "%", m.selectedEdgeId && !O && Zt(), X();
	}
	function at() {
		let e = 0, t = 0, n = 0, i = 0;
		for (let a of C) {
			let o = r(a, _), s = a.node.width / 2, c = a.node.height / 2;
			e = Math.min(e, o.x - s - 80), t = Math.min(t, o.y - c - 80), n = Math.max(n, o.x + s + 80), i = Math.max(i, o.y + c + 80);
		}
		Te.setAttribute("width", n), Te.setAttribute("height", i), F.setAttribute("width", n), F.setAttribute("height", i);
		let a = m.gridSize;
		we.style.left = e + "px", we.style.top = t + "px", we.style.width = n - e + "px", we.style.height = i - t + "px", we.style.backgroundSize = a + "px " + a + "px", we.style.backgroundPosition = (-e % a + a) % a + "px " + (-t % a + a) % a + "px";
	}
	function ot() {
		we.classList.toggle("loc-on", m.showGrid), P.classList.toggle("loc-gridon", m.showGrid);
	}
	function st() {
		if (!C.length) return;
		let e = d(C, _, 0), t = s(e, P.clientWidth, P.clientHeight);
		m.zoom = t.zoom, m.panX = t.panX, m.panY = t.panY, it();
	}
	function ct(e) {
		let t = w[e];
		if (!t) return;
		let n = r(t, _);
		m.panX = P.clientWidth / 2 - n.x * m.zoom, m.panY = P.clientHeight / 2 - n.y * m.zoom, it();
	}
	function lt() {
		let e = p.fitOnLayoutChange;
		return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
	}
	function ut() {
		let e = lt();
		if (e === "fit") {
			st();
			return;
		}
		if (e === "recenter") {
			let e = h.find((e) => !e.parentId), t = m.selectedNodeId && w[m.selectedNodeId] ? m.selectedNodeId : e && e.id;
			t && ct(t);
		}
	}
	function dt() {
		for (let e of h) e.collapsed = !1;
		B(), Y();
	}
	function ft() {
		let n = e(h, g);
		for (let e of h) e.collapsed = n[e.id] >= 1 && t(h, e.id) > 0;
		B(), Y();
	}
	function pt(e) {
		let t = g[e];
		t && (Ue(() => {
			t.collapsed = !t.collapsed;
		}), H(), Y());
	}
	function mt(e) {
		if (ve = oe(h, e), gt(), ve.size) {
			let e = C.find((e) => ve.has(e.node.id));
			e && ct(e.node.id);
		}
		return ve.size;
	}
	function ht() {
		ve = /* @__PURE__ */ new Set(), gt();
	}
	function gt() {
		let e = ve.size > 0;
		for (let t of C) {
			let n = T[t.node.id];
			if (!n) continue;
			let r = ve.has(t.node.id);
			n.classList.toggle("loc-highlight", e && r), n.classList.toggle("loc-dim", e && !r);
		}
		for (let t in E) E[t].classList.toggle("loc-hl", e && ve.has(t));
	}
	function _t(e, t) {
		if (e.target.closest("[data-role=\"toggle\"]") || (e.stopPropagation(), ri(), un && pn(t))) return;
		if (Jt(), e.ctrlKey || e.metaKey) {
			kt(t);
			return;
		}
		if (x.has(t) ? (m.selectedNodeId = t, Et(), H()) : Ot(t), A("node-select", {
			id: t,
			node: g[t],
			rect: Ht(t)
		}), p.inspector && yn(t), p.readonly || !p.enableDragging || !m.editMode) return;
		let n = x.has(t) && x.size > 1 ? [...x] : [t], r = Object.create(null);
		for (let e of n) {
			let t = _[e] || {
				dx: 0,
				dy: 0
			};
			r[e] = {
				dx: t.dx,
				dy: t.dy
			}, T[e] && T[e].classList.add("loc-dragging");
		}
		k = {
			id: t,
			groupIds: n,
			bases: r,
			startX: e.clientX,
			startY: e.clientY,
			moved: !1
		}, A("node-drag-start", {
			id: t,
			node: g[t],
			group: n
		}), Z("pointermove", vt), Z("pointerup", yt);
	}
	function vt(e) {
		if (!k) return;
		let t = (e.clientX - k.startX) / m.zoom, n = (e.clientY - k.startY) / m.zoom;
		Math.abs(e.clientX - k.startX) + Math.abs(e.clientY - k.startY) > 3 && (k.moved = !0);
		let r = w[k.id], i = k.bases[k.id];
		if (r) {
			let e = r.cx + i.dx, a = r.cy + i.dy;
			if (m.snapGrid) {
				let r = m.gridSize;
				t = Math.round((e + t) / r) * r - e, n = Math.round((a + n) / r) * r - a;
			}
			if (k.groupIds.length === 1) {
				let r = bt(k.id, e + t, a + n);
				t = r.cx - e, n = r.cy - a, St(r.gx, r.gy);
			}
		}
		for (let e of k.groupIds) {
			let r = k.bases[e];
			_[e] = {
				dx: r.dx + t,
				dy: r.dy + n
			};
		}
		_e ||= requestAnimationFrame(() => {
			_e = 0;
			for (let e of k.groupIds) wt(e), Tt(e);
			A("node-drag", {
				id: k.id,
				node: g[k.id],
				offset: _[k.id],
				group: k.groupIds
			});
		});
	}
	function yt() {
		let e = !1;
		if (k) {
			for (let e of k.groupIds) T[e] && T[e].classList.remove("loc-dragging");
			A("node-drag-end", {
				id: k.id,
				node: g[k.id],
				offset: _[k.id],
				group: k.groupIds
			}), at(), e = !!k.moved;
		}
		k = null, Ct(), Q("pointermove", vt), Q("pointerup", yt), X(), e && Y();
	}
	function bt(e, t, n) {
		if (!p.snapAlign) return {
			cx: t,
			cy: n,
			gx: null,
			gy: null
		};
		let i = g[e];
		if (!i) return {
			cx: t,
			cy: n,
			gx: null,
			gy: null
		};
		let a = 8 / m.zoom, o = [], s = [], c = i.parentId && w[i.parentId];
		c && o.push(r(c, _).x);
		for (let t of C) {
			if (t.node.id === e || !i.parentId || t.node.parentId !== i.parentId) continue;
			let n = r(t, _);
			o.push(n.x), s.push(n.y);
		}
		let l = null, u = a;
		for (let e of o) {
			let n = Math.abs(t - e);
			n < u && (u = n, t = e, l = e);
		}
		let d = null, ee = a;
		for (let e of s) {
			let t = Math.abs(n - e);
			t < ee && (ee = t, n = e, d = e);
		}
		return {
			cx: t,
			cy: n,
			gx: l,
			gy: d
		};
	}
	function xt(e, t) {
		if (!p.snapAlign) return t;
		let n = w[e];
		if (!n) return t;
		let i = w[n.node.parentId], a = 8 / m.zoom, o = r(n, _), s = [o.x], c = [o.y];
		if (i) {
			let e = r(i, _);
			s.push(e.x), c.push(e.y);
		}
		let l = null, u = a, d = t.x;
		for (let e of s) {
			let n = Math.abs(t.x - e);
			n < u && (u = n, d = e, l = e);
		}
		let ee = null, f = a, te = t.y;
		for (let e of c) {
			let n = Math.abs(t.y - e);
			n < f && (f = n, te = e, ee = e);
		}
		return St(l, ee), {
			x: d,
			y: te
		};
	}
	function St(e, t) {
		Oe.innerHTML = "";
		let n = +F.getAttribute("width") || 0, r = +F.getAttribute("height") || 0, i = (e, t, n, r) => {
			let i = et("line");
			i.setAttribute("x1", e), i.setAttribute("y1", t), i.setAttribute("x2", n), i.setAttribute("y2", r), i.setAttribute("class", "loc-align-line"), Oe.appendChild(i);
		};
		e != null && i(e, 0, e, r), t != null && i(0, t, n, t);
	}
	function Ct() {
		Oe.innerHTML = "";
	}
	function wt(e) {
		let t = w[e], n = T[e];
		if (!t || !n) return;
		let i = r(t, _);
		n.style.transform = `translate(${i.x - t.node.width / 2}px, ${i.y - t.node.height / 2}px)`;
	}
	function Tt(e) {
		let t = w[e];
		if (t) {
			w[t.node.parentId] && rt(e);
			for (let t of C) t.node.parentId === e && rt(t.node.id);
			m.selectedEdgeId && Zt();
		}
	}
	function Et() {
		for (let e in T) T[e].classList.toggle("loc-selected", x.has(e)), T[e].classList.toggle("loc-primary", m.selectedNodeId === e && x.size > 1);
	}
	function Dt() {
		A("selection-change", {
			ids: [...x],
			primary: m.selectedNodeId
		});
	}
	function Ot(e) {
		x = new Set(e ? [e] : []), m.selectedNodeId = e || null, Et(), H();
	}
	function kt(e) {
		x.has(e) ? (x.delete(e), m.selectedNodeId === e && (m.selectedNodeId = x.size ? [...x][x.size - 1] : null)) : (x.add(e), m.selectedNodeId = e), Et(), H(), Dt();
	}
	function At(e, t) {
		x = new Set(e), m.selectedNodeId = t ?? (e.length ? e[e.length - 1] : null), Et(), H(), Dt();
	}
	function jt() {
		x = /* @__PURE__ */ new Set(), m.selectedNodeId = null, Et(), H();
	}
	function Mt(e) {
		let t = Ut(e.clientX, e.clientY), n = e.shiftKey ? new Set(x) : /* @__PURE__ */ new Set(), i = et("rect");
		i.setAttribute("class", "loc-marquee"), F.appendChild(i), P.classList.add("loc-marqueeing");
		let a = !1, o = (e) => {
			let o = Ut(e.clientX, e.clientY), s = Math.min(t.x, o.x), c = Math.min(t.y, o.y), l = Math.abs(o.x - t.x), u = Math.abs(o.y - t.y);
			i.setAttribute("x", s), i.setAttribute("y", c), i.setAttribute("width", l), i.setAttribute("height", u);
			let d = new Set(n);
			for (let e of C) {
				let t = r(e, _);
				t.x >= s && t.x <= s + l && t.y >= c && t.y <= c + u && d.add(e.node.id);
			}
			x = d, m.selectedNodeId = x.size ? [...x][x.size - 1] : null, Et(), H(), a = !0;
		}, s = () => {
			i.remove(), P.classList.remove("loc-marqueeing"), Q("pointermove", o), Q("pointerup", s), a ? (Dt(), x.size === 1 && p.inspector && yn([...x][0])) : (jt(), W());
		};
		Z("pointermove", o), Z("pointerup", s);
	}
	function Nt(e) {
		return x.has(e.id) || x.has(e.parentId);
	}
	let V = /* @__PURE__ */ new Set();
	function Pt() {
		for (let e in E) E[e].classList.toggle("loc-edge-selected", V.has(e));
	}
	function Ft() {
		V.size && (V = /* @__PURE__ */ new Set(), Pt(), A("edges-select", { ids: [] }));
	}
	function It(e) {
		V = new Set((e || []).filter((e) => E[e])), Pt(), A("edges-select", { ids: [...V] });
	}
	function Lt() {
		if (!V.size) return;
		let e = !1;
		for (let t of V) v[t] && (delete v[t], e = !0), y[t] && (delete y[t], e = !0);
		e && (m.selectedEdgeId && V.has(m.selectedEdgeId) && Jt(), nt(), Pt(), X(), Y(), A("edges-reset", { ids: [...V] }));
	}
	function Rt(e, t, n, r, i, a, o, s) {
		let c = (n - e) * (s - a) - (r - t) * (o - i);
		if (Math.abs(c) < 1e-9) return !1;
		let l = ((i - e) * (s - a) - (a - t) * (o - i)) / c, u = ((i - e) * (r - t) - (a - t) * (n - e)) / c;
		return l >= 0 && l <= 1 && u >= 0 && u <= 1;
	}
	function zt(e, t, n, r, i, a) {
		let o = n + i, s = r + a, c = (e) => e.x >= n && e.x <= o && e.y >= r && e.y <= s;
		return c(e) || c(t) ? !0 : Rt(e.x, e.y, t.x, t.y, n, r, o, r) || Rt(e.x, e.y, t.x, t.y, o, r, o, s) || Rt(e.x, e.y, t.x, t.y, o, s, n, s) || Rt(e.x, e.y, t.x, t.y, n, s, n, r);
	}
	function Bt(e, t, n, r, i) {
		let a = Gt(e);
		if (!a) return !1;
		for (let e of Kt(a)) if (zt(e.a, e.b, t, n, r, i)) return !0;
		return !1;
	}
	function Vt(e) {
		let t = Ut(e.clientX, e.clientY), n = e.shiftKey ? new Set(V) : /* @__PURE__ */ new Set(), r = et("rect");
		r.setAttribute("class", "loc-marquee loc-marquee-edge"), F.appendChild(r), P.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = Ut(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e in E) Bt(e, o, s, c, l) && u.add(e);
			V = u, Pt(), i = !0;
		}, o = () => {
			r.remove(), P.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? A("edges-select", { ids: [...V] }) : Ft();
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function H() {
		for (let e in E) {
			let t = w[e];
			E[e].classList.toggle("loc-incident", !!t && Nt(t.node));
		}
	}
	function Ht(e) {
		let t = T[e];
		if (!t) return null;
		let n = t.getBoundingClientRect();
		return {
			left: n.left,
			top: n.top,
			right: n.right,
			bottom: n.bottom,
			width: n.width,
			height: n.height
		};
	}
	function Ut(e, t) {
		let n = P.getBoundingClientRect();
		return {
			x: (e - n.left - m.panX) / m.zoom,
			y: (t - n.top - m.panY) / m.zoom
		};
	}
	function Wt(e) {
		if (m.snapGrid) {
			let t = m.gridSize;
			return {
				x: Math.round(e.x / t) * t,
				y: Math.round(e.y / t) * t
			};
		}
		return {
			x: e.x,
			y: e.y
		};
	}
	function Gt(e) {
		let t = w[e];
		if (!t) return null;
		let n = w[t.node.parentId];
		if (!n) return null;
		let r = v[e] || [];
		return l(n, t, r, Ve(), _, y[e]);
	}
	function Kt(e) {
		let t = [], n = ee(Ve());
		for (let r = 0; r < e.length - 1; r++) {
			let i = c([e[r], e[r + 1]], n);
			for (let e = 0; e < i.length - 1; e++) t.push({
				a: i[e],
				b: i[e + 1],
				insert: r
			});
		}
		return t;
	}
	function qt(e) {
		m.selectedEdgeId && E[m.selectedEdgeId] && E[m.selectedEdgeId].classList.remove("loc-sel"), x = /* @__PURE__ */ new Set(), m.selectedNodeId = null, Et(), m.selectedEdgeId = e, E[e] && E[e].classList.add("loc-sel"), H(), Zt();
	}
	function Jt() {
		m.selectedEdgeId && E[m.selectedEdgeId] && E[m.selectedEdgeId].classList.remove("loc-sel"), m.selectedEdgeId = null, I.innerHTML = "";
	}
	function Yt(e, t, n, r) {
		let i = et("circle");
		return i.setAttribute("cx", e), i.setAttribute("cy", t), i.setAttribute("r", n), i.setAttribute("class", r), i;
	}
	function Xt(e, t, n, r) {
		let i = et("rect");
		return i.setAttribute("x", e - n), i.setAttribute("y", t - n), i.setAttribute("width", 2 * n), i.setAttribute("height", 2 * n), i.setAttribute("rx", 2 / m.zoom), i.setAttribute("class", r), i;
	}
	function Zt() {
		I.innerHTML = "";
		let e = m.selectedEdgeId;
		if (!e || p.readonly) return;
		let t = Gt(e);
		if (!t) return;
		let n = v[e] || [], r = 6 / m.zoom, i = 5 / m.zoom;
		if (!m.editMode) {
			for (let e = 0; e < n.length; e++) {
				let t = Yt(n[e].x, n[e].y, r, "loc-wp-handle loc-wp-readonly");
				t.dataset.wp = e, I.appendChild(t);
			}
			return;
		}
		for (let e of Kt(t)) {
			let t = Yt((e.a.x + e.b.x) / 2, (e.a.y + e.b.y) / 2, i, "loc-wp-add");
			t.dataset.add = e.insert, I.appendChild(t);
		}
		for (let e = 0; e < n.length; e++) {
			let t = Yt(n[e].x, n[e].y, r, "loc-wp-handle");
			t.dataset.wp = e, I.appendChild(t);
		}
		let a = t[0], o = t[t.length - 1], s = Xt(a.x, a.y, 6 / m.zoom, "loc-ep loc-ep-parent");
		s.dataset.ep = "parent", I.appendChild(s);
		let c = Xt(o.x, o.y, 6 / m.zoom, "loc-ep loc-ep-child");
		c.dataset.ep = "child", I.appendChild(c);
	}
	function Qt(e, t) {
		let n = r(e, _), i = e.node.width, a = e.node.height, o = (t.x - n.x) / (i / 2), s = (t.y - n.y) / (a / 2), c = Math.max(Math.abs(o), Math.abs(s));
		return c > 1e-6 && (o /= c, s /= c), {
			nx: Math.max(-1, Math.min(1, o)),
			ny: Math.max(-1, Math.min(1, s))
		};
	}
	let $t = .34;
	function en(e) {
		let t = e.nx, n = e.ny;
		return Math.abs(Math.abs(n) - 1) < 1e-6 && Math.abs(t) < $t ? t = 0 : Math.abs(Math.abs(t) - 1) < 1e-6 && Math.abs(n) < $t && (n = 0), {
			nx: t,
			ny: n
		};
	}
	function tn(e, t) {
		let n = new Set([t].concat(On(t)));
		for (let t = C.length - 1; t >= 0; t--) {
			let i = C[t];
			if (n.has(i.node.id)) continue;
			let a = r(i, _);
			if (e.x >= a.x - i.node.width / 2 && e.x <= a.x + i.node.width / 2 && e.y >= a.y - i.node.height / 2 && e.y <= a.y + i.node.height / 2) return i.node.id;
		}
		return null;
	}
	let nn = null;
	function rn(e) {
		nn && T[nn] && T[nn].classList.remove("loc-reparent-target"), nn = e, e && T[e] && T[e].classList.add("loc-reparent-target");
	}
	function an(e) {
		if (!O || O.kind !== "ep") return;
		let t = O.id, n = w[t];
		if (!n) return;
		let r = w[n.node.parentId];
		if (!r) return;
		let i = Wt(Ut(e.clientX, e.clientY));
		if (y[t] = y[t] || {}, O.changed = !0, O.which === "child") y[t].c = en(Qt(n, i));
		else {
			y[t].p = en(Qt(r, i));
			let e = tn(i, t);
			rn(e && e !== n.node.parentId ? e : null);
		}
		rt(t), Zt();
	}
	function on() {
		let e = O;
		if (O = null, Q("pointermove", an), Q("pointerup", on), e && e.which === "parent" && nn) {
			let t = nn;
			rn(null), sn(e.id, t);
			return;
		}
		rn(null), X(), e && e.changed && Y();
	}
	function sn(e, t) {
		let n = g[e];
		if (!n || t === e || t && On(e).indexOf(t) >= 0) return;
		let r = t || "";
		(n.parentId || "") !== r && (m.selectedEdgeId = null, I.innerHTML = "", Ue(() => {
			n.parentId = r, b[e] = Object.assign(b[e] || {}, { parentId: r }), delete v[e], delete y[e], w[e] && Object.assign(w[e].node, { parentId: r });
		}), H(), L.classList.contains("loc-open") && m.selectedNodeId === e && bn(), A("node-change", {
			id: e,
			node: { ...n },
			patch: { parentId: r },
			reparented: !0
		}), Y());
	}
	function cn(e) {
		sn(e, "");
	}
	function ln(e, t) {
		t && sn(e, t);
	}
	let un = null;
	function dn(e) {
		e && (un = e, M.classList.add("loc-attaching"), A("attach-start", { id: e }));
	}
	function fn() {
		un && (un = null, M.classList.remove("loc-attaching"), A("attach-cancel", {}));
	}
	function pn(e) {
		let t = un;
		return !t || !e || e === t || On(t).indexOf(e) >= 0 ? (fn(), !1) : (un = null, M.classList.remove("loc-attaching"), ln(t, e), p.inspector && yn(t), !0);
	}
	function mn(e, t, n) {
		let r = n.x - t.x, i = n.y - t.y, a = r * r + i * i, o = a ? ((e.x - t.x) * r + (e.y - t.y) * i) / a : 0;
		return o = Math.max(0, Math.min(1, o)), Math.hypot(e.x - (t.x + o * r), e.y - (t.y + o * i));
	}
	function hn(e, t) {
		let n = Kt(e), r = 0, i = Infinity;
		for (let e of n) {
			let n = mn(t, e.a, e.b);
			n < i && (i = n, r = e.insert);
		}
		return r;
	}
	let gn = [
		"",
		"Balanced",
		"Center",
		"Left",
		"Right",
		"Alternate",
		"AlternateLeft",
		"AlternateRight"
	];
	function U(e) {
		return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
	}
	function _n() {
		M.classList.toggle("loc-edit", m.editMode);
	}
	function vn(e) {
		m.editMode = !!e, _n(), $(), m.editMode || Jt(), L.classList.contains("loc-open") && bn(), A("edit-mode-change", { editMode: m.editMode }), X();
	}
	function yn(e) {
		p.inspector && (m.selectedNodeId = e, L.classList.add("loc-open"), bn(), A("inspector-open", {
			id: e,
			node: g[e]
		}));
	}
	function W() {
		L.classList.contains("loc-open") && (L.classList.remove("loc-open"), A("inspector-close", {}));
	}
	function bn() {
		let e = m.selectedNodeId, t = e && g[e];
		if (!t) {
			W();
			return;
		}
		if (Pe.textContent = t.label || t.personName || t.id, p.inspectorSlot) {
			Ne.innerHTML = "";
			return;
		}
		let n = m.editMode, r = n ? "" : " disabled", i = (e, t, n) => `<input data-field="${e}" type="${n || "text"}" value="${U(t)}"${r}/>`, a = (e, t, n) => `<select data-field="${e}"${r}>` + n.map((e) => {
			let n = Array.isArray(e) ? e[0] : e, r = Array.isArray(e) ? e[1] : e || "—";
			return `<option value="${U(n)}"${String(n) === String(t ?? "") ? " selected" : ""}>${r}</option>`;
		}).join("") + "</select>", o = (e, t) => `<label class="loc-field"><span>${e}</span>${t}</label>`, s = o("ID", `<input value="${U(t.id)}" disabled/>`) + o("Type", a("type", t.type, [["department", "department"], ["position", "position"]])) + o("Label", i("label", t.label));
		t.type !== "department" && (s += p.userSearch ? `<label class="loc-field loc-usersearch"><span>Person name</span>${i("personName", t.personName)}<div class="loc-usersearch-list" data-role="user-results" hidden></div></label>` : o("Person name", i("personName", t.personName)), s += o("Status", a("status", t.status, [
			["", "—"],
			["FILLED", "FILLED"],
			["VACANT", "VACANT"],
			["UNFUNDED", "UNFUNDED"]
		])) + o("Photo URL", i("photo_url", t.data && t.data.photo_url || ""))), s += o("Layout override", a("layoutMode", t.layoutMode || "", gn.map((e) => [e, e || "(inherit)"]))) + o("Width", i("width", t.width, "number")) + o("Height", i("height", t.height, "number")), Me.innerHTML = s, Ne.innerHTML = n ? "<button data-role=\"add-child\">+ Add child</button>" + (t.parentId ? "<button data-role=\"detach\">Detach</button>" : "<button data-role=\"attach\">Attach…</button>") + "<button data-role=\"del-node\" class=\"loc-danger\">Delete</button>" : "<span class=\"loc-foot-hint\">Turn on Edit to modify fields</span>";
	}
	let xn = 0, Sn = 0;
	function Cn(e) {
		if (!p.userSearch) return;
		let t = Me.querySelector("[data-role=\"user-results\"]");
		if (!t) return;
		xn && clearTimeout(xn);
		let n = (e || "").trim();
		if (!n) {
			t.hidden = !0, t.innerHTML = "";
			return;
		}
		let r = ++Sn;
		xn = setTimeout(() => {
			try {
				Promise.resolve(p.userSearch(n, g[m.selectedNodeId])).then((e) => {
					r === Sn && wn(t, Array.isArray(e) ? e : []);
				}).catch(() => {});
			} catch {}
		}, 220);
	}
	function wn(e, t) {
		if (!t.length) {
			e.hidden = !0, e.innerHTML = "";
			return;
		}
		e.innerHTML = t.slice(0, 8).map((e, t) => {
			let n = U(e.name || e.personName || e.label || ""), r = U(e.title || e.label || e.email || "");
			return `<button type="button" class="loc-usersearch-item" data-uidx="${t}"><b>${n}</b>${r ? `<small>${r}</small>` : ""}</button>`;
		}).join(""), e.hidden = !1, e._users = t;
	}
	function Tn(e) {
		let t = m.selectedNodeId, n = t && g[t];
		if (!n) return;
		let r = p.userToFields ? p.userToFields(e, n) : null;
		if (!r) {
			r = {};
			let t = e.name || e.personName || e.label;
			t && (r.personName = t), e.title && (r.label = e.title);
			let n = e.photo_url || e.avatar || e.image;
			n && (r.photo_url = n);
		}
		if ("photo_url" in r) {
			let e = r.photo_url;
			delete r.photo_url, r.data = Object.assign({}, n.data, { photo_url: e || null });
		}
		Dn(t, r);
		let i = Me.querySelector("[data-role=\"user-results\"]");
		i && (i.hidden = !0, i.innerHTML = ""), bn(), A("user-select", {
			id: t,
			user: e,
			node: { ...g[t] }
		});
	}
	function En() {
		let e;
		do
			e = "node-" + ++ge;
		while (g[e]);
		return e;
	}
	function Dn(e, t) {
		let n = g[e];
		if (!n) return;
		Object.assign(n, t), w[e] && w[e].node !== n && Object.assign(w[e].node, t), b[e] = Object.assign(b[e] || {}, t);
		let r = [
			"type",
			"width",
			"height",
			"layoutMode"
		].some((e) => e in t);
		T[e] && (T[e].remove(), delete T[e]), r ? B() : We(), A("node-change", {
			id: e,
			node: { ...n },
			patch: t
		}), X(), Y("field:" + e + ":" + Object.keys(t).join(","));
	}
	function On(e) {
		let t = [], n = [e];
		for (; n.length;) {
			let e = n.pop();
			for (let r of h) r.parentId === e && (t.push(r.id), n.push(r.id));
		}
		return t;
	}
	function kn(e) {
		if (!m.editMode) return;
		let t = En(), n = f({
			id: t,
			parentId: e || "",
			type: "position",
			label: "NEW POSITION",
			personName: "",
			status: ""
		});
		h.push(n), g[t] = n, b[t] = Object.assign({ __new: !0 }, n), B(), Ot(t), yn(t), A("node-change", {
			id: t,
			node: { ...n },
			added: !0
		}), X(), Y();
	}
	function An(e) {
		if (!m.editMode || !e) return;
		let t = [e].concat(On(e)), r = new Set(t);
		h = h.filter((e) => !r.has(e.id)), g = n(h), t.forEach((e) => {
			b[e] = { __deleted: !0 }, T[e] && (T[e].remove(), delete T[e]), x.delete(e);
		}), r.has(m.selectedNodeId) && (m.selectedNodeId = x.size ? [...x][x.size - 1] : null, m.selectedNodeId || W()), B(), A("node-change", {
			id: e,
			removed: !0,
			ids: t
		}), X(), Y();
	}
	function jn() {
		let e = new Set(Object.keys(b).filter((e) => b[e] && b[e].__deleted));
		e.size && (h = h.filter((t) => !e.has(t.id))), g = n(h);
		for (let e in b) {
			let t = b[e];
			if (!(!t || t.__deleted)) {
				if (t.__new) {
					if (!g[e]) {
						let n = Object.assign({}, t);
						delete n.__new;
						let r = f(n);
						h.push(r), g[e] = r;
					}
				} else g[e] && Object.assign(g[e], t);
			}
		}
	}
	let Mn = [
		["type", "Type"],
		["status", "Status"],
		["level", "Level (data.level)"],
		["unit", "Unit (data.unit)"],
		["id", "Node id"],
		["label", "Label"]
	];
	function Nn(e, t) {
		let n = re(t, S);
		Pn(e, "--loc-node-bg", n && n.bg), Pn(e, "--loc-node-text", n && n.text), Pn(e, "--loc-node-border", n && n.border);
	}
	function Pn(e, t, n) {
		n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
	}
	function Fn() {
		for (let e in T) g[e] && Nn(T[e], g[e]);
		m.showLegend && Bn();
	}
	let In = {
		FILLED: "Filled",
		VACANT: "Vacant",
		UNFUNDED: "Unfunded"
	};
	function Ln() {
		Le.classList.toggle("loc-on", m.showLegend), m.showLegend && Bn();
	}
	function Rn(e) {
		return m.showLegend = e == null ? !m.showLegend : !!e, Ln(), $(), X(), A("legend-change", { legend: m.showLegend }), m.showLegend;
	}
	function zn(e) {
		return Rn(e ?? !m.showLegend);
	}
	function Bn() {
		if (p.legendSlot) return;
		let e = Object.create(null), t = Object.create(null);
		for (let n of h) n.type && (e[n.type] = !0), n.status && (t[n.status] = !0);
		let n = "", r = [];
		e.department && r.push(Hn("loc-leg-dept", "Department")), e.position && r.push(Hn("loc-leg-pos", "Position")), r.length && (n += Vn("Type", r.join("")));
		let i = [
			"FILLED",
			"VACANT",
			"UNFUNDED"
		].filter((e) => t[e]).map((e) => `<div class="loc-leg-row"><span class="loc-leg-badge loc-${e}">${In[e] || e}</span></div>`);
		i.length && (n += Vn("Status", i.join("")));
		let a = S.filter((e) => e.enabled && (e.style.bg || e.style.border)).map((e) => `<div class="loc-leg-row"><span class="loc-leg-swatch" style="background:${U(e.style.bg || "#fff")};border-color:${U(e.style.border || e.style.bg || "#d0d5dd")}"></span><span class="loc-leg-label">${U(e.field)} = ${U(e.value || "—")}</span></div>`).join("");
		a && (n += Vn("Rules", a)), ze.innerHTML = n || "<div class=\"loc-leg-empty\">No legend items yet.</div>";
	}
	function Vn(e, t) {
		return `<div class="loc-leg-section"><div class="loc-leg-title">${e}</div>${t}</div>`;
	}
	function Hn(e, t) {
		return `<div class="loc-leg-row"><span class="loc-leg-swatch ${e}"></span><span class="loc-leg-label">${t}</span></div>`;
	}
	function G() {
		return {
			spacingX: m.spacingX,
			spacingY: m.spacingY,
			gridSize: m.gridSize,
			orientation: m.orientation,
			subtreeMode: m.subtreeMode,
			showGrid: m.showGrid,
			snapGrid: m.snapGrid,
			alignGrid: m.alignGrid,
			showImages: m.showImages,
			autoEdgeSide: m.autoEdgeSide,
			cardWidth: m.cardWidth,
			photoHeight: m.photoHeight,
			photoContain: m.photoContain,
			themeRules: S.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		};
	}
	function Un(e, t) {
		if (e ||= {}, typeof e.spacingX == "number" && (m.spacingX = e.spacingX), typeof e.spacingY == "number" && (m.spacingY = e.spacingY), typeof e.gridSize == "number" && (m.gridSize = e.gridSize), e.orientation && (m.orientation = de(e.orientation)), e.subtreeMode && (m.subtreeMode = e.subtreeMode), "showGrid" in e && (m.showGrid = !!e.showGrid), "snapGrid" in e && (m.snapGrid = !!e.snapGrid), "alignGrid" in e && (m.alignGrid = !!e.alignGrid), "showImages" in e && !!e.showImages !== m.showImages) {
			m.showImages = !!e.showImages;
			for (let e in T) T[e].remove(), delete T[e];
		}
		"autoEdgeSide" in e && (m.autoEdgeSide = !!e.autoEdgeSide);
		let n = !1;
		if (typeof e.cardWidth == "number" && (m.cardWidth = Math.max(100, e.cardWidth), n = !0), typeof e.photoHeight == "number" && (m.photoHeight = Math.max(40, e.photoHeight), n = !0), "photoContain" in e && (m.photoContain = !!e.photoContain, n = !0), n) {
			Ge(), Ke();
			for (let e in T) delete T[e].dataset.fitted;
		}
		Array.isArray(e.themeRules) && (S = e.themeRules.map(ie)), ot(), $(), B(), R.classList.contains("loc-open") && Xn(), t && t.silent || A("settings-change", G()), X();
	}
	function Wn(e) {
		let t = R.classList.contains("loc-open"), n = e == null ? !t : !!e;
		R.classList.toggle("loc-open", n), N && N.querySelectorAll("button[data-act=\"settings\"]").forEach((e) => e.classList.toggle("loc-active", n)), n && Xn(), n !== t && A(n ? "settings-open" : "settings-close", {});
	}
	function Gn() {
		Un({
			spacingX: he.spacingX,
			spacingY: he.spacingY,
			gridSize: he.gridSize,
			showGrid: he.showGrid,
			snapGrid: he.snapGrid,
			alignGrid: he.alignGrid,
			themeRules: he.themeRules.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		}), Fn();
	}
	function Kn(e, t, n, r, i) {
		return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${r}" max="${i}" value="${n}"/></label>`;
	}
	function qn(e, t, n, r) {
		return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${r ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${r || "#e0524d"}"/></label>`;
	}
	function Jn(e, t) {
		let n = (t, n) => `<option value="${t}"${e.field === t ? " selected" : ""}>${n}</option>`;
		return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + Mn.map(([e, t]) => n(e, t)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${U(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + qn(t, "bg", "BG", e.style.bg) + qn(t, "text", "Text", e.style.text) + qn(t, "border", "Border", e.style.border) + "</div></div>";
	}
	function Yn() {
		let e = vr().map((e) => `<div class="loc-preset"><button class="loc-preset-apply" data-role="preset-apply" data-name="${U(e.name)}" title="Apply this saved layout">${U(e.name)}</button><span class="loc-preset-tag">${e.full ? "full" : "pattern"}</span><button class="loc-preset-del" data-role="preset-del" data-name="${U(e.name)}" title="Delete preset">✕</button></div>`).join("");
		return e ||= "<div class=\"loc-set-hint\">No saved presets yet.</div>", `<div class="loc-set-section"><div class="loc-set-title">Presets</div><div class="loc-set-hint">Save the current arrangement so an accidental mode change can’t lose it (Undo / Ctrl+Z restores it too).</div><div class="loc-preset-save"><input type="text" data-role="preset-name" placeholder="Preset name…"/><label class="loc-preset-full"><input type="checkbox" data-role="preset-full" checked/> positions</label><button data-role="preset-save">Save</button></div><div class="loc-preset-list">${e}</div></div>`;
	}
	function Xn() {
		if (p.settingsSlot) return;
		let e = Yn() + "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Layout</div>" + Kn("spacingX", "Spacing X", m.spacingX, 0, 200) + Kn("spacingY", "Spacing Y", m.spacingY, 0, 260) + Kn("gridSize", "Grid size", m.gridSize, 6, 80) + `<label class="loc-color"><input type="checkbox" data-set-toggle="showImages"${m.showImages ? " checked" : ""}/><span>Show photos (off → user icon)</span></label><label class="loc-color"><input type="checkbox" data-set-toggle="autoEdgeSide"${m.autoEdgeSide ? " checked" : ""}/><span>Smart edges (lines follow waypoints to any side)</span></label></div>`;
		e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Card size</div><div class=\"loc-set-hint\">Applies to every person card. The photo tops the card at its full size; the name/title sit below.</div>" + Kn("cardWidth", "Card width", m.cardWidth, 120, 320) + Kn("photoHeight", "Photo height", m.photoHeight, 60, 240) + `<label class="loc-color"><input type="checkbox" data-set-toggle="photoContain"${m.photoContain ? " checked" : ""}/><span>Show whole photo (no crop)</span></label></div>`, e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Theme rules</div><div class=\"loc-set-hint\">Recolor nodes that match a field = value. Later rules win.</div>", S.forEach((t, n) => {
			e += Jn(t, n);
		}), e += "<button class=\"loc-set-add\" data-role=\"add-rule\">+ Add rule</button></div>", e += "<div class=\"loc-set-foot\"><button class=\"loc-set-reset\" data-role=\"reset-settings\" title=\"Restore spacing, grid &amp; theme rules to defaults\">↺ Reset settings</button></div>", Ie.innerHTML = e;
	}
	function Zn(e, t) {
		let n = Ie.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
		return n && n.checked;
	}
	function Qn(e, t) {
		let n = Ie.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
		return n ? n.value : "";
	}
	let K = [], q = -1, $n = !1, er = null;
	function J(e) {
		return e == null ? e : JSON.parse(JSON.stringify(e));
	}
	function tr() {
		return {
			subtreeMode: m.subtreeMode,
			orientation: m.orientation,
			spacingX: m.spacingX,
			spacingY: m.spacingY,
			gridSize: m.gridSize,
			showGrid: m.showGrid,
			snapGrid: m.snapGrid,
			alignGrid: m.alignGrid,
			showImages: m.showImages,
			autoEdgeSide: m.autoEdgeSide,
			cardWidth: m.cardWidth,
			photoHeight: m.photoHeight,
			photoContain: m.photoContain,
			themeRules: S.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		};
	}
	function nr(e) {
		e && (e.subtreeMode && (m.subtreeMode = e.subtreeMode), e.orientation && (m.orientation = de(e.orientation)), [
			"spacingX",
			"spacingY",
			"gridSize"
		].forEach((t) => {
			typeof e[t] == "number" && (m[t] = e[t]);
		}), "showGrid" in e && (m.showGrid = !!e.showGrid), "snapGrid" in e && (m.snapGrid = !!e.snapGrid), "alignGrid" in e && (m.alignGrid = !!e.alignGrid), "showImages" in e && (m.showImages = !!e.showImages), "autoEdgeSide" in e && (m.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (m.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (m.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (m.photoContain = !!e.photoContain), Ge(), Ke(), Array.isArray(e.themeRules) && (S = e.themeRules.map(ie)));
	}
	function rr() {
		return {
			nodes: h.map((e) => J(e)),
			manualOffsets: J(_),
			edgeWaypoints: J(v),
			edgeAnchors: J(y),
			nodeOverrides: J(b),
			view: tr(),
			selectedNodeId: m.selectedNodeId
		};
	}
	function ir(e) {
		$n = !0, h = (e.nodes || []).map(f), g = n(h), _ = J(e.manualOffsets) || Object.create(null), v = J(e.edgeWaypoints) || Object.create(null), y = J(e.edgeAnchors) || Object.create(null), b = J(e.nodeOverrides) || Object.create(null), nr(e.view);
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		m.selectedEdgeId = null, I.innerHTML = "", m.selectedNodeId = e.selectedNodeId && g[e.selectedNodeId] ? e.selectedNodeId : null, ot(), B(), m.selectedNodeId && Ot(m.selectedNodeId), L.classList.contains("loc-open") && (m.selectedNodeId ? bn() : W()), R.classList.contains("loc-open") && Xn(), $n = !1;
	}
	function Y(e) {
		if ($n) return;
		let t = rr();
		e != null && e === er && q >= 0 ? K[q] = t : (K = K.slice(0, q + 1), K.push(t), q = K.length - 1, K.length > 100 && (K.shift(), q--)), er = e ?? null, ur();
	}
	function ar() {
		K = [rr()], q = 0, er = null, ur();
	}
	function or() {
		return q > 0;
	}
	function sr() {
		return q >= 0 && q < K.length - 1;
	}
	function cr() {
		or() && (q--, er = null, ir(K[q]), ur());
	}
	function lr() {
		sr() && (q++, er = null, ir(K[q]), ur());
	}
	function ur() {
		$(), A("history-change", {
			canUndo: or(),
			canRedo: sr()
		});
	}
	function X() {
		if (p.persist) try {
			localStorage.setItem(p.storageKey, JSON.stringify({
				orientation: m.orientation,
				subtreeMode: m.subtreeMode,
				spacingX: m.spacingX,
				spacingY: m.spacingY,
				zoom: m.zoom,
				panX: m.panX,
				panY: m.panY,
				showGrid: m.showGrid,
				snapGrid: m.snapGrid,
				alignGrid: m.alignGrid,
				gridSize: m.gridSize,
				editMode: m.editMode,
				showImages: m.showImages,
				showLegend: m.showLegend,
				autoEdgeSide: m.autoEdgeSide,
				cardWidth: m.cardWidth,
				photoHeight: m.photoHeight,
				photoContain: m.photoContain,
				manualOffsets: _,
				edgeWaypoints: v,
				edgeAnchors: y,
				nodeOverrides: b,
				themeRules: S,
				collapsed: h.filter((e) => e.collapsed).map((e) => e.id)
			}));
		} catch {}
	}
	function dr() {
		if (!p.persist) return;
		let e;
		try {
			e = JSON.parse(localStorage.getItem(p.storageKey) || "null");
		} catch {
			e = null;
		}
		if (e && (e.orientation && (m.orientation = de(e.orientation)), e.subtreeMode && (m.subtreeMode = e.subtreeMode), [
			"spacingX",
			"spacingY",
			"zoom",
			"panX",
			"panY",
			"gridSize"
		].forEach((t) => {
			typeof e[t] == "number" && (m[t] = e[t]);
		}), m.showGrid = !!e.showGrid, m.snapGrid = !!e.snapGrid, m.alignGrid = !!e.alignGrid, m.editMode = !!e.editMode, "showImages" in e && (m.showImages = !!e.showImages), "showLegend" in e && (m.showLegend = !!e.showLegend), "autoEdgeSide" in e && (m.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (m.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (m.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (m.photoContain = !!e.photoContain), Ge(), Ke(), e.manualOffsets && (_ = e.manualOffsets), e.edgeWaypoints && (v = e.edgeWaypoints), e.edgeAnchors && (y = e.edgeAnchors), e.nodeOverrides && (b = e.nodeOverrides, jn()), Array.isArray(e.themeRules) && (S = e.themeRules.map(ie)), Array.isArray(e.collapsed))) {
			let t = new Set(e.collapsed);
			for (let e of h) e.collapsed = t.has(e.id);
		}
	}
	function fr() {
		return p.storageKey + ".presets";
	}
	function pr() {
		try {
			return JSON.parse(localStorage.getItem(fr()) || "{}") || {};
		} catch {
			return {};
		}
	}
	function mr(e) {
		try {
			localStorage.setItem(fr(), JSON.stringify(e));
		} catch {}
	}
	function hr(e) {
		let t = {
			full: e !== !1,
			view: tr()
		};
		return t.full && (t.layout = {
			manualOffsets: J(_),
			edgeWaypoints: J(v),
			edgeAnchors: J(y),
			nodeOverrides: J(b),
			collapsed: h.filter((e) => e.collapsed).map((e) => e.id)
		}), t;
	}
	function gr(e) {
		return hr(!(e && e.full === !1));
	}
	function _r(e) {
		if (e) {
			if (nr(e.view), e.full && e.layout) {
				_ = J(e.layout.manualOffsets) || Object.create(null), v = J(e.layout.edgeWaypoints) || Object.create(null), y = J(e.layout.edgeAnchors) || Object.create(null), b = J(e.layout.nodeOverrides) || Object.create(null), jn();
				let t = new Set(e.layout.collapsed || []);
				for (let e of h) e.collapsed = t.has(e.id);
			} else _ = Object.create(null), v = Object.create(null), y = Object.create(null);
			m.selectedNodeId = null, m.selectedEdgeId = null, I.innerHTML = "";
			for (let e in T) T[e].remove(), delete T[e];
			for (let e in E) E[e].remove(), delete E[e];
			for (let e in D) D[e].remove(), delete D[e];
			ot(), $(), B(), R.classList.contains("loc-open") && Xn(), ut(), Y(), A("settings-change", G());
		}
	}
	function vr() {
		let e = pr();
		return Object.keys(e).map((t) => ({
			name: t,
			full: !!e[t].full,
			savedAt: e[t].savedAt || null
		}));
	}
	function yr() {
		return pr();
	}
	function br(e, t) {
		if (e = String(e ?? "").trim(), !e) return null;
		let n = hr(!(t && t.full === !1));
		n.name = e, n.savedAt = Date.now();
		let r = pr();
		return r[e] = n, mr(r), R.classList.contains("loc-open") && Xn(), A("presets-change", { presets: vr() }), n;
	}
	function xr(e) {
		let t = pr()[String(e)];
		return t ? (_r(t), A("preset-load", {
			name: String(e),
			preset: t
		}), !0) : !1;
	}
	function Sr(e) {
		let t = pr();
		return String(e) in t && (delete t[String(e)], mr(t), R.classList.contains("loc-open") && Xn(), A("presets-change", { presets: vr() }), !0);
	}
	function Cr(e) {
		let t = ae(m, h, _, v);
		return t.editMode = m.editMode, t.edgeAnchors = y, t.nodeOverrides = b, t.settings = G(), e !== !1 && Pr(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
	}
	let wr = document.createElement("canvas").getContext("2d");
	function Tr(e, t) {
		return wr.font = t, wr.measureText(e).width;
	}
	function Er(e) {
		let t = T[e.id];
		if (!t) return 1;
		let n = parseFloat(t.style.getPropertyValue("--loc-fit"));
		return isFinite(n) && n > 0 ? n : 1;
	}
	function Dr(e, t) {
		let n = [];
		for (let e in E) n.push(E[e].getAttribute("d"));
		return ne(C, n, {
			manualOffsets: _,
			raster: !!e,
			measureText: Tr,
			fitOf: Er,
			photoHeight: m.photoHeight,
			photoContain: m.photoContain,
			images: t || null
		});
	}
	function Or(e) {
		return new Promise((t) => {
			let n = new Image();
			n.crossOrigin = "anonymous", n.referrerPolicy = "no-referrer", n.onload = () => {
				try {
					let e = n.naturalWidth || n.width, r = n.naturalHeight || n.height;
					if (!e || !r) {
						t(null);
						return;
					}
					let i = document.createElement("canvas");
					i.width = e, i.height = r, i.getContext("2d").drawImage(n, 0, 0), t(i.toDataURL("image/png"));
				} catch {
					t(null);
				}
			}, n.onerror = () => t(null), n.src = e;
		});
	}
	function kr() {
		if (!m.showImages) return Promise.resolve({});
		let e = [], t = /* @__PURE__ */ new Set();
		for (let n of h) {
			let r = n.type !== "department" && n.data && n.data.photo_url;
			r && !t.has(r) && (t.add(r), e.push(r));
		}
		return e.length ? Promise.all(e.map((e) => Or(e).then((t) => [e, t]))).then((e) => {
			let t = {};
			for (let [n, r] of e) r && (t[n] = r);
			return t;
		}) : Promise.resolve({});
	}
	function Ar() {
		return kr().then((e) => {
			let t = Dr(!1, e);
			return Pr(new Blob([t], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), t;
		});
	}
	function jr(e) {
		return e ||= 3, kr().then((t) => new Promise((n) => {
			let r = d(C, _, 40), i = 16e3, a = 2e8, o = Math.min(e, i / r.w, i / r.h);
			r.w * o * r.h * o > a && (o = Math.sqrt(a / (r.w * r.h))), o = Math.max(.05, o);
			let s = URL.createObjectURL(new Blob([Dr(!0, t)], { type: "image/svg+xml;charset=utf-8" })), c = new Image();
			c.onload = () => {
				let e = document.createElement("canvas");
				e.width = Math.round(r.w * o), e.height = Math.round(r.h * o);
				let t = e.getContext("2d");
				t.setTransform(o, 0, 0, o, 0, 0), t.drawImage(c, 0, 0), URL.revokeObjectURL(s);
				try {
					e.toBlob((e) => {
						e && Pr(e, "org-chart.png"), n(!!e);
					}, "image/png");
				} catch {
					n(!1);
				}
			}, c.onerror = () => {
				URL.revokeObjectURL(s), n(!1);
			}, c.src = s;
		}));
	}
	function Mr(e) {
		e ||= {};
		let t = +e.scale > 0 ? +e.scale : 2, n = typeof e.quality == "number" ? Math.min(1, Math.max(.3, e.quality)) : .82, r = +e.maxSide > 0 ? +e.maxSide : 4e3, i = e.as === "dataURL" || e.as === "dataurl", a = e.filename || "org-chart.webp";
		return kr().then((o) => new Promise((s) => {
			let c = d(C, _, 40), l = 2e8, u = Math.min(t, r / c.w, r / c.h);
			c.w * u * c.h * u > l && (u = Math.sqrt(l / (c.w * c.h))), u = Math.max(.05, u);
			let ee = URL.createObjectURL(new Blob([Dr(!0, o)], { type: "image/svg+xml;charset=utf-8" })), f = new Image();
			f.onload = () => {
				let t = document.createElement("canvas");
				t.width = Math.round(c.w * u), t.height = Math.round(c.h * u);
				let r = t.getContext("2d");
				r.setTransform(u, 0, 0, u, 0, 0), r.drawImage(f, 0, 0), URL.revokeObjectURL(ee);
				try {
					if (i) {
						let r = t.toDataURL("image/webp", n);
						if (e.download) {
							let e = document.createElement("a");
							e.href = r, e.download = a, document.body.appendChild(e), e.click(), e.remove();
						}
						s(r);
						return;
					}
					t.toBlob((t) => {
						t && e.download && Pr(t, a), s(t || null);
					}, "image/webp", n);
				} catch {
					s(null);
				}
			}, f.onerror = () => {
				URL.revokeObjectURL(ee), s(null);
			}, f.src = ee;
		}));
	}
	function Nr() {
		return kr().then((e) => {
			let t = window.open("", "_blank");
			return t ? (t.document.open(), t.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + Dr(!1, e) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), t.document.close(), !0) : !1;
		});
	}
	function Pr(e, t) {
		let n = URL.createObjectURL(e), r = document.createElement("a");
		r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), URL.revokeObjectURL(n);
	}
	function Fr(e, t, r) {
		let i = !(r && r.resetEdits);
		h = (e || []).map(f), g = n(h), i || (_ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.create(null)), m.selectedNodeId = null, m.selectedEdgeId = null, ve = /* @__PURE__ */ new Set(), W();
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		t && (t.subtreeMode && (m.subtreeMode = t.subtreeMode), t.orientation && (m.orientation = de(t.orientation)), t.manualOffsets && (_ = t.manualOffsets), t.edgeWaypoints && (v = t.edgeWaypoints), t.edgeAnchors && (y = t.edgeAnchors), t.nodeOverrides && (b = t.nodeOverrides), typeof t.editMode == "boolean" && (m.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (S = t.settings.themeRules.map(ie))), i && jn(), _n(), $(), B(), p.fitOnInit && st();
	}
	function Ir(e) {
		let { nodes: t, meta: n } = te(e);
		return Fr(t, n), t.length;
	}
	function Lr(e) {
		let t = de(e);
		m.orientation = t, _ = Object.create(null), v = Object.create(null), y = Object.create(null), Jt(), $(), B(), ut(), A("orientation-change", { orientation: t }), Y();
	}
	function Rr(e) {
		m.subtreeMode = e, _ = Object.create(null), v = Object.create(null), y = Object.create(null), Jt(), $(), B(), ut(), A("subtree-mode-change", { subtreeMode: e }), Y();
	}
	function zr(e, t) {
		e != null && (m.spacingX = e), t != null && (m.spacingY = t), B(), A("settings-change", G()), Y("spacing");
	}
	function Br(e, t) {
		e in m ? (m[e] = t, e === "showGrid" && ot(), e === "alignGrid" && (_ = Object.create(null), B()), $(), X(), [
			"showGrid",
			"snapGrid",
			"alignGrid",
			"gridSize"
		].includes(e) && A("settings-change", G())) : p[e] = t;
	}
	function Vr(e) {
		return Br("showGrid", !!e), m.showGrid;
	}
	function Hr(e) {
		return Br("snapGrid", !!e), m.snapGrid;
	}
	function Ur(e) {
		return Br("alignGrid", !!e), m.alignGrid;
	}
	function Wr(e) {
		return Vr(e ?? !m.showGrid);
	}
	function Gr(e) {
		return m.autoEdgeSide = e == null ? !m.autoEdgeSide : !!e, Jt(), B(), R.classList.contains("loc-open") && Xn(), X(), A("settings-change", G()), m.autoEdgeSide;
	}
	function Kr(e) {
		m.showImages = e == null ? !m.showImages : !!e;
		for (let e in T) T[e].remove(), delete T[e];
		return We(), $(), X(), A("settings-change", G()), m.showImages;
	}
	function qr() {
		_ = Object.create(null), v = Object.create(null), y = Object.create(null), Jt(), B(), ut(), Y();
	}
	function Jr() {
		ht(), W(), qr(), st();
	}
	function Yr() {
		return document.fullscreenElement || document.webkitFullscreenElement || null;
	}
	function Xr() {
		return Yr() === M;
	}
	function Zr() {
		let e = M.requestFullscreen || M.webkitRequestFullscreen;
		if (e) try {
			let t = e.call(M);
			t && t.catch && t.catch(() => {});
		} catch {}
	}
	function Qr() {
		let e = document.exitFullscreen || document.webkitExitFullscreen;
		if (e && Yr()) try {
			e.call(document);
		} catch {}
	}
	function $r(e) {
		let t = e == null ? !Xr() : !!e;
		return t ? Zr() : Qr(), t;
	}
	function ei() {
		let e = Xr();
		M.classList.toggle("loc-fullscreen", e), Ae && (Ae.title = e ? "Exit fullscreen" : "Fullscreen"), $(), st(), A("fullscreen-change", { fullscreen: e });
	}
	j(De, "pointerdown", (e) => {
		let t = e.target.closest(".loc-node");
		t && _t(e, t.dataset.id);
	}), j(De, "click", (e) => {
		let t = e.target.closest("[data-role=\"toggle\"]");
		if (t && !p.readonly) {
			pt(t.closest(".loc-node").dataset.id);
			return;
		}
		let n = e.target.closest(".loc-node");
		n && A("node-click", {
			id: n.dataset.id,
			node: g[n.dataset.id]
		});
	}), j(Ee, "pointerdown", (e) => {
		let t = e.target.closest("path");
		t && (e.stopPropagation(), qt(t.dataset.edge));
	}), j(Ee, "dblclick", (e) => {
		if (p.readonly || !m.editMode) return;
		let t = e.target.closest("path");
		if (!t) return;
		let n = t.dataset.edge;
		qt(n);
		let r = Gt(n);
		if (!r) return;
		let i = Wt(Ut(e.clientX, e.clientY));
		(v[n] || (v[n] = [])).splice(hn(r, i), 0, i), rt(n), Zt(), X(), Y();
	}), j(I, "pointerdown", (e) => {
		if (p.readonly || !m.editMode) return;
		let t = e.target, n = m.selectedEdgeId;
		if (!n) return;
		if (t.dataset.ep) {
			e.stopPropagation(), e.preventDefault(), O = {
				id: n,
				kind: "ep",
				which: t.dataset.ep
			}, Z("pointermove", an), Z("pointerup", on);
			return;
		}
		let r;
		if (t.dataset.wp != null) r = +t.dataset.wp;
		else if (t.dataset.add != null) {
			let i = +t.dataset.add;
			(v[n] || (v[n] = [])).splice(i, 0, Wt(Ut(e.clientX, e.clientY))), r = i, rt(n);
		} else return;
		e.stopPropagation(), e.preventDefault(), O = {
			id: n,
			idx: r
		}, Z("pointermove", ti), Z("pointerup", ni);
	}), j(I, "dblclick", (e) => {
		let t = e.target;
		if (t.dataset.ep === "parent") {
			cn(m.selectedEdgeId);
			return;
		}
		if (t.dataset.wp == null) return;
		let n = m.selectedEdgeId, r = v[n];
		r && (r.splice(+t.dataset.wp, 1), r.length || delete v[n], rt(n), Zt(), X(), Y());
	});
	function ti(e) {
		if (!O) return;
		let t = v[O.id];
		t && (t[O.idx] = xt(O.id, Wt(Ut(e.clientX, e.clientY))), rt(O.id), Zt());
	}
	function ni() {
		O = null, Ct(), Q("pointermove", ti), Q("pointerup", ni), X(), Y();
	}
	j(Le, "click", (e) => {
		e.target.closest("[data-role=\"legend-close\"]") && Rn(!1);
	}), j(L, "click", (e) => {
		if (e.target.closest("[data-role=\"panel-close\"]")) {
			W();
			return;
		}
		if (e.target.closest("[data-role=\"add-child\"]")) {
			kn(m.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"detach\"]")) {
			cn(m.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"attach\"]")) {
			let e = m.selectedNodeId;
			W(), dn(e);
			return;
		}
		if (e.target.closest("[data-role=\"del-node\"]")) {
			An(m.selectedNodeId);
			return;
		}
		let t = e.target.closest("[data-uidx]");
		if (t) {
			let e = t.closest("[data-role=\"user-results\"]"), n = e && e._users && e._users[+t.dataset.uidx];
			n && Tn(n);
			return;
		}
	}), j(Me, "input", (e) => {
		if (!m.editMode) return;
		let t = e.target.closest("[data-field]");
		if (!t) return;
		let n = m.selectedNodeId;
		if (!n) return;
		let r = t.dataset.field, i = t.value;
		if (r === "type") {
			Dn(n, { type: i }), bn();
			return;
		}
		if (r === "width" || r === "height") {
			Dn(n, { [r]: Math.max(20, parseFloat(i) || 0) });
			return;
		}
		if (r === "photo_url") {
			let e = g[n];
			Dn(n, { data: Object.assign({}, e.data, { photo_url: i || null }) });
			return;
		}
		if (r === "layoutMode") {
			Dn(n, { layoutMode: i || null });
			return;
		}
		Dn(n, { [r]: i }), r === "personName" && Cn(i);
	}), j(R, "click", (e) => {
		if (e.target.closest("[data-role=\"settings-close\"]")) {
			Wn(!1);
			return;
		}
		if (e.target.closest("[data-role=\"reset-settings\"]")) {
			Gn();
			return;
		}
		if (e.target.closest("[data-role=\"preset-save\"]")) {
			let e = (Ie.querySelector("[data-role=\"preset-name\"]") || {}).value || "", t = !!(Ie.querySelector("[data-role=\"preset-full\"]") || {}).checked;
			e.trim() && br(e, { full: t });
			return;
		}
		let t = e.target.closest("[data-role=\"preset-apply\"]");
		if (t) {
			xr(t.dataset.name);
			return;
		}
		let n = e.target.closest("[data-role=\"preset-del\"]");
		if (n) {
			Sr(n.dataset.name);
			return;
		}
		if (e.target.closest("[data-role=\"add-rule\"]")) {
			S.push(ie({
				field: "type",
				value: "",
				style: {}
			})), Xn(), Fn(), X(), A("settings-change", G());
			return;
		}
		let r = e.target.closest("[data-rk=\"remove\"]");
		r && (S.splice(+r.dataset.rule, 1), Xn(), Fn(), X(), A("settings-change", G()));
	}), j(Ie, "input", (e) => {
		let t = e.target;
		if (t.dataset.set != null) {
			let e = t.dataset.set, n = parseFloat(t.value), r = Ie.querySelector(`[data-rangelabel="${e}"]`);
			if (r && (r.textContent = n), e === "cardWidth") {
				qe({ width: n });
				return;
			}
			if (e === "photoHeight") {
				qe({ photoHeight: n });
				return;
			}
			m[e] = n, B(), A("settings-change", G()), X();
			return;
		}
		if (t.dataset.setToggle === "showImages") {
			Kr(t.checked);
			return;
		}
		if (t.dataset.setToggle === "autoEdgeSide") {
			Gr(t.checked);
			return;
		}
		if (t.dataset.setToggle === "photoContain") {
			qe({ contain: t.checked });
			return;
		}
		if (t.dataset.rule != null) {
			let e = +t.dataset.rule, n = t.dataset.rk, r = S[e];
			if (!r) return;
			if (n === "enabled") r.enabled = t.checked;
			else if (n === "field") r.field = t.value;
			else if (n === "value") r.value = t.value;
			else if (n === "bg" || n === "text" || n === "border") Zn(e, n) && (r.style[n] = t.value);
			else if (/-on$/.test(n)) {
				let i = n.replace("-on", "");
				r.style[i] = t.checked ? Qn(e, i) || "#e0524d" : "";
			}
			Fn(), A("settings-change", G()), X();
		}
	}), j(P, "pointerdown", (e) => {
		if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn") || e.target.closest(".loc-legend")) return;
		ri();
		let t = () => {
			jt(), m.selectedEdgeId && Jt(), Ft(), un && fn(), W();
		};
		if (e.altKey) {
			Vt(e);
			return;
		}
		if (e.ctrlKey || e.metaKey) {
			Mt(e);
			return;
		}
		if (!p.enablePan) {
			t();
			return;
		}
		let n = e.clientX, r = e.clientY, i = m.panX, a = m.panY, o = !1;
		P.classList.add("loc-panning");
		let s = (e) => {
			!o && Math.abs(e.clientX - n) + Math.abs(e.clientY - r) > 3 && (o = !0), m.panX = i + (e.clientX - n), m.panY = a + (e.clientY - r), it();
		}, c = () => {
			P.classList.remove("loc-panning"), Q("pointermove", s), Q("pointerup", c), o || t();
		};
		Z("pointermove", s), Z("pointerup", c);
	}), j(P, "wheel", (e) => {
		if (!p.enableZoom || e.target.closest && (e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-legend"))) return;
		e.preventDefault();
		let t = P.getBoundingClientRect(), n = e.clientX - t.left, r = e.clientY - t.top, i = e.deltaY < 0 ? 1.1 : 1 / 1.1, a = Math.min(me, Math.max(.15, m.zoom * i));
		m.panX = n - (n - m.panX) * (a / m.zoom), m.panY = r - (r - m.panY) * (a / m.zoom), m.zoom = a, it();
	}, { passive: !1 });
	function Z(e, t) {
		window.addEventListener(e, t), ye.push({
			target: window,
			type: e,
			fn: t
		});
	}
	function Q(e, t) {
		window.removeEventListener(e, t);
	}
	function ri() {
		try {
			M.focus({ preventScroll: !0 });
		} catch {}
	}
	j(M, "keydown", (e) => {
		let t = e.target;
		if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
		let n = (e.key || "").toLowerCase();
		if (!(e.ctrlKey || e.metaKey)) {
			if (V.size && (n === "delete" || n === "backspace")) {
				e.preventDefault(), Lt();
				return;
			}
			if (n === "escape" && V.size) {
				e.preventDefault(), Ft();
				return;
			}
			return;
		}
		n === "z" && !e.shiftKey ? (e.preventDefault(), cr()) : (n === "z" && e.shiftKey || n === "y") && (e.preventDefault(), lr());
	});
	function ii() {
		let e = p.toolbar && typeof p.toolbar == "object" ? p.toolbar : {}, t = (t) => e[t] !== !1, n = z("div", "loc-toolbar"), r = "";
		return t("subtree") && (r += i("Subtree", [
			"Balanced",
			"Center",
			"Left",
			"Right",
			"Alternate",
			"AlternateLeft",
			"AlternateRight"
		].map((e) => a("mode", e, e)).join(""))), t("orient") && (r += i("Orient", [
			["TopToBottom", "Top"],
			["BottomToTop", "Bottom"],
			["LeftToRight", "Left"],
			["RightToLeft", "Right"]
		].map(([e, t]) => a("orient", e, t)).join(""))), t("history") && (r += i("", "<button data-act=\"undo\" title=\"Undo (Ctrl+Z)\">Undo</button><button data-act=\"redo\" title=\"Redo (Ctrl+Shift+Z)\">Redo</button>")), t("actions") && (r += i("", "<button data-act=\"expand\">Expand</button><button data-act=\"collapse\">Collapse</button><button data-act=\"fit\">Fit</button><button data-act=\"relayout\">Re-layout</button><button data-act=\"reset\">Reset</button><button data-act=\"fullscreen\" title=\"Toggle fullscreen\">Fullscreen</button>")), t("search") && (r += i("Search", "<input type=\"search\" data-role=\"search\" class=\"loc-search-input\" placeholder=\"Search…\" />")), t("grid") && (r += i("Grid", "<button data-flag=\"showGrid\">Show</button><button data-flag=\"snapGrid\">Snap</button><button data-flag=\"alignGrid\">Align</button>")), t("mode") && (r += i("Mode", "<button data-act=\"edit\" title=\"Toggle edit mode\">Edit</button><button data-act=\"images\" title=\"Toggle photos / user icons\">Images</button><button data-act=\"legend\" title=\"Toggle legend\">Legend</button><button data-act=\"settings\" title=\"Settings &amp; theming\">Settings</button>")), t("export") && (r += i("Export", "<button data-act=\"png\">PNG</button><button data-act=\"svg\">SVG</button><button data-act=\"pdf\">PDF</button><button data-act=\"json\">JSON</button>")), n.innerHTML = r, n.addEventListener("click", (e) => {
			let t = e.target.closest("button");
			if (t) {
				if (t.dataset.mode) Rr(t.dataset.mode);
				else if (t.dataset.orient) Lr(t.dataset.orient);
				else if (t.dataset.flag) m[t.dataset.flag] = !m[t.dataset.flag], t.dataset.flag === "showGrid" ? ot() : t.dataset.flag === "alignGrid" && (_ = Object.create(null), B()), $(), X();
				else switch (t.dataset.act) {
					case "undo":
						cr();
						break;
					case "redo":
						lr();
						break;
					case "expand":
						dt();
						break;
					case "collapse":
						ft();
						break;
					case "fit":
						st();
						break;
					case "relayout":
						qr();
						break;
					case "reset":
						Jr();
						break;
					case "fullscreen":
						$r();
						break;
					case "edit":
						vn(!m.editMode);
						break;
					case "images":
						Kr();
						break;
					case "legend":
						zn();
						break;
					case "settings":
						Wn();
						break;
					case "png":
						jr(3);
						break;
					case "svg":
						Ar();
						break;
					case "pdf":
						Nr();
						break;
					case "json":
						Cr(!0);
						break;
				}
			}
		}), n.addEventListener("input", (e) => {
			let t = e.target.closest("[data-role=\"search\"]");
			t && mt(t.value);
		}), n;
		function i(e, t) {
			return `<div class="loc-group">${e ? `<span class="loc-label">${e}</span>` : ""}${t}</div>`;
		}
		function a(e, t, n) {
			return `<button data-${e}="${t}">${n}</button>`;
		}
	}
	function $() {
		N && (N.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === m.subtreeMode)), N.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === m.orientation)), N.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!m[e.dataset.flag])), N.querySelectorAll("button[data-act=\"edit\"]").forEach((e) => e.classList.toggle("loc-active", m.editMode)), N.querySelectorAll("button[data-act=\"images\"]").forEach((e) => e.classList.toggle("loc-active", m.showImages)), N.querySelectorAll("button[data-act=\"legend\"]").forEach((e) => e.classList.toggle("loc-active", m.showLegend)), N.querySelectorAll("button[data-act=\"fullscreen\"]").forEach((e) => e.classList.toggle("loc-active", Xr())), N.querySelectorAll("button[data-act=\"undo\"]").forEach((e) => {
			e.disabled = !or();
		}), N.querySelectorAll("button[data-act=\"redo\"]").forEach((e) => {
			e.disabled = !sr();
		}));
	}
	j(document, "fullscreenchange", ei), j(document, "webkitfullscreenchange", ei), dr(), $(), ot(), Ln(), _n(), B(), ar(), p.fitOnInit && st();
	let ai = !1;
	function oi() {
		if (!ai) {
			ai = !0, ye.forEach(({ target: e, type: t, fn: n, optsL: r }) => e.removeEventListener(t, n, r)), ye.length = 0, _e && cancelAnimationFrame(_e), xn && clearTimeout(xn), M.remove();
			for (let e in T) delete T[e];
			for (let e in E) delete E[e];
			for (let e in D) delete D[e];
		}
	}
	let si = {
		root: M,
		setNodes: Fr,
		loadJSON: Ir,
		setOrientation: Lr,
		setSubtreeMode: Rr,
		setSpacing: zr,
		setOption: Br,
		setShowGrid: Vr,
		setSnapToGrid: Hr,
		setAlignToGrid: Ur,
		toggleGrid: Wr,
		fitToScreen: st,
		relayout: qr,
		resetView: Jr,
		expandAll: dt,
		collapseAll: ft,
		toggleCollapse: pt,
		centerOnNode: ct,
		search: mt,
		clearSearch: ht,
		exportJSON: Cr,
		exportSVG: Ar,
		exportPNG: jr,
		exportWebP: Mr,
		exportPDF: Nr,
		buildSVG: Dr,
		setEditMode: vn,
		isEditMode: () => m.editMode,
		setShowImages: Kr,
		isShowingImages: () => m.showImages,
		setShowLegend: Rn,
		toggleLegend: zn,
		isShowingLegend: () => m.showLegend,
		getLegendBody: () => ze,
		setAutoEdgeSide: Gr,
		isAutoEdgeSide: () => m.autoEdgeSide,
		setPhotoHeight: (e) => qe({ photoHeight: e }),
		setCardWidth: (e) => qe({ width: e }),
		setCardSize: qe,
		setPhotoContain: (e) => qe({ contain: e !== !1 }),
		getSelection: () => [...x],
		setSelection: (e) => At(Array.isArray(e) ? e : e ? [e] : []),
		clearSelection: () => {
			jt(), Dt();
		},
		getEdgeSelection: () => [...V],
		setEdgeSelection: It,
		clearEdgeSelection: Ft,
		resetSelectedEdges: Lt,
		enterFullscreen: Zr,
		exitFullscreen: Qr,
		toggleFullscreen: $r,
		isFullscreen: Xr,
		undo: cr,
		redo: lr,
		canUndo: or,
		canRedo: sr,
		updateNode: Dn,
		addChild: kn,
		deleteNode: An,
		reparentNode: sn,
		detachNode: cn,
		attachNode: ln,
		beginAttach: dn,
		cancelAttach: fn,
		isAttaching: () => !!un,
		openInspector: yn,
		closeInspector: W,
		nodeScreenRect: Ht,
		getSettings: G,
		setSettings: Un,
		toggleSettings: Wn,
		resetSettings: Gn,
		saveLayoutPreset: br,
		loadLayoutPreset: xr,
		deleteLayoutPreset: Sr,
		listLayoutPresets: vr,
		getLayoutPresets: yr,
		getLayout: gr,
		applyLayout: _r,
		getNodeHost: (e) => T[e] || null,
		getNodeSlotEl: (e) => T[e] ? T[e].querySelector(".loc-node-slot") : null,
		getInspectorBody: () => Me,
		getSettingsBody: () => Ie,
		nodeThemeStyle: (e) => g[e] ? re(g[e], S) : null,
		getState: () => ({ ...m }),
		getNodes: () => h.map((e) => ({ ...e })),
		getPositioned: () => C,
		on: xe,
		off: Se,
		destroy: oi
	};
	return si;
}
//#endregion
export { pe as t };
