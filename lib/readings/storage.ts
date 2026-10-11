import { isValidSajuResult, isValidTarotSession } from './validation';
import type { SajuResult } from '../saju/types';
import type { ReadingSession } from '../tarot/types';
import { validateSajuInput } from '../saju/input-validation';

export const LIBRARY_KEY = 'lumen.readings.v1';
export const LIBRARY_EVENT = 'lumen:readings-changed';
export const TOPICS = { love: '연애', career: '진로', relationship: '관계' } as const;
export type ReadingTopic = keyof typeof TOPICS;
export type ReadingPayload =
  | { kind: 'saju'; result: SajuResult; topic: ReadingTopic }
  | { kind: 'tarot'; session: ReadingSession };
export type SavedReading = ReadingPayload & { id: string; title: string; createdAt: string; version: 1 };

export function parseReadings(raw: string | null): SavedReading[] {
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length > 100) throw new Error('저장된 리딩함 형식을 확인할 수 없어요.');
  for (const entry of parsed) {
    if (!entry || entry.version !== 1 || typeof entry.id !== 'string' || typeof entry.title !== 'string' ||
        typeof entry.createdAt !== 'string' || !Number.isFinite(Date.parse(entry.createdAt))) {
      throw new Error('지원하지 않는 저장 데이터입니다.');
    }
    if (entry.kind === 'saju') {
      validateSajuInput(entry.result?.input ?? {});
      if (!Object.hasOwn(TOPICS, entry.topic) || !isValidSajuResult(entry.result) || !entry.result?.summary?.sajuText || !entry.result?.pillars?.day ||
          !Array.isArray(entry.result?.elements?.lackingElements) || !entry.result?.validation) {
        throw new Error('저장된 사주 결과를 읽을 수 없어요.');
      }
    } else if (entry.kind === 'tarot') {
      const session = entry.session;
      if (!isValidTarotSession(session) || !session?.id || !session.spread?.title || !Array.isArray(session.drawnCards) ||
          ![1, 3].includes(session.drawnCards.length) || session.drawnCards.length !== session.spread.cardCount ||
          session.drawnCards.some((item: ReadingSession['drawnCards'][number]) =>
            !item?.card?.id || !item.card.upright?.general || !item.card.reversed?.general ||
            typeof item.isReversed !== 'boolean' || !item.position?.name)) {
        throw new Error('저장된 타로 결과를 읽을 수 없어요.');
      }
    } else {
      throw new Error('지원하지 않는 리딩 종류입니다.');
    }
  }
  return parsed;
}

export function loadReadings(): SavedReading[] {
  return parseReadings(window.localStorage.getItem(LIBRARY_KEY));
}

function writeReadings(readings: SavedReading[]) {
  const serialized = JSON.stringify(readings);
  parseReadings(serialized);
  window.localStorage.setItem(LIBRARY_KEY, serialized);
  window.dispatchEvent(new Event(LIBRARY_EVENT));
}

export function saveReading(payload: ReadingPayload): void {
  const readings = loadReadings();
  const duplicate = readings.some(entry => payload.kind === 'tarot'
    ? entry.kind === 'tarot' && entry.session.id === payload.session.id
    : entry.kind === 'saju' && entry.topic === payload.topic && JSON.stringify(entry.result) === JSON.stringify(payload.result));
  if (duplicate) return;
  if (readings.length >= 100) throw new Error('리딩함이 가득 찼어요. 기존 결과를 삭제한 뒤 저장해주세요.');
  const title = payload.kind === 'tarot'
    ? payload.session.customQuestion || payload.session.preset?.label || payload.session.spread.title
    : `${TOPICS[payload.topic]} · ${payload.result.dayMaster.hangul} 일간 사주`;
  writeReadings([{ ...payload, id: crypto.randomUUID(), title, createdAt: new Date().toISOString(), version: 1 }, ...readings]);
}

export function deleteReading(id: string): void {
  writeReadings(loadReadings().filter(entry => entry.id !== id));
}

export function clearReadings(): void {
  window.localStorage.removeItem(LIBRARY_KEY);
  window.dispatchEvent(new Event(LIBRARY_EVENT));
}
