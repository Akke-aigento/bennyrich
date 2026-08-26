import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const SESSION_KEY = "br_splash_shown";
const ART = "/hero/shh-kid-splash.png";
/** 704x900 — the derived, compressed crop. See docs/role-audit.md, BR-11. */
const ART_WIDTH = 704;
const ART_HEIGHT = 900;

/** Earliest the artwork may start fading in, even if it loaded instantly. */
const IN_FLOOR_MS = 500;
/** Latest it may start, even if the image has not loaded. */
const IN_CAP_MS = 1500;
/** How long it holds at full opacity before fading out. */
const HOLD_MS = 2000;
/** Opacity/scale transition. The one long transition on the site. */
const FADE_MS = 1000;

/**
 * `pending` renders nothing and is where every mount starts.
 *
 * SiteLayout remounts on every client navigation, so if the first render
 * assumed "not shown yet" and the sessionStorage read only landed in an effect,
 * the overlay would flash black for a frame on every route change after the
 * first. Same `mounted` gate as AgeGate, for the same reason.
 */
type Phase = "pending" | "in" | "hold" | "out" | "done";

function alreadyShown(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    // Private mode: nothing persists, so the splash would return on every
    // navigation. Treat it as already shown rather than nag.
    return true;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Brand intro, once per browser session.
 *
 * Client decision (BR-11, matching Mancini Milano): the 1000ms fade is the
 * second sanctioned motion exception after the header's frosted ground, and
 * while the splash is up it — not the hero figure — is the LCP element. Nothing
 * pulses; this runs once and unmounts.
 *
 * Under `prefers-reduced-motion: reduce` it is skipped entirely, by name via
 * matchMedia rather than by leaning on the global duration crush in tokens.css.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("pending");
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const startedHold = useRef(false);
  /** Set when the overlay first renders, so the floor is measured from mount. */
  const shownAt = useRef(0);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const skip = useCallback(() => {
    clearTimers();
    setPhase("done");
  }, [clearTimers]);

  useEffect(() => {
    if (alreadyShown() || prefersReducedMotion()) {
      setPhase("done");
      return;
    }
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — already handled above */
    }
    shownAt.current = performance.now();
    setPhase("in");
  }, []);

  // The artwork is ~200KB and is the first thing painted, so the fade starts on
  // load rather than on a fixed timer: a slow connection would otherwise show a
  // second of empty black. Capped so it can never stall behind a failed image.
  const beginHold = useCallback(() => {
    if (startedHold.current) return;
    startedHold.current = true;
    setPhase("hold");
    timers.current.push(setTimeout(() => setPhase("out"), HOLD_MS));
  }, []);

  useEffect(() => {
    if (phase !== "in") return;
    const cap = setTimeout(beginHold, IN_CAP_MS);
    timers.current.push(cap);
    return () => clearTimeout(cap);
  }, [phase, beginHold]);

  // Unmount only. This must NOT depend on `phase`: a cleanup that ran on every
  // phase change would clear the hold timer that beginHold had just scheduled,
  // and the splash would sit at full opacity forever instead of fading out.
  useEffect(() => clearTimers, [clearTimers]);

  // Escape skips, like any other full-screen overlay on the site.
  useEffect(() => {
    if (phase === "pending" || phase === "done" || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, skip]);

  useEffect(() => {
    if (phase === "pending" || phase === "done" || typeof document === "undefined") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "pending" || phase === "done") return null;

  const visible = phase === "hold";
  const scale = phase === "in" ? 0.95 : phase === "hold" ? 1 : 0.97;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label="BennyRich"
      style={{
        background: "var(--br-black)",
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
      onTransitionEnd={(e) => {
        // The artwork's transform transition bubbles here too; only the
        // overlay's own opacity means the fade-out is finished.
        if (phase === "out" && e.target === e.currentTarget && e.propertyName === "opacity") {
          setPhase("done");
        }
      }}
    >
      <img
        src={ART}
        alt="BennyRich"
        width={ART_WIDTH}
        height={ART_HEIGHT}
        decoding="async"
        fetchPriority="high"
        onLoad={() => {
          // Floor and cap, both measured from mount: the fade never starts
          // before 500ms (so it reads as a beat, not a flicker) and never after
          // 1500ms (so a slow image cannot hold an empty black screen).
          const waited = performance.now() - shownAt.current;
          timers.current.push(setTimeout(beginHold, Math.max(0, IN_FLOOR_MS - waited)));
        }}
        onError={beginHold}
        className="h-[48vh] w-auto max-w-[86vw] object-contain md:h-[58vh] md:max-h-[680px]"
        style={{
          transform: `scale(${scale})`,
          transition: `transform ${FADE_MS}ms ease-out`,
        }}
      />

      <button
        type="button"
        onClick={skip}
        aria-label="Skip intro"
        className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center transition-colors duration-200 hover:text-[var(--br-white)]"
        style={{ color: "var(--br-mute)" }}
      >
        <X size={22} strokeWidth={1.5} />
      </button>
    </div>
  );
}
