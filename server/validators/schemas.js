import { z } from 'zod';

// Workspace validation
export const workspaceCreate = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().default(''),
}).strict();

// Project validation
export const projectCreate = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(2000).optional().default(''),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#00B894'),

  status: z.enum([
    'planning',
    'active',
    'on-hold',
    'completed',
    'archived',
  ]).optional().default('planning'),

  priority: z.enum([
    'low',
    'medium',
    'high',
    'urgent',
  ]).optional().default('medium'),

  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
}).strict();

export const projectUpdate = projectCreate.partial().strict();

// Task status options
const status = z.enum([
  'backlog',
  'todo',
  'in-progress',
  'review',
  'done',
  'cancelled',
]);

// Task validation
export const taskCreate = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(10000).optional().default(''),
  status: status.optional().default('todo'),

  priority: z.enum([
    'low',
    'medium',
    'high',
    'urgent',
  ]).optional().default('medium'),

  labels: z.array(z.string().max(40)).max(20).optional().default([]),

  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.number().min(0).max(10000).optional(),
}).strict();

export const taskUpdate = taskCreate
  .partial()
  .extend({
    version: z.number().int().optional(),
  })
  .strict();

// Task movement validation
export const taskMove = z.object({
  status,

  // Neighbor above in target column
  beforeTaskId: z.string().nullable().optional(),

  // Neighbor below in target column
  afterTaskId: z.string().nullable().optional(),

  version: z.number().int().optional(),
}).strict();

// Task assignment validation
export const taskAssign = z.object({
  assignees: z.array(z.string()).max(20),
}).strict();

