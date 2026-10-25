import test from 'node:test';
import assert from 'node:assert/strict';
import { printPhotoPixelSize, printPhotoPlacement, rasterizePrintPhoto } from '../src/print/photos.js';

test('printed photo pixel size follows the box size and dpi, within limits', () => {
  assert.equal(printPhotoPixelSize(25.4, 150), 150);
  assert.equal(printPhotoPixelSize(25.4, 600, 400), 400);
  assert.equal(printPhotoPixelSize(0.1, 72), 16);
  assert.throws(() => printPhotoPixelSize(0, 150), /size and resolution/);
});

test('photos are contained in a centred 5% overscan box', () => {
  assert.deepEqual(printPhotoPlacement(2000, 1000, 100), { x: -2.5, y: 23.75, width: 105, height: 52.5 });
  assert.deepEqual(printPhotoPlacement(500, 500, 200), { x: -5, y: -5, width: 210, height: 210 });
});

test('prepared photos are re-encoded until they fit the PDF embedding budget', async () => {
  const qualities = [];
  const edges = [];
  const data = await rasterizePrintPhoto('data:,source', 1000, {
    charBudget: 1000,
    loadImage: async () => ({ naturalWidth: 400, naturalHeight: 400 }),
    createCanvas: (width) => {
      edges.push(width);
      return {
        getContext: () => ({ fillRect() {}, drawImage() {} }),
        toDataURL: (type, quality) => { qualities.push(quality); return 'x'.repeat(width * quality * 2); },
      };
    },
  });
  assert.ok(data.length <= 1000);
  assert.deepEqual(edges, [1000, 750]);
  assert.deepEqual(qualities, [0.9, 0.75, 0.6, 0.9, 0.75, 0.6]);
});
