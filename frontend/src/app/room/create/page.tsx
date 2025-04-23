"use client";
import { useRef, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRoomServerAction } from "./actions";

export default function RoomCreate() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createRoomServerAction(formData);
      const userName = formData.get("name") as string;
      if (res.success) {
        router.push(`/room/${res.roomId}/waiting?userId=${res.userId}&userName=${encodeURIComponent(formData.get('userName') as string)}`);
      } else {
        setError(res.error || "ルーム作成に失敗しました");
      }
    });
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-200 to-yellow-100 relative">
      <Link href="/" className="absolute left-4 top-4">
        <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow font-bold text-lg active:scale-95 transition">← 戻る</button>
      </Link>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 drop-shadow">ルーム作成</h2>
      <form ref={formRef} action={action} className="flex flex-col gap-4 w-80 bg-white bg-opacity-90 p-6 rounded-xl shadow">
        <label className="text-gray-700 font-semibold">ルーム名
          <input
            type="text"
            name="name"
            placeholder="ルーム名"
            required
            className="p-3 border rounded w-full mt-1"
          />
        </label>
        <label className="text-gray-700 font-semibold">合言葉
          <input
            type="password"
            name="password"
            placeholder="合言葉"
            required
            className="p-3 border rounded w-full mt-1"
          />
        </label>
        <label className="text-gray-700 font-semibold">定員（2～10人）
          <input
            type="number"
            name="maxUsers"
            min={2}
            max={10}
            defaultValue={4}
            required
            className="p-3 border rounded w-full mt-1"
          />
        </label>
        <label className="text-gray-700 font-semibold">ユーザー名
          <input
            type="text"
            name="userName"
            placeholder="ユーザー名"
            required
            className="p-3 border rounded w-full mt-1"
          />
        </label>
        <span className="text-xs text-gray-500 mb-2">※定員は2人以上10人以下で設定してください</span>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button
          type="submit"
          className="py-3 bg-orange-400 hover:bg-orange-500 text-white rounded font-bold"
          disabled={isPending}
        >
          {isPending ? "作成中..." : "ルーム作成"}
        </button>
      </form>
    </main>
  );
} 