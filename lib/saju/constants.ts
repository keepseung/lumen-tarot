import {
  Cheongan,
  CheonganHanja,
  FiveElement,
  FiveElementHanja,
  FiveElementKorean,
  Jiji,
  JijiHanja,
  TenGod,
  TenGodGroup,
  YinYang,
  YinYangKorean,
} from './types';

export const CHEONGAN_LIST: readonly Cheongan[] = [
  '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계',
] as const;

export const CHEONGAN_HANJA_LIST: readonly CheonganHanja[] = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
] as const;

export const JIJI_LIST: readonly Jiji[] = [
  '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
] as const;

export const JIJI_HANJA_LIST: readonly JijiHanja[] = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
] as const;

export interface CheonganDetail {
  hangul: Cheongan;
  hanja: CheonganHanja;
  element: FiveElement;
  elementKorean: FiveElementKorean;
  elementHanja: FiveElementHanja;
  yinYang: YinYang;
  yinYangKorean: YinYangKorean;
  color: string;
  bgClass: string;
  textClass: string;
}

export const CHEONGAN_DETAILS: Record<Cheongan, CheonganDetail> = {
  갑: {
    hangul: '갑',
    hanja: '甲',
    element: 'wood',
    elementKorean: '목',
    elementHanja: '木',
    yinYang: 'yang',
    yinYangKorean: '양',
    color: '#10b981', // green / cyan
    bgClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    textClass: 'text-emerald-400',
  },
  을: {
    hangul: '을',
    hanja: '乙',
    element: 'wood',
    elementKorean: '목',
    elementHanja: '木',
    yinYang: 'yin',
    yinYangKorean: '음',
    color: '#059669',
    bgClass: 'bg-emerald-600/15 border-emerald-600/30 text-emerald-300',
    textClass: 'text-emerald-300',
  },
  병: {
    hangul: '병',
    hanja: '丙',
    element: 'fire',
    elementKorean: '화',
    elementHanja: '火',
    yinYang: 'yang',
    yinYangKorean: '양',
    color: '#ef4444',
    bgClass: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    textClass: 'text-rose-400',
  },
  정: {
    hangul: '정',
    hanja: '丁',
    element: 'fire',
    elementKorean: '화',
    elementHanja: '火',
    yinYang: 'yin',
    yinYangKorean: '음',
    color: '#dc2626',
    bgClass: 'bg-rose-600/15 border-rose-600/30 text-rose-300',
    textClass: 'text-rose-300',
  },
  무: {
    hangul: '무',
    hanja: '戊',
    element: 'earth',
    elementKorean: '토',
    elementHanja: '土',
    yinYang: 'yang',
    yinYangKorean: '양',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    textClass: 'text-amber-400',
  },
  기: {
    hangul: '기',
    hanja: '己',
    element: 'earth',
    elementKorean: '토',
    elementHanja: '土',
    yinYang: 'yin',
    yinYangKorean: '음',
    color: '#d97706',
    bgClass: 'bg-amber-600/15 border-amber-600/30 text-amber-300',
    textClass: 'text-amber-300',
  },
  경: {
    hangul: '경',
    hanja: '庚',
    element: 'metal',
    elementKorean: '금',
    elementHanja: '金',
    yinYang: 'yang',
    yinYangKorean: '양',
    color: '#e2e8f0',
    bgClass: 'bg-slate-200/15 border-slate-300/30 text-slate-200',
    textClass: 'text-slate-200',
  },
  신: {
    hangul: '신',
    hanja: '辛',
    element: 'metal',
    elementKorean: '금',
    elementHanja: '金',
    yinYang: 'yin',
    yinYangKorean: '음',
    color: '#cbd5e1',
    bgClass: 'bg-slate-300/15 border-slate-400/30 text-slate-300',
    textClass: 'text-slate-300',
  },
  임: {
    hangul: '임',
    hanja: '壬',
    element: 'water',
    elementKorean: '수',
    elementHanja: '水',
    yinYang: 'yang',
    yinYangKorean: '양',
    color: '#3b82f6',
    bgClass: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    textClass: 'text-sky-400',
  },
  계: {
    hangul: '계',
    hanja: '癸',
    element: 'water',
    elementKorean: '수',
    elementHanja: '水',
    yinYang: 'yin',
    yinYangKorean: '음',
    color: '#2563eb',
    bgClass: 'bg-blue-600/15 border-blue-600/30 text-blue-300',
    textClass: 'text-blue-300',
  },
};

export interface RawHiddenStem {
  stem: Cheongan;
  days: number;
  type: 'initial' | 'middle' | 'main';
}

export interface JijiDetail {
  hangul: Jiji;
  hanja: JijiHanja;
  element: FiveElement;
  elementKorean: FiveElementKorean;
  elementHanja: FiveElementHanja;
  yinYang: YinYang;
  yinYangKorean: YinYangKorean;
  animal: string;
  mainStem: Cheongan; // 본기 천간
  rawHiddenStems: RawHiddenStem[];
  color: string;
  bgClass: string;
  textClass: string;
}

export const JIJI_DETAILS: Record<Jiji, JijiDetail> = {
  자: {
    hangul: '자',
    hanja: '子',
    element: 'water',
    elementKorean: '수',
    elementHanja: '水',
    yinYang: 'yang', // 체양용음: 체는 양수, 용은 계수(음수)
    yinYangKorean: '양',
    animal: '쥐',
    mainStem: '계',
    rawHiddenStems: [
      { stem: '임', days: 10, type: 'initial' },
      { stem: '계', days: 20, type: 'main' },
    ],
    color: '#3b82f6',
    bgClass: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    textClass: 'text-sky-400',
  },
  축: {
    hangul: '축',
    hanja: '丑',
    element: 'earth',
    elementKorean: '토',
    elementHanja: '土',
    yinYang: 'yin',
    yinYangKorean: '음',
    animal: '소',
    mainStem: '기',
    rawHiddenStems: [
      { stem: '계', days: 9, type: 'initial' },
      { stem: '신', days: 3, type: 'middle' },
      { stem: '기', days: 18, type: 'main' },
    ],
    color: '#d97706',
    bgClass: 'bg-amber-600/15 border-amber-600/30 text-amber-300',
    textClass: 'text-amber-300',
  },
  인: {
    hangul: '인',
    hanja: '寅',
    element: 'wood',
    elementKorean: '목',
    elementHanja: '木',
    yinYang: 'yang',
    yinYangKorean: '양',
    animal: '호랑이',
    mainStem: '갑',
    rawHiddenStems: [
      { stem: '무', days: 7, type: 'initial' },
      { stem: '병', days: 7, type: 'middle' },
      { stem: '갑', days: 16, type: 'main' },
    ],
    color: '#10b981',
    bgClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    textClass: 'text-emerald-400',
  },
  묘: {
    hangul: '묘',
    hanja: '卯',
    element: 'wood',
    elementKorean: '목',
    elementHanja: '木',
    yinYang: 'yin',
    yinYangKorean: '음',
    animal: '토끼',
    mainStem: '을',
    rawHiddenStems: [
      { stem: '갑', days: 10, type: 'initial' },
      { stem: '을', days: 20, type: 'main' },
    ],
    color: '#059669',
    bgClass: 'bg-emerald-600/15 border-emerald-600/30 text-emerald-300',
    textClass: 'text-emerald-300',
  },
  진: {
    hangul: '진',
    hanja: '辰',
    element: 'earth',
    elementKorean: '토',
    elementHanja: '土',
    yinYang: 'yang',
    yinYangKorean: '양',
    animal: '용',
    mainStem: '무',
    rawHiddenStems: [
      { stem: '을', days: 9, type: 'initial' },
      { stem: '계', days: 3, type: 'middle' },
      { stem: '무', days: 18, type: 'main' },
    ],
    color: '#f59e0b',
    bgClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    textClass: 'text-amber-400',
  },
  사: {
    hangul: '사',
    hanja: '巳',
    element: 'fire',
    elementKorean: '화',
    elementHanja: '火',
    yinYang: 'yin', // 체음용양: 체는 음화, 용은 병화(양화)
    yinYangKorean: '음',
    animal: '뱀',
    mainStem: '병',
    rawHiddenStems: [
      { stem: '무', days: 7, type: 'initial' },
      { stem: '경', days: 7, type: 'middle' },
      { stem: '병', days: 16, type: 'main' },
    ],
    color: '#ef4444',
    bgClass: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    textClass: 'text-rose-400',
  },
  오: {
    hangul: '오',
    hanja: '午',
    element: 'fire',
    elementKorean: '화',
    elementHanja: '火',
    yinYang: 'yang', // 체양용음: 체는 양화, 용은 정화(음화)
    yinYangKorean: '양',
    animal: '말',
    mainStem: '정',
    rawHiddenStems: [
      { stem: '병', days: 10, type: 'initial' },
      { stem: '기', days: 9, type: 'middle' },
      { stem: '정', days: 11, type: 'main' },
    ],
    color: '#dc2626',
    bgClass: 'bg-rose-600/15 border-rose-600/30 text-rose-300',
    textClass: 'text-rose-300',
  },
  미: {
    hangul: '미',
    hanja: '未',
    element: 'earth',
    elementKorean: '토',
    elementHanja: '土',
    yinYang: 'yin',
    yinYangKorean: '음',
    animal: '양',
    mainStem: '기',
    rawHiddenStems: [
      { stem: '정', days: 9, type: 'initial' },
      { stem: '을', days: 3, type: 'middle' },
      { stem: '기', days: 18, type: 'main' },
    ],
    color: '#d97706',
    bgClass: 'bg-amber-600/15 border-amber-600/30 text-amber-300',
    textClass: 'text-amber-300',
  },
  신: {
    hangul: '신',
    hanja: '申',
    element: 'metal',
    elementKorean: '금',
    elementHanja: '金',
    yinYang: 'yang',
    yinYangKorean: '양',
    animal: '원숭이',
    mainStem: '경',
    rawHiddenStems: [
      { stem: '무', days: 7, type: 'initial' },
      { stem: '임', days: 7, type: 'middle' },
      { stem: '경', days: 16, type: 'main' },
    ],
    color: '#e2e8f0',
    bgClass: 'bg-slate-200/15 border-slate-300/30 text-slate-200',
    textClass: 'text-slate-200',
  },
  유: {
    hangul: '유',
    hanja: '酉',
    element: 'metal',
    elementKorean: '금',
    elementHanja: '金',
    yinYang: 'yin',
    yinYangKorean: '음',
    animal: '닭',
    mainStem: '신',
    rawHiddenStems: [
      { stem: '경', days: 10, type: 'initial' },
      { stem: '신', days: 20, type: 'main' },
    ],
    color: '#cbd5e1',
    bgClass: 'bg-slate-300/15 border-slate-400/30 text-slate-300',
    textClass: 'text-slate-300',
  },
  술: {
    hangul: '술',
    hanja: '戌',
    element: 'earth',
    elementKorean: '토',
    elementHanja: '土',
    yinYang: 'yang',
    yinYangKorean: '양',
    animal: '개',
    mainStem: '무',
    rawHiddenStems: [
      { stem: '신', days: 9, type: 'initial' },
      { stem: '정', days: 3, type: 'middle' },
      { stem: '무', days: 18, type: 'main' },
    ],
    color: '#f59e0b',
    bgClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    textClass: 'text-amber-400',
  },
  해: {
    hangul: '해',
    hanja: '亥',
    element: 'water',
    elementKorean: '수',
    elementHanja: '水',
    yinYang: 'yin', // 체음용양: 체는 음수, 용은 임수(양수)
    yinYangKorean: '음',
    animal: '돼지',
    mainStem: '임',
    rawHiddenStems: [
      { stem: '무', days: 7, type: 'initial' },
      { stem: '갑', days: 7, type: 'middle' },
      { stem: '임', days: 16, type: 'main' },
    ],
    color: '#2563eb',
    bgClass: 'bg-blue-600/15 border-blue-600/30 text-blue-300',
    textClass: 'text-blue-300',
  },
};

// 60갑자 전체 목록
export const SIXTY_GAPJA: readonly string[] = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해',
] as const;

export const SIXTY_GAPJA_HANJA: readonly string[] = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
] as const;

// 십성 그룹 분류
export const TEN_GOD_GROUPS: Record<TenGod, TenGodGroup> = {
  비견: '비겁',
  겁재: '비겁',
  식신: '식상',
  상관: '식상',
  편재: '재성',
  정재: '재성',
  편관: '관성',
  정관: '관성',
  편인: '인성',
  정인: '인성',
};

// 십성 설명
export const TEN_GOD_DESCRIPTIONS: Record<TenGod, { name: string; hanja: string; role: string; characteristic: string }> = {
  비견: { name: '비견', hanja: '比肩', role: '형제/동료/자아', characteristic: '주체성, 독립심, 추진력, 자존심' },
  겁재: { name: '겁재', hanja: '劫財', role: '경쟁자/동업자', characteristic: '승부욕, 모험심, 끈기, 승부근성' },
  식신: { name: '식신', hanja: '食神', role: '의식주/표현/자녀', characteristic: '창의력, 전문성, 온화함, 낙천성' },
  상관: { name: '상관', hanja: '傷官', role: '재능/언변/개혁', characteristic: '언변, 예술성, 비판력, 임기응변' },
  편재: { name: '편재', hanja: '偏財', role: '유동재물/사업/아버지', characteristic: '사업수완, 결단력, 풍류, 공간지각' },
  정재: { name: '정재', hanja: '正財', role: '고정재물/안정/배우자', characteristic: '성실성, 꼼꼼함, 신용, 안정성' },
  편관: { name: '편관', hanja: '偏官', role: '권력/명예/직장/칠살', characteristic: '카리스마, 결단력, 인내심, 의리' },
  정관: { name: '정관', hanja: '正官', role: '규범/명예/공직', characteristic: '책임감, 준법성, 정직함, 단정함' },
  편인: { name: '편인', hanja: '偏印', role: '특수학문/기예/어머니', characteristic: '직관력, 독창성, 신비성, 집중력' },
  정인: { name: '정인', hanja: '正印', role: '정통학문/자비/어머니', characteristic: '학구열, 인자함, 도덕성, 수용력' },
};

// 오행 속성
export const ELEMENT_PROPERTIES: Record<FiveElement, {
  name: FiveElementKorean;
  hanja: FiveElementHanja;
  color: string;
  colorName: string;
  direction: string;
  season: string;
  description: string;
}> = {
  wood: { name: '목', hanja: '木', color: '#10b981', colorName: '청색(푸른색)', direction: '동(東)', season: '봄(春)', description: '성장, 뻗어나가는 기운, 인자함, 창조성' },
  fire: { name: '화', hanja: '火', color: '#ef4444', colorName: '적색(붉은색)', direction: '남(南)', season: '여름(夏)', description: '열정, 확산하는 기운, 예의, 화려함' },
  earth: { name: '토', hanja: '土', color: '#f59e0b', colorName: '황색(노란색)', direction: '중앙(中)', season: '환절기(季)', description: '포용, 중재하는 기운, 신의, 안정' },
  metal: { name: '금', hanja: '金', color: '#cbd5e1', colorName: '백색(하얀색)', direction: '서(西)', season: '가을(秋)', description: '결실, 수렴하는 기운, 의리, 결단력' },
  water: { name: '수', hanja: '水', color: '#3b82f6', colorName: '흑색(검은색/파란색)', direction: '북(北)', season: '겨울(冬)', description: '지혜, 침잠하는 기운, 유연함, 통찰력' },
};
