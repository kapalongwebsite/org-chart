import { C as e, D as t, E as n, F as r, S as i, c as a, d as o, f as s, h as c, i as l, k as u, n as ee, o as d, r as te, s as ne, t as re, v as ie } from "./bounds-CQAjmKDe.js";
import { a as ae, i as oe, n as se, o as ce, s as le } from "./core-C89cy5Ou.js";
//#region src/vanilla/layoutTarget.js
function ue(e) {
	let t = Number(e?.clientWidth), n = Number(e?.clientHeight);
	return t > 0 && n > 0 ? {
		width: t,
		height: n
	} : null;
}
function de(e = {}, t = null) {
	return {
		targetAspect: e.targetAspect,
		targetSize: e.targetSize || (e.reflowOnResize ? ue(t) : null)
	};
}
//#endregion
//#region src/core/layout.worker.js?worker
function fe(e) {
	return new Worker("" + new URL("assets/layout.worker-C2cAKTC0.js", import.meta.url).href, { name: e?.name });
}
//#endregion
//#region src/vanilla/cloneLayoutValue.js
function pe(e) {
	if (typeof structuredClone == "function") try {
		return structuredClone(e);
	} catch {}
	return JSON.parse(JSON.stringify(e));
}
//#endregion
//#region src/vanilla/createOrgChart.js
var me = 116, he = "http://www.w3.org/2000/svg", ge = .72, _e = 12, ve = /* @__PURE__ */ new Map();
function ye(e, t) {
	for (ve.has(e) && ve.delete(e), ve.set(e, pe(t)); ve.size > _e;) ve.delete(ve.keys().next().value);
}
var f = {
	Top: "TopToBottom",
	Bottom: "BottomToTop",
	Left: "LeftToRight",
	Right: "RightToLeft"
};
function be(e) {
	return f[e] || e;
}
var xe = {
	nodes: [],
	orientation: "TopToBottom",
	subtreeMode: "AutoSmart",
	spacingX: 40,
	spacingY: 70,
	gridSize: 22,
	showGrid: !1,
	snapGrid: !1,
	alignGrid: null,
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
	cardWidth: r.width,
	photoContain: !0,
	showImages: !0,
	userSearch: null,
	userToFields: null,
	fitOnLayoutChange: !0,
	fitOnInit: !0,
	targetAspect: 1.6,
	targetSize: null,
	reflowOnResize: !1,
	layoutWorker: !0,
	layoutCache: !0,
	toolbar: !0,
	advancedLayoutControls: !1,
	persist: !1,
	storageKey: "local-org-chart.state"
};
function Se(ue, _e = {}) {
	if (!ue || !ue.appendChild) throw Error("createOrgChart: first argument must be a DOM element.");
	let f = Object.assign({}, xe, _e), Se = f.alignGrid == null ? f.subtreeMode === "GridSmart" : !!f.alignGrid, Ce = +f.maxZoom > 1 ? +f.maxZoom : 4, p = {
		orientation: be(f.orientation),
		subtreeMode: f.subtreeMode,
		spacingX: f.spacingX,
		spacingY: f.spacingY,
		zoom: 1,
		panX: 0,
		panY: 0,
		selectedNodeId: null,
		selectedEdgeId: null,
		selectedFamilyId: null,
		gridSize: f.gridSize,
		showGrid: f.showGrid,
		snapGrid: f.snapGrid,
		alignGrid: Se,
		editMode: !!f.editMode,
		showImages: f.showImages !== !1,
		showLegend: !!f.legend,
		autoEdgeSide: !!f.autoEdgeSide,
		photoHeight: +f.photoHeight || 104,
		cardWidth: +f.cardWidth || r.width,
		photoContain: f.photoContain !== !1
	}, m = (f.nodes || []).map(i), h = u(m), g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.assign(Object.create(null), f.familyRouteOverrides || {}), b = Object.create(null), x = /* @__PURE__ */ new Set(), S = (f.settings && f.settings.themeRules || f.themeRules || []).map(se), we = {
		spacingX: f.spacingX,
		spacingY: f.spacingY,
		gridSize: f.gridSize,
		showGrid: !!f.showGrid,
		snapGrid: !!f.snapGrid,
		alignGrid: Se,
		themeRules: S.map((e) => ({
			enabled: e.enabled,
			field: e.field,
			value: e.value,
			style: Object.assign({}, e.style)
		}))
	}, Te = 0, C = [], w = Object.create(null), Ee = [], De = [], Oe = null, T = Object.create(null), E = Object.create(null), D = Object.create(null), ke = Object.create(null), O = null, Ae = null, k = null, je = 0, Me = /* @__PURE__ */ new Set(), Ne = null, Pe = 0, Fe = null, Ie = 0, Le = 0, Re = 0, A = null, ze = !1, Be = Promise.resolve(!0), Ve = f.layoutWorker !== !1 && typeof Worker < "u", He = [], Ue = Object.create(null);
	function We(e, t) {
		return (Ue[e] || (Ue[e] = [])).push(t), ua;
	}
	function Ge(e, t) {
		return Ue[e] && (Ue[e] = Ue[e].filter((e) => e !== t)), ua;
	}
	function j(e, t) {
		(Ue[e] || []).forEach((e) => {
			try {
				e(t);
			} catch {}
		});
	}
	function M(e, t, n, r) {
		e.addEventListener(t, n, r), He.push({
			target: e,
			type: t,
			fn: n,
			optsL: r
		});
	}
	let N = document.createElement("div");
	N.className = "loc-root", N.tabIndex = -1;
	let P = f.toolbar ? sa() : null;
	P && N.appendChild(P);
	let F = B("div", "loc-canvas"), Ke = B("div", "loc-content"), qe = B("div", "loc-grid"), Je = document.createElementNS(he, "svg");
	Je.setAttribute("class", "loc-connectors");
	let Ye = document.createElementNS(he, "g");
	Ye.setAttribute("class", "loc-visible-edges");
	let Xe = document.createElementNS(he, "g");
	Xe.setAttribute("class", "loc-logical-edges");
	let Ze = document.createElementNS(he, "g");
	Ze.setAttribute("class", "loc-edgehits");
	let Qe = document.createElementNS(he, "g");
	Qe.setAttribute("class", "loc-familyhits"), Je.appendChild(Ye), Je.appendChild(Xe), Je.appendChild(Ze), Je.appendChild(Qe);
	let $e = B("div", "loc-nodes"), I = document.createElementNS(he, "svg");
	I.setAttribute("class", "loc-overlay");
	let L = document.createElementNS(he, "g");
	L.setAttribute("class", "loc-edgehandles");
	let et = document.createElementNS(he, "g");
	et.setAttribute("class", "loc-family-selection");
	let tt = document.createElementNS(he, "g");
	tt.setAttribute("class", "loc-aligns"), I.appendChild(tt), I.appendChild(et), I.appendChild(L);
	let nt = B("div", "loc-zoomreadout");
	nt.textContent = "100%", Ke.appendChild(qe), Ke.appendChild(Je), Ke.appendChild($e), Ke.appendChild(I), F.appendChild(Ke), F.appendChild(nt);
	let rt = null;
	f.fullscreenControl && (rt = B("button", "loc-fsbtn"), rt.type = "button", rt.title = "Fullscreen", rt.setAttribute("aria-label", "Toggle fullscreen"), rt.innerHTML = "⛶", M(rt, "click", (e) => {
		e.stopPropagation(), $i();
	}), F.appendChild(rt)), N.appendChild(F);
	let R = B("div", "loc-panel");
	R.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Node</span><button class=\"loc-panel-close\" title=\"Close\" data-role=\"panel-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"panel-body\"></div><div class=\"loc-panel-foot\" data-role=\"panel-foot\"></div>";
	let it = pt(f.inspectorTarget) || F;
	it.appendChild(R), it !== F && R.classList.add("loc-panel-external");
	let at = R.querySelector("[data-role=\"panel-body\"]"), ot = R.querySelector("[data-role=\"panel-foot\"]"), st = R.querySelector(".loc-panel-title"), z = B("div", "loc-settings");
	z.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Settings</span><button class=\"loc-panel-close\" title=\"Close\" data-role=\"settings-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"settings-body\"></div>";
	let ct = pt(f.settingsTarget) || F;
	ct.appendChild(z), ct !== F && z.classList.add("loc-panel-external");
	let lt = z.querySelector("[data-role=\"settings-body\"]"), ut = B("div", "loc-legend");
	ut.innerHTML = "<div class=\"loc-legend-head\"><span class=\"loc-legend-title\">Legend</span><button class=\"loc-legend-close\" title=\"Hide legend\" data-role=\"legend-close\">✕</button></div><div class=\"loc-legend-body\" data-role=\"legend-body\"></div>";
	let dt = pt(f.legendTarget) || F;
	dt.appendChild(ut), dt !== F && ut.classList.add("loc-legend-external");
	let ft = ut.querySelector("[data-role=\"legend-body\"]");
	kt(), At(), ue.appendChild(N);
	function B(e, t) {
		let n = document.createElement(e);
		return t && (n.className = t), n;
	}
	function pt(e) {
		if (!e) return null;
		let t = typeof e == "string" ? document.querySelector(e) : e;
		return t && t.appendChild ? t : null;
	}
	function mt() {
		let e = de(f, F);
		return c({
			orientation: p.orientation,
			subtreeMode: p.subtreeMode,
			spacingX: p.spacingX,
			spacingY: p.spacingY,
			gridSize: p.gridSize,
			alignGrid: p.alignGrid,
			autoEdgeSide: p.autoEdgeSide,
			familyRouteOverrides: y,
			targetAspect: e.targetAspect,
			targetSize: e.targetSize
		});
	}
	function ht() {
		let e = mt(), t = s(m, e);
		bt(t), f.layoutCache !== !1 && ye(vt(m, e), _t(t));
	}
	function gt() {
		N.classList.toggle("loc-horizontal", o(mt())), Jt(), Wt(), Ot(), qt(), on(), p.showLegend && Rr(), X(), j("layout-change", {
			positioned: C,
			familyNetworks: Ee,
			mode: p.subtreeMode,
			orientation: p.orientation
		});
	}
	function _t(e) {
		return {
			positioned: e.positioned,
			bounds: e.bounds,
			framingBounds: e.framingBounds,
			familyNetworks: e.familyNetworks || [],
			cfg: e.cfg
		};
	}
	function vt(e, t) {
		return JSON.stringify({
			nodes: e,
			options: t
		});
	}
	function yt() {
		let e = Object.create(null);
		for (let t of Object.keys(g)) {
			let n = w[t];
			n && (e[t] = d(n, g));
		}
		return e;
	}
	function bt(e, t) {
		let n = pe(_t(e)), r = yt(), i = Object.assign(Object.create(null), t || {}, r);
		for (let e of n.positioned || []) {
			let t = h[String(e.node.id)];
			t && (e.node = Object.assign({}, e.node, pe(t)));
		}
		C = n.positioned || [], w = Object.create(null);
		for (let e of C) w[String(e.node.id)] = e;
		Ee = n.familyNetworks || [], Oe = n.framingBounds || n.bounds || null;
		for (let e of Object.keys(i)) {
			let t = w[e];
			if (!t) {
				delete g[e];
				continue;
			}
			let n = i[e].x - t.cx, r = i[e].y - t.cy;
			Math.abs(n) > .5 || Math.abs(r) > .5 ? g[e] = {
				dx: n,
				dy: r
			} : delete g[e];
		}
	}
	function xt(e) {
		ze = !!e, N.classList.toggle("loc-layout-busy", ze), ze ? N.setAttribute("aria-busy", "true") : N.removeAttribute("aria-busy");
	}
	function St(e = "superseded", t = !1) {
		let n = A;
		return n ? (A = null, n.worker && n.worker.terminate(), n.timer && clearTimeout(n.timer), n.resolve(!1), j("layout-cancel", {
			id: n.id,
			reason: n.reason,
			cause: e
		}), t || xt(!1), !0) : !1;
	}
	function Ct(e, t, n, r) {
		return !A || A.id !== e.id || e.id !== Re ? !1 : (A = null, bt(t, e.pins), gt(), xt(!1), j("layout-complete", {
			id: e.id,
			reason: e.reason,
			durationMs: Math.round(n || 0),
			cached: !!r
		}), e.resolve(!0), !0);
	}
	function wt(e, t) {
		!A || A.id !== e.id || (A = null, xt(!1), j("layout-error", {
			id: e.id,
			reason: e.reason,
			error: t instanceof Error ? t : Error(t?.message || String(t))
		}), e.resolve(!1));
	}
	function Tt(e, t, n) {
		n && (Ve = !1, j("layout-error", {
			id: e.id,
			reason: e.reason,
			error: n,
			fallback: !0
		})), e.timer = setTimeout(() => {
			if (e.timer = 0, !A || A.id !== e.id) return;
			let n = performance.now();
			try {
				let r = s(t.nodes, t.options);
				f.layoutCache !== !1 && ye(e.signature, _t(r)), Ct(e, r, performance.now() - n, !1);
			} catch (t) {
				wt(e, t);
			}
		}, 0);
	}
	function Et(e = "refresh", t = {}) {
		St("superseded", !0);
		let n = ++Re, r = mt(), i = vt(m, r), a = t.pins || (t.preserveManual ? yt() : null), o, s = new Promise((e) => {
			o = e;
		}), c = {
			id: n,
			reason: e,
			signature: i,
			pins: a,
			resolve: o,
			worker: null,
			timer: 0
		};
		A = c, Be = s, xt(!0), j("layout-start", {
			id: n,
			reason: e
		});
		let l = f.layoutCache !== !1 && ve.get(i);
		if (l) return Promise.resolve().then(() => Ct(c, l, 0, !0)), s;
		let u = JSON.parse(i);
		if (!Ve) return Tt(c, u), s;
		try {
			let e = new fe();
			c.worker = e, e.addEventListener("message", (t) => {
				let n = t.data || {};
				if (!(n.id !== c.id || !A || A.id !== c.id)) {
					if (e.terminate(), c.worker = null, !n.ok) {
						wt(c, Error(n.error?.message || "Layout worker failed."));
						return;
					}
					f.layoutCache !== !1 && ye(i, n.result), Ct(c, n.result, n.durationMs, !1);
				}
			}), e.addEventListener("error", (t) => {
				!A || A.id !== c.id || (e.terminate(), c.worker = null, Tt(c, u, Error(t.message || "Layout worker failed to load.")));
			}, { once: !0 }), e.postMessage({
				id: n,
				nodes: u.nodes,
				options: u.options
			});
		} catch (e) {
			c.worker && c.worker.terminate(), c.worker = null, Tt(c, u, e);
		}
		return s;
	}
	function V(e = "refresh", t) {
		return Et(e, t);
	}
	function Dt(e) {
		let t = Object.create(null);
		for (let e of C) t[e.node.id] = d(e, g);
		return e(), Et("structural-edit", { pins: t });
	}
	function Ot() {
		let e = Object.create(null);
		for (let t of C) {
			let n = t.node;
			e[n.id] = !0;
			let r = T[n.id];
			r || (r = Nt(n), T[n.id] = r, $e.appendChild(r)), r.style.width = n.width + "px", r.style.height = n.height + "px";
			let i = d(t, g);
			r.style.transform = `translate(${i.x - n.width / 2}px, ${i.y - n.height / 2}px)`, f.nodeSlots || (r.dataset.fitted || (It(r), r.dataset.fitted = "1"), jr(r, n)), r.classList.toggle("loc-selected", x.has(n.id)), r.classList.toggle("loc-primary", p.selectedNodeId === n.id && x.size > 1), Lt(r, n);
		}
		for (let t in T) e[t] || (T[t].remove(), delete T[t]);
		j("nodes-rendered", { ids: C.map((e) => e.node.id) });
	}
	function kt() {
		N.style.setProperty("--loc-photo-h", (p.photoHeight || 104) + "px"), N.style.setProperty("--loc-photo-fit", p.photoContain ? "contain" : "cover");
	}
	function At() {
		let e = Math.max(100, p.cardWidth || r.width), t = Math.max(60, (p.photoHeight || 104) + me);
		for (let n of m) n.type !== "department" && (n.width = e, n.height = t);
	}
	function jt(e) {
		e ||= {};
		let t = p.cardWidth, n = p.photoHeight;
		typeof e.width == "number" && (p.cardWidth = Math.max(100, e.width)), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight));
		let r = p.cardWidth !== t || p.photoHeight !== n;
		if ("contain" in e && (p.photoContain = !!e.contain), kt(), r) {
			At();
			for (let e in T) delete T[e].dataset.fitted;
			Ot(), V("card-size");
		}
		X(), j("settings-change", G());
	}
	function Mt(e) {
		e.textContent = "", e.innerHTML = "<svg class=\"loc-usericon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7\"/></svg>";
	}
	function Nt(e) {
		if (f.nodeSlots) {
			let t = B("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
			return t.dataset.id = e.id, t.innerHTML = "<div class=\"loc-node-slot\"></div>", t.appendChild(Pt()), t;
		}
		let t = B("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
		if (t.dataset.id = e.id, e.type === "department") t.innerHTML = "<span class=\"loc-lbl\"></span>", t.querySelector(".loc-lbl").textContent = e.label, t.querySelector(".loc-lbl").title = e.label || "";
		else {
			t.innerHTML = "<div class=\"loc-photo\"></div><div class=\"loc-ptext\"><div class=\"loc-pname\"></div><div class=\"loc-ptitle\"></div><div class=\"loc-badge\"></div></div>";
			let n = t.querySelector(".loc-photo"), r = e.data && e.data.photo_url;
			if (p.showImages && r) {
				let t = new Image();
				t.crossOrigin = "anonymous", t.alt = e.personName || "", t.referrerPolicy = "no-referrer", t.onerror = () => {
					Mt(n);
				}, t.src = r, n.appendChild(t);
			} else Mt(n);
			let i = t.querySelector(".loc-pname"), a = t.querySelector(".loc-ptitle");
			i.textContent = e.personName || "—", i.title = e.personName || "", a.textContent = e.label, a.title = e.label || "";
			let o = t.querySelector(".loc-badge");
			e.status ? (o.textContent = e.status, o.className = "loc-badge loc-" + e.status) : o.remove();
		}
		return t.appendChild(Pt()), t;
	}
	function Pt() {
		let e = B("div", "loc-toggle");
		return e.dataset.role = "toggle", e;
	}
	function Ft(e) {
		return e.scrollWidth > e.clientWidth + .5 || e.scrollHeight > e.clientHeight + .5;
	}
	function It(e) {
		if (e.style.setProperty("--loc-fit", "1"), !Ft(e)) return;
		let t = ge, n = 1;
		for (let r = 0; r < 7; r++) {
			let r = (t + n) / 2;
			e.style.setProperty("--loc-fit", String(r)), Ft(e) ? n = r : t = r;
		}
		e.style.setProperty("--loc-fit", String(t));
	}
	function Lt(e, t) {
		let r = e.querySelector("[data-role=\"toggle\"]");
		if (!r) return;
		let i = n(m, t.id) > 0;
		r.style.display = i ? "flex" : "none", r.textContent = t.collapsed ? "+" : "−";
		let a = t.collapsed ? "Expand" : "Collapse";
		r.title = a, r.setAttribute("aria-label", a);
	}
	function Rt(e) {
		return document.createElementNS(he, e);
	}
	function zt(e) {
		return a(w[e.node.parentId], e, mt(), g, _, v);
	}
	function Bt(e) {
		return `M ${e.a.x.toFixed(1)} ${e.a.y.toFixed(1)} L ${e.b.x.toFixed(1)} ${e.b.y.toFixed(1)}`;
	}
	function Vt() {
		let e = /* @__PURE__ */ new Set(), t = (e) => {
			let t = g[e];
			return t && (Math.abs(Number(t.dx) || 0) > .01 || Math.abs(Number(t.dy) || 0) > .01);
		};
		for (let n of Ee) {
			let r = String(n.parentId);
			(t(r) || n.childIds.some((e) => t(e) || _[e] && _[e].length || v[e])) && e.add(r);
		}
		return e;
	}
	function Ht(e = null) {
		let t = e || Object.entries(E).map(([e, t]) => ({
			id: e,
			d: t.getAttribute("d") || ""
		})), n = ie(t, Ee, { rebuildFamilyIds: Vt() });
		De = n.familyNetworks, Ye.innerHTML = "";
		for (let e of n.segments) {
			let t = Rt("path");
			t.setAttribute("d", e.d), t.setAttribute("class", "loc-visible-edge"), t.dataset.edges = e.memberIds.join(","), Ye.appendChild(t);
		}
	}
	function Ut() {
		let e = Object.create(null);
		et.innerHTML = "";
		for (let t of De) {
			if (!t.trunk) continue;
			let n = String(t.parentId);
			e[n] = !0;
			let r = ke[n];
			if (r || (r = Rt("path"), r.dataset.family = n, ke[n] = r, Qe.appendChild(r)), r.setAttribute("d", Bt(t.trunk)), r.dataset.children = t.trunk.childIds.join(","), p.selectedFamilyId === n) for (let e of t.segments) {
				let t = Rt("path");
				t.setAttribute("d", e.d || Bt(e)), t.setAttribute("class", "loc-family-selected"), et.appendChild(t);
			}
		}
		for (let t in ke) e[t] || (ke[t].remove(), delete ke[t]);
		p.selectedFamilyId && !e[p.selectedFamilyId] && Wn();
	}
	function Wt() {
		let e = Object.create(null), t = [];
		for (let n of C) {
			let r = n.node;
			if (!r.parentId || !w[r.parentId]) continue;
			e[r.id] = !0;
			let i = zt(n);
			t.push({
				id: r.id,
				d: i
			});
			let a = E[r.id];
			a || (a = Rt("path"), a.setAttribute("class", "loc-logical-edge"), E[r.id] = a, Xe.appendChild(a)), a.setAttribute("d", i), a.classList.toggle("loc-sel", p.selectedEdgeId === r.id), a.classList.toggle("loc-incident", En(r));
			let o = D[r.id];
			o || (o = Rt("path"), o.dataset.edge = r.id, D[r.id] = o, Ze.appendChild(o)), o.setAttribute("d", i);
		}
		for (let t in E) e[t] || (E[t].remove(), delete E[t]);
		for (let t in D) e[t] || (D[t].remove(), delete D[t]);
		Ht(t), Ut(), Dn(), p.selectedEdgeId && !e[p.selectedEdgeId] ? U() : Yn();
	}
	function Gt(e) {
		let t = w[e];
		if (!t || !w[t.node.parentId]) return;
		let n = zt(t);
		return E[e] && E[e].setAttribute("d", n), D[e] && D[e].setAttribute("d", n), !0;
	}
	function Kt(e) {
		Gt(e) && (Ht(), Ut());
	}
	function qt() {
		Ke.style.transform = `translate(${p.panX}px, ${p.panY}px) scale(${p.zoom})`, nt.textContent = Math.round(p.zoom * 100) + "%", p.selectedEdgeId && !O && Yn(), X();
	}
	function Jt() {
		let e = 0, t = 0, n = 0, r = 0;
		for (let i of C) {
			let a = d(i, g), o = i.node.width / 2, s = i.node.height / 2;
			e = Math.min(e, a.x - o - 80), t = Math.min(t, a.y - s - 80), n = Math.max(n, a.x + o + 80), r = Math.max(r, a.y + s + 80);
		}
		Je.setAttribute("width", n), Je.setAttribute("height", r), I.setAttribute("width", n), I.setAttribute("height", r);
		let i = p.gridSize;
		qe.style.left = e + "px", qe.style.top = t + "px", qe.style.width = n - e + "px", qe.style.height = r - t + "px", qe.style.backgroundSize = i + "px " + i + "px", qe.style.backgroundPosition = (-e % i + i) % i + "px " + (-t % i + i) % i + "px";
	}
	function Yt() {
		qe.classList.toggle("loc-on", p.showGrid), F.classList.toggle("loc-gridon", p.showGrid);
	}
	function Xt() {
		if (!C.length) return;
		let e = Ti(0), t = ee(e, F.clientWidth, F.clientHeight);
		p.zoom = t.zoom, p.panX = t.panX, p.panY = t.panY, qt();
	}
	function Zt(e) {
		let t = w[e];
		if (!t) return;
		let n = d(t, g);
		p.panX = F.clientWidth / 2 - n.x * p.zoom, p.panY = F.clientHeight / 2 - n.y * p.zoom, qt();
	}
	function Qt() {
		let e = f.fitOnLayoutChange;
		return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
	}
	function $t() {
		let e = Qt();
		if (e === "fit") {
			Xt();
			return;
		}
		if (e === "recenter") {
			let e = m.find((e) => !e.parentId), t = p.selectedNodeId && w[p.selectedNodeId] ? p.selectedNodeId : e && e.id;
			t && Zt(t);
		}
	}
	function en() {
		for (let e of m) e.collapsed = !1;
		V("expand-all"), Y();
	}
	function tn() {
		let e = t(m, h);
		for (let t of m) t.collapsed = e[t.id] >= 1 && n(m, t.id) > 0;
		V("collapse-all"), Y();
	}
	function nn(e) {
		let t = h[e];
		t && (Dt(() => {
			t.collapsed = !t.collapsed;
		}), Fn(), Y());
	}
	function rn(e) {
		if (Me = le(m, e), on(), Me.size) {
			let e = C.find((e) => Me.has(e.node.id));
			e && Zt(e.node.id);
		}
		return Me.size;
	}
	function an() {
		Me = /* @__PURE__ */ new Set(), on();
	}
	function on() {
		let e = Me.size > 0;
		for (let t of C) {
			let n = T[t.node.id];
			if (!n) continue;
			let r = Me.has(t.node.id);
			n.classList.toggle("loc-highlight", e && r), n.classList.toggle("loc-dim", e && !r);
		}
		for (let t in E) E[t].classList.toggle("loc-hl", e && Me.has(t));
	}
	function sn() {
		Pe && clearTimeout(Pe), Pe = 0, Ne = null;
	}
	function cn(e) {
		sn(), Ne = String(e), Pe = setTimeout(sn, 0);
	}
	function ln(e) {
		if (e) {
			for (let t of e.groupIds) _n(t);
			vn(e.groupIds), j("node-drag", {
				id: e.id,
				node: h[e.id],
				offset: g[e.id],
				group: e.groupIds
			});
		}
	}
	function un(e, t) {
		if (e.target.closest("[data-role=\"toggle\"]") || (e.stopPropagation(), oa(), sr && ur(t))) return;
		if (U(), Wn(), e.ctrlKey || e.metaKey) {
			Sn(t);
			return;
		}
		if (x.has(t) ? (p.selectedNodeId = t, yn(), Fn()) : xn(t), j("node-select", {
			id: t,
			node: h[t],
			rect: In(t)
		}), f.readonly || !f.enableDragging || !p.editMode) {
			f.inspector && gr(t);
			return;
		}
		let n = x.has(t) && x.size > 1 ? [...x] : [t], r = Object.create(null);
		for (let e of n) {
			let t = g[e] || {
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
		}, j("node-drag-start", {
			id: t,
			node: h[t],
			group: n
		}), Z("pointermove", dn), Z("pointerup", fn);
	}
	function dn(e) {
		if (!k) return;
		let t = (e.clientX - k.startX) / p.zoom, n = (e.clientY - k.startY) / p.zoom;
		Math.abs(e.clientX - k.startX) + Math.abs(e.clientY - k.startY) > 3 && (k.moved = !0);
		let r = w[k.id], i = k.bases[k.id];
		if (r) {
			let e = r.cx + i.dx, a = r.cy + i.dy;
			if (p.snapGrid) {
				let r = p.gridSize;
				t = Math.round((e + t) / r) * r - e, n = Math.round((a + n) / r) * r - a;
			}
			if (k.groupIds.length === 1) {
				let r = pn(k.id, e + t, a + n);
				t = r.cx - e, n = r.cy - a, hn(r.gx, r.gy);
			}
		}
		for (let e of k.groupIds) {
			let r = k.bases[e];
			g[e] = {
				dx: r.dx + t,
				dy: r.dy + n
			};
		}
		je ||= requestAnimationFrame(() => {
			je = 0, ln(k);
		});
	}
	function fn() {
		let e = !1, t = k;
		if (t) {
			je && (cancelAnimationFrame(je), je = 0, ln(t));
			for (let e of t.groupIds) T[e] && T[e].classList.remove("loc-dragging");
			j("node-drag-end", {
				id: t.id,
				node: h[t.id],
				offset: g[t.id],
				group: t.groupIds
			}), Jt(), e = !!t.moved, e ? cn(t.id) : f.inspector && gr(t.id);
		}
		k = null, gn(), Q("pointermove", dn), Q("pointerup", fn), X(), e && Y();
	}
	function pn(e, t, n) {
		if (!f.snapAlign) return {
			cx: t,
			cy: n,
			gx: null,
			gy: null
		};
		let r = h[e];
		if (!r) return {
			cx: t,
			cy: n,
			gx: null,
			gy: null
		};
		let i = 8 / p.zoom, a = [], o = [], s = r.parentId && w[r.parentId];
		s && a.push(d(s, g).x);
		for (let t of C) {
			if (t.node.id === e || !r.parentId || t.node.parentId !== r.parentId) continue;
			let n = d(t, g);
			a.push(n.x), o.push(n.y);
		}
		let c = null, l = i;
		for (let e of a) {
			let n = Math.abs(t - e);
			n < l && (l = n, t = e, c = e);
		}
		let u = null, ee = i;
		for (let e of o) {
			let t = Math.abs(n - e);
			t < ee && (ee = t, n = e, u = e);
		}
		return {
			cx: t,
			cy: n,
			gx: c,
			gy: u
		};
	}
	function mn(e, t) {
		if (!f.snapAlign) return t;
		let n = w[e];
		if (!n) return t;
		let r = w[n.node.parentId], i = 8 / p.zoom, a = d(n, g), o = [a.x], s = [a.y];
		if (r) {
			let e = d(r, g);
			o.push(e.x), s.push(e.y);
		}
		let c = null, l = i, u = t.x;
		for (let e of o) {
			let n = Math.abs(t.x - e);
			n < l && (l = n, u = e, c = e);
		}
		let ee = null, te = i, ne = t.y;
		for (let e of s) {
			let n = Math.abs(t.y - e);
			n < te && (te = n, ne = e, ee = e);
		}
		return hn(c, ee), {
			x: u,
			y: ne
		};
	}
	function hn(e, t) {
		tt.innerHTML = "";
		let n = +I.getAttribute("width") || 0, r = +I.getAttribute("height") || 0, i = (e, t, n, r) => {
			let i = Rt("line");
			i.setAttribute("x1", e), i.setAttribute("y1", t), i.setAttribute("x2", n), i.setAttribute("y2", r), i.setAttribute("class", "loc-align-line"), tt.appendChild(i);
		};
		e != null && i(e, 0, e, r), t != null && i(0, t, n, t);
	}
	function gn() {
		tt.innerHTML = "";
	}
	function _n(e) {
		let t = w[e], n = T[e];
		if (!t || !n) return;
		let r = d(t, g);
		n.style.transform = `translate(${r.x - t.node.width / 2}px, ${r.y - t.node.height / 2}px)`;
	}
	function vn(e) {
		let t = new Set((e || []).map(String)), n = /* @__PURE__ */ new Set();
		for (let e of t) {
			let t = w[e];
			t && w[t.node.parentId] && n.add(String(e));
		}
		for (let e of C) t.has(String(e.node.parentId)) && n.add(String(e.node.id));
		let r = !1;
		for (let e of n) r = Gt(e) || r;
		r && (Ht(), Ut()), p.selectedEdgeId && Yn();
	}
	function yn() {
		for (let e in T) T[e].classList.toggle("loc-selected", x.has(e)), T[e].classList.toggle("loc-primary", p.selectedNodeId === e && x.size > 1);
	}
	function bn() {
		j("selection-change", {
			ids: [...x],
			primary: p.selectedNodeId
		});
	}
	function xn(e) {
		x = new Set(e ? [e] : []), p.selectedNodeId = e || null, yn(), Fn();
	}
	function Sn(e) {
		x.has(e) ? (x.delete(e), p.selectedNodeId === e && (p.selectedNodeId = x.size ? [...x][x.size - 1] : null)) : (x.add(e), p.selectedNodeId = e), yn(), Fn(), bn();
	}
	function Cn(e, t) {
		x = new Set(e), p.selectedNodeId = t ?? (e.length ? e[e.length - 1] : null), yn(), Fn(), bn();
	}
	function wn() {
		x = /* @__PURE__ */ new Set(), p.selectedNodeId = null, yn(), Fn();
	}
	function Tn(e) {
		let t = Ln(e.clientX, e.clientY), n = e.shiftKey ? new Set(x) : /* @__PURE__ */ new Set(), r = Rt("rect");
		r.setAttribute("class", "loc-marquee"), I.appendChild(r), F.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = Ln(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e of C) {
				let t = d(e, g);
				t.x >= o && t.x <= o + c && t.y >= s && t.y <= s + l && u.add(e.node.id);
			}
			x = u, p.selectedNodeId = x.size ? [...x][x.size - 1] : null, yn(), Fn(), i = !0;
		}, o = () => {
			r.remove(), F.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? (bn(), x.size === 1 && f.inspector && gr([...x][0])) : (wn(), _r());
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function En(e) {
		return x.has(e.id) || x.has(e.parentId);
	}
	let H = /* @__PURE__ */ new Set();
	function Dn() {
		for (let e in E) E[e].classList.toggle("loc-edge-selected", H.has(e));
	}
	function On() {
		H.size && (H = /* @__PURE__ */ new Set(), Dn(), j("edges-select", { ids: [] }));
	}
	function kn(e) {
		H = new Set((e || []).filter((e) => E[e])), Dn(), j("edges-select", { ids: [...H] });
	}
	function An() {
		if (!H.size) return;
		let e = !1;
		for (let t of H) _[t] && (delete _[t], e = !0), v[t] && (delete v[t], e = !0);
		e && (p.selectedEdgeId && H.has(p.selectedEdgeId) && U(), Wt(), Dn(), X(), Y(), j("edges-reset", { ids: [...H] }));
	}
	function jn(e, t, n, r, i, a, o, s) {
		let c = (n - e) * (s - a) - (r - t) * (o - i);
		if (Math.abs(c) < 1e-9) return !1;
		let l = ((i - e) * (s - a) - (a - t) * (o - i)) / c, u = ((i - e) * (r - t) - (a - t) * (n - e)) / c;
		return l >= 0 && l <= 1 && u >= 0 && u <= 1;
	}
	function Mn(e, t, n, r, i, a) {
		let o = n + i, s = r + a, c = (e) => e.x >= n && e.x <= o && e.y >= r && e.y <= s;
		return c(e) || c(t) ? !0 : jn(e.x, e.y, t.x, t.y, n, r, o, r) || jn(e.x, e.y, t.x, t.y, o, r, o, s) || jn(e.x, e.y, t.x, t.y, o, s, n, s) || jn(e.x, e.y, t.x, t.y, n, s, n, r);
	}
	function Nn(e, t, n, r, i) {
		let a = zn(e);
		if (!a) return !1;
		for (let e of Vn(a)) if (Mn(e.a, e.b, t, n, r, i)) return !0;
		return !1;
	}
	function Pn(e) {
		let t = Ln(e.clientX, e.clientY), n = e.shiftKey ? new Set(H) : /* @__PURE__ */ new Set(), r = Rt("rect");
		r.setAttribute("class", "loc-marquee loc-marquee-edge"), I.appendChild(r), F.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = Ln(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e in E) Nn(e, o, s, c, l) && u.add(e);
			H = u, Dn(), i = !0;
		}, o = () => {
			r.remove(), F.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? j("edges-select", { ids: [...H] }) : On();
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function Fn() {
		for (let e in E) {
			let t = w[e];
			E[e].classList.toggle("loc-incident", !!t && En(t.node));
		}
	}
	function In(e) {
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
	function Ln(e, t) {
		let n = F.getBoundingClientRect();
		return {
			x: (e - n.left - p.panX) / p.zoom,
			y: (t - n.top - p.panY) / p.zoom
		};
	}
	function Rn(e) {
		if (p.snapGrid) {
			let t = p.gridSize;
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
	function zn(e) {
		let t = w[e];
		if (!t) return null;
		let n = w[t.node.parentId];
		if (!n) return null;
		let r = mt(), i = l(t, _[e], v[e], n, r, g);
		return te(n, t, i, r, g, v[e]);
	}
	function Bn(e) {
		if (_[e]) return _[e];
		let t = w[e], n = t && w[t.node.parentId], r = l(t, null, v[e], n, mt(), g);
		return _[e] = r.map((e) => ({
			x: e.x,
			y: e.y
		})), _[e];
	}
	function Vn(e) {
		let t = [], n = o(mt());
		for (let r = 0; r < e.length - 1; r++) {
			let i = ne([e[r], e[r + 1]], n);
			for (let e = 0; e < i.length - 1; e++) t.push({
				a: i[e],
				b: i[e + 1],
				insert: r
			});
		}
		return t;
	}
	function Hn(e) {
		Wn(), p.selectedEdgeId && E[p.selectedEdgeId] && E[p.selectedEdgeId].classList.remove("loc-sel"), x = /* @__PURE__ */ new Set(), p.selectedNodeId = null, yn(), p.selectedEdgeId = e, E[e] && E[e].classList.add("loc-sel"), Fn(), Yn();
	}
	function U() {
		p.selectedEdgeId && E[p.selectedEdgeId] && E[p.selectedEdgeId].classList.remove("loc-sel"), p.selectedEdgeId = null, L.innerHTML = "";
	}
	function Un(e) {
		let t = String(e);
		U(), x = /* @__PURE__ */ new Set(), p.selectedNodeId = null, yn(), p.selectedFamilyId = t, Wt();
		let n = De.find((e) => String(e.parentId) === t) || Ee.find((e) => String(e.parentId) === t);
		j("family-route-select", {
			parentId: t,
			childIds: n ? n.childIds.slice() : []
		});
	}
	function Wn() {
		if (p.selectedFamilyId) {
			p.selectedFamilyId = null, et.innerHTML = "";
			for (let e in E) E[e].classList.remove("loc-family-member");
		}
	}
	function Gn(e = p.selectedFamilyId) {
		let t = e == null ? null : String(e);
		return !t || !y[t] ? !1 : (delete y[t], V("family-route-reset"), X(), Y(), j("family-route-reset", { parentId: t }), !0);
	}
	function Kn(e, t) {
		let n = e == null ? "" : String(e);
		return !n || !w[n] ? !1 : !t || !Number.isFinite(Number(t.trunkOffset)) ? Gn(n) : (y[n] = { trunkOffset: Number(t.trunkOffset) }, p.selectedFamilyId = n, V("family-route-override"), X(), Y(), j("family-route-change", {
			parentId: n,
			trunkOffset: y[n].trunkOffset,
			pending: !1
		}), !0);
	}
	function qn(e, t, n, r) {
		let i = Rt("circle");
		return i.setAttribute("cx", e), i.setAttribute("cy", t), i.setAttribute("r", n), i.setAttribute("class", r), i;
	}
	function Jn(e, t, n, r) {
		let i = Rt("rect");
		return i.setAttribute("x", e - n), i.setAttribute("y", t - n), i.setAttribute("width", 2 * n), i.setAttribute("height", 2 * n), i.setAttribute("rx", 2 / p.zoom), i.setAttribute("class", r), i;
	}
	function Yn() {
		L.innerHTML = "";
		let e = p.selectedEdgeId;
		if (!e || f.readonly) return;
		let t = zn(e);
		if (!t) return;
		let n = _[e] || [], r = 6 / p.zoom, i = 5 / p.zoom;
		if (!p.editMode) {
			for (let e = 0; e < n.length; e++) {
				let t = qn(n[e].x, n[e].y, r, "loc-wp-handle loc-wp-readonly");
				t.dataset.wp = e, L.appendChild(t);
			}
			return;
		}
		for (let e of Vn(t)) {
			let t = qn((e.a.x + e.b.x) / 2, (e.a.y + e.b.y) / 2, i, "loc-wp-add");
			t.dataset.add = e.insert, L.appendChild(t);
		}
		for (let e = 0; e < n.length; e++) {
			let t = qn(n[e].x, n[e].y, r, "loc-wp-handle");
			t.dataset.wp = e, L.appendChild(t);
		}
		let a = t[0], o = t[t.length - 1], s = Jn(a.x, a.y, 6 / p.zoom, "loc-ep loc-ep-parent");
		s.dataset.ep = "parent", L.appendChild(s);
		let c = Jn(o.x, o.y, 6 / p.zoom, "loc-ep loc-ep-child");
		c.dataset.ep = "child", L.appendChild(c);
	}
	function Xn(e, t) {
		let n = d(e, g), r = e.node.width, i = e.node.height, a = (t.x - n.x) / (r / 2), o = (t.y - n.y) / (i / 2), s = Math.max(Math.abs(a), Math.abs(o));
		return s > 1e-6 && (a /= s, o /= s), {
			nx: Math.max(-1, Math.min(1, a)),
			ny: Math.max(-1, Math.min(1, o))
		};
	}
	let Zn = .34;
	function Qn(e) {
		let t = e.nx, n = e.ny;
		return Math.abs(Math.abs(n) - 1) < 1e-6 && Math.abs(t) < Zn ? t = 0 : Math.abs(Math.abs(t) - 1) < 1e-6 && Math.abs(n) < Zn && (n = 0), {
			nx: t,
			ny: n
		};
	}
	function $n(e, t) {
		let n = new Set([t].concat(Er(t)));
		for (let t = C.length - 1; t >= 0; t--) {
			let r = C[t];
			if (n.has(r.node.id)) continue;
			let i = d(r, g);
			if (e.x >= i.x - r.node.width / 2 && e.x <= i.x + r.node.width / 2 && e.y >= i.y - r.node.height / 2 && e.y <= i.y + r.node.height / 2) return r.node.id;
		}
		return null;
	}
	let er = null;
	function tr(e) {
		er && T[er] && T[er].classList.remove("loc-reparent-target"), er = e, e && T[e] && T[e].classList.add("loc-reparent-target");
	}
	function nr(e) {
		if (!O || O.kind !== "ep") return;
		let t = O.id, n = w[t];
		if (!n) return;
		let r = w[n.node.parentId];
		if (!r) return;
		let i = Rn(Ln(e.clientX, e.clientY));
		if (v[t] = v[t] || {}, O.changed = !0, O.which === "child") v[t].c = Qn(Xn(n, i));
		else {
			v[t].p = Qn(Xn(r, i));
			let e = $n(i, t);
			tr(e && e !== n.node.parentId ? e : null);
		}
		Kt(t), Yn();
	}
	function rr() {
		let e = O;
		if (O = null, Q("pointermove", nr), Q("pointerup", rr), e && e.which === "parent" && er) {
			let t = er;
			tr(null), ir(e.id, t);
			return;
		}
		tr(null), X(), e && e.changed && Y();
	}
	function ir(e, t) {
		let n = h[e];
		if (!n || t === e || t && Er(e).indexOf(t) >= 0) return;
		let r = t || "", i = n.parentId == null ? "" : String(n.parentId);
		(n.parentId || "") !== r && (p.selectedEdgeId = null, p.selectedFamilyId = null, L.innerHTML = "", et.innerHTML = "", Dt(() => {
			n.parentId = r, b[e] = Object.assign(b[e] || {}, { parentId: r }), delete _[e], delete v[e], i && delete y[i], r && delete y[r], w[e] && Object.assign(w[e].node, { parentId: r });
		}), Fn(), R.classList.contains("loc-open") && p.selectedNodeId === e && vr(), j("node-change", {
			id: e,
			node: { ...n },
			patch: { parentId: r },
			reparented: !0
		}), Y());
	}
	function ar(e) {
		ir(e, "");
	}
	function or(e, t) {
		t && ir(e, t);
	}
	let sr = null;
	function cr(e) {
		e && (sr = e, N.classList.add("loc-attaching"), j("attach-start", { id: e }));
	}
	function lr() {
		sr && (sr = null, N.classList.remove("loc-attaching"), j("attach-cancel", {}));
	}
	function ur(e) {
		let t = sr;
		return !t || !e || e === t || Er(t).indexOf(e) >= 0 ? (lr(), !1) : (sr = null, N.classList.remove("loc-attaching"), or(t, e), f.inspector && gr(t), !0);
	}
	function dr(e, t, n) {
		let r = n.x - t.x, i = n.y - t.y, a = r * r + i * i, o = a ? ((e.x - t.x) * r + (e.y - t.y) * i) / a : 0;
		return o = Math.max(0, Math.min(1, o)), Math.hypot(e.x - (t.x + o * r), e.y - (t.y + o * i));
	}
	function fr(e, t) {
		let n = Vn(e), r = 0, i = Infinity;
		for (let e of n) {
			let n = dr(t, e.a, e.b);
			n < i && (i = n, r = e.insert);
		}
		return r;
	}
	let pr = [
		"",
		"AutoSmart",
		"Balanced",
		"Center",
		"Left",
		"Right",
		"Alternate",
		"AlternateLeft",
		"AlternateRight"
	];
	function W(e) {
		return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
	}
	function mr() {
		N.classList.toggle("loc-edit", p.editMode);
	}
	function hr(e) {
		p.editMode = !!e, mr(), $(), p.editMode || (U(), Wn()), R.classList.contains("loc-open") && vr(), j("edit-mode-change", { editMode: p.editMode }), X();
	}
	function gr(e) {
		f.inspector && (p.selectedNodeId = e, R.classList.add("loc-open"), vr(), j("inspector-open", {
			id: e,
			node: h[e]
		}));
	}
	function _r() {
		R.classList.contains("loc-open") && (R.classList.remove("loc-open"), j("inspector-close", {}));
	}
	function vr() {
		let e = p.selectedNodeId, t = e && h[e];
		if (!t) {
			_r();
			return;
		}
		if (st.textContent = t.label || t.personName || t.id, f.inspectorSlot) {
			ot.innerHTML = "";
			return;
		}
		let n = p.editMode, r = n ? "" : " disabled", i = (e, t, n) => `<input data-field="${e}" type="${n || "text"}" value="${W(t)}"${r}/>`, a = (e, t, n) => `<select data-field="${e}"${r}>` + n.map((e) => {
			let n = Array.isArray(e) ? e[0] : e, r = Array.isArray(e) ? e[1] : e || "—";
			return `<option value="${W(n)}"${String(n) === String(t ?? "") ? " selected" : ""}>${r}</option>`;
		}).join("") + "</select>", o = (e, t) => `<label class="loc-field"><span>${e}</span>${t}</label>`, s = o("ID", `<input value="${W(t.id)}" disabled/>`) + o("Type", a("type", t.type, [["department", "department"], ["position", "position"]])) + o("Label", i("label", t.label));
		t.type !== "department" && (s += f.userSearch ? `<label class="loc-field loc-usersearch"><span>Person name</span>${i("personName", t.personName)}<div class="loc-usersearch-list" data-role="user-results" hidden></div></label>` : o("Person name", i("personName", t.personName)), s += o("Status", a("status", t.status, [
			["", "—"],
			["FILLED", "FILLED"],
			["VACANT", "VACANT"],
			["UNFUNDED", "UNFUNDED"]
		])) + o("Photo URL", i("photo_url", t.data && t.data.photo_url || ""))), f.advancedLayoutControls && (s += o("Layout override", a("layoutMode", t.layoutMode || "", pr.map((e) => [e, e || "(inherit)"])))), s += o("Width", i("width", t.width, "number")) + o("Height", i("height", t.height, "number")), at.innerHTML = s, ot.innerHTML = n ? "<button data-role=\"add-child\">+ Add child</button>" + (t.parentId ? "<button data-role=\"detach\">Detach</button>" : "<button data-role=\"attach\">Attach…</button>") + "<button data-role=\"del-node\" class=\"loc-danger\">Delete</button>" : "<span class=\"loc-foot-hint\">Turn on Edit to modify fields</span>";
	}
	let yr = 0, br = 0;
	function xr(e) {
		if (!f.userSearch) return;
		let t = at.querySelector("[data-role=\"user-results\"]");
		if (!t) return;
		yr && clearTimeout(yr);
		let n = (e || "").trim();
		if (!n) {
			t.hidden = !0, t.innerHTML = "";
			return;
		}
		let r = ++br;
		yr = setTimeout(() => {
			try {
				Promise.resolve(f.userSearch(n, h[p.selectedNodeId])).then((e) => {
					r === br && Sr(t, Array.isArray(e) ? e : []);
				}).catch(() => {});
			} catch {}
		}, 220);
	}
	function Sr(e, t) {
		if (!t.length) {
			e.hidden = !0, e.innerHTML = "";
			return;
		}
		e.innerHTML = t.slice(0, 8).map((e, t) => {
			let n = W(e.name || e.personName || e.label || ""), r = W(e.title || e.label || e.email || "");
			return `<button type="button" class="loc-usersearch-item" data-uidx="${t}"><b>${n}</b>${r ? `<small>${r}</small>` : ""}</button>`;
		}).join(""), e.hidden = !1, e._users = t;
	}
	function Cr(e) {
		let t = p.selectedNodeId, n = t && h[t];
		if (!n) return;
		let r = f.userToFields ? f.userToFields(e, n) : null;
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
		Tr(t, r);
		let i = at.querySelector("[data-role=\"user-results\"]");
		i && (i.hidden = !0, i.innerHTML = ""), vr(), j("user-select", {
			id: t,
			user: e,
			node: { ...h[t] }
		});
	}
	function wr() {
		let e;
		do
			e = "node-" + ++Te;
		while (h[e]);
		return e;
	}
	function Tr(e, t) {
		let n = h[e];
		if (!n) return;
		Object.assign(n, t), w[e] && w[e].node !== n && Object.assign(w[e].node, t), b[e] = Object.assign(b[e] || {}, t);
		let r = [
			"type",
			"width",
			"height",
			"layoutMode"
		].some((e) => e in t);
		T[e] && (T[e].remove(), delete T[e]), Ot(), r && V("node-structure", { preserveManual: !0 }), j("node-change", {
			id: e,
			node: { ...n },
			patch: t
		}), X(), Y("field:" + e + ":" + Object.keys(t).join(","));
	}
	function Er(e) {
		let t = [], n = [e];
		for (; n.length;) {
			let e = n.pop();
			for (let r of m) r.parentId === e && (t.push(r.id), n.push(r.id));
		}
		return t;
	}
	function Dr(e) {
		if (!p.editMode) return null;
		let t = wr(), n = i({
			id: t,
			parentId: e || "",
			type: "position",
			label: "NEW POSITION",
			personName: "",
			status: ""
		});
		return m.push(n), h[t] = n, e && delete y[String(e)], b[t] = Object.assign({ __new: !0 }, n), V("add-child", { preserveManual: !0 }), xn(t), gr(t), j("node-change", {
			id: t,
			node: { ...n },
			added: !0
		}), X(), Y(), t;
	}
	function Or(e) {
		if (!p.editMode || !e) return;
		let t = h[e]?.parentId, n = [e].concat(Er(e)), r = new Set(n);
		m = m.filter((e) => !r.has(e.id)), h = u(m), n.forEach((e) => {
			b[e] = { __deleted: !0 }, T[e] && (T[e].remove(), delete T[e]), x.delete(e);
		}), t && delete y[String(t)], n.forEach((e) => {
			delete y[String(e)];
		}), r.has(p.selectedNodeId) && (p.selectedNodeId = x.size ? [...x][x.size - 1] : null, p.selectedNodeId || _r()), V("delete-node", { preserveManual: !0 }), j("node-change", {
			id: e,
			removed: !0,
			ids: n
		}), X(), Y();
	}
	function kr() {
		let e = new Set(Object.keys(b).filter((e) => b[e] && b[e].__deleted));
		e.size && (m = m.filter((t) => !e.has(t.id))), h = u(m);
		for (let e in b) {
			let t = b[e];
			if (!(!t || t.__deleted)) {
				if (t.__new) {
					if (!h[e]) {
						let n = Object.assign({}, t);
						delete n.__new;
						let r = i(n);
						m.push(r), h[e] = r;
					}
				} else h[e] && Object.assign(h[e], t);
			}
		}
	}
	let Ar = [
		["type", "Type"],
		["status", "Status"],
		["level", "Level (data.level)"],
		["unit", "Unit (data.unit)"],
		["id", "Node id"],
		["label", "Label"]
	];
	function jr(e, t) {
		let n = oe(t, S);
		Mr(e, "--loc-node-bg", n && n.bg), Mr(e, "--loc-node-text", n && n.text), Mr(e, "--loc-node-border", n && n.border);
	}
	function Mr(e, t, n) {
		n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
	}
	function Nr() {
		for (let e in T) h[e] && jr(T[e], h[e]);
		p.showLegend && Rr();
	}
	let Pr = {
		FILLED: "Filled",
		VACANT: "Vacant",
		UNFUNDED: "Unfunded"
	};
	function Fr() {
		ut.classList.toggle("loc-on", p.showLegend), p.showLegend && Rr();
	}
	function Ir(e) {
		return p.showLegend = e == null ? !p.showLegend : !!e, Fr(), $(), X(), j("legend-change", { legend: p.showLegend }), p.showLegend;
	}
	function Lr(e) {
		return Ir(e ?? !p.showLegend);
	}
	function Rr() {
		if (f.legendSlot) return;
		let e = Object.create(null), t = Object.create(null);
		for (let n of m) n.type && (e[n.type] = !0), n.status && (t[n.status] = !0);
		let n = "", r = [];
		e.department && r.push(Br("loc-leg-dept", "Department")), e.position && r.push(Br("loc-leg-pos", "Position")), r.length && (n += zr("Type", r.join("")));
		let i = [
			"FILLED",
			"VACANT",
			"UNFUNDED"
		].filter((e) => t[e]).map((e) => `<div class="loc-leg-row"><span class="loc-leg-badge loc-${e}">${Pr[e] || e}</span></div>`);
		i.length && (n += zr("Status", i.join("")));
		let a = S.filter((e) => e.enabled && (e.style.bg || e.style.border)).map((e) => `<div class="loc-leg-row"><span class="loc-leg-swatch" style="background:${W(e.style.bg || "#fff")};border-color:${W(e.style.border || e.style.bg || "#d0d5dd")}"></span><span class="loc-leg-label">${W(e.field)} = ${W(e.value || "—")}</span></div>`).join("");
		a && (n += zr("Rules", a)), ft.innerHTML = n || "<div class=\"loc-leg-empty\">No legend items yet.</div>";
	}
	function zr(e, t) {
		return `<div class="loc-leg-section"><div class="loc-leg-title">${e}</div>${t}</div>`;
	}
	function Br(e, t) {
		return `<div class="loc-leg-row"><span class="loc-leg-swatch ${e}"></span><span class="loc-leg-label">${t}</span></div>`;
	}
	function G() {
		return {
			spacingX: p.spacingX,
			spacingY: p.spacingY,
			gridSize: p.gridSize,
			orientation: p.orientation,
			subtreeMode: p.subtreeMode,
			showGrid: p.showGrid,
			snapGrid: p.snapGrid,
			alignGrid: p.alignGrid,
			showImages: p.showImages,
			autoEdgeSide: p.autoEdgeSide,
			cardWidth: p.cardWidth,
			photoHeight: p.photoHeight,
			photoContain: p.photoContain,
			themeRules: S.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		};
	}
	function Vr(e, t) {
		if (e ||= {}, typeof e.spacingX == "number" && (p.spacingX = e.spacingX), typeof e.spacingY == "number" && (p.spacingY = e.spacingY), typeof e.gridSize == "number" && (p.gridSize = e.gridSize), e.orientation && (p.orientation = be(e.orientation)), e.subtreeMode && (p.subtreeMode = e.subtreeMode), "showGrid" in e && (p.showGrid = !!e.showGrid), "snapGrid" in e && (p.snapGrid = !!e.snapGrid), "alignGrid" in e && (p.alignGrid = !!e.alignGrid), "showImages" in e && !!e.showImages !== p.showImages) {
			p.showImages = !!e.showImages;
			for (let e in T) T[e].remove(), delete T[e];
		}
		"autoEdgeSide" in e && (p.autoEdgeSide = !!e.autoEdgeSide);
		let n = !1;
		if (typeof e.cardWidth == "number" && (p.cardWidth = Math.max(100, e.cardWidth), n = !0), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight), n = !0), "photoContain" in e && (p.photoContain = !!e.photoContain, n = !0), n) {
			kt(), At();
			for (let e in T) delete T[e].dataset.fitted;
		}
		Array.isArray(e.themeRules) && (S = e.themeRules.map(se)), Yt(), $(), V("settings"), z.classList.contains("loc-open") && Jr(), t && t.silent || j("settings-change", G()), X();
	}
	function Hr(e) {
		let t = z.classList.contains("loc-open"), n = e == null ? !t : !!e;
		z.classList.toggle("loc-open", n), P && P.querySelectorAll("button[data-act=\"settings\"]").forEach((e) => e.classList.toggle("loc-active", n)), n && Jr(), n !== t && j(n ? "settings-open" : "settings-close", {});
	}
	function Ur() {
		Vr({
			spacingX: we.spacingX,
			spacingY: we.spacingY,
			gridSize: we.gridSize,
			showGrid: we.showGrid,
			snapGrid: we.snapGrid,
			alignGrid: we.alignGrid,
			themeRules: we.themeRules.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		}), Nr();
	}
	function Wr(e, t, n, r, i) {
		return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${r}" max="${i}" value="${n}"/></label>`;
	}
	function Gr(e, t, n, r) {
		return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${r ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${r || "#e0524d"}"/></label>`;
	}
	function Kr(e, t) {
		let n = (t, n) => `<option value="${t}"${e.field === t ? " selected" : ""}>${n}</option>`;
		return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + Ar.map(([e, t]) => n(e, t)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${W(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Gr(t, "bg", "BG", e.style.bg) + Gr(t, "text", "Text", e.style.text) + Gr(t, "border", "Border", e.style.border) + "</div></div>";
	}
	function qr() {
		let e = gi().map((e) => `<div class="loc-preset"><button class="loc-preset-apply" data-role="preset-apply" data-name="${W(e.name)}" title="Apply this saved layout">${W(e.name)}</button><span class="loc-preset-tag">${e.full ? "full" : "pattern"}</span><button class="loc-preset-del" data-role="preset-del" data-name="${W(e.name)}" title="Delete preset">✕</button></div>`).join("");
		return e ||= "<div class=\"loc-set-hint\">No saved presets yet.</div>", `<div class="loc-set-section"><div class="loc-set-title">Presets</div><div class="loc-set-hint">Save the current arrangement so an accidental mode change can’t lose it (Undo / Ctrl+Z restores it too).</div><div class="loc-preset-save"><input type="text" data-role="preset-name" placeholder="Preset name…"/><label class="loc-preset-full"><input type="checkbox" data-role="preset-full" checked/> positions</label><button data-role="preset-save">Save</button></div><div class="loc-preset-list">${e}</div></div>`;
	}
	function Jr() {
		if (f.settingsSlot) return;
		let e = qr() + "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Layout</div>" + Wr("spacingX", "Spacing X", p.spacingX, 0, 200) + Wr("spacingY", "Spacing Y", p.spacingY, 0, 260) + Wr("gridSize", "Grid size", p.gridSize, 6, 80) + `<label class="loc-color"><input type="checkbox" data-set-toggle="showImages"${p.showImages ? " checked" : ""}/><span>Show photos (off → user icon)</span></label><label class="loc-color"><input type="checkbox" data-set-toggle="autoEdgeSide"${p.autoEdgeSide ? " checked" : ""}/><span>Smart edges (lines follow waypoints to any side)</span></label></div>`;
		e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Card size</div><div class=\"loc-set-hint\">Applies to every person card. The photo tops the card at its full size; the name/title sit below.</div>" + Wr("cardWidth", "Card width", p.cardWidth, 120, 320) + Wr("photoHeight", "Photo height", p.photoHeight, 60, 240) + `<label class="loc-color"><input type="checkbox" data-set-toggle="photoContain"${p.photoContain ? " checked" : ""}/><span>Show whole photo (no crop)</span></label></div>`, e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Theme rules</div><div class=\"loc-set-hint\">Recolor nodes that match a field = value. Later rules win.</div>", S.forEach((t, n) => {
			e += Kr(t, n);
		}), e += "<button class=\"loc-set-add\" data-role=\"add-rule\">+ Add rule</button></div>", e += "<div class=\"loc-set-foot\"><button class=\"loc-set-reset\" data-role=\"reset-settings\" title=\"Restore spacing, grid &amp; theme rules to defaults\">↺ Reset settings</button></div>", lt.innerHTML = e;
	}
	function Yr(e, t) {
		let n = lt.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
		return n && n.checked;
	}
	function Xr(e, t) {
		let n = lt.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
		return n ? n.value : "";
	}
	let K = [], q = -1, Zr = !1, Qr = null;
	function J(e) {
		return e == null ? e : JSON.parse(JSON.stringify(e));
	}
	function $r() {
		return {
			subtreeMode: p.subtreeMode,
			orientation: p.orientation,
			spacingX: p.spacingX,
			spacingY: p.spacingY,
			gridSize: p.gridSize,
			showGrid: p.showGrid,
			snapGrid: p.snapGrid,
			alignGrid: p.alignGrid,
			showImages: p.showImages,
			autoEdgeSide: p.autoEdgeSide,
			cardWidth: p.cardWidth,
			photoHeight: p.photoHeight,
			photoContain: p.photoContain,
			themeRules: S.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		};
	}
	function ei(e) {
		e && (e.subtreeMode && (p.subtreeMode = e.subtreeMode), e.orientation && (p.orientation = be(e.orientation)), [
			"spacingX",
			"spacingY",
			"gridSize"
		].forEach((t) => {
			typeof e[t] == "number" && (p[t] = e[t]);
		}), "showGrid" in e && (p.showGrid = !!e.showGrid), "snapGrid" in e && (p.snapGrid = !!e.snapGrid), "alignGrid" in e && (p.alignGrid = !!e.alignGrid), "showImages" in e && (p.showImages = !!e.showImages), "autoEdgeSide" in e && (p.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (p.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (p.photoContain = !!e.photoContain), kt(), At(), Array.isArray(e.themeRules) && (S = e.themeRules.map(se)));
	}
	function ti() {
		return {
			nodes: m.map((e) => J(e)),
			manualOffsets: J(g),
			edgeWaypoints: J(_),
			edgeAnchors: J(v),
			familyRouteOverrides: J(y),
			nodeOverrides: J(b),
			view: $r(),
			selectedNodeId: p.selectedNodeId
		};
	}
	function ni(e) {
		Zr = !0, m = (e.nodes || []).map(i), h = u(m), g = J(e.manualOffsets) || Object.create(null), _ = J(e.edgeWaypoints) || Object.create(null), v = J(e.edgeAnchors) || Object.create(null), y = J(e.familyRouteOverrides) || Object.create(null), b = J(e.nodeOverrides) || Object.create(null), ei(e.view);
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		p.selectedEdgeId = null, L.innerHTML = "", p.selectedNodeId = e.selectedNodeId && h[e.selectedNodeId] ? e.selectedNodeId : null, Yt(), V("history"), p.selectedNodeId && xn(p.selectedNodeId), R.classList.contains("loc-open") && (p.selectedNodeId ? vr() : _r()), z.classList.contains("loc-open") && Jr(), Zr = !1;
	}
	function Y(e) {
		if (Zr) return;
		let t = ti();
		e != null && e === Qr && q >= 0 ? K[q] = t : (K = K.slice(0, q + 1), K.push(t), q = K.length - 1, K.length > 100 && (K.shift(), q--)), Qr = e ?? null, ci();
	}
	function ri() {
		K = [ti()], q = 0, Qr = null, ci();
	}
	function ii() {
		return q > 0;
	}
	function ai() {
		return q >= 0 && q < K.length - 1;
	}
	function oi() {
		ii() && (q--, Qr = null, ni(K[q]), ci());
	}
	function si() {
		ai() && (q++, Qr = null, ni(K[q]), ci());
	}
	function ci() {
		$(), j("history-change", {
			canUndo: ii(),
			canRedo: ai()
		});
	}
	function X() {
		if (f.persist) try {
			localStorage.setItem(f.storageKey, JSON.stringify({
				orientation: p.orientation,
				subtreeMode: p.subtreeMode,
				spacingX: p.spacingX,
				spacingY: p.spacingY,
				zoom: p.zoom,
				panX: p.panX,
				panY: p.panY,
				showGrid: p.showGrid,
				snapGrid: p.snapGrid,
				alignGrid: p.alignGrid,
				gridSize: p.gridSize,
				editMode: p.editMode,
				showImages: p.showImages,
				showLegend: p.showLegend,
				autoEdgeSide: p.autoEdgeSide,
				cardWidth: p.cardWidth,
				photoHeight: p.photoHeight,
				photoContain: p.photoContain,
				manualOffsets: g,
				edgeWaypoints: _,
				edgeAnchors: v,
				familyRouteOverrides: y,
				nodeOverrides: b,
				themeRules: S,
				collapsed: m.filter((e) => e.collapsed).map((e) => e.id)
			}));
		} catch {}
	}
	function li() {
		if (!f.persist) return;
		let e;
		try {
			e = JSON.parse(localStorage.getItem(f.storageKey) || "null");
		} catch {
			e = null;
		}
		if (e && (e.orientation && (p.orientation = be(e.orientation)), e.subtreeMode && (p.subtreeMode = e.subtreeMode), [
			"spacingX",
			"spacingY",
			"zoom",
			"panX",
			"panY",
			"gridSize"
		].forEach((t) => {
			typeof e[t] == "number" && (p[t] = e[t]);
		}), p.showGrid = !!e.showGrid, p.snapGrid = !!e.snapGrid, p.alignGrid = !!e.alignGrid, p.editMode = !!e.editMode, "showImages" in e && (p.showImages = !!e.showImages), "showLegend" in e && (p.showLegend = !!e.showLegend), "autoEdgeSide" in e && (p.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (p.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (p.photoContain = !!e.photoContain), kt(), At(), e.manualOffsets && (g = e.manualOffsets), e.edgeWaypoints && (_ = e.edgeWaypoints), e.edgeAnchors && (v = e.edgeAnchors), e.familyRouteOverrides && (y = e.familyRouteOverrides), e.nodeOverrides && (b = e.nodeOverrides, kr()), Array.isArray(e.themeRules) && (S = e.themeRules.map(se)), Array.isArray(e.collapsed))) {
			let t = new Set(e.collapsed);
			for (let e of m) e.collapsed = t.has(e.id);
		}
	}
	function ui() {
		return f.storageKey + ".presets";
	}
	function di() {
		try {
			return JSON.parse(localStorage.getItem(ui()) || "{}") || {};
		} catch {
			return {};
		}
	}
	function fi(e) {
		try {
			localStorage.setItem(ui(), JSON.stringify(e));
		} catch {}
	}
	function pi(e) {
		let t = {
			full: e !== !1,
			view: $r()
		};
		return t.full && (t.layout = {
			manualOffsets: J(g),
			edgeWaypoints: J(_),
			edgeAnchors: J(v),
			familyRouteOverrides: J(y),
			nodeOverrides: J(b),
			collapsed: m.filter((e) => e.collapsed).map((e) => e.id)
		}), t;
	}
	function mi(e) {
		return pi(!(e && e.full === !1));
	}
	function hi(e) {
		if (!e) return Promise.resolve(!1);
		if (ei(e.view), e.full && e.layout) {
			g = J(e.layout.manualOffsets) || Object.create(null), _ = J(e.layout.edgeWaypoints) || Object.create(null), v = J(e.layout.edgeAnchors) || Object.create(null), y = J(e.layout.familyRouteOverrides) || Object.create(null), b = J(e.layout.nodeOverrides) || Object.create(null), kr();
			let t = new Set(e.layout.collapsed || []);
			for (let e of m) e.collapsed = t.has(e.id);
		} else g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null);
		p.selectedNodeId = null, p.selectedEdgeId = null, p.selectedFamilyId = null, L.innerHTML = "", et.innerHTML = "";
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		Yt(), $();
		let t = V("preset");
		return z.classList.contains("loc-open") && Jr(), t.then((e) => {
			e && $t();
		}), Y(), j("settings-change", G()), t;
	}
	function gi() {
		let e = di();
		return Object.keys(e).map((t) => ({
			name: t,
			full: !!e[t].full,
			savedAt: e[t].savedAt || null
		}));
	}
	function _i() {
		return di();
	}
	function vi(e, t) {
		if (e = String(e ?? "").trim(), !e) return null;
		let n = pi(!(t && t.full === !1));
		n.name = e, n.savedAt = Date.now();
		let r = di();
		return r[e] = n, fi(r), z.classList.contains("loc-open") && Jr(), j("presets-change", { presets: gi() }), n;
	}
	function yi(e) {
		let t = di()[String(e)];
		return t ? (hi(t), j("preset-load", {
			name: String(e),
			preset: t
		}), !0) : !1;
	}
	function bi(e) {
		let t = di();
		return String(e) in t && (delete t[String(e)], fi(t), z.classList.contains("loc-open") && Jr(), j("presets-change", { presets: gi() }), !0);
	}
	function xi(e) {
		let t = ce(p, m, g, _);
		return t.editMode = p.editMode, t.edgeAnchors = v, t.familyRouteOverrides = y, t.nodeOverrides = b, t.settings = G(), e !== !1 && Ni(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
	}
	let Si = document.createElement("canvas").getContext("2d");
	function Ci(e, t) {
		return Si.font = t, Si.measureText(e).width;
	}
	function wi(e) {
		let t = T[e.id];
		if (!t) return 1;
		let n = parseFloat(t.style.getPropertyValue("--loc-fit"));
		return isFinite(n) && n > 0 ? n : 1;
	}
	function Ti(e) {
		return e ??= 0, Oe && Object.keys(g).length === 0 ? {
			x: Oe.x - e,
			y: Oe.y - e,
			w: Oe.w + e * 2,
			h: Oe.h + e * 2
		} : re(C, g, e);
	}
	function Ei(e, t) {
		let n = [];
		for (let e in E) n.push({
			id: e,
			d: E[e].getAttribute("d")
		});
		return ae(C, n, {
			manualOffsets: g,
			raster: !!e,
			measureText: Ci,
			fitOf: wi,
			photoHeight: p.photoHeight,
			photoContain: p.photoContain,
			images: t || null,
			familyNetworks: Ee,
			rebuildFamilyIds: Vt(),
			bounds: Ti(40)
		});
	}
	function Di(e) {
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
	function Oi() {
		if (!p.showImages) return Promise.resolve({});
		let e = [], t = /* @__PURE__ */ new Set();
		for (let n of m) {
			let r = n.type !== "department" && n.data && n.data.photo_url;
			r && !t.has(r) && (t.add(r), e.push(r));
		}
		return e.length ? Promise.all(e.map((e) => Di(e).then((t) => [e, t]))).then((e) => {
			let t = {};
			for (let [n, r] of e) r && (t[n] = r);
			return t;
		}) : Promise.resolve({});
	}
	function ki() {
		return Oi().then((e) => {
			let t = Ei(!1, e);
			return Ni(new Blob([t], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), t;
		});
	}
	function Ai(e) {
		return e ||= 3, Oi().then((t) => new Promise((n) => {
			let r = Ti(40), i = 16e3, a = 2e8, o = Math.min(e, i / r.w, i / r.h);
			r.w * o * r.h * o > a && (o = Math.sqrt(a / (r.w * r.h))), o = Math.max(.05, o);
			let s = URL.createObjectURL(new Blob([Ei(!0, t)], { type: "image/svg+xml;charset=utf-8" })), c = new Image();
			c.onload = () => {
				let e = document.createElement("canvas");
				e.width = Math.round(r.w * o), e.height = Math.round(r.h * o);
				let t = e.getContext("2d");
				t.setTransform(o, 0, 0, o, 0, 0), t.drawImage(c, 0, 0), URL.revokeObjectURL(s);
				try {
					e.toBlob((e) => {
						e && Ni(e, "org-chart.png"), n(!!e);
					}, "image/png");
				} catch {
					n(!1);
				}
			}, c.onerror = () => {
				URL.revokeObjectURL(s), n(!1);
			}, c.src = s;
		}));
	}
	function ji(e) {
		e ||= {};
		let t = +e.scale > 0 ? +e.scale : 2, n = typeof e.quality == "number" ? Math.min(1, Math.max(.3, e.quality)) : .82, r = +e.maxSide > 0 ? +e.maxSide : 4e3, i = e.as === "dataURL" || e.as === "dataurl", a = e.filename || "org-chart.webp";
		return Oi().then((o) => new Promise((s) => {
			let c = Ti(40), l = 2e8, u = Math.min(t, r / c.w, r / c.h);
			c.w * u * c.h * u > l && (u = Math.sqrt(l / (c.w * c.h))), u = Math.max(.05, u);
			let ee = URL.createObjectURL(new Blob([Ei(!0, o)], { type: "image/svg+xml;charset=utf-8" })), d = new Image();
			d.onload = () => {
				let t = document.createElement("canvas");
				t.width = Math.round(c.w * u), t.height = Math.round(c.h * u);
				let r = t.getContext("2d");
				r.setTransform(u, 0, 0, u, 0, 0), r.drawImage(d, 0, 0), URL.revokeObjectURL(ee);
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
						t && e.download && Ni(t, a), s(t || null);
					}, "image/webp", n);
				} catch {
					s(null);
				}
			}, d.onerror = () => {
				URL.revokeObjectURL(ee), s(null);
			}, d.src = ee;
		}));
	}
	function Mi() {
		return Oi().then((e) => {
			let t = window.open("", "_blank");
			return t ? (t.document.open(), t.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + Ei(!1, e) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), t.document.close(), !0) : !1;
		});
	}
	function Ni(e, t) {
		let n = URL.createObjectURL(e), r = document.createElement("a");
		r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), URL.revokeObjectURL(n);
	}
	function Pi(e, t, n) {
		let r = !(n && n.resetEdits);
		m = (e || []).map(i), h = u(m), r || (g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.create(null)), p.selectedNodeId = null, p.selectedEdgeId = null, p.selectedFamilyId = null, Me = /* @__PURE__ */ new Set(), _r();
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		t && (t.subtreeMode && (p.subtreeMode = t.subtreeMode), t.orientation && (p.orientation = be(t.orientation)), t.manualOffsets && (g = t.manualOffsets), t.edgeWaypoints && (_ = t.edgeWaypoints), t.edgeAnchors && (v = t.edgeAnchors), t.familyRouteOverrides && (y = t.familyRouteOverrides), t.nodeOverrides && (b = t.nodeOverrides), typeof t.editMode == "boolean" && (p.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (S = t.settings.themeRules.map(se))), r && kr(), mr(), $();
		let a = V("set-nodes");
		return f.fitOnInit && a.then((e) => {
			e && Xt();
		}), a;
	}
	function Fi(t) {
		let { nodes: n, meta: r } = e(t);
		return Pi(n, r), n.length;
	}
	function Ii(e) {
		let t = be(e);
		p.orientation = t, g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), U(), Wn(), $();
		let n = V("orientation");
		return n.then((e) => {
			e && $t();
		}), j("orientation-change", { orientation: t }), Y(), n;
	}
	function Li(e) {
		p.subtreeMode = e, g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), U(), Wn(), $();
		let t = V("subtree-mode");
		return t.then((e) => {
			e && $t();
		}), j("subtree-mode-change", { subtreeMode: e }), Y(), t;
	}
	function Ri(e, t) {
		e != null && (p.spacingX = e), t != null && (p.spacingY = t);
		let n = V("spacing");
		return j("settings-change", G()), Y("spacing"), n;
	}
	function zi(e, t) {
		e in p ? (p[e] = t, e === "showGrid" && Yt(), e === "alignGrid" && (g = Object.create(null), V("align-grid")), $(), X(), [
			"showGrid",
			"snapGrid",
			"alignGrid",
			"gridSize"
		].includes(e) && j("settings-change", G())) : (f[e] = t, (e === "targetAspect" || e === "targetSize") && (p.subtreeMode === "AutoSmart" || p.subtreeMode === "GridSmart" || p.subtreeMode === "Auto") && V("target-size").then((e) => {
			e && $t();
		}));
	}
	function Bi(e) {
		return zi("showGrid", !!e), p.showGrid;
	}
	function Vi(e) {
		return zi("snapGrid", !!e), p.snapGrid;
	}
	function Hi(e) {
		return zi("alignGrid", !!e), p.alignGrid;
	}
	function Ui(e) {
		return Bi(e ?? !p.showGrid);
	}
	function Wi(e) {
		return p.autoEdgeSide = e == null ? !p.autoEdgeSide : !!e, U(), V("auto-edge-side"), z.classList.contains("loc-open") && Jr(), X(), j("settings-change", G()), p.autoEdgeSide;
	}
	function Gi(e) {
		p.showImages = e == null ? !p.showImages : !!e;
		for (let e in T) T[e].remove(), delete T[e];
		return Ot(), $(), X(), j("settings-change", G()), p.showImages;
	}
	function Ki() {
		let e = Et("relayout", { preserveManual: !0 });
		return U(), Wn(), e.then((e) => {
			e && $t();
		}), j("relayout", { forced: !1 }), Y(), e;
	}
	function qi() {
		g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), U(), Wn();
		let e = V("force-relayout");
		return e.then((e) => {
			e && $t();
		}), j("relayout", { forced: !0 }), Y(), e;
	}
	function Ji() {
		an(), _r();
		let e = qi();
		return e.then((e) => {
			e && Xt();
		}), e;
	}
	function Yi() {
		return document.fullscreenElement || document.webkitFullscreenElement || null;
	}
	function Xi() {
		return Yi() === N;
	}
	function Zi() {
		let e = N.requestFullscreen || N.webkitRequestFullscreen;
		if (e) try {
			let t = e.call(N);
			t && t.catch && t.catch(() => {});
		} catch {}
	}
	function Qi() {
		let e = document.exitFullscreen || document.webkitExitFullscreen;
		if (e && Yi()) try {
			e.call(document);
		} catch {}
	}
	function $i(e) {
		let t = e == null ? !Xi() : !!e;
		return t ? Zi() : Qi(), t;
	}
	function ea() {
		let e = Xi();
		N.classList.toggle("loc-fullscreen", e), rt && (rt.title = e ? "Exit fullscreen" : "Fullscreen"), $(), Xt(), j("fullscreen-change", { fullscreen: e });
	}
	function ta(e) {
		if (!Ae) return;
		let t = Ln(e.clientX, e.clientY), n = o(mt()) ? t.y : t.x, r = Math.max(1, p.gridSize), i = Math.round((Ae.baseOffset + n - Ae.startCross) / r) * r;
		y[Ae.parentId]?.trunkOffset !== i && (y[Ae.parentId] = { trunkOffset: i }, Ae.changed = !0, j("family-route-change", {
			parentId: Ae.parentId,
			trunkOffset: i,
			pending: !0
		}));
	}
	function na() {
		let e = Ae;
		Ae = null, Q("pointermove", ta), Q("pointerup", na), e?.changed && (V("family-route"), X(), Y(), j("family-route-change", {
			parentId: e.parentId,
			trunkOffset: y[e.parentId]?.trunkOffset,
			pending: !1
		}));
	}
	M($e, "pointerdown", (e) => {
		let t = e.target.closest(".loc-node");
		t && un(e, t.dataset.id);
	}), M($e, "click", (e) => {
		let t = e.target.closest("[data-role=\"toggle\"]");
		if (t && !f.readonly) {
			nn(t.closest(".loc-node").dataset.id);
			return;
		}
		let n = e.target.closest(".loc-node");
		if (n) {
			if (Ne === String(n.dataset.id)) {
				sn(), e.preventDefault(), e.stopPropagation();
				return;
			}
			j("node-click", {
				id: n.dataset.id,
				node: h[n.dataset.id]
			});
		}
	}), M(Ze, "pointerdown", (e) => {
		let t = e.target.closest("path");
		t && (e.stopPropagation(), Hn(t.dataset.edge));
	}), M(Qe, "pointerdown", (e) => {
		let t = e.target.closest("path");
		if (!t) return;
		e.stopPropagation(), e.preventDefault(), oa();
		let n = String(t.dataset.family);
		if (Un(n), f.readonly || !p.editMode) return;
		let r = De.find((e) => String(e.parentId) === n) || Ee.find((e) => String(e.parentId) === n), i = w[n];
		if (!r?.trunk || !i) return;
		let a = Ln(e.clientX, e.clientY), s = o(mt());
		Ae = {
			parentId: n,
			startCross: s ? a.y : a.x,
			baseOffset: (s ? r.trunk.a.y : r.trunk.a.x) - (s ? i.cy : i.cx),
			changed: !1
		}, Z("pointermove", ta), Z("pointerup", na);
	}), M(Ze, "dblclick", (e) => {
		if (f.readonly || !p.editMode) return;
		let t = e.target.closest("path");
		if (!t) return;
		let n = t.dataset.edge;
		Hn(n);
		let r = zn(n);
		if (!r) return;
		let i = Rn(Ln(e.clientX, e.clientY));
		Bn(n).splice(fr(r, i), 0, i), Kt(n), Yn(), X(), Y();
	}), M(L, "pointerdown", (e) => {
		if (f.readonly || !p.editMode) return;
		let t = e.target, n = p.selectedEdgeId;
		if (!n) return;
		if (t.dataset.ep) {
			e.stopPropagation(), e.preventDefault(), O = {
				id: n,
				kind: "ep",
				which: t.dataset.ep
			}, Z("pointermove", nr), Z("pointerup", rr);
			return;
		}
		let r;
		if (t.dataset.wp != null) r = +t.dataset.wp;
		else if (t.dataset.add != null) {
			let i = +t.dataset.add;
			Bn(n).splice(i, 0, Rn(Ln(e.clientX, e.clientY))), r = i, Kt(n);
		} else return;
		e.stopPropagation(), e.preventDefault(), O = {
			id: n,
			idx: r
		}, Z("pointermove", ra), Z("pointerup", ia);
	}), M(L, "dblclick", (e) => {
		let t = e.target;
		if (t.dataset.ep === "parent") {
			ar(p.selectedEdgeId);
			return;
		}
		if (t.dataset.wp == null) return;
		let n = p.selectedEdgeId, r = _[n];
		r && (r.splice(+t.dataset.wp, 1), r.length || delete _[n], Kt(n), Yn(), X(), Y());
	});
	function ra(e) {
		if (!O) return;
		let t = _[O.id];
		t && (t[O.idx] = mn(O.id, Rn(Ln(e.clientX, e.clientY))), Kt(O.id), Yn());
	}
	function ia() {
		O = null, gn(), Q("pointermove", ra), Q("pointerup", ia), X(), Y();
	}
	M(ut, "click", (e) => {
		e.target.closest("[data-role=\"legend-close\"]") && Ir(!1);
	}), M(R, "click", (e) => {
		if (e.target.closest("[data-role=\"panel-close\"]")) {
			_r();
			return;
		}
		if (e.target.closest("[data-role=\"add-child\"]")) {
			Dr(p.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"detach\"]")) {
			ar(p.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"attach\"]")) {
			let e = p.selectedNodeId;
			_r(), cr(e);
			return;
		}
		if (e.target.closest("[data-role=\"del-node\"]")) {
			Or(p.selectedNodeId);
			return;
		}
		let t = e.target.closest("[data-uidx]");
		if (t) {
			let e = t.closest("[data-role=\"user-results\"]"), n = e && e._users && e._users[+t.dataset.uidx];
			n && Cr(n);
			return;
		}
	}), M(at, "input", (e) => {
		if (!p.editMode) return;
		let t = e.target.closest("[data-field]");
		if (!t) return;
		let n = p.selectedNodeId;
		if (!n) return;
		let r = t.dataset.field, i = t.value;
		if (r === "type") {
			Tr(n, { type: i }), vr();
			return;
		}
		if (r !== "width" && r !== "height") {
			if (r === "photo_url") {
				let e = h[n];
				Tr(n, { data: Object.assign({}, e.data, { photo_url: i || null }) });
				return;
			}
			if (r === "layoutMode") {
				Tr(n, { layoutMode: i || null });
				return;
			}
			Tr(n, { [r]: i }), r === "personName" && xr(i);
		}
	});
	function aa(e) {
		if (!p.editMode || !e) return;
		let t = p.selectedNodeId, n = t && h[t];
		if (!n) return;
		let r = e.dataset.field;
		if (r !== "width" && r !== "height") return;
		let i = parseFloat(e.value);
		if (!Number.isFinite(i)) {
			e.value = n[r];
			return;
		}
		let a = Math.max(20, i);
		e.value = a, Number(n[r]) !== a && Tr(t, { [r]: a });
	}
	M(at, "change", (e) => aa(e.target.closest("[data-field]"))), M(at, "keydown", (e) => {
		let t = e.target.closest("[data-field=\"width\"], [data-field=\"height\"]");
		if (t && (e.key === "Enter" && (e.preventDefault(), aa(t), t.blur()), e.key === "Escape")) {
			let e = p.selectedNodeId && h[p.selectedNodeId];
			e && (t.value = e[t.dataset.field]), t.blur();
		}
	}), M(z, "click", (e) => {
		if (e.target.closest("[data-role=\"settings-close\"]")) {
			Hr(!1);
			return;
		}
		if (e.target.closest("[data-role=\"reset-settings\"]")) {
			Ur();
			return;
		}
		if (e.target.closest("[data-role=\"preset-save\"]")) {
			let e = (lt.querySelector("[data-role=\"preset-name\"]") || {}).value || "", t = !!(lt.querySelector("[data-role=\"preset-full\"]") || {}).checked;
			e.trim() && vi(e, { full: t });
			return;
		}
		let t = e.target.closest("[data-role=\"preset-apply\"]");
		if (t) {
			yi(t.dataset.name);
			return;
		}
		let n = e.target.closest("[data-role=\"preset-del\"]");
		if (n) {
			bi(n.dataset.name);
			return;
		}
		if (e.target.closest("[data-role=\"add-rule\"]")) {
			S.push(se({
				field: "type",
				value: "",
				style: {}
			})), Jr(), Nr(), X(), j("settings-change", G());
			return;
		}
		let r = e.target.closest("[data-rk=\"remove\"]");
		r && (S.splice(+r.dataset.rule, 1), Jr(), Nr(), X(), j("settings-change", G()));
	}), M(lt, "input", (e) => {
		let t = e.target;
		if (t.dataset.set != null) {
			let e = t.dataset.set, n = parseFloat(t.value), r = lt.querySelector(`[data-rangelabel="${e}"]`);
			r && (r.textContent = n);
			return;
		}
		if (t.dataset.setToggle === "showImages") {
			Gi(t.checked);
			return;
		}
		if (t.dataset.setToggle === "autoEdgeSide") {
			Wi(t.checked);
			return;
		}
		if (t.dataset.setToggle === "photoContain") {
			jt({ contain: t.checked });
			return;
		}
		if (t.dataset.rule != null) {
			let e = +t.dataset.rule, n = t.dataset.rk, r = S[e];
			if (!r) return;
			if (n === "enabled") r.enabled = t.checked;
			else if (n === "field") r.field = t.value;
			else if (n === "value") r.value = t.value;
			else if (n === "bg" || n === "text" || n === "border") Yr(e, n) && (r.style[n] = t.value);
			else if (/-on$/.test(n)) {
				let i = n.replace("-on", "");
				r.style[i] = t.checked ? Xr(e, i) || "#e0524d" : "";
			}
			Nr(), j("settings-change", G()), X();
		}
	}), M(lt, "change", (e) => {
		let t = e.target;
		if (t.dataset.set == null) return;
		let n = t.dataset.set, r = parseFloat(t.value);
		if (Number.isFinite(r)) {
			if (n === "cardWidth") {
				jt({ width: r });
				return;
			}
			if (n === "photoHeight") {
				jt({ photoHeight: r });
				return;
			}
			Number(p[n]) !== r && (p[n] = r, V("settings-" + n), j("settings-change", G()), X());
		}
	}), M(F, "pointerdown", (e) => {
		if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn") || e.target.closest(".loc-legend")) return;
		oa();
		let t = () => {
			wn(), p.selectedEdgeId && U(), p.selectedFamilyId && Wn(), On(), sr && lr(), _r();
		};
		if (e.altKey) {
			Pn(e);
			return;
		}
		if (e.ctrlKey || e.metaKey) {
			Tn(e);
			return;
		}
		if (!f.enablePan) {
			t();
			return;
		}
		let n = e.clientX, r = e.clientY, i = p.panX, a = p.panY, o = !1;
		F.classList.add("loc-panning");
		let s = (e) => {
			!o && Math.abs(e.clientX - n) + Math.abs(e.clientY - r) > 3 && (o = !0), p.panX = i + (e.clientX - n), p.panY = a + (e.clientY - r), qt();
		}, c = () => {
			F.classList.remove("loc-panning"), Q("pointermove", s), Q("pointerup", c), o || t();
		};
		Z("pointermove", s), Z("pointerup", c);
	}), M(F, "wheel", (e) => {
		if (!f.enableZoom || e.target.closest && (e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-legend"))) return;
		e.preventDefault();
		let t = F.getBoundingClientRect(), n = e.clientX - t.left, r = e.clientY - t.top, i = e.deltaY < 0 ? 1.1 : 1 / 1.1, a = Math.min(Ce, Math.max(.15, p.zoom * i));
		p.panX = n - (n - p.panX) * (a / p.zoom), p.panY = r - (r - p.panY) * (a / p.zoom), p.zoom = a, qt();
	}, { passive: !1 });
	function Z(e, t) {
		window.addEventListener(e, t), He.push({
			target: window,
			type: e,
			fn: t
		});
	}
	function Q(e, t) {
		window.removeEventListener(e, t);
	}
	function oa() {
		try {
			N.focus({ preventScroll: !0 });
		} catch {}
	}
	M(N, "keydown", (e) => {
		let t = e.target;
		if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
		let n = (e.key || "").toLowerCase();
		if (!(e.ctrlKey || e.metaKey)) {
			if (p.selectedFamilyId && (n === "delete" || n === "backspace")) {
				e.preventDefault(), Gn();
				return;
			}
			if (p.selectedFamilyId && n === "escape") {
				e.preventDefault(), Wn();
				return;
			}
			if (H.size && (n === "delete" || n === "backspace")) {
				e.preventDefault(), An();
				return;
			}
			if (n === "escape" && H.size) {
				e.preventDefault(), On();
				return;
			}
			return;
		}
		n === "z" && !e.shiftKey ? (e.preventDefault(), oi()) : (n === "z" && e.shiftKey || n === "y") && (e.preventDefault(), si());
	});
	function sa() {
		let e = f.toolbar && typeof f.toolbar == "object" ? f.toolbar : {}, t = (t) => t === "subtree" ? e[t] === !0 : e[t] !== !1, n = B("div", "loc-toolbar"), r = "";
		return t("subtree") && (r += i("Subtree", [
			"AutoSmart",
			"Balanced",
			"Center",
			"Left",
			"Right",
			"Alternate",
			"AlternateLeft",
			"AlternateRight"
		].map((e) => a("mode", e, e === "AutoSmart" ? "Auto smart" : e)).join(""))), t("orient") && (r += i("Orient", [
			["TopToBottom", "Top"],
			["BottomToTop", "Bottom"],
			["LeftToRight", "Left"],
			["RightToLeft", "Right"]
		].map(([e, t]) => a("orient", e, t)).join(""))), t("history") && (r += i("", "<button data-act=\"undo\" title=\"Undo (Ctrl+Z)\">Undo</button><button data-act=\"redo\" title=\"Redo (Ctrl+Shift+Z)\">Redo</button>")), t("actions") && (r += i("", "<button data-act=\"expand\">Expand</button><button data-act=\"collapse\">Collapse</button><button data-act=\"fit\">Fit</button><button data-act=\"relayout\" title=\"Recalculate while preserving manual positions and routes\">Re-layout</button><button data-act=\"reset\" title=\"Clear manual geometry and rebuild the chart\">Reset</button><button data-act=\"fullscreen\" title=\"Toggle fullscreen\">Fullscreen</button>")), t("search") && (r += i("Search", "<input type=\"search\" data-role=\"search\" class=\"loc-search-input\" placeholder=\"Search…\" />")), t("grid") && (r += i("Grid", "<button data-flag=\"showGrid\">Show</button><button data-flag=\"snapGrid\">Snap</button><button data-flag=\"alignGrid\">Align</button>")), t("mode") && (r += i("Mode", "<button data-act=\"edit\" title=\"Toggle edit mode\">Edit</button><button data-act=\"images\" title=\"Toggle photos / user icons\">Images</button><button data-act=\"legend\" title=\"Toggle legend\">Legend</button><button data-act=\"settings\" title=\"Settings &amp; theming\">Settings</button>")), t("export") && (r += i("Export", "<button data-act=\"png\">PNG</button><button data-act=\"svg\">SVG</button><button data-act=\"pdf\">PDF</button><button data-act=\"json\">JSON</button>")), n.innerHTML = r, n.addEventListener("click", (e) => {
			let t = e.target.closest("button");
			if (t) {
				if (t.dataset.mode) Li(t.dataset.mode);
				else if (t.dataset.orient) Ii(t.dataset.orient);
				else if (t.dataset.flag) p[t.dataset.flag] = !p[t.dataset.flag], t.dataset.flag === "showGrid" ? Yt() : t.dataset.flag === "alignGrid" && (g = Object.create(null), V("align-grid")), $(), X();
				else switch (t.dataset.act) {
					case "undo":
						oi();
						break;
					case "redo":
						si();
						break;
					case "expand":
						en();
						break;
					case "collapse":
						tn();
						break;
					case "fit":
						Xt();
						break;
					case "relayout":
						Ki();
						break;
					case "reset":
						Ji();
						break;
					case "fullscreen":
						$i();
						break;
					case "edit":
						hr(!p.editMode);
						break;
					case "images":
						Gi();
						break;
					case "legend":
						Lr();
						break;
					case "settings":
						Hr();
						break;
					case "png":
						Ai(3);
						break;
					case "svg":
						ki();
						break;
					case "pdf":
						Mi();
						break;
					case "json":
						xi(!0);
						break;
				}
			}
		}), n.addEventListener("input", (e) => {
			let t = e.target.closest("[data-role=\"search\"]");
			t && rn(t.value);
		}), n;
		function i(e, t) {
			return `<div class="loc-group">${e ? `<span class="loc-label">${e}</span>` : ""}${t}</div>`;
		}
		function a(e, t, n) {
			return `<button data-${e}="${t}">${n}</button>`;
		}
	}
	function $() {
		P && (P.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === p.subtreeMode)), P.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === p.orientation)), P.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!p[e.dataset.flag])), P.querySelectorAll("button[data-act=\"edit\"]").forEach((e) => e.classList.toggle("loc-active", p.editMode)), P.querySelectorAll("button[data-act=\"images\"]").forEach((e) => e.classList.toggle("loc-active", p.showImages)), P.querySelectorAll("button[data-act=\"legend\"]").forEach((e) => e.classList.toggle("loc-active", p.showLegend)), P.querySelectorAll("button[data-act=\"fullscreen\"]").forEach((e) => e.classList.toggle("loc-active", Xi())), P.querySelectorAll("button[data-act=\"undo\"]").forEach((e) => {
			e.disabled = !ii();
		}), P.querySelectorAll("button[data-act=\"redo\"]").forEach((e) => {
			e.disabled = !ai();
		}));
	}
	if (M(document, "fullscreenchange", ea), M(document, "webkitfullscreenchange", ea), li(), $(), Yt(), Fr(), mr(), Ve) {
		let e = V("initial");
		f.fitOnInit && e.then((e) => {
			e && Xt();
		});
	} else ht(), gt(), Be = Promise.resolve(!0), f.fitOnInit && Xt();
	ri(), typeof ResizeObserver < "u" && !f.targetSize && f.reflowOnResize && (Le = F.clientWidth > 0 && F.clientHeight > 0 ? F.clientWidth / F.clientHeight : 0, Fe = new ResizeObserver(() => {
		if (p.subtreeMode !== "AutoSmart" && p.subtreeMode !== "GridSmart" && p.subtreeMode !== "Auto" || Object.keys(g).length || F.clientWidth <= 0 || F.clientHeight <= 0) return;
		let e = F.clientWidth / F.clientHeight;
		Le && Math.abs(Math.log(e / Le)) < .08 || (Le = e, Ie && cancelAnimationFrame(Ie), Ie = requestAnimationFrame(() => {
			Ie = 0, V("resize").then((e) => {
				e && Xt();
			});
		}));
	}), Fe.observe(F));
	let ca = !1;
	function la() {
		if (!ca) {
			ca = !0, St("destroyed"), He.forEach(({ target: e, type: t, fn: n, optsL: r }) => e.removeEventListener(t, n, r)), He.length = 0, je && cancelAnimationFrame(je), sn(), Ie && cancelAnimationFrame(Ie), Fe && Fe.disconnect(), yr && clearTimeout(yr), N.remove();
			for (let e in T) delete T[e];
			for (let e in E) delete E[e];
			for (let e in D) delete D[e];
		}
	}
	let ua = {
		root: N,
		setNodes: Pi,
		loadJSON: Fi,
		setOrientation: Ii,
		setSubtreeMode: Li,
		setSpacing: Ri,
		setOption: zi,
		setShowGrid: Bi,
		setSnapToGrid: Vi,
		setAlignToGrid: Hi,
		toggleGrid: Ui,
		fitToScreen: Xt,
		relayout: Ki,
		forceRelayout: qi,
		resetView: Ji,
		expandAll: en,
		collapseAll: tn,
		toggleCollapse: nn,
		centerOnNode: Zt,
		search: rn,
		clearSearch: an,
		exportJSON: xi,
		exportSVG: ki,
		exportPNG: Ai,
		exportWebP: ji,
		exportPDF: Mi,
		buildSVG: Ei,
		setEditMode: hr,
		isEditMode: () => p.editMode,
		setShowImages: Gi,
		isShowingImages: () => p.showImages,
		setShowLegend: Ir,
		toggleLegend: Lr,
		isShowingLegend: () => p.showLegend,
		getLegendBody: () => ft,
		setAutoEdgeSide: Wi,
		isAutoEdgeSide: () => p.autoEdgeSide,
		setPhotoHeight: (e) => jt({ photoHeight: e }),
		setCardWidth: (e) => jt({ width: e }),
		setCardSize: jt,
		setPhotoContain: (e) => jt({ contain: e !== !1 }),
		getSelection: () => [...x],
		setSelection: (e) => Cn(Array.isArray(e) ? e : e ? [e] : []),
		clearSelection: () => {
			wn(), bn();
		},
		getEdgeSelection: () => [...H],
		setEdgeSelection: kn,
		clearEdgeSelection: On,
		resetSelectedEdges: An,
		getFamilyRouteSelection: () => p.selectedFamilyId,
		getFamilyNetworks: () => J(Ee),
		getFamilyRouteOverrides: () => J(y),
		setFamilyRouteOverride: Kn,
		resetFamilyRoute: Gn,
		enterFullscreen: Zi,
		exitFullscreen: Qi,
		toggleFullscreen: $i,
		isFullscreen: Xi,
		undo: oi,
		redo: si,
		canUndo: ii,
		canRedo: ai,
		updateNode: Tr,
		addChild: Dr,
		deleteNode: Or,
		reparentNode: ir,
		detachNode: ar,
		attachNode: or,
		beginAttach: cr,
		cancelAttach: lr,
		isAttaching: () => !!sr,
		openInspector: gr,
		closeInspector: _r,
		nodeScreenRect: In,
		getSettings: G,
		setSettings: Vr,
		toggleSettings: Hr,
		resetSettings: Ur,
		saveLayoutPreset: vi,
		loadLayoutPreset: yi,
		deleteLayoutPreset: bi,
		listLayoutPresets: gi,
		getLayoutPresets: _i,
		getLayout: mi,
		applyLayout: hi,
		getNodeHost: (e) => T[e] || null,
		getNodeSlotEl: (e) => T[e] ? T[e].querySelector(".loc-node-slot") : null,
		getInspectorBody: () => at,
		getSettingsBody: () => lt,
		nodeThemeStyle: (e) => h[e] ? oe(h[e], S) : null,
		getState: () => ({
			...p,
			familyRouteOverrides: J(y)
		}),
		getNodes: () => m.map((e) => ({ ...e })),
		getPositioned: () => C,
		isLayoutBusy: () => ze,
		whenLayoutSettled: () => Be,
		cancelLayout: () => St("cancelled"),
		on: We,
		off: Ge,
		destroy: la
	};
	return ua;
}
//#endregion
export { Se as t };
