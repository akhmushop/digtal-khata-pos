import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

/**
 * Session bootstrap (multi-tenancy).
 *
 * The signed-in user's access token is held in memory and restored from the
 * backend's HttpOnly refresh cookie on startup — never persisted in
 * localStorage. Every request carries the token AND the active business id
 * (X-Business-Id header): the backend requires the header on every
 * business-scoped route and verifies ownership itself. A 401 triggers one
 * silent refresh-and-retry; a failed refresh redirects to the website to
 * sign in again. All authorization is still enforced by the backend.
 *
 * IMPORTANT: every request in this module MUST go through the configured
 * `api` instance. The bare `axios` library has no baseURL, so calls resolve
 * against the page origin (localhost:5173) and 404 on the Vite dev server.
 */

const WEBSITE_URL =
  import.meta.env.VITE_WEBSITE_URL || "http://localhost:3001";

let accessToken: string | null = null;
let activeBusinessId: number | null = null;
let bootstrapPromise: Promise<void> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getActiveBusinessId(): number | null {
  return activeBusinessId;
}

export function clearSession(): void {
  accessToken = null;
  activeBusinessId = null;
  bootstrapPromise = null;
}

function redirectToSignIn(reason?: string): void {
  const query = reason ? `?pos_error=${encodeURIComponent(reason)}` : "";
  window.location.href = `${WEBSITE_URL}/sign-in${query}`;
}

async function loadSession(): Promise<void> {
  // 1. New access token from the HttpOnly refresh cookie. A 401 here can
  //    also mean a concurrent caller just rotated the cookie (the winner's
  //    new cookie is already in the jar) — retry once before giving up.
  const attemptRefresh = () =>
    api.post<{ accessToken?: string }>("/auth/refresh", null, {
      withCredentials: true,
    });
  let res = await attemptRefresh().catch((err) => err.response ?? null);
  if (!res || res.status !== 200) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    res = await attemptRefresh().catch((err) => err.response ?? null);
  }
  accessToken = res?.data?.accessToken ?? null;
  if (accessToken === null || res?.status !== 200) {
    redirectToSignIn(`refresh_failed_${res?.status ?? "network"}`);
    return;
  }

  // 2. Resolve the active business from the session's memberships. The
  //    backend picks nothing for us; the POS defaults to the first business.
  //    (A business switcher is future work.)
  try {
    const me = await api.get<{ businesses?: { businessId: number }[] }>(
      "/auth/me",
    );
    const first = me.data.businesses?.[0];
    activeBusinessId = first?.businessId ?? null;
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : "network";
    redirectToSignIn(`me_failed_${status}`);
    return;
  }

  // 3. Signed in but no business yet — the website dashboard is where
  //    businesses are created.
  if (activeBusinessId === null) {
    window.location.href = `${WEBSITE_URL}/dashboard`;
  }
}

/**
 * Restores the session exactly ONCE per page load.
 *
 * The refresh endpoint ROTATES the cookie: two concurrent calls presenting
 * the same cookie make the second one 401 (React StrictMode double-invokes
 * effects in dev). All callers therefore share one in-flight bootstrap, and
 * a completed bootstrap short-circuits.
 */
export function bootstrapSession(): Promise<void> {
  if (accessToken && activeBusinessId) return Promise.resolve();
  if (!bootstrapPromise) {
    bootstrapPromise = loadSession().catch((err) => {
      clearSession();
      throw err;
    });
  }
  return bootstrapPromise;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (activeBusinessId !== null) {
    config.headers["X-Business-Id"] = String(activeBusinessId);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config ?? {};
    if (
      error.response?.status === 401 &&
      !original._retried &&
      !original.url?.includes("/auth/")
    ) {
      original._retried = true;
      // Deduplicated: this waits on the in-flight bootstrap instead of
      // starting a second refresh rotation with the same cookie.
      await bootstrapSession().catch(() => undefined);
      if (accessToken !== null && activeBusinessId !== null) {
        return api(original);
      }
      redirectToSignIn(
        `401_retry_${String(original.url ?? "?")}_token=${accessToken !== null}_biz=${activeBusinessId !== null}`,
      );
    }
    return Promise.reject(error);
  },
);

export default api;
