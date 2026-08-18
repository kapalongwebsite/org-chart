import { t as e } from "./createOrgChart-CjHH9xoT.js";
/* empty css                   */
import { Teleport as t, computed as n, defineComponent as r, h as i, markRaw as a, onBeforeUnmount as o, onMounted as s, ref as c, shallowRef as l, watch as u } from "vue";
//#region src/vue/OrgChart.js
var d = /* @__PURE__ */ "node-click.node-select.node-drag-start.node-drag.node-drag-end.layout-change.orientation-change.subtree-mode-change.edit-mode-change.node-change.settings-change.inspector-open.inspector-close.settings-open.settings-close.fullscreen-change.history-change.attach-start.attach-cancel.user-select.presets-change.preset-load.selection-change.legend-change.edges-select.edges-reset".split(".");
function f(e) {
	let t = {};
	return e && (e.bg && (t.background = e.bg), e.text && (t.color = e.text), e.border && (t.borderColor = e.border)), t;
}
var p = r({
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
			default: "Balanced"
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
			default: 104
		},
		cardWidth: {
			type: Number,
			default: 180
		},
		photoContain: {
			type: Boolean,
			default: !0
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
		toolbar: {
			type: [Boolean, Object],
			default: !0
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
	emits: d,
	setup(r, { emit: p, expose: m, slots: h }) {
		let g = c(null), _ = null, v = c(!1), y = c({}), b = l([]), x = c(null), S = c(!1), C = c(!!r.legend), w = n(() => !(r.nodes && r.nodes.length));
		function T() {
			_ && (y.value = _.getState());
		}
		function E() {
			if (!_ || !h.node) {
				b.value = [];
				return;
			}
			b.value = _.getPositioned().map((e) => {
				let t = _.getNodeSlotEl(e.node.id);
				return t ? {
					id: e.node.id,
					node: a(e.node),
					target: a(t),
					themeStyle: f(_.nodeThemeStyle(e.node.id))
				} : null;
			}).filter(Boolean);
		}
		return s(() => {
			_ = e(g.value, {
				nodes: r.nodes,
				orientation: r.orientation,
				subtreeMode: r.subtreeMode,
				spacingX: r.spacingX,
				spacingY: r.spacingY,
				enableDragging: r.enableDragging,
				enablePan: r.enablePan,
				enableZoom: r.enableZoom,
				readonly: r.readonly,
				editMode: r.editMode,
				inspector: r.inspector,
				inspectorTarget: r.inspectorTarget || null,
				settingsTarget: r.settingsTarget || null,
				fullscreenControl: r.fullscreenControl,
				fitOnLayoutChange: r.fitOnLayoutChange,
				showImages: r.showImages,
				photoHeight: r.photoHeight,
				cardWidth: r.cardWidth,
				photoContain: r.photoContain,
				legend: r.legend,
				legendTarget: r.legendTarget || null,
				legendSlot: !!h.legend,
				autoEdgeSide: r.autoEdgeSide,
				userSearch: r.userSearch || null,
				userToFields: r.userToFields || null,
				snapAlign: r.snapAlign,
				settings: r.settings || void 0,
				fitOnInit: r.fitOnInit,
				toolbar: !h.toolbar && r.toolbar,
				nodeSlots: !!h.node,
				inspectorSlot: !!h.inspector,
				settingsSlot: !!h.settings,
				persist: r.persist,
				storageKey: r.storageKey
			}), d.forEach((e) => _.on(e, (t) => p(e, t))), _.on("nodes-rendered", E), [
				"layout-change",
				"edit-mode-change",
				"settings-change",
				"node-select",
				"node-change"
			].forEach((e) => _.on(e, T)), _.on("inspector-open", (e) => {
				x.value = e;
			}), _.on("inspector-close", () => {
				x.value = null;
			}), _.on("settings-open", () => {
				S.value = !0;
			}), _.on("settings-close", () => {
				S.value = !1;
			}), _.on("legend-change", (e) => {
				C.value = !!e.legend;
			}), T(), E(), v.value = !0;
		}), u(() => r.nodes, (e) => {
			_ && (_.setNodes(e || []), E(), T());
		}), u(() => r.orientation, (e) => _ && _.setOrientation(e)), u(() => r.subtreeMode, (e) => _ && _.setSubtreeMode(e)), u(() => [r.spacingX, r.spacingY], ([e, t]) => _ && _.setSpacing(e, t)), u(() => r.readonly, (e) => _ && _.setOption("readonly", e)), u(() => r.editMode, (e) => _ && _.setEditMode(e)), u(() => r.settings, (e) => {
			_ && e && _.setSettings(e);
		}, { deep: !0 }), u(() => r.enableDragging, (e) => _ && _.setOption("enableDragging", e)), u(() => r.enablePan, (e) => _ && _.setOption("enablePan", e)), u(() => r.enableZoom, (e) => _ && _.setOption("enableZoom", e)), u(() => r.fitOnLayoutChange, (e) => _ && _.setOption("fitOnLayoutChange", e)), u(() => r.showImages, (e) => _ && _.setShowImages(e)), u(() => r.photoHeight, (e) => _ && _.setPhotoHeight(e)), u(() => r.cardWidth, (e) => _ && _.setCardWidth(e)), u(() => r.photoContain, (e) => _ && _.setPhotoContain(e)), u(() => r.legend, (e) => _ && _.setShowLegend(e)), u(() => r.autoEdgeSide, (e) => _ && _.setAutoEdgeSide(e)), u(() => r.userSearch, (e) => _ && _.setOption("userSearch", e || null)), u(() => r.userToFields, (e) => _ && _.setOption("userToFields", e || null)), u(() => r.snapAlign, (e) => _ && _.setOption("snapAlign", e)), o(() => {
			_ &&= (_.destroy(), null);
		}), m({
			fitToScreen: () => _ && _.fitToScreen(),
			relayout: () => _ && _.relayout(),
			resetView: () => _ && _.resetView(),
			expandAll: () => _ && _.expandAll(),
			collapseAll: () => _ && _.collapseAll(),
			toggleCollapse: (e) => _ && _.toggleCollapse(e),
			centerOnNode: (e) => _ && _.centerOnNode(e),
			search: (e) => _ && _.search(e),
			clearSearch: () => _ && _.clearSearch(),
			setOrientation: (e) => _ && _.setOrientation(e),
			setSubtreeMode: (e) => _ && _.setSubtreeMode(e),
			setSpacing: (e, t) => _ && _.setSpacing(e, t),
			setShowGrid: (e) => _ && _.setShowGrid(e),
			setSnapToGrid: (e) => _ && _.setSnapToGrid(e),
			setAlignToGrid: (e) => _ && _.setAlignToGrid(e),
			toggleGrid: (e) => _ && _.toggleGrid(e),
			enterFullscreen: () => _ && _.enterFullscreen(),
			exitFullscreen: () => _ && _.exitFullscreen(),
			toggleFullscreen: (e) => _ && _.toggleFullscreen(e),
			isFullscreen: () => !!(_ && _.isFullscreen()),
			undo: () => _ && _.undo(),
			redo: () => _ && _.redo(),
			canUndo: () => !!(_ && _.canUndo()),
			canRedo: () => !!(_ && _.canRedo()),
			setShowImages: (e) => _ && _.setShowImages(e),
			isShowingImages: () => !!(_ && _.isShowingImages()),
			setPhotoHeight: (e) => _ && _.setPhotoHeight(e),
			setCardWidth: (e) => _ && _.setCardWidth(e),
			setCardSize: (e) => _ && _.setCardSize(e),
			setPhotoContain: (e) => _ && _.setPhotoContain(e),
			setShowLegend: (e) => _ && _.setShowLegend(e),
			toggleLegend: (e) => _ && _.toggleLegend(e),
			isShowingLegend: () => !!(_ && _.isShowingLegend()),
			setAutoEdgeSide: (e) => _ && _.setAutoEdgeSide(e),
			isAutoEdgeSide: () => !!(_ && _.isAutoEdgeSide()),
			getSelection: () => _ ? _.getSelection() : [],
			setSelection: (e) => _ && _.setSelection(e),
			clearSelection: () => _ && _.clearSelection(),
			getEdgeSelection: () => _ ? _.getEdgeSelection() : [],
			setEdgeSelection: (e) => _ && _.setEdgeSelection(e),
			clearEdgeSelection: () => _ && _.clearEdgeSelection(),
			resetSelectedEdges: () => _ && _.resetSelectedEdges(),
			setEditMode: (e) => _ && _.setEditMode(e),
			isEditMode: () => _ && _.isEditMode(),
			updateNode: (e, t) => _ && _.updateNode(e, t),
			addChild: (e) => _ && _.addChild(e),
			deleteNode: (e) => _ && _.deleteNode(e),
			reparentNode: (e, t) => _ && _.reparentNode(e, t),
			detachNode: (e) => _ && _.detachNode(e),
			attachNode: (e, t) => _ && _.attachNode(e, t),
			beginAttach: (e) => _ && _.beginAttach(e),
			cancelAttach: () => _ && _.cancelAttach(),
			isAttaching: () => !!(_ && _.isAttaching()),
			openInspector: (e) => _ && _.openInspector(e),
			closeInspector: () => _ && _.closeInspector(),
			nodeScreenRect: (e) => _ && _.nodeScreenRect(e),
			getSettings: () => _ && _.getSettings(),
			setSettings: (e) => _ && _.setSettings(e),
			toggleSettings: (e) => _ && _.toggleSettings(e),
			resetSettings: () => _ && _.resetSettings(),
			saveLayoutPreset: (e, t) => _ && _.saveLayoutPreset(e, t),
			loadLayoutPreset: (e) => _ && _.loadLayoutPreset(e),
			deleteLayoutPreset: (e) => _ && _.deleteLayoutPreset(e),
			listLayoutPresets: () => _ ? _.listLayoutPresets() : [],
			getLayoutPresets: () => _ ? _.getLayoutPresets() : {},
			getLayout: (e) => _ && _.getLayout(e),
			applyLayout: (e) => _ && _.applyLayout(e),
			setNodes: (e, t, n) => _ && _.setNodes(e, t, n),
			loadJSON: (e) => _ && _.loadJSON(e),
			getState: () => _ && _.getState(),
			getNodes: () => _ && _.getNodes(),
			getPositioned: () => _ && _.getPositioned(),
			exportJSON: (e) => _ && _.exportJSON(e),
			exportSVG: () => _ && _.exportSVG(),
			exportPNG: (e) => _ && _.exportPNG(e),
			exportWebP: (e) => _ && _.exportWebP(e),
			exportPDF: () => _ && _.exportPDF(),
			buildSVG: (e) => _ && _.buildSVG(e),
			setOption: (e, t) => _ && _.setOption(e, t),
			on: (e, t) => _ && _.on(e, t),
			off: (e, t) => _ && _.off(e, t),
			instance: () => _
		}), () => {
			let e = [];
			if (h.toolbar && e.push(i("div", { class: "loc-vue-toolbar" }, v.value ? h.toolbar({
				chart: _,
				state: y.value
			}) : [])), e.push(i("div", {
				ref: g,
				class: "loc-vue-host"
			})), h.node) for (let n of b.value) e.push(i(t, {
				to: n.target,
				key: "n:" + n.id
			}, h.node({
				node: n.node,
				selected: y.value.selectedNodeId === n.id,
				editMode: !!y.value.editMode,
				themeStyle: n.themeStyle,
				update: (e) => _ && _.updateNode(n.id, e),
				select: () => _ && _.openInspector(n.id)
			})));
			if (h.inspector && v.value && x.value && _) {
				let n = _.getInspectorBody();
				n && e.push(i(t, {
					to: n,
					key: "inspector"
				}, h.inspector({
					node: x.value.node,
					editMode: !!y.value.editMode,
					update: (e) => _.updateNode(x.value.id, e),
					close: () => _.closeInspector()
				})));
			}
			if (h.settings && v.value && S.value && _) {
				let n = _.getSettingsBody();
				n && e.push(i(t, {
					to: n,
					key: "settings"
				}, h.settings({
					settings: _.getSettings(),
					update: (e) => _.setSettings(e),
					reset: () => _.resetSettings(),
					close: () => _.toggleSettings(!1)
				})));
			}
			if (h.legend && v.value && C.value && _) {
				let n = _.getLegendBody();
				n && e.push(i(t, {
					to: n,
					key: "legend"
				}, h.legend({
					nodes: _.getNodes(),
					settings: _.getSettings(),
					close: () => _.setShowLegend(!1)
				})));
			}
			return h.empty && w.value && e.push(i("div", { class: "loc-vue-empty" }, h.empty())), i("div", { class: "loc-vue-wrap" }, e);
		};
	}
}), m = { install(e, t = {}) {
	e.component(t.name || "OrgChart", p);
} };
//#endregion
export { p as OrgChart, m as default };
