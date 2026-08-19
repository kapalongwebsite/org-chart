import { C as e, D as t, E as n, F as r, S as i, c as a, d as o, f as s, h as c, i as l, k as u, n as ee, o as d, r as te, s as ne, t as re, v as ie } from "./bounds-CAhLOk4F.js";
import { a as ae, i as oe, n as se, o as ce, s as le } from "./core--iXSOaZm.js";
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
	return new Worker("" + new URL("assets/layout.worker-fj2W-XDG.js", import.meta.url).href, { name: e?.name });
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
		return (Ue[e] || (Ue[e] = [])).push(t), da;
	}
	function Ge(e, t) {
		return Ue[e] && (Ue[e] = Ue[e].filter((e) => e !== t)), da;
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
	let P = f.toolbar ? ca() : null;
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
	nt.textContent = "100%";
	let rt = B("div", "loc-layout-status");
	rt.hidden = !0, rt.setAttribute("role", "status"), rt.setAttribute("aria-live", "polite"), rt.innerHTML = "<span class=\"loc-layout-spinner\" aria-hidden=\"true\"></span><span>Arranging chart&hellip;</span>", Ke.appendChild(qe), Ke.appendChild(Je), Ke.appendChild($e), Ke.appendChild(I), F.appendChild(Ke), F.appendChild(nt), F.appendChild(rt);
	let it = null;
	f.fullscreenControl && (it = B("button", "loc-fsbtn"), it.type = "button", it.title = "Fullscreen", it.setAttribute("aria-label", "Toggle fullscreen"), it.innerHTML = "⛶", M(it, "click", (e) => {
		e.stopPropagation(), ea();
	}), F.appendChild(it)), N.appendChild(F);
	let R = B("div", "loc-panel");
	R.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Node</span><button class=\"loc-panel-close\" title=\"Close\" data-role=\"panel-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"panel-body\"></div><div class=\"loc-panel-foot\" data-role=\"panel-foot\"></div>";
	let at = mt(f.inspectorTarget) || F;
	at.appendChild(R), at !== F && R.classList.add("loc-panel-external");
	let ot = R.querySelector("[data-role=\"panel-body\"]"), st = R.querySelector("[data-role=\"panel-foot\"]"), ct = R.querySelector(".loc-panel-title"), z = B("div", "loc-settings");
	z.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Settings</span><button class=\"loc-panel-close\" title=\"Close\" data-role=\"settings-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"settings-body\"></div>";
	let lt = mt(f.settingsTarget) || F;
	lt.appendChild(z), lt !== F && z.classList.add("loc-panel-external");
	let ut = z.querySelector("[data-role=\"settings-body\"]"), dt = B("div", "loc-legend");
	dt.innerHTML = "<div class=\"loc-legend-head\"><span class=\"loc-legend-title\">Legend</span><button class=\"loc-legend-close\" title=\"Hide legend\" data-role=\"legend-close\">✕</button></div><div class=\"loc-legend-body\" data-role=\"legend-body\"></div>";
	let ft = mt(f.legendTarget) || F;
	ft.appendChild(dt), ft !== F && dt.classList.add("loc-legend-external");
	let pt = dt.querySelector("[data-role=\"legend-body\"]");
	At(), jt(), ue.appendChild(N);
	function B(e, t) {
		let n = document.createElement(e);
		return t && (n.className = t), n;
	}
	function mt(e) {
		if (!e) return null;
		let t = typeof e == "string" ? document.querySelector(e) : e;
		return t && t.appendChild ? t : null;
	}
	function ht() {
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
	function gt() {
		let e = ht(), t = s(m, e);
		xt(t), f.layoutCache !== !1 && ye(yt(m, e), vt(t));
	}
	function _t() {
		N.classList.toggle("loc-horizontal", o(ht())), Yt(), Gt(), kt(), Jt(), sn(), p.showLegend && zr(), X(), j("layout-change", {
			positioned: C,
			familyNetworks: Ee,
			mode: p.subtreeMode,
			orientation: p.orientation
		});
	}
	function vt(e) {
		return {
			positioned: e.positioned,
			bounds: e.bounds,
			framingBounds: e.framingBounds,
			familyNetworks: e.familyNetworks || [],
			cfg: e.cfg
		};
	}
	function yt(e, t) {
		return JSON.stringify({
			nodes: e,
			options: t
		});
	}
	function bt() {
		let e = Object.create(null);
		for (let t of Object.keys(g)) {
			let n = w[t];
			n && (e[t] = d(n, g));
		}
		return e;
	}
	function xt(e, t) {
		let n = pe(vt(e)), r = bt(), i = Object.assign(Object.create(null), t || {}, r);
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
	function St(e) {
		ze = !!e;
		let t = ze && C.length === 0;
		N.classList.toggle("loc-layout-busy", ze), N.classList.toggle("loc-layout-initial-busy", t), rt.hidden = !t, ze ? N.setAttribute("aria-busy", "true") : N.removeAttribute("aria-busy");
	}
	function Ct(e = "superseded", t = !1) {
		let n = A;
		return n ? (A = null, n.worker && n.worker.terminate(), n.timer && clearTimeout(n.timer), n.resolve(!1), j("layout-cancel", {
			id: n.id,
			reason: n.reason,
			cause: e
		}), t || St(!1), !0) : !1;
	}
	function wt(e, t, n, r) {
		return !A || A.id !== e.id || e.id !== Re ? !1 : (A = null, xt(t, e.pins), _t(), St(!1), j("layout-complete", {
			id: e.id,
			reason: e.reason,
			durationMs: Math.round(n || 0),
			cached: !!r
		}), e.resolve(!0), !0);
	}
	function Tt(e, t) {
		!A || A.id !== e.id || (A = null, St(!1), j("layout-error", {
			id: e.id,
			reason: e.reason,
			error: t instanceof Error ? t : Error(t?.message || String(t))
		}), e.resolve(!1));
	}
	function Et(e, t, n) {
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
				f.layoutCache !== !1 && ye(e.signature, vt(r)), wt(e, r, performance.now() - n, !1);
			} catch (t) {
				Tt(e, t);
			}
		}, 0);
	}
	function Dt(e = "refresh", t = {}) {
		Ct("superseded", !0);
		let n = ++Re, r = ht(), i = yt(m, r), a = t.pins || (t.preserveManual ? bt() : null), o, s = new Promise((e) => {
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
		A = c, Be = s, St(!0), j("layout-start", {
			id: n,
			reason: e
		});
		let l = f.layoutCache !== !1 && ve.get(i);
		if (l) return Promise.resolve().then(() => wt(c, l, 0, !0)), s;
		let u = JSON.parse(i);
		if (!Ve) return Et(c, u), s;
		try {
			let e = new fe();
			c.worker = e, e.addEventListener("message", (t) => {
				let n = t.data || {};
				if (!(n.id !== c.id || !A || A.id !== c.id)) {
					if (e.terminate(), c.worker = null, !n.ok) {
						Tt(c, Error(n.error?.message || "Layout worker failed."));
						return;
					}
					f.layoutCache !== !1 && ye(i, n.result), wt(c, n.result, n.durationMs, !1);
				}
			}), e.addEventListener("error", (t) => {
				!A || A.id !== c.id || (e.terminate(), c.worker = null, Et(c, u, Error(t.message || "Layout worker failed to load.")));
			}, { once: !0 }), e.postMessage({
				id: n,
				nodes: u.nodes,
				options: u.options
			});
		} catch (e) {
			c.worker && c.worker.terminate(), c.worker = null, Et(c, u, e);
		}
		return s;
	}
	function V(e = "refresh", t) {
		return Dt(e, t);
	}
	function Ot(e) {
		let t = Object.create(null);
		for (let e of C) t[e.node.id] = d(e, g);
		return e(), Dt("structural-edit", { pins: t });
	}
	function kt() {
		let e = Object.create(null);
		for (let t of C) {
			let n = t.node;
			e[n.id] = !0;
			let r = T[n.id];
			r || (r = Pt(n), T[n.id] = r, $e.appendChild(r)), r.style.width = n.width + "px", r.style.height = n.height + "px";
			let i = d(t, g);
			r.style.transform = `translate(${i.x - n.width / 2}px, ${i.y - n.height / 2}px)`, f.nodeSlots || (r.dataset.fitted || (Lt(r), r.dataset.fitted = "1"), Mr(r, n)), r.classList.toggle("loc-selected", x.has(n.id)), r.classList.toggle("loc-primary", p.selectedNodeId === n.id && x.size > 1), Rt(r, n);
		}
		for (let t in T) e[t] || (T[t].remove(), delete T[t]);
		j("nodes-rendered", { ids: C.map((e) => e.node.id) });
	}
	function At() {
		N.style.setProperty("--loc-photo-h", (p.photoHeight || 104) + "px"), N.style.setProperty("--loc-photo-fit", p.photoContain ? "contain" : "cover");
	}
	function jt() {
		let e = Math.max(100, p.cardWidth || r.width), t = Math.max(60, (p.photoHeight || 104) + me);
		for (let n of m) n.type !== "department" && (n.width = e, n.height = t);
	}
	function Mt(e) {
		e ||= {};
		let t = p.cardWidth, n = p.photoHeight;
		typeof e.width == "number" && (p.cardWidth = Math.max(100, e.width)), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight));
		let r = p.cardWidth !== t || p.photoHeight !== n;
		if ("contain" in e && (p.photoContain = !!e.contain), At(), r) {
			jt();
			for (let e in T) delete T[e].dataset.fitted;
			kt(), V("card-size");
		}
		X(), j("settings-change", G());
	}
	function Nt(e) {
		e.textContent = "", e.innerHTML = "<svg class=\"loc-usericon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7\"/></svg>";
	}
	function Pt(e) {
		if (f.nodeSlots) {
			let t = B("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
			return t.dataset.id = e.id, t.innerHTML = "<div class=\"loc-node-slot\"></div>", t.appendChild(Ft()), t;
		}
		let t = B("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
		if (t.dataset.id = e.id, e.type === "department") t.innerHTML = "<span class=\"loc-lbl\"></span>", t.querySelector(".loc-lbl").textContent = e.label, t.querySelector(".loc-lbl").title = e.label || "";
		else {
			t.innerHTML = "<div class=\"loc-photo\"></div><div class=\"loc-ptext\"><div class=\"loc-pname\"></div><div class=\"loc-ptitle\"></div><div class=\"loc-badge\"></div></div>";
			let n = t.querySelector(".loc-photo"), r = e.data && e.data.photo_url;
			if (p.showImages && r) {
				let t = new Image();
				t.crossOrigin = "anonymous", t.alt = e.personName || "", t.referrerPolicy = "no-referrer", t.onerror = () => {
					Nt(n);
				}, t.src = r, n.appendChild(t);
			} else Nt(n);
			let i = t.querySelector(".loc-pname"), a = t.querySelector(".loc-ptitle");
			i.textContent = e.personName || "—", i.title = e.personName || "", a.textContent = e.label, a.title = e.label || "";
			let o = t.querySelector(".loc-badge");
			e.status ? (o.textContent = e.status, o.className = "loc-badge loc-" + e.status) : o.remove();
		}
		return t.appendChild(Ft()), t;
	}
	function Ft() {
		let e = B("div", "loc-toggle");
		return e.dataset.role = "toggle", e;
	}
	function It(e) {
		return e.scrollWidth > e.clientWidth + .5 || e.scrollHeight > e.clientHeight + .5;
	}
	function Lt(e) {
		if (e.style.setProperty("--loc-fit", "1"), !It(e)) return;
		let t = ge, n = 1;
		for (let r = 0; r < 7; r++) {
			let r = (t + n) / 2;
			e.style.setProperty("--loc-fit", String(r)), It(e) ? n = r : t = r;
		}
		e.style.setProperty("--loc-fit", String(t));
	}
	function Rt(e, t) {
		let r = e.querySelector("[data-role=\"toggle\"]");
		if (!r) return;
		let i = n(m, t.id) > 0;
		r.style.display = i ? "flex" : "none", r.textContent = t.collapsed ? "+" : "−";
		let a = t.collapsed ? "Expand" : "Collapse";
		r.title = a, r.setAttribute("aria-label", a);
	}
	function zt(e) {
		return document.createElementNS(he, e);
	}
	function Bt(e) {
		return a(w[e.node.parentId], e, ht(), g, _, v);
	}
	function Vt(e) {
		return `M ${e.a.x.toFixed(1)} ${e.a.y.toFixed(1)} L ${e.b.x.toFixed(1)} ${e.b.y.toFixed(1)}`;
	}
	function Ht() {
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
	function Ut(e = null) {
		let t = e || Object.entries(E).map(([e, t]) => ({
			id: e,
			d: t.getAttribute("d") || ""
		})), n = ie(t, Ee, { rebuildFamilyIds: Ht() });
		De = n.familyNetworks, Ye.innerHTML = "";
		for (let e of n.segments) {
			let t = zt("path");
			t.setAttribute("d", e.d), t.setAttribute("class", "loc-visible-edge"), t.dataset.edges = e.memberIds.join(","), Ye.appendChild(t);
		}
	}
	function Wt() {
		let e = Object.create(null);
		et.innerHTML = "";
		for (let t of De) {
			if (!t.trunk) continue;
			let n = String(t.parentId);
			e[n] = !0;
			let r = ke[n];
			if (r || (r = zt("path"), r.dataset.family = n, ke[n] = r, Qe.appendChild(r)), r.setAttribute("d", Vt(t.trunk)), r.dataset.children = t.trunk.childIds.join(","), p.selectedFamilyId === n) for (let e of t.segments) {
				let t = zt("path");
				t.setAttribute("d", e.d || Vt(e)), t.setAttribute("class", "loc-family-selected"), et.appendChild(t);
			}
		}
		for (let t in ke) e[t] || (ke[t].remove(), delete ke[t]);
		p.selectedFamilyId && !e[p.selectedFamilyId] && Gn();
	}
	function Gt() {
		let e = Object.create(null), t = [];
		for (let n of C) {
			let r = n.node;
			if (!r.parentId || !w[r.parentId]) continue;
			e[r.id] = !0;
			let i = Bt(n);
			t.push({
				id: r.id,
				d: i
			});
			let a = E[r.id];
			a || (a = zt("path"), a.setAttribute("class", "loc-logical-edge"), E[r.id] = a, Xe.appendChild(a)), a.setAttribute("d", i), a.classList.toggle("loc-sel", p.selectedEdgeId === r.id), a.classList.toggle("loc-incident", Dn(r));
			let o = D[r.id];
			o || (o = zt("path"), o.dataset.edge = r.id, D[r.id] = o, Ze.appendChild(o)), o.setAttribute("d", i);
		}
		for (let t in E) e[t] || (E[t].remove(), delete E[t]);
		for (let t in D) e[t] || (D[t].remove(), delete D[t]);
		Ut(t), Wt(), On(), p.selectedEdgeId && !e[p.selectedEdgeId] ? U() : Xn();
	}
	function Kt(e) {
		let t = w[e];
		if (!t || !w[t.node.parentId]) return;
		let n = Bt(t);
		return E[e] && E[e].setAttribute("d", n), D[e] && D[e].setAttribute("d", n), !0;
	}
	function qt(e) {
		Kt(e) && (Ut(), Wt());
	}
	function Jt() {
		Ke.style.transform = `translate(${p.panX}px, ${p.panY}px) scale(${p.zoom})`, nt.textContent = Math.round(p.zoom * 100) + "%", p.selectedEdgeId && !O && Xn(), X();
	}
	function Yt() {
		let e = 0, t = 0, n = 0, r = 0;
		for (let i of C) {
			let a = d(i, g), o = i.node.width / 2, s = i.node.height / 2;
			e = Math.min(e, a.x - o - 80), t = Math.min(t, a.y - s - 80), n = Math.max(n, a.x + o + 80), r = Math.max(r, a.y + s + 80);
		}
		Je.setAttribute("width", n), Je.setAttribute("height", r), I.setAttribute("width", n), I.setAttribute("height", r);
		let i = p.gridSize;
		qe.style.left = e + "px", qe.style.top = t + "px", qe.style.width = n - e + "px", qe.style.height = r - t + "px", qe.style.backgroundSize = i + "px " + i + "px", qe.style.backgroundPosition = (-e % i + i) % i + "px " + (-t % i + i) % i + "px";
	}
	function Xt() {
		qe.classList.toggle("loc-on", p.showGrid), F.classList.toggle("loc-gridon", p.showGrid);
	}
	function Zt() {
		if (!C.length) return;
		let e = Ei(0), t = ee(e, F.clientWidth, F.clientHeight);
		p.zoom = t.zoom, p.panX = t.panX, p.panY = t.panY, Jt();
	}
	function Qt(e) {
		let t = w[e];
		if (!t) return;
		let n = d(t, g);
		p.panX = F.clientWidth / 2 - n.x * p.zoom, p.panY = F.clientHeight / 2 - n.y * p.zoom, Jt();
	}
	function $t() {
		let e = f.fitOnLayoutChange;
		return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
	}
	function en() {
		let e = $t();
		if (e === "fit") {
			Zt();
			return;
		}
		if (e === "recenter") {
			let e = m.find((e) => !e.parentId), t = p.selectedNodeId && w[p.selectedNodeId] ? p.selectedNodeId : e && e.id;
			t && Qt(t);
		}
	}
	function tn() {
		for (let e of m) e.collapsed = !1;
		V("expand-all"), Y();
	}
	function nn() {
		let e = t(m, h);
		for (let t of m) t.collapsed = e[t.id] >= 1 && n(m, t.id) > 0;
		V("collapse-all"), Y();
	}
	function rn(e) {
		let t = h[e];
		t && (Ot(() => {
			t.collapsed = !t.collapsed;
		}), In(), Y());
	}
	function an(e) {
		if (Me = le(m, e), sn(), Me.size) {
			let e = C.find((e) => Me.has(e.node.id));
			e && Qt(e.node.id);
		}
		return Me.size;
	}
	function on() {
		Me = /* @__PURE__ */ new Set(), sn();
	}
	function sn() {
		let e = Me.size > 0;
		for (let t of C) {
			let n = T[t.node.id];
			if (!n) continue;
			let r = Me.has(t.node.id);
			n.classList.toggle("loc-highlight", e && r), n.classList.toggle("loc-dim", e && !r);
		}
		for (let t in E) E[t].classList.toggle("loc-hl", e && Me.has(t));
	}
	function cn() {
		Pe && clearTimeout(Pe), Pe = 0, Ne = null;
	}
	function ln(e) {
		cn(), Ne = String(e), Pe = setTimeout(cn, 0);
	}
	function un(e) {
		if (e) {
			for (let t of e.groupIds) vn(t);
			yn(e.groupIds), j("node-drag", {
				id: e.id,
				node: h[e.id],
				offset: g[e.id],
				group: e.groupIds
			});
		}
	}
	function dn(e, t) {
		if (e.target.closest("[data-role=\"toggle\"]") || (e.stopPropagation(), sa(), cr && dr(t))) return;
		if (U(), Gn(), e.ctrlKey || e.metaKey) {
			Cn(t);
			return;
		}
		if (x.has(t) ? (p.selectedNodeId = t, bn(), In()) : Sn(t), j("node-select", {
			id: t,
			node: h[t],
			rect: Ln(t)
		}), f.readonly || !f.enableDragging || !p.editMode) {
			f.inspector && _r(t);
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
		}), Z("pointermove", fn), Z("pointerup", pn);
	}
	function fn(e) {
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
				let r = mn(k.id, e + t, a + n);
				t = r.cx - e, n = r.cy - a, gn(r.gx, r.gy);
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
			je = 0, un(k);
		});
	}
	function pn() {
		let e = !1, t = k;
		if (t) {
			je && (cancelAnimationFrame(je), je = 0, un(t));
			for (let e of t.groupIds) T[e] && T[e].classList.remove("loc-dragging");
			j("node-drag-end", {
				id: t.id,
				node: h[t.id],
				offset: g[t.id],
				group: t.groupIds
			}), Yt(), e = !!t.moved, e ? ln(t.id) : f.inspector && _r(t.id);
		}
		k = null, _n(), Q("pointermove", fn), Q("pointerup", pn), X(), e && Y();
	}
	function mn(e, t, n) {
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
	function hn(e, t) {
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
		return gn(c, ee), {
			x: u,
			y: ne
		};
	}
	function gn(e, t) {
		tt.innerHTML = "";
		let n = +I.getAttribute("width") || 0, r = +I.getAttribute("height") || 0, i = (e, t, n, r) => {
			let i = zt("line");
			i.setAttribute("x1", e), i.setAttribute("y1", t), i.setAttribute("x2", n), i.setAttribute("y2", r), i.setAttribute("class", "loc-align-line"), tt.appendChild(i);
		};
		e != null && i(e, 0, e, r), t != null && i(0, t, n, t);
	}
	function _n() {
		tt.innerHTML = "";
	}
	function vn(e) {
		let t = w[e], n = T[e];
		if (!t || !n) return;
		let r = d(t, g);
		n.style.transform = `translate(${r.x - t.node.width / 2}px, ${r.y - t.node.height / 2}px)`;
	}
	function yn(e) {
		let t = new Set((e || []).map(String)), n = /* @__PURE__ */ new Set();
		for (let e of t) {
			let t = w[e];
			t && w[t.node.parentId] && n.add(String(e));
		}
		for (let e of C) t.has(String(e.node.parentId)) && n.add(String(e.node.id));
		let r = !1;
		for (let e of n) r = Kt(e) || r;
		r && (Ut(), Wt()), p.selectedEdgeId && Xn();
	}
	function bn() {
		for (let e in T) T[e].classList.toggle("loc-selected", x.has(e)), T[e].classList.toggle("loc-primary", p.selectedNodeId === e && x.size > 1);
	}
	function xn() {
		j("selection-change", {
			ids: [...x],
			primary: p.selectedNodeId
		});
	}
	function Sn(e) {
		x = new Set(e ? [e] : []), p.selectedNodeId = e || null, bn(), In();
	}
	function Cn(e) {
		x.has(e) ? (x.delete(e), p.selectedNodeId === e && (p.selectedNodeId = x.size ? [...x][x.size - 1] : null)) : (x.add(e), p.selectedNodeId = e), bn(), In(), xn();
	}
	function wn(e, t) {
		x = new Set(e), p.selectedNodeId = t ?? (e.length ? e[e.length - 1] : null), bn(), In(), xn();
	}
	function Tn() {
		x = /* @__PURE__ */ new Set(), p.selectedNodeId = null, bn(), In();
	}
	function En(e) {
		let t = Rn(e.clientX, e.clientY), n = e.shiftKey ? new Set(x) : /* @__PURE__ */ new Set(), r = zt("rect");
		r.setAttribute("class", "loc-marquee"), I.appendChild(r), F.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = Rn(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e of C) {
				let t = d(e, g);
				t.x >= o && t.x <= o + c && t.y >= s && t.y <= s + l && u.add(e.node.id);
			}
			x = u, p.selectedNodeId = x.size ? [...x][x.size - 1] : null, bn(), In(), i = !0;
		}, o = () => {
			r.remove(), F.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? (xn(), x.size === 1 && f.inspector && _r([...x][0])) : (Tn(), vr());
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function Dn(e) {
		return x.has(e.id) || x.has(e.parentId);
	}
	let H = /* @__PURE__ */ new Set();
	function On() {
		for (let e in E) E[e].classList.toggle("loc-edge-selected", H.has(e));
	}
	function kn() {
		H.size && (H = /* @__PURE__ */ new Set(), On(), j("edges-select", { ids: [] }));
	}
	function An(e) {
		H = new Set((e || []).filter((e) => E[e])), On(), j("edges-select", { ids: [...H] });
	}
	function jn() {
		if (!H.size) return;
		let e = !1;
		for (let t of H) _[t] && (delete _[t], e = !0), v[t] && (delete v[t], e = !0);
		e && (p.selectedEdgeId && H.has(p.selectedEdgeId) && U(), Gt(), On(), X(), Y(), j("edges-reset", { ids: [...H] }));
	}
	function Mn(e, t, n, r, i, a, o, s) {
		let c = (n - e) * (s - a) - (r - t) * (o - i);
		if (Math.abs(c) < 1e-9) return !1;
		let l = ((i - e) * (s - a) - (a - t) * (o - i)) / c, u = ((i - e) * (r - t) - (a - t) * (n - e)) / c;
		return l >= 0 && l <= 1 && u >= 0 && u <= 1;
	}
	function Nn(e, t, n, r, i, a) {
		let o = n + i, s = r + a, c = (e) => e.x >= n && e.x <= o && e.y >= r && e.y <= s;
		return c(e) || c(t) ? !0 : Mn(e.x, e.y, t.x, t.y, n, r, o, r) || Mn(e.x, e.y, t.x, t.y, o, r, o, s) || Mn(e.x, e.y, t.x, t.y, o, s, n, s) || Mn(e.x, e.y, t.x, t.y, n, s, n, r);
	}
	function Pn(e, t, n, r, i) {
		let a = Bn(e);
		if (!a) return !1;
		for (let e of Hn(a)) if (Nn(e.a, e.b, t, n, r, i)) return !0;
		return !1;
	}
	function Fn(e) {
		let t = Rn(e.clientX, e.clientY), n = e.shiftKey ? new Set(H) : /* @__PURE__ */ new Set(), r = zt("rect");
		r.setAttribute("class", "loc-marquee loc-marquee-edge"), I.appendChild(r), F.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = Rn(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e in E) Pn(e, o, s, c, l) && u.add(e);
			H = u, On(), i = !0;
		}, o = () => {
			r.remove(), F.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? j("edges-select", { ids: [...H] }) : kn();
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function In() {
		for (let e in E) {
			let t = w[e];
			E[e].classList.toggle("loc-incident", !!t && Dn(t.node));
		}
	}
	function Ln(e) {
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
	function Rn(e, t) {
		let n = F.getBoundingClientRect();
		return {
			x: (e - n.left - p.panX) / p.zoom,
			y: (t - n.top - p.panY) / p.zoom
		};
	}
	function zn(e) {
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
	function Bn(e) {
		let t = w[e];
		if (!t) return null;
		let n = w[t.node.parentId];
		if (!n) return null;
		let r = ht(), i = l(t, _[e], v[e], n, r, g);
		return te(n, t, i, r, g, v[e]);
	}
	function Vn(e) {
		if (_[e]) return _[e];
		let t = w[e], n = t && w[t.node.parentId], r = l(t, null, v[e], n, ht(), g);
		return _[e] = r.map((e) => ({
			x: e.x,
			y: e.y
		})), _[e];
	}
	function Hn(e) {
		let t = [], n = o(ht());
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
	function Un(e) {
		Gn(), p.selectedEdgeId && E[p.selectedEdgeId] && E[p.selectedEdgeId].classList.remove("loc-sel"), x = /* @__PURE__ */ new Set(), p.selectedNodeId = null, bn(), p.selectedEdgeId = e, E[e] && E[e].classList.add("loc-sel"), In(), Xn();
	}
	function U() {
		p.selectedEdgeId && E[p.selectedEdgeId] && E[p.selectedEdgeId].classList.remove("loc-sel"), p.selectedEdgeId = null, L.innerHTML = "";
	}
	function Wn(e) {
		let t = String(e);
		U(), x = /* @__PURE__ */ new Set(), p.selectedNodeId = null, bn(), p.selectedFamilyId = t, Gt();
		let n = De.find((e) => String(e.parentId) === t) || Ee.find((e) => String(e.parentId) === t);
		j("family-route-select", {
			parentId: t,
			childIds: n ? n.childIds.slice() : []
		});
	}
	function Gn() {
		if (p.selectedFamilyId) {
			p.selectedFamilyId = null, et.innerHTML = "";
			for (let e in E) E[e].classList.remove("loc-family-member");
		}
	}
	function Kn(e = p.selectedFamilyId) {
		let t = e == null ? null : String(e);
		return !t || !y[t] ? !1 : (delete y[t], V("family-route-reset"), X(), Y(), j("family-route-reset", { parentId: t }), !0);
	}
	function qn(e, t) {
		let n = e == null ? "" : String(e);
		return !n || !w[n] ? !1 : !t || !Number.isFinite(Number(t.trunkOffset)) ? Kn(n) : (y[n] = { trunkOffset: Number(t.trunkOffset) }, p.selectedFamilyId = n, V("family-route-override"), X(), Y(), j("family-route-change", {
			parentId: n,
			trunkOffset: y[n].trunkOffset,
			pending: !1
		}), !0);
	}
	function Jn(e, t, n, r) {
		let i = zt("circle");
		return i.setAttribute("cx", e), i.setAttribute("cy", t), i.setAttribute("r", n), i.setAttribute("class", r), i;
	}
	function Yn(e, t, n, r) {
		let i = zt("rect");
		return i.setAttribute("x", e - n), i.setAttribute("y", t - n), i.setAttribute("width", 2 * n), i.setAttribute("height", 2 * n), i.setAttribute("rx", 2 / p.zoom), i.setAttribute("class", r), i;
	}
	function Xn() {
		L.innerHTML = "";
		let e = p.selectedEdgeId;
		if (!e || f.readonly) return;
		let t = Bn(e);
		if (!t) return;
		let n = _[e] || [], r = 6 / p.zoom, i = 5 / p.zoom;
		if (!p.editMode) {
			for (let e = 0; e < n.length; e++) {
				let t = Jn(n[e].x, n[e].y, r, "loc-wp-handle loc-wp-readonly");
				t.dataset.wp = e, L.appendChild(t);
			}
			return;
		}
		for (let e of Hn(t)) {
			let t = Jn((e.a.x + e.b.x) / 2, (e.a.y + e.b.y) / 2, i, "loc-wp-add");
			t.dataset.add = e.insert, L.appendChild(t);
		}
		for (let e = 0; e < n.length; e++) {
			let t = Jn(n[e].x, n[e].y, r, "loc-wp-handle");
			t.dataset.wp = e, L.appendChild(t);
		}
		let a = t[0], o = t[t.length - 1], s = Yn(a.x, a.y, 6 / p.zoom, "loc-ep loc-ep-parent");
		s.dataset.ep = "parent", L.appendChild(s);
		let c = Yn(o.x, o.y, 6 / p.zoom, "loc-ep loc-ep-child");
		c.dataset.ep = "child", L.appendChild(c);
	}
	function Zn(e, t) {
		let n = d(e, g), r = e.node.width, i = e.node.height, a = (t.x - n.x) / (r / 2), o = (t.y - n.y) / (i / 2), s = Math.max(Math.abs(a), Math.abs(o));
		return s > 1e-6 && (a /= s, o /= s), {
			nx: Math.max(-1, Math.min(1, a)),
			ny: Math.max(-1, Math.min(1, o))
		};
	}
	let Qn = .34;
	function $n(e) {
		let t = e.nx, n = e.ny;
		return Math.abs(Math.abs(n) - 1) < 1e-6 && Math.abs(t) < Qn ? t = 0 : Math.abs(Math.abs(t) - 1) < 1e-6 && Math.abs(n) < Qn && (n = 0), {
			nx: t,
			ny: n
		};
	}
	function er(e, t) {
		let n = new Set([t].concat(Dr(t)));
		for (let t = C.length - 1; t >= 0; t--) {
			let r = C[t];
			if (n.has(r.node.id)) continue;
			let i = d(r, g);
			if (e.x >= i.x - r.node.width / 2 && e.x <= i.x + r.node.width / 2 && e.y >= i.y - r.node.height / 2 && e.y <= i.y + r.node.height / 2) return r.node.id;
		}
		return null;
	}
	let tr = null;
	function nr(e) {
		tr && T[tr] && T[tr].classList.remove("loc-reparent-target"), tr = e, e && T[e] && T[e].classList.add("loc-reparent-target");
	}
	function rr(e) {
		if (!O || O.kind !== "ep") return;
		let t = O.id, n = w[t];
		if (!n) return;
		let r = w[n.node.parentId];
		if (!r) return;
		let i = zn(Rn(e.clientX, e.clientY));
		if (v[t] = v[t] || {}, O.changed = !0, O.which === "child") v[t].c = $n(Zn(n, i));
		else {
			v[t].p = $n(Zn(r, i));
			let e = er(i, t);
			nr(e && e !== n.node.parentId ? e : null);
		}
		qt(t), Xn();
	}
	function ir() {
		let e = O;
		if (O = null, Q("pointermove", rr), Q("pointerup", ir), e && e.which === "parent" && tr) {
			let t = tr;
			nr(null), ar(e.id, t);
			return;
		}
		nr(null), X(), e && e.changed && Y();
	}
	function ar(e, t) {
		let n = h[e];
		if (!n || t === e || t && Dr(e).indexOf(t) >= 0) return;
		let r = t || "", i = n.parentId == null ? "" : String(n.parentId);
		(n.parentId || "") !== r && (p.selectedEdgeId = null, p.selectedFamilyId = null, L.innerHTML = "", et.innerHTML = "", Ot(() => {
			n.parentId = r, b[e] = Object.assign(b[e] || {}, { parentId: r }), delete _[e], delete v[e], i && delete y[i], r && delete y[r], w[e] && Object.assign(w[e].node, { parentId: r });
		}), In(), R.classList.contains("loc-open") && p.selectedNodeId === e && yr(), j("node-change", {
			id: e,
			node: { ...n },
			patch: { parentId: r },
			reparented: !0
		}), Y());
	}
	function or(e) {
		ar(e, "");
	}
	function sr(e, t) {
		t && ar(e, t);
	}
	let cr = null;
	function lr(e) {
		e && (cr = e, N.classList.add("loc-attaching"), j("attach-start", { id: e }));
	}
	function ur() {
		cr && (cr = null, N.classList.remove("loc-attaching"), j("attach-cancel", {}));
	}
	function dr(e) {
		let t = cr;
		return !t || !e || e === t || Dr(t).indexOf(e) >= 0 ? (ur(), !1) : (cr = null, N.classList.remove("loc-attaching"), sr(t, e), f.inspector && _r(t), !0);
	}
	function fr(e, t, n) {
		let r = n.x - t.x, i = n.y - t.y, a = r * r + i * i, o = a ? ((e.x - t.x) * r + (e.y - t.y) * i) / a : 0;
		return o = Math.max(0, Math.min(1, o)), Math.hypot(e.x - (t.x + o * r), e.y - (t.y + o * i));
	}
	function pr(e, t) {
		let n = Hn(e), r = 0, i = Infinity;
		for (let e of n) {
			let n = fr(t, e.a, e.b);
			n < i && (i = n, r = e.insert);
		}
		return r;
	}
	let mr = [
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
	function hr() {
		N.classList.toggle("loc-edit", p.editMode);
	}
	function gr(e) {
		p.editMode = !!e, hr(), $(), p.editMode || (U(), Gn()), R.classList.contains("loc-open") && yr(), j("edit-mode-change", { editMode: p.editMode }), X();
	}
	function _r(e) {
		f.inspector && (p.selectedNodeId = e, R.classList.add("loc-open"), yr(), j("inspector-open", {
			id: e,
			node: h[e]
		}));
	}
	function vr() {
		R.classList.contains("loc-open") && (R.classList.remove("loc-open"), j("inspector-close", {}));
	}
	function yr() {
		let e = p.selectedNodeId, t = e && h[e];
		if (!t) {
			vr();
			return;
		}
		if (ct.textContent = t.label || t.personName || t.id, f.inspectorSlot) {
			st.innerHTML = "";
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
		])) + o("Photo URL", i("photo_url", t.data && t.data.photo_url || ""))), f.advancedLayoutControls && (s += o("Layout override", a("layoutMode", t.layoutMode || "", mr.map((e) => [e, e || "(inherit)"])))), s += o("Width", i("width", t.width, "number")) + o("Height", i("height", t.height, "number")), ot.innerHTML = s, st.innerHTML = n ? "<button data-role=\"add-child\">+ Add child</button>" + (t.parentId ? "<button data-role=\"detach\">Detach</button>" : "<button data-role=\"attach\">Attach…</button>") + "<button data-role=\"del-node\" class=\"loc-danger\">Delete</button>" : "<span class=\"loc-foot-hint\">Turn on Edit to modify fields</span>";
	}
	let br = 0, xr = 0;
	function Sr(e) {
		if (!f.userSearch) return;
		let t = ot.querySelector("[data-role=\"user-results\"]");
		if (!t) return;
		br && clearTimeout(br);
		let n = (e || "").trim();
		if (!n) {
			t.hidden = !0, t.innerHTML = "";
			return;
		}
		let r = ++xr;
		br = setTimeout(() => {
			try {
				Promise.resolve(f.userSearch(n, h[p.selectedNodeId])).then((e) => {
					r === xr && Cr(t, Array.isArray(e) ? e : []);
				}).catch(() => {});
			} catch {}
		}, 220);
	}
	function Cr(e, t) {
		if (!t.length) {
			e.hidden = !0, e.innerHTML = "";
			return;
		}
		e.innerHTML = t.slice(0, 8).map((e, t) => {
			let n = W(e.name || e.personName || e.label || ""), r = W(e.title || e.label || e.email || "");
			return `<button type="button" class="loc-usersearch-item" data-uidx="${t}"><b>${n}</b>${r ? `<small>${r}</small>` : ""}</button>`;
		}).join(""), e.hidden = !1, e._users = t;
	}
	function wr(e) {
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
		Er(t, r);
		let i = ot.querySelector("[data-role=\"user-results\"]");
		i && (i.hidden = !0, i.innerHTML = ""), yr(), j("user-select", {
			id: t,
			user: e,
			node: { ...h[t] }
		});
	}
	function Tr() {
		let e;
		do
			e = "node-" + ++Te;
		while (h[e]);
		return e;
	}
	function Er(e, t) {
		let n = h[e];
		if (!n) return;
		Object.assign(n, t), w[e] && w[e].node !== n && Object.assign(w[e].node, t), b[e] = Object.assign(b[e] || {}, t);
		let r = [
			"type",
			"width",
			"height",
			"layoutMode"
		].some((e) => e in t);
		T[e] && (T[e].remove(), delete T[e]), kt(), r && V("node-structure", { preserveManual: !0 }), j("node-change", {
			id: e,
			node: { ...n },
			patch: t
		}), X(), Y("field:" + e + ":" + Object.keys(t).join(","));
	}
	function Dr(e) {
		let t = [], n = [e];
		for (; n.length;) {
			let e = n.pop();
			for (let r of m) r.parentId === e && (t.push(r.id), n.push(r.id));
		}
		return t;
	}
	function Or(e) {
		if (!p.editMode) return null;
		let t = Tr(), n = i({
			id: t,
			parentId: e || "",
			type: "position",
			label: "NEW POSITION",
			personName: "",
			status: ""
		});
		return m.push(n), h[t] = n, e && delete y[String(e)], b[t] = Object.assign({ __new: !0 }, n), V("add-child", { preserveManual: !0 }), Sn(t), _r(t), j("node-change", {
			id: t,
			node: { ...n },
			added: !0
		}), X(), Y(), t;
	}
	function kr(e) {
		if (!p.editMode || !e) return;
		let t = h[e]?.parentId, n = [e].concat(Dr(e)), r = new Set(n);
		m = m.filter((e) => !r.has(e.id)), h = u(m), n.forEach((e) => {
			b[e] = { __deleted: !0 }, T[e] && (T[e].remove(), delete T[e]), x.delete(e);
		}), t && delete y[String(t)], n.forEach((e) => {
			delete y[String(e)];
		}), r.has(p.selectedNodeId) && (p.selectedNodeId = x.size ? [...x][x.size - 1] : null, p.selectedNodeId || vr()), V("delete-node", { preserveManual: !0 }), j("node-change", {
			id: e,
			removed: !0,
			ids: n
		}), X(), Y();
	}
	function Ar() {
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
	let jr = [
		["type", "Type"],
		["status", "Status"],
		["level", "Level (data.level)"],
		["unit", "Unit (data.unit)"],
		["id", "Node id"],
		["label", "Label"]
	];
	function Mr(e, t) {
		let n = oe(t, S);
		Nr(e, "--loc-node-bg", n && n.bg), Nr(e, "--loc-node-text", n && n.text), Nr(e, "--loc-node-border", n && n.border);
	}
	function Nr(e, t, n) {
		n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
	}
	function Pr() {
		for (let e in T) h[e] && Mr(T[e], h[e]);
		p.showLegend && zr();
	}
	let Fr = {
		FILLED: "Filled",
		VACANT: "Vacant",
		UNFUNDED: "Unfunded"
	};
	function Ir() {
		dt.classList.toggle("loc-on", p.showLegend), p.showLegend && zr();
	}
	function Lr(e) {
		return p.showLegend = e == null ? !p.showLegend : !!e, Ir(), $(), X(), j("legend-change", { legend: p.showLegend }), p.showLegend;
	}
	function Rr(e) {
		return Lr(e ?? !p.showLegend);
	}
	function zr() {
		if (f.legendSlot) return;
		let e = Object.create(null), t = Object.create(null);
		for (let n of m) n.type && (e[n.type] = !0), n.status && (t[n.status] = !0);
		let n = "", r = [];
		e.department && r.push(Vr("loc-leg-dept", "Department")), e.position && r.push(Vr("loc-leg-pos", "Position")), r.length && (n += Br("Type", r.join("")));
		let i = [
			"FILLED",
			"VACANT",
			"UNFUNDED"
		].filter((e) => t[e]).map((e) => `<div class="loc-leg-row"><span class="loc-leg-badge loc-${e}">${Fr[e] || e}</span></div>`);
		i.length && (n += Br("Status", i.join("")));
		let a = S.filter((e) => e.enabled && (e.style.bg || e.style.border)).map((e) => `<div class="loc-leg-row"><span class="loc-leg-swatch" style="background:${W(e.style.bg || "#fff")};border-color:${W(e.style.border || e.style.bg || "#d0d5dd")}"></span><span class="loc-leg-label">${W(e.field)} = ${W(e.value || "—")}</span></div>`).join("");
		a && (n += Br("Rules", a)), pt.innerHTML = n || "<div class=\"loc-leg-empty\">No legend items yet.</div>";
	}
	function Br(e, t) {
		return `<div class="loc-leg-section"><div class="loc-leg-title">${e}</div>${t}</div>`;
	}
	function Vr(e, t) {
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
	function Hr(e, t) {
		if (e ||= {}, typeof e.spacingX == "number" && (p.spacingX = e.spacingX), typeof e.spacingY == "number" && (p.spacingY = e.spacingY), typeof e.gridSize == "number" && (p.gridSize = e.gridSize), e.orientation && (p.orientation = be(e.orientation)), e.subtreeMode && (p.subtreeMode = e.subtreeMode), "showGrid" in e && (p.showGrid = !!e.showGrid), "snapGrid" in e && (p.snapGrid = !!e.snapGrid), "alignGrid" in e && (p.alignGrid = !!e.alignGrid), "showImages" in e && !!e.showImages !== p.showImages) {
			p.showImages = !!e.showImages;
			for (let e in T) T[e].remove(), delete T[e];
		}
		"autoEdgeSide" in e && (p.autoEdgeSide = !!e.autoEdgeSide);
		let n = !1;
		if (typeof e.cardWidth == "number" && (p.cardWidth = Math.max(100, e.cardWidth), n = !0), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight), n = !0), "photoContain" in e && (p.photoContain = !!e.photoContain, n = !0), n) {
			At(), jt();
			for (let e in T) delete T[e].dataset.fitted;
		}
		Array.isArray(e.themeRules) && (S = e.themeRules.map(se)), Xt(), $(), V("settings"), z.classList.contains("loc-open") && Yr(), t && t.silent || j("settings-change", G()), X();
	}
	function Ur(e) {
		let t = z.classList.contains("loc-open"), n = e == null ? !t : !!e;
		z.classList.toggle("loc-open", n), P && P.querySelectorAll("button[data-act=\"settings\"]").forEach((e) => e.classList.toggle("loc-active", n)), n && Yr(), n !== t && j(n ? "settings-open" : "settings-close", {});
	}
	function Wr() {
		Hr({
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
		}), Pr();
	}
	function Gr(e, t, n, r, i) {
		return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${r}" max="${i}" value="${n}"/></label>`;
	}
	function Kr(e, t, n, r) {
		return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${r ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${r || "#e0524d"}"/></label>`;
	}
	function qr(e, t) {
		let n = (t, n) => `<option value="${t}"${e.field === t ? " selected" : ""}>${n}</option>`;
		return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + jr.map(([e, t]) => n(e, t)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${W(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Kr(t, "bg", "BG", e.style.bg) + Kr(t, "text", "Text", e.style.text) + Kr(t, "border", "Border", e.style.border) + "</div></div>";
	}
	function Jr() {
		let e = _i().map((e) => `<div class="loc-preset"><button class="loc-preset-apply" data-role="preset-apply" data-name="${W(e.name)}" title="Apply this saved layout">${W(e.name)}</button><span class="loc-preset-tag">${e.full ? "full" : "pattern"}</span><button class="loc-preset-del" data-role="preset-del" data-name="${W(e.name)}" title="Delete preset">✕</button></div>`).join("");
		return e ||= "<div class=\"loc-set-hint\">No saved presets yet.</div>", `<div class="loc-set-section"><div class="loc-set-title">Presets</div><div class="loc-set-hint">Save the current arrangement so an accidental mode change can’t lose it (Undo / Ctrl+Z restores it too).</div><div class="loc-preset-save"><input type="text" data-role="preset-name" placeholder="Preset name…"/><label class="loc-preset-full"><input type="checkbox" data-role="preset-full" checked/> positions</label><button data-role="preset-save">Save</button></div><div class="loc-preset-list">${e}</div></div>`;
	}
	function Yr() {
		if (f.settingsSlot) return;
		let e = Jr() + "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Layout</div>" + Gr("spacingX", "Spacing X", p.spacingX, 0, 200) + Gr("spacingY", "Spacing Y", p.spacingY, 0, 260) + Gr("gridSize", "Grid size", p.gridSize, 6, 80) + `<label class="loc-color"><input type="checkbox" data-set-toggle="showImages"${p.showImages ? " checked" : ""}/><span>Show photos (off → user icon)</span></label><label class="loc-color"><input type="checkbox" data-set-toggle="autoEdgeSide"${p.autoEdgeSide ? " checked" : ""}/><span>Smart edges (lines follow waypoints to any side)</span></label></div>`;
		e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Card size</div><div class=\"loc-set-hint\">Applies to every person card. The photo tops the card at its full size; the name/title sit below.</div>" + Gr("cardWidth", "Card width", p.cardWidth, 120, 320) + Gr("photoHeight", "Photo height", p.photoHeight, 60, 240) + `<label class="loc-color"><input type="checkbox" data-set-toggle="photoContain"${p.photoContain ? " checked" : ""}/><span>Show whole photo (no crop)</span></label></div>`, e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Theme rules</div><div class=\"loc-set-hint\">Recolor nodes that match a field = value. Later rules win.</div>", S.forEach((t, n) => {
			e += qr(t, n);
		}), e += "<button class=\"loc-set-add\" data-role=\"add-rule\">+ Add rule</button></div>", e += "<div class=\"loc-set-foot\"><button class=\"loc-set-reset\" data-role=\"reset-settings\" title=\"Restore spacing, grid &amp; theme rules to defaults\">↺ Reset settings</button></div>", ut.innerHTML = e;
	}
	function Xr(e, t) {
		let n = ut.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
		return n && n.checked;
	}
	function Zr(e, t) {
		let n = ut.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
		return n ? n.value : "";
	}
	let K = [], q = -1, Qr = !1, $r = null;
	function J(e) {
		return e == null ? e : JSON.parse(JSON.stringify(e));
	}
	function ei() {
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
	function ti(e) {
		e && (e.subtreeMode && (p.subtreeMode = e.subtreeMode), e.orientation && (p.orientation = be(e.orientation)), [
			"spacingX",
			"spacingY",
			"gridSize"
		].forEach((t) => {
			typeof e[t] == "number" && (p[t] = e[t]);
		}), "showGrid" in e && (p.showGrid = !!e.showGrid), "snapGrid" in e && (p.snapGrid = !!e.snapGrid), "alignGrid" in e && (p.alignGrid = !!e.alignGrid), "showImages" in e && (p.showImages = !!e.showImages), "autoEdgeSide" in e && (p.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (p.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (p.photoContain = !!e.photoContain), At(), jt(), Array.isArray(e.themeRules) && (S = e.themeRules.map(se)));
	}
	function ni() {
		return {
			nodes: m.map((e) => J(e)),
			manualOffsets: J(g),
			edgeWaypoints: J(_),
			edgeAnchors: J(v),
			familyRouteOverrides: J(y),
			nodeOverrides: J(b),
			view: ei(),
			selectedNodeId: p.selectedNodeId
		};
	}
	function ri(e) {
		Qr = !0, m = (e.nodes || []).map(i), h = u(m), g = J(e.manualOffsets) || Object.create(null), _ = J(e.edgeWaypoints) || Object.create(null), v = J(e.edgeAnchors) || Object.create(null), y = J(e.familyRouteOverrides) || Object.create(null), b = J(e.nodeOverrides) || Object.create(null), ti(e.view);
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		p.selectedEdgeId = null, L.innerHTML = "", p.selectedNodeId = e.selectedNodeId && h[e.selectedNodeId] ? e.selectedNodeId : null, Xt(), V("history"), p.selectedNodeId && Sn(p.selectedNodeId), R.classList.contains("loc-open") && (p.selectedNodeId ? yr() : vr()), z.classList.contains("loc-open") && Yr(), Qr = !1;
	}
	function Y(e) {
		if (Qr) return;
		let t = ni();
		e != null && e === $r && q >= 0 ? K[q] = t : (K = K.slice(0, q + 1), K.push(t), q = K.length - 1, K.length > 100 && (K.shift(), q--)), $r = e ?? null, li();
	}
	function ii() {
		K = [ni()], q = 0, $r = null, li();
	}
	function ai() {
		return q > 0;
	}
	function oi() {
		return q >= 0 && q < K.length - 1;
	}
	function si() {
		ai() && (q--, $r = null, ri(K[q]), li());
	}
	function ci() {
		oi() && (q++, $r = null, ri(K[q]), li());
	}
	function li() {
		$(), j("history-change", {
			canUndo: ai(),
			canRedo: oi()
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
	function ui() {
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
		}), p.showGrid = !!e.showGrid, p.snapGrid = !!e.snapGrid, p.alignGrid = !!e.alignGrid, p.editMode = !!e.editMode, "showImages" in e && (p.showImages = !!e.showImages), "showLegend" in e && (p.showLegend = !!e.showLegend), "autoEdgeSide" in e && (p.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (p.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (p.photoContain = !!e.photoContain), At(), jt(), e.manualOffsets && (g = e.manualOffsets), e.edgeWaypoints && (_ = e.edgeWaypoints), e.edgeAnchors && (v = e.edgeAnchors), e.familyRouteOverrides && (y = e.familyRouteOverrides), e.nodeOverrides && (b = e.nodeOverrides, Ar()), Array.isArray(e.themeRules) && (S = e.themeRules.map(se)), Array.isArray(e.collapsed))) {
			let t = new Set(e.collapsed);
			for (let e of m) e.collapsed = t.has(e.id);
		}
	}
	function di() {
		return f.storageKey + ".presets";
	}
	function fi() {
		try {
			return JSON.parse(localStorage.getItem(di()) || "{}") || {};
		} catch {
			return {};
		}
	}
	function pi(e) {
		try {
			localStorage.setItem(di(), JSON.stringify(e));
		} catch {}
	}
	function mi(e) {
		let t = {
			full: e !== !1,
			view: ei()
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
	function hi(e) {
		return mi(!(e && e.full === !1));
	}
	function gi(e) {
		if (!e) return Promise.resolve(!1);
		if (ti(e.view), e.full && e.layout) {
			g = J(e.layout.manualOffsets) || Object.create(null), _ = J(e.layout.edgeWaypoints) || Object.create(null), v = J(e.layout.edgeAnchors) || Object.create(null), y = J(e.layout.familyRouteOverrides) || Object.create(null), b = J(e.layout.nodeOverrides) || Object.create(null), Ar();
			let t = new Set(e.layout.collapsed || []);
			for (let e of m) e.collapsed = t.has(e.id);
		} else g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null);
		p.selectedNodeId = null, p.selectedEdgeId = null, p.selectedFamilyId = null, L.innerHTML = "", et.innerHTML = "";
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		Xt(), $();
		let t = V("preset");
		return z.classList.contains("loc-open") && Yr(), t.then((e) => {
			e && en();
		}), Y(), j("settings-change", G()), t;
	}
	function _i() {
		let e = fi();
		return Object.keys(e).map((t) => ({
			name: t,
			full: !!e[t].full,
			savedAt: e[t].savedAt || null
		}));
	}
	function vi() {
		return fi();
	}
	function yi(e, t) {
		if (e = String(e ?? "").trim(), !e) return null;
		let n = mi(!(t && t.full === !1));
		n.name = e, n.savedAt = Date.now();
		let r = fi();
		return r[e] = n, pi(r), z.classList.contains("loc-open") && Yr(), j("presets-change", { presets: _i() }), n;
	}
	function bi(e) {
		let t = fi()[String(e)];
		return t ? (gi(t), j("preset-load", {
			name: String(e),
			preset: t
		}), !0) : !1;
	}
	function xi(e) {
		let t = fi();
		return String(e) in t && (delete t[String(e)], pi(t), z.classList.contains("loc-open") && Yr(), j("presets-change", { presets: _i() }), !0);
	}
	function Si(e) {
		let t = ce(p, m, g, _);
		return t.editMode = p.editMode, t.edgeAnchors = v, t.familyRouteOverrides = y, t.nodeOverrides = b, t.settings = G(), e !== !1 && Pi(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
	}
	let Ci = document.createElement("canvas").getContext("2d");
	function wi(e, t) {
		return Ci.font = t, Ci.measureText(e).width;
	}
	function Ti(e) {
		let t = T[e.id];
		if (!t) return 1;
		let n = parseFloat(t.style.getPropertyValue("--loc-fit"));
		return isFinite(n) && n > 0 ? n : 1;
	}
	function Ei(e) {
		return e ??= 0, Oe && Object.keys(g).length === 0 ? {
			x: Oe.x - e,
			y: Oe.y - e,
			w: Oe.w + e * 2,
			h: Oe.h + e * 2
		} : re(C, g, e);
	}
	function Di(e, t) {
		let n = [];
		for (let e in E) n.push({
			id: e,
			d: E[e].getAttribute("d")
		});
		return ae(C, n, {
			manualOffsets: g,
			raster: !!e,
			measureText: wi,
			fitOf: Ti,
			photoHeight: p.photoHeight,
			photoContain: p.photoContain,
			images: t || null,
			familyNetworks: Ee,
			rebuildFamilyIds: Ht(),
			bounds: Ei(40)
		});
	}
	function Oi(e) {
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
	function ki() {
		if (!p.showImages) return Promise.resolve({});
		let e = [], t = /* @__PURE__ */ new Set();
		for (let n of m) {
			let r = n.type !== "department" && n.data && n.data.photo_url;
			r && !t.has(r) && (t.add(r), e.push(r));
		}
		return e.length ? Promise.all(e.map((e) => Oi(e).then((t) => [e, t]))).then((e) => {
			let t = {};
			for (let [n, r] of e) r && (t[n] = r);
			return t;
		}) : Promise.resolve({});
	}
	function Ai() {
		return ki().then((e) => {
			let t = Di(!1, e);
			return Pi(new Blob([t], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), t;
		});
	}
	function ji(e) {
		return e ||= 3, ki().then((t) => new Promise((n) => {
			let r = Ei(40), i = 16e3, a = 2e8, o = Math.min(e, i / r.w, i / r.h);
			r.w * o * r.h * o > a && (o = Math.sqrt(a / (r.w * r.h))), o = Math.max(.05, o);
			let s = URL.createObjectURL(new Blob([Di(!0, t)], { type: "image/svg+xml;charset=utf-8" })), c = new Image();
			c.onload = () => {
				let e = document.createElement("canvas");
				e.width = Math.round(r.w * o), e.height = Math.round(r.h * o);
				let t = e.getContext("2d");
				t.setTransform(o, 0, 0, o, 0, 0), t.drawImage(c, 0, 0), URL.revokeObjectURL(s);
				try {
					e.toBlob((e) => {
						e && Pi(e, "org-chart.png"), n(!!e);
					}, "image/png");
				} catch {
					n(!1);
				}
			}, c.onerror = () => {
				URL.revokeObjectURL(s), n(!1);
			}, c.src = s;
		}));
	}
	function Mi(e) {
		e ||= {};
		let t = +e.scale > 0 ? +e.scale : 2, n = typeof e.quality == "number" ? Math.min(1, Math.max(.3, e.quality)) : .82, r = +e.maxSide > 0 ? +e.maxSide : 4e3, i = e.as === "dataURL" || e.as === "dataurl", a = e.filename || "org-chart.webp";
		return ki().then((o) => new Promise((s) => {
			let c = Ei(40), l = 2e8, u = Math.min(t, r / c.w, r / c.h);
			c.w * u * c.h * u > l && (u = Math.sqrt(l / (c.w * c.h))), u = Math.max(.05, u);
			let ee = URL.createObjectURL(new Blob([Di(!0, o)], { type: "image/svg+xml;charset=utf-8" })), d = new Image();
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
						t && e.download && Pi(t, a), s(t || null);
					}, "image/webp", n);
				} catch {
					s(null);
				}
			}, d.onerror = () => {
				URL.revokeObjectURL(ee), s(null);
			}, d.src = ee;
		}));
	}
	function Ni() {
		return ki().then((e) => {
			let t = window.open("", "_blank");
			return t ? (t.document.open(), t.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + Di(!1, e) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), t.document.close(), !0) : !1;
		});
	}
	function Pi(e, t) {
		let n = URL.createObjectURL(e), r = document.createElement("a");
		r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), URL.revokeObjectURL(n);
	}
	function Fi(e, t, n) {
		let r = !(n && n.resetEdits);
		m = (e || []).map(i), h = u(m), r || (g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.create(null)), p.selectedNodeId = null, p.selectedEdgeId = null, p.selectedFamilyId = null, Me = /* @__PURE__ */ new Set(), vr();
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		t && (t.subtreeMode && (p.subtreeMode = t.subtreeMode), t.orientation && (p.orientation = be(t.orientation)), t.manualOffsets && (g = t.manualOffsets), t.edgeWaypoints && (_ = t.edgeWaypoints), t.edgeAnchors && (v = t.edgeAnchors), t.familyRouteOverrides && (y = t.familyRouteOverrides), t.nodeOverrides && (b = t.nodeOverrides), typeof t.editMode == "boolean" && (p.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (S = t.settings.themeRules.map(se))), r && Ar(), hr(), $();
		let a = V("set-nodes");
		return f.fitOnInit && a.then((e) => {
			e && Zt();
		}), a;
	}
	function Ii(t) {
		let { nodes: n, meta: r } = e(t);
		return Fi(n, r), n.length;
	}
	function Li(e) {
		let t = be(e);
		p.orientation = t, g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), U(), Gn(), $();
		let n = V("orientation");
		return n.then((e) => {
			e && en();
		}), j("orientation-change", { orientation: t }), Y(), n;
	}
	function Ri(e) {
		p.subtreeMode = e, g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), U(), Gn(), $();
		let t = V("subtree-mode");
		return t.then((e) => {
			e && en();
		}), j("subtree-mode-change", { subtreeMode: e }), Y(), t;
	}
	function zi(e, t) {
		e != null && (p.spacingX = e), t != null && (p.spacingY = t);
		let n = V("spacing");
		return j("settings-change", G()), Y("spacing"), n;
	}
	function Bi(e, t) {
		e in p ? (p[e] = t, e === "showGrid" && Xt(), e === "alignGrid" && (g = Object.create(null), V("align-grid")), $(), X(), [
			"showGrid",
			"snapGrid",
			"alignGrid",
			"gridSize"
		].includes(e) && j("settings-change", G())) : (f[e] = t, (e === "targetAspect" || e === "targetSize") && (p.subtreeMode === "AutoSmart" || p.subtreeMode === "GridSmart" || p.subtreeMode === "Auto") && V("target-size").then((e) => {
			e && en();
		}));
	}
	function Vi(e) {
		return Bi("showGrid", !!e), p.showGrid;
	}
	function Hi(e) {
		return Bi("snapGrid", !!e), p.snapGrid;
	}
	function Ui(e) {
		return Bi("alignGrid", !!e), p.alignGrid;
	}
	function Wi(e) {
		return Vi(e ?? !p.showGrid);
	}
	function Gi(e) {
		return p.autoEdgeSide = e == null ? !p.autoEdgeSide : !!e, U(), V("auto-edge-side"), z.classList.contains("loc-open") && Yr(), X(), j("settings-change", G()), p.autoEdgeSide;
	}
	function Ki(e) {
		p.showImages = e == null ? !p.showImages : !!e;
		for (let e in T) T[e].remove(), delete T[e];
		return kt(), $(), X(), j("settings-change", G()), p.showImages;
	}
	function qi() {
		let e = Dt("relayout", { preserveManual: !0 });
		return U(), Gn(), e.then((e) => {
			e && en();
		}), j("relayout", { forced: !1 }), Y(), e;
	}
	function Ji() {
		g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), U(), Gn();
		let e = V("force-relayout");
		return e.then((e) => {
			e && en();
		}), j("relayout", { forced: !0 }), Y(), e;
	}
	function Yi() {
		on(), vr();
		let e = Ji();
		return e.then((e) => {
			e && Zt();
		}), e;
	}
	function Xi() {
		return document.fullscreenElement || document.webkitFullscreenElement || null;
	}
	function Zi() {
		return Xi() === N;
	}
	function Qi() {
		let e = N.requestFullscreen || N.webkitRequestFullscreen;
		if (e) try {
			let t = e.call(N);
			t && t.catch && t.catch(() => {});
		} catch {}
	}
	function $i() {
		let e = document.exitFullscreen || document.webkitExitFullscreen;
		if (e && Xi()) try {
			e.call(document);
		} catch {}
	}
	function ea(e) {
		let t = e == null ? !Zi() : !!e;
		return t ? Qi() : $i(), t;
	}
	function ta() {
		let e = Zi();
		N.classList.toggle("loc-fullscreen", e), it && (it.title = e ? "Exit fullscreen" : "Fullscreen"), $(), Zt(), j("fullscreen-change", { fullscreen: e });
	}
	function na(e) {
		if (!Ae) return;
		let t = Rn(e.clientX, e.clientY), n = o(ht()) ? t.y : t.x, r = Math.max(1, p.gridSize), i = Math.round((Ae.baseOffset + n - Ae.startCross) / r) * r;
		y[Ae.parentId]?.trunkOffset !== i && (y[Ae.parentId] = { trunkOffset: i }, Ae.changed = !0, j("family-route-change", {
			parentId: Ae.parentId,
			trunkOffset: i,
			pending: !0
		}));
	}
	function ra() {
		let e = Ae;
		Ae = null, Q("pointermove", na), Q("pointerup", ra), e?.changed && (V("family-route"), X(), Y(), j("family-route-change", {
			parentId: e.parentId,
			trunkOffset: y[e.parentId]?.trunkOffset,
			pending: !1
		}));
	}
	M($e, "pointerdown", (e) => {
		let t = e.target.closest(".loc-node");
		t && dn(e, t.dataset.id);
	}), M($e, "click", (e) => {
		let t = e.target.closest("[data-role=\"toggle\"]");
		if (t && !f.readonly) {
			rn(t.closest(".loc-node").dataset.id);
			return;
		}
		let n = e.target.closest(".loc-node");
		if (n) {
			if (Ne === String(n.dataset.id)) {
				cn(), e.preventDefault(), e.stopPropagation();
				return;
			}
			j("node-click", {
				id: n.dataset.id,
				node: h[n.dataset.id]
			});
		}
	}), M(Ze, "pointerdown", (e) => {
		let t = e.target.closest("path");
		t && (e.stopPropagation(), Un(t.dataset.edge));
	}), M(Qe, "pointerdown", (e) => {
		let t = e.target.closest("path");
		if (!t) return;
		e.stopPropagation(), e.preventDefault(), sa();
		let n = String(t.dataset.family);
		if (Wn(n), f.readonly || !p.editMode) return;
		let r = De.find((e) => String(e.parentId) === n) || Ee.find((e) => String(e.parentId) === n), i = w[n];
		if (!r?.trunk || !i) return;
		let a = Rn(e.clientX, e.clientY), s = o(ht());
		Ae = {
			parentId: n,
			startCross: s ? a.y : a.x,
			baseOffset: (s ? r.trunk.a.y : r.trunk.a.x) - (s ? i.cy : i.cx),
			changed: !1
		}, Z("pointermove", na), Z("pointerup", ra);
	}), M(Ze, "dblclick", (e) => {
		if (f.readonly || !p.editMode) return;
		let t = e.target.closest("path");
		if (!t) return;
		let n = t.dataset.edge;
		Un(n);
		let r = Bn(n);
		if (!r) return;
		let i = zn(Rn(e.clientX, e.clientY));
		Vn(n).splice(pr(r, i), 0, i), qt(n), Xn(), X(), Y();
	}), M(L, "pointerdown", (e) => {
		if (f.readonly || !p.editMode) return;
		let t = e.target, n = p.selectedEdgeId;
		if (!n) return;
		if (t.dataset.ep) {
			e.stopPropagation(), e.preventDefault(), O = {
				id: n,
				kind: "ep",
				which: t.dataset.ep
			}, Z("pointermove", rr), Z("pointerup", ir);
			return;
		}
		let r;
		if (t.dataset.wp != null) r = +t.dataset.wp;
		else if (t.dataset.add != null) {
			let i = +t.dataset.add;
			Vn(n).splice(i, 0, zn(Rn(e.clientX, e.clientY))), r = i, qt(n);
		} else return;
		e.stopPropagation(), e.preventDefault(), O = {
			id: n,
			idx: r
		}, Z("pointermove", ia), Z("pointerup", aa);
	}), M(L, "dblclick", (e) => {
		let t = e.target;
		if (t.dataset.ep === "parent") {
			or(p.selectedEdgeId);
			return;
		}
		if (t.dataset.wp == null) return;
		let n = p.selectedEdgeId, r = _[n];
		r && (r.splice(+t.dataset.wp, 1), r.length || delete _[n], qt(n), Xn(), X(), Y());
	});
	function ia(e) {
		if (!O) return;
		let t = _[O.id];
		t && (t[O.idx] = hn(O.id, zn(Rn(e.clientX, e.clientY))), qt(O.id), Xn());
	}
	function aa() {
		O = null, _n(), Q("pointermove", ia), Q("pointerup", aa), X(), Y();
	}
	M(dt, "click", (e) => {
		e.target.closest("[data-role=\"legend-close\"]") && Lr(!1);
	}), M(R, "click", (e) => {
		if (e.target.closest("[data-role=\"panel-close\"]")) {
			vr();
			return;
		}
		if (e.target.closest("[data-role=\"add-child\"]")) {
			Or(p.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"detach\"]")) {
			or(p.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"attach\"]")) {
			let e = p.selectedNodeId;
			vr(), lr(e);
			return;
		}
		if (e.target.closest("[data-role=\"del-node\"]")) {
			kr(p.selectedNodeId);
			return;
		}
		let t = e.target.closest("[data-uidx]");
		if (t) {
			let e = t.closest("[data-role=\"user-results\"]"), n = e && e._users && e._users[+t.dataset.uidx];
			n && wr(n);
			return;
		}
	}), M(ot, "input", (e) => {
		if (!p.editMode) return;
		let t = e.target.closest("[data-field]");
		if (!t) return;
		let n = p.selectedNodeId;
		if (!n) return;
		let r = t.dataset.field, i = t.value;
		if (r === "type") {
			Er(n, { type: i }), yr();
			return;
		}
		if (r !== "width" && r !== "height") {
			if (r === "photo_url") {
				let e = h[n];
				Er(n, { data: Object.assign({}, e.data, { photo_url: i || null }) });
				return;
			}
			if (r === "layoutMode") {
				Er(n, { layoutMode: i || null });
				return;
			}
			Er(n, { [r]: i }), r === "personName" && Sr(i);
		}
	});
	function oa(e) {
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
		e.value = a, Number(n[r]) !== a && Er(t, { [r]: a });
	}
	M(ot, "change", (e) => oa(e.target.closest("[data-field]"))), M(ot, "keydown", (e) => {
		let t = e.target.closest("[data-field=\"width\"], [data-field=\"height\"]");
		if (t && (e.key === "Enter" && (e.preventDefault(), oa(t), t.blur()), e.key === "Escape")) {
			let e = p.selectedNodeId && h[p.selectedNodeId];
			e && (t.value = e[t.dataset.field]), t.blur();
		}
	}), M(z, "click", (e) => {
		if (e.target.closest("[data-role=\"settings-close\"]")) {
			Ur(!1);
			return;
		}
		if (e.target.closest("[data-role=\"reset-settings\"]")) {
			Wr();
			return;
		}
		if (e.target.closest("[data-role=\"preset-save\"]")) {
			let e = (ut.querySelector("[data-role=\"preset-name\"]") || {}).value || "", t = !!(ut.querySelector("[data-role=\"preset-full\"]") || {}).checked;
			e.trim() && yi(e, { full: t });
			return;
		}
		let t = e.target.closest("[data-role=\"preset-apply\"]");
		if (t) {
			bi(t.dataset.name);
			return;
		}
		let n = e.target.closest("[data-role=\"preset-del\"]");
		if (n) {
			xi(n.dataset.name);
			return;
		}
		if (e.target.closest("[data-role=\"add-rule\"]")) {
			S.push(se({
				field: "type",
				value: "",
				style: {}
			})), Yr(), Pr(), X(), j("settings-change", G());
			return;
		}
		let r = e.target.closest("[data-rk=\"remove\"]");
		r && (S.splice(+r.dataset.rule, 1), Yr(), Pr(), X(), j("settings-change", G()));
	}), M(ut, "input", (e) => {
		let t = e.target;
		if (t.dataset.set != null) {
			let e = t.dataset.set, n = parseFloat(t.value), r = ut.querySelector(`[data-rangelabel="${e}"]`);
			r && (r.textContent = n);
			return;
		}
		if (t.dataset.setToggle === "showImages") {
			Ki(t.checked);
			return;
		}
		if (t.dataset.setToggle === "autoEdgeSide") {
			Gi(t.checked);
			return;
		}
		if (t.dataset.setToggle === "photoContain") {
			Mt({ contain: t.checked });
			return;
		}
		if (t.dataset.rule != null) {
			let e = +t.dataset.rule, n = t.dataset.rk, r = S[e];
			if (!r) return;
			if (n === "enabled") r.enabled = t.checked;
			else if (n === "field") r.field = t.value;
			else if (n === "value") r.value = t.value;
			else if (n === "bg" || n === "text" || n === "border") Xr(e, n) && (r.style[n] = t.value);
			else if (/-on$/.test(n)) {
				let i = n.replace("-on", "");
				r.style[i] = t.checked ? Zr(e, i) || "#e0524d" : "";
			}
			Pr(), j("settings-change", G()), X();
		}
	}), M(ut, "change", (e) => {
		let t = e.target;
		if (t.dataset.set == null) return;
		let n = t.dataset.set, r = parseFloat(t.value);
		if (Number.isFinite(r)) {
			if (n === "cardWidth") {
				Mt({ width: r });
				return;
			}
			if (n === "photoHeight") {
				Mt({ photoHeight: r });
				return;
			}
			Number(p[n]) !== r && (p[n] = r, V("settings-" + n), j("settings-change", G()), X());
		}
	}), M(F, "pointerdown", (e) => {
		if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn") || e.target.closest(".loc-legend")) return;
		sa();
		let t = () => {
			Tn(), p.selectedEdgeId && U(), p.selectedFamilyId && Gn(), kn(), cr && ur(), vr();
		};
		if (e.altKey) {
			Fn(e);
			return;
		}
		if (e.ctrlKey || e.metaKey) {
			En(e);
			return;
		}
		if (!f.enablePan) {
			t();
			return;
		}
		let n = e.clientX, r = e.clientY, i = p.panX, a = p.panY, o = !1;
		F.classList.add("loc-panning");
		let s = (e) => {
			!o && Math.abs(e.clientX - n) + Math.abs(e.clientY - r) > 3 && (o = !0), p.panX = i + (e.clientX - n), p.panY = a + (e.clientY - r), Jt();
		}, c = () => {
			F.classList.remove("loc-panning"), Q("pointermove", s), Q("pointerup", c), o || t();
		};
		Z("pointermove", s), Z("pointerup", c);
	}), M(F, "wheel", (e) => {
		if (!f.enableZoom || e.target.closest && (e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-legend"))) return;
		e.preventDefault();
		let t = F.getBoundingClientRect(), n = e.clientX - t.left, r = e.clientY - t.top, i = e.deltaY < 0 ? 1.1 : 1 / 1.1, a = Math.min(Ce, Math.max(.15, p.zoom * i));
		p.panX = n - (n - p.panX) * (a / p.zoom), p.panY = r - (r - p.panY) * (a / p.zoom), p.zoom = a, Jt();
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
	function sa() {
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
				e.preventDefault(), Kn();
				return;
			}
			if (p.selectedFamilyId && n === "escape") {
				e.preventDefault(), Gn();
				return;
			}
			if (H.size && (n === "delete" || n === "backspace")) {
				e.preventDefault(), jn();
				return;
			}
			if (n === "escape" && H.size) {
				e.preventDefault(), kn();
				return;
			}
			return;
		}
		n === "z" && !e.shiftKey ? (e.preventDefault(), si()) : (n === "z" && e.shiftKey || n === "y") && (e.preventDefault(), ci());
	});
	function ca() {
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
				if (t.dataset.mode) Ri(t.dataset.mode);
				else if (t.dataset.orient) Li(t.dataset.orient);
				else if (t.dataset.flag) p[t.dataset.flag] = !p[t.dataset.flag], t.dataset.flag === "showGrid" ? Xt() : t.dataset.flag === "alignGrid" && (g = Object.create(null), V("align-grid")), $(), X();
				else switch (t.dataset.act) {
					case "undo":
						si();
						break;
					case "redo":
						ci();
						break;
					case "expand":
						tn();
						break;
					case "collapse":
						nn();
						break;
					case "fit":
						Zt();
						break;
					case "relayout":
						qi();
						break;
					case "reset":
						Yi();
						break;
					case "fullscreen":
						ea();
						break;
					case "edit":
						gr(!p.editMode);
						break;
					case "images":
						Ki();
						break;
					case "legend":
						Rr();
						break;
					case "settings":
						Ur();
						break;
					case "png":
						ji(3);
						break;
					case "svg":
						Ai();
						break;
					case "pdf":
						Ni();
						break;
					case "json":
						Si(!0);
						break;
				}
			}
		}), n.addEventListener("input", (e) => {
			let t = e.target.closest("[data-role=\"search\"]");
			t && an(t.value);
		}), n;
		function i(e, t) {
			return `<div class="loc-group">${e ? `<span class="loc-label">${e}</span>` : ""}${t}</div>`;
		}
		function a(e, t, n) {
			return `<button data-${e}="${t}">${n}</button>`;
		}
	}
	function $() {
		P && (P.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === p.subtreeMode)), P.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === p.orientation)), P.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!p[e.dataset.flag])), P.querySelectorAll("button[data-act=\"edit\"]").forEach((e) => e.classList.toggle("loc-active", p.editMode)), P.querySelectorAll("button[data-act=\"images\"]").forEach((e) => e.classList.toggle("loc-active", p.showImages)), P.querySelectorAll("button[data-act=\"legend\"]").forEach((e) => e.classList.toggle("loc-active", p.showLegend)), P.querySelectorAll("button[data-act=\"fullscreen\"]").forEach((e) => e.classList.toggle("loc-active", Zi())), P.querySelectorAll("button[data-act=\"undo\"]").forEach((e) => {
			e.disabled = !ai();
		}), P.querySelectorAll("button[data-act=\"redo\"]").forEach((e) => {
			e.disabled = !oi();
		}));
	}
	if (M(document, "fullscreenchange", ta), M(document, "webkitfullscreenchange", ta), ui(), $(), Xt(), Ir(), hr(), Ve) {
		let e = V("initial");
		f.fitOnInit && e.then((e) => {
			e && Zt();
		});
	} else gt(), _t(), Be = Promise.resolve(!0), f.fitOnInit && Zt();
	ii(), typeof ResizeObserver < "u" && !f.targetSize && f.reflowOnResize && (Le = F.clientWidth > 0 && F.clientHeight > 0 ? F.clientWidth / F.clientHeight : 0, Fe = new ResizeObserver(() => {
		if (p.subtreeMode !== "AutoSmart" && p.subtreeMode !== "GridSmart" && p.subtreeMode !== "Auto" || Object.keys(g).length || F.clientWidth <= 0 || F.clientHeight <= 0) return;
		let e = F.clientWidth / F.clientHeight;
		Le && Math.abs(Math.log(e / Le)) < .08 || (Le = e, Ie && cancelAnimationFrame(Ie), Ie = requestAnimationFrame(() => {
			Ie = 0, V("resize").then((e) => {
				e && Zt();
			});
		}));
	}), Fe.observe(F));
	let la = !1;
	function ua() {
		if (!la) {
			la = !0, Ct("destroyed"), He.forEach(({ target: e, type: t, fn: n, optsL: r }) => e.removeEventListener(t, n, r)), He.length = 0, je && cancelAnimationFrame(je), cn(), Ie && cancelAnimationFrame(Ie), Fe && Fe.disconnect(), br && clearTimeout(br), N.remove();
			for (let e in T) delete T[e];
			for (let e in E) delete E[e];
			for (let e in D) delete D[e];
		}
	}
	let da = {
		root: N,
		setNodes: Fi,
		loadJSON: Ii,
		setOrientation: Li,
		setSubtreeMode: Ri,
		setSpacing: zi,
		setOption: Bi,
		setShowGrid: Vi,
		setSnapToGrid: Hi,
		setAlignToGrid: Ui,
		toggleGrid: Wi,
		fitToScreen: Zt,
		relayout: qi,
		forceRelayout: Ji,
		resetView: Yi,
		expandAll: tn,
		collapseAll: nn,
		toggleCollapse: rn,
		centerOnNode: Qt,
		search: an,
		clearSearch: on,
		exportJSON: Si,
		exportSVG: Ai,
		exportPNG: ji,
		exportWebP: Mi,
		exportPDF: Ni,
		buildSVG: Di,
		setEditMode: gr,
		isEditMode: () => p.editMode,
		setShowImages: Ki,
		isShowingImages: () => p.showImages,
		setShowLegend: Lr,
		toggleLegend: Rr,
		isShowingLegend: () => p.showLegend,
		getLegendBody: () => pt,
		setAutoEdgeSide: Gi,
		isAutoEdgeSide: () => p.autoEdgeSide,
		setPhotoHeight: (e) => Mt({ photoHeight: e }),
		setCardWidth: (e) => Mt({ width: e }),
		setCardSize: Mt,
		setPhotoContain: (e) => Mt({ contain: e !== !1 }),
		getSelection: () => [...x],
		setSelection: (e) => wn(Array.isArray(e) ? e : e ? [e] : []),
		clearSelection: () => {
			Tn(), xn();
		},
		getEdgeSelection: () => [...H],
		setEdgeSelection: An,
		clearEdgeSelection: kn,
		resetSelectedEdges: jn,
		getFamilyRouteSelection: () => p.selectedFamilyId,
		getFamilyNetworks: () => J(Ee),
		getFamilyRouteOverrides: () => J(y),
		setFamilyRouteOverride: qn,
		resetFamilyRoute: Kn,
		enterFullscreen: Qi,
		exitFullscreen: $i,
		toggleFullscreen: ea,
		isFullscreen: Zi,
		undo: si,
		redo: ci,
		canUndo: ai,
		canRedo: oi,
		updateNode: Er,
		addChild: Or,
		deleteNode: kr,
		reparentNode: ar,
		detachNode: or,
		attachNode: sr,
		beginAttach: lr,
		cancelAttach: ur,
		isAttaching: () => !!cr,
		openInspector: _r,
		closeInspector: vr,
		nodeScreenRect: Ln,
		getSettings: G,
		setSettings: Hr,
		toggleSettings: Ur,
		resetSettings: Wr,
		saveLayoutPreset: yi,
		loadLayoutPreset: bi,
		deleteLayoutPreset: xi,
		listLayoutPresets: _i,
		getLayoutPresets: vi,
		getLayout: hi,
		applyLayout: gi,
		getNodeHost: (e) => T[e] || null,
		getNodeSlotEl: (e) => T[e] ? T[e].querySelector(".loc-node-slot") : null,
		getInspectorBody: () => ot,
		getSettingsBody: () => ut,
		nodeThemeStyle: (e) => h[e] ? oe(h[e], S) : null,
		getState: () => ({
			...p,
			familyRouteOverrides: J(y)
		}),
		getNodes: () => m.map((e) => ({ ...e })),
		getPositioned: () => C,
		isLayoutBusy: () => ze,
		whenLayoutSettled: () => Be,
		cancelLayout: () => Ct("cancelled"),
		on: We,
		off: Ge,
		destroy: ua
	};
	return da;
}
//#endregion
export { Se as t };
