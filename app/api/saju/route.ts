import { NextRequest, NextResponse } from 'next/server';
import { calculateSajuComplete, SajuCalculationInput } from '@/lib/saju';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const year = Number(body.year);
    const month = Number(body.month);
    const day = Number(body.day);
    const hour = body.hour !== undefined && body.hour !== null ? Number(body.hour) : undefined;
    const minute = body.minute !== undefined && body.minute !== null ? Number(body.minute) : 0;
    const calendarType = body.calendarType === 'lunar' ? 'lunar' : 'solar';
    const isLeapMonth = Boolean(body.isLeapMonth);
    const gender = body.gender === 'male' ? 'male' : 'female';
    const useTrueSolarTime = body.useTrueSolarTime !== false;

    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
      return NextResponse.json(
        { success: false, error: '생년월일(년, 월, 일)을 올바르게 입력해주세요.' },
        { status: 400 }
      );
    }

    if (year < 1900 || year > 2050) {
      return NextResponse.json(
        { success: false, error: '1900년부터 2050년 사이의 날짜만 지원합니다.' },
        { status: 400 }
      );
    }

    const input: SajuCalculationInput = {
      year,
      month,
      day,
      hour,
      minute,
      calendarType,
      isLeapMonth,
      gender,
      useTrueSolarTime,
    };

    const sajuResult = calculateSajuComplete(input);

    return NextResponse.json({
      success: true,
      data: sajuResult,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '사주 만세력 계산 중 오류가 발생했습니다.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
