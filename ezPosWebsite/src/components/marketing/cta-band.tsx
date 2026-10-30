import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function CtaBand({
  title = "Get your shop on ezPos",
  description = "Explore what ezPos can do for your counter — accounts and billing open soon.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section aria-labelledby="cta-heading" className="pb-16 sm:pb-24">
      <Container>
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-14 text-center sm:px-16">
          <h2
            id="cta-heading"
            className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-indigo-100">
            {description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="/sign-up"
              size="lg"
              className="bg-white text-indigo-700 hover:bg-indigo-50 focus-visible:outline-white"
            >
              Create your account
            </ButtonLink>
            <ButtonLink
              href="/features"
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10"
            >
              Explore features
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
