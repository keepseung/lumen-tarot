import { ElementBreakdown, FiveElement, FiveElementKorean } from './types';
import { CHEONGAN_DETAILS, JIJI_DETAILS } from './constants';

export interface ElementInputPillars {
  yearStem: string;
  yearBranch: string;
  monthStem: string;
  monthBranch: string;
  dayStem: string;
  dayBranch: string;
  hourStem?: string | null;
  hourBranch?: string | null;
}

export interface LifestyleRecommendation {
  element: FiveElementKorean;
  luckyColor: string;
  luckyColorName: string;
  luckyItem: string;
  luckyActivity: string;
  fashionAdvice: string;
}

export const LIFESTYLE_RECOMMENDATIONS: Record<FiveElementKorean, LifestyleRecommendation> = {
  목: {
    element: '목',
    luckyColor: '#10B981',
    luckyColorName: '세이지 그린 / 민트 파스텔',
    luckyItem: '반려 식물(몬스테라/다육이), 우디 계열 니치 향수, 패브릭 에코백',
    luckyActivity: '아침 숲길 산책, 새로운 취미 클래스 시작하기, 독서',
    fashionAdvice: '내추럴한 린넨 셔츠나 싱그러운 올리브/그린 톤의 감성 룩',
  },
  화: {
    element: '화',
    luckyColor: '#F43F5E',
    luckyColorName: '블러쉬 로즈 / 코랄 핑크',
    luckyItem: '아로마 캔들, 코랄/로즈 틴트, 햇살이 잘 드는 카페의 조명',
    luckyActivity: '신나는 음악과 함께하는 유산소 운동, 전시회/공연 관람',
    fashionAdvice: '포인트가 되는 화사한 레드/핑크 계열 아이템이나 로즈골드 액세서리',
  },
  토: {
    element: '토',
    luckyColor: '#F59E0B',
    luckyColorName: '웜 피치 / 버터 크림 / 베이지',
    luckyItem: '도자기 머그컵, 테라코타 화분, 포근한 캐시미어 머플러',
    luckyActivity: '도예 공방 원데이 클래스, 온천이나 반신욕으로 몸 덥히기',
    fashionAdvice: '차분하고 포근한 뉴트럴 베이지, 카멜, 버터 옐로우 톤온톤 코디',
  },
  금: {
    element: '금',
    luckyColor: '#94A3B8',
    luckyColorName: '실버 라일락 / 쿨 펄 / 화이트',
    luckyItem: '실버 링/목걸이 주얼리, 화이트 가죽 시계, 메탈 프레임 안경',
    luckyActivity: '방 안의 불필요한 물건 미니멀 비우기, 필라테스나 스트레칭',
    fashionAdvice: '선이 깔끔하게 떨어지는 모던 화이트 셔츠와 실버 악센트 스타일링',
  },
  수: {
    element: '수',
    luckyColor: '#6366F1',
    luckyColorName: '소프트 스카이 / 미드나잇 블루',
    luckyItem: '휴대용 텀블러, 촉촉한 미스트, 블루투스 무드등, 만년필',
    luckyActivity: '물가(한강, 바다) 드라이브나 밤 산책, 반신욕, 명상과 다이어리 쓰기',
    fashionAdvice: '깊이감 있는 네이비/인디고 블루 니트나 하늘하늘한 실크 소재',
  },
};

/**
 * 4주 8자의 오행 개수, 백분율, 그리고 월지(계절 득령) 가중치 세력 점수 산출
 */
export function calculateElementBreakdown(pillars: ElementInputPillars): ElementBreakdown {
  const counts: Record<FiveElement, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  const weightedScores: Record<FiveElement, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 글자별 오행 추출
  const elementsList: { element: FiveElement; weight: number }[] = [];

  // 년주: 천간 5점, 지지 10점
  if (pillars.yearStem && pillars.yearStem in CHEONGAN_DETAILS) {
    elementsList.push({ element: CHEONGAN_DETAILS[pillars.yearStem as keyof typeof CHEONGAN_DETAILS].element, weight: 5 });
  }
  if (pillars.yearBranch && pillars.yearBranch in JIJI_DETAILS) {
    elementsList.push({ element: JIJI_DETAILS[pillars.yearBranch as keyof typeof JIJI_DETAILS].element, weight: 10 });
  }

  // 월주: 천간 10점, 지지(월지/득령) 35점 (사주 전체의 계절과 기운 장악)
  if (pillars.monthStem && pillars.monthStem in CHEONGAN_DETAILS) {
    elementsList.push({ element: CHEONGAN_DETAILS[pillars.monthStem as keyof typeof CHEONGAN_DETAILS].element, weight: 10 });
  }
  if (pillars.monthBranch && pillars.monthBranch in JIJI_DETAILS) {
    elementsList.push({ element: JIJI_DETAILS[pillars.monthBranch as keyof typeof JIJI_DETAILS].element, weight: 35 });
  }

  // 일주: 일간(나) 10점, 일지(득지) 15점
  if (pillars.dayStem && pillars.dayStem in CHEONGAN_DETAILS) {
    elementsList.push({ element: CHEONGAN_DETAILS[pillars.dayStem as keyof typeof CHEONGAN_DETAILS].element, weight: 10 });
  }
  if (pillars.dayBranch && pillars.dayBranch in JIJI_DETAILS) {
    elementsList.push({ element: JIJI_DETAILS[pillars.dayBranch as keyof typeof JIJI_DETAILS].element, weight: 15 });
  }

  // 시주: 천간 5점, 지지 10점 (시주가 없는 경우 나머지 비례 배분)
  const hasHour = !!(pillars.hourStem && pillars.hourBranch);
  if (hasHour) {
    if (pillars.hourStem && pillars.hourStem in CHEONGAN_DETAILS) {
      elementsList.push({ element: CHEONGAN_DETAILS[pillars.hourStem as keyof typeof CHEONGAN_DETAILS].element, weight: 5 });
    }
    if (pillars.hourBranch && pillars.hourBranch in JIJI_DETAILS) {
      elementsList.push({ element: JIJI_DETAILS[pillars.hourBranch as keyof typeof JIJI_DETAILS].element, weight: 10 });
    }
  }

  // 1. 단순 개수 집계
  for (const item of elementsList) {
    counts[item.element]++;
  }

  const totalCount = elementsList.length; // 8자 (시주 없으면 6자)
  const percentages: Record<FiveElement, number> = {
    wood: totalCount > 0 ? Math.round((counts.wood / totalCount) * 100) : 0,
    fire: totalCount > 0 ? Math.round((counts.fire / totalCount) * 100) : 0,
    earth: totalCount > 0 ? Math.round((counts.earth / totalCount) * 100) : 0,
    metal: totalCount > 0 ? Math.round((counts.metal / totalCount) * 100) : 0,
    water: totalCount > 0 ? Math.round((counts.water / totalCount) * 100) : 0,
  };

  // 2. 가중치 점수 집계
  let totalWeight = 0;
  for (const item of elementsList) {
    weightedScores[item.element] += item.weight;
    totalWeight += item.weight;
  }

  // 100점 기준으로 정규화
  const weightedPercentages: Record<FiveElement, number> = {
    wood: totalWeight > 0 ? Math.round((weightedScores.wood / totalWeight) * 100) : 0,
    fire: totalWeight > 0 ? Math.round((weightedScores.fire / totalWeight) * 100) : 0,
    earth: totalWeight > 0 ? Math.round((weightedScores.earth / totalWeight) * 100) : 0,
    metal: totalWeight > 0 ? Math.round((weightedScores.metal / totalWeight) * 100) : 0,
    water: totalWeight > 0 ? Math.round((weightedScores.water / totalWeight) * 100) : 0,
  };

  const koreanMap: Record<FiveElement, FiveElementKorean> = {
    wood: '목',
    fire: '화',
    earth: '토',
    metal: '금',
    water: '수',
  };

  // 3. 최다(주도) 오행 및 부족(결핍) 오행 분석
  const dominantElements: FiveElementKorean[] = [];
  const lackingElements: FiveElementKorean[] = [];

  const maxScore = Math.max(...Object.values(weightedPercentages));
  const minScore = Math.min(...Object.values(weightedPercentages));

  for (const [el, score] of Object.entries(weightedPercentages) as [FiveElement, number][]) {
    if (score === maxScore && score >= 25) {
      dominantElements.push(koreanMap[el]);
    }
    if (score === 0 || (score <= 10 && score === minScore)) {
      lackingElements.push(koreanMap[el]);
    }
  }

  // 분석 문장 생성
  let scoreAnalysis = '';
  if (dominantElements.length > 0) {
    scoreAnalysis += `당신의 사주는 ${dominantElements.join(', ')} 기운이 가장 왕성하게 흐르고 있습니다. `;
  }
  if (lackingElements.length > 0) {
    scoreAnalysis += `상대적으로 ${lackingElements.join(', ')} 기운이 보완되면 조화로운 에너지가 완성됩니다.`;
  } else {
    scoreAnalysis += '오행이 비교적 골고루 균형을 이루고 있어 안정적인 기운을 지녔습니다.';
  }

  return {
    counts,
    percentages,
    weightedScores,
    weightedPercentages,
    dominantElements,
    lackingElements,
    scoreAnalysis,
  };
}
