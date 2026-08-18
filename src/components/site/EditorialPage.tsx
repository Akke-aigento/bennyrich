import type { ReactNode } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Diamond } from "@/components/site/Diamond";

export function EditorialPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <article style={{ background: "var(--paper)" }}>
        <div className="mx-auto w-full max-w-[720px] px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <header className="text-center">
            <h1
              className="text-[1.9rem] md:text-[2.75rem]"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
                fontWeight: 500,
                lineHeight: 1.15,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="ui-label mt-4 text-[0.65rem]"
                style={{ color: "var(--muted-tone)", letterSpacing: "0.28em" }}
              >
                {subtitle.toUpperCase()}
              </p>
            )}
            <div className="mt-6 flex justify-center">
              <Diamond size={14} />
            </div>
          </header>
          <div className="mt-12 md:mt-16">{children}</div>
        </div>
      </article>
    </SiteLayout>
  );
}

export function Section({ heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      {heading && (
        <>
          <h2
            className="text-[1.25rem] md:text-[1.5rem]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--ink)",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {heading}
          </h2>
          <div className="mt-3 mb-5" style={{ width: 36, height: 1, background: "var(--gold)" }} />
        </>
      )}
      {children}
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-4 text-[0.95rem] first:mt-0"
      style={{ color: "var(--ink)", fontFamily: "var(--font-body)", lineHeight: 1.9 }}
    >
      {children}
    </p>
  );
}

export function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((i) => (
        <li
          key={i}
          className="pl-5 text-[0.95rem]"
          style={{
            color: "var(--ink)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.9,
            position: "relative",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: "0.85em",
              width: 5,
              height: 5,
              background: "var(--gold)",
              transform: "rotate(45deg)",
            }}
          />
          {i}
        </li>
      ))}
    </ul>
  );
}

export function GoldStatement({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-14 text-center text-[1.35rem] md:text-[1.7rem]"
      style={{
        fontFamily: "var(--font-display)",
        color: "var(--gold)",
        fontWeight: 600,
        letterSpacing: "0.06em",
        lineHeight: 1.4,
      }}
    >
      {children}
    </p>
  );
}

export function Signature({ children }: { children: ReactNode }) {
  return (
    <p
      className="ui-label mt-10 text-center text-[0.7rem]"
      style={{ color: "var(--muted-tone)", letterSpacing: "0.3em" }}
    >
      {children}
    </p>
  );
}