export type CalendarType = 'solar' | 'lunar';
export type Gender = 'male' | 'female';

export type FiveElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type FiveElementKorean = '목' | '화' | '토' | '금' | '수';
export type FiveElementHanja = '木' | '火' | '土' | '金' | '水';

export type YinYang = 'yin' | 'yang';
export type YinYangKorean = '음' | '양';

export type Cheongan = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';
export type CheonganHanja = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

export type Jiji = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';
export type JijiHanja = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

export type TenGod =
  | '비견'
  | '겁재'
  | '식신'
  | '상관'
  | '편재'
  | '정재'
  | '편관'
  | '정관'
  | '편인'
  | '정인';

export type TenGodGroup = '비겁' | '식상' | '재성' | '관성' | '인성';

export interface HiddenStem {
  stem: Cheongan;
  stemHanja: CheonganHanja;
  element: FiveElement;
  yinYang: YinYang;
  tenGod: TenGod;
  days: number; // 일수 (예: 7일, 7일, 16일)
  percentage: number; // 비율 (%)
  type: 'initial' | 'middle' | 'main'; // 여기, 중기, 정기(본기)
}

export interface CheonganInfo {
  hangul: Cheongan;
  hanja: CheonganHanja;
  element: FiveElement;
  elementKorean: FiveElementKorean;
  elementHanja: FiveElementHanja;
  yinYang: YinYang;
  yinYangKorean: YinYangKorean;
  tenGod: TenGod | '일간'; // 일간(본원) 또는 십성
}

export interface JijiInfo {
  hangul: Jiji;
  hanja: JijiHanja;
  element: FiveElement;
  elementKorean: FiveElementKorean;
  elementHanja: FiveElementHanja;
  yinYang: YinYang;
  yinYangKorean: YinYangKorean;
  animal: string;
  tenGod: TenGod; // 본기 기준 십성
  hiddenStems: HiddenStem[]; // 지장간 (여기, 중기, 본기)
}

export interface PillarInfo {
  pillar: string; // 예: "갑진"
  pillarHanja: string; // 예: "甲辰"
  cheongan: CheonganInfo;
  jiji: JijiInfo;
}

export interface SolarTermDetail {
  name: string;
  hanja: string;
  degree: number;
  dateTime: Date;
  formattedKst: string;
}

export interface CrossValidationReport {
  status: 'exact_match' | 'lichun_boundary_corrected' | 'year_rollover_corrected' | 'hour_boundary_corrected';
  koreanLunarCalendar: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    lunarDate: { year: number; month: number; day: number; isLeap: boolean };
    solarDate: { year: number; month: number; day: number };
  };
  manseryeok: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    lunarDate: { year: number; month: number; day: number; isLeap: boolean };
    solarDate: { year: number; month: number; day: number };
  };
  lichunInfo: {
    year: number;
    solarTermDateTime: string;
    isBeforeLichun: boolean;
  };
  corrections: {
    yearPillarCorrected: boolean;
    monthPillarCorrected: boolean;
    reason: string;
    detail: string;
  };
}

export interface ElementBreakdown {
  counts: Record<FiveElement, number>;
  percentages: Record<FiveElement, number>;
  weightedScores: Record<FiveElement, number>;
  weightedPercentages: Record<FiveElement, number>;
  dominantElements: FiveElementKorean[];
  lackingElements: FiveElementKorean[];
  scoreAnalysis: string;
}

export interface TenGodsSummary {
  counts: Record<TenGod, number>;
  groups: Record<TenGodGroup, number>;
  groupPercentages: Record<TenGodGroup, number>;
}

export interface SajuCalculationInput {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  calendarType?: CalendarType;
  isLeapMonth?: boolean;
  gender?: Gender;
  useTrueSolarTime?: boolean; // 진태양시 (-30분 동경 127.5도) 보정 여부
  jajasiMode?: 'early' | 'late'; // 조자시 / 야자시 모드
}

export interface SinsalInfo {
  name: string;
  hanja: string;
  category: 'charm' | 'activity' | 'art' | 'fortune' | 'nobility';
  title: string;
  description: string;
  advice: string;
  branch: Jiji;
  pillarName: '년지' | '월지' | '일지' | '시지';
}

export interface DaewoonStep {
  startAge: number;
  endAge: number;
  pillar: string;
  pillarHanja: string;
  stem: Cheongan;
  branch: Jiji;
  isCurrent: boolean;
  description: string;
}

export interface DaewoonAnalysis {
  daewoonNumber: number;
  isForward: boolean;
  currentAge: number;
  currentDaewoon: DaewoonStep;
  steps: DaewoonStep[];
  yearlyAdvice: string;
}

export interface SajuResult {
  input: SajuCalculationInput;
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
  correctedTime?: {
    hour: number;
    minute: number;
    appliedOffsetMinutes: number;
  };
  pillars: {
    year: PillarInfo;
    month: PillarInfo;
    day: PillarInfo;
    hour: PillarInfo | null;
  };
  dayMaster: CheonganInfo; // 일간 (나)
  elements: ElementBreakdown;
  tenGods: TenGodsSummary;
  validation: CrossValidationReport;
  sinsal?: SinsalInfo[];
  daewoon?: DaewoonAnalysis;
  summary: {
    sajuText: string;
    sajuHanjaText: string;
    dayMasterDescription: string;
    dominantElementText: string;
    lackingElementText: string;
  };
}
