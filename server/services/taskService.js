import { col } from '../config/db.js';
import { HttpError } from '../utilities/httpError.js';
import { toObjectId } from '../utilities/ids.js';
import { logActivity } from './activity.js';

const STEP = 1024;

// Calculates task order without updating the entire column.
async function computeOrder(
  workspaceId,
  projectId,
  status,
  beforeId,
  afterId,
  excludeId
) {
  const findTask = (id) => {
    if (!id) return null;

    return col('tasks').findOne({
      _id: toObjectId(id, 'task id'),
      workspaceId,
      projectId,
      status,
    });
  };

  const above = await findTask(beforeId);
  const below = await findTask(afterId);

  if (above && below) {
    return (above.order + below.order) / 2;
  }

  if (above) {
    return above.order + STEP;
  }

  if (below) {
    return below.order - STEP;
  }

  const lastTask = await col('tasks')
    .find({
      workspaceId,
      projectId,
      status,
      _id: { $ne: excludeId },
    })
    .sort({ order: -1 })
    .limit(1)
    .toArray();

  return (lastTask[0]?.order ?? 0) + STEP;
}

export async function createTask({ workspaceId, project, user, data }) {
  const now = new Date();

  const order = await computeOrder(
    workspaceId,
    project._id,
    data.status,
    null,
    null,
    null
  );

  const task = {
    ...data,
    workspaceId,
    projectId: project._id,
    reporterId: user._id,
    assignees: [],
    order,
    checklist: [],
    attachmentsCount: 0,
    commentsCount: 0,
    version: 1,
    createdAt: now,
    updatedAt: now,
    completedAt: data.status === 'done' ? now : null,
  };

  const { insertedId } = await col('tasks').insertOne(task);

  await logActivity(
    workspaceId,
    user._id,
    'task.created',
    {
      taskId: insertedId,
      title: data.title,
    }
  );

  return {
    ...task,
    _id: insertedId,
  };
}

export async function getTask(workspaceId, projectId, taskId) {
  const task = await col('tasks').findOne({
    _id: toObjectId(taskId, 'taskId'),
    workspaceId,
    projectId,
  });

  if (!task) {
    throw new HttpError(404, 'Task not found');
  }

  return task;
}

export async function updateTask({ workspaceId, project, user, taskId, data }) {
  const { version, ...changes } = data;

  const filter = {
    _id: toObjectId(taskId, 'taskId'),
    workspaceId,
    projectId: project._id,
    ...(version ? { version } : {}),
  };

  const set = {
    ...changes,
    updatedAt: new Date(),
  };

  if (changes.status) {
    set.completedAt = changes.status === 'done' ? new Date() : null;
  }

  const updated = await col('tasks').findOneAndUpdate(
    filter,
    {
      $set: set,
      $inc: { version: 1 },
    },
    {
      returnDocument: 'after',
    }
  );

  if (!updated) {
    throw new HttpError(
      409,
      'Task not found or was changed by someone else — refresh and retry'
    );
  }

  await logActivity(
    workspaceId,
    user._id,
    'task.updated',
    {
      taskId: updated._id,
      fields: Object.keys(changes),
    }
  );

  return updated;
}

export async function moveTask({ workspaceId, project, user, taskId, data }) {
  const id = toObjectId(taskId, 'taskId');

  const order = await computeOrder(
    workspaceId,
    project._id,
    data.status,
    data.beforeTaskId,
    data.afterTaskId,
    id
  );

  const set = {
    status: data.status,
    order,
    updatedAt: new Date(),
    completedAt: data.status === 'done' ? new Date() : null,
  };

  const filter = {
    _id: id,
    workspaceId,
    projectId: project._id,
    ...(data.version ? { version: data.version } : {}),
  };

  const updated = await col('tasks').findOneAndUpdate(
    filter,
    {
      $set: set,
      $inc: { version: 1 },
    },
    {
      returnDocument: 'after',
    }
  );

  if (!updated) {
    throw new HttpError(
      409,
      'Task not found or was changed by someone else — refresh and retry'
    );
  }

  await logActivity(
    workspaceId,
    user._id,
    'task.moved',
    {
      taskId: id,
      status: data.status,
    }
  );

  return updated;
}

// Assignees must be workspace members and project members.
export async function assignTask({ workspaceId, project, user, taskId, assignees }) {
  const ids = [...new Set(assignees)].map((assignee) =>
    toObjectId(assignee, 'assignee id')
  );

  const valid = await col('workspaceMembers').countDocuments({
    workspaceId,
    userId: { $in: ids },
  });

  const inProject = ids.every((id) =>
    project.members?.some((member) => String(member) === String(id))
  );

  if (valid !== ids.length || !inProject) {
    throw new HttpError(
      400,
      'All assignees must be members of this project'
    );
  }

  const updated = await col('tasks').findOneAndUpdate(
    {
      _id: toObjectId(taskId, 'taskId'),
      workspaceId,
      projectId: project._id,
    },
    {
      $set: {
        assignees: ids,
        updatedAt: new Date(),
      },
      $inc: { version: 1 },
    },
    {
      returnDocument: 'after',
    }
  );

  if (!updated) {
    throw new HttpError(404, 'Task not found');
  }

  await logActivity(
    workspaceId,
    user._id,
    'task.assigned',
    {
      taskId: updated._id,
      assignees: ids,
    }
  );

  return updated;
}

export async function deleteTask({ workspaceId, project, user, taskId }) {
  const { deletedCount } = await col('tasks').deleteOne({
    _id: toObjectId(taskId, 'taskId'),
    workspaceId,
    projectId: project._id,
  });

  if (!deletedCount) {
    throw new HttpError(404, 'Task not found');
  }

  await logActivity(
    workspaceId,
    user._id,
    'task.deleted',
    { taskId }
  );
}
