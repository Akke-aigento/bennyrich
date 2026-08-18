import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { Rifle, ShhKid } from "@/assets/brand/LineArt";
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
    <section className="br-shell grid items-center gap-12 py-16 md:grid-cols-2 md:gap-10 md:py-24">
      <div>
        <h1
          className="br-display"
          style={{
            fontSize: "clamp(40px, 7vw, 88px)",
            letterSpacing: "0.1em",
            lineHeight: 1.12,
            color: "var(--br-white)",
          }}
        >
          <span
            className="block"
            style={{
              textShadow:
                "0 0 2px var(--br-blue-core), 0 0 14px color-mix(in srgb, var(--br-blue) 55%, transparent), 0 0 32px color-mix(in srgb, var(--br-blue) 30%, transparent)",
            }}
          >
            Timeless.
          </span>
          <span className="neon-text-blue block">Bold.</span>
          <span className="neon-text-pink block">Luxurious.</span>
        </h1>
        <p
          className="mt-8 max-w-[34ch] text-[15px]"
          style={{ color: "var(--br-white)", lineHeight: 1.75 }}
        >
          BennyRich is more than fashion. It's a lifestyle built on ambition, confidence and legacy.
        </p>
        <Link to="/shop" className="neon-btn mt-9">
          Shop now <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="order-first md:order-none">
        <ShhKid className="mx-auto w-full max-w-[380px] md:max-w-[440px]" />
      </div>
    </section>
  );
}

function FeaturedCollection() {
  const { products, isLoading, error } = useProducts();
  const featured = pickFeatured(products, 4);

  return (
    <section className="br-shell pb-20 pt-4 md:pb-28">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="br-nav neon-text-blue text-[12px] md:text-[13px]">Featured Collection</h2>
        <Link
          to="/shop"
          className="br-nav text-[11px] transition-opacity duration-200 hover:opacity-80 md:text-[12px]"
          style={{ color: "var(--br-pink)" }}
        >
          View all <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
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
    <section className="br-shell pb-24 md:pb-32">
      <div
        className="neon-line-pink grid items-center gap-8 border px-7 py-10 md:grid-cols-[1fr_1.1fr] md:px-14 md:py-12"
        style={{ borderRadius: "var(--radius)" }}
      >
        <div>
          <h2
            className="br-display"
            style={{
              fontSize: "clamp(22px, 3.2vw, 34px)",
              letterSpacing: "0.08em",
              lineHeight: 1.35,
            }}
          >
            <span className="neon-text-blue block">Built different.</span>
            <span className="neon-text-pink block">Made to stand out.</span>
          </h2>
          <Link to="/collections" className="neon-btn mt-8">
            Discover more <span aria-hidden>→</span>
          </Link>
        </div>
        <Rifle className="w-full" />
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
