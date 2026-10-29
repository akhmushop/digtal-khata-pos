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
 */

const WEBSITE_URL =
  import.meta.env.VITE_WEBSITE_URL || "http://localhost:3001";

let accessToken: string | null = null;
let activeBusinessId: number | null = null;
let refreshing: Promise<boolean> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getActiveBusinessId(): number | null {
  return activeBusinessId;
}

export function clearSession(): void {
  accessToken = null;
  activeBusinessId = null;
}

function redirectToSignIn(): void {
  window.location.href = `${WEBSITE_URL}/sign-in`;
}

async function loadSession(): Promise<void> {
  // 1. New access token from the HttpOnly refresh cookie.
  const res = await axios.post<{ accessToken?: string }>(
    "/auth/refresh",
    null,
    { withCredentials: true },
  );
  accessToken = res.data.accessToken ?? null;
  if (!accessToken) {
    redirectToSignIn();
    return;
  }

  // 2. Resolve the active business from the session's memberships. The
  //    backend picks nothing for us; the POS defaults to the first business.
  //    (A business switcher is future work.)
  const me = await axios.get<{
    businesses?: { businessId: number }[];
  }>("/auth/me");
  const first = me.data.businesses?.[0];
  activeBusinessId = first?.businessId ?? null;

  // 3. Signed in but no business yet — the website dashboard is where
  //    businesses are created.
  if (activeBusinessId === null) {
    window.location.href = `${WEBSITE_URL}/dashboard`;
  }
}

export async function bootstrapSession(): Promise<void> {
  if (accessToken && activeBusinessId) return;
  try {
    await loadSession();
  } catch {
    clearSession();
    redirectToSignIn();
  }
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
      const ok = refreshing
        ? await refreshing
        : await (refreshing = bootstrapSession()
            .then(() => accessToken !== null && activeBusinessId !== null)
            .finally(() => {
              refreshing = null;
            }));
      if (ok) {
        return api(original);
      }
      redirectToSignIn();
    }
    return Promise.reject(error);
  },
);

export default api;
