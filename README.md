# bennyrich

Zona Dorata — Fase 1 (schone Lovable-start)

Plak dit volledig als eerste prompt in een nieuw Lovable-project. Doel: homepage "Choose Your World" + sellqo-proxy fundering + één werkende categoriepagina (Perfumes) die ECHTE producten uit de SellQo-backend toont. De andere 3 categorieën worden later via hetzelfde patroon toegevoegd.

0. WAT JE BOUWT (in één zin)

Een rustige, dure, klassiek-elegante luxury webshop (ivoor/bone + goud, serif), géén animaties/WebGL, gekoppeld aan het bestaande SellQo multi-tenant platform via een sellqo-proxy edge function. EN default, NL via toggle.

1. DESIGN SYSTEM (exact, niet afwijken)

Color tokens (CSS variables):

:root{
  --bone:#F6F3EB;
  --paper:#FDFBF6;
  --ink:#1A1813;
  --gold:#B8902E;
  --gold-l:#D8B14A;
  --muted:#8A8578;
  --line:#E2DCCE;
  --black:#0E0D0C;
}


Fonts (Google Fonts):

Cormorant Garamond — alle titels, weight 500

Cinzel — merk-wordmark, letter-spacing .2em

Archivo — labels / nav / uppercase UI, letter-spacing .2em–.32em

Geen andere fonts. Body-tekst mag Archivo of Cormorant zijn (kies Archivo voor leesbaarheid in fijne tekst).

Regels:

Achtergrond standaard --paper, secties wisselen --bone/--paper.

Donkere blokken (announcement bar, trust-bar, footer) = --black.

Goud spaarzaam: accenten, lijntjes, hover-fills. Nooit grote gouden vlakken.

Ruim wit, grote marges, kalme typografie. NIET druk.

prefers-reduced-motion: alle hover-scale/transitions uit.

2. BRAND ASSETS

Upload zelf in src/assets/brand/:

logo-black.svg — gevulde facet-diamant + "ZONA DORATA" serif + "ITALIA" (lichte header)

logo-gold.svg — zelfde, goud (donkere footer)

logo-white.svg — reserve

favicon (afgeleide diamant)

Het logo bestaat als PNG; vectoriseer naar SVG voor scherpte op alle schermen.

World-beelden in src/assets/worlds/:

perfumes.jpg ✅ (bestaat)

jewellery.jpg ✅ (bestaat)

clothes.jpg ✅ (bestaat)

artworks.jpg — tijdelijke placeholder (effen --bone met gecentreerde "ARTWORKS" in Cormorant + gouden streepje). Wordt later vervangen.

3. PAGINA-STRUCTUUR (Fase 1)

/                 → Homepage: Choose Your World
/perfumes         → Categoriepagina Perfumes (ECHTE SellQo-producten)
/jewellery        → placeholder-pagina "Coming soon" (zelfde tokens)
/artworks         → placeholder-pagina "Coming soon"
/designer-clothes → placeholder-pagina "Coming soon"


Alleen /perfumes haalt echte data op. De rest is later copy-paste.

4. HOMEPAGE — secties (van boven naar onder)

Announcement bar — --black, fijne Archivo uppercase, gecentreerd (bv. "Worldwide shipping · Crafted in Italy"). Mobiel zichtbaar.

Header — logo gecentreerd; nav-links links/rechts; rechts: NL/EN-toggle + zoek-icoon + account-icoon + BAG (met item-count). Mobiel: hamburger links, logo center, BAG rechts.

Welcome — kicker (Archivo uppercase, --muted) + grote titel "Choose Your World" (Cormorant) + kleine diamant + ondertitel "Benvenuto in Zona Dorata" (Italiaans, blijft Italiaans).

De 4 Worlds — zie sectie 5 (de kern).

Trust-bar — --black, 3 kolommen (bv. Authentic · Secure payment · Fast delivery). Mobiel verborgen.

Footer — --black, 4 kolommen: SHOP / MAISON / HELP / NEWSLETTER + logo-gold. Newsletter = e-mailveld + knop (nog geen submit-logica).

5. DE HERO — "Choose Your World" (exact gedrag)

Vier categorie-kaarten. Elke kaart: productfoto als achtergrond, donkere gradient onderaan, titel ÍN het beeld, subtitel, gouden streepje, ronde pijl-knop rechtsonder.

# Beeld Titel Subtitel Link 01 perfumes.jpg PERFUMES Scents that tell your essence /perfumes 02 jewellery.jpg JEWELLERY Light · Detail · Timeless beauty /jewellery 03 artworks.jpg ARTWORKS Pieces that inspire timeless emotion /artworks 04 clothes.jpg DESIGNER CLOTHES Elegance · Style · Identity /designer-clothes

Responsive (dit is de kern, niet afwijken):

Desktop ≥769px: grid-template-columns:repeat(4,1fr); gap:14px; — 4 naast elkaar, kaart aspect-ratio ~3/4.4.

Mobiel ≤768px: grid-template-columns:1fr; gap:7px; met vaste hoogte calc(100svh - 196px) zodat alle 4 SAMEN op één viewport passen (geen scroll). Subtitels + trust-bar verbergen. Gebruik 100svh, niet 100vh.

Hover (desktop): beeld scale(1.06), pijl vult met --gold. Onder prefers-reduced-motion: geen scale, geen transition.

6. SELLQO-KOPPELING (de fundering — dit is waar het staat of valt)

Zona Dorata is een bestaande tenant op het SellQo-platform. Tenant en API key bestaan al. We bouwen meteen de proxy mee, geen losse fase.

6.1 Secrets (Lovable Cloud → nooit in code/prompt)

Maak deze env-secrets aan in Lovable Cloud:

SELLQO_BASE_URL    = <https://sellqo.app/api/storefront>
SELLQO_TENANT_ID   = <05b419c3-d9a4-4ad8-bbf0-2d1c672e266f>
SELLQO_API_KEY     = Will be given in secrets


Vul deze in via Lovable Cloud secrets nadat het project staat. NOOIT hardcoden, NOOIT in de frontend bundelen. De frontend praat ALLEEN met de proxy, nooit rechtstreeks met SellQo.

6.2 Edge function sellqo-proxy (REST → RPC)

Maak één Supabase edge function sellqo-proxy die als enige met SellQo praat. Architectuur volgt master template v2 (zelfde patroon als VanXcel/Loveke):

Frontend stuurt een action + payload naar de proxy.

Proxy mapt elke action op de juiste SellQo RPC en zet de auth-headers (SELLQO_API_KEY, SELLQO_TENANT_ID) erop. De key blijft server-side.

Proxy is een action resolver, geen domme forwarder.

Actions nodig voor Fase 1:

list_products      { category }                  → producten van een categorie
get_product        { product_id | slug }         → één product
get_cart           { session_id, cart_id? }      → huidige cart
add_to_cart        { session_id, product_id, qty }


Belangrijke patronen (uit master template v2 — niet vergeten):

Cart-identificatie: session_id met cart_id als fallback.

Betaalmethode-veld heet method.method (nested), niet plat method.

Kortingen komen terug als applied_discounts (array).

Stripe loopt via SellQo, NIET handmatig in deze app.

Als een action/RPC-naam afwijkt van wat de SellQo-backend verwacht: STOP en meld het, raad niet. De RPC-namen moeten exact matchen met de backend.

6.3 Frontend data-laag

Maak een dunne client src/lib/sellqo.ts:

listProducts(category), getProduct(idOrSlug), getCart(), addToCart(...)

Elke functie roept de sellqo-proxy edge function aan (Supabase functions invoke). Geen directe SellQo-calls.

session_id: genereer één keer per browser (localStorage), hergebruik.

7. CATEGORIEPAGINA /perfumes (echte data)

Haalt producten op via listProducts('perfumes') → sellqo-proxy → list_products.

Loading state: rustige skeletons in --bone (geen spinners).

Lege staat: elegante "No pieces available yet" in Cormorant.

Productgrid: zelfde tokens. Per kaart: foto, naam (Cormorant), prijs (Archivo), fijne --line rand. Hover: lichte lift, géén harde schaduw.

Filter de categorie correct op de SellQo-categorie/collectie die met "perfumes" overeenkomt (vraag mij de exacte category-key als die niet vanzelf uit de backend komt — niet gokken).

Klik op product → simpele productdetail (mag in deze fase basaal: foto, naam, prijs, "Add to bag"-knop die add_to_cart aanroept en de BAG-count update).

8. WAT NIET in Fase 1 zit (bewust)

Geen volledige checkout/bedankt-flow (Fase 4).

Geen jewellery/artworks/clothes productgrids (copy-paste later).

Geen newsletter-submit-logica.

Geen animaties/WebGL — ooit. Bewust verworpen.

9. DEFINITION OF DONE (Fase 1)

Homepage toont de 4 worlds, correct responsive (desktop 4-grid, mobiel alle 4 op één viewport via 100svh, geen scroll).

sellqo-proxy edge function draait, secrets server-side, frontend praat alleen met de proxy.

/perfumes toont ECHTE producten uit de SellQo-tenant.

"Add to bag" werkt: item komt in cart, BAG-count update.

Design system overal consistent (tokens, fonts, rust, goud spaarzaam).

Andere 3 categoriepagina's bestaan als nette "Coming soon" placeholders.

Eerste opdracht aan Lovable

Bouw bovenstaande. Begin met het design system + homepage + de 4 worlds, dan de sellqo-proxy edge function + src/lib/sellqo.ts, dan /perfumes op echte data. Stop en vraag mij om exacte SellQo RPC-namen of category-keys zodra je die nodig hebt — raad ze niet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2abe3881-4001-4446-9518-569d160afe93).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
