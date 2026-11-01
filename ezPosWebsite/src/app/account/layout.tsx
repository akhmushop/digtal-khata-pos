import { Suspense } from "react";
import type { Metadata } from "next";
import { AccountShell } from "@/components/account/account-shell";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your ezPos subscription, billing, and settings.",
  robots: { index: false },
};

export default function AccountLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AccountShell>{children}</AccountShell>
    </Suspense>
  );
}
