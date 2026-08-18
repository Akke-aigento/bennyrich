## Doel
Sellqo levert per (sub)categorie een `image_url`. Nu wordt die nergens gebruikt: subcategorie-tegels zijn alleen tekst, en de vier "worlds" op de home gebruiken lokale assets. Wanneer Sellqo een afbeelding aanlevert, tonen we die.

## Wijzigingen

**1. `src/components/site/CategoryProductsPage.tsx` — subcategorie-tegels**
- `SellqoCategory` type uitbreiden met `image_url?: string`.
- `SubcategoryTile` accepteert `imageUrl`. Als aanwezig:
  - Full-bleed achtergrondafbeelding (`bg-cover bg-center`) binnen dezelfde tegel-hoogte.
  - Donkere gradient-overlay onderaan voor leesbaarheid.
  - Naam + count + "EXPLORE →" in bone/goud bovenop de foto (huidige layout, licht aangepaste kleuren).
- Zonder `image_url`: huidige tekstuele tegel blijft ongewijzigd (fallback).

**2. `src/routes/index.tsx` — worlds op home (categorieën)**
- Sellqo-categorieën ophalen (zelfde `["sellqo","categories"]` query, `staleTime: 5 min`).
- Per world de bijbehorende Sellqo-categorie matchen op slug (`perfumes`, `jewellery`, `artworks`, `designer-clothes`).
- Als de matchende categorie een niet-lege `image_url` heeft → die gebruiken in plaats van het lokale asset, zowel voor `WorldCard` (desktop) als `WorldRowMobile` (mobile).
- Anders fallback op de huidige lokale assets (`perfumesImg`, `jewelleryImg`, `clothesImg`, `artworksImg`).
- Layout, typografie, spacing en scheidingslijntjes blijven ongewijzigd.

## Niet veranderen
- SellQo proxy/functions, cart, product-pages.
- Splash, header, footer.
- Bestaande lokale world-assets (blijven als fallback).