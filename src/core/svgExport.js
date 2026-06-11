// Native-SVG chart serializer — portable (opens in Illustrator/Inkscape)
// and taint-free for PNG raster. Kept DOM-free by injecting a `measureText`
// function and an optional `fitOf` (per-node font-fit) from the caller.
import { effCenter } from './connectors.js';
import { calculateBounds } from './bounds.js';

const FONT = '"Segoe UI", system-ui, -apple-system, Arial, sans-serif';
const BADGE = {
  FILLED: { bg: '#e6f4ea', fg: '#137a3e' },
  VACANT: { bg: '#fdf0e6', fg: '#b25a14' },
  UNFUNDED: { bg: '#fbe7e7', fg: '#b42318' },
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}
function wrap(text, font, maxW, measure) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = []; let cur = words[0];
  for (let i = 1; i < words.length; i++) {
    const t = cur + ' ' + words[i];
    if (measure(t, font) <= maxW) cur = t; else { lines.push(cur); cur = words[i]; }
  }
  lines.push(cur);
  return lines;
}
function txt(cx, baseline, fs, weight, fill, t, ls) {
  return `<text x="${cx.toFixed(1)}" y="${baseline.toFixed(1)}" font-family='${FONT}' `
    + `font-size="${fs.toFixed(2)}" font-weight="${weight}" fill="${fill}" text-anchor="middle"`
    + `${ls ? ` letter-spacing="${ls}"` : ''}>${esc(t)}</text>`;
}
function roundTop(x, y, w, h, r) {
  return `M${x},${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} `
    + `V${y + h} H${x} V${y + r} Z`;
}
function deptSVG(n, x, y, fit, measure) {
  const W = n.width, H = n.height, fs = 12.5 * fit, maxW = W - 36;
  const lines = wrap((n.label || '').toUpperCase(), `600 ${fs}px ${FONT}`, maxW, measure);
  const lh = fs * 1.2, ccx = x + 10 + maxW / 2;
  let ty = y + H / 2 - (lines.length * lh) / 2 + fs * 0.78;
  let t = `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="8" fill="url(#loc-teal)"/>`;
  for (const ln of lines) { t += txt(ccx, ty, fs, 600, '#ffffff', ln, '0.4'); ty += lh; }
  return t;
}
function posSVG(n, x, y, fit, raster, measure) {
  const W = n.width, H = n.height, photoH = 62, ccx = x + W / 2, maxW = W - 16;
  let s = `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="8" fill="#ffffff" stroke="#d0d5dd"/>`;
  s += `<path d="${roundTop(x, y, W, photoH, 8)}" fill="#e8edf4"/>`;
  s += `<line x1="${x}" y1="${y + photoH}" x2="${x + W}" y2="${y + photoH}" stroke="#d0d5dd"/>`;
  const url = n.data && n.data.photo_url;
  if (url && !raster) {
    s += `<image x="${x}" y="${y}" width="${W}" height="${photoH}" href="${esc(url)}" preserveAspectRatio="xMidYMid slice"/>`;
  } else {
    s += `<text x="${ccx.toFixed(1)}" y="${(y + photoH / 2 + 10).toFixed(1)}" font-family='${FONT}' font-size="30" fill="#9ca3af" text-anchor="middle">●</text>`;
  }
  const areaY = y + photoH, areaH = H - photoH;
  const nameFs = 12.5 * fit, titleFs = 11 * fit, nlh = nameFs * 1.15, tlh = titleFs * 1.15;
  const nameLines = wrap((n.personName || '—').toUpperCase(), `700 ${nameFs}px ${FONT}`, maxW, measure);
  const titleLines = wrap(n.label || '', `${titleFs}px ${FONT}`, maxW, measure);
  const badgeH = n.status ? 15 : 0, badgeGap = n.status ? 5 : 0;
  const blockH = nameLines.length * nlh + titleLines.length * tlh + badgeGap + badgeH;
  let ty = areaY + areaH / 2 - blockH / 2 + nameFs * 0.8;
  let t = '';
  for (const ln of nameLines) { t += txt(ccx, ty, nameFs, 700, '#1a1a2e', ln); ty += nlh; }
  for (const ln of titleLines) { t += txt(ccx, ty, titleFs, 400, '#4a5568', ln); ty += tlh; }
  if (n.status) {
    const bf = 9.5, col = BADGE[n.status] || { bg: '#eee', fg: '#333' };
    const bw = measure(n.status, `700 ${bf}px ${FONT}`) + 16;
    const bx = ccx - bw / 2, by = ty - nameFs * 0.8 + badgeGap;
    t += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${badgeH}" rx="7.5" fill="${col.bg}"/>`;
    t += `<text x="${ccx.toFixed(1)}" y="${(by + 11).toFixed(1)}" font-family='${FONT}' font-size="${bf}" font-weight="700" fill="${col.fg}" text-anchor="middle" letter-spacing="0.4">${esc(n.status)}</text>`;
  }
  return s + t;
}

/* buildChartSVG(positioned, paths, opts) -> standalone SVG string.
   opts: { manualOffsets, raster, measureText(text,font)->width, fitOf(node)->number } */
export function buildChartSVG(positioned, paths, opts = {}) {
  const manualOffsets = opts.manualOffsets || {};
  const raster = !!opts.raster;
  const measure = opts.measureText || (() => 0);
  const fitOf = opts.fitOf || (() => 1);
  const b = calculateBounds(positioned, manualOffsets, 40);

  let pathStr = '';
  for (const d of paths) if (d) pathStr += `<path d="${d}" fill="none" stroke="#4a5568" stroke-width="2"/>`;

  let cards = '';
  for (const p of positioned) {
    const n = p.node, c = effCenter(p, manualOffsets);
    const x = c.x - n.width / 2 - b.x, y = c.y - n.height / 2 - b.y;
    cards += (n.type === 'department')
      ? deptSVG(n, x, y, fitOf(n), measure)
      : posSVG(n, x, y, fitOf(n), raster, measure);
  }

  const W = b.w.toFixed(0), H = b.h.toFixed(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" `
    + `width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + `<defs><linearGradient id="loc-teal" x1="0" y1="0" x2="1" y2="1">`
    + `<stop offset="0" stop-color="#1a6e5c"/><stop offset="1" stop-color="#2a9d8f"/></linearGradient></defs>`
    + `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`
    + `<g transform="translate(${(-b.x).toFixed(1)},${(-b.y).toFixed(1)})">${pathStr}</g>`
    + cards + `</svg>`;
}
