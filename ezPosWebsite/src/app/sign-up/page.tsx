import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Alert } from "@/components/ui/alert";
import { SignUpForm } from "@/components/forms/sign-up-form";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create your ezPos account and set up your business workspace.",
  robots: { index: false },
};

export default function SignUpPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            One account for you and your business — you will be the owner and
            can invite your team later.
          </p>

          <div className="mt-6">
            <Alert title="Free 14-day trial" className="mb-6">
              Creating a business starts a 14-day free trial — no payment
              details required. After the trial, your data stays readable and
              you can pick a plan to continue.
            </Alert>
            <SignUpForm />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-indigo-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Container>
    </section>
  );
}
