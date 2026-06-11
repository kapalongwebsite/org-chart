// local-org-chart/vanilla — plain-JS renderer entry.
// Importing this also pulls in the stylesheet so bundlers include it; you can
// alternatively import 'local-org-chart/style.css' explicitly.
import '../styles/org-chart.css';
export { createOrgChart } from './createOrgChart.js';
// convenience re-export of the framework-independent core
export * from '../core/index.js';
