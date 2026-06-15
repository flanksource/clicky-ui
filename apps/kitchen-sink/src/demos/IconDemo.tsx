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
          Kitchen sink-only dynamic loading demo for user supplied icon names via{" "}
          <code>&lt;iconify-icon&gt;</code>.
        </>
      }
    >
      <DemoRow label="Samples">
        {ICONS.map((name) => (
          <div key={name} className="flex items-center gap-density-2 text-sm">
            <iconify-icon icon={name} class="text-xl" />
            <code className="text-xs text-muted-foreground">{name}</code>
          </div>
        ))}
      </DemoRow>
    </DemoSection>
  );
}
