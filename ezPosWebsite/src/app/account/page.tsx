import { AccountOverview } from "@/components/account/account-overview";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function AccountPage() {
  return <AccountOverview />;
}
