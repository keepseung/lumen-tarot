'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TarotCard } from '@/lib/tarot/types';
import { getCardImageUrl, getRomanNumeral } from '@/lib/tarot/card-assets';

interface TarotCard3DProps {
  card?: TarotCard;
  isFlipped?: boolean; // true: 앞면(공개), false: 뒷면
  isReversed?: boolean; // 역방향 여부
  size?: 'sm' | 'md' | 'lg';
  enableTilt?: boolean; // 3D 원근 틸트 활성화
  onClick?: () => void;
  className?: string;
  positionLabel?: string;
}

export function TarotCard3D({
  card,
  isFlipped = false,
  isReversed = false,
  size = 'md',
  enableTilt = true,
  onClick,
  className = '',
  positionLabel,
}: TarotCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 치수 정의
  const dimensions = {
    sm: { w: 120, h: 200, radius: 12, padding: 8, fontTitle: 'text-xs', symbolSize: 'text-2xl' },
    md: { w: 190, h: 320, radius: 16, padding: 14, fontTitle: 'text-sm', symbolSize: 'text-4xl' },
    lg: { w: 260, h: 430, radius: 22, padding: 18, fontTitle: 'text-base', symbolSize: 'text-6xl' },
  }[size];

  // 3D 틸트용 Motion Value (ReactBits Tilted Card 스타일)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 부드러운 스프링 물리 감쇠
  const springConfig = { damping: 20, stiffness: 260, mass: 0.6 };
  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), springConfig);
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), springConfig);

  // 반사광(Glare) 오버레이 위치 및 투명도 계산
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const customImg = card ? getCardImageUrl(card.id) : null;
  const romanNum = card ? getRomanNumeral(card.number) : '';

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      className={`relative select-none cursor-pointer perspective-[1200px] ${className}`}
      style={{
        width: dimensions.w,
        height: dimensions.h,
      }}
    >
      {/* 포지션 레이블 칩 */}
      {positionLabel && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight bg-violet-950/80 text-violet-300 border border-violet-500/30 backdrop-blur-md shadow-md">
            {positionLabel}
          </span>
        </div>
      )}

      {/* 3D 회전 컨테이너 */}
      <motion.div
        style={{
          rotateX: enableTilt ? rotateXSpring : 0,
          rotateY: enableTilt ? rotateYSpring : 0,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="w-full h-full relative"
      >
        {/* 카드 플립 모션 래퍼 */}
        <motion.div
          animate={{
            rotateY: isFlipped ? 180 : 0,
            rotateZ: isFlipped && isReversed ? 180 : 0,
          }}
          transition={{
            duration: 0.85,
            ease: [0.23, 1, 0.32, 1], // Cubic bezier for majestic flip
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full relative rounded-2xl shadow-2xl"
        >
          {/* ======================= 카드 뒷면 (Face-Down) ======================= */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              borderRadius: dimensions.radius,
            }}
            className="absolute inset-0 w-full h-full overflow-hidden border border-amber-400/40 shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
          >
            {/* 커스텀 카드 뒷면 이미지 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/tarot/card_back.webp"
              alt="LUMEN Tarot Card Back"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ borderRadius: dimensions.radius }}
            />

            {/* 은은한 황금빛 테두리 오버레이 */}
            <div className="absolute inset-1 rounded-[12px] border border-amber-300/20 pointer-events-none" />

            {/* 홀로그램 시트 (은은한 반짝임 유지) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-cyan-500/5 mix-blend-overlay pointer-events-none" style={{ borderRadius: dimensions.radius }} />
          </div>

          {/* ======================= 카드 앞면 (Face-Up / Revealed) ======================= */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: dimensions.radius,
            }}
            className="absolute inset-0 w-full h-full overflow-hidden border border-amber-300/50 bg-[#0E0B1F] shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col justify-between"
          >
            {card && (
              <>
                {/* 커스텀 사용자 이미지가 설정된 경우 */}
                {customImg ? (
                  <div className="absolute inset-0 w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customImg}
                      alt={card.nameKo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                  </div>
                ) : (
                  /* 기본 몽환적 그라데이션 일러스트레이션 렌더러 */
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      background: `linear-gradient(145deg, ${card.gradient.from}22 0%, #0D091F 50%, ${card.gradient.to}26 100%)`,
                    }}
                  >
                    {/* 내부 글로우 링 */}
                    <div
                      className="absolute inset-3 rounded-xl border border-white/15 pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 25px ${card.gradient.glow}`,
                      }}
                    />
                    {/* 천문학적 배경 기호 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/5 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-24 rounded-full border border-dashed border-white/10" />
                    </div>
                  </div>
                )}

                {/* 카드 상단: 번호 및 심볼릭 타이틀 */}
                <div
                  className="relative z-10 flex items-center justify-between"
                  style={{ padding: `${dimensions.padding}px ${dimensions.padding}px 0` }}
                >
                  <span className="font-serif font-bold text-amber-300/90 text-xs tracking-wider">
                    {romanNum}
                  </span>
                  <span className="text-[10px] text-indigo-300/70 font-mono tracking-tight">
                    {card.element}
                  </span>
                </div>

                {/* 카드 중앙: 대표 이모지 심볼 & 아우라 */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      filter: `drop-shadow(0 0 16px ${card.gradient.accent}88)`,
                    }}
                  >
                    <span className={dimensions.symbolSize}>{card.symbol}</span>
                  </div>

                  {/* 카드 한글명 & 영문명 */}
                  <div className="mt-3 text-center">
                    <h4 className="font-bold text-white tracking-tight drop-shadow-md text-sm md:text-base">
                      {card.nameKo}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-serif tracking-wider">
                      {card.name}
                    </p>
                  </div>
                </div>

                {/* 카드 하단: 키워드 뱃지 & 방향성 */}
                <div
                  className="relative z-10"
                  style={{ padding: `0 ${dimensions.padding}px ${dimensions.padding}px` }}
                >
                  <div className="flex items-center justify-center gap-1 mb-1.5 flex-wrap">
                    {card.keywords.slice(0, size === 'sm' ? 1 : 2).map((kw) => (
                      <span
                        key={kw}
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/10 text-indigo-200 border border-white/10"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {/* 정방향 / 역방향 표시 */}
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isReversed
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isReversed ? '↺ 역방향' : '✦ 정방향'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* ======================= Specular Glare (ReactBits 반사광) ======================= */}
        {enableTilt && isHovered && (
          <motion.div
            style={{
              left: glareX,
              top: glareY,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-white/35 via-white/10 to-transparent blur-md pointer-events-none mix-blend-overlay z-30"
          />
        )}
      </motion.div>
    </div>
  );
}
