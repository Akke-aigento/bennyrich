/**
 * Customer authentication.
 *
 * The session token is NOT held here. It lives in an httpOnly cookie set by the
 * proxy (see the Customer API section of sellqo.functions.ts), so this context
 * never sees it and neither does any other client code — which is the point.
 * What this holds is the customer record, hydrated from the server.
 *
 * That has one consequence worth knowing: there is no way to tell from the
 * browser whether a session exists without asking. So the provider starts in
 * `loading` and calls /account/me once on mount. Every consumer must handle
 * `loading` rather than treating "no customer yet" as "signed out", or a
 * signed-in shopper gets a login form flashed at them on every page load.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { sellqoFetch } from "./sellqo";

export type Customer = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  accepts_marketing?: boolean;
  /**
   * True once the customer has clicked the link in the verification email.
   * Core sends that email on register (CUSTAUTH-1) and refuses get_orders /
   * get_order with 403 EMAIL_NOT_VERIFIED until it is true, so the gate exists
   * on both sides. Still optional on the type: an older core omits the field,
   * and `undefined` must not be read as "unverified" — see VerifyBanner.
   */
  email_verified?: boolean;
};

export type AuthStatus = "loading" | "authed" | "guest";

export type RegisterInput = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  accepts_marketing?: boolean;
};

type AuthValue = {
  customer: Customer | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<Customer>;
  register: (input: RegisterInput) => Promise<Customer>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  customer: null,
  status: "loading",
  login: async () => {
    throw new Error("AuthProvider is not mounted");
  },
  register: async () => {
    throw new Error("AuthProvider is not mounted");
  },
  logout: async () => {},
  refresh: async () => {},
});

/** The customer-api returns either the record or { customer }. */
function unwrapCustomer(raw: unknown): Customer | null {
  if (!raw || typeof raw !== "object") return null;
  const withKey = raw as { customer?: Customer };
  const candidate = withKey.customer ?? (raw as Customer);
  return candidate && typeof candidate.email === "string" ? candidate : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const found = unwrapCustomer(await sellqoFetch("/account/me"));
      setCustomer(found);
      setStatus(found ? "authed" : "guest");
    } catch {
      // No cookie, an expired token, or an unreachable API all mean the same
      // thing to the UI: browse as a guest. The proxy has already cleared a
      // rejected cookie by this point.
      setCustomer(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const found = unwrapCustomer(
      await sellqoFetch("/auth/login", { method: "POST", body: { email, password } }),
    );
    if (!found) throw new Error("Could not sign in. Please try again.");
    setCustomer(found);
    setStatus("authed");
    return found;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const found = unwrapCustomer(
      await sellqoFetch("/auth/register", { method: "POST", body: input }),
    );
    if (!found) throw new Error("Could not create the account. Please try again.");
    setCustomer(found);
    setStatus("authed");
    return found;
  }, []);

  const logout = useCallback(async () => {
    try {
      await sellqoFetch("/auth/logout", { method: "POST" });
    } finally {
      // Sign out locally even if the call failed — leaving someone looking
      // signed in when they asked not to be is the worse failure.
      setCustomer(null);
      setStatus("guest");
    }
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ customer, status, login, register, logout, refresh }),
    [customer, status, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Best-effort display name for greetings. Falls back to the local part. */
export function customerName(customer: Customer | null): string {
  if (!customer) return "";
  const full = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();
  return full || customer.email.split("@")[0];
}
