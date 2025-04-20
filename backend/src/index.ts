/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiRoutes } from './routes/api';
import { wsRoutes } from './routes/ws';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './middlewares/logger';
import { RoomDO } from './durable-objects/RoomDO';

type Bindings = {
  ROOM_DO: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// ミドルウェア
app.use('*', errorHandler);
app.use('*', logger);
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));

// ルーティング
app.route('/api', apiRoutes(app));
app.route('/ws', wsRoutes(app));

// ヘルスチェック
app.get('/', (c) => c.text('Click Ranking Game API is running!'));

export default app;
export { RoomDO }; 