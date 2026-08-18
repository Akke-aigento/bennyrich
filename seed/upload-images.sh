#!/usr/bin/env bash
# BennyRich seed images → Supabase storage (bucket product-images, prefix = tenant id)
# Usage: SUPABASE_SERVICE_ROLE_KEY=... ./upload-images.sh
set -euo pipefail
PROJECT=gczmfcabnoofnmfpzeop
TENANT=6dc06df8-d871-4424-a3a4-22fc446ea64a
: "${SUPABASE_SERVICE_ROLE_KEY:?set SUPABASE_SERVICE_ROLE_KEY}"
cd "$(dirname "$0")/images"
for f in *.jpg; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
    "https://$PROJECT.supabase.co/storage/v1/object/product-images/$TENANT/$f" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: image/jpeg" -H "x-upsert: true" --data-binary "@$f")
  echo "$code  $f"
done
echo "check: https://$PROJECT.supabase.co/storage/v1/object/public/product-images/$TENANT/shh-tee-blue.jpg"
