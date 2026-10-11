import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/saju/route';
import { calculateSajuComplete, SajuInputError } from '../lib/saju';
import { createShuffledDeck, selectDeckCards, createReadingSession, generateOverallSynthesis } from '../lib/tarot/spreads';
import { parseReadings, saveReading, loadReadings, deleteReading, clearReadings, LIBRARY_KEY } from '../lib/readings/storage';
import { getSajuGuidance } from '../lib/readings/saju-guidance';

async function main() {
  let checks = 0;
  const check = (name: string, test: () => void) => { test(); checks++; console.log(`✅ PASS: ${name}`); };
  const base = { year: 1998, month: 5, day: 20, hour: 14, minute: 30, calendarType: 'solar' as const, gender: 'female' as const };
  check('잘못된 날짜·윤달·정수·시간·연도를 계산 전에 거부', () => {
    for (const change of [
      { month: 0 }, { month: 13 }, { month: 2, day: 30 }, { day: 0 }, { day: 1.5 },
      { hour: -1 }, { hour: 24 }, { minute: 60 }, { minute: NaN }, { year: 1899 }, { year: 2051 },
      { isLeapMonth: true }, { calendarType: 'lunar' as const, isLeapMonth: true, month: 1 },
    ]) assert.throws(() => calculateSajuComplete({ ...base, ...change }), SajuInputError);
  });
  check('실제 양력 윤일과 음력 윤달을 허용하고 시간 모름은 시주 제외', () => {
    assert.ok(calculateSajuComplete({ ...base, year: 2024, month: 2, day: 29 }).pillars.day);
    const leap = calculateSajuComplete({ ...base, year: 2023, month: 2, day: 1, calendarType: 'lunar', isLeapMonth: true });
    assert.deepEqual([leap.solarDate.year, leap.solarDate.month, leap.solarDate.day], [2023, 3, 22]);
    assert.equal(calculateSajuComplete({ ...base, hour: undefined }).pillars.hour, null);
  });
  const deck = createShuffledDeck(true);
  const chosen = selectDeckCards(deck, [17, 2, 10], 3);
  const session = createReadingSession('love', { drawnData: chosen, allowReversed: true, customQuestion: '관계를 어떻게 돌아볼까요?' });
  check('선택 위치·순서·방향이 리딩에 그대로 연결되고 덱이 변경되지 않음', () => {
    assert.deepEqual(session.drawnCards.map(item => [item.card.id, item.isReversed]), [17, 2, 10].map(index => [deck[index].card.id, deck[index].isReversed]));
    assert.strictEqual(selectDeckCards(deck, [17], 1)[0], deck[17]);
    assert.equal(new Set(deck.map(item => item.card.id)).size, 22);
  });
  check('중복·범위 밖·소수·개수 불일치 선택 거부', () => {
    for (const indices of [[1, 1, 2], [-1, 0, 1], [22, 0, 1], [1.5, 0, 1], [1]]) {
      assert.throws(() => selectDeckCards(deck, indices, 3));
    }
  });
  check('종합 해석이 선택 카드와 방향의 실제 뜻을 반영하고 확정된 요약을 보관', () => {
    const synthesis = generateOverallSynthesis(session);
    assert.equal(session.synthesis, synthesis);
    const first = session.drawnCards[0];
    assert.ok(synthesis.includes((first.isReversed ? first.card.reversed : first.card.upright).love));
    const last = session.drawnCards[2];
    assert.ok(synthesis.includes((last.isReversed ? last.card.reversed : last.card.upright).advice));
  });
  const memory = new Map<string, string>();
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    localStorage: { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key) },
    dispatchEvent: () => true,
  } });
  try {
    const result = calculateSajuComplete(base);
    check('명식과 주제·질문·카드 결과를 재생성 없이 저장·재열람', () => {
      saveReading({ kind: 'saju', result, topic: 'career' });
      saveReading({ kind: 'tarot', session });
      const restored = parseReadings(memory.get(LIBRARY_KEY)!);
      assert.equal(restored.length, 2);
      assert.equal(restored[0].kind, 'tarot');
      if (restored[0].kind === 'tarot') assert.deepEqual(restored[0].session, JSON.parse(JSON.stringify(session)));
      if (restored[1].kind === 'saju') { assert.deepEqual(restored[1].result, JSON.parse(JSON.stringify(result))); assert.equal(restored[1].topic, 'career'); }
    });
    check('같은 결과의 중복 저장 방지·개별 삭제·전체 삭제', () => {
      saveReading({ kind: 'tarot', session });
      saveReading({ kind: 'saju', result, topic: 'career' });
      assert.equal(loadReadings().length, 2);
      deleteReading(loadReadings()[0].id);
      assert.equal(loadReadings().length, 1);
      clearReadings();
      assert.equal(loadReadings().length, 0);
    });
    check('손상·미지원 버전의 저장 데이터는 조용히 덮어쓰지 않음', () => {
      assert.throws(() => parseReadings('invalid json'));
      assert.throws(() => parseReadings('{}'));
      const broken = JSON.parse(JSON.stringify({ kind: 'saju', result, topic: 'career', version: 1, id: 'broken', title: '손상', createdAt: new Date().toISOString() }));
      delete broken.result.pillars.day.jiji.hiddenStems;
      assert.throws(() => parseReadings(JSON.stringify([broken])));
      memory.set(LIBRARY_KEY, JSON.stringify([{ version: 2 }]));
      assert.throws(() => saveReading({ kind: 'tarot', session }));
      assert.equal(memory.get(LIBRARY_KEY), JSON.stringify([{ version: 2 }]));
      clearReadings();
    });
    check('저장 공간 실패를 호출자에게 전달', () => {
      const storage = window.localStorage;
      const original = storage.setItem;
      storage.setItem = () => { throw new Error('QuotaExceededError'); };
      try { assert.throws(() => saveReading({ kind: 'tarot', session }), /QuotaExceededError/); }
      finally { storage.setItem = original; }
    });
    check('선택 고민에 따라 조언이 바뀌고 행동 세 가지 제공', () => {
      const love = getSajuGuidance(result, 'love');
      const career = getSajuGuidance(result, 'career');
      assert.notDeepEqual(love.actions, career.actions);
      assert.equal(love.actions.length, 3);
      assert.ok(career.basis.includes(result.dayMaster.hangul));
    });
  } finally { Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow }); }
  for (const body of [{ ...base, month: 2, day: 30 }, { ...base, gender: 'invalid' }, { ...base, isLeapMonth: 'false' }, { ...base, year: '' }, { ...base, hour: true }, null]) {
    const response = await POST(new NextRequest('http://localhost/api/saju', { method: 'POST', body: JSON.stringify(body) }));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).success, false);
    checks++;
  }
  const badJson = await POST(new NextRequest('http://localhost/api/saju', { method: 'POST', body: '{' }));
  assert.equal(badJson.status, 400); checks++;
  const response = await POST(new NextRequest('http://localhost/api/saju', { method: 'POST', body: JSON.stringify(base) }));
  assert.equal(response.status, 200); checks++;
  console.log(`🎉 리딩·입력·API 회귀 검증 ${checks}개 통과`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
