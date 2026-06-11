import "./vanilla.js";
import { defineComponent as c, ref as g, onMounted as s, watch as n, onBeforeUnmount as u, h as f } from "vue";
import { createOrgChart as b } from "./local-org-chart.js";
const i = [
  "node-click",
  "node-select",
  "node-drag-start",
  "node-drag",
  "node-drag-end",
  "layout-change",
  "orientation-change",
  "subtree-mode-change"
], y = c({
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
    fitOnInit: { type: Boolean, default: !0 },
    toolbar: { type: Boolean, default: !0 },
    persist: { type: Boolean, default: !1 },
    storageKey: { type: String, default: "local-org-chart.state" }
  },
  emits: i,
  setup(a, { emit: o, expose: d }) {
    const r = g(null);
    let e = null;
    return s(() => {
      e = b(r.value, {
        nodes: a.nodes,
        orientation: a.orientation,
        subtreeMode: a.subtreeMode,
        spacingX: a.spacingX,
        spacingY: a.spacingY,
        enableDragging: a.enableDragging,
        enablePan: a.enablePan,
        enableZoom: a.enableZoom,
        readonly: a.readonly,
        fitOnInit: a.fitOnInit,
        toolbar: a.toolbar,
        persist: a.persist,
        storageKey: a.storageKey
      }), i.forEach((t) => e.on(t, (l) => o(t, l)));
    }), n(() => a.nodes, (t) => e && e.setNodes(t || [])), n(() => a.orientation, (t) => e && e.setOrientation(t)), n(() => a.subtreeMode, (t) => e && e.setSubtreeMode(t)), n(() => [a.spacingX, a.spacingY], ([t, l]) => e && e.setSpacing(t, l)), n(() => a.readonly, (t) => e && e.setOption("readonly", t)), n(() => a.enableDragging, (t) => e && e.setOption("enableDragging", t)), n(() => a.enablePan, (t) => e && e.setOption("enablePan", t)), n(() => a.enableZoom, (t) => e && e.setOption("enableZoom", t)), u(() => {
      e && (e.destroy(), e = null);
    }), d({
      fitToScreen: () => e && e.fitToScreen(),
      relayout: () => e && e.relayout(),
      expandAll: () => e && e.expandAll(),
      collapseAll: () => e && e.collapseAll(),
      search: (t) => e && e.search(t),
      clearSearch: () => e && e.clearSearch(),
      exportJSON: (t) => e && e.exportJSON(t),
      exportSVG: () => e && e.exportSVG(),
      exportPNG: (t) => e && e.exportPNG(t),
      exportPDF: () => e && e.exportPDF(),
      setOrientation: (t) => e && e.setOrientation(t),
      setSubtreeMode: (t) => e && e.setSubtreeMode(t),
      loadJSON: (t) => e && e.loadJSON(t),
      centerOnNode: (t) => e && e.centerOnNode(t),
      instance: () => e
    }), () => f("div", { ref: r, class: "loc-vue-host", style: "width:100%;height:100%;" });
  }
}), S = {
  install(a, o = {}) {
    a.component(o.name || "OrgChart", y);
  }
};
export {
  y as OrgChart,
  S as default
};
//# sourceMappingURL=vue.js.map
