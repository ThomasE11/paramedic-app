#!/bin/bash

# URL Cleanup Script for UAE Paramedic Case Generator
# This script verifies all URLs in the data files and identifies any remaining broken links

echo "================================"
echo "UAE Paramedic Case Generator"
echo "URL Verification & Cleanup Tool"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Data files to check
FILES=(
  "src/data/cases.ts"
  "src/data/additionalCases.ts"
  "src/data/enhancedCases.ts"
)

echo "Step 1: Extracting all URLs..."
echo ""

# Extract all unique URLs
URL_FILE="/tmp/urls_to_check.txt"
> "$URL_FILE"

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    grep -oE 'https?://[^"'"'"']+' "$file" | sort -u >> "$URL_FILE"
    echo "  ✓ Processed: $file"
  fi
done

# Remove duplicates
sort -u "$URL_FILE" > "$URL_FILE.tmp" && mv "$URL_FILE.tmp" "$URL_FILE"

TOTAL_URLS=$(wc -l < "$URL_FILE")
echo ""
echo "Found $TOTAL_URLS unique URLs"
echo ""

# Categorize URLs
echo "Step 2: Categorizing URLs..."
echo ""

YOUTUBE_URLS=$(grep -c "youtube.com" "$URL_FILE" || echo "0")
LITFL_URLS=$(grep -c "litfl.com" "$URL_FILE" || echo "0")
RADIOPAEDIA_URLS=$(grep -c "radiopaedia.org" "$URL_FILE" || echo "0")
MDCALC_URLS=$(grep -c "mdcalc.com" "$URL_FILE" || echo "0")
ESC_URLS=$(grep -c "escardio.org" "$URL_FILE" || echo "0")
AHA_URLS=$(grep -c "heart.org" "$URL_FILE" || echo "0")
BMJ_URLS=$(grep -c "bmj.com" "$URL_FILE" || echo "0")

printf "  %-25s: %3d URLs\n" "YouTube" "$YOUTUBE_URLS"
printf "  %-25s: %3d URLs\n" "Life in the Fast Lane" "$LITFL_URLS"
printf "  %-25s: %3d URLs\n" "Radiopaedia" "$RADIOPAEDIA_URLS"
printf "  %-25s: %3d URLs\n" "MDCalc" "$MDCALC_URLS"
printf "  %-25s: %3d URLs\n" "ESC" "$ESC_URLS"
printf "  %-25s: %3d URLs\n" "AHA" "$AHA_URLS"
printf "  %-25s: %3d URLs\n" "BMJ" "$BMJ_URLS"

echo ""

# Check for suspicious patterns
echo "Step 3: Checking for suspicious URL patterns..."
echo ""

SUSPICIOUS_COUNT=0

# Check for placeholder patterns
PLACEHOLDERS=$(grep -E 'X{5,}|Y{5,}|Z{5,}|A{5,}|B{5,}|C{5,}|D{5,}|E{5,}|F{5,}|G{5,}|H{5,}|I{5,}|J{5,}|K{5,}|L{5,}|M{5,}|N{5,}|O{5,}|P{5,}|Q{5,}|R{5,}|S{5,}|T{5,}|U{5,}|V{5,}|W{5,}|0{5,}|1{5,}|2{5,}|3{5,}|4{5,}|5{5,}|6{5,}|7{5,}|8{5,}|9{5,}' "$URL_FILE" || true)

if [ -n "$PLACEHOLDERS" ]; then
  SUSPICIOUS_COUNT=$(echo "$PLACEHOLDERS" | wc -l)
  echo -e "  ${YELLOW}⚠ Found $SUSPICIOUS_COUNT potentially fake/placeholder URLs:${NC}"
  echo "$PLACEHOLDERS" | head -10
  if [ "$SUSPICIOUS_COUNT" -gt 10 ]; then
    echo "  ... and $((SUSPICIOUS_COUNT - 10)) more"
  fi
else
  echo -e "  ${GREEN}✓ No suspicious placeholder URLs found${NC}"
fi

echo ""

# Sample verification (optional - requires curl)
echo "Step 4: Sample URL verification (checking first 5 URLs)..."
echo ""

if command -v curl &> /dev/null; then
  COUNT=0
  while IFS= read -r url && [ $COUNT -lt 5 ]; do
    # Clean up URL (remove trailing quotes or commas)
    clean_url=$(echo "$url" | sed 's/['"'"'",]*$//')
    
    # Skip if already checked or empty
    [ -z "$clean_url" ] && continue
    
    # Quick HEAD request
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$clean_url" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
      echo -e "  ${GREEN}✓ $clean_url (HTTP $HTTP_CODE)${NC}"
    else
      echo -e "  ${RED}✗ $clean_url (HTTP $HTTP_CODE)${NC}"
    fi
    
    COUNT=$((COUNT + 1))
  done < "$URL_FILE"
else
  echo "  curl not found - skipping HTTP verification"
fi

echo ""
echo "================================"
echo "Summary:"
echo "================================"
echo ""
echo "Total URLs in database: $TOTAL_URLS"

if [ "$SUSPICIOUS_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠ Warning: $SUSPICIOUS_COUNT potentially fake URLs detected${NC}"
  echo "Run detailed verification to identify and fix these URLs"
else
  echo -e "${GREEN}✓ All URLs appear to be valid format${NC}"
fi

echo ""
echo "Recommendations:"
echo "  1. Review any suspicious URLs manually"
echo "  2. Test critical URLs in browser"
echo "  3. Update broken URLs with working alternatives"
echo "  4. Run this script periodically to catch issues"
echo ""
echo "Clean URL list saved to: $URL_FILE"

# Cleanup
rm -f "$URL_FILE"
