import { Link } from "@tanstack/react-router";

export function CategoryHero({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb: Array<{ label: string; to?: string }>;
}) {
  return (
    <section className="py-16 text-center" style={{ background: "var(--bone)" }}>
      <nav className="text-[0.75rem] ui-label" style={{ color: "var(--muted-tone)", letterSpacing: "0.2em" }}>
        {breadcrumb.map((b, i) => (
          <span key={b.label}>
            {i > 0 && <span className="mx-2">/</span>}
            {b.to ? <Link to={b.to}>{b.label}</Link> : <span>{b.label}</span>}
          </span>
        ))}
      </nav>
      <h1
        className="mt-6 text-[2.5rem]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)", fontWeight: 500 }}
      >
        {title.toUpperCase()}
      </h1>
      {subtitle && (
        <p className="mt-3 text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
          {subtitle}
        </p>
      )}
      <div className="mx-auto mt-6" style={{ width: 40, height: 1, background: "var(--gold)" }} />
    </section>
  );
}