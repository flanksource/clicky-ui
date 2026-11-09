import type { ReactNode } from "react";
import { VocabularyPreview, type VocabularyDeclarationItem } from "@flanksource/clicky-ui/comments";

export function VocabularyPage({ title, description, items, specimen }: { title: string; description: string; items: readonly VocabularyDeclarationItem[]; specimen: (item: VocabularyDeclarationItem) => ReactNode }) {
  const types = [...new Set(items.map(item => item.type))];
  return <article className="space-y-8">
    <header className="space-y-2">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
    {types.map(type => <section key={type} className="space-y-4">
      <h2 className="text-lg font-semibold">{type}</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.filter(item => item.type === type).map(item => <div key={item.id} className="flex min-w-0 flex-col items-start gap-4 rounded border border-border p-4 sm:flex-row sm:items-center">
          <VocabularyPreview id={item.id}>{specimen(item)}</VocabularyPreview>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-sm font-medium">{item.label}</h3>
            <p className="break-all font-mono text-xs text-muted-foreground">{item.id}</p>
            <p className="text-sm">{item.description}</p>
          </div>
        </div>)}
      </div>
    </section>)}
  </article>;
}
