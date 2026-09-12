import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SRC_DIR = './tarot';
const DEST_DIR = './public/images/tarot';

mkdirSync(DEST_DIR, { recursive: true });

// 한글 파일명 → 영문 카드 ID 매핑
const CARD_MAP = {
  '바보': '00_fool',
  '마법사': '01_magician',
  '여사제': '02_high_priestess',
  '여황제': '03_empress',
  '황제': '04_emperor',
  '교황': '05_hierophant',
  '연인': '06_lovers',
  '전차': '07_chariot',
  '힘': '08_strength',
  '은둔자': '09_hermit',
  '운명의 수레바퀴': '10_wheel_of_fortune',
  '정의': '11_justice',
  '매달린 사람': '12_hanged_man',
  '죽음': '13_death',
  '절제': '14_temperance',
  '악마': '15_devil',
  '탑': '16_tower',
  '별': '17_star',
  '달': '18_moon',
  '태양': '19_sun',
  '심판': '20_judgement',
  '세계': '21_world',
};

let converted = 0;
let failed = 0;

for (const [koreanName, cardId] of Object.entries(CARD_MAP)) {
  const srcFile = join(SRC_DIR, `${koreanName}.jpeg`);
  const destFile = join(DEST_DIR, `${cardId}.webp`);

  if (!existsSync(srcFile)) {
    console.log(`⚠️  소스 없음: ${srcFile}`);
    failed++;
    continue;
  }

  console.log(`🔄 변환 중: ${koreanName}.jpeg → ${cardId}.webp`);

  try {
    // cwebp 변환: quality 90 (고품질), method 5 (최적 압축), sharp_yuv, 원본 해상도 유지
    execSync(`cwebp -q 90 -m 5 -sharp_yuv "${srcFile}" -o "${destFile}"`, {
      stdio: 'pipe',
    });

    const { statSync } = await import('fs');
    const srcSize = statSync(srcFile).size;
    const destSize = statSync(destFile).size;
    const ratio = ((destSize / srcSize) * 100).toFixed(1);
    console.log(
      `   ✅ 완료 (${(srcSize / 1024).toFixed(0)}KB → ${(destSize / 1024).toFixed(0)}KB, ${ratio}%)`
    );
    converted++;
  } catch (err) {
    console.log(`   ❌ 실패: ${err.message}`);
    failed++;
  }
}

console.log('');
console.log('=============================');
console.log(`✨ 변환 완료: ${converted}장 성공, ${failed}장 실패`);
console.log(`📁 저장 위치: ${DEST_DIR}`);
