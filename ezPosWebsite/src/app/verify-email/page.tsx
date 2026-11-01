import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { VerifyEmailContent } from "@/components/forms/verify-email-content";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Confirm your ezPos email address.",
  robots: { index: false },
};

export default function VerifyEmailPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Suspense
            fallback={
              <p className="text-sm text-slate-500" role="status">
                Checking your verification link…
              </p>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link
            href="/sign-in"
            className="font-medium text-indigo-700 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </Container>
    </section>
  );
}
