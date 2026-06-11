// local-org-chart/vue — Vue 3 component + plugin entry.
// Importing this pulls in the stylesheet too (or import 'local-org-chart/style.css').
import '../styles/org-chart.css';
import { OrgChart } from './OrgChart.js';

export { OrgChart };

// default export = installable plugin:  app.use(LocalOrgChart)
const LocalOrgChart = {
  install(app, options = {}) {
    app.component(options.name || 'OrgChart', OrgChart);
  },
};
export default LocalOrgChart;
