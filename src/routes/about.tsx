import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeading } from "@/components/site/PageShell";
import { Wordmark } from "@/assets/brand/Wordmark";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — BennyRich" },
      {
        name: "description",
        content:
          "BennyRich is more than fashion. It's a lifestyle built on ambition, confidence and legacy.",
      },
      { property: "og:title", content: "About — BennyRich" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  {
    title: "Ambition",
    body: "Every piece is made for people who are building something. No apologies, no shrinking.",
  },
  {
    title: "Confidence",
    body: "Oversized cuts, neon graphics, hard edges. Designed to be seen from across the room.",
  },
  {
    title: "Legacy",
    body: "Apparel, home, lighting, the bottle. One world, built to outlast the season.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="The brand"
        title="More than fashion"
        lede="BennyRich is a lifestyle built on ambition, confidence and legacy. It started with a bucket hat and a finger to the lips — say less, build more."
      />

      <div className="br-shell pb-6">
        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="border border-br-line p-7 transition-[border-color,box-shadow] duration-200 hover:neon-line-blue"
              style={{
                background: "var(--br-ink)",
                borderRadius: "var(--radius)",
              }}
            >
              <h2
                className="br-display text-[17px]"
                style={{ color: "var(--br-white)", letterSpacing: "0.08em" }}
              >
                {p.title}
              </h2>
              <p
                className="mt-3.5 text-[14px]"
                style={{ color: "var(--br-mute)", lineHeight: 1.7 }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="br-shell max-w-[70ch] pb-16">
        <div className="br-prose text-[15px]">
          <p>
            We do not follow the crowd. We make premium products for people who set their own rules,
            take calculated risks and become the best version of themselves.
          </p>
          <p>
            Every collection carries the same message: live with purpose, build your legacy. Luxury
            is not about showing wealth — it is about having standards.
          </p>
        </div>
      </div>

      <div className="br-shell flex flex-col items-center pb-24 text-center">
        <Wordmark tone="blue" size={30} showTagline />
        <Link to="/shop" className="neon-btn mt-9">
          Shop the collection <span aria-hidden>→</span>
        </Link>
      </div>
    </SiteLayout>
  );
}
