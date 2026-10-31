import { MapPin } from "lucide-react";
import { useSessionStore } from "@/auth/sessionStore";

/**
 * Compact read-only indicator of the active location — used on screens
 * without the sidebar (the POS register). The switcher itself lives in the
 * sidebar header.
 */
export function LocationBadge() {
  const activeLocationName = useSessionStore(
    (state) => state.activeLocationName,
  );
  const activeLocationId = useSessionStore((state) => state.activeLocationId);

  if (activeLocationId === null) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-xs">
      <MapPin className="size-3.5" />
      {activeLocationName ?? "Location"}
    </span>
  );
}
