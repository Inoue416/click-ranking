import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-200 to-yellow-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 drop-shadow">タップチャレンジ</h1>
      <div className="flex flex-col gap-6 w-80">
        <Link href="/room/create">
          <button className="w-full py-4 bg-orange-400 hover:bg-orange-500 text-white rounded-lg text-xl font-bold shadow">ルーム作成</button>
        </Link>
        <Link href="/room/join">
          <button className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg text-xl font-bold shadow">ルーム参加</button>
        </Link>
      </div>
    </main>
  );
}
