// Vue 3 wrapper. Drives the shared vanilla engine (no duplicated chart logic),
// mirrors props -> engine setters, re-emits engine events as Vue events, and
// bridges Vue SLOTS into the engine via <Teleport>:
//   #node      -> custom card content, teleported into each engine-positioned host
//   #toolbar   -> your own controls (built-in toolbar auto-suppressed)
//   #inspector -> custom body for the right slide-in panel
//   #settings  -> custom body for the left settings panel
//   #legend    -> custom body for the floating legend
//   #empty     -> shown when there are no nodes
// Written with defineComponent + h() so no SFC compiler is needed; Vue stays an
// external peer dependency.
import {
  defineComponent, h, ref, shallowRef, computed, markRaw,
  onMounted, onBeforeUnmount, watch, Teleport,
} from 'vue';
import { createOrgChart } from '../vanilla/createOrgChart.js';

const EVENTS = [
  'node-click', 'node-select', 'node-drag-start', 'node-drag', 'node-drag-end',
  'layout-change', 'orientation-change', 'subtree-mode-change',
  'edit-mode-change', 'node-change', 'settings-change',
  'inspector-open', 'inspector-close', 'settings-open', 'settings-close', 'fullscreen-change',
  'history-change', 'attach-start', 'attach-cancel', 'user-select',
  'presets-change', 'preset-load', 'selection-change', 'legend-change',
];

function toStyle(s) {
  const o = {};
  if (s) { if (s.bg) o.background = s.bg; if (s.text) o.color = s.text; if (s.border) o.borderColor = s.border; }
  return o;
}

export const OrgChart = defineComponent({
  name: 'OrgChart',
  props: {
    nodes: { type: Array, default: () => [] },
    orientation: { type: String, default: 'TopToBottom' },
    subtreeMode: { type: String, default: 'Balanced' },
    spacingX: { type: Number, default: 40 },
    spacingY: { type: Number, default: 70 },
    enableDragging: { type: Boolean, default: true },
    enablePan: { type: Boolean, default: true },
    enableZoom: { type: Boolean, default: true },
    readonly: { type: Boolean, default: false },
    editMode: { type: Boolean, default: false },
    inspector: { type: Boolean, default: true },
    inspectorTarget: { type: [String, Object], default: null }, // mount the inspector drawer outside the canvas
    settingsTarget: { type: [String, Object], default: null },  // mount the settings drawer outside the canvas
    fullscreenControl: { type: Boolean, default: true },         // floating fullscreen button on the canvas
    fitOnLayoutChange: { type: [Boolean, String], default: true }, // re-frame after relayout: true|'fit' · 'recenter' · false|'none'
    showImages: { type: Boolean, default: true },                  // show person photos; off → user-silhouette icon
    photoHeight: { type: Number, default: 104 },                   // person-photo height in px (uniform, larger = bigger image)
    legend: { type: Boolean, default: false },                     // show the floating legend
    legendTarget: { type: [String, Object], default: null },       // mount the legend into an external element
    userSearch: { type: Function, default: null },                 // (query, node) => Promise<user[]> | user[] — person-name typeahead from your API
    userToFields: { type: Function, default: null },               // (user, node) => field patch for a chosen user
    snapAlign: { type: Boolean, default: true },                   // snap-to-align (parent axis + siblings) while dragging
    settings: { type: Object, default: null },
    fitOnInit: { type: Boolean, default: true },
    toolbar: { type: [Boolean, Object], default: true },   // false | true | { subtree, orient, actions, grid, mode, export }
    persist: { type: Boolean, default: false },
    storageKey: { type: String, default: 'local-org-chart.state' },
  },
  emits: EVENTS,
  setup(props, { emit, expose, slots }) {
    const elRef = ref(null);
    let chart = null;

    const ready = ref(false);              // flips true after mount (re-renders slots with a live instance)
    const liveState = ref({});             // engine state snapshot, refreshed on key events
    const hosts = shallowRef([]);          // [{ id, node, target, themeStyle }] for #node teleports
    const inspectorNode = ref(null);       // { id, node } while the panel is open (for #inspector)
    const settingsOpen = ref(false);       // whether the settings drawer is open (for #settings)
    const legendShown = ref(!!props.legend); // whether the legend is shown (for #legend)
    const isEmpty = computed(() => !(props.nodes && props.nodes.length));

    function refreshState() { if (chart) liveState.value = chart.getState(); }
    function syncHosts() {
      if (!chart || !slots.node) { hosts.value = []; return; }
      hosts.value = chart.getPositioned().map((p) => {
        const target = chart.getNodeSlotEl(p.node.id);
        return target ? { id: p.node.id, node: markRaw(p.node), target: markRaw(target), themeStyle: toStyle(chart.nodeThemeStyle(p.node.id)) } : null;
      }).filter(Boolean);
    }

    onMounted(() => {
      chart = createOrgChart(elRef.value, {
        nodes: props.nodes,
        orientation: props.orientation,
        subtreeMode: props.subtreeMode,
        spacingX: props.spacingX,
        spacingY: props.spacingY,
        enableDragging: props.enableDragging,
        enablePan: props.enablePan,
        enableZoom: props.enableZoom,
        readonly: props.readonly,
        editMode: props.editMode,
        inspector: props.inspector,
        inspectorTarget: props.inspectorTarget || null,
        settingsTarget: props.settingsTarget || null,
        fullscreenControl: props.fullscreenControl,
        fitOnLayoutChange: props.fitOnLayoutChange,
        showImages: props.showImages,
        photoHeight: props.photoHeight,
        legend: props.legend,
        legendTarget: props.legendTarget || null,
        legendSlot: !!slots.legend,
        userSearch: props.userSearch || null,
        userToFields: props.userToFields || null,
        snapAlign: props.snapAlign,
        settings: props.settings || undefined,
        fitOnInit: props.fitOnInit,
        // a #toolbar slot replaces the built-in toolbar
        toolbar: slots.toolbar ? false : props.toolbar,
        nodeSlots: !!slots.node,
        inspectorSlot: !!slots.inspector,
        settingsSlot: !!slots.settings,
        persist: props.persist,
        storageKey: props.storageKey,
      });
      EVENTS.forEach((name) => chart.on(name, (payload) => emit(name, payload)));
      chart.on('nodes-rendered', syncHosts);
      ['layout-change', 'edit-mode-change', 'settings-change', 'node-select', 'node-change'].forEach((n) => chart.on(n, refreshState));
      chart.on('inspector-open', (e) => { inspectorNode.value = e; });
      chart.on('inspector-close', () => { inspectorNode.value = null; });
      chart.on('settings-open', () => { settingsOpen.value = true; });
      chart.on('settings-close', () => { settingsOpen.value = false; });
      chart.on('legend-change', (e) => { legendShown.value = !!e.legend; });
      refreshState();
      syncHosts();          // capture the hosts created during the engine's initial boot
      ready.value = true;
    });

    watch(() => props.nodes, (v) => { if (chart) { chart.setNodes(v || []); syncHosts(); refreshState(); } });
    watch(() => props.orientation, (v) => chart && chart.setOrientation(v));
    watch(() => props.subtreeMode, (v) => chart && chart.setSubtreeMode(v));
    watch(() => [props.spacingX, props.spacingY], ([x, y]) => chart && chart.setSpacing(x, y));
    watch(() => props.readonly, (v) => chart && chart.setOption('readonly', v));
    watch(() => props.editMode, (v) => chart && chart.setEditMode(v));
    watch(() => props.settings, (v) => { if (chart && v) chart.setSettings(v); }, { deep: true });
    watch(() => props.enableDragging, (v) => chart && chart.setOption('enableDragging', v));
    watch(() => props.enablePan, (v) => chart && chart.setOption('enablePan', v));
    watch(() => props.enableZoom, (v) => chart && chart.setOption('enableZoom', v));
    watch(() => props.fitOnLayoutChange, (v) => chart && chart.setOption('fitOnLayoutChange', v));
    watch(() => props.showImages, (v) => chart && chart.setShowImages(v));
    watch(() => props.photoHeight, (v) => chart && chart.setPhotoHeight(v));
    watch(() => props.legend, (v) => chart && chart.setShowLegend(v));
    watch(() => props.userSearch, (v) => chart && chart.setOption('userSearch', v || null));
    watch(() => props.userToFields, (v) => chart && chart.setOption('userToFields', v || null));
    watch(() => props.snapAlign, (v) => chart && chart.setOption('snapAlign', v));

    onBeforeUnmount(() => { if (chart) { chart.destroy(); chart = null; } });

    expose({
      // ---- view / layout ----
      fitToScreen: () => chart && chart.fitToScreen(),
      relayout: () => chart && chart.relayout(),
      resetView: () => chart && chart.resetView(),
      expandAll: () => chart && chart.expandAll(),
      collapseAll: () => chart && chart.collapseAll(),
      toggleCollapse: (id) => chart && chart.toggleCollapse(id),
      centerOnNode: (id) => chart && chart.centerOnNode(id),

      // ---- search ----
      search: (q) => chart && chart.search(q),
      clearSearch: () => chart && chart.clearSearch(),

      // ---- orientation / subtree ----
      setOrientation: (o) => chart && chart.setOrientation(o),
      setSubtreeMode: (m) => chart && chart.setSubtreeMode(m),
      setSpacing: (x, y) => chart && chart.setSpacing(x, y),

      // ---- grid (single canonical name each; setOption('showGrid', …) also works) ----
      setShowGrid: (on) => chart && chart.setShowGrid(on),
      setSnapToGrid: (on) => chart && chart.setSnapToGrid(on),
      setAlignToGrid: (on) => chart && chart.setAlignToGrid(on),
      toggleGrid: (force) => chart && chart.toggleGrid(force),

      // ---- fullscreen ----
      enterFullscreen: () => chart && chart.enterFullscreen(),
      exitFullscreen: () => chart && chart.exitFullscreen(),
      toggleFullscreen: (force) => chart && chart.toggleFullscreen(force),
      isFullscreen: () => !!(chart && chart.isFullscreen()),

      // ---- undo / redo ----
      undo: () => chart && chart.undo(),
      redo: () => chart && chart.redo(),
      canUndo: () => !!(chart && chart.canUndo()),
      canRedo: () => !!(chart && chart.canRedo()),

      // ---- images / legend / multi-select ----
      setShowImages: (on) => chart && chart.setShowImages(on),
      isShowingImages: () => !!(chart && chart.isShowingImages()),
      setPhotoHeight: (px) => chart && chart.setPhotoHeight(px),
      setShowLegend: (on) => chart && chart.setShowLegend(on),
      toggleLegend: (force) => chart && chart.toggleLegend(force),
      isShowingLegend: () => !!(chart && chart.isShowingLegend()),
      getSelection: () => (chart ? chart.getSelection() : []),
      setSelection: (ids) => chart && chart.setSelection(ids),
      clearSelection: () => chart && chart.clearSelection(),

      // ---- edit mode / inspector / settings ----
      setEditMode: (v) => chart && chart.setEditMode(v),
      isEditMode: () => chart && chart.isEditMode(),
      updateNode: (id, patch) => chart && chart.updateNode(id, patch),
      addChild: (parentId) => chart && chart.addChild(parentId),
      deleteNode: (id) => chart && chart.deleteNode(id),
      reparentNode: (id, newParentId) => chart && chart.reparentNode(id, newParentId),
      detachNode: (id) => chart && chart.detachNode(id),
      attachNode: (id, parentId) => chart && chart.attachNode(id, parentId),
      beginAttach: (id) => chart && chart.beginAttach(id),
      cancelAttach: () => chart && chart.cancelAttach(),
      isAttaching: () => !!(chart && chart.isAttaching()),
      openInspector: (id) => chart && chart.openInspector(id),
      closeInspector: () => chart && chart.closeInspector(),
      nodeScreenRect: (id) => chart && chart.nodeScreenRect(id),
      getSettings: () => chart && chart.getSettings(),
      setSettings: (s) => chart && chart.setSettings(s),
      toggleSettings: (f) => chart && chart.toggleSettings(f),
      resetSettings: () => chart && chart.resetSettings(),

      // ---- layout presets (built-in UI in the settings drawer, or build your own with these) ----
      saveLayoutPreset: (name, opts2) => chart && chart.saveLayoutPreset(name, opts2),
      loadLayoutPreset: (name) => chart && chart.loadLayoutPreset(name),
      deleteLayoutPreset: (name) => chart && chart.deleteLayoutPreset(name),
      listLayoutPresets: () => (chart ? chart.listLayoutPresets() : []),
      getLayoutPresets: () => (chart ? chart.getLayoutPresets() : {}),
      getLayout: (opts2) => chart && chart.getLayout(opts2),     // portable object → POST to your backend
      applyLayout: (obj) => chart && chart.applyLayout(obj),     // ...and apply one fetched from it

      // ---- data ----
      setNodes: (nodes, meta, options) => chart && chart.setNodes(nodes, meta, options),
      loadJSON: (data) => chart && chart.loadJSON(data),
      getState: () => chart && chart.getState(),
      getNodes: () => chart && chart.getNodes(),
      getPositioned: () => chart && chart.getPositioned(),

      // ---- export ----
      exportJSON: (download) => chart && chart.exportJSON(download),
      exportSVG: () => chart && chart.exportSVG(),
      exportPNG: (scale) => chart && chart.exportPNG(scale),
      exportPDF: () => chart && chart.exportPDF(),
      buildSVG: (raster) => chart && chart.buildSVG(raster),

      // ---- generic / advanced ----
      setOption: (key, val) => chart && chart.setOption(key, val),
      on: (name, cb) => chart && chart.on(name, cb),
      off: (name, cb) => chart && chart.off(name, cb),

      // ---- raw engine instance (escape hatch) ----
      instance: () => chart,
    });

    return () => {
      const children = [];

      // #toolbar slot (rendered above the chart; built-in toolbar is suppressed)
      if (slots.toolbar) {
        children.push(h('div', { class: 'loc-vue-toolbar' },
          ready.value ? slots.toolbar({ chart, state: liveState.value }) : []));
      }

      // the engine mounts into this host element
      children.push(h('div', { ref: elRef, class: 'loc-vue-host' }));

      // #node slot — teleport custom card content into each engine-positioned host
      if (slots.node) {
        for (const hst of hosts.value) {
          children.push(h(Teleport, { to: hst.target, key: 'n:' + hst.id },
            slots.node({
              node: hst.node,
              selected: liveState.value.selectedNodeId === hst.id,
              editMode: !!liveState.value.editMode,
              themeStyle: hst.themeStyle,
              update: (patch) => chart && chart.updateNode(hst.id, patch),
              select: () => chart && chart.openInspector(hst.id),
            })));
        }
      }

      // #inspector slot — teleport custom body into the open panel
      if (slots.inspector && ready.value && inspectorNode.value && chart) {
        const body = chart.getInspectorBody();
        if (body) {
          children.push(h(Teleport, { to: body, key: 'inspector' },
            slots.inspector({
              node: inspectorNode.value.node,
              editMode: !!liveState.value.editMode,
              update: (patch) => chart.updateNode(inspectorNode.value.id, patch),
              close: () => chart.closeInspector(),
            })));
        }
      }

      // #settings slot — teleport a custom body into the open settings drawer
      if (slots.settings && ready.value && settingsOpen.value && chart) {
        const body = chart.getSettingsBody();
        if (body) {
          children.push(h(Teleport, { to: body, key: 'settings' },
            slots.settings({
              settings: chart.getSettings(),
              update: (s) => chart.setSettings(s),
              reset: () => chart.resetSettings(),
              close: () => chart.toggleSettings(false),
            })));
        }
      }

      // #legend slot — teleport a custom body into the legend box (when shown)
      if (slots.legend && ready.value && legendShown.value && chart) {
        const body = chart.getLegendBody();
        if (body) {
          children.push(h(Teleport, { to: body, key: 'legend' },
            slots.legend({
              nodes: chart.getNodes(),
              settings: chart.getSettings(),
              close: () => chart.setShowLegend(false),
            })));
        }
      }

      // #empty slot — shown when there are no nodes
      if (slots.empty && isEmpty.value) {
        children.push(h('div', { class: 'loc-vue-empty' }, slots.empty()));
      }

      return h('div', { class: 'loc-vue-wrap' }, children);
    };
  },
});
