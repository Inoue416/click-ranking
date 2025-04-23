"use client";
import { useRef, useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { joinRoomServerAction } from "./actions";
import { fetchRooms, RoomSummary } from "@/lib/api/roomClient";

export default function RoomJoin() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);

  useEffect(() => {
    fetchRooms().then(setRooms).catch(() => setRooms([]));
  }, []);

  async function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await joinRoomServerAction(formData);
      if (res.success) {
        router.push(`/room/${res.roomId}/waiting?userId=${res.userId}&userName=${encodeURIComponent(res.userName)}`);
      } else {
        setError(res.error || "ルーム参加に失敗しました");
      }
    });
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-200 to-yellow-100 relative">
      <Link href="/" className="absolute left-4 top-4">
        <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow font-bold text-lg active:scale-95 transition">← 戻る</button>
      </Link>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 drop-shadow">ルーム参加</h2>
      <form ref={formRef} action={action} className="flex flex-col gap-4 w-80 bg-white bg-opacity-90 p-6 rounded-xl shadow">
        <label className="text-gray-700 font-semibold">ユーザー名
          <input
            type="text"
            name="userName"
            placeholder="ユーザー名"
            required
            className="p-3 border rounded w-full mt-1"
          />
        </label>
        <div>
          <label className="block mb-2 text-gray-700 font-semibold">ルーム選択</label>
          <select
            name="roomId"
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
            name="password"
            placeholder="合言葉"
            required
            className="p-3 border rounded w-full mt-1"
          />
        </label>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button
          type="submit"
          className="py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded font-bold"
          disabled={isPending}
        >
          {isPending ? "参加中..." : "ルーム参加"}
        </button>
      </form>
    </main>
  );
} 