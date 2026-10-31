import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { OnboardingWizard } from "@/components/forms/onboarding-wizard";

export const metadata: Metadata = {
  title: "Set up your business",
  description: "Complete your ezPos business setup.",
  robots: { index: false },
};

export default function OnboardingPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-xl">
        <Suspense
          fallback={
            <p className="text-center text-sm text-slate-500" role="status">
              Loading setup…
            </p>
          }
        >
          <OnboardingWizard />
        </Suspense>
      </Container>
    </section>
  );
}
