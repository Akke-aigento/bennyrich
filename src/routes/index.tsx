import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { Spotlight } from "@/components/kit/Spotlight";
import { SpotlightCard } from "@/components/kit/SpotlightCard";
import { TextReveal } from "@/components/kit/TextReveal";
import { pickFeatured, useProducts } from "@/lib/use-sellqo";

/**
 * The hero figure is the LCP element. It carries `fetchPriority="high"`, from
 * which React 19 hoists its own <link rel="preload" as="image" fetchpriority="high">
 * into the head — verified in the SSR output. An explicit preload in head()
 * here only duplicated it at a *lower* priority, so it was removed.
 */
const HERO_FIGURE = "/hero/shh-kid-figure.png";

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
    // Full-bleed ground so the ambient light spans the viewport, with the
    // content held inside the shell on top of it.
    <section className="relative overflow-hidden">
      <Spotlight />

      <div className="br-shell relative z-10 grid items-center gap-14 py-20 md:min-h-[86vh] md:grid-cols-2 md:gap-12 md:py-0">
        <div>
          <h1
            className="br-display"
            style={{
              fontSize: "clamp(36px, 6vw, 76px)",
              letterSpacing: "0.1em",
              lineHeight: 1.14,
            }}
          >
            <TextReveal>
              <span className="neon-hero-white block">Timeless.</span>
              <span className="neon-hero-blue block">Bold.</span>
              <span className="neon-hero-pink block">Luxurious.</span>
            </TextReveal>
          </h1>
          <p
            className="mt-10 max-w-[34ch] text-[15px]"
            style={{ color: "var(--br-white)", lineHeight: 1.8 }}
          >
            BennyRich is more than fashion. It's a lifestyle built on ambition, confidence and
            legacy.
          </p>
          <Link to="/shop" className="neon-btn mt-11">
            Shop now <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="order-first md:order-none">
          {/* The artwork carries its own glow — no neon filter on top of it. */}
          <img
            src={HERO_FIGURE}
            alt="The BennyRich kid in a BENNYRICH bucket hat, finger held to his lips"
            width={787}
            height={872}
            loading="eager"
            fetchPriority="high"
            className="mx-auto h-[58vw] w-auto object-contain md:mr-0 md:ml-auto md:h-[72vh]"
          />
        </div>
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

      {/* The p-3 on each card is what the cursor glow breathes into, so the
          grid gaps are reduced by exactly that much to keep BR-2.1's rhythm:
          0 + 12 + 12 = the old 24px, 24 + 12 + 12 = the old 48px, and
          8 + 12 + 12 = the old 32px at md. */}
      <div className="mt-9 grid grid-cols-2 gap-x-0 gap-y-6 md:grid-cols-4 md:gap-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3">
              <ProductCardSkeleton />
            </div>
          ))
        ) : error ? (
          <p className="col-span-full py-10 text-[13px]" style={{ color: "var(--br-mute)" }}>
            {(error as Error).message || "Unable to load products right now."}
          </p>
        ) : featured.length === 0 ? (
          <p className="col-span-full py-10 text-[13px]" style={{ color: "var(--br-mute)" }}>
            No pieces available yet.
          </p>
        ) : (
          featured.map((p) => (
            <SpotlightCard key={p.id} className="p-3">
              <ProductCard product={p} />
            </SpotlightCard>
          ))
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
        className="quiet-frame grid items-center gap-12 border px-8 py-16 md:grid-cols-[1fr_minmax(0,46%)] md:px-20 md:py-24"
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
        {/* The radial mask dissolves the artwork's square edge into the black
            instead of letting it cut a visible box out of the panel. */}
        <img
          src="/hero/panther-blue.png"
          alt="The BennyRich panther, reclining, in neon blue"
          width={875}
          height={673}
          loading="lazy"
          className="w-full max-w-[300px] justify-self-center md:max-w-none md:justify-self-end"
          style={{
            maskImage: "radial-gradient(ellipse at center, #000 62%, transparent 92%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, #000 62%, transparent 92%)",
          }}
        />
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
