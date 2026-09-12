'use client';

import React, { useEffect, useRef } from 'react';

export function TarotBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 은하수 별빛 파티클
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.015 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 별빛 반짝임 업데이트 및 렌더링
      stars.forEach((star) => {
        star.alpha += star.speed * star.direction;
        if (star.alpha > 0.9) {
          star.alpha = 0.9;
          star.direction = -1;
        } else if (star.alpha < 0.15) {
          star.alpha = 0.15;
          star.direction = 1;
        }

        ctx.fillStyle = `rgba(240, 230, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* 딥 미드나잇 베이스 */}
      <div className="absolute inset-0 bg-[#0A071A]" />

      {/* 부드럽게 유영하는 오로라 그라데이션 블롭들 */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px] animate-pulse" />
      <div className="absolute top-[30%] right-[5%] w-[450px] h-[450px] rounded-full bg-pink-500/10 blur-[130px] animate-pulse [animation-duration:8s]" />
      <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px] animate-pulse [animation-duration:10s]" />
      <div className="absolute bottom-[-10%] right-[25%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse [animation-duration:7s]" />

      {/* 캔버스 파티클 레이어 */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
    </div>
  );
}
