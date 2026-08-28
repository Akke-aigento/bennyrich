import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { canonical } from "@/lib/site";
import { CategoryProductsPage } from "@/components/site/CategoryProductsPage";

type ShopSearch = { category?: string; q?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — BennyRich" },
      {
        name: "description",
        content: "Every BennyRich piece: apparel, accessories, home, lighting and beverages.",
      },
    ],
    links: [canonical("/shop")],
  }),
  component: ShopPage,
});

type ShopHeader = { eyebrow: string; title: string; lede: string };

/** The unfiltered shop, and the fallback for any slug we do not recognise. */
const DEFAULT_HEADER: ShopHeader = {
  eyebrow: "All pieces",
  title: "Shop",
  lede: "Built for people who stand out. Every drop, in one place.",
};

/**
 * Per-category header copy, keyed by the slugs in src/lib/categories.ts.
 *
 * The eyebrow stays "Shop" and the title carries the category name, mirroring
 * the default's descriptor-over-page-name shape rather than printing the same
 * word twice.
 *
 * These are CATEGORIES and nothing grander — see the copy rules in CLAUDE.md.
 * The ledes describe the pieces and promise no service: no shipping, returns,
 * ratings or "new arrivals", none of which this tenant can honour yet.
 *
 * Not `BrCategory.blurb`: that copy belongs to the /collections tiles and is
 * written for a different slot. Two surfaces, two voices, one source of slugs.
 */
const CATEGORY_HEADERS: Record<string, ShopHeader> = {
  apparel: {
    eyebrow: "Shop",
    title: "Apparel",
    lede: "Heavyweight tees and hoodies, built to stand out.",
  },
  accessories: {
    eyebrow: "Shop",
    title: "Accessories",
    lede: "The finishing touches — caps, prints and more.",
  },
  home: {
    eyebrow: "Shop",
    title: "Home",
    lede: "Statement pieces for spaces that don't blend in.",
  },
  lighting: {
    eyebrow: "Shop",
    title: "Lighting",
    lede: "Neon-lit 3D lamps that set the mood.",
  },
  beverages: {
    eyebrow: "Shop",
    title: "Beverages",
    lede: "The bottle of the house. 18+.",
  },
};

function ShopPage() {
  const { category, q } = Route.useSearch();
  const navigate = useNavigate();

  // A search keeps the default header: CategoryProductsPage already prints
  // `Results for "…"` under the chips, so the context is not lost, and a
  // query is not a category.
  const header = (category && CATEGORY_HEADERS[category]) || DEFAULT_HEADER;

  return (
    <CategoryProductsPage
      eyebrow={header.eyebrow}
      title={header.title}
      lede={header.lede}
      category={category}
      search={q}
      onSelectCategory={(slug) =>
        navigate({
          to: "/shop",
          search: { ...(slug ? { category: slug } : {}), ...(q ? { q } : {}) },
        })
      }
    />
  );
}
