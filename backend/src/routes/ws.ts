/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { upgradeWebSocket } from 'hono/cloudflare-workers';

type Bindings = {
  ROOM_DO: DurableObjectNamespace;
};

// 簡易的なルーム管理（本番ではDOやDBで管理）
const roomSockets: Record<string, Set<WebSocket>> = {};
const roomUsers: Record<string, { id: string; name: string }[]> = {};

export function wsRoutes(app: Hono<{ Bindings: Bindings }>): Hono<{ Bindings: Bindings }> {
  const ws = new Hono<{ Bindings: Bindings }>();
  
  ws.get(
    '/:roomId',
    upgradeWebSocket((c) => {
      const roomId = c.req.param('roomId');
      const userId = c.req.query('userId');
      const userName = c.req.query('userName');
      if (!userId || !userName) {
        throw new Error('userId and userName are required');
      }
      if (!roomSockets[roomId]) roomSockets[roomId] = new Set();
      if (!roomUsers[roomId]) roomUsers[roomId] = [];
      // 既にいなければ追加
      if (!roomUsers[roomId].some(u => u.id === userId)) {
        roomUsers[roomId].push({ id: userId, name: userName });
      }
      return {
        onMessage(event, ws: any) {
          // ゲーム開始リクエストを受信したら全員にgame_startを送信
          (async () => {
            try {
              let text = '';
              if (typeof event.data === 'string') {
                text = event.data;
              } else if (event.data instanceof Blob) {
                text = await event.data.text();
              }
              if (!text) return;
              const data = JSON.parse(text);
              if (data.type === 'start_game') {
                const msg = JSON.stringify({ type: 'game_start', wait: 3, duration: 10 });
                for (const client of roomSockets[roomId]) {
                  client.send(msg);
                }
              }
            } catch (e) {
              // 通常のテキストメッセージ等は無視
            }
          })();
        },
        onClose(ws: any) {
          roomSockets[roomId].delete(ws);
          // ユーザーが全て切断されたらusersからも削除
          // ここでは簡易的にuserIdで1接続=1ユーザーとする
          // 本番ではuserIdごとに複数接続を許容する場合は工夫が必要
        },
        onError(e: any) {
          console.error('WebSocket error:', e);
        },
        onOpen(ws: any) {
          roomSockets[roomId].add(ws);
          // 参加者リストを全員にブロードキャスト
          const info = JSON.stringify({ type: 'room_info', room: { id: roomId, users: roomUsers[roomId] } });
          for (const client of roomSockets[roomId]) {
            client.send(info);
          }
        },
      };
    })
  );

  return ws;
} 