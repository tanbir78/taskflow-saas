// Central permission matrix. Backend is the source of truth.
export const ROLES = [
  'owner',
  'manager',
  'member',
  'guest',
];

const RANK = {
  guest: 0,
  member: 1,
  manager: 2,
  owner: 3,
};

export const PERMISSIONS = {
  'workspace:update': 'owner',
  'workspace:delete': 'owner',
  'workspace:billing': 'owner',
  'member:invite': 'manager',
  'member:remove': 'manager',
  'member:role': 'owner',
  'project:create': 'manager',
  'project:update': 'manager',
  'project:delete': 'manager',
  'task:create': 'member',
  'task:update': 'member',
  'task:assign': 'manager',
  'task:delete': 'manager',
  'comment:create': 'member',
  'time:track': 'member',
  'analytics:team': 'manager',
  'workspace:read': 'guest',
  'project:read': 'guest',
  'task:read': 'guest',
};

export const can = (role, permission) => {
  const min = PERMISSIONS[permission];

  // Deny access by default.
  if (!min || !(role in RANK)) {
    return false;
  }

  return RANK[role] >= RANK[min];
};

export const canAssignRole = (actorRole, newRole) => {
  return actorRole === 'owner' && ROLES.includes(newRole);
};

export const wouldRemoveLastOwner = (
  members,
  targetUserId,
  newRole = null
) => {
  const owners = members.filter(
    (member) => member.role === 'owner'
  );

  const target = owners.find(
    (member) => member.userId === targetUserId
  );

  return Boolean(target) && owners.length === 1 && newRole !== 'owner';
};


