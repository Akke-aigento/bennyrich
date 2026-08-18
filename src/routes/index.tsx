import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Diamond } from "@/components/site/Diamond";
import { sellqoFetch } from "@/lib/sellqo";
import perfumesAsset from "@/assets/worlds/perfumes.png.asset.json";
import jewelleryAsset from "@/assets/worlds/jewellery.png.asset.json";
import clothesAsset from "@/assets/worlds/clothes.png.asset.json";
import artworksAsset from "@/assets/worlds/artworks.png.asset.json";
import selfcareAsset from "@/assets/worlds/selfcare.jpg.asset.json";
import heroBannerAsset from "@/assets/hero/perfume-banner.jpg.asset.json";

const perfumesImg = perfumesAsset.url;
const jewelleryImg = jewelleryAsset.url;
const clothesImg = clothesAsset.url;
const artworksImg = artworksAsset.url;
const selfcareImg = selfcareAsset.url;
const heroBannerImg = heroBannerAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zona Dorata — Choose Your World" },
      {
        name: "description",
        content:
          "Milanese luxury: perfumes, jewellery, artworks and designer clothes. Benvenuto in Zona Dorata.",
      },
      { property: "og:title", content: "Zona Dorata — Choose Your World" },
      {
        property: "og:description",
        content: "A calm Italian luxury boutique. Choose your world.",
      },
    ],
  }),
  component: Index,
});

type World = {
  index: string;
  title: string;
  subtitle: string;
  description: string;
  to: "/perfumes" | "/jewellery" | "/artworks" | "/designer-clothes" | "/selfcare";
  image: string | null;
};

const worlds: World[] = [
  { index: "01", title: "Perfumes", subtitle: "Scents that tell your essence", description: "Exceptional scents crafted with rare ingredients. Timeless emotions, bottled.", to: "/perfumes", image: perfumesImg },
  { index: "02", title: "Jewellery", subtitle: "Light · Detail · Timeless beauty", description: "Precious details. Timeless designs made to be worn and cherished.", to: "/jewellery", image: jewelleryImg },
  { index: "03", title: "Artworks", subtitle: "Pieces that inspire timeless emotion", description: "Original pieces that inspire and transform spaces. Where emotion becomes a masterpiece.", to: "/artworks", image: artworksImg },
  { index: "04", title: "Designer Clothes", subtitle: "Elegance · Style · Identity", description: "Refined fabrics. Impeccable cuts. Crafted for a modern and timeless identity.", to: "/designer-clothes", image: clothesImg },
  { index: "05", title: "Selfcare", subtitle: "Nourish · Elevate · Reflect", description: "Nourish your body. Elevate your routine. Care that reflects who you are.", to: "/selfcare", image: selfcareImg },
];

function HeroBanner() {
  return (
    <section
      className="relative overflow-hidden zd-hero"
      style={{ background: "var(--black)" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center zd-hero-img"
        style={{ backgroundImage: `url(${heroBannerImg})` }}
        aria-hidden
      />
      <div className="absolute inset-0 zd-hero-veil" aria-hidden />
      <div className="relative mx-auto flex w-full max-w-[1280px] items-end px-6 py-14 md:items-center md:py-28">
        <div className="max-w-[520px] zd-hero-copy">
          <p
            className="ui-label text-[0.62rem] md:text-[0.68rem]"
            style={{ color: "var(--gold)", letterSpacing: "0.34em" }}
          >
            ZONA DORATA
          </p>
          <h1
            className="mt-4 text-[1.9rem] md:mt-6 md:text-[3.25rem]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--bone)",
              fontWeight: 500,
              lineHeight: 1.12,
            }}
          >
            The Art of{" "}
            <span style={{ color: "var(--gold)" }}>Italian Luxury</span>
          </h1>
          <p
            className="mt-4 text-[0.85rem] md:mt-6 md:text-[1rem]"
            style={{
              color: "rgba(245,238,224,0.78)",
              fontFamily: "var(--font-body)",
              lineHeight: 1.7,
            }}
          >
            Discover handcrafted perfumes inspired by timeless elegance.
          </p>
          <Link
            to="/perfumes"
            className="ui-label mt-7 inline-block text-[0.65rem] transition-colors duration-500 hover:bg-[var(--gold)] hover:text-[var(--black)] motion-reduce:transition-none md:mt-9 md:text-[0.7rem]"
            style={{
              color: "var(--gold)",
              border: "1px solid var(--gold)",
              padding: "13px 26px",
              letterSpacing: "0.24em",
            }}
          >
            SHOP PERFUMES →
          </Link>
        </div>
      </div>
    </section>
  );
}

function WorldCard({ world }: { world: World }) {
  return (
    <Link
      to={world.to}
      className="group relative block overflow-hidden zd-world-card"
      style={{ background: "var(--bone)" }}
    >
      {world.image ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 motion-reduce:transition-none group-hover:scale-[1.06]"
          style={{ backgroundImage: `url(${world.image})` }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "var(--bone)" }}>
          <h3 className="text-[2rem]" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
            {world.title.toUpperCase()}
          </h3>
          <div className="mt-4" style={{ width: 40, height: 1, background: "var(--gold)" }} />
        </div>
      )}
      <div
        className="absolute inset-x-0 bottom-0 top-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.15) 50%, transparent)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 md:p-6">
        <div>
          <div style={{ width: 32, height: 2, background: "var(--gold)" }} />
          <h3
            className="mt-3 brand-wordmark text-[0.85rem] md:mt-4 md:text-[1rem]"
            style={{ color: "var(--bone)" }}
          >
            {world.title.toUpperCase()}
          </h3>
          <p
            className="mt-1 text-[0.7rem] zd-world-sub md:mt-2 md:text-[0.75rem]"
            style={{ color: "rgba(245,238,224,0.7)", fontFamily: "var(--font-body)" }}
          >
            {world.subtitle}
          </p>
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center transition-colors duration-500 group-hover:bg-[var(--gold)] motion-reduce:transition-none md:h-11 md:w-11"
          style={{ border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%", color: "var(--bone)" }}
          aria-hidden
        >
          →
        </div>
      </div>
      <span className="sr-only">{world.title}</span>
    </Link>
  );
}

function WorldRowMobile({ world }: { world: World }) {
  return (
    <Link
      to={world.to}
      className="flex items-stretch gap-3 pr-4"
      style={{ background: "#fff" }}
    >
      {world.image && (
        <div
          className="shrink-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${world.image})`,
            width: "40%",
            aspectRatio: "5 / 6",
          }}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center py-2">
        <div
          className="text-[0.6rem]"
          style={{ color: "var(--gold)", fontFamily: "var(--font-body)", letterSpacing: "0.14em" }}
        >
          {world.index}
        </div>
        <div style={{ width: 16, height: 1, background: "var(--gold)", marginTop: 3 }} />
        <h3
          className="text-[1rem]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "0.04em",
            marginTop: 8,
          }}
        >
          {world.title.toUpperCase()}
        </h3>
        <p
          className="text-[0.68rem]"
          style={{
            color: "var(--muted-tone)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.4,
            marginTop: 6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {world.description}
        </p>
        <div
          className="inline-flex items-center gap-1.5 self-start text-[0.55rem]"
          style={{
            color: "var(--ink)",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.2em",
            borderBottom: "1px solid var(--ink)",
            paddingBottom: 2,
            marginTop: 9,
          }}
        >
          DISCOVER THE COLLECTION <span aria-hidden>→</span>
        </div>
      </div>
    </Link>
  );
}

function Index() {
  const categoriesQuery = useQuery({
    queryKey: ["sellqo", "categories"],
    queryFn: () =>
      sellqoFetch<any>("/categories"),
    staleTime: 5 * 60_000,
  });
  const remoteImageBySlug = new Map<string, string>();
  const raw = categoriesQuery.data as any;
  const list: any[] = Array.isArray(raw) ? raw : raw?.categories ?? [];
  for (const c of list) {
    if (c?.slug && typeof c.image_url === "string" && c.image_url.trim()) {
      remoteImageBySlug.set(c.slug, c.image_url);
    }
  }
  const resolvedWorlds = worlds.map((w) => {
    const slug = w.to.replace(/^\//, "");
    const remote = remoteImageBySlug.get(slug);
    return remote ? { ...w, image: remote } : w;
  });

  return (
    <SiteLayout>
      <HeroBanner />

      {/* Welcome — desktop only */}
      <section className="hidden text-center md:block md:pt-16 md:pb-8" style={{ background: "#fff" }}>
        <p
          className="ui-label text-[0.65rem] md:text-[0.7rem]"
          style={{ color: "var(--muted-tone)", letterSpacing: "0.32em" }}
        >
          Luxury Italian Lifestyle
        </p>
        <h1
          className="mt-3 text-[1.25rem] md:mt-6 md:text-[3rem]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)", fontWeight: 500 }}
        >
          Choose Your World
        </h1>
        <div className="my-2 flex justify-center md:my-4">
          <Diamond size={16} />
        </div>
        <p
          className="hidden text-[0.9rem] italic md:block md:text-[1.1rem]"
          style={{ fontFamily: "var(--font-display)", color: "var(--muted-tone)" }}
        >
          Benvenuto in Zona Dorata
        </p>
      </section>

      {/* Worlds — mobile: editorial rows */}
      <section className="md:hidden" style={{ background: "#fff" }}>
        {resolvedWorlds.map((w, i) => (
          <div
            key={w.title}
            style={i > 0 ? { borderTop: "1px solid var(--line)" } : undefined}
          >
            <WorldRowMobile world={w} />
          </div>
        ))}
      </section>

      {/* Worlds — desktop: existing grid */}
      <section className="zd-worlds hidden md:grid">
        {resolvedWorlds.map((w) => (
          <WorldCard key={w.title} world={w} />
        ))}
      </section>

      <style>{`
        .zd-hero { display: flex; min-height: 460px; animation: zd-fade 900ms ease-out both; }
        .zd-hero-veil {
          background: linear-gradient(to top, rgba(8,7,6,0.92) 10%, rgba(8,7,6,0.55) 55%, rgba(8,7,6,0.25));
        }
        @media (min-width: 768px) {
          .zd-hero { min-height: 560px; }
          .zd-hero-veil {
            background: linear-gradient(to right, rgba(8,7,6,0.92) 30%, rgba(8,7,6,0.6) 58%, rgba(8,7,6,0.15));
          }
        }
        @keyframes zd-fade { from { opacity: 0 } to { opacity: 1 } }
        @media (prefers-reduced-motion: reduce) { .zd-hero { animation: none } }
        .zd-worlds {
          gap: 14px;
          grid-template-columns: repeat(2, 1fr);
          padding: 0 24px 96px;
        }
        @media (min-width: 1024px) { .zd-worlds { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1400px) { .zd-worlds { grid-template-columns: repeat(5, 1fr); } }
        .zd-world-card { height: auto; aspect-ratio: 3 / 4.4; }
        .zd-world-sub { display: none; }
        @media (min-width: 769px) {
          .zd-world-sub { display: block; }
        }
      `}</style>
    </SiteLayout>
  );
}
