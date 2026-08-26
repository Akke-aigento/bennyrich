import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SplashScreen } from "./SplashScreen";

export function SiteLayout({
  children,
  hideFooter = false,
}: {
  children: ReactNode;
  hideFooter?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--br-black)" }}>
      {/* Above the header (z-40), cart drawer (z-50), cookie banner (z-[55]) and
          the 18+ gate (z-[60]) — the splash sits at z-[100]. */}
      <SplashScreen />
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
