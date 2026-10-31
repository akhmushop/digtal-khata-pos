import { Suspense } from "react";
import type { Metadata } from "next";
import { SaasAdminShell } from "@/components/saas-admin/admin-shell";

export const metadata: Metadata = {
  title: "SaaS Admin",
  description: "ezPos platform administration.",
  robots: { index: false },
};

export default function SaasAdminLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SaasAdminShell>{children}</SaasAdminShell>
    </Suspense>
  );
}
