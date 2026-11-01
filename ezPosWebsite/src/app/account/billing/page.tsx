import { BillingHistory } from "@/components/account/billing-history";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function AccountBillingPage() {
  return <BillingHistory />;
}
