/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiRoutes } from './routes/api';
import { wsRoutes } from './routes/ws';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './middlewares/logger';
import { RoomDO } from './durable-objects/RoomDO';
import { openAPISpecs } from 'hono-openapi';

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

// OpenAPI仕様エンドポイント
app.get('/openapi', openAPISpecs(app, {
  documentation: {
    info: {
      title: 'Click Ranking Game API',
      version: '1.0.0',
      description: 'Click Ranking GameのAPIドキュメント',
    },
  },
}));
// Swagger UI (CDN経由でHTML返却)
app.get('/docs', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Swagger UI</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
          window.onload = function() {
            SwaggerUIBundle({
              url: '/openapi',
              dom_id: '#swagger-ui'
            });
          };
        </script>
      </body>
    </html>
  `);
});

// ヘルスチェック
app.get('/', (c) => c.text('Click Ranking Game API is running!'));

export default app;
export { RoomDO }; 