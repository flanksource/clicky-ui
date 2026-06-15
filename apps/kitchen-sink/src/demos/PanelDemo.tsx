import { Panel, UiWarningCircle as WarnIcon } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

export function PanelDemo() {
  return (
    <DemoSection
      id="panel"
      title="Panel"
      description="Non-collapsible carded surface with an optional header (title, icon, count pill, right-aligned actions) and footer. Use for content panels where Section's disclosure behaviour isn't wanted."
    >
      <div className="grid gap-density-3 md:grid-cols-2">
        <Panel title="Checks" count={6}>
          <ul className="text-sm space-y-density-1">
            <li>build · passed</li>
            <li>lint · passed</li>
            <li>test · failed</li>
          </ul>
        </Panel>

        <Panel
          title="Errors"
          icon={WarnIcon}
          tone="danger"
          count={3}
          actions={
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Copy
            </button>
          }
          footer={<span className="text-xs text-muted-foreground">3 of 12 shown</span>}
        >
          <div className="text-sm text-muted-foreground">Stack traces would go here.</div>
        </Panel>

        <Panel>
          <p className="text-sm">Headerless panel — just a plain card with a border.</p>
        </Panel>

        <Panel title="Files" count={3} padded={false}>
          <div className="divide-y divide-border text-sm">
            {["handler.go", "service.go", "router.go"].map((f) => (
              <div key={f} className="px-density-3 py-density-2 font-mono">
                {f}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DemoSection>
  );
}
