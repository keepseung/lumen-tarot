'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shuffle, ArrowRight } from 'lucide-react';
import { TarotCard3D } from './TarotCard3D';

interface DeckShuffleProps {
  onShuffleComplete: () => void;
  questionLabel?: string;
}

export function DeckShuffle({ onShuffleComplete, questionLabel }: DeckShuffleProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleCount, setShuffleCount] = useState(0);

  const handleShuffle = () => {
    if (isShuffling) return;
    setIsShuffling(true);

    // 1.8초 동안 셔플 모션 지속
    setTimeout(() => {
      setIsShuffling(false);
      setShuffleCount((prev) => prev + 1);
    }, 1800);
  };

  // 셔플용 가상 카드 스택 (8장)
  const stackCards = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 max-w-xl mx-auto text-center">
      {/* 명상 및 집중 가이드 배너 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30 mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          마음 집중하기 (Attunement)
        </span>
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">
          {questionLabel ? `"${questionLabel}"` : '마음속으로 질문을 떠올려보세요'}
        </h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          숨을 깊게 들이쉬고 내쉬며, 마음을 어지럽히던 생각을 잠시 내려놓으세요. 
          카드를 섞을수록 당신의 무의식이 덱에 스며듭니다.
        </p>
      </motion.div>

      {/* 3D 스프링 셔플 인터랙션 공간 */}
      <div className="relative w-64 h-[420px] flex items-center justify-center mt-6 mb-12 select-none">
        {stackCards.map((idx) => {
          const isEven = idx % 2 === 0;
          return (
            <motion.div
              key={idx}
              className="absolute"
              initial={false}
              animate={
                isShuffling
                  ? {
                      x: isEven
                        ? [-20, -90, -40, 0]
                        : [20, 90, 40, 0],
                      y: [0, -15 * (idx % 3), 10, 0],
                      rotate: isEven
                        ? [-2, -18, 5, (idx - 4) * 1.5]
                        : [2, 18, -5, (idx - 4) * 1.5],
                      scale: [1, 1.05, 0.98, 1],
                    }
                  : {
                      x: (idx - 4) * 1.8,
                      y: (idx - 4) * -2,
                      rotate: (idx - 4) * 1.2,
                      scale: 1,
                    }
              }
              transition={{
                duration: isShuffling ? 1.6 : 0.4,
                ease: 'easeInOut',
                delay: isShuffling ? idx * 0.04 : 0,
              }}
            >
              <TarotCard3D
                size="md"
                isFlipped={false}
                enableTilt={false}
                className="shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
          );
        })}

        {/* 셔플 중 파티클 링 */}
        {isShuffling && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.9, 1.3, 1], opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute w-72 h-96 rounded-full border border-violet-400/40 blur-sm pointer-events-none"
          />
        )}
      </div>

      {/* 셔플 횟수 및 상태 */}
      <div className="text-xs text-indigo-300/80 mb-6 font-medium">
        {isShuffling ? (
          <span className="flex items-center gap-2 justify-center text-amber-300 animate-pulse">
            <Shuffle className="w-3.5 h-3.5 animate-spin" />
            카드를 정성껏 섞는 중입니다...
          </span>
        ) : shuffleCount === 0 ? (
          '카드를 섞거나 바로 펼쳐서 운명의 카드를 선택하세요.'
        ) : (
          `덱을 ${shuffleCount}번 섞었습니다. 충분히 집중하셨다면 펼치기를 눌러주세요.`
        )}
      </div>

      {/* 조작 액션 버튼 바 */}
      <div className="flex items-center gap-3.5 w-full max-w-sm justify-center">
        <button
          onClick={handleShuffle}
          disabled={isShuffling}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-violet-900/40 text-violet-200 border border-violet-500/40 hover:bg-violet-800/50 active:scale-95 transition-all shadow-md backdrop-blur-md disabled:opacity-50"
        >
          <Shuffle className="w-4 h-4" />
          카드 더 섞기
        </button>

        <button
          onClick={onShuffleComplete}
          disabled={isShuffling}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-pink-500 to-violet-600 text-white shadow-[0_4px_20px_rgba(244,63,94,0.35)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          <span>카드 펼치기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
