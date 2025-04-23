"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Star from './Star';
import { sendClickCount } from "@/lib/api/roomClient";

type StarType = {
  id: string;
  style: React.CSSProperties;
  created: number;
};

export default function Game({ seconds = 10 }: { seconds?: number }) {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'end'>('countdown');
  const [countdownValue, setCountdownValue] = useState(3);
  const [stars, setStars] = useState<StarType[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const starCount = useRef(0);

  // 3秒カウントダウン
  useEffect(() => {
    if (gameState === 'countdown') {
      setCountdownValue(3);
      let countdown = 3;
      const interval = setInterval(() => {
        countdown -= 1;
        setCountdownValue(countdown);
        if (countdown === 0) {
          clearInterval(interval);
          setTimeout(() => {
            setGameState('playing');
          }, 1000);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // ゲームタイマー
  useEffect(() => {
    if (gameState === 'playing') {
      if (timeLeft <= 0) {
        setGameState('end');
        return;
      }
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('end');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  // 星アニメーションのクリーンアップ
  useEffect(() => {
    const cleanup = setInterval(() => {
      setStars(prevStars => 
        prevStars.filter(star => Date.now() - star.created < 1000)
      );
    }, 200);
    return () => clearInterval(cleanup);
  }, []);

  // ゲーム終了時にスコア送信
  useEffect(() => {
    if (gameState === 'end') {
      // 仮: roomId, userIdは固定値。今後状態管理やpropsで受け取る形に拡張
      const roomId = "room1";
      const userId = "1";
      sendClickCount({ roomId, userId, clickCount: count })
        .catch(() => {/* エラー時は無視 or エラー表示も可 */});
    }
  }, [gameState]);

  const handleClick = () => {
    if (gameState === 'playing') {
      setCount(prev => prev + 1);
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const centerX = buttonRect.left + buttonRect.width / 2;
        const centerY = buttonRect.top;
        const newStars: StarType[] = [];
        for (let i = 0; i < 5; i++) {
          const size = Math.random() * 1 + 0.5;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 50 + 50;
          const startX = centerX + (Math.random() * 40 - 20);
          newStars.push({
            id: `star-${starCount.current++}`,
            style: {
              left: `${startX}px`,
              top: `${centerY}px`,
              fontSize: `${size}rem`,
              animation: `float ${Math.random() * 0.5 + 0.7}s ease-out forwards`,
              transform: `translateX(${Math.cos(angle) * speed}px)`,
            },
            created: Date.now(),
          });
        }
        setStars(prevStars => [...prevStars, ...newStars]);
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen py-8 px-4 bg-gradient-to-br from-orange-200 to-yellow-100">
      {/* 星のアニメーション */}
      {stars.map(star => (
        <Star key={star.id} style={star.style} />
      ))}

      {/* カウントダウン画面 */}
      <AnimatePresence>
        {gameState === 'countdown' && (
          <motion.div 
            className="flex flex-col items-center justify-center h-full w-full absolute inset-0 z-20 bg-black bg-opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key={countdownValue}
              className="text-7xl font-bold text-white"
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.9 }}
            >
              {countdownValue === 0 ? "GO!" : countdownValue}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ゲームプレイ画面 */}
      <AnimatePresence>
        {gameState === 'playing' && (
          <>
            {/* スコア表示 */}
            <motion.div 
              className="flex-1 w-full flex flex-col items-center justify-start pt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="text-6xl md:text-7xl font-bold text-white"
                animate={{ scale: [1, 1.05, 1], transition: { duration: 0.15 } }}
                key={count}
              >
                {count}
              </motion.div>
              {/* タイマー表示 */}
              <motion.div 
                className={`absolute top-4 right-4 text-2xl font-bold px-5 py-2 bg-white bg-opacity-90 text-orange-500 rounded-full border-2 border-orange-300 shadow-lg ${timeLeft <= 5 ? 'animate-pulse' : ''}`}
                animate={timeLeft <= 5 ? { scale: [1, 1.2, 1], color: ["#f97316", "#dc2626", "#f97316"] } : {}}
                transition={timeLeft <= 5 ? { repeat: Infinity, duration: 0.7 } : {}}
              >
                残り {timeLeft}s
              </motion.div>
            </motion.div>
            {/* クリックボタン */}
            <motion.div 
              className="w-full flex justify-center items-center mb-4"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <motion.button
                ref={buttonRef}
                onClick={handleClick}
                className="click-btn w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 text-white font-bold text-2xl shadow-lg flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                disabled={gameState !== 'playing'}
              >
                TAP!
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ゲーム終了画面 */}
      <AnimatePresence>
        {gameState === 'end' && (
          <motion.div 
            className="flex flex-col items-center justify-center h-full w-full absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-80 bg-white bg-opacity-90 p-8 rounded-xl shadow flex flex-col items-center">
              <motion.h1 
                className="text-3xl font-bold text-center mb-2 text-gray-800 drop-shadow"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
              >
                タイムアップ！
              </motion.h1>
              <motion.div 
                className="text-6xl md:text-7xl font-bold mb-6 text-yellow-500"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { delay: 0.5, type: "spring", bounce: 0.5 } }}
              >
                {count}
              </motion.div>
              <motion.p 
                className="text-lg text-center mb-4 text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.8 } }}
              >
                あなたのスコア
              </motion.p>
              {/* ランキング表示（仮データ） */}
              <div className="w-full mt-2">
                <div className="text-gray-700 font-semibold mb-2 text-center">ランキング</div>
                <ul className="mb-2">
                  {[
                    { name: "あなた", score: count, rank: 2, isMe: true },
                    { name: "ユーザーA", score: 25, rank: 1 },
                    { name: "ユーザーB", score: 18, rank: 3 },
                  ].sort((a, b) => a.rank - b.rank).map((user, i) => (
                    <li
                      key={user.rank}
                      className={`flex justify-between items-center py-1 px-2 rounded mb-1 ${user.isMe ? 'bg-yellow-100 font-bold text-orange-500' : 'bg-gray-100 text-gray-800'}`}
                    >
                      <span>{user.rank}位</span>
                      <span>{user.name}</span>
                      <span>{user.score}回</span>
                    </li>
                  ))}
                </ul>
                <div className="text-center text-gray-600 text-sm mt-2">あなたの順位: <span className="font-bold text-orange-500">2位</span></div>
              </div>
              <a href="/" className="mt-6 w-full">
                <button className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white rounded font-bold text-lg shadow transition">トップに戻る</button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 