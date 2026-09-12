/**
 * LUMEN 타로 카드 이미지 에셋 매퍼 (Asset Swapping System)
 * 
 * [사용자 가이드]
 * 자체 타로 카드 이미지를 적용하고 싶으실 경우:
 * 1. public/images/tarot/ 폴더에 이미지 파일(jpg, png, webp)을 넣으세요.
 * 2. 아래 CUSTOM_CARD_IMAGES 객체에서 해당 카드 ID의 경로를 활성화하거나 수정하세요.
 *    예: '00_fool': '/images/tarot/fool.png'
 * 3. 이미지가 지정되지 않은 카드는 자동으로 LUMEN의 미려한 자체 3D 그라데이션 일러스트로 렌더링됩니다.
 */

export const CUSTOM_CARD_IMAGES: Record<string, string | null> = {
  '00_fool': '/images/tarot/00_fool.webp',
  '01_magician': '/images/tarot/01_magician.webp',
  '02_high_priestess': '/images/tarot/02_high_priestess.webp',
  '03_empress': '/images/tarot/03_empress.webp',
  '04_emperor': '/images/tarot/04_emperor.webp',
  '05_hierophant': '/images/tarot/05_hierophant.webp',
  '06_lovers': '/images/tarot/06_lovers.webp',
  '07_chariot': '/images/tarot/07_chariot.webp',
  '08_strength': '/images/tarot/08_strength.webp',
  '09_hermit': '/images/tarot/09_hermit.webp',
  '10_wheel_of_fortune': '/images/tarot/10_wheel_of_fortune.webp',
  '11_justice': '/images/tarot/11_justice.webp',
  '12_hanged_man': '/images/tarot/12_hanged_man.webp',
  '13_death': '/images/tarot/13_death.webp',
  '14_temperance': '/images/tarot/14_temperance.webp',
  '15_devil': '/images/tarot/15_devil.webp',
  '16_tower': '/images/tarot/16_tower.webp',
  '17_star': '/images/tarot/17_star.webp',
  '18_moon': '/images/tarot/18_moon.webp',
  '19_sun': '/images/tarot/19_sun.webp',
  '20_judgement': '/images/tarot/20_judgement.webp',
  '21_world': '/images/tarot/21_world.webp',
};

/**
 * 특정 카드의 이미지 URL을 반환합니다.
 * 사용자 지정 이미지가 없을 경우 null을 반환하여 자체 그래픽 렌더러를 사용합니다.
 */
export function getCardImageUrl(cardId: string): string | null {
  return CUSTOM_CARD_IMAGES[cardId] || null;
}

/**
 * 로마 숫자 변환 헬퍼 (0 -> 0, 1 -> I, 21 -> XXI)
 */
export function getRomanNumeral(num: number): string {
  if (num === 0) return '0';
  const romanMap: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  let n = num;
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      result += roman;
      n -= val;
    }
  }
  return result;
}
