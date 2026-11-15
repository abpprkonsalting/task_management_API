import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must not exceed 200 characters'),
  email: z.string().email('Invalid email address').max(255, 'Email must not exceed 255 characters'),
});

export const getUserByIdParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;
