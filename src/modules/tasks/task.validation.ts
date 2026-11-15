import { z } from 'zod';

export const taskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must not exceed 200 characters'),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  responsibleId: z.string().uuid('Invalid responsible user ID'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title must not be empty').max(200, 'Title must not exceed 200 characters').optional(),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  responsibleId: z.string().uuid('Invalid responsible user ID').optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' }
);

export const getTaskByIdParamsSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

export const listTasksQuerySchema = z.object({
  status: taskStatusEnum.optional(),
  responsibleId: z.string().uuid('Invalid responsible user ID').optional(),
  page: z.coerce.number().int().positive('Page must be a positive integer').optional(),
  limit: z.coerce.number().int().positive('Limit must be a positive integer').max(100, 'Limit must not exceed 100').optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetTaskByIdParams = z.infer<typeof getTaskByIdParamsSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
