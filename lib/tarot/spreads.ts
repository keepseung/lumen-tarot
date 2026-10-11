import { MAJOR_ARCANA_CARDS } from './cards';
import {
  DrawnCard,
  QuestionPreset,
  ReadingSession,
  SpreadConfig,
  SpreadType,
  TarotCard,
} from './types';

export const SPREAD_CONFIGS: Record<SpreadType, SpreadConfig> = {
  daily: {
    id: 'daily',
    title: '오늘의 데일리 타로',
    subtitle: '오늘 하루 나를 비추는 빛과 지혜로운 처방전',
    cardCount: 1,
    iconName: 'Sun',
    badge: '1-Card Spread',
    positions: [
      {
        index: 0,
        name: '오늘의 핵심 에너지',
        description: '오늘 나에게 가장 필요한 기운과 중심 메시지',
      },
    ],
  },
  love: {
    id: 'love',
    title: '그 사람의 속마음 & 연애운',
    subtitle: '상대방의 무의식과 두 사람의 마음이 흐르는 방향',
    cardCount: 3,
    iconName: 'Heart',
    badge: '3-Card Romance Spread',
    positions: [
      {
        index: 0,
        name: '그 사람의 현재 속마음',
        description: '나를 향한 상대방의 무의식과 숨겨진 진심',
      },
      {
        index: 1,
        name: '나의 마음 & 관계의 장애물',
        description: '현재 내가 처한 감정과 두 사람 사이의 벽',
      },
      {
        index: 2,
        name: '앞으로의 관계 흐름 & 미래',
        description: '앞으로 3개월 내 관계의 전개와 조언',
      },
    ],
  },
  career: {
    id: 'career',
    title: '커리어 & 성공의 나침반',
    subtitle: '취업, 이직, 시험, 프로젝트의 결실과 실천 조언',
    cardCount: 3,
    iconName: 'Compass',
    badge: '3-Card Career Spread',
    positions: [
      {
        index: 0,
        name: '현재 상황 & 나의 잠재력',
        description: '지금 나의 에너지와 내재된 강점',
      },
      {
        index: 1,
        name: '마주할 기회 & 주의점',
        description: '나를 기다리는 기회와 조심해야 할 리스크',
      },
      {
        index: 2,
        name: '최종 결실 & 실천 가이드',
        description: '노력의 결실과 가장 효과적인 액션 플랜',
      },
    ],
  },
};

export const QUESTION_PRESETS: QuestionPreset[] = [
  {
    id: 'p_daily',
    category: 'daily',
    spreadType: 'daily',
    label: '오늘 하루 나의 운세와 럭키 에너지',
    description: '오늘 나를 지켜줄 행운의 조언과 마주할 상황을 확인해요',
    icon: '✨',
  },
  {
    id: 'p_love_mind',
    category: 'love_mind',
    spreadType: 'love',
    label: '그 사람의 진짜 속마음이 궁금해요',
    description: '말하지 못한 상대방의 진심과 나에 대한 생각을 읽어냅니다',
    icon: '💭',
  },
  {
    id: 'p_love_future',
    category: 'love_future',
    spreadType: 'love',
    label: '우리 앞으로 잘 될 수 있을까요? (썸/연애)',
    description: '두 사람 사이의 케미와 앞으로의 관계 변화를 확인해요',
    icon: '💖',
  },
  {
    id: 'p_career_job',
    category: 'career',
    spreadType: 'career',
    label: '취업/이직, 언제쯤 좋은 소식이 올까요?',
    description: '커리어 전환점과 합격운, 직장에서의 인정을 살펴봅니다',
    icon: '💼',
  },
  {
    id: 'p_career_exam',
    category: 'exam',
    spreadType: 'career',
    label: '시험/자격증/프로젝트 결과가 어떨까요?',
    description: '노력한 만큼의 결실과 시험 당일 집중력을 높이는 조언',
    icon: '🎯',
  },
  {
    id: 'p_money',
    category: 'money',
    spreadType: 'daily',
    label: '금전운과 깜짝 재물운 확인하기',
    description: '나를 풍요롭게 만들어줄 지출/수입 밸런스 가이드',
    icon: '🪙',
  },
];

/**
 * 중복 없이 무작위로 카드를 드로우합니다.
 * @param count 뽑을 카드 개수
 * @param allowReversed 역방향 허용 여부
 * @param selectedIndices (선택적) 사용자가 화면에서 직접 탭한 카드 인덱스
 */
export function drawRandomCards(
  count: number,
  allowReversed: boolean = false,
  selectedIndices?: number[]
): { card: TarotCard; isReversed: boolean }[] {
  if (!Number.isInteger(count) || count < 1 || count > MAJOR_ARCANA_CARDS.length) {
    throw new Error('올바른 카드 수를 선택해주세요.');
  }
  const deck = createShuffledDeck(allowReversed);
  return selectDeckCards(deck, selectedIndices ?? Array.from({ length: count }, (_, i) => i), count);
}

export type DeckCard = { card: TarotCard; isReversed: boolean };

/** 한 번 섞은 덱과 방향을 선택이 끝날 때까지 유지합니다. */
export function createShuffledDeck(allowReversed = false): DeckCard[] {
  const cards = [...MAJOR_ARCANA_CARDS];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.map(card => ({ card, isReversed: allowReversed && Math.random() < 0.35 }));
}

export function selectDeckCards(deck: DeckCard[], indices: number[], count: number): DeckCard[] {
  if (indices.length !== count || new Set(indices).size !== count ||
      indices.some(index => !Number.isInteger(index) || index < 0 || index >= deck.length)) {
    throw new Error('서로 다른 카드를 순서대로 선택해주세요.');
  }
  const selected = indices.map(index => deck[index]);
  if (new Set(selected.map(item => item.card.id)).size !== count) {
    throw new Error('덱에 중복 카드가 있습니다. 다시 섞어주세요.');
  }
  return selected;
}

/**
 * 리딩 세션 객체를 생성합니다.
 */
export function createReadingSession(
  spreadType: SpreadType,
  options: {
    preset?: QuestionPreset;
    customQuestion?: string;
    allowReversed?: boolean;
    drawnData?: { card: TarotCard; isReversed: boolean }[];
  }
): ReadingSession {
  const spread = SPREAD_CONFIGS[spreadType];
  const allowReversed = options.allowReversed ?? false;
  const drawnData =
    options.drawnData ?? drawRandomCards(spread.cardCount, allowReversed);

  const drawnCards: DrawnCard[] = drawnData.map((item, idx) => ({
    card: item.card,
    isReversed: item.isReversed,
    position: spread.positions[idx] || {
      index: idx,
      name: `카드 ${idx + 1}`,
      description: '상세 운세',
    },
    revealed: false,
  }));

  const session: ReadingSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    spread,
    preset: options.preset,
    customQuestion: options.customQuestion,
    drawnCards,
    allowReversed,
    createdAt: new Date().toISOString(),
  };
  session.synthesis = generateOverallSynthesis(session);
  return session;
}

/**
 * 1장 또는 3장의 카드를 종합하여 감성적인 총평 요약 메시지를 생성합니다.
 */
export function generateOverallSynthesis(session: ReadingSession): string {
  if (session.synthesis !== undefined) return session.synthesis;
  const cards = session.drawnCards;
  if (cards.length === 0) return '';

  if (session.spread.id === 'daily') {
    const main = cards[0];
    const cardName = main.card.nameKo;
    const dirText = main.isReversed ? '역방향' : '정방향';
    return `오늘 하루 당신을 이끄는 카드는 ${cardName}(${dirText})입니다. ${
      main.isReversed ? main.card.reversed.general : main.card.upright.general
    } 오늘 하루는 특히 "${main.card.keywords[0]}"의 마음가짐으로 가볍고 당당하게 보내보세요!`;
  }

  const theme = session.spread.id === 'love' ? 'love' : 'career';
  const paragraphs = cards.map((drawn, index) => {
    const detail = drawn.isReversed ? drawn.card.reversed : drawn.card.upright;
    const meaning = index === 0 ? detail[theme] : index === 1 ? detail.general : detail.advice;
    return `${drawn.position.name} · ${drawn.card.nameKo}(${drawn.isReversed ? '역방향' : '정방향'}): ${meaning}`;
  });
  return `${paragraphs.join('\n\n')}\n\n카드의 상징을 고민을 돌아보는 단서로 삼아보세요. 상대의 마음과 실제 결과는 대화와 행동으로 확인해주세요.`;
}
