import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEPT_SIZE, POS_SIZE, VIRTUAL_PHOTO_FRAME, RENDERED_PHOTO,
  PHOTO_BACKGROUND, PERSON_TEXT_HEIGHT,
} from '../src/core/constants.js';
import { makeNode } from '../src/core/dataImport.js';

test('makeNode uses type-specific dimensions when a consumer omits them', () => {
  const department = makeNode({ id: 'department', type: 'department' });
  const position = makeNode({ id: 'position', type: 'position' });
  const implicitPosition = makeNode({ id: 'implicit-position' });

  assert.deepEqual(
    { width: department.width, height: department.height },
    DEPT_SIZE,
  );
  assert.deepEqual(
    { width: position.width, height: position.height },
    POS_SIZE,
  );
  assert.deepEqual(
    { width: implicitPosition.width, height: implicitPosition.height },
    POS_SIZE,
  );
});

test('approved default card and portrait geometry stays centralized', () => {
  assert.deepEqual(VIRTUAL_PHOTO_FRAME, { width: 400, height: 400 });
  assert.deepEqual(RENDERED_PHOTO, {
    width: 420,
    height: 420,
    fit: 'contain',
    align: 'center',
    offsetX: 0,
    offsetY: 0,
  });
  assert.deepEqual(POS_SIZE, { width: 240, height: 380 });
  assert.equal(PERSON_TEXT_HEIGHT, 140);
  assert.deepEqual(DEPT_SIZE, { width: 240, height: 100 });
  assert.equal(PHOTO_BACKGROUND, '#004264');
});

test('makeNode preserves explicit dimensions and defaults only the missing axis', () => {
  const explicit = makeNode({
    id: 'custom-department',
    type: 'department',
    width: 320,
    height: 90,
  });
  const widthOnly = makeNode({
    id: 'wide-department',
    type: 'department',
    width: 300,
  });

  assert.equal(explicit.width, 320);
  assert.equal(explicit.height, 90);
  assert.equal(widthOnly.width, 300);
  assert.equal(widthOnly.height, DEPT_SIZE.height);
});
