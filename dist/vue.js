import { I as e, L as t, N as n, R as r, V as i } from "./bounds-PDieHcY6.js";
import { t as a } from "./createOrgChart-C7rp7p6G.js";
/* empty css                   */
import { Teleport as o, computed as s, defineComponent as c, h as l, markRaw as u, onBeforeUnmount as d, onMounted as f, ref as p, shallowRef as m, watch as h } from "vue";
//#region src/vue/OrgChart.js
var g = /* @__PURE__ */ "node-click.node-select.node-drag-start.node-drag.node-drag-end.layout-change.orientation-change.subtree-mode-change.relayout.layout-start.layout-complete.layout-cancel.layout-error.edit-mode-change.node-change.settings-change.inspector-open.inspector-close.settings-open.settings-close.fullscreen-change.history-change.attach-start.attach-cancel.user-select.presets-change.preset-load.selection-change.legend-change.edges-select.edges-reset.family-route-select.family-route-change.family-route-reset".split(".");
function _(e) {
	let t = {};
	return e && (e.bg && (t.background = e.bg), e.text && (t.color = e.text), e.border && (t.borderColor = e.border)), t;
}
var v = c({
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
			default: n.width
		},
		departmentHeight: {
			type: Number,
			default: n.height
		},
		photoContain: {
			type: Boolean,
			default: r.fit === "contain"
		},
		virtualPhotoFrame: {
			type: Object,
			default: () => ({ ...i })
		},
		renderedImage: {
			type: Object,
			default: () => ({ ...r })
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
	emits: g,
	setup(e, { emit: t, expose: n, slots: r }) {
		let i = p(null), c = null, v = p(!1), y = p({}), b = m([]), x = p(null), S = p(!1), C = p(!!e.legend), w = s(() => !(e.nodes && e.nodes.length));
		function T() {
			c && (y.value = c.getState());
		}
		function E() {
			if (!c || !r.node) {
				b.value = [];
				return;
			}
			b.value = c.getPositioned().map((e) => {
				let t = c.getNodeSlotEl(e.node.id);
				return t ? {
					id: e.node.id,
					node: u(e.node),
					target: u(t),
					themeStyle: _(c.nodeThemeStyle(e.node.id))
				} : null;
			}).filter(Boolean);
		}
		return f(() => {
			c = a(i.value, {
				nodes: e.nodes,
				orientation: e.orientation,
				subtreeMode: e.subtreeMode,
				spacingX: e.spacingX,
				spacingY: e.spacingY,
				enableDragging: e.enableDragging,
				enablePan: e.enablePan,
				enableZoom: e.enableZoom,
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
			}), g.forEach((e) => c.on(e, (n) => t(e, n))), c.on("nodes-rendered", E), [
				"layout-change",
				"edit-mode-change",
				"settings-change",
				"node-select",
				"node-change"
			].forEach((e) => c.on(e, T)), c.on("inspector-open", (e) => {
				x.value = e;
			}), c.on("inspector-close", () => {
				x.value = null;
			}), c.on("settings-open", () => {
				S.value = !0;
			}), c.on("settings-close", () => {
				S.value = !1;
			}), c.on("legend-change", (e) => {
				C.value = !!e.legend;
			}), T(), E(), v.value = !0;
		}), h(() => e.nodes, (e) => {
			c && (c.setNodes(e || []), E(), T());
		}), h(() => e.orientation, (e) => c && c.setOrientation(e)), h(() => e.subtreeMode, (e) => c && c.setSubtreeMode(e)), h(() => [e.spacingX, e.spacingY], ([e, t]) => c && c.setSpacing(e, t)), h(() => e.readonly, (e) => c && c.setOption("readonly", e)), h(() => e.editMode, (e) => c && c.setEditMode(e)), h(() => e.settings, (e) => {
			c && e && c.setSettings(e);
		}, { deep: !0 }), h(() => e.enableDragging, (e) => c && c.setOption("enableDragging", e)), h(() => e.enablePan, (e) => c && c.setOption("enablePan", e)), h(() => e.enableZoom, (e) => c && c.setOption("enableZoom", e)), h(() => e.fitOnLayoutChange, (e) => c && c.setOption("fitOnLayoutChange", e)), h(() => e.showImages, (e) => c && c.setShowImages(e)), h(() => e.photoHeight, (e) => c && c.setPhotoHeight(e)), h(() => e.cardWidth, (e) => c && c.setCardWidth(e)), h(() => e.textHeight, (e) => c && c.setCardSize({ textHeight: e })), h(() => e.departmentWidth, (e) => c && c.setCardSize({ departmentWidth: e })), h(() => e.departmentHeight, (e) => c && c.setCardSize({ departmentHeight: e })), h(() => e.photoContain, (e) => c && c.setPhotoContain(e)), h(() => e.virtualPhotoFrame, (e) => c && c.setPhotoRendering({ virtualPhotoFrame: e }), { deep: !0 }), h(() => e.renderedImage, (e) => c && c.setPhotoRendering({ renderedImage: e }), { deep: !0 }), h(() => e.photoBackground, (e) => c && c.setPhotoRendering({ photoBackground: e })), h(() => e.legend, (e) => c && c.setShowLegend(e)), h(() => e.autoEdgeSide, (e) => c && c.setAutoEdgeSide(e)), h(() => e.userSearch, (e) => c && c.setOption("userSearch", e || null)), h(() => e.userToFields, (e) => c && c.setOption("userToFields", e || null)), h(() => e.snapAlign, (e) => c && c.setOption("snapAlign", e)), h(() => e.targetAspect, (e) => c && c.setOption("targetAspect", e)), h(() => e.targetSize, (e) => c && c.setOption("targetSize", e), { deep: !0 }), d(() => {
			c &&= (c.destroy(), null);
		}), n({
			fitToScreen: () => c && c.fitToScreen(),
			relayout: () => c && c.relayout(),
			forceRelayout: () => c && c.forceRelayout(),
			resetView: () => c && c.resetView(),
			expandAll: () => c && c.expandAll(),
			collapseAll: () => c && c.collapseAll(),
			toggleCollapse: (e) => c && c.toggleCollapse(e),
			centerOnNode: (e) => c && c.centerOnNode(e),
			search: (e) => c && c.search(e),
			clearSearch: () => c && c.clearSearch(),
			setOrientation: (e) => c && c.setOrientation(e),
			setSubtreeMode: (e) => c && c.setSubtreeMode(e),
			setSpacing: (e, t) => c && c.setSpacing(e, t),
			setShowGrid: (e) => c && c.setShowGrid(e),
			setSnapToGrid: (e) => c && c.setSnapToGrid(e),
			setAlignToGrid: (e) => c && c.setAlignToGrid(e),
			toggleGrid: (e) => c && c.toggleGrid(e),
			enterFullscreen: () => c && c.enterFullscreen(),
			exitFullscreen: () => c && c.exitFullscreen(),
			toggleFullscreen: (e) => c && c.toggleFullscreen(e),
			isFullscreen: () => !!(c && c.isFullscreen()),
			undo: () => c && c.undo(),
			redo: () => c && c.redo(),
			canUndo: () => !!(c && c.canUndo()),
			canRedo: () => !!(c && c.canRedo()),
			setShowImages: (e) => c && c.setShowImages(e),
			isShowingImages: () => !!(c && c.isShowingImages()),
			setPhotoHeight: (e) => c && c.setPhotoHeight(e),
			setCardWidth: (e) => c && c.setCardWidth(e),
			setCardSize: (e) => c && c.setCardSize(e),
			setPhotoRendering: (e) => c && c.setPhotoRendering(e),
			setPhotoContain: (e) => c && c.setPhotoContain(e),
			setShowLegend: (e) => c && c.setShowLegend(e),
			toggleLegend: (e) => c && c.toggleLegend(e),
			isShowingLegend: () => !!(c && c.isShowingLegend()),
			setAutoEdgeSide: (e) => c && c.setAutoEdgeSide(e),
			isAutoEdgeSide: () => !!(c && c.isAutoEdgeSide()),
			getSelection: () => c ? c.getSelection() : [],
			setSelection: (e) => c && c.setSelection(e),
			clearSelection: () => c && c.clearSelection(),
			getEdgeSelection: () => c ? c.getEdgeSelection() : [],
			setEdgeSelection: (e) => c && c.setEdgeSelection(e),
			clearEdgeSelection: () => c && c.clearEdgeSelection(),
			resetSelectedEdges: () => c && c.resetSelectedEdges(),
			getFamilyRouteSelection: () => c ? c.getFamilyRouteSelection() : null,
			getFamilyNetworks: () => c ? c.getFamilyNetworks() : [],
			getFamilyRouteOverrides: () => c ? c.getFamilyRouteOverrides() : {},
			setFamilyRouteOverride: (e, t) => c && c.setFamilyRouteOverride(e, t),
			resetFamilyRoute: (e) => c && c.resetFamilyRoute(e),
			setEditMode: (e) => c && c.setEditMode(e),
			isEditMode: () => c && c.isEditMode(),
			updateNode: (e, t) => c && c.updateNode(e, t),
			addChild: (e) => c && c.addChild(e),
			deleteNode: (e) => c && c.deleteNode(e),
			reparentNode: (e, t) => c && c.reparentNode(e, t),
			detachNode: (e) => c && c.detachNode(e),
			attachNode: (e, t) => c && c.attachNode(e, t),
			beginAttach: (e) => c && c.beginAttach(e),
			cancelAttach: () => c && c.cancelAttach(),
			isAttaching: () => !!(c && c.isAttaching()),
			openInspector: (e) => c && c.openInspector(e),
			closeInspector: () => c && c.closeInspector(),
			nodeScreenRect: (e) => c && c.nodeScreenRect(e),
			getSettings: () => c && c.getSettings(),
			setSettings: (e) => c && c.setSettings(e),
			toggleSettings: (e) => c && c.toggleSettings(e),
			resetSettings: () => c && c.resetSettings(),
			saveLayoutPreset: (e, t) => c && c.saveLayoutPreset(e, t),
			loadLayoutPreset: (e) => c && c.loadLayoutPreset(e),
			deleteLayoutPreset: (e) => c && c.deleteLayoutPreset(e),
			listLayoutPresets: () => c ? c.listLayoutPresets() : [],
			getLayoutPresets: () => c ? c.getLayoutPresets() : {},
			getLayout: (e) => c && c.getLayout(e),
			applyLayout: (e) => c && c.applyLayout(e),
			setNodes: (e, t, n) => c && c.setNodes(e, t, n),
			loadJSON: (e) => c && c.loadJSON(e),
			getState: () => c && c.getState(),
			getNodes: () => c && c.getNodes(),
			getPositioned: () => c && c.getPositioned(),
			isLayoutBusy: () => !!(c && c.isLayoutBusy()),
			whenLayoutSettled: () => c ? c.whenLayoutSettled() : Promise.resolve(!1),
			cancelLayout: () => !!(c && c.cancelLayout()),
			exportJSON: (e) => c && c.exportJSON(e),
			exportSVG: () => c && c.exportSVG(),
			exportPNG: (e) => c && c.exportPNG(e),
			exportWebP: (e) => c && c.exportWebP(e),
			exportPDF: () => c && c.exportPDF(),
			buildSVG: (e) => c && c.buildSVG(e),
			setOption: (e, t) => c && c.setOption(e, t),
			on: (e, t) => c && c.on(e, t),
			off: (e, t) => c && c.off(e, t),
			instance: () => c
		}), () => {
			let e = [];
			if (r.toolbar && e.push(l("div", { class: "loc-vue-toolbar" }, v.value ? r.toolbar({
				chart: c,
				state: y.value
			}) : [])), e.push(l("div", {
				ref: i,
				class: "loc-vue-host"
			})), r.node) for (let t of b.value) e.push(l(o, {
				to: t.target,
				key: "n:" + t.id
			}, r.node({
				node: t.node,
				selected: y.value.selectedNodeId === t.id,
				editMode: !!y.value.editMode,
				themeStyle: t.themeStyle,
				update: (e) => c && c.updateNode(t.id, e),
				select: () => c && c.openInspector(t.id)
			})));
			if (r.inspector && v.value && x.value && c) {
				let t = c.getInspectorBody();
				t && e.push(l(o, {
					to: t,
					key: "inspector"
				}, r.inspector({
					node: x.value.node,
					editMode: !!y.value.editMode,
					update: (e) => c.updateNode(x.value.id, e),
					close: () => c.closeInspector()
				})));
			}
			if (r.settings && v.value && S.value && c) {
				let t = c.getSettingsBody();
				t && e.push(l(o, {
					to: t,
					key: "settings"
				}, r.settings({
					settings: c.getSettings(),
					update: (e) => c.setSettings(e),
					reset: () => c.resetSettings(),
					close: () => c.toggleSettings(!1)
				})));
			}
			if (r.legend && v.value && C.value && c) {
				let t = c.getLegendBody();
				t && e.push(l(o, {
					to: t,
					key: "legend"
				}, r.legend({
					nodes: c.getNodes(),
					settings: c.getSettings(),
					close: () => c.setShowLegend(!1)
				})));
			}
			return r.empty && w.value && e.push(l("div", { class: "loc-vue-empty" }, r.empty())), l("div", { class: "loc-vue-wrap" }, e);
		};
	}
}), y = { install(e, t = {}) {
	e.component(t.name || "OrgChart", v);
} };
//#endregion
export { v as OrgChart, y as default };
