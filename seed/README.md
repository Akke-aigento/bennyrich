# BennyRich seed bundle — 2026-08-18

Tenant: 6dc06df8-d871-4424-a3a4-22fc446ea64a (slug bennyrich, tenant_admin = sander.mancini@hotmail.be)
Lovable project: 2abe3881-4001-4446-9518-569d160afe93 (remix van zona-dorata 19045cee)

## Lovable Cloud secrets (bennyrich project)
SELLQO_TENANT_ID = 6dc06df8-d871-4424-a3a4-22fc446ea64a
SELLQO_API_KEY   = (opgeslagen als Lovable Cloud secret, niet in de repo)
SELLQO_API_URL   = https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-api
(key_prefix sk_live_5977, storefront_api_keys.id 99c111ca-6c16-4e61-aec0-24a764cd3c3c)

## Images
./images/*.jpg  → run ./upload-images.sh met SUPABASE_SERVICE_ROLE_KEY (Claude Code / lokaal).
DB verwijst al naar https://gczmfcabnoofnmfpzeop.supabase.co/storage/v1/object/public/product-images/<tenant>/<file>.jpg
./brand/  → logo-blue.jpg, logo-pink.jpg, website-mock.jpg (voor de repo, niet voor storage)

## DB seed (uitgevoerd via connector, idempotent)
seed_compact.sql — 5 categorieën, 20 producten, 77 varianten, 20 product_categories.
Open: br-sunglasses heeft geen beeld (stock 0). Vodka stock 0 (accijns TBD).
