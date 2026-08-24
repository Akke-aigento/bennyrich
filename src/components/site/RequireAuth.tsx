/**
 * Client-side gate for account pages.
 *
 * THIS IS UX, NOT SECURITY. It only decides what to render. The actual
 * protection is the bearer token checked inside the customer-api edge function:
 * without a valid session cookie the proxy refuses the call and no customer
 * data is returned, whatever the browser chooses to display. Do not treat this
 * component as an authorisation boundary or move data-fetching decisions behind
 * it on that basis.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Where the shopper was actually trying to go, captured on first render.
  // Reading it live instead would clobber itself: the redirect changes the
  // pathname, the effect re-runs while status is still "guest", and `next`
  // ends up pointing at the login page — so signing in would bounce them
  // straight back to the form they just completed.
  const intended = useRef(pathname);
  const redirected = useRef(false);

  useEffect(() => {
    if (status !== "guest" || redirected.current) return;
    redirected.current = true;
    navigate({ to: "/account/login", search: { next: intended.current }, replace: true });
  }, [status, navigate]);

  // `loading` is a real state, not an absence of one: the session lives in an
  // httpOnly cookie, so the browser cannot know whether it is signed in until
  // /account/me answers. Rendering the guest branch here would flash a login
  // redirect at every signed-in visitor on every page load.
  if (status === "loading") {
    return (
      <div className="br-shell br-section">
        <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
          Loading your account…
        </p>
      </div>
    );
  }

  if (status === "guest") return null;

  return <>{children}</>;
}
