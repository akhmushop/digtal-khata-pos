import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your ezPos account.",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Choose a new password
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Pick something strong you do not use anywhere else.
          </p>
          <div className="mt-6">
            <Suspense fallback={null}>
              <ResetPasswordForm />
            </Suspense>
          </div>
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
