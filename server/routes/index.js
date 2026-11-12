import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  loadWorkspace,
  requirePermission as need,
} from '../middleware/workspace.js';
import { asyncHandler } from '../utilities/httpError.js';
import * as S from '../validators/schemas.js';
import * as ws from '../services/workspaceService.js';
import * as pj from '../services/projectService.js';
import * as tk from '../services/taskService.js';
import { col } from '../config/db.js';
import { emitToWorkspace } from '../socket/index.js';

const router = Router();
router.use(verifyToken);
const ok = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

// User profile and workspace routes
router.get('/me', (req, res) => {
  return ok(res, {
    _id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    photoURL: req.user.photoURL,
    platformRole: req.user.platformRole,
  });
});

router.get(
  '/workspaces',
  asyncHandler(async (req, res) => {
    return ok(res, await ws.listWorkspaces(req.user));
  })
);

router.post(
  '/workspaces',
  asyncHandler(async (req, res) => {
    const data = S.workspaceCreate.parse(req.body);
    const workspace = await ws.createWorkspace(req.user, data);

    return ok(res, workspace, 201);
  })
);

// Workspace routes
const W = '/workspaces/:workspaceId';

router.get(
  W,
  loadWorkspace,
  asyncHandler(async (req, res) => {
    const workspace = await col('workspaces').findOne({
      _id: req.workspaceId,
    });

    return ok(res, {
      ...workspace,
      role: req.role,
    });
  })
);

router.get(
  `${W}/projects`,
  loadWorkspace,
  need('project:read'),
  asyncHandler(async (req, res) => {
    return ok(
      res,
      await pj.listProjects({
        workspaceId: req.workspaceId,
        user: req.user,
        role: req.role,
        ...req.query,
      })
    );
  })
);

router.post(
  `${W}/projects`,
  loadWorkspace,
  need('project:create'),
  asyncHandler(async (req, res) => {
    const project = await pj.createProject({
      workspaceId: req.workspaceId,
      user: req.user,
      data: S.projectCreate.parse(req.body),
    });

    return ok(res, project, 201);
  })
);

// Project routes
const P = `${W}/projects/:projectId`;

const withProject = asyncHandler(async (req, _res, next) => {
  req.project = await pj.getAccessibleProject({
    workspaceId: req.workspaceId,
    projectId: req.params.projectId,
    user: req.user,
    role: req.role,
  });

  next();
});

router.get(
  P,
  loadWorkspace,
  need('project:read'),
  withProject,
  (req, res) => {
    return ok(res, req.project);
  }
);

router.patch(
  P,
  loadWorkspace,
  need('project:update'),
  withProject,
  asyncHandler(async (req, res) => {
    const data = S.projectUpdate.parse(req.body);

    const project = await col('projects').findOneAndUpdate(
      {
        _id: req.project._id,
        workspaceId: req.workspaceId,
      },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      }
    );

    return ok(res, project);
  })
);

// Task routes
router.get(
  `${P}/tasks`,
  loadWorkspace,
  need('task:read'),
  withProject,
  asyncHandler(async (req, res) => {
    const { status, q, assignee } = req.query;

    const filter = {
      workspaceId: req.workspaceId,
      projectId: req.project._id,
    };

    if (typeof status === 'string') {
      filter.status = status;
    }

    if (typeof q === 'string' && q) {
      filter.title = {
        $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i',
      };
    }

    if (typeof assignee === 'string') {
      filter.assignees = (
        await import('../utilities/ids.js')
      ).toObjectId(assignee, 'assignee');
    }

    const tasks = await col('tasks')
      .find(filter)
      .sort({ status: 1, order: 1 })
      .limit(1000)
      .toArray();

    return ok(res, tasks);
  })
);

router.post(
  `${P}/tasks`,
  loadWorkspace,
  need('task:create'),
  withProject,
  asyncHandler(async (req, res) => {
    const task = await tk.createTask({
      workspaceId: req.workspaceId,
      project: req.project,
      user: req.user,
      data: S.taskCreate.parse(req.body),
    });

    emitToWorkspace(req.workspaceId, 'task:created', task);

    return ok(res, task, 201);
  })
);

router.patch(
  `${P}/tasks/:taskId`,
  loadWorkspace,
  need('task:update'),
  withProject,
  asyncHandler(async (req, res) => {
    const task = await tk.updateTask({
      workspaceId: req.workspaceId,
      project: req.project,
      user: req.user,
      taskId: req.params.taskId,
      data: S.taskUpdate.parse(req.body),
    });

    emitToWorkspace(req.workspaceId, 'task:updated', task);

    return ok(res, task);
  })
);

router.post(
  `${P}/tasks/:taskId/move`,
  loadWorkspace,
  need('task:update'),
  withProject,
  asyncHandler(async (req, res) => {
    const task = await tk.moveTask({
      workspaceId: req.workspaceId,
      project: req.project,
      user: req.user,
      taskId: req.params.taskId,
      data: S.taskMove.parse(req.body),
    });

    emitToWorkspace(req.workspaceId, 'task:moved', task);

    return ok(res, task);
  })
);

router.put(
  `${P}/tasks/:taskId/assignees`,
  loadWorkspace,
  need('task:assign'),
  withProject,
  asyncHandler(async (req, res) => {
    const assignees = S.taskAssign.parse(req.body).assignees;

    const task = await tk.assignTask({
      workspaceId: req.workspaceId,
      project: req.project,
      user: req.user,
      taskId: req.params.taskId,
      assignees,
    });

    emitToWorkspace(req.workspaceId, 'task:updated', task);

    return ok(res, task);
  })
);

router.delete(
  `${P}/tasks/:taskId`,
  loadWorkspace,
  need('task:delete'),
  withProject,
  asyncHandler(async (req, res) => {
    await tk.deleteTask({
      workspaceId: req.workspaceId,
      project: req.project,
      user: req.user,
      taskId: req.params.taskId,
    });

    emitToWorkspace(req.workspaceId, 'task:deleted', {
      _id: req.params.taskId,
    });

    return ok(res, { deleted: true });
  })
);

export default router;
