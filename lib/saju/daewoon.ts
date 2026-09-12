import { Cheongan, Gender, Jiji, DaewoonStep, DaewoonAnalysis } from './types';
import { CHEONGAN_DETAILS, SIXTY_GAPJA, SIXTY_GAPJA_HANJA } from './constants';
import { get12JieqiForYear, kstToUtcDate } from './solar-terms';

/**
 * 대운(10년 주기 인생의 큰 흐름) 계산
 */
export function calculateDaewoon(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
  yearStem: Cheongan,
  monthPillar: string,
  gender: Gender
): DaewoonAnalysis {
  const isYangYear = CHEONGAN_DETAILS[yearStem].yinYang === 'yang';

  // 대운 순행/역행: 양남음녀(순행), 음남양녀(역행)
  // 남성 + 양간 = 순행 / 남성 + 음간 = 역행
  // 여성 + 양간 = 역행 / 여성 + 음간 = 순행
  const isForward = gender === 'male' ? isYangYear : !isYangYear;

  // 절기 일수 계산
  const prevYearTerms = get12JieqiForYear(solarYear - 1);
  const thisYearTerms = get12JieqiForYear(solarYear);
  const nextYearTerms = get12JieqiForYear(solarYear + 1);

  const allTerms = [...prevYearTerms, ...thisYearTerms, ...nextYearTerms].sort(
    (a, b) => a.dateTimeUtc.getTime() - b.dateTimeUtc.getTime()
  );

  const birthUtc = kstToUtcDate(solarYear, solarMonth, solarDay, 12, 0);
  const birthTime = birthUtc.getTime();

  let targetTermTime = birthTime;
  if (isForward) {
    // 순행: 생일 이후 가장 가까운 다음 절기
    const nextTerm = allTerms.find((t) => t.dateTimeUtc.getTime() > birthTime);
    targetTermTime = nextTerm ? nextTerm.dateTimeUtc.getTime() : birthTime + 30 * 86400000;
  } else {
    // 역행: 생일 이전 가장 가까운 이전 절기
    const prevTerms = allTerms.filter((t) => t.dateTimeUtc.getTime() < birthTime);
    const prevTerm = prevTerms[prevTerms.length - 1];
    targetTermTime = prevTerm ? prevTerm.dateTimeUtc.getTime() : birthTime - 30 * 86400000;
  }

  // 일수 차이 (3일 = 1년, 1일 = 4개월)
  const diffDays = Math.abs(targetTermTime - birthTime) / (86400000);
  let daewoonNumber = Math.round(diffDays / 3);
  if (daewoonNumber < 1) daewoonNumber = 1;
  if (daewoonNumber > 10) daewoonNumber = 10;

  // 대운 간지 나열 (월주 기준)
  let baseIdx = SIXTY_GAPJA.indexOf(monthPillar);
  if (baseIdx === -1) baseIdx = 0;

  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - solarYear + 1; // 한국식 나이

  const steps: DaewoonStep[] = [];
  let currentDaewoon: DaewoonStep | null = null;

  for (let i = 1; i <= 8; i++) {
    const stepIdx = isForward ? (baseIdx + i) % 60 : (baseIdx - i + 60) % 60;
    const startAge = (i - 1) * 10 + daewoonNumber;
    const endAge = startAge + 9;

    const pillar = SIXTY_GAPJA[stepIdx];
    const pillarHanja = SIXTY_GAPJA_HANJA[stepIdx];
    const isCurrent = currentAge >= startAge && currentAge <= endAge;

    const step: DaewoonStep = {
      startAge,
      endAge,
      pillar,
      pillarHanja,
      stem: pillar[0] as Cheongan,
      branch: pillar[1] as Jiji,
      isCurrent,
      description: `${startAge}세~${endAge}세: 새로운 환경과 인연이 인생의 무대를 넓혀주는 대운의 시기`,
    };

    if (isCurrent) {
      currentDaewoon = step;
    }
    steps.push(step);
  }

  if (!currentDaewoon) {
    currentDaewoon = steps[0];
  }

  // 올해 세운 조언
  const yearlyAdvice = `현재 당신은 ${currentDaewoon.startAge}세~${currentDaewoon.endAge}세(${currentDaewoon.pillar} 대운)의 흐름 속에 머물고 있습니다. 인생의 새로운 챕터를 열고 나만의 고유한 색채를 정립하기에 가장 좋은 시기입니다.`;

  return {
    daewoonNumber,
    isForward,
    currentAge,
    currentDaewoon,
    steps,
    yearlyAdvice,
  };
}
