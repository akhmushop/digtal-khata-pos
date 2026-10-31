import { AdminPayments } from "@/components/saas-admin/admin-payments";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function SaasAdminPaymentsPage() {
  return <AdminPayments />;
}
