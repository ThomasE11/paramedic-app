# Check URLs in enhancedCases.ts
# Usage: bash check_urls.sh

echo "Checking URLs in enhancedCases.ts..."
echo "================================"
echo ""

# Extract URLs and test them
grep -oE 'https?://[^"]+' src/data/enhancedCases.ts | sort -u | while read -r url; do
  echo -n "Testing: $url ... "
  
  # Use curl to check if URL is accessible
  status=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$url" 2>&1)
  
  if [ "$status" = "200" ] || [ "$status" = "301" ] || [ "$status" = "302" ]; then
    echo "✓ OK ($status)"
  elif [ "$status" = "403" ]; then
    echo "⚠ Forbidden ($status) - may require auth"
  elif [ "$status" = "404" ]; then
    echo "✗ Not Found ($status)"
  else
    echo "? Status $status"
  fi
done

echo ""
echo "================================"
echo "Check complete"