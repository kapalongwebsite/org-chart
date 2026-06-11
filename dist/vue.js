import "./vanilla.js";
import { defineComponent as O, ref as s, shallowRef as M, computed as B, onMounted as x, watch as d, onBeforeUnmount as E, h as i, Teleport as p, markRaw as S } from "vue";
import { createOrgChart as I } from "./local-org-chart.js";
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
function P(n) {
  const l = {};
  return n && (n.bg && (l.background = n.bg), n.text && (l.color = n.text), n.border && (l.borderColor = n.border)), l;
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
  setup(n, { emit: l, expose: v, slots: a }) {
    const b = s(null);
    let e = null;
    const u = s(!1), r = s({}), g = M([]), c = s(null), N = B(() => !(n.nodes && n.nodes.length));
    function f() {
      e && (r.value = e.getState());
    }
    function h() {
      if (!e || !a.node) {
        g.value = [];
        return;
      }
      g.value = e.getPositioned().map((t) => {
        const o = e.getNodeSlotEl(t.node.id);
        return o ? { id: t.node.id, node: S(t.node), target: S(o), themeStyle: P(e.nodeThemeStyle(t.node.id)) } : null;
      }).filter(Boolean);
    }
    return x(() => {
      e = I(b.value, {
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
        settings: n.settings || void 0,
        fitOnInit: n.fitOnInit,
        // a #toolbar slot replaces the built-in toolbar
        toolbar: a.toolbar ? !1 : n.toolbar,
        nodeSlots: !!a.node,
        inspectorSlot: !!a.inspector,
        persist: n.persist,
        storageKey: n.storageKey
      }), m.forEach((t) => e.on(t, (o) => l(t, o))), e.on("nodes-rendered", h), ["layout-change", "edit-mode-change", "settings-change", "node-select", "node-change"].forEach((t) => e.on(t, f)), e.on("inspector-open", (t) => {
        c.value = t;
      }), e.on("inspector-close", () => {
        c.value = null;
      }), f(), h(), u.value = !0;
    }), d(() => n.nodes, (t) => {
      e && (e.setNodes(t || []), h(), f());
    }), d(() => n.orientation, (t) => e && e.setOrientation(t)), d(() => n.subtreeMode, (t) => e && e.setSubtreeMode(t)), d(() => [n.spacingX, n.spacingY], ([t, o]) => e && e.setSpacing(t, o)), d(() => n.readonly, (t) => e && e.setOption("readonly", t)), d(() => n.editMode, (t) => e && e.setEditMode(t)), d(() => n.settings, (t) => {
      e && t && e.setSettings(t);
    }, { deep: !0 }), d(() => n.enableDragging, (t) => e && e.setOption("enableDragging", t)), d(() => n.enablePan, (t) => e && e.setOption("enablePan", t)), d(() => n.enableZoom, (t) => e && e.setOption("enableZoom", t)), E(() => {
      e && (e.destroy(), e = null);
    }), v({
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
      setEditMode: (t) => e && e.setEditMode(t),
      isEditMode: () => e && e.isEditMode(),
      updateNode: (t, o) => e && e.updateNode(t, o),
      addChild: (t) => e && e.addChild(t),
      deleteNode: (t) => e && e.deleteNode(t),
      reparentNode: (t, o) => e && e.reparentNode(t, o),
      detachNode: (t) => e && e.detachNode(t),
      openInspector: (t) => e && e.openInspector(t),
      closeInspector: () => e && e.closeInspector(),
      getSettings: () => e && e.getSettings(),
      setSettings: (t) => e && e.setSettings(t),
      toggleSettings: (t) => e && e.toggleSettings(t),
      instance: () => e
    }), () => {
      const t = [];
      if (a.toolbar && t.push(i(
        "div",
        { class: "loc-vue-toolbar" },
        u.value ? a.toolbar({ chart: e, state: r.value }) : []
      )), t.push(i("div", { ref: b, class: "loc-vue-host" })), a.node)
        for (const o of g.value)
          t.push(i(
            p,
            { to: o.target, key: "n:" + o.id },
            a.node({
              node: o.node,
              selected: r.value.selectedNodeId === o.id,
              editMode: !!r.value.editMode,
              themeStyle: o.themeStyle,
              update: (y) => e && e.updateNode(o.id, y),
              select: () => e && e.openInspector(o.id)
            })
          ));
      if (a.inspector && u.value && c.value && e) {
        const o = e.getInspectorBody();
        o && t.push(i(
          p,
          { to: o, key: "inspector" },
          a.inspector({
            node: c.value.node,
            editMode: !!r.value.editMode,
            update: (y) => e.updateNode(c.value.id, y),
            close: () => e.closeInspector()
          })
        ));
      }
      return a.empty && N.value && t.push(i("div", { class: "loc-vue-empty" }, a.empty())), i("div", { class: "loc-vue-wrap" }, t);
    };
  }
}), A = {
  install(n, l = {}) {
    n.component(l.name || "OrgChart", C);
  }
};
export {
  C as OrgChart,
  A as default
};
