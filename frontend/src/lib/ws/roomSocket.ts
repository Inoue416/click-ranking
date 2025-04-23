export type RoomSocketEvents = {
  onStart?: () => void;
  onUserJoin?: (user: any) => void;
  onUserLeave?: (user: any) => void;
  onRoomInfo?: (room: any) => void;
  onRoomUpdated?: (room: any) => void;
  // 必要に応じて他のイベントも追加
};

export class RoomSocket {
  private ws: WebSocket | null = null;

  constructor(
    private roomId: string,
    private userId: string,
    private userName: string,
    private events: RoomSocketEvents = {}
  ) {}

  connect() {
    const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:8787';
    const wsProtocol = backendOrigin.startsWith('https') ? 'wss' : 'ws';
    const wsHost = backendOrigin.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsHost}/ws/${this.roomId}?userId=${this.userId}&userName=${encodeURIComponent(this.userName)}`;
    this.ws = new WebSocket(wsUrl);
    this.ws.onopen = () => {
      console.log('[WebSocket] open:', wsUrl);
    };
    this.ws.onmessage = (event) => {
      console.log('[WebSocket] message:', event.data);
      try {
        const data = JSON.parse(event.data);
        if ((data.type === 'start' || data.type === 'game_start') && this.events.onStart) {
          console.log('[WebSocket] game_start/start 受信');
          this.events.onStart();
        }
        if (data.type === 'user-join' && this.events.onUserJoin) {
          this.events.onUserJoin(data.user);
        }
        if (data.type === 'user-leave' && this.events.onUserLeave) {
          this.events.onUserLeave(data.user);
        }
        if (data.type === 'room_info' && this.events.onRoomInfo) {
          this.events.onRoomInfo(data.room);
        }
        if (data.type === 'room_updated' && this.events.onRoomUpdated) {
          this.events.onRoomUpdated(data.room);
        }
      } catch (e) {
        console.warn('[WebSocket] JSON parse error:', e);
      }
    };
    this.ws.onclose = (event) => {
      console.log('[WebSocket] close:', wsUrl, event);
    };
    this.ws.onerror = (e) => {
      console.log('[WebSocket] error:', e);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: string) {
    if (this.ws) {
      this.ws.send(data);
    }
  }
} 