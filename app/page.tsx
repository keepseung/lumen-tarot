'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  calculateSajuComplete,
  calculateCompatibility,
  downloadInstagramStoryImage,
  CalendarType,
  Gender,
  SajuResult,
  CompatibilityScore,
  LIFESTYLE_RECOMMENDATIONS,
  ELEMENT_PROPERTIES,
  FiveElementKorean,
} from '@/lib/saju';
import { TarotExperience } from '@/components/tarot/TarotExperience';

export default function HomePage() {
  // Main navigation tab: 'tarot' | 'saju' | 'compatibility'
  const [activeTab, setActiveTab] = useState<'tarot' | 'saju' | 'compatibility'>('tarot');

  // Input form state (Person A / Me)
  const [calendarType, setCalendarType] = useState<CalendarType>('solar');
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false);
  const [gender, setGender] = useState<Gender>('female');

  const [year, setYear] = useState<number>(1998);
  const [month, setMonth] = useState<number>(5);
  const [day, setDay] = useState<number>(20);

  const [isHourUnknown, setIsHourUnknown] = useState<boolean>(false);
  const [hour, setHour] = useState<number>(14);
  const [minute, setMinute] = useState<number>(30);

  const [useTrueSolarTime, setUseTrueSolarTime] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showValidationDetail, setShowValidationDetail] = useState<boolean>(false);
  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Card Flip State for 4 pillars (stores flipped status per pillar)
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (pillarKey: string) => {
    setFlippedCards((prev) => ({ ...prev, [pillarKey]: !prev[pillarKey] }));
  };

  // Result state for Person A
  const [result, setResult] = useState<SajuResult | null>(null);

  // Partner input state for Compatibility Tab
  const [partnerYear, setPartnerYear] = useState<number>(1995);
  const [partnerMonth, setPartnerMonth] = useState<number>(10);
  const [partnerDay, setPartnerDay] = useState<number>(12);
  const [partnerHour, setPartnerHour] = useState<number>(9);
  const [partnerGender, setPartnerGender] = useState<Gender>('male');
  const [partnerIsHourUnknown, setPartnerIsHourUnknown] = useState<boolean>(false);

  // Compatibility Result
  const [compatResult, setCompatResult] = useState<CompatibilityScore | null>(null);

  // Initial calculation on mount
  useEffect(() => {
    runCalculation();
  }, []);

  const runCalculation = () => {
    try {
      const res = calculateSajuComplete({
        year,
        month,
        day,
        hour: isHourUnknown ? undefined : hour,
        minute: isHourUnknown ? undefined : minute,
        calendarType,
        isLeapMonth,
        gender,
        useTrueSolarTime,
      });
      setResult(res);

      // Auto update compatibility if partner exists
      if (res) {
        const partnerRes = calculateSajuComplete({
          year: partnerYear,
          month: partnerMonth,
          day: partnerDay,
          hour: partnerIsHourUnknown ? undefined : partnerHour,
          minute: 0,
          gender: partnerGender,
          calendarType: 'solar',
        });
        setCompatResult(calculateCompatibility(res, partnerRes));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePartnerCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    try {
      const partnerRes = calculateSajuComplete({
        year: partnerYear,
        month: partnerMonth,
        day: partnerDay,
        hour: partnerIsHourUnknown ? undefined : partnerHour,
        minute: 0,
        gender: partnerGender,
        calendarType: 'solar',
      });
      setCompatResult(calculateCompatibility(result, partnerRes));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const text = `🌸 [LUMEN SAJU] 나의 감성 사주 리포트
✨ 사주: ${result.summary.sajuText} (${result.summary.sajuHanjaText})
🌿 일간: ${result.dayMaster.hangul}(${result.dayMaster.hanja}) - ${result.summary.dayMasterDescription}
💫 오행: ${result.summary.dominantElementText}
🔮 럭키 컬러: ${
      result.elements.lackingElements[0]
        ? LIFESTYLE_RECOMMENDATIONS[result.elements.lackingElements[0]].luckyColorName
        : '은은한 파스텔 톤'
    }
🌟 신살: ${result.sinsal?.map((s) => s.name).join(', ') || '없음'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadStory = () => {
    if (!result) return;
    downloadInstagramStoryImage(result);
  };

  const isTarot = activeTab === 'tarot';

  return (
    <div
      className={`min-h-screen pb-24 transition-colors duration-500 ${
        isTarot ? 'bg-[#0A071A] text-white' : 'text-stone-800'
      }`}
    >
      {/* Top Floating Glow Lights (Shown in Saju / Compatibility mode) */}
      {!isTarot && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="fixed top-20 right-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="fixed bottom-10 left-1/3 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        </>
      )}

      {/* Header */}
      <header className="pt-8 pb-4 px-4 text-center max-w-4xl mx-auto">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide mb-3 shadow-xs transition-colors ${
            isTarot
              ? 'bg-violet-950/80 border border-violet-500/30 text-amber-300'
              : 'bg-rose-50 border border-rose-200/60 text-rose-600'
          }`}
        >
          <span>✨</span>
          <span>
            {isTarot
              ? 'ReactBits 3D 인터랙션 & 22장 메이저 아르카나 덱'
              : '한국 정통 만세력 교차 검증 & 입춘 절기 연도보정 시스템'}
          </span>
        </div>
        <h1
          className={`text-3xl md:text-5xl font-serif font-medium tracking-tight mb-2 ${
            isTarot ? 'text-white' : 'text-stone-900'
          }`}
        >
          {isTarot ? 'LUMEN TAROT' : 'LUMEN SAJU'}
        </h1>
        <p
          className={`text-sm md:text-base max-w-lg mx-auto font-light ${
            isTarot ? 'text-indigo-200/80' : 'text-stone-500'
          }`}
        >
          {isTarot
            ? '나를 비추는 마음의 나침반. 3D 인터랙티브 카드 셔플과 20대 감성 힐링 타로 리딩을 경험해보세요.'
            : '나를 비추는 빛의 명리학. 어렵고 낡은 사주 대신, 나의 고유한 우주와 오행 퍼스널 컬러를 발견해보세요.'}
        </p>

        {/* 3-Tab Navigation (Tarot vs Saju vs Compatibility) */}
        <div
          className={`w-full max-w-md mx-auto grid grid-cols-3 p-1.5 rounded-2xl mt-6 backdrop-blur-md transition-all ${
            isTarot
              ? 'bg-white/5 border border-white/10'
              : 'bg-stone-200/50'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('tarot')}
            className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'tarot'
                ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-violet-600 text-white shadow-lg shadow-pink-500/25'
                : isTarot
                ? 'text-slate-300 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>✨</span>
            <span className="truncate">감성 타로</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saju')}
            className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'saju'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                : isTarot
                ? 'text-slate-300 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🌸</span>
            <span className="truncate">정통 사주</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compatibility')}
            className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'compatibility'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                : isTarot
                ? 'text-slate-300 hover:text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>💘</span>
            <span className="truncate">소울 궁합</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 space-y-8 mt-2">
        {/* ======================= TAB 0: TAROT ======================= */}
        {activeTab === 'tarot' && <TarotExperience />}

        {/* ======================= TAB 1: SAJU ======================= */}
        {activeTab === 'saju' && (
          <div className="space-y-8">
            {/* Input Card */}
            <div className="glass-card rounded-3xl p-6 md:p-8 shadow-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runCalculation();
                }}
                className="space-y-6"
              >
                {/* 1. Calendar Type & Gender Segment */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/60">
                  <div className="flex items-center gap-2">
                    {/* Solar / Lunar Toggle */}
                    <div className="flex-1 sm:flex-initial flex items-center bg-stone-100/90 p-1 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => {
                          setCalendarType('solar');
                          setIsLeapMonth(false);
                        }}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer ${
                          calendarType === 'solar'
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        양력 (Solar)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarType('lunar')}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer ${
                          calendarType === 'lunar'
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        음력 (Lunar)
                      </button>
                    </div>

                    {/* Leap Month toggle if Lunar */}
                    {calendarType === 'lunar' && (
                      <div className="flex items-center gap-2 bg-rose-50/70 px-3 py-2 rounded-xl border border-rose-200/50">
                        <span className="text-xs text-stone-600">윤달</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isLeapMonth}
                          onClick={() => setIsLeapMonth(!isLeapMonth)}
                          className="toggle-switch"
                          data-checked={isLeapMonth}
                        />
                      </div>
                    )}
                  </div>

                  {/* Gender Toggle */}
                  <div className="flex items-center bg-stone-100/90 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer ${
                        gender === 'female'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      여성 (♀)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all cursor-pointer ${
                        gender === 'male'
                          ? 'bg-stone-800 text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      남성 (♂)
                    </button>
                  </div>
                </div>

                {/* 2. Birth Date Grid */}
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    생년월일 (Birth Date)
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div>
                      <div className="relative">
                        <input
                          type="number"
                          min={1900}
                          max={2050}
                          value={year}
                          onChange={(e) => setYear(Number(e.target.value))}
                          className="w-full pr-7 pl-2 py-2.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-stone-800 text-center text-sm md:text-base font-medium min-h-[44px] focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition"
                        />
                        <span className="absolute right-2.5 top-3 text-xs text-stone-400 pointer-events-none">년</span>
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={month}
                          onChange={(e) => setMonth(Number(e.target.value))}
                          className="w-full pr-7 pl-2 py-2.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-stone-800 text-center text-sm md:text-base font-medium min-h-[44px] focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition"
                        />
                        <span className="absolute right-2.5 top-3 text-xs text-stone-400 pointer-events-none">월</span>
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={day}
                          onChange={(e) => setDay(Number(e.target.value))}
                          className="w-full pr-7 pl-2 py-2.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-stone-800 text-center text-sm md:text-base font-medium min-h-[44px] focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition"
                        />
                        <span className="absolute right-2.5 top-3 text-xs text-stone-400 pointer-events-none">일</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Birth Time Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      태어난 시간 (Birth Time)
                    </label>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsHourUnknown(!isHourUnknown)}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isHourUnknown}
                        className="toggle-switch"
                        data-checked={isHourUnknown}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-xs text-stone-500 hover:text-stone-700 select-none">태어난 시간을 몰라요 (3주 모드)</span>
                    </div>
                  </div>

                  {!isHourUnknown ? (
                    <div className="grid grid-cols-2 gap-2 md:gap-4">
                      <div className="relative">
                        <select
                          value={hour}
                          onChange={(e) => setHour(Number(e.target.value))}
                          className="premium-select w-full px-3.5 py-2.5 bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl text-stone-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-rose-300/50 focus:border-rose-300 focus:bg-white transition-all appearance-none text-center cursor-pointer shadow-sm hover:shadow-md hover:border-stone-300 min-h-[44px]"
                        >
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i}>
                              {i < 12 ? `오전 ${i}시` : i === 12 ? '오후 12시' : `오후 ${i - 12}시`} ({String(i).padStart(2, '0')}시)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="relative">
                        <select
                          value={minute}
                          onChange={(e) => setMinute(Number(e.target.value))}
                          className="premium-select w-full px-3.5 py-2.5 bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl text-stone-800 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-rose-300/50 focus:border-rose-300 focus:bg-white transition-all appearance-none text-center cursor-pointer shadow-sm hover:shadow-md hover:border-stone-300 min-h-[44px]"
                        >
                          {[0, 10, 20, 30, 40, 50].map((m) => (
                            <option key={m} value={m}>
                              {String(m).padStart(2, '0')}분
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-50/80 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-500">
                      시간을 모를 경우, 생년월일(년주·월주·일주 3기둥)을 기준으로 정확하게 계산됩니다.
                    </div>
                  )}
                </div>

                {/* 4. Advanced Settings (True Solar Time Toggle) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium transition cursor-pointer"
                  >
                    <span>{showAdvanced ? '▴ 고급 설정 닫기' : '▾ 정밀 만세력 전문 설정 (진태양시 보정)'}</span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 p-4 bg-stone-50/90 rounded-2xl border border-stone-200/80 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-stone-700">진태양시 -30분 자동 보정</div>
                          <div className="text-stone-500 text-[11px] mt-0.5">
                            한국 표준시(동경 135도)와 서울 실제 경도(127.5도) 사이의 약 30분 시차를 보정합니다.
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={useTrueSolarTime}
                          onClick={() => setUseTrueSolarTime(!useTrueSolarTime)}
                          className="toggle-switch"
                          data-checked={useTrueSolarTime}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 text-white font-medium text-base shadow-md shadow-rose-200 hover:shadow-lg hover:shadow-rose-300 hover:scale-[1.005] active:scale-[0.995] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>✨</span>
                  <span>나의 감성 사주 & 오행 컬러 확인하기</span>
                </button>
              </form>
            </div>

            {/* Results Section */}
            {result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 1. Day Master Persona Card */}
                <div className="glass-card rounded-3xl p-6 md:p-8 text-center relative overflow-hidden border-rose-100 shadow-sm">
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-200/30 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 text-rose-600 text-xs font-medium mb-3">
                    <span>🌸</span>
                    <span>나를 상징하는 일간(日干) 페르소나</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-serif font-medium text-stone-900 mb-2">
                    {result.summary.dayMasterDescription}
                  </h2>

                  <p className="text-sm text-stone-600 max-w-lg mx-auto font-light leading-relaxed mb-4">
                    {result.dayMaster.hangul === '갑' && '어떤 비바람에도 꺾이지 않고 하늘을 향해 곧게 뻗어나가는 싱그러운 추진력과 리더십을 가졌어요.'}
                    {result.dayMaster.hangul === '을' && '바위틈에서도 기어이 아름다운 꽃을 피워내는 부드러운 생명력과 누구와도 어우러지는 다정함을 품었어요.'}
                    {result.dayMaster.hangul === '병' && '주변을 환하게 밝히는 긍정적인 오라와 가식 없이 투명하게 빛나는 사랑스러운 열정을 지니고 있어요.'}
                    {result.dayMaster.hangul === '정' && '은은하고 다정한 온기로 사람들의 마음을 보듬고, 예술적 직관과 섬세한 통찰력이 돋보여요.'}
                    {result.dayMaster.hangul === '무' && '모든 생명의 기쁨과 슬픔을 묵묵히 안아주는 듬직한 안식처 같은 포용력을 지녔어요.'}
                    {result.dayMaster.hangul === '기' && '꽃과 풀을 기르는 정원처럼 세심하고 다정한 손길로 주위를 돌보며 실속과 배려를 겸비했어요.'}
                    {result.dayMaster.hangul === '경' && '맺고 끊음이 확실한 쿨한 매력과 약속을 소중히 지키는 의리 넘치는 멋진 성품을 지녔어요.'}
                    {result.dayMaster.hangul === '신' && '자신만의 독보적인 감각과 세련미를 지녔으며, 어디서나 영롱하게 반짝이는 빛나는 존재예요.'}
                    {result.dayMaster.hangul === '임' && '어떤 틀에도 얽매이지 않고 자유롭게 흐르는 깊은 바다처럼 지혜롭고 큰 그릇을 품었어요.'}
                    {result.dayMaster.hangul === '계' && '만물을 촉촉이 적시는 아침 이슬처럼 맑고 순수하며, 영민한 직관으로 세상을 꿰뚫어 봐요.'}
                  </p>

                  {/* Converted Calendar Date Pill */}
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-500 pt-2">
                    <span className="bg-stone-100/90 px-3 py-1 rounded-full">
                      양력: {result.solarDate.year}년 {result.solarDate.month}월 {result.solarDate.day}일
                    </span>
                    <span className="bg-stone-100/90 px-3 py-1 rounded-full">
                      음력: {result.lunarDate.year}년 {result.lunarDate.month}월 {result.lunarDate.day}일
                      {result.lunarDate.isLeapMonth ? ' (윤달)' : ''}
                    </span>
                    {result.correctedTime && (
                      <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200/50">
                        진태양시 보정: {result.correctedTime.hour}시 {result.correctedTime.minute}분
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Double Exception Verification Banner */}
                <div className="glass-card rounded-2xl p-4 md:p-5 border-emerald-200/70 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/60 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow-xs">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-emerald-950 text-sm">
                            {result.validation.status === 'exact_match'
                              ? '정통 만세력 교차 검증 통과 (100% 일치)'
                              : '연초/연말 절기(입춘 시각) 연도 이월 보정 완료'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            KASI 천문역 기준
                          </span>
                        </div>
                        <div className="text-xs text-emerald-800/80 mt-0.5 font-light">
                          {result.validation.corrections.reason}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowValidationDetail(!showValidationDetail)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-medium underline underline-offset-2 shrink-0 cursor-pointer"
                    >
                      {showValidationDetail ? '검증 세부 내역 닫기' : '교차 검증 상세 보기'}
                    </button>
                  </div>

                  {/* Collapsible Cross Validation Report */}
                  {showValidationDetail && (
                    <div className="mt-4 pt-4 border-t border-emerald-200/60 text-xs text-stone-700 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-white/80 rounded-xl border border-emerald-100">
                          <div className="font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            korean-lunar-calendar 패키지 결과
                          </div>
                          <div className="text-stone-600 text-[11px] space-y-0.5">
                            <div>• 간지: {result.validation.koreanLunarCalendar.yearPillar}년 {result.validation.koreanLunarCalendar.monthPillar}월 {result.validation.koreanLunarCalendar.dayPillar}일</div>
                            <div>• 음력: {result.validation.koreanLunarCalendar.lunarDate.year}년 {result.validation.koreanLunarCalendar.lunarDate.month}월 {result.validation.koreanLunarCalendar.lunarDate.day}일</div>
                          </div>
                        </div>

                        <div className="p-3 bg-white/80 rounded-xl border border-emerald-100">
                          <div className="font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            @fullstackfamily/manseryeok 패키지 결과
                          </div>
                          <div className="text-stone-600 text-[11px] space-y-0.5">
                            <div>• 간지: {result.validation.manseryeok.yearPillar}년 {result.validation.manseryeok.monthPillar}월 {result.validation.manseryeok.dayPillar}일</div>
                            <div>• 절기 입춘 시각: {result.validation.lichunInfo.solarTermDateTime}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-white/90 rounded-xl border border-emerald-100 text-[11px] text-stone-600 leading-relaxed">
                        <span className="font-semibold text-stone-800">💡 이중 보정 작동 원리: </span>
                        {result.validation.corrections.detail}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Four Pillars 8 Characters Oracle Cards with Flip Animation */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-serif font-medium text-stone-900">
                        사주 4기둥 8글자 (Four Pillars)
                      </h3>
                      <p className="text-xs text-stone-500 font-light">
                        카드를 클릭하면 뒷면의 지장간(支藏干) 상세 비율을 확인할 수 있어요 🔄
                      </p>
                    </div>
                    <div className="text-xs text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full font-medium border border-rose-100">
                      ✨ 일간(본원) 골드 테두리
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {/* Year Pillar */}
                    <FlippablePillarCard
                      pillarKey="year"
                      pillar={result.pillars.year}
                      title="년주 (年柱)"
                      subtitle="가문·뿌리"
                      isDayMaster={false}
                      isFlipped={!!flippedCards['year']}
                      onFlip={() => toggleFlip('year')}
                    />

                    {/* Month Pillar */}
                    <FlippablePillarCard
                      pillarKey="month"
                      pillar={result.pillars.month}
                      title="월주 (月柱)"
                      subtitle="사회·계절·성향"
                      isDayMaster={false}
                      isFlipped={!!flippedCards['month']}
                      onFlip={() => toggleFlip('month')}
                    />

                    {/* Day Pillar (Day Master) */}
                    <FlippablePillarCard
                      pillarKey="day"
                      pillar={result.pillars.day}
                      title="일주 (日柱)"
                      subtitle="나 자신 (본원)"
                      isDayMaster={true}
                      isFlipped={!!flippedCards['day']}
                      onFlip={() => toggleFlip('day')}
                    />

                    {/* Hour Pillar */}
                    {result.pillars.hour ? (
                      <FlippablePillarCard
                        pillarKey="hour"
                        pillar={result.pillars.hour}
                        title="시주 (時柱)"
                        subtitle="내면·미래·자녀"
                        isDayMaster={false}
                        isFlipped={!!flippedCards['hour']}
                        onFlip={() => toggleFlip('hour')}
                      />
                    ) : (
                      <div className="glass-card rounded-3xl p-5 text-center flex flex-col items-center justify-center border-dashed border-stone-200">
                        <div className="text-stone-300 text-3xl mb-2">⏱</div>
                        <div className="font-medium text-sm text-stone-500">시주 (時柱)</div>
                        <div className="text-xs text-stone-400 mt-1 font-light">출생 시간 미입력</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Five Elements Balance Section */}
                <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg md:text-xl font-serif font-medium text-stone-900">
                        오행(五行) 에너지 밸런스 & 비율
                      </h3>
                      <p className="text-xs text-stone-500 font-light">
                        사주 8자의 기운 분포와 계절(월지) 가중치를 반영한 실제 세력 점수
                      </p>
                    </div>
                    <div className="text-xs px-3 py-1 bg-stone-100 rounded-full text-stone-600 font-medium">
                      {result.elements.scoreAnalysis}
                    </div>
                  </div>

                  {/* Progress Gauges for 5 Elements */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <ElementMeter
                      korean="목"
                      hanja="木"
                      count={result.elements.counts.wood}
                      percentage={result.elements.weightedPercentages.wood}
                      color={ELEMENT_PROPERTIES.wood.color}
                      bgClass="bg-emerald-50 border-emerald-200/60"
                      fillClass="bg-emerald-400"
                      textClass="text-emerald-700"
                    />
                    <ElementMeter
                      korean="화"
                      hanja="火"
                      count={result.elements.counts.fire}
                      percentage={result.elements.weightedPercentages.fire}
                      color={ELEMENT_PROPERTIES.fire.color}
                      bgClass="bg-rose-50 border-rose-200/60"
                      fillClass="bg-rose-400"
                      textClass="text-rose-700"
                    />
                    <ElementMeter
                      korean="토"
                      hanja="土"
                      count={result.elements.counts.earth}
                      percentage={result.elements.weightedPercentages.earth}
                      color={ELEMENT_PROPERTIES.earth.color}
                      bgClass="bg-amber-50 border-amber-200/60"
                      fillClass="bg-amber-400"
                      textClass="text-amber-700"
                    />
                    <ElementMeter
                      korean="금"
                      hanja="金"
                      count={result.elements.counts.metal}
                      percentage={result.elements.weightedPercentages.metal}
                      color={ELEMENT_PROPERTIES.metal.color}
                      bgClass="bg-slate-100 border-slate-200/80"
                      fillClass="bg-slate-400"
                      textClass="text-slate-700"
                    />
                    <ElementMeter
                      korean="수"
                      hanja="水"
                      count={result.elements.counts.water}
                      percentage={result.elements.weightedPercentages.water}
                      color={ELEMENT_PROPERTIES.water.color}
                      bgClass="bg-sky-50 border-sky-200/60"
                      fillClass="bg-sky-400"
                      textClass="text-sky-700"
                    />
                  </div>
                </div>

                {/* 5. 20s Female Target Lifestyle & Lucky Tips */}
                <div className="glass-card-gold rounded-3xl p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🍀</span>
                    <h3 className="text-lg md:text-xl font-serif font-medium text-stone-900">
                      나를 위한 오행 퍼스널 라이프스타일 & 뷰티 팁
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {result.elements.lackingElements.length > 0 ? (
                      result.elements.lackingElements.map((el) => {
                        const tip = LIFESTYLE_RECOMMENDATIONS[el as FiveElementKorean];
                        if (!tip) return null;
                        return (
                          <div key={el} className="p-4 bg-white/85 rounded-2xl border border-amber-200/60 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
                                보완할 {tip.element} 기운 채우기
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block"
                                  style={{ backgroundColor: tip.luckyColor }}
                                />
                                <span>{tip.luckyColorName}</span>
                              </div>
                            </div>

                            <div className="text-xs text-stone-700 space-y-1">
                              <div>
                                <span className="font-semibold text-stone-800">🛍 행운의 소품: </span>
                                {tip.luckyItem}
                              </div>
                              <div>
                                <span className="font-semibold text-stone-800">🧘 추천 힐링: </span>
                                {tip.luckyActivity}
                              </div>
                              <div>
                                <span className="font-semibold text-stone-800">👗 스타일링 팁: </span>
                                {tip.fashionAdvice}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 p-5 bg-white/80 rounded-2xl text-center text-xs text-stone-600">
                        오행의 흐름이 고르게 조화를 이루고 있어, 어떤 컬러나 아이템도 조화롭게 소화할 수 있는 균형 잡힌 기운입니다.
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Sinsal (신살) Analysis Section */}
                {result.sinsal && result.sinsal.length > 0 && (
                  <div className="glass-card rounded-3xl p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg md:text-xl font-serif font-medium text-stone-900 flex items-center gap-2">
                          <span>✨</span>
                          <span>나만의 매력과 재능: 핵심 신살(神煞) 분석</span>
                        </h3>
                        <p className="text-xs text-stone-500 font-light">
                          도화살·홍염살·화개살 등 나를 특별하게 만들어주는 고유한 아우라
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {result.sinsal.map((s, i) => (
                        <div key={i} className="p-4 bg-white/80 rounded-2xl border border-stone-200/60 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-stone-900 text-sm">{s.name}</span>
                              <span className="text-xs text-stone-400 font-serif">({s.hanja})</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                              {s.pillarName} {s.branch}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-rose-500">{s.title}</div>
                          <p className="text-xs text-stone-600 font-light leading-relaxed">{s.description}</p>
                          <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                            💡 {s.advice}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Daewoon (대운) 10-Year Major Luck Timeline */}
                {result.daewoon && (
                  <div className="glass-card rounded-3xl p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg md:text-xl font-serif font-medium text-stone-900 flex items-center gap-2">
                          <span>🌊</span>
                          <span>인생의 큰 흐름: 10년 주기 대운(大運) 타임라인</span>
                        </h3>
                        <p className="text-xs text-stone-500 font-light">
                          대운수 {result.daewoon.daewoonNumber} (만 {result.daewoon.daewoonNumber}세, {result.daewoon.daewoonNumber + 10}세, {result.daewoon.daewoonNumber + 20}세마다 큰 환경이 전환됩니다)
                        </p>
                      </div>
                    </div>

                    {/* Timeline steps */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      {result.daewoon.steps.map((step: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            step.isCurrent
                              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-300 shadow-sm'
                              : 'bg-white/70 border-stone-200/60'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <span className="text-[10px] text-stone-400 font-light">
                              {step.startAge}세 ~ {step.endAge}세
                            </span>
                            {step.isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-medium">
                                현재
                              </span>
                            )}
                          </div>
                          <div className="text-xl font-serif font-semibold text-stone-900">{step.pillarHanja}</div>
                          <div className="text-xs text-stone-500 mt-0.5">{step.pillar} 대운</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs text-rose-800 leading-relaxed">
                      💬 <span className="font-semibold">대운 가이드: </span>
                      {result.daewoon.yearlyAdvice}
                    </div>
                  </div>
                )}

                {/* 8. Action Bar: Copy & Instagram Share */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-800 font-medium text-sm hover:bg-stone-50 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{copied ? '✅ 복사 완료!' : '📋 결과 텍스트 복사하기'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadStory}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-medium text-sm hover:opacity-95 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📥</span>
                    <span>인스타 스토리 카드 이미지 저장 (PNG)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowStoryModal(true)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📸</span>
                    <span>스토리 카드 미리보기</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 2: COMPATIBILITY ======================= */}
        {activeTab === 'compatibility' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Compatibility Header Info */}
            <div className="glass-card rounded-3xl p-6 md:p-8 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-medium border border-rose-200">
                <span>💘</span>
                <span>두 사람의 천간합·지지육합·오행 시너지</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-stone-900">
                연인 & 친구 소울메이트 궁합 리포트
              </h2>
              <p className="text-xs md:text-sm text-stone-500 max-w-md mx-auto font-light">
                나와 상대방의 사주 기운을 대조하여 정신적 교감, 생활 케미, 그리고 서로의 결핍을 채워주는 보완도를 정밀 분석합니다.
              </p>
            </div>

            {/* Two Column Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Person A Card */}
              <div className="glass-card rounded-3xl p-6 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="font-semibold text-stone-800 text-sm">👤 나 (Person A)</span>
                  <span className="text-xs text-rose-500 font-medium">
                    {result ? `${result.dayMaster.hangul}(${result.dayMaster.hanja}) 일간` : '사주 탭에서 설정'}
                  </span>
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  <div>• 생년월일: {year}년 {month}월 {day}일 ({gender === 'female' ? '여성' : '남성'})</div>
                  <div>• 사주: {result ? result.summary.sajuText : '분석 중'}</div>
                </div>
              </div>

              {/* Person B (Partner) Input Card */}
              <div className="glass-card rounded-3xl p-6 space-y-4 border-rose-200">
                <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                  <span className="font-semibold text-stone-800 text-sm">💖 상대방 (Partner / Friend)</span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPartnerGender('male')}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                        partnerGender === 'male' ? 'bg-stone-800 text-white' : 'text-stone-400'
                      }`}
                    >
                      남
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerGender('female')}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                        partnerGender === 'female' ? 'bg-rose-500 text-white' : 'text-stone-400'
                      }`}
                    >
                      여
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePartnerCalculate} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="relative">
                      <input
                        type="number"
                        min={1900}
                        max={2050}
                        value={partnerYear}
                        onChange={(e) => setPartnerYear(Number(e.target.value))}
                        className="w-full pr-7 pl-2 py-2.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-stone-800 text-center text-sm font-medium min-h-[44px] focus:outline-none focus:ring-2 focus:ring-rose-300/50 focus:bg-white transition-all shadow-sm hover:shadow-md hover:border-stone-300"
                      />
                      <span className="absolute right-2.5 top-3 text-xs text-stone-400 pointer-events-none">년</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={partnerMonth}
                        onChange={(e) => setPartnerMonth(Number(e.target.value))}
                        className="w-full pr-7 pl-2 py-2.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-stone-800 text-center text-sm font-medium min-h-[44px] focus:outline-none focus:ring-2 focus:ring-rose-300/50 focus:bg-white transition-all shadow-sm hover:shadow-md hover:border-stone-300"
                      />
                      <span className="absolute right-2.5 top-3 text-xs text-stone-400 pointer-events-none">월</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={partnerDay}
                        onChange={(e) => setPartnerDay(Number(e.target.value))}
                        className="w-full pr-7 pl-2 py-2.5 bg-stone-50/80 border border-stone-200 rounded-2xl text-stone-800 text-center text-sm font-medium min-h-[44px] focus:outline-none focus:ring-2 focus:ring-rose-300/50 focus:bg-white transition-all shadow-sm hover:shadow-md hover:border-stone-300"
                      />
                      <span className="absolute right-2.5 top-3 text-xs text-stone-400 pointer-events-none">일</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPartnerIsHourUnknown(!partnerIsHourUnknown)}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={partnerIsHourUnknown}
                        className="toggle-switch"
                        data-checked={partnerIsHourUnknown}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-[11px] text-stone-500 select-none">상대방 시간 모름</span>
                    </div>

                    {!partnerIsHourUnknown && (
                      <select
                        value={partnerHour}
                        onChange={(e) => setPartnerHour(Number(e.target.value))}
                        className="premium-select px-3 py-1.5 bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-300/50 focus:border-rose-300 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md hover:border-stone-300"
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={i}>
                            {i < 12 ? `오전 ${i}시` : i === 12 ? '오후 12시' : `오후 ${i - 12}시`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400 text-white text-sm font-medium shadow-md shadow-rose-200/50 hover:shadow-lg hover:shadow-rose-300/50 hover:scale-[1.005] active:scale-[0.995] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>💘</span>
                    <span>상대방 궁합 분석하기</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Compatibility Result Card */}
            {compatResult && (
              <div className="glass-card-gold rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
                <div className="text-center space-y-2">
                  <div className="text-5xl font-serif font-bold text-rose-600">
                    <AnimatedScore target={compatResult.totalScore} />
                    <span className="text-2xl font-normal text-stone-400"> / 100</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-medium text-stone-900">
                    {compatResult.gradeTitle}
                  </h3>
                  <p className="text-xs text-stone-600 font-light max-w-md mx-auto">
                    {compatResult.gradeSubtitle}
                  </p>
                </div>

                {/* 3 Sub Score Meters */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white/80 rounded-2xl border border-stone-200 text-center">
                    <div className="text-[10px] text-stone-500">정신적 교감</div>
                    <div className="text-lg font-serif font-semibold text-stone-900 mt-0.5">
                      {compatResult.emotionalScore}점
                    </div>
                  </div>
                  <div className="p-3 bg-white/80 rounded-2xl border border-stone-200 text-center">
                    <div className="text-[10px] text-stone-500">생활/현실 케미</div>
                    <div className="text-lg font-serif font-semibold text-stone-900 mt-0.5">
                      {compatResult.lifestyleScore}점
                    </div>
                  </div>
                  <div className="p-3 bg-white/80 rounded-2xl border border-stone-200 text-center">
                    <div className="text-[10px] text-stone-500">오행 상호보완</div>
                    <div className="text-lg font-serif font-semibold text-stone-900 mt-0.5">
                      {compatResult.complementScore}점
                    </div>
                  </div>
                </div>

                {/* Detailed Advice List */}
                <div className="p-4 bg-white/85 rounded-2xl border border-amber-200/60 text-xs text-stone-700 space-y-2">
                  <div className="font-semibold text-stone-800 mb-1">💡 두 사람을 위한 연애 & 소통 가이드</div>
                  {compatResult.relationshipTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-rose-400">♥</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Instagram Story Preview Modal */}
      {showStoryModal && result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowStoryModal(false); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowStoryModal(false); }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          ref={(el) => el?.focus()}
        >
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden glass-card p-6 shadow-2xl space-y-5 border-rose-200">
            {/* Close Button */}
            <button
              onClick={() => setShowStoryModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-semibold cursor-pointer"
            >
              ✕
            </button>

            {/* Story Card Content */}
            <div className="text-center pt-2">
              <div className="text-xs text-rose-500 font-serif tracking-widest uppercase">LUMEN SAJU</div>
              <h4 className="text-xl font-serif font-medium text-stone-900 mt-1">
                {result.summary.dayMasterDescription}
              </h4>
              <p className="text-xs text-stone-500 mt-1 font-light">
                {result.solarDate.year}.{String(result.solarDate.month).padStart(2, '0')}.{String(result.solarDate.day).padStart(2, '0')} 출생
              </p>
            </div>

            {/* 4 Pillars In Story */}
            <div className="grid grid-cols-4 gap-2 text-center py-2">
              <StoryMiniCard title="년주" char={result.pillars.year.pillarHanja} sub={result.pillars.year.pillar} />
              <StoryMiniCard title="월주" char={result.pillars.month.pillarHanja} sub={result.pillars.month.pillar} />
              <StoryMiniCard title="일주(나)" char={result.pillars.day.pillarHanja} sub={result.pillars.day.pillar} isDayMaster />
              <StoryMiniCard
                title="시주"
                char={result.pillars.hour ? result.pillars.hour.pillarHanja : '―'}
                sub={result.pillars.hour ? result.pillars.hour.pillar : '시간모름'}
              />
            </div>

            {/* Lucky Color & Summary */}
            <div className="p-3 bg-white/80 rounded-2xl border border-stone-100 text-center space-y-1.5">
              <div className="text-xs text-stone-500 font-light">나의 럭키 오행 컬러</div>
              <div className="flex items-center justify-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-black/10"
                  style={{
                    backgroundColor: result.elements.lackingElements[0]
                      ? LIFESTYLE_RECOMMENDATIONS[result.elements.lackingElements[0]].luckyColor
                      : '#F43F5E',
                  }}
                />
                <span className="text-xs font-semibold text-stone-800">
                  {result.elements.lackingElements[0]
                    ? LIFESTYLE_RECOMMENDATIONS[result.elements.lackingElements[0]].luckyColorName
                    : '블러쉬 로즈'}
                </span>
              </div>
            </div>

            <div className="pt-2 text-center space-y-2">
              <button
                type="button"
                onClick={handleDownloadStory}
                className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-xs font-medium shadow-xs hover:bg-rose-600 transition cursor-pointer"
              >
                📥 9:16 인스타 스토리 규격 이미지 저장
              </button>
              <div className="text-[10px] text-stone-400">
                1080x1920 고화질 이미지로 저장되어 인스타그램 스토리에 바로 올릴 수 있어요 ✨
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Flippable Pillar Card
function FlippablePillarCard({
  pillarKey,
  pillar,
  title,
  subtitle,
  isDayMaster,
  isFlipped,
  onFlip,
}: {
  pillarKey: string;
  pillar: any;
  title: string;
  subtitle: string;
  isDayMaster: boolean;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      onClick={onFlip}
      className={`flip-card-container rounded-3xl cursor-pointer select-none hover:-translate-y-1 transition-transform duration-300 min-h-[300px] ${
        isDayMaster ? '' : ''
      }`}
    >
      <div className={`flip-card-inner rounded-3xl ${isFlipped ? 'is-flipped' : ''}`}>
        {/* ===== Front Face ===== */}
        <div
          className={`flip-card-front p-4 md:p-5 flex flex-col justify-between rounded-3xl ${
            isDayMaster
              ? 'glass-card-gold ring-2 ring-amber-400/50 shadow-md'
              : 'glass-card hover:shadow-md'
          }`}
        >
          <div className="text-center pb-2 border-b border-stone-200/50">
            <div className="text-xs font-semibold text-stone-800 flex items-center justify-center gap-1">
              {isDayMaster && <span>👑</span>}
              <span>{title}</span>
            </div>
            <div className="text-[10px] text-stone-400 font-light">{subtitle}</div>
          </div>

          <div className="py-3 text-center space-y-3">
            {/* Cheongan */}
            <div className="space-y-0.5">
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-600">
                {pillar.cheongan.tenGod}
              </span>
              <div className="text-2xl md:text-3xl font-serif font-semibold text-stone-900 leading-none">
                {pillar.cheongan.hanja}
              </div>
              <div className="text-xs text-stone-400 font-light">
                {pillar.cheongan.hangul} ({pillar.cheongan.yinYangKorean}{pillar.cheongan.elementKorean})
              </div>
            </div>

            <div className="w-6 h-px bg-stone-200 mx-auto" />

            {/* Jiji */}
            <div className="space-y-0.5">
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-600">
                {pillar.jiji.tenGod}
              </span>
              <div className="text-2xl md:text-3xl font-serif font-semibold text-stone-900 leading-none">
                {pillar.jiji.hanja}
              </div>
              <div className="text-xs text-stone-400 font-light">
                {pillar.jiji.hangul} ({pillar.jiji.animal}띠 · {pillar.jiji.elementKorean})
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200/50 text-center text-[10px] text-rose-500 font-light">
            클릭하여 지장간 보기 🔄
          </div>
        </div>

        {/* ===== Back Face (Hidden Stems) ===== */}
        <div
          className={`flip-card-back p-4 md:p-5 flex flex-col justify-between rounded-3xl ${
            isDayMaster
              ? 'glass-card-gold ring-2 ring-amber-400/50 shadow-md'
              : 'glass-card'
          }`}
        >
          <div className="text-center pb-2 border-b border-stone-200/50">
            <div className="text-xs font-semibold text-stone-800">{pillar.jiji.hangul} 지장간(支藏干)</div>
            <div className="text-[10px] text-stone-400">숨겨진 잠재 에너지</div>
          </div>

          <div className="space-y-2 pt-2 flex-1">
            {pillar.jiji.hiddenStems.map((stem: any, idx: number) => (
              <div key={idx} className="p-2 bg-white/80 rounded-xl border border-stone-100 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">
                    {stem.stemHanja} ({stem.stem})
                  </span>
                  <span className="text-[10px] text-rose-500 font-medium">
                    {stem.type === 'initial' ? '여기' : stem.type === 'middle' ? '중기' : '본기'} · {stem.percentage}%
                  </span>
                </div>
                <div className="text-[10px] text-stone-500 flex items-center justify-between">
                  <span>십성: {stem.tenGod}</span>
                  <span>{stem.days}일 기운</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center text-[10px] text-stone-400 font-light">
            다시 클릭하여 앞면 보기 🔄
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Element Progress Meter
function ElementMeter({
  korean,
  hanja,
  count,
  percentage,
  bgClass,
  fillClass,
  textClass,
}: {
  korean: string;
  hanja: string;
  count: number;
  percentage: number;
  color: string;
  bgClass: string;
  fillClass: string;
  textClass: string;
}) {
  return (
    <div className={`p-3.5 rounded-2xl border ${bgClass} text-center space-y-2`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${textClass}`}>
          {korean}({hanja})
        </span>
        <span className="text-[11px] font-medium text-stone-600">{count}개</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-stone-200/60 rounded-full overflow-hidden">
        <div
          className={`h-full ${fillClass} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="text-[10px] text-stone-500 font-light text-right">{percentage}%</div>
    </div>
  );
}

// Subcomponent: Mini Card For Story
function StoryMiniCard({
  title,
  char,
  sub,
  isDayMaster,
}: {
  title: string;
  char: string;
  sub: string;
  isDayMaster?: boolean;
}) {
  return (
    <div
      className={`p-2 rounded-2xl border text-center ${
        isDayMaster
          ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300/60'
          : 'bg-white/80 border-stone-100'
      }`}
    >
      <div className="text-[9px] text-stone-400">{title}</div>
      <div className="text-base font-serif font-semibold text-stone-900 mt-0.5">{char}</div>
      <div className="text-[10px] text-stone-500">{sub}</div>
    </div>
  );
}

// Subcomponent: Animated Score Counter
function AnimatedScore({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setDisplay(0);
    const duration = 1200; // ms
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [target]);

  return <span className="animate-digit-roll inline-block tabular-nums">{display}</span>;
}
