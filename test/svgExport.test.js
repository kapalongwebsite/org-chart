import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChartSVG } from '../src/core/svgExport.js';

test('SVG export clips the approved centred 5 percent photo overscan', () => {
  const node = {
    id: 'person-1',
    parentId: '',
    type: 'position',
    label: 'MUN. GOVERNMENT DEPARTMENT HEAD I (MUNICIPAL ENVIRONMENT AND NATURAL RESOURCES OFFICER I)',
    personName: 'JOSELITO V. RIVERO, CE, M.ENG, REA',
    status: 'FILLED',
    width: 240,
    height: 380,
    data: { photo_url: 'https://example.test/photo.png' },
  };
  const svg = buildChartSVG(
    [{ node, cx: 120, cy: 190, w: 240, h: 380, parentId: '', routeType: 'bus' }],
    [],
    {
      bounds: { x: 0, y: 0, w: 240, h: 380 },
      photoHeight: 240,
      photoContain: true,
      virtualPhotoFrame: { width: 400, height: 400 },
      renderedImage: { width: 420, height: 420, fit: 'contain', align: 'center', offsetX: 0, offsetY: 0 },
      photoBackground: '#004264',
      measureText: (value) => value.length * 7,
    },
  );

  assert.match(svg, /width="240" height="380" viewBox="0 0 240 380"/);
  assert.match(svg, /fill="#004264"/);
  assert.match(svg, /clipPath id="loc-photo-clip-0"/);
  assert.match(svg, /x="-6\.00" y="-6\.00" width="252\.00" height="252\.00"/);
  assert.match(svg, /preserveAspectRatio="xMidYMid meet" clip-path="url\(#loc-photo-clip-0\)"/);
  assert.match(svg, /JOSELITO V\./);
});
