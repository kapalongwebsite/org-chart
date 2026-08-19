import test from 'node:test';
import assert from 'node:assert/strict';
import { cloneLayoutValue } from '../src/vanilla/cloneLayoutValue.js';

test('layout snapshots fall back safely for Vue-style reactive proxies', () => {
  const reactiveNode = new Proxy({
    id: 'person-1',
    label: 'Employee',
    data: { originalNode: { id: 1, name: 'Employee' } },
  }, {});

  assert.throws(() => structuredClone(reactiveNode), { name: 'DataCloneError' });

  const copy = cloneLayoutValue(reactiveNode);
  assert.deepEqual(copy, {
    id: 'person-1',
    label: 'Employee',
    data: { originalNode: { id: 1, name: 'Employee' } },
  });
  assert.notEqual(copy, reactiveNode);
  assert.notEqual(copy.data, reactiveNode.data);
});
