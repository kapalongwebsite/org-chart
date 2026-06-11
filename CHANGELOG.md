# Changelog

All notable changes to **local-org-chart**. This is a private package (not published to npm);
versions are tags in the private GitHub repo (e.g. `v1.0.0`).

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
