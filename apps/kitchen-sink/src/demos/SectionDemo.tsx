import { DetailEmptyState, Section } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

export function SectionDemo() {
  return (
    <DemoSection
      id="section"
      title="Section / DetailEmptyState"
      description="Collapsible section building-block for detail panels, plus an empty-state helper."
    >
      <Section title="Configuration" summary="4 items" defaultOpen>
        <ul className="text-sm space-y-density-1">
          <li>key = value</li>
          <li>timeout = 30s</li>
          <li>retries = 3</li>
          <li>mode = strict</li>
        </ul>
      </Section>
      <Section title="Errors" tone="danger" summary="3 violations" icon="codicon:error">
        <div className="text-sm text-muted-foreground">Stack traces would go here.</div>
      </Section>
      <Section title="Nested example" defaultOpen>
        <Section title="Created" summary="2026-01-01" defaultOpen>
          <span className="text-xs">by alice</span>
        </Section>
        <Section title="Updated" summary="2026-04-12">
          <span className="text-xs">by bob</span>
        </Section>
      </Section>
      <div className="border-t border-border pt-density-3">
        <DetailEmptyState
          icon="codicon:inbox"
          label="Nothing selected"
          description="Pick an item from the tree to see its details."
        />
      </div>
    </DemoSection>
  );
}
