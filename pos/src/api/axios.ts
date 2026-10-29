import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

/**
 * Session bootstrap (multi-tenancy).
 *
 * The signed-in user's access token is held in memory and restored from the
 * backend's HttpOnly refresh cookie on startup — never persisted in
 * localStorage. Every request carries the token; a 401 triggers one silent
 * refresh-and-retry, and a failed refresh redirects to the website to sign
 * in again. All authorization is still enforced by the backend.
 */

const WEBSITE_URL =
  import.meta.env.VITE_WEBSITE_URL || "http://localhost:3001";

let accessToken: string | null = null;
let refreshing: Promise<boolean> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearSession(): void {
  accessToken = null;
}

function redirectToSignIn(): void {
  window.location.href = `${WEBSITE_URL}/sign-in`;
}

export async function bootstrapSession(): Promise<void> {
  if (accessToken) return;
  // The backend issues a new access token from the HttpOnly refresh cookie.
  try {
    const res = await axios.post<{ accessToken?: string }>(
      "/auth/refresh",
      null,
      { withCredentials: true },
    );
    accessToken = res.data.accessToken ?? null;
  } catch {
    accessToken = null;
  }
  if (!accessToken) redirectToSignIn();
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
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
        : await (refreshing = bootstrapSession().then(() => {
            refreshing = null;
            return accessToken !== null;
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
