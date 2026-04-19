import { useState } from "react";
import {
  FilterPill,
  FilterPillGroup,
  FilterSeparator,
  type FilterMode,
} from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

export function FilterPillDemo() {
  const [binary, setBinary] = useState<Record<string, boolean>>({ failed: true });
  const [tri, setTri] = useState<Record<string, FilterMode>>({});

  return (
    <DemoSection
      id="filter-pill"
      title="FilterPill / FilterPillGroup"
      description="Primitive for building custom filter bars — binary or tri-state modes."
    >
      <DemoRow label="Binary">
        <FilterPillGroup>
          {[
            { key: "failed", label: "Failed", count: 3, badge: "bg-red-500" },
            { key: "passed", label: "Passed", count: 42, badge: "bg-green-500" },
            { key: "skipped", label: "Skipped", count: 5, badge: "bg-yellow-400" },
          ].map((f) => (
            <FilterPill
              key={f.key}
              label={f.label}
              count={f.count}
              badge={f.badge}
              mode={binary[f.key] ? "active" : "neutral"}
              onClick={() => setBinary((b) => ({ ...b, [f.key]: !b[f.key] }))}
            />
          ))}
        </FilterPillGroup>
      </DemoRow>
      <DemoRow label="Tri-state">
        <FilterPillGroup>
          {["jest", "ginkgo", "pytest"].map((fw) => (
            <FilterPill
              key={fw}
              label={fw}
              mode={tri[fw] ?? "neutral"}
              onModeChange={(next) => setTri((s) => ({ ...s, [fw]: next }))}
            />
          ))}
          <FilterSeparator />
          {["linter", "vet"].map((l) => (
            <FilterPill
              key={l}
              label={l}
              mode={tri[l] ?? "neutral"}
              onModeChange={(next) => setTri((s) => ({ ...s, [l]: next }))}
            />
          ))}
        </FilterPillGroup>
      </DemoRow>
    </DemoSection>
  );
}
