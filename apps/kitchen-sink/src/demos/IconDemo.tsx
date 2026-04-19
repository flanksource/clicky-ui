import { Icon } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

const ICONS = [
  "codicon:check",
  "codicon:error",
  "codicon:warning",
  "codicon:info",
  "codicon:beaker",
  "codicon:rocket",
  "svg-spinners:ring-resize",
];

export function IconDemo() {
  return (
    <DemoSection
      id="icon"
      title="Icon"
      description={
        <>
          Thin wrapper over the <code>&lt;iconify-icon&gt;</code> web component. Add the iconify script
          tag to your host HTML.
        </>
      }
    >
      <DemoRow label="Samples">
        {ICONS.map((name) => (
          <div key={name} className="flex items-center gap-density-2 text-sm">
            <Icon name={name} className="text-xl" />
            <code className="text-xs text-muted-foreground">{name}</code>
          </div>
        ))}
      </DemoRow>
    </DemoSection>
  );
}
