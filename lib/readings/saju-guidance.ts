import type { SajuResult, FiveElementKorean } from '../saju/types';
import { TOPICS, type ReadingTopic } from './storage';

const STRENGTHS: Record<FiveElementKorean, string> = {
  목: '새로운 시도를 시작하고 꾸준히 성장하는 힘',
  화: '마음을 표현하고 분위기를 밝히는 힘',
  토: '약속을 지키고 일상을 안정시키는 힘',
  금: '우선순위를 정하고 필요한 경계를 세우는 힘',
  수: '한 걸음 물러서서 듣고 상황을 살피는 힘',
};
const ACTIONS: Record<ReadingTopic, string[]> = {
  love: ['상대의 마음을 추측하기보다 내가 원하는 관계를 한 문장으로 적어보세요.', '이번 주 편안한 때를 골라 내 감정과 바라는 점을 구체적으로 이야기해보세요.', '대화 후에는 말뿐 아니라 서로의 행동과 약속이 이어지는지 살펴보세요.'],
  career: ['이번 달 집중할 목표 하나와 그 이유를 적어보세요.', '오늘 20분 안에 끝낼 수 있는 첫 행동을 정해 실행해보세요.', '일주일 뒤 실행 기록을 돌아보고 다음 목표의 크기를 조정해보세요.'],
  relationship: ['함께 있을 때 편안한 관계와 지치는 관계를 떠올려보세요.', '무리한 부탁에는 내가 가능한 범위를 짧고 분명하게 알려주세요.', '고마운 사람 한 명에게 구체적인 감사의 말을 전해보세요.'],
};

export function getSajuGuidance(result: SajuResult, topic: ReadingTopic) {
  const dominant = result.elements.dominantElements[0];
  return {
    title: `${TOPICS[topic]} 고민을 위한 작은 나침반`,
    summary: dominant ? `${STRENGTHS[dominant]}을 ${TOPICS[topic]} 고민을 돌아보는 출발점으로 삼아보세요.` : '한 가지 성향으로 단정하기보다 지금 필요한 균형을 살펴보세요.',
    basis: `${result.dayMaster.hangul} 일간 · ${result.summary.dominantElementText}. ${result.summary.lackingElementText}`,
    actions: ACTIONS[topic],
  };
}
