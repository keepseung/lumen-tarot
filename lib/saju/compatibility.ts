import { Cheongan, FiveElement, Jiji, SajuResult } from './types';
import { CHEONGAN_DETAILS } from './constants';

export interface CompatibilityScore {
  totalScore: number; // 0 ~ 100
  grade: 'SOULMATE' | 'COSMIC' | 'SWEET' | 'HARMONIOUS' | 'GROWTH';
  gradeTitle: string;
  gradeSubtitle: string;
  emotionalScore: number; // 정신적 케미
  lifestyleScore: number; // 생활/현실 케미
  complementScore: number; // 오행 보완도
  cheonganMatchTitle: string;
  jijiMatchTitle: string;
  relationshipTips: string[];
}

/**
 * 두 사람의 사주를 비교하여 20대 감성 연애 & 소울메이트 궁합 분석
 */
export function calculateCompatibility(personA: SajuResult, personB: SajuResult): CompatibilityScore {
  const stemA = personA.dayMaster.hangul;
  const stemB = personB.dayMaster.hangul;

  const branchA = personA.pillars.day.jiji.hangul;
  const branchB = personB.pillars.day.jiji.hangul;

  let emotionalScore = 70; // 기본 점수
  let lifestyleScore = 70;
  let complementScore = 70;

  let cheonganMatchTitle = '서로의 개성을 존중하며 성장하는 관계';
  let jijiMatchTitle = '편안하고 자연스러운 일상적 교감';

  // 1. 천간합 (天干合): 갑기합, 을경합, 병신합, 정임합, 무계합
  const stemHapPairs = [
    ['갑', '기'],
    ['을', '경'],
    ['병', '신'],
    ['정', '임'],
    ['무', '계'],
  ];

  const hasStemHap = stemHapPairs.some(
    ([s1, s2]) => (stemA === s1 && stemB === s2) || (stemA === s2 && stemB === s1)
  );

  if (hasStemHap) {
    emotionalScore += 25;
    cheonganMatchTitle = `천생연분 천간합(${stemA}❤${stemB}) - 첫눈에 서로를 알아보는 영혼의 끌림`;
  } else {
    // 일간 오행 상생 여부
    const elA = CHEONGAN_DETAILS[stemA].element;
    const elB = CHEONGAN_DETAILS[stemB].element;

    if (isGenerating(elA, elB) || isGenerating(elB, elA)) {
      emotionalScore += 18;
      cheonganMatchTitle = '오행 상생의 따스한 온기 - 서로에게 무한한 지지와 영감을 주는 사이';
    } else if (elA === elB) {
      emotionalScore += 12;
      cheonganMatchTitle = '같은 오행의 친구 같은 유대감 - 말하지 않아도 서로의 마음을 꿰뚫어 보는 사이';
    } else {
      emotionalScore += 8;
    }
  }

  // 2. 지지육합 (地支六合) 및 삼합: 자축, 인해, 묘술, 진유, 사신, 오미
  const yukHapPairs = [
    ['자', '축'],
    ['인', '해'],
    ['묘', '술'],
    ['진', '유'],
    ['사', '신'],
    ['오', '미'],
  ];

  const hasYukHap = yukHapPairs.some(
    ([b1, b2]) => (branchA === b1 && branchB === b2) || (branchA === b2 && branchB === b1)
  );

  if (hasYukHap) {
    lifestyleScore += 26;
    jijiMatchTitle = `찰떡궁합 지지육합(${branchA}❤${branchB}) - 일상과 취향이 기적처럼 통하는 편안함`;
  } else {
    lifestyleScore += 15;
  }

  // 3. 오행 상호보완도 (Complementarity)
  // A에게 부족한 오행을 B가 많이 가지고 있고, B에게 부족한 오행을 A가 채워줄 때
  const lackingA = personA.elements.lackingElements;
  const lackingB = personB.elements.lackingElements;
  const dominantA = personA.elements.dominantElements;
  const dominantB = personB.elements.dominantElements;

  let mutualComplementCount = 0;
  for (const lack of lackingA) {
    if (dominantB.includes(lack)) mutualComplementCount++;
  }
  for (const lack of lackingB) {
    if (dominantA.includes(lack)) mutualComplementCount++;
  }

  complementScore += Math.min(mutualComplementCount * 12, 28);

  // 정규화 (최대 100)
  emotionalScore = Math.min(emotionalScore, 100);
  lifestyleScore = Math.min(lifestyleScore, 100);
  complementScore = Math.min(complementScore, 100);

  const totalScore = Math.round(
    emotionalScore * 0.4 + lifestyleScore * 0.35 + complementScore * 0.25
  );

  // 등급 산출
  let grade: CompatibilityScore['grade'] = 'HARMONIOUS';
  let gradeTitle = '편안하고 다정한 하모니';
  let gradeSubtitle = '잔잔한 호수처럼 서로에게 안식을 주는 예쁜 인연입니다.';

  if (totalScore >= 95) {
    grade = 'SOULMATE';
    gradeTitle = '우주가 맺어준 소울메이트 (100% 매칭)';
    gradeSubtitle = '서로의 결핍을 완벽히 메워주고 눈빛만 봐도 통하는 기적 같은 인연이에요.';
  } else if (totalScore >= 88) {
    grade = 'COSMIC';
    gradeTitle = '눈부시게 통하는 코스믹 케미';
    gradeSubtitle = '함께 있으면 에너지가 배가 되고 웃음이 끊이지 않는 설레는 궁합입니다.';
  } else if (totalScore >= 80) {
    grade = 'SWEET';
    gradeTitle = '달콤하고 안정적인 핑크빛 조화';
    gradeSubtitle = '취향과 가치관이 자연스럽게 어우러져 오랜 시간 신뢰를 쌓아갈 수 있어요.';
  } else if (totalScore >= 72) {
    grade = 'HARMONIOUS';
    gradeTitle = '배려와 다정함으로 물드는 관계';
    gradeSubtitle = '서로의 차이점을 귀엽게 바라봐주고 다정히 보듬어줄 때 더없이 빛나요.';
  } else {
    grade = 'GROWTH';
    gradeTitle = '서로에게 새로운 세상을 열어주는 관계';
    gradeSubtitle = '나와 전혀 다른 반대 성향에 매력을 느끼며, 함께 성장해 나가는 파트너예요.';
  }

  const relationshipTips = [
    `함께 있을 때: ${cheonganMatchTitle}`,
    `생활 패턴: ${jijiMatchTitle}`,
    `오행 시너지: ${
      mutualComplementCount > 0
        ? '서로 부족한 기운을 빈틈없이 채워주는 환상의 보완 관계입니다.'
        : '비슷한 기운을 공유하여 공감대가 깊고 친구처럼 편안합니다.'
    }`,
    '데이트 추천: 서로 좋아하는 감성 카페나 자연이 있는 산책 코스에서 깊은 대화를 나눠보세요.',
  ];

  return {
    totalScore,
    grade,
    gradeTitle,
    gradeSubtitle,
    emotionalScore,
    lifestyleScore,
    complementScore,
    cheonganMatchTitle,
    jijiMatchTitle,
    relationshipTips,
  };
}

function isGenerating(from: FiveElement, to: FiveElement): boolean {
  return (
    (from === 'wood' && to === 'fire') ||
    (from === 'fire' && to === 'earth') ||
    (from === 'earth' && to === 'metal') ||
    (from === 'metal' && to === 'water') ||
    (from === 'water' && to === 'wood')
  );
}
