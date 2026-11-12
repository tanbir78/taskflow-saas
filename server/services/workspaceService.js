import { col } from '../config/db.js';
import { HttpError } from '../utilities/httpError.js';
import { logActivity } from './activity.js';

const slugify = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'workspace';
};

export async function createWorkspace(user, data) {
  const base = slugify(data.name);

  for (let i = 0; i < 5; i++) {
    const slug =
      i === 0
        ? base
        : `${base}-${Math.random().toString(36).slice(2, 6)}`;

    try {
      const now = new Date();

      const workspace = {
        ...data,
        slug,
        ownerId: user._id,
        createdAt: now,
        updatedAt: now,
      };

      const { insertedId } = await col('workspaces').insertOne(workspace);

      await col('workspaceMembers').insertOne({
        workspaceId: insertedId,
        userId: user._id,
        role: 'owner',
        joinedAt: now,
      });

      await logActivity(
        insertedId,
        user._id,
        'workspace.created',
        { name: data.name }
      );

      return col('workspaces').findOne({
        _id: insertedId,
      });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  throw new HttpError(409, 'Could not allocate a unique workspace slug');
}

export const listWorkspaces = async (user) => {
  const memberships = await col('workspaceMembers')
    .find({ userId: user._id })
    .toArray();

  const workspaceIds = memberships.map(
    (member) => member.workspaceId
  );

  const workspaces = await col('workspaces')
    .find({ _id: { $in: workspaceIds } })
    .toArray();

  const roles = new Map(
    memberships.map((member) => [
      String(member.workspaceId),
      member.role,
    ])
  );

  return workspaces.map((workspace) => ({
    ...workspace,
    role: roles.get(String(workspace._id)),
  }));
};
