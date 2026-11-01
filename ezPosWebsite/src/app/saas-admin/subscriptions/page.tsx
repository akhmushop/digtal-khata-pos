import { AdminSubscriptions } from "@/components/saas-admin/admin-subscriptions";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function SaasAdminSubscriptionsPage() {
  return <AdminSubscriptions />;
}
