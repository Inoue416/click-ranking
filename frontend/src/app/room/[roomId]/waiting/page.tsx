"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

// 仮データ
const mockUsers = [
  { id: "1", name: "ユーザーA" },
  { id: "2", name: "ユーザーB" },
];
const isOwner = true; // 仮: ルーム作成者かどうか

export default function WaitingRoom() {
  const params = useParams();
  const [users, setUsers] = useState(mockUsers);
  const [starting, setStarting] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setStarting(true);
    setTimeout(() => {
      alert("ゲーム開始！（本来は遷移）");
      // router.push(`/room/${params.roomId}/game`)
    }, 1000);
  };

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
        {isOwner ? (
          <button
            onClick={handleStart}
            className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white rounded font-bold mt-2"
            disabled={starting}
          >
            {starting ? "開始中..." : "ゲーム開始"}
          </button>
        ) : (
          <div className="w-full text-center text-gray-600 font-semibold mt-2">開始を待っています...</div>
        )}
      </div>
    </main>
  );
} 