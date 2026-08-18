import { useState, useEffect } from "react";
import logoGold from "@/assets/brand/logo-gold.svg";

type Phase = "idle" | "in" | "hold" | "out" | "done";

const STORAGE_KEY = "zd_splash_shown";

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const shown = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (shown) {
      setPhase("done");
      return;
    }

    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, "1");
    }

    setPhase("in");
    const raf = requestAnimationFrame(() => setPhase("hold"));
    const outTimer = setTimeout(() => setPhase("out"), 2600);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(outTimer);
    };
  }, []);

  if (phase === "idle" || phase === "done") return null;

  const isIn = phase === "in";
  const isOut = phase === "out";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-700 ease-out"
      style={{
        background: "var(--black)",
        opacity: isOut ? 0 : 1,
      }}
      onTransitionEnd={() => isOut && setPhase("done")}
    >
      <img
        src={logoGold}
        alt="Zona Dorata"
        className="w-auto transition-all duration-700 ease-out"
        style={{
          height: "clamp(56px, 12vh, 112px)",
          transform: isIn ? "scale(0.92)" : isOut ? "scale(0.98)" : "scale(1)",
          opacity: isIn ? 0.7 : isOut ? 0 : 1,
        }}
      />
    </div>
  );
}
