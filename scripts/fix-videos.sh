#!/usr/bin/env bash
set -e

VIDEO_DIR="public/video"
BASE_URL="https://media.githubusercontent.com/media/karmakarrohan45-art/portfolio/main/public/video"

FILES=(
  "reve8-saas-promo-50s.mp4"
  "reve8-saas-promo-25s.mp4"
  "smoky-effect.mp4"
)

for fname in "${FILES[@]}"; do
  file="$VIDEO_DIR/$fname"
  if [ -f "$file" ] && head -c 100 "$file" | grep -q "version https://git-lfs"; then
    echo "LFS pointer detected for $fname — downloading actual content..."
    curl -sL "$BASE_URL/$fname" -o "$file"
    echo "Downloaded $fname ($(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null) bytes)"
  else
    echo "$fname: OK"
  fi
done
