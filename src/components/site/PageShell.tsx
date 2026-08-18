import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "./SiteLayout";

/** Page header: eyebrow + neon title, used by every non-home route. */
export function PageHeading({
  eyebrow,
  title,
  accent = "blue",
  lede,
}: {
  eyebrow?: string;
  title: string;
  accent?: "blue" | "pink" | "none";
  lede?: string;
}) {
  const accentClass =
    accent === "blue" ? "neon-text-blue" : accent === "pink" ? "neon-text-pink" : "";
  return (
    <header className="br-shell br-section-t pb-14">
      {eyebrow && (
        <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
          {eyebrow}
        </p>
      )}
      <h1
        className={`br-display mt-5 ${accentClass}`}
        style={{
          fontSize: "clamp(26px, 4.2vw, 46px)",
          letterSpacing: "0.08em",
          lineHeight: 1.18,
          color: accent === "none" ? "var(--br-white)" : undefined,
        }}
      >
        {title}
      </h1>
      {lede && (
        <p
          className="mt-7 max-w-[58ch] text-[15px]"
          style={{ color: "var(--br-white)", lineHeight: 1.75 }}
        >
          {lede}
        </p>
      )}
    </header>
  );
}

/** Long-form page (about, legal) in the BennyRich system. */
export function ArticlePage({
  title,
  eyebrow,
  lede,
  children,
}: {
  title: string;
  eyebrow?: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <PageHeading eyebrow={eyebrow} title={title} lede={lede} />
      <div className="br-shell br-section-b max-w-[70ch]">
        <div className="br-prose text-[15px]">{children}</div>
      </div>
    </SiteLayout>
  );
}

export function Section({ heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      {heading && (
        <h2
          className="br-display mb-4 text-[17px]"
          style={{ color: "var(--br-white)", letterSpacing: "0.08em" }}
        >
          {heading}
        </h2>
      )}
      {children}
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function List({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="br-display text-[19px]" style={{ color: "var(--br-mute)" }}>
        {message}
      </p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}

export function BackToShop() {
  return (
    <Link to="/shop" className="neon-btn">
      Browse the shop <span aria-hidden>→</span>
    </Link>
  );
}

/** Sign-off at the end of a long-form page. */
export function Signature({ children }: { children: ReactNode }) {
  return (
    <p className="br-display neon-text-blue mt-14 text-[15px]" style={{ letterSpacing: "0.14em" }}>
      — {children}
    </p>
  );
}
