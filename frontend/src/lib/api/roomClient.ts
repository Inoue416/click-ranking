const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787";

export type CreateRoomRequest = {
  name: string;
  maxUsers: number;
  password: string;
};
export type CreateRoomResponse = {
  success: boolean;
  room: {
    id: string;
    name: string;
    maxUsers: number;
    users: any[];
    isStarted: boolean;
    isFinished: boolean;
    creatorId: string;
  };
  user: any;
  wsUrl: string;
};

export async function createRoom(body: CreateRoomRequest): Promise<CreateRoomResponse> {
  const res = await fetch(`${API_BASE}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('ルーム作成に失敗しました');
  return res.json();
}

export type JoinRoomRequest = {
  roomId: string;
  userName: string;
  password: string;
};
export type JoinRoomResponse = {
  success: boolean;
  room: {
    id: string;
    name: string;
    maxUsers: number;
    users: any[];
    isStarted: boolean;
    isFinished: boolean;
    creatorId: string;
  };
  user: any;
  wsUrl: string;
};

export async function joinRoom({ roomId, userName, password }: JoinRoomRequest): Promise<JoinRoomResponse> {
  const params = new URLSearchParams({ userName, password });
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/join?${params.toString()}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('ルーム参加に失敗しました');
  return res.json();
}

export type StartGameRequest = {
  roomId: string;
  userId: string;
};
export type StartGameResponse = {
  success: boolean;
};

export async function startGame({ roomId, userId }: StartGameRequest): Promise<StartGameResponse> {
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('ゲーム開始に失敗しました');
  return res.json();
}

export type RoomSummary = {
  id: string;
  name: string;
  maxUsers: number;
  users: any[];
  isStarted: boolean;
  isFinished: boolean;
  creatorId: string;
};

export async function fetchRooms(): Promise<RoomSummary[]> {
  const res = await fetch(`${API_BASE}/api/rooms`);
  if (!res.ok) throw new Error('ルーム一覧取得に失敗しました');
  return res.json();
}

export type SendClickCountRequest = {
  roomId: string;
  userId: string;
  clickCount: number;
};

export type SendClickCountResponse = {
  success: boolean;
};

export async function sendClickCount({ roomId, userId, clickCount }: SendClickCountRequest): Promise<SendClickCountResponse> {
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, clickCount }),
  });
  if (!res.ok) throw new Error('スコア送信に失敗しました');
  return res.json();
} 