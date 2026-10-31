import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a password-reset link for your ezPos account.",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the email on your account and we will send a link to choose
            a new password.
          </p>
          <div className="mt-6">
            <Suspense fallback={null}>
              <ForgotPasswordForm />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          Remembered it?{" "}
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
