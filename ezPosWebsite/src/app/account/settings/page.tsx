import { AccountSettings } from "@/components/account/account-settings";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function AccountSettingsPage() {
  return <AccountSettings />;
}
