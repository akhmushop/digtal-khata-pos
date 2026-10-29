"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearAccessToken,
  fetchMe,
  refreshSession,
  signOut as authSignOut,
  type BusinessMembership,
  type SessionUser,
} from "@/lib/api/auth";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  businesses: BusinessMembership[];
  refresh: () => Promise<void>;
  onSignedIn: () => Promise<void>;
  onSignedOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [businesses, setBusinesses] = useState<BusinessMembership[]>([]);

  const refresh = useCallback(async () => {
    const me = await fetchMe();
    if (me) {
      setUser(me.user);
      setBusinesses(me.businesses);
      setStatus("authenticated");
    } else {
      setUser(null);
      setBusinesses([]);
      setStatus("anonymous");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Restore the session from the HttpOnly refresh cookie on first load.
      await refreshSession();
      if (cancelled) return;
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const onSignedIn = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const onSignedOut = useCallback(() => {
    authSignOut();
    clearAccessToken();
    setUser(null);
    setBusinesses([]);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ status, user, businesses, refresh, onSignedIn, onSignedOut }),
    [status, user, businesses, refresh, onSignedIn, onSignedOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
