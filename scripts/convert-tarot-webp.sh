#!/bin/bash
# 타로 카드 JPEG → WebP 변환 스크립트
# 고품질 유지 (quality 90, method 5)

set -e

SRC_DIR="./tarot"
DEST_DIR="./public/images/tarot"

mkdir -p "$DEST_DIR"

# 한글 파일명 → 영문 카드 ID 매핑
declare -A CARD_MAP=(
  ["바보"]="00_fool"
  ["마법사"]="01_magician"
  ["여사제"]="02_high_priestess"
  ["여황제"]="03_empress"
  ["황제"]="04_emperor"
  ["교황"]="05_hierophant"
  ["연인"]="06_lovers"
  ["전차"]="07_chariot"
  ["힘"]="08_strength"
  ["은둔자"]="09_hermit"
  ["운명의 수레바퀴"]="10_wheel_of_fortune"
  ["정의"]="11_justice"
  ["매달린 사람"]="12_hanged_man"
  ["죽음"]="13_death"
  ["절제"]="14_temperance"
  ["악마"]="15_devil"
  ["탑"]="16_tower"
  ["별"]="17_star"
  ["달"]="18_moon"
  ["태양"]="19_sun"
  ["심판"]="20_judgement"
  ["세계"]="21_world"
)

CONVERTED=0
FAILED=0

for korean_name in "${!CARD_MAP[@]}"; do
  card_id="${CARD_MAP[$korean_name]}"
  src_file="$SRC_DIR/${korean_name}.jpeg"
  dest_file="$DEST_DIR/${card_id}.webp"
  
  if [ ! -f "$src_file" ]; then
    echo "⚠️  소스 없음: $src_file"
    FAILED=$((FAILED + 1))
    continue
  fi
  
  echo "🔄 변환 중: ${korean_name}.jpeg → ${card_id}.webp"
  
  # cwebp 변환: quality 90 (고품질), method 5 (최적 압축), 원본 해상도 유지
  cwebp -q 90 -m 5 -sharp_yuv -metadata all "$src_file" -o "$dest_file" 2>/dev/null
  
  if [ $? -eq 0 ]; then
    src_size=$(stat -f%z "$src_file" 2>/dev/null || stat --printf="%s" "$src_file")
    dest_size=$(stat -f%z "$dest_file" 2>/dev/null || stat --printf="%s" "$dest_file")
    ratio=$(echo "scale=1; $dest_size * 100 / $src_size" | bc)
    echo "   ✅ 완료 ($(echo "scale=0; $src_size / 1024" | bc)KB → $(echo "scale=0; $dest_size / 1024" | bc)KB, ${ratio}% 크기)"
    CONVERTED=$((CONVERTED + 1))
  else
    echo "   ❌ 실패: $src_file"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "============================="
echo "✨ 변환 완료: ${CONVERTED}장 성공, ${FAILED}장 실패"
echo "📁 저장 위치: $DEST_DIR"
ls -lh "$DEST_DIR"/*.webp 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'
