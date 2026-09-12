import { getRomanNumeral } from './card-assets';
import { ReadingSession } from './types';

/**
 * 타로 리딩 결과를 1080x1920 Instagram Story 비율의 고화질 이미지로 렌더링하고 다운로드합니다.
 */
export async function downloadTarotStoryCard(
  session: ReadingSession
): Promise<void> {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. 깊은 우주 배경 그라데이션
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0B0B1E');
  bgGrad.addColorStop(0.4, '#17123A');
  bgGrad.addColorStop(0.8, '#1F1142');
  bgGrad.addColorStop(1, '#0A071A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. 은은한 오로라 광채 원형
  const aura1 = ctx.createRadialGradient(250, 350, 20, 250, 350, 450);
  aura1.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
  aura1.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = aura1;
  ctx.beginPath();
  ctx.arc(250, 350, 450, 0, Math.PI * 2);
  ctx.fill();

  const aura2 = ctx.createRadialGradient(850, 1400, 30, 850, 1400, 500);
  aura2.addColorStop(0, 'rgba(236, 72, 153, 0.2)');
  aura2.addColorStop(1, 'rgba(236, 72, 153, 0)');
  ctx.fillStyle = aura2;
  ctx.beginPath();
  ctx.arc(850, 1400, 500, 0, Math.PI * 2);
  ctx.fill();

  // 3. 별빛 파티클 흩뿌리기
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const starCoords = [
    [120, 200], [920, 280], [300, 800], [820, 950],
    [150, 1500], [940, 1620], [540, 180], [450, 1820],
  ];
  for (const [x, y] of starCoords) {
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 2 + 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. 상단 브랜드 헤더
  ctx.textAlign = 'center';
  ctx.fillStyle = '#A78BFA';
  ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText('✨  L U M E N   T A R O T  ✨', width / 2, 180);

  ctx.fillStyle = '#E0E7FF';
  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(session.spread.title, width / 2, 260);

  // 질문 서브타이틀
  const questionText = session.customQuestion
    ? `"${session.customQuestion}"`
    : session.preset?.label || session.spread.subtitle;
  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 32px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(questionText, width / 2, 325);

  // 5. 카드 영역 렌더링
  const cards = session.drawnCards;
  const isSingle = cards.length === 1;

  if (isSingle) {
    // 1장 중심형 레이아웃
    const card = cards[0];
    const cardX = 270;
    const cardY = 400;
    const cardW = 540;
    const cardH = 820;

    // 카드 외곽 골드 글로우
    ctx.save();
    ctx.shadowColor = card.card.gradient.accent;
    ctx.shadowBlur = 40;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // 카드 배경
    const cardBg = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    cardBg.addColorStop(0, '#1E1B4B');
    cardBg.addColorStop(1, '#0F172A');
    ctx.fillStyle = cardBg;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fill();

    // 카드 로마 숫자 & 영문명
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 36px serif';
    ctx.fillText(getRomanNumeral(card.card.number), width / 2, cardY + 70);

    // 카드 심볼 이모지
    ctx.font = '96px sans-serif';
    ctx.fillText(card.card.symbol, width / 2, cardY + 220);

    // 카드 한글명
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(card.card.nameKo, width / 2, cardY + 320);

    // 카드 영문명
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 28px serif';
    ctx.fillText(card.card.name, width / 2, cardY + 365);

    // 정/역방향 뱃지
    const dirBadge = card.isReversed ? '역방향 (Reversed)' : '정방향 (Upright)';
    ctx.fillStyle = card.isReversed ? '#F43F5E' : '#10B981';
    ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(dirBadge, width / 2, cardY + 420);

    // 키워드 칩
    const kwText = card.card.keywords.map((k) => `#${k}`).join('   ');
    ctx.fillStyle = '#C7D2FE';
    ctx.font = '600 30px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(kwText, width / 2, cardY + 490);

    // 럭키 조언 박스
    const adviceBoxY = 1300;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    drawRoundedRect(ctx, 120, adviceBoxY, 840, 360, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText('💫 오늘의 럭키 액션 가이드', width / 2, adviceBoxY + 70);

    const advice = card.isReversed
      ? card.card.reversed.advice
      : card.card.upright.advice;

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '400 30px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    wrapText(ctx, advice, width / 2, adviceBoxY + 150, 760, 48);
  } else {
    // 3장 나란히 배치 레이아웃
    const cardW = 270;
    const cardH = 430;
    const startY = 430;
    const gap = 35;
    const startX = (width - (cardW * 3 + gap * 2)) / 2;

    cards.forEach((card, i) => {
      const cx = startX + i * (cardW + gap);

      // 카드 배경
      const cardBg = ctx.createLinearGradient(cx, startY, cx, startY + cardH);
      cardBg.addColorStop(0, '#1E1B4B');
      cardBg.addColorStop(1, '#0F172A');
      ctx.fillStyle = cardBg;
      drawRoundedRect(ctx, cx, startY, cardW, cardH, 20);
      ctx.fill();

      // 테두리
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 포지션 명칭 (상단 바깥)
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(card.position.name, cx + cardW / 2, startY - 20);

      // 로마 숫자
      ctx.fillStyle = '#A78BFA';
      ctx.font = 'bold 22px serif';
      ctx.fillText(getRomanNumeral(card.card.number), cx + cardW / 2, startY + 45);

      // 심볼
      ctx.font = '52px sans-serif';
      ctx.fillText(card.card.symbol, cx + cardW / 2, startY + 130);

      // 한글명
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(card.card.nameKo, cx + cardW / 2, startY + 195);

      // 정/역방향
      ctx.fillStyle = card.isReversed ? '#FB7185' : '#34D399';
      ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(card.isReversed ? '역방향' : '정방향', cx + cardW / 2, startY + 235);

      // 첫 번째 키워드
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(`#${card.card.keywords[0]}`, cx + cardW / 2, startY + 285);
    });

    // 3장 종합 해석 리포트 박스
    const reportY = 960;
    const reportH = 680;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    drawRoundedRect(ctx, 100, reportY, 880, reportH, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText('✨ 세 카드가 전하는 종합 스토리', width / 2, reportY + 70);

    // 각 포지션별 1줄 요약
    cards.forEach((c, idx) => {
      const lineY = reportY + 150 + idx * 160;
      ctx.fillStyle = '#A78BFA';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(`[${c.position.name}]  ${c.card.nameKo}`, width / 2, lineY);

      const meaning = c.isReversed ? c.card.reversed.general : c.card.upright.general;
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '400 26px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      wrapText(ctx, meaning, width / 2, lineY + 45, 800, 36);
    });
  }

  // 6. 하단 워터마크 푸터
  ctx.fillStyle = '#64748B';
  ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText('LUMEN • 나를 비추는 감성 데스티니 연구소', width / 2, 1800);

  // 7. 다운로드 트리거
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `LUMEN_TAROT_${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * 둥근 모서리 사각형 경로 도출 헬퍼
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * 긴 텍스트 자동 줄바꿈 렌더링 헬퍼
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split('');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
