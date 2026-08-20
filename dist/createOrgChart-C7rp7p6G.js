import { C as e, D as t, E as n, I as r, L as i, N as a, R as o, S as s, V as c, c as l, d as u, f as ee, h as te, i as ne, k as re, n as ie, o as d, r as ae, s as oe, t as se, v as ce } from "./bounds-PDieHcY6.js";
import { a as le, i as ue, n as de, o as fe, s as pe } from "./core-ihvennbB.js";
//#region src/vanilla/layoutTarget.js
function f(e) {
	let t = Number(e?.clientWidth), n = Number(e?.clientHeight);
	return t > 0 && n > 0 ? {
		width: t,
		height: n
	} : null;
}
function me(e = {}, t = null) {
	return {
		targetAspect: e.targetAspect,
		targetSize: e.targetSize || (e.reflowOnResize ? f(t) : null)
	};
}
//#endregion
//#region src/core/layout.worker.js?worker
function he(e) {
	return new Worker("" + new URL("assets/layout.worker-cm6aFvCy.js", import.meta.url).href, { name: e?.name });
}
//#endregion
//#region src/vanilla/cloneLayoutValue.js
function ge(e) {
	if (typeof structuredClone == "function") try {
		return structuredClone(e);
	} catch {}
	return JSON.parse(JSON.stringify(e));
}
//#endregion
//#region src/vanilla/createOrgChart.js
var _e = 140, ve = "http://www.w3.org/2000/svg", ye = .72, p = 12, be = /* @__PURE__ */ new Map();
function xe(e, t) {
	for (be.has(e) && be.delete(e), be.set(e, ge(t)); be.size > p;) be.delete(be.keys().next().value);
}
var Se = {
	Top: "TopToBottom",
	Bottom: "BottomToTop",
	Left: "LeftToRight",
	Right: "RightToLeft"
};
function Ce(e) {
	return Se[e] || e;
}
var we = {
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
	photoHeight: i.height - 140,
	cardWidth: i.width,
	textHeight: 140,
	departmentWidth: a.width,
	departmentHeight: a.height,
	photoContain: o.fit === "contain",
	virtualPhotoFrame: c,
	renderedImage: o,
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
	layoutCache: !0,
	toolbar: !0,
	advancedLayoutControls: !1,
	persist: !1,
	storageKey: "local-org-chart.state"
};
function Te(r, f = {}) {
	if (!r || !r.appendChild) throw Error("createOrgChart: first argument must be a DOM element.");
	let p = Object.assign({}, we, f), Se = p.alignGrid == null ? p.subtreeMode === "GridSmart" : !!p.alignGrid, Te = +p.maxZoom > 1 ? +p.maxZoom : 4, m = {
		orientation: Ce(p.orientation),
		subtreeMode: p.subtreeMode,
		spacingX: p.spacingX,
		spacingY: p.spacingY,
		zoom: 1,
		panX: 0,
		panY: 0,
		selectedNodeId: null,
		selectedEdgeId: null,
		selectedFamilyId: null,
		gridSize: p.gridSize,
		showGrid: p.showGrid,
		snapGrid: p.snapGrid,
		alignGrid: Se,
		editMode: !!p.editMode,
		showImages: p.showImages !== !1,
		showLegend: !!p.legend,
		autoEdgeSide: !!p.autoEdgeSide,
		photoHeight: +f.photoHeight || +(f.node && f.node.photoHeight) || i.height - 140,
		cardWidth: +f.cardWidth || +(f.node && f.node.width) || i.width,
		textHeight: +f.textHeight || +(f.node && f.node.textHeight) || 140,
		departmentWidth: +f.departmentWidth || +(f.departmentNode && f.departmentNode.width) || a.width,
		departmentHeight: +f.departmentHeight || +(f.departmentNode && f.departmentNode.height) || a.height,
		photoContain: f.photoContain == null ? !(f.renderedImage && f.renderedImage.fit && f.renderedImage.fit !== "contain") : f.photoContain !== !1,
		photoFrameWidth: +(f.virtualPhotoFrame && f.virtualPhotoFrame.width) || c.width,
		photoFrameHeight: +(f.virtualPhotoFrame && f.virtualPhotoFrame.height) || c.height,
		photoImageWidth: +(f.renderedImage && f.renderedImage.width) || o.width,
		photoImageHeight: +(f.renderedImage && f.renderedImage.height) || o.height,
		photoOffsetX: Number.isFinite(+(f.renderedImage && f.renderedImage.offsetX)) ? +(f.renderedImage && f.renderedImage.offsetX) : o.offsetX,
		photoOffsetY: Number.isFinite(+(f.renderedImage && f.renderedImage.offsetY)) ? +(f.renderedImage && f.renderedImage.offsetY) : o.offsetY,
		photoBackground: f.photoBackground || "#004264"
	}, h = (p.nodes || []).map(s), g = re(h), _ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.assign(Object.create(null), p.familyRouteOverrides || {}), x = Object.create(null), S = /* @__PURE__ */ new Set();
	p.settings && Nt(p.settings);
	let C = (p.settings && p.settings.themeRules || p.themeRules || []).map(de), w = {
		spacingX: p.spacingX,
		spacingY: p.spacingY,
		gridSize: p.gridSize,
		showGrid: !!p.showGrid,
		snapGrid: !!p.snapGrid,
		alignGrid: Se,
		cardWidth: m.cardWidth,
		photoHeight: m.photoHeight,
		textHeight: m.textHeight,
		departmentWidth: m.departmentWidth,
		departmentHeight: m.departmentHeight,
		photoContain: m.photoContain,
		photoFrameWidth: m.photoFrameWidth,
		photoFrameHeight: m.photoFrameHeight,
		photoImageWidth: m.photoImageWidth,
		photoImageHeight: m.photoImageHeight,
		photoOffsetX: m.photoOffsetX,
		photoOffsetY: m.photoOffsetY,
		photoBackground: m.photoBackground,
		themeRules: C.map((e) => ({
			enabled: e.enabled,
			field: e.field,
			value: e.value,
			style: Object.assign({}, e.style)
		}))
	}, Ee = 0, T = [], E = Object.create(null), De = [], Oe = [], ke = null, D = Object.create(null), O = Object.create(null), k = Object.create(null), Ae = Object.create(null), A = null, je = null, j = null, Me = 0, Ne = /* @__PURE__ */ new Set(), Pe = null, Fe = 0, Ie = null, Le = 0, Re = 0, ze = 0, M = null, Be = !1, Ve = Promise.resolve(!0), He = p.layoutWorker !== !1 && typeof Worker < "u", Ue = [], We = Object.create(null);
	function Ge(e, t) {
		return (We[e] || (We[e] = [])).push(t), ha;
	}
	function Ke(e, t) {
		return We[e] && (We[e] = We[e].filter((e) => e !== t)), ha;
	}
	function N(e, t) {
		(We[e] || []).forEach((e) => {
			try {
				e(t);
			} catch {}
		});
	}
	function P(e, t, n, r) {
		e.addEventListener(t, n, r), Ue.push({
			target: e,
			type: t,
			fn: n,
			optsL: r
		});
	}
	let F = document.createElement("div");
	F.className = "loc-root", F.tabIndex = -1;
	let I = p.toolbar ? fa() : null;
	I && F.appendChild(I);
	let L = H("div", "loc-canvas"), qe = H("div", "loc-content"), Je = H("div", "loc-grid"), Ye = document.createElementNS(ve, "svg");
	Ye.setAttribute("class", "loc-connectors");
	let Xe = document.createElementNS(ve, "g");
	Xe.setAttribute("class", "loc-visible-edges");
	let Ze = document.createElementNS(ve, "g");
	Ze.setAttribute("class", "loc-logical-edges");
	let Qe = document.createElementNS(ve, "g");
	Qe.setAttribute("class", "loc-edgehits");
	let $e = document.createElementNS(ve, "g");
	$e.setAttribute("class", "loc-familyhits"), Ye.appendChild(Xe), Ye.appendChild(Ze), Ye.appendChild(Qe), Ye.appendChild($e);
	let et = H("div", "loc-nodes"), R = document.createElementNS(ve, "svg");
	R.setAttribute("class", "loc-overlay");
	let z = document.createElementNS(ve, "g");
	z.setAttribute("class", "loc-edgehandles");
	let tt = document.createElementNS(ve, "g");
	tt.setAttribute("class", "loc-family-selection");
	let nt = document.createElementNS(ve, "g");
	nt.setAttribute("class", "loc-aligns"), R.appendChild(nt), R.appendChild(tt), R.appendChild(z);
	let rt = H("div", "loc-zoomreadout");
	rt.textContent = "100%";
	let it = H("div", "loc-layout-status");
	it.hidden = !0, it.setAttribute("role", "status"), it.setAttribute("aria-live", "polite"), it.innerHTML = "<span class=\"loc-layout-spinner\" aria-hidden=\"true\"></span><span>Arranging chart&hellip;</span>", qe.appendChild(Je), qe.appendChild(Ye), qe.appendChild(et), qe.appendChild(R), L.appendChild(qe), L.appendChild(rt), L.appendChild(it);
	let at = null;
	p.fullscreenControl && (at = H("button", "loc-fsbtn"), at.type = "button", at.title = "Fullscreen", at.setAttribute("aria-label", "Toggle fullscreen"), at.innerHTML = "⛶", P(at, "click", (e) => {
		e.stopPropagation(), ia();
	}), L.appendChild(at)), F.appendChild(L);
	let B = H("div", "loc-panel");
	B.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Node</span><button class=\"loc-panel-close\" title=\"Close\" data-role=\"panel-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"panel-body\"></div><div class=\"loc-panel-foot\" data-role=\"panel-foot\"></div>";
	let ot = ht(p.inspectorTarget) || L;
	ot.appendChild(B), ot !== L && B.classList.add("loc-panel-external");
	let st = B.querySelector("[data-role=\"panel-body\"]"), ct = B.querySelector("[data-role=\"panel-foot\"]"), lt = B.querySelector(".loc-panel-title"), V = H("div", "loc-settings");
	V.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Settings</span><button class=\"loc-panel-close\" title=\"Close\" data-role=\"settings-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"settings-body\"></div>";
	let ut = ht(p.settingsTarget) || L;
	ut.appendChild(V), ut !== L && V.classList.add("loc-panel-external");
	let dt = V.querySelector("[data-role=\"settings-body\"]"), ft = H("div", "loc-legend");
	ft.innerHTML = "<div class=\"loc-legend-head\"><span class=\"loc-legend-title\">Legend</span><button class=\"loc-legend-close\" title=\"Hide legend\" data-role=\"legend-close\">✕</button></div><div class=\"loc-legend-body\" data-role=\"legend-body\"></div>";
	let pt = ht(p.legendTarget) || L;
	pt.appendChild(ft), pt !== L && ft.classList.add("loc-legend-external");
	let mt = ft.querySelector("[data-role=\"legend-body\"]");
	jt(), Mt(), r.appendChild(F);
	function H(e, t) {
		let n = document.createElement(e);
		return t && (n.className = t), n;
	}
	function ht(e) {
		if (!e) return null;
		let t = typeof e == "string" ? document.querySelector(e) : e;
		return t && t.appendChild ? t : null;
	}
	function gt() {
		let e = me(p, L);
		return te({
			orientation: m.orientation,
			subtreeMode: m.subtreeMode,
			spacingX: m.spacingX,
			spacingY: m.spacingY,
			gridSize: m.gridSize,
			alignGrid: m.alignGrid,
			autoEdgeSide: m.autoEdgeSide,
			familyRouteOverrides: b,
			targetAspect: e.targetAspect,
			targetSize: e.targetSize
		});
	}
	function _t() {
		let e = gt(), t = ee(h, e);
		St(t), p.layoutCache !== !1 && xe(bt(h, e), yt(t));
	}
	function vt() {
		F.classList.toggle("loc-horizontal", u(gt())), Zt(), qt(), At(), Xt(), ln(), m.showLegend && Hr(), X(), N("layout-change", {
			positioned: T,
			familyNetworks: De,
			mode: m.subtreeMode,
			orientation: m.orientation
		});
	}
	function yt(e) {
		return {
			positioned: e.positioned,
			bounds: e.bounds,
			framingBounds: e.framingBounds,
			familyNetworks: e.familyNetworks || [],
			cfg: e.cfg
		};
	}
	function bt(e, t) {
		return JSON.stringify({
			nodes: e,
			options: t
		});
	}
	function xt() {
		let e = Object.create(null);
		for (let t of Object.keys(_)) {
			let n = E[t];
			n && (e[t] = d(n, _));
		}
		return e;
	}
	function St(e, t) {
		let n = ge(yt(e)), r = xt(), i = Object.assign(Object.create(null), t || {}, r);
		for (let e of n.positioned || []) {
			let t = g[String(e.node.id)];
			t && (e.node = Object.assign({}, e.node, ge(t)));
		}
		T = n.positioned || [], E = Object.create(null);
		for (let e of T) E[String(e.node.id)] = e;
		De = n.familyNetworks || [], ke = n.framingBounds || n.bounds || null;
		for (let e of Object.keys(i)) {
			let t = E[e];
			if (!t) {
				delete _[e];
				continue;
			}
			let n = i[e].x - t.cx, r = i[e].y - t.cy;
			Math.abs(n) > .5 || Math.abs(r) > .5 ? _[e] = {
				dx: n,
				dy: r
			} : delete _[e];
		}
	}
	function Ct(e) {
		Be = !!e;
		let t = Be && T.length === 0;
		F.classList.toggle("loc-layout-busy", Be), F.classList.toggle("loc-layout-initial-busy", t), it.hidden = !t, Be ? F.setAttribute("aria-busy", "true") : F.removeAttribute("aria-busy");
	}
	function wt(e = "superseded", t = !1) {
		let n = M;
		return n ? (M = null, n.worker && n.worker.terminate(), n.timer && clearTimeout(n.timer), n.resolve(!1), N("layout-cancel", {
			id: n.id,
			reason: n.reason,
			cause: e
		}), t || Ct(!1), !0) : !1;
	}
	function Tt(e, t, n, r) {
		return !M || M.id !== e.id || e.id !== ze ? !1 : (M = null, St(t, e.pins), vt(), Ct(!1), N("layout-complete", {
			id: e.id,
			reason: e.reason,
			durationMs: Math.round(n || 0),
			cached: !!r
		}), e.resolve(!0), !0);
	}
	function Et(e, t) {
		!M || M.id !== e.id || (M = null, Ct(!1), N("layout-error", {
			id: e.id,
			reason: e.reason,
			error: t instanceof Error ? t : Error(t?.message || String(t))
		}), e.resolve(!1));
	}
	function Dt(e, t, n) {
		n && (He = !1, N("layout-error", {
			id: e.id,
			reason: e.reason,
			error: n,
			fallback: !0
		})), e.timer = setTimeout(() => {
			if (e.timer = 0, !M || M.id !== e.id) return;
			let n = performance.now();
			try {
				let r = ee(t.nodes, t.options);
				p.layoutCache !== !1 && xe(e.signature, yt(r)), Tt(e, r, performance.now() - n, !1);
			} catch (t) {
				Et(e, t);
			}
		}, 0);
	}
	function Ot(e = "refresh", t = {}) {
		wt("superseded", !0);
		let n = ++ze, r = gt(), i = bt(h, r), a = t.pins || (t.preserveManual ? xt() : null), o, s = new Promise((e) => {
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
		M = c, Ve = s, Ct(!0), N("layout-start", {
			id: n,
			reason: e
		});
		let l = p.layoutCache !== !1 && be.get(i);
		if (l) return Promise.resolve().then(() => Tt(c, l, 0, !0)), s;
		let u = JSON.parse(i);
		if (!He) return Dt(c, u), s;
		try {
			let e = new he();
			c.worker = e, e.addEventListener("message", (t) => {
				let n = t.data || {};
				if (!(n.id !== c.id || !M || M.id !== c.id)) {
					if (e.terminate(), c.worker = null, !n.ok) {
						Et(c, Error(n.error?.message || "Layout worker failed."));
						return;
					}
					p.layoutCache !== !1 && xe(i, n.result), Tt(c, n.result, n.durationMs, !1);
				}
			}), e.addEventListener("error", (t) => {
				!M || M.id !== c.id || (e.terminate(), c.worker = null, Dt(c, u, Error(t.message || "Layout worker failed to load.")));
			}, { once: !0 }), e.postMessage({
				id: n,
				nodes: u.nodes,
				options: u.options
			});
		} catch (e) {
			c.worker && c.worker.terminate(), c.worker = null, Dt(c, u, e);
		}
		return s;
	}
	function U(e = "refresh", t) {
		return Ot(e, t);
	}
	function kt(e) {
		let t = Object.create(null);
		for (let e of T) t[e.node.id] = d(e, _);
		return e(), Ot("structural-edit", { pins: t });
	}
	function At() {
		let e = Object.create(null);
		for (let t of T) {
			let n = t.node;
			e[n.id] = !0;
			let r = D[n.id];
			r || (r = It(n), D[n.id] = r, et.appendChild(r)), r.style.width = n.width + "px", r.style.height = n.height + "px";
			let i = d(t, _);
			r.style.transform = `translate(${i.x - n.width / 2}px, ${i.y - n.height / 2}px)`, p.nodeSlots || (r.dataset.fitted || (zt(r), r.dataset.fitted = "1"), Fr(r, n)), r.classList.toggle("loc-selected", S.has(n.id)), r.classList.toggle("loc-primary", m.selectedNodeId === n.id && S.size > 1), Bt(r, n);
		}
		for (let t in D) e[t] || (D[t].remove(), delete D[t]);
		N("nodes-rendered", { ids: T.map((e) => e.node.id) });
	}
	function jt() {
		let e = Math.max(1, m.photoFrameWidth || c.width), t = Math.max(1, m.photoFrameHeight || c.height);
		F.style.setProperty("--loc-photo-h", (m.photoHeight || i.height - 140) + "px"), F.style.setProperty("--loc-photo-fit", m.photoContain ? "contain" : "cover"), F.style.setProperty("--loc-photo-image-w", (m.photoImageWidth / e * 100).toFixed(4) + "%"), F.style.setProperty("--loc-photo-image-h", (m.photoImageHeight / t * 100).toFixed(4) + "%"), F.style.setProperty("--loc-photo-offset-x", (m.photoOffsetX / e * 100).toFixed(4) + "%"), F.style.setProperty("--loc-photo-offset-y", (m.photoOffsetY / t * 100).toFixed(4) + "%"), F.style.setProperty("--loc-photo-bg", m.photoBackground || "#004264");
	}
	function Mt() {
		let e = Math.max(100, m.cardWidth || i.width), t = Math.max(60, (m.photoHeight || i.height - 140) + (m.textHeight || _e)), n = Math.max(100, m.departmentWidth || a.width), r = Math.max(50, m.departmentHeight || a.height);
		for (let i of h) i.type === "department" ? (i.width = n, i.height = r) : (i.width = e, i.height = t);
	}
	function Nt(e) {
		e ||= {};
		let t = [
			m.cardWidth,
			m.photoHeight,
			m.textHeight,
			m.departmentWidth,
			m.departmentHeight
		].join("|"), n = [
			m.photoContain,
			m.photoFrameWidth,
			m.photoFrameHeight,
			m.photoImageWidth,
			m.photoImageHeight,
			m.photoOffsetX,
			m.photoOffsetY,
			m.photoBackground
		].join("|"), r = e.node || {}, i = e.departmentNode || {}, a = e.virtualPhotoFrame || {}, o = e.renderedImage || {}, s = typeof e.width == "number" ? e.width : typeof e.cardWidth == "number" ? e.cardWidth : r.width, c = typeof e.photoHeight == "number" ? e.photoHeight : r.photoHeight, l = typeof e.textHeight == "number" ? e.textHeight : r.textHeight;
		typeof l != "number" && typeof r.totalHeight == "number" && typeof c == "number" && (l = r.totalHeight - c), typeof s == "number" && (m.cardWidth = Math.max(100, s)), typeof c == "number" && (m.photoHeight = Math.max(40, c)), typeof l == "number" && (m.textHeight = Math.max(40, l));
		let u = typeof e.departmentWidth == "number" ? e.departmentWidth : i.width, ee = typeof e.departmentHeight == "number" ? e.departmentHeight : i.height;
		typeof u == "number" && (m.departmentWidth = Math.max(100, u)), typeof ee == "number" && (m.departmentHeight = Math.max(50, ee));
		let te = typeof e.photoFrameWidth == "number" ? e.photoFrameWidth : a.width, ne = typeof e.photoFrameHeight == "number" ? e.photoFrameHeight : a.height, re = typeof e.photoImageWidth == "number" ? e.photoImageWidth : o.width, ie = typeof e.photoImageHeight == "number" ? e.photoImageHeight : o.height, d = typeof e.photoOffsetX == "number" ? e.photoOffsetX : o.offsetX, ae = typeof e.photoOffsetY == "number" ? e.photoOffsetY : o.offsetY;
		return typeof te == "number" && (m.photoFrameWidth = Math.max(1, te)), typeof ne == "number" && (m.photoFrameHeight = Math.max(1, ne)), typeof re == "number" && (m.photoImageWidth = Math.max(1, re)), typeof ie == "number" && (m.photoImageHeight = Math.max(1, ie)), typeof d == "number" && (m.photoOffsetX = d), typeof ae == "number" && (m.photoOffsetY = ae), "contain" in e ? m.photoContain = !!e.contain : "photoContain" in e ? m.photoContain = !!e.photoContain : o.fit && (m.photoContain = o.fit === "contain"), typeof e.photoBackground == "string" && e.photoBackground.trim() && (m.photoBackground = e.photoBackground.trim()), {
			sizeChanged: t !== [
				m.cardWidth,
				m.photoHeight,
				m.textHeight,
				m.departmentWidth,
				m.departmentHeight
			].join("|"),
			renderChanged: n !== [
				m.photoContain,
				m.photoFrameWidth,
				m.photoFrameHeight,
				m.photoImageWidth,
				m.photoImageHeight,
				m.photoOffsetX,
				m.photoOffsetY,
				m.photoBackground
			].join("|")
		};
	}
	function Pt(e) {
		let t = Nt(e);
		if (jt(), t.sizeChanged) {
			Mt();
			for (let e in D) delete D[e].dataset.fitted;
			At(), U("card-size");
		}
		X(), N("settings-change", K());
	}
	function Ft(e) {
		e.textContent = "", e.innerHTML = "<svg class=\"loc-usericon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7\"/></svg>";
	}
	function It(e) {
		if (p.nodeSlots) {
			let t = H("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
			return t.dataset.id = e.id, t.innerHTML = "<div class=\"loc-node-slot\"></div>", t.appendChild(Lt()), t;
		}
		let t = H("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
		if (t.dataset.id = e.id, e.type === "department") t.innerHTML = "<span class=\"loc-lbl\"></span>", t.querySelector(".loc-lbl").textContent = e.label, t.querySelector(".loc-lbl").title = e.label || "";
		else {
			t.innerHTML = "<div class=\"loc-photo\"></div><div class=\"loc-ptext\"><div class=\"loc-pname\"></div><div class=\"loc-ptitle\"></div><div class=\"loc-badge\"></div></div>";
			let n = t.querySelector(".loc-photo"), r = e.data && e.data.photo_url;
			if (m.showImages && r) {
				let t = new Image();
				t.crossOrigin = "anonymous", t.alt = e.personName || "", t.referrerPolicy = "no-referrer", t.onerror = () => {
					Ft(n);
				}, t.src = r, n.appendChild(t);
			} else Ft(n);
			let i = t.querySelector(".loc-pname"), a = t.querySelector(".loc-ptitle");
			i.textContent = e.personName || "—", i.title = e.personName || "", a.textContent = e.label, a.title = e.label || "";
			let o = t.querySelector(".loc-badge");
			e.status ? (o.textContent = e.status, o.className = "loc-badge loc-" + e.status) : o.remove();
		}
		return t.appendChild(Lt()), t;
	}
	function Lt() {
		let e = H("div", "loc-toggle");
		return e.dataset.role = "toggle", e;
	}
	function Rt(e) {
		return e.scrollWidth > e.clientWidth + .5 || e.scrollHeight > e.clientHeight + .5;
	}
	function zt(e) {
		if (e.style.setProperty("--loc-fit", "1"), !Rt(e)) return;
		let t = ye, n = 1;
		for (let r = 0; r < 7; r++) {
			let r = (t + n) / 2;
			e.style.setProperty("--loc-fit", String(r)), Rt(e) ? n = r : t = r;
		}
		e.style.setProperty("--loc-fit", String(t));
	}
	function Bt(e, t) {
		let r = e.querySelector("[data-role=\"toggle\"]");
		if (!r) return;
		let i = n(h, t.id) > 0;
		r.style.display = i ? "flex" : "none", r.textContent = t.collapsed ? "+" : "−";
		let a = t.collapsed ? "Expand" : "Collapse";
		r.title = a, r.setAttribute("aria-label", a);
	}
	function Vt(e) {
		return document.createElementNS(ve, e);
	}
	function Ht(e) {
		return l(E[e.node.parentId], e, gt(), _, v, y);
	}
	function Ut(e) {
		return `M ${e.a.x.toFixed(1)} ${e.a.y.toFixed(1)} L ${e.b.x.toFixed(1)} ${e.b.y.toFixed(1)}`;
	}
	function Wt() {
		let e = /* @__PURE__ */ new Set(), t = (e) => {
			let t = _[e];
			return t && (Math.abs(Number(t.dx) || 0) > .01 || Math.abs(Number(t.dy) || 0) > .01);
		};
		for (let n of De) {
			let r = String(n.parentId);
			(t(r) || n.childIds.some((e) => t(e) || v[e] && v[e].length || y[e])) && e.add(r);
		}
		return e;
	}
	function Gt(e = null) {
		let t = e || Object.entries(O).map(([e, t]) => ({
			id: e,
			d: t.getAttribute("d") || ""
		})), n = ce(t, De, { rebuildFamilyIds: Wt() });
		Oe = n.familyNetworks, Xe.innerHTML = "";
		for (let e of n.segments) {
			let t = Vt("path");
			t.setAttribute("d", e.d), t.setAttribute("class", "loc-visible-edge"), t.dataset.edges = e.memberIds.join(","), Xe.appendChild(t);
		}
	}
	function Kt() {
		let e = Object.create(null);
		tt.innerHTML = "";
		for (let t of Oe) {
			if (!t.trunk) continue;
			let n = String(t.parentId);
			e[n] = !0;
			let r = Ae[n];
			if (r || (r = Vt("path"), r.dataset.family = n, Ae[n] = r, $e.appendChild(r)), r.setAttribute("d", Ut(t.trunk)), r.dataset.children = t.trunk.childIds.join(","), m.selectedFamilyId === n) for (let e of t.segments) {
				let t = Vt("path");
				t.setAttribute("d", e.d || Ut(e)), t.setAttribute("class", "loc-family-selected"), tt.appendChild(t);
			}
		}
		for (let t in Ae) e[t] || (Ae[t].remove(), delete Ae[t]);
		m.selectedFamilyId && !e[m.selectedFamilyId] && Jn();
	}
	function qt() {
		let e = Object.create(null), t = [];
		for (let n of T) {
			let r = n.node;
			if (!r.parentId || !E[r.parentId]) continue;
			e[r.id] = !0;
			let i = Ht(n);
			t.push({
				id: r.id,
				d: i
			});
			let a = O[r.id];
			a || (a = Vt("path"), a.setAttribute("class", "loc-logical-edge"), O[r.id] = a, Ze.appendChild(a)), a.setAttribute("d", i), a.classList.toggle("loc-sel", m.selectedEdgeId === r.id), a.classList.toggle("loc-incident", kn(r));
			let o = k[r.id];
			o || (o = Vt("path"), o.dataset.edge = r.id, k[r.id] = o, Qe.appendChild(o)), o.setAttribute("d", i);
		}
		for (let t in O) e[t] || (O[t].remove(), delete O[t]);
		for (let t in k) e[t] || (k[t].remove(), delete k[t]);
		Gt(t), Kt(), An(), m.selectedEdgeId && !e[m.selectedEdgeId] ? Kn() : $n();
	}
	function Jt(e) {
		let t = E[e];
		if (!t || !E[t.node.parentId]) return;
		let n = Ht(t);
		return O[e] && O[e].setAttribute("d", n), k[e] && k[e].setAttribute("d", n), !0;
	}
	function Yt(e) {
		Jt(e) && (Gt(), Kt());
	}
	function Xt() {
		qe.style.transform = `translate(${m.panX}px, ${m.panY}px) scale(${m.zoom})`, rt.textContent = Math.round(m.zoom * 100) + "%", m.selectedEdgeId && !A && $n(), X();
	}
	function Zt() {
		let e = 0, t = 0, n = 0, r = 0;
		for (let i of T) {
			let a = d(i, _), o = i.node.width / 2, s = i.node.height / 2;
			e = Math.min(e, a.x - o - 80), t = Math.min(t, a.y - s - 80), n = Math.max(n, a.x + o + 80), r = Math.max(r, a.y + s + 80);
		}
		Ye.setAttribute("width", n), Ye.setAttribute("height", r), R.setAttribute("width", n), R.setAttribute("height", r);
		let i = m.gridSize;
		Je.style.left = e + "px", Je.style.top = t + "px", Je.style.width = n - e + "px", Je.style.height = r - t + "px", Je.style.backgroundSize = i + "px " + i + "px", Je.style.backgroundPosition = (-e % i + i) % i + "px " + (-t % i + i) % i + "px";
	}
	function Qt() {
		Je.classList.toggle("loc-on", m.showGrid), L.classList.toggle("loc-gridon", m.showGrid);
	}
	function $t() {
		if (!T.length) return;
		let e = Ai(0), t = ie(e, L.clientWidth, L.clientHeight);
		m.zoom = t.zoom, m.panX = t.panX, m.panY = t.panY, Xt();
	}
	function en(e) {
		let t = E[e];
		if (!t) return;
		let n = d(t, _);
		m.panX = L.clientWidth / 2 - n.x * m.zoom, m.panY = L.clientHeight / 2 - n.y * m.zoom, Xt();
	}
	function tn() {
		let e = p.fitOnLayoutChange;
		return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
	}
	function nn() {
		let e = tn();
		if (e === "fit") {
			$t();
			return;
		}
		if (e === "recenter") {
			let e = h.find((e) => !e.parentId), t = m.selectedNodeId && E[m.selectedNodeId] ? m.selectedNodeId : e && e.id;
			t && en(t);
		}
	}
	function rn() {
		for (let e of h) e.collapsed = !1;
		U("expand-all"), Y();
	}
	function an() {
		let e = t(h, g);
		for (let t of h) t.collapsed = e[t.id] >= 1 && n(h, t.id) > 0;
		U("collapse-all"), Y();
	}
	function on(e) {
		let t = g[e];
		t && (kt(() => {
			t.collapsed = !t.collapsed;
		}), Rn(), Y());
	}
	function sn(e) {
		if (Ne = pe(h, e), ln(), Ne.size) {
			let e = T.find((e) => Ne.has(e.node.id));
			e && en(e.node.id);
		}
		return Ne.size;
	}
	function cn() {
		Ne = /* @__PURE__ */ new Set(), ln();
	}
	function ln() {
		let e = Ne.size > 0;
		for (let t of T) {
			let n = D[t.node.id];
			if (!n) continue;
			let r = Ne.has(t.node.id);
			n.classList.toggle("loc-highlight", e && r), n.classList.toggle("loc-dim", e && !r);
		}
		for (let t in O) O[t].classList.toggle("loc-hl", e && Ne.has(t));
	}
	function un() {
		Fe && clearTimeout(Fe), Fe = 0, Pe = null;
	}
	function dn(e) {
		un(), Pe = String(e), Fe = setTimeout(un, 0);
	}
	function fn(e) {
		if (e) {
			for (let t of e.groupIds) bn(t);
			xn(e.groupIds), N("node-drag", {
				id: e.id,
				node: g[e.id],
				offset: _[e.id],
				group: e.groupIds
			});
		}
	}
	function pn(e, t) {
		if (e.target.closest("[data-role=\"toggle\"]") || (e.stopPropagation(), da(), dr && mr(t))) return;
		if (Kn(), Jn(), e.ctrlKey || e.metaKey) {
			Tn(t);
			return;
		}
		if (S.has(t) ? (m.selectedNodeId = t, Sn(), Rn()) : wn(t), N("node-select", {
			id: t,
			node: g[t],
			rect: zn(t)
		}), p.readonly || !p.enableDragging || !m.editMode) {
			p.inspector && br(t);
			return;
		}
		let n = S.has(t) && S.size > 1 ? [...S] : [t], r = Object.create(null);
		for (let e of n) {
			let t = _[e] || {
				dx: 0,
				dy: 0
			};
			r[e] = {
				dx: t.dx,
				dy: t.dy
			}, D[e] && D[e].classList.add("loc-dragging");
		}
		j = {
			id: t,
			groupIds: n,
			bases: r,
			startX: e.clientX,
			startY: e.clientY,
			moved: !1
		}, N("node-drag-start", {
			id: t,
			node: g[t],
			group: n
		}), Z("pointermove", mn), Z("pointerup", hn);
	}
	function mn(e) {
		if (!j) return;
		let t = (e.clientX - j.startX) / m.zoom, n = (e.clientY - j.startY) / m.zoom;
		Math.abs(e.clientX - j.startX) + Math.abs(e.clientY - j.startY) > 3 && (j.moved = !0);
		let r = E[j.id], i = j.bases[j.id];
		if (r) {
			let e = r.cx + i.dx, a = r.cy + i.dy;
			if (m.snapGrid) {
				let r = m.gridSize;
				t = Math.round((e + t) / r) * r - e, n = Math.round((a + n) / r) * r - a;
			}
			if (j.groupIds.length === 1) {
				let r = gn(j.id, e + t, a + n);
				t = r.cx - e, n = r.cy - a, vn(r.gx, r.gy);
			}
		}
		for (let e of j.groupIds) {
			let r = j.bases[e];
			_[e] = {
				dx: r.dx + t,
				dy: r.dy + n
			};
		}
		Me ||= requestAnimationFrame(() => {
			Me = 0, fn(j);
		});
	}
	function hn() {
		let e = !1, t = j;
		if (t) {
			Me && (cancelAnimationFrame(Me), Me = 0, fn(t));
			for (let e of t.groupIds) D[e] && D[e].classList.remove("loc-dragging");
			N("node-drag-end", {
				id: t.id,
				node: g[t.id],
				offset: _[t.id],
				group: t.groupIds
			}), Zt(), e = !!t.moved, e ? dn(t.id) : p.inspector && br(t.id);
		}
		j = null, yn(), Q("pointermove", mn), Q("pointerup", hn), X(), e && Y();
	}
	function gn(e, t, n) {
		if (!p.snapAlign) return {
			cx: t,
			cy: n,
			gx: null,
			gy: null
		};
		let r = g[e];
		if (!r) return {
			cx: t,
			cy: n,
			gx: null,
			gy: null
		};
		let i = 8 / m.zoom, a = [], o = [], s = r.parentId && E[r.parentId];
		s && a.push(d(s, _).x);
		for (let t of T) {
			if (t.node.id === e || !r.parentId || t.node.parentId !== r.parentId) continue;
			let n = d(t, _);
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
	function _n(e, t) {
		if (!p.snapAlign) return t;
		let n = E[e];
		if (!n) return t;
		let r = E[n.node.parentId], i = 8 / m.zoom, a = d(n, _), o = [a.x], s = [a.y];
		if (r) {
			let e = d(r, _);
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
		return vn(c, ee), {
			x: u,
			y: ne
		};
	}
	function vn(e, t) {
		nt.innerHTML = "";
		let n = +R.getAttribute("width") || 0, r = +R.getAttribute("height") || 0, i = (e, t, n, r) => {
			let i = Vt("line");
			i.setAttribute("x1", e), i.setAttribute("y1", t), i.setAttribute("x2", n), i.setAttribute("y2", r), i.setAttribute("class", "loc-align-line"), nt.appendChild(i);
		};
		e != null && i(e, 0, e, r), t != null && i(0, t, n, t);
	}
	function yn() {
		nt.innerHTML = "";
	}
	function bn(e) {
		let t = E[e], n = D[e];
		if (!t || !n) return;
		let r = d(t, _);
		n.style.transform = `translate(${r.x - t.node.width / 2}px, ${r.y - t.node.height / 2}px)`;
	}
	function xn(e) {
		let t = new Set((e || []).map(String)), n = /* @__PURE__ */ new Set();
		for (let e of t) {
			let t = E[e];
			t && E[t.node.parentId] && n.add(String(e));
		}
		for (let e of T) t.has(String(e.node.parentId)) && n.add(String(e.node.id));
		let r = !1;
		for (let e of n) r = Jt(e) || r;
		r && (Gt(), Kt()), m.selectedEdgeId && $n();
	}
	function Sn() {
		for (let e in D) D[e].classList.toggle("loc-selected", S.has(e)), D[e].classList.toggle("loc-primary", m.selectedNodeId === e && S.size > 1);
	}
	function Cn() {
		N("selection-change", {
			ids: [...S],
			primary: m.selectedNodeId
		});
	}
	function wn(e) {
		S = new Set(e ? [e] : []), m.selectedNodeId = e || null, Sn(), Rn();
	}
	function Tn(e) {
		S.has(e) ? (S.delete(e), m.selectedNodeId === e && (m.selectedNodeId = S.size ? [...S][S.size - 1] : null)) : (S.add(e), m.selectedNodeId = e), Sn(), Rn(), Cn();
	}
	function En(e, t) {
		S = new Set(e), m.selectedNodeId = t ?? (e.length ? e[e.length - 1] : null), Sn(), Rn(), Cn();
	}
	function Dn() {
		S = /* @__PURE__ */ new Set(), m.selectedNodeId = null, Sn(), Rn();
	}
	function On(e) {
		let t = Bn(e.clientX, e.clientY), n = e.shiftKey ? new Set(S) : /* @__PURE__ */ new Set(), r = Vt("rect");
		r.setAttribute("class", "loc-marquee"), R.appendChild(r), L.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = Bn(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e of T) {
				let t = d(e, _);
				t.x >= o && t.x <= o + c && t.y >= s && t.y <= s + l && u.add(e.node.id);
			}
			S = u, m.selectedNodeId = S.size ? [...S][S.size - 1] : null, Sn(), Rn(), i = !0;
		}, o = () => {
			r.remove(), L.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? (Cn(), S.size === 1 && p.inspector && br([...S][0])) : (Dn(), xr());
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function kn(e) {
		return S.has(e.id) || S.has(e.parentId);
	}
	let W = /* @__PURE__ */ new Set();
	function An() {
		for (let e in O) O[e].classList.toggle("loc-edge-selected", W.has(e));
	}
	function jn() {
		W.size && (W = /* @__PURE__ */ new Set(), An(), N("edges-select", { ids: [] }));
	}
	function Mn(e) {
		W = new Set((e || []).filter((e) => O[e])), An(), N("edges-select", { ids: [...W] });
	}
	function Nn() {
		if (!W.size) return;
		let e = !1;
		for (let t of W) v[t] && (delete v[t], e = !0), y[t] && (delete y[t], e = !0);
		e && (m.selectedEdgeId && W.has(m.selectedEdgeId) && Kn(), qt(), An(), X(), Y(), N("edges-reset", { ids: [...W] }));
	}
	function Pn(e, t, n, r, i, a, o, s) {
		let c = (n - e) * (s - a) - (r - t) * (o - i);
		if (Math.abs(c) < 1e-9) return !1;
		let l = ((i - e) * (s - a) - (a - t) * (o - i)) / c, u = ((i - e) * (r - t) - (a - t) * (n - e)) / c;
		return l >= 0 && l <= 1 && u >= 0 && u <= 1;
	}
	function Fn(e, t, n, r, i, a) {
		let o = n + i, s = r + a, c = (e) => e.x >= n && e.x <= o && e.y >= r && e.y <= s;
		return c(e) || c(t) ? !0 : Pn(e.x, e.y, t.x, t.y, n, r, o, r) || Pn(e.x, e.y, t.x, t.y, o, r, o, s) || Pn(e.x, e.y, t.x, t.y, o, s, n, s) || Pn(e.x, e.y, t.x, t.y, n, s, n, r);
	}
	function In(e, t, n, r, i) {
		let a = Hn(e);
		if (!a) return !1;
		for (let e of Wn(a)) if (Fn(e.a, e.b, t, n, r, i)) return !0;
		return !1;
	}
	function Ln(e) {
		let t = Bn(e.clientX, e.clientY), n = e.shiftKey ? new Set(W) : /* @__PURE__ */ new Set(), r = Vt("rect");
		r.setAttribute("class", "loc-marquee loc-marquee-edge"), R.appendChild(r), L.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = Bn(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e in O) In(e, o, s, c, l) && u.add(e);
			W = u, An(), i = !0;
		}, o = () => {
			r.remove(), L.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? N("edges-select", { ids: [...W] }) : jn();
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function Rn() {
		for (let e in O) {
			let t = E[e];
			O[e].classList.toggle("loc-incident", !!t && kn(t.node));
		}
	}
	function zn(e) {
		let t = D[e];
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
	function Bn(e, t) {
		let n = L.getBoundingClientRect();
		return {
			x: (e - n.left - m.panX) / m.zoom,
			y: (t - n.top - m.panY) / m.zoom
		};
	}
	function Vn(e) {
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
	function Hn(e) {
		let t = E[e];
		if (!t) return null;
		let n = E[t.node.parentId];
		if (!n) return null;
		let r = gt(), i = ne(t, v[e], y[e], n, r, _);
		return ae(n, t, i, r, _, y[e]);
	}
	function Un(e) {
		if (v[e]) return v[e];
		let t = E[e], n = t && E[t.node.parentId], r = ne(t, null, y[e], n, gt(), _);
		return v[e] = r.map((e) => ({
			x: e.x,
			y: e.y
		})), v[e];
	}
	function Wn(e) {
		let t = [], n = u(gt());
		for (let r = 0; r < e.length - 1; r++) {
			let i = oe([e[r], e[r + 1]], n);
			for (let e = 0; e < i.length - 1; e++) t.push({
				a: i[e],
				b: i[e + 1],
				insert: r
			});
		}
		return t;
	}
	function Gn(e) {
		Jn(), m.selectedEdgeId && O[m.selectedEdgeId] && O[m.selectedEdgeId].classList.remove("loc-sel"), S = /* @__PURE__ */ new Set(), m.selectedNodeId = null, Sn(), m.selectedEdgeId = e, O[e] && O[e].classList.add("loc-sel"), Rn(), $n();
	}
	function Kn() {
		m.selectedEdgeId && O[m.selectedEdgeId] && O[m.selectedEdgeId].classList.remove("loc-sel"), m.selectedEdgeId = null, z.innerHTML = "";
	}
	function qn(e) {
		let t = String(e);
		Kn(), S = /* @__PURE__ */ new Set(), m.selectedNodeId = null, Sn(), m.selectedFamilyId = t, qt();
		let n = Oe.find((e) => String(e.parentId) === t) || De.find((e) => String(e.parentId) === t);
		N("family-route-select", {
			parentId: t,
			childIds: n ? n.childIds.slice() : []
		});
	}
	function Jn() {
		if (m.selectedFamilyId) {
			m.selectedFamilyId = null, tt.innerHTML = "";
			for (let e in O) O[e].classList.remove("loc-family-member");
		}
	}
	function Yn(e = m.selectedFamilyId) {
		let t = e == null ? null : String(e);
		return !t || !b[t] ? !1 : (delete b[t], U("family-route-reset"), X(), Y(), N("family-route-reset", { parentId: t }), !0);
	}
	function Xn(e, t) {
		let n = e == null ? "" : String(e);
		return !n || !E[n] ? !1 : !t || !Number.isFinite(Number(t.trunkOffset)) ? Yn(n) : (b[n] = { trunkOffset: Number(t.trunkOffset) }, m.selectedFamilyId = n, U("family-route-override"), X(), Y(), N("family-route-change", {
			parentId: n,
			trunkOffset: b[n].trunkOffset,
			pending: !1
		}), !0);
	}
	function Zn(e, t, n, r) {
		let i = Vt("circle");
		return i.setAttribute("cx", e), i.setAttribute("cy", t), i.setAttribute("r", n), i.setAttribute("class", r), i;
	}
	function Qn(e, t, n, r) {
		let i = Vt("rect");
		return i.setAttribute("x", e - n), i.setAttribute("y", t - n), i.setAttribute("width", 2 * n), i.setAttribute("height", 2 * n), i.setAttribute("rx", 2 / m.zoom), i.setAttribute("class", r), i;
	}
	function $n() {
		z.innerHTML = "";
		let e = m.selectedEdgeId;
		if (!e || p.readonly) return;
		let t = Hn(e);
		if (!t) return;
		let n = v[e] || [], r = 6 / m.zoom, i = 5 / m.zoom;
		if (!m.editMode) {
			for (let e = 0; e < n.length; e++) {
				let t = Zn(n[e].x, n[e].y, r, "loc-wp-handle loc-wp-readonly");
				t.dataset.wp = e, z.appendChild(t);
			}
			return;
		}
		for (let e of Wn(t)) {
			let t = Zn((e.a.x + e.b.x) / 2, (e.a.y + e.b.y) / 2, i, "loc-wp-add");
			t.dataset.add = e.insert, z.appendChild(t);
		}
		for (let e = 0; e < n.length; e++) {
			let t = Zn(n[e].x, n[e].y, r, "loc-wp-handle");
			t.dataset.wp = e, z.appendChild(t);
		}
		let a = t[0], o = t[t.length - 1], s = Qn(a.x, a.y, 6 / m.zoom, "loc-ep loc-ep-parent");
		s.dataset.ep = "parent", z.appendChild(s);
		let c = Qn(o.x, o.y, 6 / m.zoom, "loc-ep loc-ep-child");
		c.dataset.ep = "child", z.appendChild(c);
	}
	function er(e, t) {
		let n = d(e, _), r = e.node.width, i = e.node.height, a = (t.x - n.x) / (r / 2), o = (t.y - n.y) / (i / 2), s = Math.max(Math.abs(a), Math.abs(o));
		return s > 1e-6 && (a /= s, o /= s), {
			nx: Math.max(-1, Math.min(1, a)),
			ny: Math.max(-1, Math.min(1, o))
		};
	}
	let tr = .34;
	function nr(e) {
		let t = e.nx, n = e.ny;
		return Math.abs(Math.abs(n) - 1) < 1e-6 && Math.abs(t) < tr ? t = 0 : Math.abs(Math.abs(t) - 1) < 1e-6 && Math.abs(n) < tr && (n = 0), {
			nx: t,
			ny: n
		};
	}
	function rr(e, t) {
		let n = new Set([t].concat(Ar(t)));
		for (let t = T.length - 1; t >= 0; t--) {
			let r = T[t];
			if (n.has(r.node.id)) continue;
			let i = d(r, _);
			if (e.x >= i.x - r.node.width / 2 && e.x <= i.x + r.node.width / 2 && e.y >= i.y - r.node.height / 2 && e.y <= i.y + r.node.height / 2) return r.node.id;
		}
		return null;
	}
	let ir = null;
	function ar(e) {
		ir && D[ir] && D[ir].classList.remove("loc-reparent-target"), ir = e, e && D[e] && D[e].classList.add("loc-reparent-target");
	}
	function or(e) {
		if (!A || A.kind !== "ep") return;
		let t = A.id, n = E[t];
		if (!n) return;
		let r = E[n.node.parentId];
		if (!r) return;
		let i = Vn(Bn(e.clientX, e.clientY));
		if (y[t] = y[t] || {}, A.changed = !0, A.which === "child") y[t].c = nr(er(n, i));
		else {
			y[t].p = nr(er(r, i));
			let e = rr(i, t);
			ar(e && e !== n.node.parentId ? e : null);
		}
		Yt(t), $n();
	}
	function sr() {
		let e = A;
		if (A = null, Q("pointermove", or), Q("pointerup", sr), e && e.which === "parent" && ir) {
			let t = ir;
			ar(null), cr(e.id, t);
			return;
		}
		ar(null), X(), e && e.changed && Y();
	}
	function cr(e, t) {
		let n = g[e];
		if (!n || t === e || t && Ar(e).indexOf(t) >= 0) return;
		let r = t || "", i = n.parentId == null ? "" : String(n.parentId);
		(n.parentId || "") !== r && (m.selectedEdgeId = null, m.selectedFamilyId = null, z.innerHTML = "", tt.innerHTML = "", kt(() => {
			n.parentId = r, x[e] = Object.assign(x[e] || {}, { parentId: r }), delete v[e], delete y[e], i && delete b[i], r && delete b[r], E[e] && Object.assign(E[e].node, { parentId: r });
		}), Rn(), B.classList.contains("loc-open") && m.selectedNodeId === e && Sr(), N("node-change", {
			id: e,
			node: { ...n },
			patch: { parentId: r },
			reparented: !0
		}), Y());
	}
	function lr(e) {
		cr(e, "");
	}
	function ur(e, t) {
		t && cr(e, t);
	}
	let dr = null;
	function fr(e) {
		e && (dr = e, F.classList.add("loc-attaching"), N("attach-start", { id: e }));
	}
	function pr() {
		dr && (dr = null, F.classList.remove("loc-attaching"), N("attach-cancel", {}));
	}
	function mr(e) {
		let t = dr;
		return !t || !e || e === t || Ar(t).indexOf(e) >= 0 ? (pr(), !1) : (dr = null, F.classList.remove("loc-attaching"), ur(t, e), p.inspector && br(t), !0);
	}
	function hr(e, t, n) {
		let r = n.x - t.x, i = n.y - t.y, a = r * r + i * i, o = a ? ((e.x - t.x) * r + (e.y - t.y) * i) / a : 0;
		return o = Math.max(0, Math.min(1, o)), Math.hypot(e.x - (t.x + o * r), e.y - (t.y + o * i));
	}
	function gr(e, t) {
		let n = Wn(e), r = 0, i = Infinity;
		for (let e of n) {
			let n = hr(t, e.a, e.b);
			n < i && (i = n, r = e.insert);
		}
		return r;
	}
	let _r = [
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
	function G(e) {
		return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
	}
	function vr() {
		F.classList.toggle("loc-edit", m.editMode);
	}
	function yr(e) {
		m.editMode = !!e, vr(), $(), m.editMode || (Kn(), Jn()), B.classList.contains("loc-open") && Sr(), N("edit-mode-change", { editMode: m.editMode }), X();
	}
	function br(e) {
		p.inspector && (m.selectedNodeId = e, B.classList.add("loc-open"), Sr(), N("inspector-open", {
			id: e,
			node: g[e]
		}));
	}
	function xr() {
		B.classList.contains("loc-open") && (B.classList.remove("loc-open"), N("inspector-close", {}));
	}
	function Sr() {
		let e = m.selectedNodeId, t = e && g[e];
		if (!t) {
			xr();
			return;
		}
		if (lt.textContent = t.label || t.personName || t.id, p.inspectorSlot) {
			ct.innerHTML = "";
			return;
		}
		let n = m.editMode, r = n ? "" : " disabled", i = (e, t, n) => `<input data-field="${e}" type="${n || "text"}" value="${G(t)}"${r}/>`, a = (e, t, n) => `<select data-field="${e}"${r}>` + n.map((e) => {
			let n = Array.isArray(e) ? e[0] : e, r = Array.isArray(e) ? e[1] : e || "—";
			return `<option value="${G(n)}"${String(n) === String(t ?? "") ? " selected" : ""}>${r}</option>`;
		}).join("") + "</select>", o = (e, t) => `<label class="loc-field"><span>${e}</span>${t}</label>`, s = o("ID", `<input value="${G(t.id)}" disabled/>`) + o("Type", a("type", t.type, [["department", "department"], ["position", "position"]])) + o("Label", i("label", t.label));
		t.type !== "department" && (s += p.userSearch ? `<label class="loc-field loc-usersearch"><span>Person name</span>${i("personName", t.personName)}<div class="loc-usersearch-list" data-role="user-results" hidden></div></label>` : o("Person name", i("personName", t.personName)), s += o("Status", a("status", t.status, [
			["", "—"],
			["FILLED", "FILLED"],
			["VACANT", "VACANT"],
			["UNFUNDED", "UNFUNDED"]
		])) + o("Photo URL", i("photo_url", t.data && t.data.photo_url || ""))), p.advancedLayoutControls && (s += o("Layout override", a("layoutMode", t.layoutMode || "", _r.map((e) => [e, e || "(inherit)"])))), s += o("Width", i("width", t.width, "number")) + o("Height", i("height", t.height, "number")), st.innerHTML = s, ct.innerHTML = n ? "<button data-role=\"add-child\">+ Add child</button>" + (t.parentId ? "<button data-role=\"detach\">Detach</button>" : "<button data-role=\"attach\">Attach…</button>") + "<button data-role=\"del-node\" class=\"loc-danger\">Delete</button>" : "<span class=\"loc-foot-hint\">Turn on Edit to modify fields</span>";
	}
	let Cr = 0, wr = 0;
	function Tr(e) {
		if (!p.userSearch) return;
		let t = st.querySelector("[data-role=\"user-results\"]");
		if (!t) return;
		Cr && clearTimeout(Cr);
		let n = (e || "").trim();
		if (!n) {
			t.hidden = !0, t.innerHTML = "";
			return;
		}
		let r = ++wr;
		Cr = setTimeout(() => {
			try {
				Promise.resolve(p.userSearch(n, g[m.selectedNodeId])).then((e) => {
					r === wr && Er(t, Array.isArray(e) ? e : []);
				}).catch(() => {});
			} catch {}
		}, 220);
	}
	function Er(e, t) {
		if (!t.length) {
			e.hidden = !0, e.innerHTML = "";
			return;
		}
		e.innerHTML = t.slice(0, 8).map((e, t) => {
			let n = G(e.name || e.personName || e.label || ""), r = G(e.title || e.label || e.email || "");
			return `<button type="button" class="loc-usersearch-item" data-uidx="${t}"><b>${n}</b>${r ? `<small>${r}</small>` : ""}</button>`;
		}).join(""), e.hidden = !1, e._users = t;
	}
	function Dr(e) {
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
		kr(t, r);
		let i = st.querySelector("[data-role=\"user-results\"]");
		i && (i.hidden = !0, i.innerHTML = ""), Sr(), N("user-select", {
			id: t,
			user: e,
			node: { ...g[t] }
		});
	}
	function Or() {
		let e;
		do
			e = "node-" + ++Ee;
		while (g[e]);
		return e;
	}
	function kr(e, t) {
		let n = g[e];
		if (!n) return;
		Object.assign(n, t), E[e] && E[e].node !== n && Object.assign(E[e].node, t), x[e] = Object.assign(x[e] || {}, t);
		let r = [
			"type",
			"width",
			"height",
			"layoutMode"
		].some((e) => e in t);
		D[e] && (D[e].remove(), delete D[e]), At(), r && U("node-structure", { preserveManual: !0 }), N("node-change", {
			id: e,
			node: { ...n },
			patch: t
		}), X(), Y("field:" + e + ":" + Object.keys(t).join(","));
	}
	function Ar(e) {
		let t = [], n = [e];
		for (; n.length;) {
			let e = n.pop();
			for (let r of h) r.parentId === e && (t.push(r.id), n.push(r.id));
		}
		return t;
	}
	function jr(e) {
		if (!m.editMode) return null;
		let t = Or(), n = s({
			id: t,
			parentId: e || "",
			type: "position",
			label: "NEW POSITION",
			personName: "",
			status: ""
		});
		return h.push(n), g[t] = n, e && delete b[String(e)], x[t] = Object.assign({ __new: !0 }, n), U("add-child", { preserveManual: !0 }), wn(t), br(t), N("node-change", {
			id: t,
			node: { ...n },
			added: !0
		}), X(), Y(), t;
	}
	function Mr(e) {
		if (!m.editMode || !e) return;
		let t = g[e]?.parentId, n = [e].concat(Ar(e)), r = new Set(n);
		h = h.filter((e) => !r.has(e.id)), g = re(h), n.forEach((e) => {
			x[e] = { __deleted: !0 }, D[e] && (D[e].remove(), delete D[e]), S.delete(e);
		}), t && delete b[String(t)], n.forEach((e) => {
			delete b[String(e)];
		}), r.has(m.selectedNodeId) && (m.selectedNodeId = S.size ? [...S][S.size - 1] : null, m.selectedNodeId || xr()), U("delete-node", { preserveManual: !0 }), N("node-change", {
			id: e,
			removed: !0,
			ids: n
		}), X(), Y();
	}
	function Nr() {
		let e = new Set(Object.keys(x).filter((e) => x[e] && x[e].__deleted));
		e.size && (h = h.filter((t) => !e.has(t.id))), g = re(h);
		for (let e in x) {
			let t = x[e];
			if (!(!t || t.__deleted)) {
				if (t.__new) {
					if (!g[e]) {
						let n = Object.assign({}, t);
						delete n.__new;
						let r = s(n);
						h.push(r), g[e] = r;
					}
				} else g[e] && Object.assign(g[e], t);
			}
		}
	}
	let Pr = [
		["type", "Type"],
		["status", "Status"],
		["level", "Level (data.level)"],
		["unit", "Unit (data.unit)"],
		["id", "Node id"],
		["label", "Label"]
	];
	function Fr(e, t) {
		let n = ue(t, C);
		Ir(e, "--loc-node-bg", n && n.bg), Ir(e, "--loc-node-text", n && n.text), Ir(e, "--loc-node-border", n && n.border);
	}
	function Ir(e, t, n) {
		n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
	}
	function Lr() {
		for (let e in D) g[e] && Fr(D[e], g[e]);
		m.showLegend && Hr();
	}
	let Rr = {
		FILLED: "Filled",
		VACANT: "Vacant",
		UNFUNDED: "Unfunded"
	};
	function zr() {
		ft.classList.toggle("loc-on", m.showLegend), m.showLegend && Hr();
	}
	function Br(e) {
		return m.showLegend = e == null ? !m.showLegend : !!e, zr(), $(), X(), N("legend-change", { legend: m.showLegend }), m.showLegend;
	}
	function Vr(e) {
		return Br(e ?? !m.showLegend);
	}
	function Hr() {
		if (p.legendSlot) return;
		let e = Object.create(null), t = Object.create(null);
		for (let n of h) n.type && (e[n.type] = !0), n.status && (t[n.status] = !0);
		let n = "", r = [];
		e.department && r.push(Wr("loc-leg-dept", "Department")), e.position && r.push(Wr("loc-leg-pos", "Position")), r.length && (n += Ur("Type", r.join("")));
		let i = [
			"FILLED",
			"VACANT",
			"UNFUNDED"
		].filter((e) => t[e]).map((e) => `<div class="loc-leg-row"><span class="loc-leg-badge loc-${e}">${Rr[e] || e}</span></div>`);
		i.length && (n += Ur("Status", i.join("")));
		let a = C.filter((e) => e.enabled && (e.style.bg || e.style.border)).map((e) => `<div class="loc-leg-row"><span class="loc-leg-swatch" style="background:${G(e.style.bg || "#fff")};border-color:${G(e.style.border || e.style.bg || "#d0d5dd")}"></span><span class="loc-leg-label">${G(e.field)} = ${G(e.value || "—")}</span></div>`).join("");
		a && (n += Ur("Rules", a)), mt.innerHTML = n || "<div class=\"loc-leg-empty\">No legend items yet.</div>";
	}
	function Ur(e, t) {
		return `<div class="loc-leg-section"><div class="loc-leg-title">${e}</div>${t}</div>`;
	}
	function Wr(e, t) {
		return `<div class="loc-leg-row"><span class="loc-leg-swatch ${e}"></span><span class="loc-leg-label">${t}</span></div>`;
	}
	function K() {
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
			textHeight: m.textHeight,
			departmentWidth: m.departmentWidth,
			departmentHeight: m.departmentHeight,
			photoContain: m.photoContain,
			virtualPhotoFrame: {
				width: m.photoFrameWidth,
				height: m.photoFrameHeight
			},
			renderedImage: {
				width: m.photoImageWidth,
				height: m.photoImageHeight,
				fit: m.photoContain ? "contain" : "cover",
				align: "center",
				offsetX: m.photoOffsetX,
				offsetY: m.photoOffsetY
			},
			node: {
				width: m.cardWidth,
				photoHeight: m.photoHeight,
				textHeight: m.textHeight,
				totalHeight: m.photoHeight + m.textHeight
			},
			departmentNode: {
				width: m.departmentWidth,
				height: m.departmentHeight
			},
			photoBackground: m.photoBackground,
			themeRules: C.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		};
	}
	function Gr(e, t) {
		if (e ||= {}, typeof e.spacingX == "number" && (m.spacingX = e.spacingX), typeof e.spacingY == "number" && (m.spacingY = e.spacingY), typeof e.gridSize == "number" && (m.gridSize = e.gridSize), e.orientation && (m.orientation = Ce(e.orientation)), e.subtreeMode && (m.subtreeMode = e.subtreeMode), "showGrid" in e && (m.showGrid = !!e.showGrid), "snapGrid" in e && (m.snapGrid = !!e.snapGrid), "alignGrid" in e && (m.alignGrid = !!e.alignGrid), "showImages" in e && !!e.showImages !== m.showImages) {
			m.showImages = !!e.showImages;
			for (let e in D) D[e].remove(), delete D[e];
		}
		"autoEdgeSide" in e && (m.autoEdgeSide = !!e.autoEdgeSide);
		let n = Nt(e);
		if ((n.sizeChanged || n.renderChanged) && jt(), n.sizeChanged) {
			Mt();
			for (let e in D) delete D[e].dataset.fitted;
		}
		Array.isArray(e.themeRules) && (C = e.themeRules.map(de)), Qt(), $(), U("settings"), V.classList.contains("loc-open") && Qr(), t && t.silent || N("settings-change", K()), X();
	}
	function Kr(e) {
		let t = V.classList.contains("loc-open"), n = e == null ? !t : !!e;
		V.classList.toggle("loc-open", n), I && I.querySelectorAll("button[data-act=\"settings\"]").forEach((e) => e.classList.toggle("loc-active", n)), n && Qr(), n !== t && N(n ? "settings-open" : "settings-close", {});
	}
	function qr() {
		Gr({
			spacingX: w.spacingX,
			spacingY: w.spacingY,
			gridSize: w.gridSize,
			showGrid: w.showGrid,
			snapGrid: w.snapGrid,
			alignGrid: w.alignGrid,
			cardWidth: w.cardWidth,
			photoHeight: w.photoHeight,
			textHeight: w.textHeight,
			departmentWidth: w.departmentWidth,
			departmentHeight: w.departmentHeight,
			photoContain: w.photoContain,
			virtualPhotoFrame: {
				width: w.photoFrameWidth,
				height: w.photoFrameHeight
			},
			renderedImage: {
				width: w.photoImageWidth,
				height: w.photoImageHeight,
				fit: w.photoContain ? "contain" : "cover",
				align: "center",
				offsetX: w.photoOffsetX,
				offsetY: w.photoOffsetY
			},
			photoBackground: w.photoBackground,
			themeRules: w.themeRules.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		}), Lr();
	}
	function Jr(e, t, n, r, i) {
		return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${r}" max="${i}" value="${n}"/></label>`;
	}
	function Yr(e, t, n, r) {
		return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${r ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${r || "#e0524d"}"/></label>`;
	}
	function Xr(e, t) {
		let n = (t, n) => `<option value="${t}"${e.field === t ? " selected" : ""}>${n}</option>`;
		return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + Pr.map(([e, t]) => n(e, t)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${G(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Yr(t, "bg", "BG", e.style.bg) + Yr(t, "text", "Text", e.style.text) + Yr(t, "border", "Border", e.style.border) + "</div></div>";
	}
	function Zr() {
		let e = xi().map((e) => `<div class="loc-preset"><button class="loc-preset-apply" data-role="preset-apply" data-name="${G(e.name)}" title="Apply this saved layout">${G(e.name)}</button><span class="loc-preset-tag">${e.full ? "full" : "pattern"}</span><button class="loc-preset-del" data-role="preset-del" data-name="${G(e.name)}" title="Delete preset">✕</button></div>`).join("");
		return e ||= "<div class=\"loc-set-hint\">No saved presets yet.</div>", `<div class="loc-set-section"><div class="loc-set-title">Presets</div><div class="loc-set-hint">Save the current arrangement so an accidental mode change can’t lose it (Undo / Ctrl+Z restores it too).</div><div class="loc-preset-save"><input type="text" data-role="preset-name" placeholder="Preset name…"/><label class="loc-preset-full"><input type="checkbox" data-role="preset-full" checked/> positions</label><button data-role="preset-save">Save</button></div><div class="loc-preset-list">${e}</div></div>`;
	}
	function Qr() {
		if (p.settingsSlot) return;
		let e = Zr() + "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Layout</div>" + Jr("spacingX", "Spacing X", m.spacingX, 0, 200) + Jr("spacingY", "Spacing Y", m.spacingY, 0, 260) + Jr("gridSize", "Grid size", m.gridSize, 6, 80) + `<label class="loc-color"><input type="checkbox" data-set-toggle="showImages"${m.showImages ? " checked" : ""}/><span>Show photos (off → user icon)</span></label><label class="loc-color"><input type="checkbox" data-set-toggle="autoEdgeSide"${m.autoEdgeSide ? " checked" : ""}/><span>Smart edges (lines follow waypoints to any side)</span></label></div>`;
		e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Card size</div><div class=\"loc-set-hint\">Applies to every person card. The photo tops the card at its full size; the name/title sit below.</div>" + Jr("cardWidth", "Card width", m.cardWidth, 120, 320) + Jr("photoHeight", "Photo height", m.photoHeight, 60, 240) + `<label class="loc-color"><input type="checkbox" data-set-toggle="photoContain"${m.photoContain ? " checked" : ""}/><span>Preserve photo proportions (contain)</span></label></div>`, e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Theme rules</div><div class=\"loc-set-hint\">Recolor nodes that match a field = value. Later rules win.</div>", C.forEach((t, n) => {
			e += Xr(t, n);
		}), e += "<button class=\"loc-set-add\" data-role=\"add-rule\">+ Add rule</button></div>", e += "<div class=\"loc-set-foot\"><button class=\"loc-set-reset\" data-role=\"reset-settings\" title=\"Restore spacing, grid &amp; theme rules to defaults\">↺ Reset settings</button></div>", dt.innerHTML = e;
	}
	function $r(e, t) {
		let n = dt.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
		return n && n.checked;
	}
	function ei(e, t) {
		let n = dt.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
		return n ? n.value : "";
	}
	let ti = [], q = -1, ni = !1, ri = null;
	function J(e) {
		return e == null ? e : JSON.parse(JSON.stringify(e));
	}
	function ii() {
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
			textHeight: m.textHeight,
			departmentWidth: m.departmentWidth,
			departmentHeight: m.departmentHeight,
			photoContain: m.photoContain,
			virtualPhotoFrame: {
				width: m.photoFrameWidth,
				height: m.photoFrameHeight
			},
			renderedImage: {
				width: m.photoImageWidth,
				height: m.photoImageHeight,
				fit: m.photoContain ? "contain" : "cover",
				align: "center",
				offsetX: m.photoOffsetX,
				offsetY: m.photoOffsetY
			},
			photoBackground: m.photoBackground,
			themeRules: C.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		};
	}
	function ai(e) {
		e && (e.subtreeMode && (m.subtreeMode = e.subtreeMode), e.orientation && (m.orientation = Ce(e.orientation)), [
			"spacingX",
			"spacingY",
			"gridSize"
		].forEach((t) => {
			typeof e[t] == "number" && (m[t] = e[t]);
		}), "showGrid" in e && (m.showGrid = !!e.showGrid), "snapGrid" in e && (m.snapGrid = !!e.snapGrid), "alignGrid" in e && (m.alignGrid = !!e.alignGrid), "showImages" in e && (m.showImages = !!e.showImages), "autoEdgeSide" in e && (m.autoEdgeSide = !!e.autoEdgeSide), Nt(e), jt(), Mt(), Array.isArray(e.themeRules) && (C = e.themeRules.map(de)));
	}
	function oi() {
		return {
			nodes: h.map((e) => J(e)),
			manualOffsets: J(_),
			edgeWaypoints: J(v),
			edgeAnchors: J(y),
			familyRouteOverrides: J(b),
			nodeOverrides: J(x),
			view: ii(),
			selectedNodeId: m.selectedNodeId
		};
	}
	function si(e) {
		ni = !0, h = (e.nodes || []).map(s), g = re(h), _ = J(e.manualOffsets) || Object.create(null), v = J(e.edgeWaypoints) || Object.create(null), y = J(e.edgeAnchors) || Object.create(null), b = J(e.familyRouteOverrides) || Object.create(null), x = J(e.nodeOverrides) || Object.create(null), ai(e.view);
		for (let e in D) D[e].remove(), delete D[e];
		for (let e in O) O[e].remove(), delete O[e];
		for (let e in k) k[e].remove(), delete k[e];
		m.selectedEdgeId = null, z.innerHTML = "", m.selectedNodeId = e.selectedNodeId && g[e.selectedNodeId] ? e.selectedNodeId : null, Qt(), U("history"), m.selectedNodeId && wn(m.selectedNodeId), B.classList.contains("loc-open") && (m.selectedNodeId ? Sr() : xr()), V.classList.contains("loc-open") && Qr(), ni = !1;
	}
	function Y(e) {
		if (ni) return;
		let t = oi();
		e != null && e === ri && q >= 0 ? ti[q] = t : (ti = ti.slice(0, q + 1), ti.push(t), q = ti.length - 1, ti.length > 100 && (ti.shift(), q--)), ri = e ?? null, pi();
	}
	function ci() {
		ti = [oi()], q = 0, ri = null, pi();
	}
	function li() {
		return q > 0;
	}
	function ui() {
		return q >= 0 && q < ti.length - 1;
	}
	function di() {
		li() && (q--, ri = null, si(ti[q]), pi());
	}
	function fi() {
		ui() && (q++, ri = null, si(ti[q]), pi());
	}
	function pi() {
		$(), N("history-change", {
			canUndo: li(),
			canRedo: ui()
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
				textHeight: m.textHeight,
				departmentWidth: m.departmentWidth,
				departmentHeight: m.departmentHeight,
				photoContain: m.photoContain,
				virtualPhotoFrame: {
					width: m.photoFrameWidth,
					height: m.photoFrameHeight
				},
				renderedImage: {
					width: m.photoImageWidth,
					height: m.photoImageHeight,
					fit: m.photoContain ? "contain" : "cover",
					align: "center",
					offsetX: m.photoOffsetX,
					offsetY: m.photoOffsetY
				},
				photoBackground: m.photoBackground,
				manualOffsets: _,
				edgeWaypoints: v,
				edgeAnchors: y,
				familyRouteOverrides: b,
				nodeOverrides: x,
				themeRules: C,
				collapsed: h.filter((e) => e.collapsed).map((e) => e.id)
			}));
		} catch {}
	}
	function mi() {
		if (!p.persist) return;
		let e;
		try {
			e = JSON.parse(localStorage.getItem(p.storageKey) || "null");
		} catch {
			e = null;
		}
		if (e && (e.orientation && (m.orientation = Ce(e.orientation)), e.subtreeMode && (m.subtreeMode = e.subtreeMode), [
			"spacingX",
			"spacingY",
			"zoom",
			"panX",
			"panY",
			"gridSize"
		].forEach((t) => {
			typeof e[t] == "number" && (m[t] = e[t]);
		}), m.showGrid = !!e.showGrid, m.snapGrid = !!e.snapGrid, m.alignGrid = !!e.alignGrid, m.editMode = !!e.editMode, "showImages" in e && (m.showImages = !!e.showImages), "showLegend" in e && (m.showLegend = !!e.showLegend), "autoEdgeSide" in e && (m.autoEdgeSide = !!e.autoEdgeSide), Nt(e), jt(), Mt(), e.manualOffsets && (_ = e.manualOffsets), e.edgeWaypoints && (v = e.edgeWaypoints), e.edgeAnchors && (y = e.edgeAnchors), e.familyRouteOverrides && (b = e.familyRouteOverrides), e.nodeOverrides && (x = e.nodeOverrides, Nr()), Array.isArray(e.themeRules) && (C = e.themeRules.map(de)), Array.isArray(e.collapsed))) {
			let t = new Set(e.collapsed);
			for (let e of h) e.collapsed = t.has(e.id);
		}
	}
	function hi() {
		return p.storageKey + ".presets";
	}
	function gi() {
		try {
			return JSON.parse(localStorage.getItem(hi()) || "{}") || {};
		} catch {
			return {};
		}
	}
	function _i(e) {
		try {
			localStorage.setItem(hi(), JSON.stringify(e));
		} catch {}
	}
	function vi(e) {
		let t = {
			full: e !== !1,
			view: ii()
		};
		return t.full && (t.layout = {
			manualOffsets: J(_),
			edgeWaypoints: J(v),
			edgeAnchors: J(y),
			familyRouteOverrides: J(b),
			nodeOverrides: J(x),
			collapsed: h.filter((e) => e.collapsed).map((e) => e.id)
		}), t;
	}
	function yi(e) {
		return vi(!(e && e.full === !1));
	}
	function bi(e) {
		if (!e) return Promise.resolve(!1);
		if (ai(e.view), e.full && e.layout) {
			_ = J(e.layout.manualOffsets) || Object.create(null), v = J(e.layout.edgeWaypoints) || Object.create(null), y = J(e.layout.edgeAnchors) || Object.create(null), b = J(e.layout.familyRouteOverrides) || Object.create(null), x = J(e.layout.nodeOverrides) || Object.create(null), Nr();
			let t = new Set(e.layout.collapsed || []);
			for (let e of h) e.collapsed = t.has(e.id);
		} else _ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.create(null);
		m.selectedNodeId = null, m.selectedEdgeId = null, m.selectedFamilyId = null, z.innerHTML = "", tt.innerHTML = "";
		for (let e in D) D[e].remove(), delete D[e];
		for (let e in O) O[e].remove(), delete O[e];
		for (let e in k) k[e].remove(), delete k[e];
		Qt(), $();
		let t = U("preset");
		return V.classList.contains("loc-open") && Qr(), t.then((e) => {
			e && nn();
		}), Y(), N("settings-change", K()), t;
	}
	function xi() {
		let e = gi();
		return Object.keys(e).map((t) => ({
			name: t,
			full: !!e[t].full,
			savedAt: e[t].savedAt || null
		}));
	}
	function Si() {
		return gi();
	}
	function Ci(e, t) {
		if (e = String(e ?? "").trim(), !e) return null;
		let n = vi(!(t && t.full === !1));
		n.name = e, n.savedAt = Date.now();
		let r = gi();
		return r[e] = n, _i(r), V.classList.contains("loc-open") && Qr(), N("presets-change", { presets: xi() }), n;
	}
	function wi(e) {
		let t = gi()[String(e)];
		return t ? (bi(t), N("preset-load", {
			name: String(e),
			preset: t
		}), !0) : !1;
	}
	function Ti(e) {
		let t = gi();
		return String(e) in t && (delete t[String(e)], _i(t), V.classList.contains("loc-open") && Qr(), N("presets-change", { presets: xi() }), !0);
	}
	function Ei(e) {
		let t = fe(m, h, _, v);
		return t.editMode = m.editMode, t.edgeAnchors = y, t.familyRouteOverrides = b, t.nodeOverrides = x, t.settings = K(), e !== !1 && Ri(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
	}
	let Di = document.createElement("canvas").getContext("2d");
	function Oi(e, t) {
		return Di.font = t, Di.measureText(e).width;
	}
	function ki(e) {
		let t = D[e.id];
		if (!t) return 1;
		let n = parseFloat(t.style.getPropertyValue("--loc-fit"));
		return isFinite(n) && n > 0 ? n : 1;
	}
	function Ai(e) {
		return e ??= 0, ke && Object.keys(_).length === 0 ? {
			x: ke.x - e,
			y: ke.y - e,
			w: ke.w + e * 2,
			h: ke.h + e * 2
		} : se(T, _, e);
	}
	function ji(e, t) {
		let n = [];
		for (let e in O) n.push({
			id: e,
			d: O[e].getAttribute("d")
		});
		return le(T, n, {
			manualOffsets: _,
			raster: !!e,
			measureText: Oi,
			fitOf: ki,
			photoHeight: m.photoHeight,
			photoContain: m.photoContain,
			virtualPhotoFrame: {
				width: m.photoFrameWidth,
				height: m.photoFrameHeight
			},
			renderedImage: {
				width: m.photoImageWidth,
				height: m.photoImageHeight,
				fit: m.photoContain ? "contain" : "cover",
				align: "center",
				offsetX: m.photoOffsetX,
				offsetY: m.photoOffsetY
			},
			photoBackground: m.photoBackground,
			images: t || null,
			familyNetworks: De,
			rebuildFamilyIds: Wt(),
			bounds: Ai(40)
		});
	}
	function Mi(e) {
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
	function Ni() {
		if (!m.showImages) return Promise.resolve({});
		let e = [], t = /* @__PURE__ */ new Set();
		for (let n of h) {
			let r = n.type !== "department" && n.data && n.data.photo_url;
			r && !t.has(r) && (t.add(r), e.push(r));
		}
		return e.length ? Promise.all(e.map((e) => Mi(e).then((t) => [e, t]))).then((e) => {
			let t = {};
			for (let [n, r] of e) r && (t[n] = r);
			return t;
		}) : Promise.resolve({});
	}
	function Pi() {
		return Ni().then((e) => {
			let t = ji(!1, e);
			return Ri(new Blob([t], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), t;
		});
	}
	function Fi(e) {
		return e ||= 3, Ni().then((t) => new Promise((n) => {
			let r = Ai(40), i = 16e3, a = 2e8, o = Math.min(e, i / r.w, i / r.h);
			r.w * o * r.h * o > a && (o = Math.sqrt(a / (r.w * r.h))), o = Math.max(.05, o);
			let s = URL.createObjectURL(new Blob([ji(!0, t)], { type: "image/svg+xml;charset=utf-8" })), c = new Image();
			c.onload = () => {
				let e = document.createElement("canvas");
				e.width = Math.round(r.w * o), e.height = Math.round(r.h * o);
				let t = e.getContext("2d");
				t.setTransform(o, 0, 0, o, 0, 0), t.drawImage(c, 0, 0), URL.revokeObjectURL(s);
				try {
					e.toBlob((e) => {
						e && Ri(e, "org-chart.png"), n(!!e);
					}, "image/png");
				} catch {
					n(!1);
				}
			}, c.onerror = () => {
				URL.revokeObjectURL(s), n(!1);
			}, c.src = s;
		}));
	}
	function Ii(e) {
		e ||= {};
		let t = +e.scale > 0 ? +e.scale : 2, n = typeof e.quality == "number" ? Math.min(1, Math.max(.3, e.quality)) : .82, r = +e.maxSide > 0 ? +e.maxSide : 4e3, i = e.as === "dataURL" || e.as === "dataurl", a = e.filename || "org-chart.webp";
		return Ni().then((o) => new Promise((s) => {
			let c = Ai(40), l = 2e8, u = Math.min(t, r / c.w, r / c.h);
			c.w * u * c.h * u > l && (u = Math.sqrt(l / (c.w * c.h))), u = Math.max(.05, u);
			let ee = URL.createObjectURL(new Blob([ji(!0, o)], { type: "image/svg+xml;charset=utf-8" })), te = new Image();
			te.onload = () => {
				let t = document.createElement("canvas");
				t.width = Math.round(c.w * u), t.height = Math.round(c.h * u);
				let r = t.getContext("2d");
				r.setTransform(u, 0, 0, u, 0, 0), r.drawImage(te, 0, 0), URL.revokeObjectURL(ee);
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
						t && e.download && Ri(t, a), s(t || null);
					}, "image/webp", n);
				} catch {
					s(null);
				}
			}, te.onerror = () => {
				URL.revokeObjectURL(ee), s(null);
			}, te.src = ee;
		}));
	}
	function Li() {
		return Ni().then((e) => {
			let t = window.open("", "_blank");
			return t ? (t.document.open(), t.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + ji(!1, e) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), t.document.close(), !0) : !1;
		});
	}
	function Ri(e, t) {
		let n = URL.createObjectURL(e), r = document.createElement("a");
		r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), URL.revokeObjectURL(n);
	}
	function zi(e, t, n) {
		let r = !(n && n.resetEdits);
		h = (e || []).map(s), g = re(h), r || (_ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.create(null), x = Object.create(null)), m.selectedNodeId = null, m.selectedEdgeId = null, m.selectedFamilyId = null, Ne = /* @__PURE__ */ new Set(), xr();
		for (let e in D) D[e].remove(), delete D[e];
		for (let e in O) O[e].remove(), delete O[e];
		for (let e in k) k[e].remove(), delete k[e];
		t && (t.subtreeMode && (m.subtreeMode = t.subtreeMode), t.orientation && (m.orientation = Ce(t.orientation)), t.manualOffsets && (_ = t.manualOffsets), t.edgeWaypoints && (v = t.edgeWaypoints), t.edgeAnchors && (y = t.edgeAnchors), t.familyRouteOverrides && (b = t.familyRouteOverrides), t.nodeOverrides && (x = t.nodeOverrides), typeof t.editMode == "boolean" && (m.editMode = t.editMode), t.settings && (Nt(t.settings), Array.isArray(t.settings.themeRules) && (C = t.settings.themeRules.map(de)))), jt(), Mt(), r && Nr(), vr(), $();
		let i = U("set-nodes");
		return p.fitOnInit && i.then((e) => {
			e && $t();
		}), i;
	}
	function Bi(t) {
		let { nodes: n, meta: r } = e(t);
		return zi(n, r), n.length;
	}
	function Vi(e) {
		let t = Ce(e);
		m.orientation = t, _ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.create(null), Kn(), Jn(), $();
		let n = U("orientation");
		return n.then((e) => {
			e && nn();
		}), N("orientation-change", { orientation: t }), Y(), n;
	}
	function Hi(e) {
		m.subtreeMode = e, _ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.create(null), Kn(), Jn(), $();
		let t = U("subtree-mode");
		return t.then((e) => {
			e && nn();
		}), N("subtree-mode-change", { subtreeMode: e }), Y(), t;
	}
	function Ui(e, t) {
		e != null && (m.spacingX = e), t != null && (m.spacingY = t);
		let n = U("spacing");
		return N("settings-change", K()), Y("spacing"), n;
	}
	function Wi(e, t) {
		e in m ? (m[e] = t, e === "showGrid" && Qt(), e === "alignGrid" && (_ = Object.create(null), U("align-grid")), $(), X(), [
			"showGrid",
			"snapGrid",
			"alignGrid",
			"gridSize"
		].includes(e) && N("settings-change", K())) : (p[e] = t, (e === "targetAspect" || e === "targetSize") && (m.subtreeMode === "AutoSmart" || m.subtreeMode === "GridSmart" || m.subtreeMode === "Auto") && U("target-size").then((e) => {
			e && nn();
		}));
	}
	function Gi(e) {
		return Wi("showGrid", !!e), m.showGrid;
	}
	function Ki(e) {
		return Wi("snapGrid", !!e), m.snapGrid;
	}
	function qi(e) {
		return Wi("alignGrid", !!e), m.alignGrid;
	}
	function Ji(e) {
		return Gi(e ?? !m.showGrid);
	}
	function Yi(e) {
		return m.autoEdgeSide = e == null ? !m.autoEdgeSide : !!e, Kn(), U("auto-edge-side"), V.classList.contains("loc-open") && Qr(), X(), N("settings-change", K()), m.autoEdgeSide;
	}
	function Xi(e) {
		m.showImages = e == null ? !m.showImages : !!e;
		for (let e in D) D[e].remove(), delete D[e];
		return At(), $(), X(), N("settings-change", K()), m.showImages;
	}
	function Zi() {
		let e = Ot("relayout", { preserveManual: !0 });
		return Kn(), Jn(), e.then((e) => {
			e && nn();
		}), N("relayout", { forced: !1 }), Y(), e;
	}
	function Qi() {
		_ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.create(null), Kn(), Jn();
		let e = U("force-relayout");
		return e.then((e) => {
			e && nn();
		}), N("relayout", { forced: !0 }), Y(), e;
	}
	function $i() {
		cn(), xr();
		let e = Qi();
		return e.then((e) => {
			e && $t();
		}), e;
	}
	function ea() {
		return document.fullscreenElement || document.webkitFullscreenElement || null;
	}
	function ta() {
		return ea() === F;
	}
	function na() {
		let e = F.requestFullscreen || F.webkitRequestFullscreen;
		if (e) try {
			let t = e.call(F);
			t && t.catch && t.catch(() => {});
		} catch {}
	}
	function ra() {
		let e = document.exitFullscreen || document.webkitExitFullscreen;
		if (e && ea()) try {
			e.call(document);
		} catch {}
	}
	function ia(e) {
		let t = e == null ? !ta() : !!e;
		return t ? na() : ra(), t;
	}
	function aa() {
		let e = ta();
		F.classList.toggle("loc-fullscreen", e), at && (at.title = e ? "Exit fullscreen" : "Fullscreen"), $(), $t(), N("fullscreen-change", { fullscreen: e });
	}
	function oa(e) {
		if (!je) return;
		let t = Bn(e.clientX, e.clientY), n = u(gt()) ? t.y : t.x, r = Math.max(1, m.gridSize), i = Math.round((je.baseOffset + n - je.startCross) / r) * r;
		b[je.parentId]?.trunkOffset !== i && (b[je.parentId] = { trunkOffset: i }, je.changed = !0, N("family-route-change", {
			parentId: je.parentId,
			trunkOffset: i,
			pending: !0
		}));
	}
	function sa() {
		let e = je;
		je = null, Q("pointermove", oa), Q("pointerup", sa), e?.changed && (U("family-route"), X(), Y(), N("family-route-change", {
			parentId: e.parentId,
			trunkOffset: b[e.parentId]?.trunkOffset,
			pending: !1
		}));
	}
	P(et, "pointerdown", (e) => {
		let t = e.target.closest(".loc-node");
		t && pn(e, t.dataset.id);
	}), P(et, "click", (e) => {
		let t = e.target.closest("[data-role=\"toggle\"]");
		if (t && !p.readonly) {
			on(t.closest(".loc-node").dataset.id);
			return;
		}
		let n = e.target.closest(".loc-node");
		if (n) {
			if (Pe === String(n.dataset.id)) {
				un(), e.preventDefault(), e.stopPropagation();
				return;
			}
			N("node-click", {
				id: n.dataset.id,
				node: g[n.dataset.id]
			});
		}
	}), P(Qe, "pointerdown", (e) => {
		let t = e.target.closest("path");
		t && (e.stopPropagation(), Gn(t.dataset.edge));
	}), P($e, "pointerdown", (e) => {
		let t = e.target.closest("path");
		if (!t) return;
		e.stopPropagation(), e.preventDefault(), da();
		let n = String(t.dataset.family);
		if (qn(n), p.readonly || !m.editMode) return;
		let r = Oe.find((e) => String(e.parentId) === n) || De.find((e) => String(e.parentId) === n), i = E[n];
		if (!r?.trunk || !i) return;
		let a = Bn(e.clientX, e.clientY), o = u(gt());
		je = {
			parentId: n,
			startCross: o ? a.y : a.x,
			baseOffset: (o ? r.trunk.a.y : r.trunk.a.x) - (o ? i.cy : i.cx),
			changed: !1
		}, Z("pointermove", oa), Z("pointerup", sa);
	}), P(Qe, "dblclick", (e) => {
		if (p.readonly || !m.editMode) return;
		let t = e.target.closest("path");
		if (!t) return;
		let n = t.dataset.edge;
		Gn(n);
		let r = Hn(n);
		if (!r) return;
		let i = Vn(Bn(e.clientX, e.clientY));
		Un(n).splice(gr(r, i), 0, i), Yt(n), $n(), X(), Y();
	}), P(z, "pointerdown", (e) => {
		if (p.readonly || !m.editMode) return;
		let t = e.target, n = m.selectedEdgeId;
		if (!n) return;
		if (t.dataset.ep) {
			e.stopPropagation(), e.preventDefault(), A = {
				id: n,
				kind: "ep",
				which: t.dataset.ep
			}, Z("pointermove", or), Z("pointerup", sr);
			return;
		}
		let r;
		if (t.dataset.wp != null) r = +t.dataset.wp;
		else if (t.dataset.add != null) {
			let i = +t.dataset.add;
			Un(n).splice(i, 0, Vn(Bn(e.clientX, e.clientY))), r = i, Yt(n);
		} else return;
		e.stopPropagation(), e.preventDefault(), A = {
			id: n,
			idx: r
		}, Z("pointermove", ca), Z("pointerup", la);
	}), P(z, "dblclick", (e) => {
		let t = e.target;
		if (t.dataset.ep === "parent") {
			lr(m.selectedEdgeId);
			return;
		}
		if (t.dataset.wp == null) return;
		let n = m.selectedEdgeId, r = v[n];
		r && (r.splice(+t.dataset.wp, 1), r.length || delete v[n], Yt(n), $n(), X(), Y());
	});
	function ca(e) {
		if (!A) return;
		let t = v[A.id];
		t && (t[A.idx] = _n(A.id, Vn(Bn(e.clientX, e.clientY))), Yt(A.id), $n());
	}
	function la() {
		A = null, yn(), Q("pointermove", ca), Q("pointerup", la), X(), Y();
	}
	P(ft, "click", (e) => {
		e.target.closest("[data-role=\"legend-close\"]") && Br(!1);
	}), P(B, "click", (e) => {
		if (e.target.closest("[data-role=\"panel-close\"]")) {
			xr();
			return;
		}
		if (e.target.closest("[data-role=\"add-child\"]")) {
			jr(m.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"detach\"]")) {
			lr(m.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"attach\"]")) {
			let e = m.selectedNodeId;
			xr(), fr(e);
			return;
		}
		if (e.target.closest("[data-role=\"del-node\"]")) {
			Mr(m.selectedNodeId);
			return;
		}
		let t = e.target.closest("[data-uidx]");
		if (t) {
			let e = t.closest("[data-role=\"user-results\"]"), n = e && e._users && e._users[+t.dataset.uidx];
			n && Dr(n);
			return;
		}
	}), P(st, "input", (e) => {
		if (!m.editMode) return;
		let t = e.target.closest("[data-field]");
		if (!t) return;
		let n = m.selectedNodeId;
		if (!n) return;
		let r = t.dataset.field, i = t.value;
		if (r === "type") {
			kr(n, { type: i }), Sr();
			return;
		}
		if (r !== "width" && r !== "height") {
			if (r === "photo_url") {
				let e = g[n];
				kr(n, { data: Object.assign({}, e.data, { photo_url: i || null }) });
				return;
			}
			if (r === "layoutMode") {
				kr(n, { layoutMode: i || null });
				return;
			}
			kr(n, { [r]: i }), r === "personName" && Tr(i);
		}
	});
	function ua(e) {
		if (!m.editMode || !e) return;
		let t = m.selectedNodeId, n = t && g[t];
		if (!n) return;
		let r = e.dataset.field;
		if (r !== "width" && r !== "height") return;
		let i = parseFloat(e.value);
		if (!Number.isFinite(i)) {
			e.value = n[r];
			return;
		}
		let a = Math.max(20, i);
		e.value = a, Number(n[r]) !== a && kr(t, { [r]: a });
	}
	P(st, "change", (e) => ua(e.target.closest("[data-field]"))), P(st, "keydown", (e) => {
		let t = e.target.closest("[data-field=\"width\"], [data-field=\"height\"]");
		if (t && (e.key === "Enter" && (e.preventDefault(), ua(t), t.blur()), e.key === "Escape")) {
			let e = m.selectedNodeId && g[m.selectedNodeId];
			e && (t.value = e[t.dataset.field]), t.blur();
		}
	}), P(V, "click", (e) => {
		if (e.target.closest("[data-role=\"settings-close\"]")) {
			Kr(!1);
			return;
		}
		if (e.target.closest("[data-role=\"reset-settings\"]")) {
			qr();
			return;
		}
		if (e.target.closest("[data-role=\"preset-save\"]")) {
			let e = (dt.querySelector("[data-role=\"preset-name\"]") || {}).value || "", t = !!(dt.querySelector("[data-role=\"preset-full\"]") || {}).checked;
			e.trim() && Ci(e, { full: t });
			return;
		}
		let t = e.target.closest("[data-role=\"preset-apply\"]");
		if (t) {
			wi(t.dataset.name);
			return;
		}
		let n = e.target.closest("[data-role=\"preset-del\"]");
		if (n) {
			Ti(n.dataset.name);
			return;
		}
		if (e.target.closest("[data-role=\"add-rule\"]")) {
			C.push(de({
				field: "type",
				value: "",
				style: {}
			})), Qr(), Lr(), X(), N("settings-change", K());
			return;
		}
		let r = e.target.closest("[data-rk=\"remove\"]");
		r && (C.splice(+r.dataset.rule, 1), Qr(), Lr(), X(), N("settings-change", K()));
	}), P(dt, "input", (e) => {
		let t = e.target;
		if (t.dataset.set != null) {
			let e = t.dataset.set, n = parseFloat(t.value), r = dt.querySelector(`[data-rangelabel="${e}"]`);
			r && (r.textContent = n);
			return;
		}
		if (t.dataset.setToggle === "showImages") {
			Xi(t.checked);
			return;
		}
		if (t.dataset.setToggle === "autoEdgeSide") {
			Yi(t.checked);
			return;
		}
		if (t.dataset.setToggle === "photoContain") {
			Pt({ contain: t.checked });
			return;
		}
		if (t.dataset.rule != null) {
			let e = +t.dataset.rule, n = t.dataset.rk, r = C[e];
			if (!r) return;
			if (n === "enabled") r.enabled = t.checked;
			else if (n === "field") r.field = t.value;
			else if (n === "value") r.value = t.value;
			else if (n === "bg" || n === "text" || n === "border") $r(e, n) && (r.style[n] = t.value);
			else if (/-on$/.test(n)) {
				let i = n.replace("-on", "");
				r.style[i] = t.checked ? ei(e, i) || "#e0524d" : "";
			}
			Lr(), N("settings-change", K()), X();
		}
	}), P(dt, "change", (e) => {
		let t = e.target;
		if (t.dataset.set == null) return;
		let n = t.dataset.set, r = parseFloat(t.value);
		if (Number.isFinite(r)) {
			if (n === "cardWidth") {
				Pt({ width: r });
				return;
			}
			if (n === "photoHeight") {
				Pt({ photoHeight: r });
				return;
			}
			Number(m[n]) !== r && (m[n] = r, U("settings-" + n), N("settings-change", K()), X());
		}
	}), P(L, "pointerdown", (e) => {
		if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn") || e.target.closest(".loc-legend")) return;
		da();
		let t = () => {
			Dn(), m.selectedEdgeId && Kn(), m.selectedFamilyId && Jn(), jn(), dr && pr(), xr();
		};
		if (e.altKey) {
			Ln(e);
			return;
		}
		if (e.ctrlKey || e.metaKey) {
			On(e);
			return;
		}
		if (!p.enablePan) {
			t();
			return;
		}
		let n = e.clientX, r = e.clientY, i = m.panX, a = m.panY, o = !1;
		L.classList.add("loc-panning");
		let s = (e) => {
			!o && Math.abs(e.clientX - n) + Math.abs(e.clientY - r) > 3 && (o = !0), m.panX = i + (e.clientX - n), m.panY = a + (e.clientY - r), Xt();
		}, c = () => {
			L.classList.remove("loc-panning"), Q("pointermove", s), Q("pointerup", c), o || t();
		};
		Z("pointermove", s), Z("pointerup", c);
	}), P(L, "wheel", (e) => {
		if (!p.enableZoom || e.target.closest && (e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-legend"))) return;
		e.preventDefault();
		let t = L.getBoundingClientRect(), n = e.clientX - t.left, r = e.clientY - t.top, i = e.deltaY < 0 ? 1.1 : 1 / 1.1, a = Math.min(Te, Math.max(.15, m.zoom * i));
		m.panX = n - (n - m.panX) * (a / m.zoom), m.panY = r - (r - m.panY) * (a / m.zoom), m.zoom = a, Xt();
	}, { passive: !1 });
	function Z(e, t) {
		window.addEventListener(e, t), Ue.push({
			target: window,
			type: e,
			fn: t
		});
	}
	function Q(e, t) {
		window.removeEventListener(e, t);
	}
	function da() {
		try {
			F.focus({ preventScroll: !0 });
		} catch {}
	}
	P(F, "keydown", (e) => {
		let t = e.target;
		if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
		let n = (e.key || "").toLowerCase();
		if (!(e.ctrlKey || e.metaKey)) {
			if (m.selectedFamilyId && (n === "delete" || n === "backspace")) {
				e.preventDefault(), Yn();
				return;
			}
			if (m.selectedFamilyId && n === "escape") {
				e.preventDefault(), Jn();
				return;
			}
			if (W.size && (n === "delete" || n === "backspace")) {
				e.preventDefault(), Nn();
				return;
			}
			if (n === "escape" && W.size) {
				e.preventDefault(), jn();
				return;
			}
			return;
		}
		n === "z" && !e.shiftKey ? (e.preventDefault(), di()) : (n === "z" && e.shiftKey || n === "y") && (e.preventDefault(), fi());
	});
	function fa() {
		let e = p.toolbar && typeof p.toolbar == "object" ? p.toolbar : {}, t = (t) => t === "subtree" ? e[t] === !0 : e[t] !== !1, n = H("div", "loc-toolbar"), r = "";
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
				if (t.dataset.mode) Hi(t.dataset.mode);
				else if (t.dataset.orient) Vi(t.dataset.orient);
				else if (t.dataset.flag) m[t.dataset.flag] = !m[t.dataset.flag], t.dataset.flag === "showGrid" ? Qt() : t.dataset.flag === "alignGrid" && (_ = Object.create(null), U("align-grid")), $(), X();
				else switch (t.dataset.act) {
					case "undo":
						di();
						break;
					case "redo":
						fi();
						break;
					case "expand":
						rn();
						break;
					case "collapse":
						an();
						break;
					case "fit":
						$t();
						break;
					case "relayout":
						Zi();
						break;
					case "reset":
						$i();
						break;
					case "fullscreen":
						ia();
						break;
					case "edit":
						yr(!m.editMode);
						break;
					case "images":
						Xi();
						break;
					case "legend":
						Vr();
						break;
					case "settings":
						Kr();
						break;
					case "png":
						Fi(3);
						break;
					case "svg":
						Pi();
						break;
					case "pdf":
						Li();
						break;
					case "json":
						Ei(!0);
						break;
				}
			}
		}), n.addEventListener("input", (e) => {
			let t = e.target.closest("[data-role=\"search\"]");
			t && sn(t.value);
		}), n;
		function i(e, t) {
			return `<div class="loc-group">${e ? `<span class="loc-label">${e}</span>` : ""}${t}</div>`;
		}
		function a(e, t, n) {
			return `<button data-${e}="${t}">${n}</button>`;
		}
	}
	function $() {
		I && (I.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === m.subtreeMode)), I.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === m.orientation)), I.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!m[e.dataset.flag])), I.querySelectorAll("button[data-act=\"edit\"]").forEach((e) => e.classList.toggle("loc-active", m.editMode)), I.querySelectorAll("button[data-act=\"images\"]").forEach((e) => e.classList.toggle("loc-active", m.showImages)), I.querySelectorAll("button[data-act=\"legend\"]").forEach((e) => e.classList.toggle("loc-active", m.showLegend)), I.querySelectorAll("button[data-act=\"fullscreen\"]").forEach((e) => e.classList.toggle("loc-active", ta())), I.querySelectorAll("button[data-act=\"undo\"]").forEach((e) => {
			e.disabled = !li();
		}), I.querySelectorAll("button[data-act=\"redo\"]").forEach((e) => {
			e.disabled = !ui();
		}));
	}
	if (P(document, "fullscreenchange", aa), P(document, "webkitfullscreenchange", aa), mi(), $(), Qt(), zr(), vr(), He) {
		let e = U("initial");
		p.fitOnInit && e.then((e) => {
			e && $t();
		});
	} else _t(), vt(), Ve = Promise.resolve(!0), p.fitOnInit && $t();
	ci(), typeof ResizeObserver < "u" && !p.targetSize && p.reflowOnResize && (Re = L.clientWidth > 0 && L.clientHeight > 0 ? L.clientWidth / L.clientHeight : 0, Ie = new ResizeObserver(() => {
		if (m.subtreeMode !== "AutoSmart" && m.subtreeMode !== "GridSmart" && m.subtreeMode !== "Auto" || Object.keys(_).length || L.clientWidth <= 0 || L.clientHeight <= 0) return;
		let e = L.clientWidth / L.clientHeight;
		Re && Math.abs(Math.log(e / Re)) < .08 || (Re = e, Le && cancelAnimationFrame(Le), Le = requestAnimationFrame(() => {
			Le = 0, U("resize").then((e) => {
				e && $t();
			});
		}));
	}), Ie.observe(L));
	let pa = !1;
	function ma() {
		if (!pa) {
			pa = !0, wt("destroyed"), Ue.forEach(({ target: e, type: t, fn: n, optsL: r }) => e.removeEventListener(t, n, r)), Ue.length = 0, Me && cancelAnimationFrame(Me), un(), Le && cancelAnimationFrame(Le), Ie && Ie.disconnect(), Cr && clearTimeout(Cr), F.remove();
			for (let e in D) delete D[e];
			for (let e in O) delete O[e];
			for (let e in k) delete k[e];
		}
	}
	let ha = {
		root: F,
		setNodes: zi,
		loadJSON: Bi,
		setOrientation: Vi,
		setSubtreeMode: Hi,
		setSpacing: Ui,
		setOption: Wi,
		setShowGrid: Gi,
		setSnapToGrid: Ki,
		setAlignToGrid: qi,
		toggleGrid: Ji,
		fitToScreen: $t,
		relayout: Zi,
		forceRelayout: Qi,
		resetView: $i,
		expandAll: rn,
		collapseAll: an,
		toggleCollapse: on,
		centerOnNode: en,
		search: sn,
		clearSearch: cn,
		exportJSON: Ei,
		exportSVG: Pi,
		exportPNG: Fi,
		exportWebP: Ii,
		exportPDF: Li,
		buildSVG: ji,
		setEditMode: yr,
		isEditMode: () => m.editMode,
		setShowImages: Xi,
		isShowingImages: () => m.showImages,
		setShowLegend: Br,
		toggleLegend: Vr,
		isShowingLegend: () => m.showLegend,
		getLegendBody: () => mt,
		setAutoEdgeSide: Yi,
		isAutoEdgeSide: () => m.autoEdgeSide,
		setPhotoHeight: (e) => Pt({ photoHeight: e }),
		setCardWidth: (e) => Pt({ width: e }),
		setCardSize: Pt,
		setPhotoRendering: Pt,
		setPhotoContain: (e) => Pt({ contain: e !== !1 }),
		getSelection: () => [...S],
		setSelection: (e) => En(Array.isArray(e) ? e : e ? [e] : []),
		clearSelection: () => {
			Dn(), Cn();
		},
		getEdgeSelection: () => [...W],
		setEdgeSelection: Mn,
		clearEdgeSelection: jn,
		resetSelectedEdges: Nn,
		getFamilyRouteSelection: () => m.selectedFamilyId,
		getFamilyNetworks: () => J(De),
		getFamilyRouteOverrides: () => J(b),
		setFamilyRouteOverride: Xn,
		resetFamilyRoute: Yn,
		enterFullscreen: na,
		exitFullscreen: ra,
		toggleFullscreen: ia,
		isFullscreen: ta,
		undo: di,
		redo: fi,
		canUndo: li,
		canRedo: ui,
		updateNode: kr,
		addChild: jr,
		deleteNode: Mr,
		reparentNode: cr,
		detachNode: lr,
		attachNode: ur,
		beginAttach: fr,
		cancelAttach: pr,
		isAttaching: () => !!dr,
		openInspector: br,
		closeInspector: xr,
		nodeScreenRect: zn,
		getSettings: K,
		setSettings: Gr,
		toggleSettings: Kr,
		resetSettings: qr,
		saveLayoutPreset: Ci,
		loadLayoutPreset: wi,
		deleteLayoutPreset: Ti,
		listLayoutPresets: xi,
		getLayoutPresets: Si,
		getLayout: yi,
		applyLayout: bi,
		getNodeHost: (e) => D[e] || null,
		getNodeSlotEl: (e) => D[e] ? D[e].querySelector(".loc-node-slot") : null,
		getInspectorBody: () => st,
		getSettingsBody: () => dt,
		nodeThemeStyle: (e) => g[e] ? ue(g[e], C) : null,
		getState: () => ({
			...m,
			familyRouteOverrides: J(b)
		}),
		getNodes: () => h.map((e) => ({ ...e })),
		getPositioned: () => T,
		isLayoutBusy: () => Be,
		whenLayoutSettled: () => Ve,
		cancelLayout: () => wt("cancelled"),
		on: Ge,
		off: Ke,
		destroy: ma
	};
	return ha;
}
//#endregion
export { Te as t };
