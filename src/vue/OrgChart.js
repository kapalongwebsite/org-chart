// Vue 3 wrapper. Thin — it owns no chart logic; it drives the shared vanilla
// engine, mirrors props -> engine setters, and re-emits engine events as Vue
// events. Written with defineComponent + h() so no SFC compiler is needed and
// Vue stays an external peer dependency.
import { defineComponent, h, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { createOrgChart } from '../vanilla/createOrgChart.js';

const EVENTS = [
  'node-click', 'node-select', 'node-drag-start', 'node-drag', 'node-drag-end',
  'layout-change', 'orientation-change', 'subtree-mode-change',
];

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
    fitOnInit: { type: Boolean, default: true },
    toolbar: { type: Boolean, default: true },
    persist: { type: Boolean, default: false },
    storageKey: { type: String, default: 'local-org-chart.state' },
  },
  emits: EVENTS,
  setup(props, { emit, expose }) {
    const elRef = ref(null);
    let chart = null;

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
        fitOnInit: props.fitOnInit,
        toolbar: props.toolbar,
        persist: props.persist,
        storageKey: props.storageKey,
      });
      EVENTS.forEach((name) => chart.on(name, (payload) => emit(name, payload)));
    });

    // keep the engine in sync when props change (no manual reinit needed)
    watch(() => props.nodes, (v) => chart && chart.setNodes(v || []));
    watch(() => props.orientation, (v) => chart && chart.setOrientation(v));
    watch(() => props.subtreeMode, (v) => chart && chart.setSubtreeMode(v));
    watch(() => [props.spacingX, props.spacingY], ([x, y]) => chart && chart.setSpacing(x, y));
    watch(() => props.readonly, (v) => chart && chart.setOption('readonly', v));
    watch(() => props.enableDragging, (v) => chart && chart.setOption('enableDragging', v));
    watch(() => props.enablePan, (v) => chart && chart.setOption('enablePan', v));
    watch(() => props.enableZoom, (v) => chart && chart.setOption('enableZoom', v));

    onBeforeUnmount(() => { if (chart) { chart.destroy(); chart = null; } });

    // methods callable via template ref
    expose({
      fitToScreen: () => chart && chart.fitToScreen(),
      relayout: () => chart && chart.relayout(),
      expandAll: () => chart && chart.expandAll(),
      collapseAll: () => chart && chart.collapseAll(),
      search: (q) => chart && chart.search(q),
      clearSearch: () => chart && chart.clearSearch(),
      exportJSON: (download) => chart && chart.exportJSON(download),
      exportSVG: () => chart && chart.exportSVG(),
      exportPNG: (scale) => chart && chart.exportPNG(scale),
      exportPDF: () => chart && chart.exportPDF(),
      setOrientation: (o) => chart && chart.setOrientation(o),
      setSubtreeMode: (m) => chart && chart.setSubtreeMode(m),
      loadJSON: (data) => chart && chart.loadJSON(data),
      centerOnNode: (id) => chart && chart.centerOnNode(id),
      instance: () => chart,
    });

    return () => h('div', { ref: elRef, class: 'loc-vue-host', style: 'width:100%;height:100%;' });
  },
});
