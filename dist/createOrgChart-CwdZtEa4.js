import { A as e, E as t, F as n, H as r, M as i, P as a, T as o, U as s, W as c, c as l, d as u, f as d, g as ee, i as te, j as ne, n as re, o as f, p as ie, q as ae, r as oe, s as se, t as ce, w as le, y as ue, z as de } from "./bounds-Cig4UHsX.js";
import { f as fe, h as pe, l as me, m as he, n as ge, o as _e, r as ve, s as ye, t as be, u as xe } from "./core-DpSEAd-z.js";
// src/vanilla/layoutTarget.js
function p(e) {
	let t = Number(e?.clientWidth), n = Number(e?.clientHeight);
	return t > 0 && n > 0 ? {
		width: t,
		height: n
	} : null;
}
function Se(e = {}, t = null) {
	return {
		targetAspect: e.targetAspect,
		targetSize: e.targetSize || (e.reflowOnResize ? p(t) : null)
	};
}
// src/core/layout.worker.js?worker
function Ce(e) {
	return new Worker("" + new URL("assets/layout.worker-_LMtlwCg.js", import.meta.url).href, { name: e?.name });
}
// src/vanilla/cloneLayoutValue.js
function we(e) {
	if (typeof structuredClone == "function") try {
		return structuredClone(e);
	} catch {}
	return JSON.parse(JSON.stringify(e));
}
// src/vanilla/createOrgChart.js
var Te = 140, Ee = "http://www.w3.org/2000/svg", De = 3e4, Oe = .72, m = 12, ke = /* @__PURE__ */ new Map();
function Ae(e, t) {
	for (ke.has(e) && ke.delete(e), ke.set(e, we(t)); ke.size > m;) ke.delete(ke.keys().next().value);
}
var je = {
	Top: "TopToBottom",
	Bottom: "BottomToTop",
	Left: "LeftToRight",
	Right: "RightToLeft"
};
function Me(e) {
	return je[e] || e;
}
var Ne = {
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
	photoHeight: s.height - 140,
	cardWidth: s.width,
	textHeight: 140,
	departmentWidth: de.width,
	departmentHeight: de.height,
	photoContain: c.fit === "contain",
	virtualPhotoFrame: ae,
	renderedImage: c,
	photoBackground: r,
	showImages: !0,
	userSearch: null,
	userToFields: null,
	fitOnLayoutChange: !0,
	fitOnInit: !0,
	targetAspect: 1.6,
	targetSize: null,
	reflowOnResize: !1,
	layoutWorker: !0,
	layoutTimeout: 6e4,
	layoutCache: !0,
	exportPhotoTimeout: 8e3,
	toolbar: !0,
	advancedLayoutControls: !1,
	persist: !1,
	storageKey: "local-org-chart.state"
};
function Pe(r, p = {}) {
	if (!r || !r.appendChild) throw Error("createOrgChart: first argument must be a DOM element.");
	let m = Object.assign({}, Ne, p), je = m.alignGrid == null ? m.subtreeMode === "GridSmart" : !!m.alignGrid;
	function Pe() {
		return +m.maxZoom > 1 ? +m.maxZoom : 4;
	}
	let h = {
		orientation: Me(m.orientation),
		subtreeMode: m.subtreeMode,
		spacingX: m.spacingX,
		spacingY: m.spacingY,
		zoom: 1,
		panX: 0,
		panY: 0,
		selectedNodeId: null,
		selectedEdgeId: null,
		selectedFamilyId: null,
		gridSize: m.gridSize,
		showGrid: m.showGrid,
		snapGrid: m.snapGrid,
		alignGrid: je,
		editMode: !!m.editMode && !m.readonly,
		showImages: m.showImages !== !1,
		showLegend: !!m.legend,
		autoEdgeSide: !!m.autoEdgeSide,
		photoHeight: +p.photoHeight || +(p.node && p.node.photoHeight) || s.height - 140,
		cardWidth: +p.cardWidth || +(p.node && p.node.width) || s.width,
		textHeight: +p.textHeight || +(p.node && p.node.textHeight) || 140,
		departmentWidth: +p.departmentWidth || +(p.departmentNode && p.departmentNode.width) || de.width,
		departmentHeight: +p.departmentHeight || +(p.departmentNode && p.departmentNode.height) || de.height,
		photoContain: p.photoContain == null ? !(p.renderedImage && p.renderedImage.fit && p.renderedImage.fit !== "contain") : p.photoContain !== !1,
		photoFrameWidth: +(p.virtualPhotoFrame && p.virtualPhotoFrame.width) || ae.width,
		photoFrameHeight: +(p.virtualPhotoFrame && p.virtualPhotoFrame.height) || ae.height,
		photoImageWidth: +(p.renderedImage && p.renderedImage.width) || c.width,
		photoImageHeight: +(p.renderedImage && p.renderedImage.height) || c.height,
		photoOffsetX: Number.isFinite(+(p.renderedImage && p.renderedImage.offsetX)) ? +(p.renderedImage && p.renderedImage.offsetX) : c.offsetX,
		photoOffsetY: Number.isFinite(+(p.renderedImage && p.renderedImage.offsetY)) ? +(p.renderedImage && p.renderedImage.offsetY) : c.offsetY,
		photoBackground: p.photoBackground || "#004264"
	}, Fe = Object.create(null), g = na(m.nodes || [], "nodes"), _ = a(g), v = Object.create(null), y = Object.create(null), b = Object.create(null), x = m.familyRouteOverrides ? ta({ familyRouteOverrides: m.familyRouteOverrides }, "familyRouteOverrides option").familyRouteOverrides : Object.create(null), S = Object.create(null), C = /* @__PURE__ */ new Set(), Ie = !1, Le = [];
	{
		let e = m.settings && m.settings.themeRules || m.themeRules;
		e && Zi(ea({ themeRules: e }, "themeRules option")), m.settings && Zi(ea(m.settings, "settings option"));
	}
	let Re = Xi(), ze = 0, w = [], T = Object.create(null), Be = [], Ve = [], He = null, E = Object.create(null), D = Object.create(null), O = Object.create(null), Ue = Object.create(null), k = null, We = null, A = null, Ge = 0, Ke = /* @__PURE__ */ new Set(), qe = null, Je = 0, Ye = null, Xe = 0, Ze = 0, Qe = 0, j = null, $e = !1, et = Promise.resolve(!0), tt = m.layoutWorker !== !1 && typeof Worker < "u", nt = null, rt = [], it = Object.create(null), at = !1;
	function ot(e, t) {
		return (it[e] || (it[e] = [])).push(t), qo;
	}
	function st(e, t) {
		return it[e] && (it[e] = it[e].filter((e) => e !== t)), qo;
	}
	function M(e, t) {
		at || (it[e] || []).forEach((e) => {
			try {
				e(t);
			} catch {}
		});
	}
	function N(e, t, n, r) {
		e.addEventListener(t, n, r), rt.push({
			target: e,
			type: t,
			fn: n,
			optsL: r
		});
	}
	let P = document.createElement("div");
	P.className = "loc-root", P.tabIndex = -1;
	let F = m.toolbar ? Uo() : null;
	F && P.appendChild(F);
	let I = B("div", "loc-canvas"), ct = B("div", "loc-content"), lt = B("div", "loc-grid"), ut = document.createElementNS(Ee, "svg");
	ut.setAttribute("class", "loc-connectors");
	let dt = document.createElementNS(Ee, "g");
	dt.setAttribute("class", "loc-visible-edges");
	let ft = document.createElementNS(Ee, "g");
	ft.setAttribute("class", "loc-logical-edges");
	let pt = document.createElementNS(Ee, "g");
	pt.setAttribute("class", "loc-edgehits");
	let mt = document.createElementNS(Ee, "g");
	mt.setAttribute("class", "loc-familyhits"), ut.appendChild(dt), ut.appendChild(ft), ut.appendChild(pt), ut.appendChild(mt);
	let ht = B("div", "loc-nodes");
	ht.setAttribute("role", "tree"), ht.setAttribute("aria-label", m.ariaLabel || "Organization chart");
	let gt = document.createElementNS(Ee, "svg");
	gt.setAttribute("class", "loc-overlay");
	let L = document.createElementNS(Ee, "g");
	L.setAttribute("class", "loc-edgehandles");
	let _t = document.createElementNS(Ee, "g");
	_t.setAttribute("class", "loc-family-selection");
	let vt = document.createElementNS(Ee, "g");
	vt.setAttribute("class", "loc-aligns"), gt.appendChild(vt), gt.appendChild(_t), gt.appendChild(L);
	let yt = B("div", "loc-zoomreadout");
	yt.textContent = "100%";
	let bt = B("div", "loc-layout-status");
	bt.hidden = !0, bt.setAttribute("role", "status"), bt.setAttribute("aria-live", "polite"), bt.innerHTML = "<span class=\"loc-layout-spinner\" aria-hidden=\"true\"></span><span>Arranging chart&hellip;</span>", ct.appendChild(lt), ct.appendChild(ut), ct.appendChild(ht), ct.appendChild(gt), I.appendChild(ct), I.appendChild(yt), I.appendChild(bt);
	let xt = null;
	m.fullscreenControl && (xt = B("button", "loc-fsbtn"), xt.type = "button", xt.title = "Fullscreen", xt.setAttribute("aria-label", "Toggle fullscreen"), xt.innerHTML = "⛶", N(xt, "click", (e) => {
		e.stopPropagation(), co();
	}), I.appendChild(xt)), P.appendChild(I);
	let R = B("div", "loc-panel");
	R.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Node</span><button type=\"button\" class=\"loc-panel-close\" title=\"Close\" aria-label=\"Close details\" data-role=\"panel-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"panel-body\"></div><div class=\"loc-panel-foot\" data-role=\"panel-foot\"></div>";
	let St = jt(m.inspectorTarget) || I;
	St.appendChild(R), St !== I && R.classList.add("loc-panel-external");
	let Ct = R.querySelector("[data-role=\"panel-body\"]"), wt = R.querySelector("[data-role=\"panel-foot\"]"), Tt = R.querySelector(".loc-panel-title"), z = B("div", "loc-settings");
	z.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Settings</span><button type=\"button\" class=\"loc-panel-close\" title=\"Close\" aria-label=\"Close settings\" data-role=\"settings-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"settings-body\"></div>";
	let Et = jt(m.settingsTarget) || I;
	Et.appendChild(z), Et !== I && z.classList.add("loc-panel-external");
	let Dt = z.querySelector("[data-role=\"settings-body\"]"), Ot = B("div", "loc-legend");
	Ot.innerHTML = "<div class=\"loc-legend-head\"><span class=\"loc-legend-title\">Legend</span><button type=\"button\" class=\"loc-legend-close\" title=\"Hide legend\" aria-label=\"Hide legend\" data-role=\"legend-close\">✕</button></div><div class=\"loc-legend-body\" data-role=\"legend-body\"></div>";
	let kt = jt(m.legendTarget) || I;
	kt.appendChild(Ot), kt !== I && Ot.classList.add("loc-legend-external");
	let At = Ot.querySelector("[data-role=\"legend-body\"]");
	$t(), en(), r.appendChild(P);
	function B(e, t) {
		let n = document.createElement(e);
		return t && (n.className = t), n;
	}
	function jt(e) {
		if (!e) return null;
		let t = typeof e == "string" ? document.querySelector(e) : e;
		return t && t.appendChild ? t : null;
	}
	function Mt() {
		let e = Se(m, I);
		return ee({
			orientation: h.orientation,
			subtreeMode: h.subtreeMode,
			spacingX: h.spacingX,
			spacingY: h.spacingY,
			gridSize: h.gridSize,
			alignGrid: h.alignGrid,
			autoEdgeSide: h.autoEdgeSide,
			familyRouteOverrides: x,
			targetAspect: e.targetAspect,
			targetSize: e.targetSize
		});
	}
	function Nt() {
		let e = It(g, Mt()), t = ie(e.nodes, e.options);
		zt(t), m.layoutCache !== !1 && Ae(Lt(e), Ft(t));
	}
	function Pt() {
		P.classList.toggle("loc-horizontal", u(Mt())), Sn(), vn(), Qt(), xn(), Un(), h.showLegend && ji(), q(), M("layout-change", {
			positioned: w,
			familyNetworks: Be,
			mode: h.subtreeMode,
			orientation: h.orientation
		});
	}
	function Ft(e) {
		return {
			positioned: e.positioned,
			bounds: e.bounds,
			framingBounds: e.framingBounds,
			familyNetworks: e.familyNetworks || [],
			cfg: e.cfg
		};
	}
	function It(e, t) {
		let { familyRouteOverrides: n, ...r } = t;
		delete r.autoEdgeSide;
		let i = n && typeof n == "object" ? Object.keys(n).sort().map((e) => [e, n[e]]) : [];
		return r.familyRouteOverrides = i.length ? Object.fromEntries(i) : null, {
			nodes: e.map(d),
			options: r
		};
	}
	function Lt(e) {
		return JSON.stringify(e);
	}
	function Rt() {
		let e = Object.create(null);
		if (Ie) return e;
		for (let t of Object.keys(v)) {
			let n = T[t];
			n && (e[t] = f(n, v));
		}
		return e;
	}
	function zt(e, t) {
		let n = we(Ft(e)), r = Rt(), i = Object.assign(Object.create(null), t || {}, r);
		for (let e of n.positioned || []) {
			let t = _[String(e.node.id)];
			t && (e.node = Object.assign({}, e.node, we(t)));
		}
		w = n.positioned || [], T = Object.create(null);
		for (let e of w) T[String(e.node.id)] = e;
		Be = n.familyNetworks || [], He = n.framingBounds || n.bounds || null;
		for (let e of Object.keys(i)) {
			let t = T[e];
			if (!t) {
				_[e] || delete v[e];
				continue;
			}
			let n = i[e].x - t.cx, r = i[e].y - t.cy;
			Math.abs(n) > .5 || Math.abs(r) > .5 ? v[e] = {
				dx: n,
				dy: r
			} : delete v[e];
		}
		Ie = !1;
	}
	function Bt(e) {
		$e = !!e;
		let t = $e && w.length === 0;
		P.classList.toggle("loc-layout-busy", $e), P.classList.toggle("loc-layout-initial-busy", t), bt.hidden = !t, $e ? P.setAttribute("aria-busy", "true") : P.removeAttribute("aria-busy");
	}
	function Vt(e = "superseded", t = !1) {
		let n = j;
		return n ? (j = null, n.worker && Gt(), n.timer && clearTimeout(n.timer), n.watchdog && clearTimeout(n.watchdog), n.resolve(!1), M("layout-cancel", {
			id: n.id,
			reason: n.reason,
			cause: e
		}), t || Bt(!1), !0) : !1;
	}
	function Ht(e, t, n, r) {
		return !j || j.id !== e.id || e.id !== Qe ? !1 : (j = null, zt(t, e.pins), Pt(), Bt(!1), M("layout-complete", {
			id: e.id,
			reason: e.reason,
			durationMs: Math.round(n || 0),
			cached: !!r
		}), e.resolve(!0), sa(), !0);
	}
	function Ut(e, t) {
		j && j.id === e.id && (j = null, Bt(!1), sa(), M("layout-error", {
			id: e.id,
			reason: e.reason,
			error: t instanceof Error ? t : Error(t?.message || String(t))
		}), e.resolve(!1));
	}
	function Wt(e, t, n) {
		n && (tt = !1, M("layout-error", {
			id: e.id,
			reason: e.reason,
			error: n,
			fallback: !0
		})), e.timer = setTimeout(() => {
			if (e.timer = 0, !j || j.id !== e.id) return;
			let n = performance.now();
			try {
				let r = ie(t.nodes, t.options);
				m.layoutCache !== !1 && Ae(e.signature, Ft(r)), Ht(e, r, performance.now() - n, !1);
			} catch (t) {
				Ut(e, t);
			}
		}, 0);
	}
	function Gt() {
		nt && nt.terminate(), nt = null;
	}
	function Kt(e, t) {
		let n = Error(e?.message || t);
		return e?.name && (n.name = e.name), n;
	}
	function qt(e, t) {
		let n = j;
		return !n || n.worker !== e || t !== void 0 && t !== n.id ? null : (clearTimeout(n.watchdog), n.worker = null, n);
	}
	function Jt() {
		if (nt) return nt;
		let e = new Ce();
		return e.addEventListener("message", (t) => {
			let n = t.data || {}, r = qt(e, n.id);
			r && (n.ok ? (m.layoutCache !== !1 && Ae(r.signature, n.result), Ht(r, n.result, n.durationMs, !1)) : Ut(r, Kt(n.error, "Layout worker failed.")));
		}), e.addEventListener("messageerror", () => {
			let t = qt(e);
			t && Ut(t, /* @__PURE__ */ Error("Layout worker sent a result that could not be read."));
		}), e.addEventListener("error", (t) => {
			nt === e && (nt = null), e.terminate();
			let n = qt(e);
			n && Wt(n, n.payload, Error(t.message || "Layout worker failed to load."));
		}), nt = e, e;
	}
	function Yt(e = "refresh", t = {}) {
		Vt("superseded", !0);
		let r = ++Qe, a = i(g);
		if (a) return Xt(r, e, n(a));
		let o = Mt(), s = Lt(It(g, o)), c = t.pins || (t.preserveManual ? Rt() : null), l, u = new Promise((e) => {
			l = e;
		}), d = {
			id: r,
			reason: e,
			signature: s,
			pins: c,
			resolve: l,
			worker: null,
			timer: 0,
			watchdog: 0,
			payload: null
		};
		j = d, et = u, Bt(!0), M("layout-start", {
			id: r,
			reason: e
		});
		let ee = m.layoutCache !== !1 && ke.get(s);
		if (ee) return Promise.resolve().then(() => Ht(d, ee, 0, !0)), u;
		let te = JSON.parse(s);
		if (!tt) return Wt(d, te), u;
		try {
			let e = Jt();
			d.worker = e, d.payload = te;
			let t = Number(m.layoutTimeout) > 0 ? Number(m.layoutTimeout) : Ne.layoutTimeout;
			d.watchdog = setTimeout(() => {
				j === d && (d.worker = null, Gt(), Ut(d, /* @__PURE__ */ Error(`Layout worker did not answer within ${Math.round(t / 1e3)}s.`)));
			}, t), e.postMessage({
				id: r,
				nodes: te.nodes,
				options: te.options
			});
		} catch (e) {
			d.watchdog && clearTimeout(d.watchdog), d.worker = null, Gt(), Wt(d, te, e);
		}
		return u;
	}
	function V(e = "refresh", t) {
		return Yt(e, t);
	}
	function Xt(e, t, n) {
		w = [], T = Object.create(null), Be = [], Ve = [], He = null;
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		for (let e in O) O[e].remove(), delete O[e];
		return dt.innerHTML = "", L.innerHTML = "", _t.innerHTML = "", Bt(!1), et = Promise.resolve(!1), console.warn(`local-org-chart: ${n.message}`), Promise.resolve().then(() => {
			at || M("layout-error", {
				id: e,
				reason: t,
				error: n
			});
		}), sa(), et;
	}
	function Zt(e) {
		let t = Object.create(null);
		if (!Ie) for (let e of w) t[e.node.id] = f(e, v);
		return e(), Yt("structural-edit", { pins: t });
	}
	function Qt() {
		let e = Object.create(null), t = [];
		for (let n of w) {
			let r = n.node;
			e[r.id] = !0;
			let i = E[r.id];
			i || (i = an(r), E[r.id] = i, ht.appendChild(i)), i.style.width = r.width + "px", i.style.height = r.height + "px";
			let a = f(n, v);
			i.style.transform = `translate(${a.x - r.width / 2}px, ${a.y - r.height / 2}px)`, m.nodeSlots || (i.dataset.fitted || (t.push(i), i.dataset.fitted = "1"), wi(i, r)), i.classList.toggle("loc-selected", C.has(r.id)), i.classList.toggle("loc-primary", h.selectedNodeId === r.id && C.size > 1), dn(i, r);
		}
		for (let t in E) e[t] || (E[t].remove(), delete E[t]);
		un(t), Lo(), M("nodes-rendered", { ids: w.map((e) => e.node.id) });
	}
	function $t() {
		let e = Math.max(1, h.photoFrameWidth || ae.width), t = Math.max(1, h.photoFrameHeight || ae.height);
		P.style.setProperty("--loc-photo-h", (h.photoHeight || s.height - 140) + "px"), P.style.setProperty("--loc-photo-fit", h.photoContain ? "contain" : "cover"), P.style.setProperty("--loc-photo-image-w", (h.photoImageWidth / e * 100).toFixed(4) + "%"), P.style.setProperty("--loc-photo-image-h", (h.photoImageHeight / t * 100).toFixed(4) + "%"), P.style.setProperty("--loc-photo-offset-x", (h.photoOffsetX / e * 100).toFixed(4) + "%"), P.style.setProperty("--loc-photo-offset-y", (h.photoOffsetY / t * 100).toFixed(4) + "%"), P.style.setProperty("--loc-photo-bg", h.photoBackground || "#004264");
	}
	function en() {
		let e = Math.max(100, h.cardWidth || s.width), t = Math.max(60, (h.photoHeight || s.height - 140) + (h.textHeight || Te)), n = Math.max(100, h.departmentWidth || de.width), r = Math.max(50, h.departmentHeight || de.height);
		for (let i of g) {
			let a = Fe[i.id] || {}, o = S[i.id] && !S[i.id].__new ? S[i.id] : {}, s = i.type === "department";
			i.width = o.width || a.width || (s ? n : e), i.height = o.height || a.height || (s ? r : t);
		}
	}
	function tn(e) {
		e ||= {};
		let t = [
			h.cardWidth,
			h.photoHeight,
			h.textHeight,
			h.departmentWidth,
			h.departmentHeight
		].join("|"), n = [
			h.photoContain,
			h.photoFrameWidth,
			h.photoFrameHeight,
			h.photoImageWidth,
			h.photoImageHeight,
			h.photoOffsetX,
			h.photoOffsetY,
			h.photoBackground
		].join("|"), r = e.node || {}, i = e.departmentNode || {}, a = e.virtualPhotoFrame || {}, o = e.renderedImage || {}, s = Number.isFinite(e.width) ? e.width : Number.isFinite(e.cardWidth) ? e.cardWidth : r.width, c = Number.isFinite(e.photoHeight) ? e.photoHeight : r.photoHeight, l = Number.isFinite(e.textHeight) ? e.textHeight : r.textHeight;
		!Number.isFinite(l) && Number.isFinite(r.totalHeight) && Number.isFinite(c) && (l = r.totalHeight - c), Number.isFinite(s) && (h.cardWidth = Math.max(100, s)), Number.isFinite(c) && (h.photoHeight = Math.max(40, c)), Number.isFinite(l) && (h.textHeight = Math.max(40, l));
		let u = Number.isFinite(e.departmentWidth) ? e.departmentWidth : i.width, d = Number.isFinite(e.departmentHeight) ? e.departmentHeight : i.height;
		Number.isFinite(u) && (h.departmentWidth = Math.max(100, u)), Number.isFinite(d) && (h.departmentHeight = Math.max(50, d));
		let ee = Number.isFinite(e.photoFrameWidth) ? e.photoFrameWidth : a.width, te = Number.isFinite(e.photoFrameHeight) ? e.photoFrameHeight : a.height, ne = Number.isFinite(e.photoImageWidth) ? e.photoImageWidth : o.width, re = Number.isFinite(e.photoImageHeight) ? e.photoImageHeight : o.height, f = Number.isFinite(e.photoOffsetX) ? e.photoOffsetX : o.offsetX, ie = Number.isFinite(e.photoOffsetY) ? e.photoOffsetY : o.offsetY;
		return Number.isFinite(ee) && (h.photoFrameWidth = Math.max(1, ee)), Number.isFinite(te) && (h.photoFrameHeight = Math.max(1, te)), Number.isFinite(ne) && (h.photoImageWidth = Math.max(1, ne)), Number.isFinite(re) && (h.photoImageHeight = Math.max(1, re)), Number.isFinite(f) && (h.photoOffsetX = f), Number.isFinite(ie) && (h.photoOffsetY = ie), typeof e.contain == "boolean" ? h.photoContain = e.contain : typeof e.photoContain == "boolean" ? h.photoContain = e.photoContain : (o.fit === "contain" || o.fit === "cover") && (h.photoContain = o.fit === "contain"), _e(e.photoBackground) && (h.photoBackground = e.photoBackground.trim()), {
			sizeChanged: t !== [
				h.cardWidth,
				h.photoHeight,
				h.textHeight,
				h.departmentWidth,
				h.departmentHeight
			].join("|"),
			renderChanged: n !== [
				h.photoContain,
				h.photoFrameWidth,
				h.photoFrameHeight,
				h.photoImageWidth,
				h.photoImageHeight,
				h.photoOffsetX,
				h.photoOffsetY,
				h.photoBackground
			].join("|")
		};
	}
	function nn(e) {
		let t = tn(e);
		if ($t(), t.sizeChanged) {
			en();
			for (let e in E) delete E[e].dataset.fitted;
			Qt(), V("card-size");
		}
		q(), M("settings-change", Pi());
	}
	function rn(e) {
		e.textContent = "", e.innerHTML = "<svg class=\"loc-usericon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7\"/></svg>";
	}
	function an(e) {
		if (m.nodeSlots) {
			let t = B("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
			return t.dataset.id = e.id, t.innerHTML = "<div class=\"loc-node-slot\"></div>", t.appendChild(on()), t;
		}
		let t = B("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
		if (t.dataset.id = e.id, e.type === "department") t.innerHTML = "<span class=\"loc-lbl\"></span>", t.querySelector(".loc-lbl").textContent = e.label, t.querySelector(".loc-lbl").title = e.label || "";
		else {
			t.innerHTML = "<div class=\"loc-photo\"></div><div class=\"loc-ptext\"><div class=\"loc-pname\"></div><div class=\"loc-ptitle\"></div><div class=\"loc-badge\"></div></div>";
			let n = t.querySelector(".loc-photo"), r = e.data && e.data.photo_url;
			if (h.showImages && r) {
				let t = new Image();
				t.crossOrigin = "anonymous", t.alt = e.personName || "", t.referrerPolicy = "no-referrer", t.onerror = () => {
					rn(n);
				}, t.src = r, n.appendChild(t);
			} else rn(n);
			let i = t.querySelector(".loc-pname"), a = t.querySelector(".loc-ptitle");
			i.textContent = e.personName || "—", i.title = e.personName || "", a.textContent = e.label, a.title = e.label || "";
			let o = t.querySelector(".loc-badge");
			e.status ? (o.textContent = e.status, o.className = "loc-badge loc-" + e.status) : o.remove();
		}
		return t.appendChild(on()), t;
	}
	function on() {
		let e = B("button", "loc-toggle");
		return e.type = "button", e.tabIndex = -1, e.dataset.role = "toggle", e;
	}
	function sn(e) {
		return e.scrollWidth > e.clientWidth + .5 || e.scrollHeight > e.clientHeight + .5;
	}
	function cn(e) {
		return e.querySelectorAll(".loc-ptext, .loc-pname, .loc-ptitle, .loc-lbl");
	}
	function ln(e) {
		for (let t of e) if (sn(t)) return !0;
		return !1;
	}
	function un(e) {
		if (!e.length) return;
		let t = e.map((e) => ({
			card: e,
			clips: cn(e),
			lo: Oe,
			hi: 1
		}));
		for (let e of t) e.card.style.setProperty("--loc-fit", "1");
		let n = t.filter((e) => ln(e.clips));
		for (let e = 0; e < 7 && n.length; e++) {
			for (let e of n) e.card.style.setProperty("--loc-fit", String((e.lo + e.hi) / 2));
			for (let e of n) {
				let t = (e.lo + e.hi) / 2;
				ln(e.clips) ? e.hi = t : e.lo = t;
			}
		}
		for (let e of n) e.card.style.setProperty("--loc-fit", String(e.lo));
	}
	function dn(t, n) {
		let r = t.querySelector("[data-role=\"toggle\"]");
		if (!r) return;
		let i = e(g, n.id) > 0;
		r.style.display = i ? "flex" : "none", r.textContent = n.collapsed ? "+" : "−";
		let a = n.collapsed ? "Expand" : "Collapse";
		r.title = a, r.setAttribute("aria-label", a);
	}
	function fn(e) {
		return document.createElementNS(Ee, e);
	}
	function pn(e) {
		return l(T[e.node.parentId], e, Mt(), v, y, b);
	}
	function mn(e) {
		return `M ${e.a.x.toFixed(1)} ${e.a.y.toFixed(1)} L ${e.b.x.toFixed(1)} ${e.b.y.toFixed(1)}`;
	}
	function hn() {
		let e = /* @__PURE__ */ new Set(), t = (e) => {
			let t = v[e];
			return t && (Math.abs(Number(t.dx) || 0) > .01 || Math.abs(Number(t.dy) || 0) > .01);
		};
		for (let n of Be) {
			let r = String(n.parentId);
			(t(r) || n.childIds.some((e) => t(e) || y[e] && y[e].length || b[e])) && e.add(r);
		}
		return e;
	}
	function gn(e = null) {
		let t = e || Object.entries(D).map(([e, t]) => ({
			id: e,
			d: t.getAttribute("d") || ""
		})), n = ue(t, Be, { rebuildFamilyIds: hn() });
		Ve = n.familyNetworks, dt.innerHTML = "";
		for (let e of n.segments) {
			let t = fn("path");
			t.setAttribute("d", e.d), t.setAttribute("class", "loc-visible-edge"), t.dataset.edges = e.memberIds.join(","), dt.appendChild(t);
		}
	}
	function _n() {
		let e = Object.create(null);
		_t.innerHTML = "";
		for (let t of Ve) {
			if (!t.trunk) continue;
			let n = String(t.parentId);
			e[n] = !0;
			let r = Ue[n];
			if (r || (r = fn("path"), r.dataset.family = n, Ue[n] = r, mt.appendChild(r)), r.setAttribute("d", mn(t.trunk)), r.dataset.children = t.trunk.childIds.join(","), h.selectedFamilyId === n) for (let e of t.segments) {
				let t = fn("path");
				t.setAttribute("d", e.d || mn(e)), t.setAttribute("class", "loc-family-selected"), _t.appendChild(t);
			}
		}
		for (let t in Ue) e[t] || (Ue[t].remove(), delete Ue[t]);
		h.selectedFamilyId && !e[h.selectedFamilyId] && Ir();
	}
	function vn() {
		let e = Object.create(null), t = [];
		for (let n of w) {
			let r = n.node;
			if (!r.parentId || !T[r.parentId]) continue;
			e[r.id] = !0;
			let i = pn(n);
			t.push({
				id: r.id,
				d: i
			});
			let a = D[r.id];
			a || (a = fn("path"), a.setAttribute("class", "loc-logical-edge"), D[r.id] = a, ft.appendChild(a)), a.setAttribute("d", i), a.classList.toggle("loc-sel", h.selectedEdgeId === r.id), a.classList.toggle("loc-incident", vr(r));
			let o = O[r.id];
			o || (o = fn("path"), o.dataset.edge = r.id, O[r.id] = o, pt.appendChild(o)), o.setAttribute("d", i);
		}
		for (let t in D) e[t] || (D[t].remove(), delete D[t]);
		for (let t in O) e[t] || (O[t].remove(), delete O[t]);
		gn(t), _n(), yr(), h.selectedEdgeId && !e[h.selectedEdgeId] ? U() : Vr();
	}
	function yn(e) {
		let t = T[e];
		if (!t || !T[t.node.parentId]) return;
		let n = pn(t);
		return D[e] && D[e].setAttribute("d", n), O[e] && O[e].setAttribute("d", n), !0;
	}
	function bn(e) {
		yn(e) && (gn(), _n());
	}
	function xn() {
		Number.isFinite(h.zoom) && h.zoom > 0 || (h.zoom = 1), Number.isFinite(h.panX) || (h.panX = 0), Number.isFinite(h.panY) || (h.panY = 0), ct.style.transform = `translate(${h.panX}px, ${h.panY}px) scale(${h.zoom})`, yt.textContent = Math.round(h.zoom * 100) + "%", h.selectedEdgeId && !k && Vr();
	}
	function Sn() {
		let e = 0, t = 0, n = 0, r = 0;
		for (let i of w) {
			let a = f(i, v), o = i.node.width / 2, s = i.node.height / 2;
			e = Math.min(e, a.x - o - 80), t = Math.min(t, a.y - s - 80), n = Math.max(n, a.x + o + 80), r = Math.max(r, a.y + s + 80);
		}
		ut.setAttribute("width", n), ut.setAttribute("height", r), gt.setAttribute("width", n), gt.setAttribute("height", r);
		let i = h.gridSize;
		lt.style.left = e + "px", lt.style.top = t + "px", lt.style.width = n - e + "px", lt.style.height = r - t + "px", lt.style.backgroundSize = i + "px " + i + "px", lt.style.backgroundPosition = (-e % i + i) % i + "px " + (-t % i + i) % i + "px";
	}
	function Cn() {
		lt.classList.toggle("loc-on", h.showGrid), I.classList.toggle("loc-gridon", h.showGrid);
	}
	let wn = .15, Tn = null, En = null, Dn = 0;
	function On() {
		return I.clientWidth > 0 && I.clientHeight > 0;
	}
	function kn(e) {
		Tn = e || {}, !(En || typeof ResizeObserver > "u") && (En = new ResizeObserver(() => {
			Tn && On() && !Dn && (Dn = requestAnimationFrame(() => {
				Dn = 0, Tn && On() && Mn(Tn);
			}));
		}), En.observe(I));
	}
	function An() {
		if (!w.length || !On()) return null;
		let e = re(ja(0), I.clientWidth, I.clientHeight).zoom;
		return Number.isFinite(e) && e > 0 ? e : null;
	}
	function jn() {
		for (let e of w) if (!e.node.parentId || !T[e.node.parentId]) return e;
		return null;
	}
	function Mn(e) {
		if (at || !w.length) return !1;
		if (!On()) return kn(e), !1;
		Tn = null;
		let t = e || {}, n = I.clientWidth, r = I.clientHeight, i = ja(0), a = re(i, n, r), o = a.zoom, s = a.panX, c = a.panY, l = Number(t.minZoom);
		if (Number.isFinite(l) && l > 0 && o < l) {
			if (o = Math.min(l, Pe()), t.anchor === "center") s = n / 2 - (i.x + i.w / 2) * o, c = r / 2 - (i.y + i.h / 2) * o;
			else {
				let e = jn(), t = e ? f(e, v) : {
					x: i.x + i.w / 2,
					y: i.y + i.h / 2
				};
				h.orientation === "LeftToRight" ? (s = 24 - i.x * o, c = r / 2 - t.y * o) : h.orientation === "RightToLeft" ? (s = n - 24 - (i.x + i.w) * o, c = r / 2 - t.y * o) : h.orientation === "BottomToTop" ? (s = n / 2 - t.x * o, c = r - 24 - (i.y + i.h) * o) : (s = n / 2 - t.x * o, c = 24 - i.y * o);
			}
		}
		return Number.isFinite(o) && o > 0 ? (h.zoom = o, h.panX = s, h.panY = c, xn(), q(), !0) : !1;
	}
	function Nn(e) {
		let t = T[e];
		if (!t || !On()) return;
		let n = f(t, v);
		h.panX = I.clientWidth / 2 - n.x * h.zoom, h.panY = I.clientHeight / 2 - n.y * h.zoom, xn(), q();
	}
	function Pn(e, t, n) {
		if (Number.isFinite(h.zoom) && h.zoom > 0 || (h.zoom = 1), !Number.isFinite(e) || e <= 0) return h.zoom;
		if (e < h.zoom) {
			let t = An(), n = Math.min(wn, t ?? wn, h.zoom);
			e = Math.max(n, e);
		} else e = Math.min(Math.max(Pe(), h.zoom), e);
		if (e === h.zoom) return e;
		let r = I.getBoundingClientRect(), i = t - r.left, a = n - r.top;
		return h.panX = i - (i - h.panX) * (e / h.zoom), h.panY = a - (a - h.panY) * (e / h.zoom), h.zoom = e, xn(), e;
	}
	function Fn(e, t) {
		let n = Number(e);
		if (at || !(Number.isFinite(n) && n > 0)) return at ? null : h.zoom;
		let r = I.getBoundingClientRect(), i = t && Number.isFinite(+(t.clientX ?? t.x)) ? +(t.clientX ?? t.x) : r.left + r.width / 2, a = t && Number.isFinite(+(t.clientY ?? t.y)) ? +(t.clientY ?? t.y) : r.top + r.height / 2, o = Pn(h.zoom * n, i, a);
		return q(), o;
	}
	function In() {
		let e = m.fitOnLayoutChange;
		return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
	}
	function Ln() {
		let e = In();
		if (e === "fit") Mn();
		else if (e === "recenter") {
			let e = g.find((e) => !e.parentId), t = h.selectedNodeId && T[h.selectedNodeId] ? h.selectedNodeId : e && e.id;
			t && Nn(t);
		}
	}
	function Rn() {
		for (let e of g) e.collapsed = !1;
		V("expand-all"), K();
	}
	function zn() {
		let t = ne(g, _);
		for (let n of g) n.collapsed = t[n.id] >= 1 && e(g, n.id) > 0;
		V("collapse-all"), K();
	}
	function Bn(e) {
		let t = _[e];
		t && (Zt(() => {
			t.collapsed = !t.collapsed;
		}), Dr(), K());
	}
	function Vn(e) {
		if (Ke = pe(g, e), Un(), Ke.size) {
			let e = w.find((e) => Ke.has(e.node.id));
			e && Nn(e.node.id);
		}
		return Ke.size;
	}
	function Hn() {
		Ke = /* @__PURE__ */ new Set(), Un();
	}
	function Un() {
		let e = Ke.size > 0;
		for (let t of w) {
			let n = E[t.node.id];
			if (!n) continue;
			let r = Ke.has(t.node.id);
			n.classList.toggle("loc-highlight", e && r), n.classList.toggle("loc-dim", e && !r);
		}
		for (let t in D) D[t].classList.toggle("loc-hl", e && Ke.has(t));
	}
	function Wn() {
		Je && clearTimeout(Je), Je = 0, qe = null;
	}
	function Gn(e) {
		Wn(), qe = String(e), Je = setTimeout(Wn, 0);
	}
	function Kn(e) {
		if (e) {
			for (let t of e.groupIds) lr(t);
			ur(e.groupIds), M("node-drag", {
				id: e.id,
				node: _[e.id],
				offset: v[e.id],
				group: e.groupIds
			});
		}
	}
	let qn = null;
	function Jn() {
		return !m.readonly && m.enableDragging && h.editMode;
	}
	function Yn(e) {
		if (e != null && typeof I.setPointerCapture == "function") try {
			I.setPointerCapture(e), qn = e;
		} catch {}
	}
	function Xn(e) {
		return !!e && (e.pointerType === "mouse" || e.pointerType === "pen") && e.buttons === 0;
	}
	function Zn() {
		if (qn == null) return;
		let e = qn;
		qn = null;
		try {
			I.hasPointerCapture && I.hasPointerCapture(e) && I.releasePointerCapture(e);
		} catch {}
	}
	function Qn(e) {
		_[e] && (U(), Ir(), C.has(e) ? (h.selectedNodeId = e, dr(), Dr()) : pr(e), Ro(e, !1), M("node-select", {
			id: e,
			node: _[e],
			rect: Or(e)
		}), m.inspector && li(e));
	}
	function $n(e, t) {
		if (e.target.closest("[data-role=\"toggle\"]") || e.button === 1 || (e.stopPropagation(), e.button != null && e.button !== 0) || (No(), $r && ni(t))) return;
		if (!Jn()) {
			if (e.ctrlKey || e.metaKey) {
				U(), Ir(), mr(t);
				return;
			}
			if (m.enablePan) {
				So(e, { nodeId: t });
				return;
			}
			Qn(t);
			return;
		}
		if (U(), Ir(), e.ctrlKey || e.metaKey) {
			mr(t);
			return;
		}
		C.has(t) ? (h.selectedNodeId = t, dr(), Dr()) : pr(t), Ro(t, !1), M("node-select", {
			id: t,
			node: _[t],
			rect: Or(t)
		});
		let n = C.has(t) && C.size > 1 ? [...C] : [t], r = Object.create(null);
		for (let e of n) {
			let t = v[e] || {
				dx: 0,
				dy: 0
			};
			r[e] = {
				dx: t.dx,
				dy: t.dy
			};
		}
		A = {
			id: t,
			pointerId: e.pointerId,
			groupIds: n,
			bases: r,
			startX: e.clientX,
			startY: e.clientY,
			moved: !1,
			lastDdx: 0,
			lastDdy: 0
		}, M("node-drag-start", {
			id: t,
			node: _[t],
			group: n
		}), Z("pointermove", er), Z("pointerup", tr), Z("pointercancel", tr);
	}
	function er(e) {
		if (!A || X || A.pointerId != null && e.pointerId != null && e.pointerId !== A.pointerId) return;
		if (Xn(e)) {
			tr({
				type: "pointercancel",
				pointerId: e.pointerId
			});
			return;
		}
		let t = e.clientX - A.startX, n = e.clientY - A.startY;
		if (!A.moved) {
			if (Math.abs(t) + Math.abs(n) <= 4) return;
			A.moved = !0;
			for (let e of A.groupIds) E[e] && E[e].classList.add("loc-dragging");
			Yn(A.pointerId);
		}
		let r = t / h.zoom, i = n / h.zoom, a = T[A.id], o = A.bases[A.id];
		if (a) {
			let e = a.cx + o.dx, t = a.cy + o.dy;
			if (h.snapGrid) {
				let n = h.gridSize;
				r = Math.round((e + r) / n) * n - e, i = Math.round((t + i) / n) * n - t;
			}
			if (A.groupIds.length === 1) {
				let n = ar(A.id, e + r, t + i);
				r = n.cx - e, i = n.cy - t, sr(n.gx, n.gy);
			}
		}
		A.lastDdx = r, A.lastDdy = i;
		for (let e of A.groupIds) {
			let t = A.bases[e];
			v[e] = {
				dx: t.dx + r,
				dy: t.dy + i
			};
		}
		Ge ||= requestAnimationFrame(() => {
			Ge = 0, Kn(A);
		});
	}
	function tr(e) {
		if (A && e && A.pointerId != null && e.pointerId != null && e.pointerId !== A.pointerId) return;
		let t = !1, n = A;
		if (n) {
			Ge && (cancelAnimationFrame(Ge), Ge = 0, Kn(n));
			for (let e of n.groupIds) E[e] && E[e].classList.remove("loc-dragging");
			M("node-drag-end", {
				id: n.id,
				node: _[n.id],
				offset: v[n.id],
				group: n.groupIds
			}), Sn(), t = !!n.moved, t ? Gn(n.id) : m.inspector && (!e || e.type !== "pointercancel") && li(n.id);
		}
		A = null, cr(), Q("pointermove", er), Q("pointerup", tr), Q("pointercancel", tr), Zn(), q(), t && (K(), nr("node-drag"));
	}
	function nr(e) {
		M("layout-change", {
			positioned: w,
			familyNetworks: Be,
			mode: h.subtreeMode,
			orientation: h.orientation,
			reason: e,
			edit: !0
		});
	}
	function rr() {
		let e = A;
		if (e) {
			Ge &&= (cancelAnimationFrame(Ge), 0);
			for (let t of e.groupIds) {
				let n = e.bases[t];
				n && (n.dx || n.dy) ? v[t] = {
					dx: n.dx,
					dy: n.dy
				} : delete v[t], E[t] && E[t].classList.remove("loc-dragging");
			}
			if (e.moved) {
				for (let t of e.groupIds) lr(t);
				ur(e.groupIds);
			}
			A = null, cr(), Q("pointermove", er), Q("pointerup", tr), Q("pointercancel", tr), Zn(), M("node-drag-end", {
				id: e.id,
				node: _[e.id],
				offset: v[e.id],
				group: e.groupIds,
				cancelled: !0
			});
		}
	}
	function ir() {
		if (A) for (let e of A.groupIds) {
			let t = v[e] || {
				dx: 0,
				dy: 0
			};
			A.bases[e] = {
				dx: t.dx - A.lastDdx,
				dy: t.dy - A.lastDdy
			}, A.moved && E[e] && E[e].classList.add("loc-dragging");
		}
	}
	function ar(e, t, n) {
		if (!m.snapAlign) return {
			cx: t,
			cy: n,
			gx: null,
			gy: null
		};
		let r = _[e];
		if (!r) return {
			cx: t,
			cy: n,
			gx: null,
			gy: null
		};
		let i = 8 / h.zoom, a = [], o = [], s = r.parentId && T[r.parentId];
		s && a.push(f(s, v).x);
		for (let t of w) {
			if (t.node.id === e || !r.parentId || t.node.parentId !== r.parentId) continue;
			let n = f(t, v);
			a.push(n.x), o.push(n.y);
		}
		let c = null, l = i;
		for (let e of a) {
			let n = Math.abs(t - e);
			n < l && (l = n, t = e, c = e);
		}
		let u = null, d = i;
		for (let e of o) {
			let t = Math.abs(n - e);
			t < d && (d = t, n = e, u = e);
		}
		return {
			cx: t,
			cy: n,
			gx: c,
			gy: u
		};
	}
	function or(e, t) {
		if (!m.snapAlign) return t;
		let n = T[e];
		if (!n) return t;
		let r = T[n.node.parentId], i = 8 / h.zoom, a = f(n, v), o = [a.x], s = [a.y];
		if (r) {
			let e = f(r, v);
			o.push(e.x), s.push(e.y);
		}
		let c = null, l = i, u = t.x;
		for (let e of o) {
			let n = Math.abs(t.x - e);
			n < l && (l = n, u = e, c = e);
		}
		let d = null, ee = i, te = t.y;
		for (let e of s) {
			let n = Math.abs(t.y - e);
			n < ee && (ee = n, te = e, d = e);
		}
		return sr(c, d), {
			x: u,
			y: te
		};
	}
	function sr(e, t) {
		vt.innerHTML = "";
		let n = +gt.getAttribute("width") || 0, r = +gt.getAttribute("height") || 0, i = (e, t, n, r) => {
			let i = fn("line");
			i.setAttribute("x1", e), i.setAttribute("y1", t), i.setAttribute("x2", n), i.setAttribute("y2", r), i.setAttribute("class", "loc-align-line"), vt.appendChild(i);
		};
		e != null && i(e, 0, e, r), t != null && i(0, t, n, t);
	}
	function cr() {
		vt.innerHTML = "";
	}
	function lr(e) {
		let t = T[e], n = E[e];
		if (!t || !n) return;
		let r = f(t, v);
		n.style.transform = `translate(${r.x - t.node.width / 2}px, ${r.y - t.node.height / 2}px)`;
	}
	function ur(e) {
		let t = new Set((e || []).map(String)), n = /* @__PURE__ */ new Set();
		for (let e of t) {
			let t = T[e];
			t && T[t.node.parentId] && n.add(String(e));
		}
		for (let e of w) t.has(String(e.node.parentId)) && n.add(String(e.node.id));
		let r = !1;
		for (let e of n) r = yn(e) || r;
		r && (gn(), _n()), h.selectedEdgeId && Vr();
	}
	function dr() {
		for (let e in E) E[e].classList.toggle("loc-selected", C.has(e)), E[e].classList.toggle("loc-primary", h.selectedNodeId === e && C.size > 1), E[e].setAttribute("aria-selected", C.has(e) ? "true" : "false");
	}
	function fr() {
		M("selection-change", {
			ids: [...C],
			primary: h.selectedNodeId
		});
	}
	function pr(e) {
		C = new Set(e ? [e] : []), h.selectedNodeId = e || null, dr(), Dr();
	}
	function mr(e) {
		C.has(e) ? (C.delete(e), h.selectedNodeId === e && (h.selectedNodeId = C.size ? [...C][C.size - 1] : null)) : (C.add(e), h.selectedNodeId = e), dr(), Dr(), fr();
	}
	function hr(e, t) {
		C = new Set(e), h.selectedNodeId = t ?? (e.length ? e[e.length - 1] : null), dr(), Dr(), fr();
	}
	function gr() {
		C = /* @__PURE__ */ new Set(), h.selectedNodeId = null, dr(), Dr();
	}
	function _r(e) {
		let t = kr(e.clientX, e.clientY), n = e.shiftKey ? new Set(C) : /* @__PURE__ */ new Set(), r = fn("rect");
		r.setAttribute("class", "loc-marquee"), gt.appendChild(r), I.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			if (Xn(e)) {
				o();
				return;
			}
			let a = kr(e.clientX, e.clientY), s = Math.min(t.x, a.x), c = Math.min(t.y, a.y), l = Math.abs(a.x - t.x), u = Math.abs(a.y - t.y);
			r.setAttribute("x", s), r.setAttribute("y", c), r.setAttribute("width", l), r.setAttribute("height", u);
			let d = new Set(n);
			for (let e of w) {
				let t = f(e, v);
				t.x >= s && t.x <= s + l && t.y >= c && t.y <= c + u && d.add(e.node.id);
			}
			C = d, h.selectedNodeId = C.size ? [...C][C.size - 1] : null, dr(), Dr(), i = !0;
		}, o = () => {
			r.remove(), I.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? (fr(), C.size === 1 && m.inspector && li([...C][0])) : (gr(), ui());
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function vr(e) {
		return C.has(e.id) || C.has(e.parentId);
	}
	let H = /* @__PURE__ */ new Set();
	function yr() {
		for (let e in D) D[e].classList.toggle("loc-edge-selected", H.has(e));
	}
	function br() {
		H.size && (H = /* @__PURE__ */ new Set(), yr(), M("edges-select", { ids: [] }));
	}
	function xr(e) {
		H = new Set((e || []).filter((e) => D[e])), yr(), M("edges-select", { ids: [...H] });
	}
	function Sr() {
		if (si("resetSelectedEdges") || !H.size) return;
		let e = !1;
		for (let t of H) y[t] && (delete y[t], e = !0), b[t] && (delete b[t], e = !0);
		e && (h.selectedEdgeId && H.has(h.selectedEdgeId) && U(), vn(), yr(), q(), K(), nr("edges-reset"), M("edges-reset", { ids: [...H] }));
	}
	function Cr(e, t, n, r, i, a, o, s) {
		let c = (n - e) * (s - a) - (r - t) * (o - i);
		if (Math.abs(c) < 1e-9) return !1;
		let l = ((i - e) * (s - a) - (a - t) * (o - i)) / c, u = ((i - e) * (r - t) - (a - t) * (n - e)) / c;
		return l >= 0 && l <= 1 && u >= 0 && u <= 1;
	}
	function wr(e, t, n, r, i, a) {
		let o = n + i, s = r + a, c = (e) => e.x >= n && e.x <= o && e.y >= r && e.y <= s;
		return c(e) || c(t) ? !0 : Cr(e.x, e.y, t.x, t.y, n, r, o, r) || Cr(e.x, e.y, t.x, t.y, o, r, o, s) || Cr(e.x, e.y, t.x, t.y, o, s, n, s) || Cr(e.x, e.y, t.x, t.y, n, s, n, r);
	}
	function Tr(e, t, n, r, i) {
		let a = jr(e);
		if (!a) return !1;
		for (let e of Nr(a)) if (wr(e.a, e.b, t, n, r, i)) return !0;
		return !1;
	}
	function Er(e) {
		let t = kr(e.clientX, e.clientY), n = e.shiftKey ? new Set(H) : /* @__PURE__ */ new Set(), r = fn("rect");
		r.setAttribute("class", "loc-marquee loc-marquee-edge"), gt.appendChild(r), I.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			if (Xn(e)) {
				o();
				return;
			}
			let a = kr(e.clientX, e.clientY), s = Math.min(t.x, a.x), c = Math.min(t.y, a.y), l = Math.abs(a.x - t.x), u = Math.abs(a.y - t.y);
			r.setAttribute("x", s), r.setAttribute("y", c), r.setAttribute("width", l), r.setAttribute("height", u);
			let d = new Set(n);
			for (let e in D) Tr(e, s, c, l, u) && d.add(e);
			H = d, yr(), i = !0;
		}, o = () => {
			r.remove(), I.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? M("edges-select", { ids: [...H] }) : br();
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function Dr() {
		for (let e in D) {
			let t = T[e];
			D[e].classList.toggle("loc-incident", !!t && vr(t.node));
		}
	}
	function Or(e) {
		let t = E[e];
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
	function kr(e, t) {
		let n = I.getBoundingClientRect();
		return {
			x: (e - n.left - h.panX) / h.zoom,
			y: (t - n.top - h.panY) / h.zoom
		};
	}
	function Ar(e) {
		if (h.snapGrid) {
			let t = h.gridSize;
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
	function jr(e) {
		let t = T[e];
		if (!t) return null;
		let n = T[t.node.parentId];
		if (!n) return null;
		let r = Mt(), i = te(t, y[e], b[e], n, r, v);
		return oe(n, t, i, r, v, b[e]);
	}
	function Mr(e) {
		if (y[e]) return y[e];
		let t = T[e], n = t && T[t.node.parentId], r = te(t, null, b[e], n, Mt(), v);
		return y[e] = r.map((e) => ({
			x: e.x,
			y: e.y
		})), y[e];
	}
	function Nr(e) {
		let t = [], n = u(Mt());
		for (let r = 0; r < e.length - 1; r++) {
			let i = se([e[r], e[r + 1]], n);
			for (let e = 0; e < i.length - 1; e++) t.push({
				a: i[e],
				b: i[e + 1],
				insert: r
			});
		}
		return t;
	}
	function Pr(e) {
		Ir(), h.selectedEdgeId && D[h.selectedEdgeId] && D[h.selectedEdgeId].classList.remove("loc-sel"), C = /* @__PURE__ */ new Set(), h.selectedNodeId = null, dr(), h.selectedEdgeId = e, D[e] && D[e].classList.add("loc-sel"), Dr(), Vr();
	}
	function U() {
		h.selectedEdgeId && D[h.selectedEdgeId] && D[h.selectedEdgeId].classList.remove("loc-sel"), h.selectedEdgeId = null, L.innerHTML = "";
	}
	function Fr(e) {
		let t = String(e);
		U(), C = /* @__PURE__ */ new Set(), h.selectedNodeId = null, dr(), h.selectedFamilyId = t, vn();
		let n = Ve.find((e) => String(e.parentId) === t) || Be.find((e) => String(e.parentId) === t);
		M("family-route-select", {
			parentId: t,
			childIds: n ? n.childIds.slice() : []
		});
	}
	function Ir() {
		if (h.selectedFamilyId) {
			h.selectedFamilyId = null, _t.innerHTML = "";
			for (let e in D) D[e].classList.remove("loc-family-member");
		}
	}
	function Lr(e = h.selectedFamilyId) {
		if (si("resetFamilyRoute")) return !1;
		let t = e == null ? null : String(e);
		return !t || !x[t] ? !1 : (delete x[t], V("family-route-reset"), q(), K(), M("family-route-reset", { parentId: t }), !0);
	}
	function Rr(e, t) {
		if (si("setFamilyRouteOverride")) return !1;
		let n = e == null ? "" : String(e);
		return !n || !T[n] ? !1 : !t || !Number.isFinite(Number(t.trunkOffset)) ? Lr(n) : (x[n] = { trunkOffset: Number(t.trunkOffset) }, h.selectedFamilyId = n, V("family-route-override"), q(), K(), M("family-route-change", {
			parentId: n,
			trunkOffset: x[n].trunkOffset,
			pending: !1
		}), !0);
	}
	function zr(e, t, n, r) {
		let i = fn("circle");
		return i.setAttribute("cx", e), i.setAttribute("cy", t), i.setAttribute("r", n), i.setAttribute("class", r), i;
	}
	function Br(e, t, n, r) {
		let i = fn("rect");
		return i.setAttribute("x", e - n), i.setAttribute("y", t - n), i.setAttribute("width", 2 * n), i.setAttribute("height", 2 * n), i.setAttribute("rx", 2 / h.zoom), i.setAttribute("class", r), i;
	}
	function Vr() {
		L.innerHTML = "";
		let e = h.selectedEdgeId;
		if (!e || m.readonly) return;
		let t = jr(e);
		if (!t) return;
		let n = y[e] || [], r = 6 / h.zoom, i = 5 / h.zoom;
		if (!h.editMode) {
			for (let e = 0; e < n.length; e++) {
				let t = zr(n[e].x, n[e].y, r, "loc-wp-handle loc-wp-readonly");
				t.dataset.wp = e, L.appendChild(t);
			}
			return;
		}
		for (let e of Nr(t)) {
			let t = zr((e.a.x + e.b.x) / 2, (e.a.y + e.b.y) / 2, i, "loc-wp-add");
			t.dataset.add = e.insert, L.appendChild(t);
		}
		for (let e = 0; e < n.length; e++) {
			let t = zr(n[e].x, n[e].y, r, "loc-wp-handle");
			t.dataset.wp = e, L.appendChild(t);
		}
		let a = t[0], o = t[t.length - 1], s = Br(a.x, a.y, 6 / h.zoom, "loc-ep loc-ep-parent");
		s.dataset.ep = "parent", L.appendChild(s);
		let c = Br(o.x, o.y, 6 / h.zoom, "loc-ep loc-ep-child");
		c.dataset.ep = "child", L.appendChild(c);
	}
	function Hr(e, t) {
		let n = f(e, v), r = e.node.width, i = e.node.height, a = (t.x - n.x) / (r / 2), o = (t.y - n.y) / (i / 2), s = Math.max(Math.abs(a), Math.abs(o));
		return s > 1e-6 && (a /= s, o /= s), {
			nx: Math.max(-1, Math.min(1, a)),
			ny: Math.max(-1, Math.min(1, o))
		};
	}
	let Ur = .34;
	function Wr(e) {
		let t = e.nx, n = e.ny;
		return Math.abs(Math.abs(n) - 1) < 1e-6 && Math.abs(t) < Ur ? t = 0 : Math.abs(Math.abs(t) - 1) < 1e-6 && Math.abs(n) < Ur && (n = 0), {
			nx: t,
			ny: n
		};
	}
	function Gr(e, t) {
		let n = new Set([t].concat(yi(t)));
		for (let t = w.length - 1; t >= 0; t--) {
			let r = w[t];
			if (n.has(r.node.id)) continue;
			let i = f(r, v);
			if (e.x >= i.x - r.node.width / 2 && e.x <= i.x + r.node.width / 2 && e.y >= i.y - r.node.height / 2 && e.y <= i.y + r.node.height / 2) return r.node.id;
		}
		return null;
	}
	let Kr = null;
	function qr(e) {
		Kr && E[Kr] && E[Kr].classList.remove("loc-reparent-target"), Kr = e, e && E[e] && E[e].classList.add("loc-reparent-target");
	}
	function Jr(e) {
		if (!k || k.kind !== "ep") return;
		if (Xn(e)) {
			Yr();
			return;
		}
		let t = k.id, n = T[t];
		if (!n) return;
		let r = T[n.node.parentId];
		if (!r) return;
		let i = Ar(kr(e.clientX, e.clientY));
		if (b[t] = b[t] || {}, k.changed = !0, k.which === "child") b[t].c = Wr(Hr(n, i));
		else {
			b[t].p = Wr(Hr(r, i));
			let e = Gr(i, t);
			qr(e && e !== n.node.parentId ? e : null);
		}
		bn(t), Vr();
	}
	function Yr() {
		let e = k;
		if (k = null, Q("pointermove", Jr), Q("pointerup", Yr), e && e.which === "parent" && Kr) {
			let t = Kr;
			qr(null), Xr(e.id, t);
		} else qr(null), q(), e && e.changed && (K(), nr("edge-anchor"));
	}
	function Xr(e, t) {
		if (si("reparentNode")) return !1;
		let n = _[e];
		if (!n || t === e || t && yi(e).indexOf(t) >= 0) return !1;
		let r = t || "", i = n.parentId == null ? "" : String(n.parentId);
		return (n.parentId || "") !== r && (h.selectedEdgeId = null, h.selectedFamilyId = null, L.innerHTML = "", _t.innerHTML = "", Zt(() => {
			n.parentId = r, S[e] = Object.assign(S[e] || {}, { parentId: r }), delete y[e], delete b[e], i && delete x[i], r && delete x[r], T[e] && Object.assign(T[e].node, { parentId: r });
		}), Dr(), R.classList.contains("loc-open") && h.selectedNodeId === e && di(), M("node-change", {
			id: e,
			node: { ...n },
			patch: { parentId: r },
			reparented: !0
		}), K(), !0);
	}
	function Zr(e) {
		return Xr(e, "");
	}
	function Qr(e, t) {
		return t ? Xr(e, t) : !1;
	}
	let $r = null;
	function ei(e) {
		!si("beginAttach") && e && ($r = e, P.classList.add("loc-attaching"), M("attach-start", { id: e }));
	}
	function ti() {
		$r && ($r = null, P.classList.remove("loc-attaching"), M("attach-cancel", {}));
	}
	function ni(e) {
		let t = $r;
		return !t || !e || e === t || yi(t).indexOf(e) >= 0 ? (ti(), !1) : ($r = null, P.classList.remove("loc-attaching"), Qr(t, e), m.inspector && li(t), !0);
	}
	function ri(e, t, n) {
		let r = n.x - t.x, i = n.y - t.y, a = r * r + i * i, o = a ? ((e.x - t.x) * r + (e.y - t.y) * i) / a : 0;
		return o = Math.max(0, Math.min(1, o)), Math.hypot(e.x - (t.x + o * r), e.y - (t.y + o * i));
	}
	function ii(e, t) {
		let n = Nr(e), r = 0, i = Infinity;
		for (let e of n) {
			let n = ri(t, e.a, e.b);
			n < i && (i = n, r = e.insert);
		}
		return r;
	}
	let ai = [
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
	function oi() {
		P.classList.toggle("loc-edit", h.editMode);
	}
	function si(e) {
		return m.readonly ? (console.warn(`local-org-chart: ${e}() ignored because the chart is readonly`), !0) : !1;
	}
	function ci(e) {
		return e && si("setEditMode") ? !1 : (h.editMode = !!e, oi(), $(), h.editMode || (U(), Ir()), R.classList.contains("loc-open") && di(), M("edit-mode-change", { editMode: h.editMode }), q(), !0);
	}
	function li(e) {
		m.inspector && (h.selectedNodeId = e, R.classList.add("loc-open"), di(), M("inspector-open", {
			id: e,
			node: _[e]
		}));
	}
	function ui() {
		R.classList.contains("loc-open") && (R.classList.remove("loc-open"), M("inspector-close", {}));
	}
	function di() {
		let e = h.selectedNodeId, t = e && _[e];
		if (!t) {
			ui();
			return;
		}
		if (Tt.textContent = t.label || t.personName || t.id, m.inspectorSlot) {
			wt.innerHTML = "";
			return;
		}
		let n = h.editMode, r = n ? "" : " disabled", i = (e, t, n) => `<input data-field="${e}" type="${n || "text"}" value="${W(t)}"${r}/>`, a = (e, t, n) => `<select data-field="${e}"${r}>` + n.map((e) => {
			let n = Array.isArray(e) ? e[0] : e, r = Array.isArray(e) ? e[1] : e || "—";
			return `<option value="${W(n)}"${String(n) === String(t ?? "") ? " selected" : ""}>${r}</option>`;
		}).join("") + "</select>", o = (e, t) => `<label class="loc-field"><span>${e}</span>${t}</label>`, s = o("ID", `<input value="${W(t.id)}" disabled/>`) + o("Type", a("type", t.type, [["department", "department"], ["position", "position"]])) + o("Label", i("label", t.label));
		t.type !== "department" && (s += m.userSearch ? `<label class="loc-field loc-usersearch"><span>Person name</span>${i("personName", t.personName)}<div class="loc-usersearch-list" data-role="user-results" hidden></div></label>` : o("Person name", i("personName", t.personName)), s += o("Status", a("status", t.status, [
			["", "—"],
			["FILLED", "FILLED"],
			["VACANT", "VACANT"],
			["UNFUNDED", "UNFUNDED"]
		])) + o("Photo URL", i("photo_url", t.data && t.data.photo_url || ""))), m.advancedLayoutControls && (s += o("Layout override", a("layoutMode", t.layoutMode || "", ai.map((e) => [e, e || "(inherit)"])))), s += o("Width", i("width", t.width, "number")) + o("Height", i("height", t.height, "number")), Ct.innerHTML = s, wt.innerHTML = n ? "<button data-role=\"add-child\">+ Add child</button>" + (t.parentId ? "<button data-role=\"detach\">Detach</button>" : "<button data-role=\"attach\">Attach…</button>") + "<button data-role=\"del-node\" class=\"loc-danger\">Delete</button>" : "<span class=\"loc-foot-hint\">Turn on Edit to modify fields</span>";
	}
	let fi = 0, pi = 0;
	function mi(e) {
		if (!m.userSearch) return;
		let t = Ct.querySelector("[data-role=\"user-results\"]");
		if (!t) return;
		fi && clearTimeout(fi);
		let n = (e || "").trim();
		if (!n) {
			t.hidden = !0, t.innerHTML = "";
			return;
		}
		let r = ++pi;
		fi = setTimeout(() => {
			try {
				Promise.resolve(m.userSearch(n, _[h.selectedNodeId])).then((e) => {
					r === pi && hi(t, Array.isArray(e) ? e : []);
				}).catch(() => {});
			} catch {}
		}, 220);
	}
	function hi(e, t) {
		t.length ? (e.innerHTML = t.slice(0, 8).map((e, t) => {
			let n = W(e.name || e.personName || e.label || ""), r = W(e.title || e.label || e.email || "");
			return `<button type="button" class="loc-usersearch-item" data-uidx="${t}"><b>${n}</b>${r ? `<small>${r}</small>` : ""}</button>`;
		}).join(""), e.hidden = !1, e._users = t) : (e.hidden = !0, e.innerHTML = "");
	}
	function gi(e) {
		let t = h.selectedNodeId, n = t && _[t];
		if (!n) return;
		let r = m.userToFields ? m.userToFields(e, n) : null;
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
		vi(t, r);
		let i = Ct.querySelector("[data-role=\"user-results\"]");
		i && (i.hidden = !0, i.innerHTML = ""), di(), M("user-select", {
			id: t,
			user: e,
			node: { ..._[t] }
		});
	}
	function _i() {
		let e;
		do
			e = "node-" + ++ze;
		while (_[e]);
		return e;
	}
	function vi(e, t) {
		if (si("updateNode")) return !1;
		let n = _[e];
		if (!n) return !1;
		let r = [], i = be({ nodeOverrides: { [e]: t } }, r, "updateNode").nodeOverrides[e] || {};
		if ($i("node patch", r), t = i, !Object.keys(t).length) return !1;
		let a = n.data || {};
		Object.assign(n, t), T[e] && T[e].node !== n && Object.assign(T[e].node, t);
		let o = Object.assign({}, t);
		if (t.data) {
			let n = {};
			for (let e of Object.keys(t.data)) t.data[e] !== a[e] && (n[e] = t.data[e]);
			let r = S[e] && S[e].data || {};
			o.data = Object.assign({}, r, n);
		}
		S[e] = Object.assign(S[e] || {}, o);
		let s = [
			"type",
			"width",
			"height",
			"layoutMode"
		].some((e) => e in t);
		return E[e] && (E[e].remove(), delete E[e]), Qt(), s && V("node-structure", { preserveManual: !0 }), M("node-change", {
			id: e,
			node: { ...n },
			patch: t
		}), q(), K("field:" + e + ":" + Object.keys(t).join(",")), !0;
	}
	function yi(e) {
		let t = [], n = [e];
		for (; n.length;) {
			let e = n.pop();
			for (let r of g) r.parentId === e && (t.push(r.id), n.push(r.id));
		}
		return t;
	}
	function bi(e) {
		if (si("addChild") || !h.editMode) return null;
		let t = _i(), n = le({
			id: t,
			parentId: e || "",
			type: "position",
			label: "NEW POSITION",
			personName: "",
			status: ""
		});
		return g.push(n), _[t] = n, e && delete x[String(e)], S[t] = Object.assign({ __new: !0 }, n), V("add-child", { preserveManual: !0 }), pr(t), li(t), M("node-change", {
			id: t,
			node: { ...n },
			added: !0
		}), q(), K(), t;
	}
	function xi(e) {
		if (si("deleteNode") || !h.editMode || !e) return !1;
		let t = _[e]?.parentId, n = [e].concat(yi(e)), r = new Set(n);
		return g = g.filter((e) => !r.has(e.id)), _ = a(g), n.forEach((e) => {
			S[e] = { __deleted: !0 }, delete v[e], delete y[e], delete b[e], E[e] && (E[e].remove(), delete E[e]), C.delete(e);
		}), t && delete x[String(t)], n.forEach((e) => {
			delete x[String(e)];
		}), r.has(h.selectedNodeId) && (h.selectedNodeId = C.size ? [...C][C.size - 1] : null, h.selectedNodeId || ui()), V("delete-node", { preserveManual: !0 }), M("node-change", {
			id: e,
			removed: !0,
			ids: n
		}), q(), K(), !0;
	}
	function Si() {
		let e = new Set(Object.keys(S).filter((e) => S[e] && S[e].__deleted));
		e.size && (g = g.filter((t) => !e.has(t.id))), _ = a(g);
		for (let e in S) {
			let t = S[e];
			if (t && !t.__deleted) {
				if (t.__new) {
					if (!_[e]) {
						let n = Object.assign({}, t);
						delete n.__new;
						let r = le(n);
						g.push(r), _[e] = r;
					}
				} else if (_[e]) {
					let n = _[e], { data: r, ...i } = t;
					Object.assign(n, i), r && (n.data = Object.assign({}, n.data, r));
				}
			}
		}
	}
	let Ci = [
		["type", "Type"],
		["status", "Status"],
		["level", "Level (data.level)"],
		["unit", "Unit (data.unit)"],
		["id", "Node id"],
		["label", "Label"]
	];
	function wi(e, t) {
		let n = me(t, Le);
		Ti(e, "--loc-node-bg", n && n.bg), Ti(e, "--loc-node-text", n && n.text), Ti(e, "--loc-node-border", n && n.border);
	}
	function Ti(e, t, n) {
		n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
	}
	function Ei() {
		for (let e in E) _[e] && wi(E[e], _[e]);
		h.showLegend && ji();
	}
	let Di = {
		FILLED: "Filled",
		VACANT: "Vacant",
		UNFUNDED: "Unfunded"
	};
	function Oi() {
		Ot.classList.toggle("loc-on", h.showLegend), h.showLegend && ji();
	}
	function ki(e) {
		return h.showLegend = e == null ? !h.showLegend : !!e, Oi(), $(), q(), M("legend-change", { legend: h.showLegend }), h.showLegend;
	}
	function Ai(e) {
		return ki(e ?? !h.showLegend);
	}
	function ji() {
		if (m.legendSlot) return;
		let e = Object.create(null), t = Object.create(null);
		for (let n of g) n.type && (e[n.type] = !0), n.status && (t[n.status] = !0);
		let n = "", r = [];
		e.department && r.push(Ni("loc-leg-dept", "Department")), e.position && r.push(Ni("loc-leg-pos", "Position")), r.length && (n += Mi("Type", r.join("")));
		let i = [
			"FILLED",
			"VACANT",
			"UNFUNDED"
		].filter((e) => t[e]).map((e) => `<div class="loc-leg-row"><span class="loc-leg-badge loc-${e}">${Di[e] || e}</span></div>`);
		i.length && (n += Mi("Status", i.join("")));
		let a = Le.filter((e) => e.enabled && (e.style.bg || e.style.border)).map((e) => `<div class="loc-leg-row"><span class="loc-leg-swatch" style="background:${W(e.style.bg || "#fff")};border-color:${W(e.style.border || e.style.bg || "#d0d5dd")}"></span><span class="loc-leg-label">${W(e.field)} = ${W(e.value || "—")}</span></div>`).join("");
		a && (n += Mi("Rules", a)), At.innerHTML = n || "<div class=\"loc-leg-empty\">No legend items yet.</div>";
	}
	function Mi(e, t) {
		return `<div class="loc-leg-section"><div class="loc-leg-title">${e}</div>${t}</div>`;
	}
	function Ni(e, t) {
		return `<div class="loc-leg-row"><span class="loc-leg-swatch ${e}"></span><span class="loc-leg-label">${t}</span></div>`;
	}
	function Pi() {
		return Object.assign(Xi(), {
			node: {
				width: h.cardWidth,
				photoHeight: h.photoHeight,
				textHeight: h.textHeight,
				totalHeight: h.photoHeight + h.textHeight
			},
			departmentNode: {
				width: h.departmentWidth,
				height: h.departmentHeight
			}
		});
	}
	function Fi(e, t) {
		let n = JSON.stringify(Xi()), r = ea(e || {}, "settings"), i = h.showImages, a = Zi(r);
		if (JSON.stringify(Xi()) === n) return !1;
		if (h.showImages !== i) for (let e in E) E[e].remove(), delete E[e];
		if ((a.sizeChanged || a.renderChanged) && $t(), a.sizeChanged) {
			en();
			for (let e in E) delete E[e].dataset.fitted;
		}
		return Ei(), Cn(), $(), V("settings"), z.classList.contains("loc-open") && Ui(), t && t.silent || M("settings-change", Pi()), q(), !0;
	}
	function Ii(e) {
		let t = z.classList.contains("loc-open"), n = e == null ? !t : !!e;
		z.classList.toggle("loc-open", n), F && F.querySelectorAll("button[data-act=\"settings\"]").forEach((e) => e.classList.toggle("loc-active", n)), n && Ui(), n !== t && M(n ? "settings-open" : "settings-close", {});
	}
	function Li() {
		let e = G(Re);
		for (let t of [
			"subtreeMode",
			"orientation",
			"showImages",
			"autoEdgeSide"
		]) delete e[t];
		Fi(e), Ei();
	}
	function Ri(e, t, n, r, i) {
		let a = Number.isFinite(Number(n)) ? Number(n) : r;
		return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${a}</b></span><input type="range" data-set="${e}" min="${r}" max="${i}" value="${a}"/></label>`;
	}
	let zi = /^#[0-9a-f]{6}$/i;
	function Bi(e, t, n, r) {
		let i = zi.test(r || "") ? r : "#e0524d";
		return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${r ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${W(i)}"/></label>`;
	}
	function Vi(e, t) {
		let n = (t, n) => `<option value="${t}"${e.field === t ? " selected" : ""}>${n}</option>`;
		return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + Ci.map(([e, t]) => n(e, t)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${W(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Bi(t, "bg", "BG", e.style.bg) + Bi(t, "text", "Text", e.style.text) + Bi(t, "border", "Border", e.style.border) + "</div></div>";
	}
	function Hi() {
		let e = Sa().map((e) => `<div class="loc-preset"><button class="loc-preset-apply" data-role="preset-apply" data-name="${W(e.name)}" title="Apply this saved layout">${W(e.name)}</button><span class="loc-preset-tag">${e.full ? "full" : "pattern"}</span><button class="loc-preset-del" data-role="preset-del" data-name="${W(e.name)}" title="Delete preset">✕</button></div>`).join("");
		return e ||= "<div class=\"loc-set-hint\">No saved presets yet.</div>", `<div class="loc-set-section"><div class="loc-set-title">Presets</div><div class="loc-set-hint">Save the current arrangement so an accidental mode change can’t lose it (Undo / Ctrl+Z restores it too).</div><div class="loc-preset-save"><input type="text" data-role="preset-name" placeholder="Preset name…"/><label class="loc-preset-full"><input type="checkbox" data-role="preset-full" checked/> positions</label><button data-role="preset-save">Save</button></div><div class="loc-preset-list">${e}</div></div>`;
	}
	function Ui() {
		if (m.settingsSlot) return;
		let e = Hi() + "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Layout</div>" + Ri("spacingX", "Spacing X", h.spacingX, 0, 200) + Ri("spacingY", "Spacing Y", h.spacingY, 0, 260) + Ri("gridSize", "Grid size", h.gridSize, 6, 80) + `<label class="loc-color"><input type="checkbox" data-set-toggle="showImages"${h.showImages ? " checked" : ""}/><span>Show photos (off → user icon)</span></label><label class="loc-color"><input type="checkbox" data-set-toggle="autoEdgeSide"${h.autoEdgeSide ? " checked" : ""}/><span>Smart edges (lines follow waypoints to any side)</span></label></div>`;
		e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Card size</div><div class=\"loc-set-hint\">Applies to every person card. The photo tops the card at its full size; the name/title sit below.</div>" + Ri("cardWidth", "Card width", h.cardWidth, 120, 320) + Ri("photoHeight", "Photo height", h.photoHeight, 60, 240) + `<label class="loc-color"><input type="checkbox" data-set-toggle="photoContain"${h.photoContain ? " checked" : ""}/><span>Preserve photo proportions (contain)</span></label></div>`, e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Theme rules</div><div class=\"loc-set-hint\">Recolor nodes that match a field = value. Later rules win.</div>", Le.forEach((t, n) => {
			e += Vi(t, n);
		}), e += "<button class=\"loc-set-add\" data-role=\"add-rule\">+ Add rule</button></div>", e += "<div class=\"loc-set-foot\"><button class=\"loc-set-reset\" data-role=\"reset-settings\" title=\"Restore spacing, grid &amp; theme rules to defaults\">↺ Reset settings</button></div>", Dt.innerHTML = e;
	}
	function Wi(e, t) {
		let n = Dt.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
		return n && n.checked;
	}
	function Gi(e, t) {
		let n = Dt.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
		return n ? n.value : "";
	}
	let Ki = [], qi = -1, Ji = !1, Yi = null;
	function G(e) {
		return e == null ? e : JSON.parse(JSON.stringify(e));
	}
	function Xi() {
		return {
			subtreeMode: h.subtreeMode,
			orientation: h.orientation,
			spacingX: h.spacingX,
			spacingY: h.spacingY,
			gridSize: h.gridSize,
			showGrid: h.showGrid,
			snapGrid: h.snapGrid,
			alignGrid: h.alignGrid,
			showImages: h.showImages,
			autoEdgeSide: h.autoEdgeSide,
			cardWidth: h.cardWidth,
			photoHeight: h.photoHeight,
			textHeight: h.textHeight,
			departmentWidth: h.departmentWidth,
			departmentHeight: h.departmentHeight,
			photoContain: h.photoContain,
			virtualPhotoFrame: {
				width: h.photoFrameWidth,
				height: h.photoFrameHeight
			},
			renderedImage: {
				width: h.photoImageWidth,
				height: h.photoImageHeight,
				fit: h.photoContain ? "contain" : "cover",
				align: "center",
				offsetX: h.photoOffsetX,
				offsetY: h.photoOffsetY
			},
			photoBackground: h.photoBackground,
			themeRules: Le.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		};
	}
	function Zi(e) {
		if (!e) return {
			sizeChanged: !1,
			renderChanged: !1
		};
		e.subtreeMode && (h.subtreeMode = e.subtreeMode), e.orientation && (h.orientation = Me(e.orientation)), [
			"spacingX",
			"spacingY",
			"gridSize"
		].forEach((t) => {
			typeof e[t] == "number" && (h[t] = e[t]);
		}), "showGrid" in e && (h.showGrid = e.showGrid), "snapGrid" in e && (h.snapGrid = e.snapGrid), "alignGrid" in e && (h.alignGrid = e.alignGrid), "showImages" in e && (h.showImages = e.showImages), "autoEdgeSide" in e && (h.autoEdgeSide = e.autoEdgeSide);
		let t = tn(e);
		return Array.isArray(e.themeRules) && (Le = e.themeRules.map(ye)), t;
	}
	function Qi(e, t = "view") {
		if (!e) return;
		let n = h.showImages;
		if (Zi(ea(e, t)), h.showImages !== n) for (let e in E) E[e].remove(), delete E[e];
		$t(), en();
	}
	function $i(e, t) {
		t && t.length && (console.warn(`local-org-chart: ignored invalid ${e}: ${t.join("; ")}`), Promise.resolve().then(() => {
			at || M("input-warning", {
				context: e,
				problems: t.slice()
			});
		}));
	}
	function ea(e, t) {
		let n = [], r = ve(e, n, t);
		return $i(t, n), r;
	}
	function ta(e, t) {
		let n = [], r = be(e, n, t);
		return $i(t, n), r;
	}
	function na(e, t) {
		let n = [], r = Object.create(null), i = [];
		for (let t of Array.isArray(e) ? e : []) {
			if (!t || typeof t != "object") {
				n.push("a node that is not an object");
				continue;
			}
			for (let e of o(t)) n.push(`${t.id}: ${e}`);
			let e = le(t), a = {};
			e.width === t.width && (a.width = e.width), e.height === t.height && (a.height = e.height), (a.width || a.height) && (r[e.id] = a), i.push(e);
		}
		return Fe = r, $i(t, n), i;
	}
	function ra(e) {
		let t = e || _;
		for (let e of [
			v,
			y,
			b,
			x
		]) for (let n of Object.keys(e)) n in t || delete e[n];
	}
	function ia() {
		return {
			nodes: g.map((e) => Object.assign({}, e)),
			manualOffsets: G(v),
			edgeWaypoints: G(y),
			edgeAnchors: G(b),
			familyRouteOverrides: G(x),
			nodeOverrides: G(S),
			view: Xi(),
			selectedNodeId: h.selectedNodeId
		};
	}
	function aa(e) {
		Ji = !0;
		let t = Object.create(null);
		for (let e of g) t[e.id] = e.parentId;
		g = (e.nodes || []).map(le), _ = a(g), v = Object.assign(Object.create(null), G(e.manualOffsets)), y = Object.assign(Object.create(null), G(e.edgeWaypoints)), b = Object.assign(Object.create(null), G(e.edgeAnchors)), x = Object.assign(Object.create(null), G(e.familyRouteOverrides)), S = Object.assign(Object.create(null), G(e.nodeOverrides)), Ie = !0, Qi(e.view, "history");
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		for (let e in O) O[e].remove(), delete O[e];
		h.selectedEdgeId = null, L.innerHTML = "", h.selectedNodeId = e.selectedNodeId && _[e.selectedNodeId] ? e.selectedNodeId : null, Cn(), V("history"), h.selectedNodeId && pr(h.selectedNodeId), R.classList.contains("loc-open") && (h.selectedNodeId ? di() : ui()), z.classList.contains("loc-open") && Ui(), Ji = !1;
		for (let e of g) e.id in t && t[e.id] !== e.parentId && M("node-change", {
			id: e.id,
			node: { ...e },
			patch: { parentId: e.parentId },
			reparented: !0,
			history: !0
		});
	}
	let oa = null;
	function sa() {
		if (!oa) return;
		let { key: e } = oa;
		oa = null, K(e);
	}
	function K(e) {
		if (Ji) return;
		if (j) {
			oa = { key: oa ? null : e ?? null };
			return;
		}
		let t = ia();
		e != null && e === Yi && qi >= 0 ? Ki[qi] = t : (Ki = Ki.slice(0, qi + 1), Ki.push(t), qi = Ki.length - 1, Ki.length > 100 && (Ki.shift(), qi--)), Yi = e ?? null, ma();
	}
	function ca() {
		Ki = [ia()], qi = 0, Yi = null, ma();
	}
	function la() {
		return qi > 0;
	}
	function ua() {
		return qi >= 0 && qi < Ki.length - 1;
	}
	function da() {
		if (!oa) return;
		let { key: e } = oa;
		oa = null;
		let t = j;
		j = null, K(e), j = t;
	}
	function fa() {
		da(), la() && (qi--, Yi = null, aa(Ki[qi]), ma());
	}
	function pa() {
		da(), ua() && (qi++, Yi = null, aa(Ki[qi]), ma());
	}
	function ma() {
		$(), M("history-change", {
			canUndo: la(),
			canRedo: ua()
		});
	}
	function q() {
		if (m.persist) try {
			localStorage.setItem(m.storageKey, JSON.stringify(Object.assign(Xi(), {
				zoom: h.zoom,
				panX: h.panX,
				panY: h.panY,
				editMode: h.editMode,
				showLegend: h.showLegend,
				manualOffsets: v,
				edgeWaypoints: y,
				edgeAnchors: b,
				familyRouteOverrides: x,
				nodeOverrides: S,
				collapsed: g.filter((e) => e.collapsed).map((e) => e.id)
			})));
		} catch {}
	}
	function ha() {
		if (!m.persist) return;
		let e;
		try {
			e = JSON.parse(localStorage.getItem(m.storageKey) || "null");
		} catch {
			e = null;
		}
		if (!e || typeof e != "object") return;
		Zi(ea(e, "stored state")), [
			"zoom",
			"panX",
			"panY"
		].forEach((t) => {
			Number.isFinite(e[t]) && (h[t] = e[t]);
		}), h.zoom <= 0 && (h.zoom = 1), typeof e.editMode == "boolean" && (h.editMode = e.editMode && !m.readonly), typeof e.showLegend == "boolean" && (h.showLegend = e.showLegend);
		let t = ta(e, "stored state");
		if (v = t.manualOffsets, y = t.edgeWaypoints, b = t.edgeAnchors, x = t.familyRouteOverrides, S = t.nodeOverrides, Si(), $t(), en(), Array.isArray(e.collapsed)) {
			let e = new Set(t.collapsed.map(String));
			for (let t of g) t.collapsed = e.has(String(t.id));
		}
		Ie = !0;
	}
	function ga() {
		return m.storageKey + ".presets";
	}
	function _a() {
		try {
			return JSON.parse(localStorage.getItem(ga()) || "{}") || {};
		} catch {
			return {};
		}
	}
	function va(e) {
		try {
			localStorage.setItem(ga(), JSON.stringify(e));
		} catch {}
	}
	function ya(e) {
		let t = {
			full: e !== !1,
			view: Xi()
		};
		return t.full && (t.layout = {
			manualOffsets: G(v),
			edgeWaypoints: G(y),
			edgeAnchors: G(b),
			familyRouteOverrides: G(x),
			nodeOverrides: G(S),
			collapsed: g.filter((e) => e.collapsed).map((e) => e.id)
		}), t;
	}
	function ba(e) {
		return ya(!(e && e.full === !1));
	}
	function xa(e) {
		if (!e) return Promise.resolve(!1);
		let { layout: t, problems: n } = ge(e);
		if ($i("layout", n), !t) return Promise.resolve(!1);
		if (Qi(t.view, "layout"), t.full) {
			v = t.layout.manualOffsets, y = t.layout.edgeWaypoints, b = t.layout.edgeAnchors, x = t.layout.familyRouteOverrides, S = t.layout.nodeOverrides, Si(), en(), ra();
			let e = new Set(t.layout.collapsed.map(String));
			for (let t of g) t.collapsed = e.has(String(t.id));
			Ie = !0;
		} else v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null);
		h.selectedNodeId = null, h.selectedEdgeId = null, h.selectedFamilyId = null, L.innerHTML = "", _t.innerHTML = "";
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		for (let e in O) O[e].remove(), delete O[e];
		Cn(), $();
		let r = V("preset");
		return z.classList.contains("loc-open") && Ui(), r.then((e) => {
			e && Ln();
		}), K(), M("settings-change", Pi()), r;
	}
	function Sa() {
		let e = _a();
		return Object.keys(e).map((t) => ({
			name: t,
			full: !!e[t].full,
			savedAt: e[t].savedAt || null
		}));
	}
	function Ca() {
		return _a();
	}
	function wa(e, t) {
		if (e = String(e ?? "").trim(), !e) return null;
		let n = ya(!(t && t.full === !1));
		n.name = e, n.savedAt = Date.now();
		let r = _a();
		return r[e] = n, va(r), z.classList.contains("loc-open") && Ui(), M("presets-change", { presets: Sa() }), n;
	}
	function Ta(e) {
		let t = _a()[String(e)];
		return t ? (xa(t), M("preset-load", {
			name: String(e),
			preset: t
		}), !0) : !1;
	}
	function Ea(e) {
		let t = _a();
		return String(e) in t && (delete t[String(e)], va(t), z.classList.contains("loc-open") && Ui(), M("presets-change", { presets: Sa() }), !0);
	}
	function Da(e) {
		let t = he(h, g, v, y);
		return t.editMode = h.editMode, t.edgeAnchors = b, t.familyRouteOverrides = x, t.nodeOverrides = S, t.settings = Pi(), e !== !1 && Va(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
	}
	let Oa = document.createElement("canvas").getContext("2d");
	function ka(e, t) {
		return Oa.font = t, Oa.measureText(e).width;
	}
	function Aa(e) {
		let t = E[e.id];
		if (!t) return 1;
		let n = parseFloat(t.style.getPropertyValue("--loc-fit"));
		return isFinite(n) && n > 0 ? n : 1;
	}
	function ja(e) {
		return e ??= 0, He && Object.keys(v).length === 0 ? {
			x: He.x - e,
			y: He.y - e,
			w: He.w + e * 2,
			h: He.h + e * 2
		} : ce(w, v, e);
	}
	function Ma() {
		let e = [];
		for (let t in D) e.push({
			id: t,
			d: D[t].getAttribute("d")
		});
		return e;
	}
	function Na(e) {
		return fe(w, v, Ma(), e);
	}
	function Pa(e, t) {
		let n = Ma();
		return xe(w, n, {
			manualOffsets: v,
			raster: !!e,
			measureText: ka,
			fitOf: Aa,
			photoHeight: h.photoHeight,
			photoContain: h.photoContain,
			virtualPhotoFrame: {
				width: h.photoFrameWidth,
				height: h.photoFrameHeight
			},
			renderedImage: {
				width: h.photoImageWidth,
				height: h.photoImageHeight,
				fit: h.photoContain ? "contain" : "cover",
				align: "center",
				offsetX: h.photoOffsetX,
				offsetY: h.photoOffsetY
			},
			photoBackground: h.photoBackground,
			images: t || null,
			familyNetworks: Be,
			rebuildFamilyIds: hn(),
			bounds: fe(w, v, n, 40)
		});
	}
	function Fa(e) {
		return new Promise((t) => {
			let n = new Image(), r = !1, i = (e, n) => {
				r || (r = !0, clearTimeout(o), t({
					data: e,
					failure: n
				}));
			}, a = Number.isFinite(+m.exportPhotoTimeout) && +m.exportPhotoTimeout > 0 ? +m.exportPhotoTimeout : 8e3, o = setTimeout(() => {
				n.onload = null, n.onerror = null, n.src = "", i(null, "timed out");
			}, a);
			n.crossOrigin = "anonymous", n.referrerPolicy = "no-referrer", n.onload = () => {
				try {
					let e = n.naturalWidth || n.width, t = n.naturalHeight || n.height;
					if (!e || !t) {
						i(null, "empty image");
						return;
					}
					let r = document.createElement("canvas");
					r.width = e, r.height = t, r.getContext("2d").drawImage(n, 0, 0), i(r.toDataURL("image/png"));
				} catch {
					i(null, "blocked by CORS");
				}
			}, n.onerror = () => i(null, "failed to load"), n.src = e;
		});
	}
	function Ia() {
		if (!h.showImages) return Promise.resolve({});
		let e = [], t = /* @__PURE__ */ new Set();
		for (let n of g) {
			let r = n.type !== "department" && n.data && n.data.photo_url;
			r && typeof r == "string" && !t.has(r) && (t.add(r), e.push(r));
		}
		return e.length ? Promise.all(e.map((e) => Fa(e).then((t) => [e, t]))).then((e) => {
			let t = {}, n = [];
			for (let [r, i] of e) i.data ? t[r] = i.data : n.push(`${r} (${i.failure})`);
			return n.length && console.warn(`local-org-chart: export used placeholders for ${n.length} photo(s): ${n.join(", ")}`), t;
		}) : Promise.resolve({});
	}
	function La() {
		return Ia().then((e) => {
			let t = Pa(!1, e);
			return Va(new Blob([t], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), t;
		});
	}
	function Ra(e) {
		return e ||= 3, Ia().then((t) => new Promise((n) => {
			let r = Na(40), i = 16e3, a = 2e8, o = Math.min(e, i / r.w, i / r.h);
			r.w * o * r.h * o > a && (o = Math.sqrt(a / (r.w * r.h))), o = Math.max(.05, o);
			let s = URL.createObjectURL(new Blob([Pa(!0, t)], { type: "image/svg+xml;charset=utf-8" })), c = new Image();
			c.onload = () => {
				let e = document.createElement("canvas");
				e.width = Math.round(r.w * o), e.height = Math.round(r.h * o);
				let t = e.getContext("2d");
				t.setTransform(o, 0, 0, o, 0, 0), t.drawImage(c, 0, 0), URL.revokeObjectURL(s);
				try {
					e.toBlob((e) => {
						e && Va(e, "org-chart.png"), n(!!e);
					}, "image/png");
				} catch {
					n(!1);
				}
			}, c.onerror = () => {
				URL.revokeObjectURL(s), n(!1);
			}, c.src = s;
		}));
	}
	function za(e) {
		e ||= {};
		let t = +e.scale > 0 ? +e.scale : 2, n = typeof e.quality == "number" ? Math.min(1, Math.max(.3, e.quality)) : .82, r = +e.maxSide > 0 ? +e.maxSide : 4e3, i = e.as === "dataURL" || e.as === "dataurl", a = e.filename || "org-chart.webp";
		return Ia().then((o) => new Promise((s) => {
			let c = Na(40), l = 2e8, u = Math.min(t, r / c.w, r / c.h);
			c.w * u * c.h * u > l && (u = Math.sqrt(l / (c.w * c.h))), u = Math.max(.05, u);
			let d = URL.createObjectURL(new Blob([Pa(!0, o)], { type: "image/svg+xml;charset=utf-8" })), ee = new Image();
			ee.onload = () => {
				let t = document.createElement("canvas");
				t.width = Math.round(c.w * u), t.height = Math.round(c.h * u);
				let r = t.getContext("2d");
				r.setTransform(u, 0, 0, u, 0, 0), r.drawImage(ee, 0, 0), URL.revokeObjectURL(d);
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
						t && e.download && Va(t, a), s(t || null);
					}, "image/webp", n);
				} catch {
					s(null);
				}
			}, ee.onerror = () => {
				URL.revokeObjectURL(d), s(null);
			}, ee.src = d;
		}));
	}
	function Ba() {
		let e = null;
		try {
			e = window.open("", "_blank");
		} catch {
			e = null;
		}
		if (!e) return Promise.resolve(!1);
		let t = e.document;
		t.open(), t.write("<!doctype html><html><head><meta charset=\"utf-8\"><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;font:14px system-ui,sans-serif;}img{display:block;width:100%;height:auto;}p{margin:24px;color:#475467;}</style></head><body><p data-role=\"status\">Preparing the chart for printing…</p></body></html>"), t.close();
		let n = () => t.querySelector("[data-role=\"status\"]");
		return Ia().then((r) => new Promise((i) => {
			if (e.closed) {
				i(!1);
				return;
			}
			let a = URL.createObjectURL(new Blob([Pa(!0, r)], { type: "image/svg+xml;charset=utf-8" })), o = t.createElement("img");
			o.alt = "Organization chart", o.onload = () => {
				let t = n();
				t && t.remove(), setTimeout(() => {
					try {
						e.focus(), e.print();
					} catch {}
					setTimeout(() => URL.revokeObjectURL(a), De), i(!0);
				}, 350);
			}, o.onerror = () => {
				URL.revokeObjectURL(a);
				let e = n();
				e && (e.textContent = "The chart could not be prepared for printing."), i(!1);
			}, o.src = a, t.body.appendChild(o);
		})).catch((e) => {
			let t = n();
			return t && (t.textContent = "The chart could not be prepared for printing."), console.warn("local-org-chart: PDF export failed", e), !1;
		});
	}
	function Va(e, t) {
		let n = URL.createObjectURL(e), r = document.createElement("a");
		r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), setTimeout(() => URL.revokeObjectURL(n), De);
	}
	function Ha(e, t, n) {
		let r = !(n && n.resetEdits);
		g = na(e || [], t ? "imported nodes" : "nodes"), _ = a(g), r || (v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null), S = Object.create(null)), h.selectedNodeId = null, h.selectedEdgeId = null, h.selectedFamilyId = null, Ke = /* @__PURE__ */ new Set(), ui();
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		for (let e in O) O[e].remove(), delete O[e];
		if (t) Ua(t);
		else if (r) for (let e of Object.keys(S)) {
			let t = S[e];
			t.__new || (e in _ ? "parentId" in t && (delete t.parentId, Object.keys(t).length || delete S[e]) : delete S[e]);
		}
		$t(), (r || t) && Si(), en(), ra(), oi(), $();
		let i = V("set-nodes");
		return m.fitOnInit && i.then((e) => {
			e && Mn();
		}), i;
	}
	function Ua(e) {
		let t = {};
		for (let n of [
			"orientation",
			"subtreeMode",
			"spacingX",
			"spacingY"
		]) e[n] != null && (t[n] = e[n]);
		Zi(ea(Object.assign(t, e.settings || {}), "imported settings"));
		let n = ta(e, "imported layout");
		v = n.manualOffsets, y = n.edgeWaypoints, b = n.edgeAnchors, x = n.familyRouteOverrides, S = n.nodeOverrides, typeof e.editMode == "boolean" && (h.editMode = e.editMode && !m.readonly);
		let r = Math.max(100, h.cardWidth), i = Math.max(60, h.photoHeight + h.textHeight);
		for (let e of g) {
			let t = Fe[e.id];
			if (!t) continue;
			let n = e.type === "department";
			t.width === (n ? h.departmentWidth : r) && delete t.width, t.height === (n ? h.departmentHeight : i) && delete t.height, !t.width && !t.height && delete Fe[e.id];
		}
		Ie = !0;
	}
	function Wa(e) {
		let { nodes: n, meta: r } = t(e);
		return Ha(n, r || {}), n.length;
	}
	function Ga(e) {
		let t = Me(e);
		h.orientation = t, v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null), U(), Ir(), $();
		let n = V("orientation");
		return n.then((e) => {
			e && Ln();
		}), M("orientation-change", { orientation: t }), K(), n;
	}
	function Ka(e) {
		h.subtreeMode = e, v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null), U(), Ir(), $();
		let t = V("subtree-mode");
		return t.then((e) => {
			e && Ln();
		}), M("subtree-mode-change", { subtreeMode: e }), K(), t;
	}
	function qa(e, t) {
		let n = ea({
			spacingX: e ?? void 0,
			spacingY: t ?? void 0
		}, "spacing");
		"spacingX" in n && (h.spacingX = n.spacingX), "spacingY" in n && (h.spacingY = n.spacingY);
		let r = V("spacing");
		return M("settings-change", Pi()), K("spacing"), r;
	}
	function Ja(e, t) {
		if (e in h) {
			let n = h[e];
			if (typeof n == "number" && !(typeof t == "number" && Number.isFinite(t)) || typeof n == "boolean" && typeof t != "boolean") {
				$i("option", [`${e} ${JSON.stringify(t)}`]);
				return;
			}
			if (e === "editMode" && t && si("setOption")) return;
			if (e === "orientation" || e === "subtreeMode") {
				let n = ea({ [e]: t }, "option");
				if (!(e in n)) return;
				t = n[e];
			}
			h[e] = t, e === "showGrid" && Cn(), e === "alignGrid" && (v = Object.create(null), V("align-grid")), $(), q(), [
				"showGrid",
				"snapGrid",
				"alignGrid",
				"gridSize"
			].includes(e) && M("settings-change", Pi());
		} else m[e] = t, e !== "targetAspect" && e !== "targetSize" || h.subtreeMode !== "AutoSmart" && h.subtreeMode !== "GridSmart" && h.subtreeMode !== "Auto" || V("target-size").then((e) => {
			e && Ln();
		});
	}
	function Ya(e) {
		return Ja("showGrid", !!e), h.showGrid;
	}
	function Xa(e) {
		return Ja("snapGrid", !!e), h.snapGrid;
	}
	function Za(e) {
		return Ja("alignGrid", !!e), h.alignGrid;
	}
	function Qa(e) {
		return Ya(e ?? !h.showGrid);
	}
	function $a(e) {
		return h.autoEdgeSide = e == null ? !h.autoEdgeSide : !!e, U(), V("auto-edge-side"), z.classList.contains("loc-open") && Ui(), q(), M("settings-change", Pi()), h.autoEdgeSide;
	}
	function eo(e) {
		h.showImages = e == null ? !h.showImages : !!e;
		for (let e in E) E[e].remove(), delete E[e];
		return Qt(), $(), q(), M("settings-change", Pi()), h.showImages;
	}
	function to() {
		let e = Yt("relayout", { preserveManual: !0 });
		return U(), Ir(), e.then((e) => {
			e && Ln();
		}), M("relayout", { forced: !1 }), K(), e;
	}
	function no() {
		v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null), U(), Ir();
		let e = V("force-relayout");
		return e.then((e) => {
			e && Ln();
		}), M("relayout", { forced: !0 }), K(), e;
	}
	function ro() {
		Hn(), ui();
		let e = no();
		return e.then((e) => {
			e && Mn();
		}), e;
	}
	function io() {
		return document.fullscreenElement || document.webkitFullscreenElement || null;
	}
	function ao() {
		return io() === P;
	}
	function oo() {
		let e = P.requestFullscreen || P.webkitRequestFullscreen;
		if (e) try {
			let t = e.call(P);
			t && t.catch && t.catch(() => {});
		} catch {}
	}
	function so() {
		let e = document.exitFullscreen || document.webkitExitFullscreen;
		if (e && io()) try {
			e.call(document);
		} catch {}
	}
	function co(e) {
		let t = e == null ? !ao() : !!e;
		return t ? oo() : so(), t;
	}
	let lo = !1;
	function uo() {
		let e = ao();
		e !== lo && (lo = e, P.classList.toggle("loc-fullscreen", e), xt && (xt.title = e ? "Exit fullscreen" : "Fullscreen"), $(), Mn(), M("fullscreen-change", { fullscreen: e }));
	}
	function fo(e) {
		if (!We) return;
		if (Xn(e)) {
			po();
			return;
		}
		let t = kr(e.clientX, e.clientY), n = u(Mt()) ? t.y : t.x, r = Math.max(1, h.gridSize), i = Math.round((We.baseOffset + n - We.startCross) / r) * r;
		x[We.parentId]?.trunkOffset !== i && (x[We.parentId] = { trunkOffset: i }, We.changed = !0, M("family-route-change", {
			parentId: We.parentId,
			trunkOffset: i,
			pending: !0
		}));
	}
	function po() {
		let e = We;
		We = null, Q("pointermove", fo), Q("pointerup", po), e?.changed && (V("family-route"), q(), K(), M("family-route-change", {
			parentId: e.parentId,
			trunkOffset: x[e.parentId]?.trunkOffset,
			pending: !1
		}));
	}
	N(ht, "pointerdown", (e) => {
		let t = e.target.closest(".loc-node");
		t && $n(e, t.dataset.id);
	}), N(ht, "click", (e) => {
		let t = e.target.closest("[data-role=\"toggle\"]");
		if (t && !m.readonly) {
			Bn(t.closest(".loc-node").dataset.id);
			return;
		}
		let n = e.target.closest(".loc-node");
		n && (qe === String(n.dataset.id) ? (Wn(), e.preventDefault(), e.stopPropagation()) : M("node-click", {
			id: n.dataset.id,
			node: _[n.dataset.id]
		}));
	}), N(pt, "pointerdown", (e) => {
		let t = e.target.closest("path");
		t && (e.stopPropagation(), Pr(t.dataset.edge));
	}), N(mt, "pointerdown", (e) => {
		let t = e.target.closest("path");
		if (!t) return;
		e.stopPropagation(), e.preventDefault(), No();
		let n = String(t.dataset.family);
		if (Fr(n), m.readonly || !h.editMode) return;
		let r = Ve.find((e) => String(e.parentId) === n) || Be.find((e) => String(e.parentId) === n), i = T[n];
		if (!r?.trunk || !i) return;
		let a = kr(e.clientX, e.clientY), o = u(Mt());
		We = {
			parentId: n,
			startCross: o ? a.y : a.x,
			baseOffset: (o ? r.trunk.a.y : r.trunk.a.x) - (o ? i.cy : i.cx),
			changed: !1
		}, Z("pointermove", fo), Z("pointerup", po);
	}), N(pt, "dblclick", (e) => {
		if (m.readonly || !h.editMode) return;
		let t = e.target.closest("path");
		if (!t) return;
		let n = t.dataset.edge;
		Pr(n);
		let r = jr(n);
		if (!r) return;
		let i = Ar(kr(e.clientX, e.clientY));
		Mr(n).splice(ii(r, i), 0, i), bn(n), Vr(), q(), K(), nr("waypoint-add");
	}), N(L, "pointerdown", (e) => {
		if (m.readonly || !h.editMode) return;
		let t = e.target, n = h.selectedEdgeId;
		if (!n) return;
		if (t.dataset.ep) {
			e.stopPropagation(), e.preventDefault(), k = {
				id: n,
				kind: "ep",
				which: t.dataset.ep
			}, Z("pointermove", Jr), Z("pointerup", Yr);
			return;
		}
		let r, i = !1;
		if (t.dataset.wp != null) r = +t.dataset.wp;
		else if (t.dataset.add != null) {
			let a = +t.dataset.add;
			Mr(n).splice(a, 0, Ar(kr(e.clientX, e.clientY))), r = a, i = !0, bn(n);
		} else return;
		e.stopPropagation(), e.preventDefault(), k = {
			id: n,
			idx: r,
			changed: i
		}, Z("pointermove", mo), Z("pointerup", ho);
	}), N(L, "dblclick", (e) => {
		let t = e.target;
		if (t.dataset.ep === "parent") {
			Zr(h.selectedEdgeId);
			return;
		}
		if (t.dataset.wp == null) return;
		let n = h.selectedEdgeId, r = y[n];
		r && (r.splice(+t.dataset.wp, 1), r.length || delete y[n], bn(n), Vr(), q(), K(), nr("waypoint-remove"));
	});
	function mo(e) {
		if (!k) return;
		if (Xn(e)) {
			ho();
			return;
		}
		let t = y[k.id];
		t && (t[k.idx] = or(k.id, Ar(kr(e.clientX, e.clientY))), k.changed = !0, bn(k.id), Vr());
	}
	function ho() {
		let e = k;
		k = null, cr(), Q("pointermove", mo), Q("pointerup", ho), q(), e && e.changed && (K(), nr("waypoint-move"));
	}
	N(Ot, "click", (e) => {
		e.target.closest("[data-role=\"legend-close\"]") && ki(!1);
	}), N(R, "click", (e) => {
		if (e.target.closest("[data-role=\"panel-close\"]")) {
			ui();
			return;
		}
		if (e.target.closest("[data-role=\"add-child\"]")) {
			bi(h.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"detach\"]")) {
			Zr(h.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"attach\"]")) {
			let e = h.selectedNodeId;
			ui(), ei(e);
			return;
		}
		if (e.target.closest("[data-role=\"del-node\"]")) {
			xi(h.selectedNodeId);
			return;
		}
		let t = e.target.closest("[data-uidx]");
		if (t) {
			let e = t.closest("[data-role=\"user-results\"]"), n = e && e._users && e._users[+t.dataset.uidx];
			n && gi(n);
		}
	}), N(Ct, "input", (e) => {
		if (!h.editMode) return;
		let t = e.target.closest("[data-field]");
		if (!t) return;
		let n = h.selectedNodeId;
		if (!n) return;
		let r = t.dataset.field, i = t.value;
		if (r === "type") vi(n, { type: i }), di();
		else if (r !== "width" && r !== "height") {
			if (r === "photo_url") {
				let e = _[n];
				vi(n, { data: Object.assign({}, e.data, { photo_url: i || null }) });
			} else r === "layoutMode" ? vi(n, { layoutMode: i || null }) : (vi(n, { [r]: i }), r === "personName" && mi(i));
		}
	});
	function go(e) {
		if (!h.editMode || !e) return;
		let t = h.selectedNodeId, n = t && _[t];
		if (!n) return;
		let r = e.dataset.field;
		if (r !== "width" && r !== "height") return;
		let i = parseFloat(e.value);
		if (!Number.isFinite(i)) {
			e.value = n[r];
			return;
		}
		let a = Math.max(20, i);
		e.value = a, Number(n[r]) !== a && vi(t, { [r]: a });
	}
	N(Ct, "change", (e) => go(e.target.closest("[data-field]"))), N(Ct, "keydown", (e) => {
		let t = e.target.closest("[data-field=\"width\"], [data-field=\"height\"]");
		if (t && (e.key === "Enter" && (e.preventDefault(), go(t), t.blur()), e.key === "Escape")) {
			let e = h.selectedNodeId && _[h.selectedNodeId];
			e && (t.value = e[t.dataset.field]), t.blur();
		}
	}), N(z, "click", (e) => {
		if (e.target.closest("[data-role=\"settings-close\"]")) {
			Ii(!1);
			return;
		}
		if (e.target.closest("[data-role=\"reset-settings\"]")) {
			Li();
			return;
		}
		if (e.target.closest("[data-role=\"preset-save\"]")) {
			let e = (Dt.querySelector("[data-role=\"preset-name\"]") || {}).value || "", t = !!(Dt.querySelector("[data-role=\"preset-full\"]") || {}).checked;
			e.trim() && wa(e, { full: t });
			return;
		}
		let t = e.target.closest("[data-role=\"preset-apply\"]");
		if (t) {
			Ta(t.dataset.name);
			return;
		}
		let n = e.target.closest("[data-role=\"preset-del\"]");
		if (n) {
			Ea(n.dataset.name);
			return;
		}
		if (e.target.closest("[data-role=\"add-rule\"]")) {
			Le.push(ye({
				field: "type",
				value: "",
				style: {}
			})), Ui(), Ei(), q(), M("settings-change", Pi());
			return;
		}
		let r = e.target.closest("[data-rk=\"remove\"]");
		r && (Le.splice(+r.dataset.rule, 1), Ui(), Ei(), q(), M("settings-change", Pi()));
	}), N(Dt, "input", (e) => {
		let t = e.target;
		if (t.dataset.set != null) {
			let e = t.dataset.set, n = parseFloat(t.value), r = Dt.querySelector(`[data-rangelabel="${e}"]`);
			r && (r.textContent = n);
		} else if (t.dataset.setToggle === "showImages") eo(t.checked);
		else if (t.dataset.setToggle === "autoEdgeSide") $a(t.checked);
		else if (t.dataset.setToggle === "photoContain") nn({ contain: t.checked });
		else if (t.dataset.rule != null) {
			let e = +t.dataset.rule, n = t.dataset.rk, r = Le[e];
			if (!r) return;
			if (n === "enabled") r.enabled = t.checked;
			else if (n === "field") r.field = t.value;
			else if (n === "value") r.value = t.value;
			else if (n === "bg" || n === "text" || n === "border") Wi(e, n) && _e(t.value) && (r.style[n] = t.value);
			else if (/-on$/.test(n)) {
				let i = n.replace("-on", ""), a = Gi(e, i);
				r.style[i] = t.checked ? _e(a) ? a : "#e0524d" : "";
			}
			Ei(), M("settings-change", Pi()), q();
		}
	}), N(Dt, "change", (e) => {
		let t = e.target;
		if (t.dataset.set == null) return;
		let n = t.dataset.set, r = parseFloat(t.value);
		Number.isFinite(r) && (n === "cardWidth" ? nn({ width: r }) : n === "photoHeight" ? nn({ photoHeight: r }) : Number(h[n]) !== r && (h[n] = r, V("settings-" + n), M("settings-change", Pi()), q()));
	});
	let J = /* @__PURE__ */ new Map(), Y = null, X = null, _o = 0;
	function vo() {
		_o &&= (clearTimeout(_o), 0), I.classList.add("loc-gesturing");
	}
	function yo() {
		_o && clearTimeout(_o), _o = setTimeout(() => {
			_o = 0, !(Y && Y.moved || X) && (I.classList.remove("loc-gesturing"), q());
		}, 150);
	}
	function bo(e) {
		return !!(e && e.closest && (e.closest(".loc-panel") || e.closest(".loc-settings") || e.closest(".loc-fsbtn") || e.closest(".loc-legend")));
	}
	function xo() {
		gr(), h.selectedEdgeId && U(), h.selectedFamilyId && Ir(), br(), $r && ti(), ui();
	}
	function So(e, t) {
		Y || Co(e.pointerId, e.clientX, e.clientY, !1, t);
	}
	function Co(e, t, n, r, i = {}) {
		Y = {
			pointerId: e,
			sx: t,
			sy: n,
			px: h.panX,
			py: h.panY,
			moved: r,
			nodeId: i.nodeId || null,
			clearOnClick: !!i.clearOnClick
		}, (!Y.nodeId || r) && I.classList.add("loc-panning"), r && vo(), Z("pointermove", wo), Z("pointerup", Eo), Z("pointercancel", Do);
	}
	function wo(e) {
		if (!Y || e.pointerId !== Y.pointerId || X) return;
		if (Xn(e)) {
			To(!0);
			return;
		}
		let t = e.clientX - Y.sx, n = e.clientY - Y.sy;
		if (!Y.moved) {
			if (Math.abs(t) + Math.abs(n) <= 4) return;
			Y.moved = !0, I.classList.add("loc-panning"), vo(), Yn(Y.pointerId);
		}
		h.panX = Y.px + t, h.panY = Y.py + n, xn();
	}
	function To(e) {
		let t = Y;
		t && (Y = null, Q("pointermove", wo), Q("pointerup", Eo), Q("pointercancel", Do), I.classList.remove("loc-panning"), Zn(), t.moved ? (t.nodeId && Gn(t.nodeId), yo()) : e || (t.nodeId ? Qn(t.nodeId) : t.clearOnClick && xo()));
	}
	function Eo(e) {
		Y && e.pointerId === Y.pointerId && To(!1);
	}
	function Do(e) {
		Y && e.pointerId === Y.pointerId && To(!0);
	}
	N(I, "pointerdown", (e) => {
		let t = e.target;
		if (!bo(t)) {
			if (e.button === 1) {
				if (!m.enablePan || Y) return;
				e.preventDefault(), No(), So(e, {});
			} else e.button != null && e.button !== 0 || t.closest(".loc-node") || t.closest(".loc-edgehits path") || t.closest(".loc-edgehandles *") || (No(), e.altKey ? Er(e) : e.ctrlKey || e.metaKey ? _r(e) : m.enablePan ? So(e, { clearOnClick: !0 }) : xo());
		}
	}), N(I, "pointerdown", (e) => {
		e.pointerType !== "touch" || bo(e.target) || (J.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		}), !(J.size < 2) && (e.stopPropagation(), J.size === 2 && m.enableZoom && !X && Oo()));
	}, !0);
	function Oo() {
		if (A) {
			if (A.moved) return;
			rr();
		}
		let [e, t] = [...J.values()], n = I.getBoundingClientRect(), r = An();
		X = {
			dist: Math.hypot(e.x - t.x, e.y - t.y) || 1,
			zoom: h.zoom,
			px: h.panX,
			py: h.panY,
			mx: (e.x + t.x) / 2 - n.left,
			my: (e.y + t.y) / 2 - n.top,
			floor: Math.min(wn, r ?? wn, h.zoom),
			ceil: Math.max(Pe(), h.zoom)
		}, Y && (Y.moved = !0), I.classList.remove("loc-panning"), vo();
	}
	function ko(e) {
		if (!J.has(e.pointerId) || (J.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		}), !X || J.size < 2)) return;
		let [t, n] = [...J.values()], r = I.getBoundingClientRect(), i = (t.x + n.x) / 2 - r.left, a = (t.y + n.y) / 2 - r.top, o = X.zoom * ((Math.hypot(t.x - n.x, t.y - n.y) || 1) / X.dist), s = Math.min(X.ceil, Math.max(X.floor, o)), c = (X.mx - X.px) / X.zoom, l = (X.my - X.py) / X.zoom;
		h.zoom = s, h.panX = i - c * s, h.panY = a - l * s, xn();
	}
	function Ao(e) {
		if (J.delete(e.pointerId) && !(!X || J.size >= 2)) {
			if (X = null, J.size === 1 && m.enablePan) {
				let [[e, t]] = [...J.entries()];
				Y ? (Y.pointerId = e, Y.sx = t.x, Y.sy = t.y, Y.px = h.panX, Y.py = h.panY, Y.moved = !0) : Co(e, t.x, t.y, !0);
			}
			yo();
		}
	}
	Z("pointermove", ko), Z("pointerup", Ao), Z("pointercancel", Ao);
	function jo(e, t) {
		return e ? t === 1 ? e * 40 : t === 2 ? e * (I.clientHeight || 800) : e : 0;
	}
	N(I, "wheel", (e) => {
		if (!m.enableZoom || bo(e.target)) return;
		let t = jo(e.deltaY, e.deltaMode), n = jo(e.deltaX, e.deltaMode);
		if (t || n) {
			if (e.preventDefault(), vo(), !t) m.enablePan && (h.panX -= n, xn());
			else {
				let n = e.ctrlKey ? .01 : .001;
				Pn(h.zoom * Math.min(2, Math.max(.5, Math.exp(-t * n))), e.clientX, e.clientY);
			}
			yo();
		}
	}, { passive: !1 });
	function Mo(e) {
		let t = e && (e.nodeType === 1 ? e : e.parentElement);
		return !t || !t.closest ? !1 : !!(t.closest(".loc-panel") || t.closest(".loc-settings") || t.closest(".loc-legend") || t.closest("input, textarea, select, [contenteditable=\"true\"]"));
	}
	N(I, "selectstart", (e) => {
		Mo(e.target) || e.preventDefault();
	}), N(I, "dragstart", (e) => {
		Mo(e.target) || e.preventDefault();
	}), N(I, "scroll", () => {
		(I.scrollLeft || I.scrollTop) && (I.scrollLeft = 0, I.scrollTop = 0);
	});
	function Z(e, t) {
		window.addEventListener(e, t), rt.push({
			target: window,
			type: e,
			fn: t
		});
	}
	function Q(e, t) {
		window.removeEventListener(e, t);
		let n = rt.findIndex((n) => n.target === window && n.type === e && n.fn === t);
		n !== -1 && rt.splice(n, 1);
	}
	function No() {
		try {
			P.focus({ preventScroll: !0 });
		} catch {}
	}
	N(P, "keydown", (e) => {
		let t = e.target;
		if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
		let n = (e.key || "").toLowerCase();
		if (t === P && !(e.ctrlKey || e.metaKey || e.altKey) && (n.startsWith("arrow") || n === "home")) {
			let t = Po || h.selectedNodeId || jn() && jn().node.id;
			if (t && E[t]) {
				e.preventDefault(), Ro(t, !0);
				return;
			}
		}
		if (e.ctrlKey || e.metaKey) n === "z" && !e.shiftKey ? (e.preventDefault(), fa()) : (n === "z" && e.shiftKey || n === "y") && (e.preventDefault(), pa());
		else {
			if (h.selectedFamilyId && (n === "delete" || n === "backspace")) {
				e.preventDefault(), Lr();
				return;
			}
			if (h.selectedFamilyId && n === "escape") {
				e.preventDefault(), Ir();
				return;
			}
			if (H.size && (n === "delete" || n === "backspace")) {
				e.preventDefault(), Sr();
				return;
			}
			if (n === "escape" && H.size) {
				e.preventDefault(), br();
				return;
			}
		}
	});
	let Po = null;
	function Fo(e) {
		return e.type === "department" ? e.label || "" : [
			e.label,
			e.personName,
			e.status ? Di[e.status] || e.status : ""
		].filter(Boolean).join(", ");
	}
	function Io() {
		let e = Object.create(null);
		for (let t of g) {
			let n = 0, r = t.parentId;
			for (; r && _[r] && n <= g.length;) n++, r = _[r].parentId;
			e[t.id] = n;
		}
		return e;
	}
	function Lo() {
		let e = Io(), t = Object.create(null);
		for (let e of g) e.parentId && (t[e.parentId] = (t[e.parentId] || 0) + 1);
		if (!Po || !E[Po]) {
			let e = jn();
			Po = h.selectedNodeId && E[h.selectedNodeId] ? h.selectedNodeId : e ? e.node.id : null;
		}
		for (let n of w) {
			let r = n.node, i = E[r.id];
			if (!i) continue;
			let a = r.id === Po ? 0 : -1;
			i.setAttribute("role", "treeitem"), i.setAttribute("aria-level", String((e[r.id] || 0) + 1)), i.setAttribute("aria-label", Fo(r)), i.setAttribute("aria-selected", C.has(r.id) ? "true" : "false"), t[r.id] ? i.setAttribute("aria-expanded", r.collapsed ? "false" : "true") : i.removeAttribute("aria-expanded"), i.tabIndex !== a && (i.tabIndex = a);
			let o = i.querySelector("[data-role=\"toggle\"]");
			o && (o.tabIndex = a, t[r.id] ? o.setAttribute("aria-expanded", r.collapsed ? "false" : "true") : o.removeAttribute("aria-expanded"), m.readonly ? o.setAttribute("aria-disabled", "true") : o.removeAttribute("aria-disabled"));
		}
	}
	function Ro(e, t) {
		let n = e != null && E[e];
		if (!n) return;
		let r = Po != null && E[Po];
		if (r && r !== n) {
			r.tabIndex = -1;
			let e = r.querySelector("[data-role=\"toggle\"]");
			e && (e.tabIndex = -1);
		}
		Po = e, n.tabIndex = 0;
		let i = n.querySelector("[data-role=\"toggle\"]");
		if (i && (i.tabIndex = 0), t) {
			try {
				n.focus({ preventScroll: !0 });
			} catch {}
			zo(e);
		}
	}
	function zo(e) {
		let t = Or(e);
		if (!t || !On()) return;
		let n = I.getBoundingClientRect();
		(t.left < n.left || t.top < n.top || t.right > n.right || t.bottom > n.bottom) && Nn(e);
	}
	function Bo(e) {
		let t = h.orientation === "LeftToRight" || h.orientation === "RightToLeft";
		return e.slice().sort((e, n) => t ? e.cy - n.cy || e.cx - n.cx : e.cx - n.cx || e.cy - n.cy);
	}
	function Vo(e, t) {
		let n = _[e];
		if (!n) return null;
		let r = (e) => !e.node.parentId || !T[e.node.parentId];
		if (t === "ArrowUp") return n.parentId && T[n.parentId] ? n.parentId : null;
		if (t === "Home") {
			let e = jn();
			return e ? e.node.id : null;
		}
		if (t === "ArrowDown") {
			if (n.collapsed) return null;
			let t = Bo(w.filter((t) => t.node.parentId === e));
			return t.length ? t[0].node.id : null;
		}
		let i = Bo(w.filter((e) => T[n.parentId] ? e.node.parentId === n.parentId : r(e))), a = i.findIndex((t) => t.node.id === e), o = t === "ArrowRight" ? i[a + 1] : i[a - 1];
		return o ? o.node.id : null;
	}
	N(ht, "keydown", (t) => {
		let n = t.target.closest && t.target.closest(".loc-node");
		if (!n || t.ctrlKey || t.metaKey || t.altKey) return;
		let r = n.dataset.id, i = _[r];
		if (!i) return;
		let a = !!t.target.closest("[data-role=\"toggle\"]"), o = t.key;
		if (o === "Enter" || o === " " || o === "Spacebar") {
			if (a) return;
			t.preventDefault(), Qn(r), M("node-click", {
				id: r,
				node: i
			});
		} else if (o === "+" || o === "=" || o === "Add" || o === "-" || o === "_" || o === "Subtract") {
			let n = o === "+" || o === "=" || o === "Add";
			if (m.readonly || !e(g, r) || !!i.collapsed !== n) return;
			t.preventDefault(), Bn(r);
		} else if (o === "ArrowUp" || o === "ArrowDown" || o === "ArrowLeft" || o === "ArrowRight" || o === "Home") {
			t.preventDefault();
			let e = Vo(r, o);
			e && Ro(e, !0);
		}
	});
	let Ho = -Infinity;
	N(I, "pointerdown", () => {
		Ho = performance.now();
	}, !0), N(ht, "focusin", (e) => {
		let t = e.target.closest && e.target.closest(".loc-node");
		if (!t) return;
		let n = t.dataset.id;
		n !== Po && Ro(n, !1), performance.now() - Ho > 500 && zo(n);
	});
	function Uo() {
		let e = m.toolbar && typeof m.toolbar == "object" ? m.toolbar : {}, t = (t) => t === "subtree" ? e[t] === !0 : e[t] !== !1, n = B("div", "loc-toolbar"), r = "";
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
		].map(([e, t]) => a("orient", e, t)).join(""))), t("history") && (r += i("", "<button type=\"button\" data-act=\"undo\" title=\"Undo (Ctrl+Z)\">Undo</button><button type=\"button\" data-act=\"redo\" title=\"Redo (Ctrl+Shift+Z)\">Redo</button>")), t("actions") && (r += i("", "<button type=\"button\" data-act=\"expand\">Expand</button><button type=\"button\" data-act=\"collapse\">Collapse</button><button type=\"button\" data-act=\"fit\">Fit</button><button type=\"button\" data-act=\"relayout\" title=\"Recalculate while preserving manual positions and routes\">Re-layout</button><button type=\"button\" data-act=\"reset\" title=\"Clear manual geometry and rebuild the chart\">Reset</button><button type=\"button\" data-act=\"fullscreen\" title=\"Toggle fullscreen\">Fullscreen</button>")), t("search") && (r += i("Search", "<input type=\"search\" data-role=\"search\" class=\"loc-search-input\" placeholder=\"Search…\" />")), t("grid") && (r += i("Grid", "<button type=\"button\" data-flag=\"showGrid\">Show</button><button type=\"button\" data-flag=\"snapGrid\">Snap</button><button type=\"button\" data-flag=\"alignGrid\">Align</button>")), t("mode") && (r += i("Mode", "<button type=\"button\" data-act=\"edit\" title=\"Toggle edit mode\">Edit</button><button type=\"button\" data-act=\"images\" title=\"Toggle photos / user icons\">Images</button><button type=\"button\" data-act=\"legend\" title=\"Toggle legend\">Legend</button><button type=\"button\" data-act=\"settings\" title=\"Settings &amp; theming\">Settings</button>")), t("export") && (r += i("Export", "<button type=\"button\" data-act=\"png\">PNG</button><button type=\"button\" data-act=\"svg\">SVG</button><button type=\"button\" data-act=\"pdf\">PDF</button><button type=\"button\" data-act=\"json\">JSON</button>")), n.innerHTML = r, n.addEventListener("click", (e) => {
			let t = e.target.closest("button");
			if (t) {
				if (t.dataset.mode) Ka(t.dataset.mode);
				else if (t.dataset.orient) Ga(t.dataset.orient);
				else if (t.dataset.flag) h[t.dataset.flag] = !h[t.dataset.flag], t.dataset.flag === "showGrid" ? Cn() : t.dataset.flag === "alignGrid" && (v = Object.create(null), V("align-grid")), $(), q();
				else switch (t.dataset.act) {
					case "undo":
						fa();
						break;
					case "redo":
						pa();
						break;
					case "expand":
						Rn();
						break;
					case "collapse":
						zn();
						break;
					case "fit":
						Mn();
						break;
					case "relayout":
						to();
						break;
					case "reset":
						ro();
						break;
					case "fullscreen":
						co();
						break;
					case "edit":
						ci(!h.editMode);
						break;
					case "images":
						eo();
						break;
					case "legend":
						Ai();
						break;
					case "settings":
						Ii();
						break;
					case "png":
						Ra(3);
						break;
					case "svg":
						La();
						break;
					case "pdf":
						Ba();
						break;
					case "json": Da(!0);
				}
			}
		}), n.addEventListener("input", (e) => {
			let t = e.target.closest("[data-role=\"search\"]");
			t && Vn(t.value);
		}), n;
		function i(e, t) {
			return `<div class="loc-group">${e ? `<span class="loc-label">${e}</span>` : ""}${t}</div>`;
		}
		function a(e, t, n) {
			return `<button type="button" data-${e}="${t}">${n}</button>`;
		}
	}
	function $() {
		F && (F.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === h.subtreeMode)), F.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === h.orientation)), F.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!h[e.dataset.flag])), F.querySelectorAll("button[data-act=\"edit\"]").forEach((e) => e.classList.toggle("loc-active", h.editMode)), F.querySelectorAll("button[data-act=\"images\"]").forEach((e) => e.classList.toggle("loc-active", h.showImages)), F.querySelectorAll("button[data-act=\"legend\"]").forEach((e) => e.classList.toggle("loc-active", h.showLegend)), F.querySelectorAll("button[data-act=\"fullscreen\"]").forEach((e) => e.classList.toggle("loc-active", ao())), F.querySelectorAll("button[data-act=\"undo\"]").forEach((e) => {
			e.disabled = !la();
		}), F.querySelectorAll("button[data-act=\"redo\"]").forEach((e) => {
			e.disabled = !ua();
		}));
	}
	N(document, "fullscreenchange", uo), N(document, "webkitfullscreenchange", uo);
	function Wo(e) {
		e && e.nodeType === 1 && (e.tagName === "BUTTON" && !e.getAttribute("type") && (e.type = "button"), e.querySelectorAll("button:not([type])").forEach((e) => {
			e.type = "button";
		}));
	}
	let Go = null;
	if (typeof MutationObserver < "u") {
		Go = new MutationObserver((e) => {
			for (let t of e) for (let e of t.addedNodes) Wo(e);
		});
		for (let e of /* @__PURE__ */ new Set([
			P,
			R,
			z,
			Ot
		])) Go.observe(e, {
			childList: !0,
			subtree: !0
		});
	}
	if ([
		P,
		R,
		z,
		Ot
	].forEach(Wo), ha(), $(), Cn(), Oi(), oi(), tt) {
		let e = V("initial");
		m.fitOnInit && e.then((e) => {
			e && Mn();
		});
	} else i(g) ? Xt(++Qe, "initial", n(i(g))) : (Nt(), Pt(), Ie = !1, et = Promise.resolve(!0), m.fitOnInit && Mn());
	ca(), typeof ResizeObserver < "u" && !m.targetSize && m.reflowOnResize && (Ze = I.clientWidth > 0 && I.clientHeight > 0 ? I.clientWidth / I.clientHeight : 0, Ye = new ResizeObserver(() => {
		if (h.subtreeMode !== "AutoSmart" && h.subtreeMode !== "GridSmart" && h.subtreeMode !== "Auto" || Object.keys(v).length || I.clientWidth <= 0 || I.clientHeight <= 0) return;
		let e = I.clientWidth / I.clientHeight;
		Ze && Math.abs(Math.log(e / Ze)) < .08 || (Ze = e, Xe && cancelAnimationFrame(Xe), Xe = requestAnimationFrame(() => {
			Xe = 0, V("resize").then((e) => {
				e && Mn();
			});
		}));
	}), Ye.observe(I));
	function Ko() {
		if (!at) {
			_o && (clearTimeout(_o), _o = 0, q()), Vt("destroyed"), Gt(), at = !0, rt.forEach(({ target: e, type: t, fn: n, optsL: r }) => e.removeEventListener(t, n, r)), rt.length = 0, Ge &&= (cancelAnimationFrame(Ge), 0), Wn(), Xe &&= (cancelAnimationFrame(Xe), 0), Dn &&= (cancelAnimationFrame(Dn), 0), Ye && Ye.disconnect(), En && En.disconnect(), Go && Go.disconnect(), fi && clearTimeout(fi), Zn(), A = null, Y = null, X = null, Tn = null, J.clear(), R.remove(), z.remove(), Ot.remove(), P.remove();
			for (let e in E) delete E[e];
			for (let e in D) delete D[e];
			for (let e in O) delete O[e];
			for (let e in it) delete it[e];
		}
	}
	let qo = {
		root: P,
		setNodes: Ha,
		loadJSON: Wa,
		setOrientation: Ga,
		setSubtreeMode: Ka,
		setSpacing: qa,
		setOption: Ja,
		setShowGrid: Ya,
		setSnapToGrid: Xa,
		setAlignToGrid: Za,
		toggleGrid: Qa,
		fitToScreen: Mn,
		zoomBy: Fn,
		relayout: to,
		forceRelayout: no,
		resetView: ro,
		expandAll: Rn,
		collapseAll: zn,
		toggleCollapse: Bn,
		centerOnNode: Nn,
		search: Vn,
		clearSearch: Hn,
		exportJSON: Da,
		exportSVG: La,
		exportPNG: Ra,
		exportWebP: za,
		exportPDF: Ba,
		buildSVG: Pa,
		setEditMode: ci,
		isEditMode: () => h.editMode,
		isReadonly: () => !!m.readonly,
		setShowImages: eo,
		isShowingImages: () => h.showImages,
		setShowLegend: ki,
		toggleLegend: Ai,
		isShowingLegend: () => h.showLegend,
		getLegendBody: () => At,
		setAutoEdgeSide: $a,
		isAutoEdgeSide: () => h.autoEdgeSide,
		setPhotoHeight: (e) => nn({ photoHeight: e }),
		setCardWidth: (e) => nn({ width: e }),
		setCardSize: nn,
		setPhotoRendering: nn,
		setPhotoContain: (e) => nn({ contain: e !== !1 }),
		getSelection: () => [...C],
		setSelection: (e) => hr(Array.isArray(e) ? e : e ? [e] : []),
		clearSelection: () => {
			gr(), fr();
		},
		getEdgeSelection: () => [...H],
		setEdgeSelection: xr,
		clearEdgeSelection: br,
		resetSelectedEdges: Sr,
		getFamilyRouteSelection: () => h.selectedFamilyId,
		getFamilyNetworks: () => G(Be),
		getFamilyRouteOverrides: () => G(x),
		setFamilyRouteOverride: Rr,
		resetFamilyRoute: Lr,
		enterFullscreen: oo,
		exitFullscreen: so,
		toggleFullscreen: co,
		isFullscreen: ao,
		undo: fa,
		redo: pa,
		canUndo: la,
		canRedo: ua,
		updateNode: vi,
		addChild: bi,
		deleteNode: xi,
		reparentNode: Xr,
		detachNode: Zr,
		attachNode: Qr,
		beginAttach: ei,
		cancelAttach: ti,
		isAttaching: () => !!$r,
		openInspector: li,
		closeInspector: ui,
		nodeScreenRect: Or,
		getSettings: Pi,
		setSettings: Fi,
		toggleSettings: Ii,
		resetSettings: Li,
		saveLayoutPreset: wa,
		loadLayoutPreset: Ta,
		deleteLayoutPreset: Ea,
		listLayoutPresets: Sa,
		getLayoutPresets: Ca,
		getLayout: ba,
		applyLayout: xa,
		getNodeHost: (e) => E[e] || null,
		getNodeSlotEl: (e) => E[e] ? E[e].querySelector(".loc-node-slot") : null,
		getInspectorBody: () => Ct,
		getSettingsBody: () => Dt,
		nodeThemeStyle: (e) => _[e] ? me(_[e], Le) : null,
		getState: () => ({
			...h,
			familyRouteOverrides: G(x)
		}),
		getNodes: () => g.map((e) => ({ ...e })),
		getPositioned: () => w,
		isLayoutBusy: () => $e,
		whenLayoutSettled: () => et,
		cancelLayout: () => Vt("cancelled"),
		on: ot,
		off: st,
		destroy: Ko
	}, Jo = /* @__PURE__ */ new Set([
		"getPositioned",
		"getNodes",
		"getSelection",
		"getEdgeSelection",
		"listLayoutPresets",
		"getFamilyNetworks"
	]);
	for (let e of Object.keys(qo)) {
		let t = qo[e];
		typeof t == "function" && e !== "destroy" && (qo[e] = function(...n) {
			return at ? e === "on" || e === "off" ? qo : e === "whenLayoutSettled" ? Promise.resolve(!1) : Jo.has(e) ? [] : !/^(is|can)[A-Z]/.test(e) && null : t.apply(this, n);
		});
	}
	return ot("layout-change", ir), qo;
}
export { Pe as t };
