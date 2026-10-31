import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PaymentSuccessContent } from "@/components/payments/payment-success-content";

export const metadata: Metadata = {
  title: "Payment status",
  description: "Your ezPos payment status.",
  robots: { index: false },
};

export default function PaymentSuccessPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Suspense
            fallback={
              <p className="text-sm text-slate-500" role="status">
                Checking your payment…
              </p>
            }
          >
            <PaymentSuccessContent />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link
            href="/account/billing"
            className="font-medium text-indigo-700 hover:underline"
          >
            Back to billing
          </Link>
        </p>
      </Container>
    </section>
  );
}
