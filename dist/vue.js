import "./vanilla.js";
import { defineComponent as P, ref as g, shallowRef as L, computed as E, onMounted as T, watch as a, onBeforeUnmount as w, h as i, Teleport as h, markRaw as O } from "vue";
import { createOrgChart as A } from "./local-org-chart.js";
const v = [
  "node-click",
  "node-select",
  "node-drag-start",
  "node-drag",
  "node-drag-end",
  "layout-change",
  "orientation-change",
  "subtree-mode-change",
  "edit-mode-change",
  "node-change",
  "settings-change",
  "inspector-open",
  "inspector-close",
  "settings-open",
  "settings-close",
  "fullscreen-change",
  "history-change",
  "attach-start",
  "attach-cancel",
  "user-select",
  "presets-change",
  "preset-load",
  "selection-change",
  "legend-change",
  "edges-select",
  "edges-reset"
];
function B(n) {
  const d = {};
  return n && (n.bg && (d.background = n.bg), n.text && (d.color = n.text), n.border && (d.borderColor = n.border)), d;
}
const M = P({
  name: "OrgChart",
  props: {
    nodes: { type: Array, default: () => [] },
    orientation: { type: String, default: "TopToBottom" },
    subtreeMode: { type: String, default: "Balanced" },
    spacingX: { type: Number, default: 40 },
    spacingY: { type: Number, default: 70 },
    enableDragging: { type: Boolean, default: !0 },
    enablePan: { type: Boolean, default: !0 },
    enableZoom: { type: Boolean, default: !0 },
    readonly: { type: Boolean, default: !1 },
    editMode: { type: Boolean, default: !1 },
    inspector: { type: Boolean, default: !0 },
    inspectorTarget: { type: [String, Object], default: null },
    // mount the inspector drawer outside the canvas
    settingsTarget: { type: [String, Object], default: null },
    // mount the settings drawer outside the canvas
    fullscreenControl: { type: Boolean, default: !0 },
    // floating fullscreen button on the canvas
    fitOnLayoutChange: { type: [Boolean, String], default: !0 },
    // re-frame after relayout: true|'fit' · 'recenter' · false|'none'
    showImages: { type: Boolean, default: !0 },
    // show person photos; off → user-silhouette icon
    photoHeight: { type: Number, default: 104 },
    // person-photo height in px (uniform, larger = bigger image)
    cardWidth: { type: Number, default: 180 },
    // person-card width in px (global; height = photoHeight + text block)
    photoContain: { type: Boolean, default: !0 },
    // fit the WHOLE photo inside the card (no crop); false = crop/cover
    legend: { type: Boolean, default: !1 },
    // show the floating legend
    legendTarget: { type: [String, Object], default: null },
    // mount the legend into an external element
    autoEdgeSide: { type: Boolean, default: !1 },
    // (opt-in) endpoints follow waypoints onto any box side
    userSearch: { type: Function, default: null },
    // (query, node) => Promise<user[]> | user[] — person-name typeahead from your API
    userToFields: { type: Function, default: null },
    // (user, node) => field patch for a chosen user
    snapAlign: { type: Boolean, default: !0 },
    // snap-to-align (parent axis + siblings) while dragging
    settings: { type: Object, default: null },
    fitOnInit: { type: Boolean, default: !0 },
    toolbar: { type: [Boolean, Object], default: !0 },
    // false | true | { subtree, orient, actions, grid, mode, export }
    persist: { type: Boolean, default: !1 },
    storageKey: { type: String, default: "local-org-chart.state" }
  },
  emits: v,
  setup(n, { emit: d, expose: N, slots: l }) {
    const p = g(null);
    let e = null;
    const r = g(!1), c = g({}), S = L([]), u = g(null), f = g(!1), m = g(!!n.legend), C = E(() => !(n.nodes && n.nodes.length));
    function y() {
      e && (c.value = e.getState());
    }
    function b() {
      if (!e || !l.node) {
        S.value = [];
        return;
      }
      S.value = e.getPositioned().map((t) => {
        const o = e.getNodeSlotEl(t.node.id);
        return o ? { id: t.node.id, node: O(t.node), target: O(o), themeStyle: B(e.nodeThemeStyle(t.node.id)) } : null;
      }).filter(Boolean);
    }
    return T(() => {
      e = A(p.value, {
        nodes: n.nodes,
        orientation: n.orientation,
        subtreeMode: n.subtreeMode,
        spacingX: n.spacingX,
        spacingY: n.spacingY,
        enableDragging: n.enableDragging,
        enablePan: n.enablePan,
        enableZoom: n.enableZoom,
        readonly: n.readonly,
        editMode: n.editMode,
        inspector: n.inspector,
        inspectorTarget: n.inspectorTarget || null,
        settingsTarget: n.settingsTarget || null,
        fullscreenControl: n.fullscreenControl,
        fitOnLayoutChange: n.fitOnLayoutChange,
        showImages: n.showImages,
        photoHeight: n.photoHeight,
        cardWidth: n.cardWidth,
        photoContain: n.photoContain,
        legend: n.legend,
        legendTarget: n.legendTarget || null,
        legendSlot: !!l.legend,
        autoEdgeSide: n.autoEdgeSide,
        userSearch: n.userSearch || null,
        userToFields: n.userToFields || null,
        snapAlign: n.snapAlign,
        settings: n.settings || void 0,
        fitOnInit: n.fitOnInit,
        // a #toolbar slot replaces the built-in toolbar
        toolbar: l.toolbar ? !1 : n.toolbar,
        nodeSlots: !!l.node,
        inspectorSlot: !!l.inspector,
        settingsSlot: !!l.settings,
        persist: n.persist,
        storageKey: n.storageKey
      }), v.forEach((t) => e.on(t, (o) => d(t, o))), e.on("nodes-rendered", b), ["layout-change", "edit-mode-change", "settings-change", "node-select", "node-change"].forEach((t) => e.on(t, y)), e.on("inspector-open", (t) => {
        u.value = t;
      }), e.on("inspector-close", () => {
        u.value = null;
      }), e.on("settings-open", () => {
        f.value = !0;
      }), e.on("settings-close", () => {
        f.value = !1;
      }), e.on("legend-change", (t) => {
        m.value = !!t.legend;
      }), y(), b(), r.value = !0;
    }), a(() => n.nodes, (t) => {
      e && (e.setNodes(t || []), b(), y());
    }), a(() => n.orientation, (t) => e && e.setOrientation(t)), a(() => n.subtreeMode, (t) => e && e.setSubtreeMode(t)), a(() => [n.spacingX, n.spacingY], ([t, o]) => e && e.setSpacing(t, o)), a(() => n.readonly, (t) => e && e.setOption("readonly", t)), a(() => n.editMode, (t) => e && e.setEditMode(t)), a(() => n.settings, (t) => {
      e && t && e.setSettings(t);
    }, { deep: !0 }), a(() => n.enableDragging, (t) => e && e.setOption("enableDragging", t)), a(() => n.enablePan, (t) => e && e.setOption("enablePan", t)), a(() => n.enableZoom, (t) => e && e.setOption("enableZoom", t)), a(() => n.fitOnLayoutChange, (t) => e && e.setOption("fitOnLayoutChange", t)), a(() => n.showImages, (t) => e && e.setShowImages(t)), a(() => n.photoHeight, (t) => e && e.setPhotoHeight(t)), a(() => n.cardWidth, (t) => e && e.setCardWidth(t)), a(() => n.photoContain, (t) => e && e.setPhotoContain(t)), a(() => n.legend, (t) => e && e.setShowLegend(t)), a(() => n.autoEdgeSide, (t) => e && e.setAutoEdgeSide(t)), a(() => n.userSearch, (t) => e && e.setOption("userSearch", t || null)), a(() => n.userToFields, (t) => e && e.setOption("userToFields", t || null)), a(() => n.snapAlign, (t) => e && e.setOption("snapAlign", t)), w(() => {
      e && (e.destroy(), e = null);
    }), N({
      // ---- view / layout ----
      fitToScreen: () => e && e.fitToScreen(),
      relayout: () => e && e.relayout(),
      resetView: () => e && e.resetView(),
      expandAll: () => e && e.expandAll(),
      collapseAll: () => e && e.collapseAll(),
      toggleCollapse: (t) => e && e.toggleCollapse(t),
      centerOnNode: (t) => e && e.centerOnNode(t),
      // ---- search ----
      search: (t) => e && e.search(t),
      clearSearch: () => e && e.clearSearch(),
      // ---- orientation / subtree ----
      setOrientation: (t) => e && e.setOrientation(t),
      setSubtreeMode: (t) => e && e.setSubtreeMode(t),
      setSpacing: (t, o) => e && e.setSpacing(t, o),
      // ---- grid (single canonical name each; setOption('showGrid', …) also works) ----
      setShowGrid: (t) => e && e.setShowGrid(t),
      setSnapToGrid: (t) => e && e.setSnapToGrid(t),
      setAlignToGrid: (t) => e && e.setAlignToGrid(t),
      toggleGrid: (t) => e && e.toggleGrid(t),
      // ---- fullscreen ----
      enterFullscreen: () => e && e.enterFullscreen(),
      exitFullscreen: () => e && e.exitFullscreen(),
      toggleFullscreen: (t) => e && e.toggleFullscreen(t),
      isFullscreen: () => !!(e && e.isFullscreen()),
      // ---- undo / redo ----
      undo: () => e && e.undo(),
      redo: () => e && e.redo(),
      canUndo: () => !!(e && e.canUndo()),
      canRedo: () => !!(e && e.canRedo()),
      // ---- images / legend / multi-select ----
      setShowImages: (t) => e && e.setShowImages(t),
      isShowingImages: () => !!(e && e.isShowingImages()),
      setPhotoHeight: (t) => e && e.setPhotoHeight(t),
      setCardWidth: (t) => e && e.setCardWidth(t),
      setCardSize: (t) => e && e.setCardSize(t),
      setPhotoContain: (t) => e && e.setPhotoContain(t),
      setShowLegend: (t) => e && e.setShowLegend(t),
      toggleLegend: (t) => e && e.toggleLegend(t),
      isShowingLegend: () => !!(e && e.isShowingLegend()),
      setAutoEdgeSide: (t) => e && e.setAutoEdgeSide(t),
      isAutoEdgeSide: () => !!(e && e.isAutoEdgeSide()),
      getSelection: () => e ? e.getSelection() : [],
      setSelection: (t) => e && e.setSelection(t),
      clearSelection: () => e && e.clearSelection(),
      getEdgeSelection: () => e ? e.getEdgeSelection() : [],
      setEdgeSelection: (t) => e && e.setEdgeSelection(t),
      clearEdgeSelection: () => e && e.clearEdgeSelection(),
      resetSelectedEdges: () => e && e.resetSelectedEdges(),
      // ---- edit mode / inspector / settings ----
      setEditMode: (t) => e && e.setEditMode(t),
      isEditMode: () => e && e.isEditMode(),
      updateNode: (t, o) => e && e.updateNode(t, o),
      addChild: (t) => e && e.addChild(t),
      deleteNode: (t) => e && e.deleteNode(t),
      reparentNode: (t, o) => e && e.reparentNode(t, o),
      detachNode: (t) => e && e.detachNode(t),
      attachNode: (t, o) => e && e.attachNode(t, o),
      beginAttach: (t) => e && e.beginAttach(t),
      cancelAttach: () => e && e.cancelAttach(),
      isAttaching: () => !!(e && e.isAttaching()),
      openInspector: (t) => e && e.openInspector(t),
      closeInspector: () => e && e.closeInspector(),
      nodeScreenRect: (t) => e && e.nodeScreenRect(t),
      getSettings: () => e && e.getSettings(),
      setSettings: (t) => e && e.setSettings(t),
      toggleSettings: (t) => e && e.toggleSettings(t),
      resetSettings: () => e && e.resetSettings(),
      // ---- layout presets (built-in UI in the settings drawer, or build your own with these) ----
      saveLayoutPreset: (t, o) => e && e.saveLayoutPreset(t, o),
      loadLayoutPreset: (t) => e && e.loadLayoutPreset(t),
      deleteLayoutPreset: (t) => e && e.deleteLayoutPreset(t),
      listLayoutPresets: () => e ? e.listLayoutPresets() : [],
      getLayoutPresets: () => e ? e.getLayoutPresets() : {},
      getLayout: (t) => e && e.getLayout(t),
      // portable object → POST to your backend
      applyLayout: (t) => e && e.applyLayout(t),
      // ...and apply one fetched from it
      // ---- data ----
      setNodes: (t, o, s) => e && e.setNodes(t, o, s),
      loadJSON: (t) => e && e.loadJSON(t),
      getState: () => e && e.getState(),
      getNodes: () => e && e.getNodes(),
      getPositioned: () => e && e.getPositioned(),
      // ---- export ----
      exportJSON: (t) => e && e.exportJSON(t),
      exportSVG: () => e && e.exportSVG(),
      exportPNG: (t) => e && e.exportPNG(t),
      exportWebP: (t) => e && e.exportWebP(t),
      exportPDF: () => e && e.exportPDF(),
      buildSVG: (t) => e && e.buildSVG(t),
      // ---- generic / advanced ----
      setOption: (t, o) => e && e.setOption(t, o),
      on: (t, o) => e && e.on(t, o),
      off: (t, o) => e && e.off(t, o),
      // ---- raw engine instance (escape hatch) ----
      instance: () => e
    }), () => {
      const t = [];
      if (l.toolbar && t.push(i(
        "div",
        { class: "loc-vue-toolbar" },
        r.value ? l.toolbar({ chart: e, state: c.value }) : []
      )), t.push(i("div", { ref: p, class: "loc-vue-host" })), l.node)
        for (const o of S.value)
          t.push(i(
            h,
            { to: o.target, key: "n:" + o.id },
            l.node({
              node: o.node,
              selected: c.value.selectedNodeId === o.id,
              editMode: !!c.value.editMode,
              themeStyle: o.themeStyle,
              update: (s) => e && e.updateNode(o.id, s),
              select: () => e && e.openInspector(o.id)
            })
          ));
      if (l.inspector && r.value && u.value && e) {
        const o = e.getInspectorBody();
        o && t.push(i(
          h,
          { to: o, key: "inspector" },
          l.inspector({
            node: u.value.node,
            editMode: !!c.value.editMode,
            update: (s) => e.updateNode(u.value.id, s),
            close: () => e.closeInspector()
          })
        ));
      }
      if (l.settings && r.value && f.value && e) {
        const o = e.getSettingsBody();
        o && t.push(i(
          h,
          { to: o, key: "settings" },
          l.settings({
            settings: e.getSettings(),
            update: (s) => e.setSettings(s),
            reset: () => e.resetSettings(),
            close: () => e.toggleSettings(!1)
          })
        ));
      }
      if (l.legend && r.value && m.value && e) {
        const o = e.getLegendBody();
        o && t.push(i(
          h,
          { to: o, key: "legend" },
          l.legend({
            nodes: e.getNodes(),
            settings: e.getSettings(),
            close: () => e.setShowLegend(!1)
          })
        ));
      }
      return l.empty && C.value && t.push(i("div", { class: "loc-vue-empty" }, l.empty())), i("div", { class: "loc-vue-wrap" }, t);
    };
  }
}), G = {
  install(n, d = {}) {
    n.component(d.name || "OrgChart", M);
  }
};
export {
  M as OrgChart,
  G as default
};
