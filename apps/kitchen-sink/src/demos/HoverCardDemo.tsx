import { HoverCard } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

export function HoverCardDemo() {
  return (
    <DemoSection
      id="hover-card"
      title="HoverCard"
      description="Lightweight tooltip-style overlay triggered by hover or focus."
    >
      <DemoRow>
        <HoverCard
          placement="top"
          trigger={<span className="underline cursor-help text-sm">hover for status</span>}
        >
          <div className="font-medium text-green-600">Up to date</div>
          <div className="text-muted-foreground mt-0.5">Last synced 2m ago</div>
        </HoverCard>
        <HoverCard
          placement="bottom"
          trigger={<span className="underline cursor-help text-sm">hover for details</span>}
        >
          <div className="font-medium">Deployment</div>
          <div className="text-muted-foreground">rev abc123 · running</div>
        </HoverCard>
      </DemoRow>
    </DemoSection>
  );
}
