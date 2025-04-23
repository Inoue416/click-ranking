import { Context } from 'hono';
import { RoomService } from '../services/roomService';
import { RoomCreateRequest, RoomJoinRequest } from '../models/room';
import { User } from '../models/user';

export class RoomController {
  constructor(private roomService: RoomService) {}

  async createRoom(c: Context): Promise<Response> {
    try {
      const data = await c.req.json<RoomCreateRequest>();
      const creator: User = {
        id: crypto.randomUUID(),
        name: `User-${Math.floor(Math.random() * 1000)}`
      };
      const origin = c.req.header('Host');

      const room = await this.roomService.createRoom(data, creator);
      
      return c.json({
        success: true,
        room,
        user: creator,
        wsUrl: this.roomService.getWebSocketURL(room.id, creator.id, origin ?? "")
      });
    } catch (error) {
      console.error('Error creating room:', error);
      return c.json({ success: false, error: (error as Error).message }, 500);
    }
  }

  async joinRoom(c: Context): Promise<Response> {
    try {
      const roomId = c.req.param('roomId');
      const userName = c.req.query('userName') || `User-${Math.floor(Math.random() * 1000)}`;
      const password = c.req.query('password');
      const origin = c.req.header('Host');

      const user: User = {
        id: crypto.randomUUID(),
        name: userName
      };

      const joinRequest: RoomJoinRequest = {
        roomId,
        user,
        password: password || ''
      };

      const room = await this.roomService.joinRoom(joinRequest);
      
      return c.json({
        success: true,
        room,
        user,
        wsUrl: this.roomService.getWebSocketURL(room.id, user.id, origin ?? "")
      });
    } catch (error) {
      console.error('Error joining room:', error);
      return c.json({ success: false, error: (error as Error).message }, 500);
    }
  }

  async startGame(c: Context): Promise<Response> {
    try {
      const roomId = c.req.param('roomId');
      const { userId } = await c.req.json();
      const success = await this.roomService.startGame(roomId, userId);
      return c.json({ success });
    } catch (error) {
      return c.json({ success: false, error: (error as Error).message }, 403);
    }
  }

  async leaveRoom(c: Context): Promise<Response> {
    try {
      const roomId = c.req.param('roomId');
      const userId = c.req.param('userId');
      
      const success = await this.roomService.leaveRoom(roomId, userId);
      
      return c.json({ success });
    } catch (error) {
      console.error('Error leaving room:', error);
      return c.json({ success: false, error: (error as Error).message }, 500);
    }
  }

  async handleWebSocket(c: Context): Promise<Response> {
    try {
      const roomId = c.req.param('roomId');
      const userId = c.req.query('userId');
      
      if (!userId) {
        return c.json({ success: false, error: 'User ID is required' }, 400);
      }

      const stub = c.env.ROOM_DO.get(c.env.ROOM_DO.idFromName(roomId));
      return stub.fetch(c.req.raw);
    } catch (error) {
      console.error('Error handling WebSocket:', error);
      return c.json({ success: false, error: (error as Error).message }, 500);
    }
  }

  async getRooms(c: Context): Promise<Response> {
    try {
      const rooms = await this.roomService.getRooms();
      // パスワードなどは除外して返す
      const safeRooms = rooms.map(({ password, ...rest }) => rest);
      return c.json(safeRooms);
    } catch (error) {
      console.error('Error getting rooms:', error);
      return c.json({ success: false, error: (error as Error).message }, 500);
    }
  }
} 