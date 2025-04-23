/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { RoomController } from '../controllers/roomController';
import { GameController } from '../controllers/gameController';
import { RoomService } from '../services/roomService';
import { GameService } from '../services/gameService';
import { 
  roomCreateSchema,
  roomJoinSchema,
  roomStartSchema,
  clickUpdateSchema
} from '../utils/validator';
import { describeRoute } from 'hono-openapi';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

type Bindings = {
  ROOM_DO: DurableObjectNamespace;
};

export function apiRoutes(app: Hono<{ Bindings: Bindings }>): Hono<{ Bindings: Bindings }> {
  const api = new Hono<{ Bindings: Bindings }>();
  
  // サービスの初期化
  const roomService = new RoomService(app as any);
  const gameService = new GameService(app as any);
  
  // コントローラーの初期化
  const roomController = new RoomController(roomService);
  const gameController = new GameController(gameService);

  // ルーム作成API（openapi化）
  api.post(
    '/rooms',
    describeRoute({
      summary: 'ルーム作成',
      tags: ['Room'],
      requestBody: {
        content: {
          'application/json': {
            schema: roomCreateSchema,
          },
        },
      },
      responses: {
        200: {
          description: 'ルーム作成成功',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean(),
                room: z.any(), // Room型のzodスキーマを定義する場合はここに
                user: z.any(), // User型のzodスキーマを定義する場合はここに
                wsUrl: z.string(),
              }),
            },
          },
        },
      },
    }),
    zValidator('json', roomCreateSchema),
    (c) => {
      const roomService = new RoomService(c.env);
      const roomController = new RoomController(roomService);
      return roomController.createRoom(c);
    }
  );
  // ルーム参加API
  api.post(
    '/rooms/:roomId/join',
    describeRoute({
      summary: 'ルーム参加',
      tags: ['Room'],
      requestQuery: roomJoinSchema,
      responses: {
        200: {
          description: 'ルーム参加成功',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean(),
                room: z.any(),
                user: z.any(),
                wsUrl: z.string(),
              }),
            },
          },
        },
      },
    }),
    zValidator('query', roomJoinSchema),
    (c) => {
      const roomService = new RoomService(c.env);
      const roomController = new RoomController(roomService);
      return roomController.joinRoom(c);
    }
  );
  // ゲーム開始API
  api.post(
    '/rooms/:roomId/start',
    describeRoute({
      summary: 'ゲーム開始',
      tags: ['Room'],
      requestBody: {
        content: {
          'application/json': {
            schema: roomStartSchema,
          },
        },
      },
      responses: {
        200: {
          description: 'ゲーム開始成功',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean(),
              }),
            },
          },
        },
      },
    }),
    zValidator('json', roomStartSchema),
    (c) => {
      const roomService = new RoomService(c.env);
      const roomController = new RoomController(roomService);
      return roomController.startGame(c);
    }
  );
  // ルーム退出API
  api.delete(
    '/rooms/:roomId/users/:userId',
    describeRoute({
      summary: 'ルーム退出',
      tags: ['Room'],
      responses: {
        200: {
          description: 'ルーム退出成功',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean(),
              }),
            },
          },
        },
      },
    }),
    (c) => {
      const roomService = new RoomService(c.env);
      const roomController = new RoomController(roomService);
      return roomController.leaveRoom(c);
    }
  );
  // ゲームAPI
  api.post(
    '/rooms/:roomId/click',
    describeRoute({
      summary: 'クリック数更新',
      tags: ['Game'],
      requestBody: {
        content: {
          'application/json': {
            schema: clickUpdateSchema,
          },
        },
      },
      responses: {
        200: {
          description: 'クリック数更新成功',
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean(),
              }),
            },
          },
        },
      },
    }),
    zValidator('json', clickUpdateSchema),
    (c) => gameController.updateClickCount(c)
  );
  // WebSocket
  api.get(
    '/rooms/:roomId/ws',
    describeRoute({
      summary: 'WebSocket接続',
      tags: ['Room'],
      requestQuery: z.object({ userId: z.string().uuid() }),
      responses: {
        101: { description: 'Switching Protocols' },
        400: { description: 'User ID is required' },
      },
    }),
    (c) => roomController.handleWebSocket(c)
  );
  // ルーム一覧取得API
  api.get(
    '/rooms',
    async (c) => {
      const roomService = new RoomService(c.env);
      const roomController = new RoomController(roomService);
      return roomController.getRooms(c);
    }
  );

  return api;
}

