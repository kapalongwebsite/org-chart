// Builds the anonymised real-chart fixtures in test/fixtures/charts/ from
// public office org-chart payloads (`{ tree, layout }` JSON files).
//
//   node test/fixtures/build-real-charts.mjs <payload-dir> <private-map-file>
//
// The repository is public, so fixtures carry no real names, titles, offices
// or database ids. Each tree is flattened the way the consuming app does it,
// then every label becomes synthetic ("UNIT 7", "POSITION 31") and every id is
// renumbered. Only what the layout reads survives:
//   - head detection tests the label, so a label that matched keeps a
//     synthetic "OFFICE HEAD" suffix;
//   - family routing sorts parent ids, so new ids keep the original order.
// The chart-number → source mapping is written to <private-map-file>, which
// must stay outside the repository.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const HEAD_LABEL = /\b(municipal (vice )?mayor|office head|department head|head of office)\b/i;

export function flattenTree(tree) {
  const flat = [];
  function walk(node, parentId = null) {
    const id = `${node.type}-${node.id}`;
    const isContainer = node.type === 'office' || node.type === 'section' || node.type === 'organization'
      || node.meta?.node_kind === 'level';
    flat.push({
      id,
      parentId: parentId || '',
      type: isContainer ? 'department' : 'position',
      label: isContainer ? node.name || '(Unnamed)' : node.position || node.name || '(Unnamed)',
      status: node.type === 'vacant'
        ? 'VACANT'
        : (node.type === 'filled' || node.type === 'manual') ? 'FILLED' : undefined,
      data: {
        level: node.meta?.level,
        is_head: Boolean(node.is_head),
        printRole: node.is_head ? 'head' : isContainer ? 'level' : 'person',
      },
    });
    for (const child of node.children || []) walk(child, id);
  }
  for (const root of tree || []) walk(root);
  return flat;
}

export function anonymise(nodes) {
  const ordered = nodes.map((node) => node.id).sort((a, b) => a.localeCompare(b));
  const width = String(ordered.length).length;
  const idMap = new Map(ordered.map((id, index) => [id, 'n' + String(index + 1).padStart(width, '0')]));
  let units = 0, positions = 0;
  const anonymised = nodes.map((node) => {
    const base = node.type === 'department' ? `UNIT ${++units}` : `POSITION ${++positions}`;
    return {
      ...node,
      id: idMap.get(node.id),
      parentId: node.parentId ? idMap.get(node.parentId) : '',
      label: HEAD_LABEL.test(node.label) ? `${base} OFFICE HEAD` : base,
    };
  });
  return { nodes: anonymised, idMap };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [dir, mapFile] = process.argv.slice(2);
  if (!dir || !mapFile) throw new Error('usage: node test/fixtures/build-real-charts.mjs <payload-dir> <private-map-file>');
  const sources = readdirSync(dir).filter((file) => file.endsWith('.json'))
    .map((file) => ({ file, payload: JSON.parse(readFileSync(path.join(dir, file), 'utf8')) }))
    .filter(({ payload }) => Array.isArray(payload.tree) && payload.tree.length)
    .sort((a, b) => createHash('sha256').update(a.file).digest('hex')
      .localeCompare(createHash('sha256').update(b.file).digest('hex')));
  const outDir = path.join(HERE, 'charts');
  mkdirSync(outDir, { recursive: true });
  const map = {};
  sources.forEach(({ file, payload }, index) => {
    const name = 'chart-' + String(index + 1).padStart(2, '0');
    const { nodes, idMap } = anonymise(flattenTree(payload.tree));
    writeFileSync(path.join(outDir, name + '.json'), JSON.stringify({ name, nodes }) + '\n');
    map[name] = { source: file, ids: Object.fromEntries(idMap) };
  });
  writeFileSync(mapFile, JSON.stringify(map, null, 2) + '\n');
  console.log(`wrote ${sources.length} charts`);
}
