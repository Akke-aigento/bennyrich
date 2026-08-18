import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Monogram } from "@/assets/brand/Monogram";
import { AGE_RESTRICTED_CATEGORIES } from "@/lib/categories";
import type { SellqoProduct } from "@/lib/sellqo";
import { useProducts } from "@/lib/use-sellqo";

const SESSION_KEY = "br_age_verified";

function readVerified(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/** Category slugs carried on the product, across the shapes SellQo may return. */
function categorySlugsOf(product: SellqoProduct | null): string[] {
  if (!product) return [];
  const any = product as unknown as Record<string, unknown>;
  const out: string[] = [];
  const push = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (v && typeof v === "object" && typeof (v as any).slug === "string") {
      out.push((v as any).slug);
    }
  };
  for (const key of ["categories", "category", "collections", "category_slug", "category_slugs"]) {
    const v = any[key];
    if (Array.isArray(v)) v.forEach(push);
    else if (v) push(v);
  }
  return out;
}

/**
 * Resolves whether a product needs the 18+ interstitial. Prefers the category
 * data on the product itself; if the payload carries none, it falls back to
 * matching the slug against the age-restricted category listings.
 */
export function useAgeRestricted(product: SellqoProduct | null): boolean {
  const embedded = categorySlugsOf(product);
  const knowsCategories = embedded.length > 0;
  const restrictedBySlug = embedded.some((s) => AGE_RESTRICTED_CATEGORIES.has(s));

  // Only queried when the product payload did not tell us.
  const { products } = useProducts({
    categorySlug: knowsCategories ? undefined : "beverages",
  });
  const restrictedByListing =
    !knowsCategories && !!product && products.some((p) => p.slug === product.slug);

  return restrictedBySlug || restrictedByListing;
}

/**
 * Full-screen 18+ interstitial. Shown once per browser session before an
 * age-restricted product page opens; "Leave" returns to the homepage.
 */
export function AgeGate({ active, onVerified }: { active: boolean; onVerified: () => void }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof document === "undefined" || !active) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!mounted || !active) return null;

  function accept() {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — gate simply reappears next navigation */
    }
    onVerified();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.94)" }}
    >
      <div
        className="neon-line-pink w-full max-w-[420px] border px-8 py-10 text-center"
        style={{ background: "var(--br-black)", borderRadius: "var(--radius)" }}
      >
        <div className="flex justify-center">
          <Monogram tone="pink" size={48} />
        </div>
        <h2
          id="age-gate-title"
          className="br-display neon-text-pink mt-7 text-[34px]"
          style={{ letterSpacing: "0.1em" }}
        >
          18+
        </h2>
        <p className="mt-5 text-[14px]" style={{ color: "var(--br-white)", lineHeight: 1.7 }}>
          This page contains an alcoholic product. Please confirm your age to continue.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" onClick={accept} className="neon-btn neon-btn-pink justify-center">
            I am 18 or older
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="br-label py-3 underline underline-offset-4 transition-colors duration-200 hover:text-[var(--br-white)]"
            style={{ color: "var(--br-mute)" }}
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}

/** Session state for the gate, kept out of render so SSR stays deterministic. */
export function useAgeVerification() {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setVerified(readVerified());
  }, []);

  return { verified, markVerified: () => setVerified(true) };
}
