import type { ReactNode } from "react";
import { Badge, Button } from "@flanksource/clicky-ui";
import {
  UiCloud,
  UiFingerprint,
  UiRefresh,
  UiRobotAi,
  UiTerminal,
} from "@flanksource/clicky-ui/icons";

import type { RuntimeAdapter } from "./topology-model";

export function PageLead({ children }: { children: ReactNode }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-density-3 border-b border-border pb-density-3">
      <div className="flex min-w-0 items-start gap-density-3">
        <UiFingerprint className="mt-0.5 size-6 shrink-0 text-muted-foreground" />
        <div className="space-y-density-1">
          <h2 className="text-lg font-semibold">AI runtimes</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">{children}</p>
        </div>
      </div>
      <Button size="sm" variant="outline">
        <UiRefresh />
        Refresh catalog
      </Button>
    </header>
  );
}

export function RuntimeGlyph({ adapter }: { adapter: RuntimeAdapter }) {
  if (adapter.mode === "api") return <UiCloud className="size-5" />;
  if (adapter.mode === "agent") return <UiRobotAi className="size-5" />;
  return <UiTerminal className="size-5" />;
}

export function RuntimeStatus({
  adapter,
  enabled,
}: {
  adapter: RuntimeAdapter;
  enabled: boolean;
}) {
  if (!enabled) {
    return (
      <Badge size="xs" tone="warning" clickToCopy={false}>
        Disabled
      </Badge>
    );
  }
  return (
    <Badge
      size="xs"
      tone={adapter.ready ? "success" : "warning"}
      clickToCopy={false}
    >
      {adapter.ready ? "Ready" : "Needs setup"}
    </Badge>
  );
}
