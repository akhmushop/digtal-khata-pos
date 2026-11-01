import { AdminBusinesses } from "@/components/saas-admin/admin-businesses";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function SaasAdminBusinessesPage() {
  return <AdminBusinesses />;
}
