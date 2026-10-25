// Native-SVG chart serializer — portable (opens in Illustrator/Inkscape)
// and taint-free for PNG raster. Kept DOM-free by injecting a `measureText`
// function and an optional `fitOf` (per-node font-fit) from the caller.
import { effCenter } from './connectors.js';
import { calculateBounds } from './bounds.js';
import { resolveConnectorGeometry } from './connectorGeometry.js';
import {
  VIRTUAL_PHOTO_FRAME, RENDERED_PHOTO, PHOTO_BACKGROUND, POS_SIZE, PERSON_TEXT_HEIGHT,
} from './constants.js';

const FONT = '"Segoe UI", system-ui, -apple-system, Arial, sans-serif';
const BADGE = {
  FILLED: { bg: '#e6f4ea', fg: '#137a3e' },
  VACANT: { bg: '#fdf0e6', fg: '#a3520f' },
  UNFUNDED: { bg: '#fbe7e7', fg: '#b42318' },
};

// XML 1.0 cannot carry C0 controls (other than tab/LF/CR), U+FFFE/U+FFFF or
// unpaired surrogates; a strict parser rejects the whole file if one appears.
const XML_ILLEGAL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
export function escapeXml(s) {
  return String(s == null ? '' : s).replace(XML_ILLEGAL, '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}
const esc = escapeXml;
/* Every numeric attribute goes through here: a value that is not a finite
   number is a caller bug (or hostile data) and must not reach the markup. */
function num(value, name) {
  const n = typeof value === 'number' ? value : NaN;
  if (!Number.isFinite(n)) throw new TypeError(`buildChartSVG: ${name} must be a finite number`);
  return n;
}
function fx(value, name, digits = 1) { return num(value, name).toFixed(digits); }

/* Break one word into pieces no wider than maxW (long ids, URLs, compounds). */
function splitLongWord(word, font, maxW, measure) {
  if (measure(word, font) <= maxW) return [word];
  const out = []; let cur = '';
  for (const ch of word) {
    if (cur && measure(cur + ch, font) > maxW) { out.push(cur); cur = ch; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}
/* Wrap to maxW like the on-screen card and clamp to maxLines (the screen's
   line-clamp), ending a clamped block with an ellipsis. */
function wrap(text, font, maxW, measure, maxLines = Infinity) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
    .flatMap((w) => splitLongWord(w, font, maxW, measure));
  if (!words.length) return [''];
  const lines = []; let cur = words[0];
  for (let i = 1; i < words.length; i++) {
    const t = cur + ' ' + words[i];
    if (measure(t, font) <= maxW) cur = t; else { lines.push(cur); cur = words[i]; }
  }
  lines.push(cur);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last && measure(last + '…', font) > maxW) last = last.slice(0, -1).trimEnd();
  kept[maxLines - 1] = last + '…';
  return kept;
}
// line clamps of the on-screen card (org-chart.css)
const DEPT_LINES = 6, NAME_LINES = 3, TITLE_LINES = 4;
function txt(cx, baseline, fs, weight, fill, t, ls) {
  return `<text x="${fx(cx, 'text x')}" y="${fx(baseline, 'text y')}" font-family='${FONT}' `
    + `font-size="${fx(fs, 'font size', 2)}" font-weight="${weight}" fill="${fill}" text-anchor="middle"`
    + `${ls ? ` letter-spacing="${ls}"` : ''}>${esc(t)}</text>`;
}
function roundTop(x, y, w, h, r) {
  const X = num(x, 'x'), Y = num(y, 'y'), W = num(w, 'width'), H = num(h, 'height');
  return `M${X},${Y + r} Q${X},${Y} ${X + r},${Y} H${X + W - r} Q${X + W},${Y} ${X + W},${Y + r} `
    + `V${Y + H} H${X} V${Y + r} Z`;
}
function deptSVG(n, x, y, fit, measure) {
  const W = num(n.width, 'node width'), H = num(n.height, 'node height');
  const fs = 13.5 * num(fit, 'text fit'), maxW = W - 36;
  const lines = wrap((n.label || '').toUpperCase(), `600 ${fs}px ${FONT}`, maxW, measure, DEPT_LINES);
  const lh = fs * 1.2, ccx = x + 10 + maxW / 2;
  let ty = y + H / 2 - (lines.length * lh) / 2 + fs * 0.78;
  let t = `<rect x="${fx(x, 'x', 2)}" y="${fx(y, 'y', 2)}" width="${W}" height="${H}" rx="8" fill="url(#loc-teal)"/>`;
  for (const ln of lines) { t += txt(ccx, ty, fs, 600, '#ffffff', ln, '0.4'); ty += lh; }
  return t;
}
function posSVG(n, x, y, fit, raster, measure, ex, clipIndex) {
  ex = ex || {};
  const W = num(n.width, 'node width'), H = num(n.height, 'node height');
  num(x, 'x'); num(y, 'y'); num(fit, 'text fit');
  const ccx = x + W / 2, maxW = W - 16;
  const photoH = Math.max(20, Math.min(ex.photoH || (POS_SIZE.height - PERSON_TEXT_HEIGHT), H - 20));
  let s = `<rect x="${fx(x, 'x', 2)}" y="${fx(y, 'y', 2)}" width="${W}" height="${H}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
  s += `<path d="${roundTop(x, y, W, photoH, 8)}" fill="${esc(ex.photoBackground || PHOTO_BACKGROUND)}"/>`;
  const url = n.data && n.data.photo_url;
  // prefer an embedded (base64) data URL so the photo travels inside the export and
  // works in SVG *and* raster (PNG/PDF) without tainting the canvas. Fall back to the
  // external URL for SVG only, then to a neutral placeholder.
  const embedded = url && ex.images ? ex.images[url] : null;
  const href = embedded || (url && !raster ? url : null);
  if (href) {
    const par = ex.contain ? 'xMidYMid meet' : 'xMidYMid slice';
    const frameW = Math.max(1, ex.frameWidth || VIRTUAL_PHOTO_FRAME.width);
    const frameH = Math.max(1, ex.frameHeight || VIRTUAL_PHOTO_FRAME.height);
    const imageW = W * (Math.max(1, ex.imageWidth || RENDERED_PHOTO.width) / frameW);
    const imageH = photoH * (Math.max(1, ex.imageHeight || RENDERED_PHOTO.height) / frameH);
    const imageX = x + (W - imageW) / 2 + (ex.offsetX || 0) * W / frameW;
    const imageY = y + (photoH - imageH) / 2 + (ex.offsetY || 0) * photoH / frameH;
    const clipId = `loc-photo-clip-${clipIndex}`;
    s += `<defs><clipPath id="${clipId}"><path d="${roundTop(x, y, W, photoH, 8)}"/></clipPath></defs>`;
    s += `<image x="${imageX.toFixed(2)}" y="${imageY.toFixed(2)}" width="${imageW.toFixed(2)}" height="${imageH.toFixed(2)}" `
      + `href="${esc(href)}" preserveAspectRatio="${par}" clip-path="url(#${clipId})"/>`;
  } else {
    s += `<text x="${ccx.toFixed(1)}" y="${(y + photoH / 2 + 10).toFixed(1)}" font-family='${FONT}' font-size="30" fill="#ffffff" fill-opacity="0.72" text-anchor="middle">●</text>`;
  }
  s += `<line x1="${fx(x, 'x', 2)}" y1="${fx(y + photoH, 'y', 2)}" x2="${fx(x + W, 'x', 2)}" y2="${fx(y + photoH, 'y', 2)}" stroke="#d0d5dd"/>`;
  const areaY = y + photoH, areaH = H - photoH;
  const nameFs = 13.5 * fit, titleFs = 12 * fit, nlh = nameFs * 1.15, tlh = titleFs * 1.15;
  const nameLines = wrap((n.personName || '—').toUpperCase(), `700 ${nameFs}px ${FONT}`, maxW, measure, NAME_LINES);
  const titleLines = wrap(n.label || '', `${titleFs}px ${FONT}`, maxW, measure, TITLE_LINES);
  const badgeH = n.status ? 15 : 0, badgeGap = n.status ? 5 : 0;
  const blockH = nameLines.length * nlh + titleLines.length * tlh + badgeGap + badgeH;
  let ty = areaY + areaH / 2 - blockH / 2 + nameFs * 0.8;
  let t = '';
  for (const ln of nameLines) { t += txt(ccx, ty, nameFs, 700, '#1a1a2e', ln); ty += nlh; }
  for (const ln of titleLines) { t += txt(ccx, ty, titleFs, 400, '#4a5568', ln); ty += tlh; }
  if (n.status) {
    const bf = 10, col = BADGE[n.status] || { bg: '#eee', fg: '#333' };
    const bw = num(measure(n.status, `700 ${bf}px ${FONT}`), 'measured badge width') + 16;
    const bx = ccx - bw / 2, by = ty - nameFs * 0.8 + badgeGap;
    t += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${badgeH}" rx="7.5" fill="${col.bg}"/>`;
    t += `<text x="${ccx.toFixed(1)}" y="${(by + 11).toFixed(1)}" font-family='${FONT}' font-size="${bf}" font-weight="700" fill="${col.fg}" text-anchor="middle" letter-spacing="0.4">${esc(n.status)}</text>`;
  }
  return s + t;
}

/* Bounds of the cards plus every connector path point (manual waypoints and
   dragged endpoints can sit outside the card area), padded by `pad`. */
export function exportBounds(positioned, manualOffsets, paths, pad = 40) {
  const cards = calculateBounds(positioned, manualOffsets, 0);
  let minX = cards.x, minY = cards.y, maxX = cards.x + cards.w, maxY = cards.y + cards.h;
  if (!positioned.length) { minX = Infinity; minY = Infinity; maxX = -Infinity; maxY = -Infinity; }
  for (const path of paths || []) {
    const values = String((path && path.d) || '').match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi) || [];
    for (let i = 0; i + 1 < values.length; i += 2) {
      const x = Number(values[i]), y = Number(values[i + 1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      // the stroke is 2px wide, so a line on the edge needs 1px either side
      minX = Math.min(minX, x - 1); minY = Math.min(minY, y - 1);
      maxX = Math.max(maxX, x + 1); maxY = Math.max(maxY, y + 1);
    }
  }
  if (!Number.isFinite(minX)) return { x: -pad, y: -pad, w: 100 + pad * 2, h: 100 + pad * 2 };
  return { x: minX - pad, y: minY - pad, w: (maxX - minX) + pad * 2, h: (maxY - minY) + pad * 2 };
}

/* buildChartSVG(positioned, paths, opts) -> standalone SVG string.
   opts: { manualOffsets, raster, measureText(text,font)->width, fitOf(node)->number } */
export function buildChartSVG(positioned, paths, opts = {}) {
  const manualOffsets = opts.manualOffsets || {};
  const raster = !!opts.raster;
  const measure = opts.measureText || (() => 0);
  const fitOf = opts.fitOf || (() => 1);
  const frame = opts.virtualPhotoFrame || {};
  const image = opts.renderedImage || {};
  const ex = {
    photoH: opts.photoHeight || (POS_SIZE.height - PERSON_TEXT_HEIGHT),
    images: opts.images || null,
    contain: opts.photoContain == null ? image.fit !== 'cover' : opts.photoContain !== false,
    frameWidth: +frame.width || VIRTUAL_PHOTO_FRAME.width,
    frameHeight: +frame.height || VIRTUAL_PHOTO_FRAME.height,
    imageWidth: +image.width || RENDERED_PHOTO.width,
    imageHeight: +image.height || RENDERED_PHOTO.height,
    offsetX: Number.isFinite(+image.offsetX) ? +image.offsetX : RENDERED_PHOTO.offsetX,
    offsetY: Number.isFinite(+image.offsetY) ? +image.offsetY : RENDERED_PHOTO.offsetY,
    photoBackground: opts.photoBackground || PHOTO_BACKGROUND,
  };
  const b = opts.bounds || exportBounds(positioned, manualOffsets, paths, 40);

  let pathStr = '';
  const geometry = resolveConnectorGeometry(paths, opts.familyNetworks || [], {
    rebuildFamilyIds: opts.rebuildFamilyIds || [],
  });
  for (const segment of geometry.segments) {
    pathStr += `<path d="${segment.d}" fill="none" stroke="#4a5568" stroke-width="2"/>`;
  }

  let cards = '';
  let cardIndex = 0;
  for (const p of positioned) {
    const n = p.node, c = effCenter(p, manualOffsets);
    const x = c.x - n.width / 2 - b.x, y = c.y - n.height / 2 - b.y;
    cards += (n.type === 'department')
      ? deptSVG(n, x, y, fitOf(n), measure)
      : posSVG(n, x, y, fitOf(n), raster, measure, ex, cardIndex++);
  }

  const W = fx(b.w, 'bounds width', 0), H = fx(b.h, 'bounds height', 0);
  num(b.x, 'bounds x'); num(b.y, 'bounds y');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" `
    + `width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + `<defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1">`
    + `<stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#1f7f74"/></linearGradient></defs>`
    + `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`
    + `<g transform="translate(${(-b.x).toFixed(1)},${(-b.y).toFixed(1)})">${pathStr}</g>`
    + cards + `</svg>`;
}
