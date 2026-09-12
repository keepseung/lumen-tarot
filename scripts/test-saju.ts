import {
  calculateSajuComplete,
  crossValidateAndVerify,
  calculateCompatibility,
  isBeforeLichunExact,
  getLichunExact,
} from '../lib/saju';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('🔮 === LUMEN SAJU 정통 만세력 & 연도 이월 버그 종합 테스트 ===\n');

// 1. 2024년 2월 4일 입춘 당일 시간 경계 테스트
// 2024년 입춘 시각은 KST 약 17:21~17:27
const lichun2024 = getLichunExact(2024);
console.log(`[기준] 2024년 입춘 KST 계산 시각: ${lichun2024.formattedKst}`);

const t1Pre = crossValidateAndVerify({
  year: 2024,
  month: 2,
  day: 4,
  hour: 3,
  minute: 0,
  calendarType: 'solar',
});
assert(
  t1Pre.yearPillar === '계묘' && t1Pre.monthPillar === '을축',
  '2024-02-04 03:00 (입춘 전) -> 계묘년 을축월 정상 판정'
);

const t1Post = crossValidateAndVerify({
  year: 2024,
  month: 2,
  day: 4,
  hour: 18,
  minute: 0,
  calendarType: 'solar',
});
assert(
  t1Post.yearPillar === '갑진' && t1Post.monthPillar === '병인',
  '2024-02-04 18:00 (입춘 후) -> 갑진년 병인월 정상 판정'
);

// 2. 입춘 후 설날 전 (korean-lunar-calendar의 지연 버그 교차 보정 검증)
const t2 = crossValidateAndVerify({
  year: 2024,
  month: 2,
  day: 5,
  hour: 12,
  minute: 0,
  calendarType: 'solar',
});
assert(
  t2.yearPillar === '갑진' && t2.monthPillar === '병인',
  '2024-02-05 (입춘 후, 설날 전) -> 갑진년 병인월 교차 보정 완료'
);
assert(
  t2.report.status === 'year_rollover_corrected',
  '2024-02-05 검증 상태가 year_rollover_corrected 인지 확인'
);

// 3. 설날 후 입춘 전 (korean-lunar-calendar의 조기 전환 버그 교차 보정 검증)
// 2023년 설날은 1월 22일, 입춘은 2월 4일
const t3 = crossValidateAndVerify({
  year: 2023,
  month: 1,
  day: 25,
  hour: 12,
  minute: 0,
  calendarType: 'solar',
});
assert(
  t3.yearPillar === '임인' && t3.monthPillar === '계축',
  '2023-01-25 (설날 후, 입춘 전) -> 임인년 계축월 교차 보정 완료'
);

// 4. 음력 섣달(12월) 연도 이월 테스트
const t4 = crossValidateAndVerify({
  year: 2023,
  month: 12,
  day: 26,
  hour: 12,
  minute: 0,
  calendarType: 'lunar',
});
assert(
  t4.solarDate.year === 2024 && t4.solarDate.month === 2 && t4.solarDate.day === 5,
  '음력 2023-12-26 -> 양력 2024-02-05 변환 정합성'
);
assert(
  t4.yearPillar === '갑진' && t4.monthPillar === '병인',
  '음력 2023-12-26 -> 입춘 후이므로 갑진년 병인월 확정'
);

// 5. 윤달(Leap Month) 테스트
const t5Leap = crossValidateAndVerify({
  year: 2023,
  month: 2,
  day: 1,
  hour: 12,
  minute: 0,
  calendarType: 'lunar',
  isLeapMonth: true,
});
assert(
  t5Leap.solarDate.year === 2023 && t5Leap.solarDate.month === 3 && t5Leap.solarDate.day === 22,
  '2023년 윤2월 1일 -> 양력 2023-03-22 변환 정합성'
);

// 6. 4주 8자, 십성, 오행 비율 계산 테스트
const sajuTest = calculateSajuComplete({
  year: 1998,
  month: 5,
  day: 20,
  hour: 14,
  minute: 30,
  gender: 'female',
});
assert(sajuTest.dayMaster.hangul === '정', '1998-05-20 일간이 정화(丁火)인지 확인');
assert(
  sajuTest.elements.percentages.wood +
    sajuTest.elements.percentages.fire +
    sajuTest.elements.percentages.earth +
    sajuTest.elements.percentages.metal +
    sajuTest.elements.percentages.water >=
    98,
  '오행 비율 합계가 100% 근사치인지 확인'
);

// 7. 신살 및 대운 테스트
assert((sajuTest.sinsal?.length || 0) > 0, '신살 분석 결과가 1개 이상 도출되는지 확인');
assert(
  Boolean(sajuTest.daewoon && sajuTest.daewoon.daewoonNumber >= 1 && sajuTest.daewoon.daewoonNumber <= 10),
  '대운수가 1~10 범위인지 확인'
);

// 8. 궁합(Compatibility) 테스트
const partner = calculateSajuComplete({
  year: 1995,
  month: 10,
  day: 12,
  hour: 9,
  minute: 0,
  gender: 'male',
});
const compat = calculateCompatibility(sajuTest, partner);
assert(compat.totalScore >= 50 && compat.totalScore <= 100, '궁합 점수가 50~100점 사이로 산출되는지 확인');
assert(compat.relationshipTips.length > 0, '궁합 팁이 정상 제공되는지 확인');

console.log(`\n🎉 테스트 완료: 총 ${passed + failed}개 중 ${passed}개 통과, ${failed}개 실패.`);
if (failed > 0) {
  process.exit(1);
}
