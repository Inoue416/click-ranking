/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';

type Bindings = {
  ROOM_DO: DurableObjectNamespace;
};

export function wsRoutes(app: Hono<{ Bindings: Bindings }>): Hono<{ Bindings: Bindings }> {
  const ws = new Hono<{ Bindings: Bindings }>();
  
  ws.get('/:roomId', async (c) => {
    const roomId = c.req.param('roomId');
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const stub = c.env.ROOM_DO.get(c.env.ROOM_DO.idFromName(roomId));
    return stub.fetch(c.req.raw);
  });

  return ws;
} 