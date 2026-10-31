import { IntegrationsCenter } from "@/components/account/integrations-center";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function AccountIntegrationsPage() {
  return <IntegrationsCenter />;
}
