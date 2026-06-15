import "./vanilla.js";
import { defineComponent as M, ref as c, shallowRef as C, computed as B, onMounted as T, watch as l, onBeforeUnmount as x, h as r, Teleport as h, markRaw as O } from "vue";
import { createOrgChart as G } from "./local-org-chart.js";
const m = [
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
  "fullscreen-change"
];
function A(n) {
  const i = {};
  return n && (n.bg && (i.background = n.bg), n.text && (i.color = n.text), n.border && (i.borderColor = n.border)), i;
}
const P = M({
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
    targetAspect: { type: Number, default: 1.6 },
    // RowWrap fill shape (W/H); default ≈ landscape tarp
    targetSize: { type: Object, default: null },
    // { width, height } — overrides targetAspect
    settings: { type: Object, default: null },
    fitOnInit: { type: Boolean, default: !0 },
    toolbar: { type: [Boolean, Object], default: !0 },
    // false | true | { subtree, orient, actions, grid, mode, export }
    persist: { type: Boolean, default: !1 },
    storageKey: { type: String, default: "local-org-chart.state" }
  },
  emits: m,
  setup(n, { emit: i, expose: v, slots: a }) {
    const b = c(null);
    let e = null;
    const u = c(!1), s = c({}), f = C([]), g = c(null), S = c(!1), N = B(() => !(n.nodes && n.nodes.length));
    function y() {
      e && (s.value = e.getState());
    }
    function p() {
      if (!e || !a.node) {
        f.value = [];
        return;
      }
      f.value = e.getPositioned().map((t) => {
        const o = e.getNodeSlotEl(t.node.id);
        return o ? { id: t.node.id, node: O(t.node), target: O(o), themeStyle: A(e.nodeThemeStyle(t.node.id)) } : null;
      }).filter(Boolean);
    }
    return T(() => {
      e = G(b.value, {
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
        targetAspect: n.targetAspect,
        targetSize: n.targetSize || null,
        settings: n.settings || void 0,
        fitOnInit: n.fitOnInit,
        // a #toolbar slot replaces the built-in toolbar
        toolbar: a.toolbar ? !1 : n.toolbar,
        nodeSlots: !!a.node,
        inspectorSlot: !!a.inspector,
        settingsSlot: !!a.settings,
        persist: n.persist,
        storageKey: n.storageKey
      }), m.forEach((t) => e.on(t, (o) => i(t, o))), e.on("nodes-rendered", p), ["layout-change", "edit-mode-change", "settings-change", "node-select", "node-change"].forEach((t) => e.on(t, y)), e.on("inspector-open", (t) => {
        g.value = t;
      }), e.on("inspector-close", () => {
        g.value = null;
      }), e.on("settings-open", () => {
        S.value = !0;
      }), e.on("settings-close", () => {
        S.value = !1;
      }), y(), p(), u.value = !0;
    }), l(() => n.nodes, (t) => {
      e && (e.setNodes(t || []), p(), y());
    }), l(() => n.orientation, (t) => e && e.setOrientation(t)), l(() => n.subtreeMode, (t) => e && e.setSubtreeMode(t)), l(() => [n.spacingX, n.spacingY], ([t, o]) => e && e.setSpacing(t, o)), l(() => n.readonly, (t) => e && e.setOption("readonly", t)), l(() => n.editMode, (t) => e && e.setEditMode(t)), l(() => n.settings, (t) => {
      e && t && e.setSettings(t);
    }, { deep: !0 }), l(() => n.enableDragging, (t) => e && e.setOption("enableDragging", t)), l(() => n.enablePan, (t) => e && e.setOption("enablePan", t)), l(() => n.enableZoom, (t) => e && e.setOption("enableZoom", t)), l(() => n.fitOnLayoutChange, (t) => e && e.setOption("fitOnLayoutChange", t)), l(() => n.targetAspect, (t) => {
      e && (e.setOption("targetAspect", t), e.relayout());
    }), l(() => n.targetSize, (t) => {
      e && (e.setOption("targetSize", t || null), e.relayout());
    }, { deep: !0 }), x(() => {
      e && (e.destroy(), e = null);
    }), v({
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
      // ---- edit mode / inspector / settings ----
      setEditMode: (t) => e && e.setEditMode(t),
      isEditMode: () => e && e.isEditMode(),
      updateNode: (t, o) => e && e.updateNode(t, o),
      addChild: (t) => e && e.addChild(t),
      deleteNode: (t) => e && e.deleteNode(t),
      reparentNode: (t, o) => e && e.reparentNode(t, o),
      detachNode: (t) => e && e.detachNode(t),
      openInspector: (t) => e && e.openInspector(t),
      closeInspector: () => e && e.closeInspector(),
      nodeScreenRect: (t) => e && e.nodeScreenRect(t),
      getSettings: () => e && e.getSettings(),
      setSettings: (t) => e && e.setSettings(t),
      toggleSettings: (t) => e && e.toggleSettings(t),
      resetSettings: () => e && e.resetSettings(),
      // ---- data ----
      setNodes: (t, o, d) => e && e.setNodes(t, o, d),
      loadJSON: (t) => e && e.loadJSON(t),
      getState: () => e && e.getState(),
      getNodes: () => e && e.getNodes(),
      getPositioned: () => e && e.getPositioned(),
      // ---- export ----
      exportJSON: (t) => e && e.exportJSON(t),
      exportSVG: () => e && e.exportSVG(),
      exportPNG: (t) => e && e.exportPNG(t),
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
      if (a.toolbar && t.push(r(
        "div",
        { class: "loc-vue-toolbar" },
        u.value ? a.toolbar({ chart: e, state: s.value }) : []
      )), t.push(r("div", { ref: b, class: "loc-vue-host" })), a.node)
        for (const o of f.value)
          t.push(r(
            h,
            { to: o.target, key: "n:" + o.id },
            a.node({
              node: o.node,
              selected: s.value.selectedNodeId === o.id,
              editMode: !!s.value.editMode,
              themeStyle: o.themeStyle,
              update: (d) => e && e.updateNode(o.id, d),
              select: () => e && e.openInspector(o.id)
            })
          ));
      if (a.inspector && u.value && g.value && e) {
        const o = e.getInspectorBody();
        o && t.push(r(
          h,
          { to: o, key: "inspector" },
          a.inspector({
            node: g.value.node,
            editMode: !!s.value.editMode,
            update: (d) => e.updateNode(g.value.id, d),
            close: () => e.closeInspector()
          })
        ));
      }
      if (a.settings && u.value && S.value && e) {
        const o = e.getSettingsBody();
        o && t.push(r(
          h,
          { to: o, key: "settings" },
          a.settings({
            settings: e.getSettings(),
            update: (d) => e.setSettings(d),
            reset: () => e.resetSettings(),
            close: () => e.toggleSettings(!1)
          })
        ));
      }
      return a.empty && N.value && t.push(r("div", { class: "loc-vue-empty" }, a.empty())), r("div", { class: "loc-vue-wrap" }, t);
    };
  }
}), w = {
  install(n, i = {}) {
    n.component(i.name || "OrgChart", P);
  }
};
export {
  P as OrgChart,
  w as default
};
