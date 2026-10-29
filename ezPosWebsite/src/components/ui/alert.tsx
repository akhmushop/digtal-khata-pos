import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "info" | "warning";

const toneStyles: Record<AlertTone, string> = {
  info: "border-indigo-200 bg-indigo-50 text-indigo-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
  role = "status",
}: {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  className?: string;
  /** "alert" for errors the user must act on; defaults to "status". */
  role?: "status" | "alert";
}) {
  return (
    <div
      role={role}
      className={cn("flex gap-3 rounded-lg border p-4 text-sm", toneStyles[tone], className)}
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-medium">{title}</p>
        {children ? (
          <div className="mt-1 leading-relaxed opacity-90">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
