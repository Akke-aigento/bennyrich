import { Link } from "@tanstack/react-router";

/**
 * The trust beat — and it promises nothing, on purpose.
 *
 * The obvious thing here is a benefits strip: free shipping, easy returns,
 * secure checkout, three icons in a row. Every one of those would be inventing
 * a service that does not exist yet. The tenant has **no active shipping
 * methods**, Stripe is **not live** (`stripe_charges_enabled = false`), and
 * there are no reviews to average. A strip like that is not decoration, it is a
 * commitment a customer can hold the shop to.
 *
 * So this is a statement instead: no numbers, no delivery window, no returns
 * window, no "secure checkout" padlock, nothing with a service level attached.
 *
 * The copy is lifted verbatim from the existing /about body, so it is voice the
 * brand already has rather than something written for a homepage slot. No
 * eyebrow either — an eyebrow labels a shelf, and this is the one beat on the
 * page that is not selling one.
 *
 * WHEN SHIPPING METHODS AND STRIPE GO LIVE, a real value strip with true
 * numbers becomes a short follow-up. Do not add one before then.
 */
export function BrandStatement() {
  return (
    <section className="br-shell br-section-t">
      <div
        className="quiet-frame grid items-center gap-10 border px-8 py-16 md:grid-cols-[minmax(0,46%)_1fr] md:gap-16 md:px-20 md:py-20"
        style={{ borderRadius: "var(--radius)" }}
      >
        <h2
          className="br-display"
          style={{
            fontSize: "clamp(20px, 2.7vw, 29px)",
            letterSpacing: "0.09em",
            lineHeight: 1.45,
          }}
        >
          <span className="block" style={{ color: "var(--br-white)" }}>
            We do not follow
          </span>
          <span className="neon-text-blue block">the crowd.</span>
        </h2>

        <div>
          <p
            className="max-w-[52ch] text-[15px]"
            style={{ color: "var(--br-white)", lineHeight: 1.8 }}
          >
            We make premium pieces for people who set their own rules, take calculated risks and
            become the best version of themselves.
          </p>
          <Link to="/about" className="neon-btn mt-9">
            The brand <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
