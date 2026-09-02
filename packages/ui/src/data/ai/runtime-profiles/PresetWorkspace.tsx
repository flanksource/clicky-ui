import { useId, useState } from "react";
import { Field } from "../../../components/Field";
import { InputField } from "../../../components/InputField";
import { Select } from "../../../components/select";
import { Tabs } from "../../../layout/Tabs";
import type { PermissionRule } from "../../chat/tool-policy";
import type { ToolMeta, ToolPolicy } from "../../chat/types";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import {
  RUNTIME_PROFILE_SCOPES,
  type RuntimePreset,
  type RuntimeProfile,
  type RuntimeProfileScope,
} from "../runtime-profile";
import type {
  SpecRuntimeSandboxCatalog,
  SpecRuntimeSecretSelectorConfig,
} from "../SpecRuntimeEditor/types";
import { withUserRule } from "../ToolPreferences.model";
import { ToolSchemaBrowser } from "../ToolSchemaBrowser";
import { referencedBy, uniqueName } from "./model";
import { PermissionStrategiesEditor } from "./PermissionStrategiesEditor";
import { PresetSpecEditor } from "./PresetSpecEditor";
import { RuntimeLibraryList } from "./RuntimeLibraryList";
import type { RuntimeRecordMeta } from "./types";

type PresetTab = "behavior" | "permissions";

const PRESET_TABS: Array<{ id: PresetTab; label: string }> = [
  { id: "behavior", label: "Behavior" },
  { id: "permissions", label: "Permissions" },
];

export function PresetWorkspace({
  presets,
  profiles,
  selectedId,
  tools,
  effectivePermissions,
  families,
  sandboxCatalog,
  secretSelector,
  recordMeta,
  onSelect,
  onCreate,
  onDuplicate,
  onDelete,
  onChange,
}: {
  presets: RuntimePreset[];
  profiles: RuntimeProfile[];
  selectedId: string | undefined;
  tools: ToolMeta[];
  effectivePermissions: Record<string, ToolPolicy>;
  families: SpecRuntimeFamily[];
  sandboxCatalog?: SpecRuntimeSandboxCatalog | undefined;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
  recordMeta?: ((id: string) => RuntimeRecordMeta) | undefined;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onChange: (preset: RuntimePreset) => void;
}) {
  const [tab, setTab] = useState<PresetTab>("behavior");
  const preset = presets.find((item) => item.id === selectedId);

  return (
    <div className="grid min-h-0 items-start gap-4 xl:grid-cols-[16rem_minmax(0,1fr)]">
      <RuntimeLibraryList
        title="Presets"
        items={presets.map((item) => ({
          ...item,
          ...(recordMeta ? { meta: recordMeta(item.id) } : {}),
        }))}
        selectedId={selectedId}
        onSelect={onSelect}
        onCreate={onCreate}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        deleteReason={(id) => {
          const target = presets.find((item) => item.id === id);
          const names = target ? referencedBy(target, profiles) : [];
          return names.length > 0 ? `Used by ${names.join(", ")}` : undefined;
        }}
      />
      {preset ? (
        <section className="min-w-0 rounded-lg border border-border bg-card">
          <PresetHeader preset={preset} presets={presets} onChange={onChange} />
          <Tabs
            tabs={PRESET_TABS}
            value={tab}
            onChange={(next) => setTab(next as PresetTab)}
            className="px-2"
          />
          {tab === "behavior" ? (
            <div className="p-4">
              <div className="mb-4 rounded-md border border-sky-500/30 bg-sky-500/5 p-3 text-xs text-muted-foreground">
                Presets contain reusable global behavior, sandbox, permissions,
                environment references, and checkout behavior. Runtime catalog
                availability belongs to Captain&apos;s Whoami configuration;
                prompt, verification, and checkout location belong to a profile
                run spec.
              </div>
              <PresetSpecEditor
                value={preset.spec}
                families={families}
                sandboxCatalog={sandboxCatalog}
                secretSelector={secretSelector}
                onChange={(spec) => onChange({ ...preset, spec })}
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

function PresetHeader({
  preset,
  presets,
  onChange,
}: {
  preset: RuntimePreset;
  presets: RuntimePreset[];
  onChange: (preset: RuntimePreset) => void;
}) {
  const nameId = useId();
  const scopeId = useId();
  const descriptionId = useId();
  const nameTaken = !uniqueName(preset.name, preset.id, presets);
  return (
    <div className="grid gap-3 border-b border-border p-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
      <Field
        label="Preset name"
        htmlFor={nameId}
        labelClassName="text-xs"
        error={nameTaken ? "A unique preset name is required." : undefined}
      >
        <InputField
          id={nameId}
          value={preset.name}
          invalid={nameTaken}
          onChange={(name) => onChange({ ...preset, name })}
        />
      </Field>
      <Field label="Scope" htmlFor={scopeId} labelClassName="text-xs">
        <Select
          id={scopeId}
          value={preset.scope}
          onChange={(event) =>
            onChange({
              ...preset,
              scope: event.target.value as RuntimeProfileScope,
            })
          }
          options={RUNTIME_PROFILE_SCOPES.map((scope) => ({
            value: scope,
            label: scope,
          }))}
        />
      </Field>
      <Field
        label="Description"
        htmlFor={descriptionId}
        labelClassName="text-xs"
        className="lg:col-span-2"
      >
        <InputField
          id={descriptionId}
          value={preset.description ?? ""}
          onChange={(description) => onChange({ ...preset, description })}
        />
      </Field>
    </div>
  );
}
