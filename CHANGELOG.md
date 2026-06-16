# Changelog

All notable changes to **local-org-chart**. This is a private package (not published to npm);
versions are tags in the private GitHub repo (e.g. `v1.0.0`).

## v1.10.0 — 2026-06-15

### Added
- **Multi-select + group move.** **Ctrl/⌘+click** toggles nodes in/out of a selection (Windows-11
  style); **Ctrl/⌘+drag** on empty canvas draws a **marquee** box that selects the nodes inside
  (hold **Shift** to add to the current selection). Dragging any selected node **moves the whole
  group together**. API: `getSelection()`, `setSelection(ids)`, `clearSelection()`, and a
  `selection-change` event (`{ ids, primary }`). The "primary" node still drives the inspector.
- **Legend (toggle on/off).** A floating legend that auto-lists the **node types**, **statuses**,
  and **active theme rules** present in the data. Toggle with the **Legend** toolbar button or
  `legend: true` / `setShowLegend()` / `toggleLegend()`. Mount it elsewhere with `legendTarget`, or
  replace its body via the Vue **`#legend`** slot. Emits `legend-change`; persisted.
- **Bigger, uniform profile photos.** The person-photo area is now larger by default and a fixed
  size on every card (so all photos render identically via cover-crop). Tune with `photoHeight`
  (px, default **104**) / `setPhotoHeight()`.

### Changed
- The default position-card height grew (150 → 172px) to fit the larger photo.

## v1.9.0 — 2026-06-15

### Added
- **Layout presets.** Save the current arrangement as a named preset and re-apply it later — so an
  accidental mode change can't lose your work. Built-in UI in the **Settings drawer** (name +
  **Save**, with a *positions* toggle for full vs pattern-only, and an Apply/delete list), plus a
  full API: `saveLayoutPreset(name, { full })`, `loadLayoutPreset(name)`, `deleteLayoutPreset(name)`,
  `listLayoutPresets()`, `getLayoutPresets()`. Presets live in `localStorage` (key
  `${storageKey}.presets`), independent of the `persist` flag. Events: `presets-change`, `preset-load`.
- **Backend round-trip.** `getLayout({ full })` returns a portable layout object to POST to your own
  API; `applyLayout(obj)` applies one you fetched back. (A *full* preset includes manual positions,
  connector edits, node edits and collapsed state; a *pattern* preset is just the view config.)
- **Custom preset UI.** The preset UI is fully replaceable — use the Vue **`#settings`** slot (or the
  headless API + `presets-change`) to render your own save/apply controls anywhere, e.g. wired to your
  backend.

### Changed
- **Subtree-mode / orientation / re-layout changes are now undoable.** The undo snapshot now also
  captures the view config (mode, orientation, spacing, grid, images, theme), so an accidental click
  that reflows the chart is restored in full by **Undo** / **Ctrl+Z** — not just the node positions.

## v1.8.0 — 2026-06-15

### Added
- **Undo / redo.** Every node & connector edit — move, field change, add/delete, attach/detach,
  waypoint/anchor edit, collapse — is now undoable. Toolbar **Undo**/**Redo** buttons (new
  `history` toolbar group), **Ctrl/⌘+Z** / **Ctrl/⌘+Shift+Z** (also **Ctrl+Y**) when the chart
  has focus, a `history-change` event, and `undo()` / `redo()` / `canUndo()` / `canRedo()`.
  Typing into a field coalesces into a single step.
- **Attach.** Counterpart to Detach. The inspector shows **Attach…** for a node with no parent —
  click it, then click a target node to wire it up. Also `attachNode(id, parentId)`,
  `beginAttach(id)`, `cancelAttach()`, and `attach-start` / `attach-cancel` events.
- **Click a node → its connections highlight.** Selecting a node now highlights every connector
  touching it (its parent edge + all child edges) so you can see where it connects.
- **Image toggle + user-icon placeholder.** A **Images** toolbar button (and a Settings checkbox /
  `showImages` option / `setShowImages()`) hides photos; when images are off — or a photo is
  missing or fails to load — a neutral **user-silhouette icon** is drawn as the placeholder.
- **API-backed person-name typeahead.** Supply `userSearch: (query, node) => Promise<user[]>`
  (e.g. fetch from your backend) and the inspector's **Person name** field becomes a typeahead;
  picking a result fills the node (name/title/photo by default, or via `userToFields`). Emits
  `user-select`.

### Changed
- **Detach / attach / re-parent no longer auto-layout.** They now *only add or remove the
  connection* — the boxes stay exactly where they are (positions are pinned). Use **Re-layout**
  to reflow from scratch.
- **Endpoint anchors ("blue box") snap to the grid** while dragging (like waypoints), and snap to
  **any of the four side midpoints** — left / right / top / bottom (previously top/bottom only).
- **Waypoint handles ("circle") snap on both axes** — to the parent/child center lines
  horizontally **and** vertically (previously horizontal only), with guide lines on both.

### Removed
- **The `Custom` subtree mode and department "banner" headers (from v1.7.0) were removed** — they
  weren't the right direction. The `targetSize` / `targetAspect` options and the Settings
  "Fill target" controls go with them. (The other modes are unchanged.)

## v1.7.0 — 2026-06-15

### Changed
- **Renamed the `RowWrap` mode → `Custom`** (toolbar button, mode value, types, docs). The
  fill-target options (`targetSize` / `targetAspect`) and grid connectors carry over unchanged.

### Added
- **Department banners in `Custom`.** A non-root `type:'department'` node with children now
  renders as a **wide banner bar spanning its block**, with its children laid out as **rows of
  cards** directly beneath it (TopToBottom). This gives the "banner over a row of cards" look of
  a designed departmental chart, with the grid channel connectors keeping lines off the boxes.

## v1.6.0 — 2026-06-15

### Added
- **RowWrap grid connectors** — connectors no longer cross under boxes in `RowWrap`. Each
  column gets a vertical bus in a reserved left channel, hung off a single trunk below the
  parent, with short stubs to each child. (TopToBottom; other orientations fall back to bus.)
- **Settings drawer "Fill target" control** — Width/Height inputs + Portrait/Landscape buttons
  to set the RowWrap fill shape live. Note: the fill target affects **RowWrap only** (the
  other modes have fixed shapes and ignore it).

## v1.5.0 — 2026-06-15

### Added
- **Alignment snapping (`snapAlign`, default on).** While dragging a node (or a connector
  waypoint), it snaps to the **parent's connector axis** and to **sibling center lines**, and a
  dashed **guide line** is shown while aligned — so edits stay tidy and connectors stay straight.
  Disable with `snapAlign: false` (vanilla option / Vue `:snap-align`). Independent of `snapGrid`.

## v1.4.0 — 2026-06-15

### Added
- **`RowWrap` subtree mode** (new toolbar button) — packs each parent's children into
  horizontal rows that wrap, then **auto-spreads to fill a target shape** so the chart uses
  space instead of running straight down. Tunable via:
  - `targetSize: { width, height }` — your output/tarp dimensions (any units); or
  - `targetAspect` (width / height), default **1.6** (landscape tarp).
  Also exposed as Vue props `:target-size` / `:target-aspect`.
  - **Note:** experimental — aspect fitting is coarse (fills *toward* the target, not exact),
    and deep single-child chains stay vertical. Banner-style group headers are a separate
    future item.

## v1.3.2 — 2026-06-15

### Changed
- **Removed `Matrix` from the picker UIs** (toolbar Subtree group + inspector layout-override
  dropdown). For uniform-height cards it lays out identically to `Balanced`, so it looked like a
  duplicate button. The mode is **still accepted by the API** (`setSubtreeMode('Matrix')` and a
  node's `layoutMode`) for mixed-height data — only the UI entries were dropped.

### Docs
- Added a complete **`#toolbar` slot** example (full custom toolbar: own buttons, CSS, data
  handling) and documented per-group vs full-custom toolbar control.

## v1.3.1 — 2026-06-15

### Fixed
- **`setNodes()` no longer wipes manual positions on a data refresh.** Manually-dragged node
  offsets, connector waypoints, and endpoint anchors now survive a `setNodes()` call by default
  (same as node field edits) — so a reactive `nodes`-prop change in the Vue wrapper, or any
  `setNodes()` without `meta`, keeps the user's layout instead of resetting it (which also
  previously overwrote the saved `localStorage` positions). Pass `{ resetEdits: true }` to clear
  them explicitly; `meta` (e.g. from `loadJSON` / a saved layout) still overrides as before.

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
