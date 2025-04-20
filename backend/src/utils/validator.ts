import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const roomCreateSchema = z.object({
  name: z.string().min(1).max(50),
  maxUsers: z.number().int().min(2).max(10),
  password: z.string().min(1).max(32)
});

export const roomJoinSchema = z.object({
  userName: z.string().min(1).max(20).optional(),
  password: z.string().min(1).max(32)
});

export const roomStartSchema = z.object({
  userId: z.string().uuid()
});

export const clickUpdateSchema = z.object({
  userId: z.string().uuid(),
  clickCount: z.number().int().min(0)
});

export const validateRoomCreate = zValidator('json', roomCreateSchema);
export const validateRoomJoin = zValidator('query', roomJoinSchema);
export const validateRoomStart = zValidator('json', roomStartSchema);
export const validateClickUpdate = zValidator('json', clickUpdateSchema); 