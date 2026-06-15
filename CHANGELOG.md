# Changelog

All notable changes to **local-org-chart**. This is a private package (not published to npm);
versions are tags in the private GitHub repo (e.g. `v1.0.0`).

## v1.3.0 — 2026-06-15

### Added
- **Settings drawer Reset** — a **Reset** button in the settings panel + `resetSettings()` method
  restore spacing / grid / theme rules to the as-configured defaults.
- **Settings drawer parity with the inspector** — `settingsTarget` (mount the settings panel
  into an element outside the canvas) and `settingsSlot` / Vue **`#settings`** slot (supply a
  custom panel body). New `settings-open` / `settings-close` events and `getSettingsBody()`.

## v1.2.1 — 2026-06-15

### Fixed
- **Grid now covers nodes dragged past the origin.** `sizeSvg()` tracked only the positive
  extent, so a node moved above/left of the origin (negative space) had no grid under it —
  most visible with **Show Grid** on (which hides the canvas fallback dots). It now measures
  the full bounding box (incl. negative coords) and positions the grid to cover it. The
  extent is also recomputed at drag-end, so the grid grows immediately, not only on refresh.

## v1.2.0 — 2026-06-15

### Added
- **`fitOnLayoutChange`** option — after a subtree-mode / orientation / re-layout change the
  view no longer gets "lost" off-screen. `true`/`'fit'` (default) re-frames the whole chart,
  `'recenter'` keeps your zoom and pans to it, `false`/`'none'` keeps the prior behavior.

## v1.1.0 — 2026-06-14

### Added
- **Fullscreen** — `enterFullscreen()`, `exitFullscreen()`, `toggleFullscreen(force?)`,
  `isFullscreen()`, a `fullscreen-change` event, a toolbar **Fullscreen** button, and a
  floating canvas-level button (opt out with `fullscreenControl: false`).
- **Toolbar** — wired a live **Search** box (`search` group) and a **Reset** button
  (`resetView`); added a `search` toolbar group flag.
- **Customizable inspector drawer** — `inspector: false` is now fully headless: the
  built-in drawer never opens and `node-select` carries a `rect` (the node's on-screen
  box) so you can render your own panel anywhere. `inspectorTarget` (selector or element)
  mounts the managed drawer into an element outside the canvas.
- `nodeScreenRect(id)` helper on the instance + Vue ref.

### Fixed
- **Waypoint edit handles** now sit on the *rendered orthogonal path* (via `orthoThrough`),
  so the add-waypoint dots and nearest-segment hit-testing line up with the drawn line.
- **Spine-route handles align by default** — for children that branch to the side (spine
  routes, e.g. `Alternate` mode) the selected-line endpoint square + add dots now land on
  the actual line on first selection, instead of floating off the box's top/bottom until
  dragged. (`edgeControlPoints` mirrors the auto route's side entry by `routeType`.)
- **Selecting a line shows its waypoints** even outside edit mode (read-only markers);
  the interactive add/endpoint handles still appear only in edit mode.
- **Panning no longer clears the selection** — a selected node/line stays selected while
  you pan; only a plain click on empty canvas clears it.
- **Orientation aliases** (`Top`/`Bottom`/`Left`/`Right`) now normalize consistently at
  *every* entry point — constructor, `setOrientation`, `setSettings`, `setNodes`/meta and
  restored state — not just some of them.

### Changed
- Removed redundant duplicate method names; each grid/view action has a single canonical
  name (`setShowGrid` / `setSnapToGrid` / `setAlignToGrid` / `toggleGrid`, `resetView`).

## v1.0.0 — 2026-06-10

First packaged release. A dependency-free organizational-chart engine extracted into a reusable
private package with a framework-independent core, a plain-JS renderer, and a Vue 3 wrapper.

### Core engine (framework-independent — no DOM / Vue / window)
- 8 subtree layout modes: Balanced, Center, Left, Right, Alternate, AlternateLeft,
  AlternateRight, Matrix.
- 4 orientations: TopToBottom, BottomToTop, LeftToRight, RightToLeft.
- Brick / masonry "running-bond" packing for the Alternate snake modes.
- Orthogonal connector routing (bus / spine), waypoint + anchor aware.
- Multi-format import (flat array, `{nodes}`, nested `{tree}`, recursive `{type,children}`).
- Pure helpers: `layoutOrgChart`, `searchNodes`, `calculateBounds`, `fitBounds`,
  `resolveNodeStyle`, `buildChartSVG`, `exportLayout`.

### Vanilla renderer (`createOrgChart`)
- Absolutely-positioned HTML cards + SVG connectors; pan, zoom, node dragging with grid snap.
- Search + highlight, expand/collapse, fit-to-screen, re-layout.
- Dynamic font-fit; photo-box person cards.
- Grid overlay + snap-on-drag + grid-quantized ("Align") layout.
- Export: SVG (vector), PNG (high-DPI), PDF (print), JSON (layout state).
- **Edit mode** gate; **inspector** side panel (edit fields, add child, delete, detach).
- **Settings** panel: spacing/grid sliders + **conditional theme rules**
  (match `type` / `status` / `level` / `data.*` → background / text / border).
- **Connector waypoints** (orthogonal) and **endpoint anchors** + **re-parent / detach**
  (tree-consistent; cycles prevented).
- **Granular toolbar control** — `toolbar` accepts per-group flags.
- **Comprehensive localStorage persistence** of the whole working state (opt-in via `persist`).
- `destroy()` removes all DOM + listeners.

### Vue 3 wrapper (`OrgChart` + plugin)
- Drives the same engine (no duplicated chart logic); props watched, engine events re-emitted.
- Slots via `<Teleport>`: `#node`, `#toolbar`, `#inspector`, `#empty`.
- Props: nodes, orientation, subtreeMode, spacingX/Y, enableDragging/Pan/Zoom, readonly,
  editMode, inspector, settings, fitOnInit, toolbar, persist, storageKey.
- Events: node-click/select/drag-*, layout-change, orientation-change, subtree-mode-change,
  edit-mode-change, node-change, settings-change.
- Ref methods for every engine action.

### Build / packaging
- Vite library mode, 4 entries (`.`, `./core`, `./vanilla`, `./vue`) × ESM + CJS, one CSS file.
- Vue is an external **peerDependency** (never bundled into core/vanilla).
- `dist/` committed **and** a `prepare` script rebuilds on install (works with or without scripts).
- `"private": true`, prefixed `loc-*` CSS scoped under `.loc-root`, no real data / URLs.
