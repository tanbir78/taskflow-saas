import { col } from '../config/db.js';
import { HttpError } from '../utilities/httpError.js';
import { toObjectId } from '../utilities/ids.js';
import { logActivity } from './activity.js';

const slugify = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'project';
};

export async function createProject({ workspaceId, user, data }) {
  const now = new Date();

  for (let i = 0; i < 5; i++) {
    const slug =
      i === 0
        ? slugify(data.name)
        : `${slugify(data.name)}-${Math.random().toString(36).slice(2, 6)}`;

    try {
      const project = {
        ...data,
        workspaceId,
        slug,
        ownerId: user._id,
        members: [user._id],
        createdAt: now,
        updatedAt: now,
      };

      const { insertedId } = await col('projects').insertOne(project);

      await logActivity(
        workspaceId,
        user._id,
        'project.created',
        {
          projectId: insertedId,
          name: data.name,
        }
      );

      return {
        ...project,
        _id: insertedId,
      };
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  throw new HttpError(409, 'Could not allocate a unique project slug');
}

export async function listProjects({
  workspaceId,
  user,
  role,
  q,
  status,
  page = 1,
  limit = 20,
}) {
  const filter = { workspaceId };

  if (status) {
    filter.status = String(status);
  }

  if (q) {
    filter.name = {
      $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  }

  if (role === 'guest' || role === 'member') {
    filter.members = user._id;
  }

  const lim = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const skip =
    (Math.max(Number(page) || 1, 1) - 1) * lim;

  const [items, total] = await Promise.all([
    col('projects')
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(lim)
      .toArray(),

    col('projects').countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: Number(page) || 1,
    limit: lim,
  };
}

// Checks project access within the workspace.
export async function getAccessibleProject({
  workspaceId,
  projectId,
  user,
  role,
}) {
  const project = await col('projects').findOne({
    _id: toObjectId(projectId, 'projectId'),
    workspaceId,
  });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  const privileged = role === 'owner' || role === 'manager';

  if (
    !privileged &&
    !project.members.some((member) => String(member) === String(user._id))
  ) {
    throw new HttpError(404, 'Project not found');
  }

  return project;
}
