import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SignInForm } from "@/components/forms/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your ezPos account.",
  robots: { index: false },
};

export default function SignInPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to open your ezPos workspace.
          </p>

          <div className="mt-6">
            <SignInForm />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to ezPos?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-indigo-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </Container>
    </section>
  );
}
