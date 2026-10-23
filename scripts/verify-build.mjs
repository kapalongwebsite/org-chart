import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const files = (await readdir(root)).filter((name) => /\.(?:js|cjs)$/.test(name));
assert.ok(files.length > 0, 'Build the library before verifying its package.');
for (const name of files) {
  const content = await readFile(join(root, name), 'utf8');
  assert.doesNotMatch(content, /node_modules\/(?:dompurify|jspdf|svg2pdf\.js)\//,
    `${name} must not embed a separately audited PDF dependency.`);
  assert.doesNotMatch(content, /DOMPurify|purify\.(?:es|cjs)[-\.]/,
    `${name} must not contain a hidden sanitizer copy.`);
}
const print = await readFile(join(root, 'print.js'), 'utf8');
assert.match(print, /import\(["']jspdf["']\)/, 'PDF export must resolve the installed jsPDF package.');
assert.match(print, /import\(["']svg2pdf\.js["']\)/, 'SVG conversion must resolve the installed package.');
console.log(`Verified ${files.length} library modules: PDF dependencies remain external.`);
