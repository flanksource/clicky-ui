import { useEffect, useMemo, useState } from "react";
import { SegmentedControl, type SegmentedOption } from "../../../components";
import { Icon, type StaticIconComponent } from "../../Icon";
import { UiAdd, UiEdit, UiListDashes, UiLock, UiShield } from "../../../icons";
import {
  SPEC_PERMISSION_MODES,
  type AISpecRuntimeValue,
  type SpecPermissionMode,
} from "../SpecRuntimeEditor.model";
import {
  SPEC_RUNTIME_FAMILIES,
  type RuntimeSpecSchema,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import { runtimeSchemaPropertyAtPath } from "../../runtime/runtime-field-support";
import { PermissionModeField } from "./PermissionModeField";
import { SpecInput } from "./fields";
import {
  type PermissionDomain,
  type PermissionListEntry,
  type PermissionListMode,
} from "./permissions-model";
import { PermissionPolicyList } from "./PermissionPolicyList";
import {
  SPEC_RUNTIME_PRESETS,
  activeSpecPreset,
  applyPermissionPresetSnapshot,
  applySpecPreset,
  buildPermissionPresetSnapshot,
  savedPresetMatches,
  type SavedPermissionPreset,
  type SpecRuntimePresetId,
} from "./presets";
import {
  permissionPresetSlug,
  readSavedPermissionPresets,
  writeSavedPermissionPresets,
} from "./permission-preset-storage";
import {
  SUPPORT_ALL_RUNTIME_FIELDS,
  type RuntimeFieldSupport,
} from "../../runtime/runtime-field-support";

const CUSTOM_PRESET_ID = "__custom";

const PRESET_ICONS: Record<SpecRuntimePresetId, StaticIconComponent> = {
  edit: UiEdit,
  plan: UiListDashes,
  readonly: UiLock,
};

export function PermissionsSection({
  value,
  onChange,
  entries,
  families = SPEC_RUNTIME_FAMILIES,
  schema,
  effectiveMode,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  entries: PermissionListEntry[];
  families?: SpecRuntimeFamily[] | undefined;
  /** Runtime schema used to narrow the published `permissions.mode` enum. */
  schema?: RuntimeSpecSchema | undefined;
  effectiveMode?: string | undefined;
}) {
  return (
    <div className="grid gap-density-3">
      <PermissionModeField
        value={value}
        onChange={onChange}
        families={families}
        availableModes={permissionModeModes(schema)}
        effectiveMode={effectiveMode}
      />
      <PermissionPresetSelector
        value={value}
        entries={entries}
        onChange={onChange}
      />
    </div>
  );
}

// Mirrors the schema-driven validation `sandbox.approval` used to publish:
// an unsupported value is a schema authoring bug, not a user input to shrug
// off. With no runtime resolved yet there is no schema to consult, so every
// mode is offered; once a runtime is known, a schema that simply doesn't
// publish `permissions.mode` means that runtime has no postures to offer.
function permissionModeModes(
  schema: RuntimeSpecSchema | undefined,
): SpecPermissionMode[] {
  if (!schema) return [...SPEC_PERMISSION_MODES];
  const values = runtimeSchemaPropertyAtPath(schema, "permissions.mode")?.enum;
  if (values == null) return [];
  if (!Array.isArray(values)) {
    throw new Error("permissions.mode must publish an enum");
  }
  return values.map((value) => {
    if (
      typeof value !== "string" ||
      !SPEC_PERMISSION_MODES.includes(value as SpecPermissionMode)
    ) {
      throw new Error(
        `permissions.mode published unsupported value ${JSON.stringify(value)}`,
      );
    }
    return value as SpecPermissionMode;
  });
}

export function PermissionsAdvanced({
  entries,
  onApplyEntries,
  onAddEntry,
  includeSkills = false,
  supports = SUPPORT_ALL_RUNTIME_FIELDS,
}: {
  entries: PermissionListEntry[];
  onApplyEntries: (
    entries: PermissionListEntry[],
    mode: PermissionListMode,
  ) => void;
  onAddEntry: (domain: PermissionDomain, id: string) => void;
  includeSkills?: boolean | undefined;
  supports?: RuntimeFieldSupport | undefined;
}) {
  const domains: PermissionDomain[] = ["tools", "mcp", "plugins"];
  if (includeSkills) domains.push("skills");
  const supportedDomains = domains.filter((domain) =>
    supports(`permissions.${domain}`),
  );
  return supportedDomains.length > 0 ? (
    <PermissionPolicyList
      entries={entries}
      supportedDomains={supportedDomains}
      emptyLabel={
        includeSkills
          ? "No tools, MCP servers, plugins, or skills configured"
          : "No tools, MCP servers, or plugins configured"
      }
      onApply={onApplyEntries}
      onAdd={onAddEntry}
    />
  ) : null;
}

function PermissionPresetSelector({
  value,
  entries,
  onChange,
}: {
  value: AISpecRuntimeValue;
  entries: PermissionListEntry[];
  onChange: (value: AISpecRuntimeValue) => void;
}) {
  const [savedPresets, setSavedPresets] = useState<SavedPermissionPreset[]>([]);
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    setSavedPresets(readSavedPermissionPresets());
  }, []);

  const activeBuiltIn = activeSpecPreset(value, entries);
  const activeSaved = savedPresets.find((preset) =>
    savedPresetMatches(value, entries, preset),
  );
  const activeId = activeBuiltIn ?? activeSaved?.id ?? CUSTOM_PRESET_ID;

  const options = useMemo(() => {
    const builtIns: SegmentedOption<string>[] = SPEC_RUNTIME_PRESETS.map(
      (preset) => ({
        id: preset.id,
        label: preset.label,
        description: preset.description,
        icon: PRESET_ICONS[preset.id],
      }),
    );
    const saved: SegmentedOption<string>[] = savedPresets.map((preset) => ({
      id: preset.id,
      label: preset.label,
      description: "Saved",
      icon: UiShield,
    }));
    const custom: SegmentedOption<string>[] =
      activeId === CUSTOM_PRESET_ID
        ? [
            {
              id: CUSTOM_PRESET_ID,
              label: "Custom",
              description: "Manual tree",
              icon: UiShield,
            },
          ]
        : [];
    return [...builtIns, ...saved, ...custom];
  }, [activeId, savedPresets]);

  const applyPreset = (id: string) => {
    if (id === CUSTOM_PRESET_ID) return;
    if (isBuiltInPresetId(id)) {
      onChange(applySpecPreset(value, id, entries));
      return;
    }
    const saved = savedPresets.find((preset) => preset.id === id);
    if (saved) onChange(applyPermissionPresetSnapshot(value, saved.snapshot));
  };

  const savePreset = () => {
    const label = presetName.trim();
    if (!label) return;
    const snapshot = buildPermissionPresetSnapshot(value, entries);
    const now = new Date().toISOString();
    const next: SavedPermissionPreset[] = [
      ...savedPresets.filter((preset) => preset.label !== label),
      {
        id: `local:${permissionPresetSlug(label)}:${Date.now().toString(36)}`,
        label,
        snapshot,
        updatedAt: now,
      },
    ];
    writeSavedPermissionPresets(next);
    setSavedPresets(next);
    setPresetName("");
  };

  const updateActiveSaved = () => {
    if (!activeSaved) return;
    const next = savedPresets.map((preset) =>
      preset.id === activeSaved.id
        ? {
            ...preset,
            snapshot: buildPermissionPresetSnapshot(value, entries),
            updatedAt: new Date().toISOString(),
          }
        : preset,
    );
    writeSavedPermissionPresets(next);
    setSavedPresets(next);
  };

  const deleteActiveSaved = () => {
    if (!activeSaved) return;
    const next = savedPresets.filter((preset) => preset.id !== activeSaved.id);
    writeSavedPermissionPresets(next);
    setSavedPresets(next);
  };

  return (
    <div className="grid gap-density-3">
      <SegmentedControl
        aria-label="Permission preset"
        value={activeId}
        options={options}
        onChange={applyPreset}
        size="lg"
        wrap
        className="w-full"
      />
      <div className="grid gap-density-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <SpecInput
          value={presetName}
          onChange={setPresetName}
          placeholder="Preset name"
          ariaLabel="Permission preset name"
          icon={UiShield}
        />
        <button
          type="button"
          onClick={savePreset}
          disabled={!presetName.trim()}
          className="inline-flex h-control-h items-center justify-center gap-1 rounded-md border border-border bg-background px-density-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon icon={UiAdd} className="size-3.5" />
          Save preset
        </button>
        {activeSaved && (
          <span className="inline-flex gap-density-2">
            <button
              type="button"
              onClick={updateActiveSaved}
              className="inline-flex h-control-h items-center justify-center rounded-md border border-border bg-background px-density-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Update
            </button>
            <button
              type="button"
              onClick={deleteActiveSaved}
              className="inline-flex h-control-h items-center justify-center rounded-md border border-border bg-background px-density-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Delete
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

function isBuiltInPresetId(id: string): id is SpecRuntimePresetId {
  return id === "edit" || id === "plan" || id === "readonly";
}
