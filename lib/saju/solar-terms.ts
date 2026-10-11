import { Cheongan, Jiji } from './types';
import { CHEONGAN_LIST } from './constants';

export interface SolarTermInfo {
  name: string;
  hanja: string;
  degree: number;
  dateTimeUtc: Date;
  kstYear: number;
  kstMonth: number;
  kstDay: number;
  kstHour: number;
  kstMinute: number;
  formattedKst: string;
  sajuMonth: number; // 1 = 인월 (입춘~), ..., 12 = 축월 (소한~)
  isJie: boolean; // 절기(월의 시작, true) vs 중기(기운의 절정, false)
  branch: Jiji; // 월지
}

// 24절기 정의 (소한 285도 ~ 동지 270도)
export const SOLAR_TERMS_CONFIG = [
  { name: '소한', hanja: '小寒', degree: 285, month: 1, approxDay: 5, isJie: true, sajuMonth: 12, branch: '축' as Jiji },
  { name: '대한', hanja: '大寒', degree: 300, month: 1, approxDay: 20, isJie: false, sajuMonth: 12, branch: '축' as Jiji },
  { name: '입춘', hanja: '立春', degree: 315, month: 2, approxDay: 4, isJie: true, sajuMonth: 1, branch: '인' as Jiji },
  { name: '우수', hanja: '雨水', degree: 330, month: 2, approxDay: 19, isJie: false, sajuMonth: 1, branch: '인' as Jiji },
  { name: '경칩', hanja: '驚蟄', degree: 345, month: 3, approxDay: 5, isJie: true, sajuMonth: 2, branch: '묘' as Jiji },
  { name: '춘분', hanja: '春分', degree: 0, month: 3, approxDay: 20, isJie: false, sajuMonth: 2, branch: '묘' as Jiji },
  { name: '청명', hanja: '淸明', degree: 15, month: 4, approxDay: 5, isJie: true, sajuMonth: 3, branch: '진' as Jiji },
  { name: '곡우', hanja: '穀雨', degree: 30, month: 4, approxDay: 20, isJie: false, sajuMonth: 3, branch: '진' as Jiji },
  { name: '입하', hanja: '立夏', degree: 45, month: 5, approxDay: 5, isJie: true, sajuMonth: 4, branch: '사' as Jiji },
  { name: '소만', hanja: '小滿', degree: 60, month: 5, approxDay: 21, isJie: false, sajuMonth: 4, branch: '사' as Jiji },
  { name: '망종', hanja: '芒種', degree: 75, month: 6, approxDay: 5, isJie: true, sajuMonth: 5, branch: '오' as Jiji },
  { name: '하지', hanja: '夏至', degree: 90, month: 6, approxDay: 21, isJie: false, sajuMonth: 5, branch: '오' as Jiji },
  { name: '소서', hanja: '小暑', degree: 105, month: 7, approxDay: 7, isJie: true, sajuMonth: 6, branch: '미' as Jiji },
  { name: '대서', hanja: '大暑', degree: 120, month: 7, approxDay: 23, isJie: false, sajuMonth: 6, branch: '미' as Jiji },
  { name: '입추', hanja: '立秋', degree: 135, month: 8, approxDay: 7, isJie: true, sajuMonth: 7, branch: '신' as Jiji },
  { name: '처서', hanja: '處暑', degree: 150, month: 8, approxDay: 23, isJie: false, sajuMonth: 7, branch: '신' as Jiji },
  { name: '백로', hanja: '白露', degree: 165, month: 9, approxDay: 7, isJie: true, sajuMonth: 8, branch: '유' as Jiji },
  { name: '추분', hanja: '秋分', degree: 180, month: 9, approxDay: 23, isJie: false, sajuMonth: 8, branch: '유' as Jiji },
  { name: '한로', hanja: '寒露', degree: 195, month: 10, approxDay: 8, isJie: true, sajuMonth: 9, branch: '술' as Jiji },
  { name: '상강', hanja: '霜降', degree: 210, month: 10, approxDay: 23, isJie: false, sajuMonth: 9, branch: '술' as Jiji },
  { name: '입동', hanja: '立冬', degree: 225, month: 11, approxDay: 7, isJie: true, sajuMonth: 10, branch: '해' as Jiji },
  { name: '소설', hanja: '小雪', degree: 240, month: 11, approxDay: 22, isJie: false, sajuMonth: 10, branch: '해' as Jiji },
  { name: '대설', hanja: '大雪', degree: 255, month: 12, approxDay: 7, isJie: true, sajuMonth: 11, branch: '자' as Jiji },
  { name: '동지', hanja: '冬至', degree: 270, month: 12, approxDay: 22, isJie: false, sajuMonth: 11, branch: '자' as Jiji },
] as const;

/**
 * Jean Meeus 천문 알고리즘 기반 태양 시황경(Apparent Solar Longitude) 계산
 */
export function getApparentSolarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;

  // 태양 평균 황경 (L0)
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;

  // 태양 평균 근점이각 (M)
  const M = ((357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI) / 180;

  // 중심차 (C)
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);

  // 태양 진황경 (True Longitude)
  const trueLong = L0 + C;

  // 장동(Nutation) 및 광행차(Aberration) 보정
  const omega = ((125.04 - 1934.136 * T) * Math.PI) / 180;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega);

  return ((lambda % 360) + 360) % 360;
}

export function dateToJD(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function jdToDate(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

/**
 * 태양 황경이 targetDegree에 도달하는 정확한 일시(UTC)를 수치해석으로 산출
 */
export function calculateSolarTermExactUtc(
  year: number,
  targetDegree: number,
  approxMonth: number,
  approxDay: number
): Date {
  const t = Date.UTC(year, approxMonth - 1, approxDay, 0, 0, 0);
  let jd = dateToJD(new Date(t));

  for (let i = 0; i < 20; i++) {
    const sl = getApparentSolarLongitude(jd);
    let diff = sl - targetDegree;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.000005) break;
    jd -= diff / 0.9856;
  }

  return jdToDate(jd);
}

/**
 * UTC Date 객체를 KST(UTC+9) 날짜 컴포넌트로 분해
 */
export function utcToKstComponents(utcDate: Date): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  formatted: string;
} {
  const kstMillis = utcDate.getTime() + 9 * 3600000;
  const d = new Date(kstMillis);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted = `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`;

  return { year, month, day, hour, minute, formatted };
}

/**
 * KST 기준 일시를 UTC Date 객체로 변환
 */
export function kstToUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour - 9, minute, 0));
}

/**
 * 특정 연도의 입춘(立春, 315도) 정확한 정보 산출
 */
export function getLichunExact(year: number): {
  utcDate: Date;
  kstYear: number;
  kstMonth: number;
  kstDay: number;
  kstHour: number;
  kstMinute: number;
  formattedKst: string;
} {
  const utcDate = calculateSolarTermExactUtc(year, 315, 2, 4);
  const kst = utcToKstComponents(utcDate);
  return {
    utcDate,
    kstYear: kst.year,
    kstMonth: kst.month,
    kstDay: kst.day,
    kstHour: kst.hour,
    kstMinute: kst.minute,
    formattedKst: kst.formatted,
  };
}

/**
 * 특정 양력 일시(KST)가 해당 연도의 입춘 시각 이전인지 정밀 판별
 */
export function isBeforeLichunExact(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
  solarHour: number = 0,
  solarMinute: number = 0
): { isBefore: boolean; lichunKstFormatted: string } {
  const userUtc = kstToUtcDate(solarYear, solarMonth, solarDay, solarHour, solarMinute);
  const lichun = getLichunExact(solarYear);

  return {
    isBefore: userUtc.getTime() < lichun.utcDate.getTime(),
    lichunKstFormatted: lichun.formattedKst,
  };
}

/**
 * 특정 연도의 12 절기(절입일시) 정보 반환
 */
export function get12JieqiForYear(year: number): SolarTermInfo[] {
  return SOLAR_TERMS_CONFIG.filter((t) => t.isJie).map((config) => {
    const utcDate = calculateSolarTermExactUtc(
      year,
      config.degree,
      config.month,
      config.approxDay
    );
    const kst = utcToKstComponents(utcDate);
    return {
      name: config.name,
      hanja: config.hanja,
      degree: config.degree,
      dateTimeUtc: utcDate,
      kstYear: kst.year,
      kstMonth: kst.month,
      kstDay: kst.day,
      kstHour: kst.hour,
      kstMinute: kst.minute,
      formattedKst: kst.formatted,
      sajuMonth: config.sajuMonth,
      isJie: true,
      branch: config.branch,
    };
  });
}

/**
 * 양력 일시(KST)와 연간(Year Stem)을 기준으로, 24절기 절입 시각을 정밀 반영한 월주(월간 + 월지) 산출
 */
export function getSajuMonthAndPillarExact(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
  solarHour: number,
  solarMinute: number,
  yearStem: Cheongan
): {
  monthBranch: Jiji;
  monthStem: Cheongan;
  monthPillar: string;
  monthPillarHanja: string;
  sajuMonthNumber: number;
  currentJieqi: string;
  currentJieqiTime: string;
} {
  const userUtc = kstToUtcDate(solarYear, solarMonth, solarDay, solarHour, solarMinute);
  const targetTime = userUtc.getTime();

  // 절기 검색을 위해 전년도, 금년도, 익년도 절기 목록 통합
  const prevYearTerms = get12JieqiForYear(solarYear - 1);
  const thisYearTerms = get12JieqiForYear(solarYear);
  const nextYearTerms = get12JieqiForYear(solarYear + 1);

  const allTerms = [...prevYearTerms, ...thisYearTerms, ...nextYearTerms].sort(
    (a, b) => a.dateTimeUtc.getTime() - b.dateTimeUtc.getTime()
  );

  let matchedIndex = -1;
  for (let i = 0; i < allTerms.length - 1; i++) {
    const curr = allTerms[i].dateTimeUtc.getTime();
    const next = allTerms[i + 1].dateTimeUtc.getTime();
    if (targetTime >= curr && targetTime < next) {
      matchedIndex = i;
      break;
    }
  }

  if (matchedIndex === -1) {
    matchedIndex = targetTime < allTerms[0].dateTimeUtc.getTime() ? 0 : allTerms.length - 2;
  }

  const currentTerm = allTerms[matchedIndex];
  const monthBranch = currentTerm.branch;
  const sajuMonthNumber = currentTerm.sajuMonth; // 1 = 인월, ..., 12 = 축월

  // 오호둔월법: 연간에 따라 월간 시작
  const monthOrderIndex = (sajuMonthNumber - 1 + 12) % 12;
  const yIdx = CHEONGAN_LIST.indexOf(yearStem);
  const startStemIdx = ((yIdx % 5) * 2 + 2) % 10;
  const monthStem = CHEONGAN_LIST[(startStemIdx + monthOrderIndex) % 10];

  const stemHanja = (
    {
      갑: '甲',
      을: '乙',
      병: '丙',
      정: '丁',
      무: '戊',
      기: '己',
      경: '庚',
      신: '辛',
      임: '壬',
      계: '癸',
    } as const
  )[monthStem];

  const branchHanja = (
    {
      자: '子',
      축: '丑',
      인: '寅',
      묘: '卯',
      진: '辰',
      사: '巳',
      오: '午',
      미: '未',
      신: '申',
      유: '酉',
      술: '戌',
      해: '亥',
    } as const
  )[monthBranch];

  return {
    monthBranch,
    monthStem,
    monthPillar: `${monthStem}${monthBranch}`,
    monthPillarHanja: `${stemHanja}${branchHanja}`,
    sajuMonthNumber,
    currentJieqi: currentTerm.name,
    currentJieqiTime: currentTerm.formattedKst,
  };
}
