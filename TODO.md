# 📋 LUMEN (루멘) 사주 & 타로 서비스 작업 완료 현황 (TODO.md)

> **프로젝트 목표**: 20대 여성을 사로잡는 100% 무결점 정통 만세력 사주 엔진과, ReactBits & Framer Motion 수준의 최첨단 3D 애니메이션을 제공하는 감성 인터랙티브 타로 서비스 구축 완료

---

## 🔮 1. LUMEN TAROT (루멘 타로) 구축 완료 내역 (All Completed)

### 📦 Phase 1: 애니메이션 & UI 라이브러리 설치
- [x] **`framer-motion` 설치 완료**: 3D 카드 틸트, 스프링 셔플, 부채꼴 아크 스프레드, 180도 플립 모션
- [x] **`lucide-react` 설치 완료**: 세련된 감성 아이콘 세트 (Sparkles, Moon, Sun, Heart, Compass 등)
- [x] **`canvas-confetti` & `@types/canvas-confetti` 설치 완료**: 카드 오픈 시 영롱한 별빛 축하 파티클

### 🃏 Phase 2: 타로 데이터 & 리딩 엔진 구축 (`lib/tarot/`)
- [x] **타입 정의 모듈 구축** (`lib/tarot/types.ts`): 카드, 스프레드, 오리엔테이션(정방향/역방향), 리딩 세션 타입 정의
- [x] **22장 메이저 아르카나 풀 데이터베이스 구축** (`lib/tarot/cards.ts`):
  - 0번 The Fool (바보) ~ 21번 The World (세계)
  - 20대 여성 공감 키워드 3가지 (연애, 마음가짐, 미래)
  - 4대 테마 상세 풀이 (상황의 본질, 연애 속마음, 커리어·금전, 오늘의 럭키 처방전)
- [x] **이미지 에셋 교체 모듈 구축** (`lib/tarot/card-assets.ts`):
  - 추후 사용자 이미지 등록 시 단일 객체 매핑만으로 즉시 교체되는 아키텍처
  - 자체 몽환적 우주 그라데이션, 심볼릭 이모지, 황금빛 테두리 아트워크 기본 렌더링
- [x] **스프레드 & 카드 드로우 알고리즘 구축** (`lib/tarot/spreads.ts`):
  - 1장 데일리 타로 / 3장 연애 속마음 / 3장 커리어 나침반
  - Fisher-Yates 기반 100% 중복 배제 무작위 드로우
  - 3장의 카드를 유기적으로 연결하는 종합 스토리텔링(Synthesis) 생성 엔진

### ✨ Phase 3: ReactBits & Framer Motion 초감각 애니메이션 컴포넌트
- [x] **`TarotBackground.tsx`**: 은은한 보랏빛/로즈빛 오로라 및 캔버스 별빛 파티클 배경
- [x] **`TarotCard3D.tsx`**: **ReactBits Tilted Card 급 3D 인터랙션**
  - 마우스/터치 좌표 실시간 반응 3D Perspective Tilt (스프링 물리)
  - 카드 표면을 따라 흐르는 동적 반사광(Specular Glare) 오버레이
  - 180도 3D 플립 모션 및 정방향/역방향 회전
- [x] **`DeckShuffle.tsx`**: **스프링 물리 셔플링 애니메이션**
  - 카드가 좌우로 분할되어 교차 회전하며 리드미컬하게 섞이는 손맛 구현
  - 3초 집중 가이드 및 명상 안내 문구
- [x] **`CardSpread.tsx`**: **인터랙티브 부채꼴 아크 스프레드**
  - 22장의 카드가 포물선 곡선 부채꼴 형태로 스르륵 펼쳐지는 애니메이션
  - 호버/터치 시 선택된 카드가 아크 위로 솟아오르는 리프팅 효과 및 하이라이트
  - 1장 / 3장 순차 선택 슬롯 인디케이터
- [x] **`TarotReadingView.tsx`**: 뽑힌 카드의 공간적 배치 및 원클릭 전체 오픈
- [x] **`lib/tarot/story-downloader.ts`**: 1080x1920 Instagram Story용 9:16 고화질 Canvas 다운로더 및 텍스트 클립보드 복사

### 🧭 Phase 4: 플랫폼 통합 네비게이션 & UI 고도화
- [x] **`app/page.tsx` 통합 헤더 네비게이션**:
  - `✨ 감성 타로 (Tarot)`
  - `🌸 정통 사주 (Saju)`
  - `💫 소울 궁합 (Chemistry)`
- [x] 타로 탭 진입 시 딥 미드나잇 다크 테마 자동 전환 (`bg-[#0A071A]`)
- [x] 모바일 터치 전 구간 60fps 최적화

### 🧪 Phase 5: 테스트 & 품질 검증
- [x] **타로 전용 단위 테스트 스위트 통과** (`scripts/test-tarot.ts`, 22/22 tests pass)
- [x] **Next.js 16 빌드(`npm run build`) 무결점 통과** (0 TS Errors, 0 Lint Errors)
- [x] **브라우저 서브에이전트(`browser_subagent`) 기반 3D 셔플, 스프레드, 플립, 탭 전환 완주 검증**

---

## 📌 2. 기존 완료된 작업 내역 (LUMEN SAJU 만세력)

### ⚙️ 만세력 코어 역법 & 연도 이월 버그 보정 엔진
- [x] **만세력 오픈소스 패키지 2개 설치** (`korean-lunar-calendar`, `@fullstackfamily/manseryeok`)
- [x] **천문학 기반 24절기 및 입춘 정밀 시각 계산 엔진 구축** (`lib/saju/solar-terms.ts`)
- [x] **연초/연말 절기 연도 이월(Off-by-One Year) 버그 이중 예외 보정** (`lib/saju/cross-validator.ts`)
- [x] **사주 4주 8자, 십성, 오행 분석 코어 엔진** (`lib/saju/ten-gods.ts`, `lib/saju/elements.ts`)

### 🌸 20대 여성 타깃 감성 UI/UX 고도화
- [x] **소프트 글래스모피즘 & 감성 파스텔 오행 컬러 시스템 구축** (`app/globals.css`)
- [x] **4주 8자 오라클 카드 3D 플립(Flip) 인터랙션**
- [x] **10대 일간 자연물 페르소나 뱃지 및 감성 설명**
- [x] **연인 & 친구 소울메이트 궁합(Compatibility) 모듈** (`lib/saju/compatibility.ts`)
- [x] **20대 여성 관심 5대 핵심 신살(도화/홍염/화개/역마/천을귀인)** (`lib/saju/sinsal.ts`)
- [x] **10년 주기 대운(大運) 타임라인 & 올해의 세운 가이드** (`lib/saju/daewoon.ts`)
- [x] **HTML5 Canvas 기반 9:16 인스타 스토리 카드 다운로더** (`lib/saju/story-downloader.ts`)
- [x] **사주 단위 테스트 스위트 통과 (14/14 tests pass) 및 빌드 검증**
