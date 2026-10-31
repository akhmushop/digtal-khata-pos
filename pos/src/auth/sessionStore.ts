import { create } from "zustand";
import { WILDCARD_PERMISSION } from "../lib/rbac";

export interface SessionRole {
  id: number;
  name: string;
  slug: string;
}

export interface SessionState {
  user: {
    id?: number | undefined;
    fullName?: string | undefined;
    email?: string | undefined;
  } | null;
  businessId: number | null;
  roleSlug: string | null;
  roleName: string | null;
  roles: SessionRole[];
  permissions: string[];
  /** Bumped whenever the session context is (re)loaded — useful as a dep. */
  version: number;
}

interface SessionStore extends SessionState {
  setSession: (state: Omit<SessionState, "version">) => void;
  clearSession: () => void;
}

/**
 * Client-side snapshot of the signed-in user's effective permissions for the
 * active business. Written by the session bootstrap in api/axios.ts after
 * /auth/me. This is UX ONLY — route guards and hidden buttons shape the
 * interface; the backend re-verifies every request against the database.
 */
export const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  businessId: null,
  roleSlug: null,
  roleName: null,
  roles: [],
  permissions: [],
  version: 0,
  setSession: (state) => set(() => ({ ...state, version: Date.now() })),
  clearSession: () =>
    set(() => ({
      user: null,
      businessId: null,
      roleSlug: null,
      roleName: null,
      roles: [],
      permissions: [],
      version: Date.now(),
    })),
}));

export function hasPermission(permission: string): boolean {
  const { permissions } = useSessionStore.getState();
  return (
    permissions.includes(WILDCARD_PERMISSION) ||
    permissions.includes(permission)
  );
}

export function hasAnyPermission(required: string[]): boolean {
  if (required.length === 0) return true;
  return required.some((permission) => hasPermission(permission));
}

export function hasAllPermissions(required: string[]): boolean {
  return required.every((permission) => hasPermission(permission));
}
