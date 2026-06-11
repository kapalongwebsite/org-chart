// Build the serializable layout payload — pure (no DOM, no download).
// The vanilla/Vue layers handle the actual file download.
export function exportLayout(state, nodes, manualOffsets, edgeWaypoints) {
  return {
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
