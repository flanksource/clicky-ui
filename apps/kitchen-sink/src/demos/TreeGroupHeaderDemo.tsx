import { useState } from "react";
import { TreeGroupHeader } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const GROUPS = [
  { kind: "Pod", icon: "codicon:symbol-class", items: ["api-server", "worker", "scheduler"] },
  { kind: "Service", icon: "codicon:symbol-interface", items: ["api", "auth"] },
];

export function TreeGroupHeaderDemo() {
  const [open, setOpen] = useState<Record<string, boolean>>({ Pod: true });

  return (
    <DemoSection
      id="tree-group"
      title="TreeGroupHeader"
      description="The '▼ icon Name (count)' header used above grouped subtrees."
    >
      <div className="border border-border rounded-md overflow-hidden bg-background">
        {GROUPS.map((g) => (
          <div key={g.kind}>
            <TreeGroupHeader
              icon={g.icon}
              title={g.kind}
              count={g.items.length}
              open={!!open[g.kind]}
              onToggle={() => setOpen((s) => ({ ...s, [g.kind]: !s[g.kind] }))}
            />
            {open[g.kind] && (
              <ul className="pl-density-6 py-density-1 text-sm">
                {g.items.map((i) => (
                  <li key={i} className="py-0.5">
                    {i}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </DemoSection>
  );
}
