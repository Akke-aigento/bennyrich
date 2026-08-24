import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

/**
 * Layout for every /account route.
 *
 * Deliberately NOT guarded: /account/login and /account/register live under
 * this path too, and guarding here would make signing in impossible. The pages
 * that need a session wrap themselves in <RequireAuth>.
 *
 * No canonical either — everything under /account is noindex.
 */
export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "Account — BennyRich" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  ),
});
