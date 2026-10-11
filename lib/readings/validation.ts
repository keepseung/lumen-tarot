// 저장 파일의 중첩 필드까지 확인해 손상된 결과가 화면을 중단시키지 않게 합니다.
type Shape = 'string' | 'number' | 'boolean' | [Shape] | { [key: string]: Shape };

function matches(value: unknown, shape: Shape): boolean {
  if (typeof shape === 'string') return typeof value === shape && (shape !== 'number' || Number.isFinite(value));
  if (Array.isArray(shape)) return Array.isArray(value) && value.every(item => matches(item, shape[0]));
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Object.entries(shape).every(([key, child]) => {
    const optional = key.endsWith('?');
    const field = record[optional ? key.slice(0, -1) : key];
    return optional && field === undefined || matches(field, child);
  });
}
const stem: Shape = { hangul: 'string', hanja: 'string', element: 'string', elementKorean: 'string', elementHanja: 'string', yinYang: 'string', yinYangKorean: 'string', tenGod: 'string' };
const pillar: Shape = { pillar: 'string', pillarHanja: 'string', cheongan: stem, jiji: {
  ...stem, animal: 'string', hiddenStems: [{ stem: 'string', stemHanja: 'string', element: 'string', yinYang: 'string', tenGod: 'string', days: 'number', percentage: 'number', type: 'string' }],
} };
const elements: Shape = { wood: 'number', fire: 'number', earth: 'number', metal: 'number', water: 'number' };
const date: Shape = { year: 'number', month: 'number', day: 'number' };
const source: Shape = { yearPillar: 'string', monthPillar: 'string', dayPillar: 'string', solarDate: date, lunarDate: { ...date, isLeap: 'boolean' } };
const step: Shape = { startAge: 'number', endAge: 'number', pillar: 'string', pillarHanja: 'string', stem: 'string', branch: 'string', isCurrent: 'boolean', description: 'string' };
const saju: Shape = {
  solarDate: { ...date, hour: 'number', minute: 'number' }, lunarDate: { ...date, isLeapMonth: 'boolean' },
  'correctedTime?': { hour: 'number', minute: 'number', appliedOffsetMinutes: 'number' },
  pillars: { year: pillar, month: pillar, day: pillar }, dayMaster: stem,
  elements: { counts: elements, percentages: elements, weightedScores: elements, weightedPercentages: elements, dominantElements: ['string'], lackingElements: ['string'], scoreAnalysis: 'string' },
  tenGods: { counts: { 비견: 'number', 겁재: 'number', 식신: 'number', 상관: 'number', 편재: 'number', 정재: 'number', 편관: 'number', 정관: 'number', 편인: 'number', 정인: 'number' }, groups: { 비겁: 'number', 식상: 'number', 재성: 'number', 관성: 'number', 인성: 'number' }, groupPercentages: { 비겁: 'number', 식상: 'number', 재성: 'number', 관성: 'number', 인성: 'number' } },
  validation: { status: 'string', koreanLunarCalendar: source, manseryeok: source, lichunInfo: { year: 'number', solarTermDateTime: 'string', isBeforeLichun: 'boolean' }, corrections: { yearPillarCorrected: 'boolean', monthPillarCorrected: 'boolean', reason: 'string', detail: 'string' } },
  'sinsal?': [{ name: 'string', hanja: 'string', category: 'string', title: 'string', description: 'string', advice: 'string', branch: 'string', pillarName: 'string' }],
  'daewoon?': { daewoonNumber: 'number', isForward: 'boolean', currentAge: 'number', currentDaewoon: step, steps: [step], yearlyAdvice: 'string' },
  summary: { sajuText: 'string', sajuHanjaText: 'string', dayMasterDescription: 'string', dominantElementText: 'string', lackingElementText: 'string' },
};
const detail: Shape = { general: 'string', love: 'string', career: 'string', advice: 'string' };
const position: Shape = { index: 'number', name: 'string', description: 'string' };
const tarot: Shape = {
  id: 'string', createdAt: 'string', allowReversed: 'boolean', 'customQuestion?': 'string', 'synthesis?': 'string',
  'preset?': { id: 'string', category: 'string', spreadType: 'string', label: 'string', description: 'string', icon: 'string' },
  spread: { id: 'string', title: 'string', subtitle: 'string', cardCount: 'number', iconName: 'string', badge: 'string', positions: [position] },
  drawnCards: [{ isReversed: 'boolean', revealed: 'boolean', position, card: {
    id: 'string', number: 'number', name: 'string', nameKo: 'string', arcana: 'string', element: 'string', 'planetOrSign?': 'string', 'imagePath?': 'string', keywords: ['string'], summary: 'string', upright: detail, reversed: detail, symbol: 'string', gradient: { from: 'string', to: 'string', accent: 'string', glow: 'string' },
  } }],
};
export function isValidSajuResult(value: unknown): boolean {
  if (!matches(value, saju)) return false;
  const result = value as { pillars: { hour: unknown }; elements: { dominantElements: string[]; lackingElements: string[] } };
  return (result.pillars.hour === null || matches(result.pillars.hour, pillar)) &&
    [...result.elements.dominantElements, ...result.elements.lackingElements].every(element => ['목', '화', '토', '금', '수'].includes(element));
}
export function isValidTarotSession(value: unknown): boolean { return matches(value, tarot); }
