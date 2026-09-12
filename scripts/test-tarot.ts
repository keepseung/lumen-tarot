import { MAJOR_ARCANA_CARDS, MAJOR_CARD_MAP } from '../lib/tarot/cards';
import { getRomanNumeral, getCardImageUrl } from '../lib/tarot/card-assets';
import {
  SPREAD_CONFIGS,
  createReadingSession,
  drawRandomCards,
  generateOverallSynthesis,
} from '../lib/tarot/spreads';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

console.log('🔮 ==============================================');
console.log('   LUMEN TAROT (루멘 타로) 엔진 무결성 테스트');
console.log('==============================================\n');

// 1. 22장 메이저 아르카나 무결성 검증
assert(
  MAJOR_ARCANA_CARDS.length === 22,
  '22장 메이저 아르카나 총 카드 수 검증 (0~21)'
);

const numbers = MAJOR_ARCANA_CARDS.map((c) => c.number).sort((a, b) => a - b);
const expectedNumbers = Array.from({ length: 22 }, (_, i) => i);
assert(
  JSON.stringify(numbers) === JSON.stringify(expectedNumbers),
  '카드 번호 0번부터 21번까지 누락 및 중복 없음'
);

// 2. 모든 카드의 필수 필드 존재 및 20대 여성 타깃 텍스트 검증
let allFieldsValid = true;
for (const card of MAJOR_ARCANA_CARDS) {
  if (
    !card.id ||
    !card.name ||
    !card.nameKo ||
    !card.summary ||
    !card.keywords ||
    card.keywords.length < 2 ||
    !card.upright?.general ||
    !card.upright?.love ||
    !card.upright?.career ||
    !card.upright?.advice ||
    !card.reversed?.general ||
    !card.reversed?.love ||
    !card.reversed?.career ||
    !card.reversed?.advice ||
    !card.symbol ||
    !card.gradient?.from ||
    !card.gradient?.to
  ) {
    allFieldsValid = false;
    console.error(`Missing field on card: ${card.id}`);
    break;
  }
}
assert(allFieldsValid, '22장 전 카드의 필수 필드 및 상세 해석(총평/연애/커리어/조언) 완전성 검증');

// 3. 로마 숫자 변환 헬퍼 검증
assert(getRomanNumeral(0) === '0', '로마 숫자 0 -> 0');
assert(getRomanNumeral(1) === 'I', '로마 숫자 1 -> I');
assert(getRomanNumeral(4) === 'IV', '로마 숫자 4 -> IV');
assert(getRomanNumeral(9) === 'IX', '로마 숫자 9 -> IX');
assert(getRomanNumeral(10) === 'X', '로마 숫자 10 -> X');
assert(getRomanNumeral(21) === 'XXI', '로마 숫자 21 -> XXI');

// 4. 단일 카드 드로우(1-Card) 검증
const singleDraw = drawRandomCards(1, false);
assert(singleDraw.length === 1, '1장 드로우 결과 개수 1개');
assert(singleDraw[0].card !== undefined, '1장 드로우된 카드 유효');
assert(singleDraw[0].isReversed === false, '역방향 비활성화 시 정방향 반환');

// 5. 3장 드로우(3-Card) 중복 배제 검증
let noDuplicatesIn100Runs = true;
for (let run = 0; run < 100; run++) {
  const threeDraw = drawRandomCards(3, true);
  const ids = threeDraw.map((c) => c.card.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== 3) {
    noDuplicatesIn100Runs = false;
    break;
  }
}
assert(noDuplicatesIn100Runs, '100회 연속 3장 드로우 테스트에서 단 한 번도 카드 중복 없음 (Zero Duplicates)');

// 6. 스프레드 설정 및 세션 생성 검증
const dailySession = createReadingSession('daily', {
  customQuestion: '오늘 하루의 운세',
});
assert(dailySession.drawnCards.length === 1, '데일리 세션 카드 1장 생성');
assert(dailySession.spread.id === 'daily', '데일리 스프레드 ID 일치');

const loveSession = createReadingSession('love', {
  customQuestion: '그 사람의 속마음',
  allowReversed: true,
});
assert(loveSession.drawnCards.length === 3, '연애운 세션 카드 3장 생성');
assert(
  loveSession.drawnCards[0].position.name === '그 사람의 현재 속마음',
  '1번 카드 포지션 명칭 일치'
);
assert(
  loveSession.drawnCards[1].position.name === '나의 마음 & 관계의 장애물',
  '2번 카드 포지션 명칭 일치'
);
assert(
  loveSession.drawnCards[2].position.name === '앞으로의 관계 흐름 & 미래',
  '3번 카드 포지션 명칭 일치'
);

// 7. 종합 해석 텍스트 생성 검증
const synthesisDaily = generateOverallSynthesis(dailySession);
assert(
  synthesisDaily.length > 20 && synthesisDaily.includes(dailySession.drawnCards[0].card.nameKo),
  '데일리 타로 종합 가이드 텍스트 자동 생성 검증'
);

const synthesisLove = generateOverallSynthesis(loveSession);
assert(
  synthesisLove.length > 50 &&
    synthesisLove.includes(loveSession.drawnCards[0].card.nameKo) &&
    synthesisLove.includes(loveSession.drawnCards[1].card.nameKo),
  '연애 3장 타로 종합 시너지 스토리텔링 텍스트 생성 검증'
);

// 8. 에셋 매퍼 함수 검증
const defaultAsset = getCardImageUrl('00_fool');
assert(defaultAsset === null, '기본 상태에서 null 반환하여 자체 3D 그래픽 렌더러로 폴백 확인');

console.log('\n==============================================');
console.log(`📊 테스트 결과: 총 ${totalTests}개 중 ${passedTests}개 통과 (성공률: ${(passedTests / totalTests) * 100}%)`);
console.log('==============================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
