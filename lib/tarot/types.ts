export type ArcanaType = 'major' | 'minor';

export interface CardReadingDetail {
  general: string;
  love: string;
  career: string;
  advice: string;
}

export interface TarotCard {
  id: string; // e.g. '00_fool'
  number: number; // 0 ~ 21
  name: string; // "The Fool"
  nameKo: string; // "바보"
  arcana: ArcanaType;
  element: string; // "바람 (Air)", "불 (Fire)" 등
  planetOrSign?: string; // "천왕성", "양자리" 등
  keywords: string[]; // ["순수한 시작", "자유로운 영혼", "모험"]
  summary: string;
  upright: CardReadingDetail;
  reversed: CardReadingDetail;
  symbol: string; // 상징 이모지 or 아이콘
  gradient: {
    from: string; // Tailwind class or hex
    to: string;
    accent: string;
    glow: string;
  };
  imagePath?: string; // 사용자가 나중에 교체할 이미지 경로
}

export type SpreadType = 'daily' | 'love' | 'career';

export interface SpreadPosition {
  index: number;
  name: string;
  description: string;
}

export interface SpreadConfig {
  id: SpreadType;
  title: string;
  subtitle: string;
  cardCount: number;
  iconName: string;
  badge: string;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: SpreadPosition;
  revealed: boolean;
}

export type QuestionCategory =
  | 'daily'
  | 'love_mind'
  | 'love_future'
  | 'career'
  | 'exam'
  | 'money'
  | 'healing'
  | 'custom';

export interface QuestionPreset {
  id: string;
  category: QuestionCategory;
  spreadType: SpreadType;
  label: string;
  description: string;
  icon: string;
}

export interface ReadingSession {
  id: string;
  spread: SpreadConfig;
  preset?: QuestionPreset;
  customQuestion?: string;
  drawnCards: DrawnCard[];
  allowReversed: boolean;
  createdAt: string;
}
