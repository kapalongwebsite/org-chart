import { readFileSync, readdirSync } from 'node:fs';

const DIR = new URL('./charts/', import.meta.url);

/** Anonymised real office charts, `{ name, nodes }`, ordered chart-01…chart-NN. */
export function loadRealCharts() {
  return readdirSync(DIR).filter((file) => file.endsWith('.json')).sort()
    .map((file) => JSON.parse(readFileSync(new URL(file, DIR), 'utf8')));
}

export function loadGolden(name) {
  return JSON.parse(readFileSync(new URL(`./goldens/${name}.json`, import.meta.url), 'utf8'));
}
