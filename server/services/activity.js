import { col } from '../config/db.js';

export const logActivity = (workspaceId, actorId, action, entity) => {
  return col('activityLogs').insertOne({
    workspaceId,
    actorId,
    action,
    entity,
    createdAt: new Date(),
  });
};

