/**
 * /kit — BR-3 design-kit preview. THROWAWAY.
 *
 * A judging surface for Akke and Sander, not a homepage proposal and not a
 * design-system page. It shows each vendored component from
 * src/components/kit/ in isolation, on real BennyRich content, so the question
 * "does this lift us to maison quality, on our stack?" can be answered by
 * looking rather than arguing.
 *
 * Deliberately NOT linked from the nav (see NAV in components/site/Header.tsx)
 * and marked noindex.
 *
 * Product data is a static local const, not a sellqoProxy call. The page
 * proves the components; wiring it to the API would add a mock-server
 * dependency to every screenshot for no extra signal. No SellQo plumbing is
 * imported here.
 */
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ShhKid } from "@/assets/brand/LineArt";
import { formatEUR } from "@/lib/format";
import { Spotlight } from "@/components/kit/spotlight-new";
import { CardSpotlight } from "@/components/kit/card-spotlight";
import { TextGenerateEffect } from "@/components/kit/text-generate-effect";
import { InfiniteMovingCards } from "@/components/kit/infinite-moving-cards";
// import { BackgroundBeams } from "@/components/kit/background-beams";
//   ^ Vendored and recoloured, parked for a BR-4 trial. Drop it into a section
//     with `relative overflow-hidden` to see it. Left out here because the
//     spotlight already answers the "ambient light behind the hero" question
//     and two light treatments on one page would muddy the judgement.

export const Route = createFileRoute("/kit")({
  head: () => ({
    meta: [
      { title: "Design kit — BennyRich (internal preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: KitPage,
});

/** Real catalogue entries (seed/spec.json), with the committed cover images. */
const KIT_PRODUCTS = [
  { name: "Panther Tee", price: 79.99, image: "/products/panther-tee-blue.jpg" },
  { name: "Countach Hoodie", price: 129.99, image: "/products/countach-hoodie-blue.jpg" },
  // Deliberately NOT Monogram Puffer / F8 Tee / Bust Tee / Vault Cushion: those
  // four seed images still have white backgrounds (corner luma 239-255) and blow
  // a hole in the black canvas. See docs/role-audit.md.
  { name: "BR Cap", price: 49.99, image: "/products/br-cap-blue.jpg" },
  { name: "Shh Tee", price: 69.99, image: "/products/shh-tee-blue.jpg" },
];

const MARQUEE_ITEMS = [
  { label: "Panther Tee" },
  { label: "Countach Hoodie" },
  { label: "BR Cap" },
  { label: "Champagne Bottle Runner" },
  { label: "LED Acrylic Lamp — Coupé" },
  { label: "Golden Ticket Print" },
];

/** Eyebrow + note above each demo, so the page reads as a judgement aid. */
function KitSection({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="br-section-b">
      <div className="br-shell">
        <h2 className="br-section-label neon-text-blue">{label}</h2>
        <p className="mt-3 max-w-[52ch] text-[13px]" style={{ color: "var(--br-mute)" }}>
          {note}
        </p>
      </div>
      <div className="mt-12">{children}</div>
    </section>
  );
}

function KitPage() {
  // Remounting the effect is the simplest replay: it has no imperative API.
  const [replayKey, setReplayKey] = useState(0);

  return (
    <SiteLayout>
      {/* Preamble ------------------------------------------------------- */}
      <div className="br-shell br-section-t br-section-b">
        <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
          BR-3 · Internal preview
        </p>
        <h1
          className="br-display mt-6"
          style={{ fontSize: "clamp(26px, 4.2vw, 46px)", lineHeight: 1.2 }}
        >
          Design kit
        </h1>
        <p
          className="mt-8 max-w-[60ch] text-[15px]"
          style={{ color: "var(--br-white)", lineHeight: 1.8 }}
        >
          Four components vendored from Aceternity UI, adapted to this stack and recoloured to the
          BennyRich tokens. Motion is cut to roughly 40% of the shipped defaults. This page is a
          throwaway judging surface — it is not linked from the nav and nothing on the live site
          uses any of it yet.
        </p>
        <p className="mt-6 max-w-[60ch] text-[13px]" style={{ color: "var(--br-mute)" }}>
          Two things to rule on: whether the movement earns its place at all, and whether the
          marquee is worth amending &ldquo;nothing moves except the header&rdquo; for.
        </p>
      </div>

      {/* 1 — Spotlight --------------------------------------------------- */}
      <KitSection
        label="01 · Spotlight"
        note="Ambient blue light behind the hero. Two beams drifting 60px over 14s — upstream ships 100px over 7s. It reads as a room with a window, not a searchlight. This is movement, which the design system currently allows nowhere but the header."
      >
        <div className="br-shell">
          <div
            className="quiet-frame relative grid items-center gap-14 overflow-hidden border px-6 py-20 md:grid-cols-2 md:px-12"
            style={{ borderRadius: "var(--radius)" }}
          >
            <Spotlight />
            <div className="relative z-10">
              <h3
                className="br-display"
                style={{
                  fontSize: "clamp(30px, 5vw, 60px)",
                  letterSpacing: "0.1em",
                  lineHeight: 1.14,
                }}
              >
                <span className="neon-hero-white block">Timeless.</span>
                <span className="neon-hero-blue block">Bold.</span>
                <span className="neon-hero-pink block">Luxurious.</span>
              </h3>
              <button type="button" className="neon-btn mt-11">
                Shop now <span aria-hidden>→</span>
              </button>
            </div>
            <div className="relative z-10 order-first md:order-none">
              <ShhKid className="mx-auto w-full max-w-[300px] md:max-w-[360px]" />
            </div>
          </div>
        </div>
      </KitSection>

      {/* 2 — Card spotlight ---------------------------------------------- */}
      <KitSection
        label="02 · Card spotlight"
        note="A blue radial that follows the cursor across the card, at 14% opacity. Hover a card to see it. The upstream version renders an animated WebGL dot-matrix inside the mask; that layer was dropped — it costs ~600KB and it pulses."
      >
        <div className="br-shell grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-8">
          {KIT_PRODUCTS.map((p) => (
            <CardSpotlight key={p.name} className="p-3">
              <div className="br-media relative z-10" style={{ aspectRatio: "1 / 1" }}>
                <img src={p.image} alt={p.name} loading="lazy" />
              </div>
              <div className="relative z-10 mt-5 px-1">
                <h3 className="br-label truncate" style={{ color: "var(--br-white)" }}>
                  {p.name}
                </h3>
                <p className="br-price mt-2 text-[15px]" style={{ color: "var(--br-mute)" }}>
                  {formatEUR(p.price)}
                </p>
              </div>
            </CardSpotlight>
          ))}
        </div>
      </KitSection>

      {/* 3 — Tagline reveal ---------------------------------------------- */}
      <KitSection
        label="03 · Tagline reveal"
        note="Word-by-word settle on the house tagline. Blur-in reduced from 10px to 4px and the stagger from 0.20s to 0.12s, so the words arrive rather than swim. Renders finished, not snapped, under reduced motion."
      >
        <div className="br-shell">
          <div
            className="quiet-frame border px-6 py-20 text-center md:px-12"
            style={{ borderRadius: "var(--radius)" }}
          >
            <TextGenerateEffect
              key={replayKey}
              words="Timeless. Bold. Luxurious."
              className="br-tagline text-[clamp(13px,2.4vw,22px)]"
            />
            <button
              type="button"
              onClick={() => setReplayKey((k) => k + 1)}
              className="br-label mt-12 transition-opacity duration-200 hover:opacity-70"
              style={{ color: "var(--br-mute)" }}
            >
              Replay <span aria-hidden>↺</span>
            </button>
          </div>
        </div>
      </KitSection>

      {/* 4 — Marquee ------------------------------------------------------ */}
      <KitSection
        label="04 · Marquee"
        note="Six pieces on a 120s loop — upstream's slowest setting is 80s. Edges dissolve into the black rather than clipping, and it pauses on hover. This is the component that needs a design-system ruling: it never stops moving."
      >
        <InfiniteMovingCards items={MARQUEE_ITEMS} />
      </KitSection>
    </SiteLayout>
  );
}
