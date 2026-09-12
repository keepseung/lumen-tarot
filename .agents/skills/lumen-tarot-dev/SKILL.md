---
name: lumen-tarot-dev
description: >-
  LUMEN 타로/사주 서비스 개발 노하우 스킬. 이미지 최적화(WebP 변환), CSS 3D 카드 플립 애니메이션,
  Framer Motion 기반 카드 스프레드 인터랙션, iOS 토글 스위치 패턴, 디자인 시스템 토큰 확장,
  SSR-safe 코드 작성, 궁합 카운트업 애니메이션 등 본 프로젝트의 핵심 패턴을 다룬다.
  타로/사주 관련 UI 작업, 이미지 변환, 애니메이션 개선 시 이 스킬을 참고하라.
---

# LUMEN 타로/사주 서비스 개발 노하우

## 1. 이미지 최적화 (JPEG → WebP 변환)

### 변환 명령어
```bash
# 고품질 WebP 변환 (품질 유지 + 압축)
cwebp -q 90 -m 5 -sharp_yuv "원본.jpeg" -o "결과.webp"
```

### 파라미터 설명
| 옵션 | 값 | 설명 |
|---|---|---|
| `-q` | `90` | 품질 90% — 육안 차이 없는 수준에서 최대 압축 |
| `-m` | `5` | 압축 알고리즘 복잡도 (0~6, 높을수록 느리지만 압축률↑) |
| `-sharp_yuv` | - | YUV 변환 시 색상 선명도 유지 (일러스트/텍스트에 필수) |

### 기대 압축률
- **사진/일러스트**: 60~75% 크기 절감 (4.8MB → 1.5MB 등)
- **1536x2752 해상도 카드 이미지**: 평균 3.5MB → 1.0MB

### 배치 변환 스크립트
```javascript
// scripts/convert-tarot-webp.mjs
import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import path from 'path';

const srcDir = './tarot';
const destDir = './public/images/tarot';

readdirSync(srcDir)
  .filter(f => /\.(jpe?g|png)$/i.test(f))
  .forEach(file => {
    const base = path.basename(file, path.extname(file));
    const outName = base.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    execSync(
      `cwebp -q 90 -m 5 -sharp_yuv "${path.join(srcDir, file)}" -o "${path.join(destDir, outName)}.webp"`
    );
  });
```

### 주의사항
- `cwebp` 미설치 시: `brew install webp`
- `next/image` 대신 `<img>` 사용 시 `eslint-disable-next-line @next/next/no-img-element` 주석 필요
- `card-assets.ts`에서 카드 ID → 이미지 경로 매핑을 관리

---

## 2. CSS 3D 카드 플립 애니메이션

### globals.css 에 정의해야 할 클래스
```css
/* 3D 플립 카드 컨테이너 */
.flip-card-container {
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
}

.flip-card-inner.is-flipped {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

### 핵심 원칙
- **`perspective`**: 컨테이너에 설정 (1000px 권장)
- **`transform-style: preserve-3d`**: inner 래퍼에 설정
- **`backface-visibility: hidden`**: front/back 양쪽 모두 설정
- **`is-flipped` 클래스 토글**: React state로 `rotateY(180deg)` 제어
- 조건부 렌더링(`{isFlipped ? ... : ...}`)은 사용하지 않음 — 양면을 항상 DOM에 유지

---

## 3. Framer Motion 카드 스프레드 인터랙션

### 부채꼴(Arc) 배치 계산
```typescript
const midpoint = (totalCards - 1) / 2;
const normalized = (idx - midpoint) / midpoint; // -1.0 ~ 1.0
const rotationDeg = normalized * 32;              // 부채꼴 각도
const xOffset = normalized * (isMobile ? 320 : 440); // X 간격
const yOffset = Math.pow(normalized, 2) * 55;     // 포물선 곡선(Y)
```

### 호버 애니메이션 — 자연스럽게 하는 핵심 포인트

| 속성 | ❌ 어색한 값 | ✅ 자연스러운 값 | 이유 |
|---|---|---|---|
| `rotate` | `0` (호버 시 즉시 직립) | `rotationDeg * 0.3` (살짝만 세움) | 급격한 회전 방지 |
| `scale` | `1.15` (과도한 확대) | `1.08` (적당한 확대) | 옆 카드와 겹침 방지 |
| `y` offset | `yOffset - 38` (미묘한 이동) | `yOffset - 55` (확실히 위로) | 호버 카드 명확 구분 |
| `delay` | `idx * 0.015` (모든 전환에 딜레이) | 없음 (즉각 반응) | 호버는 즉시 반응해야 함 |
| `zIndex` | `animate` 안에 포함 | `style` prop으로 분리 | 스프링으로 z-index가 부드럽게 변하면 깜빡임 발생 |
| `drop-shadow` | `0_0_25px` (전방향 글로우) | `0_-8px_20px` (상단 글로우) | 위로 떠오르는 느낌 강조 |

### 스프링 설정
```typescript
transition={{
  type: 'spring',
  stiffness: 350,  // 빠른 반응
  damping: 26,     // 적당한 감쇠 (너무 낮으면 튕김)
  mass: 0.8,       // 가벼운 질량 (빠른 도달)
}}
```

---

## 4. SSR-Safe 코드 패턴 (Next.js)

### ❌ 위험한 패턴
```typescript
// SSR에서 window가 없어서 크래시
const xOffset = normalized * (window.innerWidth < 640 ? 320 : 440);
```

### ✅ 안전한 패턴
```typescript
const [viewportWidth, setViewportWidth] = useState(768); // 기본값

useEffect(() => {
  const updateWidth = () => setViewportWidth(window.innerWidth);
  updateWidth();
  window.addEventListener('resize', updateWidth);
  return () => window.removeEventListener('resize', updateWidth);
}, []);

// 사용
const xOffset = normalized * (viewportWidth < 640 ? 320 : 440);
```

### 원칙
- `window`, `document`, `navigator` 접근은 반드시 `useEffect` 내부에서
- `useState`로 기본값 설정 후 클라이언트에서 갱신
- `window?.innerWidth` 옵셔널 체이닝도 SSR에서 `undefined` 반환하므로 불완전

---

## 5. iOS 토글 스위치 (CSS Only)

### globals.css 정의
```css
.toggle-switch {
  --toggle-w: 44px;
  --toggle-h: 26px;
  --toggle-knob: 20px;
  width: var(--toggle-w);
  height: var(--toggle-h);
  border-radius: 999px;
  background: #d1d5db;
  position: relative;
  cursor: pointer;
  transition: background 0.25s ease;
  border: none;
  padding: 0;
  flex-shrink: 0;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: var(--toggle-knob);
  height: var(--toggle-knob);
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch[data-checked="true"] {
  background: #f43f5e; /* rose-500 */
}

.toggle-switch[data-checked="true"]::after {
  transform: translateX(calc(var(--toggle-w) - var(--toggle-knob) - 6px));
}
```

### 다크 테마 변형
```css
.toggle-switch-dark {
  background: rgba(255,255,255,0.15);
}
.toggle-switch-dark[data-checked="true"] {
  background: #f59e0b; /* amber-500 */
}
```

### React 사용법
```tsx
<button
  type="button"
  role="switch"
  aria-checked={isChecked}
  className="toggle-switch"
  data-checked={isChecked}
  onClick={() => setIsChecked(!isChecked)}
/>
```

---

## 6. 숫자 카운트업 애니메이션

```tsx
function AnimatedScore({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setDisplay(0);
    const duration = 1200;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target]);

  return <span className="inline-block tabular-nums">{display}</span>;
}
```

### 핵심: `tabular-nums`
- 숫자가 바뀔 때 자릿수 폭이 달라지면 레이아웃이 떨리는 문제 방지
- `font-variant-numeric: tabular-nums`로 고정폭 숫자 렌더링

---

## 7. 모달 접근성 패턴

```tsx
<div
  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
  onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
  onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
  role="dialog"
  aria-modal="true"
  tabIndex={-1}
  ref={(el) => el?.focus()}
>
```

### 필수 요소
- **backdrop 클릭 닫기**: `e.target === e.currentTarget` 체크 (내부 클릭 전파 방지)
- **Escape 키**: `onKeyDown`으로 Escape 감지
- **포커스 트랩**: `tabIndex={-1}` + `ref` 콜백으로 마운트 시 자동 포커스
- **ARIA**: `role="dialog"` + `aria-modal="true"`

---

## 8. 카드 뒷면 이미지 교체 시 주의사항

### TarotCard3D.tsx 구조
```
<motion.div>  ← 3D 틸트 컨테이너
  <motion.div>  ← 플립 래퍼 (rotateY 0 ↔ 180)
    <div>         ← 뒷면 (backface-visibility: hidden)
      <img src="/images/tarot/card_back.webp" />  ← 커스텀 이미지
    </div>
    <div>         ← 앞면 (rotateY: 180deg, backface-visibility: hidden)
      <img src={cardImageUrl} />  ← 카드별 고유 이미지
    </div>
  </motion.div>
</motion.div>
```

### 주의
- 뒷면 이미지는 `object-cover`로 꽉 채우되, `borderRadius`를 인라인으로 전달해 라운드 유지
- 홀로그램 오버레이(`mix-blend-overlay`)를 이미지 위에 얹으면 고급스러움 가미
- 세로가 긴 카드(1536×2752)를 사용할 경우 컨테이너 높이를 충분히 확보할 것

---

## 9. 디자인 전수조사 체크리스트

UI를 리팩토링할 때 아래 항목을 점검:

- [ ] **네이티브 체크박스** → iOS 토글 스위치로 교체
- [ ] **네이티브 select** → 글래스모피즘 커스텀 select 교체
- [ ] **폰트** → 제목에 세리프 폰트(Playfair Display 등), 본문에 산세리프
- [ ] **조건부 렌더링 플립** → CSS 3D 플립으로 교체
- [ ] **정적 숫자 표시** → 카운트업 애니메이션
- [ ] **모달** → Escape/backdrop 접근성 추가
- [ ] **window 직접 접근** → SSR-safe useState+useEffect 패턴
- [ ] **이미지** → WebP 변환 + 고품질 유지 (-q 90 -sharp_yuv)
- [ ] **카드 스프레드 호버** → 회전 30% 유지, 확대 1.08, Y -55px, delay 제거, z-index style 분리
