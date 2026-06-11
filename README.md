# local-org-chart

A dependency-free **organizational chart engine** with automatic subtree layout.
Built from scratch in vanilla JavaScript — no Syncfusion, GoJS, yFiles, D3, or any
paid/heavy diagram library. Ships three layers:

- **`core`** — framework-independent layout engine (no DOM, no Vue, no window).
- **`vanilla`** — plain-JS renderer that mounts into any DOM element.
- **`vue`** — a thin Vue 3 component + plugin that drives the same engine.

> **Private / local use only.** This package is marked `"private": true` and is
> **not** published to npm. Install it from your own private GitHub repository.

---

## 1. What it does

- **8 subtree layout modes:** `Balanced`, `Center`, `Left`, `Right`, `Alternate`,
  `AlternateLeft`, `AlternateRight`, `Matrix`.
- **4 orientations:** `TopToBottom`, `BottomToTop`, `LeftToRight`, `RightToLeft`.
- Absolutely-positioned HTML cards + SVG orthogonal connectors.
- Pan, zoom, node dragging (with optional grid snapping), manual offsets.
- Expand / collapse, search + highlight, fit-to-screen, re-layout.
- **Orthogonal connector waypoints** — click a line, drag/add/delete bend points.
- **Export:** JSON (layout state), SVG (vector), PNG (high-DPI raster), PDF (print).
- Optional `localStorage` persistence of the whole working state.
- Dynamic font-fit so long labels shrink instead of overflowing.
- Multi-format JSON import (flat array, `{nodes}`, nested `{tree}`, recursive API tree).

> React is **not** included yet. The engine is framework-independent, so a React
> wrapper can be added later without touching the core.

---

## 2. Install

This package builds itself on install (a `prepare` script runs Vite), **and** the
built `dist/` is committed to the repo — so it works with or without the build step.

```bash
# Private GitHub over SSH
npm install git+ssh://git@github.com/MY_USERNAME/local-org-chart.git

# Private GitHub shorthand (default branch)
npm install github:MY_USERNAME/local-org-chart#main

# Pinned to a version tag
npm install github:MY_USERNAME/local-org-chart#v1.0.0

# From a local folder (monorepo / sibling checkout)
npm install ../local-org-chart
```

**Vue is a peer dependency** (optional). Plain-JS / core users don't need it:

```bash
npm install vue   # only if you use the Vue wrapper
```

---

## 3. Build / develop

```bash
npm install        # installs devDeps; the prepare script also builds dist/
npm run build      # rebuild dist/ (Vite library mode)
npm run dev        # Vite dev server (for hacking on the package)
npm run pack-local # build + npm pack -> a local .tgz tarball
```

Build output (`dist/`):

| File | Purpose |
|------|---------|
| `local-org-chart.js` / `.cjs` | main entry (core + vanilla factory) |
| `core.js` / `.cjs` | framework-independent engine |
| `vanilla.js` / `.cjs` | plain-JS renderer |
| `vue.js` / `.cjs` | Vue 3 component + plugin |
| `local-org-chart.css` | shared stylesheet |

---

## 4. Use in Vue 3 (and Quasar / Vite)

```js
import { OrgChart } from 'local-org-chart/vue'
import 'local-org-chart/style.css'
```

```vue
<template>
  <div style="height: 80vh">
    <OrgChart
      ref="chart"
      :nodes="nodes"
      orientation="TopToBottom"
      subtree-mode="Balanced"
      @node-click="onNodeClick"
      @layout-change="onLayoutChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { OrgChart } from 'local-org-chart/vue'
import 'local-org-chart/style.css'

const chart = ref(null)
const nodes = ref([
  { id: 'root', type: 'department', label: 'EXECUTIVE OFFICE' },
  { id: 'a', parentId: 'root', type: 'position', label: 'MANAGER', personName: 'JANE DOE', status: 'FILLED' },
])

function onNodeClick(e) { console.log('clicked', e.id) }
function onLayoutChange(e) { console.log('layout', e.mode, e.orientation) }

// call instance methods through the ref:
function fit() { chart.value.fitToScreen() }
function exportSvg() { chart.value.exportSVG() }
</script>
```

The container element **must have a height** — the chart fills its parent.

### Global plugin registration

```js
import { createApp } from 'vue'
import LocalOrgChart from 'local-org-chart/vue'
import 'local-org-chart/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(LocalOrgChart)   // now <OrgChart /> works anywhere, no local import
app.mount('#app')
```

---

## 5. Use in plain JavaScript / HTML / Laravel Blade

```js
import { createOrgChart } from 'local-org-chart/vanilla'
import 'local-org-chart/style.css'

const chart = createOrgChart(document.getElementById('chart'), {
  nodes,
  orientation: 'TopToBottom',
  subtreeMode: 'Balanced',
})

chart.on('node-click', (e) => console.log(e.id))
```

In a Laravel Blade view you would import the same way from your bundler (Vite/Mix),
or reference the built ESM file directly with `<script type="module">`.

---

## 6. Use the core engine only (no DOM, no Vue)

```js
import { layoutOrgChart, searchNodes, calculateBounds, fitBounds } from 'local-org-chart/core'

const { positioned, posById, bounds } = layoutOrgChart(nodes, {
  orientation: 'LeftToRight',
  subtreeMode: 'Matrix',
})
// positioned = [{ node, cx, cy, w, h, parentId, routeType }, ...]
```

Use this to compute coordinates yourself (server-side, in a worker, in another
framework, for tests, etc.). The core never touches the DOM or `window`.

---

## 7. Importing the CSS

```js
import 'local-org-chart/style.css'
```

All classes are prefixed `loc-` and scoped under the chart root `.loc-root`, so they
won't collide with your app's styles. The main `local-org-chart` entry does **not**
auto-inject CSS (so pure-core users stay lean) — import the stylesheet yourself when
you render a chart.

---

## 8. Vue props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `Array` | `[]` | flat node list (see schema below) |
| `orientation` | `String` | `'TopToBottom'` | one of the 4 orientations |
| `subtreeMode` | `String` | `'Balanced'` | one of the 8 subtree modes |
| `spacingX` | `Number` | `40` | horizontal gap |
| `spacingY` | `Number` | `70` | vertical gap |
| `enableDragging` | `Boolean` | `true` | allow node drag |
| `enablePan` | `Boolean` | `true` | allow canvas pan |
| `enableZoom` | `Boolean` | `true` | allow wheel zoom |
| `readonly` | `Boolean` | `false` | disable drag / waypoint edit / collapse |
| `fitOnInit` | `Boolean` | `true` | frame the chart on mount |
| `toolbar` | `Boolean` | `true` | show the built-in toolbar |
| `persist` | `Boolean` | `false` | mirror state to `localStorage` |
| `storageKey` | `String` | `'local-org-chart.state'` | persistence key |

Props are watched — changing `nodes`, `orientation`, `subtreeMode`, spacing, or the
feature flags updates the chart automatically (no manual re-init). When changing
`nodes`, replace the array reference (don't mutate it in place).

## 9. Vue events

`node-click`, `node-select`, `node-drag-start`, `node-drag`, `node-drag-end`,
`layout-change`, `orientation-change`, `subtree-mode-change`.

Each payload includes the relevant `{ id, node, ... }`.

## 10. Methods (Vue ref / vanilla instance)

`fitToScreen()`, `relayout()`, `expandAll()`, `collapseAll()`, `toggleCollapse(id)`,
`centerOnNode(id)`, `search(query)`, `clearSearch()`, `setOrientation(o)`,
`setSubtreeMode(m)`, `setSpacing(x, y)`, `setNodes(nodes)`, `loadJSON(data)`,
`exportJSON(download?)`, `exportSVG()`, `exportPNG(scale?)`, `exportPDF()`,
`getState()`, `getNodes()`, `getPositioned()`, `on(name, cb)`, `off(name, cb)`,
`destroy()`.

`destroy()` removes all DOM created by the chart and every event listener — call it
when you tear the chart down (the Vue wrapper does this automatically on unmount).

### Node schema

```js
{
  id: 'unique-id',           // required
  parentId: 'parent-id',     // '' / omitted => a root
  type: 'department' | 'position',
  label: 'TITLE',
  personName: 'NAME',        // position cards
  status: 'FILLED' | 'VACANT' | 'UNFUNDED',
  width: 230, height: 64,    // optional; sensible defaults per type
  collapsed: false,
  layoutMode: null,          // optional per-node subtree override
  data: { photo_url: 'https://…' }  // optional; photo box for positions
}
```

---

## 11. Install strategy (why `dist/` is committed)

Installing from GitHub runs the package's `prepare` script, which builds `dist/`
fresh. **In addition**, the prebuilt `dist/` is committed to the repo. This is
deliberate belt-and-suspenders:

- If the consumer's install runs lifecycle scripts (the default), `prepare` rebuilds
  `dist/` from source — always current.
- If the consumer installs with `--ignore-scripts`, the committed `dist/` is still
  there and the `exports` map resolves to it — the package still works.

So the package is robust whether or not the build runs on install.

---

## 12. Notes before uploading to GitHub

- The repo is safe to push: **no real data**, no `.env`, no `node_modules`, no private
  URLs, no real names/photos. The only sample data lives in `examples/` and is generic.
- `package.json` has `"private": true` to prevent accidental `npm publish`.
- Vue is a **peerDependency** and is never bundled into `core`/`vanilla`.
- `.gitignore` excludes `node_modules`, env files, logs, and caches (but **keeps**
  `dist/`, intentionally — see §11).
- After uploading, tag releases (`git tag v1.0.0 && git push --tags`) so consumers can
  pin with `github:MY_USERNAME/local-org-chart#v1.0.0`.

---

## Project structure

```
local-org-chart/
├── package.json          exports map, peerDeps (vue), prepare script, private:true
├── vite.config.js        Vite library build (4 entries, css, vue external)
├── index.d.ts            TypeScript types
├── README.md
├── .gitignore
├── dist/                 built output (committed)
├── examples/             generic demos (vanilla-demo.html, vue-demo.html, sample-data.js)
└── src/
    ├── index.js          main entry (core + vanilla)
    ├── core/             framework-independent engine (no DOM/Vue/window)
    ├── vanilla/          plain-JS renderer + createOrgChart()
    ├── vue/              Vue 3 component + plugin
    └── styles/           org-chart.css (prefixed loc-*)
```
