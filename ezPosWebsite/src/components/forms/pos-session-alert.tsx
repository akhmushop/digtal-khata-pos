"use client";

import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/alert";

/**
 * The POS frontend redirects here with ?pos_error=… when it cannot restore
 * the session (e.g. an expired refresh cookie). Explain that instead of
 * showing an unexplained sign-in form.
 */
export function PosSessionAlert() {
  const params = useSearchParams();
  if (!params.get("pos_error")) return null;
  return (
    <Alert tone="warning" title="Your POS session has expired" className="mt-4">
      Sign in again to continue where you left off.
    </Alert>
  );
}
