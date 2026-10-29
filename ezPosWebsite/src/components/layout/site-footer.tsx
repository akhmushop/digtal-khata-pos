import Link from "next/link";
import { Store } from "lucide-react";
import { Container } from "@/components/ui/container";

const productLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

const accountLinks = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create account" },
] as const;

// Evaluated once at build/startup — calling new Date() during render breaks
// static prerendering under Cache Components.
const CURRENT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Store className="size-4.5" aria-hidden="true" />
              </span>
              ezPos
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              A web-based point of sale for small and medium retailers —
              billing, inventory, purchasing, and reports in one place.
            </p>
          </div>

          <nav aria-label="Product">
            <h2 className="text-sm font-semibold text-slate-900">Product</h2>
            <ul className="mt-3 space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-indigo-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account">
            <h2 className="text-sm font-semibold text-slate-900">Account</h2>
            <ul className="mt-3 space-y-2">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-indigo-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {CURRENT_YEAR} ezPos. All rights reserved.</p>
          <p>Currently in development — accounts and billing open soon.</p>
        </div>
      </Container>
    </footer>
  );
}
