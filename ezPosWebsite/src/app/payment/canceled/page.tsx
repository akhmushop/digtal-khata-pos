import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Payment canceled",
  description: "Your ezPos payment was canceled.",
  robots: { index: false },
};

export default function PaymentCanceledPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Payment canceled
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            You canceled the checkout. Nothing was charged — your invoice is
            still waiting whenever you are ready.
          </p>
          <Link
            href="/account/billing"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Back to billing
          </Link>
        </div>
      </Container>
    </section>
  );
}
