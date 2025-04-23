import { Room } from '../models/room';
import { User } from '../models/user';
import { UserScore, GameResult } from '../models/game';

export class RoomDO {
  private state: DurableObjectState;
  private room: Room | null = null;
  private gameTimeout: number | null = null;
  private resultTimeout: number | null = null;
  private userScores: Map<string, UserScore> = new Map();
  private webSockets: Map<string, Set<WebSocket>> = new Map();

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const storedRoom = await this.state.storage.get<Room>('room');
      if (storedRoom) {
        this.room = storedRoom;
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);

    if (request.headers.get('Upgrade') === 'websocket') {
      const urlObj = new URL(request.url);
      const userId = urlObj.searchParams.get('userId');
      const userName = urlObj.searchParams.get('userName');
      if (!userId || !userName) {
        return new Response('userId and userName are required', { status: 400 });
      }
      if (!this.room) {
        return new Response('Room not found', { status: 404 });
      }
      const pair = new WebSocketPair();
      const [client, server] = [pair[0], pair[1]];
      server.accept();
      if (!this.webSockets.has(userId)) {
        this.webSockets.set(userId, new Set());
      }
      this.webSockets.get(userId)!.add(server);
      server.addEventListener('message', (event: MessageEvent) => {
        try {
          if (typeof event.data === 'string') {
            const message = JSON.parse(event.data);
            switch (message.type) {
              case 'click':
                this.updateClickCount(message.userId, message.clickCount);
                break;
              // 必要に応じて他のメッセージタイプも追加
            }
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      });
      server.addEventListener('close', () => {
        const set = this.webSockets.get(userId);
        if (set) {
          set.delete(server);
          if (set.size === 0) {
            this.webSockets.delete(userId);
          }
        }
      });
      setTimeout(() => {
        try {
          server.send(JSON.stringify({
            type: 'room_info',
            room: this.room
          }));
        } catch (e) {
          console.warn('WebSocket send error after accept:', e);
        }
      }, 0);
      return new Response(null, { status: 101, webSocket: server });
    }

    switch (path) {
      case 'create':
        return this.handleCreateRoom(request);
      case 'join':
        return this.handleJoinRoom(request);
      case 'start':
        return this.handleStartGame(request);
      case 'leave':
        return this.handleLeaveRoom(request);
      case 'result':
        return this.handleResult(request);
      case 'click':
        return this.handleClickUpdate(request);
      default:
        return new Response('Not found', { status: 404 });
    }
  }

  private async handleCreateRoom(request: Request): Promise<Response> {
    const data = await request.json() as { id: string; name: string; maxUsers: number; creator: User; password: string };
    const { id, name, maxUsers, creator, password } = data;

    if (this.room) {
      return new Response('Room already exists', { status: 400 });
    }

    this.room = {
      id,
      name,
      creatorId: creator.id,
      users: [creator],
      maxUsers,
      isStarted: false,
      isFinished: false,
      password: password
    };

    await this.state.storage.put('room', this.room);

    return new Response(JSON.stringify({ room: this.room }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleJoinRoom(request: Request): Promise<Response> {
    if (!this.room) {
      return new Response('Room not found', { status: 404 });
    }

    if (this.room.isStarted) {
      return new Response('Game already started', { status: 400 });
    }

    const data = await request.json() as { user: User };
    const user: User = data.user;

    // 既にルームにいるユーザーかチェック
    if (this.room.users.some(u => u.id === user.id)) {
      return new Response('User already in room', { status: 400 });
    }

    // ルームの定員チェック
    if (this.room.users.length >= this.room.maxUsers) {
      return new Response('Room is full', { status: 400 });
    }

    // users配列に追加
    this.room.users.push(user);
    await this.state.storage.put('room', this.room);
    // 全ユーザーにルーム情報を更新通知
    this.broadcastToAll({ type: 'room_updated', room: this.room });

    // ルームが満員になったら通知
    if (this.room.users.length === this.room.maxUsers) {
      this.broadcastToAll({
        type: 'room_full',
        room: this.room
      });
    }

    return new Response(JSON.stringify({ room: this.room }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleStartGame(request: Request): Promise<Response> {
    if (!this.room) {
      return new Response('Room not found', { status: 404 });
    }

    if (this.room.isStarted) {
      return new Response('Game already started', { status: 400 });
    }

    const data = await request.json() as { userId: string };
    const { userId } = data;

    // 作成者かどうかチェック
    if (this.room.creatorId !== userId) {
      return new Response('Only room creator can start the game', { status: 403 });
    }

    this.room.isStarted = true;
    this.room.isFinished = false;
    this.userScores.clear();
    await this.state.storage.put('room', this.room);

    // ゲーム開始を全ユーザーに通知（wait: 3, duration: 10）
    this.broadcastToAll({
      type: 'game_start',
      wait: 3,
      duration: 10
    });

    // ゲーム終了のタイマーをセット（10秒後に結果送信待機タイマーを開始）
    if (this.gameTimeout) {
      clearTimeout(this.gameTimeout);
    }
    this.gameTimeout = setTimeout(() => {
      // 結果送信待機タイマー（例：5秒）
      this.resultTimeout = setTimeout(() => {
        this.endGame();
      }, 5000); // 5秒待機
    }, 10000); // 10秒ゲーム本体

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleLeaveRoom(request: Request): Promise<Response> {
    if (!this.room) {
      return new Response('Room not found', { status: 404 });
    }

    const data = await request.json() as { userId: string };
    const { userId } = data;

    // users配列から削除
    this.room.users = this.room.users.filter(u => u.id !== userId);
    await this.state.storage.put('room', this.room);
    // 全ユーザーにルーム情報を更新通知
    this.broadcastToAll({ type: 'room_updated', room: this.room });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleResult(request: Request): Promise<Response> {
    if (!this.room || !this.room.isStarted || this.room.isFinished) {
      return new Response('Game not active', { status: 400 });
    }

    const data = await request.json() as { userId: string; clickCount: number };
    const { userId, clickCount } = data;

    const user = this.room.users.find(u => u.id === userId);
    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    this.userScores.set(userId, {
      userId,
      userName: user.name,
      clickCount
    });

    // 全ユーザーが送信したら即終了
    if (this.userScores.size === this.room.users.length) {
      await this.endGame();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleClickUpdate(request: Request): Promise<Response> {
    if (!this.room || !this.room.isStarted || this.room.isFinished) {
      return new Response('Game not active', { status: 400 });
    }

    const data = await request.json() as { userId: string; clickCount: number };
    const { userId, clickCount } = data;

    await this.updateClickCount(userId, clickCount);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async updateClickCount(userId: string, clickCount: number): Promise<void> {
    if (!this.room || !this.room.isStarted || this.room.isFinished) {
      return;
    }

    const user = this.room.users.find(u => u.id === userId);
    if (!user) return;

    this.userScores.set(userId, {
      userId,
      userName: user.name,
      clickCount
    });

    // 全ユーザーがクリック数を送信したらゲーム終了
    if (this.userScores.size === this.room.users.length) {
      this.endGame();
    }
  }

  private async endGame(): Promise<void> {
    if (!this.room || this.room.isFinished) return;

    // タイマーがセットされていれば解除
    if (this.gameTimeout) {
      clearTimeout(this.gameTimeout);
      this.gameTimeout = null;
    }
    if (this.resultTimeout) {
      clearTimeout(this.resultTimeout);
      this.resultTimeout = null;
    }

    this.room.isFinished = true;
    await this.state.storage.put('room', this.room);

    // 未送信ユーザーは0点で追加
    for (const user of this.room.users) {
      if (!this.userScores.has(user.id)) {
        this.userScores.set(user.id, {
          userId: user.id,
          userName: user.name,
          clickCount: 0
        });
      }
    }

    // 順位付けを行う
    const rankings = Array.from(this.userScores.values())
      .sort((a, b) => b.clickCount - a.clickCount)
      .map((score, index) => ({
        rank: index + 1,
        userId: score.userId,
        userName: score.userName,
        clickCount: score.clickCount
      }));

    const result: GameResult = { rankings };

    // 結果を全ユーザーに送信
    this.broadcastToAll({
      type: 'game_result',
      result
    });
  }

  private handleUserDisconnect(userId: string): void {
    // removeUserFromRoomは不要になったため削除
  }

  private broadcastToAll(message: any): void {
    const messageStr = JSON.stringify(message);
    console.log('[RoomDO] broadcastToAll: webSockets keys:', Array.from(this.webSockets.keys()));
    for (const [userId, set] of this.webSockets.entries()) {
      console.log(`[RoomDO] userId=${userId} connections=${set.size}`);
      for (const ws of set) {
        try {
          ws.send(messageStr);
        } catch (e) {
          console.warn('[RoomDO] ws.send error:', e);
        }
      }
    }
  }
} 