import { NextRequest, NextResponse } from 'next/server';
import { calculateSajuComplete, SajuInputError, type SajuCalculationInput } from '@/lib/saju';

function numberField(value: unknown, name: string): number {
  if ((typeof value !== 'number' && typeof value !== 'string') ||
      (typeof value === 'string' && value.trim() === '') || !Number.isFinite(Number(value))) {
    throw new SajuInputError(`${name}을 숫자로 입력해주세요.`);
  }
  return Number(value);
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new SajuInputError('올바른 JSON 형식으로 입력해주세요.');
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new SajuInputError('출생 정보를 올바르게 입력해주세요.');
    }
    if (body.calendarType !== undefined && body.calendarType !== 'lunar' && body.calendarType !== 'solar') {
      throw new SajuInputError('양력 또는 음력을 선택해주세요.');
    }
    if (body.gender !== undefined && body.gender !== 'male' && body.gender !== 'female') {
      throw new SajuInputError('성별을 올바르게 선택해주세요.');
    }
    const input: SajuCalculationInput = {
      year: numberField(body.year, '년'),
      month: numberField(body.month, '월'),
      day: numberField(body.day, '일'),
      hour: body.hour === undefined || body.hour === null ? undefined : numberField(body.hour, '시'),
      minute: body.minute === undefined ? 0 : numberField(body.minute, '분'),
      calendarType: body.calendarType ?? 'solar',
      isLeapMonth: body.isLeapMonth ?? false,
      gender: body.gender ?? 'female',
      useTrueSolarTime: body.useTrueSolarTime ?? true,
    };
    return NextResponse.json({ success: true, data: calculateSajuComplete(input) });
  } catch (err: unknown) {
    if (err instanceof SajuInputError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    console.error('사주 계산 실패:', err);
    return NextResponse.json(
      { success: false, error: '사주 계산 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
