import { calculateBounds } from '../core/bounds.js';
import { routeConnector, effCenter } from '../core/connectors.js';
import { layoutOrgChart } from '../core/layout.js';
import { resolveConnectorGeometry } from '../core/connectorGeometry.js';
import { ORIENTATIONS, PHOTO_BACKGROUND, RENDERED_PHOTO, SUBTREE_MODES, VIRTUAL_PHOTO_FRAME } from '../core/constants.js';
import { unsupportedCharacters } from './helveticaMetrics.js';
import { fitTextBlocks, LINE_HEIGHT } from './textLayout.js';
import { preparePrintPhotosFor } from './photos.js';

export { printPhotoPixelSize, printPhotoPlacement, rasterizePrintPhoto, MAX_PRINT_PHOTO_PX } from './photos.js';

export const PRINT_LAYOUT_FAMILIES = Object.freeze([
  'portrait-sectioned',
  'wide-row',
  'portrait-spine',
  'custom',
]);

const FAMILY_OPTIONS = Object.freeze({
  'portrait-sectioned': { orientation: 'TopToBottom', subtreeMode: 'AutoSmart', spacingX: 26, spacingY: 42 },
  'wide-row': { orientation: 'TopToBottom', subtreeMode: 'AutoSmart', spacingX: 34, spacingY: 38 },
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

// Characters XML 1.0 forbids (C0 controls other than tab/newline/return,
// U+FFFE/U+FFFF and unpaired surrogates). A single one makes DOMParser reject
// the whole print SVG, so they are removed from every text and attribute.
const XML_ILLEGAL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

function xmlText(value) {
  return String(value ?? '').replace(XML_ILLEGAL, '');
}

function escapeXml(value) {
  return xmlText(value).replace(/[&<>"']/g, (char) => ({
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

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

// Print colours are limited to hex and rgb()/rgba() notation so a saved
// layout cannot smuggle markup or CSS into the print SVG.
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\))$/i;
const CUSTOM_OPTION_KEYS = new Set(['orientation', 'subtreeMode', 'spacingX', 'spacingY']);

function sanitizeEntries(source, path, issues, sanitizeEntry) {
  const result = {};
  if (!isPlainObject(source)) {
    issues.push(path);
    return result;
  }
  for (const [id, value] of Object.entries(source)) {
    const clean = sanitizeEntry(value, `${path}.${id}`);
    if (clean === null) issues.push(`${path}.${id}`);
    else result[id] = clean;
  }
  return result;
}

function sanitizeAnchor(anchor) {
  if (anchor === undefined) return undefined;
  if (!isPlainObject(anchor) || !finiteNumber(anchor.nx) || !finiteNumber(anchor.ny)
    || Math.abs(anchor.nx) > 1 || Math.abs(anchor.ny) > 1) return null;
  return { nx: anchor.nx, ny: anchor.ny };
}

/**
 * Validate the manual geometry stored in a print profile. Only finite numbers,
 * known enums and safe colours are kept; `issues` lists the paths that were
 * rejected so the caller can block export instead of printing a chart that
 * silently differs from the approved arrangement.
 */
export function sanitizePrintLayout(input) {
  const issues = [];
  if (input === undefined || input === null) return { layout: {}, issues };
  if (!isPlainObject(input)) return { layout: {}, issues: ['layout'] };

  const layout = {};
  const keep = (key, sanitize) => {
    if (input[key] !== undefined) layout[key] = sanitizeEntries(input[key], key, issues, sanitize);
  };
  keep('nodeOverrides', (value) => {
    if (!isPlainObject(value)) return null;
    const clean = {};
    for (const key of ['widthMm', 'heightMm']) {
      if (value[key] === undefined) continue;
      if (!finiteNumber(value[key])) return null;
      clean[key] = value[key];
    }
    return clean;
  });
  keep('nodeOffsets', (value) => (
    isPlainObject(value) && finiteNumber(value.dx) && finiteNumber(value.dy) ? { dx: value.dx, dy: value.dy } : null
  ));
  keep('edgeWaypoints', (value) => {
    if (!Array.isArray(value)) return null;
    const points = [];
    for (const point of value) {
      if (!isPlainObject(point) || !finiteNumber(point.x) || !finiteNumber(point.y)) return null;
      points.push({ x: point.x, y: point.y });
    }
    return points;
  });
  keep('edgeAnchors', (value) => {
    if (!isPlainObject(value)) return null;
    const p = sanitizeAnchor(value.p);
    const c = sanitizeAnchor(value.c);
    if (p === null || c === null) return null;
    const clean = {};
    if (p) clean.p = p;
    if (c) clean.c = c;
    return clean;
  });
  keep('edgeStyles', (value) => {
    if (!isPlainObject(value)) return null;
    const clean = {};
    if (value.color !== undefined) {
      if (typeof value.color !== 'string' || !SAFE_COLOR.test(value.color.trim())) return null;
      clean.color = value.color.trim();
    }
    if (value.widthMm !== undefined) {
      if (!finiteNumber(value.widthMm)) return null;
      clean.widthMm = value.widthMm;
    }
    if (value.pattern !== undefined) {
      if (value.pattern !== 'solid' && value.pattern !== 'dashed') return null;
      clean.pattern = value.pattern;
    }
    return clean;
  });
  if (input.options !== undefined) {
    if (!isPlainObject(input.options)) {
      issues.push('options');
    } else {
      const options = {};
      for (const [key, value] of Object.entries(input.options)) {
        const valid = CUSTOM_OPTION_KEYS.has(key) && (
          (key === 'orientation' && ORIENTATIONS.includes(value))
          || (key === 'subtreeMode' && SUBTREE_MODES.includes(value))
          || ((key === 'spacingX' || key === 'spacingY') && finiteNumber(value) && value >= 0 && value <= 500)
        );
        if (valid) options[key] = value;
        else issues.push(`options.${key}`);
      }
      layout.options = options;
    }
  }
  return { layout, issues };
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
    layout: sanitizePrintLayout(input.layout).layout,
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

const SHARED_CONNECTOR_STYLE = Object.freeze({ color: '#476965', widthMm: 1, pattern: 'solid' });

/* Visible connector segments in layout space (before the print transform). */
function connectorSegments(layout) {
  const logicalPaths = [];
  for (const child of layout.positioned) {
    if (!child.parentId) continue;
    const parent = layout.posById[child.parentId];
    if (!parent) continue;
    const path = routeConnector(parent, child, layout.cfg, layout.offsets, layout.edgeWaypoints, layout.edgeAnchors);
    const configured = layout.edgeStyles[child.node.id] || {};
    logicalPaths.push({
      id: child.node.id,
      d: path,
      style: {
        color: configured.color || SHARED_CONNECTOR_STYLE.color,
        widthMm: clamp(finite(configured.widthMm, SHARED_CONNECTOR_STYLE.widthMm), 0.3, 5),
        pattern: configured.pattern === 'dashed' ? 'dashed' : 'solid',
      },
    });
  }
  const rebuildFamilyIds = new Set();
  const moved = (id) => {
    const offset = layout.offsets?.[id];
    return offset && (Math.abs(finite(offset.dx, 0)) > 0.01 || Math.abs(finite(offset.dy, 0)) > 0.01);
  };
  for (const network of layout.familyNetworks || []) {
    if (moved(network.parentId) || network.childIds.some((id) => moved(id)
      || (layout.edgeWaypoints?.[id] && layout.edgeWaypoints[id].length)
      || layout.edgeAnchors?.[id])) rebuildFamilyIds.add(String(network.parentId));
  }
  return resolveConnectorGeometry(logicalPaths, layout.familyNetworks || [], {
    sharedStyle: SHARED_CONNECTOR_STYLE,
    rebuildFamilyIds,
  }).segments;
}

/* Grow card bounds to every drawn connector point, plus half the widest stroke. */
function boundsWithConnectors(bounds, segments) {
  let minX = bounds.x;
  let minY = bounds.y;
  let maxX = bounds.x + bounds.w;
  let maxY = bounds.y + bounds.h;
  let stroke = SHARED_CONNECTOR_STYLE.widthMm;
  for (const segment of segments) {
    stroke = Math.max(stroke, finite(segment.style?.widthMm, SHARED_CONNECTOR_STYLE.widthMm));
    const numbers = String(segment.d).match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi) || [];
    for (let index = 0; index + 1 < numbers.length; index += 2) {
      const x = Number(numbers[index]);
      const y = Number(numbers[index + 1]);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  const pad = stroke / 2;
  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
}

/* Manual bend points far outside the cards: printing them would shrink the
   whole chart to fit a stray line, so the connectors must be reset first. */
function strayWaypointEdges(cardBounds, edgeWaypoints) {
  const marginX = Math.max(20, cardBounds.w * 0.25);
  const marginY = Math.max(20, cardBounds.h * 0.25);
  const stray = [];
  for (const [id, points] of Object.entries(edgeWaypoints || {})) {
    if ((points || []).some((point) => point.x < cardBounds.x - marginX || point.x > cardBounds.x + cardBounds.w + marginX
      || point.y < cardBounds.y - marginY || point.y > cardBounds.y + cardBounds.h + marginY)) stray.push(id);
  }
  return stray;
}

function nodeDisplayName(node) {
  return xmlText(node.personName || node.data?.name || node.label || node.id).trim();
}

const PERSON_FONT = Object.freeze({ head: { name: 6.5, title: 5.2 }, person: { name: 5.7, title: 4.7 } });
// Card text never shrinks below the 4.2 mm reference size that the
// minimum-legibility check (`effectiveFontMm`) is based on.
const TEXT_REFERENCE_FONT = 4.2;
const LEVEL_FONT = 8;
const CARD_TEXT_PADDING = 3;

function cardPhotoSize(node) {
  const role = nodeRole(node);
  if (role === 'level') return 0;
  return Math.min(node.height - 10, role === 'head' ? 42 : 32);
}

/* Measured text layout for one card: line breaks, font sizes and truncation. */
function cardTextLayout(node) {
  const role = nodeRole(node);
  if (role === 'level') {
    const width = node.width - CARD_TEXT_PADDING * 2;
    const height = node.height - CARD_TEXT_PADDING;
    const fontSize = Math.min(LEVEL_FONT, node.height / 2);
    const fitted = fitTextBlocks([
      { key: 'title', text: xmlText(node.label || '').toUpperCase(), fontSize, weight: 'bold' },
    ], width, height, Math.min(fontSize, TEXT_REFERENCE_FONT));
    return { role, ...fitted };
  }
  const fonts = PERSON_FONT[role === 'head' ? 'head' : 'person'];
  const photoSize = cardPhotoSize(node);
  const width = node.width - photoSize - 13;
  const height = node.height - CARD_TEXT_PADDING * 2;
  const name = xmlText(node.personName || node.data?.name || '') || (node.status === 'VACANT' ? 'VACANT' : '—');
  const fitted = fitTextBlocks([
    { key: 'name', text: name, fontSize: fonts.name, weight: 'bold', maxLines: 2 },
    { key: 'title', text: xmlText(node.label || ''), fontSize: fonts.title, weight: 'normal' },
  ], width, height, TEXT_REFERENCE_FONT);
  return { role, ...fitted };
}

function textDiagnostics(positioned, textByNode) {
  const diagnostics = [];
  for (const item of positioned) {
    const node = item.node;
    const name = nodeDisplayName(node);
    const missing = unsupportedCharacters(`${node.personName || ''} ${node.label || ''}`.replace(XML_ILLEGAL, '').replace(/\s/g, ' '));
    if (missing.length) {
      diagnostics.push({
        level: 'warning', code: 'unsupported-characters', nodeId: node.id,
        message: `"${name}" uses ${missing.map((char) => `"${char}"`).join(', ')}, which the PDF fonts cannot print. Edit the entry or use a supported spelling before publishing.`,
      });
    }
    if (textByNode[node.id]?.truncated) {
      diagnostics.push({
        level: 'warning', code: 'text-truncated', nodeId: node.id,
        message: `Text for "${name}" was shortened to fit its card. Enlarge the card or shorten the entry before publishing.`,
      });
    }
  }
  return diagnostics;
}

export function layoutPrintChart(nodes, profileInput) {
  const profile = normalizePrintProfile(profileInput);
  const box = contentBox(profile);
  const diagnostics = [];
  if (box.width <= 0 || box.height <= 0) {
    return { ok: false, profile, contentBox: box, diagnostics: [{ level: 'error', code: 'invalid-content-box', message: 'Header, footer, and margins leave no room for the chart.' }] };
  }

  const { issues } = sanitizePrintLayout(profileInput?.layout);
  if (issues.length) {
    const listed = issues.slice(0, 5).join(', ') + (issues.length > 5 ? `, and ${issues.length - 5} more` : '');
    diagnostics.push({
      level: 'error', code: 'invalid-saved-layout',
      message: `The saved print layout has invalid values (${listed}). A MIO administrator must review and save the print settings again.`,
    });
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
  const options = {
    ...(profile.layoutFamily === 'custom' ? { ...family, ...customOptions } : family),
    targetSize: { width: box.width, height: box.height },
  };
  const layout = layoutOrgChart(prepared, options);
  const offsets = profile.layout.nodeOffsets || {};
  const edgeWaypoints = profile.layout.edgeWaypoints || {};
  const edgeAnchors = profile.layout.edgeAnchors || {};
  const edgeStyles = profile.layout.edgeStyles || {};
  const cardBounds = Object.keys(offsets).length
    ? calculateBounds(layout.positioned, offsets, 0)
    : layout.framingBounds || calculateBounds(layout.positioned, offsets, 0);
  const segments = connectorSegments({
    positioned: layout.positioned, posById: layout.posById, cfg: layout.cfg,
    familyNetworks: layout.familyNetworks || [], offsets, edgeWaypoints, edgeAnchors, edgeStyles,
  });
  const stray = strayWaypointEdges(calculateBounds(layout.positioned, offsets, 0), edgeWaypoints);
  if (stray.length) {
    diagnostics.push({
      level: 'error', code: 'stray-connector',
      message: `Connector bend points for ${stray.slice(0, 5).join(', ')}${stray.length > 5 ? ` and ${stray.length - 5} more` : ''} lie far outside the chart. Reset those connectors before exporting.`,
    });
  }
  const bounds = boundsWithConnectors(cardBounds, segments);
  const scale = Math.min(box.width / bounds.w, box.height / bounds.h);
  const effectiveFontMm = TEXT_REFERENCE_FONT * scale;

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

  const cardText = {};
  for (const item of layout.positioned) cardText[item.node.id] = cardTextLayout(item.node);
  diagnostics.push(...textDiagnostics(layout.positioned, cardText));

  const translateX = box.x + (box.width - bounds.w * scale) / 2 - bounds.x * scale;
  const translateY = box.y + (box.height - bounds.h * scale) / 2 - bounds.y * scale;

  return {
    ok: !diagnostics.some((item) => item.level === 'error'),
    profile,
    contentBox: box,
    positioned: layout.positioned,
    posById: layout.posById,
    cfg: layout.cfg,
    familyNetworks: layout.familyNetworks || [],
    offsets,
    edgeWaypoints,
    edgeAnchors,
    edgeStyles,
    connectorSegments: segments,
    cardText,
    bounds,
    transform: { scale, x: translateX, y: translateY },
    effectiveFontMm,
    diagnostics,
  };
}

function textLines(lines, cx, startY, fontSize, lineHeight, weight, color) {
  return lines.map((line, index) => `<text x="${cx}" y="${startY + index * lineHeight}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${color}">${escapeXml(line)}</text>`).join('');
}

function textGroups(groups, cx, top, height, colors) {
  const total = groups.reduce((sum, group) => sum + group.lines.length * group.fontSize * LINE_HEIGHT, 0);
  let cursor = top + (height - total) / 2;
  let svg = '';
  for (const group of groups) {
    if (!group.lines.length) continue;
    const lineHeight = group.fontSize * LINE_HEIGHT;
    svg += textLines(group.lines, cx, cursor + group.fontSize * 0.8, group.fontSize, lineHeight,
      group.weight === 'bold' ? 700 : 400, colors[group.key]);
    cursor += group.lines.length * lineHeight;
  }
  return svg;
}

/* Square portrait: approved background, contained image with a centred 5%
   overscan, clipped to the frame. Prepared photos are already composited. */
function photoSvg(node, x, y, size, clipId, options) {
  const url = node.data?.photo_url;
  const prepared = url ? options.preparedPhotos?.[url] : null;
  const raw = url ? (options.photoDataByUrl?.[url] || (options.allowRemotePhotos ? url : null)) : null;
  let body = `<defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${size}" height="${size}"/></clipPath></defs>`;
  body += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${PHOTO_BACKGROUND}"/>`;
  if (prepared) {
    body += `<image href="${escapeXml(prepared)}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="none" clip-path="url(#${clipId})"/>`;
  } else if (raw) {
    const imageSize = size * (RENDERED_PHOTO.width / VIRTUAL_PHOTO_FRAME.width);
    const inset = (imageSize - size) / 2;
    body += `<image href="${escapeXml(raw)}" x="${x - inset}" y="${y - inset}" width="${imageSize}" height="${imageSize}" preserveAspectRatio="xMidYMid meet" clip-path="url(#${clipId})"/>`;
  } else {
    // Vector person silhouette: the PDF standard fonts have no glyph for a
    // placeholder symbol, so the shape is drawn instead of typed.
    const cx = x + size / 2;
    body += `<g clip-path="url(#${clipId})" fill="#ffffff" fill-opacity="0.72">`
      + `<circle cx="${cx}" cy="${y + size * 0.4}" r="${size * 0.17}"/>`
      + `<ellipse cx="${cx}" cy="${y + size * 0.93}" rx="${size * 0.33}" ry="${size * 0.25}"/></g>`;
  }
  return body;
}

function cardSvg(positioned, layout, options, index) {
  const node = positioned.node;
  const center = effCenter(positioned, layout.offsets);
  const x = center.x - node.width / 2;
  const y = center.y - node.height / 2;
  const text = layout.cardText?.[node.id] || cardTextLayout(node);
  const nodeId = escapeXml(node.id);

  if (text.role === 'level') {
    const body = textGroups(text.groups, center.x, y + CARD_TEXT_PADDING / 2, node.height - CARD_TEXT_PADDING, { title: '#ffffff' });
    return `<g data-node-id="${nodeId}"><rect x="${x}" y="${y}" width="${node.width}" height="${node.height}" rx="3" fill="#0a5b5e" stroke="#073b3d" stroke-width="0.8"/>${body}</g>`;
  }

  const accent = text.role === 'head' ? '#d8aa35' : '#0a5b5e';
  const photoSize = cardPhotoSize(node);
  const photoX = x + 5;
  const photoY = y + (node.height - photoSize) / 2;
  const textX = x + photoSize + 8 + (node.width - photoSize - 13) / 2;
  let body = `<rect x="${x}" y="${y}" width="${node.width}" height="${node.height}" rx="3" fill="#ffffff" stroke="${accent}" stroke-width="${text.role === 'head' ? 1.4 : 0.8}"/>`;
  body += `<rect x="${x}" y="${y}" width="3.5" height="${node.height}" rx="1.7" fill="${accent}"/>`;
  body += photoSvg(node, photoX, photoY, photoSize, `loc-print-photo-${index}`, options);
  body += textGroups(text.groups, textX, y + CARD_TEXT_PADDING, node.height - CARD_TEXT_PADDING * 2, { name: '#173334', title: '#455b59' });
  return `<g data-node-id="${nodeId}">${body}</g>`;
}

export function renderPrintChartFragment(layout, options = {}) {
  if (!layout?.positioned) throw new Error('A completed print layout is required.');
  const segments = layout.connectorSegments || connectorSegments(layout);
  const paths = segments.map((segment) => {
    const style = segment.style || SHARED_CONNECTOR_STYLE;
    const dash = style.pattern === 'dashed' ? ' stroke-dasharray="5 4"' : '';
    return `<path d="${escapeXml(segment.d)}" fill="none" stroke="${escapeXml(style.color)}" stroke-width="${finite(style.widthMm, 1)}"${dash}/>`;
  });
  const cards = layout.positioned.map((item, index) => cardSvg(item, layout, options, index)).join('');
  const { x, y, scale } = layout.transform;
  return `<g data-print-chart="true" transform="translate(${x} ${y}) scale(${scale})">${paths.join('')}${cards}</g>`;
}

export function renderPrintChartSvg(layout, options = {}) {
  const { widthMm, heightMm } = layout.profile;
  const background = options.background || 'transparent';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${widthMm}mm" height="${heightMm}mm" viewBox="0 0 ${widthMm} ${heightMm}" role="img" aria-label="${escapeXml(options.ariaLabel || 'Organizational chart')}"><rect width="${widthMm}" height="${heightMm}" fill="${escapeXml(background)}"/>${renderPrintChartFragment(layout, options)}</svg>`;
}

/**
 * Rasterise every photo a print layout uses to its printed size at the
 * profile dpi (browser only). Pass the returned `photos` to
 * `renderPrintChartFragment(layout, { preparedPhotos })`; `failed` lists URLs
 * whose image could not be decoded.
 */
export function preparePrintPhotos(layout, photoDataByUrl, options = {}) {
  return preparePrintPhotosFor(layout, photoDataByUrl, cardPhotoSize, options);
}

const PT_PER_MM = 72 / 25.4;
// jsPDF and many PDF readers cap a page edge at 14,400 units. Larger tarps
// keep their physical size through the page's UserUnit (PDF 1.6).
const MAX_PDF_PAGE_UNITS = 14400;
// svg2pdf parses data URLs with a backtracking regex that overflows the call
// stack on very large images; prepared print photos stay far below this.
export const MAX_EMBEDDED_IMAGE_CHARS = 4_000_000;

/* Page geometry for an exact physical page size in millimetres. */
export function printPdfPageGeometry(widthMm, heightMm) {
  const longestPt = Math.max(widthMm, heightMm) * PT_PER_MM;
  // Round up past exact multiples so floating error cannot push an edge over the cap.
  const userUnit = longestPt > MAX_PDF_PAGE_UNITS ? Math.ceil((longestPt / MAX_PDF_PAGE_UNITS) * 1000 + 1e-6) / 1000 : 1;
  const unitsPerMm = PT_PER_MM / userUnit;
  return { userUnit, unitsPerMm, pageWidth: widthMm * unitsPerMm, pageHeight: heightMm * unitsPerMm };
}

function oversizedImage(svgElement) {
  for (const image of svgElement.querySelectorAll('image')) {
    const href = image.getAttribute('href') || image.getAttribute('xlink:href') || '';
    if (href.length > MAX_EMBEDDED_IMAGE_CHARS) {
      const owner = image.closest('[data-node-id]');
      return { nodeId: owner ? owner.getAttribute('data-node-id') : null, megabytes: href.length / 1e6 };
    }
  }
  return null;
}

export async function svgElementToPdfBlob(svgElement, dimensions = {}) {
  if (!svgElement || String(svgElement.tagName).toLowerCase() !== 'svg') throw new Error('An SVG element is required.');
  const widthMm = finite(dimensions.widthMm, 0);
  const heightMm = finite(dimensions.heightMm, 0);
  if (widthMm <= 0 || heightMm <= 0) throw new Error('PDF width and height are required.');
  const oversized = oversizedImage(svgElement);
  if (oversized) {
    throw new Error(`A photo${oversized.nodeId ? ` for ${oversized.nodeId}` : ''} is too large to embed in the PDF (${oversized.megabytes.toFixed(1)} MB). Prepare photos with preparePrintPhotos() before exporting.`);
  }
  const [jspdfModule, svg2pdfModule] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
  // Bundlers expose the named exports; Node's CommonJS interop nests them under `default`.
  const jsPDF = jspdfModule.jsPDF || jspdfModule.default?.jsPDF;
  const svg2pdf = svg2pdfModule.svg2pdf || svg2pdfModule.default?.svg2pdf;
  const geometry = printPdfPageGeometry(widthMm, heightMm);
  const pdf = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: geometry.unitsPerMm,
    userUnit: geometry.userUnit,
    format: [widthMm, heightMm],
    compress: true,
    putOnlyUsedFonts: true,
  });
  // UserUnit is a PDF 1.6 page key; jsPDF writes a 1.3 header by default.
  if (geometry.userUnit !== 1) pdf.__private__.setPdfVersion('1.6');
  await svg2pdf(svgElement, pdf, { xOffset: 0, yOffset: 0, scale: 1 });
  return pdf.output('blob');
}
