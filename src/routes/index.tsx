import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { Panther, ShhKid } from "@/assets/brand/LineArt";
import { pickFeatured, useProducts } from "@/lib/use-sellqo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BennyRich — Timeless. Bold. Luxurious." },
      {
        name: "description",
        content:
          "BennyRich is more than fashion. It's a lifestyle built on ambition, confidence and legacy.",
      },
    ],
  }),
  component: Index,
});

function Hero() {
  return (
    <section className="br-shell grid items-center gap-14 py-20 md:min-h-[86vh] md:grid-cols-2 md:gap-12 md:py-0">
      <div>
        <h1
          className="br-display"
          style={{
            fontSize: "clamp(36px, 6vw, 76px)",
            letterSpacing: "0.1em",
            lineHeight: 1.14,
          }}
        >
          <span className="neon-hero-white block">Timeless.</span>
          <span className="neon-hero-blue block">Bold.</span>
          <span className="neon-hero-pink block">Luxurious.</span>
        </h1>
        <p
          className="mt-10 max-w-[34ch] text-[15px]"
          style={{ color: "var(--br-white)", lineHeight: 1.8 }}
        >
          BennyRich is more than fashion. It's a lifestyle built on ambition, confidence and legacy.
        </p>
        <Link to="/shop" className="neon-btn mt-11">
          Shop now <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="order-first md:order-none">
        <ShhKid className="mx-auto w-full max-w-[340px] md:max-w-[400px]" />
      </div>
    </section>
  );
}

function FeaturedCollection() {
  const { products, isLoading, error } = useProducts();
  const featured = pickFeatured(products, 4);

  return (
    <section className="br-shell br-section">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="br-section-label neon-text-blue">Featured Collection</h2>
        <Link
          to="/shop"
          className="br-section-label transition-opacity duration-200 hover:opacity-70"
          style={{ color: "var(--br-pink)" }}
        >
          View all <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : error ? (
          <p className="col-span-full py-10 text-[13px]" style={{ color: "var(--br-mute)" }}>
            {(error as Error).message || "Unable to load products right now."}
          </p>
        ) : featured.length === 0 ? (
          <p className="col-span-full py-10 text-[13px]" style={{ color: "var(--br-mute)" }}>
            No pieces available yet.
          </p>
        ) : (
          featured.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </section>
  );
}

function BuiltDifferentBanner() {
  return (
    <section className="br-shell br-section-b">
      {/* No neon frame. A hairline and a lot of black do the work the pink
          border used to do far too loudly. */}
      <div
        className="quiet-frame grid items-center gap-12 border px-8 py-16 md:grid-cols-[1fr_auto] md:px-20 md:py-24"
        style={{ borderRadius: "var(--radius)" }}
      >
        <div>
          <h2
            className="br-display"
            style={{
              fontSize: "clamp(20px, 2.7vw, 29px)",
              letterSpacing: "0.09em",
              lineHeight: 1.45,
            }}
          >
            <span className="neon-text-blue block">Built different.</span>
            <span className="neon-text-pink block">Made to stand out.</span>
          </h2>
          <Link to="/collections" className="neon-btn mt-10">
            Discover more <span aria-hidden>→</span>
          </Link>
        </div>
        <Panther className="w-full max-w-[300px] justify-self-center md:max-w-[380px] md:justify-self-end" />
      </div>
    </section>
  );
}

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <FeaturedCollection />
      <BuiltDifferentBanner />
    </SiteLayout>
  );
}
