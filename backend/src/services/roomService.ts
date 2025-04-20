import { Room, RoomCreateRequest, RoomJoinRequest } from '../models/room';
import { User } from '../models/user';

export class RoomService {
  constructor(private env: Env) {}

  async createRoom(data: RoomCreateRequest, creator: User): Promise<Room> {
    const id = crypto.randomUUID();
    const stub = this.env.ROOM_DO.get(this.env.ROOM_DO.idFromName(id));
    
    const url = 'http://dummy/create';
    const response = await stub.fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        id,
        name: data.name,
        maxUsers: data.maxUsers,
        creator
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create room: ${await response.text()}`);
    }

    const result = await response.json() as { room: Room };
    return result.room;
  }

  async joinRoom(data: RoomJoinRequest): Promise<Room> {
    const stub = this.env.ROOM_DO.get(this.env.ROOM_DO.idFromName(data.roomId));
    
    const url = 'http://dummy/join';
    const response = await stub.fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        user: data.user
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to join room: ${await response.text()}`);
    }

    const result = await response.json() as { room: Room };
    return result.room;
  }

  async startGame(roomId: string, userId: string): Promise<boolean> {
    const stub = this.env.ROOM_DO.get(this.env.ROOM_DO.idFromName(roomId));
    
    const url = 'http://dummy/start';
    const response = await stub.fetch(url, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`Failed to start game: ${await response.text()}`);
    }

    const result = await response.json() as { success: boolean };
    return result.success;
  }

  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    const stub = this.env.ROOM_DO.get(this.env.ROOM_DO.idFromName(roomId));
    
    const url = 'http://dummy/leave';
    const response = await stub.fetch(url, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`Failed to leave room: ${await response.text()}`);
    }

    const result = await response.json() as { success: boolean };
    return result.success;
  }

  getWebSocketURL(roomId: string, userId: string, origin: string): string {
    return `wss://${origin}/api/rooms/${roomId}/ws?userId=${userId}`;
  }
} 