import { SubscriptionManager } from "@/components/account/subscription-manager";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function AccountSubscriptionPage() {
  return <SubscriptionManager />;
}
