/**
 * sitemap.xml, rendered on request.
 *
 * Served from `src/server.ts` rather than a route file: this build of TanStack
 * Start exports no server-route factory, and our SSR entry already sees every
 * request. See the branch there.
 *
 * The static routes are always listed. Product URLs are BEST-EFFORT — the
 * lookup goes through `sellqoProxy`, which is a server function and may not be
 * invocable from the raw fetch entry depending on how it is bundled. If it is
 * not, or the tenant API is unreachable, we log once and emit a static-only
 * sitemap. A sitemap must never be able to break a request.
 */
import { SITE_URL } from "./site";

/** Public, indexable routes. Checkout is noindex and is deliberately absent. */
const STATIC_PATHS = ["/", "/shop", "/collections", "/about", "/contact"] as const;

const SECONDARY_PATHS = ["/privacy-policy", "/terms", "/shipping-returns"] as const;

type Entry = { path: string; changefreq: string; priority: string; lastmod?: string };

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry({ path, changefreq, priority, lastmod }: Entry): string {
  return [
    "  <url>",
    `    <loc>${xmlEscape(`${SITE_URL}${path}`)}</loc>`,
    lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Product paths from SellQo, or an empty list if they cannot be resolved. */
async function productEntries(): Promise<Entry[]> {
  try {
    const { sellqoProxy } = await import("./sellqo.functions");
    const raw = (await sellqoProxy({
      data: { path: "/products", method: "GET", query: { per_page: 200 } },
    })) as unknown;

    const container = raw as { products?: unknown } | unknown[];
    const list = Array.isArray(container) ? container : (container?.products ?? []);
    if (!Array.isArray(list)) return [];

    return list
      .map((p) => p as { slug?: string; updated_at?: string; updatedAt?: string })
      .filter((p) => typeof p.slug === "string" && p.slug.length > 0)
      .map((p) => ({
        path: `/product/${p.slug}`,
        changefreq: "weekly",
        priority: "0.8",
        lastmod: (p.updated_at ?? p.updatedAt)?.slice(0, 10),
      }));
  } catch (error) {
    // Never fatal: a sitemap missing its products is far better than a 500.
    console.warn("[sitemap] product lookup failed, serving static routes only:", error);
    return [];
  }
}

export async function renderSitemap(): Promise<string> {
  const entries: Entry[] = [
    ...STATIC_PATHS.map((path) => ({
      path,
      changefreq: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? "1.0" : "0.9",
    })),
    ...(await productEntries()),
    ...SECONDARY_PATHS.map((path) => ({
      path,
      changefreq: "yearly",
      priority: "0.3",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlEntry).join("\n")}
</urlset>
`;
}
