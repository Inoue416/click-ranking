"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 仮のルーム一覧取得API
const fetchRooms = async () => {
  // 本来はAPIから取得
  return [
    { id: "room1", name: "ルームA" },
    { id: "room2", name: "ルームB" },
  ];
};

export default function RoomJoin() {
  const [userName, setUserName] = useState("");
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 本来はAPIで参加処理
      alert(`参加: ${selectedRoom}, ユーザー名: ${userName}, 合言葉: ${password}`);
      // router.push(`/room/${selectedRoom}/waiting`); // 実装時はこちら
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-200 to-yellow-100 relative">
      <Link href="/" className="absolute left-4 top-4">
        <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow font-bold text-lg active:scale-95 transition">← 戻る</button>
      </Link>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 drop-shadow">ルーム参加</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 bg-white bg-opacity-90 p-6 rounded-xl shadow">
        <label className="text-gray-700 font-semibold">ユーザー名
          <input
            type="text"
            placeholder="ユーザー名"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            required
            className="p-3 border rounded w-full mt-1"
          />
        </label>
        <div>
          <label className="block mb-2 text-gray-700 font-semibold">ルーム選択</label>
          <select
            value={selectedRoom}
            onChange={e => setSelectedRoom(e.target.value)}
            required
            className="p-3 border rounded w-full text-gray-800 bg-white"
          >
            <option value="">選択してください</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>
        <label className="text-gray-700 font-semibold">合言葉
          <input
            type="password"
            placeholder="合言葉"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="p-3 border rounded w-full mt-1"
          />
        </label>
        <button
          type="submit"
          className="py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded font-bold"
          disabled={loading}
        >
          {loading ? "参加中..." : "ルーム参加"}
        </button>
      </form>
    </main>
  );
} 