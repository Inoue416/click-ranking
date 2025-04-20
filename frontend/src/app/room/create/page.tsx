"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { operations } from "@/lib/api/openapi";

export default function RoomCreate() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [maxUsers, setMaxUsers] = useState(4);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, maxUsers }),
      });
      if (!res.ok) throw new Error("ルーム作成に失敗しました");
      // 仮: レスポンスからroomId取得
      const data = await res.json();
      alert("ルーム作成成功: " + JSON.stringify(data));
      // router.push(`/room/${data.roomId}/waiting`); // 実装時はこちら
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800 drop-shadow">ルーム作成</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 bg-white bg-opacity-90 p-6 rounded-xl shadow">
        <label className="text-gray-700 font-semibold">ルーム名
          <input
            type="text"
            placeholder="ルーム名"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="p-3 border rounded w-full mt-1"
          />
        </label>
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
        <label className="text-gray-700 font-semibold">定員（2～10人）
          <input
            type="number"
            min={2}
            max={10}
            value={maxUsers}
            onChange={e => setMaxUsers(Number(e.target.value))}
            required
            className="p-3 border rounded w-full mt-1"
          />
        </label>
        <span className="text-xs text-gray-500 mb-2">※定員は2人以上10人以下で設定してください</span>
        <button
          type="submit"
          className="py-3 bg-orange-400 hover:bg-orange-500 text-white rounded font-bold"
          disabled={loading}
        >
          {loading ? "作成中..." : "ルーム作成"}
        </button>
      </form>
    </main>
  );
} 