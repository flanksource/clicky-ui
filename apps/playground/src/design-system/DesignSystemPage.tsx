import type { ReactNode } from "react";
import type { StaticIconComponent } from "@flanksource/clicky-ui";

type DesignSystemPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: StaticIconComponent;
  children: ReactNode;
};

type SpecimenSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function DesignSystemPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: DesignSystemPageProps) {
  return (
    <main className="mx-auto w-full max-w-screen-2xl space-y-density-6 pb-density-8">
      <header className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="h-1 bg-gradient-to-r from-primary via-sky-500 to-indigo-500" />
        <div className="flex flex-col gap-density-4 p-density-5 sm:flex-row sm:items-center">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}

export function SpecimenSection({ title, description, children }: SpecimenSectionProps) {
  return (
    <section className="space-y-density-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}
