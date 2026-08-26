import { Link } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";
import { Wordmark } from "@/assets/brand/Wordmark";
import { CONTACT_EMAIL, INSTAGRAM_URL } from "@/lib/site";

const LINKS = [
  { to: "/shipping-returns", label: "Shipping & Returns" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy-policy", label: "Privacy Policy" },
] as const;

/** Also the `sameAs` source for the Organization JSON-LD in __root.tsx —
 *  one list, so the schema can never drift from what the footer links to. */
export const SOCIALS = [
  { href: INSTAGRAM_URL, label: "Instagram", Icon: Instagram },
  { href: `mailto:${CONTACT_EMAIL}`, label: "Email us", Icon: Mail },
];

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{ background: "var(--br-black)", borderColor: "var(--br-line)" }}
    >
      <div className="br-shell flex flex-col items-center px-6 pb-10 pt-20">
        <Link to="/" aria-label="BennyRich — home">
          {/* The official lockup already carries WORLDWIDE — no city line. */}
          <Wordmark tone="blue" className="h-32 w-auto md:h-40" />
        </Link>

        <div className="mt-9 flex items-center gap-7">
          {SOCIALS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noreferrer noopener"}
              className="transition-colors duration-200 hover:text-[var(--br-blue-text)]"
              style={{ color: "var(--br-white)" }}
            >
              <Icon size={19} />
            </a>
          ))}
        </div>
      </div>

      {/* Platform convention */}
      <div className="br-shell pb-5 text-center">
        <p className="text-[10px]" style={{ color: "var(--br-mute)", letterSpacing: "0.18em" }}>
          POWERED BY SELLQO
        </p>
      </div>

      <div className="border-t" style={{ borderColor: "var(--br-line)" }}>
        <div className="br-shell flex flex-col items-center gap-4 py-5 md:flex-row md:justify-between">
          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="br-nav text-[11px] transition-colors duration-200 hover:text-[var(--br-blue-text)]"
                style={{ color: "var(--br-white)" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="br-nav text-[11px]" style={{ color: "var(--br-mute)" }}>
            © 2026 BennyRich. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
