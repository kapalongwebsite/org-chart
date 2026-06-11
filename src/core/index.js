// local-org-chart/core — framework-independent layout engine.
// No Vue, no DOM, no window. Import these to compute a layout yourself.
export {
  VIRTUAL_ROOT_ID, SNAKE_STUB, CANVAS_PAD,
  SUBTREE_MODES, ORIENTATIONS, DEFAULTS, DEPT_SIZE, POS_SIZE,
} from './constants.js';

export {
  indexNodes, buildTree, getVisibleTree, visibleDepths, computeDepths, childCount,
} from './tree.js';

export {
  layoutOrgChart, applyOrientation, normalizeConfig, isHorizontal, lw, lh,
} from './layout.js';

export {
  routeConnector, waypointPath, edgeEndpoints, edgeControlPoints, orthoThrough, effCenter,
} from './connectors.js';

export { searchNodes } from './search.js';
export { calculateBounds, fitBounds } from './bounds.js';
export {
  makeNode, normalizeImported, convertNestedTree, convertMoTree, isMoArray, personNameFromPos,
} from './dataImport.js';
export { exportLayout } from './exportLayout.js';
export { buildChartSVG } from './svgExport.js';
