/** Shared page furniture for the account and auth screens. */
import type { ReactNode } from "react";

export function AuthCard({
  eyebrow,
  title,
  lede,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="br-shell br-section">
      <div className="mx-auto w-full max-w-[440px]">
        <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
          {eyebrow}
        </p>
        <h1
          className="br-display neon-hero-white mt-5"
          style={{ fontSize: "clamp(26px, 4.2vw, 40px)", letterSpacing: "0.06em" }}
        >
          {title}
        </h1>
        {lede && (
          <p className="mt-5 text-[14px]" style={{ color: "var(--br-mute)", lineHeight: 1.75 }}>
            {lede}
          </p>
        )}
        <div className="quiet-frame mt-10 border p-7" style={{ borderRadius: "var(--radius)" }}>
          {children}
        </div>
        {footer && <div className="mt-7 text-center text-[13px]">{footer}</div>}
      </div>
    </div>
  );
}

/** Server-side failures, shown in pink like the rest of the site's errors. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-5 text-[13px]" style={{ color: "var(--br-pink)", lineHeight: 1.6 }}>
      {message}
    </p>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="br-label mb-2 block" style={{ color: "var(--br-mute)" }}>
      {children}
    </span>
  );
}
