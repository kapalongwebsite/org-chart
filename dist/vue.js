import { H as e, U as t, W as n, q as r, z as i } from "./bounds-Cig4UHsX.js";
import { s as a } from "./core-DpSEAd-z.js";
import { t as o } from "./createOrgChart-CwdZtEa4.js";
/* empty css                   */
import { Teleport as s, computed as c, defineComponent as l, h as u, markRaw as d, onBeforeUnmount as f, onMounted as p, ref as m, shallowRef as h, watch as g } from "vue";
// src/vue/OrgChart.js
var _ = /* @__PURE__ */ "node-click.node-select.node-drag-start.node-drag.node-drag-end.layout-change.orientation-change.subtree-mode-change.relayout.layout-start.layout-complete.layout-cancel.layout-error.edit-mode-change.node-change.settings-change.inspector-open.inspector-close.settings-open.settings-close.fullscreen-change.history-change.attach-start.attach-cancel.user-select.presets-change.preset-load.selection-change.legend-change.edges-select.edges-reset.family-route-select.family-route-change.family-route-reset.input-warning".split(".");
function v(e, t) {
	if (e === t) return !0;
	if (!e || !t || typeof e != "object" || typeof t != "object" || Array.isArray(e) !== Array.isArray(t)) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	return n.length === r.length && n.every((n) => Object.prototype.hasOwnProperty.call(t, n) && v(e[n], t[n]));
}
function y(e, t) {
	return t ? Object.keys(e).every((n) => n === "themeRules" ? Array.isArray(e.themeRules) && v(e.themeRules.map(a), t.themeRules) : Object.prototype.hasOwnProperty.call(t, n) && v(e[n], t[n])) : !1;
}
function b(e) {
	let t = {};
	return e && (e.bg && (t.background = e.bg), e.text && (t.color = e.text), e.border && (t.borderColor = e.border)), t;
}
var x = l({
	name: "OrgChart",
	props: {
		nodes: {
			type: Array,
			default: () => []
		},
		orientation: {
			type: String,
			default: "TopToBottom"
		},
		subtreeMode: {
			type: String,
			default: "AutoSmart"
		},
		spacingX: {
			type: Number,
			default: 40
		},
		spacingY: {
			type: Number,
			default: 70
		},
		enableDragging: {
			type: Boolean,
			default: !0
		},
		enablePan: {
			type: Boolean,
			default: !0
		},
		enableZoom: {
			type: Boolean,
			default: !0
		},
		maxZoom: {
			type: Number,
			default: 4
		},
		ariaLabel: {
			type: String,
			default: null
		},
		readonly: {
			type: Boolean,
			default: !1
		},
		editMode: {
			type: Boolean,
			default: !1
		},
		inspector: {
			type: Boolean,
			default: !0
		},
		inspectorTarget: {
			type: [String, Object],
			default: null
		},
		settingsTarget: {
			type: [String, Object],
			default: null
		},
		fullscreenControl: {
			type: Boolean,
			default: !0
		},
		fitOnLayoutChange: {
			type: [Boolean, String],
			default: !0
		},
		showImages: {
			type: Boolean,
			default: !0
		},
		photoHeight: {
			type: Number,
			default: t.height - 140
		},
		cardWidth: {
			type: Number,
			default: t.width
		},
		textHeight: {
			type: Number,
			default: 140
		},
		departmentWidth: {
			type: Number,
			default: i.width
		},
		departmentHeight: {
			type: Number,
			default: i.height
		},
		photoContain: {
			type: Boolean,
			default: n.fit === "contain"
		},
		virtualPhotoFrame: {
			type: Object,
			default: () => ({ ...r })
		},
		renderedImage: {
			type: Object,
			default: () => ({ ...n })
		},
		photoBackground: {
			type: String,
			default: e
		},
		legend: {
			type: Boolean,
			default: !1
		},
		legendTarget: {
			type: [String, Object],
			default: null
		},
		autoEdgeSide: {
			type: Boolean,
			default: !1
		},
		userSearch: {
			type: Function,
			default: null
		},
		userToFields: {
			type: Function,
			default: null
		},
		snapAlign: {
			type: Boolean,
			default: !0
		},
		settings: {
			type: Object,
			default: null
		},
		fitOnInit: {
			type: Boolean,
			default: !0
		},
		targetAspect: {
			type: Number,
			default: 1.6
		},
		targetSize: {
			type: Object,
			default: null
		},
		reflowOnResize: {
			type: Boolean,
			default: !1
		},
		layoutWorker: {
			type: Boolean,
			default: !0
		},
		layoutCache: {
			type: Boolean,
			default: !0
		},
		toolbar: {
			type: [Boolean, Object],
			default: !0
		},
		advancedLayoutControls: {
			type: Boolean,
			default: !1
		},
		persist: {
			type: Boolean,
			default: !1
		},
		storageKey: {
			type: String,
			default: "local-org-chart.state"
		}
	},
	emits: _,
	setup(e, { emit: t, expose: n, slots: r }) {
		let i = m(null), a = null, l = m(!1), v = m({}), x = h([]), S = m(null), C = m(!1), w = m(!!e.legend), T = c(() => !(e.nodes && e.nodes.length));
		function E() {
			a && (v.value = a.getState());
		}
		function D() {
			!a || !r.node ? x.value = [] : x.value = a.getPositioned().map((e) => {
				let t = a.getNodeSlotEl(e.node.id);
				return t ? {
					id: e.node.id,
					node: d(e.node),
					target: d(t),
					themeStyle: b(a.nodeThemeStyle(e.node.id))
				} : null;
			}).filter(Boolean);
		}
		return p(() => {
			if (a = o(i.value, {
				nodes: e.nodes,
				orientation: e.orientation,
				subtreeMode: e.subtreeMode,
				spacingX: e.spacingX,
				spacingY: e.spacingY,
				enableDragging: e.enableDragging,
				enablePan: e.enablePan,
				enableZoom: e.enableZoom,
				maxZoom: e.maxZoom,
				ariaLabel: e.ariaLabel || void 0,
				readonly: e.readonly,
				editMode: e.editMode,
				inspector: e.inspector,
				inspectorTarget: e.inspectorTarget || null,
				settingsTarget: e.settingsTarget || null,
				fullscreenControl: e.fullscreenControl,
				fitOnLayoutChange: e.fitOnLayoutChange,
				showImages: e.showImages,
				photoHeight: e.photoHeight,
				cardWidth: e.cardWidth,
				textHeight: e.textHeight,
				departmentWidth: e.departmentWidth,
				departmentHeight: e.departmentHeight,
				photoContain: e.photoContain,
				virtualPhotoFrame: e.virtualPhotoFrame,
				renderedImage: e.renderedImage,
				photoBackground: e.photoBackground,
				legend: e.legend,
				legendTarget: e.legendTarget || null,
				legendSlot: !!r.legend,
				autoEdgeSide: e.autoEdgeSide,
				userSearch: e.userSearch || null,
				userToFields: e.userToFields || null,
				snapAlign: e.snapAlign,
				settings: e.settings || void 0,
				fitOnInit: e.fitOnInit,
				targetAspect: e.targetAspect,
				targetSize: e.targetSize,
				reflowOnResize: e.reflowOnResize,
				layoutWorker: e.layoutWorker,
				layoutCache: e.layoutCache,
				toolbar: !r.toolbar && e.toolbar,
				advancedLayoutControls: e.advancedLayoutControls,
				nodeSlots: !!r.node,
				inspectorSlot: !!r.inspector,
				settingsSlot: !!r.settings,
				persist: e.persist,
				storageKey: e.storageKey
			}), _.forEach((e) => a.on(e, (n) => t(e, n))), a.on("nodes-rendered", D), [
				"layout-change",
				"edit-mode-change",
				"settings-change",
				"node-select",
				"node-change"
			].forEach((e) => a.on(e, E)), a.on("inspector-open", (e) => {
				S.value = e;
			}), a.on("inspector-close", () => {
				S.value = null;
			}), a.on("settings-open", () => {
				C.value = !0;
			}), a.on("settings-close", () => {
				C.value = !1;
			}), a.on("legend-change", (e) => {
				w.value = !!e.legend;
			}), E(), D(), l.value = !0, !a.isLayoutBusy() && a.getPositioned().length) {
				let e = a.getState();
				t("layout-change", {
					positioned: a.getPositioned(),
					familyNetworks: a.getFamilyNetworks(),
					mode: e.subtreeMode,
					orientation: e.orientation
				});
			}
		}), g(() => e.nodes, (e) => {
			a && (a.setNodes(e || []), D(), E());
		}), g(() => e.orientation, (e) => a && a.setOrientation(e)), g(() => e.subtreeMode, (e) => a && a.setSubtreeMode(e)), g(() => [e.spacingX, e.spacingY], ([e, t]) => a && a.setSpacing(e, t)), g(() => e.readonly, (e) => a && a.setOption("readonly", e)), g(() => e.editMode, (e) => a && a.setEditMode(e)), g(() => e.settings, (e) => {
			a && e && !y(e, a.getSettings()) && a.setSettings(e);
		}, { deep: !0 }), g(() => e.enableDragging, (e) => a && a.setOption("enableDragging", e)), g(() => e.enablePan, (e) => a && a.setOption("enablePan", e)), g(() => e.enableZoom, (e) => a && a.setOption("enableZoom", e)), g(() => e.maxZoom, (e) => a && a.setOption("maxZoom", e)), g(() => e.fitOnLayoutChange, (e) => a && a.setOption("fitOnLayoutChange", e)), g(() => e.showImages, (e) => a && a.setShowImages(e)), g(() => e.photoHeight, (e) => a && a.setPhotoHeight(e)), g(() => e.cardWidth, (e) => a && a.setCardWidth(e)), g(() => e.textHeight, (e) => a && a.setCardSize({ textHeight: e })), g(() => e.departmentWidth, (e) => a && a.setCardSize({ departmentWidth: e })), g(() => e.departmentHeight, (e) => a && a.setCardSize({ departmentHeight: e })), g(() => e.photoContain, (e) => a && a.setPhotoContain(e)), g(() => e.virtualPhotoFrame, (e) => a && a.setPhotoRendering({ virtualPhotoFrame: e }), { deep: !0 }), g(() => e.renderedImage, (e) => a && a.setPhotoRendering({ renderedImage: e }), { deep: !0 }), g(() => e.photoBackground, (e) => a && a.setPhotoRendering({ photoBackground: e })), g(() => e.legend, (e) => a && a.setShowLegend(e)), g(() => e.autoEdgeSide, (e) => a && a.setAutoEdgeSide(e)), g(() => e.userSearch, (e) => a && a.setOption("userSearch", e || null)), g(() => e.userToFields, (e) => a && a.setOption("userToFields", e || null)), g(() => e.snapAlign, (e) => a && a.setOption("snapAlign", e)), g(() => e.targetAspect, (e) => a && a.setOption("targetAspect", e)), g(() => e.targetSize, (e) => a && a.setOption("targetSize", e), { deep: !0 }), f(() => {
			a &&= (a.destroy(), null);
		}), n({
			fitToScreen: (e) => !!(a && a.fitToScreen(e)),
			zoomBy: (e, t) => a ? a.zoomBy(e, t) : null,
			relayout: () => a && a.relayout(),
			forceRelayout: () => a && a.forceRelayout(),
			resetView: () => a && a.resetView(),
			expandAll: () => a && a.expandAll(),
			collapseAll: () => a && a.collapseAll(),
			toggleCollapse: (e) => a && a.toggleCollapse(e),
			centerOnNode: (e) => a && a.centerOnNode(e),
			search: (e) => a && a.search(e),
			clearSearch: () => a && a.clearSearch(),
			setOrientation: (e) => a && a.setOrientation(e),
			setSubtreeMode: (e) => a && a.setSubtreeMode(e),
			setSpacing: (e, t) => a && a.setSpacing(e, t),
			setShowGrid: (e) => a && a.setShowGrid(e),
			setSnapToGrid: (e) => a && a.setSnapToGrid(e),
			setAlignToGrid: (e) => a && a.setAlignToGrid(e),
			toggleGrid: (e) => a && a.toggleGrid(e),
			enterFullscreen: () => a && a.enterFullscreen(),
			exitFullscreen: () => a && a.exitFullscreen(),
			toggleFullscreen: (e) => a && a.toggleFullscreen(e),
			isFullscreen: () => !!(a && a.isFullscreen()),
			undo: () => a && a.undo(),
			redo: () => a && a.redo(),
			canUndo: () => !!(a && a.canUndo()),
			canRedo: () => !!(a && a.canRedo()),
			setShowImages: (e) => a && a.setShowImages(e),
			isShowingImages: () => !!(a && a.isShowingImages()),
			setPhotoHeight: (e) => a && a.setPhotoHeight(e),
			setCardWidth: (e) => a && a.setCardWidth(e),
			setCardSize: (e) => a && a.setCardSize(e),
			setPhotoRendering: (e) => a && a.setPhotoRendering(e),
			setPhotoContain: (e) => a && a.setPhotoContain(e),
			setShowLegend: (e) => a && a.setShowLegend(e),
			toggleLegend: (e) => a && a.toggleLegend(e),
			isShowingLegend: () => !!(a && a.isShowingLegend()),
			setAutoEdgeSide: (e) => a && a.setAutoEdgeSide(e),
			isAutoEdgeSide: () => !!(a && a.isAutoEdgeSide()),
			getSelection: () => a ? a.getSelection() : [],
			setSelection: (e) => a && a.setSelection(e),
			clearSelection: () => a && a.clearSelection(),
			getEdgeSelection: () => a ? a.getEdgeSelection() : [],
			setEdgeSelection: (e) => a && a.setEdgeSelection(e),
			clearEdgeSelection: () => a && a.clearEdgeSelection(),
			resetSelectedEdges: () => a && a.resetSelectedEdges(),
			getFamilyRouteSelection: () => a ? a.getFamilyRouteSelection() : null,
			getFamilyNetworks: () => a ? a.getFamilyNetworks() : [],
			getFamilyRouteOverrides: () => a ? a.getFamilyRouteOverrides() : {},
			setFamilyRouteOverride: (e, t) => a && a.setFamilyRouteOverride(e, t),
			resetFamilyRoute: (e) => a && a.resetFamilyRoute(e),
			setEditMode: (e) => a && a.setEditMode(e),
			isEditMode: () => a && a.isEditMode(),
			updateNode: (e, t) => a && a.updateNode(e, t),
			addChild: (e) => a && a.addChild(e),
			deleteNode: (e) => a && a.deleteNode(e),
			reparentNode: (e, t) => a && a.reparentNode(e, t),
			detachNode: (e) => a && a.detachNode(e),
			attachNode: (e, t) => a && a.attachNode(e, t),
			beginAttach: (e) => a && a.beginAttach(e),
			cancelAttach: () => a && a.cancelAttach(),
			isAttaching: () => !!(a && a.isAttaching()),
			openInspector: (e) => a && a.openInspector(e),
			closeInspector: () => a && a.closeInspector(),
			nodeScreenRect: (e) => a && a.nodeScreenRect(e),
			getSettings: () => a && a.getSettings(),
			setSettings: (e) => a && a.setSettings(e),
			toggleSettings: (e) => a && a.toggleSettings(e),
			resetSettings: () => a && a.resetSettings(),
			saveLayoutPreset: (e, t) => a && a.saveLayoutPreset(e, t),
			loadLayoutPreset: (e) => a && a.loadLayoutPreset(e),
			deleteLayoutPreset: (e) => a && a.deleteLayoutPreset(e),
			listLayoutPresets: () => a ? a.listLayoutPresets() : [],
			getLayoutPresets: () => a ? a.getLayoutPresets() : {},
			getLayout: (e) => a && a.getLayout(e),
			applyLayout: (e) => a && a.applyLayout(e),
			setNodes: (e, t, n) => a && a.setNodes(e, t, n),
			loadJSON: (e) => a && a.loadJSON(e),
			getState: () => a && a.getState(),
			getNodes: () => a && a.getNodes(),
			getPositioned: () => a && a.getPositioned(),
			isLayoutBusy: () => !!(a && a.isLayoutBusy()),
			isReadonly: () => !a || a.isReadonly(),
			whenLayoutSettled: () => a ? a.whenLayoutSettled() : Promise.resolve(!1),
			cancelLayout: () => !!(a && a.cancelLayout()),
			exportJSON: (e) => a && a.exportJSON(e),
			exportSVG: () => a && a.exportSVG(),
			exportPNG: (e) => a && a.exportPNG(e),
			exportWebP: (e) => a && a.exportWebP(e),
			exportPDF: () => a && a.exportPDF(),
			buildSVG: (e) => a && a.buildSVG(e),
			setOption: (e, t) => a && a.setOption(e, t),
			on: (e, t) => a && a.on(e, t),
			off: (e, t) => a && a.off(e, t),
			instance: () => a
		}), () => {
			let e = [];
			if (r.toolbar && e.push(u("div", { class: "loc-vue-toolbar" }, l.value ? r.toolbar({
				chart: a,
				state: v.value
			}) : [])), e.push(u("div", {
				ref: i,
				class: "loc-vue-host"
			})), r.node) for (let t of x.value) e.push(u(s, {
				to: t.target,
				key: "n:" + t.id
			}, r.node({
				node: t.node,
				selected: v.value.selectedNodeId === t.id,
				editMode: !!v.value.editMode,
				themeStyle: t.themeStyle,
				update: (e) => a && a.updateNode(t.id, e),
				select: () => a && a.openInspector(t.id)
			})));
			if (r.inspector && l.value && S.value && a) {
				let t = a.getInspectorBody();
				t && e.push(u(s, {
					to: t,
					key: "inspector"
				}, r.inspector({
					node: S.value.node,
					editMode: !!v.value.editMode,
					update: (e) => a.updateNode(S.value.id, e),
					close: () => a.closeInspector()
				})));
			}
			if (r.settings && l.value && C.value && a) {
				let t = a.getSettingsBody();
				t && e.push(u(s, {
					to: t,
					key: "settings"
				}, r.settings({
					settings: a.getSettings(),
					update: (e) => a.setSettings(e),
					reset: () => a.resetSettings(),
					close: () => a.toggleSettings(!1)
				})));
			}
			if (r.legend && l.value && w.value && a) {
				let t = a.getLegendBody();
				t && e.push(u(s, {
					to: t,
					key: "legend"
				}, r.legend({
					nodes: a.getNodes(),
					settings: a.getSettings(),
					close: () => a.setShowLegend(!1)
				})));
			}
			return r.empty && T.value && e.push(u("div", { class: "loc-vue-empty" }, r.empty())), u("div", { class: "loc-vue-wrap" }, e);
		};
	}
}), S = { install(e, t = {}) {
	e.component(t.name || "OrgChart", x);
} };
export { x as OrgChart, S as default };
