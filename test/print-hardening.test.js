import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers/dom.mjs';
import {
  layoutPrintChart,
  normalizePrintProfile,
  preparePrintPhotos,
  printPdfPageGeometry,
  printPhotoPixelSize,
  renderPrintChartFragment,
  renderPrintChartSvg,
  sanitizePrintLayout,
  svgElementToPdfBlob,
  MAX_EMBEDDED_IMAGE_CHARS,
} from '../src/print/index.js';
import { measureText, unsupportedCharacters } from '../src/print/helveticaMetrics.js';

const PROFILE = { widthMm: 1200, heightMm: 900, layoutFamily: 'wide-row', minFontMm: 2.5 };

function office(extra = []) {
  return [
    { id: 'head', type: 'position', label: 'Municipal Mayor', personName: 'Alex Example', data: { printRole: 'head', photo_url: 'https://example.test/head.png' } },
    { id: 'admin', parentId: 'head', type: 'department', label: 'Administrative Division' },
    { id: 'clerk', parentId: 'admin', type: 'position', label: 'Clerk', personName: 'Jamie Sample' },
    { id: 'aide', parentId: 'admin', type: 'position', label: 'Aide', personName: 'Taylor Sample' },
    ...extra,
  ];
}

function cardGroup(svg, id) {
  const start = svg.indexOf(`<g data-node-id="${id}">`);
  assert.ok(start >= 0, `card ${id} rendered`);
  const next = svg.indexOf('<g data-node-id="', start + 1);
  return svg.slice(start, next < 0 ? svg.length : next);
}

function textLinesOf(group) {
  return [...group.matchAll(/<text x="([^"]+)" y="[^"]+" text-anchor="middle" font-family="[^"]+" font-size="([^"]+)" font-weight="(\d+)"[^>]*>([^<]*)<\/text>/g)]
    .map((match) => ({ cx: Number(match[1]), size: Number(match[2]), weight: Number(match[3]), text: match[4]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'") }));
}

async function pdfText(svg, profile) {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const blob = await svgElementToPdfBlob(doc.documentElement, profile);
  return Buffer.from(await blob.arrayBuffer()).toString('latin1');
}

test('PDF pages keep their exact physical size beyond the 5080 mm jsPDF page cap', async () => {
  for (const [widthMm, heightMm] of [[210, 297], [3048, 6096], [9000, 9000]]) {
    const geometry = printPdfPageGeometry(widthMm, heightMm);
    assert.ok(geometry.pageWidth <= 14400 && geometry.pageHeight <= 14400);
    const nodes = office().slice(0, 2);
    const layout = layoutPrintChart(nodes, { widthMm, heightMm, layoutFamily: 'portrait-sectioned', minFontMm: 2.5 });
    const pdf = await pdfText(renderPrintChartSvg(layout, { background: '#ffffff' }), layout.profile);
    const box = pdf.match(/\/MediaBox \[([\d.\s-]+)\]/)[1].trim().split(/\s+/).map(Number);
    const userUnit = Number((pdf.match(/\/UserUnit ([\d.]+)/) || [])[1] || 1);
    const physicalWidth = (box[2] - box[0]) * userUnit / 72 * 25.4;
    const physicalHeight = (box[3] - box[1]) * userUnit / 72 * 25.4;
    assert.ok(Math.abs(physicalWidth - widthMm) < 0.5, `${widthMm} mm wide, got ${physicalWidth.toFixed(1)}`);
    assert.ok(Math.abs(physicalHeight - heightMm) < 0.5, `${heightMm} mm high, got ${physicalHeight.toFixed(1)}`);
    if (userUnit !== 1) assert.match(pdf, /^%PDF-1\.6/);
  }
});

test('cards without a photo draw a vector placeholder instead of an unprintable glyph', () => {
  const nodes = office().map((node) => ({ ...node, data: { ...node.data, photo_url: undefined } }));
  const layout = layoutPrintChart(nodes, PROFILE);
  const svg = renderPrintChartFragment(layout);
  assert.doesNotMatch(svg, /●/);
  const clerk = cardGroup(svg, 'clerk');
  assert.match(clerk, /<circle /);
  assert.match(clerk, /<ellipse /);
});

test('characters the PDF fonts cannot draw produce a warning naming the entry', () => {
  assert.deepEqual(unsupportedCharacters('JOSÉ ÑAÑEZ PÉREZ-IBÁÑEZ — “Acting” €'), []);
  assert.deepEqual(unsupportedCharacters('Mā Ĝ'), ['ā', 'Ĝ']);
  const layout = layoutPrintChart(office([
    { id: 'macron', parentId: 'admin', type: 'position', label: 'Analyst', personName: 'Mā Santos' },
    { id: 'filipino', parentId: 'admin', type: 'position', label: 'Señora Officer', personName: 'JOSÉ ÑAÑEZ' },
  ]), PROFILE);
  const warnings = layout.diagnostics.filter((item) => item.code === 'unsupported-characters');
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].level, 'warning');
  assert.equal(warnings[0].nodeId, 'macron');
  assert.match(warnings[0].message, /Mā Santos/);
});

test('text wraps by measured width, breaks overlong words, and never reaches the photo', () => {
  const longTitle = 'MUN. GOVERNMENT DEPARTMENT HEAD I (MUNICIPAL ENVIRONMENT AND NATURAL RESOURCES OFFICER I)';
  const layout = layoutPrintChart(office([
    { id: 'long', parentId: 'admin', type: 'position', label: longTitle, personName: 'MARIA PÉREZ-IBÁÑEZ', data: { printRole: 'head' } },
  ]), PROFILE);
  assert.equal(layout.ok, true);
  const svg = renderPrintChartFragment(layout);
  const node = layout.positioned.find((item) => item.node.id === 'long').node;
  const group = cardGroup(svg, 'long');
  const lines = textLinesOf(group);
  const photoRight = Number(group.match(/<rect x="([^"]+)" y="[^"]+" width="([^"]+)" height="[^"]+" fill="#004264"/).slice(1, 3).reduce((x, w) => Number(x) + Number(w)));
  const available = node.width - Math.min(node.height - 10, 42) - 13;
  for (const line of lines) {
    const width = measureText(line.text, line.size, line.weight >= 600 ? 'bold' : 'normal');
    assert.ok(width <= available, `"${line.text}" fits the text column`);
    assert.ok(line.cx - width / 2 > photoRight, `"${line.text}" stays clear of the photo`);
  }
  assert.equal(lines.filter((line) => line.weight === 400).map((line) => line.text).join(' '), longTitle,
    'the complete official title is printed');
  assert.ok(!layout.diagnostics.some((item) => item.code === 'text-truncated'));
});

test('text that cannot fit is ellipsized and reported as truncated', () => {
  const huge = Array.from({ length: 60 }, (_, index) => `Responsibility${index}`).join(' ');
  const layout = layoutPrintChart(office([
    { id: 'huge', parentId: 'admin', type: 'position', label: huge, personName: 'Overflowing Title Holder' },
  ]), PROFILE);
  const warning = layout.diagnostics.find((item) => item.code === 'text-truncated');
  assert.equal(warning?.nodeId, 'huge');
  assert.match(warning.message, /Overflowing Title Holder/);
  const lines = textLinesOf(cardGroup(renderPrintChartFragment(layout), 'huge'));
  assert.match(lines.at(-1).text, /…$/);
  const node = layout.positioned.find((item) => item.node.id === 'huge').node;
  const used = lines.reduce((sum, line) => sum + line.size * 1.15, 0);
  assert.ok(used <= node.height - 6 + 1e-6, 'truncated text stays inside the card');
});

test('photos are prepared at the printed size and resolution', async () => {
  const layout = layoutPrintChart(office(), { ...PROFILE, dpi: 300 });
  const drawn = [];
  const sizes = [];
  const { photos, failed } = await preparePrintPhotos(layout, {
    'https://example.test/head.png': 'data:image/png;base64,source',
  }, {
    loadImage: async () => ({ naturalWidth: 4000, naturalHeight: 3000 }),
    createCanvas: (width, height) => {
      const canvas = {
        width, height,
        getContext: () => ({ fillRect() {}, drawImage: (...args) => drawn.push(args) }),
        toDataURL: (type) => `data:${type};base64,prepared-${width}`,
      };
      sizes.push(width);
      return canvas;
    },
  });
  const head = layout.positioned.find((item) => item.node.id === 'head').node;
  const expected = printPhotoPixelSize(Math.min(head.height - 10, 42) * layout.transform.scale, 300);
  assert.deepEqual(failed, []);
  assert.deepEqual(sizes, [expected]);
  assert.equal(photos['https://example.test/head.png'], `data:image/jpeg;base64,prepared-${expected}`);
  const [, x, y, width, height] = drawn[0];
  assert.ok(Math.abs(width - expected * 1.05) < 1e-6, 'contained in the 5% overscan box');
  assert.ok(Math.abs(x + width / 2 - expected / 2) < 1e-6 && Math.abs(y + height / 2 - expected / 2) < 1e-6, 'centred');

  const fragment = renderPrintChartFragment(layout, { preparedPhotos: photos });
  assert.match(cardGroup(fragment, 'head'), /href="data:image\/jpeg;base64,prepared-\d+"[^>]+preserveAspectRatio="none" clip-path="url\(#loc-print-photo-\d+\)"/);

  const broken = await preparePrintPhotos(layout, { 'https://example.test/head.png': 'data:,x' }, {
    loadImage: async () => { throw new Error('decode'); },
  });
  assert.deepEqual(broken.failed, ['https://example.test/head.png']);
});

test('unprepared photos are contained with a 5% overscan and clipped to the frame', () => {
  const layout = layoutPrintChart(office(), PROFILE);
  const head = cardGroup(renderPrintChartFragment(layout, { photoDataByUrl: { 'https://example.test/head.png': 'data:image/png;base64,raw' } }), 'head');
  const clip = head.match(/<clipPath id="([^"]+)"><rect x="([^"]+)" y="([^"]+)" width="([^"]+)"/);
  const image = head.match(/<image href="data:image\/png;base64,raw" x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" preserveAspectRatio="xMidYMid meet" clip-path="url\(#([^)]+)\)"/);
  assert.ok(clip && image);
  assert.equal(image[5], clip[1]);
  const frame = Number(clip[4]);
  assert.ok(Math.abs(Number(image[3]) - frame * 1.05) < 1e-6);
  assert.ok(Math.abs(Number(image[1]) + Number(image[3]) / 2 - (Number(clip[2]) + frame / 2)) < 1e-6);
});

test('oversized embedded photos fail with an actionable error instead of a stack overflow', async () => {
  const layout = layoutPrintChart(office(), PROFILE);
  const huge = 'data:image/png;base64,' + 'A'.repeat(MAX_EMBEDDED_IMAGE_CHARS);
  const svg = renderPrintChartSvg(layout, { photoDataByUrl: { 'https://example.test/head.png': huge } });
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  await assert.rejects(svgElementToPdfBlob(doc.documentElement, layout.profile), /photo for head is too large.*preparePrintPhotos/);
});

test('saved layouts accept only finite geometry and safe colours', () => {
  const { layout, issues } = sanitizePrintLayout({
    nodeOffsets: { clerk: { dx: '10', dy: 0 }, aide: { dx: 4, dy: -2 } },
    edgeWaypoints: { clerk: [{ x: 1, y: 'two' }], aide: [{ x: 5, y: 6 }] },
    edgeAnchors: { clerk: { p: { nx: 3, ny: 0 } } },
    edgeStyles: { clerk: { color: 'red" onload="alert(1)' }, aide: { color: '#123abc', widthMm: 2, pattern: 'dashed' } },
    options: { spacingX: 30, targetAspect: 9 },
  });
  assert.deepEqual(layout.nodeOffsets, { aide: { dx: 4, dy: -2 } });
  assert.deepEqual(layout.edgeWaypoints, { aide: [{ x: 5, y: 6 }] });
  assert.deepEqual(layout.edgeAnchors, {});
  assert.deepEqual(layout.edgeStyles, { aide: { color: '#123abc', widthMm: 2, pattern: 'dashed' } });
  assert.deepEqual(layout.options, { spacingX: 30 });
  assert.deepEqual(issues.sort(), ['edgeAnchors.clerk', 'edgeStyles.clerk', 'edgeWaypoints.clerk', 'nodeOffsets.clerk', 'options.targetAspect']);
  assert.deepEqual(normalizePrintProfile({ ...PROFILE, layout: {} }).layout, {}, 'absent keys are not invented');
});

test('an invalid saved layout blocks export and cannot inject markup', () => {
  const layout = layoutPrintChart(office(), {
    ...PROFILE,
    layout: { nodeOffsets: { clerk: { dx: '0"/><script>alert(1)</script><g x="', dy: 0 } } },
  });
  assert.equal(layout.ok, false);
  const diagnostic = layout.diagnostics.find((item) => item.code === 'invalid-saved-layout');
  assert.equal(diagnostic.level, 'error');
  assert.match(diagnostic.message, /nodeOffsets\.clerk/);
  const svg = renderPrintChartSvg(layout);
  assert.doesNotMatch(svg, /<script/i);
  for (const item of layout.positioned) assert.ok(Number.isFinite(item.cx) && Number.isFinite(item.cy));
});

test('connectors and bend points stay inside the content box', () => {
  const plain = layoutPrintChart(office(), PROFILE);
  const near = plain.positioned.find((item) => item.node.id === 'aide');
  const waypointX = near.cx + near.node.width;
  const layout = layoutPrintChart(office(), {
    ...PROFILE,
    layout: { edgeWaypoints: { aide: [{ x: waypointX, y: near.cy - near.node.height }, { x: waypointX, y: near.cy }] } },
  });
  assert.equal(layout.ok, true, JSON.stringify(layout.diagnostics));
  const { scale, x, y } = layout.transform;
  const box = layout.contentBox;
  for (const segment of layout.connectorSegments) {
    const numbers = segment.d.match(/-?\d+(?:\.\d+)?/g).map(Number);
    for (let index = 0; index < numbers.length; index += 2) {
      const px = x + numbers[index] * scale;
      const py = y + numbers[index + 1] * scale;
      assert.ok(px >= box.x - 1e-6 && px <= box.x + box.width + 1e-6, `x ${px} inside content box`);
      assert.ok(py >= box.y - 1e-6 && py <= box.y + box.height + 1e-6, `y ${py} inside content box`);
    }
  }

  const stray = layoutPrintChart(office(), {
    ...PROFILE,
    layout: { edgeWaypoints: { aide: [{ x: -100000, y: 0 }] } },
  });
  assert.equal(stray.ok, false);
  assert.match(stray.diagnostics.find((item) => item.code === 'stray-connector').message, /aide/);
});

test('XML-illegal control characters are removed from the print SVG', () => {
  const layout = layoutPrintChart(office([
    { id: 'ctl', parentId: 'admin', type: 'position', label: 'Clerk\u0001', personName: 'Ana\u0008Cruz￿' },
  ]), PROFILE);
  const svg = renderPrintChartSvg(layout, { ariaLabel: 'Chart\u000B' });
  assert.doesNotMatch(svg, /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/);
  assert.match(svg, /AnaCruz/);
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  assert.equal(doc.documentElement.tagName.toLowerCase(), 'svg');
});
