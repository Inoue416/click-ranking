/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { RoomController } from '../controllers/roomController';
import { GameController } from '../controllers/gameController';
import { RoomService } from '../services/roomService';
import { GameService } from '../services/gameService';
import { 
  validateRoomCreate, 
  validateRoomJoin, 
  validateRoomStart, 
  validateClickUpdate 
} from '../utils/validator';

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

  // ルーム管理API
  api.post('/rooms', validateRoomCreate, (c) => {
    const roomService = new RoomService(c.env);
    const roomController = new RoomController(roomService);
    return roomController.createRoom(c);
  });
  api.post('/rooms/:roomId/join', validateRoomJoin, (c) => {
    const roomService = new RoomService(c.env);
    const roomController = new RoomController(roomService);
    return roomController.joinRoom(c);
  });
  api.post('/rooms/:roomId/start', validateRoomStart, (c) => {
    const roomService = new RoomService(c.env);
    const roomController = new RoomController(roomService);
    return roomController.startGame(c);
  });
  api.delete('/rooms/:roomId/users/:userId', (c) => {
    const roomService = new RoomService(c.env);
    const roomController = new RoomController(roomService);
    return roomController.leaveRoom(c);
  });
  
  // ゲームAPI
  api.post('/rooms/:roomId/click', validateClickUpdate, (c) => gameController.updateClickCount(c));
  
  // WebSocket
  api.get('/rooms/:roomId/ws', (c) => roomController.handleWebSocket(c));

  return api;
}
