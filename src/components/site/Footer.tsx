import { Link } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";
import { Wordmark } from "@/assets/brand/Wordmark";

const LINKS = [
  { to: "/shipping-returns", label: "Shipping & Returns" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy-policy", label: "Privacy Policy" },
] as const;

/** lucide-react has no TikTok glyph, so the note is drawn to match its weight. */
function TikTok({ size = 19 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3c.4 2.6 2 4.2 4.6 4.5v3c-1.7.1-3.3-.4-4.6-1.4v6.3A6.4 6.4 0 1 1 9.6 9v3.1a3.3 3.3 0 1 0 2.3 3.2V3H15Z" />
    </svg>
  );
}

const SOCIALS = [
  { href: "https://instagram.com/bennyrich", label: "Instagram", Icon: Instagram },
  { href: "https://tiktok.com/@bennyrich", label: "TikTok", Icon: TikTok },
  { href: "mailto:hello@bennyrich.com", label: "Email us", Icon: Mail },
];

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{ background: "var(--br-black)", borderColor: "var(--br-line)" }}
    >
      <div className="br-shell flex flex-col items-center px-6 pb-10 pt-20">
        <Link to="/" aria-label="BennyRich — home">
          <Wordmark tone="blue" size={34} showCity />
        </Link>

        <div className="mt-9 flex items-center gap-7">
          {SOCIALS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noreferrer noopener"}
              className="transition-colors duration-200 hover:text-[var(--br-blue)]"
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
                className="br-nav text-[11px] transition-colors duration-200 hover:text-[var(--br-blue)]"
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
