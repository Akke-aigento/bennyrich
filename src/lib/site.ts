/**
 * Site-level constants for absolute URLs.
 *
 * Canonical links and og:image must be ABSOLUTE — crawlers and social scrapers
 * resolve them against nothing, and a relative path silently produces a broken
 * share preview. Everything that needs an origin derives it from here.
 *
 * >>> SITE_URL IS THE ONE LINE TO CHANGE WHEN THE REAL DOMAIN LANDS. <<<
 *
 * It currently points at the Lovable preview host, inferred from the
 * Cloudflare worker name (`akke-aigento-bennyrich`) because nothing in the repo
 * records the deployed origin. If that is wrong, canonicals and share previews
 * point at the wrong host until this string is corrected — nothing else needs
 * touching.
 */
export const SITE_URL = "https://akke-aigento-bennyrich.lovable.app";

export const SITE_NAME = "BennyRich";

/**
 * The BR-12 homepage, behind one line.
 *
 * The rebuilt homepage is a go/no-go on the client's taste, not a refactor, so
 * it has to come back out in ONE move rather than by unpicking five commits.
 *
 *   true  -> Hero, FeaturedCollection, VodkaSpotlight, CategoryTiles,
 *            BrandStatement, BuiltDifferentBanner
 *   false -> the pre-BR-12 page, unchanged: Hero, FeaturedCollection,
 *            VodkaSpotlight, BuiltDifferentBanner
 *
 * BR-14 moved CategoryTiles below VodkaSpotlight and put the banner behind
 * SHOW_RIFLE_BANNER; the true arm above is the order that actually ships.
 *
 * The `false` arm renders the ORIGINAL components untouched —
 * FeaturedCollection, VodkaSpotlight and BuiltDifferentBanner were edited by
 * neither BR-12 nor BR-14. That is what makes this an escape hatch rather than
 * a reconstruction, and it is why they must stay untouched: the moment one of
 * them is "tidied up", flipping this to false no longer restores what the
 * client last approved.
 *
 * THE ONE SANCTIONED EXCEPTION: BR-14 gave `Hero` a single optional `cta` prop
 * whose default IS the original "Shop now" button. HomeV1 calls `<Hero />`, so
 * the false arm renders exactly what it always did. That default is
 * load-bearing — never move it, and never refactor the shared JSX around it.
 * The reasoning is written up in docs/role-audit.md, BR-14.
 *
 * Rejecting the new homepage = set this to false. Accepting it = delete the
 * flag and the false branch in src/routes/index.tsx.
 */
export const HOME_V2 = true;

/**
 * The hero's call to action, behind one line. BR-14, at Sander's request: the
 * single "Shop now" button becomes a row of category links.
 *
 *   true  -> a row of pills: All, then the five CATEGORIES
 *   false -> the original single "Shop now" button, unchanged
 *
 * A bet on the client's taste, so it reverts in one line like HOME_V2. The
 * false arm is not a COPY of the button — it is the button, via the default on
 * `Hero`'s `cta` prop, so the two states cannot drift apart.
 *
 * V2-ONLY: HomeV1 calls `<Hero />` with no cta and is unaffected either way.
 *
 * Accepting it = delete this flag, pass the nav unconditionally, and drop the
 * default from `Hero`.
 */
export const HERO_CATEGORY_NAV = true;

/**
 * The "Built different" rifle banner. BR-14: Sander asked for it OFF the
 * homepage.
 *
 * HIDDEN, NOT DELETED — the slot is meant to be reused, so BuiltDifferentBanner
 * and public/hero/rifle-blue.png both stay in the repo, intact.
 *
 * V2-ONLY, and that matters: HomeV1 renders the banner unconditionally, so the
 * HOME_V2 escape hatch still restores exactly what the client approved. Never
 * move this test inside BuiltDifferentBanner — an early `return null` there
 * would strip the banner from the false arm too.
 *
 * IT ALSO CLOSES A STANDING FLAG. Firearm imagery on the landing page has been
 * an open ad-policy exposure since BR-2.1: Meta and TikTok both review the
 * landing page, not just the creative, so anything pointing paid social at `/`
 * inherits it. It was reinstated at Sander's documented request and carried
 * forward as "still open" ever since. While this is false, `/` is ad-safe —
 * turning it back on reopens that exposure. Read docs/role-audit.md first.
 */
export const SHOW_RIFLE_BANNER = false;

/**
 * Where a shopper reaches BennyRich. One place, so the next change is one line.
 *
 * The Instagram handle came in as a share link with an `?igsi=` tracking
 * parameter attached; that is a referral token, not part of the profile URL,
 * and it is stripped.
 *
 * Instagram is the only social channel on the site. The second one that used to
 * sit beside it in the footer was removed at the client's request in BR-12 —
 * see docs/role-audit.md before adding another.
 */
export const CONTACT_EMAIL = "info@bennyrich.com";
export const INSTAGRAM_URL = "https://www.instagram.com/bennyrichstore";

/** The site-wide share image, used when a page has nothing more specific. */
export const DEFAULT_OG_IMAGE = "/hero/og-image.jpg";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Absolute URL for a site-relative path. Passes through URLs that are already absolute. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Canonical link descriptor for a route path. */
export function canonical(path: string) {
  return { rel: "canonical", href: absoluteUrl(path) };
}

/**
 * Plain-text summary for a meta description: strips tags, collapses
 * whitespace, and truncates on a word boundary so a description never ends
 * mid-word or leaks markup into a search result.
 */
export function metaDescription(input: string | undefined | null, max = 155): string | null {
  if (!input) return null;
  const text = input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\s]+$/, "")}…`;
}
