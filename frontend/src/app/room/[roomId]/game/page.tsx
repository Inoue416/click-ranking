import Game from '@/components/Game';

export default function RoomGamePage() {
  // 仮で10秒を指定。将来的にAPIから取得して渡す想定。
  return <Game seconds={10} />;
} 