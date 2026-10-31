import { WebhooksCenter } from "@/components/account/webhooks-center";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function AccountWebhooksPage() {
  return <WebhooksCenter />;
}
