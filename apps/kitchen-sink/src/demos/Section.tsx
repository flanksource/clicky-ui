import type { ReactNode } from "react";

export type DemoSectionProps = {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

export function DemoSection({ id, title, description, children }: DemoSectionProps) {
  return (
    <section id={id} className="space-y-density-3 scroll-mt-density-4">
      <header className="space-y-density-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </header>
      <div className="rounded-lg border border-border bg-background p-density-4 space-y-density-3">
        {children}
      </div>
    </section>
  );
}

export function DemoRow({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-density-3">
      {label && <span className="w-28 text-xs text-muted-foreground">{label}</span>}
      <div className="flex flex-wrap items-center gap-density-2">{children}</div>
    </div>
  );
}
