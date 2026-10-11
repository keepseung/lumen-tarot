import KoreanLunarCalendar from 'korean-lunar-calendar';
import type { SajuCalculationInput } from './types';

export class SajuInputError extends Error {}

/** 화면, API, 계산 엔진에서 사용하는 공통 입력 검증. */
export function validateSajuInput(input: SajuCalculationInput): void {
  const { year, month, day, hour, minute = 0, calendarType = 'solar', isLeapMonth = false } = input;
  if (![year, month, day].every(Number.isInteger) || year < 1900 || year > 2050) {
    throw new SajuInputError('생년월일은 1900~2050년 사이의 정수로 입력해주세요.');
  }
  if (calendarType !== 'solar' && calendarType !== 'lunar') {
    throw new SajuInputError('양력 또는 음력을 선택해주세요.');
  }
  if (input.gender !== undefined && input.gender !== 'male' && input.gender !== 'female') {
    throw new SajuInputError('성별을 올바르게 선택해주세요.');
  }
  if (typeof isLeapMonth !== 'boolean' ||
      (input.useTrueSolarTime !== undefined && typeof input.useTrueSolarTime !== 'boolean')) {
    throw new SajuInputError('윤달과 시간 보정 설정을 올바르게 선택해주세요.');
  }
  if ((hour !== undefined && (!Number.isInteger(hour) || hour < 0 || hour > 23)) ||
      !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new SajuInputError('출생 시간은 0~23시, 분은 0~59분으로 입력해주세요.');
  }
  if (calendarType === 'solar' && isLeapMonth) {
    throw new SajuInputError('윤달은 음력 날짜에서만 선택할 수 있어요.');
  }
  const calendar = new KoreanLunarCalendar();
  const valid = calendarType === 'lunar'
    ? calendar.setLunarDate(year, month, day, isLeapMonth)
    : calendar.setSolarDate(year, month, day);
  if (!valid) {
    throw new SajuInputError('존재하지 않거나 지원하지 않는 날짜입니다. 생년월일과 윤달을 확인해주세요.');
  }
  const solar = calendar.getSolarCalendar();
  if (solar.year < 1900 || solar.year > 2050) {
    throw new SajuInputError('변환된 양력 날짜가 지원 범위(1900~2050년)를 벗어납니다.');
  }
}
