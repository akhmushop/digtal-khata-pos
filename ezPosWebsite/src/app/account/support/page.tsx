import { SupportCenter } from "@/components/account/support-center";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function AccountSupportPage() {
  return <SupportCenter />;
}
