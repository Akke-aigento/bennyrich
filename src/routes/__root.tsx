import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_URL,
} from "../lib/site";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "../lib/cart-context";
import { Wordmark } from "../assets/brand/Wordmark";
import { CartDrawer } from "../components/site/CartDrawer";
import { CookieBanner } from "../components/site/CookieBanner";
import { ConsentProvider } from "../lib/consent";
import { AuthProvider } from "../lib/auth";
import { SOCIALS } from "../components/site/Footer";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div
      className="br-shell flex min-h-screen flex-col items-center justify-center py-24 text-center"
      style={{ background: "var(--br-black)" }}
    >
      <Wordmark tone="blue" className="text-[22px]" />
      <p className="br-section-label mt-14" style={{ color: "var(--br-mute)" }}>
        404
      </p>
      <h1
        className="br-display neon-hero-white mt-5"
        style={{ fontSize: "clamp(26px, 4.2vw, 46px)", letterSpacing: "0.06em" }}
      >
        Page not found
      </h1>
      <p
        className="mt-6 max-w-[42ch] text-[15px]"
        style={{ color: "var(--br-mute)", lineHeight: 1.8 }}
      >
        This page doesn&rsquo;t exist, or it has moved. The collection is still where you left it.
      </p>
      <div className="mt-11 flex flex-wrap justify-center gap-4">
        <Link to="/shop" className="neon-btn">
          Shop the collection <span aria-hidden>&rarr;</span>
        </Link>
        <Link to="/" className="neon-btn neon-btn-quiet">
          Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div
      className="br-shell flex min-h-screen flex-col items-center justify-center py-24 text-center"
      style={{ background: "var(--br-black)" }}
    >
      <Wordmark tone="blue" className="text-[22px]" />
      <p className="br-section-label mt-14" style={{ color: "var(--br-mute)" }}>
        Something broke
      </p>
      <h1
        className="br-display neon-hero-white mt-5"
        style={{ fontSize: "clamp(26px, 4.2vw, 46px)", letterSpacing: "0.06em" }}
      >
        This page didn&rsquo;t load
      </h1>
      <p
        className="mt-6 max-w-[42ch] text-[15px]"
        style={{ color: "var(--br-mute)", lineHeight: 1.8 }}
      >
        Something went wrong on our end. Try again, or head back to the collection.
      </p>
      <div className="mt-11 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="neon-btn"
        >
          Try again
        </button>
        <a href="/" className="neon-btn neon-btn-quiet">
          Home
        </a>
      </div>
    </div>
  );
}

/**
 * Organization schema. `sameAs` is derived from the footer's own SOCIALS list
 * (mailto excluded — sameAs is for profile URLs), so the structured data cannot
 * drift from the links actually on the page.
 */
const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BennyRich",
  url: SITE_URL,
  logo: absoluteUrl("/android-chrome-512.png"),
  description:
    "BennyRich is more than fashion. It's a lifestyle built on ambition, confidence and legacy.",
  sameAs: SOCIALS.map((s) => s.href).filter((href) => !href.startsWith("mailto:")),
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BennyRich — Timeless. Bold. Luxurious." },
      {
        name: "description",
        content:
          "BennyRich is more than fashion. It's a lifestyle built on ambition, confidence and legacy. Apparel, accessories, home, lighting and beverages.",
      },
      { name: "theme-color", content: "#050505" },
      { property: "og:site_name", content: "BennyRich" },
      { property: "og:title", content: "BennyRich — Timeless. Bold. Luxurious." },
      {
        property: "og:description",
        content: "More than fashion. A lifestyle built on ambition, confidence and legacy.",
      },
      { property: "og:type", content: "website" },
      // Absolute, not relative: scrapers resolve og:image against nothing.
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: absoluteUrl(DEFAULT_OG_IMAGE) },
      { property: "og:image:width", content: String(OG_IMAGE_WIDTH) },
      { property: "og:image:height", content: String(OG_IMAGE_HEIGHT) },
      { property: "og:image:alt", content: "BennyRich — Timeless. Bold. Luxurious." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: absoluteUrl(DEFAULT_OG_IMAGE) },
      { name: "twitter:title", content: "BennyRich — Timeless. Bold. Luxurious." },
      {
        name: "twitter:description",
        content: "More than fashion. A lifestyle built on ambition, confidence and legacy.",
      },
    ],
    links: [
      // No canonical here on purpose. `links` from the root and the matched
      // route are concatenated, not merged, so a canonical at the root emits a
      // SECOND one on every page — and two canonicals mean a crawler honours
      // neither. Every route supplies its own; the noindex checkout routes
      // deliberately have none.
      // SVG stays primary — it is the sharpest at every size. The rest are
      // fallbacks for browsers and platforms that do not take an SVG favicon.
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { rel: "alternate icon", href: "/favicon.ico", sizes: "48x48 32x32 16x16" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=Inter:wght@400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ORGANIZATION_LD),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ConsentProvider>
        <AuthProvider>
          <CartProvider>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
            <CartDrawer />
            <CookieBanner />
            <Toaster position="bottom-right" />
          </CartProvider>
        </AuthProvider>
      </ConsentProvider>
    </QueryClientProvider>
  );
}
