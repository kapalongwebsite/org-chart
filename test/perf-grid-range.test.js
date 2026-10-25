import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutOrgChart } from '../src/core/layout.js';

const office = [
  { id: 'office', type: 'department', label: 'Office' },
  { id: 'a', parentId: 'office', type: 'position', label: 'A' },
  { id: 'b', parentId: 'office', type: 'position', label: 'B' },
  { id: 'sec', parentId: 'office', type: 'department', label: 'Section' },
  { id: 'c', parentId: 'sec', type: 'position', label: 'C' },
];

const finite = (result) => result.positioned.every((p) => Number.isFinite(p.cx) && Number.isFinite(p.cy)
  && (!p.routePoints || p.routePoints.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))));

test('GridSmart and AutoSmart accept every grid size the settings offer and zero spacing', () => {
  for (const subtreeMode of ['GridSmart', 'AutoSmart']) {
    for (const orientation of ['TopToBottom', 'LeftToRight']) {
      for (let gridSize = 6; gridSize <= 80; gridSize += 2) {
        for (const [spacingX, spacingY] of [[40, 70], [0, 0], [40, 0], [0, 70]]) {
          const label = `${subtreeMode} ${orientation} grid ${gridSize} spacing ${spacingX}/${spacingY}`;
          let result;
          assert.doesNotThrow(() => { result = layoutOrgChart(office, { subtreeMode, orientation, gridSize, spacingX, spacingY }); }, label);
          assert.ok(finite(result), label);
        }
      }
    }
  }
});
