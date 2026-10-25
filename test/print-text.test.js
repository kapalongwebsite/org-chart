import test from 'node:test';
import assert from 'node:assert/strict';
import { measureText, unsupportedCharacters } from '../src/print/helveticaMetrics.js';
import { clampLines, fitTextBlocks, wrapByWidth } from '../src/print/textLayout.js';

test('the PDF font table covers Filipino names and WinAnsi punctuation only', () => {
  assert.deepEqual(unsupportedCharacters('JOSÉ ÑAÑEZ PÉREZ-IBÁÑEZ — “Acting” €'), []);
  assert.deepEqual(unsupportedCharacters('Mā Ĝ ●'), ['ā', 'Ĝ', '●']);
  assert.ok(measureText('W', 10, 'bold') > measureText('i', 10, 'bold'));
});

test('wrapping helpers keep every line inside the width', () => {
  const lines = wrapByWidth('SUPERCALIFRAGILISTICEXPIALIDOCIOUS officer', 20, 5, 'bold');
  assert.ok(lines.length > 1);
  for (const line of lines) assert.ok(measureText(line, 5, 'bold') <= 20);
  const clamped = clampLines(['one two', 'three four', 'five'], 2, 20, 5);
  assert.equal(clamped.truncated, true);
  assert.equal(clamped.lines.length, 2);
  assert.match(clamped.lines[1], /…$/);
});

test('hyphenated names break after the hyphen before breaking inside a word', () => {
  const lines = wrapByWidth('PÉREZ-IBÁÑEZ', measureText('PÉREZ-IBÁÑEZ', 5, 'bold') * 0.7, 5, 'bold');
  assert.deepEqual(lines, ['PÉREZ-', 'IBÁÑEZ']);
});

test('stacked text shrinks to the floor before it is truncated', () => {
  const blocks = [
    { key: 'name', text: 'Ana Cruz', fontSize: 6, weight: 'bold', maxLines: 2 },
    { key: 'title', text: 'Administrative Officer IV Records Section', fontSize: 5, weight: 'normal' },
  ];
  const roomy = fitTextBlocks(blocks, 40, 40, 4);
  assert.equal(roomy.truncated, false);
  assert.equal(roomy.scale, 1);
  const tight = fitTextBlocks(blocks, 20, 12, 4);
  assert.equal(tight.groups[1].fontSize, 4);
  const used = tight.groups.reduce((sum, group) => sum + group.lines.length * group.fontSize * 1.15, 0);
  assert.ok(used <= 12 + 1e-9);
  assert.equal(tight.truncated, true);
});
