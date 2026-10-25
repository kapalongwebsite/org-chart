// Build the serializable layout payload — pure (no DOM, no download).
// The vanilla/Vue layers handle the actual file download.

// Version 2 files carry every manual map (offsets, waypoints, anchors, family
// routes, node overrides) and the full settings; version-1 files (no
// `version` field) carried offsets and waypoints only.
export const LAYOUT_EXPORT_VERSION = 2;

export function exportLayout(state, nodes, manualOffsets, edgeWaypoints) {
  return {
    version: LAYOUT_EXPORT_VERSION,
    orientation: state.orientation,
    subtreeMode: state.subtreeMode,
    spacingX: state.spacingX,
    spacingY: state.spacingY,
    zoom: state.zoom,
    panX: state.panX,
    panY: state.panY,
    manualOffsets: manualOffsets || {},
    edgeWaypoints: edgeWaypoints || {},
    nodes: nodes.map((n) => ({
      id: n.id, parentId: n.parentId, type: n.type, label: n.label,
      personName: n.personName, status: n.status,
      width: n.width, height: n.height, collapsed: n.collapsed,
      layoutMode: n.layoutMode, data: n.data,
    })),
  };
}
