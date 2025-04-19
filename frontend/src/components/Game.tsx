"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Star from './Star';

type StarType = {
  id: string;
  style: React.CSSProperties;
  created: number;
};

export default function Game() {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameState, setGameState] = useState("start"); // "start", "playing", "end"
  const [stars, setStars] = useState<StarType[]>([]);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const starCount = useRef(0);

  // ゲーム開始時のカウントダウン
  useEffect(() => {
    if (gameState === "playing" && timeLeft === 10) {
      let countdown = 3;
      setCountdownValue(countdown);
      
      const countdownInterval = setInterval(() => {
        countdown -= 1;
        setCountdownValue(countdown);
        
        if (countdown === 0) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            setCountdownValue(null);
          }, 1000);
        }
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [gameState, timeLeft]);

  // ゲームタイマー
  useEffect(() => {
    if (gameState === "playing" && countdownValue === null) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState("end");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, countdownValue]);

  // 星アニメーションのクリーンアップ
  useEffect(() => {
    const cleanup = setInterval(() => {
      setStars(prevStars => 
        prevStars.filter(star => Date.now() - star.created < 1000)
      );
    }, 200);
    
    return () => clearInterval(cleanup);
  }, []);

  const handleClick = () => {
    if (gameState === "playing" && countdownValue === null) {
      // クリックカウンターを更新
      setCount(prev => prev + 1);
      
      // 星のアニメーション作成
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const centerX = buttonRect.left + buttonRect.width / 2;
        const centerY = buttonRect.top;
        
        // 複数の星を作成
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

  const startGame = () => {
    setCount(0);
    setTimeLeft(10);
    setGameState("playing");
    setStars([]);
  };

  const restartGame = () => {
    setGameState("start");
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen py-8 px-4">
      {/* 星のアニメーション */}
      {stars.map(star => (
        <Star key={star.id} style={star.style} />
      ))}
      
      {/* ゲーム開始画面 */}
      <AnimatePresence>
        {gameState === "start" && (
          <motion.div 
            className="flex flex-col items-center justify-center h-full w-full absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-center mb-8 text-white"
              initial={{ y: -50 }}
              animate={{ y: 0, transition: { type: "spring", bounce: 0.5 } }}
            >
              タップチャレンジ
            </motion.h1>
            
            <motion.p 
              className="text-xl text-center mb-12 text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.3 } }}
            >
              10秒間でどれだけタップできるか挑戦しよう！
            </motion.p>
            
            <motion.button 
              onClick={startGame} 
              className="px-8 py-4 text-xl bg-gradient-to-br from-[#ff7b00] to-[#ffb700] text-white rounded-full font-bold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 50 }}
              animate={{ y: 0, transition: { type: "spring", bounce: 0.5, delay: 0.5 } }}
            >
              スタート！
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ゲームプレイ画面 */}
      <AnimatePresence>
        {gameState === "playing" && (
          <>
            {/* カウントダウン表示 */}
            {countdownValue !== null && (
              <motion.div 
                key="countdown"
                className="absolute inset-0 flex items-center justify-center z-30 bg-black bg-opacity-70"
                initial={{ opacity: 1 }}
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
            
            {/* スコア表示 */}
            <motion.div 
              className="flex-1 w-full flex flex-col items-center justify-start pt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="text-6xl md:text-7xl font-bold text-white"
                animate={{ 
                  scale: [1, 1.05, 1],
                  transition: { duration: 0.15 }
                }}
                key={count}
              >
                {count}
              </motion.div>
              
              {/* タイマー表示 */}
              <motion.div 
                className="absolute top-4 right-4 text-xl font-semibold px-3 py-1 bg-white bg-opacity-10 rounded-full"
                animate={{
                  backgroundColor: timeLeft <= 3 ? ["rgba(255,255,255,0.1)", "rgba(255,77,109,0.3)", "rgba(255,255,255,0.1)"] : "rgba(255,255,255,0.1)",
                  transition: { duration: 0.5, repeat: timeLeft <= 3 ? Infinity : 0 }
                }}
              >
                {timeLeft}s
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
                className="click-btn w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#ff7b00] text-white font-bold text-2xl shadow-lg flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                disabled={countdownValue !== null}
              >
                TAP!
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* ゲーム終了画面 */}
      <AnimatePresence>
        {gameState === "end" && (
          <motion.div 
            className="flex flex-col items-center justify-center h-full w-full absolute inset-0 z-20 bg-black bg-opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h1 
              className="text-4xl font-bold text-center mb-2 text-white"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
            >
              タイムアップ！
            </motion.h1>
            
            <motion.div 
              className="text-7xl md:text-8xl font-bold mb-8 text-[#ffb700]"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { delay: 0.5, type: "spring", bounce: 0.5 } }}
            >
              {count}
            </motion.div>
            
            <motion.p 
              className="text-xl text-center mb-2 text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.8 } }}
            >
              あなたのスコア
            </motion.p>
            
            <div className="flex gap-4 mt-8">
              <motion.button 
                onClick={startGame} 
                className="px-6 py-3 text-lg bg-gradient-to-r from-[#ffb700] to-[#ff7b00] text-white rounded-full font-bold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { delay: 1.1 } }}
              >
                もう一度
              </motion.button>
              
              <motion.button 
                onClick={restartGame} 
                className="px-6 py-3 text-lg bg-white bg-opacity-20 text-black rounded-full font-bold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { delay: 1.1 } }}
              >
                メニューへ
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 