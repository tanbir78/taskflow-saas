
import { col } from '../config/db.js';
import { toObjectId } from '../utilities/ids.js';
import { HttpError, asyncHandler } from '../utilities/httpError.js';
import { can } from '../utilities/permissions.js';

export const loadWorkspace = asyncHandler(async (req, _res, next) => {
  const workspaceId = toObjectId(req.params.workspaceId, 'workspaceId');

  const member = await col('workspaceMembers').findOne({
    workspaceId,
    userId: req.user._id,
  });

  if (!member) {
    // 404 avoids tenant enumeration.
    throw new HttpError(404, 'Workspace not found');
  }

  req.workspaceId = workspaceId;
  req.role = member.role;

  next();
});

export const requirePermission = (permission) => {
  return (req, _res, next) => {
    if (can(req.role, permission)) {
      return next();
    }

    next(new HttpError(403, 'Insufficient permissions'));
  };
};
