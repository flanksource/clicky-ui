import { Button } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

export function ButtonDemo() {
  return (
    <DemoSection
      id="button"
      title="Button"
      description="shadcn-style button with variants and sizes."
    >
      <DemoRow label="Variants">
        <Button>Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button disabled>Disabled</Button>
      </DemoRow>
      <DemoRow label="Sizes">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </DemoRow>
    </DemoSection>
  );
}
