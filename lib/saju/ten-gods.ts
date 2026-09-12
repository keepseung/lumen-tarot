import { Cheongan, FiveElement, HiddenStem, Jiji, TenGod, TenGodGroup, YinYang } from './types';
import { CHEONGAN_DETAILS, JIJI_DETAILS, TEN_GOD_GROUPS } from './constants';

/**
 * 일간(Day Master)과 대상 천간의 음양/오행 상생상극을 비교하여 십성(十星 / 十神) 판정
 */
export function calculateTenGod(dayStem: Cheongan, targetStem: Cheongan): TenGod {
  const dayInfo = CHEONGAN_DETAILS[dayStem];
  const targetInfo = CHEONGAN_DETAILS[targetStem];

  const sameElement = dayInfo.element === targetInfo.element;
  const sameYinYang = dayInfo.yinYang === targetInfo.yinYang;

  // 1. 비겁 (比劫): 오행이 같음
  if (sameElement) {
    return sameYinYang ? '비견' : '겁재';
  }

  // 2. 식상 (食傷): 내가 생함 (일간 -> 대상)
  if (isGenerating(dayInfo.element, targetInfo.element)) {
    return sameYinYang ? '식신' : '상관';
  }

  // 3. 재성 (財星): 내가 극함 (일간 -> 대상)
  if (isOvercoming(dayInfo.element, targetInfo.element)) {
    return sameYinYang ? '편재' : '정재';
  }

  // 4. 관성 (官星): 나를 극함 (대상 -> 일간)
  if (isOvercoming(targetInfo.element, dayInfo.element)) {
    return sameYinYang ? '편관' : '정관';
  }

  // 5. 인성 (印星): 나를 생함 (대상 -> 일간)
  if (isGenerating(targetInfo.element, dayInfo.element)) {
    return sameYinYang ? '편인' : '정인';
  }

  return '비견';
}

/**
 * 오행 상생: 목생화, 화생토, 토생금, 금생수, 수생목
 */
function isGenerating(from: FiveElement, to: FiveElement): boolean {
  return (
    (from === 'wood' && to === 'fire') ||
    (from === 'fire' && to === 'earth') ||
    (from === 'earth' && to === 'metal') ||
    (from === 'metal' && to === 'water') ||
    (from === 'water' && to === 'wood')
  );
}

/**
 * 오행 상극: 목극토, 토극수, 수극화, 화극금, 금극목
 */
function isOvercoming(from: FiveElement, to: FiveElement): boolean {
  return (
    (from === 'wood' && to === 'earth') ||
    (from === 'earth' && to === 'water') ||
    (from === 'water' && to === 'fire') ||
    (from === 'fire' && to === 'metal') ||
    (from === 'metal' && to === 'wood')
  );
}

/**
 * 특정 지지의 지장간(여기, 중기, 본기) 각각의 십성 계산
 */
export function calculateHiddenStems(dayStem: Cheongan, jiji: Jiji): HiddenStem[] {
  const detail = JIJI_DETAILS[jiji];
  const totalDays = detail.rawHiddenStems.reduce((sum, h) => sum + h.days, 0);

  return detail.rawHiddenStems.map((raw) => {
    const stemDetail = CHEONGAN_DETAILS[raw.stem];
    const tenGod = calculateTenGod(dayStem, raw.stem);
    const percentage = Math.round((raw.days / totalDays) * 100);

    return {
      stem: raw.stem,
      stemHanja: stemDetail.hanja,
      element: stemDetail.element,
      yinYang: stemDetail.yinYang,
      tenGod,
      days: raw.days,
      percentage,
      type: raw.type,
    };
  });
}

/**
 * 십성 그룹화 및 카운트
 */
export function summarizeTenGods(
  tenGodList: (TenGod | '일간')[]
): {
  counts: Record<TenGod, number>;
  groups: Record<TenGodGroup, number>;
  groupPercentages: Record<TenGodGroup, number>;
} {
  const counts: Record<TenGod, number> = {
    비견: 0,
    겁재: 0,
    식신: 0,
    상관: 0,
    편재: 0,
    정재: 0,
    편관: 0,
    정관: 0,
    편인: 0,
    정인: 0,
  };

  let totalValid = 0;
  for (const tg of tenGodList) {
    if (tg !== '일간' && tg in counts) {
      counts[tg as TenGod]++;
      totalValid++;
    }
  }

  const groups: Record<TenGodGroup, number> = {
    비겁: counts.비견 + counts.겁재,
    식상: counts.식신 + counts.상관,
    재성: counts.편재 + counts.정재,
    관성: counts.편관 + counts.정관,
    인성: counts.편인 + counts.정인,
  };

  const groupPercentages: Record<TenGodGroup, number> = {
    비겁: totalValid > 0 ? Math.round((groups.비겁 / totalValid) * 100) : 0,
    식상: totalValid > 0 ? Math.round((groups.식상 / totalValid) * 100) : 0,
    재성: totalValid > 0 ? Math.round((groups.재성 / totalValid) * 100) : 0,
    관성: totalValid > 0 ? Math.round((groups.관성 / totalValid) * 100) : 0,
    인성: totalValid > 0 ? Math.round((groups.인성 / totalValid) * 100) : 0,
  };

  return { counts, groups, groupPercentages };
}
