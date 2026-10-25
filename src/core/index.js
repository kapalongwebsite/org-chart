// local-org-chart/core — framework-independent layout engine.
// No Vue, no DOM, no window. Import these to compute a layout yourself.
export {
  VIRTUAL_ROOT_ID, SNAKE_STUB, CANVAS_PAD,
  SUBTREE_MODES, ORIENTATIONS, DEFAULTS, DEPT_SIZE, POS_SIZE,
  VIRTUAL_PHOTO_FRAME, RENDERED_PHOTO, PHOTO_BACKGROUND, PERSON_TEXT_HEIGHT,
} from './constants.js';

export {
  indexNodes, buildTree, getVisibleTree, visibleDepths, computeDepths, childCount,
  findInvalidNodes, invalidNodeDataError,
} from './tree.js';

export {
  layoutOrgChart, applyOrientation, normalizeConfig, isHorizontal, lw, lh,
} from './layout.js';

export {
  routeConnector, waypointPath, edgeEndpoints, edgeControlPoints, edgeEditingWaypoints,
  orthoThrough, effCenter,
} from './connectors.js';

export { searchNodes } from './search.js';
export { calculateBounds, fitBounds } from './bounds.js';
export {
  makeNode, nodeInputProblems, normalizeImported, convertNestedTree, convertMoTree, isMoArray, personNameFromPos,
} from './dataImport.js';
export { exportLayout, LAYOUT_EXPORT_VERSION } from './exportLayout.js';
export { buildChartSVG, exportBounds, escapeXml } from './svgExport.js';
export { sanitizeView, sanitizeManualLayout, sanitizeSavedLayout } from './layoutData.js';
export {
  buildVisibleConnectorSegments, buildFamilyConnectorNetwork, resolveConnectorGeometry,
} from './connectorGeometry.js';
export {
  DEFAULT_SETTINGS, normalizeSettings, normalizeRule, resolveNodeStyle, isSafeColor, invalidRuleColors,
} from './theme.js';
