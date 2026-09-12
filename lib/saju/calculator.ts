import {
  Cheongan,
  CheonganInfo,
  Jiji,
  JijiInfo,
  PillarInfo,
  SajuCalculationInput,
  SajuResult,
  TenGod,
} from './types';
import {
  CHEONGAN_DETAILS,
  CHEONGAN_LIST,
  JIJI_DETAILS,
  JIJI_LIST,
  SIXTY_GAPJA,
  SIXTY_GAPJA_HANJA,
} from './constants';
import { crossValidateAndVerify } from './cross-validator';
import { calculateHiddenStems, calculateTenGod, summarizeTenGods } from './ten-gods';
import { calculateElementBreakdown } from './elements';
import { analyzeSinsal } from './sinsal';
import { calculateDaewoon } from './daewoon';

// 10천간 자연물 페르소나 매핑 (20대 여성 맞춤형 감성 타이틀)
export const DAY_MASTER_PERSONAS: Record<
  Cheongan,
  { title: string; subtitle: string; essence: string; keyword: string }
> = {
  갑: {
    title: '푸른 숲을 지키는 늠름하고 당당한 큰 나무',
    subtitle: '성장과 리더십의 아이콘',
    essence: '어떤 비바람에도 꺾이지 않고 하늘을 향해 곧게 뻗어나가는 곧은 기상과 추진력을 지녔어요.',
    keyword: '리더십, 곧은 신념, 성장 잠재력, 개척자',
  },
  을: {
    title: '봄바람에 춤추는 싱그럽고 유연한 들꽃',
    subtitle: '친화력과 회복탄력성의 요정',
    essence: '바위틈에서도 기어이 꽃을 피워내는 부드러운 생명력과 누구와도 어우러지는 다정함을 품었어요.',
    keyword: '적응력, 사랑스러움, 외유내강, 끈기',
  },
  병: {
    title: '세상을 환하게 비추는 찬란하고 따스한 태양',
    subtitle: '밝은 에너지와 열정의 중심',
    essence: '주변을 환하게 밝히는 긍정적인 오라와 가식 없이 투명하게 빛나는 열정을 지니고 있어요.',
    keyword: '밝은 에너지, 솔직함, 존재감, 열정',
  },
  정: {
    title: '어두운 밤하늘을 은은히 밝히는 영롱한 촛불',
    subtitle: '따뜻한 온기와 섬세한 통찰',
    essence: '조용하지만 깊은 마음으로 상대를 위로하고, 집중력과 예술적인 감수성이 뛰어난 사람이에요.',
    keyword: '온기, 섬세함, 집중력, 공감 능력',
  },
  무: {
    title: '사계절을 온전히 품어 안는 듬직하고 넓은 대지',
    subtitle: '신뢰와 포용력의 상징',
    essence: '모든 사람의 비밀과 상처를 묵묵히 품어주는 믿음직한 안식처 같은 포근함을 지녔어요.',
    keyword: '포용력, 신뢰감, 듬직함, 안정성',
  },
  기: {
    title: '꽃과 풀을 정성스레 키워내는 비옥하고 따스한 정원',
    subtitle: '세심한 배려와 알찬 실속',
    essence: '생명을 기르는 흙처럼 꼼꼼하고 다정한 손길로 주위를 가꾸며 실속과 배려를 모두 챙겨요.',
    keyword: '배려심, 실용성, 다정함, 현실 감각',
  },
  경: {
    title: '순수한 결의를 품은 단단하고 명철한 원석',
    subtitle: '의리와 결단력의 소유자',
    essence: '맺고 끊음이 분명한 쿨한 매력과 약속을 목숨처럼 지키는 의리 넘치는 멋진 성품을 지녔어요.',
    keyword: '의리, 결단력, 솔직함, 카리스마',
  },
  신: {
    title: '영롱하게 반짝이는 섬세하고 도회적인 보석',
    subtitle: '세련미와 미적 감각의 완성',
    essence: '자신만의 독보적인 취향과 빛깔을 지녔으며, 깔끔하고 예리한 감각으로 빛을 발하는 사람이에요.',
    keyword: '미적 감각, 세련됨, 자존감, 완벽주의',
  },
  임: {
    title: '끝없이 펼쳐진 자유롭고 깊은 푸른 바다',
    subtitle: '지혜와 자유로운 영혼',
    essence: '어떤 틀에도 얽매이지 않고 유연하게 흘러가며 깊은 생각과 무한한 가능성을 품고 있어요.',
    keyword: '자유로움, 통찰력, 유연함, 큰 스케일',
  },
  계: {
    title: '만물을 촉촉이 적셔주는 맑고 청초한 아침 이슬',
    subtitle: '기민한 감각과 영리한 직관',
    essence: '스펀지처럼 지식을 흡수하는 영민함과 상대의 마음을 조용히 읽어내는 맑은 눈을 가졌어요.',
    keyword: '직관력, 영리함, 청초함, 기민성',
  },
};

/**
 * 사주 종합 계산 메인 함수
 */
export function calculateSajuComplete(input: SajuCalculationInput): SajuResult {
  const {
    year,
    month,
    day,
    hour,
    minute = 0,
    calendarType = 'solar',
    isLeapMonth = false,
    useTrueSolarTime = true,
  } = input;

  // 1. 진태양시 (-30분 동경 127.5도) 보정 계산
  let calcHour = hour !== undefined ? hour : 12; // 시간 미입력 시 정오 기본값
  let calcMinute = minute;
  let appliedOffset = 0;

  if (hour !== undefined && useTrueSolarTime) {
    appliedOffset = -30;
    calcMinute = minute - 30;
    if (calcMinute < 0) {
      calcMinute += 60;
      calcHour -= 1;
      if (calcHour < 0) {
        calcHour += 24;
      }
    }
  }

  // 2. 만세력 교차 검증 및 연도 이월 버그 보정 실행
  const verified = crossValidateAndVerify({
    year,
    month,
    day,
    hour: calcHour,
    minute: calcMinute,
    calendarType,
    isLeapMonth,
  });

  const dayMasterStem = verified.dayStem;

  // 3. 4개 기둥 조립 함수
  const buildPillarInfo = (
    stem: Cheongan,
    branch: Jiji,
    isDayMaster: boolean = false
  ): PillarInfo => {
    const sDetail = CHEONGAN_DETAILS[stem];
    const bDetail = JIJI_DETAILS[branch];

    const tenGodStem: TenGod | '일간' = isDayMaster ? '일간' : calculateTenGod(dayMasterStem, stem);
    const tenGodBranch: TenGod = calculateTenGod(dayMasterStem, bDetail.mainStem);
    const hiddenStems = calculateHiddenStems(dayMasterStem, branch);

    const pillarName = `${stem}${branch}`;
    const gapjaIdx = SIXTY_GAPJA.indexOf(pillarName);
    const pillarHanja = gapjaIdx !== -1 ? SIXTY_GAPJA_HANJA[gapjaIdx] : `${sDetail.hanja}${bDetail.hanja}`;

    const cheonganInfo: CheonganInfo = {
      hangul: stem,
      hanja: sDetail.hanja,
      element: sDetail.element,
      elementKorean: sDetail.elementKorean,
      elementHanja: sDetail.elementHanja,
      yinYang: sDetail.yinYang,
      yinYangKorean: sDetail.yinYangKorean,
      tenGod: tenGodStem,
    };

    const jijiInfo: JijiInfo = {
      hangul: branch,
      hanja: bDetail.hanja,
      element: bDetail.element,
      elementKorean: bDetail.elementKorean,
      elementHanja: bDetail.elementHanja,
      yinYang: bDetail.yinYang,
      yinYangKorean: bDetail.yinYangKorean,
      animal: bDetail.animal,
      tenGod: tenGodBranch,
      hiddenStems,
    };

    return {
      pillar: pillarName,
      pillarHanja,
      cheongan: cheonganInfo,
      jiji: jijiInfo,
    };
  };

  const yearPillar = buildPillarInfo(verified.yearStem, verified.yearBranch, false);
  const monthPillar = buildPillarInfo(verified.monthStem, verified.monthBranch, false);
  const dayPillar = buildPillarInfo(verified.dayStem, verified.dayBranch, true);

  // 4. 시주(時柱) 계산 (시간이 제공된 경우)
  let hourPillar: PillarInfo | null = null;
  if (hour !== undefined) {
    // 진태양시 기준 시지(時支) 결정
    let hourBranchId: number;
    if (calcHour === 23 || calcHour === 0) {
      hourBranchId = 0; // 자시
    } else {
      hourBranchId = Math.floor((calcHour + 1) / 2);
    }
    const hourBranch = JIJI_LIST[hourBranchId];

    // 오서둔기시법: 일간에 따른 시천간 결정
    const dayStemIdx = CHEONGAN_LIST.indexOf(dayMasterStem);
    const startHourStemIdx = ((dayStemIdx % 5) * 2) % 10;
    const hourStem = CHEONGAN_LIST[(startHourStemIdx + hourBranchId) % 10];

    hourPillar = buildPillarInfo(hourStem, hourBranch, false);
  }

  // 5. 오행 비율 및 세력 점수 산출
  const elements = calculateElementBreakdown({
    yearStem: yearPillar.cheongan.hangul,
    yearBranch: yearPillar.jiji.hangul,
    monthStem: monthPillar.cheongan.hangul,
    monthBranch: monthPillar.jiji.hangul,
    dayStem: dayPillar.cheongan.hangul,
    dayBranch: dayPillar.jiji.hangul,
    hourStem: hourPillar ? hourPillar.cheongan.hangul : null,
    hourBranch: hourPillar ? hourPillar.jiji.hangul : null,
  });

  // 6. 십성 요약 집계
  const allTenGods: (TenGod | '일간')[] = [
    yearPillar.cheongan.tenGod,
    yearPillar.jiji.tenGod,
    monthPillar.cheongan.tenGod,
    monthPillar.jiji.tenGod,
    dayPillar.jiji.tenGod,
  ];
  if (hourPillar) {
    allTenGods.push(hourPillar.cheongan.tenGod);
    allTenGods.push(hourPillar.jiji.tenGod);
  }
  const tenGods = summarizeTenGods(allTenGods);

  // 7. 페르소나 및 요약 문장
  const persona = DAY_MASTER_PERSONAS[dayMasterStem];
  const hourText = hourPillar ? ` ${hourPillar.pillar}` : '';
  const hourHanjaText = hourPillar ? ` ${hourPillar.pillarHanja}` : '';

  const sajuText = `${yearPillar.pillar} ${monthPillar.pillar} ${dayPillar.pillar}${hourText}`;
  const sajuHanjaText = `${yearPillar.pillarHanja} ${monthPillar.pillarHanja} ${dayPillar.pillarHanja}${hourHanjaText}`;

  const dominantText =
    elements.dominantElements.length > 0
      ? `${elements.dominantElements.join(', ')} 기운이 풍부한`
      : '오행이 조화로운';
  const lackingText =
    elements.lackingElements.length > 0
      ? `${elements.lackingElements.join(', ')} 기운을 채워주면 더욱 좋습니다.`
      : '오행 에너지가 균형을 이루고 있습니다.';

  // 8. 신살(도화/역마/화개/홍염/천을귀인) 분석
  const sinsal = analyzeSinsal(
    dayMasterStem,
    yearPillar.jiji.hangul,
    monthPillar.jiji.hangul,
    dayPillar.jiji.hangul,
    hourPillar ? hourPillar.jiji.hangul : null
  );

  // 9. 대운(10년 주기 인생 흐름) 계산
  const daewoon = calculateDaewoon(
    verified.solarDate.year,
    verified.solarDate.month,
    verified.solarDate.day,
    yearPillar.cheongan.hangul,
    monthPillar.pillar,
    input.gender || 'female'
  );

  return {
    input,
    solarDate: verified.solarDate,
    lunarDate: verified.lunarDate,
    correctedTime:
      hour !== undefined && useTrueSolarTime
        ? {
            hour: calcHour,
            minute: calcMinute,
            appliedOffsetMinutes: appliedOffset,
          }
        : undefined,
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    dayMaster: dayPillar.cheongan,
    elements,
    tenGods,
    validation: verified.report,
    sinsal,
    daewoon,
    summary: {
      sajuText,
      sajuHanjaText,
      dayMasterDescription: `${persona.title} (${persona.subtitle})`,
      dominantElementText: dominantText,
      lackingElementText: lackingText,
    },
  };
}
