import { PHOTO_BACKGROUND, RENDERED_PHOTO, VIRTUAL_PHOTO_FRAME } from '../core/constants.js';

// Photos are rasterised to the printed portrait box before they are embedded
// in the PDF. A full-resolution camera original inflates the document and,
// above roughly 6 MB, overflows svg2pdf's data-URL parser; a pre-composited
// square also carries the approved portrait geometry (5% centred overscan on
// the portrait background) without relying on svg2pdf's preserveAspectRatio.

export const MAX_PRINT_PHOTO_PX = 2000;
// Prepared photos stay well inside the PDF embedding limit
// (MAX_EMBEDDED_IMAGE_CHARS in index.js) even for noisy camera originals.
export const PREPARED_PHOTO_CHAR_BUDGET = 3_000_000;
const MIN_PRINT_PHOTO_PX = 16;
const MM_PER_INCH = 25.4;

/* Pixel edge for a square portrait printed at `boxMm` millimetres and `dpi`. */
export function printPhotoPixelSize(boxMm, dpi, maxPx = MAX_PRINT_PHOTO_PX) {
  const size = Number(boxMm);
  const resolution = Number(dpi);
  if (!(size > 0) || !(resolution > 0)) throw new Error('A printed photo size and resolution are required.');
  const px = Math.ceil((size / MM_PER_INCH) * resolution);
  return Math.min(Math.max(MIN_PRINT_PHOTO_PX, px), Math.max(MIN_PRINT_PHOTO_PX, Math.floor(maxPx)));
}

/* Image rectangle inside a square canvas of `edgePx`: the image is contained
   in a box `RENDERED_PHOTO / VIRTUAL_PHOTO_FRAME` times the frame (420/400)
   and centred, so the frame crops the 5% overscan evenly on every side. */
export function printPhotoPlacement(naturalWidth, naturalHeight, edgePx) {
  const width = Number(naturalWidth);
  const height = Number(naturalHeight);
  if (!(width > 0) || !(height > 0)) throw new Error('The photo has no pixel dimensions.');
  const box = edgePx * (RENDERED_PHOTO.width / VIRTUAL_PHOTO_FRAME.width);
  const scale = Math.min(box / width, box / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  return {
    x: (edgePx - drawWidth) / 2,
    y: (edgePx - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  };
}

/* Largest pixel edge each photo URL needs across the chart's cards. */
export function printPhotoTargets(layout, photoBoxForNode) {
  if (!layout?.positioned || !layout.transform) throw new Error('A completed print layout is required.');
  const dpi = layout.profile?.dpi;
  const targets = {};
  for (const item of layout.positioned) {
    const url = item.node?.data?.photo_url;
    if (!url) continue;
    const boxMm = photoBoxForNode(item.node) * layout.transform.scale;
    if (!(boxMm > 0)) continue;
    const px = printPhotoPixelSize(boxMm, dpi);
    targets[url] = Math.max(targets[url] || 0, px);
  }
  return targets;
}

function browserLoadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The photo could not be decoded.'));
    image.src = src;
  });
}

function browserCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function drawPortrait(image, edgePx, options) {
  const createCanvas = options.createCanvas || browserCanvas;
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const placement = printPhotoPlacement(naturalWidth, naturalHeight, edgePx);
  const canvas = createCanvas(edgePx, edgePx);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('The browser could not create a drawing surface for the photo.');
  context.fillStyle = options.background || PHOTO_BACKGROUND;
  context.fillRect(0, 0, edgePx, edgePx);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, placement.x, placement.y, placement.width, placement.height);
  return canvas;
}

/* Composite one photo onto a square portrait raster and return a JPEG data
   URL. A result over the character budget is re-encoded at lower quality, then
   at smaller sizes, so every prepared photo can be embedded in the PDF. */
export async function rasterizePrintPhoto(src, edgePx, options = {}) {
  const loadImage = options.loadImage || browserLoadImage;
  const budget = options.charBudget || PREPARED_PHOTO_CHAR_BUDGET;
  const image = await loadImage(src);
  let edge = edgePx;
  for (;;) {
    const canvas = drawPortrait(image, edge, options);
    try {
      for (const quality of [options.quality ?? 0.9, 0.75, 0.6]) {
        const data = canvas.toDataURL('image/jpeg', quality);
        if (data.length <= budget) return data;
      }
    } finally {
      // Release the bitmap now; a chart can prepare dozens of portraits.
      canvas.width = 0;
      canvas.height = 0;
    }
    if (edge <= MIN_PRINT_PHOTO_PX) throw new Error('The photo could not be compressed enough to embed in the PDF.');
    edge = Math.max(MIN_PRINT_PHOTO_PX, Math.floor(edge * 0.75));
  }
}

/**
 * Prepare every photo a print layout uses. Returns `photos` (URL → square JPEG
 * data URL sized for the printed box at the profile dpi) for
 * `renderPrintChartFragment(layout, { preparedPhotos: photos })`, and `failed`
 * listing the URLs whose image could not be decoded.
 */
export async function preparePrintPhotosFor(layout, photoDataByUrl, photoBoxForNode, options = {}) {
  const targets = printPhotoTargets(layout, photoBoxForNode);
  const photos = {};
  const failed = [];
  for (const [url, edgePx] of Object.entries(targets)) {
    const source = photoDataByUrl?.[url];
    if (!source) continue;
    try {
      photos[url] = await rasterizePrintPhoto(source, edgePx, options);
    } catch {
      failed.push(url);
    }
  }
  return { photos, failed };
}
