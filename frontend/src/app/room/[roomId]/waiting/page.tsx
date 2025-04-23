"use client";
import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { RoomSocket } from "@/lib/ws/roomSocket";
import { fetchRooms } from "@/lib/api/roomClient";

export default function WaitingRoom() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [starting, startTransition] = useTransition();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dots, setDots] = useState("");
  const [room, setRoom] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [roomSocket, setRoomSocket] = useState<RoomSocket | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 初回のみfetchRoomsでroom情報取得
  useEffect(() => {
    fetchRooms().then((rooms) => {
      const r = rooms.find((r) => r.id === params.roomId);
      setRoom(r);
      setUsers(r?.users || []);
    });
    // クエリパラメータからuserId, userNameを取得
    setUserId(searchParams.get("userId") || "");
    setUserName(searchParams.get("userName") || "");
  }, []); // 初回のみ

  // WebSocket接続: startイベントでゲーム画面へ遷移
  useEffect(() => {
    if (!userId) return;
    const roomId = params.roomId as string;
    const socket = new RoomSocket(roomId, userId, userName, {
      onStart: () => {
        router.push(`/room/${roomId}/game`);
      },
      onRoomInfo: (room) => {
        console.log('[WebSocket] room_info 受信:', room);
        if (room && Array.isArray(room.users)) {
          console.log('[WebSocket] users配列(room_info):', JSON.stringify(room.users));
          setUsers(room.users);
        }
        setRoom(room);
      },
      onRoomUpdated: (room) => {
        console.log('[WebSocket] room_updated 受信:', room);
        if (room && Array.isArray(room.users)) {
          console.log('[WebSocket] users配列(room_updated):', JSON.stringify(room.users));
          setUsers(room.users);
        }
        setRoom(room);
      },
    });
    socket.connect();
    setRoomSocket(socket);
    return () => {
      socket.disconnect();
    };
  }, [userId, userName, params.roomId, router]);

  const handleStart = async () => {
    setError(null);
    setIsStarting(true);
    if (roomSocket) {
      try {
        roomSocket.send(JSON.stringify({ type: 'start_game' }));
      } catch (e: any) {
        setError(e.message || "ゲーム開始に失敗しました");
        setIsStarting(false);
      }
    }
  };

  console.log("[WaitingRoom] userId:", userId);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-200 to-yellow-100 relative">
      <Link href="/" className="absolute left-4 top-4">
        <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow font-bold text-lg active:scale-95 transition">← 戻る</button>
      </Link>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 drop-shadow flex items-center">準備中<span className="ml-1 animate-pulse">{dots}</span></h2>
      <div className="w-80 bg-white bg-opacity-90 p-6 rounded-xl shadow flex flex-col items-center">
        <div className="mb-4 w-full">
          <div className="text-gray-700 font-semibold mb-2">参加者</div>
          <ul className="mb-2">
            {users.map(user => (
              <li key={user.id} className="py-1 px-2 text-gray-800 bg-gray-100 rounded mb-1">{user.name}</li>
            ))}
          </ul>
        </div>
        {/* ゲーム開始ボタン表示制御 */}
        {room && userId && room.creatorId === userId ? (
          <>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <button
              onClick={handleStart}
              className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white rounded font-bold mt-2"
              disabled={isStarting || starting}
            >
              {isStarting || starting ? "開始中..." : "ゲーム開始"}
            </button>
          </>
        ) : (
          <div className="w-full text-center text-gray-600 font-semibold mt-2">開始を待っています...</div>
        )}
      </div>
    </main>
  );
} 