'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { SpreadConfig } from '@/lib/tarot/types';
import { TarotCard3D } from './TarotCard3D';

interface CardSpreadProps {
  spread: SpreadConfig;
  totalCards?: number; // 기본 22장 (메이저 아르카나 수)
  onSelectionComplete: (selectedIndices: number[]) => void;
  onReset?: () => void;
}

export function CardSpread({
  spread,
  totalCards = 22,
  onSelectionComplete,
  onReset,
}: CardSpreadProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionRef = useRef<number[]>([]);
  useEffect(() => () => {
    if (completionTimer.current) clearTimeout(completionTimer.current);
  }, []);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SSR-safe viewport width detection
  const [viewportWidth, setViewportWidth] = useState(768);
  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const neededCount = spread.cardCount;
  const currentStep = selectedIndices.length;
  const isComplete = currentStep === neededCount;

  const handleCardClick = (idx: number) => {
    if (selectionRef.current.includes(idx) || selectionRef.current.length >= neededCount) return;

    const nextIndices = [...selectionRef.current, idx];
    selectionRef.current = nextIndices;
    setSelectedIndices(nextIndices);

    if (nextIndices.length === neededCount) {
      completionTimer.current = setTimeout(() => {
        onSelectionComplete(nextIndices);
      }, 700);
    }
  };

  const cardsArray = Array.from({ length: totalCards }, (_, i) => i);

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-3 flex flex-col items-center select-none">
      {/* 상단 선택 안내 & 진행 바 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center mb-6"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/70 text-violet-300 border border-violet-500/30 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {isComplete
              ? '카드 선택 완료!'
              : `${currentStep + 1}번째 카드: ${
                  spread.positions[currentStep]?.name || '카드 선택'
                }`}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
          {isComplete ? (
            <span className="text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-6 h-6" /> 운명의 카드가 선택되었습니다
            </span>
          ) : (
            '손끝이 이끄는 카드를 터치하세요'
          )}
        </h3>

        <p className="text-xs md:text-sm text-slate-300">
          {spread.positions[currentStep]?.description ||
            '가장 강하게 시선이 머무는 카드를 골라주세요.'}
        </p>

        {/* 선택 슬롯 인디케이터 */}
        <div className="flex items-center justify-center gap-2.5 mt-4">
          {spread.positions.map((pos, idx) => {
            const isFilled = selectedIndices[idx] !== undefined;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={pos.index}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isFilled
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                    : isCurrent
                    ? 'bg-violet-600/30 text-white border border-violet-400/60 ring-2 ring-violet-500/20 animate-pulse'
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}
              >
                <span>{pos.name}</span>
                {isFilled && <span className="text-amber-300 font-bold">✓</span>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 부채꼴 아크(Arc) 카드 스프레드 컨테이너 */}
      <div className="relative w-full overflow-x-auto py-12 px-4 scrollbar-none flex justify-center items-center min-h-[360px] md:min-h-[420px]">
        <div className="relative flex items-center justify-center h-72 w-[720px] md:w-[940px]">
          {cardsArray.map((idx) => {
            const isSelected = selectedIndices.includes(idx);
            const isHovered = hoveredIdx === idx;

            // 22장 아크 곡선 각도 및 X, Y 포물선 오프셋 계산
            const midpoint = (totalCards - 1) / 2;
            const normalized = (idx - midpoint) / midpoint; // -1.0 ~ 1.0
            const rotationDeg = normalized * 32; // -32도 ~ +32도 부채꼴
            const xOffset = normalized * (viewportWidth < 640 ? 320 : 440);
            const yOffset = Math.pow(normalized, 2) * 55; // 포물선 곡선

            return (
              <motion.button
                type="button"
                aria-label={`${idx + 1}번째 카드${isSelected ? ' · 선택됨' : ''}`}
                disabled={isSelected || isComplete}
                key={idx}
                onPointerEnter={() => setHoveredIdx(idx)}
                onPointerLeave={() => setHoveredIdx(null)}
                onClick={() => handleCardClick(idx)}
                className={`absolute cursor-pointer select-none origin-bottom ${
                  isSelected ? 'pointer-events-none' : ''
                }`}
                style={{ zIndex: isHovered ? 50 : isSelected ? 5 : 10 + idx }}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{
                  opacity: isSelected ? 0.3 : 1,
                  x: xOffset,
                  y: isSelected
                    ? -80
                    : isHovered
                    ? yOffset - 55
                    : yOffset,
                  rotate: isSelected ? 0 : isHovered ? rotationDeg * 0.3 : rotationDeg,
                  scale: isSelected ? 0.88 : isHovered ? 1.08 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 26,
                  mass: 0.8,
                }}
              >
                <div
                  className={`relative rounded-xl transition-shadow duration-200 ${
                    isHovered
                      ? 'drop-shadow-[0_-8px_20px_rgba(253,224,71,0.5)]'
                      : 'drop-shadow-[0_8px_18px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  <TarotCard3D
                    size="sm"
                    isFlipped={false}
                    enableTilt={isHovered}
                  />

                  {/* 선택 완료 표시 */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-violet-900/60 backdrop-blur-xs flex items-center justify-center border border-amber-300">
                      <span className="text-xl font-bold text-amber-300">✓</span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 하단 리셋 및 모바일 스와이프 안내 */}
      <div className="flex items-center justify-between w-full max-w-md px-4 mt-2 text-xs text-slate-400">
        <span>💡 화면을 좌우로 스크롤하여 모든 카드를 둘러보세요</span>
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-indigo-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            다시 섞기
          </button>
        )}
      </div>
    </div>
  );
}
