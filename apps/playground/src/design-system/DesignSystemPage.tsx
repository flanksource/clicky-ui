import type { ReactNode } from "react";
import type { StaticIconComponent } from "@flanksource/clicky-ui";

type DesignSystemPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: StaticIconComponent;
  /** Sticky jump list, for pages long enough that scrolling loses the reader. */
  sections?: readonly SectionLink[];
  children: ReactNode;
};

export type SectionLink = { id: string; label: string };

type SpecimenSectionProps = {
  title: string;
  description?: string;
  /** Anchor target; pair with a `sections` entry to appear in the jump list. */
  id?: string;
  children: ReactNode;
};

export function DesignSystemPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  sections,
  children,
}: DesignSystemPageProps) {
  return (
    <main className="mx-auto w-full max-w-screen-2xl space-y-density-6 pb-density-8">
      <header className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gradient-to-r from-primary via-sky-500 to-indigo-500" />
        <div className="flex flex-col gap-density-4 p-density-4 sm:flex-row sm:items-center">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        {sections && sections.length > 0 && (
          <nav
            aria-label="On this page"
            className="flex flex-wrap gap-density-2 border-t border-border bg-muted/40 px-density-4 py-density-3"
          >
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-primary"
              >
                {section.label}
              </a>
            ))}
          </nav>
        )}
      </header>
      {children}
    </main>
  );
}

export function SpecimenSection({
  title,
  description,
  id,
  children,
}: SpecimenSectionProps) {
  return (
    <section
      {...(id ? { id } : {})}
      className="scroll-mt-density-4 space-y-density-3"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}
