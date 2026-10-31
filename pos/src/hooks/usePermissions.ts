import { useSessionStore } from "../auth/sessionStore";

/**
 * Reactive permission checks for the active business, backed by the session
 * store (populated from /auth/me). UX shaping only — the backend re-verifies
 * every request.
 */
export function usePermissions() {
  const permissions = useSessionStore((state) => state.permissions);
  const roleSlug = useSessionStore((state) => state.roleSlug);
  const version = useSessionStore((state) => state.version);

  const hasPermission = (permission: string): boolean =>
    permissions.includes("*") || permissions.includes(permission);

  const hasAnyPermission = (required: string[]): boolean =>
    required.length === 0 ||
    required.some((permission) => hasPermission(permission));

  const hasAllPermissions = (required: string[]): boolean =>
    required.every((permission) => hasPermission(permission));

  return { permissions, roleSlug, version, hasPermission, hasAnyPermission, hasAllPermissions };
}
