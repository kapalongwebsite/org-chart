import test from 'node:test';
import assert from 'node:assert/strict';
import {
  layoutPrintChart,
  normalizePrintProfile,
  recommendPrintLayout,
  renderPrintChartSvg,
} from '../src/print/index.js';
import { buildVisibleConnectorSegments } from '../src/core/connectorGeometry.js';

const nodes = [
  { id: 'head', type: 'position', label: 'Municipal Information Officer', personName: 'Alex Example', data: { printRole: 'head' } },
  { id: 'section-a', parentId: 'head', type: 'department', label: 'Information Services' },
  { id: 'person-a', parentId: 'section-a', type: 'position', label: 'Writer', personName: 'Jamie Sample' },
  { id: 'section-b', parentId: 'head', type: 'department', label: 'Public Assistance' },
  { id: 'person-b', parentId: 'section-b', type: 'position', label: 'Assistant', personName: 'Taylor Sample' },
];

test('normalizes a physical print profile without inferring dimensions', () => {
  assert.throws(() => normalizePrintProfile({ layoutFamily: 'portrait-sectioned' }), /width and height/i);
  const profile = normalizePrintProfile({ widthMm: 914.4, heightMm: 2438.4, layoutFamily: 'portrait-sectioned', preferredUnit: 'ft' });
  assert.equal(profile.widthMm, 914.4);
  assert.equal(profile.preferredUnit, 'ft');
});

test('recommends family from canvas shape and tree topology', () => {
  assert.equal(recommendPrintLayout(nodes, { widthMm: 2400, heightMm: 900 }).family, 'wide-row');
  const deep = Array.from({ length: 6 }, (_, index) => ({ id: `n${index}`, parentId: index ? `n${index - 1}` : '', type: 'position' }));
  assert.equal(recommendPrintLayout(deep, { widthMm: 900, heightMm: 2400 }).family, 'portrait-spine');
});

test('lays out a readable chart inside the configured physical content box', () => {
  const result = layoutPrintChart(nodes, {
    widthMm: 914.4,
    heightMm: 2438.4,
    safeMarginMm: 30,
    headerHeightMm: 260,
    footerHeightMm: 120,
    layoutFamily: 'portrait-sectioned',
  });
  assert.equal(result.ok, true);
  assert.ok(result.transform.scale > 0);
  assert.ok(result.effectiveFontMm >= result.profile.minFontMm);
  assert.equal(result.positioned.length, nodes.length);
});

test('blocks an unreadable dense export with a useful diagnostic', () => {
  const dense = Array.from({ length: 150 }, (_, index) => ({ id: `n${index}`, parentId: index ? 'n0' : '', type: 'position', label: 'Long position title', personName: 'Long employee name' }));
  const result = layoutPrintChart(dense, { widthMm: 300, heightMm: 500, safeMarginMm: 20, layoutFamily: 'wide-row' });
  assert.equal(result.ok, false);
  assert.ok(result.diagnostics.some((item) => item.code === 'text-too-small'));
});

test('serializes an exact-dimension standalone SVG with chart geometry', () => {
  const result = layoutPrintChart(nodes, { widthMm: 900, heightMm: 2400, layoutFamily: 'portrait-sectioned' });
  const svg = renderPrintChartSvg(result, { ariaLabel: 'MIO official chart' });
  assert.match(svg, /width="900mm"/);
  assert.match(svg, /data-print-chart="true"/);
  assert.match(svg, /MIO official chart/);
  assert.doesNotMatch(svg, /<script/i);
  const connectorPaths = [...svg.matchAll(/<path d="([^"]+)" fill="none" stroke=/g)].map((match) => match[1]);
  assert.equal(buildVisibleConnectorSegments(connectorPaths).length, connectorPaths.length,
    'print output must not repaint overlapping shared connector intervals');
});

test('wide official tarp uses AutoSmart and keeps a large mixed office readable', () => {
  const denseOffice = [{ id: 'office', type: 'department', label: 'Office' }];
  for (let index = 0; index < 17; index += 1) {
    denseOffice.push({ id: `direct-${index}`, parentId: 'office', type: 'position', label: `Direct staff ${index + 1}` });
  }
  for (const [group, count] of [['administration', 7], ['special-programs', 4]]) {
    denseOffice.push({ id: group, parentId: 'office', type: 'department', label: group });
    for (let section = 0; section < count; section += 1) {
      const sectionId = `${group}-section-${section}`;
      denseOffice.push({ id: sectionId, parentId: group, type: 'department', label: `Section ${section + 1}` });
      for (let person = 0; person < 3; person += 1) {
        denseOffice.push({ id: `${sectionId}-${person}`, parentId: sectionId, type: 'position', label: `Staff ${person + 1}` });
      }
    }
  }

  const result = layoutPrintChart(denseOffice, {
    widthMm: 2400,
    heightMm: 1500,
    safeMarginMm: 50,
    headerHeightMm: 250,
    footerHeightMm: 100,
    layoutFamily: 'wide-row',
  });

  assert.equal(result.ok, true);
  assert.equal(result.cfg.subtreeMode, 'AutoSmart');
  assert.equal(result.positioned.length, denseOffice.length);
  assert.ok(result.effectiveFontMm >= result.profile.minFontMm);
  assert.ok(!result.diagnostics.some((item) => item.code === 'node-overlap'));
  const usedWidthRatio = result.bounds.w * result.transform.scale / result.contentBox.width;
  const usedHeightRatio = result.bounds.h * result.transform.scale / result.contentBox.height;
  assert.ok(Math.min(usedWidthRatio, usedHeightRatio) >= 0.8, 'AutoSmart should use both dimensions of the target content box');
});
