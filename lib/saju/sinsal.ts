import { Cheongan, Jiji, SinsalInfo } from './types';

/**
 * 20대 여성이 특히 공감하고 열광하는 5대 핵심 신살(神煞) 분석:
 * 1. 도화살 (자오묘유 - 치명적인 매력, 인기, 호감도)
 * 2. 홍염살 (다정하고 자연스러운 끌림, 러블리한 호감)
 * 3. 화개살 (예술적 감수성, 독보적인 미적 감각, 집중력)
 * 4. 역마살 (인신사해 - 자유로운 탐험, 글로벌 역량, 활동성)
 * 5. 천을귀인 (인생의 수호천사, 위기 때 나타나는 귀인의 도움)
 */
export function analyzeSinsal(
  dayStem: Cheongan,
  yearBranch: Jiji,
  monthBranch: Jiji,
  dayBranch: Jiji,
  hourBranch?: Jiji | null
): SinsalInfo[] {
  const branches: { branch: Jiji; pillarName: '년지' | '월지' | '일지' | '시지' }[] = [
    { branch: yearBranch, pillarName: '년지' },
    { branch: monthBranch, pillarName: '월지' },
    { branch: dayBranch, pillarName: '일지' },
  ];
  if (hourBranch) {
    branches.push({ branch: hourBranch, pillarName: '시지' });
  }

  const results: SinsalInfo[] = [];

  // 기준 지지: 일지 또는 년지 기준 12신살 도화/역마/화개 삼합 그룹
  // 삼합:
  // 申子辰 -> 자(도화), 인(역마), 진(화개)
  // 寅午戌 -> 묘(도화), 신(역마), 술(화개)
  // 巳酉丑 -> 오(도화), 해(역마), 축(화개)
  // 亥卯未 -> 자(도화), 사(역마), 미(화개)
  const getSamhapGroup = (b: Jiji) => {
    if (['신', '자', '진'].includes(b)) return { dohwa: '유' as Jiji, yeokma: '인' as Jiji, hwagae: '진' as Jiji };
    if (['인', '오', '술'].includes(b)) return { dohwa: '묘' as Jiji, yeokma: '신' as Jiji, hwagae: '술' as Jiji };
    if (['사', '유', '축'].includes(b)) return { dohwa: '오' as Jiji, yeokma: '해' as Jiji, hwagae: '축' as Jiji };
    return { dohwa: '자' as Jiji, yeokma: '사' as Jiji, hwagae: '미' as Jiji };
  };

  const dayGroup = getSamhapGroup(dayBranch);
  const yearGroup = getSamhapGroup(yearBranch);

  // 1. 도화살 (자오묘유) 판정
  for (const item of branches) {
    if (item.branch === dayGroup.dohwa || item.branch === yearGroup.dohwa || ['자', '오', '묘', '유'].includes(item.branch)) {
      if (!results.some((r) => r.name === '도화살' && r.branch === item.branch)) {
        results.push({
          name: '도화살',
          hanja: '桃花煞',
          category: 'charm',
          title: '시선을 사로잡는 치명적인 스타성 & 매력',
          description: `사주의 ${item.pillarName}(${item.branch})에 도화의 기운이 깃들어 있습니다. 사람들의 시선을 자연스럽게 모으는 화사한 존재감과 친근한 매력이 돋보여요.`,
          advice: '스스로의 개성과 스타일을 당당하게 드러낼수록 대인관계와 커리어에서 큰 빛을 발합니다.',
          branch: item.branch,
          pillarName: item.pillarName,
        });
      }
    }
  }

  // 2. 홍염살 (일간 기준 특정 지지)
  // 갑->오, 을->오, 병->인, 정->미, 무->진, 기->진, 경->술, 신->유, 임->자, 계->신
  const hongyeomMap: Record<Cheongan, Jiji> = {
    갑: '오',
    을: '오',
    병: '인',
    정: '미',
    무: '진',
    기: '진',
    경: '술',
    신: '유',
    임: '자',
    계: '신',
  };
  const targetHongyeom = hongyeomMap[dayStem];
  for (const item of branches) {
    if (item.branch === targetHongyeom) {
      results.push({
        name: '홍염살',
        hanja: '紅艶煞',
        category: 'charm',
        title: '다정하고 사랑스러운 천생 호감형 매력',
        description: `사주의 ${item.pillarName}(${item.branch})에 홍염의 꽃잎이 피어 있습니다. 웃을 때 특히 매력적이며, 상대를 무장해제시키는 사랑스러운 다정함을 품었어요.`,
        advice: '진심 어린 배려와 미소는 당신의 가장 강력한 무기입니다.',
        branch: item.branch,
        pillarName: item.pillarName,
      });
      break;
    }
  }

  // 3. 화개살 (진술축미) 판정
  for (const item of branches) {
    if (item.branch === dayGroup.hwagae || item.branch === yearGroup.hwagae || ['진', '술', '축', '미'].includes(item.branch)) {
      if (!results.some((r) => r.name === '화개살' && r.branch === item.branch)) {
        results.push({
          name: '화개살',
          hanja: '華蓋煞',
          category: 'art',
          title: '독보적인 예술적 감수성과 깊은 통찰력',
          description: `사주의 ${item.pillarName}(${item.branch})에 화개의 기운이 흐릅니다. 섬세한 미적 감각, 나만의 뚜렷한 취향, 깊은 사색과 높은 집중력을 지니고 있어요.`,
          advice: '예술, 디자인, 글쓰기, 전문 분야 연구 등 나만의 감성을 표현하는 창작 활동과 궁합이 환상적입니다.',
          branch: item.branch,
          pillarName: item.pillarName,
        });
      }
    }
  }

  // 4. 역마살 (인신사해) 판정
  for (const item of branches) {
    if (item.branch === dayGroup.yeokma || item.branch === yearGroup.yeokma) {
      if (!results.some((r) => r.name === '역마살' && r.branch === item.branch)) {
        results.push({
          name: '역마살',
          hanja: '驛馬煞',
          category: 'activity',
          title: '자유로운 탐험가 & 넓은 세상을 향한 추진력',
          description: `사주의 ${item.pillarName}(${item.branch})에 역마의 바람이 붑니다. 한곳에 머물기보다 새로운 환경을 개척하고, 여행이나 다양한 변화 속에서 에너지를 얻어요.`,
          advice: '해외 경험, 출장, 다양한 사람들과의 교류를 두려워하지 말고 활동 반경을 넓혀보세요.',
          branch: item.branch,
          pillarName: item.pillarName,
        });
      }
    }
  }

  // 5. 천을귀인 (일간 기준 최고의 길신)
  // 갑/무/경 -> 축, 미
  // 을/기 -> 자, 신
  // 병/정 -> 해, 유
  // 신 -> 인, 오
  // 임/계 -> 사, 묘
  const cheonulMap: Record<Cheongan, Jiji[]> = {
    갑: ['축', '미'],
    무: ['축', '미'],
    경: ['축', '미'],
    을: ['자', '신'],
    기: ['자', '신'],
    병: ['해', '유'],
    정: ['해', '유'],
    신: ['인', '오'],
    임: ['사', '묘'],
    계: ['사', '묘'],
  };
  const targetCheonul = cheonulMap[dayStem] || [];
  for (const item of branches) {
    if (targetCheonul.includes(item.branch)) {
      if (!results.some((r) => r.name === '천을귀인' && r.branch === item.branch)) {
        results.push({
          name: '천을귀인',
          hanja: '天乙貴人',
          category: 'nobility',
          title: '위기 때마다 나를 돕는 최고의 수호천사',
          description: `사주의 ${item.pillarName}(${item.branch})에 최고의 길신인 천을귀인이 자리 잡고 있습니다. 어려운 고비마다 뜻밖의 조력자나 기회가 찾아와 위기를 지혜롭게 넘겨요.`,
          advice: '주변 사람들에게 베푼 온기는 반드시 더 큰 행운이 되어 나에게 돌아옵니다.',
          branch: item.branch,
          pillarName: item.pillarName,
        });
      }
    }
  }

  return results.slice(0, 4); // 대표 신살 최대 4개
}
