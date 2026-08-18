import { Link } from "@tanstack/react-router";
import { SiteLayout } from "./SiteLayout";
import { Diamond } from "./Diamond";

export function ComingSoon({ title }: { title: string }) {
  return (
    <SiteLayout>
      <section
        className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"
        style={{ background: "var(--paper)" }}
      >
        <h1
          className="text-[2.5rem]"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)", fontWeight: 500 }}
        >
          {title}
        </h1>
        <p className="mt-4 text-[1rem]" style={{ color: "var(--muted-tone)" }}>
          Coming soon
        </p>
        <div className="my-6">
          <Diamond size={20} />
        </div>
        <Link
          to="/"
          className="ui-label text-[0.75rem]"
          style={{ color: "var(--ink)", borderBottom: "1px solid var(--ink)", paddingBottom: 2 }}
        >
          Back to home
        </Link>
      </section>
    </SiteLayout>
  );
}