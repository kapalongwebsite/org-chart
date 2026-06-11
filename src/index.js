// local-org-chart — main entry.
// Exposes the framework-independent core AND the plain-JS factory. No CSS side
// effect here (so pure core users stay lean); when you use createOrgChart,
// import the stylesheet too:  import 'local-org-chart/style.css'.
export * from './core/index.js';
export { createOrgChart } from './vanilla/createOrgChart.js';
