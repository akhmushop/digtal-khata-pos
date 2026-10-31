import { InvoiceView } from "@/components/account/invoice-view";

// Client-rendered behind auth — excluded from instant-nav prerender.
export const instant = false;

export default function AccountInvoicePage() {
  return <InvoiceView />;
}
