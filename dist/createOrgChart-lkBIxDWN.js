import { C as e, D as t, E as n, F as r, S as i, c as a, d as o, f as s, h as c, i as l, k as u, n as ee, o as d, r as te, s as ne, t as re, v as ie } from "./bounds-CQAjmKDe.js";
import { a as ae, i as oe, n as se, o as ce, s as le } from "./core-C89cy5Ou.js";
//#region src/core/layout.worker.js?worker
function ue(e) {
	return new Worker("" + new URL("assets/layout.worker-C2cAKTC0.js", import.meta.url).href, { name: e?.name });
}
//#endregion
//#region src/vanilla/createOrgChart.js
var de = 116, fe = "http://www.w3.org/2000/svg", pe = .72, me = 12, he = /* @__PURE__ */ new Map();
function ge(e) {
	return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function _e(e, t) {
	for (he.has(e) && he.delete(e), he.set(e, ge(t)); he.size > me;) he.delete(he.keys().next().value);
}
var ve = {
	Top: "TopToBottom",
	Bottom: "BottomToTop",
	Left: "LeftToRight",
	Right: "RightToLeft"
};
function ye(e) {
	return ve[e] || e;
}
var be = {
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
function f(me, ve = {}) {
	if (!me || !me.appendChild) throw Error("createOrgChart: first argument must be a DOM element.");
	let f = Object.assign({}, be, ve), xe = f.alignGrid == null ? f.subtreeMode === "GridSmart" : !!f.alignGrid, Se = +f.maxZoom > 1 ? +f.maxZoom : 4, p = {
		orientation: ye(f.orientation),
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
		alignGrid: xe,
		editMode: !!f.editMode,
		showImages: f.showImages !== !1,
		showLegend: !!f.legend,
		autoEdgeSide: !!f.autoEdgeSide,
		photoHeight: +f.photoHeight || 104,
		cardWidth: +f.cardWidth || r.width,
		photoContain: f.photoContain !== !1
	}, m = (f.nodes || []).map(i), h = u(m), g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.assign(Object.create(null), f.familyRouteOverrides || {}), b = Object.create(null), x = /* @__PURE__ */ new Set(), S = (f.settings && f.settings.themeRules || f.themeRules || []).map(se), Ce = {
		spacingX: f.spacingX,
		spacingY: f.spacingY,
		gridSize: f.gridSize,
		showGrid: !!f.showGrid,
		snapGrid: !!f.snapGrid,
		alignGrid: xe,
		themeRules: S.map((e) => ({
			enabled: e.enabled,
			field: e.field,
			value: e.value,
			style: Object.assign({}, e.style)
		}))
	}, we = 0, C = [], w = Object.create(null), Te = [], Ee = [], De = null, T = Object.create(null), E = Object.create(null), D = Object.create(null), Oe = Object.create(null), O = null, ke = null, k = null, Ae = 0, je = /* @__PURE__ */ new Set(), Me = null, Ne = 0, Pe = null, Fe = 0, Ie = 0, Le = 0, A = null, Re = !1, ze = Promise.resolve(!0), Be = f.layoutWorker !== !1 && typeof Worker < "u", Ve = [], He = Object.create(null);
	function Ue(e, t) {
		return (He[e] || (He[e] = [])).push(t), la;
	}
	function We(e, t) {
		return He[e] && (He[e] = He[e].filter((e) => e !== t)), la;
	}
	function j(e, t) {
		(He[e] || []).forEach((e) => {
			try {
				e(t);
			} catch {}
		});
	}
	function M(e, t, n, r) {
		e.addEventListener(t, n, r), Ve.push({
			target: e,
			type: t,
			fn: n,
			optsL: r
		});
	}
	let N = document.createElement("div");
	N.className = "loc-root", N.tabIndex = -1;
	let P = f.toolbar ? oa() : null;
	P && N.appendChild(P);
	let F = B("div", "loc-canvas"), Ge = B("div", "loc-content"), Ke = B("div", "loc-grid"), qe = document.createElementNS(fe, "svg");
	qe.setAttribute("class", "loc-connectors");
	let Je = document.createElementNS(fe, "g");
	Je.setAttribute("class", "loc-visible-edges");
	let Ye = document.createElementNS(fe, "g");
	Ye.setAttribute("class", "loc-logical-edges");
	let Xe = document.createElementNS(fe, "g");
	Xe.setAttribute("class", "loc-edgehits");
	let Ze = document.createElementNS(fe, "g");
	Ze.setAttribute("class", "loc-familyhits"), qe.appendChild(Je), qe.appendChild(Ye), qe.appendChild(Xe), qe.appendChild(Ze);
	let Qe = B("div", "loc-nodes"), I = document.createElementNS(fe, "svg");
	I.setAttribute("class", "loc-overlay");
	let L = document.createElementNS(fe, "g");
	L.setAttribute("class", "loc-edgehandles");
	let $e = document.createElementNS(fe, "g");
	$e.setAttribute("class", "loc-family-selection");
	let et = document.createElementNS(fe, "g");
	et.setAttribute("class", "loc-aligns"), I.appendChild(et), I.appendChild($e), I.appendChild(L);
	let tt = B("div", "loc-zoomreadout");
	tt.textContent = "100%", Ge.appendChild(Ke), Ge.appendChild(qe), Ge.appendChild(Qe), Ge.appendChild(I), F.appendChild(Ge), F.appendChild(tt);
	let nt = null;
	f.fullscreenControl && (nt = B("button", "loc-fsbtn"), nt.type = "button", nt.title = "Fullscreen", nt.setAttribute("aria-label", "Toggle fullscreen"), nt.innerHTML = "⛶", M(nt, "click", (e) => {
		e.stopPropagation(), Qi();
	}), F.appendChild(nt)), N.appendChild(F);
	let R = B("div", "loc-panel");
	R.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Node</span><button class=\"loc-panel-close\" title=\"Close\" data-role=\"panel-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"panel-body\"></div><div class=\"loc-panel-foot\" data-role=\"panel-foot\"></div>";
	let rt = ft(f.inspectorTarget) || F;
	rt.appendChild(R), rt !== F && R.classList.add("loc-panel-external");
	let it = R.querySelector("[data-role=\"panel-body\"]"), at = R.querySelector("[data-role=\"panel-foot\"]"), ot = R.querySelector(".loc-panel-title"), z = B("div", "loc-settings");
	z.innerHTML = "<div class=\"loc-panel-head\"><span class=\"loc-panel-title\">Settings</span><button class=\"loc-panel-close\" title=\"Close\" data-role=\"settings-close\">✕</button></div><div class=\"loc-panel-body\" data-role=\"settings-body\"></div>";
	let st = ft(f.settingsTarget) || F;
	st.appendChild(z), st !== F && z.classList.add("loc-panel-external");
	let ct = z.querySelector("[data-role=\"settings-body\"]"), lt = B("div", "loc-legend");
	lt.innerHTML = "<div class=\"loc-legend-head\"><span class=\"loc-legend-title\">Legend</span><button class=\"loc-legend-close\" title=\"Hide legend\" data-role=\"legend-close\">✕</button></div><div class=\"loc-legend-body\" data-role=\"legend-body\"></div>";
	let ut = ft(f.legendTarget) || F;
	ut.appendChild(lt), ut !== F && lt.classList.add("loc-legend-external");
	let dt = lt.querySelector("[data-role=\"legend-body\"]");
	Ot(), kt(), me.appendChild(N);
	function B(e, t) {
		let n = document.createElement(e);
		return t && (n.className = t), n;
	}
	function ft(e) {
		if (!e) return null;
		let t = typeof e == "string" ? document.querySelector(e) : e;
		return t && t.appendChild ? t : null;
	}
	function pt() {
		return c({
			orientation: p.orientation,
			subtreeMode: p.subtreeMode,
			spacingX: p.spacingX,
			spacingY: p.spacingY,
			gridSize: p.gridSize,
			alignGrid: p.alignGrid,
			autoEdgeSide: p.autoEdgeSide,
			familyRouteOverrides: y,
			targetAspect: f.targetAspect,
			targetSize: f.targetSize || {
				width: F.clientWidth,
				height: F.clientHeight
			}
		});
	}
	function mt() {
		let e = pt(), t = s(m, e);
		yt(t), f.layoutCache !== !1 && _e(_t(m, e), gt(t));
	}
	function ht() {
		N.classList.toggle("loc-horizontal", o(pt())), qt(), Ut(), Dt(), Kt(), an(), p.showLegend && Lr(), X(), j("layout-change", {
			positioned: C,
			familyNetworks: Te,
			mode: p.subtreeMode,
			orientation: p.orientation
		});
	}
	function gt(e) {
		return {
			positioned: e.positioned,
			bounds: e.bounds,
			framingBounds: e.framingBounds,
			familyNetworks: e.familyNetworks || [],
			cfg: e.cfg
		};
	}
	function _t(e, t) {
		return JSON.stringify({
			nodes: e,
			options: t
		});
	}
	function vt() {
		let e = Object.create(null);
		for (let t of Object.keys(g)) {
			let n = w[t];
			n && (e[t] = d(n, g));
		}
		return e;
	}
	function yt(e, t) {
		let n = ge(gt(e)), r = vt(), i = Object.assign(Object.create(null), t || {}, r);
		for (let e of n.positioned || []) {
			let t = h[String(e.node.id)];
			t && (e.node = Object.assign({}, e.node, ge(t)));
		}
		C = n.positioned || [], w = Object.create(null);
		for (let e of C) w[String(e.node.id)] = e;
		Te = n.familyNetworks || [], De = n.framingBounds || n.bounds || null;
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
	function bt(e) {
		Re = !!e, N.classList.toggle("loc-layout-busy", Re), Re ? N.setAttribute("aria-busy", "true") : N.removeAttribute("aria-busy");
	}
	function xt(e = "superseded", t = !1) {
		let n = A;
		return n ? (A = null, n.worker && n.worker.terminate(), n.timer && clearTimeout(n.timer), n.resolve(!1), j("layout-cancel", {
			id: n.id,
			reason: n.reason,
			cause: e
		}), t || bt(!1), !0) : !1;
	}
	function St(e, t, n, r) {
		return !A || A.id !== e.id || e.id !== Le ? !1 : (A = null, yt(t, e.pins), ht(), bt(!1), j("layout-complete", {
			id: e.id,
			reason: e.reason,
			durationMs: Math.round(n || 0),
			cached: !!r
		}), e.resolve(!0), !0);
	}
	function Ct(e, t) {
		!A || A.id !== e.id || (A = null, bt(!1), j("layout-error", {
			id: e.id,
			reason: e.reason,
			error: t instanceof Error ? t : Error(t?.message || String(t))
		}), e.resolve(!1));
	}
	function wt(e, t, n) {
		n && (Be = !1, j("layout-error", {
			id: e.id,
			reason: e.reason,
			error: n,
			fallback: !0
		})), e.timer = setTimeout(() => {
			if (e.timer = 0, !A || A.id !== e.id) return;
			let n = performance.now();
			try {
				let r = s(t.nodes, t.options);
				f.layoutCache !== !1 && _e(e.signature, gt(r)), St(e, r, performance.now() - n, !1);
			} catch (t) {
				Ct(e, t);
			}
		}, 0);
	}
	function Tt(e = "refresh", t = {}) {
		xt("superseded", !0);
		let n = ++Le, r = pt(), i = _t(m, r), a = t.pins || (t.preserveManual ? vt() : null), o, s = new Promise((e) => {
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
		A = c, ze = s, bt(!0), j("layout-start", {
			id: n,
			reason: e
		});
		let l = f.layoutCache !== !1 && he.get(i);
		if (l) return Promise.resolve().then(() => St(c, l, 0, !0)), s;
		let u = JSON.parse(i);
		if (!Be) return wt(c, u), s;
		try {
			let e = new ue();
			c.worker = e, e.addEventListener("message", (t) => {
				let n = t.data || {};
				if (!(n.id !== c.id || !A || A.id !== c.id)) {
					if (e.terminate(), c.worker = null, !n.ok) {
						Ct(c, Error(n.error?.message || "Layout worker failed."));
						return;
					}
					f.layoutCache !== !1 && _e(i, n.result), St(c, n.result, n.durationMs, !1);
				}
			}), e.addEventListener("error", (t) => {
				!A || A.id !== c.id || (e.terminate(), c.worker = null, wt(c, u, Error(t.message || "Layout worker failed to load.")));
			}, { once: !0 }), e.postMessage({
				id: n,
				nodes: u.nodes,
				options: u.options
			});
		} catch (e) {
			c.worker && c.worker.terminate(), c.worker = null, wt(c, u, e);
		}
		return s;
	}
	function V(e = "refresh", t) {
		return Tt(e, t);
	}
	function Et(e) {
		let t = Object.create(null);
		for (let e of C) t[e.node.id] = d(e, g);
		return e(), Tt("structural-edit", { pins: t });
	}
	function Dt() {
		let e = Object.create(null);
		for (let t of C) {
			let n = t.node;
			e[n.id] = !0;
			let r = T[n.id];
			r || (r = Mt(n), T[n.id] = r, Qe.appendChild(r)), r.style.width = n.width + "px", r.style.height = n.height + "px";
			let i = d(t, g);
			r.style.transform = `translate(${i.x - n.width / 2}px, ${i.y - n.height / 2}px)`, f.nodeSlots || (r.dataset.fitted || (Ft(r), r.dataset.fitted = "1"), Ar(r, n)), r.classList.toggle("loc-selected", x.has(n.id)), r.classList.toggle("loc-primary", p.selectedNodeId === n.id && x.size > 1), It(r, n);
		}
		for (let t in T) e[t] || (T[t].remove(), delete T[t]);
		j("nodes-rendered", { ids: C.map((e) => e.node.id) });
	}
	function Ot() {
		N.style.setProperty("--loc-photo-h", (p.photoHeight || 104) + "px"), N.style.setProperty("--loc-photo-fit", p.photoContain ? "contain" : "cover");
	}
	function kt() {
		let e = Math.max(100, p.cardWidth || r.width), t = Math.max(60, (p.photoHeight || 104) + de);
		for (let n of m) n.type !== "department" && (n.width = e, n.height = t);
	}
	function At(e) {
		e ||= {};
		let t = p.cardWidth, n = p.photoHeight;
		typeof e.width == "number" && (p.cardWidth = Math.max(100, e.width)), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight));
		let r = p.cardWidth !== t || p.photoHeight !== n;
		if ("contain" in e && (p.photoContain = !!e.contain), Ot(), r) {
			kt();
			for (let e in T) delete T[e].dataset.fitted;
			Dt(), V("card-size");
		}
		X(), j("settings-change", G());
	}
	function jt(e) {
		e.textContent = "", e.innerHTML = "<svg class=\"loc-usericon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7\"/></svg>";
	}
	function Mt(e) {
		if (f.nodeSlots) {
			let t = B("div", "loc-node loc-node-host loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
			return t.dataset.id = e.id, t.innerHTML = "<div class=\"loc-node-slot\"></div>", t.appendChild(Nt()), t;
		}
		let t = B("div", "loc-node loc-" + e.type + (e.status ? " loc-status-" + e.status : ""));
		if (t.dataset.id = e.id, e.type === "department") t.innerHTML = "<span class=\"loc-lbl\"></span>", t.querySelector(".loc-lbl").textContent = e.label, t.querySelector(".loc-lbl").title = e.label || "";
		else {
			t.innerHTML = "<div class=\"loc-photo\"></div><div class=\"loc-ptext\"><div class=\"loc-pname\"></div><div class=\"loc-ptitle\"></div><div class=\"loc-badge\"></div></div>";
			let n = t.querySelector(".loc-photo"), r = e.data && e.data.photo_url;
			if (p.showImages && r) {
				let t = new Image();
				t.crossOrigin = "anonymous", t.alt = e.personName || "", t.referrerPolicy = "no-referrer", t.onerror = () => {
					jt(n);
				}, t.src = r, n.appendChild(t);
			} else jt(n);
			let i = t.querySelector(".loc-pname"), a = t.querySelector(".loc-ptitle");
			i.textContent = e.personName || "—", i.title = e.personName || "", a.textContent = e.label, a.title = e.label || "";
			let o = t.querySelector(".loc-badge");
			e.status ? (o.textContent = e.status, o.className = "loc-badge loc-" + e.status) : o.remove();
		}
		return t.appendChild(Nt()), t;
	}
	function Nt() {
		let e = B("div", "loc-toggle");
		return e.dataset.role = "toggle", e;
	}
	function Pt(e) {
		return e.scrollWidth > e.clientWidth + .5 || e.scrollHeight > e.clientHeight + .5;
	}
	function Ft(e) {
		if (e.style.setProperty("--loc-fit", "1"), !Pt(e)) return;
		let t = pe, n = 1;
		for (let r = 0; r < 7; r++) {
			let r = (t + n) / 2;
			e.style.setProperty("--loc-fit", String(r)), Pt(e) ? n = r : t = r;
		}
		e.style.setProperty("--loc-fit", String(t));
	}
	function It(e, t) {
		let r = e.querySelector("[data-role=\"toggle\"]");
		if (!r) return;
		let i = n(m, t.id) > 0;
		r.style.display = i ? "flex" : "none", r.textContent = t.collapsed ? "+" : "−";
		let a = t.collapsed ? "Expand" : "Collapse";
		r.title = a, r.setAttribute("aria-label", a);
	}
	function Lt(e) {
		return document.createElementNS(fe, e);
	}
	function Rt(e) {
		return a(w[e.node.parentId], e, pt(), g, _, v);
	}
	function zt(e) {
		return `M ${e.a.x.toFixed(1)} ${e.a.y.toFixed(1)} L ${e.b.x.toFixed(1)} ${e.b.y.toFixed(1)}`;
	}
	function Bt() {
		let e = /* @__PURE__ */ new Set(), t = (e) => {
			let t = g[e];
			return t && (Math.abs(Number(t.dx) || 0) > .01 || Math.abs(Number(t.dy) || 0) > .01);
		};
		for (let n of Te) {
			let r = String(n.parentId);
			(t(r) || n.childIds.some((e) => t(e) || _[e] && _[e].length || v[e])) && e.add(r);
		}
		return e;
	}
	function Vt(e = null) {
		let t = e || Object.entries(E).map(([e, t]) => ({
			id: e,
			d: t.getAttribute("d") || ""
		})), n = ie(t, Te, { rebuildFamilyIds: Bt() });
		Ee = n.familyNetworks, Je.innerHTML = "";
		for (let e of n.segments) {
			let t = Lt("path");
			t.setAttribute("d", e.d), t.setAttribute("class", "loc-visible-edge"), t.dataset.edges = e.memberIds.join(","), Je.appendChild(t);
		}
	}
	function Ht() {
		let e = Object.create(null);
		$e.innerHTML = "";
		for (let t of Ee) {
			if (!t.trunk) continue;
			let n = String(t.parentId);
			e[n] = !0;
			let r = Oe[n];
			if (r || (r = Lt("path"), r.dataset.family = n, Oe[n] = r, Ze.appendChild(r)), r.setAttribute("d", zt(t.trunk)), r.dataset.children = t.trunk.childIds.join(","), p.selectedFamilyId === n) for (let e of t.segments) {
				let t = Lt("path");
				t.setAttribute("d", e.d || zt(e)), t.setAttribute("class", "loc-family-selected"), $e.appendChild(t);
			}
		}
		for (let t in Oe) e[t] || (Oe[t].remove(), delete Oe[t]);
		p.selectedFamilyId && !e[p.selectedFamilyId] && Un();
	}
	function Ut() {
		let e = Object.create(null), t = [];
		for (let n of C) {
			let r = n.node;
			if (!r.parentId || !w[r.parentId]) continue;
			e[r.id] = !0;
			let i = Rt(n);
			t.push({
				id: r.id,
				d: i
			});
			let a = E[r.id];
			a || (a = Lt("path"), a.setAttribute("class", "loc-logical-edge"), E[r.id] = a, Ye.appendChild(a)), a.setAttribute("d", i), a.classList.toggle("loc-sel", p.selectedEdgeId === r.id), a.classList.toggle("loc-incident", Tn(r));
			let o = D[r.id];
			o || (o = Lt("path"), o.dataset.edge = r.id, D[r.id] = o, Xe.appendChild(o)), o.setAttribute("d", i);
		}
		for (let t in E) e[t] || (E[t].remove(), delete E[t]);
		for (let t in D) e[t] || (D[t].remove(), delete D[t]);
		Vt(t), Ht(), En(), p.selectedEdgeId && !e[p.selectedEdgeId] ? U() : Jn();
	}
	function Wt(e) {
		let t = w[e];
		if (!t || !w[t.node.parentId]) return;
		let n = Rt(t);
		return E[e] && E[e].setAttribute("d", n), D[e] && D[e].setAttribute("d", n), !0;
	}
	function Gt(e) {
		Wt(e) && (Vt(), Ht());
	}
	function Kt() {
		Ge.style.transform = `translate(${p.panX}px, ${p.panY}px) scale(${p.zoom})`, tt.textContent = Math.round(p.zoom * 100) + "%", p.selectedEdgeId && !O && Jn(), X();
	}
	function qt() {
		let e = 0, t = 0, n = 0, r = 0;
		for (let i of C) {
			let a = d(i, g), o = i.node.width / 2, s = i.node.height / 2;
			e = Math.min(e, a.x - o - 80), t = Math.min(t, a.y - s - 80), n = Math.max(n, a.x + o + 80), r = Math.max(r, a.y + s + 80);
		}
		qe.setAttribute("width", n), qe.setAttribute("height", r), I.setAttribute("width", n), I.setAttribute("height", r);
		let i = p.gridSize;
		Ke.style.left = e + "px", Ke.style.top = t + "px", Ke.style.width = n - e + "px", Ke.style.height = r - t + "px", Ke.style.backgroundSize = i + "px " + i + "px", Ke.style.backgroundPosition = (-e % i + i) % i + "px " + (-t % i + i) % i + "px";
	}
	function Jt() {
		Ke.classList.toggle("loc-on", p.showGrid), F.classList.toggle("loc-gridon", p.showGrid);
	}
	function Yt() {
		if (!C.length) return;
		let e = wi(0), t = ee(e, F.clientWidth, F.clientHeight);
		p.zoom = t.zoom, p.panX = t.panX, p.panY = t.panY, Kt();
	}
	function Xt(e) {
		let t = w[e];
		if (!t) return;
		let n = d(t, g);
		p.panX = F.clientWidth / 2 - n.x * p.zoom, p.panY = F.clientHeight / 2 - n.y * p.zoom, Kt();
	}
	function Zt() {
		let e = f.fitOnLayoutChange;
		return e === !0 ? "fit" : e === !1 ? "none" : e === "recenter" || e === "none" || e === "fit" ? e : "fit";
	}
	function Qt() {
		let e = Zt();
		if (e === "fit") {
			Yt();
			return;
		}
		if (e === "recenter") {
			let e = m.find((e) => !e.parentId), t = p.selectedNodeId && w[p.selectedNodeId] ? p.selectedNodeId : e && e.id;
			t && Xt(t);
		}
	}
	function $t() {
		for (let e of m) e.collapsed = !1;
		V("expand-all"), Y();
	}
	function en() {
		let e = t(m, h);
		for (let t of m) t.collapsed = e[t.id] >= 1 && n(m, t.id) > 0;
		V("collapse-all"), Y();
	}
	function tn(e) {
		let t = h[e];
		t && (Et(() => {
			t.collapsed = !t.collapsed;
		}), Pn(), Y());
	}
	function nn(e) {
		if (je = le(m, e), an(), je.size) {
			let e = C.find((e) => je.has(e.node.id));
			e && Xt(e.node.id);
		}
		return je.size;
	}
	function rn() {
		je = /* @__PURE__ */ new Set(), an();
	}
	function an() {
		let e = je.size > 0;
		for (let t of C) {
			let n = T[t.node.id];
			if (!n) continue;
			let r = je.has(t.node.id);
			n.classList.toggle("loc-highlight", e && r), n.classList.toggle("loc-dim", e && !r);
		}
		for (let t in E) E[t].classList.toggle("loc-hl", e && je.has(t));
	}
	function on() {
		Ne && clearTimeout(Ne), Ne = 0, Me = null;
	}
	function sn(e) {
		on(), Me = String(e), Ne = setTimeout(on, 0);
	}
	function cn(e) {
		if (e) {
			for (let t of e.groupIds) gn(t);
			_n(e.groupIds), j("node-drag", {
				id: e.id,
				node: h[e.id],
				offset: g[e.id],
				group: e.groupIds
			});
		}
	}
	function ln(e, t) {
		if (e.target.closest("[data-role=\"toggle\"]") || (e.stopPropagation(), aa(), or && lr(t))) return;
		if (U(), Un(), e.ctrlKey || e.metaKey) {
			xn(t);
			return;
		}
		if (x.has(t) ? (p.selectedNodeId = t, vn(), Pn()) : bn(t), j("node-select", {
			id: t,
			node: h[t],
			rect: Fn(t)
		}), f.readonly || !f.enableDragging || !p.editMode) {
			f.inspector && hr(t);
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
		}), Z("pointermove", un), Z("pointerup", dn);
	}
	function un(e) {
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
				let r = fn(k.id, e + t, a + n);
				t = r.cx - e, n = r.cy - a, mn(r.gx, r.gy);
			}
		}
		for (let e of k.groupIds) {
			let r = k.bases[e];
			g[e] = {
				dx: r.dx + t,
				dy: r.dy + n
			};
		}
		Ae ||= requestAnimationFrame(() => {
			Ae = 0, cn(k);
		});
	}
	function dn() {
		let e = !1, t = k;
		if (t) {
			Ae && (cancelAnimationFrame(Ae), Ae = 0, cn(t));
			for (let e of t.groupIds) T[e] && T[e].classList.remove("loc-dragging");
			j("node-drag-end", {
				id: t.id,
				node: h[t.id],
				offset: g[t.id],
				group: t.groupIds
			}), qt(), e = !!t.moved, e ? sn(t.id) : f.inspector && hr(t.id);
		}
		k = null, hn(), Q("pointermove", un), Q("pointerup", dn), X(), e && Y();
	}
	function fn(e, t, n) {
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
	function pn(e, t) {
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
		return mn(c, ee), {
			x: u,
			y: ne
		};
	}
	function mn(e, t) {
		et.innerHTML = "";
		let n = +I.getAttribute("width") || 0, r = +I.getAttribute("height") || 0, i = (e, t, n, r) => {
			let i = Lt("line");
			i.setAttribute("x1", e), i.setAttribute("y1", t), i.setAttribute("x2", n), i.setAttribute("y2", r), i.setAttribute("class", "loc-align-line"), et.appendChild(i);
		};
		e != null && i(e, 0, e, r), t != null && i(0, t, n, t);
	}
	function hn() {
		et.innerHTML = "";
	}
	function gn(e) {
		let t = w[e], n = T[e];
		if (!t || !n) return;
		let r = d(t, g);
		n.style.transform = `translate(${r.x - t.node.width / 2}px, ${r.y - t.node.height / 2}px)`;
	}
	function _n(e) {
		let t = new Set((e || []).map(String)), n = /* @__PURE__ */ new Set();
		for (let e of t) {
			let t = w[e];
			t && w[t.node.parentId] && n.add(String(e));
		}
		for (let e of C) t.has(String(e.node.parentId)) && n.add(String(e.node.id));
		let r = !1;
		for (let e of n) r = Wt(e) || r;
		r && (Vt(), Ht()), p.selectedEdgeId && Jn();
	}
	function vn() {
		for (let e in T) T[e].classList.toggle("loc-selected", x.has(e)), T[e].classList.toggle("loc-primary", p.selectedNodeId === e && x.size > 1);
	}
	function yn() {
		j("selection-change", {
			ids: [...x],
			primary: p.selectedNodeId
		});
	}
	function bn(e) {
		x = new Set(e ? [e] : []), p.selectedNodeId = e || null, vn(), Pn();
	}
	function xn(e) {
		x.has(e) ? (x.delete(e), p.selectedNodeId === e && (p.selectedNodeId = x.size ? [...x][x.size - 1] : null)) : (x.add(e), p.selectedNodeId = e), vn(), Pn(), yn();
	}
	function Sn(e, t) {
		x = new Set(e), p.selectedNodeId = t ?? (e.length ? e[e.length - 1] : null), vn(), Pn(), yn();
	}
	function Cn() {
		x = /* @__PURE__ */ new Set(), p.selectedNodeId = null, vn(), Pn();
	}
	function wn(e) {
		let t = In(e.clientX, e.clientY), n = e.shiftKey ? new Set(x) : /* @__PURE__ */ new Set(), r = Lt("rect");
		r.setAttribute("class", "loc-marquee"), I.appendChild(r), F.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = In(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e of C) {
				let t = d(e, g);
				t.x >= o && t.x <= o + c && t.y >= s && t.y <= s + l && u.add(e.node.id);
			}
			x = u, p.selectedNodeId = x.size ? [...x][x.size - 1] : null, vn(), Pn(), i = !0;
		}, o = () => {
			r.remove(), F.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? (yn(), x.size === 1 && f.inspector && hr([...x][0])) : (Cn(), gr());
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function Tn(e) {
		return x.has(e.id) || x.has(e.parentId);
	}
	let H = /* @__PURE__ */ new Set();
	function En() {
		for (let e in E) E[e].classList.toggle("loc-edge-selected", H.has(e));
	}
	function Dn() {
		H.size && (H = /* @__PURE__ */ new Set(), En(), j("edges-select", { ids: [] }));
	}
	function On(e) {
		H = new Set((e || []).filter((e) => E[e])), En(), j("edges-select", { ids: [...H] });
	}
	function kn() {
		if (!H.size) return;
		let e = !1;
		for (let t of H) _[t] && (delete _[t], e = !0), v[t] && (delete v[t], e = !0);
		e && (p.selectedEdgeId && H.has(p.selectedEdgeId) && U(), Ut(), En(), X(), Y(), j("edges-reset", { ids: [...H] }));
	}
	function An(e, t, n, r, i, a, o, s) {
		let c = (n - e) * (s - a) - (r - t) * (o - i);
		if (Math.abs(c) < 1e-9) return !1;
		let l = ((i - e) * (s - a) - (a - t) * (o - i)) / c, u = ((i - e) * (r - t) - (a - t) * (n - e)) / c;
		return l >= 0 && l <= 1 && u >= 0 && u <= 1;
	}
	function jn(e, t, n, r, i, a) {
		let o = n + i, s = r + a, c = (e) => e.x >= n && e.x <= o && e.y >= r && e.y <= s;
		return c(e) || c(t) ? !0 : An(e.x, e.y, t.x, t.y, n, r, o, r) || An(e.x, e.y, t.x, t.y, o, r, o, s) || An(e.x, e.y, t.x, t.y, o, s, n, s) || An(e.x, e.y, t.x, t.y, n, s, n, r);
	}
	function Mn(e, t, n, r, i) {
		let a = Rn(e);
		if (!a) return !1;
		for (let e of Bn(a)) if (jn(e.a, e.b, t, n, r, i)) return !0;
		return !1;
	}
	function Nn(e) {
		let t = In(e.clientX, e.clientY), n = e.shiftKey ? new Set(H) : /* @__PURE__ */ new Set(), r = Lt("rect");
		r.setAttribute("class", "loc-marquee loc-marquee-edge"), I.appendChild(r), F.classList.add("loc-marqueeing");
		let i = !1, a = (e) => {
			let a = In(e.clientX, e.clientY), o = Math.min(t.x, a.x), s = Math.min(t.y, a.y), c = Math.abs(a.x - t.x), l = Math.abs(a.y - t.y);
			r.setAttribute("x", o), r.setAttribute("y", s), r.setAttribute("width", c), r.setAttribute("height", l);
			let u = new Set(n);
			for (let e in E) Mn(e, o, s, c, l) && u.add(e);
			H = u, En(), i = !0;
		}, o = () => {
			r.remove(), F.classList.remove("loc-marqueeing"), Q("pointermove", a), Q("pointerup", o), i ? j("edges-select", { ids: [...H] }) : Dn();
		};
		Z("pointermove", a), Z("pointerup", o);
	}
	function Pn() {
		for (let e in E) {
			let t = w[e];
			E[e].classList.toggle("loc-incident", !!t && Tn(t.node));
		}
	}
	function Fn(e) {
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
	function In(e, t) {
		let n = F.getBoundingClientRect();
		return {
			x: (e - n.left - p.panX) / p.zoom,
			y: (t - n.top - p.panY) / p.zoom
		};
	}
	function Ln(e) {
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
	function Rn(e) {
		let t = w[e];
		if (!t) return null;
		let n = w[t.node.parentId];
		if (!n) return null;
		let r = pt(), i = l(t, _[e], v[e], n, r, g);
		return te(n, t, i, r, g, v[e]);
	}
	function zn(e) {
		if (_[e]) return _[e];
		let t = w[e], n = t && w[t.node.parentId], r = l(t, null, v[e], n, pt(), g);
		return _[e] = r.map((e) => ({
			x: e.x,
			y: e.y
		})), _[e];
	}
	function Bn(e) {
		let t = [], n = o(pt());
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
	function Vn(e) {
		Un(), p.selectedEdgeId && E[p.selectedEdgeId] && E[p.selectedEdgeId].classList.remove("loc-sel"), x = /* @__PURE__ */ new Set(), p.selectedNodeId = null, vn(), p.selectedEdgeId = e, E[e] && E[e].classList.add("loc-sel"), Pn(), Jn();
	}
	function U() {
		p.selectedEdgeId && E[p.selectedEdgeId] && E[p.selectedEdgeId].classList.remove("loc-sel"), p.selectedEdgeId = null, L.innerHTML = "";
	}
	function Hn(e) {
		let t = String(e);
		U(), x = /* @__PURE__ */ new Set(), p.selectedNodeId = null, vn(), p.selectedFamilyId = t, Ut();
		let n = Ee.find((e) => String(e.parentId) === t) || Te.find((e) => String(e.parentId) === t);
		j("family-route-select", {
			parentId: t,
			childIds: n ? n.childIds.slice() : []
		});
	}
	function Un() {
		if (p.selectedFamilyId) {
			p.selectedFamilyId = null, $e.innerHTML = "";
			for (let e in E) E[e].classList.remove("loc-family-member");
		}
	}
	function Wn(e = p.selectedFamilyId) {
		let t = e == null ? null : String(e);
		return !t || !y[t] ? !1 : (delete y[t], V("family-route-reset"), X(), Y(), j("family-route-reset", { parentId: t }), !0);
	}
	function Gn(e, t) {
		let n = e == null ? "" : String(e);
		return !n || !w[n] ? !1 : !t || !Number.isFinite(Number(t.trunkOffset)) ? Wn(n) : (y[n] = { trunkOffset: Number(t.trunkOffset) }, p.selectedFamilyId = n, V("family-route-override"), X(), Y(), j("family-route-change", {
			parentId: n,
			trunkOffset: y[n].trunkOffset,
			pending: !1
		}), !0);
	}
	function Kn(e, t, n, r) {
		let i = Lt("circle");
		return i.setAttribute("cx", e), i.setAttribute("cy", t), i.setAttribute("r", n), i.setAttribute("class", r), i;
	}
	function qn(e, t, n, r) {
		let i = Lt("rect");
		return i.setAttribute("x", e - n), i.setAttribute("y", t - n), i.setAttribute("width", 2 * n), i.setAttribute("height", 2 * n), i.setAttribute("rx", 2 / p.zoom), i.setAttribute("class", r), i;
	}
	function Jn() {
		L.innerHTML = "";
		let e = p.selectedEdgeId;
		if (!e || f.readonly) return;
		let t = Rn(e);
		if (!t) return;
		let n = _[e] || [], r = 6 / p.zoom, i = 5 / p.zoom;
		if (!p.editMode) {
			for (let e = 0; e < n.length; e++) {
				let t = Kn(n[e].x, n[e].y, r, "loc-wp-handle loc-wp-readonly");
				t.dataset.wp = e, L.appendChild(t);
			}
			return;
		}
		for (let e of Bn(t)) {
			let t = Kn((e.a.x + e.b.x) / 2, (e.a.y + e.b.y) / 2, i, "loc-wp-add");
			t.dataset.add = e.insert, L.appendChild(t);
		}
		for (let e = 0; e < n.length; e++) {
			let t = Kn(n[e].x, n[e].y, r, "loc-wp-handle");
			t.dataset.wp = e, L.appendChild(t);
		}
		let a = t[0], o = t[t.length - 1], s = qn(a.x, a.y, 6 / p.zoom, "loc-ep loc-ep-parent");
		s.dataset.ep = "parent", L.appendChild(s);
		let c = qn(o.x, o.y, 6 / p.zoom, "loc-ep loc-ep-child");
		c.dataset.ep = "child", L.appendChild(c);
	}
	function Yn(e, t) {
		let n = d(e, g), r = e.node.width, i = e.node.height, a = (t.x - n.x) / (r / 2), o = (t.y - n.y) / (i / 2), s = Math.max(Math.abs(a), Math.abs(o));
		return s > 1e-6 && (a /= s, o /= s), {
			nx: Math.max(-1, Math.min(1, a)),
			ny: Math.max(-1, Math.min(1, o))
		};
	}
	let Xn = .34;
	function Zn(e) {
		let t = e.nx, n = e.ny;
		return Math.abs(Math.abs(n) - 1) < 1e-6 && Math.abs(t) < Xn ? t = 0 : Math.abs(Math.abs(t) - 1) < 1e-6 && Math.abs(n) < Xn && (n = 0), {
			nx: t,
			ny: n
		};
	}
	function Qn(e, t) {
		let n = new Set([t].concat(Tr(t)));
		for (let t = C.length - 1; t >= 0; t--) {
			let r = C[t];
			if (n.has(r.node.id)) continue;
			let i = d(r, g);
			if (e.x >= i.x - r.node.width / 2 && e.x <= i.x + r.node.width / 2 && e.y >= i.y - r.node.height / 2 && e.y <= i.y + r.node.height / 2) return r.node.id;
		}
		return null;
	}
	let $n = null;
	function er(e) {
		$n && T[$n] && T[$n].classList.remove("loc-reparent-target"), $n = e, e && T[e] && T[e].classList.add("loc-reparent-target");
	}
	function tr(e) {
		if (!O || O.kind !== "ep") return;
		let t = O.id, n = w[t];
		if (!n) return;
		let r = w[n.node.parentId];
		if (!r) return;
		let i = Ln(In(e.clientX, e.clientY));
		if (v[t] = v[t] || {}, O.changed = !0, O.which === "child") v[t].c = Zn(Yn(n, i));
		else {
			v[t].p = Zn(Yn(r, i));
			let e = Qn(i, t);
			er(e && e !== n.node.parentId ? e : null);
		}
		Gt(t), Jn();
	}
	function nr() {
		let e = O;
		if (O = null, Q("pointermove", tr), Q("pointerup", nr), e && e.which === "parent" && $n) {
			let t = $n;
			er(null), rr(e.id, t);
			return;
		}
		er(null), X(), e && e.changed && Y();
	}
	function rr(e, t) {
		let n = h[e];
		if (!n || t === e || t && Tr(e).indexOf(t) >= 0) return;
		let r = t || "", i = n.parentId == null ? "" : String(n.parentId);
		(n.parentId || "") !== r && (p.selectedEdgeId = null, p.selectedFamilyId = null, L.innerHTML = "", $e.innerHTML = "", Et(() => {
			n.parentId = r, b[e] = Object.assign(b[e] || {}, { parentId: r }), delete _[e], delete v[e], i && delete y[i], r && delete y[r], w[e] && Object.assign(w[e].node, { parentId: r });
		}), Pn(), R.classList.contains("loc-open") && p.selectedNodeId === e && _r(), j("node-change", {
			id: e,
			node: { ...n },
			patch: { parentId: r },
			reparented: !0
		}), Y());
	}
	function ir(e) {
		rr(e, "");
	}
	function ar(e, t) {
		t && rr(e, t);
	}
	let or = null;
	function sr(e) {
		e && (or = e, N.classList.add("loc-attaching"), j("attach-start", { id: e }));
	}
	function cr() {
		or && (or = null, N.classList.remove("loc-attaching"), j("attach-cancel", {}));
	}
	function lr(e) {
		let t = or;
		return !t || !e || e === t || Tr(t).indexOf(e) >= 0 ? (cr(), !1) : (or = null, N.classList.remove("loc-attaching"), ar(t, e), f.inspector && hr(t), !0);
	}
	function ur(e, t, n) {
		let r = n.x - t.x, i = n.y - t.y, a = r * r + i * i, o = a ? ((e.x - t.x) * r + (e.y - t.y) * i) / a : 0;
		return o = Math.max(0, Math.min(1, o)), Math.hypot(e.x - (t.x + o * r), e.y - (t.y + o * i));
	}
	function dr(e, t) {
		let n = Bn(e), r = 0, i = Infinity;
		for (let e of n) {
			let n = ur(t, e.a, e.b);
			n < i && (i = n, r = e.insert);
		}
		return r;
	}
	let fr = [
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
	function pr() {
		N.classList.toggle("loc-edit", p.editMode);
	}
	function mr(e) {
		p.editMode = !!e, pr(), $(), p.editMode || (U(), Un()), R.classList.contains("loc-open") && _r(), j("edit-mode-change", { editMode: p.editMode }), X();
	}
	function hr(e) {
		f.inspector && (p.selectedNodeId = e, R.classList.add("loc-open"), _r(), j("inspector-open", {
			id: e,
			node: h[e]
		}));
	}
	function gr() {
		R.classList.contains("loc-open") && (R.classList.remove("loc-open"), j("inspector-close", {}));
	}
	function _r() {
		let e = p.selectedNodeId, t = e && h[e];
		if (!t) {
			gr();
			return;
		}
		if (ot.textContent = t.label || t.personName || t.id, f.inspectorSlot) {
			at.innerHTML = "";
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
		])) + o("Photo URL", i("photo_url", t.data && t.data.photo_url || ""))), f.advancedLayoutControls && (s += o("Layout override", a("layoutMode", t.layoutMode || "", fr.map((e) => [e, e || "(inherit)"])))), s += o("Width", i("width", t.width, "number")) + o("Height", i("height", t.height, "number")), it.innerHTML = s, at.innerHTML = n ? "<button data-role=\"add-child\">+ Add child</button>" + (t.parentId ? "<button data-role=\"detach\">Detach</button>" : "<button data-role=\"attach\">Attach…</button>") + "<button data-role=\"del-node\" class=\"loc-danger\">Delete</button>" : "<span class=\"loc-foot-hint\">Turn on Edit to modify fields</span>";
	}
	let vr = 0, yr = 0;
	function br(e) {
		if (!f.userSearch) return;
		let t = it.querySelector("[data-role=\"user-results\"]");
		if (!t) return;
		vr && clearTimeout(vr);
		let n = (e || "").trim();
		if (!n) {
			t.hidden = !0, t.innerHTML = "";
			return;
		}
		let r = ++yr;
		vr = setTimeout(() => {
			try {
				Promise.resolve(f.userSearch(n, h[p.selectedNodeId])).then((e) => {
					r === yr && xr(t, Array.isArray(e) ? e : []);
				}).catch(() => {});
			} catch {}
		}, 220);
	}
	function xr(e, t) {
		if (!t.length) {
			e.hidden = !0, e.innerHTML = "";
			return;
		}
		e.innerHTML = t.slice(0, 8).map((e, t) => {
			let n = W(e.name || e.personName || e.label || ""), r = W(e.title || e.label || e.email || "");
			return `<button type="button" class="loc-usersearch-item" data-uidx="${t}"><b>${n}</b>${r ? `<small>${r}</small>` : ""}</button>`;
		}).join(""), e.hidden = !1, e._users = t;
	}
	function Sr(e) {
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
		wr(t, r);
		let i = it.querySelector("[data-role=\"user-results\"]");
		i && (i.hidden = !0, i.innerHTML = ""), _r(), j("user-select", {
			id: t,
			user: e,
			node: { ...h[t] }
		});
	}
	function Cr() {
		let e;
		do
			e = "node-" + ++we;
		while (h[e]);
		return e;
	}
	function wr(e, t) {
		let n = h[e];
		if (!n) return;
		Object.assign(n, t), w[e] && w[e].node !== n && Object.assign(w[e].node, t), b[e] = Object.assign(b[e] || {}, t);
		let r = [
			"type",
			"width",
			"height",
			"layoutMode"
		].some((e) => e in t);
		T[e] && (T[e].remove(), delete T[e]), Dt(), r && V("node-structure", { preserveManual: !0 }), j("node-change", {
			id: e,
			node: { ...n },
			patch: t
		}), X(), Y("field:" + e + ":" + Object.keys(t).join(","));
	}
	function Tr(e) {
		let t = [], n = [e];
		for (; n.length;) {
			let e = n.pop();
			for (let r of m) r.parentId === e && (t.push(r.id), n.push(r.id));
		}
		return t;
	}
	function Er(e) {
		if (!p.editMode) return null;
		let t = Cr(), n = i({
			id: t,
			parentId: e || "",
			type: "position",
			label: "NEW POSITION",
			personName: "",
			status: ""
		});
		return m.push(n), h[t] = n, e && delete y[String(e)], b[t] = Object.assign({ __new: !0 }, n), V("add-child", { preserveManual: !0 }), bn(t), hr(t), j("node-change", {
			id: t,
			node: { ...n },
			added: !0
		}), X(), Y(), t;
	}
	function Dr(e) {
		if (!p.editMode || !e) return;
		let t = h[e]?.parentId, n = [e].concat(Tr(e)), r = new Set(n);
		m = m.filter((e) => !r.has(e.id)), h = u(m), n.forEach((e) => {
			b[e] = { __deleted: !0 }, T[e] && (T[e].remove(), delete T[e]), x.delete(e);
		}), t && delete y[String(t)], n.forEach((e) => {
			delete y[String(e)];
		}), r.has(p.selectedNodeId) && (p.selectedNodeId = x.size ? [...x][x.size - 1] : null, p.selectedNodeId || gr()), V("delete-node", { preserveManual: !0 }), j("node-change", {
			id: e,
			removed: !0,
			ids: n
		}), X(), Y();
	}
	function Or() {
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
	let kr = [
		["type", "Type"],
		["status", "Status"],
		["level", "Level (data.level)"],
		["unit", "Unit (data.unit)"],
		["id", "Node id"],
		["label", "Label"]
	];
	function Ar(e, t) {
		let n = oe(t, S);
		jr(e, "--loc-node-bg", n && n.bg), jr(e, "--loc-node-text", n && n.text), jr(e, "--loc-node-border", n && n.border);
	}
	function jr(e, t, n) {
		n ? e.style.setProperty(t, n) : e.style.removeProperty(t);
	}
	function Mr() {
		for (let e in T) h[e] && Ar(T[e], h[e]);
		p.showLegend && Lr();
	}
	let Nr = {
		FILLED: "Filled",
		VACANT: "Vacant",
		UNFUNDED: "Unfunded"
	};
	function Pr() {
		lt.classList.toggle("loc-on", p.showLegend), p.showLegend && Lr();
	}
	function Fr(e) {
		return p.showLegend = e == null ? !p.showLegend : !!e, Pr(), $(), X(), j("legend-change", { legend: p.showLegend }), p.showLegend;
	}
	function Ir(e) {
		return Fr(e ?? !p.showLegend);
	}
	function Lr() {
		if (f.legendSlot) return;
		let e = Object.create(null), t = Object.create(null);
		for (let n of m) n.type && (e[n.type] = !0), n.status && (t[n.status] = !0);
		let n = "", r = [];
		e.department && r.push(zr("loc-leg-dept", "Department")), e.position && r.push(zr("loc-leg-pos", "Position")), r.length && (n += Rr("Type", r.join("")));
		let i = [
			"FILLED",
			"VACANT",
			"UNFUNDED"
		].filter((e) => t[e]).map((e) => `<div class="loc-leg-row"><span class="loc-leg-badge loc-${e}">${Nr[e] || e}</span></div>`);
		i.length && (n += Rr("Status", i.join("")));
		let a = S.filter((e) => e.enabled && (e.style.bg || e.style.border)).map((e) => `<div class="loc-leg-row"><span class="loc-leg-swatch" style="background:${W(e.style.bg || "#fff")};border-color:${W(e.style.border || e.style.bg || "#d0d5dd")}"></span><span class="loc-leg-label">${W(e.field)} = ${W(e.value || "—")}</span></div>`).join("");
		a && (n += Rr("Rules", a)), dt.innerHTML = n || "<div class=\"loc-leg-empty\">No legend items yet.</div>";
	}
	function Rr(e, t) {
		return `<div class="loc-leg-section"><div class="loc-leg-title">${e}</div>${t}</div>`;
	}
	function zr(e, t) {
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
	function Br(e, t) {
		if (e ||= {}, typeof e.spacingX == "number" && (p.spacingX = e.spacingX), typeof e.spacingY == "number" && (p.spacingY = e.spacingY), typeof e.gridSize == "number" && (p.gridSize = e.gridSize), e.orientation && (p.orientation = ye(e.orientation)), e.subtreeMode && (p.subtreeMode = e.subtreeMode), "showGrid" in e && (p.showGrid = !!e.showGrid), "snapGrid" in e && (p.snapGrid = !!e.snapGrid), "alignGrid" in e && (p.alignGrid = !!e.alignGrid), "showImages" in e && !!e.showImages !== p.showImages) {
			p.showImages = !!e.showImages;
			for (let e in T) T[e].remove(), delete T[e];
		}
		"autoEdgeSide" in e && (p.autoEdgeSide = !!e.autoEdgeSide);
		let n = !1;
		if (typeof e.cardWidth == "number" && (p.cardWidth = Math.max(100, e.cardWidth), n = !0), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight), n = !0), "photoContain" in e && (p.photoContain = !!e.photoContain, n = !0), n) {
			Ot(), kt();
			for (let e in T) delete T[e].dataset.fitted;
		}
		Array.isArray(e.themeRules) && (S = e.themeRules.map(se)), Jt(), $(), V("settings"), z.classList.contains("loc-open") && qr(), t && t.silent || j("settings-change", G()), X();
	}
	function Vr(e) {
		let t = z.classList.contains("loc-open"), n = e == null ? !t : !!e;
		z.classList.toggle("loc-open", n), P && P.querySelectorAll("button[data-act=\"settings\"]").forEach((e) => e.classList.toggle("loc-active", n)), n && qr(), n !== t && j(n ? "settings-open" : "settings-close", {});
	}
	function Hr() {
		Br({
			spacingX: Ce.spacingX,
			spacingY: Ce.spacingY,
			gridSize: Ce.gridSize,
			showGrid: Ce.showGrid,
			snapGrid: Ce.snapGrid,
			alignGrid: Ce.alignGrid,
			themeRules: Ce.themeRules.map((e) => ({
				enabled: e.enabled,
				field: e.field,
				value: e.value,
				style: Object.assign({}, e.style)
			}))
		}), Mr();
	}
	function Ur(e, t, n, r, i) {
		return `<label class="loc-field"><span>${t}: <b data-rangelabel="${e}">${n}</b></span><input type="range" data-set="${e}" min="${r}" max="${i}" value="${n}"/></label>`;
	}
	function Wr(e, t, n, r) {
		return `<label class="loc-color"><input type="checkbox" data-rule="${e}" data-rk="${t}-on"${r ? " checked" : ""}/><span>${n}</span><input type="color" data-rule="${e}" data-rk="${t}" value="${r || "#e0524d"}"/></label>`;
	}
	function Gr(e, t) {
		let n = (t, n) => `<option value="${t}"${e.field === t ? " selected" : ""}>${n}</option>`;
		return `<div class="loc-rule"><div class="loc-rule-top"><input type="checkbox" data-rule="${t}" data-rk="enabled"${e.enabled ? " checked" : ""} title="enable rule"/><select data-rule="${t}" data-rk="field">` + kr.map(([e, t]) => n(e, t)).join("") + `</select><input class="loc-rule-val" data-rule="${t}" data-rk="value" placeholder="value" value="${W(e.value)}"/><button class="loc-rule-del" data-rule="${t}" data-rk="remove" title="Remove rule">✕</button></div><div class="loc-rule-colors">` + Wr(t, "bg", "BG", e.style.bg) + Wr(t, "text", "Text", e.style.text) + Wr(t, "border", "Border", e.style.border) + "</div></div>";
	}
	function Kr() {
		let e = hi().map((e) => `<div class="loc-preset"><button class="loc-preset-apply" data-role="preset-apply" data-name="${W(e.name)}" title="Apply this saved layout">${W(e.name)}</button><span class="loc-preset-tag">${e.full ? "full" : "pattern"}</span><button class="loc-preset-del" data-role="preset-del" data-name="${W(e.name)}" title="Delete preset">✕</button></div>`).join("");
		return e ||= "<div class=\"loc-set-hint\">No saved presets yet.</div>", `<div class="loc-set-section"><div class="loc-set-title">Presets</div><div class="loc-set-hint">Save the current arrangement so an accidental mode change can’t lose it (Undo / Ctrl+Z restores it too).</div><div class="loc-preset-save"><input type="text" data-role="preset-name" placeholder="Preset name…"/><label class="loc-preset-full"><input type="checkbox" data-role="preset-full" checked/> positions</label><button data-role="preset-save">Save</button></div><div class="loc-preset-list">${e}</div></div>`;
	}
	function qr() {
		if (f.settingsSlot) return;
		let e = Kr() + "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Layout</div>" + Ur("spacingX", "Spacing X", p.spacingX, 0, 200) + Ur("spacingY", "Spacing Y", p.spacingY, 0, 260) + Ur("gridSize", "Grid size", p.gridSize, 6, 80) + `<label class="loc-color"><input type="checkbox" data-set-toggle="showImages"${p.showImages ? " checked" : ""}/><span>Show photos (off → user icon)</span></label><label class="loc-color"><input type="checkbox" data-set-toggle="autoEdgeSide"${p.autoEdgeSide ? " checked" : ""}/><span>Smart edges (lines follow waypoints to any side)</span></label></div>`;
		e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Card size</div><div class=\"loc-set-hint\">Applies to every person card. The photo tops the card at its full size; the name/title sit below.</div>" + Ur("cardWidth", "Card width", p.cardWidth, 120, 320) + Ur("photoHeight", "Photo height", p.photoHeight, 60, 240) + `<label class="loc-color"><input type="checkbox" data-set-toggle="photoContain"${p.photoContain ? " checked" : ""}/><span>Show whole photo (no crop)</span></label></div>`, e += "<div class=\"loc-set-section\"><div class=\"loc-set-title\">Theme rules</div><div class=\"loc-set-hint\">Recolor nodes that match a field = value. Later rules win.</div>", S.forEach((t, n) => {
			e += Gr(t, n);
		}), e += "<button class=\"loc-set-add\" data-role=\"add-rule\">+ Add rule</button></div>", e += "<div class=\"loc-set-foot\"><button class=\"loc-set-reset\" data-role=\"reset-settings\" title=\"Restore spacing, grid &amp; theme rules to defaults\">↺ Reset settings</button></div>", ct.innerHTML = e;
	}
	function Jr(e, t) {
		let n = ct.querySelector(`[data-rule="${e}"][data-rk="${t}-on"]`);
		return n && n.checked;
	}
	function Yr(e, t) {
		let n = ct.querySelector(`[data-rule="${e}"][data-rk="${t}"]`);
		return n ? n.value : "";
	}
	let K = [], q = -1, Xr = !1, Zr = null;
	function J(e) {
		return e == null ? e : JSON.parse(JSON.stringify(e));
	}
	function Qr() {
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
	function $r(e) {
		e && (e.subtreeMode && (p.subtreeMode = e.subtreeMode), e.orientation && (p.orientation = ye(e.orientation)), [
			"spacingX",
			"spacingY",
			"gridSize"
		].forEach((t) => {
			typeof e[t] == "number" && (p[t] = e[t]);
		}), "showGrid" in e && (p.showGrid = !!e.showGrid), "snapGrid" in e && (p.snapGrid = !!e.snapGrid), "alignGrid" in e && (p.alignGrid = !!e.alignGrid), "showImages" in e && (p.showImages = !!e.showImages), "autoEdgeSide" in e && (p.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (p.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (p.photoContain = !!e.photoContain), Ot(), kt(), Array.isArray(e.themeRules) && (S = e.themeRules.map(se)));
	}
	function ei() {
		return {
			nodes: m.map((e) => J(e)),
			manualOffsets: J(g),
			edgeWaypoints: J(_),
			edgeAnchors: J(v),
			familyRouteOverrides: J(y),
			nodeOverrides: J(b),
			view: Qr(),
			selectedNodeId: p.selectedNodeId
		};
	}
	function ti(e) {
		Xr = !0, m = (e.nodes || []).map(i), h = u(m), g = J(e.manualOffsets) || Object.create(null), _ = J(e.edgeWaypoints) || Object.create(null), v = J(e.edgeAnchors) || Object.create(null), y = J(e.familyRouteOverrides) || Object.create(null), b = J(e.nodeOverrides) || Object.create(null), $r(e.view);
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		p.selectedEdgeId = null, L.innerHTML = "", p.selectedNodeId = e.selectedNodeId && h[e.selectedNodeId] ? e.selectedNodeId : null, Jt(), V("history"), p.selectedNodeId && bn(p.selectedNodeId), R.classList.contains("loc-open") && (p.selectedNodeId ? _r() : gr()), z.classList.contains("loc-open") && qr(), Xr = !1;
	}
	function Y(e) {
		if (Xr) return;
		let t = ei();
		e != null && e === Zr && q >= 0 ? K[q] = t : (K = K.slice(0, q + 1), K.push(t), q = K.length - 1, K.length > 100 && (K.shift(), q--)), Zr = e ?? null, si();
	}
	function ni() {
		K = [ei()], q = 0, Zr = null, si();
	}
	function ri() {
		return q > 0;
	}
	function ii() {
		return q >= 0 && q < K.length - 1;
	}
	function ai() {
		ri() && (q--, Zr = null, ti(K[q]), si());
	}
	function oi() {
		ii() && (q++, Zr = null, ti(K[q]), si());
	}
	function si() {
		$(), j("history-change", {
			canUndo: ri(),
			canRedo: ii()
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
	function ci() {
		if (!f.persist) return;
		let e;
		try {
			e = JSON.parse(localStorage.getItem(f.storageKey) || "null");
		} catch {
			e = null;
		}
		if (e && (e.orientation && (p.orientation = ye(e.orientation)), e.subtreeMode && (p.subtreeMode = e.subtreeMode), [
			"spacingX",
			"spacingY",
			"zoom",
			"panX",
			"panY",
			"gridSize"
		].forEach((t) => {
			typeof e[t] == "number" && (p[t] = e[t]);
		}), p.showGrid = !!e.showGrid, p.snapGrid = !!e.snapGrid, p.alignGrid = !!e.alignGrid, p.editMode = !!e.editMode, "showImages" in e && (p.showImages = !!e.showImages), "showLegend" in e && (p.showLegend = !!e.showLegend), "autoEdgeSide" in e && (p.autoEdgeSide = !!e.autoEdgeSide), typeof e.cardWidth == "number" && (p.cardWidth = Math.max(100, e.cardWidth)), typeof e.photoHeight == "number" && (p.photoHeight = Math.max(40, e.photoHeight)), "photoContain" in e && (p.photoContain = !!e.photoContain), Ot(), kt(), e.manualOffsets && (g = e.manualOffsets), e.edgeWaypoints && (_ = e.edgeWaypoints), e.edgeAnchors && (v = e.edgeAnchors), e.familyRouteOverrides && (y = e.familyRouteOverrides), e.nodeOverrides && (b = e.nodeOverrides, Or()), Array.isArray(e.themeRules) && (S = e.themeRules.map(se)), Array.isArray(e.collapsed))) {
			let t = new Set(e.collapsed);
			for (let e of m) e.collapsed = t.has(e.id);
		}
	}
	function li() {
		return f.storageKey + ".presets";
	}
	function ui() {
		try {
			return JSON.parse(localStorage.getItem(li()) || "{}") || {};
		} catch {
			return {};
		}
	}
	function di(e) {
		try {
			localStorage.setItem(li(), JSON.stringify(e));
		} catch {}
	}
	function fi(e) {
		let t = {
			full: e !== !1,
			view: Qr()
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
	function pi(e) {
		return fi(!(e && e.full === !1));
	}
	function mi(e) {
		if (!e) return Promise.resolve(!1);
		if ($r(e.view), e.full && e.layout) {
			g = J(e.layout.manualOffsets) || Object.create(null), _ = J(e.layout.edgeWaypoints) || Object.create(null), v = J(e.layout.edgeAnchors) || Object.create(null), y = J(e.layout.familyRouteOverrides) || Object.create(null), b = J(e.layout.nodeOverrides) || Object.create(null), Or();
			let t = new Set(e.layout.collapsed || []);
			for (let e of m) e.collapsed = t.has(e.id);
		} else g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null);
		p.selectedNodeId = null, p.selectedEdgeId = null, p.selectedFamilyId = null, L.innerHTML = "", $e.innerHTML = "";
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		Jt(), $();
		let t = V("preset");
		return z.classList.contains("loc-open") && qr(), t.then((e) => {
			e && Qt();
		}), Y(), j("settings-change", G()), t;
	}
	function hi() {
		let e = ui();
		return Object.keys(e).map((t) => ({
			name: t,
			full: !!e[t].full,
			savedAt: e[t].savedAt || null
		}));
	}
	function gi() {
		return ui();
	}
	function _i(e, t) {
		if (e = String(e ?? "").trim(), !e) return null;
		let n = fi(!(t && t.full === !1));
		n.name = e, n.savedAt = Date.now();
		let r = ui();
		return r[e] = n, di(r), z.classList.contains("loc-open") && qr(), j("presets-change", { presets: hi() }), n;
	}
	function vi(e) {
		let t = ui()[String(e)];
		return t ? (mi(t), j("preset-load", {
			name: String(e),
			preset: t
		}), !0) : !1;
	}
	function yi(e) {
		let t = ui();
		return String(e) in t && (delete t[String(e)], di(t), z.classList.contains("loc-open") && qr(), j("presets-change", { presets: hi() }), !0);
	}
	function bi(e) {
		let t = ce(p, m, g, _);
		return t.editMode = p.editMode, t.edgeAnchors = v, t.familyRouteOverrides = y, t.nodeOverrides = b, t.settings = G(), e !== !1 && Mi(new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), "org-chart-layout.json"), t;
	}
	let xi = document.createElement("canvas").getContext("2d");
	function Si(e, t) {
		return xi.font = t, xi.measureText(e).width;
	}
	function Ci(e) {
		let t = T[e.id];
		if (!t) return 1;
		let n = parseFloat(t.style.getPropertyValue("--loc-fit"));
		return isFinite(n) && n > 0 ? n : 1;
	}
	function wi(e) {
		return e ??= 0, De && Object.keys(g).length === 0 ? {
			x: De.x - e,
			y: De.y - e,
			w: De.w + e * 2,
			h: De.h + e * 2
		} : re(C, g, e);
	}
	function Ti(e, t) {
		let n = [];
		for (let e in E) n.push({
			id: e,
			d: E[e].getAttribute("d")
		});
		return ae(C, n, {
			manualOffsets: g,
			raster: !!e,
			measureText: Si,
			fitOf: Ci,
			photoHeight: p.photoHeight,
			photoContain: p.photoContain,
			images: t || null,
			familyNetworks: Te,
			rebuildFamilyIds: Bt(),
			bounds: wi(40)
		});
	}
	function Ei(e) {
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
	function Di() {
		if (!p.showImages) return Promise.resolve({});
		let e = [], t = /* @__PURE__ */ new Set();
		for (let n of m) {
			let r = n.type !== "department" && n.data && n.data.photo_url;
			r && !t.has(r) && (t.add(r), e.push(r));
		}
		return e.length ? Promise.all(e.map((e) => Ei(e).then((t) => [e, t]))).then((e) => {
			let t = {};
			for (let [n, r] of e) r && (t[n] = r);
			return t;
		}) : Promise.resolve({});
	}
	function Oi() {
		return Di().then((e) => {
			let t = Ti(!1, e);
			return Mi(new Blob([t], { type: "image/svg+xml;charset=utf-8" }), "org-chart.svg"), t;
		});
	}
	function ki(e) {
		return e ||= 3, Di().then((t) => new Promise((n) => {
			let r = wi(40), i = 16e3, a = 2e8, o = Math.min(e, i / r.w, i / r.h);
			r.w * o * r.h * o > a && (o = Math.sqrt(a / (r.w * r.h))), o = Math.max(.05, o);
			let s = URL.createObjectURL(new Blob([Ti(!0, t)], { type: "image/svg+xml;charset=utf-8" })), c = new Image();
			c.onload = () => {
				let e = document.createElement("canvas");
				e.width = Math.round(r.w * o), e.height = Math.round(r.h * o);
				let t = e.getContext("2d");
				t.setTransform(o, 0, 0, o, 0, 0), t.drawImage(c, 0, 0), URL.revokeObjectURL(s);
				try {
					e.toBlob((e) => {
						e && Mi(e, "org-chart.png"), n(!!e);
					}, "image/png");
				} catch {
					n(!1);
				}
			}, c.onerror = () => {
				URL.revokeObjectURL(s), n(!1);
			}, c.src = s;
		}));
	}
	function Ai(e) {
		e ||= {};
		let t = +e.scale > 0 ? +e.scale : 2, n = typeof e.quality == "number" ? Math.min(1, Math.max(.3, e.quality)) : .82, r = +e.maxSide > 0 ? +e.maxSide : 4e3, i = e.as === "dataURL" || e.as === "dataurl", a = e.filename || "org-chart.webp";
		return Di().then((o) => new Promise((s) => {
			let c = wi(40), l = 2e8, u = Math.min(t, r / c.w, r / c.h);
			c.w * u * c.h * u > l && (u = Math.sqrt(l / (c.w * c.h))), u = Math.max(.05, u);
			let ee = URL.createObjectURL(new Blob([Ti(!0, o)], { type: "image/svg+xml;charset=utf-8" })), d = new Image();
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
						t && e.download && Mi(t, a), s(t || null);
					}, "image/webp", n);
				} catch {
					s(null);
				}
			}, d.onerror = () => {
				URL.revokeObjectURL(ee), s(null);
			}, d.src = ee;
		}));
	}
	function ji() {
		return Di().then((e) => {
			let t = window.open("", "_blank");
			return t ? (t.document.open(), t.document.write("<!doctype html><html><head><title>Org Chart</title><style>@page{margin:8mm;}html,body{margin:0;padding:0;}svg{width:100%;height:auto;display:block;}</style></head><body>" + Ti(!1, e) + "<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script></body></html>"), t.document.close(), !0) : !1;
		});
	}
	function Mi(e, t) {
		let n = URL.createObjectURL(e), r = document.createElement("a");
		r.href = n, r.download = t, document.body.appendChild(r), r.click(), r.remove(), URL.revokeObjectURL(n);
	}
	function Ni(e, t, n) {
		let r = !(n && n.resetEdits);
		m = (e || []).map(i), h = u(m), r || (g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), b = Object.create(null)), p.selectedNodeId = null, p.selectedEdgeId = null, p.selectedFamilyId = null, je = /* @__PURE__ */ new Set(), gr();
		for (let e in T) T[e].remove(), delete T[e];
		for (let e in E) E[e].remove(), delete E[e];
		for (let e in D) D[e].remove(), delete D[e];
		t && (t.subtreeMode && (p.subtreeMode = t.subtreeMode), t.orientation && (p.orientation = ye(t.orientation)), t.manualOffsets && (g = t.manualOffsets), t.edgeWaypoints && (_ = t.edgeWaypoints), t.edgeAnchors && (v = t.edgeAnchors), t.familyRouteOverrides && (y = t.familyRouteOverrides), t.nodeOverrides && (b = t.nodeOverrides), typeof t.editMode == "boolean" && (p.editMode = t.editMode), t.settings && Array.isArray(t.settings.themeRules) && (S = t.settings.themeRules.map(se))), r && Or(), pr(), $();
		let a = V("set-nodes");
		return f.fitOnInit && a.then((e) => {
			e && Yt();
		}), a;
	}
	function Pi(t) {
		let { nodes: n, meta: r } = e(t);
		return Ni(n, r), n.length;
	}
	function Fi(e) {
		let t = ye(e);
		p.orientation = t, g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), U(), Un(), $();
		let n = V("orientation");
		return n.then((e) => {
			e && Qt();
		}), j("orientation-change", { orientation: t }), Y(), n;
	}
	function Ii(e) {
		p.subtreeMode = e, g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), U(), Un(), $();
		let t = V("subtree-mode");
		return t.then((e) => {
			e && Qt();
		}), j("subtree-mode-change", { subtreeMode: e }), Y(), t;
	}
	function Li(e, t) {
		e != null && (p.spacingX = e), t != null && (p.spacingY = t);
		let n = V("spacing");
		return j("settings-change", G()), Y("spacing"), n;
	}
	function Ri(e, t) {
		e in p ? (p[e] = t, e === "showGrid" && Jt(), e === "alignGrid" && (g = Object.create(null), V("align-grid")), $(), X(), [
			"showGrid",
			"snapGrid",
			"alignGrid",
			"gridSize"
		].includes(e) && j("settings-change", G())) : (f[e] = t, (e === "targetAspect" || e === "targetSize") && (p.subtreeMode === "AutoSmart" || p.subtreeMode === "GridSmart" || p.subtreeMode === "Auto") && V("target-size").then((e) => {
			e && Qt();
		}));
	}
	function zi(e) {
		return Ri("showGrid", !!e), p.showGrid;
	}
	function Bi(e) {
		return Ri("snapGrid", !!e), p.snapGrid;
	}
	function Vi(e) {
		return Ri("alignGrid", !!e), p.alignGrid;
	}
	function Hi(e) {
		return zi(e ?? !p.showGrid);
	}
	function Ui(e) {
		return p.autoEdgeSide = e == null ? !p.autoEdgeSide : !!e, U(), V("auto-edge-side"), z.classList.contains("loc-open") && qr(), X(), j("settings-change", G()), p.autoEdgeSide;
	}
	function Wi(e) {
		p.showImages = e == null ? !p.showImages : !!e;
		for (let e in T) T[e].remove(), delete T[e];
		return Dt(), $(), X(), j("settings-change", G()), p.showImages;
	}
	function Gi() {
		let e = Tt("relayout", { preserveManual: !0 });
		return U(), Un(), e.then((e) => {
			e && Qt();
		}), j("relayout", { forced: !1 }), Y(), e;
	}
	function Ki() {
		g = Object.create(null), _ = Object.create(null), v = Object.create(null), y = Object.create(null), U(), Un();
		let e = V("force-relayout");
		return e.then((e) => {
			e && Qt();
		}), j("relayout", { forced: !0 }), Y(), e;
	}
	function qi() {
		rn(), gr();
		let e = Ki();
		return e.then((e) => {
			e && Yt();
		}), e;
	}
	function Ji() {
		return document.fullscreenElement || document.webkitFullscreenElement || null;
	}
	function Yi() {
		return Ji() === N;
	}
	function Xi() {
		let e = N.requestFullscreen || N.webkitRequestFullscreen;
		if (e) try {
			let t = e.call(N);
			t && t.catch && t.catch(() => {});
		} catch {}
	}
	function Zi() {
		let e = document.exitFullscreen || document.webkitExitFullscreen;
		if (e && Ji()) try {
			e.call(document);
		} catch {}
	}
	function Qi(e) {
		let t = e == null ? !Yi() : !!e;
		return t ? Xi() : Zi(), t;
	}
	function $i() {
		let e = Yi();
		N.classList.toggle("loc-fullscreen", e), nt && (nt.title = e ? "Exit fullscreen" : "Fullscreen"), $(), Yt(), j("fullscreen-change", { fullscreen: e });
	}
	function ea(e) {
		if (!ke) return;
		let t = In(e.clientX, e.clientY), n = o(pt()) ? t.y : t.x, r = Math.max(1, p.gridSize), i = Math.round((ke.baseOffset + n - ke.startCross) / r) * r;
		y[ke.parentId]?.trunkOffset !== i && (y[ke.parentId] = { trunkOffset: i }, ke.changed = !0, j("family-route-change", {
			parentId: ke.parentId,
			trunkOffset: i,
			pending: !0
		}));
	}
	function ta() {
		let e = ke;
		ke = null, Q("pointermove", ea), Q("pointerup", ta), e?.changed && (V("family-route"), X(), Y(), j("family-route-change", {
			parentId: e.parentId,
			trunkOffset: y[e.parentId]?.trunkOffset,
			pending: !1
		}));
	}
	M(Qe, "pointerdown", (e) => {
		let t = e.target.closest(".loc-node");
		t && ln(e, t.dataset.id);
	}), M(Qe, "click", (e) => {
		let t = e.target.closest("[data-role=\"toggle\"]");
		if (t && !f.readonly) {
			tn(t.closest(".loc-node").dataset.id);
			return;
		}
		let n = e.target.closest(".loc-node");
		if (n) {
			if (Me === String(n.dataset.id)) {
				on(), e.preventDefault(), e.stopPropagation();
				return;
			}
			j("node-click", {
				id: n.dataset.id,
				node: h[n.dataset.id]
			});
		}
	}), M(Xe, "pointerdown", (e) => {
		let t = e.target.closest("path");
		t && (e.stopPropagation(), Vn(t.dataset.edge));
	}), M(Ze, "pointerdown", (e) => {
		let t = e.target.closest("path");
		if (!t) return;
		e.stopPropagation(), e.preventDefault(), aa();
		let n = String(t.dataset.family);
		if (Hn(n), f.readonly || !p.editMode) return;
		let r = Ee.find((e) => String(e.parentId) === n) || Te.find((e) => String(e.parentId) === n), i = w[n];
		if (!r?.trunk || !i) return;
		let a = In(e.clientX, e.clientY), s = o(pt());
		ke = {
			parentId: n,
			startCross: s ? a.y : a.x,
			baseOffset: (s ? r.trunk.a.y : r.trunk.a.x) - (s ? i.cy : i.cx),
			changed: !1
		}, Z("pointermove", ea), Z("pointerup", ta);
	}), M(Xe, "dblclick", (e) => {
		if (f.readonly || !p.editMode) return;
		let t = e.target.closest("path");
		if (!t) return;
		let n = t.dataset.edge;
		Vn(n);
		let r = Rn(n);
		if (!r) return;
		let i = Ln(In(e.clientX, e.clientY));
		zn(n).splice(dr(r, i), 0, i), Gt(n), Jn(), X(), Y();
	}), M(L, "pointerdown", (e) => {
		if (f.readonly || !p.editMode) return;
		let t = e.target, n = p.selectedEdgeId;
		if (!n) return;
		if (t.dataset.ep) {
			e.stopPropagation(), e.preventDefault(), O = {
				id: n,
				kind: "ep",
				which: t.dataset.ep
			}, Z("pointermove", tr), Z("pointerup", nr);
			return;
		}
		let r;
		if (t.dataset.wp != null) r = +t.dataset.wp;
		else if (t.dataset.add != null) {
			let i = +t.dataset.add;
			zn(n).splice(i, 0, Ln(In(e.clientX, e.clientY))), r = i, Gt(n);
		} else return;
		e.stopPropagation(), e.preventDefault(), O = {
			id: n,
			idx: r
		}, Z("pointermove", na), Z("pointerup", ra);
	}), M(L, "dblclick", (e) => {
		let t = e.target;
		if (t.dataset.ep === "parent") {
			ir(p.selectedEdgeId);
			return;
		}
		if (t.dataset.wp == null) return;
		let n = p.selectedEdgeId, r = _[n];
		r && (r.splice(+t.dataset.wp, 1), r.length || delete _[n], Gt(n), Jn(), X(), Y());
	});
	function na(e) {
		if (!O) return;
		let t = _[O.id];
		t && (t[O.idx] = pn(O.id, Ln(In(e.clientX, e.clientY))), Gt(O.id), Jn());
	}
	function ra() {
		O = null, hn(), Q("pointermove", na), Q("pointerup", ra), X(), Y();
	}
	M(lt, "click", (e) => {
		e.target.closest("[data-role=\"legend-close\"]") && Fr(!1);
	}), M(R, "click", (e) => {
		if (e.target.closest("[data-role=\"panel-close\"]")) {
			gr();
			return;
		}
		if (e.target.closest("[data-role=\"add-child\"]")) {
			Er(p.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"detach\"]")) {
			ir(p.selectedNodeId);
			return;
		}
		if (e.target.closest("[data-role=\"attach\"]")) {
			let e = p.selectedNodeId;
			gr(), sr(e);
			return;
		}
		if (e.target.closest("[data-role=\"del-node\"]")) {
			Dr(p.selectedNodeId);
			return;
		}
		let t = e.target.closest("[data-uidx]");
		if (t) {
			let e = t.closest("[data-role=\"user-results\"]"), n = e && e._users && e._users[+t.dataset.uidx];
			n && Sr(n);
			return;
		}
	}), M(it, "input", (e) => {
		if (!p.editMode) return;
		let t = e.target.closest("[data-field]");
		if (!t) return;
		let n = p.selectedNodeId;
		if (!n) return;
		let r = t.dataset.field, i = t.value;
		if (r === "type") {
			wr(n, { type: i }), _r();
			return;
		}
		if (r !== "width" && r !== "height") {
			if (r === "photo_url") {
				let e = h[n];
				wr(n, { data: Object.assign({}, e.data, { photo_url: i || null }) });
				return;
			}
			if (r === "layoutMode") {
				wr(n, { layoutMode: i || null });
				return;
			}
			wr(n, { [r]: i }), r === "personName" && br(i);
		}
	});
	function ia(e) {
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
		e.value = a, Number(n[r]) !== a && wr(t, { [r]: a });
	}
	M(it, "change", (e) => ia(e.target.closest("[data-field]"))), M(it, "keydown", (e) => {
		let t = e.target.closest("[data-field=\"width\"], [data-field=\"height\"]");
		if (t && (e.key === "Enter" && (e.preventDefault(), ia(t), t.blur()), e.key === "Escape")) {
			let e = p.selectedNodeId && h[p.selectedNodeId];
			e && (t.value = e[t.dataset.field]), t.blur();
		}
	}), M(z, "click", (e) => {
		if (e.target.closest("[data-role=\"settings-close\"]")) {
			Vr(!1);
			return;
		}
		if (e.target.closest("[data-role=\"reset-settings\"]")) {
			Hr();
			return;
		}
		if (e.target.closest("[data-role=\"preset-save\"]")) {
			let e = (ct.querySelector("[data-role=\"preset-name\"]") || {}).value || "", t = !!(ct.querySelector("[data-role=\"preset-full\"]") || {}).checked;
			e.trim() && _i(e, { full: t });
			return;
		}
		let t = e.target.closest("[data-role=\"preset-apply\"]");
		if (t) {
			vi(t.dataset.name);
			return;
		}
		let n = e.target.closest("[data-role=\"preset-del\"]");
		if (n) {
			yi(n.dataset.name);
			return;
		}
		if (e.target.closest("[data-role=\"add-rule\"]")) {
			S.push(se({
				field: "type",
				value: "",
				style: {}
			})), qr(), Mr(), X(), j("settings-change", G());
			return;
		}
		let r = e.target.closest("[data-rk=\"remove\"]");
		r && (S.splice(+r.dataset.rule, 1), qr(), Mr(), X(), j("settings-change", G()));
	}), M(ct, "input", (e) => {
		let t = e.target;
		if (t.dataset.set != null) {
			let e = t.dataset.set, n = parseFloat(t.value), r = ct.querySelector(`[data-rangelabel="${e}"]`);
			r && (r.textContent = n);
			return;
		}
		if (t.dataset.setToggle === "showImages") {
			Wi(t.checked);
			return;
		}
		if (t.dataset.setToggle === "autoEdgeSide") {
			Ui(t.checked);
			return;
		}
		if (t.dataset.setToggle === "photoContain") {
			At({ contain: t.checked });
			return;
		}
		if (t.dataset.rule != null) {
			let e = +t.dataset.rule, n = t.dataset.rk, r = S[e];
			if (!r) return;
			if (n === "enabled") r.enabled = t.checked;
			else if (n === "field") r.field = t.value;
			else if (n === "value") r.value = t.value;
			else if (n === "bg" || n === "text" || n === "border") Jr(e, n) && (r.style[n] = t.value);
			else if (/-on$/.test(n)) {
				let i = n.replace("-on", "");
				r.style[i] = t.checked ? Yr(e, i) || "#e0524d" : "";
			}
			Mr(), j("settings-change", G()), X();
		}
	}), M(ct, "change", (e) => {
		let t = e.target;
		if (t.dataset.set == null) return;
		let n = t.dataset.set, r = parseFloat(t.value);
		if (Number.isFinite(r)) {
			if (n === "cardWidth") {
				At({ width: r });
				return;
			}
			if (n === "photoHeight") {
				At({ photoHeight: r });
				return;
			}
			Number(p[n]) !== r && (p[n] = r, V("settings-" + n), j("settings-change", G()), X());
		}
	}), M(F, "pointerdown", (e) => {
		if (e.target.closest(".loc-node") || e.target.closest(".loc-edgehits path") || e.target.closest(".loc-edgehandles *") || e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-fsbtn") || e.target.closest(".loc-legend")) return;
		aa();
		let t = () => {
			Cn(), p.selectedEdgeId && U(), p.selectedFamilyId && Un(), Dn(), or && cr(), gr();
		};
		if (e.altKey) {
			Nn(e);
			return;
		}
		if (e.ctrlKey || e.metaKey) {
			wn(e);
			return;
		}
		if (!f.enablePan) {
			t();
			return;
		}
		let n = e.clientX, r = e.clientY, i = p.panX, a = p.panY, o = !1;
		F.classList.add("loc-panning");
		let s = (e) => {
			!o && Math.abs(e.clientX - n) + Math.abs(e.clientY - r) > 3 && (o = !0), p.panX = i + (e.clientX - n), p.panY = a + (e.clientY - r), Kt();
		}, c = () => {
			F.classList.remove("loc-panning"), Q("pointermove", s), Q("pointerup", c), o || t();
		};
		Z("pointermove", s), Z("pointerup", c);
	}), M(F, "wheel", (e) => {
		if (!f.enableZoom || e.target.closest && (e.target.closest(".loc-panel") || e.target.closest(".loc-settings") || e.target.closest(".loc-legend"))) return;
		e.preventDefault();
		let t = F.getBoundingClientRect(), n = e.clientX - t.left, r = e.clientY - t.top, i = e.deltaY < 0 ? 1.1 : 1 / 1.1, a = Math.min(Se, Math.max(.15, p.zoom * i));
		p.panX = n - (n - p.panX) * (a / p.zoom), p.panY = r - (r - p.panY) * (a / p.zoom), p.zoom = a, Kt();
	}, { passive: !1 });
	function Z(e, t) {
		window.addEventListener(e, t), Ve.push({
			target: window,
			type: e,
			fn: t
		});
	}
	function Q(e, t) {
		window.removeEventListener(e, t);
	}
	function aa() {
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
				e.preventDefault(), Wn();
				return;
			}
			if (p.selectedFamilyId && n === "escape") {
				e.preventDefault(), Un();
				return;
			}
			if (H.size && (n === "delete" || n === "backspace")) {
				e.preventDefault(), kn();
				return;
			}
			if (n === "escape" && H.size) {
				e.preventDefault(), Dn();
				return;
			}
			return;
		}
		n === "z" && !e.shiftKey ? (e.preventDefault(), ai()) : (n === "z" && e.shiftKey || n === "y") && (e.preventDefault(), oi());
	});
	function oa() {
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
				if (t.dataset.mode) Ii(t.dataset.mode);
				else if (t.dataset.orient) Fi(t.dataset.orient);
				else if (t.dataset.flag) p[t.dataset.flag] = !p[t.dataset.flag], t.dataset.flag === "showGrid" ? Jt() : t.dataset.flag === "alignGrid" && (g = Object.create(null), V("align-grid")), $(), X();
				else switch (t.dataset.act) {
					case "undo":
						ai();
						break;
					case "redo":
						oi();
						break;
					case "expand":
						$t();
						break;
					case "collapse":
						en();
						break;
					case "fit":
						Yt();
						break;
					case "relayout":
						Gi();
						break;
					case "reset":
						qi();
						break;
					case "fullscreen":
						Qi();
						break;
					case "edit":
						mr(!p.editMode);
						break;
					case "images":
						Wi();
						break;
					case "legend":
						Ir();
						break;
					case "settings":
						Vr();
						break;
					case "png":
						ki(3);
						break;
					case "svg":
						Oi();
						break;
					case "pdf":
						ji();
						break;
					case "json":
						bi(!0);
						break;
				}
			}
		}), n.addEventListener("input", (e) => {
			let t = e.target.closest("[data-role=\"search\"]");
			t && nn(t.value);
		}), n;
		function i(e, t) {
			return `<div class="loc-group">${e ? `<span class="loc-label">${e}</span>` : ""}${t}</div>`;
		}
		function a(e, t, n) {
			return `<button data-${e}="${t}">${n}</button>`;
		}
	}
	function $() {
		P && (P.querySelectorAll("button[data-mode]").forEach((e) => e.classList.toggle("loc-active", e.dataset.mode === p.subtreeMode)), P.querySelectorAll("button[data-orient]").forEach((e) => e.classList.toggle("loc-active", e.dataset.orient === p.orientation)), P.querySelectorAll("button[data-flag]").forEach((e) => e.classList.toggle("loc-active", !!p[e.dataset.flag])), P.querySelectorAll("button[data-act=\"edit\"]").forEach((e) => e.classList.toggle("loc-active", p.editMode)), P.querySelectorAll("button[data-act=\"images\"]").forEach((e) => e.classList.toggle("loc-active", p.showImages)), P.querySelectorAll("button[data-act=\"legend\"]").forEach((e) => e.classList.toggle("loc-active", p.showLegend)), P.querySelectorAll("button[data-act=\"fullscreen\"]").forEach((e) => e.classList.toggle("loc-active", Yi())), P.querySelectorAll("button[data-act=\"undo\"]").forEach((e) => {
			e.disabled = !ri();
		}), P.querySelectorAll("button[data-act=\"redo\"]").forEach((e) => {
			e.disabled = !ii();
		}));
	}
	if (M(document, "fullscreenchange", $i), M(document, "webkitfullscreenchange", $i), ci(), $(), Jt(), Pr(), pr(), Be) {
		let e = V("initial");
		f.fitOnInit && e.then((e) => {
			e && Yt();
		});
	} else mt(), ht(), ze = Promise.resolve(!0), f.fitOnInit && Yt();
	ni(), typeof ResizeObserver < "u" && !f.targetSize && f.reflowOnResize && (Ie = F.clientWidth > 0 && F.clientHeight > 0 ? F.clientWidth / F.clientHeight : 0, Pe = new ResizeObserver(() => {
		if (p.subtreeMode !== "AutoSmart" && p.subtreeMode !== "GridSmart" && p.subtreeMode !== "Auto" || Object.keys(g).length || F.clientWidth <= 0 || F.clientHeight <= 0) return;
		let e = F.clientWidth / F.clientHeight;
		Ie && Math.abs(Math.log(e / Ie)) < .08 || (Ie = e, Fe && cancelAnimationFrame(Fe), Fe = requestAnimationFrame(() => {
			Fe = 0, V("resize").then((e) => {
				e && Yt();
			});
		}));
	}), Pe.observe(F));
	let sa = !1;
	function ca() {
		if (!sa) {
			sa = !0, xt("destroyed"), Ve.forEach(({ target: e, type: t, fn: n, optsL: r }) => e.removeEventListener(t, n, r)), Ve.length = 0, Ae && cancelAnimationFrame(Ae), on(), Fe && cancelAnimationFrame(Fe), Pe && Pe.disconnect(), vr && clearTimeout(vr), N.remove();
			for (let e in T) delete T[e];
			for (let e in E) delete E[e];
			for (let e in D) delete D[e];
		}
	}
	let la = {
		root: N,
		setNodes: Ni,
		loadJSON: Pi,
		setOrientation: Fi,
		setSubtreeMode: Ii,
		setSpacing: Li,
		setOption: Ri,
		setShowGrid: zi,
		setSnapToGrid: Bi,
		setAlignToGrid: Vi,
		toggleGrid: Hi,
		fitToScreen: Yt,
		relayout: Gi,
		forceRelayout: Ki,
		resetView: qi,
		expandAll: $t,
		collapseAll: en,
		toggleCollapse: tn,
		centerOnNode: Xt,
		search: nn,
		clearSearch: rn,
		exportJSON: bi,
		exportSVG: Oi,
		exportPNG: ki,
		exportWebP: Ai,
		exportPDF: ji,
		buildSVG: Ti,
		setEditMode: mr,
		isEditMode: () => p.editMode,
		setShowImages: Wi,
		isShowingImages: () => p.showImages,
		setShowLegend: Fr,
		toggleLegend: Ir,
		isShowingLegend: () => p.showLegend,
		getLegendBody: () => dt,
		setAutoEdgeSide: Ui,
		isAutoEdgeSide: () => p.autoEdgeSide,
		setPhotoHeight: (e) => At({ photoHeight: e }),
		setCardWidth: (e) => At({ width: e }),
		setCardSize: At,
		setPhotoContain: (e) => At({ contain: e !== !1 }),
		getSelection: () => [...x],
		setSelection: (e) => Sn(Array.isArray(e) ? e : e ? [e] : []),
		clearSelection: () => {
			Cn(), yn();
		},
		getEdgeSelection: () => [...H],
		setEdgeSelection: On,
		clearEdgeSelection: Dn,
		resetSelectedEdges: kn,
		getFamilyRouteSelection: () => p.selectedFamilyId,
		getFamilyNetworks: () => J(Te),
		getFamilyRouteOverrides: () => J(y),
		setFamilyRouteOverride: Gn,
		resetFamilyRoute: Wn,
		enterFullscreen: Xi,
		exitFullscreen: Zi,
		toggleFullscreen: Qi,
		isFullscreen: Yi,
		undo: ai,
		redo: oi,
		canUndo: ri,
		canRedo: ii,
		updateNode: wr,
		addChild: Er,
		deleteNode: Dr,
		reparentNode: rr,
		detachNode: ir,
		attachNode: ar,
		beginAttach: sr,
		cancelAttach: cr,
		isAttaching: () => !!or,
		openInspector: hr,
		closeInspector: gr,
		nodeScreenRect: Fn,
		getSettings: G,
		setSettings: Br,
		toggleSettings: Vr,
		resetSettings: Hr,
		saveLayoutPreset: _i,
		loadLayoutPreset: vi,
		deleteLayoutPreset: yi,
		listLayoutPresets: hi,
		getLayoutPresets: gi,
		getLayout: pi,
		applyLayout: mi,
		getNodeHost: (e) => T[e] || null,
		getNodeSlotEl: (e) => T[e] ? T[e].querySelector(".loc-node-slot") : null,
		getInspectorBody: () => it,
		getSettingsBody: () => ct,
		nodeThemeStyle: (e) => h[e] ? oe(h[e], S) : null,
		getState: () => ({
			...p,
			familyRouteOverrides: J(y)
		}),
		getNodes: () => m.map((e) => ({ ...e })),
		getPositioned: () => C,
		isLayoutBusy: () => Re,
		whenLayoutSettled: () => ze,
		cancelLayout: () => xt("cancelled"),
		on: Ue,
		off: We,
		destroy: ca
	};
	return la;
}
//#endregion
export { f as t };
