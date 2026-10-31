import { Link } from "react-router";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Professional 403 page shown when a user reaches a route they lack
 *  permission for (direct URL entry or a revoked permission). */
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldOff className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        You do not have permission to view this page. If you believe this is a
        mistake, ask your business owner to review your role assignments.
      </p>
      <Button render={<Link to="/dashboard" />}>Back to dashboard</Button>
    </div>
  );
}
