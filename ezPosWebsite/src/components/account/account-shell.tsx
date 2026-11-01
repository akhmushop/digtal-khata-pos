"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  Settings,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { useActiveBusiness } from "@/hooks/useActiveBusiness";

const NAV = [
  { href: "/account", label: "Overview", icon: Store },
  { href: "/dashboard", label: "Business dashboard", icon: LayoutDashboard, external: true },
  { href: "/account/subscription", label: "Subscription", icon: CreditCard },
  { href: "/account/billing", label: "Billing", icon: Receipt },
  { href: "/account/settings", label: "Settings", icon: Settings },
  { href: "/account/support", label: "Support", icon: LifeBuoy },
] as const;

export function AccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();
  const { businesses, businessId, switchBusiness } = useActiveBusiness();

  useEffect(() => {
    if (status === "anonymous") router.replace("/sign-in");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <p className="py-24 text-center text-sm text-slate-500" role="status">
        {status === "loading" ? "Loading your account…" : "Redirecting…"}
      </p>
    );
  }

  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {businesses.length > 1 ? (
          <div className="mb-6 flex items-center gap-2 text-sm">
            <Building2
              className="size-4 shrink-0 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="business-switcher" className="text-slate-500">
              Business:
            </label>
            <select
              id="business-switcher"
              value={businessId ?? ""}
              onChange={(event) => switchBusiness(Number(event.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm"
            >
              {businesses.map((b) => (
                <option key={b.businessId} value={b.businessId}>
                  {b.businessName}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Account navigation">
            <ul className="flex gap-1 overflow-x-auto lg:flex-col">
              {NAV.map((item) => {
                const active =
                  "external" in item
                    ? false
                    : item.href === "/account"
                      ? pathname === "/account"
                      : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      )}
                    >
                      <item.icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
