import { AdminOverview } from "@/components/saas-admin/admin-overview";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function SaasAdminPage() {
  return <AdminOverview />;
}
