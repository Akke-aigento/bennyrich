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
