"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Store, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/industries", label: "Industries" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { status, onSignedOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const authenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg py-1 text-lg font-semibold tracking-tight"
          aria-label="ezPos home"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Store className="size-4.5" aria-hidden="true" />
          </span>
          ezPos
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? null : authenticated ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  buttonClasses({ variant: "ghost" }),
                  pathname.startsWith("/dashboard") && "text-indigo-700",
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/account"
                className={cn(
                  buttonClasses({ variant: "ghost" }),
                  pathname.startsWith("/account") && "text-indigo-700",
                )}
              >
                Account
              </Link>
              <Link
                href="/"
                className={buttonClasses({ variant: "outline" })}
                onClick={() => {
                  onSignedOut();
                  router.refresh();
                }}
              >
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={buttonClasses({ variant: "ghost" })}
              >
                Sign in
              </Link>
              <Link href="/sign-up" className={buttonClasses()}>
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-100",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3">
            {status === "loading" ? null : authenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={buttonClasses({ variant: "outline" })}
                >
                  Dashboard
                </Link>
                <Link
                  href="/"
                  onClick={() => {
                    onSignedOut();
                    setMenuOpen(false);
                    router.refresh();
                  }}
                  className={buttonClasses()}
                >
                  Sign out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className={buttonClasses({ variant: "outline" })}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className={buttonClasses()}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
