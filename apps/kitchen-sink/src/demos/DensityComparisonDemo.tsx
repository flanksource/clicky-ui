import { useState, type ReactNode } from "react";
import {
  Combobox,
  type ComboboxOption,
  DataTable,
  type DataTableColumn,
  type Density,
  DensityValueProvider,
  Properties,
  type PropertiesItem,
  SegmentedControl,
  Select,
  Section,
  Switch,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const DENSITIES: Density[] = ["compact", "comfortable", "spacious"];

/**
 * Renders `children(density)` three times — once per density — side by side.
 * Each column sets both the `data-density` attribute (drives CSS spacing tokens
 * and `density-*:` variants) and a `DensityValueProvider` (drives components
 * that read `useDensityValue()` in JS), so the subtree is fully density-scoped.
 */
function Triptych({ children }: { children: (density: Density) => ReactNode }) {
  return (
    <div className="grid gap-density-4 lg:grid-cols-3">
      {DENSITIES.map((density) => (
        <div key={density} data-density={density} className="min-w-0 space-y-density-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {density}
          </div>
          <DensityValueProvider density={density}>{children(density)}</DensityValueProvider>
        </div>
      ))}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-density-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

const REPO_OPTIONS: ComboboxOption[] = [
  { value: "mission-control", label: "mission-control" },
  { value: "clicky", label: "clicky" },
  { value: "facet", label: "facet" },
  { value: "docs", label: "docs" },
];

const PROPERTY_ITEMS: PropertiesItem<string>[] = [
  { key: "namespace", value: "claims-demo" },
  { key: "branch", value: "feat/faro-playbook-cache" },
  { key: "status", value: "running" },
  { key: "port", value: "8080" },
];

type Row = { check: string; status: string; duration: string };
const TABLE_ROWS: Row[] = [
  { check: "build", status: "pass", duration: "52s" },
  { check: "unit-tests", status: "pass", duration: "1m 12s" },
  { check: "e2e", status: "fail", duration: "2m 09s" },
];
const TABLE_COLUMNS: DataTableColumn<Row>[] = [
  { key: "check", label: "Check", grow: true },
  { key: "status", label: "Status", shrink: true },
  { key: "duration", label: "Duration", align: "right", shrink: true },
];

export function DensityComparisonDemo() {
  const [repo, setRepo] = useState("clicky");
  const [env, setEnv] = useState("prod");
  const [running, setRunning] = useState(true);
  const [scope, setScope] = useState("all");

  return (
    <DemoSection
      id="density-comparison"
      title="Density comparison"
      description="The same components rendered at every density — compact, comfortable, spacious — side by side. Each column scopes density via the data-density attribute (CSS spacing + density-* variants) plus a DensityValueProvider (JS reads), independent of the global density switcher."
    >
      <div className="space-y-density-6">
        <Group title="Panels (Section)">
          <Triptych>
            {(density) => (
              <Section title="Dev server" summary={`:8080 · ${density}`} icon="server" defaultOpen>
                <div className="space-y-density-2 text-sm text-muted-foreground">
                  <div>Local work dir + server controls.</div>
                  <Switch checked={running} onChange={setRunning} label="Running" />
                </div>
              </Section>
            )}
          </Triptych>
        </Group>

        <Group title="Combobox + Select">
          <Triptych>
            {() => (
              <div className="space-y-density-2">
                <Combobox
                  ariaLabel="Repository"
                  value={repo}
                  onChange={setRepo}
                  options={REPO_OPTIONS}
                  placeholder="Repository…"
                />
                <Select
                  aria-label="Environment"
                  value={env}
                  onChange={(e) => setEnv(e.target.value)}
                  options={[
                    { value: "dev", label: "Development" },
                    { value: "staging", label: "Staging" },
                    { value: "prod", label: "Production" },
                  ]}
                />
              </div>
            )}
          </Triptych>
        </Group>

        <Group title="Toggles (Switch + SegmentedControl)">
          <Triptych>
            {() => (
              <div className="space-y-density-3">
                <Switch checked={running} onChange={setRunning} label="Auto-merge" />
                <SegmentedControl
                  aria-label="Scope"
                  value={scope}
                  onChange={setScope}
                  options={[
                    { id: "me", label: "Mine" },
                    { id: "all", label: "All" },
                    { id: "bots", label: "Bots" },
                  ]}
                />
              </div>
            )}
          </Triptych>
        </Group>

        <Group title="Properties">
          {/* Properties has its own 2-step density scale (no "spacious"); the
              data-density wrapper still scales its CSS spacing for that column. */}
          <Triptych>
            {(density) => (
              <Properties
                density={density === "compact" ? "compact" : "comfortable"}
                items={PROPERTY_ITEMS}
              />
            )}
          </Triptych>
        </Group>

        <Group title="Table (DataTable)">
          <Triptych>
            {(density) => (
              <DataTable
                data={TABLE_ROWS}
                columns={TABLE_COLUMNS}
                density={density}
                getRowId={(row) => row.check}
              />
            )}
          </Triptych>
        </Group>
      </div>
    </DemoSection>
  );
}
