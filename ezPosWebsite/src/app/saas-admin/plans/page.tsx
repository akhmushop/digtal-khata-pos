import { AdminPlans } from "@/components/saas-admin/admin-plans";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function SaasAdminPlansPage() {
  return <AdminPlans />;
}
