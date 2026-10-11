import { SajuResult } from './types';
import { LIFESTYLE_RECOMMENDATIONS } from './elements';
import { FiveElementKorean } from './types';

/**
 * HTML5 Canvas를 활용하여 9:16 인스타그램 스토리 규격(1080x1920)의 고화질 감성 카드를 생성하고 즉시 다운로드
 */
export function downloadInstagramStoryImage(result: SajuResult) {
  if (typeof window === 'undefined') return;

  const width = 1080;
  const height = 1920;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이 브라우저에서 이미지 생성을 지원하지 않습니다.');

  // 1. 몽환적인 파스텔 배경 그라데이션
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FFF5F5'); // Soft blush rose
  bgGrad.addColorStop(0.3, '#FAF5FF'); // Soft lavender
  bgGrad.addColorStop(0.7, '#F0FDF4'); // Mint mist
  bgGrad.addColorStop(1, '#FFFBEB'); // Warm butter cream
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 은은한 장식 원형 오브제
  ctx.save();
  const circleGrad1 = ctx.createRadialGradient(250, 300, 50, 250, 300, 400);
  circleGrad1.addColorStop(0, 'rgba(253, 226, 236, 0.6)');
  circleGrad1.addColorStop(1, 'rgba(253, 226, 236, 0)');
  ctx.fillStyle = circleGrad1;
  ctx.beginPath();
  ctx.arc(250, 300, 400, 0, Math.PI * 2);
  ctx.fill();

  const circleGrad2 = ctx.createRadialGradient(850, 1400, 50, 850, 1400, 500);
  circleGrad2.addColorStop(0, 'rgba(238, 242, 255, 0.7)');
  circleGrad2.addColorStop(1, 'rgba(238, 242, 255, 0)');
  ctx.fillStyle = circleGrad2;
  ctx.beginPath();
  ctx.arc(850, 1400, 500, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. 메인 글래스 카드 프레임 (외곽 둥근 카드)
  const cardX = 70;
  const cardY = 120;
  const cardW = width - 140;
  const cardH = height - 240;
  const cardRadius = 60;

  ctx.save();
  ctx.shadowColor = 'rgba(180, 150, 140, 0.15)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.stroke();
  ctx.restore();

  // 3. 상단 헤더 & 로고
  ctx.textAlign = 'center';
  ctx.fillStyle = '#E11D48'; // Rose-600
  ctx.font = '600 32px serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('L U M E N   S A J U', width / 2, cardY + 110);

  ctx.fillStyle = '#78716C'; // Stone-500
  ctx.font = '300 28px sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('나를 비추는 감성 정통 사주 리포트', width / 2, cardY + 160);

  // 구분선
  ctx.strokeStyle = '#F5EBE6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, cardY + 200);
  ctx.lineTo(width / 2 + 120, cardY + 200);
  ctx.stroke();

  // 4. 일간 페르소나 타이틀
  ctx.fillStyle = '#1C1917'; // Stone-900
  ctx.font = 'bold 54px serif';
  ctx.letterSpacing = '0px';
  ctx.fillText(result.dayMaster.hangul + ' (' + result.dayMaster.hanja + ')', width / 2, cardY + 285);

  ctx.fillStyle = '#292524';
  ctx.font = '500 36px sans-serif';
  ctx.fillText(result.summary.dayMasterDescription, width / 2, cardY + 345);

  ctx.fillStyle = '#78716C';
  ctx.font = '300 26px sans-serif';
  ctx.fillText(
    `양력 ${result.solarDate.year}.${String(result.solarDate.month).padStart(2, '0')}.${String(result.solarDate.day).padStart(2, '0')} 출생`,
    width / 2,
    cardY + 395
  );

  // 5. 4주 8자 오라클 카드 4개
  const pillarsList = [
    { title: '년주 (年柱)', pillar: result.pillars.year, isDayMaster: false },
    { title: '월주 (月柱)', pillar: result.pillars.month, isDayMaster: false },
    { title: '일주 (日柱·나)', pillar: result.pillars.day, isDayMaster: true },
    { title: '시주 (時柱)', pillar: result.pillars.hour, isDayMaster: false },
  ];

  const pillarCardW = 205;
  const pillarCardH = 430;
  const startX = cardX + (cardW - (pillarCardW * 4 + 30 * 3)) / 2;
  const pillarY = cardY + 460;

  pillarsList.forEach((item, index) => {
    const px = startX + index * (pillarCardW + 30);

    ctx.save();
    if (item.isDayMaster) {
      ctx.fillStyle = 'rgba(254, 243, 199, 0.7)'; // Warm gold
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = '#E7E5E4';
      ctx.lineWidth = 1.5;
    }

    roundRect(ctx, px, pillarY, pillarCardW, pillarCardH, 28);
    ctx.fill();
    ctx.stroke();

    // 카드 상단 타이틀
    ctx.fillStyle = item.isDayMaster ? '#B45309' : '#78716C';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(item.title, px + pillarCardW / 2, pillarY + 45);

    if (item.pillar) {
      // 천간 십성
      ctx.fillStyle = '#A8A29E';
      ctx.font = '500 20px sans-serif';
      ctx.fillText(item.pillar.cheongan.tenGod, px + pillarCardW / 2, pillarY + 95);

      // 천간 한자
      ctx.fillStyle = '#1C1917';
      ctx.font = 'bold 68px serif';
      ctx.fillText(item.pillar.cheongan.hanja, px + pillarCardW / 2, pillarY + 175);

      ctx.fillStyle = '#78716C';
      ctx.font = '400 22px sans-serif';
      ctx.fillText(item.pillar.cheongan.hangul, px + pillarCardW / 2, pillarY + 215);

      // 중앙 분리선
      ctx.strokeStyle = '#E7E5E4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 40, pillarY + 235);
      ctx.lineTo(px + pillarCardW - 40, pillarY + 235);
      ctx.stroke();

      // 지지 한자
      ctx.fillStyle = '#1C1917';
      ctx.font = 'bold 68px serif';
      ctx.fillText(item.pillar.jiji.hanja, px + pillarCardW / 2, pillarY + 315);

      // 지지 한글 & 띠
      ctx.fillStyle = '#78716C';
      ctx.font = '400 22px sans-serif';
      ctx.fillText(`${item.pillar.jiji.hangul}(${item.pillar.jiji.animal})`, px + pillarCardW / 2, pillarY + 355);

      // 지지 십성
      ctx.fillStyle = '#A8A29E';
      ctx.font = '500 20px sans-serif';
      ctx.fillText(item.pillar.jiji.tenGod, px + pillarCardW / 2, pillarY + 395);
    } else {
      ctx.fillStyle = '#A8A29E';
      ctx.font = '400 26px sans-serif';
      ctx.fillText('시간 모름', px + pillarCardW / 2, pillarY + pillarCardH / 2);
    }
    ctx.restore();
  });

  // 6. 오행 에너지 밸런스 요약 박스
  const elementBoxY = pillarY + pillarCardH + 45;
  const elementBoxH = 240;

  ctx.save();
  ctx.fillStyle = 'rgba(250, 250, 249, 0.9)';
  roundRect(ctx, startX, elementBoxY, pillarCardW * 4 + 90, elementBoxH, 32);
  ctx.fill();

  ctx.strokeStyle = '#E7E5E4';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 30px serif';
  ctx.fillText('오행 에너지 밸런스', startX + 45, elementBoxY + 55);

  ctx.fillStyle = '#78716C';
  ctx.font = '400 24px sans-serif';
  ctx.fillText(result.elements.scoreAnalysis, startX + 45, elementBoxY + 98);

  // 5개 오행 게이지 미니 표시
  const elList: { name: FiveElementKorean; val: number; color: string }[] = [
    { name: '목', val: result.elements.weightedPercentages.wood, color: '#10B981' },
    { name: '화', val: result.elements.weightedPercentages.fire, color: '#F43F5E' },
    { name: '토', val: result.elements.weightedPercentages.earth, color: '#F59E0B' },
    { name: '금', val: result.elements.weightedPercentages.metal, color: '#94A3B8' },
    { name: '수', val: result.elements.weightedPercentages.water, color: '#6366F1' },
  ];

  const barTotalW = pillarCardW * 4;
  const barItemW = (barTotalW - 20 * 4) / 5;
  const barY = elementBoxY + 140;

  elList.forEach((el, i) => {
    const bx = startX + 45 + i * (barItemW + 20);

    // 라벨
    ctx.fillStyle = '#44403C';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(`${el.name} ${el.val}%`, bx, barY);

    // 바 배경
    ctx.fillStyle = '#E7E5E4';
    roundRect(ctx, bx, barY + 12, barItemW, 14, 7);
    ctx.fill();

    // 바 채우기
    ctx.fillStyle = el.color;
    roundRect(ctx, bx, barY + 12, (barItemW * Math.min(el.val, 100)) / 100, 14, 7);
    ctx.fill();
  });
  ctx.restore();

  // 7. 럭키 라이프스타일 추천 섹션
  const luckyBoxY = elementBoxY + elementBoxH + 35;
  const luckyBoxH = 260;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 251, 235, 0.9)'; // Gold Tint
  roundRect(ctx, startX, luckyBoxY, pillarCardW * 4 + 90, luckyBoxH, 32);
  ctx.fill();

  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 2;
  ctx.stroke();

  const lackingEl = result.elements.lackingElements[0] || '목';
  const tip = LIFESTYLE_RECOMMENDATIONS[lackingEl as FiveElementKorean];

  ctx.textAlign = 'left';
  ctx.fillStyle = '#B45309';
  ctx.font = 'bold 30px serif';
  ctx.fillText(`🍀 나에게 행운을 주는 ${tip.element}의 기운 채우기`, startX + 45, luckyBoxY + 58);

  ctx.fillStyle = '#44403C';
  ctx.font = '500 25px sans-serif';
  ctx.fillText(`• 퍼스널 럭키 컬러: ${tip.luckyColorName}`, startX + 45, luckyBoxY + 115);
  ctx.fillText(`• 추천 행운 소품: ${tip.luckyItem}`, startX + 45, luckyBoxY + 162);
  ctx.fillText(`• 라이프스타일 힐링: ${tip.luckyActivity}`, startX + 45, luckyBoxY + 210);

  ctx.restore();

  // 8. 바닥 워터마크
  ctx.textAlign = 'center';
  ctx.fillStyle = '#A8A29E';
  ctx.font = '300 24px sans-serif';
  ctx.fillText('✨ KASI 천문역 기반 무결점 만세력 • LUMEN SAJU ✨', width / 2, height - 70);

  // 9. 다운로드 트리거
  const link = document.createElement('a');
  link.download = `lumen_saju_${result.solarDate.year}_${result.dayMaster.hangul}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
