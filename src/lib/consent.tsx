/**
 * Cookie consent gate.
 *
 * NOTHING IS TRACKED IN THIS BATCH. No analytics or advertising script is
 * loaded anywhere in the app. This is the gate those scripts will sit behind,
 * built now so adding one later is a few lines rather than a retrofit.
 *
 * The choice is stored in a FIRST-PARTY COOKIE rather than localStorage,
 * deliberately: a consent decision is a record that has to be presentable, and
 * a cookie is what a server can also read if consent ever needs enforcing
 * server-side. The consent cookie itself is "strictly necessary" and is exempt
 * from requiring prior consent under GDPR/ePrivacy.
 *
 * ── ADDING AN ANALYTICS SCRIPT LATER ────────────────────────────────────────
 * Gate it; never load it unconditionally:
 *
 *   const { hasConsent } = useConsent();
 *   useEffect(() => {
 *     if (!hasConsent("analytics")) return;
 *     const s = document.createElement("script");
 *     s.defer = true;
 *     s.src = "https://static.cloudflareinsights.com/beacon.min.js";
 *     s.dataset.cfBeacon = JSON.stringify({ token: "<token>" });
 *     document.head.appendChild(s);
 *     return () => s.remove();
 *   }, [hasConsent]);
 *
 * A Meta pixel goes behind the same check with category "marketing". Do not
 * add a script to index.html or __root's `scripts` — that loads it before the
 * shopper has answered, which is the whole thing this exists to prevent.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const COOKIE_NAME = "br_consent";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 182; // ~6 months

/** Categories the gate knows about. Everything except "necessary" is opt-in. */
export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentChoice = "granted" | "denied";

type ConsentValue = {
  /** null until the shopper has answered — that is what shows the banner. */
  choice: ConsentChoice | null;
  /** False for every optional category until consent is granted. */
  hasConsent: (category: ConsentCategory) => boolean;
  accept: () => void;
  decline: () => void;
  /** False during SSR and the first paint, so the banner cannot flash. */
  ready: boolean;
};

const ConsentContext = createContext<ConsentValue>({
  choice: null,
  hasConsent: () => false,
  accept: () => {},
  decline: () => {},
  ready: false,
});

function readCookie(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  const value = match?.[1];
  return value === "granted" || value === "denied" ? value : null;
}

function writeCookie(choice: ConsentChoice) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${choice}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);

  // Read after mount, never during render: the server has no cookie jar, so
  // reading it in the render body would make SSR and hydration disagree. Same
  // pattern useAgeVerification uses.
  useEffect(() => {
    setChoice(readCookie());
    setReady(true);
  }, []);

  const set = useCallback((next: ConsentChoice) => {
    writeCookie(next);
    setChoice(next);
  }, []);

  const value = useMemo<ConsentValue>(
    () => ({
      choice,
      ready,
      hasConsent: (category: ConsentCategory) =>
        category === "necessary" ? true : choice === "granted",
      accept: () => set("granted"),
      decline: () => set("denied"),
    }),
    [choice, ready, set],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  return useContext(ConsentContext);
}
