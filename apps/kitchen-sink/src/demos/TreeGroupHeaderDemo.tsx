import { useState } from "react";
import { TreeGroupHeader, type StaticIconComponent } from "@flanksource/clicky-ui";
import SymbolClassIcon from "@iconify-react/codicon/symbol-class";
import SymbolInterfaceIcon from "@iconify-react/codicon/symbol-interface";
import { DemoSection } from "./Section";

const GROUPS: Array<{ kind: string; icon: StaticIconComponent; items: string[] }> = [
  { kind: "Pod", icon: SymbolClassIcon, items: ["api-server", "worker", "scheduler"] },
  { kind: "Service", icon: SymbolInterfaceIcon, items: ["api", "auth"] },
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
