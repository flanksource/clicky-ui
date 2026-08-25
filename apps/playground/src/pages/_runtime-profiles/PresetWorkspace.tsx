import { useState } from "react";
import {
  ToolSchemaBrowser,
  withUserRule,
  type PermissionRule,
  type ToolMeta,
  type ToolPolicy,
  type SpecRuntimeFamily,
} from "@flanksource/clicky-ui/ai";
import type { RuntimePreset } from "./contract";
import { RUNTIME_PROFILE_SCOPES } from "./contract";
import { RuntimeLibraryList } from "./LibraryList";
import { referencedBy, uniqueName } from "./model";
import type { RuntimeProfileRecord } from "./contract";
import { PermissionStrategiesEditor } from "./PermissionStrategiesEditor";
import { PresetSettingsEditor } from "./PresetSettingsEditor";

export function PresetWorkspace({
  presets,
  profiles,
  selectedId,
  tools,
  effectivePermissions,
  families,
  onSelect,
  onCreate,
  onDuplicate,
  onDelete,
  onChange,
}: {
  presets: RuntimePreset[];
  profiles: RuntimeProfileRecord[];
  selectedId: string | undefined;
  tools: ToolMeta[];
  effectivePermissions: Record<string, ToolPolicy>;
  families: SpecRuntimeFamily[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (preset: RuntimePreset) => void;
}) {
  const [tab, setTab] = useState<"behavior" | "permissions">("behavior");
  const preset = presets.find((item) => item.id === selectedId);

  return (
    <div className="grid min-h-0 items-start gap-4 xl:grid-cols-[16rem_minmax(0,1fr)]">
      <RuntimeLibraryList
        title="Presets"
        items={presets}
        selectedId={selectedId}
        onSelect={onSelect}
        onCreate={onCreate}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        deleteReason={(id) => {
          const names = referencedBy(id, profiles);
          return names.length > 0 ? `Used by ${names.join(", ")}` : undefined;
        }}
      />
      {preset ? (
        <section className="min-w-0 rounded-lg border border-border bg-card">
          <div className="grid gap-3 border-b border-border p-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
            <label className="grid gap-1 text-xs font-medium">
              Preset name
              <input
                value={preset.name}
                aria-invalid={!uniqueName(preset.name, preset.id, presets)}
                onChange={(event) =>
                  onChange({ ...preset, name: event.target.value })
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              {!uniqueName(preset.name, preset.id, presets) && (
                <span className="text-destructive">
                  A unique preset name is required.
                </span>
              )}
            </label>
            <label className="grid gap-1 text-xs font-medium">
              Scope
              <select
                value={preset.scope}
                onChange={(event) =>
                  onChange({
                    ...preset,
                    scope: event.target.value as RuntimePreset["scope"],
                  })
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {RUNTIME_PROFILE_SCOPES.map((scope) => (
                  <option key={scope} value={scope}>
                    {scope}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium lg:col-span-2">
              Description
              <input
                value={preset.description ?? ""}
                onChange={(event) =>
                  onChange({ ...preset, description: event.target.value })
                }
                className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>
          <div className="flex gap-1 border-b border-border p-2">
            {(["behavior", "permissions"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={tab === item}
                onClick={() => setTab(item)}
                className={
                  tab === item
                    ? "rounded-md bg-accent px-3 py-1.5 text-sm font-medium capitalize"
                    : "rounded-md px-3 py-1.5 text-sm capitalize text-muted-foreground hover:bg-accent/50"
                }
              >
                {item}
              </button>
            ))}
          </div>
          {tab === "behavior" ? (
            <div className="p-4">
              <div className="mb-4 rounded-md border border-sky-500/30 bg-sky-500/5 p-3 text-xs text-muted-foreground">
                Presets contain reusable global behavior, sandbox, permissions,
                environment references, and checkout behavior. Runtime catalog
                availability belongs to Captain&apos;s Whoami configuration;
                prompt, verification, and checkout location belong to a profile
                run spec.
              </div>
              <PresetSettingsEditor
                value={{ spec: preset.spec }}
                families={families}
                onChange={(next) => onChange({ ...preset, ...next })}
              />
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <PermissionStrategiesEditor
                value={preset.spec.toolPolicy ?? []}
                tools={tools}
                onChange={(toolPolicy) =>
                  onChange({ ...preset, spec: { ...preset.spec, toolPolicy } })
                }
              />
              {tools.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Tool catalog</h3>
                  <ToolSchemaBrowser
                    tools={tools}
                    value={effectivePermissions}
                    onRule={(rule: PermissionRule) =>
                      onChange({
                        ...preset,
                        spec: {
                          ...preset.spec,
                          toolPolicy: withUserRule(
                            preset.spec.toolPolicy ?? [],
                            rule,
                          ),
                        },
                      })
                    }
                    className="h-[36rem]"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Waiting for the Gavel Clicky operation catalog.
                </p>
              )}
            </div>
          )}
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
          Create a preset to begin.
        </p>
      )}
    </div>
  );
}
