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
function setTop() { chart.value.setOrientation('TopToBottom') } // also accepts 'Top'
function showGrid() { chart.value.setShowGrid(true) }
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
| `maxZoom` | `Number` | `4` | how far the wheel can zoom in |
| `readonly` | `Boolean` | `false` | disable drag / waypoint edit / collapse |
| `inspector` | `Boolean` | `true` | open the built-in drawer on node click; `false` = headless (emit `node-select` only) |
| `inspectorTarget` | `String \| Element` | `null` | mount the inspector drawer into an element outside the canvas |
| `settingsTarget` | `String \| Element` | `null` | mount the settings drawer into an element outside the canvas |
| `fullscreenControl` | `Boolean` | `true` | show the floating fullscreen button on the canvas |
| `fitOnLayoutChange` | `Boolean \| String` | `true` | re-frame after a mode/orientation/re-layout change: `true`/`'fit'`, `'recenter'` (keep zoom), `false`/`'none'` |
| `showImages` | `Boolean` | `true` | show person photos; off (or a missing/broken photo) → a user-silhouette icon |
| `photoHeight` | `Number` | `104` | person-photo height in px — uniform across cards; larger = bigger profile image |
| `cardWidth` | `Number` | `180` | person-card width in px (global; card height = `photoHeight` + a fixed text block) |
| `photoContain` | `Boolean` | `true` | fit the **whole** profile image inside the photo area (no crop); `false` = cover/crop |
| `autoEdgeSide` | `Boolean` | `false` | opt-in "smart edges": connector endpoints follow waypoints onto any box side (left/right/top/bottom) |
| `legend` | `Boolean` | `false` | show the floating legend (type / status / active theme rules) |
| `legendTarget` | `String \| Element` | `null` | mount the legend into an element outside the canvas |
| `userSearch` | `Function` | `null` | `(query, node) => Promise<user[]> \| user[]` — turns the inspector's **Person name** field into a typeahead backed by your API |
| `userToFields` | `Function` | `null` | `(user, node) => patch` — map a chosen user to node fields (default: name/title/photo_url) |
| `snapAlign` | `Boolean` | `true` | while dragging, snap to the parent's connector axis + sibling centers (with guide lines) |
| `fitOnInit` | `Boolean` | `true` | frame the chart on mount |
| `toolbar` | `Boolean` | `true` | show the built-in toolbar |
| `persist` | `Boolean` | `false` | mirror state to `localStorage` |
| `storageKey` | `String` | `'local-org-chart.state'` | persistence key |

Props are watched — changing `nodes`, `orientation`, `subtreeMode`, spacing, or the
feature flags updates the chart automatically (no manual re-init). When changing
`nodes`, replace the array reference (don't mutate it in place).

## 9. Vue events

`node-click`, `node-select`, `node-drag-start`, `node-drag`, `node-drag-end`,
`layout-change`, `orientation-change`, `subtree-mode-change`, `edit-mode-change`,
`node-change`, `settings-change`, `inspector-open`/`-close`, `settings-open`/`-close`,
`fullscreen-change`, `history-change` (`{ canUndo, canRedo }`), `attach-start`/`attach-cancel`,
`user-select` (`{ id, user, node }` — a typeahead pick), `presets-change`, `preset-load`,
`selection-change` (`{ ids, primary }` — node multi-select), `legend-change`,
`edges-select` (`{ ids }` — connector-line marquee), `edges-reset` (`{ ids }` — lines straightened).

Each payload includes the relevant `{ id, node, ... }`.

## 10. Methods (Vue ref / vanilla instance)

All methods are available on:
- **Vue:** `chartRef.value.method()` (where `const chartRef = ref(null)` on `<OrgChart ref="chartRef" />`)
- **Vanilla:** `chart.method()` (from `const chart = createOrgChart(el, opts)`)

### View / Layout

| Method | Description |
|--------|-------------|
| `fitToScreen()` | Zoom & pan to frame all visible nodes |
| `relayout()` | Recalculate layout; clears manual offsets & waypoints |
| `resetView()` | Clear search + relayout + fit (one-stop view reset) |
| `expandAll()` | Expand every collapsed node |
| `collapseAll()` | Collapse every non-root node with children |
| `toggleCollapse(id)` | Toggle a single node's collapsed state |
| `centerOnNode(id)` | Pan to center a specific node in the viewport |

### Fullscreen

| Method | Description |
|--------|-------------|
| `enterFullscreen()` | Request fullscreen for the chart root |
| `exitFullscreen()` | Leave fullscreen |
| `toggleFullscreen(force?)` | Toggle, or force a specific state; returns the intended state |
| `isFullscreen()` | Whether the chart root is the fullscreen element |

> A **Fullscreen** toolbar button and a floating canvas-corner button are shown by
> default; emit a `fullscreen-change` event on change. Hide the floating button with
> `fullscreenControl: false`.

### Search

| Method | Description |
|--------|-------------|
| `search(query)` | Highlight nodes matching `query`; returns match count |
| `clearSearch()` | Remove search highlighting |

### Orientation / Subtree

| Method | Description |
|--------|-------------|
| `setOrientation(o)` | `TopToBottom`, `BottomToTop`, `LeftToRight`, `RightToLeft`; aliases `Top`, `Bottom`, `Left`, `Right` |
| `setSubtreeMode(m)` | `'Balanced'` · `'Center'` · `'Left'` · `'Right'` · `'Alternate'` · `'AlternateLeft'` · `'AlternateRight'` · `'Matrix'` (API-only — see note) |
| `setSpacing(x?, y?)` | Adjust horizontal / vertical gap between nodes |

> **Note on `Matrix`:** it's accepted by the API but **not shown in the toolbar / inspector**,
> because with uniform-height cards it lays out identically to `Balanced`. It only differs when
> nodes at the same level have different heights (it locks each depth to one uniform row).

### Undo / Redo

| Method | Description |
|--------|-------------|
| `undo()` / `redo()` | Step back / forward through edits |
| `canUndo()` / `canRedo()` | Whether a step is available (for enabling buttons) |

> Every node & connector edit — move, field change, add/delete, attach/detach, waypoint/anchor
> edit, collapse — is one undo step (typing into a field coalesces into one). Toolbar **Undo**/
> **Redo** buttons (the `history` toolbar group) and **Ctrl/⌘+Z** / **Ctrl/⌘+Shift+Z** (or
> **Ctrl+Y**) when the chart has focus. A `history-change` event fires with `{ canUndo, canRedo }`.

### Images

| Method | Description |
|--------|-------------|
| `setShowImages(on?)` | Toggle person photos (no arg = toggle); off → user-silhouette icon |
| `isShowingImages()` | Current state |

> Also a **Images** toolbar button and a Settings checkbox. When a photo URL is missing or fails
> to load, the user-silhouette icon is drawn automatically regardless of this setting.

### Card size & long text

Cards are a fixed, uniform size; tune them globally (Settings → **Card size**, the options, or the
API). The photo "tops" the card at its full height and the card height tracks it
(`height = photoHeight + text block`), so all cards stay the same size.

| Method | Description |
|--------|-------------|
| `setCardWidth(px)` | Person-card width (default 180) |
| `setPhotoHeight(px)` | Photo height (default 104) — bigger = larger profile image |
| `setPhotoContain(on?)` | Show the **whole** photo (no crop, default) vs. crop/cover |
| `setCardSize({ width, photoHeight, contain })` | Set any/all in one call |

> Long names and titles **don't stretch the card** — the name clamps to 2 lines, the title to 3,
> both auto-shrink to fit and show the full text on hover. Set **`photoContain: false`** if you'd
> rather crop photos to fill the area edge-to-edge.

### Expand / collapse

Each box that has children shows a **`+` / `−`** handle centered on its **bottom edge** (hover for an
"Expand"/"Collapse" hint). `−` = expanded, `+` = collapsed (subtree hidden). Collapsing hides the
**whole** subtree below that node. Toggling a node **does not re-flow the rest of the chart** — the
other boxes stay exactly where they are, so an accidental collapse won't scramble your layout. Use
**Re-layout** (or `relayout()`) to reflow everything on purpose.

### Multi-select & group move

**Ctrl/⌘+click** a node to add/remove it from the selection; **Ctrl/⌘+drag** on empty canvas draws
a **marquee** box (hold **Shift** to extend). Dragging any selected node **moves the whole group**.

| Method | Description |
|--------|-------------|
| `getSelection()` | Array of selected node ids |
| `setSelection(ids)` | Replace the selection (string or string[]) |
| `clearSelection()` | Clear it |

> Listen to `selection-change` (`{ ids, primary }`). The *primary* node (the last one added) drives
> the inspector and the connector highlight.

### Connector-line multi-select (marquee)

**Alt + drag** on empty canvas rubber-bands **connector lines** (hold **Shift** to extend); the
picked lines highlight. Press **Delete** to **straighten** them (drop their waypoints/anchors) or
**Esc** to deselect. (Node marquee stays on **Ctrl/⌘ + drag** — Alt selects lines, Ctrl selects nodes.)

| Method | Description |
|--------|-------------|
| `getEdgeSelection()` | Array of selected connector ids (the child-node id of each edge) |
| `setEdgeSelection(ids)` | Replace the line selection |
| `clearEdgeSelection()` | Clear it |
| `resetSelectedEdges()` | Straighten the selected lines (remove waypoints + endpoint anchors) |

> Listen to `edges-select` (`{ ids }`) and `edges-reset` (`{ ids }`).

### Legend

| Method | Description |
|--------|-------------|
| `setShowLegend(on?)` / `toggleLegend(force?)` | Show/hide the floating legend (no arg = toggle) |
| `isShowingLegend()` | Current state |

> The legend auto-lists the node **types**, **statuses** and **active theme rules** in the data.
> Toggle it with the **Legend** toolbar button or `legend: true`. Mount it outside the canvas with
> `legendTarget`, or replace its body with the Vue **`#legend`** slot (gets `{ nodes, settings, close }`).

### Smart edges (`autoEdgeSide`)

By default a connector's endpoints stay on the orientation's axis — top/bottom in a vertical chart,
left/right in a horizontal one — so dragging a waypoint only ever flips an endpoint between top and
bottom. Turn on **`autoEdgeSide`** (option, **Settings → "Smart edges"**, or `setAutoEdgeSide(true)`)
and each endpoint instead picks whichever box side **faces its nearest waypoint** — drag a waypoint
to the left and the line exits the **left** edge. Opt-in, so the classic look is unchanged by default.
(Dragging the endpoint square itself to a side still works in any mode.)

### Person-name typeahead (your backend API)

Pass a `userSearch` function and the inspector's **Person name** field becomes a typeahead — as
you type it calls your API and shows a dropdown; picking a result fills the node.

```js
createOrgChart(el, {
  editMode: true,
  // (query, node) => Promise<user[]> | user[]
  userSearch: async (q) => {
    const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
    return res.json(); // e.g. [{ id, name, title, photo_url }, ...]
  },
  // optional: control how a picked user maps onto the node (default shown)
  userToFields: (u) => ({ personName: u.name, label: u.title, photo_url: u.photo_url }),
});
```

In Vue: `<OrgChart :user-search="searchUsers" @user-select="onPick" />`. The default mapper reads
`name`/`personName`, `title`, and `photo_url`/`avatar`/`image` — return your own patch from
`userToFields` for anything else.

### Layout presets

Save the current arrangement and re-apply it later — so an accidental subtree/orientation change
(which reflows the chart) can't lose your work. A **Presets** section is built into the Settings
drawer (name + **Save**, a *positions* toggle for full vs pattern-only, and an Apply/delete list).

| Method | Description |
|--------|-------------|
| `saveLayoutPreset(name, { full })` | Save current layout to `localStorage` (`full` default `true` = include manual positions) |
| `loadLayoutPreset(name)` | Apply a saved preset |
| `deleteLayoutPreset(name)` | Remove a preset |
| `listLayoutPresets()` | `[{ name, full, savedAt }]` |
| `getLayoutPresets()` | The raw preset map (to sync to your backend) |
| `getLayout({ full })` | A portable layout object — **POST it to your backend** |
| `applyLayout(obj)` | Apply a layout object fetched back from your backend |

Presets live under `localStorage` key `${storageKey}.presets`, independent of `persist`. Events:
`presets-change` (`{ presets }`) and `preset-load` (`{ name, preset }`).

> A **full** preset captures the manual positions, connector edits, node edits and collapsed state;
> a **pattern** preset is just the view config (mode, orientation, spacing, grid, theme). An
> accidental mode change is *also* recoverable with **Undo / Ctrl+Z** (the undo snapshot now
> includes the view config).

> **Custom preset UI.** The built-in panel is fully replaceable. In Vue, the **`#settings`** slot
> gives you the whole settings body — render your own save/apply controls with the methods above and
> the `presets-change` event (e.g. wired to your backend). The API is headless, so you can also put a
> preset picker in the **`#toolbar`** slot or any separate component.
> ```vue
> <OrgChart ref="chart" :nodes="nodes" @presets-change="syncToBackend">
>   <template #settings>
>     <input v-model="name" placeholder="Preset name" />
>     <button @click="chart.saveLayoutPreset(name)">Save</button>
>     <button v-for="p in chart?.listLayoutPresets()" :key="p.name" @click="chart.loadLayoutPreset(p.name)">
>       {{ p.name }}
>     </button>
>   </template>
> </OrgChart>
> ```

### Grid

| Method | Description |
|--------|-------------|
| `setShowGrid(on)` | Toggle the grid overlay |
| `setSnapToGrid(on)` | Toggle snap-to-grid during node drag |
| `setAlignToGrid(on)` | Toggle grid-aligned layout positions |
| `toggleGrid(force?)` | Toggle the grid overlay, or force a specific state |

> These methods call `setOption()` under the hood. You can also use
> `setOption('showGrid', true)` etc. directly.

### Edit / Inspector / Settings

| Method | Description |
|--------|-------------|
| `setEditMode(on)` | Enable/disable edit mode (drag nodes, edit fields) |
| `isEditMode()` | Returns current edit-mode state |
| `updateNode(id, patch)` | Merge `patch` into a node's data |
| `addChild(parentId)` | Create a new child node (edit mode only) |
| `deleteNode(id)` | Delete a node + its descendants (edit mode only) |
| `reparentNode(id, newParentId)` | Re-wire a node's parent — **connection only, no relayout** (positions are kept) |
| `detachNode(id)` | Detach from parent (remove the connection); nothing moves |
| `attachNode(id, parentId)` | Attach under a parent (add the connection); nothing moves |
| `beginAttach(id)` / `cancelAttach()` | Interactive attach: after `beginAttach`, the next node click becomes `id`'s parent |
| `openInspector(id)` | Open the right slide-in panel for a node |
| `closeInspector()` | Close the inspector panel |
| `nodeScreenRect(id)` | The node's on-screen rectangle (viewport coords), or `null` |
| `getSettings()` | Get current settings (spacing, grid, theme rules) |
| `setSettings(s)` | Apply settings (merges; fires `settings-change`) |
| `toggleSettings(force?)` | Toggle the left settings panel |
| `resetSettings()` | Restore spacing / grid / theme rules to the as-configured defaults |

### Data

| Method | Description |
|--------|-------------|
| `setNodes(nodes, meta?)` | Replace node data programmatically |
| `loadJSON(data)` | Import from export format; returns node count |
| `getState()` | Snapshot of internal state (zoom, pan, mode, etc.) |
| `getNodes()` | Get a copy of the current node array |
| `getPositioned()` | Get the positioned layout result |

### Export

| Method | Description |
|--------|-------------|
| `exportPNG(scale?)` | Download a high-DPI PNG (default scale = 3). **async** → `Promise<boolean>` |
| `exportSVG()` | Download an SVG. **async** → `Promise<string>` |
| `exportWebP(options?)` | **Render a WebP and return it** (Blob or data-URL) — for upload/API, no download. **async** |
| `exportPDF()` | Open a print-ready SVG in a new tab. **async** → `Promise<boolean>` |
| `exportJSON(download?)` | Export full layout state as JSON; returns the object |
| `buildSVG(raster?)` | Build the raw SVG string synchronously (no photo embedding) |

> **Photos are embedded** in exports as base64 data URLs, so they show up in the SVG/PNG/PDF even
> when the file is opened offline. The three download methods are **async** because they load the
> photos first — `await chart.exportPNG()`. For this to work the image host must allow cross-origin
> reads (send `Access-Control-Allow-Origin`); a photo that blocks CORS falls back to the placeholder
> dot. `buildSVG()` stays synchronous and just references the external photo URLs.

#### `exportWebP()` — for the website (no buttons)

`exportWebP()` is for generating a display image programmatically and sending it to your backend —
it **resolves** the encoded image instead of triggering a download, so it can run anywhere in your
app and be POSTed to an API for storage/download:

```js
// Blob (default) → upload to your API
const blob = await chart.exportWebP();              // ~scale 2, quality .82: sharp but small
if (blob) {
  const form = new FormData();
  form.append('chart', blob, 'org-chart.webp');
  await fetch('/api/org-chart/snapshot', { method: 'POST', body: form });
}

// or a data-URL string (e.g. to store inline / preview)
const dataUrl = await chart.exportWebP({ as: 'dataURL', quality: 0.9 });

// tune size vs. quality, or also save a local file
await chart.exportWebP({ scale: 2, quality: 0.8, maxSide: 3000, download: true });
```

Options: `scale` (px multiplier, default `2`), `quality` (`0..1`, default `0.82`), `maxSide` (clamp
the longest side in px, default `4000`), `as` (`'blob'` | `'dataURL'`), `download` (`true` to also
save a file) and `filename`. Resolves `null` if the browser can't encode WebP or a CORS taint blocks
rasterization. Same CORS rule as above for the embedded photos.

### Customizing the drawers (inspector & settings)

Both slide-in drawers are optional and relocatable, and behave the same way:

- **Inspector** (right): `inspector: false` is **headless** — the drawer never opens; each node
  click still fires `node-select` with `{ id, node, rect }` so you can render your own panel
  anywhere. `inspectorTarget: '#my-panel'` mounts the managed drawer into an element **outside
  the canvas**. Vue: the `#inspector` slot teleports your own body in.
- **Settings** (left): `settingsTarget: '#my-settings'` mounts the settings drawer outside the
  canvas; `settingsSlot` / the Vue `#settings` slot supplies a custom body. It emits
  `settings-open` / `settings-close`, and has a built-in **Reset** button (`resetSettings()`).

A relocated drawer renders inline in its host element (flagged `loc-panel-external`) instead of
overlaying the canvas.

### Requested toolbar support

Supported: all subtree modes (`Balanced`, `Center`, `Left`, `Right`, `Alternate`,
`AlternateLeft`, `AlternateRight`, `Matrix`), all four orientations, fit, re-layout,
reset, expand/collapse, search, show grid, snap to grid, align to grid, edit mode,
settings panel, **fullscreen**, PNG, SVG, PDF, JSON export, JSON import, and raw SVG
generation.

Current no-op / unsupported list: none for the requested toolbar features. PDF export
uses the browser print dialog from a generated SVG rather than a binary PDF writer.

### Generic / Advanced

| Method | Description |
|--------|-------------|
| `setOption(key, val)` | Set any engine option by key |
| `on(name, cb)` | Subscribe to chart events |
| `off(name, cb)` | Unsubscribe from chart events |
| `instance()` | *(Vue only)* Access the underlying vanilla `OrgChartInstance` |
| `destroy()` | *(vanilla only)* Remove all DOM + listeners |

### Vue toolbar example

```vue
<template>
  <div style="height: 100vh">
    <!-- use :toolbar="false" to hide the built-in one, build your own -->
    <OrgChart ref="chartRef" :nodes="nodes" :toolbar="false" />
    <div class="my-toolbar">
      <button @click="chartRef.fitToScreen()">Fit</button>
      <button @click="chartRef.relayout()">Re-layout</button>
      <button @click="chartRef.resetView()">Reset</button>
      <button @click="chartRef.toggleFullscreen()">Fullscreen</button>
      <button @click="chartRef.expandAll()">Expand</button>
      <button @click="chartRef.collapseAll()">Collapse</button>
      <button @click="chartRef.setOrientation('LeftToRight')">Left→Right</button>
      <button @click="chartRef.setSubtreeMode('Alternate')">Alternate</button>
      <button @click="chartRef.setShowGrid(true)">Show Grid</button>
      <button @click="chartRef.setEditMode(true)">Edit</button>
      <button @click="chartRef.exportPNG()">PNG</button>
      <button @click="chartRef.exportSVG()">SVG</button>
      <button @click="chartRef.exportPDF()">PDF</button>
      <button @click="chartRef.exportJSON()">JSON</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { OrgChart } from 'local-org-chart/vue'
import 'local-org-chart/style.css'

const chartRef = ref(null)
const nodes = ref([/* your node data */])
</script>
```

**TypeScript tip:** use the `OrgChartVueInstance` type for autocomplete:
```ts
import type { OrgChartVueInstance } from 'local-org-chart'
const chartRef = ref<OrgChartVueInstance | null>(null)
```


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

## 13. Editing, inspector & theming

**Edit mode** — toggle the toolbar **Edit** button (or `:edit-mode` prop / `setEditMode(true)`).
When ON you can drag nodes, edit connector waypoints, and edit fields in the panel. When OFF
the chart is view-only and clicking a node shows a read-only info panel.

**Inspector panel** — clicking a node slides in a panel (right) with its fields. In edit mode the
fields are editable (live), with **+ Add child** and **Delete**. Every edit emits `node-change`
and is persisted as an overlay on top of your prop data.

**Settings panel** — the toolbar **Settings** button opens a panel (left) with layout sliders
(spacing, grid size) and a **theme-rule** editor.

**Conditional theming** — recolor nodes by rule. Each rule matches a node `field = value` and sets
background / text / border colors. Example via the API:
```js
chart.setSettings({
  themeRules: [
    { field: 'type',   value: 'department', style: { bg: '#e0524d', text: '#ffffff' } }, // all departments red
    { field: 'status', value: 'VACANT',     style: { text: '#b25a14', border: '#b25a14' } },
    { field: 'level',  value: 'division',    style: { bg: '#e0524d' } },                  // matches node.data.level
  ],
});
```
`field` can be `type` / `status` / `id` / `label` or any `node.data.*` key (e.g. `level`, `unit`).
Later matching rules win. In Vue, pass `:settings="{ themeRules: [...] }"` (watched) and listen to
`@settings-change`. Settings + rules persist to localStorage and are included in Export JSON.

### Extra props / events / methods (added)
- Props: `editMode`, `inspector`, `settings`.
- Events: `edit-mode-change`, `node-change`, `settings-change`.
- Methods: `setEditMode`, `updateNode(id, patch)`, `addChild(parentId)`, `deleteNode(id)`,
  `openInspector(id)`, `closeInspector()`, `getSettings()`, `setSettings(s)`, `toggleSettings()`.

## 14. Controlling the toolbar & Vue slots

**Show/hide toolbar groups** — `toolbar` accepts `true` (all), `false` (none), or an object to
pick groups: `subtree`, `orient`, `history` (Undo/Redo), `actions`, `search`, `grid`, `mode`, `export`. This toggles
whole **groups** (not individual buttons) and keeps the built-in styling.
```html
<!-- hide the Grid and Export groups, keep the rest -->
<OrgChart :nodes="nodes" :toolbar="{ grid: false, export: false }" />
```

**Fully custom toolbar — the `#toolbar` slot.** For total control of *which* buttons appear,
their **CSS**, labels, order, and **how they handle data**, render your own bar with the
`#toolbar` slot. Providing the slot **auto-hides** the built-in toolbar. The slot receives
`{ chart, state }` — `chart` is the full API, `state` is a live snapshot for active states.
```vue
<template>
  <OrgChart :nodes="nodes">
    <template #toolbar="{ chart, state }">
      <div class="my-bar">
        <!-- include ONLY the buttons you want, styled however you like -->
        <button class="my-btn" @click="chart.fitToScreen()">Fit</button>
        <button class="my-btn" @click="chart.resetView()">Reset</button>
        <button class="my-btn" :class="{ on: state.editMode }"
                @click="chart.setEditMode(!state.editMode)">
          {{ state.editMode ? 'Done' : 'Edit' }}
        </button>
        <select class="my-select" :value="state.subtreeMode"
                @change="chart.setSubtreeMode($event.target.value)">
          <option>Balanced</option><option>Alternate</option><option>Matrix</option>
        </select>
        <input class="my-search" placeholder="Search…"
               @input="chart.search($event.target.value)" />
        <button class="my-btn" @click="chart.exportSVG()">SVG</button>
      </div>
    </template>
  </OrgChart>
</template>

<script setup>
import { ref } from 'vue'
import { OrgChart } from 'local-org-chart/vue'
import 'local-org-chart/style.css'
const nodes = ref([/* … */])
</script>

<style scoped>
.my-bar { display: flex; gap: 6px; padding: 8px; }
.my-btn { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; cursor: pointer; }
.my-btn.on { background: #2563eb; color: #fff; border-color: #1d4ed8; }
.my-search, .my-select { padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
</style>
```
Common `chart` methods for buttons: `fitToScreen()`, `resetView()`, `relayout()`, `expandAll()`,
`collapseAll()`, `setOrientation(o)`, `setSubtreeMode(m)`, `setEditMode(on)`, `toggleFullscreen()`,
`search(q)`, `toggleSettings()`, `exportSVG()/exportPNG()/exportPDF()/exportJSON()`. Read
`state.subtreeMode` / `state.orientation` / `state.editMode` / `state.zoom` for active styling.

**Vue slots** (teleported into the engine — the auto-layout still owns positioning):

```vue
<OrgChart :nodes="nodes" :edit-mode="editMode">
  <!-- replace each node card; engine still sizes/positions/drags it -->
  <template #node="{ node, selected, editMode, themeStyle, update, select }">
    <div class="my-card" :class="{ sel: selected }" :style="themeStyle" @click="select">
      <strong>{{ node.label }}</strong>
      <small v-if="node.type !== 'department'">{{ node.personName }}</small>
    </div>
  </template>

  <!-- replace the toolbar (built-in one is auto-suppressed) -->
  <template #toolbar="{ chart, state }">
    <button @click="chart.fitToScreen()">Fit</button>
    <button @click="chart.setSubtreeMode('Alternate')">Alternate</button>
    <span>mode: {{ state.subtreeMode }}</span>
  </template>

  <!-- custom inspector panel body -->
  <template #inspector="{ node, editMode, update, close }">
    <input :value="node.label" :disabled="!editMode" @input="update({ label: $event.target.value })" />
    <button @click="close">Close</button>
  </template>

  <!-- custom settings panel body -->
  <template #settings="{ settings, update, reset, close }">
    <input type="range" min="0" max="200" :value="settings.spacingX" @input="update({ spacingX: +$event.target.value })" />
    <button @click="reset">Reset</button>
    <button @click="close">Close</button>
  </template>

  <!-- shown when nodes is empty -->
  <template #empty>No data yet.</template>
</OrgChart>
```

Slot props: `#node` gets `{ node, selected, editMode, themeStyle, update(patch), select() }`;
`#toolbar` gets `{ chart, state }`; `#inspector` gets `{ node, editMode, update(patch), close() }`;
`#settings` gets `{ settings, update(s), reset(), close() }`.
`themeStyle` is the resolved theme-rule style for that node, so your custom card can honor the
Settings theming. A custom `#node` slot replaces the default card; the engine keeps doing layout,
connectors, pan/zoom, drag, and the collapse toggle. See `examples/vue-slots-demo.html`.

## 15. Connection anchors & re-parenting (edit mode)

Select a connector in **edit mode** and you get, besides the waypoint dots:
- **Endpoint squares** — drag where the line meets a box (a per-edge anchor on the box perimeter).
- **Parent-end square** (filled) — drag it **onto another box to re-parent** that node (changes
  `parentId`, the tree relays out; cycles are prevented). **Double-click** it to **detach** the node
  (make it a root). There's also a **Detach** button in the inspector footer.

These stay tree-consistent — re-parenting moves a node under a new parent; it does **not** create
arbitrary cross-links (a tree layout can't auto-place those). Anchors persist + export; re-parent /
detach are saved as `parentId` edits in the node overlay. Methods: `reparentNode(id, newParentId)`,
`detachNode(id)`. Re-parent/detach also fire `node-change` (with `reparented: true`).

## 16. Pushing this to your private GitHub repo

This folder is ready to push as-is (no build needed first — `dist/` is committed).

```bash
cd local-org-chart
git init
git add .
git commit -m "local-org-chart v1.0.0"

# create an EMPTY private repo on GitHub first (no README), then:
git remote add origin git@github.com:MY_USERNAME/local-org-chart.git
git branch -M main
git push -u origin main

# tag the release so consumers can pin a version
git tag v1.0.0
git push --tags
```

Optional: set the `repository` field in `package.json` to your repo URL.

Then install it from any project:
```bash
npm install github:MY_USERNAME/local-org-chart#v1.0.0      # pinned
npm install github:MY_USERNAME/local-org-chart#main        # latest
npm install git+ssh://git@github.com/MY_USERNAME/local-org-chart.git
```

**Safe to push:** no `node_modules`, no `.env`, no real data / names / photos / private URLs;
`.gitignore` excludes build/cache junk but keeps `dist/` (see §11).

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
