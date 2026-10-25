import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutOrgChart, normalizeConfig } from '../src/core/layout.js';
import { mountChart } from './helpers/dom.mjs';

function divisionNodes() {
  const nodes = [{ id: 'office', type: 'department', label: 'Office' }];
  for (const div of ['a', 'b', 'c', 'd']) {
    nodes.push({ id: div, parentId: 'office', type: 'department', label: `Div ${div}` });
    for (let i = 0; i < 6; i += 1) nodes.push({ id: `${div}-${i}`, parentId: div, type: 'position', label: `Staff ${i}` });
  }
  return nodes;
}

test('normalizeConfig is idempotent for every orientation and target form', () => {
  for (const subtreeMode of ['GridSmart', 'AutoSmart', 'Balanced']) {
    for (const orientation of ['TopToBottom', 'BottomToTop', 'LeftToRight', 'RightToLeft']) {
      for (const target of [{ targetAspect: 1.6 }, { targetAspect: 0.7 }, { targetSize: { width: 1440, height: 900 } }]) {
        const once = normalizeConfig({ orientation, subtreeMode, ...target });
        assert.deepEqual(normalizeConfig(once), once, `${subtreeMode} ${orientation} ${JSON.stringify(target)}`);
        assert.deepEqual(normalizeConfig(JSON.parse(JSON.stringify(once))), once);
      }
    }
  }
});

test('the renderer lays out a horizontal chart with the requested wide aspect', async () => {
  const nodes = divisionNodes();
  for (const orientation of ['LeftToRight', 'RightToLeft']) {
    const { chart } = await mountChart({ nodes, orientation, subtreeMode: 'GridSmart', targetAspect: 1.6 });
    const direct = layoutOrgChart(nodes, { orientation, subtreeMode: 'GridSmart', targetAspect: 1.6 });
    const rendered = chart.getPositioned().map((p) => [p.node.id, p.cx, p.cy]);
    assert.deepEqual(rendered, direct.positioned.map((p) => [p.node.id, p.cx, p.cy]), orientation);
    assert.ok(direct.bounds.w / direct.bounds.h > 1, `${orientation} chart should be wider than tall`);
    chart.destroy();
  }
});
