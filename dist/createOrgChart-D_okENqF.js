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
	}, Fe = Object.create(null), g = $i(m.nodes || [], "nodes"), _ = a(g), v = Object.create(null), y = Object.create(null), b = Object.create(null), x = m.familyRouteOverrides ? Qi({ familyRouteOverrides: m.familyRouteOverrides }, "familyRouteOverrides option").familyRouteOverrides : Object.create(null), S = Object.create(null), C = /* @__PURE__ */ new Set(), Ie = !1, Le = [];
	{
		let e = m.settings && m.settings.themeRules || m.themeRules;
		e && Ji(Zi({ themeRules: e }, "themeRules option")), m.settings && Ji(Zi(m.settings, "settings option"));
	}
	let Re = qi(), ze = 0, w = [], T = Object.create(null), Be = [], Ve = [], He = null, E = Object.create(null), D = Object.create(null), O = Object.create(null), Ue = Object.create(null), k = null, We = null, A = null, Ge = 0, Ke = /* @__PURE__ */ new Set(), qe = null, Je = 0, Ye = null, Xe = 0, Ze = 0, Qe = 0, j = null, $e = !1, et = Promise.resolve(!0), tt = m.layoutWorker !== !1 && typeof Worker < "u", nt = null, rt = [], it = Object.create(null), at = !1;
	function ot(e, t) {
		return (it[e] || (it[e] = [])).push(t), Ko;
	}
	function st(e, t) {
		return it[e] && (it[e] = it[e].filter((e) => e !== t)), Ko;
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
	let F = m.toolbar ? Vo() : null;
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
		e.stopPropagation(), ao();
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
		P.classList.toggle("loc-horizontal", u(Mt())), Sn(), vn(), Qt(), xn(), Un(), h.showLegend && Ai(), Y(), M("layout-change", {
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
		}), e.resolve(!0), ia(), !0);
	}
	function Ut(e, t) {
		j && j.id === e.id && (j = null, Bt(!1), ia(), M("layout-error", {
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
		}), ia(), et;
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
			i.style.transform = `translate(${a.x - r.width / 2}px, ${a.y - r.height / 2}px)`, m.nodeSlots || (i.dataset.fitted || (t.push(i), i.dataset.fitted = "1"), Ci(i, r)), i.classList.toggle("loc-selected", C.has(r.id)), i.classList.toggle("loc-primary", h.selectedNodeId === r.id && C.size > 1), dn(i, r);
		}
		for (let t in E) e[t] || (E[t].remove(), delete E[t]);
		un(t), Fo(), M("nodes-rendered", { ids: w.map((e) => e.node.id) });
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
		Y(), M("settings-change", G());
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
		h.selectedFamilyId && !e[h.selectedFamilyId] && Fr();
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
			a || (a = fn("path"), a.setAttribute("class", "loc-logical-edge"), D[r.id] = a, ft.appendChild(a)), a.setAttribute("d", i), a.classList.toggle("loc-sel", h.selectedEdgeId === r.id), a.classList.toggle("loc-incident", _r(r));
			let o = O[r.id];
			o || (o = fn("path"), o.dataset.edge = r.id, O[r.id] = o, pt.appendChild(o)), o.setAttribute("d", i);
		}
		for (let t in D) e[t] || (D[t].remove(), delete D[t]);
		for (let t in O) e[t] || (O[t].remove(), delete O[t]);
		gn(t), _n(), vr(), h.selectedEdgeId && !e[h.selectedEdgeId] ? U() : Br();
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
		Number.isFinite(h.zoom) && h.zoom > 0 || (h.zoom = 1), Number.isFinite(h.panX) || (h.panX = 0), Number.isFinite(h.panY) || (h.panY = 0), ct.style.transform = `translate(${h.panX}px, ${h.panY}px) scale(${h.zoom})`, yt.textContent = Math.round(h.zoom * 100) + "%", h.selectedEdgeId && !k && Br();
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
		let e = re(Oa(0), I.clientWidth, I.clientHeight).zoom;
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
		let t = e || {}, n = I.clientWidth, r = I.clientHeight, i = Oa(0), a = re(i, n, r), o = a.zoom, s = a.panX, c = a.panY, l = Number(t.minZoom);
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
		return Number.isFinite(o) && o > 0 ? (h.zoom = o, h.panX = s, h.panY = c, xn(), Y(), !0) : !1;
	}
	function Nn(e) {
		let t = T[e];
		if (!t || !On()) return;
		let n = f(t, v);
		h.panX = I.clientWidth / 2 - n.x * h.zoom, h.panY = I.clientHeight / 2 - n.y * h.zoom, xn(), Y();
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
		return Y(), o;
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
		V("expand-all"), J();
	}
	function zn() {
		let t = ne(g, _);
		for (let n of g) n.collapsed = t[n.id] >= 1 && e(g, n.id) > 0;
		V("collapse-all"), J();
	}
	function Bn(e) {
		let t = _[e];
		t && (Zt(() => {
			t.collapsed = !t.collapsed;
		}), Er(), J());
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
			for (let t of e.groupIds) cr(t);
			lr(e.groupIds), M("node-drag", {
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
	function Xn() {
		if (qn == null) return;
		let e = qn;
		qn = null;
		try {
			I.hasPointerCapture && I.hasPointerCapture(e) && I.releasePointerCapture(e);
		} catch {}
	}
	function Zn(e) {
		_[e] && (U(), Fr(), C.has(e) ? (h.selectedNodeId = e, ur(), Er()) : fr(e), Io(e, !1), M("node-select", {
			id: e,
			node: _[e],
			rect: Dr(e)
		}), m.inspector && ci(e));
	}
	function Qn(e, t) {
		if (e.target.closest("[data-role=\"toggle\"]") || e.button === 1 || (e.stopPropagation(), e.button != null && e.button !== 0) || (jo(), Qr && ti(t))) return;
		if (!Jn()) {
			if (e.ctrlKey || e.metaKey) {
				U(), Fr(), pr(t);
				return;
			}
			if (m.enablePan) {
				bo(e, { nodeId: t });
				return;
			}
			Zn(t);
			return;
		}
		if (U(), Fr(), e.ctrlKey || e.metaKey) {
			pr(t);
			return;
		}
		C.has(t) ? (h.selectedNodeId = t, ur(), Er()) : fr(t), Io(t, !1), M("node-select", {
			id: t,
			node: _[t],
			rect: Dr(t)
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
		}), Q("pointermove", $n), Q("pointerup", er), Q("pointercancel", er);
	}
	function $n(e) {
		if (!A || Z || A.pointerId != null && e.pointerId != null && e.pointerId !== A.pointerId) return;
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
				let n = ir(A.id, e + r, t + i);
				r = n.cx - e, i = n.cy - t, or(n.gx, n.gy);
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
	function er(e) {
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
			}), Sn(), t = !!n.moved, t ? Gn(n.id) : m.inspector && (!e || e.type !== "pointercancel") && ci(n.id);
		}
		A = null, sr(), $("pointermove", $n), $("pointerup", er), $("pointercancel", er), Xn(), Y(), t && (J(), tr("node-drag"));
	}
	function tr(e) {
		M("layout-change", {
			positioned: w,
			familyNetworks: Be,
			mode: h.subtreeMode,
			orientation: h.orientation,
			reason: e,
			edit: !0
		});
	}
	function nr() {
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
				for (let t of e.groupIds) cr(t);
				lr(e.groupIds);
			}
			A = null, sr(), $("pointermove", $n), $("pointerup", er), $("pointercancel", er), Xn(), M("node-drag-end", {
				id: e.id,
				node: _[e.id],
				offset: v[e.id],
				group: e.groupIds,
				cancelled: !0
			});
		}
	}
	function rr() {
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
	function ir(e, t, n) {
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
	function ar(e, t) {
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
		return or(c, d), {
			x: u,
			y: te
		};
	}
	function or(e, t) {
		vt.innerHTML = "";
		let n = +gt.getAttribute("width") || 0, r = +gt.getAttribute("height") || 0, i = (e, t, n, r) => {
			let i = fn("line");
			i.setAttribute("x1", e), i.setAttribute("y1", t), i.setAttribute("x2", n), i.setAttribute("y2", r), i.setAttribute("class", "loc-align-line"), vt.appendChild(i);
		};
		e != null && i(e, 0, e, r), t != null && i(0, t, n, t);
	}
	function sr() {
		vt.innerHTML = "";
	}
	function cr(e) {
		let t = T[e], n = E[e];
		if (!t || !n) return;
		let r = f(t, v);
		n.style.transform = `translate(${r.x - t.node.width / 2}px, ${r.y - t.node.height / 2}px)`;
	}
	function lr(e) {
		let t = new Set((e || []).map(String)), n = /* @__PURE__ */ new Set();
		for (let e of t) {
			let t = T[e];
			t && T[t.node.parentId] && n.add(String(e));
		}
		for (let e of w) t.has(String(e.node.parentId)) && n.add(String(e.node.id));
		let r = !1;
		for (let e of n) r = yn(e) || r;
		r && (gn(), _n()), h.selectedEdgeId && Br();
	}
	function ur() {
		for (let e in E) E[e].classList.toggle("loc-selected", C.has(e)), E[e].classList.toggle("loc-primary", h.selectedNodeId === e && C.size > 1), E[e].setAttribute("aria-selected", C.has(e) ? "true" : "false");
	}
	function dr() {
		M("selection-change", {
			ids: [...C],
			primary: h.selectedNodeId
		});
	}
	function fr(e) {
		C = new Set(e ? [e] : []), h.selectedNodeId = e || null, ur(), Er();
	}
	function pr(e) {
		C.has(e) ? (C.delete(e), h.selectedNodeId === e && (h.selectedNodeId = C.size ? [...C][C.size - 1] : null)) : (C.add(e), h.selectedNodeId = e), ur(), Er(), dr();
	}
	function mr(e, t) {
		C = new Set(e), h.selectedNodeId = t ?? (e.length ? e[e.length - 1] : null), ur(), Er(), dr();
	}
	function hr() {
		C = /* @__PURE__ */ new Set(), h.selectedNodeId = null, ur(), Er();
	}
	function gr(e) {
		let t = Or(e.clientX, e.clientY), n = e.shiftKey ? new Set(C) : /* @__PURE__ */ new Set(), r = fn("rect");
		r.setAttribute("class", "loc-marquee"), gt.appendChild(r), I.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = Or(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e of w) {
				let t = f(e, v);
				t.x >= o && t.x <= o + c && t.y >= s && t.y <= s + l && u.add(e.node.id);
			}
			C = u, h.selectedNodeId = C.size ? [...C][C.size - 1] : null, ur(), Er(), i = !0;
		}, o = () => {
			r.remove(), I.classList.remove("loc-marqueeing"), $("pointermove", a), $("pointerup", o), i ? (dr(), C.size === 1 && m.inspector && ci([...C][0])) : (hr(), li());
		};
		Q("pointermove", a), Q("pointerup", o);
	}
	function _r(e) {
		return C.has(e.id) || C.has(e.parentId);
	}
	let H = /* @__PURE__ */ new Set();
	function vr() {
		for (let e in D) D[e].classList.toggle("loc-edge-selected", H.has(e));
	}
	function yr() {
		H.size && (H = /* @__PURE__ */ new Set(), vr(), M("edges-select", { ids: [] }));
	}
	function br(e) {
		H = new Set((e || []).filter((e) => D[e])), vr(), M("edges-select", { ids: [...H] });
	}
	function xr() {
		if (oi("resetSelectedEdges") || !H.size) return;
		let e = !1;
		for (let t of H) y[t] && (delete y[t], e = !0), b[t] && (delete b[t], e = !0);
		e && (h.selectedEdgeId && H.has(h.selectedEdgeId) && U(), vn(), vr(), Y(), J(), tr("edges-reset"), M("edges-reset", { ids: [...H] }));
	}
	function Sr(e, t, n, r, i, a, o, s) {
		let c = (n - e) * (s - a) - (r - t) * (o - i);
		if (Math.abs(c) < 1e-9) return !1;
		let l = ((i - e) * (s - a) - (a - t) * (o - i)) / c, u = ((i - e) * (r - t) - (a - t) * (n - e)) / c;
		return l >= 0 && l <= 1 && u >= 0 && u <= 1;
	}
	function Cr(e, t, n, r, i, a) {
		let o = n + i, s = r + a, c = (e) => e.x >= n && e.x <= o && e.y >= r && e.y <= s;
		return c(e) || c(t) ? !0 : Sr(e.x, e.y, t.x, t.y, n, r, o, r) || Sr(e.x, e.y, t.x, t.y, o, r, o, s) || Sr(e.x, e.y, t.x, t.y, o, s, n, s) || Sr(e.x, e.y, t.x, t.y, n, s, n, r);
	}
	function wr(e, t, n, r, i) {
		let a = Ar(e);
		if (!a) return !1;
		for (let e of Mr(a)) if (Cr(e.a, e.b, t, n, r, i)) return !0;
		return !1;
	}
	function Tr(e) {
		let t = Or(e.clientX, e.clientY), n = e.shiftKey ? new Set(H) : /* @__PURE__ */ new Set(), r = fn("rect");
		r.setAttribute("class", "loc-marquee loc-marquee-edge"), gt.appendChild(r), I.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = Or(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e in D) wr(e, o, s, c, l) && u.add(e);
			H = u, vr(), i = !0;
		}, o = () => {
			r.remove(), I.classList.remove("loc-marqueeing"), $("pointermove", a), $("pointerup", o), i ? M("edges-select", { ids: [...H] }) : yr();
		};
		Q("pointermove", a), Q("pointerup", o);
	}
	function Er() {
		for (let e in D) {
			let t = T[e];
			D[e].classList.toggle("loc-incident", !!t && _r(t.node));
		}
	}
	function Dr(e) {
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
	function Or(e, t) {
		let n = I.getBoundingClientRect();
		return {
			x: (e - n.left - h.panX) / h.zoom,
			y: (t - n.top - h.panY) / h.zoom
		};
	}
	function kr(e) {
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
	function Ar(e) {
		let t = T[e];
		if (!t) return null;
		let n = T[t.node.parentId];
		if (!n) return null;
		let r = Mt(), i = te(t, y[e], b[e], n, r, v);
		return oe(n, t, i, r, v, b[e]);
	}
	function jr(e) {
		if (y[e]) return y[e];
		let t = T[e], n = t && T[t.node.parentId], r = te(t, null, b[e], n, Mt(), v);
		return y[e] = r.map((e) => ({
			x: e.x,
			y: e.y
		})), y[e];
	}
	function Mr(e) {
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
	function Nr(e) {
		Fr(), h.selectedEdgeId && D[h.selectedEdgeId] && D[h.selectedEdgeId].classList.remove("loc-sel"), C = /* @__PURE__ */ new Set(), h.selectedNodeId = null, ur(), h.selectedEdgeId = e, D[e] && D[e].classList.add("loc-sel"), Er(), Br();
	}
	function U() {
		h.selectedEdgeId && D[h.selectedEdgeId] && D[h.selectedEdgeId].classList.remove("loc-sel"), h.selectedEdgeId = null, L.innerHTML = "";
	}
	function Pr(e) {
		let t = String(e);
		U(), C = /* @__PURE__ */ new Set(), h.selectedNodeId = null, ur(), h.selectedFamilyId = t, vn();
		let n = Ve.find((e) => String(e.parentId) === t) || Be.find((e) => String(e.parentId) === t);
		M("family-route-select", {
			parentId: t,
			childIds: n ? n.childIds.slice() : []
		});
	}
	function Fr() {
		if (h.selectedFamilyId) {
			h.selectedFamilyId = null, _t.innerHTML = "";
			for (let e in D) D[e].classList.remove("loc-family-member");
		}
	}
	function Ir(e = h.selectedFamilyId) {
		if (oi("resetFamilyRoute")) return !1;
		let t = e == null ? null : String(e);
		return !t || !x[t] ? !1 : (delete x[t], V("family-route-reset"), Y(), J(), M("family-route-reset", { parentId: t }), !0);
	}
	function Lr(e, t) {
		if (oi("setFamilyRouteOverride")) return !1;
		let n = e == null ? "" : String(e);
		return !n || !T[n] ? !1 : !t || !Number.isFinite(Number(t.trunkOffset)) ? Ir(n) : (x[n] = { trunkOffset: Number(t.trunkOffset) }, h.selectedFamilyId = n, V("family-route-override"), Y(), J(), M("family-route-change", {
			parentId: n,
			trunkOffset: x[n].trunkOffset,
			pending: !1
		}), !0);
	}
	function Rr(e, t, n, r) {
		let i = fn("circle");
		return i.setAttribute("cx", e), i.setAttribute("cy", t), i.setAttribute("r", n), i.setAttribute("class", r), i;
	}
	function zr(e, t, n, r) {
		let i = fn("rect");
		return i.setAttribute("x", e - n), i.setAttribute("y", t - n), i.setAttribute("width", 2 * n), i.setAttribute("height", 2 * n), i.setAttribute("rx", 2 / h.zoom), i.setAttribute("class", r), i;
	}
	function Br() {
		L.innerHTML = "";
		let e = h.selectedEdgeId;
		if (!e || m.readonly) return;
		let t = Ar(e);
		if (!t) return;
		let n = y[e] || [], r = 6 / h.zoom, i = 5 / h.zoom;
		if (!h.editMode) {
			for (let e = 0; e < n.length; e++) {
				let t = Rr(n[e].x, n[e].y, r, "loc-wp-handle loc-wp-readonly");
				t.dataset.wp = e, L.appendChild(t);
			}
			return;
		}
		for (let e of Mr(t)) {
			let t = Rr((e.a.x + e.b.x) / 2, (e.a.y + e.b.y) / 2, i, "loc-wp-add");
			t.dataset.add = e.insert, L.appendChild(t);
		}
		for (let e = 0; e < n.length; e++) {
			let t = Rr(n[e].x, n[e].y, r, "loc-wp-handle");
			t.dataset.wp = e, L.appendChild(t);
		}
		let a = t[0], o = t[t.length - 1], s = zr(a.x, a.y, 6 / h.zoom, "loc-ep loc-ep-parent");
		s.dataset.ep = "parent", L.appendChild(s);
		let c = zr(o.x, o.y, 6 / h.zoom, "loc-ep loc-ep-child");
		c.dataset.ep = "child", L.appendChild(c);
	}
	function Vr(e, t) {
		let n = f(e, v), r = e.node.width, i = e.node.height, a = (t.x - n.x) / (r / 2), o = (t.y - n.y) / (i / 2), s = Math.max(Math.abs(a), Math.abs(o));
		return s > 1e-6 && (a /= s, o /= s), {
			nx: Math.max(-1, Math.min(1, a)),
			ny: Math.max(-1, Math.min(1, o))
		};
	}
	let Hr = .34;
	function Ur(e) {
		let t = e.nx, n = e.ny;
		return Math.abs(Math.abs(n) - 1) < 1e-6 && Math.abs(t) < Hr ? t = 0 : Math.abs(Math.abs(t) - 1) < 1e-6 && Math.abs(n) < Hr && (n = 0), {
			nx: t,
			ny: n
		};
	}
	function Wr(e, t) {
		let n = new Set([t].concat(vi(t)));
		for (let t = w.length - 1; t >= 0; t--) {
			let r = w[t];
			if (n.has(r.node.id)) continue;
			let i = f(r, v);
			if (e.x >= i.x - r.node.width / 2 && e.x <= i.x + r.node.width / 2 && e.y >= i.y - r.node.height / 2 && e.y <= i.y + r.node.height / 2) return r.node.id;
		}
		return null;
	}
	let Gr = null;
	function Kr(e) {
		Gr && E[Gr] && E[Gr].classList.remove("loc-reparent-target"), Gr = e, e && E[e] && E[e].classList.add("loc-reparent-target");
	}
	function qr(e) {
		if (!k || k.kind !== "ep") return;
		let t = k.id, n = T[t];
		if (!n) return;
		let r = T[n.node.parentId];
		if (!r) return;
		let i = kr(Or(e.clientX, e.clientY));
		if (b[t] = b[t] || {}, k.changed = !0, k.which === "child") b[t].c = Ur(Vr(n, i));
		else {
			b[t].p = Ur(Vr(r, i));
			let e = Wr(i, t);
			Kr(e && e !== n.node.parentId ? e : null);
		}
		bn(t), Br();
	}
	function Jr() {
		let e = k;
		if (k = null, $("pointermove", qr), $("pointerup", Jr), e && e.which === "parent" && Gr) {
			let t = Gr;
			Kr(null), Yr(e.id, t);
		} else Kr(null), Y(), e && e.changed && (J(), tr("edge-anchor"));
	}
	function Yr(e, t) {
		if (oi("reparentNode")) return !1;
		let n = _[e];
		if (!n || t === e || t && vi(e).indexOf(t) >= 0) return !1;
		let r = t || "", i = n.parentId == null ? "" : String(n.parentId);
		return (n.parentId || "") !== r && (h.selectedEdgeId = null, h.selectedFamilyId = null, L.innerHTML = "", _t.innerHTML = "", Zt(() => {
			n.parentId = r, S[e] = Object.assign(S[e] || {}, { parentId: r }), delete y[e], delete b[e], i && delete x[i], r && delete x[r], T[e] && Object.assign(T[e].node, { parentId: r });
		}), Er(), R.classList.contains("loc-open") && h.selectedNodeId === e && ui(), M("node-change", {
			id: e,
			node: { ...n },
			patch: { parentId: r },
			reparented: !0
		}), J(), !0);
	}
	function Xr(e) {
		return Yr(e, "");
	}
	function Zr(e, t) {
		return t ? Yr(e, t) : !1;
	}
	let Qr = null;
	function $r(e) {
		!oi("beginAttach") && e && (Qr = e, P.classList.add("loc-attaching"), M("attach-start", { id: e }));
	}
	function ei() {
		Qr && (Qr = null, P.classList.remove("loc-attaching"), M("attach-cancel", {}));
	}
	function ti(e) {
		let t = Qr;
		return !t || !e || e === t || vi(t).indexOf(e) >= 0 ? (ei(), !1) : (Qr = null, P.classList.remove("loc-attaching"), Zr(t, e), m.inspector && ci(t), !0);
	}
	function ni(e, t, n) {
		let r = n.x - t.x, i = n.y - t.y, a = r * r + i * i, o = a ? ((e.x - t.x) * r + (e.y - t.y) * i) / a : 0;
		return o = Math.max(0, Math.min(1, o)), Math.hypot(e.x - (t.x + o * r), e.y - (t.y + o * i));
	}
	function ri(e, t) {
		let n = Mr(e), r = 0, i = Infinity;
		for (let e of n) {
			let n = ni(t, e.a, e.b);
			n < i && (i = n, r = e.insert);
		}
		return r;
	}
	let ii = [
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
	function ai() {
		P.classList.toggle("loc-edit", h.editMode);
	}
	function oi(e) {
		return m.readonly ? (console.warn(`local-org-chart: ${e}() ignored because the chart is readonly`), !0) : !1;
	}
	function si(e) {
		return e && oi("setEditMode") ? !1 : (h.editMode = !!e, ai(), Ho(), h.editMode || (U(), Fr()), R.classList.contains("loc-open") && ui(), M("edit-mode-change", { editMode: h.editMode }), Y(), !0);
	}
	function ci(e) {
		m.inspector && (h.selectedNodeId = e, R.classList.add("loc-open"), ui(), M("inspector-open", {
			id: e,
			node: _[e]
		}));
	}
	function li() {
		R.classList.contains("loc-open") && (R.classList.remove("loc-open"), M("inspector-close", {}));
	}
	function ui() {
		let e = h.selectedNodeId, t = e && _[e];
		if (!t) {
			li();
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
		])) + o("Photo URL", i("photo_url", t.data && t.data.photo_url || ""))), m.advancedLayoutControls && (s += o("Layout override", a("layoutMode", t.layoutMode || "", ii.map((e) => [e, e || "(inherit)"])))), s += o("Width", i("width", t.width, "number")) + o("Height", i("height", t.height, "number")), Ct.innerHTML = s, wt.innerHTML = n ? "<button data-role=\"add-child\">+ Add child</button>" + (t.parentId ? "<button data-role=\"detach\">Detach</button>" : "<button data-role=\"attach\">Attach…</button>") + "<button data-role=\"del-node\" class=\"loc-danger\">Delete</button>" : "<span class=\"loc-foot-hint\">Turn on Edit to modify fields</span>";
	}
	let di = 0, fi = 0;
	function pi(e) {
		if (!m.userSearch) return;
		let t = Ct.querySelector("[data-role=\"user-results\"]");
		if (!t) return;
		di && clearTimeout(di);
		let n = (e || "").trim();
		if (!n) {
			t.hidden = !0, t.innerHTML = "";
			return;
		}
		let r = ++fi;
		di = setTimeout(() => {
			try {
				Promise.resolve(m.userSearch(n, _[h.selectedNodeId])).then((e) => {
					r === fi && mi(t, Array.isArray(e) ? e : []);
				}).catch(() => {});
			} catch {}
		}, 220);
	}
	function mi(e, t) {
		t.length ? (e.innerHTML = t.slice(0, 8).map((e, t) => {
			let n = W(e.name || e.personName || e.label || ""), r = W(e.title || e.label || e.email || "");
			return `<button type="button" class="loc-usersearch-item" data-uidx="${t}"><b>${n}</b>${r ? `<small>${r}</small>` : ""}</button>`;
		}).join(""), e.hidden = !1, e._users = t) : (e.hidden = !0, e.innerHTML = "");
	}
	function hi(e) {
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
		_i(t, r);
		let i = Ct.querySelector("[data-role=\"user-results\"]");
		i && (i.hidden = !0, i.innerHTML = ""), ui(), M("user-select", {
			id: t,
			user: e,
			node: { ..._[t] }
		});
	}
	function gi() {
		let e;
		do
			e = "node-" + ++ze;
		while (_[e]);
		return e;
	}
	function _i(e, t) {
		if (oi("updateNode")) return !1;
		let n = _[e];
		if (!n) return !1;
		let r = [], i = be({ nodeOverrides: { [e]: t } }, r, "updateNode").nodeOverrides[e] || {};
		if (Xi("node patch", r), t = i, !Object.keys(t).length) return !1;
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
		}), Y(), J("field:" + e + ":" + Object.keys(t).join(",")), !0;
	}
	function vi(e) {
		let t = [], n = [e];
		for (; n.length;) {
			let e = n.pop();
			for (let r of g) r.parentId === e && (t.push(r.id), n.push(r.id));
		}
		return t;
	}
	function yi(e) {
		if (oi("addChild") || !h.editMode) return null;
		let t = gi(), n = le({
			id: t,
			parentId: e || "",
			type: "position",
			label: "NEW POSITION",
			personName: "",
			status: ""
		});
		return g.push(n), _[t] = n, e && delete x[String(e)], S[t] = Object.assign({ __new: !0 }, n), V("add-child", { preserveManual: !0 }), fr(t), ci(t), M("node-change", {
			id: t,
			node: { ...n },
			added: !0
		}), Y(), J(), t;
	}
	function bi(e) {
		if (oi("deleteNode") || !h.editMode || !e) return !1;
		let t = _[e]?.parentId, n = [e].concat(vi(e)), r = new Set(n);
		return g = g.filter((e) => !r.has(e.id)), _ = a(g), n.forEach((e) => {
			S[e] = { __deleted: !0 }, delete v[e], delete y[e], delete b[e], E[e] && (E[e].remove(), delete E[e]), C.delete(e);
		}), t && delete x[String(t)], n.forEach((e) => {
			delete x[String(e)];
		}), r.has(h.selectedNodeId) && (h.selectedNodeId = C.size ? [...C][C.size - 1] : null, h.selectedNodeId || li()), V("delete-node", { preserveManual: !0 }), M("node-change", {
			id: e,
			removed: !0,
			ids: n
		}), Y(), J(), !0;
	}
	function xi() {
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
	let Si = [
		["type", "Type"],
		["status", "Status"],
		["level", "Level (data.level)"],
		["unit", "Unit (data.unit)"],
		["id", "Node id"],
		["label", "Label"]
	];
	function Ci(e, t) {
		let n = me(t, Le);
		wi(e, "--loc-node-bg", n && n.bg), wi(e, "--loc-node-text", n && n.text), wi(e, "--loc-node-border", n && n.border);
	}
	function wi(e, t, n) {
		n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
	}
	function Ti() {
		for (let e in E) _[e] && Ci(E[e], _[e]);
		h.showLegend && Ai();
	}
	let Ei = {
		FILLED: "Filled",
		VACANT: "Vacant",
		UNFUNDED: "Unfunded"
	};
	function Di() {
		Ot.classList.toggle("loc-on", h.showLegend), h.showLegend && Ai();
	}
	function Oi(e) {
		return h.showLegend = e == null ? !h.showLegend : !!e, Di(), Ho(), Y(), M("legend-change", { legend: h.showLegend }), h.showLegend;
	}
	function ki(e) {
		return Oi(e ?? !h.showLegend);
	}
	function Ai() {
		if (m.legendSlot) return;
		let e = Object.create(null), t = Object.create(null);
		for (let n of g) n.type && (e[n.type] = !0), n.status && (t[n.status] = !0);
		let n = "", r = [];
		e.department && r.push(Mi("loc-leg-dept", "Department")), e.position && r.push(Mi("loc-leg-pos", "Position")), r.length && (n += ji("Type", r.join("")));
		let i = [
			"FILLED",
			"VACANT",
			"UNFUNDED"
		].filter((e) => t[e]).map((e) => `<div class="loc-leg-row"><span class="loc-leg-badge loc-${e}">${Ei[e] || e}</span></div>`);
		i.length && (n += ji("Status", i.join("")));
		let a = Le.filter((e) => e.enabled && (e.style.bg || e.style.border)).map((e) => `<div class="loc-leg-row"><span class="loc-leg-swatch" style="background:${W(e.style.bg || "#fff")};border-color:${W(e.style.border || e.style.bg || "#d0d5dd")}"></span><span class="loc-leg-label">${W(e.field)} = ${W(e.value || "—")}</span></div>`).join("");
		a && (n += ji("Rules", a)), At.innerHTML = n || "<div class=\"loc-leg-empty\">No legend items yet.</div>";
	}
	function ji(e, t) {
		return `<div class="loc-leg-section"><div class="loc-leg-title">${e}</div>${t}</div>`;
	}
	function Mi(e, t) {
		return `<div class="loc-leg-row"><span class="loc-leg-swatch ${e}"></span><span class="loc-leg-label">${t}</span></div>`;
	}
	function G() {
		return Object.assign(qi(), {
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
	function Ni(e, t) {
		let n = JSON.stringify(qi()), r = Zi(e || {}, "settings"), i = h.showImages, a = Ji(r);
		if (JSON.stringify(qi()) === n) return !1;
		if (h.showImages !== i) for (let e in E) E[e].remove(), delete E[e];
		if ((a.sizeChanged || a.renderChanged) && $t(), a.sizeChanged) {
			en();
			for (let e in E) delete E[e].dataset.fitted;
		}
		return Ti(), Cn(), Ho(), V("settings"), z.classList.contains("loc-open") && Vi(), t && t.silent || M("settings-change", G()), Y(), !0;
	}
	function Pi(e) {
		let t = z.classList.contains("loc-open"), n = e == null ? !t : !!e;
		z.classList.toggle("loc-open", n), F && F.querySelectorAll("button[data-act=\"settings\"]").forEach((e) => e.classList.toggle("loc-active", n)), n && Vi(), n !== t && M(n ? "settings-open" : "settings-close", {});
	}
	function Fi() {
		let e = q(Re);
		for (let t of [
			"subtreeMode",
			"orientation",
			"showImages",
			"autoEdgeSide"
		]) delete e[t];
		Ni(e), Ti();
	}
	function Ii(e, t, n, r, i) {
		let a = Number.isFinite(Number(n)) ? Number(n) : r;
		return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${a}</b></span><input type="range" data-set="${e}" min="${r}" max="${i}" value="${a}"/></label>`;
	}
	let Li = /^#[0-9a-f]{6}$/i;
	function Ri(e, t, n, r) {
		let i = Li.test(r || "") ? r : "#e0524d";
		return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${r ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${W(i)}"/></label>`;
	}
	function zi(e, t) {
		let n = (t, n) => `<option value="${t}"${e.field === t ? " selected" : ""}>${n}</option>`;
		return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + Si.map(([e, t]) => n(e, t)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${W(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Ri(t, "bg", "BG", e.style.bg) + Ri(t, "text", "Text", e.style.text) + Ri(t, "border", "Border", e.style.border) + "</div></div>";
	}
	function Bi() {
		let e = ya().map((e) => `<div class="loc-preset"><button class="loc-preset-apply" data-role="preset-apply" data-name="${W(e.name)}" title="Apply this saved layout">${W(e.name)}</button><span class="loc-preset-tag">${e.full ? "full" : "pattern"}</span><button class="loc-preset-del" data-role="preset-del" data-name="${W(e.name)}" title="Delete preset">✕</button></div>`).join("");
		return e ||= "<div class=\"loc-set-hint\">No saved presets yet.</div>", `<div class="loc-set-section"><div class="loc-set-title">Presets</div><div class="loc-set-hint">Save the current arrangement so an accidental mode change can’t lose it (Undo / Ctrl+Z restores it too).</div><div class="loc-preset-save"><input type="text" data-role="preset-name" placeholder="Preset name…"/><label class="loc-preset-full"><input type="checkbox" data-role="preset-full" checked/> positions</label><button data-role="preset-save">Save</button></div><div class="loc-preset-list">${e}</div></div>`;
	}
	function Vi() {
		if (m.settingsSlot) return;
		let e = Bi() + "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Layout</div>" + Ii("spacingX", "Spacing X", h.spacingX, 0, 200) + Ii("spacingY", "Spacing Y", h.spacingY, 0, 260) + Ii("gridSize", "Grid size", h.gridSize, 6, 80) + `<label class="loc-color"><input type="checkbox" data-set-toggle="showImages"${h.showImages ? " checked" : ""}/><span>Show photos (off → user icon)</span></label><label class="loc-color"><input type="checkbox" data-set-toggle="autoEdgeSide"${h.autoEdgeSide ? " checked" : ""}/><span>Smart edges (lines follow waypoints to any side)</span></label></div>`;
		e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Card size</div><div class=\"loc-set-hint\">Applies to every person card. The photo tops the card at its full size; the name/title sit below.</div>" + Ii("cardWidth", "Card width", h.cardWidth, 120, 320) + Ii("photoHeight", "Photo height", h.photoHeight, 60, 240) + `<label class="loc-color"><input type="checkbox" data-set-toggle="photoContain"${h.photoContain ? " checked" : ""}/><span>Preserve photo proportions (contain)</span></label></div>`, e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Theme rules</div><div class=\"loc-set-hint\">Recolor nodes that match a field = value. Later rules win.</div>", Le.forEach((t, n) => {
			e += zi(t, n);
		}), e += "<button class=\"loc-set-add\" data-role=\"add-rule\">+ Add rule</button></div>", e += "<div class=\"loc-set-foot\"><button class=\"loc-set-reset\" data-role=\"reset-settings\" title=\"Restore spacing, grid &amp; theme rules to defaults\">↺ Reset settings</button></div>", Dt.innerHTML = e;
	}
	function Hi(e, t) {
		let n = Dt.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
		return n && n.checked;
	}
	function Ui(e, t) {
		let n = Dt.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
		return n ? n.value : "";
	}
	let Wi = [], K = -1, Gi = !1, Ki = null;
	function q(e) {
		return e == null ? e : JSON.parse(JSON.stringify(e));
	}
	function qi() {
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
	function Ji(e) {
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
	function Yi(e, t = "view") {
		if (!e) return;
		let n = h.showImages;
		if (Ji(Zi(e, t)), h.showImages !== n) for (let e in E) E[e].remove(), delete E[e];
		$t(), en();
	}
	function Xi(e, t) {
		t && t.length && (console.warn(`local-org-chart: ignored invalid ${e}: ${t.join("; ")}`), Promise.resolve().then(() => {
			at || M("input-warning", {
				context: e,
				problems: t.slice()
			});
		}));
	}
	function Zi(e, t) {
		let n = [], r = ve(e, n, t);
		return Xi(t, n), r;
	}
	function Qi(e, t) {
		let n = [], r = be(e, n, t);
		return Xi(t, n), r;
	}
	function $i(e, t) {
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
		return Fe = r, Xi(t, n), i;
	}
	function ea(e) {
		let t = e || _;
		for (let e of [
			v,
			y,
			b,
			x
		]) for (let n of Object.keys(e)) n in t || delete e[n];
	}
	function ta() {
		return {
			nodes: g.map((e) => Object.assign({}, e)),
			manualOffsets: q(v),
			edgeWaypoints: q(y),
			edgeAnchors: q(b),
			familyRouteOverrides: q(x),
			nodeOverrides: q(S),
			view: qi(),
			selectedNodeId: h.selectedNodeId
		};
	}
	function na(e) {
		Gi = !0;
		let t = Object.create(null);
		for (let e of g) t[e.id] = e.parentId;
		g = (e.nodes || []).map(le), _ = a(g), v = Object.assign(Object.create(null), q(e.manualOffsets)), y = Object.assign(Object.create(null), q(e.edgeWaypoints)), b = Object.assign(Object.create(null), q(e.edgeAnchors)), x = Object.assign(Object.create(null), q(e.familyRouteOverrides)), S = Object.assign(Object.create(null), q(e.nodeOverrides)), Ie = !0, Yi(e.view, "history");
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		for (let e in O) O[e].remove(), delete O[e];
		h.selectedEdgeId = null, L.innerHTML = "", h.selectedNodeId = e.selectedNodeId && _[e.selectedNodeId] ? e.selectedNodeId : null, Cn(), V("history"), h.selectedNodeId && fr(h.selectedNodeId), R.classList.contains("loc-open") && (h.selectedNodeId ? ui() : li()), z.classList.contains("loc-open") && Vi(), Gi = !1;
		for (let e of g) e.id in t && t[e.id] !== e.parentId && M("node-change", {
			id: e.id,
			node: { ...e },
			patch: { parentId: e.parentId },
			reparented: !0,
			history: !0
		});
	}
	let ra = null;
	function ia() {
		if (!ra) return;
		let { key: e } = ra;
		ra = null, J(e);
	}
	function J(e) {
		if (Gi) return;
		if (j) {
			ra = { key: ra ? null : e ?? null };
			return;
		}
		let t = ta();
		e != null && e === Ki && K >= 0 ? Wi[K] = t : (Wi = Wi.slice(0, K + 1), Wi.push(t), K = Wi.length - 1, Wi.length > 100 && (Wi.shift(), K--)), Ki = e ?? null, da();
	}
	function aa() {
		Wi = [ta()], K = 0, Ki = null, da();
	}
	function oa() {
		return K > 0;
	}
	function sa() {
		return K >= 0 && K < Wi.length - 1;
	}
	function ca() {
		if (!ra) return;
		let { key: e } = ra;
		ra = null;
		let t = j;
		j = null, J(e), j = t;
	}
	function la() {
		ca(), oa() && (K--, Ki = null, na(Wi[K]), da());
	}
	function ua() {
		ca(), sa() && (K++, Ki = null, na(Wi[K]), da());
	}
	function da() {
		Ho(), M("history-change", {
			canUndo: oa(),
			canRedo: sa()
		});
	}
	function Y() {
		if (m.persist) try {
			localStorage.setItem(m.storageKey, JSON.stringify(Object.assign(qi(), {
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
	function fa() {
		if (!m.persist) return;
		let e;
		try {
			e = JSON.parse(localStorage.getItem(m.storageKey) || "null");
		} catch {
			e = null;
		}
		if (!e || typeof e != "object") return;
		Ji(Zi(e, "stored state")), [
			"zoom",
			"panX",
			"panY"
		].forEach((t) => {
			Number.isFinite(e[t]) && (h[t] = e[t]);
		}), h.zoom <= 0 && (h.zoom = 1), typeof e.editMode == "boolean" && (h.editMode = e.editMode && !m.readonly), typeof e.showLegend == "boolean" && (h.showLegend = e.showLegend);
		let t = Qi(e, "stored state");
		if (v = t.manualOffsets, y = t.edgeWaypoints, b = t.edgeAnchors, x = t.familyRouteOverrides, S = t.nodeOverrides, xi(), $t(), en(), Array.isArray(e.collapsed)) {
			let e = new Set(t.collapsed.map(String));
			for (let t of g) t.collapsed = e.has(String(t.id));
		}
		Ie = !0;
	}
	function pa() {
		return m.storageKey + ".presets";
	}
	function ma() {
		try {
			return JSON.parse(localStorage.getItem(pa()) || "{}") || {};
		} catch {
			return {};
		}
	}
	function ha(e) {
		try {
			localStorage.setItem(pa(), JSON.stringify(e));
		} catch {}
	}
	function ga(e) {
		let t = {
			full: e !== !1,
			view: qi()
		};
		return t.full && (t.layout = {
			manualOffsets: q(v),
			edgeWaypoints: q(y),
			edgeAnchors: q(b),
			familyRouteOverrides: q(x),
			nodeOverrides: q(S),
			collapsed: g.filter((e) => e.collapsed).map((e) => e.id)
		}), t;
	}
	function _a(e) {
		return ga(!(e && e.full === !1));
	}
	function va(e) {
		if (!e) return Promise.resolve(!1);
		let { layout: t, problems: n } = ge(e);
		if (Xi("layout", n), !t) return Promise.resolve(!1);
		if (Yi(t.view, "layout"), t.full) {
			v = t.layout.manualOffsets, y = t.layout.edgeWaypoints, b = t.layout.edgeAnchors, x = t.layout.familyRouteOverrides, S = t.layout.nodeOverrides, xi(), en(), ea();
			let e = new Set(t.layout.collapsed.map(String));
			for (let t of g) t.collapsed = e.has(String(t.id));
			Ie = !0;
		} else v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null);
		h.selectedNodeId = null, h.selectedEdgeId = null, h.selectedFamilyId = null, L.innerHTML = "", _t.innerHTML = "";
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		for (let e in O) O[e].remove(), delete O[e];
		Cn(), Ho();
		let r = V("preset");
		return z.classList.contains("loc-open") && Vi(), r.then((e) => {
			e && Ln();
		}), J(), M("settings-change", G()), r;
	}
	function ya() {
		let e = ma();
		return Object.keys(e).map((t) => ({
			name: t,
			full: !!e[t].full,
			savedAt: e[t].savedAt || null
		}));
	}
	function ba() {
		return ma();
	}
	function xa(e, t) {
		if (e = String(e ?? "").trim(), !e) return null;
		let n = ga(!(t && t.full === !1));
		n.name = e, n.savedAt = Date.now();
		let r = ma();
		return r[e] = n, ha(r), z.classList.contains("loc-open") && Vi(), M("presets-change", { presets: ya() }), n;
	}
	function Sa(e) {
		let t = ma()[String(e)];
		return t ? (va(t), M("preset-load", {
			name: String(e),
			preset: t
		}), !0) : !1;
	}
	function Ca(e) {
		let t = ma();
		return String(e) in t && (delete t[String(e)], ha(t), z.classList.contains("loc-open") && Vi(), M("presets-change", { presets: ya() }), !0);
	}
	function wa(e) {
		let t = he(h, g, v, y);
		return t.editMode = h.editMode, t.edgeAnchors = b, t.familyRouteOverrides = x, t.nodeOverrides = S, t.settings = G(), e !== !1 && Ra(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
	}
	let Ta = document.createElement("canvas").getContext("2d");
	function Ea(e, t) {
		return Ta.font = t, Ta.measureText(e).width;
	}
	function Da(e) {
		let t = E[e.id];
		if (!t) return 1;
		let n = parseFloat(t.style.getPropertyValue("--loc-fit"));
		return isFinite(n) && n > 0 ? n : 1;
	}
	function Oa(e) {
		return e ??= 0, He && Object.keys(v).length === 0 ? {
			x: He.x - e,
			y: He.y - e,
			w: He.w + e * 2,
			h: He.h + e * 2
		} : ce(w, v, e);
	}
	function ka() {
		let e = [];
		for (let t in D) e.push({
			id: t,
			d: D[t].getAttribute("d")
		});
		return e;
	}
	function Aa(e) {
		return fe(w, v, ka(), e);
	}
	function ja(e, t) {
		let n = ka();
		return xe(w, n, {
			manualOffsets: v,
			raster: !!e,
			measureText: Ea,
			fitOf: Da,
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
	function Ma(e) {
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
	function Na() {
		if (!h.showImages) return Promise.resolve({});
		let e = [], t = /* @__PURE__ */ new Set();
		for (let n of g) {
			let r = n.type !== "department" && n.data && n.data.photo_url;
			r && typeof r == "string" && !t.has(r) && (t.add(r), e.push(r));
		}
		return e.length ? Promise.all(e.map((e) => Ma(e).then((t) => [e, t]))).then((e) => {
			let t = {}, n = [];
			for (let [r, i] of e) i.data ? t[r] = i.data : n.push(`${r} (${i.failure})`);
			return n.length && console.warn(`local-org-chart: export used placeholders for ${n.length} photo(s): ${n.join(", ")}`), t;
		}) : Promise.resolve({});
	}
	function Pa() {
		return Na().then((e) => {
			let t = ja(!1, e);
			return Ra(new Blob([t], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), t;
		});
	}
	function Fa(e) {
		return e ||= 3, Na().then((t) => new Promise((n) => {
			let r = Aa(40), i = 16e3, a = 2e8, o = Math.min(e, i / r.w, i / r.h);
			r.w * o * r.h * o > a && (o = Math.sqrt(a / (r.w * r.h))), o = Math.max(.05, o);
			let s = URL.createObjectURL(new Blob([ja(!0, t)], { type: "image/svg+xml;charset=utf-8" })), c = new Image();
			c.onload = () => {
				let e = document.createElement("canvas");
				e.width = Math.round(r.w * o), e.height = Math.round(r.h * o);
				let t = e.getContext("2d");
				t.setTransform(o, 0, 0, o, 0, 0), t.drawImage(c, 0, 0), URL.revokeObjectURL(s);
				try {
					e.toBlob((e) => {
						e && Ra(e, "org-chart.png"), n(!!e);
					}, "image/png");
				} catch {
					n(!1);
				}
			}, c.onerror = () => {
				URL.revokeObjectURL(s), n(!1);
			}, c.src = s;
		}));
	}
	function Ia(e) {
		e ||= {};
		let t = +e.scale > 0 ? +e.scale : 2, n = typeof e.quality == "number" ? Math.min(1, Math.max(.3, e.quality)) : .82, r = +e.maxSide > 0 ? +e.maxSide : 4e3, i = e.as === "dataURL" || e.as === "dataurl", a = e.filename || "org-chart.webp";
		return Na().then((o) => new Promise((s) => {
			let c = Aa(40), l = 2e8, u = Math.min(t, r / c.w, r / c.h);
			c.w * u * c.h * u > l && (u = Math.sqrt(l / (c.w * c.h))), u = Math.max(.05, u);
			let d = URL.createObjectURL(new Blob([ja(!0, o)], { type: "image/svg+xml;charset=utf-8" })), ee = new Image();
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
						t && e.download && Ra(t, a), s(t || null);
					}, "image/webp", n);
				} catch {
					s(null);
				}
			}, ee.onerror = () => {
				URL.revokeObjectURL(d), s(null);
			}, ee.src = d;
		}));
	}
	function La() {
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
		return Na().then((r) => new Promise((i) => {
			if (e.closed) {
				i(!1);
				return;
			}
			let a = URL.createObjectURL(new Blob([ja(!0, r)], { type: "image/svg+xml;charset=utf-8" })), o = t.createElement("img");
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
	function Ra(e, t) {
		let n = URL.createObjectURL(e), r = document.createElement("a");
		r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), setTimeout(() => URL.revokeObjectURL(n), De);
	}
	function za(e, t, n) {
		let r = !(n && n.resetEdits);
		g = $i(e || [], t ? "imported nodes" : "nodes"), _ = a(g), r || (v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null), S = Object.create(null)), h.selectedNodeId = null, h.selectedEdgeId = null, h.selectedFamilyId = null, Ke = /* @__PURE__ */ new Set(), li();
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		for (let e in O) O[e].remove(), delete O[e];
		if (t) Ba(t);
		else if (r) for (let e of Object.keys(S)) {
			let t = S[e];
			t.__new || (e in _ ? "parentId" in t && (delete t.parentId, Object.keys(t).length || delete S[e]) : delete S[e]);
		}
		$t(), (r || t) && xi(), en(), ea(), ai(), Ho();
		let i = V("set-nodes");
		return m.fitOnInit && i.then((e) => {
			e && Mn();
		}), i;
	}
	function Ba(e) {
		let t = {};
		for (let n of [
			"orientation",
			"subtreeMode",
			"spacingX",
			"spacingY"
		]) e[n] != null && (t[n] = e[n]);
		Ji(Zi(Object.assign(t, e.settings || {}), "imported settings"));
		let n = Qi(e, "imported layout");
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
	function Va(e) {
		let { nodes: n, meta: r } = t(e);
		return za(n, r || {}), n.length;
	}
	function Ha(e) {
		let t = Me(e);
		h.orientation = t, v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null), U(), Fr(), Ho();
		let n = V("orientation");
		return n.then((e) => {
			e && Ln();
		}), M("orientation-change", { orientation: t }), J(), n;
	}
	function Ua(e) {
		h.subtreeMode = e, v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null), U(), Fr(), Ho();
		let t = V("subtree-mode");
		return t.then((e) => {
			e && Ln();
		}), M("subtree-mode-change", { subtreeMode: e }), J(), t;
	}
	function Wa(e, t) {
		let n = Zi({
			spacingX: e ?? void 0,
			spacingY: t ?? void 0
		}, "spacing");
		"spacingX" in n && (h.spacingX = n.spacingX), "spacingY" in n && (h.spacingY = n.spacingY);
		let r = V("spacing");
		return M("settings-change", G()), J("spacing"), r;
	}
	function Ga(e, t) {
		if (e in h) {
			let n = h[e];
			if (typeof n == "number" && !(typeof t == "number" && Number.isFinite(t)) || typeof n == "boolean" && typeof t != "boolean") {
				Xi("option", [`${e} ${JSON.stringify(t)}`]);
				return;
			}
			if (e === "editMode" && t && oi("setOption")) return;
			if (e === "orientation" || e === "subtreeMode") {
				let n = Zi({ [e]: t }, "option");
				if (!(e in n)) return;
				t = n[e];
			}
			h[e] = t, e === "showGrid" && Cn(), e === "alignGrid" && (v = Object.create(null), V("align-grid")), Ho(), Y(), [
				"showGrid",
				"snapGrid",
				"alignGrid",
				"gridSize"
			].includes(e) && M("settings-change", G());
		} else m[e] = t, e !== "targetAspect" && e !== "targetSize" || h.subtreeMode !== "AutoSmart" && h.subtreeMode !== "GridSmart" && h.subtreeMode !== "Auto" || V("target-size").then((e) => {
			e && Ln();
		});
	}
	function Ka(e) {
		return Ga("showGrid", !!e), h.showGrid;
	}
	function qa(e) {
		return Ga("snapGrid", !!e), h.snapGrid;
	}
	function Ja(e) {
		return Ga("alignGrid", !!e), h.alignGrid;
	}
	function Ya(e) {
		return Ka(e ?? !h.showGrid);
	}
	function Xa(e) {
		return h.autoEdgeSide = e == null ? !h.autoEdgeSide : !!e, U(), V("auto-edge-side"), z.classList.contains("loc-open") && Vi(), Y(), M("settings-change", G()), h.autoEdgeSide;
	}
	function Za(e) {
		h.showImages = e == null ? !h.showImages : !!e;
		for (let e in E) E[e].remove(), delete E[e];
		return Qt(), Ho(), Y(), M("settings-change", G()), h.showImages;
	}
	function Qa() {
		let e = Yt("relayout", { preserveManual: !0 });
		return U(), Fr(), e.then((e) => {
			e && Ln();
		}), M("relayout", { forced: !1 }), J(), e;
	}
	function $a() {
		v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null), U(), Fr();
		let e = V("force-relayout");
		return e.then((e) => {
			e && Ln();
		}), M("relayout", { forced: !0 }), J(), e;
	}
	function eo() {
		Hn(), li();
		let e = $a();
		return e.then((e) => {
			e && Mn();
		}), e;
	}
	function to() {
		return document.fullscreenElement || document.webkitFullscreenElement || null;
	}
	function no() {
		return to() === P;
	}
	function ro() {
		let e = P.requestFullscreen || P.webkitRequestFullscreen;
		if (e) try {
			let t = e.call(P);
			t && t.catch && t.catch(() => {});
		} catch {}
	}
	function io() {
		let e = document.exitFullscreen || document.webkitExitFullscreen;
		if (e && to()) try {
			e.call(document);
		} catch {}
	}
	function ao(e) {
		let t = e == null ? !no() : !!e;
		return t ? ro() : io(), t;
	}
	let oo = !1;
	function so() {
		let e = no();
		e !== oo && (oo = e, P.classList.toggle("loc-fullscreen", e), xt && (xt.title = e ? "Exit fullscreen" : "Fullscreen"), Ho(), Mn(), M("fullscreen-change", { fullscreen: e }));
	}
	function co(e) {
		if (!We) return;
		let t = Or(e.clientX, e.clientY), n = u(Mt()) ? t.y : t.x, r = Math.max(1, h.gridSize), i = Math.round((We.baseOffset + n - We.startCross) / r) * r;
		x[We.parentId]?.trunkOffset !== i && (x[We.parentId] = { trunkOffset: i }, We.changed = !0, M("family-route-change", {
			parentId: We.parentId,
			trunkOffset: i,
			pending: !0
		}));
	}
	function lo() {
		let e = We;
		We = null, $("pointermove", co), $("pointerup", lo), e?.changed && (V("family-route"), Y(), J(), M("family-route-change", {
			parentId: e.parentId,
			trunkOffset: x[e.parentId]?.trunkOffset,
			pending: !1
		}));
	}
	N(ht, "pointerdown", (e) => {
		let t = e.target.closest(".loc-node");
		t && Qn(e, t.dataset.id);
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
		t && (e.stopPropagation(), Nr(t.dataset.edge));
	}), N(mt, "pointerdown", (e) => {
		let t = e.target.closest("path");
		if (!t) return;
		e.stopPropagation(), e.preventDefault(), jo();
		let n = String(t.dataset.family);
		if (Pr(n), m.readonly || !h.editMode) return;
		let r = Ve.find((e) => String(e.parentId) === n) || Be.find((e) => String(e.parentId) === n), i = T[n];
		if (!r?.trunk || !i) return;
		let a = Or(e.clientX, e.clientY), o = u(Mt());
		We = {
			parentId: n,
			startCross: o ? a.y : a.x,
			baseOffset: (o ? r.trunk.a.y : r.trunk.a.x) - (o ? i.cy : i.cx),
			changed: !1
		}, Q("pointermove", co), Q("pointerup", lo);
	}), N(pt, "dblclick", (e) => {
		if (m.readonly || !h.editMode) return;
		let t = e.target.closest("path");
		if (!t) return;
		let n = t.dataset.edge;
		Nr(n);
		let r = Ar(n);
		if (!r) return;
		let i = kr(Or(e.clientX, e.clientY));
		jr(n).splice(ri(r, i), 0, i), bn(n), Br(), Y(), J(), tr("waypoint-add");
	}), N(L, "pointerdown", (e) => {
		if (m.readonly || !h.editMode) return;
		let t = e.target, n = h.selectedEdgeId;
		if (!n) return;
		if (t.dataset.ep) {
			e.stopPropagation(), e.preventDefault(), k = {
				id: n,
				kind: "ep",
				which: t.dataset.ep
			}, Q("pointermove", qr), Q("pointerup", Jr);
			return;
		}
		let r, i = !1;
		if (t.dataset.wp != null) r = +t.dataset.wp;
		else if (t.dataset.add != null) {
			let a = +t.dataset.add;
			jr(n).splice(a, 0, kr(Or(e.clientX, e.clientY))), r = a, i = !0, bn(n);
		} else return;
		e.stopPropagation(), e.preventDefault(), k = {
			id: n,
			idx: r,
			changed: i
		}, Q("pointermove", uo), Q("pointerup", fo);
	}), N(L, "dblclick", (e) => {
		let t = e.target;
		if (t.dataset.ep === "parent") {
			Xr(h.selectedEdgeId);
			return;
		}
		if (t.dataset.wp == null) return;
		let n = h.selectedEdgeId, r = y[n];
		r && (r.splice(+t.dataset.wp, 1), r.length || delete y[n], bn(n), Br(), Y(), J(), tr("waypoint-remove"));
	});
	function uo(e) {
		if (!k) return;
		let t = y[k.id];
		t && (t[k.idx] = ar(k.id, kr(Or(e.clientX, e.clientY))), k.changed = !0, bn(k.id), Br());
	}
	function fo() {
		let e = k;
		k = null, sr(), $("pointermove", uo), $("pointerup", fo), Y(), e && e.changed && (J(), tr("waypoint-move"));
	}
	N(Ot, "click", (e) => {
		e.target.closest("[data-role=\"legend-close\"]") && Oi(!1);
	}), N(R, "click", (e) => {
		if (e.target.closest("[data-role=\"panel-close\"]")) {
			li();
			return;
		}
		if (e.target.closest("[data-role=\"add-child\"]")) {
			yi(h.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"detach\"]")) {
			Xr(h.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"attach\"]")) {
			let e = h.selectedNodeId;
			li(), $r(e);
			return;
		}
		if (e.target.closest("[data-role=\"del-node\"]")) {
			bi(h.selectedNodeId);
			return;
		}
		let t = e.target.closest("[data-uidx]");
		if (t) {
			let e = t.closest("[data-role=\"user-results\"]"), n = e && e._users && e._users[+t.dataset.uidx];
			n && hi(n);
		}
	}), N(Ct, "input", (e) => {
		if (!h.editMode) return;
		let t = e.target.closest("[data-field]");
		if (!t) return;
		let n = h.selectedNodeId;
		if (!n) return;
		let r = t.dataset.field, i = t.value;
		if (r === "type") _i(n, { type: i }), ui();
		else if (r !== "width" && r !== "height") {
			if (r === "photo_url") {
				let e = _[n];
				_i(n, { data: Object.assign({}, e.data, { photo_url: i || null }) });
			} else r === "layoutMode" ? _i(n, { layoutMode: i || null }) : (_i(n, { [r]: i }), r === "personName" && pi(i));
		}
	});
	function po(e) {
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
		e.value = a, Number(n[r]) !== a && _i(t, { [r]: a });
	}
	N(Ct, "change", (e) => po(e.target.closest("[data-field]"))), N(Ct, "keydown", (e) => {
		let t = e.target.closest("[data-field=\"width\"], [data-field=\"height\"]");
		if (t && (e.key === "Enter" && (e.preventDefault(), po(t), t.blur()), e.key === "Escape")) {
			let e = h.selectedNodeId && _[h.selectedNodeId];
			e && (t.value = e[t.dataset.field]), t.blur();
		}
	}), N(z, "click", (e) => {
		if (e.target.closest("[data-role=\"settings-close\"]")) {
			Pi(!1);
			return;
		}
		if (e.target.closest("[data-role=\"reset-settings\"]")) {
			Fi();
			return;
		}
		if (e.target.closest("[data-role=\"preset-save\"]")) {
			let e = (Dt.querySelector("[data-role=\"preset-name\"]") || {}).value || "", t = !!(Dt.querySelector("[data-role=\"preset-full\"]") || {}).checked;
			e.trim() && xa(e, { full: t });
			return;
		}
		let t = e.target.closest("[data-role=\"preset-apply\"]");
		if (t) {
			Sa(t.dataset.name);
			return;
		}
		let n = e.target.closest("[data-role=\"preset-del\"]");
		if (n) {
			Ca(n.dataset.name);
			return;
		}
		if (e.target.closest("[data-role=\"add-rule\"]")) {
			Le.push(ye({
				field: "type",
				value: "",
				style: {}
			})), Vi(), Ti(), Y(), M("settings-change", G());
			return;
		}
		let r = e.target.closest("[data-rk=\"remove\"]");
		r && (Le.splice(+r.dataset.rule, 1), Vi(), Ti(), Y(), M("settings-change", G()));
	}), N(Dt, "input", (e) => {
		let t = e.target;
		if (t.dataset.set != null) {
			let e = t.dataset.set, n = parseFloat(t.value), r = Dt.querySelector(`[data-rangelabel="${e}"]`);
			r && (r.textContent = n);
		} else if (t.dataset.setToggle === "showImages") Za(t.checked);
		else if (t.dataset.setToggle === "autoEdgeSide") Xa(t.checked);
		else if (t.dataset.setToggle === "photoContain") nn({ contain: t.checked });
		else if (t.dataset.rule != null) {
			let e = +t.dataset.rule, n = t.dataset.rk, r = Le[e];
			if (!r) return;
			if (n === "enabled") r.enabled = t.checked;
			else if (n === "field") r.field = t.value;
			else if (n === "value") r.value = t.value;
			else if (n === "bg" || n === "text" || n === "border") Hi(e, n) && _e(t.value) && (r.style[n] = t.value);
			else if (/-on$/.test(n)) {
				let i = n.replace("-on", ""), a = Ui(e, i);
				r.style[i] = t.checked ? _e(a) ? a : "#e0524d" : "";
			}
			Ti(), M("settings-change", G()), Y();
		}
	}), N(Dt, "change", (e) => {
		let t = e.target;
		if (t.dataset.set == null) return;
		let n = t.dataset.set, r = parseFloat(t.value);
		Number.isFinite(r) && (n === "cardWidth" ? nn({ width: r }) : n === "photoHeight" ? nn({ photoHeight: r }) : Number(h[n]) !== r && (h[n] = r, V("settings-" + n), M("settings-change", G()), Y()));
	});
	let mo = /* @__PURE__ */ new Map(), X = null, Z = null, ho = 0;
	function go() {
		ho &&= (clearTimeout(ho), 0), I.classList.add("loc-gesturing");
	}
	function _o() {
		ho && clearTimeout(ho), ho = setTimeout(() => {
			ho = 0, !(X && X.moved || Z) && (I.classList.remove("loc-gesturing"), Y());
		}, 150);
	}
	function vo(e) {
		return !!(e && e.closest && (e.closest(".loc-panel") || e.closest(".loc-settings") || e.closest(".loc-fsbtn") || e.closest(".loc-legend")));
	}
	function yo() {
		hr(), h.selectedEdgeId && U(), h.selectedFamilyId && Fr(), yr(), Qr && ei(), li();
	}
	function bo(e, t) {
		X || xo(e.pointerId, e.clientX, e.clientY, !1, t);
	}
	function xo(e, t, n, r, i = {}) {
		X = {
			pointerId: e,
			sx: t,
			sy: n,
			px: h.panX,
			py: h.panY,
			moved: r,
			nodeId: i.nodeId || null,
			clearOnClick: !!i.clearOnClick
		}, (!X.nodeId || r) && I.classList.add("loc-panning"), r && go(), Q("pointermove", So), Q("pointerup", wo), Q("pointercancel", To);
	}
	function So(e) {
		if (!X || e.pointerId !== X.pointerId || Z) return;
		let t = e.clientX - X.sx, n = e.clientY - X.sy;
		if (!X.moved) {
			if (Math.abs(t) + Math.abs(n) <= 4) return;
			X.moved = !0, I.classList.add("loc-panning"), go(), Yn(X.pointerId);
		}
		h.panX = X.px + t, h.panY = X.py + n, xn();
	}
	function Co(e) {
		let t = X;
		t && (X = null, $("pointermove", So), $("pointerup", wo), $("pointercancel", To), I.classList.remove("loc-panning"), Xn(), t.moved ? (t.nodeId && Gn(t.nodeId), _o()) : e || (t.nodeId ? Zn(t.nodeId) : t.clearOnClick && yo()));
	}
	function wo(e) {
		X && e.pointerId === X.pointerId && Co(!1);
	}
	function To(e) {
		X && e.pointerId === X.pointerId && Co(!0);
	}
	N(I, "pointerdown", (e) => {
		let t = e.target;
		if (!vo(t)) {
			if (e.button === 1) {
				if (!m.enablePan || X) return;
				e.preventDefault(), jo(), bo(e, {});
			} else e.button != null && e.button !== 0 || t.closest(".loc-node") || t.closest(".loc-edgehits path") || t.closest(".loc-edgehandles *") || (jo(), e.altKey ? Tr(e) : e.ctrlKey || e.metaKey ? gr(e) : m.enablePan ? bo(e, { clearOnClick: !0 }) : yo());
		}
	}), N(I, "pointerdown", (e) => {
		e.pointerType !== "touch" || vo(e.target) || (mo.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		}), !(mo.size < 2) && (e.stopPropagation(), mo.size === 2 && m.enableZoom && !Z && Eo()));
	}, !0);
	function Eo() {
		if (A) {
			if (A.moved) return;
			nr();
		}
		let [e, t] = [...mo.values()], n = I.getBoundingClientRect(), r = An();
		Z = {
			dist: Math.hypot(e.x - t.x, e.y - t.y) || 1,
			zoom: h.zoom,
			px: h.panX,
			py: h.panY,
			mx: (e.x + t.x) / 2 - n.left,
			my: (e.y + t.y) / 2 - n.top,
			floor: Math.min(wn, r ?? wn, h.zoom),
			ceil: Math.max(Pe(), h.zoom)
		}, X && (X.moved = !0), I.classList.remove("loc-panning"), go();
	}
	function Do(e) {
		if (!mo.has(e.pointerId) || (mo.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		}), !Z || mo.size < 2)) return;
		let [t, n] = [...mo.values()], r = I.getBoundingClientRect(), i = (t.x + n.x) / 2 - r.left, a = (t.y + n.y) / 2 - r.top, o = Z.zoom * ((Math.hypot(t.x - n.x, t.y - n.y) || 1) / Z.dist), s = Math.min(Z.ceil, Math.max(Z.floor, o)), c = (Z.mx - Z.px) / Z.zoom, l = (Z.my - Z.py) / Z.zoom;
		h.zoom = s, h.panX = i - c * s, h.panY = a - l * s, xn();
	}
	function Oo(e) {
		if (mo.delete(e.pointerId) && !(!Z || mo.size >= 2)) {
			if (Z = null, mo.size === 1 && m.enablePan) {
				let [[e, t]] = [...mo.entries()];
				X ? (X.pointerId = e, X.sx = t.x, X.sy = t.y, X.px = h.panX, X.py = h.panY, X.moved = !0) : xo(e, t.x, t.y, !0);
			}
			_o();
		}
	}
	Q("pointermove", Do), Q("pointerup", Oo), Q("pointercancel", Oo);
	function ko(e, t) {
		return e ? t === 1 ? e * 40 : t === 2 ? e * (I.clientHeight || 800) : e : 0;
	}
	N(I, "wheel", (e) => {
		if (!m.enableZoom || vo(e.target)) return;
		let t = ko(e.deltaY, e.deltaMode), n = ko(e.deltaX, e.deltaMode);
		if (t || n) {
			if (e.preventDefault(), go(), !t) m.enablePan && (h.panX -= n, xn());
			else {
				let n = e.ctrlKey ? .01 : .001;
				Pn(h.zoom * Math.min(2, Math.max(.5, Math.exp(-t * n))), e.clientX, e.clientY);
			}
			_o();
		}
	}, { passive: !1 });
	function Ao(e) {
		let t = e && (e.nodeType === 1 ? e : e.parentElement);
		return !t || !t.closest ? !1 : !!(t.closest(".loc-panel") || t.closest(".loc-settings") || t.closest(".loc-legend") || t.closest("input, textarea, select, [contenteditable=\"true\"]"));
	}
	N(I, "selectstart", (e) => {
		Ao(e.target) || e.preventDefault();
	}), N(I, "dragstart", (e) => {
		Ao(e.target) || e.preventDefault();
	}), N(I, "scroll", () => {
		(I.scrollLeft || I.scrollTop) && (I.scrollLeft = 0, I.scrollTop = 0);
	});
	function Q(e, t) {
		window.addEventListener(e, t), rt.push({
			target: window,
			type: e,
			fn: t
		});
	}
	function $(e, t) {
		window.removeEventListener(e, t);
		let n = rt.findIndex((n) => n.target === window && n.type === e && n.fn === t);
		n !== -1 && rt.splice(n, 1);
	}
	function jo() {
		try {
			P.focus({ preventScroll: !0 });
		} catch {}
	}
	N(P, "keydown", (e) => {
		let t = e.target;
		if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
		let n = (e.key || "").toLowerCase();
		if (t === P && !(e.ctrlKey || e.metaKey || e.altKey) && (n.startsWith("arrow") || n === "home")) {
			let t = Mo || h.selectedNodeId || jn() && jn().node.id;
			if (t && E[t]) {
				e.preventDefault(), Io(t, !0);
				return;
			}
		}
		if (e.ctrlKey || e.metaKey) n === "z" && !e.shiftKey ? (e.preventDefault(), la()) : (n === "z" && e.shiftKey || n === "y") && (e.preventDefault(), ua());
		else {
			if (h.selectedFamilyId && (n === "delete" || n === "backspace")) {
				e.preventDefault(), Ir();
				return;
			}
			if (h.selectedFamilyId && n === "escape") {
				e.preventDefault(), Fr();
				return;
			}
			if (H.size && (n === "delete" || n === "backspace")) {
				e.preventDefault(), xr();
				return;
			}
			if (n === "escape" && H.size) {
				e.preventDefault(), yr();
				return;
			}
		}
	});
	let Mo = null;
	function No(e) {
		return e.type === "department" ? e.label || "" : [
			e.label,
			e.personName,
			e.status ? Ei[e.status] || e.status : ""
		].filter(Boolean).join(", ");
	}
	function Po() {
		let e = Object.create(null);
		for (let t of g) {
			let n = 0, r = t.parentId;
			for (; r && _[r] && n <= g.length;) n++, r = _[r].parentId;
			e[t.id] = n;
		}
		return e;
	}
	function Fo() {
		let e = Po(), t = Object.create(null);
		for (let e of g) e.parentId && (t[e.parentId] = (t[e.parentId] || 0) + 1);
		if (!Mo || !E[Mo]) {
			let e = jn();
			Mo = h.selectedNodeId && E[h.selectedNodeId] ? h.selectedNodeId : e ? e.node.id : null;
		}
		for (let n of w) {
			let r = n.node, i = E[r.id];
			if (!i) continue;
			let a = r.id === Mo ? 0 : -1;
			i.setAttribute("role", "treeitem"), i.setAttribute("aria-level", String((e[r.id] || 0) + 1)), i.setAttribute("aria-label", No(r)), i.setAttribute("aria-selected", C.has(r.id) ? "true" : "false"), t[r.id] ? i.setAttribute("aria-expanded", r.collapsed ? "false" : "true") : i.removeAttribute("aria-expanded"), i.tabIndex !== a && (i.tabIndex = a);
			let o = i.querySelector("[data-role=\"toggle\"]");
			o && (o.tabIndex = a, t[r.id] ? o.setAttribute("aria-expanded", r.collapsed ? "false" : "true") : o.removeAttribute("aria-expanded"), m.readonly ? o.setAttribute("aria-disabled", "true") : o.removeAttribute("aria-disabled"));
		}
	}
	function Io(e, t) {
		let n = e != null && E[e];
		if (!n) return;
		let r = Mo != null && E[Mo];
		if (r && r !== n) {
			r.tabIndex = -1;
			let e = r.querySelector("[data-role=\"toggle\"]");
			e && (e.tabIndex = -1);
		}
		Mo = e, n.tabIndex = 0;
		let i = n.querySelector("[data-role=\"toggle\"]");
		if (i && (i.tabIndex = 0), t) {
			try {
				n.focus({ preventScroll: !0 });
			} catch {}
			Lo(e);
		}
	}
	function Lo(e) {
		let t = Dr(e);
		if (!t || !On()) return;
		let n = I.getBoundingClientRect();
		(t.left < n.left || t.top < n.top || t.right > n.right || t.bottom > n.bottom) && Nn(e);
	}
	function Ro(e) {
		let t = h.orientation === "LeftToRight" || h.orientation === "RightToLeft";
		return e.slice().sort((e, n) => t ? e.cy - n.cy || e.cx - n.cx : e.cx - n.cx || e.cy - n.cy);
	}
	function zo(e, t) {
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
			let t = Ro(w.filter((t) => t.node.parentId === e));
			return t.length ? t[0].node.id : null;
		}
		let i = Ro(w.filter((e) => T[n.parentId] ? e.node.parentId === n.parentId : r(e))), a = i.findIndex((t) => t.node.id === e), o = t === "ArrowRight" ? i[a + 1] : i[a - 1];
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
			t.preventDefault(), Zn(r), M("node-click", {
				id: r,
				node: i
			});
		} else if (o === "+" || o === "=" || o === "Add" || o === "-" || o === "_" || o === "Subtract") {
			let n = o === "+" || o === "=" || o === "Add";
			if (m.readonly || !e(g, r) || !!i.collapsed !== n) return;
			t.preventDefault(), Bn(r);
		} else if (o === "ArrowUp" || o === "ArrowDown" || o === "ArrowLeft" || o === "ArrowRight" || o === "Home") {
			t.preventDefault();
			let e = zo(r, o);
			e && Io(e, !0);
		}
	});
	let Bo = -Infinity;
	N(I, "pointerdown", () => {
		Bo = performance.now();
	}, !0), N(ht, "focusin", (e) => {
		let t = e.target.closest && e.target.closest(".loc-node");
		if (!t) return;
		let n = t.dataset.id;
		n !== Mo && Io(n, !1), performance.now() - Bo > 500 && Lo(n);
	});
	function Vo() {
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
				if (t.dataset.mode) Ua(t.dataset.mode);
				else if (t.dataset.orient) Ha(t.dataset.orient);
				else if (t.dataset.flag) h[t.dataset.flag] = !h[t.dataset.flag], t.dataset.flag === "showGrid" ? Cn() : t.dataset.flag === "alignGrid" && (v = Object.create(null), V("align-grid")), Ho(), Y();
				else switch (t.dataset.act) {
					case "undo":
						la();
						break;
					case "redo":
						ua();
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
						Qa();
						break;
					case "reset":
						eo();
						break;
					case "fullscreen":
						ao();
						break;
					case "edit":
						si(!h.editMode);
						break;
					case "images":
						Za();
						break;
					case "legend":
						ki();
						break;
					case "settings":
						Pi();
						break;
					case "png":
						Fa(3);
						break;
					case "svg":
						Pa();
						break;
					case "pdf":
						La();
						break;
					case "json": wa(!0);
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
	function Ho() {
		F && (F.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === h.subtreeMode)), F.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === h.orientation)), F.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!h[e.dataset.flag])), F.querySelectorAll("button[data-act=\"edit\"]").forEach((e) => e.classList.toggle("loc-active", h.editMode)), F.querySelectorAll("button[data-act=\"images\"]").forEach((e) => e.classList.toggle("loc-active", h.showImages)), F.querySelectorAll("button[data-act=\"legend\"]").forEach((e) => e.classList.toggle("loc-active", h.showLegend)), F.querySelectorAll("button[data-act=\"fullscreen\"]").forEach((e) => e.classList.toggle("loc-active", no())), F.querySelectorAll("button[data-act=\"undo\"]").forEach((e) => {
			e.disabled = !oa();
		}), F.querySelectorAll("button[data-act=\"redo\"]").forEach((e) => {
			e.disabled = !sa();
		}));
	}
	N(document, "fullscreenchange", so), N(document, "webkitfullscreenchange", so);
	function Uo(e) {
		e && e.nodeType === 1 && (e.tagName === "BUTTON" && !e.getAttribute("type") && (e.type = "button"), e.querySelectorAll("button:not([type])").forEach((e) => {
			e.type = "button";
		}));
	}
	let Wo = null;
	if (typeof MutationObserver < "u") {
		Wo = new MutationObserver((e) => {
			for (let t of e) for (let e of t.addedNodes) Uo(e);
		});
		for (let e of /* @__PURE__ */ new Set([
			P,
			R,
			z,
			Ot
		])) Wo.observe(e, {
			childList: !0,
			subtree: !0
		});
	}
	if ([
		P,
		R,
		z,
		Ot
	].forEach(Uo), fa(), Ho(), Cn(), Di(), ai(), tt) {
		let e = V("initial");
		m.fitOnInit && e.then((e) => {
			e && Mn();
		});
	} else i(g) ? Xt(++Qe, "initial", n(i(g))) : (Nt(), Pt(), Ie = !1, et = Promise.resolve(!0), m.fitOnInit && Mn());
	aa(), typeof ResizeObserver < "u" && !m.targetSize && m.reflowOnResize && (Ze = I.clientWidth > 0 && I.clientHeight > 0 ? I.clientWidth / I.clientHeight : 0, Ye = new ResizeObserver(() => {
		if (h.subtreeMode !== "AutoSmart" && h.subtreeMode !== "GridSmart" && h.subtreeMode !== "Auto" || Object.keys(v).length || I.clientWidth <= 0 || I.clientHeight <= 0) return;
		let e = I.clientWidth / I.clientHeight;
		Ze && Math.abs(Math.log(e / Ze)) < .08 || (Ze = e, Xe && cancelAnimationFrame(Xe), Xe = requestAnimationFrame(() => {
			Xe = 0, V("resize").then((e) => {
				e && Mn();
			});
		}));
	}), Ye.observe(I));
	function Go() {
		if (!at) {
			ho && (clearTimeout(ho), ho = 0, Y()), Vt("destroyed"), Gt(), at = !0, rt.forEach(({ target: e, type: t, fn: n, optsL: r }) => e.removeEventListener(t, n, r)), rt.length = 0, Ge &&= (cancelAnimationFrame(Ge), 0), Wn(), Xe &&= (cancelAnimationFrame(Xe), 0), Dn &&= (cancelAnimationFrame(Dn), 0), Ye && Ye.disconnect(), En && En.disconnect(), Wo && Wo.disconnect(), di && clearTimeout(di), Xn(), A = null, X = null, Z = null, Tn = null, mo.clear(), R.remove(), z.remove(), Ot.remove(), P.remove();
			for (let e in E) delete E[e];
			for (let e in D) delete D[e];
			for (let e in O) delete O[e];
			for (let e in it) delete it[e];
		}
	}
	let Ko = {
		root: P,
		setNodes: za,
		loadJSON: Va,
		setOrientation: Ha,
		setSubtreeMode: Ua,
		setSpacing: Wa,
		setOption: Ga,
		setShowGrid: Ka,
		setSnapToGrid: qa,
		setAlignToGrid: Ja,
		toggleGrid: Ya,
		fitToScreen: Mn,
		zoomBy: Fn,
		relayout: Qa,
		forceRelayout: $a,
		resetView: eo,
		expandAll: Rn,
		collapseAll: zn,
		toggleCollapse: Bn,
		centerOnNode: Nn,
		search: Vn,
		clearSearch: Hn,
		exportJSON: wa,
		exportSVG: Pa,
		exportPNG: Fa,
		exportWebP: Ia,
		exportPDF: La,
		buildSVG: ja,
		setEditMode: si,
		isEditMode: () => h.editMode,
		isReadonly: () => !!m.readonly,
		setShowImages: Za,
		isShowingImages: () => h.showImages,
		setShowLegend: Oi,
		toggleLegend: ki,
		isShowingLegend: () => h.showLegend,
		getLegendBody: () => At,
		setAutoEdgeSide: Xa,
		isAutoEdgeSide: () => h.autoEdgeSide,
		setPhotoHeight: (e) => nn({ photoHeight: e }),
		setCardWidth: (e) => nn({ width: e }),
		setCardSize: nn,
		setPhotoRendering: nn,
		setPhotoContain: (e) => nn({ contain: e !== !1 }),
		getSelection: () => [...C],
		setSelection: (e) => mr(Array.isArray(e) ? e : e ? [e] : []),
		clearSelection: () => {
			hr(), dr();
		},
		getEdgeSelection: () => [...H],
		setEdgeSelection: br,
		clearEdgeSelection: yr,
		resetSelectedEdges: xr,
		getFamilyRouteSelection: () => h.selectedFamilyId,
		getFamilyNetworks: () => q(Be),
		getFamilyRouteOverrides: () => q(x),
		setFamilyRouteOverride: Lr,
		resetFamilyRoute: Ir,
		enterFullscreen: ro,
		exitFullscreen: io,
		toggleFullscreen: ao,
		isFullscreen: no,
		undo: la,
		redo: ua,
		canUndo: oa,
		canRedo: sa,
		updateNode: _i,
		addChild: yi,
		deleteNode: bi,
		reparentNode: Yr,
		detachNode: Xr,
		attachNode: Zr,
		beginAttach: $r,
		cancelAttach: ei,
		isAttaching: () => !!Qr,
		openInspector: ci,
		closeInspector: li,
		nodeScreenRect: Dr,
		getSettings: G,
		setSettings: Ni,
		toggleSettings: Pi,
		resetSettings: Fi,
		saveLayoutPreset: xa,
		loadLayoutPreset: Sa,
		deleteLayoutPreset: Ca,
		listLayoutPresets: ya,
		getLayoutPresets: ba,
		getLayout: _a,
		applyLayout: va,
		getNodeHost: (e) => E[e] || null,
		getNodeSlotEl: (e) => E[e] ? E[e].querySelector(".loc-node-slot") : null,
		getInspectorBody: () => Ct,
		getSettingsBody: () => Dt,
		nodeThemeStyle: (e) => _[e] ? me(_[e], Le) : null,
		getState: () => ({
			...h,
			familyRouteOverrides: q(x)
		}),
		getNodes: () => g.map((e) => ({ ...e })),
		getPositioned: () => w,
		isLayoutBusy: () => $e,
		whenLayoutSettled: () => et,
		cancelLayout: () => Vt("cancelled"),
		on: ot,
		off: st,
		destroy: Go
	}, qo = /* @__PURE__ */ new Set([
		"getPositioned",
		"getNodes",
		"getSelection",
		"getEdgeSelection",
		"listLayoutPresets",
		"getFamilyNetworks"
	]);
	for (let e of Object.keys(Ko)) {
		let t = Ko[e];
		typeof t == "function" && e !== "destroy" && (Ko[e] = function(...n) {
			return at ? e === "on" || e === "off" ? Ko : e === "whenLayoutSettled" ? Promise.resolve(!1) : qo.has(e) ? [] : !/^(is|can)[A-Z]/.test(e) && null : t.apply(this, n);
		});
	}
	return ot("layout-change", rr), Ko;
}
export { Pe as t };
