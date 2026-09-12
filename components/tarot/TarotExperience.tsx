'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Briefcase,
  Sun,
  Compass,
  ArrowRight,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import {
  QuestionPreset,
  ReadingSession,
  SpreadType,
} from '@/lib/tarot/types';
import {
  QUESTION_PRESETS,
  SPREAD_CONFIGS,
  createReadingSession,
} from '@/lib/tarot/spreads';
import { MAJOR_CARD_MAP } from '@/lib/tarot/cards';
import { DeckShuffle } from './DeckShuffle';
import { CardSpread } from './CardSpread';
import { TarotReadingView } from './TarotReadingView';
import { TarotBackground } from './TarotBackground';

type FlowStep = 'select_question' | 'shuffle' | 'spread' | 'reading';

export function TarotExperience() {
  const [step, setStep] = useState<FlowStep>('select_question');
  const [selectedSpreadType, setSelectedSpreadType] = useState<SpreadType>('love');
  const [selectedPreset, setSelectedPreset] = useState<QuestionPreset | null>(
    QUESTION_PRESETS[1] // "그 사람의 진짜 속마음이 궁금해요"
  );
  const [customQuestion, setCustomQuestion] = useState('');
  const [allowReversed, setAllowReversed] = useState(false);
  const [currentSession, setCurrentSession] = useState<ReadingSession | null>(null);

  // 스프레드 프리셋 선택 핸들러
  const handleSelectPreset = (preset: QuestionPreset) => {
    setSelectedPreset(preset);
    setSelectedSpreadType(preset.spreadType);
  };

  // 1단계 -> 2단계(셔플) 진입
  const handleStartShuffle = () => {
    setStep('shuffle');
  };

  // 2단계(셔플 완료) -> 3단계(카드 펼치기)
  const handleShuffleComplete = () => {
    setStep('spread');
  };

  // 3단계(카드 선택 완료) -> 4단계(리딩)
  const handleSelectionComplete = (selectedIndices: number[]) => {
    // 세션 생성
    const session = createReadingSession(selectedSpreadType, {
      preset: selectedPreset || undefined,
      customQuestion: customQuestion.trim() || undefined,
      allowReversed,
    });
    setCurrentSession(session);
    setStep('reading');
  };

  // 처음으로 돌아가기
  const handleRestart = () => {
    setStep('select_question');
    setCurrentSession(null);
  };

  const currentSpread = SPREAD_CONFIGS[selectedSpreadType];

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-start text-white overflow-hidden pb-16">
      {/* 몽환적 우주 & 별빛 배경 */}
      <TarotBackground />

      <div className="w-full max-w-5xl px-4 z-10">
        <AnimatePresence mode="wait">
          {/* ================= 1. 질문 및 모드 선택 단계 ================= */}
          {step === 'select_question' && (
            <motion.div
              key="select_question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="py-6 max-w-2xl mx-auto"
            >
              {/* 상단 헤더 */}
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-violet-900/50 text-amber-300 border border-amber-400/30 mb-3 shadow-sm backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  LUMEN 감성 타로 (Interactive Tarot)
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
                  오늘 당신의 마음에 머무는<br />
                  <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                    질문은 무엇인가요?
                  </span>
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  22장의 메이저 아르카나 카드가 당신의 무의식과 솔직한 마음에 귀를 기울입니다.
                </p>
              </div>

              {/* 추천 질문 프리셋 목록 */}
              <div className="space-y-2.5 mb-6">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                  <span>✦ 20대 인기 질문 모아보기</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {QUESTION_PRESETS.map((preset) => {
                    const isSelected = selectedPreset?.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-violet-900/50 border-amber-400/60 shadow-[0_0_20px_rgba(139,92,246,0.3)] ring-1 ring-amber-400/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-lg">{preset.icon}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              preset.spreadType === 'daily'
                                ? 'bg-amber-400/20 text-amber-300'
                                : 'bg-pink-400/20 text-pink-300'
                            }`}
                          >
                            {preset.spreadType === 'daily' ? '1장 뽑기' : '3장 심층'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white leading-snug">
                          {preset.label}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-tight line-clamp-1">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 직접 질문 입력 옵션 */}
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>직접 질문 적기 (선택 사항)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">구체적일수록 좋아요</span>
                </div>
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="예: 이번 주 그 사람한테 먼저 연락해도 괜찮을까요?"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* 스프레드 모드 & 역방향 허용 토글 설정 */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                {/* 스프레드 타입 */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400">리딩 방식:</span>
                  <div className="inline-flex rounded-xl p-1 bg-white/5 border border-white/10">
                    <button
                      onClick={() => setSelectedSpreadType('daily')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                        selectedSpreadType === 'daily'
                          ? 'bg-amber-400 text-slate-950 font-bold shadow'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      1장 데일리
                    </button>
                    <button
                      onClick={() => setSelectedSpreadType('love')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                        selectedSpreadType === 'love'
                          ? 'bg-amber-400 text-slate-950 font-bold shadow'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      3장 연애운
                    </button>
                    <button
                      onClick={() => setSelectedSpreadType('career')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                        selectedSpreadType === 'career'
                          ? 'bg-amber-400 text-slate-950 font-bold shadow'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      3장 커리어
                    </button>
                  </div>
                </div>

                {/* 역방향 카드 토글 */}
                <div className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-300 w-full sm:w-auto justify-end" onClick={() => setAllowReversed(!allowReversed)}>
                  <span>역방향(Reversed) 카드 포함</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={allowReversed}
                    className="toggle-switch toggle-switch-dark"
                    data-checked={allowReversed}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* 시작 버튼 */}
              <div className="text-center">
                <button
                  onClick={handleStartShuffle}
                  className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-amber-400 via-pink-500 to-violet-600 text-white shadow-[0_4px_30px_rgba(236,72,153,0.4)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span>운명의 카드 뽑으러 가기</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= 2. 덱 셔플링 단계 ================= */}
          {step === 'shuffle' && (
            <motion.div
              key="shuffle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <DeckShuffle
                onShuffleComplete={handleShuffleComplete}
                questionLabel={
                  customQuestion || selectedPreset?.label || currentSpread.title
                }
              />
            </motion.div>
          )}

          {/* ================= 3. 부채꼴 아크 스프레드 및 카드 선택 ================= */}
          {step === 'spread' && (
            <motion.div
              key="spread"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <CardSpread
                spread={currentSpread}
                onSelectionComplete={handleSelectionComplete}
                onReset={() => setStep('shuffle')}
              />
            </motion.div>
          )}

          {/* ================= 4. 카드 공개 및 상세 리딩 단계 ================= */}
          {step === 'reading' && currentSession && (
            <motion.div
              key="reading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TarotReadingView
                session={currentSession}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
