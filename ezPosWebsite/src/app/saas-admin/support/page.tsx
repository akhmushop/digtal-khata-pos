import { AdminSupport } from "@/components/saas-admin/admin-support";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function SaasAdminSupportPage() {
  return <AdminSupport />;
}
