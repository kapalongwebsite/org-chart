import { measureText } from './helveticaMetrics.js';

// Print card text is wrapped by measured Helvetica width, not character
// count. jsPDF's metrics are close to, but not exactly, what a viewer's
// Helvetica draws, so lines keep a small reserve inside the available width.
const WIDTH_RESERVE = 0.97;
export const LINE_HEIGHT = 1.15;
const ELLIPSIS = '…';

function fits(text, maxWidth, fontSize, weight) {
  return measureText(text, fontSize, weight) <= maxWidth * WIDTH_RESERVE;
}

/* Split a word that is wider than the line into the longest fitting pieces. */
function breakWord(word, maxWidth, fontSize, weight) {
  const pieces = [];
  let piece = '';
  for (const char of word) {
    if (piece && !fits(piece + char, maxWidth, fontSize, weight)) {
      pieces.push(piece);
      piece = char;
    } else {
      piece += char;
    }
  }
  if (piece) pieces.push(piece);
  return pieces;
}

/* Pieces of one word that may end a line: after each hyphen, and inside any
   piece that is still wider than the line on its own. */
function wordPieces(word, maxWidth, fontSize, weight) {
  const hyphenated = word.match(/[^-]+-+|[^-]+$|-+/g) || [word];
  return hyphenated.flatMap((piece) => (
    fits(piece, maxWidth, fontSize, weight) ? [piece] : breakWord(piece, maxWidth, fontSize, weight)
  ));
}

/* Greedy word wrap. Words wider than a line break after a hyphen first, then
   between characters. */
export function wrapByWidth(text, maxWidth, fontSize, weight = 'normal') {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const pieces = fits(word, maxWidth, fontSize, weight) ? [word] : wordPieces(word, maxWidth, fontSize, weight);
    pieces.forEach((piece, index) => {
      // Later pieces of the same word continue it without a space.
      const next = line ? `${line}${index ? '' : ' '}${piece}` : piece;
      if (line && !fits(next, maxWidth, fontSize, weight)) {
        lines.push(line);
        line = piece;
      } else {
        line = next;
      }
    });
  }
  if (line) lines.push(line);
  return lines;
}

/* Keep at most `maxLines`; the last kept line ends with an ellipsis when text was dropped. */
export function clampLines(lines, maxLines, maxWidth, fontSize, weight = 'normal') {
  const limit = Math.max(0, Math.floor(maxLines));
  if (lines.length <= limit) return { lines, truncated: false };
  if (limit === 0) return { lines: [], truncated: lines.length > 0 };
  const kept = lines.slice(0, limit);
  let last = kept[limit - 1];
  while (last && !fits(last + ELLIPSIS, maxWidth, fontSize, weight)) last = last.slice(0, -1).trimEnd();
  kept[limit - 1] = last + ELLIPSIS;
  return { lines: kept, truncated: true };
}

function blockHeight(groups) {
  return groups.reduce((sum, group) => sum + group.lines.length * group.fontSize * LINE_HEIGHT, 0);
}

/**
 * Lay out stacked text blocks (for example a bold name over a regular title)
 * inside `width` × `height`. Font sizes shrink together, never below
 * `minFontSize`; when the text still does not fit, the last blocks lose lines
 * and end with an ellipsis, and `truncated` is true.
 */
export function fitTextBlocks(blocks, width, height, minFontSize) {
  const smallest = Math.min(...blocks.map((block) => block.fontSize));
  const floor = Math.min(1, minFontSize / smallest);
  const scales = [];
  for (let scale = 1; scale > floor + 1e-9; scale -= 0.04) scales.push(scale);
  scales.push(floor);

  const wrapAt = (scale) => blocks.map((block) => {
    const fontSize = block.fontSize * scale;
    return { ...block, fontSize, lines: wrapByWidth(block.text, width, fontSize, block.weight) };
  });

  for (const scale of scales) {
    const groups = wrapAt(scale);
    if (blockHeight(groups) <= height) return { groups, truncated: false, scale };
  }

  const groups = wrapAt(floor);
  let truncated = false;
  let remaining = height;
  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index];
    const lineHeight = group.fontSize * LINE_HEIGHT;
    const laterMinimum = groups.slice(index + 1)
      .reduce((sum, later) => sum + (later.lines.length ? later.fontSize * LINE_HEIGHT : 0), 0);
    const ownLimit = group.maxLines ?? Infinity;
    const allowed = Math.min(ownLimit, Math.max(group.lines.length ? 1 : 0, Math.floor((remaining - laterMinimum) / lineHeight + 1e-9)));
    const clamped = clampLines(group.lines, allowed, width, group.fontSize, group.weight);
    group.lines = clamped.lines;
    truncated = truncated || clamped.truncated;
    remaining -= group.lines.length * lineHeight;
  }
  return { groups, truncated, scale: floor };
}
