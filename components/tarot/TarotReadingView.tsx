'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Download,
  Share2,
  RotateCcw,
  Eye,
  Heart,
  Briefcase,
  Lightbulb,
  Check,
} from 'lucide-react';
import { ReadingSession } from '@/lib/tarot/types';
import { generateOverallSynthesis } from '@/lib/tarot/spreads';
import { downloadTarotStoryCard } from '@/lib/tarot/story-downloader';
import { TarotCard3D } from './TarotCard3D';

interface TarotReadingViewProps {
  session: ReadingSession;
  onRestart: () => void;
}

export function TarotReadingView({ session, onRestart }: TarotReadingViewProps) {
  // 각 카드의 공개(Revealed) 상태 관리
  const [revealedMap, setRevealedMap] = useState<Record<number, boolean>>({});
  const [activeTabCardIdx, setActiveTabCardIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const totalCards = session.drawnCards.length;
  const allRevealed = session.drawnCards.every((_, i) => revealedMap[i]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A78BFA', '#F472B6', '#FDE047', '#67E8F9'],
      });
    } catch {
      // no-op if in non-browser context
    }
  };

  // 마운트 후 첫 카드를 열고, 재열람 시에도 같은 세션을 사용합니다.
  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealedMap(prev => ({ ...prev, 0: true }));
      triggerConfetti();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const revealCard = (idx: number) => {
    if (revealedMap[idx]) return;
    setRevealedMap((prev) => ({ ...prev, [idx]: true }));
    setActiveTabCardIdx(idx);
    triggerConfetti();
  };

  const revealAll = () => {
    const newMap: Record<number, boolean> = {};
    session.drawnCards.forEach((_, i) => {
      newMap[i] = true;
    });
    setRevealedMap(newMap);
    triggerConfetti();
  };

  const handleCopy = async () => {
    const lines = [
      `[LUMEN TAROT - ${session.spread.title}]`,
      session.customQuestion ? `질문: "${session.customQuestion}"` : '',
      ...session.drawnCards.map((c) => {
        const dir = c.isReversed ? '(역방향)' : '(정방향)';
        return `• ${c.position.name}: ${c.card.nameKo} ${dir} - #${c.card.keywords.join(' #')}`;
      }),
      '',
      `[종합 가이드]`,
      generateOverallSynthesis(session),
      '',
      '나를 비추는 감성 데스티니 연구소 LUMEN',
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setShareError('');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError('복사하지 못했어요. 클립보드를 허용하거나 스토리 이미지로 저장해주세요.');
    }
  };

  const handleDownloadStory = async () => {
    setIsDownloading(true);
    try {
      await downloadTarotStoryCard(session);
      setShareError('');
    } catch {
      setShareError('이미지를 저장하지 못했어요. 결과 요약을 복사하거나 화면을 캡처해주세요.');
    } finally {
      setIsDownloading(false);
    }
  };

  const currentActiveCard = session.drawnCards[activeTabCardIdx];
  const activeDetail = currentActiveCard?.isReversed
    ? currentActiveCard?.card.reversed
    : currentActiveCard?.card.upright;

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 flex flex-col items-center">
      {shareError && <p role="alert" className="text-sm text-rose-200 mb-4">{shareError}</p>}
      {/* 상단 리딩 타이틀 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/80 text-amber-300 border border-amber-400/30 mb-2.5 shadow-md">
          <Sparkles className="w-3.5 h-3.5" />
          {session.spread.badge}
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
          {session.spread.title}
        </h2>
        <p className="text-sm text-indigo-200/80">
          {session.customQuestion
            ? `"${session.customQuestion}"에 대한 타로의 메시지입니다.`
            : session.preset?.label || session.spread.subtitle}
        </p>

        {/* 전체 열기 버튼 */}
        {!allRevealed && (
          <div className="mt-4">
            <button
              onClick={revealAll}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-600/40 text-violet-200 border border-violet-400/40 hover:bg-violet-600/60 active:scale-95 transition-all shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              모든 카드 한번에 열기
            </button>
          </div>
        )}
      </motion.div>

      {/* 3D 카드 디스플레이 스테이지 */}
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 my-4 w-full">
        {session.drawnCards.map((drawn, idx) => {
          const isRevealed = !!revealedMap[idx];
          const isSelected = activeTabCardIdx === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.15, type: 'spring' }}
              className="flex flex-col items-center"
            >
              {/* 카드 본체 */}
              <div
                className={`relative transition-all duration-300 ${
                  isSelected
                    ? 'ring-4 ring-amber-400/40 rounded-2xl scale-105'
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                <TarotCard3D
                  card={drawn.card}
                  isFlipped={isRevealed}
                  isReversed={drawn.isReversed}
                  size={totalCards === 1 ? 'lg' : 'md'}
                  enableTilt={isRevealed}
                  positionLabel={drawn.position.name}
                  onClick={() => {
                    if (!isRevealed) {
                      revealCard(idx);
                    } else {
                      setActiveTabCardIdx(idx);
                    }
                  }}
                />

                {/* 미열람 시 '터치하여 열기' 오버레이 */}
                {!isRevealed && (
                  <button
                    onClick={() => revealCard(idx)}
                    className="absolute inset-0 w-full h-full rounded-2xl flex flex-col items-center justify-center bg-black/20 hover:bg-black/10 transition-colors z-20 cursor-pointer"
                  >
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 bg-black/70 border border-amber-300/50 shadow-lg animate-bounce">
                      터치하여 열기 ✨
                    </span>
                  </button>
                )}
              </div>

              {/* 포지션 이름 및 빠른 선택 버튼 */}
              <button
                onClick={() => {
                  if (isRevealed) setActiveTabCardIdx(idx);
                  else revealCard(idx);
                }}
                className={`mt-4 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {drawn.position.name}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* 종합 해석 및 상세 리딩 패널 (모든 카드가 열리면 자동 노출) */}
      <AnimatePresence>
        {allRevealed && currentActiveCard && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full mt-10 space-y-6"
          >
            {/* 1. 세 카드가 전하는 종합 스토리 (전체 시너지) */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-950/40 via-[#150F2C]/70 to-[#0F0A24]/90 border border-violet-500/20 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 mb-3 text-amber-300">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg md:text-xl font-bold tracking-tight">
                  운명의 종합 가이드 (Synthesis)
                </h3>
              </div>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed font-light whitespace-pre-line">
                {generateOverallSynthesis(session)}
              </p>
            </div>

            {/* 2. 현재 선택된 카드 상세 심층 풀이 */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#120B29]/70 border border-white/10 backdrop-blur-xl shadow-xl">
              {/* 상단 카드 헤더 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold">
                      {currentActiveCard.position.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        currentActiveCard.isReversed
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {currentActiveCard.isReversed ? '↺ 역방향' : '✦ 정방향'}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
                    <span>{currentActiveCard.card.symbol}</span>
                    <span>{currentActiveCard.card.nameKo}</span>
                    <span className="text-sm text-slate-400 font-normal font-serif">
                      ({currentActiveCard.card.name})
                    </span>
                  </h3>
                </div>

                {/* 키워드 칩스 */}
                <div className="flex flex-wrap gap-1.5">
                  {currentActiveCard.card.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4대 테마별 카드 해석 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* 1) 총평 & 상황의 본질 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-violet-300 font-bold text-sm mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>상황의 본질 & 에너지</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {activeDetail?.general}
                  </p>
                </div>

                {/* 2) 연애운 & 속마음 */}
                {session.spread.id === 'love' && <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm mb-2">
                    <Heart className="w-4 h-4" />
                    <span>연애 & 상대방 속마음</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {activeDetail?.love}
                  </p>
                </div>}

                {/* 3) 커리어 & 성취 */}
                {(session.spread.id === 'career' || session.preset?.category === 'money') && <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span>커리어 & 현실적 결실</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {activeDetail?.career}
                  </p>
                </div>}

                {/* 4) 나를 위한 럭키 조언 (처방전) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>오늘의 럭키 액션 가이드</span>
                  </div>
                  <p className="text-xs md:text-sm text-amber-100/90 leading-relaxed font-medium">
                    {activeDetail?.advice}
                  </p>
                </div>
              </div>
            </div>

            {/* 하단 공유 & 액션 바 */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={handleDownloadStory}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-[0_4px_25px_rgba(244,63,94,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isDownloading ? '스토리 생성 중...' : '인스타 스토리로 저장'}
                </span>
              </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm bg-violet-900/40 text-violet-200 border border-violet-500/30 hover:bg-violet-800/40 active:scale-95 transition-all backdrop-blur-md"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? '복사 완료!' : '결과 요약 복사'}</span>
              </button>

              <button
                onClick={onRestart}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>새로운 질문하기</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
