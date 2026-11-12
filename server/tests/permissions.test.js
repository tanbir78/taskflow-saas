import test from 'node:test';
import assert from 'node:assert/strict';

import {
  can,
  canAssignRole,
  wouldRemoveLastOwner,
} from '../utilities/permissions.js';

test('guest is read-only', () => {
  assert.equal(can('guest', 'task:read'), true);

  const permissions = [
    'task:create',
    'task:update',
    'comment:create',
    'project:create',
  ];

  for (const permission of permissions) {
    assert.equal(can('guest', permission), false);
  }
});

test('member can work on tasks but not assign or manage projects', () => {
  assert.equal(can('member', 'task:update'), true);
  assert.equal(can('member', 'task:assign'), false);
  assert.equal(can('member', 'project:create'), false);
});

test('manager manages projects/assignment but not workspace/billing', () => {
  assert.equal(can('manager', 'project:create'), true);
  assert.equal(can('manager', 'task:assign'), true);
  assert.equal(can('manager', 'workspace:billing'), false);
  assert.equal(can('manager', 'member:role'), false);
});

test('owner has full control', () => {
  const permissions = [
    'workspace:delete',
    'workspace:billing',
    'member:role',
  ];

  for (const permission of permissions) {
    assert.equal(can('owner', permission), true);
  }
});

test('unknown permission or role is denied by default', () => {
  assert.equal(can('owner', 'nope:nope'), false);
  assert.equal(can('superadmin', 'task:read'), false);
  assert.equal(can(undefined, 'task:read'), false);
});

test('only owners may assign roles; invalid roles rejected', () => {
  assert.equal(canAssignRole('manager', 'owner'), false);
  assert.equal(canAssignRole('owner', 'manager'), true);
  assert.equal(canAssignRole('owner', 'root'), false);
});

test('last owner cannot be removed or demoted', () => {
  const one = [
    { userId: 'a', role: 'owner' },
    { userId: 'b', role: 'member' },
  ];

  assert.equal(wouldRemoveLastOwner(one, 'a'), true);
  assert.equal(wouldRemoveLastOwner(one, 'a', 'manager'), true);

  const two = [
    ...one,
    { userId: 'c', role: 'owner' },
  ];

  assert.equal(wouldRemoveLastOwner(two, 'a'), false);
  assert.equal(wouldRemoveLastOwner(one, 'b'), false);
});

