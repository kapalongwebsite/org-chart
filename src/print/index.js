import { calculateBounds } from '../core/bounds.js';
import { routeConnector, effCenter } from '../core/connectors.js';
import { layoutOrgChart } from '../core/layout.js';

export const PRINT_LAYOUT_FAMILIES = Object.freeze([
  'portrait-sectioned',
  'wide-row',
  'portrait-spine',
  'custom',
]);

const FAMILY_OPTIONS = Object.freeze({
  'portrait-sectioned': { orientation: 'TopToBottom', subtreeMode: 'Balanced', spacingX: 26, spacingY: 42 },
  'wide-row': { orientation: 'TopToBottom', subtreeMode: 'Balanced', spacingX: 34, spacingY: 38 },
  'portrait-spine': { orientation: 'TopToBottom', subtreeMode: 'Alternate', spacingX: 28, spacingY: 34 },
  custom: { orientation: 'TopToBottom', subtreeMode: 'Custom', spacingX: 28, spacingY: 38 },
});

const DEFAULT_CARD = Object.freeze({ width: 82, height: 58 });
const LEVEL_CARD = Object.freeze({ width: 100, height: 30 });
const HEAD_CARD = Object.freeze({ width: 96, height: 70 });
const MIN_FONT_MM = 3.2;

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeXml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[char]);
}

function nodeRole(node) {
  if (node?.data?.printRole) return node.data.printRole;
  if (node?.data?.is_head || node?.data?.isHead) return 'head';
  return node?.type === 'department' ? 'level' : 'person';
}

function cardSize(node, overrides = {}) {
  const role = nodeRole(node);
  const base = role === 'head' ? HEAD_CARD : role === 'level' ? LEVEL_CARD : DEFAULT_CARD;
  const override = overrides[node.id] || {};
  return {
    width: clamp(finite(override.widthMm, base.width), 30, 300),
    height: clamp(finite(override.heightMm, base.height), 16, 220),
  };
}

function treeStats(nodes) {
  const byParent = new Map();
  const byId = new Map((nodes || []).map((node) => [String(node.id), node]));
  for (const node of nodes || []) {
    const parent = String(node.parentId || '');
    byParent.set(parent, (byParent.get(parent) || 0) + 1);
  }
  let maxDepth = 0;
  for (const node of nodes || []) {
    let depth = 0;
    let cursor = node;
    const seen = new Set();
    while (cursor?.parentId && byId.has(String(cursor.parentId)) && !seen.has(String(cursor.parentId))) {
      seen.add(String(cursor.parentId));
      depth += 1;
      cursor = byId.get(String(cursor.parentId));
    }
    maxDepth = Math.max(maxDepth, depth);
  }
  return {
    count: (nodes || []).length,
    maxDepth,
    maxChildren: Math.max(0, ...byParent.values()),
  };
}

export function recommendPrintLayout(nodes, canvas) {
  const widthMm = finite(canvas?.widthMm, 0);
  const heightMm = finite(canvas?.heightMm, 0);
  if (widthMm <= 0 || heightMm <= 0) throw new Error('Physical canvas dimensions are required.');

  const stats = treeStats(nodes);
  const aspect = widthMm / heightMm;
  let family;
  const reasons = [];

  if (aspect >= 1.3) {
    family = 'wide-row';
    reasons.push('The selected canvas is landscape or unusually wide.');
  } else if (stats.maxDepth >= 4 || (stats.count >= 18 && stats.maxChildren <= 5)) {
    family = 'portrait-spine';
    reasons.push('The chart is deep enough to benefit from a vertical spine.');
  } else {
    family = 'portrait-sectioned';
    reasons.push('The canvas is portrait and the chart has a compact hierarchy.');
  }

  if (stats.maxChildren >= 7 && family !== 'wide-row') {
    reasons.push('A wide sibling group may need a larger canvas or a manual override.');
  }

  return { family, reasons, stats, canvasAspect: aspect };
}

export function normalizePrintProfile(input = {}) {
  const widthMm = finite(input.widthMm, 0);
  const heightMm = finite(input.heightMm, 0);
  if (widthMm < 200 || widthMm > 10000 || heightMm < 200 || heightMm > 10000) {
    throw new Error('Print width and height must be between 200 mm and 10,000 mm.');
  }

  const layoutFamily = PRINT_LAYOUT_FAMILIES.includes(input.layoutFamily)
    ? input.layoutFamily
    : 'portrait-sectioned';
  const safeMarginMm = clamp(finite(input.safeMarginMm, 25), 0, Math.min(widthMm, heightMm) / 4);
  const headerHeightMm = clamp(finite(input.headerHeightMm, heightMm * 0.14), 0, heightMm / 3);
  const footerHeightMm = clamp(finite(input.footerHeightMm, heightMm * 0.06), 0, heightMm / 4);

  return {
    schemaVersion: 1,
    templateId: String(input.templateId || 'municipal-classic'),
    templateVersion: Math.max(1, Math.trunc(finite(input.templateVersion, 1))),
    widthMm,
    heightMm,
    safeMarginMm,
    headerHeightMm,
    footerHeightMm,
    preferredUnit: ['mm', 'cm', 'in', 'ft'].includes(input.preferredUnit) ? input.preferredUnit : 'mm',
    dpi: clamp(Math.trunc(finite(input.dpi, 150)), 72, 600),
    minFontMm: clamp(finite(input.minFontMm, MIN_FONT_MM), 2.5, 8),
    layoutFamily,
    layout: input.layout && typeof input.layout === 'object' ? input.layout : {},
  };
}

function contentBox(profile) {
  const x = profile.safeMarginMm;
  const y = profile.safeMarginMm + profile.headerHeightMm;
  return {
    x,
    y,
    width: profile.widthMm - profile.safeMarginMm * 2,
    height: profile.heightMm - profile.safeMarginMm * 2 - profile.headerHeightMm - profile.footerHeightMm,
  };
}

function overlapCount(positioned, offsets) {
  let count = 0;
  for (let i = 0; i < positioned.length; i += 1) {
    const a = positioned[i];
    const ac = effCenter(a, offsets);
    for (let j = i + 1; j < positioned.length; j += 1) {
      const b = positioned[j];
      const bc = effCenter(b, offsets);
      if (Math.abs(ac.x - bc.x) * 2 < a.node.width + b.node.width
        && Math.abs(ac.y - bc.y) * 2 < a.node.height + b.node.height) count += 1;
    }
  }
  return count;
}

export function layoutPrintChart(nodes, profileInput) {
  const profile = normalizePrintProfile(profileInput);
  const box = contentBox(profile);
  const diagnostics = [];
  if (box.width <= 0 || box.height <= 0) {
    return { ok: false, profile, contentBox: box, diagnostics: [{ level: 'error', code: 'invalid-content-box', message: 'Header, footer, and margins leave no room for the chart.' }] };
  }

  const overrides = profile.layout.nodeOverrides || {};
  const prepared = (nodes || []).map((node) => {
    const size = cardSize(node, overrides);
    return { ...node, width: size.width, height: size.height };
  });
  if (!prepared.length) {
    return { ok: false, profile, contentBox: box, diagnostics: [{ level: 'error', code: 'empty-chart', message: 'Add at least one chart entry before exporting.' }] };
  }

  const family = FAMILY_OPTIONS[profile.layoutFamily];
  const customOptions = profile.layout.options || {};
  const options = profile.layoutFamily === 'custom' ? { ...family, ...customOptions } : family;
  const layout = layoutOrgChart(prepared, options);
  const offsets = profile.layout.nodeOffsets || {};
  const bounds = calculateBounds(layout.positioned, offsets, 0);
  const scale = Math.min(box.width / bounds.w, box.height / bounds.h);
  const effectiveFontMm = 4.2 * scale;

  if (!Number.isFinite(scale) || scale <= 0) {
    diagnostics.push({ level: 'error', code: 'invalid-layout', message: 'The chart layout could not be measured.' });
  } else if (effectiveFontMm < profile.minFontMm) {
    diagnostics.push({
      level: 'error', code: 'text-too-small',
      message: `The fitted text would be about ${effectiveFontMm.toFixed(1)} mm high, below the ${profile.minFontMm.toFixed(1)} mm minimum. Increase the canvas, choose another layout, or reduce entries.`,
    });
  }

  const overlaps = overlapCount(layout.positioned, offsets);
  if (overlaps) diagnostics.push({ level: 'error', code: 'node-overlap', message: `${overlaps} chart card overlap${overlaps === 1 ? 's' : ''} must be resolved before export.` });
  if (scale > 2.5) diagnostics.push({ level: 'warning', code: 'sparse-chart', message: 'The chart occupies a small part of this canvas; review the preview before publishing.' });
  if (scale < 0.7 && !diagnostics.some((item) => item.code === 'text-too-small')) diagnostics.push({ level: 'warning', code: 'dense-chart', message: 'The chart is densely packed. Inspect names and positions at 100% before publishing.' });

  const translateX = box.x + (box.width - bounds.w * scale) / 2 - bounds.x * scale;
  const translateY = box.y + (box.height - bounds.h * scale) / 2 - bounds.y * scale;

  return {
    ok: !diagnostics.some((item) => item.level === 'error'),
    profile,
    contentBox: box,
    positioned: layout.positioned,
    posById: layout.posById,
    cfg: layout.cfg,
    offsets,
    edgeWaypoints: profile.layout.edgeWaypoints || {},
    edgeAnchors: profile.layout.edgeAnchors || {},
    edgeStyles: profile.layout.edgeStyles || {},
    bounds,
    transform: { scale, x: translateX, y: translateY },
    effectiveFontMm,
    diagnostics,
  };
}

function wrapText(value, maxChars) {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && next.length > maxChars) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function textLines(lines, cx, startY, fontSize, lineHeight, weight, color) {
  return lines.map((line, index) => `<text x="${cx}" y="${startY + index * lineHeight}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${color}">${escapeXml(line)}</text>`).join('');
}

function cardSvg(positioned, layout, options) {
  const node = positioned.node;
  const center = effCenter(positioned, layout.offsets);
  const x = center.x - node.width / 2;
  const y = center.y - node.height / 2;
  const role = nodeRole(node);
  const photos = options.photoDataByUrl || {};
  const photoUrl = node.data?.photo_url;
  const photo = photos[photoUrl] || (options.allowRemotePhotos ? photoUrl : null);
  const name = node.personName || node.data?.name || '';
  const title = node.label || '';

  if (role === 'level') {
    const lines = wrapText(title.toUpperCase(), Math.max(12, Math.floor(node.width / 4.2)));
    const font = Math.min(8, node.height / (lines.length + 1));
    const start = y + node.height / 2 - ((lines.length - 1) * font * 1.15) / 2 + font * 0.35;
    return `<g data-node-id="${escapeXml(node.id)}"><rect x="${x}" y="${y}" width="${node.width}" height="${node.height}" rx="3" fill="#0a5b5e" stroke="#073b3d" stroke-width="0.8"/>${textLines(lines, center.x, start, font, font * 1.15, 700, '#ffffff')}</g>`;
  }

  const accent = role === 'head' ? '#d8aa35' : '#0a5b5e';
  const photoSize = Math.min(node.height - 10, role === 'head' ? 42 : 32);
  const photoX = x + 5;
  const photoY = y + (node.height - photoSize) / 2;
  const textX = x + photoSize + 8 + (node.width - photoSize - 13) / 2;
  const maxChars = Math.max(10, Math.floor((node.width - photoSize - 16) / 3.7));
  const nameLines = wrapText(name || (node.status === 'VACANT' ? 'VACANT' : '—'), maxChars);
  const titleLines = wrapText(title, maxChars);
  const nameFont = role === 'head' ? 6.5 : 5.7;
  const titleFont = role === 'head' ? 5.2 : 4.7;
  const blockHeight = nameLines.length * nameFont * 1.15 + titleLines.length * titleFont * 1.15;
  let cursorY = y + (node.height - blockHeight) / 2 + nameFont * 0.8;
  let body = `<rect x="${x}" y="${y}" width="${node.width}" height="${node.height}" rx="3" fill="#ffffff" stroke="${accent}" stroke-width="${role === 'head' ? 1.4 : 0.8}"/>`;
  body += `<rect x="${x}" y="${y}" width="3.5" height="${node.height}" rx="1.7" fill="${accent}"/>`;
  body += photo
    ? `<image href="${escapeXml(photo)}" x="${photoX}" y="${photoY}" width="${photoSize}" height="${photoSize}" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="${photoX + photoSize / 2}" cy="${photoY + photoSize / 2}" r="${photoSize / 2}" fill="#e7eeec"/><text x="${photoX + photoSize / 2}" y="${photoY + photoSize * 0.68}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${photoSize * 0.5}" fill="#7b918d">●</text>`;
  body += textLines(nameLines, textX, cursorY, nameFont, nameFont * 1.15, 700, '#173334');
  cursorY += nameLines.length * nameFont * 1.15;
  body += textLines(titleLines, textX, cursorY, titleFont, titleFont * 1.15, 400, '#455b59');
  return `<g data-node-id="${escapeXml(node.id)}">${body}</g>`;
}

export function renderPrintChartFragment(layout, options = {}) {
  if (!layout?.positioned) throw new Error('A completed print layout is required.');
  const paths = [];
  for (const child of layout.positioned) {
    if (!child.parentId) continue;
    const parent = layout.posById[child.parentId];
    if (!parent) continue;
    const path = routeConnector(parent, child, layout.cfg, layout.offsets, layout.edgeWaypoints, layout.edgeAnchors[child.node.id]);
    const style = layout.edgeStyles[child.node.id] || {};
    const dash = style.pattern === 'dashed' ? ' stroke-dasharray="5 4"' : '';
    paths.push(`<path d="${path}" fill="none" stroke="${escapeXml(style.color || '#476965')}" stroke-width="${clamp(finite(style.widthMm, 1), 0.3, 5)}"${dash}/>`);
  }
  const cards = layout.positioned.map((item) => cardSvg(item, layout, options)).join('');
  const { x, y, scale } = layout.transform;
  return `<g data-print-chart transform="translate(${x} ${y}) scale(${scale})">${paths.join('')}${cards}</g>`;
}

export function renderPrintChartSvg(layout, options = {}) {
  const { widthMm, heightMm } = layout.profile;
  const background = options.background || 'transparent';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${widthMm}mm" height="${heightMm}mm" viewBox="0 0 ${widthMm} ${heightMm}" role="img" aria-label="${escapeXml(options.ariaLabel || 'Organizational chart')}"><rect width="${widthMm}" height="${heightMm}" fill="${escapeXml(background)}"/>${renderPrintChartFragment(layout, options)}</svg>`;
}

export async function svgElementToPdfBlob(svgElement, dimensions = {}) {
  if (!svgElement || String(svgElement.tagName).toLowerCase() !== 'svg') throw new Error('An SVG element is required.');
  const widthMm = finite(dimensions.widthMm, 0);
  const heightMm = finite(dimensions.heightMm, 0);
  if (widthMm <= 0 || heightMm <= 0) throw new Error('PDF width and height are required.');
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
  const pdf = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
    putOnlyUsedFonts: true,
  });
  await svg2pdf(svgElement, pdf, { xOffset: 0, yOffset: 0, scale: 1 });
  return pdf.output('blob');
}
