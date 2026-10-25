// Regenerates test/fixtures/goldens/chart-NN.json from test/fixtures/charts/.
// Only run this for an intended geometry change; performance work must keep
// the goldens identical.
//
//   node test/fixtures/build-real-chart-goldens.mjs
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { layoutOrgChart } from '../../src/core/layout.js';
import { snapshotGeometry, GOLDEN_OPTIONS } from './geometry.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(HERE, 'goldens');
mkdirSync(outDir, { recursive: true });
const files = readdirSync(path.join(HERE, 'charts')).filter((file) => file.endsWith('.json')).sort();
for (const file of files) {
  const chart = JSON.parse(readFileSync(path.join(HERE, 'charts', file), 'utf8'));
  writeFileSync(path.join(outDir, file), JSON.stringify(snapshotGeometry(layoutOrgChart(chart.nodes, GOLDEN_OPTIONS))) + '\n');
}
console.log(`wrote ${files.length} goldens`);
