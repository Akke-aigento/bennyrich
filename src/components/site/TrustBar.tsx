const items = ["✦ Authentic Products", "✦ Secure Payment", "✦ Fast Delivery"];

export function TrustBar() {
  return (
    <section
      className="hidden md:block"
      style={{ background: "var(--black)" }}
    >
      <div className="section-shell flex items-stretch justify-center py-6">
        {items.map((t, i) => (
          <div
            key={t}
            className="flex-1 text-center ui-label text-[0.75rem]"
            style={{
              color: "var(--bone)",
              letterSpacing: "0.16em",
              borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}