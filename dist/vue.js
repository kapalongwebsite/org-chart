import "./vanilla.js";
import { defineComponent as O, ref as g, shallowRef as M, computed as G, onMounted as T, watch as d, onBeforeUnmount as B, h as l, Teleport as y, markRaw as b } from "vue";
import { createOrgChart as x } from "./local-org-chart.js";
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
  "settings-change"
];
function P(o) {
  const i = {};
  return o && (o.bg && (i.background = o.bg), o.text && (i.color = o.text), o.border && (i.borderColor = o.border)), i;
}
const C = O({
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
    settings: { type: Object, default: null },
    fitOnInit: { type: Boolean, default: !0 },
    toolbar: { type: [Boolean, Object], default: !0 },
    // false | true | { subtree, orient, actions, grid, mode, export }
    persist: { type: Boolean, default: !1 },
    storageKey: { type: String, default: "local-org-chart.state" }
  },
  emits: m,
  setup(o, { emit: i, expose: N, slots: a }) {
    const S = g(null);
    let e = null;
    const u = g(!1), r = g({}), f = M([]), s = g(null), v = G(() => !(o.nodes && o.nodes.length));
    function h() {
      e && (r.value = e.getState());
    }
    function p() {
      if (!e || !a.node) {
        f.value = [];
        return;
      }
      f.value = e.getPositioned().map((t) => {
        const n = e.getNodeSlotEl(t.node.id);
        return n ? { id: t.node.id, node: b(t.node), target: b(n), themeStyle: P(e.nodeThemeStyle(t.node.id)) } : null;
      }).filter(Boolean);
    }
    return T(() => {
      e = x(S.value, {
        nodes: o.nodes,
        orientation: o.orientation,
        subtreeMode: o.subtreeMode,
        spacingX: o.spacingX,
        spacingY: o.spacingY,
        enableDragging: o.enableDragging,
        enablePan: o.enablePan,
        enableZoom: o.enableZoom,
        readonly: o.readonly,
        editMode: o.editMode,
        inspector: o.inspector,
        settings: o.settings || void 0,
        fitOnInit: o.fitOnInit,
        // a #toolbar slot replaces the built-in toolbar
        toolbar: a.toolbar ? !1 : o.toolbar,
        nodeSlots: !!a.node,
        inspectorSlot: !!a.inspector,
        persist: o.persist,
        storageKey: o.storageKey
      }), m.forEach((t) => e.on(t, (n) => i(t, n))), e.on("nodes-rendered", p), ["layout-change", "edit-mode-change", "settings-change", "node-select", "node-change"].forEach((t) => e.on(t, h)), e.on("inspector-open", (t) => {
        s.value = t;
      }), e.on("inspector-close", () => {
        s.value = null;
      }), h(), p(), u.value = !0;
    }), d(() => o.nodes, (t) => {
      e && (e.setNodes(t || []), p(), h());
    }), d(() => o.orientation, (t) => e && e.setOrientation(t)), d(() => o.subtreeMode, (t) => e && e.setSubtreeMode(t)), d(() => [o.spacingX, o.spacingY], ([t, n]) => e && e.setSpacing(t, n)), d(() => o.readonly, (t) => e && e.setOption("readonly", t)), d(() => o.editMode, (t) => e && e.setEditMode(t)), d(() => o.settings, (t) => {
      e && t && e.setSettings(t);
    }, { deep: !0 }), d(() => o.enableDragging, (t) => e && e.setOption("enableDragging", t)), d(() => o.enablePan, (t) => e && e.setOption("enablePan", t)), d(() => o.enableZoom, (t) => e && e.setOption("enableZoom", t)), B(() => {
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
      setSpacing: (t, n) => e && e.setSpacing(t, n),
      // ---- grid convenience (so toolbar doesn't need to know option keys) ----
      setShowGrid: (t) => e && e.setShowGrid(t),
      setSnapToGrid: (t) => e && e.setSnapToGrid(t),
      setAlignToGrid: (t) => e && e.setAlignToGrid(t),
      toggleGrid: (t) => e && e.toggleGrid(t),
      showGrid: (t) => e && e.setShowGrid(t),
      snapToGrid: (t) => e && e.setSnapToGrid(t),
      alignToGrid: (t) => e && e.setAlignToGrid(t),
      // ---- edit mode / inspector / settings ----
      setEditMode: (t) => e && e.setEditMode(t),
      isEditMode: () => e && e.isEditMode(),
      updateNode: (t, n) => e && e.updateNode(t, n),
      addChild: (t) => e && e.addChild(t),
      deleteNode: (t) => e && e.deleteNode(t),
      reparentNode: (t, n) => e && e.reparentNode(t, n),
      detachNode: (t) => e && e.detachNode(t),
      openInspector: (t) => e && e.openInspector(t),
      closeInspector: () => e && e.closeInspector(),
      getSettings: () => e && e.getSettings(),
      setSettings: (t) => e && e.setSettings(t),
      toggleSettings: (t) => e && e.toggleSettings(t),
      // ---- data ----
      setNodes: (t, n, c) => e && e.setNodes(t, n, c),
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
      setOption: (t, n) => e && e.setOption(t, n),
      on: (t, n) => e && e.on(t, n),
      off: (t, n) => e && e.off(t, n),
      // ---- convenience: reset view (clear search + relayout + fit) ----
      reset: () => e && e.reset(),
      // ---- raw engine instance (escape hatch) ----
      instance: () => e
    }), () => {
      const t = [];
      if (a.toolbar && t.push(l(
        "div",
        { class: "loc-vue-toolbar" },
        u.value ? a.toolbar({ chart: e, state: r.value }) : []
      )), t.push(l("div", { ref: S, class: "loc-vue-host" })), a.node)
        for (const n of f.value)
          t.push(l(
            y,
            { to: n.target, key: "n:" + n.id },
            a.node({
              node: n.node,
              selected: r.value.selectedNodeId === n.id,
              editMode: !!r.value.editMode,
              themeStyle: n.themeStyle,
              update: (c) => e && e.updateNode(n.id, c),
              select: () => e && e.openInspector(n.id)
            })
          ));
      if (a.inspector && u.value && s.value && e) {
        const n = e.getInspectorBody();
        n && t.push(l(
          y,
          { to: n, key: "inspector" },
          a.inspector({
            node: s.value.node,
            editMode: !!r.value.editMode,
            update: (c) => e.updateNode(s.value.id, c),
            close: () => e.closeInspector()
          })
        ));
      }
      return a.empty && v.value && t.push(l("div", { class: "loc-vue-empty" }, a.empty())), l("div", { class: "loc-vue-wrap" }, t);
    };
  }
}), A = {
  install(o, i = {}) {
    o.component(i.name || "OrgChart", C);
  }
};
export {
  C as OrgChart,
  A as default
};
