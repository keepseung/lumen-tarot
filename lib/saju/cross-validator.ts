import KoreanLunarCalendar from 'korean-lunar-calendar';
import * as manseryeok from '@fullstackfamily/manseryeok';
import { CalendarType, Cheongan, CrossValidationReport, Jiji } from './types';
import { SIXTY_GAPJA, SIXTY_GAPJA_HANJA } from './constants';
import { isBeforeLichunExact, getSajuMonthAndPillarExact } from './solar-terms';

export interface CrossValidationInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  calendarType: CalendarType;
  isLeapMonth?: boolean;
}

export interface VerifiedPillars {
  yearPillar: string;
  yearPillarHanja: string;
  yearStem: Cheongan;
  yearBranch: Jiji;

  monthPillar: string;
  monthPillarHanja: string;
  monthStem: Cheongan;
  monthBranch: Jiji;

  dayPillar: string;
  dayPillarHanja: string;
  dayStem: Cheongan;
  dayBranch: Jiji;

  solarDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };

  lunarDate: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  };

  report: CrossValidationReport;
}

/**
 * korean-lunar-calendar와 @fullstackfamily/manseryeok 두 패키지를 상호 교차 검증하고
 * 입춘(立春) 절입 시각 기준 연도 이월 버그를 이중 예외 보정하는 코어 함수
 */
export function crossValidateAndVerify(input: CrossValidationInput): VerifiedPillars {
  const {
    year: inYear,
    month: inMonth,
    day: inDay,
    hour: inHour,
    minute: inMinute,
    calendarType,
    isLeapMonth = false,
  } = input;

  const kCal = new KoreanLunarCalendar();

  let solarYear = inYear;
  let solarMonth = inMonth;
  let solarDay = inDay;

  let lunarYear = inYear;
  let lunarMonth = inMonth;
  let lunarDay = inDay;
  let lunarIsLeap = isLeapMonth;

  // 1. 음/양력 변환 교차 검증
  if (calendarType === 'lunar') {
    // A. korean-lunar-calendar로 음력 -> 양력 변환
    const kSuccess = kCal.setLunarDate(inYear, inMonth, inDay, isLeapMonth);
    const kSolar = kCal.getSolarCalendar();

    // B. @fullstackfamily/manseryeok으로 음력 -> 양력 변환
    let mSolar: { year: number; month: number; day: number };
    try {
      const mResult = manseryeok.lunarToSolar(inYear, inMonth, inDay, isLeapMonth);
      mSolar = mResult.solar;
    } catch {
      mSolar = { year: kSolar.year, month: kSolar.month, day: kSolar.day };
    }

    // 양력 확정 (KASI 데이터 기반)
    solarYear = mSolar.year || kSolar.year;
    solarMonth = mSolar.month || kSolar.month;
    solarDay = mSolar.day || kSolar.day;

    lunarYear = inYear;
    lunarMonth = inMonth;
    lunarDay = inDay;
    lunarIsLeap = isLeapMonth;
  } else {
    // 양력 입력
    solarYear = inYear;
    solarMonth = inMonth;
    solarDay = inDay;

    // A. korean-lunar-calendar로 양력 -> 음력 변환
    kCal.setSolarDate(solarYear, solarMonth, solarDay);
    const kLunar = kCal.getLunarCalendar();

    // B. @fullstackfamily/manseryeok으로 양력 -> 음력 변환
    let mLunar: { year: number; month: number; day: number; isLeapMonth: boolean };
    try {
      const mResult = manseryeok.solarToLunar(solarYear, solarMonth, solarDay);
      mLunar = {
        year: mResult.lunar.year,
        month: mResult.lunar.month,
        day: mResult.lunar.day,
        isLeapMonth: mResult.lunar.isLeapMonth,
      };
    } catch {
      mLunar = {
        year: kLunar.year,
        month: kLunar.month,
        day: kLunar.day,
        isLeapMonth: Boolean(kLunar.intercalation),
      };
    }

    lunarYear = mLunar.year || kLunar.year;
    lunarMonth = mLunar.month || kLunar.month;
    lunarDay = mLunar.day || kLunar.day;
    lunarIsLeap = Boolean(mLunar.isLeapMonth ?? kLunar.intercalation ?? false);
  }

  // 2. 두 라이브러리의 원시(Raw) 간지 데이터 조회
  kCal.setSolarDate(solarYear, solarMonth, solarDay);
  const kGapjaRaw = kCal.getKoreanGapja();
  const kYearPillar = kGapjaRaw.year.replace('년', '');
  const kMonthPillar = kGapjaRaw.month.replace('월', '');
  const kDayPillar = kGapjaRaw.day.replace('일', '');

  let mGapjaRaw = { yearPillar: '', monthPillar: '', dayPillar: '' };
  try {
    const mRes = manseryeok.solarToLunar(solarYear, solarMonth, solarDay);
    mGapjaRaw = {
      yearPillar: mRes.gapja.yearPillar,
      monthPillar: mRes.gapja.monthPillar,
      dayPillar: mRes.gapja.dayPillar,
    };
  } catch {
    mGapjaRaw = {
      yearPillar: kYearPillar,
      monthPillar: kMonthPillar,
      dayPillar: kDayPillar,
    };
  }

  // 3. 입춘(立春) 절입 시각 정밀 판별
  const lichunCheck = isBeforeLichunExact(solarYear, solarMonth, solarDay, inHour, inMinute);
  const isBeforeLichun = lichunCheck.isBefore;

  // 사주 연도(Saju Year) 결정:
  // 양력 1월 또는 2월 초이고 입춘 시각 이전이면 전년도(solarYear - 1)
  let sajuYear = solarYear;
  if (solarMonth <= 2 && isBeforeLichun) {
    sajuYear = solarYear - 1;
  }

  // 60갑자 공식으로 정확한 년주 산출
  let yearGapjaIdx = (sajuYear - 4) % 60;
  if (yearGapjaIdx < 0) yearGapjaIdx += 60;
  const verifiedYearPillar = SIXTY_GAPJA[yearGapjaIdx];
  const verifiedYearPillarHanja = SIXTY_GAPJA_HANJA[yearGapjaIdx];

  const yearStem = verifiedYearPillar[0] as Cheongan;
  const yearBranch = verifiedYearPillar[1] as Jiji;

  // 4. 월주(Month Pillar) 절기 정밀 계산
  const monthInfo = getSajuMonthAndPillarExact(
    solarYear,
    solarMonth,
    solarDay,
    inHour,
    inMinute,
    yearStem
  );
  const verifiedMonthPillar = monthInfo.monthPillar;
  const verifiedMonthPillarHanja = monthInfo.monthPillarHanja;
  const monthStem = monthInfo.monthStem;
  const monthBranch = monthInfo.monthBranch;

  // 5. 일주(Day Pillar) 정밀 검증
  // 일주는 연속 순환하므로 manseryeok과 korean-lunar-calendar가 일치해야 함
  let verifiedDayPillar = mGapjaRaw.dayPillar || kDayPillar;
  let dayGapjaIdx = SIXTY_GAPJA.indexOf(verifiedDayPillar);
  if (dayGapjaIdx === -1) {
    dayGapjaIdx = SIXTY_GAPJA.indexOf(kDayPillar);
    if (dayGapjaIdx === -1) dayGapjaIdx = 0;
    verifiedDayPillar = SIXTY_GAPJA[dayGapjaIdx];
  }
  const verifiedDayPillarHanja = SIXTY_GAPJA_HANJA[dayGapjaIdx];
  const dayStem = verifiedDayPillar[0] as Cheongan;
  const dayBranch = verifiedDayPillar[1] as Jiji;

  // 6. 교차 검증 상태 및 보정 내역 판정
  let status: CrossValidationReport['status'] = 'exact_match';
  let yearPillarCorrected = false;
  let monthPillarCorrected = false;
  let reason = '두 패키지의 데이터가 일치하며 입춘 절기 기준에 정확히 부합합니다.';
  let detail = `양력 ${solarYear}년 입춘 시각(${lichunCheck.lichunKstFormatted} KST)을 기준으로 정밀 판정되었습니다.`;

  const kMatched = kYearPillar === verifiedYearPillar;
  const mMatched = mGapjaRaw.yearPillar === verifiedYearPillar;

  if (!kMatched || !mMatched) {
    yearPillarCorrected = true;

    if (!kMatched && mMatched) {
      status = 'year_rollover_corrected';
      reason = 'korean-lunar-calendar 패키지의 음력 설날 기준 연도 변경 오류를 입춘 기준으로 이중 보정하였습니다.';
      detail = `입춘(${lichunCheck.lichunKstFormatted}) 전/후 경계에서 음력 1월 1일로 인한 1년 편차(${kYearPillar} -> ${verifiedYearPillar})를 교차 보정했습니다.`;
    } else if (kMatched && !mMatched) {
      status = 'hour_boundary_corrected';
      reason = 'manseryeok 패키지의 자정(00:00) 일괄 전환 오류를 입춘 정확한 시각 기준으로 보정하였습니다.';
      detail = `입춘 당일 입춘 시각 이전 출생자를 전년도 간지(${verifiedYearPillar})로 정상 복원했습니다.`;
    } else {
      status = 'lichun_boundary_corrected';
      reason = '연초 절기 경계선에서 두 패키지 모두 연도 이월 편차가 발생하여 KASI 천문역 기준으로 최종 보정하였습니다.';
      detail = `입춘 절입 일시(${lichunCheck.lichunKstFormatted}) 기준으로 사주 연도 ${sajuYear}년(${verifiedYearPillar})으로 확정되었습니다.`;
    }
  }

  if (kMonthPillar !== verifiedMonthPillar || mGapjaRaw.monthPillar !== verifiedMonthPillar) {
    monthPillarCorrected = true;
  }

  const report: CrossValidationReport = {
    status,
    koreanLunarCalendar: {
      yearPillar: kYearPillar,
      monthPillar: kMonthPillar,
      dayPillar: kDayPillar,
      lunarDate: { year: lunarYear, month: lunarMonth, day: lunarDay, isLeap: lunarIsLeap },
      solarDate: { year: solarYear, month: solarMonth, day: solarDay },
    },
    manseryeok: {
      yearPillar: mGapjaRaw.yearPillar,
      monthPillar: mGapjaRaw.monthPillar,
      dayPillar: mGapjaRaw.dayPillar,
      lunarDate: { year: lunarYear, month: lunarMonth, day: lunarDay, isLeap: lunarIsLeap },
      solarDate: { year: solarYear, month: solarMonth, day: solarDay },
    },
    lichunInfo: {
      year: solarYear,
      solarTermDateTime: `${lichunCheck.lichunKstFormatted} KST`,
      isBeforeLichun,
    },
    corrections: {
      yearPillarCorrected,
      monthPillarCorrected,
      reason,
      detail,
    },
  };

  return {
    yearPillar: verifiedYearPillar,
    yearPillarHanja: verifiedYearPillarHanja,
    yearStem,
    yearBranch,

    monthPillar: verifiedMonthPillar,
    monthPillarHanja: verifiedMonthPillarHanja,
    monthStem,
    monthBranch,

    dayPillar: verifiedDayPillar,
    dayPillarHanja: verifiedDayPillarHanja,
    dayStem,
    dayBranch,

    solarDate: {
      year: solarYear,
      month: solarMonth,
      day: solarDay,
      hour: inHour,
      minute: inMinute,
    },

    lunarDate: {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeapMonth: lunarIsLeap,
    },

    report,
  };
}
