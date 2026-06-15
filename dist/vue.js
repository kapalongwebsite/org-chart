import "./vanilla.js";
import { defineComponent as v, ref as u, shallowRef as M, computed as C, onMounted as B, watch as l, onBeforeUnmount as x, h as i, Teleport as p, markRaw as b } from "vue";
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
  "fullscreen-change"
];
function T(n) {
  const d = {};
  return n && (n.bg && (d.background = n.bg), n.text && (d.color = n.text), n.border && (d.borderColor = n.border)), d;
}
const P = v({
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
    // mount the drawer outside the canvas
    fullscreenControl: { type: Boolean, default: !0 },
    // floating fullscreen button on the canvas
    fitOnLayoutChange: { type: [Boolean, String], default: !0 },
    // re-frame after relayout: true|'fit' · 'recenter' · false|'none'
    settings: { type: Object, default: null },
    fitOnInit: { type: Boolean, default: !0 },
    toolbar: { type: [Boolean, Object], default: !0 },
    // false | true | { subtree, orient, actions, grid, mode, export }
    persist: { type: Boolean, default: !1 },
    storageKey: { type: String, default: "local-org-chart.state" }
  },
  emits: m,
  setup(n, { emit: d, expose: O, slots: a }) {
    const S = u(null);
    let e = null;
    const g = u(!1), r = u({}), f = M([]), s = u(null), N = C(() => !(n.nodes && n.nodes.length));
    function h() {
      e && (r.value = e.getState());
    }
    function y() {
      if (!e || !a.node) {
        f.value = [];
        return;
      }
      f.value = e.getPositioned().map((t) => {
        const o = e.getNodeSlotEl(t.node.id);
        return o ? { id: t.node.id, node: b(t.node), target: b(o), themeStyle: T(e.nodeThemeStyle(t.node.id)) } : null;
      }).filter(Boolean);
    }
    return B(() => {
      e = G(S.value, {
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
        fullscreenControl: n.fullscreenControl,
        fitOnLayoutChange: n.fitOnLayoutChange,
        settings: n.settings || void 0,
        fitOnInit: n.fitOnInit,
        // a #toolbar slot replaces the built-in toolbar
        toolbar: a.toolbar ? !1 : n.toolbar,
        nodeSlots: !!a.node,
        inspectorSlot: !!a.inspector,
        persist: n.persist,
        storageKey: n.storageKey
      }), m.forEach((t) => e.on(t, (o) => d(t, o))), e.on("nodes-rendered", y), ["layout-change", "edit-mode-change", "settings-change", "node-select", "node-change"].forEach((t) => e.on(t, h)), e.on("inspector-open", (t) => {
        s.value = t;
      }), e.on("inspector-close", () => {
        s.value = null;
      }), h(), y(), g.value = !0;
    }), l(() => n.nodes, (t) => {
      e && (e.setNodes(t || []), y(), h());
    }), l(() => n.orientation, (t) => e && e.setOrientation(t)), l(() => n.subtreeMode, (t) => e && e.setSubtreeMode(t)), l(() => [n.spacingX, n.spacingY], ([t, o]) => e && e.setSpacing(t, o)), l(() => n.readonly, (t) => e && e.setOption("readonly", t)), l(() => n.editMode, (t) => e && e.setEditMode(t)), l(() => n.settings, (t) => {
      e && t && e.setSettings(t);
    }, { deep: !0 }), l(() => n.enableDragging, (t) => e && e.setOption("enableDragging", t)), l(() => n.enablePan, (t) => e && e.setOption("enablePan", t)), l(() => n.enableZoom, (t) => e && e.setOption("enableZoom", t)), l(() => n.fitOnLayoutChange, (t) => e && e.setOption("fitOnLayoutChange", t)), x(() => {
      e && (e.destroy(), e = null);
    }), O({
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
      // ---- data ----
      setNodes: (t, o, c) => e && e.setNodes(t, o, c),
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
      if (a.toolbar && t.push(i(
        "div",
        { class: "loc-vue-toolbar" },
        g.value ? a.toolbar({ chart: e, state: r.value }) : []
      )), t.push(i("div", { ref: S, class: "loc-vue-host" })), a.node)
        for (const o of f.value)
          t.push(i(
            p,
            { to: o.target, key: "n:" + o.id },
            a.node({
              node: o.node,
              selected: r.value.selectedNodeId === o.id,
              editMode: !!r.value.editMode,
              themeStyle: o.themeStyle,
              update: (c) => e && e.updateNode(o.id, c),
              select: () => e && e.openInspector(o.id)
            })
          ));
      if (a.inspector && g.value && s.value && e) {
        const o = e.getInspectorBody();
        o && t.push(i(
          p,
          { to: o, key: "inspector" },
          a.inspector({
            node: s.value.node,
            editMode: !!r.value.editMode,
            update: (c) => e.updateNode(s.value.id, c),
            close: () => e.closeInspector()
          })
        ));
      }
      return a.empty && N.value && t.push(i("div", { class: "loc-vue-empty" }, a.empty())), i("div", { class: "loc-vue-wrap" }, t);
    };
  }
}), w = {
  install(n, d = {}) {
    n.component(d.name || "OrgChart", P);
  }
};
export {
  P as OrgChart,
  w as default
};
