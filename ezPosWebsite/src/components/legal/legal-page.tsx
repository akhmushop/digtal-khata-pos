import { Container } from "@/components/ui/container";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

/**
 * Shared layout for the legal pages (terms, privacy, refund policy).
 * Content is data-driven so every legal page reads consistently.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
        {intro ? (
          <p className="mt-6 text-base leading-7 text-slate-600">{intro}</p>
        ) : null}
        <div className="mt-10 space-y-10">
          {sections.map((section) => {
            const anchor = section.heading
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            return (
              <section key={anchor} aria-labelledby={`${anchor}-heading`}>
                <h2
                  id={`${anchor}-heading`}
                  className="text-lg font-semibold text-slate-900"
                >
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
